/**
 * 🌟 Divine Notification Manager
 * Farmers Market Platform - Unified Notification Interface
 * Version: 1.0.0
 *
 * Manages all notification channels (Slack, Discord, Email)
 * with agricultural consciousness and divine precision.
 */

import type {
  MonitoringReport,
  Notification,
  NotificationConfig,
  WorkflowResult,
} from "../types";
import { SlackNotifier } from "./slack.notifier";
import { DiscordNotifier } from "./discord.notifier";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationResult {
  channel: string;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface NotificationManagerConfig {
  slack?: NotificationConfig["slack"];
  discord?: NotificationConfig["discord"];
  enabledChannels?: string[];
  throttle?: {
    maxPerHour?: number;
    maxPerDay?: number;
  };
}

// ============================================================================
// NOTIFICATION MANAGER
// ============================================================================

export class NotificationManager {
  private slack: SlackNotifier;
  private discord: DiscordNotifier;
  private enabledChannels: Set<string>;
  private notificationHistory: Notification[] = [];
  private throttleConfig: {
    maxPerHour: number;
    maxPerDay: number;
  };

  constructor(config?: NotificationManagerConfig) {
    this.slack = new SlackNotifier(config?.slack);
    this.discord = new DiscordNotifier(config?.discord);

    this.enabledChannels = new Set(
      config?.enabledChannels || ["slack", "discord"],
    );

    this.throttleConfig = {
      maxPerHour: config?.throttle?.maxPerHour || 10,
      maxPerDay: config?.throttle?.maxPerDay || 100,
    };
  }

  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Notify about workflow failure across all enabled channels
   */
  async notifyWorkflowFailure(
    workflow: WorkflowResult,
  ): Promise<NotificationResult[]> {
    if (!this.shouldNotify("failure", workflow.priority)) {
      return [];
    }

    const results: NotificationResult[] = [];

    // Send to Slack
    if (this.isChannelEnabled("slack") && this.slack.isEnabled()) {
      const slackResult = await this.slack.notifyWorkflowFailure(workflow);
      results.push({
        channel: "slack",
        success: slackResult.success,
        error: slackResult.error,
        timestamp: slackResult.timestamp,
      });
    }

    // Send to Discord
    if (this.isChannelEnabled("discord") && this.discord.isEnabled()) {
      const discordResult = await this.discord.notifyWorkflowFailure(workflow);
      results.push({
        channel: "discord",
        success: discordResult.success,
        error: discordResult.error,
        timestamp: discordResult.timestamp,
      });
    }

    // Record notification
    this.recordNotification({
      id: this.generateNotificationId(),
      timestamp: new Date(),
      channel: "ALL",
      priority: workflow.priority,
      title: `Workflow Failed: ${workflow.name}`,
      message: workflow.error || "Unknown error",
      workflowResult: workflow,
      sent: results.some((r) => r.success),
    });

    return results;
  }

  /**
   * Notify about workflow success (CRITICAL workflows only)
   */
  async notifyWorkflowSuccess(
    workflow: WorkflowResult,
  ): Promise<NotificationResult[]> {
    // Only notify success for CRITICAL workflows
    if (workflow.priority !== "CRITICAL") {
      return [];
    }

    if (!this.shouldNotify("success", workflow.priority)) {
      return [];
    }

    const results: NotificationResult[] = [];

    // Send to Slack
    if (this.isChannelEnabled("slack") && this.slack.isEnabled()) {
      const slackResult = await this.slack.notifyWorkflowSuccess(workflow);
      results.push({
        channel: "slack",
        success: slackResult.success,
        error: slackResult.error,
        timestamp: slackResult.timestamp,
      });
    }

    // Send to Discord
    if (this.isChannelEnabled("discord") && this.discord.isEnabled()) {
      const discordResult = await this.discord.notifyWorkflowSuccess(workflow);
      results.push({
        channel: "discord",
        success: discordResult.success,
        error: discordResult.error,
        timestamp: discordResult.timestamp,
      });
    }

    // Record notification
    this.recordNotification({
      id: this.generateNotificationId(),
      timestamp: new Date(),
      channel: "ALL",
      priority: workflow.priority,
      title: `Workflow Passed: ${workflow.name}`,
      message: "Workflow completed successfully",
      workflowResult: workflow,
      sent: results.some((r) => r.success),
    });

    return results;
  }

  /**
   * Send monitoring report summary
   */
  async sendReportSummary(
    report: MonitoringReport,
  ): Promise<NotificationResult[]> {
    if (!this.shouldNotify("report", "HIGH")) {
      return [];
    }

    const results: NotificationResult[] = [];

    // Send to Slack
    if (this.isChannelEnabled("slack") && this.slack.isEnabled()) {
      const slackResult = await this.slack.notifyReportSummary(report);
      results.push({
        channel: "slack",
        success: slackResult.success,
        error: slackResult.error,
        timestamp: slackResult.timestamp,
      });
    }

    // Send to Discord
    if (this.isChannelEnabled("discord") && this.discord.isEnabled()) {
      const discordResult = await this.discord.notifyReportSummary(report);
      results.push({
        channel: "discord",
        success: discordResult.success,
        error: discordResult.error,
        timestamp: discordResult.timestamp,
      });
    }

    // Record notification
    this.recordNotification({
      id: this.generateNotificationId(),
      timestamp: new Date(),
      channel: "ALL",
      priority: "HIGH",
      title: "Monitoring Report Summary",
      message: `Success Rate: ${report.summary.successRate.toFixed(1)}%`,
      report,
      sent: results.some((r) => r.success),
    });

    return results;
  }

  /**
   * Send critical alert across all channels
   */
  async sendCriticalAlert(
    title: string,
    message: string,
    details?: Record<string, any>,
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // Send to Slack (always for critical alerts)
    if (this.slack.isEnabled()) {
      const slackResult = await this.slack.sendCriticalAlert(
        title,
        message,
        details,
      );
      results.push({
        channel: "slack",
        success: slackResult.success,
        error: slackResult.error,
        timestamp: slackResult.timestamp,
      });
    }

    // Send to Discord (always for critical alerts)
    if (this.discord.isEnabled()) {
      const discordResult = await this.discord.sendCriticalAlert(
        title,
        message,
        details,
      );
      results.push({
        channel: "discord",
        success: discordResult.success,
        error: discordResult.error,
        timestamp: discordResult.timestamp,
      });
    }

    // Record notification
    this.recordNotification({
      id: this.generateNotificationId(),
      timestamp: new Date(),
      channel: "ALL",
      priority: "CRITICAL",
      title: `CRITICAL: ${title}`,
      message,
      sent: results.some((r) => r.success),
    });

    return results;
  }

  /**
   * Send daily summary report
   */
  async sendDailySummary(
    report: MonitoringReport,
  ): Promise<NotificationResult[]> {
    if (!this.shouldNotify("daily", "MEDIUM")) {
      return [];
    }

    const results: NotificationResult[] = [];

    // Send to Slack
    if (this.isChannelEnabled("slack") && this.slack.isEnabled()) {
      const slackResult = await this.slack.sendDailySummary(report);
      results.push({
        channel: "slack",
        success: slackResult.success,
        error: slackResult.error,
        timestamp: slackResult.timestamp,
      });
    }

    // Send to Discord
    if (this.isChannelEnabled("discord") && this.discord.isEnabled()) {
      const discordResult = await this.discord.sendDailySummary(report);
      results.push({
        channel: "discord",
        success: discordResult.success,
        error: discordResult.error,
        timestamp: discordResult.timestamp,
      });
    }

    // Record notification
    this.recordNotification({
      id: this.generateNotificationId(),
      timestamp: new Date(),
      channel: "ALL",
      priority: "MEDIUM",
      title: "Daily Summary Report",
      message: `Success Rate: ${report.summary.successRate.toFixed(1)}%`,
      report,
      sent: results.some((r) => r.success),
    });

    return results;
  }

  /**
   * Test all notification channels
   */
  async testAllChannels(): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    logger.info("🧪 Testing notification channels...\n");

    // Test Slack
    if (this.slack.isEnabled()) {
      logger.info("📨 Testing Slack...");
      const slackResult = await this.slack.testConnection();
      results.push({
        channel: "slack",
        success: slackResult.success,
        error: slackResult.error,
        timestamp: slackResult.timestamp,
      });
      logger.info(
        slackResult.success
          ? "✅ Slack: Connected"
          : `❌ Slack: ${slackResult.error}`,
      );
    } else {
      logger.info("⏭️  Slack: Disabled (SLACK_WEBHOOK_URL not configured)");
    }

    // Test Discord
    if (this.discord.isEnabled()) {
      logger.info("📨 Testing Discord...");
      const discordResult = await this.discord.testConnection();
      results.push({
        channel: "discord",
        success: discordResult.success,
        error: discordResult.error,
        timestamp: discordResult.timestamp,
      });
      logger.info(
        discordResult.success
          ? "✅ Discord: Connected"
          : `❌ Discord: ${discordResult.error}`,
      );
    } else {
      logger.info("⏭️  Discord: Disabled (DISCORD_WEBHOOK_URL not configured)");
    }

    logger.info("\n✨ Notification channel test complete!");

    return results;
  }

  // ==========================================================================
  // CONFIGURATION & STATUS
  // ==========================================================================

  /**
   * Get status of all notification channels
   */
  getStatus(): {
    slack: ReturnType<SlackNotifier["getStatus"]>;
    discord: ReturnType<DiscordNotifier["getStatus"]>;
    enabledChannels: string[];
    notificationHistory: number;
  } {
    return {
      slack: this.slack.getStatus(),
      discord: this.discord.getStatus(),
      enabledChannels: Array.from(this.enabledChannels),
      notificationHistory: this.notificationHistory.length,
    };
  }

  /**
   * Enable a notification channel
   */
  enableChannel(channel: string): void {
    this.enabledChannels.add(channel.toLowerCase());
  }

  /**
   * Disable a notification channel
   */
  disableChannel(channel: string): void {
    this.enabledChannels.delete(channel.toLowerCase());
  }

  /**
   * Check if channel is enabled
   */
  isChannelEnabled(channel: string): boolean {
    return this.enabledChannels.has(channel.toLowerCase());
  }

  /**
   * Get notification history
   */
  getNotificationHistory(limit: number = 100): Notification[] {
    return this.notificationHistory.slice(-limit);
  }

  /**
   * Clear notification history
   */
  clearHistory(): void {
    this.notificationHistory = [];
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private shouldNotify(
    type: "failure" | "success" | "report" | "daily",
    priority: string,
  ): boolean {
    // Check throttle limits
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentNotifications = this.notificationHistory.filter(
      (n) => n.timestamp >= oneHourAgo,
    );

    const dailyNotifications = this.notificationHistory.filter(
      (n) => n.timestamp >= oneDayAgo,
    );

    if (recentNotifications.length >= this.throttleConfig.maxPerHour) {
      logger.warn("⚠️  Notification throttled: Max per hour limit reached");
      return false;
    }

    if (dailyNotifications.length >= this.throttleConfig.maxPerDay) {
      logger.warn("⚠️  Notification throttled: Max per day limit reached");
      return false;
    }

    // Always notify for CRITICAL priority
    if (priority === "CRITICAL") {
      return true;
    }

    // Type-specific rules
    if (type === "failure") {
      return true; // Always notify on failure
    }

    if (type === "success" && priority === "CRITICAL") {
      return true; // Only success for critical
    }

    if (type === "report" || type === "daily") {
      return true; // Always send reports
    }

    return false;
  }

  private recordNotification(notification: Notification): void {
    this.notificationHistory.push(notification);

    // Keep only last 1000 notifications
    if (this.notificationHistory.length > 1000) {
      this.notificationHistory = this.notificationHistory.slice(-1000);
    }
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new notification manager instance
 */
export function createNotificationManager(
  config?: NotificationManagerConfig,
): NotificationManager {
  return new NotificationManager(config);
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let notificationManagerInstance: NotificationManager | null = null;

/**
 * Get or create singleton notification manager instance
 */
export function getNotificationManager(
  config?: NotificationManagerConfig,
): NotificationManager {
  if (!notificationManagerInstance) {
    notificationManagerInstance = new NotificationManager(config);
  }
  return notificationManagerInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { SlackNotifier } from "./slack.notifier";
export { DiscordNotifier } from "./discord.notifier";
