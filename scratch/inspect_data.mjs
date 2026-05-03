
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const DB_NAME = "talk-with-zeno";
const db = initializeFirestore(app, { localCache: memoryLocalCache() }, DB_NAME);

async function main() {
  const q = query(collection(db, 'community_posts'), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    console.log("No posts found in community_posts");
  } else {
    console.log("Post data:", JSON.stringify(snap.docs[0].data(), null, 2));
  }
}

main();
