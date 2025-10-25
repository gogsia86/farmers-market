---
applyTo: "**/*"
description: "FR-023: Monitoring & Observability - APM (DataDog/New Relic), error tracking (Sentry), uptime monitoring (Pingdom), log aggregation, metrics dashboard, alerting (Slack/PagerDuty), performance profiling, business metrics tracking"
---

# FR-023: MONITORING & OBSERVABILITY

**Know What's Happening in Real-Time**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-023
Priority: P1 - High
Effort: 21 story points (≈ 1 week)
Value: 90/100
Dependencies: FR-019 (Architecture)
```

---

## 🎯 KEY REQUIREMENTS

### APM (Application Performance Monitoring)

```yaml
Tool: DataDog or New Relic

Metrics Tracked:
  - Response time: API endpoints, database queries
  - Throughput: Requests per second
  - Error rate: 4xx, 5xx responses
  - Resource usage: CPU, memory, disk

Implementation (DataDog):
  const tracer = require('dd-trace').init({
    service: 'farmers-market-api',
    env: 'production'
  });

  // Auto-instruments Express, PostgreSQL, Redis
```

### Error Tracking (Sentry)

```yaml
Capture:
  - Exceptions: Unhandled errors, promise rejections
  - Context: User ID, request URL, stack trace
  - Breadcrumbs: User actions leading to error
  - Releases: Tag errors by deployed version

Implementation:
  Sentry.init({
    dsn: '<https://...@sentry.io/...',>
    environment: 'production',
    tracesSampleRate: 0.1, // 10% of transactions
  });

  // Auto-captures errors
  try {
    processOrder(order);
  } catch (error) {
    Sentry.captureException(error, {
      user: { id: userId, email: userEmail },
      tags: { orderId: order.id }
    });
  }
```

### Uptime Monitoring (Pingdom)

```yaml
Health Checks:
  - Endpoint: GET /api/health
  - Response: { status: "ok", timestamp: ..., uptime: ... }
  - Frequency: Every 1 minute
  - Locations: US East, US West, Europe

Alerting:
  - Down: Alert after 2 consecutive failures
  - Slow: Alert if response time > 2 seconds
  - Recovery: Notify when back online

Status Page:
  - Public: status.farmersmarket.com
  - Components: API, Database, WebSocket, Stripe
  - History: 90-day uptime percentage
```

### Log Aggregation

```yaml
Tool: AWS CloudWatch Logs or Datadog Logs

Structured Logging:
  logger.info('Order created', {
    orderId: order.id,
    farmId: farm.id,
    customerId: customer.id,
    total: order.total,
    timestamp: Date.now()
  });

Log Levels:
  - DEBUG: Verbose (dev only)
  - INFO: Normal operations (order created, user login)
  - WARN: Potential issues (slow query, rate limit hit)
  - ERROR: Failures (payment declined, API timeout)

Retention:
  - Production: 90 days
  - Development: 7 days
  - Archives: S3 (long-term storage)
```

### Metrics Dashboard

```yaml
Platform Health (Real-Time):
  - API uptime: 99.95%
  - Avg response time: 120ms
  - Error rate: 0.02%
  - Active users: 1,234
  - WebSocket connections: 5,678

Key Business Metrics:
  - GMV (Gross Merchandise Value): $12,345 today
  - Orders: 234 today, 1,567 this week
  - New signups: 45 farmers, 123 consumers today
  - Conversion rate: 42% (cart → order)

Database Metrics:
  - Connection pool: 15/50 used
  - Query time p95: 45ms
  - Slow queries: 2 (>1s)
  - Cache hit rate: 92%
```

### Alerting Rules

```yaml
Slack Alerts (Non-Critical):
  - Error rate > 1%
  - Response time > 500ms p95
  - Database connections > 80%
  - Cache hit rate < 70%

PagerDuty Alerts (Critical, On-Call):
  - API down (uptime check fails)
  - Database down
  - Payment processing failing (>5 failures/min)
  - Security breach detected

Alert Format:
  🚨 CRITICAL: API is down
  - Service: farmers-market-api
  - Error: Connection timeout
  - First detected: 2 minutes ago
  - Runbook: <<https://docs.farmersmarket.com/runbooks/api-dow>n>
  - Action: [Acknowledge] [Escalate]
```

### Performance Profiling

```yaml
Identify Slow Operations:
  - Slow queries: Log queries > 100ms
  - N+1 queries: Detect with APM
  - Memory leaks: Track heap usage over time
  - CPU bottlenecks: Flame graphs

Tools:
  - Node.js: --inspect flag, Chrome DevTools
  - Database: EXPLAIN ANALYZE for query plans
  - APM: DataDog/New Relic transaction traces

Continuous Profiling:
  - Sample: 1% of requests
  - Store: Profiles in S3
  - Analyze: Weekly review for regressions
```

### Business Metrics Tracking

```yaml
Daily Report (Automated Email):
  Subject: "Farmers Market Daily Metrics - May 20, 2024"

  📊 Revenue:
    - GMV: $12,345 (+15% vs yesterday)
    - Platform revenue: $1,852 (15% commission)
    - Avg order value: $42.50

  👥 Users:
    - New farmers: 3 (total: 127)
    - New consumers: 45 (total: 2,345)
    - Active users: 1,234 (logged in today)

  📦 Orders:
    - Total: 234 orders
    - Avg fulfillment time: 1.8 days
    - Cancellation rate: 2.1%

  ⭐ Quality:
    - Avg farm rating: 4.7 stars
    - Quality issues: 5 (2% of orders)
    - Resolution time: 18 hours avg
```

---

## 📊 SUCCESS METRICS

| Metric                      | Target                 |
| --------------------------- | ---------------------- |
| Platform uptime             | >99.9%                 |
| MTTD (Mean Time to Detect)  | <5 minutes             |
| MTTR (Mean Time to Resolve) | <30 minutes (critical) |
| False alert rate            | <5%                    |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
