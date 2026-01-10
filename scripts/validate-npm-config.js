#!/usr/bin/env node

/**
 * NPM Configuration Validator
 *
 * Validates package.json, .npmrc, and vercel.json for common issues
 * that cause "Invalid Version" errors on Vercel deployments.
 *
 * Usage: node scripts/validate-npm-config.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${message}`, 'cyan');
  log('='.repeat(60), 'cyan');
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

// Validation state
let errors = 0;
let warnings = 0;

// File paths
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const npmrcPath = path.join(rootDir, '.npmrc');
const vercelJsonPath = path.join(rootDir, 'vercel.json');
const packageLockPath = path.join(rootDir, 'package-lock.json');

/**
 * Validate package.json
 */
function validatePackageJson() {
  logHeader('Validating package.json');

  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json not found!');
    errors++;
    return null;
  }

  let packageJson;
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(content);
    logSuccess('package.json is valid JSON');
  } catch (error) {
    logError(`Failed to parse package.json: ${error.message}`);
    errors++;
    return null;
  }

  // Check for empty version strings
  const checkVersions = (deps, depType) => {
    if (!deps) return;

    for (const [name, version] of Object.entries(deps)) {
      if (!version || version.trim() === '') {
        logError(`Empty version for ${name} in ${depType}`);
        errors++;
      } else if (version === 'undefined' || version === 'null') {
        logError(`Invalid version "${version}" for ${name} in ${depType}`);
        errors++;
      }
    }
  };

  checkVersions(packageJson.dependencies, 'dependencies');
  checkVersions(packageJson.devDependencies, 'devDependencies');
  checkVersions(packageJson.optionalDependencies, 'optionalDependencies');

  // Check engines
  if (packageJson.engines) {
    logSuccess(`Node engine: ${packageJson.engines.node || 'not specified'}`);
    logSuccess(`NPM engine: ${packageJson.engines.npm || 'not specified'}`);

    if (packageJson.engines.node && packageJson.engines.node.includes('>=20')) {
      logSuccess('Node version requirement is compatible with Vercel');
    } else {
      logWarning('Consider pinning Node to >=20.x for stability');
      warnings++;
    }
  } else {
    logWarning('No engines specified in package.json');
    warnings++;
  }

  return packageJson;
}

/**
 * Validate .npmrc
 */
function validateNpmrc() {
  logHeader('Validating .npmrc');

  if (!fs.existsSync(npmrcPath)) {
    logWarning('.npmrc not found (using npm defaults)');
    warnings++;
    return null;
  }

  const content = fs.readFileSync(npmrcPath, 'utf-8');
  logSuccess('.npmrc file exists');

  // Parse .npmrc
  const config = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, value] = trimmed.split('=').map(s => s.trim());
      if (key && value !== undefined) {
        config[key] = value;
      }
    }
  }

  // Check legacy-peer-deps
  if (config['legacy-peer-deps'] !== undefined) {
    log(`  legacy-peer-deps = ${config['legacy-peer-deps']}`, 'blue');

    if (config['legacy-peer-deps'] === 'true') {
      logSuccess('legacy-peer-deps is enabled (recommended for this project)');
    } else if (config['legacy-peer-deps'] === 'false') {
      logWarning('legacy-peer-deps is disabled - may cause peer dependency conflicts');
      warnings++;
    }
  } else {
    logWarning('legacy-peer-deps not specified (defaults to false)');
    warnings++;
  }

  // Check for invalid configs
  const invalidConfigs = ['strict-peer-dependencies'];
  for (const invalid of invalidConfigs) {
    if (config[invalid] !== undefined) {
      logError(`Invalid npm config found: ${invalid}`);
      errors++;
    }
  }

  return config;
}

/**
 * Validate vercel.json
 */
function validateVercelJson() {
  logHeader('Validating vercel.json');

  if (!fs.existsSync(vercelJsonPath)) {
    logWarning('vercel.json not found');
    warnings++;
    return null;
  }

  let vercelJson;
  try {
    const content = fs.readFileSync(vercelJsonPath, 'utf-8');
    vercelJson = JSON.parse(content);
    logSuccess('vercel.json is valid JSON');
  } catch (error) {
    logError(`Failed to parse vercel.json: ${error.message}`);
    errors++;
    return null;
  }

  // Check installCommand
  if (vercelJson.installCommand) {
    log(`  installCommand: ${vercelJson.installCommand}`, 'blue');

    if (vercelJson.installCommand.includes('--legacy-peer-deps')) {
      logSuccess('Install command uses --legacy-peer-deps');
    } else {
      logWarning('Install command does not use --legacy-peer-deps');
      warnings++;
    }

    if (vercelJson.installCommand.includes('npm ci')) {
      logSuccess('Uses npm ci (clean install) - good for CI/CD');
    }
  }

  // Check Node version
  if (vercelJson.build?.env?.NODE_VERSION) {
    const nodeVersion = vercelJson.build.env.NODE_VERSION;
    log(`  NODE_VERSION: ${nodeVersion}`, 'blue');

    if (nodeVersion === '20' || nodeVersion === '20.x') {
      logSuccess('Node version pinned to v20');
    } else if (nodeVersion.includes('24')) {
      logWarning('Using Node 24.x - ensure compatibility');
      warnings++;
    }
  } else {
    logWarning('NODE_VERSION not specified in vercel.json build.env');
    warnings++;
  }

  return vercelJson;
}

/**
 * Cross-validate configurations
 */
function crossValidate(npmrcConfig, vercelJson) {
  logHeader('Cross-Validation');

  if (!npmrcConfig || !vercelJson) {
    logWarning('Skipping cross-validation (missing configs)');
    return;
  }

  // Check for conflicts between .npmrc and vercel.json
  const npmrcLegacyPeerDeps = npmrcConfig['legacy-peer-deps'];
  const vercelUsesLegacyFlag = vercelJson.installCommand?.includes('--legacy-peer-deps');

  if (npmrcLegacyPeerDeps === 'false' && vercelUsesLegacyFlag) {
    logError('CONFLICT: .npmrc disables legacy-peer-deps but vercel.json enables it');
    logError('The .npmrc setting will override the command-line flag!');
    errors++;
  } else if (npmrcLegacyPeerDeps === 'true' && vercelUsesLegacyFlag) {
    logSuccess('.npmrc and vercel.json are aligned (both use legacy-peer-deps)');
  } else if (npmrcLegacyPeerDeps === 'false' && !vercelUsesLegacyFlag) {
    logSuccess('Configurations are consistent (strict peer deps)');
  }
}

/**
 * Validate package-lock.json
 */
function validatePackageLock() {
  logHeader('Validating package-lock.json');

  if (!fs.existsSync(packageLockPath)) {
    logWarning('package-lock.json not found (will be generated on first install)');
    warnings++;
    return;
  }

  let packageLock;
  try {
    const content = fs.readFileSync(packageLockPath, 'utf-8');
    packageLock = JSON.parse(content);
    logSuccess('package-lock.json is valid JSON');
  } catch (error) {
    logError(`Failed to parse package-lock.json: ${error.message}`);
    logError('Lockfile may be corrupted - consider regenerating');
    errors++;
    return;
  }

  // Check lockfile version
  if (packageLock.lockfileVersion) {
    log(`  Lockfile version: ${packageLock.lockfileVersion}`, 'blue');

    if (packageLock.lockfileVersion >= 2) {
      logSuccess('Using modern lockfile format (v2+)');
    } else {
      logWarning('Using legacy lockfile format (v1)');
      warnings++;
    }
  }

  // Check for empty versions in dependencies
  const checkLockDeps = (deps, path = '') => {
    if (!deps) return;

    for (const [name, info] of Object.entries(deps)) {
      if (info.version === '' || info.version === undefined) {
        logError(`Empty version for ${name} in package-lock.json${path}`);
        errors++;
      }
    }
  };

  checkLockDeps(packageLock.dependencies);
  checkLockDeps(packageLock.packages);
}

/**
 * Print summary
 */
function printSummary() {
  logHeader('Validation Summary');

  log(`\nErrors:   ${errors}`, errors > 0 ? 'red' : 'green');
  log(`Warnings: ${warnings}`, warnings > 0 ? 'yellow' : 'green');

  if (errors === 0 && warnings === 0) {
    log('\n🎉 All checks passed! Configuration is valid.', 'green');
    return 0;
  } else if (errors === 0) {
    log('\n⚠️  No errors, but some warnings found.', 'yellow');
    log('Consider addressing warnings for optimal configuration.', 'yellow');
    return 0;
  } else {
    log('\n❌ Validation failed with errors!', 'red');
    log('Fix the errors above before deploying to Vercel.', 'red');
    return 1;
  }
}

/**
 * Main execution
 */
function main() {
  log('\n🔍 NPM Configuration Validator', 'cyan');
  log('Checking for common issues that cause Vercel build failures\n', 'cyan');

  const packageJson = validatePackageJson();
  const npmrcConfig = validateNpmrc();
  const vercelJson = validateVercelJson();

  crossValidate(npmrcConfig, vercelJson);
  validatePackageLock();

  const exitCode = printSummary();

  if (exitCode === 0 && errors === 0) {
    log('\n📝 Next steps:', 'cyan');
    log('  1. Run: npm ci --legacy-peer-deps', 'blue');
    log('  2. Run: npm run build', 'blue');
    log('  3. Commit and push to trigger Vercel deployment', 'blue');
  } else if (errors > 0) {
    log('\n🔧 Recommended fixes:', 'cyan');
    log('  1. Review the errors above', 'blue');
    log('  2. Align .npmrc with vercel.json install command', 'blue');
    log('  3. Regenerate package-lock.json if corrupted:', 'blue');
    log('     rm -rf node_modules package-lock.json', 'blue');
    log('     npm install --legacy-peer-deps', 'blue');
  }

  log(''); // Empty line
  process.exit(exitCode);
}

// Run the validator
main();
