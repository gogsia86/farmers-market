#!/usr/bin/env node

/**
 * 🌾 PRODUCT TEST MOCK FIXER - ENHANCED VERSION
 *
 * Automatically fixes product controller test mocks to use ServiceResponse pattern.
 * Converts raw data mocks to { success: true, data: ... } format.
 *
 * Divine Pattern Applied:
 * - ServiceResponse wrapper for all service method returns
 * - Consistent success/error handling
 * - Agricultural consciousness preservation
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 * @reference .github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md
 */

const fs = require("fs");
const path = require("path");

// ============================================
// CONFIGURATION
// ============================================

const TEST_FILE = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "controllers",
  "__tests__",
  "product.controller.test.ts",
);

// ============================================
// MAIN TRANSFORMATION FUNCTION
// ============================================

/**
 * Fix all mock return values to use ServiceResponse pattern
 */
function fixMocks(content) {
  let fixed = content;
  let totalChanges = 0;

  // Pattern 1: Direct product/array returns (single line)
  // (ProductService.method as jest.Mock).mockResolvedValue(product);
  const pattern1 =
    /\(ProductService\.(\w+) as jest\.Mock\)\.mockResolvedValue\(\s*(\w+)\s*\);/g;
  fixed = fixed.replace(pattern1, (match, method, value) => {
    // Skip if value already looks like ServiceResponse
    if (value === "undefined" || value === "null") {
      totalChanges++;
      return `(ProductService.${method} as jest.Mock).mockResolvedValue({\n        success: true,\n        data: ${value},\n      });`;
    }

    // Check if this is a variable holding data
    if (value.match(/^(mock|product|stats|data)/i)) {
      totalChanges++;
      return `(ProductService.${method} as jest.Mock).mockResolvedValue({\n        success: true,\n        data: ${value},\n      });`;
    }

    return match;
  });

  // Pattern 2: Array literal returns
  // (ProductService.method as jest.Mock).mockResolvedValue([...]);
  const pattern2 =
    /\(ProductService\.(\w+) as jest\.Mock\)\.mockResolvedValue\(\s*\[([\s\S]*?)\]\s*\);/g;
  fixed = fixed.replace(pattern2, (match, method, arrayContent) => {
    totalChanges++;
    return `(ProductService.${method} as jest.Mock).mockResolvedValue({\n        success: true,\n        data: [${arrayContent}],\n      });`;
  });

  // Pattern 3: Object literal returns (single line - simple)
  // (ProductService.method as jest.Mock).mockResolvedValue({ key: value });
  const pattern3 =
    /\(ProductService\.(\w+) as jest\.Mock\)\.mockResolvedValue\(\s*\{\s*([^{}]+)\}\s*\);/g;
  fixed = fixed.replace(pattern3, (match, method, objectContent) => {
    // Skip if already has success property
    if (objectContent.includes("success:")) {
      return match;
    }
    totalChanges++;
    return `(ProductService.${method} as jest.Mock).mockResolvedValue({\n        success: true,\n        data: { ${objectContent.trim()} },\n      });`;
  });

  // Pattern 4: Multi-line object returns (complex objects with nested content)
  // (ProductService.method as jest.Mock).mockResolvedValue({
  //   prop: value,
  //   nested: { ... }
  // });
  const pattern4 =
    /\(ProductService\.(\w+) as jest\.Mock\)\.mockResolvedValue\(\s*\{([\s\S]*?)\n\s*\}\s*\);/g;
  fixed = fixed.replace(pattern4, (match, method, objectContent) => {
    // Skip if already has success property
    if (objectContent.includes("success:")) {
      return match;
    }

    // Count braces to ensure we're not breaking nested objects
    const openBraces = (objectContent.match(/\{/g) || []).length;
    const closeBraces = (objectContent.match(/\}/g) || []).length;

    if (openBraces === closeBraces) {
      totalChanges++;
      return `(ProductService.${method} as jest.Mock).mockResolvedValue({\n        success: true,\n        data: {${objectContent}\n        },\n      });`;
    }

    return match;
  });

  // Pattern 5: Paginated responses that need wrapping
  // Look for patterns like { products: [...], pagination: {...} }
  const pattern5 =
    /\(ProductService\.listProducts as jest\.Mock\)\.mockResolvedValue\(\s*\{[\s\S]*?products:\s*\[[\s\S]*?\][\s\S]*?pagination:\s*\{[\s\S]*?\}[\s\S]*?\}\s*\);/g;
  fixed = fixed.replace(pattern5, (match) => {
    // Check if already wrapped
    if (match.includes("success: true") && match.includes("data: {")) {
      return match;
    }

    // Extract the object content
    const contentMatch = match.match(
      /mockResolvedValue\(\s*(\{[\s\S]*\})\s*\);/,
    );
    if (contentMatch) {
      totalChanges++;
      const innerObject = contentMatch[1];
      return match.replace(
        /mockResolvedValue\(\s*\{[\s\S]*\}\s*\);/,
        `mockResolvedValue({\n        success: true,\n        data: ${innerObject},\n      });`,
      );
    }

    return match;
  });

  return { content: fixed, changes: totalChanges };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }
}

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, "utf-8");
  } catch (error) {
    console.error(`❌ Error writing file: ${error.message}`);
    process.exit(1);
  }
}

function createBackup(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${filePath}.backup-${timestamp}`;
  try {
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Created backup: ${path.basename(backupPath)}`);
    return backupPath;
  } catch (error) {
    console.error(`❌ Error creating backup: ${error.message}`);
    process.exit(1);
  }
}

function analyzeRemainingIssues(content) {
  const issues = [];

  // Check for mockResolvedValue without { success:
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    if (
      line.includes("mockResolvedValue(") &&
      line.includes("ProductService") &&
      !line.includes("success:") &&
      !line.includes("mockResolvedValue({")
    ) {
      // Check if next few lines have success property
      const nextLines = lines.slice(index, index + 5).join(" ");
      if (!nextLines.includes("success:")) {
        issues.push({
          line: index + 1,
          content: line.trim(),
        });
      }
    }
  });

  return issues;
}

// ============================================
// MAIN EXECUTION
// ============================================

function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║ 🌾 PRODUCT TEST MOCK FIXER - ENHANCED                     ║");
  console.log("║    ServiceResponse Pattern Automation v2.0                ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  // Check if file exists
  if (!fs.existsSync(TEST_FILE)) {
    console.error(`❌ Test file not found: ${TEST_FILE}`);
    process.exit(1);
  }

  console.log(`📁 Target: ${path.relative(process.cwd(), TEST_FILE)}\n`);

  // Create backup
  const backupPath = createBackup(TEST_FILE);

  // Read and analyze
  const originalContent = readFile(TEST_FILE);
  console.log(`📊 Original size: ${originalContent.length} bytes\n`);

  // Apply fixes
  console.log("🔄 Applying transformations...\n");
  const { content: fixedContent, changes } = fixMocks(originalContent);

  if (changes > 0) {
    writeFile(TEST_FILE, fixedContent);
    console.log(`✅ Applied ${changes} transformations\n`);
    console.log(`📊 New size: ${fixedContent.length} bytes\n`);
  } else {
    console.log("✓ No changes needed\n");
  }

  // Analyze remaining issues
  console.log("🔍 Analyzing remaining issues...\n");
  const remainingIssues = analyzeRemainingIssues(fixedContent);

  if (remainingIssues.length > 0) {
    console.log("⚠️  Manual review needed for these lines:\n");
    remainingIssues.slice(0, 10).forEach((issue) => {
      console.log(`   Line ${issue.line}: ${issue.content}`);
    });
    if (remainingIssues.length > 10) {
      console.log(`   ... and ${remainingIssues.length - 10} more\n`);
    }
  } else {
    console.log("✅ All mocks appear to be in correct format\n");
  }

  // Summary
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║ 📊 SUMMARY                                                 ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(`║ Transformations:     ${changes.toString().padEnd(36)} ║`);
  console.log(
    `║ Remaining Issues:    ${remainingIssues.length.toString().padEnd(36)} ║`,
  );
  console.log(
    `║ Backup:              ${path.basename(backupPath).substring(0, 36).padEnd(36)} ║`,
  );
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  console.log("🎯 Next Steps:");
  console.log(
    "   1. Review: git diff src/lib/controllers/__tests__/product.controller.test.ts",
  );
  console.log(
    '   2. Test: npm test -- --testPathPatterns="product.controller"',
  );
  console.log("   3. Manual fixes: Review lines flagged above if any\n");

  console.log("✨ Automation complete!\n");
}

if (require.main === module) {
  main();
}

module.exports = { fixMocks, analyzeRemainingIssues };
