/**
 * 🔐 NEXTAUTH CONFIGURATION DIAGNOSTIC SCRIPT
 * Divine debugging tool for authentication issues
 *
 * This script verifies:
 * 1. Environment variables are set correctly
 * 2. Database connection works
 * 3. Test users exist with correct passwords
 * 4. Password hashing/comparison works
 * 5. NextAuth configuration is valid
 *
 * Usage: npm run debug:auth
 * Or: tsx scripts/debug-nextauth.ts
 */

// Load environment variables from .env.test
import * as fs from "fs";
import * as path from "path";

// Load .env.test file
const envTestPath = path.join(process.cwd(), ".env.test");
if (fs.existsSync(envTestPath)) {
  const envContent = fs.readFileSync(envTestPath, "utf-8");
  const lines = envContent.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        const cleanKey = key.trim();
        const cleanValue = value.trim().replace(/^["']|["']$/g, "");
        if (!process.env[cleanKey]) {
          process.env[cleanKey] = cleanValue;
        }
      }
    }
  }
}

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import chalk from "chalk";
import { Pool } from "pg";

// Test database URL
const TEST_DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test";

// Create Prisma client
const pool = new Pool({ connectionString: TEST_DATABASE_URL });
const adapter = new PrismaPg(pool);
const database = new PrismaClient({ adapter });

interface DiagnosticResult {
  step: string;
  success: boolean;
  message: string;
  details?: any;
}

const results: DiagnosticResult[] = [];

/**
 * Log diagnostic result
 */
function logResult(result: DiagnosticResult) {
  results.push(result);
  const icon = result.success ? "✅" : "❌";
  const color = result.success ? chalk.green : chalk.red;
  console.log(color(`${icon} ${result.step}: ${result.message}`));
  if (result.details) {
    console.log(
      chalk.gray(`   Details: ${JSON.stringify(result.details, null, 2)}`),
    );
  }
}

/**
 * Check environment variables
 */
async function checkEnvironmentVariables() {
  console.log(chalk.bold.blue("\n📋 STEP 1: Environment Variables\n"));

  const requiredVars = {
    DATABASE_URL: TEST_DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3001",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "MISSING",
  };

  for (const [key, value] of Object.entries(requiredVars)) {
    const exists = value !== "MISSING" && value !== undefined;
    logResult({
      step: `ENV: ${key}`,
      success: exists,
      message: exists ? "Set" : "MISSING - This will cause auth failures!",
      details: exists ? `${value.substring(0, 50)}...` : undefined,
    });
  }

  // Check if NEXTAUTH_SECRET exists
  if (!process.env.NEXTAUTH_SECRET) {
    console.log(chalk.yellow("\n⚠️  NEXTAUTH_SECRET is missing!"));
    console.log(chalk.yellow("   Generate one with: openssl rand -base64 32"));
    console.log(
      chalk.yellow('   Add to .env.test: NEXTAUTH_SECRET="your-secret-here"'),
    );
  }
}

/**
 * Check database connection
 */
async function checkDatabaseConnection() {
  console.log(chalk.bold.blue("\n🗄️  STEP 2: Database Connection\n"));

  try {
    await database.$connect();
    logResult({
      step: "Database Connection",
      success: true,
      message: "Successfully connected to database",
      details: { url: TEST_DATABASE_URL.replace(/:[^:@]+@/, ":***@") },
    });

    // Check if User table exists
    const userCount = await database.user.count();
    logResult({
      step: "User Table",
      success: true,
      message: `Found ${userCount} users in database`,
    });
  } catch (error: any) {
    logResult({
      step: "Database Connection",
      success: false,
      message: "Failed to connect to database",
      details: { error: error.message },
    });
    throw error;
  }
}

/**
 * Verify test users exist
 */
async function verifyTestUsers() {
  console.log(chalk.bold.blue("\n👥 STEP 3: Test Users Verification\n"));

  // Get test password from environment (required for security)
  const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

  if (!TEST_USER_PASSWORD) {
    console.error(
      chalk.red(
        "\n❌ ERROR: TEST_USER_PASSWORD environment variable is required",
      ),
    );
    console.log(chalk.yellow("\nUsage:"));
    console.log(
      chalk.cyan(
        "  TEST_USER_PASSWORD=YourPassword123! npx tsx scripts/debug-nextauth.ts",
      ),
    );
    console.log(
      chalk.yellow(
        "\nThis ensures test passwords are not hardcoded in the repository.\n",
      ),
    );
    process.exit(1);
  }

  const testUsers = [
    {
      email: "admin@farmersmarket.app",
      password: TEST_USER_PASSWORD,
      expectedRole: "ADMIN",
    },
    {
      email: "farmer@farmersmarket.app",
      password: TEST_USER_PASSWORD,
      expectedRole: "FARMER",
    },
    {
      email: "customer@farmersmarket.app",
      password: TEST_USER_PASSWORD,
      expectedRole: "CONSUMER",
    },
  ];

  for (const testUser of testUsers) {
    try {
      const user = await database.user.findUnique({
        where: { email: testUser.email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          emailVerified: true,
        },
      });

      if (!user) {
        logResult({
          step: `User: ${testUser.email}`,
          success: false,
          message: "User does not exist in database",
        });
        continue;
      }

      // Check password exists
      if (!user.password) {
        logResult({
          step: `User: ${testUser.email}`,
          success: false,
          message: "User exists but has no password set",
          details: user,
        });
        continue;
      }

      // Verify password
      const passwordValid = await bcrypt.compare(
        testUser.password,
        user.password,
      );

      logResult({
        step: `User: ${testUser.email}`,
        success: passwordValid,
        message: passwordValid
          ? "User exists with correct password"
          : "Password does not match",
        details: {
          role: user.role,
          expectedRole: testUser.expectedRole,
          roleMatch: user.role === testUser.expectedRole,
          status: user.status,
          emailVerified: user.emailVerified,
          passwordHash: `${user.password.substring(0, 20)}...`,
        },
      });

      // Check role
      if (user.role !== testUser.expectedRole) {
        logResult({
          step: `Role Check: ${testUser.email}`,
          success: false,
          message: `Role mismatch: expected ${testUser.expectedRole}, got ${user.role}`,
        });
      }

      // Check status
      if (user.status !== "ACTIVE") {
        logResult({
          step: `Status Check: ${testUser.email}`,
          success: false,
          message: `User status is ${user.status}, must be ACTIVE`,
        });
      }
    } catch (error: any) {
      logResult({
        step: `User: ${testUser.email}`,
        success: false,
        message: "Error checking user",
        details: { error: error.message },
      });
    }
  }
}

/**
 * Test password hashing
 */
async function testPasswordHashing() {
  console.log(chalk.bold.blue("\n🔐 STEP 4: Password Hashing Test\n"));

  const testPassword = process.env.TEST_USER_PASSWORD || "DivineTest123!";

  try {
    // Hash password with 12 rounds (same as seed script)
    const hash = await bcrypt.hash(testPassword, 12);
    logResult({
      step: "Password Hashing",
      success: true,
      message: "Successfully hashed test password",
      details: { hash: `${hash.substring(0, 30)}...` },
    });

    // Verify password
    const valid = await bcrypt.compare(testPassword, hash);
    logResult({
      step: "Password Verification",
      success: valid,
      message: valid
        ? "Password verification works"
        : "Password verification failed!",
    });

    // Test with wrong password
    const invalidValid = await bcrypt.compare("WrongPassword", hash);
    logResult({
      step: "Wrong Password Test",
      success: !invalidValid,
      message: !invalidValid
        ? "Correctly rejected wrong password"
        : "ERROR: Accepted wrong password!",
    });
  } catch (error: any) {
    logResult({
      step: "Password Hashing",
      success: false,
      message: "Password hashing failed",
      details: { error: error.message },
    });
  }
}

/**
 * Simulate NextAuth authorize flow
 */
async function simulateAuthFlow() {
  console.log(
    chalk.bold.blue("\n🔄 STEP 5: Simulate NextAuth Authorize Flow\n"),
  );

  const testCredentials = {
    email: "farmer@farmersmarket.app",
    password: process.env.TEST_USER_PASSWORD || "DivineFarmer123!",
  };

  try {
    // Step 1: Find user
    const user = await database.user.findUnique({
      where: { email: testCredentials.email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      logResult({
        step: "Auth Flow: Find User",
        success: false,
        message: "User not found",
      });
      return;
    }

    logResult({
      step: "Auth Flow: Find User",
      success: true,
      message: "User found",
    });

    // Step 2: Check password exists
    if (!user.password) {
      logResult({
        step: "Auth Flow: Check Password",
        success: false,
        message: "No password set for user",
      });
      return;
    }

    logResult({
      step: "Auth Flow: Check Password Exists",
      success: true,
      message: "Password exists",
    });

    // Step 3: Verify password
    const isValidPassword = await bcrypt.compare(
      testCredentials.password,
      user.password,
    );

    logResult({
      step: "Auth Flow: Verify Password",
      success: isValidPassword,
      message: isValidPassword ? "Password valid" : "Password invalid",
    });

    if (!isValidPassword) {
      return;
    }

    // Step 4: Check status
    const isActive = user.status === "ACTIVE";
    logResult({
      step: "Auth Flow: Check Status",
      success: isActive,
      message: isActive ? "User is ACTIVE" : `User status is ${user.status}`,
    });

    // Step 5: Check role
    const allowedRoles = [
      "ADMIN",
      "SUPER_ADMIN",
      "MODERATOR",
      "FARMER",
      "CONSUMER",
    ];
    const hasValidRole = allowedRoles.includes(user.role);
    logResult({
      step: "Auth Flow: Check Role",
      success: hasValidRole,
      message: hasValidRole
        ? `User has valid role: ${user.role}`
        : `Invalid role: ${user.role}`,
    });

    // Step 6: Construct return object
    if (isValidPassword && isActive && hasValidRole) {
      const authUser = {
        id: user.id,
        email: user.email,
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        role: user.role,
        status: user.status,
      };

      logResult({
        step: "Auth Flow: Complete",
        success: true,
        message: "Authentication would succeed!",
        details: authUser,
      });
    } else {
      logResult({
        step: "Auth Flow: Complete",
        success: false,
        message: "Authentication would fail",
      });
    }
  } catch (error: any) {
    logResult({
      step: "Auth Flow Simulation",
      success: false,
      message: "Error during simulation",
      details: { error: error.message },
    });
  }
}

/**
 * Check NextAuth configuration
 */
async function checkNextAuthConfig() {
  console.log(chalk.bold.blue("\n⚙️  STEP 6: NextAuth Configuration\n"));

  try {
    // Check if auth config file exists
    const fs = require("fs");
    const path = require("path");

    const configPath = path.join(
      process.cwd(),
      "src",
      "lib",
      "auth",
      "config.ts",
    );
    const configExists = fs.existsSync(configPath);

    logResult({
      step: "Auth Config File",
      success: configExists,
      message: configExists ? "Config file exists" : "Config file not found",
      details: { path: configPath },
    });

    if (configExists) {
      const configContent = fs.readFileSync(configPath, "utf-8");

      // Check for key patterns
      const checks = [
        { pattern: /CredentialsProvider/i, name: "CredentialsProvider" },
        { pattern: /bcryptjs|bcrypt/i, name: "bcrypt import" },
        { pattern: /compare\(/i, name: "password comparison" },
        { pattern: /CONSUMER/i, name: "CONSUMER role support" },
        { pattern: /signIn.*login/i, name: "login page config" },
      ];

      for (const check of checks) {
        const found = check.pattern.test(configContent);
        logResult({
          step: `Config Check: ${check.name}`,
          success: found,
          message: found ? "Found" : "Not found",
        });
      }
    }
  } catch (error: any) {
    logResult({
      step: "NextAuth Config Check",
      success: false,
      message: "Error checking config",
      details: { error: error.message },
    });
  }
}

/**
 * Generate summary and recommendations
 */
function generateSummary() {
  console.log(chalk.bold.blue("\n📊 DIAGNOSTIC SUMMARY\n"));

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const totalCount = results.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);

  console.log(chalk.bold(`Total Checks: ${totalCount}`));
  console.log(chalk.green(`✅ Passed: ${successCount}`));
  console.log(chalk.red(`❌ Failed: ${failureCount}`));
  console.log(chalk.bold(`Success Rate: ${successRate}%\n`));

  if (failureCount > 0) {
    console.log(chalk.bold.red("🔧 ISSUES FOUND:\n"));

    const failures = results.filter((r) => !r.success);
    failures.forEach((failure, index) => {
      console.log(chalk.red(`${index + 1}. ${failure.step}`));
      console.log(chalk.gray(`   ${failure.message}`));
      if (failure.details) {
        console.log(chalk.gray(`   ${JSON.stringify(failure.details)}`));
      }
      console.log();
    });

    console.log(chalk.bold.yellow("💡 RECOMMENDED ACTIONS:\n"));

    // Check for specific issues and provide solutions
    if (failures.some((f) => f.step.includes("NEXTAUTH_SECRET"))) {
      console.log(
        chalk.yellow("1. Generate NEXTAUTH_SECRET: openssl rand -base64 32"),
      );
      console.log(
        chalk.yellow(
          '   Add to .env.test: NEXTAUTH_SECRET="your-secret-here"\n',
        ),
      );
    }

    if (
      failures.some(
        (f) => f.step.includes("User:") && f.message.includes("not exist"),
      )
    ) {
      console.log(chalk.yellow("2. Seed test users: npm run db:test:setup"));
      console.log(chalk.yellow("   Or run: tsx tests/global-setup.ts\n"));
    }

    if (
      failures.some(
        (f) =>
          f.step.includes("Password") && f.message.includes("does not match"),
      )
    ) {
      console.log(chalk.yellow("3. Password mismatch - Check:"));
      console.log(
        chalk.yellow("   - Seed script uses bcrypt.hash(password, 12)"),
      );
      console.log(chalk.yellow("   - Auth config uses bcrypt.compare()"));
      console.log(
        chalk.yellow("   - Both use the same bcrypt library (bcryptjs)\n"),
      );
    }

    if (failures.some((f) => f.step.includes("Role"))) {
      console.log(chalk.yellow("4. Update auth config to allow CONSUMER role"));
      console.log(
        chalk.yellow(
          '   In src/lib/auth/config.ts, ensure allowedRoles includes "CONSUMER"\n',
        ),
      );
    }

    if (failures.some((f) => f.step.includes("Database"))) {
      console.log(chalk.yellow("5. Check database connection:"));
      console.log(chalk.yellow("   - Is PostgreSQL running on port 5433?"));
      console.log(chalk.yellow("   - Run: docker-compose up -d"));
      console.log(chalk.yellow("   - Check DATABASE_URL in .env.test\n"));
    }
  } else {
    console.log(chalk.bold.green("🎉 ALL CHECKS PASSED!\n"));
    console.log(chalk.green("Your NextAuth configuration looks good."));
    console.log(chalk.green("If E2E tests still fail, check:"));
    console.log(chalk.green("1. Dev server is running on correct port (3001)"));
    console.log(chalk.green("2. BASE_URL environment variable is set"));
    console.log(chalk.green("3. Browser console for JavaScript errors\n"));
  }
}

/**
 * Main diagnostic function
 */
async function runDiagnostics() {
  console.log(
    chalk.bold.cyan(
      "\n╔════════════════════════════════════════════════════════════╗",
    ),
  );
  console.log(
    chalk.bold.cyan(
      "║  🔐 NextAuth Configuration Diagnostic Tool                ║",
    ),
  );
  console.log(
    chalk.bold.cyan(
      "╚════════════════════════════════════════════════════════════╝",
    ),
  );

  try {
    await checkEnvironmentVariables();
    await checkDatabaseConnection();
    await verifyTestUsers();
    await testPasswordHashing();
    await simulateAuthFlow();
    await checkNextAuthConfig();

    generateSummary();
  } catch (error: any) {
    console.error(chalk.red("\n💥 Fatal Error:"), error.message);
    console.error(chalk.gray(error.stack));
    process.exit(1);
  } finally {
    await database.$disconnect();
    await pool.end();
  }
}

// Run diagnostics if executed directly
if (require.main === module) {
  runDiagnostics()
    .then(() => {
      console.log(chalk.bold.green("\n✅ Diagnostics complete!\n"));
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red("\n❌ Diagnostics failed:"), error);
      process.exit(1);
    });
}

export default runDiagnostics;
