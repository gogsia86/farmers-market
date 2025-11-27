# 🌟 Divine Workflow Monitoring System

**Farmers Market Platform - Complete Monitoring Setup Guide**

Version: 1.0.0 | Last Updated: November 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Daemon](#running-the-daemon)
7. [Notification Setup](#notification-setup)
8. [Database Schema](#database-schema)
9. [Monitoring Workflows](#monitoring-workflows)
10. [Troubleshooting](#troubleshooting)
11. [API Reference](#api-reference)
12. [Best Practices](#best-practices)

---

## 🎯 Overview

The Divine Workflow Monitoring System is a comprehensive 24/7 monitoring solution that:

- ✅ **Executes automated workflow tests** on schedule
- 📊 **Tracks performance metrics** and stores historical data
- 🔔 **Sends real-time notifications** via Slack/Discord on failures
- 💾 **Persists all data** to PostgreSQL for trend analysis
- 🔄 **Auto-recovers** from failures with configurable retry logic
- 📈 **Generates reports** with actionable recommendations
- 🌾 **Agricultural consciousness** - monitors with farming domain awareness

### Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Continuous Monitoring** | 24/7 workflow execution | ✅ Implemented |
| **Real-time Alerts** | Slack/Discord notifications | ✅ Implemented |
| **Database Storage** | PostgreSQL metrics tracking | ✅ Implemented |
| **Performance Tracking** | Historical trend analysis | ✅ Implemented |
| **Auto-Recovery** | Self-healing on failures | ✅ Implemented |
| **Report Generation** | Hourly/Daily summaries | ✅ Implemented |
| **Process Management** | PM2/Systemd support | ✅ Implemented |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MONITORING DAEMON                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Scheduler: Runs workflows on intervals              │  │
│  │  • health-check:      every 5 minutes                │  │
│  │  • user-login:        every 15 minutes               │  │
│  │  • user-registration: every 30 minutes               │  │
│  │  • farm-creation:     every 60 minutes               │  │
│  │  • product-listing:   every 30 minutes               │  │
│  │  • order-placement:   every 20 minutes               │  │
│  └──────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Workflow Bot: Executes tests with Playwright        │  │
│  │  • Browser automation                                │  │
│  │  • Step-by-step validation                           │  │
│  │  • Screenshot/trace capture on failure               │  │
│  │  • Performance metrics collection                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Reporter: Analyzes results & generates reports      │  │
│  │  • Calculates success rates                          │  │
│  │  • Identifies trends                                 │  │
│  │  • Generates recommendations                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Storage Layer: Persists to PostgreSQL              │  │
│  │  • MonitoringReport                                  │  │
│  │  • WorkflowExecution                                 │  │
│  │  • WorkflowMetrics                                   │  │
│  │  • SystemHealthCheck                                 │  │
│  │  • NotificationLog                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Notification Manager: Sends alerts                  │  │
│  │  • Slack notifications (formatted messages)          │  │
│  │  • Discord notifications (rich embeds)               │  │
│  │  • Email notifications (optional)                    │  │
│  │  • Webhook notifications (custom)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Run Automated Setup

```bash
# Run the setup script (handles everything)
npm run monitor:setup
```

### 2. Configure Notifications

```bash
# Edit .env file
nano .env

# Add your webhook URLs
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
SLACK_CHANNEL="#monitoring"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/WEBHOOK/ID"
```

### 3. Test Notifications

```bash
# Test that notifications are working
npm run test:notifications
```

### 4. Start the Daemon

```bash
# Using PM2 (recommended for production)
npm run monitor:daemon:pm2

# Or run directly (for development)
npm run monitor:daemon
```

### 5. Monitor Status

```bash
# View daemon logs
npm run monitor:daemon:logs

# Check PM2 status
pm2 status

# Monitor in real-time
pm2 monit
```

---

## 📦 Installation

### Prerequisites

- **Node.js**: 18+ (20+ recommended)
- **PostgreSQL**: 14+ (for metrics storage)
- **npm**: 10+
- **PM2** (optional): For production deployment

### Step-by-Step Installation

#### 1. Install Dependencies

```bash
cd "Farmers Market Platform web and app"
npm install
```

#### 2. Setup Environment Variables

Create or update `.env` file:

```env
# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market?schema=public"

# Application (required)
BASE_URL="http://localhost:3000"
NODE_ENV="development"

# Slack Notifications (optional but recommended)
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
SLACK_CHANNEL="#monitoring"

# Discord Notifications (optional)
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/WEBHOOK/ID"

# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_INTERVAL_MINUTES=15
```

#### 3. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create monitoring tables
npx prisma migrate deploy

# Or create migration for new schema
npx prisma migrate dev --name add_monitoring_tables
```

#### 4. Create Required Directories

```bash
mkdir -p logs/pm2
mkdir -p logs/monitoring
mkdir -p monitoring-reports
```

#### 5. Install PM2 (Production)

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |
| `BASE_URL` | ✅ Yes | `http://localhost:3000` | Application base URL |
| `NODE_ENV` | No | `development` | Environment (dev/staging/prod) |
| `SLACK_WEBHOOK_URL` | No | - | Slack incoming webhook URL |
| `SLACK_CHANNEL` | No | - | Slack channel for notifications |
| `DISCORD_WEBHOOK_URL` | No | - | Discord webhook URL |
| `MONITORING_ENABLED` | No | `true` | Enable/disable monitoring |
| `MONITORING_INTERVAL_MINUTES` | No | `15` | Default check interval |

### Workflow Schedules

Edit `scripts/monitor-daemon.ts` to customize schedules:

```typescript
const DEFAULT_SCHEDULES = [
  {
    workflowId: "health-check",
    intervalMinutes: 5,      // Every 5 minutes
    enabled: true,
  },
  {
    workflowId: "user-login",
    intervalMinutes: 15,     // Every 15 minutes
    enabled: true,
  },
  {
    workflowId: "farm-creation",
    intervalMinutes: 60,     // Every hour
    enabled: true,
  },
  // Add more workflows...
];
```

### Notification Throttling

Configure in `src/lib/monitoring/notifiers/index.ts`:

```typescript
const throttleConfig = {
  maxPerHour: 10,   // Max 10 notifications per hour
  maxPerDay: 100,   // Max 100 notifications per day
};
```

---

## 🔄 Running the Daemon

### Development Mode

```bash
# Run daemon directly (with console output)
npm run monitor:daemon
```

### Production Mode with PM2

```bash
# Start daemon
npm run monitor:daemon:pm2

# View status
pm2 status

# View logs
npm run monitor:daemon:logs

# View logs in real-time
pm2 logs workflow-monitor-daemon --lines 100

# Monitor resource usage
pm2 monit

# Restart daemon
npm run monitor:daemon:restart

# Stop daemon
npm run monitor:daemon:stop

# Save PM2 process list (auto-start on reboot)
pm2 save
pm2 startup
```

### Production Mode with Systemd (Linux)

```bash
# Copy service file
sudo cp deployment/systemd/workflow-monitor.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable workflow-monitor

# Start service
sudo systemctl start workflow-monitor

# Check status
sudo systemctl status workflow-monitor

# View logs
sudo journalctl -u workflow-monitor -f

# Stop service
sudo systemctl stop workflow-monitor

# Restart service
sudo systemctl restart workflow-monitor
```

### Docker Deployment

```bash
# Build Docker image
docker build -t farmers-market-monitor .

# Run container
docker run -d \
  --name workflow-monitor \
  --env-file .env \
  --restart unless-stopped \
  farmers-market-monitor npm run monitor:daemon
```

---

## 🔔 Notification Setup

### Slack Setup

#### 1. Create Incoming Webhook

1. Go to https://api.slack.com/messaging/webhooks
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "Workflow Monitor")
4. Select your workspace
5. Navigate to "Incoming Webhooks"
6. Activate Incoming Webhooks
7. Click "Add New Webhook to Workspace"
8. Select channel (e.g., `#monitoring`)
9. Copy the webhook URL

#### 2. Configure Environment

```bash
# Add to .env
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"
SLACK_CHANNEL="#monitoring"
```

#### 3. Test Slack Notifications

```bash
npm run test:notifications
```

#### Expected Slack Messages

**Workflow Failure:**
```
🚨 Workflow Failed: User Login

Status:         ❌ FAILED
Priority:       🚨 CRITICAL
Duration:       ⏱️ 5.23s
Failed Steps:   2/5

Error:
```
Login button not found after 5000ms
```

Run ID: run_1234567890_abc123 | 🕐 Nov 15, 2025 10:30:45 AM
```

**Daily Summary:**
```
🌟 Daily Workflow Monitoring Summary
Period: Nov 14, 2025 - Nov 15, 2025
Success Rate: 92.5%

Total Workflows: 144
Success Rate:    92.5%
Passed:          ✅ 133
Failed:          ❌ 11
Avg Duration:    ⏱️ 4.21s
Critical Issues: ✅ 0
```

### Discord Setup

#### 1. Create Webhook

1. Go to your Discord server
2. Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Name it (e.g., "Workflow Monitor")
5. Select channel (e.g., `#monitoring`)
6. Copy webhook URL

#### 2. Configure Environment

```bash
# Add to .env
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/1234567890/AbCdEfGhIjKlMnOpQrStUvWxYz"
```

#### 3. Test Discord Notifications

```bash
npm run test:notifications
```

---

## 💾 Database Schema

### Monitoring Tables

#### MonitoringReport
Stores monitoring report summaries.

```prisma
model MonitoringReport {
  id                String   @id @default(cuid())
  reportId          String   @unique
  timestamp         DateTime @default(now())
  periodStart       DateTime
  periodEnd         DateTime
  
  // Summary metrics
  totalWorkflows    Int
  passedWorkflows   Int
  failedWorkflows   Int
  successRate       Float
  averageDuration   Float
  criticalIssues    Int
  
  // Trends
  successRateTrend  Float
  performanceTrend  Float
  errorRateTrend    Float
  
  // Relations
  workflowExecutions WorkflowExecution[]
}
```

#### WorkflowExecution
Individual workflow run records.

```prisma
model WorkflowExecution {
  id                String   @id @default(cuid())
  runId             String   @unique
  workflowId        String
  name              String
  type              String
  priority          String
  status            String
  
  startTime         DateTime
  endTime           DateTime
  duration          Int
  
  totalSteps        Int
  passedSteps       Int
  failedSteps       Int
  
  error             String?
  metrics           Json?
  
  reportId          String?
  report            MonitoringReport?
}
```

#### WorkflowMetrics
Performance metrics for each workflow run.

```prisma
model WorkflowMetrics {
  id                String   @id @default(cuid())
  workflowId        String
  runId             String
  timestamp         DateTime @default(now())
  
  totalDuration     Int
  apiResponseTime   Int?
  pageLoadTime      Int?
  memoryUsage       Float?
  cpuUsage          Float?
  performanceScore  Float?
}
```

#### SystemHealthCheck
System health check results.

```prisma
model SystemHealthCheck {
  id                String   @id @default(cuid())
  timestamp         DateTime @default(now())
  healthy           Boolean
  responseTime      Int
  
  databaseHealthy   Boolean
  apiHealthy        Boolean
  cacheHealthy      Boolean
}
```

#### NotificationLog
Log of all sent notifications.

```prisma
model NotificationLog {
  id                String   @id @default(cuid())
  notificationId    String   @unique
  timestamp         DateTime @default(now())
  channel           String
  priority          String
  title             String
  message           String
  sent              Boolean
  error             String?
}
```

### Query Examples

```typescript
// Get recent reports
const reports = await database.monitoringReport.findMany({
  take: 10,
  orderBy: { timestamp: 'desc' },
  include: { workflowExecutions: true },
});

// Get failed workflows in last 24 hours
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
const failures = await database.workflowExecution.findMany({
  where: {
    status: 'FAILED',
    startTime: { gte: oneDayAgo },
  },
});

// Get performance metrics for specific workflow
const metrics = await database.workflowMetrics.findMany({
  where: { workflowId: 'user-login' },
  orderBy: { timestamp: 'desc' },
  take: 100,
});

// Calculate average response time
const avgMetrics = await database.workflowMetrics.aggregate({
  where: { workflowId: 'health-check' },
  _avg: {
    apiResponseTime: true,
    pageLoadTime: true,
  },
});
```

---

## 🔍 Monitoring Workflows

### Available Workflows

| Workflow ID | Name | Priority | Default Interval |
|-------------|------|----------|------------------|
| `health-check` | Health Check | CRITICAL | 5 minutes |
| `user-login` | User Login | CRITICAL | 15 minutes |
| `user-registration` | User Registration | CRITICAL | 30 minutes |
| `farm-creation` | Farm Creation | HIGH | 60 minutes |
| `product-listing` | Product Listing | HIGH | 30 minutes |
| `order-placement` | Order Placement | CRITICAL | 20 minutes |

### Running Individual Workflows

```bash
# Run specific workflow
npm run monitor:workflow -- user-login

# Run all critical workflows
npm run monitor:critical

# Run health check
npm run monitor:health

# List all workflows
npm run monitor:list
```

### Adding Custom Workflows

Create a new workflow in `src/lib/monitoring/workflows/`:

```typescript
// src/lib/monitoring/workflows/password-reset.workflow.ts
import type { WorkflowConfig, WorkflowStep } from '../types';

export const passwordResetWorkflow: WorkflowConfig = {
  id: 'password-reset',
  name: 'Password Reset Flow',
  type: 'USER_MANAGEMENT',
  priority: 'HIGH',
  enabled: true,
  timeout: 60000,
  retries: 3,
  notifyOnFailure: true,
  notifyOnSuccess: false,
  tags: ['authentication', 'user'],
};

export const passwordResetSteps: WorkflowStep[] = [
  {
    id: 'navigate-to-forgot-password',
    name: 'Navigate to Forgot Password',
    description: 'Navigate to the password reset page',
    execute: async (context) => {
      const startTime = Date.now();
      await context.page?.goto(`${context.baseUrl}/forgot-password`);
      return {
        success: true,
        duration: Date.now() - startTime,
        logs: ['Navigated to forgot password page'],
      };
    },
  },
  // Add more steps...
];
```

Register in `src/lib/monitoring/bot.ts`:

```typescript
import { passwordResetWorkflow, passwordResetSteps } from './workflows/password-reset.workflow';

// In constructor or initialization
this.registerWorkflow(passwordResetWorkflow, passwordResetSteps);
```

Add to daemon schedule in `scripts/monitor-daemon.ts`:

```typescript
const DEFAULT_SCHEDULES = [
  // ... existing schedules
  {
    workflowId: 'password-reset',
    intervalMinutes: 30,
    enabled: true,
  },
];
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Daemon Won't Start

**Error: `Cannot find module 'tsx'`**
```bash
# Install tsx globally
npm install -g tsx

# Or use npx
npx tsx scripts/monitor-daemon.ts
```

**Error: `Database connection failed`**
```bash
# Check DATABASE_URL in .env
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL

# Run migrations
npx prisma migrate deploy
```

#### 2. Notifications Not Working

**Slack notifications not arriving:**
```bash
# Test webhook URL directly
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  $SLACK_WEBHOOK_URL

# Test from code
npm run test:notifications

# Check logs for errors
pm2 logs workflow-monitor-daemon --err
```

**Discord notifications not arriving:**
```bash
# Verify webhook URL format
# Should be: https://discord.com/api/webhooks/{id}/{token}

# Test notifications
npm run test:notifications
```

#### 3. High Memory Usage

```bash
# Check PM2 memory limits
pm2 describe workflow-monitor-daemon

# Increase memory limit in ecosystem.config.js
max_memory_restart: "2G"  // Increase from 1G

# Restart daemon
pm2 restart workflow-monitor-daemon
```

#### 4. Workflows Failing

```bash
# Check application is running
curl http://localhost:3000/api/health

# View detailed logs
npm run monitor:daemon:logs

# Check screenshots in monitoring-reports/
ls -la monitoring-reports/screenshots/

# Run workflow manually
npm run monitor:workflow -- health-check
```

#### 5. Database Growing Too Large

```bash
# Check database size
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Clean old records (30 days retention)
# Run from application
const storage = getDatabaseStorage();
await storage.cleanupOldRecords(30);
```

### Debug Mode

Enable detailed logging:

```bash
# Set log level in .env
LOG_LEVEL=debug

# Or pass as environment variable
LOG_LEVEL=debug npm run monitor:daemon
```

---

## 📚 API Reference

### NotificationManager

```typescript
import { createNotificationManager } from '@/lib/monitoring/notifiers';

const manager = createNotificationManager({
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    channel: '#monitoring',
  },
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
  },
});

// Send workflow failure notification
await manager.notifyWorkflowFailure(workflowResult);

// Send workflow success notification (CRITICAL only)
await manager.notifyWorkflowSuccess(workflowResult);

// Send report summary
await manager.sendReportSummary(report);

// Send critical alert
await manager.sendCriticalAlert(
  'System Down',
  'Database connection lost',
  { server: 'db-01', timestamp: new Date() }
);

// Test all channels
await manager.testAllChannels();

// Get status
const status = manager.getStatus();
console.log(status.slack.enabled);
console.log(status.discord.enabled);
```

### DatabaseStorage

```typescript
import { getDatabaseStorage } from '@/lib/monitoring/storage/database.storage';

const storage = getDatabaseStorage();

// Save workflow execution
await storage.saveWorkflowExecution(workflowResult);

// Save monitoring report
await storage.saveReport(monitoringReport);

// Save metrics
await storage.saveWorkflowMetrics(workflowId, runId, metrics);

// Query reports
const reports = await storage.getReports({
  limit: 50,
  startDate: new Date('2025-11-01'),
  endDate: new Date('2025-11-15'),
});

// Get workflow executions
const executions = await storage.getWorkflowExecutions({
  workflowId: 'user-login',
  status: 'FAILED',
  limit: 100,
});

// Get performance stats
const stats = await storage.getWorkflowPerformanceStats('health-check');

// Cleanup old records
await storage.cleanupOldRecords(30); // 30 days retention
```

### DivineWorkflowBot

```typescript
import { DivineWorkflowBot } from '@/lib/monitoring/bot';

const bot = new DivineWorkflowBot({
  baseUrl: 'http://localhost:3000',
});

await bot.initialize();

// List available workflows
const workflows = bot.listWorkflows();

// Run specific workflow
const result = await bot.runWorkflow('user-login');

// Run all workflows
const results = await bot.runAllWorkflows();

// Run critical workflows only
const criticalResults = await bot.runCriticalWorkflows();

// Close bot
await bot.close();
```

---

## 🎯 Best Practices

### 1. Environment-Specific Configuration

```bash
# Development
BASE_URL="http://localhost:3000"
MONITORING_INTERVAL_MINUTES=30
SLACK_CHANNEL="#dev-monitoring"

# Staging
BASE_URL="https://staging.farmersmarket.com"
MONITORING_INTERVAL_MINUTES=15
SLACK_CHANNEL="#staging-monitoring"

# Production
BASE_URL="https://api.farmersmarket.com"
MONITORING_INTERVAL_MINUTES=5
SLACK_CHANNEL="#production-monitoring"
```

### 2. Alert Routing

Configure different channels for different priorities:

```typescript
// High/Critical → Slack + PagerDuty
// Medium → Discord
// Low → Email digest

if (workflow.priority === 'CRITICAL') {
  await manager.sendCriticalAlert(title, message);
}
```

### 3. Performance Optimization

```typescript
// Run workflows in parallel when possible
const results = await Promise.all([
  bot.runWorkflow('health-check'),
  bot.runWorkflow('user-login'),
  bot.runWorkflow('farm-creation'),
]);

// Limit concurrent executions
const concurrency = 3;
const batches = chunk(workflows, concurrency);
for (const batch of batches) {
  await Promise.all(batch.map(w => bot.runWorkflow(w.id)));
}
```

### 4. Data Retention

```typescript
// Schedule cleanup job
const RETENTION_DAYS = 30;

setInterval(async () => {
  const storage = getDatabaseStorage();
  const deleted = await storage.cleanupOldRecords(RETENTION_DAYS);
  console.log(`Cleaned up ${deleted.deletedReports} old reports`);
}, 24 * 60 * 60 * 1000); // Daily
```

### 5. Monitoring the Monitor

Set up meta-monitoring:

```bash
# Monitor daemon health
*/5 * * * * pgrep -f monitor-daemon || pm2 restart workflow-monitor-daemon

# Alert if daemon is down
*/10 * * * * systemctl is-active workflow-monitor || send-alert "Daemon down"
```

### 6. Graceful Degradation

```typescript
// Continue monitoring even if notifications fail
try {
  await manager.notifyWorkflowFailure(result);
} catch (error) {
  console.error('Notification failed, but continuing monitoring', error);
}

// Still save to database if notifications fail
await storage.saveWorkflowExecution(result);
```

---

## 📊 Monitoring Dashboard (Future)

### Planned Features

- **Real-time Dashboard**: Web UI showing live workflow status
- **Trend Charts**: Success rate, performance, error trends
- **Alert Rules Engine**: Custom thresholds and conditions
- **ML Anomaly Detection**: Predict failures before they happen
- **Self-Healing**: Auto-fix common issues

### Current Workarounds

**View reports in CLI:**
```bash
npm run monitor:reports
```

**Query database directly:**
```sql
SELECT 
  timestamp,
  success_rate,
  total_workflows,
  failed_workflows
FROM monitoring_reports
ORDER BY timestamp DESC
LIMIT 20;
```

**Use PM2 Plus** (paid service):
```bash
pm2 plus
# Provides web dashboard for process monitoring
```

---

## 🤝 Contributing

### Adding New Workflows

1. Create workflow file in `src/lib/monitoring/workflows/`
2. Register in `src/lib/monitoring/bot.ts`
3. Add to `DEFAULT_SCHEDULES` in `scripts/monitor-daemon.ts`
4. Test workflow: `npm run monitor:workflow -- your-workflow-id`
5. Update documentation

### Adding New Notification Channels

1. Create notifier in `src/lib/monitoring/notifiers/`
2. Extend `NotificationManager` to support new channel
3. Add environment variables
4. Add tests
5. Update documentation

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🆘 Support

**Issues & Questions:**
- GitHub Issues: [Create Issue]
- Slack: `#dev-monitoring`
- Email: dev-team@farmersmarket.com

**Documentation:**
- Main README: `README.md`
- API Docs: `docs/API.md`
- Architecture: `docs/ARCHITECTURE.md`

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready