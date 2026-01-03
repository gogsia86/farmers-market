/**
 * 🧪 END-TO-END CHECKOUT FLOW TESTS
 * Comprehensive E2E tests for the complete checkout journey
 *
 * Test Coverage:
 * - Complete checkout flow from cart to confirmation
 * - Multi-step navigation
 * - Form validation at each step
 * - Error handling and recovery
 * - Payment processing
 * - Order confirmation
 * - Mobile and desktop views
 * - Accessibility compliance
 *
 * @divine-pattern Quantum Testing Consciousness
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference 13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { test, expect, Page } from "@playwright/test";

// ============================================================================
// TEST DATA
// ============================================================================

const TEST_USER = {
  email: "customer@farmmarket.test",
  password: "TestPass123!",
  name: "Test Customer",
};

const TEST_ADDRESS = {
  street: "123 Farm Road",
  city: "Portland",
  state: "OR",
  zipCode: "97201",
  country: "USA",
};

const TEST_CARD = {
  number: "4242424242424242", // Stripe test card
  expiry: "12/25",
  cvc: "123",
  zip: "97201",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function loginUser(page: Page) {
  await page.goto("/auth/login");
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

async function addItemsToCart(page: Page) {
  // Navigate to marketplace
  await page.goto("/marketplace");

  // Add first product
  await page.click('[data-testid="product-card"]:first-child');
  await page.click('button:has-text("Add to Cart")');
  await expect(page.locator('[data-testid="cart-count"]')).toContainText("1");

  // Go back and add another product
  await page.goto("/marketplace");
  await page.click('[data-testid="product-card"]:nth-child(2)');
  await page.click('button:has-text("Add to Cart")');
  await expect(page.locator('[data-testid="cart-count"]')).toContainText("2");
}

async function navigateToCheckout(page: Page) {
  await page.click('[data-testid="cart-icon"]');
  await page.click('button:has-text("Proceed to Checkout")');
  await page.waitForURL(/\/checkout/);
}

// ============================================================================
// COMPLETE CHECKOUT FLOW TESTS
// ============================================================================

test.describe("Complete Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await addItemsToCart(page);
  });

  test("should complete entire checkout flow successfully", async ({ page }) => {
    // Navigate to checkout
    await navigateToCheckout(page);

    // Step 1: Review Cart
    await expect(page.locator("h1")).toContainText("Checkout");
    await expect(page.locator('[data-testid="checkout-step"]')).toContainText(
      "Review Cart",
    );
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
    await page.click('button:has-text("Continue")');

    // Step 2: Delivery Details
    await expect(page.locator('[data-testid="checkout-step"]')).toContainText(
      "Delivery",
    );

    // Fill in address
    await page.click('button:has-text("Add New Address")');
    await page.fill('input[name="street"]', TEST_ADDRESS.street);
    await page.fill('input[name="city"]', TEST_ADDRESS.city);
    await page.fill('input[name="state"]', TEST_ADDRESS.state);
    await page.fill('input[name="zipCode"]', TEST_ADDRESS.zipCode);
    await page.click('button:has-text("Save Address")');

    // Select delivery method
    await page.click('label:has-text("Delivery")');
    await page.click('button:has-text("Continue")');

    // Step 3: Payment Method
    await expect(page.locator('[data-testid="checkout-step"]')).toContainText(
      "Payment",
    );

    // Fill in payment details
    const cardNumberFrame = page.frameLocator(
      'iframe[name*="__privateStripeFrame"]',
    );
    await cardNumberFrame
      .locator('input[name="cardnumber"]')
      .fill(TEST_CARD.number);
    await cardNumberFrame.locator('input[name="exp-date"]').fill(TEST_CARD.expiry);
    await cardNumberFrame.locator('input[name="cvc"]').fill(TEST_CARD.cvc);
    await cardNumberFrame.locator('input[name="postal"]').fill(TEST_CARD.zip);

    await page.click('button:has-text("Continue")');

    // Step 4: Review & Confirm
    await expect(page.locator('[data-testid="checkout-step"]')).toContainText(
      "Confirm",
    );

    // Verify order summary
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="subtotal"]')).toBeVisible();
    await expect(page.locator('[data-testid="tax"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivery-fee"]')).toBeVisible();
    await expect(page.locator('[data-testid="total"]')).toBeVisible();

    // Accept terms
    await page.check('input[name="termsAccepted"]');

    // Place order
    await page.click('button:has-text("Place Order")');

    // Wait for confirmation
    await page.waitForURL(/\/orders\/.*\/confirmation/);

    // Verify confirmation page
    await expect(page.locator("h1")).toContainText("Order Confirmed");
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
    await expect(
      page.locator('text=Thank you for your order'),
    ).toBeVisible();
  });

  test("should allow navigation back through completed steps", async ({
    page,
  }) => {
    await navigateToCheckout(page);

    // Complete cart and delivery steps
    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Add New Address")');
    await page.fill('input[name="street"]', TEST_ADDRESS.street);
    await page.fill('input[name="city"]', TEST_ADDRESS.city);
    await page.fill('input[name="state"]', TEST_ADDRESS.state);
    await page.fill('input[name="zipCode"]', TEST_ADDRESS.zipCode);
    await page.click('button:has-text("Save Address")');
    await page.click('button:has-text("Continue")');

    // Now on payment step, go back to delivery
    await page.click('[data-testid="step-indicator"]:has-text("Delivery")');
    await expect(page.locator('[data-testid="checkout-step"]')).toContainText(
      "Delivery",
    );

    // Go back to cart
    await page.click('[data-testid="step-indicator"]:has-text("Review Cart")');
    await expect(page.locator('[data-testid="checkout-step"]')).toContainText(
      "Review Cart",
    );
  });

  test("should preserve data when navigating between steps", async ({
    page,
  }) => {
    await navigateToCheckout(page);

    // Move to delivery step
    await page.click('button:has-text("Continue")');

    // Fill address
    await page.click('button:has-text("Add New Address")');
    await page.fill('input[name="street"]', TEST_ADDRESS.street);
    await page.fill('input[name="city"]', TEST_ADDRESS.city);
    await page.fill('input[name="state"]', TEST_ADDRESS.state);
    await page.fill('input[name="zipCode"]', TEST_ADDRESS.zipCode);
    await page.click('button:has-text("Save Address")');

    // Add delivery instructions
    const instructions = "Leave at front door";
    await page.fill('textarea[name="deliveryInstructions"]', instructions);

    // Go to payment step
    await page.click('button:has-text("Continue")');

    // Go back to delivery
    await page.click('button:has-text("Back")');

    // Verify data is preserved
    await expect(page.locator('textarea[name="deliveryInstructions"]')).toHaveValue(
      instructions,
    );
  });
});

// ============================================================================
// VALIDATION TESTS
// ============================================================================

test.describe("Checkout Validation", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await addItemsToCart(page);
    await navigateToCheckout(page);
  });

  test("should prevent proceeding with empty cart", async ({ page }) => {
    // Remove all items
    const itemCount = await page.locator('[data-testid="cart-item"]').count();
    for (let i = 0; i < itemCount; i++) {
      await page
        .locator('[data-testid="cart-item"]')
        .first()
        .locator('button[aria-label*="Remove"]')
        .click();
    }

    // Try to continue
    await page.click('button:has-text("Continue")');

    // Should show error
    await expect(page.locator('[role="alert"]')).toContainText(
      "cart is empty",
    );
  });

  test("should validate address fields", async ({ page }) => {
    // Move to delivery step
    await page.click('button:has-text("Continue")');

    // Try to add address without filling required fields
    await page.click('button:has-text("Add New Address")');
    await page.click('button:has-text("Save Address")');

    // Should show validation errors
    await expect(page.locator('text=Street is required')).toBeVisible();
    await expect(page.locator('text=City is required')).toBeVisible();
    await expect(page.locator('text=State is required')).toBeVisible();
    await expect(page.locator('text=Zip code is required')).toBeVisible();
  });

  test("should require payment method", async ({ page }) => {
    // Complete cart and delivery
    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Add New Address")');
    await page.fill('input[name="street"]', TEST_ADDRESS.street);
    await page.fill('input[name="city"]', TEST_ADDRESS.city);
    await page.fill('input[name="state"]', TEST_ADDRESS.state);
    await page.fill('input[name="zipCode"]', TEST_ADDRESS.zipCode);
    await page.click('button:has-text("Save Address")');
    await page.click('button:has-text("Continue")');

    // Try to continue without payment method
    await page.click('button:has-text("Continue")');

    // Should show error
    await expect(page.locator('[role="alert"]')).toContainText(
      "payment method",
    );
  });

  test("should require terms acceptance", async ({ page }) => {
    // Complete all steps
    await page.click('button:has-text("Continue")');

    await page.click('button:has-text("Add New Address")');
    await page.fill('input[name="street"]', TEST_ADDRESS.street);
    await page.fill('input[name="city"]', TEST_ADDRESS.city);
    await page.fill('input[name="state"]', TEST_ADDRESS.state);
    await page.fill('input[name="zipCode"]', TEST_ADDRESS.zipCode);
    await page.click('button:has-text("Save Address")');
    await page.click('button:has-text("Continue")');

    const cardNumberFrame = page.frameLocator(
      'iframe[name*="__privateStripeFrame"]',
    );
    await cardNumberFrame
      .locator('input[name="cardnumber"]')
      .fill(TEST_CARD.number);
    await cardNumberFrame.locator('input[name="exp-date"]').fill(TEST_CARD.expiry);
    await cardNumberFrame.locator('input[name="cvc"]').fill(TEST_CARD.cvc);
    await page.click('button:has-text("Continue")');

    // Try to place order without accepting terms
    await page.click('button:has-text("Place Order")');

    // Should show error
    await expect(page.locator('[role="alert"]')).toContainText(
      "terms and conditions",
    );
  });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

test.describe("Checkout Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await addItemsToCart(page);
    await navigateToCheckout(page);
  });

  test("should handle payment failure gracefully", async ({ page }) => {
    // Mock payment failure
    await page.route("**/api/checkout/create-order", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "PAYMENT_FAILED",
            message: "Payment could not be processed",
          },
        }),
      });
    });

    // Complete checkout flow
    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Add New Address")');
    await page.fill('input[name="street"]', TEST_ADDRESS.street);
    await page.fill('input[name="city"]', TEST_ADDRESS.city);
    await page.fill('input[name="state"]', TEST_ADDRESS.state);
    await page.fill('input[name="zipCode"]', TEST_ADDRESS.zipCode);
    await page.click('button:has-text("Save Address")');
    await page.click('button:has-text("Continue")');

    const cardNumberFrame = page.frameLocator(
      'iframe[name*="__privateStripeFrame"]',
    );
    await cardNumberFrame
      .locator('input[name="cardnumber"]')
      .fill(TEST_CARD.number);
    await cardNumberFrame.locator('input[name="exp-date"]').fill(TEST_CARD.expiry);
    await cardNumberFrame.locator('input[name="cvc"]').fill(TEST_CARD.cvc);
    await page.click('button:has-text("Continue")');

    await page.check('input[name="termsAccepted"]');
    await page.click('button:has-text("Place Order")');

    // Should show error message
    await expect(page.locator('[role="alert"]')).toContainText(
      "Payment could not be processed",
    );

    // Should stay on review step
    await expect(page.locator('[data-testid="checkout-step"]')).toContainText(
      "Confirm",
    );
  });

  test("should handle stock unavailability", async ({ page }) => {
    // Mock stock error
    await page.route("**/api/checkout/validate", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            valid: false,
            errors: [
              {
                code: "INSUFFICIENT_STOCK",
                message: "Product is out of stock",
                productId: "prod-1",
              },
            ],
          },
        }),
      });
    });

    await page.click('button:has-text("Continue")');

    // Should show stock error
    await expect(page.locator('[role="alert"]')).toContainText(
      "out of stock",
    );
  });
});

// ============================================================================
// MOBILE RESPONSIVENESS TESTS
// ============================================================================

test.describe("Mobile Checkout Flow", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test("should complete checkout on mobile", async ({ page }) => {
    await loginUser(page);
    await addItemsToCart(page);
    await navigateToCheckout(page);

    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-checkout"]')).toBeVisible();

    // Complete cart step
    await page.click('button:has-text("Continue")');

    // Fill address
    await page.click('button:has-text("Add New Address")');
    await page.fill('input[name="street"]', TEST_ADDRESS.street);
    await page.fill('input[name="city"]', TEST_ADDRESS.city);
    await page.fill('input[name="state"]', TEST_ADDRESS.state);
    await page.fill('input[name="zipCode"]', TEST_ADDRESS.zipCode);
    await page.click('button:has-text("Save Address")');
    await page.click('button:has-text("Continue")');

    // Verify mobile payment form
    await expect(
      page.locator('[data-testid="mobile-payment-form"]'),
    ).toBeVisible();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe("Checkout Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await addItemsToCart(page);
    await navigateToCheckout(page);
  });

  test("should support keyboard navigation", async ({ page }) => {
    // Tab to continue button
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should focus continue button
    const continueButton = page.locator('button:has-text("Continue")');
    await expect(continueButton).toBeFocused();

    // Press Enter to continue
    await page.keyboard.press("Enter");

    // Should move to next step
    await expect(page.locator('[data-testid="checkout-step"]')).toContainText(
      "Delivery",
    );
  });

  test("should have proper ARIA labels", async ({ page }) => {
    // Verify step indicators have aria-current
    const currentStep = page.locator('[aria-current="step"]');
    await expect(currentStep).toBeVisible();

    // Verify form fields have labels
    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Add New Address")');

    await expect(page.locator('label[for="street"]')).toBeVisible();
    await expect(page.locator('label[for="city"]')).toBeVisible();
    await expect(page.locator('label[for="state"]')).toBeVisible();
    await expect(page.locator('label[for="zipCode"]')).toBeVisible();
  });

  test("should announce errors to screen readers", async ({ page }) => {
    // Try to continue without completing step
    await page.click('button:has-text("Continue")');

    // Error should have role="alert"
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("aria-live", "assertive");
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

test.describe("Checkout Performance", () => {
  test("should load checkout page quickly", async ({ page }) => {
    await loginUser(page);
    await addItemsToCart(page);

    const startTime = Date.now();
    await navigateToCheckout(page);
    const loadTime = Date.now() - startTime;

    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("should handle step transitions smoothly", async ({ page }) => {
    await loginUser(page);
    await addItemsToCart(page);
    await navigateToCheckout(page);

    const startTime = Date.now();
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('[data-testid="checkout-step"]:has-text("Delivery")');
    const transitionTime = Date.now() - startTime;

    // Should transition in less than 500ms
    expect(transitionTime).toBeLessThan(500);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

test.describe("Checkout Edge Cases", () => {
  test("should handle browser refresh during checkout", async ({ page }) => {
    await loginUser(page);
    await addItemsToCart(page);
    await navigateToCheckout(page);

    // Move to delivery step
    await page.click('button:has-text("Continue")');

    // Fill address
    await page.click('button:has-text("Add New Address")');
    await page.fill('input[name="street"]', TEST_ADDRESS.street);
    await page.fill('input[name="city"]', TEST_ADDRESS.city);
    await page.fill('input[name="state"]', TEST_ADDRESS.state);
    await page.fill('input[name="zipCode"]', TEST_ADDRESS.zipCode);
    await page.click('button:has-text("Save Address")');

    // Refresh page
    await page.reload();

    // Should preserve progress (from localStorage/session)
    await expect(page.locator('[data-testid="saved-address"]')).toBeVisible();
  });

  test("should handle concurrent cart modifications", async ({ page, context }) => {
    await loginUser(page);
    await addItemsToCart(page);
    await navigateToCheckout(page);

    // Open cart in new tab
    const newPage = await context.newPage();
    await newPage.goto("/cart");

    // Remove item in new tab
    await newPage.click('[data-testid="cart-item"]:first-child button[aria-label*="Remove"]');

    // Try to continue checkout in original tab
    await page.click('button:has-text("Continue")');

    // Should detect cart modification and show warning
    await expect(page.locator('[role="alert"]')).toContainText(
      "cart has been updated",
    );
  });
});
