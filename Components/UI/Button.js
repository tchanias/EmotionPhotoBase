import React from 'react';

import {AppRegistry, Text, View, TouchableHighlight} from 'react-native';

export default function Button(props) {
  const {children, style, onPress} = props;
  return (
    <View>
      <TouchableHighlight
        // underlayColor={'#E8E8E8'}
        onPress={() => onPress()}>
        <View style={style}>{children}</View>
      </TouchableHighlight>
    </View>
  );
}
