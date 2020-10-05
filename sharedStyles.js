import {Dimensions} from 'react-native';
export const screenWidth = Dimensions.get('window').width;

const mainBackgroundColor = '#373737';
const mainElementColor = '#05BD7D';
const textColor = '#fff';
const buttonFont = {
  fontSize: 20,
  fontWeight: '400',
};
const titleFont = {
  fontSize: 24,
  fontWeight: '700',
};
const subTitleFont = {
  fontSize: 17,
  fontWeight: '700',
};
const textFont = {
  fontSize: 15,
  fontWeight: '400',
};

export const sharedStyles = {
  textColor: textColor,
  elementColor: mainElementColor,
  backgroundColor: mainBackgroundColor,
  screen: {
    backgroundColor: mainBackgroundColor,
  },
  detectorContainer: {
    backgroundColor: mainBackgroundColor,
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    height: '100%',
    width: '100%',
  },
  libraryWrapper: {
    backgroundColor: mainBackgroundColor,
    width: '100%',
    flexGrow: 1,
    height: '100%',
    flexDirection: 'row',
  },
  tilesWrapper: {
    backgroundColor: mainBackgroundColor,
    width: '100%',
    flexGrow: 1,
    height: '100%',
    flexDirection: 'row',
  },
  sliderWrapper: {
    backgroundColor: mainBackgroundColor,
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',

    // height: '100%',
    // flexDirection: 'row',
  },
  detectorPhotoStyle: {
    maxHeight: 440,
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#E7E9ED',
    // justifyContent: 'center',
    // alignItems: 'center',
  },

  detectorPhotoPickedStyle: {
    maxHeight: 440,
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: mainBackgroundColor,
    // justifyContent: 'center',
    alignItems: 'center',
  },
  circleButtons: {
    color: '#fff',
    minWidth: 160,
    backgroundColor: '#009671',
    borderRadius: 10,
    padding: 12,
    // width: 48,
  },
  circleButtonsIcon: {
    color: '#fff',
    marginRight: 8,
  },
  button_text: {
    ...buttonFont,
    color: textColor,
  },
  titleText: {
    ...titleFont,
    marginBottom: 10,
  },
  subTitleText: {
    ...subTitleFont,
    marginBottom: 4,
  },
  headerLeft: {
    paddingLeft: 20,
    color: '#fff',
  },
  headerRight: {
    paddingRight: 20,
    color: '#fff',
  },
  headerIcon: {
    color: '#fff',
  },
};
