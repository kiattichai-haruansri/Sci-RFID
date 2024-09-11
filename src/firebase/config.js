// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjuDczKiNfD6hbYSVR3urb5k6EXOI71ZE",
  authDomain: "sci-project-0.firebaseapp.com",
  projectId: "sci-project-0",
  storageBucket: "sci-project-0.appspot.com",
  messagingSenderId: "1099436826989",
  appId: "1:1099436826989:web:f9bcda0c32d7b4f73c7a64",
  measurementId: "G-6K8131LJQ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);