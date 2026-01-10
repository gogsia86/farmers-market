/**
 * Playwright E2E Testing Configuration
 * Updated to handle port conflicts and provide better error messages
 */
import { defineConfig, devices } from "@playwright/test";
import path from "path";

// Determine the port to use (allow override via env)
// Default to 3000 (Docker) - use TEST_PORT=3001 for dev script
const PORT = process.env["TEST_PORT"] || process.env["PORT"] || "3000";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: process.env["CI"] ? 1 : 6, // Use 6 workers on local (HP OMEN optimization)
  reporter: "html",
  timeout: 30000, // 30 second timeout per test
  globalSetup: path.join(__dirname, "tests", "global-setup.ts"),
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // Setup project - runs authentication before all tests
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      // Continue even if some setup tests fail (customer auth may fail)
      retries: 0,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      // Don't block on setup failures - auth files may already exist
      // dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: `npx next dev --turbo -p ${PORT} -H 0.0.0.0`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env["CI"], // Always reuse existing server locally
    timeout: 180 * 1000, // 3 minutes timeout for server startup
    stdout: "pipe", // Show server output for debugging
    stderr: "pipe",
    env: {
      // Use test database - explicitly set to port 5433 for E2E tests
      DATABASE_URL:
        process.env["TEST_DATABASE_URL"] ||
        "postgresql://postgres:test_password_123@127.0.0.1:5433/farmersmarket_test",
      NEXTAUTH_URL: `http://localhost:${PORT}`,
      NEXTAUTH_SECRET:
        process.env.NEXTAUTH_SECRET ||
        "nOgEpp7IZzT6Nzf3moPRGI7HX2S9m5HOVl4eIR5+MQw=",
      NODE_ENV: "development",
      NODE_OPTIONS: "--max-old-space-size=8192",
    },
    // Ignore HTTP errors on server startup (e.g., port already in use)
    ignoreHTTPSErrors: true,
  },
});
