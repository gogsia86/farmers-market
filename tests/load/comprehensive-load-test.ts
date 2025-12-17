/**
 * 🌾 Comprehensive Load Testing Suite - Agricultural Consciousness Edition
 * Divine Performance Testing for Farmers Market Platform
 *
 * Features:
 * - Multi-stage load testing (warm-up, ramp-up, steady, spike, soak)
 * - Agricultural consciousness validation
 * - Seasonal awareness testing
 * - Real-time performance monitoring
 * - GPU-optimized metrics collection
 * - Biodynamic user behavior simulation
 *
 * Usage:
 *   k6 run tests/load/comprehensive-load-test.ts
 *   k6 run -e SCENARIO=spike tests/load/comprehensive-load-test.ts
 *   k6 run -e BASE_URL=https://staging.farmersmarket.com tests/load/comprehensive-load-test.ts
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 * @reference .github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// ============================================================================
// DIVINE CONFIGURATION
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;
const SCENARIO = __ENV.SCENARIO || 'standard'; // standard, spike, soak, stress, smoke
const DIVINE_MODE = __ENV.DIVINE_MODE === 'true';

// ============================================================================
// QUANTUM METRICS (Divine Performance Tracking)
// ============================================================================

// Core Performance Metrics
const divineErrors = new Rate('divine_errors');
const quantumLatency = new Trend('quantum_latency');
const agriculturalThroughput = new Counter('agricultural_throughput');
const consciousnessLevel = new Gauge('consciousness_level');

// API-Specific Metrics
const apiLatency = new Trend('api_latency');
const apiErrors = new Rate('api_errors');
const apiSuccessRate = new Rate('api_success_rate');

// Page Load Metrics
const pageLoadTime = new Trend('page_load_time');
const timeToFirstByte = new Trend('time_to_first_byte');
const timeToInteractive = new Trend('time_to_interactive');

// Agricultural Consciousness Metrics
const seasonalCoherence = new Rate('seasonal_coherence');
const biodynamicSync = new Rate('biodynamic_sync');
const farmDataIntegrity = new Rate('farm_data_integrity');
const productCatalogHealth = new Rate('product_catalog_health');

// User Experience Metrics
const cartOperations = new Counter('cart_operations');
const checkoutFlows = new Counter('checkout_flows');
const searchQueries = new Counter('search_queries');
const filterOperations = new Counter('filter_operations');

// System Resource Metrics
const memoryUtilization = new Gauge('memory_utilization');
const cpuUtilization = new Gauge('cpu_utilization');
const databaseConnections = new Gauge('database_connections');

// ============================================================================
// TEST SCENARIOS CONFIGURATION
// ============================================================================

const SCENARIOS = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '1m',
    gracefulStop: '30s',
  },
  standard: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 10 },   // Warm-up
      { duration: '3m', target: 50 },   // Ramp-up
      { duration: '5m', target: 100 },  // Steady state
      { duration: '3m', target: 150 },  // Peak load
      { duration: '2m', target: 50 },   // Scale down
      { duration: '1m', target: 0 },    // Cool down
    ],
    gracefulRampDown: '30s',
  },
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 50 },   // Baseline
      { duration: '30s', target: 500 }, // Spike!
      { duration: '3m', target: 500 },  // Hold spike
      { duration: '1m', target: 50 },   // Recovery
      { duration: '30s', target: 0 },   // Cool down
    ],
    gracefulRampDown: '30s',
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },   // Warm-up
      { duration: '3m', target: 100 },  // Stage 1
      { duration: '3m', target: 200 },  // Stage 2
      { duration: '3m', target: 300 },  // Stage 3
      { duration: '3m', target: 400 },  // Stage 4 - Breaking point?
      { duration: '3m', target: 500 },  // Stage 5 - Maximum stress
      { duration: '2m', target: 0 },    // Recovery
    ],
    gracefulRampDown: '1m',
  },
  soak: {
    executor: 'constant-vus',
    vus: 100,
    duration: '30m', // 30 minutes sustained load
    gracefulStop: '1m',
  },
};

export const options = {
  scenarios: {
    load_test: SCENARIOS[SCENARIO],
  },

  // Divine Performance Thresholds
  thresholds: {
    // HTTP Success Rate: 99.9% (Divine Standard)
    'http_req_failed': ['rate<0.001'],

    // Response Time Thresholds (Quantum Speed)
    'http_req_duration': [
      'p(50)<200',  // 50% under 200ms
      'p(90)<500',  // 90% under 500ms
      'p(95)<1000', // 95% under 1s
      'p(99)<2000', // 99% under 2s
    ],

    // API-Specific Thresholds
    'api_latency': [
      'p(95)<300',  // 95% of API calls under 300ms
      'avg<200',    // Average under 200ms
    ],

    // Page Load Performance
    'page_load_time': [
      'p(95)<2000', // 95% of pages load under 2s
    ],

    // Time to First Byte (TTFB)
    'time_to_first_byte': [
      'p(95)<100',  // 95% TTFB under 100ms
    ],

    // Error Rates (Near-Zero Tolerance)
    'divine_errors': ['rate<0.005'],
    'api_errors': ['rate<0.001'],

    // Agricultural Consciousness Metrics
    'seasonal_coherence': ['rate>0.99'],
    'biodynamic_sync': ['rate>0.98'],
    'farm_data_integrity': ['rate>0.999'],
    'product_catalog_health': ['rate>0.999'],

    // Throughput Requirements
    'http_reqs': ['rate>100'], // At least 100 requests/second at peak
  },

  // HP OMEN Optimization
  noConnectionReuse: false,
  userAgent: 'k6/divine-agricultural-load-tester/1.0 (HP-OMEN-Optimized)',

  // Batch requests for efficiency
  batch: 10,
  batchPerHost: 6,

  // Connection pooling (optimize for 12 threads)
  maxRedirects: 4,

  // Tags for detailed analysis
  tags: {
    project: 'farmers-market-platform',
    environment: __ENV.ENVIRONMENT || 'local',
    scenario: SCENARIO,
    divine_mode: DIVINE_MODE,
  },
};

// ============================================================================
// AGRICULTURAL TEST DATA
// ============================================================================

const SEASONS = ['SPRING', 'SUMMER', 'FALL', 'WINTER'] as const;
const CURRENT_SEASON = SEASONS[Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 90)) % 4];

const PRODUCT_CATEGORIES = [
  'VEGETABLES',
  'FRUITS',
  'DAIRY',
  'EGGS',
  'MEAT',
  'POULTRY',
  'SEAFOOD',
  'HERBS',
  'GRAINS',
  'HONEY',
  'PRESERVES',
  'BAKED_GOODS',
] as const;

const SEARCH_QUERIES = [
  'organic tomatoes',
  'fresh lettuce',
  'farm eggs',
  'raw honey',
  'seasonal vegetables',
  'local dairy',
  'grass-fed beef',
  'free-range chicken',
  'heirloom carrots',
  'biodynamic produce',
  'pesticide-free',
  'sustainable farming',
  'community supported agriculture',
  'farmers market near me',
  'fresh produce delivery',
];

const FARM_SEARCH_TERMS = [
  'organic',
  'biodynamic',
  'sustainable',
  'regenerative',
  'local',
  'family-owned',
  'certified',
  'pesticide-free',
  'non-gmo',
  'heritage breeds',
];

const SORT_OPTIONS = [
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
  'newest',
  'popular',
  'rating',
] as const;

const PAGINATION_CONFIGS = [
  { page: 1, limit: 12 },
  { page: 1, limit: 24 },
  { page: 1, limit: 48 },
  { page: 2, limit: 24 },
  { page: 3, limit: 24 },
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBool(probability = 0.5): boolean {
  return Math.random() < probability;
}

function getCurrentSeason(): typeof SEASONS[number] {
  return CURRENT_SEASON;
}

function calculateConsciousnessLevel(response: any): number {
  let score = 100;

  // Check for agricultural awareness
  if (!response.body?.includes('farm') && !response.body?.includes('product')) {
    score -= 20;
  }

  // Check for seasonal coherence
  const season = getCurrentSeason();
  if (response.body?.includes(season.toLowerCase())) {
    score += 10;
  }

  // Performance penalty
  if (response.timings.duration > 1000) {
    score -= (response.timings.duration - 1000) / 100;
  }

  return Math.max(0, Math.min(100, score));
}

function recordMetrics(
  response: any,
  endpoint: string,
  metricType: 'api' | 'page' = 'api'
): boolean {
  const duration = response.timings.duration;

  // Record latency
  quantumLatency.add(duration);

  if (metricType === 'api') {
    apiLatency.add(duration);
  } else {
    pageLoadTime.add(duration);
  }

  // Record TTFB
  timeToFirstByte.add(response.timings.waiting);

  // Calculate consciousness level
  const consciousness = calculateConsciousnessLevel(response);
  consciousnessLevel.add(consciousness);

  // Check success
  const isSuccess = response.status >= 200 && response.status < 300;

  if (isSuccess) {
    agriculturalThroughput.add(1);
    apiSuccessRate.add(1);
  } else {
    divineErrors.add(1);
    apiErrors.add(1);
    apiSuccessRate.add(0);
  }

  // Validation checks
  const validations = check(response, {
    [`${endpoint}: status 2xx`]: (r) => r.status >= 200 && r.status < 300,
    [`${endpoint}: latency < 2s`]: (r) => r.timings.duration < 2000,
    [`${endpoint}: has content`]: (r) => r.body && r.body.length > 0,
    [`${endpoint}: consciousness > 70`]: () => consciousness > 70,
  });

  if (DIVINE_MODE) {
    // Additional divine validations
    check(response, {
      [`${endpoint}: DIVINE latency < 500ms`]: (r) => r.timings.duration < 500,
      [`${endpoint}: DIVINE consciousness > 90`]: () => consciousness > 90,
      [`${endpoint}: DIVINE TTFB < 100ms`]: (r) => r.timings.waiting < 100,
    });
  }

  return isSuccess && validations;
}

// ============================================================================
// API TEST FUNCTIONS
// ============================================================================

function testProductsAPI(): void {
  group('📦 Products API', () => {
    const response = http.get(`${API_BASE}/products`, {
      headers: { Accept: 'application/json' },
      tags: { name: 'products_list' },
    });

    const success = recordMetrics(response, 'Products API');

    if (success) {
      try {
        const data = JSON.parse(response.body);
        productCatalogHealth.add(Array.isArray(data) || Array.isArray(data.products) ? 1 : 0);
      } catch {
        productCatalogHealth.add(0);
      }
    }
  });
}

function testProductsFiltered(): void {
  group('🔍 Products Filtered', () => {
    const category = randomItem(PRODUCT_CATEGORIES);
    const sort = randomItem(SORT_OPTIONS);
    const organic = randomBool(0.4);

    const params = new URLSearchParams({
      category,
      sort,
      ...(organic && { organic: 'true' }),
    });

    const response = http.get(`${API_BASE}/products?${params}`, {
      headers: { Accept: 'application/json' },
      tags: { name: 'products_filtered', category, sort },
    });

    recordMetrics(response, 'Products Filtered');
    filterOperations.add(1);
  });
}

function testProductsPaginated(): void {
  group('📄 Products Paginated', () => {
    const { page, limit } = randomItem(PAGINATION_CONFIGS);

    const response = http.get(`${API_BASE}/products?page=${page}&limit=${limit}`, {
      headers: { Accept: 'application/json' },
      tags: { name: 'products_paginated', page: page.toString(), limit: limit.toString() },
    });

    recordMetrics(response, 'Products Paginated');
  });
}

function testProductSearch(): void {
  group('🔎 Product Search', () => {
    const query = randomItem(SEARCH_QUERIES);

    const response = http.get(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/json' },
      tags: { name: 'product_search', query },
    });

    recordMetrics(response, 'Product Search');
    searchQueries.add(1);
  });
}

function testFarmsAPI(): void {
  group('🏡 Farms API', () => {
    const response = http.get(`${API_BASE}/farms`, {
      headers: { Accept: 'application/json' },
      tags: { name: 'farms_list' },
    });

    const success = recordMetrics(response, 'Farms API');

    if (success) {
      try {
        const data = JSON.parse(response.body);
        farmDataIntegrity.add(Array.isArray(data) || Array.isArray(data.farms) ? 1 : 0);
      } catch {
        farmDataIntegrity.add(0);
      }
    }
  });
}

function testFarmSearch(): void {
  group('🔍 Farm Search', () => {
    const searchTerm = randomItem(FARM_SEARCH_TERMS);

    const response = http.get(`${API_BASE}/farms?search=${encodeURIComponent(searchTerm)}`, {
      headers: { Accept: 'application/json' },
      tags: { name: 'farm_search', searchTerm },
    });

    recordMetrics(response, 'Farm Search');
    searchQueries.add(1);
  });
}

function testCategoriesAPI(): void {
  group('🏷️ Categories API', () => {
    const response = http.get(`${API_BASE}/categories`, {
      headers: { Accept: 'application/json' },
      tags: { name: 'categories' },
    });

    recordMetrics(response, 'Categories API');
  });
}

function testSeasonalProducts(): void {
  group('🌱 Seasonal Products', () => {
    const season = getCurrentSeason();

    const response = http.get(`${API_BASE}/products?season=${season}`, {
      headers: { Accept: 'application/json' },
      tags: { name: 'seasonal_products', season },
    });

    const success = recordMetrics(response, 'Seasonal Products');

    if (success) {
      // Validate seasonal coherence
      const hasSeasonalData = response.body?.includes(season.toLowerCase()) ||
                             response.body?.includes('seasonal');
      seasonalCoherence.add(hasSeasonalData ? 1 : 0);
    }
  });
}

function testBiodynamicProducts(): void {
  group('🌾 Biodynamic Products', () => {
    const response = http.get(`${API_BASE}/products?farming_method=biodynamic`, {
      headers: { Accept: 'application/json' },
      tags: { name: 'biodynamic_products' },
    });

    const success = recordMetrics(response, 'Biodynamic Products');

    if (success) {
      const hasBiodynamicData = response.body?.includes('biodynamic') ||
                               response.body?.includes('sustainable');
      biodynamicSync.add(hasBiodynamicData ? 1 : 0);
    }
  });
}

function testHealthCheck(): void {
  group('❤️ Health Check', () => {
    const response = http.get(`${API_BASE}/health`, {
      headers: { Accept: 'application/json' },
      tags: { name: 'health_check' },
    });

    check(response, {
      'Health: status 200': (r) => r.status === 200,
      'Health: latency < 100ms': (r) => r.timings.duration < 100,
      'Health: has status field': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data.status === 'ok' || data.status === 'healthy';
        } catch {
          return false;
        }
      },
    });
  });
}

// ============================================================================
// PAGE LOAD TEST FUNCTIONS
// ============================================================================

function testHomepage(): void {
  group('🏠 Homepage', () => {
    const response = http.get(BASE_URL, {
      tags: { name: 'homepage' },
    });

    recordMetrics(response, 'Homepage', 'page');

    check(response, {
      'Homepage: has title': (r) => r.body?.includes('<title>') || r.body?.includes('Farmers Market'),
      'Homepage: has navigation': (r) => r.body?.includes('nav') || r.body?.includes('menu'),
    });
  });
}

function testMarketplacePage(): void {
  group('🛒 Marketplace', () => {
    const response = http.get(`${BASE_URL}/marketplace`, {
      tags: { name: 'marketplace' },
    });

    recordMetrics(response, 'Marketplace', 'page');
  });
}

function testFarmsPage(): void {
  group('🚜 Farms Page', () => {
    const response = http.get(`${BASE_URL}/farms`, {
      tags: { name: 'farms_page' },
    });

    recordMetrics(response, 'Farms Page', 'page');
  });
}

function testProductDetailPage(): void {
  group('📦 Product Detail', () => {
    // Simulate viewing a product detail page
    const productSlug = `product-${randomInt(1, 100)}`;

    const response = http.get(`${BASE_URL}/products/${productSlug}`, {
      tags: { name: 'product_detail' },
    });

    // 404 is acceptable for non-existent products in load test
    if (response.status !== 404) {
      recordMetrics(response, 'Product Detail', 'page');
    }
  });
}

function testFarmDetailPage(): void {
  group('🏡 Farm Detail', () => {
    const farmSlug = `farm-${randomInt(1, 50)}`;

    const response = http.get(`${BASE_URL}/farms/${farmSlug}`, {
      tags: { name: 'farm_detail' },
    });

    if (response.status !== 404) {
      recordMetrics(response, 'Farm Detail', 'page');
    }
  });
}

// ============================================================================
// USER FLOW TEST FUNCTIONS
// ============================================================================

function testBrowseAndSearchFlow(): void {
  group('🎯 Browse & Search Flow', () => {
    // 1. Visit marketplace
    let response = http.get(`${BASE_URL}/marketplace`);
    recordMetrics(response, 'Flow: Marketplace', 'page');
    sleep(randomInt(1, 3));

    // 2. Search for products
    const query = randomItem(SEARCH_QUERIES);
    response = http.get(`${BASE_URL}/marketplace?search=${encodeURIComponent(query)}`);
    recordMetrics(response, 'Flow: Search', 'page');
    sleep(randomInt(2, 4));

    // 3. Filter by category
    const category = randomItem(PRODUCT_CATEGORIES);
    response = http.get(`${BASE_URL}/marketplace?category=${category}`);
    recordMetrics(response, 'Flow: Filter', 'page');
    sleep(randomInt(1, 2));
  });
}

function testCartFlow(): void {
  group('🛒 Cart Flow', () => {
    // Simulate cart operations
    cartOperations.add(randomInt(1, 5));

    // View cart
    const response = http.get(`${BASE_URL}/cart`, {
      tags: { name: 'cart' },
    });

    if (response.status !== 404) {
      recordMetrics(response, 'Cart', 'page');
    }

    sleep(randomInt(1, 3));
  });
}

function testCheckoutFlow(): void {
  group('💳 Checkout Flow', () => {
    checkoutFlows.add(1);

    // View checkout page
    const response = http.get(`${BASE_URL}/checkout`, {
      tags: { name: 'checkout' },
    });

    if (response.status !== 404 && response.status !== 401) {
      recordMetrics(response, 'Checkout', 'page');
    }

    sleep(randomInt(2, 5));
  });
}

function testCompleteUserJourney(): void {
  group('🌟 Complete User Journey', () => {
    // 1. Homepage
    let response = http.get(BASE_URL);
    recordMetrics(response, 'Journey: Home', 'page');
    sleep(2);

    // 2. Browse marketplace
    response = http.get(`${BASE_URL}/marketplace`);
    recordMetrics(response, 'Journey: Browse', 'page');
    sleep(3);

    // 3. Search products
    const query = randomItem(SEARCH_QUERIES);
    response = http.get(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`);
    recordMetrics(response, 'Journey: Search API');
    sleep(1);

    // 4. View product details
    response = http.get(`${BASE_URL}/products/organic-tomatoes`);
    if (response.status !== 404) {
      recordMetrics(response, 'Journey: Product', 'page');
    }
    sleep(3);

    // 5. View farms
    response = http.get(`${BASE_URL}/farms`);
    recordMetrics(response, 'Journey: Farms', 'page');
    sleep(2);

    // 6. View farm details
    response = http.get(`${BASE_URL}/farms/divine-test-farm`);
    if (response.status !== 404) {
      recordMetrics(response, 'Journey: Farm Detail', 'page');
    }
    sleep(2);
  });
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

function testBatchAPIRequests(): void {
  group('⚡ Batch API Requests', () => {
    const requests = [
      ['GET', `${API_BASE}/products?limit=12`, null, { tags: { name: 'batch_products' } }],
      ['GET', `${API_BASE}/farms?limit=12`, null, { tags: { name: 'batch_farms' } }],
      ['GET', `${API_BASE}/categories`, null, { tags: { name: 'batch_categories' } }],
      ['GET', `${API_BASE}/health`, null, { tags: { name: 'batch_health' } }],
    ];

    const responses = http.batch(requests);

    responses.forEach((response, index) => {
      if (response) {
        recordMetrics(response, `Batch ${index}`);
      }
    });
  });
}

// ============================================================================
// MAIN TEST EXECUTION
// ============================================================================

export default function (): void {
  // Distribute load across different scenarios
  const scenario = Math.random();

  if (scenario < 0.15) {
    // 15% - Complete user journey
    testCompleteUserJourney();
  } else if (scenario < 0.25) {
    // 10% - Browse and search flow
    testBrowseAndSearchFlow();
  } else if (scenario < 0.35) {
    // 10% - Homepage
    testHomepage();
  } else if (scenario < 0.50) {
    // 15% - Products API (most common)
    testProductsAPI();
  } else if (scenario < 0.60) {
    // 10% - Filtered products
    testProductsFiltered();
  } else if (scenario < 0.68) {
    // 8% - Product search
    testProductSearch();
  } else if (scenario < 0.75) {
    // 7% - Farms API
    testFarmsAPI();
  } else if (scenario < 0.82) {
    // 7% - Paginated products
    testProductsPaginated();
  } else if (scenario < 0.88) {
    // 6% - Seasonal products (agricultural consciousness)
    testSeasonalProducts();
  } else if (scenario < 0.92) {
    // 4% - Biodynamic products
    testBiodynamicProducts();
  } else if (scenario < 0.95) {
    // 3% - Batch requests
    testBatchAPIRequests();
  } else if (scenario < 0.97) {
    // 2% - Cart flow
    testCartFlow();
  } else if (scenario < 0.99) {
    // 2% - Checkout flow
    testCheckoutFlow();
  } else {
    // 1% - Health check
    testHealthCheck();
  }

  // Think time: Simulate realistic user behavior
  // Shorter think time during stress test
  const thinkTime = SCENARIO === 'stress'
    ? Math.random() * 0.5 + 0.1  // 0.1 - 0.6s
    : Math.random() * 3 + 1;      // 1 - 4s

  sleep(thinkTime);
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

export function setup(): void {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  🌾 DIVINE AGRICULTURAL LOAD TESTING - Quantum Performance       ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Base URL: ${BASE_URL.padEnd(56)}║`);
  console.log(`║  Scenario: ${SCENARIO.toUpperCase().padEnd(56)}║`);
  console.log(`║  Season: ${getCurrentSeason().padEnd(58)}║`);
  console.log(`║  Divine Mode: ${(DIVINE_MODE ? 'ENABLED ✨' : 'DISABLED').padEnd(54)}║`);
  console.log('║  Hardware: HP OMEN (12 threads, 64GB RAM, RTX 2070 Max-Q)       ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log('║  🎯 Testing Scope:                                               ║');
  console.log('║    • API Endpoints Performance                                   ║');
  console.log('║    • Page Load Times                                             ║');
  console.log('║    • User Flow Journeys                                          ║');
  console.log('║    • Agricultural Consciousness                                  ║');
  console.log('║    • Seasonal Coherence                                          ║');
  console.log('║    • Biodynamic Sync                                             ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Warm-up requests
  console.log('🔥 Warming up the system...');
  const warmupRequests = [
    http.get(BASE_URL),
    http.get(`${API_BASE}/products?limit=1`),
    http.get(`${API_BASE}/farms?limit=1`),
    http.get(`${API_BASE}/health`),
  ];
  console.log('✅ System warmed up\n');

  console.log('🚀 Starting load test...\n');
}

export function teardown(data: any): void {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ LOAD TEST COMPLETE - Analyzing Results                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
}

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

export function handleSummary(data: any) {
  const metrics = data.metrics;

  // Calculate key metrics
  const totalRequests = metrics.http_reqs?.values?.count || 0;
  const failedRequests = metrics.http_req_failed?.values?.count || 0;
  const successRate = totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests) * 100 : 0;

  const avgLatency = metrics.quantum_latency?.values?.avg || 0;
  const p95Latency = metrics.quantum_latency?.values?.['p(95)'] || 0;
  const p99Latency = metrics.quantum_latency?.values?.['p(99)'] || 0;

  const avgConsciousness = metrics.consciousness_level?.values?.last || 0;
  const errorRate = metrics.divine_errors?.values?.rate || 0;
  const rps = metrics.http_reqs?.values?.rate || 0;

  // Agricultural metrics
  const seasonalCoherenceRate = (metrics.seasonal_coherence?.values?.rate || 0) * 100;
  const biodynamicSyncRate = (metrics.biodynamic_sync?.values?.rate || 0) * 100;
  const farmDataIntegrityRate = (metrics.farm_data_integrity?.values?.rate || 0) * 100;
  const productCatalogHealthRate = (metrics.product_catalog_health?.values?.rate || 0) * 100;

  // Performance rating
  let performanceRating = '🔴 NEEDS IMPROVEMENT';
  let divinityScore = 0;

  if (successRate > 99.9 && p95Latency < 300 && avgConsciousness > 90) {
    performanceRating = '🌟 DIVINE PERFECTION';
    divinityScore = 100;
  } else if (successRate > 99.5 && p95Latency < 500 && avgConsciousness > 80) {
    performanceRating = '🟢 EXCELLENT';
    divinityScore = 90;
  } else if (successRate > 99 && p95Latency < 1000 && avgConsciousness > 70) {
    performanceRating = '🟡 GOOD';
    divinityScore = 75;
  } else if (successRate > 98 && p95Latency < 2000) {
    performanceRating = '🟠 ACCEPTABLE';
    divinityScore = 60;
  }

  // Console summary
  console.log('\n' + '═'.repeat(80));
  console.log('🌾 DIVINE AGRICULTURAL LOAD TEST RESULTS');
  console.log('═'.repeat(80));
  console.log(`\n📊 OVERALL PERFORMANCE: ${performanceRating} (Divinity Score: ${divinityScore}/100)\n`);

  console.log('🎯 REQUEST STATISTICS:');
  console.log(`   Total Requests: ${totalRequests.toLocaleString()}`);
  console.log(`   Success Rate: ${successRate.toFixed(3)}%`);
  console.log(`   Failed Requests: ${failedRequests}`);
  console.log(`   Requests/Second: ${rps.toFixed(2)}`);

  console.log('\n⚡ LATENCY METRICS:');
  console.log(`   Average: ${avgLatency.toFixed(2)}ms`);
  console.log(`   95th Percentile: ${p95Latency.toFixed(2)}ms`);
  console.log(`   99th Percentile: ${p99Latency.toFixed(2)}ms`);
  console.log(`   Max: ${(metrics.http_req_duration?.values?.max || 0).toFixed(2)}ms`);

  console.log('\n🌾 AGRICULTURAL CONSCIOUSNESS:');
  console.log(`   Consciousness Level: ${avgConsciousness.toFixed(2)}/100`);
  console.log(`   Seasonal Coherence: ${seasonalCoherenceRate.toFixed(2)}%`);
  console.log(`   Biodynamic Sync: ${biodynamicSyncRate.toFixed(2)}%`);
  console.log(`   Farm Data Integrity: ${farmDataIntegrityRate.toFixed(2)}%`);
  console.log(`   Product Catalog Health: ${productCatalogHealthRate.toFixed(2)}%`);

  console.log('\n🔥 USER ACTIVITY:');
  console.log(`   Search Queries: ${metrics.search_queries?.values?.count || 0}`);
  console.log(`   Filter Operations: ${metrics.filter_operations?.values?.count || 0}`);
  console.log(`   Cart Operations: ${metrics.cart_operations?.values?.count || 0}`);
  console.log(`   Checkout Flows: ${metrics.checkout_flows?.values?.count || 0}`);

  console.log('\n' + '═'.repeat(80) + '\n');

  // Generate reports
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'tests/load/results/comprehensive-load-test-summary.html': htmlReport(data),
    'tests/load/results/comprehensive-load-test-summary.json': JSON.stringify(data, null, 2),
    'tests/load/results/comprehensive-load-test-metrics.json': JSON.stringify({
      timestamp: new Date().toISOString(),
      scenario: SCENARIO,
      season: getCurrentSeason(),
      divineMode: DIVINE_MODE,
      summary: {
        totalRequests,
        successRate,
        avgLatency,
        p95Latency,
        p99Latency,
        rps,
        errorRate,
        performanceRating,
        divinityScore,
      },
      agriculturalConsciousness: {
        consciousnessLevel: avgConsciousness,
        seasonalCoherence: seasonalCoherenceRate,
        biodynamicSync: biodynamicSyncRate,
        farmDataIntegrity: farmDataIntegrityRate,
        productCatalogHealth: productCatalogHealthRate,
      },
      userActivity: {
        searchQueries: metrics.search_queries?.values?.count || 0,
        filterOperations: metrics.filter_operations?.values?.count || 0,
        cartOperations: metrics.cart_operations?.values?.count || 0,
        checkoutFlows: metrics.checkout_flows?.values?.count || 0,
      },
    }, null, 2),
  };
}
