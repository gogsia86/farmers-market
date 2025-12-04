#!/usr/bin/env tsx

/**
 * 🔧 FIX DUPLICATE HEADER/FOOTER IMPORTS
 *
 * Automatically removes manual Header/Footer imports from pages
 * that are already in route groups with layouts.
 *
 * Usage:
 *   npx tsx scripts/fix-duplicate-imports.ts           # Dry run
 *   npx tsx scripts/fix-duplicate-imports.ts --apply   # Apply fixes
 *
 * Divine Agricultural Platform - Structure Cleanup Script
 */

import fs from "fs/promises";
import path from "path";

// ============================================
// COLORS FOR TERMINAL OUTPUT
// ============================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
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
// CONFIGURATION
// ============================================

interface FileToFix {
  path: string;
  routeGroup: string;
  hasHeaderImport: boolean;
  hasFooterImport: boolean;
  hasHeaderJSX: boolean;
  hasFooterJSX: boolean;
}

const TARGET_FILES: string[] = [
  // Customer route group pages
  "src/app/(customer)/cart/page.tsx",
  "src/app/(customer)/checkout/page.tsx",
  "src/app/(customer)/marketplace/farms/[slug]/page.tsx",
  "src/app/(customer)/marketplace/products/page.tsx",

  // Orphaned pages that need moving
  "src/app/account/notifications/page.tsx",

  // Demo pages
  "src/app/demos/analytics/page.tsx",
  "src/app/demos/chat/page.tsx",
  "src/app/demos/inventory/page.tsx",

  // Homepage (special case)
  "src/app/page.tsx",
];

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

async function createBackup(filePath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), ".import-fix-backups", timestamp);

  await fs.mkdir(backupDir, { recursive: true });

  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, fileName);

  await fs.copyFile(filePath, backupPath);

  return backupPath;
}

// ============================================
// FILE ANALYSIS
// ============================================

async function analyzeFile(filePath: string): Promise<FileToFix | null> {
  const fullPath = path.join(process.cwd(), filePath);

  if (!(await fileExists(fullPath))) {
    log.warning(`File not found: ${filePath}`);
    return null;
  }

  const content = await fs.readFile(fullPath, "utf-8");

  // Check for Header import
  const hasHeaderImport =
    /import\s*{\s*Header\s*}\s*from\s*["']@\/components\/layout\/Header["'];?/.test(
      content,
    );

  // Check for Footer import
  const hasFooterImport =
    /import\s*{\s*Footer\s*}\s*from\s*["']@\/components\/layout\/Footer["'];?/.test(
      content,
    );

  // Check for Header JSX usage
  const hasHeaderJSX = /<Header\s*\/?>/.test(content);

  // Check for Footer JSX usage
  const hasFooterJSX = /<Footer\s*\/?>/.test(content);

  // Determine route group
  let routeGroup = "none";
  if (filePath.includes("(customer)")) routeGroup = "(customer)";
  else if (filePath.includes("(admin)")) routeGroup = "(admin)";
  else if (filePath.includes("(farmer)")) routeGroup = "(farmer)";
  else if (filePath.includes("(public)")) routeGroup = "(public)";
  else if (filePath.includes("(auth)")) routeGroup = "(auth)";
  else if (filePath.includes("demos")) routeGroup = "demos";
  else if (filePath === "src/app/page.tsx") routeGroup = "homepage";

  // Only return if there's something to fix
  if (hasHeaderImport || hasFooterImport || hasHeaderJSX || hasFooterJSX) {
    return {
      path: filePath,
      routeGroup,
      hasHeaderImport,
      hasFooterImport,
      hasHeaderJSX,
      hasFooterJSX,
    };
  }

  return null;
}

// ============================================
// FILE FIXING
// ============================================

function removeImports(content: string): string {
  let newContent = content;

  // Remove Header import
  newContent = newContent.replace(
    /import\s*{\s*Header\s*}\s*from\s*["']@\/components\/layout\/Header["'];?\s*\n?/g,
    "",
  );

  // Remove Footer import
  newContent = newContent.replace(
    /import\s*{\s*Footer\s*}\s*from\s*["']@\/components\/layout\/Footer["'];?\s*\n?/g,
    "",
  );

  return newContent;
}

function removeJSXUsage(content: string): string {
  let newContent = content;

  // Remove standalone Header component
  newContent = newContent.replace(/<Header\s*\/>\s*/g, "");

  // Remove standalone Footer component
  newContent = newContent.replace(/<Footer\s*\/>\s*/g, "");

  // Remove Header within fragments or returns
  newContent = newContent.replace(/\s*<Header\s*\/>\s*\n/g, "\n");
  newContent = newContent.replace(/\s*<Footer\s*\/>\s*\n/g, "\n");

  // Clean up empty fragments
  newContent = newContent.replace(/<>\s*\n\s*<\/>/g, "");

  return newContent;
}

function cleanupWhitespace(content: string): string {
  let newContent = content;

  // Remove multiple consecutive empty lines (more than 2)
  newContent = newContent.replace(/\n\n\n+/g, "\n\n");

  // Clean up spacing around imports
  newContent = newContent.replace(/^(import[^\n]+\n)\n\n/gm, "$1\n");

  // Ensure newline at end of file
  if (!newContent.endsWith("\n")) {
    newContent += "\n";
  }

  return newContent;
}

async function fixFile(fileInfo: FileToFix, dryRun: boolean): Promise<boolean> {
  const fullPath = path.join(process.cwd(), fileInfo.path);

  try {
    // Read original content
    const originalContent = await fs.readFile(fullPath, "utf-8");
    let newContent = originalContent;

    // Remove imports
    if (fileInfo.hasHeaderImport || fileInfo.hasFooterImport) {
      newContent = removeImports(newContent);
    }

    // Remove JSX usage
    if (fileInfo.hasHeaderJSX || fileInfo.hasFooterJSX) {
      newContent = removeJSXUsage(newContent);
    }

    // Clean up whitespace
    newContent = cleanupWhitespace(newContent);

    // Check if anything changed
    if (newContent === originalContent) {
      log.info(`No changes needed: ${fileInfo.path}`);
      return false;
    }

    if (dryRun) {
      log.info(`[DRY RUN] Would fix: ${fileInfo.path}`);
      console.log(`${colors.dim}Changes preview:${colors.reset}`);

      if (fileInfo.hasHeaderImport) {
        console.log(`  ${colors.red}- Remove Header import${colors.reset}`);
      }
      if (fileInfo.hasFooterImport) {
        console.log(`  ${colors.red}- Remove Footer import${colors.reset}`);
      }
      if (fileInfo.hasHeaderJSX) {
        console.log(`  ${colors.red}- Remove <Header /> JSX${colors.reset}`);
      }
      if (fileInfo.hasFooterJSX) {
        console.log(`  ${colors.red}- Remove <Footer /> JSX${colors.reset}`);
      }

      return true;
    }

    // Create backup
    const backupPath = await createBackup(fullPath);
    log.debug(`Backup created: ${backupPath}`);

    // Write fixed content
    await fs.writeFile(fullPath, newContent, "utf-8");
    log.success(`Fixed: ${fileInfo.path}`);

    return true;
  } catch (error: any) {
    log.error(`Failed to fix ${fileInfo.path}: ${error.message}`);
    return false;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--apply");

  console.log(`
${colors.cyan}${colors.bright}╔════════════════════════════════════════════════════════════╗
║        🔧 FIX DUPLICATE HEADER/FOOTER IMPORTS             ║
║          Divine Agricultural Platform Cleanup              ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  if (dryRun) {
    log.warning("DRY RUN MODE - No files will be modified");
    log.info("Run with --apply flag to apply fixes\n");
  } else {
    log.warning("APPLY MODE - Files will be modified (backups created)");
    log.info("Backups will be saved to .import-fix-backups/\n");
  }

  // Analyze all target files
  log.section("📋 Analyzing Files");

  const filesToFix: FileToFix[] = [];

  for (const filePath of TARGET_FILES) {
    const analysis = await analyzeFile(filePath);
    if (analysis) {
      filesToFix.push(analysis);

      const issues: string[] = [];
      if (analysis.hasHeaderImport) issues.push("Header import");
      if (analysis.hasFooterImport) issues.push("Footer import");
      if (analysis.hasHeaderJSX) issues.push("Header JSX");
      if (analysis.hasFooterJSX) issues.push("Footer JSX");

      log.warning(`${filePath}`);
      console.log(
        `  ${colors.dim}Route group: ${analysis.routeGroup}${colors.reset}`,
      );
      console.log(`  ${colors.red}Issues: ${issues.join(", ")}${colors.reset}`);
    }
  }

  if (filesToFix.length === 0) {
    log.success("\n✨ No files need fixing! All imports are clean.");
    return;
  }

  log.section(`🔧 Found ${filesToFix.length} files to fix`);

  // Group by route group
  const byRouteGroup = filesToFix.reduce(
    (acc, file) => {
      if (!acc[file.routeGroup]) acc[file.routeGroup] = [];
      acc[file.routeGroup].push(file);
      return acc;
    },
    {} as Record<string, FileToFix[]>,
  );

  console.log("Files by route group:");
  for (const [group, files] of Object.entries(byRouteGroup)) {
    console.log(
      `  ${colors.cyan}${group}${colors.reset}: ${files.length} file(s)`,
    );
  }

  // Apply fixes
  log.section(dryRun ? "📋 Preview Changes" : "🔧 Applying Fixes");

  let fixedCount = 0;
  let failedCount = 0;

  for (const fileInfo of filesToFix) {
    const success = await fixFile(fileInfo, dryRun);
    if (success) {
      fixedCount++;
    } else {
      failedCount++;
    }
  }

  // Summary
  log.section("📊 Summary");

  console.log(`Total files analyzed: ${TARGET_FILES.length}`);
  console.log(`Files needing fixes: ${filesToFix.length}`);
  console.log(
    `${colors.green}Successfully ${dryRun ? "analyzed" : "fixed"}: ${fixedCount}${colors.reset}`,
  );

  if (failedCount > 0) {
    console.log(`${colors.red}Failed: ${failedCount}${colors.reset}`);
  }

  if (dryRun && fixedCount > 0) {
    log.info("\n💡 Run with --apply flag to apply these fixes");
    log.info("Example: npx tsx scripts/fix-duplicate-imports.ts --apply");
  } else if (!dryRun && fixedCount > 0) {
    log.success("\n✨ Fixes applied successfully!");
    log.info("Backups saved to: .import-fix-backups/");
    log.warning("\n⚠️  Next steps:");
    console.log("  1. Run: npm run type-check");
    console.log("  2. Run: npm run build");
    console.log("  3. Test the affected pages manually");
    console.log("  4. Run: npx tsx scripts/verify-implementation.ts");
  }

  // Special notes
  if (filesToFix.some((f) => f.routeGroup === "homepage")) {
    log.section("📝 Special Note: Homepage");
    log.warning("The homepage (src/app/page.tsx) was modified.");
    log.info(
      "Ensure the root layout (src/app/layout.tsx) includes Header/Footer,",
    );
    log.info("or the homepage may need special handling.");
  }

  if (filesToFix.some((f) => f.routeGroup === "demos")) {
    log.section("📝 Special Note: Demo Pages");
    log.warning("Demo pages were modified. Consider:");
    log.info("1. Moving demos to (monitoring) route group");
    log.info("2. Creating a dedicated (demos) route group with layout");
  }

  const orphanedFiles = filesToFix.filter((f) =>
    f.path.includes("account/notifications"),
  );

  if (orphanedFiles.length > 0) {
    log.section("📝 Special Note: Orphaned Pages");
    log.warning("Found pages outside route groups:");
    orphanedFiles.forEach((f) => console.log(`  - ${f.path}`));
    log.info("\nRecommendation:");
    log.info(
      "Move src/app/account/notifications to src/app/(customer)/account/notifications",
    );
  }

  process.exit(failedCount > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

export { main };
