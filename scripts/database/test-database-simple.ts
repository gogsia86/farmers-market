#!/usr/bin/env tsx

/**
 * 🗄️ Simple Database Test Script
 * Tests PostgreSQL connection and monitoring tables directly with Prisma
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/farmersmarket",
    },
  },
});

async function testDatabase() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🗄️  SIMPLE DATABASE TEST                                 ║");
  console.log("║  Farmers Market Platform - Direct Prisma Test            ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    // Test 1: Database connection
    console.log("1️⃣  Testing database connection...");
    await prisma.$connect();
    console.log("   ✅ Connected to database successfully!\n");

    // Test 2: Check if monitoring tables exist
    console.log("2️⃣  Checking monitoring tables...");
    const tableCheck = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables
      WHERE schemaname='public'
      AND tablename IN ('monitoring_reports', 'workflow_executions', 'workflow_metrics', 'system_health_checks', 'notification_logs', 'workflow_schedules')
      ORDER BY tablename;
    `;
    console.log(`   ✅ Found ${tableCheck.length} monitoring tables:`);
    tableCheck.forEach(t => console.log(`      - ${t.tablename}`));
    console.log();

    // Test 3: Create a test monitoring report
    console.log("3️⃣  Creating test monitoring report...");
    const testReport = await prisma.monitoringReport.create({
      data: {
        reportId: `test-${Date.now()}`,
        timestamp: new Date(),
        periodStart: new Date(Date.now() - 3600000),
        periodEnd: new Date(),
        totalWorkflows: 5,
        passedWorkflows: 4,
        failedWorkflows: 1,
        warningWorkflows: 0,
        skippedWorkflows: 0,
        successRate: 80.0,
        averageDuration: 5000.0,
        criticalIssues: 1,
        successRateTrend: 0.0,
        performanceTrend: 0.0,
        errorRateTrend: 0.0,
        recommendations: ["Test recommendation 1", "Test recommendation 2"],
        agricultureInsights: {
          season: "SPRING",
          consciousness: "DIVINE",
          biodynamic: true,
        },
      },
    });
    console.log("   ✅ Report created successfully!");
    console.log(`   📝 Report ID: ${testReport.reportId}`);
    console.log(`   ✅ Success Rate: ${testReport.successRate}%\n`);

    // Test 4: Create test workflow execution
    console.log("4️⃣  Creating test workflow execution...");
    const testExecution = await prisma.workflowExecution.create({
      data: {
        runId: `run-${Date.now()}`,
        workflowId: "health-check",
        name: "System Health Check",
        type: "HEALTH_CHECK",
        priority: "CRITICAL",
        status: "PASSED",
        startTime: new Date(Date.now() - 5000),
        endTime: new Date(),
        duration: 5000,
        totalSteps: 5,
        passedSteps: 5,
        failedSteps: 0,
        skippedSteps: 0,
        error: null,
        metrics: {
          responseTime: 125,
          memoryUsage: 45.2,
          cpuUsage: 12.5,
        },
        screenshots: [],
        traces: [],
        tags: ["health", "critical"],
        agricultureData: {
          season: "SPRING",
          soilHealth: "excellent",
        },
        reportId: testReport.reportId,
      },
    });
    console.log("   ✅ Workflow execution created!");
    console.log(`   🔄 Run ID: ${testExecution.runId}`);
    console.log(`   ✅ Status: ${testExecution.status}\n`);

    // Test 5: Query recent reports
    console.log("5️⃣  Querying recent reports...");
    const recentReports = await prisma.monitoringReport.findMany({
      take: 5,
      orderBy: { timestamp: "desc" },
      include: {
        workflowExecutions: {
          take: 3,
        },
      },
    });
    console.log(`   ✅ Found ${recentReports.length} recent reports`);
    if (recentReports.length > 0) {
      console.log(`   📅 Latest: ${recentReports[0].timestamp.toLocaleString()}`);
      console.log(`   📊 Workflows: ${recentReports[0].workflowExecutions.length} executions\n`);
    }

    // Test 6: Query workflow schedules
    console.log("6️⃣  Checking workflow schedules...");
    const schedules = await prisma.workflowSchedule.findMany({
      where: { enabled: true },
      orderBy: { workflowName: "asc" },
    });
    console.log(`   ✅ Found ${schedules.length} active schedules:`);
    schedules.forEach(s => {
      console.log(`      - ${s.workflowName}: ${s.cronExpression}`);
    });
    console.log();

    // Test 7: Count statistics
    console.log("7️⃣  Collecting statistics...");
    const [reportCount, executionCount, metricCount] = await Promise.all([
      prisma.monitoringReport.count(),
      prisma.workflowExecution.count(),
      prisma.workflowMetric.count(),
    ]);
    console.log(`   📊 Total Reports: ${reportCount}`);
    console.log(`   🔄 Total Executions: ${executionCount}`);
    console.log(`   📈 Total Metrics: ${metricCount}\n`);

    // Test 8: Cleanup test data
    console.log("8️⃣  Cleaning up test data...");
    await prisma.workflowExecution.delete({
      where: { runId: testExecution.runId },
    });
    await prisma.monitoringReport.delete({
      where: { reportId: testReport.reportId },
    });
    console.log("   ✅ Test data cleaned up\n");

    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║  ✅ ALL DATABASE TESTS PASSED                             ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log("📊 Summary:");
    console.log("   ✅ Database connection: Working");
    console.log("   ✅ Monitoring tables: Present");
    console.log("   ✅ CRUD operations: Working");
    console.log("   ✅ Relations: Working");
    console.log("   ✅ Queries: Working");
    console.log("\n💡 Database is ready for monitoring system!\n");

  } catch (error) {
    console.error("╔════════════════════════════════════════════════════════════╗");
    console.error("║  ❌ DATABASE TEST FAILED                                  ║");
    console.error("╚════════════════════════════════════════════════════════════╝\n");

    console.error("Error details:");
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      if (error.stack) {
        console.error(`   Stack: ${error.stack.split("\n").slice(0, 5).join("\n")}\n`);
      }
    } else {
      console.error(`   ${String(error)}\n`);
    }

    console.error("💡 Troubleshooting:");
    console.error("   1. Ensure DATABASE_URL is set correctly");
    console.error("   2. Check if database is running: docker-compose ps db");
    console.error("   3. Verify tables exist: docker-compose exec db psql -U postgres -d farmersmarket -c '\\dt'");
    console.error("   4. Run migration: docker-compose exec -T db psql -U postgres -d farmersmarket < database/init/002_monitoring_tables.sql\n");

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabase().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
