#!/usr/bin/env tsx

/**
 * DEPLOYMENT MONITORING & TREND ANALYSIS
 *
 * Analyzes test reports over time to identify performance trends,
 * degradation patterns, and provides actionable insights.
 *
 * Usage:
 *   tsx scripts/monitor-deployment-trends.ts
 *   tsx scripts/monitor-deployment-trends.ts --days=7
 *   tsx scripts/monitor-deployment-trends.ts --alert
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

interface TestReport {
  url: string;
  timestamp: string;
  duration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
  };
  performance: {
    avgResponseTime: number;
    slowestEndpoint: { url: string; time: number };
    fastestEndpoint: { url: string; time: number };
  };
  results: any[];
}

interface TrendAnalysis {
  period: string;
  reportsAnalyzed: number;
  trends: {
    performance: {
      current: number;
      previous: number;
      change: number;
      trend: 'improving' | 'stable' | 'degrading';
    };
    successRate: {
      current: number;
      previous: number;
      change: number;
      trend: 'improving' | 'stable' | 'degrading';
    };
    reliability: {
      current: number;
      previous: number;
      change: number;
      trend: 'improving' | 'stable' | 'degrading';
    };
  };
  alerts: string[];
  recommendations: string[];
  healthScore: number;
  healthGrade: string;
}

// ============================================================================
// UTILITIES
// ============================================================================

function log(message: string, color: keyof typeof COLORS = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '═'.repeat(60));
  log(`  ${title}`, 'cyan');
  console.log('═'.repeat(60) + '\n');
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatMs(ms: number): string {
  return `${Math.round(ms)}ms`;
}

function getTrendIcon(trend: 'improving' | 'stable' | 'degrading'): string {
  return trend === 'improving' ? '📈' : trend === 'degrading' ? '📉' : '➡️';
}

function getTrendColor(trend: 'improving' | 'stable' | 'degrading'): keyof typeof COLORS {
  return trend === 'improving' ? 'green' : trend === 'degrading' ? 'red' : 'yellow';
}

// ============================================================================
// REPORT LOADING
// ============================================================================

function loadReports(daysBack: number = 30): TestReport[] {
  const reportsDir = join(process.cwd(), 'test-reports');

  if (!existsSync(reportsDir)) {
    return [];
  }

  const files = readdirSync(reportsDir)
    .filter(f => f.startsWith('vercel-test-') && f.endsWith('.json'))
    .sort()
    .reverse(); // Most recent first

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const reports: TestReport[] = [];

  for (const file of files) {
    try {
      const content = readFileSync(join(reportsDir, file), 'utf-8');
      const report = JSON.parse(content) as TestReport;

      const reportDate = new Date(report.timestamp);
      if (reportDate >= cutoffDate) {
        reports.push(report);
      }
    } catch (error) {
      console.warn(`Warning: Could not parse ${file}`);
    }
  }

  return reports;
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

function analyzeTrends(reports: TestReport[]): TrendAnalysis {
  if (reports.length === 0) {
    throw new Error('No reports found to analyze');
  }

  // Sort by timestamp (newest first)
  reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const latest = reports[0];
  const previous = reports.length > 1 ? reports.slice(1) : [latest];

  // Calculate averages
  const latestPerf = latest.performance.avgResponseTime;
  const previousPerf = previous.reduce((sum, r) => sum + r.performance.avgResponseTime, 0) / previous.length;

  const latestSuccess = (latest.summary.passed / latest.summary.total) * 100;
  const previousSuccess = previous.reduce((sum, r) =>
    sum + (r.summary.passed / r.summary.total) * 100, 0) / previous.length;

  const latestReliability = ((latest.summary.total - latest.summary.failed) / latest.summary.total) * 100;
  const previousReliability = previous.reduce((sum, r) =>
    sum + ((r.summary.total - r.summary.failed) / r.summary.total) * 100, 0) / previous.length;

  // Calculate changes
  const perfChange = ((latestPerf - previousPerf) / previousPerf) * 100;
  const successChange = latestSuccess - previousSuccess;
  const reliabilityChange = latestReliability - previousReliability;

  // Determine trends
  const perfTrend = perfChange < -5 ? 'improving' : perfChange > 5 ? 'degrading' : 'stable';
  const successTrend = successChange > 5 ? 'improving' : successChange < -5 ? 'degrading' : 'stable';
  const reliabilityTrend = reliabilityChange > 5 ? 'improving' : reliabilityChange < -5 ? 'degrading' : 'stable';

  // Generate alerts
  const alerts: string[] = [];

  if (perfChange > 20) {
    alerts.push(`⚠️ Performance degraded by ${perfChange.toFixed(1)}% - immediate investigation needed`);
  } else if (perfChange > 10) {
    alerts.push(`⚠️ Performance degraded by ${perfChange.toFixed(1)}% - monitor closely`);
  }

  if (latest.summary.failed > 0) {
    alerts.push(`❌ ${latest.summary.failed} test(s) failing - requires immediate attention`);
  }

  if (latestPerf > 1000) {
    alerts.push(`⚠️ Average response time exceeds 1 second (${latestPerf.toFixed(0)}ms)`);
  }

  if (latestSuccess < 80) {
    alerts.push(`❌ Success rate below 80% (${latestSuccess.toFixed(1)}%)`);
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (perfTrend === 'degrading') {
    recommendations.push('Review recent deployments for performance regressions');
    recommendations.push('Check database query performance and indexes');
    recommendations.push('Monitor memory usage and resource consumption');
  }

  if (latest.summary.warnings > 2) {
    recommendations.push(`Address ${latest.summary.warnings} warnings to improve overall health`);
  }

  if (latestPerf > 800) {
    recommendations.push('Consider implementing Redis caching for frequently accessed data');
    recommendations.push('Optimize server-side rendering and data fetching');
  }

  if (reports.length < 5) {
    recommendations.push('Run tests more frequently to establish better baseline metrics');
  }

  // Calculate health score
  let healthScore = 100;
  healthScore -= (latest.summary.failed * 10);
  healthScore -= (latest.summary.warnings * 3);
  healthScore -= Math.max(0, (latestPerf - 500) / 20); // Penalize slow responses
  healthScore = Math.max(0, Math.min(100, healthScore));

  const healthGrade =
    healthScore >= 90 ? 'A' :
    healthScore >= 80 ? 'B' :
    healthScore >= 70 ? 'C' :
    healthScore >= 60 ? 'D' : 'F';

  return {
    period: `Last ${reports.length} report(s)`,
    reportsAnalyzed: reports.length,
    trends: {
      performance: {
        current: latestPerf,
        previous: previousPerf,
        change: perfChange,
        trend: perfTrend,
      },
      successRate: {
        current: latestSuccess,
        previous: previousSuccess,
        change: successChange,
        trend: successTrend,
      },
      reliability: {
        current: latestReliability,
        previous: previousReliability,
        change: reliabilityChange,
        trend: reliabilityTrend,
      },
    },
    alerts,
    recommendations,
    healthScore,
    healthGrade,
  };
}

// ============================================================================
// VISUALIZATION
// ============================================================================

function generateSparkline(values: number[], max: number = Math.max(...values)): string {
  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return values.map(v => {
    const index = Math.floor((v / max) * (chars.length - 1));
    return chars[Math.max(0, Math.min(chars.length - 1, index))];
  }).join('');
}

function generateTrendChart(reports: TestReport[]): void {
  if (reports.length < 2) {
    log('  Not enough data for trend chart (need at least 2 reports)', 'yellow');
    return;
  }

  const sorted = [...reports].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const perfValues = sorted.map(r => r.performance.avgResponseTime);
  const successValues = sorted.map(r => (r.summary.passed / r.summary.total) * 100);

  log('  Performance Trend (Response Time):', 'bright');
  log(`  ${generateSparkline(perfValues)} ${formatMs(perfValues[perfValues.length - 1])}`, 'cyan');
  log(`  Range: ${formatMs(Math.min(...perfValues))} - ${formatMs(Math.max(...perfValues))}`, 'reset');
  console.log('');

  log('  Success Rate Trend:', 'bright');
  log(`  ${generateSparkline(successValues, 100)} ${formatPercent(successValues[successValues.length - 1])}`, 'green');
  log(`  Range: ${formatPercent(Math.min(...successValues))} - ${formatPercent(Math.max(...successValues))}`, 'reset');
}

// ============================================================================
// REPORTING
// ============================================================================

function printAnalysis(analysis: TrendAnalysis, reports: TestReport[]): void {
  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  log('║' + ' '.repeat(58) + '║', 'cyan');
  log('║' + '   📊 DEPLOYMENT MONITORING & TREND ANALYSIS 📊   '.padEnd(59) + '║', 'cyan');
  log('║' + ' '.repeat(58) + '║', 'cyan');
  console.log('╚' + '═'.repeat(58) + '╝\n');

  // Overview
  logSection('📈 OVERVIEW');
  log(`Reports Analyzed: ${analysis.reportsAnalyzed}`, 'bright');
  log(`Period: ${analysis.period}`, 'bright');
  log(`Health Score: ${analysis.healthScore.toFixed(1)}/100 (Grade ${analysis.healthGrade})`, 'bright');

  const healthColor =
    analysis.healthScore >= 90 ? 'green' :
    analysis.healthScore >= 70 ? 'yellow' : 'red';
  log(`Health Status: ${analysis.healthScore >= 90 ? '🟢 Excellent' :
                        analysis.healthScore >= 70 ? '🟡 Good' : '🔴 Needs Attention'}`, healthColor);

  // Alerts
  if (analysis.alerts.length > 0) {
    logSection('🚨 ALERTS');
    analysis.alerts.forEach(alert => log(`  ${alert}`, 'red'));
  }

  // Trends
  logSection('📊 PERFORMANCE TRENDS');

  log('⚡ Response Time:', 'bright');
  const perfTrend = analysis.trends.performance;
  log(`  Current:  ${formatMs(perfTrend.current)}`, 'cyan');
  log(`  Previous: ${formatMs(perfTrend.previous)}`, 'reset');
  log(`  Change:   ${perfTrend.change >= 0 ? '+' : ''}${formatPercent(perfTrend.change)} ${getTrendIcon(perfTrend.trend)}`,
      getTrendColor(perfTrend.trend));
  console.log('');

  log('✅ Success Rate:', 'bright');
  const successTrend = analysis.trends.successRate;
  log(`  Current:  ${formatPercent(successTrend.current)}`, 'cyan');
  log(`  Previous: ${formatPercent(successTrend.previous)}`, 'reset');
  log(`  Change:   ${successTrend.change >= 0 ? '+' : ''}${formatPercent(successTrend.change)} ${getTrendIcon(successTrend.trend)}`,
      getTrendColor(successTrend.trend));
  console.log('');

  log('🎯 Reliability:', 'bright');
  const reliabilityTrend = analysis.trends.reliability;
  log(`  Current:  ${formatPercent(reliabilityTrend.current)}`, 'cyan');
  log(`  Previous: ${formatPercent(reliabilityTrend.previous)}`, 'reset');
  log(`  Change:   ${reliabilityTrend.change >= 0 ? '+' : ''}${formatPercent(reliabilityTrend.change)} ${getTrendIcon(reliabilityTrend.trend)}`,
      getTrendColor(reliabilityTrend.trend));

  // Trend Charts
  logSection('📈 TREND CHARTS');
  generateTrendChart(reports);

  // Latest Report Details
  if (reports.length > 0) {
    const latest = reports[0];
    logSection('📋 LATEST TEST RESULTS');
    log(`Timestamp: ${new Date(latest.timestamp).toLocaleString()}`, 'reset');
    log(`Total Tests: ${latest.summary.total}`, 'reset');
    log(`Passed: ${latest.summary.passed}`, 'green');
    log(`Failed: ${latest.summary.failed}`, latest.summary.failed > 0 ? 'red' : 'reset');
    log(`Warnings: ${latest.summary.warnings}`, latest.summary.warnings > 0 ? 'yellow' : 'reset');
    log(`Avg Response: ${formatMs(latest.performance.avgResponseTime)}`, 'cyan');
  }

  // Recommendations
  if (analysis.recommendations.length > 0) {
    logSection('💡 RECOMMENDATIONS');
    analysis.recommendations.forEach((rec, i) => {
      log(`  ${i + 1}. ${rec}`, 'yellow');
    });
  }

  // Summary
  logSection('📊 SUMMARY');

  if (analysis.alerts.length === 0 && analysis.healthScore >= 80) {
    log('✅ Your deployment is healthy and performing well!', 'green');
  } else if (analysis.alerts.length > 0) {
    log('⚠️ Action required: Address the alerts above', 'yellow');
  } else {
    log('ℹ️ Your deployment is operational but could be improved', 'blue');
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

// ============================================================================
// EXPORT FUNCTIONALITY
// ============================================================================

function exportTrendReport(analysis: TrendAnalysis, reports: TestReport[]): void {
  const reportPath = join(process.cwd(), 'test-reports', `trend-analysis-${Date.now()}.json`);

  const exportData = {
    generatedAt: new Date().toISOString(),
    analysis,
    reportsIncluded: reports.map(r => ({
      timestamp: r.timestamp,
      successRate: (r.summary.passed / r.summary.total) * 100,
      avgResponseTime: r.performance.avgResponseTime,
      failed: r.summary.failed,
      warnings: r.summary.warnings,
    })),
  };

  writeFileSync(reportPath, JSON.stringify(exportData, null, 2));
  log(`\n📄 Trend report exported to: ${reportPath}`, 'green');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const daysBack = parseInt(args.find(a => a.startsWith('--days='))?.split('=')[1] || '30');
  const shouldAlert = args.includes('--alert');
  const shouldExport = args.includes('--export');

  try {
    log('🔍 Loading test reports...', 'cyan');
    const reports = loadReports(daysBack);

    if (reports.length === 0) {
      log('\n⚠️ No test reports found!', 'yellow');
      log('\nRun tests first:', 'reset');
      log('  npm run test:vercel:full', 'cyan');
      process.exit(1);
    }

    log(`✅ Loaded ${reports.length} report(s)\n`, 'green');

    const analysis = analyzeTrends(reports);
    printAnalysis(analysis, reports);

    if (shouldExport) {
      exportTrendReport(analysis, reports);
    }

    // Exit with error code if there are critical alerts
    if (shouldAlert && (analysis.alerts.length > 0 || analysis.healthScore < 70)) {
      process.exit(1);
    }

  } catch (error: any) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run
main();
