#!/usr/bin/env tsx
/**
 * ============================================================================
 * DATABASE PERSISTENCE TEST SCRIPT
 * Farmers Market Platform - Workflow Monitoring System
 * ============================================================================
 *
 * Purpose: Verify Prisma schema mapping and database persistence
 * Tests: CRUD operations for all monitoring tables
 * Usage: npm run test:db-persistence
 *
 * ============================================================================
 */

import { database } from "../src/lib/database";

// ANSI color codes for output
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
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg: string) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  section: (msg: string) => console.log(`\n${colors.magenta}▶${colors.reset} ${msg}`),
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
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
// TEST SUITE: Monitoring Reports
// ============================================================================

async function testMonitoringReports(): Promise<void> {
  log.section("Testing MonitoringReport CRUD Operations");

  // CREATE
  await runTest("Create MonitoringReport", async () => {
    const report = await database.monitoringReport.create({
      data: {
        reportId: `test-report-${Date.now()}`,
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        endTime: new Date(),
        totalRuns: 10,
        successfulRuns: 8,
        failedRuns: 2,
        totalDurationMs: 50000,
        avgDurationMs: 5000,
        successRate: 0.8,
        status: "COMPLETED",
        reportType: "PERIODIC",
        generatedAt: new Date(),
        notified: false,
        metadata: {
          environment: "test",
          generatedBy: "test-script",
        },
      },
    });

    if (!report.id || !report.reportId) {
      throw new Error("Report not created properly");
    }
  });

  // READ
  await runTest("Read MonitoringReport", async () => {
    const reports = await database.monitoringReport.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    if (reports.length === 0) {
      throw new Error("No reports found");
    }
  });

  // UPDATE
  await runTest("Update MonitoringReport", async () => {
    const report = await database.monitoringReport.findFirst({
      where: { status: "COMPLETED" },
    });

    if (!report) {
      throw new Error("No report to update");
    }

    const updated = await database.monitoringReport.update({
      where: { id: report.id },
      data: {
        notified: true,
        notifiedAt: new Date(),
      },
    });

    if (!updated.notified || !updated.notifiedAt) {
      throw new Error("Report not updated properly");
    }
  });

  // DELETE (cleanup)
  await runTest("Delete test MonitoringReport", async () => {
    const testReports = await database.monitoringReport.findMany({
      where: { reportId: { startsWith: "test-report-" } },
    });

    if (testReports.length > 0) {
      await database.monitoringReport.deleteMany({
        where: { reportId: { startsWith: "test-report-" } },
      });
    }
  });
}

// ============================================================================
// TEST SUITE: Workflow Executions
// ============================================================================

async function testWorkflowExecutions(): Promise<void> {
  log.section("Testing WorkflowExecution CRUD Operations");

  // CREATE
  await runTest("Create WorkflowExecution", async () => {
    const execution = await database.workflowExecution.create({
      data: {
        runId: `test-run-${Date.now()}`,
        workflowName: "health-check",
        status: "SUCCESS",
        startedAt: new Date(Date.now() - 5000),
        completedAt: new Date(),
        durationMs: 5000,
        testsPassed: 5,
        testsFailed: 0,
        testsTotal: 5,
        triggeredBy: "SCHEDULED",
        environment: "test",
        metadata: {
          testRun: true,
          automated: true,
        },
      },
    });

    if (!execution.id || !execution.runId) {
      throw new Error("Execution not created properly");
    }
  });

  // READ with relations
  await runTest("Read WorkflowExecution with relations", async () => {
    const executions = await database.workflowExecution.findMany({
      take: 5,
      orderBy: { startedAt: "desc" },
      include: {
        report: true,
        workflowMetrics: true,
        systemHealthChecks: true,
        notificationLogs: true,
      },
    });

    if (executions.length === 0) {
      throw new Error("No executions found");
    }
  });

  // UPDATE
  await runTest("Update WorkflowExecution", async () => {
    const execution = await database.workflowExecution.findFirst({
      where: { status: "SUCCESS" },
    });

    if (!execution) {
      throw new Error("No execution to update");
    }

    const updated = await database.workflowExecution.update({
      where: { id: execution.id },
      data: {
        metadata: {
          ...(execution.metadata as any),
          updated: true,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    if (!updated.metadata) {
      throw new Error("Execution not updated properly");
    }
  });

  // Query by status
  await runTest("Query WorkflowExecution by status", async () => {
    const successCount = await database.workflowExecution.count({
      where: { status: "SUCCESS" },
    });

    const failureCount = await database.workflowExecution.count({
      where: { status: "FAILURE" },
    });

    log.info(`  Found ${successCount} successful and ${failureCount} failed executions`);
  });

  // DELETE (cleanup)
  await runTest("Delete test WorkflowExecution", async () => {
    await database.workflowExecution.deleteMany({
      where: { runId: { startsWith: "test-run-" } },
    });
  });
}

// ============================================================================
// TEST SUITE: Workflow Metrics
// ============================================================================

async function testWorkflowMetrics(): Promise<void> {
  log.section("Testing WorkflowMetrics CRUD Operations");

  // First, create an execution to link metrics to
  let testExecutionRunId: string;

  await runTest("Create WorkflowExecution for metrics", async () => {
    const execution = await database.workflowExecution.create({
      data: {
        runId: `test-metrics-run-${Date.now()}`,
        workflowName: "performance-test",
        status: "SUCCESS",
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 1000,
        testsPassed: 1,
        testsFailed: 0,
        testsTotal: 1,
      },
    });
    testExecutionRunId = execution.runId;
  });

  // CREATE
  await runTest("Create WorkflowMetrics", async () => {
    const metric = await database.workflowMetrics.create({
      data: {
        workflowId: "performance-test",
        metricName: "response_time",
        metricValue: 250.5,
        metricUnit: "ms",
        thresholdValue: 500,
        isWithinThreshold: true,
        recordedAt: new Date(),
        executionId: testExecutionRunId,
        metadata: {
          test: true,
        },
      },
    });

    if (!metric.id) {
      throw new Error("Metric not created properly");
    }
  });

  // READ
  await runTest("Read WorkflowMetrics", async () => {
    const metrics = await database.workflowMetrics.findMany({
      where: { workflowId: "performance-test" },
      orderBy: { recordedAt: "desc" },
      take: 10,
    });

    if (metrics.length === 0) {
      throw new Error("No metrics found");
    }
  });

  // Query metrics by threshold violation
  await runTest("Query metrics exceeding threshold", async () => {
    const violatedMetrics = await database.workflowMetrics.findMany({
      where: { isWithinThreshold: false },
      take: 5,
    });

    log.info(`  Found ${violatedMetrics.length} metrics exceeding thresholds`);
  });

  // DELETE (cleanup)
  await runTest("Delete test WorkflowMetrics", async () => {
    await database.workflowMetrics.deleteMany({
      where: { workflowId: "performance-test" },
    });

    await database.workflowExecution.deleteMany({
      where: { runId: testExecutionRunId },
    });
  });
}

// ============================================================================
// TEST SUITE: System Health Checks
// ============================================================================

async function testSystemHealthChecks(): Promise<void> {
  log.section("Testing SystemHealthCheck CRUD Operations");

  // CREATE
  await runTest("Create SystemHealthCheck", async () => {
    const healthCheck = await database.systemHealthCheck.create({
      data: {
        checkId: `test-health-${Date.now()}`,
        checkName: "database-connection",
        status: "HEALTHY",
        responseTimeMs: 50,
        checkedAt: new Date(),
        endpoint: "postgres://localhost:5432",
        expectedStatus: 200,
        actualStatus: 200,
        details: {
          connectionPool: "active",
          activeConnections: 5,
        },
        metadata: {
          test: true,
        },
      },
    });

    if (!healthCheck.id || !healthCheck.checkId) {
      throw new Error("Health check not created properly");
    }
  });

  // READ
  await runTest("Read SystemHealthCheck", async () => {
    const healthChecks = await database.systemHealthCheck.findMany({
      take: 5,
      orderBy: { checkedAt: "desc" },
    });

    if (healthChecks.length === 0) {
      throw new Error("No health checks found");
    }
  });

  // Query by status
  await runTest("Query SystemHealthCheck by status", async () => {
    const healthyCount = await database.systemHealthCheck.count({
      where: { status: "HEALTHY" },
    });

    const unhealthyCount = await database.systemHealthCheck.count({
      where: { status: "UNHEALTHY" },
    });

    log.info(`  Found ${healthyCount} healthy and ${unhealthyCount} unhealthy checks`);
  });

  // DELETE (cleanup)
  await runTest("Delete test SystemHealthCheck", async () => {
    await database.systemHealthCheck.deleteMany({
      where: { checkId: { startsWith: "test-health-" } },
    });
  });
}

// ============================================================================
// TEST SUITE: Notification Logs
// ============================================================================

async function testNotificationLogs(): Promise<void> {
  log.section("Testing NotificationLog CRUD Operations");

  // CREATE
  await runTest("Create NotificationLog", async () => {
    const notification = await database.notificationLog.create({
      data: {
        logId: `test-notif-${Date.now()}`,
        channel: "SLACK",
        notificationType: "WORKFLOW_FAILURE",
        status: "SENT",
        recipient: "#monitoring",
        subject: "Workflow Failed",
        message: "Test notification message",
        sentAt: new Date(),
        deliveryStatus: "DELIVERED",
        retryCount: 0,
        metadata: {
          test: true,
        },
      },
    });

    if (!notification.id || !notification.logId) {
      throw new Error("Notification log not created properly");
    }
  });

  // READ
  await runTest("Read NotificationLog", async () => {
    const notifications = await database.notificationLog.findMany({
      take: 5,
      orderBy: { sentAt: "desc" },
    });

    if (notifications.length === 0) {
      throw new Error("No notification logs found");
    }
  });

  // Query by channel
  await runTest("Query NotificationLog by channel", async () => {
    const slackNotifications = await database.notificationLog.count({
      where: { channel: "SLACK" },
    });

    log.info(`  Found ${slackNotifications} Slack notifications`);
  });

  // DELETE (cleanup)
  await runTest("Delete test NotificationLog", async () => {
    await database.notificationLog.deleteMany({
      where: { logId: { startsWith: "test-notif-" } },
    });
  });
}

// ============================================================================
// TEST SUITE: Workflow Schedules
// ============================================================================

async function testWorkflowSchedules(): Promise<void> {
  log.section("Testing WorkflowSchedule CRUD Operations");

  // CREATE
  await runTest("Create WorkflowSchedule", async () => {
    const schedule = await database.workflowSchedule.create({
      data: {
        scheduleId: `test-schedule-${Date.now()}`,
        workflowName: "test-workflow",
        cronExpression: "*/5 * * * *",
        enabled: true,
        runCount: 0,
        failureCount: 0,
        successCount: 0,
        description: "Test schedule",
        metadata: {
          test: true,
        },
      },
    });

    if (!schedule.id || !schedule.scheduleId) {
      throw new Error("Schedule not created properly");
    }
  });

  // READ
  await runTest("Read WorkflowSchedule", async () => {
    const schedules = await database.workflowSchedule.findMany({
      where: { enabled: true },
      orderBy: { createdAt: "desc" },
    });

    if (schedules.length === 0) {
      throw new Error("No schedules found");
    }
  });

  // UPDATE
  await runTest("Update WorkflowSchedule", async () => {
    const schedule = await database.workflowSchedule.findFirst({
      where: { scheduleId: { startsWith: "test-schedule-" } },
    });

    if (!schedule) {
      throw new Error("No schedule to update");
    }

    const updated = await database.workflowSchedule.update({
      where: { id: schedule.id },
      data: {
        lastRunAt: new Date(),
        runCount: { increment: 1 },
        successCount: { increment: 1 },
      },
    });

    if (updated.runCount !== 1) {
      throw new Error("Schedule not updated properly");
    }
  });

  // Query enabled schedules
  await runTest("Query enabled WorkflowSchedules", async () => {
    const enabledCount = await database.workflowSchedule.count({
      where: { enabled: true },
    });

    log.info(`  Found ${enabledCount} enabled schedules`);
  });

  // DELETE (cleanup)
  await runTest("Delete test WorkflowSchedule", async () => {
    await database.workflowSchedule.deleteMany({
      where: { scheduleId: { startsWith: "test-schedule-" } },
    });
  });
}

// ============================================================================
// TEST SUITE: Complex Queries
// ============================================================================

async function testComplexQueries(): Promise<void> {
  log.section("Testing Complex Queries");

  await runTest("Query workflow execution statistics", async () => {
    const stats = await database.workflowExecution.groupBy({
      by: ["status"],
      _count: true,
    });

    log.info(`  Status distribution: ${JSON.stringify(stats)}`);
  });

  await runTest("Query average execution duration", async () => {
    const avgDuration = await database.workflowExecution.aggregate({
      _avg: { durationMs: true },
      where: { durationMs: { not: null } },
    });

    log.info(`  Average duration: ${avgDuration._avg.durationMs?.toFixed(2)}ms`);
  });

  await runTest("Query metrics with execution details", async () => {
    const metricsWithExecution = await database.workflowMetrics.findMany({
      take: 5,
      include: {
        execution: {
          select: {
            runId: true,
            workflowName: true,
            status: true,
            startedAt: true,
          },
        },
      },
    });

    log.info(`  Found ${metricsWithExecution.length} metrics with execution details`);
  });

  await runTest("Query recent workflow activity", async () => {
    const recentActivity = await database.workflowExecution.findMany({
      where: {
        startedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { startedAt: "desc" },
      take: 10,
      select: {
        runId: true,
        workflowName: true,
        status: true,
        startedAt: true,
        durationMs: true,
      },
    });

    log.info(`  Found ${recentActivity.length} recent executions in last 24 hours`);
  });
}

// ============================================================================
// TEST SUITE: Transaction Handling
// ============================================================================

async function testTransactions(): Promise<void> {
  log.section("Testing Transaction Handling");

  await runTest("Create execution with metrics (transaction)", async () => {
    const result = await database.$transaction(async (tx) => {
      const execution = await tx.workflowExecution.create({
        data: {
          runId: `test-txn-${Date.now()}`,
          workflowName: "transaction-test",
          status: "SUCCESS",
          startedAt: new Date(),
          completedAt: new Date(),
          durationMs: 1000,
          testsPassed: 1,
          testsFailed: 0,
          testsTotal: 1,
        },
      });

      const metric = await tx.workflowMetrics.create({
        data: {
          workflowId: "transaction-test",
          metricName: "test_metric",
          metricValue: 100,
          executionId: execution.runId,
        },
      });

      return { execution, metric };
    });

    if (!result.execution.id || !result.metric.id) {
      throw new Error("Transaction failed");
    }

    // Cleanup
    await database.workflowMetrics.delete({ where: { id: result.metric.id } });
    await database.workflowExecution.delete({ where: { id: result.execution.id } });
  });
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function main(): Promise<void> {
  log.header("╔════════════════════════════════════════════════════════════╗");
  log.header("║  DATABASE PERSISTENCE TEST SUITE                          ║");
  log.header("║  Workflow Monitoring System                               ║");
  log.header("╚════════════════════════════════════════════════════════════╝");

  const startTime = Date.now();

  try {
    // Test database connection
    log.section("Testing Database Connection");
    await runTest("Database connection", async () => {
      await database.$queryRaw`SELECT 1 as connected`;
    });

    // Run all test suites
    await testMonitoringReports();
    await testWorkflowExecutions();
    await testWorkflowMetrics();
    await testSystemHealthChecks();
    await testNotificationLogs();
    await testWorkflowSchedules();
    await testComplexQueries();
    await testTransactions();

    // Print summary
    const duration = Date.now() - startTime;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;

    log.header("\n╔════════════════════════════════════════════════════════════╗");
    log.header("║  TEST SUMMARY                                             ║");
    log.header("╚════════════════════════════════════════════════════════════╝");

    console.log(`\n${colors.bright}Total Tests:${colors.reset} ${total}`);
    console.log(`${colors.green}✓ Passed:${colors.reset} ${passed}`);
    console.log(`${colors.red}✗ Failed:${colors.reset} ${failed}`);
    console.log(`${colors.cyan}⏱ Duration:${colors.reset} ${duration}ms`);
    console.log(`${colors.yellow}Success Rate:${colors.reset} ${((passed / total) * 100).toFixed(2)}%\n`);

    // Print failures if any
    if (failed > 0) {
      log.header("FAILED TESTS:");
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
      log.error("\n❌ Some tests failed!");
      process.exit(1);
    } else {
      log.success("\n✅ All tests passed!");
      process.exit(0);
    }
  } catch (error) {
    log.error(`\n❌ Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Run the tests
main();
