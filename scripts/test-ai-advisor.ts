#!/usr/bin/env tsx
/**
 * 🧪 AI Advisor Test Script
 *
 * Tests the AI advisor endpoint with various scenarios including:
 * - Valid JSON responses
 * - Error handling
 * - Non-JSON responses
 * - Edge cases
 *
 * Usage: npm run test:advisor
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_ENDPOINT =
  process.env.TEST_BASE_URL || "http://localhost:3000/api/ai/advisor";

const TEST_CASES = [
  {
    name: "Basic farming question",
    payload: {
      message: "What are the best crops to plant in spring?",
      userId: "test-user-1",
      context: {
        location: "Zagreb, Croatia",
        currentSeason: "spring",
        farmSize: "5 acres",
      },
      agentType: "farm_analyst",
    },
  },
  {
    name: "Crop rotation advice",
    payload: {
      message:
        "I've been growing tomatoes for 3 years. What should I rotate to?",
      userId: "test-user-2",
      context: {
        location: "Split, Croatia",
        cropTypes: ["tomatoes", "peppers"],
        farmingPractices: ["organic"],
      },
      agentType: "farm_analyst",
    },
  },
  {
    name: "Pest management question",
    payload: {
      message: "How do I deal with aphids on my lettuce organically?",
      userId: "test-user-3",
      context: {
        location: "Dubrovnik, Croatia",
        specificIssue: "aphid infestation on lettuce",
        farmingPractices: ["organic", "sustainable"],
      },
      agentType: "farm_analyst",
    },
  },
  {
    name: "Empty message (should fail validation)",
    payload: {
      message: "",
      userId: "test-user-4",
    },
  },
  {
    name: "Very long message",
    payload: {
      message: "A".repeat(2500), // Exceeds max length
      userId: "test-user-5",
    },
  },
  {
    name: "Minimal valid request",
    payload: {
      message: "Help with farm planning",
    },
  },
];

// ============================================================================
// Test Runner
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  status?: number;
  response?: any;
  error?: string;
}

async function runTest(
  testCase: (typeof TEST_CASES)[0]
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log(`\n📝 Running test: ${testCase.name}`);
    console.log(`   Payload:`, JSON.stringify(testCase.payload, null, 2));

    const response = await fetch(TEST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testCase.payload),
    });

    const duration = Date.now() - startTime;
    const status = response.status;

    // Try to parse response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      return {
        name: testCase.name,
        passed: false,
        duration,
        status,
        error: `Failed to parse JSON response: ${parseError}`,
      };
    }

    // Validate response structure
    const hasValidStructure =
      data &&
      typeof data === "object" &&
      typeof data.success === "boolean" &&
      (data.success ? !!data.data : !!data.error);

    if (!hasValidStructure) {
      return {
        name: testCase.name,
        passed: false,
        duration,
        status,
        response: data,
        error: "Invalid response structure",
      };
    }

    // Check if test should pass or fail
    const shouldPass = !testCase.name.includes("should fail");
    const actuallyPassed = response.ok && data.success;

    const passed = shouldPass ? actuallyPassed : !actuallyPassed;

    // Log result
    if (passed) {
      console.log(`   ✅ PASSED (${duration}ms) - Status: ${status}`);
      if (data.success && data.data) {
        console.log(
          `   Response preview: ${data.data.response?.substring(0, 100)}...`
        );
        console.log(`   Agent: ${data.data.agentUsed || "N/A"}`);
        console.log(`   Confidence: ${data.data.confidence || "N/A"}`);
      }
    } else {
      console.log(`   ❌ FAILED (${duration}ms) - Status: ${status}`);
      console.log(`   Error:`, data.error || "Unknown error");
    }

    return {
      name: testCase.name,
      passed,
      duration,
      status,
      response: data,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`   ❌ FAILED (${duration}ms)`);
    console.log(`   Error:`, error);

    return {
      name: testCase.name,
      passed: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runAllTests() {
  console.log("🚀 Starting AI Advisor Tests");
  console.log("=" .repeat(60));
  console.log(`Endpoint: ${TEST_ENDPOINT}`);
  console.log(`Total tests: ${TEST_CASES.length}`);

  const results: TestResult[] = [];

  for (const testCase of TEST_CASES) {
    const result = await runTest(testCase);
    results.push(result);

    // Small delay between tests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Test Summary");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const avgDuration = Math.round(totalDuration / results.length);

  console.log(`\nTotal Tests:    ${results.length}`);
  console.log(`✅ Passed:       ${passed}`);
  console.log(`❌ Failed:       ${failed}`);
  console.log(`⏱️  Avg Duration: ${avgDuration}ms`);
  console.log(`⏱️  Total Time:   ${totalDuration}ms`);

  // Print failed tests details
  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    results
      .filter((r) => !r.passed)
      .forEach((result) => {
        console.log(`\n  • ${result.name}`);
        console.log(`    Status: ${result.status || "N/A"}`);
        console.log(`    Error: ${result.error || "Unknown"}`);
      });
  }

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// ============================================================================
// Main Execution
// ============================================================================

if (require.main === module) {
  runAllTests().catch((error) => {
    console.error("❌ Test runner failed:", error);
    process.exit(1);
  });
}

export { runAllTests, runTest, TEST_CASES };
