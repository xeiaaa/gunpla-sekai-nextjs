#!/usr/bin/env tsx

import { MeiliSearch } from 'meilisearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugMeilisearchBaseKit() {
  try {
    console.log('🔍 Debugging Meilisearch Base Kit Data...\n');

    // Initialize Meilisearch client
    const hostUrl = process.env.MEILI_HOST_URL?.startsWith('http')
      ? process.env.MEILI_HOST_URL
      : `https://${process.env.MEILI_HOST_URL}`;

    if (!hostUrl || !process.env.MEILI_MASTER_KEY) {
      throw new Error('Missing required environment variables: MEILI_HOST_URL and MEILI_MASTER_KEY');
    }

    const meilisearch = new MeiliSearch({
      host: hostUrl,
      apiKey: process.env.MEILI_MASTER_KEY,
    });

    // Test 1: Search for metallic kits and check baseKitId field
    console.log('Test 1: Direct Meilisearch query for "metallic"');
    const metallicResults = await meilisearch.index('kits').search('metallic', {
      limit: 3,
      attributesToRetrieve: [
        'id',
        'name',
        'number',
        'baseKitId'
      ]
    });

    console.log(`Found ${metallicResults.hits.length} kits`);
    metallicResults.hits.forEach((kit: any, index) => {
      console.log(`\n${index + 1}. ${kit.name}`);
      console.log(`   ID: ${kit.id}`);
      console.log(`   Number: ${kit.number}`);
      console.log(`   Base Kit ID: ${kit.baseKitId || 'null'}`);
      console.log(`   Base Kit ID Type: ${typeof kit.baseKitId}`);
    });

    // Test 2: Search for a specific kit we know has baseKitId
    console.log('\n\nTest 2: Direct Meilisearch query for specific kit');
    const specificResults = await meilisearch.index('kits').search('Round Box with Gunpla RX-78-2 Gundam Metallic', {
      limit: 3,
      attributesToRetrieve: [
        'id',
        'name',
        'number',
        'baseKitId'
      ]
    });

    console.log(`Found ${specificResults.hits.length} kits`);
    specificResults.hits.forEach((kit: any, index) => {
      console.log(`\n${index + 1}. ${kit.name}`);
      console.log(`   ID: ${kit.id}`);
      console.log(`   Number: ${kit.number}`);
      console.log(`   Base Kit ID: ${kit.baseKitId || 'null'}`);
      console.log(`   Base Kit ID Type: ${typeof kit.baseKitId}`);
    });

    // Test 3: Get all attributes for one kit to see what's available
    console.log('\n\nTest 3: Get all attributes for one kit');
    const allAttributesResults = await meilisearch.index('kits').search('metallic', {
      limit: 1,
      attributesToRetrieve: ['*'] // Get all attributes
    });

    if (allAttributesResults.hits.length > 0) {
      const kit = allAttributesResults.hits[0] as any;
      console.log(`Kit: ${kit.name}`);
      console.log('Available attributes:');
      Object.keys(kit).forEach(key => {
        console.log(`  ${key}: ${kit[key]} (${typeof kit[key]})`);
      });
    }

    console.log('\n🎉 Meilisearch base kit debugging completed!');

  } catch (error) {
    console.error('❌ Meilisearch base kit debugging failed:', error);
  }
}

// Run the debug
if (require.main === module) {
  debugMeilisearchBaseKit();
}
