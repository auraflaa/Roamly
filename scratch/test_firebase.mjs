
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, initializeFirestore, memoryLocalCache } from 'firebase/firestore';
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

async function testDb(dbName) {
  console.log(`Testing database: ${dbName || '(default)'}...`);
  try {
    const db = dbName 
      ? initializeFirestore(app, { localCache: memoryLocalCache() }, dbName)
      : getFirestore(app);
      
    const snap = await getDocs(collection(db, 'community_posts'));
    console.log(`Successfully connected to ${dbName || '(default)'}. Found ${snap.size} posts.`);
    return true;
  } catch (err) {
    console.error(`Failed to connect to ${dbName || '(default)'}:`, err.message);
    return false;
  }
}

async function main() {
  console.log("Config:", JSON.stringify(firebaseConfig, null, 2));
  const defaultOk = await testDb();
  const zenoOk = await testDb('talk-with-zeno');
  
  if (!defaultOk && !zenoOk) {
    console.log('\nCould not connect to either database. Please check your project ID and ensure a database is created.');
  }
}

main();
