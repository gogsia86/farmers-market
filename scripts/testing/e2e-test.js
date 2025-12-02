#!/usr/bin/env node

/**
 * E2E Test Helper Script
 * Checks if dev server is running before executing E2E tests
 * Provides clear instructions and error handling
 */

const http = require("http");
const { spawn } = require("child_process");

const PORT = process.env.TEST_PORT || process.env.PORT || 3000;
const HOST = "localhost";
const BASE_URL = `http://${HOST}:${PORT}`;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// ASCII Art Banner
console.log(`
╔════════════════════════════════════════════════════════════╗
║  🌾 Farmers Market Platform - E2E Test Runner             ║
║  Divine Agricultural Testing Infrastructure               ║
╚════════════════════════════════════════════════════════════╝
`);

/**
 * Check if server is running on the specified port
 */
function checkServerRunning(retries = 0) {
  return new Promise((resolve, reject) => {
    const req = http.get(BASE_URL, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on("error", (err) => {
      if (err.code === "ECONNREFUSED") {
        if (retries < MAX_RETRIES) {
          console.log(
            `⏳ Waiting for server to start... (attempt ${retries + 1}/${MAX_RETRIES})`,
          );
          setTimeout(() => {
            checkServerRunning(retries + 1)
              .then(resolve)
              .catch(reject);
          }, RETRY_DELAY);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Display instructions for manual server start
 */
function displayManualStartInstructions() {
  console.log(`
❌ Server is not running on ${BASE_URL}

📋 To run E2E tests, you need to start the dev server first:

Option 1: Manual Start (Recommended)
────────────────────────────────────────────────────────────
1. Open a new terminal window
2. Run: npm run dev
3. Wait for "Ready on http://localhost:${PORT}"
4. Then run: npm run test:e2e

Option 2: Automatic with PM2 (Advanced)
────────────────────────────────────────────────────────────
1. Install PM2: npm install -g pm2
2. Start server: pm2 start "npm run dev" --name farmers-market
3. Run tests: npm run test:e2e
4. Stop server: pm2 stop farmers-market

Option 3: Use Playwright's webServer (Automatic)
────────────────────────────────────────────────────────────
The Playwright config will automatically start the server,
but you need to ensure no other process is using port ${PORT}.

To check what's using port ${PORT}:
  Windows: netstat -ano | findstr :${PORT}
  Linux/Mac: lsof -i :${PORT}

To kill process on port ${PORT}:
  Windows: taskkill /PID <PID> /F
  Linux/Mac: kill -9 <PID>

────────────────────────────────────────────────────────────
🌾 Agricultural Consciousness: Patience is key in farming!
────────────────────────────────────────────────────────────
`);
}

/**
 * Run Playwright E2E tests
 */
function runPlaywrightTests() {
  console.log(`✅ Server is running on ${BASE_URL}`);
  console.log("🧪 Starting Playwright E2E tests...\n");

  const playwrightArgs = process.argv.slice(2);
  const playwrightCmd = process.platform === "win32" ? "npx.cmd" : "npx";

  const playwright = spawn(
    playwrightCmd,
    ["playwright", "test", ...playwrightArgs],
    {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        BASE_URL,
        TEST_PORT: PORT,
      },
    },
  );

  playwright.on("close", (code) => {
    if (code === 0) {
      console.log("\n✅ E2E tests completed successfully!");
    } else {
      console.log(`\n❌ E2E tests failed with exit code ${code}`);
    }
    process.exit(code);
  });

  playwright.on("error", (err) => {
    console.error("\n❌ Failed to start Playwright:", err);
    process.exit(1);
  });
}

/**
 * Main execution
 */
async function main() {
  console.log(`🔍 Checking if server is running on ${BASE_URL}...`);

  const isRunning = await checkServerRunning();

  if (isRunning) {
    runPlaywrightTests();
  } else {
    displayManualStartInstructions();
    process.exit(1);
  }
}

// Handle termination signals
process.on("SIGINT", () => {
  console.log("\n\n🛑 E2E tests interrupted by user");
  process.exit(130);
});

process.on("SIGTERM", () => {
  console.log("\n\n🛑 E2E tests terminated");
  process.exit(143);
});

// Run main function
main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
