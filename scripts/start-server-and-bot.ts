#!/usr/bin/env tsx
/**
 * 🚀 DIVINE SERVER & BOT STARTUP SCRIPT
 * Farmers Market Platform - Complete System Startup
 *
 * This script:
 * 1. Checks environment configuration
 * 2. Starts the Next.js development server
 * 3. Waits for server to be ready
 * 4. Runs the monitoring bot
 *
 * Usage:
 *   npm run start:all
 *   npx tsx scripts/start-server-and-bot.ts
 */

import { spawn, exec } from "child_process";
import { promisify } from "util";
import * as http from "http";
import * as fs from "fs";

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
  console.log("\n" + "=".repeat(70));
  log(title, "bright");
  console.log("=".repeat(70) + "\n");
}

// Check if port is in use
async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Check if server is responding
async function checkServer(url: string, maxAttempts = 30): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode === 200 || res.statusCode === 404) {
            resolve();
          } else {
            reject(new Error(`Status: ${res.statusCode}`));
          }
        });
        req.on("error", reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error("Timeout"));
        });
      });

      log(`✅ Server is responding!`, "green");
      return true;
    } catch (error) {
      if (attempt < maxAttempts) {
        process.stdout.write(
          `\r⏳ Waiting for server (attempt ${attempt}/${maxAttempts})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  console.log(""); // New line after progress
  return false;
}

// Check environment variables
function checkEnvironment(): boolean {
  section("📋 ENVIRONMENT CHECK");

  const required = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"];

  const recommended = ["NEXT_PUBLIC_APP_URL"];

  let allRequired = true;

  // Check required variables
  for (const varName of required) {
    if (process.env[varName]) {
      log(`✅ ${varName}: Set`, "green");
    } else {
      log(`❌ ${varName}: Missing`, "red");
      allRequired = false;
    }
  }

  // Check recommended variables
  for (const varName of recommended) {
    if (process.env[varName]) {
      log(`✅ ${varName}: ${process.env[varName]}`, "green");
    } else {
      log(`⚠️  ${varName}: Not set (using default)`, "yellow");
    }
  }

  if (!allRequired) {
    log("\n❌ Missing required environment variables!", "red");
    log("Create a .env.local file with the required variables.", "yellow");
    return false;
  }

  return true;
}

// Kill existing server on port
async function killPortProcess(port: number): Promise<void> {
  try {
    if (process.platform === "win32") {
      // Windows
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split("\n");

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid))) {
          try {
            await execAsync(`taskkill /F /PID ${pid}`);
            log(`Killed process ${pid} on port ${port}`, "yellow");
          } catch {
            // Process might already be dead
          }
        }
      }
    } else {
      // Unix-like systems
      const { stdout } = await execAsync(`lsof -ti:${port} || echo "none"`);
      const pid = stdout.trim();
      if (pid && pid !== "none" && !isNaN(Number(pid))) {
        await execAsync(`kill -9 ${pid}`);
        log(`Killed process ${pid} on port ${port}`, "yellow");
      }
    }
  } catch (error) {
    // Ignore errors - port might not be in use
  }
}

// Start development server
async function startDevServer(): Promise<void> {
  section("🚀 STARTING DEVELOPMENT SERVER");

  const port = 3001;

  // Check if port is already in use
  const inUse = await isPortInUse(port);
  if (inUse) {
    log(`⚠️  Port ${port} is already in use`, "yellow");
    log(`Attempting to kill existing process...`, "yellow");
    await killPortProcess(port);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  log(`Starting Next.js dev server on port ${port}...`, "cyan");

  // Start the dev server
  const serverProcess = spawn("npm", ["run", "dev"], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
    detached: false,
  });

  // Handle server output
  serverProcess.stdout?.on("data", (data) => {
    const output = data.toString();
    if (
      output.includes("Ready") ||
      output.includes("compiled") ||
      output.includes("started")
    ) {
      process.stdout.write(colors.green + output + colors.reset);
    } else if (output.includes("error") || output.includes("Error")) {
      process.stdout.write(colors.red + output + colors.reset);
    }
  });

  serverProcess.stderr?.on("data", (data) => {
    const output = data.toString();
    // Only show actual errors, not warnings
    if (output.toLowerCase().includes("error")) {
      process.stderr.write(colors.red + output + colors.reset);
    }
  });

  serverProcess.on("error", (error) => {
    log(`❌ Failed to start server: ${error.message}`, "red");
    process.exit(1);
  });

  // Wait for server to be ready
  log("\n⏳ Waiting for server to start...", "cyan");
  const serverReady = await checkServer(
    `http://localhost:${port}/api/health`,
    30,
  );

  if (!serverReady) {
    log("\n❌ Server failed to start or is not responding", "red");
    serverProcess.kill();
    process.exit(1);
  }

  log("\n✅ Development server is running!", "green");
  log(`   📍 URL: http://localhost:${port}`, "cyan");
  log(`   🔍 API: http://localhost:${port}/api/health`, "cyan");

  // Keep server running in background
  return;
}

// Run monitoring bot
async function runMonitoringBot(): Promise<void> {
  section("🤖 RUNNING MONITORING BOT");

  log("Initializing Divine Workflow Monitoring Bot...", "cyan");

  try {
    // Import and run the bot
    const { createMonitoringBot } = await import("../src/lib/monitoring/bot");

    const bot = createMonitoringBot({
      baseUrl: "http://localhost:3001",
      performance: {
        parallel: false, // Sequential to avoid browser crashes
        maxConcurrency: 1,
        timeout: 300000,
        screenshotOnFailure: true,
        traceOnFailure: true,
      },
    });

    log("\n🔄 Running health check workflow...", "cyan");
    await bot.start();

    // Run critical workflows
    log("\n🔄 Running critical workflows...", "cyan");
    const report = await bot.runCriticalWorkflows();

    // Display results
    section("📊 MONITORING RESULTS");

    const passed = report.results.filter((r) => r.status === "PASSED").length;
    const failed = report.results.filter((r) => r.status === "FAILED").length;
    const total = report.results.length;

    log(`Total Workflows: ${total}`, "bright");
    log(`✅ Passed: ${passed}`, passed > 0 ? "green" : "reset");
    log(`❌ Failed: ${failed}`, failed > 0 ? "red" : "reset");
    log(`⏱️  Duration: ${report.duration.toFixed(2)}ms`, "cyan");

    // Show individual results
    console.log("\n" + "-".repeat(70));
    for (const result of report.results) {
      const icon = result.status === "PASSED" ? "✅" : "❌";
      const color = result.status === "PASSED" ? "green" : "red";
      log(`${icon} ${result.workflow.name}`, color);
      if (result.error) {
        log(`   Error: ${result.error}`, "red");
      }
    }
    console.log("-".repeat(70));

    // Show report location
    if (report.reportPath) {
      log(`\n📄 Full report saved to: ${report.reportPath}`, "cyan");
    }

    await bot.stop();

    if (failed > 0) {
      log(
        "\n⚠️  Some workflows failed. Check the report for details.",
        "yellow",
      );
    } else {
      log("\n✅ All workflows passed successfully!", "green");
    }
  } catch (error) {
    log("\n❌ Failed to run monitoring bot:", "red");
    log(
      `   ${error instanceof Error ? error.message : "Unknown error"}`,
      "red",
    );

    if (error instanceof Error && error.stack) {
      log("\n" + error.stack, "red");
    }

    throw error;
  }
}

// Main execution
async function main() {
  log(
    "╔════════════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  log(
    "║       🌾 FARMERS MARKET PLATFORM - STARTUP SCRIPT                  ║",
    "cyan",
  );
  log(
    "║       Divine Agricultural E-Commerce System                        ║",
    "cyan",
  );
  log(
    "╚════════════════════════════════════════════════════════════════════╝",
    "cyan",
  );

  try {
    // Step 1: Check environment
    const envOk = checkEnvironment();
    if (!envOk) {
      log(
        "\n💡 Tip: Run 'bash scripts/fix-env-url.sh' to fix environment variables",
        "yellow",
      );
      process.exit(1);
    }

    // Step 2: Start dev server
    await startDevServer();

    // Wait a bit for server to fully initialize
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 3: Run monitoring bot
    await runMonitoringBot();

    // Final message
    section("✅ STARTUP COMPLETE");
    log("Server is running in the background.", "green");
    log("Monitoring bot has completed its checks.", "green");
    log("\nNext steps:", "bright");
    log("1. Visit http://localhost:3001 to view the application", "cyan");
    log("2. Check monitoring reports in ./monitoring-reports/", "cyan");
    log("3. To stop the server, use: npm run kill-server", "cyan");

    process.exit(0);
  } catch (error) {
    section("❌ STARTUP FAILED");
    log(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "red",
    );
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  log("\n\n🛑 Shutting down...", "yellow");
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("\n\n🛑 Shutting down...", "yellow");
  process.exit(0);
});

// Run main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
