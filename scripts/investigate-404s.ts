#!/usr/bin/env tsx
/**
 * 🔍 404 ERROR INVESTIGATION SCRIPT
 *
 * Investigates specific 404 errors on production site and provides fixes
 *
 * Usage:
 *   npm run tsx scripts/investigate-404s.ts
 */

import { chromium, type Browser, type Page } from 'playwright';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

const BASE_URL = 'https://farmers-market-platform.vercel.app';

interface InvestigationResult {
  url: string;
  status: number;
  exists: boolean;
  error?: string;
  redirectTo?: string;
  routeGroup?: string;
  correctUrl?: string;
  fix?: string;
}

// URLs to investigate
const URLS_TO_CHECK = [
  '/orders?status=PROCESSING',
  '/orders?status=IN_TRANSIT',
  '/orders?status=DELIVERED',
  '/orders',
  '/farmer/farm',
];

async function log(message: string, color: string = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkUrl(page: Page, url: string): Promise<InvestigationResult> {
  const fullUrl = `${BASE_URL}${url}`;

  try {
    const response = await page.goto(fullUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    const status = response?.status() || 0;
    const finalUrl = page.url();

    const result: InvestigationResult = {
      url,
      status,
      exists: status === 200,
    };

    if (finalUrl !== fullUrl) {
      result.redirectTo = finalUrl.replace(BASE_URL, '');
    }

    // Check for route group
    if (url.includes('/orders')) {
      result.routeGroup = '(customer)';
      result.correctUrl = url;
    } else if (url.includes('/farmer')) {
      result.routeGroup = '(farmer)';
    }

    // Analyze the error
    if (status === 404) {
      result.error = await analyzeNotFound(page, url);
      result.fix = await suggestFix(url, page);
    }

    return result;
  } catch (error) {
    return {
      url,
      status: 0,
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function analyzeNotFound(page: Page, url: string): Promise<string> {
  // Check if it's a Next.js 404
  const bodyText = await page.textContent('body').catch(() => '');

  if (bodyText?.includes('404') || bodyText?.includes('This page could not be found')) {
    return 'Next.js 404 - Route does not exist';
  }

  if (bodyText?.includes('UNAUTHORIZED') || bodyText?.includes('sign in')) {
    return 'Authentication required - Redirect to login';
  }

  return 'Page not found';
}

async function suggestFix(url: string, page: Page): Promise<string> {
  // Check authentication state
  const hasAuthCookie = await page.context().cookies().then(cookies =>
    cookies.some(c => c.name.includes('session') || c.name.includes('auth'))
  );

  if (url.includes('/orders')) {
    if (!hasAuthCookie) {
      return `
FIX: Authentication Required
- The /orders route requires authentication
- Route exists at: src/app/(customer)/orders/page.tsx
- Solution: User must log in first
- Test URL: ${BASE_URL}/login?callbackUrl=${encodeURIComponent(url)}
`;
    }
    return `
FIX: Route Exists But Requires Auth
- File location: src/app/(customer)/orders/page.tsx
- Route group: (customer)
- The page exists but requires authentication
- Status filters (PROCESSING, IN_TRANSIT, DELIVERED) should work when logged in
`;
  }

  if (url === '/farmer/farm') {
    return `
FIX: Incorrect URL Structure
- Correct route: /farmer/farms (plural)
- Or: /farmer/farms/[farmId] (specific farm)
- Route group: (farmer)
- File location: src/app/(farmer)/farmer/farms/page.tsx
- Suggested fix: Update links from /farmer/farm to /farmer/farms
`;
  }

  return 'No specific fix suggested';
}

async function investigateRouting(page: Page): Promise<void> {
  log('\n📁 Checking Route Groups...', colors.cyan);

  const routes = [
    { path: '/customer', expected: 'Customer portal' },
    { path: '/farmer', expected: 'Farmer portal' },
    { path: '/admin', expected: 'Admin portal' },
  ];

  for (const route of routes) {
    try {
      const response = await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      const status = response?.status() || 0;

      if (status === 200) {
        log(`  ✅ ${route.path} - ${status} (${route.expected})`, colors.green);
      } else if (status === 307 || status === 302) {
        log(`  ↪️  ${route.path} - ${status} (Redirect)`, colors.yellow);
      } else {
        log(`  ❌ ${route.path} - ${status}`, colors.red);
      }
    } catch (error) {
      log(`  ❌ ${route.path} - Error checking route`, colors.red);
    }
  }
}

async function checkAuthFlow(page: Page): Promise<void> {
  log('\n🔐 Testing Authentication Flow...', colors.cyan);

  try {
    // Try to access protected route
    const response = await page.goto(`${BASE_URL}/orders`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    const finalUrl = page.url();
    const status = response?.status() || 0;

    if (finalUrl.includes('/login') || finalUrl.includes('/signin')) {
      log('  ✅ Protected route redirects to login correctly', colors.green);
      log(`  ↪️  Redirect: /orders → ${finalUrl.replace(BASE_URL, '')}`, colors.yellow);
    } else if (status === 404) {
      log('  ⚠️  Protected route returns 404 instead of redirecting', colors.yellow);
      log('  💡 Check auth middleware configuration', colors.cyan);
    } else {
      log(`  ℹ️  Response status: ${status}`, colors.white);
    }
  } catch (error) {
    log('  ❌ Error testing auth flow', colors.red);
  }
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║           🔍 404 ERROR INVESTIGATION REPORT                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

  log(`Base URL: ${BASE_URL}`, colors.bold);
  log(`Timestamp: ${new Date().toISOString()}\n`, colors.white);

  let browser: Browser | null = null;

  try {
    // Launch browser
    log('🚀 Launching browser...', colors.cyan);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    });
    const page = await context.newPage();

    log('✅ Browser ready\n', colors.green);

    // Check each URL
    log('═══════════════════════════════════════════════════════════════', colors.white);
    log('🔍 INVESTIGATING URLs', colors.bold);
    log('═══════════════════════════════════════════════════════════════\n', colors.white);

    const results: InvestigationResult[] = [];

    for (const url of URLS_TO_CHECK) {
      log(`Checking: ${url}`, colors.cyan);
      const result = await checkUrl(page, url);
      results.push(result);

      if (result.exists) {
        log(`  ✅ Status: ${result.status}`, colors.green);
      } else {
        log(`  ❌ Status: ${result.status}`, colors.red);
        if (result.error) {
          log(`  📋 Error: ${result.error}`, colors.yellow);
        }
      }

      if (result.redirectTo) {
        log(`  ↪️  Redirects to: ${result.redirectTo}`, colors.magenta);
      }

      console.log('');
    }

    // Additional investigations
    await investigateRouting(page);
    await checkAuthFlow(page);

    // Print summary
    log('\n═══════════════════════════════════════════════════════════════', colors.white);
    log('📊 SUMMARY & RECOMMENDATIONS', colors.bold);
    log('═══════════════════════════════════════════════════════════════\n', colors.white);

    const failures = results.filter(r => !r.exists);
    const successes = results.filter(r => r.exists);

    log(`✅ Working URLs: ${successes.length}`, colors.green);
    log(`❌ 404 URLs: ${failures.length}`, colors.red);

    if (failures.length > 0) {
      log('\n🔧 RECOMMENDED FIXES:\n', colors.yellow);

      for (const failure of failures) {
        log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, colors.white);
        log(`URL: ${failure.url}`, colors.cyan);
        log(`Status: ${failure.status}`, colors.red);

        if (failure.fix) {
          log(failure.fix, colors.white);
        }
      }
    }

    // Root cause analysis
    log('\n═══════════════════════════════════════════════════════════════', colors.white);
    log('🎯 ROOT CAUSE ANALYSIS', colors.bold);
    log('═══════════════════════════════════════════════════════════════\n', colors.white);

    const ordersRoutes = failures.filter(f => f.url.includes('/orders'));
    if (ordersRoutes.length > 0) {
      log('📦 Orders Routes (404):', colors.yellow);
      log(`
DIAGNOSIS:
  ✓ Route exists: src/app/(customer)/orders/page.tsx
  ✓ Route group: (customer)
  ✗ Requires authentication

ISSUE:
  The /orders route returns 404 instead of redirecting to login

POSSIBLE CAUSES:
  1. Middleware not configured correctly
  2. Auth check failing silently
  3. Route protection not implemented

SOLUTION:
  1. Check middleware.ts configuration
  2. Verify auth() is called in page.tsx
  3. Ensure redirect() is used for unauthenticated users

FILE TO CHECK:
  - middleware.ts
  - src/app/(customer)/orders/page.tsx (lines 73-77)

CODE SNIPPET (from page.tsx):
  ${colors.green}if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/orders");
  }${colors.reset}

VERIFICATION:
  1. Test login flow: ${BASE_URL}/login
  2. After login, navigate to: ${BASE_URL}/orders
  3. Should display orders page
`, colors.white);
    }

    const farmerRoutes = failures.filter(f => f.url.includes('/farmer/farm'));
    if (farmerRoutes.length > 0) {
      log('\n🌾 Farmer Routes (404):', colors.yellow);
      log(`
DIAGNOSIS:
  ✗ Route /farmer/farm does NOT exist
  ✓ Correct route: /farmer/farms (plural)

ISSUE:
  URL is using singular 'farm' instead of plural 'farms'

ACTUAL ROUTES:
  ✓ /farmer/farms - List all farms
  ✓ /farmer/farms/[farmId] - Specific farm

SOLUTION:
  1. Update all links from /farmer/farm → /farmer/farms
  2. Search codebase for hardcoded /farmer/farm URLs

COMMAND TO FIX:
  ${colors.green}grep -r "/farmer/farm" src/
  # Then replace with /farmer/farms${colors.reset}

FILE LOCATIONS:
  - src/app/(farmer)/farmer/farms/page.tsx (correct)
  - Check for incorrect links in navigation/components
`, colors.white);
    }

    // Final recommendations
    log('\n═══════════════════════════════════════════════════════════════', colors.white);
    log('✅ IMMEDIATE ACTION ITEMS', colors.bold);
    log('═══════════════════════════════════════════════════════════════\n', colors.white);

    log('1. FIX AUTHENTICATION REDIRECT:', colors.cyan);
    log('   - Check middleware.ts for /orders route protection', colors.white);
    log('   - Verify redirect logic in orders/page.tsx\n', colors.white);

    log('2. FIX FARMER ROUTE URL:', colors.cyan);
    log('   - Search for /farmer/farm in codebase', colors.white);
    log('   - Replace with /farmer/farms (plural)\n', colors.white);

    log('3. TEST AFTER FIXES:', colors.cyan);
    log('   - Run: npm run inspect:website', colors.white);
    log('   - Or run this script again\n', colors.white);

    await browser.close();

    log('\n✅ Investigation complete!', colors.green);
    log(`Report saved to: investigation-report-${Date.now()}.txt\n`, colors.white);

  } catch (error) {
    log('\n❌ Investigation failed!', colors.red);
    console.error(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the investigation
main().catch(console.error);
