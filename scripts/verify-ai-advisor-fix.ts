#!/usr/bin/env tsx
/**
 * 🔍 AI Advisor Fix Verification Script
 *
 * Quick verification that the AI advisor JSON parsing fix is working correctly.
 * Tests both local and production endpoints.
 *
 * Usage: npx tsx scripts/verify-ai-advisor-fix.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

// ============================================================================
// Configuration
// ============================================================================

const ENDPOINTS = {
  local: "http://localhost:3000",
  production: "https://farmers-market-platform.vercel.app",
};

const TEST_MESSAGES = [
  {
    name: "Basic farming question",
    message: "What are the best crops to plant in spring in Croatia?",
    shouldSucceed: true,
  },
  {
    name: "Crop rotation advice",
    message: "I've been growing tomatoes. What should I rotate to?",
    shouldSucceed: true,
  },
  {
    name: "Short question",
    message: "Help",
    shouldSucceed: false, // Too short, should fail validation
  },
];

// ============================================================================
// Test Functions
// ============================================================================

interface TestResult {
  endpoint: string;
  testName: string;
  passed: boolean;
  status?: number;
  duration: number;
  error?: string;
  response?: any;
}

async function testEndpoint(
  baseUrl: string,
  testMessage: typeof TEST_MESSAGES[0]
): Promise<TestResult> {
  const startTime = Date.now();
  const endpoint = `${baseUrl}/api/ai/advisor`;

  try {
    console.log(`\n  🧪 Testing: ${testMessage.name}`);
    console.log(`     Endpoint: ${endpoint}`);
    console.log(`     Message: "${testMessage.message}"`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: testMessage.message,
        agentType: "farm_analyst",
        context: {
          location: "Zagreb, Croatia",
          currentSeason: "winter",
        },
      }),
    });

    const duration = Date.now() - startTime;
    const status = response.status;

    // Try to parse response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      return {
        endpoint: baseUrl,
        testName: testMessage.name,
        passed: false,
        duration,
        status,
        error: `❌ JSON parse failed: ${parseError}`,
      };
    }

    // Check if test result matches expectation
    const responseSuccess = response.ok && data.success;
    const passed = testMessage.shouldSucceed
      ? responseSuccess
      : !responseSuccess;

    if (passed) {
      console.log(
        `     ✅ PASSED (${duration}ms) - Status: ${status}, Success: ${data.success}`
      );
      if (data.success && data.data?.response) {
        console.log(
          `     Response preview: ${data.data.response.substring(0, 80)}...`
        );
      }
    } else {
      console.log(
        `     ❌ FAILED (${duration}ms) - Status: ${status}, Success: ${data.success}`
      );
      if (data.error) {
        console.log(`     Error: ${data.error.message}`);
      }
    }

    return {
      endpoint: baseUrl,
      testName: testMessage.name,
      passed,
      status,
      duration,
      response: data,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`     ❌ FAILED (${duration}ms)`);
    console.log(`     Error: ${error}`);

    return {
      endpoint: baseUrl,
      testName: testMessage.name,
      passed: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkEndpointHealth(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`  ✅ Health check passed - Status: ${data.status}`);
      return true;
    } else {
      console.log(`  ⚠️  Health check returned ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Health check failed: ${error}`);
    return false;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function runVerification() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  🔍 AI ADVISOR FIX VERIFICATION");
  console.log("═══════════════════════════════════════════════════════════");
  console.log();

  const allResults: TestResult[] = [];

  // Determine which endpoint to test
  const args = process.argv.slice(2);
  const testLocal = args.includes("--local");
  const testProd = args.includes("--prod") || args.includes("--production");
  const testBoth = !testLocal && !testProd;

  const endpointsToTest: Array<{ name: string; url: string }> = [];

  if (testLocal || testBoth) {
    endpointsToTest.push({ name: "Local", url: ENDPOINTS.local });
  }
  if (testProd || testBoth) {
    endpointsToTest.push({ name: "Production", url: ENDPOINTS.production });
  }

  // Test each endpoint
  for (const endpoint of endpointsToTest) {
    console.log(`\n┌─────────────────────────────────────────────────────────┐`);
    console.log(`│ 🌐 Testing ${endpoint.name.toUpperCase()} ENDPOINT`);
    console.log(`│ URL: ${endpoint.url}`);
    console.log(`└─────────────────────────────────────────────────────────┘`);

    // Health check first
    console.log(`\n🏥 Health Check:`);
    const isHealthy = await checkEndpointHealth(endpoint.url);

    if (!isHealthy && endpoint.name === "Local") {
      console.log(
        "\n⚠️  Local endpoint not available. Start dev server with: npm run dev"
      );
      continue;
    }

    // Run tests
    console.log(`\n🧪 Running Tests:`);
    for (const testMessage of TEST_MESSAGES) {
      const result = await testEndpoint(endpoint.url, testMessage);
      allResults.push(result);

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Print summary
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  📊 VERIFICATION SUMMARY");
  console.log("═══════════════════════════════════════════════════════════");

  const groupedResults = allResults.reduce(
    (acc, result) => {
      if (!acc[result.endpoint]) {
        acc[result.endpoint] = [];
      }
      acc[result.endpoint].push(result);
      return acc;
    },
    {} as Record<string, TestResult[]>
  );

  for (const [endpoint, results] of Object.entries(groupedResults)) {
    console.log(`\n${endpoint}:`);
    console.log(`  Total Tests:    ${results.length}`);
    console.log(
      `  ✅ Passed:       ${results.filter((r) => r.passed).length}`
    );
    console.log(
      `  ❌ Failed:       ${results.filter((r) => !r.passed).length}`
    );
    console.log(
      `  ⏱️  Avg Duration: ${Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)}ms`
    );

    // Show failures
    const failures = results.filter((r) => !r.passed);
    if (failures.length > 0) {
      console.log(`\n  ❌ Failed Tests:`);
      failures.forEach((failure) => {
        console.log(`    • ${failure.testName}`);
        if (failure.error) {
          console.log(`      Error: ${failure.error}`);
        }
      });
    }
  }

  // Overall status
  const totalTests = allResults.length;
  const totalPassed = allResults.filter((r) => r.passed).length;
  const totalFailed = totalTests - totalPassed;

  console.log("\n═══════════════════════════════════════════════════════════");
  if (totalFailed === 0) {
    console.log("  ✅ ALL TESTS PASSED! 🎉");
    console.log("  The AI advisor fix is working correctly.");
  } else {
    console.log(`  ⚠️  ${totalFailed} TEST(S) FAILED`);
    console.log("  Please review the errors above.");
  }
  console.log("═══════════════════════════════════════════════════════════\n");

  // Exit with appropriate code
  process.exit(totalFailed > 0 ? 1 : 0);
}

// ============================================================================
// CLI Help
// ============================================================================

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
AI Advisor Fix Verification Script

Usage:
  npx tsx scripts/verify-ai-advisor-fix.ts [options]

Options:
  --local, -l           Test only local endpoint (http://localhost:3000)
  --prod, --production  Test only production endpoint
  (no options)          Test both local and production endpoints

  --help, -h            Show this help message

Examples:
  # Test both local and production
  npx tsx scripts/verify-ai-advisor-fix.ts

  # Test only local
  npx tsx scripts/verify-ai-advisor-fix.ts --local

  # Test only production
  npx tsx scripts/verify-ai-advisor-fix.ts --prod

Note:
  - For local testing, ensure dev server is running: npm run dev
  - Production testing uses: ${ENDPOINTS.production}
  `);
  process.exit(0);
}

// Run verification
runVerification().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exit(1);
});
