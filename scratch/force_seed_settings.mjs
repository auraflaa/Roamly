import { seedHomepageSettings } from './src/lib/seed.js';

async function runSeed() {
  const result = await seedHomepageSettings();
  console.log('Seed result:', JSON.stringify(result, null, 2));
}

runSeed();
