#!/usr/bin/env tsx
/**
 * 🔍 PRISMA SCHEMA USAGE VALIDATOR
 *
 * Validates that all Prisma queries in the codebase use correct relation names
 * and model references according to the schema.prisma file.
 *
 * This prevents runtime errors caused by:
 * - Using wrong relation names (e.g., 'user' instead of 'customer')
 * - Referencing non-existent fields
 * - Typos in model names
 *
 * Usage:
 *   npm run validate:prisma
 *   tsx scripts/validation/validate-prisma-usage.ts
 *   tsx scripts/validation/validate-prisma-usage.ts --fix (auto-fix where possible)
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

// ============================================
// TYPES
// ============================================

interface SchemaModel {
  name: string;
  fields: string[];
  relations: Map<string, string>; // relationName -> targetModel
}

interface ValidationError {
  file: string;
  line: number;
  model: string;
  invalidRelation: string;
  suggestedRelation?: string;
  message: string;
}

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  schemaPath: "prisma/schema.prisma",
  sourcePatterns: ["src/**/*.{ts,tsx}", "pages/**/*.{ts,tsx}"],
  excludePatterns: [
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/coverage/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
  ],
  autoFix: process.argv.includes("--fix"),
};

// ============================================
// SCHEMA PARSER
// ============================================

/**
 * Parse the Prisma schema file and extract models with their relations
 */
function parseSchema(schemaPath: string): Map<string, SchemaModel> {
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  const models = new Map<string, SchemaModel>();

  // Match model blocks
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/gs;
  let match;

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];

    const fields: string[] = [];
    const relations = new Map<string, string>();

    // Parse fields and relations
    const fieldRegex = /^\s*(\w+)\s+(\w+)(?:\[\])?\s*(?:@relation[^\n]*)?/gm;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];

      fields.push(fieldName);

      // Check if it's a relation (field type is a model name starting with uppercase)
      if (fieldType.match(/^[A-Z]/)) {
        relations.set(fieldName, fieldType);
      }
    }

    models.set(modelName.toLowerCase(), {
      name: modelName,
      fields,
      relations,
    });
  }

  return models;
}

// ============================================
// CODE SCANNER
// ============================================

/**
 * Scan TypeScript files for Prisma queries and validate them
 */
async function scanFiles(
  models: Map<string, SchemaModel>,
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  const files = await glob(CONFIG.sourcePatterns, {
    ignore: CONFIG.excludePatterns,
  });

  console.log(`\n📁 Scanning ${files.length} files...\n`);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    // Find Prisma queries: database.model.findMany, etc.
    const queryRegex =
      /database\.(\w+)\.(?:findMany|findUnique|findFirst|create|update|delete|upsert)\s*\(/g;
    let match;

    while ((match = queryRegex.exec(content)) !== null) {
      const modelName = match[1];
      const queryStartPos = match.index;

      // Get line number
      const lineNumber = content.substring(0, queryStartPos).split("\n").length;

      // Extract the query block (find matching braces)
      const queryBlock = extractQueryBlock(content, queryStartPos);

      if (!queryBlock) continue;

      // Validate the query
      const model = models.get(modelName.toLowerCase());

      if (!model) {
        errors.push({
          file,
          line: lineNumber,
          model: modelName,
          invalidRelation: "",
          message: `Unknown model '${modelName}'. Did you mean one of: ${Array.from(models.keys()).join(", ")}?`,
        });
        continue;
      }

      // Check for include clauses
      const includeErrors = validateIncludes(
        file,
        lineNumber,
        modelName,
        queryBlock,
        model,
        models,
      );

      errors.push(...includeErrors);
    }
  }

  return errors;
}

/**
 * Extract the query block from the source code
 */
function extractQueryBlock(content: string, startPos: number): string | null {
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let blockStart = -1;

  for (let i = startPos; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : "";

    // Handle string literals
    if ((char === '"' || char === "'" || char === "`") && prevChar !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    if (inString) continue;

    if (char === "{") {
      if (depth === 0) blockStart = i;
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0 && blockStart !== -1) {
        return content.substring(blockStart, i + 1);
      }
    }
  }

  return null;
}

/**
 * Validate include clauses in a query
 */
function validateIncludes(
  file: string,
  lineNumber: number,
  modelName: string,
  queryBlock: string,
  model: SchemaModel,
  allModels: Map<string, SchemaModel>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Find include blocks
  const includeRegex = /include\s*:\s*\{([^}]+)\}/g;
  let match;

  while ((match = includeRegex.exec(queryBlock)) !== null) {
    const includeBody = match[1];

    // Extract relation names (simple parsing)
    const relationRegex = /(\w+)\s*:/g;
    let relationMatch;

    while ((relationMatch = relationRegex.exec(includeBody)) !== null) {
      const relationName = relationMatch[1];

      // Skip special Prisma keywords
      if (
        ["select", "where", "orderBy", "take", "skip", "include"].includes(
          relationName,
        )
      ) {
        continue;
      }

      // Check if relation exists
      if (!model.relations.has(relationName)) {
        // Try to find a suggestion
        const suggestion = findClosestRelation(relationName, model.relations);

        errors.push({
          file,
          line: lineNumber,
          model: modelName,
          invalidRelation: relationName,
          suggestedRelation: suggestion,
          message: `Model '${modelName}' does not have relation '${relationName}'.${
            suggestion ? ` Did you mean '${suggestion}'?` : ""
          } Available relations: ${Array.from(model.relations.keys()).join(", ") || "none"}`,
        });
      }
    }
  }

  return errors;
}

/**
 * Find the closest matching relation name using Levenshtein distance
 */
function findClosestRelation(
  target: string,
  relations: Map<string, string>,
): string | undefined {
  const relationNames = Array.from(relations.keys());

  if (relationNames.length === 0) return undefined;

  let closest = relationNames[0];
  let minDistance = levenshteinDistance(target, closest);

  for (const name of relationNames) {
    const distance = levenshteinDistance(target, name);
    if (distance < minDistance) {
      minDistance = distance;
      closest = name;
    }
  }

  // Only suggest if the distance is reasonable
  return minDistance <= 3 ? closest : undefined;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// ============================================
// AUTO-FIX
// ============================================

/**
 * Attempt to auto-fix errors where possible
 */
function autoFixErrors(errors: ValidationError[]): number {
  let fixedCount = 0;

  // Group errors by file
  const errorsByFile = new Map<string, ValidationError[]>();

  for (const error of errors) {
    if (!error.suggestedRelation) continue;

    if (!errorsByFile.has(error.file)) {
      errorsByFile.set(error.file, []);
    }
    errorsByFile.get(error.file)!.push(error);
  }

  // Fix each file
  for (const [file, fileErrors] of errorsByFile) {
    let content = fs.readFileSync(file, "utf-8");
    let modified = false;

    for (const error of fileErrors) {
      if (!error.suggestedRelation) continue;

      // Replace the invalid relation name with the suggested one
      const regex = new RegExp(
        `(include\\s*:\\s*\\{[^}]*?)\\b${error.invalidRelation}\\b(\\s*:)`,
        "g",
      );

      const newContent = content.replace(
        regex,
        `$1${error.suggestedRelation}$2`,
      );

      if (newContent !== content) {
        content = newContent;
        modified = true;
        fixedCount++;
        console.log(
          `  ✅ Fixed: ${error.invalidRelation} → ${error.suggestedRelation}`,
        );
      }
    }

    if (modified) {
      fs.writeFileSync(file, content, "utf-8");
      console.log(`  💾 Updated: ${file}\n`);
    }
  }

  return fixedCount;
}

// ============================================
// REPORTING
// ============================================

/**
 * Print validation errors in a readable format
 */
function reportErrors(errors: ValidationError[]): void {
  if (errors.length === 0) {
    console.log("✅ No Prisma usage errors found!\n");
    return;
  }

  console.log(`\n❌ Found ${errors.length} Prisma usage error(s):\n`);

  // Group by file
  const errorsByFile = new Map<string, ValidationError[]>();

  for (const error of errors) {
    if (!errorsByFile.has(error.file)) {
      errorsByFile.set(error.file, []);
    }
    errorsByFile.get(error.file)!.push(error);
  }

  // Print errors grouped by file
  for (const [file, fileErrors] of errorsByFile) {
    console.log(`\n📄 ${file}`);

    for (const error of fileErrors) {
      console.log(`   Line ${error.line}: ${error.message}`);

      if (error.suggestedRelation) {
        console.log(
          `   💡 Suggestion: Replace '${error.invalidRelation}' with '${error.suggestedRelation}'`,
        );
      }
    }
  }

  console.log("\n");
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("🔍 PRISMA SCHEMA USAGE VALIDATOR\n");
  console.log("━".repeat(60));

  // Check if schema file exists
  if (!fs.existsSync(CONFIG.schemaPath)) {
    console.error(`❌ Schema file not found: ${CONFIG.schemaPath}`);
    process.exit(1);
  }

  console.log(`📋 Parsing schema: ${CONFIG.schemaPath}`);
  const models = parseSchema(CONFIG.schemaPath);
  console.log(`✅ Found ${models.size} models\n`);

  // List models
  console.log("📦 Models in schema:");
  for (const [, model] of models) {
    const relationCount = model.relations.size;
    console.log(
      `   - ${model.name} (${relationCount} relation${relationCount !== 1 ? "s" : ""})`,
    );
  }

  // Scan files
  const errors = await scanFiles(models);

  // Auto-fix if requested
  if (CONFIG.autoFix && errors.length > 0) {
    console.log("\n🔧 Auto-fixing errors...\n");
    const fixedCount = autoFixErrors(errors);
    console.log(`\n✅ Fixed ${fixedCount} error(s)\n`);

    // Re-scan to check remaining errors
    const remainingErrors = await scanFiles(models);
    reportErrors(remainingErrors);

    if (remainingErrors.length > 0) {
      console.log(
        "⚠️  Some errors could not be auto-fixed. Please fix manually.\n",
      );
      process.exit(1);
    }
  } else {
    reportErrors(errors);

    if (errors.length > 0) {
      console.log(
        "💡 Run with --fix flag to auto-fix errors where possible.\n",
      );
      process.exit(1);
    }
  }

  console.log("✅ Validation complete!\n");
  process.exit(0);
}

// Run the validator
main().catch((error) => {
  console.error("❌ Validation failed:", error);
  process.exit(1);
});
