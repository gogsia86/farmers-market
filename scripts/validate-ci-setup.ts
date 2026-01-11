#!/usr/bin/env tsx

/**
 * CI/CD Setup Validation Script
 *
 * Validates that all prerequisites are met before enabling the GitHub Actions workflow.
 * This script checks:
 * - GitHub Actions configuration
 * - Required secrets
 * - Database connectivity
 * - Application configuration
 * - Workflow file syntax
 * - Test environment setup
 *
 * Usage:
 *   npm run validate:ci
 *   tsx scripts/validate-ci-setup.ts
 *   tsx scripts/validate-ci-setup.ts --fix  # Attempt to fix issues
 */

import { exec } from "child_process";
import fs from "fs/promises";
import { promisify } from "util";

const execAsync = promisify(exec);

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ValidationResult {
  category: string;
  check: string;
  status: "PASS" | "FAIL" | "WARN" | "SKIP";
  message: string;
  details?: string;
  fixable?: boolean;
  fix?: () => Promise<void>;
}

interface ValidationReport {
  timestamp: string;
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
  };
  recommendations: string[];
}

// ============================================================================
// Configuration
// ============================================================================

const REQUIRED_SECRETS = [
  "TEST_DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

const OPTIONAL_SECRETS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
] as const;

const WORKFLOW_FILE = ".github/workflows/ubf-tests.yml";

const REQUIRED_NPM_SCRIPTS = [
  "bot",
  "bot:test",
  "bot:test:critical",
  "bot:test:all",
  "bot:list",
] as const;

const REQUIRED_DEPENDENCIES = [
  "@playwright/test",
  "playwright",
  "next",
  "prisma",
  "@prisma/client",
] as const;

// ============================================================================
// Utilities
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatStatus(status: ValidationResult["status"]): string {
  switch (status) {
    case "PASS":
      return colorize("✅ PASS", "green");
    case "FAIL":
      return colorize("❌ FAIL", "red");
    case "WARN":
      return colorize("⚠️  WARN", "yellow");
    case "SKIP":
      return colorize("⏭️  SKIP", "blue");
  }
}

async function commandExists(command: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      process.platform === "win32" ? `where ${command}` : `which ${command}`,
    );
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

// ============================================================================
// Validation Checks
// ============================================================================

class CIValidator {
  private results: ValidationResult[] = [];
  private shouldFix: boolean = false;

  constructor(shouldFix: boolean = false) {
    this.shouldFix = shouldFix;
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);
  }

  // --------------------------------------------------------------------------
  // System Prerequisites
  // --------------------------------------------------------------------------

  async validateNodeVersion(): Promise<void> {
    const category = "System Prerequisites";
    const check = "Node.js Version";

    try {
      const { stdout } = await execAsync("node --version");
      const version = stdout.trim().replace("v", "");
      const [major] = version.split(".").map(Number);

      if (major >= 18) {
        this.addResult({
          category,
          check,
          status: "PASS",
          message: `Node.js ${version} (>= 18.0.0 required)`,
        });
      } else {
        this.addResult({
          category,
          check,
          status: "FAIL",
          message: `Node.js ${version} found, but >= 18.0.0 required`,
          details: "Update Node.js to version 18 or higher",
        });
      }
    } catch (error) {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: "Node.js not found",
        details: "Install Node.js from https://nodejs.org/",
      });
    }
  }

  async validateNpmVersion(): Promise<void> {
    const category = "System Prerequisites";
    const check = "npm Version";

    try {
      const { stdout } = await execAsync("npm --version");
      const version = stdout.trim();
      const [major] = version.split(".").map(Number);

      if (major >= 10) {
        this.addResult({
          category,
          check,
          status: "PASS",
          message: `npm ${version} (>= 10.0.0 required)`,
        });
      } else {
        this.addResult({
          category,
          check,
          status: "WARN",
          message: `npm ${version} found, recommend >= 10.0.0`,
          details: "Run: npm install -g npm@latest",
        });
      }
    } catch (error) {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: "npm not found",
      });
    }
  }

  async validateGitHubCLI(): Promise<void> {
    const category = "System Prerequisites";
    const check = "GitHub CLI";

    const hasGh = await commandExists("gh");

    if (hasGh) {
      try {
        const { stdout } = await execAsync("gh --version");
        const version = stdout.split("\n")[0].replace("gh version ", "");

        this.addResult({
          category,
          check,
          status: "PASS",
          message: `GitHub CLI ${version} installed`,
        });
      } catch {
        this.addResult({
          category,
          check,
          status: "PASS",
          message: "GitHub CLI installed",
        });
      }
    } else {
      this.addResult({
        category,
        check,
        status: "WARN",
        message: "GitHub CLI not installed (optional but recommended)",
        details: "Install from https://cli.github.com/",
      });
    }
  }

  async validatePlaywright(): Promise<void> {
    const category = "System Prerequisites";
    const check = "Playwright";

    try {
      const { stdout } = await execAsync("npx playwright --version");
      const version = stdout.trim().replace("Version ", "");

      this.addResult({
        category,
        check,
        status: "PASS",
        message: `Playwright ${version} installed`,
      });

      // Check if browsers are installed
      try {
        await execAsync("npx playwright install --dry-run chromium");
        this.addResult({
          category,
          check: "Playwright Browsers",
          status: "PASS",
          message: "Chromium browser installed",
        });
      } catch {
        this.addResult({
          category,
          check: "Playwright Browsers",
          status: "WARN",
          message: "Chromium browser not installed",
          details: "Run: npx playwright install --with-deps chromium",
          fixable: true,
          fix: async () => {
            await execAsync("npx playwright install --with-deps chromium");
          },
        });
      }
    } catch (error) {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: "Playwright not installed",
        details: "Run: npm install @playwright/test",
      });
    }
  }

  // --------------------------------------------------------------------------
  // GitHub Configuration
  // --------------------------------------------------------------------------

  async validateWorkflowFile(): Promise<void> {
    const category = "GitHub Configuration";
    const check = "Workflow File";

    const exists = await fileExists(WORKFLOW_FILE);

    if (!exists) {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: `Workflow file not found: ${WORKFLOW_FILE}`,
        details:
          "The UBF workflow file is missing. It should have been created in Phase 4.",
      });
      return;
    }

    try {
      const content = await fs.readFile(WORKFLOW_FILE, "utf-8");

      // Basic YAML syntax check
      if (
        !content.includes("name:") ||
        !content.includes("on:") ||
        !content.includes("jobs:")
      ) {
        this.addResult({
          category,
          check,
          status: "FAIL",
          message: "Workflow file has invalid structure",
          details:
            "The workflow file is missing required keys (name, on, jobs)",
        });
        return;
      }

      // Check for required jobs
      const requiredJobs = ["critical-tests", "matrix-tests"];
      const missingJobs = requiredJobs.filter(
        (job) => !content.includes(`${job}:`),
      );

      if (missingJobs.length > 0) {
        this.addResult({
          category,
          check,
          status: "WARN",
          message: `Workflow missing recommended jobs: ${missingJobs.join(", ")}`,
        });
      } else {
        this.addResult({
          category,
          check,
          status: "PASS",
          message: "Workflow file is valid",
        });
      }
    } catch (error) {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: "Failed to read workflow file",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async validateGitHubActionsEnabled(): Promise<void> {
    const category = "GitHub Configuration";
    const check = "GitHub Actions Status";

    const hasGh = await commandExists("gh");

    if (!hasGh) {
      this.addResult({
        category,
        check,
        status: "SKIP",
        message: "GitHub CLI not available to check Actions status",
        details: "Install GitHub CLI to verify Actions are enabled",
      });
      return;
    }

    try {
      const { stdout } = await execAsync(
        "gh repo view --json hasIssuesEnabled",
      );
      // Note: There's no direct API to check if Actions are enabled
      // This is a best-effort check
      this.addResult({
        category,
        check,
        status: "PASS",
        message: "Repository is accessible via GitHub CLI",
        details: "Verify Actions are enabled in: Settings → Actions → General",
      });
    } catch {
      this.addResult({
        category,
        check,
        status: "WARN",
        message: "Cannot verify GitHub Actions status",
        details: "Check manually: Settings → Actions → General",
      });
    }
  }

  async validateSecrets(): Promise<void> {
    const category = "GitHub Configuration";
    const check = "Repository Secrets";

    const hasGh = await commandExists("gh");

    if (!hasGh) {
      this.addResult({
        category,
        check,
        status: "SKIP",
        message: "GitHub CLI not available to check secrets",
        details: "Install GitHub CLI and run: gh secret list",
      });
      return;
    }

    try {
      const { stdout } = await execAsync("gh secret list");
      const secretNames = stdout
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.split("\t")[0]);

      const missingRequired = REQUIRED_SECRETS.filter(
        (secret) => !secretNames.includes(secret),
      );
      const missingOptional = OPTIONAL_SECRETS.filter(
        (secret) => !secretNames.includes(secret),
      );

      if (missingRequired.length === 0) {
        this.addResult({
          category,
          check,
          status: "PASS",
          message: `All required secrets configured (${secretNames.length} total)`,
        });
      } else {
        this.addResult({
          category,
          check,
          status: "FAIL",
          message: `Missing required secrets: ${missingRequired.join(", ")}`,
          details: "Add secrets via: gh secret set <NAME> --body <VALUE>",
        });
      }

      if (missingOptional.length > 0) {
        this.addResult({
          category,
          check: "Optional Secrets",
          status: "WARN",
          message: `Optional secrets not configured: ${missingOptional.join(", ")}`,
          details: "These are only needed for specific test suites",
        });
      }
    } catch (error) {
      this.addResult({
        category,
        check,
        status: "WARN",
        message: "Cannot verify secrets (might not be authenticated)",
        details: "Run: gh auth login, then gh secret list",
      });
    }
  }

  // --------------------------------------------------------------------------
  // Application Configuration
  // --------------------------------------------------------------------------

  async validatePackageJson(): Promise<void> {
    const category = "Application Configuration";
    const check = "package.json";

    const packageJson = await readJsonFile<any>("package.json");

    if (!packageJson) {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: "package.json not found",
      });
      return;
    }

    // Check for required scripts
    const scripts = packageJson.scripts || {};
    const missingScripts = REQUIRED_NPM_SCRIPTS.filter(
      (script) => !(script in scripts),
    );

    if (missingScripts.length === 0) {
      this.addResult({
        category,
        check: "NPM Scripts",
        status: "PASS",
        message: "All required npm scripts are configured",
      });
    } else {
      this.addResult({
        category,
        check: "NPM Scripts",
        status: "FAIL",
        message: `Missing required scripts: ${missingScripts.join(", ")}`,
        details: "The UBF CLI scripts are not properly configured",
      });
    }

    // Check for required dependencies
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    const missingDeps = REQUIRED_DEPENDENCIES.filter(
      (dep) => !(dep in allDeps),
    );

    if (missingDeps.length === 0) {
      this.addResult({
        category,
        check: "Dependencies",
        status: "PASS",
        message: "All required dependencies are installed",
      });
    } else {
      this.addResult({
        category,
        check: "Dependencies",
        status: "FAIL",
        message: `Missing dependencies: ${missingDeps.join(", ")}`,
        details: "Run: npm install",
      });
    }
  }

  async validatePrismaSetup(): Promise<void> {
    const category = "Application Configuration";
    const check = "Prisma Configuration";

    const schemaExists = await fileExists("prisma/schema.prisma");

    if (!schemaExists) {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: "Prisma schema file not found",
      });
      return;
    }

    try {
      // Check if Prisma client is generated
      const clientExists = await fileExists("node_modules/.prisma/client");

      if (clientExists) {
        this.addResult({
          category,
          check,
          status: "PASS",
          message: "Prisma client is generated",
        });
      } else {
        this.addResult({
          category,
          check,
          status: "WARN",
          message: "Prisma client not generated",
          details: "Run: npx prisma generate",
          fixable: true,
          fix: async () => {
            await execAsync("npx prisma generate");
          },
        });
      }
    } catch (error) {
      this.addResult({
        category,
        check,
        status: "WARN",
        message: "Cannot verify Prisma client",
      });
    }
  }

  async validateTestEnvironment(): Promise<void> {
    const category = "Application Configuration";
    const check = "Test Environment";

    // Check if .env or .env.local exists
    const envExists = await fileExists(".env");
    const envLocalExists = await fileExists(".env.local");

    if (!envExists && !envLocalExists) {
      this.addResult({
        category,
        check,
        status: "WARN",
        message: "No .env file found",
        details: "Create .env.local with required environment variables",
      });
    } else {
      this.addResult({
        category,
        check,
        status: "PASS",
        message: "Environment file exists",
      });
    }
  }

  // --------------------------------------------------------------------------
  // Database Configuration
  // --------------------------------------------------------------------------

  async validateDatabaseConnection(): Promise<void> {
    const category = "Database Configuration";
    const check = "Database Connection";

    // We can't directly test DB connection without credentials
    // But we can check if the DATABASE_URL env var format is valid
    this.addResult({
      category,
      check,
      status: "SKIP",
      message: "Database connection cannot be validated without credentials",
      details:
        "Ensure TEST_DATABASE_URL secret is set in GitHub and points to a valid PostgreSQL database",
    });
  }

  // --------------------------------------------------------------------------
  // Test Framework
  // --------------------------------------------------------------------------

  async validateUBFFramework(): Promise<void> {
    const category = "Test Framework";
    const check = "UBF Installation";

    const cliExists = await fileExists("src/lib/testing/cli/index.ts");
    const engineExists = await fileExists("src/lib/testing/core/bot-engine.ts");
    const runnerExists = await fileExists(
      "src/lib/testing/core/test-runner.ts",
    );

    if (cliExists && engineExists && runnerExists) {
      this.addResult({
        category,
        check,
        status: "PASS",
        message: "UBF framework is installed",
      });
    } else {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: "UBF framework components are missing",
        details:
          "Core UBF files not found. The framework may not be properly installed.",
      });
    }
  }

  async validateTestModules(): Promise<void> {
    const category = "Test Framework";
    const check = "Test Modules";

    const modulesDir = "src/lib/testing/modules";
    const modulesExist = await fileExists(modulesDir);

    if (!modulesExist) {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: "Test modules directory not found",
      });
      return;
    }

    try {
      const files = await fs.readdir(modulesDir);
      const modules = files.filter((f) => f.endsWith(".module.ts"));

      if (modules.length > 0) {
        this.addResult({
          category,
          check,
          status: "PASS",
          message: `Found ${modules.length} test modules`,
          details: modules.join(", "),
        });
      } else {
        this.addResult({
          category,
          check,
          status: "WARN",
          message: "No test modules found",
          details: "Create test modules in src/lib/testing/modules/",
        });
      }
    } catch (error) {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: "Cannot read test modules directory",
      });
    }
  }

  async validateCLI(): Promise<void> {
    const category = "Test Framework";
    const check = "CLI Functionality";

    try {
      const { stdout } = await execAsync("npm run bot -- --help", {
        timeout: 10000,
      });

      if (stdout.includes("UBF CLI") || stdout.includes("Usage:")) {
        this.addResult({
          category,
          check,
          status: "PASS",
          message: "CLI is functional",
        });
      } else {
        this.addResult({
          category,
          check,
          status: "WARN",
          message: "CLI runs but output is unexpected",
        });
      }
    } catch (error) {
      this.addResult({
        category,
        check,
        status: "FAIL",
        message: "CLI failed to execute",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // --------------------------------------------------------------------------
  // Run All Validations
  // --------------------------------------------------------------------------

  async runAll(): Promise<ValidationReport> {
    console.log(colorize("\n🔍 CI/CD Setup Validation\n", "cyan"));
    console.log("Running comprehensive checks...\n");

    // System Prerequisites
    await this.validateNodeVersion();
    await this.validateNpmVersion();
    await this.validateGitHubCLI();
    await this.validatePlaywright();

    // GitHub Configuration
    await this.validateWorkflowFile();
    await this.validateGitHubActionsEnabled();
    await this.validateSecrets();

    // Application Configuration
    await this.validatePackageJson();
    await this.validatePrismaSetup();
    await this.validateTestEnvironment();

    // Database Configuration
    await this.validateDatabaseConnection();

    // Test Framework
    await this.validateUBFFramework();
    await this.validateTestModules();
    await this.validateCLI();

    // Generate report
    return this.generateReport();
  }

  // --------------------------------------------------------------------------
  // Report Generation
  // --------------------------------------------------------------------------

  private generateReport(): ValidationReport {
    const summary = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "PASS").length,
      failed: this.results.filter((r) => r.status === "FAIL").length,
      warnings: this.results.filter((r) => r.status === "WARN").length,
      skipped: this.results.filter((r) => r.status === "SKIP").length,
    };

    const recommendations: string[] = [];

    // Group results by category
    const categories = [...new Set(this.results.map((r) => r.category))];

    console.log(colorize("━".repeat(80), "blue"));
    console.log(colorize("Validation Results", "bright"));
    console.log(colorize("━".repeat(80), "blue"));
    console.log();

    for (const category of categories) {
      console.log(colorize(`\n${category}`, "bright"));
      console.log(colorize("─".repeat(80), "blue"));

      const categoryResults = this.results.filter(
        (r) => r.category === category,
      );

      for (const result of categoryResults) {
        console.log(`${formatStatus(result.status)} ${result.check}`);
        console.log(`   ${result.message}`);

        if (result.details) {
          console.log(colorize(`   → ${result.details}`, "blue"));
        }

        if (result.status === "FAIL" || result.status === "WARN") {
          recommendations.push(
            `[${result.status}] ${result.check}: ${result.message}`,
          );
        }

        console.log();
      }
    }

    // Summary
    console.log(colorize("━".repeat(80), "blue"));
    console.log(colorize("Summary", "bright"));
    console.log(colorize("━".repeat(80), "blue"));
    console.log();
    console.log(`Total Checks:  ${summary.total}`);
    console.log(colorize(`✅ Passed:     ${summary.passed}`, "green"));
    console.log(
      colorize(
        `❌ Failed:     ${summary.failed}`,
        summary.failed > 0 ? "red" : "green",
      ),
    );
    console.log(
      colorize(
        `⚠️  Warnings:   ${summary.warnings}`,
        summary.warnings > 0 ? "yellow" : "green",
      ),
    );
    console.log(colorize(`⏭️  Skipped:    ${summary.skipped}`, "blue"));
    console.log();

    // Overall status
    if (summary.failed === 0) {
      console.log(colorize("✅ CI/CD Setup: READY", "green"));
    } else {
      console.log(colorize("❌ CI/CD Setup: NOT READY", "red"));
      console.log(
        colorize(
          `   Fix ${summary.failed} failed check(s) before enabling workflow`,
          "red",
        ),
      );
    }

    console.log();

    // Recommendations
    if (recommendations.length > 0) {
      console.log(colorize("━".repeat(80), "blue"));
      console.log(colorize("Recommendations", "bright"));
      console.log(colorize("━".repeat(80), "blue"));
      console.log();

      for (const rec of recommendations) {
        console.log(`• ${rec}`);
      }

      console.log();
    }

    return {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary,
      recommendations,
    };
  }

  // --------------------------------------------------------------------------
  // Auto-fix
  // --------------------------------------------------------------------------

  async autoFix(): Promise<void> {
    console.log(colorize("\n🔧 Auto-Fix Mode\n", "cyan"));

    const fixableResults = this.results.filter((r) => r.fixable && r.fix);

    if (fixableResults.length === 0) {
      console.log("No auto-fixable issues found.");
      return;
    }

    console.log(`Found ${fixableResults.length} fixable issue(s):\n`);

    for (const result of fixableResults) {
      console.log(`${formatStatus(result.status)} ${result.check}`);
      console.log(`   ${result.message}`);
      console.log(colorize("   → Attempting fix...", "yellow"));

      try {
        if (result.fix) {
          await result.fix();
          console.log(colorize("   ✅ Fixed!", "green"));
        }
      } catch (error) {
        console.log(colorize("   ❌ Fix failed", "red"));
        console.log(
          `   ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      console.log();
    }
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes("--fix");
  const outputJson = args.includes("--json");

  const validator = new CIValidator(shouldFix);

  // Run all validations
  const report = await validator.runAll();

  // Auto-fix if requested
  if (shouldFix) {
    await validator.autoFix();
  }

  // Output JSON if requested
  if (outputJson) {
    const outputPath = "ci-validation-report.json";
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(colorize(`\n📄 Report saved to: ${outputPath}`, "cyan"));
  }

  // Exit with appropriate code
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(colorize("\n❌ Fatal Error:", "red"), error);
    process.exit(1);
  });
}

export { CIValidator, ValidationReport, ValidationResult };
