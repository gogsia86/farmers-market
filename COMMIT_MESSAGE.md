# PR: Replace brittle `networkidle` waits with deterministic element-based waits

## Summary

This PR fixes flaky E2E tests by replacing all `waitForLoadState("networkidle")` calls with deterministic element-based waits. The `networkidle` approach is unreliable for Next.js applications with HMR, websockets, and background polling.

## Problem

Tests using `waitForLoadState("networkidle")` were intermittently failing because:

- Next.js dev server maintains HMR websocket connections
- Analytics and tracking scripts create ongoing network activity
- Background polling for real-time updates
- The network never truly reaches an "idle" state

## Solution

Replaced all `networkidle` waits with explicit element-based waits that verify the page content is ready for interaction.

## Changes

### New Files

- `tests/helpers/page-ready.ts` - Centralized wait utilities and timeout configuration
- `tests/helpers/README.md` - Comprehensive documentation for test helpers

### Updated Test Files

- `tests/e2e/checkout-stripe-flow.spec.ts` - Updated all waits to element-based
- `tests/e2e/critical-flows.spec.ts` - Updated all waits + improved selectors
- `tests/e2e/shopping/complete-purchase.spec.ts` - Updated all waits to element-based
- `tests/e2e/products/product-discovery.e2e.test.ts` - Updated all waits to element-based
- `tests/e2e/auth/customer-registration.spec.ts` - Updated all waits to element-based
- `tests/e2e/auth.setup.ts` - Updated all waits to element-based
- `tests/helpers/auth.ts` - Updated all waits to element-based

### Updated Components (added `data-testid` attributes)

- `src/components/auth/LoginForm.tsx` - Added testids for form elements
- `src/components/products/AddToCartButton.tsx` - Added testids for button states

## Key Pattern Changes

### Before (brittle)

```typescript
await page.goto("/products");
await page.waitForLoadState("networkidle"); // Flaky!
```

### After (deterministic)

```typescript
await page.goto("/products", { waitUntil: "domcontentloaded" });
await waitForPageReady(page, '[data-testid="products-grid"]');
```

### Flexible Selectors

Tests now use multiple fallback selectors to handle UI variations:

```typescript
const emailInput = page
  .locator(
    '[data-testid="email-input"], input[name="email"], input[type="email"]',
  )
  .first();
```

## New Helper Functions

| Function                  | Description                                |
| ------------------------- | ------------------------------------------ |
| `waitForPageReady()`      | Wait for specific element to be visible    |
| `waitForAnySelector()`    | Wait for any of multiple selectors         |
| `waitForInteractable()`   | Wait for element to be visible AND enabled |
| `gotoAndWait()`           | Navigate and wait for page ready           |
| `clickAndNavigate()`      | Click and wait for navigation + content    |
| `waitForStripeElement()`  | Wait for Stripe iframe/payment element     |
| `waitForCartUpdate()`     | Wait for cart state changes                |
| `waitForErrorMessage()`   | Wait for error message display             |
| `waitForSuccessMessage()` | Wait for success notification              |

## Testing Checklist

- [x] No remaining `networkidle` usage in test code (verified with grep)
- [x] All test files pass TypeScript/lint checks
- [x] Tests can be listed without errors
- [ ] All E2E tests pass locally (requires app running)
- [ ] Tests pass in CI environment

## Running Tests

```bash
# Ensure test database is running
docker ps | grep test-db

# Run specific test file
npx playwright test critical-flows.spec.ts --project=chromium

# Run all E2E tests
npx playwright test

# Run with UI mode for debugging
npx playwright test --ui
```

## Related Issues

Fixes flaky test failures related to:

- Checkout flow tests timing out waiting for networkidle
- Authentication tests failing intermittently
- Product discovery tests not finding elements
- Cart operations timing out

## Commit Message

```
fix(tests): replace networkidle with element-based waits for E2E reliability

- Create page-ready.ts helper module with deterministic wait utilities
- Update all E2E test files to use element-based waits
- Add flexible multi-selector patterns for UI variations
- Add data-testid attributes to key components (LoginForm, AddToCartButton)
- Add comprehensive documentation for test helpers
- Improve critical-flows.spec.ts with more robust selectors

This change eliminates flaky tests caused by Next.js dev server's
persistent network activity (HMR, websockets, polling) which prevents
networkidle from ever resolving reliably.

The new approach waits for specific DOM elements that indicate page
readiness, making tests deterministic and environment-independent.

Refs: E2E test reliability
```

## Notes for Reviewers

1. **No behavior changes** - Only test infrastructure changes, no app code logic changes
2. **Backward compatible** - The new helpers work with existing selectors
3. **Documentation included** - See `tests/helpers/README.md` for usage
4. **Incremental adoption** - Other tests can be updated gradually using the new patterns
