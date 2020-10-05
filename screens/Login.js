import React, {Component} from 'react';
import {View, Text, Alert, ScrollView} from 'react-native';
import {emailRegex, oathClient, screens} from '../constants/constants';
import {firebaseAuth, LogIn} from '../constants/firebaseConfig';
import Spinner from 'react-native-loading-spinner-overlay';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-community/google-signin';
import auth from '@react-native-firebase/auth';
import Logo from '../Components/UI/Logo';
import {Input, Button, Icon} from 'react-native-elements';
import {screenWidth, sharedStyles} from '../sharedStyles';
import {Container, Tab, Tabs, TabHeading} from 'native-base';
import Register from './Register';

GoogleSignin.configure({
  webClientId: oathClient,
  forceCodeForRefreshToken: true,
});

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errorMessage: '',
      isSigninInProgress: false,
      activeTab: 0,
    };
  }

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
        this.setState({isSigninInProgress: false}, () =>
          this.props.navigation.navigate('AuthLoading'),
        );
      })
      .catch(error => {
        this.setState({isSigninInProgress: false});
        this.displaySignAttemptError(error.message);
      });
  };

  displaySignAttemptError = error => {
    Alert.alert('Login attempt faied!', error);
    this.setState({errorMessage: error});
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
      this.setState({isSigninInProgress: true}, () => this.signUserIn());
    }
  };

  onGoogleSignIn = async () => {
    // Get the users ID token
    await GoogleSignin.hasPlayServices();
    let idToken = '';
    const google = await GoogleSignin.signIn()
      .then(response => {
        if (response.idToken) {
          idToken = response.idToken;
        }
      })
      .catch(err => {
        console.log('Could not sign-in to google services! :', err);
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

  onChangeTab = value => {
    console.log('tab: ', value.i);
    // this.setState({tab: value});
  };

  render() {
    const {isSigninInProgress, activeTab} = this.state;
    return (
      <>
        <Spinner
          visible={isSigninInProgress}
          textContent={'Loading...'}
          textStyle={{color: sharedStyles.textColor}}
        />
        <Container>
          <Tabs page={activeTab}>
            <Tab
              heading={
                <TabHeading style={styles.tab}>
                  <Text style={styles.tab}>Log in</Text>
                </TabHeading>
              }>
              <View style={styles.registrationContainer}>
                <ScrollView
                  contentContainerStyle={styles.formContainer}
                  nestedScrollEnabled>
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
                    <Text style={styles.errorText}>
                      {this.state.errorMessage}
                    </Text>
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
                    <GoogleSigninButton
                      style={{width: 192, height: 48}}
                      size={GoogleSigninButton.Size.Wide}
                      color={GoogleSigninButton.Color.Dark}
                      onPress={() => this.onGoogleButtonPress()}
                      disabled={isSigninInProgress}
                    />
                  </View>
                </ScrollView>
              </View>
            </Tab>
            <Tab
              heading={
                <TabHeading style={styles.tab}>
                  <Text style={styles.tab}>Register</Text>
                </TabHeading>
              }>
              <Register navigation={this.props.navigation} />
            </Tab>
          </Tabs>
        </Container>
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
    // marginTop: 100,
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
    flexBasis: '80%',
    marginTop: 50,
  },
  Inputs: {
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screenWidth,
    flexBasis: '30%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    marginTop: '5%',
    width: screenWidth,
    justifyContent: 'space-around',
    alignItems: 'center',
    // backgroundColor: 'lime',
    flexBasis: '25%',
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
  tab: {
    backgroundColor: '#00B386',
    color: '#fff',
    fontSize: 16,
  },
};
