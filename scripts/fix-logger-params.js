/**
 * 🔧 Logger Parameter Fix Script
 *
 * Fixes swapped logger parameters across all service files.
 * Changes: logger.debug({ context }, "message")
 * To:      logger.debug("message", { context })
 *
 * Usage: node scripts/fix-logger-params.js
 */

const fs = require("fs");
const path = require("path");

// Files to process
const FILES_TO_FIX = [
  "src/lib/services/cart.service.ts",
  "src/lib/services/farm.service.ts",
  "src/lib/services/order.service.ts",
  "src/lib/services/product.service.ts",
  "src/lib/controllers/cart.controller.ts",
  "src/lib/controllers/farm.controller.ts",
  "src/lib/controllers/order.controller.ts",
  "src/lib/controllers/product.controller.ts",
];

let totalFixesApplied = 0;

function fixLoggerCalls(content) {
  let fixedContent = content;
  let fixCount = 0;

  // Pattern 1: Single-line logger calls with swapped params
  // this.logger.debug({ context }, "message");
  // this.logger.debug({ context }, "message",);
  const singleLinePattern =
    /this\.logger\.(debug|info|warn)\(\s*\{([^}]+)\},\s*"([^"]+)",?\s*\);/g;

  fixedContent = fixedContent.replace(
    singleLinePattern,
    (match, level, context, message) => {
      fixCount++;
      return `this.logger.${level}("${message}", { ${context} });`;
    },
  );

  // Pattern 2: Multi-line logger calls (opening brace on same line)
  // this.logger.debug(
  //   { context },
  //   "message"
  // );
  const multiLinePattern1 =
    /this\.logger\.(debug|info|warn)\(\s*\n\s*\{([^}]+)\},\s*\n\s*"([^"]+)",?\s*\n\s*\);/g;

  fixedContent = fixedContent.replace(
    multiLinePattern1,
    (match, level, context, message) => {
      fixCount++;
      return `this.logger.${level}(\n          "${message}",\n          { ${context} },\n        );`;
    },
  );

  // Pattern 3: Multi-line with trailing comma
  // this.logger.debug(
  //   { context },
  //   "message",
  // );
  const multiLinePattern2 =
    /this\.logger\.(debug|info|warn)\(\s*\n\s*\{([^}]+)\},\s*\n\s*"([^"]+)",\s*\n\s*\);/g;

  fixedContent = fixedContent.replace(
    multiLinePattern2,
    (match, level, context, message) => {
      fixCount++;
      return `this.logger.${level}(\n          "${message}",\n          { ${context} },\n        );`;
    },
  );

  // Pattern 4: Compact multi-line
  // this.logger.debug({ context },
  //   "message");
  const compactMultiLinePattern =
    /this\.logger\.(debug|info|warn)\(\{([^}]+)\},\s*\n\s*"([^"]+)"\);/g;

  fixedContent = fixedContent.replace(
    compactMultiLinePattern,
    (match, level, context, message) => {
      fixCount++;
      return `this.logger.${level}("${message}", { ${context} });`;
    },
  );

  // Pattern 5: Logger calls with single quotes
  const singleQuotePattern =
    /this\.logger\.(debug|info|warn)\(\s*\{([^}]+)\},\s*'([^']+)',?\s*\);/g;

  fixedContent = fixedContent.replace(
    singleQuotePattern,
    (match, level, context, message) => {
      fixCount++;
      return `this.logger.${level}("${message}", { ${context} });`;
    },
  );

  // Pattern 6: Error logger calls with swapped params
  // this.logger.error({ error, userId }, "message");
  // Should be: this.logger.error("message", error, { userId });
  const errorPattern =
    /this\.logger\.error\(\s*\{\s*error,\s*([^}]+)\},\s*"([^"]+)",?\s*\);/g;

  fixedContent = fixedContent.replace(
    errorPattern,
    (match, context, message) => {
      fixCount++;
      return `this.logger.error("${message}", error, { ${context} });`;
    },
  );

  // Pattern 7: Multi-line error logger calls
  // this.logger.error(
  //   { error, userId },
  //   "message"
  // );
  const errorMultiLinePattern =
    /this\.logger\.error\(\s*\n?\s*\{\s*error,\s*([^}]+)\},\s*\n?\s*"([^"]+)",?\s*\n?\s*\);/g;

  fixedContent = fixedContent.replace(
    errorMultiLinePattern,
    (match, context, message) => {
      fixCount++;
      return `this.logger.error("${message}", error, { ${context} });`;
    },
  );

  return { content: fixedContent, fixCount };
}

function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  console.log(`\n📝 Processing: ${filePath}`);

  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠️  File not found, skipping...`);
    return;
  }

  const originalContent = fs.readFileSync(fullPath, "utf8");
  const { content: fixedContent, fixCount } = fixLoggerCalls(originalContent);

  if (fixCount > 0) {
    fs.writeFileSync(fullPath, fixedContent, "utf8");
    console.log(`   ✅ Fixed ${fixCount} logger call(s)`);
    totalFixesApplied += fixCount;
  } else {
    console.log(`   ℹ️  No fixes needed`);
  }
}

function main() {
  console.log("🚀 Logger Parameter Fix Script");
  console.log("================================");
  console.log("Fixing swapped logger parameters in service files...\n");

  FILES_TO_FIX.forEach(processFile);

  console.log("\n================================");
  console.log(
    `✨ Complete! Fixed ${totalFixesApplied} logger call(s) across ${FILES_TO_FIX.length} file(s)`,
  );
  console.log("\n📋 Next steps:");
  console.log("   1. Review changes with: git diff");
  console.log("   2. Run type check: npm run type-check");
  console.log("   3. Run tests: npm test");
  console.log("   4. Commit changes if successful\n");
}

main();
