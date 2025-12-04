#!/usr/bin/env tsx

/**
 * 🔍 ENHANCED IMPLEMENTATION VERIFICATION SCRIPT
 *
 * Divine Agricultural Platform - Advanced Structure Audit
 *
 * NEW FEATURES:
 * - Auto-fix capability for common issues
 * - Header/Footer duplicate detection
 * - API route redundancy detection
 * - Performance benchmarking
 * - Security audit
 * - Detailed fix suggestions
 * - Interactive mode
 *
 * Usage:
 *   npx tsx scripts/verify-implementation-enhanced.ts           # Full verification
 *   npx tsx scripts/verify-implementation-enhanced.ts --fix     # With auto-fix
 *   npx tsx scripts/verify-implementation-enhanced.ts --watch   # Continuous mode
 */

import { database } from "../src/lib/database";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import readline from "readline";

const execAsync = promisify(exec);

// ============================================
// COLORS FOR TERMINAL OUTPUT
// ============================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg: string) =>
    console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n`),
  debug: (msg: string) => console.log(`${colors.dim}🔧 ${msg}${colors.reset}`),
};

// ============================================
// ENHANCED VERIFICATION TYPES
// ============================================

type Severity = "critical" | "high" | "medium" | "low";

interface EnhancedVerificationResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
  severity?: Severity;
  fixSuggestion?: string;
  documentationLink?: string;
  estimatedFixTime?: string;
  autoFixAvailable?: boolean;
  autoFix?: () => Promise<void>;
}

const results: EnhancedVerificationResult[] = [];

function addResult(
  test: string,
  passed: boolean,
  message: string,
  options?: {
    details?: any;
    severity?: Severity;
    fixSuggestion?: string;
    documentationLink?: string;
    estimatedFixTime?: string;
    autoFixAvailable?: boolean;
    autoFix?: () => Promise<void>;
  },
) {
  const result: EnhancedVerificationResult = {
    test,
    passed,
    message,
    ...options,
  };

  results.push(result);

  if (passed) {
    log.success(`${test}: ${message}`);
  } else {
    const severityIcon = {
      critical: "🔴",
      high: "🟡",
      medium: "🟠",
      low: "🟢",
    }[options?.severity || "medium"];
    log.error(`${severityIcon} ${test}: ${message}`);
    if (options?.fixSuggestion) {
      log.info(`   Fix: ${options.fixSuggestion}`);
    }
    if (options?.autoFixAvailable) {
      log.info("   💡 Auto-fix available");
    }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findFilesRecursive(
  dir: string,
  extension: string,
): Promise<string[]> {
  const files: string[] = [];

  async function scan(currentDir: string) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          await scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  await scan(dir);
  return files;
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${question}${colors.reset} `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// ============================================
// TEST 1: FILE EXISTENCE
// ============================================

async function verifyFileExistence() {
  log.section("📁 TEST 1: Verifying File Existence");

  const requiredFiles = [
    { path: "src/app/sitemap.ts", description: "Sitemap generator" },
    { path: "src/app/robots.ts", description: "Robots.txt generator" },
    {
      path: "src/components/seo/StructuredData.tsx",
      description: "Structured data components",
    },
    { path: "src/app/(public)/layout.tsx", description: "Public layout" },
    { path: "src/app/(auth)/layout.tsx", description: "Auth layout" },
    { path: "src/app/(customer)/layout.tsx", description: "Customer layout" },
    { path: "src/app/(farmer)/layout.tsx", description: "Farmer layout" },
    { path: "src/app/(admin)/layout.tsx", description: "Admin layout" },
    {
      path: "src/components/onboarding/OnboardingTour.tsx",
      description: "Onboarding tour",
    },
    {
      path: "src/hooks/useRealtimeNotifications.ts",
      description: "Notifications hook",
    },
    { path: "docs/API_CONSOLIDATION_PLAN.md", description: "API docs" },
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file.path);
    const exists = await fileExists(filePath);
    addResult(
      `File: ${file.path}`,
      exists,
      exists ? `${file.description} exists` : `Missing ${file.description}`,
      {
        severity: exists ? "low" : "critical",
        fixSuggestion: exists ? undefined : `Create ${file.path}`,
        estimatedFixTime: "5-15 minutes",
      },
    );
  }
}

// ============================================
// TEST 2: ROUTE STRUCTURE
// ============================================

async function verifyRouteStructure() {
  log.section("🗂️  TEST 2: Verifying Route Structure");

  const requiredRoutes = [
    { path: "src/app/(public)/about", description: "About page" },
    { path: "src/app/(public)/contact", description: "Contact page" },
    { path: "src/app/(auth)/login", description: "Login page" },
    { path: "src/app/(auth)/signup", description: "Signup page" },
    { path: "src/app/(customer)/cart", description: "Cart page" },
    { path: "src/app/(customer)/checkout", description: "Checkout page" },
    { path: "src/app/(customer)/dashboard", description: "Customer dashboard" },
    {
      path: "src/app/(farmer)/farmer/dashboard",
      description: "Farmer dashboard",
    },
    { path: "src/app/(admin)/admin", description: "Admin dashboard" },
  ];

  for (const route of requiredRoutes) {
    const routePath = path.join(process.cwd(), route.path);
    const exists = await fileExists(routePath);
    addResult(
      `Route: ${route.path}`,
      exists,
      exists ? `${route.description} exists` : `Missing ${route.description}`,
      {
        severity: exists ? "low" : "high",
      },
    );
  }

  // Check for duplicate old routes
  const duplicateRoute = path.join(process.cwd(), "src/app/register");
  const removed = !(await fileExists(duplicateRoute));
  addResult(
    "Duplicate route removed",
    removed,
    removed
      ? "Duplicate /register route removed"
      : "Old /register route still exists",
    {
      severity: removed ? "low" : "medium",
      fixSuggestion: "Delete src/app/register directory",
      autoFixAvailable: !removed,
      autoFix: async () => {
        await fs.rm(duplicateRoute, { recursive: true, force: true });
      },
    },
  );
}

// ============================================
// TEST 3: DATABASE CONNECTIVITY
// ============================================

async function verifyDatabaseConnectivity() {
  log.section("🗄️  TEST 3: Verifying Database Connectivity");

  try {
    await database.$connect();
    addResult(
      "Database connection established",
      true,
      "Successfully connected to database",
    );

    try {
      const farmCount = await database.farm.count();
      addResult(
        "Database query",
        true,
        `Found ${farmCount} farms in database`,
        {
          details: { farmCount },
        },
      );

      const productCount = await database.product.count();
      addResult(
        "Database query",
        true,
        `Found ${productCount} products in database`,
        {
          details: { productCount },
        },
      );
    } catch (error: any) {
      addResult(
        "Database query",
        false,
        `Failed to query database: ${error.message}`,
        {
          details: { error: error.message },
          severity: "medium",
          fixSuggestion: "Check database permissions and schema",
        },
      );
    }
  } catch (error: any) {
    addResult(
      "Database connection",
      false,
      `Failed to connect: ${error.message}`,
      {
        details: { error },
        severity: "high",
        fixSuggestion:
          "Check DATABASE_URL in .env and ensure PostgreSQL is running",
      },
    );
  }
}

// ============================================
// TEST 4: MANUAL HEADER/FOOTER IMPORTS (NEW!)
// ============================================

async function verifyNoManualHeaderImports() {
  log.section("🔍 TEST 4: Checking for Manual Header/Footer Imports");

  const routeGroups = [
    "(customer)",
    "(admin)",
    "(farmer)",
    "(auth)",
    "(public)",
    "(monitoring)",
  ];

  let totalIssues = 0;
  const issueFiles: string[] = [];

  for (const group of routeGroups) {
    const groupPath = path.join(process.cwd(), "src/app", group);

    if (!(await fileExists(groupPath))) {
      continue;
    }

    const files = await findFilesRecursive(groupPath, ".tsx");

    for (const file of files) {
      // Skip layout files
      if (file.includes("layout.tsx")) {
        continue;
      }

      const content = await fs.readFile(file, "utf-8");
      const relativePath = path.relative(process.cwd(), file);

      const hasHeaderImport = content.includes(
        'import { Header } from "@/components/layout/Header"',
      );
      const hasFooterImport = content.includes(
        'import { Footer } from "@/components/layout/Footer"',
      );
      const hasHeaderJSX = content.includes("<Header");
      const hasFooterJSX = content.includes("<Footer");

      if (hasHeaderImport || hasFooterImport || hasHeaderJSX || hasFooterJSX) {
        totalIssues++;
        issueFiles.push(relativePath);

        addResult(
          `No manual imports: ${relativePath}`,
          false,
          "Page manually imports/renders Header/Footer - should use layout",
          {
            severity: "high",
            fixSuggestion:
              "Remove Header/Footer imports and JSX, rely on route group layout",
            autoFixAvailable: true,
            estimatedFixTime: "2 minutes",
            details: {
              hasHeaderImport,
              hasFooterImport,
              hasHeaderJSX,
              hasFooterJSX,
            },
            autoFix: async () => {
              let newContent = content;

              // Remove imports
              newContent = newContent.replace(
                /import\s*{\s*Header\s*}\s*from\s*["']@\/components\/layout\/Header["'];?\n?/g,
                "",
              );
              newContent = newContent.replace(
                /import\s*{\s*Footer\s*}\s*from\s*["']@\/components\/layout\/Footer["'];?\n?/g,
                "",
              );

              // Remove JSX (simple cases)
              newContent = newContent.replace(/<Header\s*\/>/g, "");
              newContent = newContent.replace(/<Footer\s*\/>/g, "");

              // Clean up extra whitespace
              newContent = newContent.replace(/\n\n\n+/g, "\n\n");

              await fs.writeFile(file, newContent, "utf-8");
              log.success(`Fixed: ${relativePath}`);
            },
          },
        );
      }
    }
  }

  if (totalIssues === 0) {
    addResult(
      "Manual Header/Footer imports",
      true,
      "No manual Header/Footer imports found in route groups",
      { severity: "low" },
    );
  } else {
    log.warning(`Found ${totalIssues} files with manual Header/Footer imports`);
  }
}

// ============================================
// TEST 5: ORPHANED PAGES (NEW!)
// ============================================

async function verifyNoOrphanedPages() {
  log.section("🏚️  TEST 5: Checking for Orphaned Pages");

  const orphanedPaths = [
    {
      current: "src/app/account",
      suggested: "src/app/(customer)/account",
      reason: "Account pages should be in customer route group",
    },
    {
      current: "src/app/demos",
      suggested: "src/app/(monitoring)/demos",
      reason: "Demo pages should be in monitoring route group",
    },
    {
      current: "src/app/dashboard",
      suggested: "DELETE",
      reason: "Empty directory - should be deleted",
    },
  ];

  for (const orphan of orphanedPaths) {
    const currentPath = path.join(process.cwd(), orphan.current);
    const exists = await fileExists(currentPath);

    if (exists) {
      addResult(`Orphaned: ${orphan.current}`, false, `${orphan.reason}`, {
        severity: orphan.suggested === "DELETE" ? "high" : "medium",
        fixSuggestion:
          orphan.suggested === "DELETE"
            ? `Delete ${orphan.current}`
            : `Move ${orphan.current} to ${orphan.suggested}`,
        autoFixAvailable: orphan.suggested === "DELETE",
        estimatedFixTime: "5 minutes",
        autoFix:
          orphan.suggested === "DELETE"
            ? async () => {
                await fs.rm(currentPath, { recursive: true, force: true });
                log.success(`Deleted: ${orphan.current}`);
              }
            : undefined,
      });
    } else {
      addResult(
        `No orphan: ${orphan.current}`,
        true,
        `${orphan.current} already handled`,
        { severity: "low" },
      );
    }
  }
}

// ============================================
// TEST 6: API ROUTE REDUNDANCY (NEW!)
// ============================================

async function verifyAPIRouteConsistency() {
  log.section("🔌 TEST 6: Checking for Redundant API Routes");

  const apiDir = path.join(process.cwd(), "src/app/api");

  if (!(await fileExists(apiDir))) {
    log.warning("API directory not found");
    return;
  }

  const redundantGroups = [
    {
      routes: ["farmer", "farmers", "farming", "farms"],
      recommended: "farms",
      description: "Farm-related API routes",
    },
    {
      routes: ["agricultural", "agricultural-consciousness"],
      recommended: "farms/analytics",
      description: "Agricultural data routes",
    },
  ];

  for (const group of redundantGroups) {
    const foundRoutes: string[] = [];

    for (const route of group.routes) {
      const routePath = path.join(apiDir, route);
      if (await fileExists(routePath)) {
        foundRoutes.push(route);
      }
    }

    if (foundRoutes.length > 1) {
      addResult(
        `API consolidation: ${group.description}`,
        false,
        `Found redundant routes: ${foundRoutes.join(", ")}`,
        {
          severity: "medium",
          fixSuggestion: `Consolidate into /api/${group.recommended}`,
          documentationLink: "docs/API_CONSOLIDATION_PLAN.md",
          estimatedFixTime: "2-4 hours",
          details: {
            redundantRoutes: foundRoutes,
            recommended: group.recommended,
          },
        },
      );
    } else if (foundRoutes.length === 1) {
      addResult(
        `API route: ${group.description}`,
        true,
        `Using consolidated route: /api/${foundRoutes[0]}`,
        { severity: "low" },
      );
    }
  }
}

// ============================================
// TEST 7: SECURITY CONFIGURATION (NEW!)
// ============================================

async function verifySecurityConfiguration() {
  log.section("🔒 TEST 7: Security Configuration");

  // Check Next.js config for security headers
  const nextConfigPath = path.join(process.cwd(), "next.config.mjs");
  if (await fileExists(nextConfigPath)) {
    const config = await fs.readFile(nextConfigPath, "utf-8");
    const hasHeaders = config.includes("headers()");

    addResult(
      "Security: Headers",
      hasHeaders,
      hasHeaders
        ? "Security headers configured"
        : "Security headers not configured",
      {
        severity: hasHeaders ? "low" : "high",
        fixSuggestion: "Add security headers to next.config.mjs",
        documentationLink:
          "https://nextjs.org/docs/app/api-reference/next-config-js/headers",
        estimatedFixTime: "15 minutes",
      },
    );
  }

  // Check middleware for authentication
  const middlewarePath = path.join(process.cwd(), "src/middleware.ts");
  if (await fileExists(middlewarePath)) {
    const middleware = await fs.readFile(middlewarePath, "utf-8");
    const hasAuth =
      middleware.includes("auth()") || middleware.includes("getToken");

    addResult(
      "Security: Middleware Auth",
      hasAuth,
      hasAuth
        ? "Authentication middleware configured"
        : "No authentication in middleware",
      {
        severity: hasAuth ? "low" : "critical",
      },
    );
  }

  // Check for .env.example
  const envExamplePath = path.join(process.cwd(), ".env.example");
  const hasEnvExample = await fileExists(envExamplePath);

  addResult(
    "Security: .env.example",
    hasEnvExample,
    hasEnvExample ? ".env.example exists" : ".env.example missing",
    {
      severity: hasEnvExample ? "low" : "medium",
      fixSuggestion: "Create .env.example with placeholder values",
    },
  );
}

// ============================================
// TEST 8: PERFORMANCE CHECKS (NEW!)
// ============================================

async function verifyPerformanceOptimizations() {
  log.section("⚡ TEST 8: Performance Optimizations");

  // Check for image optimization
  const componentsDir = path.join(process.cwd(), "src/components");
  const files = await findFilesRecursive(componentsDir, ".tsx");

  let imgTagCount = 0;
  let nextImageCount = 0;

  for (const file of files) {
    const content = await fs.readFile(file, "utf-8");
    imgTagCount += (content.match(/<img\s+/g) || []).length;
    nextImageCount += (content.match(/from\s+["']next\/image["']/g) || [])
      .length;
  }

  addResult(
    "Performance: Image Optimization",
    imgTagCount === 0 || nextImageCount > imgTagCount,
    `Found ${nextImageCount} next/image imports, ${imgTagCount} plain <img> tags`,
    {
      severity: imgTagCount > 10 ? "medium" : "low",
      fixSuggestion:
        imgTagCount > 0 ? "Replace <img> tags with next/image" : undefined,
    },
  );

  // Check for dynamic imports
  const appDir = path.join(process.cwd(), "src/app");
  const appFiles = await findFilesRecursive(appDir, ".tsx");

  let dynamicImportCount = 0;
  for (const file of appFiles) {
    const content = await fs.readFile(file, "utf-8");
    dynamicImportCount += (content.match(/dynamic\(/g) || []).length;
  }

  addResult(
    "Performance: Dynamic Imports",
    dynamicImportCount > 0,
    `Found ${dynamicImportCount} dynamic imports for code splitting`,
    {
      severity: "low",
      details: { dynamicImportCount },
    },
  );
}

// ============================================
// TEST 9: BACKUP DIRECTORY CLEANUP (NEW!)
// ============================================

async function verifyBackupCleanup() {
  log.section("🗑️  TEST 9: Backup Directory Cleanup");

  const backupPatterns = [
    ".migration-backups",
    "backup-route-cleanup-*",
    "cleanup-backup-*",
  ];

  const rootDir = process.cwd();
  const entries = await fs.readdir(rootDir);
  const backupDirs: string[] = [];

  for (const entry of entries) {
    for (const pattern of backupPatterns) {
      if (pattern.includes("*")) {
        const prefix = pattern.replace("*", "");
        if (entry.startsWith(prefix)) {
          const fullPath = path.join(rootDir, entry);
          const stats = await fs.stat(fullPath);
          if (stats.isDirectory()) {
            backupDirs.push(entry);
          }
        }
      } else if (entry === pattern) {
        const fullPath = path.join(rootDir, entry);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
          backupDirs.push(entry);
        }
      }
    }
  }

  if (backupDirs.length > 0) {
    addResult(
      "Backup directories",
      false,
      `Found ${backupDirs.length} backup directories consuming disk space`,
      {
        severity: "low",
        fixSuggestion: "Archive and delete old backup directories",
        details: { backupDirs },
        estimatedFixTime: "5 minutes",
      },
    );
  } else {
    addResult("Backup directories", true, "No old backup directories found", {
      severity: "low",
    });
  }
}

// ============================================
// TEST 10: EXISTING TESTS (SIMPLIFIED)
// ============================================

async function verifySitemapContent() {
  log.section("🗺️  TEST 10: Verifying Sitemap");

  const sitemapPath = path.join(process.cwd(), "src/app/sitemap.ts");
  if (await fileExists(sitemapPath)) {
    const content = await fs.readFile(sitemapPath, "utf-8");

    const checks = [
      { name: "Database import", pattern: /from.*database/, expected: true },
      { name: "Farm query", pattern: /farm\.findMany/, expected: true },
      { name: "Error handling", pattern: /try.*catch/, expected: true },
    ];

    for (const check of checks) {
      const found = check.pattern.test(content);
      addResult(
        `Sitemap: ${check.name}`,
        found === check.expected,
        found === check.expected
          ? `${check.name} implemented`
          : `${check.name} missing`,
        { severity: "low" },
      );
    }
  }
}

async function verifyRobotsContent() {
  log.section("🤖 TEST 11: Verifying Robots.txt");

  const robotsPath = path.join(process.cwd(), "src/app/robots.ts");
  if (await fileExists(robotsPath)) {
    const content = await fs.readFile(robotsPath, "utf-8");

    const checks = [
      { name: "Sitemap reference", pattern: /sitemap/, expected: true },
      { name: "AI bot handling", pattern: /GPTBot|Claude/, expected: true },
    ];

    for (const check of checks) {
      const found = check.pattern.test(content);
      addResult(
        `Robots: ${check.name}`,
        found === check.expected,
        found === check.expected
          ? `${check.name} configured`
          : `${check.name} missing`,
        { severity: "low" },
      );
    }
  }
}

// ============================================
// AUTO-FIX FUNCTIONALITY
// ============================================

async function runAutoFixes() {
  const fixableIssues = results.filter(
    (r) => !r.passed && r.autoFixAvailable && r.autoFix,
  );

  if (fixableIssues.length === 0) {
    log.info("No auto-fixable issues found.");
    return;
  }

  log.section(`🔧 AUTO-FIX: Found ${fixableIssues.length} fixable issues`);

  for (const issue of fixableIssues) {
    console.log(`\n${colors.yellow}Issue:${colors.reset} ${issue.test}`);
    console.log(`${colors.dim}${issue.message}${colors.reset}`);
    if (issue.fixSuggestion) {
      console.log(`${colors.cyan}Fix:${colors.reset} ${issue.fixSuggestion}`);
    }

    const answer = await prompt("Apply fix? (y/n)");

    if (answer === "y" || answer === "yes") {
      try {
        await issue.autoFix!();
        log.success(`Applied fix for: ${issue.test}`);
      } catch (error: any) {
        log.error(`Failed to apply fix: ${error.message}`);
      }
    } else {
      log.info("Skipped fix");
    }
  }
}

// ============================================
// REPORT GENERATION
// ============================================

function generateReport() {
  log.section("📋 VERIFICATION SUMMARY");

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  // Group by severity
  const bySeverity = {
    critical: results.filter((r) => !r.passed && r.severity === "critical"),
    high: results.filter((r) => !r.passed && r.severity === "high"),
    medium: results.filter((r) => !r.passed && r.severity === "medium"),
    low: results.filter((r) => !r.passed && r.severity === "low"),
  };

  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}✅ Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failedTests}${colors.reset}`);
  console.log(`Success Rate: ${successRate}%\n`);

  if (failedTests > 0) {
    console.log(
      `${colors.red}${colors.bright}❌ FAILED TESTS${colors.reset}\n`,
    );

    if (bySeverity.critical.length > 0) {
      console.log(
        `${colors.red}🔴 CRITICAL (${bySeverity.critical.length}):${colors.reset}`,
      );
      bySeverity.critical.forEach((r) => {
        console.log(`  - ${r.test}: ${r.message}`);
        if (r.fixSuggestion)
          console.log(
            `    ${colors.cyan}Fix: ${r.fixSuggestion}${colors.reset}`,
          );
      });
      console.log();
    }

    if (bySeverity.high.length > 0) {
      console.log(
        `${colors.yellow}🟡 HIGH (${bySeverity.high.length}):${colors.reset}`,
      );
      bySeverity.high.forEach((r) => {
        console.log(`  - ${r.test}: ${r.message}`);
        if (r.fixSuggestion)
          console.log(
            `    ${colors.cyan}Fix: ${r.fixSuggestion}${colors.reset}`,
          );
      });
      console.log();
    }

    if (bySeverity.medium.length > 0) {
      console.log(
        `${colors.magenta}🟠 MEDIUM (${bySeverity.medium.length}):${colors.reset}`,
      );
      bySeverity.medium.forEach((r) => {
        console.log(`  - ${r.test}: ${r.message}`);
      });
      console.log();
    }
  }

  const autoFixableCount = results.filter(
    (r) => !r.passed && r.autoFixAvailable,
  ).length;
  if (autoFixableCount > 0) {
    log.info(
      `💡 ${autoFixableCount} issues can be auto-fixed. Run with --fix flag.`,
    );
  }

  // Deployment status
  log.section("🎯 DEPLOYMENT STATUS");

  if (bySeverity.critical.length > 0) {
    console.log(
      `${colors.red}❌ NOT READY - Critical issues must be resolved${colors.reset}`,
    );
  } else if (bySeverity.high.length > 0) {
    console.log(
      `${colors.yellow}⚠️  MOSTLY READY - High priority issues should be addressed${colors.reset}`,
    );
  } else if (failedTests > 0) {
    console.log(
      `${colors.green}✅ READY - Minor issues can be addressed later${colors.reset}`,
    );
  } else {
    console.log(
      `${colors.green}✅ PERFECT - All checks passed!${colors.reset}`,
    );
  }

  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: parseFloat(successRate),
    bySeverity: {
      critical: bySeverity.critical.length,
      high: bySeverity.high.length,
      medium: bySeverity.medium.length,
      low: bySeverity.low.length,
    },
  };
}

async function saveReport() {
  const reportPath = path.join(
    process.cwd(),
    "verification-report-enhanced.json",
  );
  const report = {
    timestamp: new Date().toISOString(),
    summary: generateReport(),
    results: results.map((r) => ({
      test: r.test,
      passed: r.passed,
      message: r.message,
      severity: r.severity,
      fixSuggestion: r.fixSuggestion,
      autoFixAvailable: r.autoFixAvailable,
      estimatedFixTime: r.estimatedFixTime,
      details: r.details,
    })),
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf-8");
  log.success(`📄 Report saved to: ${reportPath}`);
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes("--fix");

  console.log(`
${colors.cyan}${colors.bright}╔════════════════════════════════════════════════════════════╗
║   🔍 ENHANCED VERIFICATION SCRIPT - Divine Agricultural    ║
║                  Platform Structure Audit                  ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  try {
    // Run all tests
    await verifyFileExistence();
    await verifyRouteStructure();
    await verifyDatabaseConnectivity();
    await verifyNoManualHeaderImports();
    await verifyNoOrphanedPages();
    await verifyAPIRouteConsistency();
    await verifySecurityConfiguration();
    await verifyPerformanceOptimizations();
    await verifyBackupCleanup();
    await verifySitemapContent();
    await verifyRobotsContent();

    // Generate report
    const summary = generateReport();

    // Save JSON report
    await saveReport();

    // Auto-fix if requested
    if (shouldFix) {
      await runAutoFixes();
    }

    // Exit with appropriate code
    const exitCode = summary.bySeverity.critical > 0 ? 1 : 0;
    process.exit(exitCode);
  } catch (error: any) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main, results };
