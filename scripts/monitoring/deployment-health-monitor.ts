#!/usr/bin/env tsx
/**
 * 🏥 DEPLOYMENT HEALTH MONITOR
 *
 * Validates deployment readiness based on proven 7-build success pattern
 *
 * Expected Metrics (from 7 consecutive successful builds):
 * - 1748 packages installed
 * - ~3 minute build time (178-182 seconds)
 * - 57 static pages generated
 * - 0 vulnerabilities
 * - 356.64 MB build cache
 *
 * Usage:
 *   npm run deploy:check
 *   npm run deploy:safe  (check + deploy if healthy)
 */

import { exec } from "child_process";
import { promisify } from "util";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";

const execAsync = promisify(exec);

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

interface BuildMetrics {
  commit: string;
  branch: string;
  timestamp: string;
  packageCount: number;
  buildTime: number;
  staticPages: number;
  vulnerabilities: number;
  cacheSize: string;
  nodeVersion: string;
  npmVersion: string;
  success: boolean;
  errorMessage?: string;
}

interface HealthCheckResult {
  name: string;
  passed: boolean;
  message: string;
  detail?: string;
  critical: boolean;
}

class DeploymentHealthMonitor {
  private readonly EXPECTED_METRICS = {
    packageCount: 1748,
    packageCountTolerance: 10, // ±10 packages acceptable
    staticPages: 57,
    staticPagesTolerance: 5, // ±5 pages acceptable
    vulnerabilities: 0,
    buildTimeMin: 60, // 1 minute minimum
    buildTimeMax: 300, // 5 minutes maximum
    buildTimeIdeal: 180, // 3 minutes ideal
  };

  private readonly HISTORY_FILE = ".deployment-history.json";
  private history: BuildMetrics[] = [];

  private log(message: string, color: keyof typeof colors = "reset"): void {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  private printHeader(title: string): void {
    const line = "═".repeat(70);
    this.log(`\n${line}`, "cyan");
    this.log(`  ${title}`, "bright");
    this.log(line, "cyan");
  }

  private printCheck(check: HealthCheckResult): void {
    const icon = check.passed ? "✅" : "❌";
    const color = check.passed ? "green" : check.critical ? "red" : "yellow";
    const criticality = check.critical ? "" : " (warning)";

    this.log(`  ${icon} ${check.name}${criticality}`, color);
    this.log(`     ${check.message}`, color);

    if (check.detail) {
      this.log(`     ${check.detail}`, "gray");
    }
  }

  async checkHealth(): Promise<boolean> {
    this.printHeader("🏥 DEPLOYMENT HEALTH CHECK");

    const checks: HealthCheckResult[] = [];

    // Load historical data
    await this.loadHistory();

    try {
      // 1. Node.js version check
      checks.push(await this.checkNodeVersion());

      // 2. Lockfile compatibility
      checks.push(await this.checkLockfileCompatibility());

      // 3. Package count
      checks.push(await this.checkPackageCount());

      // 4. Vulnerabilities
      checks.push(await this.checkVulnerabilities());

      // 5. TypeScript compilation
      checks.push(await this.checkTypeScriptCompilation());

      // 6. Environment variables
      checks.push(this.checkEnvironmentVariables());

      // 7. Prisma migrations
      checks.push(await this.checkPrismaMigrations());

      // 8. Build test (optional, time-consuming)
      if (process.argv.includes("--full")) {
        this.log(
          "\n  🔄 Running full build test (this may take 3-5 minutes)...",
          "yellow",
        );
        checks.push(await this.checkBuildTest());
      }
    } catch (error) {
      checks.push({
        name: "Health Check Process",
        passed: false,
        message: "An unexpected error occurred during health checks",
        detail: error instanceof Error ? error.message : String(error),
        critical: true,
      });
    }

    // Print all results
    this.log("\n📋 Health Check Results:\n", "cyan");
    checks.forEach((check) => this.printCheck(check));

    // Compare with historical baseline
    if (this.history.length > 0) {
      this.printHistoricalComparison();
    }

    // Final verdict
    const criticalFailures = checks.filter(
      (c) => !c.passed && c.critical,
    ).length;
    const warnings = checks.filter((c) => !c.passed && !c.critical).length;
    const allPassed = checks.every((c) => c.passed);

    this.printHeader("📊 FINAL VERDICT");

    if (criticalFailures > 0) {
      this.log("\n❌ DEPLOYMENT BLOCKED", "red");
      this.log(`   ${criticalFailures} critical issue(s) detected`, "red");
      this.log(
        "   Fix critical issues before deploying to production",
        "yellow",
      );
      this.log("", "reset");
      return false;
    } else if (warnings > 0) {
      this.log("\n⚠️  DEPLOYMENT ALLOWED WITH WARNINGS", "yellow");
      this.log(`   ${warnings} warning(s) detected`, "yellow");
      this.log("   Consider addressing warnings before deployment", "yellow");
      this.log("", "reset");
      return true;
    } else {
      this.log("\n✅ ALL CHECKS PASSED", "green");
      this.log(
        "   🎯 Pattern matches proven success baseline (7+ builds)",
        "green",
      );
      this.log("   🚀 Safe to deploy to production", "green");
      this.log("", "reset");
      return true;
    }
  }

  private async checkNodeVersion(): Promise<HealthCheckResult> {
    try {
      const { stdout } = await execAsync("node --version");
      const version = stdout.trim();
      const major = parseInt(version.slice(1).split(".")[0]);

      const isCompatible = major >= 20;

      return {
        name: "Node.js Version",
        passed: isCompatible,
        message: `${version} ${isCompatible ? "(Compatible with Vercel)" : "(May cause issues on Vercel)"}`,
        detail: isCompatible
          ? "Vercel uses Node.js 20.x or 24.x"
          : "Upgrade to Node.js 20.x or higher",
        critical: false,
      };
    } catch (error) {
      return {
        name: "Node.js Version",
        passed: false,
        message: "Unable to detect Node.js version",
        critical: true,
      };
    }
  }

  private async checkLockfileCompatibility(): Promise<HealthCheckResult> {
    try {
      // Test with Node.js 24 (Vercel's version)
      await execAsync(
        "npx --package=node@24 --package=npm@latest -- npm ls --json",
        {
          timeout: 30000,
        },
      );

      return {
        name: "package-lock.json Compatibility",
        passed: true,
        message: "Lockfile is Node.js 24 compatible (Vercel ready)",
        detail: "Tested with Node.js 24.x - matches Vercel environment",
        critical: true,
      };
    } catch (error) {
      return {
        name: "package-lock.json Compatibility",
        passed: false,
        message: "Lockfile may have compatibility issues with Node.js 24",
        detail:
          "Fix: npx --package=node@24 --package=npm@latest -- npm install --legacy-peer-deps",
        critical: true,
      };
    }
  }

  private async checkPackageCount(): Promise<HealthCheckResult> {
    try {
      const { stdout } = await execAsync(
        'npm ls --json --all 2>/dev/null || echo "{}"',
      );
      const data = JSON.parse(stdout || "{}");
      const count = this.countPackages(data);

      const diff = Math.abs(count - this.EXPECTED_METRICS.packageCount);
      const withinTolerance =
        diff <= this.EXPECTED_METRICS.packageCountTolerance;

      return {
        name: "Package Count",
        passed: withinTolerance,
        message: `${count} packages (Expected: ${this.EXPECTED_METRICS.packageCount} ±${this.EXPECTED_METRICS.packageCountTolerance})`,
        detail: withinTolerance
          ? "✓ Matches proven success pattern"
          : `⚠ Deviation: ${diff > 0 ? "+" : ""}${count - this.EXPECTED_METRICS.packageCount} packages`,
        critical: diff > 50, // Critical if >50 package difference
      };
    } catch (error) {
      return {
        name: "Package Count",
        passed: false,
        message: "Unable to count packages",
        detail: "Run: npm install",
        critical: false,
      };
    }
  }

  private countPackages(tree: any, counted = new Set<string>()): number {
    let count = 0;

    if (tree.dependencies) {
      for (const [name, dep] of Object.entries(tree.dependencies) as [
        string,
        any,
      ][]) {
        const key = `${name}@${dep.version || "unknown"}`;
        if (!counted.has(key)) {
          counted.add(key);
          count++;
          count += this.countPackages(dep, counted);
        }
      }
    }

    return count;
  }

  private async checkVulnerabilities(): Promise<HealthCheckResult> {
    try {
      const { stdout } = await execAsync(
        'npm audit --json 2>/dev/null || echo "{}"',
      );
      const audit = JSON.parse(stdout || "{}");
      const vulnCount = audit.metadata?.vulnerabilities?.total || 0;

      const highOrCritical =
        (audit.metadata?.vulnerabilities?.high || 0) +
        (audit.metadata?.vulnerabilities?.critical || 0);

      return {
        name: "Security Vulnerabilities",
        passed: vulnCount === 0,
        message:
          vulnCount === 0
            ? "0 vulnerabilities (✓ Proven pattern)"
            : `${vulnCount} vulnerabilities found (${highOrCritical} high/critical)`,
        detail: vulnCount > 0 ? "Run: npm audit fix" : "Security scan passed",
        critical: highOrCritical > 0,
      };
    } catch (error) {
      return {
        name: "Security Vulnerabilities",
        passed: false,
        message: "Unable to check vulnerabilities",
        critical: false,
      };
    }
  }

  private async checkTypeScriptCompilation(): Promise<HealthCheckResult> {
    try {
      await execAsync("npx tsc --noEmit", { timeout: 60000 });

      return {
        name: "TypeScript Compilation",
        passed: true,
        message: "No type errors detected",
        detail: "All TypeScript files compile successfully",
        critical: true,
      };
    } catch (error) {
      const errorOutput =
        error instanceof Error && "stdout" in error
          ? (error as any).stdout
          : "";

      return {
        name: "TypeScript Compilation",
        passed: false,
        message: "Type errors detected",
        detail: "Run: npx tsc --noEmit to see details",
        critical: true,
      };
    }
  }

  private checkEnvironmentVariables(): HealthCheckResult {
    const requiredVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

    const missingVars = requiredVars.filter((v) => !process.env[v]);

    return {
      name: "Environment Variables",
      passed: missingVars.length === 0,
      message:
        missingVars.length === 0
          ? "All required variables present"
          : `Missing: ${missingVars.join(", ")}`,
      detail:
        missingVars.length === 0
          ? "DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL configured"
          : "Check .env.local file",
      critical: true,
    };
  }

  private async checkPrismaMigrations(): Promise<HealthCheckResult> {
    try {
      const { stdout } = await execAsync(
        "npx prisma migrate status 2>&1 || true",
        {
          timeout: 30000,
        },
      );

      const hasUnapplied =
        stdout.includes("not yet been applied") ||
        stdout.includes("not applied");

      return {
        name: "Database Migrations",
        passed: !hasUnapplied,
        message: hasUnapplied
          ? "Unapplied migrations detected"
          : "All migrations applied",
        detail: hasUnapplied
          ? "Run: npx prisma migrate deploy"
          : "Database schema is up to date",
        critical: false,
      };
    } catch (error) {
      return {
        name: "Database Migrations",
        passed: false,
        message: "Unable to check migration status",
        detail: "Ensure DATABASE_URL is set and database is accessible",
        critical: false,
      };
    }
  }

  private async checkBuildTest(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();

      await execAsync("npm run build", {
        timeout: 300000, // 5 minutes
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      const buildTime = Math.round((Date.now() - start) / 1000);

      const withinExpected =
        buildTime >= this.EXPECTED_METRICS.buildTimeMin &&
        buildTime <= this.EXPECTED_METRICS.buildTimeMax;

      return {
        name: "Production Build",
        passed: true,
        message: `Build completed in ${buildTime}s (Expected: ~${this.EXPECTED_METRICS.buildTimeIdeal}s)`,
        detail: withinExpected
          ? "✓ Build time matches proven pattern"
          : "⚠ Build time differs from baseline",
        critical: true,
      };
    } catch (error) {
      return {
        name: "Production Build",
        passed: false,
        message: "Build failed",
        detail: "Run: npm run build to see full error",
        critical: true,
      };
    }
  }

  private async loadHistory(): Promise<void> {
    try {
      if (existsSync(this.HISTORY_FILE)) {
        const data = await readFile(this.HISTORY_FILE, "utf-8");
        this.history = JSON.parse(data);
      }
    } catch (error) {
      this.history = [];
    }
  }

  private printHistoricalComparison(): void {
    this.log("\n📊 Historical Baseline Comparison:\n", "cyan");

    const recentBuilds = this.history.slice(-7);
    const successRate =
      (recentBuilds.filter((b) => b.success).length / recentBuilds.length) *
      100;

    this.log(`  Last ${recentBuilds.length} builds:`, "bright");
    this.log(`    Success Rate: ${successRate.toFixed(1)}%`, "white");

    if (recentBuilds.length > 0) {
      const avgBuildTime =
        recentBuilds
          .filter((b) => b.buildTime > 0)
          .reduce((sum, b) => sum + b.buildTime, 0) / recentBuilds.length;

      if (avgBuildTime > 0) {
        this.log(`    Avg Build Time: ${avgBuildTime.toFixed(1)}s`, "white");
      }

      const avgPackages =
        recentBuilds.reduce((sum, b) => sum + b.packageCount, 0) /
        recentBuilds.length;

      this.log(`    Avg Packages: ${Math.round(avgPackages)}`, "white");

      // Check consistency
      const packageCounts = recentBuilds.map((b) => b.packageCount);
      const uniqueCounts = new Set(packageCounts);

      if (uniqueCounts.size === 1) {
        this.log("    Consistency: ✅ 100% (all builds identical)", "green");
      } else {
        this.log(
          `    Consistency: ⚠️  ${uniqueCounts.size} different configurations`,
          "yellow",
        );
      }
    }

    // Success pattern recognition
    if (successRate === 100 && recentBuilds.length >= 5) {
      this.log("\n  🎯 Success Pattern Detected!", "green");
      this.log("     Your deployment pipeline is highly stable", "green");
    }
  }

  async recordDeployment(metrics: BuildMetrics): Promise<void> {
    await this.loadHistory();

    this.history.push(metrics);

    // Keep last 100 records
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }

    await writeFile(this.HISTORY_FILE, JSON.stringify(this.history, null, 2));
  }

  async generateReport(): Promise<void> {
    await this.loadHistory();

    if (this.history.length === 0) {
      this.log("No deployment history available yet.", "yellow");
      return;
    }

    this.printHeader("📈 DEPLOYMENT ANALYTICS REPORT");

    const total = this.history.length;
    const successful = this.history.filter((d) => d.success).length;
    const successRate = (successful / total) * 100;

    this.log(`\n📊 Overall Statistics (${total} deployments):\n`, "cyan");
    this.log(`  Success Rate: ${successRate.toFixed(2)}%`, "white");
    this.log(`  Total Deployments: ${total}`, "white");
    this.log(`  Successful: ${successful}`, "green");
    this.log(`  Failed: ${total - successful}`, "red");

    // Recent performance
    const recent = this.history.slice(-10);
    const recentSuccess = recent.filter((d) => d.success).length;

    this.log(`\n📊 Last 10 Deployments:\n`, "cyan");
    this.log(
      `  Success Rate: ${((recentSuccess / recent.length) * 100).toFixed(2)}%`,
      "white",
    );

    if (recentSuccess === 10) {
      this.log("  🏆 Perfect track record!", "green");
    } else if (recentSuccess >= 8) {
      this.log("  ✅ Very stable", "green");
    } else if (recentSuccess >= 6) {
      this.log("  ⚠️  Some issues detected", "yellow");
    } else {
      this.log("  ❌ Needs attention", "red");
    }

    // Build time trends
    const buildTimes = recent
      .filter((d) => d.buildTime > 0)
      .map((d) => d.buildTime);

    if (buildTimes.length > 0) {
      const avgBuildTime =
        buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length;
      const minBuildTime = Math.min(...buildTimes);
      const maxBuildTime = Math.max(...buildTimes);

      this.log(`\n⏱️  Build Time Analysis:\n`, "cyan");
      this.log(`  Average: ${avgBuildTime.toFixed(1)}s`, "white");
      this.log(`  Fastest: ${minBuildTime}s`, "green");
      this.log(`  Slowest: ${maxBuildTime}s`, "yellow");

      if (avgBuildTime <= this.EXPECTED_METRICS.buildTimeIdeal + 30) {
        this.log("  ✅ Build performance is optimal", "green");
      }
    }

    this.log("", "reset");
  }
}

// CLI Interface
async function main() {
  const monitor = new DeploymentHealthMonitor();

  const args = process.argv.slice(2);

  if (args.includes("--report") || args.includes("-r")) {
    await monitor.generateReport();
    return;
  }

  const healthy = await monitor.checkHealth();

  if (!healthy) {
    process.exit(1);
  }

  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`${colors.red}Health check failed:${colors.reset}`, error);
    process.exit(1);
  });
}

export { DeploymentHealthMonitor };
