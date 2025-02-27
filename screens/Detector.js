import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Logo from '../Components/UI/Logo';
import {
  apiUrl,
  screens,
  subKey,
  formatAsPercentage,
} from '../constants/constants';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {firebaseAuth} from '../constants/firebaseConfig';
import firestore from '@react-native-firebase/firestore';
import Spinner from 'react-native-loading-spinner-overlay';
import {sharedStyles, screenWidth} from '../sharedStyles';
import {Button} from 'react-native-elements';
import HeaderLeft from '../Components/UI/HeaderLeft';
import HeaderRight from '../Components/UI/HeaderRight';
import {Container, Icon, Fab} from 'native-base';
import StatsModal from '../Components/UI/StatsModal';
import EmotionAnalysis from '../Components/EmotionAnalysis';
import CameraRoll from '@react-native-community/cameraroll';

const image_picker_options = {
  title: 'Select Photo',
  takePhotoButtonTitle: 'Take Photo...',
  chooseFromLibraryButtonTitle: 'Choose from Library...',
  cameraType: 'back',
  mediaType: 'photo',
  maxWidth: screenWidth,
  maxHeight: 440,
  quality: 1,
  path: 'images',
  noData: false,
  storageOptions: {
    skipBackup: true,
    privateDirectory: true,
    cameraRoll: false,
    path: 'EmotionPhotoBase',
  },
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
      loading: false,
      imageDimensions: null,
      navigated: false,
      bounds: false,
    };
  }

  // componentDidMount() {
  //   console.log('mounted: ', this.props);
  //   const {navigation} = this.props;
  //   if (
  //     navigation &&
  //     navigation.state &&
  //     navigation.state.params &&
  //     navigation.state.params.source
  //   ) {
  //     console.log(
  //       'mounted with data?',
  //       this.props.navigation.state.params.source,
  //     );
  //     this.pickFromLiveView(this.props.navigation.state.params.source);
  //   }
  // }

  componentDidUpdate() {
    if (!this.state.navigated) {
      const {navigation} = this.props;
      if (
        navigation &&
        navigation.state &&
        navigation.state.params &&
        navigation.state.params.source
      ) {
        this.pickFromLiveView(this.props.navigation.state.params.source);
        navigation.setParams({source: null});
      }
    }
  }

  componentWillUnmount() {
    this.setModalVisible(false);
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerStyle: {
        backgroundColor: '#009671',
      },
      headerLeft: (
        <HeaderLeft
          navigation={navigation}
          navigateTo={screens.Library}
          display={
            <Icon name="images-outline" style={sharedStyles.headerIcon} />
          }
        />
      ),
      // headerTitle: 'Detect Face Emotions',
      headerTitle: <Logo />,
      headerRight: <HeaderRight navigation={navigation} />,
    };
  };

  hasAndroidPermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  };
  savePicture = async tag => {
    if (Platform.OS === 'android' && !(await this.hasAndroidPermission())) {
      return;
    }

    return CameraRoll.save(tag, {type: 'photo', album: 'EmotionPhotoBase'});
  };

  pickFromLiveView = async params => {
    if (params && params.uri) {
      console.log('captured image: ', params);

      const savedimage = await this.savePicture(params.uri);
      const files = await CameraRoll.getPhotos({
        first: 1,
        include: ['filename'],
      });
      let filename =
        files &&
        files.edges &&
        files.edges.length &&
        files.edges[0].node &&
        files.edges[0].node.image &&
        files.edges[0].node.image.uri;
      let source = {uri: filename ? filename : params.uri};
      this.setState(
        {
          navigated: true,
          has_photo: true,
          photo: source,
          photo_data: params.data,
          bounds: params.faces,
          imageDimensions: {
            // width: params.width > screenWidth ? screenWidth : params.width,
            // height:
            //   params.width > screenWidth
            //     ? (params.height * screenWidth) / params.width <= 440
            //       ? (params.height * screenWidth) / params.width
            //       : 440
            //     : params.height,
            width: screenWidth,
            height: 440,
            // width: params.width,
            // height: params.height,
            maxWidth: screenWidth,
            maxHeight: 440,
          },
        },
        () => {
          this.detectFacesInit();
        },
      );
    }
  };

  saveToFirebase = () => {
    if (this.state.face_data) {
      let photo = this.state.photo;
      let filename = photo.uri
        ? photo.uri.substring(
            photo.uri.lastIndexOf('/') + 1,
            photo.uri.lastIndexOf('.'),
          )
        : '';
      photo = {...photo, filename};
      let userId = firebaseAuth.currentUser.uid;
      let faces = [];
      let views = this.state.face_data.map((x, key) => {
        let faceObject = {
          faceId: x.faceId,
          emotions: x.faceAttributes && x.faceAttributes.emotion,
          gender: x.faceAttributes && x.faceAttributes.gender,
          smile: x.faceAttributes && x.faceAttributes.smile,
          age: x.faceAttributes && x.faceAttributes.age,
          glasses: x.faceAttributes && x.faceAttributes.glasses,
          bald:
            x.faceAttributes &&
            x.faceAttributes.hair &&
            x.faceAttributes.hair.bald,
          hairColor:
            x.faceAttributes && x.faceAttributes.hair
              ? x.faceAttributes.hair.hairColor &&
                x.faceAttributes.hair.hairColor.length > 0
                ? x.faceAttributes.hair.hairColor[0]
                  ? x.faceAttributes.hair.hairColor[0].color
                  : ''
                : ''
              : '',
          hairColorConfidence:
            x.faceAttributes && x.faceAttributes.hair
              ? x.faceAttributes.hair.hairColor &&
                x.faceAttributes.hair.hairColor.length > 0
                ? x.faceAttributes.hair.hairColor[0]
                  ? x.faceAttributes.hair.hairColor[0].confidence
                  : 0
                : 0
              : 0,
          accessories: x.faceAttributes && x.faceAttributes.accessories,
          moustache:
            x.faceAttributes &&
            x.faceAttributes.facialHair &&
            x.faceAttributes.facialHair.moustache,
          beard:
            x.faceAttributes &&
            x.faceAttributes.facialHair &&
            x.faceAttributes.facialHair.beard,
          sideburns:
            x.faceAttributes &&
            x.faceAttributes.facialHair &&
            x.faceAttributes.facialHair.sideburns,
          makeup: x.faceAttributes && x.faceAttributes.makeup,
          faceRectangle: x.faceRectangle,
        };
        faces.push(faceObject);
      });
      firestore()
        .collection('library')
        .doc(userId)
        .collection('photos')
        .doc(photo.filename)
        .set({
          photo: photo,
          faces: faces,
        });
      Alert.alert('', 'image Saved successfully!!!');
    } else {
      Alert.alert('Cannot detect faces', 'Please try again.');
    }
  };

  openModal = () => {
    this.setModalVisible(true);
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
    if (this.state.face_data && this.state.face_data.length > 0) {
      let views = this.state.face_data.map((x, key) => {
        let emotions = x.faceAttributes.emotion;
        let gender = x.faceAttributes.gender;
        let smile = x.faceAttributes.smile;
        let age = x.faceAttributes.age;
        let glasses = x.faceAttributes.glasses;
        let bald = x.faceAttributes.hair.bald;
        let hairColor = x.faceAttributes.hair
          ? x.faceAttributes.hair.hairColor
            ? x.faceAttributes.hair.hairColor[0]
              ? x.faceAttributes.hair.hairColor[0].color
              : 'No hair'
            : 'No hair'
          : 'No hair';
        let hairColorConfidence = x.faceAttributes.hair
          ? x.faceAttributes.hair.hairColor
            ? x.faceAttributes.hair.hairColor[0]
              ? x.faceAttributes.hair.hairColor[0].confidence
              : ''
            : ''
          : '';
        let accessories = x.faceAttributes.accessories
          ? x.faceAttributes.accessories.length >= 1
            ? x.faceAttributes.accessories
            : 'No Accessories'
          : 'No Accessories';
        let moustache = x.faceAttributes.facialHair.moustache;
        let beard = x.faceAttributes.facialHair.beard;
        let sideburns = x.faceAttributes.facialHair.sideburns;
        let makeup = x.faceAttributes.makeup;
        return (
          <EmotionAnalysis
            emotions={emotions}
            index={key}
            key={key}
            gender={gender}
            age={age}
            smile={smile}
            glasses={glasses}
            hairColor={hairColor}
            hairColorConfidence={hairColorConfidence}
            accessories={accessories}
            moustache={moustache}
            beard={beard}
            bald={bald}
            sideburns={sideburns}
            makeup={makeup}
            facesLength={this.state.face_data && this.state.face_data.length}
          />
        );
      });
      return <View>{views}</View>;
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

  openVideo = () => {
    this.setState(
      {
        has_photo: false,
        photo: null,
        face_data: null,
        modalVisible: false,
        faces: [],
        loading: false,
        imageDimensions: null,
        navigated: false,
        bounds: false,
      },
      () => this.props.navigation.navigate('Video'),
    );
  };

  imagePickInit = () => {
    ImagePicker.showImagePicker(image_picker_options, response => {
      if (response.error) {
        Alert.alert('Application error. Please try again.');
      } else {
        if (response.uri) {
          let source = {uri: response.uri};
          console.log('picked image: ', response);
          this.setState(
            {
              has_photo: true,
              photo: source,
              photo_data: response.data,
              imageDimensions: {
                width: response.width,
                height: response.height,
                maxWidth: screenWidth,
                maxHeight: 440,
              },
            },
            () => {
              this.detectFacesInit();
            },
          );
        }
      }
    });
  };

  detectFacesInit() {
    this.setState({loading: true}, () => {
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
          console.log('response: ', json);
          if (json.length) {
            this.setState({
              face_data: json,
              loading: false,
            });
          } else {
            this.setState(
              {
                loading: false,
                face_data: null,
              },
              () => {
                Alert.alert(
                  'Cannot detect any faces.',
                  json && json.error && json.error.message,
                );
              },
            );
          }

          return json;
        })
        .catch(function(error) {
          this.setState({loading: false, face_data: null}, () => {
            console.log(error);
            Alert.alert(
              'Sorry, the request failed. Please try again.' +
                JSON.stringify(error),
            );
          });
        });
    });
  }

  _drawFaceFrames() {
    console.log('render face box: ', this.state.face_data, this.state.bounds);
    if (this.state.face_data) {
      const {bounds} = this.state;
      let views = this.state.face_data.map((face, index) => {
        let style = {
          width: face.faceRectangle.width,
          height: face.faceRectangle.height,
          borderWidth: 2,
          borderColor: '#fff',
        };
        let box = {
          position: 'absolute',
          top: face.faceRectangle.top,
          left: face.faceRectangle.left,
        };
        if (bounds && bounds.length) {
          style = {
            width: bounds[index].bounds.size.width,
            height: bounds[index].bounds.size.height,
            borderWidth: 2,
            borderColor: '#fff',
          };
          box = {
            position: 'absolute',
            top: bounds[index].bounds.origin.y,
            left: bounds[index].bounds.origin.x,
          };
        }

        const [emotion, emotionPercentage] = this.findDominantEmotion(
          face.faceAttributes.emotion,
        );

        let attr = {
          color: '#fff',
        };

        return (
          <View key={face.faceId} style={box}>
            <Text style={attr}>Face #{index + 1}</Text>
            <View style={style} />
            <Text style={attr}>
              {face.faceAttributes.gender}, {face.faceAttributes.age} y/o
            </Text>
            <Text style={attr}>
              {emotion}: {formatAsPercentage(emotionPercentage)}
            </Text>
          </View>
        );
      });

      return <View>{views}</View>;
    }
  }

  render() {
    const {
      imageDimensions,
      modalVisible,
      loading,
      photo,
      face_data,
    } = this.state;
    return (
      <Container>
        <View
        // style={sharedStyles.detectorContainer}
        >
          <Spinner
            visible={loading}
            textContent={'Loading image data...'}
            textStyle={{color: sharedStyles.textColor}}
          />

          <StatsModal
            modalVisible={modalVisible}
            setModalVisible={value => this.setModalVisible(value)}
            data={this.mapJsonData()}
          />
          <View
            style={
              !photo
                ? sharedStyles.detectorPhotoStyle
                : sharedStyles.detectorPhotoPickedStyle
            }>
            <ImageBackground
              style={imageDimensions || {width: '100%', height: '100%'}}
              source={photo || require('../placeholder.png')}
              resizeMode={'contain'}>
              {this._drawFaceFrames()}
            </ImageBackground>
          </View>
          <View style={styles.ButtonContainer}>
            {!loading && (
              <Button
                buttonStyle={sharedStyles.circleButtons}
                onPress={this.imagePickInit}
                icon={
                  <Icon
                    name="image-outline"
                    style={sharedStyles.circleButtonsIcon}
                  />
                }
                title={face_data ? 'Change Photo' : 'Pick Photo'}
              />
            )}
            {face_data && (
              <Button
                buttonStyle={sharedStyles.circleButtons}
                onPress={() => this.openModal()}
                icon={
                  <Icon
                    name="bar-chart-outline"
                    style={sharedStyles.circleButtonsIcon}
                  />
                }
                title="View Stats"
              />
            )}
            {face_data && (
              <Button
                buttonStyle={sharedStyles.circleButtons}
                icon={
                  <Icon
                    name="save-outline"
                    style={sharedStyles.circleButtonsIcon}
                  />
                }
                title="Save Photo"
                onPress={() => this.saveToFirebase()}
              />
            )}
            <View />
          </View>
        </View>
        <Fab
          direction="up"
          containerStyle={{}}
          style={{backgroundColor: '#009671', bottom: 30}}
          position="bottomRight"
          onPress={() => this.openVideo()}>
          <Icon name="videocam-outline" />
        </Fab>
      </Container>
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
    backgroundColor: '#373737',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    flex: 1,
    width: '100%',
  },
});

export default Detector;
