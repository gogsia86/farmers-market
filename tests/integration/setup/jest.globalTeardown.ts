/**
 * 🧪 JEST GLOBAL TEARDOWN - Integration Tests with Testcontainers
 *
 * This file runs ONCE after all integration tests complete.
 * Stops the PostgreSQL container and cleans up resources.
 *
 * @pattern Jest Global Teardown with Testcontainers
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { stopPostgresContainer } from "./testcontainers";

// Access global state from setup
declare global {
  var __TESTCONTAINERS_POSTGRES_STARTED__: boolean;
}

/**
 * Jest Global Teardown Function
 *
 * Executed once after all test suites complete.
 * Responsible for:
 * 1. Stopping PostgreSQL container
 * 2. Cleaning up any remaining resources
 * 3. Reporting test environment summary
 */
async function globalTeardown(): Promise<void> {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🧹 INTEGRATION TEST SUITE - Global Teardown               ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\n");

  const startTime = Date.now();

  try {
    // Only stop container if we started it
    if (global.__TESTCONTAINERS_POSTGRES_STARTED__) {
      console.log("🛑 Stopping PostgreSQL container...\n");
      await stopPostgresContainer();
      console.log("✅ PostgreSQL container stopped successfully\n");
    } else if (process.env.INTEGRATION_TEST_DATABASE_URL) {
      console.log("📌 Using external database - no container to stop\n");
    } else {
      console.log("⚠️ No container was started during setup\n");
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  ✅ INTEGRATION TEST TEARDOWN COMPLETE                     ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(
      `║  Teardown completed in ${duration}s                               ║`,
    );
    console.log(
      "║  All resources cleaned up                                  ║",
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
      "║  ⚠️ INTEGRATION TEST TEARDOWN WARNING                      ║",
    );
    console.error(
      "╚════════════════════════════════════════════════════════════╝",
    );
    console.error("\nError during teardown:", error);
    console.error("\nNote: Container may need manual cleanup.");
    console.error(
      "Run: docker ps -a | grep postgres | awk '{print $1}' | xargs docker rm -f",
    );
    console.error("\n");

    // Don't throw on teardown errors - tests have already completed
    // Just log the warning
  }
}

export default globalTeardown;
