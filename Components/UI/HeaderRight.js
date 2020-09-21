import React, {useEffect, useRef} from 'react';
import {TouchableOpacity, Text, View, Alert} from 'react-native';
import {sharedStyles} from '../../sharedStyles';
import {firebaseAuth} from '../../constants/firebaseConfig';
import {Icon} from 'native-base';
import {GoogleSignin} from '@react-native-community/google-signin';

export default function HeaderRight(props) {
  const {navigation, setParams} = props;

  const signIn = function() {
    navigation.navigate('AuthLoading');
  };

  const signOut = async () => {
    await signOutGoogle();
    await firebaseAuth
      .signOut()
      .then(() => {
        Alert.alert('', 'inside then');
        navigation.navigate('AuthLoading');
      })
      .catch(function(error) {
        Alert.alert('Error during log out!', error.message);
      });
  };

  const signOutGoogle = async function() {
    try {
      // await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error(error);
    }
  };
  const redirectionLoadParams = function() {
    setParams({
      LogIn: signIn,
      LogOut: signOut,
    });
  };

  let userMail = firebaseAuth.currentUser ? firebaseAuth.currentUser.email : '';
  let userName = userMail ? userMail.substr(0, userMail.indexOf('@')) : '';
  return (
    <TouchableOpacity
      style={sharedStyles.headerRight}
      onPress={() => {
        let user = firebaseAuth.currentUser;
        if (user) {
          signOut();
        } else {
          signIn();
        }
      }}>
      <View>
        {firebaseAuth.currentUser ? (
          <Icon name="log-out-outline" style={sharedStyles.headerIcon} />
        ) : (
          <Icon name="log-in-outline" style={sharedStyles.headerIcon} />
        )}
      </View>
    </TouchableOpacity>
  );
}
