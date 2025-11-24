# 🎭 E2E Testing Guide - Farmers Market Platform

**Last Updated**: January 16, 2025  
**Status**: ✅ Configured and Ready  
**Framework**: Playwright

---

## 📋 Quick Start

### Prerequisites

Before running E2E tests, ensure:

1. ✅ Dependencies installed: `npm install`
2. ✅ Database configured (optional for most tests)
3. ✅ Port 3001 is available OR dev server is running

### Running E2E Tests

```bash
# Option 1: Automatic server check (Recommended)
npm run test:e2e

# Option 2: With UI mode (interactive)
npm run test:e2e:ui

# Option 3: Headed mode (see browser)
npm run test:e2e:headed

# Option 4: Debug mode
npm run test:e2e:debug

# Option 5: HP OMEN optimized (10 workers)
npm run test:e2e:omen
```

---

## 🚀 Setup Methods

### Method 1: Automatic Check (Recommended)

The E2E test runner will automatically check if the server is running:

```bash
npm run test:e2e
```

**What happens:**

1. ✅ Checks if server is running on port 3001
2. ✅ If running: Starts tests immediately
3. ❌ If not running: Shows clear instructions

### Method 2: Manual Server Start

**Step 0: Clear any existing processes (if needed)**

```bash
npm run kill-server
```

**Terminal 1: Start Server**

```bash
npm run dev
# Wait for: ✓ Ready on http://localhost:3001
```

**Terminal 2: Run Tests**

```bash
npm run test:e2e
```

### Method 3: Let Playwright Start Server

Edit `playwright.config.ts` to automatically start the server:

```typescript
webServer: {
  command: "npm run dev",
  url: "http://localhost:3001",
  reuseExistingServer: !process.env.CI,
  timeout: 300 * 1000, // 5 minutes
}
```

Then run:

```bash
npm run test:e2e:direct
```

---

## 🔍 Troubleshooting

### Issue 1: Port 3001 Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

#### Quick Fix (Recommended):

```bash
# Use the built-in utility to kill all dev server processes
npm run kill-server
```

This will automatically:

- ✅ Scan ports 3000 and 3001
- ✅ Find any running processes
- ✅ Terminate them safely
- ✅ Confirm ports are clear

#### Manual Fix (Windows):

```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace <PID> with actual PID)
taskkill /F /PID <PID>
```

#### Manual Fix (Linux/Mac):

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process (replace <PID> with actual PID)
kill -9 <PID>
```

#### Alternative: Use Different Port

```bash
# Set custom port
TEST_PORT=3002 npm run test:e2e

# Or in .env.local
TEST_PORT=3002
```

---

### Issue 2: Server Not Starting

**Error:**

```
Error: Process from config.webServer was not able to start. Exit code: 1
```

**Solutions:**

1. **Check for Build Errors**

```bash
npm run build
# Fix any TypeScript or build errors
```

2. **Clear Next.js Cache**

```bash
rm -rf .next
npm run dev
```

3. **Check Database Connection**

```bash
# Ensure DATABASE_URL is set
echo $DATABASE_URL  # Linux/Mac
echo %DATABASE_URL% # Windows

# Or skip database for tests
export DATABASE_URL=""  # Linux/Mac
set DATABASE_URL=      # Windows
```

4. **Increase Timeout**

```typescript
// In playwright.config.ts
webServer: {
  timeout: 600 * 1000, // 10 minutes
}
```

---

### Issue 3: Tests Timing Out

**Error:**

```
Test timeout of 30000ms exceeded
```

**Solutions:**

1. **Increase Global Timeout**

```typescript
// In playwright.config.ts
export default defineConfig({
  timeout: 60000, // 60 seconds per test
});
```

2. **Increase Per-Test Timeout**

```typescript
test("my slow test", async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  // ... test code
});
```

3. **Check Network Issues**

```bash
# Test if server is responsive
curl http://localhost:3001
```

---

### Issue 4: Tests Failing Randomly

**Symptoms:**

- Tests pass locally but fail in CI
- Flaky tests that sometimes pass

**Solutions:**

1. **Add Proper Waits**

```typescript
// ❌ Bad: Race conditions
await page.click("button");
expect(page.locator(".result")).toBeVisible();

// ✅ Good: Wait for element
await page.click("button");
await page.waitForSelector(".result", { state: "visible" });
expect(page.locator(".result")).toBeVisible();
```

2. **Use Built-in Assertions**

```typescript
// ✅ Auto-waiting assertions
await expect(page.locator(".result")).toBeVisible();
await expect(page.locator(".count")).toHaveText("5");
```

3. **Increase Retries**

```typescript
// In playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});
```

---

### Issue 5: Browser Not Launching

**Error:**

```
Error: browserType.launch: Executable doesn't exist
```

**Solution:**

```bash
# Install Playwright browsers
npx playwright install

# Or install specific browser
npx playwright install chromium
```

---

## 📝 Writing E2E Tests

### Basic Test Structure

```typescript
// tests/e2e/home.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Farmers Market/);
  });

  test("should display farms", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="farm-card"]')).toHaveCount(3);
  });
});
```

### Testing User Flows

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test("should complete purchase", async ({ page }) => {
    // 1. Navigate to product
    await page.goto("/products/tomatoes");

    // 2. Add to cart
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");

    // 3. Go to cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL(/\/cart/);

    // 4. Proceed to checkout
    await page.click('[data-testid="checkout-button"]');

    // 5. Fill form
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="address"]', "123 Farm Road");

    // 6. Submit
    await page.click('[data-testid="place-order"]');

    // 7. Verify success
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
  });
});
```

### Using Page Objects

```typescript
// tests/e2e/pages/HomePage.ts
export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/");
  }

  async searchFarm(name: string) {
    await this.page.fill('[data-testid="search-input"]', name);
    await this.page.click('[data-testid="search-button"]');
  }

  async getFarmCards() {
    return this.page.locator('[data-testid="farm-card"]');
  }
}

// Usage in test
test("search farms", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.searchFarm("Organic Farm");
  await expect(await homePage.getFarmCards()).toHaveCount(1);
});
```

---

## 🎯 Best Practices

### 1. Use Data Test IDs

```tsx
// ✅ Good: Stable selectors
<button data-testid="add-to-cart">Add to Cart</button>

// ❌ Bad: Fragile selectors
<button className="btn-primary bg-blue-500">Add to Cart</button>
```

```typescript
// In test
await page.click('[data-testid="add-to-cart"]');
```

### 2. Isolate Tests

```typescript
// ✅ Each test is independent
test("test 1", async ({ page }) => {
  await page.goto("/");
  // Complete flow in one test
});

test("test 2", async ({ page }) => {
  await page.goto("/");
  // Doesn't depend on test 1
});
```

### 3. Use Fixtures

```typescript
// tests/e2e/fixtures.ts
import { test as base } from "@playwright/test";

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Log in before each test
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('[type="submit"]');
    await page.waitForURL("/dashboard");

    await use(page);
  },
});

// Usage
test("dashboard test", async ({ authenticatedPage }) => {
  // Already logged in!
  await expect(
    authenticatedPage.locator('[data-testid="user-menu"]'),
  ).toBeVisible();
});
```

### 4. Clean Up After Tests

```typescript
test.afterEach(async ({ page }) => {
  // Clear cookies
  await page.context().clearCookies();

  // Clear local storage
  await page.evaluate(() => localStorage.clear());
});
```

---

## 📊 Test Reports

### Viewing Results

```bash
# Run tests and generate report
npm run test:e2e

# Open HTML report
npx playwright show-report
```

### CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e:direct
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🔧 Configuration

### Playwright Config Overview

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 6,
  reporter: "html",
  timeout: 30000,

  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000,
  },
});
```

### Environment Variables

```bash
# .env.test.local
TEST_PORT=3001
DATABASE_URL=postgresql://test:test@localhost:5432/test
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=test
```

---

## 🌾 Agricultural Consciousness in E2E Tests

### Seasonal Testing

```typescript
test.describe("Seasonal Product Display", () => {
  test("should show spring products in spring", async ({ page }) => {
    // Set seasonal context
    await page.addInitScript(() => {
      window.localStorage.setItem("testSeason", "SPRING");
    });

    await page.goto("/products");

    await expect(page.locator('[data-season="SPRING"]')).toBeVisible();
    await expect(page.locator('[data-season="WINTER"]')).not.toBeVisible();
  });
});
```

### Farm-to-Table Flow

```typescript
test.describe("Complete Farm-to-Table Journey", () => {
  test("should complete full agricultural workflow", async ({ page }) => {
    // 1. Discover farm
    await page.goto("/");
    await page.click('[data-testid="farm-card"]:first-child');

    // 2. Browse products
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();

    // 3. Check biodynamic certification
    await expect(page.locator('[data-testid="bio-cert"]')).toBeVisible();

    // 4. Add seasonal product to cart
    await page.click('[data-season="current"] [data-testid="add-to-cart"]');

    // 5. Complete purchase
    await page.click('[data-testid="checkout"]');
    await page.fill('[name="delivery-address"]', "123 Farm Road");
    await page.click('[data-testid="place-order"]');

    // 6. Verify order with agricultural consciousness
    await expect(page.locator('[data-testid="order-success"]')).toContainText(
      "agricultural",
    );
  });
});
```

---

## 📚 Resources

### Official Documentation

- [Playwright Docs](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)

### Project Documentation

- [Testing Quick Reference](./TESTING_QUICK_REFERENCE.md)
- [Test Fixes Documentation](./TEST_FIXES_DOCUMENTATION.md)
- [Divine Testing Instructions](.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md)

---

## 🎉 Summary

### Quick Commands

```bash
# Kill any running dev servers (if port conflict)
npm run kill-server

# Check if server is running and run tests
npm run test:e2e

# Interactive mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View report
npx playwright show-report
```

### Common Issues

1. **Port in use** → Run `npm run kill-server` or use different port
2. **Server not starting** → Check build errors, clear cache
3. **Tests timing out** → Increase timeout, check network
4. **Flaky tests** → Add proper waits, use built-in assertions
5. **Browser not launching** → Install Playwright browsers

### Status

✅ E2E testing infrastructure fully configured  
✅ Automatic server checking enabled  
✅ Clear error messages and instructions  
✅ HP OMEN optimization available  
✅ Agricultural consciousness preserved

---

**Last Updated**: January 16, 2025  
**Status**: ✅ FULLY CONFIGURED  
**Divine Level**: MAXIMUM E2E TESTING POWER 🌾🎭

_"Test your crops before harvest, verify your code before deployment."_ 🌾⚡
