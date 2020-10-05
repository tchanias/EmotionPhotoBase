import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  libraryViews,
  removeExtension,
  screens,
  formatAsPercentage,
} from '../constants/constants';
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
import {
  Container,
  Tab,
  Tabs,
  TabHeading,
  Icon,
  Fab,
  Header,
  Button as NBButton,
  Drawer,
  Badge,
} from 'native-base';
import HeaderLeft from '../Components/UI/HeaderLeft';
import HeaderRight from '../Components/UI/HeaderRight';
import StatsModal from '../Components/UI/StatsModal';
import EmotionAnalysis from '../Components/EmotionAnalysis';
import {Filters} from '../constants/filters';
import SideBar from '../Components/UI/SideBar';
import NoImages from '../Components/NoImages';

const AccessTitle = 'EmotionPhotoBase needs authorization.';
const AccessMessage =
  'EmotionPhotoBase requires authorization to access your files.';

const emotionMinimumPercentage = 0.2;
const appearanceMinimumPercentage = 0.5;
const otherMinimumPercentage = 0.5;
const facialHairLength = 0.2;

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
      filters: Filters.Default,
      filtersOpen: false,
      // filtered: false,
    };
    this.drawer = React.createRef();
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
              // console.log('get images: ', imagesWithData, response.assets);
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
    // console.log('firebase: ', imageData);
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
            let makeup = face.makeup;
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
                makeup={makeup}
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
                  <Text style={attr}>Face #{index + 1}</Text>
                  <View style={style} />
                  <Text style={attr}>
                    {face.gender}, {face.age} y/o
                  </Text>
                  <Text style={attr}>
                    {emotion}: {formatAsPercentage(emotionPercentage)}
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

  onSwipeRight(collection) {
    const {activeImage} = this.state;
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

  onSwipeLeft(collection) {
    const {activeImage} = this.state;

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
    return storedImages.some(img => {
      return img.id === image;
    });
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
      return [];
    }
  };

  toggleFilters = () => {
    this.openDrawer();
    this.setState({filtersOpen: true});
  };

  closeDrawer = () => {
    this.drawer._root.close();
    this.setState({filtersOpen: false});
  };
  openDrawer = () => {
    this.drawer._root.open();
  };

  setFilters = filters => {
    this.setState({filters: filters, activeImage: 0});
  };
  resetFilters = () => {
    this.closeDrawer();
    this.setState({filters: Filters.Default, activeImage: 0});
  };

  accessoryExists = (accessory, data) => {
    if (
      !data.accessories ||
      !Array.isArray(data.accessories) ||
      data.accessories.length === 0
    ) {
      return false;
    }
    let filterForAccessory = data.accessories.filter(
      acc => acc.type === accessory && acc.confidence >= otherMinimumPercentage,
    );
    if (filterForAccessory && filterForAccessory.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  imageSatisfiesFilters = image => {
    const {filters, storedImages} = this.state;
    let shouldReturnImage = false;
    let findImageInStorage = storedImages.map(img => {
      if (img.id === removeExtension(image.filename)) {
        // console.log('image data: ', img);
        if (img && img.data && img.data.faces && img.data.faces.length > 0) {
          let filtersSatisfied = img.data.faces.some(face => {
            // let facePassedFilterTest = true;
            const {
              anger,
              contempt,
              disgust,
              fear,
              happiness,
              neutral,
              sadness,
              surprise,
            } = face.emotions;
            const {
              age,
              bald,
              beard,
              gender,
              hairColor,
              hairColorConfidence,
              accessories,
              moustache,
              sideburns,
              smile,
            } = face;

            const {headWear, glasses, mask} = filters.accessories;
            // let  lipMakeup , eyeMakeup  = null;
            // if()

            let lipMakeup,
              eyeMakeup = false;
            if (face.makeup) {
              lipMakeup = face.makeup.lipMakeup;
              eyeMakeup = face.makeup.eyeMakeup;
            }
            const {eyemakeup, lipmakeup} = filters.makeup;
            return (
              (!filters.anger || anger > emotionMinimumPercentage) &&
              (!filters.contempt || contempt > emotionMinimumPercentage) &&
              (!filters.disgust || disgust > emotionMinimumPercentage) &&
              (!filters.fear || fear > emotionMinimumPercentage) &&
              (!filters.happiness || happiness > emotionMinimumPercentage) &&
              (!filters.neutral || neutral > emotionMinimumPercentage) &&
              (!filters.sadness || sadness > emotionMinimumPercentage) &&
              (!filters.surprise || surprise > emotionMinimumPercentage) &&
              (!filters.bald || bald > appearanceMinimumPercentage) &&
              (!filters.beard || beard > facialHairLength) &&
              (!filters.moustache || moustache > facialHairLength) &&
              (!filters.sideburns || sideburns > facialHairLength) &&
              (!filters.hairColor ||
                (hairColor === filters.hairColor &&
                  hairColorConfidence > appearanceMinimumPercentage)) &&
              (!eyemakeup || eyeMakeup) &&
              (!lipmakeup || lipMakeup) &&
              (!filters.gender || filters.gender === gender) &&
              ((filters.age[0] === 0 && filters.age[1] === 100) ||
                (age >= filters.age[0] && age <= filters.age[1])) &&
              (!filters.smile || smile > otherMinimumPercentage) &&
              (!headWear ||
                this.accessoryExists(Filters.Names.headWear, face)) &&
              (!glasses || this.accessoryExists(Filters.Names.glasses, face)) &&
              (!mask || this.accessoryExists(Filters.Names.mask, face))
            );
          });
          shouldReturnImage = filtersSatisfied;
          // console.log('return image? ', shouldReturnImage, img);
          return shouldReturnImage;
        }
      }
    });
    return shouldReturnImage;
  };

  filterImageCollection = (collection, isFiltered) => {
    if (isFiltered) {
      let newCollection = collection.filter(image =>
        this.imageSatisfiesFilters(image),
      );
      return newCollection;
    } else {
      return collection;
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
      filters,
      filtersOpen,
    } = this.state;
    const isFiltered = !_.isEqual(filters, Filters.Default);
    let collection = withDataOnly
      ? this.filterImageCollection(imagesWithData, isFiltered)
      : images;

    return (
      <Drawer
        ref={ref => {
          this.drawer = ref;
        }}
        content={
          <SideBar
            filters={filters}
            isFiltered={isFiltered}
            setFilters={newFilters => this.setFilters(newFilters)}
            resetFilters={() => this.resetFilters()}
          />
        }
        onClose={() => this.closeDrawer()}>
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
            {!loading && (
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
                    {collection && collection.length > 0 ? (
                      <View style={sharedStyles.tilesWrapper}>
                        <Tiles
                          images={collection}
                          chooseImage={index => this.chooseImage(index)}
                        />
                      </View>
                    ) : (
                      <NoImages isFiltered={isFiltered} />
                    )}
                  </Tab>
                  <Tab
                    heading={
                      <TabHeading style={styles.tab}>
                        <Icon name="copy-outline" />
                      </TabHeading>
                    }>
                    {collection && collection.length > 0 ? (
                      <View style={sharedStyles.sliderWrapper}>
                        <Swiper
                          images={collection}
                          current={activeImage}
                          onSwipeLeft={() => this.onSwipeLeft(collection)}
                          onSwipeRight={() => this.onSwipeRight(collection)}
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
                    ) : (
                      <NoImages isFiltered={isFiltered} />
                    )}
                  </Tab>
                  {/* <Tab heading={ <TabHeading><Icon name="apps" /></TabHeading>}>
                <Tab3 />
              </Tab> */}
                </Tabs>
                {/* <Container> */}
                {/* <View style={{flex: 1}}> */}
                {/* <Header /> */}
                {/* <View>
                  {isFiltered && (
                    <Badge danger style={styles.badge}>
                      <Text>!</Text>
                    </Badge>
                  )} */}

                <View
                // style={{flex: 1}}
                >
                  {isFiltered && (
                    <View
                      pointerEvents={'none'}
                      style={{
                        position: 'absolute',
                        elevation: 40,
                        bottom: 85,
                        right: 18,
                        zIndex: 1,
                      }}>
                      <Badge danger>
                        <Text>!</Text>
                      </Badge>
                    </View>
                  )}
                  <Fab
                    active={filtersOpen}
                    direction="up"
                    containerStyle={{}}
                    style={{backgroundColor: '#009671', bottom: 30}}
                    position="bottomRight"
                    onPress={() => this.toggleFilters()}>
                    <Icon
                      name="filter-outline"
                      style={isFiltered ? {color: 'red'} : {}}
                    />
                  </Fab>
                </View>
              </Container>
            )}
          </View>
        </View>
      </Drawer>
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
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
