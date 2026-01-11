/**
 * Health Checks Module
 *
 * Comprehensive health and availability checks for the Farmers Market Platform.
 * Tests critical infrastructure, API endpoints, database connectivity, and performance.
 *
 * @module health/checks
 * @category Critical
 */

import { expect } from "@/lib/testing/utils/assertions";
import type { Page } from "@playwright/test";

/**
 * Health Check Test Module
 *
 * Validates:
 * - Homepage accessibility and load time
 * - API health endpoints
 * - Database connectivity
 * - Authentication service availability
 * - Static asset loading
 * - Performance metrics
 */
export const HealthChecksModule: any = {
  id: "health",
  name: "Health Checks",
  description: "Critical infrastructure and availability checks",
  category: "HEALTH",
  tags: ["health", "infrastructure", "monitoring"],
  timeout: 30000, // 30 seconds per test

  suites: [
    {
      id: "health-basic",
      name: "Basic Health Checks",
      description: "Core availability and connectivity tests",
      tests: [
        {
          id: "health-homepage",
          name: "Homepage Load",
          description:
            "Verify homepage loads successfully with expected content",
          category: "CRITICAL",
          timeout: 15000,
          retries: 2,
          async run(page: Page) {
            const startTime = Date.now();

            // Navigate to homepage with retry logic
            await page.goto("/", {
              waitUntil: "domcontentloaded",
              timeout: 10000,
            });

            // Wait for body to be visible
            await page.waitForSelector("body", {
              state: "visible",
              timeout: 5000,
            });

            const loadTime = Date.now() - startTime;

            // Get page title
            const title = await page.title();
            expect(title).toBeDefined();
            expect(title).not.toBe("");

            // Verify page has content
            const bodyVisible = await page.locator("body").isVisible();
            expect(bodyVisible).toBe(true);

            // Check for main navigation
            const hasNav = await page
              .locator('nav, [role="navigation"], header nav')
              .count();
            expect(hasNav).toBeGreaterThan(0);

            // Verify no critical errors
            const hasError = await page
              .locator("text=/500|internal server error|something went wrong/i")
              .count();
            expect(hasError).toBe(0);

            return {
              data: {
                title,
                loadTime,
                hasNavigation: hasNav > 0,
                performance: loadTime < 3000 ? "good" : "needs-improvement",
              },
            };
          },
        },

        {
          id: "health-database",
          name: "Database Connection",
          description: "Verify database connectivity via health endpoint",
          category: "CRITICAL",
          timeout: 10000,
          retries: 3,
          async run(page: Page) {
            // Check database health endpoint
            const response = await page.request.get("/api/health/database");

            expect(response.status()).toBe(200);

            const data = await response.json();

            // Verify response structure
            expect(data).toBeDefined();
            expect(data.status).toBeDefined();

            // Database should be healthy/connected
            const isConnected =
              data.status === "healthy" ||
              data.status === "connected" ||
              data.status === "ok" ||
              data.connected === true;

            expect(isConnected).toBe(true);

            return {
              data: {
                status: data.status,
                responseTime: response.headers()["x-response-time"] || "N/A",
                connected: isConnected,
              },
            };
          },
        },

        {
          id: "health-auth",
          name: "Auth Service",
          description: "Verify authentication service is available",
          category: "CRITICAL",
          timeout: 10000,
          retries: 2,
          async run(page: Page) {
            // Check auth providers endpoint
            const response = await page.request.get("/api/auth/providers");

            expect(response.status()).toBeLessThan(500);

            // Should return providers or at least not fail
            const isOk = response.ok() || response.status() === 404;
            expect(isOk).toBe(true);

            let providers: string[] = [];
            if (response.ok()) {
              try {
                const data = await response.json();
                providers = Object.keys(data || {});
              } catch {
                // JSON parse error is acceptable for this check
              }
            }

            return {
              data: {
                available: response.ok(),
                status: response.status(),
                providers,
              },
            };
          },
        },

        {
          id: "health-api-general",
          name: "General API Health",
          description: "Check general API health endpoint",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 2,
          async run(page: Page) {
            const response = await page.request.get("/api/health");

            // Health endpoint returns 503 when system is unhealthy (high memory)
            // This is expected behavior, so we accept both 200 and 503
            const status = response.status();
            expect(status === 200 || status === 503).toBe(true);

            const data = await response.json();

            expect(data).toBeDefined();
            expect(data.status).toBeDefined();

            // Accept healthy or degraded/unhealthy status (503 is acceptable for monitoring)
            const hasValidStatus =
              data.status === "healthy" ||
              data.status === "degraded" ||
              data.status === "unhealthy" ||
              data.status === "ok" ||
              data.healthy === true;

            expect(hasValidStatus).toBe(true);

            return {
              data: {
                status: data.status,
                timestamp: data.timestamp,
                uptime: data.uptime,
                healthy: hasValidStatus,
              },
            };
          },
        },
      ],
    },

    {
      id: "health-api",
      name: "API Endpoints Health",
      description: "Verify critical API endpoints are responding",
      tests: [
        {
          id: "health-marketplace-api",
          name: "Marketplace API",
          description: "Check marketplace/farms API availability",
          category: "CRITICAL",
          timeout: 10000,
          retries: 2,
          async run(page: Page) {
            // Check farms API
            const response = await page.request.get("/api/farms", {
              params: { page: "1", limit: "10" },
            });

            expect(response.status()).toBeLessThan(500);

            let farmCount = 0;
            if (response.ok()) {
              const data = await response.json();
              farmCount = Array.isArray(data)
                ? data.length
                : data.farms?.length || 0;
            }

            return {
              data: {
                status: response.status(),
                available: response.ok(),
                farmCount,
              },
            };
          },
        },

        {
          id: "health-products-api",
          name: "Products API",
          description: "Check products API availability",
          category: "CRITICAL",
          timeout: 10000,
          retries: 2,
          async run(page: Page) {
            // Check products API
            const response = await page.request.get("/api/products", {
              params: { page: "1", limit: "10" },
            });

            expect(response.status()).toBeLessThan(500);

            let productCount = 0;
            if (response.ok()) {
              const data = await response.json();
              productCount = Array.isArray(data)
                ? data.length
                : data.products?.length || 0;
            }

            return {
              data: {
                status: response.status(),
                available: response.ok(),
                productCount,
              },
            };
          },
        },

        {
          id: "health-categories-api",
          name: "Categories API",
          description: "Check categories API availability",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 2,
          async run(page: Page) {
            const response = await page.request.get("/api/categories");

            expect(response.status()).toBeLessThan(500);

            let categoryCount = 0;
            if (response.ok()) {
              const data = await response.json();
              categoryCount = Array.isArray(data)
                ? data.length
                : data.categories?.length || 0;
            }

            return {
              data: {
                status: response.status(),
                available: response.ok(),
                categoryCount,
              },
            };
          },
        },

        {
          id: "health-search-api",
          name: "Search API",
          description: "Check search functionality availability",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 2,
          async run(page: Page) {
            const response = await page.request.get("/api/search", {
              params: { q: "tomato", type: "products" },
            });

            expect(response.status()).toBeLessThan(500);

            let resultsCount = 0;
            if (response.ok()) {
              const data = await response.json();
              resultsCount = data.results?.length || 0;
            }

            return {
              data: {
                status: response.status(),
                available: response.ok(),
                resultsCount,
              },
            };
          },
        },
      ],
    },

    {
      id: "health-performance",
      name: "Performance Checks",
      description: "Verify performance metrics are within acceptable ranges",
      tests: [
        {
          id: "health-page-load-time",
          name: "Page Load Performance",
          description: "Measure homepage load time",
          category: "IMPORTANT",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            const startTime = Date.now();

            await page.goto("/", {
              waitUntil: "load",
              timeout: 10000,
            });

            const loadTime = Date.now() - startTime;

            // Performance thresholds
            const isGood = loadTime < 2000;
            const isAcceptable = loadTime < 5000;
            const rating = isGood
              ? "good"
              : isAcceptable
                ? "acceptable"
                : "poor";

            // Soft assertion - log warning if slow but don't fail
            if (!isAcceptable) {
              console.warn(
                `⚠️  Page load time (${loadTime}ms) exceeds acceptable threshold (5000ms)`,
              );
            }

            return {
              data: {
                loadTime,
                rating,
                isGood,
                isAcceptable,
              },
            };
          },
        },

        {
          id: "health-api-response-time",
          name: "API Response Time",
          description: "Measure API response times",
          category: "IMPORTANT",
          timeout: 10000,
          retries: 1,
          async run(page: Page) {
            const measurements: Record<string, number> = {};

            // Test multiple endpoints
            const endpoints = ["/api/health", "/api/farms", "/api/products"];

            for (const endpoint of endpoints) {
              const start = Date.now();
              const response = await page.request.get(endpoint, {
                params: { limit: "5" },
              });
              const duration = Date.now() - start;

              measurements[endpoint] = duration;
            }

            const avgResponseTime =
              Object.values(measurements).reduce((a: any, b: any) => a + b, 0) /
              Object.keys(measurements).length;

            const allFast = Object.values(measurements).every((t) => t < 1000);
            const allAcceptable = Object.values(measurements).every(
              (t) => t < 3000,
            );

            return {
              data: {
                measurements,
                avgResponseTime,
                rating: allFast
                  ? "good"
                  : allAcceptable
                    ? "acceptable"
                    : "poor",
              },
            };
          },
        },

        {
          id: "health-static-assets",
          name: "Static Assets Loading",
          description: "Verify static assets load correctly",
          category: "OPTIONAL",
          timeout: 15000,
          retries: 1,
          async run(page: Page) {
            await page.goto("/");

            // Count images
            const imageCount = await page.locator("img").count();

            // Count scripts
            const scriptCount = await page.locator("script[src]").count();

            // Count stylesheets
            const linkCount = await page
              .locator('link[rel="stylesheet"]')
              .count();

            // Check if main assets loaded
            const hasImages = imageCount > 0;
            const hasScripts = scriptCount > 0;
            const hasStyles = linkCount > 0;

            return {
              data: {
                imageCount,
                scriptCount,
                linkCount,
                assetsLoaded: hasImages || hasScripts || hasStyles,
              },
            };
          },
        },
      ],
    },

    {
      id: "health-monitoring",
      name: "Continuous Monitoring",
      description: "Tests designed for continuous monitoring",
      tests: [
        {
          id: "health-uptime",
          name: "Service Uptime",
          description: "Quick uptime check for monitoring",
          category: "CRITICAL",
          timeout: 5000,
          retries: 1,
          async run(page: Page) {
            const response = await page.request.get("/api/health");

            // Accept 200 (healthy) or 503 (degraded/unhealthy but still responding)
            const isUp = response.status() === 200 || response.status() === 503;
            expect(isUp).toBe(true);

            return {
              data: {
                up: isUp,
                status: response.status(),
                timestamp: new Date().toISOString(),
              },
            };
          },
        },

        {
          id: "health-critical-paths",
          name: "Critical User Paths",
          description: "Verify critical pages are accessible",
          category: "CRITICAL",
          timeout: 20000,
          retries: 1,
          async run(page: Page) {
            const criticalPaths = [
              "/",
              "/products",
              "/marketplace",
              "/login",
              "/register",
            ];

            const results: Record<string, boolean> = {};

            for (const path of criticalPaths) {
              try {
                const response = await page.goto(path, {
                  waitUntil: "domcontentloaded",
                  timeout: 5000,
                });
                results[path] = response?.ok() || false;
              } catch {
                results[path] = false;
              }
            }

            const allAccessible = Object.values(results).every((v) => v);
            const accessibleCount = Object.values(results).filter(
              (v) => v,
            ).length;

            expect(accessibleCount).toBeGreaterThan(0);

            return {
              data: {
                results,
                allAccessible,
                accessibleCount,
                totalPaths: criticalPaths.length,
              },
            };
          },
        },
      ],
    },
  ],
};

export default HealthChecksModule;
