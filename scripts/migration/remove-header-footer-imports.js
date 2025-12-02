#!/usr/bin/env node

/**
 * Migration Script: Remove Header/Footer Imports from Public Pages
 *
 * This script automatically:
 * 1. Finds all page.tsx files with manual Header/Footer imports
 * 2. Removes the import statements
 * 3. Removes the Header/Footer JSX elements
 * 4. Removes the wrapping <></> fragments if present
 * 5. Standardizes container classes to: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
 *
 * Usage: node scripts/migration/remove-header-footer-imports.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PUBLIC_PAGES_DIR = path.join(__dirname, '../../src/app/(public)');
const BACKUP_DIR = path.join(__dirname, '../../.migration-backups');
const DRY_RUN = process.argv.includes('--dry-run');

// Patterns to match and remove
const PATTERNS = {
  headerImport: /import\s+{\s*Header\s*}\s+from\s+["']@\/components\/layout\/Header["'];?\s*\n?/g,
  footerImport: /import\s+{\s*Footer\s*}\s+from\s+["']@\/components\/layout\/Footer["'];?\s*\n?/g,
  headerElement: /<Header\s*\/>/g,
  footerElement: /<Footer\s*\/>/g,
  fragmentWrapper: /^\s*<>\s*\n?([\s\S]*?)\n?\s*<\/>\s*$/m,
  containerVariations: [
    /className=["']container mx-auto px-\d+["']/g,
    /className=["']max-w-\w+ mx-auto["']/g,
    /className=["']container max-w-screen-\w+["']/g,
  ],
};

const STANDARD_CONTAINER = 'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

// Stats tracking
const stats = {
  totalFiles: 0,
  processedFiles: 0,
  skippedFiles: 0,
  errors: 0,
  changes: {
    headerImports: 0,
    footerImports: 0,
    headerElements: 0,
    footerElements: 0,
    fragmentWrappers: 0,
    containerClasses: 0,
  },
};

/**
 * Log with color
 */
function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

/**
 * Create backup directory if it doesn't exist
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    log(`✅ Created backup directory: ${BACKUP_DIR}`, 'green');
  }
}

/**
 * Create backup of a file
 */
function backupFile(filePath) {
  const relativePath = path.relative(PUBLIC_PAGES_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  const backupDir = path.dirname(backupPath);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  fs.copyFileSync(filePath, backupPath);
  log(`  📦 Backed up: ${relativePath}`, 'blue');
}

/**
 * Find all page.tsx files recursively
 */
function findPageFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.name === 'page.tsx') {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Check if file has Header or Footer imports
 */
function hasHeaderFooterImports(content) {
  return content.includes('from "@/components/layout/Header"') ||
         content.includes('from "@/components/layout/Footer"') ||
         content.includes("from '@/components/layout/Header'") ||
         content.includes("from '@/components/layout/Footer'");
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if file needs processing
    if (!hasHeaderFooterImports(content)) {
      stats.skippedFiles++;
      return false;
    }

    stats.totalFiles++;
    log(`\n📄 Processing: ${path.relative(PUBLIC_PAGES_DIR, filePath)}`, 'bright');

    // Backup original file
    if (!DRY_RUN) {
      backupFile(filePath);
    }

    let modified = content;
    let changes = [];

    // Remove Header import
    if (PATTERNS.headerImport.test(modified)) {
      modified = modified.replace(PATTERNS.headerImport, '');
      stats.changes.headerImports++;
      changes.push('Removed Header import');
    }

    // Remove Footer import
    if (PATTERNS.footerImport.test(modified)) {
      modified = modified.replace(PATTERNS.footerImport, '');
      stats.changes.footerImports++;
      changes.push('Removed Footer import');
    }

    // Remove Header element
    if (PATTERNS.headerElement.test(modified)) {
      modified = modified.replace(PATTERNS.headerElement, '');
      stats.changes.headerElements++;
      changes.push('Removed <Header /> element');
    }

    // Remove Footer element
    if (PATTERNS.footerElement.test(modified)) {
      modified = modified.replace(PATTERNS.footerElement, '');
      stats.changes.footerElements++;
      changes.push('Removed <Footer /> element');
    }

    // Remove fragment wrapper <></>
    const fragmentMatch = modified.match(PATTERNS.fragmentWrapper);
    if (fragmentMatch) {
      // Extract content between fragments
      const innerContent = fragmentMatch[1];
      // Find the return statement and replace the fragment
      modified = modified.replace(
        /return\s*\(\s*<>\s*\n?([\s\S]*?)\n?\s*<\/>\s*\);?/m,
        (match, content) => {
          return `return (\n${content.trim()}\n  );`;
        }
      );
      stats.changes.fragmentWrappers++;
      changes.push('Removed fragment wrapper');
    }

    // Standardize container classes (optional, can be commented out)
    PATTERNS.containerVariations.forEach((pattern) => {
      if (pattern.test(modified)) {
        modified = modified.replace(pattern, STANDARD_CONTAINER);
        stats.changes.containerClasses++;
        changes.push('Standardized container class');
      }
    });

    // Write modified content
    if (!DRY_RUN && modified !== content) {
      fs.writeFileSync(filePath, modified, 'utf-8');
      stats.processedFiles++;
      log(`  ✅ Changes applied:`, 'green');
      changes.forEach(change => log(`     - ${change}`, 'green'));
    } else if (DRY_RUN) {
      log(`  🔍 [DRY RUN] Would apply changes:`, 'yellow');
      changes.forEach(change => log(`     - ${change}`, 'yellow'));
    }

    return true;
  } catch (error) {
    stats.errors++;
    log(`  ❌ Error processing file: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  log('\n🚀 Starting Header/Footer Import Removal Migration', 'bright');
  log('='.repeat(60), 'blue');

  if (DRY_RUN) {
    log('\n⚠️  DRY RUN MODE - No files will be modified', 'yellow');
  } else {
    log('\n📝 LIVE MODE - Files will be modified', 'green');
  }

  // Ensure backup directory exists
  if (!DRY_RUN) {
    ensureBackupDir();
  }

  // Find all page.tsx files
  log(`\n🔍 Scanning: ${PUBLIC_PAGES_DIR}`, 'blue');
  const pageFiles = findPageFiles(PUBLIC_PAGES_DIR);
  log(`📊 Found ${pageFiles.length} page.tsx files`, 'blue');

  // Process each file
  pageFiles.forEach(processFile);

  // Print summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 MIGRATION SUMMARY', 'bright');
  log('='.repeat(60), 'blue');
  log(`Total files found: ${pageFiles.length}`, 'blue');
  log(`Files processed: ${stats.processedFiles}`, 'green');
  log(`Files skipped: ${stats.skippedFiles}`, 'yellow');
  log(`Errors: ${stats.errors}`, stats.errors > 0 ? 'red' : 'green');
  log('\nChanges made:', 'bright');
  log(`  - Header imports removed: ${stats.changes.headerImports}`, 'green');
  log(`  - Footer imports removed: ${stats.changes.footerImports}`, 'green');
  log(`  - Header elements removed: ${stats.changes.headerElements}`, 'green');
  log(`  - Footer elements removed: ${stats.changes.footerElements}`, 'green');
  log(`  - Fragment wrappers removed: ${stats.changes.fragmentWrappers}`, 'green');
  log(`  - Container classes standardized: ${stats.changes.containerClasses}`, 'green');

  if (!DRY_RUN && stats.processedFiles > 0) {
    log(`\n💾 Backups saved to: ${BACKUP_DIR}`, 'blue');
  }

  log('\n✅ Migration complete!', 'green');

  if (DRY_RUN) {
    log('\n💡 Run without --dry-run to apply changes', 'yellow');
  } else {
    log('\n📝 Next steps:', 'bright');
    log('  1. Run: npm run type-check', 'blue');
    log('  2. Run: npm run build', 'blue');
    log('  3. Test the application', 'blue');
    log('  4. If issues occur, restore from: ' + BACKUP_DIR, 'blue');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, findPageFiles };
