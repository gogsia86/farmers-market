/**
 * 🔐 Unified Authentication Service
 * Farmers Market Platform - Centralized Bot Authentication
 * Version: 1.0.0
 *
 * Provides centralized authentication management for all bot testing scenarios.
 * Eliminates code duplication and ensures consistent session handling.
 */

import type { Page } from "playwright";
import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type UserRole = "customer" | "farmer" | "admin" | "guest";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  token?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface AuthServiceConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  sessionStorageKey?: string;
}

export interface LoginOptions {
  rememberMe?: boolean;
  skipNavigation?: boolean;
  waitForRedirect?: boolean;
  expectedRedirectUrl?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  farmName?: string; // For farmer registration
  farmDescription?: string;
  phoneNumber?: string;
}

// ============================================================================
// DEFAULT CREDENTIALS
// ============================================================================

export const DEFAULT_CREDENTIALS: Record<UserRole, AuthCredentials> = {
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@farmersmarket.app",
    password: process.env.ADMIN_PASSWORD || "DivineAdmin123!",
  },
  farmer: {
    email: process.env.FARMER_EMAIL || "farmer.test@farmersmarket.test",
    password: process.env.TEST_USER_PASSWORD || "FarmerTest123!",
  },
  customer: {
    email: process.env.CUSTOMER_EMAIL || "customer.test@farmersmarket.test",
    password: process.env.TEST_USER_PASSWORD || "CustomerTest123!",
  },
  guest: {
    email: "",
    password: "",
  },
};

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

export class AuthService {
  private config: Required<AuthServiceConfig>;
  private sessions: Map<string, UserSession> = new Map();
  private currentSession: UserSession | null = null;

  constructor(config: AuthServiceConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 2,
      retryDelay: 1000,
      sessionStorageKey: "bot-session",
      ...config,
    };
  }

  // ==========================================================================
  // PUBLIC API - LOGIN METHODS
  // ==========================================================================

  /**
   * Login as customer with default or custom credentials
   */
  async loginAsCustomer(
    page: Page,
    credentials?: Partial<AuthCredentials>,
    options?: LoginOptions,
  ): Promise<UserSession> {
    const creds = {
      ...DEFAULT_CREDENTIALS.customer,
      ...credentials,
    };

    return await this.login(page, creds, "customer", options);
  }

  /**
   * Login as farmer with default or custom credentials
   */
  async loginAsFarmer(
    page: Page,
    credentials?: Partial<AuthCredentials>,
    options?: LoginOptions,
  ): Promise<UserSession> {
    const creds = {
      ...DEFAULT_CREDENTIALS.farmer,
      ...credentials,
    };

    return await this.login(page, creds, "farmer", options);
  }

  /**
   * Login as admin with default or custom credentials
   */
  async loginAsAdmin(
    page: Page,
    credentials?: Partial<AuthCredentials>,
    options?: LoginOptions,
  ): Promise<UserSession> {
    const creds = {
      ...DEFAULT_CREDENTIALS.admin,
      ...credentials,
    };

    return await this.login(page, creds, "admin", options);
  }

  /**
   * Generic login method with role specification
   */
  async login(
    page: Page,
    credentials: AuthCredentials,
    role: UserRole,
    options?: LoginOptions,
  ): Promise<UserSession> {
    const opts = {
      rememberMe: false,
      skipNavigation: false,
      waitForRedirect: true,
      expectedRedirectUrl: this.getExpectedRedirectUrl(role),
      ...options,
    };

    logger.info(`[AuthService] Logging in as ${role}`, {
      email: credentials.email,
    });

    try {
      // Navigate to login page if not skipped
      if (!opts.skipNavigation) {
        await page.goto(`${this.config.baseUrl}/login`, {
          waitUntil: "domcontentloaded",
          timeout: this.config.timeout,
        });
        await page.waitForLoadState("networkidle");
      }

      // Wait for login form
      await this.waitForLoginForm(page);

      // Fill credentials
      await this.fillLoginForm(page, credentials, opts.rememberMe);

      // Submit form
      await this.submitLoginForm(page);

      // Wait for navigation/redirect
      if (opts.waitForRedirect) {
        await this.waitForSuccessfulLogin(page, opts.expectedRedirectUrl);
      }

      // Extract session from page
      const session = await this.extractSession(page, role);

      // Store session
      this.currentSession = session;
      this.sessions.set(session.userId, session);

      logger.info(`[AuthService] Login successful`, {
        userId: session.userId,
        role: session.role,
      });

      return session;
    } catch (error) {
      logger.error(`[AuthService] Login failed`, {
        error: error instanceof Error ? error.message : String(error),
        email: credentials.email,
        role,
      });
      throw new Error(
        `Login failed for ${role}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Login via API (faster, no UI interaction)
   */
  async loginViaAPI(
    page: Page,
    credentials: AuthCredentials,
    role: UserRole,
  ): Promise<UserSession> {
    logger.info(`[AuthService] API login as ${role}`, {
      email: credentials.email,
    });

    try {
      // Make API request
      const response = await page.request.post(
        `${this.config.baseUrl}/api/auth/login`,
        {
          data: {
            email: credentials.email,
            password: credentials.password,
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok()) {
        throw new Error(`API login failed: ${response.status()}`);
      }

      const data = await response.json();

      // Create session from API response
      const session: UserSession = {
        userId: data.user?.id || data.userId,
        email: credentials.email,
        name: data.user?.name || "Test User",
        role,
        token: data.token || data.accessToken,
        expiresAt: data.expiresAt
          ? new Date(data.expiresAt)
          : new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      // Set auth cookie/token in browser
      if (session.token) {
        await this.setAuthCookie(page, session.token);
      }

      // Store session
      this.currentSession = session;
      this.sessions.set(session.userId, session);

      logger.info(`[AuthService] API login successful`, {
        userId: session.userId,
      });

      return session;
    } catch (error) {
      logger.error(`[AuthService] API login failed`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==========================================================================
  // PUBLIC API - LOGOUT METHODS
  // ==========================================================================

  /**
   * Logout current user
   */
  async logout(page: Page): Promise<void> {
    logger.info(`[AuthService] Logging out`, {
      userId: this.currentSession?.userId,
    });

    try {
      // Navigate to logout endpoint or click logout button
      await Promise.race([
        // Option 1: Navigate to logout endpoint
        page.goto(`${this.config.baseUrl}/api/auth/logout`, {
          timeout: this.config.timeout,
        }),

        // Option 2: Click logout button
        (async () => {
          const logoutSelectors = [
            '[data-testid="logout-button"]',
            'button:has-text("Logout")',
            'button:has-text("Sign Out")',
            'a[href="/logout"]',
            'a[href="/api/auth/signout"]',
          ];

          for (const selector of logoutSelectors) {
            try {
              const element = await page.waitForSelector(selector, {
                timeout: 2000,
              });
              if (element) {
                await element.click();
                break;
              }
            } catch {
              continue;
            }
          }
        })(),
      ]);

      // Wait for logout to complete
      await page.waitForURL(/\/(login|$)/, { timeout: 5000 }).catch(() => {
        // Ignore timeout - logout may not redirect
      });

      // Clear session
      if (this.currentSession) {
        this.sessions.delete(this.currentSession.userId);
        this.currentSession = null;
      }

      // Clear cookies
      await page.context().clearCookies();

      logger.info(`[AuthService] Logout successful`);
    } catch (error) {
      logger.error(`[AuthService] Logout failed`, {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - logout failure is not critical for tests
    }
  }

  // ==========================================================================
  // PUBLIC API - REGISTRATION METHODS
  // ==========================================================================

  /**
   * Register new customer
   */
  async registerCustomer(
    page: Page,
    data: RegistrationData,
  ): Promise<UserSession> {
    return await this.register(page, { ...data, role: "customer" });
  }

  /**
   * Register new farmer
   */
  async registerFarmer(
    page: Page,
    data: RegistrationData,
  ): Promise<UserSession> {
    return await this.register(page, { ...data, role: "farmer" });
  }

  /**
   * Generic registration method
   */
  async register(page: Page, data: RegistrationData): Promise<UserSession> {
    logger.info(`[AuthService] Registering ${data.role}`, {
      email: data.email,
    });

    try {
      // Navigate to registration page
      const registrationUrl =
        data.role === "farmer"
          ? `${this.config.baseUrl}/register/farmer`
          : `${this.config.baseUrl}/register`;

      await page.goto(registrationUrl, {
        waitUntil: "domcontentloaded",
        timeout: this.config.timeout,
      });

      // Wait for registration form
      await this.waitForRegistrationForm(page);

      // Fill registration form
      await this.fillRegistrationForm(page, data);

      // Submit form
      await this.submitRegistrationForm(page);

      // Wait for success
      await this.waitForSuccessfulRegistration(page);

      // Auto-login after registration
      const session = await this.extractSession(page, data.role);

      // Store session
      this.currentSession = session;
      this.sessions.set(session.userId, session);

      logger.info(`[AuthService] Registration successful`, {
        userId: session.userId,
      });

      return session;
    } catch (error) {
      logger.error(`[AuthService] Registration failed`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==========================================================================
  // PUBLIC API - SESSION MANAGEMENT
  // ==========================================================================

  /**
   * Get current active session
   */
  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  /**
   * Get session by user ID
   */
  getSession(userId: string): UserSession | null {
    return this.sessions.get(userId) || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  /**
   * Check if current session has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.currentSession?.role === role;
  }

  /**
   * Verify session is still valid
   */
  async verifySession(page: Page): Promise<boolean> {
    try {
      // Check if auth endpoint returns valid session
      const response = await page.request.get(
        `${this.config.baseUrl}/api/auth/session`,
      );

      if (response.ok()) {
        const data = await response.json();
        return !!data.user;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Restore session from stored session data
   */
  async restoreSession(page: Page, session: UserSession): Promise<void> {
    logger.info(`[AuthService] Restoring session`, {
      userId: session.userId,
    });

    if (session.token) {
      await this.setAuthCookie(page, session.token);
    }

    this.currentSession = session;
    this.sessions.set(session.userId, session);
  }

  /**
   * Clear all sessions
   */
  clearSessions(): void {
    this.sessions.clear();
    this.currentSession = null;
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  private async waitForLoginForm(page: Page): Promise<void> {
    const selectors = [
      '[data-testid="login-form"]',
      'form[action*="login"]',
      'form:has(input[type="email"]):has(input[type="password"])',
    ];

    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, {
          timeout: this.config.timeout,
          state: "visible",
        });
        return;
      } catch {
        continue;
      }
    }

    throw new Error("Login form not found");
  }

  private async fillLoginForm(
    page: Page,
    credentials: AuthCredentials,
    rememberMe: boolean,
  ): Promise<void> {
    // Fill email
    const emailSelectors = [
      '[data-testid="email-input"]',
      'input[name="email"]',
      'input[type="email"]',
      'input[placeholder*="email" i]',
    ];

    for (const selector of emailSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 2000 });
        if (element) {
          await element.fill(credentials.email);
          break;
        }
      } catch {
        continue;
      }
    }

    // Fill password
    const passwordSelectors = [
      '[data-testid="password-input"]',
      'input[name="password"]',
      'input[type="password"]',
    ];

    for (const selector of passwordSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 2000 });
        if (element) {
          await element.fill(credentials.password);
          break;
        }
      } catch {
        continue;
      }
    }

    // Check remember me if needed
    if (rememberMe) {
      try {
        const rememberMeCheckbox = await page.waitForSelector(
          'input[type="checkbox"][name*="remember" i]',
          { timeout: 1000 },
        );
        if (rememberMeCheckbox) {
          await rememberMeCheckbox.check();
        }
      } catch {
        // Remember me checkbox is optional
      }
    }
  }

  private async submitLoginForm(page: Page): Promise<void> {
    const submitSelectors = [
      '[data-testid="login-submit"]',
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'input[type="submit"]',
    ];

    for (const selector of submitSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 2000 });
        if (element) {
          await element.click();
          return;
        }
      } catch {
        continue;
      }
    }

    // Fallback: press Enter on password field
    await page.keyboard.press("Enter");
  }

  private async waitForSuccessfulLogin(
    page: Page,
    expectedUrl?: string,
  ): Promise<void> {
    try {
      if (expectedUrl) {
        await page.waitForURL(expectedUrl, { timeout: 10000 });
      } else {
        // Wait for URL to change from /login
        await page.waitForURL((url) => !url.pathname.includes("/login"), {
          timeout: 10000,
        });
      }
    } catch {
      // Check if login error message is shown
      const errorSelectors = [
        '[data-testid="login-error"]',
        ".error-message",
        '[role="alert"]',
      ];

      for (const selector of errorSelectors) {
        const errorElement = await page.$(selector);
        if (errorElement) {
          const errorText = await errorElement.textContent();
          throw new Error(`Login failed: ${errorText}`);
        }
      }

      throw new Error("Login did not redirect as expected");
    }
  }

  private async waitForRegistrationForm(page: Page): Promise<void> {
    const selectors = [
      '[data-testid="registration-form"]',
      'form[action*="register"]',
      'form:has(input[name="firstName"]):has(input[name="lastName"])',
    ];

    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, {
          timeout: this.config.timeout,
          state: "visible",
        });
        return;
      } catch {
        continue;
      }
    }

    throw new Error("Registration form not found");
  }

  private async fillRegistrationForm(
    page: Page,
    data: RegistrationData,
  ): Promise<void> {
    // Email
    await this.fillField(page, ["email"], data.email);

    // Password
    await this.fillField(page, ["password"], data.password);

    // Confirm password (if exists)
    try {
      await this.fillField(
        page,
        ["confirmPassword", "passwordConfirm"],
        data.password,
        { timeout: 2000 },
      );
    } catch {
      // Confirm password field is optional
    }

    // First name
    await this.fillField(page, ["firstName", "first_name"], data.firstName);

    // Last name
    await this.fillField(page, ["lastName", "last_name"], data.lastName);

    // Phone (optional)
    if (data.phoneNumber) {
      try {
        await this.fillField(page, ["phone", "phoneNumber"], data.phoneNumber, {
          timeout: 2000,
        });
      } catch {
        // Phone is optional
      }
    }

    // Farmer-specific fields
    if (data.role === "farmer") {
      if (data.farmName) {
        await this.fillField(page, ["farmName", "farm_name"], data.farmName);
      }
      if (data.farmDescription) {
        await this.fillField(
          page,
          ["farmDescription", "description"],
          data.farmDescription,
        );
      }
    }
  }

  private async fillField(
    page: Page,
    nameVariants: string[],
    value: string,
    options?: { timeout?: number },
  ): Promise<void> {
    const timeout = options?.timeout || this.config.timeout;

    for (const name of nameVariants) {
      const selectors = [
        `[data-testid="${name}-input"]`,
        `[data-testid="${name}"]`,
        `input[name="${name}"]`,
        `textarea[name="${name}"]`,
      ];

      for (const selector of selectors) {
        try {
          const element = await page.waitForSelector(selector, {
            timeout: 1000,
          });
          if (element) {
            await element.fill(value);
            return;
          }
        } catch {
          continue;
        }
      }
    }

    throw new Error(`Field not found: ${nameVariants.join(", ")}`);
  }

  private async submitRegistrationForm(page: Page): Promise<void> {
    const submitSelectors = [
      '[data-testid="register-submit"]',
      '[data-testid="signup-submit"]',
      'button[type="submit"]',
      'button:has-text("Register")',
      'button:has-text("Sign Up")',
      'button:has-text("Create Account")',
    ];

    for (const selector of submitSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 2000 });
        if (element) {
          await element.click();
          return;
        }
      } catch {
        continue;
      }
    }

    throw new Error("Submit button not found");
  }

  private async waitForSuccessfulRegistration(page: Page): Promise<void> {
    try {
      // Wait for redirect away from registration page
      await page.waitForURL((url) => !url.pathname.includes("/register"), {
        timeout: 10000,
      });
    } catch {
      // Check for error messages
      const errorElement = await page.$('[role="alert"], .error-message');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        throw new Error(`Registration failed: ${errorText}`);
      }

      throw new Error("Registration did not complete successfully");
    }
  }

  private async extractSession(
    page: Page,
    role: UserRole,
  ): Promise<UserSession> {
    try {
      // Try to get session from API
      const response = await page.request.get(
        `${this.config.baseUrl}/api/auth/session`,
      );

      if (response.ok()) {
        const data = await response.json();

        return {
          userId: data.user?.id || `test-${role}-${Date.now()}`,
          email: data.user?.email || "",
          name: data.user?.name || `Test ${role}`,
          role,
          token: data.token,
        };
      }
    } catch {
      // Fallback to creating session from local data
    }

    // Fallback session
    return {
      userId: `test-${role}-${Date.now()}`,
      email: DEFAULT_CREDENTIALS[role].email,
      name: `Test ${role}`,
      role,
    };
  }

  private async setAuthCookie(page: Page, token: string): Promise<void> {
    await page.context().addCookies([
      {
        name: "next-auth.session-token",
        value: token,
        domain: new URL(this.config.baseUrl).hostname,
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);
  }

  private getExpectedRedirectUrl(role: UserRole): string {
    const redirects: Record<UserRole, string> = {
      customer: `${this.config.baseUrl}/marketplace`,
      farmer: `${this.config.baseUrl}/dashboard/farmer`,
      admin: `${this.config.baseUrl}/admin`,
      guest: `${this.config.baseUrl}/`,
    };

    return redirects[role];
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create auth service instance
 */
export function createAuthService(config: AuthServiceConfig): AuthService {
  return new AuthService(config);
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick login helper
 */
export async function quickLogin(
  page: Page,
  role: UserRole,
  baseUrl: string,
): Promise<UserSession> {
  const authService = createAuthService({ baseUrl });

  switch (role) {
    case "customer":
      return await authService.loginAsCustomer(page);
    case "farmer":
      return await authService.loginAsFarmer(page);
    case "admin":
      return await authService.loginAsAdmin(page);
    default:
      throw new Error(`Unsupported role: ${role}`);
  }
}

/**
 * Quick logout helper
 */
export async function quickLogout(page: Page, baseUrl: string): Promise<void> {
  const authService = createAuthService({ baseUrl });
  await authService.logout(page);
}

/**
 * Generate unique test credentials
 */
export function generateTestCredentials(
  role: UserRole,
  prefix?: string,
): AuthCredentials {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const prefixStr = prefix || "test";

  return {
    email: `${prefixStr}-${role}-${timestamp}-${randomId}@farmersmarket.test`,
    password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
  };
}

/**
 * Generate registration data with all required fields
 */
export function generateRegistrationData(
  role: UserRole,
  overrides?: Partial<RegistrationData>,
): RegistrationData {
  const credentials = generateTestCredentials(role);
  const timestamp = Date.now();

  const defaults: RegistrationData = {
    email: credentials.email,
    password: credentials.password,
    firstName: `Test${role.charAt(0).toUpperCase() + role.slice(1)}`,
    lastName: `User${timestamp}`,
    role,
  };

  if (role === "farmer") {
    defaults.farmName = `Test Farm ${timestamp}`;
    defaults.farmDescription = "Automated test farm";
  }

  return {
    ...defaults,
    ...overrides,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AuthService;
