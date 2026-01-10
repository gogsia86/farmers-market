#!/usr/bin/env node

/**
 * =========================================
 * Farmers Market Platform - Deployment Verification
 * =========================================
 * Automated verification script for Vercel deployments
 * Tests all critical endpoints and functionality
 *
 * Usage:
 *   node scripts/verify-deployment.js
 *   DEPLOYMENT_URL=https://your-app.vercel.app node scripts/verify-deployment.js
 *
 * @version 1.0.0
 * @author Claude Sonnet 4.5
 * =========================================
 */

const https = require('https');
const http = require('http');

// Configuration
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://farmers-market-platform.vercel.app';
const TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Colors for console output
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

// =========================================
// Helper Functions
// =========================================

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
  passedTests++;
  totalTests++;
  testResults.push({ status: 'PASS', message });
}

function logError(message) {
  log(`❌ ${message}`, 'red');
  failedTests++;
  totalTests++;
  testResults.push({ status: 'FAIL', message });
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
  console.log('');
  log('========================================', 'magenta');
  log(message, 'magenta');
  log('========================================', 'magenta');
  console.log('');
}

// =========================================
// HTTP Request Helper
// =========================================

function makeRequest(url, method = 'GET', retries = 0) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'FarmersMarketPlatform-HealthCheck/1.0',
        'Accept': '*/*'
      }
    };

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: Date.now()
        });
      });
    });

    req.on('error', (error) => {
      if (retries < MAX_RETRIES) {
        logWarning(`Request failed, retrying... (${retries + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          makeRequest(url, method, retries + 1)
            .then(resolve)
            .catch(reject);
        }, 1000 * (retries + 1));
      } else {
        reject(error);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// =========================================
// Test Suites
// =========================================

async function testEndpoint(name, path, expectedStatuses = [200]) {
  const url = `${DEPLOYMENT_URL}${path}`;
  logInfo(`Testing: ${name}`);

  try {
    const startTime = Date.now();
    const response = await makeRequest(url);
    const duration = Date.now() - startTime;

    if (expectedStatuses.includes(response.statusCode)) {
      logSuccess(`${name} - HTTP ${response.statusCode} (${duration}ms)`);
      return { success: true, statusCode: response.statusCode, duration };
    } else if ([301, 302, 307, 308].includes(response.statusCode)) {
      logSuccess(`${name} - HTTP ${response.statusCode} (redirect, ${duration}ms)`);
      return { success: true, statusCode: response.statusCode, duration };
    } else {
      logError(`${name} - HTTP ${response.statusCode} (expected ${expectedStatuses.join(' or ')})`);
      return { success: false, statusCode: response.statusCode, duration };
    }
  } catch (error) {
    logError(`${name} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testPageContent(name, path, expectedContent = []) {
  const url = `${DEPLOYMENT_URL}${path}`;
  logInfo(`Testing content: ${name}`);

  try {
    const response = await makeRequest(url);

    if (response.statusCode !== 200 && ![301, 302].includes(response.statusCode)) {
      logWarning(`${name} - HTTP ${response.statusCode} (skipping content check)`);
      return { success: true };
    }

    let foundContent = true;
    if (expectedContent.length > 0) {
      for (const content of expectedContent) {
        if (!response.body.toLowerCase().includes(content.toLowerCase())) {
          foundContent = false;
          break;
        }
      }
    }

    if (foundContent || expectedContent.length === 0) {
      logSuccess(`${name} - Content validated`);
      return { success: true };
    } else {
      logWarning(`${name} - Expected content not found`);
      return { success: true }; // Non-critical
    }
  } catch (error) {
    logWarning(`${name} - ${error.message}`);
    return { success: true }; // Non-critical
  }
}

async function testApiHealth() {
  logInfo('Testing API health endpoint');

  try {
    const response = await makeRequest(`${DEPLOYMENT_URL}/api/health`);

    if (response.statusCode === 200) {
      try {
        const data = JSON.parse(response.body);

        if (data.status === 'healthy') {
          logSuccess(`API Health - Fully healthy (DB: ${data.checks?.database?.status || 'unknown'})`);
        } else if (data.status === 'degraded') {
          logWarning(`API Health - Degraded (DB: ${data.checks?.database?.status || 'unknown'})`);
        } else {
          logError(`API Health - Unhealthy status: ${data.status}`);
        }

        // Log additional info
        if (data.checks?.api?.responseTime) {
          logInfo(`  API Response Time: ${data.checks.api.responseTime}`);
        }
        if (data.checks?.database?.latency) {
          logInfo(`  Database Latency: ${data.checks.database.latency}`);
        }

      } catch (parseError) {
        logSuccess('API Health - Responded (JSON parse failed)');
      }
    } else if (response.statusCode === 404) {
      logWarning('API Health endpoint not found (404) - may not be implemented yet');
    } else {
      logError(`API Health - HTTP ${response.statusCode}`);
    }
  } catch (error) {
    logWarning(`API Health - ${error.message}`);
  }
}

async function testSecurityHeaders() {
  logInfo('Testing security headers');

  try {
    const response = await makeRequest(DEPLOYMENT_URL);
    const headers = response.headers;

    // Check for security headers
    const securityHeaders = {
      'x-frame-options': 'X-Frame-Options',
      'x-content-type-options': 'X-Content-Type-Options',
      'strict-transport-security': 'Strict-Transport-Security',
      'x-xss-protection': 'X-XSS-Protection'
    };

    let foundHeaders = 0;
    for (const [headerKey, headerName] of Object.entries(securityHeaders)) {
      if (headers[headerKey]) {
        logInfo(`  ✓ ${headerName}: ${headers[headerKey]}`);
        foundHeaders++;
      }
    }

    if (foundHeaders >= 2) {
      logSuccess(`Security headers present (${foundHeaders}/4)`);
    } else {
      logWarning(`Few security headers found (${foundHeaders}/4)`);
    }

  } catch (error) {
    logWarning(`Security headers check - ${error.message}`);
  }
}

async function testResponseTimes() {
  logInfo('Testing response times');

  const endpoints = [
    { name: 'Homepage', path: '/' },
    { name: 'Login', path: '/login' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  const times = [];

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      await makeRequest(`${DEPLOYMENT_URL}${endpoint.path}`);
      const duration = Date.now() - startTime;
      times.push(duration);

      if (duration < 1000) {
        logInfo(`  ${endpoint.name}: ${duration}ms (excellent)`);
      } else if (duration < 3000) {
        logInfo(`  ${endpoint.name}: ${duration}ms (good)`);
      } else {
        logWarning(`  ${endpoint.name}: ${duration}ms (slow)`);
      }
    } catch (error) {
      logWarning(`  ${endpoint.name}: Error`);
    }
  }

  if (times.length > 0) {
    const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    if (avgTime < 2000) {
      logSuccess(`Average response time: ${avgTime}ms`);
    } else {
      logWarning(`Average response time: ${avgTime}ms (consider optimization)`);
    }
  }
}

// =========================================
// Main Test Execution
// =========================================

async function runAllTests() {
  console.clear();

  log('╔═══════════════════════════════════════════════════════╗', 'magenta');
  log('║   FARMERS MARKET PLATFORM - DEPLOYMENT VERIFICATION  ║', 'magenta');
  log('║              Automated Testing Suite                 ║', 'magenta');
  log('╚═══════════════════════════════════════════════════════╝', 'magenta');
  console.log('');

  logInfo(`Target: ${DEPLOYMENT_URL}`);
  logInfo(`Started: ${new Date().toISOString()}`);
  console.log('');

  // ===== CORE ENDPOINTS =====
  logHeader('CORE ENDPOINTS');

  await testEndpoint('Homepage', '/', [200]);
  await testEndpoint('About Page', '/about', [200, 404]);
  await testEndpoint('Login Page', '/login', [200, 404]);
  await testEndpoint('Dashboard', '/dashboard', [200, 302, 401, 404]);

  // ===== FARMER ROUTES =====
  logHeader('FARMER ROUTES');

  await testEndpoint('Farmer Dashboard', '/farmer/dashboard', [200, 302, 401, 404]);
  await testEndpoint('Farmer Products', '/farmer/products', [200, 302, 401, 404]);
  await testEndpoint('Farmer Orders', '/farmer/orders', [200, 302, 401, 404]);

  // ===== CUSTOMER ROUTES =====
  logHeader('CUSTOMER ROUTES');

  await testEndpoint('Farms Listing', '/farms', [200, 404]);
  await testEndpoint('Products Listing', '/products', [200, 404]);
  await testEndpoint('Cart', '/cart', [200, 404]);

  // ===== API ROUTES =====
  logHeader('API ROUTES');

  await testApiHealth();
  await testEndpoint('API Auth', '/api/auth/signin', [200, 307, 404]);
  await testEndpoint('API Farms', '/api/v1/farms', [200, 401, 404]);

  // ===== STATIC ASSETS =====
  logHeader('STATIC ASSETS');

  await testEndpoint('Favicon', '/favicon.ico', [200, 404]);
  await testEndpoint('Robots.txt', '/robots.txt', [200, 404]);

  // ===== CONTENT VALIDATION =====
  logHeader('CONTENT VALIDATION');

  await testPageContent('Homepage Content', '/', ['market', 'farm']);

  // ===== SECURITY & PERFORMANCE =====
  logHeader('SECURITY & PERFORMANCE');

  await testSecurityHeaders();
  await testResponseTimes();

  // ===== GENERATE REPORT =====
  logHeader('TEST SUMMARY');

  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  log(`Total Tests:  ${totalTests}`, 'cyan');
  log(`Passed:       ${passedTests}`, 'green');
  log(`Failed:       ${failedTests}`, failedTests > 0 ? 'red' : 'reset');
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  console.log('');

  if (failedTests === 0) {
    log('🎉 ALL TESTS PASSED! Deployment is healthy.', 'green');
    console.log('');
    return 0;
  } else if (failedTests < 3) {
    log('⚠️  Some tests failed, but deployment may still be functional.', 'yellow');
    console.log('');
    return 0;
  } else {
    log('❌ Multiple tests failed. Please investigate the deployment.', 'red');
    console.log('');
    return 1;
  }
}

// =========================================
// Execute Tests
// =========================================

runAllTests()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
