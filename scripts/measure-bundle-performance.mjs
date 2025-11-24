#!/usr/bin/env node

/**
 * 📊 BUNDLE PERFORMANCE MEASUREMENT SCRIPT
 * Measures and reports bundle sizes across all routes
 *
 * Usage:
 *   node scripts/measure-bundle-performance.mjs
 *
 * Output:
 *   - Console report with bundle sizes
 *   - JSON file with detailed metrics
 *   - Pass/fail based on thresholds
 */

import { readdirSync, statSync, writeFileSync, existsSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// 🎯 Bundle Size Thresholds (in KB)
const THRESHOLDS = {
  api: {
    critical: 20, // Routes that should be ultra-light (e.g., health checks)
    standard: 50, // Most API routes
    heavy: 200, // Routes with unavoidable dependencies
  },
  pages: {
    standard: 100, // Most pages
    heavy: 300, // Complex pages (admin, dashboards)
  },
  chunks: {
    shared: 400, // Shared dependency chunks
    lazy: 300, // Lazy-loaded chunks
  },
};

// 📁 Directory paths
const PATHS = {
  server: join(projectRoot, ".next", "server"),
  analyze: join(projectRoot, ".next", "analyze"),
  report: join(projectRoot, "bundle-performance-report.json"),
};

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  try {
    const stats = statSync(filePath);
    return Math.round((stats.size / 1024) * 100) / 100;
  } catch {
    return 0;
  }
}

/**
 * Recursively find all JS files in directory
 */
function findJSFiles(dir, fileList = [], baseDir = dir) {
  if (!existsSync(dir)) return fileList;

  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findJSFiles(filePath, fileList, baseDir);
    } else if (file.endsWith(".js")) {
      const relativePath = relative(baseDir, filePath);
      fileList.push({
        path: relativePath,
        fullPath: filePath,
        size: stat.size,
        sizeKB: getFileSizeKB(filePath),
      });
    }
  });

  return fileList;
}

/**
 * Categorize routes by type
 */
function categorizeRoute(path) {
  if (path.includes("/api/")) {
    if (path.includes("/health") || path.includes("/ready")) {
      return "api-critical";
    }
    if (path.includes("/admin/")) {
      return "api-admin";
    }
    return "api-standard";
  }
  if (path.includes("/chunks/")) {
    return "chunk";
  }
  if (path.includes("middleware")) {
    return "middleware";
  }
  if (path.includes("/(admin)/")) {
    return "page-admin";
  }
  return "page-standard";
}

/**
 * Determine threshold for file
 */
function getThreshold(category) {
  switch (category) {
    case "api-critical":
      return THRESHOLDS.api.critical;
    case "api-standard":
      return THRESHOLDS.api.standard;
    case "api-admin":
      return THRESHOLDS.api.heavy;
    case "page-standard":
      return THRESHOLDS.pages.standard;
    case "page-admin":
      return THRESHOLDS.pages.heavy;
    case "chunk":
      return THRESHOLDS.chunks.shared;
    case "middleware":
      return THRESHOLDS.chunks.shared;
    default:
      return THRESHOLDS.api.standard;
  }
}

/**
 * Check if file passes threshold
 */
function checkThreshold(sizeKB, threshold) {
  return {
    passes: sizeKB <= threshold,
    percent: Math.round((sizeKB / threshold) * 100),
    overage: Math.max(0, sizeKB - threshold),
  };
}

/**
 * Main measurement function
 */
function measureBundles() {
  console.log("\n🔍 Measuring bundle performance...\n");

  if (!existsSync(PATHS.server)) {
    console.error(
      '❌ Error: .next/server directory not found. Run "npm run build" first.',
    );
    process.exit(1);
  }

  // Find all JS files
  const allFiles = findJSFiles(PATHS.server);

  // Categorize and analyze
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: allFiles.length,
      totalSize: 0,
      totalSizeKB: 0,
      totalSizeMB: 0,
      passing: 0,
      failing: 0,
      warnings: 0,
    },
    categories: {},
    topLargest: [],
    failures: [],
    successes: [],
  };

  // Group by category
  allFiles.forEach((file) => {
    const category = categorizeRoute(file.path);

    if (!results.categories[category]) {
      results.categories[category] = {
        count: 0,
        totalSize: 0,
        files: [],
      };
    }

    results.categories[category].count++;
    results.categories[category].totalSize += file.size;
    results.categories[category].files.push(file);

    results.summary.totalSize += file.size;

    // Check threshold
    const threshold = getThreshold(category);
    const check = checkThreshold(file.sizeKB, threshold);

    const result = {
      ...file,
      category,
      threshold,
      ...check,
    };

    if (check.passes) {
      results.summary.passing++;
      if (check.percent >= 80) {
        results.summary.warnings++;
      }
      results.successes.push(result);
    } else {
      results.summary.failing++;
      results.failures.push(result);
    }
  });

  // Calculate totals
  results.summary.totalSizeKB =
    Math.round((results.summary.totalSize / 1024) * 100) / 100;
  results.summary.totalSizeMB =
    Math.round((results.summary.totalSize / (1024 * 1024)) * 100) / 100;

  // Get top largest files
  results.topLargest = allFiles
    .sort((a, b) => b.size - a.size)
    .slice(0, 20)
    .map((file) => ({
      path: file.path,
      sizeKB: file.sizeKB,
      category: categorizeRoute(file.path),
    }));

  return results;
}

/**
 * Print report to console
 */
function printReport(results) {
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("  📊 BUNDLE PERFORMANCE REPORT");
  console.log(
    "═══════════════════════════════════════════════════════════════\n",
  );

  // Summary
  console.log("📈 SUMMARY");
  console.log("─────────────────────────────────────────────────────────────");
  console.log(`  Total Files:       ${results.summary.totalFiles}`);
  console.log(
    `  Total Size:        ${formatBytes(results.summary.totalSize)} (${results.summary.totalSizeMB} MB)`,
  );
  console.log(`  Passing:           ${results.summary.passing} ✅`);
  console.log(`  Warnings:          ${results.summary.warnings} ⚠️`);
  console.log(`  Failing:           ${results.summary.failing} ❌`);
  console.log("");

  // Category breakdown
  console.log("📁 BY CATEGORY");
  console.log("─────────────────────────────────────────────────────────────");
  Object.entries(results.categories).forEach(([category, data]) => {
    const avgSize =
      Math.round((data.totalSize / data.count / 1024) * 100) / 100;
    console.log(
      `  ${category.padEnd(20)} ${data.count.toString().padStart(4)} files  ${formatBytes(data.totalSize).padStart(10)}  (avg: ${avgSize} KB)`,
    );
  });
  console.log("");

  // Top largest files
  console.log("🔝 TOP 15 LARGEST FILES");
  console.log("─────────────────────────────────────────────────────────────");
  results.topLargest.slice(0, 15).forEach((file, i) => {
    const status = file.sizeKB <= getThreshold(file.category) ? "✅" : "❌";
    console.log(
      `  ${(i + 1).toString().padStart(2)}. ${status} ${file.sizeKB.toString().padStart(7)} KB  ${file.path}`,
    );
  });
  console.log("");

  // Failures
  if (results.failures.length > 0) {
    console.log("❌ THRESHOLD FAILURES");
    console.log(
      "─────────────────────────────────────────────────────────────",
    );
    results.failures
      .sort((a, b) => b.overage - a.overage)
      .slice(0, 10)
      .forEach((file) => {
        console.log(`  ${file.path}`);
        console.log(
          `    Size: ${file.sizeKB} KB | Threshold: ${file.threshold} KB | Over by: ${file.overage.toFixed(2)} KB (${file.percent}%)`,
        );
        console.log("");
      });
  }

  // Notable successes (optimized routes)
  const notableSuccesses = results.successes
    .filter((f) => f.category.startsWith("api") && f.sizeKB < 20)
    .sort((a, b) => a.sizeKB - b.sizeKB)
    .slice(0, 10);

  if (notableSuccesses.length > 0) {
    console.log("✅ HIGHLY OPTIMIZED ROUTES (< 20 KB)");
    console.log(
      "─────────────────────────────────────────────────────────────",
    );
    notableSuccesses.forEach((file) => {
      console.log(
        `  ✨ ${file.sizeKB.toString().padStart(6)} KB  ${file.path}`,
      );
    });
    console.log("");
  }

  // Warnings
  const warnings = results.successes
    .filter((f) => f.percent >= 80 && f.percent < 100)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);

  if (warnings.length > 0) {
    console.log("⚠️  NEAR THRESHOLD (80-100%)");
    console.log(
      "─────────────────────────────────────────────────────────────",
    );
    warnings.forEach((file) => {
      console.log(
        `  ${file.percent}% of limit  ${file.sizeKB} KB / ${file.threshold} KB  ${file.path}`,
      );
    });
    console.log("");
  }

  console.log(
    "═══════════════════════════════════════════════════════════════\n",
  );
}

/**
 * Main execution
 */
function main() {
  const results = measureBundles();
  printReport(results);

  // Save JSON report
  try {
    writeFileSync(PATHS.report, JSON.stringify(results, null, 2));
    console.log(
      `📄 Detailed report saved to: ${relative(projectRoot, PATHS.report)}\n`,
    );
  } catch (error) {
    console.error(`⚠️  Warning: Could not save report: ${error.message}\n`);
  }

  // Exit code based on failures
  if (results.summary.failing > 0) {
    console.log(
      `❌ ${results.summary.failing} file(s) exceeded size thresholds\n`,
    );
    process.exit(1);
  } else {
    console.log("✅ All bundles within size thresholds!\n");
    if (results.summary.warnings > 0) {
      console.log(
        `⚠️  Note: ${results.summary.warnings} file(s) are near threshold limits (80-100%)\n`,
      );
    }
    process.exit(0);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { measureBundles, printReport };
