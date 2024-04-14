import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXG5iiLmnqKDvStN3BbYzfv-OihJeFfUg",
  authDomain: "licenta27.firebaseapp.com",
  projectId: "licenta27",
  storageBucket: "licenta27.appspot.com",
  messagingSenderId: "111380781605",
  appId: "1:111380781605:web:5739e53d2b8011c1a97dcc",
  measurementId: "G-7WGT5XTX6W"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();

export { firebase, auth, firestore};