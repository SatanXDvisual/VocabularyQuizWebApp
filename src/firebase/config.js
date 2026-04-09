// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9oEDBjASq-hRnbsht-C5ikCakh0tmDtI",
  authDomain: "vocaquizapp.firebaseapp.com",
  projectId: "vocaquizapp",
  storageBucket: "vocaquizapp.firebasestorage.app",
  messagingSenderId: "589540478297",
  appId: "1:589540478297:web:f76a329cc6353e0b0d1048",
  measurementId: "G-X7BGK1JYSY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);