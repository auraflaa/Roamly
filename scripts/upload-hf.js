
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// We are in /scripts/, so we need to go up one level to find /data/ and .env.local
const ROOT_DIR = path.join(__dirname, '..');
const MIGRATION_DIR = path.join(ROOT_DIR, 'data', 'migration');
const ENV_PATH = path.join(ROOT_DIR, '.env.local');

// CONFIGURATION
let HF_TOKEN = process.env.HF_TOKEN;
const HF_OWNER = 'ourafla';
const BUCKET_NAME = 'Roamly';

// Manual .env.local loader (zero dependencies)
if (fs.existsSync(ENV_PATH)) {
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  const match = envContent.match(/^HF_TOKEN=(.*)$/m);
  if (match && match[1]) {
    HF_TOKEN = match[1].trim();
  }
}

if (!HF_TOKEN) {
  console.error('❌ ERROR: HF_TOKEN is missing. Please ensure it is set in .env.local as HF_TOKEN=your_token_here');
  process.exit(1);
}

async function uploadFile(localPath, relativePath) {
  const url = `https://huggingface.co/api/buckets/${HF_OWNER}/${BUCKET_NAME}/upload/${relativePath.replace(/\\/g, '/')}`;
  
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
    });

    if (response.ok) {
      console.log(`✅ Uploaded: ${relativePath}`);
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed: ${relativePath} (${response.status}) - ${errorText}`);
    }
  } catch (error) {
    console.error(`❌ Error uploading ${relativePath}:`, error.message);
  }
}

async function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await walk(fullPath);
    } else {
      const relativePath = path.relative(MIGRATION_DIR, fullPath);
      await uploadFile(fullPath, relativePath);
    }
  }
}

console.log('🚀 Starting Hugging Face Upload (Zero-Dep Mode)...');
if (!fs.existsSync(MIGRATION_DIR)) {
  console.error(`❌ Migration directory not found at: ${MIGRATION_DIR}`);
  process.exit(1);
}

walk(MIGRATION_DIR)
  .then(() => console.log('🏁 Finished uploading all files!'))
  .catch(err => console.error('💥 Fatal error:', err));
