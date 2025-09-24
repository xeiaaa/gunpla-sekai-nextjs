#!/usr/bin/env tsx

import { MeiliSearch } from "meilisearch";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

function getMeilisearchClient() {
  const hostUrl = process.env.MEILI_HOST_URL?.startsWith("http")
    ? process.env.MEILI_HOST_URL
    : `https://${process.env.MEILI_HOST_URL}`;

  if (!hostUrl || !process.env.MEILI_MASTER_KEY) {
    throw new Error(
      "Missing required environment variables: MEILI_HOST_URL and MEILI_MASTER_KEY"
    );
  }

  return new MeiliSearch({
    host: hostUrl,
    apiKey: process.env.MEILI_MASTER_KEY,
  });
}

async function testMeilisearchSearch(searchTerm: string) {
  try {
    console.log("🔍 Testing Meilisearch search functionality...\n");
    const meilisearch = getMeilisearchClient();

    // Test 1: Basic search
    console.log(`Test: Basic search for "${searchTerm}"`);
    const results = await meilisearch.index("kits").search(searchTerm, {});

    console.log(results.hits.map((hit: any) => hit.name + " - " + hit.slug));
  } catch (error) {
    console.error("❌ Meilisearch search test failed:", error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  const init = async () => {
    console.log("----- START ----");
    await testMeilisearchSearch("pg unicorn");
    await testMeilisearchSearch("unicorn pg");
    console.log("----- END ----");
  };
  init();
}
