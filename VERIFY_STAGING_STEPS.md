# 🚀 Staging Verification - Step-by-Step Commands

**Date**: January 2025  
**Status**: Ready to Execute  
**Estimated Time**: 30-45 minutes

---

## 🎯 Quick Setup

### Get Your Staging URL

```bash
# Check Vercel dashboard or use CLI
vercel ls

# Or check your environment
echo $VERCEL_URL

# Set it as variable for easy use
export STAGING_URL="https://your-app.vercel.app"
```

---

## ✅ STEP 1: Verify Deployment (5 minutes)

### Check Git Commits

```bash
# View recent commits
git log --oneline -10

# Expected to see:
# 7b9dc989 - Staging Verification Documentation
# e780fe92 - Task 4 completion document
# 86703d9b - Integration tests + DB setup
# ff4252f7 - Task 3 handoff document
# 9c057512 - Phase 3 Task 3 documentation
```

### Check Vercel Deployment

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Check deployments
vercel ls

# View latest deployment
vercel inspect
```

### Test Health Endpoint

```bash
# Health check
curl -s $STAGING_URL/api/health | jq

# Expected output:
# {
#   "status": "healthy",
#   "timestamp": "2025-01-XX...",
#   "checks": {
#     "database": { "status": "pass", "latency": 15 },
#     "redis": { "status": "pass", "latency": 5 }
#   }
# }

# If jq not installed, use plain curl:
curl -i $STAGING_URL/api/health
```

**✅ Success Criteria**: 
- Health endpoint returns 200
- Database status: "pass"
- Redis status: "pass"

---

## ⚡ STEP 2: Basic Performance Test (5 minutes)

### Test 1: Farm List Endpoint

```bash
# Cold cache (first request)
echo "🥶 Cold cache test..."
time curl -s "$STAGING_URL/api/farms?page=1&limit=20" > /dev/null
# Note the time shown after "real"

# Wait a moment
sleep 2

# Warm cache (second request - should be much faster!)
echo "🔥 Warm cache test..."
time curl -s "$STAGING_URL/api/farms?page=1&limit=20" > /dev/null
# Compare with cold time - should be 70-90% faster
```

### Test 2: Get Farm Detail

```bash
# First, get a farm ID
FARM_ID=$(curl -s "$STAGING_URL/api/farms?page=1&limit=1" | jq -r '.data[0].id')
echo "Testing with farm ID: $FARM_ID"

# Cold cache
echo "🥶 Cold cache test..."
time curl -s "$STAGING_URL/api/farms/$FARM_ID" > /dev/null

# Wait
sleep 2

# Warm cache
echo "🔥 Warm cache test..."
time curl -s "$STAGING_URL/api/farms/$FARM_ID" > /dev/null
```

### Test 3: Search Endpoint

```bash
# Cold cache
echo "🥶 Cold cache search test..."
time curl -s "$STAGING_URL/api/farms?search=organic&page=1&limit=10" > /dev/null

# Wait
sleep 2

# Warm cache
echo "🔥 Warm cache search test..."
time curl -s "$STAGING_URL/api/farms?search=organic&page=1&limit=10" > /dev/null
```

**✅ Success Criteria**:
- Second request is 50-90% faster than first
- Cold cache: 80-300ms
- Warm cache: 5-50ms

---

## 📊 STEP 3: Detailed Performance Measurement (10 minutes)

### Using Automated Script

```bash
# Run verification script
npx tsx scripts/verify-staging.ts --url $STAGING_URL

# For detailed tests (more iterations)
npx tsx scripts/verify-staging.ts --url $STAGING_URL --detailed --iterations 5
```

### Manual Timing with Better Metrics

```bash
# Create a test script
cat > test-performance.sh << 'EOF'
#!/bin/bash
URL=$1
ENDPOINT=$2
ITERATIONS=${3:-3}

echo "Testing: $URL$ENDPOINT"
echo "Iterations: $ITERATIONS"
echo ""

# Cold cache
echo "🥶 Cold cache:"
START=$(date +%s%3N)
curl -s -o /dev/null -w "%{time_total}\n" "$URL$ENDPOINT"
END=$(date +%s%3N)
COLD_TIME=$((END - START))
echo "Time: ${COLD_TIME}ms"

sleep 1

# Warm cache (multiple iterations)
echo ""
echo "🔥 Warm cache ($ITERATIONS iterations):"
TOTAL=0
for i in $(seq 1 $ITERATIONS); do
  START=$(date +%s%3N)
  TIME=$(curl -s -o /dev/null -w "%{time_total}\n" "$URL$ENDPOINT" | awk '{print $1 * 1000}')
  echo "  Iteration $i: ${TIME}ms"
  TOTAL=$(echo "$TOTAL + $TIME" | bc)
  sleep 0.5
done

AVG=$(echo "scale=2; $TOTAL / $ITERATIONS" | bc)
IMPROVEMENT=$(echo "scale=2; (($COLD_TIME - $AVG) / $COLD_TIME) * 100" | bc)

echo ""
echo "📊 Results:"
echo "  Cold: ${COLD_TIME}ms"
echo "  Warm (avg): ${AVG}ms"
echo "  Improvement: ${IMPROVEMENT}%"
EOF

chmod +x test-performance.sh

# Run tests
./test-performance.sh $STAGING_URL "/api/farms?page=1&limit=20" 5
```

**✅ Success Criteria**:
- Average improvement > 70%
- Warm cache < 50ms
- Consistent improvement across iterations

---

## 🗄️ STEP 4: Database Query Verification (5 minutes)

### Check pg_stat_statements

```bash
# Connect to staging database
psql $STAGING_DATABASE_URL

# Reset statistics for fresh measurement
SELECT pg_stat_statements_reset();

# Wait 5 minutes for some traffic, then check:

# View top queries
SELECT 
  calls,
  mean_exec_time::numeric(10,2) as avg_ms,
  total_exec_time::numeric(10,2) as total_ms,
  LEFT(query, 60) as query_preview
FROM pg_stat_statements 
WHERE query LIKE '%Farm%'
ORDER BY calls DESC 
LIMIT 10;

# Expected: Low call counts for Farm queries (cache is working)

# Check overall query reduction
SELECT 
  COUNT(*) as unique_queries,
  SUM(calls) as total_executions,
  SUM(total_exec_time)::numeric(10,2) as total_time_ms
FROM pg_stat_statements;
```

### Verify Indexes

```bash
# List all indexes on Farm table
psql $STAGING_DATABASE_URL -c "
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'Farm'
ORDER BY indexname;
"

# Expected: 16+ indexes from Phase 2
```

**✅ Success Criteria**:
- Farm queries have low call counts
- Most traffic handled by cache
- All Phase 2 indexes present

---

## 💾 STEP 5: Cache Verification (10 minutes)

### Check Redis/Upstash

```bash
# If using Upstash, check via API
curl -X POST "$UPSTASH_REDIS_REST_URL/ping" \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"

# Expected: {"result":"PONG"}

# List cache keys (farm-related)
curl -X POST "$UPSTASH_REDIS_REST_URL/keys/farm:*" \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"

# Expected to see keys like:
# - farm:farm_xxxxx
# - farm:slug:some-slug
# - farms:list:1:all
```

### Test Cache Invalidation

```bash
# 1. Get farm detail (caches it)
echo "1️⃣ First request (cold cache):"
time curl -s "$STAGING_URL/api/farms/$FARM_ID" > /dev/null

sleep 1

# 2. Second request (warm cache - should be fast)
echo "2️⃣ Second request (warm cache):"
time curl -s "$STAGING_URL/api/farms/$FARM_ID" > /dev/null

# 3. Update the farm (requires auth - do via UI or with token)
# This should invalidate the cache

# 4. Third request (should be slower - cache miss)
echo "3️⃣ Third request (after invalidation):"
time curl -s "$STAGING_URL/api/farms/$FARM_ID" > /dev/null

# Expected: Similar to first request (cache was cleared)
```

**✅ Success Criteria**:
- Redis responding
- Cache keys exist
- Cache invalidation works after updates

---

## 🌐 STEP 6: Browser Testing (5 minutes)

### Manual Browser Tests

1. **Open Staging URL in Browser**
   ```
   https://your-staging.vercel.app
   ```

2. **Open DevTools** (F12)
   - Go to Network tab
   - Check "Disable cache" is OFF

3. **Test Farm List Page**
   - Navigate to `/farms`
   - Note load time in Network tab
   - Refresh page (Cmd+R / Ctrl+R)
   - Compare times - should be faster

4. **Test Farm Detail Page**
   - Click on a farm
   - Note load time
   - Go back and click same farm again
   - Should load faster

5. **Check Console**
   - Open Console tab
   - Look for errors (should be none)
   - Check for warnings

### Performance Measurement

```javascript
// Run in browser console on any page
// Measure page load time
performance.getEntriesByType('navigation')[0].loadEventEnd

// Measure API calls
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/farms'))
  .map(r => ({ 
    url: r.name, 
    duration: r.duration.toFixed(0) + 'ms' 
  }))
```

**✅ Success Criteria**:
- Pages load without errors
- Subsequent loads are faster
- No console errors
- API calls show in Network tab

---

## 📝 STEP 7: Document Results (5 minutes)

### Fill in Results Template

```markdown
## Staging Verification Results

**Date**: 2025-01-XX
**Verified By**: [Your Name]
**Duration**: XX minutes

### ✅ Deployment
- [x] Health check passing
- [x] Latest commits deployed
- [x] No deployment errors

### ⚡ Performance Results

| Test | Cold Cache | Warm Cache | Improvement |
|------|-----------|-----------|-------------|
| Farm List | XXXms | XXms | XX% |
| Farm Detail | XXXms | XXms | XX% |
| Search | XXXms | XXms | XX% |

**Average Improvement**: XX%

### 💾 Cache Status
- Redis Connection: [PASS/FAIL]
- Cache Keys Found: [YES/NO]
- Cache Hit Observed: [YES/NO]
- Cache Invalidation: [WORKING/NOT TESTED]

### 🗄️ Database
- pg_stat_statements: [ENABLED/DISABLED]
- Query Reduction: [CONFIRMED/NOT CONFIRMED]
- Indexes Present: [YES/NO]

### 🐛 Issues Found
- [ ] None
- [ ] [List any issues]

### ✅ Overall Status
- [ ] APPROVED - Ready for production
- [ ] APPROVED WITH WARNINGS - Minor issues
- [ ] REJECTED - Critical issues found

### 📋 Notes
[Any additional observations]
```

---

## 🚨 Troubleshooting

### Issue: Health Check Fails

```bash
# Check Vercel logs
vercel logs | tail -50

# Check database connection
psql $STAGING_DATABASE_URL -c "SELECT 1;"

# Check environment variables
vercel env ls
```

### Issue: Cache Not Working

```bash
# Check Redis connection
curl -X POST "$UPSTASH_REDIS_REST_URL/ping" \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"

# Check Vercel environment variables
vercel env ls | grep REDIS

# Check logs for cache errors
vercel logs | grep -i cache
```

### Issue: Slow Response Times

```bash
# Check database performance
psql $STAGING_DATABASE_URL -c "
SELECT 
  query,
  calls,
  mean_exec_time
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 5;
"

# Check for slow queries
vercel logs | grep -i "slow query"
```

---

## ✅ Final Checklist

Before marking verification complete:

- [ ] Deployment status confirmed
- [ ] Health check passing
- [ ] Performance tests show 70%+ improvement
- [ ] Cache working (warm requests faster)
- [ ] Database query reduction confirmed
- [ ] No critical errors in logs
- [ ] Browser tests successful
- [ ] Results documented
- [ ] Team notified
- [ ] Ready for production? [YES/NO]

---

## 🎉 Success Criteria Summary

**Minimum Requirements (MUST HAVE)**:
- ✅ Health check returns 200
- ✅ Zero critical errors
- ✅ API endpoints responding
- ✅ Pages load successfully
- ✅ No data corruption

**Performance Targets (SHOULD HAVE)**:
- ✅ Warm cache 70%+ faster than cold
- ✅ Cache hit rate visible
- ✅ Database queries reduced
- ✅ Error rate < 1%

**Stretch Goals (NICE TO HAVE)**:
- ✅ 90%+ improvement on cached requests
- ✅ Sub-50ms warm cache responses
- ✅ 90%+ database query reduction

---

## 📞 Next Steps

### If Verification PASSES ✅

1. Update `PHASE_3_STAGING_VERIFICATION.md` with results
2. Create `PHASE_3_STAGING_VERIFIED.md` document
3. Notify team of success
4. Schedule production deployment (Task 6)
5. Celebrate! 🎉

### If Verification FAILS ❌

1. Document all issues found
2. Create bug tickets with details
3. Fix critical issues
4. Re-deploy to staging
5. Re-run verification
6. Repeat until passing

### If Verification has WARNINGS ⚠️

1. Document warnings
2. Assess risk level
3. Make go/no-go decision
4. Plan fixes for next iteration
5. Consider proceeding with monitoring

---

**Verification Status**: [ ] NOT STARTED | [ ] IN PROGRESS | [ ] COMPLETE  
**Result**: [ ] PASS | [ ] FAIL | [ ] WARNINGS  
**Production Ready**: [ ] YES | [ ] NO | [ ] WITH CONDITIONS

🌾 **Agricultural Consciousness: Measure with Precision** ⚡