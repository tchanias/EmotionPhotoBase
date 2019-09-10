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
    };
  }

  onChangeText = (text, field) => {
    this.setState({
      [field]: text,
    });
  };

  render() {
    return (
      <View>
        <Text>Register Screen</Text>
        {/* <Button
          title="Detect Photo Emotions"
          onPress={() => this.props.navigation.navigate('Detector')}
        /> */}
        <View>
          <View style={styles.row}>
            <Text>Email:</Text>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={text => this.onChangeText(text, 'email')}
              value={this.state.email}
            />
          </View>
          <View style={styles.row}>
            <Text>Password:</Text>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={text => this.onChangeText(text, 'password')}
              value={this.state.password}
            />
          </View>
          <View style={styles.row}>
            <Text>Confirm Password:</Text>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={text => this.onChangeText(text, 'confirmPassword')}
              value={this.state.confirmPassword}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = {
  row: {
    flexDirection: 'row',
  },
};
