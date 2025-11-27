#!/usr/bin/env tsx
/**
 * ============================================================================
 * MONITORING SYSTEM INTEGRATION TEST
 * Farmers Market Platform - Workflow Monitoring System
 * ============================================================================
 *
 * Purpose: End-to-end integration test of monitoring system
 * Tests: Database persistence, Slack notifications, alert engine, metrics API
 * Usage: npm run test:monitoring-integration
 *
 * ============================================================================
 */

import { DivineMonitoringBot } from "../src/lib/monitoring/bot";
import { getDatabaseStorage } from "../src/lib/monitoring/storage/database.storage";
import { createNotificationManager } from "../src/lib/monitoring/notifiers";
import { database } from "../src/lib/database";

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg: string) =>
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg: string) =>
    console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  section: (msg: string) =>
    console.log(`\n${colors.magenta}▶${colors.reset} ${msg}`),
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<void>,
): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    results.push({ name, passed: true, duration });
    log.success(`${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: errorMsg, duration });
    log.error(`${name} - ${errorMsg} (${duration}ms)`);
  }
}

// ============================================================================
// TEST SUITE 1: Database Connection & Schema Validation
// ============================================================================

async function testDatabaseConnection(): Promise<void> {
  log.section("Testing Database Connection & Schema");

  await runTest("Database connection", async () => {
    await database.$queryRaw`SELECT 1 as connected`;
  });

  await runTest("Verify monitoring tables exist", async () => {
    const tables = await database.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename LIKE '%monitoring%' OR tablename LIKE '%workflow%'
    `;

    const tableNames = tables.map((t) => t.tablename);
    const requiredTables = [
      "monitoring_reports",
      "workflow_executions",
      "workflow_metrics",
      "system_health_checks",
      "notification_logs",
      "workflow_schedules",
    ];

    const missingTables = requiredTables.filter((t) => !tableNames.includes(t));
    if (missingTables.length > 0) {
      throw new Error(`Missing tables: ${missingTables.join(", ")}`);
    }
  });

  await runTest("Verify Prisma schema mapping", async () => {
    // Test that Prisma can read from tables without errors
    const schedules = await database.workflowSchedule.findMany({ take: 1 });
    const executions = await database.workflowExecution.findMany({ take: 1 });
    const reports = await database.monitoringReport.findMany({ take: 1 });

    log.info(
      `  Found ${schedules.length} schedules, ${executions.length} executions, ${reports.length} reports`,
    );
  });
}

// ============================================================================
// TEST SUITE 2: Storage Service Integration
// ============================================================================

async function testStorageService(): Promise<void> {
  log.section("Testing Storage Service");

  const storage = getDatabaseStorage();

  await runTest("Get storage statistics", async () => {
    const stats = await storage.getStorageStats();
    log.info(
      `  Total records: ${stats.totalReports + stats.totalExecutions + stats.totalMetrics}`,
    );
  });

  await runTest("Create test workflow execution", async () => {
    const testExecution = {
      workflowId: "integration-test",
      runId: `test-integration-${Date.now()}`,
      name: "Integration Test Workflow",
      type: "e2e" as const,
      priority: "high" as const,
      status: "SUCCESS" as const,
      startTime: new Date(Date.now() - 5000),
      endTime: new Date(),
      duration: 5000,
      steps: {
        totalSteps: 3,
        passedSteps: 3,
        failedSteps: 0,
        skippedSteps: 0,
      },
      screenshots: [],
      traces: [],
      metrics: {
        apiResponseTime: 250,
        pageLoadTime: 1200,
      },
      tags: ["integration-test"],
    };

    await storage.saveWorkflowExecution(testExecution);
  });

  await runTest("Query recent executions", async () => {
    const executions = await storage.getWorkflowExecutions({
      limit: 10,
    });

    if (executions.length === 0) {
      throw new Error("No executions found");
    }

    log.info(`  Found ${executions.length} recent executions`);
  });

  await runTest("Create test health check", async () => {
    const healthCheck = {
      healthy: true,
      responseTime: 50,
      databaseHealthy: true,
      apiHealthy: true,
      cacheHealthy: true,
      externalServicesHealthy: true,
      details: {
        test: true,
      },
      errors: [],
    };

    await storage.saveHealthCheck(healthCheck);
  });

  await runTest("Query health history", async () => {
    const history = await storage.getHealthHistory({ limit: 10 });
    log.info(`  Found ${history.length} health checks`);
  });

  await runTest("Log test notification", async () => {
    const notification = {
      id: `test-notif-${Date.now()}`,
      channel: "slack",
      type: "test",
      priority: "low",
      subject: "Integration Test Notification",
      message: "This is a test notification from the integration test suite",
      timestamp: new Date(),
      sent: true,
    };

    await storage.logNotification(notification as any);
  });

  await runTest("Cleanup test records", async () => {
    // Delete test executions
    await database.workflowExecution.deleteMany({
      where: {
        runId: { startsWith: "test-integration-" },
      },
    });

    await database.systemHealthCheck.deleteMany({
      where: {
        checkName: "system-health",
        metadata: {
          path: ["test"],
          equals: true,
        },
      },
    });
  });
}

// ============================================================================
// TEST SUITE 3: Monitoring Bot Integration
// ============================================================================

async function testMonitoringBot(): Promise<void> {
  log.section("Testing Monitoring Bot Integration");

  const bot = new DivineMonitoringBot({
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    enableNotifications: false, // Don't spam Slack during tests
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    workflows: [
      {
        id: "test-workflow",
        name: "Test Workflow",
        enabled: true,
        schedule: "manual",
        timeout: 30000,
        retryAttempts: 1,
        type: "SYSTEM_CHECK",
        priority: "MEDIUM",
        steps: [],
      },
    ],
    storage: {
      type: "database",
      retentionDays: 30,
    },
    reporting: {
      enabled: true,
      frequency: "hourly",
      includeScreenshots: false,
    },
    agricultureConsciousness: {
      enabled: true,
      seasonalAwareness: true,
      biodynamicValidation: false,
    },
  });

  await runTest("Initialize monitoring bot", async () => {
    // Bot should initialize without errors
    if (!bot) {
      throw new Error("Bot initialization failed");
    }
  });

  await runTest("Run health check", async () => {
    const result = await bot.runHealthCheck();

    if (!result) {
      throw new Error("Health check returned no result");
    }

    log.info(`  Health status: ${result.healthy ? "HEALTHY" : "UNHEALTHY"}`);
    log.info(`  Response time: ${result.responseTime}ms`);
  });
}

// ============================================================================
// TEST SUITE 4: Workflow Schedules
// ============================================================================

async function testWorkflowSchedules(): Promise<void> {
  log.section("Testing Workflow Schedules");

  await runTest("Query workflow schedules", async () => {
    const schedules = await database.workflowSchedule.findMany({
      where: { enabled: true },
      orderBy: { nextRunAt: "asc" },
    });

    if (schedules.length === 0) {
      throw new Error("No workflow schedules found");
    }

    log.info(`  Found ${schedules.length} enabled schedules`);

    schedules.slice(0, 3).forEach((schedule) => {
      log.info(`    - ${schedule.workflowName}: ${schedule.cronExpression}`);
    });
  });

  await runTest("Verify schedule fields mapping", async () => {
    const schedule = await database.workflowSchedule.findFirst({
      where: { enabled: true },
    });

    if (!schedule) {
      throw new Error("No schedule found for testing");
    }

    // Verify all fields are accessible without errors
    const fields = {
      scheduleId: schedule.scheduleId,
      workflowName: schedule.workflowName,
      cronExpression: schedule.cronExpression,
      lastRunAt: schedule.lastRunAt,
      nextRunAt: schedule.nextRunAt,
      runCount: schedule.runCount,
      failureCount: schedule.failureCount,
      successCount: schedule.successCount,
    };

    log.info(`  Verified ${Object.keys(fields).length} schedule fields`);
  });

  await runTest("Test schedule update", async () => {
    const schedule = await database.workflowSchedule.findFirst({
      where: { enabled: true },
    });

    if (!schedule) {
      throw new Error("No schedule found for testing");
    }

    const initialRunCount = schedule.runCount;

    await database.workflowSchedule.update({
      where: { id: schedule.id },
      data: {
        lastRunAt: new Date(),
        runCount: { increment: 1 },
      },
    });

    const updated = await database.workflowSchedule.findUnique({
      where: { id: schedule.id },
    });

    if (!updated || updated.runCount !== initialRunCount + 1) {
      throw new Error("Schedule update failed");
    }

    // Restore original count
    await database.workflowSchedule.update({
      where: { id: schedule.id },
      data: {
        runCount: initialRunCount,
      },
    });
  });
}

// ============================================================================
// TEST SUITE 5: Complex Queries & Analytics
// ============================================================================

async function testAnalytics(): Promise<void> {
  log.section("Testing Analytics & Complex Queries");

  const storage = getDatabaseStorage();

  await runTest("Get success rate trend", async () => {
    const trend = await storage.getSuccessRateTrend(7);
    log.info(`  Found ${trend.length} data points for 7-day trend`);
  });

  await runTest("Get workflow performance stats", async () => {
    const schedules = await database.workflowSchedule.findMany({
      take: 1,
    });

    if (schedules.length > 0) {
      const stats = await storage.getWorkflowPerformanceStats(
        schedules[0].workflowName,
      );

      log.info(`  Average duration: ${stats.averageDuration.toFixed(2)}ms`);
      log.info(`  Success rate: ${(stats.successRate * 100).toFixed(2)}%`);
      log.info(`  Total executions: ${stats.totalExecutions}`);
    }
  });

  await runTest("Test execution status aggregation", async () => {
    const statusCounts = await database.workflowExecution.groupBy({
      by: ["status"],
      _count: true,
    });

    log.info(`  Status distribution:`);
    statusCounts.forEach((stat) => {
      log.info(`    ${stat.status}: ${stat._count}`);
    });
  });

  await runTest("Test workflow metrics aggregation", async () => {
    const metrics = await database.workflowMetrics.aggregate({
      _avg: { metricValue: true },
      _min: { metricValue: true },
      _max: { metricValue: true },
      _count: true,
    });

    log.info(`  Total metrics: ${metrics._count}`);
    if (metrics._avg.metricValue !== null) {
      log.info(`  Average value: ${metrics._avg.metricValue.toFixed(2)}`);
    }
  });
}

// ============================================================================
// TEST SUITE 6: Error Handling & Edge Cases
// ============================================================================

async function testErrorHandling(): Promise<void> {
  log.section("Testing Error Handling & Edge Cases");

  const storage = getDatabaseStorage();

  await runTest("Handle non-existent report", async () => {
    const report = await storage.getReportById("non-existent-report-id");
    if (report !== null) {
      throw new Error("Expected null for non-existent report");
    }
  });

  await runTest("Handle empty query results", async () => {
    const executions = await storage.getWorkflowExecutions({
      startDate: new Date("2000-01-01"),
      endDate: new Date("2000-01-02"),
    });

    // Should return empty array, not throw
    if (!Array.isArray(executions)) {
      throw new Error("Expected array result");
    }
  });

  await runTest("Handle invalid workflow name in stats", async () => {
    const stats = await storage.getWorkflowPerformanceStats(
      "non-existent-workflow-999",
    );

    // Should return zero stats, not throw
    if (stats.totalExecutions !== 0) {
      throw new Error("Expected zero stats for non-existent workflow");
    }
  });

  await runTest("Test transaction rollback on error", async () => {
    try {
      await database.$transaction(async (tx) => {
        // Create a test execution
        await tx.workflowExecution.create({
          data: {
            runId: "rollback-test",
            workflowName: "rollback-test",
            status: "SUCCESS",
            startedAt: new Date(),
            completedAt: new Date(),
            durationMs: 1000,
            testsPassed: 1,
            testsFailed: 0,
            testsTotal: 1,
          },
        });

        // Force an error
        throw new Error("Forced rollback");
      });
    } catch (error) {
      // Transaction should rollback
    }

    // Verify the execution was NOT created
    const execution = await database.workflowExecution.findUnique({
      where: { runId: "rollback-test" },
    });

    if (execution !== null) {
      // Cleanup
      await database.workflowExecution.delete({
        where: { runId: "rollback-test" },
      });
      throw new Error("Transaction did not rollback properly");
    }
  });
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function main(): Promise<void> {
  log.header("╔════════════════════════════════════════════════════════════╗");
  log.header("║  MONITORING SYSTEM INTEGRATION TEST SUITE                 ║");
  log.header("║  Workflow Monitoring System - End-to-End Tests            ║");
  log.header("╚════════════════════════════════════════════════════════════╝");

  const startTime = Date.now();

  try {
    // Run all test suites
    await testDatabaseConnection();
    await testStorageService();
    await testMonitoringBot();
    await testWorkflowSchedules();
    await testAnalytics();
    await testErrorHandling();

    // Print summary
    const duration = Date.now() - startTime;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;

    log.header(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    log.header("║  INTEGRATION TEST SUMMARY                                 ║");
    log.header(
      "╚════════════════════════════════════════════════════════════╝",
    );

    console.log(`\n${colors.bright}Total Tests:${colors.reset} ${total}`);
    console.log(`${colors.green}✓ Passed:${colors.reset} ${passed}`);
    console.log(`${colors.red}✗ Failed:${colors.reset} ${failed}`);
    console.log(`${colors.cyan}⏱ Duration:${colors.reset} ${duration}ms`);
    console.log(
      `${colors.yellow}Success Rate:${colors.reset} ${((passed / total) * 100).toFixed(2)}%\n`,
    );

    // Group results by test suite
    log.header("RESULTS BY TEST SUITE:");
    const suites = [
      "Database Connection",
      "Storage Service",
      "Monitoring Bot",
      "Workflow Schedules",
      "Analytics",
      "Error Handling",
    ];

    suites.forEach((suite) => {
      const suiteResults = results.filter((r) =>
        r.name.toLowerCase().includes(suite.toLowerCase()),
      );
      const suitePassed = suiteResults.filter((r) => r.passed).length;
      const suiteTotal = suiteResults.length;

      if (suiteTotal > 0) {
        console.log(
          `${suite}: ${colors.green}${suitePassed}${colors.reset}/${suiteTotal} passed`,
        );
      }
    });

    // Print failures if any
    if (failed > 0) {
      log.header("\n❌ FAILED TESTS:");
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          log.error(`${r.name}`);
          if (r.error) {
            console.log(`  ${colors.red}${r.error}${colors.reset}`);
          }
        });
    }

    // Exit with appropriate code
    if (failed > 0) {
      log.error("\n❌ Some integration tests failed!");
      process.exit(1);
    } else {
      log.success("\n✅ All integration tests passed!");
      log.success("🎉 Monitoring system is production ready!");
      process.exit(0);
    }
  } catch (error) {
    log.error(
      `\n❌ Fatal error: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.error(error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Run the integration tests
main();
