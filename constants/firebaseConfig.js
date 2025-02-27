import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
// import '@firebase/firestore';
let config = {
  apiKey: 'AIzaSyDYF4CcZmcXjhK6JvIPdCEDwodB_VPjDvQ',
  authDomain: 'emotiondetector-fa95c.firebaseapp.com',
  databaseURL: 'https://emotiondetector-fa95c.firebaseio.com',
  projectId: 'emotiondetector-fa95c',
  storageBucket: 'emotiondetector-fa95c.appspot.com',
  messagingSenderId: 'XXXXXXX',
};
// export let app = firebase.initializeApp(config);
// export const firestore = app.firestore();
export const firebaseAuth = auth();

export const LogOut = () => {
  return firebase.auth().signOut();
};

export const LogIn = (email, password) => {
  return firebaseAuth.signInWithEmailAndPassword(email, password);
};

export const CreateUser = (email, password) => {
  return firebaseAuth.createUserWithEmailAndPassword(email, password);
};

export const getCurrentUser = () => {
  return firebaseAuth.currentUser;
};

export const isUserSignedIn = () => {
  return firebaseAuth.onAuthStateChanged(user => {
    if (user) {
      return true;
    } else {
      return false;
    }
  });
};
