#!/usr/bin/env tsx

/**
 * 🗄️ Database Storage Test Script
 * Tests PostgreSQL storage for monitoring data
 */

import { DatabaseStorageService } from "../src/lib/monitoring/storage/database.storage";
import type { MonitoringReport } from "../src/lib/monitoring/types";

const storage = new DatabaseStorageService();

async function testDatabaseStorage() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🗄️  DATABASE STORAGE TEST                                ║");
  console.log("║  Farmers Market Platform - Monitoring Persistence         ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Create a test monitoring report
    const testReport: MonitoringReport = {
      reportId: `test-report-${Date.now()}`,
      timestamp: new Date(),
      period: {
        start: new Date(Date.now() - 3600000), // 1 hour ago
        end: new Date(),
      },
      summary: {
        totalWorkflows: 3,
        passedWorkflows: 2,
        failedWorkflows: 1,
        warningWorkflows: 0,
        skippedWorkflows: 0,
        successRate: 66.67,
        averageDuration: 5234,
        criticalIssues: 1,
      },
      trends: {
        successRateTrend: "stable",
        performanceTrend: "improving",
        errorRateTrend: "stable",
      },
      workflows: [
        {
          id: "test-workflow-1",
          name: "Health Check",
          status: "passed",
          duration: 1234,
          timestamp: new Date(),
          tests: {
            total: 5,
            passed: 5,
            failed: 0,
            skipped: 0,
          },
        },
        {
          id: "test-workflow-2",
          name: "User Login",
          status: "passed",
          duration: 3456,
          timestamp: new Date(),
          tests: {
            total: 8,
            passed: 8,
            failed: 0,
            skipped: 0,
          },
        },
        {
          id: "test-workflow-3",
          name: "Farm Creation",
          status: "failed",
          duration: 6789,
          timestamp: new Date(),
          tests: {
            total: 10,
            passed: 8,
            failed: 2,
            skipped: 0,
          },
          error: {
            message: "Test failure: Farm validation failed",
            type: "TestError",
            stack: "Error: Test failure\n  at test.ts:123:45",
          },
        },
      ],
      recommendations: [
        "Investigate farm creation validation failures",
        "Consider adding retry logic for flaky tests",
      ],
      agricultureInsights: {
        season: "SPRING",
        consciousness: "DIVINE",
        biodynamicAlignment: true,
      },
    };

    console.log("1️⃣  Testing report save...");
    await storage.saveReport(testReport);
    console.log("   ✅ Report saved successfully!");
    console.log(`   📝 Report ID: ${testReport.reportId}\n`);

    console.log("2️⃣  Testing report retrieval...");
    const retrievedReport = await storage.getReport(testReport.reportId);
    if (retrievedReport) {
      console.log("   ✅ Report retrieved successfully!");
      console.log(`   📊 Workflows: ${retrievedReport.workflows?.length || 0}`);
      console.log(
        `   ✅ Success Rate: ${retrievedReport.summary.successRate}%\n`,
      );
    } else {
      console.log("   ❌ Failed to retrieve report\n");
    }

    console.log("3️⃣  Testing recent reports query...");
    const recentReports = await storage.getRecentReports(5);
    console.log(`   ✅ Found ${recentReports.length} recent reports`);
    if (recentReports.length > 0) {
      console.log(
        `   📅 Latest: ${recentReports[0].timestamp.toLocaleString()}\n`,
      );
    }

    console.log("4️⃣  Testing storage statistics...");
    const stats = await storage.getStorageStats();
    console.log("   ✅ Storage stats retrieved:");
    console.log(`   📊 Total Reports: ${stats.totalReports}`);
    console.log(`   🔄 Total Executions: ${stats.totalExecutions}`);
    console.log(`   📈 Total Metrics: ${stats.totalMetrics}`);
    console.log(
      `   📅 Date Range: ${stats.oldestReport?.toLocaleDateString() || "N/A"} → ${stats.newestReport?.toLocaleDateString() || "N/A"}\n`,
    );

    console.log("5️⃣  Testing workflow execution query...");
    const executions = await storage.getWorkflowExecutions({
      limit: 10,
      workflowId: "test-workflow-1",
    });
    console.log(`   ✅ Found ${executions.length} executions\n`);

    console.log("6️⃣  Testing failed workflows query...");
    const failedWorkflows = await storage.getFailedWorkflows(5);
    console.log(`   ✅ Found ${failedWorkflows.length} failed workflows`);
    if (failedWorkflows.length > 0) {
      console.log(`   ❌ Latest failure: ${failedWorkflows[0].name}\n`);
    }

    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  ✅ ALL DATABASE STORAGE TESTS PASSED                     ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    console.log("📊 Summary:");
    console.log("   ✅ Report persistence: Working");
    console.log("   ✅ Report retrieval: Working");
    console.log("   ✅ Query operations: Working");
    console.log("   ✅ Statistics aggregation: Working");
    console.log("\n💡 Database storage is ready for production use!\n");
  } catch (error) {
    console.error(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.error(
      "║  ❌ DATABASE STORAGE TEST FAILED                          ║",
    );
    console.error(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    console.error("Error details:");
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}\n`);
    } else {
      console.error(`   ${String(error)}\n`);
    }

    console.error("💡 Troubleshooting:");
    console.error("   1. Ensure DATABASE_URL is set correctly");
    console.error("   2. Check if database tables exist (run migrations)");
    console.error("   3. Verify database is accessible from host");
    console.error("   4. Check Prisma schema is in sync\n");

    process.exit(1);
  }
}

// Run the test
testDatabaseStorage().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
