# 🧪 E2E Test Helpers

This directory contains reusable helper modules for Playwright E2E tests in the Farmers Market Platform.

## Overview

These helpers are designed to make E2E tests more **reliable**, **maintainable**, and **deterministic** by providing:

- Element-based waits instead of brittle `networkidle` waits
- Centralized timeout configuration
- Reusable authentication utilities
- Common page interaction patterns

---

## 📁 Files

| File            | Description                                           |
| --------------- | ----------------------------------------------------- |
| `page-ready.ts` | Element-based wait utilities (replaces `networkidle`) |
| `auth.ts`       | Authentication helpers for different user roles       |

---

## 🚀 page-ready.ts

### Why Element-Based Waits?

The `waitForLoadState("networkidle")` method is **brittle** for modern web applications, especially:

- **Next.js apps** with HMR (Hot Module Replacement)
- **SPAs** with websocket connections
- **Apps with polling** or background API calls
- **Apps using analytics** or tracking scripts

These applications never truly reach a "network idle" state, causing intermittent test failures and timeouts.

**Solution**: Wait for specific elements that indicate the page is ready for interaction.

### Configuration

```typescript
import { TIMEOUTS, PAGE_SELECTORS } from "../helpers/page-ready";

// Available timeouts (in milliseconds)
TIMEOUTS.navigation; // 15000 - Page navigation
TIMEOUTS.elementVisible; // 10000 - Element visibility
TIMEOUTS.formSubmit; // 10000 - Form submission
TIMEOUTS.stripeLoad; // 15000 - Stripe iframe loading
TIMEOUTS.paymentProcess; // 30000 - Payment processing (3D Secure)
TIMEOUTS.pageLoad; // 20000 - General page load
TIMEOUTS.uiUpdate; // 2000  - UI state updates
```

### Core Functions

#### `waitForPageReady(page, selector, timeout?)`

Wait for a specific element to be visible before proceeding.

```typescript
import { waitForPageReady } from "../helpers/page-ready";

// Wait for login form
await waitForPageReady(page, 'input[name="email"]');

// With custom timeout
await waitForPageReady(page, '[data-testid="products-grid"]', 20000);
```

#### `waitForAnySelector(page, selectors, timeout?)`

Wait for any one of multiple selectors (useful for pages with variable content).

```typescript
import { waitForAnySelector } from "../helpers/page-ready";

// Wait for either products or empty state
const matched = await waitForAnySelector(page, [
  '[data-testid="products-grid"]',
  '[data-testid="empty-state"]',
]);
console.log(`Matched selector: ${matched}`);
```

#### `waitForInteractable(locator, timeout?)`

Wait for an element to be both visible AND enabled.

```typescript
import { waitForInteractable } from "../helpers/page-ready";

const submitButton = page.locator('button[type="submit"]');
await waitForInteractable(submitButton);
await submitButton.click();
```

#### `gotoAndWait(page, url, readySelector, timeout?)`

Navigate to a URL and wait for a specific element. **Replaces the pattern:**

```typescript
// ❌ OLD (brittle)
await page.goto("/products");
await page.waitForLoadState("networkidle");

// ✅ NEW (deterministic)
import { gotoAndWait } from "../helpers/page-ready";
await gotoAndWait(page, "/products", '[data-testid="products-grid"]');
```

#### `clickAndNavigate(locator, page, urlPattern, readySelector, timeout?)`

Click an element and wait for navigation + new page content.

```typescript
import { clickAndNavigate } from "../helpers/page-ready";

const productCard = page.locator('[data-testid="product-card"]').first();
await clickAndNavigate(
  productCard,
  page,
  /\/products\/[\w-]+/, // URL pattern
  '[data-testid="product-detail"]', // Ready selector
);
```

### Page-Specific Helpers

Pre-configured wait functions for common pages:

```typescript
import {
  waitForProductsPage,
  waitForProductDetailPage,
  waitForCartPage,
  waitForCheckoutPage,
  waitForLoginForm,
  waitForSignupForm,
  waitForStripeElement,
} from "../helpers/page-ready";

// Usage
await page.goto("/products");
await waitForProductsPage(page);

await page.goto("/cart");
await waitForCartPage(page);

await page.goto("/checkout");
await waitForCheckoutPage(page);
await waitForStripeElement(page); // Wait for Stripe iframe
```

### Form Helpers

#### `fillAndVerify(page, selector, value)`

Fill an input and verify the value was set correctly.

```typescript
import { fillAndVerify } from "../helpers/page-ready";

await fillAndVerify(page, 'input[name="email"]', "test@example.com");
```

#### `submitFormAndWait(page, submitSelector, successUrlPattern, errorSelector?, timeout?)`

Submit a form and wait for either success (URL change) or error message.

```typescript
import { submitFormAndWait } from "../helpers/page-ready";

const result = await submitFormAndWait(
  page,
  'button[type="submit"]',
  /\/dashboard/,
  '[data-testid="error-message"]',
);

if (result.success) {
  console.log("Form submitted successfully");
} else {
  console.log(`Form error: ${result.error}`);
}
```

### Cart Helpers

#### `waitForCartUpdate(page, timeout?)`

Wait for cart to update after adding/removing items.

```typescript
import { waitForCartUpdate } from "../helpers/page-ready";

await page.click('[data-testid="add-to-cart"]');
await waitForCartUpdate(page);
```

### Error/Success Message Helpers

```typescript
import {
  waitForErrorMessage,
  waitForSuccessMessage,
} from "../helpers/page-ready";

// Wait for error message
const error = await waitForErrorMessage(page, /invalid email/i);
if (error) {
  console.log(`Error displayed: ${error}`);
}

// Wait for success message
const success = await waitForSuccessMessage(page);
if (success) {
  console.log(`Success: ${success}`);
}
```

---

## 🔐 auth.ts

### Test Users

Pre-configured test user credentials:

```typescript
import { TEST_USERS } from "../helpers/auth";

TEST_USERS.admin; // { email, password, role: "ADMIN" }
TEST_USERS.farmer; // { email, password, role: "FARMER" }
TEST_USERS.customer; // { email, password, role: "CONSUMER" }
```

### Login Functions

```typescript
import {
  loginAsAdmin,
  loginAsFarmer,
  loginAsCustomer,
  login,
} from "../helpers/auth";

// Role-specific login
await loginAsAdmin(page);
await loginAsFarmer(page);
await loginAsCustomer(page);

// Generic login with custom credentials
await login(page, {
  email: "custom@example.com",
  password: "password123",
  role: "CONSUMER",
});
```

### Session Management

```typescript
import {
  logout,
  isAuthenticated,
  ensureLoggedIn,
  loginAndNavigate,
} from "../helpers/auth";

// Check if user is logged in
const loggedIn = await isAuthenticated(page);

// Ensure logged in (login if needed)
await ensureLoggedIn(page, "customer");

// Login and go to specific page
await loginAndNavigate(page, "farmer", "/farmer/dashboard");

// Logout
await logout(page);
```

### Storage State (Faster Tests)

For faster test execution, use saved authentication state:

```typescript
import { setupAuthContext, getAuthStoragePath } from "../helpers/auth";

// In setup: Save auth state
await setupAuthContext(context, "admin");

// In test: Use saved state
test.use({ storageState: getAuthStoragePath("admin") });
```

---

## 📋 Best Practices

### 1. Always Use Element-Based Waits

```typescript
// ❌ DON'T
await page.goto("/products");
await page.waitForLoadState("networkidle");

// ✅ DO
await page.goto("/products", { waitUntil: "domcontentloaded" });
await waitForPageReady(page, '[data-testid="products-grid"]');
```

### 2. Use data-testid Attributes

Prefer `data-testid` selectors over CSS classes or text content:

```typescript
// ❌ Fragile
await page.click(".btn-primary");
await page.click("text=Add to Cart");

// ✅ Robust
await page.click('[data-testid="add-to-cart-button"]');
```

### 3. Handle Variable Page States

```typescript
// Page might show products OR empty state
const state = await waitForAnySelector(page, [
  '[data-testid="products-grid"]',
  '[data-testid="empty-state"]',
]);

if (state.includes("empty")) {
  test.skip("No products available");
}
```

### 4. Use Appropriate Timeouts

```typescript
// Fast UI updates
await waitForCartUpdate(page); // Uses TIMEOUTS.uiUpdate (2s)

// Slow external services
await waitForStripeElement(page); // Uses TIMEOUTS.stripeLoad (15s)

// Custom timeout for specific needs
await waitForPageReady(page, selector, 30000);
```

### 5. Combine Helpers for Complex Flows

```typescript
import {
  gotoAndWait,
  waitForInteractable,
  waitForCartUpdate,
} from "../helpers/page-ready";
import { loginAsCustomer } from "../helpers/auth";

test("complete purchase flow", async ({ page }) => {
  await loginAsCustomer(page);

  await gotoAndWait(page, "/products", '[data-testid="products-grid"]');

  const addButton = page.locator('[data-testid="add-to-cart"]').first();
  await waitForInteractable(addButton);
  await addButton.click();
  await waitForCartUpdate(page);

  // Continue with checkout...
});
```

---

## 🔧 Customization

### Adding New Page Selectors

Edit `PAGE_SELECTORS` in `page-ready.ts`:

```typescript
export const PAGE_SELECTORS = {
  // Existing selectors...

  // Add your custom selectors
  myNewPage: '[data-testid="my-new-page"], .my-new-page-class',
  myNewComponent: '[data-testid="my-component"]',
} as const;
```

### Creating Custom Page Wait Functions

```typescript
// In page-ready.ts
export async function waitForMyNewPage(page: Page): Promise<void> {
  await waitForPageReady(page, PAGE_SELECTORS.myNewPage);
}
```

### Adjusting Timeouts for CI

```typescript
// In your test or config
const TIMEOUTS = {
  ...defaultTimeouts,
  navigation: process.env.CI ? 30000 : 15000,
  elementVisible: process.env.CI ? 20000 : 10000,
};
```

---

## 📚 References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- Project Divine Instructions: `.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md`

---

## 🆘 Troubleshooting

### Test Times Out Waiting for Element

1. **Check the selector** - Use Playwright Inspector to verify: `npx playwright test --debug`
2. **Increase timeout** - Pass a longer timeout to the wait function
3. **Add fallback selectors** - Use `waitForAnySelector` with multiple options
4. **Check if element exists** - The page might not render the expected element

### Element Not Interactable

```typescript
// Use waitForInteractable instead of just visibility
const button = page.locator("button");
await waitForInteractable(button);
await button.click();
```

### Authentication Issues

1. **Check test database** - Ensure test users are seeded
2. **Check credentials** - Verify `TEST_USERS` matches seeded data
3. **Check redirect** - Login might redirect to unexpected URL

### Stripe Elements Not Loading

```typescript
// Use dedicated Stripe wait with longer timeout
await waitForStripeElement(page);

// Or with custom timeout
await waitForAnySelector(
  page,
  [
    'iframe[name^="__privateStripeFrame"]',
    '[data-testid="stripe-payment-element"]',
  ],
  30000,
);
```
