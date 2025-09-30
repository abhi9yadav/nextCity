// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const {getAuth} = "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXUR6hIHLF5SOnx7G_1PyLXwEtSYPpH7s",
  authDomain: "nextcity-3e5ee.firebaseapp.com",
  projectId: "nextcity-3e5ee",
  storageBucket: "nextcity-3e5ee.firebasestorage.app",
  messagingSenderId: "923652970101",
  appId: "1:923652970101:web:9aa0e4aacdea087fc74a3c",
  measurementId: "G-X859KQ81LX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);