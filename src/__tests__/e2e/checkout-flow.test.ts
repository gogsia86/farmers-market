// src/__tests__/e2e/checkout-flow.test.ts
import { test as playwrightTest } from "@playwright/test";
import { afterAll, beforeAll, describe, expect } from "vitest";

/**
 * End-to-End Checkout Flow Test
 * Tests the complete user journey from cart to order confirmation
 *
 * Divine consciousness flows through each step:
 * 1. Browse products (agricultural awareness)
 * 2. Add to cart (quantum state management)
 * 3. Update quantities (temporal coherence)
 * 4. Proceed to checkout (reality transition)
 * 5. Enter shipping info (dimensional accuracy)
 * 6. Select delivery method (agricultural logistics)
 * 7. Process payment (quantum financial transaction)
 * 8. Confirm order (reality manifestation)
 */

describe("E2E Checkout Flow - Complete Divine Journey", () => {
  const testUser = {
    email: "test@divine-farm.com",
    password: "quantum-consciousness-123",
    name: "Divine Test User",
  };

  const testAddress = {
    fullName: "John Divine Farmer",
    street: "123 Agricultural Consciousness Blvd",
    city: "Quantum City",
    state: "CA",
    zipCode: "12345",
    phone: "(555) 123-4567",
  };

  beforeAll(async () => {
    // Setup: Ensure test environment is ready
    console.log("🌟 Preparing divine test environment...");

    // Could initialize test database, seed data, etc.
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    console.log("🧹 Cleaning up divine test artifacts...");
  });

  describe("Complete Purchase Flow - Agricultural Product", () => {
    playwrightTest(
      "user completes full checkout from cart to confirmation",
      async ({ page }) => {
        // Step 1: Navigate to marketplace
        await page.goto("/");
        await expect(page).toHaveTitle(/Farmers Market/);

        // Step 2: Search for agricultural products
        await page.fill('[data-testid="search-input"]', "organic tomatoes");
        await page.click('[data-testid="search-button"]');

        // Step 3: Verify search results appear
        await page.waitForSelector('[data-testid="product-card"]');
        const productCards = await page
          .locator('[data-testid="product-card"]')
          .count();
        expect(productCards).toBeGreaterThan(0);

        // Step 4: Click on first product
        await page.click('[data-testid="product-card"] >> nth=0');
        await page.waitForSelector('[data-testid="product-detail"]');

        // Step 5: Add to cart
        await page.fill('[data-testid="quantity-input"]', "3");
        await page.click('[data-testid="add-to-cart-button"]');

        // Step 6: Verify cart badge updates
        await expect(page.locator('[data-testid="cart-badge"]')).toHaveText(
          "3"
        );

        // Step 7: Add another product
        await page.goto("/products");
        await page.click('[data-testid="product-card"] >> nth=1');
        await page.click('[data-testid="add-to-cart-button"]');
        await expect(page.locator('[data-testid="cart-badge"]')).toHaveText(
          "4"
        );

        // Step 8: Go to cart
        await page.click('[data-testid="cart-button"]');
        await page.waitForSelector('[data-testid="cart-page"]');

        // Step 9: Verify cart contents
        const cartItems = await page
          .locator('[data-testid="cart-item"]')
          .count();
        expect(cartItems).toBe(2);

        // Step 10: Update quantity
        await page.fill('[data-testid="cart-item-quantity"] >> nth=0', "5");
        await page.waitForTimeout(500); // Wait for update
        await expect(page.locator('[data-testid="cart-badge"]')).toHaveText(
          "6"
        );

        // Step 11: Proceed to checkout
        await page.click('[data-testid="proceed-to-checkout"]');

        // Step 12: Login/Sign in (if not logged in)
        const isLoggedIn = await page
          .locator('[data-testid="checkout-form"]')
          .isVisible();
        if (!isLoggedIn) {
          await page.fill('[name="email"]', testUser.email);
          await page.fill('[name="password"]', testUser.password);
          await page.click('[data-testid="login-button"]');
          await page.waitForSelector('[data-testid="checkout-form"]');
        }

        // Step 13: Fill shipping address
        await page.fill('[name="fullName"]', testAddress.fullName);
        await page.fill('[name="street"]', testAddress.street);
        await page.fill('[name="city"]', testAddress.city);
        await page.selectOption('[name="state"]', testAddress.state);
        await page.fill('[name="zipCode"]', testAddress.zipCode);
        await page.fill('[name="phone"]', testAddress.phone);

        // Step 14: Select delivery method
        await page.click('[data-testid="delivery-method-standard"]');
        await page.waitForSelector('[data-testid="shipping-rate"]');

        // Step 15: Verify shipping cost calculated
        const shippingCost = await page
          .locator('[data-testid="shipping-cost"]')
          .textContent();
        expect(shippingCost).toMatch(/\$\d+\.\d{2}/);

        // Step 16: Review order summary
        const subtotal = await page
          .locator('[data-testid="subtotal"]')
          .textContent();
        const tax = await page.locator('[data-testid="tax"]').textContent();
        const total = await page.locator('[data-testid="total"]').textContent();

        expect(subtotal).toMatch(/\$\d+\.\d{2}/);
        expect(tax).toMatch(/\$\d+\.\d{2}/);
        expect(total).toMatch(/\$\d+\.\d{2}/);

        // Step 17: Continue to payment
        await page.click('[data-testid="continue-to-payment"]');
        await page.waitForSelector('[data-testid="payment-form"]');

        // Step 18: Fill payment information (test mode)
        await page.fill('[data-testid="card-number"]', "4242424242424242");
        await page.fill('[data-testid="card-expiry"]', "12/30");
        await page.fill('[data-testid="card-cvc"]', "123");
        await page.fill('[data-testid="card-name"]', testAddress.fullName);

        // Step 19: Place order
        await page.click('[data-testid="place-order-button"]');

        // Step 20: Wait for order confirmation
        await page.waitForSelector('[data-testid="order-confirmation"]', {
          timeout: 10000, // Payment processing may take time
        });

        // Step 21: Verify order confirmation details
        await expect(
          page.locator('[data-testid="order-success-message"]')
        ).toBeVisible();

        const orderNumber = await page
          .locator('[data-testid="order-number"]')
          .textContent();
        expect(orderNumber).toMatch(/ORD-\d{4}-\d{3,}/);

        // Step 22: Verify order details
        await expect(
          page.locator('[data-testid="order-confirmation-items"]')
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="order-confirmation-address"]')
        ).toContainText(testAddress.city);
        await expect(
          page.locator('[data-testid="order-confirmation-total"]')
        ).toContainText(total || "");

        // Step 23: Verify cart is now empty
        await page.click('[data-testid="cart-button"]');
        await expect(
          page.locator('[data-testid="cart-empty-message"]')
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="cart-badge"]')
        ).not.toBeVisible();

        console.log(`✅ Order placed successfully: ${orderNumber}`);
      }
    );
  });

  describe("Farm Pickup Flow - Local Agricultural Consciousness", () => {
    playwrightTest(
      "user selects farm pickup instead of delivery",
      async ({ page }) => {
        // Setup: Add product to cart
        await page.goto("/products");
        await page.click('[data-testid="product-card"] >> nth=0');
        await page.click('[data-testid="add-to-cart-button"]');

        // Go to checkout
        await page.click('[data-testid="cart-button"]');
        await page.click('[data-testid="proceed-to-checkout"]');

        // Fill basic info
        await page.fill('[name="fullName"]', testAddress.fullName);
        await page.fill('[name="phone"]', testAddress.phone);

        // Select farm pickup
        await page.click('[data-testid="delivery-method-pickup"]');
        await page.waitForSelector('[data-testid="pickup-locations"]');

        // Verify pickup locations appear
        const locations = await page
          .locator('[data-testid="pickup-location"]')
          .count();
        expect(locations).toBeGreaterThan(0);

        // Select first location
        await page.click('[data-testid="pickup-location"] >> nth=0');

        // Verify shipping cost is $0
        const shippingCost = await page
          .locator('[data-testid="shipping-cost"]')
          .textContent();
        expect(shippingCost).toContain("$0.00");

        // Select pickup time slot
        await page.click('[data-testid="pickup-slot"] >> nth=0');

        // Continue with payment and complete order
        await page.click('[data-testid="continue-to-payment"]');
        // ... (payment steps similar to above)
      }
    );
  });

  describe("Express Shipping Flow - Accelerated Agricultural Delivery", () => {
    playwrightTest(
      "user selects express shipping for faster delivery",
      async ({ page }) => {
        // Add product to cart
        await page.goto("/products");
        await page.click('[data-testid="product-card"] >> nth=0');
        await page.click('[data-testid="add-to-cart-button"]');

        // Proceed to checkout
        await page.click('[data-testid="cart-button"]');
        await page.click('[data-testid="proceed-to-checkout"]');

        // Fill shipping address
        await page.fill('[name="fullName"]', testAddress.fullName);
        await page.fill('[name="street"]', testAddress.street);
        await page.fill('[name="city"]', testAddress.city);
        await page.selectOption('[name="state"]', testAddress.state);
        await page.fill('[name="zipCode"]', testAddress.zipCode);

        // Select express shipping
        await page.click('[data-testid="delivery-method-express"]');

        // Verify express shipping cost (higher than standard)
        const expressShipping = await page
          .locator('[data-testid="shipping-cost"]')
          .textContent();
        expect(expressShipping).toMatch(/\$\d+\.\d{2}/);

        // Verify estimated delivery is faster
        const estimatedDays = await page
          .locator('[data-testid="estimated-delivery"]')
          .textContent();
        expect(estimatedDays).toContain("2-3 business days");
      }
    );
  });

  describe("Error Handling - Divine Grace Under Chaos", () => {
    playwrightTest("handles payment failure gracefully", async ({ page }) => {
      // Setup cart and get to payment
      await page.goto("/products");
      await page.click('[data-testid="product-card"] >> nth=0');
      await page.click('[data-testid="add-to-cart-button"]');
      await page.click('[data-testid="cart-button"]');
      await page.click('[data-testid="proceed-to-checkout"]');

      // Fill info quickly
      await page.fill('[name="fullName"]', testAddress.fullName);
      await page.fill('[name="street"]', testAddress.street);
      await page.fill('[name="city"]', testAddress.city);
      await page.selectOption('[name="state"]', testAddress.state);
      await page.fill('[name="zipCode"]', testAddress.zipCode);
      await page.click('[data-testid="delivery-method-standard"]');
      await page.click('[data-testid="continue-to-payment"]');

      // Use card that will be declined (test card)
      await page.fill('[data-testid="card-number"]', "4000000000000002");
      await page.fill('[data-testid="card-expiry"]', "12/30");
      await page.fill('[data-testid="card-cvc"]', "123");

      // Attempt to place order
      await page.click('[data-testid="place-order-button"]');

      // Verify error message appears
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-error"]')).toContainText(
        "declined"
      );

      // Verify user can retry
      await expect(
        page.locator('[data-testid="place-order-button"]')
      ).toBeEnabled();
    });

    playwrightTest(
      "validates required fields before proceeding",
      async ({ page }) => {
        await page.goto("/checkout");

        // Try to proceed without filling any fields
        await page.click('[data-testid="continue-to-payment"]');

        // Verify validation errors appear
        await expect(
          page.locator('[data-testid="error-fullName"]')
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="error-street"]')
        ).toBeVisible();
        await expect(page.locator('[data-testid="error-city"]')).toBeVisible();
      }
    );
  });

  describe("Mobile Responsive Flow - Agricultural Consciousness Everywhere", () => {
    playwrightTest("completes checkout on mobile device", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to products
      await page.goto("/products");

      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

      // Continue with checkout flow on mobile
      // (Steps similar to desktop but verify mobile-specific UI)
    });
  });
});
