#!/usr/bin/env tsx
/**
 * 🔧 E2E Test Simple Fix Script
 * Safe string-based replacements for E2E test files
 *
 * This version uses simple string replacements to avoid regex issues
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const TESTS_DIR = path.join(process.cwd(), "tests", "e2e");
const DRY_RUN = process.argv.includes("--dry-run");

interface Replacement {
  from: string;
  to: string;
  description: string;
}

const REPLACEMENTS: Replacement[] = [
  // Test credential replacements
  {
    from: '"test.customer@example.com"',
    to: 'TEST_USERS.customer.email',
    description: "Replace test.customer@example.com with TEST_USERS",
  },
  {
    from: "'test.customer@example.com'",
    to: 'TEST_USERS.customer.email',
    description: "Replace test.customer@example.com with TEST_USERS (single quotes)",
  },
  {
    from: '"TestPass123!"',
    to: 'TEST_USERS.customer.password',
    description: "Replace TestPass123! with TEST_USERS",
  },
  {
    from: "'TestPass123!'",
    to: 'TEST_USERS.customer.password',
    description: "Replace TestPass123! with TEST_USERS (single quotes)",
  },
];

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  🔧 E2E Test Simple Fix Script                            ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║  Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}                                          ║`);
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Find all test files
  const pattern = path.join(TESTS_DIR, "**", "*.spec.ts").replace(/\\/g, "/");
  const testFiles = await glob(pattern);

  console.log(`✅ Found ${testFiles.length} test files\n`);

  let totalModified = 0;
  let totalReplacements = 0;

  for (const filePath of testFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    let content = fs.readFileSync(filePath, "utf-8");
    let fileModified = false;
    let fileReplacements = 0;

    // Check if file needs TEST_USERS import
    const needsImport = content.includes("TEST_USERS") &&
                       !content.includes('from "../helpers/auth"') &&
                       !content.includes("from '../helpers/auth'");

    // Apply replacements
    for (const replacement of REPLACEMENTS) {
      if (content.includes(replacement.from)) {
        const count = (content.match(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        content = content.split(replacement.from).join(replacement.to);
        fileReplacements += count;
        fileModified = true;
      }
    }

    // Add TEST_USERS import if needed
    if (needsImport) {
      const importLine = 'import { TEST_USERS } from "../helpers/auth";\n';

      // Find the first import statement
      const importMatch = content.match(/^import .+ from .+;$/m);
      if (importMatch && importMatch.index !== undefined) {
        const insertPosition = importMatch.index + importMatch[0].length + 1;
        content = content.slice(0, insertPosition) + importLine + content.slice(insertPosition);
        fileReplacements++;
        fileModified = true;
      }
    }

    // Add network waits after page.goto() where missing
    const gotoMatches = content.match(/await page\.goto\([^)]+\);/g);
    if (gotoMatches) {
      for (const gotoStatement of gotoMatches) {
        const gotoIndex = content.indexOf(gotoStatement);
        const nextLineStart = content.indexOf('\n', gotoIndex);
        if (nextLineStart !== -1) {
          const nextLine = content.slice(nextLineStart + 1, content.indexOf('\n', nextLineStart + 1));
          if (!nextLine.includes('waitForLoadState')) {
            const waitStatement = '\n    await page.waitForLoadState("networkidle");';
            content = content.slice(0, nextLineStart) + waitStatement + content.slice(nextLineStart);
            fileReplacements++;
            fileModified = true;
          }
        }
      }
    }

    // Write file if modified
    if (fileModified) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, "utf-8");
      }
      totalModified++;
      totalReplacements += fileReplacements;
      console.log(`✅ ${relativePath} (${fileReplacements} fixes)`);
    }
  }

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  📊 Summary                                                ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║  Files Modified: ${totalModified.toString().padEnd(44)} ║`);
  console.log(`║  Total Replacements: ${totalReplacements.toString().padEnd(40)} ║`);
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  if (DRY_RUN) {
    console.log("⚠️  DRY RUN - No files were modified");
    console.log("Run without --dry-run to apply changes\n");
  } else {
    console.log("✅ All fixes applied!");
    console.log("\nNext steps:");
    console.log("1. Review: git diff tests/");
    console.log("2. Test: npx playwright test");
    console.log("3. Commit: git commit -m 'fix(tests): standardize test credentials'\n");
  }
}

main().catch(console.error);
