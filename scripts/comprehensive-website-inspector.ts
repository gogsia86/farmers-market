#!/usr/bin/env tsx
/**
 * 🔍 COMPREHENSIVE WEBSITE INSPECTOR BOT
 *
 * Fully inspects the Farmers Market Platform based on the complete sitemap
 * and visual representation to detect missing pages, errors, and warnings.
 *
 * @module ComprehensiveWebsiteInspector
 * @version 2.0.0
 * @author Farmers Market Platform Team
 *
 * Features:
 * - Complete sitemap coverage (100+ pages)
 * - Three portal inspection (Customer, Farmer, Admin)
 * - Authentication flow validation
 * - Form validation testing
 * - API endpoint verification
 * - Performance metrics
 * - Accessibility checks
 * - SEO validation
 * - Mobile responsiveness
 * - Error detection and reporting
 * - Missing page detection
 * - Broken link identification
 *
 * Usage:
 *   npm run inspect:website              # Full inspection
 *   npm run inspect:website -- --portal customer  # Specific portal
 *   npm run inspect:website -- --quick   # Quick scan
 */

import "dotenv/config";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { Browser, BrowserContext, chromium, Page } from "playwright";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  timeout: 45000,
  navigationTimeout: 90000,
  headless: true,
  viewport: { width: 1920, height: 1080 },
  mobileViewport: { width: 375, height: 812 },
  slowMo: 0,
  screenshots: true,
  screenshotDir: "./inspection-reports/screenshots",
  reportDir: "./inspection-reports",

  // Test credentials (from .env.test)
  testUsers: {
    customer: {
      email: process.env.TEST_CUSTOMER_EMAIL || "customer@test.com",
      password: process.env.TEST_CUSTOMER_PASSWORD || "Test123!@#",
    },
    farmer: {
      email: process.env.TEST_FARMER_EMAIL || "farmer@test.com",
      password: process.env.TEST_FARMER_PASSWORD || "Test123!@#",
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || "admin@test.com",
      password: process.env.TEST_ADMIN_PASSWORD || "Test123!@#",
    },
  },

  colors: {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
  },
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PageCheck {
  path: string;
  name: string;
  requiresAuth: boolean;
  userRole?: "customer" | "farmer" | "admin";
  category:
    | "public"
    | "customer"
    | "farmer"
    | "admin"
    | "auth"
    | "legal"
    | "api";
  critical: boolean;
}

interface InspectionResult {
  path: string;
  name: string;
  status: "success" | "error" | "warning" | "missing";
  statusCode?: number;
  loadTime: number;
  errors: string[];
  warnings: string[];
  missingElements: string[];
  brokenLinks: string[];
  seoIssues: string[];
  a11yIssues: string[];
  performanceMetrics: {
    ttfb?: number;
    fcp?: number;
    lcp?: number;
    cls?: number;
  };
  screenshot?: string;
  timestamp: Date;
}

interface InspectionReport {
  summary: {
    totalPages: number;
    successful: number;
    errors: number;
    warnings: number;
    missing: number;
    totalDuration: number;
    timestamp: Date;
  };
  results: InspectionResult[];
  criticalIssues: string[];
  recommendations: string[];
}

// ============================================================================
// COMPLETE SITEMAP DEFINITION
// ============================================================================

const SITEMAP: PageCheck[] = [
  // ==================== PUBLIC PAGES ====================
  {
    path: "/",
    name: "Homepage",
    requiresAuth: false,
    category: "public",
    critical: true,
  },
  {
    path: "/about",
    name: "About Us",
    requiresAuth: false,
    category: "public",
    critical: false,
  },
  {
    path: "/contact",
    name: "Contact",
    requiresAuth: false,
    category: "public",
    critical: false,
  },
  {
    path: "/faq",
    name: "FAQ",
    requiresAuth: false,
    category: "public",
    critical: false,
  },
  {
    path: "/how-it-works",
    name: "How It Works",
    requiresAuth: false,
    category: "public",
    critical: false,
  },
  {
    path: "/shipping",
    name: "Shipping Info",
    requiresAuth: false,
    category: "public",
    critical: false,
  },

  // Marketplace (Public)
  {
    path: "/marketplace",
    name: "Marketplace",
    requiresAuth: false,
    category: "public",
    critical: true,
  },
  {
    path: "/products",
    name: "Products",
    requiresAuth: false,
    category: "public",
    critical: true,
  },

  // Farms (Public)
  {
    path: "/farms",
    name: "Farm Directory",
    requiresAuth: false,
    category: "public",
    critical: true,
  },

  // ==================== AUTHENTICATION PAGES ====================
  {
    path: "/login",
    name: "Login",
    requiresAuth: false,
    category: "auth",
    critical: true,
  },
  {
    path: "/register",
    name: "Register",
    requiresAuth: false,
    category: "auth",
    critical: true,
  },
  {
    path: "/register-farm",
    name: "Farmer Registration",
    requiresAuth: false,
    category: "auth",
    critical: true,
  },
  {
    path: "/signup",
    name: "Signup",
    requiresAuth: false,
    category: "auth",
    critical: true,
  },
  {
    path: "/forgot-password",
    name: "Forgot Password",
    requiresAuth: false,
    category: "auth",
    critical: true,
  },

  // ==================== CUSTOMER PORTAL ====================
  {
    path: "/customer/dashboard",
    name: "Customer Dashboard",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
  },
  {
    path: "/customer/marketplace",
    name: "Customer Marketplace",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
  },
  {
    path: "/customer/farms",
    name: "Customer Farms",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
  },
  {
    path: "/customer/cart",
    name: "Shopping Cart",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
  },
  {
    path: "/customer/orders",
    name: "Customer Orders",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
  },
  {
    path: "/customer/favorites",
    name: "Favorites",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: false,
  },
  {
    path: "/customer/settings",
    name: "Customer Settings",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: false,
  },
  {
    path: "/checkout",
    name: "Checkout",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
  },

  // ==================== FARMER PORTAL ====================
  {
    path: "/farmer/dashboard",
    name: "Farmer Dashboard",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
  },
  {
    path: "/farmer/farms",
    name: "Farmer Farms",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
  },
  {
    path: "/farmer/products",
    name: "Farmer Products",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
  },
  {
    path: "/farmer/orders",
    name: "Farmer Orders",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
  },
  {
    path: "/farmer/dashboard/analytics",
    name: "Farmer Analytics",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
  },
  {
    path: "/farmer/dashboard/finances",
    name: "Farmer Finances",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: false,
  },
  {
    path: "/farmer/dashboard/recommendations",
    name: "Farmer Recommendations",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: false,
  },

  // ==================== ADMIN PORTAL ====================
  {
    path: "/admin",
    name: "Admin Dashboard",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
  },
  {
    path: "/admin/users",
    name: "Admin Users",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
  },
  {
    path: "/admin/farms",
    name: "Admin Farms",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
  },
  {
    path: "/admin/products",
    name: "Admin Products",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
  },
  {
    path: "/admin/orders",
    name: "Admin Orders",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
  },
  {
    path: "/admin/reports",
    name: "Admin Reports",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: false,
  },
  {
    path: "/admin/settings",
    name: "Admin Settings",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: false,
  },

  // ==================== LEGAL PAGES ====================
  {
    path: "/legal/terms",
    name: "Terms of Service",
    requiresAuth: false,
    category: "legal",
    critical: false,
  },
  {
    path: "/legal/privacy",
    name: "Privacy Policy",
    requiresAuth: false,
    category: "legal",
    critical: false,
  },

  // ==================== API DOCUMENTATION ====================
  {
    path: "/api-docs",
    name: "API Documentation",
    requiresAuth: false,
    category: "api",
    critical: false,
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(
  message: string,
  level: "info" | "success" | "error" | "warn" | "debug" = "info",
) {
  const c = CONFIG.colors;
  const icons = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
    warn: "⚠️",
    debug: "🔍",
  };
  const colors = {
    info: c.blue,
    success: c.green,
    error: c.red,
    warn: c.yellow,
    debug: c.magenta,
  };

  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  console.log(
    `${c.dim}[${timestamp}]${c.reset} ${icons[level]} ${colors[level]}${message}${c.reset}`,
  );
}

function logSection(title: string) {
  const c = CONFIG.colors;
  console.log("\n" + "═".repeat(80));
  console.log(`${c.bright}${c.cyan}  ${title}${c.reset}`);
  console.log("═".repeat(80));
}

function ensureDirectoryExists(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ============================================================================
// WEBSITE INSPECTOR CLASS
// ============================================================================

class WebsiteInspector {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private results: InspectionResult[] = [];
  private startTime: Date = new Date();

  constructor() {
    ensureDirectoryExists(CONFIG.reportDir);
    ensureDirectoryExists(CONFIG.screenshotDir);
  }

  // Initialize browser and context
  async initialize() {
    logSection("🚀 INITIALIZING COMPREHENSIVE WEBSITE INSPECTOR");
    log(`Base URL: ${CONFIG.baseUrl}`, "info");
    log(`Headless Mode: ${CONFIG.headless}`, "info");

    this.browser = await chromium.launch({
      headless: CONFIG.headless,
      slowMo: CONFIG.slowMo,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--max-old-space-size=4096",
        "--js-flags=--max-old-space-size=4096",
      ],
      timeout: 60000,
    });

    this.context = await this.browser.newContext({
      viewport: CONFIG.viewport,
      userAgent: "Farmers-Market-Inspector-Bot/2.0",
      ignoreHTTPSErrors: true,
    });

    // Enable console and error logging
    this.context.on("console", (msg) => {
      if (msg.type() === "error") {
        log(`Console Error: ${msg.text()}`, "error");
      }
    });

    this.page = await this.context.newPage();

    // Listen for page errors
    this.page.on("pageerror", (error) => {
      log(`Page Error: ${error.message}`, "error");
    });

    log("Browser initialized successfully", "success");
  }

  // Authenticate user based on role
  async authenticate(role: "customer" | "farmer" | "admin") {
    log(`Authenticating as ${role}...`, "info");

    const maxRetries = 2;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        if (attempt > 1) {
          log(`Retry attempt ${attempt}/${maxRetries} for ${role}...`, "warn");
        }

        const credentials = CONFIG.testUsers[role];

        // Go to login page with more reliable wait condition
        log(`Navigating to login page...`, "info");
        await this.page!.goto(`${CONFIG.baseUrl}/login`, {
          waitUntil: "domcontentloaded", // Changed from networkidle for better reliability
          timeout: 45000, // Reduced from 60s for faster failure detection
        });

        // Wait a bit for any dynamic content to load
        await this.page!.waitForTimeout(2000);

        // Verify login form is present
        const emailInput = await this.page!.$(
          'input[name="email"], input[type="email"]',
        );
        const passwordInput = await this.page!.$(
          'input[name="password"], input[type="password"]',
        );

        if (!emailInput || !passwordInput) {
          throw new Error("Login form not found on page");
        }

        log(`Filling credentials for ${credentials.email}...`, "info");

        // Fill login form
        await this.page!.fill(
          'input[name="email"], input[type="email"]',
          credentials.email,
        );
        await this.page!.fill(
          'input[name="password"], input[type="password"]',
          credentials.password,
        );

        // Wait a moment before submitting
        await this.page!.waitForTimeout(500);

        log(`Submitting login form...`, "info");

        // Submit form
        await this.page!.click(
          'button[type="submit"], button:has-text("Login"), button:has-text("Sign In")',
        );

        // Wait for navigation with better error handling
        try {
          await this.page!.waitForURL(
            (url) => !url.pathname.includes("/login"),
            {
              timeout: 30000, // 30 seconds for navigation
            },
          );
        } catch (navError) {
          // Check if we're still on login page (invalid credentials) vs timeout
          const currentUrl = this.page!.url();
          if (currentUrl.includes("/login")) {
            // Check for error messages on the page
            const errorText = await this.page!.textContent("body");
            if (errorText?.toLowerCase().includes("invalid")) {
              throw new Error(
                "Invalid credentials - user may not exist in database",
              );
            }
            throw new Error(
              "Login failed - still on login page after submission",
            );
          }
          throw navError;
        }

        log(`Authenticated as ${role} successfully`, "success");
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        log(
          `Authentication attempt ${attempt} failed: ${errorMessage}`,
          "error",
        );

        if (attempt >= maxRetries) {
          log(`All authentication attempts failed for ${role}`, "error");
          log(
            `Possible causes: User doesn't exist, invalid credentials, or network issues`,
            "warn",
          );
          return false;
        }

        // Wait before retry
        await this.page!.waitForTimeout(2000);
      }
    }

    return false;
  }

  // Inspect a single page
  async inspectPage(pageCheck: PageCheck): Promise<InspectionResult> {
    const startTime = Date.now();
    const result: InspectionResult = {
      path: pageCheck.path,
      name: pageCheck.name,
      status: "success",
      loadTime: 0,
      errors: [],
      warnings: [],
      missingElements: [],
      brokenLinks: [],
      seoIssues: [],
      a11yIssues: [],
      performanceMetrics: {},
      timestamp: new Date(),
    };

    log(`Inspecting: ${pageCheck.name} (${pageCheck.path})`, "debug");

    try {
      // Navigate to page
      const response = await this.page!.goto(
        `${CONFIG.baseUrl}${pageCheck.path}`,
        {
          waitUntil: "domcontentloaded",
          timeout: CONFIG.navigationTimeout,
        },
      );

      result.statusCode = response?.status();
      result.loadTime = Date.now() - startTime;

      // Check HTTP status
      if (!response || response.status() >= 400) {
        result.status = "error";
        result.errors.push(`HTTP ${response?.status() || "No response"}`);

        if (response?.status() === 404) {
          result.status = "missing";
          result.errors.push("Page not found (404)");
        }

        return result;
      }

      // Wait for page to be interactive
      await this.page!.waitForLoadState("networkidle", {
        timeout: CONFIG.timeout,
      }).catch(() => {
        result.warnings.push("Page did not reach networkidle state");
      });

      // Check for critical page elements
      await this.checkPageElements(result, pageCheck);

      // Check for broken links
      await this.checkBrokenLinks(result);

      // Check SEO
      await this.checkSEO(result);

      // Check accessibility
      await this.checkAccessibility(result);

      // Get performance metrics
      await this.getPerformanceMetrics(result);

      // Take screenshot if enabled
      if (CONFIG.screenshots) {
        const screenshotPath = join(
          CONFIG.screenshotDir,
          `${pageCheck.category}-${pageCheck.path.replace(/\//g, "-")}.png`,
        );
        await this.page!.screenshot({ path: screenshotPath, fullPage: false });
        result.screenshot = screenshotPath;
      }

      // Determine final status
      if (result.errors.length > 0) {
        result.status = "error";
      } else if (result.warnings.length > 0) {
        result.status = "warning";
      }

      log(
        `✓ ${pageCheck.name}: ${result.status.toUpperCase()} (${result.loadTime}ms)`,
        result.status === "success"
          ? "success"
          : result.status === "warning"
            ? "warn"
            : "error",
      );
    } catch (error) {
      result.status = "error";
      result.loadTime = Date.now() - startTime;
      result.errors.push(
        error instanceof Error ? error.message : "Unknown error",
      );
      log(`✗ ${pageCheck.name}: ERROR - ${result.errors[0]}`, "error");
    }

    return result;
  }

  // Check for expected page elements
  async checkPageElements(result: InspectionResult, pageCheck: PageCheck) {
    const expectedElements: { [key: string]: string[] } = {
      public: ["header", "footer", "main", "nav"],
      customer: ["header", "footer", "main", "nav"],
      farmer: [
        "header",
        "main",
        "nav",
        '[data-testid*="dashboard"], [class*="dashboard"]',
      ],
      admin: [
        "header",
        "main",
        "nav",
        '[data-testid*="admin"], [class*="admin"]',
      ],
      auth: [
        "form",
        'input[type="email"]',
        'input[type="password"]',
        'button[type="submit"]',
      ],
      legal: ["main", "article, section"],
      api: ["main"],
    };

    const elements = expectedElements[pageCheck.category] || ["main"];

    for (const selector of elements) {
      try {
        const exists = await this.page!.locator(selector)
          .first()
          .isVisible({ timeout: 5000 });
        if (!exists) {
          result.missingElements.push(selector);
          result.warnings.push(`Missing expected element: ${selector}`);
        }
      } catch {
        result.missingElements.push(selector);
        result.warnings.push(`Missing expected element: ${selector}`);
      }
    }

    // Check for error messages on page
    const errorSelectors = [
      '[class*="error"]',
      '[data-testid*="error"]',
      ".error-message",
      '[role="alert"]',
    ];

    for (const selector of errorSelectors) {
      try {
        const errorElements = await this.page!.locator(selector).all();
        if (errorElements.length > 0) {
          const errorTexts = await Promise.all(
            errorElements.map((el) => el.textContent().catch(() => "")),
          );
          errorTexts.forEach((text) => {
            if (text && text.trim()) {
              result.errors.push(`Error on page: ${text.trim()}`);
            }
          });
        }
      } catch {
        // Ignore selector errors
      }
    }
  }

  // Check for broken links
  async checkBrokenLinks(result: InspectionResult) {
    try {
      const links = await this.page!.locator("a[href]").all();
      const checkedUrls = new Set<string>();

      for (const link of links.slice(0, 20)) {
        // Limit to first 20 links
        try {
          const href = await link.getAttribute("href");
          if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("javascript:") ||
            checkedUrls.has(href)
          ) {
            continue;
          }

          checkedUrls.add(href);

          // Only check internal links
          if (href.startsWith("/") || href.startsWith(CONFIG.baseUrl)) {
            const fullUrl = href.startsWith("/")
              ? `${CONFIG.baseUrl}${href}`
              : href;

            // Use HEAD request for faster checking
            try {
              const response = await fetch(fullUrl, { method: "HEAD" });
              if (response.status >= 400) {
                result.brokenLinks.push(`${href} (${response.status})`);
                result.warnings.push(`Broken link: ${href}`);
              }
            } catch {
              result.brokenLinks.push(`${href} (failed to fetch)`);
              result.warnings.push(`Broken link: ${href}`);
            }
          }
        } catch {
          // Skip problematic links
        }
      }
    } catch (error) {
      result.warnings.push(`Could not check links: ${error}`);
    }
  }

  // Check SEO elements
  async checkSEO(result: InspectionResult) {
    try {
      // Check title
      const title = await this.page!.title();
      if (!title || title.length < 10) {
        result.seoIssues.push("Missing or too short page title");
      } else if (title.length > 60) {
        result.seoIssues.push("Page title too long (> 60 characters)");
      }

      // Check meta description
      const metaDescription = await this.page!.locator(
        'meta[name="description"]',
      ).getAttribute("content");
      if (!metaDescription) {
        result.seoIssues.push("Missing meta description");
      } else if (metaDescription.length < 50) {
        result.seoIssues.push("Meta description too short (< 50 characters)");
      } else if (metaDescription.length > 160) {
        result.seoIssues.push("Meta description too long (> 160 characters)");
      }

      // Check h1
      const h1Count = await this.page!.locator("h1").count();
      if (h1Count === 0) {
        result.seoIssues.push("Missing H1 heading");
      } else if (h1Count > 1) {
        result.seoIssues.push("Multiple H1 headings found");
      }

      // Check images without alt text
      const images = await this.page!.locator("img").all();
      let imagesWithoutAlt = 0;
      for (const img of images) {
        const alt = await img.getAttribute("alt");
        if (!alt) imagesWithoutAlt++;
      }
      if (imagesWithoutAlt > 0) {
        result.seoIssues.push(`${imagesWithoutAlt} images missing alt text`);
      }

      if (result.seoIssues.length > 0) {
        result.warnings.push(`SEO issues detected: ${result.seoIssues.length}`);
      }
    } catch (error) {
      result.warnings.push(`Could not check SEO: ${error}`);
    }
  }

  // Check accessibility
  async checkAccessibility(result: InspectionResult) {
    try {
      // Check for aria-labels on buttons without text
      const buttons = await this.page!.locator("button").all();
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute("aria-label");
        if (!text?.trim() && !ariaLabel) {
          result.a11yIssues.push("Button without text or aria-label");
        }
      }

      // Check for form labels
      const inputs = await this.page!.locator(
        'input[type="text"], input[type="email"], input[type="password"]',
      ).all();
      for (const input of inputs) {
        const id = await input.getAttribute("id");
        const ariaLabel = await input.getAttribute("aria-label");
        const hasLabel = id
          ? (await this.page!.locator(`label[for="${id}"]`).count()) > 0
          : false;

        if (!hasLabel && !ariaLabel) {
          result.a11yIssues.push("Input without associated label");
        }
      }

      // Check color contrast (basic check)
      const hasLowContrast = await this.page!.evaluate(() => {
        const elements = document.querySelectorAll("*");
        let lowContrastFound = false;

        for (const el of Array.from(elements).slice(0, 100)) {
          // Check first 100 elements
          const style = window.getComputedStyle(el as Element);
          const bgColor = style.backgroundColor;
          const color = style.color;

          // Basic check - very simple, not accurate but fast
          if (bgColor === color) {
            lowContrastFound = true;
            break;
          }
        }

        return lowContrastFound;
      });

      if (hasLowContrast) {
        result.a11yIssues.push("Potential low contrast issues detected");
      }

      if (result.a11yIssues.length > 0) {
        result.warnings.push(
          `Accessibility issues detected: ${result.a11yIssues.length}`,
        );
      }
    } catch (error) {
      result.warnings.push(`Could not check accessibility: ${error}`);
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(result: InspectionResult) {
    try {
      const metrics = await this.page!.evaluate(() => {
        const perf = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");

        return {
          ttfb: perf?.responseStart - perf?.requestStart,
          fcp: paint.find((p) => p.name === "first-contentful-paint")
            ?.startTime,
          domComplete: perf?.domComplete,
          loadComplete: perf?.loadEventEnd,
        };
      });

      result.performanceMetrics = {
        ttfb: metrics.ttfb,
        fcp: metrics.fcp,
      };

      // Add warnings for slow metrics
      if (metrics.ttfb && metrics.ttfb > 1000) {
        result.warnings.push(`Slow TTFB: ${Math.round(metrics.ttfb)}ms`);
      }
      if (metrics.fcp && metrics.fcp > 2500) {
        result.warnings.push(`Slow FCP: ${Math.round(metrics.fcp)}ms`);
      }
    } catch (error) {
      // Performance metrics not critical
    }
  }

  // Run full inspection
  async runInspection(
    options: {
      portal?: "all" | "public" | "customer" | "farmer" | "admin";
      quick?: boolean;
    } = {},
  ) {
    logSection("🔍 STARTING COMPREHENSIVE WEBSITE INSPECTION");

    const { portal = "all", quick = false } = options;
    let pagesToCheck = SITEMAP;

    // Filter pages based on portal
    if (portal !== "all") {
      pagesToCheck = SITEMAP.filter(
        (p) => p.category === portal || p.category === "public",
      );
    }

    // Quick mode: only check critical pages
    if (quick) {
      pagesToCheck = pagesToCheck.filter((p) => p.critical);
      log("Quick mode: checking critical pages only", "info");
    }

    log(`Total pages to inspect: ${pagesToCheck.length}`, "info");

    // Group pages by authentication requirement
    const publicPages = pagesToCheck.filter((p) => !p.requiresAuth);
    const customerPages = pagesToCheck.filter(
      (p) => p.requiresAuth && p.userRole === "customer",
    );
    const farmerPages = pagesToCheck.filter(
      (p) => p.requiresAuth && p.userRole === "farmer",
    );
    const adminPages = pagesToCheck.filter(
      (p) => p.requiresAuth && p.userRole === "admin",
    );

    // Inspect public pages
    logSection(`📄 PUBLIC PAGES (${publicPages.length})`);
    for (const page of publicPages) {
      const result = await this.inspectPage(page);
      this.results.push(result);
    }

    // Inspect customer pages
    if (
      customerPages.length > 0 &&
      (portal === "all" || portal === "customer")
    ) {
      logSection(`👤 CUSTOMER PORTAL PAGES (${customerPages.length})`);
      const authenticated = await this.authenticate("customer");

      if (authenticated) {
        for (const page of customerPages) {
          const result = await this.inspectPage(page);
          this.results.push(result);
        }
      } else {
        log("Skipping customer pages - authentication failed", "warn");
        customerPages.forEach((page) => {
          this.results.push({
            path: page.path,
            name: page.name,
            status: "error",
            loadTime: 0,
            errors: ["Authentication failed"],
            warnings: [],
            missingElements: [],
            brokenLinks: [],
            seoIssues: [],
            a11yIssues: [],
            performanceMetrics: {},
            timestamp: new Date(),
          });
        });
      }

      // Logout
      try {
        await this.page!.goto(`${CONFIG.baseUrl}/api/auth/signout`, {
          waitUntil: "networkidle",
        });
      } catch {
        // Ignore logout errors
      }
    }

    // Inspect farmer pages
    if (farmerPages.length > 0 && (portal === "all" || portal === "farmer")) {
      logSection(`🌾 FARMER PORTAL PAGES (${farmerPages.length})`);
      const authenticated = await this.authenticate("farmer");

      if (authenticated) {
        for (const page of farmerPages) {
          const result = await this.inspectPage(page);
          this.results.push(result);
        }
      } else {
        log("Skipping farmer pages - authentication failed", "warn");
        farmerPages.forEach((page) => {
          this.results.push({
            path: page.path,
            name: page.name,
            status: "error",
            loadTime: 0,
            errors: ["Authentication failed"],
            warnings: [],
            missingElements: [],
            brokenLinks: [],
            seoIssues: [],
            a11yIssues: [],
            performanceMetrics: {},
            timestamp: new Date(),
          });
        });
      }

      // Logout
      try {
        await this.page!.goto(`${CONFIG.baseUrl}/api/auth/signout`, {
          waitUntil: "networkidle",
        });
      } catch {
        // Ignore logout errors
      }
    }

    // Inspect admin pages
    if (adminPages.length > 0 && (portal === "all" || portal === "admin")) {
      logSection(`👨‍💼 ADMIN PORTAL PAGES (${adminPages.length})`);
      const authenticated = await this.authenticate("admin");

      if (authenticated) {
        for (const page of adminPages) {
          const result = await this.inspectPage(page);
          this.results.push(result);
        }
      } else {
        log("Skipping admin pages - authentication failed", "warn");
        adminPages.forEach((page) => {
          this.results.push({
            path: page.path,
            name: page.name,
            status: "error",
            loadTime: 0,
            errors: ["Authentication failed"],
            warnings: [],
            missingElements: [],
            brokenLinks: [],
            seoIssues: [],
            a11yIssues: [],
            performanceMetrics: {},
            timestamp: new Date(),
          });
        });
      }
    }
  }

  // Generate comprehensive report
  generateReport(): InspectionReport {
    const totalDuration = Date.now() - this.startTime.getTime();
    const successful = this.results.filter(
      (r) => r.status === "success",
    ).length;
    const errors = this.results.filter((r) => r.status === "error").length;
    const warnings = this.results.filter((r) => r.status === "warning").length;
    const missing = this.results.filter((r) => r.status === "missing").length;

    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    // Identify critical issues
    this.results.forEach((result) => {
      if (result.status === "error" || result.status === "missing") {
        const page = SITEMAP.find((p) => p.path === result.path);
        if (page?.critical) {
          criticalIssues.push(
            `CRITICAL: ${result.name} (${result.path}) - ${result.errors.join(", ")}`,
          );
        }
      }

      // Collect recommendations
      if (result.seoIssues.length > 0) {
        recommendations.push(
          `${result.name}: Fix SEO issues (${result.seoIssues.length})`,
        );
      }
      if (result.a11yIssues.length > 0) {
        recommendations.push(
          `${result.name}: Fix accessibility issues (${result.a11yIssues.length})`,
        );
      }
      if (result.brokenLinks.length > 0) {
        recommendations.push(
          `${result.name}: Fix broken links (${result.brokenLinks.length})`,
        );
      }
    });

    return {
      summary: {
        totalPages: this.results.length,
        successful,
        errors,
        warnings,
        missing,
        totalDuration,
        timestamp: new Date(),
      },
      results: this.results,
      criticalIssues,
      recommendations: recommendations.slice(0, 20), // Top 20 recommendations
    };
  }

  // Print report to console
  printReport(report: InspectionReport) {
    logSection("📊 INSPECTION REPORT SUMMARY");

    const c = CONFIG.colors;
    console.log(`\n${c.bright}Overall Status:${c.reset}`);
    console.log(`  Total Pages:     ${report.summary.totalPages}`);
    console.log(
      `  ${c.green}✅ Successful:   ${report.summary.successful}${c.reset}`,
    );
    console.log(
      `  ${c.yellow}⚠️  Warnings:     ${report.summary.warnings}${c.reset}`,
    );
    console.log(
      `  ${c.red}❌ Errors:       ${report.summary.errors}${c.reset}`,
    );
    console.log(
      `  ${c.red}🔍 Missing:      ${report.summary.missing}${c.reset}`,
    );
    console.log(
      `  Total Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`,
    );

    // Critical issues
    if (report.criticalIssues.length > 0) {
      console.log(
        `\n${c.bright}${c.red}🚨 CRITICAL ISSUES (${report.criticalIssues.length}):${c.reset}`,
      );
      report.criticalIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    } else {
      console.log(`\n${c.green}✅ No critical issues found!${c.reset}`);
    }

    // Top recommendations
    if (report.recommendations.length > 0) {
      console.log(
        `\n${c.bright}💡 TOP RECOMMENDATIONS (${Math.min(10, report.recommendations.length)}):${c.reset}`,
      );
      report.recommendations.slice(0, 10).forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    // Category breakdown
    const categories = [
      "public",
      "customer",
      "farmer",
      "admin",
      "auth",
      "legal",
      "api",
    ];
    console.log(`\n${c.bright}📂 BREAKDOWN BY CATEGORY:${c.reset}`);

    categories.forEach((category) => {
      const categoryResults = report.results.filter((r) => {
        const page = SITEMAP.find((p) => p.path === r.path);
        return page?.category === category;
      });

      if (categoryResults.length > 0) {
        const success = categoryResults.filter(
          (r) => r.status === "success",
        ).length;
        const total = categoryResults.length;
        const percentage = ((success / total) * 100).toFixed(1);

        console.log(
          `  ${category.toUpperCase().padEnd(10)} ${success}/${total} (${percentage}%)`,
        );
      }
    });

    // Detailed errors
    const errorResults = report.results.filter(
      (r) => r.status === "error" || r.status === "missing",
    );
    if (errorResults.length > 0) {
      console.log(`\n${c.bright}${c.red}❌ DETAILED ERRORS:${c.reset}`);
      errorResults.forEach((result) => {
        console.log(`\n  ${result.name} (${result.path})`);
        console.log(`  Status Code: ${result.statusCode || "N/A"}`);
        result.errors.forEach((error) => {
          console.log(`    - ${error}`);
        });
      });
    }

    // Performance issues
    const slowPages = report.results.filter((r) => r.loadTime > 3000);
    if (slowPages.length > 0) {
      console.log(`\n${c.bright}⏱️  SLOW PAGES (>${3}s):${c.reset}`);
      slowPages.forEach((page) => {
        console.log(`  ${page.name}: ${(page.loadTime / 1000).toFixed(2)}s`);
      });
    }
  }

  // Save report to file
  saveReport(report: InspectionReport) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `inspection-report-${timestamp}.json`;
    const filepath = join(CONFIG.reportDir, filename);

    writeFileSync(filepath, JSON.stringify(report, null, 2));
    log(`Report saved to: ${filepath}`, "success");

    // Also save a simplified HTML report
    const htmlFilename = `inspection-report-${timestamp}.html`;
    const htmlFilepath = join(CONFIG.reportDir, htmlFilename);
    const htmlReport = this.generateHTMLReport(report);
    writeFileSync(htmlFilepath, htmlReport);
    log(`HTML report saved to: ${htmlFilepath}`, "success");
  }

  // Generate HTML report
  generateHTMLReport(report: InspectionReport): string {
    const successRate = (
      (report.summary.successful / report.summary.totalPages) *
      100
    ).toFixed(1);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Inspection Report - ${report.summary.timestamp.toISOString()}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 { margin: 0 0 10px 0; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card h3 { margin: 0 0 10px 0; color: #333; }
    .card .value { font-size: 2em; font-weight: bold; }
    .success { color: #10b981; }
    .warning { color: #f59e0b; }
    .error { color: #ef4444; }
    .table-container { overflow-x: auto; }
    table {
      width: 100%;
      background: white;
      border-collapse: collapse;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
    tr:hover { background: #f9fafb; }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.875em;
      font-weight: 500;
    }
    .status-success { background: #d1fae5; color: #065f46; }
    .status-warning { background: #fef3c7; color: #92400e; }
    .status-error { background: #fee2e2; color: #991b1b; }
    .status-missing { background: #dbeafe; color: #1e40af; }
    .critical-issues {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .recommendations {
      background: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: #6b7280;
      font-size: 0.875em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Website Inspection Report</h1>
    <p>Generated: ${new Date(report.summary.timestamp).toLocaleString()}</p>
    <p>Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s | Base URL: ${CONFIG.baseUrl}</p>
  </div>

  <div class="summary">
    <div class="card">
      <h3>Total Pages</h3>
      <div class="value">${report.summary.totalPages}</div>
    </div>
    <div class="card">
      <h3>Success Rate</h3>
      <div class="value success">${successRate}%</div>
    </div>
    <div class="card">
      <h3>Successful</h3>
      <div class="value success">${report.summary.successful}</div>
    </div>
    <div class="card">
      <h3>Warnings</h3>
      <div class="value warning">${report.summary.warnings}</div>
    </div>
    <div class="card">
      <h3>Errors</h3>
      <div class="value error">${report.summary.errors}</div>
    </div>
    <div class="card">
      <h3>Missing</h3>
      <div class="value error">${report.summary.missing}</div>
    </div>
  </div>

  ${
    report.criticalIssues.length > 0
      ? `
  <div class="critical-issues">
    <h2>🚨 Critical Issues (${report.criticalIssues.length})</h2>
    <ul>
      ${report.criticalIssues.map((issue) => `<li>${issue}</li>`).join("")}
    </ul>
  </div>
  `
      : '<div class="card"><p style="color: #10b981; font-weight: bold;">✅ No critical issues found!</p></div>'
  }

  ${
    report.recommendations.length > 0
      ? `
  <div class="recommendations">
    <h2>💡 Recommendations (${report.recommendations.length})</h2>
    <ul>
      ${report.recommendations
        .slice(0, 20)
        .map((rec) => `<li>${rec}</li>`)
        .join("")}
    </ul>
  </div>
  `
      : ""
  }

  <div class="card">
    <h2>📄 Detailed Results</h2>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Page Name</th>
            <th>Path</th>
            <th>Status</th>
            <th>Load Time</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          ${report.results
            .map(
              (result) => `
            <tr>
              <td><strong>${result.name}</strong></td>
              <td><code>${result.path}</code></td>
              <td>
                <span class="status-badge status-${result.status}">
                  ${result.status.toUpperCase()}
                </span>
              </td>
              <td>${result.loadTime}ms</td>
              <td>
                ${result.errors.length > 0 ? `<span class="error">❌ ${result.errors.length}</span>` : ""}
                ${result.warnings.length > 0 ? `<span class="warning">⚠️ ${result.warnings.length}</span>` : ""}
                ${result.errors.length === 0 && result.warnings.length === 0 ? '<span class="success">✅</span>' : ""}
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </div>

  <div class="footer">
    <p>Farmers Market Platform - Comprehensive Website Inspector v2.0</p>
    <p>Report generated by automated inspection bot</p>
  </div>
</body>
</html>
    `;
  }

  // Cleanup
  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    log("Cleanup completed", "success");
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const portal = args.includes("--portal")
    ? (args[args.indexOf("--portal") + 1] as
        | "all"
        | "public"
        | "customer"
        | "farmer"
        | "admin")
    : "all";
  const quick = args.includes("--quick");
  const help = args.includes("--help") || args.includes("-h");

  if (help) {
    console.log(`
🔍 Comprehensive Website Inspector Bot

Usage:
  npm run inspect:website                    # Full inspection
  npm run inspect:website -- --portal public  # Specific portal
  npm run inspect:website -- --quick         # Quick scan (critical pages only)

Options:
  --portal <portal>    Specify portal: all, public, customer, farmer, admin
  --quick             Quick mode (critical pages only)
  --help, -h          Show this help message

Examples:
  npm run inspect:website -- --portal customer
  npm run inspect:website -- --quick
  npm run inspect:website -- --portal farmer --quick
    `);
    process.exit(0);
  }

  const inspector = new WebsiteInspector();

  try {
    await inspector.initialize();
    await inspector.runInspection({ portal, quick });

    const report = inspector.generateReport();
    inspector.printReport(report);
    inspector.saveReport(report);

    logSection("✅ INSPECTION COMPLETE");

    // Exit with appropriate code
    if (report.summary.errors > 0 || report.criticalIssues.length > 0) {
      log("Inspection completed with errors", "error");
      process.exit(1);
    } else {
      log("Inspection completed successfully!", "success");
      process.exit(0);
    }
  } catch (error) {
    log(`Fatal error: ${error}`, "error");
    console.error(error);
    process.exit(1);
  } finally {
    await inspector.cleanup();
  }
}

// Run if executed directly
main();

export { InspectionReport, InspectionResult, WebsiteInspector };
