import React, {Component} from 'react';
import {Button, View, Text, TextInput, Alert} from 'react-native';
import {emailRegex, oathClient} from '../constants/constants';
import {firebaseAuth, CreateUser} from '../constants/firebaseConfig';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-community/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId: oathClient,
});
export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
    };
  }

  addUser = () => {
    CreateUser(this.state.email, this.state.password)
      .then(() => this.props.navigation.navigate('App'))
      .catch(error => this.setState({errorMessage: error.message}));
  };

  onChangeText = (text, field) => {
    this.setState({
      [field]: text,
    });
  };

  confirmRegistration = () => {
    if (!emailRegex.test(this.state.email)) {
      Alert.alert('Validation Error', 'Email address is not valid!');
      this.setState({errorMessage: 'Email address is not valid!'});
    } else if (this.state.password !== this.state.confirmPassword) {
      Alert.alert('Validation Error', 'Password fields do not match!');
      this.setState({errorMessage: 'Password fields do not match!'});
    } else if (this.state.password.length < 6) {
      Alert.alert(
        'Validation Error',
        'Password must be at least 6 characters long!',
      );
      this.setState({
        errorMessage: 'Password must be at least 6 characters long!',
      });
    } else {
      this.addUser();
    }
  };

  onGoogleSignIn = async () => {
    // Get the users ID token
    let idToken = '';
    const google = await GoogleSignin.signIn()
      .then(response => {
        console.log('google sign in response: ', response);
        if (response.idToken) {
          idToken = response.idToken;
        }
      })
      .catch(err => {
        console.log('Could not sign-in to google services! :', err);
        Alert.alert(
          'Could not sign-in to google services!',
          JSON.stringify(err),
        );
      });
    // Create a Google credential with the token
    if (idToken) {
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log('Firebase Google credential: ', googleCredential);
      // Sign-in the user with the credential
      return firebaseAuth.signInWithCredential(googleCredential);
    } else {
      return null;
    }
  };

  onGoogleButtonPress = () => {
    this.onGoogleSignIn()
      .then(response => {
        console.log('Signed in with google: ', response);
        if (response.user) {
          this.props.navigation.navigate('Detector');
          Alert.alert(
            'Log in!',
            `Logged in successfully as ${response.user.displayName ||
              response.user.email} `,
          );
        }
      })
      .catch(err => {
        console.log('firebaseAuth signInWithCredential failed :', err);
      });
  };

  render() {
    return (
      <View style={styles.registrationContainer}>
        <Text>Register Screen</Text>
        {/* <Button
          title="Detect Photo Emotions"
          onPress={() => this.props.navigation.navigate('Detector')}
        /> */}
        <View style={styles.formContainer}>
          <View style={styles.row}>
            <Text style={styles.formLabel} autoCompleteType={'email'}>
              Email:
            </Text>
            <TextInput
              style={styles.inputField}
              onChangeText={text => this.onChangeText(text, 'email')}
              value={this.state.email}
              autoCompleteType={'password'}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.formLabel}>Password:</Text>
            <TextInput
              style={styles.inputField}
              onChangeText={text => this.onChangeText(text, 'password')}
              value={this.state.password}
              autoCompleteType={'password'}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.formLabel}>Confirm Password:</Text>
            <TextInput
              style={styles.inputField}
              onChangeText={text => this.onChangeText(text, 'confirmPassword')}
              value={this.state.confirmPassword}
            />
          </View>
        </View>
        <View style={(styles.row, styles.buttonRow)}>
          <Button
            title={'Confirm'}
            onPress={() => this.confirmRegistration()}
          />
          <Text style={styles.errorText}>{this.state.errorMessage}</Text>
        </View>
        <View style={(styles.row, styles.buttonRow)}>
          <GoogleSigninButton
            style={{width: 192, height: 48}}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={() => this.onGoogleButtonPress()}
          />
        </View>
        <View style={styles.redirectToLoginView}>
          <Text>Already have an account? </Text>
          <Text
            style={styles.hyperLink}
            onPress={() => this.props.navigation.navigate('Login')}>
            Log in here
          </Text>
        </View>
      </View>
    );
  }
}

const styles = {
  registrationContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
  },
  formContainer: {
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginLeft: 10,
    flexBasis: '50%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '30%',
  },
  buttonRow: {
    marginTop: '2%',
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hyperLink: {
    color: 'blue',
  },
  formLabel: {
    flexBasis: '25%',
  },
  inputField: {
    flexBasis: '55%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
  redirectToLoginView: {
    flexDirection: 'row',
  },
  errorText: {
    color: 'red',
    fontSize: 8,
  },
};
