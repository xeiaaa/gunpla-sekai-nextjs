#!/usr/bin/env tsx

import { searchKitsAndMobileSuitsWithMeilisearch } from '../lib/actions/meilisearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testBaseKitPrioritization() {
  try {
    console.log('🎯 Testing Base Kit Prioritization...\n');

    // Test 1: General search should prioritize base kits
    console.log('Test 1: General search for "gundam" (should prioritize base kits)');
    const generalResults = await searchKitsAndMobileSuitsWithMeilisearch('gundam', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`Found ${generalResults.kits.length} kits`);
    generalResults.kits.slice(0, 5).forEach((kit, index) => {
      const isBaseKit = !kit.baseKitId;
      console.log(`  ${index + 1}. ${kit.name} ${isBaseKit ? '✅ (Base Kit)' : '🔄 (Variant)'}`);
    });

    // Test 2: Variant search should show variants
    console.log('\nTest 2: Variant search for "metallic" (should show variants)');
    const variantResults = await searchKitsAndMobileSuitsWithMeilisearch('metallic', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`Found ${variantResults.kits.length} kits`);
    variantResults.kits.slice(0, 5).forEach((kit, index) => {
      const isBaseKit = !kit.baseKitId;
      console.log(`  ${index + 1}. ${kit.name} ${isBaseKit ? '✅ (Base Kit)' : '🔄 (Variant)'}`);
    });

    // Test 3: Clear version search
    console.log('\nTest 3: Clear version search for "clear" (should show variants)');
    const clearResults = await searchKitsAndMobileSuitsWithMeilisearch('clear', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`Found ${clearResults.kits.length} kits`);
    clearResults.kits.slice(0, 5).forEach((kit, index) => {
      const isBaseKit = !kit.baseKitId;
      console.log(`  ${index + 1}. ${kit.name} ${isBaseKit ? '✅ (Base Kit)' : '🔄 (Variant)'}`);
    });

    // Test 4: RX-78 search (should prioritize base RX-78 kits)
    console.log('\nTest 4: RX-78 search (should prioritize base RX-78 kits)');
    const rx78Results = await searchKitsAndMobileSuitsWithMeilisearch('rx-78', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`Found ${rx78Results.kits.length} kits`);
    rx78Results.kits.slice(0, 5).forEach((kit, index) => {
      const isBaseKit = !kit.baseKitId;
      console.log(`  ${index + 1}. ${kit.name} ${isBaseKit ? '✅ (Base Kit)' : '🔄 (Variant)'}`);
    });

    console.log('\n🎉 Base kit prioritization test completed!');

  } catch (error) {
    console.error('❌ Base kit prioritization test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testBaseKitPrioritization();
}
