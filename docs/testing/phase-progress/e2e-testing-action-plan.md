# 🧪 E2E Testing Action Plan

## Farmers Market Platform - Comprehensive Testing Strategy

**Created:** January 2025  
**Status:** 🔄 IN PROGRESS  
**Priority:** 🔴 CRITICAL  
**Based on:** Phase-by-Phase Website Integration Testing Framework

---

## 📋 Executive Summary

This document provides a structured, prioritized action plan for fixing and validating all E2E tests in the Farmers Market Platform. We've completed initial authentication infrastructure fixes and now need to systematically address remaining test failures across the entire application.

### Current Status

- ✅ **Auth Backend:** Fixed (NEXTAUTH_SECRET configured, users seeded)
- ✅ **Database Seeding:** Working (global-setup.ts executing successfully)
- ✅ **Test Infrastructure:** Operational (Playwright configured, auth storage working)
- ⚠️ **Test Suite:** Partially failing (route mismatches, selector issues, redirect expectations)
- 📝 **Files Updated:** `customer-registration.spec.ts` (corrected `/register` → `/signup`)

### Key Discoveries

1. **Route Mismatch:** Tests reference `/register` but app uses `/signup`
2. **Selector Mismatch:** Tests expect different form structure than actual implementation
3. **Redirect Expectations:** Tests assume direct dashboard redirects; app uses role-based routing
4. **Credential Sync:** Some tests use different email addresses than seeded test users

---

## 🎯 Phase 1: IMMEDIATE PRIORITIES (P0)

### 1.1 Route & Selector Audit Across All Tests

**Objective:** Find and fix all instances of incorrect routes and selectors

**Action Items:**

#### A. Search for `/register` references

```bash
# Find all occurrences
grep -r "register" tests/e2e/ --include="*.spec.ts"
grep -r "/register" tests/e2e/ --include="*.spec.ts"
grep -r 'href="/register"' tests/e2e/ --include="*.spec.ts"
```

#### B. Files to update based on known structure:

- `tests/e2e/critical-flows.spec.ts` - Line references needed
- `tests/e2e/checkout-stripe-flow.spec.ts` - Verify login flow
- `tests/e2e/shopping/complete-purchase.spec.ts` - Check registration paths
- Any other test files discovered in search

#### C. Replacement patterns needed:

**Route Changes:**

```typescript
// ❌ OLD
await page.goto("/register");
await page.click('a[href="/register"]');

// ✅ NEW
await page.goto("/signup");
await page.click('a[href="/signup"]');
```

**Selector Changes (Signup Form):**

```typescript
// ❌ OLD - Tests expect separate firstName/lastName
await page.fill('input[name="firstName"]', "John");
await page.fill('input[name="lastName"]', "Doe");
await page.click('button:has-text("Customer")'); // Button selector
await page.check('input[name="terms"]');

// ✅ NEW - Actual implementation
await page.fill('input[name="name"]', "John Doe");
await page.check('input[type="radio"][value="CONSUMER"]'); // Radio button
await page.check('input[name="agreeToTerms"]');
```

**Submit Button:**

```typescript
// ✅ ACTUAL - Form submit
await page.click('button[type="submit"]:has-text("Create Account")');
```

### 1.2 Verify and Fix Redirect Expectations

**Objective:** Ensure tests expect correct post-action redirects

#### A. Post-Signup Redirect

```typescript
// ✅ ACTUAL BEHAVIOR (from signup/page.tsx)
router.push("/login?registered=true");

// Tests should expect:
await expect(page).toHaveURL(/\/login\?registered=true/);
```

#### B. Post-Login Redirect (Role-Based)

**Current Middleware Logic:**

```typescript
// From auth/config.ts authorized() callback:
// - Admin routes: /admin/* → requires ADMIN, SUPER_ADMIN, or MODERATOR
// - Farmer routes: /farmer/* or /dashboard/* → requires FARMER or admin roles
// - Default authenticated: any authenticated user can access
```

**Update Test Expectations:**

```typescript
// ❌ OLD - Generic dashboard assumption
await expect(page).toHaveURL(/\/dashboard/);

// ✅ NEW - Role-based expectations
// For ADMIN:
await expect(page).toHaveURL(/\/admin/);

// For FARMER:
await expect(page).toHaveURL(/\/(farmer|dashboard)/);

// For CONSUMER:
// Auth doesn't automatically redirect consumers to specific dashboard
// They stay on homepage or redirected page - UPDATE TEST LOGIC
await page.waitForURL((url) => !url.pathname.includes("/login"));
```

### 1.3 Standardize Test Credentials

**Objective:** Ensure all tests use seeded test credentials

**Seeded Test Users (from global-setup.ts):**

```typescript
export const TEST_USERS = {
  admin: {
    email: "admin@farmersmarket.app",
    password: "DivineAdmin123!",
    role: "ADMIN",
  },
  farmer: {
    email: "farmer@farmersmarket.app",
    password: "DivineFarmer123!",
    role: "FARMER",
  },
  customer: {
    email: "customer@farmersmarket.app",
    password: "DivineCustomer123!",
    role: "CONSUMER",
  },
};
```

**Action:** Search and replace any hardcoded test emails:

```bash
# Find non-standard test emails
grep -r "test\\.customer@" tests/e2e/
grep -r "@example\\.com" tests/e2e/
grep -r "@test\\." tests/e2e/
```

**Replace with:**

```typescript
// Import from helpers
import { TEST_USERS } from "../helpers/auth";

// Use in tests
await page.fill('input[name="email"]', TEST_USERS.customer.email);
await page.fill('input[name="password"]', TEST_USERS.customer.password);
```

---

## 🔧 Phase 2: SYSTEMATIC TEST UPDATES (P1)

### 2.1 Update `critical-flows.spec.ts`

**File:** `tests/e2e/critical-flows.spec.ts`

**Issues Identified:**

1. Line 26: Expects `text=Admin Dashboard` - verify actual admin page content
2. Line 30: Generic error message expectation - verify actual error UI
3. Line 39-40: `text=Browse Farms` link may not exist in nav
4. Line 47: `data-testid="farm-card"` - verify app uses this testid
5. Line 61: `data-testid="add-to-cart"` - verify actual selector
6. Line 65: `data-testid="cart-count"` - verify actual selector
7. Line 69: `data-testid="cart-button"` - verify actual selector
8. Line 72: `data-testid="cart-item"` - verify actual selector

**Required Updates:**

```typescript
// Add visual verification step for elements that may not have test IDs
// Replace with actual selectors from Navigation.tsx and product components

// Suggested approach: Add data-testid attributes to app components first
// OR: Use more robust selectors like ARIA labels or semantic HTML
```

### 2.2 Update `checkout-stripe-flow.spec.ts`

**File:** `tests/e2e/checkout-stripe-flow.spec.ts`

**Issues Identified:**

1. Lines 22-26: `TEST_USER` credentials don't match seeded users
2. Line 50: `loginAsCustomer()` function - verify matches actual login flow
3. Line 89, 93: Timeout values may need adjustment for checkout flow
4. Various `data-testid` selectors need verification

**Required Updates:**

```typescript
// Replace TEST_USER with imported TEST_USERS.customer
import { TEST_USERS } from "../helpers/auth";

const TEST_USER = TEST_USERS.customer;

// Review all selectors and match to actual checkout/cart components
// Consider increasing timeouts for Stripe integration (network calls)
```

### 2.3 Update Auth Tests Directory

**Files to Review:**

- `tests/e2e/auth/customer-registration.spec.ts` ✅ (Already updated)
- Check for other auth test files in `tests/e2e/auth/` directory

**Action:**

```bash
# List all auth tests
ls -la "Farmers Market Platform web and app/tests/e2e/auth/"

# Apply same patterns as customer-registration.spec.ts
```

### 2.4 Update Shopping Flow Tests

**Directory:** `tests/e2e/shopping/`

**Action:**

```bash
# List all shopping tests
ls -la "Farmers Market Platform web and app/tests/e2e/shopping/"

# Review and update:
# - Cart operations
# - Checkout flows
# - Product browsing
# - Order completion
```

### 2.5 Update Farmer Tests

**Directory:** `tests/e2e/farmer/`

**Action:**

```bash
# List all farmer tests
ls -la "Farmers Market Platform web and app/tests/e2e/farmer/"

# Review and update:
# - Farm management
# - Product CRUD operations
# - Order fulfillment
# - Dashboard access
```

---

## 🎨 Phase 3: UI/SELECTOR HARDENING (P2)

### 3.1 Add Stable Test Selectors to App Components

**Objective:** Make tests more robust by adding `data-testid` attributes

**Components Needing Test IDs:**

#### Navigation Components

```typescript
// src/components/layout/Navigation.tsx
<nav data-testid="main-navigation">
  <a href="/farms" data-testid="nav-farms-link">Browse Farms</a>
  <button data-testid="cart-button">
    <span data-testid="cart-count">{cartCount}</span>
  </button>
</nav>
```

#### Farm Components

```typescript
// src/components/features/farms/FarmCard.tsx
<div data-testid="farm-card" data-farm-id={farm.id}>
  <h3 data-testid="farm-name">{farm.name}</h3>
  <button data-testid="view-farm-button">View Details</button>
</div>
```

#### Product Components

```typescript
// src/components/features/products/ProductCard.tsx
<div data-testid="product-card" data-product-id={product.id}>
  <h4 data-testid="product-name">{product.name}</h4>
  <span data-testid="product-price">{product.price}</span>
  <button data-testid="add-to-cart-button">Add to Cart</button>
</div>
```

#### Cart Components

```typescript
// src/components/features/cart/CartItem.tsx
<div data-testid="cart-item" data-item-id={item.id}>
  <span data-testid="item-quantity">{item.quantity}</span>
  <button data-testid="remove-item-button">Remove</button>
</div>
```

#### Admin Dashboard

```typescript
// src/app/(admin)/page.tsx
<div data-testid="admin-dashboard">
  <h1 data-testid="dashboard-title">Admin Dashboard</h1>
</div>
```

### 3.2 Verify Navigation Links Exist

**Action:** Check actual Navigation component to ensure expected links exist

**File to Review:** `src/components/layout/Navigation.tsx`

**Expected Links to Verify:**

- Browse Farms (`/farms`)
- Products (`/products`)
- Cart (`/cart`)
- Login/Signup (when not authenticated)
- Dashboard/Profile (when authenticated)

---

## 🚀 Phase 4: VISUAL & FUNCTIONAL VERIFICATION (P2)

### 4.1 Run Tests in Headed Mode

**Objective:** Visually verify test behavior and debug failures

```bash
# Run specific test file in headed mode
npx playwright test tests/e2e/critical-flows.spec.ts --headed

# Run with debug mode (step through)
npx playwright test tests/e2e/critical-flows.spec.ts --debug

# Run single test
npx playwright test tests/e2e/critical-flows.spec.ts -g "Admin can login"
```

### 4.2 Generate Test Report

```bash
# Run full suite and generate HTML report
npx playwright test --reporter=html

# Open report
npx playwright show-report
```

### 4.3 Review Screenshots and Videos

**Location:** `test-results/`

**Action:**

- Check screenshots of failed tests
- Review video recordings of timeouts
- Identify UI elements that don't exist or have wrong selectors

---

## ⚙️ Phase 5: PERFORMANCE & TIMEOUT OPTIMIZATION (P2)

### 5.1 Review Timeout Settings

**Current Timeout:** 30000ms (30 seconds) - from test failures

**Recommended Timeouts:**

```typescript
// For navigation
await page.goto("/login", { timeout: 15000 });

// For network-heavy operations (Stripe, checkout)
await page.click("button[type='submit']", { timeout: 45000 });

// For standard interactions
await page.click('button:has-text("Add to Cart")', { timeout: 10000 });

// For waiting after form submission
await page.waitForURL(/\/success/, { timeout: 30000 });
```

### 5.2 Add Explicit Waits

**Pattern: Wait for Network Idle Before Assertions**

```typescript
// ✅ GOOD - Wait for network to settle
await page.waitForLoadState("networkidle");
await expect(page.locator("text=Welcome")).toBeVisible();

// ✅ GOOD - Wait for specific element
await page.waitForSelector('[data-testid="product-grid"]', {
  state: "visible",
});

// ❌ BAD - Assert immediately
await page.goto("/products");
await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
```

---

## 🔒 Phase 6: AUTHENTICATION IMPROVEMENTS (P1)

### 6.1 Verify Auth Storage State Files

**Action:** Ensure auth.setup.ts is creating valid storage files

```bash
# Check auth storage files exist
ls -la "Farmers Market Platform web and app/tests/auth/.auth/"

# Should contain:
# - admin.json
# - farmer.json
# - customer.json
```

### 6.2 Use Auth Storage in Tests

**Pattern: Use Pre-Authenticated Contexts**

```typescript
// playwright.config.ts - define projects with auth
export default defineConfig({
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/auth/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium-farmer",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/auth/.auth/farmer.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium-customer",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/auth/.auth/customer.json",
      },
      dependencies: ["setup"],
    },
  ],
});
```

**Then in tests:**

```typescript
// Tests automatically use authenticated context!
test.describe("Farmer Dashboard", () => {
  test("should display farm overview", async ({ page }) => {
    // Already authenticated as farmer
    await page.goto("/farmer/dashboard");
    await expect(page.locator("h1")).toContainText("My Farm");
  });
});
```

---

## 📊 Phase 7: COMPREHENSIVE TEST COVERAGE (P3)

### 7.1 Test Coverage Matrix

**Following Framework Phases:**

| Phase | Area                      | Test Files                                | Status          |
| ----- | ------------------------- | ----------------------------------------- | --------------- |
| 4     | Authentication Flows      | `auth/*.spec.ts`                          | ⚠️ Partial      |
| 4     | Shopping Flow             | `shopping/*.spec.ts`                      | ❌ Needs Review |
| 4     | Checkout Flow             | `checkout-stripe-flow.spec.ts`            | ❌ Needs Review |
| 4     | Farmer Management         | `farmer/*.spec.ts`                        | ❌ Needs Review |
| 4     | Admin Management          | `critical-flows.spec.ts` (admin section)  | ❌ Needs Review |
| 5     | Complete Purchase Journey | `shopping/complete-purchase.spec.ts`      | ❌ Needs Review |
| 6     | Accessibility             | TBD                                       | ❌ Missing      |
| 6     | Performance               | `performance/*.spec.ts`                   | ❓ Unknown      |
| 7     | Mobile Responsive         | `critical-flows.spec.ts` (mobile section) | ❌ Needs Review |

### 7.2 Missing Test Coverage (Create New Tests)

**Priority Tests to Add:**

#### A. Accessibility Tests

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Compliance", () => {
  test("homepage should pass WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
```

#### B. Error State Tests

```typescript
// tests/e2e/error-states.spec.ts
test.describe("Error Handling", () => {
  test("should display 404 page for non-existent routes", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.locator("h1")).toContainText("404");
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock failed API call
    await page.route("**/api/products", (route) => route.abort());
    await page.goto("/products");
    await expect(page.locator("text=Failed to load")).toBeVisible();
  });
});
```

#### C. Edge Cases

```typescript
// tests/e2e/edge-cases.spec.ts
test.describe("Edge Cases", () => {
  test("should prevent checkout with empty cart", async ({ page }) => {
    await page.goto("/cart");
    const checkoutButton = page.locator('button:has-text("Checkout")');
    await expect(checkoutButton).toBeDisabled();
  });

  test("should handle out-of-stock products", async ({ page }) => {
    // Test adding unavailable product
  });
});
```

---

## 🛠️ Phase 8: CI/CD INTEGRATION (P2)

### 8.1 Ensure Environment Variables in CI

**Required Variables:**

```bash
NEXTAUTH_SECRET=<secure-value>
DATABASE_URL=<test-db-connection>
NEXTAUTH_URL=http://localhost:3001
STRIPE_SECRET_KEY=<test-key>
```

### 8.2 CI Test Configuration

**GitHub Actions Example:**

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Setup test database
        run: |
          npm run db:test:setup
          npm run db:migrate
          npm run db:seed
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Run E2E tests
        run: npx playwright test
        env:
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: http://localhost:3001

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 📝 EXECUTION CHECKLIST

### Immediate Actions (This Week)

- [ ] **Day 1: Route & Selector Audit**
  - [ ] Run grep searches for `/register` references
  - [ ] Update all found instances to `/signup`
  - [ ] Update signup form selectors (name, userType, agreeToTerms)
  - [ ] Commit changes with message: "fix(tests): update signup route and selectors"

- [ ] **Day 2: Fix Redirect Expectations**
  - [ ] Update post-signup redirect expectations (`/login?registered=true`)
  - [ ] Update post-login redirect expectations (role-based)
  - [ ] Document actual redirect behavior in tests
  - [ ] Commit: "fix(tests): correct redirect expectations for auth flows"

- [ ] **Day 3: Standardize Test Credentials**
  - [ ] Find all hardcoded test emails
  - [ ] Replace with `TEST_USERS` imports
  - [ ] Verify seed data matches test expectations
  - [ ] Commit: "fix(tests): use standardized test credentials"

- [ ] **Day 4: Run & Debug Critical Tests**
  - [ ] Run `critical-flows.spec.ts` in headed mode
  - [ ] Fix identified selector issues
  - [ ] Take screenshots/notes of UI mismatches
  - [ ] Update tests to match actual UI
  - [ ] Commit: "fix(tests): update critical flows selectors"

- [ ] **Day 5: Checkout & Shopping Tests**
  - [ ] Review `checkout-stripe-flow.spec.ts`
  - [ ] Review `shopping/*.spec.ts` files
  - [ ] Update timeouts for network-heavy operations
  - [ ] Fix selector mismatches
  - [ ] Commit: "fix(tests): update shopping and checkout flows"

### Short-term Actions (Next 2 Weeks)

- [ ] **Week 1: Add Test IDs to Components**
  - [ ] Navigation component (`data-testid` attributes)
  - [ ] Farm/Product cards
  - [ ] Cart components
  - [ ] Form elements
  - [ ] Commit: "feat(components): add data-testid attributes for E2E testing"

- [ ] **Week 2: Complete Test Suite Update**
  - [ ] Farmer tests directory
  - [ ] Product tests directory
  - [ ] All remaining test files
  - [ ] Run full suite and document results
  - [ ] Create issue tickets for remaining failures

### Medium-term Actions (This Month)

- [ ] **Week 3: Enhanced Test Coverage**
  - [ ] Create accessibility tests
  - [ ] Create error state tests
  - [ ] Create edge case tests
  - [ ] Add performance benchmarks

- [ ] **Week 4: CI/CD Integration**
  - [ ] Set up GitHub Actions workflow
  - [ ] Configure test database for CI
  - [ ] Add environment secrets
  - [ ] Enable automated test runs on PRs

---

## 🎯 SUCCESS CRITERIA

### Definition of Done

✅ **Phase 1 Complete When:**

- All tests run without timeout errors
- All route references use correct paths (`/signup`, not `/register`)
- All form selectors match actual implementation
- All redirect expectations match actual behavior
- Test credentials standardized across all files

✅ **Full Success When:**

- 100% of E2E tests passing
- Test coverage >80% for critical user flows
- All tests run in <5 minutes
- CI/CD pipeline running tests automatically
- Test report generated and accessible
- No flaky tests (consistent pass/fail)

---

## 📞 IMMEDIATE NEXT STEPS - EXECUTE NOW

**Choose Your Path:**

### Option A: Automated Fix Script (Fastest)

```bash
# Run comprehensive search/replace for common issues
npm run fix:tests:routes      # Fix /register → /signup
npm run fix:tests:selectors   # Update form selectors
npm run fix:tests:credentials # Standardize TEST_USERS
```

### Option B: Manual Systematic Fix (Most Control)

1. Start with `critical-flows.spec.ts`
2. Fix one test file at a time
3. Run after each fix to verify
4. Document changes in git commits

### Option C: Guided Debugging (Most Learning)

1. Run one failing test in headed mode
2. Visually identify the issue
3. Fix the issue
4. Move to next test
5. Repeat until suite passes

---

## 📚 REFERENCE LINKS

**Divine Instructions:**

- `01_DIVINE_CORE_PRINCIPLES.instructions.md`
- `05_TESTING_SECURITY_DIVINITY.instructions.md`
- `13_TESTING_PERFORMANCE_MASTERY.instructions.md`

**Test Files:**

- `tests/e2e/critical-flows.spec.ts`
- `tests/e2e/checkout-stripe-flow.spec.ts`
- `tests/e2e/auth/customer-registration.spec.ts`
- `tests/helpers/auth.ts`

**App Files:**

- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/lib/auth/config.ts`

**Configuration:**

- `playwright.config.ts`
- `tests/global-setup.ts`

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** 🔄 Ready for Execution  
**Priority:** 🔴 CRITICAL - Start Immediately

_"Test with divine precision, fix with agricultural consciousness, deliver with quantum efficiency."_ 🌾✅
