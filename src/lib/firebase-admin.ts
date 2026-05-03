import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

let initialized = false;

export function initFirebaseAdmin() {
  if (initialized) return admin;

  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    // Not fatal — many dev environments will not set this.
    // Server-side uploads will be disabled when admin is not configured.
    return null as unknown as typeof admin;
  }

  const serviceAccount = typeof key === 'string' ? JSON.parse(key) : key;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
  });

  initialized = true;
  return admin;
}

export async function uploadBufferToStorage(buffer: Buffer, destPath: string, contentType = 'image/webp') {
  const adm = initFirebaseAdmin();
  if (!adm) throw new Error('Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT_KEY missing)');

  const bucket = adm.storage().bucket();
  const file = bucket.file(destPath);
  const token = uuidv4();

  await file.save(buffer, {
    metadata: {
      contentType,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
    public: false,
  });

  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destPath)}?alt=media&token=${token}`;
  return publicUrl;
}
