#!/usr/bin/env tsx
/**
 * 🔍 DIVINE ERROR DETECTION SUITE
 * Comprehensive error detection for Farmers Market Platform
 *
 * Detects:
 * - Duplicate files and services
 * - Import conflicts and inconsistencies
 * - Type definition conflicts
 * - API endpoint inconsistencies
 * - Service duplications
 * - Build and TypeScript errors
 * - Missing canonical imports
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ErrorReport {
  duplicateFiles: DuplicateFile[];
  importConflicts: ImportConflict[];
  typeConflicts: TypeConflict[];
  apiInconsistencies: APIInconsistency[];
  serviceDuplications: ServiceDuplication[];
  buildErrors: string[];
  canonicalImportViolations: CanonicalImportViolation[];
  missingExports: MissingExport[];
}

interface DuplicateFile {
  file1: string;
  file2: string;
  hash: string;
  similarity: number;
}

interface ImportConflict {
  file: string;
  module: string;
  imports: string[];
  recommendation: string;
}

interface TypeConflict {
  type: string;
  definitions: Array<{
    file: string;
    definition: string;
    line?: number;
  }>;
}

interface APIInconsistency {
  endpoint: string;
  issue: string;
  severity: "error" | "warning";
  expectedService?: string;
  files?: string[];
}

interface ServiceDuplication {
  service: string;
  files: string[];
  recommendation: string;
}

interface CanonicalImportViolation {
  file: string;
  module: string;
  currentImport: string;
  recommendedImport: string;
}

interface MissingExport {
  file: string;
  missingExport: string;
  suggestion: string;
}

class ErrorDetector {
  private rootDir = path.join(__dirname, "..");
  private errors: ErrorReport = {
    duplicateFiles: [],
    importConflicts: [],
    typeConflicts: [],
    apiInconsistencies: [],
    serviceDuplications: [],
    buildErrors: [],
    canonicalImportViolations: [],
    missingExports: [],
  };

  async detectAll(): Promise<void> {
    console.log("🔍 FARMERS MARKET PLATFORM - ERROR DETECTION");
    console.log("=".repeat(80));
    console.log(`Project Root: ${this.rootDir}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log("=".repeat(80));

    await this.detectDuplicateFiles();
    await this.detectImportConflicts();
    await this.detectTypeConflicts();
    await this.detectAPIInconsistencies();
    await this.detectServiceDuplications();
    await this.detectCanonicalImportViolations();
    await this.detectMissingExports();
    await this.detectBuildErrors();

    this.generateErrorReport();
    this.generateFixCommands();
    this.saveErrorReport();
  }

  // SECTION 1: DUPLICATE FILES DETECTION
  async detectDuplicateFiles(): Promise<void> {
    console.log("\n1. 🔎 Checking for duplicate files...");

    const files = this.getAllSourceFiles();
    const fileHashes = new Map<string, string>();
    const contentMap = new Map<string, string>();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf8");
        const hash = this.calculateHash(content);

        if (fileHashes.has(hash)) {
          const duplicate = fileHashes.get(hash)!;
          const similarity = this.calculateSimilarity(
            content,
            fs.readFileSync(duplicate, "utf8"),
          );

          this.errors.duplicateFiles.push({
            file1: path.relative(this.rootDir, duplicate),
            file2: path.relative(this.rootDir, file),
            hash,
            similarity,
          });
        } else {
          fileHashes.set(hash, file);
          contentMap.set(file, content);
        }
      } catch (err) {
        // Skip unreadable files
      }
    }

    console.log(
      `   Found ${this.errors.duplicateFiles.length} duplicate file pairs`,
    );
  }

  // SECTION 2: IMPORT CONFLICTS DETECTION
  async detectImportConflicts(): Promise<void> {
    console.log("\n2. 🔗 Checking import conflicts...");

    const sourceFiles = this.getAllSourceFiles();
    const importPatterns = {
      database: {
        patterns: ["from.*database", "import.*database"],
        canonical: "@/lib/database",
      },
      email: {
        patterns: ["from.*email", "import.*email"],
        canonical: "@/lib/email/email.service",
      },
      geocoding: {
        patterns: ["from.*geocoding", "import.*geocoding"],
        canonical: "@/lib/services",
      },
      auth: {
        patterns: ["from.*auth", "import.*auth"],
        canonical: "@/lib/auth",
      },
    };

    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, "utf8");
        const lines = content.split("\n");

        Object.entries(importPatterns).forEach(([module, config]) => {
          const foundImports: string[] = [];

          lines.forEach((line, index) => {
            config.patterns.forEach((pattern) => {
              const regex = new RegExp(pattern, "i");
              if (regex.test(line)) {
                foundImports.push(line.trim());
              }
            });
          });

          // Check for inconsistent imports
          const uniquePaths = [
            ...new Set(
              foundImports.map((imp) => {
                const match = imp.match(/from\s+['"]([^'"]+)['"]/);
                return match ? match[1] : "";
              }),
            ),
          ].filter(Boolean);

          if (
            uniquePaths.length > 1 ||
            (uniquePaths.length === 1 &&
              !uniquePaths[0].includes(config.canonical))
          ) {
            const hasCanonical = uniquePaths.some((p) =>
              p.includes(config.canonical),
            );
            if (!hasCanonical) {
              this.errors.importConflicts.push({
                file: path.relative(this.rootDir, file),
                module,
                imports: uniquePaths,
                recommendation: `Use canonical import: ${config.canonical}`,
              });
            }
          }
        });
      } catch (err) {
        // Skip unreadable files
      }
    }

    console.log(
      `   Found ${this.errors.importConflicts.length} import conflicts`,
    );
  }

  // SECTION 3: TYPE CONFLICTS DETECTION
  async detectTypeConflicts(): Promise<void> {
    console.log("\n3. 📐 Checking type conflicts...");

    const commonTypes = [
      "User",
      "Product",
      "Order",
      "Farm",
      "Farmer",
      "Cart",
      "Address",
      "GeoCoordinates",
      "EmailOptions",
      "SendEmailOptions",
    ];

    for (const typeName of commonTypes) {
      try {
        const srcPath = path.join(this.rootDir, "src");
        const files = this.findFiles(srcPath, ".ts");
        const definitions: Array<{
          file: string;
          definition: string;
          line?: number;
        }> = [];

        for (const file of files) {
          const content = fs.readFileSync(file, "utf8");
          const lines = content.split("\n");

          lines.forEach((line, index) => {
            const typeRegex = new RegExp(
              `(type|interface|class)\\s+${typeName}\\b`,
              "i",
            );
            if (typeRegex.test(line)) {
              definitions.push({
                file: path.relative(this.rootDir, file),
                definition: line.trim(),
                line: index + 1,
              });
            }
          });
        }

        if (definitions.length > 1) {
          this.errors.typeConflicts.push({
            type: typeName,
            definitions,
          });
        }
      } catch (err) {
        // Type not found or error reading files
      }
    }

    console.log(`   Found ${this.errors.typeConflicts.length} type conflicts`);
  }

  // SECTION 4: API INCONSISTENCIES DETECTION
  async detectAPIInconsistencies(): Promise<void> {
    console.log("\n4. 🔌 Checking API inconsistencies...");

    const apiDir = path.join(this.rootDir, "src/app/api");
    if (!fs.existsSync(apiDir)) {
      console.log("   ⚠️  API directory not found");
      return;
    }

    const apiEndpoints = fs
      .readdirSync(apiDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const endpoint of apiEndpoints) {
      const endpointPath = path.join(apiDir, endpoint);
      const routeFiles = this.findFiles(endpointPath, "route.ts");

      // Check for route.ts file
      if (routeFiles.length === 0) {
        this.errors.apiInconsistencies.push({
          endpoint,
          issue: "No route.ts file found",
          severity: "warning",
        });
      } else if (routeFiles.length > 1) {
        this.errors.apiInconsistencies.push({
          endpoint,
          issue: "Multiple route.ts files found",
          severity: "error",
          files: routeFiles.map((f) => path.relative(this.rootDir, f)),
        });
      }

      // Check for corresponding service
      const serviceName = endpoint.replace(/s$/, "");
      const servicePath = path.join(
        this.rootDir,
        "src/lib/services",
        `${serviceName}.service.ts`,
      );

      if (!fs.existsSync(servicePath)) {
        this.errors.apiInconsistencies.push({
          endpoint,
          issue: "No corresponding service found",
          severity: "warning",
          expectedService: path.relative(this.rootDir, servicePath),
        });
      }
    }

    console.log(
      `   Found ${this.errors.apiInconsistencies.length} API inconsistencies`,
    );
  }

  // SECTION 5: SERVICE DUPLICATIONS DETECTION
  async detectServiceDuplications(): Promise<void> {
    console.log("\n5. ⚙️  Checking service duplications...");

    const serviceDir = path.join(this.rootDir, "src/lib/services");
    if (!fs.existsSync(serviceDir)) {
      console.log("   ⚠️  Services directory not found");
      return;
    }

    const serviceFiles = this.findFiles(serviceDir, ".service.ts");

    // Group by base name
    const serviceGroups: Record<string, string[]> = {};
    serviceFiles.forEach((file) => {
      const baseName = path
        .basename(file)
        .replace(".service.ts", "")
        .replace(".service.js", "")
        .toLowerCase();

      if (!serviceGroups[baseName]) {
        serviceGroups[baseName] = [];
      }
      serviceGroups[baseName].push(path.relative(this.rootDir, file));
    });

    // Find duplicates
    Object.entries(serviceGroups).forEach(([baseName, files]) => {
      if (files.length > 1) {
        this.errors.serviceDuplications.push({
          service: baseName,
          files,
          recommendation: `Consolidate into single service: src/lib/services/${baseName}.service.ts`,
        });
      }
    });

    // Check for similar service names
    const serviceNames = Object.keys(serviceGroups);
    for (let i = 0; i < serviceNames.length; i++) {
      for (let j = i + 1; j < serviceNames.length; j++) {
        const name1 = serviceNames[i];
        const name2 = serviceNames[j];
        const similarity = this.calculateStringSimilarity(name1, name2);

        if (similarity > 0.7 && name1 !== name2) {
          this.errors.serviceDuplications.push({
            service: `${name1} / ${name2}`,
            files: [
              ...(serviceGroups[name1] || []),
              ...(serviceGroups[name2] || []),
            ],
            recommendation: `Review if these services should be merged (${(similarity * 100).toFixed(0)}% similar)`,
          });
        }
      }
    }

    console.log(
      `   Found ${this.errors.serviceDuplications.length} service duplication issues`,
    );
  }

  // SECTION 6: CANONICAL IMPORT VIOLATIONS
  async detectCanonicalImportViolations(): Promise<void> {
    console.log("\n6. 📦 Checking canonical import violations...");

    const canonicalPatterns = [
      {
        module: "database",
        wrongPatterns: [/from ['"].*prisma.*['"]/i, /new PrismaClient/i],
        canonical: "@/lib/database",
        exceptions: ["seed", "migration", "prisma.config"],
      },
      {
        module: "auth",
        wrongPatterns: [/from ['"].*next-auth\/.*['"]/i],
        canonical: "@/lib/auth",
        exceptions: ["auth.ts", "auth.config"],
      },
    ];

    const sourceFiles = this.getAllSourceFiles();

    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, "utf8");
        const relativePath = path.relative(this.rootDir, file);

        for (const pattern of canonicalPatterns) {
          // Skip exceptions
          if (pattern.exceptions.some((exc) => relativePath.includes(exc))) {
            continue;
          }

          for (const wrongPattern of pattern.wrongPatterns) {
            if (wrongPattern.test(content)) {
              const matches = content.match(wrongPattern);
              if (matches) {
                this.errors.canonicalImportViolations.push({
                  file: relativePath,
                  module: pattern.module,
                  currentImport: matches[0],
                  recommendedImport: pattern.canonical,
                });
              }
            }
          }
        }
      } catch (err) {
        // Skip unreadable files
      }
    }

    console.log(
      `   Found ${this.errors.canonicalImportViolations.length} canonical import violations`,
    );
  }

  // SECTION 7: MISSING EXPORTS
  async detectMissingExports(): Promise<void> {
    console.log("\n7. 📤 Checking for missing exports...");

    // Check service barrel export
    const servicesIndexPath = path.join(
      this.rootDir,
      "src/lib/services/index.ts",
    );
    if (!fs.existsSync(servicesIndexPath)) {
      this.errors.missingExports.push({
        file: "src/lib/services/index.ts",
        missingExport: "Service barrel export",
        suggestion: "Create index.ts to export all services",
      });
    } else {
      const indexContent = fs.readFileSync(servicesIndexPath, "utf8");
      const serviceDir = path.join(this.rootDir, "src/lib/services");
      const serviceFiles = this.findFiles(serviceDir, ".service.ts").filter(
        (f) => !f.includes("index.ts"),
      );

      for (const serviceFile of serviceFiles) {
        const serviceName = path.basename(serviceFile, ".service.ts");
        const expectedExport = new RegExp(
          `(export.*${serviceName}|from.*${serviceName})`,
          "i",
        );

        if (!expectedExport.test(indexContent)) {
          this.errors.missingExports.push({
            file: path.relative(this.rootDir, servicesIndexPath),
            missingExport: `${serviceName} service`,
            suggestion: `Add: export { ${serviceName}Service } from './${serviceName}.service';`,
          });
        }
      }
    }

    console.log(
      `   Found ${this.errors.missingExports.length} missing exports`,
    );
  }

  // SECTION 8: BUILD ERRORS DETECTION
  async detectBuildErrors(): Promise<void> {
    console.log("\n8. 🔨 Checking build errors...");

    try {
      execSync("npx tsc --noEmit", {
        cwd: this.rootDir,
        encoding: "utf8",
        stdio: "pipe",
      });
      console.log("   ✓ No TypeScript errors found");
    } catch (error: any) {
      const output = error.stdout || error.stderr || "";
      const errorLines = output
        .split("\n")
        .filter((line: string) => line.includes("error TS"));

      this.errors.buildErrors = errorLines.slice(0, 20); // First 20 errors
      console.log(
        `   Found ${errorLines.length} TypeScript errors (showing first 20)`,
      );
    }
  }

  // HELPER METHODS
  private getAllSourceFiles(): string[] {
    const extensions = [".ts", ".tsx"];
    const files: string[] = [];

    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            if (
              !item.includes("node_modules") &&
              !item.includes(".git") &&
              !item.includes(".next") &&
              !item.includes("dist") &&
              !item.includes("coverage")
            ) {
              walk(fullPath);
            }
          } else if (extensions.some((ext) => item.endsWith(ext))) {
            files.push(fullPath);
          }
        } catch (err) {
          // Skip inaccessible files
        }
      }
    };

    walk(path.join(this.rootDir, "src"));
    return files;
  }

  private findFiles(dir: string, pattern: string): string[] {
    if (!fs.existsSync(dir)) return [];

    const files: string[] = [];

    const walk = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!item.includes("node_modules") && !item.includes(".git")) {
            walk(fullPath);
          }
        } else if (item.includes(pattern)) {
          files.push(fullPath);
        }
      }
    };

    walk(dir);
    return files;
  }

  private calculateHash(content: string): string {
    return crypto.createHash("md5").update(content).digest("hex");
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const lines1 = str1.split("\n");
    const lines2 = str2.split("\n");
    const maxLen = Math.max(lines1.length, lines2.length);

    let matches = 0;
    for (let i = 0; i < Math.min(lines1.length, lines2.length); i++) {
      if (lines1[i].trim() === lines2[i].trim()) {
        matches++;
      }
    }

    return matches / maxLen;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
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

    return matrix[str2.length][str1.length];
  }

  // REPORT GENERATION
  private generateErrorReport(): void {
    console.log(`\n${"=".repeat(80)}`);
    console.log("📋 ERROR DETECTION REPORT");
    console.log("=".repeat(80));

    const totalErrors =
      this.errors.duplicateFiles.length +
      this.errors.importConflicts.length +
      this.errors.typeConflicts.length +
      this.errors.apiInconsistencies.filter((i) => i.severity === "error")
        .length +
      this.errors.serviceDuplications.length +
      this.errors.buildErrors.length +
      this.errors.canonicalImportViolations.length;

    const totalWarnings =
      this.errors.apiInconsistencies.filter((i) => i.severity === "warning")
        .length + this.errors.missingExports.length;

    console.log(`\nTotal Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);

    // Duplicate Files
    if (this.errors.duplicateFiles.length > 0) {
      console.log("\n❌ DUPLICATE FILES:");
      this.errors.duplicateFiles.forEach((dup, i) => {
        console.log(
          `  ${i + 1}. Similarity: ${(dup.similarity * 100).toFixed(0)}%`,
        );
        console.log(`     ${dup.file1}`);
        console.log(`     ${dup.file2}`);
      });
    }

    // Import Conflicts
    if (this.errors.importConflicts.length > 0) {
      console.log("\n❌ IMPORT CONFLICTS:");
      this.errors.importConflicts.slice(0, 10).forEach((conflict, i) => {
        console.log(`  ${i + 1}. ${conflict.file}`);
        console.log(`     Module: ${conflict.module}`);
        console.log(`     ${conflict.recommendation}`);
      });
      if (this.errors.importConflicts.length > 10) {
        console.log(
          `  ... and ${this.errors.importConflicts.length - 10} more conflicts`,
        );
      }
    }

    // Type Conflicts
    if (this.errors.typeConflicts.length > 0) {
      console.log("\n❌ TYPE CONFLICTS:");
      this.errors.typeConflicts.forEach((conflict, i) => {
        console.log(
          `  ${i + 1}. Type: ${conflict.type} (${conflict.definitions.length} definitions)`,
        );
        conflict.definitions.slice(0, 3).forEach((def) => {
          console.log(`     ${def.file}:${def.line || "?"}`);
        });
      });
    }

    // API Inconsistencies
    const criticalAPI = this.errors.apiInconsistencies.filter(
      (i) => i.severity === "error",
    );
    if (criticalAPI.length > 0) {
      console.log("\n❌ API INCONSISTENCIES (Critical):");
      criticalAPI.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.endpoint}: ${issue.issue}`);
        if (issue.expectedService) {
          console.log(`     Expected: ${issue.expectedService}`);
        }
      });
    }

    // Service Duplications
    if (this.errors.serviceDuplications.length > 0) {
      console.log("\n❌ SERVICE DUPLICATIONS:");
      this.errors.serviceDuplications.forEach((dup, i) => {
        console.log(`  ${i + 1}. Service: ${dup.service}`);
        console.log(`     Files: ${dup.files.join(", ")}`);
        console.log(`     ${dup.recommendation}`);
      });
    }

    // Canonical Import Violations
    if (this.errors.canonicalImportViolations.length > 0) {
      console.log("\n❌ CANONICAL IMPORT VIOLATIONS:");
      this.errors.canonicalImportViolations
        .slice(0, 5)
        .forEach((violation, i) => {
          console.log(`  ${i + 1}. ${violation.file}`);
          console.log(`     Module: ${violation.module}`);
          console.log(`     Use: ${violation.recommendedImport}`);
        });
      if (this.errors.canonicalImportViolations.length > 5) {
        console.log(
          `  ... and ${this.errors.canonicalImportViolations.length - 5} more violations`,
        );
      }
    }

    // Build Errors
    if (this.errors.buildErrors.length > 0) {
      console.log("\n❌ BUILD ERRORS (First 5):");
      this.errors.buildErrors.slice(0, 5).forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.substring(0, 120)}...`);
      });
      if (this.errors.buildErrors.length > 5) {
        console.log(
          `  ... and ${this.errors.buildErrors.length - 5} more errors`,
        );
      }
    }
  }

  private generateFixCommands(): void {
    console.log(`\n${"=".repeat(80)}`);
    console.log("🔧 RECOMMENDED FIXES");
    console.log("=".repeat(80));

    if (this.errors.duplicateFiles.length > 0) {
      console.log("\n📁 To fix duplicate files:");
      this.errors.duplicateFiles.slice(0, 3).forEach((dup) => {
        console.log("  # Compare files:");
        console.log(`  diff "${dup.file1}" "${dup.file2}"`);
        console.log("  # After review, delete duplicate:");
        console.log(`  rm "${dup.file2}"`);
        console.log("");
      });
    }

    if (this.errors.importConflicts.length > 0) {
      console.log("\n🔗 To fix import conflicts:");
      console.log("  # Run the auto-fix script:");
      console.log("  npm run fix:imports");
      console.log("  # Or manually update imports to use canonical paths");
    }

    if (this.errors.serviceDuplications.length > 0) {
      console.log("\n⚙️  To fix service duplications:");
      console.log("  # Review and merge duplicate services");
      this.errors.serviceDuplications.slice(0, 2).forEach((dup) => {
        console.log(`  # Service: ${dup.service}`);
        console.log(`  # ${dup.recommendation}`);
      });
    }

    if (this.errors.buildErrors.length > 0) {
      console.log("\n🔨 To fix build errors:");
      console.log("  # Run TypeScript in watch mode:");
      console.log("  npx tsc --noEmit --watch");
      console.log("  # Fix errors one by one, starting with the first error");
    }

    console.log("\n📋 Summary Commands:");
    console.log("  npm run validate:platform  # Run full validation");
    console.log("  npm run type-check        # Check TypeScript errors");
    console.log("  npm run lint:fix          # Fix linting issues");
  }

  private saveErrorReport(): void {
    const reportPath = path.join(this.rootDir, "error-detection-report.json");

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors:
          this.errors.duplicateFiles.length +
          this.errors.importConflicts.length +
          this.errors.typeConflicts.length +
          this.errors.apiInconsistencies.filter((i) => i.severity === "error")
            .length +
          this.errors.serviceDuplications.length +
          this.errors.buildErrors.length +
          this.errors.canonicalImportViolations.length,
        totalWarnings:
          this.errors.apiInconsistencies.filter((i) => i.severity === "warning")
            .length + this.errors.missingExports.length,
        byCategory: {
          duplicateFiles: this.errors.duplicateFiles.length,
          importConflicts: this.errors.importConflicts.length,
          typeConflicts: this.errors.typeConflicts.length,
          apiInconsistencies: this.errors.apiInconsistencies.length,
          serviceDuplications: this.errors.serviceDuplications.length,
          buildErrors: this.errors.buildErrors.length,
          canonicalImportViolations:
            this.errors.canonicalImportViolations.length,
          missingExports: this.errors.missingExports.length,
        },
      },
      errors: this.errors,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`\n📄 Full error report saved to: ${reportPath}`);
  }
}

// Main execution
const detector = new ErrorDetector();
detector.detectAll().catch((error) => {
  console.error("❌ Error detection failed:", error);
  process.exit(1);
});
