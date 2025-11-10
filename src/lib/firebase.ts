// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwbWlJlKPu1qKGA8QSkGHEIbUKcxuR8QA",
  authDomain: "vistocloud.firebaseapp.com",
  projectId: "vistocloud",
  storageBucket: "vistocloud.firebasestorage.app",
  messagingSenderId: "390001891387",
  appId: "1:390001891387:web:0f1c9f67ba7db87a99e41e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
