// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
// Use environment variables if available, otherwise fall back to hardcoded values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDwbWlJlKPu1qKGA8QSkGHEIbUKcxuR8QA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "vistocloud.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vistocloud",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vistocloud.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "390001891387",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:390001891387:web:0f1c9f67ba7db87a99e41e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore instance for client usage
export const db = getFirestore(app);

// Connect to Firebase Emulator in development if enabled
// This must be called before any Firestore operations
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
  
  if (useEmulator) {
    const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
    const emulatorPort = parseInt(process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PORT || '8080', 10);
    
    try {
      // Check if we're not already connected (prevents reconnection errors)
      // This check is done by catching the error if connection was already established
      connectFirestoreEmulator(db, emulatorHost, emulatorPort);
      console.log(`🔥 Connected to Firestore Emulator at ${emulatorHost}:${emulatorPort}`);
    } catch (error) {
      // Ignore if already connected (this happens during hot reload in Next.js)
      const errorMessage = (error as Error).message || '';
      if (!errorMessage.includes('has already been called') && !errorMessage.includes('Cannot call connectFirestoreEmulator')) {
        console.warn('Firestore emulator connection issue:', error);
      }
    }
  } else {
    console.log('🌐 Using production Firebase (emulator disabled)');
  }
}

export default app;
