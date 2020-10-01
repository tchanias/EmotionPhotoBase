import React from 'react';
import {Root} from 'native-base';
import AppNavigator from './navigation/AppNavigator';

export default class App extends React.Component {
  render() {
    return <AppNavigator />;
  }
}
