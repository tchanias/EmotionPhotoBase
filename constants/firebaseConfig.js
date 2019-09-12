import Firebase from 'firebase';
let config = {
  apiKey: 'AIzaSyDYF4CcZmcXjhK6JvIPdCEDwodB_VPjDvQ',
  authDomain: 'emotiondetector-fa95c.firebaseapp.com',
  databaseURL: 'https://emotiondetector-fa95c.firebaseio.com',
  projectId: 'emotiondetector-fa95c',
  storageBucket: 'emotiondetector-fa95c.appspot.com',
  messagingSenderId: 'XXXXXXX',
};
export let app = Firebase.initializeApp(config);
export const firebase = app.database();
export const firebaseAuth = app.auth();

export const LogOut = () => {
  return Firebase.auth().signOut();
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
