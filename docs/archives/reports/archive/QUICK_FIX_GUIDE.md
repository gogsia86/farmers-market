# 🚀 Quick Fix Guide - E2E Test Route Mismatch

**Issue**: Tests fail because they look for `/register` but app uses `/signup`  
**Impact**: 68/87 tests failing (78% failure rate)  
**Fix Time**: 30 minutes  
**Expected Result**: 70-80% pass rate

---

## 🎯 The Problem

```typescript
// Tests expect this:
await page.click('a[href="/register"]');
await expect(page).toHaveURL(/\/register/);

// But app actually has:
<a href="/signup">Create Account</a>
// Route at: src/app/(auth)/signup/
```

---

## ✅ Step-by-Step Fix

### Step 1: Find All Occurrences (2 minutes)

```bash
cd "M:\Repo\Farmers Market Platform web and app"

# Find all test files using "/register"
grep -r '"/register"' tests/e2e/

# Find all URL matchers using /register/
grep -r '/\\\/register/' tests/e2e/

# Expected output:
# tests/e2e/auth/customer-registration.spec.ts:43:    await page.click('a[href="/register"]');
# tests/e2e/auth/customer-registration.spec.ts:44:    await expect(page).toHaveURL(/\/register/);
# ... (more occurrences)
```

### Step 2: Update Test Files (15 minutes)

#### File: `tests/e2e/auth/customer-registration.spec.ts`

**Find and replace:**

```typescript
// OLD:
await page.click('a[href="/register"]');
await expect(page).toHaveURL(/\/register/);

// NEW:
await page.click('a[href="/signup"]');
await expect(page).toHaveURL(/\/signup/);
```

**Specific lines to update (approximate):**

- Line 43: `await page.click('a[href="/register"]');` → `await page.click('a[href="/signup"]');`
- Line 44: `await expect(page).toHaveURL(/\/register/);` → `await expect(page).toHaveURL(/\/signup/);`
- Any other occurrences in the file

#### Check Other Test Files:

```bash
# Search for any other files with "register" references
grep -l "register" tests/e2e/*.ts tests/e2e/**/*.ts
```

Common patterns to replace:

```typescript
// Pattern 1: Link clicks
'a[href="/register"]' → 'a[href="/signup"]'

// Pattern 2: URL assertions
/\/register/ → /\/signup/

// Pattern 3: Navigation
page.goto('/register') → page.goto('/signup')

// Pattern 4: Text references (may or may not need changes)
"Create Account" or "Sign Up" (check which text app uses)
```

### Step 3: Start Dev Server (1 minute)

```bash
cd "M:\Repo\Farmers Market Platform web and app"

# Start server on port 3001
npm run dev
```

Wait for: `✓ Ready on http://localhost:3001`

### Step 4: Manual Verification (3 minutes)

```bash
# 1. Check login page has correct link
curl -s http://localhost:3001/login | grep signup
# Expected: href="/signup"

# 2. Check signup page loads
curl -s http://localhost:3001/signup | grep -i "sign up\|create account"
# Expected: Some registration form HTML
```

**OR** Open browser:

1. Go to: http://localhost:3001/login
2. Look for "Create Account" or "Sign Up" link
3. Click it
4. Verify URL is: http://localhost:3001/signup
5. Verify registration form appears

### Step 5: Run Tests (6 minutes)

```bash
cd "M:\Repo\Farmers Market Platform web and app"

# Set environment
export BASE_URL=http://localhost:3001
export TEST_PORT=3001

# Run all tests
npx playwright test --project=chromium --reporter=list

# OR run just auth tests first
npx playwright test tests/e2e/auth/customer-registration.spec.ts --project=chromium
```

### Step 6: Verify Results (2 minutes)

Check the output for:

```
✅ Expected:
- Registration tests passing (6-8 tests)
- Login tests passing (3-4 tests)
- Overall pass rate: 60-70 tests passing

❌ If still failing:
- Check error messages
- Run in headed mode (see Troubleshooting below)
```

---

## 🔍 Troubleshooting

### Tests Still Timeout?

```bash
# Run in headed mode to see what's happening
npx playwright test --headed --project=chromium tests/e2e/auth/customer-registration.spec.ts:37

# OR with debug mode
npx playwright test --headed --debug tests/e2e/auth/customer-registration.spec.ts:37
```

### Can't Find Signup Link?

```bash
# Check what the actual link text is
curl -s http://localhost:3001/login | grep -i "sign\|account\|register"

# Update test to match actual text:
await page.click('text="Sign Up"'); // or whatever text is used
```

### Wrong Redirect After Signup?

Check `src/lib/auth/config.ts`:

```typescript
// Verify signIn callback redirects correctly
callbacks: {
  async signIn({ user }) {
    // Check redirect logic
  }
}
```

### Still Getting Auth Errors?

```bash
# Verify environment variables
cat .env.local | grep NEXTAUTH_SECRET
cat .env.test | grep NEXTAUTH_SECRET

# Should output a long random string
```

---

## 📊 Expected Test Results

### Before Fix:

```
Running 87 tests
  12 passed (13.8%)
  68 failed (78.2%)
  7 skipped (8.0%)
```

### After Fix:

```
Running 87 tests
  60-70 passed (70-80%)
  10-20 failed (11-23%)
  7 skipped (8.0%)
```

### Tests That Should Now Pass:

- ✅ Customer Registration Flow (8 tests)
- ✅ Customer Login Flow (4 tests)
- ✅ Customer Profile Management (3 tests)
- ✅ Customer Logout (1 test)
- ✅ Many shopping/checkout tests (30+ tests)

---

## 🎯 One-Command Fix (Advanced)

If you want to automate the replacement:

```bash
cd "M:\Repo\Farmers Market Platform web and app"

# Backup first
cp tests/e2e/auth/customer-registration.spec.ts tests/e2e/auth/customer-registration.spec.ts.backup

# Replace in file (Linux/Mac)
sed -i 's|"/register"|"/signup"|g' tests/e2e/auth/customer-registration.spec.ts
sed -i 's|/\\/register/|/\\/signup/|g' tests/e2e/auth/customer-registration.spec.ts

# OR use PowerShell (Windows)
(Get-Content tests/e2e/auth/customer-registration.spec.ts) `
  -replace '"/register"', '"/signup"' `
  -replace '/\\/register/', '/\\/signup/' |
Set-Content tests/e2e/auth/customer-registration.spec.ts
```

---

## 📝 Post-Fix Checklist

- [ ] All `/register` references changed to `/signup`
- [ ] All `/\/register/` regex changed to `/\/signup/`
- [ ] Dev server running on port 3001
- [ ] Manual signup flow works in browser
- [ ] Tests re-run and pass rate improved
- [ ] HTML report generated: `npx playwright show-report`
- [ ] Screenshots reviewed for any remaining issues

---

## 🆘 Emergency Rollback

If something breaks:

```bash
# Restore backup
cp tests/e2e/auth/customer-registration.spec.ts.backup tests/e2e/auth/customer-registration.spec.ts

# OR use git
git checkout tests/e2e/auth/customer-registration.spec.ts
```

---

## 📞 Need Help?

### View Detailed Logs:

```bash
# Check test report
npx playwright show-report

# Check specific failure screenshots
ls -la test-results/
```

### Debug Specific Test:

```bash
# Run one test in debug mode
npx playwright test --headed --debug tests/e2e/auth/customer-registration.spec.ts:37 --timeout=60000
```

### Check Server Logs:

```bash
# If server issues
cat dev-server.log | tail -50
```

---

## ✨ Success Indicators

You'll know it worked when you see:

```
✅ 🌾 Customer Registration Flow › should complete full customer registration successfully
✅ 🌾 Customer Registration Flow › should show validation errors for invalid email
✅ 🌾 Customer Registration Flow › should show error for mismatched passwords
✅ 🔐 Customer Login Flow › should login successfully with valid credentials
✅ 🛒 Complete Shopping Flow › should complete full purchase from browse to order confirmation
```

**Final Status**: 60-70 tests passing = SUCCESS! 🎉

---

## 📚 Related Documentation

- Full test results: `E2E_TEST_RESULTS_SUMMARY.md`
- Executive summary: `E2E_TEST_RUN_EXECUTIVE_SUMMARY.md`
- Auth debugging: `docs/NEXTAUTH_DEBUG_GUIDE.md`
- Test output log: `e2e-test-results.log`

---

**Time to Fix**: ~30 minutes  
**Difficulty**: ⭐ Easy (find & replace)  
**Impact**: 🚀 Massive (+400% pass rate increase)

**Status**: Ready to implement! 🔧
