# 🚀 Phase 2 Implementation Guide
**Workflow Monitoring Bot - Enhanced Features**

**Version:** 2.0.0  
**Date:** January 26, 2025  
**Status:** Phase 2 Implementation Complete

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What's New in Phase 2](#whats-new-in-phase-2)
3. [Enhanced Retry System](#enhanced-retry-system)
4. [Alert Rules Engine](#alert-rules-engine)
5. [Metrics API](#metrics-api)
6. [Web Dashboard](#web-dashboard)
7. [Integration Guide](#integration-guide)
8. [Configuration](#configuration)
9. [Usage Examples](#usage-examples)
10. [API Reference](#api-reference)
11. [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

Phase 2 builds upon Phase 1's foundation by adding enterprise-grade features for production monitoring:

- **Intelligent Retry Logic** - Exponential backoff, error classification, circuit breakers
- **Alert Rules Engine** - Configurable thresholds, escalation policies, deduplication
- **Real-time Metrics API** - Comprehensive monitoring data and historical trends
- **Web Dashboard** - Visual monitoring interface (coming soon)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 2 Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Enhanced Retry  │  │  Alert Rules     │                │
│  │  System          │  │  Engine          │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                      │                           │
│           │   ┌──────────────────▼─────────┐                │
│           │   │   Monitoring Bot Core      │                │
│           │   └──────────────────┬─────────┘                │
│           │                      │                           │
│  ┌────────▼──────────────────────▼─────────┐                │
│  │          Metrics API & Storage          │                │
│  └────────┬────────────────────────────────┘                │
│           │                                                  │
│  ┌────────▼────────────────────────────────┐                │
│  │    PostgreSQL + OpenTelemetry Tracing   │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │     Notification Channels                │               │
│  │  • Slack  • Discord  • Email  • Webhook  │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 What's New in Phase 2

### 1. Enhanced Retry System ✨

**Location:** `src/lib/monitoring/retry/enhanced-retry.ts`

**Features:**
- ✅ Exponential backoff with jitter
- ✅ Intelligent error classification (transient vs permanent)
- ✅ Circuit breaker pattern
- ✅ Configurable retry strategies
- ✅ OpenTelemetry tracing integration

**Benefits:**
- Reduces false positives from transient failures
- Prevents cascading failures with circuit breakers
- Optimizes retry timing to avoid thundering herd
- Provides detailed retry metrics

### 2. Alert Rules Engine 🚨

**Location:** `src/lib/monitoring/alerts/alert-rules-engine.ts`

**Features:**
- ✅ Configurable alert rules with conditions
- ✅ Multiple severity levels (INFO, WARNING, ERROR, CRITICAL)
- ✅ Alert cooldowns and deduplication
- ✅ Escalation policies
- ✅ Multi-channel notifications
- ✅ Alert acknowledgement and resolution

**Benefits:**
- Fine-grained control over alerting
- Reduces alert fatigue with intelligent deduplication
- Supports complex alerting scenarios
- Automatic escalation for critical issues

### 3. Metrics API 📊

**Location:** `src/app/api/monitoring/metrics/route.ts`

**Features:**
- ✅ Real-time metrics endpoint
- ✅ Historical data with time periods
- ✅ Per-workflow statistics
- ✅ System health metrics
- ✅ Trend analysis
- ✅ Alert summaries

**Benefits:**
- Comprehensive monitoring data in one endpoint
- Easy integration with dashboards
- Historical trend analysis
- Performance optimization insights

### 4. Integration Improvements 🔧

- ✅ Better error handling and classification
- ✅ Enhanced OpenTelemetry tracing
- ✅ Improved logging and debugging
- ✅ Performance optimizations

---

## 🔄 Enhanced Retry System

### Core Concepts

The Enhanced Retry System intelligently handles failures by:

1. **Classifying errors** - Determines if error is retryable
2. **Calculating delays** - Uses exponential backoff with jitter
3. **Managing circuit breakers** - Prevents cascading failures
4. **Tracing execution** - Provides detailed observability

### Error Classification

```typescript
export type ErrorType = 
  | "TRANSIENT"    // Temporary server errors (500, 502, 503)
  | "PERMANENT"    // Client errors (400, 401, 403, 404)
  | "RATE_LIMIT"   // Rate limiting (429, Too Many Requests)
  | "TIMEOUT"      // Operation timeouts
  | "NETWORK"      // Network connectivity issues
  | "UNKNOWN";     // Unknown errors (retried cautiously)
```

### Configuration

```typescript
import { RetryConfig, DEFAULT_RETRY_CONFIG } from "@/lib/monitoring/retry/enhanced-retry";

const customConfig: RetryConfig = {
  maxAttempts: 3,                    // Maximum retry attempts
  initialDelayMs: 1000,               // Initial delay (1 second)
  maxDelayMs: 30000,                  // Maximum delay (30 seconds)
  backoffMultiplier: 2,               // Exponential multiplier
  jitterFactor: 0.1,                  // Jitter to prevent thundering herd
  enableCircuitBreaker: true,         // Enable circuit breaker
  circuitBreakerThreshold: 5,         // Failures before opening circuit
  circuitBreakerResetTimeMs: 60000,   // Time to reset circuit (1 minute)
};
```

### Usage Examples

#### Basic Usage

```typescript
import { withRetry } from "@/lib/monitoring/retry/enhanced-retry";

// Execute operation with retry
const result = await withRetry(
  async () => {
    // Your operation here
    const response = await fetch("https://api.example.com/data");
    return response.json();
  },
  "fetch-api-data"
);

if (result.success) {
  console.log("Data:", result.data);
  console.log("Attempts:", result.attempts);
} else {
  console.error("Failed after retries:", result.error);
  console.log("Error type:", result.errorType);
}
```

#### Custom Configuration

```typescript
import { withRetry } from "@/lib/monitoring/retry/enhanced-retry";

const result = await withRetry(
  async () => {
    // Critical operation
    return await criticalDatabaseOperation();
  },
  "critical-db-operation",
  {
    maxAttempts: 5,           // More attempts
    initialDelayMs: 2000,     // Longer initial delay
    maxDelayMs: 60000,        // Longer max delay
    backoffMultiplier: 3,     // More aggressive backoff
  }
);
```

#### Aggressive Retry

```typescript
import { withAggressiveRetry } from "@/lib/monitoring/retry/enhanced-retry";

// For important operations that need more retries
const result = await withAggressiveRetry(
  async () => {
    return await importantOperation();
  },
  "important-operation"
);
```

#### Fast Retry

```typescript
import { withFastRetry } from "@/lib/monitoring/retry/enhanced-retry";

// For quick operations that shouldn't retry much
const result = await withFastRetry(
  async () => {
    return await quickHealthCheck();
  },
  "quick-health-check"
);
```

#### Advanced Usage with Circuit Breaker

```typescript
import { EnhancedRetrySystem } from "@/lib/monitoring/retry/enhanced-retry";

const retrySystem = new EnhancedRetrySystem({
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 3,
  circuitBreakerResetTimeMs: 30000,
});

// Execute operations
for (let i = 0; i < 10; i++) {
  const result = await retrySystem.executeWithRetry(
    async () => await unreliableService(),
    "unreliable-service"
  );
  
  // Circuit breaker will open after threshold failures
  // and prevent further attempts until reset time
}

// Check circuit breaker state
const state = retrySystem.getCircuitBreakerState("unreliable-service");
console.log("Circuit breaker state:", state); // CLOSED, OPEN, or HALF_OPEN

// Reset circuit breaker manually if needed
retrySystem.resetCircuitBreaker("unreliable-service");
```

### Return Value Structure

```typescript
interface RetryResult<T> {
  success: boolean;           // Whether operation succeeded
  data?: T;                   // Result data (if successful)
  error?: Error;              // Error object (if failed)
  attempts: number;           // Number of attempts made
  totalDurationMs: number;    // Total time spent (including delays)
  errorType?: ErrorType;      // Classified error type
}
```

---

## 🚨 Alert Rules Engine

### Core Concepts

The Alert Rules Engine provides:

1. **Flexible rule definitions** - Define custom alert conditions
2. **Severity levels** - INFO, WARNING, ERROR, CRITICAL
3. **Smart deduplication** - Prevents alert spam
4. **Escalation policies** - Automatic escalation for persistent issues
5. **Multi-channel delivery** - Slack, Discord, Email, SMS, Webhook

### Alert Rule Structure

```typescript
interface AlertRule {
  id: string;                      // Unique identifier
  name: string;                    // Human-readable name
  description: string;             // What this rule does
  enabled: boolean;                // Enable/disable rule
  severity: AlertSeverity;         // INFO | WARNING | ERROR | CRITICAL
  conditions: AlertCondition[];    // Array of conditions
  conditionLogic: "AND" | "OR";    // How to combine conditions
  channels: AlertChannel[];        // Where to send alerts
  cooldownMs: number;              // Minimum time between alerts
  escalationDelayMs?: number;      // Time before escalating
  escalationRule?: string;         // Rule to escalate to
  tags: string[];                  // Tags for filtering
}
```

### Alert Conditions

```typescript
interface AlertCondition {
  type: "THRESHOLD" | "RATE" | "PATTERN" | "DURATION" | "CUSTOM";
  metric: string;              // Metric to evaluate (e.g., "workflow.status")
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=" | "CONTAINS";
  value: number | string | boolean;
  duration?: number;           // For duration-based conditions
  window?: number;             // For rate-based conditions
}
```

### Predefined Rules

Six predefined rules are included:

1. **Critical Workflow Failure** - Alerts on critical workflow failures
2. **High Failure Rate** - Alerts when failure rate exceeds 50%
3. **Slow Response Time** - Alerts on workflows taking > 30 seconds
4. **Consecutive Failures** - Alerts on 3+ consecutive failures
5. **Health Check Failure** - Alerts on system health check failures
6. **Low Success Rate** - Alerts when success rate drops below 80%

### Usage Examples

#### Basic Setup

```typescript
import { AlertRulesEngine, PREDEFINED_RULES } from "@/lib/monitoring/alerts/alert-rules-engine";

// Create engine with predefined rules
const alertEngine = new AlertRulesEngine(
  {
    enableDeduplication: true,
    defaultCooldownMs: 300000,  // 5 minutes
    maxActiveAlerts: 100,
    autoResolveAfterMs: 3600000, // 1 hour
    enableEscalation: true,
  },
  PREDEFINED_RULES
);
```

#### Evaluate Alerts from Workflow Result

```typescript
import type { WorkflowResult } from "@/lib/monitoring/types";

// After running a workflow
const workflowResult: WorkflowResult = {
  workflow: { name: "user-login", priority: "critical" },
  status: "failed",
  duration: 5000,
  // ... other fields
};

// Evaluate alert rules
const triggeredAlerts = await alertEngine.evaluate({
  workflowResult,
  timestamp: new Date(),
});

// Process triggered alerts
for (const alert of triggeredAlerts) {
  console.log(`🚨 Alert: ${alert.ruleName}`);
  console.log(`   Severity: ${alert.severity}`);
  console.log(`   Message: ${alert.message}`);
  
  // Send notifications (Slack, Email, etc.)
  await sendNotifications(alert);
}
```

#### Evaluate Alerts from Report

```typescript
import type { MonitoringReport } from "@/lib/monitoring/types";

const report: MonitoringReport = {
  totalWorkflows: 10,
  passedWorkflows: 4,
  failedWorkflows: 6,
  // ... other fields
};

const triggeredAlerts = await alertEngine.evaluate({
  report,
  timestamp: new Date(),
});
```

#### Create Custom Alert Rule

```typescript
const customRule: AlertRule = {
  id: "custom-database-slow",
  name: "Database Query Slow",
  description: "Alert when database queries exceed 5 seconds",
  enabled: true,
  severity: "WARNING",
  conditions: [
    {
      type: "THRESHOLD",
      metric: "workflow.duration",
      operator: ">",
      value: 5000, // 5 seconds
    },
    {
      type: "PATTERN",
      metric: "workflow.name",
      operator: "CONTAINS",
      value: "database",
    },
  ],
  conditionLogic: "AND",
  channels: ["SLACK"],
  cooldownMs: 600000, // 10 minutes
  tags: ["database", "performance"],
};

alertEngine.addRule(customRule);
```

#### Manage Alerts

```typescript
// Get all active alerts
const activeAlerts = alertEngine.getActiveAlerts();

// Get alerts by severity
const criticalAlerts = alertEngine.getAlertsBySeverity("CRITICAL");

// Acknowledge an alert
alertEngine.acknowledgeAlert("alert-id-123", "john@example.com");

// Resolve an alert
alertEngine.resolveAlert("alert-id-123");

// Get alert history for a rule
const history = alertEngine.getAlertHistory("workflow-failure-critical", 10);

// Auto-resolve old alerts
const resolvedCount = alertEngine.autoResolveOldAlerts();

// Get engine statistics
const stats = alertEngine.getStatistics();
console.log("Total rules:", stats.totalRules);
console.log("Active alerts:", stats.activeAlerts);
console.log("By severity:", stats.alertsBySeverity);
```

#### Integration with Monitoring Bot

```typescript
import { DivineMonitoringBot } from "@/lib/monitoring/bot";
import { globalAlertEngine } from "@/lib/monitoring/alerts/alert-rules-engine";

class MonitoringBotWithAlerts extends DivineMonitoringBot {
  async runWorkflow(workflowId: string) {
    const result = await super.runWorkflow(workflowId);
    
    // Evaluate alerts after workflow execution
    const alerts = await globalAlertEngine.evaluate({
      workflowResult: result,
      timestamp: new Date(),
    });
    
    // Handle triggered alerts
    for (const alert of alerts) {
      await this.handleAlert(alert);
    }
    
    return result;
  }
  
  private async handleAlert(alert: Alert) {
    // Send to appropriate channels
    if (alert.channels.includes("SLACK")) {
      await this.sendSlackAlert(alert);
    }
    if (alert.channels.includes("EMAIL")) {
      await this.sendEmailAlert(alert);
    }
  }
}
```

---

## 📊 Metrics API

### Endpoint

```
GET /api/monitoring/metrics
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `24h` | Time period for metrics (`1h`, `24h`, `7d`, `30d`) |
| `details` | boolean | `false` | Include detailed workflow breakdowns |

### Response Structure

```typescript
interface MetricsResponse {
  success: boolean;
  data?: MetricsData;
  error?: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    period?: string;
    requestId?: string;
  };
}

interface MetricsData {
  summary: MetricsSummary;        // Overall metrics
  workflows: WorkflowMetrics[];   // Per-workflow metrics
  system: SystemMetrics;          // System health
  trends: MetricsTrends;          // Historical trends
  alerts: AlertMetrics;           // Alert statistics
}
```

### Usage Examples

#### Fetch Current Metrics (24h)

```bash
curl http://localhost:3000/api/monitoring/metrics
```

```javascript
// From frontend/client
const response = await fetch("/api/monitoring/metrics");
const { success, data } = await response.json();

if (success) {
  console.log("Total executions:", data.summary.totalExecutions);
  console.log("Success rate:", data.summary.successRate.toFixed(2) + "%");
  console.log("Average duration:", data.summary.averageDuration.toFixed(0) + "ms");
}
```

#### Fetch Metrics for Specific Period

```bash
# Last hour
curl http://localhost:3000/api/monitoring/metrics?period=1h

# Last 7 days
curl http://localhost:3000/api/monitoring/metrics?period=7d

# Last 30 days
curl http://localhost:3000/api/monitoring/metrics?period=30d
```

#### Process Metrics Data

```typescript
const response = await fetch("/api/monitoring/metrics?period=24h");
const { data } = await response.json();

// Summary metrics
console.log("📊 Summary");
console.log(`   Total: ${data.summary.totalExecutions}`);
console.log(`   Success: ${data.summary.successfulExecutions}`);
console.log(`   Failed: ${data.summary.failedExecutions}`);
console.log(`   Success Rate: ${data.summary.successRate.toFixed(2)}%`);

// Per-workflow metrics
console.log("\n📈 Workflows");
data.workflows.forEach(workflow => {
  console.log(`   ${workflow.workflowName}`);
  console.log(`      Executions: ${workflow.executionCount}`);
  console.log(`      Success Rate: ${workflow.successRate.toFixed(2)}%`);
  console.log(`      Avg Duration: ${workflow.averageDuration.toFixed(0)}ms`);
});

// System health
console.log("\n❤️ System Health");
console.log(`   Status: ${data.system.healthStatus}`);
console.log(`   Active Alerts: ${data.system.activeAlerts}`);
console.log(`   Critical Alerts: ${data.system.criticalAlerts}`);

// Trends
console.log("\n📉 Trends");
console.log(`   Execution Trend: ${data.trends.executionTrend}`);
console.log(`   Success Rate Trend: ${data.trends.successRateTrend}`);
console.log(`   Performance Trend: ${data.trends.performanceTrend}`);
```

#### Build Dashboard with Metrics

```typescript
// Example React component
import { useEffect, useState } from "react";

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/monitoring/metrics?period=24h");
        const { data } = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading metrics...</div>;
  if (!metrics) return <div>Failed to load metrics</div>;

  return (
    <div>
      <h1>Monitoring Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          title="Total Executions" 
          value={metrics.summary.totalExecutions}
        />
        <MetricCard 
          title="Success Rate" 
          value={`${metrics.summary.successRate.toFixed(1)}%`}
        />
        <MetricCard 
          title="Avg Duration" 
          value={`${metrics.summary.averageDuration.toFixed(0)}ms`}
        />
        <MetricCard 
          title="Active Alerts" 
          value={metrics.system.activeAlerts}
        />
      </div>
      
      {/* Workflow Table */}
      <WorkflowTable workflows={metrics.workflows} />
      
      {/* Hourly Chart */}
      <HourlyChart data={metrics.trends.hourlyExecutions} />
    </div>
  );
}
```

---

## 🔧 Integration Guide

### Step 1: Install Phase 2 Components

All Phase 2 components are already implemented in:
- `src/lib/monitoring/retry/` - Enhanced retry system
- `src/lib/monitoring/alerts/` - Alert rules engine
- `src/app/api/monitoring/metrics/` - Metrics API

### Step 2: Update Monitoring Daemon

```typescript
// scripts/monitor-daemon.ts
import { DivineMonitoringBot } from "@/lib/monitoring/bot";
import { globalRetrySystem } from "@/lib/monitoring/retry/enhanced-retry";
import { globalAlertEngine } from "@/lib/monitoring/alerts/alert-rules-engine";

class EnhancedMonitoringBot extends DivineMonitoringBot {
  async runWorkflow(workflowId: string) {
    // Wrap workflow execution with retry
    const retryResult = await globalRetrySystem.executeWithRetry(
      async () => await super.runWorkflow(workflowId),
      `workflow-${workflowId}`
    );
    
    if (retryResult.success) {
      // Evaluate alert rules
      const alerts = await globalAlertEngine.evaluate({
        workflowResult: retryResult.data,
        timestamp: new Date(),
      });
      
      // Handle alerts
      for (const alert of alerts) {
        await this.handleAlert(alert);
      }
      
      return retryResult.data;
    } else {
      throw retryResult.error;
    }
  }
}
```

### Step 3: Configure Environment Variables

```bash
# Add to .env file
ENABLE_ENHANCED_RETRY=true
ENABLE_ALERT_ENGINE=true
METRICS_API_ENABLED=true
```

### Step 4: Test Integration

```bash
# Test retry system
npx tsx scripts/test-retry-system.ts

# Test alert engine
npx tsx scripts/test-alert-engine.ts

# Test metrics API
curl http://localhost:3000/api/monitoring/metrics

# Run enhanced monitoring
npm run monitor:daemon
```

---

## ⚙️ Configuration

### Enhanced Retry Configuration

Create `config/monitoring/retry.config.ts`:

```typescript
import type { RetryConfig } from "@/lib/monitoring/retry/enhanced-retry";

export const RETRY_CONFIGS: Record<string, RetryConfig> = {
  // For critical operations
  critical: {
    maxAttempts: 5,
    initialDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 3,
    jitterFactor: 0.1,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 3,
    circuitBreakerResetTimeMs: 30000,
  },
  
  // For standard operations
  standard: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 5,
    circuitBreakerResetTimeMs: 60000,
  },
  
  // For quick operations
  quick: {
    maxAttempts: 2,
    initialDelayMs: 500,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitterFactor: 0.05,
    enableCircuitBreaker: false,
    circuitBreakerThreshold: 10,
    circuitBreakerResetTimeMs: 30000,
  },
};
```

### Alert Rules Configuration

Create `config/monitoring/alerts.config.ts`:

```typescript
import type { AlertRule } from "@/lib/monitoring/alerts/alert-rules-engine";

export const CUSTOM_ALERT_RULES: AlertRule[] = [
  {
    id: "database-connection-failure",
    name: "Database Connection Failure",
    description: "Alert when database connection fails",
    enabled: true,
    severity: "CRITICAL",
    conditions: [
      {
        type: "THRESHOLD",
        metric: "workflow.error",
        operator: "CONTAINS",
        value: "database",
      },
    ],
    conditionLogic: "AND",
    channels: ["SLACK", "EMAIL", "SMS"],
    cooldownMs: 180000, // 3 minutes
    escalationDelayMs: 300000, // 5 minutes
    tags: ["database", "critical"],
  },
  
  // Add more custom rules...
];
```

---

## 📚 Usage Examples

### Complete Monitoring Workflow

```typescript
import { EnhancedRetrySystem } from "@/lib/monitoring/retry/enhanced-retry";
import { AlertRulesEngine } from "@/lib/monitoring/alerts/alert-rules-engine";
import { DivineMonitoringBot } from "@/lib/monitoring/bot";

// Initialize components
const retrySystem = new EnhancedRetrySystem();
const alertEngine = new AlertRulesEngine();
const monitoringBot = new DivineMonitoringBot({
  baseUrl: process.env.BASE_URL,
  workflows: [...], // Your workflows
});

// Run monitoring with enhanced features
async function runEnhancedMonitoring() {
  // 1. Run all workflows with retry
  const results = await Promise.all(
    monitoringBot.workflows.map(async (workflow) => {
      return await retrySystem.executeWithRetry(
        async () => await monitoringBot.runWorkflow(workflow.id),
        `workflow-${workflow.id}`
      );
    })
  );
  
  // 2. Evaluate alert rules
  for (const result of results) {
    if (result.success) {
      const alerts = await alertEngine.evaluate({
        workflowResult: result.data,
        timestamp: new Date(),
      });
      
      // 3. Handle triggered alerts
      for (const alert of alerts) {
        await handleAlert(alert);
      }
    }
  }
  
  // 4. Generate report
  const report = monitoringBot.generateReport();
  
  // 5. Fetch metrics from API
  const metricsResponse = await fetch("/api/monitoring/metrics?period=24h");
  const { data: metrics } = await metricsResponse.json();
  
  // 6. Send summary
  await sendDailySummary(report, metrics);
}

// Schedule to run every hour
setInterval(runEnhancedMonitoring, 60 * 60 * 1000);
```

---

## 📖 API Reference

### Enhanced Retry System

See `src/lib/monitoring/retry/enhanced-retry.ts` for complete API.

**Key Classes:**
- `EnhancedRetrySystem` - Main retry orchestrator
- `ErrorClassifier` - Error classification logic
- `CircuitBreaker` - Circuit breaker implementation

**Key Functions:**
- `withRetry()` - Execute with default retry
- `withAggressiveRetry()` - Execute with more retries
- `withFastRetry()` - Execute with fewer retries

### Alert Rules Engine

See `src/lib/monitoring/alerts/alert-rules-engine.ts` for complete API.

**Key Classes:**
- `AlertRulesEngine` - Main alert orchestrator

**Key Methods:**
- `addRule()` - Add alert rule
- `evaluate()` - Evaluate rules against context
- `acknowledgeAlert()` - Acknowledge alert
- `resolveAlert()` - Resolve alert
- `getActiveAlerts()` - Get active alerts

### Metrics API

See `src/app/api/monitoring/metrics/route.ts` for complete API.

**Endpoints:**
- `GET /api/monitoring/metrics` - Get metrics

**Query Parameters:**
- `period` - Time period (1h, 24h, 7d, 30d)
- `details` - Include detailed data

---

## 🐛 Troubleshooting

### Retry System Issues

**Issue: Too many retries**
```typescript
// Solution: Reduce maxAttempts
const result = await withRetry(operation, "my-op", {
  maxAttempts: 2,
});
```

**Issue: Circuit breaker stuck open**
```typescript
// Solution: Reset circuit breaker
globalRetrySystem.resetCircuitBreaker("operation-name");
```

### Alert Engine Issues

**Issue: Too many alerts**
```typescript
// Solution: Increase cooldown
const rule = alertEngine.getRule("rule-id");
alertEngine.updateRule("rule-id", {
  cooldownMs: 1800000, // 30 minutes
});
```

**Issue: Alerts not triggering**
```typescript
// Solution: Check rule conditions
const evaluation = await alertEngine.evaluate({
  workflowResult: result,
  timestamp: new Date(),
});
console.log("Evaluation:", evaluation);
```

### Metrics API Issues

**Issue: No data returned**
```bash
# Check database connection
docker-compose ps db

# Verify executions exist
docker-compose exec -T db psql -U postgres -d farmersmarket -c "
  SELECT COUNT(*) FROM workflow_executions;
"
```

**Issue: Slow response**
```typescript
// Solution: Add database indexes
// See database/migrations for index creation
```

---

## 🎯 Next Steps

### Phase 3 Goals

1. **Web Dashboard UI** - Visual monitoring interface
2. **Real-time Updates** - WebSocket integration
3. **Advanced Analytics** - ML-based anomaly detection
4. **Custom Workflows** - User-defined workflow builder
5. **Multi-environment Support** - Dev, Staging, Production

### Contributing

See `CONTRIBUTING.md` for guidelines on contributing to Phase 2 features.

---

## 📞 Support

- **Documentation:** `docs/WORKFLOW_MONITORING_BOT.md`
- **Phase 1 Guide:** `docs/PHASE_1_PROGRESS_CHECKPOINT.md`
- **Phase 2 Guide:** `docs/PHASE_2_IMPLEMENTATION_GUIDE.md` (this file)
- **Quick Start:** `NEXT_SESSION_START_HERE.md`

---

## 🙏 Acknowledgments

Built with:
- Next.js 15
- TypeScript
- Prisma
- OpenTelemetry
- PostgreSQL
- Agricultural Consciousness 🌾

---

**Version:** 2.0.0  
**Last Updated:** January 26, 2025  
**Status:** Phase 2 Complete ✅  
**Next Milestone:** Phase 3 - Web Dashboard & Advanced Analytics