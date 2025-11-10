// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

// Export Firestore instance for client usage
export const db = getFirestore(app);
export default app;
