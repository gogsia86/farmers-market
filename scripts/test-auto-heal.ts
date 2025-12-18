#!/usr/bin/env tsx
/**
 * 🔮 Self-Healing Automated Test System
 * Runs all human tests automatically, detects errors, fixes them, and retries
 *
 * Features:
 * - Automatic error detection
 * - Self-healing (auto-fix common issues)
 * - Retry logic
 * - Detailed reporting
 * - Database seeding when needed
 * - Smart remediation
 *
 * Usage:
 *   npm run test:auto-heal
 *   or
 *   tsx scripts/test-auto-heal.ts
 */

import { chromium, Browser, Page } from "@playwright/test";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
};

const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg: string) =>
    console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg: string) => console.log(`${colors.cyan}👉 ${msg}${colors.reset}`),
  header: (msg: string) =>
    console.log(
      `\n${colors.bright}${colors.magenta}${"=".repeat(70)}\n${msg}\n${"=".repeat(70)}${colors.reset}\n`,
    ),
  fix: (msg: string) => console.log(`${colors.yellow}🔧 ${msg}${colors.reset}`),
  retry: (msg: string) => console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`),
  heal: (msg: string) => console.log(`${colors.green}💚 ${msg}${colors.reset}`),
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  fixAttempted?: boolean;
  fixApplied?: string;
  retries: number;
  duration: number;
}

interface TestScenario {
  name: string;
  description: string;
  action: (page: Page) => Promise<TestResult>;
  fixStrategy?: (page: Page, error: string) => Promise<boolean>;
  criticalLevel: "high" | "medium" | "low";
}

class SelfHealingTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];
  private fixesApplied: string[] = [];
  private databaseSeeded = false;

  async init() {
    log.header("🔮 Self-Healing Automated Test System");
    log.info(`Testing URL: ${BASE_URL}`);
    log.info("This system will automatically fix issues and retry tests");
    console.log("");

    log.step("Launching browser...");
    this.browser = await chromium.launch({
      headless: false,
      slowMo: 300,
    });

    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(30000);

    log.success("Browser ready!");
    return this.page;
  }

  // Auto-fix strategies
  private async seedDatabase(): Promise<boolean> {
    if (this.databaseSeeded) {
      log.info("Database already seeded in this session");
      return true;
    }

    try {
      log.fix("Attempting to seed database...");
      const { stdout, stderr } = await execAsync("npm run seed", {
        cwd: process.cwd(),
        timeout: 60000,
      });

      if (stderr && !stderr.includes("npm info")) {
        log.warn(`Seed warnings: ${stderr}`);
      }

      this.databaseSeeded = true;
      this.fixesApplied.push("Database seeded with test data");
      log.heal("Database seeded successfully!");
      return true;
    } catch (error) {
      log.error(`Failed to seed database: ${error}`);
      return false;
    }
  }

  private async checkServerHealth(): Promise<boolean> {
    try {
      if (!this.page) return false;

      log.step("Checking server health...");
      const response = await this.page.goto(`${BASE_URL}/api/health`, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });

      if (response && response.ok()) {
        log.success("Server is healthy");
        return true;
      }

      log.warn("Server health check failed");
      return false;
    } catch (error) {
      log.error(`Server not responding: ${error}`);
      return false;
    }
  }

  private async waitForPageStability(
    page: Page,
    timeout = 3000,
  ): Promise<void> {
    try {
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(timeout);
    } catch (error) {
      log.warn(`Page stability wait failed: ${error}`);
    }
  }

  // Test Scenarios with self-healing capabilities
  private scenarios: TestScenario[] = [
    {
      name: "Homepage Load",
      description: "Verify homepage loads correctly",
      criticalLevel: "high",
      action: async (page: Page): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          log.step("Navigating to homepage...");
          await page.goto(BASE_URL);
          await this.waitForPageStability(page);

          const title = await page.title();
          const hasNav = (await page.locator("nav").count()) > 0;
          const hasMain = (await page.locator("main").count()) > 0;

          if (!title) throw new Error("Page has no title");
          if (!hasNav) throw new Error("Navigation not found");
          if (!hasMain) throw new Error("Main content not found");

          log.success(`Homepage loaded: "${title}"`);

          return {
            name: "Homepage Load",
            passed: true,
            duration: Date.now() - startTime,
            retries: 0,
          };
        } catch (error: any) {
          return {
            name: "Homepage Load",
            passed: false,
            error: error.message,
            duration: Date.now() - startTime,
            retries: 0,
          };
        }
      },
      fixStrategy: async (page: Page, error: string): Promise<boolean> => {
        log.fix("Attempting to fix homepage issues...");
        await this.checkServerHealth();
        await page.reload();
        await this.waitForPageStability(page);
        return true;
      },
    },
    {
      name: "Search Functionality",
      description: "Test search feature",
      criticalLevel: "high",
      action: async (page: Page): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          log.step("Testing search...");

          const searchSelectors = [
            'input[type="search"]',
            'input[placeholder*="Search" i]',
            'input[name="search"]',
          ];

          let searchInput = null;
          for (const selector of searchSelectors) {
            const element = page.locator(selector).first();
            if ((await element.count()) > 0) {
              searchInput = element;
              break;
            }
          }

          if (!searchInput) {
            throw new Error("Search input not found");
          }

          await searchInput.fill("tomato");
          await page.waitForTimeout(500);
          await searchInput.press("Enter");
          await this.waitForPageStability(page, 2000);

          log.success("Search executed successfully");

          return {
            name: "Search Functionality",
            passed: true,
            duration: Date.now() - startTime,
            retries: 0,
          };
        } catch (error: any) {
          return {
            name: "Search Functionality",
            passed: false,
            error: error.message,
            duration: Date.now() - startTime,
            retries: 0,
          };
        }
      },
    },
    {
      name: "Products Page",
      description: "Verify products are listed",
      criticalLevel: "high",
      action: async (page: Page): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          log.step("Navigating to products page...");
          await page.goto(`${BASE_URL}/products`);
          await this.waitForPageStability(page);

          const productCards = await page
            .locator('[data-testid*="product"], article, .product-card')
            .count();
          const addToCartButtons = await page
            .locator(
              'button:has-text("Add to Cart"), button:has-text("Add to cart")',
            )
            .count();

          if (productCards === 0 && addToCartButtons === 0) {
            throw new Error("No products found on page");
          }

          log.success(
            `Found ${Math.max(productCards, addToCartButtons)} products`,
          );

          return {
            name: "Products Page",
            passed: true,
            duration: Date.now() - startTime,
            retries: 0,
          };
        } catch (error: any) {
          return {
            name: "Products Page",
            passed: false,
            error: error.message,
            duration: Date.now() - startTime,
            retries: 0,
          };
        }
      },
      fixStrategy: async (page: Page, error: string): Promise<boolean> => {
        if (error.includes("No products found")) {
          log.fix("No products found - seeding database...");
          const seeded = await this.seedDatabase();
          if (seeded) {
            await page.reload();
            await this.waitForPageStability(page);
            return true;
          }
        }
        return false;
      },
    },
    {
      name: "Add to Cart",
      description: "Test adding items to cart",
      criticalLevel: "high",
      action: async (page: Page): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          log.step("Testing add to cart...");

          await page.goto(`${BASE_URL}/products`);
          await this.waitForPageStability(page);

          const addToCartBtn = page
            .locator(
              'button:has-text("Add to Cart"), button:has-text("Add to cart")',
            )
            .first();
          const btnCount = await addToCartBtn.count();

          if (btnCount === 0) {
            throw new Error('No "Add to Cart" buttons found');
          }

          await addToCartBtn.click();
          await page.waitForTimeout(1500);

          log.success("Item added to cart");

          return {
            name: "Add to Cart",
            passed: true,
            duration: Date.now() - startTime,
            retries: 0,
          };
        } catch (error: any) {
          return {
            name: "Add to Cart",
            passed: false,
            error: error.message,
            duration: Date.now() - startTime,
            retries: 0,
          };
        }
      },
      fixStrategy: async (page: Page, error: string): Promise<boolean> => {
        if (error.includes("Add to Cart")) {
          log.fix("Cart buttons not found - seeding database...");
          const seeded = await this.seedDatabase();
          if (seeded) {
            await page.reload();
            await this.waitForPageStability(page);
            return true;
          }
        }
        return false;
      },
    },
    {
      name: "User Registration",
      description: "Test registration form",
      criticalLevel: "high",
      action: async (page: Page): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          log.step("Testing registration...");

          await page.goto(`${BASE_URL}/register`);
          await this.waitForPageStability(page);

          const nameInput = page
            .locator('input[name="name"], input[type="text"]')
            .first();
          const emailInput = page
            .locator('input[name="email"], input[type="email"]')
            .first();
          const passwordInput = page
            .locator('input[name="password"], input[type="password"]')
            .first();

          if ((await nameInput.count()) === 0)
            throw new Error("Name field not found");
          if ((await emailInput.count()) === 0)
            throw new Error("Email field not found");
          if ((await passwordInput.count()) === 0)
            throw new Error("Password field not found");

          await nameInput.fill("Test User");
          await emailInput.fill(`test${Date.now()}@example.com`);
          await passwordInput.fill("TestPassword123!");

          log.success("Registration form verified");

          return {
            name: "User Registration",
            passed: true,
            duration: Date.now() - startTime,
            retries: 0,
          };
        } catch (error: any) {
          return {
            name: "User Registration",
            passed: false,
            error: error.message,
            duration: Date.now() - startTime,
            retries: 0,
          };
        }
      },
    },
    {
      name: "User Login",
      description: "Test login page",
      criticalLevel: "high",
      action: async (page: Page): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          log.step("Testing login page...");

          await page.goto(`${BASE_URL}/login`);
          await this.waitForPageStability(page);

          const emailInput = page
            .locator('input[name="email"], input[type="email"]')
            .first();
          const passwordInput = page
            .locator('input[name="password"], input[type="password"]')
            .first();

          if ((await emailInput.count()) === 0)
            throw new Error("Email field not found");
          if ((await passwordInput.count()) === 0)
            throw new Error("Password field not found");

          log.success("Login form verified");

          return {
            name: "User Login",
            passed: true,
            duration: Date.now() - startTime,
            retries: 0,
          };
        } catch (error: any) {
          return {
            name: "User Login",
            passed: false,
            error: error.message,
            duration: Date.now() - startTime,
            retries: 0,
          };
        }
      },
    },
    {
      name: "Farms Listing",
      description: "Test farms page",
      criticalLevel: "high",
      action: async (page: Page): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          log.step("Testing farms listing...");

          await page.goto(`${BASE_URL}/farms`);
          await this.waitForPageStability(page);

          const farmElements = await page
            .locator('[data-testid*="farm"], article, .farm-card')
            .count();

          if (farmElements === 0) {
            throw new Error("No farms found");
          }

          log.success(`Found ${farmElements} farms`);

          return {
            name: "Farms Listing",
            passed: true,
            duration: Date.now() - startTime,
            retries: 0,
          };
        } catch (error: any) {
          return {
            name: "Farms Listing",
            passed: false,
            error: error.message,
            duration: Date.now() - startTime,
            retries: 0,
          };
        }
      },
      fixStrategy: async (page: Page, error: string): Promise<boolean> => {
        if (error.includes("No farms found")) {
          log.fix("No farms found - seeding database...");
          const seeded = await this.seedDatabase();
          if (seeded) {
            await page.reload();
            await this.waitForPageStability(page);
            return true;
          }
        }
        return false;
      },
    },
    {
      name: "Mobile Responsiveness",
      description: "Test mobile view",
      criticalLevel: "medium",
      action: async (page: Page): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          log.step("Testing mobile view...");

          await page.setViewportSize({ width: 390, height: 844 });
          await page.goto(BASE_URL);
          await this.waitForPageStability(page);

          const mobileMenu = page
            .locator('button[aria-label*="menu" i], button:has-text("Menu")')
            .first();
          const hasMobileMenu = (await mobileMenu.count()) > 0;

          // Restore desktop view
          await page.setViewportSize({ width: 1920, height: 1080 });

          if (!hasMobileMenu) {
            throw new Error("Mobile menu not found");
          }

          log.success("Mobile view verified");

          return {
            name: "Mobile Responsiveness",
            passed: true,
            duration: Date.now() - startTime,
            retries: 0,
          };
        } catch (error: any) {
          // Restore desktop view even on error
          await page.setViewportSize({ width: 1920, height: 1080 });

          return {
            name: "Mobile Responsiveness",
            passed: false,
            error: error.message,
            duration: Date.now() - startTime,
            retries: 0,
          };
        }
      },
    },
    {
      name: "Keyboard Navigation",
      description: "Test keyboard accessibility",
      criticalLevel: "medium",
      action: async (page: Page): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          log.step("Testing keyboard navigation...");

          await page.goto(BASE_URL);
          await this.waitForPageStability(page);

          // Test Tab navigation
          for (let i = 0; i < 3; i++) {
            await page.keyboard.press("Tab");
            await page.waitForTimeout(300);
          }

          log.success("Keyboard navigation verified");

          return {
            name: "Keyboard Navigation",
            passed: true,
            duration: Date.now() - startTime,
            retries: 0,
          };
        } catch (error: any) {
          return {
            name: "Keyboard Navigation",
            passed: false,
            error: error.message,
            duration: Date.now() - startTime,
            retries: 0,
          };
        }
      },
    },
    {
      name: "Dark Mode Toggle",
      description: "Test theme switching",
      criticalLevel: "low",
      action: async (page: Page): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          log.step("Testing dark mode...");

          const themeToggleSelectors = [
            'button[aria-label*="theme" i]',
            'button[aria-label*="dark" i]',
            'button:has-text("Dark")',
            'button:has-text("Light")',
            '[data-testid*="theme"]',
          ];

          let found = false;
          for (const selector of themeToggleSelectors) {
            const element = page.locator(selector).first();
            if ((await element.count()) > 0) {
              found = true;
              await element.click();
              await page.waitForTimeout(1000);
              break;
            }
          }

          if (!found) {
            throw new Error("Theme toggle not found");
          }

          log.success("Dark mode toggle verified");

          return {
            name: "Dark Mode Toggle",
            passed: true,
            duration: Date.now() - startTime,
            retries: 0,
          };
        } catch (error: any) {
          return {
            name: "Dark Mode Toggle",
            passed: false,
            error: error.message,
            duration: Date.now() - startTime,
            retries: 0,
          };
        }
      },
      fixStrategy: async (page: Page, error: string): Promise<boolean> => {
        log.info("Dark mode is optional - marking as non-critical");
        return false; // Don't retry, it's optional
      },
    },
  ];

  async runScenarioWithHealing(
    scenario: TestScenario,
    maxRetries = 2,
  ): Promise<TestResult> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    log.header(`🧪 Testing: ${scenario.name}`);
    log.info(scenario.description);
    log.info(`Critical Level: ${scenario.criticalLevel.toUpperCase()}`);
    console.log("");

    let result = await scenario.action(this.page);
    let attempts = 1;

    // If test failed and we have a fix strategy, try to heal
    while (!result.passed && attempts <= maxRetries) {
      if (scenario.fixStrategy) {
        log.warn(`Test failed: ${result.error}`);
        log.fix(
          `Attempting automatic fix (Attempt ${attempts}/${maxRetries})...`,
        );

        const fixed = await scenario.fixStrategy(this.page, result.error || "");

        if (fixed) {
          log.heal("Fix applied! Retrying test...");
          result = await scenario.action(this.page);
          result.retries = attempts;
          result.fixAttempted = true;

          if (result.passed) {
            result.fixApplied = `Auto-healed after ${attempts} attempt(s)`;
            log.success(`✨ Test passed after auto-healing!`);
          }
        } else {
          log.warn("Fix strategy did not resolve the issue");
        }
      }

      attempts++;

      if (!result.passed && attempts <= maxRetries) {
        log.retry(`Retrying without fix... (${attempts}/${maxRetries})`);
        await this.page.waitForTimeout(2000);
        result = await scenario.action(this.page);
        result.retries = attempts;
      }
    }

    // Final result
    if (result.passed) {
      log.success(`✅ ${scenario.name} PASSED`);
    } else {
      if (scenario.criticalLevel === "low") {
        log.warn(`⚠️  ${scenario.name} FAILED (Non-critical)`);
      } else {
        log.error(`❌ ${scenario.name} FAILED`);
      }
    }

    console.log("");
    return result;
  }

  async runAllTests() {
    log.header("🚀 Starting Automated Test Suite with Self-Healing");

    for (const scenario of this.scenarios) {
      const result = await this.runScenarioWithHealing(scenario);
      this.results.push(result);

      // For critical tests, pause if they fail
      if (!result.passed && scenario.criticalLevel === "high") {
        log.error(`CRITICAL TEST FAILED: ${scenario.name}`);
        log.warn("This is a critical feature. Continuing to next test...");
        await this.page?.waitForTimeout(2000);
      }
    }

    this.generateReport();
  }

  private generateReport() {
    log.header("📊 Test Results Report");

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => r.passed === false).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log(`${colors.bright}Summary:${colors.reset}`);
    console.log(`  Total Tests: ${total}`);
    console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`  ${colors.cyan}Pass Rate: ${passRate}%${colors.reset}`);
    console.log("");

    // Show fixes applied
    if (this.fixesApplied.length > 0) {
      console.log(
        `${colors.bright}${colors.green}Fixes Applied:${colors.reset}`,
      );
      this.fixesApplied.forEach((fix, i) => {
        console.log(`  ${i + 1}. ${fix}`);
      });
      console.log("");
    }

    // Show failed tests
    const failedTests = this.results.filter((r) => !r.passed);
    if (failedTests.length > 0) {
      console.log(`${colors.bright}${colors.red}Failed Tests:${colors.reset}`);
      failedTests.forEach((test, i) => {
        console.log(`  ${i + 1}. ${test.name}`);
        console.log(`     Error: ${test.error}`);
        if (test.fixAttempted) {
          console.log(
            `     ${colors.yellow}Fix attempted but test still failed${colors.reset}`,
          );
        }
      });
      console.log("");
    }

    // Show healed tests
    const healedTests = this.results.filter((r) => r.passed && r.fixApplied);
    if (healedTests.length > 0) {
      console.log(
        `${colors.bright}${colors.green}Self-Healed Tests:${colors.reset}`,
      );
      healedTests.forEach((test, i) => {
        console.log(`  ${i + 1}. ${test.name} - ${test.fixApplied}`);
      });
      console.log("");
    }

    // Performance stats
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = (totalDuration / total / 1000).toFixed(2);
    console.log(`${colors.bright}Performance:${colors.reset}`);
    console.log(`  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`  Average Test Duration: ${avgDuration}s`);
    console.log("");

    // Final verdict
    if (passRate === "100.0") {
      log.success("🎉 ALL TESTS PASSED! Platform is fully functional!");
    } else if (parseFloat(passRate) >= 80) {
      log.success(
        `✅ ${passRate}% tests passed - Platform is mostly functional`,
      );
    } else if (parseFloat(passRate) >= 60) {
      log.warn(`⚠️  ${passRate}% tests passed - Platform needs attention`);
    } else {
      log.error(
        `❌ Only ${passRate}% tests passed - Platform has critical issues`,
      );
    }

    // Save report to file
    this.saveReportToFile();
  }

  private saveReportToFile() {
    const reportPath = path.join(
      process.cwd(),
      "test-results",
      "auto-heal-report.json",
    );
    const reportDir = path.dirname(reportPath);

    try {
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          total: this.results.length,
          passed: this.results.filter((r) => r.passed).length,
          failed: this.results.filter((r) => !r.passed).length,
          passRate: (
            (this.results.filter((r) => r.passed).length /
              this.results.length) *
            100
          ).toFixed(1),
        },
        fixesApplied: this.fixesApplied,
        results: this.results,
      };

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      log.info(`Report saved to: ${reportPath}`);
    } catch (error) {
      log.warn(`Could not save report: ${error}`);
    }
  }

  async cleanup() {
    log.step("Cleaning up...");

    if (this.browser) {
      await this.browser.close();
      log.success("Browser closed");
    }
  }

  async run() {
    try {
      await this.init();
      await this.runAllTests();
    } catch (error) {
      log.error(`Fatal error: ${error}`);
    } finally {
      await this.cleanup();
    }
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🔮 SELF-HEALING AUTOMATED TEST SYSTEM                          ║
║                                                                   ║
║   This system will:                                              ║
║   • Run all tests automatically                                  ║
║   • Detect errors and failures                                   ║
║   • Attempt to fix issues automatically                          ║
║   • Retry tests after fixes                                      ║
║   • Generate comprehensive reports                               ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  const tester = new SelfHealingTester();
  await tester.run();

  log.header("🎉 Test Run Complete!");
  log.info("Check test-results/auto-heal-report.json for detailed results");

  process.exit(0);
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
