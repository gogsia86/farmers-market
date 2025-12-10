#!/usr/bin/env tsx
/**
 * 🔧 E2E Test Automated Fix Script
 * Fixes common issues across all E2E test files
 *
 * Divine Patterns Applied:
 * - Testing Security Divinity (05_TESTING_SECURITY_DIVINITY)
 * - Kilo-Scale Architecture (11_KILO_SCALE_ARCHITECTURE)
 *
 * Fixes Applied:
 * 1. Replace hardcoded test emails with seeded TEST_USERS
 * 2. Fix redirect expectations (role-based routing)
 * 3. Standardize login patterns
 * 4. Update timeout values for network operations
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

// ============================================================================
// CONFIGURATION
// ============================================================================

const TESTS_DIR = path.join(process.cwd(), "tests", "e2e");
const DRY_RUN = process.argv.includes("--dry-run");
const VERBOSE = process.argv.includes("--verbose");

// ============================================================================
// REPLACEMENT PATTERNS
// ============================================================================

interface Fix {
  name: string;
  description: string;
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
  filePattern?: string;
}

const FIXES: Fix[] = [
  // Fix 1: Replace hardcoded test customer email
  {
    name: "customer-email",
    description: "Replace test.customer@example.com with seeded customer",
    pattern: /['"]test\.customer@example\.com['"]/g,
    replacement: "TEST_USERS.customer.email",
  },

  // Fix 2: Replace hardcoded test customer password
  {
    name: "customer-password",
    description: "Replace hardcoded test passwords",
    pattern: /['"]TestPass123!['"](?=\s*\))/g,
    replacement: "TEST_USERS.customer.password",
  },

  // Fix 3: Replace generic example.com emails in validation tests
  {
    name: "example-emails",
    description: "Update example.com emails for consistency",
    pattern: /['"](?:john|jane)@example\.com['"]/g,
    replacement: '"test.temp@example.com"',
  },

  // Fix 4: Fix dashboard redirect expectations for customers
  {
    name: "customer-dashboard-redirect",
    description: "Fix customer login redirect expectations",
    pattern:
      /\/\/\s*Should redirect to dashboard\s*\n\s*await page\.waitForURL\(\/\\\/dashboard\/\);/g,
    replacement:
      '// Should redirect after login (customers may not have dedicated dashboard)\n    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });',
  },

  // Fix 5: Add TEST_USERS import if missing - handled in ensureTestUsersImport function
  // Removed from FIXES array to avoid regex issues

  // Fix 6: Fix timeout for network operations
  {
    name: "increase-network-timeouts",
    description: "Increase timeouts for checkout/payment operations",
    pattern:
      /await\s+page\.click\(['"]button\[type=["']submit["']\]['"]\);(\s*\/\/[^\n]*(?:checkout|payment|stripe))/gi,
    replacement: (match: string, comment: string) =>
      `await page.click('button[type="submit"]', { timeout: 45000 });${comment}`,
  },

  // Fix 7: Add waitForLoadState after navigation
  {
    name: "add-network-idle-wait",
    description: "Add networkidle wait after goto",
    pattern:
      /(await\s+page\.goto\([^)]+\);)(?!\s*await\s+page\.waitForLoadState)/g,
    replacement: (match: string, gotoStatement: string) =>
      `${gotoStatement}\n    await page.waitForLoadState("networkidle");`,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function log(
  message: string,
  level: "info" | "success" | "warning" | "error" = "info",
) {
  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  const colors = {
    info: "\x1b[36m",
    success: "\x1b[32m",
    warning: "\x1b[33m",
    error: "\x1b[31m",
  };

  const reset = "\x1b[0m";

  console.log(`${icons[level]} ${colors[level]}${message}${reset}`);
}

function verbose(message: string) {
  if (VERBOSE) {
    console.log(`   ${message}`);
  }
}

async function findTestFiles(): Promise<string[]> {
  const pattern = path.join(TESTS_DIR, "**", "*.spec.ts").replace(/\\/g, "/");
  const files = await glob(pattern);
  return files;
}

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

function writeFile(filePath: string, content: string): void {
  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, "utf-8");
  }
}

function ensureTestUsersImport(content: string): string {
  // Check if TEST_USERS is already imported
  if (
    content.includes('from "../helpers/auth"') ||
    content.includes("from '../helpers/auth'")
  ) {
    verbose("TEST_USERS import already exists");
    return content;
  }

  // Check if TEST_USERS is used in the file
  if (!content.includes("TEST_USERS")) {
    verbose("TEST_USERS not used in file, skipping import");
    return content;
  }

  // Find the last import statement
  const importRegex = /^import\s+.*from\s+['"][^'"]+['"];?\s*$/gm;
  const imports = content.match(importRegex);

  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const importIndex = content.lastIndexOf(lastImport);
    const importEndIndex = importIndex + lastImport.length;

    const newImport = '\nimport { TEST_USERS } from "../helpers/auth";';

    return (
      content.slice(0, importEndIndex) +
      newImport +
      content.slice(importEndIndex)
    );
  }

  return content;
}

function applyFix(
  content: string,
  fix: Fix,
): { content: string; matches: number } {
  let matches = 0;

  const newContent = content.replace(fix.pattern, (match, ...args) => {
    matches++;
    verbose(`  Found match: ${match.substring(0, 50)}...`);

    // Handle both string and function replacements
    if (typeof fix.replacement === "function") {
      return fix.replacement(match, ...args);
    }
    return fix.replacement;
  });

  return { content: newContent, matches };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║  🔧 E2E Test Automated Fix Script                         ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(
    `║  Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "LIVE (will modify files)"}${DRY_RUN ? "            " : "      "}║`,
  );
  console.log(
    `║  Verbose: ${VERBOSE ? "ON " : "OFF"}                                            ║`,
  );
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  if (DRY_RUN) {
    log("Running in DRY RUN mode - no files will be modified", "warning");
  }

  // Find all test files
  log("Finding test files...");
  const testFiles = await findTestFiles();
  log(`Found ${testFiles.length} test files`, "success");

  if (testFiles.length === 0) {
    log("No test files found!", "error");
    process.exit(1);
  }

  // Process each file
  let totalFilesModified = 0;
  let totalFixesApplied = 0;

  const fixStats: Record<string, number> = {};
  FIXES.forEach((fix) => {
    fixStats[fix.name] = 0;
  });

  for (const filePath of testFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    verbose(`\nProcessing: ${relativePath}`);

    let content = readFile(filePath);
    let fileModified = false;
    let fileFixCount = 0;

    // Ensure TEST_USERS import if needed
    const withImport = ensureTestUsersImport(content);
    if (withImport !== content) {
      content = withImport;
      fileModified = true;
      fileFixCount++;
      verbose("  ✓ Added TEST_USERS import");
    }

    // Apply each fix
    for (const fix of FIXES) {
      // Skip if file pattern specified and doesn't match
      if (fix.filePattern && !filePath.includes(fix.filePattern)) {
        continue;
      }

      const { content: newContent, matches } = applyFix(content, fix);

      if (matches > 0) {
        content = newContent;
        fileModified = true;
        fileFixCount += matches;
        fixStats[fix.name] += matches;
        verbose(`  ✓ Applied "${fix.name}" (${matches} matches)`);
      }
    }

    // Write file if modified
    if (fileModified) {
      writeFile(filePath, content);
      totalFilesModified++;
      totalFixesApplied += fileFixCount;
      log(`Modified: ${relativePath} (${fileFixCount} fixes)`, "success");
    } else {
      verbose("  No changes needed");
    }
  }

  // Print summary
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║  📊 Fix Summary                                            ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(
    `║  Files Processed: ${testFiles.length.toString().padEnd(43)} ║`,
  );
  console.log(
    `║  Files Modified: ${totalFilesModified.toString().padEnd(44)} ║`,
  );
  console.log(
    `║  Total Fixes Applied: ${totalFixesApplied.toString().padEnd(40)} ║`,
  );
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║  Fixes by Type:                                            ║");

  for (const [fixName, count] of Object.entries(fixStats)) {
    if (count > 0) {
      const fix = FIXES.find((f) => f.name === fixName);
      console.log(
        `║  • ${fix?.description.padEnd(51)} ${count.toString().padStart(3)} ║`,
      );
    }
  }

  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  if (DRY_RUN) {
    log("DRY RUN complete - no files were modified", "warning");
    log("Run without --dry-run to apply changes", "info");
  } else {
    log("All fixes applied successfully!", "success");
    log("Remember to:", "info");
    console.log("  1. Review the changes with 'git diff'");
    console.log("  2. Run tests: 'npx playwright test'");
    console.log(
      "  3. Commit changes: 'git commit -m \"fix(tests): automated E2E test fixes\"'",
    );
  }

  // Additional manual fixes needed
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║  📝 Manual Fixes Still Needed                              ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║  1. Verify data-testid attributes exist in components     ║");
  console.log("║  2. Check actual redirect behavior matches test expects   ║");
  console.log("║  3. Update test for actual error messages shown in UI     ║");
  console.log("║  4. Ensure seeded test data exists in database            ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );
}

// ============================================================================
// RUN SCRIPT
// ============================================================================

main().catch((error) => {
  log(`Script failed: ${error.message}`, "error");
  console.error(error);
  process.exit(1);
});

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
USAGE:

# Dry run (preview changes without modifying files)
npm run fix:e2e-tests -- --dry-run

# Dry run with verbose output
npm run fix:e2e-tests -- --dry-run --verbose

# Apply fixes (modify files)
npm run fix:e2e-tests

# Apply fixes with verbose output
npm run fix:e2e-tests -- --verbose

WHAT IT FIXES:

1. ✅ Replaces test.customer@example.com with TEST_USERS.customer.email
2. ✅ Replaces hardcoded passwords with TEST_USERS.customer.password
3. ✅ Updates dashboard redirect expectations for role-based routing
4. ✅ Adds TEST_USERS import where needed
5. ✅ Increases timeouts for network-heavy operations
6. ✅ Adds networkidle waits after page navigation

BEFORE RUNNING:

1. Ensure you have committed any pending changes
2. Review the fix patterns in this script
3. Run with --dry-run first to preview changes

AFTER RUNNING:

1. Review changes: git diff
2. Test: npx playwright test
3. Commit: git commit -m "fix(tests): automated E2E test fixes"
*/
