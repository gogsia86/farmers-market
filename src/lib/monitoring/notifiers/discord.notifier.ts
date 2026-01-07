/**
 * 🌟 Divine Discord Notifier
 * Farmers Market Platform - Real-time Workflow Notifications via Discord
 * Version: 1.0.0
 *
 * Sends beautifully formatted Discord notifications for workflow monitoring
 * with agricultural consciousness and divine precision.
 */

import { logger } from '@/lib/monitoring/logger';
import type {
  MonitoringReport,
  NotificationConfig,
  WorkflowPriority,
  WorkflowResult,
} from "../types";

// ============================================================================
// TYPES
// ============================================================================

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
  author?: {
    name: string;
    icon_url?: string;
  };
}

interface DiscordMessage {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
}

interface DiscordNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

// ============================================================================
// DISCORD NOTIFIER CLASS
// ============================================================================

export class DiscordNotifier {
  private webhookUrl: string;
  private username: string;
  private avatarUrl?: string;
  private enabled: boolean;

  constructor(config?: NotificationConfig["discord"]) {
    this.webhookUrl =
      config?.webhookUrl || process.env.DISCORD_WEBHOOK_URL || "";
    this.username = config?.username || "Divine Workflow Monitor 🌾";
    this.avatarUrl = config?.avatarUrl || process.env.DISCORD_AVATAR_URL;
    this.enabled = !!this.webhookUrl;

    if (!this.enabled) {
      logger.warn(
        "⚠️  Discord notifications disabled: DISCORD_WEBHOOK_URL not configured",
      );
    }
  }

  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Send workflow failure notification
   */
  async notifyWorkflowFailure(
    workflow: WorkflowResult,
  ): Promise<DiscordNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Discord notifications not enabled",
        timestamp: new Date(),
      };
    }

    const message = this.buildWorkflowFailureMessage(workflow);
    return await this.sendMessage(message);
  }

  /**
   * Send workflow success notification (for critical workflows only)
   */
  async notifyWorkflowSuccess(
    workflow: WorkflowResult,
  ): Promise<DiscordNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Discord notifications not enabled",
        timestamp: new Date(),
      };
    }

    // Only notify on success for CRITICAL workflows
    if (workflow.priority !== "CRITICAL") {
      return {
        success: true,
        timestamp: new Date(),
      };
    }

    const message = this.buildWorkflowSuccessMessage(workflow);
    return await this.sendMessage(message);
  }

  /**
   * Send monitoring report summary
   */
  async notifyReportSummary(
    report: MonitoringReport,
  ): Promise<DiscordNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Discord notifications not enabled",
        timestamp: new Date(),
      };
    }

    const message = this.buildReportSummaryMessage(report);
    return await this.sendMessage(message);
  }

  /**
   * Send critical alert
   */
  async sendCriticalAlert(
    title: string,
    message: string,
    details?: Record<string, any>,
  ): Promise<DiscordNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Discord notifications not enabled",
        timestamp: new Date(),
      };
    }

    const discordMessage = this.buildCriticalAlertMessage(
      title,
      message,
      details,
    );
    return await this.sendMessage(discordMessage);
  }

  /**
   * Send daily summary report
   */
  async sendDailySummary(
    report: MonitoringReport,
  ): Promise<DiscordNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Discord notifications not enabled",
        timestamp: new Date(),
      };
    }

    const message = this.buildDailySummaryMessage(report);
    return await this.sendMessage(message);
  }

  /**
   * Test Discord connection
   */
  async testConnection(): Promise<DiscordNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Discord notifications not enabled",
        timestamp: new Date(),
      };
    }

    const message: DiscordMessage = {
      username: this.username,
      avatar_url: this.avatarUrl,
      embeds: [
        {
          title: "✅ Connection Test Successful",
          description:
            "The Divine Workflow Monitor is now connected and ready to send notifications! 🚀",
          color: 0x00ff00,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Divine Workflow Monitor",
          },
        },
      ],
    };

    return await this.sendMessage(message);
  }

  // ==========================================================================
  // PRIVATE MESSAGE BUILDERS
  // ==========================================================================

  private buildWorkflowFailureMessage(
    workflow: WorkflowResult,
  ): DiscordMessage {
    const emoji = this.getPriorityEmoji(workflow.priority);
    const color = this.getStatusColor("FAILED");
    const duration = (workflow.duration / 1000).toFixed(2);

    return {
      username: this.username,
      avatar_url: this.avatarUrl,
      content: `${emoji} **Workflow Failed: ${workflow.name}**`,
      embeds: [
        {
          title: `${emoji} Workflow Failure Alert`,
          description: `**${workflow.name}** has failed execution`,
          color,
          fields: [
            {
              name: "Status",
              value: "❌ FAILED",
              inline: true,
            },
            {
              name: "Priority",
              value: `${emoji} ${workflow.priority}`,
              inline: true,
            },
            {
              name: "Duration",
              value: `⏱️ ${duration}s`,
              inline: true,
            },
            {
              name: "Failed Steps",
              value: `${workflow.failedSteps}/${workflow.totalSteps}`,
              inline: true,
            },
            {
              name: "Run ID",
              value: `\`${workflow.runId}\``,
              inline: true,
            },
            {
              name: "Workflow Type",
              value: workflow.type,
              inline: true,
            },
            {
              name: "Error",
              value: `\`\`\`${workflow.error || "Unknown error"}\`\`\``,
              inline: false,
            },
          ],
          timestamp: workflow.endTime.toISOString(),
          footer: {
            text: "Divine Workflow Monitor",
          },
        },
      ],
    };
  }

  private buildWorkflowSuccessMessage(
    workflow: WorkflowResult,
  ): DiscordMessage {
    // const emoji = this.getPriorityEmoji(workflow.priority);
    const color = this.getStatusColor("PASSED");
    const duration = (workflow.duration / 1000).toFixed(2);

    return {
      username: this.username,
      avatar_url: this.avatarUrl,
      embeds: [
        {
          title: "✅ Critical Workflow Success",
          description: `**${workflow.name}** completed successfully`,
          color,
          fields: [
            {
              name: "Duration",
              value: `⏱️ ${duration}s`,
              inline: true,
            },
            {
              name: "Steps Passed",
              value: `${workflow.passedSteps}/${workflow.totalSteps}`,
              inline: true,
            },
            {
              name: "Run ID",
              value: `\`${workflow.runId}\``,
              inline: false,
            },
          ],
          timestamp: workflow.endTime.toISOString(),
          footer: {
            text: "Divine Workflow Monitor",
          },
        },
      ],
    };
  }

  private buildReportSummaryMessage(report: MonitoringReport): DiscordMessage {
    const { summary } = report;
    const successRate = summary.successRate.toFixed(1);
    const emoji =
      summary.successRate >= 95
        ? "🎉"
        : summary.successRate >= 80
          ? "⚠️"
          : "🚨";
    const color =
      summary.successRate >= 95
        ? 0x00ff00
        : summary.successRate >= 80
          ? 0xffa500
          : 0xff0000;

    return {
      username: this.username,
      avatar_url: this.avatarUrl,
      embeds: [
        {
          title: `${emoji} Workflow Monitoring Report`,
          description: `Success Rate: **${successRate}%**`,
          color,
          fields: [
            {
              name: "Total Workflows",
              value: summary.totalWorkflows.toString(),
              inline: true,
            },
            {
              name: "Passed",
              value: `✅ ${summary.passedWorkflows}`,
              inline: true,
            },
            {
              name: "Failed",
              value: `❌ ${summary.failedWorkflows}`,
              inline: true,
            },
            {
              name: "Warnings",
              value: `⚠️ ${summary.warningWorkflows}`,
              inline: true,
            },
            {
              name: "Avg Duration",
              value: `⏱️ ${(summary.averageDuration / 1000).toFixed(2)}s`,
              inline: true,
            },
            {
              name: "Critical Issues",
              value:
                summary.criticalIssues > 0
                  ? `🚨 ${summary.criticalIssues}`
                  : "✅ None",
              inline: true,
            },
          ],
          timestamp: report.timestamp.toISOString(),
          footer: {
            text: `Report ID: ${report.reportId}`,
          },
        },
      ],
    };
  }

  private buildCriticalAlertMessage(
    title: string,
    message: string,
    details?: Record<string, any>,
  ): DiscordMessage {
    const fields: Array<{ name: string; value: string; inline?: boolean }> = [
      {
        name: "Message",
        value: message,
        inline: false,
      },
    ];

    if (details) {
      Object.entries(details).forEach(([key, value]) => {
        fields.push({
          name: key,
          value: JSON.stringify(value, null, 2),
          inline: false,
        });
      });
    }

    return {
      username: this.username,
      avatar_url: this.avatarUrl,
      content: "🚨 **CRITICAL ALERT**",
      embeds: [
        {
          title: `🚨 ${title}`,
          description: "Critical system alert requires immediate attention",
          color: 0xff0000,
          fields,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Divine Workflow Monitor - Critical Alert",
          },
        },
      ],
    };
  }

  private buildDailySummaryMessage(report: MonitoringReport): DiscordMessage {
    const { summary, trends } = report;
    const successRate = summary.successRate.toFixed(1);
    const emoji =
      summary.successRate >= 95
        ? "🌟"
        : summary.successRate >= 80
          ? "⚡"
          : "🔧";
    const color =
      summary.successRate >= 95
        ? 0x00ff00
        : summary.successRate >= 80
          ? 0xffa500
          : 0xff0000;

    const trendText = this.formatTrends(trends);
    const recommendationsText = report.recommendations
      .slice(0, 5)
      .map((r) => `• ${r}`)
      .join("\n");

    const periodText = `${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}`;

    return {
      username: this.username,
      avatar_url: this.avatarUrl,
      embeds: [
        {
          title: `${emoji} Daily Workflow Monitoring Summary`,
          description: `**Period:** ${periodText}\n**Success Rate:** ${successRate}%`,
          color,
          fields: [
            {
              name: "📊 Statistics",
              value: [
                `Total Workflows: **${summary.totalWorkflows}**`,
                `Passed: ✅ **${summary.passedWorkflows}**`,
                `Failed: ❌ **${summary.failedWorkflows}**`,
                `Avg Duration: ⏱️ **${(summary.averageDuration / 1000).toFixed(2)}s**`,
                `Critical Issues: ${summary.criticalIssues > 0 ? `🚨 **${summary.criticalIssues}**` : "✅ **0**"}`,
              ].join("\n"),
              inline: false,
            },
            {
              name: "📈 Trends",
              value: trendText,
              inline: false,
            },
            {
              name: "💡 Top Recommendations",
              value:
                recommendationsText || "✅ All systems operating optimally",
              inline: false,
            },
          ],
          timestamp: report.timestamp.toISOString(),
          footer: {
            text: `Report ID: ${report.reportId}`,
          },
        },
      ],
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private async sendMessage(
    message: DiscordMessage,
  ): Promise<DiscordNotificationResult> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} - ${errorText}`);
      }

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Failed to send Discord notification:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  private getPriorityEmoji(priority: WorkflowPriority): string {
    const emojiMap: Record<WorkflowPriority, string> = {
      CRITICAL: "🚨",
      HIGH: "⚠️",
      MEDIUM: "ℹ️",
      LOW: "📝",
    };
    return emojiMap[priority] || "ℹ️";
  }

  private getStatusColor(status: string): number {
    const colorMap: Record<string, number> = {
      PASSED: 0x00ff00,
      FAILED: 0xff0000,
      WARNING: 0xffa500,
      SKIPPED: 0x808080,
    };
    return colorMap[status] || 0x808080;
  }

  private formatTrends(trends: MonitoringReport["trends"]): string {
    const { successRateTrend, performanceTrend, errorRateTrend } = trends;

    const formatTrend = (value: number, name: string): string => {
      const arrow = value > 0 ? "📈" : value < 0 ? "📉" : "➡️";
      const sign = value > 0 ? "+" : "";
      return `${arrow} ${name}: ${sign}${value.toFixed(1)}%`;
    };

    return [
      formatTrend(successRateTrend, "Success Rate"),
      formatTrend(performanceTrend, "Performance"),
      formatTrend(errorRateTrend, "Error Rate"),
    ].join("\n");
  }

  /**
   * Check if notifier is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get configuration status
   */
  getStatus(): {
    enabled: boolean;
    webhookConfigured: boolean;
    avatarConfigured: boolean;
  } {
    return {
      enabled: this.enabled,
      webhookConfigured: !!this.webhookUrl,
      avatarConfigured: !!this.avatarUrl,
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new Discord notifier instance
 */
export function createDiscordNotifier(
  config?: NotificationConfig["discord"],
): DiscordNotifier {
  return new DiscordNotifier(config);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { DiscordEmbed, DiscordMessage, DiscordNotificationResult };

