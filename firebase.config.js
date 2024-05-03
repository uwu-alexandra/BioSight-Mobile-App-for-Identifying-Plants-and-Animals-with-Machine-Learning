import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import "firebase/compat/storage";

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
const db = firebase.firestore();
const storage = firebase.storage();

// Default credentials (note: hardcoding credentials like this is not recommended for production apps)
//const defaultEmail = "abc@gmail.com";
const defaultEmail = "alexandra.sofronea27@gmail.com";
const defaultPassword = "123456";

// Function to perform default login
function defaultLogin() {
    auth.signInWithEmailAndPassword(defaultEmail, defaultPassword)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('User logged in automatically with default credentials');
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error logging in with default credentials:', errorCode, errorMessage);
        });
}

// Check if the user is already logged in when the app starts
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User is already logged in:', user.email);
  } else {
    console.log('No user is logged in, attempting default login');
    defaultLogin(); // Attempt to log in with default credentials if no user is logged in
  }
});

export { firebase, auth, storage, db };
