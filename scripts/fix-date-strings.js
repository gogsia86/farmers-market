/**
 * 🔧 Date to String Fix Script
 *
 * Fixes Date assignments where strings are expected.
 * Changes: timestamp: new Date()
 * To:      timestamp: new Date().toISOString()
 *
 * Usage: node scripts/fix-date-strings.js
 */

const fs = require("fs");
const path = require("path");

// Files to process
const FILES_TO_FIX = [
  "src/lib/services/farm.service.ts",
  "src/lib/services/order.service.ts",
  "src/lib/services/product.service.ts",
  "src/lib/controllers/farm.controller.ts",
  "src/lib/controllers/order.controller.ts",
  "src/lib/controllers/product.controller.ts",
];

let totalFixesApplied = 0;

function fixDateAssignments(content) {
  let fixedContent = content;
  let fixCount = 0;

  // Pattern 1: timestamp: new Date() in error objects
  // timestamp: new Date()
  // timestamp: new Date(),
  const timestampPattern = /timestamp:\s*new Date\(\)/g;

  fixedContent = fixedContent.replace(timestampPattern, (match) => {
    fixCount++;
    return "timestamp: new Date().toISOString()";
  });

  // Pattern 2: createdAt/updatedAt in ServiceResponse
  // createdAt: new Date()
  // updatedAt: new Date()
  const auditFieldPattern = /(createdAt|updatedAt):\s*new Date\(\)/g;

  fixedContent = fixedContent.replace(auditFieldPattern, (match, field) => {
    fixCount++;
    return `${field}: new Date().toISOString()`;
  });

  // Pattern 3: Date fields in metadata
  // processedAt: new Date()
  // completedAt: new Date()
  const metadataDatePattern =
    /(processedAt|completedAt|verifiedAt|approvedAt|rejectedAt|cancelledAt):\s*new Date\(\)/g;

  fixedContent = fixedContent.replace(metadataDatePattern, (match, field) => {
    fixCount++;
    return `${field}: new Date().toISOString()`;
  });

  // Pattern 4: Generic date assignments in objects
  // someDate: new Date()
  // But be careful not to match database operations which need Date objects
  // Only match in error responses, metadata, and ServiceResponse contexts

  // Pattern 5: Inline date in return statements
  // return { ..., date: new Date() }
  const inlineReturnDatePattern = /,\s*(\w+):\s*new Date\(\)\s*}/g;

  // This is tricky - we need to check context
  // For now, let's be conservative and only fix known patterns

  // Pattern 6: Date assignments in details/meta objects
  // details: { ..., timestamp: new Date() }
  const detailsTimestampPattern =
    /(details|meta|metadata):\s*\{[^}]*timestamp:\s*new Date\(\)/g;

  // This requires more complex matching, so we'll do line-by-line

  return { content: fixedContent, fixCount };
}

function fixDateAssignmentsAdvanced(content) {
  const lines = content.split("\n");
  let fixCount = 0;
  let inErrorBlock = false;
  const inDetailsBlock = false;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track if we're in an error/response block
    if (
      trimmed.includes("return this.error(") ||
      trimmed.includes("ServiceResponse.failure") ||
      trimmed.includes("error: {") ||
      trimmed.includes("details: {") ||
      trimmed.includes("meta: {")
    ) {
      inErrorBlock = true;
      braceDepth = 0;
    }

    if (inErrorBlock) {
      // Count braces to track nesting
      braceDepth += (line.match(/\{/g) || []).length;
      braceDepth -= (line.match(/\}/g) || []).length;

      // Fix Date assignments in error blocks
      if (
        /:\s*new Date\(\)/.test(line) &&
        !line.includes("new Date().toISOString()")
      ) {
        // Don't fix database operations
        if (
          !line.includes("database.") &&
          !line.includes("create({") &&
          !line.includes("update({") &&
          !line.includes("upsert({")
        ) {
          lines[i] = line.replace(
            /:\s*new Date\(\)/,
            ": new Date().toISOString()",
          );
          fixCount++;
        }
      }

      // Exit error block when braces are balanced
      if (braceDepth <= 0) {
        inErrorBlock = false;
      }
    }
  }

  return { content: lines.join("\n"), fixCount };
}

function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  console.log(`\n📝 Processing: ${filePath}`);

  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠️  File not found, skipping...`);
    return;
  }

  const originalContent = fs.readFileSync(fullPath, "utf8");

  // Apply basic fixes
  const result = fixDateAssignments(originalContent);
  let content = result.content;
  let fixCount = result.fixCount;

  // Apply advanced fixes
  const advancedResult = fixDateAssignmentsAdvanced(content);
  content = advancedResult.content;
  fixCount += advancedResult.fixCount;

  if (fixCount > 0) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`   ✅ Fixed ${fixCount} Date assignment(s)`);
    totalFixesApplied += fixCount;
  } else {
    console.log(`   ℹ️  No fixes needed`);
  }
}

function main() {
  console.log("🚀 Date to String Fix Script");
  console.log("================================");
  console.log("Fixing Date assignments in service files...\n");

  FILES_TO_FIX.forEach(processFile);

  console.log("\n================================");
  console.log(
    `✨ Complete! Fixed ${totalFixesApplied} Date assignment(s) across ${FILES_TO_FIX.length} file(s)`,
  );
  console.log("\n📋 Next steps:");
  console.log("   1. Review changes with: git diff");
  console.log("   2. Run type check: npm run type-check");
  console.log("   3. Run tests: npm test");
  console.log("   4. Commit changes if successful\n");
}

main();
