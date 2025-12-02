#!/usr/bin/env tsx

/**
 * 🚀 Quick Slack Webhook Test
 * Tests the Slack webhook configuration
 */

const SLACK_WEBHOOK_URL =
  "https://hooks.slack.com/services/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";

async function testSlackWebhook() {
  console.log("🧪 Testing Slack Webhook...\n");

  try {
    const message = {
      text: "🌾 Divine Workflow Monitor - Connection Test",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "✅ Slack Connection Successful!",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `*Status:* The monitoring system is now connected to Slack! 🎉\n*Time:* ${
              new Date().toLocaleString()}`,
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
              text:
                `*Environment:*\n${  process.env.NODE_ENV || "development"}`,
            },
            {
              type: "mrkdwn",
              text:
                `*Base URL:*\n${
                process.env.BASE_URL || "http://localhost:3001"}`,
            },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "📊 _Monitoring daemon ready to start!_",
            },
          ],
        },
      ],
    };

    console.log("📤 Sending test message to Slack...");

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (response.ok) {
      console.log("✅ SUCCESS! Message sent to Slack!");
      console.log("   Check your Slack channel for the test message.\n");
      console.log("🎯 Next steps:");
      console.log("   1. Verify you received the message in Slack");
      console.log("   2. Run: npm run test:notifications");
      console.log("   3. Start daemon: npm run monitor:daemon\n");
    } else {
      const errorText = await response.text();
      console.error("❌ FAILED: Slack API returned an error");
      console.error("   Status:", response.status);
      console.error("   Error:", errorText);
      console.error("\n💡 Troubleshooting:");
      console.error("   - Verify webhook URL is correct");
      console.error("   - Check if webhook is still active in Slack settings");
      console.error("   - Ensure no firewall is blocking the request");
    }
  } catch (error) {
    console.error("❌ ERROR: Failed to send message");
    console.error(
      "   Details:",
      error instanceof Error ? error.message : String(error),
    );
    console.error("\n💡 Troubleshooting:");
    console.error("   - Check your internet connection");
    console.error("   - Verify the webhook URL is accessible");
  }
}

// Run the test
testSlackWebhook();
