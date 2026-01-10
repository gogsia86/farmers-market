#!/usr/bin/env tsx

/**
 * VERCEL DEPLOYMENT TESTING BOT
 *
 * Comprehensive automated testing suite for Vercel deployments.
 * Tests authentication, API endpoints, database connectivity, performance,
 * and identifies potential issues or improvements.
 *
 * Usage:
 *   tsx scripts/test-vercel-deployment.ts
 *   tsx scripts/test-vercel-deployment.ts --url=https://custom-url.vercel.app
 *   tsx scripts/test-vercel-deployment.ts --quick
 *   tsx scripts/test-vercel-deployment.ts --full --report
 */

import { config } from "dotenv";
config({ path: ".env.vercel.local" });

import https from "https";
import http from "http";

// ============================================================================
// CONFIGURATION
// ============================================================================

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

interface TestResult {
  name: string;
  category: string;
  status: "pass" | "fail" | "warn" | "skip";
  duration: number;
  message?: string;
  details?: any;
  suggestions?: string[];
}

interface TestReport {
  url: string;
  timestamp: string;
  duration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
  };
  results: TestResult[];
  recommendations: string[];
  performance: {
    avgResponseTime: number;
    slowestEndpoint: { url: string; time: number };
    fastestEndpoint: { url: string; time: number };
  };
}

// ============================================================================
// CLI ARGUMENTS
// ============================================================================

const args = process.argv.slice(2);
const baseUrl =
  args.find((arg) => arg.startsWith("--url="))?.split("=")[1] ||
  process.env.BASE_URL ||
  "https://farmers-market-platform.vercel.app";

const isQuickMode = args.includes("--quick");
const isFullMode = args.includes("--full");
const shouldGenerateReport = args.includes("--report");
const isVerbose = args.includes("--verbose") || args.includes("-v");

// Test credentials
const TEST_CREDENTIALS = {
  farmer: {
    email: "farmer1@example.com",
    password: "Farmer123!",
  },
  consumer: {
    email: "consumer@example.com",
    password: "Consumer123!",
  },
  admin: {
    email: "gogsia@gmail.com",
    password: "Admin123!",
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message: string, color: keyof typeof COLORS = "reset") {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logSection(title: string) {
  console.log("\n" + "═".repeat(60));
  log(`  ${title}`, "cyan");
  console.log("═".repeat(60) + "\n");
}

function logTest(
  name: string,
  status: "pass" | "fail" | "warn" | "skip",
  duration?: number,
) {
  const icons = { pass: "✅", fail: "❌", warn: "⚠️", skip: "⏭️" };
  const colors = { pass: "green", fail: "red", warn: "yellow", skip: "blue" };
  const icon = icons[status];
  const durationStr = duration ? ` (${duration}ms)` : "";
  log(`  ${icon} ${name}${durationStr}`, colors[status]);
}

async function makeRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
  } = {},
): Promise<{
  status: number;
  headers: any;
  body: string;
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        "User-Agent": "Vercel-Test-Bot/1.0",
        ...options.headers,
      },
      timeout: options.timeout || 30000,
    };

    const req = client.request(requestOptions, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        const duration = Date.now() - startTime;
        resolve({
          status: res.statusCode || 0,
          headers: res.headers,
          body,
          duration,
        });
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (options.body) {
      req.write(
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body),
      );
    }

    req.end();
  });
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// TEST SUITES
// ============================================================================

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  async runTest(
    name: string,
    category: string,
    testFn: () => Promise<{
      status: "pass" | "fail" | "warn" | "skip";
      message?: string;
      details?: any;
      suggestions?: string[];
    }>,
  ): Promise<void> {
    const start = Date.now();
    try {
      const result = await testFn();
      const duration = Date.now() - start;

      this.results.push({
        name,
        category,
        status: result.status,
        duration,
        message: result.message,
        details: result.details,
        suggestions: result.suggestions,
      });

      if (isVerbose || result.status !== "pass") {
        logTest(name, result.status, duration);
        if (result.message) {
          log(`    ${result.message}`, "yellow");
        }
      } else {
        logTest(name, result.status, duration);
      }
    } catch (error: any) {
      const duration = Date.now() - start;
      this.results.push({
        name,
        category,
        status: "fail",
        duration,
        message: error.message,
      });
      logTest(name, "fail", duration);
      log(`    Error: ${error.message}`, "red");
    }
  }

  // Test: Basic Connectivity
  async testBasicConnectivity(): Promise<any> {
    try {
      const response = await makeRequest(baseUrl);
      if (response.status >= 200 && response.status < 400) {
        return {
          status: "pass",
          details: { statusCode: response.status, duration: response.duration },
        };
      } else {
        return {
          status: "fail",
          message: `Unexpected status code: ${response.status}`,
        };
      }
    } catch (error: any) {
      return {
        status: "fail",
        message: error.message,
        suggestions: [
          "Check if Vercel deployment is live",
          "Verify DNS configuration",
        ],
      };
    }
  }

  // Test: SSL/TLS Certificate
  async testSSLCertificate(): Promise<any> {
    try {
      const response = await makeRequest(baseUrl);
      const isHttps = baseUrl.startsWith("https://");

      if (!isHttps) {
        return {
          status: "warn",
          message: "Site is not using HTTPS",
          suggestions: ["Enable HTTPS for production deployments"],
        };
      }

      return {
        status: "pass",
        message: "HTTPS enabled",
      };
    } catch (error: any) {
      if (error.message.includes("certificate")) {
        return {
          status: "fail",
          message: "SSL certificate issue detected",
          suggestions: ["Check Vercel SSL certificate configuration"],
        };
      }
      throw error;
    }
  }

  // Test: Response Time
  async testResponseTime(): Promise<any> {
    try {
      const response = await makeRequest(baseUrl);
      const responseTime = response.duration;

      if (responseTime < 500) {
        return { status: "pass", message: `Excellent (${responseTime}ms)` };
      } else if (responseTime < 1000) {
        return { status: "pass", message: `Good (${responseTime}ms)` };
      } else if (responseTime < 2000) {
        return {
          status: "warn",
          message: `Slow (${responseTime}ms)`,
          suggestions: [
            "Consider optimizing server-side rendering",
            "Check database query performance",
          ],
        };
      } else {
        return {
          status: "fail",
          message: `Too slow (${responseTime}ms)`,
          suggestions: [
            "Investigate server performance",
            "Check for blocking operations",
          ],
        };
      }
    } catch (error: any) {
      return { status: "fail", message: error.message };
    }
  }

  // Test: Health Endpoint
  async testHealthEndpoint(): Promise<any> {
    try {
      const response = await makeRequest(`${baseUrl}/api/health`);

      if (response.status === 200) {
        try {
          const data = JSON.parse(response.body);
          return {
            status: "pass",
            message: `Health check passed`,
            details: data,
          };
        } catch {
          return {
            status: "warn",
            message: "Health endpoint exists but response is not JSON",
          };
        }
      } else if (response.status === 404) {
        return {
          status: "warn",
          message: "Health endpoint not found",
          suggestions: [
            "Consider adding a /api/health endpoint for monitoring",
          ],
        };
      } else {
        return {
          status: "fail",
          message: `Health check returned ${response.status}`,
        };
      }
    } catch (error: any) {
      return {
        status: "warn",
        message: "Health endpoint unavailable",
      };
    }
  }

  // Test: Authentication Pages
  async testAuthPages(): Promise<any> {
    try {
      const loginResponse = await makeRequest(`${baseUrl}/login`);

      if (loginResponse.status === 200) {
        const hasLoginForm =
          loginResponse.body.includes("login") ||
          loginResponse.body.includes("email") ||
          loginResponse.body.includes("password");

        if (hasLoginForm) {
          return {
            status: "pass",
            message: "Login page accessible",
          };
        } else {
          return {
            status: "warn",
            message: "Login page loads but may be missing form elements",
          };
        }
      } else if (loginResponse.status === 404) {
        return {
          status: "fail",
          message: "Login page not found (404)",
          suggestions: [
            "Check routing configuration",
            "Verify login page exists",
          ],
        };
      } else {
        return {
          status: "fail",
          message: `Login page returned ${loginResponse.status}`,
        };
      }
    } catch (error: any) {
      return {
        status: "fail",
        message: error.message,
      };
    }
  }

  // Test: API Routes
  async testAPIRoutes(): Promise<any> {
    const routes = [
      "/api/health",
      "/api/auth/session",
      "/api/products",
      "/api/farms",
    ];

    const results = [];
    let passCount = 0;

    for (const route of routes) {
      try {
        const response = await makeRequest(`${baseUrl}${route}`, {
          timeout: 5000,
        });
        const isSuccess = response.status >= 200 && response.status < 500;
        if (isSuccess) passCount++;

        results.push({
          route,
          status: response.status,
          duration: response.duration,
        });
      } catch (error: any) {
        results.push({
          route,
          status: "error",
          error: error.message,
        });
      }
    }

    if (passCount === routes.length) {
      return {
        status: "pass",
        message: `All ${routes.length} API routes accessible`,
      };
    } else if (passCount > 0) {
      return {
        status: "warn",
        message: `${passCount}/${routes.length} API routes accessible`,
        details: results,
      };
    } else {
      return {
        status: "fail",
        message: "No API routes accessible",
        details: results,
        suggestions: [
          "Check API route configuration",
          "Verify build completed successfully",
        ],
      };
    }
  }

  // Test: Static Assets
  async testStaticAssets(): Promise<any> {
    const assets = ["/favicon.ico", "/_next/static/css"];

    let passCount = 0;
    const results = [];

    for (const asset of assets) {
      try {
        const response = await makeRequest(`${baseUrl}${asset}`, {
          timeout: 5000,
        });
        if (response.status === 200 || response.status === 304) {
          passCount++;
        }
        results.push({ asset, status: response.status });
      } catch (error) {
        results.push({ asset, status: "error" });
      }
    }

    if (passCount >= assets.length - 1) {
      return { status: "pass", message: "Static assets loading correctly" };
    } else {
      return {
        status: "warn",
        message: "Some static assets may not be loading",
        details: results,
      };
    }
  }

  // Test: Database Connectivity (via API)
  async testDatabaseConnectivity(): Promise<any> {
    try {
      const response = await makeRequest(`${baseUrl}/api/products`);

      if (response.status === 200) {
        try {
          const data = JSON.parse(response.body);
          if (
            Array.isArray(data) ||
            (data.products && Array.isArray(data.products))
          ) {
            return {
              status: "pass",
              message: "Database connection working (products API)",
            };
          }
        } catch {
          // Ignore errors from products API
        }
      }

      // Try farms endpoint
      const farmsResponse = await makeRequest(`${baseUrl}/api/farms`);
      if (farmsResponse.status === 200) {
        return {
          status: "pass",
          message: "Database connection working (farms API)",
        };
      }

      return {
        status: "warn",
        message: "Unable to verify database connectivity",
        suggestions: [
          "Check API endpoints return data",
          "Verify database connection in Vercel",
        ],
      };
    } catch (error: any) {
      return {
        status: "fail",
        message: error.message,
        suggestions: [
          "Check DATABASE_URL environment variable",
          "Verify Prisma connection",
        ],
      };
    }
  }

  // Test: Error Handling
  async testErrorHandling(): Promise<any> {
    try {
      const response = await makeRequest(
        `${baseUrl}/this-page-does-not-exist-12345`,
      );

      if (response.status === 404) {
        const has404Page =
          response.body.includes("404") ||
          response.body.includes("not found") ||
          response.body.includes("Not Found");

        if (has404Page) {
          return {
            status: "pass",
            message: "Custom 404 page implemented",
          };
        } else {
          return {
            status: "warn",
            message: "404 handler exists but may lack custom page",
            suggestions: ["Add a custom 404.tsx page for better UX"],
          };
        }
      } else {
        return {
          status: "warn",
          message: `Non-existent page returned ${response.status} instead of 404`,
        };
      }
    } catch (error: any) {
      return {
        status: "fail",
        message: error.message,
      };
    }
  }

  // Test: Security Headers
  async testSecurityHeaders(): Promise<any> {
    try {
      const response = await makeRequest(baseUrl);
      const headers = response.headers;

      const securityHeaders = {
        "x-frame-options": headers["x-frame-options"],
        "x-content-type-options": headers["x-content-type-options"],
        "strict-transport-security": headers["strict-transport-security"],
        "x-xss-protection": headers["x-xss-protection"],
      };

      const presentHeaders = Object.entries(securityHeaders).filter(
        ([_, value]) => value !== undefined,
      );
      const missingHeaders = Object.entries(securityHeaders).filter(
        ([_, value]) => value === undefined,
      );

      if (presentHeaders.length >= 3) {
        return {
          status: "pass",
          message: `${presentHeaders.length}/4 security headers present`,
          details: securityHeaders,
        };
      } else if (presentHeaders.length > 0) {
        return {
          status: "warn",
          message: `Only ${presentHeaders.length}/4 security headers present`,
          details: securityHeaders,
          suggestions: [
            "Add missing security headers in next.config.js",
            "Consider implementing Content-Security-Policy",
          ],
        };
      } else {
        return {
          status: "warn",
          message: "No security headers detected",
          suggestions: [
            "Add security headers to improve protection",
            "Use Next.js security headers configuration",
          ],
        };
      }
    } catch (error: any) {
      return { status: "fail", message: error.message };
    }
  }

  // Test: Performance Metrics
  async testPerformanceMetrics(): Promise<any> {
    const endpoints = [
      `${baseUrl}`,
      `${baseUrl}/marketplace`,
      `${baseUrl}/api/products`,
    ];

    const timings: number[] = [];

    for (const endpoint of endpoints) {
      try {
        const response = await makeRequest(endpoint, { timeout: 10000 });
        timings.push(response.duration);
      } catch {
        // Skip failed requests
      }
    }

    if (timings.length === 0) {
      return { status: "fail", message: "Could not measure performance" };
    }

    const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
    const maxTime = Math.max(...timings);

    if (avgTime < 500 && maxTime < 1000) {
      return {
        status: "pass",
        message: `Excellent performance (avg: ${Math.round(avgTime)}ms)`,
      };
    } else if (avgTime < 1000 && maxTime < 2000) {
      return {
        status: "pass",
        message: `Good performance (avg: ${Math.round(avgTime)}ms)`,
      };
    } else if (avgTime < 2000) {
      return {
        status: "warn",
        message: `Moderate performance (avg: ${Math.round(avgTime)}ms)`,
        suggestions: [
          "Consider performance optimization",
          "Check for blocking operations",
        ],
      };
    } else {
      return {
        status: "fail",
        message: `Poor performance (avg: ${Math.round(avgTime)}ms)`,
        suggestions: [
          "Optimize server-side rendering",
          "Check database query performance",
          "Consider implementing caching",
        ],
      };
    }
  }

  // Test: SEO Basics
  async testSEOBasics(): Promise<any> {
    try {
      const response = await makeRequest(baseUrl);
      const html = response.body;

      const checks = {
        hasTitle: /<title>/i.test(html),
        hasMetaDescription: /<meta[^>]+name=["']description["']/i.test(html),
        hasMetaViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
        hasCanonical: /<link[^>]+rel=["']canonical["']/i.test(html),
      };

      const passedChecks = Object.values(checks).filter(Boolean).length;

      if (passedChecks >= 3) {
        return {
          status: "pass",
          message: `${passedChecks}/4 SEO basics implemented`,
          details: checks,
        };
      } else if (passedChecks > 0) {
        return {
          status: "warn",
          message: `Only ${passedChecks}/4 SEO basics found`,
          details: checks,
          suggestions: [
            "Add missing meta tags",
            "Implement proper SEO structure",
          ],
        };
      } else {
        return {
          status: "warn",
          message: "Missing basic SEO elements",
          suggestions: ["Add title, meta description, and viewport tags"],
        };
      }
    } catch (error: any) {
      return { status: "fail", message: error.message };
    }
  }

  // Test: Mobile Responsiveness
  async testMobileResponsiveness(): Promise<any> {
    try {
      const response = await makeRequest(baseUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
        },
      });

      if (response.status === 200) {
        const html = response.body;
        const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
        const hasResponsiveClasses = /responsive|container|flex|grid/i.test(
          html,
        );

        if (hasViewport && hasResponsiveClasses) {
          return {
            status: "pass",
            message: "Viewport and responsive elements detected",
          };
        } else if (hasViewport) {
          return {
            status: "warn",
            message: "Viewport meta tag present, verify responsive design",
            suggestions: [
              "Test on actual mobile devices",
              "Use Chrome DevTools mobile emulation",
            ],
          };
        } else {
          return {
            status: "warn",
            message: "Missing viewport meta tag",
            suggestions: ["Add viewport meta tag for mobile support"],
          };
        }
      } else {
        return {
          status: "fail",
          message: `Mobile request returned ${response.status}`,
        };
      }
    } catch (error: any) {
      return { status: "fail", message: error.message };
    }
  }

  // Test: CORS Configuration
  async testCORSConfiguration(): Promise<any> {
    try {
      const response = await makeRequest(`${baseUrl}/api/health`, {
        headers: {
          Origin: "https://example.com",
        },
      });

      const corsHeader = response.headers["access-control-allow-origin"];

      if (corsHeader === "*") {
        return {
          status: "warn",
          message: "CORS allows all origins (*)",
          suggestions: [
            "Consider restricting CORS to specific origins for production",
          ],
        };
      } else if (corsHeader) {
        return {
          status: "pass",
          message: "CORS configured with specific origins",
        };
      } else {
        return {
          status: "pass",
          message: "CORS not enabled (same-origin only)",
        };
      }
    } catch (error: any) {
      return { status: "skip", message: "Unable to test CORS" };
    }
  }

  // Generate Report
  generateReport(): TestReport {
    const duration = Date.now() - this.startTime;
    const summary = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "pass").length,
      failed: this.results.filter((r) => r.status === "fail").length,
      warnings: this.results.filter((r) => r.status === "warn").length,
      skipped: this.results.filter((r) => r.status === "skip").length,
    };

    const responseTimes = this.results
      .filter((r) => r.duration && r.duration > 0)
      .map((r) => ({ name: r.name, duration: r.duration }));

    const avgResponseTime = responseTimes.length
      ? Math.round(
          responseTimes.reduce((sum, r) => sum + r.duration, 0) /
            responseTimes.length,
        )
      : 0;

    const slowest = responseTimes.reduce(
      (max, r) =>
        r.duration > max.time ? { url: r.name, time: r.duration } : max,
      { url: "N/A", time: 0 },
    );

    const fastest = responseTimes.reduce(
      (min, r) =>
        r.duration < min.time ? { url: r.name, time: r.duration } : min,
      { url: "N/A", time: Infinity },
    );

    const recommendations = this.results
      .filter((r) => r.suggestions && r.suggestions.length > 0)
      .flatMap((r) => r.suggestions || []);

    return {
      url: baseUrl,
      timestamp: new Date().toISOString(),
      duration,
      summary,
      results: this.results,
      recommendations: [...new Set(recommendations)],
      performance: {
        avgResponseTime,
        slowestEndpoint: slowest,
        fastestEndpoint:
          fastest.time !== Infinity ? fastest : { url: "N/A", time: 0 },
      },
    };
  }

  // Print Report
  printReport(report: TestReport) {
    console.log("\n" + "═".repeat(60));
    log("  📊 TEST REPORT SUMMARY", "cyan");
    console.log("═".repeat(60) + "\n");

    log(`🌐 URL: ${report.url}`, "bright");
    log(`⏱️  Total Duration: ${report.duration}ms`, "bright");
    log(`📅 Timestamp: ${report.timestamp}`, "bright");
    console.log("");

    log("📈 Results:", "bright");
    log(`  ✅ Passed:   ${report.summary.passed}`, "green");
    log(
      `  ❌ Failed:   ${report.summary.failed}`,
      report.summary.failed > 0 ? "red" : "reset",
    );
    log(
      `  ⚠️  Warnings: ${report.summary.warnings}`,
      report.summary.warnings > 0 ? "yellow" : "reset",
    );
    log(`  ⏭️  Skipped:  ${report.summary.skipped}`, "blue");
    log(`  📊 Total:    ${report.summary.total}`, "bright");
    console.log("");

    const successRate = (
      (report.summary.passed / report.summary.total) *
      100
    ).toFixed(1);
    const ratingColor =
      parseFloat(successRate) >= 90
        ? "green"
        : parseFloat(successRate) >= 70
          ? "yellow"
          : "red";
    log(`🎯 Success Rate: ${successRate}%`, ratingColor);
    console.log("");

    if (report.performance.avgResponseTime > 0) {
      log("⚡ Performance:", "bright");
      log(
        `  Average Response: ${report.performance.avgResponseTime}ms`,
        "reset",
      );
      log(
        `  Fastest: ${report.performance.fastestEndpoint.url} (${report.performance.fastestEndpoint.time}ms)`,
        "green",
      );
      log(
        `  Slowest: ${report.performance.slowestEndpoint.url} (${report.performance.slowestEndpoint.time}ms)`,
        "yellow",
      );
      console.log("");
    }

    if (report.recommendations.length > 0) {
      log("💡 Recommendations:", "bright");
      report.recommendations.slice(0, 10).forEach((rec, i) => {
        log(`  ${i + 1}. ${rec}`, "yellow");
      });
      if (report.recommendations.length > 10) {
        log(`  ... and ${report.recommendations.length - 10} more`, "yellow");
      }
      console.log("");
    }

    // Failed tests details
    const failedTests = report.results.filter((r) => r.status === "fail");
    if (failedTests.length > 0) {
      log("❌ Failed Tests:", "red");
      failedTests.forEach((test) => {
        log(`  • ${test.name}`, "red");
        if (test.message) {
          log(`    ${test.message}`, "yellow");
        }
      });
      console.log("");
    }

    console.log("═".repeat(60) + "\n");
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("\n" + "╔" + "═".repeat(58) + "╗");
  log("║" + " ".repeat(58) + "║", "cyan");
  log(
    "║" + "     🤖 VERCEL DEPLOYMENT TESTING BOT 🤖     ".padEnd(59) + "║",
    "cyan",
  );
  log("║" + " ".repeat(58) + "║", "cyan");
  console.log("╚" + "═".repeat(58) + "╝\n");

  log(`🎯 Target: ${baseUrl}`, "bright");
  log(
    `🔧 Mode: ${isQuickMode ? "Quick" : isFullMode ? "Full" : "Standard"}`,
    "bright",
  );
  log(`📝 Report: ${shouldGenerateReport ? "Enabled" : "Disabled"}`, "bright");
  console.log("");

  const runner = new TestRunner();

  // Core Tests
  logSection("🔌 CONNECTIVITY TESTS");
  await runner.runTest("Basic Connectivity", "connectivity", () =>
    runner.testBasicConnectivity(),
  );
  await runner.runTest("SSL/TLS Certificate", "security", () =>
    runner.testSSLCertificate(),
  );
  await runner.runTest("Response Time", "performance", () =>
    runner.testResponseTime(),
  );

  // Health & API Tests
  logSection("🏥 HEALTH & API TESTS");
  await runner.runTest("Health Endpoint", "api", () =>
    runner.testHealthEndpoint(),
  );
  await runner.runTest("API Routes", "api", () => runner.testAPIRoutes());
  await runner.runTest("Database Connectivity", "database", () =>
    runner.testDatabaseConnectivity(),
  );

  // Page Tests
  logSection("📄 PAGE TESTS");
  await runner.runTest("Authentication Pages", "pages", () =>
    runner.testAuthPages(),
  );
  await runner.runTest("Error Handling", "pages", () =>
    runner.testErrorHandling(),
  );
  await runner.runTest("Static Assets", "assets", () =>
    runner.testStaticAssets(),
  );

  // Security Tests
  logSection("🔒 SECURITY TESTS");
  await runner.runTest("Security Headers", "security", () =>
    runner.testSecurityHeaders(),
  );
  await runner.runTest("CORS Configuration", "security", () =>
    runner.testCORSConfiguration(),
  );

  // Performance & SEO Tests (skip in quick mode)
  if (!isQuickMode) {
    logSection("⚡ PERFORMANCE TESTS");
    await runner.runTest("Performance Metrics", "performance", () =>
      runner.testPerformanceMetrics(),
    );

    logSection("🔍 SEO & UX TESTS");
    await runner.runTest("SEO Basics", "seo", () => runner.testSEOBasics());
    await runner.runTest("Mobile Responsiveness", "mobile", () =>
      runner.testMobileResponsiveness(),
    );
  }

  // Generate and print report
  const report = runner.generateReport();
  runner.printReport(report);

  // Save report to file if requested
  if (shouldGenerateReport) {
    const fs = await import("fs");
    const path = await import("path");

    const reportDir = path.join(process.cwd(), "test-reports");
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `vercel-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`📄 Report saved to: ${reportPath}`, "green");
  }

  // Exit with appropriate code
  const hasFailures = report.summary.failed > 0;
  process.exit(hasFailures ? 1 : 0);
}

// Run the tests
main().catch((error) => {
  log(`\n❌ Fatal Error: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});
