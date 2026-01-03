/**
 * 🔧 NEXTAUTH AUTOMATIC FIX SCRIPT
 * Divine authentication repair tool
 *
 * This script automatically fixes common NextAuth configuration issues:
 * 1. Generates NEXTAUTH_SECRET if missing
 * 2. Creates/updates .env.test and .env.local
 * 3. Verifies database connection
 * 4. Recreates test users with correct passwords
 * 5. Validates auth configuration
 *
 * Usage: npm run fix:auth
 * Or: tsx scripts/fix-nextauth.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import chalk from "chalk";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Pool } from "pg";

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test";

interface FixResult {
  step: string;
  action: string;
  success: boolean;
  message: string;
  details?: any;
}

const results: FixResult[] = [];

/**
 * Log fix result
 */
function logResult(result: FixResult) {
  results.push(result);
  const icon = result.success ? "✅" : "❌";
  const color = result.success ? chalk.green : chalk.red;
  console.log(color(`${icon} ${result.step}: ${result.message}`));
  if (result.action) {
    console.log(chalk.gray(`   Action: ${result.action}`));
  }
  if (result.details) {
    console.log(
      chalk.gray(`   Details: ${JSON.stringify(result.details, null, 2)}`),
    );
  }
}

/**
 * Generate NEXTAUTH_SECRET
 */
function generateSecret(): string {
  try {
    const secret = execSync("openssl rand -base64 32", {
      encoding: "utf-8",
    }).trim();
    return secret;
  } catch {
    // Fallback if openssl not available
    const crypto = require("crypto");
    return crypto.randomBytes(32).toString("base64");
  }
}

/**
 * Read or create .env file
 */
function readEnvFile(envPath: string): Record<string, string> {
  const env: Record<string, string> = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const [, key, value] = match;
          env[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }

  return env;
}

/**
 * Write .env file
 */
function writeEnvFile(envPath: string, env: Record<string, string>) {
  const lines = Object.entries(env).map(([key, value]) => {
    // Quote values with spaces or special characters
    const needsQuotes = /[\s#$]/.test(value);
    return `${key}=${needsQuotes ? `"${value}"` : value}`;
  });

  fs.writeFileSync(envPath, `${lines.join("\n")}\n`, "utf-8");
}

/**
 * Fix environment variables
 */
async function fixEnvironmentVariables() {
  console.log(chalk.bold.blue("\n🔧 STEP 1: Fix Environment Variables\n"));

  const projectRoot = process.cwd();
  const envTestPath = path.join(projectRoot, ".env.test");
  const envLocalPath = path.join(projectRoot, ".env.local");

  // Generate secret if needed
  let secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.log(chalk.yellow("   Generating new NEXTAUTH_SECRET..."));
    secret = generateSecret();
  }

  // Fix .env.test
  try {
    const envTest = readEnvFile(envTestPath);
    let updated = false;

    if (!envTest.DATABASE_URL) {
      envTest.DATABASE_URL = TEST_DATABASE_URL;
      updated = true;
    }

    if (!envTest.NEXTAUTH_URL) {
      envTest.NEXTAUTH_URL = "http://localhost:3001";
      updated = true;
    }

    if (!envTest.NEXTAUTH_SECRET) {
      envTest.NEXTAUTH_SECRET = secret;
      updated = true;
    }

    if (!envTest.NEXTAUTH_DEBUG) {
      envTest.NEXTAUTH_DEBUG = "true";
      updated = true;
    }

    writeEnvFile(envTestPath, envTest);

    logResult({
      step: ".env.test",
      action: updated
        ? "Updated with required variables"
        : "Already configured",
      success: true,
      message: updated ? "Environment file updated" : "Environment file OK",
    });
  } catch (error: any) {
    logResult({
      step: ".env.test",
      action: "Failed to update",
      success: false,
      message: error.message,
    });
  }

  // Fix .env.local
  try {
    const envLocal = readEnvFile(envLocalPath);
    let updated = false;

    if (!envLocal.DATABASE_URL) {
      envLocal.DATABASE_URL =
        "postgresql://postgres:postgres@localhost:5432/farmersmarket";
      updated = true;
    }

    if (!envLocal.NEXTAUTH_URL) {
      envLocal.NEXTAUTH_URL = "http://localhost:3001";
      updated = true;
    }

    if (!envLocal.NEXTAUTH_SECRET) {
      envLocal.NEXTAUTH_SECRET = secret;
      updated = true;
    }

    if (!envLocal.NEXTAUTH_DEBUG) {
      envLocal.NEXTAUTH_DEBUG = "true";
      updated = true;
    }

    writeEnvFile(envLocalPath, envLocal);

    logResult({
      step: ".env.local",
      action: updated
        ? "Updated with required variables"
        : "Already configured",
      success: true,
      message: updated ? "Environment file updated" : "Environment file OK",
    });
  } catch (error: any) {
    logResult({
      step: ".env.local",
      action: "Failed to update",
      success: false,
      message: error.message,
    });
  }

  // Reload environment
  process.env.NEXTAUTH_SECRET = secret;
  process.env.NEXTAUTH_URL = "http://localhost:3001";
}

/**
 * Fix database connection and seed test users
 */
async function fixDatabaseAndUsers() {
  console.log(chalk.bold.blue("\n🗄️  STEP 2: Fix Database & Test Users\n"));

  const pool = new Pool({ connectionString: TEST_DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const database = new PrismaClient({ adapter });

  try {
    // Test connection
    await database.$connect();
    logResult({
      step: "Database Connection",
      action: "Connected to database",
      success: true,
      message: "Database connection successful",
    });

    // Clean existing test users
    console.log(chalk.gray("\n   Cleaning existing test users..."));
    await database.user.deleteMany({
      where: {
        email: {
          in: [
            "admin@farmersmarket.app",
            "farmer@farmersmarket.app",
            "customer@farmersmarket.app",
          ],
        },
      },
    });

    // Get test password from environment (required for security)
    const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

    if (!TEST_USER_PASSWORD) {
      console.error(chalk.red("\n❌ ERROR: TEST_USER_PASSWORD environment variable is required"));
      console.log(chalk.yellow("\nUsage:"));
      console.log(chalk.cyan("  TEST_USER_PASSWORD=YourPassword123! npx tsx scripts/fix-nextauth.ts"));
      console.log(chalk.yellow("\nThis ensures test passwords are not hardcoded in the repository.\n"));
      process.exit(1);
    }

    // Create test users with password from environment
    const testUsers = [
      {
        email: "admin@farmersmarket.app",
        password: TEST_USER_PASSWORD,
        firstName: "Admin",
        lastName: "Test",
        role: "ADMIN" as const,
      },
      {
        email: "farmer@farmersmarket.app",
        password: TEST_USER_PASSWORD,
        firstName: "John",
        lastName: "Farmer",
        role: "FARMER" as const,
      },
      {
        email: "customer@farmersmarket.app",
        password: TEST_USER_PASSWORD,
        firstName: "Jane",
        lastName: "Customer",
        role: "CONSUMER" as const,
      },
    ];

    for (const userData of testUsers) {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        const user = await database.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            status: "ACTIVE",
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        // Verify password works
        const passwordValid = await bcrypt.compare(
          userData.password,
          hashedPassword,
        );

        logResult({
          step: `Create User: ${userData.email}`,
          action: "Created with hashed password",
          success: passwordValid,
          message: passwordValid
            ? "User created successfully"
            : "Password verification failed",
          details: {
            role: user.role,
            status: user.status,
            passwordVerified: passwordValid,
          },
        });
      } catch (error: any) {
        logResult({
          step: `Create User: ${userData.email}`,
          action: "Failed to create",
          success: false,
          message: error.message,
        });
      }
    }

    await database.$disconnect();
    await pool.end();
  } catch (error: any) {
    logResult({
      step: "Database Setup",
      action: "Failed",
      success: false,
      message: error.message,
    });

    await database.$disconnect();
    await pool.end();
    throw error;
  }
}

/**
 * Verify auth configuration file
 */
async function verifyAuthConfig() {
  console.log(chalk.bold.blue("\n⚙️  STEP 3: Verify Auth Configuration\n"));

  const configPath = path.join(
    process.cwd(),
    "src",
    "lib",
    "auth",
    "config.ts",
  );

  try {
    if (!fs.existsSync(configPath)) {
      logResult({
        step: "Auth Config",
        action: "File not found",
        success: false,
        message: "Auth config file missing!",
      });
      return;
    }

    const configContent = fs.readFileSync(configPath, "utf-8");

    // Check for CONSUMER role support
    if (
      !configContent.includes('"CONSUMER"') &&
      !configContent.includes("'CONSUMER'")
    ) {
      console.log(
        chalk.yellow("   ⚠️  CONSUMER role not found in allowed roles"),
      );
      console.log(chalk.yellow("   Adding CONSUMER role to auth config..."));

      // Update config to include CONSUMER
      const updatedConfig = configContent.replace(
        /const allowedRoles:\s*UserRole\[\]\s*=\s*\[([\s\S]*?)\];/,
        (match, roles) => {
          if (!roles.includes("CONSUMER")) {
            return match.replace(
              "];",
              ',\n            "CONSUMER",\n          ];',
            );
          }
          return match;
        },
      );

      fs.writeFileSync(configPath, updatedConfig, "utf-8");

      logResult({
        step: "CONSUMER Role",
        action: "Added to allowed roles",
        success: true,
        message: "Auth config updated to allow CONSUMER role",
      });
    } else {
      logResult({
        step: "CONSUMER Role",
        action: "Already configured",
        success: true,
        message: "CONSUMER role is allowed",
      });
    }

    // Check login page configuration
    const hasCorrectLoginPage = configContent.includes('signIn: "/login"');
    if (!hasCorrectLoginPage) {
      console.log(chalk.yellow("   ⚠️  Login page set to /admin-login"));
      console.log(chalk.yellow("   Updating to /login..."));

      const updatedConfig = configContent.replace(
        /signIn:\s*["']\/admin-login["']/g,
        'signIn: "/login"',
      );

      fs.writeFileSync(configPath, updatedConfig, "utf-8");

      logResult({
        step: "Login Page Config",
        action: "Updated to /login",
        success: true,
        message: "Login page configuration fixed",
      });
    } else {
      logResult({
        step: "Login Page Config",
        action: "Already correct",
        success: true,
        message: "Login page is /login",
      });
    }

    // Verify other critical patterns
    const checks = [
      { pattern: /CredentialsProvider/i, name: "CredentialsProvider" },
      { pattern: /bcryptjs|bcrypt/i, name: "bcrypt" },
      { pattern: /compare\(/i, name: "password compare" },
    ];

    for (const check of checks) {
      const found = check.pattern.test(configContent);
      logResult({
        step: `Config Check: ${check.name}`,
        action: found ? "Found" : "Missing",
        success: found,
        message: found ? `${check.name} configured` : `${check.name} missing!`,
      });
    }
  } catch (error: any) {
    logResult({
      step: "Auth Config Verification",
      action: "Failed",
      success: false,
      message: error.message,
    });
  }
}

/**
 * Create auth directory for Playwright
 */
async function createAuthDirectory() {
  console.log(chalk.bold.blue("\n📁 STEP 4: Create Auth Directory\n"));

  const authDir = path.join(process.cwd(), "tests", "auth", ".auth");

  try {
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });

      // Create .gitkeep to track directory
      fs.writeFileSync(path.join(authDir, ".gitkeep"), "", "utf-8");

      logResult({
        step: "Auth Directory",
        action: "Created directory",
        success: true,
        message: "Auth storage directory created",
        details: { path: authDir },
      });
    } else {
      logResult({
        step: "Auth Directory",
        action: "Already exists",
        success: true,
        message: "Auth storage directory exists",
      });
    }
  } catch (error: any) {
    logResult({
      step: "Auth Directory",
      action: "Failed to create",
      success: false,
      message: error.message,
    });
  }
}

/**
 * Generate summary
 */
function generateSummary() {
  console.log(chalk.bold.blue("\n📊 FIX SUMMARY\n"));

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const totalCount = results.length;

  console.log(chalk.bold(`Total Fixes: ${totalCount}`));
  console.log(chalk.green(`✅ Successful: ${successCount}`));
  console.log(chalk.red(`❌ Failed: ${failureCount}\n`));

  if (failureCount > 0) {
    console.log(chalk.bold.red("⚠️  SOME FIXES FAILED:\n"));

    const failures = results.filter((r) => !r.success);
    failures.forEach((failure, index) => {
      console.log(
        chalk.red(`${index + 1}. ${failure.step}: ${failure.message}`),
      );
    });

    console.log(chalk.yellow("\n💡 NEXT STEPS:\n"));
    console.log(chalk.yellow("1. Review the errors above"));
    console.log(chalk.yellow("2. Run diagnostic: npm run debug:auth"));
    console.log(
      chalk.yellow("3. Check documentation: docs/NEXTAUTH_DEBUG_GUIDE.md\n"),
    );
  } else {
    console.log(chalk.bold.green("🎉 ALL FIXES APPLIED SUCCESSFULLY!\n"));
    console.log(chalk.green("Next steps:"));
    console.log(chalk.green("1. Restart dev server: npm run dev"));
    console.log(chalk.green("2. Run diagnostics: npm run debug:auth"));
    console.log(chalk.green("3. Test login at: http://localhost:3001/login"));
    console.log(chalk.green("4. Run E2E tests: npm run test:e2e\n"));
  }
}

/**
 * Main fix function
 */
async function runFixes() {
  console.log(
    chalk.bold.cyan(
      "\n╔════════════════════════════════════════════════════════════╗",
    ),
  );
  console.log(
    chalk.bold.cyan(
      "║  🔧 NextAuth Automatic Fix Tool                           ║",
    ),
  );
  console.log(
    chalk.bold.cyan(
      "╚════════════════════════════════════════════════════════════╝",
    ),
  );

  try {
    await fixEnvironmentVariables();
    await fixDatabaseAndUsers();
    await verifyAuthConfig();
    await createAuthDirectory();

    generateSummary();
  } catch (error: any) {
    console.error(chalk.red("\n💥 Fatal Error:"), error.message);
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

// Run fixes if executed directly
if (require.main === module) {
  runFixes()
    .then(() => {
      console.log(chalk.bold.green("✅ Fixes complete!\n"));
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red("\n❌ Fix failed:"), error);
      process.exit(1);
    });
}

export default runFixes;
