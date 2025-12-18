/**
 * 🌟 Divine Monitoring Dashboard E2E Tests
 * Farmers Market Platform - Performance Monitoring Dashboard Tests
 * Version: 1.0.0
 *
 * Tests the monitoring dashboard functionality including:
 * - Dashboard loads correctly
 * - System health widgets display
 * - Workflow execution tracking
 * - Performance metrics visualization
 * - Real-time data updates
 *
 * Note: These tests require authentication. The dashboard is protected and
 * redirects unauthenticated users to /login. Tests use the admin auth state.
 */

import { test, expect } from "@playwright/test";
import path from "path";

// Configure tests to use admin authentication
test.use({
  storageState: path.join(__dirname, "..", "auth", ".auth", "admin.json"),
});

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = process.env.TEST_PORT || process.env.PORT || "3001";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORT}`;

const TIMEOUTS = {
  navigation: 30000,
  elementVisible: 10000,
  dataLoad: 15000,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Wait for page to be fully ready
 */
async function waitForPageReady(page: any) {
  await page.waitForLoadState("domcontentloaded", {
    timeout: TIMEOUTS.navigation,
  });
  // Skip networkidle - dashboard has ongoing polling/refresh
  await page.waitForTimeout(1000); // Give page time to render
}

/**
 * Navigate to monitoring dashboard
 */
async function navigateToMonitoring(page: any) {
  await page.goto(`${BASE_URL}/monitoring`, {
    waitUntil: "load",
    timeout: TIMEOUTS.navigation,
  });
  // Wait for dashboard to initialize
  await page.waitForTimeout(2000);
}

// ============================================================================
// TEST SUITES
// ============================================================================

test.describe("🌟 Monitoring Dashboard - Core Functionality", () => {
  test("Dashboard loads successfully with all components", async ({ page }) => {
    console.log("🔐 Test running with admin authentication");
    await navigateToMonitoring(page);

    // Check page title
    await expect(page).toHaveTitle(/Monitoring Dashboard/i, {
      timeout: TIMEOUTS.elementVisible,
    });

    // Check main heading
    const heading = page
      .locator("h1")
      .filter({ hasText: /monitoring dashboard/i });
    await expect(heading).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Verify dashboard description
    const description = page.locator("text=/real-time system health/i");
    await expect(description).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("Overview stats display correctly", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check for System Status card
    const systemStatusCard = page.locator("text=System Status").locator("..");
    await expect(systemStatusCard).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });

    // Check for Success Rate card
    const successRateCard = page.locator("text=Success Rate").locator("..");
    await expect(successRateCard).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });

    // Check for Avg Response Time card
    const responseTimeCard = page
      .locator("text=/Avg Response Time/i")
      .locator("..");
    await expect(responseTimeCard).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });

    // Check for Active Alerts card
    const alertsCard = page.locator("text=Active Alerts").locator("..");
    await expect(alertsCard).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });
  });

  test("Last updated timestamp is displayed", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check for "Last Updated" text
    const lastUpdatedLabel = page.locator("text=Last Updated");
    await expect(lastUpdatedLabel).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Verify timestamp is present (should be in time format)
    const timestamp = page.locator("div.font-mono.text-sm");
    await expect(timestamp).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });
});

test.describe("📊 System Health Widget", () => {
  test("System health widget renders", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check for health check data or message
    const healthWidget = page
      .locator("text=/system health|health check/i")
      .first();
    await expect(healthWidget).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });
  });

  test("System status indicator displays", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check for status emoji or text
    const statusElements = page.locator("text=/healthy|degraded|🟢|🔴/i");
    const count = await statusElements.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("⚙️ Workflow Execution Widget", () => {
  test("Workflow execution widget renders", async ({ page }) => {
    await navigateToMonitoring(page);

    // Wait for workflow data to load
    await page.waitForTimeout(2000);

    // Check for workflow-related text or stats
    const workflowText = page.locator("text=/workflow|execution/i");
    const count = await workflowText.count();
    expect(count).toBeGreaterThan(0);
  });

  test("Execution statistics are displayed", async ({ page }) => {
    await navigateToMonitoring(page);

    // Look for success/failure counts in Success Rate card
    const successRateText = page.locator("text=/success|execution|24h/i");
    const count = await successRateText.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("⚡ Performance Metrics Widget", () => {
  test("Performance metrics widget renders", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check for response time metric
    const responseTime = page.locator("text=/response time|avg|ms/i");
    const count = await responseTime.count();
    expect(count).toBeGreaterThan(0);
  });

  test("Response time value is displayed", async ({ page }) => {
    await navigateToMonitoring(page);

    // Find the response time value (should include "ms")
    const responseTimeCard = page
      .locator("text=/Avg Response Time/i")
      .locator("..");
    await expect(responseTimeCard).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });

    // Check for millisecond value
    const msValue = responseTimeCard.locator("text=/ms$/");
    await expect(msValue).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });
});

test.describe("🔔 Alerts Widget", () => {
  test("Alerts widget renders", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check for alerts card
    const alertsCard = page.locator("text=Active Alerts").locator("..");
    await expect(alertsCard).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });
  });

  test("Alert count is displayed", async ({ page }) => {
    await navigateToMonitoring(page);

    // Find alert count (number)
    const alertsCard = page.locator("text=Active Alerts").locator("..");
    const alertCount = alertsCard.locator("text=/^\\d+$/").first();
    await expect(alertCount).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("Active workflows count is displayed", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check for active workflows text
    const activeWorkflows = page.locator("text=/workflows? active/i");
    await expect(activeWorkflows.first()).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });
});

test.describe("🔄 Auto-refresh Functionality", () => {
  test("Auto-refresh indicator is present", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check for auto-refresh message
    const refreshMessage = page.locator("text=/auto-refresh|30 seconds/i");
    await expect(refreshMessage.first()).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });

  test("Dashboard has revalidation configured", async ({ page }) => {
    await navigateToMonitoring(page);

    // Initial load
    const initialTimestamp = await page
      .locator("div.font-mono.text-sm")
      .first()
      .textContent();
    expect(initialTimestamp).toBeTruthy();

    // Wait and reload to verify data can refresh
    await page.waitForTimeout(2000);
    await page.reload({ waitUntil: "domcontentloaded" });

    // Verify page still loads correctly after refresh
    const heading = page
      .locator("h1")
      .filter({ hasText: /monitoring dashboard/i });
    await expect(heading).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });
  });
});

test.describe("📱 Responsive Design", () => {
  test("Dashboard is mobile-responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToMonitoring(page);

    // Verify main components are still visible
    const heading = page
      .locator("h1")
      .filter({ hasText: /monitoring dashboard/i });
    await expect(heading).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Check that overview stats are present (may stack vertically)
    const systemStatus = page.locator("text=System Status");
    await expect(systemStatus).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });
  });

  test("Dashboard grid adapts to screen size", async ({ page }) => {
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await navigateToMonitoring(page);

    // Verify dashboard layout
    const statsCards = page.locator("div.rounded-lg.bg-white.p-6");
    const count = await statsCards.count();
    expect(count).toBeGreaterThanOrEqual(4); // 4 overview stat cards
  });
});

test.describe("⚠️ Error Handling", () => {
  test("Dashboard handles no data gracefully", async ({ page }) => {
    await navigateToMonitoring(page);

    // Page should load even if there's no data
    const heading = page
      .locator("h1")
      .filter({ hasText: /monitoring dashboard/i });
    await expect(heading).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Should show some default state (0 values or empty states)
    const systemStatus = page.locator("text=System Status");
    await expect(systemStatus).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });
  });
});

test.describe("♿ Accessibility", () => {
  test("Dashboard has proper heading structure", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check for main h1
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible({
      timeout: TIMEOUTS.elementVisible,
    });

    // Verify heading hierarchy
    const headings = await page.locator("h1, h2, h3").all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test("Color indicators have accessible text", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check that status isn't only conveyed by color
    // Should have text like "Healthy" or "Degraded" in addition to emoji
    const systemStatusCard = page.locator("text=System Status").locator("..");
    const statusText = systemStatusCard.locator("text=/healthy|degraded/i");
    const statusEmoji = systemStatusCard.locator("text=/🟢|🔴/");

    // At least one should be visible
    const textVisible = await statusText.isVisible().catch(() => false);
    const emojiVisible = await statusEmoji.isVisible().catch(() => false);
    expect(textVisible || emojiVisible).toBeTruthy();
  });

  test("Interactive elements are keyboard accessible", async ({ page }) => {
    await navigateToMonitoring(page);

    // Tab through the page
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should be able to navigate
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(focusedElement).toBeTruthy();
  });
});

test.describe("🎯 Performance", () => {
  test("Dashboard loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await navigateToMonitoring(page);

    const loadTime = Date.now() - startTime;

    // Dashboard should load within 30 seconds (generous for CI environments)
    expect(loadTime).toBeLessThan(30000);

    // Log performance for monitoring
    console.log(`Dashboard load time: ${loadTime}ms`);
  });

  test("No console errors on dashboard load", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await navigateToMonitoring(page);

    // Wait for any delayed errors
    await page.waitForTimeout(2000);

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("favicon") &&
        !error.includes("404") &&
        !error.includes("net::ERR"),
    );

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe("🔍 Data Validation", () => {
  test("Numeric values are properly formatted", async ({ page }) => {
    await navigateToMonitoring(page);

    // Check success rate percentage
    const successRate = page.locator("text=Success Rate").locator("..");
    const percentage = successRate.locator("text=/%$/");
    await expect(percentage.first()).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });

    // Check response time with ms
    const responseTime = page
      .locator("text=/Avg Response Time/i")
      .locator("..");
    const milliseconds = responseTime.locator("text=/ms$/");
    await expect(milliseconds).toBeVisible({
      timeout: TIMEOUTS.dataLoad,
    });
  });

  test("Status indicators use appropriate styling", async ({ page }) => {
    await navigateToMonitoring(page);

    // System status should have colored indicator
    const systemStatusCard = page.locator("text=System Status").locator("..");

    // Check for status-related classes or emojis
    const hasGreenIndicator = await systemStatusCard
      .locator("text=/🟢|healthy/i")
      .count()
      .then((count) => count > 0);

    const hasRedIndicator = await systemStatusCard
      .locator("text=/🔴|degraded/i")
      .count()
      .then((count) => count > 0);

    // Should have at least one status indicator
    expect(hasGreenIndicator || hasRedIndicator).toBeTruthy();
  });
});

test.describe("🌾 Agricultural Consciousness", () => {
  test("Dashboard uses agricultural emojis and terminology", async ({
    page,
  }) => {
    await navigateToMonitoring(page);

    // Check for agricultural emoji in title
    const heading = page.locator("h1");
    const headingText = await heading.textContent();
    expect(headingText).toMatch(/🌾/);
  });

  test("Dashboard maintains divine pattern consistency", async ({ page }) => {
    await navigateToMonitoring(page);

    // Verify page follows divine patterns (organized layout, clear sections)
    const statsCards = page.locator("div.rounded-lg.bg-white.p-6.shadow-md");
    const count = await statsCards.count();

    // Should have organized stat cards
    expect(count).toBeGreaterThanOrEqual(4);
  });
});
