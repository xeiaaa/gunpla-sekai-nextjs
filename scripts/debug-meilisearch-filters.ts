#!/usr/bin/env tsx

import { MeiliSearch } from 'meilisearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugMeilisearchFilters() {
  try {
    console.log('🔍 Debugging Meilisearch filters...\n');

    const hostUrl = process.env.MEILI_HOST_URL!.startsWith('http')
      ? process.env.MEILI_HOST_URL!
      : `https://${process.env.MEILI_HOST_URL!}`;

    const meilisearch = new MeiliSearch({
      host: hostUrl,
      apiKey: process.env.MEILI_MASTER_KEY!,
    });

    // Test 1: Check a few kit documents to see the structure
    console.log('Test 1: Sample kit documents');
    const sampleKits = await meilisearch.index('kits').search('gundam', {
      limit: 2,
      attributesToRetrieve: ['id', 'name', 'productLine', 'series']
    });

    console.log('Sample kit structure:');
    sampleKits.hits.forEach((kit: any, index: number) => {
      console.log(`Kit ${index + 1}:`, {
        id: kit.id,
        name: kit.name,
        productLine: kit.productLine,
        series: kit.series
      });
    });

    // Test 2: Check grade filter options
    console.log('\nTest 2: Available grade filters');
    const gradeTest = await meilisearch.index('kits').search('', {
      limit: 10,
      attributesToRetrieve: ['productLine.grade.id', 'productLine.grade.name', 'productLine.grade.slug']
    });

    const uniqueGrades = new Set();
    gradeTest.hits.forEach((kit: any) => {
      if (kit.productLine?.grade) {
        uniqueGrades.add(JSON.stringify(kit.productLine.grade));
      }
    });

    console.log('Available grades:');
    Array.from(uniqueGrades).forEach(grade => {
      console.log('  ', JSON.parse(grade as string));
    });

    // Test 3: Test different filter formats
    console.log('\nTest 3: Testing different filter formats for HG grade');

    const filterTests = [
      'productLine.grade.slug = "hg"',
      'productLine.grade.id = "hg"',
      'productLine.grade.name = "HG"',
      'productLine.grade.name = "High Grade"'
    ];

    for (const filter of filterTests) {
      try {
        const result = await meilisearch.index('kits').search('gundam', {
          filter: filter,
          limit: 3,
          attributesToRetrieve: ['name', 'productLine.grade.name']
        });
        console.log(`Filter "${filter}": ${result.estimatedTotalHits} results`);
        if (result.hits.length > 0) {
          console.log(`  First result: ${result.hits[0].name} (${result.hits[0].productLine?.grade?.name})`);
        }
      } catch (error: any) {
        console.log(`Filter "${filter}": Error - ${error.message}`);
      }
    }

    console.log('\n🎉 Filter debugging completed!');

  } catch (error) {
    console.error('❌ Filter debugging failed:', error);
  }
}

// Run the script
if (require.main === module) {
  debugMeilisearchFilters();
}
