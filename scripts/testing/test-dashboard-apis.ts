/**
 * 🧪 Dashboard API Test Script
 * Farmers Market Platform - Monitoring Dashboard
 *
 * Tests all dashboard API endpoints to ensure they're working correctly.
 * Run with: tsx scripts/test-dashboard-apis.ts
 */

import { database } from "../src/lib/database";

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = "http://localhost:3001";
const ENDPOINTS = {
  overview: "/api/monitoring/dashboard/overview",
  executions: "/api/monitoring/dashboard/executions",
  alerts: "/api/monitoring/dashboard/alerts",
  metrics: "/api/monitoring/dashboard/metrics",
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Test a single endpoint
 */
async function testEndpoint(name: string, url: string): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}${url}`);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      return {
        name,
        success: false,
        duration,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data !== "object") {
      return {
        name,
        success: false,
        duration,
        error: "Invalid response format",
      };
    }

    return {
      name,
      success: data.success === true,
      duration,
      data,
      error: data.error?.message,
    };
  } catch (error) {
    return {
      name,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Print test result
 */
function printResult(result: TestResult) {
  const icon = result.success ? "✅" : "❌";
  const status = result.success ? "PASS" : "FAIL";
  const duration = `${result.duration}ms`;

  console.log(`\n${icon} ${result.name}`);
  console.log(`   Status: ${status}`);
  console.log(`   Duration: ${duration}`);

  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }

  if (result.success && result.data) {
    // Print data summary
    const { data } = result.data;
    if (data) {
      const keys = Object.keys(data);
      console.log(`   Data Keys: ${keys.join(", ")}`);

      // Print specific summaries based on endpoint
      if (data.systemHealth) {
        console.log(`   System Status: ${data.systemHealth.status}`);
      }
      if (data.executions) {
        console.log(`   Executions: ${data.executions.length} returned`);
      }
      if (data.alerts) {
        console.log(`   Alerts: ${data.alerts.length} active`);
      }
      if (data.metrics) {
        console.log(`   Metrics: ${data.metrics.length} data points`);
      }
    }
  }
}

/**
 * Print summary
 */
function printSummary() {
  const total = results.length;
  const passed = results.filter((r) => r.success).length;
  const failed = total - passed;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;

  console.log(`\n${"=".repeat(60)}`);
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚡ Avg Duration: ${Math.round(avgDuration)}ms`);
  console.log(`🎯 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log("=".repeat(60));
}

// ============================================================================
// DATABASE CHECKS
// ============================================================================

async function checkDatabaseHealth(): Promise<boolean> {
  console.log("\n🔍 Checking database connection...");

  try {
    // Test connection
    await database.$connect();
    console.log("✅ Database connection successful");

    // Check for recent data
    const [executions, healthChecks, notifications] = await Promise.all([
      database.workflowExecution.count(),
      database.systemHealthCheck.count(),
      database.notificationLog.count(),
    ]);

    console.log(`   Workflow Executions: ${executions}`);
    console.log(`   Health Checks: ${healthChecks}`);
    console.log(`   Notifications: ${notifications}`);

    if (executions === 0 && healthChecks === 0) {
      console.log(
        "⚠️  Warning: No monitoring data found. Run the daemon first.",
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "❌ Database connection failed:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

// ============================================================================
// API TESTS
// ============================================================================

async function testOverviewAPI() {
  console.log(`\n${"=".repeat(60)}`);
  console.log("🧪 Testing Overview API");
  console.log("=".repeat(60));

  const result = await testEndpoint("Dashboard Overview", ENDPOINTS.overview);
  results.push(result);
  printResult(result);
}

async function testExecutionsAPI() {
  console.log(`\n${"=".repeat(60)}`);
  console.log("🧪 Testing Executions API");
  console.log("=".repeat(60));

  // Test 1: Basic query
  let result = await testEndpoint("Executions - Basic", ENDPOINTS.executions);
  results.push(result);
  printResult(result);

  // Test 2: With pagination
  result = await testEndpoint(
    "Executions - Paginated",
    `${ENDPOINTS.executions}?limit=5&offset=0`,
  );
  results.push(result);
  printResult(result);

  // Test 3: With filter
  result = await testEndpoint(
    "Executions - Filtered",
    `${ENDPOINTS.executions}?status=SUCCESS&limit=10`,
  );
  results.push(result);
  printResult(result);
}

async function testAlertsAPI() {
  console.log(`\n${"=".repeat(60)}`);
  console.log("🧪 Testing Alerts API");
  console.log("=".repeat(60));

  // Test 1: All alerts
  let result = await testEndpoint("Alerts - All", ENDPOINTS.alerts);
  results.push(result);
  printResult(result);

  // Test 2: Critical only
  result = await testEndpoint(
    "Alerts - Critical",
    `${ENDPOINTS.alerts}?priority=CRITICAL`,
  );
  results.push(result);
  printResult(result);

  // Test 3: Last 12 hours
  result = await testEndpoint(
    "Alerts - Last 12h",
    `${ENDPOINTS.alerts}?hours=12`,
  );
  results.push(result);
  printResult(result);
}

async function testMetricsAPI() {
  console.log(`\n${"=".repeat(60)}`);
  console.log("🧪 Testing Metrics API");
  console.log("=".repeat(60));

  // Test 1: Default (24h)
  let result = await testEndpoint("Metrics - 24h", ENDPOINTS.metrics);
  results.push(result);
  printResult(result);

  // Test 2: 1 hour
  result = await testEndpoint("Metrics - 1h", `${ENDPOINTS.metrics}?period=1h`);
  results.push(result);
  printResult(result);

  // Test 3: 7 days
  result = await testEndpoint(
    "Metrics - 7d",
    `${ENDPOINTS.metrics}?period=7d&interval=1h`,
  );
  results.push(result);
  printResult(result);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🧪 DASHBOARD API TEST SUITE                              ║");
  console.log("║  Farmers Market Platform - Monitoring Dashboard           ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  // Check database health first
  const dbHealthy = await checkDatabaseHealth();
  if (!dbHealthy) {
    console.log("\n⚠️  Database health check failed or no data available.");
    console.log("💡 Run the monitoring daemon first:");
    console.log("   npm run monitor:daemon:pm2");
    console.log("\nSkipping API tests...");
    process.exit(1);
  }

  console.log(`\n📡 Testing API endpoints at: ${API_BASE_URL}`);
  console.log("💡 Make sure the dev server is running: npm run dev\n");

  // Wait a moment for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    // Run all tests
    await testOverviewAPI();
    await testExecutionsAPI();
    await testAlertsAPI();
    await testMetricsAPI();

    // Print summary
    printSummary();

    // Exit with appropriate code
    const allPassed = results.every((r) => r.success);
    if (allPassed) {
      console.log(
        "\n🎉 All tests passed! Dashboard APIs are working correctly.\n",
      );
      process.exit(0);
    } else {
      console.log("\n⚠️  Some tests failed. Check the errors above.\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Run tests
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
