# 🎯 Performance Monitoring Dashboard Implementation Plan

**Priority:** HIGH  
**Estimated Time:** 4-6 hours  
**Status:** 📋 PLANNED  
**Impact:** Production visibility and debugging

---

## 📊 CURRENT STATUS

### ✅ What We Have

- ✅ OpenTelemetry instrumentation configured
- ✅ 25 monitoring files implemented
- ✅ Performance tracking utilities (4 files)
- ✅ Telemetry data collection
- ✅ Error tracking setup
- ✅ Logging infrastructure

### ❌ What's Missing

- ❌ Visual dashboard to view metrics
- ❌ Real-time performance charts
- ❌ Alert configuration UI
- ❌ Historical trend analysis
- ❌ Quick health check interface

---

## 🎯 IMPLEMENTATION PLAN

### Phase 1: Basic Dashboard (2 hours)

#### 1.1 Create Monitoring Route

**File:** `src/app/(monitoring)/performance/page.tsx`

**Features:**

- Server-side rendered performance metrics
- Real-time system health status
- Key performance indicators (KPIs)
- Recent error logs
- Active user count
- API response times

**Tech Stack:**

- Next.js Server Components
- Recharts for visualizations
- Tailwind CSS for styling
- Server Actions for real-time updates

#### 1.2 Create API Endpoints

**Files:**

- `src/app/api/monitoring/metrics/route.ts`
- `src/app/api/monitoring/health/route.ts`
- `src/app/api/monitoring/errors/route.ts`

**Endpoints:**

```typescript
GET /api/monitoring/metrics    - Current performance metrics
GET /api/monitoring/health     - System health check
GET /api/monitoring/errors     - Recent errors
GET /api/monitoring/traces     - OpenTelemetry traces
```

#### 1.3 Create Dashboard Components

**Directory:** `src/components/monitoring/`

**Components:**

- `MetricsCard.tsx` - Display individual metrics
- `PerformanceChart.tsx` - Line/bar charts
- `HealthStatus.tsx` - System health indicator
- `ErrorList.tsx` - Recent errors display
- `AlertsPanel.tsx` - Active alerts

---

### Phase 2: Advanced Features (2 hours)

#### 2.1 Real-time Metrics

- WebSocket connection for live updates
- Auto-refresh every 10 seconds
- Push notifications for critical alerts
- Live API response time monitoring

#### 2.2 Historical Data

- Store metrics in database (TimescaleDB extension)
- 7-day rolling window
- Aggregated hourly/daily statistics
- Trend analysis and predictions

#### 2.3 Custom Dashboards

- Create custom metric views
- Save dashboard configurations
- Export metrics data (CSV/JSON)
- Share dashboard links

---

### Phase 3: Alerts & Notifications (1-2 hours)

#### 3.1 Alert Rules Engine

- CPU usage > 80%
- Memory usage > 90%
- API response time > 2s
- Error rate > 5%
- Database query time > 1s

#### 3.2 Notification Channels

- Email notifications
- Slack webhooks
- Discord webhooks
- In-app notifications
- SMS alerts (Twilio)

---

## 📁 FILE STRUCTURE

```
src/
├── app/
│   ├── (monitoring)/
│   │   └── performance/
│   │       ├── page.tsx                    # Main dashboard
│   │       ├── alerts/page.tsx             # Alerts configuration
│   │       ├── traces/page.tsx             # OpenTelemetry traces
│   │       └── analytics/page.tsx          # Analytics view
│   └── api/
│       └── monitoring/
│           ├── metrics/route.ts            # Metrics endpoint
│           ├── health/route.ts             # Health check
│           ├── errors/route.ts             # Error logs
│           ├── traces/route.ts             # Trace data
│           └── alerts/route.ts             # Alert management
├── components/
│   └── monitoring/
│       ├── MetricsCard.tsx                 # Metric display card
│       ├── PerformanceChart.tsx            # Charts component
│       ├── HealthStatus.tsx                # Health indicator
│       ├── ErrorList.tsx                   # Error display
│       ├── AlertsPanel.tsx                 # Alerts panel
│       ├── TraceViewer.tsx                 # Trace visualization
│       └── MetricSelector.tsx              # Metric picker
└── lib/
    └── monitoring/
        ├── metrics-collector.ts            # Collect metrics
        ├── alerts-engine.ts                # Alert processing
        ├── performance-calculator.ts       # Calculate metrics
        └── notification-service.ts         # Send notifications
```

---

## 🎨 DASHBOARD DESIGN

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  🌾 Performance Monitoring Dashboard                       │
├────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ CPU      │ │ Memory   │ │ API Resp │ │ Errors   │     │
│  │ 45%      │ │ 62%      │ │ 245ms    │ │ 3        │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
├────────────────────────────────────────────────────────────┤
│  Response Times (Last 24h)                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │  📈 Chart showing API response times over time      │   │
│  └────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────┐    │
│  │ Recent Errors        │  │ Active Alerts            │    │
│  │ - Error 1           │  │ ⚠️ High memory usage     │    │
│  │ - Error 2           │  │ 🔴 API timeout          │    │
│  │ - Error 3           │  │                          │    │
│  └─────────────────────┘  └─────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

## 📊 KEY METRICS TO TRACK

### System Metrics

- ✅ CPU usage (%)
- ✅ Memory usage (MB/%)
- ✅ Disk I/O (MB/s)
- ✅ Network I/O (MB/s)
- ✅ Active connections
- ✅ Database connections

### Application Metrics

- ✅ API response times (p50, p95, p99)
- ✅ Request rate (req/s)
- ✅ Error rate (%)
- ✅ Success rate (%)
- ✅ Concurrent users
- ✅ Session duration

### Business Metrics

- ✅ Active orders
- ✅ Checkout conversion rate
- ✅ Cart abandonment rate
- ✅ Product views
- ✅ Search queries
- ✅ Revenue (hourly/daily)

### Database Metrics

- ✅ Query execution time (ms)
- ✅ Slow queries (>1s)
- ✅ Connection pool usage
- ✅ Cache hit rate (%)
- ✅ Transaction rate
- ✅ Lock wait time

---

## 💻 IMPLEMENTATION CODE EXAMPLES

### Example 1: Dashboard Page

```typescript
// src/app/(monitoring)/performance/page.tsx
import { Suspense } from 'react';
import { MetricsCard } from '@/components/monitoring/MetricsCard';
import { PerformanceChart } from '@/components/monitoring/PerformanceChart';
import { HealthStatus } from '@/components/monitoring/HealthStatus';
import { ErrorList } from '@/components/monitoring/ErrorList';
import { getMetrics, getErrors, getHealthStatus } from '@/lib/monitoring/metrics-collector';

export default async function PerformanceDashboard() {
  const [metrics, errors, health] = await Promise.all([
    getMetrics(),
    getErrors(),
    getHealthStatus(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Monitoring</h1>
        <HealthStatus status={health} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="CPU Usage"
          value={metrics.cpu.toFixed(1)}
          unit="%"
          trend={metrics.cpuTrend}
        />
        <MetricsCard
          title="Memory"
          value={metrics.memory.toFixed(1)}
          unit="%"
          trend={metrics.memoryTrend}
        />
        <MetricsCard
          title="API Response"
          value={metrics.apiResponseTime.toFixed(0)}
          unit="ms"
          trend={metrics.apiTrend}
        />
        <MetricsCard
          title="Errors"
          value={metrics.errorCount}
          unit=""
          trend={metrics.errorTrend}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart
          title="Response Times (24h)"
          data={metrics.responseTimeHistory}
          type="line"
        />
        <PerformanceChart
          title="Request Rate"
          data={metrics.requestRateHistory}
          type="area"
        />
      </div>

      {/* Errors & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorList errors={errors} />
        <AlertsPanel alerts={metrics.activeAlerts} />
      </div>
    </div>
  );
}
```

### Example 2: Metrics API Endpoint

```typescript
// src/app/api/monitoring/metrics/route.ts
import { NextResponse } from "next/server";
import os from "os";
import { database } from "@/lib/database";
import { telemetry } from "@/lib/monitoring/telemetry";

export async function GET() {
  try {
    // System metrics
    const cpuUsage = (os.loadavg()[0] / os.cpus().length) * 100;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    // Application metrics from OpenTelemetry
    const traces = await telemetry.getRecentTraces(100);
    const avgResponseTime =
      traces.reduce((sum, t) => sum + t.duration, 0) / traces.length;

    // Database metrics
    const dbMetrics = await database.$queryRaw`
      SELECT 
        COUNT(*) as active_connections,
        AVG(query_time) as avg_query_time
      FROM pg_stat_activity
      WHERE state = 'active'
    `;

    // Error metrics
    const recentErrors = await database.errorLog.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      system: {
        cpu: cpuUsage,
        memory: memoryUsage,
        uptime: os.uptime(),
      },
      application: {
        responseTime: avgResponseTime,
        requestRate: traces.length / 60, // Per minute
        errorCount: recentErrors,
      },
      database: {
        connections: dbMetrics[0].active_connections,
        avgQueryTime: dbMetrics[0].avg_query_time,
      },
    });
  } catch (error) {
    console.error("Metrics collection error:", error);
    return NextResponse.json(
      { error: "Failed to collect metrics" },
      { status: 500 },
    );
  }
}
```

### Example 3: Metrics Card Component

```typescript
// src/components/monitoring/MetricsCard.tsx
'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  threshold?: number;
}

export function MetricsCard({ title, value, unit, trend, threshold }: MetricsCardProps) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isWarning = threshold && numValue > threshold;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${isWarning ? 'border-red-500' : 'border-blue-500'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <span className="ml-2 text-gray-600">{unit}</span>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center ${trendColor}`}>
            <TrendIcon className="w-6 h-6" />
          </div>
        )}
      </div>
      {isWarning && (
        <p className="mt-2 text-xs text-red-600">⚠️ Exceeds threshold ({threshold}{unit})</p>
      )}
    </div>
  );
}
```

---

## 🔧 CONFIGURATION

### Environment Variables

```env
# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_INTERVAL=10000          # 10 seconds
MONITORING_RETENTION_DAYS=7

# Alert Thresholds
ALERT_CPU_THRESHOLD=80
ALERT_MEMORY_THRESHOLD=90
ALERT_API_THRESHOLD=2000           # 2 seconds
ALERT_ERROR_RATE_THRESHOLD=5       # 5%

# Notification Channels
ALERT_EMAIL=alerts@farmersmarket.com
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/...
ALERT_DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
```

---

## 🧪 TESTING PLAN

### Unit Tests

- [ ] Metrics collection functions
- [ ] Alert rule evaluation
- [ ] Notification sending
- [ ] Data aggregation

### Integration Tests

- [ ] API endpoints response
- [ ] Database metrics queries
- [ ] OpenTelemetry integration
- [ ] Real-time updates

### E2E Tests

- [ ] Dashboard renders correctly
- [ ] Charts display data
- [ ] Alerts trigger properly
- [ ] Notifications sent

---

## 📈 SUCCESS METRICS

### Completion Criteria

- ✅ Dashboard page loads successfully
- ✅ Metrics display in real-time
- ✅ Charts render performance data
- ✅ Alerts trigger on threshold breach
- ✅ Notifications sent successfully
- ✅ Historical data viewable
- ✅ Mobile-responsive design

### Performance Targets

- Dashboard load time < 1s
- Metrics refresh < 500ms
- Chart render time < 100ms
- API response time < 200ms

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Create monitoring database tables
- [ ] Set up TimescaleDB extension (optional)
- [ ] Configure alert rules
- [ ] Test notification channels
- [ ] Add monitoring to navigation
- [ ] Restrict access to admin role
- [ ] Document dashboard usage
- [ ] Train team on dashboard

---

## 📚 DEPENDENCIES

### Required Packages

```json
{
  "dependencies": {
    "recharts": "^2.10.0", // Charts library
    "date-fns": "^3.0.0", // Date formatting
    "lucide-react": "^0.300.0" // Icons (already installed)
  }
}
```

### Install Command

```bash
npm install recharts date-fns
```

---

## 🎯 PRIORITIZATION

### Must Have (Phase 1)

1. Basic dashboard page
2. Key metrics display (CPU, Memory, API, Errors)
3. Health status indicator
4. Recent errors list
5. Simple line charts

### Should Have (Phase 2)

1. Real-time updates
2. Historical data (7 days)
3. Alert configuration UI
4. Multiple chart types
5. Export functionality

### Nice to Have (Phase 3)

1. Custom dashboards
2. Advanced analytics
3. Predictive alerts
4. Mobile app
5. API documentation

---

## 💡 TIPS & BEST PRACTICES

1. **Start Simple** - Basic dashboard first, add features incrementally
2. **Use Server Components** - Faster initial load, better SEO
3. **Lazy Load Charts** - Only load when visible
4. **Cache Metrics** - Cache for 10 seconds to reduce load
5. **Aggregate Data** - Store hourly aggregates for historical data
6. **Set Realistic Thresholds** - Monitor for a week before setting alerts
7. **Test Notifications** - Verify all channels before production
8. **Document Everything** - Alert meanings, metric definitions

---

## 🔗 RELATED FILES

- `src/lib/monitoring/` - Existing monitoring utilities
- `instrumentation.ts` - OpenTelemetry setup
- `src/lib/monitoring/telemetry.ts` - Telemetry service
- `src/lib/monitoring/performance-tracker.ts` - Performance tracking

---

## 📞 SUPPORT

If you need help implementing this:

1. Review existing monitoring files in `src/lib/monitoring/`
2. Check OpenTelemetry documentation
3. Refer to Recharts documentation for charts
4. Test in development before production

---

## ✅ NEXT STEPS

1. **Immediate**: Review this plan and approve
2. **Week 1**: Implement Phase 1 (Basic Dashboard)
3. **Week 2**: Implement Phase 2 (Advanced Features)
4. **Week 3**: Implement Phase 3 (Alerts)
5. **Week 4**: Testing and refinement

---

**Estimated Total Time:** 4-6 hours for basic implementation  
**Full Implementation:** 2-3 days for all phases  
**Priority:** HIGH (Required for production monitoring)  
**Status:** 📋 Ready to implement

---

_This implementation will complete the missing Performance Monitoring capability and bring the platform score from 92.3% to 100%!_ 🎯
