import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Detector from '../screens/Detector';
import Register from '../screens/Register';

import Home from '../screens/Home';

const AppNavigator = createStackNavigator({
  Home,
  Detector,
  Register,
});
export default createAppContainer(AppNavigator);
