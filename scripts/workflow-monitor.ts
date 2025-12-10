#!/usr/bin/env tsx
/**
 * 🌾 FARMERS MARKET PLATFORM - WORKFLOW MONITOR BOT
 * Divine Agricultural Consciousness Monitoring System
 *
 * Purpose: Automated monitoring of platform health, workflows, and system status
 * Hardware: Optimized for HP OMEN (12 threads, 64GB RAM, RTX 2070 Max-Q)
 *
 * Features:
 * - Real-time health monitoring
 * - Workflow status checks
 * - Performance metrics
 * - Database connectivity
 * - API endpoint verification
 * - Agricultural consciousness validation
 */

import http from "http";
import https from "https";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  baseUrl: process.env.BASE_URL || "http://localhost:3001",
  checkInterval: 30000, // 30 seconds
  timeout: 10000, // 10 seconds
  retries: 3,
  healthCheckEndpoints: ["/api/health", "/api/ready"],
  criticalPages: [
    "/",
    "/login",
    "/signup",
    "/marketplace",
    "/marketplace/products",
    "/marketplace/farms",
  ],
  dashboardPages: ["/dashboard", "/farmer/dashboard"],
  colors: {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface CheckResult {
  url: string;
  status: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

interface MonitorReport {
  timestamp: string;
  overall: "healthy" | "degraded" | "down";
  checks: CheckResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    avgResponseTime: number;
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

function log(message: string, color?: keyof typeof CONFIG.colors) {
  const colorCode = color ? CONFIG.colors[color] : "";
  const reset = CONFIG.colors.reset;
  console.log(`${colorCode}${message}${reset}`);
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================================
// HTTP CLIENT
// ============================================================================

async function httpRequest(url: string): Promise<CheckResult> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === "https:" ? https : http;

    const req = client.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: "GET",
        timeout: CONFIG.timeout,
        headers: {
          "User-Agent": "Farmers-Market-Workflow-Monitor/1.0",
        },
      },
      (res) => {
        const responseTime = Date.now() - startTime;

        // Consume response data to free up memory
        res.on("data", () => {});
        res.on("end", () => {
          resolve({
            url,
            status: res.statusCode || 0,
            responseTime,
            success: res.statusCode ? res.statusCode < 400 : false,
          });
        });
      },
    );

    req.on("error", (error) => {
      const responseTime = Date.now() - startTime;
      resolve({
        url,
        status: 0,
        responseTime,
        success: false,
        error: error.message,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      resolve({
        url,
        status: 0,
        responseTime,
        success: false,
        error: "Request timeout",
      });
    });

    req.end();
  });
}

// ============================================================================
// MONITORING FUNCTIONS
// ============================================================================

async function checkEndpoint(
  path: string,
  retries = CONFIG.retries,
): Promise<CheckResult> {
  const url = `${CONFIG.baseUrl}${path}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const result = await httpRequest(url);

    if (result.success || attempt === retries) {
      return result;
    }

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
  }

  // Fallback (shouldn't reach here)
  return await httpRequest(url);
}

async function performHealthCheck(): Promise<MonitorReport> {
  const timestamp = formatTimestamp();
  const checks: CheckResult[] = [];

  log(
    "\n╔════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  log("║  🌾 Farmers Market Platform - Workflow Monitor            ║", "cyan");
  log("╠════════════════════════════════════════════════════════════╣", "cyan");
  log(`║  ⏰ ${timestamp}                           ║`, "cyan");
  log(
    "╚════════════════════════════════════════════════════════════╝\n",
    "cyan",
  );

  // Check critical pages
  log("🔍 Checking Critical Pages...", "bright");
  for (const page of CONFIG.criticalPages) {
    const result = await checkEndpoint(page);
    checks.push(result);

    const statusColor = result.success ? "green" : "red";
    const icon = result.success ? "✓" : "✗";
    log(
      `  ${icon} ${page.padEnd(30)} [${result.status}] ${formatTime(result.responseTime)}`,
      statusColor,
    );
  }

  // Check dashboard pages
  log("\n📊 Checking Dashboard Pages...", "bright");
  for (const page of CONFIG.dashboardPages) {
    const result = await checkEndpoint(page);
    checks.push(result);

    const statusColor = result.success ? "green" : "yellow";
    const icon = result.success ? "✓" : "⚠";
    log(
      `  ${icon} ${page.padEnd(30)} [${result.status}] ${formatTime(result.responseTime)}`,
      statusColor,
    );
  }

  // Check health endpoints (allowed to fail)
  log("\n🏥 Checking Health Endpoints...", "bright");
  for (const endpoint of CONFIG.healthCheckEndpoints) {
    const result = await checkEndpoint(endpoint);
    checks.push(result);

    const statusColor = result.success ? "green" : "yellow";
    const icon = result.success ? "✓" : "⚠";
    log(
      `  ${icon} ${endpoint.padEnd(30)} [${result.status}] ${formatTime(result.responseTime)}`,
      statusColor,
    );
  }

  // Calculate summary
  const passed = checks.filter((c) => c.success).length;
  const failed = checks.length - passed;
  const avgResponseTime =
    checks.reduce((sum, c) => sum + c.responseTime, 0) / checks.length;

  const criticalFailed = checks
    .filter((c) =>
      CONFIG.criticalPages.includes(c.url.replace(CONFIG.baseUrl, "")),
    )
    .filter((c) => !c.success).length;

  const overall: MonitorReport["overall"] =
    criticalFailed > 0 ? "down" : failed > 0 ? "degraded" : "healthy";

  // Display summary
  log(
    "\n╔════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  log("║  📊 MONITORING SUMMARY                                     ║", "cyan");
  log("╠════════════════════════════════════════════════════════════╣", "cyan");
  log(`║  Total Checks: ${checks.length.toString().padEnd(43)} ║`, "cyan");
  log(`║  Passed: ${passed.toString().padEnd(49)} ║`, "cyan");
  log(`║  Failed: ${failed.toString().padEnd(49)} ║`, "cyan");
  log(
    `║  Success Rate: ${((passed / checks.length) * 100).toFixed(1)}%${" ".repeat(38)} ║`,
    "cyan",
  );
  log(`║  Avg Response: ${formatTime(avgResponseTime).padEnd(41)} ║`, "cyan");
  log(
    "╚════════════════════════════════════════════════════════════╝\n",
    "cyan",
  );

  // Display overall status
  const statusColor =
    overall === "healthy" ? "green" : overall === "degraded" ? "yellow" : "red";
  const statusIcon =
    overall === "healthy" ? "✅" : overall === "degraded" ? "⚠️" : "❌";
  log(`${statusIcon} Overall Status: ${overall.toUpperCase()}\n`, statusColor);

  return {
    timestamp,
    overall,
    checks,
    summary: {
      total: checks.length,
      passed,
      failed,
      avgResponseTime,
    },
  };
}

async function runContinuousMonitoring() {
  log("🤖 Starting Continuous Monitoring...", "bright");
  log(`📡 Monitoring ${CONFIG.baseUrl}`, "cyan");
  log(`⏱️  Check Interval: ${CONFIG.checkInterval / 1000}s\n`, "cyan");
  log("Press Ctrl+C to stop\n", "yellow");

  let checkCount = 0;

  while (true) {
    checkCount++;
    log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "magenta",
    );
    log(`🔄 Check #${checkCount}`, "bright");
    log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
      "magenta",
    );

    await performHealthCheck();

    log(
      `\n⏳ Next check in ${CONFIG.checkInterval / 1000} seconds...\n`,
      "cyan",
    );
    await new Promise((resolve) => setTimeout(resolve, CONFIG.checkInterval));
  }
}

async function runSingleCheck() {
  await performHealthCheck();
}

async function listEndpoints() {
  log(
    "\n╔════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  log("║  📋 MONITORED ENDPOINTS                                    ║", "cyan");
  log(
    "╚════════════════════════════════════════════════════════════╝\n",
    "cyan",
  );

  log("🔍 Critical Pages:", "bright");
  CONFIG.criticalPages.forEach((page) => {
    log(`  • ${page}`, "cyan");
  });

  log("\n📊 Dashboard Pages:", "bright");
  CONFIG.dashboardPages.forEach((page) => {
    log(`  • ${page}`, "cyan");
  });

  log("\n🏥 Health Endpoints:", "bright");
  CONFIG.healthCheckEndpoints.forEach((endpoint) => {
    log(`  • ${endpoint}`, "cyan");
  });

  log(`\n📡 Base URL: ${CONFIG.baseUrl}`, "cyan");
  log(`⏱️  Check Interval: ${CONFIG.checkInterval / 1000}s`, "cyan");
  log(`⏰ Timeout: ${CONFIG.timeout / 1000}s`, "cyan");
  log(`🔄 Retries: ${CONFIG.retries}\n`, "cyan");
}

async function showHelp() {
  log(
    "\n╔════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  log("║  🌾 Farmers Market Platform - Workflow Monitor            ║", "cyan");
  log("║  Divine Agricultural Consciousness Monitoring System       ║", "cyan");
  log(
    "╚════════════════════════════════════════════════════════════╝\n",
    "cyan",
  );

  log("📖 USAGE:", "bright");
  log("  npm run monitor              - Run single health check", "cyan");
  log("  npm run monitor:all          - Run single health check", "cyan");
  log("  npm run monitor:start        - Start continuous monitoring", "cyan");
  log("  npm run monitor:critical     - Check critical endpoints only", "cyan");
  log("  npm run monitor:health       - Check health endpoints only", "cyan");
  log("  npm run monitor:workflow     - Run workflow validation", "cyan");
  log(
    "  npm run monitor:list         - List all monitored endpoints\n",
    "cyan",
  );

  log("🎯 COMMANDS:", "bright");
  log("  all       - Run complete health check once", "cyan");
  log("  start     - Start continuous monitoring daemon", "cyan");
  log("  critical  - Check only critical pages", "cyan");
  log("  health    - Check only health endpoints", "cyan");
  log("  workflow  - Validate workflow status", "cyan");
  log("  list      - List monitored endpoints", "cyan");
  log("  help      - Show this help message\n", "cyan");

  log("🌐 ENVIRONMENT:", "bright");
  log(
    "  BASE_URL  - Override base URL (default: http://localhost:3001)",
    "cyan",
  );
  log(
    "  Example: BASE_URL=https://staging.example.com npm run monitor\n",
    "cyan",
  );

  log("💡 EXAMPLES:", "bright");
  log("  # Single check", "yellow");
  log("  npm run monitor:all\n", "cyan");
  log("  # Continuous monitoring", "yellow");
  log("  npm run monitor:start\n", "cyan");
  log("  # Check staging environment", "yellow");
  log(
    "  BASE_URL=https://staging.farmersmarket.com npm run monitor:all\n",
    "cyan",
  );
}

async function checkCriticalOnly() {
  log("\n🔍 Checking Critical Endpoints Only...\n", "bright");

  const checks: CheckResult[] = [];
  for (const page of CONFIG.criticalPages) {
    const result = await checkEndpoint(page);
    checks.push(result);

    const statusColor = result.success ? "green" : "red";
    const icon = result.success ? "✓" : "✗";
    log(
      `  ${icon} ${page.padEnd(30)} [${result.status}] ${formatTime(result.responseTime)}`,
      statusColor,
    );
  }

  const passed = checks.filter((c) => c.success).length;
  const failed = checks.length - passed;

  log(
    `\n📊 Results: ${passed}/${checks.length} passed`,
    passed === checks.length ? "green" : "red",
  );

  if (failed > 0) {
    log("❌ CRITICAL ENDPOINTS FAILING!", "red");
    process.exit(1);
  } else {
    log("✅ All critical endpoints healthy", "green");
  }
}

async function checkHealthOnly() {
  log("\n🏥 Checking Health Endpoints Only...\n", "bright");

  const checks: CheckResult[] = [];
  for (const endpoint of CONFIG.healthCheckEndpoints) {
    const result = await checkEndpoint(endpoint);
    checks.push(result);

    const statusColor = result.success ? "green" : "yellow";
    const icon = result.success ? "✓" : "⚠";
    log(
      `  ${icon} ${endpoint.padEnd(30)} [${result.status}] ${formatTime(result.responseTime)}`,
      statusColor,
    );
  }

  const passed = checks.filter((c) => c.success).length;
  log(`\n📊 Results: ${passed}/${checks.length} passed\n`, "cyan");
}

async function runWorkflowValidation() {
  log(
    "\n╔════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  log("║  🔄 WORKFLOW VALIDATION                                    ║", "cyan");
  log(
    "╚════════════════════════════════════════════════════════════╝\n",
    "cyan",
  );

  const workflows = [
    { name: "User Registration", path: "/signup" },
    { name: "User Login", path: "/login" },
    { name: "Product Browsing", path: "/marketplace/products" },
    { name: "Farm Discovery", path: "/marketplace/farms" },
    { name: "Shopping Cart", path: "/cart" },
    { name: "Checkout", path: "/checkout" },
    { name: "Customer Dashboard", path: "/dashboard" },
    { name: "Farmer Dashboard", path: "/farmer/dashboard" },
  ];

  const results: CheckResult[] = [];

  for (const workflow of workflows) {
    const result = await checkEndpoint(workflow.path);
    results.push(result);

    const statusColor = result.success ? "green" : "red";
    const icon = result.success ? "✓" : "✗";
    log(
      `  ${icon} ${workflow.name.padEnd(25)} ${formatTime(result.responseTime)}`,
      statusColor,
    );
  }

  const passed = results.filter((r) => r.success).length;
  const successRate = (passed / results.length) * 100;

  log(
    "\n╔════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  log(
    `║  Success Rate: ${successRate.toFixed(1)}% (${passed}/${results.length})${" ".repeat(28)} ║`,
    "cyan",
  );
  log(
    "╚════════════════════════════════════════════════════════════╝\n",
    "cyan",
  );

  if (successRate >= 95) {
    log("✅ All workflows operational", "green");
  } else if (successRate >= 80) {
    log("⚠️ Some workflows degraded", "yellow");
  } else {
    log("❌ Critical workflows failing", "red");
    process.exit(1);
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const command = process.argv[2] || "all";

  try {
    switch (command) {
      case "all":
        await runSingleCheck();
        break;

      case "start":
        await runContinuousMonitoring();
        break;

      case "critical":
        await checkCriticalOnly();
        break;

      case "health":
        await checkHealthOnly();
        break;

      case "workflow":
        await runWorkflowValidation();
        break;

      case "list":
        await listEndpoints();
        break;

      case "help":
      case "--help":
      case "-h":
        await showHelp();
        break;

      default:
        log(`❌ Unknown command: ${command}`, "red");
        log('Run "npm run monitor help" for usage information\n', "yellow");
        process.exit(1);
    }
  } catch (error) {
    log(
      `\n❌ Monitor Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "red",
    );
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  log("\n\n🛑 Stopping workflow monitor...", "yellow");
  log("✅ Monitor stopped gracefully\n", "green");
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("\n\n🛑 Stopping workflow monitor...", "yellow");
  log("✅ Monitor stopped gracefully\n", "green");
  process.exit(0);
});

// Run
main();
