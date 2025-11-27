#!/usr/bin/env node

/**
 * ANALYTICS PERFORMANCE VALIDATION SCRIPT
 * Validates analytics endpoint performance against targets
 *
 * Target: < 100ms response time (expecting 60-80ms)
 * Divine Performance Standards
 */

import { performance } from "perf_hooks";
import fetch from "node-fetch";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const TARGET_RESPONSE_TIME = 100; // milliseconds
const EXPECTED_RESPONSE_TIME = 80; // milliseconds (optimal)
const TEST_ITERATIONS = 5;

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log(
    "\n╔════════════════════════════════════════════════════════════╗",
    colors.cyan,
  );
  log(`║ ${message.padEnd(58)} ║`, colors.cyan);
  log(
    "╚════════════════════════════════════════════════════════════╝",
    colors.cyan,
  );
}

function logSection(message) {
  log(`\n${colors.bright}${message}${colors.reset}`);
  log("─".repeat(60), colors.cyan);
}

async function measureEndpoint(url, options = {}) {
  const startTime = performance.now();

  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = endTime - startTime;

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      duration,
      dataSize: JSON.stringify(data).length,
      data,
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      success: false,
      duration: endTime - startTime,
      error: error.message,
    };
  }
}

async function validateAnalyticsEndpoint() {
  logHeader("🚀 ANALYTICS ENDPOINT PERFORMANCE VALIDATION");

  const endpoint = `${API_BASE_URL}/api/analytics/dashboard`;

  log(`\n📍 Testing endpoint: ${endpoint}`, colors.bright);
  log(`🎯 Target response time: < ${TARGET_RESPONSE_TIME}ms`, colors.bright);
  log(`⚡ Expected response time: ~${EXPECTED_RESPONSE_TIME}ms`, colors.bright);
  log(`🔄 Test iterations: ${TEST_ITERATIONS}`, colors.bright);

  logSection("⏱️  PERFORMANCE MEASUREMENTS");

  const results = [];

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    log(`\nIteration ${i}/${TEST_ITERATIONS}...`, colors.magenta);

    const result = await measureEndpoint(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    results.push(result);

    if (result.success) {
      const performanceIcon =
        result.duration < EXPECTED_RESPONSE_TIME
          ? "⚡"
          : result.duration < TARGET_RESPONSE_TIME
            ? "✅"
            : "⚠️";
      const statusColor =
        result.duration < EXPECTED_RESPONSE_TIME
          ? colors.green
          : result.duration < TARGET_RESPONSE_TIME
            ? colors.yellow
            : colors.red;

      log(
        `  ${performanceIcon} Response time: ${result.duration.toFixed(2)}ms`,
        statusColor,
      );
      log(`  📦 Response size: ${(result.dataSize / 1024).toFixed(2)} KB`);
      log(`  📊 Status: ${result.status}`);
    } else {
      log(`  ❌ Failed: ${result.error || "Unknown error"}`, colors.red);
      log(`  ⏱️  Duration: ${result.duration.toFixed(2)}ms`);
    }

    // Small delay between requests
    if (i < TEST_ITERATIONS) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  logSection("📊 PERFORMANCE ANALYSIS");

  const successfulResults = results.filter((r) => r.success);

  if (successfulResults.length === 0) {
    log("\n❌ All requests failed! Cannot perform analysis.", colors.red);
    log("\nPossible issues:", colors.yellow);
    log("  • Dev server not running (run: npm run dev)");
    log("  • Database not connected");
    log("  • Authentication required (endpoint expects session)");
    return { passed: false, results };
  }

  const durations = successfulResults.map((r) => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const p95Duration = durations.sort((a, b) => a - b)[
    Math.floor(durations.length * 0.95)
  ];

  const dataSizes = successfulResults.map((r) => r.dataSize);
  const avgDataSize = dataSizes.reduce((a, b) => a + b, 0) / dataSizes.length;

  log(`\n✨ Average response time: ${avgDuration.toFixed(2)}ms`);
  log(`⚡ Min response time: ${minDuration.toFixed(2)}ms`);
  log(`🔥 Max response time: ${maxDuration.toFixed(2)}ms`);
  log(`📈 P95 response time: ${p95Duration.toFixed(2)}ms`);
  log(`📦 Average response size: ${(avgDataSize / 1024).toFixed(2)} KB`);
  log(
    `✅ Success rate: ${((successfulResults.length / results.length) * 100).toFixed(1)}%`,
  );

  // Check data structure
  if (successfulResults.length > 0) {
    const sampleData = successfulResults[0].data;
    logSection("📋 RESPONSE STRUCTURE VALIDATION");

    const hasExpectedFields =
      sampleData.summary &&
      sampleData.topProducts &&
      sampleData.recentOrders &&
      sampleData.lowInventory &&
      sampleData.alerts;

    if (hasExpectedFields) {
      log("\n✅ Response structure is valid", colors.green);
      log(
        `  • Summary metrics: ${Object.keys(sampleData.summary || {}).length} fields`,
      );
      log(`  • Top products: ${(sampleData.topProducts || []).length} items`);
      log(`  • Recent orders: ${(sampleData.recentOrders || []).length} items`);
      log(`  • Low inventory: ${(sampleData.lowInventory || []).length} items`);
      log(`  • Alerts: ${Object.keys(sampleData.alerts || {}).length} fields`);
    } else {
      log("\n⚠️  Response structure incomplete", colors.yellow);
      log(`Received keys: ${Object.keys(sampleData).join(", ")}`);
    }
  }

  logSection("🎯 PERFORMANCE VERDICT");

  const passed = avgDuration < TARGET_RESPONSE_TIME;
  const optimal = avgDuration < EXPECTED_RESPONSE_TIME;

  if (optimal) {
    log("\n🌟 DIVINE PERFORMANCE ACHIEVED! 🌟", colors.green + colors.bright);
    log(
      `✨ Average ${avgDuration.toFixed(2)}ms is BETTER than target ${EXPECTED_RESPONSE_TIME}ms!`,
      colors.green,
    );
    log(
      "⚡ Quantum optimization successful - reality bending in effect!",
      colors.green,
    );
  } else if (passed) {
    log("\n✅ PERFORMANCE TARGET MET!", colors.yellow + colors.bright);
    log(
      `✨ Average ${avgDuration.toFixed(2)}ms is within target ${TARGET_RESPONSE_TIME}ms`,
      colors.yellow,
    );
    log(
      "💡 Room for further optimization to reach divine standards.",
      colors.yellow,
    );
  } else {
    log("\n❌ PERFORMANCE TARGET MISSED", colors.red + colors.bright);
    log(
      `⚠️  Average ${avgDuration.toFixed(2)}ms exceeds target ${TARGET_RESPONSE_TIME}ms`,
      colors.red,
    );
    log("🔧 Further optimization required.", colors.red);

    log("\n💡 Optimization suggestions:", colors.yellow);
    log("  • Check database indexes are applied");
    log("  • Verify Prisma query optimization");
    log("  • Consider adding caching layer (Redis)");
    log("  • Review N+1 query patterns");
  }

  logSection("📝 SUMMARY");

  log(`\nTest completed: ${new Date().toISOString()}`);
  log(`Total requests: ${results.length}`);
  log(`Successful: ${successfulResults.length}`);
  log(`Failed: ${results.length - successfulResults.length}`);
  log(`Average latency: ${avgDuration.toFixed(2)}ms`);
  log(
    `Performance status: ${optimal ? "🌟 DIVINE" : passed ? "✅ GOOD" : "❌ NEEDS WORK"}`,
  );

  return {
    passed,
    optimal,
    results,
    stats: {
      avgDuration,
      minDuration,
      maxDuration,
      p95Duration,
      avgDataSize,
      successRate: successfulResults.length / results.length,
    },
  };
}

// Main execution
async function main() {
  try {
    const validation = await validateAnalyticsEndpoint();

    log("\n" + "═".repeat(60), colors.cyan);

    if (validation.optimal) {
      log(
        "🎉 VALIDATION COMPLETE: DIVINE PERFORMANCE",
        colors.green + colors.bright,
      );
      process.exit(0);
    } else if (validation.passed) {
      log("✅ VALIDATION COMPLETE: TARGET MET", colors.yellow + colors.bright);
      process.exit(0);
    } else {
      log(
        "❌ VALIDATION FAILED: OPTIMIZATION NEEDED",
        colors.red + colors.bright,
      );
      process.exit(1);
    }
  } catch (error) {
    log("\n💥 VALIDATION ERROR", colors.red + colors.bright);
    log(`Error: ${error.message}`, colors.red);
    log("\nStack trace:", colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Pre-flight check
logHeader("🔍 PRE-FLIGHT CHECKS");
log("\n⚙️  Checking server availability...", colors.cyan);

checkServer()
  .then((isRunning) => {
    if (!isRunning) {
      log(
        "\n⚠️  WARNING: Server may not be running!",
        colors.yellow + colors.bright,
      );
      log("\nTo start the dev server:", colors.yellow);
      log("  npm run dev", colors.cyan);
      log("\nProceeding with validation anyway...", colors.yellow);
    } else {
      log("✅ Server is running", colors.green);
    }

    log("\n🚀 Starting performance validation...\n", colors.cyan);
    main();
  })
  .catch((error) => {
    log("\n⚠️  Could not check server status", colors.yellow);
    log("Proceeding with validation...\n", colors.yellow);
    main();
  });
