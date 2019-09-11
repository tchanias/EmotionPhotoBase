import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {
  firebase,
  firebaseAuth,
  isUserSignedIn,
} from '../constants/firebaseConfig';

export default class Loading extends React.Component {
  componentDidMount() {
    if (isUserSignedIn()) {
      this.props.navigation.navigate('Detector');
    } else {
      this.props.navigation.navigate('Home');
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Loading</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
