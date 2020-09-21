import React, {Component} from 'react';
import {View, Text, Alert} from 'react-native';
import {emailRegex, oathClient, screens} from '../constants/constants';
import {firebaseAuth, LogIn} from '../constants/firebaseConfig';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-community/google-signin';
import auth from '@react-native-firebase/auth';
import Logo from '../Components/UI/Logo';
import {Input, Button, Icon} from 'react-native-elements';
import {screenWidth, sharedStyles} from '../sharedStyles';

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

  static navigationOptions = () => {
    return {
      headerStyle: {
        backgroundColor: '#009671',
      },
      headerLeft: null,
      headerTitle: <Logo />,
      headerRight: null,
    };
  };

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
      errorMessage: '',
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
      <>
        <View style={styles.subHeader}>
          <Text style={styles.subHeaderText}>Log in</Text>
        </View>
        <View style={styles.registrationContainer}>
          {/* <Button
          title="Detect Photo Emotions"
          onPress={() => this.props.navigation.navigate('Detector')}
        /> */}
          <View style={styles.formContainer}>
            <View style={styles.Inputs}>
              {/* <Text style={styles.formLabel} autoCompleteType={'email'}>
                Email:
              </Text>
              <TextInput
                style={styles.inputField}
                onChangeText={text => this.onChangeText(text, 'email')}
                value={this.state.email}
                autoCompleteType={'password'}
              /> */}
              <Input
                placeholder="Email"
                style={styles.input}
                leftIcon={<Icon name="mail" size={24} color="white" />}
                // style={styles.inputField}
                onChangeText={text => this.onChangeText(text, 'email')}
                value={this.state.email}
                autoCompleteType={'password'}
              />
              {/* <Text style={styles.formLabel}>Password:</Text>
              <TextInput
                style={styles.inputField}
                onChangeText={text => this.onChangeText(text, 'password')}
                value={this.state.password}
                autoCompleteType={'password'}
              /> */}
              <Input
                placeholder="Password"
                style={styles.input}
                leftIcon={<Icon name="lock" size={24} color="white" />}
                secureTextEntry={true}
                // style={styles.inputField}
                onChangeText={text => this.onChangeText(text, 'password')}
                value={this.state.password}
                autoCompleteType={'password'}
              />
              <Text style={styles.errorText}>{this.state.errorMessage}</Text>
            </View>

            <View style={(styles.row, styles.buttonRow)}>
              <Button
                buttonStyle={styles.actionButtons}
                onPress={this.confirmLogin}
                icon={
                  <Icon
                    name="check"
                    size={24}
                    color="white"
                    style={sharedStyles.circleButtonsIcon}
                  />
                }
                title={'Confirm'}
              />
              {/* <Button title={'Confirm'} onPress={() => this.confirmLogin()} /> */}
              {/* <Button title={'Dev Login'} onPress={() => this.devButtonPressed()} /> */}

              {/* </View>
          <View style={(styles.row, styles.buttonRow)}> */}
              <GoogleSigninButton
                style={{width: 192, height: 48}}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => this.onGoogleButtonPress()}
              />
            </View>
            <View style={styles.redirectToLoginView}>
              <Text style={styles.bottomText}>New user? </Text>
              <Text
                style={styles.hyperLink}
                onPress={() =>
                  this.props.navigation.navigate(screens.Register)
                }>
                Create a new account here
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  }
}

const styles = {
  subHeader: {
    backgroundColor: '#00B386',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  subHeaderText: {
    fontSize: 20,
    color: '#fff',
  },
  registrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    height: '100%',
    backgroundColor: '#373737',
  },
  formContainer: {
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
    // backgroundColor: 'yellow',

    // marginLeft: 10,
    flexBasis: '80%',
  },
  Inputs: {
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screenWidth,
    // backgroundColor: 'purple',
    flexBasis: '40%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    marginTop: '2%',
    width: screenWidth,
    justifyContent: 'space-around',
    alignItems: 'center',
    // backgroundColor: 'lime',
    flexBasis: '30%',
  },
  hyperLink: {
    color: '#009671',
    fontSize: 16,
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
    flexBasis: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  input: {
    color: '#fff',
    // backgroundColo
  },
  actionButtons: {
    color: '#fff',
    backgroundColor: '#009671',
    padding: 12,
    borderRadius: 10,
    minWidth: 160,
    fontSize: 24,
  },
  bottomText: {
    color: '#fff',
    fontSize: 16,
  },
};
