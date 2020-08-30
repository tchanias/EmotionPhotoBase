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
  firebaseAuth,
  LogOut,
  isUserSignedIn,
  app,
} from '../constants/firebaseConfig';
import firestore from '@react-native-firebase/firestore';
import Spinner from 'react-native-loading-spinner-overlay';
import {sharedStyles} from '../sharedStyles';

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
      has_photo: false,
      photo: null,
      face_data: null,
      modalVisible: false,
      faces: [],
      loading:false,
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
    this.setModalVisible(false);
    this.detectorListener.remove();
  }

  static navigationOptions = ({navigation}) => {
    let userMail = firebaseAuth.currentUser
      ? firebaseAuth.currentUser.email
      : '';
    let userName = userMail
      ? userMail.substr(0, userMail.indexOf('@'))
      : '';
    return {
      headerLeft: null,
      // headerTitle: 'Detect Face Emotions',
      headerTitle: userName,
      headerRight: (
        <TouchableOpacity
          styles
          onPress={() => {
            let user = firebaseAuth.currentUser;
            if (user) {
              navigation.state.params.LogOut();
            } else {
              navigation.state.params.LogIn();
            }
          }}>
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

  saveToFirebase = () => {
    if (this.state.face_data) {
      let photo = this.state.photo;
      let filename = photo.uri ? photo.uri.substring(photo.uri.lastIndexOf("/") + 1, photo.uri.lastIndexOf(".")) : '';
      photo = {...photo, filename};
      let userId = firebaseAuth.currentUser.uid;
      let faces = [];
      let views = _.map(this.state.face_data, (x, key) => {
        let faceObject = {
          emotions: x.faceAttributes.emotion,
          gender: x.faceAttributes.gender,
          smile: x.faceAttributes.smile,
          age: x.faceAttributes.age,
          glasses: x.faceAttributes.glasses,
          bald: x.faceAttributes.hair.bald,
          hairColor: x.faceAttributes.hair
            ? x.faceAttributes.hair[0]
              ? x.faceAttributes.hair[0].hairColor
                ? x.faceAttributes.hair[0].hairColor
                : 'No hair'
              : 'No hair'
            : 'No hair',
          hairColorConfidence: x.faceAttributes.hair
            ? x.faceAttributes.hair[0]
              ? x.faceAttributes.hair[0].confidence
                ? x.faceAttributes.hair[0].confidence
                : ''
              : ''
            : '',
          accessories: x.faceAttributes.accessories
            ? x.faceAttributes.accessories.length
              ? x.faceAttributes.accessories.length >= 1
                ? x.faceAttributes.accessories
                : 'No Accessories'
              : 'No Accessories'
            : 'No Accessories',
          moustache: x.faceAttributes.facialHair.moustache,
          beard: x.faceAttributes.facialHair.beard,
          sideburns: x.faceAttributes.facialHair.sideburns,
        };

        // let faceObject ={emotions:emotions,gender:gender,smile:smile,age:age,glasses:glasses,bald:bald,hairColor:hairColor,hairColorConfidence:hairColorConfidence
        // ,accessories:accessories,moustache:moustache,beard:beard,sideburns:sideburns,faceObject:faceObject}
        faces.push(faceObject);
      });
      // this.setState({faces: faces}, () => {

      // });
      this.setModalVisible(true);
      firestore().collection('library').doc(userId).collection('photos').doc(photo.filename).set({
        photo: photo,
        faces: faces,
      });
    } else {
      Alert.alert('Cannot detect faces', 'Please try again.');
    }
  };

  addToLibrary = () => {
    if (this.state.face_data) {
      let photo = this.state.photo;
      let userId = firebaseAuth.currentUser.uid;
      let faces = [];
      let views = _.map(this.state.face_data, (x, key) => {
        let faceObject = {
          emotions: x.faceAttributes.emotion,
          gender: x.faceAttributes.gender,
          smile: x.faceAttributes.smile,
          age: x.faceAttributes.age,
          glasses: x.faceAttributes.glasses,
          bald: x.faceAttributes.hair.bald,
          hairColor: x.faceAttributes.hair
            ? x.faceAttributes.hair[0]
              ? x.faceAttributes.hair[0].hairColor
                ? x.faceAttributes.hair[0].hairColor
                : 'No hair'
              : 'No hair'
            : 'No hair',
          hairColorConfidence: x.faceAttributes.hair
            ? x.faceAttributes.hair[0]
              ? x.faceAttributes.hair[0].confidence
                ? x.faceAttributes.hair[0].confidence
                : ''
              : ''
            : '',
          accessories: x.faceAttributes.accessories
            ? x.faceAttributes.accessories.length
              ? x.faceAttributes.accessories.length >= 1
                ? x.faceAttributes.accessories
                : 'No Accessories'
              : 'No Accessories'
            : 'No Accessories',
          moustache: x.faceAttributes.facialHair.moustache,
          beard: x.faceAttributes.facialHair.beard,
          sideburns: x.faceAttributes.facialHair.sideburns,
        };

        // let faceObject ={emotions:emotions,gender:gender,smile:smile,age:age,glasses:glasses,bald:bald,hairColor:hairColor,hairColorConfidence:hairColorConfidence
        // ,accessories:accessories,moustache:moustache,beard:beard,sideburns:sideburns,faceObject:faceObject}
        faces.push(faceObject);
      });
      this.setModalVisible(true);
      // console.log('faces', faces);
      // firestore.doc(`/library/${userId}/${photo}`).push({
      //   userId: userId,
      //   photo: photo,
      //   faces: faces,
      // });
    } else {
      Alert.alert('Cannot detect faces', 'Please try again.');
    }
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
      let views = _.map(this.state.face_data, (x, key) => {
        let emotions = x.faceAttributes.emotion;
        let gender = x.faceAttributes.gender;
        let smile = x.faceAttributes.smile;
        let age = x.faceAttributes.age;
        let glasses = x.faceAttributes.glasses;
        let bald = x.faceAttributes.hair.bald;
        let hairColor = x.faceAttributes.hair
          ? x.faceAttributes.hair[0]
            ? x.faceAttributes.hair[0].hairColor
              ? x.faceAttributes.hair[0].hairColor
              : 'No hair'
            : 'No hair'
          : 'No hair';
        let hairColorConfidence = x.faceAttributes.hair
          ? x.faceAttributes.hair[0]
            ? x.faceAttributes.hair[0].confidence
              ? x.faceAttributes.hair[0].confidence
              : ''
            : ''
          : '';
        let accessories = x.faceAttributes.accessories
          ? x.faceAttributes.accessories.length
            ? x.faceAttributes.accessories.length >= 1
              ? x.faceAttributes.accessories
              : 'No Accessories'
            : 'No Accessories'
          : 'No Accessories';
        let moustache = x.faceAttributes.facialHair.moustache;
        let beard = x.faceAttributes.facialHair.beard;
        let sideburns = x.faceAttributes.facialHair.sideburns;
        return (
          <View style={{backgroundColor: sharedStyles.backgroundColor, marginBottom: 10}} key={key}>
            <View>
              <Text style={sharedStyles.titleText}>Face #{key}</Text>
            </View>

            <View>
              <Text style={sharedStyles.subTitleText}>Emotions</Text>
              <Text>Anger:{emotions['anger']}</Text>
              <Text>Contempt:{emotions['contempt']}</Text>
              <Text>Disgust:{emotions['disgust']}</Text>
              <Text>Fear:{emotions['fear']}</Text>
              <Text>Happiness:{emotions['happiness']}</Text>
              <Text>Neutral:{emotions['neutral']}</Text>
              <Text>Sadness:{emotions['sadness']}</Text>
              <Text>Surprise:{emotions['surprise']}</Text>
            </View>
            <View>
              <Text style={sharedStyles.subTitleText}>Misc</Text>
              <Text>Gender:{gender}</Text>
              <Text>Age:{age}</Text>
              <Text>Smile:{smile}</Text>
              <Text>Glasses:{glasses}</Text>
              <Text>
                Hair Color:{hairColor} - {hairColorConfidence}
              </Text>
              <Text>Bald:{bald}</Text>
              <Text>
                Accessories:
                {accessories !== 'No Accessories'
                  ? _.map(accessories, (acc, index) => {
                      return accessories[acc];
                    })
                  : accessories}
              </Text>
            </View>
            <View>
              <Text style={sharedStyles.subTitleText}>Facial Hair</Text>
              <Text>Moustache:{moustache}</Text>
              <Text>Beard:{beard}</Text>
              <Text>Sideburns:{sideburns}</Text>
            </View>
          </View>
        );
      });
      return <View>{views}</View>;
    } else {
      return (
        <View style={{backgroundColor: sharedStyles.backgroundColor, marginBottom: 10}}>
          <Text style={sharedStyles.subTitleText}>
            No valid image has been selected yet!
          </Text>
        </View>
      );
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
      <View style={sharedStyles.detectorContainer}>
         <Spinner
            visible={this.state.loading}
            textContent={'Loading image data...'}
            textStyle={{color:sharedStyles.textColor}}
          />
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
          style={sharedStyles.detectorPhotoStyle}
          source={this.state.photo}
          resizeMode={'contain'}>
          {this._renderFaceBoxes.call(this)}
        </ImageBackground>
        <View 
        style={sharedStyles.buttonWrapper}
        >
         {!this.state.loading? 
         <TouchableOpacity
            // text={this.state.face_data?'Change Photo':"Pick Photo"}
            onPress={this._pickImage.bind(this)}
            style={sharedStyles.buttonWrapper}
            // button_text_styles={sharedStyles.button_text}
          >
            <Text
            style={sharedStyles.button_text}
            >
            {this.state.face_data?'Change Photo':"Pick Photo"}
            </Text>
            </TouchableOpacity>:null}
        {this.state.face_data ?
          <TouchableOpacity
            // text="View Data"
            // onpress={() => this.setModalVisible(true)}
            onPress={() => this.addToLibrary()}
            style={sharedStyles.button}
            
          >
            <Text
            style={sharedStyles.button_text}
            >
            View Data
            </Text>
          </TouchableOpacity>
          : null}

        </View>
        {this.state.face_data ?
          <View 
          // style={sharedStyles.buttonWrapper}
          >
            <Button
                text="Save to database"
                // onpress={() => this.setModalVisible(true)}
                onpress={() => this.saveToFirebase()}
                button_styles={sharedStyles.buttonWrapper}
                button_text_styles={sharedStyles.button_text}
              />
          </View>: null}
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
    this.setState({loading:true},()=>{
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
        return res.json();
      })
      .then(json => {
        if (json.length) {
          this.setState({
            face_data: json,
            loading:false
          });
        } else {
 
            this.setState({
              loading:false
            },()=>{
              alert("Sorry, I can't see any faces in there.");
          })
        }

        return json;
      })
      .catch(function(error) {
        this.setState({loading:false},()=>{
          console.log(error);
          alert(
            'Sorry, the request failed. Please try again.' +
              JSON.stringify(error),
          );
        });
       
      });
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
  headerStyles:{
    borderRadius:30,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ccc',
    height:'100%',
    width:'100%',
  },
  ButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

});

export default Detector;
