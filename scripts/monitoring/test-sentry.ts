#!/usr/bin/env tsx
/**
 * SENTRY INTEGRATION TEST SCRIPT
 * Test and verify Sentry error tracking integration
 *
 * Usage:
 *   npx tsx scripts/test-sentry.ts
 *   npx tsx scripts/test-sentry.ts --send-test-error
 *   npx tsx scripts/test-sentry.ts --verbose
 *
 * @module scripts/test-sentry
 */

import * as Sentry from "@sentry/nextjs";
import chalk from "chalk";

// ============================================
// CONFIGURATION
// ============================================

interface TestConfig {
  verbose: boolean;
  sendTestError: boolean;
  checkConfig: boolean;
}

const config: TestConfig = {
  verbose: process.argv.includes("--verbose"),
  sendTestError: process.argv.includes("--send-test-error"),
  checkConfig: !process.argv.includes("--send-test-error"),
};

// ============================================
// SENTRY INITIALIZATION (TEST)
// ============================================

function initializeSentry(): boolean {
  try {
    const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

    if (!dsn) {
      console.error(chalk.red("❌ SENTRY_DSN not configured"));
      console.log(chalk.yellow("\n💡 Set SENTRY_DSN in your .env file:"));
      console.log(
        chalk.gray(
          'SENTRY_DSN="https://[KEY]@[ORG].ingest.sentry.io/[PROJECT]"',
        ),
      );
      return false;
    }

    // Initialize Sentry for testing
    Sentry.init({
      dsn,
      environment: "test",
      debug: config.verbose,
      tracesSampleRate: 1.0,
      integrations: [Sentry.httpIntegration()],
      beforeSend(event) {
        // Add test tag
        if (!event.tags) {
          event.tags = {};
        }
        event.tags.test = "true";
        event.tags.script = "test-sentry.ts";
        return event;
      },
    });

    console.log(chalk.green("✓ Sentry initialized successfully"));
    return true;
  } catch (error) {
    console.error(chalk.red("❌ Failed to initialize Sentry:"), error);
    return false;
  }
}

// ============================================
// CONFIGURATION CHECKS
// ============================================

function checkEnvironmentVariables(): void {
  console.log(chalk.blue("\n📋 Checking Environment Variables...\n"));

  const requiredVars = [
    "SENTRY_DSN",
    "NEXT_PUBLIC_SENTRY_DSN",
    "SENTRY_AUTH_TOKEN",
  ];

  const optionalVars = [
    "SENTRY_ORG",
    "SENTRY_PROJECT",
    "VERCEL_GIT_COMMIT_SHA",
    "VERCEL_ENV",
    "NODE_ENV",
  ];

  let allRequired = true;

  console.log(chalk.bold("Required Variables:"));
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      // Mask sensitive values
      const masked =
        varName.includes("TOKEN") || varName.includes("DSN")
          ? value.substring(0, 20) + "..." + value.slice(-10)
          : value;
      console.log(chalk.green(`  ✓ ${varName}: ${masked}`));
    } else {
      console.log(chalk.red(`  ✗ ${varName}: Not set`));
      allRequired = false;
    }
  }

  console.log(chalk.bold("\nOptional Variables:"));
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      console.log(chalk.green(`  ✓ ${varName}: ${value}`));
    } else {
      console.log(chalk.gray(`  - ${varName}: Not set`));
    }
  }

  if (!allRequired) {
    console.log(
      chalk.yellow(
        "\n⚠️  Some required variables are missing. Sentry may not work correctly.",
      ),
    );
  } else {
    console.log(chalk.green("\n✓ All required variables configured"));
  }
}

function checkSentryConfiguration(): void {
  console.log(chalk.blue("\n🔍 Checking Sentry Configuration...\n"));

  const client = Sentry.getCurrentHub().getClient();

  if (!client) {
    console.log(chalk.red("✗ No Sentry client initialized"));
    return;
  }

  const dsn = client.getDsn();
  if (dsn) {
    const dsnString = dsn.toString();
    const masked = dsnString.substring(0, 30) + "..." + dsnString.slice(-20);
    console.log(chalk.green(`✓ DSN configured: ${masked}`));
  } else {
    console.log(chalk.red("✗ No DSN configured"));
  }

  const options = client.getOptions();
  console.log(chalk.bold("\nClient Options:"));
  console.log(chalk.gray(`  Environment: ${options.environment || "not set"}`));
  console.log(
    chalk.gray(`  Traces Sample Rate: ${options.tracesSampleRate || 0}`),
  );
  console.log(
    chalk.gray(`  Debug Mode: ${options.debug ? "enabled" : "disabled"}`),
  );
  console.log(
    chalk.gray(`  Integrations: ${options.integrations?.length || 0}`),
  );

  if (config.verbose && options.integrations) {
    console.log(chalk.bold("\n  Active Integrations:"));
    options.integrations.forEach((integration) => {
      console.log(chalk.gray(`    - ${integration.name}`));
    });
  }
}

function checkSentryFiles(): void {
  console.log(chalk.blue("\n📁 Checking Sentry Files...\n"));

  const fs = require("fs");
  const path = require("path");

  const sentryFiles = [
    "sentry.client.config.ts",
    "sentry.server.config.ts",
    "sentry.edge.config.ts",
    "src/lib/monitoring/sentry-utils.ts",
  ];

  for (const file of sentryFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(chalk.green(`✓ ${file}`));
    } else {
      console.log(chalk.red(`✗ ${file} (missing)`));
    }
  }
}

// ============================================
// TEST ERROR SENDING
// ============================================

async function sendTestError(): Promise<void> {
  console.log(chalk.blue("\n🧪 Sending Test Error to Sentry...\n"));

  try {
    // 1. Test basic error capture
    console.log(chalk.gray("1. Testing basic error capture..."));
    const testError = new Error(
      "🌾 Test Error - Farmers Market Platform Sentry Integration",
    );
    Sentry.captureException(testError);
    console.log(chalk.green("   ✓ Basic error sent"));

    // 2. Test error with context
    console.log(chalk.gray("2. Testing error with context..."));
    Sentry.withScope((scope) => {
      scope.setTag("test_type", "context_test");
      scope.setTag("platform", "farmers_market");
      scope.setUser({ id: "test-user-123" });
      scope.setContext("test_context", {
        timestamp: new Date().toISOString(),
        test_run: "automated",
      });

      const contextError = new Error("Test error with agricultural context");
      Sentry.captureException(contextError);
    });
    console.log(chalk.green("   ✓ Error with context sent"));

    // 3. Test message capture
    console.log(chalk.gray("3. Testing message capture..."));
    Sentry.captureMessage("🌾 Test Message - Sentry Integration Check", "info");
    console.log(chalk.green("   ✓ Message sent"));

    // 4. Test breadcrumbs
    console.log(chalk.gray("4. Testing breadcrumbs..."));
    Sentry.addBreadcrumb({
      message: "Test breadcrumb 1",
      category: "test",
      level: "info",
    });
    Sentry.addBreadcrumb({
      message: "Test breadcrumb 2",
      category: "test",
      level: "warning",
    });
    const breadcrumbError = new Error("Test error with breadcrumbs");
    Sentry.captureException(breadcrumbError);
    console.log(chalk.green("   ✓ Error with breadcrumbs sent"));

    // 5. Test agricultural-specific error
    console.log(chalk.gray("5. Testing agricultural-specific error..."));
    Sentry.withScope((scope) => {
      scope.setTag("operation", "farm_creation");
      scope.setTag("farm_type", "organic");
      scope.setTag("crop_category", "vegetables");
      scope.setTag("season", "spring");
      scope.setContext("agricultural_operation", {
        operation: "create_farm",
        farm_type: "organic",
        crop_category: "vegetables",
        season: "spring",
        region: "midwest",
        certifications: ["USDA_ORGANIC", "NON_GMO"],
      });

      const agricError = new Error("Test agricultural operation error");
      Sentry.captureException(agricError);
    });
    console.log(chalk.green("   ✓ Agricultural error sent"));

    // 6. Test performance transaction
    console.log(chalk.gray("6. Testing performance transaction..."));
    const transaction = Sentry.startTransaction({
      name: "test_transaction",
      op: "test",
    });

    const span = transaction.startChild({
      op: "test_operation",
      description: "Test operation span",
    });

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 100));

    span.finish();
    transaction.finish();
    console.log(chalk.green("   ✓ Performance transaction sent"));

    // Flush events to Sentry
    console.log(
      chalk.gray("\n⏳ Flushing events to Sentry (5 second timeout)..."),
    );
    const flushed = await Sentry.flush(5000);

    if (flushed) {
      console.log(
        chalk.green("\n✅ All test events sent successfully to Sentry!"),
      );
      console.log(
        chalk.yellow("\n💡 Check your Sentry dashboard at https://sentry.io"),
      );
      console.log(chalk.gray("   Organization: medicis-gang"));
      console.log(chalk.gray("   Project: farmers-market-prod"));
    } else {
      console.log(
        chalk.yellow("\n⚠️  Some events may not have been sent (timeout)"),
      );
    }
  } catch (error) {
    console.error(chalk.red("\n❌ Failed to send test errors:"), error);
    throw error;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main(): Promise<void> {
  console.log(
    chalk.bold.cyan("\n🌾 FARMERS MARKET - SENTRY INTEGRATION TEST\n"),
  );
  console.log(chalk.gray("=".repeat(60)));

  // Check environment variables
  if (config.checkConfig) {
    checkEnvironmentVariables();
  }

  // Initialize Sentry
  const initialized = initializeSentry();

  if (!initialized) {
    console.log(chalk.red("\n❌ Cannot proceed without Sentry configuration"));
    process.exit(1);
  }

  // Check configuration
  if (config.checkConfig) {
    checkSentryConfiguration();
    checkSentryFiles();
  }

  // Send test error if requested
  if (config.sendTestError) {
    await sendTestError();
  } else {
    console.log(
      chalk.yellow(
        "\n💡 To send test errors to Sentry, run with --send-test-error flag",
      ),
    );
    console.log(
      chalk.gray("   npx tsx scripts/test-sentry.ts --send-test-error"),
    );
  }

  console.log(chalk.gray("\n" + "=".repeat(60)));
  console.log(chalk.green("\n✅ Sentry test completed!\n"));
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red("\n❌ Test failed:"), error);
    process.exit(1);
  });
}

export { checkEnvironmentVariables, initializeSentry, main };
