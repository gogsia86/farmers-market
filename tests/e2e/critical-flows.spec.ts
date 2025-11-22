/**
 * 🧪 E2E TESTS - Critical User Flows
 * Comprehensive end-to-end testing for Farmers Market Platform
 */

import { expect, test } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

test.describe("🔐 Authentication Flows", () => {
    test("Admin can login successfully", async ({ page }) => {
        await page.goto(`${BASE_URL}/admin-login`);

        await page.fill('input[name="email"]', "admin@farmersmarket.app");
        await page.fill('input[name="password"]', "DivineAdmin123!");
        await page.click('button[type="submit"]');

        // Should redirect to admin dashboard
        await expect(page).toHaveURL(/\/admin/);
        await expect(page.locator("text=Admin Dashboard")).toBeVisible();
    });

    test("Failed login shows error message", async ({ page }) => {
        await page.goto(`${BASE_URL}/admin-login`);

        await page.fill('input[name="email"]', "wrong@email.com");
        await page.fill('input[name="password"]', "wrongpassword");
        await page.click('button[type="submit"]');

        // Should show error
        await expect(page.locator("text=Invalid credentials")).toBeVisible();
    });
});

test.describe("🌾 Customer Shopping Flow", () => {
    test("Customer can browse farms and products", async ({ page }) => {
        await page.goto(BASE_URL);

        // Navigate to farms
        await page.click("text=Browse Farms");
        await expect(page).toHaveURL(/\/farms/);

        // Check farms are displayed
        await expect(page.locator('[data-testid="farm-card"]').first()).toBeVisible();

        // Click on a farm
        await page.locator('[data-testid="farm-card"]').first().click();

        // Should see farm details
        await expect(page.locator("text=Products")).toBeVisible();
    });

    test("Customer can add product to cart", async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);

        // Add product to cart
        await page.locator('[data-testid="add-to-cart"]').first().click();

        // Cart count should increase
        await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");

        // Go to cart
        await page.click('[data-testid="cart-button"]');
        await expect(page).toHaveURL(/\/cart/);

        // Product should be in cart
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    });

    test("Customer can complete checkout", async ({ page }) => {
        // First, add item to cart
        await page.goto(`${BASE_URL}/products`);
        await page.locator('[data-testid="add-to-cart"]').first().click();

        // Go to cart and checkout
        await page.click('[data-testid="cart-button"]');
        await page.click("text=Proceed to Checkout");

        // Fill shipping information
        await page.fill('input[name="address"]', "123 Farm Road");
        await page.fill('input[name="city"]', "Farmville");
        await page.fill('input[name="state"]', "CA");
        await page.fill('input[name="zipCode"]', "90210");

        // Select delivery method
        await page.click('input[value="DELIVERY"]');

        // Fill payment information (test mode)
        await page.fill('input[name="cardNumber"]', "4242424242424242");
        await page.fill('input[name="expiry"]', "12/25");
        await page.fill('input[name="cvc"]', "123");

        // Submit order
        await page.click("text=Place Order");

        // Should see order confirmation
        await expect(page.locator("text=Order Confirmed")).toBeVisible();
        await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    });
});

test.describe("🚜 Farmer Management Flow", () => {
    test("Farmer can view their dashboard", async ({ page }) => {
        // Login as farmer
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', "ana.romana@email.com");
        await page.fill('input[name="password"]', "FarmLife2024!");
        await page.click('button[type="submit"]');

        // Should redirect to farmer dashboard
        await expect(page).toHaveURL(/\/farmer/);
        await expect(page.locator("text=My Farm")).toBeVisible();
    });

    test("Farmer can add new product", async ({ page }) => {
        // Login as farmer first
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', "ana.romana@email.com");
        await page.fill('input[name="password"]', "FarmLife2024!");
        await page.click('button[type="submit"]');

        // Navigate to products
        await page.click("text=Products");
        await page.click("text=Add Product");

        // Fill product form
        await page.fill('input[name="name"]', "Test Organic Tomatoes");
        await page.fill('textarea[name="description"]', "Fresh organic tomatoes");
        await page.fill('input[name="price"]', "5.99");
        await page.fill('input[name="quantity"]', "100");
        await page.selectOption('select[name="unit"]', "lb");
        await page.selectOption('select[name="category"]', "VEGETABLES");

        // Submit form
        await page.click('button[type="submit"]');

        // Should see success message
        await expect(page.locator("text=Product added successfully")).toBeVisible();
    });

    test("Farmer can view orders", async ({ page }) => {
        // Login as farmer
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', "ana.romana@email.com");
        await page.fill('input[name="password"]', "FarmLife2024!");
        await page.click('button[type="submit"]');

        // Navigate to orders
        await page.click("text=Orders");

        // Should see orders list
        await expect(page.locator("text=Order History")).toBeVisible();
    });
});

test.describe("👨‍💼 Admin Management Flow", () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto(`${BASE_URL}/admin-login`);
        await page.fill('input[name="email"]', "admin@farmersmarket.app");
        await page.fill('input[name="password"]', "DivineAdmin123!");
        await page.click('button[type="submit"]');
    });

    test("Admin can view all farms", async ({ page }) => {
        await page.click("text=Farms");
        await expect(page).toHaveURL(/\/admin\/farms/);

        // Should see farms table
        await expect(page.locator("table")).toBeVisible();
        const cellCount = await page.locator("td").count();
        expect(cellCount).toBeGreaterThan(0);
    }); test("Admin can view all orders", async ({ page }) => {
        await page.click("text=Orders");
        await expect(page).toHaveURL(/\/admin\/orders/);

        // Should see orders table
        await expect(page.locator("table")).toBeVisible();
    });

    test("Admin can verify farm", async ({ page }) => {
        await page.click("text=Farms");

        // Find pending farm
        const pendingFarm = page.locator(
            'tr:has-text("PENDING")'
        ).first();

        if (await pendingFarm.isVisible()) {
            await pendingFarm.locator("text=View").click();

            // Verify farm
            await page.click("text=Verify Farm");

            // Should show success message
            await expect(page.locator("text=Farm verified")).toBeVisible();
        }
    });
});

test.describe("🔍 Search and Filter Flows", () => {
    test("Customer can search for products", async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);

        // Search for tomatoes
        await page.fill('input[placeholder*="Search"]', "tomato");
        await page.press('input[placeholder*="Search"]', "Enter");

        // Should see filtered results
        await expect(page.locator("text=tomato").first()).toBeVisible();
    });

    test("Customer can filter by category", async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);

        // Filter by category
        await page.selectOption('select[name="category"]', "VEGETABLES");

        // Should see only vegetables
        await expect(page.locator('[data-category="VEGETABLES"]')).toBeVisible();
    });
});

test.describe("📱 Responsive Design", () => {
    test("Mobile navigation works correctly", async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto(BASE_URL);

        // Open mobile menu
        await page.click('[data-testid="mobile-menu-button"]');

        // Menu should be visible
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

        // Click a link
        await page.click('text=Browse Farms');
        await expect(page).toHaveURL(/\/farms/);
    });
});

test.describe("♿ Accessibility", () => {
    test("Homepage has proper heading structure", async ({ page }) => {
        await page.goto(BASE_URL);

        // Should have h1
        await expect(page.locator("h1")).toBeVisible();

        // Navigation should have proper landmarks
        await expect(page.locator("nav")).toBeVisible();
        await expect(page.locator("main")).toBeVisible();
    });

    test("Forms have proper labels", async ({ page }) => {
        await page.goto(`${BASE_URL}/admin-login`);

        // Check for label associations
        const emailInput = page.locator('input[name="email"]');
        await expect(emailInput).toHaveAttribute("aria-label", /.+/);

        const passwordInput = page.locator('input[name="password"]');
        await expect(passwordInput).toHaveAttribute("aria-label", /.+/);
    });
});
