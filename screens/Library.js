import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {libraryViews, removeExtension, screens} from '../constants/constants';
import _ from 'lodash';
import Tiles from '../Components/Tiles';
import {firebaseAuth} from '../constants/firebaseConfig';
import firestore from '@react-native-firebase/firestore';
import Logo from '../Components/UI/Logo';
import Spinner from 'react-native-loading-spinner-overlay';
import {sharedStyles} from '../sharedStyles';
import {Button} from 'react-native-elements';
import GalleryManager from 'react-native-gallery-manager';
// TODO: clear unused libraries and code
// import Swiper from 'react-native-swiper';
// import SwipeableViews from 'react-swipeable-views-native';
import Swiper from '../Components/Swiper';
import {Container, Tab, Tabs, TabHeading, Icon} from 'native-base';
import HeaderLeft from '../Components/UI/HeaderLeft';
import HeaderRight from '../Components/UI/HeaderRight';
import StatsModal from '../Components/UI/StatsModal';
import EmotionAnalysis from '../Components/EmotionAnalysis';

const AccessTitle = 'EmotionPhotoBase needs authorization.';
const AccessMessage =
  'EmotionPhotoBase requires authorization to access your files.';

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
      firebaseLoaded: false,
      galleryLoaded: false,
      view: libraryViews.tiles.id,
      tab: libraryViews.tiles.position,
      withDataOnly: true,
      imagesWithData: [],
    };
  }

  componentDidMount() {
    this.setModalVisible(false);
    this.getAllData();

    setTimeout(() => {
      this.props.navigation.setParams({
        LogIn: this.signIn,
        LogOut: this.signOut,
      });
    }, 3000);
  }

  componentWillUnmount() {
    this.setModalVisible(false);
  }

  getAllData = async () => {
    let firebaseImages = await this.getFirebaseCollection();

    this.getSavedImages(firebaseImages);
  };

  setModalVisible = visible => {
    this.setState({modalVisible: visible});
  };

  getSavedImages = firebaseImages => {
    GalleryManager.requestAuthorization(AccessTitle, AccessMessage)
      .then(response => {
        if ((response.isAuthorized = true)) {
          GalleryManager.getAssets({
            type: 'image',
            startFrom: 0,
            albumName: 'EmotionPhotoBase',
            limit: 100,
          })
            .then(response => {
              let gallery = this.returnValidImages(response.assets);
              let imagesWithData = this.getImagesWithData(
                firebaseImages,
                response.assets,
              );
              this.setState({
                images: response.assets,
                gallery: gallery,
                galleryLoaded: gallery && gallery.length > 0,
                imagesWithData: imagesWithData,
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
        console.log('There was an error requesting access: ', err);
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
          imageData.push({data: doc.data(), id: doc.id});
        });
      })
      .catch(function(error) {
        console.log('Error getting document:', error);
      });
    this.setState({
      storedImages: imageData,
      firebaseLoaded: imageData && imageData.length > 0,
    });
    return imageData;
  };

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
              <EmotionAnalysis
                emotions={emotions}
                index={index}
                gender={gender}
                key={index}
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
                facesLength={img.data.faces && img.data.faces.length}
              />
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
      let view = storedImages.map(img => {
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

  chooseImage = index => {
    this.setState({
      activeImage: index,
      view: libraryViews.swiper.id,
      tab: libraryViews.swiper.position,
    });
  };

  // TODO: remove duplicate images
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
    const {images, withDataOnly, imagesWithData, activeImage} = this.state;
    let collection = withDataOnly ? imagesWithData : images;
    if (collection && collection.length > 0) {
      let newImage = activeImage - 1;
      const lastImage = collection.length - 1;
      if (newImage >= 0) {
        this.setState({activeImage: newImage});
      } else {
        this.setState({activeImage: lastImage});
      }
    }
  }

  onSwipeLeft() {
    const {images, withDataOnly, imagesWithData, activeImage} = this.state;
    let collection = withDataOnly ? imagesWithData : images;
    if (collection && collection.length > 0) {
      let newImage = activeImage + 1;
      const imagesLength = collection.length;
      if (newImage < imagesLength) {
        this.setState({activeImage: newImage});
      } else {
        this.setState({activeImage: 0});
      }
    }
  }

  onChangeTab = value => {
    this.setState({tab: value.i});
  };

  onWithDataOnlyChange = () => {
    let newstate = !this.state.withDataOnly;
    this.setState({withDataOnly: newstate});
  };

  isImageStoredInFirebase = (storedImages, image) => {
    return storedImages.some(img => img.id === image);
  };

  getImagesWithData = (storedImages, images) => {
    let imagesForReturn = [];
    if (
      storedImages &&
      storedImages.length > 0 &&
      images &&
      images.length > 0
    ) {
      images.map(image => {
        if (
          this.isImageStoredInFirebase(
            storedImages,
            removeExtension(image.filename),
          )
        ) {
          imagesForReturn.push(image);
        }
      });
      return imagesForReturn;
    } else {
      return images;
    }
  };

  render() {
    const {
      loading,
      activeImage,
      view,
      tab,
      images,
      withDataOnly,
      imagesWithData,
      modalVisible,
    } = this.state;

    let collection = withDataOnly ? imagesWithData : images;
    return (
      <View>
        <Spinner
          visible={loading}
          textContent={'Loading image data...'}
          textStyle={{color: sharedStyles.textColor}}
        />
        {collection && collection[activeImage] && (
          <StatsModal
            modalVisible={modalVisible}
            setModalVisible={value => this.setModalVisible(value)}
            data={this.prepareModalData(
              removeExtension(collection[activeImage].filename),
            )}
          />
        )}
        <View style={sharedStyles.libraryWrapper}>
          {!loading && collection.length > 0 && (
            <Container>
              <Tabs
                page={tab}
                onChangeTab={this.onChangeTab}
                locked={tab === libraryViews.swiper.position}>
                <Tab
                  heading={
                    <TabHeading style={styles.tab}>
                      <Icon name="grid-outline" />
                    </TabHeading>
                  }>
                  <View style={sharedStyles.tilesWrapper}>
                    <Tiles
                      images={collection}
                      chooseImage={index => this.chooseImage(index)}
                    />
                  </View>
                </Tab>
                <Tab
                  heading={
                    <TabHeading style={styles.tab}>
                      <Icon name="copy-outline" />
                    </TabHeading>
                  }>
                  <View style={sharedStyles.sliderWrapper}>
                    <Swiper
                      images={collection}
                      current={activeImage}
                      onSwipeLeft={() => this.onSwipeLeft()}
                      onSwipeRight={() => this.onSwipeRight()}
                      renderFaceBoxes={data => this.renderFaceBoxes(data)}
                    />
                    {collection && collection[activeImage] && (
                      <View style={styles.statsButtonContainer}>
                        <Button
                          buttonStyle={sharedStyles.circleButtons}
                          onPress={() => this.setModalVisible(true)}
                          icon={
                            <Icon
                              name="bar-chart-outline"
                              style={sharedStyles.circleButtonsIcon}
                            />
                          }
                          title="View Stats"
                        />
                      </View>
                    )}
                  </View>
                </Tab>
                {/* <Tab heading={ <TabHeading><Icon name="apps" /></TabHeading>}>
                <Tab3 />
              </Tab> */}
              </Tabs>
            </Container>
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
  statsButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 30,
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
  tab: {
    backgroundColor: '#00B386',
  },
});
