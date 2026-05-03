import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  Firestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  memoryLocalCache
} from 'firebase/firestore';

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

// 1. Initialize App (Singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth (Singleton)
export const auth = getAuth(app);

// 3. Initialize Firestore (SSR-Aware Hardened Singleton)
const isClient = typeof window !== 'undefined';
const DB_NAME = "talk-with-zeno";

/**
 * Creates or retrieves the Firestore instance for the specified database.
 * Uses persistent local cache on the client and memory cache on the server.
 * Enforces long polling to stabilize connections in restricted networks.
 */
function getHardenedFirestore(): Firestore {
  try {
    // Attempt to initialize with our specific hardening settings
    return initializeFirestore(app, {
      localCache: isClient 
        ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        : memoryLocalCache(),
      experimentalForceLongPolling: true,
    }, DB_NAME);
  } catch (e) {
    // If already initialized (common in dev/HMR), get the existing instance
    return getFirestore(app, DB_NAME);
  }
}

export const db = getHardenedFirestore();
export { app };
export default app;
