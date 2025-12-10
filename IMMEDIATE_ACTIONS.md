# ⚡ IMMEDIATE ACTIONS - Quick Command Reference

**Farmers Market Platform - Get Running NOW**

Last Updated: January 2025

---

## 🚀 30-SECOND QUICK START

```bash
# 1. Install security dependencies
npm install @upstash/ratelimit @upstash/redis

# 2. Start development server
npm run dev:omen

# 3. Run tests
npm test
```

---

## 📋 TODAY'S CRITICAL TASKS

### ✅ Task 1: Install Security Dependencies (2 minutes)

```bash
cd "Farmers Market Platform web and app"
npm install @upstash/ratelimit @upstash/redis
```

**Verify Installation:**

```bash
npm list @upstash/ratelimit @upstash/redis
```

**Expected Output:**

```
├── @upstash/ratelimit@x.x.x
└── @upstash/redis@x.x.x
```

---

### ✅ Task 2: Configure Environment Variables (5 minutes)

**Create/Update `.env.local`:**

```bash
# Copy template
cp .env.example .env.local

# Add these lines (get values from Upstash dashboard)
cat >> .env.local << 'EOF'

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Security
CSP_REPORT_URI=/api/csp-report
NEXT_PUBLIC_TELEMETRY_ENABLED=true

# Monitoring (Azure Application Insights)
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx
EOF
```

**Get Upstash Redis Credentials:**

1. Go to https://console.upstash.com/
2. Create new database (Free tier available)
3. Copy REST URL and TOKEN
4. Paste into `.env.local`

---

### ✅ Task 3: Start Development Server (1 minute)

```bash
# Optimized for HP OMEN (12 threads, 64GB RAM)
npm run dev:omen

# OR standard mode
npm run dev
```

**Verify Server Running:**

```bash
# Open browser to:
http://localhost:3000

# Or check with curl:
curl http://localhost:3000/api/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX..."
}
```

---

### ✅ Task 4: Run Full Test Suite (5 minutes)

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- geocoding.service.test

# Run tests in watch mode
npm test -- --watch
```

**Target Results:**

```
Test Suites: 61 passed (aim for 61/61)
Tests: 2,173 passed
Coverage: 4.4% → Target 80%+
```

---

## 🔧 FIX FAILING TESTS (30 minutes)

### Fix 1: Product Service Tests

```bash
# Navigate to test file
code "src/lib/services/__tests__/product.service.test.ts"

# Key fix: Update mocks to use repository pattern
# Replace: jest.mock("@/lib/database")
# With: jest.mock("@/lib/repositories/product.repository")
```

**Quick Fix Script:**

```typescript
// At top of test file (before any imports)
const mockProductRepository = {
  manifestProduct: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

jest.mock("@/lib/repositories/product.repository", () => ({
  productRepository: mockProductRepository,
}));
```

### Fix 2: Authorization Mocks

```bash
# Find and replace in test files
# OLD: jest.mocked(database.farm.findUnique).mockResolvedValue(mockFarm as any)
# NEW: jest.mocked(database.farm.findUnique).mockResolvedValue({ ownerId: mockUserId } as any)
```

**One-liner fix:**

```bash
find src -name "*.test.ts" -exec sed -i 's/\.mockResolvedValue(mockFarm as any)/.mockResolvedValue({ ownerId: mockUserId } as any)/g' {} \;
```

---

## 🛡️ ENABLE SECURITY FEATURES (15 minutes)

### Step 1: Update Middleware

**File:** `src/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  applySecurityHeaders,
  getEnvironmentSecurityHeaders,
} from "@/lib/security/security-headers";
import {
  generateCSP,
  generateNonce,
  applyCSPHeaders,
} from "@/lib/security/csp";

export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  let response = NextResponse.next();

  // Apply security
  response = applySecurityHeaders(response, getEnvironmentSecurityHeaders());
  applyCSPHeaders(response.headers, { nonce, mode: "enforce" });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Step 2: Add Rate Limiting to API Routes

**Example:** `src/app/api/products/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import {
  apiRateLimiter,
  applyRateLimit,
  createRateLimitError,
  getRateLimitHeaders,
} from "@/lib/security/rate-limiter";

export async function GET(request: NextRequest) {
  // Check rate limit
  const result = await applyRateLimit(request, apiRateLimiter);

  if (!result.success) {
    return NextResponse.json(createRateLimitError(result), {
      status: 429,
      headers: getRateLimitHeaders(result),
    });
  }

  // Your existing code...
}
```

**Apply to ALL API routes:**

```bash
# List all API routes
find src/app/api -name "route.ts"

# Manually add rate limiting to each
```

---

## 📊 VERIFY IMPLEMENTATION (10 minutes)

### Check 1: Security Headers

```bash
# Test with curl
curl -I http://localhost:3000

# Look for these headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
# Strict-Transport-Security: ...
```

### Check 2: Rate Limiting

```bash
# Test rate limit (should block after 100 requests)
for i in {1..105}; do
  curl http://localhost:3000/api/products
done

# Last 5 requests should return 429
```

### Check 3: CSP

```bash
# Open browser console (F12)
# Navigate to any page
# Look for CSP violations (should be none)
```

### Check 4: Tests

```bash
# Run full test suite
npm test

# Check for:
# - 0 failing tests
# - All geocoding tests pass
# - All product tests pass
```

---

## 🎯 TROUBLESHOOTING

### Issue: Redis Connection Error

```bash
# Check environment variables
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# Verify .env.local exists
cat .env.local | grep UPSTASH

# Test Redis connection
node -e "
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
redis.ping().then(console.log).catch(console.error);
"
```

### Issue: CSP Blocking Resources

```bash
# Check browser console for violations
# Add allowed domains to src/lib/security/csp.ts

# Temporarily disable CSP for testing
# In middleware.ts, change mode:
applyCSPHeaders(response.headers, { mode: 'report-only' });
```

### Issue: Rate Limit Too Strict

```bash
# Increase limits in src/lib/security/rate-limiter.ts
# Example: Change 100 to 200
export const apiRateLimiter = new Ratelimit({
  limiter: Ratelimit.slidingWindow(200, "1 m"), // Was 100
});

# Restart server
npm run dev:omen
```

### Issue: Test Failures

```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific failing test
npm test -- --testNamePattern="test name here"

# Check logs
npm test -- --verbose

# Review fix guide
cat QUICK_FIXES_REFERENCE.md
```

---

## 📈 MONITOR & VALIDATE

### Real-Time Monitoring

```bash
# Terminal 1: Server logs
npm run dev:omen

# Terminal 2: Test watch mode
npm test -- --watch

# Terminal 3: Rate limit logs
tail -f logs/rate-limit.log  # If logging configured
```

### Performance Check

```bash
# Install autocannon for load testing
npm install -g autocannon

# Test API performance
autocannon -c 100 -d 10 http://localhost:3000/api/products

# Expected results:
# - Requests/sec: 1000+
# - Latency p99: <100ms
# - Rate limit kicks in at 100 req/min
```

---

## 🎓 LEARN MORE

### Documentation Files

```bash
# Comprehensive guide (1,173 lines)
cat RECOMMENDATIONS_IMPLEMENTATION_PROGRESS.md

# Implementation summary (696 lines)
cat IMPLEMENTATION_SUMMARY.md

# Quick fixes reference
cat QUICK_FIXES_REFERENCE.md

# Original analysis
cat ANALYSIS_AND_RECOMMENDATIONS.md
```

### Security Implementation

```bash
# Rate limiter (438 lines)
code src/lib/security/rate-limiter.ts

# CSP configuration (365 lines)
code src/lib/security/csp.ts

# Security headers (459 lines)
code src/lib/security/security-headers.ts
```

---

## ✅ SUCCESS CHECKLIST

**Complete these in order:**

- [ ] Install dependencies (`@upstash/ratelimit`, `@upstash/redis`)
- [ ] Configure `.env.local` with Upstash credentials
- [ ] Start development server (`npm run dev:omen`)
- [ ] Run test suite (`npm test`) - aim for 0 failures
- [ ] Update middleware with security headers
- [ ] Add rate limiting to API routes
- [ ] Verify security headers with curl
- [ ] Test rate limiting behavior
- [ ] Check CSP in browser console
- [ ] Monitor for errors/violations

---

## 🚀 NEXT STEPS (After Immediate Actions)

### This Week:

1. Complete test coverage to 80%+
2. Setup Azure Application Insights
3. Add missing service tests (order, payment)
4. Configure coverage gates in CI

### Next Sprint:

5. Implement multi-tier caching
6. Add ML product recommendations
7. Setup real-time inventory sync
8. Build GraphQL API layer

---

## 💬 GET HELP

### Quick Commands

```bash
# Show all npm scripts
npm run

# Check Node/npm versions
node --version && npm --version

# Clear all caches
npm cache clean --force
rm -rf node_modules
rm -rf .next
npm install

# Full reset
git clean -fdx  # WARNING: Deletes all untracked files!
npm install
```

### Resources

- Divine Instructions: `.github/instructions/`
- Test Mocks: `src/__tests__/mocks/`
- Security: `src/lib/security/`
- Quick Fixes: `QUICK_FIXES_REFERENCE.md`

---

**⚡ YOU'RE READY! Start with Task 1 above and work through sequentially.**

_"Code with divine precision, test with agricultural consciousness."_ 🌾⚡
