# 🚀 E2E Test Fix - Execution Guide
## Step-by-Step Instructions for Immediate Execution

**Created:** January 2025  
**Status:** ✅ READY TO EXECUTE  
**Estimated Time:** 30-60 minutes  
**Priority:** 🔴 CRITICAL

---

## 📋 Pre-Execution Checklist

Before starting, ensure you have:

- [ ] ✅ Node.js 20.19.0+ installed
- [ ] ✅ All dependencies installed (`npm install`)
- [ ] ✅ Development server can start (`npm run dev`)
- [ ] ✅ Database is accessible and seeded
- [ ] ✅ NEXTAUTH_SECRET is configured in `.env`
- [ ] ✅ Git working directory is clean (commit or stash changes)

**Verify Prerequisites:**
```bash
# Check Node version
node --version  # Should be v20.19.0 or higher

# Check environment
cat .env | grep NEXTAUTH_SECRET  # Should exist

# Check database
npm run debug:auth  # Should pass 22/23 or 23/23 checks

# Verify dev server starts
npm run dev  # Should start on http://localhost:3001
# Press Ctrl+C to stop after verification
```

---

## 🎯 EXECUTION PATH - CHOOSE ONE

### Option A: Automated Fix (Recommended - Fastest)
**Time:** 5-10 minutes  
**Difficulty:** Easy ⭐  
**Risk:** Low (changes are reviewable)

### Option B: Manual Guided Fix
**Time:** 30-45 minutes  
**Difficulty:** Medium ⭐⭐  
**Risk:** Low (more control)

### Option C: Test-Driven Debug
**Time:** 45-60 minutes  
**Difficulty:** Advanced ⭐⭐⭐  
**Risk:** Very Low (understand each fix)

---

## 🤖 OPTION A: Automated Fix (RECOMMENDED)

### Step 1: Preview Changes (Dry Run)

```bash
# Navigate to project directory
cd "M:\Repo\Farmers Market Platform web and app"

# Run dry-run to see what will be changed
npm run fix:e2e-tests -- --dry-run --verbose
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║  🔧 E2E Test Automated Fix Script                         ║
╠════════════════════════════════════════════════════════════╣
║  Mode: DRY RUN (no changes)                               ║
║  Verbose: ON                                              ║
╚════════════════════════════════════════════════════════════╝

ℹ️  Finding test files...
✅ Found X test files

Processing: tests/e2e/critical-flows.spec.ts
  ✓ Applied "customer-email" (5 matches)
  ✓ Applied "customer-password" (5 matches)
  
📊 Fix Summary
  Files Processed: X
  Files Modified: Y
  Total Fixes Applied: Z
```

**Review the Preview:**
- [ ] Check how many files will be modified
- [ ] Review the types of fixes that will be applied
- [ ] Ensure the changes look reasonable

### Step 2: Apply Fixes

```bash
# Apply the automated fixes
npm run fix:e2e-tests -- --verbose
```

**Expected Output:**
```
✅ All fixes applied successfully!

Remember to:
  1. Review the changes with 'git diff'
  2. Run tests: 'npx playwright test'
  3. Commit changes: 'git commit -m "fix(tests): automated E2E test fixes"'
```

### Step 3: Review Changes

```bash
# View all changes made
git diff tests/

# OR review file by file
git diff tests/e2e/critical-flows.spec.ts
git diff tests/e2e/auth/customer-registration.spec.ts
git diff tests/e2e/shopping/complete-purchase.spec.ts
```

**What to Look For:**
- ✅ `test.customer@example.com` → `TEST_USERS.customer.email`
- ✅ `"TestPass123!"` → `TEST_USERS.customer.password`
- ✅ Import added: `import { TEST_USERS } from "../helpers/auth";`
- ✅ Dashboard redirect expectations updated
- ✅ Network timeout adjustments

### Step 4: Run Tests

```bash
# Start development server in background (separate terminal)
npm run dev

# In another terminal, run E2E tests
npx playwright test

# OR run specific test file to verify
npx playwright test tests/e2e/critical-flows.spec.ts --headed
```

### Step 5: Commit Changes

```bash
# Stage the changes
git add tests/

# Commit with descriptive message
git commit -m "fix(tests): automated E2E test fixes

- Replace hardcoded test emails with TEST_USERS
- Update redirect expectations for role-based routing
- Add networkidle waits after navigation
- Increase timeouts for network operations
- Ensure TEST_USERS import in all test files"

# Push to your branch
git push
```

**✅ DONE! Skip to "Post-Execution Verification" section below.**

---

## 🔧 OPTION B: Manual Guided Fix

### Step 1: Update Customer Registration Test

**File:** `tests/e2e/auth/customer-registration.spec.ts`

**Status:** ✅ Already updated from previous session

**Verify it looks correct:**
```bash
# Check the file
cat "tests/e2e/auth/customer-registration.spec.ts" | grep -A 5 "TEST_USERS"
```

### Step 2: Fix Critical Flows Test

**File:** `tests/e2e/critical-flows.spec.ts`

**Open the file and make these changes:**

```typescript
// At the top, add import (if not present)
import { TEST_USERS } from "../helpers/auth";

// Find and replace all instances of:
// OLD: "test.customer@example.com"
// NEW: TEST_USERS.customer.email

// OLD: "TestPass123!"
// NEW: TEST_USERS.customer.password

// Update dashboard redirect expectations:
// OLD:
await page.waitForURL(/\/dashboard/);

// NEW:
await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
```

**Manual Find & Replace:**
```bash
# Count occurrences to fix
grep -n "test.customer@example.com" tests/e2e/critical-flows.spec.ts

# After manual edits, verify
grep -n "TEST_USERS.customer" tests/e2e/critical-flows.spec.ts
```

### Step 3: Fix Shopping Flow Tests

**File:** `tests/e2e/shopping/complete-purchase.spec.ts`

**Apply same patterns:**
1. Add `TEST_USERS` import
2. Replace `test.customer@example.com` → `TEST_USERS.customer.email`
3. Replace `TestPass123!` → `TEST_USERS.customer.password`
4. Update redirect expectations

### Step 4: Fix Checkout Flow Test

**File:** `tests/e2e/checkout-stripe-flow.spec.ts`

**Update the TEST_USER constant:**

```typescript
// OLD:
const TEST_USER = {
  email: "test.customer@example.com",
  password: "TestPass123!",
  name: "Test Customer",
};

// NEW:
import { TEST_USERS } from "../helpers/auth";

const TEST_USER = TEST_USERS.customer;
```

### Step 5: Add Network Idle Waits

**In all test files, after page.goto(), add:**

```typescript
await page.goto("/some-path");
await page.waitForLoadState("networkidle"); // ADD THIS LINE
```

### Step 6: Test Each File

```bash
# Test critical flows
npx playwright test tests/e2e/critical-flows.spec.ts --headed

# Test shopping flows
npx playwright test tests/e2e/shopping/complete-purchase.spec.ts --headed

# Test checkout flows
npx playwright test tests/e2e/checkout-stripe-flow.spec.ts --headed
```

### Step 7: Commit Changes

```bash
git add tests/
git commit -m "fix(tests): manual E2E test fixes"
git push
```

**✅ DONE! Skip to "Post-Execution Verification" section below.**

---

## 🐛 OPTION C: Test-Driven Debug

### Step 1: Run Tests to See Current Failures

```bash
# Start dev server
npm run dev

# In another terminal, run all E2E tests
npx playwright test --reporter=html

# Open the HTML report
npx playwright show-report
```

### Step 2: Identify Failure Patterns

**Look for:**
- ❌ Timeout errors (Test timeout of 30000ms exceeded)
- ❌ Element not found errors
- ❌ Unexpected redirects
- ❌ Authentication failures

**Create a failure log:**
```bash
# Generate test results
npx playwright test > test-results.log 2>&1

# Review failures
cat test-results.log | grep "Error:"
cat test-results.log | grep "TimeoutError"
```

### Step 3: Fix One Test at a Time

**Start with simplest test:**

```bash
# Run single test in debug mode
npx playwright test tests/e2e/critical-flows.spec.ts -g "Admin can login" --debug
```

**Watch the test execute step-by-step:**
- Observe which selectors fail
- Note which redirects don't match expectations
- Check authentication issues

**Fix the identified issue:**
1. Update the test code
2. Re-run the same test
3. Verify it passes
4. Move to next test

### Step 4: Document Each Fix

**Create a fix log:**
```markdown
## Fix Log

### Test: Admin can login
- **Issue:** Timeout waiting for dashboard
- **Root Cause:** Expected /dashboard but admin goes to /admin
- **Fix:** Changed expectation to /admin
- **Status:** ✅ PASSING

### Test: Customer can add to cart
- **Issue:** Element not found: [data-testid="add-to-cart"]
- **Root Cause:** App doesn't have this testid
- **Fix:** Used alternative selector: button:has-text("Add to Cart")
- **Status:** ✅ PASSING
```

### Step 5: Run Full Suite

```bash
# After fixing individual tests, run full suite
npx playwright test --reporter=list

# Generate final report
npx playwright test --reporter=html
npx playwright show-report
```

### Step 6: Commit Incrementally

```bash
# Commit after each logical fix
git add tests/e2e/critical-flows.spec.ts
git commit -m "fix(tests): admin login redirect expectation"

git add tests/e2e/shopping/
git commit -m "fix(tests): cart selector updates"
```

**✅ DONE! Proceed to "Post-Execution Verification".**

---

## ✅ POST-EXECUTION VERIFICATION

### Verification Checklist

Run these commands to verify everything works:

```bash
# 1. Check test credentials are standardized
grep -r "test.customer@example.com" tests/e2e/
# Should return: no matches (or only comments)

grep -r "TEST_USERS.customer" tests/e2e/
# Should return: multiple matches ✅

# 2. Verify imports are present
grep -r "from \"../helpers/auth\"" tests/e2e/
# Should return: imports in files that use TEST_USERS ✅

# 3. Run auth diagnostic
npm run debug:auth
# Should pass: 22/23 or 23/23 checks ✅

# 4. Run full E2E suite
npx playwright test
# Note pass/fail counts

# 5. Generate and review report
npx playwright test --reporter=html
npx playwright show-report
```

### Expected Results

**After fixes, you should see:**

```
✅ Passing Tests: Increased significantly
⚠️  Failing Tests: Reduced (ideally 0)
📊 Test Duration: May be slightly longer due to networkidle waits
```

**Common Remaining Failures:**

If tests still fail, it's likely due to:
1. **Missing data-testid attributes** - Add to components
2. **Different UI structure** - Update selectors to match actual UI
3. **Timing issues** - Increase timeouts further
4. **Database state** - Re-seed test data

---

## 🔍 TROUBLESHOOTING

### Issue: "Cannot find module '../helpers/auth'"

**Solution:**
```bash
# Verify the auth helper exists
ls tests/helpers/auth.ts

# Check import path is correct
# Should be: "../helpers/auth" (from tests/e2e/*)
# Should be: "../../helpers/auth" (from tests/e2e/subdirs/*)
```

### Issue: Tests still timeout

**Solution:**
```typescript
// Increase test timeout globally
// In playwright.config.ts:
export default defineConfig({
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000 // 10 seconds per assertion
  }
});
```

### Issue: "User not found" errors

**Solution:**
```bash
# Re-run global setup to seed test users
npm run db:seed

# OR manually verify test users exist
npx prisma studio
# Navigate to User table, look for:
# - admin@farmersmarket.app
# - farmer@farmersmarket.app
# - customer@farmersmarket.app
```

### Issue: Authentication failures

**Solution:**
```bash
# Regenerate auth secret
npm run fix:auth

# Verify auth setup is working
npm run debug:auth

# Check auth storage files exist
ls tests/auth/.auth/
# Should contain: admin.json, farmer.json, customer.json
```

### Issue: Selector not found errors

**Solution:**
1. Run test in headed mode to see actual UI:
   ```bash
   npx playwright test <test-file> --headed
   ```

2. Open browser inspector and find actual selector

3. Update test with correct selector:
   ```typescript
   // Use Playwright Inspector
   npx playwright test <test-file> --debug
   // Pause at failure, inspect element, copy selector
   ```

---

## 📊 SUCCESS METRICS

### Immediate Success (Day 1)
- [ ] ✅ All automated fixes applied without errors
- [ ] ✅ Git diff reviewed and changes understood
- [ ] ✅ At least 50% of tests passing (up from ~0%)
- [ ] ✅ No more `test.customer@example.com` references
- [ ] ✅ TEST_USERS imported in all test files

### Short-term Success (Week 1)
- [ ] ✅ 80%+ of tests passing consistently
- [ ] ✅ All critical user flows tested (auth, shopping, checkout)
- [ ] ✅ Test execution time < 10 minutes
- [ ] ✅ No flaky tests (consistent pass/fail)

### Long-term Success (Month 1)
- [ ] ✅ 100% of E2E tests passing
- [ ] ✅ CI/CD pipeline running tests automatically
- [ ] ✅ Test coverage >80% for critical flows
- [ ] ✅ Playwright report generated and accessible

---

## 🎯 NEXT STEPS AFTER EXECUTION

### Immediate (Today)
1. ✅ Execute one of the options above
2. ✅ Verify tests are improved
3. ✅ Commit and push changes
4. ✅ Document any remaining issues

### Short-term (This Week)
1. 📝 Add missing data-testid attributes to components
2. 🧪 Create accessibility tests
3. 🔍 Add error state tests
4. 📊 Review test coverage

### Medium-term (This Month)
1. 🚀 Set up CI/CD for automated testing
2. 📈 Add performance benchmarks
3. 🎨 Enhance test reporting
4. 📚 Document testing best practices

---

## 📞 SUPPORT & RESOURCES

**Documentation:**
- Main Action Plan: `docs/E2E_TESTING_ACTION_PLAN.md`
- NextAuth Debug Guide: `docs/NEXTAUTH_DEBUG_GUIDE.md`
- Divine Instructions: `.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md`

**Helper Scripts:**
- `npm run debug:auth` - Diagnose authentication issues
- `npm run fix:auth` - Fix authentication setup
- `npm run fix:e2e-tests` - Automated test fixes (this guide)

**Test Commands:**
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/critical-flows.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode (step through)
npx playwright test --debug

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report

# Run tests for specific project
npx playwright test --project=chromium
```

**Playwright Documentation:**
- Official Docs: https://playwright.dev/
- Best Practices: https://playwright.dev/docs/best-practices
- Debugging: https://playwright.dev/docs/debug

---

## ✨ COMPLETION

Once you've completed this guide:

1. **Update Status:**
   ```markdown
   ## Execution Log
   - Date: [Your date]
   - Option Chosen: [A/B/C]
   - Time Taken: [X minutes]
   - Tests Passing Before: [X/Y]
   - Tests Passing After: [X/Y]
   - Issues Encountered: [List any issues]
   - Next Steps: [What remains to be done]
   ```

2. **Share Results:**
   - Take screenshot of Playwright HTML report
   - Share passing/failing counts
   - Document any remaining issues

3. **Celebrate! 🎉**
   - You've significantly improved test quality
   - Tests are now using proper test credentials
   - Foundation is set for 100% passing suite

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** ✅ READY FOR IMMEDIATE EXECUTION  

_"Fix with divine precision, test with agricultural consciousness, deploy with quantum confidence."_ 🌾✅