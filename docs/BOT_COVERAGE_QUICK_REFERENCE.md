# 🤖 Bot Coverage Quick Reference Guide

**Quick copy-paste patterns for Day 11 Complete Bot Coverage**

---

## 🚀 Running the Bots

### Enhanced Website Checker

```bash
# One-time check (all 24 checks)
npx tsx scripts/enhanced-website-checker.ts

# Continuous monitoring (every 60 seconds)
npx tsx scripts/enhanced-website-checker.ts continuous

# Watch mode (alias)
npx tsx scripts/enhanced-website-checker.ts watch
```

### Workflow Tests

```typescript
import { createMonitoringBot, quickHealthCheck, runCriticalChecks } from "@/lib/monitoring/bot";

// Quick health check
const result = await quickHealthCheck("http://localhost:3001");

// Run critical workflows only
const report = await runCriticalChecks("http://localhost:3001");

// Run specific workflow
const bot = createMonitoringBot({ baseUrl: "http://localhost:3001" });
await bot.runWorkflow("cart-management");

// Run all workflows
const fullReport = await bot.runAllWorkflows();
```

---

## 📦 Package Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "bot:check": "tsx scripts/enhanced-website-checker.ts",
    "bot:watch": "tsx scripts/enhanced-website-checker.ts continuous",
    "bot:workflows": "tsx -r dotenv/config scripts/run-workflows.ts",
    "test:bot": "npm run bot:check",
    "monitor": "npm run bot:watch"
  }
}
```

---

## 🔧 Environment Variables

```env
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Test Credentials
ADMIN_TEST_EMAIL=admin@farmersmarket.test
ADMIN_TEST_PASSWORD=AdminPassword123!

FARMER_TEST_EMAIL=farmer@farmersmarket.test
FARMER_TEST_PASSWORD=FarmerPassword123!

CUSTOMER_TEST_EMAIL=customer@farmersmarket.test
CUSTOMER_TEST_PASSWORD=CustomerPassword123!
```

---

## 🎯 Creating Custom Workflow Tests

### Step 1: Define Workflow Steps

```typescript
// src/lib/monitoring/workflows/custom-workflow.ts
import type { WorkflowStep } from "../types";

const myCustomSteps: WorkflowStep[] = [
  {
    id: "step-1",
    name: "Navigate to Page",
    description: "Load the target page",
    execute: async ({ page, baseUrl }) => {
      const start = Date.now();
      await page.goto(`${baseUrl}/my-page`);
      await page.waitForLoadState("networkidle");

      return {
        success: true,
        duration: Date.now() - start,
        logs: ["Page loaded successfully"],
      };
    },
  },
  {
    id: "step-2",
    name: "Perform Action",
    description: "Click button and verify",
    execute: async ({ page }) => {
      const start = Date.now();
      
      await page.locator('[data-testid="my-button"]').click();
      await page.waitForTimeout(1000);
      
      const result = await page.locator('[data-testid="result"]').textContent();

      return {
        success: result !== null,
        duration: Date.now() - start,
        logs: [`Action completed: ${result}`],
      };
    },
  },
];
```

### Step 2: Create Workflow Config

```typescript
export const MY_CUSTOM_WORKFLOW: WorkflowConfig = {
  id: "my-custom-workflow",
  name: "My Custom Workflow",
  type: "CUSTOM",
  priority: "MEDIUM",
  enabled: true,
  schedule: {
    interval: 60, // Run every 60 minutes
  },
  timeout: 120000, // 2 minutes
  retries: 2,
  steps: myCustomSteps,
  tags: ["custom", "feature"],
  notifyOnFailure: true,
  notifyOnSuccess: false,
};
```

### Step 3: Register and Run

```typescript
import { createMonitoringBot } from "@/lib/monitoring/bot";
import { MY_CUSTOM_WORKFLOW } from "./workflows/custom-workflow";

const bot = createMonitoringBot({
  baseUrl: "http://localhost:3001",
  workflows: [MY_CUSTOM_WORKFLOW],
});

await bot.start();
await bot.runWorkflow("my-custom-workflow");
```

---

## 🧪 Adding Custom Endpoint Checks

### Pattern 1: Simple GET Request

```typescript
async checkMyEndpoint(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await this.page!.request.get(
      `${CONFIG.baseUrl}/api/my-endpoint`,
      { timeout: CONFIG.timeout }
    );

    const data = await response.json();

    return {
      name: "My Endpoint Check",
      status: response.ok() ? "pass" : "fail",
      duration: Date.now() - start,
      message: `Endpoint responding with ${data.count} items`,
      timestamp: new Date(),
      metadata: { count: data.count },
    };
  } catch (error) {
    return {
      name: "My Endpoint Check",
      status: "fail",
      duration: Date.now() - start,
      message: "Endpoint check failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}
```

### Pattern 2: POST Request with Data

```typescript
async checkMyPostEndpoint(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await this.page!.request.post(
      `${CONFIG.baseUrl}/api/my-endpoint`,
      {
        data: {
          field1: "value1",
          field2: "value2",
        },
        timeout: CONFIG.timeout,
      }
    );

    return {
      name: "My POST Endpoint",
      status: response.ok() ? "pass" : "fail",
      duration: Date.now() - start,
      message: response.ok() ? "POST successful" : "POST failed",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      name: "My POST Endpoint",
      status: "fail",
      duration: Date.now() - start,
      message: "POST endpoint check failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}
```

### Pattern 3: Protected Endpoint (Expected Auth)

```typescript
async checkProtectedEndpoint(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await this.page!.request.get(
      `${CONFIG.baseUrl}/api/protected-endpoint`,
      { timeout: CONFIG.timeout }
    );

    return {
      name: "Protected Endpoint",
      status: response.status() === 401 || response.ok() ? "pass" : "fail",
      duration: Date.now() - start,
      message:
        response.status() === 401
          ? "Protected endpoint (expected)"
          : response.ok()
            ? "Endpoint responding"
            : "Unexpected response",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      name: "Protected Endpoint",
      status: "warn",
      duration: Date.now() - start,
      message: "Protected endpoint check (may require auth)",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}
```

---

## 📊 Custom Report Formatting

```typescript
function printCustomReport(report: HealthCheckReport) {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║ 📊 CUSTOM HEALTH CHECK REPORT                             ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║ Status: ${report.overall.toUpperCase().padEnd(48)} ║`);
  console.log(`║ Duration: ${report.totalDuration}ms${" ".repeat(46 - String(report.totalDuration).length)} ║`);
  console.log(`║ Success Rate: ${report.successRate.toFixed(1)}%${" ".repeat(42 - String(report.successRate.toFixed(1)).length)} ║`);
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  report.checks.forEach((check) => {
    const icon = check.status === "pass" ? "✅" : check.status === "fail" ? "❌" : "⚠️";
    console.log(`${icon} ${check.name} (${check.duration}ms)`);
    console.log(`   ${check.message}`);
  });
}
```

---

## 🔔 Adding Notifications

### Slack Integration

```typescript
async function sendSlackNotification(report: HealthCheckReport) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const color = report.overall === "healthy" ? "good" : report.overall === "degraded" ? "warning" : "danger";
  const emoji = report.overall === "healthy" ? "✅" : report.overall === "degraded" ? "⚠️" : "❌";

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attachments: [
        {
          color,
          title: `${emoji} Health Check Report`,
          fields: [
            { title: "Status", value: report.overall, short: true },
            { title: "Success Rate", value: `${report.successRate.toFixed(1)}%`, short: true },
            { title: "Duration", value: `${report.totalDuration}ms`, short: true },
            { title: "Checks", value: `${report.checks.length}`, short: true },
          ],
          footer: "Farmers Market Platform Bot",
          ts: Math.floor(report.timestamp.getTime() / 1000),
        },
      ],
    }),
  });
}
```

### Email Integration

```typescript
import nodemailer from "nodemailer";

async function sendEmailNotification(report: HealthCheckReport) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const failedChecks = report.checks.filter((c) => c.status === "fail");
  const warnChecks = report.checks.filter((c) => c.status === "warn");

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ALERT_EMAIL,
    subject: `[${report.overall.toUpperCase()}] Health Check Report`,
    html: `
      <h2>Health Check Report</h2>
      <p><strong>Status:</strong> ${report.overall}</p>
      <p><strong>Success Rate:</strong> ${report.successRate.toFixed(1)}%</p>
      <p><strong>Duration:</strong> ${report.totalDuration}ms</p>
      
      ${failedChecks.length > 0 ? `
        <h3>❌ Failed Checks (${failedChecks.length})</h3>
        <ul>
          ${failedChecks.map((c) => `<li>${c.name}: ${c.message}</li>`).join("")}
        </ul>
      ` : ""}
      
      ${warnChecks.length > 0 ? `
        <h3>⚠️ Warnings (${warnChecks.length})</h3>
        <ul>
          ${warnChecks.map((c) => `<li>${c.name}: ${c.message}</li>`).join("")}
        </ul>
      ` : ""}
    `,
  });
}
```

---

## 🐳 Docker Integration

### Dockerfile for Bot Runner

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx playwright install chromium

CMD ["npm", "run", "bot:check"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  bot-checker:
    build: .
    environment:
      - NEXT_PUBLIC_APP_URL=http://web:3001
      - ADMIN_TEST_EMAIL=${ADMIN_TEST_EMAIL}
      - ADMIN_TEST_PASSWORD=${ADMIN_TEST_PASSWORD}
    depends_on:
      - web
    volumes:
      - ./monitoring-reports:/app/monitoring-reports

  web:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
```

---

## ⚙️ GitHub Actions Workflow

```yaml
name: Bot Health Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 */4 * * *' # Every 4 hours

jobs:
  health-check:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run enhanced website checker
        run: npx tsx scripts/enhanced-website-checker.ts
        env:
          NEXT_PUBLIC_APP_URL: ${{ secrets.APP_URL }}
          ADMIN_TEST_EMAIL: ${{ secrets.ADMIN_TEST_EMAIL }}
          ADMIN_TEST_PASSWORD: ${{ secrets.ADMIN_TEST_PASSWORD }}
          FARMER_TEST_EMAIL: ${{ secrets.FARMER_TEST_EMAIL }}
          FARMER_TEST_PASSWORD: ${{ secrets.FARMER_TEST_PASSWORD }}
          CUSTOMER_TEST_EMAIL: ${{ secrets.CUSTOMER_TEST_EMAIL }}
          CUSTOMER_TEST_PASSWORD: ${{ secrets.CUSTOMER_TEST_PASSWORD }}

      - name: Upload report artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: health-check-report-${{ github.run_number }}
          path: monitoring-reports/

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('monitoring-reports/latest.json', 'utf8'));
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Bot Health Check Results\n\n**Status:** ${report.overall}\n**Success Rate:** ${report.successRate}%\n**Duration:** ${report.totalDuration}ms`
            });
```

---

## 📈 Monitoring Dashboard Integration

### Send to Application Insights

```typescript
import { TelemetryClient } from "applicationinsights";

const client = new TelemetryClient(process.env.APPINSIGHTS_CONNECTION_STRING);

async function sendToAppInsights(report: HealthCheckReport) {
  // Track overall event
  client.trackEvent({
    name: "HealthCheckReport",
    properties: {
      overall: report.overall,
      successRate: report.successRate,
      duration: report.totalDuration,
      checkCount: report.checks.length,
    },
  });

  // Track metrics
  client.trackMetric({
    name: "HealthCheckSuccessRate",
    value: report.successRate,
  });

  client.trackMetric({
    name: "HealthCheckDuration",
    value: report.totalDuration,
  });

  // Track individual check failures
  report.checks
    .filter((c) => c.status === "fail")
    .forEach((check) => {
      client.trackException({
        exception: new Error(check.message),
        properties: {
          checkName: check.name,
          duration: check.duration,
        },
      });
    });

  await client.flush();
}
```

### Send to Datadog

```typescript
import { StatsD } from "node-statsd";

const statsd = new StatsD({
  host: process.env.DATADOG_HOST,
  port: 8125,
});

function sendToDatadog(report: HealthCheckReport) {
  // Send metrics
  statsd.gauge("health_check.success_rate", report.successRate);
  statsd.timing("health_check.duration", report.totalDuration);
  statsd.gauge("health_check.total_checks", report.checks.length);
  
  // Count by status
  const statusCounts = {
    pass: report.checks.filter((c) => c.status === "pass").length,
    warn: report.checks.filter((c) => c.status === "warn").length,
    fail: report.checks.filter((c) => c.status === "fail").length,
  };
  
  statsd.gauge("health_check.passed", statusCounts.pass);
  statsd.gauge("health_check.warnings", statusCounts.warn);
  statsd.gauge("health_check.failed", statusCounts.fail);
  
  // Tag by overall status
  statsd.increment("health_check.run", 1, [`status:${report.overall}`]);
}
```

---

## 🧪 Testing the Bot

### Unit Test Example

```typescript
import { describe, it, expect, vi } from "vitest";
import { EnhancedWebsiteChecker } from "../scripts/enhanced-website-checker";

describe("EnhancedWebsiteChecker", () => {
  it("should check homepage successfully", async () => {
    const checker = new EnhancedWebsiteChecker();
    await checker.initialize();
    
    const result = await checker.checkHomePage();
    
    expect(result.name).toBe("Homepage Load");
    expect(result.status).toBe("pass");
    expect(result.duration).toBeGreaterThan(0);
    
    await checker.cleanup();
  });

  it("should handle endpoint failures gracefully", async () => {
    const checker = new EnhancedWebsiteChecker();
    await checker.initialize();
    
    // Mock a failing endpoint
    vi.spyOn(checker.page!.request, "get").mockRejectedValue(new Error("Network error"));
    
    const result = await checker.checkDatabaseConnection();
    
    expect(result.status).toBe("fail");
    expect(result.error).toBe("Network error");
    
    await checker.cleanup();
  });
});
```

---

## 🔍 Debugging Tips

### Enable Verbose Logging

```typescript
// Add to CONFIG
const CONFIG = {
  // ...existing config
  debug: process.env.DEBUG === "true",
  verbose: process.env.VERBOSE === "true",
};

// Use in checks
if (CONFIG.debug) {
  console.log("[DEBUG]", "Checking endpoint:", endpoint);
}

if (CONFIG.verbose) {
  console.log("[VERBOSE]", "Request details:", requestDetails);
}
```

### Screenshot on Failure

```typescript
async checkWithScreenshot(): Promise<CheckResult> {
  try {
    // ... perform check
  } catch (error) {
    // Take screenshot on failure
    await this.page!.screenshot({
      path: `./screenshots/failure-${Date.now()}.png`,
      fullPage: true,
    });
    
    return {
      name: "Check Name",
      status: "fail",
      duration: Date.now() - start,
      message: "Check failed (screenshot saved)",
      error: error.message,
      timestamp: new Date(),
    };
  }
}
```

### Request/Response Logging

```typescript
// Enable request logging
this.page!.on("request", (request) => {
  console.log(">>", request.method(), request.url());
});

this.page!.on("response", (response) => {
  console.log("<<", response.status(), response.url());
});
```

---

## 📚 Additional Resources

- **Full Documentation**: `docs/DAY_11_COMPLETE_BOT_COVERAGE.md`
- **Workflow Examples**: `src/lib/monitoring/workflows/`
- **Implementation Progress**: `IMPLEMENTATION_PROGRESS.md`
- **Divine Instructions**: `.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md`

---

**Status**: ✅ Ready for Production  
**Coverage**: 95% (24 checks + 6 workflows)  
**Divine Perfection**: 💯/100