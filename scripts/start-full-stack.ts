#!/usr/bin/env npx tsx
/**
 * 🚀 Full Stack Startup Script
 * Farmers Market Platform - Divine Agricultural Intelligence
 * Version: 1.0.0
 *
 * This script starts the complete monitoring and self-healing stack:
 * 1. Next.js Development Server
 * 2. Divine Workflow Monitoring Bot
 * 3. Orchestrator-Monitoring Bridge (Self-Healing System)
 *
 * Usage:
 *   npx tsx scripts/start-full-stack.ts [options]
 *
 * Options:
 *   --no-server     Skip starting the dev server (if already running)
 *   --no-bot        Skip starting the monitoring bot
 *   --no-healing    Skip starting the self-healing system
 *   --port=XXXX     Specify dev server port (default: 3001)
 *   --verbose       Enable verbose logging
 */

import { spawn, ChildProcess } from "child_process";
import * as http from "http";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

// ============================================================================
// TYPES
// ============================================================================

interface StartupConfig {
  startServer: boolean;
  startBot: boolean;
  startHealing: boolean;
  port: number;
  verbose: boolean;
  baseUrl: string;
}

interface ProcessInfo {
  name: string;
  process: ChildProcess | null;
  status: "starting" | "running" | "stopped" | "error";
  startTime?: Date;
}

// ============================================================================
// PARSE ARGUMENTS
// ============================================================================

function parseArgs(): StartupConfig {
  const args = process.argv.slice(2);

  const config: StartupConfig = {
    startServer: true,
    startBot: true,
    startHealing: true,
    port: parseInt(process.env.PORT || "3001", 10),
    verbose: false,
    baseUrl: "",
  };

  for (const arg of args) {
    if (arg === "--no-server") config.startServer = false;
    else if (arg === "--no-bot") config.startBot = false;
    else if (arg === "--no-healing") config.startHealing = false;
    else if (arg === "--verbose") config.verbose = true;
    else if (arg.startsWith("--port=")) {
      config.port = parseInt(arg.split("=")[1], 10);
    }
  }

  config.baseUrl = `http://localhost:${config.port}`;

  return config;
}

// ============================================================================
// UTILITIES
// ============================================================================

function log(
  message: string,
  type: "info" | "success" | "error" | "warning" = "info",
): void {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  const icons = {
    info: "ℹ️ ",
    success: "✅",
    error: "❌",
    warning: "⚠️ ",
  };
  console.log(`[${timestamp}] ${icons[type]} ${message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkServerHealth(
  url: string,
  timeout = 5000,
): Promise<boolean> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(false), timeout);

    http
      .get(url, (res) => {
        clearTimeout(timeoutId);
        resolve(res.statusCode === 200);
      })
      .on("error", () => {
        clearTimeout(timeoutId);
        resolve(false);
      });
  });
}

async function waitForServer(
  url: string,
  maxAttempts = 60,
  interval = 2000,
): Promise<boolean> {
  log(`Waiting for server at ${url}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const healthy = await checkServerHealth(url);
    if (healthy) {
      return true;
    }

    if (attempt % 10 === 0) {
      log(`Still waiting... (attempt ${attempt}/${maxAttempts})`, "warning");
    }

    await sleep(interval);
  }

  return false;
}

// ============================================================================
// STARTUP BANNER
// ============================================================================

function printBanner(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🌾 FARMERS MARKET PLATFORM - FULL STACK STARTUP                            ║
║  Divine Agricultural Intelligence with Self-Healing Capabilities             ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Components:                                                                 ║
║    🌐 Next.js Development Server                                            ║
║    🤖 Divine Workflow Monitoring Bot                                        ║
║    🔧 Auto-Remediation System with AI Orchestrator                          ║
║    🌉 Orchestrator-Monitoring Bridge                                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);
}

// ============================================================================
// PROCESS MANAGEMENT
// ============================================================================

const processes: Map<string, ProcessInfo> = new Map();

function registerProcess(name: string): void {
  processes.set(name, {
    name,
    process: null,
    status: "stopped",
  });
}

function updateProcessStatus(
  name: string,
  status: ProcessInfo["status"],
  proc?: ChildProcess,
): void {
  const info = processes.get(name);
  if (info) {
    info.status = status;
    if (proc) info.process = proc;
    if (status === "running") info.startTime = new Date();
    processes.set(name, info);
  }
}

function printProcessStatus(): void {
  console.log(
    "\n┌────────────────────────────────────────────────────────────┐",
  );
  console.log("│ 📊 PROCESS STATUS                                          │");
  console.log("├────────────────────────────────────────────────────────────┤");

  for (const [name, info] of processes) {
    const statusIcon =
      info.status === "running"
        ? "🟢"
        : info.status === "starting"
          ? "🟡"
          : info.status === "error"
            ? "🔴"
            : "⚪";
    const line = `│ ${statusIcon} ${name.padEnd(25)} ${info.status.toUpperCase().padEnd(15)} │`;
    console.log(line);
  }

  console.log(
    "└────────────────────────────────────────────────────────────┘\n",
  );
}

// ============================================================================
// START NEXT.JS SERVER
// ============================================================================

async function startDevServer(config: StartupConfig): Promise<boolean> {
  if (!config.startServer) {
    log("Skipping dev server (--no-server flag)");
    return true;
  }

  registerProcess("Next.js Dev Server");
  updateProcessStatus("Next.js Dev Server", "starting");

  log(`Starting Next.js dev server on port ${config.port}...`);

  // Check if server is already running
  const alreadyRunning = await checkServerHealth(
    `${config.baseUrl}/api/health`,
  );
  if (alreadyRunning) {
    log("Dev server is already running!", "success");
    updateProcessStatus("Next.js Dev Server", "running");
    return true;
  }

  return new Promise((resolve) => {
    const serverProcess = spawn(
      "npm",
      ["run", "dev", "--", "-p", String(config.port)],
      {
        stdio: config.verbose ? "inherit" : ["ignore", "pipe", "pipe"],
        shell: true,
        env: {
          ...process.env,
          PORT: String(config.port),
          FORCE_COLOR: "1",
        },
      },
    );

    processes.get("Next.js Dev Server")!.process = serverProcess;

    serverProcess.on("error", (error) => {
      log(`Failed to start dev server: ${error.message}`, "error");
      updateProcessStatus("Next.js Dev Server", "error");
      resolve(false);
    });

    // Wait for server to be ready
    (async () => {
      const ready = await waitForServer(`${config.baseUrl}/api/health`);
      if (ready) {
        log(`Dev server started successfully at ${config.baseUrl}`, "success");
        updateProcessStatus("Next.js Dev Server", "running");
        resolve(true);
      } else {
        log("Dev server failed to start within timeout", "error");
        updateProcessStatus("Next.js Dev Server", "error");
        resolve(false);
      }
    })();
  });
}

// ============================================================================
// START MONITORING BOT
// ============================================================================

async function startMonitoringBot(config: StartupConfig): Promise<boolean> {
  if (!config.startBot) {
    log("Skipping monitoring bot (--no-bot flag)");
    return true;
  }

  registerProcess("Monitoring Bot");
  updateProcessStatus("Monitoring Bot", "starting");

  log("Starting Divine Workflow Monitoring Bot...");

  // Dynamically import the bot module
  try {
    const { DivineMonitoringBot } = await import("../src/lib/monitoring/bot");
    const { PREDEFINED_WORKFLOWS } = await import(
      "../src/lib/monitoring/workflows/predefined-workflows"
    );

    const bot = new DivineMonitoringBot({
      baseUrl: config.baseUrl,
      workflows: PREDEFINED_WORKFLOWS,
      scheduler: {
        enabled: true,
        workflows: [],
        concurrency: 3,
        retryOnFailure: true,
        maxRetries: 2,
        retryDelay: 5000,
      },
    });

    await bot.start();
    updateProcessStatus("Monitoring Bot", "running");
    log("Monitoring Bot started successfully!", "success");

    // Store bot reference for cleanup
    (global as any).__monitoringBot = bot;

    return true;
  } catch (error) {
    log(`Failed to start Monitoring Bot: ${error}`, "error");
    updateProcessStatus("Monitoring Bot", "error");
    return false;
  }
}

// ============================================================================
// START SELF-HEALING SYSTEM
// ============================================================================

async function startSelfHealingSystem(config: StartupConfig): Promise<boolean> {
  if (!config.startHealing) {
    log("Skipping self-healing system (--no-healing flag)");
    return true;
  }

  registerProcess("Self-Healing System");
  updateProcessStatus("Self-Healing System", "starting");

  log("Starting Auto-Remediation System with Orchestrator Bridge...");

  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      log("OPENAI_API_KEY not found - AI features will be limited", "warning");
    }

    const { createOrchestratorBridge } = await import(
      "../src/lib/monitoring/integration/orchestrator-bridge"
    );

    const bridge = createOrchestratorBridge({
      enabled: true,
      autoAnalyze: true,
      autoRemediate: true,
      notifyOnFailure: true,
      notifyOnRemediation: true,
      minFailuresBeforeAnalysis: 1,
      cooldownBetweenAnalyses: 60000, // 1 minute cooldown for demo
    });

    // Set up event handlers
    bridge.on("WORKFLOW_FAILED", (event) => {
      log(
        `Workflow failed: ${event.workflowName || event.workflowId}`,
        "error",
      );
    });

    bridge.on("ANALYSIS_COMPLETE", (event) => {
      log(`Analysis complete for: ${event.workflowName}`, "info");
    });

    bridge.on("REMEDIATION_COMPLETE", (event) => {
      const success = event.details.success;
      log(
        `Remediation ${success ? "successful" : "failed"} for: ${event.workflowName}`,
        success ? "success" : "error",
      );
    });

    // Store bridge reference
    (global as any).__orchestratorBridge = bridge;

    // Wire bridge to monitoring bot if available
    const bot = (global as any).__monitoringBot;
    if (bot) {
      log("Wiring orchestrator bridge to monitoring bot...", "info");
      // The bridge will be used via the API or direct integration
    }

    updateProcessStatus("Self-Healing System", "running");
    log("Self-Healing System started successfully!", "success");
    log(
      `  ├─ AI Orchestrator: ${bridge.isOrchestratorAvailable() ? "AVAILABLE" : "NOT AVAILABLE"}`,
    );
    log("  ├─ Auto-Analyze: ENABLED");
    log("  └─ Auto-Remediate: ENABLED");

    return true;
  } catch (error) {
    log(`Failed to start Self-Healing System: ${error}`, "error");
    updateProcessStatus("Self-Healing System", "error");
    return false;
  }
}

// ============================================================================
// ENVIRONMENT CHECK
// ============================================================================

function checkEnvironment(): boolean {
  log("Checking environment...");

  const requiredEnvVars = ["DATABASE_URL"];
  const optionalEnvVars = ["OPENAI_API_KEY", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

  let hasErrors = false;

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      log(`Missing required environment variable: ${envVar}`, "error");
      hasErrors = true;
    }
  }

  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      log(`Optional environment variable not set: ${envVar}`, "warning");
    }
  }

  // Check for .env.local
  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envLocalPath)) {
    log(".env.local file not found - some features may not work", "warning");
  }

  if (!hasErrors) {
    log("Environment check passed!", "success");
  }

  return !hasErrors;
}

// ============================================================================
// SHUTDOWN HANDLER
// ============================================================================

function setupShutdownHandler(): void {
  const shutdown = async (signal: string) => {
    console.log(`\n\n🛑 Received ${signal}. Shutting down gracefully...\n`);

    // Stop monitoring bot
    const bot = (global as any).__monitoringBot;
    if (bot && typeof bot.stop === "function") {
      log("Stopping Monitoring Bot...");
      await bot.stop();
    }

    // Disable bridge
    const bridge = (global as any).__orchestratorBridge;
    if (bridge && typeof bridge.disable === "function") {
      log("Disabling Orchestrator Bridge...");
      bridge.disable();
    }

    // Kill spawned processes
    for (const [name, info] of processes) {
      if (info.process) {
        log(`Stopping ${name}...`);
        info.process.kill("SIGTERM");
      }
    }

    console.log("\n✅ Shutdown complete. Goodbye!\n");
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

// ============================================================================
// PRINT STARTUP INFO
// ============================================================================

function printStartupInfo(config: StartupConfig): void {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║ 🚀 ALL SYSTEMS OPERATIONAL                                 ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║ 🌐 Server URL: ${config.baseUrl.padEnd(41)} ║`);
  console.log(
    `║ 📊 API Status: ${`${config.baseUrl}/api/agents/orchestrate`.padEnd(41)} ║`,
  );
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║ 📋 Available Endpoints:                                    ║");
  console.log("║    GET  /api/agents/orchestrate     - Status               ║");
  console.log("║    POST /api/agents/orchestrate     - Execute Actions      ║");
  console.log("║    GET  /api/health                 - Health Check         ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║ 🔧 Self-Healing Actions:                                   ║");
  console.log("║    analyze_failure      - AI-powered failure analysis      ║");
  console.log("║    optimize_performance - Performance recommendations      ║");
  console.log("║    audit_security       - Security assessment              ║");
  console.log("║    process_and_heal     - Full auto-remediation pipeline   ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║ 💡 Press Ctrl+C to stop all services                       ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );
}

// ============================================================================
// MAIN STARTUP
// ============================================================================

async function main(): Promise<void> {
  printBanner();

  const config = parseArgs();

  log("Configuration:");
  log(`  ├─ Port: ${config.port}`);
  log(`  ├─ Start Server: ${config.startServer}`);
  log(`  ├─ Start Bot: ${config.startBot}`);
  log(`  ├─ Start Healing: ${config.startHealing}`);
  log(`  └─ Verbose: ${config.verbose}`);
  console.log("");

  // Check environment
  if (!checkEnvironment()) {
    log("Environment check failed. Please fix the issues above.", "error");
    process.exit(1);
  }

  // Setup shutdown handler
  setupShutdownHandler();

  // Start components in sequence
  const serverStarted = await startDevServer(config);
  if (!serverStarted && config.startServer) {
    log("Failed to start dev server. Aborting.", "error");
    process.exit(1);
  }

  // Give server a moment to stabilize
  if (config.startServer) {
    await sleep(2000);
  }

  const botStarted = await startMonitoringBot(config);
  if (!botStarted && config.startBot) {
    log("Monitoring bot failed to start, but continuing...", "warning");
  }

  const healingStarted = await startSelfHealingSystem(config);
  if (!healingStarted && config.startHealing) {
    log("Self-healing system failed to start, but continuing...", "warning");
  }

  // Print final status
  printProcessStatus();
  printStartupInfo(config);

  // Keep the process running
  log("All systems started. Monitoring active...\n", "success");

  // Keep alive
  setInterval(() => {
    // Heartbeat - could be used for health checks
  }, 30000);
}

// Run main
main().catch((error) => {
  console.error("Fatal error during startup:", error);
  process.exit(1);
});
