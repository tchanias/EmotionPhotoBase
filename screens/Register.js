import React, {Component} from 'react';
import {Button, View, Text, TextInput} from 'react-native';
import {db} from '../constants/firebaseConfig';




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

  addUser = user => {
    db.ref('/users').push({
      email: this.state.email,
      password: this.state.password,
    });
  };

  onChangeText = (text, field) => {
    this.setState({
      [field]: text,
    });
  };

  confirmRegistration=()=>{
    console.log('validation: ', this.state.email, ' ', this.state.password, this.state.confirmPassword)
  }

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
            <Text style={styles.formLabel} autoCompleteType={'email'}>Email:</Text>
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
        <View style={styles.row, styles.buttonRow}>
            <Button title={'Confirm'} onPress={()=>this.confirmRegistration()} />
          </View>
      </View>
    );
  }
}

const styles = {
  registrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 10,
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
  formLabel: {
    flexBasis: '25%',
  },
  inputField: {
    flexBasis: '55%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  }
};
