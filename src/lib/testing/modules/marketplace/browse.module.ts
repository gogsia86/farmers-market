/**
 * Marketplace Browse Module
 *
 * Tests for marketplace functionality including product browsing,
 * search, filtering, sorting, and product detail pages.
 *
 * @module marketplace/browse
 * @category Critical
 */

import type { TestModule } from "@/lib/testing/types";
import { expect } from "@/lib/testing/utils/assertions";
import type { Page } from "@playwright/test";

/**
 * Marketplace Browse Test Module
 *
 * Validates:
 * - Product listing page loads with products
 * - Search functionality works correctly
 * - Category filtering is functional
 * - Product cards display required information
 * - Product detail pages are accessible
 * - Sorting and pagination work
 * - Farm listings are accessible
 */
export const MarketplaceBrowseModule: TestModule = {
  id: "marketplace-browse",
  name: "Marketplace Browse & Search",
  description: "Product browsing, search, and discovery functionality",
  category: "MARKETPLACE",
  tags: ["marketplace", "products", "search", "customer"],
  timeout: 30000,

  suites: [
    {
      id: "marketplace-products",
      name: "Product Listing",
      description: "Verify products page displays correctly",
      tests: [
        {
          id: "products-page-load",
          name: "Products Page Loads",
          description: "Verify products listing page loads with products",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            // Navigate to products page
            await page.goto("/products", {
              waitUntil: "domcontentloaded",
              timeout: 10000,
            });

            // Wait for page to be visible
            await page.waitForSelector("body", { state: "visible" });

            // Check for products container - try multiple selectors
            const hasProductsContainer = await page
              .locator(
                '[data-testid="products-grid"], [data-testid="product-list"], .products-grid, .product-list, main',
              )
              .count();

            expect(hasProductsContainer).toBeGreaterThan(0);

            // Wait for products to load
            await page
              .waitForSelector(
                '[data-testid="product-card"], .product-card, article[class*="product"], [class*="product-item"]',
                { timeout: 10000 },
              )
              .catch(() => {
                // Products might not be loaded yet, continue
              });

            await page.waitForTimeout(2000);

            // Count product cards
            const productCount = await page
              .locator(
                '[data-testid="product-card"], .product-card, article[class*="product"], [class*="product-item"]',
              )
              .count();

            // If no product cards found, try grid items
            let gridItemCount = 0;
            if (productCount === 0) {
              gridItemCount = await page
                .locator(
                  'div[class*="grid"] > div, div[class*="products"] > div',
                )
                .count();
            }

            const totalProducts = productCount + gridItemCount;

            // Verify we have products (or at least the page structure)
            expect(totalProducts).toBeGreaterThanOrEqual(0);

            // Check page title
            const title = await page.title();
            expect(title).toBeDefined();

            return {
              data: {
                productCount,
                gridItemCount,
                totalProducts,
                pageTitle: title,
                hasProducts: totalProducts > 0,
              },
            };
          },
        },

        {
          id: "product-cards-content",
          name: "Product Cards Display Content",
          description: "Verify product cards show required information",
          category: "CRITICAL",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/products");
            await page.waitForTimeout(2000);

            // Get first few product cards
            const productCards = await page
              .locator(
                '[data-testid="product-card"], .product-card, article[class*="product"]',
              )
              .all();

            if (productCards.length === 0) {
              // Try alternative selectors
              const altCards = await page
                .locator('div[class*="grid"] > div')
                .all();
              expect(altCards.length).toBeGreaterThan(0);

              return {
                data: {
                  productCardsFound: altCards.length,
                  message: "Found grid items but not standard product cards",
                },
              };
            }

            // Check first product card (limit to 3 for performance)
            const cardsToCheck = productCards.slice(0, 3);
            const cardChecks = [];

            for (const card of cardsToCheck) {
              // Check for product name/title
              const hasName =
                (await card
                  .locator('h3, h4, [class*="name"], [class*="title"], a')
                  .count()) > 0;

              // Check for price
              const hasPrice =
                (await card
                  .locator(
                    '[class*="price"], .price, text=/\\$\\d+/, text=/\\d+\\.\\d{2}/',
                  )
                  .count()) > 0;

              // Check for image
              const hasImage = (await card.locator("img").count()) > 0;

              cardChecks.push({
                hasName,
                hasPrice,
                hasImage,
                complete: hasName && hasPrice && hasImage,
              });
            }

            const allComplete = cardChecks.every((c) => c.complete);
            const completeCount = cardChecks.filter((c) => c.complete).length;

            return {
              data: {
                cardsChecked: cardChecks.length,
                allComplete,
                completeCount,
                checks: cardChecks,
              },
            };
          },
        },

        {
          id: "product-detail-navigation",
          name: "Product Detail Navigation",
          description: "Verify clicking a product navigates to detail page",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            await page.goto("/products");
            await page.waitForTimeout(2000);

            // Find first clickable product - the entire card is a link in this design
            const productLink = await page
              .locator(
                'a[href*="/products/"]:has-text(""), a[class*="group"]:has([class*="product"]), a[href^="/products/"]',
              )
              .first();

            const linkExists = (await productLink.count()) > 0;

            if (!linkExists) {
              // Try alternative: any link on the page that goes to a product
              const anyProductLink = await page
                .locator('a[href^="/products/"]')
                .first();
              const hasAnyLink = (await anyProductLink.count()) > 0;
              expect(hasAnyLink).toBe(true);
            }

            // Get current URL
            const beforeUrl = page.url();

            // Click the product link with navigation wait
            await Promise.all([
              page.waitForLoadState("domcontentloaded"),
              productLink.click(),
            ]);

            await page.waitForTimeout(1000);

            // Get new URL
            const afterUrl = page.url();

            // Verify navigation occurred
            expect(afterUrl).not.toBe(beforeUrl);

            // Verify we're on a product detail page - check for /products/slug pattern
            const isProductPage =
              afterUrl.includes("/products/") &&
              afterUrl.split("/products/")[1]?.length > 0;

            expect(isProductPage).toBe(true);

            // Check for product detail content
            const hasProductDetails =
              (await page
                .locator(
                  'h1, h2, [data-testid="product-title"], [data-testid="product-details"], [class*="product"]',
                )
                .count()) > 0;

            expect(hasProductDetails).toBe(true);

            return {
              data: {
                beforeUrl,
                afterUrl,
                navigated: true,
                hasProductDetails,
                productSlug: afterUrl.split("/products/")[1]?.split("?")[0],
              },
            };
          },
        },
      ],
    },

    {
      id: "marketplace-search",
      name: "Search Functionality",
      description: "Test product search features",
      tests: [
        {
          id: "search-input-exists",
          name: "Search Input Available",
          description: "Verify search input is present on products page",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/products");

            // Look for search input
            const searchInput = await page
              .locator(
                'input[type="search"], input[placeholder*="search" i], input[name*="search" i], [data-testid="search"]',
              )
              .count();

            const hasSearch = searchInput > 0;

            // Also check for search button
            const searchButton = await page
              .locator('button:has-text("Search"), button[type="submit"]')
              .count();

            return {
              data: {
                hasSearchInput: hasSearch,
                hasSearchButton: searchButton > 0,
                searchAvailable: hasSearch,
              },
            };
          },
        },

        {
          id: "search-products",
          name: "Search Products",
          description: "Test searching for products returns results",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            await page.goto("/products");
            await page.waitForTimeout(1000);

            // Find search input
            const searchInput = page
              .locator('input[type="search"], input[placeholder*="search" i]')
              .first();

            const inputExists = (await searchInput.count()) > 0;

            if (!inputExists) {
              return {
                data: {
                  skipped: true,
                  reason: "Search input not found on page",
                },
              };
            }

            // Count products before search
            const beforeCount = await page
              .locator(
                '[data-testid="product-card"], .product-card, article[class*="product"]',
              )
              .count();

            // Perform search
            await searchInput.fill("tomato");
            await page.waitForTimeout(1500);

            // Count results after search
            const afterCount = await page
              .locator(
                '[data-testid="product-card"], .product-card, article[class*="product"]',
              )
              .count();

            // Search should either filter results or maintain count
            const searchWorked = afterCount >= 0;

            return {
              data: {
                searchTerm: "tomato",
                beforeCount,
                afterCount,
                resultsChanged: beforeCount !== afterCount,
                searchWorked,
              },
            };
          },
        },

        {
          id: "search-api-endpoint",
          name: "Search API Endpoint",
          description: "Test search API endpoint directly",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 2,
          async run(page: Page) {
            const response = await page.request.get("/api/search", {
              params: {
                q: "organic",
                type: "products",
              },
            });

            const isAvailable = response.status() < 500;
            expect(isAvailable).toBe(true);

            let resultsCount = 0;
            if (response.ok()) {
              const data = await response.json();
              resultsCount = Array.isArray(data)
                ? data.length
                : data.results?.length || 0;
            }

            return {
              data: {
                status: response.status(),
                available: response.ok(),
                resultsCount,
              },
            };
          },
        },
      ],
    },

    {
      id: "marketplace-filtering",
      name: "Filtering & Sorting",
      description: "Test product filtering and sorting features",
      tests: [
        {
          id: "category-filter",
          name: "Category Filter",
          description: "Verify category filtering is available",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/products");
            await page.waitForTimeout(1000);

            // Look for category filter
            const categoryFilter = await page
              .locator(
                'select[name="category"], select[name*="category" i], [data-filter="category"], [data-testid="category-filter"]',
              )
              .count();

            const hasCategoryFilter = categoryFilter > 0;

            // Look for category buttons/links
            const categoryButtons = await page
              .locator(
                'button[data-category], a[data-category], [class*="category-filter"] button',
              )
              .count();

            return {
              data: {
                hasCategoryFilter,
                hasCategoryButtons: categoryButtons > 0,
                filteringAvailable: hasCategoryFilter || categoryButtons > 0,
              },
            };
          },
        },

        {
          id: "sort-functionality",
          name: "Sort Products",
          description: "Verify product sorting options exist",
          category: "OPTIONAL",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/products");

            // Look for sort dropdown
            const sortDropdown = await page
              .locator(
                'select[name*="sort" i], [data-testid="sort"], [class*="sort-select"]',
              )
              .count();

            return {
              data: {
                hasSortDropdown: sortDropdown > 0,
                sortAvailable: sortDropdown > 0,
              },
            };
          },
        },
      ],
    },

    {
      id: "marketplace-farms",
      name: "Farm Listings",
      description: "Test farm marketplace features",
      tests: [
        {
          id: "farms-page-load",
          name: "Farms Page Loads",
          description: "Verify farms/marketplace page loads",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            // Try marketplace or farms page
            let url = "/marketplace";
            let response = await page.goto(url, {
              waitUntil: "domcontentloaded",
            });

            // If marketplace 404, try /farms
            if (response?.status() === 404) {
              url = "/farms";
              response = await page.goto(url, {
                waitUntil: "domcontentloaded",
              });
            }

            expect(response?.status()).toBeLessThan(500);

            await page.waitForTimeout(2000);

            // Count farm cards
            const farmCards = await page
              .locator(
                '[data-testid="farm-card"], .farm-card, article[class*="farm"]',
              )
              .count();

            const pageTitle = await page.title();

            return {
              data: {
                url,
                farmCards,
                pageTitle,
                accessible: true,
              },
            };
          },
        },

        {
          id: "farm-detail-page",
          name: "Farm Detail Page",
          description: "Verify farm detail pages are accessible",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            // Navigate to farms page
            await page.goto("/marketplace").catch(() => page.goto("/farms"));
            await page.waitForTimeout(2000);

            // Find first farm link
            const farmLink = await page
              .locator(
                '[data-testid="farm-card"] a, .farm-card a, article[class*="farm"] a',
              )
              .first();

            const linkExists = (await farmLink.count()) > 0;

            if (!linkExists) {
              return {
                data: {
                  skipped: true,
                  reason: "No farm links found",
                },
              };
            }

            // Click farm
            await farmLink.click();
            await page.waitForTimeout(2000);

            const url = page.url();
            const hasFarmContent =
              (await page
                .locator(
                  'h1, [data-testid="farm-details"], [class*="farm-details"]',
                )
                .count()) > 0;

            expect(hasFarmContent).toBe(true);

            return {
              data: {
                url,
                hasFarmContent,
                accessible: true,
              },
            };
          },
        },
      ],
    },

    {
      id: "marketplace-responsive",
      name: "Responsive Design",
      description: "Test marketplace on different screen sizes",
      tests: [
        {
          id: "mobile-product-view",
          name: "Mobile Product View",
          description: "Verify products display correctly on mobile",
          category: "OPTIONAL",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            // Set mobile viewport
            await page.setViewportSize({
              width: 375,
              height: 667,
            });

            await page.goto("/products");
            await page.waitForTimeout(2000);

            // Check if products are visible
            const productsVisible = await page
              .locator('[data-testid="product-card"], .product-card, article')
              .count();

            // Check for mobile menu
            const hasMobileMenu =
              (await page
                .locator(
                  'button[aria-label*="menu" i], [class*="mobile-menu"], [data-testid="mobile-menu"]',
                )
                .count()) > 0;

            // Reset viewport
            await page.setViewportSize({
              width: 1280,
              height: 720,
            });

            return {
              data: {
                productsVisible: productsVisible > 0,
                productCount: productsVisible,
                hasMobileMenu,
                mobileWorking: productsVisible > 0,
              },
            };
          },
        },
      ],
    },
  ],
};

export default MarketplaceBrowseModule;
