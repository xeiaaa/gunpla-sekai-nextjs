#!/usr/bin/env tsx

import { searchKitsAndMobileSuitsWithMeilisearch } from '../lib/actions/meilisearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugBaseKitData() {
  try {
    console.log('🔍 Debugging Base Kit Data...\n');

    // Test search to see actual baseKitId values
    const results = await searchKitsAndMobileSuitsWithMeilisearch('gundam', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`Found ${results.kits.length} kits`);
    console.log('\nFirst 10 kits with baseKitId details:');

    results.kits.slice(0, 10).forEach((kit, index) => {
      console.log(`\n${index + 1}. ${kit.name}`);
      console.log(`   ID: ${kit.id}`);
      console.log(`   Base Kit ID: ${kit.baseKitId || 'null'}`);
      console.log(`   Is Base Kit: ${!kit.baseKitId ? 'YES' : 'NO'}`);
    });

    // Let's also check some specific searches that should have variants
    console.log('\n\n🔍 Checking for kits with "metallic" in name...');
    const metallicResults = await searchKitsAndMobileSuitsWithMeilisearch('metallic', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`Found ${metallicResults.kits.length} metallic kits`);
    metallicResults.kits.slice(0, 5).forEach((kit, index) => {
      console.log(`\n${index + 1}. ${kit.name}`);
      console.log(`   ID: ${kit.id}`);
      console.log(`   Base Kit ID: ${kit.baseKitId || 'null'}`);
      console.log(`   Is Base Kit: ${!kit.baseKitId ? 'YES' : 'NO'}`);
    });

    console.log('\n🎉 Base kit data debugging completed!');

  } catch (error) {
    console.error('❌ Base kit data debugging failed:', error);
  }
}

// Run the test
if (require.main === module) {
  debugBaseKitData();
}
