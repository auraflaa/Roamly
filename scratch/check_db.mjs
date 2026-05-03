
import { getFirestore, collection, getCountFromServer } from 'firebase/firestore/lite';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app, "talk-with-zeno");

async function checkCounts() {
  try {
    const gemsCount = await getCountFromServer(collection(db, 'gems'));
    const postsCount = await getCountFromServer(collection(db, 'community_posts'));
    const usersCount = await getCountFromServer(collection(db, 'users'));
    
    console.log('--- FIRESTORE STATUS ---');
    console.log('Gems:', gemsCount.data().count);
    console.log('Community Posts:', postsCount.data().count);
    console.log('Users:', usersCount.data().count);
    console.log('------------------------');
  } catch (err) {
    console.error('Check failed:', err);
  }
}

checkCounts();
