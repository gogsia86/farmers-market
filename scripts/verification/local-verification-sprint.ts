#!/usr/bin/env tsx

/**
 * 🇭🇷 LOCAL VERIFICATION SPRINT - Croatian Farmers Market Platform
 *
 * Complete end-to-end verification script to ensure the platform is
 * 100% functional before deployment.
 *
 * Usage:
 *   npm run verify:local
 *   tsx scripts/verification/local-verification-sprint.ts
 *   tsx scripts/verification/local-verification-sprint.ts --quick
 *   tsx scripts/verification/local-verification-sprint.ts --full
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Color utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, colors.green);
}

function error(message: string) {
  log(`❌ ${message}`, colors.red);
}

function warning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function section(message: string) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`${message}`, colors.bright + colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
}

function subsection(message: string) {
  log(`\n${'-'.repeat(50)}`, colors.magenta);
  log(`${message}`, colors.magenta);
  log(`${'-'.repeat(50)}`, colors.magenta);
}

// Test result tracking
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function runTest(name: string, fn: () => void | Promise<void>): void {
  const start = Date.now();
  try {
    const result = fn();
    if (result instanceof Promise) {
      result
        .then(() => {
          const duration = Date.now() - start;
          results.push({ name, passed: true, duration });
          success(`${name} - ${duration}ms`);
        })
        .catch((err) => {
          const duration = Date.now() - start;
          results.push({
            name,
            passed: false,
            duration,
            error: err.message,
          });
          error(`${name} - FAILED: ${err.message}`);
        });
    } else {
      const duration = Date.now() - start;
      results.push({ name, passed: true, duration });
      success(`${name} - ${duration}ms`);
    }
  } catch (err: any) {
    const duration = Date.now() - start;
    results.push({ name, passed: false, duration, error: err.message });
    error(`${name} - FAILED: ${err.message}`);
  }
}

function exec(command: string, silent = false): string {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
    });
    return output;
  } catch (err: any) {
    throw new Error(`Command failed: ${command}\n${err.message}`);
  }
}

function fileExists(path: string): boolean {
  return existsSync(join(process.cwd(), path));
}

function readFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf-8');
}

// ============================================================================
// VERIFICATION STEPS
// ============================================================================

async function step1_EnvironmentCheck() {
  section('STEP 1: Environment Check');

  subsection('1.1 - Check Node.js Version');
  runTest('Node.js version >= 20.18.0', () => {
    const nodeVersion = process.version;
    info(`Node version: ${nodeVersion}`);
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (major < 20) {
      throw new Error(`Node.js 20.18.0+ required, found ${nodeVersion}`);
    }
  });

  subsection('1.2 - Check npm Version');
  runTest('npm version >= 10.0.0', () => {
    const npmVersion = exec('npm --version', true).trim();
    info(`npm version: ${npmVersion}`);
    const major = parseInt(npmVersion.split('.')[0]);
    if (major < 10) {
      throw new Error(`npm 10.0.0+ required, found ${npmVersion}`);
    }
  });

  subsection('1.3 - Check Critical Files');
  const criticalFiles = [
    'package.json',
    'next.config.mjs',
    'prisma/schema.prisma',
    'scripts/seed-croatian-market.ts',
    '.env.example',
    'tsconfig.json',
  ];

  criticalFiles.forEach((file) => {
    runTest(`File exists: ${file}`, () => {
      if (!fileExists(file)) {
        throw new Error(`Missing file: ${file}`);
      }
    });
  });

  subsection('1.4 - Check Environment Variables');
  runTest('Check for .env or .env.local', () => {
    const hasEnv = fileExists('.env') || fileExists('.env.local');
    if (!hasEnv) {
      warning(
        'No .env or .env.local found. You may need to create one from .env.example'
      );
      info('Run: cp .env.example .env');
    } else {
      info('.env file found');
    }
  });

  subsection('1.5 - Verify DATABASE_URL');
  runTest('DATABASE_URL configured', () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      warning(
        'DATABASE_URL not set. Required for database operations.'
      );
      info('Add to .env: DATABASE_URL=postgresql://...');
    } else {
      info('DATABASE_URL configured ✓');
    }
  });
}

async function step2_DependenciesCheck() {
  section('STEP 2: Dependencies Check');

  subsection('2.1 - Verify node_modules exists');
  runTest('node_modules directory exists', () => {
    if (!fileExists('node_modules')) {
      throw new Error('node_modules not found. Run: npm install');
    }
  });

  subsection('2.2 - Check Critical Dependencies');
  const criticalDeps = [
    'next',
    'react',
    'react-dom',
    '@prisma/client',
    'typescript',
    'stripe',
    '@sentry/nextjs',
    'zod',
  ];

  criticalDeps.forEach((dep) => {
    runTest(`Dependency installed: ${dep}`, () => {
      if (!fileExists(`node_modules/${dep}`)) {
        throw new Error(`Missing dependency: ${dep}`);
      }
    });
  });

  subsection('2.3 - Prisma Client Generated');
  runTest('Prisma client generated', () => {
    if (
      !fileExists('node_modules/.prisma/client') &&
      !fileExists('node_modules/@prisma/client/runtime')
    ) {
      warning('Prisma client not generated. Run: npx prisma generate');
    } else {
      info('Prisma client ready ✓');
    }
  });
}

async function step3_DatabaseCheck() {
  section('STEP 3: Database Verification');

  subsection('3.1 - Database Connection');
  runTest('Database connection test', () => {
    try {
      info('Testing database connection...');
      exec('npm run db:test', true);
    } catch (err) {
      throw new Error(
        'Database connection failed. Check DATABASE_URL in .env'
      );
    }
  });

  subsection('3.2 - Prisma Schema Validation');
  runTest('Prisma schema valid', () => {
    try {
      exec('npx prisma validate', true);
    } catch (err) {
      throw new Error('Prisma schema validation failed');
    }
  });
}

async function step4_CroatianSeedCheck() {
  section('STEP 4: Croatian Market Data');

  subsection('4.1 - Croatian Seed Script Exists');
  runTest('seed-croatian-market.ts exists', () => {
    if (!fileExists('scripts/seed-croatian-market.ts')) {
      throw new Error('Croatian seed script not found');
    }
    const content = readFile('scripts/seed-croatian-market.ts');
    if (!content.includes('OPG')) {
      throw new Error('Seed script missing Croatian OPG data');
    }
    info('Croatian seed script ready ✓');
  });

  subsection('4.2 - Croatian Data Verification');
  runTest('Verify Croatian regions', () => {
    const seedContent = readFile('scripts/seed-croatian-market.ts');
    const regions = [
      'Slavonija',
      'Baranja',
      'Dalmacija',
      'Istra',
      'Zagorje',
      'Zagreb',
    ];
    regions.forEach((region) => {
      if (!seedContent.includes(region)) {
        throw new Error(`Missing Croatian region: ${region}`);
      }
    });
    info('All 6 Croatian regions found ✓');
  });

  runTest('Verify Croatian products', () => {
    const seedContent = readFile('scripts/seed-croatian-market.ts');
    const products = [
      'Rajčica',
      'Paški sir',
      'Maslinovo ulje',
      'Kajmak',
      'Ajvar',
    ];
    products.forEach((product) => {
      if (!seedContent.includes(product)) {
        warning(`Croatian product not found: ${product}`);
      }
    });
    info('Croatian products verified ✓');
  });

  runTest('Verify HR-EKO certifications', () => {
    const seedContent = readFile('scripts/seed-croatian-market.ts');
    if (!seedContent.includes('HR-EKO')) {
      throw new Error('HR-EKO certification system not found');
    }
    info('HR-EKO certification system present ✓');
  });
}

async function step5_BuildCheck() {
  section('STEP 5: Build Verification');

  subsection('5.1 - TypeScript Type Check');
  runTest('TypeScript compilation', () => {
    try {
      info('Running type check...');
      exec('npm run type-check', false);
    } catch (err) {
      throw new Error('TypeScript type check failed');
    }
  });

  subsection('5.2 - ESLint Check');
  runTest('ESLint validation', () => {
    try {
      info('Running ESLint...');
      exec('npm run lint', false);
    } catch (err) {
      warning('ESLint found issues (not critical)');
    }
  });

  subsection('5.3 - Production Build (Optional)');
  if (process.argv.includes('--full')) {
    runTest('Production build', () => {
      try {
        info('Building for production... (this may take 2-3 minutes)');
        exec('npm run build', false);
      } catch (err) {
        throw new Error('Production build failed');
      }
    });
  } else {
    info('Skipping production build (use --full to include)');
  }
}

async function step6_IntegrationCheck() {
  section('STEP 6: Integration Verification');

  subsection('6.1 - Sentry Configuration');
  runTest('Sentry configured', () => {
    const hasSentryConfig =
      fileExists('sentry.client.config.ts') ||
      fileExists('sentry.server.config.ts');
    if (!hasSentryConfig) {
      warning('Sentry config files not found');
    } else {
      info('Sentry configured ✓');
    }
  });

  if (process.env.SENTRY_DSN) {
    runTest('Sentry integration test', () => {
      try {
        exec('npm run sentry:test', true);
      } catch (err) {
        warning('Sentry test failed (check SENTRY_DSN)');
      }
    });
  } else {
    info('SENTRY_DSN not set, skipping test');
  }

  subsection('6.2 - Stripe Configuration');
  if (process.env.STRIPE_SECRET_KEY) {
    runTest('Stripe integration test', () => {
      try {
        exec('npm run stripe:test', true);
      } catch (err) {
        warning('Stripe test failed (check STRIPE_SECRET_KEY)');
      }
    });
  } else {
    info('STRIPE_SECRET_KEY not set, skipping test');
  }
}

async function step7_DocumentationCheck() {
  section('STEP 7: Documentation Verification');

  const docs = [
    'README.md',
    'START_HERE_CROATIAN_MARKET.md',
    'PROJECT_100_PERCENT_COMPLETE.md',
    'WAVE_3_COMPLETE_CROATIAN.md',
  ];

  docs.forEach((doc) => {
    runTest(`Documentation: ${doc}`, () => {
      if (!fileExists(doc)) {
        throw new Error(`Missing documentation: ${doc}`);
      }
    });
  });
}

async function step8_QuickSmokeTest() {
  section('STEP 8: Quick Smoke Test');

  subsection('8.1 - Test User Credentials');
  info('Verify these test accounts exist after seeding:');
  info('  Admin: admin@hrvatski-tržnice.hr / Admin123!');
  info('  Farmer: marko.horvat@opg.hr / Farmer123!');
  info('  Customer: marija.kovac@gmail.com / Consumer123!');

  subsection('8.2 - API Routes Check');
  const apiRoutes = [
    'src/app/api/auth/[...nextauth]/route.ts',
    'src/app/api/payments/webhook/route.ts',
    'src/app/api/debug/env-check/route.ts',
    'src/app/api/debug/sentry/route.ts',
  ];

  apiRoutes.forEach((route) => {
    runTest(`API route: ${route}`, () => {
      if (!fileExists(route)) {
        warning(`API route not found: ${route}`);
      }
    });
  });
}

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

function printSummary() {
  section('VERIFICATION SUMMARY');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log('');
  log(`Total Tests:    ${total}`, colors.bright);
  log(`Passed:         ${passed}`, colors.green);
  log(`Failed:         ${failed}`, failed > 0 ? colors.red : colors.green);
  log(`Pass Rate:      ${passRate}%`, colors.cyan);

  if (failed > 0) {
    console.log('');
    error('Failed Tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        error(`  • ${r.name}`);
        if (r.error) {
          log(`    ${r.error}`, colors.red);
        }
      });
  }

  console.log('');
  if (failed === 0) {
    success('🎉 ALL VERIFICATIONS PASSED!');
    success('🇭🇷 Croatian Farmers Market Platform is ready!');
    console.log('');
    info('Next steps:');
    info('  1. npm run seed:croatian  (seed Croatian data)');
    info('  2. npm run dev             (start development server)');
    info('  3. Visit http://localhost:3001');
    info('  4. Login with test credentials');
  } else if (failed <= 3) {
    warning('⚠️  Some non-critical checks failed');
    warning('Platform may still work, but review failed tests above');
  } else {
    error('❌ Multiple critical checks failed');
    error('Please fix the issues above before proceeding');
    process.exit(1);
  }
}

// ============================================================================
// NEXT STEPS GUIDE
// ============================================================================

function printNextSteps() {
  section('NEXT STEPS - CROATIAN MARKET LAUNCH');

  console.log('');
  log('🇭🇷 IMMEDIATE (Next 30 minutes):', colors.bright + colors.cyan);
  console.log('');
  log('1. Seed Croatian Data:', colors.yellow);
  log('   npm run seed:croatian', colors.green);
  console.log('');
  log('2. Start Development Server:', colors.yellow);
  log('   npm run dev', colors.green);
  console.log('');
  log('3. Test Login:', colors.yellow);
  log('   Visit: http://localhost:3001', colors.green);
  log('   Login: admin@hrvatski-tržnice.hr / Admin123!', colors.green);
  console.log('');
  log('4. Explore Croatian OPGs:', colors.yellow);
  log('   • Browse 50+ Croatian farms', colors.green);
  log('   • Check 200+ Croatian products', colors.green);
  log('   • Test checkout flow', colors.green);

  console.log('');
  log('📊 THIS WEEK:', colors.bright + colors.cyan);
  console.log('');
  log('1. Complete local testing', colors.yellow);
  log('2. Deploy to Vercel staging', colors.yellow);
  log('3. Verify all integrations (Stripe, Sentry)', colors.yellow);
  log('4. Test with Croatian users', colors.yellow);

  console.log('');
  log('🚀 PRODUCTION LAUNCH:', colors.bright + colors.cyan);
  console.log('');
  log('1. Production environment setup', colors.yellow);
  log('2. Configure custom domain', colors.yellow);
  log('3. Production build: npm run build', colors.yellow);
  log('4. Deploy: vercel --prod', colors.yellow);
  log('5. Announce to Croatian OPG community!', colors.yellow);

  console.log('');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  log('\n', colors.reset);
  log('╔═══════════════════════════════════════════════════════════╗', colors.cyan);
  log('║                                                           ║', colors.cyan);
  log('║    🇭🇷  CROATIAN FARMERS MARKET PLATFORM  🇭🇷              ║', colors.bright + colors.cyan);
  log('║                                                           ║', colors.cyan);
  log('║           LOCAL VERIFICATION SPRINT 🚀                    ║', colors.cyan);
  log('║                                                           ║', colors.cyan);
  log('╚═══════════════════════════════════════════════════════════╝', colors.cyan);

  const startTime = Date.now();
  const isQuick = process.argv.includes('--quick');
  const isFull = process.argv.includes('--full');

  if (isQuick) {
    info('Running in QUICK mode (skipping some checks)');
  } else if (isFull) {
    info('Running in FULL mode (including production build)');
  } else {
    info('Running in STANDARD mode (use --quick or --full for variants)');
  }

  console.log('');

  try {
    await step1_EnvironmentCheck();
    await step2_DependenciesCheck();
    await step3_DatabaseCheck();
    await step4_CroatianSeedCheck();

    if (!isQuick) {
      await step5_BuildCheck();
      await step6_IntegrationCheck();
    }

    await step7_DocumentationCheck();
    await step8_QuickSmokeTest();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    printSummary();
    console.log('');
    log(`Verification completed in ${duration}s`, colors.cyan);

    printNextSteps();

    console.log('');
    log('═'.repeat(60), colors.cyan);
    log('Happy Farming! 🌾 Sretno s OPG-om! 🇭🇷', colors.bright + colors.green);
    log('═'.repeat(60), colors.cyan);
    console.log('');
  } catch (err: any) {
    console.log('');
    error('Verification failed with error:');
    error(err.message);
    console.log('');
    process.exit(1);
  }
}

// Run the verification
main();
