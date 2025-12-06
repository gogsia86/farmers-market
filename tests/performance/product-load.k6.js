/**
 * k6 Performance Test Script - Product API Endpoints
 *
 * Load testing scenarios for the Farmers Market Platform product API
 *
 * Usage:
 *   k6 run tests/performance/product-load.k6.js
 *
 * Environment Variables:
 *   BASE_URL - API base URL (default: http://localhost:3001)
 *   VUS - Number of virtual users (default: 100)
 *   DURATION - Test duration (default: 5m)
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const VUS = __ENV.VUS || 100;
const DURATION = __ENV.DURATION || "5m";

// Custom metrics
const errorRate = new Rate("errors");
const productListDuration = new Trend("product_list_duration");
const productSearchDuration = new Trend("product_search_duration");
const productDetailDuration = new Trend("product_detail_duration");

// ============================================================================
// Test Configuration
// ============================================================================

export const options = {
  scenarios: {
    // Scenario 1: Product List Load Test
    product_list_load: {
      executor: "constant-vus",
      vus: 100,
      duration: "5m",
      exec: "testProductList",
      tags: { scenario: "product_list" },
    },

    // Scenario 2: Product Search Load Test
    product_search_load: {
      executor: "constant-vus",
      vus: 50,
      duration: "3m",
      exec: "testProductSearch",
      tags: { scenario: "product_search" },
      startTime: "30s", // Start after product list test begins
    },

    // Scenario 3: Product Detail Load Test (High Traffic)
    product_detail_load: {
      executor: "ramping-vus",
      startVUs: 50,
      stages: [
        { duration: "1m", target: 100 },
        { duration: "3m", target: 200 },
        { duration: "1m", target: 50 },
      ],
      exec: "testProductDetail",
      tags: { scenario: "product_detail" },
      startTime: "1m",
    },

    // Scenario 4: Stress Test - Breaking Point
    stress_test: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 100 },
        { duration: "2m", target: 300 },
        { duration: "2m", target: 500 },
        { duration: "2m", target: 800 },
        { duration: "2m", target: 1000 },
        { duration: "2m", target: 0 },
      ],
      exec: "testStress",
      tags: { scenario: "stress_test" },
      startTime: "6m",
    },
  },

  thresholds: {
    // Success rate should be > 99%
    errors: ["rate<0.01"],

    // Response time thresholds
    http_req_duration: ["p(95)<200", "p(99)<500"],
    product_list_duration: ["p(95)<200", "p(99)<300"],
    product_search_duration: ["p(95)<300", "p(99)<500"],
    product_detail_duration: ["p(95)<150", "p(99)<250"],

    // Request rate
    http_reqs: ["rate>100"],
  },
};

// ============================================================================
// Test Data
// ============================================================================

const categories = ["VEGETABLES", "FRUITS", "DAIRY", "MEAT", "BAKERY"];

const searchQueries = [
  "tomato",
  "organic",
  "fresh",
  "lettuce",
  "strawberry",
  "milk",
  "cheese",
  "bread",
  "chicken",
  "eggs",
];

const farmSlugs = [
  "sunny-acres-farm",
  "green-valley-organics",
  "riverside-ranch",
  "mountain-view-dairy",
  "harvest-moon-farm",
];

const productSlugs = [
  "organic-tomatoes",
  "fresh-strawberries",
  "green-lettuce",
  "sweet-corn",
  "farm-fresh-eggs",
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get random item from array
 */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Check response and record metrics
 */
function checkResponse(response, name, metricTrend) {
  const success = check(response, {
    [`${name}: status is 200`]: (r) => r.status === 200,
    [`${name}: response time < 1s`]: (r) => r.timings.duration < 1000,
    [`${name}: has data`]: (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.data !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  if (metricTrend) {
    metricTrend.add(response.timings.duration);
  }
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Test Product List Endpoint
 */
export function testProductList() {
  const params = {
    page: Math.floor(Math.random() * 5) + 1,
    pageSize: 20,
  };

  // Add random filter
  if (Math.random() > 0.5) {
    params.category = getRandomItem(categories);
  }

  // Add random sorting
  if (Math.random() > 0.7) {
    params.sort = getRandomItem(["price", "name", "createdAt"]);
    params.order = Math.random() > 0.5 ? "asc" : "desc";
  }

  const url = `${BASE_URL}/api/products?${Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&")}`;

  const response = http.get(url);
  checkResponse(response, "Product List", productListDuration);

  sleep(1);
}

/**
 * Test Product Search Endpoint
 */
export function testProductSearch() {
  const query = getRandomItem(searchQueries);
  const category = Math.random() > 0.6 ? getRandomItem(categories) : null;

  let url = `${BASE_URL}/api/products/search?q=${query}`;
  if (category) {
    url += `&category=${category}`;
  }

  const response = http.get(url);
  checkResponse(response, "Product Search", productSearchDuration);

  sleep(1);
}

/**
 * Test Product Detail Endpoint (by slug)
 */
export function testProductDetail() {
  const farmSlug = getRandomItem(farmSlugs);
  const productSlug = getRandomItem(productSlugs);

  const url = `${BASE_URL}/api/products/detail/${farmSlug}/${productSlug}`;

  const response = http.get(url);
  checkResponse(response, "Product Detail", productDetailDuration);

  // Track product view
  if (response.status === 200) {
    try {
      const product = JSON.parse(response.body).data;
      if (product && product.id) {
        const viewResponse = http.post(
          `${BASE_URL}/api/products/${product.id}/view`,
          null,
        );
        check(viewResponse, {
          "View tracking successful": (r) => r.status === 200,
        });
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  sleep(1);
}

/**
 * Stress Test - Mixed Operations
 */
export function testStress() {
  const scenario = Math.random();

  if (scenario < 0.5) {
    // 50% - List products
    testProductList();
  } else if (scenario < 0.8) {
    // 30% - Product detail
    testProductDetail();
  } else {
    // 20% - Search
    testProductSearch();
  }
}

/**
 * Test Inventory Update Concurrency
 * (Requires authentication - run separately)
 */
export function testInventoryConcurrency() {
  // This would require auth token setup
  // Placeholder for authenticated tests
  console.log("Inventory concurrency test requires authentication setup");
}

// ============================================================================
// Setup & Teardown
// ============================================================================

export function setup() {
  console.log("Starting k6 performance tests");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`VUs: ${VUS}`);
  console.log(`Duration: ${DURATION}`);

  // Verify API is accessible
  const healthCheck = http.get(`${BASE_URL}/api/health`);
  if (healthCheck.status !== 200) {
    console.error("API health check failed. Is the server running?");
    return null;
  }

  console.log("API is accessible. Starting tests...\n");
  return { startTime: Date.now() };
}

export function teardown(data) {
  if (!data) return;

  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`\n${"=".repeat(60)}`);
  console.log("k6 Performance Test Complete");
  console.log(`Total Duration: ${duration.toFixed(2)}s`);
  console.log(`${"=".repeat(60)}\n`);
}

// ============================================================================
// Default Test (fallback)
// ============================================================================

export default function () {
  testProductList();
}

// ============================================================================
// Report Summary
// ============================================================================

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    "tests/performance/product-load-summary.json": JSON.stringify(
      data,
      null,
      2,
    ),
  };
}

function textSummary(data, options) {
  const indent = options.indent || "";
  const enableColors = options.enableColors || false;

  let summary = "\n";
  summary += `${indent}${"=".repeat(60)}\n`;
  summary += `${indent}K6 PERFORMANCE TEST SUMMARY\n`;
  summary += `${indent}${"=".repeat(60)}\n\n`;

  // Requests
  summary += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n\n`;

  // Response Times
  summary += `${indent}Response Time (overall):\n`;
  summary += `${indent}  p50: ${data.metrics.http_req_duration.values["p(50)"].toFixed(2)}ms\n`;
  summary += `${indent}  p95: ${data.metrics.http_req_duration.values["p(95)"].toFixed(2)}ms\n`;
  summary += `${indent}  p99: ${data.metrics.http_req_duration.values["p(99)"].toFixed(2)}ms\n\n`;

  // Custom Metrics
  if (data.metrics.product_list_duration) {
    summary += `${indent}Product List Response Time:\n`;
    summary += `${indent}  p50: ${data.metrics.product_list_duration.values["p(50)"].toFixed(2)}ms\n`;
    summary += `${indent}  p95: ${data.metrics.product_list_duration.values["p(95)"].toFixed(2)}ms\n\n`;
  }

  if (data.metrics.product_search_duration) {
    summary += `${indent}Product Search Response Time:\n`;
    summary += `${indent}  p50: ${data.metrics.product_search_duration.values["p(50)"].toFixed(2)}ms\n`;
    summary += `${indent}  p95: ${data.metrics.product_search_duration.values["p(95)"].toFixed(2)}ms\n\n`;
  }

  if (data.metrics.product_detail_duration) {
    summary += `${indent}Product Detail Response Time:\n`;
    summary += `${indent}  p50: ${data.metrics.product_detail_duration.values["p(50)"].toFixed(2)}ms\n`;
    summary += `${indent}  p95: ${data.metrics.product_detail_duration.values["p(95)"].toFixed(2)}ms\n\n`;
  }

  // Error Rate
  const errorRate = data.metrics.errors.values.rate * 100;
  summary += `${indent}Error Rate: ${errorRate.toFixed(2)}%\n`;
  summary += `${indent}Success Rate: ${(100 - errorRate).toFixed(2)}%\n\n`;

  summary += `${indent}${"=".repeat(60)}\n`;

  return summary;
}
