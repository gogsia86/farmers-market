#!/usr/bin/env tsx
/**
 * Test Failure Analysis Script
 * Analyzes Jest test output and categorizes failures for triage
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface FailureCategory {
  name: string;
  pattern: RegExp;
  files: Set<string>;
  count: number;
  examples: string[];
}

interface TestStats {
  totalSuites: number;
  failedSuites: number;
  passedSuites: number;
  skippedSuites: number;
  totalTests: number;
  failedTests: number;
  passedTests: number;
  skippedTests: number;
  passRate: number;
}

const categories: FailureCategory[] = [
  {
    name: 'Test Environment Issues (jsdom required)',
    pattern: /ReferenceError: (document|window|navigator|localStorage) is not defined/,
    files: new Set(),
    count: 0,
    examples: []
  },
  {
    name: 'Import/Module Resolution Errors',
    pattern: /Cannot find module|Module not found|Cannot resolve/,
    files: new Set(),
    count: 0,
    examples: []
  },
  {
    name: 'Prisma/Database Connection Issues',
    pattern: /PrismaClient|database|connection/i,
    files: new Set(),
    count: 0,
    examples: []
  },
  {
    name: 'Timeout Errors',
    pattern: /Timeout|exceeded timeout/i,
    files: new Set(),
    count: 0,
    examples: []
  },
  {
    name: 'Type/TypeScript Errors',
    pattern: /Type|TS\d{4}|TypeScript/,
    files: new Set(),
    count: 0,
    examples: []
  },
  {
    name: 'Assertion Failures',
    pattern: /expect\(|toBe|toEqual|toHaveBeenCalled/,
    files: new Set(),
    count: 0,
    examples: []
  },
  {
    name: 'Network/API Errors',
    pattern: /fetch|network|ECONNREFUSED|request failed/i,
    files: new Set(),
    count: 0,
    examples: []
  },
  {
    name: 'Other Errors',
    pattern: /.*/,
    files: new Set(),
    count: 0,
    examples: []
  }
];

function parseTestOutput(output: string): { stats: TestStats; failures: string[] } {
  const lines = output.split('\n');

  // Extract test summary
  const summaryLine = lines.find(l => l.includes('Test Suites:'));
  const testLine = lines.find(l => l.includes('Tests:') && !l.includes('Test Suites:'));

  const stats: TestStats = {
    totalSuites: 0,
    failedSuites: 0,
    passedSuites: 0,
    skippedSuites: 0,
    totalTests: 0,
    failedTests: 0,
    passedTests: 0,
    skippedTests: 0,
    passRate: 0
  };

  if (summaryLine) {
    const suiteMatch = summaryLine.match(/(\d+) failed.*?(\d+) skipped.*?(\d+) passed.*?(\d+) total/);
    if (suiteMatch) {
      stats.failedSuites = parseInt(suiteMatch[1]);
      stats.skippedSuites = parseInt(suiteMatch[2]);
      stats.passedSuites = parseInt(suiteMatch[3]);
      stats.totalSuites = parseInt(suiteMatch[4]);
    }
  }

  if (testLine) {
    const testMatch = testLine.match(/(\d+) failed.*?(\d+) skipped.*?(\d+) passed.*?(\d+) total/);
    if (testMatch) {
      stats.failedTests = parseInt(testMatch[1]);
      stats.skippedTests = parseInt(testMatch[2]);
      stats.passedTests = parseInt(testMatch[3]);
      stats.totalTests = parseInt(testMatch[4]);
      stats.passRate = (stats.passedTests / stats.totalTests) * 100;
    }
  }

  // Extract failure sections
  const failures: string[] = [];
  let currentFailure = '';
  let inFailureSection = false;

  for (const line of lines) {
    if (line.match(/^FAIL.*\.test\.ts/)) {
      if (currentFailure) {
        failures.push(currentFailure);
      }
      currentFailure = line + '\n';
      inFailureSection = true;
    } else if (inFailureSection) {
      if (line.match(/^PASS|^Test Suites:/)) {
        if (currentFailure) {
          failures.push(currentFailure);
        }
        currentFailure = '';
        inFailureSection = false;
      } else {
        currentFailure += line + '\n';
      }
    }
  }

  if (currentFailure) {
    failures.push(currentFailure);
  }

  return { stats, failures };
}

function categorizeFailures(failures: string[]): void {
  for (const failure of failures) {
    // Extract file path
    const fileMatch = failure.match(/FAIL.*?(src\/.*?\.test\.ts)/);
    const file = fileMatch ? fileMatch[1] : 'Unknown';

    // Try to categorize
    let categorized = false;

    for (const category of categories) {
      if (category.name === 'Other Errors') continue; // Skip catch-all for now

      if (category.pattern.test(failure)) {
        category.files.add(file);
        category.count++;

        // Add example if we don't have many yet
        if (category.examples.length < 3) {
          const errorMatch = failure.match(/●.*?\n\n(.*?)\n\n/s);
          if (errorMatch) {
            category.examples.push(errorMatch[1].trim().substring(0, 200));
          }
        }

        categorized = true;
        break;
      }
    }

    // If not categorized, add to "Other"
    if (!categorized) {
      const otherCategory = categories.find(c => c.name === 'Other Errors')!;
      otherCategory.files.add(file);
      otherCategory.count++;
    }
  }
}

function generateReport(stats: TestStats): string {
  const report: string[] = [];

  report.push('# Test Failure Analysis Report');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push('');

  report.push('## 📊 Overall Statistics');
  report.push('');
  report.push('| Metric | Value |');
  report.push('|--------|-------|');
  report.push(`| Total Test Suites | ${stats.totalSuites} |`);
  report.push(`| Failed Suites | ${stats.failedSuites} (${((stats.failedSuites / stats.totalSuites) * 100).toFixed(1)}%) |`);
  report.push(`| Passed Suites | ${stats.passedSuites} (${((stats.passedSuites / stats.totalSuites) * 100).toFixed(1)}%) |`);
  report.push(`| Skipped Suites | ${stats.skippedSuites} |`);
  report.push('');
  report.push(`| Total Tests | ${stats.totalTests} |`);
  report.push(`| Failed Tests | ${stats.failedTests} (${((stats.failedTests / stats.totalTests) * 100).toFixed(1)}%) |`);
  report.push(`| Passed Tests | ${stats.passedTests} (${((stats.passedTests / stats.totalTests) * 100).toFixed(1)}%) |`);
  report.push(`| Skipped Tests | ${stats.skippedTests} |`);
  report.push(`| **Pass Rate** | **${stats.passRate.toFixed(1)}%** |`);
  report.push('');

  report.push('## 🔍 Failure Categories');
  report.push('');

  // Sort categories by count (descending)
  const sortedCategories = [...categories]
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  for (const category of sortedCategories) {
    report.push(`### ${category.name}`);
    report.push('');
    report.push(`**Failures:** ${category.count} | **Affected Files:** ${category.files.size}`);
    report.push('');

    if (category.examples.length > 0) {
      report.push('**Example Errors:**');
      report.push('```');
      report.push(category.examples.join('\n\n---\n\n'));
      report.push('```');
      report.push('');
    }

    if (category.files.size > 0) {
      report.push('**Affected Test Files:**');
      const sortedFiles = Array.from(category.files).sort();
      for (const file of sortedFiles.slice(0, 10)) {
        report.push(`- ${file}`);
      }
      if (sortedFiles.length > 10) {
        report.push(`- ... and ${sortedFiles.length - 10} more`);
      }
      report.push('');
    }
  }

  report.push('## 🎯 Recommended Actions');
  report.push('');

  const jsdomCategory = categories.find(c => c.name.includes('jsdom'));
  if (jsdomCategory && jsdomCategory.count > 0) {
    report.push('### Priority 1: Fix Test Environment Issues');
    report.push('');
    report.push(`${jsdomCategory.count} tests are failing due to missing browser environment (document, window, etc.)`);
    report.push('');
    report.push('**Action:** Add test environment configuration to affected test files:');
    report.push('```typescript');
    report.push("/**");
    report.push(" * @jest-environment jsdom");
    report.push(" */");
    report.push('```');
    report.push('');
  }

  const moduleCategory = categories.find(c => c.name.includes('Module'));
  if (moduleCategory && moduleCategory.count > 0) {
    report.push('### Priority 2: Fix Module Resolution Issues');
    report.push('');
    report.push(`${moduleCategory.count} tests have import/module resolution errors.`);
    report.push('');
    report.push('**Action:** Review jest.config and module mappings, fix import paths.');
    report.push('');
  }

  const prismaCategory = categories.find(c => c.name.includes('Prisma'));
  if (prismaCategory && prismaCategory.count > 0) {
    report.push('### Priority 3: Fix Database/Prisma Issues');
    report.push('');
    report.push(`${prismaCategory.count} tests have database connection or Prisma client issues.`);
    report.push('');
    report.push('**Action:** Ensure test database is running, review database mocks/setup.');
    report.push('');
  }

  report.push('## 📈 Progress Tracking');
  report.push('');
  report.push('- [ ] Fix test environment issues (jsdom)');
  report.push('- [ ] Fix module resolution errors');
  report.push('- [ ] Fix database/Prisma issues');
  report.push('- [ ] Fix timeout issues');
  report.push('- [ ] Review and fix assertion failures');
  report.push('- [ ] Achieve 95%+ pass rate');
  report.push('');

  return report.join('\n');
}

async function main() {
  console.log('🔍 Analyzing test failures...\n');

  try {
    // Run tests and capture output
    console.log('Running test suite...');
    const output = execSync('npm run test:unit -- --no-coverage', {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      stdio: 'pipe'
    }).toString();

    console.log('Parsing results...');
    const { stats, failures } = parseTestOutput(output);

    console.log('Categorizing failures...');
    categorizeFailures(failures);

    console.log('Generating report...\n');
    const report = generateReport(stats);

    // Save report
    const reportPath = path.join(process.cwd(), 'TEST_FAILURE_ANALYSIS.md');
    fs.writeFileSync(reportPath, report, 'utf-8');

    // Print summary
    console.log('=' .repeat(60));
    console.log('TEST FAILURE ANALYSIS SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${stats.totalTests}`);
    console.log(`Passed: ${stats.passedTests} (${stats.passRate.toFixed(1)}%)`);
    console.log(`Failed: ${stats.failedTests} (${((stats.failedTests / stats.totalTests) * 100).toFixed(1)}%)`);
    console.log(`Skipped: ${stats.skippedTests}`);
    console.log('');
    console.log('Top Failure Categories:');

    const sortedCategories = [...categories]
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    for (const category of sortedCategories) {
      console.log(`  ${category.name}: ${category.count} failures`);
    }

    console.log('');
    console.log(`📄 Full report saved to: ${reportPath}`);
    console.log('=' .repeat(60));

  } catch (error: any) {
    // Even if tests fail, the error will contain output
    if (error.stdout) {
      console.log('Parsing results from failed run...');
      const { stats, failures } = parseTestOutput(error.stdout.toString());

      console.log('Categorizing failures...');
      categorizeFailures(failures);

      console.log('Generating report...\n');
      const report = generateReport(stats);

      // Save report
      const reportPath = path.join(process.cwd(), 'TEST_FAILURE_ANALYSIS.md');
      fs.writeFileSync(reportPath, report, 'utf-8');

      // Print summary
      console.log('=' .repeat(60));
      console.log('TEST FAILURE ANALYSIS SUMMARY');
      console.log('=' .repeat(60));
      console.log(`Total Tests: ${stats.totalTests}`);
      console.log(`Passed: ${stats.passedTests} (${stats.passRate.toFixed(1)}%)`);
      console.log(`Failed: ${stats.failedTests} (${((stats.failedTests / stats.totalTests) * 100).toFixed(1)}%)`);
      console.log(`Skipped: ${stats.skippedTests}`);
      console.log('');
      console.log('Top Failure Categories:');

      const sortedCategories = [...categories]
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      for (const category of sortedCategories) {
        console.log(`  ${category.name}: ${category.count} failures`);
      }

      console.log('');
      console.log(`📄 Full report saved to: ${reportPath}`);
      console.log('=' .repeat(60));
    } else {
      console.error('Error running tests:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
