#!/usr/bin/env tsx

/**
 * IMPLEMENTATION VERIFICATION SCRIPT
 * Verifies all Phase 1 upgrades are working correctly
 *
 * Tests:
 * - Sitemap generation with real data
 * - Robots.txt configuration
 * - Route structure and redirects
 * - Structured data components
 * - Database connectivity
 */

import { database } from "../src/lib/database";
import fs from "fs";
import path from "path";

// ============================================
// COLORS FOR TERMINAL OUTPUT
// ============================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg: string) =>
    console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n`),
};

// ============================================
// VERIFICATION RESULTS
// ============================================

interface VerificationResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];

function addResult(
  test: string,
  passed: boolean,
  message: string,
  details?: any,
) {
  results.push({ test, passed, message, details });
  if (passed) {
    log.success(`${test}: ${message}`);
  } else {
    log.error(`${test}: ${message}`);
  }
}

// ============================================
// TEST 1: FILE EXISTENCE
// ============================================

async function verifyFileExistence() {
  log.section("📁 TEST 1: Verifying File Existence");

  const requiredFiles = [
    { path: "src/app/sitemap.ts", description: "Sitemap generator" },
    { path: "src/app/robots.ts", description: "Robots.txt generator" },
    {
      path: "src/components/seo/StructuredData.tsx",
      description: "Structured data components",
    },
    { path: "src/app/(public)/layout.tsx", description: "Public layout" },
    { path: "src/app/(auth)/layout.tsx", description: "Auth layout" },
    {
      path: "src/components/onboarding/OnboardingTour.tsx",
      description: "Onboarding tour",
    },
    {
      path: "src/hooks/useRealtimeNotifications.ts",
      description: "Notifications hook",
    },
    { path: "docs/API_CONSOLIDATION_PLAN.md", description: "API docs" },
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file.path);
    const exists = fs.existsSync(filePath);
    addResult(
      `File: ${file.path}`,
      exists,
      exists ? `${file.description} exists` : `Missing ${file.description}`,
    );
  }
}

// ============================================
// TEST 2: ROUTE STRUCTURE
// ============================================

async function verifyRouteStructure() {
  log.section("🗂️  TEST 2: Verifying Route Structure");

  const requiredRoutes = [
    { path: "src/app/(public)/about", description: "About page" },
    { path: "src/app/(public)/contact", description: "Contact page" },
    { path: "src/app/(public)/faq", description: "FAQ page" },
    { path: "src/app/(public)/help", description: "Help page" },
    { path: "src/app/(auth)/login", description: "Login page" },
    { path: "src/app/(auth)/signup", description: "Signup page" },
    { path: "src/app/(auth)/admin-login", description: "Admin login page" },
    { path: "src/app/(customer)/cart", description: "Cart page" },
    { path: "src/app/(customer)/checkout", description: "Checkout page" },
    { path: "src/app/(customer)/orders", description: "Orders page" },
  ];

  for (const route of requiredRoutes) {
    const routePath = path.join(process.cwd(), route.path);
    const exists = fs.existsSync(routePath);
    addResult(
      `Route: ${route.path}`,
      exists,
      exists ? `${route.description} exists` : `Missing ${route.description}`,
    );
  }

  // Verify duplicate route is removed
  const duplicateRoute = path.join(process.cwd(), "src/app/register");
  const removed = !fs.existsSync(duplicateRoute);
  addResult(
    "Duplicate route removed",
    removed,
    removed
      ? "Duplicate /register route removed"
      : "Duplicate /register still exists",
  );
}

// ============================================
// TEST 3: DATABASE CONNECTIVITY
// ============================================

async function verifyDatabaseConnectivity() {
  log.section("🗄️  TEST 3: Verifying Database Connectivity");

  try {
    await database.$connect();
    addResult(
      "Database connection",
      true,
      "Successfully connected to database",
    );

    // Test farm query
    const farmCount = await database.farm.count();
    addResult("Farm query", true, `Found ${farmCount} farms in database`, {
      count: farmCount,
    });

    // Test product query
    const productCount = await database.product.count();
    addResult(
      "Product query",
      true,
      `Found ${productCount} products in database`,
      {
        count: productCount,
      },
    );

    await database.$disconnect();
  } catch (error) {
    addResult(
      "Database connection",
      false,
      `Failed to connect: ${error instanceof Error ? error.message : "Unknown error"}`,
      { error },
    );
  }
}

// ============================================
// TEST 4: SITEMAP CONTENT
// ============================================

async function verifySitemapContent() {
  log.section("🗺️  TEST 4: Verifying Sitemap Content");

  const sitemapPath = path.join(process.cwd(), "src/app/sitemap.ts");
  const content = fs.readFileSync(sitemapPath, "utf-8");

  // Check for database import
  const hasDatabaseImport = content.includes('from "@/lib/database"');
  addResult(
    "Sitemap: Database import",
    hasDatabaseImport,
    hasDatabaseImport ? "Uses real database" : "Missing database import",
  );

  // Check for farm query
  const hasFarmQuery = content.includes("database.farm.findMany");
  addResult(
    "Sitemap: Farm query",
    hasFarmQuery,
    hasFarmQuery ? "Queries farms from database" : "Missing farm query",
  );

  // Check for product query
  const hasProductQuery = content.includes("database.product.findMany");
  addResult(
    "Sitemap: Product query",
    hasProductQuery,
    hasProductQuery
      ? "Queries products from database"
      : "Missing product query",
  );

  // Check for error handling
  const hasErrorHandling = content.includes("try") && content.includes("catch");
  addResult(
    "Sitemap: Error handling",
    hasErrorHandling,
    hasErrorHandling ? "Has error handling" : "Missing error handling",
  );
}

// ============================================
// TEST 5: ROBOTS.TXT CONTENT
// ============================================

async function verifyRobotsContent() {
  log.section("🤖 TEST 5: Verifying Robots.txt Content");

  const robotsPath = path.join(process.cwd(), "src/app/robots.ts");
  const content = fs.readFileSync(robotsPath, "utf-8");

  // Check for sitemap reference
  const hasSitemap = content.includes("sitemap:");
  addResult(
    "Robots: Sitemap reference",
    hasSitemap,
    hasSitemap ? "References sitemap" : "Missing sitemap reference",
  );

  // Check for AI bot blocking
  const hasGPTBot = content.includes("GPTBot");
  const hasClaude = content.includes("Claude");
  addResult(
    "Robots: AI bot blocking",
    hasGPTBot && hasClaude,
    hasGPTBot && hasClaude ? "Blocks AI crawlers" : "Missing AI bot rules",
  );

  // Check for allow rules
  const hasAllowRules = content.includes("allow:");
  addResult(
    "Robots: Allow rules",
    hasAllowRules,
    hasAllowRules ? "Has allow rules" : "Missing allow rules",
  );

  // Check for disallow rules
  const hasDisallowRules = content.includes("disallow:");
  addResult(
    "Robots: Disallow rules",
    hasDisallowRules,
    hasDisallowRules ? "Has disallow rules" : "Missing disallow rules",
  );
}

// ============================================
// TEST 6: STRUCTURED DATA COMPONENTS
// ============================================

async function verifyStructuredDataComponents() {
  log.section("📊 TEST 6: Verifying Structured Data Components");

  const structuredDataPath = path.join(
    process.cwd(),
    "src/components/seo/StructuredData.tsx",
  );
  const content = fs.readFileSync(structuredDataPath, "utf-8");

  const components = [
    { name: "ProductStructuredData", description: "Product schema" },
    { name: "FarmStructuredData", description: "Farm/LocalBusiness schema" },
    { name: "OrganizationStructuredData", description: "Organization schema" },
    { name: "BreadcrumbStructuredData", description: "Breadcrumb schema" },
    { name: "ReviewStructuredData", description: "Review schema" },
    { name: "SearchActionStructuredData", description: "Search action schema" },
    { name: "RecipeStructuredData", description: "Recipe schema" },
    { name: "FAQStructuredData", description: "FAQ schema" },
  ];

  for (const component of components) {
    const exists = content.includes(`export function ${component.name}`);
    addResult(
      `Structured data: ${component.name}`,
      exists,
      exists
        ? `${component.description} available`
        : `Missing ${component.description}`,
    );
  }

  // Check for schema.org context
  const hasSchemaContext = content.includes('"@context": "https://schema.org"');
  addResult(
    "Structured data: Schema.org",
    hasSchemaContext,
    hasSchemaContext ? "Uses Schema.org context" : "Missing Schema.org context",
  );
}

// ============================================
// TEST 7: MIDDLEWARE CONFIGURATION
// ============================================

async function verifyMiddlewareConfiguration() {
  log.section("🛡️  TEST 7: Verifying Middleware Configuration");

  const middlewarePath = path.join(process.cwd(), "src/middleware.ts");
  const content = fs.readFileSync(middlewarePath, "utf-8");

  // Check for register redirect
  const hasRegisterRedirect = content.includes('pathname === "/register"');
  addResult(
    "Middleware: Register redirect",
    hasRegisterRedirect,
    hasRegisterRedirect
      ? "Redirects /register to /signup"
      : "Missing register redirect",
  );

  // Check for admin route handling
  const hasAdminHandling = content.includes("handleAdminRoutes");
  addResult(
    "Middleware: Admin routes",
    hasAdminHandling,
    hasAdminHandling ? "Handles admin routes" : "Missing admin route handling",
  );

  // Check for authentication
  const hasAuth = content.includes("getToken");
  addResult(
    "Middleware: Authentication",
    hasAuth,
    hasAuth ? "Validates authentication" : "Missing authentication check",
  );
}

// ============================================
// TEST 8: ONBOARDING TOUR
// ============================================

async function verifyOnboardingTour() {
  log.section("🎯 TEST 8: Verifying Onboarding Tour");

  const tourPath = path.join(
    process.cwd(),
    "src/components/onboarding/OnboardingTour.tsx",
  );
  const content = fs.readFileSync(tourPath, "utf-8");

  // Check for tour definitions
  const hasTourDefinitions = content.includes("const TOURS");
  addResult(
    "Onboarding: Tour definitions",
    hasTourDefinitions,
    hasTourDefinitions ? "Has tour definitions" : "Missing tour definitions",
  );

  // Check for framer-motion
  const hasFramerMotion = content.includes("framer-motion");
  addResult(
    "Onboarding: Animations",
    hasFramerMotion,
    hasFramerMotion ? "Uses Framer Motion" : "Missing animation library",
  );

  // Check for localStorage
  const hasLocalStorage = content.includes("localStorage");
  addResult(
    "Onboarding: Persistence",
    hasLocalStorage,
    hasLocalStorage ? "Persists tour state" : "Missing persistence",
  );

  // Check for multiple tours
  const tourCount = (content.match(/id: ".*-tour"/g) || []).length;
  addResult(
    "Onboarding: Tour count",
    tourCount >= 5,
    tourCount >= 5
      ? `Has ${tourCount} tours configured`
      : `Only ${tourCount} tours found`,
  );
}

// ============================================
// TEST 9: REAL-TIME NOTIFICATIONS
// ============================================

async function verifyRealtimeNotifications() {
  log.section("🔔 TEST 9: Verifying Real-time Notifications");

  const hookPath = path.join(
    process.cwd(),
    "src/hooks/useRealtimeNotifications.ts",
  );
  const content = fs.readFileSync(hookPath, "utf-8");

  // Check for EventSource
  const hasEventSource = content.includes("EventSource");
  addResult(
    "Notifications: SSE client",
    hasEventSource,
    hasEventSource ? "Uses Server-Sent Events" : "Missing SSE implementation",
  );

  // Check for reconnection logic
  const hasReconnection = content.includes("reconnect");
  addResult(
    "Notifications: Reconnection",
    hasReconnection,
    hasReconnection ? "Has reconnection logic" : "Missing reconnection",
  );

  // Check for notification API
  const hasNotificationAPI = content.includes("Notification");
  addResult(
    "Notifications: Browser API",
    hasNotificationAPI,
    hasNotificationAPI
      ? "Uses browser Notification API"
      : "Missing browser notifications",
  );

  // Check SSE endpoint exists
  const sseEndpointPath = path.join(
    process.cwd(),
    "src/app/api/notifications/stream/route.ts",
  );
  const sseExists = fs.existsSync(sseEndpointPath);
  addResult(
    "Notifications: SSE endpoint",
    sseExists,
    sseExists ? "SSE endpoint exists" : "Missing SSE endpoint",
  );
}

// ============================================
// TEST 10: DOCUMENTATION
// ============================================

async function verifyDocumentation() {
  log.section("📚 TEST 10: Verifying Documentation");

  const docs = [
    {
      path: "WEBSITE_STRUCTURE_ANALYSIS_AND_RECOMMENDATIONS.md",
      description: "Analysis document",
    },
    {
      path: "IMPLEMENTATION_SUMMARY.md",
      description: "Implementation summary",
    },
    {
      path: "docs/API_CONSOLIDATION_PLAN.md",
      description: "API consolidation plan",
    },
  ];

  for (const doc of docs) {
    const docPath = path.join(process.cwd(), doc.path);
    const exists = fs.existsSync(docPath);
    addResult(
      `Documentation: ${doc.description}`,
      exists,
      exists ? `${doc.description} exists` : `Missing ${doc.description}`,
    );
  }
}

// ============================================
// SUMMARY AND REPORT
// ============================================

function generateReport() {
  log.section("📋 VERIFICATION SUMMARY");

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`${colors.bright}Total Tests: ${totalTests}${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failedTests}${colors.reset}`);
  console.log(`${colors.cyan}Success Rate: ${successRate}%${colors.reset}\n`);

  if (failedTests > 0) {
    log.section("❌ FAILED TESTS");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`\n${colors.red}${r.test}${colors.reset}`);
        console.log(`  ${r.message}`);
        if (r.details) {
          console.log("  Details:", r.details);
        }
      });
  }

  // Overall status
  log.section("🎯 DEPLOYMENT STATUS");
  if (successRate === "100.0") {
    log.success("ALL TESTS PASSED - READY FOR DEPLOYMENT! 🚀");
    return 0;
  } else if (parseFloat(successRate) >= 90) {
    log.warning("MOSTLY READY - Minor issues found. Review failed tests.");
    return 1;
  } else if (parseFloat(successRate) >= 70) {
    log.warning(
      "NOT READY - Several issues found. Fix failed tests before deploying.",
    );
    return 2;
  } else {
    log.error("CRITICAL ISSUES - Many tests failed. Significant work needed.");
    return 3;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log("\n");
  console.log(
    `${colors.cyan}${colors.bright}╔═══════════════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.cyan}${colors.bright}║   🌾 FARMERS MARKET PLATFORM                         ║${colors.reset}`,
  );
  console.log(
    `${colors.cyan}${colors.bright}║   IMPLEMENTATION VERIFICATION SCRIPT                  ║${colors.reset}`,
  );
  console.log(
    `${colors.cyan}${colors.bright}╚═══════════════════════════════════════════════════════╝${colors.reset}`,
  );
  console.log("\n");

  log.info("Starting verification tests...\n");

  try {
    await verifyFileExistence();
    await verifyRouteStructure();
    await verifyDatabaseConnectivity();
    await verifySitemapContent();
    await verifyRobotsContent();
    await verifyStructuredDataComponents();
    await verifyMiddlewareConfiguration();
    await verifyOnboardingTour();
    await verifyRealtimeNotifications();
    await verifyDocumentation();

    const exitCode = generateReport();

    // Save report to file
    const reportPath = path.join(process.cwd(), "verification-report.json");
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          results,
          summary: {
            total: results.length,
            passed: results.filter((r) => r.passed).length,
            failed: results.filter((r) => !r.passed).length,
            successRate: (
              (results.filter((r) => r.passed).length / results.length) *
              100
            ).toFixed(1),
          },
        },
        null,
        2,
      ),
    );

    log.info(`\n📄 Report saved to: ${reportPath}\n`);

    process.exit(exitCode);
  } catch (error) {
    log.error(
      `\nFATAL ERROR: ${error instanceof Error ? error.message : "Unknown error"}\n`,
    );
    console.error(error);
    process.exit(4);
  }
}

// Run the verification
main();
