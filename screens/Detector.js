import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
} from 'react-native';
import {apiUrl, headers, subKey} from '../constants/constants';
import ImagePicker from 'react-native-image-picker';
import Button from '../Components/UI/Button';
import RNFetchBlob from 'react-native-fetch-blob';
import _ from 'lodash';



const image_picker_options = {
  title: 'Select Photo', 
  takePhotoButtonTitle: 'Take Photo...', 
  chooseFromLibraryButtonTitle: 'Choose from Library...',
  cameraType: 'back', 
  mediaType: 'photo',
  maxWidth: 480,
  maxHeight:480,
  quality: 1, 
  noData: false, 
  path: 'images'
};


export class Detector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photo_style: {
        position: 'relative',
        width: 480,
        height: 480,
      },
      has_photo: false,
      photo: null,
      face_data: null,
    };
  }

  findDominantEmotion=(emotions)=>{
    let dominantValue=-1;
    let dominantKey='Dominant Emotion not found!';
    Object.keys(emotions).map((emotion)=>{
      if(emotions[emotion]>dominantValue){
        dominantValue=emotions[emotion];
        dominantKey=emotion;
      }
    })
    return [dominantKey, dominantValue];
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          style={this.state.photo_style}
          source={this.state.photo}
          resizeMode={'contain'}>
          {this._renderFaceBoxes.call(this)}
        </ImageBackground>
      <View style={styles.ButtonContainer}>
        <Button
          text="Pick Photo"
          onpress={this._pickImage.bind(this)}
          button_styles={styles.button}
          button_text_styles={styles.button_text}
        />

        {/* {this._renderDetectFacesButton.call(this)} */}
        </View>
      </View>
    );
  }

  _pickImage() {
    this.setState({
      face_data: null,
    });

    ImagePicker.showImagePicker(
      image_picker_options,
      response => {
        if (response.error) {
          alert('Error getting the image. Please try again.');
        } else {
          let source = {uri: response.uri};

          this.setState({
            photo_style: {
              position: 'relative',
              width: response.width,
              height: response.height,
            },
            has_photo: true,
            photo: source,
            photo_data: response.data,
          },()=>{
            this._detectFaces();
          });

        }
      },
    );
  }

  _renderDetectFacesButton() {
    if (this.state.has_photo) {
      return (
        <Button
          text="Detect Faces"
          onpress={this._detectFaces.bind(this)}
          button_styles={styles.button}
          button_text_styles={styles.button_text}
        />
      );
    }
  }

  _detectFaces() {
    console.log(this.state.photo_data,'detect faces: data')
    RNFetchBlob.fetch(
      'POST',
      apiUrl,
      {
        Accept: 'application/json',
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': subKey,
      },
      this.state.photo_data,
    )
      .then(res => {
        console.log(res,'res');
        return res.json();
      })
      .then(json => {
        console.log(json,'json');
        if (json.length) {
          this.setState({
            face_data: json,
          });
        } else {
          alert("Sorry, I can't see any faces in there.");
        }

        return json;
      })
      .catch(function(error) {
        console.log(error);
        alert(
          'Sorry, the request failed. Please try again.' +
            JSON.stringify(error),
        );
      });
  }

  _renderFaceBoxes() {
    if (this.state.face_data) {
      let views = _.map(this.state.face_data, x => {
        let box = {
          position: 'absolute',
          top: x.faceRectangle.top,
          left: x.faceRectangle.left,
        };

        const [emotion, emotionPercentage] = this.findDominantEmotion(x.faceAttributes.emotion);

        let style = {
          width: x.faceRectangle.width,
          height: x.faceRectangle.height,
          borderWidth: 2,
          borderColor: '#fff',
        };

        let attr = {
          color: '#fff',
        };

        return (
          <View key={x.faceId} style={box}>
            <View style={style}></View>
            <Text style={attr}>
              {x.faceAttributes.gender}, {x.faceAttributes.age} y/o
            </Text>
            <Text style={attr}>
              {emotion}: {emotionPercentage}
            </Text>
          </View>
        );
      });

      return <View>{views}</View>;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ccc',
  },
  ButtonContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around',
    alignItems:'center',
  },
  button: {
    margin: 10,
    padding: 5,
    backgroundColor: '#529ecc',
  },
  button_text: {
    color: '#FFF',
    fontSize: 20,
  },
});

export default Detector;
