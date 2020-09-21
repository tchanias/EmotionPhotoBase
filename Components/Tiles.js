import React, {useState} from 'react';
import {
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const {width} = Dimensions.get('window');

export default function Tiles(props) {
  const [tilesPerRow, setTilesPerRow] = useState(3);
  const {images, chooseImage} = props;

  const calcTileDimensions = function(deviceWidth, tpr) {
    const margin = deviceWidth / (tpr * 10);
    const size = (deviceWidth - margin * (tpr * 2)) / tpr;
    return {size, margin};
  };

  const tileDimensions = calcTileDimensions(width, tilesPerRow);
  const mapImagesToTiles = function() {
    console.log('create tiles... ', tileDimensions, images);
    return (
      images &&
      images.length > 0 &&
      images.map((image, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => chooseImage(index)}
          style={[
            styles.item,
            {
              width: tileDimensions.size,
              height: tileDimensions.size,
              marginHorizontal: tileDimensions.margin,
            },
          ]}>
          <Image
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 10,
              borderWidth: 4,
              borderColor: '#fff',
            }}
            source={{uri: image.uri}}
            resizeMode={'cover'}
          />
        </TouchableOpacity>
      ))
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {mapImagesToTiles()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 50,
    paddingBottom: 30,
  },
  tile: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderWidth: 4,
    borderColor: '#fff',
  },
  item: {
    // backgroundColor: 'yellow',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  itemText: {
    fontSize: 20,
  },
});
