#!/usr/bin/env tsx

/**
 * 🚀 DEPLOYMENT STATUS DASHBOARD
 *
 * Real-time status check for Croatian Farmers Market Platform deployment
 *
 * Shows:
 * - Local development status
 * - Database state
 * - Build readiness
 * - Vercel deployment status
 * - Production health
 *
 * Usage:
 *   npx tsx scripts/deployment-status.ts
 *   or
 *   npm run deploy:status
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

// ANSI color codes
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
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command: string, silent = true): { stdout: string; success: boolean } {
  try {
    const stdout = execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit',
      timeout: 10000,
    });
    return { stdout: stdout.toString(), success: true };
  } catch (error: any) {
    return { stdout: error.stdout?.toString() || '', success: false };
  }
}

function getStatusIcon(status: 'pass' | 'fail' | 'warn' | 'unknown'): string {
  switch (status) {
    case 'pass': return '✅';
    case 'fail': return '❌';
    case 'warn': return '⚠️';
    case 'unknown': return '❓';
  }
}

function getStatusColor(status: 'pass' | 'fail' | 'warn' | 'unknown'): keyof typeof colors {
  switch (status) {
    case 'pass': return 'green';
    case 'fail': return 'red';
    case 'warn': return 'yellow';
    case 'unknown': return 'dim';
  }
}

interface StatusItem {
  label: string;
  status: 'pass' | 'fail' | 'warn' | 'unknown';
  value?: string;
  details?: string;
}

// Banner
console.clear();
log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🇭🇷  CROATIAN FARMERS MARKET PLATFORM  🇭🇷               ║
║                                                           ║
║            Deployment Status Dashboard                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`, 'cyan');

console.log('');

// Section: Environment
log('━'.repeat(60), 'cyan');
log('  📦 ENVIRONMENT', 'bright');
log('━'.repeat(60), 'cyan');

const envStatus: StatusItem[] = [];

// Node version
const nodeVersion = process.version;
const nodeOk = nodeVersion >= 'v20.0.0';
envStatus.push({
  label: 'Node.js',
  status: nodeOk ? 'pass' : 'warn',
  value: nodeVersion,
  details: nodeOk ? undefined : 'Upgrade to v20+'
});

// npm version
const npmResult = runCommand('npm -v');
envStatus.push({
  label: 'npm',
  status: npmResult.success ? 'pass' : 'fail',
  value: npmResult.stdout.trim()
});

// Project directory
const packageJson = fs.existsSync('package.json');
envStatus.push({
  label: 'Project Root',
  status: packageJson ? 'pass' : 'fail',
  value: packageJson ? '✓ Found' : 'Not found'
});

envStatus.forEach(item => {
  const icon = getStatusIcon(item.status);
  const color = getStatusColor(item.status);
  console.log(`  ${icon} ${item.label.padEnd(20)} ${colors[color]}${item.value || ''}${colors.reset}`);
  if (item.details) {
    console.log(`     ${colors.dim}${item.details}${colors.reset}`);
  }
});

console.log('');

// Section: Database
log('━'.repeat(60), 'cyan');
log('  🗄️  DATABASE STATUS', 'bright');
log('━'.repeat(60), 'cyan');

const dbStatus: StatusItem[] = [];

// Database connection
const dbTest = runCommand('npm run db:test 2>&1');
const dbConnected = dbTest.stdout.includes('success') || dbTest.stdout.includes('Connected');
dbStatus.push({
  label: 'Connection',
  status: dbConnected ? 'pass' : 'warn',
  value: dbConnected ? 'Connected' : 'Not connected',
  details: dbConnected ? undefined : 'Local DB only - production will be separate'
});

// Croatian data
const checkState = runCommand('npx tsx scripts/check-db-state.ts 2>&1');
const farmsMatch = checkState.stdout.match(/Farms:\s+(\d+)/);
const productsMatch = checkState.stdout.match(/Products:\s+(\d+)/);
const usersMatch = checkState.stdout.match(/Users:\s+(\d+)/);

const farmsCount = farmsMatch ? parseInt(farmsMatch[1]) : 0;
const productsCount = productsMatch ? parseInt(productsMatch[1]) : 0;
const usersCount = usersMatch ? parseInt(usersMatch[1]) : 0;

dbStatus.push({
  label: 'Croatian Farms',
  status: farmsCount >= 70 ? 'pass' : farmsCount > 0 ? 'warn' : 'fail',
  value: `${farmsCount} farms`,
  details: farmsCount < 70 ? 'Expected ~78 farms' : undefined
});

dbStatus.push({
  label: 'Products',
  status: productsCount >= 50 ? 'pass' : productsCount > 0 ? 'warn' : 'fail',
  value: `${productsCount} items`,
  details: productsCount < 50 ? 'Expected ~70 products' : undefined
});

dbStatus.push({
  label: 'Users',
  status: usersCount >= 50 ? 'pass' : usersCount > 0 ? 'warn' : 'fail',
  value: `${usersCount} users`,
  details: usersCount < 50 ? 'Expected ~92 users' : undefined
});

// Admin account
const adminExists = checkState.stdout.includes('Croatian admin already exists');
dbStatus.push({
  label: 'Admin Account',
  status: adminExists ? 'pass' : 'warn',
  value: adminExists ? 'admin@hrvatski-tržnice.hr' : 'Not found',
  details: adminExists ? undefined : 'Run: npm run seed:croatian:safe'
});

dbStatus.forEach(item => {
  const icon = getStatusIcon(item.status);
  const color = getStatusColor(item.status);
  console.log(`  ${icon} ${item.label.padEnd(20)} ${colors[color]}${item.value || ''}${colors.reset}`);
  if (item.details) {
    console.log(`     ${colors.dim}${item.details}${colors.reset}`);
  }
});

console.log('');

// Section: Code Quality
log('━'.repeat(60), 'cyan');
log('  🔍 CODE QUALITY', 'bright');
log('━'.repeat(60), 'cyan');

const codeStatus: StatusItem[] = [];

// TypeScript
const typeCheck = runCommand('npm run type-check 2>&1');
const typeOk = typeCheck.success;
codeStatus.push({
  label: 'TypeScript',
  status: typeOk ? 'pass' : 'fail',
  value: typeOk ? 'No errors' : 'Errors found',
  details: typeOk ? undefined : 'Fix type errors before deploying'
});

// ESLint
const lintCheck = runCommand('npm run lint 2>&1');
const lintOk = lintCheck.success;
codeStatus.push({
  label: 'ESLint',
  status: lintOk ? 'pass' : 'warn',
  value: lintOk ? 'No issues' : 'Issues found',
  details: lintOk ? undefined : 'Review lint warnings'
});

// Prisma schema
const prismaValidate = runCommand('npx prisma validate 2>&1');
const prismaOk = prismaValidate.success || prismaValidate.stdout.includes('valid');
codeStatus.push({
  label: 'Prisma Schema',
  status: prismaOk ? 'pass' : 'fail',
  value: prismaOk ? 'Valid' : 'Invalid',
  details: prismaOk ? undefined : 'Check schema.prisma for errors'
});

codeStatus.forEach(item => {
  const icon = getStatusIcon(item.status);
  const color = getStatusColor(item.status);
  console.log(`  ${icon} ${item.label.padEnd(20)} ${colors[color]}${item.value || ''}${colors.reset}`);
  if (item.details) {
    console.log(`     ${colors.dim}${item.details}${colors.reset}`);
  }
});

console.log('');

// Section: Build Status
log('━'.repeat(60), 'cyan');
log('  🏗️  BUILD STATUS', 'bright');
log('━'.repeat(60), 'cyan');

const buildStatus: StatusItem[] = [];

// Check if .next exists
const nextBuild = fs.existsSync('.next');
buildStatus.push({
  label: 'Production Build',
  status: nextBuild ? 'pass' : 'unknown',
  value: nextBuild ? 'Built' : 'Not built',
  details: nextBuild ? 'Build exists (may be outdated)' : 'Run: npm run build'
});

// Prisma Client
const prismaClient = fs.existsSync('node_modules/.prisma/client');
buildStatus.push({
  label: 'Prisma Client',
  status: prismaClient ? 'pass' : 'fail',
  value: prismaClient ? 'Generated' : 'Not generated',
  details: prismaClient ? undefined : 'Run: npx prisma generate'
});

// node_modules
const nodeModules = fs.existsSync('node_modules');
buildStatus.push({
  label: 'Dependencies',
  status: nodeModules ? 'pass' : 'fail',
  value: nodeModules ? 'Installed' : 'Not installed',
  details: nodeModules ? undefined : 'Run: npm install'
});

buildStatus.forEach(item => {
  const icon = getStatusIcon(item.status);
  const color = getStatusColor(item.status);
  console.log(`  ${icon} ${item.label.padEnd(20)} ${colors[color]}${item.value || ''}${colors.reset}`);
  if (item.details) {
    console.log(`     ${colors.dim}${item.details}${colors.reset}`);
  }
});

console.log('');

// Section: Vercel Status
log('━'.repeat(60), 'cyan');
log('  ☁️  VERCEL STATUS', 'bright');
log('━'.repeat(60), 'cyan');

const vercelStatus: StatusItem[] = [];

// Vercel CLI installed
const vercelInstalled = runCommand('vercel --version 2>&1');
vercelStatus.push({
  label: 'Vercel CLI',
  status: vercelInstalled.success ? 'pass' : 'warn',
  value: vercelInstalled.success ? vercelInstalled.stdout.trim() : 'Not installed',
  details: vercelInstalled.success ? undefined : 'Install: npm install -g vercel'
});

// Vercel login
const vercelWhoami = runCommand('vercel whoami 2>&1');
const vercelLoggedIn = vercelWhoami.success && !vercelWhoami.stdout.includes('Error');
vercelStatus.push({
  label: 'Authentication',
  status: vercelLoggedIn ? 'pass' : 'warn',
  value: vercelLoggedIn ? vercelWhoami.stdout.trim() : 'Not logged in',
  details: vercelLoggedIn ? undefined : 'Run: vercel login'
});

// Project linked
const vercelLinked = fs.existsSync('.vercel/project.json');
let projectName = 'Not linked';
if (vercelLinked) {
  try {
    const projectJson = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'));
    projectName = projectJson.name || 'Unknown';
  } catch {}
}
vercelStatus.push({
  label: 'Project',
  status: vercelLinked ? 'pass' : 'warn',
  value: projectName,
  details: vercelLinked ? undefined : 'Run: vercel link'
});

// vercel.json config
const vercelConfig = fs.existsSync('vercel.json');
vercelStatus.push({
  label: 'Configuration',
  status: vercelConfig ? 'pass' : 'warn',
  value: vercelConfig ? 'vercel.json found' : 'Not found',
  details: vercelConfig ? undefined : 'Optional but recommended'
});

vercelStatus.forEach(item => {
  const icon = getStatusIcon(item.status);
  const color = getStatusColor(item.status);
  console.log(`  ${icon} ${item.label.padEnd(20)} ${colors[color]}${item.value || ''}${colors.reset}`);
  if (item.details) {
    console.log(`     ${colors.dim}${item.details}${colors.reset}`);
  }
});

console.log('');

// Section: Git Status
log('━'.repeat(60), 'cyan');
log('  📝 GIT STATUS', 'bright');
log('━'.repeat(60), 'cyan');

const gitStatus: StatusItem[] = [];

// Git initialized
const gitInit = fs.existsSync('.git');
gitStatus.push({
  label: 'Repository',
  status: gitInit ? 'pass' : 'warn',
  value: gitInit ? 'Initialized' : 'Not initialized',
  details: gitInit ? undefined : 'Run: git init'
});

if (gitInit) {
  // Current branch
  const branch = runCommand('git branch --show-current 2>&1');
  gitStatus.push({
    label: 'Branch',
    status: branch.success ? 'pass' : 'unknown',
    value: branch.stdout.trim() || 'Unknown'
  });

  // Uncommitted changes
  const status = runCommand('git status --porcelain 2>&1');
  const hasChanges = status.stdout.trim().length > 0;
  gitStatus.push({
    label: 'Changes',
    status: hasChanges ? 'warn' : 'pass',
    value: hasChanges ? 'Uncommitted changes' : 'Clean',
    details: hasChanges ? 'Commit before deploying' : undefined
  });

  // Remote
  const remote = runCommand('git remote -v 2>&1');
  const hasRemote = remote.stdout.includes('origin');
  gitStatus.push({
    label: 'Remote',
    status: hasRemote ? 'pass' : 'warn',
    value: hasRemote ? 'Connected' : 'Not configured',
    details: hasRemote ? undefined : 'Add remote for GitHub integration'
  });
}

gitStatus.forEach(item => {
  const icon = getStatusIcon(item.status);
  const color = getStatusColor(item.status);
  console.log(`  ${icon} ${item.label.padEnd(20)} ${colors[color]}${item.value || ''}${colors.reset}`);
  if (item.details) {
    console.log(`     ${colors.dim}${item.details}${colors.reset}`);
  }
});

console.log('');

// Summary
log('━'.repeat(60), 'cyan');
log('  📊 SUMMARY', 'bright');
log('━'.repeat(60), 'cyan');

const allStatus = [...envStatus, ...dbStatus, ...codeStatus, ...buildStatus, ...vercelStatus, ...gitStatus];
const passed = allStatus.filter(s => s.status === 'pass').length;
const failed = allStatus.filter(s => s.status === 'fail').length;
const warnings = allStatus.filter(s => s.status === 'warn').length;
const total = allStatus.length;

console.log(`  ${colors.bright}Total Checks:${colors.reset} ${total}`);
console.log(`  ${colors.green}✅ Passed:${colors.reset} ${passed}`);
console.log(`  ${colors.red}❌ Failed:${colors.reset} ${failed}`);
console.log(`  ${colors.yellow}⚠️  Warnings:${colors.reset} ${warnings}`);

console.log('');

// Deployment Readiness
const criticalFails = allStatus.filter(s =>
  s.status === 'fail' &&
  (s.label.includes('TypeScript') ||
   s.label.includes('Connection') ||
   s.label.includes('Prisma'))
);

if (criticalFails.length > 0) {
  log('━'.repeat(60), 'red');
  log('  ❌ NOT READY FOR DEPLOYMENT', 'red');
  log('━'.repeat(60), 'red');
  console.log('');
  console.log(`  ${colors.red}${colors.bright}Critical issues must be fixed:${colors.reset}`);
  criticalFails.forEach(item => {
    console.log(`    • ${item.label}: ${item.value}`);
  });
  console.log('');
} else if (failed > 0) {
  log('━'.repeat(60), 'yellow');
  log('  ⚠️  DEPLOYMENT POSSIBLE WITH WARNINGS', 'yellow');
  log('━'.repeat(60), 'yellow');
  console.log('');
  console.log(`  ${colors.yellow}${colors.bright}Issues found (non-critical):${colors.reset}`);
  allStatus.filter(s => s.status === 'fail').forEach(item => {
    console.log(`    • ${item.label}: ${item.value}`);
  });
  console.log('');
} else if (warnings > 0) {
  log('━'.repeat(60), 'green');
  log('  ✅ READY FOR DEPLOYMENT', 'green');
  log('━'.repeat(60), 'green');
  console.log('');
  console.log(`  ${colors.green}${colors.bright}Your project is ready to deploy!${colors.reset}`);
  if (warnings > 0) {
    console.log(`  ${colors.yellow}${warnings} optional improvements available.${colors.reset}`);
  }
  console.log('');
} else {
  log('━'.repeat(60), 'green');
  log('  🎉 PERFECT - ALL CHECKS PASSED!', 'green');
  log('━'.repeat(60), 'green');
  console.log('');
  console.log(`  ${colors.green}${colors.bright}Your Croatian Farmers Market Platform is in perfect shape!${colors.reset}`);
  console.log('');
}

// Next Steps
log('━'.repeat(60), 'cyan');
log('  🚀 NEXT STEPS', 'bright');
log('━'.repeat(60), 'cyan');

if (criticalFails.length > 0) {
  console.log(`  ${colors.red}1. Fix critical issues listed above${colors.reset}`);
  console.log(`  ${colors.dim}2. Re-run this script: npx tsx scripts/deployment-status.ts${colors.reset}`);
} else if (!vercelLinked) {
  console.log(`  ${colors.cyan}1. Link to Vercel:${colors.reset}        vercel link`);
  console.log(`  ${colors.cyan}2. Set environment vars:${colors.reset}   (in Vercel dashboard)`);
  console.log(`  ${colors.cyan}3. Deploy:${colors.reset}                 vercel --prod`);
  console.log(`  ${colors.cyan}4. Seed database:${colors.reset}          npm run seed:croatian:safe`);
} else {
  console.log(`  ${colors.cyan}1. Deploy to production:${colors.reset}  vercel --prod`);
  console.log(`  ${colors.cyan}2. Or use quick deploy:${colors.reset}   ./scripts/quick-deploy-croatian.sh`);
  console.log(`  ${colors.cyan}3. After deployment:${colors.reset}      npm run seed:croatian:safe`);
}

console.log('');

// Useful Commands
log('━'.repeat(60), 'cyan');
log('  📚 USEFUL COMMANDS', 'bright');
log('━'.repeat(60), 'cyan');

console.log(`  ${colors.dim}# Deploy to Vercel${colors.reset}`);
console.log(`  vercel --prod`);
console.log('');
console.log(`  ${colors.dim}# Check database state${colors.reset}`);
console.log(`  npx tsx scripts/check-db-state.ts`);
console.log('');
console.log(`  ${colors.dim}# List Croatian farms${colors.reset}`);
console.log(`  npx tsx scripts/list-croatian-farms.ts`);
console.log('');
console.log(`  ${colors.dim}# Seed database${colors.reset}`);
console.log(`  npm run seed:croatian:safe`);
console.log('');
console.log(`  ${colors.dim}# View deployment guide${colors.reset}`);
console.log(`  cat DEPLOYMENT_GUIDE_CROATIAN.md`);
console.log('');

log('━'.repeat(60), 'cyan');
console.log('');
