/**
 * 📢 Slack Notification Helper
 * Sends notifications to Slack channels for CI/CD, monitoring, and alerts
 * @reference .github/instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md
 */

import https from "https";

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface SlackNotificationConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
  iconUrl?: string;
}

export interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  threadTs?: string;
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  accessory?: any;
}

export interface SlackAttachment {
  color?: string;
  pretext?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  footer?: string;
  footer_icon?: string;
  ts?: number;
}

// ============================================================================
// SLACK NOTIFIER CLASS
// ============================================================================

export class SlackNotifier {
  private webhookUrl: string;
  private defaultChannel?: string;
  private defaultUsername: string;
  private defaultIconEmoji: string;

  constructor(config: SlackNotificationConfig) {
    this.webhookUrl = config.webhookUrl;
    this.defaultChannel = config.channel;
    this.defaultUsername = config.username || "Farmers Market Bot";
    this.defaultIconEmoji = config.iconEmoji || ":tractor:";
  }

  /**
   * Send a simple text message
   */
  async sendText(text: string): Promise<void> {
    await this.send({ text });
  }

  /**
   * Send a structured message with blocks
   */
  async send(message: SlackMessage): Promise<void> {
    const payload = {
      text: message.text,
      blocks: message.blocks,
      attachments: message.attachments,
      username: this.defaultUsername,
      icon_emoji: this.defaultIconEmoji,
      channel: this.defaultChannel,
      thread_ts: message.threadTs,
    };

    await this.postToSlack(payload);
  }

  /**
   * Send a success notification
   */
  async sendSuccess(title: string, details?: string): Promise<void> {
    const message: SlackMessage = {
      text: `✅ ${title}`,
      attachments: [
        {
          color: "#36a64f",
          title: `✅ ${title}`,
          text: details,
          footer: "Farmers Market Platform",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.send(message);
  }

  /**
   * Send an error notification
   */
  async sendError(
    title: string,
    error: Error | string,
    details?: string,
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : error;
    const stackTrace = error instanceof Error ? error.stack : undefined;

    const message: SlackMessage = {
      text: `❌ ${title}`,
      attachments: [
        {
          color: "#ff0000",
          title: `❌ ${title}`,
          text: details || errorMessage,
          fields: stackTrace
            ? [
                {
                  title: "Stack Trace",
                  value: `\`\`\`${stackTrace.substring(0, 500)}\`\`\``,
                  short: false,
                },
              ]
            : undefined,
          footer: "Farmers Market Platform",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.send(message);
  }

  /**
   * Send a warning notification
   */
  async sendWarning(title: string, details?: string): Promise<void> {
    const message: SlackMessage = {
      text: `⚠️ ${title}`,
      attachments: [
        {
          color: "#ffa500",
          title: `⚠️ ${title}`,
          text: details,
          footer: "Farmers Market Platform",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.send(message);
  }

  /**
   * Send an info notification
   */
  async sendInfo(title: string, details?: string): Promise<void> {
    const message: SlackMessage = {
      text: `ℹ️ ${title}`,
      attachments: [
        {
          color: "#0080ff",
          title: `ℹ️ ${title}`,
          text: details,
          footer: "Farmers Market Platform",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.send(message);
  }

  /**
   * Send test results notification
   */
  async sendTestResults(results: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    duration: number;
    url?: string;
  }): Promise<void> {
    const passRate = ((results.passed / results.total) * 100).toFixed(1);
    const color =
      results.failed === 0
        ? "#36a64f"
        : results.failed < 10
          ? "#ffa500"
          : "#ff0000";
    const emoji =
      results.failed === 0 ? "✅" : results.failed < 10 ? "⚠️" : "❌";

    const message: SlackMessage = {
      text: `${emoji} Test Results: ${results.passed}/${results.total} passed (${passRate}%)`,
      attachments: [
        {
          color,
          title: `${emoji} E2E Test Results`,
          fields: [
            {
              title: "Passed",
              value: `✅ ${results.passed}`,
              short: true,
            },
            {
              title: "Failed",
              value: `❌ ${results.failed}`,
              short: true,
            },
            {
              title: "Skipped",
              value: `⏭️ ${results.skipped}`,
              short: true,
            },
            {
              title: "Total",
              value: `📊 ${results.total}`,
              short: true,
            },
            {
              title: "Duration",
              value: `⏱️ ${Math.round(results.duration / 1000)}s`,
              short: true,
            },
            {
              title: "Pass Rate",
              value: `📈 ${passRate}%`,
              short: true,
            },
          ],
          footer: "Farmers Market Platform - E2E Tests",
          footer_icon: "https://playwright.dev/img/playwright-logo.svg",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    if (results.url) {
      message.attachments![0].title_link = results.url;
    }

    await this.send(message);
  }

  /**
   * Send deployment notification
   */
  async sendDeployment(
    status: "started" | "success" | "failed",
    environment: string,
    details?: {
      version?: string;
      deployer?: string;
      commitSha?: string;
      commitMessage?: string;
      url?: string;
    },
  ): Promise<void> {
    const emoji =
      status === "success" ? "🚀" : status === "failed" ? "❌" : "⏳";
    const color =
      status === "success"
        ? "#36a64f"
        : status === "failed"
          ? "#ff0000"
          : "#0080ff";
    const statusText =
      status === "success"
        ? "Deployed Successfully"
        : status === "failed"
          ? "Deployment Failed"
          : "Deployment Started";

    const fields: Array<{ title: string; value: string; short: boolean }> = [
      {
        title: "Environment",
        value: environment,
        short: true,
      },
      {
        title: "Status",
        value: statusText,
        short: true,
      },
    ];

    if (details?.version) {
      fields.push({
        title: "Version",
        value: details.version,
        short: true,
      });
    }

    if (details?.deployer) {
      fields.push({
        title: "Deployed By",
        value: details.deployer,
        short: true,
      });
    }

    if (details?.commitSha) {
      fields.push({
        title: "Commit",
        value: details.commitSha.substring(0, 7),
        short: true,
      });
    }

    if (details?.commitMessage) {
      fields.push({
        title: "Commit Message",
        value: details.commitMessage,
        short: false,
      });
    }

    const message: SlackMessage = {
      text: `${emoji} ${statusText} - ${environment}`,
      attachments: [
        {
          color,
          title: `${emoji} Deployment - ${environment}`,
          title_link: details?.url,
          fields,
          footer: "Farmers Market Platform - CI/CD",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.send(message);
  }

  /**
   * Send load test results notification
   */
  async sendLoadTestResults(results: {
    duration: number;
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    requestsPerSecond: number;
    errors: number;
  }): Promise<void> {
    const emoji =
      results.successRate > 95 ? "✅" : results.successRate > 80 ? "⚠️" : "❌";
    const color =
      results.successRate > 95
        ? "#36a64f"
        : results.successRate > 80
          ? "#ffa500"
          : "#ff0000";

    const message: SlackMessage = {
      text: `${emoji} Load Test Results: ${results.successRate.toFixed(1)}% success rate`,
      attachments: [
        {
          color,
          title: `${emoji} Load Test Results`,
          fields: [
            {
              title: "Duration",
              value: `⏱️ ${Math.round(results.duration / 1000)}s`,
              short: true,
            },
            {
              title: "Total Requests",
              value: `📊 ${results.totalRequests}`,
              short: true,
            },
            {
              title: "Success Rate",
              value: `✅ ${results.successRate.toFixed(1)}%`,
              short: true,
            },
            {
              title: "Errors",
              value: `❌ ${results.errors}`,
              short: true,
            },
            {
              title: "Avg Response Time",
              value: `⏱️ ${results.avgResponseTime.toFixed(0)}ms`,
              short: true,
            },
            {
              title: "P95 Response Time",
              value: `📈 ${results.p95ResponseTime.toFixed(0)}ms`,
              short: true,
            },
            {
              title: "Requests/Second",
              value: `🚀 ${results.requestsPerSecond.toFixed(2)}`,
              short: true,
            },
          ],
          footer: "Farmers Market Platform - Load Testing",
          footer_icon: "https://k6.io/docs/static/img/k6-logo.svg",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.send(message);
  }

  /**
   * Send monitoring alert
   */
  async sendAlert(
    severity: "critical" | "warning" | "info",
    title: string,
    details: {
      metric?: string;
      value?: string | number;
      threshold?: string | number;
      url?: string;
    },
  ): Promise<void> {
    const emoji =
      severity === "critical" ? "🚨" : severity === "warning" ? "⚠️" : "ℹ️";
    const color =
      severity === "critical"
        ? "#ff0000"
        : severity === "warning"
          ? "#ffa500"
          : "#0080ff";

    const fields: Array<{ title: string; value: string; short: boolean }> = [];

    if (details.metric) {
      fields.push({
        title: "Metric",
        value: details.metric,
        short: true,
      });
    }

    if (details.value !== undefined) {
      fields.push({
        title: "Current Value",
        value: String(details.value),
        short: true,
      });
    }

    if (details.threshold !== undefined) {
      fields.push({
        title: "Threshold",
        value: String(details.threshold),
        short: true,
      });
    }

    const message: SlackMessage = {
      text: `${emoji} [${severity.toUpperCase()}] ${title}`,
      attachments: [
        {
          color,
          title: `${emoji} [${severity.toUpperCase()}] ${title}`,
          title_link: details.url,
          fields: fields.length > 0 ? fields : undefined,
          footer: "Farmers Market Platform - Monitoring",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.send(message);
  }

  /**
   * Post payload to Slack webhook
   */
  private async postToSlack(payload: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);

      const url = new URL(this.webhookUrl);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      };

      const req = https.request(options, (res) => {
        let responseBody = "";

        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            console.log("✅ Slack notification sent successfully");
            resolve();
          } else {
            console.error(
              `❌ Slack notification failed: ${res.statusCode} ${responseBody}`,
            );
            reject(
              new Error(
                `Slack API returned ${res.statusCode}: ${responseBody}`,
              ),
            );
          }
        });
      });

      req.on("error", (error) => {
        console.error("❌ Slack notification error:", error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a Slack notifier from environment variable
 */
export function createSlackNotifier(): SlackNotifier | null {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("⚠️  SLACK_WEBHOOK_URL not set, notifications disabled");
    return null;
  }

  return new SlackNotifier({
    webhookUrl,
    channel: process.env.SLACK_CHANNEL,
    username: process.env.SLACK_USERNAME || "Farmers Market Bot",
    iconEmoji: process.env.SLACK_ICON_EMOJI || ":tractor:",
  });
}

/**
 * Send notification with automatic error handling
 */
export async function sendNotification(
  type: "success" | "error" | "warning" | "info",
  title: string,
  details?: string,
): Promise<void> {
  const notifier = createSlackNotifier();
  if (!notifier) return;

  try {
    switch (type) {
      case "success":
        await notifier.sendSuccess(title, details);
        break;
      case "error":
        await notifier.sendError(title, details || "An error occurred");
        break;
      case "warning":
        await notifier.sendWarning(title, details);
        break;
      case "info":
        await notifier.sendInfo(title, details);
        break;
    }
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}

// ============================================================================
// CLI USAGE
// ============================================================================

/**
 * Run from command line
 * Usage: node slack-notify.ts "Test message"
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const message = args[0] || "Test notification from Farmers Market Platform";

  console.log("📢 Sending Slack notification...");
  console.log(`Message: ${message}`);

  const notifier = createSlackNotifier();
  if (!notifier) {
    console.error("❌ SLACK_WEBHOOK_URL environment variable not set");
    process.exit(1);
  }

  notifier
    .sendInfo("Test Notification", message)
    .then(() => {
      console.log("✅ Notification sent successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed to send notification:", error);
      process.exit(1);
    });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SlackNotifier;
