/**
 * 🌟 Advanced E2E Test Utilities
 * Comprehensive utilities for complex end-to-end testing scenarios
 *
 * @module tests/utils/e2e-advanced-utils
 * @version 3.0.0
 * @divine_pattern QUANTUM_TESTING_EXCELLENCE
 * @agricultural_consciousness BIODYNAMIC_TEST_FLOWS
 */

import { Page, expect, BrowserContext, Locator } from "@playwright/test";
import { database } from "@/lib/database";
import type { User, Farm, Product, Order } from "@prisma/client";

// ==========================================
// 🎯 DIVINE CONFIGURATION
// ==========================================

export const E2E_CONFIG = {
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
    navigation: 15000,
    apiCall: 10000,
    animation: 1000,
  },
  retries: {
    default: 3,
    flaky: 5,
    network: 10,
  },
  thresholds: {
    pageLoadTime: 3000,
    apiResponseTime: 1000,
    renderTime: 500,
  },
} as const;

// ==========================================
// 🧬 TYPE DEFINITIONS
// ==========================================

export interface TestUser {
  id: string;
  email: string;
  password: string;
  role: "ADMIN" | "FARMER" | "CUSTOMER";
  name: string;
}

export interface TestFarm {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  status: string;
}

export interface TestProduct {
  id: string;
  name: string;
  price: number;
  farmId: string;
  inventory: number;
}

export interface TestOrder {
  id: string;
  customerId: string;
  farmId: string;
  total: number;
  status: string;
  items: TestOrderItem[];
}

export interface TestOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface NetworkCondition {
  downloadThroughput: number;
  uploadThroughput: number;
  latency: number;
}

export interface TestScenario {
  name: string;
  description: string;
  steps: TestStep[];
  expectedOutcome: string;
}

export interface TestStep {
  action: string;
  target?: string;
  value?: string;
  validate?: () => Promise<void>;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
}

// ==========================================
// 🎭 SESSION & AUTHENTICATION MANAGEMENT
// ==========================================

export class SessionManager {
  private sessions: Map<string, string> = new Map();

  constructor(private context: BrowserContext) {}

  /**
   * Create authenticated session for user
   */
  async createSession(page: Page, user: TestUser): Promise<void> {
    // Navigate to login page
    await page.goto("/auth/signin");

    // Fill credentials
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);

    // Submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      page.click('button[type="submit"]'),
    ]);

    // Store session cookies
    const cookies = await this.context.cookies();
    this.sessions.set(user.id, JSON.stringify(cookies));

    // Verify session
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  /**
   * Restore session from cookies
   */
  async restoreSession(userId: string): Promise<void> {
    const cookiesJson = this.sessions.get(userId);
    if (!cookiesJson) {
      throw new Error(`No session found for user ${userId}`);
    }

    const cookies = JSON.parse(cookiesJson);
    await this.context.addCookies(cookies);
  }

  /**
   * Switch between user sessions
   */
  async switchSession(page: Page, userId: string): Promise<void> {
    await this.context.clearCookies();
    await this.restoreSession(userId);
    await page.reload({ waitUntil: "networkidle" });
  }

  /**
   * Clear all sessions
   */
  async clearAllSessions(): Promise<void> {
    await this.context.clearCookies();
    this.sessions.clear();
  }
}

// ==========================================
// 🌊 MULTI-USER ORCHESTRATION
// ==========================================

export class MultiUserOrchestrator {
  private pages: Map<string, Page> = new Map();

  constructor(private context: BrowserContext) {}

  /**
   * Create page for each user with their session
   */
  async setupUsers(users: TestUser[]): Promise<void> {
    for (const user of users) {
      const page = await this.context.newPage();

      // Authenticate user
      await this.authenticateUser(page, user);

      this.pages.set(user.id, page);
    }
  }

  /**
   * Authenticate user on their page
   */
  private async authenticateUser(page: Page, user: TestUser): Promise<void> {
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      page.click('button[type="submit"]'),
    ]);
  }

  /**
   * Execute action for specific user
   */
  async executeAsUser(userId: string, action: (page: Page) => Promise<void>): Promise<void> {
    const page = this.pages.get(userId);
    if (!page) {
      throw new Error(`Page not found for user ${userId}`);
    }
    await action(page);
  }

  /**
   * Execute actions in parallel for multiple users
   */
  async executeParallel(
    actions: Array<{ userId: string; action: (page: Page) => Promise<void> }>
  ): Promise<void> {
    await Promise.all(
      actions.map(({ userId, action }) => this.executeAsUser(userId, action))
    );
  }

  /**
   * Execute actions sequentially
   */
  async executeSequential(
    actions: Array<{ userId: string; action: (page: Page) => Promise<void> }>
  ): Promise<void> {
    for (const { userId, action } of actions) {
      await this.executeAsUser(userId, action);
    }
  }

  /**
   * Get page for specific user
   */
  getPage(userId: string): Page {
    const page = this.pages.get(userId);
    if (!page) {
      throw new Error(`Page not found for user ${userId}`);
    }
    return page;
  }

  /**
   * Cleanup all user pages
   */
  async cleanup(): Promise<void> {
    for (const page of this.pages.values()) {
      await page.close();
    }
    this.pages.clear();
  }
}

// ==========================================
// 🔄 STATE MANAGEMENT & SYNCHRONIZATION
// ==========================================

export class StateManager {
  private state: Map<string, any> = new Map();

  /**
   * Set state value
   */
  setState(key: string, value: any): void {
    this.state.set(key, value);
  }

  /**
   * Get state value
   */
  getState<T = any>(key: string): T | undefined {
    return this.state.get(key);
  }

  /**
   * Wait for state condition
   */
  async waitForState(
    key: string,
    condition: (value: any) => boolean,
    timeout = E2E_CONFIG.timeouts.medium
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const value = this.state.get(key);
      if (condition(value)) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Timeout waiting for state ${key} to meet condition`);
  }

  /**
   * Clear all state
   */
  clearState(): void {
    this.state.clear();
  }

  /**
   * Snapshot current state
   */
  snapshot(): Record<string, any> {
    return Object.fromEntries(this.state);
  }

  /**
   * Restore state from snapshot
   */
  restore(snapshot: Record<string, any>): void {
    this.state = new Map(Object.entries(snapshot));
  }
}

// ==========================================
// 🌐 NETWORK UTILITIES
// ==========================================

export class NetworkController {
  private interceptedRequests: Map<string, any[]> = new Map();

  constructor(private page: Page) {}

  /**
   * Intercept API requests
   */
  async interceptRequests(pattern: string | RegExp): Promise<void> {
    await this.page.route(pattern, async (route) => {
      const request = route.request();
      const key = `${request.method()}_${request.url()}`;

      if (!this.interceptedRequests.has(key)) {
        this.interceptedRequests.set(key, []);
      }

      this.interceptedRequests.get(key)!.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: Date.now(),
      });

      await route.continue();
    });
  }

  /**
   * Mock API response
   */
  async mockResponse(
    pattern: string | RegExp,
    response: {
      status?: number;
      body?: any;
      headers?: Record<string, string>;
      delay?: number;
    }
  ): Promise<void> {
    await this.page.route(pattern, async (route) => {
      if (response.delay) {
        await new Promise((resolve) => setTimeout(resolve, response.delay));
      }

      await route.fulfill({
        status: response.status || 200,
        body: JSON.stringify(response.body),
        headers: {
          "Content-Type": "application/json",
          ...response.headers,
        },
      });
    });
  }

  /**
   * Simulate network conditions
   */
  async setNetworkConditions(condition: NetworkCondition): Promise<void> {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: condition.downloadThroughput,
      uploadThroughput: condition.uploadThroughput,
      latency: condition.latency,
    });
  }

  /**
   * Simulate offline mode
   */
  async goOffline(): Promise<void> {
    await this.page.context().setOffline(true);
  }

  /**
   * Restore online mode
   */
  async goOnline(): Promise<void> {
    await this.page.context().setOffline(false);
  }

  /**
   * Get intercepted requests
   */
  getInterceptedRequests(method?: string, url?: string): any[] {
    if (!method && !url) {
      return Array.from(this.interceptedRequests.values()).flat();
    }

    return Array.from(this.interceptedRequests.entries())
      .filter(([key]) => {
        const [reqMethod, reqUrl] = key.split("_");
        return (!method || reqMethod === method) && (!url || reqUrl.includes(url));
      })
      .flatMap(([_, requests]) => requests);
  }

  /**
   * Wait for specific API call
   */
  async waitForRequest(
    method: string,
    urlPattern: string,
    timeout = E2E_CONFIG.timeouts.apiCall
  ): Promise<any> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const requests = this.getInterceptedRequests(method, urlPattern);
      if (requests.length > 0) {
        return requests[requests.length - 1];
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Timeout waiting for ${method} ${urlPattern}`);
  }

  /**
   * Clear intercepted requests
   */
  clearInterceptedRequests(): void {
    this.interceptedRequests.clear();
  }
}

// ==========================================
// 📊 PERFORMANCE MONITORING
// ==========================================

export class PerformanceMonitor {
  constructor(private page: Page) {}

  /**
   * Collect Core Web Vitals
   */
  async collectWebVitals(): Promise<PerformanceMetrics> {
    const metrics = await this.page.evaluate(() => {
      return new Promise<PerformanceMetrics>((resolve) => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        const paint = performance.getEntriesByType("paint");
        const fcp = paint.find((entry) => entry.name === "first-contentful-paint");

        resolve({
          pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          timeToInteractive: navigation.domInteractive - navigation.fetchStart,
          firstContentfulPaint: fcp?.startTime || 0,
          largestContentfulPaint: 0, // Requires LCP observer
          cumulativeLayoutShift: 0, // Requires CLS observer
          totalBlockingTime: 0, // Requires TBT calculation
        });
      });
    });

    return metrics;
  }

  /**
   * Measure page load performance
   */
  async measurePageLoad(url: string): Promise<number> {
    const startTime = Date.now();
    await this.page.goto(url, { waitUntil: "networkidle" });
    const loadTime = Date.now() - startTime;

    return loadTime;
  }

  /**
   * Measure API response time
   */
  async measureApiCall(
    method: string,
    url: string,
    body?: any
  ): Promise<number> {
    const startTime = Date.now();

    await this.page.evaluate(
      async ({ method, url, body }) => {
        await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });
      },
      { method, url, body }
    );

    return Date.now() - startTime;
  }

  /**
   * Assert performance threshold
   */
  async assertPerformance(
    metric: keyof typeof E2E_CONFIG.thresholds,
    actualValue: number
  ): Promise<void> {
    const threshold = E2E_CONFIG.thresholds[metric];
    expect(actualValue).toBeLessThanOrEqual(threshold);
  }

  /**
   * Start performance trace
   */
  async startTrace(name: string): Promise<void> {
    await this.page.evaluate((name) => {
      performance.mark(`${name}-start`);
    }, name);
  }

  /**
   * End performance trace and get duration
   */
  async endTrace(name: string): Promise<number> {
    const duration = await this.page.evaluate((name) => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name)[0];
      return measure.duration;
    }, name);

    return duration;
  }
}

// ==========================================
// 🎬 SCENARIO EXECUTOR
// ==========================================

export class ScenarioExecutor {
  constructor(
    private page: Page,
    private stateManager: StateManager
  ) {}

  /**
   * Execute test scenario
   */
  async execute(scenario: TestScenario): Promise<void> {
    console.log(`📋 Executing scenario: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);

    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      console.log(`  ▶ Step ${i + 1}/${scenario.steps.length}: ${step.action}`);

      await this.executeStep(step);

      if (step.validate) {
        await step.validate();
      }
    }

    console.log(`✅ Scenario completed: ${scenario.expectedOutcome}`);
  }

  /**
   * Execute individual step
   */
  private async executeStep(step: TestStep): Promise<void> {
    const { action, target, value } = step;

    switch (action) {
      case "navigate":
        if (target) {
          await this.page.goto(target);
        }
        break;

      case "click":
        if (target) {
          await this.page.click(target);
        }
        break;

      case "fill":
        if (target && value) {
          await this.page.fill(target, value);
        }
        break;

      case "wait":
        if (value) {
          await this.page.waitForTimeout(parseInt(value));
        }
        break;

      case "waitForElement":
        if (target) {
          await this.page.waitForSelector(target, { state: "visible" });
        }
        break;

      case "screenshot":
        if (value) {
          await this.page.screenshot({ path: value });
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Execute with retry logic
   */
  async executeWithRetry(
    scenario: TestScenario,
    maxRetries = E2E_CONFIG.retries.default
  ): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.execute(scenario);
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);

        if (attempt < maxRetries) {
          await this.page.waitForTimeout(1000 * attempt);
        }
      }
    }

    throw new Error(
      `Scenario failed after ${maxRetries} attempts: ${lastError?.message}`
    );
  }
}

// ==========================================
// 🧪 DATA FACTORY
// ==========================================

export class TestDataFactory {
  /**
   * Generate unique email
   */
  static generateEmail(prefix = "test"): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
  }

  /**
   * Generate unique username
   */
  static generateUsername(prefix = "user"): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate farm data
   */
  static generateFarmData(overrides?: Partial<TestFarm>): Partial<TestFarm> {
    return {
      name: `Test Farm ${Date.now()}`,
      slug: `test-farm-${Date.now()}`,
      ...overrides,
    };
  }

  /**
   * Generate product data
   */
  static generateProductData(overrides?: Partial<TestProduct>): Partial<TestProduct> {
    return {
      name: `Test Product ${Date.now()}`,
      price: 9.99,
      inventory: 100,
      ...overrides,
    };
  }

  /**
   * Generate order data
   */
  static generateOrderData(overrides?: Partial<TestOrder>): Partial<TestOrder> {
    return {
      total: 0,
      status: "PENDING",
      items: [],
      ...overrides,
    };
  }

  /**
   * Create test user
   */
  static async createTestUser(role: "ADMIN" | "FARMER" | "CUSTOMER"): Promise<TestUser> {
    const email = this.generateEmail(role.toLowerCase());
    const password = "TestPassword123!";

    // Create user in database
    const user = await database.user.create({
      data: {
        email,
        name: `Test ${role}`,
        role,
        emailVerified: new Date(),
      },
    });

    return {
      id: user.id,
      email,
      password,
      role,
      name: user.name || "",
    };
  }

  /**
   * Create test farm
   */
  static async createTestFarm(ownerId: string, data?: Partial<TestFarm>): Promise<TestFarm> {
    const farmData = this.generateFarmData(data);

    const farm = await database.farm.create({
      data: {
        name: farmData.name!,
        slug: farmData.slug!,
        ownerId,
        status: "ACTIVE",
        description: "Test farm description",
        location: {
          address: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
          coordinates: { lat: 0, lng: 0 },
        },
      },
    });

    return {
      id: farm.id,
      name: farm.name,
      slug: farm.slug,
      ownerId: farm.ownerId,
      status: farm.status,
    };
  }

  /**
   * Create test product
   */
  static async createTestProduct(
    farmId: string,
    data?: Partial<TestProduct>
  ): Promise<TestProduct> {
    const productData = this.generateProductData(data);

    const product = await database.product.create({
      data: {
        name: productData.name!,
        price: productData.price!,
        inventory: productData.inventory!,
        farmId,
        description: "Test product description",
        category: "VEGETABLES",
        unit: "lb",
        status: "ACTIVE",
      },
    });

    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      farmId: product.farmId,
      inventory: product.inventory,
    };
  }

  /**
   * Cleanup test data
   */
  static async cleanup(ids: {
    userIds?: string[];
    farmIds?: string[];
    productIds?: string[];
    orderIds?: string[];
  }): Promise<void> {
    if (ids.orderIds?.length) {
      await database.order.deleteMany({
        where: { id: { in: ids.orderIds } },
      });
    }

    if (ids.productIds?.length) {
      await database.product.deleteMany({
        where: { id: { in: ids.productIds } },
      });
    }

    if (ids.farmIds?.length) {
      await database.farm.deleteMany({
        where: { id: { in: ids.farmIds } },
      });
    }

    if (ids.userIds?.length) {
      await database.user.deleteMany({
        where: { id: { in: ids.userIds } },
      });
    }
  }
}

// ==========================================
// 🎯 PAGE OBJECT BASE
// ==========================================

export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected page: Page) {}

  /**
   * Navigate to page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForLoad();
  }

  /**
   * Wait for page to load
   */
  abstract waitForLoad(): Promise<void>;

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take screenshot
   */
  async screenshot(path: string): Promise<void> {
    await this.page.screenshot({ path, fullPage: true });
  }

  /**
   * Wait for element
   */
  async waitForElement(selector: string, timeout?: number): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: "visible", timeout });
    return locator;
  }

  /**
   * Click element with retry
   */
  async clickWithRetry(
    selector: string,
    maxRetries = 3
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.page.click(selector, { timeout: 5000 });
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }
}

// ==========================================
// 🔧 UTILITY FUNCTIONS
// ==========================================

/**
 * Wait with timeout
 */
export async function waitFor(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await waitFor(baseDelay * Math.pow(2, i));
      }
    }
  }

  throw lastError!;
}

/**
 * Poll until condition is met
 */
export async function pollUntil(
  condition: () => Promise<boolean>,
  timeout = 10000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await waitFor(interval);
  }

  throw new Error("Timeout waiting for condition");
}

/**
 * Generate random string
 */
export function randomString(length = 10): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Debug helper - log with timestamp
 */
export function debugLog(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔍 ${message}`, data || "");
}

// ==========================================
// 📤 EXPORTS
// ==========================================

export const E2EUtils = {
  SessionManager,
  MultiUserOrchestrator,
  StateManager,
  NetworkController,
  PerformanceMonitor,
  ScenarioExecutor,
  TestDataFactory,
  BasePage,
  waitFor,
  retry,
  pollUntil,
  randomString,
  formatCurrency,
  debugLog,
};

export default E2EUtils;
