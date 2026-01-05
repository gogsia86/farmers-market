# 🧪 Manual Testing Guide - Farmers Market Platform

**Version:** 1.0.0  
**Date:** December 6, 2025  
**Purpose:** Step-by-step manual testing guide to verify all fixes and system health

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Starting the Dev Server](#starting-the-dev-server)
3. [Basic Health Checks](#basic-health-checks)
4. [API Endpoint Testing](#api-endpoint-testing)
5. [Frontend Page Testing](#frontend-page-testing)
6. [Automated Bot Testing](#automated-bot-testing)
7. [Performance & Memory Monitoring](#performance--memory-monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Checklist Summary](#checklist-summary)

---

## Prerequisites

### ✅ Before You Start

- [ ] Node.js v22+ installed
- [ ] PostgreSQL database running
- [ ] `.env.local` configured with `REDIS_ENABLED=false`
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database migrated (`npx prisma migrate dev`)

### Check Environment

```bash
# Verify Node version
node --version  # Should be v22.21.0 or higher

# Verify PostgreSQL connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Verify Redis is disabled
cat .env.local | grep REDIS_ENABLED
# Should show: REDIS_ENABLED=false
```

---

## Starting the Dev Server

### Method 1: Standard Start (Recommended for Testing)

```bash
# Start in foreground (keeps terminal attached)
npm run dev
```

**Expected Output:**

```
✔ Console Ninja extension is connected to Next.js
   ▲ Next.js 16.0.3 (Turbopack)
   - Local:         http://localhost:3001
   - Network:       http://192.168.x.x:3001

 ✓ Starting...
🌾 Instrumentation hook registered (tracing disabled for now)
 ✓ Ready in 1500ms
✅ Database connection established successfully
```

**✅ SUCCESS INDICATORS:**

- No Redis `ENOTFOUND` errors
- Database connection established
- Server ready in <5 seconds
- Listening on port 3001

**❌ FAILURE INDICATORS:**

- Redis connection errors (means Redis not disabled)
- Database connection failed
- Port 3001 already in use
- Prisma validation errors

### Method 2: Background Start (PowerShell)

```powershell
# Run from PowerShell
.\Start-DevServer.ps1
```

### Method 3: Verify Server is Running

```bash
# Check if port 3001 is listening
netstat -ano | findstr ":3001"

# Should show:
# TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    <PID>
```

---

## Basic Health Checks

### 1. Health Endpoint Test

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Or use browser:
# Open: http://localhost:3001/api/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-12-06T...",
  "version": "1.0.0",
  "uptime": 24.56,
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 56
    },
    "memory": {
      "used": 80,
      "total": 95,
      "percentage": 84
    },
    "environment": "development"
  },
  "responseTime": 56
}
```

**✅ PASS IF:**

- `status` is `"healthy"` or `"degraded"` (not `"unhealthy"`)
- `database.status` is `"up"`
- `memory.percentage` < 95%
- Response time < 500ms

**❌ FAIL IF:**

- 500 error
- Connection refused
- `status` is `"unhealthy"`
- Database connection failed

---

## API Endpoint Testing

### 2. Farms API Endpoint

**Fixed Issue:** Previously returned 500 error due to Prisma validation error (`Unknown argument 'owner'`)

```bash
# Test farms endpoint
curl http://localhost:3001/api/farms
```

**Expected Response Structure:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Green Valley Farm",
      "slug": "green-valley-farm",
      "description": "...",
      "location": { ... },
      "owner": {
        "id": "...",
        "name": "..."
      },
      "products": [ ... ]
    }
  ],
  "meta": {
    "total": 10,
    "page": 1
  }
}
```

**✅ PASS IF:**

- Status 200
- `success: true`
- `data` is an array
- Each farm has `owner` relation loaded
- No Prisma validation errors in console

**❌ FAIL IF:**

- Status 500
- `success: false`
- Error message contains "Unknown argument"
- Missing `owner` field

### 3. Products API Endpoint

**Fixed Issue:** Response shape mismatch causing `products.map is not a function`

```bash
# Test products endpoint
curl http://localhost:3001/api/products
```

**Expected Response Structure:**

```json
{
  "success": true,
  "data": {
    "products": [ ... ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pageSize": 20,
      "totalPages": 3
    }
  }
}
```

**✅ PASS IF:**

- Status 200
- `success: true`
- `data.products` is an array
- `data.pagination` exists

### 4. Auth Session Endpoint

```bash
# Test auth session
curl http://localhost:3001/api/auth/session
```

**Expected:** Either session object or `null` (both are valid)

---

## Frontend Page Testing

### 5. Homepage Load

**URL:** http://localhost:3001/

**✅ PASS IF:**

- Page loads without errors
- No console errors about undefined properties
- Content renders correctly
- No "Cannot read properties of undefined" errors

### 6. Marketplace Products Page

**Fixed Issue:** `products.map is not a function` due to incorrect API response unwrapping

**URL:** http://localhost:3001/marketplace/products

**Test Steps:**

1. Navigate to marketplace products page
2. Open browser DevTools Console (F12)
3. Check for errors
4. Verify products display correctly

**✅ PASS IF:**

- Page loads successfully
- Products are displayed in a grid/list
- No `map is not a function` errors
- Filter/search works (if applicable)

**❌ FAIL IF:**

- White screen
- Console error: "products.map is not a function"
- Page shows error message

### 7. Customer Header Component

**Fixed Issue:** `Cannot read properties of undefined (reading 'image')` when user is null

**Test Steps:**

1. Navigate to any customer page (marketplace, products, etc.)
2. Check header renders correctly
3. Test both logged-in and logged-out states

**✅ PASS IF:**

- Header displays without errors
- User avatar/profile works when logged in
- No errors when logged out (user is null)
- Navigation links work

**❌ FAIL IF:**

- Console error about undefined properties
- Header doesn't render
- Crashes when user is null

---

## Automated Bot Testing

### 8. Website Checker Bot

**Purpose:** Automated checks of all critical endpoints and pages

```bash
# Run single check
npm run bot:check:dev

# Run continuous watch mode
npm run bot:watch:dev
```

**Expected Output:**

```
🤖 Running Website Function Checks
══════════════════════════════════════════════════════════════════════
✅ Homepage Load (152ms) - Homepage loaded successfully
✅ Database Connection (56ms) - Database is healthy
✅ Auth Endpoints (45ms) - Auth system operational
✅ Marketplace API (78ms) - Marketplace responding
✅ Product Pages (234ms) - Product pages loading
✅ Search Functionality (123ms) - Search working
✅ Performance Check (456ms) - Performance within acceptable range
✅ Static Assets (89ms) - All assets loading

══════════════════════════════════════════════════════════════════════
📊 Health Check Summary
══════════════════════════════════════════════════════════════════════
✅ Overall Status: HEALTHY
⏱️  Total Duration: 1233ms
📈 Success Rate: 100.0%
```

**✅ PASS IF:**

- All checks pass (✅)
- Success rate: 100%
- No connection errors
- Overall status: HEALTHY

**❌ FAIL IF:**

- Any checks fail (❌)
- Connection refused errors
- Success rate < 100%
- Overall status: DOWN

### 9. Workflow Monitor

**Purpose:** Tests complete user workflows (registration, login, ordering, etc.)

```bash
# Run all workflow checks
npm run monitor:all

# Run critical workflows only
npm run monitor:critical

# Run health monitoring
npm run monitor:health
```

**Expected Output:**

```
🔍 Monitoring Workflows...
✅ User Registration Flow - 100% Success
✅ User Login Flow - 100% Success
✅ Browse Marketplace - 100% Success
✅ Add to Cart - 100% Success
✅ Checkout Process - 100% Success
✅ Farmer Dashboard - 100% Success

📊 Overall Success Rate: 100%
```

---

## Performance & Memory Monitoring

### 10. Memory Usage Check

**From Health Endpoint:**

```bash
curl -s http://localhost:3001/api/health | grep -o '"percentage":[0-9]*'
```

**Acceptable Ranges:**

- **Healthy:** < 85%
- **Elevated:** 85-94%
- **Critical:** 95%+

**If Memory is High:**

1. Restart dev server
2. Clear Next.js cache: `rm -rf .next`
3. Check for memory leaks in logs

### 11. Response Time Check

**Test API Response Times:**

```bash
# Using curl with timing
curl -w "@-" -o /dev/null -s http://localhost:3001/api/farms <<< "
    time_namelookup:  %{time_namelookup}s
       time_connect:  %{time_connect}s
    time_appconnect:  %{time_appconnect}s
      time_redirect:  %{time_redirect}s
   time_starttransfer:  %{time_starttransfer}s
                      ----------
          time_total:  %{time_total}s
"
```

**Acceptable Times:**

- **API Endpoints:** < 500ms
- **Page Load:** < 2s
- **Database Queries:** < 100ms

---

## Troubleshooting

### Issue 1: Redis Connection Errors

**Symptoms:**

```
Error: getaddrinfo ENOTFOUND redis
```

**Solution:**

```bash
# Edit .env.local
echo "REDIS_ENABLED=false" >> .env.local

# Restart server
```

**See:** `REDIS_SETUP.md` for detailed Redis configuration

### Issue 2: Prisma Validation Errors

**Symptoms:**

```
Error: Unknown argument 'owner'. Did you mean 'where'?
```

**Solution:**

- Already fixed in `src/lib/repositories/base.repository.ts`
- Ensure using latest code
- Check repository uses `include: { owner: true }` not spreading at top level

### Issue 3: React Undefined Property Errors

**Symptoms:**

```
Cannot read properties of undefined (reading 'image')
```

**Solution:**

- Already fixed in `src/components/layout/CustomerHeader.tsx`
- Component now handles null user safely
- Uses optional chaining (`user?.image`)

### Issue 4: Products Map Error

**Symptoms:**

```
products.map is not a function
```

**Solution:**

- Already fixed in `src/app/(customer)/marketplace/products/page.tsx`
- Now correctly unwraps `result.data.products`
- Handles API response shape properly

### Issue 5: Port 3001 Already in Use

**Solution:**

```bash
# Find process on port 3001
netstat -ano | findstr ":3001"

# Kill process (use PID from above)
taskkill //F //PID <PID>

# Restart server
npm run dev
```

---

## Checklist Summary

### 🎯 Pre-Flight Checklist

- [ ] Environment configured (`.env.local`)
- [ ] Redis disabled (`REDIS_ENABLED=false`)
- [ ] Database connection working
- [ ] Prisma client generated
- [ ] Dependencies installed

### 🚀 Server Startup

- [ ] Dev server starts without errors
- [ ] No Redis connection errors in logs
- [ ] Database connection established
- [ ] Server listening on port 3001

### 🔍 API Endpoints

- [ ] `/api/health` returns healthy status
- [ ] `/api/farms` returns farm list (200)
- [ ] `/api/products` returns products (200)
- [ ] `/api/auth/session` responds (200)
- [ ] No 500 errors in any endpoint

### 🌐 Frontend Pages

- [ ] Homepage loads successfully
- [ ] Marketplace products page works
- [ ] Customer header renders (logged in & out)
- [ ] No console errors
- [ ] All navigation works

### 🤖 Automated Tests

- [ ] Website checker bot: 100% pass rate
- [ ] Workflow monitor: All workflows successful
- [ ] No connection errors
- [ ] Overall status: HEALTHY

### ⚡ Performance

- [ ] Memory usage < 85% (healthy)
- [ ] API response times < 500ms
- [ ] Page load times < 2s
- [ ] No performance warnings

### 📝 Logs Review

- [ ] No Redis `ENOTFOUND` errors
- [ ] No Prisma validation errors
- [ ] No React undefined property errors
- [ ] No 500 Internal Server Errors

---

## Quick Test Commands

```bash
# One-liner to test all critical endpoints
curl -s http://localhost:3001/api/health && \
curl -s http://localhost:3001/api/farms && \
curl -s http://localhost:3001/api/products && \
echo "✅ All endpoints responding"

# Run comprehensive verification
bash verify-all-fixes.sh

# Run automated bot tests
npm run bot:check:dev

# Monitor workflows
npm run monitor:all
```

---

## Success Criteria

### ✅ ALL TESTS PASS IF:

1. **Server Health:** Dev server starts and runs without errors
2. **No Redis Errors:** Zero `ENOTFOUND redis` messages in logs
3. **API Success:** All API endpoints return 200 status with correct data
4. **Frontend Works:** All pages load without console errors
5. **Bot Tests Pass:** Website checker shows 100% success rate
6. **Performance Good:** Memory < 85%, response times < 500ms
7. **Code Fixed:** All four major issues from previous session resolved

### 📊 Expected Final Results:

```
✅ Environment: Configured
✅ Redis: Disabled and error-free
✅ Database: Connected
✅ APIs: All endpoints working
✅ Frontend: No undefined property errors
✅ Performance: Within acceptable ranges
✅ Bot Tests: 100% pass rate
✅ Overall Status: HEALTHY
```

---

## Related Documentation

- **Redis Setup:** `REDIS_SETUP.md` - Redis configuration guide
- **Fixes Applied:** `FIXES_APPLIED_2025-12-06.md` - Detailed fix documentation
- **Divine Instructions:** `.github/instructions/` - Development guidelines
- **Verification Script:** `verify-all-fixes.sh` - Automated verification

---

## Notes for Developers

### After Pulling Latest Changes:

1. **Always regenerate Prisma client:**

   ```bash
   npx prisma generate
   ```

2. **Check environment configuration:**

   ```bash
   cat .env.local | grep REDIS_ENABLED
   ```

3. **Run verification before development:**
   ```bash
   bash verify-all-fixes.sh
   ```

### Before Committing:

1. Run all automated tests
2. Check logs for errors
3. Verify no regressions in fixed issues
4. Update documentation if needed

---

**Last Updated:** December 6, 2025  
**Maintained By:** Farmers Market Platform Team  
**Status:** ✅ All fixes verified and documented
