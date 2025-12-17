/**
 * 📱 Real Device Testing Suite - Divine Multi-Device Tests
 *
 * Comprehensive real device testing across multiple cloud providers
 * Tests critical user journeys on actual devices
 *
 * @module RealDeviceTests
 * @version 1.0.0
 * @divine-pattern AGRICULTURAL_DEVICE_CONSCIOUSNESS
 */

import { test, expect, type Page } from "@playwright/test";
import RealDeviceTestManager, {
  type RealDeviceConfig,
  type CloudProvider,
  type TestSession,
} from "./RealDeviceTestManager";

// ============================================================================
// Test Configuration
// ============================================================================

const CLOUD_PROVIDERS: CloudProvider[] = ["browserstack", "local"];

const DEVICE_CONFIGS: RealDeviceConfig[] = [
  // iOS Devices
  {
    provider: "browserstack",
    deviceName: "iPhone 14 Pro",
    osVersion: "16.0",
    os: "iOS",
    deviceType: "mobile",
    browserName: "Safari",
    networkCondition: "4G",
    captureVideo: true,
    captureScreenshots: true,
    captureLogs: true,
  },
  {
    provider: "browserstack",
    deviceName: "iPhone 13",
    osVersion: "15.0",
    os: "iOS",
    deviceType: "mobile",
    browserName: "Safari",
    networkCondition: "WiFi",
    captureVideo: true,
  },
  {
    provider: "browserstack",
    deviceName: "iPhone SE 2022",
    osVersion: "15.0",
    os: "iOS",
    deviceType: "mobile",
    browserName: "Safari",
    networkCondition: "3G",
    captureVideo: true,
  },
  // Android Devices
  {
    provider: "browserstack",
    deviceName: "Samsung Galaxy S23",
    osVersion: "13.0",
    os: "Android",
    deviceType: "mobile",
    browserName: "Chrome",
    networkCondition: "5G",
    captureVideo: true,
    captureScreenshots: true,
  },
  {
    provider: "browserstack",
    deviceName: "Google Pixel 7",
    osVersion: "13.0",
    os: "Android",
    deviceType: "mobile",
    browserName: "Chrome",
    networkCondition: "4G",
    captureVideo: true,
  },
  {
    provider: "browserstack",
    deviceName: "OnePlus 9",
    osVersion: "12.0",
    os: "Android",
    deviceType: "mobile",
    browserName: "Chrome",
    networkCondition: "WiFi",
    captureVideo: true,
  },
  // Tablets
  {
    provider: "browserstack",
    deviceName: "iPad Pro 12.9",
    osVersion: "16.0",
    os: "iOS",
    deviceType: "tablet",
    browserName: "Safari",
    networkCondition: "WiFi",
    orientation: "landscape",
    captureVideo: true,
  },
  {
    provider: "browserstack",
    deviceName: "Samsung Galaxy Tab S8",
    osVersion: "12.0",
    os: "Android",
    deviceType: "tablet",
    browserName: "Chrome",
    networkCondition: "WiFi",
    orientation: "landscape",
    captureVideo: true,
  },
];

// ============================================================================
// Test Helpers
// ============================================================================

let deviceManager: RealDeviceTestManager;

test.beforeAll(async () => {
  // Initialize device manager with cloud provider credentials
  const credentials = {
    browserstack: {
      username: process.env.BROWSERSTACK_USERNAME || "test_user",
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY || "test_key",
      buildName: "Farmers Market Real Device Tests",
      projectName: "Farmers Market Platform",
    },
    awsDeviceFarm: process.env.AWS_DEVICE_FARM_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.AWS_DEVICE_FARM_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_DEVICE_FARM_SECRET_ACCESS_KEY!,
          region: process.env.AWS_DEVICE_FARM_REGION || "us-west-2",
        }
      : undefined,
    sauceLabs: process.env.SAUCE_USERNAME
      ? {
          username: process.env.SAUCE_USERNAME,
          accessKey: process.env.SAUCE_ACCESS_KEY!,
          dataCenter: "us-west-1",
        }
      : undefined,
    lambdaTest: process.env.LAMBDATEST_USERNAME
      ? {
          username: process.env.LAMBDATEST_USERNAME,
          accessKey: process.env.LAMBDATEST_ACCESS_KEY!,
          region: "us",
        }
      : undefined,
  };

  deviceManager = new RealDeviceTestManager(credentials, "local");
});

test.afterAll(async () => {
  // Generate final report
  const report = deviceManager.generateReport();
  console.log("\n📊 Real Device Test Report:");
  console.log(`Total Sessions: ${report.summary.totalSessions}`);
  console.log(`Passed: ${report.summary.passedSessions}`);
  console.log(`Failed: ${report.summary.failedSessions}`);
  console.log(`Pass Rate: ${report.summary.passRate.toFixed(2)}%`);
  console.log(`Avg Test Time: ${report.summary.avgTestTime.toFixed(0)}ms`);
  console.log(`Total Errors: ${report.summary.totalErrors}`);
  console.log(`Total Crashes: ${report.summary.totalCrashes}`);
  console.log("\n📱 Device Coverage:");
  report.deviceCoverage.devices.forEach((device) => {
    console.log(
      `  ${device.name}: ${device.count} tests (${device.percentage.toFixed(1)}%)`,
    );
  });
  console.log("\n🖥️ OS Coverage:");
  report.osCoverage.operatingSystems.forEach((os) => {
    console.log(
      `  ${os.name}: ${os.count} tests (${os.percentage.toFixed(1)}%)`,
    );
  });
});

// ============================================================================
// Critical User Journey Tests
// ============================================================================

test.describe("🌟 Real Device - Critical User Journeys", () => {
  // Run on subset of devices for speed
  const criticalDevices = DEVICE_CONFIGS.filter(
    (d) =>
      d.deviceName.includes("iPhone 14") ||
      d.deviceName.includes("Galaxy S23") ||
      d.deviceName.includes("Pixel 7"),
  );

  for (const deviceConfig of criticalDevices) {
    test.describe(`${deviceConfig.deviceName} - ${deviceConfig.os} ${deviceConfig.osVersion}`, () => {
      let session: TestSession;

      test.beforeEach(async () => {
        session = await deviceManager.startSession(deviceConfig);
      });

      test.afterEach(async ({ page }, testInfo) => {
        const passed = testInfo.status === "passed";

        // Capture final screenshot if failed
        if (!passed && page) {
          await deviceManager.captureScreenshot(
            session.id,
            "test-failure",
            "error",
          );
        }

        // Update metrics
        deviceManager.updateMetrics(session.id, {
          pageLoadTime: testInfo.duration,
        });

        // End session
        await deviceManager.endSession(session.id, passed);
      });

      test("should complete farmer registration journey", async ({ page }) => {
        deviceManager.log(
          session.id,
          "info",
          "Starting farmer registration test",
        );

        // Navigate to homepage
        await page.goto("/");
        await deviceManager.captureScreenshot(session.id, "homepage");

        // Navigate to registration
        await page.click("text=Sign Up");
        await page.click("text=Register as Farmer");
        await deviceManager.captureScreenshot(session.id, "registration-page");

        // Fill registration form
        await page.fill('[name="name"]', "Test Farmer");
        await page.fill('[name="email"]', `farmer-${Date.now()}@test.com`);
        await page.fill('[name="password"]', "SecurePass123!");
        await page.fill('[name="farmName"]', "Test Farm");
        await page.fill('[name="location"]', "Test Location");

        await deviceManager.captureScreenshot(session.id, "form-filled");

        // Submit registration
        await page.click('button[type="submit"]');

        // Wait for success
        await expect(page.locator("text=Registration Successful")).toBeVisible({
          timeout: 10000,
        });

        await deviceManager.captureScreenshot(
          session.id,
          "registration-success",
        );

        deviceManager.log(
          session.id,
          "info",
          "Farmer registration completed successfully",
        );
      });

      test("should complete customer product search and add to cart", async ({
        page,
      }) => {
        deviceManager.log(session.id, "info", "Starting product search test");

        // Navigate to marketplace
        await page.goto("/marketplace");
        await deviceManager.captureScreenshot(session.id, "marketplace");

        // Search for products
        await page.fill('[placeholder*="Search"]', "tomatoes");
        await page.press('[placeholder*="Search"]', "Enter");

        // Wait for results
        await expect(
          page.locator('[data-testid="product-card"]').first(),
        ).toBeVisible({
          timeout: 5000,
        });

        await deviceManager.captureScreenshot(session.id, "search-results");

        // Add first product to cart
        await page.locator('[data-testid="product-card"]').first().click();
        await page.click('button:has-text("Add to Cart")');

        // Verify cart notification
        await expect(page.locator("text=Added to cart")).toBeVisible();

        await deviceManager.captureScreenshot(session.id, "added-to-cart");

        // Go to cart
        await page.click('[aria-label="Cart"]');
        await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();

        await deviceManager.captureScreenshot(session.id, "cart-view");

        deviceManager.log(
          session.id,
          "info",
          "Product search and cart test completed",
        );
      });

      test("should handle network interruption gracefully", async ({
        page,
        context,
      }) => {
        deviceManager.log(session.id, "info", "Testing network resilience");

        // Navigate to page
        await page.goto("/marketplace");

        // Simulate network interruption
        await deviceManager.setNetworkCondition(session.id, "Offline");
        await context.setOffline(true);

        await deviceManager.captureScreenshot(session.id, "offline-mode");

        // Try to load data - should show offline message
        await page
          .reload({ waitUntil: "domcontentloaded", timeout: 5000 })
          .catch(() => {});

        await deviceManager.captureScreenshot(session.id, "offline-error");

        // Restore network
        await deviceManager.setNetworkCondition(session.id, "4G");
        await context.setOffline(false);

        // Should recover
        await page.reload();
        await expect(
          page.locator('[data-testid="product-card"]').first(),
        ).toBeVisible({
          timeout: 10000,
        });

        await deviceManager.captureScreenshot(session.id, "network-recovered");

        deviceManager.log(session.id, "info", "Network resilience test passed");
      });

      test("should support device orientation changes", async ({ page }) => {
        // Skip on non-mobile devices
        if (deviceConfig.deviceType !== "mobile") {
          test.skip();
        }

        deviceManager.log(session.id, "info", "Testing orientation changes");

        await page.goto("/marketplace");

        // Portrait mode
        await deviceManager.setOrientation(session.id, "portrait");
        await deviceManager.captureScreenshot(session.id, "portrait-mode");

        await expect(
          page.locator('[data-testid="product-grid"]'),
        ).toBeVisible();

        // Landscape mode
        await deviceManager.setOrientation(session.id, "landscape");
        await page.setViewportSize({ width: 812, height: 375 }); // iPhone landscape

        await deviceManager.captureScreenshot(session.id, "landscape-mode");

        await expect(
          page.locator('[data-testid="product-grid"]'),
        ).toBeVisible();

        deviceManager.log(session.id, "info", "Orientation test completed");
      });
    });
  }
});

// ============================================================================
// Performance Tests on Real Devices
// ============================================================================

test.describe("⚡ Real Device - Performance Tests", () => {
  const performanceDevices = DEVICE_CONFIGS.filter(
    (d) =>
      d.deviceName.includes("iPhone 13") || d.deviceName.includes("OnePlus"),
  );

  for (const deviceConfig of performanceDevices) {
    test(`${deviceConfig.deviceName} - Page load performance`, async ({
      page,
    }) => {
      const session = await deviceManager.startSession(deviceConfig);

      try {
        const startTime = Date.now();

        // Navigate and measure
        await page.goto("/", { waitUntil: "networkidle" });

        const loadTime = Date.now() - startTime;

        deviceManager.updateMetrics(session.id, {
          pageLoadTime: loadTime,
        });

        // Performance should be acceptable even on real devices
        expect(loadTime).toBeLessThan(5000); // 5 seconds max

        deviceManager.log(
          session.id,
          "info",
          `Page loaded in ${loadTime}ms on ${deviceConfig.networkCondition} network`,
        );

        await deviceManager.endSession(session.id, true);
      } catch (error) {
        deviceManager.log(
          session.id,
          "error",
          "Performance test failed",
          error,
        );
        await deviceManager.endSession(session.id, false);
        throw error;
      }
    });
  }
});

// ============================================================================
// Cross-Device Compatibility Tests
// ============================================================================

test.describe("🔄 Real Device - Cross-Device Compatibility", () => {
  test("should maintain consistent UI across all devices", async () => {
    const screenshots: { device: string; url: string }[] = [];

    for (const deviceConfig of DEVICE_CONFIGS.slice(0, 5)) {
      // Test subset
      const session = await deviceManager.startSession(deviceConfig);

      try {
        // Use regular Playwright page
        const { chromium } = require("@playwright/test");
        const browser = await chromium.launch();
        const context = await browser.newContext({
          viewport:
            deviceConfig.deviceType === "mobile"
              ? { width: 375, height: 667 }
              : null,
          userAgent: deviceConfig.os === "iOS" ? "iPhone" : "Android",
        });
        const page = await context.newPage();

        await page.goto("/marketplace");

        const screenshot = await deviceManager.captureScreenshot(
          session.id,
          `marketplace-${deviceConfig.deviceName.replace(/\s/g, "-")}`,
        );

        screenshots.push({
          device: `${deviceConfig.deviceName} - ${deviceConfig.os}`,
          url: screenshot.url,
        });

        await browser.close();
        await deviceManager.endSession(session.id, true);
      } catch (error) {
        await deviceManager.endSession(session.id, false);
        throw error;
      }
    }

    // Log screenshot URLs for manual visual comparison
    console.log("\n📸 Device Screenshots:");
    screenshots.forEach((s) => {
      console.log(`  ${s.device}: ${s.url}`);
    });
  });
});

// ============================================================================
// Agricultural-Specific Real Device Tests
// ============================================================================

test.describe("🌾 Real Device - Agricultural Features", () => {
  const farmDevices = [
    DEVICE_CONFIGS[0], // iPhone 14 Pro
    DEVICE_CONFIGS[3], // Galaxy S23
  ];

  for (const deviceConfig of farmDevices) {
    test(`${deviceConfig.deviceName} - Farm profile management`, async ({
      page,
    }) => {
      const session = await deviceManager.startSession(deviceConfig);

      try {
        deviceManager.log(session.id, "info", "Testing farm profile features");

        // Navigate to farm profile (assuming logged in)
        await page.goto("/farmer/profile");

        await deviceManager.captureScreenshot(session.id, "farm-profile");

        // Test farm information editing
        await page.click("text=Edit Profile");
        await page.fill('[name="farmDescription"]', "Organic family farm");
        await page.click('button:has-text("Save")');

        await expect(page.locator("text=Profile updated")).toBeVisible();

        await deviceManager.captureScreenshot(session.id, "profile-updated");

        // Test product catalog
        await page.click("text=Products");
        await expect(
          page.locator('[data-testid="product-list"]'),
        ).toBeVisible();

        await deviceManager.captureScreenshot(session.id, "product-catalog");

        deviceManager.log(session.id, "info", "Farm profile test completed");

        await deviceManager.endSession(session.id, true);
      } catch (error) {
        deviceManager.log(
          session.id,
          "error",
          "Farm profile test failed",
          error,
        );
        await deviceManager.endSession(session.id, false);
        throw error;
      }
    });

    test(`${deviceConfig.deviceName} - Seasonal product browsing`, async ({
      page,
    }) => {
      const session = await deviceManager.startSession(deviceConfig);

      try {
        deviceManager.log(
          session.id,
          "info",
          "Testing seasonal product features",
        );

        await page.goto("/marketplace");

        // Filter by season
        await page.click("text=Filters");
        await page.click("text=Seasonal");
        await page.click("text=Spring");

        await deviceManager.captureScreenshot(session.id, "spring-products");

        await expect(page.locator('[data-testid="product-card"]')).toHaveCount(
          { min: 1 },
          { timeout: 5000 },
        );

        // Switch seasons
        await page.click("text=Summer");

        await deviceManager.captureScreenshot(session.id, "summer-products");

        deviceManager.log(
          session.id,
          "info",
          "Seasonal browsing test completed",
        );

        await deviceManager.endSession(session.id, true);
      } catch (error) {
        deviceManager.log(session.id, "error", "Seasonal test failed", error);
        await deviceManager.endSession(session.id, false);
        throw error;
      }
    });
  }
});

// ============================================================================
// Network Condition Tests
// ============================================================================

test.describe("🌐 Real Device - Network Conditions", () => {
  const networkTests = [
    { condition: "5G" as const, maxLoadTime: 2000 },
    { condition: "4G" as const, maxLoadTime: 3000 },
    { condition: "3G" as const, maxLoadTime: 5000 },
    { condition: "2G" as const, maxLoadTime: 10000 },
  ];

  for (const { condition, maxLoadTime } of networkTests) {
    test(`should work on ${condition} network`, async ({ page }) => {
      const deviceConfig: RealDeviceConfig = {
        ...DEVICE_CONFIGS[0],
        networkCondition: condition,
      };

      const session = await deviceManager.startSession(deviceConfig);

      try {
        const startTime = Date.now();

        await page.goto("/", { waitUntil: "domcontentloaded" });

        const loadTime = Date.now() - startTime;

        deviceManager.updateMetrics(session.id, {
          pageLoadTime: loadTime,
          networkLatency: loadTime / 2,
        });

        deviceManager.log(
          session.id,
          "info",
          `Page loaded in ${loadTime}ms on ${condition} network`,
        );

        // Should load within acceptable time for network condition
        expect(loadTime).toBeLessThan(maxLoadTime);

        await deviceManager.endSession(session.id, true);
      } catch (error) {
        await deviceManager.endSession(session.id, false);
        throw error;
      }
    });
  }
});

// ============================================================================
// Device Capability Tests
// ============================================================================

test.describe("📱 Real Device - Device Capabilities", () => {
  test("should handle touch gestures on mobile devices", async ({ page }) => {
    const mobileDevice = DEVICE_CONFIGS.find((d) => d.deviceType === "mobile")!;
    const session = await deviceManager.startSession(mobileDevice);

    try {
      await page.goto("/marketplace");

      // Simulate swipe/scroll
      await page.mouse.move(200, 400);
      await page.mouse.down();
      await page.mouse.move(200, 200);
      await page.mouse.up();

      await deviceManager.captureScreenshot(session.id, "after-swipe");

      // Verify content loaded
      await expect(
        page.locator('[data-testid="product-card"]').first(),
      ).toBeVisible();

      await deviceManager.endSession(session.id, true);
    } catch (error) {
      await deviceManager.endSession(session.id, false);
      throw error;
    }
  });

  test("should support tablet landscape mode", async ({ page }) => {
    const tabletDevice = DEVICE_CONFIGS.find((d) => d.deviceType === "tablet")!;
    const session = await deviceManager.startSession(tabletDevice);

    try {
      await page.goto("/marketplace");
      await page.setViewportSize({ width: 1024, height: 768 });

      await deviceManager.captureScreenshot(session.id, "tablet-landscape");

      // Should show multi-column layout
      const productGrid = page.locator('[data-testid="product-grid"]');
      await expect(productGrid).toBeVisible();

      await deviceManager.endSession(session.id, true);
    } catch (error) {
      await deviceManager.endSession(session.id, false);
      throw error;
    }
  });
});

// ============================================================================
// Battery and Resource Tests
// ============================================================================

test.describe("🔋 Real Device - Resource Usage", () => {
  test("should monitor battery drain during extended use", async ({ page }) => {
    const session = await deviceManager.startSession(DEVICE_CONFIGS[0]);

    try {
      const initialBattery = await deviceManager.getBatteryLevel(session.id);

      // Simulate extended use
      for (let i = 0; i < 5; i++) {
        await page.goto("/marketplace");
        await page.waitForTimeout(2000);
        await page.reload();
      }

      const finalBattery = await deviceManager.getBatteryLevel(session.id);
      const batteryDrain = initialBattery - finalBattery;

      deviceManager.updateMetrics(session.id, {
        batteryDrain,
      });

      deviceManager.log(
        session.id,
        "info",
        `Battery drain: ${batteryDrain}% over extended use`,
      );

      // Battery drain should be reasonable
      expect(batteryDrain).toBeLessThan(10);

      await deviceManager.endSession(session.id, true);
    } catch (error) {
      await deviceManager.endSession(session.id, false);
      throw error;
    }
  });
});
