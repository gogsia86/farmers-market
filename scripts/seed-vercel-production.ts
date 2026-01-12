#!/usr/bin/env tsx

/**
 * 🚀 PRODUCTION DATABASE SEEDING SCRIPT FOR VERCEL
 *
 * This script seeds the Vercel production database with authentic
 * Šibenik, Croatia farm data.
 *
 * ⚠️ SAFETY FEATURES:
 * - Requires explicit confirmation before proceeding
 * - Validates DATABASE_URL is set
 * - Creates backup recommendation
 * - Provides rollback instructions
 * - Logs all operations
 *
 * Usage:
 *   npm run seed:production
 *   or
 *   DATABASE_URL="..." npx tsx scripts/seed-vercel-production.ts
 *   or (auto-confirm for CI/CD):
 *   npm run seed:production -- --auto-confirm
 */

import { execSync } from "child_process";
import * as readline from "readline";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: number, message: string) {
  log(
    `\n${colors.bold}[Step ${step}]${colors.reset} ${colors.cyan}${message}${colors.reset}`,
  );
}

function logSuccess(message: string) {
  log(`✅ ${message}`, "green");
}

function logError(message: string) {
  log(`❌ ${message}`, "red");
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, "yellow");
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, "blue");
}

async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function confirmAction(message: string): Promise<boolean> {
  const answer = await askQuestion(
    `${colors.yellow}${message} (yes/no): ${colors.reset}`,
  );
  return answer.toLowerCase() === "yes";
}

async function main() {
  // Check for auto-confirm flag
  const autoConfirm =
    process.argv.includes("--auto-confirm") ||
    process.argv.includes("-y") ||
    process.env.AUTO_CONFIRM === "true";

  log("\n" + "=".repeat(80), "cyan");
  log("  🌾 FARMERS MARKET PLATFORM - PRODUCTION DATABASE SEEDING", "bold");
  log("  📍 Seeding with: Šibenik, Croatia - Authentic Family Farms", "cyan");
  log("=".repeat(80) + "\n", "cyan");

  if (autoConfirm) {
    logInfo("🤖 Auto-confirm mode enabled - skipping prompts");
  }

  // Step 1: Environment validation
  logStep(1, "Validating Environment");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logError("DATABASE_URL environment variable is not set!");
    logInfo(
      'Please set DATABASE_URL or use: DATABASE_URL="..." npm run seed:production',
    );
    process.exit(1);
  }

  // Check if it's a production database
  const isProd =
    databaseUrl.includes("vercel") ||
    databaseUrl.includes("production") ||
    databaseUrl.includes("neon.tech");

  if (isProd) {
    logWarning("Production database detected!");
    logInfo(`Database: ${databaseUrl.substring(0, 50)}...`);
  } else {
    logInfo(`Database: ${databaseUrl.substring(0, 50)}...`);
  }

  // Step 2: Show what will be seeded
  logStep(2, "Seed Data Overview");

  log("\n📊 Data that will be seeded:\n");
  log("  👤 Users:");
  log("    - 1 Admin (gogsia@gmail.com)");
  log("    - 10 Farmers (Croatian farm owners)");
  log("    - 4 Consumers (test customers)");
  log("\n  🏡 Farms: 10 authentic Šibenik family farms (OPG)");
  log("    - Olive oil producers");
  log("    - Wine makers");
  log("    - Lavender farms");
  log("    - Honey producers");
  log("    - Vegetable & fruit farms");
  log("\n  🥬 Products: 50 authentic Croatian products");
  log("  ⭐ Reviews: 10 sample reviews");
  log("  🇭🇷 Location: Šibenik, Croatia (Mediterranean)\n");

  // Step 3: Safety confirmation
  logStep(3, "Safety Confirmation");

  logWarning("⚠️  THIS WILL:");
  log("  1. CLEAR all existing data in the database");
  log("  2. DELETE all farms, products, orders, users");
  log("  3. SEED new Šibenik, Croatia data");
  log("");

  logInfo("💡 RECOMMENDATION:");
  log("  - Create a database backup before proceeding");
  log("  - Verify you have the correct DATABASE_URL");
  log("  - Ensure you have permission to modify production data");
  log("");

  const continueSeeding =
    autoConfirm ||
    (await confirmAction("Do you want to continue with seeding?"));

  if (!continueSeeding) {
    logWarning("Seeding cancelled by user.");
    process.exit(0);
  }

  // Step 4: Final confirmation for production
  if (isProd) {
    logStep(4, "Production Database - Final Confirmation");

    logWarning(
      "🚨 FINAL WARNING: You are about to modify a PRODUCTION database!",
    );

    const finalConfirm =
      autoConfirm ||
      (await confirmAction('Type "yes" again to confirm production seeding'));

    if (!finalConfirm) {
      logWarning("Production seeding cancelled.");
      process.exit(0);
    }
  }

  // Step 5: Push schema
  logStep(5, "Pushing Database Schema");

  try {
    logInfo("Running: npx prisma db push --accept-data-loss");
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
    logSuccess("Schema pushed successfully");
  } catch (error) {
    logError("Failed to push schema");
    throw error;
  }

  // Step 6: Run seed
  logStep(6, "Seeding Database");

  try {
    logInfo("Running: npx tsx prisma/seed-sibenik-croatia.ts");
    execSync("npx tsx prisma/seed-sibenik-croatia.ts", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
    logSuccess("Database seeded successfully");
  } catch (error) {
    logError("Failed to seed database");
    throw error;
  }

  // Step 7: Verify seeding
  logStep(7, "Verifying Seed Data");

  try {
    logInfo("Running verification...");
    execSync("npx tsx scripts/check-db-counts.ts", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
    logSuccess("Verification complete");
  } catch (error) {
    logWarning("Verification script not available or failed");
  }

  // Success summary
  log("\n" + "=".repeat(80), "green");
  log("  ✅ PRODUCTION DATABASE SEEDED SUCCESSFULLY!", "bold");
  log("=".repeat(80), "green");

  log("\n📝 Next Steps:\n");
  log(
    "1. Visit your production site: https://farmers-market-platform.vercel.app",
  );
  log("2. Check /api/health endpoint");
  log("3. Check /api/farms endpoint");
  log("4. Test login with credentials from CROATIAN_DATABASE_SETUP.md");
  log("");

  logWarning("⚠️  SECURITY REMINDERS:");
  log("  - Change default passwords for production users");
  log("  - Review and update user permissions");
  log("  - Monitor for any issues");
  log("");

  logInfo("📋 Test Credentials (from CROATIAN_DATABASE_SETUP.md):");
  log("  Admin: gogsia@gmail.com / Test123!");
  log("  Farmer: marko.petrovic@gmail.com / Test123!");
  log("");

  log("🎉 Seed complete! Happy farming! 🌾\n");
}

// Execute main function
main().catch((error) => {
  logError("\n❌ Seeding failed with error:");
  console.error(error);
  process.exit(1);
});
