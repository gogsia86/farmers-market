# 🚀 Deployment Runbook - Farmers Market Platform

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintained By**: DevOps Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Staging Deployment](#staging-deployment)
4. [Production Deployment](#production-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Database Migrations](#database-migrations)
8. [Troubleshooting](#troubleshooting)
9. [Emergency Contacts](#emergency-contacts)

---

## 🎯 Overview

This runbook provides step-by-step instructions for deploying the Farmers Market Platform to staging and production environments.

### Deployment Architecture

- **Platform**: Vercel (Next.js hosting)
- **Database**: PostgreSQL (managed)
- **Monitoring**: Azure Application Insights + Sentry
- **CI/CD**: GitHub Actions

### Deployment Frequency

- **Staging**: Automatic on every push to `main`
- **Production**: Manual approval required
- **Hotfix**: Emergency process (see Emergency Deployment)

---

## ✅ Pre-Deployment Checklist

### Code Quality Gates

- [ ] All tests passing locally (`npm run test:all`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted (`npm run format:check`)
- [ ] Test coverage > 80% (`npm run test:coverage`)

### Database Readiness

- [ ] All migrations reviewed and tested
- [ ] Migration rollback plan documented
- [ ] Database backup verified (< 24 hours old)
- [ ] Database connection strings verified in environment variables

### Environment Configuration

- [ ] All required environment variables set
- [ ] Secrets rotated if needed
- [ ] API keys and tokens validated
- [ ] Third-party service integrations tested

### Documentation

- [ ] CHANGELOG.md updated
- [ ] API documentation updated (if API changes)
- [ ] README.md updated (if necessary)
- [ ] Deployment notes prepared

### Team Coordination

- [ ] Team notified of upcoming deployment
- [ ] Deployment window scheduled (if required)
- [ ] On-call engineer identified
- [ ] Stakeholders informed

---

## 🧪 Staging Deployment

Staging deployments happen automatically via GitHub Actions when code is pushed to `main`.

### Automatic Deployment Flow

```bash
# 1. Push to main branch
git push origin main

# 2. GitHub Actions automatically:
#    - Runs quality gates
#    - Runs all tests
#    - Builds application
#    - Deploys to staging
#    - Runs smoke tests
```

### Manual Staging Deployment

If you need to trigger a manual deployment:

```bash
# Option 1: Via GitHub Actions UI
# 1. Go to Actions tab
# 2. Select "Production Deployment Pipeline"
# 3. Click "Run workflow"
# 4. Select environment: "staging"

# Option 2: Via Vercel CLI
npm install -g vercel
vercel login
vercel --prod --scope=your-team --token=$VERCEL_TOKEN
```

### Verify Staging Deployment

```bash
# 1. Check health endpoint
curl https://staging.farmersmarket.com/api/health

# 2. Check readiness probe
curl https://staging.farmersmarket.com/api/ready

# 3. Run smoke tests
npm run test:e2e -- --grep @smoke
```

### Expected Response Times (Staging)

- Health check: < 500ms
- API endpoints: < 1s
- Page loads: < 3s

---

## 🎯 Production Deployment

Production deployments require manual approval and follow a controlled process.

### Step-by-Step Production Deployment

#### Phase 1: Pre-Deployment (T-30 minutes)

```bash
# 1. Verify staging is healthy
curl https://staging.farmersmarket.com/api/health

# 2. Run full test suite
npm run test:all

# 3. Check for any critical alerts
# - Review Azure Application Insights
# - Check Sentry for recent errors
# - Verify database performance metrics

# 4. Notify team
# Post in #deployments Slack channel:
# "🚀 Production deployment starting in 30 minutes
#  Commit: <commit-sha>
#  Changes: <brief description>
#  Deployer: <your-name>"
```

#### Phase 2: Database Migrations (T-15 minutes)

```bash
# 1. Backup production database
# This should be automated, but verify:
pg_dump -h $DB_HOST -U $DB_USER -d farmersmarket_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migrations on staging
npm run db:migrate

# 3. Verify migration success
npm run db:studio
# Visually inspect schema changes

# 4. Prepare rollback migration (if needed)
# Document rollback steps in deployment notes
```

#### Phase 3: Deployment (T-0)

```bash
# 1. Trigger deployment via GitHub Actions
# Go to: https://github.com/your-org/farmers-market/actions
# Select: "Production Deployment Pipeline"
# Click: "Run workflow"
# Input: environment = "production"

# 2. Monitor deployment progress
# Watch the GitHub Actions logs in real-time

# 3. Wait for deployment completion
# Typical deployment time: 3-5 minutes
```

#### Phase 4: Verification (T+5 minutes)

```bash
# 1. Health check
curl https://farmersmarket.com/api/health
# Expected: 200 OK with status "healthy"

# 2. Readiness check
curl https://farmersmarket.com/api/ready
# Expected: 200 OK with ready: true

# 3. Smoke test critical paths
curl https://farmersmarket.com/api/products?limit=5
# Expected: 200 OK with product list

# 4. Manual verification
# - Open production site in browser
# - Test login flow
# - Browse product catalog
# - Test search functionality
# - Verify cart operations (if changed)
```

#### Phase 5: Monitoring (T+15 minutes)

```bash
# 1. Monitor error rates
# - Azure Application Insights: Check for error spikes
# - Sentry: Review new error groups
# - Application logs: Watch for warnings

# 2. Check performance metrics
# - Response times: Should be < 500ms P95
# - Database queries: No slow query alerts
# - Memory usage: Should be stable

# 3. Monitor user activity
# - Active sessions: Should remain stable or increase
# - API request rate: Should match historical patterns
# - Error rate: Should be < 0.1%
```

#### Phase 6: Communication (T+30 minutes)

```bash
# If deployment successful:
# Post in #deployments Slack channel:
# "✅ Production deployment complete!
#  Version: <version>
#  Commit: <commit-sha>
#  Changes: <description>
#  Status: All systems healthy
#  Deployer: <your-name>"

# If issues detected:
# Follow rollback procedures immediately (see below)
```

---

## ✅ Post-Deployment Verification

### Automated Checks

The CI/CD pipeline runs these automatically:

- Health endpoint returns 200
- Readiness probe returns 200
- Smoke tests pass
- No immediate errors in logs

### Manual Verification Checklist

- [ ] **Homepage loads correctly**
  - Navigate to https://farmersmarket.com
  - Verify all images load
  - Check navigation menu works

- [ ] **Authentication works**
  - Test login with test account
  - Verify session persistence
  - Test logout

- [ ] **Product catalog accessible**
  - Browse products page
  - Test category filters
  - Verify search functionality
  - Check product detail pages

- [ ] **API endpoints responding**
  - Test GET /api/products
  - Test GET /api/farms
  - Test authenticated endpoints

- [ ] **No console errors**
  - Open browser DevTools
  - Check for JavaScript errors
  - Verify no 404s for assets

- [ ] **Monitoring dashboards**
  - Azure Application Insights: No error spikes
  - Sentry: No new critical errors
  - Database: Query performance normal

### Performance Benchmarks

Expected production performance:

| Metric             | Target  | Alert Threshold |
| ------------------ | ------- | --------------- |
| Health check       | < 200ms | > 1s            |
| API response (P95) | < 500ms | > 2s            |
| Page load (P95)    | < 2s    | > 5s            |
| Error rate         | < 0.1%  | > 1%            |
| Uptime             | > 99.9% | < 99.5%         |

---

## ⏮️ Rollback Procedures

### When to Rollback

Rollback immediately if:

- Error rate > 5%
- Critical functionality broken
- Database corruption detected
- Security vulnerability discovered
- Performance degradation > 50%

### Quick Rollback (Vercel)

```bash
# 1. Via Vercel Dashboard
# - Go to https://vercel.com/your-team/farmers-market
# - Click "Deployments"
# - Find last known good deployment
# - Click "..." menu
# - Select "Promote to Production"

# 2. Via Vercel CLI
vercel rollback [deployment-url]

# 3. Verify rollback
curl https://farmersmarket.com/api/health
```

### Full Rollback with Database

If database migrations were applied:

```bash
# 1. Stop application traffic (if critical)
# - Set maintenance mode in Vercel
# - Or use infrastructure to route traffic

# 2. Rollback database migration
npm run db:migrate:rollback
# Or manually:
prisma migrate resolve --rolled-back <migration-name>

# 3. Restore database backup (if necessary)
psql -h $DB_HOST -U $DB_USER -d farmersmarket_prod < backup_YYYYMMDD_HHMMSS.sql

# 4. Rollback application code
vercel rollback <deployment-url>

# 5. Verify system health
curl https://farmersmarket.com/api/health
npm run test:e2e -- --grep @smoke

# 6. Resume normal operations
# Remove maintenance mode
# Monitor for 30 minutes
```

### Post-Rollback

- [ ] Document what went wrong
- [ ] Create incident report
- [ ] Notify team and stakeholders
- [ ] Plan fix for next deployment
- [ ] Update runbook if needed

---

## 🗄️ Database Migrations

### Pre-Migration Checklist

- [ ] Migration tested on local dev
- [ ] Migration tested on staging
- [ ] Database backup verified
- [ ] Rollback plan documented
- [ ] Downtime estimated (if any)

### Running Migrations

```bash
# 1. Development (local)
npm run db:migrate:dev

# 2. Staging (automatic via CI/CD)
# Happens during staging deployment

# 3. Production (manual verification)
# SSH to production environment or use Vercel CLI
npm run db:migrate

# 4. Verify migration
npx prisma studio
# Check schema changes applied correctly
```

### Zero-Downtime Migrations

For breaking changes, use multi-step approach:

```bash
# Step 1: Add new column (backwards compatible)
# Deploy this first, wait 24 hours

# Step 2: Migrate data
# Run data migration script

# Step 3: Update application code
# Deploy code using new column

# Step 4: Remove old column (breaking)
# Deploy final migration after validation
```

### Migration Rollback

```bash
# 1. Identify migration to rollback
npx prisma migrate status

# 2. Mark as rolled back
npx prisma migrate resolve --rolled-back <migration-name>

# 3. Or restore from backup
psql -h $DB_HOST -U $DB_USER -d farmersmarket_prod < backup.sql

# 4. Verify schema
npx prisma db pull
npx prisma studio
```

---

## 🔧 Troubleshooting

### Deployment Fails at Build Step

**Symptoms**: GitHub Actions fails during build

**Solutions**:

```bash
# 1. Check build locally
npm run build

# 2. Check for TypeScript errors
npm run type-check

# 3. Check for missing dependencies
npm ci
npm run build

# 4. Check environment variables
# Verify all required vars are set in Vercel/GitHub Secrets
```

### Deployment Succeeds but Site is Down

**Symptoms**: Health check fails, 502/503 errors

**Solutions**:

```bash
# 1. Check Vercel function logs
vercel logs [deployment-url]

# 2. Check database connection
# Verify DATABASE_URL is correct
# Check database is accepting connections
psql $DATABASE_URL -c "SELECT 1"

# 3. Check for startup errors
# Review application logs in Vercel dashboard

# 4. Rollback if issue persists
vercel rollback
```

### High Error Rate After Deployment

**Symptoms**: Sentry error spike, increased 500 errors

**Solutions**:

```bash
# 1. Check Sentry for error details
# - Go to Sentry dashboard
# - Review new error groups
# - Check error frequency

# 2. Check Azure Application Insights
# - Review exception logs
# - Check dependency failures
# - Look for timeout errors

# 3. Check database performance
# - Review slow query logs
# - Check connection pool exhaustion
# - Monitor CPU/memory usage

# 4. Rollback if critical
vercel rollback [deployment-url]
```

### Database Migration Fails

**Symptoms**: Migration error, schema mismatch

**Solutions**:

```bash
# 1. Check migration status
npx prisma migrate status

# 2. Review migration file
cat prisma/migrations/*/migration.sql

# 3. Mark as resolved if already applied
npx prisma migrate resolve --applied <migration-name>

# 4. Or rollback and fix
npx prisma migrate resolve --rolled-back <migration-name>
# Fix migration file
# Re-run migration
```

### Slow Performance After Deployment

**Symptoms**: Response times increased, timeouts

**Solutions**:

```bash
# 1. Check database query performance
# - Review slow query logs
# - Check missing indexes
# - Look for N+1 queries

# 2. Check Vercel function limits
# - Memory usage (default 1GB)
# - Execution time (default 10s)
# - Cold start times

# 3. Check external service dependencies
# - Cloudinary API response times
# - Stripe API response times
# - Database connection latency

# 4. Consider hotfix or rollback
# If performance unacceptable for users
```

---

## 📞 Emergency Contacts

### On-Call Rotation

| Role           | Primary     | Backup       | Slack            | Phone       |
| -------------- | ----------- | ------------ | ---------------- | ----------- |
| DevOps Lead    | @john.doe   | @jane.smith  | #ops-oncall      | +1-555-0100 |
| Backend Lead   | @mike.jones | @sara.wilson | #backend-oncall  | +1-555-0101 |
| Database Admin | @chris.lee  | @alex.brown  | #database-oncall | +1-555-0102 |

### Escalation Path

1. **Level 1**: On-call engineer (respond within 15 minutes)
2. **Level 2**: Team lead (respond within 30 minutes)
3. **Level 3**: Engineering director (respond within 1 hour)

### Service Status

- **Status Page**: https://status.farmersmarket.com
- **Internal Dashboard**: https://dashboard.farmersmarket.internal
- **Monitoring**: https://portal.azure.com (Application Insights)

### Critical Services

| Service    | Dashboard                     | Status   |
| ---------- | ----------------------------- | -------- |
| Vercel     | https://vercel.com/status     | Public   |
| PostgreSQL | Database provider dashboard   | Internal |
| Sentry     | https://sentry.io/status      | Public   |
| Cloudinary | https://status.cloudinary.com | Public   |
| Stripe     | https://status.stripe.com     | Public   |

---

## 📝 Deployment Log Template

Document each deployment:

```markdown
## Deployment: YYYY-MM-DD HH:MM

**Deployer**: [Your Name]
**Environment**: Production
**Commit**: [commit-sha]
**Version**: [version-number]

### Changes

- Feature: [description]
- Bugfix: [description]
- Migration: [description]

### Pre-Deployment

- [ ] All tests passed
- [ ] Staging verified
- [ ] Database backup confirmed
- [ ] Team notified

### Deployment Timeline

- T-30: Pre-deployment checks
- T-15: Database migration
- T-0: Deployment triggered
- T+5: Verification complete
- T+30: Monitoring complete

### Issues

- None / [describe any issues]

### Rollback

- Not required / [describe rollback if performed]

### Notes

[Any additional notes or observations]
```

---

## 🎓 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [Prisma Migrations Guide](https://www.prisma.io/docs/guides/migrate)
- [Azure Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

---

**Remember**: When in doubt, rollback first, investigate second. User experience is the priority.

_"Deploy with confidence, monitor with precision, respond with speed."_ 🚀
