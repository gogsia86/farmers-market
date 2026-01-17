#!/usr/bin/env tsx
/**
 * Automated jsdom Environment Fixer
 *
 * This script automatically adds the jsdom test environment directive
 * to test files that use React Testing Library but are missing it.
 *
 * Usage:
 *   npx tsx scripts/fix-jsdom-tests.ts [--dry-run] [--pattern=<glob>]
 *
 * Examples:
 *   npx tsx scripts/fix-jsdom-tests.ts --dry-run
 *   npx tsx scripts/fix-jsdom-tests.ts --pattern="src/stores/**"
 *   npx tsx scripts/fix-jsdom-tests.ts
 */

import * as fs from "fs";
import * as path from "path";

interface FixResult {
  file: string;
  action: "fixed" | "skipped" | "error";
  reason: string;
}

const JSDOM_DIRECTIVE = `/**
 * @jest-environment jsdom
 */

`;

const INDICATORS = [
  "@testing-library/react",
  "renderHook",
  "render(",
  "screen.",
  "fireEvent",
  "waitFor",
  "userEvent",
  "act(",
  "document.",
  "window.",
  "localStorage",
  "sessionStorage",
  "navigator.",
];

function needsJsdom(content: string): boolean {
  // Skip if already has jsdom directive
  if (content.includes("@jest-environment jsdom")) {
    return false;
  }

  // Check for indicators that suggest React/DOM testing
  return INDICATORS.some((indicator) => content.includes(indicator));
}

function hasJsdomDirective(content: string): boolean {
  return content.includes("@jest-environment jsdom");
}

function addJsdomDirective(content: string): string {
  // Remove any existing shebang or comments at the top temporarily
  const lines = content.split("\n");
  let insertIndex = 0;

  // Skip past any leading blank lines
  while (insertIndex < lines.length && lines[insertIndex].trim() === "") {
    insertIndex++;
  }

  // If first non-blank line is a comment, add after it
  if (
    insertIndex < lines.length &&
    lines[insertIndex].trim().startsWith("//")
  ) {
    insertIndex++;
  }

  // Insert the directive
  const before = lines.slice(0, insertIndex).join("\n");
  const after = lines.slice(insertIndex).join("\n");

  if (before) {
    return `${before}\n${JSDOM_DIRECTIVE}${after}`;
  } else {
    return `${JSDOM_DIRECTIVE}${after}`;
  }
}

function fixTestFile(filePath: string, dryRun: boolean): FixResult {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // Check if already has jsdom
    if (hasJsdomDirective(content)) {
      return {
        file: filePath,
        action: "skipped",
        reason: "Already has jsdom directive",
      };
    }

    // Check if needs jsdom
    if (!needsJsdom(content)) {
      return {
        file: filePath,
        action: "skipped",
        reason: "Does not appear to need jsdom (no React/DOM indicators found)",
      };
    }

    // Add jsdom directive
    const newContent = addJsdomDirective(content);

    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, "utf-8");
    }

    return {
      file: filePath,
      action: "fixed",
      reason: dryRun ? "Would add jsdom directive" : "Added jsdom directive",
    };
  } catch (error) {
    return {
      file: filePath,
      action: "error",
      reason: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function findTestFiles(
  dir: string,
  pattern: RegExp = /\.test\.(ts|tsx)$/,
): string[] {
  const results: string[] = [];

  function walkDir(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .next, dist
        if (!["node_modules", ".next", "dist", ".git"].includes(entry.name)) {
          walkDir(fullPath);
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const patternArg = args.find((arg) => arg.startsWith("--pattern="));
  const baseDir = patternArg ? patternArg.split("=")[1] : "src";

  console.log("🔍 Searching for test files that need jsdom...\n");
  console.log(`Base directory: ${baseDir}`);
  console.log(
    `Mode: ${dryRun ? "DRY RUN (no files will be modified)" : "LIVE (files will be modified)"}\n`,
  );

  // Find all test files
  const srcPath = path.join(process.cwd(), baseDir);
  if (!fs.existsSync(srcPath)) {
    console.error(`Error: Directory ${srcPath} does not exist`);
    return;
  }

  const testFiles = findTestFiles(srcPath);

  console.log(`Found ${testFiles.length} test files\n`);

  if (testFiles.length === 0) {
    console.log("No test files found. Exiting.");
    return;
  }

  // Process each file
  const results: FixResult[] = [];

  for (const file of testFiles) {
    const result = fixTestFile(file, dryRun);
    results.push(result);
  }

  // Print results
  console.log("=".repeat(80));
  console.log("RESULTS");
  console.log("=".repeat(80));
  console.log();

  const fixed = results.filter((r) => r.action === "fixed");
  const skipped = results.filter((r) => r.action === "skipped");
  const errors = results.filter((r) => r.action === "error");

  console.log(`✅ Fixed: ${fixed.length}`);
  console.log(`⏭️  Skipped: ${skipped.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log();

  if (fixed.length > 0) {
    console.log("Files Fixed:");
    console.log("-".repeat(80));
    for (const result of fixed) {
      const relativePath = path.relative(process.cwd(), result.file);
      console.log(`  ✅ ${relativePath}`);
    }
    console.log();
  }

  if (errors.length > 0) {
    console.log("Errors:");
    console.log("-".repeat(80));
    for (const result of errors) {
      const relativePath = path.relative(process.cwd(), result.file);
      console.log(`  ❌ ${relativePath}`);
      console.log(`     Reason: ${result.reason}`);
    }
    console.log();
  }

  if (dryRun && fixed.length > 0) {
    console.log("=".repeat(80));
    console.log("This was a DRY RUN. No files were actually modified.");
    console.log("Run without --dry-run to apply changes:");
    console.log(`  npx tsx scripts/fix-jsdom-tests.ts`);
    console.log("=".repeat(80));
  } else if (!dryRun && fixed.length > 0) {
    console.log("=".repeat(80));
    console.log("✨ Done! Files have been modified.");
    console.log("Run tests to verify:");
    console.log("  npm run test:unit");
    console.log("=".repeat(80));
  }

  // Summary stats
  console.log();
  console.log("Summary:");
  console.log(`  Total files scanned: ${testFiles.length}`);
  console.log(`  Files fixed: ${fixed.length}`);
  console.log(`  Files skipped: ${skipped.length}`);
  console.log(`  Errors: ${errors.length}`);
  console.log();

  if (skipped.length > 0 && args.includes("--verbose")) {
    console.log("Skipped files:");
    console.log("-".repeat(80));
    for (const result of skipped) {
      const relativePath = path.relative(process.cwd(), result.file);
      console.log(`  ⏭️  ${relativePath}`);
      console.log(`     Reason: ${result.reason}`);
    }
    console.log();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
