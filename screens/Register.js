import React, {Component} from 'react';
import {View, Text, Alert, ScrollView, ActivityIndicator} from 'react-native';

import {emailRegex, oathClient, screens} from '../constants/constants';
import {firebaseAuth, CreateUser} from '../constants/firebaseConfig';
import Spinner from 'react-native-loading-spinner-overlay';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-community/google-signin';
import auth from '@react-native-firebase/auth';
import Logo from '../Components/UI/Logo';
import {Input, Button, Icon} from 'react-native-elements';
import {sharedStyles, screenWidth} from '../sharedStyles';

GoogleSignin.configure({
  webClientId: oathClient,
  forceCodeForRefreshToken: true,
});
export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      isSigninInProgress: false,
    };
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerStyle: {
        backgroundColor: '#009671',
      },
      headerLeft: (
        <Button
          buttonStyle={[sharedStyles.headerLeft, {backgroundColor: '#009671'}]}
          onPress={() => navigation.navigate(screens.Login)}
          icon={
            <Icon
              name="arrow-back"
              color={'#fff'}
              style={sharedStyles.circleButtonsIcon}
            />
          }
        />
      ),
      headerTitle: <Logo />,
      headerRight: null,
    };
  };

  addUser = () => {
    CreateUser(this.state.email, this.state.password)
      .then(() => {
        this.setState({isSigninInProgress: false}, () =>
          this.props.navigation.navigate('App'),
        );
      })
      .catch(error => {
        Alert.alert(
          'REgistration error!',
          'There was a problem registering the user.',
        );
        this.setState({errorMessage: error.message, isSigninInProgress: false});
      });
  };

  onChangeText = (text, field) => {
    this.setState({
      [field]: text,
      errorMessage: '',
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
      this.setState({isSigninInProgress: true}, () => this.addUser());
    }
  };

  onGoogleSignIn = async () => {
    // Get the users ID token
    await GoogleSignin.hasPlayServices();
    let idToken = '';
    const google = await GoogleSignin.signIn()
      .then(response => {
        console.log('sign in response: ', response);
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
      // Sign-in the user with the credential
      return firebaseAuth.signInWithCredential(googleCredential);
    } else {
      return null;
    }
  };

  onGoogleButtonPress = () => {
    this.setState({isSigninInProgress: true}, () => {
      if (GoogleSignin.isSignedIn()) {
        GoogleSignin.signOut();
      }
      this.onGoogleSignIn()
        .then(response => {
          console.log('repsonse: ', response);
          if (response && response.user) {
            this.props.navigation.navigate('Detector');
            Alert.alert(
              'Log in!',
              `Logged in successfully as ${response.user.displayName ||
                response.user.email} `,
            );
          } else {
            Alert.alert(
              'Log in!',
              `Logged in service failed. Please try again. `,
            );
          }
          this.setState({isSigninInProgress: false});
        })
        .catch(err => {
          this.setState({isSigninInProgress: false});
          console.log('firebaseAuth signInWithCredential failed :', err);
        });
    });
  };

  render() {
    const {isSigninInProgress} = this.state;
    return (
      <>
        <Spinner
          visible={isSigninInProgress}
          textContent={'Loading...'}
          textStyle={{color: sharedStyles.textColor}}
        />
        <View style={styles.registrationContainer}>
          <ScrollView contentContainerStyle={styles.formContainer}>
            <View style={styles.Inputs}>
              <Input
                placeholder="Email"
                style={styles.input}
                leftIcon={<Icon name="mail" size={24} color="white" />}
                // style={styles.inputField}
                onChangeText={text => this.onChangeText(text, 'email')}
                value={this.state.email}
                autoCompleteType={'password'}
              />
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
              <Input
                placeholder="Confirm Password"
                style={styles.input}
                leftIcon={<Icon name="lock" size={24} color="white" />}
                secureTextEntry={true}
                // style={styles.inputField}
                onChangeText={text =>
                  this.onChangeText(text, 'confirmPassword')
                }
                value={this.state.confirmPassword}
                autoCompleteType={'password'}
              />
              <Text style={styles.errorText}>{this.state.errorMessage}</Text>
            </View>

            <View style={(styles.row, styles.buttonRow)}>
              <Button
                buttonStyle={styles.actionButtons}
                onPress={() => this.confirmRegistration()}
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
            </View>
          </ScrollView>
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
    marginTop: 50,
    // backgroundColor: 'yellow',

    // marginLeft: 10,
    flexBasis: '80%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '30%',
  },
  Inputs: {
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screenWidth,
    // backgroundColor: 'purple',
    flexBasis: '40%',
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
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
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
