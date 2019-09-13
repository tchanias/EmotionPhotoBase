import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Detector from '../screens/Detector';
import Register from '../screens/Register';
import Login from '../screens/Login';
import Home from '../screens/Home';
import Loading from '../screens/Loading';

const AppStack = createStackNavigator(
  {
    Detector,
  },
  {headerBackTitle: null, headerLayoutPreset: 'center', headerLeft: null},
);
const AuthStack = createStackNavigator({Login, Register});
export default createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: Loading,
      App: AppStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    },
  ),
);
