#!/usr/bin/env node
/**
 * 🤖 Unified Bot Framework - CLI Interface
 * Farmers Market Platform
 *
 * Command-line interface for running tests, generating reports,
 * and managing the test framework.
 *
 * Usage:
 *   npm run bot test <module|suite>
 *   npm run bot test:all [--filter=...]
 *   npm run bot list [modules|suites]
 *   npm run bot report <run-id>
 *   npm run bot monitor <suite> [--interval=60]
 */

import { createConfig } from '../config/bot-config';
import { createReportGenerator } from '../core/report-generator';
import type { TestFilter, TestRunReport } from '../core/test-runner';
import { createTestRunner } from '../core/test-runner';
import type { BotConfig, BotModule, TestModule, TestSuite } from '../types';

// Import module adapter
import { adaptTestModules } from '../adapters/module-adapter';

// Import all available modules
import AuthLoginModule from '../modules/auth/login.module';
import CartCheckoutModule from '../modules/cart/checkout.module';
import HealthChecksModule from '../modules/health/checks.module';
import MarketplaceBrowseModule from '../modules/marketplace/browse.module';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

/**
 * CLI Configuration
 */
interface CLIOptions {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
}

/**
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      flags[key] = value ?? true;
    } else if (arg.startsWith('-')) {
      flags[arg.slice(1)] = true;
    } else {
      positional.push(arg);
    }
  }

  return {
    command: positional[0] || 'help',
    args: positional.slice(1),
    flags,
  };
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
${colors.bright}${colors.cyan}🤖 Unified Bot Framework CLI${colors.reset}
${colors.dim}Version 1.0.0${colors.reset}

${colors.bright}USAGE:${colors.reset}
  npm run bot <command> [options]

${colors.bright}COMMANDS:${colors.reset}
  ${colors.green}test${colors.reset} <module|suite>       Run a specific test module or suite
  ${colors.green}test:all${colors.reset}                  Run all registered tests
  ${colors.green}test:health${colors.reset}               Run health check tests
  ${colors.green}test:critical${colors.reset}             Run only critical tests
  ${colors.green}list${colors.reset} [modules|suites]     List available modules or suites
  ${colors.green}monitor${colors.reset} <suite>           Start continuous monitoring
  ${colors.green}report${colors.reset} [latest|<path>]    Generate/view test reports
  ${colors.green}info${colors.reset}                      Show framework information
  ${colors.green}help${colors.reset}                      Show this help message

${colors.bright}OPTIONS:${colors.reset}
  ${colors.yellow}--preset${colors.reset}=<name>           Configuration preset (quick, mvp, ci, debug)
  ${colors.yellow}--filter${colors.reset}=<json>          Filter tests (JSON string)
  ${colors.yellow}--tags${colors.reset}=<tag1,tag2>       Filter by tags
  ${colors.yellow}--category${colors.reset}=<cat>         Filter by category (CRITICAL, IMPORTANT, OPTIONAL)
  ${colors.yellow}--format${colors.reset}=<fmt>           Report format (json, markdown, html, console)
  ${colors.yellow}--output${colors.reset}=<dir>           Output directory for reports
  ${colors.yellow}--headless${colors.reset}               Run in headless mode (default: true)
  ${colors.yellow}--headed${colors.reset}                 Run in headed mode (show browser)
  ${colors.yellow}--interval${colors.reset}=<seconds>     Monitoring interval (default: 60)
  ${colors.yellow}--continue-on-failure${colors.reset}    Continue running tests after failures
  ${colors.yellow}--verbose${colors.reset}                Enable verbose logging
  ${colors.yellow}--quiet${colors.reset}                  Suppress non-essential output

${colors.bright}EXAMPLES:${colors.reset}
  # Run health checks
  npm run bot test health

  # Run all critical tests
  npm run bot test:critical

  # Run specific module with headed browser
  npm run bot test marketplace --headed

  # Run with custom preset and filters
  npm run bot test:all --preset=ci --tags=smoke,critical

  # Start monitoring health checks
  npm run bot monitor health --interval=30

  # List all available modules
  npm run bot list modules

  # Generate HTML report
  npm run bot report --format=html --output=./reports

${colors.bright}CONFIGURATION:${colors.reset}
  Environment variables can be used to configure the framework:
  - ${colors.cyan}BASE_URL${colors.reset}          Base URL for testing (default: http://localhost:3000)
  - ${colors.cyan}HEADLESS${colors.reset}          Run in headless mode (default: true)
  - ${colors.cyan}TIMEOUT${colors.reset}           Default timeout in ms (default: 30000)
  - ${colors.cyan}SCREENSHOT_DIR${colors.reset}    Screenshot directory (default: ./screenshots)
  - ${colors.cyan}REPORT_DIR${colors.reset}        Report directory (default: ./reports)

${colors.bright}PRESETS:${colors.reset}
  ${colors.green}quick${colors.reset}       - Fast validation (1 retry, short timeouts)
  ${colors.green}mvp${colors.reset}         - MVP validation (2 retries, standard timeouts)
  ${colors.green}ci${colors.reset}          - CI/CD optimized (headless, retries, continue on failure)
  ${colors.green}debug${colors.reset}       - Debug mode (headed, no retries, verbose logging)
  ${colors.green}monitoring${colors.reset}  - Continuous monitoring (alerts enabled)

For more information, visit: https://github.com/your-repo/farmers-market
  `);
}

/**
 * Print framework information
 */
function printInfo(): void {
  const { getFrameworkInfo } = require('../index');
  const info = getFrameworkInfo();

  console.log(`
${colors.bright}${colors.cyan}🤖 ${info.name}${colors.reset}
${colors.dim}Version: ${info.version}${colors.reset}

${colors.bright}Description:${colors.reset}
  ${info.description}

${colors.bright}Status:${colors.reset}
  - Foundation: ${colors.green}${info.status.foundation}${colors.reset}
  - Core Engine: ${colors.green}${info.status.coreEngine}${colors.reset}
  - Test Modules: ${colors.yellow}${info.status.testModules}${colors.reset}

${colors.bright}Migrated Modules:${colors.reset}
  ${info.status.migratedModules.map((m: string) => `  - ${colors.green}${m}${colors.reset}`).join('\n')}

${colors.bright}Features:${colors.reset}
  ${info.features.map((f: string) => `  ✓ ${f}`).join('\n')}
  `);
}

/**
 * Get configuration from CLI options
 */
function getConfig(options: CLIOptions): BotConfig {
  const preset = options.flags.preset as string || 'mvp';
  const config = createConfig(preset);

  // Override with CLI flags
  if (options.flags.headless !== undefined) {
    config.headless = options.flags.headless as boolean;
  }

  if (options.flags.headed !== undefined) {
    config.headless = false;
  }

  if (options.flags.verbose !== undefined) {
    config.verbose = options.flags.verbose as boolean;
  }

  if (options.flags['continue-on-failure'] !== undefined) {
    config.continueOnFailure = options.flags['continue-on-failure'] as boolean;
  }

  if (options.flags.output) {
    config.reportDir = options.flags.output as string;
  }

  return config;
}

/**
 * Get test filter from CLI options
 */
function getFilter(options: CLIOptions): TestFilter | undefined {
  const filter: TestFilter = {};

  // Parse filter JSON if provided
  if (options.flags.filter) {
    try {
      const parsed = JSON.parse(options.flags.filter as string);
      Object.assign(filter, parsed);
    } catch (error) {
      console.error(`${colors.red}Error parsing filter JSON:${colors.reset}`, error);
      process.exit(1);
    }
  }

  // Parse tags
  if (options.flags.tags) {
    filter.tags = (options.flags.tags as string).split(',').map(t => t.trim());
  }

  // Parse category
  if (options.flags.category) {
    filter.categories = [(options.flags.category as string)];
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Get all available modules (converted to BotModule format)
 */
function getAvailableModules(): BotModule[] {
  const testModules: TestModule[] = [
    HealthChecksModule,
    MarketplaceBrowseModule,
    CartCheckoutModule,
    AuthLoginModule,
  ];

  // Convert TestModules to BotModules using adapter
  return adaptTestModules(testModules);
}

/**
 * Get all available suites
 */
function getAvailableSuites(): TestSuite[] {
  return [
    {
      id: 'health',
      name: 'Health Checks',
      description: 'Critical health and availability checks',
      modules: ['health'],
    },
    {
      id: 'marketplace',
      name: 'Marketplace Tests',
      description: 'Product browsing and search functionality',
      modules: ['marketplace-browse'],
    },
    {
      id: 'checkout',
      name: 'Checkout Flow',
      description: 'Shopping cart and checkout process',
      modules: ['cart-checkout'],
    },
    {
      id: 'auth',
      name: 'Authentication',
      description: 'User authentication flows',
      modules: ['auth.login.farmer'],
    },
    {
      id: 'critical',
      name: 'Critical Tests',
      description: 'All critical priority tests',
      modules: ['health', 'auth.login.farmer'],
    },
    {
      id: 'smoke',
      name: 'Smoke Tests',
      description: 'Quick smoke test suite',
      modules: ['health', 'marketplace-browse'],
    },
    {
      id: 'full',
      name: 'Full Test Suite',
      description: 'Complete test coverage',
      modules: ['health', 'marketplace-browse', 'cart-checkout', 'auth.login.farmer'],
    },
  ];
}

/**
 * List available modules
 */
function listModules(): void {
  const modules = getAvailableModules();

  console.log(`\n${colors.bright}${colors.cyan}Available Test Modules:${colors.reset}\n`);

  modules.forEach(module => {
    const categoryColor =
      module.category === 'CRITICAL' ? colors.red :
        module.category === 'IMPORTANT' ? colors.yellow :
          colors.dim;

    console.log(`  ${colors.green}${module.id}${colors.reset}`);
    console.log(`    ${module.name}`);
    console.log(`    ${colors.dim}${module.description}${colors.reset}`);
    console.log(`    Category: ${categoryColor}${module.category}${colors.reset}`);
    console.log(`    Tags: ${module.tags.join(', ')}`);
    console.log(`    Tests: ${module.tests.length}`);
    console.log('');
  });

  console.log(`${colors.dim}Total: ${modules.length} modules${colors.reset}\n`);
}

/**
 * List available suites
 */
function listSuites(): void {
  const suites = getAvailableSuites();

  console.log(`\n${colors.bright}${colors.cyan}Available Test Suites:${colors.reset}\n`);

  suites.forEach(suite => {
    console.log(`  ${colors.green}${suite.id}${colors.reset}`);
    console.log(`    ${suite.name}`);
    console.log(`    ${colors.dim}${suite.description}${colors.reset}`);
    console.log(`    Modules: ${suite.modules.join(', ')}`);
    console.log('');
  });

  console.log(`${colors.dim}Total: ${suites.length} suites${colors.reset}\n`);
}

/**
 * Print test report summary to console
 */
function printReportSummary(report: TestRunReport): void {
  const { summary, duration, startTime, endTime } = report;

  // Header
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${colors.bright}${colors.cyan}  Test Run Summary${colors.reset}`);
  console.log(`${'='.repeat(70)}\n`);

  // Timestamps
  console.log(`${colors.dim}Started:${colors.reset}  ${new Date(startTime).toLocaleString()}`);
  console.log(`${colors.dim}Finished:${colors.reset} ${new Date(endTime).toLocaleString()}`);
  console.log(`${colors.dim}Duration:${colors.reset} ${(duration / 1000).toFixed(2)}s\n`);

  // Results
  const passedColor = summary.passed > 0 ? colors.green : colors.dim;
  const failedColor = summary.failed > 0 ? colors.red : colors.dim;
  const skippedColor = summary.skipped > 0 ? colors.yellow : colors.dim;

  console.log(`${colors.bright}Results:${colors.reset}`);
  console.log(`  ${passedColor}✓ Passed:${colors.reset}  ${summary.passed}/${summary.total}`);
  console.log(`  ${failedColor}✗ Failed:${colors.reset}  ${summary.failed}/${summary.total}`);
  console.log(`  ${skippedColor}○ Skipped:${colors.reset} ${summary.skipped}/${summary.total}\n`);

  // Success rate
  const successRate = summary.successRate;
  const rateColor =
    successRate >= 90 ? colors.green :
      successRate >= 70 ? colors.yellow :
        colors.red;

  console.log(`${colors.bright}Success Rate:${colors.reset} ${rateColor}${successRate.toFixed(2)}%${colors.reset}`);
  console.log(`${colors.bright}Avg Duration:${colors.reset} ${summary.avgDuration.toFixed(0)}ms\n`);

  // Failed tests details
  if (summary.failed > 0) {
    console.log(`${colors.bright}${colors.red}Failed Tests:${colors.reset}\n`);

    report.results
      .filter(r => r.status === 'failed')
      .forEach(result => {
        console.log(`  ${colors.red}✗${colors.reset} ${result.moduleName}`);
        if (result.error) {
          console.log(`    ${colors.dim}${result.error}${colors.reset}`);
        }
        if (result.screenshot) {
          console.log(`    ${colors.dim}Screenshot: ${result.screenshot}${colors.reset}`);
        }
        console.log('');
      });
  }

  // Summary footer
  console.log(`${'='.repeat(70)}\n`);

  // Exit code based on results
  if (summary.failed > 0) {
    console.log(`${colors.red}${colors.bright}Tests failed!${colors.reset}\n`);
  } else {
    console.log(`${colors.green}${colors.bright}All tests passed!${colors.reset}\n`);
  }
}

/**
 * Run a test module
 */
async function runTest(options: CLIOptions): Promise<void> {
  const target = options.args[0];

  if (!target) {
    console.error(`${colors.red}Error: Module or suite name required${colors.reset}`);
    console.log(`Usage: npm run bot test <module|suite>`);
    process.exit(1);
  }

  const config = getConfig(options);
  const filter = getFilter(options);

  console.log(`\n${colors.bright}${colors.cyan}🤖 Starting test run...${colors.reset}\n`);
  console.log(`${colors.dim}Target:${colors.reset} ${target}`);
  console.log(`${colors.dim}Preset:${colors.reset} ${options.flags.preset || 'mvp'}`);
  console.log(`${colors.dim}Mode:${colors.reset}   ${config.headless ? 'headless' : 'headed'}\n`);

  const runner = createTestRunner(config, filter);

  try {
    // Register all modules
    runner.registerModules(getAvailableModules());
    runner.registerSuites(getAvailableSuites());

    let report: TestRunReport;

    // Check if target is a suite or module
    const suites = getAvailableSuites();
    const isSuite = suites.some(s => s.id === target);

    if (isSuite) {
      console.log(`${colors.cyan}Running suite:${colors.reset} ${target}\n`);
      report = await runner.runSuite(target);
    } else {
      console.log(`${colors.cyan}Running module:${colors.reset} ${target}\n`);
      report = await runner.runModule(target);
    }

    // Print summary
    printReportSummary(report);

    // Generate reports
    const reportFormats = options.flags.format
      ? [(options.flags.format as string)]
      : ['json', 'markdown', 'console'];

    const reportGen = createReportGenerator({
      outputDir: config.reportDir || './reports',
      formats: reportFormats as any,
      includeScreenshots: true,
      includeLogs: true,
    });

    const reports = await reportGen.generateReports(report);

    console.log(`${colors.bright}Reports generated:${colors.reset}`);
    reports.forEach(r => {
      if (r.success && r.path) {
        console.log(`  ${colors.green}✓${colors.reset} ${r.format}: ${r.path}`);
      }
    });
    console.log('');

    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}Test execution failed:${colors.reset}`, error);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

/**
 * Run all tests
 */
async function runAll(options: CLIOptions): Promise<void> {
  const config = getConfig(options);
  const filter = getFilter(options);

  console.log(`\n${colors.bright}${colors.cyan}🤖 Running all tests...${colors.reset}\n`);

  const runner = createTestRunner(config, filter);

  try {
    // Register all modules
    runner.registerModules(getAvailableModules());

    const report = await runner.runAll(filter);

    // Print summary
    printReportSummary(report);

    // Generate reports
    const reportGen = createReportGenerator({
      outputDir: config.reportDir || './reports',
      formats: ['json', 'markdown', 'html'],
      includeScreenshots: true,
      includeLogs: true,
    });

    await reportGen.generateReports(report);

    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}Test execution failed:${colors.reset}`, error);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

/**
 * Start monitoring mode
 */
async function startMonitoring(options: CLIOptions): Promise<void> {
  const suite = options.args[0];

  if (!suite) {
    console.error(`${colors.red}Error: Suite name required${colors.reset}`);
    console.log(`Usage: npm run bot monitor <suite> [--interval=60]`);
    process.exit(1);
  }

  const config = getConfig(options);
  const interval = parseInt(options.flags.interval as string || '60');

  console.log(`\n${colors.bright}${colors.cyan}🤖 Starting monitoring mode...${colors.reset}\n`);
  console.log(`${colors.dim}Suite:${colors.reset}    ${suite}`);
  console.log(`${colors.dim}Interval:${colors.reset} ${interval}s\n`);

  const runner = createTestRunner(config);

  try {
    // Register all modules and suites
    runner.registerModules(getAvailableModules());
    runner.registerSuites(getAvailableSuites());

    // Start monitoring
    await runner.startMonitoring(suite, interval);

    // Keep process alive
    console.log(`${colors.green}Monitoring started. Press Ctrl+C to stop.${colors.reset}\n`);

    // Handle shutdown gracefully
    process.on('SIGINT', async () => {
      console.log(`\n\n${colors.yellow}Stopping monitoring...${colors.reset}`);
      runner.stopMonitoring();
      await runner.cleanup();
      process.exit(0);
    });

    // Keep process running
    await new Promise(() => { }); // Never resolves
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}Monitoring failed:${colors.reset}`, error);
    process.exit(1);
  }
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const options = parseArgs();

  // Handle commands
  switch (options.command) {
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;

    case 'info':
      printInfo();
      break;

    case 'list':
      if (options.args[0] === 'suites') {
        listSuites();
      } else {
        listModules();
      }
      break;

    case 'test':
      await runTest(options);
      break;

    case 'test:all':
      await runAll(options);
      break;

    case 'test:health':
      options.args = ['health'];
      await runTest(options);
      break;

    case 'test:critical':
      options.args = ['critical'];
      await runTest(options);
      break;

    case 'monitor':
      await startMonitoring(options);
      break;

    case 'report':
      console.log(`${colors.yellow}Report viewing not yet implemented${colors.reset}`);
      console.log('Reports are generated in the output directory after each run.');
      break;

    default:
      console.error(`${colors.red}Unknown command: ${options.command}${colors.reset}`);
      console.log(`Run '${colors.cyan}npm run bot help${colors.reset}' for usage information.`);
      process.exit(1);
  }
}

// Run CLI if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}${colors.bright}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

export { getAvailableModules, getAvailableSuites, getConfig, getFilter, main, parseArgs };
