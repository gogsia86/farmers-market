#!/usr/bin/env node
/**
 * 🔍 Build Configuration Verification Script
 * Farmers Market Platform - Vercel Build Optimization
 *
 * Verifies all build configuration fixes are applied correctly
 * Run after updating next.config.mjs or package.json
 *
 * Usage:
 *   node scripts/verify-build-config.mjs
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - One or more checks failed
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const icons = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
  check: "🔍",
};

// Track results
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
let warnings = 0;

/**
 * Print colored output
 */
function print(message, color = "reset", icon = "") {
  const colorCode = colors[color] || colors.reset;
  const prefix = icon ? `${icon} ` : "";
  console.log(`${colorCode}${prefix}${message}${colors.reset}`);
}

/**
 * Print section header
 */
function section(title) {
  console.log("");
  print("═".repeat(60), "cyan");
  print(title, "bright", icons.check);
  print("═".repeat(60), "cyan");
}

/**
 * Record check result
 */
function check(name, passed, details = "") {
  totalChecks++;
  if (passed) {
    passedChecks++;
    print(`${name}`, "green", icons.success);
    if (details) print(`  → ${details}`, "cyan");
  } else {
    failedChecks++;
    print(`${name}`, "red", icons.error);
    if (details) print(`  → ${details}`, "yellow");
  }
}

/**
 * Record warning
 */
function warn(name, details = "") {
  warnings++;
  print(`${name}`, "yellow", icons.warning);
  if (details) print(`  → ${details}`, "cyan");
}

/**
 * Verify package.json configuration
 */
function verifyPackageJson() {
  section("1. package.json Configuration");

  try {
    const packagePath = join(rootDir, "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

    // Check Node.js version
    const nodeVersion = packageJson.engines?.node;
    const hasCorrectNodeVersion = nodeVersion === "20.x";
    check(
      "Node.js version pinned correctly",
      hasCorrectNodeVersion,
      hasCorrectNodeVersion
        ? `"${nodeVersion}" (won't auto-upgrade)`
        : `Found "${nodeVersion}", should be "20.x"`,
    );

    // Check npm version
    const npmVersion = packageJson.engines?.npm;
    const hasNpmVersion = npmVersion && npmVersion.includes(">=10");
    check(
      "npm version specified",
      hasNpmVersion,
      hasNpmVersion ? `"${npmVersion}"` : "npm version not specified",
    );

    // Check for Prisma generate in postinstall
    const hasPostinstall =
      packageJson.scripts?.postinstall?.includes("prisma generate");
    check(
      "Prisma generate in postinstall",
      hasPostinstall,
      "Ensures Prisma client is generated on install",
    );

    // Check build scripts
    const hasBuildScript = packageJson.scripts?.build?.includes("next build");
    check(
      "Build script configured",
      hasBuildScript,
      "next build script present",
    );
  } catch (error) {
    check("package.json readable", false, error.message);
  }
}

/**
 * Verify next.config.mjs configuration
 */
function verifyNextConfig() {
  section("2. next.config.mjs Configuration");

  try {
    const configPath = join(rootDir, "next.config.mjs");
    const configContent = readFileSync(configPath, "utf8");

    // Check for deprecated experimental.turbo
    const hasDeprecatedTurbo = /experimental:\s*{[^}]*turbo:\s*{/.test(
      configContent,
    );
    check(
      "No deprecated experimental.turbo",
      !hasDeprecatedTurbo,
      hasDeprecatedTurbo
        ? "Found deprecated turbo config in experimental"
        : "Clean experimental config",
    );

    // Check for deprecated disableLogger
    const hasDeprecatedDisableLogger = /disableLogger:\s*(true|false)/.test(
      configContent,
    );
    check(
      "No deprecated disableLogger",
      !hasDeprecatedDisableLogger,
      hasDeprecatedDisableLogger
        ? "Found deprecated disableLogger, use webpack.treeshake.removeDebugLogging"
        : "Using modern Sentry config",
    );

    // Check for deprecated reactComponentAnnotation at root
    const hasDeprecatedReactAnnotation =
      /reactComponentAnnotation:\s*{[^}]*enabled:/.test(configContent) &&
      !/webpack:\s*{[^}]*reactComponentAnnotation/.test(configContent);
    check(
      "No deprecated reactComponentAnnotation",
      !hasDeprecatedReactAnnotation,
      hasDeprecatedReactAnnotation
        ? "Found deprecated reactComponentAnnotation, move to webpack config"
        : "Using modern Sentry config",
    );

    // Check for modern webpack.treeshake
    const hasModernTreeshake =
      /webpack:\s*{[^}]*treeshake:\s*{[^}]*removeDebugLogging/.test(
        configContent,
      );
    check(
      "Modern webpack.treeshake configured",
      hasModernTreeshake,
      hasModernTreeshake
        ? "Using webpack.treeshake.removeDebugLogging"
        : "Should add webpack.treeshake.removeDebugLogging",
    );

    // Check for modern webpack.reactComponentAnnotation
    const hasModernReactAnnotation =
      /webpack:\s*{[^}]*reactComponentAnnotation:\s*{/.test(configContent);
    check(
      "Modern webpack.reactComponentAnnotation configured",
      hasModernReactAnnotation,
      hasModernReactAnnotation
        ? "Using webpack.reactComponentAnnotation"
        : "Should add webpack.reactComponentAnnotation",
    );

    // Check for productionBrowserSourceMaps (required for Sentry)
    const hasSourceMaps = /productionBrowserSourceMaps:\s*true/.test(
      configContent,
    );
    check(
      "Production source maps enabled",
      hasSourceMaps,
      hasSourceMaps
        ? "Source maps will be generated for Sentry"
        : "Source maps disabled - Sentry won't work properly",
    );

    // Check for Sentry configuration
    const hasSentryConfig = /withSentryConfig/.test(configContent);
    check(
      "Sentry integration configured",
      hasSentryConfig,
      hasSentryConfig
        ? "withSentryConfig wrapper present"
        : "Sentry not configured",
    );

    // Check for image optimization
    const hasImageConfig = /images:\s*{/.test(configContent);
    check(
      "Image optimization configured",
      hasImageConfig,
      "Next.js image optimization settings present",
    );

    // Check for security headers
    const hasSecurityHeaders = /X-Frame-Options|X-Content-Type-Options/.test(
      configContent,
    );
    check(
      "Security headers configured",
      hasSecurityHeaders,
      "Security headers (XSS, CSP, etc.) present",
    );
  } catch (error) {
    check("next.config.mjs readable", false, error.message);
  }
}

/**
 * Verify Sentry configuration
 */
function verifySentryConfig() {
  section("3. Sentry Configuration");

  try {
    const configPath = join(rootDir, "next.config.mjs");
    const configContent = readFileSync(configPath, "utf8");

    // Check for Sentry org
    const hasSentryOrg = /org:\s*["']medicis-gang["']/.test(configContent);
    check(
      "Sentry organization configured",
      hasSentryOrg,
      hasSentryOrg ? "org: medicis-gang" : "Sentry org not found",
    );

    // Check for Sentry project
    const hasSentryProject = /project:\s*["']farmers-market-prod["']/.test(
      configContent,
    );
    check(
      "Sentry project configured",
      hasSentryProject,
      hasSentryProject
        ? "project: farmers-market-prod"
        : "Sentry project not found",
    );

    // Check for source map configuration
    const hasSourceMapsConfig = /sourcemaps:\s*{/.test(configContent);
    check(
      "Source map upload configured",
      hasSourceMapsConfig,
      hasSourceMapsConfig
        ? "sourcemaps config present"
        : "Source map upload config missing",
    );

    // Check for widenClientFileUpload
    const hasWidenClientFileUpload = /widenClientFileUpload:\s*true/.test(
      configContent,
    );
    check(
      "Widen client file upload enabled",
      hasWidenClientFileUpload,
      hasWidenClientFileUpload
        ? "More source maps will be uploaded"
        : "Limited source map uploads",
    );

    // Check for hideSourceMaps (should be false for Sentry)
    const hidesSourceMaps = /hideSourceMaps:\s*true/.test(configContent);
    check(
      "Source maps not hidden",
      !hidesSourceMaps,
      !hidesSourceMaps
        ? "hideSourceMaps: false (Sentry can access)"
        : "hideSourceMaps: true (Sentry won't work)",
    );

    // Check for tunnelRoute
    const hasTunnelRoute = /tunnelRoute:\s*["']\/monitoring["']/.test(
      configContent,
    );
    warn(
      "Sentry tunnel route configured",
      hasTunnelRoute
        ? "/monitoring tunnel (bypasses ad-blockers)"
        : "No tunnel route (some users may be blocked)",
    );
  } catch (error) {
    check("Sentry config readable", false, error.message);
  }
}

/**
 * Verify environment variables
 */
function verifyEnvironmentVariables() {
  section("4. Environment Variables");

  const requiredVars = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"];

  const sentryVars = ["SENTRY_AUTH_TOKEN", "NEXT_PUBLIC_SENTRY_DSN"];

  // Check required vars
  requiredVars.forEach((varName) => {
    const hasVar = !!process.env[varName];
    check(
      `${varName} set`,
      hasVar,
      hasVar ? "Present in environment" : "Missing - required for build",
    );
  });

  // Check Sentry vars (warning only)
  sentryVars.forEach((varName) => {
    const hasVar = !!process.env[varName];
    if (!hasVar) {
      warn(
        `${varName} not set locally`,
        "Required in Vercel for Sentry uploads",
      );
    } else {
      check(`${varName} set`, true, "Present in environment");
    }
  });

  // Check Node version matches package.json
  const nodeVersion = process.version;
  const isMajorVersion20 = nodeVersion.startsWith("v20.");
  check(
    "Node.js version matches requirement",
    isMajorVersion20,
    isMajorVersion20
      ? `Running ${nodeVersion} (matches 20.x)`
      : `Running ${nodeVersion} (expected 20.x)`,
  );
}

/**
 * Verify build output expectations
 */
function verifyBuildExpectations() {
  section("5. Build Configuration Summary");

  print("Expected Build Behavior:", "bright");
  print("  • productionBrowserSourceMaps: true", "cyan");
  print("  • Sentry uploads: .js.map files to release", "cyan");
  print("  • Source map warnings: 250+ (EXPECTED - manifests)", "yellow");
  print("  • Config warnings: 0 (all fixed)", "green");
  print("  • Build time: ~1:30-1:45 minutes", "cyan");
  print("  • Cache size: ~220-250 MB", "cyan");

  console.log("");
  print("Known Expected Warnings:", "bright");
  print('  ⚠️  "could not determine a source map reference"', "yellow");
  print(
    "     → This is NORMAL for *_client-reference-manifest.js files",
    "cyan",
  );
  print(
    "     → They don't contain code, just React Server Component metadata",
    "cyan",
  );
  print(
    "     → Your actual page chunks (.js files) DO have source maps",
    "cyan",
  );

  console.log("");
  print("Verification Steps After Deploy:", "bright");
  print("  1. Check Vercel build logs", "cyan");
  print("  2. Verify no config/deprecation warnings", "cyan");
  print("  3. Go to Sentry → Releases → [Your Commit SHA]", "cyan");
  print('  4. Check "Artifacts" tab for .js.map files', "cyan");
  print("  5. Trigger test error and verify stack traces", "cyan");
}

/**
 * Print final summary
 */
function printSummary() {
  console.log("");
  print("═".repeat(60), "cyan");
  print("VERIFICATION SUMMARY", "bright", icons.info);
  print("═".repeat(60), "cyan");

  print(`Total Checks: ${totalChecks}`, "bright");
  print(`Passed: ${passedChecks}`, "green", icons.success);
  print(
    `Failed: ${failedChecks}`,
    failedChecks > 0 ? "red" : "green",
    failedChecks > 0 ? icons.error : icons.success,
  );
  print(
    `Warnings: ${warnings}`,
    "yellow",
    warnings > 0 ? icons.warning : icons.success,
  );

  console.log("");

  if (failedChecks === 0) {
    print("✨ ALL CHECKS PASSED! ✨", "green", icons.success);
    print(
      "Your build configuration is optimized and ready for production.",
      "cyan",
    );
    console.log("");
    print("Next steps:", "bright");
    print(
      '  1. Commit changes: git add -A && git commit -m "fix(build): optimize Vercel config"',
      "cyan",
    );
    print("  2. Push to deploy: git push origin master", "cyan");
    print("  3. Monitor Vercel build logs", "cyan");
    print("  4. Verify Sentry source maps in dashboard", "cyan");
    return 0;
  } else {
    print("❌ SOME CHECKS FAILED", "red", icons.error);
    print(
      "Please review the failed checks above and fix the issues.",
      "yellow",
    );
    console.log("");
    print("See documentation:", "bright");
    print("  • docs/VERCEL_BUILD_OPTIMIZATION.md", "cyan");
    print("  • docs/SENTRY_FIX.md", "cyan");
    return 1;
  }
}

/**
 * Main execution
 */
function main() {
  print("═".repeat(60), "cyan");
  print("VERCEL BUILD CONFIGURATION VERIFICATION", "bright", "🚀");
  print("Farmers Market Platform - Build Optimization", "cyan");
  print("═".repeat(60), "cyan");

  verifyPackageJson();
  verifyNextConfig();
  verifySentryConfig();
  verifyEnvironmentVariables();
  verifyBuildExpectations();

  const exitCode = printSummary();
  process.exit(exitCode);
}

// Run verification
main();
