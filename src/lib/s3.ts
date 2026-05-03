import { S3Client } from "@aws-sdk/client-s3";

if (typeof window === 'undefined' && !process.env.HF_TOKEN) {
  throw new Error("HF_TOKEN is missing in environment variables. Please check your .env.local file.");
}

/**
 * Hugging Face Buckets are S3-compatible.
 * Endpoint format: https://huggingface.co/api/buckets/OWNER/BUCKET_NAME
 * We use the base S3 client but point it to HF.
 * Hugging Face S3-compatible storage configuration
 * Bucket: your-username
 * Path: project-name
 */
export const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: "https://s3.huggingface.co", 
  forcePathStyle: true,
  credentials: {
    accessKeyId: "hf", 
    secretAccessKey: process.env.HF_TOKEN || "", 
  },
});

export const HF_OWNER = "ourafla";
export const BUCKET_NAME = "Roamly"; // Repository name
export const BUCKET_URL = `https://huggingface.co/buckets/${HF_OWNER}/${BUCKET_NAME}`;
