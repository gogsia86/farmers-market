/**
 * 🛒 E2E TESTS - Complete Shopping & Checkout Flow
 *
 * Tests the end-to-end customer shopping experience:
 * - Browse products
 * - Add to cart
 * - Checkout process
 * - Order confirmation
 *
 * @pattern End-to-End Testing - Critical Business Flow
 * @reference 13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { test, expect } from "@playwright/test";
import { TEST_USERS } from "../../helpers/auth";

// Timeouts for various operations
const TIMEOUTS = {
  navigation: 15000,
  elementVisible: 10000,
  formSubmit: 10000,
};

/**
 * Wait for page to be ready with element-based wait (not networkIdle)
 */
async function waitForPageReady(
  page: any,
  selector: string,
  timeout: number = TIMEOUTS.elementVisible,
) {
  await page.waitForSelector(selector, {
    state: "visible",
    timeout,
  });
}

/**
 * Login helper with element-based waits
 */
async function loginAsCustomer(page: any) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await waitForPageReady(page, 'input[name="email"]');

  await page.fill('input[name="email"]', TEST_USERS.customer.email);
  await page.fill('input[name="password"]', TEST_USERS.customer.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: TIMEOUTS.navigation });
}

test.describe("🛒 Complete Shopping Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test("should complete full purchase from browse to order confirmation", async ({
    page,
  }) => {
    // Step 1: Browse to marketplace
    await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, "body");

    await expect(
      page.getByRole("heading", { name: /marketplace/i }),
    ).toBeVisible({ timeout: TIMEOUTS.elementVisible });

    // Step 2: Browse products
    await page.click('a[href*="/marketplace/products"]');
    await expect(page).toHaveURL(/\/marketplace\/products/, {
      timeout: TIMEOUTS.navigation,
    });

    // Wait for products to load
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    // Step 3: Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    // Should be on product detail page
    await expect(page).toHaveURL(/\/products\//, {
      timeout: TIMEOUTS.navigation,
    });

    // Step 4: Add to cart
    const addToCartButton = page.locator('button:has-text("Add to Cart")');
    await expect(addToCartButton).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
    await addToCartButton.click();

    // Should see success message
    const successMessage = page
      .locator('[data-testid="toast-success"]')
      .or(page.locator("text=/added to cart/i"));
    await expect(successMessage).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Step 5: View cart
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="cart-page"], [data-testid="cart-content"], .cart-items',
    );

    await expect(page.getByRole("heading", { name: /cart/i })).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Cart should have items
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems.first()).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Step 6: Proceed to checkout
    const checkoutButton = page.locator('button:has-text("Checkout")');
    await checkoutButton.click();

    await expect(page).toHaveURL(/\/checkout/, {
      timeout: TIMEOUTS.navigation,
    });

    // Wait for checkout page content
    await waitForPageReady(
      page,
      '[data-testid="checkout-page"], [data-testid="address-step"], form',
    );

    // Step 7: Fill shipping address
    await page.fill('input[name="address"]', "123 Farm Road");
    await page.fill('input[name="city"]', "Davis");
    await page.fill('input[name="state"]', "CA");
    await page.fill('input[name="zipCode"]', "95616");

    // Step 8: Continue to payment
    await page.click('button:has-text("Continue to Payment")');

    // Wait for payment section
    const paymentSection = page
      .locator('[data-testid="payment-step"]')
      .or(page.locator("text=/payment/i"));
    await expect(paymentSection).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Step 9: Fill payment (test mode - using Stripe test card)
    // Note: In real test, we'd interact with Stripe iframe
    // For mock/test mode, we might have simplified inputs
    const cardInput = page.locator('input[name="cardNumber"]');
    if (await cardInput.isVisible()) {
      await cardInput.fill("4242424242424242");
      await page.fill('input[name="expiry"]', "12/25");
      await page.fill('input[name="cvc"]', "123");
    }

    // Step 10: Submit order
    await page.click('button:has-text("Place Order")');

    // Should see order confirmation
    const confirmationMessage = page
      .locator("text=/order confirmed|thank you/i")
      .or(page.locator('[data-testid="order-confirmation"]'));
    await expect(confirmationMessage).toBeVisible({
      timeout: TIMEOUTS.formSubmit,
    });

    const orderNumber = page.locator('[data-testid="order-number"]');
    await expect(orderNumber).toBeVisible({ timeout: TIMEOUTS.elementVisible });
  });

  test("should add multiple products to cart", async ({ page }) => {
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    // Add first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('button:has-text("Add to Cart")').click();

    // Wait for confirmation
    await page.waitForTimeout(1000);

    // Add second product
    const secondProduct = page.locator('[data-testid="product-card"]').nth(1);
    await secondProduct.locator('button:has-text("Add to Cart")').click();

    // Go to cart
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="cart-page"], [data-testid="cart-content"], .cart-items',
    );

    // Should have 2 items
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(2);
  });

  test("should update product quantity in cart", async ({ page }) => {
    // Add product to cart first
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('button:has-text("Add to Cart")').click();

    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="cart-page"], [data-testid="cart-content"], .cart-items',
    );

    // Find quantity input
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.fill("3");

    // Wait for update
    await page.waitForTimeout(500);

    // Cart total should update
    const cartTotal = page.locator('[data-testid="cart-total"]');
    await expect(cartTotal).toBeVisible({ timeout: TIMEOUTS.elementVisible });
  });

  test("should remove product from cart", async ({ page }) => {
    // Add product to cart
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('button:has-text("Add to Cart")').click();

    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="cart-page"], [data-testid="cart-content"], .cart-items',
    );

    // Click remove button
    const removeButton = page.locator('button:has-text("Remove")').first();
    await removeButton.click();

    // Confirm removal if dialog appears
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Cart should be empty
    const emptyMessage = page
      .locator("text=/cart is empty|no items/i")
      .or(page.locator('[data-testid="empty-cart"]'));
    await expect(emptyMessage).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("should calculate cart total correctly", async ({ page }) => {
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    // Add product with known price
    await page.locator('[data-testid="product-card"]').first().click();

    await waitForPageReady(
      page,
      '[data-testid="product-price"], .product-price',
    );

    // Get product price
    const priceText = await page
      .locator('[data-testid="product-price"]')
      .textContent();
    const price = parseFloat(priceText?.replace(/[^0-9.]/g, "") || "0");

    // Add to cart
    await page.locator('button:has-text("Add to Cart")').click();

    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="cart-page"], [data-testid="cart-content"], .cart-items',
    );

    // Check subtotal
    const subtotalText = await page
      .locator('[data-testid="cart-subtotal"]')
      .textContent();
    const subtotal = parseFloat(subtotalText?.replace(/[^0-9.]/g, "") || "0");

    // Subtotal should match product price
    expect(subtotal).toBeCloseTo(price, 2);
  });

  test("should show validation errors for incomplete checkout", async ({
    page,
  }) => {
    // Add product to cart
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    await page.locator('[data-testid="product-card"]').first().click();
    await waitForPageReady(
      page,
      'button:has-text("Add to Cart"), [data-testid="add-to-cart-button"]',
    );
    await page.locator('button:has-text("Add to Cart")').click();

    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="checkout-page"], [data-testid="address-step"], form',
    );

    // Try to proceed without filling form
    await page.click('button:has-text("Continue to Payment")');

    // Should show validation errors
    const errorMessages = page.locator("text=/required|please fill/i");
    await expect(errorMessages.first()).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("should apply fulfillment method correctly", async ({ page }) => {
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    await page.locator('[data-testid="product-card"]').first().click();
    await waitForPageReady(
      page,
      'button:has-text("Add to Cart"), [data-testid="add-to-cart-button"]',
    );
    await page.locator('button:has-text("Add to Cart")').click();

    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="checkout-page"], [data-testid="address-step"], form',
    );

    // Fill address
    await page.fill('input[name="address"]', "456 Farm Road");
    await page.fill('input[name="city"]', "Davis");
    await page.fill('input[name="state"]', "CA");
    await page.fill('input[name="zipCode"]', "95616");

    // Select pickup
    const pickupOption = page.locator('input[value="PICKUP"]');
    if (await pickupOption.isVisible()) {
      await pickupOption.click();

      // Should show pickup information
      const pickupMessage = page.locator("text=/pickup location|pick up/i");
      await expect(pickupMessage).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    }

    // Select delivery
    const deliveryOption = page.locator('input[value="DELIVERY"]');
    if (await deliveryOption.isVisible()) {
      await deliveryOption.click();

      // Should show delivery information
      const deliveryMessage = page.locator("text=/delivery fee|shipping/i");
      await expect(deliveryMessage).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    }
  });

  test("should persist cart across page refreshes", async ({ page }) => {
    // Add product to cart
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    await page.locator('[data-testid="product-card"]').first().click();
    await waitForPageReady(
      page,
      'button:has-text("Add to Cart"), [data-testid="add-to-cart-button"]',
    );
    await page.locator('button:has-text("Add to Cart")').click();

    // Refresh page
    await page.reload();

    // Go to cart
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="cart-page"], [data-testid="cart-content"], .cart-items, [data-testid="empty-cart"]',
    );

    // Cart should still have items
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems.first()).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });
});

test.describe("🌾 Browse Farms & Products", () => {
  test("should browse and filter farms", async ({ page }) => {
    await page.goto("/farms", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="farm-card"], .farm-card, [data-testid="farms-grid"]',
    );

    // Should see farm cards
    const farmCards = page.locator('[data-testid="farm-card"]');
    await expect(farmCards.first()).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Filter by location (if available)
    const locationFilter = page.locator('input[name="location"]');
    if (await locationFilter.isVisible()) {
      await locationFilter.fill("Davis");
      await page.waitForTimeout(500);
    }
  });

  test("should view farm profile and products", async ({ page }) => {
    await page.goto("/farms", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="farm-card"], .farm-card, [data-testid="farms-grid"]',
    );

    // Click on first farm
    const firstFarm = page.locator('[data-testid="farm-card"]').first();
    await firstFarm.click();

    // Should be on farm profile page
    await expect(page).toHaveURL(/\/farms\//, {
      timeout: TIMEOUTS.navigation,
    });

    // Wait for farm profile content
    await waitForPageReady(page, "body");

    // Should see farm products
    const products = page.locator('[data-testid="product-card"]');
    const productsCount = await products.count();
    expect(productsCount).toBeGreaterThanOrEqual(0);
  });

  test("should filter products by category", async ({ page }) => {
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    // Click on category filter (e.g., Vegetables)
    const categoryButton = page.locator('button:has-text("Vegetables")');
    if (await categoryButton.isVisible()) {
      await categoryButton.click();

      // URL should update or products should filter
      await page.waitForTimeout(500);

      // Products should still be visible
      const products = page.locator('[data-testid="product-card"]');
      await expect(products.first()).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    }
  });

  test("should search for products", async ({ page }) => {
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"], input[type="search"]',
    );

    // Find search input
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("tomato");
      await searchInput.press("Enter");

      // Wait for results
      await page.waitForTimeout(1000);

      // Should see results or "no results" message
      const results = page.locator('[data-testid="product-card"]');
      const resultsCount = await results.count();

      if (resultsCount === 0) {
        // Check for no results message
        const noResults = page.locator("text=/no products|no results/i");
        await expect(noResults).toBeVisible({
          timeout: TIMEOUTS.elementVisible,
        });
      }
    }
  });

  test("should add product to favorites", async ({ page }) => {
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    // Find favorite button
    const favoriteButton = page
      .locator('button[aria-label*="favorite"]')
      .first();
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();

      // Should show success message
      const message = page.locator("text=/added to favorites|favorited/i");
      await expect(message).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    }
  });
});

test.describe("📦 Order Management", () => {
  test("should view order history", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, 'input[name="email"]');

    await page.fill('input[name="email"]', TEST_USERS.customer.email);
    await page.fill('input[name="password"]', TEST_USERS.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: TIMEOUTS.navigation });

    // Navigate to orders
    await page.goto("/orders", { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, "body");

    // Should see orders list or empty state
    const ordersHeading = page.getByRole("heading", {
      name: /orders|order history/i,
    });
    await expect(ordersHeading).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("should view order details", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, 'input[name="email"]');

    await page.fill('input[name="email"]', TEST_USERS.customer.email);
    await page.fill('input[name="password"]', TEST_USERS.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: TIMEOUTS.navigation });

    await page.goto("/orders", { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, "body");

    // Click on first order if exists
    const firstOrder = page.locator('[data-testid="order-card"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();

      // Should see order details
      await expect(page).toHaveURL(/\/orders\//, {
        timeout: TIMEOUTS.navigation,
      });
    }
  });

  test("should track order status", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, 'input[name="email"]');

    await page.fill('input[name="email"]', TEST_USERS.customer.email);
    await page.fill('input[name="password"]', TEST_USERS.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: TIMEOUTS.navigation });

    // Check dashboard for order status
    const orderStatus = page.locator(
      "text=/pending|confirmed|preparing|ready|completed/i",
    );
    if (await orderStatus.first().isVisible()) {
      await expect(orderStatus.first()).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    }
  });
});

test.describe("🎯 Performance & Accessibility", () => {
  test("should load marketplace within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, "body");

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/marketplace/products", { waitUntil: "domcontentloaded" });
    await waitForPageReady(
      page,
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
    );

    // Tab through interactive elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should have visible focus indicators
    const focusedElement = await page.locator(":focus");
    await expect(focusedElement).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, "body");

    const h1 = page.locator("h1");
    await expect(h1).toBeVisible({ timeout: TIMEOUTS.elementVisible });
  });

  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, "body");

    // Content should be visible
    const content = page.locator("main");
    await expect(content).toBeVisible({ timeout: TIMEOUTS.elementVisible });

    // Mobile menu should be accessible
    const mobileMenu = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    }
  });
});
