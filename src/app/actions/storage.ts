'use server';

import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a signed upload URL for Firebase Storage (GCS) using the Admin SDK.
 * Requires `FIREBASE_SERVICE_ACCOUNT_KEY` to be set in the environment.
 */
export async function getUploadUrl(fileName: string, fileType: string, folder: string = 'gems') {
  const adm = initFirebaseAdmin();
  if (!adm) throw new Error('Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT_KEY missing)');

  const bucket = adm.storage().bucket();
  const key = `${folder}/${uuidv4()}-${fileName}`;
  const file = bucket.file(key);

  // Signed URL valid for 60 seconds for upload (PUT)
  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 60 * 1000,
    contentType: fileType,
  } as any);

  return { signedUrl, key };
}

/**
 * Generate a signed read URL for a storage object. Falls back to the public storage URL when admin is not configured.
 */
export async function getFileUrl(key: string) {
  const adm = initFirebaseAdmin();
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!adm || !bucketName) {
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(key)}?alt=media`;
  }

  const bucket = adm.storage().bucket();
  const file = bucket.file(key);
  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  } as any);

  return signedUrl;
}
