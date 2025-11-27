# 🚀 PHASE 6 QUICK REFERENCE CARD

**Prisma 7 Staging Deployment - Essential Commands & Checklist**

---

## ⚡ QUICK START

```bash
# 1. Verify environment
git branch --show-current  # Should be: upgrade/prisma-7
npx prisma --version       # Should be: 7.0.1
npm run build              # Should succeed

# 2. Backup database
pg_dump $STAGING_DATABASE_URL > backup-$(date +%Y%m%d).sql

# 3. Deploy to staging
git push origin upgrade/prisma-7
# Then deploy using your method (Vercel, Azure, Docker, etc.)

# 4. Verify deployment
curl https://staging.your-app.com/api/health
```

---

## 📋 IMMEDIATE CHECKS (0-15 min)

```bash
# Health check
curl https://staging.your-app.com/api/health
# Expected: {"status": "healthy", "prisma": "7.0.1"}

# Database connection
curl https://staging.your-app.com/api/health/db
# Expected: {"status": "connected"}

# Check logs for Prisma version
grep "Prisma Client" logs/staging.log
# Expected: "Prisma Client 7.0.1"
```

---

## ✅ CRITICAL PATH TESTS (15-60 min)

### Test Checklist

- [ ] Login works
- [ ] View farms list
- [ ] View farm details
- [ ] View products
- [ ] Create test order
- [ ] Upload image
- [ ] Admin dashboard loads

### Quick API Tests

```bash
# List farms
curl https://staging.your-app.com/api/farms?limit=5

# Get farm details
curl https://staging.your-app.com/api/farms/[farm-id]

# Health endpoint
curl https://staging.your-app.com/api/health
```

---

## 📊 KEY METRICS TO MONITOR

### Target Metrics

- **Error Rate**: < 1%
- **Avg Response Time**: < 200ms
- **P95 Response Time**: < 500ms
- **DB Query Avg**: < 50ms
- **Connection Pool**: < 80%
- **Memory**: Stable (no leaks)
- **CPU**: < 50% avg

### Monitoring Commands

```bash
# Response time
curl -w "Time: %{time_total}s\n" -o /dev/null -s https://staging.your-app.com/api/farms

# Database queries
psql $STAGING_DATABASE_URL -c "
  SELECT query, calls, mean_time, max_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC LIMIT 10;"

# Connection pool
psql $STAGING_DATABASE_URL -c "
  SELECT count(*) as connections, state
  FROM pg_stat_activity
  GROUP BY state;"

# Memory usage (if Docker)
docker stats farmers-market-staging --no-stream
```

---

## 🔥 ROLLBACK PROCEDURE

### When to Rollback

- ❌ Error rate > 5%
- ❌ Critical features broken
- ❌ Data corruption
- ❌ Performance degraded > 50%

### Quick Rollback

```bash
# 1. Switch branch
git checkout main

# 2. Downgrade Prisma
npm install prisma@6.19.0 @prisma/client@6.19.0

# 3. Generate client
npx prisma generate

# 4. Build and deploy
npm run build
# Deploy using your method

# 5. Restore database (if needed)
psql $STAGING_DATABASE_URL < backup-YYYYMMDD.sql
```

---

## 📅 24-48 HOUR CHECKLIST

### Morning Check

- [ ] Review overnight logs
- [ ] Check error rate
- [ ] Verify response times
- [ ] Check memory usage
- [ ] Review slow queries

### Mid-Day Check

- [ ] Monitor peak traffic
- [ ] Check connection pool
- [ ] Review user feedback
- [ ] Update metrics

### Evening Check

- [ ] Full day review
- [ ] Memory leak check
- [ ] Document issues
- [ ] Update status

---

## 🎯 GO / NO-GO CRITERIA

### ✅ GO (Proceed to Production)

- ✅ Error rate < 1%
- ✅ Performance within 10% baseline
- ✅ No data issues
- ✅ All features working
- ✅ No memory leaks
- ✅ Tests passing >95%
- ✅ Team confident

### ❌ NO-GO (Do Not Proceed)

- ❌ Error rate > 2%
- ❌ Critical features broken
- ❌ Performance degraded >20%
- ❌ Data corruption
- ❌ Memory leaks
- ❌ Rollback required
- ❌ Team concerns

---

## 🧪 AUTOMATED TESTS

```bash
# Smoke tests
npm run test:e2e:direct -- --grep "@smoke"

# Integration tests
npm run test:integration:staging

# Load tests
npm run test:load:staging
```

---

## 📞 ESCALATION

### Contact Order

1. **Primary On-Call**: [Your contact]
2. **DevOps Lead**: [Your contact]
3. **Tech Lead**: [Your contact]
4. **Emergency**: [Your contact]

---

## 🔍 USEFUL QUERIES

### Database Health

```sql
-- Connection stats
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC LIMIT 20;

-- Table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Application Logs

```bash
# Prisma errors
grep -i "prisma" logs/staging.log | grep -i "error"

# Connection errors
grep -i "connection" logs/staging.log | grep -i "error\|fail"

# Recent errors
tail -100 logs/staging.log | grep -i "error"

# Error count
grep -c "error" logs/staging.log
```

---

## 📊 DAILY STATUS UPDATE TEMPLATE

```
Subject: [STAGING] Prisma 7 - Day X Status

**Status**: 🟢 Healthy / 🟡 Monitoring / 🔴 Issues

**Metrics**:
- Error Rate: X% (target: <1%)
- Avg Response: Xms (target: <200ms)
- Memory: X GB (stable/increasing)
- Issues: X (X critical, X medium, X low)

**Next Steps**: Continue monitoring / Address issues / Proceed to prod

**Details**: [Link to monitoring dashboard]
```

---

## 📁 KEY DOCUMENTS

- `PRISMA_7_PHASE_6_STAGING_GUIDE.md` - Full deployment guide
- `PHASE_6_DEPLOYMENT_CHECKLIST.md` - Detailed checklist
- `PHASE_6_MONITORING_DASHBOARD.md` - Metrics dashboard
- `PRISMA_7_UPGRADE_GUIDE.md` - Original upgrade guide
- `PRISMA_7_RISK_ASSESSMENT.md` - Risk analysis

---

## 💡 PRO TIPS

1. **Monitor First Hour Closely** - Most issues appear immediately
2. **Compare with Baseline** - Keep Prisma 6 metrics for comparison
3. **Document Everything** - Log all observations and decisions
4. **Test Rollback Early** - Verify rollback procedure works
5. **Communicate Often** - Keep team informed of status
6. **Trust the Data** - Let metrics guide decisions
7. **Be Conservative** - When in doubt, extend observation period

---

## 🚨 RED FLAGS

Rollback immediately if you see:

- 🚨 Database connection failures
- 🚨 Error rate spike >5%
- 🚨 Data corruption
- 🚨 Memory leak (continuous growth)
- 🚨 Query timeout errors
- 🚨 Response time >3x baseline

---

## ✅ SUCCESS INDICATORS

You're ready for production when:

- ✅ 48 hours stable operation
- ✅ All metrics within targets
- ✅ Zero critical issues
- ✅ User feedback positive
- ✅ Team confidence high
- ✅ Stakeholder approval obtained

---

## 🎯 PHASE 6 GOALS

1. Deploy Prisma 7 to staging ✅
2. Validate all features work ⏳
3. Monitor for 24-48 hours ⏳
4. Collect performance metrics ⏳
5. Get stakeholder approval ⏳
6. Prepare for production ⏳

---

**Phase**: 6 of 7  
**Duration**: 2-3 days  
**Status**: 📋 In Progress  
**Next**: Phase 7 - Production Deployment

---

_"Deploy fast, monitor faster."_ 🚀⚡
