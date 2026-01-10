#!/usr/bin/env node

/**
 * 🚀 Vercel Pre-Flight Check
 * Comprehensive deployment validation for Farmers Market Platform
 *
 * Validates:
 * - package.json integrity
 * - Dependencies (no empty versions)
 * - Environment variables
 * - Database configuration
 * - Node/npm compatibility
 * - Clean dependency installation
 *
 * Usage:
 *   node scripts/vercel-preflight.js
 *   npm run vercel:preflight
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Helper functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset}  ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) =>
    console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n`),
};

let hasWarnings = false;
let hasErrors = false;

// Start pre-flight checks
log.header("🔍 Vercel Pre-Flight Checks - Farmers Market Platform");

// ============================================================================
// 1. Node.js Version Check
// ============================================================================
log.info("Checking Node.js version...");
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.split(".")[0].substring(1));

if (nodeMajor < 18) {
  log.error(`Node.js ${nodeVersion} is too old. Minimum required: 18.x`);
  hasErrors = true;
} else if (nodeMajor >= 18 && nodeMajor <= 22) {
  log.success(`Node.js ${nodeVersion} is supported`);
} else if (nodeMajor > 22) {
  log.warning(`Node.js ${nodeVersion} is newer than tested version (22.x)`);
  hasWarnings = true;
} else {
  log.success(`Node.js ${nodeVersion} is compatible`);
}

// ============================================================================
// 2. Package.json Validation
// ============================================================================
log.info("Validating package.json...");

let packageJson;
try {
  const packagePath = path.join(process.cwd(), "package.json");
  const packageContent = fs.readFileSync(packagePath, "utf8");
  packageJson = JSON.parse(packageContent);
  log.success("package.json is valid JSON");
} catch (error) {
  log.error(`Failed to read/parse package.json: ${error.message}`);
  process.exit(1);
}

// Check required fields
const requiredFields = ["name", "version", "scripts"];
for (const field of requiredFields) {
  if (!packageJson[field]) {
    log.error(`Missing required field in package.json: ${field}`);
    hasErrors = true;
  }
}

// Check for build script
if (!packageJson.scripts || !packageJson.scripts.build) {
  log.error('Missing "build" script in package.json');
  hasErrors = true;
} else {
  log.success("Build script found");
}

// ============================================================================
// 3. Dependency Validation
// ============================================================================
log.info("Checking dependencies...");

let totalDeps = 0;
let emptyDeps = 0;

["dependencies", "devDependencies", "peerDependencies"].forEach((depType) => {
  const deps = packageJson[depType];
  if (!deps) return;

  Object.entries(deps).forEach(([name, version]) => {
    totalDeps++;

    // Check for empty versions
    if (!version || version.trim() === "") {
      log.error(`${depType}: '${name}' has empty version`);
      emptyDeps++;
      hasErrors = true;
    }

    // Check for suspicious versions
    if (version === "*" || version === "latest") {
      log.warning(`${depType}: '${name}' uses unpinned version '${version}'`);
      hasWarnings = true;
    }

    // Check for workspace protocol (monorepo)
    if (version.startsWith("workspace:")) {
      log.warning(`${depType}: '${name}' uses workspace protocol`);
      hasWarnings = true;
    }
  });
});

log.success(`Validated ${totalDeps} dependencies`);

if (emptyDeps > 0) {
  log.error(`Found ${emptyDeps} dependencies with empty versions`);
  hasErrors = true;
}

// ============================================================================
// 4. Environment Variables Check
// ============================================================================
log.info("Checking environment configuration...");

// Check for .env files
const envFiles = [".env", ".env.local", ".env.production", ".env.vercel.local"];

let foundEnvFile = false;
envFiles.forEach((file) => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    log.success(`Found ${file}`);
    foundEnvFile = true;
  }
});

if (!foundEnvFile) {
  log.warning(
    "No .env files found locally (expected for Vercel - uses env vars)",
  );
}

// Critical environment variables for production
const criticalEnvVars = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
];

const missingVars = [];
criticalEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  log.warning(
    `Missing environment variables (should be set in Vercel): ${missingVars.join(", ")}`,
  );
  log.info("Ensure these are configured in Vercel dashboard");
} else {
  log.success("All critical environment variables are set");
}

// ============================================================================
// 5. Prisma Schema Check
// ============================================================================
log.info("Checking Prisma configuration...");

const prismaSchemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
if (fs.existsSync(prismaSchemaPath)) {
  log.success("Prisma schema found");

  // Check if prisma is in dependencies
  if (
    packageJson.dependencies?.["@prisma/client"] ||
    packageJson.devDependencies?.["prisma"]
  ) {
    log.success("Prisma packages found in dependencies");
  } else {
    log.error(
      "Prisma schema found but Prisma packages missing from dependencies",
    );
    hasErrors = true;
  }

  // Check for postinstall script
  if (packageJson.scripts?.postinstall?.includes("prisma generate")) {
    log.success("Prisma generate in postinstall script");
  } else {
    log.warning('Consider adding "prisma generate" to postinstall script');
    hasWarnings = true;
  }
} else {
  log.info("No Prisma schema found (skipping Prisma checks)");
}

// ============================================================================
// 6. Next.js Configuration Check
// ============================================================================
log.info("Checking Next.js configuration...");

const nextConfigFiles = ["next.config.js", "next.config.mjs", "next.config.ts"];
let foundNextConfig = false;

for (const configFile of nextConfigFiles) {
  if (fs.existsSync(path.join(process.cwd(), configFile))) {
    log.success(`Found ${configFile}`);
    foundNextConfig = true;
    break;
  }
}

if (!foundNextConfig) {
  log.warning("No next.config file found (using defaults)");
  hasWarnings = true;
}

// Check for Next.js in dependencies
if (packageJson.dependencies?.["next"]) {
  log.success(`Next.js ${packageJson.dependencies.next} in dependencies`);
} else {
  log.error("Next.js not found in dependencies");
  hasErrors = true;
}

// ============================================================================
// 7. File System Checks
// ============================================================================
log.info("Checking project structure...");

const requiredDirs = ["src", "public"];

const optionalDirs = ["prisma", "components", "lib", "app", "pages"];

requiredDirs.forEach((dir) => {
  if (fs.existsSync(path.join(process.cwd(), dir))) {
    log.success(`Directory exists: ${dir}/`);
  } else {
    log.error(`Required directory missing: ${dir}/`);
    hasErrors = true;
  }
});

let foundAppOrPages = false;
if (fs.existsSync(path.join(process.cwd(), "src", "app"))) {
  log.success("Using App Router (src/app)");
  foundAppOrPages = true;
} else if (fs.existsSync(path.join(process.cwd(), "app"))) {
  log.success("Using App Router (app)");
  foundAppOrPages = true;
} else if (fs.existsSync(path.join(process.cwd(), "src", "pages"))) {
  log.success("Using Pages Router (src/pages)");
  foundAppOrPages = true;
} else if (fs.existsSync(path.join(process.cwd(), "pages"))) {
  log.success("Using Pages Router (pages)");
  foundAppOrPages = true;
}

if (!foundAppOrPages) {
  log.error("No app/ or pages/ directory found");
  hasErrors = true;
}

// ============================================================================
// 8. Package Lock File Check
// ============================================================================
log.info("Checking lock files...");

const lockFiles = {
  "package-lock.json": "npm",
  "yarn.lock": "yarn",
  "pnpm-lock.yaml": "pnpm",
  "bun.lockb": "bun",
};

let foundLockFile = false;
let lockFileType = "npm";

for (const [lockFile, packageManager] of Object.entries(lockFiles)) {
  if (fs.existsSync(path.join(process.cwd(), lockFile))) {
    log.success(`Found ${lockFile} (using ${packageManager})`);
    foundLockFile = true;
    lockFileType = packageManager;
    break;
  }
}

if (!foundLockFile) {
  log.warning("No lock file found - will be generated during install");
  hasWarnings = true;
}

// ============================================================================
// 9. Dependency Installation
// ============================================================================
log.header("📦 Installing Dependencies");

try {
  // Try npm ci first (fastest, most deterministic)
  log.info("Attempting npm ci...");
  execSync("npm ci", { stdio: "inherit" });
  log.success("Dependencies installed via npm ci");
} catch (ciError) {
  log.warning("npm ci failed, attempting npm install...");

  try {
    execSync("npm install", { stdio: "inherit" });
    log.success("Dependencies installed via npm install");
  } catch (installError) {
    log.error("npm install failed, regenerating package-lock.json...");

    try {
      // Remove old lock file
      const lockPath = path.join(process.cwd(), "package-lock.json");
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
        log.info("Removed old package-lock.json");
      }

      // Fresh install
      execSync("npm install", { stdio: "inherit" });
      log.success("Dependencies installed with fresh lock file");
    } catch (finalError) {
      log.error("Failed to install dependencies after all attempts");
      log.error(finalError.message);
      hasErrors = true;
    }
  }
}

// ============================================================================
// 10. Post-Install Validation
// ============================================================================
log.info("Validating installation...");

if (fs.existsSync(path.join(process.cwd(), "node_modules"))) {
  log.success("node_modules directory created");

  // Count installed packages
  try {
    const output = execSync("npm list --depth=0 --json", { encoding: "utf8" });
    const packages = JSON.parse(output);
    const packageCount = Object.keys(packages.dependencies || {}).length;
    log.success(`Installed ${packageCount} packages`);

    if (packageCount < 10) {
      log.warning("Unexpectedly few packages installed");
      hasWarnings = true;
    }
  } catch (error) {
    log.warning("Could not count installed packages");
  }
} else {
  log.error("node_modules directory not created");
  hasErrors = true;
}

// ============================================================================
// Final Report
// ============================================================================
log.header("📊 Pre-Flight Report");

console.log(`Node.js:     ${nodeVersion}`);
console.log(`Dependencies: ${totalDeps} total`);
console.log(`Lock file:    ${foundLockFile ? "Found" : "Generated"}`);
console.log(`Warnings:     ${hasWarnings ? "⚠️  Yes" : "✅ None"}`);
console.log(`Errors:       ${hasErrors ? "❌ Yes" : "✅ None"}`);

console.log("\n" + "=".repeat(60) + "\n");

if (hasErrors) {
  log.error("Pre-flight checks FAILED - Fix errors before deploying");
  process.exit(1);
}

if (hasWarnings) {
  log.warning("Pre-flight checks passed with WARNINGS");
  log.info("Review warnings and proceed with caution");
  console.log("\n");
  log.success("🎯 Ready for Vercel deployment (with warnings)");
  process.exit(0);
}

log.success("✨ All pre-flight checks PASSED!");
log.success("🎯 Ready for Vercel deployment!");
log.info("Expected: ~1748 packages, ~3min build time");

console.log("\n" + "=".repeat(60) + "\n");
process.exit(0);
