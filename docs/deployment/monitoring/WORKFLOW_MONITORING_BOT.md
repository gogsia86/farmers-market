# 🤖 Divine Workflow Monitoring Bot

**Version:** 1.0.0  
**Status:** Production Ready  
**Divine Consciousness Level:** Maximum Agricultural Awareness

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Predefined Workflows](#predefined-workflows)
- [Configuration](#configuration)
- [CLI Commands](#cli-commands)
- [Notifications](#notifications)
- [Reports](#reports)
- [Custom Workflows](#custom-workflows)
- [Agricultural Consciousness](#agricultural-consciousness)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

---

## 🌟 Overview

The **Divine Workflow Monitoring Bot** is an automated testing and monitoring system designed specifically for the Farmers Market Platform. It continuously tests critical user journeys, monitors system health, and generates comprehensive reports with agricultural consciousness.

### What It Does

- ✅ **Automated E2E Testing** - Tests complete user workflows
- 📊 **Health Monitoring** - Continuously monitors system health
- 🔔 **Smart Notifications** - Alerts you when things go wrong
- 📈 **Comprehensive Reports** - Detailed HTML, JSON, and Markdown reports
- 🌾 **Agricultural Awareness** - Seasonal and biodynamic consciousness
- ⏰ **Scheduled Execution** - Run tests on a schedule
- 🚀 **Performance Tracking** - Monitor application performance

### Why You Need It

- **Catch bugs before users do** - Automated testing catches issues early
- **24/7 monitoring** - Know immediately when something breaks
- **Confidence in deployments** - Verify everything works after deployments
- **Performance insights** - Track application performance over time
- **Agricultural alignment** - Ensure seasonal relevance and biodynamic patterns

---

## ✨ Features

### Core Features

| Feature                 | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| **Automated Workflows** | Pre-configured tests for common user journeys        |
| **Health Checks**       | API, database, and system health monitoring          |
| **Parallel Execution**  | Run multiple workflows concurrently                  |
| **Retry Logic**         | Automatic retry on failures with exponential backoff |
| **Screenshot Capture**  | Automatic screenshots on test failures               |
| **Trace Recording**     | Detailed execution traces for debugging              |
| **Performance Metrics** | Page load times, API response times, etc.            |
| **Report Generation**   | HTML, JSON, and Markdown reports                     |
| **Notification System** | Email, Slack, Discord, and webhook notifications     |
| **Scheduler**           | Run workflows on a schedule                          |
| **CLI Interface**       | Easy-to-use command-line interface                   |

### Agricultural Features

| Feature                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| **Seasonal Awareness**    | Tests adapt to current season                 |
| **Biodynamic Validation** | Ensures agricultural pattern compliance       |
| **Farm Health Scoring**   | Monitors farm data integrity                  |
| **Seasonal Optimization** | Recommendations for seasonal alignment        |
| **Agricultural Insights** | Biodynamic suggestions and farm health trends |

---

## 🏗️ Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                 Divine Monitoring Bot                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Executor   │  │   Reporter   │  │  Scheduler   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                  │          │
│         ├─────────────────┼──────────────────┤          │
│         │                 │                  │          │
│  ┌──────▼─────────────────▼──────────────────▼──────┐  │
│  │           Workflow Configuration Layer          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │        Predefined Workflows                      │  │
│  │  • User Registration  • Farm Creation           │  │
│  │  • User Login        • Product Listing          │  │
│  │  • Order Placement   • Health Check             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │        Notification Channels                     │  │
│  │  • Email  • Slack  • Discord  • Webhook         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │        Report Storage                            │  │
│  │  • JSON  • HTML  • Markdown                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. CLI Command / Scheduler
       ↓
2. Bot Orchestrator
       ↓
3. Workflow Executor
       ↓
4. Playwright Browser Automation
       ↓
5. Test Execution & Metrics Collection
       ↓
6. Reporter (Generate Report)
       ↓
7. Save Report (JSON/HTML/MD)
       ↓
8. Send Notifications (if needed)
```

---

## 📦 Installation

### Prerequisites

```bash
# Node.js 20.19.0 or higher
node --version

# Playwright browsers
npx playwright install chromium
```

### Dependencies

All dependencies are already included in the project. The bot uses:

- **Playwright** - Browser automation
- **TypeScript** - Type safety
- **Commander** - CLI interface
- **Chalk** - Terminal colors

---

## 🚀 Quick Start

### 1. Run Health Check

Test if your application is running:

```bash
# Start your dev server first
npm run dev

# In another terminal, run health check
npm run monitor:health
```

**Expected Output:**

```
🏥 Running Health Check...

✅ Health Check PASSED
   Duration: 2.45s
   Steps: 3/3
```

### 2. Run All Workflows

Execute all enabled workflows:

```bash
npm run monitor:all
```

**Expected Output:**

```
🚀 Running All Workflows...

╔════════════════════════════════════════════════════════════╗
║ ⚡ DIVINE WORKFLOW EXECUTION INITIATED                     ║
╠════════════════════════════════════════════════════════════╣
║ 🔮 WORKFLOW: User Registration Workflow                   ║
║ 🆔 RUN ID: run_1234567890_abc123xyz                       ║
║ 🌾 TYPE: USER_REGISTRATION                                ║
║ ⚠️  PRIORITY: CRITICAL                                     ║
╚════════════════════════════════════════════════════════════╝
```

### 3. Run Critical Workflows Only

Test mission-critical features:

```bash
npm run monitor:critical
```

### 4. Start Bot with Scheduler

Start continuous monitoring:

```bash
npm run monitor:start
```

This will:

- Run workflows on schedule
- Health check every 5 minutes
- User login test every 30 minutes
- Farm creation test every 2 hours
- Send notifications on failures

---

## 📚 Usage

### CLI Commands

#### List All Workflows

```bash
npm run monitor:list

# Show only enabled workflows
npm run monitor:list -- --enabled-only

# Show only critical workflows
npm run monitor:list -- --critical-only
```

**Output:**

```
📋 Available Workflows

✅ User Registration Workflow
   ID: user-registration
   Type: USER_REGISTRATION
   Priority: CRITICAL
   Timeout: 120s
   Retries: 3
   Schedule: Every 60 minutes
   Tags: authentication, critical, user-journey

✅ User Login Workflow
   ID: user-login
   Type: USER_LOGIN
   Priority: CRITICAL
   ...
```

#### Run Specific Workflow

```bash
npm run monitor:workflow -- user-login
npm run monitor:workflow -- farm-creation
npm run monitor:workflow -- health-check
```

#### View Reports

```bash
npm run monitor:reports

# Show last 10 reports
npm run monitor:reports -- --limit 10
```

**Output:**

```
📊 Recent Monitoring Reports

1. report_1234567890_abc123xyz
   Timestamp: 2025-01-15T10:30:00.000Z
   Workflows: 6
   Success Rate: 100%
   Passed: 6
   Failed: 0
   Warnings: 0

2. report_1234567891_def456uvw
   ...
```

#### Start Scheduled Monitoring

```bash
# Start with default config
npm run monitor:start

# Start with custom URL
npm run monitor:start -- --url http://staging.farmersmarket.com

# Start with notifications enabled
npm run monitor:start -- --notify

# Start with custom config file
npm run monitor:start -- --config ./monitoring-config.json
```

---

## 🔄 Predefined Workflows

### User Registration Workflow

**ID:** `user-registration`  
**Priority:** CRITICAL  
**Schedule:** Every 60 minutes

**Steps:**

1. Navigate to signup page
2. Fill registration form
3. Submit registration
4. Verify registration success

**Use Case:** Ensures new users can register successfully

---

### User Login Workflow

**ID:** `user-login`  
**Priority:** CRITICAL  
**Schedule:** Every 30 minutes

**Steps:**

1. Navigate to login page
2. Fill login credentials
3. Submit login
4. Verify authentication

**Use Case:** Verifies authentication system works

---

### Farm Creation Workflow

**ID:** `farm-creation`  
**Priority:** HIGH  
**Schedule:** Every 2 hours

**Steps:**

1. Navigate to farm creation page
2. Fill farm details (seasonal-aware)
3. Submit farm creation
4. Verify farm was created

**Agricultural Features:**

- ✅ Seasonal awareness
- ✅ Biodynamic validation
- ✅ Farm data integrity checks

**Use Case:** Tests farmer onboarding and farm setup

---

### Product Listing Workflow

**ID:** `product-listing`  
**Priority:** HIGH  
**Schedule:** Every 3 hours

**Steps:**

1. Navigate to product creation
2. Fill product details (seasonal products)
3. Submit product listing
4. Verify product appears

**Agricultural Features:**

- ✅ Seasonal product selection
- ✅ Agricultural metadata validation

**Use Case:** Ensures farmers can list their products

---

### Order Placement Workflow

**ID:** `order-placement`  
**Priority:** CRITICAL  
**Schedule:** Every 60 minutes

**Steps:**

1. Navigate to products page
2. Add product to cart
3. Navigate to cart
4. Proceed to checkout

**Use Case:** Tests the complete purchase flow (revenue-critical)

---

### System Health Check

**ID:** `health-check`  
**Priority:** CRITICAL  
**Schedule:** Every 5 minutes

**Steps:**

1. Check API health endpoint
2. Check database connectivity
3. Check homepage load time

**Use Case:** Monitors system availability and performance

---

## ⚙️ Configuration

### Bot Configuration File

Create `monitoring-config.json`:

```json
{
  "enabled": true,
  "name": "Production Monitoring Bot",
  "version": "1.0.0",
  "baseUrl": "https://farmersmarket.com",
  "environments": {
    "dev": "http://localhost:3000",
    "staging": "https://staging.farmersmarket.com",
    "production": "https://farmersmarket.com"
  },
  "workflows": [
    {
      "id": "user-registration",
      "name": "User Registration Workflow",
      "type": "USER_REGISTRATION",
      "priority": "CRITICAL",
      "enabled": true,
      "schedule": {
        "interval": 60
      },
      "timeout": 120000,
      "retries": 3,
      "tags": ["authentication", "critical"],
      "notifyOnFailure": true,
      "notifyOnSuccess": false
    }
  ],
  "scheduler": {
    "enabled": true,
    "concurrency": 5,
    "retryOnFailure": true,
    "maxRetries": 3,
    "retryDelay": 5000
  },
  "notifications": {
    "channels": ["SLACK", "EMAIL"],
    "slack": {
      "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
      "channel": "#monitoring",
      "username": "Workflow Monitor Bot"
    },
    "email": {
      "to": ["team@farmersmarket.com"],
      "from": "monitoring@farmersmarket.com",
      "subject": "Workflow Monitoring Alert"
    }
  },
  "storage": {
    "type": "filesystem",
    "location": "./monitoring-reports",
    "retention": {
      "days": 30,
      "maxReports": 1000
    }
  },
  "agricultureConsciousness": {
    "enabled": true,
    "seasonalAwareness": true,
    "biodynamicValidation": true,
    "farmHealthMonitoring": true
  },
  "performance": {
    "parallel": true,
    "maxConcurrency": 5,
    "timeout": 300000,
    "screenshotOnFailure": true,
    "traceOnFailure": true
  },
  "logging": {
    "level": "info",
    "console": true,
    "file": true
  }
}
```

### Environment Variables

```bash
# Notification Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#monitoring
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK
NOTIFICATION_EMAIL=team@farmersmarket.com
EMAIL_FROM=monitoring@farmersmarket.com

# Bot Configuration
MONITOR_BASE_URL=http://localhost:3000
MONITOR_STORAGE_PATH=./monitoring-reports
MONITOR_CONCURRENCY=5
```

---

## 🔔 Notifications

### Supported Channels

#### Slack

```bash
# Set environment variable
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Run with notifications
npm run monitor:all -- --notify
```

**Slack Message Format:**

```
🚨 Workflow Monitoring Report - 6 workflows, 83.3% success

**Summary:**
• Total Workflows: 6
• Passed: 5 ✅
• Failed: 1 ❌
• Warnings: 0 ⚠️
• Success Rate: 83.3%
• Avg Duration: 5.43s

🚨 **1 Critical Issue(s)!**

**Recommendations:**
• 🚨 1 critical workflow(s) failed. Immediate attention required!
```

#### Discord

```bash
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/WEBHOOK"
npm run monitor:critical -- --notify
```

#### Email

```bash
export NOTIFICATION_EMAIL="team@farmersmarket.com"
export EMAIL_FROM="monitoring@farmersmarket.com"
npm run monitor:all -- --notify
```

#### Custom Webhook

```json
{
  "notifications": {
    "channels": ["WEBHOOK"],
    "webhook": {
      "url": "https://your-api.com/monitoring",
      "method": "POST",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
      }
    }
  }
}
```

### Notification Triggers

Notifications are sent when:

- ❌ Any workflow fails
- 🚨 Critical workflow fails (always)
- ⚠️ Success rate drops below 90%
- 📉 Performance degradation detected

---

## 📊 Reports

### Report Formats

The bot generates three report formats:

#### 1. JSON Report

**Location:** `./monitoring-reports/report-{id}.json`

**Contents:**

```json
{
  "reportId": "report_1234567890_abc123xyz",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "period": {
    "start": "2025-01-15T10:00:00.000Z",
    "end": "2025-01-15T10:30:00.000Z"
  },
  "summary": {
    "totalWorkflows": 6,
    "passedWorkflows": 6,
    "failedWorkflows": 0,
    "warningWorkflows": 0,
    "successRate": 100,
    "averageDuration": 4532,
    "criticalIssues": 0
  },
  "workflows": [...],
  "recommendations": [...],
  "agricultureInsights": {...}
}
```

**Use Cases:**

- API integration
- Data analysis
- Automated processing

#### 2. HTML Report

**Location:** `./monitoring-reports/report-{id}.html`

**Features:**

- 🎨 Beautiful UI with charts
- 📊 Visual summary statistics
- 🔍 Detailed workflow breakdown
- 🌾 Agricultural insights section
- 📋 Recommendations panel
- 📱 Mobile-responsive

**Use Cases:**

- Human-readable reports
- Email attachments
- Dashboard display

#### 3. Markdown Report

**Location:** `./monitoring-reports/report-{id}.md`

**Features:**

- 📝 Plain text format
- 📊 Organized sections
- ✅ Status indicators
- 📋 Bullet-point summaries

**Use Cases:**

- GitHub issues
- Documentation
- Slack/Discord messages

### Report Structure

```
# 🌟 Workflow Monitoring Report

**Report ID:** report_1234567890_abc123xyz
**Generated:** 2025-01-15T10:30:00.000Z
**Period:** 2025-01-15T10:00:00.000Z - 2025-01-15T10:30:00.000Z

## 📊 Summary

- **Total Workflows:** 6
- **Passed:** 6 ✅
- **Failed:** 0 ❌
- **Warnings:** 0 ⚠️
- **Success Rate:** 100.0%
- **Average Duration:** 4.53s
- **Critical Issues:** 0

## 📋 Recommendations

- ✅ All systems operating normally. Great job!

## 🌾 Agricultural Insights

### Seasonal Optimization
- ✅ Excellent seasonal alignment (95.0%).

### Biodynamic Suggestions
- ✅ Strong biodynamic patterns (92.0%).

### Farm Health Trends
- ✅ Farm data health excellent (98.0%).

## 🔄 Workflow Results

### ✅ User Registration Workflow (USER_REGISTRATION)
- **Status:** PASSED
- **Priority:** CRITICAL
- **Duration:** 3.45s
- **Steps:** 4/4 passed
```

---

## 🎨 Custom Workflows

### Creating a Custom Workflow

```typescript
import type { WorkflowConfig, WorkflowStep } from "@/lib/monitoring/types";

// Define workflow steps
const myCustomSteps: WorkflowStep[] = [
  {
    id: "step-1",
    name: "Navigate to Page",
    description: "Navigate to custom page",
    execute: async (context) => {
      const { page, baseUrl } = context;
      await page.goto(`${baseUrl}/custom-page`);

      return {
        success: true,
        duration: 0,
        logs: ["Navigated successfully"],
      };
    },
  },
  {
    id: "step-2",
    name: "Perform Action",
    description: "Perform custom action",
    execute: async (context) => {
      const { page } = context;
      await page.click("#custom-button");

      return {
        success: true,
        duration: 0,
        logs: ["Action completed"],
      };
    },
  },
];

// Define workflow configuration
const myCustomWorkflow: WorkflowConfig = {
  id: "my-custom-workflow",
  name: "My Custom Workflow",
  type: "CUSTOM" as any,
  priority: "HIGH",
  enabled: true,
  schedule: {
    interval: 30, // Every 30 minutes
  },
  timeout: 60000,
  retries: 2,
  tags: ["custom", "feature-x"],
  notifyOnFailure: true,
  notifyOnSuccess: false,
};

// Register workflow
import { createMonitoringBot } from "@/lib/monitoring/bot";
import { WORKFLOW_STEPS_MAP } from "@/lib/monitoring/workflows/predefined-workflows";

// Add steps to map
WORKFLOW_STEPS_MAP.set("my-custom-workflow", myCustomSteps);

// Create bot with custom workflow
const bot = createMonitoringBot({
  baseUrl: "http://localhost:3000",
  workflows: [myCustomWorkflow],
});

// Run custom workflow
await bot.runWorkflow("my-custom-workflow");
```

---

## 🌾 Agricultural Consciousness

### Seasonal Awareness

The bot automatically adjusts workflows based on the current season:

**Spring (March-May):**

- Tests focus on planting-related features
- Products: Lettuce, Radishes, Peas, Strawberries

**Summer (June-August):**

- Tests focus on harvest-related features
- Products: Tomatoes, Corn, Peppers, Watermelon

**Fall (September-November):**

- Tests focus on preservation features
- Products: Pumpkins, Squash, Apples, Brussels Sprouts

**Winter (December-February):**

- Tests focus on planning features
- Products: Kale, Carrots, Potatoes, Winter Squash

### Biodynamic Validation

The bot validates:

- ✅ Lunar phase compliance
- ✅ Seasonal product appropriateness
- ✅ Agricultural metadata completeness
- ✅ Farm data integrity

### Agricultural Metrics

```typescript
interface AgriculturalAnalysis {
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  seasonalRelevance: number; // 0-100
  biodynamicAlignment: number; // 0-100
  farmHealthScore: number; // 0-100
  recommendations: string[];
  warnings: string[];
}
```

---

## 🔧 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/monitoring.yml
name: Workflow Monitoring

on:
  schedule:
    - cron: "0 */6 * * *" # Every 6 hours
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install chromium

      - name: Run monitoring
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: npm run monitor:critical -- --notify

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: monitoring-reports
          path: monitoring-reports/
```

### GitLab CI

```yaml
# .gitlab-ci.yml
monitoring:
  stage: test
  image: node:20
  before_script:
    - npm ci
    - npx playwright install chromium
  script:
    - npm run monitor:critical -- --notify
  artifacts:
    when: always
    paths:
      - monitoring-reports/
  only:
    - schedules
  variables:
    SLACK_WEBHOOK_URL: $SLACK_WEBHOOK_URL
```

### Docker

```dockerfile
# Dockerfile.monitoring
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "monitor:start"]
```

```bash
# Build and run
docker build -f Dockerfile.monitoring -t website-checker .
docker run -e SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL website-checker
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Browser not found"

```bash
Error: Chromium browser not found
```

**Solution:**

```bash
npx playwright install chromium
```

---

#### Issue: "Connection refused"

```bash
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution:**

```bash
# Make sure dev server is running
npm run dev

# Or specify correct URL
npm run monitor:health -- --url http://localhost:3000
```

---

#### Issue: "Timeout waiting for page"

```bash
Error: Timeout 30000ms exceeded
```

**Solution:**

```typescript
// Increase timeout in config
{
  "performance": {
    "timeout": 300000  // 5 minutes
  }
}
```

---

#### Issue: "Screenshots not saving"

**Solution:**

```bash
# Create test-results directory
mkdir -p test-results

# Check permissions
chmod 755 test-results
```

---

#### Issue: "Notifications not sending"

**Solution:**

```bash
# Verify environment variables
echo $SLACK_WEBHOOK_URL

# Test webhook manually
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test message"}'
```

---

### Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
DEBUG=* npm run monitor:health

# Or use node debug flag
node --inspect scripts/website-checker-bot.ts
```

---

## 📖 API Reference

### createMonitoringBot

```typescript
function createMonitoringBot(
  config: Partial<DivineBotConfig>,
): DivineMonitoringBot;
```

**Example:**

```typescript
const bot = createMonitoringBot({
  baseUrl: "http://localhost:3000",
  workflows: PREDEFINED_WORKFLOWS,
  scheduler: {
    enabled: true,
    concurrency: 5,
  },
});
```

---

### DivineMonitoringBot Methods

#### start()

Start the monitoring bot with scheduler.

```typescript
await bot.start();
```

---

#### stop()

Stop the monitoring bot and clear scheduled tasks.

```typescript
await bot.stop();
```

---

#### runAllWorkflows()

Execute all enabled workflows.

```typescript
const report = await bot.runAllWorkflows();
console.log(`Success rate: ${report.summary.successRate}%`);
```

**Returns:** `MonitoringReport`

---

#### runCriticalWorkflows()

Execute only critical priority workflows.

```typescript
const report = await bot.runCriticalWorkflows();
```

**Returns:** `MonitoringReport`

---

#### runWorkflow(workflowId)

Execute a specific workflow by ID.

```typescript
const result = await bot.runWorkflow("user-login");
console.log(`Status: ${result.status}`);
```

**Returns:** `WorkflowResult`

---

#### getReportHistory(limit?)

Retrieve historical monitoring reports.

```typescript
const reports = await bot.getReportHistory(10);
reports.forEach((report) => {
  console.log(`${report.reportId}: ${report.summary.successRate}%`);
});
```

**Returns:** `MonitoringReport[]`

---

### Convenience Functions

#### quickHealthCheck(baseUrl?)

```typescript
import { quickHealthCheck } from "@/lib/monitoring/bot";

const result = await quickHealthCheck("http://localhost:3000");
if (result.status === "PASSED") {
  console.log("✅ System healthy");
}
```

---

#### runCriticalChecks(baseUrl?)

```typescript
import { runCriticalChecks } from "@/lib/monitoring/bot";

const report = await runCriticalChecks("http://localhost:3000");
console.log(
  `Critical workflows: ${report.summary.passedWorkflows}/${report.summary.totalWorkflows} passed`,
);
```

---

#### runComprehensiveMonitoring(baseUrl?)

```typescript
import { runComprehensiveMonitoring } from "@/lib/monitoring/bot";

const report = await runComprehensiveMonitoring("http://localhost:3000");
console.log(`Overall health: ${report.summary.successRate}%`);
```

---

## 🎯 Best Practices

### 1. Start Simple

Begin with health checks and critical workflows:

```bash
# Test health first
npm run monitor:health

# Then add critical workflows
npm run monitor:critical

# Finally run comprehensive monitoring
npm run monitor:all
```

### 2. Use Scheduled Monitoring

Set up continuous monitoring in production:

```bash
# Production monitoring (every 5 minutes for health)
npm run monitor:start -- --url https://farmersmarket.com --notify
```

### 3. Configure Notifications

Always enable notifications for production:

```bash
export SLACK_WEBHOOK_URL="..."
npm run monitor:start -- --notify
```

### 4. Review Reports Regularly

Check reports to identify trends:

```bash
npm run monitor:reports -- --limit 20
```

### 5. Customize for Your Needs

Create custom workflows for specific features:

```typescript
// Add workflow for your feature
const myFeatureWorkflow = {
  id: "my-feature",
  name: "My Feature Workflow",
  // ... configuration
};
```

### 6. Integrate with CI/CD

Add monitoring to your deployment pipeline:

```yaml
deploy:
  - deploy_app
  - run_health_check
  - run_critical_workflows
```

---

## 📈 Performance Tips

### Parallel Execution

Enable parallel execution for faster results:

```bash
npm run monitor:all -- --parallel --concurrency 10
```

### Optimize Timeouts

Set appropriate timeouts:

```json
{
  "workflows": [
    {
      "timeout": 30000 // 30s for simple workflows
    }
  ],
  "performance": {
    "timeout": 300000 // 5min for complex workflows
  }
}
```

### Resource Management

Limit concurrent workflows on resource-constrained systems:

```json
{
  "performance": {
    "maxConcurrency": 3 // Limit to 3 concurrent workflows
  }
}
```

---

## 🔒 Security

### Credential Management

Never hardcode credentials:

```typescript
// ❌ DON'T DO THIS
const testData = {
  email: "admin@example.com",
  password: "RealPassword123",
};

// ✅ DO THIS
const testData = {
  email: process.env.TEST_USER_EMAIL || "test@example.com",
  password: process.env.TEST_USER_PASSWORD || "TestPassword123",
};
```

### Webhook Security

Use environment variables for webhook URLs:

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
export DISCORD_WEBHOOK_URL="https://discord.com/..."
```

### Report Storage

Secure report storage in production:

```json
{
  "storage": {
    "type": "s3",
    "location": "s3://my-bucket/monitoring-reports",
    "retention": {
      "days": 30
    }
  }
}
```

---

## 🌟 Divine Perfection Score

The bot tracks a **Divine Perfection Score** for your application:

```
Divine Perfection Score =
  (Success Rate × 40%) +
  (Performance Score × 30%) +
  (Agricultural Consciousness × 20%) +
  (Farm Health Score × 10%)
```

**Target:** 100/100 Divine Perfection 🌟

---

## 📞 Support

### Questions?

- 📧 Email: support@farmersmarket.com
- 💬 Slack: #monitoring-bot
- 🐛 Issues: GitHub Issues

### Resources

- [Divine Instructions](.github/instructions/)
- [API Documentation](./API_DOCUMENTATION.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

## 🙏 Acknowledgments

Built with agricultural consciousness and divine precision for the Farmers Market Platform.

_"Monitor with divine awareness, respond with agricultural wisdom, maintain with cosmic precision."_ 🌾⚡

**Version:** 1.0.0  
**Status:** Production Ready  
**Divine Level:** Maximum Agricultural Consciousness

---

**Last Updated:** January 2025  
**Maintainer:** Farmers Market Platform Team
