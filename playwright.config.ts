/**
 * Playwright E2E Testing Configuration
 * Updated to handle port conflicts and provide better error messages
 */
import { defineConfig, devices } from "@playwright/test";

// Determine the port to use (allow override via env)
const PORT = process.env.TEST_PORT || process.env.PORT || "3001";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 6, // Use 6 workers on local (HP OMEN optimization)
  reporter: "html",
  timeout: 30000, // 30 second timeout per test
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI, // Always reuse existing server locally
    timeout: 300 * 1000, // Increased timeout to 5 minutes for initial build
    stdout: "pipe", // Show server output for debugging
    stderr: "pipe",
    env: {
      // Use test database or skip DB if DATABASE_URL not set
      DATABASE_URL:
        process.env.DATABASE_URL || process.env.TEST_DATABASE_URL || "",
      NODE_ENV: process.env.CI ? "test" : "development",
      PORT: PORT,
    },
    // Ignore HTTP errors on server startup (e.g., port already in use)
    ignoreHTTPSErrors: true,
  },
});
