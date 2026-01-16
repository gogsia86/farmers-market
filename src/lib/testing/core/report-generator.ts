/**
 * Report Generator - Unified Reporting System
 *
 * Generates comprehensive reports in multiple formats:
 * - JSON (machine-readable)
 * - Markdown (human-readable)
 * - HTML (visual dashboards)
 * - Console (real-time feedback)
 *
 * Supports historical tracking, trend analysis, and notifications.
 */

import { logger } from "@/lib/monitoring/logger";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import type { BotResult } from "../types";
import type { TestRunReport, TestSummary } from "./test-runner";

export interface ReportOptions {
  outputDir: string;
  formats: ReportFormat[];
  includeScreenshots?: boolean;
  includeLogs?: boolean;
  includeMetrics?: boolean;
  historicalComparison?: boolean;
}

export type ReportFormat = "json" | "markdown" | "html" | "console";

export interface GeneratedReport {
  format: ReportFormat;
  path?: string;
  content?: string;
  success: boolean;
  error?: string;
}

export interface HistoricalData {
  timestamp: string;
  summary: TestSummary;
  results: BotResult[];
}

export class ReportGenerator {
  private options: ReportOptions;
  private history: HistoricalData[] = [];

  constructor(options: ReportOptions) {
    this.options = options;
  }

  /**
   * Generate reports in all configured formats
   */
  async generateReports(report: TestRunReport): Promise<GeneratedReport[]> {
    logger.info("[ReportGenerator] Generating reports", {
      formats: this.options.formats,
    });

    const generated: GeneratedReport[] = [];

    // Ensure output directory exists
    if (this.options.formats.some((f) => f !== "console")) {
      await this.ensureOutputDirectory();
    }

    // Store in history for trend analysis
    this.addToHistory(report);

    // Generate each format
    for (const format of this.options.formats) {
      try {
        const result = await this.generateReport(report, format);
        generated.push(result);
      } catch (error) {
        logger.error(
          `[ReportGenerator] Failed to generate ${format} report:`,
          error instanceof Error ? error : new Error(String(error)),
        );
        generated.push({
          format,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return generated;
  }

  /**
   * Generate a single report in specified format
   */
  private async generateReport(
    report: TestRunReport,
    format: ReportFormat,
  ): Promise<GeneratedReport> {
    switch (format) {
      case "json":
        return await this.generateJsonReport(report);
      case "markdown":
        return await this.generateMarkdownReport(report);
      case "html":
        return await this.generateHtmlReport(report);
      case "console":
        return this.generateConsoleReport(report);
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }
  }

  /**
   * Generate JSON report
   */
  private async generateJsonReport(
    report: TestRunReport,
  ): Promise<GeneratedReport> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `test-report-${timestamp}.json`;
    const filepath = join(this.options.outputDir, filename);

    const jsonReport = {
      ...report,
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: "Unified Bot Framework",
        version: "1.0.0",
      },
      history: this.options.historicalComparison
        ? this.getRecentHistory(5)
        : undefined,
    };

    await writeFile(filepath, JSON.stringify(jsonReport, null, 2), "utf-8");

    logger.info(`[ReportGenerator] JSON report saved: ${filepath}`);

    return {
      format: "json",
      path: filepath,
      success: true,
    };
  }

  /**
   * Generate Markdown report
   */
  private async generateMarkdownReport(
    report: TestRunReport,
  ): Promise<GeneratedReport> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `test-report-${timestamp}.md`;
    const filepath = join(this.options.outputDir, filename);

    const content = this.buildMarkdownContent(report);

    await writeFile(filepath, content, "utf-8");

    logger.info(`[ReportGenerator] Markdown report saved: ${filepath}`);

    return {
      format: "markdown",
      path: filepath,
      success: true,
    };
  }

  /**
   * Build Markdown content
   */
  private buildMarkdownContent(report: TestRunReport): string {
    const lines: string[] = [];

    // Header
    lines.push("# 🌾 Farmers Market Platform - Test Report\n");
    lines.push(`**Generated:** ${new Date(report.endTime).toLocaleString()}\n`);
    lines.push(`**Duration:** ${this.formatDuration(report.duration)}\n`);
    lines.push("---\n");

    // Summary
    lines.push("## 📊 Summary\n");
    lines.push("| Metric | Value |");
    lines.push("|--------|-------|");
    lines.push(`| Total Tests | ${report.summary.total} |`);
    lines.push(`| ✅ Passed | ${report.summary.passed} |`);
    lines.push(`| ❌ Failed | ${report.summary.failed} |`);
    lines.push(`| ⏭️ Skipped | ${report.summary.skipped} |`);
    lines.push(`| Success Rate | ${report.summary.successRate.toFixed(2)}% |`);
    lines.push(
      `| Avg Duration | ${this.formatDuration(report.summary.avgDuration)} |`,
    );
    lines.push(
      `| Total Duration | ${this.formatDuration(report.summary.totalDuration)} |`,
    );
    lines.push("");

    // Status badge
    const statusEmoji =
      report.summary.successRate === 100
        ? "✅"
        : report.summary.successRate >= 80
          ? "⚠️"
          : "❌";
    lines.push(
      `**Overall Status:** ${statusEmoji} ${this.getStatusText(report.summary.successRate)}\n`,
    );

    // Detailed Results
    lines.push("## 📝 Detailed Results\n");

    // Group by status
    const passed = report.results.filter((r) => r.status === "success");
    const failed = report.results.filter((r) => r.status === "failed");
    const skipped = report.results.filter((r) => r.status === "skipped");

    // Failed tests (most important)
    if (failed.length > 0) {
      lines.push("### ❌ Failed Tests\n");
      failed.forEach((result, index) => {
        lines.push(`#### ${index + 1}. ${result.moduleName}`);
        lines.push(`- **Module ID:** \`${result.moduleId}\``);
        lines.push(`- **Duration:** ${this.formatDuration(result.duration)}`);
        lines.push(`- **Error:** ${result.error || "Unknown error"}`);
        if (result.screenshot) {
          lines.push(`- **Screenshot:** \`${result.screenshot}\``);
        }
        if (result.details) {
          lines.push(`- **Details:**`);
          lines.push("  ```json");
          lines.push(`  ${JSON.stringify(result.details, null, 2)}`);
          lines.push("  ```");
        }
        lines.push("");
      });
    }

    // Passed tests
    if (passed.length > 0) {
      lines.push("### ✅ Passed Tests\n");
      lines.push("| # | Module | Duration |");
      lines.push("|---|--------|----------|");
      passed.forEach((result, index) => {
        lines.push(
          `| ${index + 1} | ${result.moduleName} | ${this.formatDuration(result.duration)} |`,
        );
      });
      lines.push("");
    }

    // Skipped tests
    if (skipped.length > 0) {
      lines.push("### ⏭️ Skipped Tests\n");
      skipped.forEach((result, index) => {
        lines.push(
          `${index + 1}. ${result.moduleName} - \`${result.moduleId}\``,
        );
      });
      lines.push("");
    }

    // Configuration
    lines.push("## ⚙️ Configuration\n");
    lines.push("```json");
    lines.push(
      JSON.stringify(
        {
          baseUrl: report.config.baseUrl,
          headless: report.config.browser.headless,
          retryAttempts: report.config.retryAttempts,
          timeout: report.config.browser.timeout,
          screenshot: report.config.reporting.screenshotOnFailure,
        },
        null,
        2,
      ),
    );
    lines.push("```\n");

    // Historical comparison (if available)
    if (this.options.historicalComparison && this.history.length > 1) {
      lines.push("## 📈 Trend Analysis\n");
      lines.push(this.buildTrendAnalysis());
    }

    // Footer
    lines.push("---");
    lines.push("*Generated by Unified Bot Framework v1.0.0*");

    return lines.join("\n");
  }

  /**
   * Generate HTML report
   */
  private async generateHtmlReport(
    report: TestRunReport,
  ): Promise<GeneratedReport> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `test-report-${timestamp}.html`;
    const filepath = join(this.options.outputDir, filename);

    const content = this.buildHtmlContent(report);

    await writeFile(filepath, content, "utf-8");

    logger.info(`[ReportGenerator] HTML report saved: ${filepath}`);

    return {
      format: "html",
      path: filepath,
      success: true,
    };
  }

  /**
   * Build HTML content
   */
  private buildHtmlContent(report: TestRunReport): string {
    const statusColor =
      report.summary.successRate === 100
        ? "#10b981"
        : report.summary.successRate >= 80
          ? "#f59e0b"
          : "#ef4444";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - ${new Date(report.endTime).toLocaleDateString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f3f4f6;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .header p { opacity: 0.9; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .metric {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: ${statusColor};
      margin-bottom: 0.5rem;
    }
    .metric-label { color: #6b7280; font-size: 0.875rem; text-transform: uppercase; }
    .results {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .result-item {
      padding: 1rem;
      border-left: 4px solid;
      margin-bottom: 1rem;
      background: #f9fafb;
      border-radius: 4px;
    }
    .result-item.success { border-color: #10b981; }
    .result-item.failed { border-color: #ef4444; }
    .result-item.skipped { border-color: #6b7280; }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .result-name { font-weight: 600; font-size: 1.1rem; }
    .result-duration { color: #6b7280; font-size: 0.875rem; }
    .result-error {
      background: #fee2e2;
      color: #991b1b;
      padding: 0.75rem;
      border-radius: 4px;
      margin-top: 0.5rem;
      font-family: monospace;
      font-size: 0.875rem;
    }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-badge.success { background: #d1fae5; color: #065f46; }
    .status-badge.failed { background: #fee2e2; color: #991b1b; }
    .status-badge.skipped { background: #e5e7eb; color: #374151; }
    .progress-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin: 1rem 0;
    }
    .progress-fill {
      height: 100%;
      background: ${statusColor};
      transition: width 0.3s ease;
    }
    .chart { margin: 2rem 0; }
    h2 { margin: 2rem 0 1rem; color: #1f2937; }
    .footer {
      text-align: center;
      color: #6b7280;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌾 Farmers Market Platform - Test Report</h1>
      <p>Generated: ${new Date(report.endTime).toLocaleString()}</p>
      <p>Duration: ${this.formatDuration(report.duration)}</p>
    </div>

    <div class="summary">
      <div class="metric">
        <div class="metric-value">${report.summary.total}</div>
        <div class="metric-label">Total Tests</div>
      </div>
      <div class="metric">
        <div class="metric-value" style="color: #10b981;">${report.summary.passed}</div>
        <div class="metric-label">Passed</div>
      </div>
      <div class="metric">
        <div class="metric-value" style="color: #ef4444;">${report.summary.failed}</div>
        <div class="metric-label">Failed</div>
      </div>
      <div class="metric">
        <div class="metric-value" style="color: #6b7280;">${report.summary.skipped}</div>
        <div class="metric-label">Skipped</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.summary.successRate.toFixed(1)}%</div>
        <div class="metric-label">Success Rate</div>
      </div>
      <div class="metric">
        <div class="metric-value">${this.formatDuration(report.summary.avgDuration)}</div>
        <div class="metric-label">Avg Duration</div>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style="width: ${report.summary.successRate}%"></div>
    </div>

    <div class="results">
      <h2>📝 Test Results</h2>
      ${report.results
        .map(
          (result) => `
        <div class="result-item ${result.status}">
          <div class="result-header">
            <div class="result-name">${result.moduleName}</div>
            <div>
              <span class="status-badge ${result.status}">${result.status}</span>
              <span class="result-duration">${this.formatDuration(result.duration)}</span>
            </div>
          </div>
          <div style="color: #6b7280; font-size: 0.875rem;">${result.moduleId}</div>
          ${result.error ? `<div class="result-error">${this.escapeHtml(result.error)}</div>` : ""}
          ${result.screenshot ? `<div style="margin-top: 0.5rem;"><a href="${result.screenshot}" target="_blank">📸 View Screenshot</a></div>` : ""}
        </div>
      `,
        )
        .join("")}
    </div>

    <div class="footer">
      <p>Generated by Unified Bot Framework v1.0.0</p>
      <p>Powered by Claude Sonnet 4.5</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Generate console report (output to terminal)
   */
  private generateConsoleReport(report: TestRunReport): GeneratedReport {
    console.log("\n" + "=".repeat(80));
    console.log("🌾 FARMERS MARKET PLATFORM - TEST REPORT");
    console.log("=".repeat(80) + "\n");

    // Summary
    console.log("📊 SUMMARY:");
    console.log(`  Total:        ${report.summary.total}`);
    console.log(`  ✅ Passed:    ${report.summary.passed}`);
    console.log(`  ❌ Failed:    ${report.summary.failed}`);
    console.log(`  ⏭️  Skipped:   ${report.summary.skipped}`);
    console.log(`  Success Rate: ${report.summary.successRate.toFixed(2)}%`);
    console.log(
      `  Avg Duration: ${this.formatDuration(report.summary.avgDuration)}`,
    );
    console.log(`  Duration:     ${this.formatDuration(report.duration)}\n`);

    // Status
    const statusEmoji =
      report.summary.successRate === 100
        ? "✅"
        : report.summary.successRate >= 80
          ? "⚠️"
          : "❌";
    console.log(
      `${statusEmoji} Overall Status: ${this.getStatusText(report.summary.successRate)}\n`,
    );

    // Failed tests (if any)
    const failed = report.results.filter((r) => r.status === "failed");
    if (failed.length > 0) {
      console.log("❌ FAILED TESTS:");
      failed.forEach((result, index) => {
        console.log(`\n  ${index + 1}. ${result.moduleName}`);
        console.log(`     Module: ${result.moduleId}`);
        console.log(`     Duration: ${this.formatDuration(result.duration)}`);
        console.log(`     Error: ${result.error || "Unknown error"}`);
        if (result.screenshot) {
          console.log(`     Screenshot: ${result.screenshot}`);
        }
      });
      console.log("");
    }

    // Passed tests summary
    const passed = report.results.filter((r) => r.status === "success");
    if (passed.length > 0) {
      console.log(`✅ PASSED TESTS: ${passed.length}`);
      passed.forEach((result, index) => {
        console.log(
          `  ${index + 1}. ${result.moduleName} (${this.formatDuration(result.duration)})`,
        );
      });
      console.log("");
    }

    console.log("=".repeat(80) + "\n");

    return {
      format: "console",
      success: true,
    };
  }

  /**
   * Add report to history for trend analysis
   */
  private addToHistory(report: TestRunReport): void {
    this.history.push({
      timestamp: report.endTime,
      summary: report.summary,
      results: report.results,
    });

    // Keep last 30 runs
    if (this.history.length > 30) {
      this.history.shift();
    }
  }

  /**
   * Get recent history
   */
  private getRecentHistory(count: number): HistoricalData[] {
    return this.history.slice(-count);
  }

  /**
   * Build trend analysis
   */
  private buildTrendAnalysis(): string {
    const lines: string[] = [];
    const recent = this.getRecentHistory(10);

    if (recent.length < 2) {
      return "Not enough historical data for trend analysis.\n";
    }

    lines.push("| Run | Date | Passed | Failed | Success Rate |");
    lines.push("|-----|------|--------|--------|--------------|");

    recent.forEach((data, index) => {
      const date = new Date(data.timestamp).toLocaleString();
      lines.push(
        `| ${index + 1} | ${date} | ${data.summary.passed} | ${data.summary.failed} | ${data.summary.successRate.toFixed(1)}% |`,
      );
    });

    lines.push("");

    // Calculate trends
    const current = recent[recent.length - 1];
    const previous = recent[recent.length - 2];

    const successRateDiff =
      current.summary.successRate - previous.summary.successRate;
    const trend =
      successRateDiff > 0
        ? "📈 Improving"
        : successRateDiff < 0
          ? "📉 Declining"
          : "➡️ Stable";

    lines.push(
      `**Trend:** ${trend} (${successRateDiff > 0 ? "+" : ""}${successRateDiff.toFixed(2)}%)\n`,
    );

    return lines.join("\n");
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await mkdir(this.options.outputDir, { recursive: true });
    } catch (error) {
      logger.error(
        "[ReportGenerator] Failed to create output directory:",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Get status text based on success rate
   */
  private getStatusText(successRate: number): string {
    if (successRate === 100) return "Perfect! All tests passed";
    if (successRate >= 90) return "Excellent";
    if (successRate >= 80) return "Good";
    if (successRate >= 70) return "Fair";
    if (successRate >= 50) return "Needs Attention";
    return "Critical - Many Failures";
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
    logger.info("[ReportGenerator] History cleared");
  }

  /**
   * Get history
   */
  getHistory(): HistoricalData[] {
    return [...this.history];
  }
}

/**
 * Create a report generator instance
 */
export function createReportGenerator(options: ReportOptions): ReportGenerator {
  return new ReportGenerator(options);
}

/**
 * Quick report generation helper
 */
export async function generateQuickReport(
  report: TestRunReport,
  outputDir: string,
): Promise<GeneratedReport[]> {
  const generator = createReportGenerator({
    outputDir,
    formats: ["json", "markdown", "console"],
  });

  return await generator.generateReports(report);
}
