# 🚀 Deployment Runbook - Production Deployment

**Project:** Farmers Market Platform - Backend Services  
**Version:** 1.0  
**Last Updated:** November 15, 2024  
**Status:** Ready for Production Deployment

---

## 📋 Overview

This runbook provides step-by-step instructions for deploying the newly refactored backend services to production. Follow each step carefully and verify completion before proceeding.

---

## ⚠️ Pre-Deployment Requirements

### Team Coordination

- [ ] **Product Team:** Informed of deployment window
- [ ] **Frontend Team:** API changes reviewed and ready
- [ ] **QA Team:** All integration tests passed
- [ ] **DevOps Team:** Infrastructure ready and monitored
- [ ] **On-Call Team:** Alert and available during deployment

### Technical Prerequisites

- [ ] All code merged to `main` branch
- [ ] CI/CD pipeline passing (all tests green)
- [ ] Code review completed and approved
- [ ] Database migrations tested in staging
- [ ] Environment variables documented
- [ ] Rollback plan prepared
- [ ] Monitoring dashboards ready

---

## 🎯 Deployment Phases

### Phase 1: Pre-Deployment Preparation (30 minutes)

#### 1.1 Verify Staging Environment

```bash
# Connect to staging
ssh deploy@staging.farmersmarket.com

# Verify all services running
pm2 list

# Check application health
curl https://staging.farmersmarket.com/api/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-11-15T...",
#   "services": {
#     "database": "connected",
#     "redis": "connected",
#     "stripe": "connected"
#   }
# }

# Run integration tests
npm run test:integration

# All tests should pass (✓)
```

#### 1.2 Database Backup

```bash
# Connect to production database server
ssh db@prod-db.farmersmarket.com

# Create backup
pg_dump -U farmers_market -h localhost farmers_market_prod \
  | gzip > backups/pre_deployment_$(date +%Y%m%d_%H%M%S).sql.gz

# Verify backup size and integrity
ls -lh backups/
gunzip -t backups/pre_deployment_*.sql.gz

# Copy backup to secure location
aws s3 cp backups/pre_deployment_*.sql.gz \
  s3://farmersmarket-backups/production/$(date +%Y%m%d)/
```

#### 1.3 Verify Environment Variables

```bash
# Check all required variables are set
cat > verify-env.sh << 'EOF'
#!/bin/bash

REQUIRED_VARS=(
  "DATABASE_URL"
  "REDIS_URL"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "APPLICATION_INSIGHTS_CONNECTION_STRING"
  "NODE_ENV"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
    exit 1
  else
    echo "✅ Present: $var"
  fi
done

echo "All required environment variables present!"
EOF

chmod +x verify-env.sh
./verify-env.sh
```

#### 1.4 Prepare Rollback Plan

```bash
# Tag current production version
git tag -a v1.0.0-pre-checkout-migration \
  -m "Production state before checkout migration"
git push origin v1.0.0-pre-checkout-migration

# Document current deployment state
kubectl get deployments -n production > deployment-state-before.txt
pm2 save > pm2-state-before.json

# Create rollback script
cat > rollback.sh << 'EOF'
#!/bin/bash
echo "🔄 Rolling back to previous version..."

# Stop current services
pm2 stop all

# Restore previous version
git checkout v1.0.0-pre-checkout-migration

# Restore dependencies
npm ci

# Build application
npm run build

# Restore database (if needed)
# gunzip < backups/pre_deployment_*.sql.gz | psql -U farmers_market farmers_market_prod

# Restart services
pm2 restart all

echo "✅ Rollback complete"
EOF

chmod +x rollback.sh
```

---

### Phase 2: Database Migration (15 minutes)

#### 2.1 Review Migration Scripts

```bash
# Review pending migrations
npm run prisma:migrate status

# Expected output:
# Database schema is up to date!
# No pending migrations

# If migrations needed:
cat prisma/migrations/*/migration.sql
```

#### 2.2 Run Migrations (Production)

```bash
# Set to production database
export DATABASE_URL="postgresql://user:pass@prod-db:5432/farmers_market_prod"

# Dry run migration (no changes)
npm run prisma:migrate deploy --dry-run

# Review changes carefully
# Verify no data loss warnings

# ⚠️ CRITICAL: Enable maintenance mode before migration
echo "MAINTENANCE_MODE=true" >> .env
pm2 restart all

# Run migration
npm run prisma:migrate deploy

# Expected output:
# ✓ Migration applied successfully
# ✓ Schema updated

# Verify migration
npm run prisma:migrate status

# Disable maintenance mode
sed -i '/MAINTENANCE_MODE/d' .env
```

#### 2.3 Verify Database Schema

```bash
# Connect to database
psql -U farmers_market -h prod-db -d farmers_market_prod

-- Verify tables exist
\dt

-- Check Order table structure
\d orders

-- Verify ServiceResponse-compatible columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';

-- Verify indexes
\di

-- Check foreign keys
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public';

\q
```

---

### Phase 3: Application Deployment (20 minutes)

#### 3.1 Deploy Backend Services

```bash
# Connect to production server
ssh deploy@prod-app-01.farmersmarket.com

# Navigate to application directory
cd /var/www/farmersmarket

# Pull latest code
git fetch origin
git checkout main
git pull origin main

# Verify correct version
git log -1 --oneline

# Install dependencies (production only)
NODE_ENV=production npm ci

# Build application
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ No TypeScript errors
# ✓ 0 errors, 0 warnings

# Run database client generation
npx prisma generate

# Verify build artifacts
ls -la .next/
ls -la dist/
```

#### 3.2 Update Service Configuration

```bash
# Update PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'farmersmarket-api',
    script: 'npm',
    args: 'start',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096'
  }]
};
EOF

# Reload PM2 configuration
pm2 reload ecosystem.config.js

# Or if using Docker:
docker-compose -f docker-compose.prod.yml up -d --build
```

#### 3.3 Health Check

```bash
# Wait for services to start
sleep 10

# Check service status
pm2 status

# Health check endpoint
for i in {1..5}; do
  echo "Health check attempt $i..."
  curl -f https://api.farmersmarket.com/api/health
  sleep 2
done

# Expected: All 5 attempts return 200 OK

# Test specific endpoints
curl -f https://api.farmersmarket.com/api/checkout/status
curl -f https://api.farmersmarket.com/api/cart/status
```

---

### Phase 4: Verification & Testing (30 minutes)

#### 4.1 Smoke Tests

```bash
# Run production smoke tests
npm run test:smoke:production

# Test scenarios:
# ✓ User authentication
# ✓ Cart operations
# ✓ Checkout initialization
# ✓ Payment intent creation
# ✓ Order creation
```

#### 4.2 API Endpoint Verification

```bash
# Create test script
cat > verify-endpoints.sh << 'EOF'
#!/bin/bash

BASE_URL="https://api.farmersmarket.com"
TOKEN="your_test_token_here"

# Test Cart API
echo "Testing Cart API..."
curl -X POST "$BASE_URL/api/cart" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"test_product","quantity":1}' \
  | jq '.success'

# Test Checkout Status
echo "Testing Checkout Status..."
curl -X GET "$BASE_URL/api/checkout/create-order" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success'

# Test Payment Intent
echo "Testing Payment Intent..."
curl -X POST "$BASE_URL/api/checkout/create-payment-intent" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":10.99}' \
  | jq '.success'

echo "All endpoint tests completed!"
EOF

chmod +x verify-endpoints.sh
./verify-endpoints.sh
```

#### 4.3 Monitor Application Logs

```bash
# Real-time log monitoring
pm2 logs --lines 100

# Check for errors
pm2 logs --err --lines 50

# Application-specific logs
tail -f logs/application.log | grep -i error

# Look for:
# ✓ No critical errors
# ✓ Successful service initializations
# ✓ Database connections established
# ✓ Redis connections established
```

#### 4.4 Database Verification

```bash
# Check recent orders
psql -U farmers_market -h prod-db -d farmers_market_prod -c \
  "SELECT id, order_number, status, created_at 
   FROM orders 
   ORDER BY created_at DESC 
   LIMIT 10;"

# Verify payment intents
psql -U farmers_market -h prod-db -d farmers_market_prod -c \
  "SELECT id, stripe_payment_intent_id, payment_status 
   FROM orders 
   WHERE created_at > NOW() - INTERVAL '1 hour';"

# Check for orphaned records
psql -U farmers_market -h prod-db -d farmers_market_prod -c \
  "SELECT COUNT(*) as orphaned_cart_items 
   FROM cart_items ci 
   LEFT JOIN users u ON ci.user_id = u.id 
   WHERE u.id IS NULL;"
```

---

### Phase 5: Monitoring Setup (15 minutes)

#### 5.1 Configure Application Insights

```bash
# Verify Application Insights connection
curl https://api.farmersmarket.com/api/telemetry/test

# Check dashboard
# Open: https://portal.azure.com
# Navigate to: Application Insights > farmersmarket-prod
# Verify: Live Metrics showing data
```

#### 5.2 Set Up Alerts

```bash
# Configure critical alerts via Azure CLI
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group farmersmarket-prod \
  --scopes "/subscriptions/.../farmersmarket-app" \
  --condition "count traces | where severityLevel >= 3" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action-group devops-team

# Alert on slow response times
az monitor metrics alert create \
  --name "Slow API Response" \
  --resource-group farmersmarket-prod \
  --condition "avg requestDuration > 1000" \
  --window-size 5m
```

#### 5.3 Create Monitoring Dashboard

```bash
# Access monitoring dashboard
open https://grafana.farmersmarket.com

# Verify metrics visible:
# ✓ Request rate
# ✓ Response times (p50, p95, p99)
# ✓ Error rate
# ✓ Database connection pool
# ✓ Memory usage
# ✓ CPU usage
```

---

### Phase 6: Enable Full Traffic (10 minutes)

#### 6.1 Gradual Traffic Rollout

```bash
# If using load balancer/CDN
# Cloudflare example:

# 1. Start with 10% traffic
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/load_balancers/{lb_id}" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "steering_policy": "random",
    "session_affinity": "cookie",
    "fallback_pool": "old-pool",
    "default_pools": ["new-pool"],
    "rules": [{
      "name": "10% to new version",
      "priority": 1,
      "disabled": false,
      "condition": "rand() < 0.1",
      "fixed_response": null,
      "overrides": {
        "default_pools": ["new-pool"]
      }
    }]
  }'

# Wait 5 minutes, monitor metrics

# 2. Increase to 50% traffic
# Update condition: "rand() < 0.5"

# Wait 5 minutes, monitor metrics

# 3. Enable 100% traffic
# Remove rule, set default pool to new-pool
```

#### 6.2 Monitor During Rollout

```bash
# Monitor key metrics
watch -n 5 'curl -s https://api.farmersmarket.com/api/health | jq'

# Check error rates
watch -n 10 'pm2 logs --err --nostream --lines 20'

# Monitor response times
watch -n 5 'curl -w "@curl-format.txt" -o /dev/null -s https://api.farmersmarket.com/api/cart'

# curl-format.txt:
# time_total: %{time_total}s
# time_connect: %{time_connect}s
# time_starttransfer: %{time_starttransfer}s
```

---

### Phase 7: Post-Deployment Validation (15 minutes)

#### 7.1 End-to-End Test (Real Transaction)

```bash
# Use test account to perform complete checkout
# 1. Add item to cart
# 2. Initialize checkout
# 3. Create payment intent
# 4. Complete order
# 5. Verify order in database

npm run test:e2e:production
```

#### 7.2 Performance Verification

```bash
# Run load test (light load)
artillery run --target https://api.farmersmarket.com \
  load-tests/production-verification.yml

# Expected results:
# - p95 response time: < 1000ms
# - Success rate: > 99.5%
# - Error rate: < 0.5%
```

#### 7.3 Data Integrity Check

```bash
# Verify no data anomalies
psql -U farmers_market -h prod-db -d farmers_market_prod << 'SQL'

-- Check order totals match line items
SELECT o.id, o.order_number, o.total,
       SUM(oi.subtotal) as calculated_total
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at > NOW() - INTERVAL '1 hour'
GROUP BY o.id, o.order_number, o.total
HAVING ABS(o.total - SUM(oi.subtotal)) > 0.01;

-- Should return 0 rows

-- Check payment intent IDs are valid
SELECT COUNT(*) as orders_without_payment_intent
FROM orders
WHERE payment_status = 'PAID'
  AND stripe_payment_intent_id IS NULL
  AND created_at > NOW() - INTERVAL '1 hour';

-- Should return 0

SQL
```

---

## ✅ Post-Deployment Checklist

### Immediate (Within 1 hour)

- [ ] All services running (pm2 status all green)
- [ ] Health checks passing
- [ ] No critical errors in logs
- [ ] Monitoring dashboards showing healthy metrics
- [ ] Test transaction completed successfully
- [ ] Database integrity verified
- [ ] No increase in error rates
- [ ] Response times within acceptable range

### Short-term (Within 24 hours)

- [ ] Customer support notified of deployment
- [ ] No customer-reported issues
- [ ] Payment processing working correctly
- [ ] All webhooks processing successfully
- [ ] Background jobs running
- [ ] Email notifications sending
- [ ] Analytics data flowing
- [ ] Backup jobs running

### Medium-term (Within 1 week)

- [ ] Performance metrics stable
- [ ] No memory leaks detected
- [ ] Database query performance optimized
- [ ] CDN cache hit rates good
- [ ] Cost monitoring in place
- [ ] Documentation updated
- [ ] Team retrospective completed

---

## 🔥 Rollback Procedures

### When to Rollback

Rollback immediately if:
- ❌ Error rate > 5%
- ❌ Response time p95 > 3s
- ❌ Critical feature broken
- ❌ Data corruption detected
- ❌ Security vulnerability discovered
- ❌ Payment processing failing

### Rollback Steps

```bash
# 1. Stop current version
pm2 stop all

# 2. Switch to previous version
git checkout v1.0.0-pre-checkout-migration

# 3. Restore dependencies
npm ci

# 4. Rebuild
npm run build

# 5. Database rollback (if needed)
# Only if migrations were applied
npm run prisma:migrate resolve --rolled-back {migration_name}

# Or restore from backup
gunzip < backups/pre_deployment_*.sql.gz | \
  psql -U farmers_market farmers_market_prod

# 6. Restart services
pm2 restart all

# 7. Verify rollback
curl https://api.farmersmarket.com/api/health

# 8. Notify team
echo "🔄 Rollback completed at $(date)" | \
  mail -s "Production Rollback" team@farmersmarket.com
```

### Post-Rollback Actions

```bash
# 1. Document rollback reason
cat > rollback-report.md << EOF
# Rollback Report
Date: $(date)
Reason: [FILL IN]
Metrics at time of rollback:
- Error rate: [FILL IN]
- Response time: [FILL IN]
Impact: [FILL IN]
Action items: [FILL IN]
EOF

# 2. Investigate root cause
# 3. Create incident report
# 4. Plan fix and re-deployment
```

---

## 📊 Success Metrics

### Technical Metrics (24 hours post-deployment)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Error Rate | < 0.5% | ___ | ⬜ |
| Response Time (p95) | < 1s | ___ | ⬜ |
| API Success Rate | > 99.5% | ___ | ⬜ |
| Database Latency | < 50ms | ___ | ⬜ |
| Memory Usage | < 80% | ___ | ⬜ |
| CPU Usage | < 70% | ___ | ⬜ |

### Business Metrics (1 week post-deployment)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Checkout Conversion | > 80% | ___ | ⬜ |
| Cart Abandonment | < 20% | ___ | ⬜ |
| Payment Success | > 98% | ___ | ⬜ |
| Order Creation Time | < 2min | ___ | ⬜ |
| Customer Support Tickets | No increase | ___ | ⬜ |

---

## 📞 Emergency Contacts

### On-Call Engineers
- **Primary:** John Doe - +1-555-0101
- **Secondary:** Jane Smith - +1-555-0102
- **Escalation:** Engineering Manager - +1-555-0103

### External Services
- **Stripe Support:** support@stripe.com / +1-888-926-2289
- **Azure Support:** Portal > Support Tickets
- **Database Admin:** dba@farmersmarket.com

### Communication Channels
- **Slack:** #production-deploys
- **Incident:** #incident-response
- **Status Page:** status.farmersmarket.com

---

## 📝 Deployment Log Template

```markdown
## Deployment: Checkout Service Migration
**Date:** YYYY-MM-DD
**Time:** HH:MM UTC
**Version:** vX.X.X
**Engineer:** Name

### Pre-Deployment
- [ ] Backup created: [timestamp]
- [ ] Tests passed: ✓
- [ ] Team notified: ✓

### Deployment Steps
- [ ] Database migrated: [time]
- [ ] Application deployed: [time]
- [ ] Health checks passed: [time]
- [ ] Traffic enabled: [time]

### Issues Encountered
- None / [List issues]

### Metrics (1 hour post-deploy)
- Error rate: X%
- Response time: Xms
- Success rate: X%

### Status
✅ SUCCESS / ⚠️ PARTIAL / ❌ ROLLBACK

### Notes
[Additional notes]
```

---

## 🎓 Lessons Learned

Document lessons learned after deployment:

```markdown
### What Went Well
- 

### What Could Be Improved
- 

### Action Items
- 
```

---

**Deployment Runbook Version:** 1.0  
**Last Review:** November 15, 2024  
**Next Review:** After deployment completion  
**Owner:** DevOps Team

---

**🚀 Ready for Production Deployment**

Follow this runbook carefully, verify each step, and maintain clear communication with the team throughout the process.

_"Deploy with confidence, monitor with vigilance, rollback without hesitation."_