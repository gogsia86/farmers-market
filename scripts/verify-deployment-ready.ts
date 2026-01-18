#!/usr/bin/env tsx

/**
 * 🔍 PRE-DEPLOYMENT VERIFICATION SCRIPT
 *
 * Checks if the Croatian Farmers Market Platform is ready for production deployment.
 *
 * This script verifies:
 * - Build configuration
 * - Database connectivity
 * - Environment variables
 * - Code quality
 * - Croatian data presence
 * - TypeScript compilation
 *
 * Usage:
 *   npm run verify:deployment
 *   or
 *   npx tsx scripts/verify-deployment-ready.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message: string) {
  console.log('\n' + colors.cyan + colors.bold + '━'.repeat(60) + colors.reset);
  console.log(colors.cyan + colors.bold + '  ' + message + colors.reset);
  console.log(colors.cyan + colors.bold + '━'.repeat(60) + colors.reset + '\n');
}

function logCheck(name: string) {
  process.stdout.write(`${colors.blue}▶${colors.reset} ${name}... `);
}

function logResult(result: CheckResult) {
  results.push(result);

  const icon = result.status === 'pass' ? '✅' :
               result.status === 'fail' ? '❌' :
               result.status === 'warn' ? '⚠️' : '⏭️';

  const color = result.status === 'pass' ? 'green' :
                result.status === 'fail' ? 'red' :
                result.status === 'warn' ? 'yellow' : 'cyan';

  console.log(`${colors[color]}${icon} ${result.message}${colors.reset}`);

  if (result.details) {
    console.log(`  ${colors.cyan}${result.details}${colors.reset}`);
  }
}

function runCommand(command: string, silent = true): { stdout: string; success: boolean } {
  try {
    const stdout = execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { stdout: stdout.toString(), success: true };
  } catch (error: any) {
    return { stdout: error.stdout?.toString() || '', success: false };
  }
}

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function readJsonFile(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Banner
console.clear();
log(colors.cyan + colors.bold + `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🇭🇷  CROATIAN FARMERS MARKET PLATFORM  🇭🇷               ║
║                                                           ║
║        Pre-Deployment Verification Script                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
` + colors.reset);

// Check 1: Project Structure
logHeader('1. Project Structure Verification');

logCheck('package.json exists');
if (fileExists('package.json')) {
  const pkg = readJsonFile('package.json');
  logResult({
    name: 'package.json',
    status: 'pass',
    message: 'Found',
    details: `Project: ${pkg?.name || 'Unknown'} v${pkg?.version || '0.0.0'}`
  });
} else {
  logResult({
    name: 'package.json',
    status: 'fail',
    message: 'Not found',
    details: 'Run this script from project root'
  });
  process.exit(1);
}

logCheck('vercel.json configuration');
if (fileExists('vercel.json')) {
  const vercelConfig = readJsonFile('vercel.json');
  const hasFramework = vercelConfig?.framework === 'nextjs';
  const hasBuildCommand = vercelConfig?.buildCommand;

  logResult({
    name: 'vercel.json',
    status: hasFramework && hasBuildCommand ? 'pass' : 'warn',
    message: hasFramework && hasBuildCommand ? 'Valid configuration' : 'Missing some configs',
    details: `Framework: ${vercelConfig?.framework || 'not set'}`
  });
} else {
  logResult({
    name: 'vercel.json',
    status: 'warn',
    message: 'Not found (optional but recommended)'
  });
}

logCheck('Prisma schema');
if (fileExists('prisma/schema.prisma')) {
  logResult({
    name: 'Prisma schema',
    status: 'pass',
    message: 'Found at prisma/schema.prisma'
  });
} else {
  logResult({
    name: 'Prisma schema',
    status: 'fail',
    message: 'Not found',
    details: 'Database schema is required'
  });
}

logCheck('Croatian seed scripts');
const seedScripts = [
  'scripts/seed-croatian-safe.ts',
  'scripts/seed-croatian-market.ts',
  'scripts/check-db-state.ts'
];
const foundSeeds = seedScripts.filter(fileExists);

logResult({
  name: 'Seed scripts',
  status: foundSeeds.length > 0 ? 'pass' : 'warn',
  message: `Found ${foundSeeds.length}/${seedScripts.length} seed scripts`,
  details: foundSeeds.length > 0 ? `Available: ${foundSeeds.map(s => path.basename(s)).join(', ')}` : undefined
});

// Check 2: Dependencies
logHeader('2. Dependencies Check');

logCheck('node_modules installed');
if (fileExists('node_modules')) {
  logResult({
    name: 'Dependencies',
    status: 'pass',
    message: 'node_modules exists'
  });
} else {
  logResult({
    name: 'Dependencies',
    status: 'fail',
    message: 'node_modules not found',
    details: 'Run: npm install'
  });
}

logCheck('Prisma Client generated');
if (fileExists('node_modules/.prisma/client')) {
  logResult({
    name: 'Prisma Client',
    status: 'pass',
    message: 'Generated'
  });
} else {
  logResult({
    name: 'Prisma Client',
    status: 'warn',
    message: 'Not generated',
    details: 'Run: npx prisma generate'
  });
}

// Check 3: Environment Variables
logHeader('3. Environment Variables');

logCheck('Environment files');
const envFiles = ['.env', '.env.local', '.env.example'];
const foundEnvFiles = envFiles.filter(fileExists);

logResult({
  name: 'Environment files',
  status: foundEnvFiles.includes('.env') || foundEnvFiles.includes('.env.local') ? 'pass' : 'warn',
  message: `Found: ${foundEnvFiles.join(', ') || 'none'}`,
  details: !foundEnvFiles.includes('.env') ? 'Create .env file with required variables' : undefined
});

logCheck('DATABASE_URL configured');
const hasDbUrl = process.env.DATABASE_URL ||
                 (fileExists('.env') && fs.readFileSync('.env', 'utf8').includes('DATABASE_URL')) ||
                 (fileExists('.env.local') && fs.readFileSync('.env.local', 'utf8').includes('DATABASE_URL'));

logResult({
  name: 'DATABASE_URL',
  status: hasDbUrl ? 'pass' : 'warn',
  message: hasDbUrl ? 'Configured locally' : 'Not found locally',
  details: hasDbUrl ? 'Must also be set in Vercel dashboard' : 'Required for production deployment'
});

// Check 4: TypeScript Compilation
logHeader('4. TypeScript & Code Quality');

logCheck('TypeScript compilation');
const typeCheckResult = runCommand('npm run type-check', true);
logResult({
  name: 'TypeScript',
  status: typeCheckResult.success ? 'pass' : 'fail',
  message: typeCheckResult.success ? 'No type errors' : 'Type errors found',
  details: typeCheckResult.success ? undefined : 'Fix type errors before deploying'
});

logCheck('ESLint check');
const lintResult = runCommand('npm run lint', true);
logResult({
  name: 'ESLint',
  status: lintResult.success ? 'pass' : 'warn',
  message: lintResult.success ? 'No lint errors' : 'Lint issues found',
  details: lintResult.success ? undefined : 'Review and fix lint issues'
});

// Check 5: Build Test
logHeader('5. Production Build Test');

logCheck('Next.js production build');
log('\n  ' + colors.yellow + 'This may take a few minutes...' + colors.reset);

const buildResult = runCommand('npm run build', false);
logResult({
  name: 'Production build',
  status: buildResult.success ? 'pass' : 'fail',
  message: buildResult.success ? 'Build successful' : 'Build failed',
  details: buildResult.success ? 'Ready for deployment' : 'Fix build errors before deploying'
});

// Check 6: Database State
logHeader('6. Database State (Local)');

logCheck('Database connection');
const dbTestResult = runCommand('npm run db:test', true);
logResult({
  name: 'Database connection',
  status: dbTestResult.success ? 'pass' : 'warn',
  message: dbTestResult.success ? 'Connected' : 'Connection issue',
  details: dbTestResult.success ? undefined : 'Local DB issue (production DB will be separate)'
});

logCheck('Croatian data presence');
const checkStateResult = runCommand('npx tsx scripts/check-db-state.ts', true);
const croatianFarmsMatch = checkStateResult.stdout.match(/Found (\d+) Croatian farms/);
const croatianFarmsCount = croatianFarmsMatch ? parseInt(croatianFarmsMatch[1]) : 0;

logResult({
  name: 'Croatian data',
  status: croatianFarmsCount > 0 ? 'pass' : 'warn',
  message: croatianFarmsCount > 0 ? `Found ${croatianFarmsCount} Croatian farms locally` : 'No Croatian farms found',
  details: croatianFarmsCount > 0 ? 'Production DB will need seeding after deployment' : 'Run: npm run seed:croatian:safe'
});

// Check 7: Git Status
logHeader('7. Git Repository Status');

logCheck('Git repository');
const gitStatus = runCommand('git status', true);
logResult({
  name: 'Git repository',
  status: gitStatus.success ? 'pass' : 'warn',
  message: gitStatus.success ? 'Repository initialized' : 'Not a git repository',
  details: gitStatus.success ? undefined : 'Initialize with: git init'
});

if (gitStatus.success) {
  logCheck('Uncommitted changes');
  const hasChanges = gitStatus.stdout.includes('Changes not staged') ||
                     gitStatus.stdout.includes('Untracked files');

  logResult({
    name: 'Git status',
    status: hasChanges ? 'warn' : 'pass',
    message: hasChanges ? 'Uncommitted changes found' : 'Working tree clean',
    details: hasChanges ? 'Commit changes before deploying' : undefined
  });

  logCheck('Remote repository');
  const remoteResult = runCommand('git remote -v', true);
  const hasRemote = remoteResult.stdout.includes('origin');

  logResult({
    name: 'Git remote',
    status: hasRemote ? 'pass' : 'warn',
    message: hasRemote ? 'Connected to remote' : 'No remote configured',
    details: hasRemote ? remoteResult.stdout.split('\n')[0] : 'Add remote: git remote add origin <url>'
  });
}

// Final Summary
logHeader('📊 Verification Summary');

const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail').length;
const warnings = results.filter(r => r.status === 'warn').length;
const total = results.length;

console.log(`${colors.bold}Total Checks: ${total}${colors.reset}`);
console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Warnings: ${warnings}${colors.reset}`);

const criticalFailures = results.filter(r =>
  r.status === 'fail' &&
  (r.name.includes('TypeScript') ||
   r.name.includes('Production build') ||
   r.name.includes('package.json'))
);

console.log('\n' + colors.cyan + colors.bold + '━'.repeat(60) + colors.reset);

if (criticalFailures.length > 0) {
  log('\n❌ DEPLOYMENT BLOCKED - Critical Issues Found\n', 'red');

  console.log(colors.red + colors.bold + 'Critical issues that must be fixed:' + colors.reset);
  criticalFailures.forEach(failure => {
    console.log(`  • ${failure.name}: ${failure.message}`);
    if (failure.details) {
      console.log(`    ${colors.cyan}${failure.details}${colors.reset}`);
    }
  });

  console.log('\n' + colors.yellow + 'Fix these issues before deploying to production.' + colors.reset);
  process.exit(1);

} else if (failed > 0) {
  log('\n⚠️  DEPLOYMENT POSSIBLE BUT NOT RECOMMENDED\n', 'yellow');

  const failures = results.filter(r => r.status === 'fail');
  console.log(colors.yellow + 'Non-critical issues found:' + colors.reset);
  failures.forEach(failure => {
    console.log(`  • ${failure.name}: ${failure.message}`);
  });

  console.log('\n' + colors.cyan + 'Recommendation: Fix issues before deploying.' + colors.reset);
  process.exit(0);

} else if (warnings > 0) {
  log('\n✅ DEPLOYMENT READY WITH MINOR WARNINGS\n', 'green');

  const warningItems = results.filter(r => r.status === 'warn');
  console.log(colors.yellow + 'Optional improvements:' + colors.reset);
  warningItems.forEach(warning => {
    console.log(`  • ${warning.name}: ${warning.message}`);
  });

  console.log('\n' + colors.green + colors.bold + '🚀 Ready to deploy to Vercel!' + colors.reset);
  console.log('\n' + colors.cyan + 'Next steps:' + colors.reset);
  console.log('  1. Run: ./scripts/quick-deploy-croatian.sh');
  console.log('  2. Or manually: vercel --prod');
  console.log('  3. After deployment: npm run seed:croatian:safe');

} else {
  log('\n✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT!\n', 'green');

  console.log(colors.green + colors.bold + '🎉 Your Croatian Farmers Market Platform is ready!' + colors.reset);
  console.log('\n' + colors.cyan + 'Deployment options:' + colors.reset);
  console.log('  • Quick deploy:  ./scripts/quick-deploy-croatian.sh');
  console.log('  • Manual deploy: vercel --prod');
  console.log('  • Via Git:       git push origin main (if GitHub integration enabled)');
  console.log('\n' + colors.cyan + 'After deployment:' + colors.reset);
  console.log('  1. Seed production database: npm run seed:croatian:safe');
  console.log('  2. Verify deployment: npm run verify:production');
  console.log('  3. Test admin login: admin@hrvatski-tržnice.hr / Admin123!');
}

console.log('\n' + colors.cyan + colors.bold + '━'.repeat(60) + colors.reset + '\n');
