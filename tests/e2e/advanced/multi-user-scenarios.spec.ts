/**
 * 🌟 Advanced Multi-User E2E Test Scenarios
 * Comprehensive testing of complex multi-user interactions
 *
 * @module tests/e2e/advanced/multi-user-scenarios
 * @version 3.0.0
 * @divine_pattern QUANTUM_MULTI_USER_TESTING
 * @agricultural_consciousness BIODYNAMIC_USER_FLOWS
 */

import { test, expect, type Page } from "@playwright/test";
import {
  MultiUserOrchestrator,
  SessionManager,
  StateManager,
  TestDataFactory,
  E2E_CONFIG,
} from "../../utils/e2e-advanced-utils";

// ==========================================
// 🎯 TEST SUITE CONFIGURATION
// ==========================================

test.describe("Advanced Multi-User Scenarios", () => {
  let orchestrator: MultiUserOrchestrator;
  let stateManager: StateManager;
  const testUsers: any[] = [];
  const testFarms: any[] = [];
  const testProducts: any[] = [];

  // ==========================================
  // 🔧 SETUP & TEARDOWN
  // ==========================================

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    orchestrator = new MultiUserOrchestrator(context);
    stateManager = new StateManager();

    // Create test data
    const admin = await TestDataFactory.createTestUser("ADMIN");
    const farmer1 = await TestDataFactory.createTestUser("FARMER");
    const farmer2 = await TestDataFactory.createTestUser("FARMER");
    const customer1 = await TestDataFactory.createTestUser("CUSTOMER");
    const customer2 = await TestDataFactory.createTestUser("CUSTOMER");

    testUsers.push(admin, farmer1, farmer2, customer1, customer2);

    // Setup users in orchestrator
    await orchestrator.setupUsers(testUsers);

    // Create test farms
    testFarms.push(await TestDataFactory.createTestFarm(farmer1.id));
    testFarms.push(await TestDataFactory.createTestFarm(farmer2.id));

    // Create test products
    for (const farm of testFarms) {
      for (let i = 0; i < 3; i++) {
        testProducts.push(
          await TestDataFactory.createTestProduct(farm.id, {
            name: `Product ${testProducts.length + 1}`,
            price: 10 + i * 5,
            inventory: 50,
          }),
        );
      }
    }
  });

  test.afterAll(async () => {
    // Cleanup test data
    await TestDataFactory.cleanup({
      userIds: testUsers.map((u) => u.id),
      farmIds: testFarms.map((f) => f.id),
      productIds: testProducts.map((p) => p.id),
    });

    await orchestrator.cleanup();
  });

  // ==========================================
  // 🧪 SCENARIO 1: Concurrent Farm Management
  // ==========================================

  test("Scenario 1: Multiple farmers manage their farms simultaneously", async () => {
    const farmer1 = testUsers[1]; // First farmer
    const farmer2 = testUsers[2]; // Second farmer

    await orchestrator.executeParallel([
      {
        userId: farmer1.id,
        action: async (page: Page) => {
          // Farmer 1 updates their farm
          await page.goto(`/dashboard/farms/${testFarms[0].id}`);
          await page.waitForSelector('[data-testid="farm-edit-button"]');
          await page.click('[data-testid="farm-edit-button"]');

          await page.fill(
            'input[name="description"]',
            "Updated farm description 1",
          );
          await page.click('button[type="submit"]');

          // Verify update
          await expect(
            page.locator("text=Updated farm description 1"),
          ).toBeVisible();
        },
      },
      {
        userId: farmer2.id,
        action: async (page: Page) => {
          // Farmer 2 updates their farm
          await page.goto(`/dashboard/farms/${testFarms[1].id}`);
          await page.waitForSelector('[data-testid="farm-edit-button"]');
          await page.click('[data-testid="farm-edit-button"]');

          await page.fill(
            'input[name="description"]',
            "Updated farm description 2",
          );
          await page.click('button[type="submit"]');

          // Verify update
          await expect(
            page.locator("text=Updated farm description 2"),
          ).toBeVisible();
        },
      },
    ]);

    // Verify both updates persisted
    const page1 = orchestrator.getPage(farmer1.id);
    const page2 = orchestrator.getPage(farmer2.id);

    await page1.reload();
    await expect(
      page1.locator("text=Updated farm description 1"),
    ).toBeVisible();

    await page2.reload();
    await expect(
      page2.locator("text=Updated farm description 2"),
    ).toBeVisible();
  });

  // ==========================================
  // 🧪 SCENARIO 2: Inventory Race Conditions
  // ==========================================

  test("Scenario 2: Multiple customers compete for limited inventory", async () => {
    const customer1 = testUsers[3];
    const customer2 = testUsers[4];
    const product = testProducts[0];

    // Reset product inventory to 5
    await TestDataFactory.createTestProduct(product.farmId, {
      id: product.id,
      inventory: 5,
    });

    // Both customers try to purchase 4 items
    const results = await orchestrator.executeParallel([
      {
        userId: customer1.id,
        action: async (page: Page) => {
          await page.goto(`/products/${product.id}`);
          await page.waitForSelector('[data-testid="quantity-input"]');

          await page.fill('[data-testid="quantity-input"]', "4");
          await page.click('[data-testid="add-to-cart-button"]');

          // Wait for response
          await page.waitForTimeout(1000);

          // Check if successful
          const cartCount = await page
            .locator('[data-testid="cart-count"]')
            .textContent();
          return { success: parseInt(cartCount || "0") > 0 };
        },
      },
      {
        userId: customer2.id,
        action: async (page: Page) => {
          await page.goto(`/products/${product.id}`);
          await page.waitForSelector('[data-testid="quantity-input"]');

          await page.fill('[data-testid="quantity-input"]', "4");
          await page.click('[data-testid="add-to-cart-button"]');

          // Wait for response
          await page.waitForTimeout(1000);

          // Check if successful
          const cartCount = await page
            .locator('[data-testid="cart-count"]')
            .textContent();
          return { success: parseInt(cartCount || "0") > 0 };
        },
      },
    ]);

    // Only one customer should succeed (or both with partial quantities)
    console.log("Inventory race results:", results);
  });

  // ==========================================
  // 🧪 SCENARIO 3: Real-time Order Updates
  // ==========================================

  test("Scenario 3: Farmer updates order status while customer views it", async () => {
    const farmer = testUsers[1];
    const customer = testUsers[3];

    // Customer creates an order
    let orderId: string | null = null;

    await orchestrator.executeAsUser(customer.id, async (page: Page) => {
      await page.goto("/products");
      await page.click('[data-testid="product-card"]', { timeout: 10000 });
      await page.click('[data-testid="add-to-cart-button"]');
      await page.goto("/cart");
      await page.click('[data-testid="checkout-button"]');

      // Complete checkout
      await page.fill('input[name="shippingAddress"]', "123 Test St");
      await page.click('[data-testid="place-order-button"]');

      // Get order ID
      await page.waitForURL(/\/orders\/.*/, { timeout: 10000 });
      orderId = page.url().split("/").pop() || null;
    });

    expect(orderId).toBeTruthy();

    // Farmer and customer view order simultaneously
    await orchestrator.executeParallel([
      {
        userId: farmer.id,
        action: async (page: Page) => {
          await page.goto(`/dashboard/orders/${orderId}`);
          await page.waitForSelector('[data-testid="order-status"]');

          // Update order status
          await page.click('[data-testid="update-status-button"]');
          await page.selectOption('select[name="status"]', "PROCESSING");
          await page.click('[data-testid="confirm-update-button"]');

          await expect(page.locator("text=PROCESSING")).toBeVisible();
        },
      },
      {
        userId: customer.id,
        action: async (page: Page) => {
          await page.goto(`/orders/${orderId}`);
          await page.waitForSelector('[data-testid="order-status"]');

          // Wait for status update (should see live update)
          await page.waitForTimeout(2000);

          // Reload to ensure update is reflected
          await page.reload();
          await expect(page.locator("text=PROCESSING")).toBeVisible();
        },
      },
    ]);
  });

  // ==========================================
  // 🧪 SCENARIO 4: Admin Moderation
  // ==========================================

  test("Scenario 4: Admin moderates content while users create it", async () => {
    const admin = testUsers[0];
    const farmer = testUsers[1];

    await orchestrator.executeParallel([
      {
        userId: farmer.id,
        action: async (page: Page) => {
          // Farmer creates products
          for (let i = 0; i < 3; i++) {
            await page.goto("/dashboard/products/new");
            await page.fill('input[name="name"]', `New Product ${i}`);
            await page.fill('input[name="price"]', "15.99");
            await page.fill('input[name="inventory"]', "100");
            await page.click('button[type="submit"]');
            await page.waitForTimeout(500);
          }
        },
      },
      {
        userId: admin.id,
        action: async (page: Page) => {
          // Admin reviews pending items
          await page.goto("/admin/products/pending");
          await page.waitForTimeout(1000);

          // Approve products as they appear
          const approveButtons = await page
            .locator('[data-testid="approve-button"]')
            .all();

          for (const button of approveButtons) {
            await button.click();
            await page.waitForTimeout(300);
          }
        },
      },
    ]);
  });

  // ==========================================
  // 🧪 SCENARIO 5: Multi-Farm Shopping Cart
  // ==========================================

  test("Scenario 5: Customer builds cart from multiple farms", async () => {
    const customer = testUsers[3];

    await orchestrator.executeAsUser(customer.id, async (page: Page) => {
      // Add products from Farm 1
      const farm1Products = testProducts.filter(
        (p) => p.farmId === testFarms[0].id,
      );
      for (const product of farm1Products.slice(0, 2)) {
        await page.goto(`/products/${product.id}`);
        await page.fill('[data-testid="quantity-input"]', "2");
        await page.click('[data-testid="add-to-cart-button"]');
        await page.waitForTimeout(500);
      }

      // Add products from Farm 2
      const farm2Products = testProducts.filter(
        (p) => p.farmId === testFarms[1].id,
      );
      for (const product of farm2Products.slice(0, 2)) {
        await page.goto(`/products/${product.id}`);
        await page.fill('[data-testid="quantity-input"]', "1");
        await page.click('[data-testid="add-to-cart-button"]');
        await page.waitForTimeout(500);
      }

      // View cart
      await page.goto("/cart");

      // Verify cart has items from multiple farms
      await expect(
        page.locator('[data-testid="cart-farm-section"]'),
      ).toHaveCount(2);

      // Verify correct quantities
      const cartItems = await page.locator('[data-testid="cart-item"]').all();
      expect(cartItems.length).toBeGreaterThanOrEqual(4);
    });
  });

  // ==========================================
  // 🧪 SCENARIO 6: Concurrent Product Updates
  // ==========================================

  test("Scenario 6: Multiple farmers update product prices simultaneously", async () => {
    const farmer1 = testUsers[1];
    const farmer2 = testUsers[2];

    const farm1Product = testProducts.find((p) => p.farmId === testFarms[0].id);
    const farm2Product = testProducts.find((p) => p.farmId === testFarms[1].id);

    await orchestrator.executeParallel([
      {
        userId: farmer1.id,
        action: async (page: Page) => {
          await page.goto(`/dashboard/products/${farm1Product?.id}/edit`);
          await page.fill('input[name="price"]', "25.99");
          await page.click('button[type="submit"]');
          await expect(
            page.locator("text=Product updated successfully"),
          ).toBeVisible();
        },
      },
      {
        userId: farmer2.id,
        action: async (page: Page) => {
          await page.goto(`/dashboard/products/${farm2Product?.id}/edit`);
          await page.fill('input[name="price"]', "30.99");
          await page.click('button[type="submit"]');
          await expect(
            page.locator("text=Product updated successfully"),
          ).toBeVisible();
        },
      },
    ]);

    // Verify updates persisted correctly
    const page1 = orchestrator.getPage(farmer1.id);
    await page1.goto(`/products/${farm1Product?.id}`);
    await expect(page1.locator("text=$25.99")).toBeVisible();

    const page2 = orchestrator.getPage(farmer2.id);
    await page2.goto(`/products/${farm2Product?.id}`);
    await expect(page2.locator("text=$30.99")).toBeVisible();
  });

  // ==========================================
  // 🧪 SCENARIO 7: Session Management
  // ==========================================

  test("Scenario 7: User switches between multiple sessions", async () => {
    const customer = testUsers[3];
    const farmer = testUsers[1];

    const page = orchestrator.getPage(customer.id);
    const sessionManager = new SessionManager(page.context());

    // Create sessions for both users
    await sessionManager.createSession(page, customer);
    await sessionManager.createSession(page, farmer);

    // Switch to farmer session
    await sessionManager.switchSession(page, farmer.id);
    await page.goto("/dashboard");
    await expect(
      page.locator('[data-testid="farmer-dashboard"]'),
    ).toBeVisible();

    // Switch back to customer session
    await sessionManager.switchSession(page, customer.id);
    await page.goto("/");
    await expect(page.locator('[data-testid="customer-view"]')).toBeVisible();
  });

  // ==========================================
  // 🧪 SCENARIO 8: Notification System
  // ==========================================

  test("Scenario 8: Real-time notifications across users", async () => {
    const farmer = testUsers[1];
    const customer = testUsers[3];

    await orchestrator.executeParallel([
      {
        userId: farmer.id,
        action: async (page: Page) => {
          // Farmer monitors notifications
          await page.goto("/dashboard");

          // Wait for new order notification
          await page.waitForSelector('[data-testid="notification-badge"]', {
            timeout: 15000,
          });

          await expect(
            page.locator('[data-testid="notification-badge"]'),
          ).toBeVisible();
        },
      },
      {
        userId: customer.id,
        action: async (page: Page) => {
          // Small delay to ensure farmer is monitoring
          await page.waitForTimeout(1000);

          // Customer places order
          await page.goto("/products");
          await page.click('[data-testid="product-card"]');
          await page.click('[data-testid="add-to-cart-button"]');
          await page.goto("/cart");
          await page.click('[data-testid="checkout-button"]');

          // Complete checkout
          await page.fill('input[name="shippingAddress"]', "456 Test Ave");
          await page.click('[data-testid="place-order-button"]');

          await expect(
            page.locator("text=Order placed successfully"),
          ).toBeVisible();
        },
      },
    ]);
  });

  // ==========================================
  // 🧪 SCENARIO 9: Search & Filter Conflicts
  // ==========================================

  test("Scenario 9: Multiple users perform different searches simultaneously", async () => {
    const customer1 = testUsers[3];
    const customer2 = testUsers[4];

    const results = await orchestrator.executeParallel([
      {
        userId: customer1.id,
        action: async (page: Page) => {
          await page.goto("/products");
          await page.fill('[data-testid="search-input"]', "Product 1");
          await page.waitForTimeout(500);

          const resultCount = await page
            .locator('[data-testid="product-card"]')
            .count();
          return { search: "Product 1", count: resultCount };
        },
      },
      {
        userId: customer2.id,
        action: async (page: Page) => {
          await page.goto("/products");
          await page.fill('[data-testid="search-input"]', "Product 2");
          await page.waitForTimeout(500);

          const resultCount = await page
            .locator('[data-testid="product-card"]')
            .count();
          return { search: "Product 2", count: resultCount };
        },
      },
    ]);

    console.log("Search results:", results);
  });

  // ==========================================
  // 🧪 SCENARIO 10: Complex Workflow
  // ==========================================

  test("Scenario 10: Complete agricultural marketplace workflow", async () => {
    const farmer = testUsers[1];
    const customer = testUsers[3];
    const admin = testUsers[0];

    // Step 1: Farmer creates new product
    await orchestrator.executeAsUser(farmer.id, async (page: Page) => {
      await page.goto("/dashboard/products/new");
      await page.fill('input[name="name"]', "Premium Organic Tomatoes");
      await page.fill('textarea[name="description"]', "Fresh from the farm");
      await page.fill('input[name="price"]', "12.99");
      await page.fill('input[name="inventory"]', "50");
      await page.selectOption('select[name="category"]', "VEGETABLES");
      await page.click('button[type="submit"]');

      await expect(
        page.locator("text=Product created successfully"),
      ).toBeVisible();
      stateManager.setState("newProductId", page.url().split("/").pop());
    });

    // Step 2: Admin approves product
    await orchestrator.executeAsUser(admin.id, async (page: Page) => {
      await page.goto("/admin/products/pending");
      await page.click('[data-testid="approve-button"]');
      await expect(page.locator("text=Product approved")).toBeVisible();
    });

    // Step 3: Customer discovers and purchases product
    await orchestrator.executeAsUser(customer.id, async (page: Page) => {
      const productId = stateManager.getState<string>("newProductId");
      await page.goto(`/products/${productId}`);

      await page.fill('[data-testid="quantity-input"]', "5");
      await page.click('[data-testid="add-to-cart-button"]');
      await page.goto("/cart");
      await page.click('[data-testid="checkout-button"]');

      await page.fill('input[name="shippingAddress"]', "789 Farm Road");
      await page.click('[data-testid="place-order-button"]');

      await expect(
        page.locator("text=Order placed successfully"),
      ).toBeVisible();
      stateManager.setState("orderId", page.url().split("/").pop());
    });

    // Step 4: Farmer processes order
    await orchestrator.executeAsUser(farmer.id, async (page: Page) => {
      const orderId = stateManager.getState<string>("orderId");
      await page.goto(`/dashboard/orders/${orderId}`);

      await page.click('[data-testid="update-status-button"]');
      await page.selectOption('select[name="status"]', "SHIPPED");
      await page.click('[data-testid="confirm-update-button"]');

      await expect(
        page.locator("text=Order updated successfully"),
      ).toBeVisible();
    });

    // Step 5: Customer receives and reviews order
    await orchestrator.executeAsUser(customer.id, async (page: Page) => {
      const orderId = stateManager.getState<string>("orderId");
      await page.goto(`/orders/${orderId}`);

      await expect(page.locator("text=SHIPPED")).toBeVisible();

      // Leave review
      await page.click('[data-testid="leave-review-button"]');
      await page.fill('textarea[name="comment"]', "Excellent quality!");
      await page.click('[data-testid="rating-5-stars"]');
      await page.click('[data-testid="submit-review-button"]');

      await expect(page.locator("text=Review submitted")).toBeVisible();
    });
  });
});
