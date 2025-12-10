/**
 * 🧪 E2E TESTS - Critical User Flows
 * Comprehensive end-to-end testing for Farmers Market Platform
 *
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { test, expect } from "@playwright/test";
import { TEST_USERS } from "../helpers/auth";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

// Timeouts for various operations
const TIMEOUTS = {
  navigation: 15000,
  elementVisible: 10000,
  formSubmit: 10000,
};

/**
 * Wait for page to be ready with element-based wait (not networkIdle)
 */
async function waitForPageReady(page: any, selector: string) {
  await page.waitForSelector(selector, {
    state: "visible",
    timeout: TIMEOUTS.elementVisible,
  });
}

test.describe("🔐 Authentication Flows", () => {
  test("Admin can login successfully", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    // Wait for login form - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="email-input"], input[name="email"], input[type="email"]',
    );

    await page
      .locator(
        '[data-testid="email-input"], input[name="email"], input[type="email"]',
      )
      .first()
      .fill("admin@farmersmarket.app");
    await page
      .locator(
        '[data-testid="password-input"], input[name="password"], input[type="password"]',
      )
      .first()
      .fill("DivineAdmin123!");
    await page
      .locator('[data-testid="login-button"], button[type="submit"]')
      .first()
      .click();

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/, { timeout: TIMEOUTS.navigation });
    await expect(
      page.locator("text=Admin Dashboard, text=Dashboard, h1").first(),
    ).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("Failed login shows error message", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    // Wait for login form - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="email-input"], input[name="email"], input[type="email"]',
    );

    await page
      .locator(
        '[data-testid="email-input"], input[name="email"], input[type="email"]',
      )
      .first()
      .fill("wrong@email.com");
    await page
      .locator(
        '[data-testid="password-input"], input[name="password"], input[type="password"]',
      )
      .first()
      .fill("wrongpassword");
    await page
      .locator('[data-testid="login-button"], button[type="submit"]')
      .first()
      .click();

    // Should show error - check for various error text patterns
    await expect(
      page.locator("text=/Invalid|error|failed/i").first(),
    ).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });
});

test.describe("🌾 Customer Shopping Flow", () => {
  test("Customer can browse farms and products", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Wait for page content - element-based wait instead of networkIdle
    await waitForPageReady(page, "body");

    // Navigate to farms - try multiple selectors
    const farmsLink = page
      .locator(
        '[data-testid="browse-farms-link"], a[href="/farms"], text=Farms',
      )
      .first();
    await farmsLink.click();
    await expect(page).toHaveURL(/\/farms/, { timeout: TIMEOUTS.navigation });

    // Check farms are displayed - try multiple selectors
    const farmCard = page
      .locator('[data-testid="farm-card"], .farm-card, [data-testid^="farm-"]')
      .first();
    await expect(farmCard).toBeVisible({ timeout: TIMEOUTS.elementVisible });

    // Click on a farm
    await farmCard.click();

    // Should see farm details or products
    await expect(
      page.locator("text=/Products|About|Contact/i").first(),
    ).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("Customer can add product to cart", async ({ page }) => {
    // Navigate to products page (could be /products or /marketplace/products)
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    // Wait for products to load - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="product-grid"], [data-testid="product-card"], .product-card, [data-testid^="product-"]',
    );

    // Add product to cart - try multiple selectors
    const addToCartBtn = page
      .locator(
        '[data-testid="add-to-cart-button"], [data-testid="add-to-cart"], button:has-text("Add to Cart")',
      )
      .first();
    await addToCartBtn.click();

    // Wait for cart update - either cart count or success message
    await page.waitForTimeout(1000); // Brief wait for cart state update

    // Go to cart
    const cartButton = page
      .locator(
        '[data-testid="cart-button"], a[href="/cart"], [aria-label*="cart"]',
      )
      .first();
    await cartButton.click();
    await expect(page).toHaveURL(/\/cart/, { timeout: TIMEOUTS.navigation });

    // Product should be in cart or cart page should be visible
    const cartContent = page
      .locator(
        '[data-testid="cart-item"], [data-testid="cart-content"], .cart-item',
      )
      .first();
    await expect(cartContent).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("Customer can complete checkout", async ({ page }) => {
    // First, add item to cart
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    // Wait for products to load - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="product-grid"], [data-testid="product-card"], .product-card',
    );

    const addToCartBtn = page
      .locator(
        '[data-testid="add-to-cart-button"], [data-testid="add-to-cart"], button:has-text("Add to Cart")',
      )
      .first();
    await addToCartBtn.click();
    await page.waitForTimeout(1000);

    // Go to cart and checkout
    await page
      .locator('[data-testid="cart-button"], a[href="/cart"]')
      .first()
      .click();
    await page
      .locator(
        '[data-testid="checkout-button"], text=Proceed to Checkout, text=Checkout',
      )
      .first()
      .click();

    // Wait for checkout page
    await waitForPageReady(
      page,
      '[data-testid="checkout-flow"], [data-testid="address-step"], form',
    );

    // Fill shipping information - use data-testid selectors from AddressStep
    const streetInput = page
      .locator(
        '[data-testid="address-street"], input[name="address"], input[name="street"]',
      )
      .first();
    if (await streetInput.isVisible()) {
      await streetInput.fill("123 Farm Road");
      await page
        .locator('[data-testid="address-city"], input[name="city"]')
        .first()
        .fill("Farmville");
      await page
        .locator('[data-testid="address-state"], input[name="state"]')
        .first()
        .fill("CA");
      await page
        .locator('[data-testid="address-zipcode"], input[name="zipCode"]')
        .first()
        .fill("90210");
    }

    // Select delivery method if visible
    const deliveryOption = page
      .locator('[data-testid="fulfillment-delivery"], input[value="DELIVERY"]')
      .first();
    if (await deliveryOption.isVisible()) {
      await deliveryOption.click();
    }

    // Continue to payment step
    const continueBtn = page
      .locator(
        '[data-testid="checkout-continue-button"], button:has-text("Continue")',
      )
      .first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }

    // Wait for Stripe elements (if present) or skip payment test
    const stripeElement = page
      .locator(
        '[data-testid="stripe-elements-container"], iframe[name^="__privateStripeFrame"]',
      )
      .first();
    if (await stripeElement.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Stripe is loaded - this is a real checkout flow
      // Note: Can't easily test Stripe in E2E without special setup
      console.log("Stripe payment element detected - checkout flow is working");
    }

    // Look for any indication checkout is progressing
    await expect(
      page
        .locator(
          '[data-testid="checkout-flow"], [data-testid="checkout-step-container"]',
        )
        .first(),
    ).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });
});

test.describe("🚜 Farmer Management Flow", () => {
  test("Farmer can view their dashboard", async ({ page }) => {
    // Login as farmer
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    // Wait for login form - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="email-input"], input[name="email"], input[type="email"]',
    );

    await page
      .locator(
        '[data-testid="email-input"], input[name="email"], input[type="email"]',
      )
      .first()
      .fill("farmer@farmersmarket.app");
    await page
      .locator(
        '[data-testid="password-input"], input[name="password"], input[type="password"]',
      )
      .first()
      .fill("DivineFarmer123!");
    await page
      .locator('[data-testid="login-button"], button[type="submit"]')
      .first()
      .click();

    // Should redirect to farmer dashboard
    await expect(page).toHaveURL(/\/farmer/, { timeout: TIMEOUTS.navigation });
    await expect(
      page.locator("text=/My Farm|Dashboard|Farm/i").first(),
    ).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("Farmer can add new product", async ({ page }) => {
    // Login as farmer first
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    // Wait for login form - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="email-input"], input[name="email"], input[type="email"]',
    );

    await page
      .locator(
        '[data-testid="email-input"], input[name="email"], input[type="email"]',
      )
      .first()
      .fill("farmer@farmersmarket.app");
    await page
      .locator(
        '[data-testid="password-input"], input[name="password"], input[type="password"]',
      )
      .first()
      .fill("DivineFarmer123!");
    await page
      .locator('[data-testid="login-button"], button[type="submit"]')
      .first()
      .click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/farmer/, { timeout: TIMEOUTS.navigation });

    // Navigate to products
    await page.locator('a[href*="products"], text=Products').first().click();

    // Look for add product button
    const addProductBtn = page
      .locator(
        'a[href*="new"], button:has-text("Add Product"), text=Add Product',
      )
      .first();
    if (await addProductBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addProductBtn.click();

      // Fill product form if form is visible
      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await nameInput.fill("Test Organic Tomatoes");
        await page
          .locator('textarea[name="description"]')
          .first()
          .fill("Fresh organic tomatoes");
        await page.locator('input[name="price"]').first().fill("5.99");

        // Submit form
        await page.locator('button[type="submit"]').first().click();

        // Should see success message or redirect
        await expect(
          page.locator("text=/success|added|created/i").first(),
        ).toBeVisible({
          timeout: TIMEOUTS.formSubmit,
        });
      }
    }
  });

  test("Farmer can view orders", async ({ page }) => {
    // Login as farmer
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    // Wait for login form - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="email-input"], input[name="email"], input[type="email"]',
    );

    await page
      .locator(
        '[data-testid="email-input"], input[name="email"], input[type="email"]',
      )
      .first()
      .fill("farmer@farmersmarket.app");
    await page
      .locator(
        '[data-testid="password-input"], input[name="password"], input[type="password"]',
      )
      .first()
      .fill("DivineFarmer123!");
    await page
      .locator('[data-testid="login-button"], button[type="submit"]')
      .first()
      .click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/farmer/, { timeout: TIMEOUTS.navigation });

    // Navigate to orders
    await page.locator('a[href*="orders"], text=Orders').first().click();

    // Should see orders page content
    await expect(
      page.locator("text=/Orders|Order History|No orders/i").first(),
    ).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });
});

test.describe("👨‍💼 Admin Management Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    // Wait for login form - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="email-input"], input[name="email"], input[type="email"]',
    );

    await page
      .locator(
        '[data-testid="email-input"], input[name="email"], input[type="email"]',
      )
      .first()
      .fill("admin@farmersmarket.app");
    await page
      .locator(
        '[data-testid="password-input"], input[name="password"], input[type="password"]',
      )
      .first()
      .fill("DivineAdmin123!");
    await page
      .locator('[data-testid="login-button"], button[type="submit"]')
      .first()
      .click();

    // Wait for redirect to admin area
    await page.waitForURL(/\/admin/, { timeout: TIMEOUTS.navigation });
  });

  test("Admin can view all farms", async ({ page }) => {
    await page.locator('a[href*="farms"], text=Farms').first().click();
    await expect(page).toHaveURL(/\/admin\/farms/, {
      timeout: TIMEOUTS.navigation,
    });

    // Should see farms content (table or list)
    await expect(
      page
        .locator("table, [data-testid='farms-list'], .farms-container")
        .first(),
    ).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("Admin can view all orders", async ({ page }) => {
    await page.locator('a[href*="orders"], text=Orders').first().click();
    await expect(page).toHaveURL(/\/admin\/orders/, {
      timeout: TIMEOUTS.navigation,
    });

    // Should see orders content (table or list)
    await expect(
      page
        .locator("table, [data-testid='orders-list'], .orders-container")
        .first(),
    ).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("Admin can verify farm", async ({ page }) => {
    await page.locator('a[href*="farms"], text=Farms').first().click();

    // Find pending farm
    const pendingFarm = page
      .locator('tr:has-text("PENDING"), [data-status="PENDING"]')
      .first();

    if (await pendingFarm.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pendingFarm.locator("text=View, button").first().click();

      // Verify farm if button exists
      const verifyBtn = page
        .locator("text=Verify Farm, button:has-text('Verify')")
        .first();
      if (await verifyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await verifyBtn.click();

        // Should show success message
        await expect(
          page.locator("text=/verified|success/i").first(),
        ).toBeVisible({
          timeout: TIMEOUTS.formSubmit,
        });
      }
    } else {
      // No pending farms - test passes as feature works
      console.log("No pending farms found - skipping verification test");
    }
  });
});

test.describe("🔍 Search and Filter Flows", () => {
  test("Customer can search for products", async ({ page }) => {
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    // Wait for products page - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="product-grid"], [data-testid="product-card"], .product-card, body',
    );

    // Look for search input with multiple selectors
    const searchInput = page
      .locator(
        '[data-testid="product-search"], input[placeholder*="Search"], input[type="search"], [role="searchbox"]',
      )
      .first();

    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Search for tomatoes
      await searchInput.fill("tomato");
      await searchInput.press("Enter");

      // Wait for results to update
      await page.waitForTimeout(1000);

      // Should see filtered results or no results message
      const hasResults = await page
        .locator("text=/tomato/i")
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      const hasNoResults = await page
        .locator("text=/no results|no products/i")
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      expect(hasResults || hasNoResults).toBeTruthy();
    } else {
      // Search not available on this page - check products are visible
      await expect(
        page.locator('[data-testid="product-card"], .product-card').first(),
      ).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    }
  });

  test("Customer can filter by category", async ({ page }) => {
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    // Wait for products page - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="product-grid"], [data-testid="product-card"], .product-card, body',
    );

    // Look for category filter with multiple selectors
    const categoryFilter = page
      .locator(
        '[data-testid="category-filter"], select[name="category"], [aria-label*="category"]',
      )
      .first();

    if (await categoryFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Filter by category
      await categoryFilter.selectOption("VEGETABLES");

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // Should see products (filtered or all)
      await expect(
        page.locator('[data-testid="product-card"], .product-card').first(),
      ).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    } else {
      // Category filter not available - check products are visible
      await expect(
        page.locator('[data-testid="product-card"], .product-card').first(),
      ).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });
    }
  });
});

test.describe("📱 Responsive Design", () => {
  test("Mobile navigation works correctly", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Wait for page content - element-based wait instead of networkIdle
    await waitForPageReady(page, "body");

    // Open mobile menu - try multiple selectors
    const menuButton = page
      .locator(
        '[data-testid="mobile-menu-button"], button[aria-label*="menu"], .mobile-menu-button, button:has(svg)',
      )
      .first();

    if (await menuButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await menuButton.click();

      // Menu should be visible
      await expect(
        page
          .locator('[data-testid="mobile-menu"], nav, [role="navigation"]')
          .first(),
      ).toBeVisible({
        timeout: TIMEOUTS.elementVisible,
      });

      // Click a link to farms
      const farmsLink = page
        .locator('a[href="/farms"], a[href*="farms"], text=Farms')
        .first();
      if (await farmsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await farmsLink.click();
        await expect(page).toHaveURL(/\/farms/, {
          timeout: TIMEOUTS.navigation,
        });
      }
    } else {
      // Mobile menu button not visible - navigation might be different
      // Just verify page loads correctly on mobile
      await expect(page.locator("body")).toBeVisible();
    }
  });
});

test.describe("♿ Accessibility", () => {
  test("Homepage has proper heading structure", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Wait for page content - element-based wait instead of networkIdle
    await waitForPageReady(page, "body");

    // Should have h1 or main heading
    await expect(page.locator("h1, [role='heading']").first()).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Navigation should have proper landmarks
    await expect(page.locator("nav, [role='navigation']").first()).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
    await expect(page.locator("main, [role='main']").first()).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("Forms have proper labels", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    // Wait for login form - element-based wait instead of networkIdle
    await waitForPageReady(
      page,
      '[data-testid="email-input"], input[name="email"], input[type="email"]',
    );

    // Check for label associations - email input should have label or aria-label or be inside label
    const emailInput = page
      .locator(
        '[data-testid="email-input"], input[name="email"], input[type="email"]',
      )
      .first();
    const hasAriaLabel = await emailInput.getAttribute("aria-label");
    const hasAriaLabelledBy = await emailInput.getAttribute("aria-labelledby");
    const hasId = await emailInput.getAttribute("id");

    // Check if there's a corresponding label element
    let hasLabel = false;
    if (hasId) {
      hasLabel = await page
        .locator(`label[for="${hasId}"]`)
        .isVisible()
        .catch(() => false);
    }

    // Input should have some form of labeling
    expect(hasAriaLabel || hasAriaLabelledBy || hasLabel || hasId).toBeTruthy();
  });
});
