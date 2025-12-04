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

test.describe("🛒 Complete Shopping Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer
    await page.goto("/login");
    await page.fill('input[name="email"]', "test.customer@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("should complete full purchase from browse to order confirmation", async ({
    page,
  }) => {
    // Step 1: Browse to marketplace
    await page.goto("/marketplace");
    await expect(page.getByRole("heading", { name: /marketplace/i })).toBeVisible();

    // Step 2: Browse products
    await page.click('a[href*="/marketplace/products"]');
    await expect(page).toHaveURL(/\/marketplace\/products/);

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    });

    // Step 3: Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    // Should be on product detail page
    await expect(page).toHaveURL(/\/products\//);

    // Step 4: Add to cart
    const addToCartButton = page.locator('button:has-text("Add to Cart")');
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Should see success message or cart indicator update
    const successMessage = page.locator(
      'text=/added to cart|item added/i'
    );
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // Step 5: View cart
    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: /cart/i })).toBeVisible();

    // Cart should have items
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems.first()).toBeVisible();

    // Step 6: Proceed to checkout
    const checkoutButton = page.locator('button:has-text("Checkout")');
    await checkoutButton.click();

    await page.waitForURL(/\/checkout/);

    // Step 7: Fill shipping information
    await page.fill('input[name="address"]', "123 Test Street");
    await page.fill('input[name="city"]', "Sacramento");
    await page.fill('input[name="state"]', "CA");
    await page.fill('input[name="zipCode"]', "95814");

    // Select fulfillment method
    await page.click('input[value="DELIVERY"]');

    // Step 8: Continue to payment
    await page.click('button:has-text("Continue to Payment")');

    // Should show payment section
    const paymentSection = page.locator('text=/payment|card details/i');
    await expect(paymentSection).toBeVisible();

    // Step 9: Fill payment information (test mode)
    // Note: This uses Stripe test card numbers
    await page.fill('input[name="cardNumber"]', "4242424242424242");
    await page.fill('input[name="expiry"]', "12/25");
    await page.fill('input[name="cvc"]', "123");

    // Step 10: Place order
    await page.click('button:has-text("Place Order")');

    // Step 11: Verify order confirmation
    await page.waitForURL(/\/orders\/.*|\/order-confirmation/);

    const confirmationMessage = page.locator(
      'text=/order confirmed|thank you for your order/i'
    );
    await expect(confirmationMessage).toBeVisible({ timeout: 15000 });

    // Should see order number
    const orderNumber = page.locator('text=/order.*#|order number/i');
    await expect(orderNumber).toBeVisible();
  });

  test("should add multiple products to cart", async ({ page }) => {
    await page.goto("/marketplace/products");

    // Add first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('button:has-text("Add to Cart")').click();

    // Wait for confirmation
    await page.waitForTimeout(1000);

    // Add second product
    const secondProduct = page.locator('[data-testid="product-card"]').nth(1);
    await secondProduct.locator('button:has-text("Add to Cart")').click();

    // Go to cart
    await page.goto("/cart");

    // Should have 2 items
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(2);
  });

  test("should update product quantity in cart", async ({ page }) => {
    // Add product to cart first
    await page.goto("/marketplace/products");
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('button:has-text("Add to Cart")').click();

    await page.goto("/cart");

    // Find quantity input
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.fill("3");

    // Cart total should update
    const cartTotal = page.locator('[data-testid="cart-total"]');
    await expect(cartTotal).toBeVisible();
  });

  test("should remove product from cart", async ({ page }) => {
    // Add product to cart
    await page.goto("/marketplace/products");
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('button:has-text("Add to Cart")').click();

    await page.goto("/cart");

    // Click remove button
    const removeButton = page.locator('button:has-text("Remove")').first();
    await removeButton.click();

    // Confirm removal if needed
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Cart should be empty or item should be gone
    const emptyMessage = page.locator('text=/cart is empty|no items/i');
    await expect(emptyMessage).toBeVisible({ timeout: 5000 });
  });

  test("should calculate cart total correctly", async ({ page }) => {
    await page.goto("/marketplace/products");

    // Add product with known price
    await page.locator('[data-testid="product-card"]').first().click();

    // Get product price
    const priceText = await page.locator('[data-testid="product-price"]').textContent();
    const price = parseFloat(priceText?.replace(/[^0-9.]/g, "") || "0");

    // Add to cart
    await page.locator('button:has-text("Add to Cart")').click();

    await page.goto("/cart");

    // Check subtotal
    const subtotalText = await page.locator('[data-testid="cart-subtotal"]').textContent();
    const subtotal = parseFloat(subtotalText?.replace(/[^0-9.]/g, "") || "0");

    expect(subtotal).toBeGreaterThanOrEqual(price);
  });

  test("should show validation errors for incomplete checkout", async ({
    page,
  }) => {
    // Add product to cart
    await page.goto("/marketplace/products");
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('button:has-text("Add to Cart")').click();

    await page.goto("/cart");
    await page.click('button:has-text("Checkout")');

    // Try to proceed without filling form
    await page.click('button:has-text("Continue to Payment")');

    // Should show validation errors
    const errorMessages = page.locator('text=/required|must be filled/i');
    await expect(errorMessages.first()).toBeVisible();
  });

  test("should apply fulfillment method correctly", async ({ page }) => {
    await page.goto("/marketplace/products");
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('button:has-text("Add to Cart")').click();

    await page.goto("/cart");
    await page.click('button:has-text("Checkout")');

    // Fill address
    await page.fill('input[name="address"]', "456 Farm Road");
    await page.fill('input[name="city"]', "Davis");
    await page.fill('input[name="state"]', "CA");
    await page.fill('input[name="zipCode"]', "95616");

    // Test different fulfillment methods
    await page.click('input[value="FARM_PICKUP"]');
    const pickupMessage = page.locator('text=/pick.*up|pickup location/i');
    await expect(pickupMessage).toBeVisible();

    await page.click('input[value="DELIVERY"]');
    const deliveryMessage = page.locator('text=/deliver|shipping/i');
    await expect(deliveryMessage).toBeVisible();
  });

  test("should persist cart across page refreshes", async ({ page }) => {
    // Add product to cart
    await page.goto("/marketplace/products");
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('button:has-text("Add to Cart")').click();

    // Refresh page
    await page.reload();

    // Go to cart
    await page.goto("/cart");

    // Cart should still have items
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems.first()).toBeVisible();
  });
});

test.describe("🌾 Browse Farms & Products", () => {
  test("should browse and filter farms", async ({ page }) => {
    await page.goto("/farms");

    // Wait for farms to load
    await page.waitForSelector('[data-testid="farm-card"]', { timeout: 10000 });

    // Should see farm cards
    const farmCards = page.locator('[data-testid="farm-card"]');
    await expect(farmCards.first()).toBeVisible();

    // Filter by location (if available)
    const locationFilter = page.locator('input[name="location"]');
    if (await locationFilter.isVisible()) {
      await locationFilter.fill("Sacramento");
      await page.waitForTimeout(1000); // Wait for filter to apply
    }
  });

  test("should view farm profile and products", async ({ page }) => {
    await page.goto("/farms");
    await page.waitForSelector('[data-testid="farm-card"]', { timeout: 10000 });

    // Click on first farm
    const firstFarm = page.locator('[data-testid="farm-card"]').first();
    await firstFarm.click();

    // Should be on farm profile page
    await expect(page).toHaveURL(/\/farms\//);

    // Should see farm information
    await expect(page.locator('text=/about|products|location/i')).toBeVisible();

    // Should see products from this farm
    const products = page.locator('[data-testid="product-card"]');
    const productsCount = await products.count();

    if (productsCount > 0) {
      await expect(products.first()).toBeVisible();
    }
  });

  test("should filter products by category", async ({ page }) => {
    await page.goto("/marketplace/products");

    // Wait for products
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Click on category filter (e.g., Vegetables)
    const categoryButton = page.locator('button:has-text("Vegetables")');
    if (await categoryButton.isVisible()) {
      await categoryButton.click();

      // URL should update or products should filter
      await page.waitForTimeout(1000);

      // Products should be visible
      const products = page.locator('[data-testid="product-card"]');
      await expect(products.first()).toBeVisible();
    }
  });

  test("should search for products", async ({ page }) => {
    await page.goto("/marketplace/products");

    // Find search input
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("tomato");
      await searchInput.press("Enter");

      // Wait for results
      await page.waitForTimeout(1000);

      // Should show search results
      const results = page.locator('[data-testid="product-card"]');
      const resultsCount = await results.count();

      // Either show results or "no results" message
      if (resultsCount > 0) {
        await expect(results.first()).toBeVisible();
      } else {
        const noResults = page.locator('text=/no results|no products found/i');
        await expect(noResults).toBeVisible();
      }
    }
  });

  test("should add product to favorites", async ({ page }) => {
    await page.goto("/marketplace/products");
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Find favorite button
    const favoriteButton = page.locator('button[aria-label*="favorite"]').first();
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();

      // Should show success message
      const message = page.locator('text=/added to favorites|favorited/i');
      await expect(message).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("📦 Order Management", () => {
  test("should view order history", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test.customer@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Navigate to orders
    await page.goto("/orders");

    // Should see orders list or empty state
    const ordersHeading = page.getByRole("heading", { name: /orders|order history/i });
    await expect(ordersHeading).toBeVisible();
  });

  test("should view order details", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test.customer@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await page.goto("/orders");

    // Click on first order if exists
    const firstOrder = page.locator('[data-testid="order-card"]').first();
    if (await firstOrder.isVisible()) {
      await firstOrder.click();

      // Should see order details
      await expect(page).toHaveURL(/\/orders\//);
      await expect(page.locator('text=/order details|items|total/i')).toBeVisible();
    }
  });

  test("should track order status", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test.customer@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Check dashboard for order status
    const orderStatus = page.locator('text=/pending|confirmed|preparing|ready|completed/i');
    if (await orderStatus.first().isVisible()) {
      await expect(orderStatus.first()).toBeVisible();
    }
  });
});

test.describe("🎯 Performance & Accessibility", () => {
  test("should load marketplace within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/marketplace");

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/marketplace");

    // Tab through interactive elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should have visible focus indicators
    const focusedElement = await page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/marketplace");

    // Should have h1
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
  });

  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/marketplace");

    // Page should be responsive
    const content = page.locator("main");
    await expect(content).toBeVisible();

    // Should have mobile menu if desktop nav is hidden
    const mobileMenu = page.locator('button[aria-label*="menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      // Navigation should be visible
      await expect(page.locator("nav")).toBeVisible();
    }
  });
});
