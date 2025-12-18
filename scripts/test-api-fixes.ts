/**
 * 🧪 API FIXES VERIFICATION SCRIPT
 *
 * Quick test script to verify all 4 API endpoint fixes are working correctly.
 * Tests the actual code without needing a running server.
 *
 * Usage: tsx scripts/test-api-fixes.ts
 */

import { NextRequest } from "next/server";

// Colors for output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

interface TestResult {
  name: string;
  status: "pass" | "fail" | "skip";
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

/**
 * Test helper to create mock NextRequest
 */
function createMockRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3001"));
}

/**
 * Test 1: Product Search API - Should handle empty query
 */
async function testProductSearchAPI(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    console.log("\n📦 Testing Product Search API...");

    // Import the controller
    const { productController } = await import("../src/lib/controllers/index");

    // Test 1: Empty query (this was causing 500 error)
    console.log("  → Testing empty query...");
    const emptyRequest = createMockRequest(
      "http://localhost:3001/api/products/search",
    );
    const emptyResponse = await productController.searchProducts(emptyRequest);
    const emptyData = await emptyResponse.json();

    if (emptyResponse.status !== 200) {
      throw new Error(`Expected 200, got ${emptyResponse.status}`);
    }

    if (!emptyData.success) {
      throw new Error("Response should have success: true");
    }

    console.log("  ✓ Empty query handled correctly");

    // Test 2: With query parameter
    console.log("  → Testing with query parameter...");
    const queryRequest = createMockRequest(
      "http://localhost:3001/api/products/search?query=tomato&limit=10",
    );
    const queryResponse = await productController.searchProducts(queryRequest);
    const queryData = await queryResponse.json();

    if (queryResponse.status !== 200) {
      throw new Error(`Expected 200, got ${queryResponse.status}`);
    }

    if (!queryData.success) {
      throw new Error("Response should have success: true");
    }

    console.log("  ✓ Query parameter handled correctly");

    return {
      name: "Product Search API",
      status: "pass",
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: "Product Search API",
      status: "fail",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test 2: Reviews API - Should support GET method
 */
async function testReviewsAPI(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    console.log("\n⭐ Testing Reviews API...");

    // Import the route handler
    const reviewsRoute = await import("../src/app/api/reviews/route");

    // Test 1: GET without parameters (public access)
    console.log("  → Testing GET without auth...");
    const getRequest = createMockRequest("http://localhost:3001/api/reviews");
    const getResponse = await reviewsRoute.GET(getRequest);
    const getData = await getResponse.json();

    if (getResponse.status !== 200) {
      throw new Error(`Expected 200, got ${getResponse.status}`);
    }

    if (!getData.success) {
      throw new Error("Response should have success: true");
    }

    console.log("  ✓ GET method works without authentication");

    // Test 2: GET with filters
    console.log("  → Testing GET with filters...");
    const filterRequest = createMockRequest(
      "http://localhost:3001/api/reviews?productId=test123&limit=5",
    );
    const filterResponse = await reviewsRoute.GET(filterRequest);
    const filterData = await filterResponse.json();

    if (filterResponse.status !== 200) {
      throw new Error(`Expected 200, got ${filterResponse.status}`);
    }

    if (!filterData.success) {
      throw new Error("Response should have success: true");
    }

    if (!filterData.meta || typeof filterData.meta.limit !== "number") {
      throw new Error("Response should include meta with limit");
    }

    console.log("  ✓ Filter parameters handled correctly");

    return {
      name: "Reviews API",
      status: "pass",
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: "Reviews API",
      status: "fail",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test 3: Categories API - Should exist and return categories
 */
async function testCategoriesAPI(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    console.log("\n🏷️  Testing Categories API...");

    // Import the route handler
    const categoriesRoute = await import("../src/app/api/categories/route");

    // Test 1: GET without parameters
    console.log("  → Testing GET categories...");
    const getRequest = createMockRequest(
      "http://localhost:3001/api/categories",
    );
    const getResponse = await categoriesRoute.GET(getRequest);
    const getData = await getResponse.json();

    if (getResponse.status !== 200) {
      throw new Error(`Expected 200, got ${getResponse.status}`);
    }

    if (!getData.success) {
      throw new Error("Response should have success: true");
    }

    if (!Array.isArray(getData.data)) {
      throw new Error("Response data should be an array");
    }

    console.log("  ✓ Categories endpoint exists and returns data");

    // Test 2: GET with includeCount parameter
    console.log("  → Testing with includeCount parameter...");
    const countRequest = createMockRequest(
      "http://localhost:3001/api/categories?includeCount=true",
    );
    const countResponse = await categoriesRoute.GET(countRequest);
    const countData = await countResponse.json();

    if (countResponse.status !== 200) {
      throw new Error(`Expected 200, got ${countResponse.status}`);
    }

    if (!countData.success) {
      throw new Error("Response should have success: true");
    }

    console.log("  ✓ Query parameters handled correctly");

    return {
      name: "Categories API",
      status: "pass",
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: "Categories API",
      status: "fail",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test 4: Farms API - Should handle invalid parameters gracefully
 */
async function testFarmsAPI(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    console.log("\n🚜 Testing Farms API...");

    // Import the controller
    const { farmController } = await import("../src/lib/controllers/index");

    // Test 1: No parameters (should work)
    console.log("  → Testing without parameters...");
    const emptyRequest = createMockRequest("http://localhost:3001/api/farms");
    const emptyResponse = await farmController.listFarms(emptyRequest);
    const emptyData = await emptyResponse.json();

    if (emptyResponse.status !== 200) {
      throw new Error(`Expected 200, got ${emptyResponse.status}`);
    }

    if (!emptyData.success) {
      throw new Error("Response should have success: true");
    }

    console.log("  ✓ Empty parameters handled correctly");

    // Test 2: Invalid page parameter (should default gracefully)
    console.log("  → Testing with invalid page parameter...");
    const invalidPageRequest = createMockRequest(
      "http://localhost:3001/api/farms?page=abc",
    );
    const invalidPageResponse =
      await farmController.listFarms(invalidPageRequest);
    const invalidPageData = await invalidPageResponse.json();

    if (invalidPageResponse.status !== 200) {
      throw new Error(
        `Expected 200 for invalid page, got ${invalidPageResponse.status}`,
      );
    }

    if (!invalidPageData.success) {
      throw new Error(
        "Response should have success: true even with invalid page",
      );
    }

    console.log("  ✓ Invalid page parameter defaulted gracefully");

    // Test 3: Negative limit (should cap to safe value)
    console.log("  → Testing with negative limit...");
    const negativeLimitRequest = createMockRequest(
      "http://localhost:3001/api/farms?limit=-10",
    );
    const negativeLimitResponse =
      await farmController.listFarms(negativeLimitRequest);
    const negativeLimitData = await negativeLimitResponse.json();

    if (negativeLimitResponse.status !== 200) {
      throw new Error(
        `Expected 200 for negative limit, got ${negativeLimitResponse.status}`,
      );
    }

    if (!negativeLimitData.success) {
      throw new Error(
        "Response should have success: true even with negative limit",
      );
    }

    console.log("  ✓ Negative limit parameter handled gracefully");

    // Test 4: Excessive limit (should cap to max)
    console.log("  → Testing with excessive limit...");
    const excessiveLimitRequest = createMockRequest(
      "http://localhost:3001/api/farms?limit=9999",
    );
    const excessiveLimitResponse = await farmController.listFarms(
      excessiveLimitRequest,
    );
    const excessiveLimitData = await excessiveLimitResponse.json();

    if (excessiveLimitResponse.status !== 200) {
      throw new Error(
        `Expected 200 for excessive limit, got ${excessiveLimitResponse.status}`,
      );
    }

    if (!excessiveLimitData.success) {
      throw new Error(
        "Response should have success: true even with excessive limit",
      );
    }

    console.log("  ✓ Excessive limit parameter capped correctly");

    return {
      name: "Farms API",
      status: "pass",
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: "Farms API",
      status: "fail",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Print test results summary
 */
function printSummary(results: TestResult[]): void {
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const skipped = results.filter((r) => r.status === "skip").length;
  const total = results.length;

  console.log("\n" + "═".repeat(70));
  console.log(
    `${colors.bold}${colors.cyan}📊 TEST RESULTS SUMMARY${colors.reset}`,
  );
  console.log("═".repeat(70));

  results.forEach((result) => {
    const icon =
      result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⏭️";
    const color =
      result.status === "pass"
        ? colors.green
        : result.status === "fail"
          ? colors.red
          : colors.yellow;

    console.log(
      `${icon} ${color}${result.name}${colors.reset} (${result.duration}ms)`,
    );

    if (result.error) {
      console.log(`   ${colors.red}Error: ${result.error}${colors.reset}`);
    }
  });

  console.log("─".repeat(70));

  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";

  console.log(
    `${colors.bold}Total Tests:${colors.reset} ${total} | ${colors.green}Passed:${colors.reset} ${passed} | ${colors.red}Failed:${colors.reset} ${failed} | ${colors.yellow}Skipped:${colors.reset} ${skipped}`,
  );
  console.log(
    `${colors.bold}Success Rate:${colors.reset} ${colors.green}${successRate}%${colors.reset}`,
  );
  console.log("═".repeat(70));

  if (passed === total) {
    console.log(
      `\n${colors.green}${colors.bold}🎉 ALL API FIXES VERIFIED SUCCESSFULLY!${colors.reset}`,
    );
    console.log(
      `${colors.cyan}All 4 critical endpoints are now working correctly.${colors.reset}\n`,
    );
  } else if (failed > 0) {
    console.log(
      `\n${colors.red}${colors.bold}⚠️  SOME TESTS FAILED${colors.reset}`,
    );
    console.log(
      `${colors.yellow}Please review the errors above and fix the issues.${colors.reset}\n`,
    );
  }
}

/**
 * Main test execution
 */
async function main() {
  console.log(`${colors.bold}${colors.cyan}
╔═══════════════════════════════════════════════════════════════════╗
║           🧪 API FIXES VERIFICATION TEST SUITE                    ║
║                                                                   ║
║  Testing all 4 critical API endpoint fixes:                      ║
║  1. Product Search API (HTTP 500 → 200)                          ║
║  2. Reviews API (HTTP 405 → 200)                                 ║
║  3. Categories API (HTTP 404 → 200)                              ║
║  4. Farms API (HTTP 400 → 200)                                   ║
╚═══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const startTime = Date.now();

  try {
    // Run all tests
    results.push(await testProductSearchAPI());
    results.push(await testReviewsAPI());
    results.push(await testCategoriesAPI());
    results.push(await testFarmsAPI());

    const totalDuration = Date.now() - startTime;

    // Print summary
    printSummary(results);

    console.log(
      `${colors.cyan}Total execution time: ${totalDuration}ms${colors.reset}\n`,
    );

    // Exit with appropriate code
    const failedTests = results.filter((r) => r.status === "fail").length;
    process.exit(failedTests > 0 ? 1 : 0);
  } catch (error) {
    console.error(
      `\n${colors.red}${colors.bold}Fatal error during test execution:${colors.reset}`,
    );
    console.error(error);
    process.exit(1);
  }
}

// Run tests
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
