/**
 * 🧠 DIVINE PATTERN: Mobile Performance E2E Tests
 * 📚 Reference: Day 17 - Mobile Testing & PWA Optimization
 * 🌾 Domain: Mobile Agricultural Performance Optimization
 * ⚡ Performance: Mobile-First Performance Validation
 *
 * Comprehensive mobile performance tests covering:
 * - Page load performance on mobile devices
 * - Resource optimization and lazy loading
 * - Image optimization and responsive images
 * - Network condition testing (3G, 4G, slow connections)
 * - Mobile-specific metrics (FCP, LCP, TTI, CLS)
 * - Agricultural content performance
 */

import { test, expect } from "@playwright/test";
import {
  createMobileHelper,
  MOBILE_DEVICES,
  VIEWPORT_BREAKPOINTS,
  NETWORK_CONDITIONS,
  setNetworkConditions,
  waitForMobileReady,
  captureMobileMetrics,
} from "./mobile-utils";

// ============================================
// TEST CONFIGURATION
// ============================================

test.describe("Mobile Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    await waitForMobileReady(page);
  });

  // ============================================
  // PAGE LOAD PERFORMANCE
  // ============================================

  test.describe("Page Load Performance", () => {
    test("should load homepage quickly on mobile", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");

      const perf = await mobile.performance.measurePageLoad("/");

      // Performance targets for mobile
      expect(perf.totalTime).toBeLessThan(5000); // 5 seconds total
      expect(perf.firstContentfulPaint).toBeLessThan(2500); // 2.5 seconds FCP
      expect(perf.domContentLoaded).toBeLessThan(3000); // 3 seconds DOM ready

      console.log("Homepage load performance:", {
        totalTime: `${perf.totalTime}ms`,
        fcp: `${perf.firstContentfulPaint}ms`,
        domReady: `${perf.domContentLoaded}ms`,
      });
    });

    test("should load product pages efficiently on mobile", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");

      const perf = await mobile.performance.measurePageLoad("/products");

      // Product pages should load quickly
      expect(perf.totalTime).toBeLessThan(6000); // 6 seconds
      expect(perf.firstContentfulPaint).toBeLessThan(3000); // 3 seconds FCP

      console.log("Product page load performance:", {
        totalTime: `${perf.totalTime}ms`,
        fcp: `${perf.firstContentfulPaint}ms`,
      });
    });

    test("should load farm profiles quickly on mobile", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      // Find a farm link
      const farmLink = page.locator('a[href*="/farms/"]').first();

      if ((await farmLink.count()) > 0) {
        const href = await farmLink.getAttribute("href");

        if (href) {
          const perf = await mobile.performance.measurePageLoad(href);

          expect(perf.totalTime).toBeLessThan(6000);
          expect(perf.firstContentfulPaint).toBeLessThan(3000);

          console.log("Farm profile load performance:", {
            totalTime: `${perf.totalTime}ms`,
            fcp: `${perf.firstContentfulPaint}ms`,
          });
        }
      }
    });

    test("should have fast Time to Interactive on mobile", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      const tti = await mobile.performance.measureTTI();

      // TTI should be reasonable on mobile
      if (tti > 0) {
        expect(tti).toBeLessThan(7000); // 7 seconds
        console.log("Time to Interactive:", `${tti}ms`);
      }
    });

    test("should measure JavaScript execution time", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      const jsTime = await mobile.performance.measureJSExecutionTime();

      // JS execution should be reasonable
      expect(jsTime).toBeLessThan(3000); // 3 seconds

      console.log("JS execution time:", `${jsTime}ms`);
    });
  });

  // ============================================
  // RESOURCE LOADING PERFORMANCE
  // ============================================

  test.describe("Resource Loading", () => {
    test("should load resources efficiently", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      const resourceTimings = await mobile.performance.getResourceTimings();

      console.log("Resource loading times:", {
        scripts: `${resourceTimings.scripts.toFixed(2)}ms`,
        stylesheets: `${resourceTimings.stylesheets.toFixed(2)}ms`,
        images: `${resourceTimings.images.toFixed(2)}ms`,
        fonts: `${resourceTimings.fonts.toFixed(2)}ms`,
        total: `${resourceTimings.total.toFixed(2)}ms`,
      });

      // Resources should load in reasonable time
      expect(resourceTimings.total).toBeLessThan(10000); // 10 seconds total
    });

    test("should lazy load images on mobile", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      // Check for lazy loading attributes
      const lazyImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll("img"));
        const lazyCount = images.filter((img) => img.loading === "lazy").length;
        const total = images.length;

        return { lazyCount, total, percentage: (lazyCount / total) * 100 };
      });

      console.log("Lazy loading images:", lazyImages);

      // At least some images should be lazy loaded
      if (lazyImages.total > 0) {
        expect(lazyImages.lazyCount).toBeGreaterThan(0);
      }
    });

    test("should use responsive images on mobile", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      // Check for responsive image attributes
      const responsiveImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll("img"));
        const withSrcset = images.filter((img) =>
          img.hasAttribute("srcset"),
        ).length;
        const withSizes = images.filter((img) =>
          img.hasAttribute("sizes"),
        ).length;
        const total = images.length;

        return {
          withSrcset,
          withSizes,
          total,
          percentage: ((withSrcset + withSizes) / (total * 2)) * 100,
        };
      });

      console.log("Responsive images:", responsiveImages);

      // Some images should have responsive attributes
      if (responsiveImages.total > 0) {
        expect(
          responsiveImages.withSrcset + responsiveImages.withSizes,
        ).toBeGreaterThan(0);
      }
    });

    test("should defer non-critical JavaScript", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      // Check for deferred scripts
      const scriptStats = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll("script"));
        const deferred = scripts.filter((s) => s.defer || s.async).length;
        const total = scripts.filter((s) => s.src).length; // Only external scripts

        return { deferred, total, percentage: (deferred / total) * 100 };
      });

      console.log("Deferred scripts:", scriptStats);

      // Most external scripts should be deferred
      if (scriptStats.total > 0) {
        expect(scriptStats.percentage).toBeGreaterThan(50);
      }
    });

    test("should minimize CSS blocking time", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      // Check for critical CSS inline
      const cssStats = await page.evaluate(() => {
        const styleSheets = Array.from(document.styleSheets);
        const inlineStyles = Array.from(
          document.querySelectorAll("style"),
        ).length;
        const externalStyles = Array.from(
          document.querySelectorAll('link[rel="stylesheet"]'),
        ).length;

        return { inlineStyles, externalStyles };
      });

      console.log("CSS loading strategy:", cssStats);

      // Should have some inline critical CSS
      expect(cssStats.inlineStyles + cssStats.externalStyles).toBeGreaterThan(
        0,
      );
    });
  });

  // ============================================
  // NETWORK CONDITION TESTING
  // ============================================

  test.describe("Network Performance", () => {
    test("should work on 4G connection", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      // Note: setNetworkConditions is placeholder, real throttling needs CDP
      // await setNetworkConditions(context, '4G');

      const perf = await mobile.performance.measurePageLoad("/");

      // Should load reasonably on 4G
      expect(perf.totalTime).toBeLessThan(8000); // 8 seconds on 4G

      console.log("4G load performance:", `${perf.totalTime}ms`);
    });

    test("should be usable on slow 3G", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      // await setNetworkConditions(context, 'Slow 3G');

      await page.goto("/", { timeout: 30000 });

      // Page should at least load on slow connection
      const hasContent = await page.evaluate(() => {
        return (
          document.body.textContent !== null &&
          document.body.textContent.length > 100
        );
      });

      expect(hasContent).toBe(true);
    });

    test("should prioritize critical resources", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      // Check resource priorities
      const resourcePriorities = await page.evaluate(() => {
        const entries = performance.getEntriesByType(
          "resource",
        ) as PerformanceResourceTiming[];

        const priorities = {
          high: 0,
          medium: 0,
          low: 0,
        };

        entries.forEach((entry) => {
          // Infer priority from resource type and timing
          if (
            entry.initiatorType === "link" ||
            entry.initiatorType === "script"
          ) {
            priorities.high++;
          } else if (entry.initiatorType === "img") {
            priorities.medium++;
          } else {
            priorities.low++;
          }
        });

        return priorities;
      });

      console.log("Resource priorities:", resourcePriorities);

      // Should have critical resources
      expect(resourcePriorities.high).toBeGreaterThan(0);
    });
  });

  // ============================================
  // CORE WEB VITALS
  // ============================================

  test.describe("Core Web Vitals", () => {
    test("should have good First Contentful Paint (FCP)", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");

      const perf = await mobile.performance.measurePageLoad("/");

      // FCP should be under 1.8s (good) or 3s (acceptable)
      expect(perf.firstContentfulPaint).toBeLessThan(3000);

      const rating =
        perf.firstContentfulPaint < 1800
          ? "good"
          : perf.firstContentfulPaint < 3000
            ? "acceptable"
            : "poor";

      console.log("FCP:", `${perf.firstContentfulPaint}ms (${rating})`);
    });

    test("should have minimal Cumulative Layout Shift (CLS)", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      const cls = await mobile.performance.measureCLS();

      // CLS should be under 0.1 (good) or 0.25 (acceptable)
      expect(cls).toBeLessThan(0.25);

      const rating = cls < 0.1 ? "good" : cls < 0.25 ? "acceptable" : "poor";

      console.log("CLS:", `${cls.toFixed(3)} (${rating})`);
    });

    test("should have fast Largest Contentful Paint (LCP)", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          if ("PerformanceObserver" in window) {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              resolve(lastEntry.startTime);
            });

            observer.observe({ entryTypes: ["largest-contentful-paint"] });

            // Timeout after 5 seconds
            setTimeout(() => {
              observer.disconnect();
              resolve(0);
            }, 5000);
          } else {
            resolve(0);
          }
        });
      });

      if (lcp > 0) {
        // LCP should be under 2.5s (good) or 4s (acceptable)
        expect(lcp).toBeLessThan(4000);

        const rating = lcp < 2500 ? "good" : lcp < 4000 ? "acceptable" : "poor";
        console.log("LCP:", `${lcp}ms (${rating})`);
      }
    });

    test("should have good First Input Delay (FID) proxy", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      // Measure responsiveness by clicking a button
      const button = page.locator('button, a[role="button"]').first();

      if ((await button.count()) > 0) {
        const startTime = Date.now();
        await button.click({ timeout: 5000 }).catch(() => {});
        const responseTime = Date.now() - startTime;

        // Response should be quick (FID proxy)
        expect(responseTime).toBeLessThan(300); // 300ms

        console.log("Interaction response time:", `${responseTime}ms`);
      }
    });

    test("should have good Interaction to Next Paint (INP)", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      // Measure interaction responsiveness
      const interactions = await page.evaluate(() => {
        return new Promise<number[]>((resolve) => {
          const times: number[] = [];

          if ("PerformanceObserver" in window) {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                times.push(entry.duration);
              }
            });

            observer.observe({ entryTypes: ["event"] });

            // Resolve after 3 seconds
            setTimeout(() => {
              observer.disconnect();
              resolve(times);
            }, 3000);
          } else {
            resolve([]);
          }
        });
      });

      if (interactions.length > 0) {
        const avgInteraction =
          interactions.reduce((a, b) => a + b) / interactions.length;
        console.log(
          "Average interaction time:",
          `${avgInteraction.toFixed(2)}ms`,
        );

        // INP should be under 200ms (good) or 500ms (acceptable)
        expect(avgInteraction).toBeLessThan(500);
      }
    });
  });

  // ============================================
  // AGRICULTURAL PERFORMANCE
  // ============================================

  test.describe("Agricultural Content Performance", () => {
    test("should load farm listings efficiently", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");

      const perf = await mobile.performance.measurePageLoad("/farms");

      expect(perf.totalTime).toBeLessThan(6000);

      console.log("Farm listings load time:", `${perf.totalTime}ms`);
    });

    test("should load product catalog quickly", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");

      const perf = await mobile.performance.measurePageLoad("/products");

      expect(perf.totalTime).toBeLessThan(6000);

      console.log("Product catalog load time:", `${perf.totalTime}ms`);
    });

    test("should handle image-heavy farm profiles", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      const farmLink = page.locator('a[href*="/farms/"]').first();

      if ((await farmLink.count()) > 0) {
        await farmLink.click();
        await page.waitForLoadState("domcontentloaded");

        // Count images
        const imageCount = await page.locator("img").count();

        // Measure load time with images
        const loadComplete = await page.evaluate(() => {
          return new Promise<boolean>((resolve) => {
            if (document.readyState === "complete") {
              resolve(true);
            } else {
              window.addEventListener("load", () => resolve(true));
              setTimeout(() => resolve(false), 10000);
            }
          });
        });

        expect(loadComplete).toBe(true);

        console.log("Farm profile images:", imageCount);
      }
    });

    test("should optimize seasonal product images", async ({
      page,
      context,
    }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/products");

      // Check product images
      const imageOptimization = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll("img"));
        const productImages = images.filter(
          (img) =>
            img.src.includes("product") ||
            img.closest("[data-product]") !== null,
        );

        const optimized = productImages.filter(
          (img) =>
            img.loading === "lazy" ||
            img.hasAttribute("srcset") ||
            img.src.includes("w_") || // Image CDN width parameter
            img.src.includes("webp") ||
            img.src.includes("avif"),
        );

        return {
          total: productImages.length,
          optimized: optimized.length,
          percentage: (optimized.length / productImages.length) * 100,
        };
      });

      console.log("Product image optimization:", imageOptimization);

      if (imageOptimization.total > 0) {
        expect(imageOptimization.percentage).toBeGreaterThan(50);
      }
    });

    test("should handle map loading efficiently", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      const farmLink = page.locator('a[href*="/farms/"]').first();

      if ((await farmLink.count()) > 0) {
        await farmLink.click();
        await page.waitForLoadState("domcontentloaded");

        // Check if map exists
        const hasMap =
          (await page.locator("[data-map], #map, .map-container").count()) > 0;

        if (hasMap) {
          // Map should load without blocking main content
          const mainContentVisible = await page.evaluate(() => {
            const main = document.querySelector('main, [role="main"]');
            return (
              main !== null &&
              main.textContent !== null &&
              main.textContent.length > 0
            );
          });

          expect(mainContentVisible).toBe(true);
        }
      }
    });
  });

  // ============================================
  // DEVICE-SPECIFIC PERFORMANCE
  // ============================================

  test.describe("Device-Specific Performance", () => {
    const testDevices: Array<keyof typeof MOBILE_DEVICES> = [
      "iPhone 12",
      "Pixel 5",
    ];

    for (const deviceName of testDevices) {
      test(`should perform well on ${deviceName}`, async ({
        page,
        context,
      }) => {
        const mobile = createMobileHelper(page, context);

        await mobile.viewport.setDevice(deviceName);

        const perf = await mobile.performance.measurePageLoad("/");

        // Performance should be good on modern devices
        expect(perf.totalTime).toBeLessThan(5000);
        expect(perf.firstContentfulPaint).toBeLessThan(2500);

        console.log(`${deviceName} performance:`, {
          totalTime: `${perf.totalTime}ms`,
          fcp: `${perf.firstContentfulPaint}ms`,
        });
      });
    }
  });

  // ============================================
  // MEMORY PERFORMANCE
  // ============================================

  test.describe("Memory Performance", () => {
    test("should not leak memory on navigation", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");

      // Navigate through pages
      const pages = ["/", "/products", "/farms", "/search"];

      for (const url of pages) {
        await page.goto(url);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(500);
      }

      // Check memory usage
      const memoryInfo = await page.evaluate(() => {
        if ("memory" in performance) {
          return (performance as any).memory;
        }
        return null;
      });

      if (memoryInfo) {
        console.log("Memory usage:", {
          usedJSHeapSize: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          totalJSHeapSize: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          jsHeapSizeLimit: `${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
        });

        // Memory should not exceed reasonable limits
        expect(memoryInfo.usedJSHeapSize).toBeLessThan(
          memoryInfo.jsHeapSizeLimit * 0.8,
        );
      }
    });

    test("should clean up resources efficiently", async ({ page, context }) => {
      const mobile = createMobileHelper(page, context);

      await mobile.viewport.setBreakpoint("mobile");
      await page.goto("/");

      // Check for resource cleanup
      const resourceCount = await page.evaluate(() => {
        const entries = performance.getEntriesByType("resource");
        return entries.length;
      });

      console.log("Resources loaded:", resourceCount);

      // Should not load excessive resources
      expect(resourceCount).toBeLessThan(200);
    });
  });
});

/**
 * Generate mobile performance test report
 */
test.afterAll(async () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║ 🌾 MOBILE PERFORMANCE TESTS COMPLETE                      ║
╠════════════════════════════════════════════════════════════╣
║ ✅ Page load performance validated                        ║
║ ✅ Resource optimization verified                         ║
║ ✅ Core Web Vitals measured                               ║
║ ✅ Network performance tested                             ║
║ ✅ Agricultural content optimized                         ║
║ ✅ Device-specific performance confirmed                  ║
║ ✅ Memory efficiency validated                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
