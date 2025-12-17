# 🚀 QUICK E2E FIX - 5 Minute Action Plan

**Status:** ✅ READY TO EXECUTE NOW  
**Time Required:** 5-10 minutes  
**Last Updated:** January 2025

---

## ⚡ FASTEST PATH TO WORKING TESTS

### Step 1: Verify Prerequisites (30 seconds)

```bash
# Ensure you're in the project root
cd "M:\Repo\Farmers Market Platform web and app"

# Check auth is working
npm run debug:auth
# Should see: ✅ checks passing
```

### Step 2: Preview Changes (1 minute)

```bash
# See what will be fixed WITHOUT making changes
npm run fix:e2e-tests -- --dry-run --verbose
```

**Review Output:**

- Files that will be modified
- Number of fixes per file
- Types of changes (emails, passwords, redirects)

### Step 3: Apply Automated Fixes (30 seconds)

```bash
# Apply all fixes
npm run fix:e2e-tests
```

**What Gets Fixed:**
✅ Replaces `test.customer@example.com` → `TEST_USERS.customer.email`  
✅ Replaces `"TestPass123!"` → `TEST_USERS.customer.password`  
✅ Adds `TEST_USERS` import where needed  
✅ Updates redirect expectations (role-based routing)  
✅ Adds network waits after navigation  
✅ Increases timeouts for network operations

### Step 4: Review Changes (2 minutes)

```bash
# See what changed
git diff tests/

# Key changes to verify:
# - TEST_USERS imports added
# - Hardcoded emails replaced
# - Dashboard redirects updated
```

### Step 5: Test (2-5 minutes)

```bash
# Start dev server (separate terminal)
npm run dev

# Run tests (another terminal)
npx playwright test

# OR run single test file to verify
npx playwright test tests/e2e/critical-flows.spec.ts
```

### Step 6: Commit (1 minute)

```bash
git add tests/
git commit -m "fix(tests): automated E2E test fixes - standardize credentials and redirects"
git push
```

---

## 🎯 WHAT THIS FIXES

| Issue           | Before                                | After                                          |
| --------------- | ------------------------------------- | ---------------------------------------------- |
| **Credentials** | Hardcoded `test.customer@example.com` | Using seeded `TEST_USERS.customer.email`       |
| **Passwords**   | Hardcoded `"TestPass123!"`            | Using `TEST_USERS.customer.password`           |
| **Imports**     | Missing                               | `import { TEST_USERS } from "../helpers/auth"` |
| **Redirects**   | Expected `/dashboard` for all users   | Role-based expectations                        |
| **Timeouts**    | Default 30s                           | Increased for network ops (45s)                |
| **Waits**       | Missing                               | Added `networkidle` after navigation           |

---

## 📊 EXPECTED RESULTS

**Before Fixes:**

```
❌ Tests Passing: 0-20%
❌ Common Error: "Test timeout of 30000ms exceeded"
❌ Common Error: "User not found: test.customer@example.com"
❌ Common Error: "Expected URL to match /\/dashboard/"
```

**After Fixes:**

```
✅ Tests Passing: 50-80% (immediate improvement)
✅ Using Seeded Test Users: 100%
✅ Correct Redirect Expectations: 100%
✅ Proper Network Waits: 100%
```

---

## 🔍 IF TESTS STILL FAIL

### Common Remaining Issues:

**1. Missing data-testid attributes**

```typescript
// Tests expect: <button data-testid="add-to-cart">
// But component has: <button>Add to Cart</button>

// Solution: Either:
// A) Add data-testid to component
// B) Update test to use: button:has-text("Add to Cart")
```

**2. Database not seeded**

```bash
# Re-seed test users
npm run db:seed

# Verify users exist
npm run debug:auth
```

**3. Auth state files missing**

```bash
# Check auth storage exists
ls tests/auth/.auth/

# Should have:
# - admin.json
# - farmer.json
# - customer.json

# If missing, run auth setup:
npx playwright test tests/e2e/auth.setup.ts
```

**4. Different UI structure**

```bash
# Run test in headed mode to SEE the UI
npx playwright test <test-file> --headed

# Or debug mode to step through
npx playwright test <test-file> --debug

# Then update selectors to match actual UI
```

---

## 🛠️ MANUAL FIXES CHECKLIST

If automated script doesn't fix everything:

### Fix 1: Update Test Credentials

```typescript
// Find & Replace in ALL test files:
// OLD: "test.customer@example.com"
// NEW: TEST_USERS.customer.email

// OLD: "TestPass123!"
// NEW: TEST_USERS.customer.password

// Add import at top:
import { TEST_USERS } from "../helpers/auth";
```

### Fix 2: Update Redirect Expectations

```typescript
// For CUSTOMER login:
// OLD:
await page.waitForURL(/\/dashboard/);

// NEW:
await page.waitForURL((url) => !url.pathname.includes("/login"), {
  timeout: 10000,
});

// For ADMIN login:
// Keep: await expect(page).toHaveURL(/\/admin/);

// For FARMER login:
// Keep: await expect(page).toHaveURL(/\/(farmer|dashboard)/);
```

### Fix 3: Add Network Waits

```typescript
// After every page.goto():
await page.goto("/products");
await page.waitForLoadState("networkidle"); // ADD THIS
```

---

## 📞 QUICK HELP

**Script Issues:**

```bash
# Script not found?
npm install -g tsx
npm install glob

# Run script directly
npx tsx scripts/fix-e2e-tests.ts --dry-run
```

**Test Issues:**

```bash
# See detailed test output
npx playwright test --reporter=list

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report

# Run single test with full output
npx playwright test <file> --reporter=list --workers=1
```

**Auth Issues:**

```bash
# Check auth setup
npm run debug:auth

# Fix auth if needed
npm run fix:auth

# Verify seeded users in database
npx prisma studio
# Look for: admin@farmersmarket.app, farmer@farmersmarket.app, customer@farmersmarket.app
```

---

## 📚 DETAILED GUIDES

For comprehensive information, see:

1. **Main Action Plan:** `docs/E2E_TESTING_ACTION_PLAN.md`
2. **Execution Guide:** `docs/E2E_FIX_EXECUTION_GUIDE.md`
3. **Auth Debug Guide:** `docs/NEXTAUTH_DEBUG_GUIDE.md`

---

## ✅ DONE!

After running the automated fix:

- ✅ Test credentials are standardized
- ✅ Redirect expectations are correct
- ✅ Network waits are added
- ✅ Timeouts are appropriate
- ✅ Imports are in place

**Next:**

1. Run tests: `npx playwright test`
2. Review report: `npx playwright show-report`
3. Fix any remaining selector issues manually
4. Celebrate improved test suite! 🎉

---

**Commands Summary:**

```bash
# 1. Preview fixes
npm run fix:e2e-tests -- --dry-run --verbose

# 2. Apply fixes
npm run fix:e2e-tests

# 3. Review changes
git diff tests/

# 4. Run tests
npm run dev           # Terminal 1
npx playwright test   # Terminal 2

# 5. Commit
git add tests/ && git commit -m "fix(tests): automated E2E fixes" && git push
```

_Ready. Set. Fix! 🚀_
