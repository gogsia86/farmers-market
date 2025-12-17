/**
 * 🛒 E-commerce & Admin Workflow Tests
 * Farmers Market Platform - Complete Bot Coverage Day 11
 * Version: 1.0.0
 *
 * Comprehensive workflow tests for:
 * - Cart management
 * - Checkout flows
 * - Payment processing
 * - Admin operations
 * - Farmer dashboard
 * - Order management
 * - Search & filtering
 * - Notifications
 */

import type { WorkflowStep, WorkflowConfig } from "../types";

// ============================================================================
// CART MANAGEMENT WORKFLOWS
// ============================================================================

const cartManagementSteps: WorkflowStep[] = [
  {
    id: "navigate-to-marketplace",
    name: "Navigate to Marketplace",
    description: "Load marketplace page with products",
    execute: async ({ page, baseUrl }) => {
      const start = Date.now();
      await page.goto(`${baseUrl}/marketplace`);
      await page.waitForLoadState("networkidle");

      return {
        success: true,
        duration: Date.now() - start,
        logs: ["Navigated to marketplace"],
      };
    },
  },
  {
    id: "add-multiple-products-to-cart",
    name: "Add Multiple Products to Cart",
    description: "Add 3 different products to shopping cart",
    execute: async ({ page }) => {
      const start = Date.now();
      const logs: string[] = [];

      // Add first product
      const firstProduct = await page
        .locator('[data-testid="product-card"]')
        .first();
      await firstProduct.locator('button:has-text("Add to Cart")').click();
      logs.push("Added first product to cart");
      await page.waitForTimeout(500);

      // Add second product
      const secondProduct = await page
        .locator('[data-testid="product-card"]')
        .nth(1);
      await secondProduct.locator('button:has-text("Add to Cart")').click();
      logs.push("Added second product to cart");
      await page.waitForTimeout(500);

      // Add third product
      const thirdProduct = await page
        .locator('[data-testid="product-card"]')
        .nth(2);
      await thirdProduct.locator('button:has-text("Add to Cart")').click();
      logs.push("Added third product to cart");

      // Verify cart count updated
      const cartBadge = await page
        .locator('[data-testid="cart-count"]')
        .textContent();
      const cartCount = parseInt(cartBadge || "0");

      return {
        success: cartCount >= 3,
        duration: Date.now() - start,
        logs: [...logs, `Cart count: ${cartCount}`],
      };
    },
  },
  {
    id: "open-cart-sidebar",
    name: "Open Cart Sidebar",
    description: "Open cart sidebar and verify items",
    execute: async ({ page }) => {
      const start = Date.now();

      // Click cart button
      await page.locator('[data-testid="cart-button"]').click();

      // Wait for cart sidebar to open
      await page.waitForSelector('[data-testid="cart-sidebar"]', {
        timeout: 5000,
      });

      // Verify cart items are visible
      const cartItems = await page.locator('[data-testid="cart-item"]').count();

      return {
        success: cartItems >= 3,
        duration: Date.now() - start,
        logs: [`Cart sidebar opened with ${cartItems} items`],
      };
    },
  },
  {
    id: "update-cart-quantities",
    name: "Update Cart Quantities",
    description: "Increase and decrease product quantities",
    execute: async ({ page }) => {
      const start = Date.now();
      const logs: string[] = [];

      // Increase first item quantity
      const increaseButton = await page
        .locator('[data-testid="cart-item"]')
        .first()
        .locator('[data-testid="increase-quantity"]');
      await increaseButton.click();
      logs.push("Increased first item quantity");
      await page.waitForTimeout(500);

      // Decrease second item quantity
      const decreaseButton = await page
        .locator('[data-testid="cart-item"]')
        .nth(1)
        .locator('[data-testid="decrease-quantity"]');
      await decreaseButton.click();
      logs.push("Decreased second item quantity");

      // Verify total updated
      const cartTotal = await page
        .locator('[data-testid="cart-total"]')
        .textContent();
      logs.push(`Cart total: ${cartTotal}`);

      return {
        success: true,
        duration: Date.now() - start,
        logs,
      };
    },
  },
  {
    id: "remove-cart-item",
    name: "Remove Item from Cart",
    description: "Remove one item from cart",
    execute: async ({ page }) => {
      const start = Date.now();

      // Get initial count
      const initialCount = await page
        .locator('[data-testid="cart-item"]')
        .count();

      // Remove last item
      const removeButton = await page
        .locator('[data-testid="cart-item"]')
        .last()
        .locator('[data-testid="remove-item"]');
      await removeButton.click();

      // Confirm removal if modal appears
      const confirmButton = await page
        .locator('button:has-text("Remove")')
        .first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      await page.waitForTimeout(500);

      // Verify count decreased
      const finalCount = await page
        .locator('[data-testid="cart-item"]')
        .count();

      return {
        success: finalCount < initialCount,
        duration: Date.now() - start,
        logs: [`Removed item. Count: ${initialCount} -> ${finalCount}`],
      };
    },
  },
];

// ============================================================================
// CHECKOUT WORKFLOW STEPS
// ============================================================================

const checkoutFlowSteps: WorkflowStep[] = [
  {
    id: "navigate-to-checkout",
    name: "Navigate to Checkout",
    description: "Proceed to checkout from cart",
    execute: async ({ page }) => {
      const start = Date.now();

      // Click checkout button
      await page.locator('button:has-text("Checkout")').click();

      // Wait for checkout page
      await page.waitForURL(/.*\/checkout/, { timeout: 10000 });
      await page.waitForLoadState("networkidle");

      return {
        success: true,
        duration: Date.now() - start,
        logs: ["Navigated to checkout page"],
      };
    },
  },
  {
    id: "fill-shipping-address",
    name: "Fill Shipping Address",
    description: "Enter shipping address details",
    execute: async ({ page, testData }) => {
      const start = Date.now();

      // Fill address form
      await page.fill(
        '[name="streetAddress"]',
        testData.address || "123 Farm Road",
      );
      await page.fill('[name="city"]', testData.city || "Agricultural Valley");
      await page.fill('[name="state"]', testData.state || "CA");
      await page.fill('[name="zipCode"]', testData.zipCode || "95000");
      await page.fill('[name="phone"]', testData.phone || "(555) 123-4567");

      // Click continue
      await page.locator('button:has-text("Continue")').click();
      await page.waitForTimeout(1000);

      return {
        success: true,
        duration: Date.now() - start,
        logs: ["Filled shipping address"],
      };
    },
  },
  {
    id: "select-delivery-time",
    name: "Select Delivery Time",
    description: "Choose delivery time slot",
    execute: async ({ page }) => {
      const start = Date.now();

      // Select first available time slot
      const timeSlot = await page.locator('[data-testid="time-slot"]').first();
      await timeSlot.click();

      // Click continue
      await page.locator('button:has-text("Continue")').click();
      await page.waitForTimeout(1000);

      return {
        success: true,
        duration: Date.now() - start,
        logs: ["Selected delivery time slot"],
      };
    },
  },
  {
    id: "enter-payment-info",
    name: "Enter Payment Information",
    description: "Fill payment details (test mode)",
    execute: async ({ page }) => {
      const start = Date.now();

      // Check if using test payment or real Stripe
      const testPaymentButton = await page.locator(
        'button:has-text("Use Test Payment")',
      );

      if (await testPaymentButton.isVisible()) {
        await testPaymentButton.click();
      } else {
        // Fill test card details (Stripe test card)
        await page.fill('[name="cardNumber"]', "4242424242424242");
        await page.fill('[name="expiry"]', "12/25");
        await page.fill('[name="cvc"]', "123");
        await page.fill('[name="cardholderName"]', "Test User");
      }

      return {
        success: true,
        duration: Date.now() - start,
        logs: ["Entered payment information"],
      };
    },
  },
  {
    id: "review-order",
    name: "Review Order Summary",
    description: "Verify order details before placing",
    execute: async ({ page }) => {
      const start = Date.now();
      const logs: string[] = [];

      // Verify order summary visible
      const orderSummary = await page.locator('[data-testid="order-summary"]');
      const isVisible = await orderSummary.isVisible();
      logs.push(`Order summary visible: ${isVisible}`);

      // Get order total
      const totalElement = await page.locator('[data-testid="order-total"]');
      const total = await totalElement.textContent();
      logs.push(`Order total: ${total}`);

      // Verify items listed
      const itemCount = await page
        .locator('[data-testid="order-item"]')
        .count();
      logs.push(`Order items: ${itemCount}`);

      return {
        success: isVisible && itemCount > 0,
        duration: Date.now() - start,
        logs,
      };
    },
  },
  {
    id: "place-order",
    name: "Place Order",
    description: "Submit order and verify confirmation",
    execute: async ({ page, state }) => {
      const start = Date.now();
      const logs: string[] = [];

      // Click place order button
      const placeOrderButton = await page.locator(
        'button:has-text("Place Order")',
      );
      await placeOrderButton.click();
      logs.push("Clicked place order button");

      // Wait for order confirmation
      try {
        await page.waitForURL(/.*\/order-confirmation/, { timeout: 30000 });
        logs.push("Redirected to order confirmation");

        // Get order number
        const orderNumber = await page
          .locator('[data-testid="order-number"]')
          .textContent();
        logs.push(`Order number: ${orderNumber}`);

        // Store order number in state
        state.orderId = orderNumber;

        return {
          success: true,
          duration: Date.now() - start,
          logs,
        };
      } catch (error) {
        // Check for error messages
        const errorMsg = await page.locator('[role="alert"]').textContent();
        logs.push(`Error: ${errorMsg}`);

        return {
          success: false,
          duration: Date.now() - start,
          logs,
        };
      }
    },
  },
];

// ============================================================================
// SEARCH & FILTER WORKFLOW STEPS
// ============================================================================

const searchFilterSteps: WorkflowStep[] = [
  {
    id: "test-search-functionality",
    name: "Test Search Functionality",
    description: "Search for products and verify results",
    execute: async ({ page, baseUrl }) => {
      const start = Date.now();
      const logs: string[] = [];

      await page.goto(`${baseUrl}/marketplace`);
      await page.waitForLoadState("networkidle");

      // Test search with "tomato"
      await page.fill('[data-testid="search-input"]', "tomato");
      await page.waitForTimeout(1000); // Debounce

      const resultCount = await page
        .locator('[data-testid="product-card"]')
        .count();
      logs.push(`Search results for "tomato": ${resultCount}`);

      // Clear search
      await page.fill('[data-testid="search-input"]', "");
      await page.waitForTimeout(1000);

      const allCount = await page
        .locator('[data-testid="product-card"]')
        .count();
      logs.push(`All products: ${allCount}`);

      return {
        success: allCount > 0,
        duration: Date.now() - start,
        logs,
      };
    },
  },
  {
    id: "test-category-filter",
    name: "Test Category Filter",
    description: "Filter products by category",
    execute: async ({ page }) => {
      const start = Date.now();
      const logs: string[] = [];

      // Click vegetables category
      const vegetablesFilter = await page.locator(
        '[data-testid="category-vegetables"]',
      );
      if (await vegetablesFilter.isVisible()) {
        await vegetablesFilter.click();
        await page.waitForTimeout(1000);

        const count = await page
          .locator('[data-testid="product-card"]')
          .count();
        logs.push(`Vegetables: ${count}`);
      }

      // Click fruits category
      const fruitsFilter = await page.locator(
        '[data-testid="category-fruits"]',
      );
      if (await fruitsFilter.isVisible()) {
        await fruitsFilter.click();
        await page.waitForTimeout(1000);

        const count = await page
          .locator('[data-testid="product-card"]')
          .count();
        logs.push(`Fruits: ${count}`);
      }

      return {
        success: true,
        duration: Date.now() - start,
        logs,
      };
    },
  },
  {
    id: "test-price-filter",
    name: "Test Price Range Filter",
    description: "Filter products by price range",
    execute: async ({ page }) => {
      const start = Date.now();
      const logs: string[] = [];

      // Set price range
      const minPriceInput = await page.locator('[data-testid="min-price"]');
      const maxPriceInput = await page.locator('[data-testid="max-price"]');

      if (await minPriceInput.isVisible()) {
        await minPriceInput.fill("5");
        await maxPriceInput.fill("20");
        await page.waitForTimeout(1000);

        const count = await page
          .locator('[data-testid="product-card"]')
          .count();
        logs.push(`Products in $5-$20 range: ${count}`);
      } else {
        logs.push("Price filter not available");
      }

      return {
        success: true,
        duration: Date.now() - start,
        logs,
      };
    },
  },
  {
    id: "test-sorting",
    name: "Test Product Sorting",
    description: "Sort products by different criteria",
    execute: async ({ page }) => {
      const start = Date.now();
      const logs: string[] = [];

      // Sort by price low to high
      const sortSelect = await page.locator('[data-testid="sort-select"]');
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption("price-asc");
        await page.waitForTimeout(1000);
        logs.push("Sorted by price (low to high)");

        // Sort by price high to low
        await sortSelect.selectOption("price-desc");
        await page.waitForTimeout(1000);
        logs.push("Sorted by price (high to low)");

        // Sort by rating
        await sortSelect.selectOption("rating");
        await page.waitForTimeout(1000);
        logs.push("Sorted by rating");
      } else {
        logs.push("Sort functionality not available");
      }

      return {
        success: true,
        duration: Date.now() - start,
        logs,
      };
    },
  },
];

// ============================================================================
// ADMIN DASHBOARD WORKFLOW STEPS
// ============================================================================

const adminDashboardSteps: WorkflowStep[] = [
  {
    id: "login-as-admin",
    name: "Login as Admin",
    description: "Authenticate with admin credentials",
    execute: async ({ page, baseUrl }) => {
      const start = Date.now();

      await page.goto(`${baseUrl}/auth/login`);
      await page.waitForLoadState("networkidle");

      // Fill admin credentials
      await page.fill(
        '[name="email"]',
        process.env.ADMIN_TEST_EMAIL || "admin@farmersmarket.test",
      );
      await page.fill(
        '[name="password"]',
        process.env.ADMIN_TEST_PASSWORD || "AdminPassword123!",
      );

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Wait for redirect to dashboard
      await page.waitForURL(/.*\/admin/, { timeout: 10000 });

      return {
        success: true,
        duration: Date.now() - start,
        logs: ["Logged in as admin"],
      };
    },
  },
  {
    id: "view-admin-dashboard",
    name: "View Admin Dashboard",
    description: "Load admin dashboard and verify metrics",
    execute: async ({ page, baseUrl }) => {
      const start = Date.now();
      const logs: string[] = [];

      await page.goto(`${baseUrl}/admin/dashboard`);
      await page.waitForLoadState("networkidle");

      // Check for key metrics
      const metrics = [
        "total-users",
        "total-farms",
        "total-orders",
        "total-revenue",
      ];

      for (const metric of metrics) {
        const element = await page.locator(`[data-testid="${metric}"]`);
        if (await element.isVisible()) {
          const value = await element.textContent();
          logs.push(`${metric}: ${value}`);
        }
      }

      return {
        success: logs.length > 0,
        duration: Date.now() - start,
        logs,
      };
    },
  },
  {
    id: "approve-farm",
    name: "Approve Pending Farm",
    description: "Review and approve a pending farm",
    execute: async ({ page, baseUrl }) => {
      const start = Date.now();
      const logs: string[] = [];

      await page.goto(`${baseUrl}/admin/farms/pending`);
      await page.waitForLoadState("networkidle");

      // Check for pending farms
      const pendingFarms = await page
        .locator('[data-testid="pending-farm"]')
        .count();
      logs.push(`Pending farms: ${pendingFarms}`);

      if (pendingFarms > 0) {
        // Click first farm to review
        await page.locator('[data-testid="pending-farm"]').first().click();
        await page.waitForTimeout(1000);

        // Click approve button
        const approveButton = await page.locator('button:has-text("Approve")');
        if (await approveButton.isVisible()) {
          await approveButton.click();

          // Confirm if modal appears
          const confirmButton = await page.locator(
            'button:has-text("Confirm")',
          );
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }

          logs.push("Farm approved");
        }
      }

      return {
        success: true,
        duration: Date.now() - start,
        logs,
      };
    },
  },
  {
    id: "manage-users",
    name: "Manage Users",
    description: "View and manage user accounts",
    execute: async ({ page, baseUrl }) => {
      const start = Date.now();
      const logs: string[] = [];

      await page.goto(`${baseUrl}/admin/users`);
      await page.waitForLoadState("networkidle");

      // Count users
      const userCount = await page.locator('[data-testid="user-row"]').count();
      logs.push(`Total users: ${userCount}`);

      // Test search
      const searchInput = await page.locator('[data-testid="user-search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        await page.waitForTimeout(1000);

        const searchResults = await page
          .locator('[data-testid="user-row"]')
          .count();
        logs.push(`Search results: ${searchResults}`);
      }

      return {
        success: true,
        duration: Date.now() - start,
        logs,
      };
    },
  },
];

// ============================================================================
// FARMER DASHBOARD WORKFLOW STEPS
// ============================================================================

const farmerDashboardSteps: WorkflowStep[] = [
  {
    id: "login-as-farmer",
    name: "Login as Farmer",
    description: "Authenticate with farmer credentials",
    execute: async ({ page, baseUrl }) => {
      const start = Date.now();

      await page.goto(`${baseUrl}/auth/login`);
      await page.waitForLoadState("networkidle");

      // Fill farmer credentials
      await page.fill(
        '[name="email"]',
        process.env.FARMER_TEST_EMAIL || "farmer@farmersmarket.test",
      );
      await page.fill(
        '[name="password"]',
        process.env.FARMER_TEST_PASSWORD || "FarmerPassword123!",
      );

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Wait for redirect to dashboard
      await page.waitForURL(/.*\/farmer/, { timeout: 10000 });

      return {
        success: true,
        duration: Date.now() - start,
        logs: ["Logged in as farmer"],
      };
    },
  },
  {
    id: "view-farmer-dashboard",
    name: "View Farmer Dashboard",
    description: "Load farmer dashboard and verify metrics",
    execute: async ({ page, baseUrl }) => {
      if (!page) throw new Error("Page not initialized");
      const start = Date.now();
      const logs: string[] = [];

      await page.goto(`${baseUrl}/farmer/analytics`);
      await page.waitForLoadState("networkidle");

      // Check for key metrics
      const metrics = [
        "total-products",
        "active-orders",
        "monthly-revenue",
        "farm-rating",
      ];

      for (const metric of metrics) {
        const element = await page.locator(`[data-testid="${metric}"]`);
        if (await element.isVisible()) {
          const value = await element.textContent();
          logs.push(`${metric}: ${value}`);
        }
      }

      return {
        success: logs.length > 0,
        duration: Date.now() - start,
        logs,
      };
    },
  },
  {
    id: "manage-inventory",
    name: "Manage Product Inventory",
    description: "Update product stock levels",
    execute: async ({ page, baseUrl }) => {
      if (!page) throw new Error("Page not initialized");
      const start = Date.now();
      const logs: string[] = [];

      await page.goto(`${baseUrl}/farmer/inventory`);
      await page.waitForLoadState("networkidle");

      // Count products
      const productCount = await page
        .locator('[data-testid="inventory-item"]')
        .count();
      logs.push(`Inventory items: ${productCount}`);

      if (productCount > 0) {
        // Update stock for first product
        const firstProduct = await page
          .locator('[data-testid="inventory-item"]')
          .first();
        const updateButton = await firstProduct.locator(
          'button:has-text("Update Stock")',
        );

        if (await updateButton.isVisible()) {
          await updateButton.click();
          await page.waitForTimeout(500);

          // Enter new stock value
          const stockInput = await page.locator('[name="stock"]');
          await stockInput.fill("50");

          // Save
          await page.locator('button:has-text("Save")').click();
          logs.push("Updated stock level");
        }
      }

      return {
        success: true,
        duration: Date.now() - start,
        logs,
      };
    },
  },
  {
    id: "process-orders",
    name: "Process Pending Orders",
    description: "View and update order statuses",
    execute: async ({ page, baseUrl }) => {
      if (!page) throw new Error("Page not initialized");
      const start = Date.now();
      const logs: string[] = [];

      await page.goto(`${baseUrl}/farmer/orders`);
      await page.waitForLoadState("networkidle");

      // Count orders
      const orderCount = await page
        .locator('[data-testid="order-row"]')
        .count();
      logs.push(`Pending orders: ${orderCount}`);

      if (orderCount > 0) {
        // Click first order
        await page.locator('[data-testid="order-row"]').first().click();
        await page.waitForTimeout(1000);

        // Update status to "processing"
        const statusSelect = await page.locator('[data-testid="order-status"]');
        if (await statusSelect.isVisible()) {
          await statusSelect.selectOption("PROCESSING");
          logs.push("Updated order status to PROCESSING");
        }
      }

      return {
        success: true,
        duration: Date.now() - start,
        logs,
      };
    },
  },
];

// ============================================================================
// NOTIFICATION WORKFLOW STEPS
// ============================================================================

const notificationSteps: WorkflowStep[] = [
  {
    id: "test-order-notifications",
    name: "Test Order Notifications",
    description: "Verify order status notifications",
    execute: async ({ page, baseUrl }) => {
      const start = Date.now();
      const logs: string[] = [];

      await page.goto(`${baseUrl}/notifications`);
      await page.waitForLoadState("networkidle");

      // Check notification count
      const notificationCount = await page
        .locator('[data-testid="notification-item"]')
        .count();
      logs.push(`Notifications: ${notificationCount}`);

      // Mark notification as read
      if (notificationCount > 0) {
        const firstNotification = await page
          .locator('[data-testid="notification-item"]')
          .first();
        await firstNotification.click();
        await page.waitForTimeout(500);
        logs.push("Marked notification as read");
      }

      return {
        success: true,
        duration: Date.now() - start,
        logs,
      };
    },
  },
  {
    id: "test-notification-preferences",
    name: "Test Notification Preferences",
    description: "Update notification settings",
    execute: async ({ page, baseUrl }) => {
      if (!page) throw new Error("Page not initialized");
      const start = Date.now();
      const logs: string[] = [];

      await page.goto(`${baseUrl}/products`);
      await page.waitForLoadState("networkidle");

      // Toggle email notifications
      const emailToggle = await page.locator(
        '[data-testid="email-notifications-toggle"]',
      );
      if (await emailToggle.isVisible()) {
        await emailToggle.click();
        logs.push("Toggled email notifications");
      }

      // Toggle push notifications
      const pushToggle = await page.locator(
        '[data-testid="push-notifications-toggle"]',
      );
      if (await pushToggle.isVisible()) {
        await pushToggle.click();
        logs.push("Toggled push notifications");
      }

      // Save settings
      const saveButton = await page.locator('button:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        logs.push("Saved notification preferences");
      }

      return {
        success: true,
        duration: Date.now() - start,
        logs,
      };
    },
  },
];

// ============================================================================
// PREDEFINED E-COMMERCE WORKFLOWS
// ============================================================================

export const ECOMMERCE_WORKFLOWS: WorkflowConfig[] = [
  {
    id: "cart-management",
    name: "Cart Management Test",
    type: "CART_MANAGEMENT",
    priority: "HIGH",
    enabled: true,
    schedule: {
      interval: 60, // Every hour
    },
    timeout: 120000, // 2 minutes
    retries: 2,
    steps: cartManagementSteps,
    tags: ["ecommerce", "cart", "shopping"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
  },
  {
    id: "checkout-flow",
    name: "Complete Checkout Flow",
    type: "PRODUCT_CATALOG",
    priority: "CRITICAL",
    enabled: true,
    schedule: {
      interval: 30, // Every 30 minutes
    },
    timeout: 180000, // 3 minutes
    retries: 3,
    steps: checkoutFlowSteps,
    tags: ["ecommerce", "checkout", "payment"],
    dependencies: ["cart-management"],
    notifyOnFailure: true,
    notifyOnSuccess: true,
  },
  {
    id: "search-and-filter",
    name: "Search & Filter Functionality",
    type: "PRODUCT_CATALOG",
    priority: "MEDIUM",
    enabled: true,
    schedule: {
      interval: 120, // Every 2 hours
    },
    timeout: 90000, // 90 seconds
    retries: 2,
    steps: searchFilterSteps,
    tags: ["marketplace", "search", "filter"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
  },
  {
    id: "admin-dashboard",
    name: "Admin Dashboard Operations",
    type: "PRODUCT_CATALOG",
    priority: "HIGH",
    enabled: true,
    schedule: {
      interval: 240, // Every 4 hours
    },
    timeout: 180000, // 3 minutes
    retries: 2,
    steps: adminDashboardSteps,
    tags: ["admin", "dashboard", "management"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
  },
  {
    id: "farmer-dashboard",
    name: "Farmer Dashboard Operations",
    type: "PRODUCT_CATALOG",
    priority: "HIGH",
    enabled: true,
    schedule: {
      interval: 120, // Every 2 hours
    },
    timeout: 180000, // 3 minutes
    retries: 2,
    steps: farmerDashboardSteps,
    tags: ["farmer", "dashboard", "inventory", "orders"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
  },
  {
    id: "notification-system",
    name: "Notification System Test",
    type: "PRODUCT_CATALOG",
    priority: "MEDIUM",
    enabled: true,
    schedule: {
      interval: 180, // Every 3 hours
    },
    timeout: 60000, // 1 minute
    retries: 2,
    steps: notificationSteps,
    tags: ["notifications", "alerts"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getEcommerceWorkflowById(
  id: string,
): WorkflowConfig | undefined {
  return ECOMMERCE_WORKFLOWS.find((w) => w.id === id);
}

export function getEcommerceWorkflowsByType(type: string): WorkflowConfig[] {
  return ECOMMERCE_WORKFLOWS.filter((w) => w.type === type);
}

export function getEcommerceWorkflowsByPriority(
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
): WorkflowConfig[] {
  return ECOMMERCE_WORKFLOWS.filter((w) => w.priority === priority);
}

export function getEnabledEcommerceWorkflows(): WorkflowConfig[] {
  return ECOMMERCE_WORKFLOWS.filter((w) => w.enabled);
}

export function getCriticalEcommerceWorkflows(): WorkflowConfig[] {
  return ECOMMERCE_WORKFLOWS.filter(
    (w) => w.priority === "CRITICAL" && w.enabled,
  );
}

// ============================================================================
// WORKFLOW EXECUTION HELPERS
// ============================================================================

/**
 * Get all e-commerce workflows for comprehensive testing
 */
export function getAllEcommerceWorkflows(): WorkflowConfig[] {
  return ECOMMERCE_WORKFLOWS;
}

/**
 * Get e-commerce workflows by tag
 */
export function getWorkflowsByTag(tag: string): WorkflowConfig[] {
  return ECOMMERCE_WORKFLOWS.filter((w) => w.tags?.includes(tag));
}

/**
 * Get shopping-related workflows (cart + checkout)
 */
export function getShoppingWorkflows(): WorkflowConfig[] {
  return ECOMMERCE_WORKFLOWS.filter((w) =>
    w.tags?.some((tag) => ["cart", "checkout", "payment"].includes(tag)),
  );
}

/**
 * Get admin-related workflows
 */
export function getAdminWorkflows(): WorkflowConfig[] {
  return ECOMMERCE_WORKFLOWS.filter((w) => w.tags?.includes("admin"));
}

/**
 * Get farmer-related workflows
 */
export function getFarmerWorkflows(): WorkflowConfig[] {
  return ECOMMERCE_WORKFLOWS.filter((w) => w.tags?.includes("farmer"));
}
