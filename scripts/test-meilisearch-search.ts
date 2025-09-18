#!/usr/bin/env tsx

import { searchKitsAndMobileSuitsWithMeilisearch, getSearchSuggestionsWithMeilisearch } from '../lib/actions/meilisearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testMeilisearchSearch() {
  try {
    console.log('🔍 Testing Meilisearch search functionality...\n');

    // Test 1: Basic search
    console.log('Test 1: Basic search for "gundam"');
    const basicResults = await searchKitsAndMobileSuitsWithMeilisearch('gundam', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`✅ Found ${basicResults.totalKits} kits and ${basicResults.totalMobileSuits} mobile suits`);
    console.log(`   Kits: ${basicResults.kits.length} displayed`);
    console.log(`   Mobile Suits: ${basicResults.mobileSuits.length} displayed`);

    if (basicResults.kits.length > 0) {
      console.log(`   First kit: ${basicResults.kits[0].name}`);
    }
    if (basicResults.mobileSuits.length > 0) {
      console.log(`   First mobile suit: ${basicResults.mobileSuits[0].name}`);
    }

    // Test 2: Filtered search
    console.log('\nTest 2: Filtered search for "rx-78" with HG grade filter');
    const filteredResults = await searchKitsAndMobileSuitsWithMeilisearch('rx-78', {
      timeline: 'all',
      grade: 'hg',
      sortBy: 'name-asc'
    });

    console.log(`✅ Found ${filteredResults.totalKits} kits with HG grade filter`);
    if (filteredResults.kits.length > 0) {
      console.log(`   First result: ${filteredResults.kits[0].name} (${filteredResults.kits[0].grade})`);
    }

    // Test 3: Search suggestions
    console.log('\nTest 3: Search suggestions for "wing"');
    const suggestions = await getSearchSuggestionsWithMeilisearch('wing');
    console.log(`✅ Found ${suggestions.length} suggestions:`, suggestions);

    // Test 4: Empty query
    console.log('\nTest 4: Empty query');
    const emptyResults = await searchKitsAndMobileSuitsWithMeilisearch('', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });
    console.log(`✅ Empty query returned ${emptyResults.totalKits} kits and ${emptyResults.totalMobileSuits} mobile suits`);

    console.log('\n🎉 All Meilisearch search tests passed!');

  } catch (error) {
    console.error('❌ Meilisearch search test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testMeilisearchSearch();
}
