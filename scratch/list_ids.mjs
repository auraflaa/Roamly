import { db } from './src/lib/firebase-server.js';
import { collection, getDocs } from 'firebase/firestore/lite';

async function listIds() {
  const snap = await getDocs(collection(db, 'community_posts'));
  console.log('Post IDs:', snap.docs.map(d => d.id));
}

listIds();
