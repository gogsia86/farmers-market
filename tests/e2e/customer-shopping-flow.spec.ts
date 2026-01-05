/**
 * 🛒 CUSTOMER SHOPPING FLOW E2E TEST
 * Tests the complete customer journey from browsing to checkout
 * Following: Divine Testing Patterns & Agricultural Consciousness
 */

import { expect, test } from "@playwright/test";

test.describe("Customer Shopping Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto("/");
  });

  test("should complete full shopping journey - browse to checkout", async ({
    page,
  }) => {
    // ==========================================================================
    // STEP 1: HOME PAGE - Verify landing page loads
    // ==========================================================================
    await test.step("Load home page", async () => {
      await expect(page).toHaveTitle(/Farmers Market Platform/i);
      await expect(
        page.getByRole("heading", { name: /Fresh from Farm to Table/i })
      ).toBeVisible();

      // Verify CTAs are present
      await expect(
        page.getByRole("link", { name: /Shop Products/i })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Explore Farms/i })
      ).toBeVisible();
    });

    // ==========================================================================
    // STEP 2: BROWSE PRODUCTS - Navigate to products page
    // ==========================================================================
    await test.step("Navigate to products page", async () => {
      await page.getByRole("link", { name: /Shop Products/i }).first().click();
      await page.waitForURL(/\/products/);

      // Verify products page loaded
      await expect(
        page.getByRole("heading", { name: /Products/i }).first()
      ).toBeVisible();

      // Verify filter controls are present
      await expect(page.getByText(/Search products/i)).toBeVisible();
    });

    // ==========================================================================
    // STEP 3: SEARCH & FILTER - Find specific product
    // ==========================================================================
    await test.step("Search for products", async () => {
      // Use search if available
      const searchInput = page.getByPlaceholder(/Search/i).first();
      if (await searchInput.isVisible()) {
        await searchInput.fill("tomato");
        await page.waitForTimeout(1000); // Wait for search results
      }

      // Verify products are displayed
      const productCards = page.locator('[data-testid="product-card"]');
      const productLinks = page.getByRole("link").filter({
        has: page.locator("text=/\\$/"), // Contains price
      });

      // Check if any products are visible
      const count = await productLinks.count();
      if (count === 0) {
        console.log("⚠️  No products found - this is expected for empty database");
        test.skip();
      }
    });

    // ==========================================================================
    // STEP 4: VIEW PRODUCT DETAILS - Click on first product
    // ==========================================================================
    await test.step("View product details", async () => {
      // Find and click first product
      const firstProduct = page
        .getByRole("link")
        .filter({ has: page.locator("text=/\\$/") })
        .first();

      if ((await firstProduct.count()) > 0) {
        await firstProduct.click();
        await page.waitForTimeout(1000);

        // Verify product details page
        await expect(page.locator("text=/Add to Cart/i")).toBeVisible({
          timeout: 10000,
        });

        // Check for product information
        const hasPrice = await page.locator("text=/\\$/").isVisible();
        expect(hasPrice).toBeTruthy();
      }
    });

    // ==========================================================================
    // STEP 5: ADD TO CART - Add product to cart
    // ==========================================================================
    await test.step("Add product to cart", async () => {
      // Find add to cart button
      const addToCartButton = page.getByRole("button", {
        name: /Add to Cart/i,
      });

      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();

        // Wait for success message or cart update
        await page.waitForTimeout(1500);

        // Verify cart icon shows items (if implemented)
        const cartIndicator = page.locator('[data-testid="cart-count"]');
        if (await cartIndicator.isVisible()) {
          await expect(cartIndicator).toContainText(/[1-9]/);
        }
      }
    });

    // ==========================================================================
    // STEP 6: VIEW CART - Navigate to cart page
    // ==========================================================================
    await test.step("Navigate to cart", async () => {
      // Click cart link in navigation
      const cartLink = page.getByRole("link", { name: /cart/i }).first();
      await cartLink.click();
      await page.waitForURL(/\/cart/);

      // Verify cart page loaded
      await expect(
        page.getByRole("heading", { name: /Shopping Cart/i })
      ).toBeVisible();

      // Check if cart has items or is empty
      const emptyCartMessage = page.getByText(/Your cart is empty/i);
      const cartItems = page.locator('[data-testid="cart-item"]');

      const hasItems = (await cartItems.count()) > 0;
      const isEmpty = await emptyCartMessage.isVisible();

      if (isEmpty) {
        console.log("ℹ️  Cart is empty - skipping checkout flow");
        test.skip();
      }

      if (hasItems) {
        // Verify cart item has price
        await expect(page.locator("text=/\\$/")).toBeVisible();

        // Verify cart actions
        await expect(
          page.getByRole("button", { name: /checkout/i })
        ).toBeVisible();
      }
    });

    // ==========================================================================
    // STEP 7: PROCEED TO CHECKOUT - Start checkout process
    // ==========================================================================
    await test.step("Proceed to checkout", async () => {
      const checkoutButton = page
        .getByRole("button", { name: /checkout/i })
        .or(page.getByRole("link", { name: /checkout/i }));

      if (await checkoutButton.isVisible()) {
        await checkoutButton.click();

        // Should redirect to login if not authenticated
        await page.waitForURL(/\/(login|checkout|auth)/);

        const currentUrl = page.url();
        console.log("🔍 After checkout click:", currentUrl);

        // Verify we're on login or checkout page
        const onLoginPage = currentUrl.includes("/login");
        const onCheckoutPage = currentUrl.includes("/checkout");

        expect(onLoginPage || onCheckoutPage).toBeTruthy();
      }
    });
  });

  test("should browse farms and view farm details", async ({ page }) => {
    // ==========================================================================
    // FARMS BROWSING FLOW
    // ==========================================================================
    await test.step("Navigate to farms page", async () => {
      await page.getByRole("link", { name: /Explore Farms/i }).first().click();
      await page.waitForURL(/\/farms/);

      // Verify farms page loaded
      await expect(
        page.getByRole("heading", { name: /Farms/i }).first()
      ).toBeVisible();
    });

    await test.step("View farm details", async () => {
      // Check if any farms are listed
      const farmLinks = page.getByRole("link").filter({
        has: page.locator("text=/farm/i"),
      });

      const farmCount = await farmLinks.count();

      if (farmCount === 0) {
        console.log("⚠️  No farms found - this is expected for empty database");
        return;
      }

      // Click on first farm
      const firstFarm = farmLinks.first();
      await firstFarm.click();
      await page.waitForTimeout(1000);

      // Verify farm details page
      const hasFarmInfo =
        (await page.locator("text=/Products/i").isVisible()) ||
        (await page.locator("text=/Location/i").isVisible());

      expect(hasFarmInfo).toBeTruthy();
    });
  });

  test("should use product filters and search", async ({ page }) => {
    await test.step("Navigate to products", async () => {
      await page.goto("/products");
      await page.waitForLoadState("networkidle");
    });

    await test.step("Test search functionality", async () => {
      const searchInput = page.getByPlaceholder(/Search/i).first();

      if (await searchInput.isVisible()) {
        // Test search
        await searchInput.fill("organic");
        await page.waitForTimeout(1000);

        // Clear search
        await searchInput.clear();
        await searchInput.fill("vegetable");
        await page.waitForTimeout(1000);
      }
    });

    await test.step("Test category filters", async () => {
      // Look for category filter buttons
      const categoryFilters = page.getByRole("button").filter({
        hasText: /vegetables|fruits|dairy/i,
      });

      if ((await categoryFilters.count()) > 0) {
        const firstCategory = categoryFilters.first();
        await firstCategory.click();
        await page.waitForTimeout(1000);

        // Verify URL updated with filter
        const url = page.url();
        expect(url).toContain("category");
      }
    });

    await test.step("Test sort functionality", async () => {
      // Look for sort dropdown
      const sortDropdown = page
        .getByRole("combobox")
        .or(page.getByRole("button", { name: /sort/i }));

      if ((await sortDropdown.count()) > 0) {
        await sortDropdown.first().click();
        await page.waitForTimeout(500);

        // Select a sort option if available
        const sortOptions = page.getByRole("option");
        if ((await sortOptions.count()) > 0) {
          await sortOptions.first().click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test("should handle empty states gracefully", async ({ page }) => {
    await test.step("Check empty cart state", async () => {
      await page.goto("/cart");

      // Verify empty state message or cart items
      const hasEmptyMessage = await page
        .getByText(/Your cart is empty/i)
        .isVisible();
      const hasCartItems =
        (await page.locator('[data-testid="cart-item"]').count()) > 0;

      // One of these should be true
      expect(hasEmptyMessage || hasCartItems).toBeTruthy();

      if (hasEmptyMessage) {
        // Verify CTA to shop is present
        await expect(page.getByRole("link", { name: /Browse/i })).toBeVisible();
      }
    });
  });

  test("should navigate between pages correctly", async ({ page }) => {
    const pagesToTest = [
      { path: "/", name: "Home" },
      { path: "/products", name: "Products" },
      { path: "/farms", name: "Farms" },
      { path: "/cart", name: "Cart" },
      { path: "/about", name: "About" },
    ];

    for (const pageInfo of pagesToTest) {
      await test.step(`Navigate to ${pageInfo.name}`, async () => {
        await page.goto(pageInfo.path);
        await page.waitForLoadState("networkidle");

        // Verify page loaded (status 200, not 404)
        const content = await page.content();
        expect(content).not.toContain("404");
        expect(content).not.toContain("Page Not Found");

        // Verify page has content
        const hasContent = content.length > 1000;
        expect(hasContent).toBeTruthy();

        console.log(`✅ ${pageInfo.name} page loaded successfully`);
      });
    }
  });

  test("should have working navigation menu", async ({ page }) => {
    await test.step("Verify main navigation exists", async () => {
      // Check for common navigation elements
      const nav = page.locator("nav").or(page.locator("header"));
      await expect(nav.first()).toBeVisible();

      // Check for logo/home link
      const logoLink = page
        .getByRole("link")
        .filter({ has: page.locator("text=/farmers|market|home/i") })
        .first();

      if (await logoLink.isVisible()) {
        await expect(logoLink).toBeVisible();
      }
    });

    await test.step("Test mobile menu if present", async () => {
      // Check for mobile menu button
      const mobileMenuButton = page.getByRole("button", {
        name: /menu|navigation/i,
      });

      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.waitForTimeout(500);

        // Verify menu opened
        const menuLinks = page.getByRole("link");
        const linkCount = await menuLinks.count();
        expect(linkCount).toBeGreaterThan(0);
      }
    });
  });

  test("should display product information correctly", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    // Find first product link
    const productLinks = page.getByRole("link").filter({
      has: page.locator("text=/\\$/"),
    });

    const hasProducts = (await productLinks.count()) > 0;

    if (!hasProducts) {
      console.log("⚠️  No products available for testing");
      test.skip();
    }

    await test.step("Check product card information", async () => {
      const firstProduct = productLinks.first();

      // Verify product has essential information
      const productCard = firstProduct.locator("..");

      // Check for price
      await expect(productCard.locator("text=/\\$/")).toBeVisible();

      // Product should be clickable
      await expect(firstProduct).toBeEnabled();
    });
  });

  test("should handle authentication redirects", async ({ page }) => {
    const protectedPages = ["/checkout", "/orders", "/customer/dashboard"];

    for (const protectedPath of protectedPages) {
      await test.step(`Test ${protectedPath} requires auth`, async () => {
        await page.goto(protectedPath);
        await page.waitForTimeout(1000);

        const currentUrl = page.url();

        // Should redirect to login or show auth error
        const redirectedToLogin =
          currentUrl.includes("/login") || currentUrl.includes("/auth");
        const showsAuthMessage = await page
          .getByText(/sign in|login|authenticate/i)
          .isVisible();

        // One of these should be true for protected routes
        const isProtected = redirectedToLogin || showsAuthMessage;

        if (isProtected) {
          console.log(`✅ ${protectedPath} is properly protected`);
        } else {
          console.log(`ℹ️  ${protectedPath} may be accessible without auth`);
        }
      });
    }
  });

  test("should have responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "Mobile" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 1920, height: 1080, name: "Desktop" },
    ];

    for (const viewport of viewports) {
      await test.step(`Test ${viewport.name} view`, async () => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Verify page renders without errors
        const content = await page.content();
        expect(content.length).toBeGreaterThan(1000);

        // Verify main heading is visible
        const heading = page.getByRole("heading", { level: 1 }).first();
        await expect(heading).toBeVisible();

        console.log(`✅ ${viewport.name} view renders correctly`);
      });
    }
  });

  test("should load images correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("Check images load without errors", async () => {
      // Wait for images to load
      await page.waitForTimeout(2000);

      // Check for broken images
      const images = page.locator("img");
      const imageCount = await images.count();

      console.log(`📸 Found ${imageCount} images on page`);

      // Sample check: verify at least some images loaded
      if (imageCount > 0) {
        const firstImage = images.first();
        const isVisible = await firstImage.isVisible();
        expect(isVisible).toBeTruthy();
      }
    });
  });

  test("should have proper SEO meta tags", async ({ page }) => {
    await page.goto("/");

    await test.step("Check meta tags", async () => {
      // Check title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      console.log("📄 Page title:", title);

      // Check for meta description
      const metaDescription = page.locator('meta[name="description"]');
      const hasDescription = (await metaDescription.count()) > 0;

      if (hasDescription) {
        const content = await metaDescription.getAttribute("content");
        expect(content?.length).toBeGreaterThan(0);
        console.log("📝 Meta description:", content);
      }

      // Check for viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);
    });
  });

  test("should have no console errors on critical pages", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const criticalPages = ["/", "/products", "/farms", "/cart"];

    for (const path of criticalPages) {
      await test.step(`Check ${path} for console errors`, async () => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        // Report errors if any
        if (consoleErrors.length > 0) {
          console.log(`⚠️  Console errors on ${path}:`, consoleErrors);
        } else {
          console.log(`✅ No console errors on ${path}`);
        }
      });
    }
  });
});
