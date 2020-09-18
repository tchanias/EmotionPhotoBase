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
import {appName, removeExtension} from '../constants/constants';
import Spinner from 'react-native-loading-spinner-overlay';
import {sharedStyles} from '../sharedStyles';
import {Overlay, Divider} from 'react-native-elements';
import GalleryManager from 'react-native-gallery-manager';
//
import Swiper from 'react-native-swiper';
import SwipeableViews from 'react-swipeable-views-native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

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
const AccessTitle = 'EmotionPhotoBase needs authorization.';
const AccessMessage =
  'EmotionPhotoBase requires authorization to access your files.';

const swipeConfig = {
  velocityThreshold: 0.1,
  directionalOffsetThreshold: 30,
  gestureIsClickThreshold: 2,
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
      loading: true,
      images: [],
      gallery: [],
      activeImage: 0,
      storedImages: [],
    };
  }

  componentDidMount() {
    this.setModalVisible(false);
    this.libraryListener = this.props.navigation.addListener('didFocus', () =>
      this.redirectionLoadParams(),
    );
    this.getFirebaseCollection();
    this.getSavedImages();

    setTimeout(() => {
      this.props.navigation.setParams({
        LogIn: this.signIn,
        LogOut: this.signOut,
      });
    }, 3000);
  }

  setModalVisible = visible => {
    this.setState({modalVisible: visible});
  };

  getSavedImages = () => {
    GalleryManager.requestAuthorization(AccessTitle, AccessMessage)
      .then(response => {
        if ((response.isAuthorized = true)) {
          GalleryManager.getAssets({
            type: 'image',
            startFrom: 0,
            albumName: 'EmotionPhotoBase',
          })
            .then(response => {
              this.setState({
                images: response.assets,
                gallery: this.returnValidImages(response.assets),
              });
            })
            .catch(err => {
              // no rejects are defined currently on iOS
              console.log('gallery error: ', err);
              this.setState({loading: false});
            });
        }
        // response.isAuthorized = true || false
      })
      .catch(err => {
        console.log(err =>
          console.log('There was an error requesting access: ', err),
        );
        this.setState({loading: false});
      });
  };

  getFirebaseCollection = async () => {
    let userId = firebaseAuth.currentUser.uid;
    let imageData = [];
    let storedImages = await firestore()
      .collection('library')
      .doc(userId)
      .collection('photos')
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(doc => {
          console.log(doc.id, ' => ', doc.data());
          imageData.push({data: doc.data(), id: doc.id});
        });
      })
      .catch(function(error) {
        console.log('Error getting document:', error);
      });
    this.setState({storedImages: imageData});
  };

  componentWillUnmount() {
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
            navigation.navigate('Detector');
          }}>
          <Text>{'Detector'}</Text>
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

  prepareModalData = image => {
    if (this.state.storedImages) {
      const {storedImages} = this.state;
      let view = _.map(storedImages, img => {
        if (img.id === image) {
          return img.data.faces.map((face, index) => {
            let emotions = face.emotions;
            let gender = face.gender;
            let smile = face.smile;
            let age = face.age;
            let glasses = face.glasses;
            let bald = face.bald;
            let hairColor = face.hairColor;
            let hairColorConfidence = face.hairColorConfidence;
            let accessories = face.accessories;
            let moustache = face.moustache;
            let beard = face.beard;
            let sideburns = face.sideburns;
            return (
              <View
                style={{
                  marginBottom: 10,
                }}
                key={index}>
                <View>
                  <Text style={sharedStyles.titleText}>Face #{index + 1}</Text>
                </View>
                <View>
                  <Text style={sharedStyles.subTitleText}>Emotions</Text>
                  <Text>Anger:{emotions && emotions['anger']}</Text>
                  <Text>Contempt:{emotions && emotions['contempt']}</Text>
                  <Text>Disgust:{emotions && emotions['disgust']}</Text>
                  <Text>Fear:{emotions && emotions['fear']}</Text>
                  <Text>Happiness:{emotions && emotions['happiness']}</Text>
                  <Text>Neutral:{emotions && emotions['neutral']}</Text>
                  <Text>Sadness:{emotions && emotions['sadness']}</Text>
                  <Text>Surprise:{emotions && emotions['surprise']}</Text>
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
                <Divider style={{backgroundColor: 'blue'}} />
              </View>
            );
          });
        }
      });
      return <View>{view}</View>;
    } else {
      return (
        <View
          style={{
            backgroundColor: sharedStyles.backgroundColor,
            marginBottom: 10,
          }}>
          <Text style={sharedStyles.subTitleText}>
            No valid image has been selected yet!
          </Text>
        </View>
      );
    }
  };

  renderFaceBoxes(image) {
    if (this.state.storedImages) {
      const {storedImages} = this.state;
      let view = _.map(storedImages, img => {
        if (img.id === image) {
          return img.data.faces.map((face, index) => {
            if (face.faceRectangle) {
              let box = {
                position: 'absolute',
                top: face.faceRectangle.top,
                left: face.faceRectangle.left,
              };

              const [emotion, emotionPercentage] = this.findDominantEmotion(
                face.emotions,
              );

              let style = {
                width: face.faceRectangle.width,
                height: face.faceRectangle.height,
                borderWidth: 2,
                borderColor: '#fff',
              };

              let attr = {
                color: '#fff',
              };

              return (
                <View key={index} style={box}>
                  <View style={style} />
                  <Text style={attr}>
                    {face.gender}, {face.age} y/o
                  </Text>
                  <Text style={attr}>
                    {emotion}: {emotionPercentage}
                  </Text>
                </View>
              );
            }
          });
        }
      });

      return <View>{view}</View>;
    }
  }

  returnValidImages = images => {
    let gallery = [];
    if (images) {
      gallery = images.map(image => {
        return {
          source: image.uri,
          width: image.width,
          height: image.height,
        };
      });
    }
    this.setState({loading: false});
    return gallery;
  };

  onSwipeRight() {
    const {images} = this.state;
    if (images && images.length > 0) {
      let newImage = this.state.activeImage - 1;
      const lastImage = this.state.images.length - 1;
      if (newImage >= 0) {
        this.setState({activeImage: newImage});
      } else {
        this.setState({activeImage: lastImage});
      }
    }
  }

  onSwipeLeft() {
    const {images} = this.state;
    if (images && images.length > 0) {
      let newImage = this.state.activeImage + 1;
      const imagesLength = this.state.images.length;
      if (newImage < imagesLength) {
        this.setState({activeImage: newImage});
      } else {
        this.setState({activeImage: 0});
      }
    }
  }

  render() {
    const {loading, images, activeImage} = this.state;

    return (
      <View>
        <Spinner
          visible={loading}
          textContent={'Loading image data...'}
          textStyle={{color: sharedStyles.textColor}}
        />
        {images && images[activeImage] && (
          <Overlay
            isVisible={this.state.modalVisible}
            fullScreen
            overlayStyle={{overflowY: 'auto'}}
            onBackdropPress={() => this.setModalVisible(false)}>
            <View style={{marginTop: 22}}>
              <ScrollView>
                <View>
                  {this.prepareModalData(
                    removeExtension(images[activeImage].filename),
                  )}
                  <RNButton
                    title="Hide Modal"
                    onPress={() => {
                      this.setModalVisible(false);
                    }}
                  />
                </View>
              </ScrollView>
            </View>
          </Overlay>
        )}
        <View style={sharedStyles.buttonWrapper}>
          {!loading && images.length > 0 && (
            // <Swiper
            <>
              <View>
                <View>
                  <Text
                    style={sharedStyles.subTitleText}>{`Image: ${activeImage +
                    1} out of ${images.length}`}</Text>
                </View>
                {images && images[activeImage] && (
                  <View>
                    <TouchableOpacity
                      onPress={() => this.setModalVisible(true)}
                      style={sharedStyles.button}>
                      <Text style={sharedStyles.button_text}>View Data</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <GestureRecognizer
                onSwipeLeft={state => this.onSwipeLeft(state)}
                onSwipeRight={state => this.onSwipeRight(state)}
                config={swipeConfig}
                style={{
                  flex: 1,
                  backgroundColor: this.state.backgroundColor,
                }}>
                {images && images[activeImage] && (
                  <View
                    key={activeImage}
                    style={{
                      ...styles.slide,
                      width: images[activeImage].width,
                      height: images[activeImage].height,
                    }}>
                    <ImageBackground
                      style={{
                        width: images[activeImage].width,
                        height: images[activeImage].height,
                      }}
                      source={{uri: images[activeImage].uri}}
                      resizeMode={'contain'}>
                      {this.renderFaceBoxes(
                        removeExtension(images[activeImage].filename),
                      )}
                    </ImageBackground>
                  </View>
                )}
              </GestureRecognizer>
            </>
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
  slideWrapper: {
    height: 500,
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
