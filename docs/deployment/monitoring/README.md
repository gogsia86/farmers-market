# 📊 Monitoring & Observability Hub

**Complete monitoring, tracing, and observability documentation** — Real-time insights, performance tracking, distributed tracing, and operational excellence for the Farmers Market Platform.

---

## 🎯 Quick Navigation

| Category           | Resources                          | Quick Links                                                                         |
| ------------------ | ---------------------------------- | ----------------------------------------------------------------------------------- |
| **📈 Monitoring**  | Setup, dashboards, alerts          | [Setup](#-monitoring-setup) • [Dashboards](#dashboards)                             |
| **🔍 Tracing**     | OpenTelemetry, distributed tracing | [Tracing](#-distributed-tracing) • [Configuration](#tracing-configuration)          |
| **⚡ Performance** | Metrics, optimization, benchmarks  | [Performance](#-performance-monitoring) • [Optimization](#performance-optimization) |
| **🤖 Automation**  | Bots, workflows, alerts            | [Bots](#-monitoring-bots) • [Workflows](#workflow-monitoring)                       |
| **🚨 Alerting**    | Alert rules, notifications         | [Alerts](#-alerting-system) • [Incidents](#incident-response)                       |
| **📊 Analytics**   | Usage metrics, insights            | [Analytics](#-analytics) • [Reports](#reporting)                                    |

**Monitoring Coverage:** 100% platform observability • **MTTD:** <5 min • **MTTR:** <30 min

---

## 📊 Monitoring Setup

### Available Monitoring Guides

#### [MONITORING_GUIDE.md](./MONITORING_GUIDE.md)

**Complete monitoring strategy and implementation**

```yaml
Purpose: End-to-end monitoring setup and best practices
Covers:
  - Monitoring philosophy and strategy
  - Tool selection and setup
  - Metric collection and storage
  - Dashboard creation
  - Alert configuration
  - Best practices and patterns
Audience: DevOps, SRE, developers
```

**Key Topics:**

- Application monitoring (APM)
- Infrastructure monitoring
- Database monitoring
- User experience monitoring
- Business metrics tracking

---

#### [MONITORING_SETUP.md](./MONITORING_SETUP.md)

**Step-by-step monitoring installation and configuration**

```yaml
Purpose: Hands-on setup instructions
Covers:
  - Azure Application Insights setup
  - OpenTelemetry installation
  - Grafana configuration
  - Prometheus setup
  - Custom metric collection
  - Alert rule configuration
Time: 2-3 hours for complete setup
```

**Setup Steps:**

```bash
# 1. Install monitoring packages
npm install @azure/monitor-opentelemetry-exporter
npm install @opentelemetry/api @opentelemetry/sdk-node
npm install @opentelemetry/instrumentation-http
npm install @opentelemetry/instrumentation-express

# 2. Configure instrumentation
# See instrumentation.ts

# 3. Set environment variables
AZURE_MONITOR_CONNECTION_STRING=InstrumentationKey=your-key
OTEL_SERVICE_NAME=farmers-market-platform
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.your-region.monitor.azure.com

# 4. Start application with monitoring
npm run dev
```

---

### Monitoring Architecture

```yaml
Layers:

1. Application Layer:
  - Next.js instrumentation
  - API endpoint monitoring
  - React component tracking
  - Error boundary reporting

2. Infrastructure Layer:
  - Container health (Docker)
  - Database performance (PostgreSQL)
  - Cache metrics (Redis)
  - Network latency

3. User Experience Layer:
  - Core Web Vitals (LCP, FID, CLS)
  - Page load times
  - User interactions
  - Session recordings

4. Business Layer:
  - Order conversion rates
  - Revenue metrics
  - User engagement
  - Farm activity
```

---

## 🔍 Distributed Tracing

### OpenTelemetry Implementation

#### [TRACING_SETUP_GUIDE.md](./TRACING_SETUP_GUIDE.md)

**Complete OpenTelemetry tracing implementation**

```yaml
Purpose: Implement distributed tracing across platform
Covers:
  - OpenTelemetry concepts
  - Instrumentation setup
  - Custom span creation
  - Context propagation
  - Trace analysis
  - Performance optimization
Tools: OpenTelemetry, Azure Application Insights
```

---

#### [TRACING_CONFIGURATION.md](./TRACING_CONFIGURATION.md)

**Tracing configuration and customization**

```yaml
Purpose: Configure and customize tracing behavior
Covers:
  - Exporter configuration
  - Sampling strategies
  - Custom attributes
  - Span processors
  - Baggage propagation
  - Filter rules
```

---

### Tracing Examples

#### Basic Tracing

```typescript
// instrumentation.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter";

const sdk = new NodeSDK({
  traceExporter: new AzureMonitorTraceExporter({
    connectionString: process.env.AZURE_MONITOR_CONNECTION_STRING,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
    }),
  ],
});

sdk.start();

export default sdk;
```

---

#### Custom Spans

```typescript
// lib/services/farm.service.ts
import { trace, SpanStatusCode } from "@opentelemetry/api";

export class FarmService {
  async createFarm(farmData: CreateFarmRequest): Promise<Farm> {
    const tracer = trace.getTracer("farm-service");

    return await tracer.startActiveSpan("createFarm", async (span) => {
      // Add attributes
      span.setAttributes({
        "farm.name": farmData.name,
        "farm.owner_id": farmData.ownerId,
        operation: "create",
      });

      try {
        // Validate
        await tracer.startActiveSpan(
          "validateFarmData",
          async (validateSpan) => {
            await this.validateFarmData(farmData);
            validateSpan.end();
          },
        );

        // Create in database
        const farm = await tracer.startActiveSpan(
          "database.create",
          async (dbSpan) => {
            dbSpan.setAttributes({
              "db.system": "postgresql",
              "db.operation": "create",
              "db.table": "Farm",
            });

            const result = await database.farm.create({
              data: farmData,
            });

            dbSpan.end();
            return result;
          },
        );

        // Success
        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttribute("farm.id", farm.id);

        return farm;
      } catch (error) {
        // Error handling
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
```

---

#### Trace Context Propagation

```typescript
// Automatic context propagation in Next.js API routes
export async function GET(request: NextRequest) {
  const tracer = trace.getTracer("api");

  return await tracer.startActiveSpan("api.farms.list", async (span) => {
    span.setAttributes({
      "http.method": "GET",
      "http.url": request.url,
    });

    // Call service (context automatically propagated)
    const farms = await farmService.getAllFarms();

    span.setAttribute("farms.count", farms.length);
    span.end();

    return NextResponse.json({ farms });
  });
}
```

---

## ⚡ Performance Monitoring

### [PERFORMANCE_OPTIMIZATION_STRATEGY.md](./PERFORMANCE_OPTIMIZATION_STRATEGY.md)

**Comprehensive performance monitoring and optimization**

```yaml
Purpose: Monitor and optimize platform performance
Covers:
  - Performance baselines
  - Key performance indicators (KPIs)
  - Monitoring setup
  - Optimization strategies
  - Continuous improvement
Metrics: Response time, throughput, resource usage
```

---

### Key Performance Metrics

```yaml
Application Performance:
  Response Time:
    Target: <200ms (P95)
    Alert: >500ms (P95)
    Critical: >1000ms (P95)

  Error Rate:
    Target: <0.1%
    Alert: >1%
    Critical: >5%

  Throughput:
    Normal: 100-500 req/min
    Peak: 1000+ req/min
    Alert: <10 req/min (traffic drop)

Database Performance:
  Query Time:
    Target: <50ms (P95)
    Alert: >200ms (P95)
    Critical: >500ms (P95)

  Connection Pool:
    Target: <70% utilization
    Alert: >80% utilization
    Critical: >95% utilization

  Deadlocks:
    Target: 0 per hour
    Alert: >5 per hour

Frontend Performance:
  Largest Contentful Paint (LCP):
    Good: <2.5s
    Needs Improvement: 2.5-4.0s
    Poor: >4.0s

  First Input Delay (FID):
    Good: <100ms
    Needs Improvement: 100-300ms
    Poor: >300ms

  Cumulative Layout Shift (CLS):
    Good: <0.1
    Needs Improvement: 0.1-0.25
    Poor: >0.25
```

---

### Performance Monitoring Dashboard

```typescript
// lib/monitoring/metrics.ts
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("farmers-market-platform");

// Counter for requests
export const requestCounter = meter.createCounter("http.requests", {
  description: "Total HTTP requests",
});

// Histogram for latency
export const latencyHistogram = meter.createHistogram("http.latency", {
  description: "HTTP request latency",
  unit: "ms",
});

// Gauge for active connections
export const activeConnectionsGauge = meter.createObservableGauge(
  "database.active_connections",
  {
    description: "Active database connections",
  },
);

// Usage in API route
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  requestCounter.add(1, {
    method: "GET",
    route: "/api/farms",
  });

  try {
    const farms = await farmService.getAllFarms();

    const duration = Date.now() - startTime;
    latencyHistogram.record(duration, {
      method: "GET",
      route: "/api/farms",
      status: 200,
    });

    return NextResponse.json({ farms });
  } catch (error) {
    const duration = Date.now() - startTime;
    latencyHistogram.record(duration, {
      method: "GET",
      route: "/api/farms",
      status: 500,
    });

    throw error;
  }
}
```

---

## 🤖 Monitoring Bots

### Available Monitoring Bots

#### [WORKFLOW_MONITORING_BOT.md](./WORKFLOW_MONITORING_BOT.md)

**Automated workflow monitoring and reporting**

```yaml
Purpose: Monitor development workflows and CI/CD
Features:
  - Build status tracking
  - Deployment monitoring
  - Test result reporting
  - Coverage tracking
  - Automated notifications
Platform: GitHub Actions
```

---

#### [ENHANCED_MONITORING_BOT_V2.md](./ENHANCED_MONITORING_BOT_V2.md)

**Advanced monitoring bot with AI insights**

```yaml
Purpose: Intelligent monitoring with anomaly detection
Features:
  - Anomaly detection
  - Predictive alerts
  - Root cause analysis
  - Automated remediation suggestions
  - Trend analysis
Technology: AI/ML powered
```

---

#### [BOT_STATUS_AND_USAGE.md](./BOT_STATUS_AND_USAGE.md)

**Bot status tracking and usage guide**

```yaml
Purpose: Monitor and manage monitoring bots
Covers:
  - Bot health status
  - Usage statistics
  - Configuration management
  - Troubleshooting
  - Best practices
```

---

#### [TIER_1_AI_MONITORING_GUIDE.md](./TIER_1_AI_MONITORING_GUIDE.md)

**AI-powered monitoring tier 1 support**

```yaml
Purpose: AI-assisted first-level monitoring and triage
Features:
  - Intelligent alert triage
  - Automated response suggestions
  - Pattern recognition
  - Historical analysis
  - Escalation recommendations
```

---

### Bot Configuration Example

```yaml
# .github/workflows/monitoring-bot.yml
name: Monitoring Bot

on:
  schedule:
    - cron: "*/5 * * * *" # Every 5 minutes
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Application Health
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://farmersmarket.com/api/health)
          if [ $response -ne 200 ]; then
            echo "Health check failed with status $response"
            exit 1
          fi

      - name: Check Database Health
        run: |
          response=$(curl -s https://farmersmarket.com/api/health/db)
          status=$(echo $response | jq -r '.status')
          if [ "$status" != "healthy" ]; then
            echo "Database health check failed"
            exit 1
          fi

      - name: Send Alert on Failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Health Check Failed',
              body: 'Automated health check detected system issues.',
              labels: ['incident', 'monitoring']
            });
```

---

## 🚨 Alerting System

### Alert Configuration

```yaml
Alert Severities:

P0 - Critical:
  - Platform down (>5 min)
  - Database unavailable
  - Payment system failure
  - Data loss detected
  Response: Immediate (PagerDuty)
  SLA: 15 minutes

P1 - High:
  - API errors >5%
  - Response time >1s (P95)
  - Authentication failures >10%
  - Critical feature broken
  Response: Within 1 hour
  SLA: 4 hours

P2 - Medium:
  - API errors >1%
  - Response time >500ms (P95)
  - Non-critical feature issues
  - Performance degradation
  Response: Within 4 hours
  SLA: 24 hours

P3 - Low:
  - Minor performance issues
  - UI inconsistencies
  - Documentation outdated
  - Enhancement requests
  Response: Next business day
  SLA: 1 week
```

---

### Alert Rules

```typescript
// monitoring/alerts.ts
export const alertRules = [
  {
    name: "High Error Rate",
    condition: "error_rate > 5%",
    severity: "P0",
    channels: ["pagerduty", "slack", "email"],
    actions: ["page_oncall", "create_incident"],
  },
  {
    name: "Slow API Response",
    condition: "response_time_p95 > 1000ms",
    severity: "P1",
    channels: ["slack", "email"],
    actions: ["notify_team"],
  },
  {
    name: "Database Connection Pool Full",
    condition: "db_pool_utilization > 90%",
    severity: "P1",
    channels: ["slack", "email"],
    actions: ["notify_devops", "auto_scale"],
  },
  {
    name: "Traffic Drop",
    condition: "request_rate < 10/min for 10min",
    severity: "P2",
    channels: ["slack"],
    actions: ["investigate"],
  },
];
```

---

### Incident Response

```yaml
Incident Response Workflow:

1. Detection (Automated):
  - Alert triggered
  - PagerDuty notification
  - Slack notification
  - Incident ticket created

2. Triage (5-15 min):
  - Assess severity
  - Check dashboards
  - Review recent deployments
  - Assign incident commander

3. Investigation (15-60 min):
  - Review traces and logs
  - Identify root cause
  - Determine scope of impact
  - Communicate status

4. Mitigation (30-120 min):
  - Implement fix or rollback
  - Verify resolution
  - Monitor metrics
  - Update stakeholders

5. Resolution:
  - Confirm stability
  - Document incident
  - Schedule post-mortem
  - Close incident ticket

6. Post-Mortem (Within 48 hours):
  - Timeline reconstruction
  - Root cause analysis
  - Action items
  - Process improvements
```

---

## 📊 Analytics

### Usage Analytics

```yaml
User Metrics:
  - Daily/Monthly Active Users (DAU/MAU)
  - User retention rate
  - Session duration
  - Pages per session
  - Bounce rate

Farm Metrics:
  - Active farms
  - Products listed
  - Average products per farm
  - Farm verification rate
  - Farm engagement score

Transaction Metrics:
  - Order conversion rate
  - Average order value
  - Revenue per user
  - Cart abandonment rate
  - Payment success rate

Platform Metrics:
  - Page views
  - API calls
  - Search queries
  - Feature usage
  - Error rates by feature
```

---

### Analytics Implementation

```typescript
// lib/analytics/track.ts
import { track } from "@vercel/analytics";

export const analytics = {
  // User events
  userSignUp: (userId: string, method: string) => {
    track("user_sign_up", { userId, method });
  },

  userLogin: (userId: string) => {
    track("user_login", { userId });
  },

  // Farm events
  farmCreated: (farmId: string, userId: string) => {
    track("farm_created", { farmId, userId });
  },

  productAdded: (productId: string, farmId: string) => {
    track("product_added", { productId, farmId });
  },

  // Transaction events
  orderPlaced: (orderId: string, amount: number) => {
    track("order_placed", { orderId, amount });
  },

  paymentCompleted: (orderId: string, amount: number) => {
    track("payment_completed", { orderId, amount });
  },

  // Engagement events
  searchPerformed: (query: string, results: number) => {
    track("search_performed", { query, results });
  },

  pageViewed: (path: string) => {
    track("page_viewed", { path });
  },
};
```

---

## 📈 Dashboards

### Key Dashboards

```yaml
1. Executive Dashboard:
   - Business metrics overview
   - Revenue tracking
   - User growth
   - Platform health summary
   - Key KPIs
   Audience: Leadership, stakeholders

2. Engineering Dashboard:
   - Application performance
   - Error rates and types
   - Deployment status
   - Test coverage
   - Technical debt
   Audience: Developers, tech leads

3. Operations Dashboard:
   - Infrastructure metrics
   - System resources
   - Database performance
   - Cache hit rates
   - Alert summary
   Audience: DevOps, SRE

4. User Experience Dashboard:
   - Core Web Vitals
   - Page load times
   - Error boundaries
   - User flows
   - Session recordings
   Audience: Product, UX designers

5. Business Analytics Dashboard:
   - Conversion funnels
   - Feature adoption
   - User engagement
   - Revenue metrics
   - Growth trends
   Audience: Product, marketing
```

---

## 🔧 Monitoring Best Practices

### Do's ✅

```yaml
✅ Monitor end-to-end user journeys
✅ Set up synthetic monitoring for critical paths
✅ Use meaningful alert thresholds (avoid alert fatigue)
✅ Track business metrics alongside technical metrics
✅ Implement distributed tracing for all services
✅ Create runbooks for common incidents
✅ Review and tune alerts regularly
✅ Monitor monitoring (meta-monitoring)
✅ Use dashboards that answer specific questions
✅ Document monitoring setup and processes
```

---

### Don'ts ❌

```yaml
❌ Don't alert on everything (alert fatigue)
❌ Don't ignore monitoring in development
❌ Don't forget to monitor monitoring systems
❌ Don't set static thresholds (use anomaly detection)
❌ Don't overlook business metrics
❌ Don't ignore user-reported issues
❌ Don't create dashboards without purpose
❌ Don't forget to test alerts
❌ Don't skip post-mortems
❌ Don't monitor without acting on insights
```

---

## 🛠️ Troubleshooting Monitoring

### Common Issues

```yaml
Missing Traces:
  - Check OTEL configuration
  - Verify connection string
  - Check sampling rate
  - Review exporter logs

High Latency in Traces:
  - Reduce span creation
  - Increase sampling rate
  - Use async exporters
  - Batch span processing

Dashboard Not Updating:
  - Check data source connection
  - Verify metric collection
  - Check query syntax
  - Review time range

Alerts Not Firing:
  - Verify alert rule syntax
  - Check notification channels
  - Review alert conditions
  - Test alert manually
```

---

## 📚 Related Documentation

- **[Troubleshooting Hub](../troubleshooting/README.md)** — Problem solving guide
- **[Performance Guide](../guides/PERFORMANCE_OPTIMIZATION.md)** — Optimization strategies
- **[Deployment Guide](../deployment/README.md)** — Production deployment
- **[Development Guide](../development/README.md)** — Development workflows

---

## 🔗 External Resources

```yaml
OpenTelemetry:
  - Docs: https://opentelemetry.io/docs/
  - Specification: https://opentelemetry.io/docs/specs/otel/
  - JavaScript SDK: https://github.com/open-telemetry/opentelemetry-js

Azure Monitor:
  - Docs: https://learn.microsoft.com/azure/azure-monitor/
  - Application Insights: https://learn.microsoft.com/azure/azure-monitor/app/
  - Query Language: https://learn.microsoft.com/azure/data-explorer/kusto/query/

Best Practices:
  - Google SRE Book: https://sre.google/books/
  - Monitoring Distributed Systems: https://sre.google/sre-book/monitoring-distributed-systems/
```

---

**Last Updated:** December 2024  
**Maintained By:** DevOps & SRE Team  
**Status:** ✅ Comprehensive Production Monitoring

📊 **Monitoring divine agricultural platform with complete observability!** ⚡✨
