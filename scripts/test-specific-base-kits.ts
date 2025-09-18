#!/usr/bin/env tsx

import { searchKitsAndMobileSuitsWithMeilisearch } from '../lib/actions/meilisearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSpecificBaseKits() {
  try {
    console.log('🎯 Testing Specific Base Kit Searches...\n');

    // Test 1: Search for "metallic" - should find kits with baseKitId
    console.log('Test 1: Searching for "metallic" (should find variants with baseKitId)');
    const metallicResults = await searchKitsAndMobileSuitsWithMeilisearch('metallic', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`Found ${metallicResults.kits.length} kits`);
    metallicResults.kits.forEach((kit, index) => {
      const isBaseKit = !kit.baseKitId;
      console.log(`  ${index + 1}. ${kit.name}`);
      console.log(`     ID: ${kit.id}`);
      console.log(`     Base Kit ID: ${kit.baseKitId || 'null'}`);
      console.log(`     Is Base Kit: ${isBaseKit ? 'YES' : 'NO'}`);
      console.log('');
    });

    // Test 2: Search for "clear" - should find kits with baseKitId
    console.log('\nTest 2: Searching for "clear" (should find variants with baseKitId)');
    const clearResults = await searchKitsAndMobileSuitsWithMeilisearch('clear', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`Found ${clearResults.kits.length} kits`);
    clearResults.kits.forEach((kit, index) => {
      const isBaseKit = !kit.baseKitId;
      console.log(`  ${index + 1}. ${kit.name}`);
      console.log(`     ID: ${kit.id}`);
      console.log(`     Base Kit ID: ${kit.baseKitId || 'null'}`);
      console.log(`     Is Base Kit: ${isBaseKit ? 'YES' : 'NO'}`);
      console.log('');
    });

    // Test 3: Search for specific kit names we know have baseKitId
    console.log('\nTest 3: Searching for specific kits we know have baseKitId');
    const specificResults = await searchKitsAndMobileSuitsWithMeilisearch('Round Box with Gunpla RX-78-2 Gundam', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`Found ${specificResults.kits.length} kits`);
    specificResults.kits.forEach((kit, index) => {
      const isBaseKit = !kit.baseKitId;
      console.log(`  ${index + 1}. ${kit.name}`);
      console.log(`     ID: ${kit.id}`);
      console.log(`     Base Kit ID: ${kit.baseKitId || 'null'}`);
      console.log(`     Is Base Kit: ${isBaseKit ? 'YES' : 'NO'}`);
      console.log('');
    });

    console.log('🎉 Specific base kit test completed!');

  } catch (error) {
    console.error('❌ Specific base kit test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testSpecificBaseKits();
}
