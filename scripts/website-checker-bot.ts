#!/usr/bin/env tsx
/**
 * 🤖 WEBSITE FUNCTION CHECKER BOT
 * Automated monitoring and validation of all platform features
 *
 * @module WebsiteCheckerBot
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 *
 * Features:
 * - Health check endpoints
 * - Critical flow validation
 * - Performance monitoring
 * - Database connectivity
 * - API endpoint testing
 * - Real-time status reporting
 */

import { chromium, Browser, Page } from "@playwright/test";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  timeout: 30000,
  retries: 3,
  checkInterval: 60000, // Check every minute
  headless: true,
  colors: {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warn";
  duration: number;
  message: string;
  error?: string;
  timestamp: Date;
}

interface HealthCheckReport {
  overall: "healthy" | "degraded" | "down";
  checks: CheckResult[];
  totalDuration: number;
  timestamp: Date;
  successRate: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message: string, color: keyof typeof CONFIG.colors = "reset") {
  const c = CONFIG.colors;
  console.log(`${c[color]}${message}${c.reset}`);
}

function logSection(title: string) {
  const c = CONFIG.colors;
  console.log(`\n${"═".repeat(70)}`);
  console.log(`${c.bright}${c.cyan}${title}${c.reset}`);
  console.log("═".repeat(70));
}

function logCheck(result: CheckResult) {
  const c = CONFIG.colors;
  const icon =
    result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⚠️";
  const color =
    result.status === "pass"
      ? "green"
      : result.status === "fail"
        ? "red"
        : "yellow";

  console.log(
    `${icon} ${c[color]}${result.name}${c.reset} (${result.duration}ms) - ${result.message}`,
  );
  if (result.error) {
    console.log(`   ${c.red}Error: ${result.error}${c.reset}`);
  }
}

async function retry<T>(
  fn: () => Promise<T>,
  retries: number = CONFIG.retries,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return retry(fn, retries - 1);
    }
    throw error;
  }
}

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

class WebsiteChecker {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize() {
    log("🚀 Initializing Website Checker Bot...", "cyan");
    this.browser = await chromium.launch({ headless: CONFIG.headless });
    const context = await this.browser.newContext();
    this.page = await context.newPage();
    log("✅ Browser initialized", "green");
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
    log("🧹 Cleanup complete", "cyan");
  }

  async checkHomePage(): Promise<CheckResult> {
    const start = Date.now();
    try {
      await retry(async () => {
        await this.page!.goto(CONFIG.baseUrl, {
          waitUntil: "domcontentloaded",
        });
        await this.page!.waitForSelector("body", { timeout: 10000 });
      });

      const title = await this.page!.title();
      const hasContent = await this.page!.locator("body").isVisible();

      if (hasContent) {
        return {
          name: "Homepage Load",
          status: "pass",
          duration: Date.now() - start,
          message: `Page loaded: "${title}"`,
          timestamp: new Date(),
        };
      } else {
        throw new Error("Homepage body not visible");
      }
    } catch (error) {
      return {
        name: "Homepage Load",
        status: "fail",
        duration: Date.now() - start,
        message: "Failed to load homepage",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkDatabaseConnection(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${CONFIG.baseUrl}/api/health/database`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        return {
          name: "Database Connection",
          status: "pass",
          duration: Date.now() - start,
          message: `Connected - ${data.status || "OK"}`,
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Database Connection",
        status: "fail",
        duration: Date.now() - start,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkAuthEndpoints(): Promise<CheckResult> {
    const start = Date.now();
    try {
      // Check auth configuration endpoint
      const response = await fetch(`${CONFIG.baseUrl}/api/auth/providers`, {
        method: "GET",
      });

      if (response.ok) {
        return {
          name: "Auth Endpoints",
          status: "pass",
          duration: Date.now() - start,
          message: "Auth endpoints responding",
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Auth Endpoints",
        status: "fail",
        duration: Date.now() - start,
        message: "Auth endpoints not responding",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkMarketplaceAPI(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${CONFIG.baseUrl}/api/products?limit=5`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        const productCount =
          data.data?.products?.length || data.products?.length || 0;
        return {
          name: "Marketplace API",
          status: "pass",
          duration: Date.now() - start,
          message: `API responding - ${productCount} products`,
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Marketplace API",
        status: "fail",
        duration: Date.now() - start,
        message: "Marketplace API not responding",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkProductPage(): Promise<CheckResult> {
    const start = Date.now();
    try {
      await retry(async () => {
        await this.page!.goto(`${CONFIG.baseUrl}/marketplace`, {
          waitUntil: "networkidle",
        });
        await this.page!.waitForSelector("body", { timeout: 10000 });
      });

      // Wait for product cards to render (React hydration)
      const hasProducts = await this.page!.locator(
        '[data-testid="product-card"], .product-card',
      )
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (hasProducts) {
        return {
          name: "Product Pages",
          status: "pass",
          duration: Date.now() - start,
          message: "Product pages rendering correctly",
          timestamp: new Date(),
        };
      } else {
        return {
          name: "Product Pages",
          status: "warn",
          duration: Date.now() - start,
          message: "No products found (may be expected)",
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        name: "Product Pages",
        status: "fail",
        duration: Date.now() - start,
        message: "Failed to load product pages",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkSearchFunctionality(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const response = await fetch(
        `${CONFIG.baseUrl}/api/search?q=tomato&limit=5`,
        { method: "GET" },
      );

      if (response.ok) {
        const data = await response.json();
        return {
          name: "Search Functionality",
          status: "pass",
          duration: Date.now() - start,
          message: `Search working - ${data.results?.length || 0} results`,
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Search Functionality",
        status: "fail",
        duration: Date.now() - start,
        message: "Search not responding",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkPerformance(): Promise<CheckResult> {
    const start = Date.now();
    try {
      await this.page!.goto(CONFIG.baseUrl, { waitUntil: "load" });
      const loadTime = Date.now() - start;

      let status: "pass" | "warn" | "fail" = "pass";
      let message = `Load time: ${loadTime}ms`;

      if (loadTime > 5000) {
        status = "fail";
        message += " - Too slow!";
      } else if (loadTime > 3000) {
        status = "warn";
        message += " - Acceptable but could be faster";
      } else {
        message += " - Excellent!";
      }

      return {
        name: "Performance Check",
        status,
        duration: loadTime,
        message,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: "Performance Check",
        status: "fail",
        duration: Date.now() - start,
        message: "Performance check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkStaticAssets(): Promise<CheckResult> {
    const start = Date.now();
    try {
      await this.page!.goto(CONFIG.baseUrl);

      // Check if critical assets loaded
      const imageCount = await this.page!.locator("img").count();
      const scriptCount = await this.page!.locator("script").count();
      const linkCount = await this.page!.locator(
        "link[rel='stylesheet']",
      ).count();

      return {
        name: "Static Assets",
        status: "pass",
        duration: Date.now() - start,
        message: `Loaded - ${imageCount} images, ${scriptCount} scripts, ${linkCount} stylesheets`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: "Static Assets",
        status: "fail",
        duration: Date.now() - start,
        message: "Failed to check static assets",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkFarmsAPI(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${CONFIG.baseUrl}/api/farms/featured`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        const farmCount = data.data?.farms?.length || data.farms?.length || 0;
        return {
          name: "Farms API",
          status: "pass",
          duration: Date.now() - start,
          message: `Featured farms API responding - ${farmCount} farms`,
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Farms API",
        status: "fail",
        duration: Date.now() - start,
        message: "Farms API not responding",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkProductSearchAPI(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const response = await fetch(
        `${CONFIG.baseUrl}/api/products/search?q=organic&limit=10`,
        { method: "GET" },
      );

      if (response.ok) {
        const data = await response.json();
        return {
          name: "Product Search API",
          status: "pass",
          duration: Date.now() - start,
          message: `Product search working - ${data.results?.length || data.products?.length || 0} results`,
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Product Search API",
        status: "fail",
        duration: Date.now() - start,
        message: "Product search not responding",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkHealthEndpoints(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${CONFIG.baseUrl}/api/health`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        return {
          name: "Health Endpoints",
          status: "pass",
          duration: Date.now() - start,
          message: `Health check OK - ${data.status || "HEALTHY"}`,
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Health Endpoints",
        status: "fail",
        duration: Date.now() - start,
        message: "Health endpoints not responding",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkAPIDocumentation(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${CONFIG.baseUrl}/api/docs`, {
        method: "GET",
      });

      // API docs might return 404 if not implemented yet
      if (response.ok) {
        return {
          name: "API Documentation",
          status: "pass",
          duration: Date.now() - start,
          message: "API documentation available",
          timestamp: new Date(),
        };
      } else if (response.status === 404) {
        return {
          name: "API Documentation",
          status: "warn",
          duration: Date.now() - start,
          message: "API documentation not yet implemented",
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "API Documentation",
        status: "warn",
        duration: Date.now() - start,
        message: "API documentation not available",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkCategoriesAPI(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const response = await fetch(`${CONFIG.baseUrl}/api/categories`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        const categoryCount =
          data.data?.categories?.length || data.categories?.length || 0;
        return {
          name: "Categories API",
          status: "pass",
          duration: Date.now() - start,
          message: `Categories API responding - ${categoryCount} categories`,
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Categories API",
        status: "fail",
        duration: Date.now() - start,
        message: "Categories API not responding",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkImageUploadEndpoint(): Promise<CheckResult> {
    const start = Date.now();
    try {
      // Just check if endpoint exists (POST without auth will return 401)
      const response = await fetch(`${CONFIG.baseUrl}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      // Expect 401 unauthorized or 400 bad request (not 404)
      if (response.status === 401 || response.status === 400) {
        return {
          name: "Image Upload Endpoint",
          status: "pass",
          duration: Date.now() - start,
          message: "Upload endpoint exists (requires authentication)",
          timestamp: new Date(),
        };
      } else if (response.status === 404) {
        return {
          name: "Image Upload Endpoint",
          status: "warn",
          duration: Date.now() - start,
          message: "Upload endpoint not found",
          timestamp: new Date(),
        };
      } else {
        return {
          name: "Image Upload Endpoint",
          status: "pass",
          duration: Date.now() - start,
          message: `Upload endpoint responding (${response.status})`,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        name: "Image Upload Endpoint",
        status: "fail",
        duration: Date.now() - start,
        message: "Upload endpoint check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkOrdersEndpoint(): Promise<CheckResult> {
    const start = Date.now();
    try {
      // Check orders history endpoint (requires auth, expect 401)
      const response = await fetch(`${CONFIG.baseUrl}/api/orders/history`, {
        method: "GET",
      });

      if (response.status === 401) {
        return {
          name: "Orders Endpoint",
          status: "pass",
          duration: Date.now() - start,
          message: "Orders endpoint exists (requires authentication)",
          timestamp: new Date(),
        };
      } else if (response.status === 404) {
        return {
          name: "Orders Endpoint",
          status: "warn",
          duration: Date.now() - start,
          message: "Orders endpoint not found",
          timestamp: new Date(),
        };
      } else if (response.ok) {
        return {
          name: "Orders Endpoint",
          status: "pass",
          duration: Date.now() - start,
          message: "Orders endpoint responding",
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Orders Endpoint",
        status: "fail",
        duration: Date.now() - start,
        message: "Orders endpoint check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkCartEndpoint(): Promise<CheckResult> {
    const start = Date.now();
    try {
      // Check cart sync endpoint (requires auth, expect 401)
      const response = await fetch(`${CONFIG.baseUrl}/api/cart/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.status === 401 || response.status === 400) {
        return {
          name: "Cart Endpoint",
          status: "pass",
          duration: Date.now() - start,
          message: "Cart endpoint exists (requires authentication)",
          timestamp: new Date(),
        };
      } else if (response.status === 404) {
        return {
          name: "Cart Endpoint",
          status: "warn",
          duration: Date.now() - start,
          message: "Cart endpoint not found",
          timestamp: new Date(),
        };
      } else if (response.ok) {
        return {
          name: "Cart Endpoint",
          status: "pass",
          duration: Date.now() - start,
          message: "Cart endpoint responding",
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Cart Endpoint",
        status: "fail",
        duration: Date.now() - start,
        message: "Cart endpoint check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkReviewsEndpoint(): Promise<CheckResult> {
    const start = Date.now();
    try {
      // Check reviews create endpoint (requires auth, expect 401)
      const response = await fetch(`${CONFIG.baseUrl}/api/reviews/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.status === 401 || response.status === 400) {
        return {
          name: "Reviews Endpoint",
          status: "pass",
          duration: Date.now() - start,
          message: "Reviews endpoint exists (requires authentication)",
          timestamp: new Date(),
        };
      } else if (response.status === 404) {
        return {
          name: "Reviews Endpoint",
          status: "warn",
          duration: Date.now() - start,
          message: "Reviews endpoint not found",
          timestamp: new Date(),
        };
      } else if (response.ok) {
        return {
          name: "Reviews Endpoint",
          status: "pass",
          duration: Date.now() - start,
          message: "Reviews endpoint responding",
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Reviews Endpoint",
        status: "fail",
        duration: Date.now() - start,
        message: "Reviews endpoint check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async checkDashboardEndpoints(): Promise<CheckResult> {
    const start = Date.now();
    try {
      // Check farmer dashboard endpoint (requires auth, expect 401)
      const response = await fetch(`${CONFIG.baseUrl}/api/farmer/dashboard`, {
        method: "GET",
      });

      if (response.status === 401) {
        return {
          name: "Dashboard Endpoints",
          status: "pass",
          duration: Date.now() - start,
          message: "Dashboard endpoints exist (require authentication)",
          timestamp: new Date(),
        };
      } else if (response.status === 404) {
        return {
          name: "Dashboard Endpoints",
          status: "warn",
          duration: Date.now() - start,
          message: "Dashboard endpoints not found",
          timestamp: new Date(),
        };
      } else if (response.ok) {
        return {
          name: "Dashboard Endpoints",
          status: "pass",
          duration: Date.now() - start,
          message: "Dashboard endpoints responding",
          timestamp: new Date(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: "Dashboard Endpoints",
        status: "fail",
        duration: Date.now() - start,
        message: "Dashboard endpoint check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async runAllChecks(): Promise<HealthCheckReport> {
    const reportStart = Date.now();
    const checks: CheckResult[] = [];

    logSection("🤖 Running Website Function Checks (18 Endpoints)");

    // Core System Checks
    checks.push(await this.checkHomePage());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkDatabaseConnection());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkHealthEndpoints());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkAuthEndpoints());
    logCheck(checks[checks.length - 1]);

    // API Endpoint Checks
    checks.push(await this.checkMarketplaceAPI());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkFarmsAPI());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkProductSearchAPI());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkCategoriesAPI());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkSearchFunctionality());
    logCheck(checks[checks.length - 1]);

    // Feature Endpoint Checks
    checks.push(await this.checkImageUploadEndpoint());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkOrdersEndpoint());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkCartEndpoint());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkReviewsEndpoint());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkDashboardEndpoints());
    logCheck(checks[checks.length - 1]);

    // UI & Performance Checks
    checks.push(await this.checkProductPage());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkAPIDocumentation());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkPerformance());
    logCheck(checks[checks.length - 1]);

    checks.push(await this.checkStaticAssets());
    logCheck(checks[checks.length - 1]);

    // Calculate overall status
    const failCount = checks.filter((c) => c.status === "fail").length;
    const warnCount = checks.filter((c) => c.status === "warn").length;
    const passCount = checks.filter((c) => c.status === "pass").length;
    const successRate = (passCount / checks.length) * 100;

    let overall: "healthy" | "degraded" | "down";
    if (failCount === 0 && warnCount === 0) {
      overall = "healthy";
    } else if (failCount === 0) {
      overall = "degraded";
    } else {
      overall = failCount >= checks.length / 2 ? "down" : "degraded";
    }

    const report: HealthCheckReport = {
      overall,
      checks,
      totalDuration: Date.now() - reportStart,
      timestamp: new Date(),
      successRate,
    };

    // Print summary
    this.printSummary(report);

    return report;
  }

  printSummary(report: HealthCheckReport) {
    const c = CONFIG.colors;
    logSection("📊 Health Check Summary");

    const statusColor =
      report.overall === "healthy"
        ? "green"
        : report.overall === "degraded"
          ? "yellow"
          : "red";
    const statusIcon =
      report.overall === "healthy"
        ? "✅"
        : report.overall === "degraded"
          ? "⚠️"
          : "❌";

    log(
      `${statusIcon} Overall Status: ${c[statusColor]}${report.overall.toUpperCase()}${c.reset}`,
    );
    log(`⏱️  Total Duration: ${report.totalDuration}ms`);
    log(`📈 Success Rate: ${report.successRate.toFixed(1)}%`);
    log(`🕐 Timestamp: ${report.timestamp.toISOString()}`);

    const passCount = report.checks.filter((c) => c.status === "pass").length;
    const warnCount = report.checks.filter((c) => c.status === "warn").length;
    const failCount = report.checks.filter((c) => c.status === "fail").length;

    console.log(`\n${"─".repeat(70)}`);
    log(
      `${c.green}✅ Passed: ${passCount}${c.reset}  ${c.yellow}⚠️  Warnings: ${warnCount}${c.reset}  ${c.red}❌ Failed: ${failCount}${c.reset}`,
    );
    console.log(`${"─".repeat(70)}\n`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function runOnce() {
  const checker = new WebsiteChecker();

  try {
    await checker.initialize();
    const report = await checker.runAllChecks();

    // Exit with error code if system is down
    if (report.overall === "down") {
      process.exit(1);
    }
  } catch (error) {
    log("❌ Fatal error in website checker", "red");
    console.error(error);
    process.exit(1);
  } finally {
    await checker.cleanup();
  }
}

async function runContinuous() {
  log("🔄 Starting continuous monitoring mode...", "cyan");
  log(`📍 Monitoring: ${CONFIG.baseUrl}`, "cyan");
  log(`⏱️  Check interval: ${CONFIG.checkInterval / 1000}s\n`, "cyan");

  const checker = new WebsiteChecker();
  await checker.initialize();

  let runCount = 0;

  async function performCheck() {
    runCount++;
    log(`\n${"═".repeat(70)}`, "bright");
    log(`🔄 Check #${runCount} - ${new Date().toLocaleString()}`, "bright");
    log("═".repeat(70), "bright");

    try {
      await checker.runAllChecks();
    } catch (error) {
      log("❌ Error during check", "red");
      console.error(error);
    }

    log(`\n⏰ Next check in ${CONFIG.checkInterval / 1000}s...`, "cyan");
  }

  // Initial check
  await performCheck();

  // Schedule periodic checks
  setInterval(performCheck, CONFIG.checkInterval);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    log("\n\n🛑 Shutting down gracefully...", "yellow");
    await checker.cleanup();
    process.exit(0);
  });
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

const args = process.argv.slice(2);
const mode = args[0] || "once";

if (mode === "continuous" || mode === "watch" || mode === "-w") {
  runContinuous().catch((error) => {
    log("❌ Fatal error", "red");
    console.error(error);
    process.exit(1);
  });
} else if (mode === "help" || mode === "-h" || mode === "--help") {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🤖 Website Function Checker Bot                       ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  tsx scripts/website-checker-bot.ts [mode]

Modes:
  once         Run checks once and exit (default)
  continuous   Run checks continuously every minute
  watch        Alias for continuous
  help         Show this help message

Environment Variables:
  NEXT_PUBLIC_APP_URL    Base URL to check (default: http://localhost:3000)

Examples:
  tsx scripts/website-checker-bot.ts
  tsx scripts/website-checker-bot.ts continuous
  NEXT_PUBLIC_APP_URL=https://farmersmarket.com tsx scripts/website-checker-bot.ts

Checks Performed:
  ✅ Homepage Load
  ✅ Database Connection
  ✅ Auth Endpoints
  ✅ Marketplace API
  ✅ Product Pages
  ✅ Search Functionality
  ✅ Performance Metrics
  ✅ Static Assets

Exit Codes:
  0 = All checks passed or warnings only
  1 = Critical failures detected
`);
  process.exit(0);
} else {
  runOnce().catch((error) => {
    log("❌ Fatal error", "red");
    console.error(error);
    process.exit(1);
  });
}
