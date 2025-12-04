/**
 * 🧪 E2E TESTS - Customer Registration Flow
 *
 * Tests the complete customer registration and onboarding experience
 *
 * @pattern End-to-End Testing - Full User Journey
 * @reference 13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { test, expect } from "@playwright/test";

// Test data factory
function generateTestCustomer() {
  const timestamp = Date.now();
  return {
    firstName: "John",
    lastName: "Farmer",
    email: `customer-${timestamp}@test.farmersmarket.com`,
    password: "SecurePass123!",
    phone: "555-0100",
    address: {
      street: "123 Market St",
      city: "Sacramento",
      state: "CA",
      zipCode: "95814",
      country: "USA",
    },
  };
}

test.describe("🌾 Customer Registration Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto("/");
  });

  test("should complete full customer registration successfully", async ({
    page,
  }) => {
    const customer = generateTestCustomer();

    // Step 1: Navigate to registration page
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/\/register/);
    await expect(
      page.getByRole("heading", { name: /create account/i }),
    ).toBeVisible();

    // Step 2: Select customer role
    await page.click('button:has-text("Customer")');

    // Step 3: Fill registration form
    await page.fill('input[name="firstName"]', customer.firstName);
    await page.fill('input[name="lastName"]', customer.lastName);
    await page.fill('input[name="email"]', customer.email);
    await page.fill('input[name="password"]', customer.password);
    await page.fill('input[name="confirmPassword"]', customer.password);

    // Add phone (optional)
    const phoneInput = page.locator('input[name="phone"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(customer.phone);
    }

    // Step 4: Accept terms and conditions
    await page.check('input[type="checkbox"][name="terms"]');

    // Step 5: Submit registration
    await page.click('button[type="submit"]:has-text("Create Account")');

    // Step 6: Verify successful registration
    // Should redirect to dashboard or verification page
    await page.waitForURL(/\/(dashboard|verify-email)/);

    // Check for success message
    const successMessage = page.locator('text=/account created|welcome/i');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test("should show validation errors for invalid email", async ({ page }) => {
    await page.goto("/register");

    // Select customer role
    await page.click('button:has-text("Customer")');

    // Fill with invalid email
    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.fill('input[name="confirmPassword"]', "SecurePass123!");
    await page.check('input[type="checkbox"][name="terms"]');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create Account")');

    // Should show validation error
    const errorMessage = page.locator('text=/invalid email|valid email/i');
    await expect(errorMessage).toBeVisible();
  });

  test("should show error for mismatched passwords", async ({ page }) => {
    await page.goto("/register");

    await page.click('button:has-text("Customer")');

    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "DifferentPass123!");
    await page.check('input[type="checkbox"][name="terms"]');

    await page.click('button[type="submit"]');

    // Should show password mismatch error
    const errorMessage = page.locator('text=/passwords.*match/i');
    await expect(errorMessage).toBeVisible();
  });

  test("should require strong password", async ({ page }) => {
    await page.goto("/register");

    await page.click('button:has-text("Customer")');

    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "weak"); // Weak password
    await page.fill('input[name="confirmPassword"]', "weak");

    // Should show password strength indicator or error
    const passwordError = page.locator(
      'text=/password.*strong|password.*8 characters/i',
    );
    await expect(passwordError).toBeVisible();
  });

  test("should prevent registration without accepting terms", async ({
    page,
  }) => {
    const customer = generateTestCustomer();

    await page.goto("/register");
    await page.click('button:has-text("Customer")');

    await page.fill('input[name="firstName"]', customer.firstName);
    await page.fill('input[name="lastName"]', customer.lastName);
    await page.fill('input[name="email"]', customer.email);
    await page.fill('input[name="password"]', customer.password);
    await page.fill('input[name="confirmPassword"]', customer.password);

    // Don't check terms checkbox

    // Try to submit
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Create Account")',
    );

    // Button should be disabled or show error
    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
      await submitButton.click();
      // Should show terms error
      const termsError = page.locator('text=/accept.*terms/i');
      await expect(termsError).toBeVisible();
    } else {
      expect(isDisabled).toBe(true);
    }
  });

  test("should show error for duplicate email", async ({ page }) => {
    // Note: This test assumes a known test account exists
    await page.goto("/register");

    await page.click('button:has-text("Customer")');

    // Try to register with existing email
    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.fill('input[name="email"]', "existing@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.fill('input[name="confirmPassword"]', "SecurePass123!");
    await page.check('input[type="checkbox"][name="terms"]');

    await page.click('button[type="submit"]');

    // Should show duplicate email error (or redirect to login)
    const errorMessage = page.locator(
      'text=/email.*already.*exists|email.*taken/i',
    );
    // Wait a bit for potential API response
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test("should have link to login page", async ({ page }) => {
    await page.goto("/register");

    // Should have link to login
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();

    // Click and verify navigation
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should be mobile responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto("/register");

    // Form should be visible and usable
    const firstNameInput = page.locator('input[name="firstName"]');
    await expect(firstNameInput).toBeVisible();

    // Check if form is scrollable and inputs are accessible
    await firstNameInput.fill("John");
    await expect(firstNameInput).toHaveValue("John");

    // Submit button should be visible
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });
});

test.describe("🔐 Customer Login Flow", () => {
  test("should login successfully with valid credentials", async ({ page }) => {
    // Note: This assumes a test account exists
    await page.goto("/login");

    await page.fill('input[name="email"]', "test.customer@example.com");
    await page.fill('input[name="password"]', "TestPass123!");

    await page.click('button[type="submit"]:has-text("Sign In")');

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);

    // Should see user info or dashboard elements
    const welcomeMessage = page.locator('text=/welcome|dashboard/i');
    await expect(welcomeMessage).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "nonexistent@example.com");
    await page.fill('input[name="password"]', "WrongPassword123!");

    await page.click('button[type="submit"]');

    // Should show error message
    const errorMessage = page.locator('text=/invalid.*credentials|incorrect/i');
    await expect(errorMessage).toBeVisible();
  });

  test("should have forgot password link", async ({ page }) => {
    await page.goto("/login");

    const forgotPasswordLink = page.locator('a:has-text("Forgot Password")');
    await expect(forgotPasswordLink).toBeVisible();

    await forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password|\/reset-password/);
  });

  test("should have link to registration page", async ({ page }) => {
    await page.goto("/login");

    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe("👤 Customer Profile Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', "test.customer@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("should navigate to account settings", async ({ page }) => {
    // Navigate to account page
    await page.goto("/account");

    // Should see account information
    await expect(page.getByRole("heading", { name: /account/i })).toBeVisible();

    // Should see profile fields
    await expect(page.locator('text=/email|name/i')).toBeVisible();
  });

  test("should view account details", async ({ page }) => {
    await page.goto("/account");

    // Should display user information
    const emailElement = page.locator('text=/test.customer@example.com/i');
    await expect(emailElement).toBeVisible();

    // Should have statistics
    const statsElements = page.locator('text=/total orders|total spent/i');
    await expect(statsElements.first()).toBeVisible();
  });

  test("should navigate between dashboard and account", async ({ page }) => {
    // Start at dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to account
    const accountLink = page.locator('a[href="/account"]');
    await accountLink.click();
    await expect(page).toHaveURL(/\/account/);

    // Navigate back to dashboard
    const dashboardLink = page.locator('a[href="/dashboard"]');
    await dashboardLink.click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("🚪 Customer Logout", () => {
  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', "test.customer@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await logoutButton.click();

    // Should redirect to homepage or login page
    await page.waitForURL(/\/|\/login/);

    // Should not be able to access protected pages
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
