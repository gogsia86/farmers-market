#!/usr/bin/env node

/**
 * 🧪 E2E TEST RUNNER
 * Divine end-to-end testing orchestration
 *
 * This script:
 * - Starts the Next.js dev server
 * - Waits for server to be ready
 * - Runs Playwright tests
 * - Cleans up gracefully on exit
 */

const { spawn } = require("child_process");
const http = require("http");

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEV_SERVER_PORT = process.env.PORT || 3000;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;
const MAX_WAIT_TIME = 120000; // 2 minutes
const CHECK_INTERVAL = 1000; // 1 second

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Check if server is ready by making an HTTP request
 */
function checkServerReady() {
  return new Promise((resolve) => {
    const request = http.get(DEV_SERVER_URL, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304);
    });

    request.on("error", () => {
      resolve(false);
    });

    request.setTimeout(2000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

/**
 * Wait for server to be ready
 */
async function waitForServer() {
  console.log(`⏳ Waiting for dev server at ${DEV_SERVER_URL}...`);

  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    const isReady = await checkServerReady();

    if (isReady) {
      console.log("✅ Dev server is ready!");
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
  }

  console.error("❌ Dev server failed to start within timeout");
  return false;
}

/**
 * Kill process gracefully
 */
function killProcess(proc) {
  if (!proc || proc.killed) return;

  try {
    // On Windows, use taskkill to kill the entire process tree
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", proc.pid, "/f", "/t"]);
    } else {
      proc.kill("SIGTERM");

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill("SIGKILL");
        }
      }, 5000);
    }
  } catch (error) {
    console.error("Error killing process:", error.message);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("🚀 Starting E2E Test Runner...\n");

  let devServer = null;
  let playwrightProcess = null;
  let exitCode = 0;
  let alreadyRunning = false;

  try {
    // Step 1: Check if server is already running
    console.log("🔍 Checking if dev server is already running...");
    alreadyRunning = await checkServerReady();

    if (!alreadyRunning) {
      // Step 2: Start dev server
      console.log("🏗️  Starting Next.js dev server...\n");

      devServer = spawn("npm", ["run", "dev"], {
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
        env: {
          ...process.env,
          PORT: DEV_SERVER_PORT.toString(),
          NODE_ENV: "development",
        },
      });

      // Log dev server output
      devServer.stdout.on("data", (data) => {
        const output = data.toString();
        if (output.includes("Ready") || output.includes("started server")) {
          console.log("📡", output.trim());
        }
      });

      devServer.stderr.on("data", (data) => {
        const error = data.toString();
        // Ignore common Next.js warnings
        if (!error.includes("webpack") && !error.includes("source-map")) {
          console.error("🔴", error.trim());
        }
      });

      devServer.on("error", (error) => {
        console.error("❌ Failed to start dev server:", error);
      });

      // Step 3: Wait for server to be ready
      const serverReady = await waitForServer();

      if (!serverReady) {
        throw new Error("Dev server failed to start");
      }
    } else {
      console.log("✅ Dev server already running!\n");
    }

    // Step 4: Run Playwright tests
    console.log("\n🎭 Running Playwright tests...\n");

    const playwrightArgs = [
      "playwright",
      "test",
      "--workers=6",
      ...process.argv.slice(2), // Pass through any additional arguments
    ];

    playwrightProcess = spawn("npx", playwrightArgs, {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        BASE_URL: DEV_SERVER_URL,
      },
    });

    // Wait for Playwright to complete
    exitCode = await new Promise((resolve) => {
      playwrightProcess.on("close", (code) => {
        resolve(code || 0);
      });

      playwrightProcess.on("error", (error) => {
        console.error("❌ Failed to run Playwright:", error);
        resolve(1);
      });
    });

    if (exitCode === 0) {
      console.log("\n✅ E2E tests completed successfully!");
    } else {
      console.error(`\n❌ E2E tests failed with exit code ${exitCode}`);
    }
  } catch (error) {
    console.error("\n❌ E2E test runner failed:", error.message);
    exitCode = 1;
  } finally {
    // Cleanup
    console.log("\n🧹 Cleaning up...");

    if (devServer && !alreadyRunning) {
      console.log("🛑 Stopping dev server...");
      killProcess(devServer);
    }

    if (playwrightProcess) {
      killProcess(playwrightProcess);
    }

    console.log("✅ Cleanup complete");
  }

  process.exit(exitCode);
}

// ============================================================================
// SIGNAL HANDLERS
// ============================================================================

// Handle CTRL+C and other termination signals
process.on("SIGINT", () => {
  console.log("\n⚠️  Received SIGINT, shutting down gracefully...");
  process.exit(130);
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  Received SIGTERM, shutting down gracefully...");
  process.exit(143);
});

// ============================================================================
// RUN
// ============================================================================

main();
