# ⚡ Quick Reference Guide - Farmers Market Platform

**Production Environment Cheat Sheet**  
**Last Updated:** January 10, 2026

---

## 🚀 One-Line Commands

### Testing
```bash
# Quick health check (30 seconds)
npm run test:vercel:quick

# Full test suite (1-2 minutes)
npm run test:vercel:full

# Test with detailed report
npm run test:vercel:full --report

# Baseline testing (3 tests, 10 minutes)
npm run test:vercel:full && sleep 300 && npm run test:vercel:full && sleep 300 && npm run test:vercel:full
```

### Monitoring
```bash
# View trends and analysis
npm run monitor:trends

# Export weekly report
npm run monitor:export
```

### Database
```bash
# Check database status
npm run db:status:vercel

# Verify seed data
npm run db:verify:vercel

# Seed database (interactive)
npm run db:seed:vercel

# Force seed (WARNING: overwrites data)
npm run db:seed:vercel --force
```

---

## 📊 Dashboard Quick View

### Current Status (as of last test)
```
Health Score:    73.0/100 (Grade C - Good)
Success Rate:    85.7% (12/14 passing)
Avg Response:    772ms
Uptime:          100%
Security:        A+ (Perfect)
```

### Test Results
```
✅ Passed:    12 tests
❌ Failed:    0 tests
⚠️  Warnings: 2 tests
```

### Known Issues
```
⚠️  Error Handling: 307 redirect instead of 404
⚠️  Static Assets: Missing favicon
```

---

## 🔐 Test Credentials

```
Admin User:
  Email:    admin@farmersmarket.com
  Password: Admin123!
  Role:     ADMIN

Farmer User:
  Email:    john@greenvalley.com
  Password: Farmer123!
  Role:     FARMER

Customer User:
  Email:    jane@example.com
  Password: Customer123!
  Role:     CUSTOMER
```

---

## 🌐 URLs & Endpoints

### Production
```
App:      https://farmers-market-platform.vercel.app
Health:   https://farmers-market-platform.vercel.app/api/health
Farms:    https://farmers-market-platform.vercel.app/api/farms
Products: https://farmers-market-platform.vercel.app/api/products
```

### Key Pages
```
Home:     /
Login:    /login
Register: /register
Farms:    /farms
Products: /products
```

---

## 📋 Daily Checklist

### Morning (5 minutes)
- [ ] Run `npm run test:vercel:quick`
- [ ] Check for any failures
- [ ] Review response times
- [ ] Verify all APIs operational

### Weekly (15 minutes)
- [ ] Run `npm run test:vercel:full`
- [ ] Run `npm run monitor:trends`
- [ ] Review action items
- [ ] Update documentation
- [ ] Export weekly report

### Monthly (30 minutes)
- [ ] Full baseline testing (3 tests)
- [ ] Review performance trends
- [ ] Update baseline metrics
- [ ] Plan optimizations
- [ ] Document improvements

---

## 🔧 Common Tasks

### Fix 404 Handling
```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl mt-4">Page Not Found</p>
        <Link href="/" className="mt-6 btn-primary">
          Return Home
        </Link>
      </div>
    </div>
  );
}
```

### Add Favicon
```bash
# Add these files to public/
public/favicon.ico              # 32x32 or 16x16
public/apple-touch-icon.png     # 180x180
public/favicon-16x16.png        # 16x16
public/favicon-32x32.png        # 32x32
```

### Add Canonical URLs
```typescript
// app/layout.tsx or page.tsx
export const metadata = {
  alternates: {
    canonical: 'https://farmers-market-platform.vercel.app'
  }
};
```

### Implement Redis Caching
```typescript
// lib/cache/redis.ts
import { Redis } from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL);

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const fresh = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(fresh));
  return fresh;
}
```

---

## 🚨 Emergency Procedures

### Site Down
```bash
# 1. Check Vercel status
curl -I https://farmers-market-platform.vercel.app

# 2. Check health endpoint
curl https://farmers-market-platform.vercel.app/api/health

# 3. Review Vercel dashboard logs
# Visit: https://vercel.com/dashboard

# 4. Check database connectivity
npm run db:status:vercel

# 5. Rollback if needed (Vercel dashboard)
```

### Performance Issues
```bash
# 1. Run diagnostics
npm run test:vercel:full

# 2. Check trends
npm run monitor:trends

# 3. Profile slow endpoints
# Add logging and check Vercel logs

# 4. Consider temporary caching
# Implement Redis for immediate relief

# 5. Review database queries
# Check for N+1 problems, missing indexes
```

### Database Issues
```bash
# 1. Verify connection
npm run db:status:vercel

# 2. Check seed data
npm run db:verify:vercel

# 3. Re-seed if corrupted (CAUTION!)
npm run db:seed:vercel --force

# 4. Check Prisma migrations
npx prisma migrate status

# 5. Review database logs
# Check Vercel dashboard
```

---

## 📈 Performance Targets

### Response Times
```
Excellent:  < 500ms   ✅
Good:       500-800ms ✅
Moderate:   800-1500ms ⚠️
Slow:       > 1500ms  ❌
```

### Success Rates
```
Perfect:    100%      ✅
Excellent:  95-99%    ✅
Good:       90-94%    ⚠️
Needs Work: < 90%     ❌
```

### Uptime Goals
```
Production: 99.9%     (8.76 hours downtime/year)
Target:     99.95%    (4.38 hours downtime/year)
Ideal:      99.99%    (52.56 minutes downtime/year)
```

---

## 🎯 Current Action Items

### 🔥 High Priority
- [ ] Fix 404 handling (create not-found.tsx)
- [ ] Add favicon and icons
- [ ] Investigate API route slowdown (>2000ms)
- [ ] Profile database queries

### ⚡ Medium Priority
- [ ] Implement Redis caching
- [ ] Add request deduplication
- [ ] Optimize image loading
- [ ] Add canonical URLs
- [ ] Set up CI/CD testing

### 💡 Low Priority
- [ ] Implement service worker
- [ ] Add Real User Monitoring (RUM)
- [ ] Set up performance budgets
- [ ] Configure automated alerts
- [ ] Weekly trend exports

---

## 📚 Documentation Links

### Core Docs
- [Baseline Testing Report](./BASELINE_TESTING_REPORT.md)
- [Monitoring Dashboard](./MONITORING_DASHBOARD.md)
- [Monitoring Guide](./MONITORING_GUIDE.md)
- [Bot Testing Guide](./BOT_TESTING_COMPLETE.md)
- [Database Seeding](./VERCEL_SEEDING_COMPLETE.md)

### Analysis Reports
- [Vercel Analysis](./VERCEL_ANALYSIS_REPORT.md)
- [Session Summary](./SESSION_COMPLETE.md)

### Configuration
- `.env.vercel.local` - Environment variables
- `package.json` - NPM scripts
- `scripts/` - Test and monitoring scripts

---

## 🔍 Troubleshooting

### Tests Failing
```bash
# 1. Check environment variables
cat .env.vercel.local

# 2. Verify Vercel deployment
# Visit: https://farmers-market-platform.vercel.app

# 3. Check database connection
npm run db:status:vercel

# 4. Review recent changes
git log --oneline -5

# 5. Check Vercel logs
# Dashboard: vercel.com/dashboard
```

### Slow Response Times
```bash
# Potential causes:
# - Cold start (serverless)
# - No caching layer
# - Database query inefficiency
# - Network latency
# - Vercel region mismatch

# Solutions:
# 1. Implement Redis caching
# 2. Add request deduplication
# 3. Optimize database queries
# 4. Use Vercel Edge Functions
# 5. Add CDN for static assets
```

### Database Connection Issues
```bash
# 1. Check Vercel Postgres status
# Dashboard: vercel.com/dashboard/stores

# 2. Verify environment variables
echo $POSTGRES_PRISMA_URL

# 3. Test connection manually
npx prisma db pull

# 4. Check connection pool
# Review Prisma configuration

# 5. Restart database if needed
# Vercel dashboard -> Storage -> Restart
```

---

## 🎓 Best Practices

### Before Each Deployment
1. Run tests locally
2. Review changes carefully
3. Check for breaking changes
4. Update documentation
5. Test in staging (if available)

### After Each Deployment
1. Run `npm run test:vercel:full`
2. Verify critical paths
3. Check response times
4. Monitor for errors
5. Document any issues

### Weekly Maintenance
1. Run full test suite
2. Analyze performance trends
3. Review and address warnings
4. Update action items
5. Export weekly report

### Monthly Review
1. Full baseline testing
2. Review all metrics
3. Plan optimizations
4. Update documentation
5. Archive old reports

---

## 📞 Support & Resources

### Internal
- Development Team: See project README
- Monitoring Bot: `scripts/test-vercel-deployment.ts`
- Trend Analysis: `scripts/monitor-deployment-trends.ts`

### External
- Vercel Status: https://www.vercel-status.com
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs

### Community
- Next.js Discord: https://nextjs.org/discord
- Vercel Community: https://github.com/vercel/next.js/discussions
- Prisma Slack: https://slack.prisma.io

---

## 🎉 Quick Wins

### Easy Improvements (< 30 minutes)
- [x] Set up monitoring system ✅
- [x] Create test automation ✅
- [x] Document everything ✅
- [ ] Add favicon
- [ ] Create 404 page
- [ ] Add canonical URLs

### Medium Effort (1-2 hours)
- [ ] Implement Redis caching
- [ ] Optimize images
- [ ] Add request deduplication
- [ ] Set up CI/CD testing
- [ ] Add error tracking (Sentry)

### Longer Projects (1+ days)
- [ ] Implement Real User Monitoring
- [ ] Database read replicas
- [ ] Advanced caching strategy
- [ ] Performance optimization sprint
- [ ] Comprehensive test coverage

---

## 🗓️ Maintenance Schedule

```
Daily:    Quick health check (5 min)
Weekly:   Full test + trends (15 min)
Monthly:  Baseline + optimization (30 min)
Quarterly: Major review + planning (2 hours)
```

---

## 💾 Backup & Recovery

### Database Backups
- Vercel automatically backs up PostgreSQL
- Retention: 7 days (hobby plan) or 14 days (pro)
- Manual backup: Export via Vercel dashboard

### Code Backups
- Git repository (primary backup)
- GitHub (remote backup)
- Vercel deployments (automatic snapshots)

### Report Backups
```bash
# Archive old reports monthly
mkdir -p test-reports/archives/$(date +%Y-%m)
mv test-reports/vercel-test-*.json test-reports/archives/$(date +%Y-%m)/
```

---

## 🎯 Success Metrics

### Current Performance
```
Health Score:    73.0/100  →  Target: 85+/100
Success Rate:    85.7%     →  Target: 95%+
Avg Response:    772ms     →  Target: <500ms
Uptime:          100%      →  Maintain: 99.9%+
Security:        A+        →  Maintain: A+
```

### Goals for Next Month
- Achieve 85+ health score
- Reduce avg response to <600ms
- Resolve all warnings
- Implement caching layer
- Set up automated CI/CD testing

---

**Quick Reference Version:** 1.0  
**Maintained By:** Development Team  
**Next Update:** As needed based on changes

---

*Keep this guide handy for daily operations and quick troubleshooting*