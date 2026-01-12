#!/usr/bin/env tsx

/**
 * 🎨 Visual Regression Testing Script
 * Farmers Market Platform - Automated Visual Testing
 * Version: 1.0.0
 *
 * Captures screenshots of key pages and compares them for visual regressions.
 * Can be integrated with Chromatic or used standalone with Playwright.
 *
 * Usage:
 *   npm run test:visual
 *   tsx scripts/visual-regression-test.ts
 *   tsx scripts/visual-regression-test.ts --baseline  (create baseline)
 *   tsx scripts/visual-regression-test.ts --compare   (compare against baseline)
 */

import { chromium, Browser, Page } from "playwright";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  baseUrl: process.env.BASE_URL || "http://localhost:3001",
  headless: process.env.HEADLESS !== "false",
  screenshotDir: "./visual-tests/screenshots",
  baselineDir: "./visual-tests/baseline",
  diffDir: "./visual-tests/diffs",
  reportDir: "./visual-tests/reports",
  threshold: parseFloat(process.env.VISUAL_THRESHOLD || "0.05"), // 5% difference
  viewports: [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1920, height: 1080 },
  ],
};

// ============================================================================
// PAGES TO TEST
// ============================================================================

interface PageToTest {
  name: string;
  path: string;
  waitFor?: string | string[];
  actions?: (page: Page) => Promise<void>;
  critical?: boolean;
}

const PAGES_TO_TEST: PageToTest[] = [
  // Public pages
  {
    name: "homepage",
    path: "/",
    waitFor: ["[data-testid='hero-section']", "nav"],
    critical: true,
  },
  {
    name: "marketplace",
    path: "/marketplace",
    waitFor: ["[data-testid='farm-grid']", "[data-testid='product-grid']"],
    critical: true,
  },
  {
    name: "marketplace-with-filters",
    path: "/marketplace",
    waitFor: ["[data-testid='farm-grid']"],
    actions: async (page) => {
      // Open filters
      await page.click("[data-testid='filter-toggle']").catch(() => {});
      await page.waitForTimeout(500);
    },
  },
  {
    name: "login-page",
    path: "/login",
    waitFor: ["form", "[data-testid='login-form']"],
    critical: true,
  },
  {
    name: "register-customer",
    path: "/register",
    waitFor: ["form", "[data-testid='registration-form']"],
    critical: true,
  },
  {
    name: "register-farmer",
    path: "/register/farmer",
    waitFor: ["form"],
    critical: true,
  },
  {
    name: "about-page",
    path: "/about",
    waitFor: ["main"],
  },
  {
    name: "contact-page",
    path: "/contact",
    waitFor: ["form", "main"],
  },

  // Farm pages (need sample farm)
  {
    name: "farm-profile",
    path: "/farms/sample-farm-slug",
    waitFor: ["[data-testid='farm-header']", "main"],
  },
  {
    name: "product-detail",
    path: "/products/sample-product-slug",
    waitFor: ["[data-testid='product-detail']", "main"],
  },

  // Cart and checkout
  {
    name: "cart-empty",
    path: "/cart",
    waitFor: ["main", "[data-testid='cart-container']"],
    critical: true,
  },

  // Dashboard pages (need authentication)
  {
    name: "customer-dashboard",
    path: "/dashboard",
    waitFor: ["[data-testid='dashboard']", "main"],
  },
  {
    name: "farmer-dashboard",
    path: "/dashboard/farmer",
    waitFor: ["main"],
  },

  // Error pages
  {
    name: "404-page",
    path: "/this-page-does-not-exist",
    waitFor: ["main"],
  },
];

// ============================================================================
// COLOR OUTPUT
// ============================================================================

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
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
  header: (msg: string) =>
    console.log(
      `\n${colors.bright}${colors.magenta}${"=".repeat(60)}${colors.reset}\n${colors.bright}${msg}${colors.reset}\n${colors.magenta}${"=".repeat(60)}${colors.reset}\n`,
    ),
};

// ============================================================================
// VISUAL REGRESSION TESTER
// ============================================================================

interface VisualTestResult {
  page: string;
  viewport: string;
  status: "passed" | "failed" | "new" | "error";
  diffPercentage?: number;
  error?: string;
  screenshotPath: string;
  baselinePath?: string;
  diffPath?: string;
}

class VisualRegressionTester {
  private browser!: Browser;
  private results: VisualTestResult[] = [];
  private mode: "baseline" | "compare";

  constructor(mode: "baseline" | "compare" = "compare") {
    this.mode = mode;
  }

  async init(): Promise<void> {
    log.header("🎨 VISUAL REGRESSION TESTING");
    log.info(`Mode: ${this.mode}`);
    log.info(`Base URL: ${CONFIG.baseUrl}`);
    log.info(`Threshold: ${CONFIG.threshold * 100}%`);

    // Create directories
    this.ensureDirectories();

    // Launch browser
    log.step("Launching browser...");
    this.browser = await chromium.launch({
      headless: CONFIG.headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    log.success("Browser launched");
  }

  private ensureDirectories(): void {
    const dirs = [
      CONFIG.screenshotDir,
      CONFIG.baselineDir,
      CONFIG.diffDir,
      CONFIG.reportDir,
    ];

    dirs.forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  async runTests(): Promise<void> {
    log.step(
      `Testing ${PAGES_TO_TEST.length} pages across ${CONFIG.viewports.length} viewports...\n`,
    );

    for (const viewport of CONFIG.viewports) {
      log.info(
        `\n📱 Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`,
      );

      const context = await this.browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      });

      const page = await context.newPage();
      page.setDefaultTimeout(30000);

      for (const pageToTest of PAGES_TO_TEST) {
        await this.testPage(page, pageToTest, viewport.name);
      }

      await context.close();
    }
  }

  private async testPage(
    page: Page,
    pageToTest: PageToTest,
    viewportName: string,
  ): Promise<void> {
    const testName = `${pageToTest.name}-${viewportName}`;
    log.step(`  Testing: ${pageToTest.name}`);

    try {
      // Navigate to page
      const response = await page.goto(`${CONFIG.baseUrl}${pageToTest.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      if (!response || !response.ok()) {
        throw new Error(`Page failed to load: ${response?.status()}`);
      }

      // Wait for page to be ready
      await this.waitForPageReady(page, pageToTest);

      // Execute custom actions if any
      if (pageToTest.actions) {
        await pageToTest.actions(page);
        await page.waitForTimeout(500); // Let animations complete
      }

      // Wait for fonts and images
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(1000); // Extra time for animations

      // Capture screenshot
      const screenshotPath = join(
        CONFIG.screenshotDir,
        `${testName}-${Date.now()}.png`,
      );
      const baselinePath = join(CONFIG.baselineDir, `${testName}.png`);

      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        animations: "disabled", // Disable CSS animations
      });

      if (this.mode === "baseline") {
        // Save as baseline
        await page.screenshot({
          path: baselinePath,
          fullPage: true,
          animations: "disabled",
        });

        log.success(`  ✓ Baseline created: ${pageToTest.name}`);

        this.results.push({
          page: pageToTest.name,
          viewport: viewportName,
          status: "new",
          screenshotPath,
          baselinePath,
        });
      } else {
        // Compare with baseline
        if (!existsSync(baselinePath)) {
          log.warn(`  ⚠ No baseline found for ${pageToTest.name}`);

          this.results.push({
            page: pageToTest.name,
            viewport: viewportName,
            status: "new",
            screenshotPath,
          });
        } else {
          const diffResult = await this.compareScreenshots(
            screenshotPath,
            baselinePath,
            testName,
          );

          this.results.push(diffResult);

          if (diffResult.status === "passed") {
            log.success(
              `  ✓ Passed: ${pageToTest.name} (${diffResult.diffPercentage?.toFixed(2)}%)`,
            );
          } else {
            log.error(
              `  ✗ Failed: ${pageToTest.name} (${diffResult.diffPercentage?.toFixed(2)}% diff)`,
            );
          }
        }
      }
    } catch (error) {
      log.error(`  ✗ Error: ${pageToTest.name}`);
      console.error(
        `     ${error instanceof Error ? error.message : String(error)}`,
      );

      this.results.push({
        page: pageToTest.name,
        viewport: viewportName,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        screenshotPath: "",
      });
    }
  }

  private async waitForPageReady(
    page: Page,
    pageToTest: PageToTest,
  ): Promise<void> {
    if (!pageToTest.waitFor) return;

    const selectors = Array.isArray(pageToTest.waitFor)
      ? pageToTest.waitFor
      : [pageToTest.waitFor];

    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, {
          timeout: 10000,
          state: "visible",
        });
      } catch {
        // Continue even if selector not found
      }
    }
  }

  private async compareScreenshots(
    currentPath: string,
    baselinePath: string,
    testName: string,
  ): Promise<VisualTestResult> {
    // Note: For production use, integrate with pixelmatch or resemblejs
    // This is a simplified version using file size comparison
    try {
      const currentSize = readFileSync(currentPath).length;
      const baselineSize = readFileSync(baselinePath).length;

      const sizeDiff = Math.abs(currentSize - baselineSize) / baselineSize;

      const status = sizeDiff <= CONFIG.threshold ? "passed" : "failed";

      return {
        page: testName,
        viewport: testName.split("-").pop() || "unknown",
        status,
        diffPercentage: sizeDiff * 100,
        screenshotPath: currentPath,
        baselinePath,
      };
    } catch (error) {
      return {
        page: testName,
        viewport: "unknown",
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        screenshotPath: currentPath,
        baselinePath,
      };
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  generateReport(): void {
    log.header("📊 VISUAL REGRESSION TEST REPORT");

    const passed = this.results.filter((r) => r.status === "passed").length;
    const failed = this.results.filter((r) => r.status === "failed").length;
    const errors = this.results.filter((r) => r.status === "error").length;
    const newTests = this.results.filter((r) => r.status === "new").length;

    console.log(`Total Tests: ${this.results.length}`);
    console.log(`${colors.green}✓ Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Errors: ${errors}${colors.reset}`);
    console.log(`${colors.blue}ℹ New: ${newTests}${colors.reset}`);

    // Save JSON report
    const reportPath = join(
      CONFIG.reportDir,
      `visual-regression-${Date.now()}.json`,
    );

    const report = {
      timestamp: new Date().toISOString(),
      mode: this.mode,
      config: CONFIG,
      summary: {
        total: this.results.length,
        passed,
        failed,
        errors,
        new: newTests,
        passRate:
          this.results.length > 0
            ? ((passed / this.results.length) * 100).toFixed(2)
            : 0,
      },
      results: this.results,
    };

    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log.success(`\nReport saved: ${reportPath}`);

    // Print failed tests
    if (failed > 0) {
      console.log(
        `\n${colors.red}${colors.bright}Failed Tests:${colors.reset}`,
      );
      this.results
        .filter((r) => r.status === "failed")
        .forEach((result) => {
          console.log(
            `  ${colors.red}✗${colors.reset} ${result.page} (${result.diffPercentage?.toFixed(2)}%)`,
          );
        });
    }

    // Exit with error code if tests failed
    if (failed > 0 || errors > 0) {
      process.exit(1);
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const mode =
    args.includes("--baseline") || args.includes("-b") ? "baseline" : "compare";

  const tester = new VisualRegressionTester(mode);

  try {
    await tester.init();
    await tester.runTests();
    tester.generateReport();
  } catch (error) {
    log.error("Visual regression testing failed");
    console.error(error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { VisualRegressionTester, CONFIG, PAGES_TO_TEST };
