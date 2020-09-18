import React, {Component} from 'react';
import {Button, View, Text, TextInput, Alert} from 'react-native';
import {emailRegex, oathClient} from '../constants/constants';
import {firebaseAuth, LogIn, isUserSignedIn} from '../constants/firebaseConfig';
import {throwStatement} from '@babel/types';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
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
      errorMessage: '',
    };
  }

  // componentDidMount() {
  //
  // this.loginListener = this.props.navigation.addListener('didFocus', () =>
  //   this.displayLogStatusText(),
  // );
  // this.displayLogStatusText();
  //}

  // componentWillUnmount() {
  //   this.loginListener.remove();
  // }

  signUserIn = () => {
    LogIn(this.state.email, this.state.password)
      .then(() => {
        this.props.navigation.navigate('AuthLoading');
      })
      .catch(error => this.displaySignAttemptError(error.message));
  };

  displaySignAttemptError = error => {
    Alert.alert('Login attempt faied!', error);
    this.setState({errorMessage: error});
  };

  displayLogStatusText = () => {
    let user = firebaseAuth.currentUser;
    if (user) {
      this.setState({topText: 'Account Signed In'});
    } else {
      return this.setState({topText: 'Account not signed in'});
    }
  };

  onChangeText = (text, field) => {
    this.setState({
      [field]: text,
    });
  };

  confirmLogin = () => {
    if (!emailRegex.test(this.state.email)) {
      Alert.alert('Validation Error', 'Email address is not valid!');
      this.setState({errorMessage: 'Email address is not valid!'});
    } else {
      this.signUserIn();
    }
  };

  // devButtonPressed = () => {
  //   this.setState(
  //     {
  //       email: 'tchanias@gmail.com',
  //       password: '123456',
  //       errorMessage: '',
  //     },
  //     () => {
  //       this.confirmLogin();
  //     },
  //   );
  // };

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
        <Text>Login Screen</Text>
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
        </View>
        <View style={(styles.row, styles.buttonRow)}>
          <Button title={'Confirm'} onPress={() => this.confirmLogin()} />
          {/* <Button title={'Dev Login'} onPress={() => this.devButtonPressed()} /> */}
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
          <Text>New user? </Text>
          <Text
            style={styles.hyperLink}
            onPress={() => this.props.navigation.navigate('Register')}>
            Create a new account here
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
    flexBasis: '30%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 30,
    borderColor: 'gray',
    borderWidth: 1,
    fontSize: 8,
  },
  redirectToLoginView: {
    flexDirection: 'row',
  },
  errorText: {
    color: 'red',
    fontSize: 8,
  },
};
