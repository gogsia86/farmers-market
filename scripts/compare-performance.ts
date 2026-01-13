#!/usr/bin/env node
/**
 * Performance Comparison Script
 * Compares two inspection reports to show performance improvements
 *
 * Usage:
 *   npx tsx scripts/compare-performance.ts <baseline-report.json> <current-report.json>
 *   npx tsx scripts/compare-performance.ts --latest  (compares two most recent reports)
 */

import * as fs from 'fs';
import * as path from 'path';

interface PageMetrics {
  url: string;
  loadTime: number;
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  cls?: number;
  statusCode: number;
  error?: string;
}

interface InspectionReport {
  summary: {
    totalPages: number;
    successfulPages: number;
    failedPages: number;
    averageLoadTime: number;
    slowestPages: Array<{ url: string; loadTime: number }>;
    fastestPages: Array<{ url: string; loadTime: number }>;
  };
  pages: PageMetrics[];
  timestamp: string;
  version: string;
}

interface ComparisonResult {
  metric: string;
  baseline: number | string;
  current: number | string;
  change: number;
  changePercent: number;
  improvement: boolean;
  emoji: string;
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function getEmoji(changePercent: number, higherIsBetter: boolean = false): string {
  const threshold = 5;
  const isImprovement = higherIsBetter
    ? changePercent > threshold
    : changePercent < -threshold;

  if (Math.abs(changePercent) < threshold) return '➡️'; // No significant change
  if (isImprovement) return '🚀'; // Improvement
  return '⚠️'; // Regression
}

function calculateChange(baseline: number, current: number, higherIsBetter: boolean = false): ComparisonResult {
  const change = current - baseline;
  const changePercent = ((change / baseline) * 100);
  const improvement = higherIsBetter ? change > 0 : change < 0;

  return {
    metric: '',
    baseline,
    current,
    change,
    changePercent,
    improvement,
    emoji: getEmoji(changePercent, higherIsBetter)
  };
}

function loadReport(filePath: string): InspectionReport {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Report not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function findLatestReports(reportsDir: string): [string, string] {
  const files = fs.readdirSync(reportsDir)
    .filter(f => f.endsWith('.json') && f.includes('inspection-report'))
    .map(f => ({
      name: f,
      path: path.join(reportsDir, f),
      mtime: fs.statSync(path.join(reportsDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length < 2) {
    console.error('❌ Need at least 2 inspection reports to compare');
    console.error(`Found ${files.length} report(s) in ${reportsDir}`);
    process.exit(1);
  }

  return [files[1].path, files[0].path]; // [baseline, current]
}

function compareReports(baseline: InspectionReport, current: InspectionReport): void {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           PERFORMANCE COMPARISON REPORT                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Baseline: ${baseline.timestamp || 'Unknown'}`);
  console.log(`📊 Current:  ${current.timestamp || 'Unknown'}`);
  console.log('');

  // Overall Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    OVERALL METRICS                            ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const avgLoadTimeChange = calculateChange(
    baseline.summary.averageLoadTime,
    current.summary.averageLoadTime
  );

  console.log(`Average Load Time:`);
  console.log(`  Baseline: ${formatTime(baseline.summary.averageLoadTime)}`);
  console.log(`  Current:  ${formatTime(current.summary.averageLoadTime)}`);
  console.log(`  Change:   ${avgLoadTimeChange.emoji} ${formatPercent(avgLoadTimeChange.changePercent)} (${formatTime(avgLoadTimeChange.change)})`);
  console.log('');

  console.log(`Total Pages: ${baseline.summary.totalPages} → ${current.summary.totalPages}`);
  console.log(`Successful: ${baseline.summary.successfulPages} → ${current.summary.successfulPages}`);
  console.log(`Failed: ${baseline.summary.failedPages} → ${current.summary.failedPages}`);
  console.log('');

  // Page-by-Page Comparison
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                  PAGE-BY-PAGE COMPARISON                      ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const pageComparisons: Array<{
    url: string;
    baseline: number;
    current: number;
    change: number;
    changePercent: number;
    emoji: string;
  }> = [];

  // Match pages by URL
  for (const baselinePage of baseline.pages) {
    const currentPage = current.pages.find(p => p.url === baselinePage.url);
    if (currentPage) {
      const comparison = calculateChange(baselinePage.loadTime, currentPage.loadTime);
      pageComparisons.push({
        url: baselinePage.url,
        baseline: baselinePage.loadTime,
        current: currentPage.loadTime,
        change: comparison.change,
        changePercent: comparison.changePercent,
        emoji: comparison.emoji
      });
    }
  }

  // Sort by absolute change (biggest improvements first)
  pageComparisons.sort((a, b) => a.changePercent - b.changePercent);

  console.log('Top Improvements:');
  console.log('─────────────────────────────────────────────────────────────\n');

  const improvements = pageComparisons.filter(p => p.changePercent < -5).slice(0, 10);
  if (improvements.length === 0) {
    console.log('  No significant improvements found\n');
  } else {
    improvements.forEach((page, index) => {
      const url = page.url.length > 50 ? '...' + page.url.slice(-47) : page.url;
      console.log(`${index + 1}. ${page.emoji} ${url}`);
      console.log(`   ${formatTime(page.baseline)} → ${formatTime(page.current)} (${formatPercent(page.changePercent)})`);
      console.log('');
    });
  }

  console.log('Top Regressions:');
  console.log('─────────────────────────────────────────────────────────────\n');

  const regressions = pageComparisons.filter(p => p.changePercent > 5).slice(-10).reverse();
  if (regressions.length === 0) {
    console.log('  No regressions found ✅\n');
  } else {
    regressions.forEach((page, index) => {
      const url = page.url.length > 50 ? '...' + page.url.slice(-47) : page.url;
      console.log(`${index + 1}. ${page.emoji} ${url}`);
      console.log(`   ${formatTime(page.baseline)} → ${formatTime(page.current)} (${formatPercent(page.changePercent)})`);
      console.log('');
    });
  }

  // Critical Pages Analysis
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                  CRITICAL PAGES ANALYSIS                      ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const criticalPages = [
    { pattern: '/farms', name: 'Browse Farms' },
    { pattern: '/products', name: 'Browse Products' },
    { pattern: '/search', name: 'Search' },
    { pattern: '/', name: 'Homepage', exact: true },
  ];

  for (const critical of criticalPages) {
    const baselinePage = baseline.pages.find(p =>
      critical.exact ? p.url === critical.pattern : p.url.includes(critical.pattern)
    );
    const currentPage = current.pages.find(p =>
      critical.exact ? p.url === critical.pattern : p.url.includes(critical.pattern)
    );

    if (baselinePage && currentPage) {
      const comparison = calculateChange(baselinePage.loadTime, currentPage.loadTime);
      console.log(`${critical.name}:`);
      console.log(`  ${formatTime(baselinePage.loadTime)} → ${formatTime(currentPage.loadTime)}`);
      console.log(`  ${comparison.emoji} ${formatPercent(comparison.changePercent)} change`);
      console.log('');
    }
  }

  // Performance Score
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    PERFORMANCE SCORE                          ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const totalImprovement = pageComparisons.filter(p => p.changePercent < -5).length;
  const totalRegression = pageComparisons.filter(p => p.changePercent > 5).length;
  const totalUnchanged = pageComparisons.filter(p => Math.abs(p.changePercent) <= 5).length;

  console.log(`Improved Pages:   ${totalImprovement} 🚀`);
  console.log(`Unchanged Pages:  ${totalUnchanged} ➡️`);
  console.log(`Regressed Pages:  ${totalRegression} ⚠️`);
  console.log('');

  const overallScore = ((totalImprovement - totalRegression) / pageComparisons.length) * 100;
  console.log(`Overall Performance Score: ${overallScore.toFixed(1)}%`);

  if (overallScore > 50) {
    console.log('🎉 EXCELLENT - Significant performance improvements!');
  } else if (overallScore > 20) {
    console.log('✅ GOOD - Notable performance improvements');
  } else if (overallScore > 0) {
    console.log('👍 POSITIVE - Some performance improvements');
  } else if (overallScore === 0) {
    console.log('➡️ NEUTRAL - No significant change');
  } else {
    console.log('⚠️ NEGATIVE - Performance has regressed');
  }

  console.log('');

  // Recommendations
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                      RECOMMENDATIONS                          ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (avgLoadTimeChange.changePercent < -30) {
    console.log('✅ Great job! Average load time improved by more than 30%');
  } else if (avgLoadTimeChange.changePercent < -10) {
    console.log('👍 Good improvement in average load time');
    console.log('💡 Consider further optimizations for remaining slow pages');
  } else if (avgLoadTimeChange.changePercent < 0) {
    console.log('➡️ Minor improvement in average load time');
    console.log('💡 Review critical pages for additional optimization opportunities');
  } else {
    console.log('⚠️ Average load time has not improved or regressed');
    console.log('💡 Investigate:');
    console.log('   - Were database indexes applied?');
    console.log('   - Are optimized repositories being used?');
    console.log('   - Check for N+1 query patterns');
    console.log('   - Review server resource utilization');
  }

  if (totalRegression > 0) {
    console.log('\n⚠️ Some pages have regressed. Review:');
    console.log('   - Recent code changes');
    console.log('   - Database query plans');
    console.log('   - Network conditions during testing');
  }

  if (current.summary.averageLoadTime > 3000) {
    console.log('\n💡 Average load time still above 3s. Consider:');
    console.log('   - Adding Redis caching layer');
    console.log('   - Implementing lazy loading');
    console.log('   - Optimizing image delivery');
    console.log('   - Adding CDN caching headers');
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

function main() {
  const args = process.argv.slice(2);

  let baselinePath: string;
  let currentPath: string;

  if (args[0] === '--latest' || args.length === 0) {
    console.log('📊 Finding latest inspection reports...\n');
    const reportsDir = path.join(process.cwd(), 'inspection-reports');
    [baselinePath, currentPath] = findLatestReports(reportsDir);
    console.log(`Baseline: ${path.basename(baselinePath)}`);
    console.log(`Current:  ${path.basename(currentPath)}`);
  } else if (args.length === 2) {
    baselinePath = path.resolve(args[0]);
    currentPath = path.resolve(args[1]);
  } else {
    console.error('Usage:');
    console.error('  npx tsx scripts/compare-performance.ts --latest');
    console.error('  npx tsx scripts/compare-performance.ts <baseline.json> <current.json>');
    process.exit(1);
  }

  const baseline = loadReport(baselinePath);
  const current = loadReport(currentPath);

  compareReports(baseline, current);
}

main();
