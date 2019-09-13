import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Button as RNButton,
  Modal,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import {
  apiUrl,
  headers,
  subKey,
  clearAsyncStorage,
} from '../constants/constants';
import ImagePicker from 'react-native-image-picker';
import Button from '../Components/UI/Button';
import RNFetchBlob from 'rn-fetch-blob';
import _ from 'lodash';
import {
  firebase,
  firebaseAuth,
  LogOut,
  isUserSignedIn,
  app,
} from '../constants/firebaseConfig';

const image_picker_options = {
  title: 'Select Photo',
  takePhotoButtonTitle: 'Take Photo...',
  chooseFromLibraryButtonTitle: 'Choose from Library...',
  cameraType: 'back',
  mediaType: 'photo',
  maxWidth: 480,
  maxHeight: 480,
  quality: 1,
  noData: false,
  path: 'images',
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
      modalVisible: false,
    };
  }

  componentDidMount() {
    this.detectorListener = this.props.navigation.addListener('didFocus', () =>
      this.redirectionLoadParams(),
    );
    setTimeout(() => {
      this.props.navigation.setParams({
        LogIn: this.signIn,
        LogOut: this.signOut,
      });
    }, 3000);
  }

  componentWillUnmount() {
    this.detectorListener.remove();
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerLeft: null,
      // headerTitle: 'Detect Face Emotions',
      headerTitle: firebaseAuth.currentUser
        ? firebaseAuth.currentUser.email
        : '',
      headerRight: (
        <TouchableOpacity
          onPress={() => {
            let user = firebaseAuth.currentUser;
            if (user) {
              navigation.state.params.LogOut();
            } else {
              navigation.state.params.LogIn();
            }
          }}>
          {/* <Text>
            {firebaseAuth.currentUser ? firebaseAuth.currentUser.email : ''}
          </Text> */}
          <Text>{firebaseAuth.currentUser ? 'Log Out' : 'Log In'}</Text>
        </TouchableOpacity>
      ),
    };
  };

  redirectionLoadParams = () => {
    this.props.navigation.setParams({
      LogIn: this.signIn,
      LogOut: this.signOut,
    });
  };
  signIn = () => {
    this.props.navigation.navigate('AuthLoading');
  };

  signOut = async () => {
    await firebaseAuth
      .signOut()
      .then(() => {
        Alert.alert('', 'inside then');
        this.props.navigation.navigate('AuthLoading');
      })
      .catch(function(error) {
        Alert.alert('Error during log out!', error.message);
      });
  };

  setModalVisible = visible => {
    this.setState({modalVisible: visible});
  };

  findDominantEmotion = emotions => {
    let dominantValue = -1;
    let dominantKey = 'Dominant Emotion not found!';
    Object.keys(emotions).map(emotion => {
      if (emotions[emotion] > dominantValue) {
        dominantValue = emotions[emotion];
        dominantKey = emotion;
      }
    });
    return [dominantKey, dominantValue];
  };

  mapJsonData = () => {
    if (this.state.face_data) {
      let views = _.map(this.state.face_data, x => {
        let emotions = x.faceAttributes.emotion;

        return (
          <View style={{backgroundColor: 'white'}}>
            <Text>Anger:{emotions['anger']}</Text>
            <Text>Contempt:{emotions['contempt']}</Text>
            <Text>Disgust:{emotions['disgust']}</Text>
            <Text>Fear:{emotions['fear']}</Text>
            <Text>Happiness:{emotions['happiness']}</Text>
            <Text>Neutral:{emotions['neutral']}</Text>
            <Text>Sadness:{emotions['sadness']}</Text>
            <Text>Surprise:{emotions['surprise']}</Text>
          </View>
        );
      });
      return <View>{views}</View>;
    }
  };

  render() {
    // let modalObject = this.state.face_data
    //   ? this.state.face_data.faceAttributes
    //     ? this.state.face_data.faceAttributes.emotion
    //       ? this.state.face_data.faceAttributes.emotion
    //       : {}
    //     : {}
    //   : {};
    // let modalObject = this.state.face_data ? this.state.face_data : {};
    return (
      <View style={styles.container}>
        <Modal
          animationType="slide"
          presentationStyle={'pageSheet'}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={{marginTop: 22}}>
            <View>
              {this.mapJsonData()}

              <RNButton
                title="Hide Modal"
                onPress={() => {
                  this.setModalVisible(false);
                }}
              />
            </View>
          </View>
        </Modal>

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
          <Button
            text="View Data"
            onpress={() => this.setModalVisible(true)}
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

    ImagePicker.showImagePicker(image_picker_options, response => {
      if (response.error) {
        alert('Error getting the image. Please try again.');
      } else {
        let source = {uri: response.uri};

        this.setState(
          {
            photo_style: {
              position: 'relative',
              width: response.width,
              height: response.height,
            },
            has_photo: true,
            photo: source,
            photo_data: response.data,
          },
          () => {
            this._detectFaces();
          },
        );
      }
    });
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
    console.log(this.state.photo_data, 'detect faces: data');
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
        console.log(res, 'res');
        return res.json();
      })
      .then(json => {
        console.log(json, 'json');
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

        const [emotion, emotionPercentage] = this.findDominantEmotion(
          x.faceAttributes.emotion,
        );

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
  ButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
