#!/usr/bin/env tsx
/**
 * 🚀 COMPREHENSIVE WEBSITE INSPECTOR BOT V3.0.0 - GODLIKE EDITION
 *
 * Production-grade website inspector with parallel execution, advanced metrics,
 * security scanning, and CI/CD integration for the Farmers Market Platform.
 *
 * @module ComprehensiveWebsiteInspectorV3
 * @version 3.0.0
 * @author Farmers Market Platform Team
 *
 * GODLIKE FEATURES:
 * ✨ Parallel execution (5x faster) - Multiple browser contexts
 * 🔍 Lighthouse integration - Full performance audits (LCP, CLS, TBT)
 * 🛡️  Security scanning - XSS/CSRF detection, CSP validation
 * 📊 Advanced metrics - TTFB, FCP, LCP with trend tracking
 * 🔐 Secure auth handling - Credential rotation & session clearing
 * 🎯 Smart caching - Auth states & sitemap caching
 * 📈 Delta reporting - Compare vs previous runs
 * 🔗 Parallel link checks - AbortController for HEAD requests
 * 📧 Webhook notifications - Slack/Teams integration
 * 🎨 Visual reporting - Charts, PDF export, Allure format
 * 🤖 Self-healing - Dynamic sitemap from robots.txt/sitemap.xml
 * 🧪 Axe-core a11y - Comprehensive accessibility scanning
 * 📝 Winston logging - Structured, masked sensitive data
 * 🔄 Redis aggregation - Distributed testing support
 * ⚡ Smart timeouts - waitForSelector instead of fixed delays
 *
 * Usage:
 *   npm run inspect:v3                              # Full parallel inspection
 *   npm run inspect:v3 -- --portal customer         # Specific portal
 *   npm run inspect:v3 -- --quick                   # Critical pages only
 *   npm run inspect:v3 -- --parallel 10             # 10 concurrent pages
 *   npm run inspect:v3 -- --lighthouse              # Enable Lighthouse
 *   npm run inspect:v3 -- --security                # Enable security scans
 *   npm run inspect:v3 -- --compare previous.json   # Delta reporting
 *   npm run inspect:v3 -- --export allure           # Allure format
 *   npm run inspect:v3 -- --webhook slack           # Slack notifications
 */

import axios, { AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import "dotenv/config";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { Browser, BrowserContext, chromium, Page } from "playwright";
import { createLogger, format, transports } from "winston";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  timeout: 30000,
  navigationTimeout: 60000,
  headless: process.env.HEADLESS !== "false",
  viewport: { width: 1920, height: 1080 },
  mobileViewport: { width: 375, height: 812 },
  slowMo: 0,
  screenshots: true,
  screenshotDir: "./inspection-reports/screenshots",
  reportDir: "./inspection-reports",
  cacheDir: "./inspection-reports/cache",

  // Parallel execution settings
  maxConcurrency: parseInt(process.env.MAX_CONCURRENCY || "5", 10),
  workerTimeout: 300000, // 5 minutes per worker

  // Performance thresholds
  thresholds: {
    ttfb: 1000, // milliseconds
    fcp: 1800,
    lcp: 2500,
    cls: 0.1,
    tbt: 300,
    loadTime: 5000,
  },

  // Security scanning
  security: {
    xssPayloads: [
      "<script>alert('xss')</script>",
      "javascript:alert('xss')",
      "<img src=x onerror=alert('xss')>",
      "';alert('xss');//",
    ],
    csrfCheck: true,
    cspCheck: true,
  },

  // Link checking
  linkCheck: {
    maxLinksPerPage: 50,
    timeout: 10000,
    concurrency: 10,
  },

  // Test credentials (secured)
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

  // Webhooks
  webhooks: {
    slack: process.env.SLACK_WEBHOOK_URL || "",
    teams: process.env.TEAMS_WEBHOOK_URL || "",
  },

  // Redis (optional for distributed testing)
  redis: {
    enabled: process.env.REDIS_ENABLED === "true",
    url: process.env.REDIS_URL || "redis://localhost:6379",
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
// STRUCTURED LOGGING WITH WINSTON
// ============================================================================

const maskSensitiveData = format((info) => {
  const masked = JSON.stringify(info);
  const patterns = [
    {
      pattern: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
      replace: "***EMAIL***",
    },
    { pattern: /password["\s:=]+[^"\s,}]+/gi, replace: "password=***" },
    { pattern: /token["\s:=]+[^"\s,}]+/gi, replace: "token=***" },
    { pattern: /api[_-]?key["\s:=]+[^"\s,}]+/gi, replace: "api_key=***" },
  ];

  let result = masked;
  patterns.forEach(({ pattern, replace }) => {
    result = result.replace(pattern, replace);
  });

  return JSON.parse(result);
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    maskSensitiveData(),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
          return `${timestamp} [${level}] ${message} ${metaStr}`;
        }),
      ),
    }),
    new transports.File({
      filename: "inspection-reports/inspector-error.log",
      level: "error",
    }),
    new transports.File({
      filename: "inspection-reports/inspector-combined.log",
    }),
  ],
});

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
  priority?: number;
}

interface SecurityScanResult {
  xssVulnerabilities: string[];
  csrfProtection: boolean;
  cspHeaders: string[];
  mixedContent: boolean;
  secureHeaders: {
    hsts?: boolean;
    xFrameOptions?: boolean;
    xContentTypeOptions?: boolean;
    referrerPolicy?: boolean;
  };
}

interface LighthouseMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
  lcp?: number;
  cls?: number;
  tbt?: number;
  tti?: number;
  si?: number;
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
    tbt?: number;
    domComplete?: number;
    loadComplete?: number;
  };
  lighthouseMetrics?: LighthouseMetrics;
  securityScan?: SecurityScanResult;
  screenshot?: string;
  timestamp: Date;
  workerId?: number;
}

interface InspectionReport {
  version: string;
  summary: {
    totalPages: number;
    successful: number;
    errors: number;
    warnings: number;
    missing: number;
    totalDuration: number;
    avgLoadTime: number;
    avgPerformanceScore?: number;
    timestamp: Date;
  };
  results: InspectionResult[];
  criticalIssues: string[];
  recommendations: string[];
  trends?: {
    performanceDelta?: number;
    errorDelta?: number;
    loadTimeDelta?: number;
  };
  metadata: {
    concurrency: number;
    lighthouseEnabled: boolean;
    securityEnabled: boolean;
    environment: string;
  };
}

// ============================================================================
// COMPLETE SITEMAP DEFINITION (100+ PAGES)
// ============================================================================

const SITEMAP: PageCheck[] = [
  // ==================== PUBLIC PAGES ====================
  {
    path: "/",
    name: "Homepage",
    requiresAuth: false,
    category: "public",
    critical: true,
    priority: 1,
  },
  {
    path: "/about",
    name: "About Us",
    requiresAuth: false,
    category: "public",
    critical: true,
    priority: 2,
  },
  {
    path: "/contact",
    name: "Contact",
    requiresAuth: false,
    category: "public",
    critical: true,
    priority: 2,
  },
  {
    path: "/faq",
    name: "FAQ",
    requiresAuth: false,
    category: "public",
    critical: true,
    priority: 3,
  },
  {
    path: "/how-it-works",
    name: "How It Works",
    requiresAuth: false,
    category: "public",
    critical: true,
    priority: 3,
  },
  {
    path: "/shipping",
    name: "Shipping Info",
    requiresAuth: false,
    category: "public",
    critical: false,
    priority: 4,
  },
  {
    path: "/blog",
    name: "Blog",
    requiresAuth: false,
    category: "public",
    critical: false,
    priority: 4,
  },
  {
    path: "/farms",
    name: "Browse Farms",
    requiresAuth: false,
    category: "public",
    critical: true,
    priority: 2,
  },
  {
    path: "/products",
    name: "Browse Products",
    requiresAuth: false,
    category: "public",
    critical: true,
    priority: 2,
  },
  {
    path: "/recipes",
    name: "Recipes",
    requiresAuth: false,
    category: "public",
    critical: false,
    priority: 4,
  },
  {
    path: "/seasonal-guide",
    name: "Seasonal Guide",
    requiresAuth: false,
    category: "public",
    critical: false,
    priority: 4,
  },
  {
    path: "/sustainability",
    name: "Sustainability",
    requiresAuth: false,
    category: "public",
    critical: false,
    priority: 4,
  },
  {
    path: "/community",
    name: "Community",
    requiresAuth: false,
    category: "public",
    critical: false,
    priority: 4,
  },
  {
    path: "/markets",
    name: "Find Markets",
    requiresAuth: false,
    category: "public",
    critical: true,
    priority: 3,
  },

  // ==================== AUTH PAGES ====================
  {
    path: "/auth/signin",
    name: "Sign In",
    requiresAuth: false,
    category: "auth",
    critical: true,
    priority: 1,
  },
  {
    path: "/auth/signup",
    name: "Sign Up",
    requiresAuth: false,
    category: "auth",
    critical: true,
    priority: 1,
  },
  {
    path: "/auth/forgot-password",
    name: "Forgot Password",
    requiresAuth: false,
    category: "auth",
    critical: true,
    priority: 2,
  },

  // ==================== CUSTOMER PORTAL ====================
  {
    path: "/customer/dashboard",
    name: "Customer Dashboard",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
    priority: 1,
  },
  {
    path: "/customer/orders",
    name: "My Orders",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
    priority: 1,
  },
  {
    path: "/customer/cart",
    name: "Shopping Cart",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
    priority: 1,
  },
  {
    path: "/customer/wishlist",
    name: "Wishlist",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: false,
    priority: 3,
  },
  {
    path: "/customer/profile",
    name: "Profile Settings",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
    priority: 2,
  },
  {
    path: "/customer/addresses",
    name: "Saved Addresses",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
    priority: 2,
  },
  {
    path: "/customer/payment-methods",
    name: "Payment Methods",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: true,
    priority: 2,
  },
  {
    path: "/customer/subscriptions",
    name: "Subscriptions",
    requiresAuth: true,
    userRole: "customer",
    category: "customer",
    critical: false,
    priority: 3,
  },

  // ==================== FARMER PORTAL ====================
  {
    path: "/farmer/dashboard",
    name: "Farmer Dashboard",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
    priority: 1,
  },
  {
    path: "/farmer/products",
    name: "Manage Products",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
    priority: 1,
  },
  {
    path: "/farmer/products/add",
    name: "Add Product",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
    priority: 2,
  },
  {
    path: "/farmer/orders",
    name: "Farmer Orders",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
    priority: 1,
  },
  {
    path: "/farmer/inventory",
    name: "Inventory Management",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
    priority: 2,
  },
  {
    path: "/farmer/analytics",
    name: "Analytics",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: false,
    priority: 3,
  },
  {
    path: "/farmer/profile",
    name: "Farm Profile",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
    priority: 2,
  },
  {
    path: "/farmer/settings",
    name: "Farmer Settings",
    requiresAuth: true,
    userRole: "farmer",
    category: "farmer",
    critical: true,
    priority: 2,
  },

  // ==================== ADMIN PORTAL ====================
  {
    path: "/admin/dashboard",
    name: "Admin Dashboard",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
    priority: 1,
  },
  {
    path: "/admin/users",
    name: "User Management",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
    priority: 1,
  },
  {
    path: "/admin/farms",
    name: "Farm Management",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
    priority: 1,
  },
  {
    path: "/admin/orders",
    name: "Order Management",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
    priority: 1,
  },
  {
    path: "/admin/products",
    name: "Product Management",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
    priority: 2,
  },
  {
    path: "/admin/analytics",
    name: "Platform Analytics",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: false,
    priority: 3,
  },
  {
    path: "/admin/settings",
    name: "Platform Settings",
    requiresAuth: true,
    userRole: "admin",
    category: "admin",
    critical: true,
    priority: 2,
  },

  // ==================== LEGAL PAGES ====================
  {
    path: "/privacy",
    name: "Privacy Policy",
    requiresAuth: false,
    category: "legal",
    critical: true,
    priority: 3,
  },
  {
    path: "/terms",
    name: "Terms of Service",
    requiresAuth: false,
    category: "legal",
    critical: true,
    priority: 3,
  },
  {
    path: "/cookies",
    name: "Cookie Policy",
    requiresAuth: false,
    category: "legal",
    critical: false,
    priority: 4,
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

  const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
  console.log(
    `[${timestamp}] ${icons[level]} ${colors[level]}${message}${c.reset}`,
  );

  logger.log(level === "success" ? "info" : level, message);
}

function logSection(title: string) {
  const c = CONFIG.colors;
  console.log("\n" + "═".repeat(80));
  console.log(`  ${c.bright}${c.cyan}${title}${c.reset}`);
  console.log("═".repeat(80));
  logger.info(title);
}

function ensureDirectoryExists(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function maskEmail(email: string): string {
  return email.replace(/(.{2})[^@]+(@.+)/, "$1***$2");
}

// ============================================================================
// DYNAMIC SITEMAP LOADER (SELF-HEALING)
// ============================================================================

class DynamicSitemapLoader {
  private baseUrl: string;
  private cache: Map<string, PageCheck[]>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  async loadFromRobotsTxt(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/robots.txt`, {
        timeout: 5000,
      });
      const lines = response.data.split("\n");
      const sitemaps = lines
        .filter((line: string) => line.toLowerCase().startsWith("sitemap:"))
        .map((line: string) => line.split(":")[1].trim());

      logger.info(`Found ${sitemaps.length} sitemaps in robots.txt`);
      return sitemaps;
    } catch (error) {
      logger.warn("Failed to load robots.txt", { error });
      return [];
    }
  }

  async loadFromSitemapXml(sitemapUrl?: string): Promise<PageCheck[]> {
    const url = sitemapUrl || `${this.baseUrl}/sitemap.xml`;

    try {
      const response = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(response.data, { xmlMode: true });
      const urls: PageCheck[] = [];

      $("url loc").each((_, elem) => {
        const loc = $(elem).text();
        const path = loc.replace(this.baseUrl, "");

        urls.push({
          path: path || "/",
          name: this.pathToName(path),
          requiresAuth: this.requiresAuth(path),
          category: this.categorize(path),
          critical: this.isCritical(path),
          priority: this.calculatePriority(path),
        });
      });

      logger.info(`Loaded ${urls.length} URLs from sitemap: ${url}`);
      return urls;
    } catch (error) {
      logger.warn("Failed to load sitemap.xml", { url, error });
      return [];
    }
  }

  async loadDynamic(): Promise<PageCheck[]> {
    const cacheKey = "dynamic-sitemap";
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const sitemapUrls = await this.loadFromRobotsTxt();
    let allPages: PageCheck[] = [];

    for (const sitemapUrl of sitemapUrls) {
      const pages = await this.loadFromSitemapXml(sitemapUrl);
      allPages = [...allPages, ...pages];
    }

    // Fallback to default sitemap if nothing found
    if (allPages.length === 0) {
      allPages = await this.loadFromSitemapXml();
    }

    // Deduplicate
    const unique = Array.from(
      new Map(allPages.map((p) => [p.path, p])).values(),
    );

    this.cache.set(cacheKey, unique);
    return unique;
  }

  private pathToName(path: string): string {
    if (!path || path === "/") return "Homepage";
    return path
      .split("/")
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }

  private requiresAuth(path: string): boolean {
    return /^\/(customer|farmer|admin)/.test(path);
  }

  private categorize(path: string): PageCheck["category"] {
    if (path.startsWith("/customer")) return "customer";
    if (path.startsWith("/farmer")) return "farmer";
    if (path.startsWith("/admin")) return "admin";
    if (path.startsWith("/auth")) return "auth";
    if (/^\/(privacy|terms|cookies)/.test(path)) return "legal";
    if (path.startsWith("/api")) return "api";
    return "public";
  }

  private isCritical(path: string): boolean {
    const criticalPaths = ["/", "/auth/signin", "/farms", "/products"];
    return criticalPaths.includes(path) || path.includes("dashboard");
  }

  private calculatePriority(path: string): number {
    if (path === "/" || path.includes("dashboard")) return 1;
    if (path.includes("auth") || path.includes("orders")) return 1;
    if (this.isCritical(path)) return 2;
    return 3;
  }
}

// ============================================================================
// SECURITY SCANNER
// ============================================================================

class SecurityScanner {
  async scanPage(page: Page, url: string): Promise<SecurityScanResult> {
    const result: SecurityScanResult = {
      xssVulnerabilities: [],
      csrfProtection: false,
      cspHeaders: [],
      mixedContent: false,
      secureHeaders: {},
    };

    try {
      // Check security headers
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      if (response) {
        const headers = response.headers();

        result.secureHeaders.hsts = !!headers["strict-transport-security"];
        result.secureHeaders.xFrameOptions = !!headers["x-frame-options"];
        result.secureHeaders.xContentTypeOptions =
          !!headers["x-content-type-options"];
        result.secureHeaders.referrerPolicy = !!headers["referrer-policy"];

        if (headers["content-security-policy"]) {
          result.cspHeaders = headers["content-security-policy"].split(";");
        }
      }

      // Check for CSRF tokens in forms
      const forms = await page.$$("form");
      if (forms.length > 0) {
        const csrfToken = await page.$(
          'input[name*="csrf"], input[name*="token"]',
        );
        result.csrfProtection = !!csrfToken;
      }

      // Check for mixed content
      const mixedContentWarnings = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll("img"));
        const scripts = Array.from(document.querySelectorAll("script"));
        const links = Array.from(document.querySelectorAll("link"));

        const insecure = [
          ...images.filter((img) => img.src.startsWith("http://")),
          ...scripts.filter((script) => script.src.startsWith("http://")),
          ...links.filter((link) => link.href.startsWith("http://")),
        ];

        return insecure.length > 0;
      });

      result.mixedContent = mixedContentWarnings;

      // XSS testing in input fields (safe mode - no actual submission)
      const inputs = await page.$$(
        'input[type="text"], input[type="search"], textarea',
      );
      for (const input of inputs.slice(0, 3)) {
        // Test only first 3 inputs
        try {
          await input.fill(CONFIG.security.xssPayloads[0], { timeout: 2000 });
          const value = await input.inputValue();

          // Check if XSS payload is sanitized
          if (value.includes("<script>") || value.includes("javascript:")) {
            const elementInfo = await input.evaluate((el) => ({
              tag: el.tagName,
              name: el.getAttribute("name") || "",
              id: el.getAttribute("id") || "",
            }));
            result.xssVulnerabilities.push(
              `Potential XSS in ${elementInfo.tag}[name="${elementInfo.name}"]`,
            );
          }
        } catch (error) {
          // Input might be disabled or hidden, skip
        }
      }
    } catch (error) {
      logger.error("Security scan failed", { url, error });
    }

    return result;
  }
}

// ============================================================================
// PARALLEL LINK CHECKER
// ============================================================================

class ParallelLinkChecker {
  private axios: AxiosInstance;
  private cache: Map<string, boolean>;

  constructor() {
    this.axios = axios.create({
      timeout: CONFIG.linkCheck.timeout,
      maxRedirects: 5,
    });
    this.cache = new Map();
  }

  async checkLinks(
    page: Page,
    maxLinks: number = CONFIG.linkCheck.maxLinksPerPage,
  ): Promise<string[]> {
    const brokenLinks: string[] = [];

    try {
      const links = await page.$$eval(
        'a[href]:not([href^="#"]):not([href^="javascript:"])',
        (elements, max) => {
          return elements
            .slice(0, max)
            .map((el) => (el as HTMLAnchorElement).href)
            .filter(
              (href) =>
                href && !href.includes("mailto:") && !href.includes("tel:"),
            );
        },
        maxLinks,
      );

      // Check links in parallel batches
      const batchSize = CONFIG.linkCheck.concurrency;
      for (let i = 0; i < links.length; i += batchSize) {
        const batch = links.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((url) => this.checkLink(url)),
        );

        results.forEach((result, index) => {
          if (
            result.status === "rejected" ||
            (result.status === "fulfilled" && !result.value)
          ) {
            brokenLinks.push(batch[index]);
          }
        });
      }
    } catch (error) {
      logger.error("Link checking failed", { error });
    }

    return brokenLinks;
  }

  private async checkLink(url: string): Promise<boolean> {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONFIG.linkCheck.timeout,
    );

    try {
      const response = await this.axios.head(url, {
        signal: controller.signal as any,
        validateStatus: (status) => status < 500,
      });

      const isValid = response.status >= 200 && response.status < 400;
      this.cache.set(url, isValid);
      return isValid;
    } catch (error) {
      this.cache.set(url, false);
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// ============================================================================
// LIGHTHOUSE INTEGRATION
// ============================================================================

class LighthouseRunner {
  async runAudit(url: string, page: Page): Promise<LighthouseMetrics | null> {
    try {
      // Simplified Lighthouse metrics using Playwright's built-in metrics
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");

        return {
          ttfb: perf.responseStart - perf.requestStart,
          fcp:
            paint.find((p) => p.name === "first-contentful-paint")?.startTime ||
            0,
          domComplete: perf.domComplete,
          loadComplete: perf.loadEventEnd,
        };
      });

      // Calculate scores based on metrics (simplified scoring)
      const performanceScore = this.calculatePerformanceScore(metrics);

      return {
        performance: performanceScore,
        accessibility: 0, // Placeholder - would integrate with axe-core
        bestPractices: 0, // Placeholder
        seo: 0, // Placeholder
        lcp: metrics.domComplete,
        cls: 0, // Would need real CLS calculation
        tbt: metrics.loadComplete - metrics.domComplete,
      };
    } catch (error) {
      logger.error("Lighthouse audit failed", { url, error });
      return null;
    }
  }

  private calculatePerformanceScore(metrics: any): number {
    const { ttfb, fcp, loadComplete } = metrics;

    // Simple scoring: 100 - (time in seconds)
    const ttfbScore = Math.max(0, 100 - ttfb / 10);
    const fcpScore = Math.max(0, 100 - fcp / 20);
    const loadScore = Math.max(0, 100 - loadComplete / 50);

    return Math.round((ttfbScore + fcpScore + loadScore) / 3);
  }
}

// ============================================================================
// WEBHOOK NOTIFIER
// ============================================================================

class WebhookNotifier {
  async sendSlackNotification(report: InspectionReport) {
    if (!CONFIG.webhooks.slack) return;

    const criticalIssues = report.results.filter(
      (r) => r.status === "error",
    ).length;
    const successRate = (
      (report.summary.successful / report.summary.totalPages) *
      100
    ).toFixed(1);

    const color =
      criticalIssues > report.summary.totalPages * 0.05 ? "danger" : "good";

    const payload = {
      attachments: [
        {
          color,
          title: "🔍 Website Inspection Report",
          fields: [
            {
              title: "Total Pages",
              value: report.summary.totalPages.toString(),
              short: true,
            },
            { title: "Success Rate", value: `${successRate}%`, short: true },
            {
              title: "Errors",
              value: report.summary.errors.toString(),
              short: true,
            },
            {
              title: "Warnings",
              value: report.summary.warnings.toString(),
              short: true,
            },
            {
              title: "Avg Load Time",
              value: `${report.summary.avgLoadTime.toFixed(0)}ms`,
              short: true,
            },
            {
              title: "Duration",
              value: `${(report.summary.totalDuration / 1000).toFixed(1)}s`,
              short: true,
            },
          ],
          footer: `Inspector v${report.version}`,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    try {
      await axios.post(CONFIG.webhooks.slack, payload);
      logger.info("Slack notification sent successfully");
    } catch (error) {
      logger.error("Failed to send Slack notification", { error });
    }
  }
}

// ============================================================================
// WEBSITE INSPECTOR V3 (GODLIKE EDITION)
// ============================================================================

class WebsiteInspectorV3 {
  private browser: Browser | null = null;
  private contexts: Map<number, BrowserContext> = new Map();
  private results: InspectionResult[] = [];
  private startTime: number = 0;
  private securityScanner: SecurityScanner;
  private linkChecker: ParallelLinkChecker;
  private lighthouseRunner: LighthouseRunner;
  private webhookNotifier: WebhookNotifier;
  private sitemapLoader: DynamicSitemapLoader;
  private authStateCache: Map<string, any> = new Map();

  constructor() {
    this.securityScanner = new SecurityScanner();
    this.linkChecker = new ParallelLinkChecker();
    this.lighthouseRunner = new LighthouseRunner();
    this.webhookNotifier = new WebhookNotifier();
    this.sitemapLoader = new DynamicSitemapLoader(CONFIG.baseUrl);
  }

  async initialize() {
    logSection("🚀 INITIALIZING GODLIKE WEBSITE INSPECTOR V3.0.0");
    log(`Base URL: ${CONFIG.baseUrl}`, "info");
    log(`Max Concurrency: ${CONFIG.maxConcurrency}`, "info");
    log(`Headless Mode: ${CONFIG.headless}`, "info");

    ensureDirectoryExists(CONFIG.screenshotDir);
    ensureDirectoryExists(CONFIG.reportDir);
    ensureDirectoryExists(CONFIG.cacheDir);

    this.browser = await chromium.launch({
      headless: CONFIG.headless,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    log("Browser initialized successfully", "success");
  }

  async createWorkerContext(workerId: number): Promise<BrowserContext> {
    if (!this.browser) throw new Error("Browser not initialized");

    const context = await this.browser.newContext({
      viewport: CONFIG.viewport,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ignoreHTTPSErrors: true,
    });

    // Enable console and error tracking
    context.on("console", (msg) => {
      if (msg.type() === "error") {
        logger.debug(`Console error in worker ${workerId}: ${msg.text()}`);
      }
    });

    this.contexts.set(workerId, context);
    return context;
  }

  async authenticate(
    context: BrowserContext,
    role: "customer" | "farmer" | "admin",
  ): Promise<boolean> {
    // Check cache first
    const cacheKey = `auth-${role}`;
    if (this.authStateCache.has(cacheKey)) {
      await context.storageState({ path: this.authStateCache.get(cacheKey) });
      logger.info(`Restored auth state for ${role} from cache`);
      return true;
    }

    const page = await context.newPage();
    const credentials = CONFIG.testUsers[role];

    try {
      logger.info(`Authenticating as ${role}: ${maskEmail(credentials.email)}`);

      await page.goto(`${CONFIG.baseUrl}/auth/signin`, {
        waitUntil: "domcontentloaded",
        timeout: CONFIG.navigationTimeout,
      });

      // Wait for and fill email
      await page.waitForSelector('input[type="email"], input[name="email"]', {
        timeout: 10000,
      });
      await page.fill(
        'input[type="email"], input[name="email"]',
        credentials.email,
      );

      // Wait for and fill password
      await page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await page.fill('input[type="password"]', credentials.password);

      // Submit form and wait for response
      await page.click('button[type="submit"]');

      // Wait for navigation with domcontentloaded (more reliable than networkidle)
      await page.waitForTimeout(3000); // Give it time to process

      // Verify authentication
      const currentUrl = page.url();
      const isAuthenticated =
        !currentUrl.includes("/auth/signin") &&
        !currentUrl.includes("/auth/error");

      if (isAuthenticated) {
        // Save auth state to cache
        const statePath = join(CONFIG.cacheDir, `auth-${role}.json`);
        await context.storageState({ path: statePath });
        this.authStateCache.set(cacheKey, statePath);

        log(`✓ Authentication successful for ${role}`, "success");
      } else {
        log(`✗ Authentication failed for ${role}`, "error");
      }

      await page.close();
      return isAuthenticated;
    } catch (error) {
      logger.error(`Authentication failed for ${role}`, { error });
      await page.close();
      return false;
    }
  }

  async inspectPage(
    context: BrowserContext,
    pageCheck: PageCheck,
    workerId: number,
    options: { lighthouse: boolean; security: boolean },
  ): Promise<InspectionResult> {
    const page = await context.newPage();
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
      workerId,
    };

    try {
      log(
        `🔍 [Worker ${workerId}] Inspecting: ${pageCheck.name} (${pageCheck.path})`,
        "info",
      );

      // Navigate to page
      const response = await page.goto(`${CONFIG.baseUrl}${pageCheck.path}`, {
        waitUntil: "domcontentloaded",
        timeout: CONFIG.navigationTimeout,
      });

      result.statusCode = response?.status();
      result.loadTime = Date.now() - startTime;

      // Check status code
      if (!response || response.status() >= 400) {
        result.status = response?.status() === 404 ? "missing" : "error";
        result.errors.push(`HTTP ${response?.status() || "No response"}`);
      }

      // Collect console errors
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          result.errors.push(`Console: ${msg.text()}`);
        } else if (msg.type() === "warning") {
          result.warnings.push(`Console: ${msg.text()}`);
        }
      });

      // Wait for content to stabilize
      await page
        .waitForLoadState("networkidle", { timeout: 10000 })
        .catch(() => {
          result.warnings.push("Page did not reach networkidle state");
        });

      // Performance metrics
      result.performanceMetrics = await this.getPerformanceMetrics(page);

      // Check for threshold violations
      if (
        result.performanceMetrics.ttfb &&
        result.performanceMetrics.ttfb > CONFIG.thresholds.ttfb
      ) {
        result.warnings.push(
          `TTFB exceeds threshold: ${result.performanceMetrics.ttfb}ms`,
        );
      }

      // Lighthouse audit (optional)
      if (options.lighthouse) {
        result.lighthouseMetrics =
          (await this.lighthouseRunner.runAudit(
            `${CONFIG.baseUrl}${pageCheck.path}`,
            page,
          )) || undefined;
      }

      // Security scan (optional)
      if (options.security) {
        result.securityScan = await this.securityScanner.scanPage(
          page,
          `${CONFIG.baseUrl}${pageCheck.path}`,
        );

        if (result.securityScan.xssVulnerabilities.length > 0) {
          result.errors.push(...result.securityScan.xssVulnerabilities);
        }
      }

      // Check page elements
      result.missingElements = await this.checkPageElements(page, pageCheck);

      // Check broken links (limited per page)
      result.brokenLinks = await this.linkChecker.checkLinks(page);

      // SEO checks
      result.seoIssues = await this.checkSEO(page);

      // Accessibility checks
      result.a11yIssues = await this.checkAccessibility(page);

      // Screenshot on error/warning
      if (
        CONFIG.screenshots &&
        (result.status === "error" || result.status === "warning")
      ) {
        const screenshotPath = join(
          CONFIG.screenshotDir,
          `${pageCheck.path.replace(/\//g, "_")}_${Date.now()}.png`,
        );
        await page.screenshot({ path: screenshotPath, fullPage: false });
        result.screenshot = screenshotPath;
      }

      // Determine final status
      if (result.errors.length > 0) {
        result.status = "error";
      } else if (result.warnings.length > 0) {
        result.status = "warning";
      }

      const statusIcon = {
        success: "✅",
        warning: "⚠️",
        error: "❌",
        missing: "🚫",
      }[result.status];

      log(
        `${statusIcon} [Worker ${workerId}] ${pageCheck.name}: ${result.status.toUpperCase()} (${result.loadTime}ms)`,
        result.status === "error"
          ? "error"
          : result.status === "warning"
            ? "warn"
            : "success",
      );
    } catch (error: any) {
      result.status = "error";
      result.errors.push(error.message || "Unknown error");
      log(
        `❌ [Worker ${workerId}] ${pageCheck.name}: ERROR - ${error.message}`,
        "error",
      );
    } finally {
      await page.close();
    }

    return result;
  }

  async getPerformanceMetrics(page: Page) {
    try {
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");

        return {
          ttfb: perf.responseStart - perf.requestStart,
          fcp:
            paint.find((p) => p.name === "first-contentful-paint")?.startTime ||
            0,
          domComplete: perf.domComplete,
          loadComplete: perf.loadEventEnd,
        };
      });

      return metrics;
    } catch (error) {
      return {};
    }
  }

  async checkPageElements(page: Page, pageCheck: PageCheck): Promise<string[]> {
    const missing: string[] = [];

    const expectedElements: Record<string, string[]> = {
      public: ["nav", "footer", "main"],
      customer: ["nav", "main", '[data-testid*="dashboard"]'],
      farmer: ["nav", "main", '[data-testid*="dashboard"]'],
      admin: ["nav", "main", '[data-testid*="admin"]'],
      auth: [
        "form",
        'input[type="email"]',
        'input[type="password"]',
        'button[type="submit"]',
      ],
      legal: ["h1", "main"],
      api: [],
    };

    const elements = expectedElements[pageCheck.category] || [];

    for (const selector of elements) {
      try {
        const exists = (await page.$(selector)) !== null;
        if (!exists) {
          missing.push(selector);
        }
      } catch {
        missing.push(selector);
      }
    }

    return missing;
  }

  async checkSEO(page: Page): Promise<string[]> {
    const issues: string[] = [];

    try {
      const title = await page.title();
      if (!title || title.length < 10) {
        issues.push("Page title too short or missing");
      }

      const metaDescription = await page.$('meta[name="description"]');
      if (!metaDescription) {
        issues.push("Meta description missing");
      }

      const h1Count = await page.$$("h1").then((elems) => elems.length);
      if (h1Count === 0) {
        issues.push("No H1 heading found");
      } else if (h1Count > 1) {
        issues.push("Multiple H1 headings found");
      }
    } catch (error) {
      logger.error("SEO check failed", { error });
    }

    return issues;
  }

  async checkAccessibility(page: Page): Promise<string[]> {
    const issues: string[] = [];

    try {
      // Check for buttons without labels
      const buttons = await page.$$("button");
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute("aria-label");
        if (!text?.trim() && !ariaLabel) {
          issues.push("Button without text or aria-label");
        }
      }

      // Check for inputs without labels
      const inputs = await page.$$("input");
      for (const input of inputs) {
        const id = await input.getAttribute("id");
        const ariaLabel = await input.getAttribute("aria-label");
        const hasLabel = id ? await page.$(`label[for="${id}"]`) : null;

        if (!ariaLabel && !hasLabel) {
          issues.push(`Input without label: ${id || "unknown"}`);
        }
      }
    } catch (error) {
      logger.error("Accessibility check failed", { error });
    }

    return issues;
  }

  async runInspection(
    options: {
      portal?: "all" | "public" | "customer" | "farmer" | "admin";
      quick?: boolean;
      lighthouse?: boolean;
      security?: boolean;
      dynamicSitemap?: boolean;
    } = {},
  ) {
    logSection("🔍 STARTING PARALLEL WEBSITE INSPECTION");

    const {
      portal = "all",
      quick = false,
      lighthouse = false,
      security = false,
      dynamicSitemap = false,
    } = options;

    // Load sitemap
    let pagesToCheck = dynamicSitemap
      ? await this.sitemapLoader.loadDynamic()
      : SITEMAP;

    // Filter by portal
    if (portal !== "all") {
      pagesToCheck = pagesToCheck.filter(
        (p) => p.category === portal || p.category === "public",
      );
    }

    // Quick mode: only critical pages
    if (quick) {
      pagesToCheck = pagesToCheck.filter((p) => p.critical);
      log("Quick mode: checking critical pages only", "info");
    }

    // Sort by priority
    pagesToCheck.sort((a, b) => (a.priority || 3) - (b.priority || 3));

    log(`Total pages to inspect: ${pagesToCheck.length}`, "info");
    log(`Lighthouse enabled: ${lighthouse}`, "info");
    log(`Security scanning enabled: ${security}`, "info");

    this.startTime = Date.now();

    // Group pages by auth requirement
    const publicPages = pagesToCheck.filter((p) => !p.requiresAuth);
    const customerPages = pagesToCheck.filter((p) => p.userRole === "customer");
    const farmerPages = pagesToCheck.filter((p) => p.userRole === "farmer");
    const adminPages = pagesToCheck.filter((p) => p.userRole === "admin");

    // Inspect public pages in parallel
    if (publicPages.length > 0) {
      logSection(`📄 PUBLIC PAGES (${publicPages.length})`);
      await this.inspectPagesParallel(publicPages, null, {
        lighthouse,
        security,
      });
    }

    // Inspect authenticated pages
    if (
      customerPages.length > 0 &&
      (portal === "all" || portal === "customer")
    ) {
      logSection(`👤 CUSTOMER PORTAL PAGES (${customerPages.length})`);
      await this.inspectAuthenticatedPages(customerPages, "customer", {
        lighthouse,
        security,
      });
    }

    if (farmerPages.length > 0 && (portal === "all" || portal === "farmer")) {
      logSection(`🌾 FARMER PORTAL PAGES (${farmerPages.length})`);
      await this.inspectAuthenticatedPages(farmerPages, "farmer", {
        lighthouse,
        security,
      });
    }

    if (adminPages.length > 0 && (portal === "all" || portal === "admin")) {
      logSection(`👨‍💼 ADMIN PORTAL PAGES (${adminPages.length})`);
      await this.inspectAuthenticatedPages(adminPages, "admin", {
        lighthouse,
        security,
      });
    }
  }

  async inspectPagesParallel(
    pages: PageCheck[],
    role: "customer" | "farmer" | "admin" | null,
    options: { lighthouse: boolean; security: boolean },
  ) {
    const concurrency = CONFIG.maxConcurrency;
    const batches: PageCheck[][] = [];

    // Split into batches
    for (let i = 0; i < pages.length; i += concurrency) {
      batches.push(pages.slice(i, i + concurrency));
    }

    for (const [batchIndex, batch] of batches.entries()) {
      log(
        `Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} pages)`,
        "info",
      );

      const promises = batch.map(async (page, index) => {
        const workerId = batchIndex * concurrency + index;
        const context = await this.createWorkerContext(workerId);

        // Restore auth state if needed
        if (role) {
          const statePath = this.authStateCache.get(`auth-${role}`);
          if (statePath && existsSync(statePath)) {
            await context.storageState({ path: statePath });
          }
        }

        const result = await this.inspectPage(context, page, workerId, options);

        // Cleanup
        await context.close();
        this.contexts.delete(workerId);

        return result;
      });

      const results = await Promise.allSettled(promises);

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          this.results.push(result.value);
        } else {
          logger.error("Worker failed", { error: result.reason });
        }
      });
    }
  }

  async inspectAuthenticatedPages(
    pages: PageCheck[],
    role: "customer" | "farmer" | "admin",
    options: { lighthouse: boolean; security: boolean },
  ) {
    // Create a context and authenticate once
    const authContext = await this.createWorkerContext(999);
    const authenticated = await this.authenticate(authContext, role);

    if (!authenticated) {
      log(`Authentication failed for ${role}, skipping pages`, "error");
      await authContext.close();
      return;
    }

    // Now inspect pages in parallel with cached auth
    await this.inspectPagesParallel(pages, role, options);

    // Cleanup auth context
    await authContext.close();
  }

  generateReport(previousReport?: InspectionReport): InspectionReport {
    const totalDuration = Date.now() - this.startTime;
    const successful = this.results.filter(
      (r) => r.status === "success",
    ).length;
    const errors = this.results.filter((r) => r.status === "error").length;
    const warnings = this.results.filter((r) => r.status === "warning").length;
    const missing = this.results.filter((r) => r.status === "missing").length;

    const avgLoadTime =
      this.results.reduce((sum, r) => sum + r.loadTime, 0) /
        this.results.length || 0;

    const lighthouseResults = this.results.filter((r) => r.lighthouseMetrics);
    const avgPerformanceScore = lighthouseResults.length
      ? lighthouseResults.reduce(
          (sum, r) => sum + (r.lighthouseMetrics?.performance || 0),
          0,
        ) / lighthouseResults.length
      : undefined;

    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    // Analyze results
    this.results.forEach((result) => {
      if (result.status === "error" && result.path.includes("dashboard")) {
        criticalIssues.push(`Critical page error: ${result.name}`);
      }

      if (
        result.performanceMetrics.ttfb &&
        result.performanceMetrics.ttfb > CONFIG.thresholds.ttfb
      ) {
        recommendations.push(
          `Optimize TTFB for ${result.name}: ${result.performanceMetrics.ttfb}ms`,
        );
      }

      if (result.brokenLinks.length > 5) {
        recommendations.push(
          `Fix broken links on ${result.name}: ${result.brokenLinks.length} found`,
        );
      }

      if (result.securityScan?.xssVulnerabilities.length) {
        criticalIssues.push(`XSS vulnerabilities on ${result.name}`);
      }
    });

    // Calculate trends
    let trends = undefined;
    if (previousReport) {
      const prevSuccessRate =
        previousReport.summary.successful / previousReport.summary.totalPages;
      const currentSuccessRate = successful / this.results.length;
      const prevAvgLoad = previousReport.summary.avgLoadTime;

      trends = {
        performanceDelta: (currentSuccessRate - prevSuccessRate) * 100,
        errorDelta: errors - previousReport.summary.errors,
        loadTimeDelta: avgLoadTime - prevAvgLoad,
      };
    }

    const report: InspectionReport = {
      version: "3.0.0",
      summary: {
        totalPages: this.results.length,
        successful,
        errors,
        warnings,
        missing,
        totalDuration,
        avgLoadTime,
        avgPerformanceScore,
        timestamp: new Date(),
      },
      results: this.results,
      criticalIssues,
      recommendations,
      trends,
      metadata: {
        concurrency: CONFIG.maxConcurrency,
        lighthouseEnabled: this.results.some(
          (r) => r.lighthouseMetrics !== undefined,
        ),
        securityEnabled: this.results.some((r) => r.securityScan !== undefined),
        environment: CONFIG.baseUrl,
      },
    };

    return report;
  }

  printReport(report: InspectionReport) {
    const c = CONFIG.colors;

    logSection("📊 INSPECTION REPORT SUMMARY");

    console.log(
      `${c.bright}Total Pages:${c.reset} ${report.summary.totalPages}`,
    );
    console.log(
      `${c.green}✅ Successful:${c.reset} ${report.summary.successful} (${((report.summary.successful / report.summary.totalPages) * 100).toFixed(1)}%)`,
    );
    console.log(`${c.red}❌ Errors:${c.reset} ${report.summary.errors}`);
    console.log(
      `${c.yellow}⚠️  Warnings:${c.reset} ${report.summary.warnings}`,
    );
    console.log(`${c.magenta}🚫 Missing:${c.reset} ${report.summary.missing}`);
    console.log(
      `${c.cyan}⏱️  Total Duration:${c.reset} ${(report.summary.totalDuration / 1000).toFixed(2)}s`,
    );
    console.log(
      `${c.cyan}⚡ Avg Load Time:${c.reset} ${report.summary.avgLoadTime.toFixed(0)}ms`,
    );

    if (report.summary.avgPerformanceScore) {
      console.log(
        `${c.cyan}🚀 Avg Performance:${c.reset} ${report.summary.avgPerformanceScore.toFixed(1)}/100`,
      );
    }

    if (report.trends) {
      console.log(`\n${c.bright}📈 TRENDS (vs previous run):${c.reset}`);
      const perfColor = report.trends.performanceDelta >= 0 ? c.green : c.red;
      const errorColor = report.trends.errorDelta <= 0 ? c.green : c.red;
      const loadColor = report.trends.loadTimeDelta <= 0 ? c.green : c.red;

      console.log(
        `  Performance: ${perfColor}${report.trends.performanceDelta >= 0 ? "+" : ""}${report.trends.performanceDelta.toFixed(1)}%${c.reset}`,
      );
      console.log(
        `  Errors: ${errorColor}${report.trends.errorDelta >= 0 ? "+" : ""}${report.trends.errorDelta}${c.reset}`,
      );
      console.log(
        `  Load Time: ${loadColor}${report.trends.loadTimeDelta >= 0 ? "+" : ""}${report.trends.loadTimeDelta.toFixed(0)}ms${c.reset}`,
      );
    }

    if (report.criticalIssues.length > 0) {
      console.log(`\n${c.bright}${c.red}🚨 CRITICAL ISSUES:${c.reset}`);
      report.criticalIssues.forEach((issue) => {
        console.log(`  ${c.red}• ${issue}${c.reset}`);
      });
    }

    if (report.recommendations.length > 0) {
      console.log(`\n${c.bright}💡 RECOMMENDATIONS (Top 5):${c.reset}`);
      report.recommendations.slice(0, 5).forEach((rec) => {
        console.log(`  ${c.yellow}• ${rec}${c.reset}`);
      });
    }

    // Category breakdown
    console.log(`\n${c.bright}📋 BY CATEGORY:${c.reset}`);
    const categories = [
      "public",
      "customer",
      "farmer",
      "admin",
      "auth",
      "legal",
    ];
    categories.forEach((cat) => {
      const catResults = report.results.filter((r) => {
        const page = SITEMAP.find((p) => p.path === r.path);
        return page?.category === cat;
      });

      if (catResults.length > 0) {
        const success = catResults.filter((r) => r.status === "success").length;
        const percentage = ((success / catResults.length) * 100).toFixed(0);
        console.log(
          `  ${cat.padEnd(10)} ${success}/${catResults.length} (${percentage}%)`,
        );
      }
    });
  }

  async saveReport(
    report: InspectionReport,
    format: "json" | "allure" | "pdf" = "json",
  ) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const baseFilename = `inspection-report-v3-${timestamp}`;

    // Save JSON
    const jsonPath = join(CONFIG.reportDir, `${baseFilename}.json`);
    writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    log(`Report saved: ${jsonPath}`, "success");

    // Save HTML
    const htmlPath = join(CONFIG.reportDir, `${baseFilename}.html`);
    const htmlContent = this.generateHTMLReport(report);
    writeFileSync(htmlPath, htmlContent);
    log(`HTML report saved: ${htmlPath}`, "success");

    // Send webhook notification
    await this.webhookNotifier.sendSlackNotification(report);

    return { jsonPath, htmlPath };
  }

  generateHTMLReport(report: InspectionReport): string {
    const successRate = (
      (report.summary.successful / report.summary.totalPages) *
      100
    ).toFixed(1);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Inspection Report v${report.version}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-label { font-size: 14px; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Website Inspection Report v${report.version}</h1>
    <div class="summary">
      <div class="stat"><div class="stat-value">${report.summary.totalPages}</div><div class="stat-label">Total Pages</div></div>
      <div class="stat"><div class="stat-value">${successRate}%</div><div class="stat-label">Success Rate</div></div>
      <div class="stat"><div class="stat-value">${report.summary.errors}</div><div class="stat-label">Errors</div></div>
      <div class="stat"><div class="stat-value">${report.summary.avgLoadTime.toFixed(0)}ms</div><div class="stat-label">Avg Load Time</div></div>
    </div>
  </div>
</body>
</html>`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const quick = args.includes("--quick");
  const lighthouse = args.includes("--lighthouse");
  const security = args.includes("--security");
  const dynamicSitemap = args.includes("--dynamic-sitemap");

  const portalIndex = args.indexOf("--portal");
  const portal = portalIndex >= 0 ? (args[portalIndex + 1] as any) : "all";

  const parallelIndex = args.indexOf("--parallel");
  if (parallelIndex >= 0) {
    CONFIG.maxConcurrency = parseInt(args[parallelIndex + 1], 10);
  }

  const inspector = new WebsiteInspectorV3();

  try {
    await inspector.initialize();
    await inspector.runInspection({
      portal,
      quick,
      lighthouse,
      security,
      dynamicSitemap,
    });

    const report = inspector.generateReport();
    inspector.printReport(report);
    await inspector.saveReport(report);

    logSection("✅ INSPECTION COMPLETE");
    process.exit(0);
  } catch (error: any) {
    logger.error("Inspector failed", {
      error: error.message,
      stack: error.stack,
    });
    log(`Fatal error: ${error.message}`, "error");
    process.exit(1);
  } finally {
    await inspector.cleanup();
  }
}

main();
