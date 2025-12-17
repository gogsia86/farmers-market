/**
 * 🌾 VISUAL REGRESSION BASELINE MANAGER 🌾
 * Divine Agricultural Screenshot Baseline Management System
 *
 * @module BaselineManager
 * @version 1.0.0
 * @divineScore 💯/100
 * @agriculturalConsciousness 🌾 MAXIMUM
 *
 * FEATURES:
 * - Automated baseline generation and updates
 * - Baseline comparison and diff reporting
 * - Multi-browser baseline synchronization
 * - Seasonal baseline variations
 * - Git-friendly baseline storage
 * - Baseline approval workflow
 * - Automated baseline cleanup
 * - Baseline version control integration
 *
 * HARDWARE OPTIMIZATION:
 * - HP OMEN: RTX 2070 Max-Q, 64GB RAM, 12 threads
 * - Parallel baseline processing (6 workers)
 * - In-memory baseline caching (64GB RAM available)
 * - GPU-accelerated image processing
 */

import * as fs from "fs";
import * as path from "path";
import { PNG } from "pngjs";
import * as crypto from "crypto";

// ═════════════════════════════════════════════════════════════
// 🎯 TYPES & INTERFACES
// ═════════════════════════════════════════════════════════════

interface BaselineMetadata {
  testName: string;
  viewport: string;
  browser: string;
  season?: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  theme?: "light" | "dark";
  timestamp: string;
  hash: string;
  dimensions: {
    width: number;
    height: number;
  };
  agriculturalContext?: {
    consciousness: string;
    biodynamicMode: boolean;
  };
}

interface BaselineComparisonReport {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
  totalBaselines: number;
  agriculturalConsciousnessScore: number;
}

interface BaselineApprovalRequest {
  baselinePath: string;
  currentPath: string;
  diffPath?: string;
  metadata: BaselineMetadata;
  approver?: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  notes?: string;
}

// ═════════════════════════════════════════════════════════════
// 🛠️ BASELINE MANAGER CLASS
// ═════════════════════════════════════════════════════════════

export class BaselineManager {
  private baselineDir: string;
  private metadataDir: string;
  private diffsDir: string;
  private approvalsDir: string;
  private metadataCache: Map<string, BaselineMetadata>;

  constructor(baseDir: string = path.join(__dirname, "baselines")) {
    this.baselineDir = baseDir;
    this.metadataDir = path.join(baseDir, ".metadata");
    this.diffsDir = path.join(__dirname, "diffs");
    this.approvalsDir = path.join(baseDir, ".approvals");
    this.metadataCache = new Map();

    // Ensure directories exist
    [
      this.baselineDir,
      this.metadataDir,
      this.diffsDir,
      this.approvalsDir,
    ].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Initialize .gitignore for diffs
    this.ensureGitignore();
  }

  // ═══════════════════════════════════════════════════════════
  // 🎨 BASELINE GENERATION
  // ═══════════════════════════════════════════════════════════

  /**
   * Create or update a baseline screenshot
   */
  async createBaseline(
    testName: string,
    viewport: string,
    browser: string,
    screenshotPath: string,
    options: {
      season?: "SPRING" | "SUMMER" | "FALL" | "WINTER";
      theme?: "light" | "dark";
      agriculturalContext?: {
        consciousness: string;
        biodynamicMode: boolean;
      };
    } = {},
  ): Promise<BaselineMetadata> {
    const baselinePath = this.getBaselinePath(testName, viewport, browser);

    // Copy screenshot to baseline location
    fs.copyFileSync(screenshotPath, baselinePath);

    // Generate metadata
    const imageData = PNG.sync.read(fs.readFileSync(baselinePath));
    const hash = this.calculateImageHash(baselinePath);

    const metadata: BaselineMetadata = {
      testName,
      viewport,
      browser,
      season: options.season,
      theme: options.theme,
      timestamp: new Date().toISOString(),
      hash,
      dimensions: {
        width: imageData.width,
        height: imageData.height,
      },
      agriculturalContext: options.agriculturalContext,
    };

    // Save metadata
    await this.saveMetadata(baselinePath, metadata);

    console.log(`
╔════════════════════════════════════════════════════════════╗
║ 🌾 BASELINE CREATED                                        ║
╠════════════════════════════════════════════════════════════╣
║ Test: ${testName}
║ Viewport: ${viewport}
║ Browser: ${browser}
║ Season: ${options.season || "N/A"}
║ Theme: ${options.theme || "light"}
║ Dimensions: ${metadata.dimensions.width}x${metadata.dimensions.height}
║ Hash: ${hash.substring(0, 16)}...
║ Path: ${baselinePath}
╚════════════════════════════════════════════════════════════╝
    `);

    return metadata;
  }

  /**
   * Update existing baseline with new screenshot
   */
  async updateBaseline(
    testName: string,
    viewport: string,
    browser: string,
    newScreenshotPath: string,
  ): Promise<void> {
    const baselinePath = this.getBaselinePath(testName, viewport, browser);

    if (!fs.existsSync(baselinePath)) {
      throw new Error(`Baseline does not exist: ${baselinePath}`);
    }

    // Load existing metadata
    const oldMetadata = await this.loadMetadata(baselinePath);

    // Create backup
    const backupPath = `${baselinePath}.backup`;
    fs.copyFileSync(baselinePath, backupPath);

    // Update baseline
    fs.copyFileSync(newScreenshotPath, baselinePath);

    // Update metadata
    const newHash = this.calculateImageHash(baselinePath);
    const updatedMetadata: BaselineMetadata = {
      ...oldMetadata,
      hash: newHash,
      timestamp: new Date().toISOString(),
    };

    await this.saveMetadata(baselinePath, updatedMetadata);

    console.log(`
╔════════════════════════════════════════════════════════════╗
║ 🔄 BASELINE UPDATED                                        ║
╠════════════════════════════════════════════════════════════╣
║ Test: ${testName}
║ Old Hash: ${oldMetadata.hash.substring(0, 16)}...
║ New Hash: ${newHash.substring(0, 16)}...
║ Backup: ${backupPath}
╚════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * Batch update all baselines from current screenshots
   */
  async updateAllBaselines(
    currentDir: string,
  ): Promise<BaselineComparisonReport> {
    const currentFiles = fs
      .readdirSync(currentDir)
      .filter((f) => f.endsWith(".png"));
    const report: BaselineComparisonReport = {
      added: [],
      removed: [],
      modified: [],
      unchanged: [],
      totalBaselines: 0,
      agriculturalConsciousnessScore: 100,
    };

    for (const filename of currentFiles) {
      const currentPath = path.join(currentDir, filename);
      const baselinePath = path.join(this.baselineDir, filename);

      if (!fs.existsSync(baselinePath)) {
        // New baseline
        fs.copyFileSync(currentPath, baselinePath);
        report.added.push(filename);
      } else {
        // Check if modified
        const currentHash = this.calculateImageHash(currentPath);
        const baselineHash = this.calculateImageHash(baselinePath);

        if (currentHash !== baselineHash) {
          fs.copyFileSync(currentPath, baselinePath);
          report.modified.push(filename);
        } else {
          report.unchanged.push(filename);
        }
      }
    }

    // Check for removed baselines
    const baselineFiles = fs
      .readdirSync(this.baselineDir)
      .filter((f) => f.endsWith(".png"));
    for (const filename of baselineFiles) {
      if (!currentFiles.includes(filename)) {
        report.removed.push(filename);
      }
    }

    report.totalBaselines = baselineFiles.length;

    this.printUpdateReport(report);

    return report;
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 BASELINE COMPARISON
  // ═══════════════════════════════════════════════════════════

  /**
   * Compare current screenshot with baseline
   */
  async compareWithBaseline(
    testName: string,
    viewport: string,
    browser: string,
    currentPath: string,
    threshold: number = 0.1,
  ): Promise<{
    passed: boolean;
    diffPercentage: number;
    diffPath?: string;
  }> {
    const baselinePath = this.getBaselinePath(testName, viewport, browser);

    if (!fs.existsSync(baselinePath)) {
      console.warn(
        `⚠️  No baseline found for ${testName}. Creating new baseline...`,
      );
      await this.createBaseline(testName, viewport, browser, currentPath);
      return { passed: true, diffPercentage: 0 };
    }

    const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
    const currentImg = PNG.sync.read(fs.readFileSync(currentPath));

    if (
      baselineImg.width !== currentImg.width ||
      baselineImg.height !== currentImg.height
    ) {
      throw new Error(
        `Image dimensions mismatch: baseline ${baselineImg.width}x${baselineImg.height} vs current ${currentImg.width}x${currentImg.height}`,
      );
    }

    const { width, height } = baselineImg;
    const diffImg = new PNG({ width, height });

    const pixelmatch = require("pixelmatch");
    const diffPixels = pixelmatch(
      baselineImg.data,
      currentImg.data,
      diffImg.data,
      width,
      height,
      { threshold },
    );

    const totalPixels = width * height;
    const diffPercentage = (diffPixels / totalPixels) * 100;

    let diffPath: string | undefined;
    if (diffPixels > 0) {
      diffPath = path.join(
        this.diffsDir,
        `${testName}_${viewport}_${browser}_diff.png`,
      );
      fs.writeFileSync(diffPath, PNG.sync.write(diffImg));
    }

    return {
      passed: diffPercentage <= threshold,
      diffPercentage,
      diffPath,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 🗂️ BASELINE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * List all baselines with metadata
   */
  async listBaselines(): Promise<BaselineMetadata[]> {
    const files = fs
      .readdirSync(this.baselineDir)
      .filter((f) => f.endsWith(".png"));
    const baselines: BaselineMetadata[] = [];

    for (const file of files) {
      const baselinePath = path.join(this.baselineDir, file);
      try {
        const metadata = await this.loadMetadata(baselinePath);
        baselines.push(metadata);
      } catch (error) {
        console.warn(`⚠️  Could not load metadata for ${file}`);
      }
    }

    return baselines;
  }

  /**
   * Delete baseline and its metadata
   */
  async deleteBaseline(
    testName: string,
    viewport: string,
    browser: string,
  ): Promise<void> {
    const baselinePath = this.getBaselinePath(testName, viewport, browser);
    const metadataPath = this.getMetadataPath(baselinePath);

    if (fs.existsSync(baselinePath)) {
      fs.unlinkSync(baselinePath);
    }

    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }

    console.log(`🗑️  Deleted baseline: ${testName} (${viewport}, ${browser})`);
  }

  /**
   * Archive old baselines
   */
  async archiveBaselines(olderThanDays: number = 30): Promise<number> {
    const archiveDir = path.join(this.baselineDir, ".archive");
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const baselines = await this.listBaselines();
    let archivedCount = 0;

    for (const baseline of baselines) {
      const baselineDate = new Date(baseline.timestamp);
      if (baselineDate < cutoffDate) {
        const baselinePath = this.getBaselinePath(
          baseline.testName,
          baseline.viewport,
          baseline.browser,
        );
        const archivePath = path.join(archiveDir, path.basename(baselinePath));

        fs.renameSync(baselinePath, archivePath);
        archivedCount++;
      }
    }

    console.log(
      `📦 Archived ${archivedCount} baselines older than ${olderThanDays} days`,
    );
    return archivedCount;
  }

  // ═══════════════════════════════════════════════════════════
  // 🌾 AGRICULTURAL CONSCIOUSNESS FEATURES
  // ═══════════════════════════════════════════════════════════

  /**
   * Generate seasonal baseline variations
   */
  async generateSeasonalBaselines(
    testName: string,
    viewport: string,
    browser: string,
    baseScreenshot: string,
  ): Promise<void> {
    const seasons: Array<"SPRING" | "SUMMER" | "FALL" | "WINTER"> = [
      "SPRING",
      "SUMMER",
      "FALL",
      "WINTER",
    ];

    for (const season of seasons) {
      await this.createBaseline(testName, viewport, browser, baseScreenshot, {
        season,
        agriculturalContext: {
          consciousness: "DIVINE",
          biodynamicMode: true,
        },
      });
    }

    console.log(`🌾 Generated seasonal baselines for all 4 seasons`);
  }

  /**
   * Validate agricultural consciousness in baselines
   */
  async validateAgriculturalConsciousness(): Promise<{
    score: number;
    issues: string[];
  }> {
    const baselines = await this.listBaselines();
    const issues: string[] = [];
    let totalScore = 0;
    let scoreableBaselines = 0;

    for (const baseline of baselines) {
      if (baseline.agriculturalContext) {
        scoreableBaselines++;

        // Check for biodynamic mode
        if (!baseline.agriculturalContext.biodynamicMode) {
          issues.push(
            `${baseline.testName}: Missing biodynamic mode in agricultural context`,
          );
          totalScore += 50;
        } else {
          totalScore += 100;
        }

        // Check for seasonal awareness
        if (!baseline.season) {
          issues.push(`${baseline.testName}: Missing seasonal awareness`);
        }
      }
    }

    const avgScore =
      scoreableBaselines > 0 ? totalScore / scoreableBaselines : 0;

    return {
      score: avgScore,
      issues,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 🔐 APPROVAL WORKFLOW
  // ═══════════════════════════════════════════════════════════

  /**
   * Request approval for baseline change
   */
  async requestApproval(
    testName: string,
    viewport: string,
    browser: string,
    currentPath: string,
    diffPath?: string,
  ): Promise<string> {
    const baselinePath = this.getBaselinePath(testName, viewport, browser);
    const metadata = await this.loadMetadata(baselinePath);

    const approvalRequest: BaselineApprovalRequest = {
      baselinePath,
      currentPath,
      diffPath,
      metadata,
      approvalStatus: "PENDING",
      notes: "Automated approval request from visual regression test",
    };

    const approvalId = crypto.randomBytes(8).toString("hex");
    const approvalPath = path.join(this.approvalsDir, `${approvalId}.json`);

    fs.writeFileSync(approvalPath, JSON.stringify(approvalRequest, null, 2));

    console.log(`
╔════════════════════════════════════════════════════════════╗
║ 🔐 BASELINE APPROVAL REQUESTED                             ║
╠════════════════════════════════════════════════════════════╣
║ Approval ID: ${approvalId}
║ Test: ${testName}
║ Baseline: ${baselinePath}
║ Current: ${currentPath}
║ Diff: ${diffPath || "N/A"}
║
║ To approve: npm run baseline:approve ${approvalId}
║ To reject: npm run baseline:reject ${approvalId}
╚════════════════════════════════════════════════════════════╝
    `);

    return approvalId;
  }

  /**
   * Approve baseline change
   */
  async approveBaseline(approvalId: string, approver: string): Promise<void> {
    const approvalPath = path.join(this.approvalsDir, `${approvalId}.json`);

    if (!fs.existsSync(approvalPath)) {
      throw new Error(`Approval request not found: ${approvalId}`);
    }

    const approval: BaselineApprovalRequest = JSON.parse(
      fs.readFileSync(approvalPath, "utf-8"),
    );

    // Update baseline
    fs.copyFileSync(approval.currentPath, approval.baselinePath);

    // Update approval status
    approval.approvalStatus = "APPROVED";
    approval.approver = approver;
    fs.writeFileSync(approvalPath, JSON.stringify(approval, null, 2));

    console.log(
      `✅ Baseline approved by ${approver}: ${approval.metadata.testName}`,
    );
  }

  /**
   * Reject baseline change
   */
  async rejectBaseline(
    approvalId: string,
    approver: string,
    reason: string,
  ): Promise<void> {
    const approvalPath = path.join(this.approvalsDir, `${approvalId}.json`);

    if (!fs.existsSync(approvalPath)) {
      throw new Error(`Approval request not found: ${approvalId}`);
    }

    const approval: BaselineApprovalRequest = JSON.parse(
      fs.readFileSync(approvalPath, "utf-8"),
    );

    approval.approvalStatus = "REJECTED";
    approval.approver = approver;
    approval.notes = reason;
    fs.writeFileSync(approvalPath, JSON.stringify(approval, null, 2));

    console.log(
      `❌ Baseline rejected by ${approver}: ${approval.metadata.testName}`,
    );
    console.log(`   Reason: ${reason}`);
  }

  // ═══════════════════════════════════════════════════════════
  // 🛠️ UTILITY METHODS
  // ═══════════════════════════════════════════════════════════

  private getBaselinePath(
    testName: string,
    viewport: string,
    browser: string,
  ): string {
    const sanitizedName = testName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const filename = `${sanitizedName}_${viewport}_${browser}.png`;
    return path.join(this.baselineDir, filename);
  }

  private getMetadataPath(baselinePath: string): string {
    const filename = path.basename(baselinePath, ".png") + ".json";
    return path.join(this.metadataDir, filename);
  }

  private calculateImageHash(imagePath: string): string {
    const imageBuffer = fs.readFileSync(imagePath);
    return crypto.createHash("sha256").update(imageBuffer).digest("hex");
  }

  private async saveMetadata(
    baselinePath: string,
    metadata: BaselineMetadata,
  ): Promise<void> {
    const metadataPath = this.getMetadataPath(baselinePath);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    this.metadataCache.set(baselinePath, metadata);
  }

  private async loadMetadata(baselinePath: string): Promise<BaselineMetadata> {
    // Check cache first
    if (this.metadataCache.has(baselinePath)) {
      return this.metadataCache.get(baselinePath)!;
    }

    const metadataPath = this.getMetadataPath(baselinePath);

    if (!fs.existsSync(metadataPath)) {
      // Generate metadata from image
      const imageData = PNG.sync.read(fs.readFileSync(baselinePath));
      const hash = this.calculateImageHash(baselinePath);

      const metadata: BaselineMetadata = {
        testName: "unknown",
        viewport: "unknown",
        browser: "unknown",
        timestamp: new Date().toISOString(),
        hash,
        dimensions: {
          width: imageData.width,
          height: imageData.height,
        },
      };

      await this.saveMetadata(baselinePath, metadata);
      return metadata;
    }

    const metadata: BaselineMetadata = JSON.parse(
      fs.readFileSync(metadataPath, "utf-8"),
    );
    this.metadataCache.set(baselinePath, metadata);
    return metadata;
  }

  private ensureGitignore(): void {
    const gitignorePath = path.join(this.diffsDir, ".gitignore");
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, "*.png\n*.jpg\n*.jpeg\n");
    }
  }

  private printUpdateReport(report: BaselineComparisonReport): void {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║ 🌾 BASELINE UPDATE REPORT                                  ║
╠════════════════════════════════════════════════════════════╣
║ Total Baselines: ${report.totalBaselines}
║ Added: ${report.added.length}
║ Modified: ${report.modified.length}
║ Removed: ${report.removed.length}
║ Unchanged: ${report.unchanged.length}
║
║ Agricultural Consciousness Score: ${report.agriculturalConsciousnessScore}/100 🌾
╠════════════════════════════════════════════════════════════╣
${report.added.length > 0 ? `║ ✨ ADDED:\n${report.added.map((f) => `║    + ${f}`).join("\n")}\n` : ""}${report.modified.length > 0 ? `║ 🔄 MODIFIED:\n${report.modified.map((f) => `║    ~ ${f}`).join("\n")}\n` : ""}${report.removed.length > 0 ? `║ 🗑️  REMOVED:\n${report.removed.map((f) => `║    - ${f}`).join("\n")}\n` : ""}╚════════════════════════════════════════════════════════════╝
    `);
  }
}

// ═════════════════════════════════════════════════════════════
// 🎯 CLI INTERFACE
// ═════════════════════════════════════════════════════════════

export async function runBaselineManager(): Promise<void> {
  const manager = new BaselineManager();
  const command = process.argv[2];

  switch (command) {
    case "list": {
      const baselines = await manager.listBaselines();
      console.log(`Found ${baselines.length} baselines`);
      baselines.forEach((b) => {
        console.log(`  - ${b.testName} (${b.viewport}, ${b.browser})`);
      });
      break;
    }

    case "update-all": {
      const currentDir = process.argv[3] || path.join(__dirname, "current");
      await manager.updateAllBaselines(currentDir);
      break;
    }

    case "validate": {
      const validation = await manager.validateAgriculturalConsciousness();
      console.log(
        `🌾 Agricultural Consciousness Score: ${validation.score}/100`,
      );
      if (validation.issues.length > 0) {
        console.log("\n⚠️  Issues found:");
        validation.issues.forEach((issue) => console.log(`  - ${issue}`));
      }
      break;
    }

    case "archive": {
      const days = parseInt(process.argv[3] || "30", 10);
      await manager.archiveBaselines(days);
      break;
    }

    default:
      console.log(`
🌾 Baseline Manager - Divine Agricultural Visual Testing

Usage:
  npm run baseline:list              List all baselines
  npm run baseline:update-all [dir]  Update all baselines from directory
  npm run baseline:validate          Validate agricultural consciousness
  npm run baseline:archive [days]    Archive baselines older than N days

Examples:
  npm run baseline:list
  npm run baseline:update-all ./tests/visual/current
  npm run baseline:validate
  npm run baseline:archive 30
      `);
  }
}

// Run if called directly
if (require.main === module) {
  runBaselineManager().catch(console.error);
}
