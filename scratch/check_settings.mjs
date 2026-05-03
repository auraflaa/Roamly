import { db } from './src/lib/firebase-server.js';
import { doc, getDoc } from 'firebase/firestore/lite';

async function checkSettings() {
  const snap = await getDoc(doc(db, 'settings', 'homepage'));
  if (snap.exists()) {
    console.log('Homepage settings found:', JSON.stringify(snap.data(), null, 2));
  } else {
    console.log('Homepage settings NOT FOUND in talk-with-zeno database.');
  }
}

checkSettings();
