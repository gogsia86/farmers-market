#!/usr/bin/env tsx
/**
 * 🤖 Unified Bot Framework - CLI Interface
 * Farmers Market Platform
 *
 * Single command-line interface for all bot testing and monitoring operations
 *
 * Usage:
 *   npm run bot -- [command] [options]
 *   npx tsx scripts/bot-cli.ts [command] [options]
 *
 * Commands:
 *   test [suite]      Run test suite (mvp, quick, health, auth, etc.)
 *   monitor           Start continuous monitoring
 *   report            Generate report from last run
 *   list              List available test suites and modules
 *   config            Show current configuration
 *   seed              Seed database with test data
 *   server            Start server and run tests
 *
 * Examples:
 *   npm run bot -- test mvp
 *   npm run bot -- test auth --headless=false
 *   npm run bot -- monitor --interval=60
 *   npm run bot -- list
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

// ============================================================================
// COLORS
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title: string) {
  console.log('\n' + '═'.repeat(70));
  log(title, 'bright');
  console.log('═'.repeat(70) + '\n');
}

function error(message: string) {
  log(`❌ ERROR: ${message}`, 'red');
}

function success(message: string) {
  log(`✅ ${message}`, 'green');
}

function info(message: string) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warn(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

// ============================================================================
// COMMAND DEFINITIONS
// ============================================================================

const COMMANDS = {
  test: {
    description: 'Run test suite',
    usage: 'bot test [suite] [options]',
    examples: [
      'bot test mvp',
      'bot test quick',
      'bot test auth',
      'bot test --modules=auth,cart',
    ],
  },
  monitor: {
    description: 'Start continuous monitoring',
    usage: 'bot monitor [options]',
    examples: [
      'bot monitor',
      'bot monitor --interval=60',
      'bot monitor --threshold=20',
    ],
  },
  report: {
    description: 'Generate report from last run',
    usage: 'bot report [options]',
    examples: ['bot report', 'bot report --format=html'],
  },
  list: {
    description: 'List available test suites and modules',
    usage: 'bot list [type]',
    examples: ['bot list', 'bot list suites', 'bot list modules'],
  },
  config: {
    description: 'Show current configuration',
    usage: 'bot config [preset]',
    examples: ['bot config', 'bot config mvp', 'bot config debug'],
  },
  seed: {
    description: 'Seed database with test data',
    usage: 'bot seed',
    examples: ['bot seed'],
  },
  server: {
    description: 'Start server and run tests',
    usage: 'bot server [suite]',
    examples: ['bot server', 'bot server mvp'],
  },
  help: {
    description: 'Show help information',
    usage: 'bot help [command]',
    examples: ['bot help', 'bot help test'],
  },
};

// ============================================================================
// ARGUMENT PARSING
// ============================================================================

function parseArgs(args: string[]): {
  command: string;
  suite?: string;
  options: Record<string, any>;
} {
  const [command, ...rest] = args;

  const options: Record<string, any> = {};
  let suite: string | undefined;

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];

    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value || true;
    } else if (!suite) {
      suite = arg;
    }
  }

  return { command: command || 'help', suite, options };
}

// ============================================================================
// COMMAND HANDLERS
// ============================================================================

async function handleTest(suite?: string, options: Record<string, any> = {}) {
  header('🧪 RUNNING TEST SUITE');

  // Determine which suite to run
  const suiteName = suite || 'mvp';

  info(`Suite: ${suiteName}`);
  info(`Base URL: ${options.baseUrl || process.env.BASE_URL || 'http://localhost:3001'}`);
  info(`Headless: ${options.headless !== 'false' ? 'Yes' : 'No'}`);

  console.log('');

  // Build environment variables
  const env = {
    ...process.env,
    BASE_URL: options.baseUrl || process.env.BASE_URL || 'http://localhost:3001',
    HEADLESS: options.headless !== 'false' ? 'true' : 'false',
    BOT_MODE: 'suite',
  };

  // Map suite names to script files
  const suiteMap: Record<string, string> = {
    mvp: 'mvp-validation-bot.ts',
    validation: 'mvp-validation-bot.ts',
    automation: 'mvp-automation-bot.ts',
    quick: 'mvp-automation-bot.ts',
    health: 'website-checker-bot.ts',
    checker: 'website-checker-bot.ts',
    monitor: 'website-checker-bot.ts',
  };

  const scriptFile = suiteMap[suiteName.toLowerCase()];

  if (!scriptFile) {
    error(`Unknown suite: ${suiteName}`);
    console.log('\nAvailable suites:');
    Object.keys(suiteMap).forEach(name => {
      console.log(`  - ${name}`);
    });
    process.exit(1);
  }

  const scriptPath = resolve(__dirname, scriptFile);

  if (!existsSync(scriptPath)) {
    error(`Script not found: ${scriptPath}`);
    process.exit(1);
  }

  info(`Running: ${scriptFile}\n`);

  // Execute the test script
  return new Promise<void>((resolve, reject) => {
    const child = spawn('tsx', [scriptPath], {
      stdio: 'inherit',
      env,
      shell: true,
    });

    child.on('error', (err) => {
      error(`Failed to execute: ${err.message}`);
      reject(err);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        success('\nTest suite completed successfully!');
        resolve();
      } else {
        error(`\nTest suite failed with exit code ${code}`);
        process.exit(code || 1);
      }
    });
  });
}

async function handleMonitor(options: Record<string, any> = {}) {
  header('🔄 STARTING CONTINUOUS MONITORING');

  const interval = options.interval || 60;
  const threshold = options.threshold || 20;

  info(`Interval: ${interval} seconds`);
  info(`Alert Threshold: ${threshold}%`);
  info(`Base URL: ${options.baseUrl || process.env.BASE_URL || 'http://localhost:3001'}`);

  console.log('');

  const env = {
    ...process.env,
    BASE_URL: options.baseUrl || process.env.BASE_URL || 'http://localhost:3001',
    BOT_MODE: 'continuous',
    BOT_INTERVAL: String(interval * 1000),
  };

  const scriptPath = resolve(__dirname, 'website-checker-bot.ts');

  return new Promise<void>((resolve, reject) => {
    const child = spawn('tsx', [scriptPath, 'continuous'], {
      stdio: 'inherit',
      env,
      shell: true,
    });

    child.on('error', (err) => {
      error(`Failed to start monitoring: ${err.message}`);
      reject(err);
    });

    child.on('exit', (code) => {
      info('Monitoring stopped');
      if (code !== 0) {
        process.exit(code || 1);
      }
      resolve();
    });
  });
}

async function handleSeed() {
  header('🌱 SEEDING DATABASE');

  const scriptPath = resolve(__dirname, 'seed-for-bot.ts');

  if (!existsSync(scriptPath)) {
    error('Seed script not found');
    process.exit(1);
  }

  return new Promise<void>((resolve, reject) => {
    const child = spawn('tsx', [scriptPath], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('error', (err) => {
      error(`Failed to seed database: ${err.message}`);
      reject(err);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        success('Database seeded successfully!');
        resolve();
      } else {
        error('Seeding failed');
        process.exit(code || 1);
      }
    });
  });
}

async function handleServer(suite?: string) {
  header('🚀 STARTING SERVER AND TESTS');

  const scriptPath = resolve(__dirname, 'start-server-and-bot.ts');

  if (!existsSync(scriptPath)) {
    error('Server startup script not found');
    process.exit(1);
  }

  return new Promise<void>((resolve, reject) => {
    const child = spawn('tsx', [scriptPath], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('error', (err) => {
      error(`Failed to start server: ${err.message}`);
      reject(err);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        success('Server and tests completed!');
        resolve();
      } else {
        error('Server or tests failed');
        process.exit(code || 1);
      }
    });
  });
}

function handleList(type?: string) {
  header('📋 AVAILABLE TEST SUITES AND MODULES');

  if (!type || type === 'suites') {
    console.log(colors.bright + 'Test Suites:' + colors.reset);
    console.log('  mvp, validation    - Complete MVP validation (13 checks)');
    console.log('  automation, quick  - Quick automated tests (10 checks)');
    console.log('  health, checker    - Health checks and monitoring (16 checks)');
    console.log('');
  }

  if (!type || type === 'modules') {
    console.log(colors.bright + 'Test Modules:' + colors.reset);
    console.log('  Authentication:');
    console.log('    - auth-login           Login flow');
    console.log('    - auth-register        Registration flow');
    console.log('    - auth-logout          Logout flow');
    console.log('');
    console.log('  Marketplace:');
    console.log('    - marketplace-browse   Product browsing');
    console.log('    - marketplace-search   Search functionality');
    console.log('    - marketplace-filter   Category filtering');
    console.log('');
    console.log('  Shopping:');
    console.log('    - cart-add             Add to cart');
    console.log('    - cart-update          Update quantities');
    console.log('    - cart-checkout        Checkout flow');
    console.log('');
    console.log('  Farmer:');
    console.log('    - farmer-register      Farmer registration');
    console.log('    - farmer-farm          Farm management');
    console.log('    - farmer-products      Product management');
    console.log('    - farmer-orders        Order dashboard');
    console.log('');
    console.log('  Admin:');
    console.log('    - admin-approval       Farm approval');
    console.log('    - admin-users          User management');
    console.log('    - admin-orders         Order management');
    console.log('');
    console.log('  Health:');
    console.log('    - health-check         System health');
    console.log('    - health-database      Database connection');
    console.log('    - health-api           API endpoints');
    console.log('');
  }

  if (!type || type === 'presets') {
    console.log(colors.bright + 'Configuration Presets:' + colors.reset);
    console.log('  quick      - Fast validation, critical tests only');
    console.log('  mvp        - Complete MVP validation');
    console.log('  monitoring - Continuous health monitoring');
    console.log('  cicd       - CI/CD pipeline optimized');
    console.log('  debug      - Debug mode with videos and traces');
    console.log('');
  }
}

function handleConfig(preset?: string) {
  header('⚙️  CONFIGURATION');

  if (preset) {
    console.log(`Preset: ${colors.bright}${preset}${colors.reset}\n`);
  }

  console.log('Environment Variables:');
  console.log(`  BASE_URL:          ${process.env.BASE_URL || 'http://localhost:3001'}`);
  console.log(`  HEADLESS:          ${process.env.HEADLESS !== 'false' ? 'true' : 'false'}`);
  console.log(`  TEST_USER_PASSWORD: ${process.env.TEST_USER_PASSWORD ? '***' : '(not set)'}`);
  console.log(`  ADMIN_EMAIL:       ${process.env.ADMIN_EMAIL || '(not set)'}`);
  console.log(`  ADMIN_PASSWORD:    ${process.env.ADMIN_PASSWORD ? '***' : '(not set)'}`);
  console.log('');

  console.log('Default Settings:');
  console.log('  Timeout:      60 seconds');
  console.log('  Retries:      2');
  console.log('  Concurrency:  1 (sequential)');
  console.log('  Reports:      ./bot-reports');
  console.log('');

  console.log('Available Presets:');
  console.log('  bot test mvp --preset=quick');
  console.log('  bot test mvp --preset=debug');
  console.log('  bot monitor --preset=monitoring');
  console.log('');
}

function handleHelp(command?: string) {
  if (command && COMMANDS[command as keyof typeof COMMANDS]) {
    const cmd = COMMANDS[command as keyof typeof COMMANDS];
    header(`📚 HELP: ${command.toUpperCase()}`);
    console.log(colors.bright + 'Description:' + colors.reset);
    console.log(`  ${cmd.description}\n`);
    console.log(colors.bright + 'Usage:' + colors.reset);
    console.log(`  ${cmd.usage}\n`);
    console.log(colors.bright + 'Examples:' + colors.reset);
    cmd.examples.forEach(ex => console.log(`  ${ex}`));
    console.log('');
  } else {
    header('🤖 UNIFIED BOT FRAMEWORK - CLI');

    console.log(colors.bright + 'Usage:' + colors.reset);
    console.log('  npm run bot -- [command] [options]');
    console.log('  npx tsx scripts/bot-cli.ts [command] [options]\n');

    console.log(colors.bright + 'Commands:' + colors.reset);
    Object.entries(COMMANDS).forEach(([name, cmd]) => {
      console.log(`  ${colors.cyan}${name.padEnd(12)}${colors.reset} ${cmd.description}`);
    });
    console.log('');

    console.log(colors.bright + 'Global Options:' + colors.reset);
    console.log('  --baseUrl=URL        Base URL to test (default: http://localhost:3001)');
    console.log('  --headless=false     Run browser in visible mode');
    console.log('  --preset=NAME        Use configuration preset (quick, mvp, debug, etc.)');
    console.log('  --modules=a,b,c      Run specific modules only');
    console.log('');

    console.log(colors.bright + 'Quick Start:' + colors.reset);
    console.log('  1. Seed database:    ' + colors.green + 'npm run bot -- seed' + colors.reset);
    console.log('  2. Run tests:        ' + colors.green + 'npm run bot -- test mvp' + colors.reset);
    console.log('  3. Start monitoring: ' + colors.green + 'npm run bot -- monitor' + colors.reset);
    console.log('');

    console.log(colors.bright + 'Examples:' + colors.reset);
    console.log('  npm run bot -- test mvp');
    console.log('  npm run bot -- test quick --headless=false');
    console.log('  npm run bot -- monitor --interval=60');
    console.log('  npm run bot -- server mvp');
    console.log('  npm run bot -- list modules');
    console.log('');

    console.log('For detailed help on a command, use:');
    console.log('  npm run bot -- help [command]');
    console.log('');
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    handleHelp();
    process.exit(0);
  }

  const { command, suite, options } = parseArgs(args);

  try {
    switch (command.toLowerCase()) {
      case 'test':
        await handleTest(suite, options);
        break;

      case 'monitor':
        await handleMonitor(options);
        break;

      case 'seed':
        await handleSeed();
        break;

      case 'server':
        await handleServer(suite);
        break;

      case 'list':
        handleList(suite);
        break;

      case 'config':
        handleConfig(suite);
        break;

      case 'help':
        handleHelp(suite);
        break;

      default:
        error(`Unknown command: ${command}`);
        console.log('\nUse "bot help" to see available commands\n');
        process.exit(1);
    }
  } catch (err) {
    error(`Command failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n🛑 Shutting down...', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Shutting down...', 'yellow');
  process.exit(0);
});

// Run CLI
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
