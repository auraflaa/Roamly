'use server';

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a pre-signed URL for uploading a file directly to the Hugging Face Bucket.
 * @param fileName Original name of the file
 * @param fileType MIME type of the file
 */
export async function getUploadUrl(fileName: string, fileType: string, folder: string = 'gems') {
  try {
    const key = `${folder}/${uuidv4()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // URL valid for 60 seconds
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return { signedUrl, key };
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw new Error("Failed to generate upload URL");
  }
}

/**
 * Generates the public read URL for an object in the Hugging Face Bucket.
 * Since the bucket is now PUBLIC, we can use the direct CDN URL.
 */
export async function getFileUrl(key: string) {
  return `https://huggingface.co/buckets/${BUCKET_NAME}/${key}`;
}
