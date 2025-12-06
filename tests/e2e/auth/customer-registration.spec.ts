/**
 * 🧪 E2E TESTS - Customer Registration Flow
 *
 * Tests the complete customer registration and onboarding experience
 *
 * @pattern End-to-End Testing - Full User Journey
 * @reference 13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

$1import { TEST_USERS } from "../helpers/auth";

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
    $1
    await page.waitForLoadState("networkidle");$2});

  test("should complete full customer registration successfully", async ({
    page,
  }) => {
    const customer = generateTestCustomer();

    // Step 1: Navigate to registration page
    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL(/\/signup/);
    await expect(
      page.getByRole("heading", { name: /create account/i }),
    ).toBeVisible();

    // Step 2: Fill registration form
    await page.fill(
      'input[name="name"]',
      `${customer.firstName} ${customer.lastName}`,
    );
    await page.fill('input[name="email"]', customer.email);
    await page.fill('input[name="password"]', customer.password);
    await page.fill('input[name="confirmPassword"]', customer.password);

    // Step 3: Select customer role (CONSUMER)
    await page.click('input[type="radio"][value="CONSUMER"]');

    // Step 4: Accept terms and conditions
    await page.check('input[name="agreeToTerms"]');

    // Step 5: Submit registration
    await page.click('button[type="submit"]');

    // Step 6: Verify successful registration
    // Should redirect to login page with registered=true
    await page.waitForURL(/\/login\?registered=true/);
  });

  test("should show validation errors for invalid email", async ({ page }) => {
    $1
    await page.waitForLoadState("networkidle");$2// Fill form with invalid email
    await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.fill('input[name="confirmPassword"]', "SecurePass123!");
    await page.click('input[type="radio"][value="CONSUMER"]');
    await page.check('input[name="agreeToTerms"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation error
    const errorMessage = page.locator("text=/invalid email|valid email/i");
    await expect(errorMessage).toBeVisible();
  });

  test("should show error for mismatched passwords", async ({ page }) => {
    $1
    await page.waitForLoadState("networkidle");$2await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="email"]', "test.temp@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.fill('input[name="confirmPassword"]', "DifferentPass123!");
    await page.click('input[type="radio"][value="CONSUMER"]');
    await page.check('input[name="agreeToTerms"]');

    await page.click('button[type="submit"]');

    // Should show password mismatch error
    const errorMessage = page.locator("text=/passwords.*match/i");
    await expect(errorMessage).toBeVisible();
  });

  test("should require strong password", async ({ page }) => {
    $1
    await page.waitForLoadState("networkidle");$2await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="email"]', "test.temp@example.com");
    await page.fill('input[name="password"]', "weak");

    // Should show password strength indicator or error
    const passwordError = page.locator(
      "text=/password.*strong|password.*8 characters/i",
    );
    await expect(passwordError).toBeVisible();
  });

  test("should prevent registration without accepting terms", async ({
    page,
  }) => {
    const customer = generateTestCustomer();

    $1
    await page.waitForLoadState("networkidle");$2await page.fill(
      'input[name="name"]',
      `${customer.firstName} ${customer.lastName}`,
    );
    await page.fill('input[name="email"]', customer.email);
    await page.fill('input[name="password"]', customer.password);
    await page.fill('input[name="confirmPassword"]', customer.password);
    await page.click('input[type="radio"][value="CONSUMER"]');

    // Do NOT check terms
    // await page.check('input[name="agreeToTerms"]');

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show terms error or stay on page
    const termsError = page.locator("text=/accept.*terms|must agree/i");
    await expect(termsError).toBeVisible();
  });

  test("should show error for duplicate email", async ({ page }) => {
    // Note: This test assumes a known test account exists
    $1
    await page.waitForLoadState("networkidle");$2// Use a known existing email (from test setup)
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "customer@farmersmarket.app");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.fill('input[name="confirmPassword"]', "TestPassword123!");
    await page.click('input[type="radio"][value="CONSUMER"]');
    await page.check('input[name="agreeToTerms"]');

    await page.click('button[type="submit"]');

    // Should show duplicate email error
    const errorMessage = page.locator(
      "text=/email.*already|already.*registered|user.*exists/i",
    );
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test("should have link to login page", async ({ page }) => {
    $1
    await page.waitForLoadState("networkidle");$2// Should have link to login
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();

    // Click and verify navigation
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should be mobile responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    $1
    await page.waitForLoadState("networkidle");$2// Form should be visible and usable
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();

    // Check if form is scrollable and inputs are accessible
    await nameInput.fill("John Doe");
    await expect(nameInput).toHaveValue("John Doe");

    // Submit button should be visible
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });
});

test.describe("🔐 Customer Login Flow", () => {
  test("should login successfully with valid credentials", async ({ page }) => {
    // Note: This assumes a test account exists
    $1
    await page.waitForLoadState("networkidle");$2await page.fill('input[name="email"]', TEST_USERS.customer.email);
    await page.fill('input[name="password"]', TEST_USERS.customer.password);

    await page.click('button[type="submit"]:has-text("Sign In")');

    // Should redirect after login (customers may not have dedicated dashboard)
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);

    // Should see user info or dashboard elements
    const welcomeMessage = page.locator("text=/welcome|dashboard/i");
    await expect(welcomeMessage).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    $1
    await page.waitForLoadState("networkidle");$2await page.fill('input[name="email"]', "nonexistent@example.com");
    await page.fill('input[name="password"]', "WrongPassword123!");

    await page.click('button[type="submit"]');

    // Should show error message
    const errorMessage = page.locator("text=/invalid.*credentials|incorrect/i");
    await expect(errorMessage).toBeVisible();
  });

  test("should have forgot password link", async ({ page }) => {
    $1
    await page.waitForLoadState("networkidle");$2const forgotPasswordLink = page.locator('a:has-text("Forgot Password")');
    await expect(forgotPasswordLink).toBeVisible();

    await forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password|\/reset-password/);
  });

  test("should have link to registration page", async ({ page }) => {
    $1
    await page.waitForLoadState("networkidle");$2const registerLink = page.locator('a[href="/signup"]');
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe("👤 Customer Profile Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    $1
    await page.waitForLoadState("networkidle");$2await page.fill('input[name="email"]', TEST_USERS.customer.email);
    await page.fill('input[name="password"]', TEST_USERS.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("should navigate to account settings", async ({ page }) => {
    // Navigate to account page
    $1
    await page.waitForLoadState("networkidle");$2// Should see account information
    await expect(page.getByRole("heading", { name: /account/i })).toBeVisible();

    // Should see profile fields
    await expect(page.locator("text=/email|name/i")).toBeVisible();
  });

  test("should view account details", async ({ page }) => {
    $1
    await page.waitForLoadState("networkidle");$2// Should display user information
    const emailElement = page.locator("text=/test.customer@example.com/i");
    await expect(emailElement).toBeVisible();

    // Should have statistics
    const statsElements = page.locator("text=/total orders|total spent/i");
    await expect(statsElements.first()).toBeVisible();
  });

  test("should navigate between dashboard and account", async ({ page }) => {
    // Start at dashboard
    $1
    await page.waitForLoadState("networkidle");$2await expect(page).toHaveURL(/\/dashboard/);

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
    $1
    await page.waitForLoadState("networkidle");$2await page.fill('input[name="email"]', TEST_USERS.customer.email);
    await page.fill('input[name="password"]', TEST_USERS.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await logoutButton.click();

    // Should redirect to homepage or login page
    await page.waitForURL(/\/|\/login/);

    // Should not be able to access protected pages
    $1
    await page.waitForLoadState("networkidle");$2await expect(page).toHaveURL(/\/login/);
  });
});
