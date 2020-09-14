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
  ScrollView,
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
import {Overlay, Divider} from 'react-native-elements';
import GallerySwiper from 'react-native-gallery-swiper';

const image_picker_options = {
  title: 'Select Photo',
  takePhotoButtonTitle: 'Take Photo...',
  chooseFromLibraryButtonTitle: 'Choose from Library...',
  cameraType: 'back',
  mediaType: 'photo',
  maxWidth: 480,
  maxHeight: 480,
  quality: 1,
  path: 'EmotionPhotoBase',
  noData: true,
  storageOptions: {
    skipBackup: true,
    privateDirectory: true,
    cameraRoll: false,
    path: 'EmotionPhotoBaseBackup',
  },
};

export default class Library extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      has_photo: false,
      photo: null,
      face_data: null,
      modalVisible: false,
      faces: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.libraryListener = this.props.navigation.addListener('didFocus', () =>
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
    this.libraryListener.remove();
  }

  static navigationOptions = ({navigation}) => {
    let userMail = firebaseAuth.currentUser
      ? firebaseAuth.currentUser.email
      : '';
    let userName = userMail ? userMail.substr(0, userMail.indexOf('@')) : '';
    return {
      headerLeft: (
        <TouchableOpacity
          style={styles.headerStyles}
          onPress={() => {
            navigation.navigate('Library');
          }}>
          <Text>{'Library'}</Text>
        </TouchableOpacity>
      ),
      // headerTitle: 'Detect Face Emotions',
      headerTitle: userName,
      headerRight: (
        <TouchableOpacity
          style={styles.headerStyles}
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

  _pickImage() {
    this.setState({
      face_data: null,
    });

    ImagePicker.launchImageLibrary(image_picker_options, response => {
      if (response.error) {
        alert('Error getting the image. Please try again.');
      } else {
        console.log('imagepicker response: ', response);
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
            this.getFaceData();
          },
        );
      }
    });
  }

  getFaceData = () => {
    console.log('get face data');
  };

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
            <View style={style} />
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

  returnValidImages = () => {};

  render() {
    return (
      <View>
        <Spinner
          visible={this.state.loading}
          textContent={'Loading image data...'}
          textStyle={{color: sharedStyles.textColor}}
        />
        {/* <ImageBackground
          style={sharedStyles.detectorPhotoStyle}
          source={this.state.photo}
          resizeMode={'contain'}>
          {this._renderFaceBoxes.call(this)}
        </ImageBackground> */}
        <View style={sharedStyles.buttonWrapper}>
          {!this.state.loading && (
            // <TouchableOpacity
            //   // text={this.state.face_data?'Change Photo':"Pick Photo"}
            //   onPress={this._pickImage.bind(this)}
            //   style={sharedStyles.button}
            //   // button_text_styles={sharedStyles.button_text}
            // >
            //   <Text style={sharedStyles.button_text}>{'Pick Photo'}</Text>
            // </TouchableOpacity>
            <GallerySwiper images={() => this.returnValidImages()} />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerStyles: {
    borderRadius: 30,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ccc',
    height: '100%',
    width: '100%',
  },
  ButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
