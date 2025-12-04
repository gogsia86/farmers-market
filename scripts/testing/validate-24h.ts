#!/usr/bin/env tsx

/**
 * 🌟 24-Hour Validation Tracking Script
 * Farmers Market Platform - Extended Validation Run
 * Version: 1.0.0
 *
 * Monitors the daemon for 24 hours and collects comprehensive metrics,
 * logs, and validation data for production readiness assessment.
 */

import { promises as fs } from "fs";
import path from "path";
import { database } from "../src/lib/database";

// ============================================================================
// TYPES
// ============================================================================

interface ValidationCheckpoint {
  timestamp: Date;
  hour: number;
  stats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    avgResponseTime: number;
    healthChecksPassed: number;
    healthChecksFailed: number;
    notificationsSent: number;
    alertsTriggered: number;
  };
  issues: string[];
  recommendations: string[];
}

interface ValidationReport {
  startTime: Date;
  endTime?: Date;
  duration: string;
  totalCheckpoints: number;
  checkpoints: ValidationCheckpoint[];
  summary: {
    overallSuccessRate: number;
    avgResponseTime: number;
    uptimePercentage: number;
    totalIssues: number;
    criticalIssues: number;
    stabilityScore: number;
  };
  recommendations: string[];
  productionReady: boolean;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const VALIDATION_CONFIG = {
  durationHours: 24,
  checkpointIntervalMinutes: 60, // Hourly checkpoints
  logsDir: "./logs/validation",
  reportsDir: "./monitoring-reports/validation",
  healthCheckThreshold: 90, // % success rate
  stabilityThreshold: 95, // % for production readiness
};

// ============================================================================
// VALIDATION TRACKER CLASS
// ============================================================================

class ValidationTracker {
  private startTime: Date;
  private checkpoints: ValidationCheckpoint[] = [];
  private checkpointInterval?: NodeJS.Timeout;
  private running = false;
  private currentHour = 0;

  constructor() {
    this.startTime = new Date();
  }

  /**
   * Start 24-hour validation tracking
   */
  async start(): Promise<void> {
    if (this.running) {
      console.log("⚠️  Validation tracking is already running");
      return;
    }

    this.running = true;
    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  🌾 24-HOUR VALIDATION RUN STARTED                        ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(`║  Start Time: ${this.startTime.toISOString()}`);
    console.log(`║  End Time:   ${this.getEndTime().toISOString()}`);
    console.log(`║  Duration:   ${VALIDATION_CONFIG.durationHours} hours`);
    console.log(
      `║  Checkpoints: Every ${VALIDATION_CONFIG.checkpointIntervalMinutes} minutes`,
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    // Ensure directories exist
    await this.setupDirectories();

    // Initial checkpoint
    await this.recordCheckpoint();

    // Schedule hourly checkpoints
    this.checkpointInterval = setInterval(
      async () => {
        this.currentHour++;
        await this.recordCheckpoint();

        // Check if 24 hours completed
        if (this.currentHour >= VALIDATION_CONFIG.durationHours) {
          await this.complete();
        }
      },
      VALIDATION_CONFIG.checkpointIntervalMinutes * 60 * 1000,
    );

    // Setup graceful shutdown
    this.setupShutdownHandlers();

    console.log("✅ Validation tracking started successfully");
    console.log(
      `📊 Progress will be logged every ${VALIDATION_CONFIG.checkpointIntervalMinutes} minutes`,
    );
    console.log("💡 Press Ctrl+C to stop and generate interim report\n");
  }

  /**
   * Record a validation checkpoint
   */
  private async recordCheckpoint(): Promise<void> {
    console.log(
      `\n⏰ Recording checkpoint ${this.currentHour + 1}/${VALIDATION_CONFIG.durationHours}...`,
    );

    try {
      const stats = await this.collectStats();
      const issues = await this.detectIssues(stats);
      const recommendations = this.generateRecommendations(stats, issues);

      const checkpoint: ValidationCheckpoint = {
        timestamp: new Date(),
        hour: this.currentHour,
        stats,
        issues,
        recommendations,
      };

      this.checkpoints.push(checkpoint);

      // Display checkpoint summary
      this.displayCheckpoint(checkpoint);

      // Save checkpoint to file
      await this.saveCheckpoint(checkpoint);

      console.log("✅ Checkpoint recorded successfully\n");
    } catch (error) {
      console.error("❌ Error recording checkpoint:", error);
    }
  }

  /**
   * Collect statistics from database
   */
  private async collectStats() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    try {
      // Get workflow executions from last hour
      const executions = await database.workflowExecution.findMany({
        where: {
          startedAt: {
            gte: oneHourAgo,
          },
        },
      });

      // Get health checks from last hour
      const healthChecks = await database.systemHealthCheck.findMany({
        where: {
          checkedAt: {
            gte: oneHourAgo,
          },
        },
      });

      // Get notifications from last hour
      const notifications = await database.notificationLog.findMany({
        where: {
          sentAt: {
            gte: oneHourAgo,
          },
        },
      });

      // Calculate metrics
      const successful = executions.filter(
        (e) => e.status === "SUCCESS",
      ).length;
      const failed = executions.filter((e) => e.status === "FAILED").length;
      const avgResponseTime =
        executions.length > 0
          ? executions.reduce((sum, e) => sum + (e.durationMs || 0), 0) /
            executions.length
          : 0;

      const healthChecksPassed = healthChecks.filter((h) => h.healthy).length;
      const healthChecksFailed = healthChecks.filter((h) => !h.healthy).length;

      // Count critical notifications as alerts
      const alertsTriggered = notifications.filter(
        (n) => n.priority === "CRITICAL" || n.priority === "HIGH",
      ).length;

      return {
        totalExecutions: executions.length,
        successfulExecutions: successful,
        failedExecutions: failed,
        avgResponseTime: Math.round(avgResponseTime),
        healthChecksPassed,
        healthChecksFailed,
        notificationsSent: notifications.length,
        alertsTriggered,
      };
    } catch (error) {
      console.error("Error collecting stats:", error);
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        avgResponseTime: 0,
        healthChecksPassed: 0,
        healthChecksFailed: 0,
        notificationsSent: 0,
        alertsTriggered: 0,
      };
    }
  }

  /**
   * Detect issues based on statistics
   */
  private async detectIssues(
    stats: ValidationCheckpoint["stats"],
  ): Promise<string[]> {
    const issues: string[] = [];

    // Check success rate
    const successRate =
      stats.totalExecutions > 0
        ? (stats.successfulExecutions / stats.totalExecutions) * 100
        : 100;

    if (successRate < VALIDATION_CONFIG.healthCheckThreshold) {
      issues.push(
        `⚠️  Low success rate: ${successRate.toFixed(2)}% (threshold: ${VALIDATION_CONFIG.healthCheckThreshold}%)`,
      );
    }

    // Check response time
    if (stats.avgResponseTime > 5000) {
      issues.push(`⚠️  High average response time: ${stats.avgResponseTime}ms`);
    }

    // Check health checks
    if (stats.healthChecksFailed > 0) {
      issues.push(`⚠️  Health checks failed: ${stats.healthChecksFailed}`);
    }

    // Check for excessive alerts
    if (stats.alertsTriggered > 10) {
      issues.push(`⚠️  High number of alerts: ${stats.alertsTriggered}`);
    }

    // Check for no activity
    if (stats.totalExecutions === 0) {
      issues.push("❌ CRITICAL: No workflow executions detected");
    }

    return issues;
  }

  /**
   * Generate recommendations based on stats and issues
   */
  private generateRecommendations(
    stats: ValidationCheckpoint["stats"],
    issues: string[],
  ): string[] {
    const recommendations: string[] = [];

    if (issues.length === 0) {
      recommendations.push("✅ All systems operating normally");
      return recommendations;
    }

    // Recommendations based on issues
    if (stats.failedExecutions > stats.successfulExecutions) {
      recommendations.push(
        "🔧 Review failed workflow logs and add error handling",
      );
    }

    if (stats.avgResponseTime > 5000) {
      recommendations.push("⚡ Optimize database queries and add caching");
    }

    if (stats.healthChecksFailed > 0) {
      recommendations.push(
        "🏥 Investigate health check failures and dependencies",
      );
    }

    if (stats.alertsTriggered > 10) {
      recommendations.push("📢 Review alert thresholds to reduce noise");
    }

    if (stats.totalExecutions === 0) {
      recommendations.push(
        "🚨 Check if daemon is running: npm run monitor:daemon",
      );
    }

    return recommendations;
  }

  /**
   * Display checkpoint summary
   */
  private displayCheckpoint(checkpoint: ValidationCheckpoint): void {
    console.log(
      "┌────────────────────────────────────────────────────────────┐",
    );
    console.log(
      `│  Checkpoint #${checkpoint.hour + 1} - ${checkpoint.timestamp.toLocaleString()}`,
    );
    console.log(
      "├────────────────────────────────────────────────────────────┤",
    );
    console.log(
      `│  Executions:     ${checkpoint.stats.totalExecutions} total (${checkpoint.stats.successfulExecutions} ✓ / ${checkpoint.stats.failedExecutions} ✗)`,
    );
    console.log(
      `│  Success Rate:   ${this.calculateSuccessRate(checkpoint.stats).toFixed(2)}%`,
    );
    console.log(`│  Response Time:  ${checkpoint.stats.avgResponseTime}ms avg`);
    console.log(
      `│  Health Checks:  ${checkpoint.stats.healthChecksPassed} passed / ${checkpoint.stats.healthChecksFailed} failed`,
    );
    console.log(
      `│  Notifications:  ${checkpoint.stats.notificationsSent} sent (${checkpoint.stats.alertsTriggered} alerts)`,
    );
    console.log(
      "├────────────────────────────────────────────────────────────┤",
    );

    if (checkpoint.issues.length > 0) {
      console.log("│  Issues:");
      checkpoint.issues.forEach((issue) => {
        console.log(`│    ${issue}`);
      });
    } else {
      console.log("│  ✅ No issues detected");
    }

    console.log(
      "└────────────────────────────────────────────────────────────┘",
    );
  }

  /**
   * Calculate success rate
   */
  private calculateSuccessRate(stats: ValidationCheckpoint["stats"]): number {
    if (stats.totalExecutions === 0) return 100;
    return (stats.successfulExecutions / stats.totalExecutions) * 100;
  }

  /**
   * Save checkpoint to file
   */
  private async saveCheckpoint(
    checkpoint: ValidationCheckpoint,
  ): Promise<void> {
    const filename = `checkpoint-${checkpoint.hour.toString().padStart(2, "0")}.json`;
    const filepath = path.join(VALIDATION_CONFIG.logsDir, filename);

    await fs.writeFile(filepath, JSON.stringify(checkpoint, null, 2), "utf-8");
  }

  /**
   * Complete validation and generate final report
   */
  private async complete(): Promise<void> {
    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  🎉 24-HOUR VALIDATION RUN COMPLETED                      ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    if (this.checkpointInterval) {
      clearInterval(this.checkpointInterval);
    }

    this.running = false;

    // Generate final report
    const report = await this.generateReport();

    // Display summary
    this.displayReport(report);

    // Save report
    await this.saveReport(report);

    console.log("\n✅ Validation complete! Report saved to:");
    console.log(
      `   ${VALIDATION_CONFIG.reportsDir}/validation-report-${this.getTimestamp()}.json`,
    );

    process.exit(0);
  }

  /**
   * Generate comprehensive validation report
   */
  private async generateReport(): Promise<ValidationReport> {
    const now = new Date();
    const duration = this.formatDuration(
      now.getTime() - this.startTime.getTime(),
    );

    // Calculate overall metrics
    let totalExecutions = 0;
    let successfulExecutions = 0;
    let totalResponseTime = 0;
    let totalIssues = 0;
    let criticalIssues = 0;

    this.checkpoints.forEach((checkpoint) => {
      totalExecutions += checkpoint.stats.totalExecutions;
      successfulExecutions += checkpoint.stats.successfulExecutions;
      totalResponseTime += checkpoint.stats.avgResponseTime;
      totalIssues += checkpoint.issues.length;
      criticalIssues += checkpoint.issues.filter((i) =>
        i.includes("CRITICAL"),
      ).length;
    });

    const overallSuccessRate =
      totalExecutions > 0
        ? (successfulExecutions / totalExecutions) * 100
        : 100;
    const avgResponseTime =
      this.checkpoints.length > 0
        ? totalResponseTime / this.checkpoints.length
        : 0;

    // Calculate uptime (assume 100% if no critical issues with no executions)
    const uptimePercentage =
      (this.checkpoints.filter((c) => c.stats.totalExecutions > 0).length /
        this.checkpoints.length) *
      100;

    // Calculate stability score (0-100)
    const stabilityScore = Math.round(
      overallSuccessRate * 0.4 +
        uptimePercentage * 0.3 +
        (100 - Math.min(totalIssues * 5, 100)) * 0.3,
    );

    // Generate recommendations
    const recommendations: string[] = [];
    if (overallSuccessRate < VALIDATION_CONFIG.stabilityThreshold) {
      recommendations.push(
        "⚠️  Success rate below production threshold - review error logs",
      );
    }
    if (criticalIssues > 0) {
      recommendations.push(
        "🚨 Address critical issues before production deployment",
      );
    }
    if (stabilityScore >= VALIDATION_CONFIG.stabilityThreshold) {
      recommendations.push("✅ System is stable and ready for production");
    } else {
      recommendations.push(
        "⚠️  Additional testing and fixes recommended before production",
      );
    }

    const productionReady =
      stabilityScore >= VALIDATION_CONFIG.stabilityThreshold &&
      criticalIssues === 0 &&
      overallSuccessRate >= VALIDATION_CONFIG.stabilityThreshold;

    return {
      startTime: this.startTime,
      endTime: now,
      duration,
      totalCheckpoints: this.checkpoints.length,
      checkpoints: this.checkpoints,
      summary: {
        overallSuccessRate: parseFloat(overallSuccessRate.toFixed(2)),
        avgResponseTime: Math.round(avgResponseTime),
        uptimePercentage: parseFloat(uptimePercentage.toFixed(2)),
        totalIssues,
        criticalIssues,
        stabilityScore,
      },
      recommendations,
      productionReady,
    };
  }

  /**
   * Display final report
   */
  private displayReport(report: ValidationReport): void {
    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  📊 VALIDATION REPORT SUMMARY                             ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(`║  Duration:        ${report.duration}`);
    console.log(`║  Checkpoints:     ${report.totalCheckpoints}`);
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(`║  Success Rate:    ${report.summary.overallSuccessRate}%`);
    console.log(`║  Avg Response:    ${report.summary.avgResponseTime}ms`);
    console.log(`║  Uptime:          ${report.summary.uptimePercentage}%`);
    console.log(
      `║  Total Issues:    ${report.summary.totalIssues} (${report.summary.criticalIssues} critical)`,
    );
    console.log(`║  Stability Score: ${report.summary.stabilityScore}/100`);
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(
      `║  Production Ready: ${report.productionReady ? "✅ YES" : "⚠️  NO"}`,
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log("║  Recommendations:");
    report.recommendations.forEach((rec) => {
      console.log(`║    ${rec}`);
    });
    console.log(
      "╚════════════════════════════════════════════════════════════╝",
    );
  }

  /**
   * Save final report
   */
  private async saveReport(report: ValidationReport): Promise<void> {
    const filename = `validation-report-${this.getTimestamp()}.json`;
    const filepath = path.join(VALIDATION_CONFIG.reportsDir, filename);

    await fs.writeFile(filepath, JSON.stringify(report, null, 2), "utf-8");

    // Also save as latest
    const latestPath = path.join(
      VALIDATION_CONFIG.reportsDir,
      "validation-latest.json",
    );
    await fs.writeFile(latestPath, JSON.stringify(report, null, 2), "utf-8");
  }

  /**
   * Setup directories
   */
  private async setupDirectories(): Promise<void> {
    await fs.mkdir(VALIDATION_CONFIG.logsDir, { recursive: true });
    await fs.mkdir(VALIDATION_CONFIG.reportsDir, { recursive: true });
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupShutdownHandlers(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n\n⚠️  Received ${signal} - generating interim report...`);

      if (this.checkpointInterval) {
        clearInterval(this.checkpointInterval);
      }

      const report = await this.generateReport();
      await this.saveReport(report);

      console.log("\n✅ Interim report saved. Exiting...");
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }

  /**
   * Get end time
   */
  private getEndTime(): Date {
    return new Date(
      this.startTime.getTime() +
        VALIDATION_CONFIG.durationHours * 60 * 60 * 1000,
    );
  }

  /**
   * Format duration
   */
  private formatDuration(ms: number): string {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  }

  /**
   * Get timestamp for filenames
   */
  private getTimestamp(): string {
    return new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .split(".")[0];
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const tracker = new ValidationTracker();
  await tracker.start();
}

// Run the validation tracker
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
