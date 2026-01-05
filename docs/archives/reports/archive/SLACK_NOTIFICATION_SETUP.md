# 📢 Slack Notification Setup Guide

**Farmers Market Platform - CI/CD Notifications**

This guide walks you through setting up Slack notifications for automated alerts, test results, deployments, and monitoring.

---

## 🎯 What You'll Get

Once configured, you'll receive automated Slack notifications for:

- ✅ **E2E Test Results** - Pass/fail status with detailed metrics
- 🚀 **Deployment Status** - Deployment start, success, and failures
- 📊 **Load Test Results** - Performance metrics and response times
- 🚨 **Monitoring Alerts** - Critical issues, warnings, and info messages
- 🔧 **CI/CD Pipeline Status** - Build success/failures

---

## 📋 Prerequisites

- Slack workspace (create one at [slack.com](https://slack.com) if needed)
- Admin or permission to add apps to Slack workspace
- Node.js environment with the Farmers Market Platform

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create a Slack Incoming Webhook

1. **Go to Slack App Directory**
   - Visit: https://api.slack.com/messaging/webhooks
   - Click "Create your Slack app"

2. **Create App**
   - Choose "From scratch"
   - App Name: `Farmers Market Bot` (or your preferred name)
   - Select your workspace
   - Click "Create App"

3. **Enable Incoming Webhooks**
   - In the left sidebar, click "Incoming Webhooks"
   - Toggle "Activate Incoming Webhooks" to **ON**
   - Click "Add New Webhook to Workspace"

4. **Choose Channel**
   - Select the channel where notifications should be posted
   - Recommended: Create a dedicated channel like `#farmers-market-ci` or `#deployments`
   - Click "Allow"

5. **Copy Webhook URL**
   - You'll see a webhook URL like:
     ```
     https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
     ```
   - **Copy this URL** - you'll need it in the next step

### Step 2: Configure Environment Variables

Add the webhook URL to your environment configuration:

#### For Local Development

Create or update `.env.local`:

```bash
# Slack Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#farmers-market-ci
SLACK_USERNAME=Farmers Market Bot
SLACK_ICON_EMOJI=:tractor:
```

#### For CI/CD (GitHub Actions)

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add the following secrets:

   | Name                | Value                           |
   | ------------------- | ------------------------------- |
   | `SLACK_WEBHOOK_URL` | Your webhook URL from Step 1    |
   | `SLACK_CHANNEL`     | `#farmers-market-ci` (optional) |

### Step 3: Test the Integration

Run the test notification script:

```bash
# Set the webhook URL if not in .env
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Send test notification
npx ts-node scripts/slack-notify.ts "Hello from Farmers Market Platform! 🚀"
```

You should see a message in your Slack channel!

---

## 📊 Usage Examples

### From Node.js/TypeScript

```typescript
import { SlackNotifier, createSlackNotifier } from "./scripts/slack-notify";

// Create notifier from environment variables
const notifier = createSlackNotifier();

// Send different types of notifications

// ✅ Success
await notifier.sendSuccess(
  "Deployment Completed",
  "Version 1.2.3 deployed to production",
);

// ❌ Error
await notifier.sendError(
  "Build Failed",
  new Error("Compilation error in auth module"),
);

// ⚠️ Warning
await notifier.sendWarning("High Memory Usage", "Memory usage at 85%");

// ℹ️ Info
await notifier.sendInfo("Build Started", "Building version 1.2.3");

// 📊 Test Results
await notifier.sendTestResults({
  passed: 420,
  failed: 15,
  skipped: 5,
  total: 435,
  duration: 150000, // milliseconds
  url: "https://yoursite.com/test-report",
});

// 🚀 Deployment
await notifier.sendDeployment("success", "production", {
  version: "1.2.3",
  deployer: "John Doe",
  commitSha: "abc123def456",
  commitMessage: "Fix authentication bug",
  url: "https://farmersmarket.app",
});

// 📈 Load Test Results
await notifier.sendLoadTestResults({
  duration: 120000,
  totalRequests: 1500,
  successRate: 98.5,
  avgResponseTime: 250,
  p95ResponseTime: 450,
  requestsPerSecond: 12.5,
  errors: 23,
});

// 🚨 Monitoring Alert
await notifier.sendAlert("critical", "Database Connection Lost", {
  metric: "Database Availability",
  value: "0%",
  threshold: "100%",
  url: "https://monitoring.yoursite.com",
});
```

### From Command Line

```bash
# Simple text notification
npx ts-node scripts/slack-notify.ts "Deployment started"

# Using environment variable
SLACK_WEBHOOK_URL="your-webhook-url" npx ts-node scripts/slack-notify.ts "Test message"
```

### From GitHub Actions Workflow

The notification is already integrated in `.github/workflows/e2e-tests.yml`:

```yaml
- name: Notify Slack - Success
  if: success() && env.SLACK_WEBHOOK_URL != ''
  run: |
    npx ts-node scripts/slack-notify.ts "✅ E2E Tests Passed - All tests successful!"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

- name: Notify Slack - Failure
  if: failure() && env.SLACK_WEBHOOK_URL != ''
  run: |
    npx ts-node scripts/slack-notify.ts "❌ E2E Tests Failed - Check workflow logs"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 🎨 Customization

### Change Bot Appearance

Edit the environment variables to customize how the bot appears:

```bash
SLACK_USERNAME=My Custom Bot Name
SLACK_ICON_EMOJI=:rocket:           # Use any Slack emoji
# OR
SLACK_ICON_URL=https://example.com/avatar.png  # Use custom image
```

### Different Channels for Different Notifications

You can create multiple notifiers for different purposes:

```typescript
// Production alerts channel
const prodNotifier = new SlackNotifier({
  webhookUrl: process.env.SLACK_WEBHOOK_PROD!,
  channel: "#production-alerts",
  username: "Production Monitor",
  iconEmoji: ":rotating_light:",
});

// Development notifications channel
const devNotifier = new SlackNotifier({
  webhookUrl: process.env.SLACK_WEBHOOK_DEV!,
  channel: "#dev-notifications",
  username: "Dev Bot",
  iconEmoji: ":construction:",
});
```

### Message Formatting

Use Slack's mrkdwn formatting in messages:

```typescript
await notifier.sendInfo(
  "Deployment Update",
  `
*Environment*: Production
*Version*: \`1.2.3\`
*Status*: In Progress
*ETA*: 5 minutes

View deployment: https://yoursite.com/deployments/123
  `.trim(),
);
```

---

## 🔧 Integration with CI/CD Workflows

### GitHub Actions

Already integrated in `.github/workflows/e2e-tests.yml`. Just add the secret `SLACK_WEBHOOK_URL` to your repository.

### Other CI/CD Platforms

#### Jenkins

```groovy
pipeline {
  environment {
    SLACK_WEBHOOK_URL = credentials('slack-webhook')
  }

  post {
    success {
      sh 'npx ts-node scripts/slack-notify.ts "✅ Build Successful"'
    }
    failure {
      sh 'npx ts-node scripts/slack-notify.ts "❌ Build Failed"'
    }
  }
}
```

#### GitLab CI

```yaml
notify_slack:
  stage: notify
  script:
    - npx ts-node scripts/slack-notify.ts "Pipeline complete"
  variables:
    SLACK_WEBHOOK_URL: $SLACK_WEBHOOK_URL
```

#### CircleCI

```yaml
notify:
  docker:
    - image: node:18
  steps:
    - run: npx ts-node scripts/slack-notify.ts "Build complete"
  environment:
    SLACK_WEBHOOK_URL: ${SLACK_WEBHOOK_URL}
```

---

## 📊 Notification Examples

### E2E Test Results Notification

```
✅ E2E Test Results

Passed:    420 ✅
Failed:    15  ❌
Skipped:   5   ⏭️
Total:     435 📊
Duration:  ⏱️ 150s
Pass Rate: 📈 96.6%

Farmers Market Platform - E2E Tests
```

### Deployment Notification

```
🚀 Deployment - production

Environment:     production
Status:          Deployed Successfully
Version:         1.2.3
Deployed By:     John Doe
Commit:          abc123d
Commit Message:  Fix authentication bug

Farmers Market Platform - CI/CD
```

### Load Test Results

```
✅ Load Test Results: 98.5% success rate

Duration:           ⏱️ 120s
Total Requests:     📊 1500
Success Rate:       ✅ 98.5%
Errors:             ❌ 23
Avg Response Time:  ⏱️ 250ms
P95 Response Time:  📈 450ms
Requests/Second:    🚀 12.50

Farmers Market Platform - Load Testing
```

### Monitoring Alert

```
🚨 [CRITICAL] Database Connection Lost

Metric:         Database Availability
Current Value:  0%
Threshold:      100%

Farmers Market Platform - Monitoring
```

---

## 🔒 Security Best Practices

### 1. Protect Your Webhook URL

- ⚠️ **NEVER** commit webhook URLs to version control
- ✅ Always use environment variables or secrets management
- ✅ Rotate webhook URLs if accidentally exposed

### 2. Use Separate Webhooks for Different Environments

```bash
# Production
SLACK_WEBHOOK_URL_PROD=https://hooks.slack.com/services/PROD/WEBHOOK/URL

# Staging
SLACK_WEBHOOK_URL_STAGING=https://hooks.slack.com/services/STAGING/WEBHOOK/URL

# Development
SLACK_WEBHOOK_URL_DEV=https://hooks.slack.com/services/DEV/WEBHOOK/URL
```

### 3. Limit Sensitive Information

Avoid sending:

- API keys or secrets
- User passwords or tokens
- Full stack traces with sensitive paths
- Database credentials

---

## 🐛 Troubleshooting

### No Messages Appearing in Slack

**Check:**

1. ✅ Webhook URL is correct and starts with `https://hooks.slack.com/`
2. ✅ Environment variable `SLACK_WEBHOOK_URL` is set
3. ✅ Bot has permission to post in the channel
4. ✅ Network/firewall allows HTTPS requests to Slack

**Test:**

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  YOUR_WEBHOOK_URL
```

### "channel_not_found" Error

The webhook is tied to a specific channel. Either:

- Use the webhook's default channel (remove `channel` from config)
- Create a new webhook for a different channel

### "no_service" Error

The webhook URL is invalid or has been revoked. Create a new webhook.

### TypeScript Compilation Errors

Make sure dependencies are installed:

```bash
npm install --save-dev @types/node
```

---

## 📚 Advanced Configuration

### Rate Limiting

Slack has rate limits. For high-volume notifications, implement queuing:

```typescript
class RateLimitedNotifier extends SlackNotifier {
  private queue: Promise<void>[] = [];
  private readonly maxPerMinute = 30;

  async send(message: SlackMessage): Promise<void> {
    // Implement rate limiting logic
    await this.waitForSlot();
    return super.send(message);
  }

  private async waitForSlot() {
    // Rate limiting implementation
  }
}
```

### Message Batching

For multiple notifications, batch them:

```typescript
const notifier = createSlackNotifier();

const messages = ["Test 1 passed", "Test 2 passed", "Test 3 failed"];

// Send as single message
await notifier.sendInfo("Test Summary", messages.join("\n"));
```

### Custom Message Blocks

Use Slack's Block Kit for rich formatting:

```typescript
await notifier.send({
  text: "Test Results",
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🧪 E2E Test Results",
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: "*Passed:*\n420",
        },
        {
          type: "mrkdwn",
          text: "*Failed:*\n15",
        },
      ],
    },
  ],
});
```

---

## 🔗 Resources

- [Slack Incoming Webhooks Documentation](https://api.slack.com/messaging/webhooks)
- [Slack Block Kit Builder](https://api.slack.com/block-kit/building)
- [Slack Message Formatting](https://api.slack.com/reference/surfaces/formatting)
- [Farmers Market Platform CI/CD Docs](.github/instructions/06_AUTOMATION_INFRASTRUCTURE.instructions.md)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Slack webhook URL created and copied
- [ ] Environment variable `SLACK_WEBHOOK_URL` set (local or CI)
- [ ] Test notification sent successfully
- [ ] Message appears in correct Slack channel
- [ ] Webhook URL added to `.env.example` (without actual value)
- [ ] Webhook URL in `.gitignore` patterns
- [ ] GitHub Actions secrets configured (if using CI/CD)
- [ ] Team members have access to notification channel

---

## 💡 Pro Tips

1. **Create Dedicated Channels**
   - `#ci-notifications` - All CI/CD activity
   - `#production-alerts` - Critical production issues only
   - `#test-results` - Automated test results

2. **Use Threads for Related Notifications**
   - Send deployment start message
   - Reply in thread with deployment progress
   - Reply in thread with final status

3. **Configure Do Not Disturb**
   - Set up Slack notification schedules
   - Mute channels during off-hours
   - Use different channels for different severity levels

4. **Monitor Notification Volume**
   - Too many notifications = notification blindness
   - Only send actionable notifications
   - Use batching for multiple events

---

**Status:** Ready for Production 🚀  
**Last Updated:** December 2024  
**Maintainer:** Farmers Market Platform Team

Need help? Check the [troubleshooting section](#-troubleshooting) or contact the dev team.
