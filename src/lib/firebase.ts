/**
 * @file firebase.ts
 * @description Centralized Firebase SDK initialization for Roamly.
 * Handles Auth, Firestore, and Storage with singleton patterns to support Next.js Fast Refresh.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase Client-Side Configuration.
 * Values are populated from .env.local during development and Vercel Environment Variables in production.
 */
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

// Singleton initialization pattern to prevent "Firebase App already exists" errors during Next.js hot-reloading.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Firebase Authentication instance.
 */
export const auth = getAuth(app);


/**
 * Cloud Firestore database instance.
 * Note: Configured to use the specific "talk-with-zeno" named database.
 * Optimized with long-polling to prevent GrpcConnection ECONNRESET errors.
 * Persistent cache configured for multi-tab support.
 */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  cache: typeof window !== 'undefined' ? persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }) : undefined,
}, "talk-with-zeno");

/**
 * Cloud Storage instance.
 * Primarily used for profile avatars and gem images.
 */
export const storage = getStorage(app);

export default app;
