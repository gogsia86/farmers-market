#!/usr/bin/env node

/**
 * 🌟 PM2 Daemon Launcher
 * Farmers Market Platform - PM2-Compatible Daemon Starter
 * Version: 2.0.0
 *
 * This script launches the monitoring daemon in a way that's compatible
 * with PM2 process management on both Unix and Windows systems.
 * Uses tsx/register for TypeScript execution.
 */

const path = require("path");

// ============================================================================
// CONFIGURATION
// ============================================================================

const SCRIPT_PATH = path.join(__dirname, "monitor-daemon.ts");

// ============================================================================
// LAUNCHER
// ============================================================================

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║  🌾 PM2 DAEMON LAUNCHER                                   ║");
console.log("║  Starting Workflow Monitoring Daemon                      ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

console.log(`📂 Script: ${SCRIPT_PATH}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
console.log("📦 Using tsx/register for TypeScript execution\n");

console.log("✅ Loading TypeScript runtime...");

try {
  // Register tsx for TypeScript execution
  require("tsx/cjs");

  console.log("✅ TypeScript runtime loaded");
  console.log("🚀 Starting daemon...\n");
  console.log(`${"─".repeat(60)  }\n`);

  // Load and execute the daemon script
  require(SCRIPT_PATH);
} catch (error) {
  console.error("\n❌ Failed to start daemon:");
  console.error(error.message);
  if (error.stack) {
    console.error("\nStack trace:");
    console.error(error.stack);
  }
  process.exit(1);
}

// Handle process signals for graceful shutdown
const shutdown = (signal) => {
  console.log(`\n\n⚠️  Received ${signal} - shutting down...`);
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Keep process alive
process.stdin.resume();
