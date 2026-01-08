/**
 * Authentication Module - Login Flow
 *
 * Migrated from legacy bot scripts to Unified Bot Framework
 * Tests user login functionality for all user roles
 */

import { logger } from '@/lib/monitoring/logger';
import type { ModuleExecutionContext } from '../../core/bot-engine';
import type { BotModule, BotResult } from '../../types';
import { createAssertions } from '../../utils/assertions';
import { getLoginSelectors } from '../../utils/selectors';
import { getSeededAdmin, getSeededFarmer } from '../../utils/test-data';

/**
 * Login as customer module
 */
export const loginAsCustomerModule: BotModule = {
  id: 'auth.login.customer',
  name: 'Login as Customer',
  category: 'auth',
  description: 'Test customer login flow with valid credentials',
  tags: ['auth', 'login', 'customer', 'critical'],
  enabled: true,
  retryOnFailure: true,
  timeout: 30000,

  async execute(context: ModuleExecutionContext): Promise<BotResult> {
    const { browserManager, config } = context;
    const page = browserManager.getPage();
    const selectors = getLoginSelectors();
    const assertions = createAssertions(page);

    try {
      logger.info('[Auth.Login.Customer] Starting customer login test');

      // Navigate to login page
      await browserManager.navigateTo('/login');
      await page.waitForLoadState('networkidle');

      // Verify login page loaded
      const titleResult = await assertions.titleMatches(/login/i);
      if (!titleResult.passed) {
        return {
          status: 'failed',
          error: 'Login page did not load correctly',
          details: { titleCheck: titleResult }
        };
      }

      // Check login form is visible
      const formVisible = await assertions.isVisible(selectors.emailInput);
      if (!formVisible.passed) {
        return {
          status: 'failed',
          error: 'Login form not visible',
          screenshot: formVisible.screenshot
        };
      }

      // Fill in customer credentials
      const customerEmail = config.testUsers?.customer?.email || 'customer@test.com';
      const customerPassword = config.testUsers?.customer?.password || 'Test123!@#';

      await page.fill(selectors.emailInput, customerEmail);
      await page.fill(selectors.passwordInput, customerPassword);

      // Submit form
      await page.click(selectors.submitButton);

      // Wait for navigation
      await page.waitForURL('**/dashboard', { timeout: 10000 });

      // Verify successful login
      const dashboardVisible = await assertions.isVisible('[data-testid="customer-dashboard"]');
      if (!dashboardVisible.passed) {
        return {
          status: 'failed',
          error: 'Dashboard not visible after login',
          screenshot: dashboardVisible.screenshot
        };
      }

      // Verify user menu or profile indicator
      const userMenuVisible = await assertions.isVisible('[data-testid="user-menu"]');

      logger.info('[Auth.Login.Customer] Customer login successful');

      return {
        status: 'success',
        details: {
          email: customerEmail,
          redirectUrl: page.url(),
          dashboardVisible: dashboardVisible.passed,
          userMenuVisible: userMenuVisible.passed
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[Auth.Login.Customer] Failed:', error);

      const screenshot = await browserManager.takeScreenshot('login-customer-failed');

      return {
        status: 'failed',
        error: errorMessage,
        screenshot,
        details: { url: page.url() }
      };
    }
  }
};

/**
 * Login as farmer module
 */
export const loginAsFarmerModule: BotModule = {
  id: 'auth.login.farmer',
  name: 'Login as Farmer',
  category: 'auth',
  description: 'Test farmer login flow with valid credentials',
  tags: ['auth', 'login', 'farmer', 'critical'],
  enabled: true,
  retryOnFailure: true,
  timeout: 30000,

  async execute(context: ModuleExecutionContext): Promise<BotResult> {
    const { browserManager, config } = context;
    const page = browserManager.getPage();
    const selectors = getLoginSelectors();
    const assertions = createAssertions(page);

    try {
      logger.info('[Auth.Login.Farmer] Starting farmer login test');

      // Get seeded farmer credentials
      const farmer = getSeededFarmer();

      // Navigate to login page
      await browserManager.navigateTo('/login');
      await page.waitForLoadState('networkidle');

      // Verify login page
      const formVisible = await assertions.isVisible(selectors.emailInput);
      if (!formVisible.passed) {
        return {
          status: 'failed',
          error: 'Login form not visible',
          screenshot: formVisible.screenshot
        };
      }

      // Fill credentials
      await page.fill(selectors.emailInput, farmer.email);
      await page.fill(selectors.passwordInput, farmer.password);

      // Submit
      await page.click(selectors.submitButton);

      // Wait for redirect to farmer dashboard
      await page.waitForURL('**/farmer/**', { timeout: 10000 });

      // Verify farmer dashboard elements
      const dashboardResult = await assertions.isVisible('[data-testid="farmer-dashboard"]');
      if (!dashboardResult.passed) {
        return {
          status: 'failed',
          error: 'Farmer dashboard not visible after login',
          screenshot: dashboardResult.screenshot
        };
      }

      // Check for farmer-specific navigation
      const farmNavVisible = await assertions.isVisible('[data-testid="farm-nav"]');

      logger.info('[Auth.Login.Farmer] Farmer login successful');

      return {
        status: 'success',
        details: {
          email: farmer.email,
          farmName: farmer.farmName,
          redirectUrl: page.url(),
          dashboardVisible: dashboardResult.passed,
          farmNavVisible: farmNavVisible.passed
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[Auth.Login.Farmer] Failed:', error);

      const screenshot = await browserManager.takeScreenshot('login-farmer-failed');

      return {
        status: 'failed',
        error: errorMessage,
        screenshot,
        details: { url: page.url() }
      };
    }
  }
};

/**
 * Login as admin module
 */
export const loginAsAdminModule: BotModule = {
  id: 'auth.login.admin',
  name: 'Login as Admin',
  category: 'auth',
  description: 'Test admin login flow with valid credentials',
  tags: ['auth', 'login', 'admin', 'critical'],
  enabled: true,
  retryOnFailure: true,
  timeout: 30000,

  async execute(context: ModuleExecutionContext): Promise<BotResult> {
    const { browserManager, config } = context;
    const page = browserManager.getPage();
    const selectors = getLoginSelectors();
    const assertions = createAssertions(page);

    try {
      logger.info('[Auth.Login.Admin] Starting admin login test');

      // Get seeded admin credentials
      const admin = getSeededAdmin();

      // Navigate to login page
      await browserManager.navigateTo('/login');
      await page.waitForLoadState('networkidle');

      // Fill credentials
      await page.fill(selectors.emailInput, admin.email);
      await page.fill(selectors.passwordInput, admin.password);

      // Submit
      await page.click(selectors.submitButton);

      // Wait for redirect to admin panel
      await page.waitForURL('**/admin/**', { timeout: 10000 });

      // Verify admin panel elements
      const adminPanelResult = await assertions.isVisible('[data-testid="admin-panel"]');
      if (!adminPanelResult.passed) {
        return {
          status: 'failed',
          error: 'Admin panel not visible after login',
          screenshot: adminPanelResult.screenshot
        };
      }

      // Check for admin-specific features
      const userManagementVisible = await assertions.isVisible('[data-testid="user-management"]');

      logger.info('[Auth.Login.Admin] Admin login successful');

      return {
        status: 'success',
        details: {
          email: admin.email,
          redirectUrl: page.url(),
          adminPanelVisible: adminPanelResult.passed,
          userManagementVisible: userManagementVisible.passed
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[Auth.Login.Admin] Failed:', error);

      const screenshot = await browserManager.takeScreenshot('login-admin-failed');

      return {
        status: 'failed',
        error: errorMessage,
        screenshot,
        details: { url: page.url() }
      };
    }
  }
};

/**
 * Invalid credentials test module
 */
export const loginInvalidCredentialsModule: BotModule = {
  id: 'auth.login.invalid',
  name: 'Login with Invalid Credentials',
  category: 'auth',
  description: 'Test login failure handling with invalid credentials',
  tags: ['auth', 'login', 'negative', 'security'],
  enabled: true,
  retryOnFailure: false, // Don't retry negative tests
  timeout: 20000,

  async execute(context: ModuleExecutionContext): Promise<BotResult> {
    const { browserManager } = context;
    const page = browserManager.getPage();
    const selectors = getLoginSelectors();
    const assertions = createAssertions(page);

    try {
      logger.info('[Auth.Login.Invalid] Testing invalid credentials');

      // Navigate to login page
      await browserManager.navigateTo('/login');
      await page.waitForLoadState('networkidle');

      // Try invalid credentials
      await page.fill(selectors.emailInput, 'invalid@example.com');
      await page.fill(selectors.passwordInput, 'WrongPassword123!');
      await page.click(selectors.submitButton);

      // Wait for error message
      await page.waitForTimeout(2000);

      // Verify error message is shown
      const errorVisible = await assertions.isVisible(selectors.errorMessage);
      if (!errorVisible.passed) {
        return {
          status: 'failed',
          error: 'Error message not shown for invalid credentials',
          screenshot: errorVisible.screenshot
        };
      }

      // Verify user is still on login page
      const urlResult = await assertions.urlMatches('/login');
      if (!urlResult.passed) {
        return {
          status: 'failed',
          error: 'User was redirected despite invalid credentials',
          details: { currentUrl: page.url() }
        };
      }

      logger.info('[Auth.Login.Invalid] Invalid credentials test passed');

      return {
        status: 'success',
        details: {
          errorMessageShown: errorVisible.passed,
          stayedOnLoginPage: urlResult.passed
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[Auth.Login.Invalid] Failed:', error);

      return {
        status: 'failed',
        error: errorMessage,
        details: { url: page.url() }
      };
    }
  }
};

/**
 * Session persistence test module
 */
export const loginSessionPersistenceModule: BotModule = {
  id: 'auth.login.session',
  name: 'Login Session Persistence',
  category: 'auth',
  description: 'Test that login session persists across page reloads',
  tags: ['auth', 'session', 'persistence'],
  enabled: true,
  retryOnFailure: true,
  timeout: 30000,

  async execute(context: ModuleExecutionContext): Promise<BotResult> {
    const { browserManager } = context;
    const page = browserManager.getPage();
    const selectors = getLoginSelectors();
    const assertions = createAssertions(page);

    try {
      logger.info('[Auth.Session] Testing session persistence');

      // First login
      const farmer = getSeededFarmer();
      await browserManager.navigateTo('/login');
      await page.fill(selectors.emailInput, farmer.email);
      await page.fill(selectors.passwordInput, farmer.password);
      await page.click(selectors.submitButton);
      await page.waitForURL('**/farmer/**', { timeout: 10000 });

      // Verify logged in
      const initialDashboard = await assertions.isVisible('[data-testid="farmer-dashboard"]');
      if (!initialDashboard.passed) {
        return {
          status: 'failed',
          error: 'Initial login failed'
        };
      }

      // Reload page
      await page.reload({ waitUntil: 'networkidle' });

      // Verify still logged in after reload
      const afterReloadDashboard = await assertions.isVisible('[data-testid="farmer-dashboard"]');
      if (!afterReloadDashboard.passed) {
        return {
          status: 'failed',
          error: 'Session not persisted after page reload',
          screenshot: afterReloadDashboard.screenshot
        };
      }

      // Verify not redirected to login
      const notOnLogin = !(await assertions.urlMatches('/login')).passed;

      logger.info('[Auth.Session] Session persistence test passed');

      return {
        status: 'success',
        details: {
          sessionPersisted: afterReloadDashboard.passed,
          notRedirectedToLogin: notOnLogin
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[Auth.Session] Failed:', error);

      return {
        status: 'failed',
        error: errorMessage,
        details: { url: page.url() }
      };
    }
  }
};

/**
 * Export all login modules as an array for easy registration
 */
export const loginModules: BotModule[] = [
  loginAsCustomerModule,
  loginAsFarmerModule,
  loginAsAdminModule,
  loginInvalidCredentialsModule,
  loginSessionPersistenceModule
];

/**
 * Export default module (most common use case)
 */
export default loginAsFarmerModule;
