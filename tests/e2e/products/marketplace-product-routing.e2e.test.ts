import { test, expect } from "@playwright/test";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test.describe("Marketplace Product Routing", () => {
  test("clicking a product card navigates to slug-based product detail page", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/marketplace/products`, {
      waitUntil: "domcontentloaded",
    });

    const grid = page.locator('[data-testid="products-grid"]');
    await expect(grid).toBeVisible({ timeout: 15000 });

    const productCard = grid.locator('[data-testid^="product-card-"]').first();
    await expect(productCard).toBeVisible();

    const productSlug = (
      await productCard.getAttribute("data-product-slug")
    )?.trim();

    if (!productSlug) {
      throw new Error("Product card is missing `data-product-slug` attribute");
    }
    const escapedSlug = escapeRegex(productSlug);

    const productLink = productCard
      .locator('a[data-testid^="product-link-"]')
      .first();

    await expect(productLink).toBeVisible();

    const slugPattern = new RegExp(
      `/marketplace/products/${escapedSlug}$`,
      "i",
    );

    await Promise.all([
      page.waitForURL(slugPattern, { timeout: 15000 }),
      productLink.click(),
    ]);

    await expect(page).toHaveURL(slugPattern);

    // Regression assertions to ensure product details render
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    await expect(page.locator("text=About This Product")).toBeVisible();
  });
});
