#!/usr/bin/env node

/**
 * Fix Package Lock Version Issues
 *
 * This script fixes empty/invalid version strings in package-lock.json
 * that cause "Invalid Version" errors during npm install on Vercel.
 *
 * Usage: node scripts/fix-lockfile-versions.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(70), 'cyan');
  log(`  ${message}`, 'cyan');
  log('='.repeat(70), 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

// Paths
const rootDir = path.resolve(__dirname, '..');
const packageLockPath = path.join(rootDir, 'package-lock.json');
const backupPath = path.join(rootDir, 'package-lock.json.backup-' + Date.now());

/**
 * Create backup of package-lock.json
 */
function createBackup() {
  logHeader('Creating Backup');

  if (!fs.existsSync(packageLockPath)) {
    logError('package-lock.json not found!');
    return false;
  }

  try {
    fs.copyFileSync(packageLockPath, backupPath);
    logSuccess(`Backup created: ${path.basename(backupPath)}`);
    return true;
  } catch (error) {
    logError(`Failed to create backup: ${error.message}`);
    return false;
  }
}

/**
 * Scan for empty versions in package-lock.json
 */
function scanForIssues() {
  logHeader('Scanning for Issues');

  let packageLock;
  try {
    const content = fs.readFileSync(packageLockPath, 'utf-8');
    packageLock = JSON.parse(content);
  } catch (error) {
    logError(`Failed to read package-lock.json: ${error.message}`);
    return null;
  }

  const issues = [];

  // Check packages section
  if (packageLock.packages) {
    for (const [pkgPath, info] of Object.entries(packageLock.packages)) {
      if (info.version === '' || info.version === undefined || info.version === null) {
        issues.push({
          path: pkgPath,
          section: 'packages',
          currentVersion: info.version
        });
      }
    }
  }

  // Check dependencies section (legacy)
  if (packageLock.dependencies) {
    for (const [name, info] of Object.entries(packageLock.dependencies)) {
      if (info.version === '' || info.version === undefined || info.version === null) {
        issues.push({
          path: name,
          section: 'dependencies',
          currentVersion: info.version
        });
      }
    }
  }

  if (issues.length > 0) {
    logWarning(`Found ${issues.length} packages with empty/invalid versions:`);
    issues.forEach((issue, index) => {
      log(`  ${index + 1}. ${issue.path} (${issue.section})`, 'yellow');
    });
  } else {
    logSuccess('No issues found in package-lock.json');
  }

  return { packageLock, issues };
}

/**
 * Check if npm is available
 */
function checkNpm() {
  try {
    const version = execSync('npm --version', { encoding: 'utf-8' }).trim();
    logSuccess(`npm version: ${version}`);
    return true;
  } catch (error) {
    logError('npm is not available in PATH');
    return false;
  }
}

/**
 * Regenerate package-lock.json
 */
function regenerateLockfile() {
  logHeader('Regenerating package-lock.json');

  const steps = [
    {
      name: 'Remove node_modules',
      command: process.platform === 'win32'
        ? 'if exist node_modules rmdir /s /q node_modules'
        : 'rm -rf node_modules',
      critical: false
    },
    {
      name: 'Remove package-lock.json',
      command: process.platform === 'win32'
        ? 'if exist package-lock.json del /f package-lock.json'
        : 'rm -f package-lock.json',
      critical: true
    },
    {
      name: 'Clear npm cache',
      command: 'npm cache clean --force',
      critical: false
    },
    {
      name: 'Install dependencies',
      command: 'npm install --legacy-peer-deps --prefer-offline=false',
      critical: true,
      timeout: 300000 // 5 minutes
    }
  ];

  for (const step of steps) {
    logInfo(`Running: ${step.name}...`);

    try {
      const options = {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf-8'
      };

      if (step.timeout) {
        options.timeout = step.timeout;
      }

      const output = execSync(step.command, options);

      if (output && output.trim()) {
        log(output.trim(), 'blue');
      }

      logSuccess(`${step.name} completed`);
    } catch (error) {
      if (step.critical) {
        logError(`${step.name} failed: ${error.message}`);
        return false;
      } else {
        logWarning(`${step.name} failed (non-critical): ${error.message}`);
      }
    }
  }

  return true;
}

/**
 * Verify the fix
 */
function verifyFix() {
  logHeader('Verifying Fix');

  // Re-scan for issues
  const result = scanForIssues();

  if (!result) {
    logError('Failed to verify - could not read package-lock.json');
    return false;
  }

  if (result.issues.length === 0) {
    logSuccess('All version issues resolved!');
    return true;
  } else {
    logError(`Still ${result.issues.length} issues remaining`);
    return false;
  }
}

/**
 * Test npm install
 */
function testInstall() {
  logHeader('Testing npm install');

  try {
    logInfo('Running: npm install --legacy-peer-deps --dry-run');

    execSync('npm install --legacy-peer-deps --dry-run', {
      cwd: rootDir,
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 60000
    });

    logSuccess('npm install dry-run passed!');
    return true;
  } catch (error) {
    logError('npm install dry-run failed');
    log(error.message, 'red');
    return false;
  }
}

/**
 * Print summary and next steps
 */
function printSummary(success) {
  logHeader('Summary');

  if (success) {
    log('\n🎉 Package lockfile successfully fixed!', 'green');
    log('\n📝 Next steps:', 'cyan');
    log('  1. Test the build locally:', 'blue');
    log('     npm run build', 'blue');
    log('\n  2. Commit the fixed lockfile:', 'blue');
    log('     git add package-lock.json', 'blue');
    log('     git commit -m "fix: regenerate package-lock.json - resolve empty versions"', 'blue');
    log('\n  3. Push to trigger Vercel deployment:', 'blue');
    log('     git push origin main', 'blue');
    log('\n  4. Monitor Vercel build logs for success', 'blue');
    log(`\n💾 Backup saved at: ${path.basename(backupPath)}`, 'cyan');
  } else {
    log('\n❌ Failed to fix package lockfile', 'red');
    log('\n🔧 Manual recovery steps:', 'cyan');
    log('  1. Restore backup:', 'blue');
    log(`     cp ${path.basename(backupPath)} package-lock.json`, 'blue');
    log('\n  2. Try manual regeneration:', 'blue');
    log('     rm -rf node_modules package-lock.json', 'blue');
    log('     npm cache clean --force', 'blue');
    log('     npm install --legacy-peer-deps', 'blue');
    log('\n  3. If still failing, check:', 'blue');
    log('     - Internet connection', 'blue');
    log('     - npm registry access', 'blue');
    log('     - package.json syntax', 'blue');
  }

  log(''); // Empty line
}

/**
 * Main execution
 */
function main() {
  log('\n🔧 Package Lock Version Fixer', 'cyan');
  log('Fixing empty/invalid version strings that cause Vercel build failures\n', 'cyan');

  // Pre-flight checks
  if (!checkNpm()) {
    process.exit(1);
  }

  // Scan for issues first
  const initialScan = scanForIssues();
  if (!initialScan) {
    process.exit(1);
  }

  if (initialScan.issues.length === 0) {
    logSuccess('No issues found - package-lock.json is already valid!');
    log('\n✅ Ready to deploy to Vercel', 'green');
    process.exit(0);
  }

  // Confirm with user
  log('\n⚠️  This will regenerate package-lock.json', 'yellow');
  log('   This may take 2-5 minutes depending on your connection', 'yellow');

  // Create backup
  if (!createBackup()) {
    process.exit(1);
  }

  // Regenerate lockfile
  const regenerated = regenerateLockfile();

  if (!regenerated) {
    logError('Failed to regenerate lockfile');
    printSummary(false);
    process.exit(1);
  }

  // Verify fix
  const verified = verifyFix();

  if (!verified) {
    logWarning('Verification found remaining issues');
  }

  // Test install
  const testPassed = testInstall();

  // Print summary
  const success = regenerated && verified && testPassed;
  printSummary(success);

  process.exit(success ? 0 : 1);
}

// Handle errors
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  log(error.stack, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at: ${promise}`);
  logError(`Reason: ${reason}`);
  process.exit(1);
});

// Run the script
main();
