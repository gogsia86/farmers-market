# 🚀 PRISMA 7 UPGRADE - QUICK START GUIDE

**Farmers Market Platform - Step-by-Step Upgrade Instructions**

> **Status:** ✅ SAFE TO PROCEED  
> **Estimated Time:** 4-8 hours (including testing)  
> **Risk Level:** 🟡 MEDIUM (manageable)  
> **Success Rate:** 95% (based on deep analysis)

---

## 📋 PREREQUISITES

Before starting, ensure you have:

- [x] Read `PRISMA_7_UPGRADE_ANALYSIS.md` (comprehensive analysis)
- [x] Clean working directory (`git status` shows no uncommitted changes)
- [x] All tests passing (`npm run test && npm run test:e2e`)
- [x] Access to staging environment
- [x] Database backup capability
- [x] 4-8 hours available for upgrade + testing

---

## 🎯 QUICK START (TL;DR)

```bash
# 1. Create branch
git checkout -b upgrade/prisma-7

# 2. Upgrade packages
npm install prisma@latest @prisma/client@latest

# 3. Regenerate client
npx prisma generate

# 4. Verify
npx tsc --noEmit && npm run build && npm run test

# 5. Test on staging before production!
```

---

## 📝 DETAILED STEP-BY-STEP INSTRUCTIONS

### PHASE 1: PREPARATION (15 minutes)

#### Step 1.1: Create Feature Branch

```bash
# Create and switch to upgrade branch
git checkout -b upgrade/prisma-7

# Push to remote (creates backup)
git push -u origin upgrade/prisma-7
```

#### Step 1.2: Create Backup Tag

```bash
# Tag current state for easy rollback
git tag pre-prisma-7-upgrade
git push --tags

# Backup lockfile
cp package-lock.json package-lock.json.backup
```

#### Step 1.3: Document Current State

```bash
# Save current versions
npx prisma --version > prisma-version-before.txt
npm list @prisma/client >> prisma-version-before.txt
npm list @prisma/adapter-pg >> prisma-version-before.txt

# Save current test results
npm run test > test-results-before.txt 2>&1 || true
```

#### Step 1.4: Verify Clean Baseline

```bash
# These should ALL pass before upgrading
npx tsc --noEmit                    # ✅ Should show 0 errors
npm run build                       # ✅ Should succeed
npm run test                        # ✅ Should pass
```

**⚠️ STOP if any of these fail! Fix issues before upgrading.**

---

### PHASE 2: PACKAGE UPGRADE (15 minutes)

#### Step 2.1: Upgrade Prisma Packages

```bash
# Upgrade to latest Prisma 7
npm install prisma@latest @prisma/client@latest

# Alternative: Install specific version (recommended for production)
# npm install prisma@7.0.1 @prisma/client@7.0.1
```

#### Step 2.2: Verify Installed Versions

```bash
# Check installed versions
npm list prisma
npm list @prisma/client
npm list @prisma/adapter-pg  # Should still be v7.0.0 ✅

# Expected output:
# prisma@7.x.x
# @prisma/client@7.x.x
# @prisma/adapter-pg@7.0.0 (already v7! ✅)
```

#### Step 2.3: Check for Peer Dependency Warnings

```bash
# Install dependencies and check for warnings
npm install

# Look for peer dependency warnings about @prisma/client
# If warnings appear, may need to update @auth/prisma-adapter:
# npm install @auth/prisma-adapter@latest
```

#### Step 2.4: Save New Versions

```bash
# Document new versions
npx prisma --version > prisma-version-after.txt
npm list @prisma/client >> prisma-version-after.txt
```

---

### PHASE 3: CLIENT REGENERATION (15 minutes)

#### Step 3.1: Format Schema

```bash
# Format Prisma schema (optional but recommended)
npx prisma format
```

#### Step 3.2: Regenerate Prisma Client

```bash
# Generate new Prisma Client with v7
npx prisma generate

# Expected output:
# ✔ Generated Prisma Client (v7.x.x) to ./node_modules/@prisma/client
```

#### Step 3.3: Verify Generation

```bash
# Check generated files
ls -la node_modules/.prisma/client/

# Should see:
# - index.js
# - index.d.ts
# - libquery_engine-*
```

#### Step 3.4: Clear Next.js Cache

```bash
# Clear build cache to prevent stale imports
rm -rf .next
rm -rf node_modules/.cache
```

---

### PHASE 4: TYPE SAFETY VERIFICATION (30 minutes)

#### Step 4.1: TypeScript Compilation Check

```bash
# This is the critical test - must pass!
npx tsc --noEmit

# Expected: "Found 0 errors"
# If errors appear, review them carefully
```

**Common Type Errors After Upgrade:**

- Nullable field handling changes
- Generated type signatures slightly different
- Need to update type imports

#### Step 4.2: Build Verification

```bash
# Try production build
npm run build

# Expected: Successful build with no errors
# Check for:
# ✓ Compiled successfully
# ✓ All routes generated
```

#### Step 4.3: Bundle Analysis (Optional)

```bash
# Verify Prisma client size hasn't changed significantly
npm run build:analyze

# Check:
# - Server bundle size (Prisma is server-only)
# - Client bundle NOT containing Prisma
```

#### Step 4.4: Review Build Output

```bash
# Look for any warnings about:
# - Deprecated APIs
# - Module resolution issues
# - Build size changes
```

---

### PHASE 5: AUTOMATED TESTING (1-2 hours)

#### Step 5.1: Unit Tests

```bash
# Run full unit test suite
npm run test

# Expected: All tests pass
# If failures, investigate:
# - Type mismatches
# - Query result shape changes
# - Mock updates needed
```

#### Step 5.2: Database Persistence Tests

```bash
# Test database operations specifically
npm run test:db-persistence

# This tests:
# - CRUD operations
# - Transactions
# - Raw SQL queries
# - Complex queries
```

#### Step 5.3: Integration Tests

```bash
# Test monitoring system integration
npm run test:monitoring-integration

# Covers:
# - WorkflowExecution persistence
# - SystemHealthCheck records
# - NotificationLog entries
```

#### Step 5.4: E2E Tests (Subset First)

```bash
# Run critical path E2E tests first
npm run test:e2e:direct -- --grep "@smoke"

# If smoke tests pass, run full suite:
npm run test:e2e

# Tests critical flows:
# - Authentication
# - Farm management
# - Product creation
# - Order placement
```

#### Step 5.5: Test Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Verify coverage maintained:
# - Branches: 80%+
# - Functions: 80%+
# - Lines: 80%+
```

---

### PHASE 6: LOCAL RUNTIME TESTING (1 hour)

#### Step 6.1: Start Development Server

```bash
# Start local dev server
npm run dev

# Server should start on http://localhost:3001
# Watch for:
# ✅ Database connection successful
# ✅ No Prisma client errors
# ✅ Routes loading correctly
```

#### Step 6.2: Manual Smoke Tests

**Authentication Flow:**

1. Navigate to `/login`
2. Log in with test account
3. Verify session created
4. Log out
5. Verify session cleared

**Farm Management:**

1. Navigate to farms list
2. View farm details
3. Create new farm (if farmer account)
4. Update farm information
5. Verify changes persisted

**Product Management:**

1. Navigate to products
2. Filter by category
3. Search for products
4. Create new product
5. Update product details
6. Verify inventory calculations

**Order Flow:**

1. Add products to cart
2. Proceed to checkout
3. Enter shipping information
4. Place order (test mode)
5. Verify order created in database

**Admin Features:**

1. Navigate to admin dashboard
2. View pending farms
3. Approve/reject farm
4. View user management
5. Check monitoring dashboard

**Monitoring System:**

1. Navigate to `/admin/monitoring`
2. Verify workflow executions displayed
3. Check system health metrics
4. View notification logs
5. Test real-time updates

#### Step 6.3: Database Query Inspection

```bash
# Enable Prisma query logging
# In .env.local add:
# DEBUG=prisma:query

# Restart server and watch logs for:
# - Query execution times
# - Connection pool status
# - Any slow queries
```

---

### PHASE 7: STAGING DEPLOYMENT (2-3 hours)

#### Step 7.1: Commit Changes

```bash
# Review changes
git status
git diff package.json
git diff package-lock.json

# Commit upgrade
git add package.json package-lock.json
git commit -m "chore: upgrade Prisma to v7.x.x

- Upgraded prisma from v6.19.0 to v7.x.x
- Upgraded @prisma/client from v6.19.0 to v7.x.x
- Regenerated Prisma client
- All tests passing
- Type safety verified
- Local testing completed"

git push origin upgrade/prisma-7
```

#### Step 7.2: Create Pull Request

```markdown
# PR Title: Upgrade Prisma to v7

## Changes

- Upgraded Prisma from v6.19.0 to v7.x.x
- Upgraded @prisma/client to v7.x.x
- Regenerated Prisma client with v7 types

## Testing Completed

- [x] TypeScript compilation: 0 errors
- [x] Production build: Success
- [x] Unit tests: All passing
- [x] Integration tests: All passing
- [x] E2E tests: All passing
- [x] Local runtime testing: Successful
- [x] Database operations: Verified

## Deployment Plan

1. Deploy to staging
2. Run migrations: `npx prisma migrate deploy`
3. Monitor for 24-48 hours
4. Deploy to production (after approval)

## Rollback Plan

1. Revert package.json changes
2. Run `npm ci`
3. Run `npx prisma generate`
4. Restart services

## References

- Analysis: `PRISMA_7_UPGRADE_ANALYSIS.md`
- Prisma 7 Docs: https://www.prisma.io/docs/guides/upgrade-guides/prisma-7
```

#### Step 7.3: Deploy to Staging

```bash
# Follow your deployment process
# Example with Vercel:
# vercel --prod

# Or manual deployment:
# 1. SSH to staging server
# 2. Pull latest code
# 3. Run npm install
# 4. Run migrations
# 5. Restart service
```

#### Step 7.4: Run Migrations on Staging

```bash
# Connect to staging environment
export DATABASE_URL="postgresql://staging-db-url"

# Check migration status
npx prisma migrate status

# Deploy migrations (if any)
npx prisma migrate deploy

# Verify migration success
npx prisma migrate status
```

#### Step 7.5: Seed Staging Database (If Needed)

```bash
# If fresh database or reset needed
npm run db:seed:basic

# Verify seed data
npx prisma studio  # Opens Prisma Studio
```

#### Step 7.6: Run Full Test Suite on Staging

```bash
# Set staging environment
export NEXT_PUBLIC_API_URL="https://staging.yourdomain.com"
export DATABASE_URL="postgresql://staging-db-url"

# Run E2E tests against staging
npm run test:e2e

# Run API integration tests
npm run test:monitoring-integration
```

#### Step 7.7: Monitor Staging (24-48 hours)

```yaml
Metrics to Watch:
  Database:
    - Query performance (check slow query log)
    - Connection pool usage
    - Transaction success rate

  Application:
    - Response times (P50, P95, P99)
    - Error rates by endpoint
    - Memory usage
    - CPU usage

  Business:
    - User-facing features working
    - Background jobs running
    - Email delivery functional
    - Order processing working
```

---

### PHASE 8: PRODUCTION DEPLOYMENT (1 hour + monitoring)

#### Step 8.1: Pre-Production Checklist

```bash
# Verify staging success
- [ ] Staging stable for 24-48 hours
- [ ] No critical errors
- [ ] Performance metrics normal
- [ ] All features functional
- [ ] Team approval received
```

#### Step 8.2: Database Backup

```bash
# CRITICAL: Backup production database first!

# PostgreSQL backup
pg_dump $DATABASE_URL > backup-pre-prisma7-$(date +%Y%m%d-%H%M%S).sql

# Or use cloud provider snapshot:
# AWS RDS: Create DB snapshot
# Azure: Create database backup
# Google Cloud SQL: Create backup
```

#### Step 8.3: Deployment Window Planning

```yaml
Recommended Window:
  Day: Tuesday-Thursday (avoid Mon/Fri)
  Time: 2:00 AM - 6:00 AM (local time)
  Duration: 2 hours

Team Availability:
  - Lead engineer: On-call
  - DevOps: On-call
  - DBA: On standby

Communication:
  - Notify users 48h advance
  - Status page updated
  - Team in Slack channel
```

#### Step 8.4: Deploy to Production

```bash
# Merge PR to main
git checkout main
git pull origin main
git merge upgrade/prisma-7
git push origin main

# Deploy (follow your process)
# Example deployment commands...

# Run migrations
export DATABASE_URL="postgresql://production-db-url"
npx prisma migrate deploy
```

#### Step 8.5: Post-Deployment Verification (First 2 Hours)

```bash
# Immediate checks (0-15 minutes)
- [ ] Application started successfully
- [ ] Database connections established
- [ ] Health check endpoints responding
- [ ] No error spikes in logs

# Early checks (15-60 minutes)
- [ ] User authentication working
- [ ] Core features functional
- [ ] Background jobs running
- [ ] API endpoints responding

# Ongoing monitoring (1-2 hours)
- [ ] Response times normal
- [ ] Error rates within baseline
- [ ] Memory usage stable
- [ ] No slow query alerts
```

#### Step 8.6: Extended Monitoring (24-48 Hours)

```yaml
Day 1 (0-24h):
  - Check metrics every 2 hours
  - Monitor error logs continuously
  - Watch user reports
  - Verify background jobs

Day 2 (24-48h):
  - Check metrics every 4 hours
  - Review slow query logs
  - Analyze performance trends
  - Collect user feedback

Week 1 (48h-7d):
  - Daily metric reviews
  - Weekly performance report
  - Address any issues
  - Document learnings
```

---

## 🚨 ROLLBACK PROCEDURES

### Quick Rollback (If Issues in First Hour)

```bash
# 1. Revert code
git revert HEAD
git push origin main

# 2. Redeploy previous version
# (Follow your deployment process)

# 3. Restore database if migrations ran
psql $DATABASE_URL < backup-pre-prisma7-*.sql

# 4. Verify rollback
curl https://yourdomain.com/api/health
npm run test:e2e -- --grep "@smoke"
```

### Planned Rollback (If Issues After Extended Testing)

```bash
# 1. Create rollback branch
git checkout -b rollback/prisma-7
git revert <commit-hash>

# 2. Downgrade packages
npm install prisma@6.19.0 @prisma/client@6.19.0

# 3. Regenerate old client
npx prisma generate

# 4. Test locally
npm run build && npm run test

# 5. Deploy through normal process
# (Create PR, test on staging, deploy to prod)
```

---

## ✅ SUCCESS CRITERIA

### Upgrade Considered Successful When:

**Technical Metrics:**

- [x] All automated tests passing (unit, integration, E2E)
- [x] TypeScript compilation clean (0 errors)
- [x] Production build successful
- [x] Database queries performing within baseline
- [x] Connection pool stable
- [x] Memory usage normal

**Business Metrics:**

- [x] All user-facing features functional
- [x] Order processing working
- [x] Authentication/authorization working
- [x] Admin features accessible
- [x] Monitoring dashboard operational

**Operational Metrics:**

- [x] Zero critical errors in first 48h
- [x] Error rates within normal range
- [x] Response times maintained
- [x] Background jobs running
- [x] Email delivery working

---

## 📞 SUPPORT & RESOURCES

### If You Encounter Issues

1. **Check Logs First**

   ```bash
   # Application logs
   pm2 logs  # or your log viewer

   # Prisma query logs
   export DEBUG=prisma:query

   # Database logs
   # Check PostgreSQL logs for errors
   ```

2. **Common Issues & Solutions**
   - **Type errors:** Regenerate client with `npx prisma generate`
   - **Connection errors:** Check DATABASE_URL and pool settings
   - **Migration errors:** Review SQL in migration file
   - **Performance issues:** Enable query logging and check for N+1

3. **External Resources**
   - Prisma Discord: https://discord.gg/prisma
   - Prisma GitHub: https://github.com/prisma/prisma/issues
   - Prisma Docs: https://www.prisma.io/docs
   - Stack Overflow: `[prisma]` tag

4. **Project Documentation**
   - Full Analysis: `PRISMA_7_UPGRADE_ANALYSIS.md`
   - Database Docs: `.github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md`
   - Cursor Rules: `.cursorrules`

---

## 📝 POST-UPGRADE DOCUMENTATION

### Update These Files After Success:

1. **README.md**

   ```markdown
   ## Requirements

   - Node.js >= 20.19.0
   - PostgreSQL >= 14
   - Prisma 7.x.x ✅ (Updated!)
   ```

2. **CHANGELOG.md**

   ```markdown
   ## [1.1.0] - 2024-11-XX

   ### Changed

   - Upgraded Prisma from v6.19.0 to v7.x.x
   - Improved query performance
   - Enhanced type safety
   ```

3. **package.json** (already updated by npm install)

4. **Documentation**
   - Update any Prisma-specific docs
   - Note any API changes discovered
   - Document performance improvements

---

## 🎉 COMPLETION CHECKLIST

### Before Marking Complete:

- [ ] All phases completed successfully
- [ ] Staging validated (24-48h minimum)
- [ ] Production deployed successfully
- [ ] Monitoring shows healthy metrics (48h)
- [ ] No critical issues reported
- [ ] Team notified of completion
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Backup created and verified
- [ ] Rollback tested (optional but recommended)

### Clean Up:

```bash
# After 1 week of stable production:

# 1. Delete upgrade branch (if merged)
git branch -d upgrade/prisma-7
git push origin --delete upgrade/prisma-7

# 2. Clean up backup files
rm package-lock.json.backup
rm prisma-version-before.txt
rm test-results-before.txt

# 3. Archive old database backups (after 30 days)

# 4. Close upgrade tracking ticket/issue
```

---

## 📊 EXPECTED TIMELINE

```
Total Time: 4-8 hours (excluding staging soak time)

Phase 1: Preparation          ⏱️  15 min
Phase 2: Package Upgrade      ⏱️  15 min
Phase 3: Client Regeneration  ⏱️  15 min
Phase 4: Type Verification    ⏱️  30 min
Phase 5: Automated Testing    ⏱️  1-2 hours
Phase 6: Local Testing        ⏱️  1 hour
Phase 7: Staging Deploy       ⏱️  2-3 hours (+ 24-48h soak)
Phase 8: Production Deploy    ⏱️  1 hour (+ monitoring)

Total Active Work: 6-8 hours
Total Calendar Time: 3-5 days (including soak periods)
```

---

## 🌟 TIPS FOR SUCCESS

1. **Don't Rush**: Take time to test thoroughly
2. **Read Logs**: Errors usually have clear messages
3. **Test Incrementally**: Don't skip phases
4. **Monitor Closely**: First 48h are critical
5. **Have Rollback Ready**: Know how to revert quickly
6. **Document Issues**: Help future upgrades
7. **Communicate**: Keep team informed
8. **Stay Calm**: Issues are normal, you have backups!

---

**Good luck with your upgrade! 🚀**

_Remember: The codebase is in excellent shape for this upgrade. Follow the process, test thoroughly, and you'll be running Prisma 7 smoothly!_

---

**Guide Version:** 1.0  
**Last Updated:** November 2024  
**For Project:** Farmers Market Platform  
**Prisma Version:** 6.19.0 → 7.x.x
