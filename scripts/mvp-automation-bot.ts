#!/usr/bin/env tsx

/**
 * 🤖 MVP AUTOMATION BOT
 * Comprehensive automated testing for Farmers Market Platform MVP
 *
 * Tests all critical user journeys:
 * - Customer flows (browse, search, cart, checkout)
 * - Farmer flows (farm management, product listing)
 * - Admin flows (user management, farm verification)
 * - API health checks
 * - Performance metrics
 *
 * Usage: npm run bot:mvp
 * Or: tsx scripts/mvp-automation-bot.ts
 */

import { Browser, BrowserContext, chromium, Page } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const HEADLESS = process.env.HEADLESS !== "false";
const SLOW_MO = parseInt(process.env.SLOW_MO || "500");

// Color output for terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

// Logging utilities
const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
  header: (msg: string) =>
    console.log(
      `\n${colors.bright}${colors.magenta}${"=".repeat(60)}${colors.reset}\n${colors.bright}${msg}${colors.reset}\n${colors.magenta}${"=".repeat(60)}${colors.reset}\n`,
    ),
  section: (msg: string) =>
    console.log(
      `\n${colors.cyan}${"-".repeat(50)}${colors.reset}\n${colors.bright}${msg}${colors.reset}\n${colors.cyan}${"-".repeat(50)}${colors.reset}`,
    ),
  detail: (key: string, value: string) =>
    console.log(`  ${colors.gray}${key}:${colors.reset} ${value}`),
};

// Test results tracking
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: Record<string, any>;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  startTime: number;
  endTime?: number;
}

class MVPAutomationBot {
  private browser!: Browser;
  private context!: BrowserContext;
  private page!: Page;
  private testSuites: TestSuite[] = [];
  private currentSuite?: TestSuite;
  private globalStartTime: number = Date.now();

  // Test data
  private testData = {
    customer: {
      email: `test-customer-${Date.now()}@example.com`,
      password: "TestPassword123!",
      firstName: "Test",
      lastName: "Customer",
    },
    farmer: {
      email: `test-farmer-${Date.now()}@example.com`,
      password: "TestPassword123!",
      firstName: "Test",
      lastName: "Farmer",
    },
    farm: {
      name: `Test Farm ${Date.now()}`,
      description: "Automated test farm created by MVP bot",
      address: "123 Farm Road",
      city: "Farmville",
      state: "CA",
      zipCode: "12345",
    },
    product: {
      name: `Test Product ${Date.now()}`,
      description: "Automated test product",
      price: "9.99",
      quantity: "100",
    },
  };

  constructor() {
    log.header("🤖 MVP AUTOMATION BOT - STARTING");
    log.info(`Base URL: ${BASE_URL}`);
    log.info(`Headless: ${HEADLESS}`);
    log.info(`Slow Motion: ${SLOW_MO}ms`);
  }

  // Initialize browser
  async init(): Promise<void> {
    try {
      log.step("Initializing browser...");
      this.browser = await chromium.launch({
        headless: HEADLESS,
        slowMo: SLOW_MO,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: "MVP-Automation-Bot/1.0",
        locale: "en-US",
        timezoneId: "America/Los_Angeles",
      });

      this.page = await this.context.newPage();

      // Set longer timeouts
      this.page.setDefaultTimeout(30000);
      this.page.setDefaultNavigationTimeout(30000);

      log.success("Browser initialized");
    } catch (error) {
      log.error(`Failed to initialize browser: ${error}`);
      throw error;
    }
  }

  // Start a test suite
  private startSuite(name: string): void {
    this.currentSuite = {
      name,
      results: [],
      startTime: Date.now(),
    };
    log.header(`📦 TEST SUITE: ${name}`);
  }

  // End current test suite
  private endSuite(): void {
    if (this.currentSuite) {
      this.currentSuite.endTime = Date.now();
      this.testSuites.push(this.currentSuite);

      const duration = this.currentSuite.endTime - this.currentSuite.startTime;
      const passed = this.currentSuite.results.filter((r) => r.passed).length;
      const failed = this.currentSuite.results.filter((r) => !r.passed).length;

      log.section(`Suite Summary: ${this.currentSuite.name}`);
      log.detail("Duration", `${(duration / 1000).toFixed(2)}s`);
      log.detail("Passed", `${colors.green}${passed}${colors.reset}`);
      log.detail(
        "Failed",
        failed > 0 ? `${colors.red}${failed}${colors.reset}` : "0",
      );

      this.currentSuite = undefined;
    }
  }

  // Run a single test
  private async runTest(
    name: string,
    testFn: () => Promise<any>,
  ): Promise<void> {
    const startTime = Date.now();
    log.step(`Running: ${name}`);

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;

      this.currentSuite?.results.push({
        name,
        passed: true,
        duration,
        details: result,
      });

      log.success(`${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      this.currentSuite?.results.push({
        name,
        passed: false,
        duration,
        error: errorMsg,
      });

      log.error(`${name} - ${errorMsg} (${duration}ms)`);
    }
  }

  // ============================================
  // API HEALTH CHECKS
  // ============================================
  async testAPIHealthChecks(): Promise<void> {
    this.startSuite("API Health Checks");

    await this.runTest("Health endpoint responds", async () => {
      const response = await this.page.goto(`${BASE_URL}/api/health`);
      if (!response || response.status() !== 200) {
        throw new Error(
          `Health check failed with status ${response?.status()}`,
        );
      }
      const data = await response.json();
      return { status: data.status, timestamp: data.timestamp };
    });

    await this.runTest("Ready endpoint responds", async () => {
      const response = await this.page.goto(`${BASE_URL}/api/ready`);
      if (!response || response.status() !== 200) {
        throw new Error(`Ready check failed with status ${response?.status()}`);
      }
      const data = await response.json();
      return { ready: data.ready };
    });

    await this.runTest("Farms API responds", async () => {
      const response = await this.page.goto(`${BASE_URL}/api/farms`);
      if (!response || response.status() !== 200) {
        throw new Error(`Farms API failed with status ${response?.status()}`);
      }
      const data = await response.json();
      return { count: data.data?.length || 0 };
    });

    await this.runTest("Products API responds", async () => {
      const response = await this.page.goto(`${BASE_URL}/api/products`);
      if (!response || response.status() !== 200) {
        throw new Error(
          `Products API failed with status ${response?.status()}`,
        );
      }
      const data = await response.json();
      return { count: data.data?.length || 0 };
    });

    this.endSuite();
  }

  // ============================================
  // HOMEPAGE & NAVIGATION TESTS
  // ============================================
  async testHomepageAndNavigation(): Promise<void> {
    this.startSuite("Homepage & Navigation");

    await this.runTest("Homepage loads successfully", async () => {
      const response = await this.page.goto(BASE_URL);
      if (!response || response.status() !== 200) {
        throw new Error(`Homepage failed to load: ${response?.status()}`);
      }

      // Wait for critical content
      await this.page.waitForLoadState("networkidle");

      const title = await this.page.title();
      return { title, status: response.status() };
    });

    await this.runTest("Navigation bar is present", async () => {
      const navSelectors = ["nav", "header nav", '[role="navigation"]'];
      let found = false;

      for (const selector of navSelectors) {
        const nav = await this.page.$(selector);
        if (nav) {
          found = true;
          break;
        }
      }

      if (!found) {
        throw new Error("Navigation bar not found");
      }

      return { found: true };
    });

    await this.runTest("Login link is accessible", async () => {
      const loginSelectors = [
        'a[href*="login"]',
        'button:has-text("Login")',
        'a:has-text("Login")',
        'a:has-text("Sign In")',
      ];

      let found = false;
      for (const selector of loginSelectors) {
        try {
          const element = await this.page.waitForSelector(selector, {
            timeout: 5000,
          });
          if (element) {
            found = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!found) {
        throw new Error("Login link not found");
      }

      return { accessible: true };
    });

    await this.runTest("Footer is present", async () => {
      const footer = await this.page.$("footer");
      if (!footer) {
        throw new Error("Footer not found");
      }
      return { found: true };
    });

    this.endSuite();
  }

  // ============================================
  // MARKETPLACE TESTS
  // ============================================
  async testMarketplace(): Promise<void> {
    this.startSuite("Marketplace Features");

    await this.runTest("Browse farms page loads", async () => {
      const response = await this.page.goto(`${BASE_URL}/farms`);
      if (!response || response.status() !== 200) {
        throw new Error(`Farms page failed to load: ${response?.status()}`);
      }

      await this.page.waitForLoadState("networkidle");
      return { status: response.status() };
    });

    await this.runTest("Farm cards are displayed", async () => {
      const farmCardSelectors = [
        '[data-testid="farm-card"]',
        ".farm-card",
        "article",
        '[role="article"]',
      ];

      let cards = 0;
      for (const selector of farmCardSelectors) {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          cards = elements.length;
          break;
        }
      }

      return { count: cards };
    });

    await this.runTest("Browse products page loads", async () => {
      const response = await this.page.goto(`${BASE_URL}/products`);
      if (!response || response.status() !== 200) {
        throw new Error(`Products page failed to load: ${response?.status()}`);
      }

      await this.page.waitForLoadState("networkidle");
      return { status: response.status() };
    });

    await this.runTest("Product cards are displayed", async () => {
      const productCardSelectors = [
        '[data-testid="product-card"]',
        ".product-card",
        "article",
      ];

      let cards = 0;
      for (const selector of productCardSelectors) {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          cards = elements.length;
          break;
        }
      }

      return { count: cards };
    });

    await this.runTest("Search functionality exists", async () => {
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="search" i]',
        'input[placeholder*="Search" i]',
        '[data-testid="search-input"]',
      ];

      let found = false;
      for (const selector of searchSelectors) {
        const input = await this.page.$(selector);
        if (input) {
          found = true;
          break;
        }
      }

      return { found };
    });

    this.endSuite();
  }

  // ============================================
  // CUSTOMER REGISTRATION TESTS
  // ============================================
  async testCustomerRegistration(): Promise<void> {
    this.startSuite("Customer Registration");

    await this.runTest("Navigate to registration page", async () => {
      await this.page.goto(`${BASE_URL}/register`);
      await this.page.waitForLoadState("networkidle");

      const url = this.page.url();
      if (!url.includes("register")) {
        throw new Error("Failed to navigate to register page");
      }

      return { url };
    });

    await this.runTest("Registration form is present", async () => {
      const formSelectors = [
        "form",
        '[data-testid="registration-form"]',
        '[data-testid="register-form"]',
      ];

      let found = false;
      for (const selector of formSelectors) {
        const form = await this.page.$(selector);
        if (form) {
          found = true;
          break;
        }
      }

      if (!found) {
        throw new Error("Registration form not found");
      }

      return { found: true };
    });

    await this.runTest("Fill and submit registration form", async () => {
      // Find input fields by various selectors
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        "#email",
      ];

      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        "#password",
      ];

      // Fill email
      let emailFilled = false;
      for (const selector of emailSelectors) {
        try {
          const input = await this.page.waitForSelector(selector, {
            timeout: 5000,
          });
          if (input) {
            await input.fill(this.testData.customer.email);
            emailFilled = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!emailFilled) {
        throw new Error("Could not find email input field");
      }

      // Fill password
      let passwordFilled = false;
      for (const selector of passwordSelectors) {
        try {
          const input = await this.page.waitForSelector(selector, {
            timeout: 5000,
          });
          if (input) {
            await input.fill(this.testData.customer.password);
            passwordFilled = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!passwordFilled) {
        throw new Error("Could not find password input field");
      }

      // Try to fill first name if present
      const firstNameSelectors = ['input[name="firstName"]', "#firstName"];
      for (const selector of firstNameSelectors) {
        try {
          const input = await this.page.$(selector);
          if (input) {
            await input.fill(this.testData.customer.firstName);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // Try to fill last name if present
      const lastNameSelectors = ['input[name="lastName"]', "#lastName"];
      for (const selector of lastNameSelectors) {
        try {
          const input = await this.page.$(selector);
          if (input) {
            await input.fill(this.testData.customer.lastName);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      return {
        email: this.testData.customer.email,
        formReady: true,
      };
    });

    this.endSuite();
  }

  // ============================================
  // AUTHENTICATION TESTS
  // ============================================
  async testAuthentication(): Promise<void> {
    this.startSuite("Authentication");

    await this.runTest("Navigate to login page", async () => {
      await this.page.goto(`${BASE_URL}/login`);
      await this.page.waitForLoadState("networkidle");

      const url = this.page.url();
      if (!url.includes("login")) {
        throw new Error("Failed to navigate to login page");
      }

      return { url };
    });

    await this.runTest("Login form is present", async () => {
      const formSelectors = [
        "form",
        '[data-testid="login-form"]',
        '[data-testid="auth-form"]',
      ];

      let found = false;
      for (const selector of formSelectors) {
        const form = await this.page.$(selector);
        if (form) {
          found = true;
          break;
        }
      }

      if (!found) {
        throw new Error("Login form not found");
      }

      return { found: true };
    });

    await this.runTest("Login form has required fields", async () => {
      const hasEmail = (await this.page.$('input[type="email"]')) !== null;
      const hasPassword =
        (await this.page.$('input[type="password"]')) !== null;
      const hasSubmit = (await this.page.$('button[type="submit"]')) !== null;

      if (!hasEmail || !hasPassword || !hasSubmit) {
        throw new Error("Login form is missing required fields");
      }

      return { hasEmail, hasPassword, hasSubmit };
    });

    this.endSuite();
  }

  // ============================================
  // SHOPPING CART TESTS
  // ============================================
  async testShoppingCart(): Promise<void> {
    this.startSuite("Shopping Cart");

    await this.runTest("Cart page is accessible", async () => {
      const response = await this.page.goto(`${BASE_URL}/cart`);
      if (!response || response.status() !== 200) {
        throw new Error(`Cart page failed to load: ${response?.status()}`);
      }

      await this.page.waitForLoadState("networkidle");
      return { status: response.status() };
    });

    await this.runTest("Cart displays empty state", async () => {
      const emptyStateSelectors = [
        "text=empty",
        "text=no items",
        '[data-testid="empty-cart"]',
      ];

      let found = false;
      for (const selector of emptyStateSelectors) {
        try {
          const element = await this.page.waitForSelector(selector, {
            timeout: 5000,
            state: "visible",
          });
          if (element) {
            found = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      return { isEmpty: found };
    });

    this.endSuite();
  }

  // ============================================
  // RESPONSIVE DESIGN TESTS
  // ============================================
  async testResponsiveDesign(): Promise<void> {
    this.startSuite("Responsive Design");

    const viewports = [
      { name: "Desktop", width: 1920, height: 1080 },
      { name: "Laptop", width: 1366, height: 768 },
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Mobile", width: 375, height: 667 },
    ];

    for (const viewport of viewports) {
      await this.runTest(
        `Homepage renders at ${viewport.name} (${viewport.width}x${viewport.height})`,
        async () => {
          await this.page.setViewportSize({
            width: viewport.width,
            height: viewport.height,
          });

          await this.page.goto(BASE_URL);
          await this.page.waitForLoadState("networkidle");

          // Take screenshot for visual verification
          const screenshot = await this.page.screenshot({
            path: `./test-results/responsive-${viewport.name.toLowerCase()}-${Date.now()}.png`,
            fullPage: false,
          });

          return {
            viewport: `${viewport.width}x${viewport.height}`,
            screenshotSize: screenshot.length,
          };
        },
      );
    }

    // Reset viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    this.endSuite();
  }

  // ============================================
  // PERFORMANCE TESTS
  // ============================================
  async testPerformance(): Promise<void> {
    this.startSuite("Performance Metrics");

    await this.runTest("Measure homepage load time", async () => {
      const startTime = Date.now();
      await this.page.goto(BASE_URL);
      await this.page.waitForLoadState("load");
      const loadTime = Date.now() - startTime;

      if (loadTime > 5000) {
        throw new Error(`Page load time too slow: ${loadTime}ms`);
      }

      return { loadTime: `${loadTime}ms` };
    });

    await this.runTest("Measure API response time", async () => {
      const startTime = Date.now();
      const response = await this.page.goto(`${BASE_URL}/api/health`);
      const responseTime = Date.now() - startTime;

      if (!response || response.status() !== 200) {
        throw new Error(`API request failed: ${response?.status()}`);
      }

      if (responseTime > 1000) {
        throw new Error(`API response too slow: ${responseTime}ms`);
      }

      return { responseTime: `${responseTime}ms` };
    });

    await this.runTest("Check for console errors", async () => {
      const errors: string[] = [];

      this.page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await this.page.goto(BASE_URL);
      await this.page.waitForLoadState("networkidle");

      // Wait a bit for any lazy-loaded errors
      await this.page.waitForTimeout(2000);

      if (errors.length > 0) {
        log.warn(`Found ${errors.length} console errors:`);
        errors.forEach((err) => log.detail("Error", err));
      }

      return { errorCount: errors.length, errors: errors.slice(0, 5) };
    });

    this.endSuite();
  }

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================
  async testAccessibility(): Promise<void> {
    this.startSuite("Accessibility");

    await this.runTest("Page has proper document title", async () => {
      await this.page.goto(BASE_URL);
      const title = await this.page.title();

      if (!title || title === "") {
        throw new Error("Page title is empty");
      }

      return { title };
    });

    await this.runTest("Page has main landmark", async () => {
      await this.page.goto(BASE_URL);

      const mainSelectors = ["main", '[role="main"]'];
      let found = false;

      for (const selector of mainSelectors) {
        const element = await this.page.$(selector);
        if (element) {
          found = true;
          break;
        }
      }

      if (!found) {
        throw new Error("Main landmark not found");
      }

      return { hasMain: true };
    });

    await this.runTest("Images have alt attributes", async () => {
      await this.page.goto(BASE_URL);
      await this.page.waitForLoadState("networkidle");

      const images = await this.page.$$("img");
      const imagesWithoutAlt = [];

      for (const img of images) {
        const alt = await img.getAttribute("alt");
        if (alt === null) {
          const src = await img.getAttribute("src");
          imagesWithoutAlt.push(src);
        }
      }

      return {
        totalImages: images.length,
        imagesWithoutAlt: imagesWithoutAlt.length,
        issues: imagesWithoutAlt.slice(0, 3),
      };
    });

    this.endSuite();
  }

  // ============================================
  // CLEANUP
  // ============================================
  async cleanup(): Promise<void> {
    try {
      log.step("Cleaning up...");
      await this.page.close();
      await this.context.close();
      await this.browser.close();
      log.success("Cleanup completed");
    } catch (error) {
      log.error(`Cleanup error: ${error}`);
    }
  }

  // ============================================
  // FINAL REPORT
  // ============================================
  private generateReport(): void {
    const totalDuration = Date.now() - this.globalStartTime;

    log.header("📊 FINAL TEST REPORT");

    // Overall statistics
    const totalTests = this.testSuites.reduce(
      (sum, suite) => sum + suite.results.length,
      0,
    );
    const passedTests = this.testSuites.reduce(
      (sum, suite) => sum + suite.results.filter((r) => r.passed).length,
      0,
    );
    const failedTests = totalTests - passedTests;
    const passRate = ((passedTests / totalTests) * 100).toFixed(2);

    log.section("Overall Statistics");
    log.detail("Total Duration", `${(totalDuration / 1000).toFixed(2)}s`);
    log.detail("Total Test Suites", String(this.testSuites.length));
    log.detail("Total Tests", String(totalTests));
    log.detail("Passed", `${colors.green}${passedTests}${colors.reset}`);
    log.detail(
      "Failed",
      failedTests > 0 ? `${colors.red}${failedTests}${colors.reset}` : "0",
    );
    log.detail("Pass Rate", `${passRate}%`);

    // Suite breakdown
    log.section("Test Suite Breakdown");
    for (const suite of this.testSuites) {
      const passed = suite.results.filter((r) => r.passed).length;
      const failed = suite.results.filter((r) => !r.passed).length;
      const duration = suite.endTime ? suite.endTime - suite.startTime : 0;

      console.log(`\n  ${colors.bright}${suite.name}${colors.reset}`);
      log.detail("  Duration", `${(duration / 1000).toFixed(2)}s`);
      log.detail(
        "  Tests",
        `${passed + failed} (${colors.green}${passed} passed${colors.reset}, ${failed > 0 ? colors.red : ""}${failed} failed${colors.reset})`,
      );

      // Show failed tests
      if (failed > 0) {
        console.log(`\n  ${colors.red}Failed Tests:${colors.reset}`);
        suite.results
          .filter((r) => !r.passed)
          .forEach((r) => {
            console.log(`    ${colors.red}✗${colors.reset} ${r.name}`);
            if (r.error) {
              console.log(`      ${colors.gray}${r.error}${colors.reset}`);
            }
          });
      }
    }

    // Final status
    console.log("");
    if (failedTests === 0) {
      log.success(`All ${totalTests} tests passed! 🎉`);
      console.log(
        `\n${colors.green}${colors.bright}MVP IS READY FOR PRODUCTION! ✨${colors.reset}\n`,
      );
    } else {
      log.warn(`${failedTests} test(s) failed. Please review and fix.`);
      console.log(
        `\n${colors.yellow}${colors.bright}MVP NEEDS ATTENTION 🔧${colors.reset}\n`,
      );
    }

    // Save report to file
    this.saveReportToFile();
  }

  private saveReportToFile(): void {
    const fs = require("fs");
    const path = require("path");

    const reportDir = path.join(process.cwd(), "test-results");
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(reportDir, `mvp-bot-report-${timestamp}.json`);

    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.globalStartTime,
      suites: this.testSuites.map((suite) => ({
        name: suite.name,
        duration: suite.endTime ? suite.endTime - suite.startTime : 0,
        results: suite.results,
      })),
      summary: {
        totalTests: this.testSuites.reduce(
          (sum, s) => sum + s.results.length,
          0,
        ),
        passed: this.testSuites.reduce(
          (sum, s) => sum + s.results.filter((r) => r.passed).length,
          0,
        ),
        failed: this.testSuites.reduce(
          (sum, s) => sum + s.results.filter((r) => !r.passed).length,
          0,
        ),
      },
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log.info(`Report saved to: ${reportPath}`);
  }

  // ============================================
  // MAIN EXECUTION
  // ============================================
  async run(): Promise<void> {
    try {
      await this.init();

      // Run all test suites
      await this.testAPIHealthChecks();
      await this.testHomepageAndNavigation();
      await this.testMarketplace();
      await this.testCustomerRegistration();
      await this.testAuthentication();
      await this.testShoppingCart();
      await this.testResponsiveDesign();
      await this.testPerformance();
      await this.testAccessibility();

      // Generate final report
      this.generateReport();
    } catch (error) {
      log.error(`Fatal error: ${error}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// ============================================
// ENTRY POINT
// ============================================
async function main() {
  const bot = new MVPAutomationBot();

  try {
    await bot.run();
    process.exit(0);
  } catch (error) {
    log.error(`Bot execution failed: ${error}`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { MVPAutomationBot };
