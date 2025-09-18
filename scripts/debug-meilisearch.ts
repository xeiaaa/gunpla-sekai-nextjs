#!/usr/bin/env tsx

import { MeiliSearch } from 'meilisearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugMeilisearch() {
  try {
    console.log('🔍 Debugging Meilisearch connection...');
    console.log('MEILI_HOST_URL:', process.env.MEILI_HOST_URL);
    console.log('MEILI_MASTER_KEY length:', process.env.MEILI_MASTER_KEY?.length);
    console.log('MEILI_MASTER_KEY starts with:', process.env.MEILI_MASTER_KEY?.substring(0, 10) + '...');

    // Initialize Meilisearch client
    const hostUrl = process.env.MEILI_HOST_URL!.startsWith('http')
      ? process.env.MEILI_HOST_URL!
      : `https://${process.env.MEILI_HOST_URL!}`;

    const meilisearch = new MeiliSearch({
      host: hostUrl,
      apiKey: process.env.MEILI_MASTER_KEY!,
    });

    console.log('Client initialized with host:', hostUrl);

    console.log('\n📡 Testing connection...');

    // Try to get health status
    const health = await meilisearch.health();
    console.log('✅ Health check passed:', health);

    // Try to get stats
    const stats = await meilisearch.getStats();
    console.log('✅ Stats check passed:', stats);

    // Try to list indexes
    const indexes = await meilisearch.getIndexes();
    console.log('✅ Indexes list:', indexes);

    console.log('\n🎉 Meilisearch connection is working!');

  } catch (error: any) {
    console.error('❌ Meilisearch connection failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error type:', error.type);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response statusText:', error.response.statusText);
    }
  }
}

// Run the script
if (require.main === module) {
  debugMeilisearch();
}
