/**
 * Farmer Dashboard Module
 *
 * Tests for farmer dashboard and farm management including:
 * - Dashboard access and overview
 * - Farm management
 * - Product management
 * - Order management
 * - Analytics viewing
 *
 * @module farmer/dashboard
 * @category Important
 */

import type { Page } from "@playwright/test";
import type { TestModule } from "../../types";
import { expect } from "../../utils/assertions";

/**
 * Farmer Dashboard Test Module
 *
 * Validates:
 * - Dashboard page loads for authenticated farmers
 * - Farm information is displayed
 * - Navigation to farm management works
 * - Product management is accessible
 * - Order notifications are visible
 * - Key metrics are displayed
 */
export const FarmerDashboardModule: TestModule = {
  id: "farmer-dashboard",
  name: "Farmer Dashboard & Management",
  description: "Farmer dashboard, farm management, and operations",
  category: "IMPORTANT",
  tags: ["farmer", "dashboard", "farm-management", "products"],
  timeout: 30000,

  suites: [
    {
      id: "dashboard-access",
      name: "Dashboard Access",
      description: "Test dashboard page access and basic functionality",
      tests: [
        {
          id: "dashboard-page-loads",
          name: "Dashboard Page Loads",
          description: "Verify farmer dashboard page loads successfully",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            // Navigate to farmer dashboard
            await page.goto("/farmer/dashboard", {
              waitUntil: "domcontentloaded",
              timeout: 10000
            });

            // Wait for page to render
            await page.waitForTimeout(2000);

            // Check for dashboard container
            const hasDashboard = await page.locator(
              '[data-testid="dashboard"], main, [class*="dashboard"]'
            ).count() > 0;

            expect(hasDashboard).toBe(true);

            // Check for welcome message or farmer name
            const hasWelcome = await page.locator(
              'h1, h2, text=/welcome|dashboard/i'
            ).count() > 0;

            return {
              data: {
                accessible: true,
                hasWelcome
              }
            };
          }
        },

        {
          id: "dashboard-navigation",
          name: "Dashboard Navigation",
          description: "Verify dashboard navigation menu exists",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/farmer/dashboard", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check for navigation links
            const farmLink = await page.locator('a[href*="farm"]').count();
            const productsLink = await page.locator('a[href*="product"]').count();
            const ordersLink = await page.locator('a[href*="order"]').count();

            const hasNavigation = farmLink > 0 || productsLink > 0 || ordersLink > 0;

            return {
              data: {
                hasNavigation,
                hasFarmLink: farmLink > 0,
                hasProductsLink: productsLink > 0,
                hasOrdersLink: ordersLink > 0
              }
            };
          }
        }
      ]
    },

    {
      id: "farm-overview",
      name: "Farm Overview",
      description: "Test farm information display on dashboard",
      tests: [
        {
          id: "farm-info-display",
          name: "Farm Information Display",
          description: "Verify farm information is displayed on dashboard",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/farmer/dashboard", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check for farm name
            const hasFarmName = await page.locator(
              '[data-testid="farm-name"], h1, h2, h3'
            ).count() > 0;

            // Check for farm status or verification badge
            const hasStatus = await page.locator(
              '[data-testid*="status"], [class*="badge"], text=/active|verified|pending/i'
            ).count() > 0;

            return {
              data: {
                hasFarmName,
                hasStatus
              }
            };
          }
        },

        {
          id: "quick-stats-display",
          name: "Quick Stats Display",
          description: "Verify dashboard shows quick statistics",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/farmer/dashboard", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Look for stat cards or metrics
            const statCards = await page.locator(
              '[data-testid*="stat"], [class*="stat-card"], [class*="metric"]'
            ).count();

            // Look for numbers (common in stats)
            const hasNumbers = await page.getByText(/\d+/).count() > 0;

            return {
              data: {
                hasStats: statCards > 0 || hasNumbers,
                statCardCount: statCards
              }
            };
          }
        }
      ]
    },

    {
      id: "farm-management",
      name: "Farm Management",
      description: "Test farm management functionality",
      tests: [
        {
          id: "view-farm-page",
          name: "View Farm Page",
          description: "Verify navigation to farm management page works",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            await page.goto("/farmer/dashboard", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Try to find and click farm management link
            const farmLink = await page.locator(
              'a[href*="/farmer/farm"], a:has-text("Farm"), a:has-text("My Farm")'
            ).first();

            const hasLink = await farmLink.count() > 0;

            if (!hasLink) {
              // Try alternative navigation
              await page.goto("/farmer/farms", { waitUntil: "domcontentloaded" });
            } else {
              await farmLink.click();
            }

            await page.waitForTimeout(2000);

            // Verify we're on a farm-related page
            const url = page.url();
            const isFarmPage = url.includes("/farm");

            expect(isFarmPage).toBe(true);

            return {
              data: {
                navigated: true,
                url
              }
            };
          }
        },

        {
          id: "farm-edit-access",
          name: "Farm Edit Access",
          description: "Verify edit farm functionality is accessible",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            // Navigate to farms page
            await page.goto("/farmer/farms", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Look for edit button or link
            const editButton = await page.locator(
              'button:has-text("Edit"), a:has-text("Edit"), [data-testid*="edit"]'
            ).count();

            return {
              data: {
                hasEditButton: editButton > 0
              }
            };
          }
        }
      ]
    },

    {
      id: "product-management",
      name: "Product Management",
      description: "Test product management functionality",
      tests: [
        {
          id: "products-page-access",
          name: "Products Page Access",
          description: "Verify products management page is accessible",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            // Navigate to farmer products page
            await page.goto("/farmer/products", {
              waitUntil: "domcontentloaded",
              timeout: 10000
            });

            await page.waitForTimeout(2000);

            // Check if page loaded
            const bodyVisible = await page.locator("body").isVisible();
            expect(bodyVisible).toBe(true);

            // Look for products container or empty state
            const hasProducts = await page.locator(
              '[data-testid="product"], .product-card, [class*="product"]'
            ).count();

            const emptyState = await page.getByText(/no products|add product|create product/i).count();

            const hasValidState = hasProducts > 0 || emptyState > 0;
            expect(hasValidState).toBe(true);

            return {
              data: {
                accessible: true,
                hasProducts: hasProducts > 0,
                productCount: hasProducts
              }
            };
          }
        },

        {
          id: "add-product-button",
          name: "Add Product Button",
          description: "Verify add product button exists",
          category: "CRITICAL",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/farmer/products", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Look for add/create product button
            const addButton = await page.locator(
              'button:has-text("Add Product"), a:has-text("Add Product"), button:has-text("Create"), a:has-text("New Product")'
            ).count();

            expect(addButton).toBeGreaterThan(0);

            return {
              data: {
                hasAddButton: addButton > 0
              }
            };
          }
        },

        {
          id: "product-list-display",
          name: "Product List Display",
          description: "Verify products are displayed with management options",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/farmer/products", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check for product items
            const products = await page.locator(
              '[data-testid="product"], .product-card, [class*="product-item"]'
            ).all();

            if (products.length === 0) {
              return {
                data: {
                  skipped: true,
                  reason: "No products to display"
                }
              };
            }

            // Check first product has action buttons
            const firstProduct = products[0];
            const hasEditButton = await firstProduct.locator(
              'button:has-text("Edit"), a:has-text("Edit")'
            ).count() > 0;

            const hasDeleteButton = await firstProduct.locator(
              'button:has-text("Delete"), button:has-text("Remove")'
            ).count() > 0;

            return {
              data: {
                productCount: products.length,
                hasEditButton,
                hasDeleteButton
              }
            };
          }
        }
      ]
    },

    {
      id: "order-management",
      name: "Order Management",
      description: "Test farmer order management functionality",
      tests: [
        {
          id: "farmer-orders-access",
          name: "Farmer Orders Access",
          description: "Verify farmer can access orders page",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            // Navigate to farmer orders page
            await page.goto("/farmer/orders", {
              waitUntil: "domcontentloaded",
              timeout: 10000
            });

            await page.waitForTimeout(2000);

            // Check if page loaded
            const bodyVisible = await page.locator("body").isVisible();
            expect(bodyVisible).toBe(true);

            // Look for orders or empty state
            const hasOrders = await page.locator(
              '[data-testid="order"], .order-card, [class*="order"]'
            ).count();

            const emptyState = await page.getByText(/no orders|no new orders/i).count();

            const hasValidState = hasOrders > 0 || emptyState > 0;
            expect(hasValidState).toBe(true);

            return {
              data: {
                accessible: true,
                hasOrders: hasOrders > 0,
                orderCount: hasOrders
              }
            };
          }
        },

        {
          id: "order-status-management",
          name: "Order Status Management",
          description: "Verify order status can be managed",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/farmer/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check for order items
            const orders = await page.locator(
              '[data-testid="order"], .order-card, [class*="order-item"]'
            ).all();

            if (orders.length === 0) {
              return {
                data: {
                  skipped: true,
                  reason: "No orders to manage"
                }
              };
            }

            // Look for status update controls
            const statusButtons = await page.locator(
              'button:has-text("Accept"), button:has-text("Complete"), button:has-text("Mark"), select[name*="status"]'
            ).count();

            return {
              data: {
                orderCount: orders.length,
                hasStatusControls: statusButtons > 0
              }
            };
          }
        }
      ]
    },

    {
      id: "analytics",
      name: "Analytics & Reports",
      description: "Test analytics and reporting features",
      tests: [
        {
          id: "analytics-access",
          name: "Analytics Access",
          description: "Verify analytics page is accessible",
          category: "NICE_TO_HAVE",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            // Try to navigate to analytics page
            await page.goto("/farmer/analytics", {
              waitUntil: "domcontentloaded",
              timeout: 10000
            }).catch(() => {
              // Page might not exist yet
              return null;
            });

            await page.waitForTimeout(2000);

            const url = page.url();
            const isAnalyticsPage = url.includes("/analytics") && !url.includes("/404");

            return {
              data: {
                accessible: isAnalyticsPage,
                url
              }
            };
          }
        },

        {
          id: "sales-metrics-display",
          name: "Sales Metrics Display",
          description: "Verify sales metrics are displayed",
          category: "NICE_TO_HAVE",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/farmer/dashboard", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Look for sales-related metrics
            const salesMetrics = await page.locator(
              'text=/sales|revenue|earnings|$/i'
            ).count();

            return {
              data: {
                hasSalesMetrics: salesMetrics > 0
              }
            };
          }
        }
      ]
    },

    {
      id: "responsive-farmer",
      name: "Responsive Design",
      description: "Test farmer dashboard on mobile devices",
      tests: [
        {
          id: "mobile-dashboard-view",
          name: "Mobile Dashboard View",
          description: "Verify dashboard works on mobile viewport",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            await page.goto("/farmer/dashboard", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check page is accessible
            const bodyVisible = await page.locator("body").isVisible();
            expect(bodyVisible).toBe(true);

            // Check for main content
            const hasContent = await page.locator(
              'main, [class*="dashboard"], h1, h2'
            ).count() > 0;

            expect(hasContent).toBe(true);

            // Reset viewport
            await page.setViewportSize({ width: 1920, height: 1080 });

            return {
              data: {
                mobileAccessible: true,
                hasContent
              }
            };
          }
        }
      ]
    }
  ]
};

export default FarmerDashboardModule;
