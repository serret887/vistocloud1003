// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { browser } from "$app/environment";

// Your web app's Firebase configuration
// Use environment variables if available, otherwise fall back to hardcoded values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDwbWlJlKPu1qKGA8QSkGHEIbUKcxuR8QA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vistocloud.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vistocloud",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vistocloud.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "390001891387",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:390001891387:web:0f1c9f67ba7db87a99e41e"
};

// Initialize Firebase (singleton pattern for SSR compatibility)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Track if emulator is already connected
let emulatorConnected = false;
let firestoreInstance: Firestore | null = null;

// Initialize Firestore and connect to emulator if needed
function initializeFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(app);
    
    // Connect to emulator if in development and not already connected
    if (browser && import.meta.env.DEV && !emulatorConnected) {
      const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
      
      if (useEmulator) {
        const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || 'localhost';
        const emulatorPort = parseInt(import.meta.env.VITE_FIREBASE_EMULATOR_PORT || '8080', 10);
        
        try {
          // CRITICAL: connectFirestoreEmulator must be called immediately after getFirestore
          // and before any Firestore operations
          connectFirestoreEmulator(firestoreInstance, emulatorHost, emulatorPort);
          emulatorConnected = true;
          console.log(`🔥 Connected to Firestore Emulator at ${emulatorHost}:${emulatorPort}`);
          console.log('📝 Environment check:', {
            DEV: import.meta.env.DEV,
            USE_EMULATOR: import.meta.env.VITE_USE_FIREBASE_EMULATOR,
            HOST: emulatorHost,
            PORT: emulatorPort
          });
        } catch (error) {
          // Ignore if already connected
          const errorMessage = (error as Error).message || '';
          if (!errorMessage.includes('has already been called') && !errorMessage.includes('Cannot call connectFirestoreEmulator')) {
            console.warn('⚠️ Firestore emulator connection issue:', error);
          } else {
            emulatorConnected = true;
            console.log('✅ Firestore emulator already connected');
          }
        }
      } else {
        console.log('🌐 Using production Firebase (emulator disabled)');
        console.log('💡 To enable emulator, set VITE_USE_FIREBASE_EMULATOR=true in .env');
      }
    }
  }
  
  return firestoreInstance;
}

// Export Firestore instance - initialized lazily on first access
// This ensures emulator connection happens before any Firestore operations
export const db = initializeFirestore();

// Initialize emulator connection (called from root layout onMount)
export function initFirebaseEmulator() {
  // Initialize Firestore which will connect to emulator if configured
  initializeFirestore();
}

export default app;
