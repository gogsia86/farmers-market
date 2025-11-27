#!/usr/bin/env tsx

/**
 * 🌟 Divine Monitoring Daemon
 * Farmers Market Platform - 24/7 Continuous Workflow Monitoring
 * Version: 1.0.0
 *
 * Runs workflows on schedule, monitors system health,
 * sends notifications, and provides self-healing capabilities.
 */

import { DivineMonitoringBot } from "../src/lib/monitoring/bot";
import { createNotificationManager } from "../src/lib/monitoring/notifiers";
import { getDatabaseStorage } from "../src/lib/monitoring/storage/database.storage";
import type {
  WorkflowConfig,
  WorkflowResult,
} from "../src/lib/monitoring/types";

// ============================================================================
// TYPES
// ============================================================================

interface ScheduledWorkflow {
  config: WorkflowConfig;
  intervalMs: number;
  lastRun?: Date;
  nextRun: Date;
  consecutiveFailures: number;
  enabled: boolean;
}

interface DaemonConfig {
  checkIntervalMs: number;
  healthCheckIntervalMs: number;
  reportIntervalMs: number;
  maxConsecutiveFailures: number;
  autoRestart: boolean;
  gracefulShutdown: boolean;
}

interface DaemonStats {
  startTime: Date;
  uptime: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastHealthCheck?: Date;
  lastReport?: Date;
}

// ============================================================================
// DAEMON CONFIGURATION
// ============================================================================

const DAEMON_CONFIG: DaemonConfig = {
  checkIntervalMs: 60 * 1000, // Check every minute
  healthCheckIntervalMs: 5 * 60 * 1000, // Health check every 5 minutes
  reportIntervalMs: 60 * 60 * 1000, // Report every hour
  maxConsecutiveFailures: 3,
  autoRestart: true,
  gracefulShutdown: true,
};

// Default workflow schedules (can be overridden by database)
const DEFAULT_SCHEDULES = [
  {
    workflowId: "health-check",
    intervalMinutes: 5,
    enabled: true,
  },
  {
    workflowId: "user-login",
    intervalMinutes: 15,
    enabled: true,
  },
  {
    workflowId: "user-registration",
    intervalMinutes: 30,
    enabled: true,
  },
  {
    workflowId: "farm-creation",
    intervalMinutes: 60,
    enabled: true,
  },
  {
    workflowId: "product-listing",
    intervalMinutes: 30,
    enabled: true,
  },
  {
    workflowId: "order-placement",
    intervalMinutes: 20,
    enabled: true,
  },
];

// ============================================================================
// MONITORING DAEMON CLASS
// ============================================================================

class MonitoringDaemon {
  private bot: DivineMonitoringBot;
  private notificationManager: ReturnType<typeof createNotificationManager>;
  private storage: ReturnType<typeof getDatabaseStorage>;
  private scheduledWorkflows: Map<string, ScheduledWorkflow> = new Map();
  private stats: DaemonStats;
  private running = false;
  private checkInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;
  private reportInterval?: NodeJS.Timeout;

  constructor() {
    this.bot = new DivineMonitoringBot({
      baseUrl: process.env.BASE_URL || "http://localhost:3000",
    });
    this.notificationManager = createNotificationManager();
    this.storage = getDatabaseStorage();
    this.stats = {
      startTime: new Date(),
      uptime: 0,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
    };
  }

  // ==========================================================================
  // LIFECYCLE METHODS
  // ==========================================================================

  /**
   * Start the monitoring daemon
   */
  async start(): Promise<void> {
    if (this.running) {
      console.log("⚠️  Daemon is already running");
      return;
    }

    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  🌾 DIVINE WORKFLOW MONITORING DAEMON                     ║",
    );
    console.log(
      "║  Farmers Market Platform - 24/7 Continuous Monitoring     ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝",
    );
    console.log();

    this.running = true;
    this.stats.startTime = new Date();

    try {
      // Load workflow schedules
      await this.loadSchedules();

      // Send startup notification
      await this.notificationManager.sendCriticalAlert(
        "Monitoring Daemon Started",
        `The Divine Workflow Monitor daemon is now running and will monitor ${this.scheduledWorkflows.size} workflows.`,
        {
          baseUrl: process.env.BASE_URL || "http://localhost:3000",
          workflows: Array.from(this.scheduledWorkflows.keys()),
          startTime: this.stats.startTime.toISOString(),
        },
      );

      // Start intervals
      this.checkInterval = setInterval(
        () => this.checkSchedules(),
        DAEMON_CONFIG.checkIntervalMs,
      );

      this.healthCheckInterval = setInterval(
        () => this.performHealthCheck(),
        DAEMON_CONFIG.healthCheckIntervalMs,
      );

      this.reportInterval = setInterval(
        () => this.generateReport(),
        DAEMON_CONFIG.reportIntervalMs,
      );

      // Setup graceful shutdown
      if (DAEMON_CONFIG.gracefulShutdown) {
        this.setupGracefulShutdown();
      }

      console.log("✅ Daemon started successfully");
      console.log(`📅 Scheduled workflows: ${this.scheduledWorkflows.size}`);
      console.log(
        `🔄 Check interval: ${DAEMON_CONFIG.checkIntervalMs / 1000}s`,
      );
      console.log(
        `💊 Health check interval: ${DAEMON_CONFIG.healthCheckIntervalMs / 1000}s`,
      );
      console.log(
        `📊 Report interval: ${DAEMON_CONFIG.reportIntervalMs / 1000}s`,
      );
      console.log();
      console.log("🚀 Monitoring daemon is now running...");
      console.log();

      // Run initial health check
      await this.performHealthCheck();

      // Keep the process alive
      this.keepAlive();
    } catch (error) {
      console.error("❌ Failed to start daemon:", error);
      await this.notificationManager.sendCriticalAlert(
        "Daemon Startup Failed",
        "The monitoring daemon failed to start",
        {
          error: error instanceof Error ? error.message : String(error),
        },
      );
      throw error;
    }
  }

  /**
   * Stop the monitoring daemon
   */
  async stop(): Promise<void> {
    if (!this.running) {
      console.log("⚠️  Daemon is not running");
      return;
    }

    console.log("\n🛑 Stopping monitoring daemon...");
    this.running = false;

    // Clear intervals
    if (this.checkInterval) clearInterval(this.checkInterval);
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.reportInterval) clearInterval(this.reportInterval);

    // Generate final report
    await this.generateReport();

    // Send shutdown notification
    await this.notificationManager.sendCriticalAlert(
      "Monitoring Daemon Stopped",
      "The Divine Workflow Monitor daemon has been stopped",
      {
        uptime: this.getUptime(),
        totalRuns: this.stats.totalRuns,
        successRate: this.getSuccessRate(),
      },
    );

    // Close bot
    await this.bot.close();

    console.log("✅ Daemon stopped gracefully");
  }

  // ==========================================================================
  // SCHEDULING METHODS
  // ==========================================================================

  /**
   * Load workflow schedules
   */
  private async loadSchedules(): Promise<void> {
    console.log("📅 Loading workflow schedules...");

    // Get all workflows from bot
    const workflows = this.bot.listWorkflows();

    // Load schedules from defaults
    for (const schedule of DEFAULT_SCHEDULES) {
      const workflow = workflows.find((w) => w.id === schedule.workflowId);
      if (!workflow) {
        console.warn(`⚠️  Workflow not found: ${schedule.workflowId}`);
        continue;
      }

      if (!schedule.enabled) {
        console.log(`⏭️  Skipping disabled workflow: ${schedule.workflowId}`);
        continue;
      }

      const intervalMs = schedule.intervalMinutes * 60 * 1000;
      this.scheduledWorkflows.set(workflow.id, {
        config: workflow,
        intervalMs,
        nextRun: new Date(Date.now() + intervalMs),
        consecutiveFailures: 0,
        enabled: true,
      });

      console.log(
        `✅ Scheduled: ${workflow.name} (every ${schedule.intervalMinutes} minutes)`,
      );
    }

    console.log(`📊 Loaded ${this.scheduledWorkflows.size} workflow schedules`);
    console.log();
  }

  /**
   * Check schedules and run workflows
   */
  private async checkSchedules(): Promise<void> {
    const now = new Date();

    for (const [workflowId, scheduled] of this.scheduledWorkflows.entries()) {
      if (!scheduled.enabled) continue;

      if (now >= scheduled.nextRun) {
        await this.runScheduledWorkflow(workflowId, scheduled);
      }
    }

    // Update uptime
    this.stats.uptime = Date.now() - this.stats.startTime.getTime();
  }

  /**
   * Run a scheduled workflow
   */
  private async runScheduledWorkflow(
    workflowId: string,
    scheduled: ScheduledWorkflow,
  ): Promise<void> {
    console.log(`\n🔄 Running scheduled workflow: ${scheduled.config.name}`);
    console.log(`   Priority: ${scheduled.config.priority}`);
    console.log(`   Scheduled: ${scheduled.nextRun.toISOString()}`);

    this.stats.totalRuns++;

    try {
      const result = await this.bot.runWorkflow(scheduled.config.id);

      // Update stats
      if (result.status === "PASSED") {
        this.stats.successfulRuns++;
        scheduled.consecutiveFailures = 0;
        console.log(`✅ Workflow passed: ${scheduled.config.name}`);

        // Notify on critical success
        if (scheduled.config.priority === "CRITICAL") {
          await this.notificationManager.notifyWorkflowSuccess(result);
        }
      } else {
        this.stats.failedRuns++;
        scheduled.consecutiveFailures++;
        console.log(`❌ Workflow failed: ${scheduled.config.name}`);

        // Always notify on failure
        await this.notificationManager.notifyWorkflowFailure(result);

        // Check if we need to disable this workflow
        if (
          scheduled.consecutiveFailures >= DAEMON_CONFIG.maxConsecutiveFailures
        ) {
          console.log(
            `🚨 Disabling workflow after ${scheduled.consecutiveFailures} consecutive failures: ${scheduled.config.name}`,
          );
          scheduled.enabled = false;

          await this.notificationManager.sendCriticalAlert(
            "Workflow Disabled",
            `${scheduled.config.name} has been disabled after ${scheduled.consecutiveFailures} consecutive failures`,
            {
              workflowId: scheduled.config.id,
              consecutiveFailures: scheduled.consecutiveFailures,
            },
          );
        }
      }

      // Save to database
      await this.storage.saveWorkflowExecution(result);

      // Update next run
      scheduled.lastRun = new Date();
      scheduled.nextRun = new Date(Date.now() + scheduled.intervalMs);

      console.log(`   Next run: ${scheduled.nextRun.toLocaleString()}`);
    } catch (error) {
      this.stats.failedRuns++;
      scheduled.consecutiveFailures++;
      console.error(`❌ Error running workflow: ${error}`);

      await this.notificationManager.sendCriticalAlert(
        "Workflow Execution Error",
        `Failed to execute workflow: ${scheduled.config.name}`,
        {
          error: error instanceof Error ? error.message : String(error),
          workflowId: scheduled.config.id,
        },
      );

      // Update next run even on error
      scheduled.lastRun = new Date();
      scheduled.nextRun = new Date(Date.now() + scheduled.intervalMs);
    }
  }

  // ==========================================================================
  // HEALTH CHECK & REPORTING
  // ==========================================================================

  /**
   * Perform system health check
   */
  private async performHealthCheck(): Promise<void> {
    console.log("\n💊 Performing health check...");

    try {
      const healthCheck = {
        healthy: true,
        responseTime: 0,
        checks: {
          database: true,
          api: true,
          cache: true,
          externalServices: true,
        },
        details: {} as Record<string, any>,
        errors: [] as string[],
      };

      const startTime = Date.now();

      // Check database
      try {
        const stats = await this.storage.getStorageStats();
        healthCheck.checks.database = true;
        healthCheck.details.database = stats;
      } catch (error) {
        healthCheck.checks.database = false;
        healthCheck.healthy = false;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(
          `⚠️  Database health check failed (may be schema mismatch): ${errorMsg}`,
        );
        healthCheck.errors.push(`Database: ${errorMsg}`);
      }

      // Check API
      try {
        const baseUrl = process.env.BASE_URL || "http://localhost:3000";
        const response = await fetch(`${baseUrl}/api/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        healthCheck.checks.api = response.ok;
        if (!response.ok) {
          healthCheck.healthy = false;
          healthCheck.errors.push(`API returned status ${response.status}`);
        }
      } catch (error) {
        healthCheck.checks.api = false;
        healthCheck.healthy = false;
        healthCheck.errors.push(`API: ${error}`);
      }

      healthCheck.responseTime = Date.now() - startTime;

      // Save health check (wrapped in try-catch for schema mismatch tolerance)
      try {
        await this.storage.saveHealthCheck(healthCheck);
      } catch (error) {
        console.log(
          `⚠️  Failed to save health check to database (schema mismatch): ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      this.stats.lastHealthCheck = new Date();

      if (healthCheck.healthy) {
        console.log(`✅ Health check passed (${healthCheck.responseTime}ms)`);
      } else {
        console.log(`❌ Health check failed:`);
        healthCheck.errors.forEach((err) => console.log(`   - ${err}`));

        await this.notificationManager.sendCriticalAlert(
          "Health Check Failed",
          "System health check detected issues",
          healthCheck,
        );
      }
    } catch (error) {
      console.error("❌ Health check error:", error);
    }
  }

  /**
   * Generate monitoring report
   */
  private async generateReport(): Promise<void> {
    console.log("\n📊 Generating monitoring report...");

    try {
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - DAEMON_CONFIG.reportIntervalMs,
      );

      // Get recent executions
      const executions = await this.storage.getWorkflowExecutions({
        startDate,
        endDate,
      });

      if (executions.length === 0) {
        console.log("ℹ️  No workflow executions to report");
        return;
      }

      const reporter = this.bot["reporter"];
      const report = await reporter.generateReport(executions, {
        start: startDate,
        end: endDate,
      });

      // Save report
      await this.storage.saveReport(report);
      await reporter.saveReport(report);

      // Send report summary
      await this.notificationManager.sendReportSummary(report);

      this.stats.lastReport = new Date();

      console.log(`✅ Report generated: ${report.reportId}`);
      console.log(`   Success rate: ${report.summary.successRate.toFixed(1)}%`);
      console.log(`   Total workflows: ${report.summary.totalWorkflows}`);
    } catch (error) {
      console.error("❌ Report generation error:", error);
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("uncaughtException", async (error) => {
      console.error("💥 Uncaught exception:", error);
      await this.notificationManager.sendCriticalAlert(
        "Daemon Uncaught Exception",
        "The monitoring daemon encountered an uncaught exception",
        { error: error.message, stack: error.stack },
      );
      if (DAEMON_CONFIG.autoRestart) {
        console.log("🔄 Auto-restarting daemon...");
        await this.stop();
        setTimeout(() => this.start(), 5000);
      } else {
        await this.stop();
        process.exit(1);
      }
    });
  }

  /**
   * Keep process alive
   */
  private keepAlive(): void {
    setInterval(
      () => {
        if (this.running) {
          const uptime = this.getUptime();
          const successRate = this.getSuccessRate();
          console.log(
            `💚 Daemon alive - Uptime: ${uptime} | Runs: ${this.stats.totalRuns} | Success: ${successRate}%`,
          );
        }
      },
      5 * 60 * 1000,
    ); // Log every 5 minutes
  }

  /**
   * Get uptime in human-readable format
   */
  private getUptime(): string {
    const uptimeMs = Date.now() - this.stats.startTime.getTime();
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  /**
   * Get success rate
   */
  private getSuccessRate(): string {
    if (this.stats.totalRuns === 0) return "0.0";
    return ((this.stats.successfulRuns / this.stats.totalRuns) * 100).toFixed(
      1,
    );
  }

  /**
   * Get daemon status
   */
  getStatus(): {
    running: boolean;
    stats: DaemonStats;
    scheduledWorkflows: number;
    enabledWorkflows: number;
  } {
    return {
      running: this.running,
      stats: this.stats,
      scheduledWorkflows: this.scheduledWorkflows.size,
      enabledWorkflows: Array.from(this.scheduledWorkflows.values()).filter(
        (w) => w.enabled,
      ).length,
    };
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const daemon = new MonitoringDaemon();

  try {
    await daemon.start();

    // Keep the process running
    await new Promise(() => {});
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

// Always run the daemon when this module is loaded
main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});

export { MonitoringDaemon };
