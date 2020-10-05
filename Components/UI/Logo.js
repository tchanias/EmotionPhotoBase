import React from 'react';
import {Image} from 'react-native';

export default function Logo() {
  return (
    <Image
      style={{width: 220, height: 50}}
      source={require('../../logo.png')}
    />
  );
}
