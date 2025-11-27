#!/usr/bin/env tsx

/**
 * 🌟 Divine Notification Testing Script
 * Farmers Market Platform - Test Notification Channels
 * Version: 1.0.0
 *
 * Tests Slack, Discord, and other notification channels
 * to verify configuration is working correctly.
 */

import { createNotificationManager } from "../src/lib/monitoring/notifiers";
import type { WorkflowResult, MonitoringReport } from "../src/lib/monitoring/types";

// ============================================================================
// TEST DATA
// ============================================================================

const mockWorkflowFailure: WorkflowResult = {
  workflowId: "test-workflow",
  runId: `test_${Date.now()}`,
  name: "Test Workflow - Notification Test",
  type: "HEALTH_CHECK",
  priority: "CRITICAL",
  status: "FAILED",
  startTime: new Date(Date.now() - 5000),
  endTime: new Date(),
  duration: 5000,
  steps: [],
  totalSteps: 3,
  passedSteps: 2,
  failedSteps: 1,
  skippedSteps: 0,
  error: "This is a test error message to verify notification formatting",
  screenshots: [],
  traces: [],
  metrics: {
    totalDuration: 5000,
    performanceScore: 75,
  },
  tags: ["test", "notification"],
};

const mockWorkflowSuccess: WorkflowResult = {
  workflowId: "test-workflow-success",
  runId: `test_${Date.now()}_success`,
  name: "Test Workflow - Success Notification",
  type: "HEALTH_CHECK",
  priority: "CRITICAL",
  status: "PASSED",
  startTime: new Date(Date.now() - 3000),
  endTime: new Date(),
  duration: 3000,
  steps: [],
  totalSteps: 3,
  passedSteps: 3,
  failedSteps: 0,
  skippedSteps: 0,
  screenshots: [],
  traces: [],
  metrics: {
    totalDuration: 3000,
    performanceScore: 95,
  },
  tags: ["test", "notification"],
};

const mockReport: MonitoringReport = {
  reportId: `test_report_${Date.now()}`,
  timestamp: new Date(),
  period: {
    start: new Date(Date.now() - 3600000),
    end: new Date(),
  },
  summary: {
    totalWorkflows: 10,
    passedWorkflows: 8,
    failedWorkflows: 2,
    warningWorkflows: 0,
    skippedWorkflows: 0,
    successRate: 80,
    averageDuration: 4500,
    criticalIssues: 1,
  },
  workflows: [mockWorkflowSuccess, mockWorkflowFailure],
  trends: {
    successRateTrend: -5.2,
    performanceTrend: 3.1,
    errorRateTrend: 2.1,
  },
  recommendations: [
    "Investigate failed workflows in user-login",
    "Monitor performance degradation in API endpoints",
    "Consider scaling database resources",
  ],
  agricultureInsights: {
    seasonalOptimization: ["Optimize for spring planting season"],
    biodynamicSuggestions: ["Align workflows with lunar cycles"],
    farmHealthTrends: ["Farm data integrity: 95%"],
  },
};

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testSlack(manager: ReturnType<typeof createNotificationManager>) {
  console.log("\n📨 Testing Slack Notifications...");
  console.log("─".repeat(60));

  const slackStatus = manager.getStatus().slack;

  if (!slackStatus.webhookConfigured) {
    console.log("⏭️  Slack webhook not configured (SLACK_WEBHOOK_URL missing)");
    console.log("   To enable Slack notifications:");
    console.log("   1. Create a Slack Incoming Webhook at https://api.slack.com/messaging/webhooks");
    console.log("   2. Add SLACK_WEBHOOK_URL to your .env file");
    console.log("   3. Optionally add SLACK_CHANNEL to specify a channel");
    return false;
  }

  console.log("✅ Slack webhook configured");
  if (slackStatus.channelConfigured) {
    console.log("✅ Slack channel configured");
  }

  try {
    // Test 1: Connection test
    console.log("\n1️⃣  Testing connection...");
    const testResult = await manager["slack"].testConnection();
    if (testResult.success) {
      console.log("✅ Connection test successful");
    } else {
      console.log(`❌ Connection test failed: ${testResult.error}`);
      return false;
    }

    // Test 2: Workflow failure notification
    console.log("\n2️⃣  Testing workflow failure notification...");
    const failureResults = await manager.notifyWorkflowFailure(mockWorkflowFailure);
    const slackFailure = failureResults.find((r) => r.channel === "slack");
    if (slackFailure?.success) {
      console.log("✅ Workflow failure notification sent");
    } else {
      console.log(`❌ Failed to send failure notification: ${slackFailure?.error}`);
    }

    // Test 3: Workflow success notification (CRITICAL only)
    console.log("\n3️⃣  Testing workflow success notification...");
    const successResults = await manager.notifyWorkflowSuccess(mockWorkflowSuccess);
    const slackSuccess = successResults.find((r) => r.channel === "slack");
    if (slackSuccess?.success) {
      console.log("✅ Workflow success notification sent");
    } else {
      console.log(`❌ Failed to send success notification: ${slackSuccess?.error}`);
    }

    // Test 4: Report summary
    console.log("\n4️⃣  Testing report summary notification...");
    const reportResults = await manager.sendReportSummary(mockReport);
    const slackReport = reportResults.find((r) => r.channel === "slack");
    if (slackReport?.success) {
      console.log("✅ Report summary notification sent");
    } else {
      console.log(`❌ Failed to send report summary: ${slackReport?.error}`);
    }

    // Test 5: Critical alert
    console.log("\n5️⃣  Testing critical alert...");
    const alertResults = await manager.sendCriticalAlert(
      "Notification Test Alert",
      "This is a test critical alert to verify notification formatting",
      {
        testType: "critical-alert",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      }
    );
    const slackAlert = alertResults.find((r) => r.channel === "slack");
    if (slackAlert?.success) {
      console.log("✅ Critical alert sent");
    } else {
      console.log(`❌ Failed to send critical alert: ${slackAlert?.error}`);
    }

    console.log("\n✨ Slack notification tests completed!");
    return true;
  } catch (error) {
    console.error("❌ Slack test error:", error);
    return false;
  }
}

async function testDiscord(manager: ReturnType<typeof createNotificationManager>) {
  console.log("\n📨 Testing Discord Notifications...");
  console.log("─".repeat(60));

  const discordStatus = manager.getStatus().discord;

  if (!discordStatus.webhookConfigured) {
    console.log("⏭️  Discord webhook not configured (DISCORD_WEBHOOK_URL missing)");
    console.log("   To enable Discord notifications:");
    console.log("   1. Go to Server Settings → Integrations → Webhooks");
    console.log("   2. Create a new webhook and copy the URL");
    console.log("   3. Add DISCORD_WEBHOOK_URL to your .env file");
    return false;
  }

  console.log("✅ Discord webhook configured");

  try {
    // Test 1: Connection test
    console.log("\n1️⃣  Testing connection...");
    const testResult = await manager["discord"].testConnection();
    if (testResult.success) {
      console.log("✅ Connection test successful");
    } else {
      console.log(`❌ Connection test failed: ${testResult.error}`);
      return false;
    }

    // Test 2: Workflow failure notification
    console.log("\n2️⃣  Testing workflow failure notification...");
    const failureResults = await manager.notifyWorkflowFailure(mockWorkflowFailure);
    const discordFailure = failureResults.find((r) => r.channel === "discord");
    if (discordFailure?.success) {
      console.log("✅ Workflow failure notification sent");
    } else {
      console.log(`❌ Failed to send failure notification: ${discordFailure?.error}`);
    }

    // Test 3: Workflow success notification
    console.log("\n3️⃣  Testing workflow success notification...");
    const successResults = await manager.notifyWorkflowSuccess(mockWorkflowSuccess);
    const discordSuccess = successResults.find((r) => r.channel === "discord");
    if (discordSuccess?.success) {
      console.log("✅ Workflow success notification sent");
    } else {
      console.log(`❌ Failed to send success notification: ${discordSuccess?.error}`);
    }

    // Test 4: Report summary
    console.log("\n4️⃣  Testing report summary notification...");
    const reportResults = await manager.sendReportSummary(mockReport);
    const discordReport = reportResults.find((r) => r.channel === "discord");
    if (discordReport?.success) {
      console.log("✅ Report summary notification sent");
    } else {
      console.log(`❌ Failed to send report summary: ${discordReport?.error}`);
    }

    // Test 5: Critical alert
    console.log("\n5️⃣  Testing critical alert...");
    const alertResults = await manager.sendCriticalAlert(
      "Notification Test Alert",
      "This is a test critical alert to verify notification formatting",
      {
        testType: "critical-alert",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      }
    );
    const discordAlert = alertResults.find((r) => r.channel === "discord");
    if (discordAlert?.success) {
      console.log("✅ Critical alert sent");
    } else {
      console.log(`❌ Failed to send critical alert: ${discordAlert?.error}`);
    }

    console.log("\n✨ Discord notification tests completed!");
    return true;
  } catch (error) {
    console.error("❌ Discord test error:", error);
    return false;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🧪 DIVINE NOTIFICATION CHANNEL TESTING                   ║");
  console.log("║  Farmers Market Platform                                  ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  // Create notification manager
  const manager = createNotificationManager();

  // Get overall status
  const status = manager.getStatus();
  console.log("\n📊 Notification Status:");
  console.log(`   Slack:   ${status.slack.enabled ? "✅ Enabled" : "❌ Disabled"}`);
  console.log(`   Discord: ${status.discord.enabled ? "✅ Enabled" : "❌ Disabled"}`);
  console.log();

  // Test each channel
  let allPassed = true;

  if (status.slack.enabled) {
    const slackPassed = await testSlack(manager);
    allPassed = allPassed && slackPassed;
  } else {
    console.log("\n⏭️  Skipping Slack tests (not configured)");
  }

  if (status.discord.enabled) {
    const discordPassed = await testDiscord(manager);
    allPassed = allPassed && discordPassed;
  } else {
    console.log("\n⏭️  Skipping Discord tests (not configured)");
  }

  // Final summary
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  if (allPassed) {
    console.log("║  ✅ ALL NOTIFICATION TESTS PASSED                         ║");
  } else {
    console.log("║  ⚠️  SOME NOTIFICATION TESTS FAILED                       ║");
  }
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log();

  if (!status.slack.enabled && !status.discord.enabled) {
    console.log("⚠️  No notification channels are configured!");
    console.log();
    console.log("To enable notifications:");
    console.log("  1. Set up Slack webhook:    SLACK_WEBHOOK_URL in .env");
    console.log("  2. Set up Discord webhook:  DISCORD_WEBHOOK_URL in .env");
    console.log();
    console.log("See documentation for detailed setup instructions.");
    console.log();
  }

  // Test all channels shortcut
  console.log("💡 Tip: Run 'npm run test:notifications' to test all channels at once");
  console.log();

  process.exit(allPassed ? 0 : 1);
}

// Run tests
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export { testSlack, testDiscord };
