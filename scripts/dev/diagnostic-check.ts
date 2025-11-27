#!/usr/bin/env tsx

/**
 * 🌟 Divine Monitoring Bot Diagnostic Check
 * Farmers Market Platform - System Diagnostic & Health Verification
 * Version: 1.0.0
 *
 * Performs comprehensive diagnostic checks on the monitoring bot and server
 */

import { chromium } from "@playwright/test";
import chalk from "chalk";

// ============================================================================
// DIAGNOSTIC CONFIGURATION
// ============================================================================

const DIAGNOSTIC_CONFIG = {
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  timeout: 10000,
  checkServer: true,
  checkBrowser: true,
  checkWorkflows: true,
  checkReporter: true,
};

interface DiagnosticResult {
  component: string;
  status: "PASS" | "FAIL" | "WARN";
  message: string;
  details?: any;
  duration?: number;
}

const results: DiagnosticResult[] = [];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function logHeader(title: string) {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log(`║ ${title.padEnd(58)} ║`);
  console.log("╚════════════════════════════════════════════════════════════╝\n");
}

function logResult(result: DiagnosticResult) {
  const icon =
    result.status === "PASS" ? "✅" : result.status === "FAIL" ? "❌" : "⚠️ ";
  const color =
    result.status === "PASS"
      ? chalk.green
      : result.status === "FAIL"
        ? chalk.red
        : chalk.yellow;

  console.log(
    color(`${icon} ${result.component}: ${result.status} - ${result.message}`),
  );

  if (result.details) {
    console.log(chalk.gray(`   Details: ${JSON.stringify(result.details)}`));
  }

  if (result.duration) {
    console.log(chalk.gray(`   Duration: ${result.duration}ms`));
  }
}

function addResult(
  component: string,
  status: "PASS" | "FAIL" | "WARN",
  message: string,
  details?: any,
  duration?: number,
) {
  const result: DiagnosticResult = {
    component,
    status,
    message,
    details,
    duration,
  };
  results.push(result);
  logResult(result);
}

// ============================================================================
// DIAGNOSTIC CHECKS
// ============================================================================

async function checkServerAvailability(): Promise<void> {
  logHeader("🌐 SERVER AVAILABILITY CHECK");

  const startTime = Date.now();

  try {
    const response = await fetch(DIAGNOSTIC_CONFIG.baseUrl, {
      signal: AbortSignal.timeout(5000),
    });

    const duration = Date.now() - startTime;

    if (response.ok) {
      addResult(
        "Server Reachability",
        "PASS",
        "Server is responding",
        { status: response.status, statusText: response.statusText },
        duration,
      );
    } else {
      addResult(
        "Server Reachability",
        "WARN",
        "Server responded with non-200 status",
        { status: response.status, statusText: response.statusText },
        duration,
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    addResult(
      "Server Reachability",
      "FAIL",
      "Server is not reachable",
      {
        error: errorMessage,
        url: DIAGNOSTIC_CONFIG.baseUrl,
        suggestion: "Start dev server with: npm run dev",
      },
      duration,
    );
  }

  // Check API health endpoint
  try {
    const response = await fetch(`${DIAGNOSTIC_CONFIG.baseUrl}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });

    const duration = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      addResult(
        "API Health Endpoint",
        "PASS",
        "Health endpoint is functional",
        data,
        duration,
      );
    } else {
      addResult(
        "API Health Endpoint",
        "WARN",
        "Health endpoint returned error",
        { status: response.status },
        duration,
      );
    }
  } catch (error) {
    addResult(
      "API Health Endpoint",
      "FAIL",
      "Health endpoint is not accessible",
      { error: error instanceof Error ? error.message : String(error) },
    );
  }
}

async function checkBrowserAutomation(): Promise<void> {
  logHeader("🤖 BROWSER AUTOMATION CHECK");

  let browser;
  const startTime = Date.now();

  try {
    // Check if Playwright is installed
    addResult(
      "Playwright Installation",
      "PASS",
      "Playwright library is available",
    );

    // Launch browser
    browser = await chromium.launch({
      headless: true,
      timeout: 10000,
    });

    const launchDuration = Date.now() - startTime;

    addResult(
      "Browser Launch",
      "PASS",
      "Chromium browser launched successfully",
      { headless: true },
      launchDuration,
    );

    // Create context
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    addResult(
      "Browser Context",
      "PASS",
      "Browser context created successfully",
    );

    // Create page
    const page = await context.newPage();

    addResult("Browser Page", "PASS", "Browser page created successfully");

    // Test navigation (to a reliable external site)
    try {
      await page.goto("https://example.com", {
        waitUntil: "domcontentloaded",
        timeout: 5000,
      });

      addResult(
        "Page Navigation",
        "PASS",
        "Page navigation working correctly",
      );
    } catch (error) {
      addResult(
        "Page Navigation",
        "WARN",
        "Page navigation test failed (network issue?)",
        { error: error instanceof Error ? error.message : String(error) },
      );
    }

    await browser.close();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("Executable doesn't exist")) {
      addResult(
        "Browser Launch",
        "FAIL",
        "Chromium browser not installed",
        {
          error: errorMessage,
          solution: "Run: npx playwright install chromium",
        },
      );
    } else {
      addResult("Browser Launch", "FAIL", "Browser launch failed", {
        error: errorMessage,
      });
    }

    if (browser) {
      await browser.close();
    }
  }
}

async function checkMonitoringComponents(): Promise<void> {
  logHeader("🔧 MONITORING COMPONENTS CHECK");

  try {
    // Check bot module
    const { createMonitoringBot } = await import("../src/lib/monitoring/bot");
    addResult(
      "Bot Module",
      "PASS",
      "Monitoring bot module loaded successfully",
    );

    // Check workflows module
    const workflows = await import(
      "../src/lib/monitoring/workflows/predefined-workflows"
    );
    addResult(
      "Workflows Module",
      "PASS",
      "Predefined workflows module loaded successfully",
      { workflowCount: workflows.PREDEFINED_WORKFLOWS.length },
    );

    // Check executor module
    const { createWorkflowExecutor } = await import(
      "../src/lib/monitoring/workflows/workflow-executor"
    );
    addResult(
      "Executor Module",
      "PASS",
      "Workflow executor module loaded successfully",
    );

    // Check reporter module
    const { createReporter } = await import("../src/lib/monitoring/reporter");
    addResult(
      "Reporter Module",
      "PASS",
      "Reporter module loaded successfully",
    );

    // Test bot instantiation
    const bot = createMonitoringBot({
      baseUrl: DIAGNOSTIC_CONFIG.baseUrl,
    });

    addResult("Bot Instantiation", "PASS", "Bot instance created successfully");

    // Test workflow listing
    const workflowList = bot.listWorkflows();
    addResult("Workflow Registration", "PASS", "Workflows registered correctly", {
      totalWorkflows: workflowList.length,
      critical: workflowList.filter((w) => w.priority === "CRITICAL").length,
      high: workflowList.filter((w) => w.priority === "HIGH").length,
    });

    // Test workflow retrieval
    const healthCheckWorkflow = bot.getWorkflow("health-check");
    if (healthCheckWorkflow) {
      addResult(
        "Workflow Retrieval",
        "PASS",
        "Workflow retrieval working correctly",
      );
    } else {
      addResult(
        "Workflow Retrieval",
        "FAIL",
        "Could not retrieve health-check workflow",
      );
    }

    // Test configuration access
    const config = bot.getConfig();
    addResult("Configuration Access", "PASS", "Bot configuration accessible", {
      baseUrl: config.baseUrl,
      performanceEnabled: config.performance?.parallel,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    addResult("Monitoring Components", "FAIL", "Component check failed", {
      error: errorMessage,
    });
  }
}

async function checkReportGeneration(): Promise<void> {
  logHeader("📊 REPORT GENERATION CHECK");

  try {
    const { createReporter } = await import("../src/lib/monitoring/reporter");

    const reporter = createReporter("./test-diagnostic-reports");

    addResult(
      "Reporter Creation",
      "PASS",
      "Reporter instance created successfully",
    );

    // Generate test report
    const mockResults = [
      {
        workflowId: "diagnostic-test",
        runId: "run_diagnostic_123",
        name: "Diagnostic Test Workflow",
        type: "HEALTH_CHECK" as const,
        priority: "CRITICAL" as const,
        status: "PASSED" as const,
        startTime: new Date(),
        endTime: new Date(Date.now() + 1000),
        duration: 1000,
        steps: [],
        totalSteps: 1,
        passedSteps: 1,
        failedSteps: 0,
        skippedSteps: 0,
        screenshots: [],
        traces: [],
        metrics: {
          totalDuration: 1000,
          errors: 0,
          warnings: 0,
          performanceScore: 100,
        },
        tags: ["diagnostic", "test"],
      },
    ];

    const report = await reporter.generateReport(mockResults, {
      start: new Date(Date.now() - 3600000),
      end: new Date(),
    });

    addResult(
      "Report Generation",
      "PASS",
      "Report generated successfully",
      {
        reportId: report.reportId,
        successRate: report.summary.successRate,
        totalWorkflows: report.summary.totalWorkflows,
      },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    addResult("Report Generation", "FAIL", "Report generation failed", {
      error: errorMessage,
    });
  }
}

async function checkFileSystem(): Promise<void> {
  logHeader("📁 FILESYSTEM CHECK");

  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    // Check if monitoring reports directory exists or can be created
    const reportsDir = "./monitoring-reports";

    try {
      await fs.access(reportsDir);
      addResult(
        "Reports Directory",
        "PASS",
        "Reports directory exists",
        { path: reportsDir },
      );
    } catch {
      try {
        await fs.mkdir(reportsDir, { recursive: true });
        addResult(
          "Reports Directory",
          "PASS",
          "Reports directory created successfully",
          { path: reportsDir },
        );
      } catch (error) {
        addResult(
          "Reports Directory",
          "FAIL",
          "Cannot create reports directory",
          { error: error instanceof Error ? error.message : String(error) },
        );
      }
    }

    // Check test-results directory
    const testResultsDir = "./test-results";

    try {
      await fs.access(testResultsDir);
      addResult(
        "Test Results Directory",
        "PASS",
        "Test results directory exists",
      );
    } catch {
      try {
        await fs.mkdir(testResultsDir, { recursive: true });
        addResult(
          "Test Results Directory",
          "PASS",
          "Test results directory created successfully",
        );
      } catch (error) {
        addResult(
          "Test Results Directory",
          "WARN",
          "Cannot create test results directory",
          { error: error instanceof Error ? error.message : String(error) },
        );
      }
    }
  } catch (error) {
    addResult("Filesystem Check", "FAIL", "Filesystem check failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============================================================================
// SUMMARY REPORT
// ============================================================================

function generateSummary() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                   📋 DIAGNOSTIC SUMMARY                    ║");
  console.log("╠════════════════════════════════════════════════════════════╣");

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const warnings = results.filter((r) => r.status === "WARN").length;
  const total = results.length;

  console.log(`║ ✅ PASSED: ${passed.toString().padEnd(48)} ║`);
  console.log(`║ ❌ FAILED: ${failed.toString().padEnd(48)} ║`);
  console.log(`║ ⚠️  WARNINGS: ${warnings.toString().padEnd(45)} ║`);
  console.log(`║ 📊 TOTAL CHECKS: ${total.toString().padEnd(42)} ║`);
  console.log("╠════════════════════════════════════════════════════════════╣");

  const successRate = ((passed / total) * 100).toFixed(1);
  console.log(`║ 📈 SUCCESS RATE: ${successRate}%${" ".repeat(40 - successRate.length)} ║`);

  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Overall status
  if (failed === 0 && warnings === 0) {
    console.log(chalk.green.bold("🎉 ALL DIAGNOSTICS PASSED - SYSTEM HEALTHY\n"));
  } else if (failed === 0) {
    console.log(
      chalk.yellow.bold(
        `⚠️  SYSTEM OPERATIONAL WITH ${warnings} WARNING(S) - REVIEW RECOMMENDED\n`,
      ),
    );
  } else {
    console.log(
      chalk.red.bold(
        `❌ SYSTEM HAS ${failed} CRITICAL ISSUE(S) - ACTION REQUIRED\n`,
      ),
    );
  }

  // Actionable recommendations
  const failedComponents = results.filter((r) => r.status === "FAIL");
  if (failedComponents.length > 0) {
    console.log(chalk.red.bold("🔧 REQUIRED ACTIONS:\n"));

    failedComponents.forEach((result, index) => {
      console.log(
        chalk.red(`${index + 1}. ${result.component}: ${result.message}`),
      );
      if (result.details?.solution) {
        console.log(chalk.yellow(`   → Solution: ${result.details.solution}`));
      }
      if (result.details?.suggestion) {
        console.log(
          chalk.yellow(`   → Suggestion: ${result.details.suggestion}`),
        );
      }
    });
    console.log();
  }

  // Server-specific recommendations
  const serverFailed = results.some(
    (r) => r.component === "Server Reachability" && r.status === "FAIL",
  );
  const browserFailed = results.some(
    (r) => r.component === "Browser Launch" && r.status === "FAIL",
  );

  console.log(chalk.cyan.bold("📋 NEXT STEPS:\n"));

  if (serverFailed) {
    console.log(chalk.cyan("1. Start the development server:"));
    console.log(chalk.gray("   npm run dev\n"));
    console.log(
      chalk.cyan("2. Wait 30-60 seconds for server to fully start\n"),
    );
    console.log(chalk.cyan("3. Re-run this diagnostic:"));
    console.log(chalk.gray("   npm run diagnostic\n"));
  }

  if (browserFailed) {
    console.log(chalk.cyan("1. Install Playwright browsers:"));
    console.log(chalk.gray("   npx playwright install chromium\n"));
    console.log(chalk.cyan("2. Re-run this diagnostic:"));
    console.log(chalk.gray("   npm run diagnostic\n"));
  }

  if (!serverFailed && !browserFailed && failed === 0) {
    console.log(chalk.cyan("1. Run the monitoring test suite:"));
    console.log(chalk.gray("   npm run test:monitor\n"));
    console.log(chalk.cyan("2. Run health check:"));
    console.log(chalk.gray("   npm run monitor:health\n"));
    console.log(chalk.cyan("3. Run all workflows:"));
    console.log(chalk.gray("   npm run monitor:all\n"));
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function runDiagnostics() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                                                            ║");
  console.log("║       🌟 DIVINE MONITORING BOT DIAGNOSTIC CHECK            ║");
  console.log("║         Farmers Market Platform - System Health           ║");
  console.log("║                                                            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  console.log(chalk.gray(`\n🔍 Running diagnostics for: ${DIAGNOSTIC_CONFIG.baseUrl}\n`));

  const startTime = Date.now();

  try {
    // Run all diagnostic checks
    await checkFileSystem();
    await checkMonitoringComponents();
    await checkBrowserAutomation();
    await checkReportGeneration();
    await checkServerAvailability();

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Generate summary
    generateSummary();

    console.log(chalk.gray(`⏱️  Total diagnostic time: ${totalDuration}s\n`));

    // Exit with appropriate code
    const hasCriticalFailures = results.some((r) => r.status === "FAIL");
    process.exit(hasCriticalFailures ? 1 : 0);
  } catch (error) {
    console.error(chalk.red.bold("\n❌ Diagnostic check failed:"), error);
    process.exit(1);
  }
}

// Run diagnostics
runDiagnostics();
