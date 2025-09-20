#!/usr/bin/env tsx

import {
  getFilteredKitsWithMeilisearch,
  getFilterDataWithMeilisearch,
} from "../lib/actions/meilisearch-kits";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testKitsPageMeilisearch() {
  try {
    console.log("🔍 Testing Kits Page Meilisearch Implementation...\n");

    // Test 1: Load filter data
    console.log("Test 1: Loading filter data");
    const filterData = await getFilterDataWithMeilisearch();
    console.log(`✅ Loaded filter data:`);
    console.log(`   Grades: ${filterData.grades.length}`);
    console.log(`   Product Lines: ${filterData.productLines.length}`);
    console.log(`   Series: ${filterData.series.length}`);
    console.log(`   Release Types: ${filterData.releaseTypes.length}`);

    // Test 2: Basic search without filters
    console.log(
      '\nTest 2: Basic search for "gundam" (should prioritize base kits)'
    );
    const basicResults = await getFilteredKitsWithMeilisearch({
      searchTerm: "gundam",
      limit: 10,
    });

    console.log(
      `✅ Found ${basicResults.kits.length} kits (total: ${basicResults.total})`
    );
    basicResults.kits.slice(0, 5).forEach((kit, index) => {
      const isBaseKit = !kit.baseKitId;
      console.log(
        `   ${index + 1}. ${kit.name} ${
          isBaseKit ? "✅ (Base Kit)" : "🔄 (Variant)"
        }`
      );
    });

    // Test 3: Variant search
    console.log(
      '\nTest 3: Variant search for "metallic" (should show variants)'
    );
    const variantResults = await getFilteredKitsWithMeilisearch({
      searchTerm: "metallic",
      limit: 10,
    });

    console.log(
      `✅ Found ${variantResults.kits.length} kits (total: ${variantResults.total})`
    );
    variantResults.kits.slice(0, 5).forEach((kit, index) => {
      const isBaseKit = !kit.baseKitId;
      console.log(
        `   ${index + 1}. ${kit.name} ${
          isBaseKit ? "✅ (Base Kit)" : "🔄 (Variant)"
        }`
      );
    });

    // Test 4: Filter by grade
    console.log("\nTest 4: Filter by HG grade");
    const hgGrade = filterData.grades.find((g) =>
      g.name.toLowerCase().includes("high grade")
    );
    if (hgGrade) {
      const gradeResults = await getFilteredKitsWithMeilisearch({
        gradeIds: [hgGrade.id],
        limit: 10,
      });

      console.log(
        `✅ Found ${gradeResults.kits.length} HG kits (total: ${gradeResults.total})`
      );
      gradeResults.kits.slice(0, 3).forEach((kit, index) => {
        console.log(`   ${index + 1}. ${kit.name} (${kit.grade})`);
      });
    } else {
      console.log("❌ Could not find HG grade");
    }

    // Test 5: Filter by product line
    console.log("\nTest 5: Filter by first product line");
    if (filterData.productLines.length > 0) {
      const productLineResults = await getFilteredKitsWithMeilisearch({
        productLineIds: [filterData.productLines[0].id],
        limit: 10,
      });

      console.log(
        `✅ Found ${productLineResults.kits.length} kits in ${filterData.productLines[0].name} (total: ${productLineResults.total})`
      );
      productLineResults.kits.slice(0, 3).forEach((kit, index) => {
        console.log(`   ${index + 1}. ${kit.name} (${kit.productLine})`);
      });
    }

    // Test 6: Sort by name
    console.log("\nTest 6: Sort by name (ascending)");
    const sortedResults = await getFilteredKitsWithMeilisearch({
      searchTerm: "gundam",
      sortBy: "name",
      order: "ascending",
      limit: 10,
    });

    console.log(`✅ Found ${sortedResults.kits.length} kits sorted by name`);
    sortedResults.kits.slice(0, 5).forEach((kit, index) => {
      console.log(`   ${index + 1}. ${kit.name}`);
    });

    // Test 7: Combined filters
    console.log("\nTest 7: Combined search and grade filter");
    if (hgGrade) {
      const combinedResults = await getFilteredKitsWithMeilisearch({
        searchTerm: "rx-78",
        gradeIds: [hgGrade.id],
        limit: 10,
      });

      console.log(
        `✅ Found ${combinedResults.kits.length} RX-78 HG kits (total: ${combinedResults.total})`
      );
      combinedResults.kits.slice(0, 5).forEach((kit, index) => {
        const isBaseKit = !kit.baseKitId;
        console.log(
          `   ${index + 1}. ${kit.name} ${
            isBaseKit ? "✅ (Base Kit)" : "🔄 (Variant)"
          }`
        );
      });
    }

    console.log("\n🎉 Kits page Meilisearch tests completed successfully!");
  } catch (error) {
    console.error("❌ Kits page Meilisearch tests failed:", error);
  }
}

// Run the test
if (require.main === module) {
  testKitsPageMeilisearch();
}
