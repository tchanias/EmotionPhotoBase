import React, {Component} from 'react';
import {Button, View, Text} from 'react-native';
import {db} from '../constants/firebaseConfig';

export default class Home extends Component {
  render() {
    return (
      <View>
        <Text>Home Screen</Text>
        {/* <Button
          title="Detect Photo Emotions"
          onPress={() => this.props.navigation.navigate('Detector')}
        /> */}
        <Button
          title="Register"
          onPress={() => this.props.navigation.navigate('Register')}
        />
        <Button
          title="Login"
          onPress={() => this.props.navigation.navigate('Login')}
        />
      </View>
    );
  }
}
