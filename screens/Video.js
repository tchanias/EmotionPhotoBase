import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  PixelRatio,
} from 'react-native';
import HeaderLeft from '../Components/UI/HeaderLeft';
import HeaderRight from '../Components/UI/HeaderRight';
import ImagePicker from 'react-native-image-picker';
import {screens, formatAsPercentage} from '../constants/constants';
import Spinner from 'react-native-loading-spinner-overlay';
import {Icon, Container, Tab, Tabs, TabHeading} from 'native-base';
import {sharedStyles} from '../sharedStyles';
import Logo from '../Components/UI/Logo';
import {RNCamera, FaceDetector} from 'react-native-camera';
import {screenWidth} from '../sharedStyles';

const landmarkSize = 6;
let {width, height} = Dimensions.get('window');
let pictureWidth = PixelRatio.getPixelSizeForLayoutSize(width);
const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    }}>
    <Text>Waiting</Text>
  </View>
);

const image_picker_options = {
  title: 'Select File',
  takePhotoButtonTitle: 'Take Photo...',
  chooseFromLibraryButtonTitle: 'Choose from Library...',
  cameraType: 'back',
  mediaType: 'video',
  // maxWidth: screenWidth,
  // maxHeight: 440,
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

export default class Video extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 0,
      box: null,
      fileUrl: null,
      filePath: null,
      fileData: null,
      isSelfie: true,
      loading: false,
      faces: [],
      paused: false,
      captureWidth: null,
      captureHeight: null,
    };
  }

  componentDidMount() {
    // this.setState({loading:true},()=>{

    // })
    setTimeout(() => {
      this.props.navigation.setParams({
        LogIn: this.signIn,
        LogOut: this.signOut,
      });
    }, 3000);
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerStyle: {
        backgroundColor: '#009671',
      },
      headerLeft: (
        <HeaderLeft
          navigation={navigation}
          navigateTo={screens.Detector}
          display={
            <Icon name="camera-outline" style={sharedStyles.headerIcon} />
          }
        />
      ),
      // headerTitle: 'Detect Face Emotions',
      headerTitle: <Logo />,
      headerRight: <HeaderRight navigation={navigation} />,
    };
  };

  onChangeTab = value => {
    console.log('changeTab: ', value);
    this.setState({tab: value.i});
  };

  takePicture = async value => {
    if (value) {
      const options = {
        quality: 1,
        base64: true,
        // width: width * 1.5,
        pauseAfterCapture: true,
      };
      const data = await value.takePictureAsync(options);
      // this.camera.pausePreview();
      console.log(data);
      this.setState({
        fileData: data.base64,
        camera: false,
        fileUrl: data.uri,
        paused: true,
        captureWidth: data.width,
        captureHeight: data.height,
      });
    }
  };

  renderFace({bounds, faceID, rollAngle, yawAngle, smilingProbability}) {
    return (
      <React.Fragment key={faceID}>
        <View
          transform={[
            {perspective: 600},
            {rotateZ: `${rollAngle.toFixed(0)}deg`},
            {rotateY: `${yawAngle.toFixed(0)}deg`},
          ]}
          style={[
            styles.face,
            {
              ...bounds.size,
              left: bounds.origin.x,
              top: bounds.origin.y,
            },
          ]}
        />
        <View style={styles.faceTextContainer}>
          <Text style={styles.faceText}>ID: {faceID}</Text>
          <Text style={styles.faceText}>
            Roll Angle: {rollAngle.toFixed(0)}
          </Text>
          <Text style={styles.faceText}>YawAngle: {yawAngle.toFixed(0)}</Text>
          <Text style={styles.faceText}>
            {smilingProbability && smilingProbability > 0.4 ? 'Smiling' : ''}
          </Text>
        </View>
      </React.Fragment>
    );
  }

  renderLandmarksOfFace(face) {
    const renderLandmark = position =>
      position && (
        <View
          style={[
            styles.landmark,
            {
              left: position.x - landmarkSize / 2,
              top: position.y - landmarkSize / 2,
            },
          ]}
        />
      );
    return (
      <View key={`landmarks-${face.faceID}`}>
        {renderLandmark(face.leftEyePosition)}
        {renderLandmark(face.rightEyePosition)}
        {renderLandmark(face.leftEarPosition)}
        {renderLandmark(face.rightEarPosition)}
        {renderLandmark(face.leftCheekPosition)}
        {renderLandmark(face.rightCheekPosition)}
        {renderLandmark(face.leftMouthPosition)}
        {renderLandmark(face.mouthPosition)}
        {renderLandmark(face.rightMouthPosition)}
        {renderLandmark(face.noseBasePosition)}
        {renderLandmark(face.bottomMouthPosition)}
      </View>
    );
  }

  renderLandmarks = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderLandmarksOfFace)}
    </View>
  );

  renderFaces = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>
  );

  onFacesDetected = ({faces}) => this.setState({faces});
  onFaceDetectionError = state => console.warn('Faces detection error:', state);

  resetCapture = () => {
    this.setState(
      {
        fileUrl: null,
        fileData: null,
        paused: false,
      },
      () => this.camera.resumePreview(),
    );
  };

  useInDetector = () => {
    const {captureHeight, captureWidth, fileData, fileUrl, faces} = this.state;
    let source = {
      source: {
        height: captureHeight,
        width: captureWidth,
        data: fileData,
        uri: fileUrl,
        faces,
      },
    };
    this.props.navigation.navigate('Detector', source);
  };

  render() {
    const {faces, loading, paused, isSelfie, fileUrl} = this.state;
    return (
      <View>
        <View style={sharedStyles.libraryWrapper}>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={
              isSelfie
                ? RNCamera.Constants.Type.front
                : RNCamera.Constants.Type.back
            }
            flashMode={RNCamera.Constants.FlashMode.on}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            // androidRecordAudioPermissionOptions={{
            //   title: 'Permission to use audio recording',
            //   message: 'We need your permission to use your audio',
            //   buttonPositive: 'Ok',
            //   buttonNegative: 'Cancel',
            // }}
            onFacesDetected={faces => {
              if (faces.faces && faces.faces.length) {
                this.setState({faces: faces.faces});
              } else {
                this.setState({faces: null});
              }
            }}
            faceDetectionLandmarks={
              RNCamera.Constants.FaceDetection.Landmarks.all
            }
            faceDetectionClassifications={
              RNCamera.Constants.FaceDetection.Classifications.all
            }
            faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.accurate}
            autoFocus={RNCamera.Constants.AutoFocus.on}
            // onGoogleVisionBarcodesDetected={({barcodes}) => {
            //   console.log(barcodes);
            // }}
          >
            {({camera, status}) => {
              if (status !== 'READY') {
                return (
                  <Spinner
                    visible={loading}
                    textContent={'Loading data...'}
                    textStyle={{color: sharedStyles.textColor}}
                  />
                );
              }
              return (
                <>
                  <View
                    style={{
                      flex: 0,
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    {!fileUrl ? (
                      <>
                        <TouchableOpacity
                          onPress={() => this.takePicture(camera)}
                          // style={styles.capture}
                        >
                          {/* <Text style={{fontSize: 14}}> Record </Text> */}
                          <Icon
                            style={{fontSize: 60, color: 'white'}}
                            name={'camera-outline'}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.setState({isSelfie: !isSelfie})}
                          // style={styles.capture}
                        >
                          {/* <Text style={{fontSize: 14}}> Record </Text> */}
                          <Icon
                            style={{fontSize: 60, color: 'white'}}
                            name={'camera-reverse-outline'}
                          />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          disabled={!faces && !!fileUrl}
                          onPress={() => this.useInDetector()}
                          // style={styles.capture}
                        >
                          {/* <Text style={{fontSize: 14}}> Record </Text> */}
                          <Icon
                            style={{
                              fontSize: 60,
                              color: !faces && !!fileUrl ? 'gray' : 'white',
                            }}
                            name={'scan-outline'}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.resetCapture()}
                          // style={styles.capture}
                        >
                          {/* <Text style={{fontSize: 14}}> Record </Text> */}
                          <Icon
                            style={{fontSize: 60, color: 'white'}}
                            name={'refresh-outline'}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                  {!faces && fileUrl && (
                    <View style={styles.faceTextContainer}>
                      <Text style={styles.faceText}>
                        Warning: Couldn't detect faces in picture.
                      </Text>
                    </View>
                  )}
                  {faces && faces.length > 0 && this.renderFaces()}
                  {faces && faces.length > 0 && this.renderLandmarks()}
                </>
              );
            }}
          </RNCamera>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    backgroundColor: '#00B386',
  },
  headerStyles: {
    borderRadius: 30,
  },
  //   container: {
  //     flex: 1,
  //     alignItems: 'center',
  //     alignSelf: 'center',
  //     backgroundColor: '#ccc',
  //     height: '100%',
  //     width: '100%',
  //   },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: '#fc0303',
    borderRadius: 20,
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    // borderColor: '#FFD700',
    borderColor: '#009671',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  faceText: {
    color: '#fc0303',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  faceTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
