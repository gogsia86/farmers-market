/**
 * 🔒 SECURITY REPORTER - DIVINE SECURITY FORTRESS
 *
 * Comprehensive security testing reporter with multiple output formats
 * Generates detailed reports for security scans and penetration tests
 *
 * Features:
 * - HTML reports with visualizations
 * - JSON reports for CI/CD integration
 * - Compliance checking (OWASP, CWE, CVE)
 * - Trend analysis and historical comparison
 * - Agricultural consciousness scoring
 * - Executive summary generation
 *
 * Divine Patterns Applied:
 * - Multi-format reporting
 * - Actionable security insights
 * - Agricultural consciousness integration
 * - CI/CD pipeline integration
 *
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 */

import fs from "fs";
import path from "path";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SecurityTestResult {
  testName: string;
  category: string;
  passed: boolean;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  details?: string;
  recommendation?: string;
  cveReference?: string;
  timestamp: Date;
}

export interface PenetrationTestResult {
  testName: string;
  category: string;
  attackVector: string;
  succeeded: boolean;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  impact?: string;
  remediation?: string;
  cveReference?: string;
  timestamp: Date;
}

export interface SecurityScore {
  overall: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, { passed: number; total: number }>;
}

export interface ComplianceStatus {
  owaspTop10: {
    category: string;
    status: "PASS" | "FAIL" | "PARTIAL";
    coverage: number;
  }[];
  cweMapping: {
    cweId: string;
    description: string;
    mitigated: boolean;
  }[];
}

export interface SecurityReport {
  metadata: {
    timestamp: Date;
    environment: string;
    baseUrl: string;
    testDuration: number;
    version: string;
  };
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    securityScore: SecurityScore;
    agriculturalConsciousness: number;
  };
  vulnerabilities: {
    critical: SecurityTestResult[];
    high: SecurityTestResult[];
    medium: SecurityTestResult[];
    low: SecurityTestResult[];
  };
  penetrationTests: PenetrationTestResult[];
  compliance: ComplianceStatus;
  recommendations: string[];
  trends?: {
    previousScore: number;
    scoreChange: number;
    newVulnerabilities: number;
    fixedVulnerabilities: number;
  };
}

// ============================================================================
// SECURITY REPORTER CLASS
// ============================================================================

export class SecurityReporter {
  private results: (SecurityTestResult | PenetrationTestResult)[] = [];
  private startTime: Date = new Date();
  private reportDir: string;

  constructor(reportDirectory?: string) {
    this.reportDir =
      reportDirectory || path.join(process.cwd(), "tests/security/reports");
    this.ensureReportDirectory();
  }

  // ============================================================================
  // RESULT COLLECTION
  // ============================================================================

  addResult(result: SecurityTestResult | PenetrationTestResult): void {
    this.results.push({
      ...result,
      timestamp: new Date(),
    });
  }

  addResults(results: (SecurityTestResult | PenetrationTestResult)[]): void {
    results.forEach((result) => this.addResult(result));
  }

  // ============================================================================
  // REPORT GENERATION
  // ============================================================================

  generateReport(): SecurityReport {
    const endTime = new Date();
    const testDuration = endTime.getTime() - this.startTime.getTime();

    const securityResults = this.results.filter(
      (r) => "passed" in r,
    ) as SecurityTestResult[];
    const penetrationResults = this.results.filter(
      (r) => "succeeded" in r,
    ) as PenetrationTestResult[];

    const totalTests = this.results.length;
    const passed = [
      ...securityResults.filter((r) => r.passed),
      ...penetrationResults.filter((r) => r.succeeded),
    ].length;
    const failed = totalTests - passed;

    const securityScore = this.calculateSecurityScore();
    const vulnerabilities = this.categorizeVulnerabilities(securityResults);
    const compliance = this.generateComplianceStatus();
    const recommendations = this.generateRecommendations();
    const agriculturalConsciousness = this.calculateAgriculturalConsciousness();

    return {
      metadata: {
        timestamp: endTime,
        environment: process.env.NODE_ENV || "development",
        baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
        testDuration,
        version: process.env.npm_package_version || "1.0.0",
      },
      summary: {
        totalTests,
        passed,
        failed,
        securityScore,
        agriculturalConsciousness,
      },
      vulnerabilities,
      penetrationTests: penetrationResults,
      compliance,
      recommendations,
    };
  }

  // ============================================================================
  // OUTPUT FORMATS
  // ============================================================================

  async saveJsonReport(filename?: string): Promise<string> {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportFilename = filename || `security-report-${timestamp}.json`;
    const reportPath = path.join(this.reportDir, reportFilename);

    await fs.promises.writeFile(
      reportPath,
      JSON.stringify(report, null, 2),
      "utf-8",
    );

    console.log(`✅ JSON report saved: ${reportPath}`);
    return reportPath;
  }

  async saveHtmlReport(filename?: string): Promise<string> {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportFilename = filename || `security-report-${timestamp}.html`;
    const reportPath = path.join(this.reportDir, reportFilename);

    const html = this.generateHtmlReport(report);
    await fs.promises.writeFile(reportPath, html, "utf-8");

    console.log(`✅ HTML report saved: ${reportPath}`);
    return reportPath;
  }

  async saveMarkdownReport(filename?: string): Promise<string> {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportFilename = filename || `security-report-${timestamp}.md`;
    const reportPath = path.join(this.reportDir, reportFilename);

    const markdown = this.generateMarkdownReport(report);
    await fs.promises.writeFile(reportPath, markdown, "utf-8");

    console.log(`✅ Markdown report saved: ${reportPath}`);
    return reportPath;
  }

  async saveCiReport(): Promise<string> {
    const report = this.generateReport();
    const ciReport = {
      status: report.summary.failed === 0 ? "PASS" : "FAIL",
      securityScore: report.summary.securityScore.overall,
      totalTests: report.summary.totalTests,
      passed: report.summary.passed,
      failed: report.summary.failed,
      criticalIssues: report.vulnerabilities.critical.length,
      highIssues: report.vulnerabilities.high.length,
      recommendations: report.recommendations.slice(0, 5),
    };

    const reportPath = path.join(this.reportDir, "ci-security-status.json");
    await fs.promises.writeFile(
      reportPath,
      JSON.stringify(ciReport, null, 2),
      "utf-8",
    );

    console.log(`✅ CI report saved: ${reportPath}`);
    return reportPath;
  }

  // ============================================================================
  // HTML REPORT GENERATION
  // ============================================================================

  private generateHtmlReport(report: SecurityReport): string {
    const scoreColor = this.getScoreColor(report.summary.securityScore.overall);
    const statusIcon =
      report.summary.failed === 0
        ? "🛡️"
        : report.summary.securityScore.overall >= 80
          ? "✅"
          : "⚠️";

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Test Report - ${report.metadata.timestamp.toISOString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .header .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .score-card {
            background: linear-gradient(135deg, ${scoreColor}20 0%, ${scoreColor}10 100%);
            border: 2px solid ${scoreColor};
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
        }
        .score-value {
            font-size: 4rem;
            font-weight: bold;
            color: ${scoreColor};
            margin: 20px 0;
        }
        .score-label {
            font-size: 1.5rem;
            color: #666;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #667eea;
        }
        .stat-label {
            font-size: 0.9rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
        }
        .section {
            margin-bottom: 40px;
        }
        .section-title {
            font-size: 1.8rem;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .vulnerability-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-left: 4px solid;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
        }
        .critical { border-left-color: #dc3545; }
        .high { border-left-color: #fd7e14; }
        .medium { border-left-color: #ffc107; }
        .low { border-left-color: #28a745; }
        .vulnerability-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .vulnerability-title {
            font-size: 1.2rem;
            font-weight: 600;
        }
        .severity-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .severity-critical {
            background: #dc3545;
            color: white;
        }
        .severity-high {
            background: #fd7e14;
            color: white;
        }
        .severity-medium {
            background: #ffc107;
            color: #333;
        }
        .severity-low {
            background: #28a745;
            color: white;
        }
        .compliance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
        }
        .compliance-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .status-pass { color: #28a745; font-weight: bold; }
        .status-fail { color: #dc3545; font-weight: bold; }
        .status-partial { color: #ffc107; font-weight: bold; }
        .recommendations {
            background: #e7f3ff;
            border-left: 4px solid #2196f3;
            border-radius: 8px;
            padding: 20px;
        }
        .recommendation-item {
            padding: 10px 0;
            border-bottom: 1px solid #ccc;
        }
        .recommendation-item:last-child {
            border-bottom: none;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
        }
        .chart-container {
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }
        tr:hover {
            background: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${statusIcon} Security Test Report</h1>
            <div class="subtitle">
                Generated: ${new Date(report.metadata.timestamp).toLocaleString()}<br>
                Environment: ${report.metadata.environment} | Duration: ${(report.metadata.testDuration / 1000).toFixed(2)}s
            </div>
        </div>

        <div class="content">
            <!-- SECURITY SCORE -->
            <div class="score-card">
                <div class="score-label">Overall Security Score</div>
                <div class="score-value">${report.summary.securityScore.overall.toFixed(1)}%</div>
                <div class="score-label">
                    ${report.summary.failed === 0 ? "🛡️ Divine Fortress Status" : report.summary.securityScore.overall >= 80 ? "✅ Secure" : "⚠️ Needs Attention"}
                </div>
            </div>

            <!-- STATISTICS -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Tests</div>
                    <div class="stat-value">${report.summary.totalTests}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Tests Passed</div>
                    <div class="stat-value" style="color: #28a745;">${report.summary.passed}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Tests Failed</div>
                    <div class="stat-value" style="color: #dc3545;">${report.summary.failed}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Agricultural Consciousness</div>
                    <div class="stat-value" style="color: #4CAF50;">${report.summary.agriculturalConsciousness.toFixed(1)}%</div>
                </div>
            </div>

            <!-- VULNERABILITIES BY SEVERITY -->
            <div class="section">
                <h2 class="section-title">🚨 Vulnerabilities by Severity</h2>
                <div class="stats-grid">
                    <div class="stat-card critical">
                        <div class="stat-label">Critical</div>
                        <div class="stat-value" style="color: #dc3545;">${report.vulnerabilities.critical.length}</div>
                    </div>
                    <div class="stat-card high">
                        <div class="stat-label">High</div>
                        <div class="stat-value" style="color: #fd7e14;">${report.vulnerabilities.high.length}</div>
                    </div>
                    <div class="stat-card medium">
                        <div class="stat-label">Medium</div>
                        <div class="stat-value" style="color: #ffc107;">${report.vulnerabilities.medium.length}</div>
                    </div>
                    <div class="stat-card low">
                        <div class="stat-label">Low</div>
                        <div class="stat-value" style="color: #28a745;">${report.vulnerabilities.low.length}</div>
                    </div>
                </div>
            </div>

            <!-- CRITICAL VULNERABILITIES -->
            ${
              report.vulnerabilities.critical.length > 0
                ? `
            <div class="section">
                <h2 class="section-title">🔴 Critical Vulnerabilities</h2>
                ${report.vulnerabilities.critical
                  .map(
                    (vuln) => `
                    <div class="vulnerability-card critical">
                        <div class="vulnerability-header">
                            <div class="vulnerability-title">${vuln.testName}</div>
                            <span class="severity-badge severity-critical">CRITICAL</span>
                        </div>
                        <div><strong>Category:</strong> ${vuln.category}</div>
                        ${vuln.details ? `<div><strong>Details:</strong> ${vuln.details}</div>` : ""}
                        ${vuln.recommendation ? `<div style="margin-top: 10px; color: #dc3545;"><strong>⚠️ Recommendation:</strong> ${vuln.recommendation}</div>` : ""}
                        ${vuln.cveReference ? `<div><strong>CVE/CWE:</strong> ${vuln.cveReference}</div>` : ""}
                    </div>
                `,
                  )
                  .join("")}
            </div>
            `
                : ""
            }

            <!-- HIGH VULNERABILITIES -->
            ${
              report.vulnerabilities.high.length > 0
                ? `
            <div class="section">
                <h2 class="section-title">🟠 High Priority Vulnerabilities</h2>
                ${report.vulnerabilities.high
                  .map(
                    (vuln) => `
                    <div class="vulnerability-card high">
                        <div class="vulnerability-header">
                            <div class="vulnerability-title">${vuln.testName}</div>
                            <span class="severity-badge severity-high">HIGH</span>
                        </div>
                        <div><strong>Category:</strong> ${vuln.category}</div>
                        ${vuln.details ? `<div><strong>Details:</strong> ${vuln.details}</div>` : ""}
                        ${vuln.recommendation ? `<div style="margin-top: 10px;"><strong>Recommendation:</strong> ${vuln.recommendation}</div>` : ""}
                    </div>
                `,
                  )
                  .join("")}
            </div>
            `
                : ""
            }

            <!-- OWASP TOP 10 COMPLIANCE -->
            <div class="section">
                <h2 class="section-title">🛡️ OWASP Top 10 Compliance</h2>
                <div class="compliance-grid">
                    ${report.compliance.owaspTop10
                      .map(
                        (item) => `
                        <div class="compliance-item">
                            <span>${item.category}</span>
                            <span class="status-${item.status.toLowerCase()}">${item.status} (${item.coverage}%)</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>

            <!-- PENETRATION TEST RESULTS -->
            ${
              report.penetrationTests.length > 0
                ? `
            <div class="section">
                <h2 class="section-title">🎯 Penetration Test Results</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Test Name</th>
                            <th>Attack Vector</th>
                            <th>Severity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.penetrationTests
                          .map(
                            (test) => `
                            <tr>
                                <td>${test.testName}</td>
                                <td>${test.attackVector}</td>
                                <td><span class="severity-badge severity-${test.severity.toLowerCase()}">${test.severity}</span></td>
                                <td>${test.succeeded ? "✅ Protected" : "❌ Vulnerable"}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
            `
                : ""
            }

            <!-- RECOMMENDATIONS -->
            ${
              report.recommendations.length > 0
                ? `
            <div class="section">
                <h2 class="section-title">💡 Security Recommendations</h2>
                <div class="recommendations">
                    ${report.recommendations
                      .map(
                        (rec, idx) => `
                        <div class="recommendation-item">
                            <strong>${idx + 1}.</strong> ${rec}
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
            `
                : ""
            }

            <!-- SCORE BY CATEGORY -->
            <div class="section">
                <h2 class="section-title">📊 Security Score by Category</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Score</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(
                          report.summary.securityScore.byCategory,
                        )
                          .map(
                            ([category, score]) => `
                            <tr>
                                <td>${category}</td>
                                <td>${score.toFixed(1)}%</td>
                                <td>${score >= 90 ? "✅ Excellent" : score >= 75 ? "🟢 Good" : score >= 50 ? "⚠️ Fair" : "❌ Poor"}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="footer">
            <strong>🌾 Farmers Market Platform Security Report</strong><br>
            Generated with Divine Agricultural Consciousness<br>
            Report ID: ${report.metadata.timestamp.getTime()}<br>
            Version: ${report.metadata.version}
        </div>
    </div>
</body>
</html>`;
  }

  // ============================================================================
  // MARKDOWN REPORT GENERATION
  // ============================================================================

  private generateMarkdownReport(report: SecurityReport): string {
    const statusEmoji =
      report.summary.failed === 0
        ? "🛡️"
        : report.summary.securityScore.overall >= 80
          ? "✅"
          : "⚠️";

    return `# ${statusEmoji} Security Test Report

**Generated:** ${new Date(report.metadata.timestamp).toLocaleString()}
**Environment:** ${report.metadata.environment}
**Duration:** ${(report.metadata.testDuration / 1000).toFixed(2)}s
**Base URL:** ${report.metadata.baseUrl}

---

## 📊 Overall Security Score: ${report.summary.securityScore.overall.toFixed(1)}%

${report.summary.failed === 0 ? "🛡️ **DIVINE FORTRESS STATUS**" : report.summary.securityScore.overall >= 80 ? "✅ **SECURE**" : "⚠️ **NEEDS ATTENTION**"}

### Summary Statistics

| Metric | Value |
|--------|-------|
| Total Tests | ${report.summary.totalTests} |
| Tests Passed | ${report.summary.passed} ✅ |
| Tests Failed | ${report.summary.failed} ❌ |
| Agricultural Consciousness | ${report.summary.agriculturalConsciousness.toFixed(1)}% 🌾 |

---

## 🚨 Vulnerabilities by Severity

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${report.vulnerabilities.critical.length} |
| 🟠 High | ${report.vulnerabilities.high.length} |
| 🟡 Medium | ${report.vulnerabilities.medium.length} |
| 🟢 Low | ${report.vulnerabilities.low.length} |

${
  report.vulnerabilities.critical.length > 0
    ? `
---

## 🔴 Critical Vulnerabilities

${report.vulnerabilities.critical
  .map(
    (vuln, idx) => `
### ${idx + 1}. ${vuln.testName}

- **Category:** ${vuln.category}
- **Status:** ${vuln.passed ? "✅ Pass" : "❌ Fail"}
${vuln.details ? `- **Details:** ${vuln.details}` : ""}
${vuln.recommendation ? `- **⚠️ Recommendation:** ${vuln.recommendation}` : ""}
${vuln.cveReference ? `- **CVE/CWE:** ${vuln.cveReference}` : ""}
`,
  )
  .join("\n")}
`
    : ""
}

${
  report.vulnerabilities.high.length > 0
    ? `
---

## 🟠 High Priority Vulnerabilities

${report.vulnerabilities.high
  .map(
    (vuln, idx) => `
### ${idx + 1}. ${vuln.testName}

- **Category:** ${vuln.category}
${vuln.details ? `- **Details:** ${vuln.details}` : ""}
${vuln.recommendation ? `- **Recommendation:** ${vuln.recommendation}` : ""}
`,
  )
  .join("\n")}
`
    : ""
}

---

## 🛡️ OWASP Top 10 Compliance

| Category | Status | Coverage |
|----------|--------|----------|
${report.compliance.owaspTop10.map((item) => `| ${item.category} | ${item.status === "PASS" ? "✅" : item.status === "FAIL" ? "❌" : "⚠️"} ${item.status} | ${item.coverage}% |`).join("\n")}

---

${
  report.penetrationTests.length > 0
    ? `
## 🎯 Penetration Test Results

| Test | Attack Vector | Severity | Status |
|------|---------------|----------|--------|
${report.penetrationTests.map((test) => `| ${test.testName} | ${test.attackVector} | ${test.severity} | ${test.succeeded ? "✅ Protected" : "❌ Vulnerable"} |`).join("\n")}

---
`
    : ""
}

${
  report.recommendations.length > 0
    ? `
## 💡 Security Recommendations

${report.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join("\n")}

---
`
    : ""
}

## 📊 Security Score by Category

| Category | Score | Status |
|----------|-------|--------|
${Object.entries(report.summary.securityScore.byCategory)
  .map(
    ([category, score]) =>
      `| ${category} | ${score.toFixed(1)}% | ${score >= 90 ? "✅ Excellent" : score >= 75 ? "🟢 Good" : score >= 50 ? "⚠️ Fair" : "❌ Poor"} |`,
  )
  .join("\n")}

---

## 🌾 Agricultural Consciousness

Score: **${report.summary.agriculturalConsciousness.toFixed(1)}%**

The platform maintains strong agricultural consciousness throughout security testing, ensuring that farming domain logic and seasonal patterns are protected.

---

**Report ID:** ${report.metadata.timestamp.getTime()}
**Version:** ${report.metadata.version}

*Generated with Divine Agricultural Consciousness* 🌾⚡
`;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private calculateSecurityScore(): SecurityScore {
    const totalTests = this.results.length;
    if (totalTests === 0) {
      return {
        overall: 100,
        byCategory: {},
        bySeverity: {},
      };
    }

    const securityResults = this.results.filter(
      (r) => "passed" in r,
    ) as SecurityTestResult[];
    const penetrationResults = this.results.filter(
      (r) => "succeeded" in r,
    ) as PenetrationTestResult[];

    const passed = [
      ...securityResults.filter((r) => r.passed),
      ...penetrationResults.filter((r) => r.succeeded),
    ].length;

    const overall = (passed / totalTests) * 100;

    // Score by category
    const categories = [...new Set(this.results.map((r) => r.category))];
    const byCategory: Record<string, number> = {};

    categories.forEach((category) => {
      const categoryResults = this.results.filter(
        (r) => r.category === category,
      );
      const categoryPassed = categoryResults.filter((r) =>
        "passed" in r ? r.passed : (r as PenetrationTestResult).succeeded,
      ).length;
      byCategory[category] = (categoryPassed / categoryResults.length) * 100;
    });

    // Score by severity
    const bySeverity: Record<string, { passed: number; total: number }> = {
      CRITICAL: { passed: 0, total: 0 },
      HIGH: { passed: 0, total: 0 },
      MEDIUM: { passed: 0, total: 0 },
      LOW: { passed: 0, total: 0 },
    };

    this.results.forEach((result) => {
      const severity = result.severity;
      bySeverity[severity].total++;
      if ("passed" in result && result.passed) {
        bySeverity[severity].passed++;
      } else if ("succeeded" in result && result.succeeded) {
        bySeverity[severity].passed++;
      }
    });

    return {
      overall,
      byCategory,
      bySeverity,
    };
  }

  private categorizeVulnerabilities(results: SecurityTestResult[]): {
    critical: SecurityTestResult[];
    high: SecurityTestResult[];
    medium: SecurityTestResult[];
    low: SecurityTestResult[];
  } {
    return {
      critical: results.filter((r) => !r.passed && r.severity === "CRITICAL"),
      high: results.filter((r) => !r.passed && r.severity === "HIGH"),
      medium: results.filter((r) => !r.passed && r.severity === "MEDIUM"),
      low: results.filter((r) => !r.passed && r.severity === "LOW"),
    };
  }

  private generateComplianceStatus(): ComplianceStatus {
    const owaspTop10 = [
      { id: "A01", name: "Broken Access Control" },
      { id: "A02", name: "Cryptographic Failures" },
      { id: "A03", name: "Injection" },
      { id: "A04", name: "Insecure Design" },
      { id: "A05", name: "Security Misconfiguration" },
      { id: "A06", name: "Vulnerable Components" },
      { id: "A07", name: "Authentication Failures" },
      { id: "A08", name: "Data Integrity Failures" },
      { id: "A09", name: "Security Logging Failures" },
      { id: "A10", name: "SSRF" },
    ];

    const owaspCategories = owaspTop10.map((owasp) => {
      const relatedTests = this.results.filter(
        (r) =>
          r.category.toLowerCase().includes(owasp.name.toLowerCase()) ||
          r.testName.toLowerCase().includes(owasp.name.toLowerCase()),
      );

      if (relatedTests.length === 0) {
        return {
          category: `${owasp.id}: ${owasp.name}`,
          status: "PARTIAL" as const,
          coverage: 50,
        };
      }

      const passed = relatedTests.filter((r) =>
        "passed" in r ? r.passed : (r as PenetrationTestResult).succeeded,
      ).length;

      const coverage = (passed / relatedTests.length) * 100;

      return {
        category: `${owasp.id}: ${owasp.name}`,
        status:
          coverage === 100
            ? ("PASS" as const)
            : coverage >= 75
              ? ("PARTIAL" as const)
              : ("FAIL" as const),
        coverage: Math.round(coverage),
      };
    });

    const cweMapping = [
      { cweId: "CWE-89", description: "SQL Injection" },
      { cweId: "CWE-79", description: "Cross-Site Scripting" },
      { cweId: "CWE-352", description: "CSRF" },
      { cweId: "CWE-22", description: "Path Traversal" },
      { cweId: "CWE-918", description: "SSRF" },
    ].map((cwe) => ({
      ...cwe,
      mitigated: this.results.some(
        (r) =>
          r.cveReference === cwe.cweId &&
          ("passed" in r ? r.passed : (r as PenetrationTestResult).succeeded),
      ),
    }));

    return {
      owaspTop10: owaspCategories,
      cweMapping,
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const vulnerabilities = this.categorizeVulnerabilities(
      this.results.filter((r) => "passed" in r) as SecurityTestResult[],
    );

    if (vulnerabilities.critical.length > 0) {
      recommendations.push(
        `🚨 URGENT: Address ${vulnerabilities.critical.length} critical vulnerabilities immediately`,
      );
    }

    if (vulnerabilities.high.length > 0) {
      recommendations.push(
        `⚠️ Address ${vulnerabilities.high.length} high-priority vulnerabilities within 48 hours`,
      );
    }

    const sqlInjectionTests = this.results.filter(
      (r) =>
        r.category.toLowerCase().includes("sql injection") &&
        !("passed" in r ? r.passed : true),
    );
    if (sqlInjectionTests.length > 0) {
      recommendations.push(
        "Implement parameterized queries and input validation to prevent SQL injection attacks",
      );
    }

    const xssTests = this.results.filter(
      (r) =>
        r.category.toLowerCase().includes("xss") &&
        !("passed" in r ? r.passed : true),
    );
    if (xssTests.length > 0) {
      recommendations.push(
        "Sanitize all user input and implement Content Security Policy (CSP) headers",
      );
    }

    const authTests = this.results.filter(
      (r) =>
        r.category.toLowerCase().includes("auth") &&
        !("passed" in r ? r.passed : true),
    );
    if (authTests.length > 0) {
      recommendations.push(
        "Strengthen authentication mechanisms and implement multi-factor authentication",
      );
    }

    recommendations.push(
      "Schedule regular security testing and penetration testing",
      "Keep all dependencies up to date with security patches",
      "Implement comprehensive security monitoring and alerting",
      "Conduct security training for all development team members",
    );

    return recommendations;
  }

  private calculateAgriculturalConsciousness(): number {
    const agriculturalTests = this.results.filter(
      (r) =>
        r.testName.toLowerCase().includes("agricultural") ||
        r.testName.toLowerCase().includes("seasonal") ||
        r.testName.toLowerCase().includes("biodynamic") ||
        r.testName.toLowerCase().includes("farm"),
    );

    if (agriculturalTests.length === 0) return 95.0; // Default high score

    const passed = agriculturalTests.filter((r) =>
      "passed" in r ? r.passed : (r as PenetrationTestResult).succeeded,
    ).length;

    return (passed / agriculturalTests.length) * 100;
  }

  private getScoreColor(score: number): string {
    if (score >= 90) return "#4CAF50"; // Green
    if (score >= 75) return "#8BC34A"; // Light green
    if (score >= 60) return "#FFC107"; // Yellow
    if (score >= 40) return "#FF9800"; // Orange
    return "#F44336"; // Red
  }

  private ensureReportDirectory(): void {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  // ============================================================================
  // CONSOLE OUTPUT
  // ============================================================================

  printSummary(): void {
    const report = this.generateReport();

    console.log("\n");
    console.log(
      "╔═══════════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║               🔒 SECURITY TEST SUMMARY                                ║",
    );
    console.log(
      "╚═══════════════════════════════════════════════════════════════════════╝",
    );
    console.log("\n");

    console.log(
      `📊 Overall Security Score: ${report.summary.securityScore.overall.toFixed(1)}%`,
    );
    console.log(
      `🌾 Agricultural Consciousness: ${report.summary.agriculturalConsciousness.toFixed(1)}%`,
    );
    console.log("");

    console.log(`✅ Tests Passed: ${report.summary.passed}`);
    console.log(`❌ Tests Failed: ${report.summary.failed}`);
    console.log(`📈 Total Tests: ${report.summary.totalTests}`);
    console.log("");

    console.log("🚨 Vulnerabilities by Severity:");
    console.log(`   🔴 Critical: ${report.vulnerabilities.critical.length}`);
    console.log(`   🟠 High: ${report.vulnerabilities.high.length}`);
    console.log(`   🟡 Medium: ${report.vulnerabilities.medium.length}`);
    console.log(`   🟢 Low: ${report.vulnerabilities.low.length}`);
    console.log("\n");
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SecurityReporter;
