/**
 * 🔐 Authentication Helpers for E2E Tests
 * Provides utilities for logging in as different user roles
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 */

import { Page, BrowserContext } from "@playwright/test";

// Timeouts for various operations
const TIMEOUTS = {
  navigation: 15000,
  elementVisible: 10000,
  formSubmit: 10000,
};

/**
 * Wait for page to be ready with element-based wait (not networkIdle)
 * This is more reliable with Next.js dev servers and SPAs
 */
async function waitForPageReady(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector, {
    state: "visible",
    timeout: TIMEOUTS.elementVisible,
  });
}

/**
 * Test user credentials
 */
export const TEST_USERS = {
  admin: {
    email: "admin@farmersmarket.app",
    password: "DivineAdmin123!",
    role: "ADMIN" as const,
  },
  farmer: {
    email: "farmer@farmersmarket.app",
    password: "DivineFarmer123!",
    role: "FARMER" as const,
  },
  customer: {
    email: "customer@farmersmarket.app",
    password: "DivineCustomer123!",
    role: "CONSUMER" as const,
  },
  farmer2: {
    email: "farmer1@test.farmersmarket.app",
    password: "TestFarmer123!",
    role: "FARMER" as const,
  },
} as const;

/**
 * Login as a customer
 */
export async function loginAsCustomer(page: Page): Promise<void> {
  await login(page, TEST_USERS.customer);
}

/**
 * Login as a farmer
 */
export async function loginAsFarmer(page: Page): Promise<void> {
  await login(page, TEST_USERS.farmer);
}

/**
 * Login as an admin
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, TEST_USERS.admin);
}

/**
 * Generic login function
 */
export async function login(
  page: Page,
  credentials: { email: string; password: string; role: string },
): Promise<void> {
  console.log(`🔐 Logging in as ${credentials.role}: ${credentials.email}`);

  // Navigate to login page
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  // Wait for login form to be ready - element-based wait instead of networkIdle
  await waitForPageReady(page, 'input[name="email"], input[type="email"]');

  // Fill login form
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation after login - element-based wait instead of networkIdle
  await page.waitForURL((url: URL) => !url.pathname.includes("/login"), {
    timeout: TIMEOUTS.navigation,
  });

  // Verify login succeeded by checking we're not on login page
  const currentUrl = page.url();
  if (currentUrl.includes("/login")) {
    console.error("❌ Login failed - still on login page");
    // Take screenshot for debugging
    await page.screenshot({
      path: `test-results/login-failed-${credentials.role}.png`,
    });
    throw new Error(
      `Login failed for ${credentials.role}: ${credentials.email}`,
    );
  }

  console.log(`✅ Successfully logged in as ${credentials.role}`);
}

/**
 * Logout the current user
 */
export async function logout(page: Page): Promise<void> {
  console.log("🚪 Logging out...");

  // Try to find logout button/link
  const logoutSelectors = [
    'button:has-text("Logout")',
    'button:has-text("Log out")',
    'a:has-text("Logout")',
    'a:has-text("Log out")',
    '[data-testid="logout"]',
  ];

  for (const selector of logoutSelectors) {
    try {
      await page.click(selector, { timeout: 2000 });
      // Wait for redirect to login/home page - element-based wait instead of networkIdle
      await page.waitForURL(/\/login|\/$/i, { timeout: TIMEOUTS.navigation });
      console.log("✅ Successfully logged out");
      return;
    } catch {
      // Try next selector
      continue;
    }
  }

  // If no logout button found, clear cookies/storage
  console.log("⚠️  No logout button found, clearing storage...");
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  console.log("✅ Storage cleared");
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check for common authenticated UI elements
  const authIndicators = [
    '[data-testid="user-menu"]',
    '[data-testid="profile-menu"]',
    'button:has-text("Logout")',
    'a:has-text("Dashboard")',
  ];

  for (const selector of authIndicators) {
    try {
      await page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      continue;
    }
  }

  return false;
}

/**
 * Setup authenticated context for a user role
 * This creates a browser context with saved auth state
 */
export async function setupAuthContext(
  context: BrowserContext,
  role: "admin" | "farmer" | "customer",
): Promise<void> {
  const page = await context.newPage();
  const user = TEST_USERS[role];

  try {
    await login(page, user);

    // Save storage state to file
    const authPath = `tests/auth/.auth/${role}.json`;
    await context.storageState({ path: authPath });
    console.log(`✅ Saved auth state to ${authPath}`);
  } finally {
    await page.close();
  }
}

/**
 * Wait for authentication to complete
 */
export async function waitForAuth(
  page: Page,
  timeout: number = 10000,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await isAuthenticated(page)) {
      return;
    }
    await page.waitForTimeout(500);
  }

  throw new Error(`Authentication did not complete within ${timeout}ms`);
}

/**
 * Login with API call (faster than UI login)
 * Use this for test setup when you don't need to test the login UI
 */
export async function loginWithAPI(
  page: Page,
  credentials: { email: string; password: string },
): Promise<void> {
  console.log(`🔐 API Login: ${credentials.email}`);

  const response = await page.request.post("/api/auth/signin", {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  if (!response.ok()) {
    throw new Error(`API login failed with status ${response.status()}`);
  }

  console.log("✅ API login successful");
}

/**
 * Get auth storage state path for a role
 */
export function getAuthStoragePath(
  role: "admin" | "farmer" | "customer",
): string {
  return `tests/auth/.auth/${role}.json`;
}

/**
 * Ensure user is logged in before test
 * If not logged in, performs login
 */
export async function ensureLoggedIn(
  page: Page,
  role: "admin" | "farmer" | "customer",
): Promise<void> {
  if (await isAuthenticated(page)) {
    console.log(`✅ Already authenticated as ${role}`);
    return;
  }

  console.log(`⚠️  Not authenticated, logging in as ${role}...`);
  const user = TEST_USERS[role];
  await login(page, user);
}

/**
 * Login and navigate to a specific page
 */
export async function loginAndNavigate(
  page: Page,
  role: "admin" | "farmer" | "customer",
  path: string,
): Promise<void> {
  await ensureLoggedIn(page, role);
  await page.goto(path, { waitUntil: "domcontentloaded" });
  // Wait for page content - element-based wait instead of networkIdle
  await waitForPageReady(page, "body");
}

/**
 * Create a test user session for API testing
 */
export async function createTestSession(
  page: Page,
  userEmail: string,
): Promise<string> {
  // This would typically call your session creation API
  // For now, return a mock session ID
  const response = await page.request.post("/api/test/create-session", {
    data: { email: userEmail },
  });

  const data = await response.json();
  return data.sessionId;
}

/**
 * Verify user has specific role permissions
 */
export async function verifyUserRole(
  page: Page,
  expectedRole: string,
): Promise<boolean> {
  try {
    // Check role-specific elements
    const roleIndicators: Record<string, string[]> = {
      ADMIN: ['a[href="/admin"]', '[data-testid="admin-panel"]'],
      FARMER: ['a[href="/farmer/dashboard"]', '[data-testid="farmer-tools"]'],
      CONSUMER: ['a[href="/dashboard"]', '[data-testid="customer-dashboard"]'],
    };

    const indicators = roleIndicators[expectedRole] || [];
    for (const selector of indicators) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        return true;
      } catch {
        continue;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export default {
  TEST_USERS,
  login,
  loginAsAdmin,
  loginAsFarmer,
  loginAsCustomer,
  logout,
  isAuthenticated,
  setupAuthContext,
  waitForAuth,
  loginWithAPI,
  getAuthStoragePath,
  ensureLoggedIn,
  loginAndNavigate,
  createTestSession,
  verifyUserRole,
};
