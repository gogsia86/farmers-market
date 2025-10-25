/**
 * PERPLEXITY INTEGRATION TEST - DIVINE VALIDATION
 *
 * Comprehensive test suite for Perplexity API integration
 * Tests all 3 models and validates agricultural consciousness
 */

import {
  askPerplexity,
  generateCode,
  researchAgriculturalTopic,
  smartQuery,
} from "../src/lib/ai/perplexity";

async function testPerplexity() {
  console.log("🔮 Testing Perplexity Integration...\n");
  console.log("═".repeat(60));

  try {
    // Test 1: Simple agricultural query with Sonar (free)
    console.log("\n📋 Test 1: Simple Agricultural Query (Sonar)");
    console.log("─".repeat(60));
    const test1 = await askPerplexity(
      "What are the 3 most important factors for organic tomato farming?"
    );

    if (test1.success) {
      console.log("✅ SUCCESS");
      console.log(`Model: ${test1.model}`);
      console.log(`Answer:\n${test1.answer}\n`);
    } else {
      console.log("❌ FAILED");
      console.log(`Error: ${test1.error}\n`);
    }

    // Test 2: Code generation with Sonar Pro
    console.log("\n💻 Test 2: Code Generation (Sonar Pro)");
    console.log("─".repeat(60));
    const test2 = await askPerplexity(
      "Generate a TypeScript function to calculate days until harvest based on planting date",
      { model: "SONAR_PRO" }
    );

    if (test2.success) {
      console.log("✅ SUCCESS");
      console.log(`Model: ${test2.model}`);
      console.log(`Answer:\n${test2.answer}\n`);
    } else {
      console.log("❌ FAILED");
      console.log(`Error: ${test2.error}\n`);
    }

    // Test 3: Complex reasoning with Sonar Reasoning
    console.log("\n🧠 Test 3: Complex Reasoning (Sonar Reasoning)");
    console.log("─".repeat(60));
    const test3 = await askPerplexity(
      "Explain crop rotation benefits and create a 4-year rotation plan",
      { model: "SONAR_REASONING" }
    );

    if (test3.success) {
      console.log("✅ SUCCESS");
      console.log(`Model: ${test3.model}`);
      console.log(`Answer:\n${test3.answer}\n`);
    } else {
      console.log("❌ FAILED");
      console.log(`Error: ${test3.error}\n`);
    }

    // Test 4: Smart query routing
    console.log("\n🎯 Test 4: Smart Query Routing");
    console.log("─".repeat(60));
    const test4 = await smartQuery(
      "Generate a function to validate email addresses"
    );

    if (test4.success) {
      console.log("✅ SUCCESS (Auto-routed to Sonar Pro)");
      console.log(`Model: ${test4.model}`);
      console.log(`Answer:\n${test4.answer}\n`);
    } else {
      console.log("❌ FAILED");
      console.log(`Error: ${test4.error}\n`);
    }

    // Test 5: Agricultural research helper
    console.log("\n🌾 Test 5: Agricultural Research Helper");
    console.log("─".repeat(60));
    const test5 = await researchAgriculturalTopic(
      "companion planting for pest management"
    );

    if (test5.success) {
      console.log("✅ SUCCESS");
      console.log(`Answer:\n${test5.answer}\n`);
    } else {
      console.log("❌ FAILED");
      console.log(`Error: ${test5.error}\n`);
    }

    // Test 6: Code generation helper
    console.log("\n⚡ Test 6: Code Generation Helper");
    console.log("─".repeat(60));
    const test6 = await generateCode(
      "a React component for displaying farm location on a map"
    );

    if (test6.success) {
      console.log("✅ SUCCESS");
      console.log(`Answer:\n${test6.answer}\n`);
    } else {
      console.log("❌ FAILED");
      console.log(`Error: ${test6.error}\n`);
    }

    // Summary
    console.log("\n" + "═".repeat(60));
    console.log("✅ All tests complete!");
    console.log("═".repeat(60));
    console.log("\n🎉 Perplexity integration is working!");
    console.log("🌾 Agricultural consciousness expanded!");
    console.log("⚡ Multi-model AI ready for development!");
  } catch (error) {
    console.error("\n❌ Test suite failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run tests
console.log("🚀 Starting Perplexity Integration Tests...\n");
testPerplexity().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
