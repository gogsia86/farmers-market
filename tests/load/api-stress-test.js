/**
 * 🔥 K6 API Stress Testing - Backend Performance
 * Aggressive stress testing of API endpoints to find breaking points
 *
 * Usage:
 *   k6 run api-stress-test.js
 *   k6 run --vus 200 --duration 10m api-stress-test.js
 *   k6 run --out json=api-stress-results.json api-stress-test.js
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend, Counter, Gauge } from "k6/metrics";

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const API_BASE = `${BASE_URL}/api`;

// Custom Metrics
const apiErrors = new Rate("api_errors");
const apiLatency = new Trend("api_latency");
const apiThroughput = new Counter("api_throughput");
const concurrentUsers = new Gauge("concurrent_users");

// ============================================================================
// AGGRESSIVE STRESS TEST CONFIGURATION
// ============================================================================

export const options = {
  // Stress test stages - push until breaking point
  stages: [
    { duration: "30s", target: 50 }, // Baseline: 50 users
    { duration: "1m", target: 100 }, // Normal load: 100 users
    { duration: "2m", target: 200 }, // High load: 200 users
    { duration: "2m", target: 300 }, // Stress: 300 users
    { duration: "2m", target: 400 }, // Breaking point: 400 users
    { duration: "1m", target: 500 }, // Peak stress: 500 users
    { duration: "2m", target: 200 }, // Recovery: scale down
    { duration: "1m", target: 0 }, // Cool down
  ],

  // Aggressive thresholds
  thresholds: {
    // API should handle load with < 5% error rate
    api_errors: ["rate<0.05"],

    // 90% of requests under 1s (relaxed for stress test)
    http_req_duration: ["p(90)<1000"],

    // 95% of requests under 2s
    http_req_duration: ["p(95)<2000"],

    // 99% of requests under 5s
    http_req_duration: ["p(99)<5000"],

    // Max duration shouldn't exceed 10s
    http_req_duration: ["max<10000"],

    // API specific latency
    api_latency: ["p(95)<1000"],

    // Success rate above 95% (allowing some failures under extreme load)
    http_req_failed: ["rate<0.05"],
  },
};

// ============================================================================
// TEST DATA
// ============================================================================

const CATEGORIES = [
  "VEGETABLES",
  "FRUITS",
  "DAIRY",
  "EGGS",
  "MEAT",
  "HERBS",
  "GRAINS",
  "HONEY",
  "PRESERVES",
];

const SORT_OPTIONS = [
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
  "newest",
];

const PAGINATION = [
  { page: 1, limit: 10 },
  { page: 1, limit: 20 },
  { page: 1, limit: 50 },
  { page: 2, limit: 20 },
  { page: 3, limit: 20 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function recordAPIMetrics(res, endpoint) {
  concurrentUsers.add(__VU);
  apiLatency.add(res.timings.duration);
  apiThroughput.add(1);

  const success = check(res, {
    [`${endpoint}: status is 200`]: (r) => r.status === 200,
    [`${endpoint}: response time < 5s`]: (r) => r.timings.duration < 5000,
    [`${endpoint}: has valid JSON`]: (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    apiErrors.add(1);
    console.error(
      `❌ ${endpoint} failed: Status ${res.status}, Duration: ${res.timings.duration}ms`,
    );
  }

  return success;
}

// ============================================================================
// API TEST SCENARIOS
// ============================================================================

/**
 * Test 1: Products API - Basic Fetch
 */
function testProductsList() {
  group("Products List API", () => {
    const res = http.get(`${API_BASE}/products`, {
      headers: { Accept: "application/json" },
    });
    recordAPIMetrics(res, "Products List");
  });
}

/**
 * Test 2: Products API - With Filters
 */
function testProductsWithFilters() {
  group("Products with Filters", () => {
    const category = randomItem(CATEGORIES);
    const sort = randomItem(SORT_OPTIONS);

    const res = http.get(
      `${API_BASE}/products?category=${category}&sort=${sort}`,
      { headers: { Accept: "application/json" } },
    );

    recordAPIMetrics(res, "Products Filtered");
  });
}

/**
 * Test 3: Products API - Pagination
 */
function testProductsPagination() {
  group("Products Pagination", () => {
    const { page, limit } = randomItem(PAGINATION);

    const res = http.get(`${API_BASE}/products?page=${page}&limit=${limit}`, {
      headers: { Accept: "application/json" },
    });

    recordAPIMetrics(res, "Products Paginated");
  });
}

/**
 * Test 4: Farms API - List All
 */
function testFarmsList() {
  group("Farms List API", () => {
    const res = http.get(`${API_BASE}/farms`, {
      headers: { Accept: "application/json" },
    });
    recordAPIMetrics(res, "Farms List");
  });
}

/**
 * Test 5: Farms API - Search
 */
function testFarmsSearch() {
  group("Farms Search", () => {
    const searchTerms = [
      "organic",
      "fresh",
      "local",
      "biodynamic",
      "sustainable",
    ];
    const search = randomItem(searchTerms);

    const res = http.get(`${API_BASE}/farms?search=${search}`, {
      headers: { Accept: "application/json" },
    });

    recordAPIMetrics(res, "Farms Search");
  });
}

/**
 * Test 6: Categories API
 */
function testCategoriesAPI() {
  group("Categories API", () => {
    const res = http.get(`${API_BASE}/categories`, {
      headers: { Accept: "application/json" },
    });
    recordAPIMetrics(res, "Categories");
  });
}

/**
 * Test 7: Search API - Full Text Search
 */
function testSearchAPI() {
  group("Search API", () => {
    const queries = [
      "tomato",
      "lettuce",
      "organic vegetables",
      "fresh eggs",
      "local dairy",
      "seasonal produce",
      "honey",
      "herbs",
    ];
    const query = randomItem(queries);

    const res = http.get(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      headers: { Accept: "application/json" },
    });

    recordAPIMetrics(res, "Search");
  });
}

/**
 * Test 8: Health Check API
 */
function testHealthCheck() {
  group("Health Check", () => {
    const res = http.get(`${API_BASE}/health`, {
      headers: { Accept: "application/json" },
    });

    check(res, {
      "Health: status is 200": (r) => r.status === 200,
      "Health: responds quickly": (r) => r.timings.duration < 1000,
    });
  });
}

/**
 * Test 9: Batch API Calls - Concurrent Requests
 */
function testBatchAPICalls() {
  group("Batch API Calls", () => {
    const requests = [
      ["GET", `${API_BASE}/products?limit=10`],
      ["GET", `${API_BASE}/farms?limit=10`],
      ["GET", `${API_BASE}/categories`],
      ["GET", `${API_BASE}/health`],
    ];

    const responses = http.batch(requests);

    responses.forEach((res, idx) => {
      check(res, {
        [`Batch ${idx}: success`]: (r) => r.status === 200,
      });
    });
  });
}

/**
 * Test 10: Heavy Query - Complex Filters
 */
function testComplexQuery() {
  group("Complex Query", () => {
    const category = randomItem(CATEGORIES);
    const sort = randomItem(SORT_OPTIONS);
    const minPrice = randomInt(1, 20);
    const maxPrice = randomInt(21, 100);
    const organic = Math.random() > 0.5 ? "true" : "false";

    const res = http.get(
      `${API_BASE}/products?category=${category}&sort=${sort}&minPrice=${minPrice}&maxPrice=${maxPrice}&organic=${organic}&limit=50`,
      { headers: { Accept: "application/json" } },
    );

    recordAPIMetrics(res, "Complex Query");
  });
}

/**
 * Test 11: Product Details API
 */
function testProductDetails() {
  group("Product Details", () => {
    // In real scenario, we'd get actual product IDs from a list call
    // For stress test, we'll try common slugs
    const productSlugs = [
      "organic-tomatoes",
      "fresh-lettuce",
      "organic-carrots",
      "farm-fresh-eggs",
      "raw-honey",
    ];

    const slug = randomItem(productSlugs);
    const res = http.get(`${API_BASE}/products/${slug}`, {
      headers: { Accept: "application/json" },
    });

    // Don't fail on 404 for this test (product might not exist)
    if (res.status !== 404) {
      recordAPIMetrics(res, "Product Details");
    }
  });
}

/**
 * Test 12: Farm Details API
 */
function testFarmDetails() {
  group("Farm Details", () => {
    const farmSlugs = [
      "divine-test-farm",
      "green-valley-organics",
      "sunrise-farms",
      "meadow-view-farm",
    ];

    const slug = randomItem(farmSlugs);
    const res = http.get(`${API_BASE}/farms/${slug}`, {
      headers: { Accept: "application/json" },
    });

    // Don't fail on 404 for this test
    if (res.status !== 404) {
      recordAPIMetrics(res, "Farm Details");
    }
  });
}

/**
 * Test 13: Rapid Fire Requests - Same Endpoint
 */
function testRapidFireRequests() {
  group("Rapid Fire", () => {
    for (let i = 0; i < 5; i++) {
      const res = http.get(`${API_BASE}/products?limit=10`, {
        headers: { Accept: "application/json" },
      });

      if (i === 0) {
        recordAPIMetrics(res, "Rapid Fire");
      }

      // No sleep - fire immediately
    }
  });
}

// ============================================================================
// MAIN TEST EXECUTION
// ============================================================================

export default function () {
  // Record concurrent user count
  concurrentUsers.add(__VU);

  // Distribute load across different test scenarios
  const scenario = Math.random();

  if (scenario < 0.25) {
    // 25% - Basic products list
    testProductsList();
  } else if (scenario < 0.4) {
    // 15% - Filtered products
    testProductsWithFilters();
  } else if (scenario < 0.55) {
    // 15% - Paginated products
    testProductsPagination();
  } else if (scenario < 0.65) {
    // 10% - Farms list
    testFarmsList();
  } else if (scenario < 0.75) {
    // 10% - Search
    testSearchAPI();
  } else if (scenario < 0.82) {
    // 7% - Complex queries
    testComplexQuery();
  } else if (scenario < 0.88) {
    // 6% - Batch API calls
    testBatchAPICalls();
  } else if (scenario < 0.92) {
    // 4% - Product details
    testProductDetails();
  } else if (scenario < 0.96) {
    // 4% - Farm details
    testFarmDetails();
  } else if (scenario < 0.98) {
    // 2% - Rapid fire
    testRapidFireRequests();
  } else {
    // 2% - Health check
    testHealthCheck();
  }

  // Minimal think time for stress test (aggressive)
  sleep(Math.random() * 0.5 + 0.1); // 0.1 to 0.6 seconds
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

export function setup() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║  🔥 K6 API STRESS TEST - Find the Breaking Point          ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║  API Base: ${API_BASE.padEnd(47)}║`);
  console.log("║  Test Duration: ~12 minutes                                ║");
  console.log("║  Peak Load: 500 concurrent users                           ║");
  console.log("║  Goal: Identify system limits and bottlenecks              ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  // Warm up
  console.log("🔥 Warming up API...");
  const warmupRequests = [
    http.get(`${API_BASE}/products`),
    http.get(`${API_BASE}/farms`),
    http.get(`${API_BASE}/health`),
  ];
  console.log("✅ API warmed up\n");

  console.log("⚠️  WARNING: This is an aggressive stress test!");
  console.log("   Expect some failures at peak load - this is intentional.");
  console.log("   We're trying to find the breaking point.\n");
}

export function teardown(data) {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║  ✅ Stress Test Complete                                   ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║  Review results to identify:                               ║");
  console.log("║  • Breaking point (when errors spike)                      ║");
  console.log("║  • Performance degradation patterns                        ║");
  console.log("║  • Bottlenecks and slow endpoints                          ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );
}

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

export function handleSummary(data) {
  const avgLatency = data.metrics.api_latency?.values?.avg || 0;
  const p95Latency = data.metrics.api_latency?.values?.["p(95)"] || 0;
  const p99Latency = data.metrics.api_latency?.values?.["p(99)"] || 0;
  const errorRate = data.metrics.api_errors?.values?.rate || 0;
  const totalRequests = data.metrics.api_throughput?.values?.count || 0;

  console.log("\n🔥 API STRESS TEST RESULTS:");
  console.log("═".repeat(70));
  console.log(`🎯 Total API Calls: ${totalRequests}`);
  console.log(`⚡ Average Latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`📊 95th Percentile: ${p95Latency.toFixed(2)}ms`);
  console.log(`📈 99th Percentile: ${p99Latency.toFixed(2)}ms`);
  console.log(`❌ Error Rate: ${(errorRate * 100).toFixed(2)}%`);
  console.log(`🚀 Peak RPS: ${data.metrics.http_reqs.values.rate.toFixed(2)}`);
  console.log("═".repeat(70));

  // Performance rating
  let rating = "🔴 NEEDS WORK";
  if (errorRate < 0.01 && p95Latency < 500) {
    rating = "🟢 EXCELLENT";
  } else if (errorRate < 0.03 && p95Latency < 1000) {
    rating = "🟡 GOOD";
  } else if (errorRate < 0.05 && p95Latency < 2000) {
    rating = "🟠 ACCEPTABLE";
  }

  console.log(`\n📊 Overall Performance: ${rating}\n`);

  return {
    stdout: JSON.stringify(data, null, 2),
    "tests/load/results/api-stress-results.json": JSON.stringify(data, null, 2),
  };
}
