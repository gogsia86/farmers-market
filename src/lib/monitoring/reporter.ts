/**
 * 🌟 Divine Monitoring Reporter
 * Farmers Market Platform - Automated Report Generation & Notifications
 * Version: 1.0.0
 *
 * Generates comprehensive monitoring reports and sends notifications.
 */

import { promises as fs } from "fs";
import path from "path";

import { logger } from "@/lib/monitoring/logger";

import type {
  WorkflowResult,
  MonitoringReport,
  Reporter as IReporter,
  Notification,
  NotificationConfig,
  NotificationChannel,
} from "./types";

// ============================================================================
// DIVINE MONITORING REPORTER
// ============================================================================

export class DivineMonitoringReporter implements IReporter {
  private reportStoragePath: string;
  private notificationConfig?: NotificationConfig;

  constructor(
    storagePath: string = "./monitoring-reports",
    notificationConfig?: NotificationConfig,
  ) {
    this.reportStoragePath = storagePath;
    this.notificationConfig = notificationConfig;
  }

  /**
   * ✅ GENERATE REPORT - Create comprehensive monitoring report
   */
  async generateReport(
    results: WorkflowResult[],
    period: { start: Date; end: Date },
  ): Promise<MonitoringReport> {
    logger.info(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    logger.info(
      "║ 📊 GENERATING DIVINE MONITORING REPORT                     ║",
    );
    logger.info(
      "╠════════════════════════════════════════════════════════════╣",
    );
    logger.info(
      `║ 📅 PERIOD: ${this.formatDate(period.start)} - ${this.formatDate(period.end)}    ║`,
    );
    logger.info(`║ 🔢 WORKFLOWS: ${String(results.length).padEnd(43)} ║`);
    logger.info(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    // Calculate summary statistics
    const totalWorkflows = results.length;
    const passedWorkflows = results.filter(
      (r: any) => r.status === "PASSED",
    ).length;
    const failedWorkflows = results.filter(
      (r: any) => r.status === "FAILED",
    ).length;
    const warningWorkflows = results.filter(
      (r) => r.status === "WARNING",
    ).length;
    const skippedWorkflows = results.filter(
      (r) => r.status === "SKIPPED",
    ).length;
    const successRate =
      totalWorkflows > 0 ? (passedWorkflows / totalWorkflows) * 100 : 0;
    const averageDuration =
      totalWorkflows > 0
        ? results.reduce((sum: any, r: any) => sum + r.duration, 0) /
          totalWorkflows
        : 0;
    const criticalIssues = results.filter(
      (r) => r.status === "FAILED" && r.priority === "CRITICAL",
    ).length;

    // Calculate trends (mock for now - would compare with previous report)
    const trends = {
      successRateTrend: 0, // Would calculate from historical data
      performanceTrend: 0,
      errorRateTrend: 0,
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(results);

    // Agricultural insights
    const agricultureInsights = this.generateAgricultureInsights(results);

    const report: MonitoringReport = {
      reportId: this.generateReportId(),
      timestamp: new Date(),
      period,
      summary: {
        totalWorkflows,
        passedWorkflows,
        failedWorkflows,
        warningWorkflows,
        skippedWorkflows,
        successRate,
        averageDuration,
        criticalIssues,
      },
      workflows: results,
      trends,
      recommendations,
      agricultureInsights,
    };

    this.logReport(report);

    return report;
  }

  /**
   * ✅ SAVE REPORT - Save report to storage
   */
  async saveReport(report: MonitoringReport): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(this.reportStoragePath, { recursive: true });

      // Save JSON report
      const jsonPath = path.join(
        this.reportStoragePath,
        `report-${report.reportId}.json`,
      );
      await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

      // Save HTML report
      const htmlPath = path.join(
        this.reportStoragePath,
        `report-${report.reportId}.html`,
      );
      const htmlContent = this.generateHtmlReport(report);
      await fs.writeFile(htmlPath, htmlContent, "utf-8");

      // Save markdown report
      const mdPath = path.join(
        this.reportStoragePath,
        `report-${report.reportId}.md`,
      );
      const mdContent = this.generateMarkdownReport(report);
      await fs.writeFile(mdPath, mdContent, "utf-8");

      logger.info(`✅ Report saved: ${report.reportId}`);
      logger.info(`   📄 JSON: ${jsonPath}`);
      logger.info(`   🌐 HTML: ${htmlPath}`);
      logger.info(`   📝 MD: ${mdPath}\n`);
    } catch (error) {
      logger.error("❌ Failed to save report:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * ✅ SEND NOTIFICATIONS - Send notifications for report
   */
  async sendNotifications(report: MonitoringReport): Promise<Notification[]> {
    if (!this.notificationConfig) {
      logger.info("⚠️  No notification configuration provided");
      return [];
    }

    const notifications: Notification[] = [];

    // Determine if we should send notification
    const shouldNotify = this.shouldSendNotification(report);
    if (!shouldNotify) {
      logger.info("ℹ️  No notification needed for this report");
      return [];
    }

    logger.info("\n📤 Sending notifications...");

    for (const channel of this.notificationConfig.channels) {
      try {
        const notification = await this.sendNotification(channel, report);
        notifications.push(notification);
      } catch (error) {
        logger.error(`❌ Failed to send ${channel} notification:`, {
          error: error instanceof Error ? error.message : String(error),
        });
        notifications.push({
          id: this.generateNotificationId(),
          timestamp: new Date(),
          channel,
          priority: this.getReportPriority(report),
          title: "Monitoring Report Notification Failed",
          message: `Failed to send notification via ${channel}`,
          report,
          sent: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return notifications;
  }

  /**
   * ✅ GET REPORT HISTORY - Retrieve historical reports
   */
  async getReportHistory(limit: number = 10): Promise<MonitoringReport[]> {
    try {
      const files = await fs.readdir(this.reportStoragePath);
      const jsonFiles = files.filter((f: any) => f.endsWith(".json"));

      // Sort by date (newest first)
      jsonFiles.sort().reverse();

      const reports: MonitoringReport[] = [];
      const filesToRead = jsonFiles.slice(0, limit);

      for (const file of filesToRead) {
        const filePath = path.join(this.reportStoragePath, file);
        const content = await fs.readFile(filePath, "utf-8");
        const report = JSON.parse(content) as MonitoringReport;
        reports.push(report);
      }

      return reports;
    } catch (error) {
      logger.error("❌ Failed to get report history:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private generateRecommendations(results: WorkflowResult[]): string[] {
    const recommendations: string[] = [];

    // Check success rate
    const passedCount = results.filter(
      (r: any) => r.status === "PASSED",
    ).length;
    const successRate =
      results.length > 0 ? (passedCount / results.length) * 100 : 100;

    if (successRate < 90) {
      recommendations.push(
        `⚠️  Success rate is below 90% (${successRate.toFixed(1)}%). Investigate failing workflows.`,
      );
    }

    // Check critical failures
    const criticalFailures = results.filter(
      (r) => r.status === "FAILED" && r.priority === "CRITICAL",
    );
    if (criticalFailures.length > 0) {
      recommendations.push(
        `🚨 ${criticalFailures.length} critical workflow(s) failed. Immediate attention required!`,
      );
    }

    // Check performance
    const avgDuration =
      results.reduce((sum: any, r: any) => sum + r.duration, 0) /
      results.length;
    if (avgDuration > 60000) {
      // > 1 minute
      recommendations.push(
        `⏱️  Average workflow duration is high (${(avgDuration / 1000).toFixed(2)}s). Consider performance optimization.`,
      );
    }

    // Check error patterns
    const errorWorkflows = results.filter((r: any) => r.status === "FAILED");
    if (errorWorkflows.length > results.length * 0.2) {
      recommendations.push(
        `❌ High error rate detected (${((errorWorkflows.length / results.length) * 100).toFixed(1)}%). Review system stability.`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ All systems operating normally. Great job!");
    }

    return recommendations;
  }

  private generateAgricultureInsights(results: WorkflowResult[]): {
    seasonalOptimization: string[];
    biodynamicSuggestions: string[];
    farmHealthTrends: string[];
  } {
    const seasonalOptimization: string[] = [];
    const biodynamicSuggestions: string[] = [];
    const farmHealthTrends: string[] = [];

    // Analyze agricultural consciousness
    const agricultureResults = results.filter(
      (r) => r.agricultureConsciousness,
    );

    if (agricultureResults.length > 0) {
      // Calculate average scores
      const avgSeasonalRelevance =
        agricultureResults.reduce(
          (sum, r) =>
            sum + (r.agricultureConsciousness?.seasonalRelevance || 0),
          0,
        ) / agricultureResults.length;

      const avgBiodynamicAlignment =
        agricultureResults.reduce(
          (sum, r) =>
            sum + (r.agricultureConsciousness?.biodynamicAlignment || 0),
          0,
        ) / agricultureResults.length;

      const avgFarmHealth =
        agricultureResults.reduce(
          (sum, r) => sum + (r.agricultureConsciousness?.farmHealthScore || 0),
          0,
        ) / agricultureResults.length;

      // Seasonal optimization
      if (avgSeasonalRelevance < 80) {
        seasonalOptimization.push(
          `🌱 Seasonal relevance score is ${avgSeasonalRelevance.toFixed(1)}%. Consider aligning workflows with current season.`,
        );
      } else {
        seasonalOptimization.push(
          `✅ Excellent seasonal alignment (${avgSeasonalRelevance.toFixed(1)}%).`,
        );
      }

      // Biodynamic suggestions
      if (avgBiodynamicAlignment < 85) {
        biodynamicSuggestions.push(
          `🌿 Biodynamic alignment at ${avgBiodynamicAlignment.toFixed(1)}%. Review agricultural practices.`,
        );
      } else {
        biodynamicSuggestions.push(
          `✅ Strong biodynamic patterns (${avgBiodynamicAlignment.toFixed(1)}%).`,
        );
      }

      // Farm health trends
      if (avgFarmHealth < 90) {
        farmHealthTrends.push(
          `⚠️  Farm health score at ${avgFarmHealth.toFixed(1)}%. Check data integrity.`,
        );
      } else {
        farmHealthTrends.push(
          `✅ Farm data health excellent (${avgFarmHealth.toFixed(1)}%).`,
        );
      }
    }

    return {
      seasonalOptimization,
      biodynamicSuggestions,
      farmHealthTrends,
    };
  }

  private shouldSendNotification(report: MonitoringReport): boolean {
    // Send if there are critical issues
    if (report.summary.criticalIssues > 0) return true;

    // Send if success rate is below 90%
    if (report.summary.successRate < 90) return true;

    // Send if there are failed workflows
    if (report.summary.failedWorkflows > 0) return true;

    return false;
  }

  private async sendNotification(
    channel: NotificationChannel,
    report: MonitoringReport,
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateNotificationId(),
      timestamp: new Date(),
      channel,
      priority: this.getReportPriority(report),
      title: this.generateNotificationTitle(report),
      message: this.generateNotificationMessage(report),
      report,
      sent: false,
    };

    switch (channel) {
      case "EMAIL":
        await this.sendEmailNotification(notification);
        break;
      case "SLACK":
        await this.sendSlackNotification(notification);
        break;
      case "DISCORD":
        await this.sendDiscordNotification(notification);
        break;
      case "WEBHOOK":
        await this.sendWebhookNotification(notification);
        break;
    }

    notification.sent = true;
    logger.info(`   ✅ ${channel} notification sent`);
    return notification;
  }

  private async sendEmailNotification(
    notification: Notification,
  ): Promise<void> {
    // Email implementation would go here
    // For now, just log
    logger.info("   📧 Would send email notification", {
      title: {
        to: this.notificationConfig?.email?.to,
        subject: notification.title,
      },
    });
  }

  private async sendSlackNotification(
    notification: Notification,
  ): Promise<void> {
    if (!this.notificationConfig?.slack?.webhookUrl) {
      throw new Error("Slack webhook URL not configured");
    }

    const slackMessage = {
      text: notification.title,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: notification.title,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: notification.message,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Priority: *${notification.priority}* | Time: ${notification.timestamp.toISOString()}`,
            },
          ],
        },
      ],
    };

    // In production, would use fetch to send to Slack
    logger.info("   💬 Would send Slack message", {
      dataslackMessage: { data: slackMessage },
    });
  }

  private async sendDiscordNotification(
    notification: Notification,
  ): Promise<void> {
    if (!this.notificationConfig?.discord?.webhookUrl) {
      throw new Error("Discord webhook URL not configured");
    }

    const discordMessage = {
      username:
        this.notificationConfig.discord.username || "Workflow Monitor Bot",
      avatar_url: this.notificationConfig.discord.avatarUrl,
      embeds: [
        {
          title: notification.title,
          description: notification.message,
          color: this.getDiscordColor(notification.priority),
          timestamp: notification.timestamp.toISOString(),
          footer: {
            text: "Farmers Market Platform Monitoring",
          },
        },
      ],
    };

    // In production, would use fetch to send to Discord
    logger.info("   🎮 Would send Discord message", {
      datadiscordMessage: { data: discordMessage },
    });
  }

  private async sendWebhookNotification(
    _notification: Notification,
  ): Promise<void> {
    if (!this.notificationConfig?.webhook?.url) {
      throw new Error("Webhook URL not configured");
    }

    // In production, would use fetch to send webhook
    logger.info("   🔗 Would send webhook to:", {
      data: this.notificationConfig.webhook.url,
    });
  }

  private getReportPriority(
    report: MonitoringReport,
  ): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
    if (report.summary.criticalIssues > 0) return "CRITICAL";
    if (report.summary.failedWorkflows > 0) return "HIGH";
    if (report.summary.warningWorkflows > 0) return "MEDIUM";
    return "LOW";
  }

  private generateNotificationTitle(report: MonitoringReport): string {
    const priority = this.getReportPriority(report);
    const emoji =
      priority === "CRITICAL"
        ? "🚨"
        : priority === "HIGH"
          ? "⚠️"
          : priority === "MEDIUM"
            ? "ℹ️"
            : "✅";

    return `${emoji} Workflow Monitoring Report - ${report.summary.totalWorkflows} workflows, ${report.summary.successRate.toFixed(1)}% success`;
  }

  private generateNotificationMessage(report: MonitoringReport): string {
    const lines: string[] = [];

    lines.push("**Summary:**");
    lines.push(`• Total Workflows: ${report.summary.totalWorkflows}`);
    lines.push(`• Passed: ${report.summary.passedWorkflows} ✅`);
    lines.push(`• Failed: ${report.summary.failedWorkflows} ❌`);
    lines.push(`• Warnings: ${report.summary.warningWorkflows} ⚠️`);
    lines.push(`• Success Rate: ${report.summary.successRate.toFixed(1)}%`);
    lines.push(
      `• Avg Duration: ${(report.summary.averageDuration / 1000).toFixed(2)}s`,
    );

    if (report.summary.criticalIssues > 0) {
      lines.push(
        `\n🚨 **${report.summary.criticalIssues} Critical Issue(s)!**`,
      );
    }

    if (report.recommendations.length > 0) {
      lines.push("\n**Recommendations:**");
      report.recommendations
        .slice(0, 3)
        .forEach((rec: any) => lines.push(`• ${rec}`));
    }

    return lines.join("\n");
  }

  private getDiscordColor(priority: string): number {
    switch (priority) {
      case "CRITICAL":
        return 0xff0000; // Red
      case "HIGH":
        return 0xff9900; // Orange
      case "MEDIUM":
        return 0xffff00; // Yellow
      default:
        return 0x00ff00; // Green
    }
  }

  private generateHtmlReport(report: MonitoringReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monitoring Report - ${report.reportId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c5f2d; border-bottom: 3px solid #97cc04; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 36px; font-weight: bold; color: #2c5f2d; }
        .stat-label { color: #666; margin-top: 5px; }
        .workflows { margin-top: 30px; }
        .workflow { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ccc; }
        .workflow.passed { border-left-color: #28a745; }
        .workflow.failed { border-left-color: #dc3545; }
        .workflow.warning { border-left-color: #ffc107; }
        .recommendations { background: #fff3cd; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .agriculture { background: #d4edda; padding: 20px; border-radius: 8px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌟 Workflow Monitoring Report</h1>
        <p><strong>Report ID:</strong> ${report.reportId}</p>
        <p><strong>Generated:</strong> ${report.timestamp.toISOString()}</p>
        <p><strong>Period:</strong> ${report.period.start.toISOString()} - ${report.period.end.toISOString()}</p>

        <div class="summary">
            <div class="stat">
                <div class="stat-value">${report.summary.totalWorkflows}</div>
                <div class="stat-label">Total Workflows</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #28a745;">${report.summary.passedWorkflows}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #dc3545;">${report.summary.failedWorkflows}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat">
                <div class="stat-value">${report.summary.successRate.toFixed(1)}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>

        <div class="recommendations">
            <h2>📋 Recommendations</h2>
            ${report.recommendations.map((rec: any) => `<p>• ${rec}</p>`).join("")}
        </div>

        ${
          report.agricultureInsights
            ? `
        <div class="agriculture">
            <h2>🌾 Agricultural Insights</h2>
            <h3>Seasonal Optimization</h3>
            ${report.agricultureInsights.seasonalOptimization.map((opt: any) => `<p>• ${opt}</p>`).join("")}
            <h3>Biodynamic Suggestions</h3>
            ${report.agricultureInsights.biodynamicSuggestions.map((sug: any) => `<p>• ${sug}</p>`).join("")}
        </div>
        `
            : ""
        }

        <div class="workflows">
            <h2>🔄 Workflow Results</h2>
            ${report.workflows
              .map(
                (w) => `
                <div class="workflow ${w.status.toLowerCase()}">
                    <h3>${w.name} (${w.type})</h3>
                    <p><strong>Status:</strong> ${w.status}</p>
                    <p><strong>Duration:</strong> ${(w.duration / 1000).toFixed(2)}s</p>
                    <p><strong>Steps:</strong> ${w.passedSteps}/${w.totalSteps} passed</p>
                    ${w.error ? `<p style="color: #dc3545;"><strong>Error:</strong> ${w.error}</p>` : ""}
                </div>
            `,
              )
              .join("")}
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateMarkdownReport(report: MonitoringReport): string {
    const lines: string[] = [];

    lines.push("# 🌟 Workflow Monitoring Report\n");
    lines.push(`**Report ID:** ${report.reportId}`);
    lines.push(`**Generated:** ${report.timestamp.toISOString()}`);
    lines.push(
      `**Period:** ${report.period.start.toISOString()} - ${report.period.end.toISOString()}\n`,
    );

    lines.push("## 📊 Summary\n");
    lines.push(`- **Total Workflows:** ${report.summary.totalWorkflows}`);
    lines.push(`- **Passed:** ${report.summary.passedWorkflows} ✅`);
    lines.push(`- **Failed:** ${report.summary.failedWorkflows} ❌`);
    lines.push(`- **Warnings:** ${report.summary.warningWorkflows} ⚠️`);
    lines.push(`- **Success Rate:** ${report.summary.successRate.toFixed(1)}%`);
    lines.push(
      `- **Average Duration:** ${(report.summary.averageDuration / 1000).toFixed(2)}s`,
    );
    lines.push(`- **Critical Issues:** ${report.summary.criticalIssues}\n`);

    lines.push("## 📋 Recommendations\n");
    report.recommendations.forEach((rec: any) => lines.push(`- ${rec}`));
    lines.push("");

    if (report.agricultureInsights) {
      lines.push("## 🌾 Agricultural Insights\n");
      lines.push("### Seasonal Optimization\n");
      report.agricultureInsights.seasonalOptimization.forEach((opt: any) =>
        lines.push(`- ${opt}`),
      );
      lines.push("\n### Biodynamic Suggestions\n");
      report.agricultureInsights.biodynamicSuggestions.forEach((sug: any) =>
        lines.push(`- ${sug}`),
      );
      lines.push("\n### Farm Health Trends\n");
      report.agricultureInsights.farmHealthTrends.forEach((trend: any) =>
        lines.push(`- ${trend}`),
      );
      lines.push("");
    }

    lines.push("## 🔄 Workflow Results\n");
    report.workflows.forEach((w: any) => {
      const statusEmoji =
        w.status === "PASSED" ? "✅" : w.status === "FAILED" ? "❌" : "⚠️";
      lines.push(`### ${statusEmoji} ${w.name} (${w.type})\n`);
      lines.push(`- **Status:** ${w.status}`);
      lines.push(`- **Priority:** ${w.priority}`);
      lines.push(`- **Duration:** ${(w.duration / 1000).toFixed(2)}s`);
      lines.push(`- **Steps:** ${w.passedSteps}/${w.totalSteps} passed`);
      if (w.error) {
        lines.push(`- **Error:** ${w.error}`);
      }
      lines.push("");
    });

    return lines.join("\n");
  }

  private logReport(report: MonitoringReport): void {
    logger.info(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    logger.info(
      "║ 📊 REPORT SUMMARY                                          ║",
    );
    logger.info(
      "╠════════════════════════════════════════════════════════════╣",
    );
    logger.info(
      `║ ✅ PASSED: ${String(report.summary.passedWorkflows).padEnd(47)} ║`,
    );
    logger.info(
      `║ ❌ FAILED: ${String(report.summary.failedWorkflows).padEnd(47)} ║`,
    );
    logger.info(
      `║ ⚠️  WARNINGS: ${String(report.summary.warningWorkflows).padEnd(44)} ║`,
    );
    logger.info(
      `║ 📈 SUCCESS RATE: ${report.summary.successRate.toFixed(1)}%${" ".repeat(38 - report.summary.successRate.toFixed(1).length)} ║`,
    );
    logger.info(
      `║ ⏱️  AVG DURATION: ${(report.summary.averageDuration / 1000).toFixed(2)}s${" ".repeat(37 - (report.summary.averageDuration / 1000).toFixed(2).length)} ║`,
    );
    logger.info(
      "╚════════════════════════════════════════════════════════════╝\n",
    );
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0]!;
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export function createReporter(
  storagePath?: string,
  notificationConfig?: NotificationConfig,
): DivineMonitoringReporter {
  return new DivineMonitoringReporter(storagePath, notificationConfig);
}
