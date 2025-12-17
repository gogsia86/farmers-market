/**
 * 🎯 Performance Benchmarking System
 * Automated performance baseline comparison and regression detection
 *
 * Features:
 * - Baseline performance metrics storage
 * - Automated regression detection
 * - Performance trend analysis
 * - CI/CD integration ready
 * - Agricultural consciousness tracking
 *
 * Usage:
 *   tsx tests/load/performance-benchmark.ts --run
 *   tsx tests/load/performance-benchmark.ts --compare
 *   tsx tests/load/performance-benchmark.ts --baseline
 *
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const RESULTS_DIR = path.join(process.cwd(), 'tests', 'load', 'results');
const BASELINES_DIR = path.join(RESULTS_DIR, 'baselines');
const REPORTS_DIR = path.join(RESULTS_DIR, 'reports');

const BASELINE_FILE = path.join(BASELINES_DIR, 'performance-baseline.json');
const HISTORY_FILE = path.join(BASELINES_DIR, 'performance-history.json');

// Performance thresholds (acceptable regression limits)
const THRESHOLDS = {
  latency: {
    p50: 200,    // 50th percentile should be under 200ms
    p95: 1000,   // 95th percentile should be under 1s
    p99: 2000,   // 99th percentile should be under 2s
    max: 5000,   // Max latency should be under 5s
  },
  successRate: 99.5,  // Minimum 99.5% success rate
  rps: 100,           // Minimum 100 requests per second
  errorRate: 0.5,     // Maximum 0.5% error rate
  consciousness: 80,  // Minimum 80/100 agricultural consciousness
  regression: {
    latency: 20,      // Max 20% regression in latency
    successRate: 1,   // Max 1% regression in success rate
    rps: 15,          // Max 15% regression in throughput
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface PerformanceMetrics {
  timestamp: string;
  scenario: string;
  environment: string;
  gitCommit?: string;
  gitBranch?: string;
  metrics: {
    totalRequests: number;
    successRate: number;
    errorRate: number;
    rps: number;
    latency: {
      avg: number;
      p50: number;
      p95: number;
      p99: number;
      max: number;
    };
    ttfb: {
      avg: number;
      p95: number;
    };
    agriculturalConsciousness: {
      consciousnessLevel: number;
      seasonalCoherence: number;
      biodynamicSync: number;
      farmDataIntegrity: number;
      productCatalogHealth: number;
    };
    userActivity: {
      searchQueries: number;
      filterOperations: number;
      cartOperations: number;
      checkoutFlows: number;
    };
  };
  duration: number;
  virtualUsers: {
    max: number;
    avg: number;
  };
}

interface BenchmarkResult {
  current: PerformanceMetrics;
  baseline?: PerformanceMetrics;
  comparison?: {
    passed: boolean;
    regressions: RegressionResult[];
    improvements: ImprovementResult[];
    summary: string;
  };
}

interface RegressionResult {
  metric: string;
  baseline: number;
  current: number;
  change: number;
  changePercent: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'minor';
}

interface ImprovementResult {
  metric: string;
  baseline: number;
  current: number;
  improvement: number;
  improvementPercent: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function ensureDirectories(): void {
  [RESULTS_DIR, BASELINES_DIR, REPORTS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function getGitInfo(): { commit: string; branch: string } {
  try {
    const commit = execSync('git rev-parse HEAD').toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    return { commit, branch };
  } catch {
    return { commit: 'unknown', branch: 'unknown' };
  }
}

function loadBaseline(): PerformanceMetrics | null {
  if (!fs.existsSync(BASELINE_FILE)) {
    return null;
  }

  try {
    const content = fs.readFileSync(BASELINE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to load baseline:', error);
    return null;
  }
}

function saveBaseline(metrics: PerformanceMetrics): void {
  ensureDirectories();
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(metrics, null, 2));
  console.log(`✅ Baseline saved to ${BASELINE_FILE}`);
}

function loadHistory(): PerformanceMetrics[] {
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }

  try {
    const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function saveToHistory(metrics: PerformanceMetrics): void {
  const history = loadHistory();
  history.push(metrics);

  // Keep only last 100 runs
  const recentHistory = history.slice(-100);

  ensureDirectories();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(recentHistory, null, 2));
  console.log(`✅ Added to performance history (${recentHistory.length} runs)`);
}

function loadLatestTestResults(): PerformanceMetrics | null {
  const metricsFile = path.join(RESULTS_DIR, 'comprehensive-load-test-metrics.json');

  if (!fs.existsSync(metricsFile)) {
    console.error('❌ No test results found. Run load tests first.');
    return null;
  }

  try {
    const content = fs.readFileSync(metricsFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to load test results:', error);
    return null;
  }
}

// ============================================================================
// BENCHMARK ANALYSIS
// ============================================================================

function calculateRegression(
  metric: string,
  baselineValue: number,
  currentValue: number,
  threshold: number,
  higherIsBetter = true
): RegressionResult | null {
  const change = currentValue - baselineValue;
  const changePercent = baselineValue !== 0 ? (change / baselineValue) * 100 : 0;

  // Determine if this is a regression
  const isRegression = higherIsBetter
    ? changePercent < -threshold
    : changePercent > threshold;

  if (!isRegression) {
    return null;
  }

  // Determine severity
  let severity: 'critical' | 'warning' | 'minor' = 'minor';
  const absChangePercent = Math.abs(changePercent);

  if (absChangePercent > threshold * 3) {
    severity = 'critical';
  } else if (absChangePercent > threshold * 1.5) {
    severity = 'warning';
  }

  return {
    metric,
    baseline: baselineValue,
    current: currentValue,
    change,
    changePercent,
    threshold,
    severity,
  };
}

function calculateImprovement(
  metric: string,
  baselineValue: number,
  currentValue: number,
  higherIsBetter = true
): ImprovementResult | null {
  const change = currentValue - baselineValue;
  const changePercent = baselineValue !== 0 ? (change / baselineValue) * 100 : 0;

  const isImprovement = higherIsBetter
    ? changePercent > 5 // At least 5% improvement
    : changePercent < -5;

  if (!isImprovement) {
    return null;
  }

  return {
    metric,
    baseline: baselineValue,
    current: currentValue,
    improvement: Math.abs(change),
    improvementPercent: Math.abs(changePercent),
  };
}

function compareWithBaseline(
  current: PerformanceMetrics,
  baseline: PerformanceMetrics
): BenchmarkResult['comparison'] {
  const regressions: RegressionResult[] = [];
  const improvements: ImprovementResult[] = [];

  // Check latency regressions (lower is better)
  ['avg', 'p50', 'p95', 'p99', 'max'].forEach((percentile) => {
    const key = percentile as keyof typeof current.metrics.latency;
    const regression = calculateRegression(
      `latency.${percentile}`,
      baseline.metrics.latency[key],
      current.metrics.latency[key],
      THRESHOLDS.regression.latency,
      false // lower is better
    );

    if (regression) {
      regressions.push(regression);
    }

    const improvement = calculateImprovement(
      `latency.${percentile}`,
      baseline.metrics.latency[key],
      current.metrics.latency[key],
      false // lower is better
    );

    if (improvement) {
      improvements.push(improvement);
    }
  });

  // Check success rate (higher is better)
  const successRateRegression = calculateRegression(
    'successRate',
    baseline.metrics.successRate,
    current.metrics.successRate,
    THRESHOLDS.regression.successRate,
    true
  );

  if (successRateRegression) {
    regressions.push(successRateRegression);
  }

  const successRateImprovement = calculateImprovement(
    'successRate',
    baseline.metrics.successRate,
    current.metrics.successRate,
    true
  );

  if (successRateImprovement) {
    improvements.push(successRateImprovement);
  }

  // Check RPS (higher is better)
  const rpsRegression = calculateRegression(
    'rps',
    baseline.metrics.rps,
    current.metrics.rps,
    THRESHOLDS.regression.rps,
    true
  );

  if (rpsRegression) {
    regressions.push(rpsRegression);
  }

  const rpsImprovement = calculateImprovement(
    'rps',
    baseline.metrics.rps,
    current.metrics.rps,
    true
  );

  if (rpsImprovement) {
    improvements.push(rpsImprovement);
  }

  // Check consciousness level (higher is better)
  const consciousnessRegression = calculateRegression(
    'agriculturalConsciousness.consciousnessLevel',
    baseline.metrics.agriculturalConsciousness.consciousnessLevel,
    current.metrics.agriculturalConsciousness.consciousnessLevel,
    10, // 10% regression threshold
    true
  );

  if (consciousnessRegression) {
    regressions.push(consciousnessRegression);
  }

  // Determine overall result
  const criticalRegressions = regressions.filter((r) => r.severity === 'critical');
  const passed = criticalRegressions.length === 0;

  // Generate summary
  let summary = '';
  if (passed && regressions.length === 0 && improvements.length > 0) {
    summary = `✅ Performance improved! ${improvements.length} metrics show improvement.`;
  } else if (passed && regressions.length === 0) {
    summary = '✅ Performance maintained at baseline level.';
  } else if (passed) {
    summary = `⚠️ Minor regressions detected (${regressions.length}), but within acceptable thresholds.`;
  } else {
    summary = `❌ Critical performance regressions detected (${criticalRegressions.length} critical, ${regressions.length} total).`;
  }

  return {
    passed,
    regressions,
    improvements,
    summary,
  };
}

function validateThresholds(metrics: PerformanceMetrics): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Check latency thresholds
  if (metrics.metrics.latency.p50 > THRESHOLDS.latency.p50) {
    violations.push(
      `P50 latency ${metrics.metrics.latency.p50.toFixed(2)}ms exceeds threshold ${THRESHOLDS.latency.p50}ms`
    );
  }

  if (metrics.metrics.latency.p95 > THRESHOLDS.latency.p95) {
    violations.push(
      `P95 latency ${metrics.metrics.latency.p95.toFixed(2)}ms exceeds threshold ${THRESHOLDS.latency.p95}ms`
    );
  }

  if (metrics.metrics.latency.p99 > THRESHOLDS.latency.p99) {
    violations.push(
      `P99 latency ${metrics.metrics.latency.p99.toFixed(2)}ms exceeds threshold ${THRESHOLDS.latency.p99}ms`
    );
  }

  // Check success rate
  if (metrics.metrics.successRate < THRESHOLDS.successRate) {
    violations.push(
      `Success rate ${metrics.metrics.successRate.toFixed(2)}% below threshold ${THRESHOLDS.successRate}%`
    );
  }

  // Check RPS
  if (metrics.metrics.rps < THRESHOLDS.rps) {
    violations.push(
      `RPS ${metrics.metrics.rps.toFixed(2)} below threshold ${THRESHOLDS.rps}`
    );
  }

  // Check error rate
  if (metrics.metrics.errorRate > THRESHOLDS.errorRate) {
    violations.push(
      `Error rate ${metrics.metrics.errorRate.toFixed(2)}% exceeds threshold ${THRESHOLDS.errorRate}%`
    );
  }

  // Check consciousness
  if (
    metrics.metrics.agriculturalConsciousness.consciousnessLevel <
    THRESHOLDS.consciousness
  ) {
    violations.push(
      `Consciousness level ${metrics.metrics.agriculturalConsciousness.consciousnessLevel.toFixed(2)} below threshold ${THRESHOLDS.consciousness}`
    );
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

// ============================================================================
// REPORTING
// ============================================================================

function generateConsoleReport(result: BenchmarkResult): void {
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 PERFORMANCE BENCHMARK REPORT');
  console.log('═'.repeat(80));

  const { current, baseline, comparison } = result;

  console.log(`\n📅 Timestamp: ${current.timestamp}`);
  console.log(`🌍 Environment: ${current.environment}`);
  console.log(`📦 Scenario: ${current.scenario}`);
  if (current.gitBranch && current.gitCommit) {
    console.log(`🔀 Branch: ${current.gitBranch}`);
    console.log(`📝 Commit: ${current.gitCommit.substring(0, 8)}`);
  }

  console.log('\n📊 CURRENT PERFORMANCE:');
  console.log(`   Total Requests: ${current.metrics.totalRequests.toLocaleString()}`);
  console.log(`   Success Rate: ${current.metrics.successRate.toFixed(2)}%`);
  console.log(`   RPS: ${current.metrics.rps.toFixed(2)}`);
  console.log(`   Avg Latency: ${current.metrics.latency.avg.toFixed(2)}ms`);
  console.log(`   P95 Latency: ${current.metrics.latency.p95.toFixed(2)}ms`);
  console.log(`   P99 Latency: ${current.metrics.latency.p99.toFixed(2)}ms`);
  console.log(
    `   Consciousness: ${current.metrics.agriculturalConsciousness.consciousnessLevel.toFixed(2)}/100`
  );

  // Threshold validation
  const thresholdCheck = validateThresholds(current);
  console.log(`\n⚖️  THRESHOLD VALIDATION: ${thresholdCheck.passed ? '✅ PASSED' : '❌ FAILED'}`);
  if (!thresholdCheck.passed) {
    console.log('\n   Violations:');
    thresholdCheck.violations.forEach((v) => console.log(`   • ${v}`));
  }

  // Baseline comparison
  if (baseline && comparison) {
    console.log(`\n📈 BASELINE COMPARISON: ${comparison.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   ${comparison.summary}`);

    if (comparison.regressions.length > 0) {
      console.log('\n   🔻 Regressions:');
      comparison.regressions.forEach((r) => {
        const icon =
          r.severity === 'critical' ? '🔴' : r.severity === 'warning' ? '🟡' : '🟠';
        console.log(
          `   ${icon} ${r.metric}: ${r.baseline.toFixed(2)} → ${r.current.toFixed(2)} (${r.changePercent > 0 ? '+' : ''}${r.changePercent.toFixed(2)}%)`
        );
      });
    }

    if (comparison.improvements.length > 0) {
      console.log('\n   🔺 Improvements:');
      comparison.improvements.forEach((i) => {
        console.log(
          `   🟢 ${i.metric}: ${i.baseline.toFixed(2)} → ${i.current.toFixed(2)} (${i.improvementPercent.toFixed(2)}% better)`
        );
      });
    }
  } else {
    console.log('\n📊 BASELINE: Not available (first run or baseline not set)');
  }

  console.log('\n' + '═'.repeat(80) + '\n');
}

function generateHTMLReport(result: BenchmarkResult): string {
  const { current, baseline, comparison } = result;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Benchmark Report - ${current.timestamp}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
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
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .header p { opacity: 0.9; font-size: 16px; }
    .content { padding: 40px; }
    .section { margin-bottom: 40px; }
    .section h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #667eea;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 24px;
      border-radius: 12px;
      border-left: 5px solid #667eea;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .metric-label { font-size: 14px; color: #666; margin-bottom: 8px; font-weight: 600; }
    .metric-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .metric-unit { font-size: 14px; color: #999; margin-left: 4px; }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      margin: 10px 0;
    }
    .status-pass { background: #48bb78; color: white; }
    .status-fail { background: #f56565; color: white; }
    .status-warning { background: #ed8936; color: white; }
    .regression-list, .improvement-list { list-style: none; }
    .regression-item, .improvement-item {
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .regression-item.critical { background: #fed7d7; border-left: 4px solid #f56565; }
    .regression-item.warning { background: #feebc8; border-left: 4px solid #ed8936; }
    .regression-item.minor { background: #fef5e7; border-left: 4px solid #f6ad55; }
    .improvement-item { background: #c6f6d5; border-left: 4px solid #48bb78; }
    .change-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 14px;
    }
    .change-negative { background: #f56565; color: white; }
    .change-positive { background: #48bb78; color: white; }
    .footer {
      background: #f7fafc;
      padding: 20px 40px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌾 Performance Benchmark Report</h1>
      <p>Divine Agricultural Load Testing Results</p>
    </div>

    <div class="content">
      <!-- Summary Section -->
      <div class="section">
        <h2>📊 Test Summary</h2>
        <p><strong>Timestamp:</strong> ${current.timestamp}</p>
        <p><strong>Environment:</strong> ${current.environment}</p>
        <p><strong>Scenario:</strong> ${current.scenario}</p>
        ${current.gitBranch ? `<p><strong>Branch:</strong> ${current.gitBranch}</p>` : ''}
        ${current.gitCommit ? `<p><strong>Commit:</strong> ${current.gitCommit.substring(0, 8)}</p>` : ''}
        ${
          comparison
            ? `<span class="status-badge ${comparison.passed ? 'status-pass' : 'status-fail'}">
                 ${comparison.passed ? '✅ PASSED' : '❌ FAILED'}
               </span>`
            : ''
        }
      </div>

      <!-- Current Performance Metrics -->
      <div class="section">
        <h2>⚡ Performance Metrics</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Total Requests</div>
            <div class="metric-value">${current.metrics.totalRequests.toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Success Rate</div>
            <div class="metric-value">${current.metrics.successRate.toFixed(2)}<span class="metric-unit">%</span></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Requests/Second</div>
            <div class="metric-value">${current.metrics.rps.toFixed(2)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Avg Latency</div>
            <div class="metric-value">${current.metrics.latency.avg.toFixed(2)}<span class="metric-unit">ms</span></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">P95 Latency</div>
            <div class="metric-value">${current.metrics.latency.p95.toFixed(2)}<span class="metric-unit">ms</span></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">P99 Latency</div>
            <div class="metric-value">${current.metrics.latency.p99.toFixed(2)}<span class="metric-unit">ms</span></div>
          </div>
        </div>
      </div>

      <!-- Agricultural Consciousness -->
      <div class="section">
        <h2>🌾 Agricultural Consciousness</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Consciousness Level</div>
            <div class="metric-value">${current.metrics.agriculturalConsciousness.consciousnessLevel.toFixed(2)}<span class="metric-unit">/100</span></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Seasonal Coherence</div>
            <div class="metric-value">${current.metrics.agriculturalConsciousness.seasonalCoherence.toFixed(2)}<span class="metric-unit">%</span></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Biodynamic Sync</div>
            <div class="metric-value">${current.metrics.agriculturalConsciousness.biodynamicSync.toFixed(2)}<span class="metric-unit">%</span></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Farm Data Integrity</div>
            <div class="metric-value">${current.metrics.agriculturalConsciousness.farmDataIntegrity.toFixed(2)}<span class="metric-unit">%</span></div>
          </div>
        </div>
      </div>

      ${
        comparison && comparison.regressions.length > 0
          ? `
      <!-- Regressions -->
      <div class="section">
        <h2>🔻 Performance Regressions</h2>
        <ul class="regression-list">
          ${comparison.regressions
            .map(
              (r) => `
            <li class="regression-item ${r.severity}">
              <div>
                <strong>${r.metric}</strong><br>
                <small>${r.baseline.toFixed(2)} → ${r.current.toFixed(2)}</small>
              </div>
              <span class="change-badge change-negative">${r.changePercent > 0 ? '+' : ''}${r.changePercent.toFixed(2)}%</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
      `
          : ''
      }

      ${
        comparison && comparison.improvements.length > 0
          ? `
      <!-- Improvements -->
      <div class="section">
        <h2>🔺 Performance Improvements</h2>
        <ul class="improvement-list">
          ${comparison.improvements
            .map(
              (i) => `
            <li class="improvement-item">
              <div>
                <strong>${i.metric}</strong><br>
                <small>${i.baseline.toFixed(2)} → ${i.current.toFixed(2)}</small>
              </div>
              <span class="change-badge change-positive">${i.improvementPercent.toFixed(2)}% better</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
      `
          : ''
      }
    </div>

    <div class="footer">
      <p>🌾 Farmers Market Platform - Divine Performance Benchmarking</p>
      <p>Generated at ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;
}

function saveReport(result: BenchmarkResult): void {
  ensureDirectories();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(REPORTS_DIR, `benchmark-${timestamp}.html`);

  const html = generateHTMLReport(result);
  fs.writeFileSync(reportFile, html);

  console.log(`✅ HTML report saved to ${reportFile}`);

  // Also save JSON
  const jsonFile = path.join(REPORTS_DIR, `benchmark-${timestamp}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(result, null, 2));

  console.log(`✅ JSON report saved to ${jsonFile}`);
}

// ============================================================================
// MAIN COMMANDS
// ============================================================================

async function runBenchmark(): Promise<void> {
  console.log('🚀 Running performance benchmark...\n');

  // Load baseline if exists
  const baseline = loadBaseline();

  if (baseline) {
    console.log(`📊 Baseline loaded from ${baseline.timestamp}`);
  } else {
    console.log('📊 No baseline found. This will be the first benchmark run.');
  }

  // Load latest test results
  const current = loadLatestTestResults();

  if (!current) {
    console.error(
      '\n❌ No test results found. Run load tests first:\n   k6 run tests/load/comprehensive-load-test.ts\n'
    );
    process.exit(1);
  }

  // Add git info
  const gitInfo = getGitInfo();
  current.gitCommit = gitInfo.commit;
  current.gitBranch = gitInfo.branch;

  // Compare with baseline if available
  let comparison: BenchmarkResult['comparison'] | undefined;

  if (baseline) {
    comparison = compareWithBaseline(current, baseline);
  }

  const result: BenchmarkResult = {
    current,
    baseline,
    comparison,
  };

  // Generate reports
  generateConsoleReport(result);
  saveReport(result);

  // Save to history
  saveToHistory(current);

  // Exit with appropriate code
  const thresholdCheck = validateThresholds(current);
  const passed = thresholdCheck.passed && (!comparison || comparison.passed);

  if (!passed) {
    console.log('❌ Benchmark failed. Performance regression detected.\n');
    process.exit(1);
  } else {
    console.log('✅ Benchmark passed. Performance is acceptable.\n');
    process.exit(0);
  }
}

async function setBaseline(): Promise<void> {
  console.log('📊 Setting performance baseline...\n');

  const metrics = loadLatestTestResults();

  if (!metrics) {
    console.error(
      '\n❌ No test results found. Run load tests first:\n   k6 run tests/load/comprehensive-load-test.ts\n'
    );
    process.exit(1);
  }

  // Add git info
  const gitInfo = getGitInfo();
  metrics.gitCommit = gitInfo.commit;
  metrics.gitBranch = gitInfo.branch;

  saveBaseline(metrics);

  console.log('\n✅ Baseline has been set successfully.');
  console.log('   Future benchmark runs will compare against this baseline.\n');
}

async function compareWithBaselineCmd(): Promise<void> {
  console.log('📊 Comparing with baseline...\n');

  const baseline = loadBaseline();

  if (!baseline) {
    console.error('❌ No baseline found. Set a baseline first:\n   tsx tests/load/performance-benchmark.ts --baseline\n');
    process.exit(1);
  }

  const current = loadLatestTestResults();

  if (!current) {
    console.error(
      '\n❌ No test results found. Run load tests first:\n   k6 run tests/load/comprehensive-load-test.ts\n'
    );
    process.exit(1);
  }

  const gitInfo = getGitInfo();
  current.gitCommit = gitInfo.commit;
  current.gitBranch = gitInfo.branch;

  const comparison = compareWithBaseline(current, baseline);

  const result: BenchmarkResult = {
    current,
    baseline,
    comparison,
  };

  generateConsoleReport(result);
  saveReport(result);

  if (!comparison.passed) {
    process.exit(1);
  }
}

async function showHistory(): Promise<void> {
  const history = loadHistory();

  if (history.length === 0) {
    console.log('📊 No performance history available.\n');
    return;
  }

  console.log('\n' + '═'.repeat(80));
  console.log('📊 PERFORMANCE HISTORY');
  console.log('═'.repeat(80));
  console.log(`\nTotal runs: ${history.length}\n`);

  history.slice(-10).forEach((run, index) => {
    console.log(`${index + 1}. ${run.timestamp}`);
    console.log(`   Scenario: ${run.scenario}`);
    console.log(`   Success Rate: ${run.metrics.successRate.toFixed(2)}%`);
    console.log(`   P95 Latency: ${run.metrics.latency.p95.toFixed(2)}ms`);
    console.log(`   RPS: ${run.metrics.rps.toFixed(2)}`);
    console.log('');
  });
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('\n🎯 Performance Benchmarking System\n');

  ensureDirectories();

  switch (command) {
    case '--run':
    case 'run':
      await runBenchmark();
      break;

    case '--baseline':
    case 'baseline':
      await setBaseline();
      break;

    case '--compare':
    case 'compare':
      await compareWithBaselineCmd();
      break;

    case '--history':
    case 'history':
      await showHistory();
      break;

    case '--help':
    case 'help':
    case undefined:
      console.log('Usage:');
      console.log('  tsx tests/load/performance-benchmark.ts --run       # Run full benchmark');
      console.log('  tsx tests/load/performance-benchmark.ts --baseline  # Set baseline');
      console.log('  tsx tests/load/performance-benchmark.ts --compare   # Compare with baseline');
      console.log('  tsx tests/load/performance-benchmark.ts --history   # Show history');
      console.log('');
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run with --help for usage information.\n');
      process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  });
}

export {
  runBenchmark,
  setBaseline,
  compareWithBaselineCmd,
  showHistory,
  type PerformanceMetrics,
  type BenchmarkResult,
  type RegressionResult,
  type ImprovementResult,
};
