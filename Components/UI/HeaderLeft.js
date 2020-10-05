import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {sharedStyles} from '../../sharedStyles';
export default function HeaderLeft(props) {
  const {navigateTo, display, navigation} = props;
  return (
    <TouchableOpacity
      style={sharedStyles.headerLeft}
      onPress={() => {
        navigation.navigate(navigateTo);
      }}>
      <View>{display}</View>
    </TouchableOpacity>
  );
}
