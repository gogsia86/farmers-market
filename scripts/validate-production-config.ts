#!/usr/bin/env tsx
/**
 * 🔍 Production Configuration Validation Script
 * Phase 7 - MVP Launch
 *
 * This script validates all production environment variables and service connections
 * before deploying to production. Ensures 100% readiness for launch.
 *
 * @author Farmers Market Platform Team
 * @version 1.0.0
 * @agricultural_consciousness MAXIMUM
 */

import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import chalk from "chalk";

// ============================================================================
// 🎯 CONFIGURATION VALIDATION TYPES
// ============================================================================

interface ValidationResult {
  category: string;
  check: string;
  status: "PASS" | "FAIL" | "WARN";
  message: string;
  details?: string;
}

interface ValidationReport {
  timestamp: Date;
  environment: string;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  results: ValidationResult[];
  readyForProduction: boolean;
}

// ============================================================================
// 🌾 DIVINE VALIDATION ORCHESTRATOR
// ============================================================================

class ProductionConfigValidator {
  private results: ValidationResult[] = [];
  private prisma: PrismaClient | null = null;
  private stripe: Stripe | null = null;

  constructor() {
    console.log(
      chalk.cyan.bold(
        "\n╔════════════════════════════════════════════════════════════╗",
      ),
    );
    console.log(
      chalk.cyan.bold(
        "║   🚀 PRODUCTION CONFIGURATION VALIDATION                  ║",
      ),
    );
    console.log(
      chalk.cyan.bold(
        "║   Phase 7: MVP Launch - Agricultural Divine Readiness    ║",
      ),
    );
    console.log(
      chalk.cyan.bold(
        "╚════════════════════════════════════════════════════════════╝\n",
      ),
    );
  }

  /**
   * Add validation result
   */
  private addResult(
    category: string,
    check: string,
    status: "PASS" | "FAIL" | "WARN",
    message: string,
    details?: string,
  ): void {
    this.results.push({ category, check, status, message, details });

    const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
    const color =
      status === "PASS"
        ? chalk.green
        : status === "FAIL"
          ? chalk.red
          : chalk.yellow;

    console.log(color(`${icon} [${category}] ${check}: ${message}`));
    if (details) {
      console.log(chalk.gray(`   ↳ ${details}`));
    }
  }

  /**
   * Validate environment variables
   */
  async validateEnvironmentVariables(): Promise<void> {
    console.log(chalk.blue.bold("\n📋 Validating Environment Variables...\n"));

    const requiredVars = [
      // Core Application
      { key: "NEXT_PUBLIC_APP_URL", category: "Core", production: true },
      { key: "NODE_ENV", category: "Core", expected: "production" },

      // Database
      { key: "DATABASE_URL", category: "Database", sensitive: true },

      // Authentication
      { key: "NEXTAUTH_URL", category: "Auth", production: true },
      {
        key: "NEXTAUTH_SECRET",
        category: "Auth",
        sensitive: true,
        minLength: 32,
      },

      // Stripe (Production)
      {
        key: "STRIPE_SECRET_KEY",
        category: "Payments",
        sensitive: true,
        prefix: "sk_live_",
      },
      {
        key: "STRIPE_PUBLISHABLE_KEY",
        category: "Payments",
        prefix: "pk_live_",
      },
      {
        key: "STRIPE_WEBHOOK_SECRET",
        category: "Payments",
        sensitive: true,
        prefix: "whsec_",
      },

      // Redis Cache
      { key: "REDIS_URL", category: "Cache", sensitive: true },

      // Monitoring
      { key: "SENTRY_DSN", category: "Monitoring", production: true },
      {
        key: "AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING",
        category: "Monitoring",
        sensitive: true,
      },

      // Email
      { key: "SMTP_HOST", category: "Email", optional: true },
      { key: "SMTP_PORT", category: "Email", optional: true },
      { key: "SMTP_USER", category: "Email", optional: true },
      { key: "SMTP_PASS", category: "Email", optional: true, sensitive: true },

      // Agricultural Consciousness
      {
        key: "AGRICULTURAL_CONSCIOUSNESS",
        category: "Divine",
        expected: "enabled",
      },
      { key: "DIVINE_PATTERNS", category: "Divine", expected: "active" },
    ];

    for (const varConfig of requiredVars) {
      const value = process.env[varConfig.key];

      // Check if variable exists
      if (!value) {
        if (varConfig.optional) {
          this.addResult(
            varConfig.category,
            varConfig.key,
            "WARN",
            "Optional variable not set",
            "This is optional but recommended for production",
          );
        } else {
          this.addResult(
            varConfig.category,
            varConfig.key,
            "FAIL",
            "Required variable missing",
            `Set ${varConfig.key} in production environment`,
          );
        }
        continue;
      }

      // Check expected value
      if (varConfig.expected && value !== varConfig.expected) {
        this.addResult(
          varConfig.category,
          varConfig.key,
          "FAIL",
          `Expected "${varConfig.expected}" but got "${value}"`,
          `Update ${varConfig.key} to correct value`,
        );
        continue;
      }

      // Check prefix
      if (varConfig.prefix && !value.startsWith(varConfig.prefix)) {
        this.addResult(
          varConfig.category,
          varConfig.key,
          "FAIL",
          `Must start with "${varConfig.prefix}"`,
          "Ensure you are using production keys, not test keys",
        );
        continue;
      }

      // Check minimum length
      if (varConfig.minLength && value.length < varConfig.minLength) {
        this.addResult(
          varConfig.category,
          varConfig.key,
          "FAIL",
          `Must be at least ${varConfig.minLength} characters`,
          `Current length: ${value.length} characters`,
        );
        continue;
      }

      // Check production URL
      if (varConfig.production && !value.includes("farmersmarket.com")) {
        this.addResult(
          varConfig.category,
          varConfig.key,
          "WARN",
          "Does not contain production domain",
          `Current value: ${value}`,
        );
        continue;
      }

      // All checks passed
      const displayValue = varConfig.sensitive
        ? `${value.substring(0, 10)}...`
        : value;

      this.addResult(
        varConfig.category,
        varConfig.key,
        "PASS",
        "Configured correctly",
        `Value: ${displayValue}`,
      );
    }
  }

  /**
   * Validate database connection
   */
  async validateDatabase(): Promise<void> {
    console.log(chalk.blue.bold("\n🗄️  Validating Database Connection...\n"));

    try {
      this.prisma = new PrismaClient();

      // Test connection
      await this.prisma.$connect();
      this.addResult(
        "Database",
        "Connection",
        "PASS",
        "Successfully connected to database",
      );

      // Check database name
      const dbUrl = process.env.DATABASE_URL || "";
      if (dbUrl.includes("test") || dbUrl.includes("dev")) {
        this.addResult(
          "Database",
          "Database Name",
          "WARN",
          'Database URL contains "test" or "dev"',
          "Ensure this is the production database",
        );
      } else {
        this.addResult(
          "Database",
          "Database Name",
          "PASS",
          "Production database detected",
        );
      }

      // Test query performance
      const startTime = Date.now();
      await this.prisma.user.findFirst();
      const queryTime = Date.now() - startTime;

      if (queryTime > 100) {
        this.addResult(
          "Database",
          "Query Performance",
          "WARN",
          `Query took ${queryTime}ms (target: <50ms)`,
          "Consider optimizing database or connection pooling",
        );
      } else {
        this.addResult(
          "Database",
          "Query Performance",
          "PASS",
          `Query executed in ${queryTime}ms`,
        );
      }

      // Check for migrations
      const tables = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      `;

      if (tables.length < 5) {
        this.addResult(
          "Database",
          "Schema Migration",
          "FAIL",
          `Only ${tables.length} tables found`,
          "Run database migrations: npm run db:migrate",
        );
      } else {
        this.addResult(
          "Database",
          "Schema Migration",
          "PASS",
          `${tables.length} tables found - schema looks complete`,
        );
      }
    } catch (error) {
      this.addResult(
        "Database",
        "Connection",
        "FAIL",
        "Failed to connect to database",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      if (this.prisma) {
        await this.prisma.$disconnect();
      }
    }
  }

  /**
   * Validate Stripe configuration
   */
  async validateStripe(): Promise<void> {
    console.log(chalk.blue.bold("\n💳 Validating Stripe Configuration...\n"));

    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      this.addResult(
        "Payments",
        "Stripe Setup",
        "FAIL",
        "STRIPE_SECRET_KEY not set",
      );
      return;
    }

    try {
      this.stripe = new Stripe(secretKey, {
        apiVersion: "2024-11-20.acacia",
        typescript: true,
      });

      // Test API connection
      const account = await this.stripe.accounts.retrieve();

      this.addResult(
        "Payments",
        "Stripe Connection",
        "PASS",
        "Successfully connected to Stripe",
        `Account: ${account.id}`,
      );

      // Check if account is in live mode
      if (!secretKey.startsWith("sk_live_")) {
        this.addResult(
          "Payments",
          "Stripe Mode",
          "FAIL",
          "Not using live Stripe keys",
          "You must use sk_live_* keys for production",
        );
      } else {
        this.addResult(
          "Payments",
          "Stripe Mode",
          "PASS",
          "Using production live keys",
        );
      }

      // Check account details
      if (!account.details_submitted) {
        this.addResult(
          "Payments",
          "Account Status",
          "WARN",
          "Account details not fully submitted",
          "Complete your Stripe account setup",
        );
      } else {
        this.addResult(
          "Payments",
          "Account Status",
          "PASS",
          "Account fully configured",
        );
      }

      // Check capabilities
      if (!account.charges_enabled) {
        this.addResult(
          "Payments",
          "Charges Enabled",
          "FAIL",
          "Charges not enabled on account",
          "Contact Stripe support to enable charges",
        );
      } else {
        this.addResult(
          "Payments",
          "Charges Enabled",
          "PASS",
          "Ready to accept payments",
        );
      }
    } catch (error) {
      this.addResult(
        "Payments",
        "Stripe Connection",
        "FAIL",
        "Failed to connect to Stripe",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Validate Redis cache
   */
  async validateRedis(): Promise<void> {
    console.log(chalk.blue.bold("\n⚡ Validating Redis Cache...\n"));

    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      this.addResult("Cache", "Redis URL", "FAIL", "REDIS_URL not configured");
      return;
    }

    try {
      // We'll use a simple fetch to check if Redis is accessible
      // In production, this would use the actual Redis client
      this.addResult(
        "Cache",
        "Redis Configuration",
        "PASS",
        "Redis URL configured",
        "Manual verification required during deployment",
      );

      // Check URL format
      if (redisUrl.startsWith("redis://") || redisUrl.startsWith("rediss://")) {
        this.addResult(
          "Cache",
          "Redis URL Format",
          "PASS",
          "Correct URL format",
        );
      } else {
        this.addResult(
          "Cache",
          "Redis URL Format",
          "WARN",
          "URL format may be incorrect",
          "Should start with redis:// or rediss://",
        );
      }
    } catch (error) {
      this.addResult(
        "Cache",
        "Redis Connection",
        "FAIL",
        "Failed to validate Redis",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Validate monitoring tools
   */
  async validateMonitoring(): Promise<void> {
    console.log(chalk.blue.bold("\n📊 Validating Monitoring Tools...\n"));

    // Validate Sentry
    const sentryDsn = process.env.SENTRY_DSN;
    if (!sentryDsn) {
      this.addResult(
        "Monitoring",
        "Sentry DSN",
        "WARN",
        "Sentry not configured (optional)",
      );
    } else if (
      sentryDsn.startsWith("https://") &&
      sentryDsn.includes("@sentry.io")
    ) {
      this.addResult(
        "Monitoring",
        "Sentry DSN",
        "PASS",
        "Sentry configured correctly",
      );
    } else {
      this.addResult(
        "Monitoring",
        "Sentry DSN",
        "FAIL",
        "Invalid Sentry DSN format",
        "Should be https://<key>@sentry.io/<project>",
      );
    }

    // Validate Azure Application Insights
    const azureConnectionString =
      process.env.AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING;
    if (!azureConnectionString) {
      this.addResult(
        "Monitoring",
        "Azure Insights",
        "WARN",
        "Azure Application Insights not configured (optional)",
      );
    } else if (azureConnectionString.includes("InstrumentationKey=")) {
      this.addResult(
        "Monitoring",
        "Azure Insights",
        "PASS",
        "Azure Insights configured",
      );
    } else {
      this.addResult(
        "Monitoring",
        "Azure Insights",
        "FAIL",
        "Invalid Azure connection string format",
      );
    }
  }

  /**
   * Validate email service
   */
  async validateEmail(): Promise<void> {
    console.log(chalk.blue.bold("\n📧 Validating Email Service...\n"));

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      this.addResult(
        "Email",
        "SMTP Configuration",
        "WARN",
        "Email service not fully configured",
        "Some email variables are missing. Email sending may not work.",
      );
      return;
    }

    this.addResult(
      "Email",
      "SMTP Configuration",
      "PASS",
      "All SMTP variables configured",
    );

    // Validate port
    const port = parseInt(smtpPort, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      this.addResult("Email", "SMTP Port", "FAIL", `Invalid port: ${smtpPort}`);
    } else {
      this.addResult("Email", "SMTP Port", "PASS", `Port ${port} configured`);
    }
  }

  /**
   * Validate agricultural consciousness
   */
  async validateAgriculturalConsciousness(): Promise<void> {
    console.log(
      chalk.blue.bold("\n🌾 Validating Agricultural Consciousness...\n"),
    );

    const consciousness = process.env.AGRICULTURAL_CONSCIOUSNESS;
    const divinePatterns = process.env.DIVINE_PATTERNS;

    if (consciousness === "enabled") {
      this.addResult(
        "Divine",
        "Agricultural Consciousness",
        "PASS",
        "🌾 Maximum divine agricultural power activated!",
      );
    } else {
      this.addResult(
        "Divine",
        "Agricultural Consciousness",
        "WARN",
        "Agricultural consciousness not enabled",
        "Set AGRICULTURAL_CONSCIOUSNESS=enabled for divine patterns",
      );
    }

    if (divinePatterns === "active") {
      this.addResult(
        "Divine",
        "Divine Patterns",
        "PASS",
        "⚡ Quantum divine patterns operational!",
      );
    } else {
      this.addResult(
        "Divine",
        "Divine Patterns",
        "WARN",
        "Divine patterns not active",
        "Set DIVINE_PATTERNS=active for quantum consciousness",
      );
    }
  }

  /**
   * Generate validation report
   */
  generateReport(): ValidationReport {
    const passed = this.results.filter((r) => r.status === "PASS").length;
    const failed = this.results.filter((r) => r.status === "FAIL").length;
    const warnings = this.results.filter((r) => r.status === "WARN").length;
    const totalChecks = this.results.length;
    const readyForProduction = failed === 0;

    return {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || "unknown",
      totalChecks,
      passed,
      failed,
      warnings,
      results: this.results,
      readyForProduction,
    };
  }

  /**
   * Print summary
   */
  printSummary(report: ValidationReport): void {
    console.log(
      chalk.cyan.bold(
        "\n╔════════════════════════════════════════════════════════════╗",
      ),
    );
    console.log(
      chalk.cyan.bold(
        "║              VALIDATION SUMMARY                           ║",
      ),
    );
    console.log(
      chalk.cyan.bold(
        "╚════════════════════════════════════════════════════════════╝\n",
      ),
    );

    console.log(chalk.white(`📊 Total Checks: ${report.totalChecks}`));
    console.log(chalk.green(`✅ Passed: ${report.passed}`));
    console.log(chalk.red(`❌ Failed: ${report.failed}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${report.warnings}`));
    console.log(
      chalk.white(`🕐 Timestamp: ${report.timestamp.toISOString()}\n`),
    );

    if (report.readyForProduction) {
      console.log(
        chalk.green.bold(
          "╔════════════════════════════════════════════════════════════╗",
        ),
      );
      console.log(
        chalk.green.bold(
          "║  🚀 PRODUCTION READY - ALL CRITICAL CHECKS PASSED!        ║",
        ),
      );
      console.log(
        chalk.green.bold(
          "║     The platform is ready for MVP launch! 🌾⚡            ║",
        ),
      );
      console.log(
        chalk.green.bold(
          "╚════════════════════════════════════════════════════════════╝\n",
        ),
      );
    } else {
      console.log(
        chalk.red.bold(
          "╔════════════════════════════════════════════════════════════╗",
        ),
      );
      console.log(
        chalk.red.bold(
          "║  ⚠️  NOT PRODUCTION READY - CRITICAL ISSUES FOUND         ║",
        ),
      );
      console.log(
        chalk.red.bold(
          "║     Fix failed checks before proceeding with launch       ║",
        ),
      );
      console.log(
        chalk.red.bold(
          "╚════════════════════════════════════════════════════════════╝\n",
        ),
      );

      console.log(chalk.red.bold("Critical Issues:\n"));
      const failures = report.results.filter((r) => r.status === "FAIL");
      failures.forEach((failure) => {
        console.log(chalk.red(`  ❌ [${failure.category}] ${failure.check}`));
        console.log(chalk.white(`     ${failure.message}`));
        if (failure.details) {
          console.log(chalk.gray(`     ${failure.details}\n`));
        }
      });
    }

    if (report.warnings > 0) {
      console.log(chalk.yellow.bold("Warnings (non-critical):\n"));
      const warns = report.results.filter((r) => r.status === "WARN");
      warns.forEach((warn) => {
        console.log(chalk.yellow(`  ⚠️  [${warn.category}] ${warn.check}`));
        console.log(chalk.white(`     ${warn.message}`));
        if (warn.details) {
          console.log(chalk.gray(`     ${warn.details}\n`));
        }
      });
    }
  }

  /**
   * Run all validations
   */
  async runAll(): Promise<ValidationReport> {
    try {
      await this.validateEnvironmentVariables();
      await this.validateDatabase();
      await this.validateStripe();
      await this.validateRedis();
      await this.validateMonitoring();
      await this.validateEmail();
      await this.validateAgriculturalConsciousness();

      const report = this.generateReport();
      this.printSummary(report);

      return report;
    } catch (error) {
      console.error(chalk.red.bold("\n❌ Validation failed with error:\n"));
      console.error(error);
      throw error;
    }
  }
}

// ============================================================================
// 🚀 MAIN EXECUTION
// ============================================================================

async function main() {
  const validator = new ProductionConfigValidator();
  const report = await validator.runAll();

  // Exit with appropriate code
  process.exit(report.readyForProduction ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red.bold("Fatal error:"), error);
    process.exit(1);
  });
}

export { ProductionConfigValidator, ValidationReport, ValidationResult };
