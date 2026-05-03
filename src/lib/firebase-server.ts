import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
} from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Singleton App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const DB_NAME = "talk-with-zeno";

/**
 * Server-only Firestore instance using the Lite SDK.
 * This avoids gRPC streaming issues in Server Actions and SSR.
 */
function getServerFirestore() {
  try {
    return initializeFirestore(app, {}, DB_NAME);
  } catch (e) {
    return getFirestore(app, DB_NAME);
  }
}

export const db = getServerFirestore();
