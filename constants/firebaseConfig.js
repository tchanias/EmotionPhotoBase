import Firebase from 'firebase';
let config = {
  apiKey: 'AIzaSyDYF4CcZmcXjhK6JvIPdCEDwodB_VPjDvQ',
  authDomain: 'rnfirebXXX-XXXX.firebaseapp.com',
  databaseURL: 'https://emotiondetector-fa95c.firebaseio.com',
  projectId: 'emotiondetector-fa95c',
  storageBucket: 'emotiondetector-fa95c.appspot.com',
  messagingSenderId: 'XXXXXXX',
};
let app = Firebase.initializeApp(config);
export const db = app.database();
