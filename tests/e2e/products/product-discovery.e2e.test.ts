/**
 * Product Discovery E2E Test
 *
 * Scenario: Customer discovers and browses products
 * Steps: Homepage → Product catalog → Search → Filter → Product detail → Related products
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

test.describe("Product Discovery Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto(BASE_URL);
  });

  test("should browse product catalog from homepage", async ({ page }) => {
    // Click on "Browse Products" or similar link
    const productsLink = page.getByRole("link", {
      name: /products|shop|browse/i,
    });
    await productsLink.click();

    // Wait for navigation to products page
    await page.waitForURL(/\/products/);

    // Verify products page loaded
    await expect(
      page.getByRole("heading", { name: /products|shop/i }),
    ).toBeVisible();

    // Verify product grid is visible
    const productGrid = page
      .locator('[data-testid="product-grid"]')
      .or(page.locator(".product-grid"));
    await expect(productGrid).toBeVisible();

    // Verify at least one product card is visible
    const productCards = page
      .locator('[data-testid="product-card"]')
      .or(page.locator(".product-card"));
    await expect(productCards.first()).toBeVisible();
  });

  test("should display product information correctly", async ({ page }) => {
    // Navigate to products page
    await page.goto(`${BASE_URL}/products`);

    // Wait for products to load
    await page
      .waitForSelector('[data-testid="product-card"]', {
        state: "visible",
        timeout: 10000,
      })
      .catch(() => {
        // Fallback selector
        return page.waitForSelector(".product-card", { state: "visible" });
      });

    // Get first product card
    const firstProduct = page
      .locator('[data-testid="product-card"]')
      .first()
      .or(page.locator(".product-card").first());

    // Verify product card contains required information
    await expect(firstProduct).toBeVisible();

    // Product should have a name/title
    const productName = firstProduct
      .locator('h2,h3,h4,[data-testid="product-name"]')
      .first();
    await expect(productName).toBeVisible();

    // Product should have a price
    const productPrice = firstProduct
      .locator('[data-testid="product-price"]')
      .or(firstProduct.locator("text=/\\$\\d+\\.\\d{2}/"));
    await expect(productPrice).toBeVisible();

    // Product should have an image
    const productImage = firstProduct.locator("img").first();
    await expect(productImage).toBeVisible();
  });

  test("should filter products by category", async ({ page }) => {
    await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });

    // Wait for products to load - element-based wait instead of networkIdle
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
      { state: "visible", timeout: 10000 },
    );

    // Look for category filter
    const categoryFilter = page
      .locator('[data-testid="category-filter"]')
      .or(page.getByLabel(/category/i));

    if (await categoryFilter.isVisible()) {
      // Click on a category (e.g., Vegetables)
      await categoryFilter.click();

      const vegetablesOption = page
        .getByRole("option", { name: /vegetables/i })
        .or(page.getByText(/vegetables/i));

      if (await vegetablesOption.isVisible()) {
        await vegetablesOption.click();

        // Wait for filtered results
        await page.waitForTimeout(1000);

        // Verify URL contains category parameter
        await expect(page).toHaveURL(/category=VEGETABLES/i);

        // Verify products are displayed
        const productCards = page
          .locator('[data-testid="product-card"]')
          .or(page.locator(".product-card"));
        await expect(productCards.first()).toBeVisible();
      }
    }
  });

  test("should search for products", async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);

    // Find search input
    const searchInput = page
      .locator('[data-testid="product-search"]')
      .or(page.getByPlaceholder(/search/i))
      .or(page.getByRole("searchbox"));

    // Type search query
    await searchInput.fill("tomato");

    // Submit search (either by pressing Enter or clicking search button)
    await searchInput.press("Enter").catch(async () => {
      // Fallback: click search button if Enter doesn't work
      const searchButton = page.getByRole("button", { name: /search/i });
      if (await searchButton.isVisible()) {
        await searchButton.click();
      }
    });

    // Wait for search results
    await page.waitForTimeout(1000);

    // Verify URL contains search query
    await expect(page).toHaveURL(/[?&]q=tomato/i);

    // Verify search results are displayed
    const results = page
      .locator('[data-testid="search-results"]')
      .or(page.locator('[data-testid="product-grid"]'));
    await expect(results).toBeVisible();
  });

  test("should navigate to product detail page", async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);

    // Wait for products to load
    await page
      .waitForSelector('[data-testid="product-card"]', {
        state: "visible",
        timeout: 10000,
      })
      .catch(() => {
        return page.waitForSelector(".product-card", { state: "visible" });
      });

    // Click on first product
    const firstProduct = page
      .locator('[data-testid="product-card"]')
      .first()
      .or(page.locator(".product-card").first());

    await firstProduct.click();

    // Wait for navigation to detail page
    await page.waitForURL(/\/products\/.+/);

    // Verify product detail page elements
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Verify product image is visible
    const productImage = page
      .locator('[data-testid="product-image"]')
      .or(page.locator('img[alt*="product" i]'));
    await expect(productImage.first()).toBeVisible();

    // Verify price is visible
    const price = page
      .locator('[data-testid="product-price"]')
      .or(page.locator("text=/\\$\\d+\\.\\d{2}/"));
    await expect(price.first()).toBeVisible();

    // Verify description is visible
    const description = page
      .locator('[data-testid="product-description"]')
      .or(page.locator("text=/description/i").locator(".."));
    await expect(description).toBeVisible();
  });

  test("should view related products", async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);

    // Wait for products and click first one
    await page
      .waitForSelector('[data-testid="product-card"]', {
        state: "visible",
        timeout: 10000,
      })
      .catch(() => {
        return page.waitForSelector(".product-card", { state: "visible" });
      });

    const firstProduct = page
      .locator('[data-testid="product-card"]')
      .first()
      .or(page.locator(".product-card").first());

    await firstProduct.click();
    await page.waitForURL(/\/products\/.+/);

    // Scroll down to related products section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Look for related products section
    const relatedSection = page
      .locator('[data-testid="related-products"]')
      .or(page.getByText(/related products|you may also like/i).locator(".."));

    if (await relatedSection.isVisible()) {
      // Verify related products are displayed
      const relatedProducts = relatedSection
        .locator('[data-testid="product-card"]')
        .or(relatedSection.locator(".product-card"));

      // Should have at least one related product
      await expect(relatedProducts.first()).toBeVisible();

      // Click on a related product
      await relatedProducts.first().click();

      // Verify navigation to new product
      await page.waitForURL(/\/products\/.+/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("should navigate back to catalog from product detail", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/products`);

    // Click on a product
    await page
      .waitForSelector('[data-testid="product-card"]', {
        state: "visible",
        timeout: 10000,
      })
      .catch(() => {
        return page.waitForSelector(".product-card", { state: "visible" });
      });

    const firstProduct = page
      .locator('[data-testid="product-card"]')
      .first()
      .or(page.locator(".product-card").first());

    await firstProduct.click();
    await page.waitForURL(/\/products\/.+/);

    // Click back button or "Back to Products" link
    const backButton = page
      .getByRole("button", { name: /back/i })
      .or(page.getByRole("link", { name: /back to products/i }));

    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/\/products$/);
    } else {
      // Use browser back button
      await page.goBack();
    }

    // Verify we're back on products page
    const productGrid = page
      .locator('[data-testid="product-grid"]')
      .or(page.locator(".product-grid"));
    await expect(productGrid).toBeVisible();
  });

  test("should clear filters and search", async ({ page }) => {
    await page.goto(`${BASE_URL}/products?category=VEGETABLES&q=tomato`, {
      waitUntil: "domcontentloaded",
    });

    // Wait for filtered results - element-based wait instead of networkIdle
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"], body',
      { state: "visible", timeout: 10000 },
    );

    // Look for "Clear Filters" or "Reset" button
    const clearButton = page
      .getByRole("button", { name: /clear|reset/i })
      .or(page.locator('[data-testid="clear-filters"]'));

    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Verify filters are cleared from URL
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/\/products$/);

      // Verify all products are shown again
      const productCards = page
        .locator('[data-testid="product-card"]')
        .or(page.locator(".product-card"));
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should handle empty search results gracefully", async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);

    // Search for something unlikely to exist
    const searchInput = page
      .locator('[data-testid="product-search"]')
      .or(page.getByPlaceholder(/search/i))
      .or(page.getByRole("searchbox"));

    await searchInput.fill("xyzabc123nonexistent");
    await searchInput.press("Enter").catch(async () => {
      const searchButton = page.getByRole("button", { name: /search/i });
      if (await searchButton.isVisible()) {
        await searchButton.click();
      }
    });

    // Wait for results
    await page.waitForTimeout(1000);

    // Verify "no results" message is displayed
    const noResults = page.getByText(/no products found|no results/i);
    await expect(noResults).toBeVisible();
  });

  test("should maintain pagination state", async ({ page }) => {
    await page.goto(`${BASE_URL}/products`, { waitUntil: "domcontentloaded" });

    // Wait for products to load - element-based wait instead of networkIdle
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, [data-testid="products-grid"]',
      { state: "visible", timeout: 10000 },
    );

    // Look for pagination controls
    const nextButton = page
      .getByRole("button", { name: /next/i })
      .or(page.locator('[data-testid="pagination-next"]'));

    if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
      // Click next page
      await nextButton.click();

      // Wait for new page to load
      await page.waitForTimeout(1000);

      // Verify URL contains page parameter
      await expect(page).toHaveURL(/[?&]page=2/);

      // Verify products are displayed
      const productCards = page
        .locator('[data-testid="product-card"]')
        .or(page.locator(".product-card"));
      await expect(productCards.first()).toBeVisible();

      // Go back to previous page
      const prevButton = page
        .getByRole("button", { name: /previous|prev/i })
        .or(page.locator('[data-testid="pagination-prev"]'));

      if (await prevButton.isVisible()) {
        await prevButton.click();
        await page.waitForTimeout(1000);
        await expect(page).toHaveURL(/[?&]page=1|\/products$/);
      }
    }
  });
});

test.describe("Product Discovery - Mobile View", () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE dimensions
  });

  test("should display mobile-friendly product grid", async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);

    // Wait for products to load
    await page
      .waitForSelector('[data-testid="product-card"]', {
        state: "visible",
        timeout: 10000,
      })
      .catch(() => {
        return page.waitForSelector(".product-card", { state: "visible" });
      });

    // Verify products are visible in mobile view
    const productCards = page
      .locator('[data-testid="product-card"]')
      .or(page.locator(".product-card"));

    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify first product card is visible
    await expect(productCards.first()).toBeVisible();
  });

  test("should handle mobile search and filters", async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);

    // Look for mobile search/filter toggle
    const filterToggle = page
      .getByRole("button", { name: /filter|menu/i })
      .or(page.locator('[data-testid="mobile-filter-toggle"]'));

    if (await filterToggle.isVisible()) {
      await filterToggle.click();

      // Wait for filter menu to open
      await page.waitForTimeout(500);

      // Verify filter options are visible
      const filterMenu = page
        .locator('[data-testid="filter-menu"]')
        .or(page.locator('[role="dialog"]'));

      if (await filterMenu.isVisible()) {
        await expect(filterMenu).toBeVisible();
      }
    }
  });
});
