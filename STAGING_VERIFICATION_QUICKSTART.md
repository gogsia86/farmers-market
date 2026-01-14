# 🚀 Staging Verification - Quick Start Guide

**Time Required**: 15-30 minutes  
**Goal**: Verify Phase 3 performance improvements on staging

---

## ✅ Quick Checklist

### 1. Verify Deployment (2 minutes)

```bash
# Check latest commit is deployed
git log --oneline -5

# Expected latest commits:
# e780fe92 - Task 4 completion document
# 86703d9b - Integration tests + DB setup
# ff4252f7 - Task 3 handoff document
# 9c057512 - Phase 3 Task 3 documentation
# f6ce02bc - Unit tests fixed
```

**Check Vercel**:
1. Go to https://vercel.com/dashboard
2. Find your project
3. Check "Deployments" tab
4. Verify latest deployment shows "Ready" status
5. Note the deployment URL

### 2. Health Check (1 minute)

```bash
# Replace with your staging URL
STAGING_URL="https://your-app.vercel.app"

# Test health endpoint
curl $STAGING_URL/api/health | jq

# Expected output:
# {
#   "status": "healthy",
#   "checks": {
#     "database": { "status": "pass" },
#     "redis": { "status": "pass" }
#   }
# }
```

### 3. Quick Performance Test (5 minutes)

**Test 1: Farm List (Cold Cache)**
```bash
# First request - cold cache
time curl "$STAGING_URL/api/farms?page=1&limit=20"
# Note the time: ~100-300ms expected
```

**Test 2: Farm List (Warm Cache)**
```bash
# Second request - should hit cache
time curl "$STAGING_URL/api/farms?page=1&limit=20"
# Note the time: ~5-50ms expected (90%+ faster)
```

**Test 3: Farm Detail**
```bash
# Get a farm ID from the list response above
FARM_ID="farm_xxxxx"

# Cold cache
time curl "$STAGING_URL/api/farms/$FARM_ID"
# Note: ~80-150ms

# Warm cache
time curl "$STAGING_URL/api/farms/$FARM_ID"
# Note: ~3-20ms (should be much faster)
```

### 4. Browser Testing (5 minutes)

1. Open staging URL in browser
2. Open DevTools (F12) → Network tab
3. Navigate to `/farms`
4. Note the load time
5. Refresh page (Cmd+R / Ctrl+R)
6. Compare load times - should be significantly faster

**Check These Pages**:
- `/farms` - Farm list
- `/farms/[id]` - Farm detail
- `/` - Home page
- `/browse` - Browse page

### 5. Cache Verification (3 minutes)

**Check Redis Keys**:
```bash
# If you have Upstash dashboard access:
# 1. Go to console.upstash.com
# 2. Select your Redis database
# 3. Click "Data Browser"
# 4. Look for keys starting with:
#    - farm:*
#    - farms:list:*
#    - farms:search:*
```

**Manual Cache Test**:
```bash
# Test cache invalidation
# 1. Get farm detail (caches it)
curl "$STAGING_URL/api/farms/$FARM_ID"

# 2. Update the farm (should invalidate cache)
# (Requires authentication - do via UI or with token)

# 3. Get farm detail again (should be slower - cache miss)
curl "$STAGING_URL/api/farms/$FARM_ID"
```

### 6. Database Query Check (3 minutes)

```bash
# Connect to staging database
psql $STAGING_DATABASE_URL

# Check query stats
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements 
WHERE query LIKE '%Farm%'
ORDER BY calls DESC 
LIMIT 10;

# Expected: Low call counts for Farm queries (cache is working)
```

### 7. Error Check (2 minutes)

**Vercel Logs**:
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# View logs
vercel logs --follow

# Look for:
# ✅ No ERROR messages
# ✅ Cache hit messages
# ✅ Normal request flow
```

**Check for Issues**:
```bash
# Count errors in last hour
vercel logs | grep ERROR | wc -l

# Should be: 0 or very low
```

---

## 📊 Quick Results Template

Copy this and fill in your results:

```markdown
## Staging Verification Results

**Date**: 2025-01-XX
**Tester**: [Your Name]
**Duration**: XX minutes

### ✅ Deployment Status
- [x] Latest commit deployed
- [x] Health check passing
- [x] No errors in logs

### ⚡ Performance Results

| Test | Before (Estimate) | After | Improvement |
|------|------------------|-------|-------------|
| Farm List (cold) | ~150ms | XXms | XX% |
| Farm List (warm) | ~150ms | XXms | XX% |
| Farm Detail (cold) | ~100ms | XXms | XX% |
| Farm Detail (warm) | ~100ms | XXms | XX% |
| Page Load | ~2500ms | XXms | XX% |

### 🎯 Cache Performance
- L1/L2 working: [YES/NO/UNKNOWN]
- Cache hit observed: [YES/NO]
- Cache invalidation working: [YES/NO/NOT TESTED]

### 🐛 Issues Found
- [ ] None
- [ ] [List any issues]

### 📝 Notes
- [Any observations]

### ✅ Recommendation
- [ ] Approved for production
- [ ] Needs fixes
- [ ] Needs more testing
```

---

## 🎯 Success Criteria (Quick Check)

**Must Pass**:
- [x] Deployment successful
- [x] Health check returns 200
- [x] No critical errors in logs
- [x] API endpoints responding
- [x] Pages loading without errors

**Should Pass**:
- [x] Second request faster than first (cache working)
- [x] Response time improved by >70%
- [x] No increase in errors
- [x] Database queries reduced (check pg_stats)

**Nice to Have**:
- [x] Cache hit rate >80%
- [x] Response time improved by >90%
- [x] Page load <1 second

---

## 🚨 If Something Goes Wrong

**Critical Issues** (Rollback immediately):
```bash
# Rollback to previous deployment
vercel rollback

# Or revert commits
git revert HEAD~5..HEAD
git push origin master
```

**What to Check**:
1. Vercel logs: `vercel logs | grep ERROR`
2. Database connection: Check DATABASE_URL in Vercel env
3. Redis connection: Check UPSTASH_REDIS_REST_URL
4. Environment variables: Verify all set correctly

**Common Issues**:
- "Database connection failed" → Check DATABASE_URL
- "Redis connection failed" → Check Upstash credentials
- "High error rate" → Check application logs
- "Slow responses" → Cache might not be working

---

## 📈 Detailed Metrics (Optional)

If you want more detailed metrics:

```bash
# Run performance comparison (if baseline exists)
npm run compare-performance -- reports/baseline.json reports/current.json

# Run full site inspection
npm run inspect:staging

# Generate load test report
npm run k6:test -- https://staging.vercel.app
```

---

## 🎉 Next Steps

### If Verification Passes:
1. ✅ Fill in results template above
2. ✅ Update `PHASE_3_STAGING_VERIFICATION.md` with results
3. ✅ Create `PHASE_3_STAGING_VERIFIED.md` document
4. ✅ Get team approval
5. ✅ Proceed to **Task 6: Production Rollout**

### If Verification Fails:
1. ❌ Document issues found
2. ❌ Create bug tickets
3. ❌ Fix issues
4. ❌ Re-deploy to staging
5. ❌ Re-run verification

---

## 💡 Pro Tips

1. **Run tests twice**: First run warms cache, second run shows true performance
2. **Clear browser cache**: Use Cmd+Shift+R / Ctrl+Shift+R for hard refresh
3. **Use incognito mode**: Avoids browser cache interference
4. **Check different pages**: Don't just test one endpoint
5. **Test at different times**: Try low and high traffic periods
6. **Document everything**: Screenshots and logs are helpful

---

## 🔗 Related Documents

- **Full Verification Plan**: `PHASE_3_STAGING_VERIFICATION.md`
- **Phase 3 Task 4**: `PHASE_3_TASK_4_COMPLETE.md`
- **Phase 2 Results**: `PHASE_2_DEPLOYED.md`
- **Testing Guide**: `TESTING_DATABASE_SETUP.md`

---

**Total Time**: 15-30 minutes  
**Confidence Level**: High (with Phase 2 already deployed)  
**Risk Level**: Low (staging only, easy rollback)

🌾 **Agricultural Consciousness: Verify with Speed and Confidence** ⚡