import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Detector from '../screens/Detector';
import Library from '../screens/Library';
import Register from '../screens/Register';
import Login from '../screens/Login';
import Loading from '../screens/Loading';
import Video from '../screens/Video';

const AppStack = createStackNavigator(
  {
    Detector,
    Library,
    Video,
  },
  {headerBackTitle: null, headerLayoutPreset: 'center', headerLeft: null},
);
const AuthStack = createStackNavigator(
  {Login, Register},
  {headerBackTitle: null, headerLayoutPreset: 'center', headerLeft: null},
);
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
