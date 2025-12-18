#!/usr/bin/env tsx
/**
 * 🧪 Human-Like Website Testing Script
 * Interactive script to test the Farmers Market Platform the way humans would use it
 *
 * Usage:
 *   npm run test:human
 *   or
 *   tsx scripts/test-website-human.ts
 */

import { chromium, Browser, Page } from "@playwright/test";
import * as readline from "readline";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
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
      `\n${colors.bright}${colors.magenta}${"=".repeat(60)}\n${msg}\n${"=".repeat(60)}${colors.reset}\n`,
    ),
};

interface TestScenario {
  name: string;
  description: string;
  action: (page: Page) => Promise<void>;
}

class HumanTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async init() {
    log.header("🚀 Starting Human-Like Website Testing");
    log.info(`Testing URL: ${BASE_URL}`);

    // Launch browser in headed mode so user can see
    log.step("Launching browser...");
    this.browser = await chromium.launch({
      headless: false,
      slowMo: 500, // Slow down actions to be more human-like
    });

    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(30000);

    log.success("Browser ready!");
    return this.page;
  }

  async askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(
        `${colors.yellow}❓ ${question}${colors.reset} `,
        (answer) => {
          resolve(answer.trim());
        },
      );
    });
  }

  async showMenu(): Promise<number> {
    log.header("📋 Test Scenarios Menu");
    console.log("1. 🏠 Browse Homepage");
    console.log("2. 🔍 Search for Products");
    console.log("3. 🛒 Add Items to Cart");
    console.log("4. 👤 Test User Registration");
    console.log("5. 🔐 Test User Login");
    console.log("6. 👨‍🌾 Browse Farms");
    console.log("7. 📱 Test Mobile View");
    console.log("8. ♿ Test Keyboard Navigation");
    console.log("9. 🎨 Test Dark Mode Toggle");
    console.log("10. 💳 Test Checkout Flow (without payment)");
    console.log("11. 🔄 Run All Tests Sequentially");
    console.log("0. 🚪 Exit");
    console.log("");

    const choice = await this.askQuestion("Select a test scenario (0-11):");
    return parseInt(choice) || 0;
  }

  async waitForUserConfirmation(
    message: string = "Press Enter to continue...",
  ) {
    await this.askQuestion(message);
  }

  // Test Scenarios
  private scenarios: TestScenario[] = [
    {
      name: "Browse Homepage",
      description: "Navigate to homepage and check if it loads correctly",
      action: async (page: Page) => {
        log.step("Navigating to homepage...");
        await page.goto(BASE_URL);
        await page.waitForLoadState("domcontentloaded");

        log.step("Checking page title...");
        const title = await page.title();
        log.info(`Page title: "${title}"`);

        log.step("Looking for main navigation...");
        const hasNav = (await page.locator("nav").count()) > 0;
        if (hasNav) {
          log.success("Navigation found!");
        } else {
          log.warn("Navigation not found");
        }

        log.step("Checking for featured content...");
        const hasContent = (await page.locator("main").count()) > 0;
        if (hasContent) {
          log.success("Main content area found!");
        } else {
          log.warn("Main content not found");
        }

        log.step("Scrolling down the page (like a human would)...");
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight / 3),
        );
        await page.waitForTimeout(1000);
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight / 2),
        );
        await page.waitForTimeout(1000);
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight),
        );
        await page.waitForTimeout(1000);

        log.success("Homepage test complete!");
      },
    },
    {
      name: "Search for Products",
      description: "Test the search functionality",
      action: async (page: Page) => {
        log.step("Looking for search input...");
        const searchSelectors = [
          'input[type="search"]',
          'input[placeholder*="Search" i]',
          'input[name="search"]',
          '[data-testid*="search"]',
        ];

        let searchInput = null;
        for (const selector of searchSelectors) {
          const element = page.locator(selector).first();
          if ((await element.count()) > 0) {
            searchInput = element;
            log.success(`Found search input: ${selector}`);
            break;
          }
        }

        if (!searchInput) {
          log.warn(
            "Search input not found. Trying to navigate to products page...",
          );
          await page.goto(`${BASE_URL}/products`);
          return;
        }

        const searchTerm = await this.askQuestion(
          'Enter search term (or press Enter for "tomato"):',
        );
        const query = searchTerm || "tomato";

        log.step(`Typing "${query}" into search box...`);
        await searchInput.fill(query);
        await page.waitForTimeout(500);

        log.step("Pressing Enter...");
        await searchInput.press("Enter");
        await page.waitForTimeout(2000);

        log.success("Search executed!");
        log.info("Check the browser to see the results");
      },
    },
    {
      name: "Add Items to Cart",
      description: "Find products and add them to cart",
      action: async (page: Page) => {
        log.step("Navigating to products page...");
        await page.goto(`${BASE_URL}/products`);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);

        log.step('Looking for "Add to Cart" buttons...');
        const addToCartButtons = page.locator(
          'button:has-text("Add to Cart"), button:has-text("Add to cart")',
        );
        const count = await addToCartButtons.count();

        if (count === 0) {
          log.warn('No "Add to Cart" buttons found on this page');
          log.info(
            "This might be because products need to be seeded or the page structure is different",
          );
          return;
        }

        log.success(`Found ${count} products!`);
        log.step('Clicking first "Add to Cart" button...');
        await addToCartButtons.first().click();
        await page.waitForTimeout(1500);

        log.step("Looking for cart indicator...");
        const cartSelectors = [
          '[data-testid*="cart"]',
          'a[href*="cart"]',
          'button:has-text("Cart")',
        ];

        for (const selector of cartSelectors) {
          const element = page.locator(selector).first();
          if ((await element.count()) > 0) {
            log.success("Cart indicator found!");
            const text = await element.textContent();
            log.info(`Cart content: "${text}"`);
            break;
          }
        }

        log.success("Add to cart test complete!");
      },
    },
    {
      name: "Test User Registration",
      description: "Navigate to registration and fill the form",
      action: async (page: Page) => {
        log.step("Navigating to registration page...");
        await page.goto(`${BASE_URL}/register`);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(1000);

        const testEmail = `test${Date.now()}@example.com`;
        const testPassword = "TestPassword123!";

        log.info("Looking for registration form fields...");

        try {
          // Name field
          const nameInput = page
            .locator('input[name="name"], input[type="text"]')
            .first();
          if ((await nameInput.count()) > 0) {
            log.step("Filling name field...");
            await nameInput.fill("Test User");
            await page.waitForTimeout(500);
          }

          // Email field
          const emailInput = page
            .locator('input[name="email"], input[type="email"]')
            .first();
          if ((await emailInput.count()) > 0) {
            log.step("Filling email field...");
            await emailInput.fill(testEmail);
            await page.waitForTimeout(500);
          }

          // Password field
          const passwordInput = page
            .locator('input[name="password"], input[type="password"]')
            .first();
          if ((await passwordInput.count()) > 0) {
            log.step("Filling password field...");
            await passwordInput.fill(testPassword);
            await page.waitForTimeout(500);
          }

          log.success(
            "Form filled! (Not submitting to avoid creating test accounts)",
          );
          log.info(`Test credentials: ${testEmail} / ${testPassword}`);
        } catch (error) {
          log.warn("Some form fields might be missing or named differently");
          log.info("Check the browser to see the actual form");
        }
      },
    },
    {
      name: "Test User Login",
      description: "Navigate to login page",
      action: async (page: Page) => {
        log.step("Navigating to login page...");
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(1000);

        log.info(
          "Login page loaded. You can try logging in with test credentials:",
        );
        log.info("- admin@farmersmarket.app");
        log.info("- farmer@farmersmarket.app");
        log.info("- customer@farmersmarket.app");
        log.warn("(Passwords depend on your seed data)");
      },
    },
    {
      name: "Browse Farms",
      description: "Navigate to farms listing and explore",
      action: async (page: Page) => {
        log.step("Navigating to farms page...");
        await page.goto(`${BASE_URL}/farms`);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);

        log.step("Looking for farm listings...");
        const farmCards = page
          .locator('[data-testid*="farm"], article, .farm-card')
          .first();

        if ((await farmCards.count()) > 0) {
          log.success("Farm listings found!");
          log.step("Clicking on first farm to view details...");
          await farmCards.click();
          await page.waitForTimeout(2000);
          log.success("Farm details page loaded!");
        } else {
          log.warn("No farms found. You might need to seed the database.");
        }
      },
    },
    {
      name: "Test Mobile View",
      description: "Switch to mobile viewport",
      action: async (page: Page) => {
        log.step("Switching to mobile viewport (iPhone 12)...");
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(1000);

        log.step("Reloading page...");
        await page.reload();
        await page.waitForTimeout(2000);

        log.success("Mobile view activated!");
        log.info("Check the browser - it should look like a mobile phone");

        log.step("Looking for mobile menu...");
        const menuButton = page
          .locator('button[aria-label*="menu" i], button:has-text("Menu")')
          .first();
        if ((await menuButton.count()) > 0) {
          log.success("Mobile menu button found!");
          log.step("Opening mobile menu...");
          await menuButton.click();
          await page.waitForTimeout(1000);
        }

        // Switch back to desktop
        await this.waitForUserConfirmation(
          "Press Enter to switch back to desktop view...",
        );
        log.step("Switching back to desktop viewport...");
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(1000);
        log.success("Desktop view restored!");
      },
    },
    {
      name: "Test Keyboard Navigation",
      description: "Navigate the site using only keyboard",
      action: async (page: Page) => {
        log.step("Navigating to homepage...");
        await page.goto(BASE_URL);
        await page.waitForLoadState("domcontentloaded");

        log.success("Now testing keyboard navigation!");
        log.info("Watch the browser - focus indicators should be visible");

        log.step("Pressing Tab key 5 times...");
        for (let i = 1; i <= 5; i++) {
          await page.keyboard.press("Tab");
          await page.waitForTimeout(800);
          log.info(`Tab ${i}/5`);
        }

        log.step("Pressing Enter on focused element...");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(2000);

        log.success("Keyboard navigation test complete!");
        log.info(
          "Good keyboard navigation means all interactive elements can be reached with Tab",
        );
      },
    },
    {
      name: "Test Dark Mode Toggle",
      description: "Switch between light and dark themes",
      action: async (page: Page) => {
        log.step("Looking for theme toggle...");

        const themeToggleSelectors = [
          'button[aria-label*="theme" i]',
          'button[aria-label*="dark" i]',
          'button:has-text("Dark")',
          'button:has-text("Light")',
          '[data-testid*="theme"]',
        ];

        let toggle = null;
        for (const selector of themeToggleSelectors) {
          const element = page.locator(selector).first();
          if ((await element.count()) > 0) {
            toggle = element;
            log.success(`Found theme toggle: ${selector}`);
            break;
          }
        }

        if (!toggle) {
          log.warn("Theme toggle not found on this page");
          log.info("Theme toggle might be in settings or user menu");
          return;
        }

        log.step("Clicking theme toggle...");
        await toggle.click();
        await page.waitForTimeout(1500);
        log.success("Theme toggled!");

        await page.waitForTimeout(1000);

        log.step("Toggling back...");
        await toggle.click();
        await page.waitForTimeout(1500);
        log.success("Theme toggled back!");
      },
    },
    {
      name: "Test Checkout Flow",
      description: "Go through checkout process (without actual payment)",
      action: async (page: Page) => {
        log.warn("This is a simulation - no actual payment will be processed");

        // First, add something to cart
        log.step("Step 1: Adding item to cart...");
        await page.goto(`${BASE_URL}/products`);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);

        const addToCartBtn = page
          .locator('button:has-text("Add to Cart")')
          .first();
        if ((await addToCartBtn.count()) > 0) {
          await addToCartBtn.click();
          await page.waitForTimeout(1500);
          log.success("Item added to cart!");
        } else {
          log.warn("Could not find products to add to cart");
          return;
        }

        // Go to cart
        log.step("Step 2: Going to cart...");
        await page.goto(`${BASE_URL}/cart`);
        await page.waitForTimeout(2000);
        log.success("Cart page loaded!");

        // Look for checkout button
        log.step("Step 3: Looking for checkout button...");
        const checkoutBtn = page
          .locator('button:has-text("Checkout"), a:has-text("Checkout")')
          .first();
        if ((await checkoutBtn.count()) > 0) {
          log.success("Checkout button found!");
          log.info(
            "You can manually click it to proceed, or we stop here to avoid test orders",
          );
        } else {
          log.warn("Checkout button not found");
        }

        log.success("Checkout flow test complete!");
      },
    },
  ];

  async runScenario(index: number) {
    if (index < 0 || index >= this.scenarios.length) {
      log.error("Invalid scenario index");
      return;
    }

    const scenario = this.scenarios[index];
    if (!this.page) {
      log.error("Browser not initialized");
      return;
    }

    log.header(`🎬 Running: ${scenario.name}`);
    log.info(scenario.description);
    console.log("");

    try {
      await scenario.action(this.page);
      log.success(`✨ Scenario "${scenario.name}" completed successfully!`);
    } catch (error) {
      log.error(`Scenario failed: ${error}`);
      log.info("Check the browser window for more details");
    }

    console.log("");
  }

  async runAllScenarios() {
    log.header("🚀 Running All Test Scenarios");

    for (let i = 0; i < this.scenarios.length; i++) {
      await this.runScenario(i);

      if (i < this.scenarios.length - 1) {
        const continueTest = await this.askQuestion(
          "Continue to next test? (Y/n):",
        );
        if (continueTest.toLowerCase() === "n") {
          log.info("Stopped by user");
          break;
        }
      }
    }

    log.header("🎉 All Tests Complete!");
  }

  async cleanup() {
    log.step("Cleaning up...");

    if (this.browser) {
      // Ask before closing readline
      const keepOpen = await this.askQuestion("Keep browser open? (y/N):");
      this.rl.close();

      if (keepOpen.toLowerCase() !== "y") {
        await this.browser.close();
        log.success("Browser closed");
      } else {
        log.info("Browser left open for manual inspection");
      }
    } else {
      this.rl.close();
    }
  }

  async run() {
    try {
      await this.init();

      while (true) {
        const choice = await this.showMenu();

        if (choice === 0) {
          log.info("Exiting...");
          break;
        } else if (choice === 11) {
          await this.runAllScenarios();
        } else if (choice >= 1 && choice <= 10) {
          await this.runScenario(choice - 1);
          await this.waitForUserConfirmation(
            "\nPress Enter to return to menu...",
          );
        } else {
          log.error("Invalid choice. Please select 0-11.");
        }
      }
    } catch (error) {
      log.error(`Fatal error: ${error}`);
    } finally {
      await this.cleanup();
    }
  }
}

// Main execution
async function main() {
  const tester = new HumanTester();
  await tester.run();
  process.exit(0);
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
