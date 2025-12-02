/**
 * 🔐 E2E Authentication Helpers
 * Reusable authentication utilities for Playwright tests
 */

import { Page, expect } from "@playwright/test";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Test user credentials
 */
export const TEST_USERS = {
  admin: {
    email: "admin@farmersmarket.app",
    password: "DivineAdmin123!",
    role: "ADMIN",
  },
  farmer: {
    email: "farmer@farmersmarket.app",
    password: "DivineFarmer123!",
    role: "FARMER",
  },
  customer: {
    email: "customer@farmersmarket.app",
    password: "DivineCustomer123!",
    role: "CONSUMER",
  },
} as const;

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', TEST_USERS.admin.email);
  await page.fill('input[name="password"]', TEST_USERS.admin.password);
  await page.click('button[type="submit"]');

  // Wait for redirect to admin dashboard
  await page.waitForURL(/\/admin/, { timeout: 10000 });
  console.log("✅ Logged in as Admin");
}

/**
 * Login as farmer user
 */
export async function loginAsFarmer(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', TEST_USERS.farmer.email);
  await page.fill('input[name="password"]', TEST_USERS.farmer.password);
  await page.click('button[type="submit"]');

  // Wait for redirect to farmer dashboard
  await page.waitForURL(/\/farmer/, { timeout: 10000 });
  console.log("✅ Logged in as Farmer");
}

/**
 * Login as customer user
 */
export async function loginAsCustomer(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', TEST_USERS.customer.email);
  await page.fill('input[name="password"]', TEST_USERS.customer.password);
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForLoadState("networkidle");
  console.log("✅ Logged in as Customer");
}

/**
 * Generic login function
 */
export async function login(
  page: Page,
  email: string,
  password: string,
  expectedRedirect?: string | RegExp,
) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  if (expectedRedirect) {
    await page.waitForURL(expectedRedirect, { timeout: 10000 });
  } else {
    await page.waitForLoadState("networkidle");
  }

  console.log(`✅ Logged in as ${email}`);
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  try {
    // Try to find and click logout button
    const logoutButton = page.locator('[data-testid="logout-button"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Fallback: navigate to logout API
      await page.goto(`${BASE_URL}/api/auth/signout`);
      await page.click('button:has-text("Sign out")');
    }

    await page.waitForURL(/\/login|\//, { timeout: 5000 });
    console.log("✅ Logged out successfully");
  } catch (error) {
    console.warn("⚠️ Logout may have failed:", error);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check for auth indicators
    const authIndicators = [
      page.locator('[data-testid="user-menu"]'),
      page.locator('[data-testid="profile-button"]'),
      page.locator("text=/logout/i"),
    ];

    for (const indicator of authIndicators) {
      if (await indicator.isVisible({ timeout: 2000 })) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Ensure user is authenticated (login if not)
 */
export async function ensureAuthenticated(
  page: Page,
  userType: keyof typeof TEST_USERS = "customer",
) {
  const authenticated = await isAuthenticated(page);

  if (!authenticated) {
    switch (userType) {
      case "admin":
        await loginAsAdmin(page);
        break;
      case "farmer":
        await loginAsFarmer(page);
        break;
      case "customer":
        await loginAsCustomer(page);
        break;
    }
  }
}

/**
 * Wait for login to complete and session to be established
 */
export async function waitForSession(page: Page) {
  // Wait for session cookie to be set
  await page.waitForFunction(
    () => {
      const cookies = document.cookie;
      return (
        cookies.includes("next-auth.session-token") ||
        cookies.includes("__Secure-next-auth.session-token")
      );
    },
    { timeout: 10000 },
  );
  console.log("✅ Session established");
}

/**
 * Clear all cookies and storage
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  console.log("✅ Session cleared");
}

/**
 * Verify user role after login
 */
export async function verifyUserRole(
  page: Page,
  expectedRole: "ADMIN" | "FARMER" | "CONSUMER",
) {
  // Check URL for role-specific dashboard
  const url = page.url();

  switch (expectedRole) {
    case "ADMIN":
      expect(url).toMatch(/\/admin/);
      break;
    case "FARMER":
      expect(url).toMatch(/\/farmer/);
      break;
    case "CONSUMER":
      // Customers may be on home or account page
      expect(url).toMatch(/\/|\/account/);
      break;
  }
}
