#!/usr/bin/env node

/**
 * Resilient Batch NPM Installer
 *
 * Installs dependencies in batches with resumable progress.
 * Perfect for slow or unstable network connections.
 *
 * Features:
 * - Installs in small batches (5-10 packages at a time)
 * - Saves progress after each batch
 * - Can resume from where it left off if interrupted
 * - Retries failed packages automatically
 * - Shows detailed progress
 *
 * Usage:
 *   node scripts/install-resilient.js
 *   node scripts/install-resilient.js --resume  (resume interrupted install)
 *   node scripts/install-resilient.js --batch-size=5  (smaller batches for slower networks)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BATCH_SIZE = parseInt(process.argv.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 10;
const RESUME = process.argv.includes('--resume');
const PROGRESS_FILE = path.join(__dirname, '.install-progress.json');
const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logProgress(current, total, packageName) {
  const percent = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2));
  process.stdout.write(`\r${colors.cyan}[${bar}]${colors.reset} ${percent}% (${current}/${total}) ${packageName}${colors.reset}`);
}

/**
 * Read package.json
 */
function readPackageJson() {
  try {
    const content = fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    log(`✗ Failed to read package.json: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Load or create progress tracker
 */
function loadProgress() {
  if (RESUME && fs.existsSync(PROGRESS_FILE)) {
    try {
      const content = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      const progress = JSON.parse(content);
      log(`\n📦 Resuming from previous session...`, 'cyan');
      log(`   Installed: ${progress.installed.length} packages`, 'green');
      log(`   Failed: ${progress.failed.length} packages`, 'red');
      return progress;
    } catch (error) {
      log(`⚠ Could not read progress file, starting fresh`, 'yellow');
    }
  }

  return {
    installed: [],
    failed: [],
    skipped: [],
    startTime: Date.now()
  };
}

/**
 * Save progress
 */
function saveProgress(progress) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (error) {
    log(`⚠ Failed to save progress: ${error.message}`, 'yellow');
  }
}

/**
 * Install a batch of packages
 */
function installBatch(packages, batchNumber, totalBatches, progress) {
  const packageNames = packages.map(p => p.name);
  const packageSpecs = packages.map(p => `${p.name}@${p.version}`);

  log(`\n\n${'='.repeat(70)}`, 'cyan');
  log(`📦 Batch ${batchNumber}/${totalBatches} (${packages.length} packages)`, 'bright');
  log('='.repeat(70), 'cyan');

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const spec = `${pkg.name}@${pkg.version}`;

    // Skip if already installed
    if (progress.installed.includes(pkg.name)) {
      logProgress(progress.installed.length, progress.totalPackages, `${pkg.name} (cached)`);
      continue;
    }

    try {
      logProgress(progress.installed.length, progress.totalPackages, pkg.name);

      // Install single package
      execSync(`npm install ${spec} --legacy-peer-deps --no-save --silent`, {
        cwd: ROOT_DIR,
        stdio: 'pipe',
        timeout: 120000 // 2 minutes per package
      });

      progress.installed.push(pkg.name);
      saveProgress(progress);

    } catch (error) {
      log(`\n✗ Failed: ${pkg.name}`, 'red');
      progress.failed.push({
        name: pkg.name,
        version: pkg.version,
        error: error.message
      });
      saveProgress(progress);
    }
  }

  process.stdout.write('\n');
}

/**
 * Retry failed packages
 */
function retryFailed(progress) {
  if (progress.failed.length === 0) return;

  log(`\n\n${'='.repeat(70)}`, 'yellow');
  log(`🔄 Retrying ${progress.failed.length} failed packages...`, 'yellow');
  log('='.repeat(70), 'yellow');

  const stillFailed = [];

  for (const pkg of progress.failed) {
    try {
      log(`\n🔄 Retry: ${pkg.name}@${pkg.version}`, 'yellow');

      execSync(`npm install ${pkg.name}@${pkg.version} --legacy-peer-deps --no-save`, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        timeout: 180000 // 3 minutes for retry
      });

      progress.installed.push(pkg.name);
      log(`✓ Success: ${pkg.name}`, 'green');

    } catch (error) {
      log(`✗ Still failing: ${pkg.name}`, 'red');
      stillFailed.push(pkg);
    }
  }

  progress.failed = stillFailed;
  saveProgress(progress);
}

/**
 * Generate lockfile
 */
function generateLockfile() {
  log(`\n\n${'='.repeat(70)}`, 'cyan');
  log(`🔒 Generating package-lock.json...`, 'cyan');
  log('='.repeat(70), 'cyan');

  try {
    execSync('npm install --package-lock-only --legacy-peer-deps', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      timeout: 60000
    });

    log(`\n✓ Lockfile generated successfully`, 'green');
    return true;

  } catch (error) {
    log(`\n✗ Failed to generate lockfile: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Print summary
 */
function printSummary(progress) {
  const duration = Math.round((Date.now() - progress.startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  log(`\n\n${'='.repeat(70)}`, 'bright');
  log(`📊 Installation Summary`, 'bright');
  log('='.repeat(70), 'bright');

  log(`\n✓ Installed: ${progress.installed.length} packages`, 'green');

  if (progress.failed.length > 0) {
    log(`✗ Failed: ${progress.failed.length} packages`, 'red');
    log(`\nFailed packages:`, 'red');
    progress.failed.forEach(pkg => {
      log(`  - ${pkg.name}@${pkg.version}`, 'red');
    });
  }

  if (progress.skipped.length > 0) {
    log(`⊘ Skipped: ${progress.skipped.length} packages`, 'yellow');
  }

  log(`\n⏱  Duration: ${minutes}m ${seconds}s`, 'cyan');

  if (progress.failed.length === 0) {
    log(`\n🎉 All packages installed successfully!`, 'green');
    log(`\n📝 Next steps:`, 'cyan');
    log(`   1. Verify installation: npm ls --depth=0`, 'blue');
    log(`   2. Test build: npm run build`, 'blue');
    log(`   3. Commit lockfile: git add package-lock.json && git commit`, 'blue');
  } else {
    log(`\n⚠️  Some packages failed to install`, 'yellow');
    log(`\n📝 Try these steps:`, 'cyan');
    log(`   1. Check your internet connection`, 'blue');
    log(`   2. Retry: node scripts/install-resilient.js --resume`, 'blue');
    log(`   3. Install failed packages manually:`, 'blue');
    progress.failed.forEach(pkg => {
      log(`      npm install ${pkg.name}@${pkg.version} --legacy-peer-deps`, 'blue');
    });
  }

  log(''); // Empty line
}

/**
 * Main execution
 */
function main() {
  log('\n🚀 Resilient Batch NPM Installer', 'bright');
  log('   Perfect for slow or unstable networks\n', 'cyan');

  // Read package.json
  const packageJson = readPackageJson();
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.optionalDependencies
  };

  // Convert to array
  const packages = Object.entries(allDeps).map(([name, version]) => ({
    name,
    version
  }));

  log(`📦 Total packages: ${packages.length}`, 'cyan');
  log(`📊 Batch size: ${BATCH_SIZE} packages per batch`, 'cyan');
  log(`🔄 Network retries: Enabled`, 'cyan');

  // Load progress
  const progress = loadProgress();
  progress.totalPackages = packages.length;

  // Filter out already installed
  const remaining = packages.filter(p => !progress.installed.includes(p.name));

  if (remaining.length === 0 && progress.failed.length === 0) {
    log(`\n✓ All packages already installed!`, 'green');
    generateLockfile();
    printSummary(progress);
    return;
  }

  log(`📦 Remaining: ${remaining.length} packages\n`, 'yellow');

  // Create batches
  const batches = [];
  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    batches.push(remaining.slice(i, i + BATCH_SIZE));
  }

  // Install batches
  for (let i = 0; i < batches.length; i++) {
    installBatch(batches[i], i + 1, batches.length, progress);
  }

  // Retry failed packages
  if (progress.failed.length > 0) {
    retryFailed(progress);
  }

  // Generate lockfile
  if (progress.failed.length === 0) {
    generateLockfile();
  }

  // Print summary
  printSummary(progress);

  // Clean up progress file if successful
  if (progress.failed.length === 0) {
    try {
      fs.unlinkSync(PROGRESS_FILE);
    } catch (error) {
      // Ignore
    }
  }

  process.exit(progress.failed.length > 0 ? 1 : 0);
}

// Handle interruptions gracefully
process.on('SIGINT', () => {
  log(`\n\n⚠️  Installation interrupted!`, 'yellow');
  log(`\n💾 Progress has been saved.`, 'cyan');
  log(`📝 Resume with: node scripts/install-resilient.js --resume\n`, 'cyan');
  process.exit(1);
});

// Run
main();
