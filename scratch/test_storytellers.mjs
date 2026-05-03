
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

async function getTopStorytellers() {
    try {
      const postsCol = collection(db, 'community_posts');
      const q = query(postsCol, limit(20));
      const snap = await getDocs(q);
      console.log("Found posts:", snap.size);
      
      const authorMap = new Map();
      snap.docs.forEach(doc => {
        const data = doc.data();
        const authorId = data.authorId;
        if (!authorId) return;

        if (!authorMap.has(authorId)) {
          authorMap.set(authorId, {
            id: authorId,
            name: data.authorName || 'Traveler',
            photo: data.authorPhoto || '',
            likes: 0,
            postCount: 0
          });
        }
        const stats = authorMap.get(authorId);
        stats.likes += (data.likes || 0);
        stats.postCount += 1;
      });

      const storytellers = Array.from(authorMap.values())
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 5);
        
      return storytellers;
    } catch (err) {
      console.error("Error fetching top storytellers:", err);
      return [];
    }
}

async function main() {
  const results = await getTopStorytellers();
  console.log("Results:", JSON.stringify(results, null, 2));
}

main();
