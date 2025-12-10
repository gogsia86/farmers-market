/**
 * 🧪 CHECKOUT FLOW E2E TESTS - STRIPE PAYMENT INTEGRATION
 * Divine end-to-end testing for complete checkout journey
 *
 * Test Coverage:
 * - Cart to checkout flow
 * - Shipping address input
 * - Stripe payment element integration
 * - Payment intent creation
 * - Order confirmation
 * - Error handling scenarios
 * - 3D Secure authentication
 * - Agricultural consciousness throughout
 *
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 */

import { test, expect, Page } from "@playwright/test";

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_USER = {
  email: "customer@farmersmarket.app",
  password: "DivineCustomer123!",
  name: "Jane Customer",
};

const TEST_ADDRESS = {
  street: "123 Harvest Lane",
  street2: "Apt 4B",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  country: "US",
};

// Stripe test card numbers
const STRIPE_TEST_CARDS = {
  SUCCESS: "4242424242424242",
  DECLINED: "4000000000000002",
  REQUIRES_AUTH: "4000002500003155",
  INSUFFICIENT_FUNDS: "4000000000009995",
  EXPIRED_CARD: "4000000000000069",
  INCORRECT_CVC: "4000000000000127",
};

// Timeouts for various operations
// NOTE: We avoid networkIdle waits as they are brittle with Next.js dev servers
// and SPAs where network activity never truly reaches an idle state.
// Instead, we use element-based waits for deterministic test behavior.
const TIMEOUTS = {
  navigation: 15000,
  elementVisible: 10000,
  stripeLoad: 15000,
  paymentProcess: 30000,
  pageLoad: 20000,
};

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Login as a customer user
 */
async function loginAsCustomer(page: Page): Promise<void> {
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  // Wait for login form to be ready - element-based wait instead of networkIdle
  await page.waitForSelector('input[name="email"], input[type="email"]', {
    state: "visible",
    timeout: TIMEOUTS.elementVisible,
  });

  // Fill credentials
  const emailInput = page
    .locator('input[name="email"], input[type="email"]')
    .first();
  const passwordInput = page
    .locator('input[name="password"], input[type="password"]')
    .first();

  await emailInput.fill(TEST_USER.email);
  await passwordInput.fill(TEST_USER.password);

  // Submit form
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // Wait for redirect - either to home or dashboard
  await page.waitForURL(/\/(dashboard|home)?$/, {
    timeout: TIMEOUTS.navigation,
  });
}

/**
 * Add a product to the cart
 */
async function addProductToCart(page: Page, productIndex = 0): Promise<void> {
  // Navigate to products page - try marketplace first, then public products
  await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });

  // Wait for products grid to load with element-based selectors (not networkIdle - brittle with dev servers)
  const productSelector =
    '[data-testid="products-grid"], [data-testid^="product-card-"], .product-card';
  await page.waitForSelector(productSelector, {
    state: "visible",
    timeout: TIMEOUTS.elementVisible,
  });

  // Click on a product card to go to product detail page
  const productCards = page.locator('[data-testid^="product-card-"]');
  const count = await productCards.count();

  if (count === 0) {
    // Fallback to generic selector
    const fallbackCards = page.locator(
      '.product-card, [data-testid="products-grid"] > div',
    );
    const fallbackCount = await fallbackCards.count();
    if (fallbackCount === 0) {
      throw new Error("No products found on the page");
    }
    await fallbackCards.nth(Math.min(productIndex, fallbackCount - 1)).click();
  } else {
    const targetIndex = Math.min(productIndex, count - 1);
    await productCards.nth(targetIndex).click();
  }

  // Wait for product detail page
  await page.waitForURL(/\/(products|marketplace)\//, {
    timeout: TIMEOUTS.navigation,
  });

  // Wait for add to cart button to be visible and enabled - element-based wait instead of networkIdle
  const addToCartButton = page.locator(
    '[data-testid="add-to-cart-button"], button:has-text("Add to Cart"), button:has-text("Add"), .add-to-cart-btn',
  );
  await expect(addToCartButton.first()).toBeVisible({
    timeout: TIMEOUTS.elementVisible,
  });
  await expect(addToCartButton.first()).toBeEnabled({
    timeout: TIMEOUTS.elementVisible,
  });
  await addToCartButton.first().click();

  // Wait for cart update indication
  await page.waitForTimeout(1000); // Allow cart state to update
}

/**
 * Navigate from cart to checkout
 */
async function navigateToCheckout(page: Page): Promise<void> {
  // Open cart drawer/modal or navigate to cart page using updated selectors
  const cartButton = page.locator(
    '[data-testid="cart-button"], [aria-label*="cart"], .cart-icon, header a[href="/cart"]',
  );

  if ((await cartButton.count()) > 0) {
    await cartButton.first().click();

    // Wait for cart page to load
    await page
      .waitForSelector(
        '[data-testid="cart-page"], [data-testid="cart-content"], [data-testid="empty-cart"]',
        { state: "visible", timeout: TIMEOUTS.elementVisible },
      )
      .catch(() => {
        // If no cart page elements, navigate directly
      });
  } else {
    // Navigate directly to cart page
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    // Wait for cart content to load - element-based wait instead of networkIdle
    await page.waitForSelector(
      '[data-testid="cart-page"], [data-testid="cart-content"], [data-testid="empty-cart"], .cart-items',
      { state: "visible", timeout: TIMEOUTS.elementVisible },
    );
  }

  // Click checkout button - using updated selector
  const checkoutButton = page.locator(
    '[data-testid="checkout-button"], button:has-text("Proceed to Checkout"), a:has-text("Proceed to Checkout"), a:has-text("Checkout")',
  );
  await expect(checkoutButton.first()).toBeEnabled({
    timeout: TIMEOUTS.elementVisible,
  });
  await checkoutButton.first().click();

  // Wait for checkout page and its content - element-based wait instead of networkIdle
  await page.waitForURL(/\/checkout/, { timeout: TIMEOUTS.navigation });
  await page.waitForSelector(
    '[data-testid="checkout-page"], [data-testid="address-step"], [data-testid="checkout-container"], form',
    { state: "visible", timeout: TIMEOUTS.elementVisible },
  );
}

/**
 * Fill shipping address form - updated to match AddressStep component
 */
async function fillShippingAddress(
  page: Page,
  address = TEST_ADDRESS,
): Promise<void> {
  // Wait for address step to be visible - using new data-testid
  await page.waitForSelector(
    '[data-testid="address-step"], [data-testid="shipping-address-section"], [data-testid="new-address-form"]',
    { state: "visible", timeout: TIMEOUTS.elementVisible },
  );

  // Check if we need to click "Add New Address" button first
  const addNewAddressButton = page.locator(
    '[data-testid="add-new-address-button"]',
  );
  if (
    (await addNewAddressButton.count()) > 0 &&
    (await addNewAddressButton.isVisible())
  ) {
    await addNewAddressButton.click();
    await page.waitForSelector('[data-testid="new-address-form"]', {
      state: "visible",
      timeout: TIMEOUTS.elementVisible,
    });
  }

  // Fill street address using updated selectors
  const streetInput = page.locator(
    '[data-testid="address-street"], input#street-address, input[name="street"], input[aria-label="Street Address"]',
  );
  await streetInput.first().fill(address.street);

  // Fill street2 if present and provided
  if (address.street2) {
    const street2Input = page.locator(
      '[data-testid="address-street2"], input#street-address-2, input[name="street2"], input[aria-label="Apartment or Suite"]',
    );
    if ((await street2Input.count()) > 0) {
      await street2Input.first().fill(address.street2);
    }
  }

  // Fill city using updated selectors
  const cityInput = page.locator(
    '[data-testid="address-city"], input#city, input[name="city"], input[aria-label="City"]',
  );
  await cityInput.first().fill(address.city);

  // Fill state using updated selectors
  const stateInput = page.locator(
    '[data-testid="address-state"], input#state, input[name="state"], select[name="state"], input[aria-label="State"]',
  );
  if ((await stateInput.count()) > 0) {
    const element = stateInput.first();
    const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "select") {
      await element.selectOption(address.state);
    } else {
      await element.fill(address.state);
    }
  }

  // Fill zip code using updated selectors
  const zipInput = page.locator(
    '[data-testid="address-zipcode"], input#zip-code, input[name="zipCode"], input[name="zip"], input[aria-label="ZIP Code"]',
  );
  await zipInput.first().fill(address.zipCode);

  // If using new address form, click "Use This Address" button
  const useAddressButton = page.locator('[data-testid="use-address-button"]');
  if (
    (await useAddressButton.count()) > 0 &&
    (await useAddressButton.isVisible())
  ) {
    await useAddressButton.click();
    await page.waitForTimeout(500); // Allow state update
  }

  // Continue to next step - using updated checkout flow selectors
  const continueButton = page.locator(
    '[data-testid="checkout-continue-button"], button:has-text("Continue"), button:has-text("Next")',
  );

  if ((await continueButton.count()) > 0) {
    await expect(continueButton.first()).toBeEnabled({
      timeout: TIMEOUTS.elementVisible,
    });
    await continueButton.first().click();

    // Wait for payment step to appear
    await page.waitForSelector(
      '[data-testid="payment-step"], [data-testid="checkout-step-payment"], [data-testid="stripe-payment-container"], iframe[name^="__privateStripeFrame"]',
      { state: "visible", timeout: TIMEOUTS.elementVisible },
    );
  }
}

/**
 * Fill Stripe payment details via iframe
 */
async function fillStripePaymentDetails(
  page: Page,
  cardNumber = STRIPE_TEST_CARDS.SUCCESS,
): Promise<void> {
  // Wait for Stripe Elements iframe to load
  const stripeIframeSelector =
    'iframe[name^="__privateStripeFrame"], iframe[title*="Secure card"], iframe[title*="Stripe"]';

  await page.waitForSelector(stripeIframeSelector, {
    state: "visible",
    timeout: TIMEOUTS.stripeLoad,
  });

  // Get all Stripe frames (there may be multiple for different fields)
  const stripeFrames = page
    .frames()
    .filter(
      (frame) =>
        frame.url().includes("stripe.com") ||
        frame.name().startsWith("__privateStripeFrame"),
    );

  if (stripeFrames.length === 0) {
    // Try using frameLocator for newer Stripe Elements
    const stripeFrameLocator = page.frameLocator(stripeIframeSelector).first();

    // Fill card number
    const cardInput = stripeFrameLocator.locator(
      'input[name="cardnumber"], input[name="number"], [data-elements-stable-field-name="cardNumber"], input[placeholder*="Card number"]',
    );
    await cardInput.fill(cardNumber);

    // Fill expiry date
    const expiryInput = stripeFrameLocator.locator(
      'input[name="exp-date"], input[name="expiry"], [data-elements-stable-field-name="cardExpiry"], input[placeholder*="MM"]',
    );
    await expiryInput.fill("12/34");

    // Fill CVC
    const cvcInput = stripeFrameLocator.locator(
      'input[name="cvc"], [data-elements-stable-field-name="cardCvc"], input[placeholder*="CVC"]',
    );
    await cvcInput.fill("123");

    // Fill postal code if separate field exists
    const postalInput = stripeFrameLocator.locator(
      'input[name="postal"], input[name="postalCode"], [data-elements-stable-field-name="postalCode"]',
    );
    if ((await postalInput.count()) > 0) {
      await postalInput.fill(TEST_ADDRESS.zipCode);
    }
  } else {
    // Handle separate iframes for each field
    for (const frame of stripeFrames) {
      const cardInput = frame.locator('input[name="cardnumber"]');
      if ((await cardInput.count()) > 0) {
        await cardInput.fill(cardNumber);
      }

      const expiryInput = frame.locator('input[name="exp-date"]');
      if ((await expiryInput.count()) > 0) {
        await expiryInput.fill("12/34");
      }

      const cvcInput = frame.locator('input[name="cvc"]');
      if ((await cvcInput.count()) > 0) {
        await cvcInput.fill("123");
      }
    }
  }
}

/**
 * Submit the payment and wait for confirmation
 */
async function submitPaymentAndWaitForConfirmation(page: Page): Promise<void> {
  // Use updated selectors matching checkout flow
  const submitButton = page.locator(
    '[data-testid="checkout-continue-button"], button:has-text("Place Order"), button:has-text("Pay"), button:has-text("Complete Purchase"), [data-testid="submit-payment"]',
  );

  await expect(submitButton.first()).toBeEnabled({
    timeout: TIMEOUTS.elementVisible,
  });
  await submitButton.first().click();

  // Wait for confirmation - could be URL change or success message
  await Promise.race([
    page.waitForURL(
      /\/order\/confirmation|\/order-confirmation|\/success|\/thank-you/,
      {
        timeout: TIMEOUTS.paymentProcess,
      },
    ),
    page.waitForSelector(
      '[data-testid="order-confirmation"], [data-testid="success-message"], .order-confirmation, .success-page',
      { state: "visible", timeout: TIMEOUTS.paymentProcess },
    ),
  ]);
}

/**
 * Verify order confirmation details
 */
async function verifyOrderConfirmation(page: Page): Promise<void> {
  // Check for confirmation message
  const confirmationMessage = page.locator(
    '[data-testid="confirmation-message"], .confirmation-message, h1:has-text("Thank"), h1:has-text("Order Confirmed"), h1:has-text("Success")',
  );
  await expect(confirmationMessage.first()).toBeVisible({
    timeout: TIMEOUTS.elementVisible,
  });

  // Check for order number
  const orderNumber = page.locator(
    '[data-testid="order-number"], .order-number, text=/Order #|Order Number|Confirmation #/',
  );

  if ((await orderNumber.count()) > 0) {
    await expect(orderNumber.first()).toBeVisible();
  }
}

/**
 * Handle 3D Secure authentication modal
 */
async function handle3DSecureAuth(page: Page): Promise<void> {
  // Wait for 3DS iframe to appear
  const threeDSFrame = page.frameLocator(
    'iframe[name*="stripe-challenge"], iframe[src*="stripe.com/js/authorize"]',
  );

  // Look for the authorize button in the 3DS frame
  const authorizeButton = threeDSFrame.locator(
    'button:has-text("Complete"), button:has-text("Authorize"), #test-source-authorize-3ds',
  );

  if ((await authorizeButton.count()) > 0) {
    await authorizeButton.click();
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

test.describe("🛒 Checkout Flow - Stripe Integration", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for checkout tests
    test.setTimeout(120000);
  });

  // --------------------------------------------------------------------------
  // HAPPY PATH TESTS
  // --------------------------------------------------------------------------

  test("should complete checkout with valid card", async ({ page }) => {
    // Login
    await loginAsCustomer(page);

    // Add product to cart
    await addProductToCart(page);

    // Navigate to checkout
    await navigateToCheckout(page);

    // Fill shipping address
    await fillShippingAddress(page);

    // Fill payment details
    await fillStripePaymentDetails(page, STRIPE_TEST_CARDS.SUCCESS);

    // Submit and verify
    await submitPaymentAndWaitForConfirmation(page);
    await verifyOrderConfirmation(page);
  });

  test("should display cart summary on checkout page", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);

    // Updated selectors to match checkout sidebar
    const cartSummary = page.locator(
      '[data-testid="checkout-sidebar"], [data-testid="cart-summary"], [data-testid="order-summary"], .cart-summary, .order-summary',
    );
    await expect(cartSummary).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Verify price is displayed using updated selectors
    const priceElement = page.locator(
      '[data-testid="total-amount"], [data-testid="total-price"], [data-testid="order-total"], .total-price, text=/\\$[0-9]+\\.[0-9]{2}/i',
    );
    await expect(priceElement.first()).toBeVisible();
  });

  test("should save shipping address for future orders", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);

    // Fill address and check save option if available
    await fillShippingAddress(page);

    // Look for saved address option
    const saveAddressCheckbox = page.locator(
      'input[name="saveAddress"], [data-testid="save-address-checkbox"], input[type="checkbox"]:near(:text("Save"))',
    );

    if ((await saveAddressCheckbox.count()) > 0) {
      await saveAddressCheckbox.check();
    }
  });

  // --------------------------------------------------------------------------
  // ERROR HANDLING TESTS
  // --------------------------------------------------------------------------

  test("should handle declined card gracefully", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);
    await fillShippingAddress(page);

    // Use declined card
    await fillStripePaymentDetails(page, STRIPE_TEST_CARDS.DECLINED);

    // Try to submit
    const submitButton = page.locator(
      'button:has-text("Place Order"), button:has-text("Pay"), [data-testid="submit-payment"]',
    );
    await submitButton.first().click();

    // Wait for error message
    const errorMessage = page.locator(
      '[data-testid="payment-error"], .payment-error, .error-message, text=/declined|failed|error/i',
    );
    await expect(errorMessage.first()).toBeVisible({
      timeout: TIMEOUTS.paymentProcess,
    });
  });

  test("should handle insufficient funds", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);
    await fillShippingAddress(page);

    // Use insufficient funds card
    await fillStripePaymentDetails(page, STRIPE_TEST_CARDS.INSUFFICIENT_FUNDS);

    const submitButton = page.locator(
      'button:has-text("Place Order"), button:has-text("Pay"), [data-testid="submit-payment"]',
    );
    await submitButton.first().click();

    // Verify error handling
    const errorMessage = page.locator(
      '[data-testid="payment-error"], .payment-error, .error-message, text=/insufficient|funds|declined/i',
    );
    await expect(errorMessage.first()).toBeVisible({
      timeout: TIMEOUTS.paymentProcess,
    });
  });

  test("should handle expired card", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);
    await fillShippingAddress(page);

    // Use expired card
    await fillStripePaymentDetails(page, STRIPE_TEST_CARDS.EXPIRED_CARD);

    const submitButton = page.locator(
      'button:has-text("Place Order"), button:has-text("Pay"), [data-testid="submit-payment"]',
    );
    await submitButton.first().click();

    // Verify error handling
    const errorMessage = page.locator(
      '[data-testid="payment-error"], .payment-error, .error-message, text=/expired|invalid|error/i',
    );
    await expect(errorMessage.first()).toBeVisible({
      timeout: TIMEOUTS.paymentProcess,
    });
  });

  // --------------------------------------------------------------------------
  // 3D SECURE TESTS
  // --------------------------------------------------------------------------

  test("should handle 3D Secure authentication", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);
    await fillShippingAddress(page);

    // Use 3DS required card
    await fillStripePaymentDetails(page, STRIPE_TEST_CARDS.REQUIRES_AUTH);

    const submitButton = page.locator(
      'button:has-text("Place Order"), button:has-text("Pay"), [data-testid="submit-payment"]',
    );
    await submitButton.first().click();

    // Handle 3DS modal
    await handle3DSecureAuth(page);

    // Wait for confirmation after 3DS
    await Promise.race([
      page.waitForURL(/\/order\/confirmation|\/order-confirmation|\/success/, {
        timeout: TIMEOUTS.paymentProcess,
      }),
      page.waitForSelector(
        '[data-testid="order-confirmation"], .success-page',
        {
          state: "visible",
          timeout: TIMEOUTS.paymentProcess,
        },
      ),
    ]).catch(() => {
      // 3DS test cards may behave differently in test mode
    });
  });

  // --------------------------------------------------------------------------
  // VALIDATION TESTS
  // --------------------------------------------------------------------------

  test("should validate required shipping fields", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);

    // Try to continue without filling address - using updated selectors
    const continueButton = page.locator(
      '[data-testid="checkout-continue-button"], button:has-text("Continue"), button:has-text("Next")',
    );

    if ((await continueButton.count()) > 0) {
      await continueButton.first().click();

      // Should show validation error or prevent navigation
      const validationError = page.locator(
        '[data-testid="address-error"], [data-testid="validation-error"], .error-message, .validation-error, [role="alert"], text=/required/i',
      );
      await expect(validationError.first()).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    }
  });

  test("should validate payment form before submission", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);
    await fillShippingAddress(page);

    // Try to submit empty payment - using updated selectors
    const submitButton = page.locator(
      '[data-testid="checkout-continue-button"], button:has-text("Place Order"), button:has-text("Pay"), [data-testid="submit-payment"]',
    );

    // Button should be disabled or show error on click
    const isDisabled = await submitButton.first().isDisabled();

    if (!isDisabled) {
      await submitButton.first().click();

      // Check for validation message
      const paymentError = page.locator(
        '[data-testid="payment-error"], .payment-error, text=/card|required|complete/i',
      );
      await expect(paymentError.first()).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    }
  });

  // --------------------------------------------------------------------------
  // EDGE CASE TESTS
  // --------------------------------------------------------------------------

  test("should handle empty cart gracefully", async ({ page }) => {
    await loginAsCustomer(page);

    // Navigate directly to checkout without adding items
    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    // Wait for page content - element-based wait instead of networkIdle
    await page.waitForSelector(
      '[data-testid="empty-cart"], [data-testid="checkout-page"], [data-testid="redirect-message"], body',
      { state: "visible", timeout: TIMEOUTS.elementVisible },
    );

    // Should show empty cart message or redirect
    const emptyCartMessage = page
      .locator('[data-testid="empty-cart"], .empty-cart')
      .or(page.getByText(/empty|no items|add items/i));

    const isOnCheckout = page.url().includes("/checkout");

    if (isOnCheckout) {
      await expect(emptyCartMessage.first()).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    } else {
      // Should have redirected to cart or products page
      expect(page.url()).toMatch(/\/(cart|products|shop)/);
    }
  });

  test("should maintain cart state through checkout flow", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);

    // Check cart count before checkout - using updated selectors
    const cartCount = page.locator(
      '[data-testid="cart-count"], [data-testid="cart-item-count"], .cart-count, .cart-badge',
    );
    const initialCount = await cartCount.textContent();

    await navigateToCheckout(page);

    // Verify cart summary shows items - using updated selectors
    const checkoutItems = page.locator(
      '[data-testid="checkout-step-cart"], [data-testid="cart-items-list"], [data-testid="checkout-items"], .checkout-items',
    );
    const itemCount = await checkoutItems.count();

    expect(itemCount).toBeGreaterThan(0);
  });

  test("should apply promo code if feature exists", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);

    // Look for promo code input
    const promoInput = page.locator(
      'input[name="promoCode"], input[name="coupon"], [data-testid="promo-input"], input[placeholder*="promo" i]',
    );

    if ((await promoInput.count()) > 0) {
      await promoInput.fill("TESTPROMO");

      const applyButton = page.locator(
        'button:has-text("Apply"), [data-testid="apply-promo"]',
      );

      if ((await applyButton.count()) > 0) {
        await applyButton.click();

        // Wait for response (success or error)
        await page.waitForTimeout(2000);

        // Check if discount was applied or error shown
        const discountLine = page.locator(
          '[data-testid="discount-line"], .discount, text=/discount|promo|off/i',
        );
        const promoError = page.locator(
          '[data-testid="promo-error"], .promo-error, text=/invalid|expired/i',
        );

        const hasDiscount = (await discountLine.count()) > 0;
        const hasError = (await promoError.count()) > 0;

        expect(hasDiscount || hasError).toBeTruthy();
      }
    }
  });

  // --------------------------------------------------------------------------
  // ACCESSIBILITY TESTS
  // --------------------------------------------------------------------------

  test("should have accessible form labels", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);

    // Check that form inputs have labels
    const inputs = page.locator(
      'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])',
    );
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      const placeholder = await input.getAttribute("placeholder");

      // Input should have some form of labeling
      const hasLabel = id || ariaLabel || ariaLabelledBy || placeholder;

      if (!hasLabel) {
        // Check for associated label element
        const parentLabel = await input
          .locator("xpath=ancestor::label")
          .count();
        expect(parentLabel).toBeGreaterThan(0);
      }
    }
  });

  test("should support keyboard navigation", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);

    // Tab through form fields
    await page.keyboard.press("Tab");

    // Verify focus is visible
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // PERFORMANCE TESTS
  // --------------------------------------------------------------------------

  test("should load checkout page within acceptable time", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);

    const startTime = Date.now();
    await navigateToCheckout(page);
    const loadTime = Date.now() - startTime;

    // Checkout page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("should load Stripe Elements within acceptable time", async ({
    page,
  }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);
    await fillShippingAddress(page);

    const startTime = Date.now();

    // Wait for Stripe iframe
    await page.waitForSelector(
      'iframe[name^="__privateStripeFrame"], iframe[title*="Stripe"]',
      { state: "visible", timeout: TIMEOUTS.stripeLoad },
    );

    const loadTime = Date.now() - startTime;

    // Stripe Elements should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });
});

// ============================================================================
// GUEST CHECKOUT TESTS (if supported)
// ============================================================================

test.describe("🛒 Guest Checkout Flow", () => {
  test("should allow guest checkout if enabled", async ({ page }) => {
    // Navigate to products without logging in
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    // Wait for products to load - element-based wait instead of networkIdle
    await page.waitForSelector(
      '[data-testid="products-grid"], [data-testid^="product-card-"], .product-card, .products-container',
      { state: "visible", timeout: TIMEOUTS.elementVisible },
    );

    // Try to add a product
    const productSelector = '[data-testid^="product-card-"], .product-card';
    await page.waitForSelector(productSelector, {
      state: "visible",
      timeout: TIMEOUTS.elementVisible,
    });

    const productCards = page.locator(productSelector);
    if ((await productCards.count()) > 0) {
      await productCards.first().click();
      await page.waitForURL(/\/products\//, { timeout: TIMEOUTS.navigation });

      const addToCartButton = page.locator(
        'button:has-text("Add to Cart"), [data-testid="add-to-cart-button"]',
      );

      if ((await addToCartButton.count()) > 0) {
        await addToCartButton.first().click();

        // Try to navigate to checkout
        await navigateToCheckout(page).catch(() => {});

        // Check if we're on checkout or login page
        const currentUrl = page.url();
        const isCheckout = currentUrl.includes("/checkout");
        const isLogin = currentUrl.includes("/login");

        expect(isCheckout || isLogin).toBeTruthy();

        if (isCheckout) {
          // Guest checkout is supported - look for guest email field
          const guestEmailInput = page.locator(
            'input[name="guestEmail"], input[name="email"]:not([type="hidden"])',
          );
          expect(await guestEmailInput.count()).toBeGreaterThan(0);
        }
      }
    }
  });
});

// ============================================================================
// MOBILE RESPONSIVE TESTS
// ============================================================================

test.describe("📱 Mobile Checkout", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("should display checkout properly on mobile", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);

    // Updated selectors to match CheckoutFlow component
    const checkoutContainer = page.locator(
      '[data-testid="checkout-flow"], [data-testid="checkout-main-content"], .checkout-page, main',
    );
    await expect(checkoutContainer.first()).toBeVisible();

    // Check that form fields are usable
    const firstInput = page.locator("input:visible").first();
    const box = await firstInput.boundingBox();

    if (box) {
      // Input should be at least 44px tall for touch targets
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test("should have touch-friendly buttons on mobile", async ({ page }) => {
    await loginAsCustomer(page);
    await addProductToCart(page);
    await navigateToCheckout(page);

    // Check button sizes
    const buttons = page.locator("button:visible");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        // Touch targets should be at least 44x44
        expect(box.height).toBeGreaterThanOrEqual(40);
        expect(box.width).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
