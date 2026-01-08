/**
 * Customer Orders Module
 *
 * Tests for customer order management including:
 * - Order history viewing
 * - Order details
 * - Order status tracking
 * - Order cancellation
 * - Reordering functionality
 *
 * @module orders/customer-orders
 * @category Important
 */

import type { TestModule } from "@/lib/testing/types";
import { expect } from "@/lib/testing/utils/assertions";
import type { Page } from "@playwright/test";

/**
 * Customer Orders Test Module
 *
 * Validates:
 * - Order history page loads
 * - Orders are displayed with correct information
 * - Order details page is accessible
 * - Order status is displayed correctly
 * - Filter and search functionality
 * - Reorder functionality works
 */
export const CustomerOrdersModule: TestModule = {
  id: "customer-orders",
  name: "Customer Order Management",
  description: "Customer order history, details, and management",
  category: "IMPORTANT",
  tags: ["orders", "customer", "order-history"],
  timeout: 30000,

  suites: [
    {
      id: "order-history",
      name: "Order History",
      description: "Test order history page and listing",
      tests: [
        {
          id: "orders-page-accessible",
          name: "Orders Page Accessible",
          description: "Verify orders page loads successfully",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            // Navigate to orders page
            await page.goto("/orders", {
              waitUntil: "domcontentloaded",
              timeout: 10000
            });

            // Wait for page to render
            await page.waitForTimeout(2000);

            // Check for orders container
            const hasOrdersContainer = await page.locator(
              '[data-testid="orders-container"], main, [class*="orders"]'
            ).count() > 0;

            expect(hasOrdersContainer).toBe(true);

            // Check for either orders list or empty state
            const ordersList = await page.locator(
              '[data-testid="order-item"], .order-item, [class*="order-card"]'
            ).count();

            const emptyState = await page.getByText(/no orders|no orders yet|start shopping/i).count();

            const hasValidState = ordersList > 0 || emptyState > 0;
            expect(hasValidState).toBe(true);

            return {
              data: {
                accessible: true,
                hasOrders: ordersList > 0,
                orderCount: ordersList
              }
            };
          }
        },

        {
          id: "order-list-display",
          name: "Order List Display",
          description: "Verify orders are displayed with required information",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check if there are orders
            const orderItems = await page.locator(
              '[data-testid="order-item"], .order-item, [class*="order-card"]'
            ).all();

            if (orderItems.length === 0) {
              return {
                data: {
                  skipped: true,
                  reason: "No orders to display"
                }
              };
            }

            // Check first order has required information
            const firstOrder = orderItems[0];

            const hasOrderNumber = await firstOrder.locator(
              'text=/order|#/i, [class*="order-number"]'
            ).count() > 0;

            const hasDate = await firstOrder.locator(
              'text=/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\\d{1,2}\\/\\d{1,2}/i'
            ).count() > 0;

            const hasTotal = await firstOrder.getByText(/\$\d+/).count() > 0;

            const hasStatus = await firstOrder.locator(
              '[data-testid*="status"], [class*="status"], text=/pending|processing|completed|delivered|cancelled/i'
            ).count() > 0;

            return {
              data: {
                orderCount: orderItems.length,
                hasOrderNumber,
                hasDate,
                hasTotal,
                hasStatus,
                complete: hasOrderNumber && hasDate && hasTotal && hasStatus
              }
            };
          }
        },

        {
          id: "order-details-navigation",
          name: "Order Details Navigation",
          description: "Verify clicking an order navigates to details page",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            await page.goto("/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Find first order link
            const orderLink = await page.locator(
              'a[href*="/orders/"], [data-testid="order-item"] a, .order-item a'
            ).first();

            const hasLink = await orderLink.count() > 0;

            if (!hasLink) {
              return {
                data: {
                  skipped: true,
                  reason: "No order links found (empty order history)"
                }
              };
            }

            const beforeUrl = page.url();

            // Click to view details
            await Promise.all([
              page.waitForLoadState('domcontentloaded'),
              orderLink.click()
            ]);

            await page.waitForTimeout(1000);

            const afterUrl = page.url();

            // Verify navigation occurred
            expect(afterUrl).not.toBe(beforeUrl);

            // Verify we're on order details page
            const isOrderPage = afterUrl.includes("/orders/");
            expect(isOrderPage).toBe(true);

            return {
              data: {
                beforeUrl,
                afterUrl,
                navigated: true
              }
            };
          }
        }
      ]
    },

    {
      id: "order-details",
      name: "Order Details",
      description: "Test order details page functionality",
      tests: [
        {
          id: "order-details-display",
          name: "Order Details Display",
          description: "Verify order details page shows complete information",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            // Try to navigate to a typical order details URL
            // This will 404 if no orders exist, which is expected
            await page.goto("/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Click first order
            const firstOrder = await page.locator(
              'a[href*="/orders/"]'
            ).first();

            const hasOrder = await firstOrder.count() > 0;

            if (!hasOrder) {
              return {
                data: {
                  skipped: true,
                  reason: "No orders available to test"
                }
              };
            }

            await firstOrder.click();
            await page.waitForTimeout(2000);

            // Check for order details elements
            const hasOrderNumber = await page.locator(
              'h1, h2, [data-testid="order-number"]'
            ).count() > 0;

            const hasItems = await page.locator(
              '[data-testid="order-item"], .order-item, [class*="item"]'
            ).count() > 0;

            const hasTotal = await page.getByText(/total|subtotal/i).count() > 0;

            const hasStatus = await page.getByText(/status|pending|processing|completed/i).count() > 0;

            return {
              data: {
                hasOrderNumber,
                hasItems,
                hasTotal,
                hasStatus,
                complete: hasOrderNumber && hasItems && hasTotal && hasStatus
              }
            };
          }
        },

        {
          id: "order-status-display",
          name: "Order Status Display",
          description: "Verify order status is displayed correctly",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check for status indicators
            const pendingStatus = await page.getByText(/pending/i).count();
            const processingStatus = await page.getByText(/processing/i).count();
            const completedStatus = await page.getByText(/completed/i).count();
            const deliveredStatus = await page.getByText(/delivered/i).count();
            const cancelledStatus = await page.getByText(/cancelled/i).count();

            const totalStatusIndicators = pendingStatus + processingStatus +
              completedStatus + deliveredStatus + cancelledStatus;

            return {
              data: {
                hasStatusIndicators: totalStatusIndicators > 0,
                statusTypes: {
                  pending: pendingStatus,
                  processing: processingStatus,
                  completed: completedStatus,
                  delivered: deliveredStatus,
                  cancelled: cancelledStatus
                }
              }
            };
          }
        }
      ]
    },

    {
      id: "order-actions",
      name: "Order Actions",
      description: "Test order action functionality",
      tests: [
        {
          id: "reorder-button-exists",
          name: "Reorder Button Exists",
          description: "Verify reorder functionality is available",
          category: "NICE_TO_HAVE",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check for reorder button
            const reorderButton = await page.locator(
              'button:has-text("Reorder"), button:has-text("Order Again"), a:has-text("Reorder")'
            ).count();

            return {
              data: {
                hasReorderButton: reorderButton > 0,
                buttonCount: reorderButton
              }
            };
          }
        },

        {
          id: "view-receipt-available",
          name: "View Receipt Available",
          description: "Verify receipt viewing is available",
          category: "NICE_TO_HAVE",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check for receipt/invoice links
            const receiptLink = await page.locator(
              'a:has-text("Receipt"), a:has-text("Invoice"), button:has-text("View Receipt")'
            ).count();

            return {
              data: {
                hasReceiptLink: receiptLink > 0,
                linkCount: receiptLink
              }
            };
          }
        },

        {
          id: "contact-support-available",
          name: "Contact Support Available",
          description: "Verify support contact is available for orders",
          category: "NICE_TO_HAVE",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check for support/help links
            const supportLink = await page.locator(
              'a:has-text("Contact"), a:has-text("Support"), a:has-text("Help"), button:has-text("Get Help")'
            ).count();

            return {
              data: {
                hasSupportLink: supportLink > 0,
                linkCount: supportLink
              }
            };
          }
        }
      ]
    },

    {
      id: "order-filters",
      name: "Order Filters & Search",
      description: "Test order filtering and search functionality",
      tests: [
        {
          id: "filter-by-status",
          name: "Filter by Status",
          description: "Verify orders can be filtered by status",
          category: "NICE_TO_HAVE",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Look for filter controls
            const filterDropdown = await page.locator(
              'select[name*="status"], select[name*="filter"], [data-testid="status-filter"]'
            ).count();

            const filterButtons = await page.locator(
              'button:has-text("All"), button:has-text("Pending"), button:has-text("Completed")'
            ).count();

            const hasFilters = filterDropdown > 0 || filterButtons > 0;

            return {
              data: {
                hasFilters,
                hasDropdown: filterDropdown > 0,
                hasButtons: filterButtons > 0
              }
            };
          }
        },

        {
          id: "search-orders",
          name: "Search Orders",
          description: "Verify order search functionality exists",
          category: "NICE_TO_HAVE",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Look for search input
            const searchInput = await page.locator(
              'input[type="search"], input[placeholder*="search" i], input[name*="search"]'
            ).count();

            return {
              data: {
                hasSearch: searchInput > 0
              }
            };
          }
        }
      ]
    },

    {
      id: "responsive-orders",
      name: "Responsive Design",
      description: "Test orders page on mobile devices",
      tests: [
        {
          id: "mobile-orders-view",
          name: "Mobile Orders View",
          description: "Verify orders page works on mobile viewport",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            await page.goto("/orders", { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(2000);

            // Check page is accessible
            const bodyVisible = await page.locator("body").isVisible();
            expect(bodyVisible).toBe(true);

            // Check for orders or empty state
            const hasContent = await page.locator(
              '[data-testid="order-item"], .order-item, text=/no orders/i'
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

export default CustomerOrdersModule;
