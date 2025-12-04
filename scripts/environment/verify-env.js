#!/usr/bin/env node

/**
 * 🔍 DIVINE ENVIRONMENT VERIFICATION SCRIPT
 * Farmers Market Platform - Environment Variables Checker
 *
 * Validates all required environment variables before deployment
 * Ensures divine agricultural consciousness is properly configured
 */

const fs = require("fs");
const path = require("path");

// ANSI color codes for divine output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

// Divine header
console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🌾 DIVINE ENVIRONMENT VERIFICATION                           ║
║  Farmers Market Platform - Agricultural Consciousness Check   ║
╚════════════════════════════════════════════════════════════════╝
`);

// Environment to check
const environment = process.env.NODE_ENV || "development";
console.log(
  `${colors.cyan}🔍 Checking environment: ${colors.bright}${environment}${colors.reset}\n`,
);

// Required environment variables by category
const requiredVariables = {
  "Core Application": ["NODE_ENV", "NEXT_PUBLIC_APP_URL", "PORT"],
  Authentication: ["NEXTAUTH_URL", "NEXTAUTH_SECRET"],
  Database: ["DATABASE_URL"],
  "Payment Processing": [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ],
};

// Optional but recommended variables
const optionalVariables = {
  "Email Service": [
    "EMAIL_FROM",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASSWORD",
  ],
  Storage: [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "AWS_S3_BUCKET",
  ],
  Monitoring: [
    "SENTRY_DSN",
    "APPLICATIONINSIGHTS_CONNECTION_STRING",
    "OTEL_EXPORTER_OTLP_ENDPOINT",
  ],
  "OAuth Providers": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  Cache: ["REDIS_URL"],
};

// Production-only required variables
const productionOnlyVariables = [
  "NEXTAUTH_SECRET",
  "STRIPE_SECRET_KEY",
  "DATABASE_URL",
];

// Validation results
const missingRequired = [];
const missingOptional = [];
const warnings = [];
let validCount = 0;

// Check if .env file exists
const envFiles = [".env.local", ".env", ".env.production", ".env.development"];
const existingEnvFiles = envFiles.filter((file) =>
  fs.existsSync(path.join(process.cwd(), file)),
);

if (existingEnvFiles.length === 0) {
  console.log(`${colors.red}⚠️  No .env files found!${colors.reset}`);
  console.log(
    `${colors.yellow}💡 Create a .env.local file with your environment variables${colors.reset}\n`,
  );
} else {
  console.log(
    `${colors.green}✅ Found env files: ${existingEnvFiles.join(", ")}${colors.reset}\n`,
  );
}

// Validate required variables
console.log(
  `${colors.bright}${colors.magenta}📋 REQUIRED VARIABLES${colors.reset}\n`,
);

Object.entries(requiredVariables).forEach(([category, variables]) => {
  console.log(`${colors.cyan}${category}:${colors.reset}`);

  variables.forEach((varName) => {
    const value = process.env[varName];

    if (!value) {
      console.log(`  ${colors.red}❌ ${varName}${colors.reset} - MISSING`);
      missingRequired.push(varName);
    } else {
      // Mask sensitive values
      const isSensitive =
        varName.includes("SECRET") ||
        varName.includes("PASSWORD") ||
        varName.includes("KEY");
      const displayValue = isSensitive
        ? `***${value.slice(-4)}`
        : value.slice(0, 50);

      console.log(
        `  ${colors.green}✅ ${varName}${colors.reset} = ${displayValue}`,
      );
      validCount++;

      // Validate format
      if (varName === "DATABASE_URL" && !value.startsWith("postgresql://")) {
        warnings.push("DATABASE_URL should start with postgresql://");
      }

      if (varName === "NEXTAUTH_SECRET" && value.length < 32) {
        warnings.push("NEXTAUTH_SECRET should be at least 32 characters");
      }

      if (varName === "NEXT_PUBLIC_APP_URL" && !value.startsWith("http")) {
        warnings.push(
          "NEXT_PUBLIC_APP_URL should start with http:// or https://",
        );
      }
    }
  });

  console.log("");
});

// Validate optional variables
console.log(
  `${colors.bright}${colors.magenta}📋 OPTIONAL VARIABLES${colors.reset}\n`,
);

Object.entries(optionalVariables).forEach(([category, variables]) => {
  console.log(`${colors.cyan}${category}:${colors.reset}`);

  variables.forEach((varName) => {
    const value = process.env[varName];

    if (!value) {
      console.log(`  ${colors.yellow}⚠️  ${varName}${colors.reset} - Not set`);
      missingOptional.push(varName);
    } else {
      const isSensitive =
        varName.includes("SECRET") ||
        varName.includes("PASSWORD") ||
        varName.includes("KEY");
      const displayValue = isSensitive
        ? `***${value.slice(-4)}`
        : value.slice(0, 50);

      console.log(
        `  ${colors.green}✅ ${varName}${colors.reset} = ${displayValue}`,
      );
      validCount++;
    }
  });

  console.log("");
});

// Production-specific checks
if (environment === "production") {
  console.log(
    `${colors.bright}${colors.magenta}🔒 PRODUCTION SECURITY CHECKS${colors.reset}\n`,
  );

  productionOnlyVariables.forEach((varName) => {
    const value = process.env[varName];

    if (!value) {
      console.log(
        `  ${colors.red}❌ ${varName}${colors.reset} - CRITICAL: Required in production!`,
      );
      missingRequired.push(varName);
    } else if (value.includes("localhost") || value.includes("127.0.0.1")) {
      warnings.push(
        `${varName} contains localhost - should use production URL`,
      );
      console.log(
        `  ${colors.red}⚠️  ${varName}${colors.reset} - WARNING: Contains localhost!`,
      );
    } else if (
      varName === "NEXTAUTH_SECRET" &&
      value === "development-secret-change-me"
    ) {
      warnings.push(`${varName} is using default development value`);
      console.log(
        `  ${colors.red}⚠️  ${varName}${colors.reset} - WARNING: Using default value!`,
      );
    } else {
      console.log(
        `  ${colors.green}✅ ${varName}${colors.reset} - Production ready`,
      );
    }
  });

  console.log("");
}

// Agricultural consciousness check
console.log(
  `${colors.bright}${colors.magenta}🌾 AGRICULTURAL CONSCIOUSNESS CHECK${colors.reset}\n`,
);

const agriculturalVars = [
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_URL",
  "STRIPE_SECRET_KEY",
];

const consciousnessScore =
  (agriculturalVars.filter((v) => process.env[v]).length /
    agriculturalVars.length) *
  100;

if (consciousnessScore === 100) {
  console.log(
    `  ${colors.green}✅ Agricultural Consciousness: MAXIMUM (${consciousnessScore}%)${colors.reset}`,
  );
} else if (consciousnessScore >= 66) {
  console.log(
    `  ${colors.yellow}⚠️  Agricultural Consciousness: MODERATE (${consciousnessScore}%)${colors.reset}`,
  );
} else {
  console.log(
    `  ${colors.red}❌ Agricultural Consciousness: LOW (${consciousnessScore}%)${colors.reset}`,
  );
}

console.log("");

// Summary
console.log(`${colors.bright}${colors.magenta}📊 SUMMARY${colors.reset}\n`);
console.log(
  `  ${colors.green}✅ Valid variables: ${validCount}${colors.reset}`,
);
console.log(
  `  ${colors.red}❌ Missing required: ${missingRequired.length}${colors.reset}`,
);
console.log(
  `  ${colors.yellow}⚠️  Missing optional: ${missingOptional.length}${colors.reset}`,
);
console.log(
  `  ${colors.yellow}⚠️  Warnings: ${warnings.length}${colors.reset}`,
);
console.log("");

// Display warnings
if (warnings.length > 0) {
  console.log(`${colors.bright}${colors.yellow}⚠️  WARNINGS:${colors.reset}\n`);
  warnings.forEach((warning) => {
    console.log(`  ${colors.yellow}• ${warning}${colors.reset}`);
  });
  console.log("");
}

// Display missing required
if (missingRequired.length > 0) {
  console.log(
    `${colors.bright}${colors.red}❌ MISSING REQUIRED VARIABLES:${colors.reset}\n`,
  );
  missingRequired.forEach((varName) => {
    console.log(`  ${colors.red}• ${varName}${colors.reset}`);
  });
  console.log("");
  console.log(
    `${colors.yellow}💡 Add these variables to your .env.local file${colors.reset}\n`,
  );
}

// Display missing optional
if (missingOptional.length > 0 && environment === "production") {
  console.log(
    `${colors.bright}${colors.yellow}⚠️  MISSING OPTIONAL VARIABLES (Recommended for production):${colors.reset}\n`,
  );
  missingOptional.slice(0, 5).forEach((varName) => {
    console.log(`  ${colors.yellow}• ${varName}${colors.reset}`);
  });
  if (missingOptional.length > 5) {
    console.log(
      `  ${colors.yellow}• ... and ${missingOptional.length - 5} more${colors.reset}`,
    );
  }
  console.log("");
}

// Final status
console.log(`
╔════════════════════════════════════════════════════════════════╗`);

if (missingRequired.length === 0 && warnings.length === 0) {
  console.log(
    `║  ${colors.green}✅ ENVIRONMENT VERIFICATION PASSED${colors.reset}                          ║`,
  );
  console.log(
    `║  ${colors.green}🌾 Divine agricultural consciousness: ACTIVE${colors.reset}               ║`,
  );
  console.log(
    `║  ${colors.green}⚡ Ready for deployment!${colors.reset}                                   ║`,
  );
} else if (missingRequired.length === 0 && warnings.length > 0) {
  console.log(
    `║  ${colors.yellow}⚠️  ENVIRONMENT VERIFICATION PASSED WITH WARNINGS${colors.reset}          ║`,
  );
  console.log(
    `║  ${colors.yellow}🌾 Review warnings before deploying${colors.reset}                        ║`,
  );
} else {
  console.log(
    `║  ${colors.red}❌ ENVIRONMENT VERIFICATION FAILED${colors.reset}                           ║`,
  );
  console.log(
    `║  ${colors.red}🚫 Missing required variables - cannot deploy${colors.reset}               ║`,
  );
}

console.log(`╚════════════════════════════════════════════════════════════════╝
`);

// Exit with appropriate code
if (missingRequired.length > 0) {
  console.log(
    `${colors.red}${colors.bright}Exiting with error code 1${colors.reset}\n`,
  );
  process.exit(1);
} else if (warnings.length > 0 && environment === "production") {
  console.log(
    `${colors.yellow}${colors.bright}Warnings detected - review before production deployment${colors.reset}\n`,
  );
  // Still exit 0 for warnings (non-blocking)
  process.exit(0);
} else {
  console.log(
    `${colors.green}${colors.bright}All checks passed! 🎉${colors.reset}\n`,
  );
  process.exit(0);
}
