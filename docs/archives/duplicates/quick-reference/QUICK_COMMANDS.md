# ⚡ Quick Commands Reference

## Workflow Monitoring Bot - Phase 3

**Last Updated**: November 26, 2025  
**Status**: ✅ SYSTEM OPERATIONAL

---

## 🚀 Essential Commands

### Check System Health

```bash
# Comprehensive daemon status (RECOMMENDED)
npm run monitor:daemon:status

# PM2 process status
pm2 status

# View live logs
pm2 logs workflow-monitor-daemon

# View last 50 log lines
pm2 logs workflow-monitor-daemon --lines 50 --nostream
```

### Daemon Management

```bash
# Start daemon with PM2
npm run monitor:daemon:pm2

# Restart daemon
npm run monitor:daemon:restart

# Stop daemon
npm run monitor:daemon:stop

# View logs
npm run monitor:daemon:logs
```

### Development

```bash
# Start Next.js dev server (port 3001)
npm run dev

# Type check
npm run type-check

# Run tests
npm test

# Lint and format
npm run lint:fix && npm run format

# Build for production
npm run build
```

### Database Queries

```bash
# Count workflow executions
docker exec farmers-market-db psql -U postgres -d farmersmarket -c "SELECT COUNT(*) FROM workflow_executions;"

# View recent executions
docker exec farmers-market-db psql -U postgres -d farmersmarket -c "SELECT * FROM workflow_executions ORDER BY started_at DESC LIMIT 10;"

# View recent health checks
docker exec farmers-market-db psql -U postgres -d farmersmarket -c "SELECT * FROM system_health_checks ORDER BY created_at DESC LIMIT 10;"

# View active schedules
docker exec farmers-market-db psql -U postgres -d farmersmarket -c "SELECT * FROM workflow_schedules WHERE enabled = true;"

# Connect to database shell
docker exec -it farmers-market-db psql -U postgres -d farmersmarket
```

### Docker Management

```bash
# View running containers
docker ps

# View all containers
docker ps -a

# Restart database
docker restart farmers-market-db

# View database logs
docker logs farmers-market-db

# View app logs
docker logs farmers-market-app
```

---

## 🎯 Common Workflows

### Starting Fresh Development Session

```bash
# 1. Check system health
npm run monitor:daemon:status

# 2. Verify daemon is running
pm2 status

# 3. Start dev server
npm run dev

# 4. Open dashboard
# http://localhost:3000/dashboard
```

### Daemon Not Working

```bash
# 1. Check status
npm run monitor:daemon:status

# 2. View logs for errors
pm2 logs workflow-monitor-daemon --lines 100

# 3. Restart daemon
pm2 restart workflow-monitor-daemon

# 4. If still failing, stop and start
pm2 stop workflow-monitor-daemon
npm run monitor:daemon:pm2

# 5. Check database connection
docker exec farmers-market-db psql -U postgres -d farmersmarket -c "SELECT 1;"
```

### Debugging API Issues

```bash
# 1. Test endpoint with curl
curl http://localhost:3000/api/monitoring/dashboard/overview

# 2. Check logs
pm2 logs workflow-monitor-daemon

# 3. Check database data
docker exec farmers-market-db psql -U postgres -d farmersmarket -c "SELECT COUNT(*) FROM workflow_executions;"

# 4. Verify TypeScript compilation
npm run type-check

# 5. Check for Prisma issues
npx prisma validate
```

### Database Issues

```bash
# 1. Check if container is running
docker ps | grep farmers-market-db

# 2. Restart database
docker restart farmers-market-db

# 3. Check connection from app
npm run monitor:daemon:status

# 4. Regenerate Prisma client
npx prisma generate

# 5. Check schema is synced
npx prisma db pull
```

---

## 📂 Key File Locations

```
📄 Documentation
├── START_HERE_PHASE_3_SESSION_2.md          🚀 START HERE
├── PHASE_3_READY_SUMMARY.md                 📊 COMPREHENSIVE STATUS
├── QUICK_COMMANDS.md                        ⚡ THIS FILE
└── docs/
    ├── DASHBOARD_IMPLEMENTATION_GUIDE.md    🎨 IMPLEMENTATION BIBLE
    ├── PHASE_3_SESSION_1_SUMMARY.md         📋 SESSION SUMMARY
    └── PHASE_3_QUICK_REFERENCE.md           🔖 PATTERNS

📁 Scripts
├── scripts/monitor-daemon.ts                 ✅ DAEMON
├── scripts/check-daemon-status.ts            ✅ STATUS CHECKER
└── scripts/pm2-daemon-launcher.js            ✅ PM2 LAUNCHER

📁 Source Code
├── src/lib/monitoring/bot.ts                 ✅ BOT
├── src/lib/monitoring/storage/               ✅ STORAGE
├── src/lib/database.ts                       ✅ DATABASE
└── src/app/(monitoring)/dashboard/page.tsx   🔄 DASHBOARD (SCAFFOLD)

📁 To Create (Phase 3)
├── src/app/api/monitoring/dashboard/         📁 API ENDPOINTS
├── src/components/monitoring/dashboard/      📁 COMPONENTS
├── src/lib/websocket/                        📁 WEBSOCKET
└── src/hooks/                                📁 HOOKS
```

---

## 🔗 Quick Links

### URLs

- **Dashboard**: http://localhost:3000/dashboard
- **API Overview**: http://localhost:3000/api/monitoring/dashboard/overview
- **Next.js Dev**: http://localhost:3000
- **Prisma Studio**: Run `npx prisma studio` → http://localhost:5555

### Ports

- **3001**: Next.js dev server
- **3002**: WebSocket server (to be created)
- **5432**: PostgreSQL database
- **6379**: Redis cache
- **80/443**: Nginx proxy

---

## 💡 Pro Tips

### Speed Up Development

```bash
# Use aliases in ~/.bashrc or ~/.zshrc
alias daemon-status='npm run monitor:daemon:status'
alias daemon-logs='pm2 logs workflow-monitor-daemon'
alias daemon-restart='pm2 restart workflow-monitor-daemon'
alias dev='npm run dev'
alias db-shell='docker exec -it farmers-market-db psql -U postgres -d farmersmarket'
```

### Monitor Multiple Things

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Daemon logs
pm2 logs workflow-monitor-daemon

# Terminal 3: Database queries
docker exec -it farmers-market-db psql -U postgres -d farmersmarket
```

### Quick Health Check One-Liner

```bash
npm run monitor:daemon:status && pm2 status && docker ps --filter "name=farmers-market"
```

---

## 🚨 Emergency Commands

### System Not Responding

```bash
# Nuclear option - restart everything
pm2 stop all
docker restart farmers-market-db farmers-market-cache
pm2 start ecosystem.config.js
npm run dev
```

### Database Corrupted

```bash
# Reset database (CAUTION: Deletes all data)
docker exec farmers-market-db psql -U postgres -d farmersmarket -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npx prisma db push
```

### PM2 Issues

```bash
# Kill PM2 daemon and restart
pm2 kill
pm2 start ecosystem.config.js
```

---

## 📊 Expected Outputs

### Healthy System

```bash
$ npm run monitor:daemon:status

🟢 HEALTHY: Daemon is fully operational
   All systems are functioning normally.

✅ Database Connection: OK
✅ Recent Executions: 1 in last 10 minutes
✅ Recent Health Checks: 2 in last 10 minutes
✅ Scheduled Workflows: 6 configured
```

### PM2 Status

```bash
$ pm2 status

┌────┬────────────────────┬─────────┬──────┬──────────┐
│ id │ name               │ mode    │ ↺    │ status   │
├────┼────────────────────┼─────────┼──────┼──────────┤
│ 0  │ workflow-monitor-… │ fork    │ 0    │ online   │
└────┴────────────────────┴─────────┴──────┴──────────┘
```

### Docker Containers

```bash
$ docker ps

NAMES                      STATUS                   PORTS
farmers-market-app         Up (healthy)             0.0.0.0:3000->3000/tcp
farmers-market-db          Up (healthy)             0.0.0.0:5432->5432/tcp
farmers-market-cache       Up (healthy)             0.0.0.0:6379->6379/tcp
```

---

## 🎯 Phase 3 Implementation Commands

### Day 1: API Endpoints

```bash
# Create API directory
mkdir -p src/app/api/monitoring/dashboard/{overview,executions,alerts,metrics}

# Create route files
touch src/app/api/monitoring/dashboard/overview/route.ts
touch src/app/api/monitoring/dashboard/executions/route.ts
touch src/app/api/monitoring/dashboard/alerts/route.ts
touch src/app/api/monitoring/dashboard/metrics/route.ts

# Test endpoints
curl http://localhost:3000/api/monitoring/dashboard/overview
```

### Day 2: Components

```bash
# Create component directory
mkdir -p src/components/monitoring/dashboard

# Create component files
touch src/components/monitoring/dashboard/DashboardLayout.tsx
touch src/components/monitoring/dashboard/SystemHealthWidget.tsx
touch src/components/monitoring/dashboard/WorkflowExecutionWidget.tsx
touch src/components/monitoring/dashboard/DashboardSkeleton.tsx
```

### Day 3: WebSocket

```bash
# Create WebSocket directory
mkdir -p src/lib/websocket src/hooks

# Create WebSocket files
touch src/lib/websocket/server.ts
touch src/lib/websocket/client.ts
touch src/hooks/useWebSocket.ts
touch src/hooks/useDashboardUpdates.ts

# Install dependencies
npm install ws
npm install -D @types/ws
```

### Day 4: Charts

```bash
# Install chart library
npm install recharts
# or
npm install chart.js react-chartjs-2

# Create chart components
touch src/components/monitoring/dashboard/MetricsChart.tsx
```

---

**Keep this file handy - you'll use it constantly!** 📌

_"Fast commands, faster development."_ ⚡
