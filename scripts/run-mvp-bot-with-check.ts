#!/usr/bin/env tsx

/**
 * MVP Bot Runner with Server Check
 *
 * This script checks if the dev server is running before starting the MVP validation bot.
 * If the server is not running, it provides instructions to start it.
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const BASE_URL =
  process.env.BASE_URL || "https://farmers-market-platform.vercel.app";
const MAX_RETRIES = 30;
const RETRY_DELAY = 2000; // 2 seconds

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkServer(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok || response.status === 404 || response.status === 302;
  } catch (error) {
    return false;
  }
}

async function waitForServer(
  url: string,
  maxRetries: number,
): Promise<boolean> {
  log(`\n🔍 Checking if server is running at ${url}...`, colors.cyan);

  for (let i = 1; i <= maxRetries; i++) {
    const isRunning = await checkServer(url);

    if (isRunning) {
      log(`✅ Server is running!`, colors.green);
      return true;
    }

    if (i < maxRetries) {
      log(
        `⏳ Server not ready yet (attempt ${i}/${maxRetries})... retrying in ${RETRY_DELAY / 1000}s`,
        colors.yellow,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  return false;
}

async function runMvpBot() {
  try {
    log(`\n🤖 Starting MVP Validation Bot...`, colors.bright + colors.blue);
    log(`📍 Target URL: ${BASE_URL}\n`, colors.cyan);

    // Run the bot
    const { stdout, stderr } = await execAsync(
      `cross-env BASE_URL=${BASE_URL} TEST_USER_PASSWORD=TestBot123! tsx scripts/mvp-validation-bot.ts`,
      {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      },
    );

    if (stdout) {
      console.log(stdout);
    }

    if (stderr) {
      console.error(stderr);
    }

    log(`\n✅ MVP Bot completed successfully!`, colors.green);
  } catch (error: any) {
    if (error.stdout) {
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.error(error.stderr);
    }

    log(`\n❌ MVP Bot failed with error:`, colors.red);
    console.error(error.message);
    process.exit(1);
  }
}

async function main() {
  log(`\n${"=".repeat(60)}`, colors.bright);
  log(`🤖 MVP VALIDATION BOT RUNNER`, colors.bright + colors.blue);
  log(`${"=".repeat(60)}\n`, colors.bright);

  // Check if server is running
  const serverRunning = await waitForServer(BASE_URL, MAX_RETRIES);

  if (!serverRunning) {
    log(`\n${"=".repeat(60)}`, colors.red);
    log(`❌ SERVER NOT RUNNING`, colors.bright + colors.red);
    log(`${"=".repeat(60)}\n`, colors.red);

    log(`The development server is not running at ${BASE_URL}`, colors.yellow);
    log(`\nPlease start the server first:\n`, colors.yellow);
    log(`  1. Open a NEW terminal window`, colors.cyan);
    log(`  2. Navigate to: ${process.cwd()}`, colors.cyan);
    log(`  3. Run: ${colors.bright}npm run dev${colors.reset}`, colors.cyan);
    log(`  4. Wait for "Ready" message`, colors.cyan);
    log(
      `  5. Come back to this terminal and run this script again\n`,
      colors.cyan,
    );

    log(`Alternative: Run both server and bot together:`, colors.yellow);
    log(`  ${colors.bright}npm run server:bot${colors.reset}\n`, colors.cyan);

    process.exit(1);
  }

  // Server is running, proceed with bot
  await runMvpBot();
}

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
