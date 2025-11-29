#!/usr/bin/env tsx
/**
 * ⚡ TEST DATABASE SETUP SCRIPT
 * Divine Agricultural Platform - Integration Test Database Configuration
 *
 * This script sets up a test database for running integration tests.
 * It creates the database, runs Prisma migrations, and seeds basic test data.
 *
 * Usage:
 *   npm run db:test:setup
 *   or
 *   tsx scripts/setup-test-db.ts
 *
 * Environment Variables:
 *   TEST_DATABASE_URL - Full connection string for test database
 *   or
 *   TEST_DB_HOST - Database host (default: localhost)
 *   TEST_DB_PORT - Database port (default: 5432)
 *   TEST_DB_NAME - Database name (default: farmersmarket_test)
 *   TEST_DB_USER - Database user (default: postgres)
 *   TEST_DB_PASSWORD - Database password (default: postgres)
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// ANSI colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log("");
  log(`${"=".repeat(60)}`, "cyan");
  log(`  ${title}`, "bright");
  log(`${"=".repeat(60)}`, "cyan");
  console.log("");
}

function exec(command: string, silent = false): string {
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    });
    return output;
  } catch (error: any) {
    if (!silent) {
      log(`❌ Command failed: ${command}`, "red");
      log(`Error: ${error.message}`, "red");
    }
    throw error;
  }
}

// Get test database configuration
function getTestDatabaseConfig() {
  // Check if TEST_DATABASE_URL is provided
  if (process.env.TEST_DATABASE_URL) {
    return {
      url: process.env.TEST_DATABASE_URL,
      parsed: parsePostgresUrl(process.env.TEST_DATABASE_URL),
    };
  }

  // Build from individual components
  const host = process.env.TEST_DB_HOST || "localhost";
  const port = process.env.TEST_DB_PORT || "5432";
  const database = process.env.TEST_DB_NAME || "farmersmarket_test";
  const user = process.env.TEST_DB_USER || "postgres";
  const password = process.env.TEST_DB_PASSWORD || "postgres";

  const url = `postgresql://${user}:${password}@${host}:${port}/${database}`;

  return {
    url,
    parsed: { host, port, database, user, password },
  };
}

function parsePostgresUrl(url: string) {
  const regex =
    /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)(?:\?.*)?$/;
  const match = url.match(regex);

  if (!match) {
    throw new Error(`Invalid PostgreSQL URL: ${url}`);
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5],
  };
}

async function checkPostgresInstalled(): Promise<boolean> {
  try {
    exec("psql --version", true);
    return true;
  } catch {
    return false;
  }
}

async function checkDatabaseExists(config: {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
}): Promise<boolean> {
  try {
    const command = `PGPASSWORD="${config.password}" psql -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database} -c "SELECT 1" 2>&1`;
    exec(command, true);
    return true;
  } catch {
    return false;
  }
}

async function createDatabase(config: {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
}) {
  log(`Creating database: ${config.database}`, "blue");

  try {
    const command = `PGPASSWORD="${config.password}" psql -h ${config.host} -p ${config.port} -U ${config.user} -d postgres -c "CREATE DATABASE ${config.database}"`;
    exec(command, true);
    log(`✅ Database created successfully`, "green");
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      log(`⚠️  Database already exists, skipping creation`, "yellow");
    } else {
      throw error;
    }
  }
}

async function runPrismaPush(databaseUrl: string) {
  log(`Running Prisma DB push...`, "blue");

  // Set DATABASE_URL for Prisma
  const env = { ...process.env, DATABASE_URL: databaseUrl };

  try {
    execSync("npx prisma db push --skip-generate", {
      encoding: "utf-8",
      stdio: "inherit",
      env,
    });
    log(`✅ Prisma schema pushed successfully`, "green");
  } catch (error) {
    log(`❌ Failed to push Prisma schema`, "red");
    throw error;
  }
}

async function runPrismaGenerate() {
  log(`Generating Prisma Client...`, "blue");

  try {
    exec("npx prisma generate");
    log(`✅ Prisma Client generated successfully`, "green");
  } catch (error) {
    log(`❌ Failed to generate Prisma Client`, "red");
    throw error;
  }
}

async function seedTestData(databaseUrl: string) {
  log(`Seeding test data...`, "blue");

  const env = { ...process.env, DATABASE_URL: databaseUrl };

  // Check if seed script exists
  const seedScriptPath = path.join(process.cwd(), "prisma", "seed-basic.ts");

  if (fs.existsSync(seedScriptPath)) {
    try {
      execSync("npm run db:seed:basic", {
        encoding: "utf-8",
        stdio: "inherit",
        env,
      });
      log(`✅ Test data seeded successfully`, "green");
    } catch (error) {
      log(`⚠️  Seeding failed (optional step)`, "yellow");
      // Don't throw - seeding is optional
    }
  } else {
    log(`⚠️  No seed script found at ${seedScriptPath}`, "yellow");
    log(`   Skipping seeding (optional step)`, "yellow");
  }
}

async function updateEnvFile(databaseUrl: string) {
  const envTestPath = path.join(process.cwd(), ".env.test");

  log(`Creating .env.test file...`, "blue");

  const envContent = `# Test Database Configuration
# Generated by setup-test-db.ts
# ${new Date().toISOString()}

DATABASE_URL="${databaseUrl}"

# Test environment settings
NODE_ENV="test"
SKIP_INTEGRATION_TESTS="false"

# Auth settings (test)
NEXTAUTH_SECRET="divine-test-secret-for-quantum-authentication-${Date.now()}"
NEXTAUTH_URL="http://localhost:3000"

# Payment provider test keys
PAYPAL_CLIENT_ID="test-paypal-client-id"
PAYPAL_CLIENT_SECRET="test-paypal-client-secret"
STRIPE_SECRET_KEY="test-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="test-stripe-publishable-key"
`;

  fs.writeFileSync(envTestPath, envContent);
  log(`✅ Created .env.test file`, "green");
  log(`   Location: ${envTestPath}`, "cyan");
}

async function printInstructions(databaseUrl: string) {
  logSection("🎉 Test Database Setup Complete!");

  log("Your test database is ready for integration tests.", "green");
  console.log("");
  log("Test Database URL:", "bright");
  log(`  ${databaseUrl}`, "cyan");
  console.log("");
  log("To run integration tests:", "bright");
  log(`  npm run test:integration`, "cyan");
  console.log("");
  log("To run all tests (unit + integration):", "bright");
  log(`  npm test`, "cyan");
  console.log("");
  log("To use .env.test for tests:", "bright");
  log(`  1. Install dotenv-cli: npm install -D dotenv-cli`, "cyan");
  log(`  2. Run: dotenv -e .env.test npm run test:integration`, "cyan");
  console.log("");
  log("Or export the DATABASE_URL manually:", "bright");
  log(`  export DATABASE_URL="${databaseUrl}"`, "cyan");
  log(`  npm run test:integration`, "cyan");
  console.log("");
}

async function main() {
  logSection("🌾 Divine Agricultural Platform - Test Database Setup");

  try {
    // Step 1: Check PostgreSQL installation
    log("Step 1: Checking PostgreSQL installation...", "bright");
    const postgresInstalled = await checkPostgresInstalled();

    if (!postgresInstalled) {
      log(`❌ PostgreSQL is not installed or not in PATH`, "red");
      console.log("");
      log("Please install PostgreSQL:", "yellow");
      log("  - macOS: brew install postgresql", "cyan");
      log("  - Ubuntu: sudo apt-get install postgresql", "cyan");
      log("  - Windows: Download from https://www.postgresql.org/download/", "cyan");
      process.exit(1);
    }

    log(`✅ PostgreSQL is installed`, "green");
    console.log("");

    // Step 2: Get database configuration
    log("Step 2: Loading database configuration...", "bright");
    const config = getTestDatabaseConfig();
    log(`✅ Configuration loaded`, "green");
    log(`   Host: ${config.parsed.host}`, "cyan");
    log(`   Port: ${config.parsed.port}`, "cyan");
    log(`   Database: ${config.parsed.database}`, "cyan");
    log(`   User: ${config.parsed.user}`, "cyan");
    console.log("");

    // Step 3: Check if database exists
    log("Step 3: Checking if database exists...", "bright");
    const exists = await checkDatabaseExists(config.parsed);

    if (exists) {
      log(`⚠️  Database already exists`, "yellow");
      log(`   Proceeding with existing database`, "yellow");
    } else {
      log(`Database does not exist`, "blue");
      await createDatabase(config.parsed);
    }
    console.log("");

    // Step 4: Run Prisma DB Push
    log("Step 4: Pushing Prisma schema to database...", "bright");
    await runPrismaPush(config.url);
    console.log("");

    // Step 5: Generate Prisma Client
    log("Step 5: Generating Prisma Client...", "bright");
    await runPrismaGenerate();
    console.log("");

    // Step 6: Seed test data (optional)
    log("Step 6: Seeding test data (optional)...", "bright");
    await seedTestData(config.url);
    console.log("");

    // Step 7: Create .env.test file
    log("Step 7: Creating .env.test configuration...", "bright");
    await updateEnvFile(config.url);
    console.log("");

    // Step 8: Print instructions
    await printInstructions(config.url);

    process.exit(0);
  } catch (error: any) {
    console.log("");
    log("❌ Test Database Setup Failed", "red");
    log(error.message, "red");
    console.log("");
    log("Troubleshooting:", "yellow");
    log("  1. Ensure PostgreSQL is running", "cyan");
    log("  2. Check database credentials", "cyan");
    log("  3. Verify network connectivity to database", "cyan");
    log("  4. Check if database user has CREATE DATABASE permission", "cyan");
    console.log("");
    process.exit(1);
  }
}

// Run main function
main();
