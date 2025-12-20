# 📋 E2E Testing Cheatsheet - Farmers Market Platform

## 🚀 Quick Commands

### Run Tests

```bash
# All Phase 1 tests
npx playwright test tests/e2e/farmer/ tests/e2e/admin/

# Specific file
npx playwright test tests/e2e/farmer/analytics.spec.ts

# With UI (recommended)
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Headed mode (see browser)
npx playwright test --headed

# Specific test by name
npx playwright test -g "sales dashboard"
```

### Reports & Debugging

```bash
# View HTML report
npx playwright show-report

# Generate trace
npx playwright test --trace on

# Take screenshots on failure
npx playwright test --screenshot only-on-failure

# Record video
npx playwright test --video retain-on-failure
```

### Setup Commands

```bash
# Generate auth states (run once)
npx playwright test tests/e2e/auth.setup.ts

# Install browsers
npx playwright install

# Update Playwright
npm install -D @playwright/test@latest
```

---

## 📂 Test File Locations

```
tests/e2e/
├── auth.setup.ts              # Auth state generation
├── farmer/                    # ✅ 54 tests
│   ├── analytics.spec.ts     # 26 tests - Sales & performance
│   └── finances.spec.ts      # 28 tests - Revenue & payouts
├── admin/                     # ✅ 61 tests
│   ├── financial-reports.spec.ts  # 29 tests - Platform financials
│   └── user-management.spec.ts    # 32 tests - User CRUD
├── customer/                  # 🔜 Phase 2
├── public/                    # 📅 Phase 3
└── marketplace/               # 📅 Phase 4
```

---

## 🎯 Test Template

```typescript
/**
 * 🌾 Feature Name E2E Tests
 * Divine Quantum Testing with Agricultural Consciousness
 */

import { test, expect, type Page } from "@playwright/test";

// ✅ Use authenticated state
test.use({ storageState: ".auth/farmer.json" });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const TIMEOUTS = {
  navigation: 30000,
  elementVisible: 10000,
};

// Helper function
async function navigateToPage(page: Page) {
  await page.goto(`${BASE_URL}/path`, {
    waitUntil: "networkidle",
    timeout: TIMEOUTS.navigation,
  });
  await expect(page).toHaveURL(/\/path/);
}

// Test group
test.describe("🌾 Feature Group", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPage(page);
  });

  test("should perform action", async ({ page }) => {
    // Arrange
    const element = page.locator("button").filter({ hasText: /save/i });

    // Act
    await element.click();

    // Assert
    await expect(page.locator(".success")).toBeVisible();
  });
});
```

---

## 🔧 Common Patterns

### Navigation

```typescript
await page.goto(`${BASE_URL}/path`);
await expect(page).toHaveURL(/\/path/);
await page.waitForLoadState("networkidle");
```

### Element Selection

```typescript
// By test ID
page.locator('[data-testid="save-button"]');

// By text (flexible)
page.locator("button").filter({ hasText: /save|submit/i });

// By role
page.getByRole("button", { name: /save/i });

// First/last
page.locator("button").first();
page.locator("button").last();
```

### Waiting

```typescript
// Wait for element
await page.waitForSelector(".element", { timeout: 5000 });

// Wait for network
await page.waitForLoadState("networkidle");

// Wait for specific time (use sparingly)
await page.waitForTimeout(1000);

// Wait for function
await page.waitForFunction(() => document.querySelectorAll(".item").length > 0);
```

### Graceful Error Handling

```typescript
// Check if element exists before interacting
if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
  await element.click();
}

// Try-catch for optional interactions
try {
  await page.locator(".optional").click();
} catch (error) {
  console.log("Optional element not found");
}
```

### Forms

```typescript
// Fill input
await page.locator('input[name="email"]').fill("test@example.com");

// Select dropdown
await page.locator('select[name="role"]').selectOption("FARMER");

// Check checkbox
await page.locator('input[type="checkbox"]').check();

// Upload file
await page.locator('input[type="file"]').setInputFiles("path/to/file.jpg");

// Submit form
await page.locator('button[type="submit"]').click();
```

### Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text content
await expect(element).toContainText(/hello/i);
await expect(element).toHaveText("Hello World");

// Attributes
await expect(element).toHaveAttribute("aria-pressed", "true");
await expect(element).toHaveClass(/active/);

// Counts
await expect(page.locator(".item")).toHaveCount(5);

// URL
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveTitle(/Dashboard/);

// Value
await expect(input).toHaveValue("test@example.com");

// Enabled/Disabled
await expect(button).toBeEnabled();
await expect(button).toBeDisabled();
```

### File Downloads

```typescript
const downloadPromise = page.waitForEvent("download", { timeout: 15000 });

await page
  .locator("button")
  .filter({ hasText: /export/i })
  .click();

const download = await downloadPromise;
expect(download.suggestedFilename()).toMatch(/\.csv$/i);
```

### Modals/Dialogs

```typescript
// Wait for modal
await page.waitForSelector('[role="dialog"]');

// Interact with modal
const modal = page.locator('[role="dialog"]');
await expect(modal).toBeVisible();
await modal.locator("input").fill("value");

// Close modal
await page.keyboard.press("Escape");
// or
await modal.locator("button").filter({ hasText: /close/i }).click();
```

### Responsive Testing

```typescript
test("should display on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${BASE_URL}/path`);
  // Test mobile view
});

test("should display on tablet", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${BASE_URL}/path`);
  // Test tablet view
});
```

---

## 🎨 Divine Patterns

### Agricultural Consciousness

```typescript
/**
 * 🌾 Farmer Analytics E2E Tests
 * Divine Quantum Testing with Agricultural Consciousness
 */
```

### Helper Functions

```typescript
// Navigation helper
async function navigateToAnalytics(page: Page) {
  await page.goto(`${BASE_URL}/farmer/analytics`, {
    waitUntil: "networkidle",
    timeout: TIMEOUTS.navigation,
  });
  await expect(page).toHaveURL(/\/farmer\/analytics/);
}

// Wait helper
async function waitForData(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
}
```

### Robust Element Selection

```typescript
// Multiple selector strategies
const saveButton = page
  .locator("button")
  .filter({ hasText: /save|submit|create/i })
  .first();

// Fallback selection
const element =
  (await page.locator('[data-testid="button"]').count()) > 0
    ? page.locator('[data-testid="button"]')
    : page.locator("button").filter({ hasText: /save/i });
```

### Test Organization

```typescript
test.describe("🌾 Feature Group", () => {
  test.describe("Happy Paths", () => {
    test("should create successfully", async ({ page }) => {});
  });

  test.describe("Error Handling", () => {
    test("should validate required fields", async ({ page }) => {});
  });

  test.describe("Responsive Design", () => {
    test("should display on mobile", async ({ page }) => {});
  });
});
```

---

## 🐛 Debugging Tips

### Add Console Logs

```typescript
console.log("Current URL:", page.url());
const text = await element.textContent();
console.log("Element text:", text);
```

### Take Screenshots

```typescript
await page.screenshot({ path: "debug.png", fullPage: true });
await element.screenshot({ path: "element.png" });
```

### Pause Execution

```typescript
await page.pause(); // Opens Playwright Inspector
```

### View Network Requests

```typescript
page.on("request", (req) => console.log(">>", req.method(), req.url()));
page.on("response", (res) => console.log("<<", res.status(), res.url()));
```

### Check Element State

```typescript
const isVisible = await element.isVisible();
const isEnabled = await element.isEnabled();
const text = await element.textContent();
const count = await page.locator(".item").count();

console.log({ isVisible, isEnabled, text, count });
```

---

## ⚠️ Common Issues & Solutions

### "Element not found"

```typescript
// ❌ Don't
await page.locator(".element").click();

// ✅ Do
await page.waitForSelector(".element", { timeout: 10000 });
await page.locator(".element").click();

// ✅ Or use graceful handling
if (
  await page
    .locator(".element")
    .isVisible({ timeout: 5000 })
    .catch(() => false)
) {
  await page.locator(".element").click();
}
```

### "Timeout waiting for element"

```typescript
// Increase timeout
await page.waitForSelector(".element", { timeout: 30000 });

// Wait for network to settle
await page.waitForLoadState("networkidle");

// Use multiple selectors
const element = page.locator('[data-testid="btn"], button').first();
```

### "Authentication required"

```bash
# Regenerate auth states
npx playwright test tests/e2e/auth.setup.ts

# Verify .auth/ directory exists
ls .auth/
```

### "Tests pass locally but fail in CI"

```typescript
// Use CI-specific timeouts
const TIMEOUTS = {
  navigation: process.env.CI ? 60000 : 30000,
  elementVisible: process.env.CI ? 20000 : 10000,
};

// Add retries for CI
// playwright.config.ts
export default {
  retries: process.env.CI ? 2 : 0,
};
```

---

## 📊 Coverage Checklist

For each feature, ensure tests cover:

- [ ] **Happy Path**: Primary user flow works
- [ ] **Validation**: Form validation and error messages
- [ ] **Empty State**: Handles no data gracefully
- [ ] **Loading State**: Shows loading indicators
- [ ] **Error State**: Handles API errors
- [ ] **Responsive**: Works on mobile, tablet, desktop
- [ ] **Accessibility**: ARIA labels, keyboard navigation
- [ ] **Edge Cases**: Boundary conditions, special characters

---

## 🎯 Test Quality Checklist

Before committing, verify:

- [ ] Test name is descriptive and clear
- [ ] Uses appropriate authentication state
- [ ] Includes helper functions for reusability
- [ ] Has comprehensive assertions
- [ ] Handles optional elements gracefully
- [ ] Includes error scenarios
- [ ] Tests responsive design
- [ ] Documentation/comments where needed
- [ ] Follows divine patterns from `.cursorrules`
- [ ] No hard-coded waits (use `waitForLoadState`)

---

## 📚 Quick Reference Links

### Documentation

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

### Project Docs

- `📊_PHASE_1_E2E_IMPLEMENTATION_COMPLETE.md` - Implementation report
- `PHASE_1_E2E_QUICK_START.md` - Quick start guide
- `🎯_E2E_IMPLEMENTATION_ROADMAP.md` - Full roadmap
- `.cursorrules` - Divine patterns

### Useful Commands

```bash
# Codegen - Record interactions
npx playwright codegen http://localhost:3000

# List browsers
npx playwright list-browsers

# System check
npx playwright install --check

# Clear cache
rm -rf .playwright-cache
```

---

## 🏃 Daily Workflow

1. **Start Dev Server**

   ```bash
   npm run dev
   ```

2. **Run Tests**

   ```bash
   npx playwright test --ui
   ```

3. **Debug Failures**

   ```bash
   npx playwright test [file] --debug
   ```

4. **View Report**

   ```bash
   npx playwright show-report
   ```

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "test: add [feature] E2E tests"
   git push
   ```

---

## 🎉 Test Statistics

### Phase 1 (Complete)

- **Tests**: 115
- **Files**: 4
- **Lines**: 2,755
- **Coverage**: 65% (+20%)

### Coverage by Feature

- Farmer Analytics: 90% ✅
- Farmer Finances: 85% ✅
- Admin Financials: 85% ✅
- Admin Users: 90% ✅

---

**Last Updated**: December 18, 2025  
**Version**: 1.0  
**Status**: ✅ PHASE 1 COMPLETE

_"Test with agricultural consciousness, debug with divine precision."_ 🌾⚡
