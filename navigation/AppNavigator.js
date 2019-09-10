import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Detector from '../screens/Detector';
import Register from '../screens/Register';
import Login from '../screens/Login';
import Home from '../screens/Home';
import Loading from '../screens/Loading';

const AppNavigator = createStackNavigator({
  Loading,
  Home,
  Detector,
  Register,
  Login,
});
export default createAppContainer(AppNavigator);
