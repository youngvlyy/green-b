// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPRaMwN6hG9M7iPtWq-gSZ1DG6fY-EBPw",
  authDomain: "green-b.firebaseapp.com",
  projectId: "green-b",
  storageBucket: "green-b.firebasestorage.app",
  messagingSenderId: "198390077024",
  appId: "1:198390077024:web:57d1da98476706f22d1505",
  measurementId: "G-2ZS8WTBGPE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
