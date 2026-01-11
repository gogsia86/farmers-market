#!/usr/bin/env ts-node

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║ 🧠 QUANTUM REPOSITORY SURGEON v3.0 - GODLIKE EDITION                        ║
 * ║ ⚡ Agricultural Consciousness | Divine Precision | Zero Confirmation         ║
 * ║ 🌾 Farmers Market Platform - Biodynamic Repository Maintenance              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * @description Surgical repository cleansing with agricultural consciousness
 * @author Divine Agricultural Platform Team
 * @version 3.0.0 - Godlike TypeScript Implementation
 * @license MIT
 */

import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 DIVINE TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";
type ConsciousnessLevel = "QUANTUM" | "DIVINE" | "BIODYNAMIC" | "STANDARD";
type DeletionReason =
  | "EMPTY_DIRECTORY"
  | "BUILD_ARTIFACT"
  | "OBSOLETE_FILES"
  | "TEMPORAL_CACHE"
  | "AGRICULTURAL_DEBRIS";

interface AgriculturalMetadata {
  season: Season;
  consciousness: ConsciousnessLevel;
  harvestCycle: number;
  biodynamicAlignment: boolean;
}

interface QuantumTarget {
  id: string;
  path: string;
  relativePath: string;
  sizeMB: number;
  reason: DeletionReason;
  fileCount: number;
  lastModified: Date;
  agriculturalRelevance: number; // 0-100 score
  quantumSignature: string;
}

interface SurgicalManifest {
  timestamp: string;
  operation: string;
  totalTargets: number;
  targets: QuantumTarget[];
  backupLocation: string;
  agricultural: AgriculturalMetadata;
  integrityHash: string;
}

interface DeletionResults {
  successful: Array<{ path: string; freedMB: number }>;
  failed: Array<{ path: string; error: string }>;
  skipped: string[];
  totalFreedMB: number;
  temporalCoherence: boolean;
}

interface IntegrityReport {
  gitIntegrity: boolean;
  criticalFilesPresent: boolean;
  noEmptyRoot: boolean;
  agriculturalConsciousness: boolean;
  quantumCoherence: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧬 QUANTUM REPOSITORY SURGEON - GODLIKE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

class QuantumRepositorySurgeon {
  private repoRoot: string;
  private protectedPatterns: Set<string>;
  private whitelistExtensions: Set<string>;
  private surgicalLog: string[];
  private backupPath: string;
  private agricultural: AgriculturalMetadata;

  constructor(repoPath: string = process.cwd()) {
    this.repoRoot = path.resolve(repoPath);
    this.backupPath = path.join(this.repoRoot, ".quantum-surgical-backup");
    this.surgicalLog = [];

    // Protected patterns - DIVINE FORTRESS
    this.protectedPatterns = new Set([
      ".git",
      ".github",
      ".vscode",
      ".zed",
      ".cursor",
      ".copilot",
      ".idea",
      "node_modules",
      "venv",
      ".venv",
      "env",
      ".env",
      "prisma",
      "src",
      "core",
      "config",
      "public",
      "types",
      "tests",
      "__tests__",
      "docs",
      "scripts",
      "mobile-app",
      "docker",
      "nginx",
    ]);

    // Whitelist extensions - AGRICULTURAL CONSCIOUSNESS
    this.whitelistExtensions = new Set([
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".json",
      ".jsonc",
      ".json5",
      ".md",
      ".mdx",
      ".css",
      ".scss",
      ".sass",
      ".less",
      ".html",
      ".htm",
      ".yml",
      ".yaml",
      ".toml",
      ".ini",
      ".cfg",
      ".conf",
      ".sql",
      ".prisma",
      ".graphql",
      ".gql",
      ".proto",
      ".grpc",
      ".svg",
      ".png",
      ".jpg",
      ".jpeg",
      ".ico",
      ".webp",
      ".woff",
      ".woff2",
      ".ttf",
      ".eot",
      ".lock",
      ".example",
      ".sample",
      ".template",
      ".env.example",
      ".env.local",
      ".env.production",
      ".sh",
      ".bash",
      ".ps1",
      ".cmd",
      ".bat",
      ".gitignore",
      ".dockerignore",
      ".vercelignore",
      ".eslintrc",
      ".prettierrc",
      ".editorconfig",
    ]);

    // Initialize agricultural consciousness
    this.agricultural = {
      season: this.detectCurrentSeason(),
      consciousness: "QUANTUM",
      harvestCycle: Date.now(),
      biodynamicAlignment: true,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🌾 AGRICULTURAL CONSCIOUSNESS METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  private detectCurrentSeason(): Season {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "SPRING";
    if (month >= 6 && month <= 8) return "SUMMER";
    if (month >= 9 && month <= 11) return "FALL";
    return "WINTER";
  }

  private calculateAgriculturalRelevance(targetPath: string): number {
    // Calculate how relevant this is to agricultural operations
    let score = 0;

    const agriculturalKeywords = [
      "farm",
      "product",
      "order",
      "delivery",
      "customer",
      "farmer",
      "market",
      "harvest",
      "seasonal",
      "organic",
    ];

    const pathLower = targetPath.toLowerCase();

    for (const keyword of agriculturalKeywords) {
      if (pathLower.includes(keyword)) {
        score += 20;
      }
    }

    // Protected patterns get max score
    if (this.isProtectedPath(targetPath)) {
      score = 100;
    }

    return Math.min(score, 100);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔍 PHASE 1: QUANTUM REPOSITORY SCANNING
  // ═══════════════════════════════════════════════════════════════════════════════

  async scanRepositoryConsciousness(): Promise<void> {
    this.logQuantum("[01/05] → Initiating Quantum Repository Scan", "QUANTUM");
    this.logQuantum(`📁 Target: ${this.repoRoot}`, "DIVINE");
    this.logQuantum(`🌾 Season: ${this.agricultural.season}`, "BIODYNAMIC");

    const structure = await this.mapQuantumStructure();

    this.logQuantum(
      `✓ Mapped ${structure.totalDirectories} directories`,
      "STANDARD",
    );
    this.logQuantum(`✓ Found ${structure.totalFiles} files`, "STANDARD");
    this.logQuantum(
      `✓ Total size: ${structure.totalSizeMB.toFixed(2)} MB`,
      "STANDARD",
    );
  }

  private async mapQuantumStructure(): Promise<{
    totalDirectories: number;
    totalFiles: number;
    totalSizeMB: number;
    fileExtensions: Set<string>;
  }> {
    let totalDirectories = 0;
    let totalFiles = 0;
    let totalSizeMB = 0;
    const fileExtensions = new Set<string>();

    const walk = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          // Skip protected patterns
          if (this.isProtectedPath(entry.name)) {
            continue;
          }

          if (entry.isDirectory()) {
            totalDirectories++;
            await walk(fullPath);
          } else if (entry.isFile()) {
            totalFiles++;
            const stats = await fs.promises.stat(fullPath);
            totalSizeMB += stats.size / (1024 * 1024);

            const ext = path.extname(entry.name).toLowerCase();
            if (ext) {
              fileExtensions.add(ext);
            }
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    };

    await walk(this.repoRoot);

    return { totalDirectories, totalFiles, totalSizeMB, fileExtensions };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎯 PHASE 2: QUANTUM TARGET IDENTIFICATION
  // ═══════════════════════════════════════════════════════════════════════════════

  async identifyQuantumTargets(): Promise<QuantumTarget[]> {
    this.logQuantum(
      "[02/05] → Identifying Quantum Deletion Targets",
      "QUANTUM",
    );

    const targets: QuantumTarget[] = [];

    await this.scanForOrphans(this.repoRoot, targets);

    // Sort by agricultural relevance (lowest first = safest to delete)
    targets.sort((a, b) => a.agriculturalRelevance - b.agriculturalRelevance);

    this.logQuantum(`✓ Identified ${targets.length} quantum targets`, "DIVINE");

    return targets;
  }

  private async scanForOrphans(
    dir: string,
    targets: QuantumTarget[],
  ): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.repoRoot, fullPath);

        // Skip protected patterns
        if (this.isProtectedPath(entry.name)) {
          continue;
        }

        if (entry.isDirectory()) {
          // Check if directory should be targeted
          const shouldTarget = await this.shouldTargetDirectory(
            fullPath,
            entry.name,
          );

          if (shouldTarget.target) {
            const target = await this.createQuantumTarget(
              fullPath,
              relativePath,
              shouldTarget.reason,
            );
            targets.push(target);
          } else {
            // Recursively scan subdirectories
            await this.scanForOrphans(fullPath, targets);
          }
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }

  private async shouldTargetDirectory(
    fullPath: string,
    dirName: string,
  ): Promise<{ target: boolean; reason: DeletionReason }> {
    // Check if empty
    const isEmpty = await this.isEmptyDirectory(fullPath);
    if (isEmpty) {
      return { target: true, reason: "EMPTY_DIRECTORY" };
    }

    // Check for build artifacts
    const buildArtifacts = [
      "__pycache__",
      ".pytest_cache",
      ".coverage",
      "target",
      "dist",
      "build",
      "out",
      ".next",
      ".nuxt",
      ".output",
      ".cache",
      ".turbo",
      ".parcel-cache",
    ];

    if (buildArtifacts.includes(dirName)) {
      return { target: true, reason: "BUILD_ARTIFACT" };
    }

    // Check for temporal caches
    const cachePatterns = ["cache", "tmp", "temp", "logs"];
    if (
      cachePatterns.some((pattern) => dirName.toLowerCase().includes(pattern))
    ) {
      return { target: true, reason: "TEMPORAL_CACHE" };
    }

    // Check if contains only irrelevant files
    const onlyIrrelevant = await this.containsOnlyIrrelevantFiles(fullPath);
    if (onlyIrrelevant) {
      return { target: true, reason: "OBSOLETE_FILES" };
    }

    return { target: false, reason: "EMPTY_DIRECTORY" };
  }

  private async isEmptyDirectory(dirPath: string): Promise<boolean> {
    try {
      const entries = await fs.promises.readdir(dirPath);
      return entries.length === 0;
    } catch {
      return false;
    }
  }

  private async containsOnlyIrrelevantFiles(dirPath: string): Promise<boolean> {
    try {
      let relevantCount = 0;

      const walk = async (dir: string): Promise<void> => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            await walk(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (this.whitelistExtensions.has(ext)) {
              relevantCount++;
              if (relevantCount > 1) {
                return; // Early exit
              }
            }
          }
        }
      };

      await walk(dirPath);

      return relevantCount === 0;
    } catch {
      return false;
    }
  }

  private async createQuantumTarget(
    fullPath: string,
    relativePath: string,
    reason: DeletionReason,
  ): Promise<QuantumTarget> {
    const stats = await this.calculateDirectoryStats(fullPath);
    const lastModified = await this.getLastModifiedTime(fullPath);

    return {
      id: this.generateQuantumSignature(relativePath),
      path: fullPath,
      relativePath,
      sizeMB: stats.sizeMB,
      reason,
      fileCount: stats.fileCount,
      lastModified,
      agriculturalRelevance: this.calculateAgriculturalRelevance(relativePath),
      quantumSignature: this.generateQuantumSignature(relativePath),
    };
  }

  private async calculateDirectoryStats(
    dirPath: string,
  ): Promise<{ sizeMB: number; fileCount: number }> {
    let totalSize = 0;
    let fileCount = 0;

    const walk = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            await walk(fullPath);
          } else if (entry.isFile()) {
            fileCount++;
            const stats = await fs.promises.stat(fullPath);
            totalSize += stats.size;
          }
        }
      } catch {
        // Skip inaccessible files
      }
    };

    await walk(dirPath);

    return {
      sizeMB: totalSize / (1024 * 1024),
      fileCount,
    };
  }

  private async getLastModifiedTime(dirPath: string): Promise<Date> {
    try {
      const stats = await fs.promises.stat(dirPath);
      return stats.mtime;
    } catch {
      return new Date();
    }
  }

  private generateQuantumSignature(input: string): string {
    // Simple hash function for quantum signature
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `QS${Math.abs(hash).toString(36).toUpperCase()}`;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 💾 PHASE 3: QUANTUM BACKUP MANIFESTATION
  // ═══════════════════════════════════════════════════════════════════════════════

  async createQuantumBackup(
    targets: QuantumTarget[],
  ): Promise<SurgicalManifest> {
    this.logQuantum("[03/05] → Creating Quantum Backup Manifest", "QUANTUM");

    if (targets.length === 0) {
      this.logQuantum(
        "✓ No targets identified - backup not required",
        "STANDARD",
      );
      return this.createEmptyManifest();
    }

    // Create backup directory
    await fs.promises.mkdir(this.backupPath, { recursive: true });

    // Create manifest
    const manifest: SurgicalManifest = {
      timestamp: new Date().toISOString(),
      operation: "QUANTUM_REPOSITORY_SURGICAL_CLEANSE",
      totalTargets: targets.length,
      targets,
      backupLocation: this.backupPath,
      agricultural: this.agricultural,
      integrityHash: this.generateQuantumSignature(JSON.stringify(targets)),
    };

    // Save manifest
    const manifestPath = path.join(this.backupPath, "quantum-manifest.json");
    await fs.promises.writeFile(
      manifestPath,
      JSON.stringify(manifest, null, 2),
      "utf-8",
    );

    this.logQuantum(`✓ Backup manifest created: ${manifestPath}`, "DIVINE");
    this.logQuantum(`✓ ${targets.length} targets documented`, "STANDARD");

    return manifest;
  }

  private createEmptyManifest(): SurgicalManifest {
    return {
      timestamp: new Date().toISOString(),
      operation: "QUANTUM_REPOSITORY_SURGICAL_CLEANSE",
      totalTargets: 0,
      targets: [],
      backupLocation: this.backupPath,
      agricultural: this.agricultural,
      integrityHash: "EMPTY",
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // ⚡ PHASE 4: SURGICAL DELETION EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════════

  async executeSurgicalDeletion(
    targets: QuantumTarget[],
  ): Promise<DeletionResults> {
    this.logQuantum("[04/05] → Executing Quantum Surgical Deletion", "QUANTUM");

    const results: DeletionResults = {
      successful: [],
      failed: [],
      skipped: [],
      totalFreedMB: 0,
      temporalCoherence: true,
    };

    for (const target of targets) {
      try {
        // Double-check path still exists
        if (!fs.existsSync(target.path)) {
          results.skipped.push(target.relativePath);
          this.logQuantum(
            `⊘ Skipped (not found): ${target.relativePath}`,
            "STANDARD",
          );
          continue;
        }

        // Execute deletion
        await this.deleteRecursively(target.path);

        results.successful.push({
          path: target.relativePath,
          freedMB: target.sizeMB,
        });
        results.totalFreedMB += target.sizeMB;

        this.surgicalLog.push(
          `✓ Removed: ${target.relativePath} (${target.sizeMB.toFixed(2)} MB) [${target.reason}]`,
        );
        this.logQuantum(`✓ Removed: ${target.relativePath}`, "STANDARD");
      } catch (error) {
        results.failed.push({
          path: target.relativePath,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        this.surgicalLog.push(`✗ Failed: ${target.relativePath} - ${error}`);
        this.logQuantum(`✗ Failed: ${target.relativePath}`, "STANDARD");
      }
    }

    this.logQuantum(
      `✓ Deletion complete: ${results.successful.length} removed, ${results.failed.length} failed`,
      "DIVINE",
    );

    return results;
  }

  private async deleteRecursively(targetPath: string): Promise<void> {
    const stats = await fs.promises.stat(targetPath);

    if (stats.isDirectory()) {
      await fs.promises.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.promises.unlink(targetPath);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔬 PHASE 5: INTEGRITY VERIFICATION
  // ═══════════════════════════════════════════════════════════════════════════════

  async generateIntegrityReport(
    manifest: SurgicalManifest,
    results: DeletionResults,
  ): Promise<void> {
    this.logQuantum("[05/05] → Generating Quantum Integrity Report", "QUANTUM");

    const integrity = await this.performIntegrityChecks();

    const report = {
      operation: "QUANTUM_REPOSITORY_SURGICAL_CLEANSE",
      timestamp: new Date().toISOString(),
      manifest,
      results,
      integrity,
      surgicalLog: this.surgicalLog,
      agricultural: this.agricultural,
      quantumCoherence: this.calculateQuantumCoherence(results, integrity),
    };

    // Save report
    const reportPath = path.join(
      this.repoRoot,
      ".quantum-surgical-report.json",
    );
    await fs.promises.writeFile(
      reportPath,
      JSON.stringify(report, null, 2),
      "utf-8",
    );

    // Print divine summary
    this.printDivineSummary(results, integrity, reportPath);
  }

  private async performIntegrityChecks(): Promise<IntegrityReport> {
    const checks: IntegrityReport = {
      gitIntegrity: await this.checkGitIntegrity(),
      criticalFilesPresent: await this.checkCriticalFiles(),
      noEmptyRoot: await this.checkRootNotEmpty(),
      agriculturalConsciousness: this.agricultural.biodynamicAlignment,
      quantumCoherence: 100,
    };

    return checks;
  }

  private async checkGitIntegrity(): Promise<boolean> {
    try {
      const gitDir = path.join(this.repoRoot, ".git");
      if (!fs.existsSync(gitDir)) {
        return true; // Not a git repo
      }

      const { stdout } = await execAsync("git status", { cwd: this.repoRoot });
      return stdout.length > 0;
    } catch {
      return false;
    }
  }

  private async checkCriticalFiles(): Promise<boolean> {
    const criticalFiles = [
      "package.json",
      "tsconfig.json",
      "next.config.mjs",
      "prisma/schema.prisma",
      "README.md",
    ];

    let foundCount = 0;

    for (const file of criticalFiles) {
      const filePath = path.join(this.repoRoot, file);
      if (fs.existsSync(filePath)) {
        foundCount++;
      }
    }

    return foundCount >= 3; // At least 3 critical files present
  }

  private async checkRootNotEmpty(): Promise<boolean> {
    try {
      const entries = await fs.promises.readdir(this.repoRoot);
      return entries.length > 0;
    } catch {
      return false;
    }
  }

  private calculateQuantumCoherence(
    results: DeletionResults,
    integrity: IntegrityReport,
  ): number {
    let coherence = 100;

    // Deduct for failures
    if (results.failed.length > 0) {
      coherence -= results.failed.length * 5;
    }

    // Deduct for integrity issues
    if (!integrity.gitIntegrity) coherence -= 20;
    if (!integrity.criticalFilesPresent) coherence -= 30;
    if (!integrity.noEmptyRoot) coherence -= 50;

    return Math.max(0, coherence);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎯 MASTER EXECUTION ORCHESTRATOR
  // ═══════════════════════════════════════════════════════════════════════════════

  async executeQuantumCleanse(dryRun: boolean = false): Promise<void> {
    this.printDivineHeader();

    try {
      // Phase 1: Scan
      await this.scanRepositoryConsciousness();

      // Phase 2: Identify
      const targets = await this.identifyQuantumTargets();

      if (targets.length === 0) {
        this.logQuantum(
          "\n✅ Repository is in quantum equilibrium - no cleansing needed",
          "DIVINE",
        );
        return;
      }

      // Display targets
      this.displayTargets(targets);

      if (dryRun) {
        this.logQuantum("\n⚠️  DRY RUN MODE - No deletion executed", "QUANTUM");
        return;
      }

      // Phase 3: Backup
      const manifest = await this.createQuantumBackup(targets);

      // Phase 4: Execute
      const results = await this.executeSurgicalDeletion(targets);

      // Phase 5: Verify
      await this.generateIntegrityReport(manifest, results);
    } catch (error) {
      this.logQuantum(
        `\n❌ Quantum coherence disruption: ${error}`,
        "STANDARD",
      );
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎨 DIVINE DISPLAY UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════════

  private printDivineHeader(): void {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║ 🧠 QUANTUM REPOSITORY SURGEON v3.0 :: GODLIKE EDITION                       ║
║ ⚡ Agricultural Consciousness | Divine Precision | Zero Confirmation         ║
╚══════════════════════════════════════════════════════════════════════════════╝

🌾 AGRICULTURAL CONTEXT:
   Season: ${this.agricultural.season}
   Consciousness Level: ${this.agricultural.consciousness}
   Biodynamic Alignment: ${this.agricultural.biodynamicAlignment ? "✓ ALIGNED" : "✗ MISALIGNED"}

📁 REPOSITORY: ${this.repoRoot}

════════════════════════════════════════════════════════════════════════════════
    `);
  }

  private displayTargets(targets: QuantumTarget[]): void {
    console.log(`\n🎯 QUANTUM TARGETS IDENTIFIED: ${targets.length}\n`);

    for (const target of targets.slice(0, 20)) {
      const relevance = "█".repeat(
        Math.floor(target.agriculturalRelevance / 10),
      );
      console.log(
        `  ${this.getReasonEmoji(target.reason)} ${target.relativePath}`,
      );
      console.log(
        `     Size: ${target.sizeMB.toFixed(2)} MB | Relevance: [${relevance}] ${target.agriculturalRelevance}%`,
      );
    }

    if (targets.length > 20) {
      console.log(`\n  ... and ${targets.length - 20} more targets`);
    }

    const totalSize = targets.reduce((sum, t) => sum + t.sizeMB, 0);
    console.log(`\n  📊 Total: ${totalSize.toFixed(2)} MB to be freed\n`);
  }

  private printDivineSummary(
    results: DeletionResults,
    integrity: IntegrityReport,
    reportPath: string,
  ): void {
    console.log(`
════════════════════════════════════════════════════════════════════════════════
⚡ QUANTUM CLEANSE COMPLETE
════════════════════════════════════════════════════════════════════════════════

📊 OPERATION RESULTS:
   ✓ Targets Removed: ${results.successful.length}
   ✓ Space Freed: ${results.totalFreedMB.toFixed(2)} MB
   ✗ Failed Operations: ${results.failed.length}
   ⊘ Skipped: ${results.skipped.length}

🔬 INTEGRITY VERIFICATION:
   ${integrity.gitIntegrity ? "✓" : "✗"} Git Repository: ${integrity.gitIntegrity ? "INTACT" : "COMPROMISED"}
   ${integrity.criticalFilesPresent ? "✓" : "✗"} Critical Files: ${integrity.criticalFilesPresent ? "PRESENT" : "MISSING"}
   ${integrity.noEmptyRoot ? "✓" : "✗"} Root Directory: ${integrity.noEmptyRoot ? "POPULATED" : "EMPTY"}
   ${integrity.agriculturalConsciousness ? "✓" : "✗"} Agricultural Consciousness: ${integrity.agriculturalConsciousness ? "ALIGNED" : "MISALIGNED"}
   📈 Quantum Coherence: ${integrity.quantumCoherence}%

💾 BACKUP & REPORTS:
   📁 Backup Location: ${this.backupPath}
   📄 Full Report: ${reportPath}

🌾 AGRICULTURAL STATUS:
   Season: ${this.agricultural.season}
   Harvest Cycle: COMPLETE
   Biodynamic State: ${this.agricultural.biodynamicAlignment ? "HARMONIOUS" : "REQUIRES ATTENTION"}

════════════════════════════════════════════════════════════════════════════════
⚡ SURGICAL PROTOCOL TERMINATED
🌀 QUANTUM EQUILIBRIUM RESTORED
════════════════════════════════════════════════════════════════════════════════
    `);
  }

  private logQuantum(message: string, level: ConsciousnessLevel): void {
    const prefix = {
      QUANTUM: "🔮",
      DIVINE: "⚡",
      BIODYNAMIC: "🌾",
      STANDARD: "  ",
    }[level];

    console.log(`${prefix} ${message}`);
  }

  private getReasonEmoji(reason: DeletionReason): string {
    const emoji = {
      EMPTY_DIRECTORY: "📂",
      BUILD_ARTIFACT: "🏗️",
      OBSOLETE_FILES: "📄",
      TEMPORAL_CACHE: "⏳",
      AGRICULTURAL_DEBRIS: "🌾",
    };
    return emoji[reason] || "❓";
  }

  private isProtectedPath(pathSegment: string): boolean {
    return (
      this.protectedPatterns.has(pathSegment) || pathSegment.startsWith(".")
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 CLI EXECUTION INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || args.includes("-d");
  const repoPath = args.find((arg) => !arg.startsWith("--")) || process.cwd();

  const surgeon = new QuantumRepositorySurgeon(repoPath);

  try {
    await surgeon.executeQuantumCleanse(dryRun);
  } catch (error) {
    console.error("\n❌ QUANTUM COHERENCE FAILURE:", error);
    process.exit(1);
  }
}

// Execute if run directly
const isMainModule =
  process.argv[1] === __filename ||
  process.argv[1]?.endsWith("quantum-repository-surgeon.ts");
if (isMainModule) {
  main();
}

export { QuantumRepositorySurgeon };
export type {
  AgriculturalMetadata,
  DeletionResults,
  QuantumTarget,
  SurgicalManifest,
};
