# 🚀 Phase 3 Quick Start Guide

**Farmers Market Platform - Monitoring Dashboard**

Last Updated: November 26, 2025  
Version: 1.0.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Setup (5 Minutes)](#quick-setup-5-minutes)
4. [Testing the Dashboard](#testing-the-dashboard)
5. [API Endpoints](#api-endpoints)
6. [Troubleshooting](#troubleshooting)
7. [Next Steps](#next-steps)

---

## 🎯 Overview

Phase 3 implements a **real-time monitoring dashboard** with:

- ✅ Live system health monitoring
- ✅ Workflow execution tracking
- ✅ Alert management
- ✅ Performance metrics
- ✅ 4 RESTful API endpoints
- ✅ 5 interactive dashboard widgets

**Status:** Week 1 Complete (85%) - Missing WebSocket (coming in next session)

---

## ✅ Prerequisites

Before starting, ensure you have:

- [x] Node.js 20+ installed
- [x] Database running (PostgreSQL)
- [x] Monitoring daemon running (PM2)
- [x] Phase 1 & 2 completed

**Quick Check:**

```bash
# Check daemon status
npm run monitor:daemon:status

# Should show: 🟢 HEALTHY
```

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Verify Daemon is Running

```bash
# Check PM2 status
pm2 status

# You should see:
# ┌────┬─────────────────────┬─────────┬─────┬──────────┐
# │ id │ name                │ mode    │ ↺   │ status   │
# ├────┼─────────────────────┼─────────┼─────┼──────────┤
# │ 0  │ workflow-monitor-…  │ fork    │ 1   │ online   │
# └────┴─────────────────────┴─────────┴─────┴──────────┘
```

**If daemon is not running:**

```bash
npm run monitor:daemon:pm2
```

### Step 2: Start Development Server

```bash
# Start Next.js dev server
npm run dev

# Server will start at: http://localhost:3000
# Wait for "Ready" message (10-15 seconds)
```

### Step 3: Open Dashboard

Open your browser and navigate to:

```
http://localhost:3000/dashboard
```

You should see:

- System health status widget
- Recent workflow executions
- Active alerts
- Performance metrics

### Step 4: Test API Endpoints

Run the API test suite:

```bash
# In a new terminal (keep dev server running)
npm run monitor:dashboard:test
```

**Expected output:**

```
╔════════════════════════════════════════════════════════════╗
║  🧪 DASHBOARD API TEST SUITE                              ║
║  Farmers Market Platform - Monitoring Dashboard           ║
╚════════════════════════════════════════════════════════════╝

🔍 Checking database connection...
✅ Database connection successful
   Workflow Executions: 2
   Health Checks: 4
   Notifications: 0

📡 Testing API endpoints at: http://localhost:3000

============================================================
🧪 Testing Overview API
============================================================

✅ Dashboard Overview
   Status: PASS
   Duration: 45ms
   Data Keys: systemHealth, workflows, alerts, performance
   System Status: HEALTHY

[... more tests ...]

============================================================
📊 TEST SUMMARY
============================================================
Total Tests: 10
✅ Passed: 10
❌ Failed: 0
⚡ Avg Duration: 52ms
🎯 Success Rate: 100.0%
============================================================

🎉 All tests passed! Dashboard APIs are working correctly.
```

---

## 🧪 Testing the Dashboard

### Manual Testing Checklist

Open the dashboard and verify:

**System Health Widget:**

- [ ] Shows green/red status indicator
- [ ] Displays 4 service checks (Database, API, Cache, External Services)
- [ ] Shows last check time
- [ ] Updates every 30 seconds

**Workflow Execution Widget:**

- [ ] Lists recent workflow runs
- [ ] Shows status badges (SUCCESS/FAILED/RUNNING)
- [ ] Displays duration for each execution
- [ ] Click "Show More" expands the list
- [ ] Shows success rate percentage

**Alerts Widget:**

- [ ] Lists active notifications
- [ ] Filter tabs work (All, Critical, High, Medium)
- [ ] Shows priority badges with colors
- [ ] Displays time ago for each alert
- [ ] Shows alert summary counts

**Performance Metrics Widget:**

- [ ] Metric selector switches between Duration/Throughput/Success Rate
- [ ] Bar chart displays 12-hour data
- [ ] Hover tooltips appear on chart bars
- [ ] Stats cards show current metrics
- [ ] Duration stats table shows Min/Median/Avg/Max

### Browser DevTools Check

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Refresh the dashboard page
4. Check for API calls:
   - Status should be **200 OK**
   - Response time should be < 200ms
   - No errors in Console tab

### API Testing (CLI)

Test individual endpoints:

```bash
# Overview (system health + stats)
curl http://localhost:3000/api/monitoring/dashboard/overview | jq '.'

# Executions (paginated)
curl "http://localhost:3000/api/monitoring/dashboard/executions?limit=10" | jq '.'

# Alerts (by priority)
curl "http://localhost:3000/api/monitoring/dashboard/alerts?priority=CRITICAL" | jq '.'

# Metrics (time series)
curl "http://localhost:3000/api/monitoring/dashboard/metrics?period=24h" | jq '.'
```

---

## 🔌 API Endpoints

### 1. Dashboard Overview

**Endpoint:** `GET /api/monitoring/dashboard/overview`

**Purpose:** Get complete dashboard overview including system health, workflow stats, alerts, and performance.

**Response:**

```json
{
  "success": true,
  "data": {
    "systemHealth": {
      "status": "HEALTHY",
      "lastCheck": "2025-11-26T06:53:32.000Z",
      "checks": {
        "database": true,
        "api": true,
        "cache": true,
        "externalServices": true
      }
    },
    "workflows": {
      "total": 100,
      "today": 25,
      "active": 6,
      "success_rate": 95.5
    },
    "alerts": {
      "critical": 0,
      "warning": 2,
      "info": 5
    },
    "performance": {
      "avgResponseTime": 45,
      "avgDuration": 1250,
      "successRate": 96.3
    }
  }
}
```

### 2. Workflow Executions

**Endpoint:** `GET /api/monitoring/dashboard/executions`

**Query Parameters:**

- `limit` (default: 50, max: 100)
- `offset` (default: 0)
- `status` (SUCCESS | FAILED | RUNNING | PENDING)
- `workflowId` (filter by workflow)
- `startDate` (ISO date string)
- `endDate` (ISO date string)

**Example:**

```bash
GET /api/monitoring/dashboard/executions?limit=10&status=SUCCESS
```

### 3. Active Alerts

**Endpoint:** `GET /api/monitoring/dashboard/alerts`

**Query Parameters:**

- `priority` (CRITICAL | HIGH | MEDIUM | LOW)
- `limit` (default: 50, max: 100)
- `hours` (look back hours, default: 24)

**Example:**

```bash
GET /api/monitoring/dashboard/alerts?priority=CRITICAL&hours=12
```

### 4. Performance Metrics

**Endpoint:** `GET /api/monitoring/dashboard/metrics`

**Query Parameters:**

- `period` (1h | 6h | 24h | 7d | 30d) - default: 24h
- `interval` (1m | 5m | 15m | 1h | 1d) - default: auto
- `metric` (responseTime | duration | throughput | successRate)

**Example:**

```bash
GET /api/monitoring/dashboard/metrics?period=24h&interval=15m
```

---

## 🐛 Troubleshooting

### Issue: Dashboard shows "Error Loading Dashboard"

**Cause:** Database connection issue or no monitoring data.

**Solution:**

```bash
# 1. Check daemon status
npm run monitor:daemon:status

# 2. If unhealthy, restart daemon
npm run monitor:daemon:restart

# 3. Check database connection
docker ps | grep farmers-market-db

# 4. Verify database has data
npm run db:studio
```

### Issue: API returns 404 Not Found

**Cause:** Dev server not running or wrong port.

**Solution:**

```bash
# 1. Check if dev server is running
lsof -ti:3001  # Should return a process ID

# 2. If not running, start it
npm run dev

# 3. Wait for "Ready" message
# 4. Try accessing: http://localhost:3000/dashboard
```

### Issue: Empty dashboard (no data showing)

**Cause:** No workflow executions yet in database.

**Solution:**

```bash
# Let the daemon run for 5-10 minutes to collect data
# The health-check workflow runs every 5 minutes

# Check execution count
npm run monitor:daemon:status

# Should show:
# 📊 Total executions: X (where X > 0)
```

### Issue: "fetch failed" or ECONNREFUSED

**Cause:** API endpoints not accessible or server not ready.

**Solution:**

```bash
# 1. Ensure dev server is fully started
npm run dev
# Wait for "✓ Ready" message

# 2. Check server is listening
curl http://localhost:3000/api/health

# 3. If testing APIs, wait 15 seconds after server starts
# Then run: npm run monitor:dashboard:test
```

### Issue: TypeScript errors during build

**Cause:** Known issues in script files (non-blocking).

**Solution:**

```bash
# These don't affect dashboard functionality
# To ignore for now, use:
npm run dev  # Development mode doesn't fail on TS errors

# To see dashboard-specific files only:
npx tsc --noEmit src/app/api/monitoring/dashboard/**/*.ts
npx tsc --noEmit src/components/monitoring/dashboard/**/*.tsx
```

---

## 🎯 Next Steps

### Phase 3 Week 1 Completion

- [x] Dashboard API endpoints (4/4)
- [x] Dashboard components (5/5)
- [x] Layout and navigation
- [x] Loading states
- [ ] **WebSocket real-time updates** (Coming next!)
- [ ] Integration tests

### Week 2: ML Analytics (Starting Soon)

1. **Anomaly Detection Service**
   - Z-score based detection
   - Moving averages
   - Threshold alerts

2. **Pattern Recognition**
   - Execution pattern analysis
   - Failure prediction
   - Performance trends

3. **Predictive Analytics**
   - Success rate forecasting
   - Resource usage prediction
   - Execution time estimates

### Week 3: Advanced Features

- Alert persistence (ACTIVE → ACKNOWLEDGED → RESOLVED)
- Enhanced metrics API
- Advanced reporting (PDF generation)
- Multi-environment support

### Week 4: Optimization

- Query optimization and indexes
- Redis caching layer
- Load testing (100+ concurrent users)
- Performance benchmarks

---

## 📚 Additional Resources

### Documentation

- **Phase 3 Kickoff:** `docs/PHASE_3_KICKOFF.md`
- **Dashboard Implementation Guide:** `docs/DASHBOARD_IMPLEMENTATION_GUIDE.md`
- **Session 2 Summary:** `docs/PHASE_3_SESSION_2_SUMMARY.md`
- **Quick Reference:** `docs/PHASE_3_QUICK_REFERENCE.md`

### Code Locations

```
src/
├── app/
│   ├── api/monitoring/dashboard/     # API endpoints
│   └── (monitoring)/dashboard/       # Dashboard page
├── components/monitoring/dashboard/  # Dashboard widgets
└── lib/
    ├── database/                     # Database access
    └── monitoring/                   # Monitoring logic
```

### Useful Commands

```bash
# Daemon Management
npm run monitor:daemon:status        # Check daemon health
npm run monitor:daemon:pm2          # Start daemon
npm run monitor:daemon:restart      # Restart daemon
npm run monitor:daemon:logs         # View logs

# Development
npm run dev                         # Start dev server
npm run monitor:dashboard:test      # Test APIs

# Database
docker exec -it farmers-market-db psql -U postgres -d farmersmarket
# SQL: SELECT COUNT(*) FROM workflow_executions;

# PM2 Management
pm2 status                          # Check processes
pm2 logs workflow-monitor-daemon    # View logs
pm2 monit                          # Live monitoring
```

---

## ✅ Verification Checklist

Before proceeding to Week 2, verify:

- [ ] Daemon is running and HEALTHY
- [ ] Dashboard loads without errors
- [ ] All 4 widgets display data
- [ ] API test suite passes (10/10)
- [ ] No console errors in browser
- [ ] Database has monitoring data
- [ ] Navigation works correctly
- [ ] Mobile responsive layout works

**All checked?** 🎉 **You're ready for Phase 3 Week 2!**

---

## 🆘 Getting Help

### Check Logs

```bash
# Daemon logs
pm2 logs workflow-monitor-daemon

# Next.js logs
# Check terminal where `npm run dev` is running

# Database logs
docker logs farmers-market-db
```

### Status Check

```bash
npm run monitor:daemon:status
```

### Force Restart

```bash
# Restart everything
npm run monitor:daemon:restart
# Wait 10 seconds
npm run dev
```

---

**Dashboard Status:** 🟢 OPERATIONAL  
**Phase 3 Progress:** Week 1 (85% Complete)  
**Next Session:** Real-time updates + ML foundation

_Happy Monitoring! 🌾🚀_
