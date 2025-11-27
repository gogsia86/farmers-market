#!/usr/bin/env tsx

/**
 * 🌟 Daemon Status Checker
 * Farmers Market Platform - Monitoring Daemon Health Check
 * Version: 1.0.0
 *
 * Checks the health and status of the monitoring daemon
 */

import { database } from "../src/lib/database";

interface DaemonStatus {
  isHealthy: boolean;
  checks: {
    database: boolean;
    recentActivity: boolean;
    scheduledWorkflows: boolean;
    healthChecks: boolean;
  };
  stats: {
    totalExecutions: number;
    recentExecutions: number;
    totalHealthChecks: number;
    recentHealthChecks: number;
    lastExecution?: Date;
    lastHealthCheck?: Date;
  };
  warnings: string[];
  errors: string[];
}

async function checkDaemonStatus(): Promise<DaemonStatus> {
  const status: DaemonStatus = {
    isHealthy: true,
    checks: {
      database: false,
      recentActivity: false,
      scheduledWorkflows: false,
      healthChecks: false,
    },
    stats: {
      totalExecutions: 0,
      recentExecutions: 0,
      totalHealthChecks: 0,
      recentHealthChecks: 0,
    },
    warnings: [],
    errors: [],
  };

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🌾 DAEMON STATUS CHECK                                   ║");
  console.log("║  Farmers Market Platform - Monitoring Health             ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Check 1: Database Connection
    console.log("🔍 Checking database connection...");
    try {
      await database.$queryRaw`SELECT 1`;
      status.checks.database = true;
      console.log("   ✅ Database connection OK\n");
    } catch (error) {
      status.checks.database = false;
      status.isHealthy = false;
      status.errors.push("Database connection failed");
      console.log("   ❌ Database connection FAILED\n");
      console.error("   Error:", error);
      return status;
    }

    // Check 2: Workflow Executions
    console.log("🔍 Checking workflow executions...");
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const [totalExecutions, recentExecutions, lastExecution] =
      await Promise.all([
        database.workflowExecution.count(),
        database.workflowExecution.count({
          where: {
            startedAt: {
              gte: tenMinutesAgo,
            },
          },
        }),
        database.workflowExecution.findFirst({
          orderBy: {
            startedAt: "desc",
          },
          select: {
            startedAt: true,
            workflowName: true,
            status: true,
          },
        }),
      ]);

    status.stats.totalExecutions = totalExecutions;
    status.stats.recentExecutions = recentExecutions;
    status.stats.lastExecution = lastExecution?.startedAt;

    console.log(`   📊 Total executions: ${totalExecutions}`);
    console.log(`   📊 Recent executions (10m): ${recentExecutions}`);

    if (lastExecution) {
      console.log(
        `   📊 Last execution: ${lastExecution.startedAt.toLocaleString()}`,
      );
      console.log(`   📊 Last workflow: ${lastExecution.workflowName}`);
      console.log(`   📊 Last status: ${lastExecution.status}`);
    }

    if (recentExecutions > 0) {
      status.checks.recentActivity = true;
      console.log("   ✅ Recent workflow activity detected\n");
    } else {
      if (totalExecutions > 0) {
        status.warnings.push("No workflow executions in the last 10 minutes");
        console.log("   ⚠️  No recent workflow activity (but has history)\n");
      } else {
        status.warnings.push("No workflow executions yet");
        console.log("   ⚠️  No workflow executions yet\n");
      }
    }

    // Check 3: Health Checks
    console.log("🔍 Checking health checks...");
    const [totalHealthChecks, recentHealthChecks, lastHealthCheck] =
      await Promise.all([
        database.systemHealthCheck.count(),
        database.systemHealthCheck.count({
          where: {
            createdAt: {
              gte: tenMinutesAgo,
            },
          },
        }),
        database.systemHealthCheck.findFirst({
          orderBy: {
            createdAt: "desc",
          },
          select: {
            createdAt: true,
            checkName: true,
            status: true,
            responseTimeMs: true,
          },
        }),
      ]);

    status.stats.totalHealthChecks = totalHealthChecks;
    status.stats.recentHealthChecks = recentHealthChecks;
    status.stats.lastHealthCheck = lastHealthCheck?.createdAt;

    console.log(`   📊 Total health checks: ${totalHealthChecks}`);
    console.log(`   📊 Recent health checks (10m): ${recentHealthChecks}`);

    if (lastHealthCheck) {
      console.log(
        `   📊 Last health check: ${lastHealthCheck.createdAt.toLocaleString()}`,
      );
      console.log(`   📊 Check name: ${lastHealthCheck.checkName}`);
      console.log(`   📊 Status: ${lastHealthCheck.status}`);
      console.log(`   📊 Response time: ${lastHealthCheck.responseTimeMs}ms`);
    }

    if (recentHealthChecks > 0) {
      status.checks.healthChecks = true;
      console.log("   ✅ Recent health checks detected\n");
    } else {
      if (totalHealthChecks > 0) {
        status.warnings.push("No health checks in the last 10 minutes");
        console.log("   ⚠️  No recent health checks (but has history)\n");
      } else {
        status.warnings.push("No health checks yet");
        console.log("   ⚠️  No health checks yet\n");
      }
    }

    // Check 4: Scheduled Workflows
    console.log("🔍 Checking scheduled workflows...");
    const scheduledWorkflows = await database.workflowSchedule.findMany({
      where: {
        enabled: true,
      },
      select: {
        workflowName: true,
        cronExpression: true,
        lastRunAt: true,
        nextRunAt: true,
        enabled: true,
        runCount: true,
        successCount: true,
        failureCount: true,
      },
    });

    console.log(`   📊 Enabled schedules: ${scheduledWorkflows.length}`);

    if (scheduledWorkflows.length > 0) {
      status.checks.scheduledWorkflows = true;
      console.log("   ✅ Scheduled workflows configured\n");

      console.log("   📋 Workflow Schedule:");
      scheduledWorkflows.forEach((workflow) => {
        console.log(
          `      - ${workflow.workflowName} (cron: ${workflow.cronExpression})`,
        );
        console.log(
          `        Runs: ${workflow.runCount} | Success: ${workflow.successCount} | Failed: ${workflow.failureCount}`,
        );
        if (workflow.lastRunAt) {
          console.log(
            `        Last run: ${workflow.lastRunAt.toLocaleString()}`,
          );
        }
        if (workflow.nextRunAt) {
          console.log(
            `        Next run: ${workflow.nextRunAt.toLocaleString()}`,
          );
        }
      });
      console.log();
    } else {
      status.warnings.push("No scheduled workflows enabled");
      console.log("   ⚠️  No scheduled workflows enabled\n");
    }

    // Overall Health Assessment
    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  📊 OVERALL STATUS                                        ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    // Determine overall health
    const criticalChecks = [status.checks.database];
    const healthChecks = [
      status.checks.recentActivity,
      status.checks.healthChecks,
      status.checks.scheduledWorkflows,
    ];

    const allCriticalPass = criticalChecks.every((check) => check === true);
    const healthyChecksCount = healthChecks.filter(
      (check) => check === true,
    ).length;

    if (!allCriticalPass) {
      status.isHealthy = false;
      console.log("🔴 CRITICAL: Daemon is NOT healthy");
      console.log(
        "   Critical systems failing. Daemon may not be running properly.\n",
      );
    } else if (healthyChecksCount === healthChecks.length) {
      status.isHealthy = true;
      console.log("🟢 HEALTHY: Daemon is fully operational");
      console.log("   All systems are functioning normally.\n");
    } else if (healthyChecksCount > 0) {
      status.isHealthy = true;
      console.log("🟡 DEGRADED: Daemon is partially operational");
      console.log(
        "   Some systems may be initializing or experiencing issues.\n",
      );
    } else {
      status.isHealthy = false;
      console.log("🔴 UNHEALTHY: Daemon appears to be inactive");
      console.log(
        "   Database is accessible but no daemon activity detected.\n",
      );
    }

    // Display warnings and errors
    if (status.warnings.length > 0) {
      console.log("⚠️  Warnings:");
      status.warnings.forEach((warning) => {
        console.log(`   - ${warning}`);
      });
      console.log();
    }

    if (status.errors.length > 0) {
      console.log("❌ Errors:");
      status.errors.forEach((error) => {
        console.log(`   - ${error}`);
      });
      console.log();
    }

    // Recommendations
    console.log("💡 Recommendations:");
    if (!status.checks.database) {
      console.log("   1. Check database connection and credentials");
      console.log("   2. Ensure Docker containers are running");
    } else if (!status.checks.recentActivity && !status.checks.healthChecks) {
      console.log("   1. Check if PM2 daemon is running: pm2 status");
      console.log("   2. Check daemon logs: pm2 logs workflow-monitor-daemon");
      console.log(
        "   3. Restart daemon if needed: pm2 restart workflow-monitor-daemon",
      );
    } else if (!status.checks.scheduledWorkflows) {
      console.log("   1. Initialize workflow schedules in the database");
      console.log("   2. Run: npm run monitor:init-schedules");
    } else {
      console.log("   1. Continue monitoring the system");
      console.log("   2. Check logs periodically: pm2 logs");
      console.log("   3. Monitor execution success rates");
    }
    console.log();

    return status;
  } catch (error) {
    console.error("💥 Fatal error during status check:");
    console.error(error);
    status.isHealthy = false;
    status.errors.push(error instanceof Error ? error.message : String(error));
    return status;
  } finally {
    await database.$disconnect();
  }
}

// Main execution
async function main() {
  try {
    const status = await checkDaemonStatus();

    // Exit with appropriate code
    process.exit(status.isHealthy ? 0 : 1);
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

main();
