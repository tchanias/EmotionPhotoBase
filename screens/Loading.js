import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import {
  firebase,
  firebaseAuth,
  isUserSignedIn,
  app,
} from '../constants/firebaseConfig';

export default class Loading extends React.Component {
  componentDidMount() {
    this.loadingListener = this.props.navigation.addListener('didFocus', () =>
      this.redirectBasedOnLogStatus(),
    );
    this.redirectBasedOnLogStatus();
  }

  redirectBasedOnLogStatus = () => {
    try {
      firebaseAuth.onAuthStateChanged(user => {
        if (user) {
          this.props.navigation.navigate('Detector');
        } else {
          this.props.navigation.navigate('Login');
        }
      });
    } catch (error) {
      Alert.alert('Error Occured!', error);
    }

    // if (isUserSignedIn()) {
    //   this.props.navigation.navigate('Detector');
    // } else {
    //   this.props.navigation.navigate('Home');
    // }
  };

  componentWillUnmount() {
    this.loadingListener.remove();
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
