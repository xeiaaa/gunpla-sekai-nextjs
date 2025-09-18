#!/usr/bin/env tsx

import { searchKitsAndMobileSuitsWithMeilisearch } from '../lib/actions/meilisearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testMeilisearchImages() {
  try {
    console.log('🖼️  Testing Meilisearch image data...\n');

    // Test search for kits with images
    console.log('Test 1: Searching for kits with images');
    const results = await searchKitsAndMobileSuitsWithMeilisearch('gundam', {
      timeline: 'all',
      grade: 'all',
      sortBy: 'relevance'
    });

    console.log(`Found ${results.kits.length} kits`);

    // Check first few kits for image data
    results.kits.slice(0, 3).forEach((kit, index) => {
      console.log(`\nKit ${index + 1}: ${kit.name}`);
      console.log(`  Box Art: ${kit.boxArt ? '✅ Has image' : '❌ No image'}`);
      if (kit.boxArt) {
        console.log(`  Image URL: ${kit.boxArt}`);
      }
    });

    // Check mobile suits for image data
    console.log(`\nFound ${results.mobileSuits.length} mobile suits`);
    results.mobileSuits.slice(0, 3).forEach((ms, index) => {
      console.log(`\nMobile Suit ${index + 1}: ${ms.name}`);
      console.log(`  Scraped Images: ${ms.scrapedImages.length > 0 ? `✅ ${ms.scrapedImages.length} images` : '❌ No images'}`);
      if (ms.scrapedImages.length > 0) {
        console.log(`  First Image: ${ms.scrapedImages[0]}`);
      }
    });

    console.log('\n🎉 Image data test completed!');

  } catch (error) {
    console.error('❌ Image data test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testMeilisearchImages();
}
