/**
 * 🧪 Page Ready Utilities for E2E Tests
 *
 * Provides reliable element-based waits instead of brittle networkIdle.
 * These utilities are optimized for Next.js dev servers and SPAs where
 * network activity never truly reaches an idle state.
 *
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { Page, Locator, expect } from "@playwright/test";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Timeouts for various operations (ms)
 * Tuned for both local development and CI environments
 */
export const TIMEOUTS = {
  /** Navigation between pages */
  navigation: 15000,
  /** Element visibility checks */
  elementVisible: 10000,
  /** Form submission responses */
  formSubmit: 10000,
  /** Stripe iframe/element loading */
  stripeLoad: 15000,
  /** Payment processing (3D Secure, etc.) */
  paymentProcess: 30000,
  /** General page load */
  pageLoad: 20000,
  /** Short wait for UI updates */
  uiUpdate: 2000,
} as const;

/**
 * Common selectors for page readiness detection
 */
export const PAGE_SELECTORS = {
  // Products page
  productsGrid:
    '[data-testid="products-grid"], [data-testid^="product-card-"], .product-card',
  productCard: '[data-testid^="product-card-"], .product-card',
  addToCart:
    '[data-testid="add-to-cart-button"], button:has-text("Add to Cart"), button:has-text("Add"), .add-to-cart-btn',

  // Cart page
  cartContent:
    '[data-testid="cart-page"], [data-testid="cart-content"], [data-testid="empty-cart"], .cart-items',
  cartButton:
    '[data-testid="cart-button"], [aria-label*="cart"], .cart-icon, header a[href="/cart"]',
  checkoutButton:
    '[data-testid="checkout-button"], button:has-text("Proceed to Checkout"), a:has-text("Checkout")',

  // Checkout page
  checkoutPage:
    '[data-testid="checkout-page"], [data-testid="address-step"], [data-testid="checkout-container"], form',
  addressStep:
    '[data-testid="address-step"], [data-testid="shipping-address-section"], [data-testid="new-address-form"]',
  paymentStep:
    '[data-testid="payment-step"], [data-testid="stripe-payment-element"]',

  // Forms
  loginForm: 'input[name="email"], input[type="email"]',
  signupForm: 'input[name="name"], input[name="email"]',

  // Stripe
  stripeIframe: 'iframe[name^="__privateStripeFrame"], iframe[src*="stripe"]',
  stripePaymentElement: '[data-testid="stripe-payment-element"]',

  // Generic
  body: "body",
  mainContent: "main, [role='main'], #__next",
} as const;

// ============================================================================
// CORE WAIT FUNCTIONS
// ============================================================================

/**
 * Wait for page to be ready with element-based wait
 * This is more reliable than networkIdle with Next.js dev servers
 *
 * @param page - Playwright page object
 * @param selector - CSS selector to wait for
 * @param timeout - Optional timeout in ms
 */
export async function waitForPageReady(
  page: Page,
  selector: string,
  timeout: number = TIMEOUTS.elementVisible,
): Promise<void> {
  await page.waitForSelector(selector, {
    state: "visible",
    timeout,
  });
}

/**
 * Wait for any of multiple selectors to be visible
 * Useful when page structure varies (e.g., empty state vs content)
 *
 * @param page - Playwright page object
 * @param selectors - Array of CSS selectors
 * @param timeout - Optional timeout in ms
 */
export async function waitForAnySelector(
  page: Page,
  selectors: string[],
  timeout: number = TIMEOUTS.elementVisible,
): Promise<string> {
  const combinedSelector = selectors.join(", ");
  await page.waitForSelector(combinedSelector, {
    state: "visible",
    timeout,
  });

  // Return which selector matched
  for (const selector of selectors) {
    if (await page.locator(selector).first().isVisible()) {
      return selector;
    }
  }

  return combinedSelector;
}

/**
 * Wait for element to be visible and enabled (ready for interaction)
 *
 * @param locator - Playwright locator
 * @param timeout - Optional timeout in ms
 */
export async function waitForInteractable(
  locator: Locator,
  timeout: number = TIMEOUTS.elementVisible,
): Promise<void> {
  await expect(locator).toBeVisible({ timeout });
  await expect(locator).toBeEnabled({ timeout });
}

/**
 * Navigate to URL and wait for specific element
 * Replaces the pattern: goto + waitForLoadState('networkidle')
 *
 * @param page - Playwright page object
 * @param url - URL to navigate to
 * @param readySelector - Selector indicating page is ready
 * @param timeout - Optional timeout in ms
 */
export async function gotoAndWait(
  page: Page,
  url: string,
  readySelector: string,
  timeout: number = TIMEOUTS.elementVisible,
): Promise<void> {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page, readySelector, timeout);
}

/**
 * Click element and wait for navigation + new page content
 * Replaces the pattern: click + waitForLoadState('networkidle')
 *
 * @param locator - Element to click
 * @param page - Playwright page object
 * @param urlPattern - Regex pattern for expected URL
 * @param readySelector - Selector indicating new page is ready
 * @param timeout - Optional timeout in ms
 */
export async function clickAndNavigate(
  locator: Locator,
  page: Page,
  urlPattern: RegExp,
  readySelector: string,
  timeout: number = TIMEOUTS.navigation,
): Promise<void> {
  await locator.click();
  await page.waitForURL(urlPattern, { timeout });
  await waitForPageReady(page, readySelector, TIMEOUTS.elementVisible);
}

// ============================================================================
// PAGE-SPECIFIC WAIT FUNCTIONS
// ============================================================================

/**
 * Wait for products page to be ready
 */
export async function waitForProductsPage(page: Page): Promise<void> {
  await waitForPageReady(page, PAGE_SELECTORS.productsGrid);
}

/**
 * Wait for product detail page to be ready
 */
export async function waitForProductDetailPage(page: Page): Promise<void> {
  await waitForPageReady(page, PAGE_SELECTORS.addToCart);
}

/**
 * Wait for cart page to be ready
 */
export async function waitForCartPage(page: Page): Promise<void> {
  await waitForPageReady(page, PAGE_SELECTORS.cartContent);
}

/**
 * Wait for checkout page to be ready
 */
export async function waitForCheckoutPage(page: Page): Promise<void> {
  await waitForPageReady(page, PAGE_SELECTORS.checkoutPage);
}

/**
 * Wait for login form to be ready
 */
export async function waitForLoginForm(page: Page): Promise<void> {
  await waitForPageReady(page, PAGE_SELECTORS.loginForm);
}

/**
 * Wait for signup form to be ready
 */
export async function waitForSignupForm(page: Page): Promise<void> {
  await waitForPageReady(page, PAGE_SELECTORS.signupForm);
}

/**
 * Wait for Stripe payment element to load
 */
export async function waitForStripeElement(page: Page): Promise<void> {
  await waitForAnySelector(
    page,
    [PAGE_SELECTORS.stripeIframe, PAGE_SELECTORS.stripePaymentElement],
    TIMEOUTS.stripeLoad,
  );
}

// ============================================================================
// FORM INTERACTION HELPERS
// ============================================================================

/**
 * Fill form field and verify value
 *
 * @param page - Playwright page object
 * @param selector - Input selector
 * @param value - Value to fill
 */
export async function fillAndVerify(
  page: Page,
  selector: string,
  value: string,
): Promise<void> {
  const input = page.locator(selector).first();
  await input.fill(value);
  await expect(input).toHaveValue(value);
}

/**
 * Submit form and wait for response (URL change or error message)
 *
 * @param page - Playwright page object
 * @param submitSelector - Submit button selector
 * @param successUrlPattern - URL pattern on success
 * @param errorSelector - Error message selector
 * @param timeout - Optional timeout in ms
 */
export async function submitFormAndWait(
  page: Page,
  submitSelector: string,
  successUrlPattern: RegExp,
  errorSelector?: string,
  timeout: number = TIMEOUTS.formSubmit,
): Promise<{ success: boolean; error?: string }> {
  const submitButton = page.locator(submitSelector).first();
  await submitButton.click();

  try {
    await page.waitForURL(successUrlPattern, { timeout });
    return { success: true };
  } catch {
    if (errorSelector) {
      const errorElement = page.locator(errorSelector);
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        return { success: false, error: errorText || "Unknown error" };
      }
    }
    return { success: false, error: "Navigation timeout" };
  }
}

// ============================================================================
// CART HELPERS
// ============================================================================

/**
 * Wait for cart to update after adding item
 */
export async function waitForCartUpdate(
  page: Page,
  timeout: number = TIMEOUTS.uiUpdate,
): Promise<void> {
  // Wait for cart badge/count to update or cart notification
  const cartUpdateIndicators = [
    '[data-testid="cart-count"]',
    '[data-testid="cart-badge"]',
    '[data-testid="toast-success"]',
    ".cart-updated",
  ];

  try {
    await waitForAnySelector(page, cartUpdateIndicators, timeout);
  } catch {
    // If no visual indicator, just wait briefly for state to update
    await page.waitForTimeout(1000);
  }
}

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

/**
 * Wait for error message to appear
 */
export async function waitForErrorMessage(
  page: Page,
  errorPattern?: RegExp,
  timeout: number = TIMEOUTS.elementVisible,
): Promise<string | null> {
  const errorSelectors = [
    '[data-testid="error-message"]',
    '[role="alert"]',
    ".error-message",
    ".form-error",
    "text=/error|failed|invalid/i",
  ];

  try {
    await waitForAnySelector(page, errorSelectors, timeout);
    const errorElement = page.locator(errorSelectors.join(", ")).first();
    const text = await errorElement.textContent();

    if (errorPattern && text && !errorPattern.test(text)) {
      return null;
    }

    return text;
  } catch {
    return null;
  }
}

/**
 * Wait for success message/notification
 */
export async function waitForSuccessMessage(
  page: Page,
  timeout: number = TIMEOUTS.elementVisible,
): Promise<string | null> {
  const successSelectors = [
    '[data-testid="success-message"]',
    '[data-testid="toast-success"]',
    ".success-message",
    ".toast-success",
  ];

  try {
    await waitForAnySelector(page, successSelectors, timeout);
    const successElement = page.locator(successSelectors.join(", ")).first();
    return await successElement.textContent();
  } catch {
    return null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Configuration
  TIMEOUTS,
  PAGE_SELECTORS,

  // Core functions
  waitForPageReady,
  waitForAnySelector,
  waitForInteractable,
  gotoAndWait,
  clickAndNavigate,

  // Page-specific
  waitForProductsPage,
  waitForProductDetailPage,
  waitForCartPage,
  waitForCheckoutPage,
  waitForLoginForm,
  waitForSignupForm,
  waitForStripeElement,

  // Form helpers
  fillAndVerify,
  submitFormAndWait,

  // Cart helpers
  waitForCartUpdate,

  // Error handling
  waitForErrorMessage,
  waitForSuccessMessage,
};
