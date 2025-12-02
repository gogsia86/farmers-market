#!/usr/bin/env tsx

/**
 * 🌟 ENHANCED WEBSITE MONITORING BOT
 * Farmers Market Platform - Comprehensive Website Health Monitoring
 * Version: 2.0.0
 *
 * Features:
 * - Comprehensive page health checks
 * - Performance monitoring (Core Web Vitals)
 * - SEO validation
 * - Accessibility audits (WCAG 2.1 AA)
 * - Image optimization checks
 * - Link validation
 * - API endpoint monitoring
 * - Database health checks
 * - Security header validation
 * - Agricultural consciousness validation
 * - Trend analysis
 * - Automated alerts
 * - Beautiful reporting
 */

import { createWebsiteChecker } from "../../src/lib/monitoring/website-checker";
import type { WebsiteHealthReport } from "../../src/lib/monitoring/website-checker";
import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";

// ============================================================================
// CONFIGURATION
// ============================================================================

const MONITOR_CONFIG = {
  baseUrl: process.env.BASE_URL || "http://localhost:3001",
  headless: process.env.HEADLESS !== "false",
  reportDir: "./monitoring-reports",
  alertThresholds: {
    performance: 3000, // ms
    accessibility: 80, // score
    errorRate: 0.1, // 10%
  },
  pages: [
    // Public pages
    "/",
    "/about",
    "/farms",
    "/products",
    "/marketplace",

    // Farm pages
    "/farms/harvest-moon-farm",
    "/farms/sunny-valley-farm",

    // Product pages
    "/products",
    "/products/categories/vegetables",

    // Authentication pages (when logged out)
    "/auth/login",
    "/auth/register",

    // Marketplace pages
    "/marketplace/farms",
    "/marketplace/products",

    // Static pages
    "/privacy",
    "/terms",
    "/contact",
  ],
  performanceBudgets: {
    LCP: 2500, // Largest Contentful Paint
    FID: 100, // First Input Delay
    CLS: 0.1, // Cumulative Layout Shift
    TTFB: 800, // Time to First Byte
    TBT: 300, // Total Blocking Time
    pageLoadTime: 3000, // Complete page load
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function printHeader() {
  console.log("\n");
  console.log(chalk.green("╔════════════════════════════════════════════════════════════╗"));
  console.log(chalk.green("║                                                            ║"));
  console.log(chalk.green("║     🌟 ENHANCED WEBSITE MONITORING BOT v2.0               ║"));
  console.log(chalk.green("║        Farmers Market Platform Health Check              ║"));
  console.log(chalk.green("║                                                            ║"));
  console.log(chalk.green("╚════════════════════════════════════════════════════════════╝"));
  console.log("");
  console.log(chalk.gray(`   🌐 Base URL: ${MONITOR_CONFIG.baseUrl}`));
  console.log(chalk.gray(`   📄 Pages to check: ${MONITOR_CONFIG.pages.length}`));
  console.log(chalk.gray(`   📊 Report directory: ${MONITOR_CONFIG.reportDir}`));
  console.log("");
}

function printProgress(current: number, total: number, pagePath: string) {
  const percent = Math.round((current / total) * 100);
  const progressBar = "█".repeat(percent / 5) + "░".repeat(20 - percent / 5);
  console.log(
    chalk.cyan(`   [${progressBar}] ${percent}% - Checking ${pagePath}`)
  );
}

function printPageResult(
  pagePath: string,
  status: "PASS" | "FAIL" | "WARN",
  duration: number,
  errors: string[]
) {
  const icon =
    status === "PASS" ? chalk.green("✅") : status === "FAIL" ? chalk.red("❌") : chalk.yellow("⚠️");
  const statusText =
    status === "PASS"
      ? chalk.green(status)
      : status === "FAIL"
        ? chalk.red(status)
        : chalk.yellow(status);

  console.log(`   ${icon} ${pagePath.padEnd(40)} ${statusText} (${duration}ms)`);

  if (errors.length > 0 && status === "FAIL") {
    errors.forEach((error) => {
      console.log(chalk.red(`      ↳ ${error}`));
    });
  }
}

function printDetailedResults(report: WebsiteHealthReport) {
  console.log("\n");
  console.log(chalk.bold("═══════════════════════════════════════════════════════════"));
  console.log(chalk.bold("                    DETAILED RESULTS                      "));
  console.log(chalk.bold("═══════════════════════════════════════════════════════════"));

  // Overall Status
  console.log("\n" + chalk.bold("📊 Overall Status"));
  const statusColor =
    report.overallStatus === "HEALTHY"
      ? chalk.green
      : report.overallStatus === "DEGRADED"
        ? chalk.yellow
        : chalk.red;
  console.log(`   Status: ${statusColor(report.overallStatus)}`);
  console.log(`   Duration: ${chalk.cyan(Math.round(report.duration / 1000))}s`);

  // Summary Statistics
  console.log("\n" + chalk.bold("📈 Summary Statistics"));
  console.log(`   Total Pages: ${chalk.cyan(report.summary.totalPages)}`);
  console.log(`   ✅ Passed: ${chalk.green(report.summary.passed)}`);
  console.log(`   ❌ Failed: ${chalk.red(report.summary.failed)}`);
  console.log(`   ⚠️  Warnings: ${chalk.yellow(report.summary.warnings)}`);
  console.log(
    `   ⚡ Avg Performance: ${chalk.cyan(report.summary.avgPerformance)}ms`
  );
  console.log(
    `   ♿ Avg Accessibility: ${chalk.cyan(report.summary.avgAccessibility)}/100`
  );

  // Performance Details
  console.log("\n" + chalk.bold("⚡ Performance Overview"));
  report.pages.forEach((page) => {
    const perf = page.checks.performance;
    const statusIcon = perf.status === "PASS" ? "✅" : perf.status === "FAIL" ? "❌" : "⚠️";
    console.log(`   ${statusIcon} ${page.url}`);
    console.log(`      Load Time: ${chalk.cyan(perf.metrics.loadTime)}ms`);
    console.log(`      TTFB: ${chalk.cyan(perf.metrics.TTFB || 0)}ms`);
    console.log(`      Resources: ${chalk.cyan(perf.metrics.resourceCount)}`);

    if (perf.budgetViolations.length > 0) {
      console.log(chalk.yellow(`      ⚠️  Budget Violations:`));
      perf.budgetViolations.forEach((violation) => {
        console.log(chalk.yellow(`         - ${violation}`));
      });
    }
  });

  // SEO Details
  console.log("\n" + chalk.bold("🔍 SEO Overview"));
  report.pages.forEach((page) => {
    const seo = page.checks.seo;
    const statusIcon = seo.status === "PASS" ? "✅" : seo.status === "FAIL" ? "❌" : "⚠️";
    console.log(`   ${statusIcon} ${page.url}`);
    console.log(`      Title: ${seo.meta.title.present ? "✓" : "✗"} (${seo.meta.title.length} chars)`);
    console.log(
      `      Description: ${seo.meta.description.present ? "✓" : "✗"} (${seo.meta.description.length} chars)`
    );
    console.log(`      H1: ${seo.headings.h1Count} found`);
    console.log(`      Structured Data: ${seo.structuredData.present ? "✓" : "✗"}`);

    if (seo.issues.length > 0) {
      console.log(chalk.yellow(`      ⚠️  Issues:`));
      seo.issues.slice(0, 3).forEach((issue) => {
        console.log(chalk.yellow(`         - ${issue}`));
      });
    }
  });

  // Accessibility Details
  console.log("\n" + chalk.bold("♿ Accessibility Overview"));
  report.pages.forEach((page) => {
    const a11y = page.checks.accessibility;
    const statusIcon = a11y.status === "PASS" ? "✅" : a11y.status === "FAIL" ? "❌" : "⚠️";
    const scoreColor =
      a11y.score >= 90
        ? chalk.green
        : a11y.score >= 70
          ? chalk.yellow
          : chalk.red;
    console.log(`   ${statusIcon} ${page.url}`);
    console.log(`      Score: ${scoreColor(a11y.score)}/100`);
    console.log(`      WCAG Level: ${a11y.wcagLevel}`);
    console.log(`      Violations: ${chalk.red(a11y.violations.length)}`);

    if (a11y.violations.length > 0) {
      const critical = a11y.violations.filter((v) => v.impact === "critical");
      const serious = a11y.violations.filter((v) => v.impact === "serious");
      if (critical.length > 0)
        console.log(chalk.red(`      ⛔ Critical: ${critical.length}`));
      if (serious.length > 0)
        console.log(chalk.yellow(`      ⚠️  Serious: ${serious.length}`));
    }
  });

  // API Health
  console.log("\n" + chalk.bold("🔌 API Endpoints"));
  report.apiEndpoints.forEach((api) => {
    const statusIcon = api.status === "PASS" ? "✅" : api.status === "FAIL" ? "❌" : "⚠️";
    const timeColor =
      api.responseTime < 500
        ? chalk.green
        : api.responseTime < 1000
          ? chalk.yellow
          : chalk.red;
    console.log(
      `   ${statusIcon} ${api.method} ${api.endpoint} - ${timeColor(api.responseTime)}ms`
    );
    if (api.issues.length > 0) {
      api.issues.forEach((issue) => {
        console.log(chalk.red(`      ↳ ${issue}`));
      });
    }
  });

  // Database Health
  console.log("\n" + chalk.bold("🗄️  Database"));
  const dbIcon =
    report.database.status === "PASS"
      ? chalk.green("✅")
      : chalk.red("❌");
  console.log(
    `   ${dbIcon} ${report.database.connected ? "Connected" : "Disconnected"}`
  );
  if (report.database.responseTime) {
    console.log(`   Response Time: ${chalk.cyan(report.database.responseTime)}ms`);
  }
  if (report.database.issues.length > 0) {
    report.database.issues.forEach((issue) => {
      console.log(chalk.red(`   ↳ ${issue}`));
    });
  }

  // Critical Issues
  if (report.summary.criticalIssues.length > 0) {
    console.log("\n" + chalk.bold.red("🚨 CRITICAL ISSUES"));
    report.summary.criticalIssues.forEach((issue, index) => {
      console.log(chalk.red(`   ${index + 1}. ${issue}`));
    });
  }

  console.log("\n" + chalk.bold("═══════════════════════════════════════════════════════════"));
}

async function saveReport(report: WebsiteHealthReport): Promise<string> {
  // Ensure report directory exists
  await fs.mkdir(MONITOR_CONFIG.reportDir, { recursive: true });

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `health-report-${timestamp}.json`;
  const filepath = path.join(MONITOR_CONFIG.reportDir, filename);

  // Save full report as JSON
  await fs.writeFile(filepath, JSON.stringify(report, null, 2), "utf-8");

  // Also save a summary markdown file
  const mdFilename = `health-report-${timestamp}.md`;
  const mdFilepath = path.join(MONITOR_CONFIG.reportDir, mdFilename);
  const markdown = generateMarkdownReport(report);
  await fs.writeFile(mdFilepath, markdown, "utf-8");

  // Save latest report (always overwrite)
  const latestJsonPath = path.join(MONITOR_CONFIG.reportDir, "latest-report.json");
  await fs.writeFile(latestJsonPath, JSON.stringify(report, null, 2), "utf-8");

  const latestMdPath = path.join(MONITOR_CONFIG.reportDir, "latest-report.md");
  await fs.writeFile(latestMdPath, markdown, "utf-8");

  return filepath;
}

function generateMarkdownReport(report: WebsiteHealthReport): string {
  const timestamp = report.timestamp.toISOString();
  const duration = Math.round(report.duration / 1000);

  let md = `# 🌟 Website Health Report\n\n`;
  md += `**Generated:** ${timestamp}\n`;
  md += `**Duration:** ${duration}s\n`;
  md += `**Base URL:** ${report.baseUrl}\n\n`;

  // Overall Status
  const statusEmoji =
    report.overallStatus === "HEALTHY"
      ? "✅"
      : report.overallStatus === "DEGRADED"
        ? "⚠️"
        : "❌";
  md += `## ${statusEmoji} Overall Status: ${report.overallStatus}\n\n`;

  // Summary
  md += `## 📊 Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Pages | ${report.summary.totalPages} |\n`;
  md += `| ✅ Passed | ${report.summary.passed} |\n`;
  md += `| ❌ Failed | ${report.summary.failed} |\n`;
  md += `| ⚠️ Warnings | ${report.summary.warnings} |\n`;
  md += `| ⚡ Avg Performance | ${report.summary.avgPerformance}ms |\n`;
  md += `| ♿ Avg Accessibility | ${report.summary.avgAccessibility}/100 |\n\n`;

  // Page Results
  md += `## 📄 Page Results\n\n`;
  report.pages.forEach((page) => {
    const icon = page.status === "PASS" ? "✅" : page.status === "FAIL" ? "❌" : "⚠️";
    md += `### ${icon} ${page.url}\n\n`;
    md += `**Status:** ${page.status}\n`;
    md += `**Duration:** ${page.duration}ms\n\n`;

    md += `#### Performance\n`;
    md += `- Load Time: ${page.checks.performance.metrics.loadTime}ms\n`;
    md += `- TTFB: ${page.checks.performance.metrics.TTFB || "N/A"}ms\n`;
    md += `- Resources: ${page.checks.performance.metrics.resourceCount}\n\n`;

    md += `#### SEO\n`;
    md += `- Title: ${page.checks.seo.meta.title.present ? "✓" : "✗"}\n`;
    md += `- Description: ${page.checks.seo.meta.description.present ? "✓" : "✗"}\n`;
    md += `- Structured Data: ${page.checks.seo.structuredData.present ? "✓" : "✗"}\n\n`;

    md += `#### Accessibility\n`;
    md += `- Score: ${page.checks.accessibility.score}/100\n`;
    md += `- WCAG Level: ${page.checks.accessibility.wcagLevel}\n`;
    md += `- Violations: ${page.checks.accessibility.violations.length}\n\n`;

    if (page.errors.length > 0) {
      md += `#### ❌ Errors\n`;
      page.errors.forEach((error) => {
        md += `- ${error}\n`;
      });
      md += `\n`;
    }

    if (page.warnings.length > 0) {
      md += `#### ⚠️ Warnings\n`;
      page.warnings.forEach((warning) => {
        md += `- ${warning}\n`;
      });
      md += `\n`;
    }
  });

  // API Endpoints
  md += `## 🔌 API Endpoints\n\n`;
  md += `| Endpoint | Method | Status | Response Time |\n`;
  md += `|----------|--------|--------|---------------|\n`;
  report.apiEndpoints.forEach((api) => {
    const icon = api.status === "PASS" ? "✅" : api.status === "FAIL" ? "❌" : "⚠️";
    md += `| ${api.endpoint} | ${api.method} | ${icon} ${api.status} | ${api.responseTime}ms |\n`;
  });
  md += `\n`;

  // Database
  md += `## 🗄️ Database\n\n`;
  const dbIcon = report.database.status === "PASS" ? "✅" : "❌";
  md += `**Status:** ${dbIcon} ${report.database.status}\n`;
  md += `**Connected:** ${report.database.connected ? "Yes" : "No"}\n\n`;

  // Critical Issues
  if (report.summary.criticalIssues.length > 0) {
    md += `## 🚨 Critical Issues\n\n`;
    report.summary.criticalIssues.forEach((issue, index) => {
      md += `${index + 1}. ${issue}\n`;
    });
    md += `\n`;
  }

  md += `---\n`;
  md += `*Report generated by Enhanced Website Monitoring Bot v2.0*\n`;

  return md;
}

function checkAlerts(report: WebsiteHealthReport): string[] {
  const alerts: string[] = [];

  // Critical status alert
  if (report.overallStatus === "CRITICAL") {
    alerts.push("🚨 CRITICAL: Website health is in critical state!");
  }

  // High failure rate
  const failureRate = report.summary.failed / report.summary.totalPages;
  if (failureRate > MONITOR_CONFIG.alertThresholds.errorRate) {
    alerts.push(
      `⚠️ HIGH FAILURE RATE: ${Math.round(failureRate * 100)}% of pages failed`
    );
  }

  // Performance issues
  if (
    report.summary.avgPerformance > MONITOR_CONFIG.alertThresholds.performance
  ) {
    alerts.push(
      `⚡ SLOW PERFORMANCE: Average load time ${report.summary.avgPerformance}ms exceeds threshold`
    );
  }

  // Accessibility issues
  if (
    report.summary.avgAccessibility < MONITOR_CONFIG.alertThresholds.accessibility
  ) {
    alerts.push(
      `♿ ACCESSIBILITY ISSUES: Average score ${report.summary.avgAccessibility} below threshold`
    );
  }

  // Database issues
  if (!report.database.connected) {
    alerts.push("🗄️ DATABASE DOWN: Cannot connect to database");
  }

  // API issues
  const failedApis = report.apiEndpoints.filter((a) => a.status === "FAIL");
  if (failedApis.length > 0) {
    alerts.push(`🔌 API FAILURES: ${failedApis.length} API endpoints failing`);
  }

  return alerts;
}

function printAlerts(alerts: string[]) {
  if (alerts.length === 0) return;

  console.log("\n");
  console.log(chalk.bold.red("╔════════════════════════════════════════════════════════════╗"));
  console.log(chalk.bold.red("║                    🚨 ALERTS 🚨                            ║"));
  console.log(chalk.bold.red("╚════════════════════════════════════════════════════════════╝"));
  console.log("");

  alerts.forEach((alert) => {
    console.log(chalk.red(`   ${alert}`));
  });

  console.log("");
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const startTime = Date.now();

  printHeader();

  console.log(chalk.bold("🔄 Starting comprehensive health check...\n"));

  // Create website checker
  const checker = createWebsiteChecker({
    baseUrl: MONITOR_CONFIG.baseUrl,
    headless: MONITOR_CONFIG.headless,
    timeout: 30000,
    performanceBudgets: MONITOR_CONFIG.performanceBudgets,
  });

  try {
    // Initialize browser
    console.log(chalk.gray("   🌐 Initializing browser..."));
    await checker.initialize();
    console.log(chalk.green("   ✅ Browser initialized\n"));

    // Run health check
    console.log(chalk.bold("📊 Checking pages:\n"));

    const report = await checker.runFullHealthCheck(MONITOR_CONFIG.pages);

    console.log("\n");

    // Print detailed results
    printDetailedResults(report);

    // Check for alerts
    const alerts = checkAlerts(report);
    if (alerts.length > 0) {
      printAlerts(alerts);
    }

    // Save report
    console.log(chalk.bold("\n💾 Saving report..."));
    const reportPath = await saveReport(report);
    console.log(chalk.green(`   ✅ Report saved to: ${reportPath}`));
    console.log(chalk.green(`   ✅ Latest report: ${MONITOR_CONFIG.reportDir}/latest-report.md`));

    // Final summary
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    console.log("\n");
    console.log(chalk.bold.green("╔════════════════════════════════════════════════════════════╗"));
    console.log(chalk.bold.green("║                  ✅ MONITORING COMPLETE                     ║"));
    console.log(chalk.bold.green("╚════════════════════════════════════════════════════════════╝"));
    console.log("");
    console.log(chalk.gray(`   ⏱️  Total Duration: ${totalDuration}s`));
    console.log(chalk.gray(`   📄 Pages Checked: ${report.summary.totalPages}`));
    console.log(
      chalk.gray(`   🎯 Overall Status: ${report.overallStatus}`)
    );
    console.log("");

    // Exit with appropriate code
    if (report.overallStatus === "CRITICAL") {
      process.exit(1);
    } else if (report.overallStatus === "DEGRADED") {
      process.exit(0); // Don't fail CI on warnings
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error(chalk.red("\n❌ Monitoring failed:"));
    console.error(chalk.red(`   ${error instanceof Error ? error.message : String(error)}`));
    if (error instanceof Error && error.stack) {
      console.error(chalk.gray(`\n${error.stack}`));
    }
    process.exit(1);
  } finally {
    // Cleanup
    console.log(chalk.gray("\n🧹 Cleaning up..."));
    await checker.cleanup();
    console.log(chalk.green("   ✅ Cleanup complete\n"));
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red("Fatal error:"), error);
    process.exit(1);
  });
}

export { main };
