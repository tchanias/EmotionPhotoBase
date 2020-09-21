import React from 'react';
import {ImageBackground, Dimensions} from 'react-native';
import {View, Text} from 'native-base';
import {removeExtension} from '../constants/constants';
import GestureRecognizer from 'react-native-swipe-gestures';
import {sharedStyles} from '../sharedStyles';

const swipeConfig = {
  velocityThreshold: 0.1,
  directionalOffsetThreshold: 30,
  gestureIsClickThreshold: 2,
};
const screenWidth = Dimensions.get('window').width;
export default function Swiper(props) {
  const {images, current, onSwipeLeft, onSwipeRight, renderFaceBoxes} = props;
  console.log('screenWidth: ', screenWidth);
  return (
    <GestureRecognizer
      onSwipeLeft={() => onSwipeLeft()}
      onSwipeRight={() => onSwipeRight()}
      config={swipeConfig}
      style={styles.swiper}>
      {images && images[current] && (
        <View
          key={current}
          style={[
            styles.slide,
            {
              width: images[current].width,
              height: images[current].height,
            },
          ]}>
          <ImageBackground
            style={[
              styles.imageBackground,
              {
                width: images[current].width,
                height: images[current].height,
              },
            ]}
            source={{uri: images[current].uri}}
            resizeMode={'cover'}>
            {/* <View style={styles.imageCounter}> */}
            <Text
              style={[
                sharedStyles.subTitleText,
                styles.counter,
              ]}>{`Image: ${current + 1} out of ${images.length}`}</Text>
            {/* </View> */}
            {renderFaceBoxes(removeExtension(images[current].filename))}
          </ImageBackground>
        </View>
      )}
    </GestureRecognizer>
  );
}

const styles = {
  swiper: {
    backgroundColor: '#373737',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    // justifyContent: 'center',
    // alignItems: 'center',
    maxWidth: screenWidth,
    // maxHeight: 440,
  },
  imageBackground: {
    // width: '100%',
    // height: '100%',
    maxWidth: screenWidth,
    // maxHeight: 440,
  },
  counter: {
    color: '#fff',
    position: 'absolute',
    // width: 400,
    bottom: 0,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  // imageCounter: {

  // },
};
