# 🧪 E2E Test Run Analysis & Root Cause
**Date**: 2025-01-XX  
**Status**: ❌ BLOCKED - Database Connection Issue  
**Test Framework**: Playwright + Next.js 16 (Turbopack)

---

## 📊 Current Status Summary

### ✅ What's Working
1. **Test Infrastructure**
   - Playwright configured correctly with `webServer` auto-start
   - Test database running in Docker (PostgreSQL + PostGIS on port 5433)
   - Migrations applied successfully
   - Test users seeded in database:
     - `admin@farmersmarket.app` / `DivineAdmin123!` (ADMIN)
     - `farmer@farmersmarket.app` / `DivineFarmer123!` (FARMER)  
     - `customer@farmersmarket.app` / `DivineCustomer123!` (CONSUMER)
   - Global Playwright setup runs successfully

2. **Application Configuration**
   - `.env` file has correct DATABASE_URL: `postgresql://postgres:test_password_123@127.0.0.1:5433/farmersmarket_test`
   - `.env.local` updated to use test database on port 5433
   - Dev server starts successfully when run manually
   - Next.js compiles and serves pages

### ❌ What's Broken
**PRIMARY BLOCKER**: Database connection refused during Playwright test execution

---

## 🔍 Root Cause Analysis

### Issue #1: DATABASE_URL Not Available to Playwright WebServer Process
**Symptom:**
```
[WebServer] ⚠️  DATABASE_URL not set, using fallback configuration
[WebServer] prisma:error ECONNREFUSED
```

**Root Cause:**
When Playwright starts the dev server via `webServer.command: "npm run dev"`, the subprocess does NOT inherit the environment variables from `.env.local` reliably. The database connection module falls back to:
```typescript
connectionString || "postgresql://localhost:5432/farmersmarket"
```
This fallback URL points to **port 5432** (production DB), but the test DB is on **port 5433**.

**Evidence:**
- Logs show: `DATABASE_URL not set, using fallback configuration`
- Then: `ECONNREFUSED` when Prisma tries to connect
- The fallback tries to connect to `localhost:5432` which has no running database

### Issue #2: Turbopack Cache Not Cleared Between Runs
Next.js Turbopack caches environment variables in `.next/` directory. Even after updating `.env.local`, the cached build may use stale values.

---

## 🛠️ Solution: Multiple Approaches

### **Option A: Set DATABASE_URL in Playwright Config (RECOMMENDED)**
Explicitly pass the DATABASE_URL to the webServer process in `playwright.config.ts`:

```typescript
// playwright.config.ts
export default defineConfig({
  // ... existing config

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: "postgresql://postgres:test_password_123@127.0.0.1:5433/farmersmarket_test",
      NODE_ENV: "test",
      NEXTAUTH_URL: "http://localhost:3001",
    },
  },
});
```

**Pros:**
- ✅ Explicit and guaranteed to work
- ✅ CI/CD friendly (no reliance on .env files)
- ✅ Clear separation between dev and test environments

**Cons:**
- ⚠️ DATABASE_URL hardcoded in config (but only for tests)

---

### **Option B: Create `.env.test` File**
Next.js supports `.env.test` which is loaded when `NODE_ENV=test`. Update Playwright to use it:

```bash
# .env.test
DATABASE_URL=postgresql://postgres:test_password_123@127.0.0.1:5433/farmersmarket_test
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=nOgEpp7IZzT6Nzf3moPRGI7HX2S9m5HOVl4eIR5+MQw=
```

```typescript
// playwright.config.ts
webServer: {
  command: "NODE_ENV=test npm run dev",
  // ... rest of config
}
```

**Pros:**
- ✅ Standard Next.js pattern
- ✅ Cleaner separation
- ✅ No hardcoded values in config

**Cons:**
- ⚠️ Requires NODE_ENV=test prefix in command
- ⚠️ Windows compatibility (need cross-env)

---

### **Option C: Fix Database Module Fallback**
Remove the fallback URL in `src/lib/database/index.ts` and force failure when DATABASE_URL is missing:

```typescript
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
    "Please set it in your .env file or environment."
  );
}

const pool = new Pool({ connectionString });
```

**Pros:**
- ✅ Fails fast with clear error message
- ✅ Prevents silent fallback to wrong database

**Cons:**
- ❌ Doesn't solve the root issue (env var not passed to webServer)
- ⚠️ Would still need Option A or B

---

## 📋 Recommended Fix Steps (Option A)

### Step 1: Update Playwright Config
```bash
# Edit playwright.config.ts
```

Add `env` property to `webServer`:
```typescript
webServer: {
  command: "npm run dev",
  url: BASE_URL,
  timeout: 120_000,
  reuseExistingServer: !process.env.CI,
  env: {
    DATABASE_URL: "postgresql://postgres:test_password_123@127.0.0.1:5433/farmersmarket_test",
    NEXTAUTH_URL: "http://localhost:3001",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "nOgEpp7IZzT6Nzf3moPRGI7HX2S9m5HOVl4eIR5+MQw=",
    NODE_ENV: "test",
  },
},
```

### Step 2: Clear Turbopack Cache
```bash
rm -rf .next
```

### Step 3: Verify Database is Running
```bash
docker-compose -f docker-compose.test.yml ps
# Should show postgres container running on port 5433
```

### Step 4: Run Tests
```bash
npx playwright test --reporter=list
```

### Step 5: Expected Outcome
- ✅ `DATABASE_URL` properly set in webServer process
- ✅ No `ECONNREFUSED` errors
- ✅ Database queries succeed
- ✅ Tests can authenticate and run

---

## 🐛 Secondary Issues Found (Non-Blocking)

### 1. Test/App Mismatches
- **Route**: Tests use `/register`, app uses `/signup`
- **Form fields**: Tests expect `firstName`/`lastName`, app uses single `name`
- **Credentials**: Tests hardcode `test.customer@example.com`, seeded users use `customer@farmersmarket.app`

**Status**: Automated fix scripts created in `scripts/fix-e2e-tests-simple.ts`

### 2. Source Map Warnings
```
Invalid source map. Only conformant source maps can be used to find the original code.
```
**Impact**: Non-blocking, just noisy logs  
**Fix**: Can be suppressed or ignored (Next.js/Turbopack dev issue)

### 3. API Featured Farms Endpoint Missing
Homepage tries to fetch `/api/farms/featured` which doesn't exist.

**Status**: Needs investigation - app may need this endpoint created

---

## 📈 Test Execution Progress

### Before Fix
- **Status**: 0 tests run (blocked at auth)
- **Blocker**: Database connection refused
- **Error**: `ECONNREFUSED` on all Prisma queries

### After Fix (Expected)
- **Phase 1**: Auth tests should pass/run
- **Phase 2**: Selector mismatches will surface (expected, fixable)
- **Phase 3**: Credential mismatches (fixable with automated script)

---

## 🎯 Next Actions (Priority Order)

### P0 - Immediate (Unblock Tests)
1. ✅ **Apply Option A fix** - Add `env` to `webServer` in playwright.config.ts
2. ✅ **Clear cache** - `rm -rf .next`
3. ✅ **Run tests** - `npx playwright test --reporter=list`

### P1 - After Tests Run
4. 🔄 **Fix test selectors** - Apply automated fixes from `scripts/fix-e2e-tests-simple.ts`
5. 🔄 **Fix credentials** - Ensure tests use seeded users (admin@farmersmarket.app, etc.)
6. 🔄 **Fix redirects** - Update tests to expect `/login?registered=true` after signup

### P2 - Polish
7. 📝 **Fix API endpoints** - Add missing `/api/farms/featured` if needed
8. 📝 **Add data-testid** attributes to components for stable selectors
9. 📝 **Document test patterns** - Update E2E testing guide

### P3 - CI/CD
10. 🚀 **Add GitHub Actions workflow** - Run tests in CI
11. 🚀 **Add pre-commit hook** - Run focused tests before commit

---

## 💡 Key Learnings

1. **Playwright webServer does NOT inherit .env.local automatically**
   - Must explicitly pass env vars via `webServer.env`
   - Or use NODE_ENV=test with .env.test file

2. **Turbopack caches aggressively**
   - Always `rm -rf .next` when changing env vars
   - Or use `--no-turbopack` flag for testing

3. **Database module fallback was masking the real issue**
   - Silent fallbacks to wrong DB cause confusing errors
   - Better to fail fast with clear error message

4. **Test database must be running before Playwright starts**
   - Run `docker-compose -f docker-compose.test.yml up -d` first
   - Or add to `globalSetup` script

---

## 📚 Related Documentation

- `docs/E2E_TESTING_ACTION_PLAN.md` - Original action plan
- `docs/E2E_FIX_EXECUTION_GUIDE.md` - Execution guide
- `QUICK_E2E_FIX.md` - Quick reference
- `E2E_FIX_EXECUTION_REPORT.md` - Previous execution report
- `scripts/fix-e2e-tests-simple.ts` - Automated test fixes
- `scripts/seed-test-users-quick.ts` - Database seeding

---

## ✨ Success Criteria

Tests are considered "unblocked" when:
- [ ] Playwright starts dev server successfully
- [ ] Database connections succeed (no ECONNREFUSED)
- [ ] At least 1 test runs to completion (pass or fail on test logic, not infra)
- [ ] Login flow can be tested end-to-end
- [ ] Signup flow can be tested end-to-end

**Current Score**: 0/5 ❌  
**Target Score**: 5/5 ✅  
**Blocker**: DATABASE_URL not passed to webServer process

---

**Last Updated**: Dev server restart completed, tests attempted but blocked on DB connection  
**Next Step**: Apply Option A fix to playwright.config.ts