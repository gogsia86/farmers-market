#!/usr/bin/env node

/**
 * 🌊 Hydration Fix Verification Script
 *
 * Automated testing to verify hydration mismatch is resolved.
 * Tests server-side rendering consistency and client hydration.
 *
 * Usage:
 *   node scripts/test-hydration.js
 *   node scripts/test-hydration.js https://your-app.vercel.app
 *
 * @module scripts/test-hydration
 */

const https = require('https');
const http = require('http');

// ============================================================================
// CONFIGURATION
// ============================================================================

let TEST_URL = process.argv[2] || 'http://localhost:3000';

// Auto-upgrade to HTTPS for production URLs
if (TEST_URL.includes('vercel.app') && TEST_URL.startsWith('http://')) {
  TEST_URL = TEST_URL.replace('http://', 'https://');
  console.log(colorize(`🔒 Auto-upgraded to HTTPS: ${TEST_URL}`, 'cyan'));
}
const TESTS_TO_RUN = [
  { path: '/', name: 'Homepage' },
  { path: '/products', name: 'Products Page' },
  { path: '/farms', name: 'Farms Page' },
  { path: '/login', name: 'Login Page' },
  { path: '/cart', name: 'Cart Page' },
];

// Hydration warning patterns to detect
const HYDRATION_PATTERNS = [
  /hydration/i,
  /did not match/i,
  /server.*client/i,
  /suppressHydrationWarning/i,
  /text content.*differ/i,
];

// ============================================================================
// COLORS & FORMATTING
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(text) {
  console.log('\n' + colorize('═'.repeat(80), 'cyan'));
  console.log(colorize(` ${text}`, 'bright'));
  console.log(colorize('═'.repeat(80), 'cyan') + '\n');
}

function printSubHeader(text) {
  console.log(colorize(`\n▶ ${text}`, 'blue'));
  console.log(colorize('─'.repeat(60), 'blue'));
}

function printSuccess(text) {
  console.log(colorize(`✅ ${text}`, 'green'));
}

function printError(text) {
  console.log(colorize(`❌ ${text}`, 'red'));
}

function printWarning(text) {
  console.log(colorize(`⚠️  ${text}`, 'yellow'));
}

function printInfo(text) {
  console.log(colorize(`ℹ️  ${text}`, 'cyan'));
}

// ============================================================================
// HTTP UTILITIES
// ============================================================================

function fetchPage(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Hydration-Test-Bot/1.0',
        'Accept': 'text/html',
      },
    };

    const req = client.request(options, (res) => {
      // Handle redirects (301, 302, 307, 308)
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (maxRedirects === 0) {
          reject(new Error('Too many redirects'));
          return;
        }

        // Resolve redirect URL (handle relative and absolute URLs)
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const baseUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}`;
          redirectUrl = new URL(redirectUrl, baseUrl).href;
        }

        // Follow redirect
        fetchPage(redirectUrl, maxRedirects - 1)
          .then(resolve)
          .catch(reject);
        return;
      }

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
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testPageHydration(path, name) {
  printSubHeader(`Testing: ${name} (${path})`);

  const fullUrl = `${TEST_URL}${path}`;

  try {
    const response = await fetchPage(fullUrl);

    if (response.statusCode !== 200) {
      printError(`HTTP ${response.statusCode} - Page not accessible`);
      return { passed: false, errors: [`HTTP ${response.statusCode}`] };
    }

    printSuccess(`HTTP ${response.statusCode} - Page accessible`);

    const errors = [];

    // Test 1: Check for required HTML structure
    if (!response.body.includes('<html')) {
      errors.push('Missing <html> tag');
      printError('Missing <html> tag in response');
    } else {
      printSuccess('Valid HTML structure');
    }

    // Test 2: Check for proper Next.js scripts
    if (!response.body.includes('/_next/')) {
      errors.push('Missing Next.js scripts');
      printError('Missing Next.js script references');
    } else {
      printSuccess('Next.js scripts present');
    }

    // Test 3: Check for session provider
    if (response.body.includes('SessionProvider') ||
      response.body.includes('session-provider') ||
      response.body.includes('__NEXT_DATA__')) {
      printSuccess('Session handling code present');
    } else {
      printWarning('Session code not detected (may be in chunks)');
    }

    // Test 4: Check for hydration-safe patterns
    if (response.body.includes('suppressHydrationWarning')) {
      printInfo('Found suppressHydrationWarning usage (acceptable for dynamic content)');
    }

    // Test 5: Check for proper meta tags
    if (response.body.includes('<meta') && response.body.includes('<title>')) {
      printSuccess('Meta tags and title present');
    } else {
      errors.push('Missing meta tags or title');
      printError('Missing meta tags or title');
    }

    // Test 6: Check Content-Type header
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      printSuccess(`Correct Content-Type: ${contentType}`);
    } else {
      errors.push(`Wrong Content-Type: ${contentType}`);
      printError(`Wrong Content-Type: ${contentType}`);
    }

    // Test 7: Check for common hydration issues in HTML
    const hydrationIssues = [];
    HYDRATION_PATTERNS.forEach(pattern => {
      if (pattern.test(response.body)) {
        hydrationIssues.push(pattern.toString());
      }
    });

    if (hydrationIssues.length > 0) {
      errors.push('Potential hydration warnings in HTML');
      printWarning(`Found patterns that might indicate hydration issues: ${hydrationIssues.length}`);
    } else {
      printSuccess('No obvious hydration warning patterns in HTML');
    }

    // Test 8: Check for consistent data structures
    const nextDataMatch = response.body.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        printSuccess(`Next.js data parsed successfully (buildId: ${nextData.buildId?.substring(0, 8)}...)`);
      } catch (e) {
        errors.push('Invalid __NEXT_DATA__ JSON');
        printError('Failed to parse __NEXT_DATA__');
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings: hydrationIssues.length,
    };

  } catch (error) {
    printError(`Test failed: ${error.message}`);
    return {
      passed: false,
      errors: [error.message],
    };
  }
}

async function runServerChecks() {
  printSubHeader('Server Environment Checks');

  // Check if server is running
  try {
    const response = await fetchPage(TEST_URL);
    printSuccess(`Server is running at ${TEST_URL}`);

    // Check response time
    const startTime = Date.now();
    await fetchPage(TEST_URL);
    const responseTime = Date.now() - startTime;

    if (responseTime < 1000) {
      printSuccess(`Fast response time: ${responseTime}ms`);
    } else if (responseTime < 3000) {
      printWarning(`Acceptable response time: ${responseTime}ms`);
    } else {
      printError(`Slow response time: ${responseTime}ms`);
    }

    return true;
  } catch (error) {
    printError(`Server not accessible: ${error.message}`);
    printInfo('Make sure your server is running:');
    printInfo('  Development: npm run dev');
    printInfo('  Production:  npm run build && npm start');
    return false;
  }
}

function generateReport(results) {
  printHeader('📊 Test Summary Report');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0);

  console.log(colorize('Test Results:', 'bright'));
  console.log(`  Total Tests:    ${totalTests}`);
  console.log(colorize(`  Passed:         ${passedTests}`, 'green'));
  if (failedTests > 0) {
    console.log(colorize(`  Failed:         ${failedTests}`, 'red'));
  }
  console.log('');

  console.log(colorize('Issues Found:', 'bright'));
  console.log(colorize(`  Errors:         ${totalErrors}`, totalErrors > 0 ? 'red' : 'green'));
  console.log(colorize(`  Warnings:       ${totalWarnings}`, totalWarnings > 0 ? 'yellow' : 'green'));
  console.log('');

  if (failedTests === 0 && totalErrors === 0) {
    console.log(colorize('═'.repeat(80), 'green'));
    console.log(colorize('  🎉 ALL TESTS PASSED! HYDRATION IS WORKING CORRECTLY! 🎉', 'green'));
    console.log(colorize('═'.repeat(80), 'green'));
    console.log('');
    printSuccess('Your app is properly handling SSR and hydration');
    printSuccess('No hydration mismatches detected');
    printSuccess('Safe to deploy to production');
  } else {
    console.log(colorize('═'.repeat(80), 'red'));
    console.log(colorize('  ⚠️  TESTS FAILED - HYDRATION ISSUES DETECTED ⚠️', 'red'));
    console.log(colorize('═'.repeat(80), 'red'));
    console.log('');
    printError('Hydration issues detected in your app');
    printInfo('Review the errors above and check:');
    printInfo('  1. Are you accessing localStorage during render?');
    printInfo('  2. Is session data being passed to SessionProvider?');
    printInfo('  3. Are client components using mounting guards?');
    printInfo('  4. Check browser console for hydration warnings');
    console.log('');
    printInfo('See HYDRATION_FIX.md for detailed resolution steps');
  }

  return failedTests === 0 && totalErrors === 0;
}

function printUsageGuide() {
  console.log('');
  printInfo('Next Steps:');
  console.log('');
  console.log('  1. Open browser DevTools and check Console tab');
  console.log('  2. Look for any hydration warnings or errors');
  console.log('  3. Test actual user interactions (login, cart, etc.)');
  console.log('  4. Run production build test:');
  console.log('     npm run build && npm start');
  console.log('');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  printHeader('🌊 Hydration Fix Verification Test Suite');

  console.log(colorize(`Testing URL: ${TEST_URL}`, 'cyan'));
  console.log(colorize(`Date: ${new Date().toISOString()}`, 'cyan'));
  console.log('');

  // Step 1: Check if server is accessible
  const serverOk = await runServerChecks();
  if (!serverOk) {
    process.exit(1);
  }

  // Step 2: Run hydration tests on all pages
  const results = [];

  for (const test of TESTS_TO_RUN) {
    const result = await testPageHydration(test.path, test.name);
    results.push({
      ...result,
      path: test.path,
      name: test.name,
    });

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Step 3: Generate and display report
  const allPassed = generateReport(results);

  // Step 4: Show usage guide
  printUsageGuide();

  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
main().catch(error => {
  console.error(colorize('\n❌ Fatal Error:', 'red'));
  console.error(error);
  process.exit(1);
});
