import React, {Component} from 'react';
import {Button, View, Text, TextInput, Alert} from 'react-native';
import {emailRegex} from '../constants/constants';
import {firebaseAuth, LogIn} from '../constants/firebaseConfig';

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

  SignIn = () => {
    LogIn(this.state.email, this.state.password)
      .then(() => this.props.navigation.navigate('Main'))
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
