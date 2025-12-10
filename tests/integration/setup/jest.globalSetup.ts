/**
 * 🧪 JEST GLOBAL SETUP - Integration Tests with Testcontainers
 *
 * This file runs ONCE before all integration tests.
 * Starts a PostgreSQL container and prepares the database.
 *
 * @pattern Jest Global Setup with Testcontainers
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import {
  startPostgresContainer,
  runPrismaMigrations,
  waitForDatabaseReady,
  getTestPrismaClient,
} from "./testcontainers";
import { seedTestDatabase } from "../fixtures/seed";

// Store container info in global for teardown
declare global {
  var __TESTCONTAINERS_POSTGRES_STARTED__: boolean;
}

/**
 * Jest Global Setup Function
 *
 * Executed once before all test suites run.
 * Responsible for:
 * 1. Starting PostgreSQL container
 * 2. Running Prisma migrations
 * 3. Seeding initial test data
 */
async function globalSetup(): Promise<void> {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log(
    "║  🧪 INTEGRATION TEST SUITE - Global Setup                   ║",
  );
  console.log("║  Using Testcontainers for Real PostgreSQL Testing          ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\n");

  const startTime = Date.now();

  try {
    // Check if we should skip container setup (e.g., using external DB)
    if (process.env.INTEGRATION_TEST_DATABASE_URL) {
      console.log(
        "📌 Using external database URL from INTEGRATION_TEST_DATABASE_URL",
      );
      process.env.DATABASE_URL = process.env.INTEGRATION_TEST_DATABASE_URL;
      process.env.DIRECT_URL = process.env.INTEGRATION_TEST_DATABASE_URL;
    } else {
      // Step 1: Start PostgreSQL container
      console.log("🐳 Step 1/4: Starting PostgreSQL container...\n");
      const dbInfo = await startPostgresContainer({
        startupTimeout: 120000, // 2 minutes for container startup
      });

      console.log(
        `\n   Connection: ${dbInfo.connectionString.replace(/:[^:@]+@/, ":****@")}\n`,
      );
    }

    // Step 2: Wait for database to be ready
    console.log("⏳ Step 2/4: Waiting for database to be ready...\n");
    await waitForDatabaseReady(30, 1000);

    // Step 3: Run Prisma migrations
    console.log("\n📦 Step 3/4: Running Prisma migrations...\n");
    await runPrismaMigrations();

    // Step 4: Seed test database
    console.log("\n🌱 Step 4/4: Seeding test database...\n");
    const prisma = await getTestPrismaClient();
    await seedTestDatabase(prisma);

    // Mark as started for teardown
    global.__TESTCONTAINERS_POSTGRES_STARTED__ = true;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n");
    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  ✅ INTEGRATION TEST ENVIRONMENT READY                     ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(
      `║  Setup completed in ${duration}s                                  ║`,
    );
    console.log(
      "║  PostgreSQL container is running                           ║",
    );
    console.log(
      "║  Database schema is up to date                             ║",
    );
    console.log(
      "║  Test data is seeded                                       ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝",
    );
    console.log("\n");
  } catch (error) {
    console.error("\n");
    console.error(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.error(
      "║  ❌ INTEGRATION TEST SETUP FAILED                          ║",
    );
    console.error(
      "╚════════════════════════════════════════════════════════════╝",
    );
    console.error("\nError:", error);
    console.error("\nTroubleshooting:");
    console.error("  1. Ensure Docker is running");
    console.error("  2. Check that port 5432 is available");
    console.error("  3. Verify you have testcontainers installed");
    console.error(
      "  4. Try running: docker pull postgis/postgis:16-3.4-alpine",
    );
    console.error("\n");

    throw error;
  }
}

export default globalSetup;
