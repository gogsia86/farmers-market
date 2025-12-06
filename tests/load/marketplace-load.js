/**
 * 🚀 K6 Load Testing - Marketplace Performance
 * Tests the Farmers Market Platform under various load conditions
 *
 * Usage:
 *   k6 run marketplace-load.js
 *   k6 run --vus 50 --duration 5m marketplace-load.js
 *   k6 run --out json=results.json marketplace-load.js
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Custom Metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const pageLoadTime = new Trend('page_load_time');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

export const options = {
  // Stages define load pattern
  stages: [
    { duration: '1m', target: 10 },   // Warm up: Ramp to 10 users
    { duration: '2m', target: 50 },   // Load up: Ramp to 50 users
    { duration: '3m', target: 100 },  // Peak load: 100 concurrent users
    { duration: '2m', target: 150 },  // Stress: Push to 150 users
    { duration: '1m', target: 50 },   // Scale down
    { duration: '1m', target: 0 },    // Cool down
  ],

  // Thresholds define success criteria
  thresholds: {
    // HTTP errors should be less than 1%
    'errors': ['rate<0.01'],

    // 95% of requests should complete under 2s
    'http_req_duration': ['p(95)<2000'],

    // 99% of requests should complete under 5s
    'http_req_duration': ['p(99)<5000'],

    // API response time should be under 500ms for 95% of requests
    'api_response_time': ['p(95)<500'],

    // Page load time should be under 2s for 95% of requests
    'page_load_time': ['p(95)<2000'],

    // Success rate should be above 99%
    'http_req_failed': ['rate<0.01'],
  },

  // HTTP configuration
  httpDebug: 'full', // Use 'full' for debugging, remove for production runs
};

// ============================================================================
// TEST DATA
// ============================================================================

const SEARCH_TERMS = [
  'tomato',
  'lettuce',
  'carrot',
  'organic',
  'fresh',
  'vegetables',
  'fruits',
  'dairy',
  'eggs',
  'herbs',
];

const PRODUCT_CATEGORIES = [
  'VEGETABLES',
  'FRUITS',
  'DAIRY',
  'EGGS',
  'MEAT',
  'HERBS',
  'GRAINS',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function checkResponse(res, name) {
  const success = check(res, {
    [`${name}: status is 200`]: (r) => r.status === 200,
    [`${name}: response time < 3s`]: (r) => r.timings.duration < 3000,
    [`${name}: has content`]: (r) => r.body.length > 0,
  });

  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
    errorRate.add(1);
    console.error(`❌ ${name} failed: Status ${res.status}, Duration: ${res.timings.duration}ms`);
  }

  return success;
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

/**
 * Scenario 1: Homepage Load
 */
export function testHomepage() {
  group('Homepage Load', () => {
    const startTime = Date.now();
    const res = http.get(BASE_URL);
    const duration = Date.now() - startTime;

    pageLoadTime.add(duration);
    checkResponse(res, 'Homepage');

    check(res, {
      'homepage contains "Farmers Market"': (r) => r.body.includes('Farmers Market') || r.body.includes('farmers') || r.body.includes('market'),
    });
  });
}

/**
 * Scenario 2: Marketplace Browsing
 */
export function testMarketplaceBrowsing() {
  group('Marketplace Browsing', () => {
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/marketplace`);
    const duration = Date.now() - startTime;

    pageLoadTime.add(duration);
    checkResponse(res, 'Marketplace');
  });
}

/**
 * Scenario 3: Product Search
 */
export function testProductSearch() {
  group('Product Search', () => {
    const searchTerm = randomItem(SEARCH_TERMS);
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/marketplace?search=${searchTerm}`);
    const duration = Date.now() - startTime;

    pageLoadTime.add(duration);
    checkResponse(res, `Search: ${searchTerm}`);
  });
}

/**
 * Scenario 4: Category Filtering
 */
export function testCategoryFilter() {
  group('Category Filter', () => {
    const category = randomItem(PRODUCT_CATEGORIES);
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/marketplace?category=${category}`);
    const duration = Date.now() - startTime;

    pageLoadTime.add(duration);
    checkResponse(res, `Category: ${category}`);
  });
}

/**
 * Scenario 5: API - Products Endpoint
 */
export function testProductsAPI() {
  group('Products API', () => {
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/api/products`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    const duration = Date.now() - startTime;

    apiResponseTime.add(duration);

    const success = check(res, {
      'API: status is 200': (r) => r.status === 200,
      'API: response time < 500ms': (r) => r.timings.duration < 500,
      'API: is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
    });

    if (success) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
  });
}

/**
 * Scenario 6: API - Farms Endpoint
 */
export function testFarmsAPI() {
  group('Farms API', () => {
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/api/farms`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    const duration = Date.now() - startTime;

    apiResponseTime.add(duration);

    const success = check(res, {
      'Farms API: status is 200': (r) => r.status === 200,
      'Farms API: response time < 500ms': (r) => r.timings.duration < 500,
      'Farms API: is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
    });

    if (success) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
  });
}

/**
 * Scenario 7: Static Assets
 */
export function testStaticAssets() {
  group('Static Assets', () => {
    const assets = [
      '/_next/static/css/app.css',
      '/favicon.ico',
      '/images/logo.png',
    ];

    const responses = http.batch(
      assets.map(asset => ['GET', `${BASE_URL}${asset}`])
    );

    responses.forEach((res, index) => {
      check(res, {
        [`Asset ${assets[index]}: loads successfully`]: (r) => r.status === 200 || r.status === 304,
      });
    });
  });
}

/**
 * Scenario 8: Full User Journey
 */
export function testUserJourney() {
  group('Complete User Journey', () => {
    // 1. Visit homepage
    let res = http.get(BASE_URL);
    checkResponse(res, 'Journey: Homepage');
    sleep(1);

    // 2. Browse marketplace
    res = http.get(`${BASE_URL}/marketplace`);
    checkResponse(res, 'Journey: Marketplace');
    sleep(2);

    // 3. Search for products
    const searchTerm = randomItem(SEARCH_TERMS);
    res = http.get(`${BASE_URL}/marketplace?search=${searchTerm}`);
    checkResponse(res, 'Journey: Search');
    sleep(1);

    // 4. Filter by category
    const category = randomItem(PRODUCT_CATEGORIES);
    res = http.get(`${BASE_URL}/marketplace?category=${category}`);
    checkResponse(res, 'Journey: Filter');
    sleep(2);

    // 5. View farms
    res = http.get(`${BASE_URL}/farms`);
    checkResponse(res, 'Journey: Farms');
    sleep(1);
  });
}

// ============================================================================
// MAIN TEST EXECUTION
// ============================================================================

export default function() {
  // Randomly select a scenario to simulate diverse user behavior
  const scenario = Math.random();

  if (scenario < 0.20) {
    // 20% - Complete user journey
    testUserJourney();
  } else if (scenario < 0.35) {
    // 15% - Just homepage
    testHomepage();
  } else if (scenario < 0.55) {
    // 20% - Marketplace browsing
    testMarketplaceBrowsing();
  } else if (scenario < 0.70) {
    // 15% - Product search
    testProductSearch();
  } else if (scenario < 0.80) {
    // 10% - Category filtering
    testCategoryFilter();
  } else if (scenario < 0.90) {
    // 10% - Products API
    testProductsAPI();
  } else if (scenario < 0.95) {
    // 5% - Farms API
    testFarmsAPI();
  } else {
    // 5% - Static assets
    testStaticAssets();
  }

  // Think time: Random delay between 1-5 seconds
  sleep(Math.random() * 4 + 1);
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

export function setup() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  🚀 K6 Load Testing - Farmers Market Platform             ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Base URL: ${BASE_URL.padEnd(47)}║`);
  console.log('║  Test Duration: ~10 minutes                                ║');
  console.log('║  Peak Load: 150 concurrent users                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Warm up the server
  console.log('🔥 Warming up server...');
  http.get(BASE_URL);
  console.log('✅ Server warmed up\n');
}

export function teardown(data) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ Load Test Complete                                     ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Check the summary below for detailed metrics              ║');
  console.log('║  Green = Pass, Red = Fail                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// ============================================================================
// CUSTOM SUMMARY
// ============================================================================

export function handleSummary(data) {
  const successRate = (data.metrics.successful_requests.values.count /
    (data.metrics.successful_requests.values.count + data.metrics.failed_requests.values.count)) * 100;

  console.log('\n📊 CUSTOM METRICS SUMMARY:');
  console.log('═'.repeat(60));
  console.log(`✅ Successful Requests: ${data.metrics.successful_requests.values.count}`);
  console.log(`❌ Failed Requests: ${data.metrics.failed_requests.values.count}`);
  console.log(`📈 Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`⚡ Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`🎯 95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`🔥 Peak RPS: ${(data.metrics.http_reqs.values.rate).toFixed(2)}`);
  console.log('═'.repeat(60) + '\n');

  return {
    'stdout': JSON.stringify(data, null, 2),
    'summary.json': JSON.stringify(data),
    'summary.html': generateHTMLReport(data),
  };
}

function generateHTMLReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>K6 Load Test Report - Farmers Market Platform</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #2c5282; border-bottom: 3px solid #4299e1; padding-bottom: 10px; }
    .metric { margin: 20px 0; padding: 15px; background: #f7fafc; border-left: 4px solid #4299e1; }
    .metric-title { font-weight: bold; color: #2d3748; margin-bottom: 5px; }
    .metric-value { font-size: 24px; color: #2c5282; }
    .pass { color: #38a169; }
    .fail { color: #e53e3e; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 K6 Load Test Report</h1>
    <p><strong>Platform:</strong> Farmers Market</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>

    <div class="summary">
      <div class="metric">
        <div class="metric-title">Total Requests</div>
        <div class="metric-value">${data.metrics.http_reqs.values.count}</div>
      </div>

      <div class="metric">
        <div class="metric-title">Success Rate</div>
        <div class="metric-value pass">${(100 - data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</div>
      </div>

      <div class="metric">
        <div class="metric-title">Avg Response Time</div>
        <div class="metric-value">${data.metrics.http_req_duration.values.avg.toFixed(2)}ms</div>
      </div>

      <div class="metric">
        <div class="metric-title">95th Percentile</div>
        <div class="metric-value">${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms</div>
      </div>
    </div>

    <h2>Detailed Metrics</h2>
    <pre>${JSON.stringify(data.metrics, null, 2)}</pre>
  </div>
</body>
</html>
  `;
}
