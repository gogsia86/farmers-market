#!/usr/bin/env tsx
/**
 * 🔍 UBF PARITY VALIDATION SCRIPT
 *
 * Compares Unified Bot Framework outputs with legacy script results
 * to ensure no regressions during migration.
 *
 * Usage:
 *   npm run validate:ubf
 *   tsx scripts/validate-ubf-parity.ts
 *   tsx scripts/validate-ubf-parity.ts --module=health
 *   tsx scripts/validate-ubf-parity.ts --all
 */

import { execSync } from 'child_process';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';

// ============================================================================
// TYPES
// ============================================================================

interface ValidationResult {
  module: string;
  legacy: TestRunResult;
  ubf: TestRunResult;
  comparison: ComparisonResult;
  timestamp: string;
}

interface TestRunResult {
  success: boolean;
  duration: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  errors: string[];
  screenshots: string[];
  output: string;
}

interface ComparisonResult {
  match: boolean;
  differences: Difference[];
  summary: string;
  recommendation: 'PASS' | 'INVESTIGATE' | 'FAIL';
}

interface Difference {
  type: 'success_rate' | 'duration' | 'test_count' | 'functionality' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  legacy: any;
  ubf: any;
  impact: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  headless: true,
  timeout: 60000,
  outputDir: './validation-reports',
  screenshotsDir: './validation-screenshots',

  colors: {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
  },

  // Tolerance thresholds
  thresholds: {
    durationDifferencePercent: 50, // 50% slower is acceptable
    successRateDifferencePercent: 5, // 5% difference in success rate
    testCountDifference: 2, // Allow 2 tests difference
  },
};

// ============================================================================
// VALIDATION MODULES
// ============================================================================

const VALIDATION_MODULES = [
  {
    id: 'health',
    name: 'Health Checks',
    legacyCommand: 'tsx scripts/website-checker-bot.ts',
    ubfCommand: 'npm run bot:test:health -- --preset=ci',
    description: 'Basic health and availability checks',
  },
  {
    id: 'marketplace',
    name: 'Marketplace Browse',
    legacyCommand: 'tsx scripts/mvp-validation-bot.ts', // Partial
    ubfCommand: 'npm run bot test marketplace -- --preset=ci',
    description: 'Product browsing and search functionality',
  },
  {
    id: 'cart',
    name: 'Cart & Checkout',
    legacyCommand: 'tsx scripts/mvp-validation-bot.ts', // Partial
    ubfCommand: 'npm run bot test checkout -- --preset=ci',
    description: 'Shopping cart and checkout flow',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message: string, color: keyof typeof CONFIG.colors = 'reset') {
  const c = CONFIG.colors;
  console.log(`${c[color]}${message}${c.reset}`);
}

function logSection(title: string) {
  const c = CONFIG.colors;
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${c.bright}${c.cyan}  ${title}${c.reset}`);
  console.log(`${'='.repeat(80)}\n`);
}

function logSubsection(title: string) {
  const c = CONFIG.colors;
  console.log(`\n${c.bright}${title}${c.reset}`);
  console.log(`${'-'.repeat(80)}`);
}

function ensureDirectories() {
  [CONFIG.outputDir, CONFIG.screenshotsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function parseArgs(): { module?: string; all: boolean; verbose: boolean } {
  const args = process.argv.slice(2);
  return {
    module: args.find(a => a.startsWith('--module='))?.split('=')[1],
    all: args.includes('--all'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };
}

// ============================================================================
// LEGACY SCRIPT RUNNERS
// ============================================================================

async function runLegacyHealthChecks(): Promise<TestRunResult> {
  const startTime = Date.now();
  let output = '';
  let success = false;
  let testsRun = 0;
  let testsPassed = 0;
  let testsFailed = 0;
  const errors: string[] = [];

  try {
    log('  Running legacy health checks (website-checker-bot)...', 'dim');

    // Run the legacy script
    output = execSync('tsx scripts/website-checker-bot.ts', {
      encoding: 'utf8',
      timeout: CONFIG.timeout,
      env: { ...process.env, BASE_URL: CONFIG.baseUrl },
    });

    // Parse output
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.includes('✅')) testsPassed++;
      if (line.includes('❌')) testsFailed++;
      if (line.includes('Error:') || line.includes('Failed:')) {
        errors.push(line.trim());
      }
    });

    testsRun = testsPassed + testsFailed;
    success = testsFailed === 0 && testsPassed > 0;

  } catch (error: any) {
    success = false;
    errors.push(error.message);
    output = error.stdout || error.stderr || error.message;
  }

  const duration = Date.now() - startTime;

  return {
    success,
    duration,
    testsRun,
    testsPassed,
    testsFailed,
    errors,
    screenshots: [],
    output,
  };
}

async function runLegacyMarketplace(): Promise<TestRunResult> {
  const startTime = Date.now();

  // For marketplace, we'll do a simplified check since legacy MVP bot
  // runs the entire flow. We'll just check key marketplace functionality.
  const browser = await chromium.launch({ headless: CONFIG.headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  let success = true;
  let testsRun = 0;
  let testsPassed = 0;
  let testsFailed = 0;
  const errors: string[] = [];
  let output = '';

  try {
    log('  Running legacy marketplace checks...', 'dim');

    // Test 1: Homepage loads
    testsRun++;
    try {
      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
      testsPassed++;
      output += '✅ Homepage loads\n';
    } catch (error: any) {
      testsFailed++;
      errors.push(`Homepage failed: ${error.message}`);
      output += `❌ Homepage loads: ${error.message}\n`;
    }

    // Test 2: Products page loads
    testsRun++;
    try {
      await page.goto(`${CONFIG.baseUrl}/products`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      testsPassed++;
      output += '✅ Products page loads\n';
    } catch (error: any) {
      testsFailed++;
      errors.push(`Products page failed: ${error.message}`);
      output += `❌ Products page loads: ${error.message}\n`;
    }

    // Test 3: Search functionality exists
    testsRun++;
    try {
      await page.goto(`${CONFIG.baseUrl}/products`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const searchInput = await page.$('input[type="search"], input[placeholder*="Search"], input[name="search"]');
      if (searchInput) {
        testsPassed++;
        output += '✅ Search functionality exists\n';
      } else {
        testsFailed++;
        errors.push('Search input not found');
        output += '❌ Search functionality exists\n';
      }
    } catch (error: any) {
      testsFailed++;
      errors.push(`Search check failed: ${error.message}`);
      output += `❌ Search functionality: ${error.message}\n`;
    }

    success = testsFailed === 0;

  } catch (error: any) {
    success = false;
    errors.push(error.message);
    output += `Fatal error: ${error.message}\n`;
  } finally {
    await browser.close();
  }

  const duration = Date.now() - startTime;

  return {
    success,
    duration,
    testsRun,
    testsPassed,
    testsFailed,
    errors,
    screenshots: [],
    output,
  };
}

async function runLegacyCart(): Promise<TestRunResult> {
  const startTime = Date.now();

  const browser = await chromium.launch({ headless: CONFIG.headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  let success = true;
  let testsRun = 0;
  let testsPassed = 0;
  let testsFailed = 0;
  const errors: string[] = [];
  let output = '';

  try {
    log('  Running legacy cart checks...', 'dim');

    // Test 1: Cart page accessible
    testsRun++;
    try {
      await page.goto(`${CONFIG.baseUrl}/cart`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      testsPassed++;
      output += '✅ Cart page accessible\n';
    } catch (error: any) {
      testsFailed++;
      errors.push(`Cart page failed: ${error.message}`);
      output += `❌ Cart page accessible: ${error.message}\n`;
    }

    // Test 2: Checkout page accessible
    testsRun++;
    try {
      await page.goto(`${CONFIG.baseUrl}/checkout`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      testsPassed++;
      output += '✅ Checkout page accessible\n';
    } catch (error: any) {
      testsFailed++;
      errors.push(`Checkout page failed: ${error.message}`);
      output += `❌ Checkout page accessible: ${error.message}\n`;
    }

    success = testsFailed === 0;

  } catch (error: any) {
    success = false;
    errors.push(error.message);
    output += `Fatal error: ${error.message}\n`;
  } finally {
    await browser.close();
  }

  const duration = Date.now() - startTime;

  return {
    success,
    duration,
    testsRun,
    testsPassed,
    testsFailed,
    errors,
    screenshots: [],
    output,
  };
}

// ============================================================================
// UBF SCRIPT RUNNERS
// ============================================================================

async function runUBFModule(moduleId: string): Promise<TestRunResult> {
  const startTime = Date.now();
  let output = '';
  let success = false;
  let testsRun = 0;
  let testsPassed = 0;
  let testsFailed = 0;
  const errors: string[] = [];

  try {
    log(`  Running UBF module: ${moduleId}...`, 'dim');

    // Run the UBF command
    output = execSync(`npm run bot test ${moduleId} -- --preset=ci --format=json`, {
      encoding: 'utf8',
      timeout: CONFIG.timeout,
      env: { ...process.env, BASE_URL: CONFIG.baseUrl },
    });

    // Try to parse JSON report
    const reportPath = path.join('./reports/latest.json');
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      testsRun = report.summary.total;
      testsPassed = report.summary.passed;
      testsFailed = report.summary.failed;
      success = report.summary.failed === 0;

      // Collect errors
      report.results
        .filter((r: any) => r.status === 'failed')
        .forEach((r: any) => {
          errors.push(`${r.moduleName}: ${r.error}`);
        });
    } else {
      // Parse from console output
      const lines = output.split('\n');
      lines.forEach(line => {
        if (line.includes('✓') || line.includes('Passed:')) testsPassed++;
        if (line.includes('✗') || line.includes('Failed:')) testsFailed++;
        if (line.includes('Error:') || line.includes('failed')) {
          errors.push(line.trim());
        }
      });
      testsRun = testsPassed + testsFailed;
      success = testsFailed === 0 && testsPassed > 0;
    }

  } catch (error: any) {
    success = false;
    errors.push(error.message);
    output = error.stdout || error.stderr || error.message;
  }

  const duration = Date.now() - startTime;

  return {
    success,
    duration,
    testsRun,
    testsPassed,
    testsFailed,
    errors,
    screenshots: [],
    output,
  };
}

// ============================================================================
// COMPARISON ENGINE
// ============================================================================

function compareResults(
  legacy: TestRunResult,
  ubf: TestRunResult,
  moduleName: string
): ComparisonResult {
  const differences: Difference[] = [];
  let match = true;

  // Compare success status
  if (legacy.success !== ubf.success) {
    match = false;
    differences.push({
      type: 'functionality',
      severity: 'critical',
      description: 'Overall success status differs',
      legacy: legacy.success ? 'PASS' : 'FAIL',
      ubf: ubf.success ? 'PASS' : 'FAIL',
      impact: 'UBF may have introduced a regression or fixed a bug',
    });
  }

  // Compare test counts (with tolerance)
  const testCountDiff = Math.abs(legacy.testsRun - ubf.testsRun);
  if (testCountDiff > CONFIG.thresholds.testCountDifference) {
    differences.push({
      type: 'test_count',
      severity: 'medium',
      description: 'Number of tests differs significantly',
      legacy: legacy.testsRun,
      ubf: ubf.testsRun,
      impact: `UBF has ${ubf.testsRun > legacy.testsRun ? 'more' : 'fewer'} tests (${testCountDiff} difference)`,
    });
  }

  // Compare success rates (if both ran tests)
  if (legacy.testsRun > 0 && ubf.testsRun > 0) {
    const legacyRate = (legacy.testsPassed / legacy.testsRun) * 100;
    const ubfRate = (ubf.testsPassed / ubf.testsRun) * 100;
    const rateDiff = Math.abs(legacyRate - ubfRate);

    if (rateDiff > CONFIG.thresholds.successRateDifferencePercent) {
      match = false;
      differences.push({
        type: 'success_rate',
        severity: ubfRate < legacyRate ? 'high' : 'low',
        description: 'Success rate differs',
        legacy: `${legacyRate.toFixed(1)}%`,
        ubf: `${ubfRate.toFixed(1)}%`,
        impact: ubfRate < legacyRate
          ? 'UBF success rate is lower - investigate failures'
          : 'UBF success rate is higher - possible improvements',
      });
    }
  }

  // Compare duration (with tolerance)
  const durationDiffPercent = Math.abs(
    ((ubf.duration - legacy.duration) / legacy.duration) * 100
  );

  if (durationDiffPercent > CONFIG.thresholds.durationDifferencePercent) {
    differences.push({
      type: 'duration',
      severity: 'low',
      description: 'Execution time differs significantly',
      legacy: `${(legacy.duration / 1000).toFixed(2)}s`,
      ubf: `${(ubf.duration / 1000).toFixed(2)}s`,
      impact: ubf.duration > legacy.duration
        ? `UBF is ${durationDiffPercent.toFixed(0)}% slower`
        : `UBF is ${durationDiffPercent.toFixed(0)}% faster`,
    });
  }

  // Compare errors
  const legacyHasErrors = legacy.errors.length > 0;
  const ubfHasErrors = ubf.errors.length > 0;

  if (legacyHasErrors !== ubfHasErrors) {
    differences.push({
      type: 'error',
      severity: ubfHasErrors ? 'high' : 'low',
      description: 'Error presence differs',
      legacy: legacyHasErrors ? `${legacy.errors.length} errors` : 'No errors',
      ubf: ubfHasErrors ? `${ubf.errors.length} errors` : 'No errors',
      impact: ubfHasErrors
        ? 'UBF encountered errors that legacy did not'
        : 'UBF fixed errors that legacy had',
    });
  }

  // Determine recommendation
  let recommendation: 'PASS' | 'INVESTIGATE' | 'FAIL';
  const criticalDiffs = differences.filter(d => d.severity === 'critical').length;
  const highDiffs = differences.filter(d => d.severity === 'high').length;

  if (criticalDiffs > 0 || (highDiffs > 1 && !ubf.success)) {
    recommendation = 'FAIL';
  } else if (highDiffs > 0 || differences.length > 2) {
    recommendation = 'INVESTIGATE';
  } else {
    recommendation = 'PASS';
  }

  // Generate summary
  let summary = '';
  if (match && differences.length === 0) {
    summary = '✅ Perfect match - UBF produces identical results to legacy';
  } else if (recommendation === 'PASS') {
    summary = '✅ Acceptable differences - UBF is compatible with legacy';
  } else if (recommendation === 'INVESTIGATE') {
    summary = '⚠️  Requires investigation - notable differences found';
  } else {
    summary = '❌ Significant differences - UBF may have regressions';
  }

  return {
    match,
    differences,
    summary,
    recommendation,
  };
}

// ============================================================================
// REPORTING
// ============================================================================

function printValidationResult(result: ValidationResult) {
  const c = CONFIG.colors;

  logSubsection(`📊 Results for: ${result.module}`);

  // Legacy results
  console.log(`\n${c.bright}Legacy Script:${c.reset}`);
  console.log(`  Success:   ${result.legacy.success ? `${c.green}✅ PASS${c.reset}` : `${c.red}❌ FAIL${c.reset}`}`);
  console.log(`  Tests:     ${result.legacy.testsPassed}/${result.legacy.testsRun} passed`);
  console.log(`  Duration:  ${(result.legacy.duration / 1000).toFixed(2)}s`);
  if (result.legacy.errors.length > 0) {
    console.log(`  Errors:    ${result.legacy.errors.length}`);
  }

  // UBF results
  console.log(`\n${c.bright}UBF Module:${c.reset}`);
  console.log(`  Success:   ${result.ubf.success ? `${c.green}✅ PASS${c.reset}` : `${c.red}❌ FAIL${c.reset}`}`);
  console.log(`  Tests:     ${result.ubf.testsPassed}/${result.ubf.testsRun} passed`);
  console.log(`  Duration:  ${(result.ubf.duration / 1000).toFixed(2)}s`);
  if (result.ubf.errors.length > 0) {
    console.log(`  Errors:    ${result.ubf.errors.length}`);
  }

  // Comparison
  console.log(`\n${c.bright}Comparison:${c.reset}`);
  console.log(`  ${result.comparison.summary}`);

  if (result.comparison.differences.length > 0) {
    console.log(`\n${c.bright}Differences Found:${c.reset}`);
    result.comparison.differences.forEach((diff, idx) => {
      const severityColor =
        diff.severity === 'critical' ? 'red' :
          diff.severity === 'high' ? 'red' :
            diff.severity === 'medium' ? 'yellow' : 'dim';

      console.log(`\n  ${idx + 1}. ${c[severityColor]}[${diff.severity.toUpperCase()}]${c.reset} ${diff.description}`);
      console.log(`     Legacy: ${diff.legacy}`);
      console.log(`     UBF:    ${diff.ubf}`);
      console.log(`     Impact: ${diff.impact}`);
    });
  }

  // Recommendation
  const recColor =
    result.comparison.recommendation === 'PASS' ? 'green' :
      result.comparison.recommendation === 'INVESTIGATE' ? 'yellow' : 'red';

  console.log(`\n${c.bright}Recommendation:${c.reset} ${c[recColor]}${result.comparison.recommendation}${c.reset}`);
}

function generateReport(results: ValidationResult[]) {
  const timestamp = new Date().toISOString();
  const reportPath = path.join(CONFIG.outputDir, `validation-${Date.now()}.json`);

  const report = {
    timestamp,
    summary: {
      totalModules: results.length,
      passed: results.filter(r => r.comparison.recommendation === 'PASS').length,
      investigate: results.filter(r => r.comparison.recommendation === 'INVESTIGATE').length,
      failed: results.filter(r => r.comparison.recommendation === 'FAIL').length,
    },
    results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Also save markdown report
  const mdPath = path.join(CONFIG.outputDir, `validation-${Date.now()}.md`);
  const md = generateMarkdownReport(report);
  fs.writeFileSync(mdPath, md);

  return { json: reportPath, markdown: mdPath };
}

function generateMarkdownReport(report: any): string {
  const timestamp = new Date(report.timestamp).toLocaleString();

  let md = `# UBF Parity Validation Report\n\n`;
  md += `**Date:** ${timestamp}\n\n`;

  md += `## Summary\n\n`;
  md += `| Status | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| ✅ Pass | ${report.summary.passed} |\n`;
  md += `| ⚠️  Investigate | ${report.summary.investigate} |\n`;
  md += `| ❌ Fail | ${report.summary.failed} |\n`;
  md += `| **Total** | **${report.summary.totalModules}** |\n\n`;

  report.results.forEach((result: ValidationResult) => {
    md += `## ${result.module}\n\n`;

    md += `### Legacy Script\n`;
    md += `- Success: ${result.legacy.success ? '✅' : '❌'}\n`;
    md += `- Tests: ${result.legacy.testsPassed}/${result.legacy.testsRun}\n`;
    md += `- Duration: ${(result.legacy.duration / 1000).toFixed(2)}s\n\n`;

    md += `### UBF Module\n`;
    md += `- Success: ${result.ubf.success ? '✅' : '❌'}\n`;
    md += `- Tests: ${result.ubf.testsPassed}/${result.ubf.testsRun}\n`;
    md += `- Duration: ${(result.ubf.duration / 1000).toFixed(2)}s\n\n`;

    md += `### Comparison\n`;
    md += `**Recommendation:** ${result.comparison.recommendation}\n\n`;
    md += `${result.comparison.summary}\n\n`;

    if (result.comparison.differences.length > 0) {
      md += `#### Differences\n\n`;
      result.comparison.differences.forEach((diff, idx) => {
        md += `${idx + 1}. **[${diff.severity.toUpperCase()}]** ${diff.description}\n`;
        md += `   - Legacy: ${diff.legacy}\n`;
        md += `   - UBF: ${diff.ubf}\n`;
        md += `   - Impact: ${diff.impact}\n\n`;
      });
    }
  });

  return md;
}

// ============================================================================
// MAIN VALIDATION FLOW
// ============================================================================

async function validateModule(moduleId: string): Promise<ValidationResult> {
  const module = VALIDATION_MODULES.find(m => m.id === moduleId);
  if (!module) {
    throw new Error(`Unknown module: ${moduleId}`);
  }

  logSubsection(`🔍 Validating: ${module.name}`);
  log(`   ${module.description}`, 'dim');

  // Run legacy
  let legacyResult: TestRunResult;
  switch (moduleId) {
    case 'health':
      legacyResult = await runLegacyHealthChecks();
      break;
    case 'marketplace':
      legacyResult = await runLegacyMarketplace();
      break;
    case 'cart':
      legacyResult = await runLegacyCart();
      break;
    default:
      throw new Error(`No legacy runner for: ${moduleId}`);
  }

  log(`  ✅ Legacy completed: ${legacyResult.testsPassed}/${legacyResult.testsRun} passed`, 'green');

  // Run UBF
  const ubfResult = await runUBFModule(moduleId);
  log(`  ✅ UBF completed: ${ubfResult.testsPassed}/${ubfResult.testsRun} passed`, 'green');

  // Compare
  const comparison = compareResults(legacyResult, ubfResult, module.name);

  return {
    module: module.name,
    legacy: legacyResult,
    ubf: ubfResult,
    comparison,
    timestamp: new Date().toISOString(),
  };
}

async function main() {
  const args = parseArgs();

  logSection('🔍 UBF PARITY VALIDATION');
  log('Comparing UBF outputs with legacy script results\n', 'dim');

  ensureDirectories();

  const results: ValidationResult[] = [];

  // Determine which modules to validate
  let modulesToValidate: string[];
  if (args.module) {
    modulesToValidate = [args.module];
  } else if (args.all) {
    modulesToValidate = VALIDATION_MODULES.map(m => m.id);
  } else {
    // Default: validate health only
    modulesToValidate = ['health'];
  }

  log(`Validating ${modulesToValidate.length} module(s): ${modulesToValidate.join(', ')}\n`, 'cyan');

  // Run validations
  for (const moduleId of modulesToValidate) {
    try {
      const result = await validateModule(moduleId);
      results.push(result);
      printValidationResult(result);
    } catch (error: any) {
      log(`\n❌ Failed to validate ${moduleId}: ${error.message}`, 'red');
    }
  }

  // Generate report
  logSection('📊 VALIDATION SUMMARY');

  const passed = results.filter(r => r.comparison.recommendation === 'PASS').length;
  const investigate = results.filter(r => r.comparison.recommendation === 'INVESTIGATE').length;
  const failed = results.filter(r => r.comparison.recommendation === 'FAIL').length;

  console.log(`Total modules validated: ${results.length}`);
  console.log(`  ${CONFIG.colors.green}✅ Pass:${CONFIG.colors.reset}         ${passed}`);
  console.log(`  ${CONFIG.colors.yellow}⚠️  Investigate:${CONFIG.colors.reset} ${investigate}`);
  console.log(`  ${CONFIG.colors.red}❌ Fail:${CONFIG.colors.reset}         ${failed}\n`);

  // Save reports
  const reportPaths = generateReport(results);
  log(`\n📄 Reports saved:`, 'cyan');
  log(`   JSON:     ${reportPaths.json}`, 'dim');
  log(`   Markdown: ${reportPaths.markdown}`, 'dim');

  // Exit code
  if (failed > 0) {
    log(`\n❌ Validation FAILED - ${failed} module(s) have critical issues`, 'red');
    process.exit(1);
  } else if (investigate > 0) {
    log(`\n⚠️  Validation requires INVESTIGATION - ${investigate} module(s) need review`, 'yellow');
    process.exit(0); // Don't fail build, but notify
  } else {
    log(`\n✅ Validation PASSED - All modules match legacy behavior`, 'green');
    process.exit(0);
  }
}

// ============================================================================
// ENTRY POINT
// ============================================================================

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
