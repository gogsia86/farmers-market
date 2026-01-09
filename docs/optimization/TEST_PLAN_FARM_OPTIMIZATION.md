# 🧪 Test Plan - Farm Detail Page Optimization

**Date:** January 2025
**Status:** Ready for Execution
**Priority:** High
**Estimated Time:** 2-3 hours

---

## 📋 Test Overview

This test plan validates the farm detail page optimizations including:
- Database query performance improvements
- Multi-layer caching implementation
- React Suspense streaming
- ISR (Incremental Static Regeneration)
- Overall page load performance

---

## 🎯 Test Objectives

1. **Performance Validation** - Verify 70%+ improvement in load times
2. **Functional Testing** - Ensure all features work correctly
3. **Cache Verification** - Confirm caching strategy is effective
4. **Regression Testing** - No existing functionality broken
5. **Load Testing** - System handles increased traffic

---

## 🔧 Prerequisites

### Environment Setup
```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL database
# Verify: psql -U postgres -c "SELECT version();"

# 3. Start Redis server
redis-server
# Verify: redis-cli ping (should return PONG)

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed test data (if needed)
npm run db:seed

# 6. Start development server
npm run dev
# Server should be running on http://localhost:3001
```

### Test Data Requirements
- At least 3 farms with different statuses (ACTIVE, PENDING, etc.)
- Each farm should have:
  - 5-10 products
  - 2-3 certifications
  - Multiple photos
  - Complete profile information

---

## 📊 Test Cases

### **Category 1: Performance Testing**

#### Test 1.1: Initial Page Load Performance
**Priority:** Critical
**Description:** Measure first-time page load performance

**Steps:**
1. Clear browser cache and cookies
2. Clear Redis cache: `redis-cli flushdb`
3. Navigate to `/farms/[slug]` for a known farm
4. Record time to First Contentful Paint (FCP)
5. Record time to Largest Contentful Paint (LCP)
6. Record Total Page Load Time

**Expected Results:**
- FCP < 0.9 seconds
- LCP < 1.5 seconds
- Total Load < 1.0 seconds (after first request)

**Acceptance Criteria:**
- ✅ Page loads without errors
- ✅ All content visible within 1.5 seconds
- ✅ No console errors in DevTools

---

#### Test 1.2: Cached Page Load Performance
**Priority:** Critical
**Description:** Verify caching improves subsequent requests

**Steps:**
1. Load farm detail page once (prime cache)
2. Wait 2 seconds
3. Reload the same page
4. Record load time
5. Check Redis for cache hit: `redis-cli keys "farm:detail:*"`

**Expected Results:**
- Cached load time < 200ms
- Cache hit rate visible in logs
- Response served from cache

**Acceptance Criteria:**
- ✅ Second load significantly faster than first
- ✅ Cache key exists in Redis
- ✅ Service logs show "Cache hit"

---

#### Test 1.3: Database Query Performance
**Priority:** High
**Description:** Verify database queries are optimized

**Steps:**
1. Enable Prisma query logging
2. Load farm detail page
3. Review Prisma logs for queries
4. Count number of queries executed
5. Measure total query time

**Expected Results:**
- Maximum 3 database queries per page load
- Total query time < 300ms
- No N+1 query patterns

**Acceptance Criteria:**
- ✅ Query count ≤ 3
- ✅ All queries use indexed fields
- ✅ No sequential relationship queries

---

#### Test 1.4: Payload Size Optimization
**Priority:** High
**Description:** Verify response payload is minimized

**Steps:**
1. Open DevTools → Network tab
2. Load farm detail page
3. Check initial document size
4. Check total transferred size
5. Check total resources size

**Expected Results:**
- Initial HTML < 50KB (gzipped)
- Total payload < 200KB
- Images use Next.js optimization

**Acceptance Criteria:**
- ✅ Payload size within limits
- ✅ Images served as WebP/AVIF
- ✅ No unnecessary data in response

---

### **Category 2: Functional Testing**

#### Test 2.1: Farm Information Display
**Priority:** Critical
**Description:** Verify all farm data displays correctly

**Test Data:** Use farm with complete profile

**Steps:**
1. Navigate to `/farms/[slug]`
2. Verify farm name in h1
3. Verify farm description present
4. Verify farm story (if exists)
5. Verify location information
6. Verify contact information
7. Verify statistics (product count, review count)

**Expected Results:**
- All farm fields display correctly
- No "undefined" or "null" text
- Formatting is correct

**Acceptance Criteria:**
- ✅ Farm name displays prominently
- ✅ All text fields readable
- ✅ Stats show correct counts
- ✅ Verified badge shows for verified farms

---

#### Test 2.2: Product Listing
**Priority:** Critical
**Description:** Verify products display with correct data

**Steps:**
1. Navigate to farm with 10+ products
2. Verify "Products" section exists
3. Count visible products (should be max 12)
4. Check product cards have:
   - Product name
   - Price
   - Unit
   - Image or placeholder
   - Featured badge (if featured)
5. Click a product card
6. Verify navigation to product detail page

**Expected Results:**
- Maximum 12 products displayed
- All product data visible
- Links work correctly

**Acceptance Criteria:**
- ✅ Products grid renders
- ✅ Product data complete
- ✅ Images load or fallback shows
- ✅ Navigation works

---

#### Test 2.3: Certifications Display
**Priority:** High
**Description:** Verify certifications render correctly

**Steps:**
1. Navigate to farm with certifications
2. Verify "Certifications" section exists
3. Check certification cards show:
   - Certification type
   - Certifying body
   - Issue date
   - Expiry date (if exists)
   - Certificate number
4. For farm without certifications, verify section is hidden

**Expected Results:**
- Certifications display if farm has them
- Section hidden if no certifications
- All certification data visible

**Acceptance Criteria:**
- ✅ Certifications render with complete data
- ✅ Dates formatted correctly
- ✅ Section appropriately hidden/shown

---

#### Test 2.4: Photo Gallery
**Priority:** High
**Description:** Verify photo gallery works correctly

**Steps:**
1. Navigate to farm with photos
2. Verify banner/hero image displays
3. Verify photo count (should show up to 20)
4. Check image fallbacks work:
   - Farm with no photos shows placeholder
   - Farm with logoUrl shows logo
   - Farm with bannerUrl shows banner
5. Verify images are optimized (WebP/AVIF)

**Expected Results:**
- Photos display correctly
- Fallbacks work
- Images optimized

**Acceptance Criteria:**
- ✅ Gallery renders
- ✅ Images load properly
- ✅ Fallbacks work
- ✅ Next.js Image optimization active

---

#### Test 2.5: Loading States (Suspense)
**Priority:** Medium
**Description:** Verify loading skeletons display during data fetch

**Steps:**
1. Throttle network to "Slow 3G" in DevTools
2. Navigate to farm detail page
3. Observe loading sequence:
   - Farm header should load first
   - Product skeleton should show while products load
   - Certification skeleton should show while certs load
4. Verify skeletons match final layout
5. Verify smooth transition from skeleton to content

**Expected Results:**
- Skeletons display during load
- No layout shift when content appears
- Progressive rendering works

**Acceptance Criteria:**
- ✅ Farm header appears immediately
- ✅ Skeletons show for slow sections
- ✅ CLS (Cumulative Layout Shift) < 0.1
- ✅ No "flash of unstyled content"

---

### **Category 3: Caching & Revalidation Testing**

#### Test 3.1: Cache Hit Rate Validation
**Priority:** Critical
**Description:** Verify cache hit rate meets targets

**Steps:**
1. Clear all caches
2. Load 10 different farm pages
3. Reload each page once
4. Check Redis stats: `redis-cli info stats`
5. Calculate cache hit rate from logs

**Expected Results:**
- First load: Cache miss (expected)
- Second load: Cache hit
- Overall hit rate after warm-up: >85%

**Acceptance Criteria:**
- ✅ Cache hit rate >85% after warm-up
- ✅ Logs show cache hits
- ✅ Response times faster on cache hits

---

#### Test 3.2: ISR Revalidation
**Priority:** High
**Description:** Verify ISR revalidates after TTL

**Steps:**
1. Load farm page (cache primed)
2. Wait 6 minutes (revalidate = 300s = 5 min)
3. Load farm page again
4. Verify background revalidation occurs
5. Check logs for revalidation activity

**Expected Results:**
- Page serves from cache immediately
- Background revalidation triggered
- Fresh data fetched for next request

**Acceptance Criteria:**
- ✅ Immediate response from cache
- ✅ Revalidation happens in background
- ✅ No user-facing delay

---

#### Test 3.3: Cache Invalidation on Update
**Priority:** Critical
**Description:** Verify cache clears when farm updated

**Steps:**
1. Load farm detail page (prime cache)
2. Update farm name via admin/API
3. Verify cache invalidation triggered
4. Load farm page again
5. Verify new data displays

**Expected Results:**
- Update triggers cache clear
- Next page load shows updated data
- No stale data served

**Acceptance Criteria:**
- ✅ Cache invalidation triggered on update
- ✅ Fresh data fetched on next request
- ✅ No stale data visible

---

#### Test 3.4: Memory Cache Layer
**Priority:** Medium
**Description:** Verify L1 (memory) cache works

**Steps:**
1. Restart app (clear memory cache)
2. Load farm page (populate memory cache)
3. Check service logs for "Cache set (memory)"
4. Load same page again immediately
5. Verify memory cache hit in logs

**Expected Results:**
- First load populates memory cache
- Second load (within 5 min) hits memory cache
- Memory cache faster than Redis

**Acceptance Criteria:**
- ✅ Memory cache populates on first load
- ✅ Subsequent loads hit memory cache
- ✅ Memory response time <20ms

---

### **Category 4: Error Handling & Edge Cases**

#### Test 4.1: Farm Not Found
**Priority:** High
**Description:** Verify 404 handling for non-existent farms

**Steps:**
1. Navigate to `/farms/non-existent-slug`
2. Verify 404 page displays
3. Check no errors in console
4. Verify graceful error handling

**Expected Results:**
- 404 page renders
- No console errors
- User-friendly message

**Acceptance Criteria:**
- ✅ 404 page displays
- ✅ No server errors
- ✅ Navigation still works

---

#### Test 4.2: Farm with No Products
**Priority:** Medium
**Description:** Verify handling when farm has no products

**Steps:**
1. Navigate to farm with 0 products
2. Verify "No products available" message shows
3. Verify rest of page renders normally
4. Check no errors in console

**Expected Results:**
- Empty state message displays
- Page renders without errors

**Acceptance Criteria:**
- ✅ Empty state shows
- ✅ No JavaScript errors
- ✅ Page layout intact

---

#### Test 4.3: Farm with No Photos
**Priority:** Medium
**Description:** Verify fallback images work

**Steps:**
1. Navigate to farm with no photos/images
2. Verify placeholder displays
3. Verify no broken image icons
4. Check fallback hierarchy:
   - bannerUrl → logoUrl → images[] → placeholder

**Expected Results:**
- Placeholder displays correctly
- No broken images
- Fallback cascade works

**Acceptance Criteria:**
- ✅ Placeholder shows
- ✅ No broken images
- ✅ Fallback logic correct

---

#### Test 4.4: Database Connection Failure
**Priority:** High
**Description:** Verify graceful degradation on DB failure

**Steps:**
1. Stop PostgreSQL database
2. Attempt to load farm page
3. Verify error page displays
4. Check error is logged
5. Restart database and verify recovery

**Expected Results:**
- User-friendly error page
- Error logged to monitoring
- Recovery after DB restart

**Acceptance Criteria:**
- ✅ Error page shows (not white screen)
- ✅ Error logged
- ✅ App recovers after DB restart

---

#### Test 4.5: Redis Cache Failure
**Priority:** Medium
**Description:** Verify app works without Redis

**Steps:**
1. Stop Redis server
2. Load farm detail page
3. Verify page loads (from database)
4. Check logs for cache fallback
5. Verify performance acceptable (slower but functional)

**Expected Results:**
- Page loads successfully
- Falls back to database queries
- Logs show cache miss/unavailable

**Acceptance Criteria:**
- ✅ Page loads without Redis
- ✅ Data fetched from database
- ✅ No app crash

---

### **Category 5: Load & Stress Testing**

#### Test 5.1: Concurrent User Load
**Priority:** High
**Description:** Verify system handles multiple concurrent users

**Tool:** k6 or Apache Bench

**Steps:**
1. Install k6: `brew install k6` (Mac) or download from k6.io
2. Run load test script:
   ```javascript
   // k6-farm-load.js
   import http from 'k6/http';
   import { check, sleep } from 'k6';

   export const options = {
     stages: [
       { duration: '1m', target: 50 },   // Ramp to 50 users
       { duration: '3m', target: 100 },  // Stay at 100 users
       { duration: '1m', target: 0 },    // Ramp down
     ],
     thresholds: {
       http_req_duration: ['p(95)<1000'], // 95% under 1s
       http_req_failed: ['rate<0.01'],    // <1% errors
     },
   };

   export default function () {
     const res = http.get('http://localhost:3001/farms/green-valley');
     check(res, {
       'status is 200': (r) => r.status === 200,
       'response time OK': (r) => r.timings.duration < 1000,
     });
     sleep(1);
   }
   ```
3. Run: `k6 run k6-farm-load.js`
4. Analyze results

**Expected Results:**
- 95% of requests under 1 second
- Error rate < 1%
- No server crashes

**Acceptance Criteria:**
- ✅ p95 response time <1s
- ✅ Error rate <1%
- ✅ System stable throughout test

---

#### Test 5.2: Cache Saturation
**Priority:** Medium
**Description:** Verify cache doesn't overflow

**Steps:**
1. Load 100 different farm pages rapidly
2. Check memory usage
3. Verify LRU eviction works
4. Check Redis memory usage
5. Verify no memory leaks

**Expected Results:**
- Memory usage stable
- LRU eviction works
- No crashes or slowdowns

**Acceptance Criteria:**
- ✅ Memory usage <80% available
- ✅ Old cache entries evicted
- ✅ No memory leaks

---

### **Category 6: Automated Test Suite**

#### Test 6.1: Run Existing Test Suite
**Priority:** Critical
**Description:** Verify all existing tests still pass

**Steps:**
1. Run unit tests: `npm run test:unit`
2. Run integration tests: `npm run test:integration`
3. Run E2E tests: `npm run test:e2e`
4. Check test coverage: `npm run test:coverage`

**Expected Results:**
- All tests pass
- No new failures introduced
- Coverage maintained or improved

**Acceptance Criteria:**
- ✅ 100% of existing tests pass
- ✅ No regressions
- ✅ Coverage ≥ previous levels

---

#### Test 6.2: New Pages Module Tests
**Priority:** High
**Description:** Run specific tests for new pages including farm detail

**Steps:**
```bash
# Run new pages tests
npm run bot test new-pages -- --baseUrl=http://localhost:3001 --headless

# Run with extended timeout for cold start
npm run bot test new-pages -- --baseUrl=http://localhost:3001 --timeout=60000

# Run verbose for debugging
npm run bot test new-pages -- --baseUrl=http://localhost:3001 --verbose
```

**Expected Results:**
- Farm detail tests pass
- No timeout errors
- Stable test execution

**Acceptance Criteria:**
- ✅ "Farm detail page loads with slug" passes
- ✅ No timeout errors
- ✅ Test execution time <5 minutes

---

## 📈 Performance Benchmarks

### Baseline Targets
| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Page Load (First) | <1.0s | <2.0s |
| Page Load (Cached) | <200ms | <500ms |
| Database Queries | ≤3 | ≤5 |
| Query Time | <300ms | <500ms |
| Payload Size | <200KB | <300KB |
| Cache Hit Rate | >85% | >70% |
| LCP | <1.5s | <2.5s |
| FCP | <0.9s | <1.8s |
| CLS | <0.1 | <0.25 |

---

## 🐛 Bug Tracking Template

### Bug Report Format
```markdown
**Title:** [Brief description]
**Severity:** Critical / High / Medium / Low
**Test Case:** [Test case number]
**Environment:** Development / Staging / Production

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Logs:**
[Attach relevant evidence]

**Additional Context:**
[Any other relevant information]
```

---

## ✅ Test Completion Checklist

### Pre-Testing
- [ ] All prerequisites met
- [ ] Test environment configured
- [ ] Test data seeded
- [ ] Redis running and accessible
- [ ] Database running and accessible

### During Testing
- [ ] All test cases executed
- [ ] Results documented
- [ ] Bugs logged and triaged
- [ ] Performance metrics recorded

### Post-Testing
- [ ] Test report generated
- [ ] Critical bugs fixed
- [ ] Performance targets met
- [ ] Stakeholders notified
- [ ] Documentation updated

---

## 📊 Test Report Template

```markdown
# Farm Detail Optimization - Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Prod]
**Build Version:** [Version]

## Summary
- Total Test Cases: [Number]
- Passed: [Number] ([Percentage]%)
- Failed: [Number] ([Percentage]%)
- Blocked: [Number]
- Not Executed: [Number]

## Performance Results
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Page Load | <1.0s | [Value] | ✅/❌ |
| Cache Hit Rate | >85% | [Value]% | ✅/❌ |
| Query Time | <300ms | [Value]ms | ✅/❌ |

## Critical Issues
1. [Issue description and severity]
2. [Issue description and severity]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Conclusion
[Overall assessment and sign-off recommendation]
```

---

## 🚀 Sign-Off Criteria

### Required for Production Release
- ✅ All Critical test cases passed
- ✅ All High priority test cases passed
- ✅ No Critical or High severity bugs open
- ✅ Performance targets met
- ✅ Load test passed
- ✅ Stakeholder approval obtained

### Nice to Have
- ✅ All Medium priority tests passed
- ✅ All Low priority tests passed
- ✅ Test coverage >80%
- ✅ Documentation complete

---

**Test Plan Status:** ✅ Ready for Execution
**Estimated Duration:** 2-3 hours (manual) + 1 hour (automated)
**Last Updated:** January 2025
