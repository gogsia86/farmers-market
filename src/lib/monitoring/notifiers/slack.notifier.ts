/**
 * 🌟 Divine Slack Notifier
 * Farmers Market Platform - Real-time Workflow Notifications
 * Version: 1.0.0
 *
 * Sends beautifully formatted Slack notifications for workflow monitoring
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

interface SlackMessageBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  elements?: Array<{
    type: string;
    text: string;
    emoji?: boolean;
  }>;
  fields?: Array<{
    type: string;
    text: string;
  }>;
  accessory?: {
    type: string;
    text: {
      type: string;
      text: string;
    };
    url: string;
  };
}

interface SlackMessage {
  text: string;
  blocks?: SlackMessageBlock[];
  username?: string;
  icon_emoji?: string;
  channel?: string;
}

interface SlackNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

// ============================================================================
// SLACK NOTIFIER CLASS
// ============================================================================

export class SlackNotifier {
  private webhookUrl: string;
  private channel?: string;
  private username: string;
  private iconEmoji: string;
  private enabled: boolean;

  constructor(config?: NotificationConfig["slack"]) {
    this.webhookUrl = config?.webhookUrl || process.env.SLACK_WEBHOOK_URL || "";
    this.channel = config?.channel || process.env.SLACK_CHANNEL;
    this.username = config?.username || "Divine Workflow Monitor 🌾";
    this.iconEmoji = ":tractor:";
    this.enabled = !!this.webhookUrl;

    if (!this.enabled) {
      logger.warn(
        "⚠️  Slack notifications disabled: SLACK_WEBHOOK_URL not configured",
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
  ): Promise<SlackNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Slack notifications not enabled",
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
  ): Promise<SlackNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Slack notifications not enabled",
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
  ): Promise<SlackNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Slack notifications not enabled",
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
  ): Promise<SlackNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Slack notifications not enabled",
        timestamp: new Date(),
      };
    }

    const slackMessage = this.buildCriticalAlertMessage(
      title,
      message,
      details,
    );
    return await this.sendMessage(slackMessage);
  }

  /**
   * Send daily summary report
   */
  async sendDailySummary(
    report: MonitoringReport,
  ): Promise<SlackNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Slack notifications not enabled",
        timestamp: new Date(),
      };
    }

    const message = this.buildDailySummaryMessage(report);
    return await this.sendMessage(message);
  }

  /**
   * Test Slack connection
   */
  async testConnection(): Promise<SlackNotificationResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: "Slack notifications not enabled",
        timestamp: new Date(),
      };
    }

    const message: SlackMessage = {
      text: "🌾 Divine Workflow Monitor - Connection Test",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "✅ Connection Test Successful",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "The Divine Workflow Monitor is now connected and ready to send notifications! 🚀",
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `_Timestamp: ${new Date().toISOString()}_`,
            },
          ],
        },
      ],
    };

    return await this.sendMessage(message);
  }

  // ==========================================================================
  // PRIVATE MESSAGE BUILDERS
  // ==========================================================================

  private buildWorkflowFailureMessage(workflow: WorkflowResult): SlackMessage {
    const emoji = this.getPriorityEmoji(workflow.priority);
    // const color = this.getStatusColor("FAILED");
    const duration = (workflow.duration / 1000).toFixed(2);

    return {
      text: `${emoji} Workflow Failed: ${workflow.name}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${emoji} Workflow Failed: ${workflow.name}`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Status:*\n❌ FAILED",
            },
            {
              type: "mrkdwn",
              text: `*Priority:*\n${emoji} ${workflow.priority}`,
            },
            {
              type: "mrkdwn",
              text: `*Duration:*\n⏱️ ${duration}s`,
            },
            {
              type: "mrkdwn",
              text: `*Failed Steps:*\n${workflow.failedSteps}/${workflow.totalSteps}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Error:*\n\`\`\`${workflow.error || "Unknown error"}\`\`\``,
          },
        },
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🆔 Run ID: \`${workflow.runId}\` | 🕐 ${new Date(workflow.endTime).toLocaleString()}`,
            },
          ],
        },
      ],
      username: this.username,
      icon_emoji: this.iconEmoji,
      channel: this.channel,
    };
  }

  private buildWorkflowSuccessMessage(workflow: WorkflowResult): SlackMessage {
    // const emoji = this.getPriorityEmoji(workflow.priority);
    const duration = (workflow.duration / 1000).toFixed(2);

    return {
      text: `✅ Critical Workflow Passed: ${workflow.name}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `✅ *${workflow.name}* completed successfully\n⏱️ Duration: ${duration}s | ${workflow.passedSteps}/${workflow.totalSteps} steps passed`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🆔 Run ID: \`${workflow.runId}\` | 🕐 ${new Date(workflow.endTime).toLocaleString()}`,
            },
          ],
        },
      ],
      username: this.username,
      icon_emoji: this.iconEmoji,
      channel: this.channel,
    };
  }

  private buildReportSummaryMessage(report: MonitoringReport): SlackMessage {
    const { summary } = report;
    const successRate = summary.successRate.toFixed(1);
    const emoji =
      summary.successRate >= 95
        ? "🎉"
        : summary.successRate >= 80
          ? "⚠️"
          : "🚨";

    return {
      text: `${emoji} Monitoring Report: ${successRate}% Success Rate`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${emoji} Workflow Monitoring Report`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Total Workflows:*\n${summary.totalWorkflows}`,
            },
            {
              type: "mrkdwn",
              text: `*Success Rate:*\n${successRate}%`,
            },
            {
              type: "mrkdwn",
              text: `*Passed:*\n✅ ${summary.passedWorkflows}`,
            },
            {
              type: "mrkdwn",
              text: `*Failed:*\n❌ ${summary.failedWorkflows}`,
            },
            {
              type: "mrkdwn",
              text: `*Warnings:*\n⚠️ ${summary.warningWorkflows}`,
            },
            {
              type: "mrkdwn",
              text: `*Avg Duration:*\n⏱️ ${(summary.averageDuration / 1000).toFixed(2)}s`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Critical Issues:*\n${summary.criticalIssues > 0 ? `🚨 ${summary.criticalIssues} critical issues detected` : "✅ No critical issues"}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `📊 Report ID: \`${report.reportId}\` | 🕐 ${new Date(report.timestamp).toLocaleString()}`,
            },
          ],
        },
      ],
      username: this.username,
      icon_emoji: this.iconEmoji,
      channel: this.channel,
    };
  }

  private buildCriticalAlertMessage(
    title: string,
    message: string,
    details?: Record<string, any>,
  ): SlackMessage {
    const blocks: SlackMessageBlock[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🚨 CRITICAL ALERT: ${title}`,
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Message:*\n${message}`,
        },
      },
    ];

    if (details) {
      const detailsText = Object.entries(details)
        .map(([key, value]) => `*${key}:* ${JSON.stringify(value)}`)
        .join("\n");

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Details:*\n${detailsText}`,
        },
      });
    }

    blocks.push(
      {
        type: "divider",
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🕐 ${new Date().toLocaleString()}`,
          },
        ],
      },
    );

    return {
      text: `🚨 CRITICAL: ${title}`,
      blocks,
      username: this.username,
      icon_emoji: ":rotating_light:",
      channel: this.channel,
    };
  }

  private buildDailySummaryMessage(report: MonitoringReport): SlackMessage {
    const { summary, trends } = report;
    const successRate = summary.successRate.toFixed(1);
    const emoji =
      summary.successRate >= 95
        ? "🌟"
        : summary.successRate >= 80
          ? "⚡"
          : "🔧";

    const trendText = this.formatTrends(trends);
    const recommendationsText = report.recommendations
      .slice(0, 5)
      .map((r) => `• ${r}`)
      .join("\n");

    return {
      text: `${emoji} Daily Monitoring Summary - ${successRate}% Success Rate`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${emoji} Daily Workflow Monitoring Summary`,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Period:* ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Total Workflows:*\n${summary.totalWorkflows}`,
            },
            {
              type: "mrkdwn",
              text: `*Success Rate:*\n${successRate}%`,
            },
            {
              type: "mrkdwn",
              text: `*Passed:*\n✅ ${summary.passedWorkflows}`,
            },
            {
              type: "mrkdwn",
              text: `*Failed:*\n❌ ${summary.failedWorkflows}`,
            },
            {
              type: "mrkdwn",
              text: `*Avg Duration:*\n⏱️ ${(summary.averageDuration / 1000).toFixed(2)}s`,
            },
            {
              type: "mrkdwn",
              text: `*Critical Issues:*\n${summary.criticalIssues > 0 ? `🚨 ${summary.criticalIssues}` : "✅ 0"}`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Trends:*\n${trendText}`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Top Recommendations:*\n${recommendationsText || "✅ All systems operating optimally"}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `📊 Report ID: \`${report.reportId}\` | 🕐 ${new Date(report.timestamp).toLocaleString()}`,
            },
          ],
        },
      ],
      username: this.username,
      icon_emoji: this.iconEmoji,
      channel: this.channel,
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private async sendMessage(
    message: SlackMessage,
  ): Promise<SlackNotificationResult> {
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
        throw new Error(`Slack API error: ${response.status} - ${errorText}`);
      }

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Failed to send Slack notification:", {
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

  // private getStatusColor(status: string): string {
  //   const colorMap: Record<string, string> = {
  //     PASSED: "#36a64f",
  //     FAILED: "#d9534f",
  //     WARNING: "#f0ad4e",
  //     SKIPPED: "#5bc0de",
  //   };
  //   return colorMap[status] || "#808080";
  // }

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
    channelConfigured: boolean;
  } {
    return {
      enabled: this.enabled,
      webhookConfigured: !!this.webhookUrl,
      channelConfigured: !!this.channel,
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new Slack notifier instance
 */
export function createSlackNotifier(
  config?: NotificationConfig["slack"],
): SlackNotifier {
  return new SlackNotifier(config);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { SlackMessage, SlackNotificationResult };
