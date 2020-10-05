import React from 'react';
import {View, Text, Dimensions} from 'react-native';

const screenWidth = Dimensions.get('window').width;
export default function NoImages(props) {
  const {isFiltered} = props;
  return (
    <View style={styles.container}>
      {isFiltered ? (
        <Text style={styles.message}>
          No Images Found. Please check your filter criteria.
        </Text>
      ) : (
        <Text style={styles.message}>
          No Images Found. Please use the detection functionality and save your
          favorite images.
        </Text>
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    height: '100%',
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#373737',
    flexDirection: 'row',
    padding: 30,
  },
  message: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    color: '#fff',
  },
};
