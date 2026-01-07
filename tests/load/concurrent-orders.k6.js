/**
 * K6 Load Testing Script - Concurrent Order Scenarios
 *
 * This script tests the Farmers Market Platform under realistic load conditions,
 * focusing on concurrent order creation, payment processing, and inventory management.
 *
 * Test Scenarios:
 * - Concurrent user registration and login
 * - Simultaneous product browsing
 * - Concurrent cart operations
 * - Parallel order creation
 * - Concurrent payment processing
 * - Inventory race conditions
 *
 * Usage:
 *   k6 run tests/load/concurrent-orders.k6.js
 *   k6 run --vus 50 --duration 2m tests/load/concurrent-orders.k6.js
 *   k6 run --vus 100 --duration 5m --out json=results.json tests/load/concurrent-orders.k6.js
 *
 * @requires k6 v0.47.0+
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// Test stages - gradual ramp-up and sustained load
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Warm-up: 10 users
    { duration: '1m', target: 30 },    // Ramp-up: 30 users
    { duration: '2m', target: 50 },    // Peak load: 50 users
    { duration: '1m', target: 100 },   // Stress test: 100 users
    { duration: '2m', target: 50 },    // Cool-down: back to 50
    { duration: '30s', target: 0 },    // Wind-down
  ],
  thresholds: {
    // HTTP request success rate
    'http_req_failed': ['rate<0.05'],          // < 5% error rate

    // Response time thresholds
    'http_req_duration': ['p(95)<2000'],        // 95% of requests < 2s
    'http_req_duration{type:api}': ['p(95)<500'], // API endpoints < 500ms
    'http_req_duration{type:page}': ['p(95)<1500'], // Pages < 1.5s

    // Specific operation thresholds
    'order_creation_duration': ['p(95)<3000'],  // Order creation < 3s
    'payment_duration': ['p(95)<5000'],         // Payment processing < 5s
    'cart_operation_duration': ['p(95)<500'],   // Cart ops < 500ms

    // Business metrics
    'order_success_rate': ['rate>0.95'],        // > 95% order success
    'payment_success_rate': ['rate>0.98'],      // > 98% payment success
    'inventory_consistency_rate': ['rate>0.99'], // > 99% inventory consistency
  },
};

// ============================================================================
// Custom Metrics
// ============================================================================

const orderCreationDuration = new Trend('order_creation_duration');
const paymentDuration = new Trend('payment_duration');
const cartOperationDuration = new Trend('cart_operation_duration');

const orderSuccessRate = new Rate('order_success_rate');
const paymentSuccessRate = new Rate('payment_success_rate');
const inventoryConsistencyRate = new Rate('inventory_consistency_rate');

const concurrentOrderAttempts = new Counter('concurrent_order_attempts');
const inventoryConflicts = new Counter('inventory_conflicts');
const paymentFailures = new Counter('payment_failures');

// ============================================================================
// Test Data
// ============================================================================

const TEST_PRODUCTS = [
  { id: 'prod_1', name: 'Organic Tomatoes', price: 4.99, initialInventory: 100 },
  { id: 'prod_2', name: 'Fresh Carrots', price: 3.49, initialInventory: 50 },
  { id: 'prod_3', name: 'Heirloom Lettuce', price: 2.99, initialInventory: 30 },
  { id: 'prod_4', name: 'Sweet Peppers', price: 5.99, initialInventory: 75 },
  { id: 'prod_5', name: 'Organic Cucumbers', price: 3.99, initialInventory: 60 },
];

const USER_ROLES = ['CUSTOMER', 'FARMER', 'ADMIN'];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique test email
 */
function generateEmail() {
  return `loadtest.user.${__VU}.${Date.now()}@example.com`;
}

/**
 * Generate random user data
 */
function generateUserData() {
  return {
    email: generateEmail(),
    password: 'LoadTest123!',
    name: `Load Test User ${__VU}`,
    role: 'CUSTOMER',
  };
}

/**
 * Generate random address
 */
function generateAddress() {
  return {
    street: `${randomIntBetween(100, 9999)} Test Street`,
    city: randomItem(['Springfield', 'Portland', 'Austin', 'Denver', 'Seattle']),
    state: randomItem(['CA', 'OR', 'TX', 'CO', 'WA']),
    zipCode: `${randomIntBetween(10000, 99999)}`,
    country: 'USA',
  };
}

/**
 * Make authenticated API request
 */
function apiRequest(method, endpoint, data, token) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { type: 'api' },
  };

  if (token) {
    params.headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;

  let response;
  if (method === 'GET') {
    response = http.get(url, params);
  } else if (method === 'POST') {
    response = http.post(url, JSON.stringify(data), params);
  } else if (method === 'PATCH') {
    response = http.patch(url, JSON.stringify(data), params);
  } else if (method === 'DELETE') {
    response = http.del(url, null, params);
  }

  return response;
}

/**
 * Register and login user
 */
function authenticateUser() {
  const userData = generateUserData();

  // Register
  const registerRes = apiRequest('POST', '/auth/register', userData);

  if (!check(registerRes, {
    'registration successful': (r) => r.status === 201 || r.status === 200,
  })) {
    console.error(`Registration failed for ${userData.email}: ${registerRes.status}`);
    return null;
  }

  // Login
  const loginRes = apiRequest('POST', '/auth/login', {
    email: userData.email,
    password: userData.password,
  });

  if (!check(loginRes, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('data.token') !== undefined,
  })) {
    console.error(`Login failed for ${userData.email}`);
    return null;
  }

  const loginData = loginRes.json('data');
  return {
    token: loginData.token,
    userId: loginData.user.id,
    email: userData.email,
  };
}

/**
 * Browse products
 */
function browseProducts(token) {
  const response = apiRequest('GET', '/products?page=1&limit=20&inStock=true', null, token);

  check(response, {
    'products loaded': (r) => r.status === 200,
    'products returned': (r) => r.json('data') && r.json('data').length > 0,
  });

  return response.json('data') || [];
}

/**
 * Add product to cart
 */
function addToCart(token, productId, quantity) {
  const start = Date.now();

  const response = apiRequest('POST', '/cart/items', {
    productId,
    quantity,
  }, token);

  const duration = Date.now() - start;
  cartOperationDuration.add(duration);

  const success = check(response, {
    'add to cart successful': (r) => r.status === 200 || r.status === 201,
  });

  if (!success && response.status === 409) {
    inventoryConflicts.add(1);
  }

  return success;
}

/**
 * Get cart contents
 */
function getCart(token) {
  const response = apiRequest('GET', '/cart', null, token);

  check(response, {
    'cart retrieved': (r) => r.status === 200,
  });

  return response.json('data');
}

/**
 * Create order from cart
 */
function createOrder(token) {
  const start = Date.now();

  concurrentOrderAttempts.add(1);

  const orderData = {
    shippingAddress: generateAddress(),
    billingAddress: generateAddress(),
    paymentMethod: 'STRIPE',
    notes: `Load test order from VU ${__VU}`,
  };

  const response = apiRequest('POST', '/orders', orderData, token);

  const duration = Date.now() - start;
  orderCreationDuration.add(duration);

  const success = check(response, {
    'order created': (r) => r.status === 201 || r.status === 200,
    'order has ID': (r) => r.json('data.id') !== undefined,
  });

  orderSuccessRate.add(success);

  if (!success) {
    if (response.status === 409) {
      inventoryConflicts.add(1);
      console.log(`Inventory conflict detected for VU ${__VU}`);
    } else {
      console.error(`Order creation failed: ${response.status} - ${response.body}`);
    }
    return null;
  }

  return response.json('data');
}

/**
 * Process payment for order
 */
function processPayment(token, orderId, amount) {
  const start = Date.now();

  // Create payment intent
  const intentRes = apiRequest('POST', '/payments/intent', {
    orderId,
    amount,
    currency: 'usd',
  }, token);

  if (!check(intentRes, {
    'payment intent created': (r) => r.status === 200 || r.status === 201,
  })) {
    paymentFailures.add(1);
    paymentSuccessRate.add(false);
    return false;
  }

  const paymentIntentId = intentRes.json('data.paymentIntentId');

  // Simulate payment processing delay
  sleep(randomIntBetween(1, 3));

  // Confirm payment
  const confirmRes = apiRequest('POST', '/payments/confirm', {
    orderId,
    paymentIntentId,
  }, token);

  const duration = Date.now() - start;
  paymentDuration.add(duration);

  const success = check(confirmRes, {
    'payment confirmed': (r) => r.status === 200,
  });

  paymentSuccessRate.add(success);

  if (!success) {
    paymentFailures.add(1);
  }

  return success;
}

/**
 * Verify inventory consistency
 */
function verifyInventory(token, productId) {
  const response = apiRequest('GET', `/products/${productId}`, null, token);

  const consistent = check(response, {
    'product exists': (r) => r.status === 200,
    'inventory is non-negative': (r) => r.json('data.inventory') >= 0,
  });

  inventoryConsistencyRate.add(consistent);

  return consistent;
}

// ============================================================================
// Main Test Scenario
// ============================================================================

export default function () {
  // Virtual user context
  const vu = __VU;
  const iter = __ITER;

  group('User Authentication', () => {
    const user = authenticateUser();

    if (!user) {
      console.error(`VU ${vu}: Authentication failed, skipping iteration`);
      sleep(5);
      return;
    }

    sleep(randomIntBetween(1, 3));

    group('Product Browsing', () => {
      const products = browseProducts(user.token);

      if (products.length === 0) {
        console.warn(`VU ${vu}: No products available`);
        sleep(2);
        return;
      }

      // Browse multiple pages
      for (let page = 1; page <= 3; page++) {
        apiRequest('GET', `/products?page=${page}&limit=10`, null, user.token);
        sleep(randomIntBetween(1, 2));
      }
    });

    group('Shopping Cart Operations', () => {
      // Add random products to cart
      const numProducts = randomIntBetween(1, 3);

      for (let i = 0; i < numProducts; i++) {
        const product = randomItem(TEST_PRODUCTS);
        const quantity = randomIntBetween(1, 5);

        addToCart(user.token, product.id, quantity);
        sleep(randomIntBetween(1, 2));
      }

      // View cart
      const cart = getCart(user.token);

      if (!cart || !cart.items || cart.items.length === 0) {
        console.warn(`VU ${vu}: Cart is empty after adding items`);
        sleep(2);
        return;
      }

      // Update cart item quantity
      if (cart.items.length > 0) {
        const itemToUpdate = randomItem(cart.items);
        apiRequest('PATCH', `/cart/items/${itemToUpdate.productId}`, {
          quantity: randomIntBetween(1, 10),
        }, user.token);
        sleep(1);
      }
    });

    group('Order Creation (Concurrent)', () => {
      const order = createOrder(user.token);

      if (!order) {
        console.log(`VU ${vu}: Order creation failed, likely due to concurrency`);
        sleep(2);
        return;
      }

      console.log(`VU ${vu}: Order ${order.id} created successfully`);
      sleep(randomIntBetween(1, 2));

      group('Payment Processing', () => {
        const paymentSuccess = processPayment(user.token, order.id, order.total);

        if (paymentSuccess) {
          console.log(`VU ${vu}: Payment for order ${order.id} successful`);
        } else {
          console.error(`VU ${vu}: Payment for order ${order.id} failed`);
        }

        sleep(randomIntBetween(1, 2));

        // Verify order status
        const orderStatusRes = apiRequest('GET', `/orders/${order.id}`, null, user.token);
        check(orderStatusRes, {
          'order status updated': (r) => r.status === 200,
          'order is paid or processing': (r) => {
            const status = r.json('data.status');
            return status === 'PAID' || status === 'PROCESSING';
          },
        });
      });
    });

    group('Inventory Verification', () => {
      // Verify inventory for random products
      const productToCheck = randomItem(TEST_PRODUCTS);
      verifyInventory(user.token, productToCheck.id);
      sleep(1);
    });

    // Cleanup: Logout
    apiRequest('POST', '/auth/logout', null, user.token);
  });

  // Think time between iterations
  sleep(randomIntBetween(3, 7));
}

// ============================================================================
// Setup and Teardown
// ============================================================================

export function setup() {
  console.log('========================================');
  console.log('K6 Load Test - Concurrent Order Scenarios');
  console.log('========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API URL: ${API_URL}`);
  console.log('');
  console.log('Test Configuration:');
  console.log(`  - Max VUs: ${options.stages.reduce((max, s) => Math.max(max, s.target), 0)}`);
  console.log(`  - Total Duration: ${options.stages.reduce((sum, s) => sum + parseDuration(s.duration), 0)}s`);
  console.log('');
  console.log('Starting load test...');
  console.log('========================================');

  // Health check
  const healthRes = http.get(`${API_URL}/health`);
  if (healthRes.status !== 200) {
    console.error('Health check failed! API may not be available.');
    throw new Error('API health check failed');
  }

  return {
    startTime: Date.now(),
  };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;

  console.log('========================================');
  console.log('Load Test Complete');
  console.log('========================================');
  console.log(`Total Duration: ${duration}s`);
  console.log('');
  console.log('Check the test summary above for detailed metrics.');
  console.log('========================================');
}

// Helper to parse duration strings
function parseDuration(duration) {
  const match = duration.match(/^(\d+)([smh])$/);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    default: return 0;
  }
}

// ============================================================================
// Custom Summary
// ============================================================================

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    duration_seconds: data.state.testRunDurationMs / 1000,
    metrics: {
      http_requests: {
        total: data.metrics.http_reqs.values.count,
        rate: data.metrics.http_reqs.values.rate,
      },
      http_request_duration: {
        avg: data.metrics.http_req_duration.values.avg,
        p95: data.metrics.http_req_duration.values['p(95)'],
        p99: data.metrics.http_req_duration.values['p(99)'],
      },
      orders: {
        attempts: data.metrics.concurrent_order_attempts?.values.count || 0,
        success_rate: data.metrics.order_success_rate?.values.rate || 0,
        avg_duration: data.metrics.order_creation_duration?.values.avg || 0,
      },
      payments: {
        success_rate: data.metrics.payment_success_rate?.values.rate || 0,
        avg_duration: data.metrics.payment_duration?.values.avg || 0,
        failures: data.metrics.payment_failures?.values.count || 0,
      },
      inventory: {
        consistency_rate: data.metrics.inventory_consistency_rate?.values.rate || 0,
        conflicts: data.metrics.inventory_conflicts?.values.count || 0,
      },
      errors: {
        http_failures: data.metrics.http_req_failed?.values.rate || 0,
      },
    },
  };

  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'load-test-results.json': JSON.stringify(summary, null, 2),
  };
}
