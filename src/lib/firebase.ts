import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize Firebase as a singleton to prevent duplicate apps during development hot-reloads.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Authentication instance for Google and Email/Password sign-ins.
 */
export const auth = getAuth(app);

/**
 * Firestore instance targeting the specific 'talk-with-zeno' database.
 */
export const db = getFirestore(app, "talk-with-zeno");

/**
 * Firebase Storage instance for legacy file handling (Hugging Face Buckets preferred for images).
 */
export const storage = getStorage(app);
export default app;
