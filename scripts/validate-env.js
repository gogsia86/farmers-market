#!/usr/bin/env node
/**
 * ========================================
 * FARMERS MARKET PLATFORM - ENVIRONMENT VALIDATOR
 * Production Environment Variables Validation Script
 * ========================================
 */

const fs = require("fs");
const path = require("path");

// ANSI color codes
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

// Environment variables configuration
const requiredVars = [
  { name: "NODE_ENV", description: "Environment mode", example: "production" },
  {
    name: "NEXT_PUBLIC_APP_URL",
    description: "Application URL",
    example: "https://farmersmarket.com",
  },
  {
    name: "DATABASE_URL",
    description: "PostgreSQL connection string",
    example: "postgresql://user:pass@host:5432/db",
  },
  {
    name: "NEXTAUTH_SECRET",
    description: "NextAuth secret (32+ chars)",
    example: "generated-by-openssl-rand-base64-32",
    minLength: 32,
  },
  {
    name: "NEXTAUTH_URL",
    description: "NextAuth callback URL",
    example: "https://farmersmarket.com",
  },
];

const criticalVars = [
  {
    name: "STRIPE_SECRET_KEY",
    description: "Stripe secret key",
    example: "sk_live_xxxxx",
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    description: "Stripe publishable key",
    example: "pk_live_xxxxx",
  },
];

const importantVars = [
  {
    name: "RESEND_API_KEY",
    description: "Email service API key",
    example: "re_xxxxx",
  },
  {
    name: "AWS_ACCESS_KEY_ID",
    description: "AWS access key for S3",
    example: "AKIA_xxxxx",
  },
  {
    name: "AWS_SECRET_ACCESS_KEY",
    description: "AWS secret key",
    example: "secret_key_here",
  },
  {
    name: "AWS_S3_BUCKET",
    description: "S3 bucket name",
    example: "farmersmarket-uploads",
  },
  {
    name: "REDIS_URL",
    description: "Redis connection string",
    example: "redis://localhost:6379",
  },
];

const optionalVars = [
  {
    name: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    description: "Google Maps API key",
    example: "AIzaSy_xxxxx",
  },
  {
    name: "SENTRY_DSN",
    description: "Sentry error tracking DSN",
    example: "https://xxxxx@xxxxx.ingest.sentry.io/xxxxx",
  },
  {
    name: "OPENAI_API_KEY",
    description: "OpenAI API key",
    example: "sk-xxxxx",
  },
  {
    name: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    description: "Google Analytics ID",
    example: "G-XXXXXXXXXX",
  },
];

const errors = [];
const warnings = [];
const info = [];

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${"=".repeat(60)}`, colors.cyan);
  log(`  ${title}`, colors.bright + colors.cyan);
  log("=".repeat(60), colors.cyan);
}

function validateVariable(varName, description, options = {}) {
  const value = process.env[varName];

  if (!value) {
    return { valid: false, missing: true };
  }

  // Check minimum length
  if (options.minLength && value.length < options.minLength) {
    return {
      valid: false,
      missing: false,
      error: `too short (${value.length} chars, minimum ${options.minLength} required)`,
    };
  }

  // Check format patterns
  if (options.pattern && !options.pattern.test(value)) {
    return {
      valid: false,
      missing: false,
      error: "invalid format",
    };
  }

  return { valid: true };
}

function checkVariableGroup(title, variables, severity = "required") {
  logSection(title);

  let groupErrors = 0;
  let groupWarnings = 0;
  let groupOk = 0;

  variables.forEach(({ name, description, example, minLength, pattern }) => {
    const result = validateVariable(name, description, { minLength, pattern });

    if (result.valid) {
      log(`  ✅ ${name}`, colors.green);
      log(`     ${description}`, colors.reset);
      groupOk++;
    } else if (result.missing) {
      if (severity === "required" || severity === "critical") {
        log(`  ❌ ${name}`, colors.red);
        log(`     ${description}`, colors.reset);
        log(
          `     MISSING - Required for ${severity === "critical" ? "critical features" : "production"}`,
          colors.red,
        );
        if (example) {
          log(`     Example: ${example}`, colors.yellow);
        }
        errors.push(`Missing ${severity} variable: ${name}`);
        groupErrors++;
      } else if (severity === "important") {
        log(`  ⚠️  ${name}`, colors.yellow);
        log(`     ${description}`, colors.reset);
        log(`     MISSING - Important for production features`, colors.yellow);
        if (example) {
          log(`     Example: ${example}`, colors.yellow);
        }
        warnings.push(`Missing important variable: ${name}`);
        groupWarnings++;
      } else {
        log(`  ℹ️  ${name}`, colors.blue);
        log(`     ${description}`, colors.reset);
        log(`     NOT SET - Optional feature`, colors.blue);
        if (example) {
          log(`     Example: ${example}`, colors.blue);
        }
        info.push(`Optional variable not set: ${name}`);
      }
    } else if (result.error) {
      log(`  ❌ ${name}`, colors.red);
      log(`     ${description}`, colors.reset);
      log(`     INVALID - ${result.error}`, colors.red);
      errors.push(`Invalid ${name}: ${result.error}`);
      groupErrors++;
    }
  });

  log(
    `\n  Summary: ${groupOk} OK, ${groupErrors} Errors, ${groupWarnings} Warnings`,
    groupErrors > 0
      ? colors.red
      : groupWarnings > 0
        ? colors.yellow
        : colors.green,
  );

  return { errors: groupErrors, warnings: groupWarnings, ok: groupOk };
}

function validateDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return;

  logSection("DATABASE CONNECTION VALIDATION");

  // Check if it's PostgreSQL
  if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
    log(
      "  ⚠️  DATABASE_URL should start with postgresql:// or postgres://",
      colors.yellow,
    );
    warnings.push("DATABASE_URL might not be a PostgreSQL connection string");
  } else {
    log("  ✅ PostgreSQL connection string format", colors.green);
  }

  // Check for SSL parameters
  if (!dbUrl.includes("sslmode") && !dbUrl.includes("ssl=")) {
    log("  ⚠️  Consider adding SSL parameters for production", colors.yellow);
    log("     Example: ?sslmode=require or ?ssl=true", colors.blue);
    info.push("DATABASE_URL does not specify SSL mode");
  } else {
    log("  ✅ SSL parameters detected", colors.green);
  }

  // Check for connection pooling parameters
  if (!dbUrl.includes("connection_limit")) {
    log("  ℹ️  Consider adding connection_limit parameter", colors.blue);
    log("     Example: ?connection_limit=20", colors.blue);
    info.push("DATABASE_URL does not specify connection_limit");
  } else {
    log("  ✅ Connection pooling configured", colors.green);
  }
}

function checkEnvFile() {
  logSection("ENVIRONMENT FILE CHECK");

  const envFiles = [
    { path: ".env.production", required: true },
    { path: ".env.local", required: false },
    { path: ".env", required: false },
  ];

  envFiles.forEach(({ path: filePath, required }) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      log(`  ✅ ${filePath} exists`, colors.green);
    } else if (required) {
      log(`  ❌ ${filePath} not found`, colors.red);
      errors.push(`Missing required file: ${filePath}`);
    } else {
      log(`  ℹ️  ${filePath} not found (optional)`, colors.blue);
    }
  });

  // Check .gitignore
  const gitignorePath = path.join(process.cwd(), ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    if (
      gitignoreContent.includes(".env.production") ||
      gitignoreContent.includes(".env*.local")
    ) {
      log(`  ✅ Environment files are gitignored`, colors.green);
    } else {
      log(`  ⚠️  .env.production should be in .gitignore`, colors.yellow);
      warnings.push("Sensitive files might not be gitignored");
    }
  }
}

function generateSecretCommands() {
  logSection("SECRET GENERATION COMMANDS");

  log(
    "\n  If you need to generate secrets, use these commands:\n",
    colors.cyan,
  );

  log("  # Generate NEXTAUTH_SECRET (32+ characters)", colors.bright);
  log("  openssl rand -base64 32\n", colors.yellow);

  log("  # Generate strong database password", colors.bright);
  log("  openssl rand -base64 24\n", colors.yellow);

  log("  # Generate Redis password", colors.bright);
  log("  openssl rand -base64 32\n", colors.yellow);

  log("  # Generate API token", colors.bright);
  log("  openssl rand -hex 32\n", colors.yellow);
}

function printSummary() {
  logSection("VALIDATION SUMMARY");

  const totalIssues = errors.length + warnings.length;
  const totalChecks = errors.length + warnings.length + info.length;

  log(`\n  Total Checks: ${totalChecks}`, colors.bright);
  log(`  ✅ Passed: ${totalChecks - totalIssues}`, colors.green);
  log(
    `  ❌ Errors: ${errors.length}`,
    errors.length > 0 ? colors.red : colors.green,
  );
  log(
    `  ⚠️  Warnings: ${warnings.length}`,
    warnings.length > 0 ? colors.yellow : colors.green,
  );
  log(`  ℹ️  Info: ${info.length}`, colors.blue);

  if (errors.length > 0) {
    log("\n  🚨 CRITICAL ERRORS:", colors.red + colors.bright);
    errors.forEach((error, i) => {
      log(`     ${i + 1}. ${error}`, colors.red);
    });
  }

  if (warnings.length > 0) {
    log("\n  ⚠️  WARNINGS:", colors.yellow + colors.bright);
    warnings.forEach((warning, i) => {
      log(`     ${i + 1}. ${warning}`, colors.yellow);
    });
  }

  log("\n" + "=".repeat(60), colors.cyan);

  if (errors.length === 0 && warnings.length === 0) {
    log(
      "\n  🎉 PERFECT! All environment variables are properly configured!",
      colors.green + colors.bright,
    );
    log(
      "  🚀 Your application is ready for production deployment!\n",
      colors.green,
    );
    return true;
  } else if (errors.length === 0) {
    log(
      "\n  ✅ GOOD! All required variables are set.",
      colors.green + colors.bright,
    );
    log(
      `  ⚠️  ${warnings.length} warning(s) should be addressed for production.`,
      colors.yellow,
    );
    log(
      "  🚀 You can proceed with deployment, but consider fixing warnings.\n",
      colors.yellow,
    );
    return true;
  } else {
    log(
      "\n  ❌ FAILED! Please fix all errors before deploying to production.",
      colors.red + colors.bright,
    );
    log(`  📋 ${errors.length} error(s) must be fixed.\n`, colors.red);
    return false;
  }
}

function printRecommendations() {
  logSection("RECOMMENDATIONS");

  const recommendations = [
    "1. Store all secrets in a secure password manager",
    "2. Never commit .env.production to version control",
    "3. Use different secrets for development and production",
    "4. Rotate secrets regularly (every 90 days)",
    "5. Enable SSL/TLS for all external connections",
    "6. Set up monitoring and alerting for production",
    "7. Keep backup of environment variables in secure location",
    "8. Use environment-specific values (no hardcoded URLs)",
  ];

  recommendations.forEach((rec) => {
    log(`  ${rec}`, colors.cyan);
  });
}

// Main execution
function main() {
  log("\n" + "═".repeat(60), colors.magenta + colors.bright);
  log(
    "  🌾 FARMERS MARKET PLATFORM - ENVIRONMENT VALIDATOR",
    colors.magenta + colors.bright,
  );
  log("  Production Environment Configuration Check", colors.magenta);
  log("═".repeat(60) + "\n", colors.magenta + colors.bright);

  // Check for environment files
  checkEnvFile();

  // Validate required variables
  checkVariableGroup(
    "REQUIRED ENVIRONMENT VARIABLES",
    requiredVars,
    "required",
  );

  // Validate critical variables (payment, etc.)
  checkVariableGroup(
    "CRITICAL FEATURES (Payment, etc.)",
    criticalVars,
    "critical",
  );

  // Validate important variables
  checkVariableGroup(
    "IMPORTANT FEATURES (Email, Storage, Cache)",
    importantVars,
    "important",
  );

  // Validate optional variables
  checkVariableGroup(
    "OPTIONAL FEATURES (Maps, Analytics, AI)",
    optionalVars,
    "optional",
  );

  // Validate database URL specifically
  validateDatabaseUrl();

  // Show secret generation commands if needed
  if (
    errors.some((e) => e.includes("NEXTAUTH_SECRET") || e.includes("password"))
  ) {
    generateSecretCommands();
  }

  // Print summary
  const success = printSummary();

  // Print recommendations
  if (success) {
    printRecommendations();
  }

  // Exit with appropriate code
  process.exit(errors.length > 0 ? 1 : 0);
}

// Run validator
main();
