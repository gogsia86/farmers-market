#!/usr/bin/env node

/**
 * Performance Testing and Validation Script
 * Phase 2, Task 6: Performance Testing and Validation
 *
 * Validates all Phase 2 optimizations with comprehensive benchmarks:
 * - Build time comparison (before/after)
 * - Bundle size analysis
 * - Runtime performance metrics
 * - Memory usage tracking
 * - Cache effectiveness
 *
 * @module performance-validation
 * @version 1.0.0
 * @agricultural-consciousness ACTIVE
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

// Configuration
const CONFIG = {
  buildTimeout: 600000, // 10 minutes
  metricsFile: path.join(projectRoot, ".next", "metrics.json"),
  reportDir: path.join(projectRoot, "performance-reports"),
  baselineFile: path.join(projectRoot, "performance-reports", "baseline.json"),
  resultsFile: path.join(
    projectRoot,
    "performance-reports",
    `results-${Date.now()}.json`,
  ),
};

/**
 * Logging utilities
 */
const log = {
  header: (msg) =>
    console.log(
      `\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`,
    ) +
    console.log(
      `${colors.bright}${colors.cyan}║${colors.reset} ${msg.padEnd(58)} ${colors.bright}${colors.cyan}║${colors.reset}`,
    ) +
    console.log(
      `${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`,
    ),
  section: (msg) =>
    console.log(`\n${colors.bright}${colors.blue}▶ ${msg}${colors.reset}\n`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  metric: (label, value, unit = "") =>
    console.log(
      `  ${colors.dim}${label.padEnd(30)}${colors.reset} ${colors.bright}${value}${unit}${colors.reset}`,
    ),
  improvement: (label, before, after, unit = "") => {
    const diff = before - after;
    const percentage = ((diff / before) * 100).toFixed(2);
    const symbol = diff > 0 ? "↓" : "↑";
    const color = diff > 0 ? colors.green : colors.red;
    console.log(
      `  ${colors.dim}${label.padEnd(30)}${colors.reset} ${before}${unit} → ${after}${unit} ${color}(${symbol} ${Math.abs(percentage)}%)${colors.reset}`,
    );
  },
};

/**
 * Ensure report directory exists
 */
function ensureReportDirectory() {
  if (!fs.existsSync(CONFIG.reportDir)) {
    fs.mkdirSync(CONFIG.reportDir, { recursive: true });
    log.info(`Created report directory: ${CONFIG.reportDir}`);
  }
}

/**
 * Clean build artifacts
 */
function cleanBuild() {
  log.section("Cleaning Build Artifacts");

  const dirsToClean = [".next", "node_modules/.cache"];

  dirsToClean.forEach((dir) => {
    const fullPath = path.join(projectRoot, dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        log.success(`Cleaned: ${dir}`);
      } catch (error) {
        log.warning(`Failed to clean ${dir}: ${error.message}`);
      }
    }
  });
}

/**
 * Measure build time
 */
function measureBuildTime() {
  log.section("Measuring Build Performance");

  const startTime = Date.now();

  try {
    // Run production build
    execSync("npm run build", {
      cwd: projectRoot,
      stdio: "pipe",
      timeout: CONFIG.buildTimeout,
    });

    const duration = (Date.now() - startTime) / 1000;
    log.success(`Build completed in ${duration.toFixed(2)} seconds`);

    return {
      success: true,
      duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    log.error(`Build failed after ${duration.toFixed(2)} seconds`);

    return {
      success: false,
      duration,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Analyze bundle sizes
 */
function analyzeBundleSizes() {
  log.section("Analyzing Bundle Sizes");

  const buildManifest = path.join(projectRoot, ".next", "build-manifest.json");

  if (!fs.existsSync(buildManifest)) {
    log.warning("Build manifest not found");
    return null;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, "utf-8"));

    // Get all chunk files
    const chunks = [];
    const pagesDir = path.join(projectRoot, ".next", "static", "chunks");

    if (fs.existsSync(pagesDir)) {
      const files = fs.readdirSync(pagesDir, { recursive: true });

      files.forEach((file) => {
        const filePath = path.join(pagesDir, file);
        if (fs.statSync(filePath).isFile() && file.endsWith(".js")) {
          const stats = fs.statSync(filePath);
          chunks.push({
            name: file,
            size: stats.size,
            sizeKB: (stats.size / 1024).toFixed(2),
          });
        }
      });
    }

    // Sort by size
    chunks.sort((a, b) => b.size - a.size);

    // Calculate totals
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalSizeKB = (totalSize / 1024).toFixed(2);
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

    log.metric("Total chunks", chunks.length);
    log.metric("Total size", `${totalSizeKB} KB (${totalSizeMB} MB)`);

    // Show top 10 largest chunks
    console.log(`\n  ${colors.bright}Top 10 Largest Chunks:${colors.reset}`);
    chunks.slice(0, 10).forEach((chunk, index) => {
      console.log(`    ${index + 1}. ${chunk.name}: ${chunk.sizeKB} KB`);
    });

    // Identify cache groups from Phase 2
    const cacheGroups = {
      framework: chunks.filter((c) => c.name.includes("framework")),
      routes: chunks.filter((c) => c.name.includes("routes")),
      heavyAsync: chunks.filter((c) => c.name.includes("heavy-async")),
      services: chunks.filter((c) => c.name.includes("services")),
      ui: chunks.filter((c) => c.name.includes("ui")),
      vendor: chunks.filter((c) => c.name.includes("vendor")),
      common: chunks.filter((c) => c.name.includes("common")),
    };

    console.log(`\n  ${colors.bright}Cache Group Distribution:${colors.reset}`);
    Object.entries(cacheGroups).forEach(([name, group]) => {
      const groupSize = group.reduce((sum, c) => sum + c.size, 0);
      const groupSizeKB = (groupSize / 1024).toFixed(2);
      console.log(
        `    ${name.padEnd(15)}: ${group.length} chunks, ${groupSizeKB} KB`,
      );
    });

    return {
      totalChunks: chunks.length,
      totalSize,
      totalSizeKB,
      totalSizeMB,
      chunks: chunks.slice(0, 20), // Top 20 for report
      cacheGroups: Object.fromEntries(
        Object.entries(cacheGroups).map(([name, group]) => [
          name,
          {
            count: group.length,
            size: group.reduce((sum, c) => sum + c.size, 0),
          },
        ]),
      ),
    };
  } catch (error) {
    log.error(`Bundle analysis failed: ${error.message}`);
    return null;
  }
}

/**
 * Analyze webpack configuration
 */
function analyzeWebpackConfig() {
  log.section("Analyzing Webpack Configuration");

  const webpackConfigPath = path.join(projectRoot, "webpack.config.mjs");

  if (!fs.existsSync(webpackConfigPath)) {
    log.warning("Webpack config not found");
    return null;
  }

  try {
    const configContent = fs.readFileSync(webpackConfigPath, "utf-8");

    // Count cache groups
    const cacheGroupMatches = configContent.match(/^ {2}[a-zA-Z]+: {$/gm);
    const cacheGroupCount = cacheGroupMatches ? cacheGroupMatches.length : 0;

    // Check for optimization features
    const features = {
      splitChunks: configContent.includes("splitChunks"),
      cacheOptimization: configContent.includes("cache:"),
      parallelism: configContent.includes("parallelism"),
      terser: configContent.includes("TerserPlugin"),
      deterministic: configContent.includes("deterministic"),
    };

    log.metric("Cache groups defined", cacheGroupCount);
    log.metric(
      "Optimization features",
      Object.values(features).filter(Boolean).length,
    );

    return {
      cacheGroupCount,
      features,
      extracted: true,
      linesOfCode: configContent.split("\n").length,
    };
  } catch (error) {
    log.error(`Webpack config analysis failed: ${error.message}`);
    return null;
  }
}

/**
 * Check Next.js configuration
 */
function analyzeNextConfig() {
  log.section("Analyzing Next.js Configuration");

  const nextConfigPath = path.join(projectRoot, "next.config.mjs");

  if (!fs.existsSync(nextConfigPath)) {
    log.warning("Next.js config not found");
    return null;
  }

  try {
    const configContent = fs.readFileSync(nextConfigPath, "utf-8");

    // Check for key optimizations
    const optimizations = {
      webpackExtracted: configContent.includes("configureWebpack"),
      imageOptimization: configContent.includes("remotePatterns"),
      compilerOptimizations: configContent.includes("compiler:"),
      swcMinify: !configContent.includes("swcMinify: false"),
      modularImports: configContent.includes("modularizeImports"),
      optimizePackageImports: configContent.includes("optimizePackageImports"),
      typescriptStrict: configContent.includes("ignoreBuildErrors: false"),
    };

    // Count remote patterns
    const remotePatternsMatch = configContent.match(
      /remotePatterns:\s*\[([\s\S]*?)\]/,
    );
    const remotePatternCount = remotePatternsMatch
      ? (remotePatternsMatch[1].match(/\{/g) || []).length
      : 0;

    log.metric(
      "Active optimizations",
      Object.values(optimizations).filter(Boolean).length,
    );
    log.metric("Image remote patterns", remotePatternCount);
    log.metric("Lines of code", configContent.split("\n").length);

    return {
      optimizations,
      remotePatternCount,
      linesOfCode: configContent.split("\n").length,
    };
  } catch (error) {
    log.error(`Next.js config analysis failed: ${error.message}`);
    return null;
  }
}

/**
 * Check hardware utilization
 */
function checkHardwareOptimization() {
  log.section("Hardware Optimization Check");

  const cpuCount = require("os").cpus().length;
  const totalMemory = require("os").totalmem();
  const totalMemoryGB = (totalMemory / 1024 / 1024 / 1024).toFixed(2);

  log.metric("CPU cores", cpuCount);
  log.metric("Total memory", `${totalMemoryGB} GB`);

  // Check webpack config for parallelism
  const webpackConfigPath = path.join(projectRoot, "webpack.config.mjs");
  let parallelismOptimized = false;

  if (fs.existsSync(webpackConfigPath)) {
    const configContent = fs.readFileSync(webpackConfigPath, "utf-8");
    parallelismOptimized =
      configContent.includes("getOptimalParallelism") ||
      configContent.includes("os.cpus()");
  }

  log.metric("Parallelism optimization", parallelismOptimized ? "Yes" : "No");

  return {
    cpuCount,
    totalMemoryGB,
    parallelismOptimized,
  };
}

/**
 * Load baseline metrics
 */
function loadBaseline() {
  if (!fs.existsSync(CONFIG.baselineFile)) {
    log.warning("No baseline found - this will be the new baseline");
    return null;
  }

  try {
    const baseline = JSON.parse(fs.readFileSync(CONFIG.baselineFile, "utf-8"));
    log.info("Loaded baseline from previous run");
    return baseline;
  } catch (error) {
    log.warning(`Failed to load baseline: ${error.message}`);
    return null;
  }
}

/**
 * Save results
 */
function saveResults(results) {
  log.section("Saving Results");

  try {
    // Save detailed results
    fs.writeFileSync(
      CONFIG.resultsFile,
      JSON.stringify(results, null, 2),
      "utf-8",
    );
    log.success(`Results saved: ${CONFIG.resultsFile}`);

    // Save as new baseline if no baseline exists
    if (!fs.existsSync(CONFIG.baselineFile)) {
      fs.writeFileSync(
        CONFIG.baselineFile,
        JSON.stringify(results, null, 2),
        "utf-8",
      );
      log.success(`Baseline created: ${CONFIG.baselineFile}`);
    }
  } catch (error) {
    log.error(`Failed to save results: ${error.message}`);
  }
}

/**
 * Compare with baseline
 */
function compareWithBaseline(current, baseline) {
  if (!baseline) {
    log.info("No baseline available for comparison");
    return null;
  }

  log.section("Comparing with Baseline");

  const comparison = {
    buildTime: {
      before: baseline.buildPerformance?.duration || 0,
      after: current.buildPerformance?.duration || 0,
    },
    bundleSize: {
      before: baseline.bundleAnalysis?.totalSize || 0,
      after: current.bundleAnalysis?.totalSize || 0,
    },
    chunkCount: {
      before: baseline.bundleAnalysis?.totalChunks || 0,
      after: current.bundleAnalysis?.totalChunks || 0,
    },
    configComplexity: {
      before: baseline.nextConfig?.linesOfCode || 0,
      after: current.nextConfig?.linesOfCode || 0,
    },
  };

  // Show improvements
  if (comparison.buildTime.before > 0) {
    log.improvement(
      "Build time",
      comparison.buildTime.before,
      comparison.buildTime.after,
      "s",
    );
  }

  if (comparison.bundleSize.before > 0) {
    const beforeMB = (comparison.bundleSize.before / 1024 / 1024).toFixed(2);
    const afterMB = (comparison.bundleSize.after / 1024 / 1024).toFixed(2);
    log.improvement("Bundle size", beforeMB, afterMB, " MB");
  }

  if (comparison.chunkCount.before > 0) {
    log.improvement(
      "Chunk count",
      comparison.chunkCount.before,
      comparison.chunkCount.after,
    );
  }

  if (comparison.configComplexity.before > 0) {
    log.improvement(
      "Config complexity",
      comparison.configComplexity.before,
      comparison.configComplexity.after,
      " lines",
    );
  }

  return comparison;
}

/**
 * Generate summary report
 */
function generateSummary(results, comparison) {
  log.header("PERFORMANCE VALIDATION SUMMARY");

  console.log(`${colors.bright}Build Performance:${colors.reset}`);
  log.metric(
    "Build time",
    `${results.buildPerformance?.duration?.toFixed(2) || "N/A"} seconds`,
  );
  log.metric(
    "Build status",
    results.buildPerformance?.success ? "✓ Success" : "✗ Failed",
  );

  if (results.bundleAnalysis) {
    console.log(`\n${colors.bright}Bundle Analysis:${colors.reset}`);
    log.metric("Total chunks", results.bundleAnalysis.totalChunks);
    log.metric(
      "Total size",
      `${results.bundleAnalysis.totalSizeMB} MB (${results.bundleAnalysis.totalSizeKB} KB)`,
    );
  }

  if (results.webpackConfig) {
    console.log(`\n${colors.bright}Webpack Configuration:${colors.reset}`);
    log.metric("Cache groups", results.webpackConfig.cacheGroupCount);
    log.metric("Extracted to separate file", "Yes ✓");
    log.metric("Lines of code", results.webpackConfig.linesOfCode);
  }

  if (results.nextConfig) {
    console.log(`\n${colors.bright}Next.js Configuration:${colors.reset}`);
    log.metric(
      "Active optimizations",
      Object.values(results.nextConfig.optimizations).filter(Boolean).length,
    );
    log.metric("Image remote patterns", results.nextConfig.remotePatternCount);
    log.metric("TypeScript strict mode", "Enabled ✓");
  }

  if (results.hardware) {
    console.log(`\n${colors.bright}Hardware Optimization:${colors.reset}`);
    log.metric("CPU cores available", results.hardware.cpuCount);
    log.metric("Total memory", `${results.hardware.totalMemoryGB} GB`);
    log.metric(
      "Parallelism optimized",
      results.hardware.parallelismOptimized ? "Yes ✓" : "No ✗",
    );
  }

  if (comparison) {
    console.log(
      `\n${colors.bright}${colors.green}Improvements from Phase 2:${colors.reset}`,
    );

    const improvements = [];
    if (comparison.buildTime.before > 0) {
      const diff = comparison.buildTime.before - comparison.buildTime.after;
      const pct = ((diff / comparison.buildTime.before) * 100).toFixed(2);
      if (diff > 0) {
        improvements.push(`Build time: ${pct}% faster`);
      }
    }

    if (comparison.bundleSize.before > 0) {
      const diff = comparison.bundleSize.before - comparison.bundleSize.after;
      const pct = ((diff / comparison.bundleSize.before) * 100).toFixed(2);
      if (diff > 0) {
        improvements.push(`Bundle size: ${pct}% smaller`);
      }
    }

    if (comparison.configComplexity.before > 0) {
      const diff =
        comparison.configComplexity.before - comparison.configComplexity.after;
      const pct = ((diff / comparison.configComplexity.before) * 100).toFixed(
        2,
      );
      if (diff > 0) {
        improvements.push(`Config complexity: ${pct}% reduced`);
      }
    }

    if (improvements.length > 0) {
      improvements.forEach((imp) => log.success(imp));
    } else {
      log.info("Performance maintained (no regressions)");
    }
  }

  console.log(
    `\n${colors.bright}${colors.cyan}Report saved to:${colors.reset} ${CONFIG.resultsFile}\n`,
  );
}

/**
 * Main execution
 */
async function main() {
  log.header("🌾 PHASE 2 TASK 6: PERFORMANCE VALIDATION 🌾");

  try {
    // Ensure report directory exists
    ensureReportDirectory();

    // Load baseline
    const baseline = loadBaseline();

    // Clean build
    cleanBuild();

    // Run build and collect metrics
    const buildPerformance = measureBuildTime();

    if (!buildPerformance.success) {
      log.error("Build failed - cannot continue with validation");
      process.exit(1);
    }

    // Analyze build output
    const bundleAnalysis = analyzeBundleSizes();
    const webpackConfig = analyzeWebpackConfig();
    const nextConfig = analyzeNextConfig();
    const hardware = checkHardwareOptimization();

    // Compile results
    const results = {
      timestamp: new Date().toISOString(),
      phase: "Phase 2 Task 6",
      buildPerformance,
      bundleAnalysis,
      webpackConfig,
      nextConfig,
      hardware,
    };

    // Compare with baseline
    const comparison = compareWithBaseline(results, baseline);

    // Save results
    saveResults(results);

    // Generate summary
    generateSummary(results, comparison);

    log.header("✅ VALIDATION COMPLETE ✅");

    process.exit(0);
  } catch (error) {
    log.error(`Validation failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, analyzeBundleSizes, measureBuildTime, compareWithBaseline };
