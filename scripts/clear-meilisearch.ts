#!/usr/bin/env tsx

import { MeiliSearch } from 'meilisearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Meilisearch client
const hostUrl = process.env.MEILI_HOST_URL!.startsWith('http')
  ? process.env.MEILI_HOST_URL!
  : `https://${process.env.MEILI_HOST_URL!}`;

const meilisearch = new MeiliSearch({
  host: hostUrl,
  apiKey: process.env.MEILI_MASTER_KEY!,
});

const INDEXES = [
  'kits',
  'mobile-suits',
  'series',
  'product-lines',
  'grades',
  'users',
  'builds',
  'reviews'
];

async function clearAllIndexes() {
  try {
    console.log('🗑️  Clearing all Meilisearch indexes...');

    // Validate environment variables
    if (!process.env.MEILI_HOST_URL || !process.env.MEILI_MASTER_KEY) {
      throw new Error('Missing required environment variables: MEILI_HOST_URL and MEILI_MASTER_KEY');
    }

    for (const indexName of INDEXES) {
      try {
        await meilisearch.deleteIndex(indexName);
        console.log(`✅ Deleted index: ${indexName}`);
      } catch (error: any) {
        if (error.code === 'index_not_found') {
          console.log(`ℹ️  Index not found: ${indexName}`);
        } else {
          console.error(`❌ Error deleting index ${indexName}:`, error.message);
        }
      }
    }

    console.log('🎉 All indexes cleared successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  clearAllIndexes();
}

export { clearAllIndexes };
