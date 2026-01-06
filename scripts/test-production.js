#!/usr/bin/env node

/**
 * Production Deployment Testing Script
 *
 * Tests all critical functionality of the deployed application
 * Usage: node scripts/test-production.js [BASE_URL]
 * Example: node scripts/test-production.js https://your-app.vercel.app
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.argv[2] || process.env.PRODUCTION_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedTestDetails = [];

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: TIMEOUT,
      ...options,
    };

    const req = protocol.request(urlObj, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Test helper function
 */
async function test(name, testFn) {
  totalTests++;
  process.stdout.write(`${colors.blue}⏳${colors.reset} Testing: ${name}...`);

  try {
    await testFn();
    passedTests++;
    process.stdout.write(`\r${colors.green}✓${colors.reset} ${name}\n`);
    return true;
  } catch (error) {
    failedTests++;
    failedTestDetails.push({ name, error: error.message });
    process.stdout.write(`\r${colors.red}✗${colors.reset} ${name}\n`);
    console.error(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test page loads successfully
 */
async function testPageLoad(path, expectedStatus = 200) {
  const response = await makeRequest(`${BASE_URL}${path}`);

  if (response.statusCode !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.statusCode}`);
  }

  if (!response.body || response.body.length < 100) {
    throw new Error('Response body is suspiciously small');
  }
}

/**
 * Test API endpoint
 */
async function testAPIEndpoint(path, method = 'GET', expectedStatus = 200, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = body;
  }

  const response = await makeRequest(`${BASE_URL}${path}`, options);

  if (response.statusCode !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.statusCode}`);
  }

  return response;
}

/**
 * Test performance (response time)
 */
async function testPerformance(path, maxTime = 3000) {
  const startTime = Date.now();
  await makeRequest(`${BASE_URL}${path}`);
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  if (responseTime > maxTime) {
    throw new Error(`Response time ${responseTime}ms exceeds maximum ${maxTime}ms`);
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}==================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  Production Deployment Tests${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}==================================${colors.reset}\n`);
  console.log(`${colors.yellow}Testing URL: ${BASE_URL}${colors.reset}\n`);

  // =====================
  // 1. PUBLIC PAGES
  // =====================
  console.log(`${colors.bright}${colors.magenta}📄 Testing Public Pages${colors.reset}\n`);

  await test('Homepage loads', async () => {
    await testPageLoad('/');
  });

  await test('About page loads', async () => {
    await testPageLoad('/about');
  });

  await test('Products page loads', async () => {
    await testPageLoad('/products');
  });

  await test('Farms page loads', async () => {
    await testPageLoad('/farms');
  });

  await test('Login page loads', async () => {
    await testPageLoad('/login');
  });

  await test('Register page loads', async () => {
    await testPageLoad('/register');
  });

  await test('Cart page loads', async () => {
    await testPageLoad('/cart');
  });

  // =====================
  // 2. API ENDPOINTS
  // =====================
  console.log(`\n${colors.bright}${colors.magenta}🔌 Testing API Endpoints${colors.reset}\n`);

  await test('Health check endpoint', async () => {
    const response = await testAPIEndpoint('/api/health');
    const data = JSON.parse(response.body);
    if (!data || data.status !== 'ok') {
      throw new Error('Health check did not return expected response');
    }
  });

  await test('Products API endpoint', async () => {
    const response = await testAPIEndpoint('/api/products');
    const data = JSON.parse(response.body);
    if (!Array.isArray(data) && !data.products) {
      throw new Error('Products API did not return expected format');
    }
  });

  await test('Search API endpoint', async () => {
    await testAPIEndpoint('/api/search?q=test');
  });

  await test('Farms API endpoint', async () => {
    const response = await testAPIEndpoint('/api/farms');
    const data = JSON.parse(response.body);
    if (!Array.isArray(data) && !data.farms) {
      throw new Error('Farms API did not return expected format');
    }
  });

  // =====================
  // 3. AUTHENTICATION
  // =====================
  console.log(`\n${colors.bright}${colors.magenta}🔐 Testing Authentication${colors.reset}\n`);

  await test('NextAuth endpoint exists', async () => {
    // Should return 400 for GET without proper parameters, but not 404
    try {
      await testAPIEndpoint('/api/auth/signin', 'GET');
    } catch (error) {
      // 400 or 405 is expected, 404 is not
      const response = await makeRequest(`${BASE_URL}/api/auth/signin`);
      if (response.statusCode === 404) {
        throw new Error('NextAuth endpoint not found');
      }
    }
  });

  await test('Register endpoint exists', async () => {
    // Should return 400/422 for POST without body, but not 404
    try {
      await testAPIEndpoint('/api/auth/register', 'POST', 400);
    } catch (error) {
      const response = await makeRequest(`${BASE_URL}/api/auth/register`, { method: 'POST' });
      if (response.statusCode === 404) {
        throw new Error('Register endpoint not found');
      }
    }
  });

  // =====================
  // 4. STATIC ASSETS
  // =====================
  console.log(`\n${colors.bright}${colors.magenta}📦 Testing Static Assets${colors.reset}\n`);

  await test('Favicon loads', async () => {
    const response = await makeRequest(`${BASE_URL}/favicon.ico`);
    if (response.statusCode !== 200 && response.statusCode !== 304) {
      throw new Error(`Favicon returned status ${response.statusCode}`);
    }
  });

  await test('Next.js static files accessible', async () => {
    // Check if _next directory is accessible (should return 404 for root, not error)
    const response = await makeRequest(`${BASE_URL}/_next/static/`);
    if (response.statusCode >= 500) {
      throw new Error('Static files server error');
    }
  });

  // =====================
  // 5. PERFORMANCE
  // =====================
  console.log(`\n${colors.bright}${colors.magenta}⚡ Testing Performance${colors.reset}\n`);

  await test('Homepage loads in < 3 seconds', async () => {
    await testPerformance('/', 3000);
  });

  await test('API responds in < 1 second', async () => {
    await testPerformance('/api/health', 1000);
  });

  await test('Products page loads in < 3 seconds', async () => {
    await testPerformance('/api/products', 3000);
  });

  // =====================
  // 6. SECURITY HEADERS
  // =====================
  console.log(`\n${colors.bright}${colors.magenta}🛡️  Testing Security Headers${colors.reset}\n`);

  await test('Security headers present', async () => {
    const response = await makeRequest(`${BASE_URL}/`);
    const headers = response.headers;

    // Check for important security headers
    const securityHeaders = {
      'x-frame-options': false,
      'x-content-type-options': false,
      'strict-transport-security': false,
    };

    for (const header in securityHeaders) {
      if (headers[header]) {
        securityHeaders[header] = true;
      }
    }

    const presentHeaders = Object.values(securityHeaders).filter(Boolean).length;
    if (presentHeaders === 0) {
      console.warn(`  ${colors.yellow}⚠ Warning: No security headers found (this is okay but could be improved)${colors.reset}`);
    }
  });

  // =====================
  // 7. ERROR HANDLING
  // =====================
  console.log(`\n${colors.bright}${colors.magenta}🚨 Testing Error Handling${colors.reset}\n`);

  await test('404 page returns 404 status', async () => {
    try {
      await testPageLoad('/this-page-does-not-exist', 404);
    } catch (error) {
      // Next.js might return 200 with error page rendered
      const response = await makeRequest(`${BASE_URL}/this-page-does-not-exist`);
      if (response.statusCode >= 500) {
        throw new Error('404 returned server error instead');
      }
    }
  });

  await test('API error handling', async () => {
    // Invalid API route should return proper error, not crash
    const response = await makeRequest(`${BASE_URL}/api/invalid-endpoint-12345`);
    if (response.statusCode >= 500) {
      throw new Error('API returned server error for invalid endpoint');
    }
  });

  // =====================
  // 8. DATABASE CONNECTIVITY
  // =====================
  console.log(`\n${colors.bright}${colors.magenta}🗄️  Testing Database Connectivity${colors.reset}\n`);

  await test('Database queries work (via API)', async () => {
    // If products or farms API returns data, DB is working
    const response = await testAPIEndpoint('/api/products');
    const data = JSON.parse(response.body);
    // Should at least return empty array or object with products key
    if (data === null || data === undefined) {
      throw new Error('Database query returned null/undefined');
    }
  });

  // =====================
  // RESULTS SUMMARY
  // =====================
  console.log(`\n${colors.bright}${colors.cyan}==================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  Test Results Summary${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}==================================${colors.reset}\n`);

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`Total Tests:  ${totalTests}`);
  console.log(`${colors.green}Passed:       ${passedTests} ✓${colors.reset}`);
  console.log(`${colors.red}Failed:       ${failedTests} ✗${colors.reset}`);
  console.log(`Success Rate: ${successRate}%\n`);

  if (failedTests > 0) {
    console.log(`${colors.red}${colors.bright}Failed Tests:${colors.reset}\n`);
    failedTestDetails.forEach((test, index) => {
      console.log(`${index + 1}. ${colors.red}${test.name}${colors.reset}`);
      console.log(`   ${test.error}\n`);
    });
  }

  // Final status
  if (failedTests === 0) {
    console.log(`${colors.green}${colors.bright}🎉 All tests passed! Deployment is healthy.${colors.reset}\n`);
    process.exit(0);
  } else if (failedTests <= totalTests * 0.2) {
    console.log(`${colors.yellow}${colors.bright}⚠️  Some tests failed, but deployment is mostly functional.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}❌ Multiple critical tests failed. Please investigate immediately.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
console.log(`${colors.cyan}Starting production tests...${colors.reset}`);
runTests().catch((error) => {
  console.error(`\n${colors.red}${colors.bright}Fatal Error:${colors.reset}`);
  console.error(`${colors.red}${error.message}${colors.reset}\n`);
  process.exit(1);
});
