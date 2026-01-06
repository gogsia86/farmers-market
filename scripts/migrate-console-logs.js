#!/usr/bin/env node

/**
 * 🔄 CONSOLE.LOG MIGRATION SCRIPT
 *
 * Replaces console.log/warn/error/debug/info with structured logger
 *
 * Features:
 * - Detects and replaces all console.* calls
 * - Preserves context and message structure
 * - Adds proper logger imports
 * - Handles different console methods appropriately
 * - Creates backup files
 * - Generates migration report
 *
 * Usage:
 *   node scripts/migrate-console-logs.js [--dry-run] [--path=<path>]
 *
 * Options:
 *   --dry-run    Show changes without modifying files
 *   --path       Migrate specific path (default: src/)
 *   --backup     Create .backup files (default: true)
 *   --report     Generate migration report (default: true)
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // File extensions to process
  extensions: ['.ts', '.tsx', '.js', '.jsx'],

  // Directories to exclude
  excludeDirs: [
    'node_modules',
    'dist',
    'build',
    '.next',
    'scripts',
    '__tests__',
    'coverage',
    '.git',
  ],

  // Files to exclude
  excludeFiles: [
    'jest.setup.js',
    'jest.env.js',
    'logger.ts',
  ],

  // Console method mappings
  methodMappings: {
    'log': 'info',
    'info': 'info',
    'warn': 'warn',
    'error': 'error',
    'debug': 'debug',
  },

  // Logger import statement
  loggerImport: `import { logger } from '@/lib/monitoring/logger';`,

  // Backup extension
  backupExtension: '.backup',
};

// ============================================================================
// STATE
// ============================================================================

const state = {
  filesProcessed: 0,
  filesModified: 0,
  consoleCallsReplaced: 0,
  errors: [],
  changes: [],
  dryRun: false,
  createBackup: true,
  generateReport: true,
  targetPath: 'src/',
};

// ============================================================================
// UTILITIES
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);

  for (const arg of args) {
    if (arg === '--dry-run') {
      state.dryRun = true;
    } else if (arg.startsWith('--path=')) {
      state.targetPath = arg.split('=')[1];
    } else if (arg === '--no-backup') {
      state.createBackup = false;
    } else if (arg === '--no-report') {
      state.generateReport = false;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
🔄 Console.log Migration Script

Usage:
  node scripts/migrate-console-logs.js [options]

Options:
  --dry-run       Show changes without modifying files
  --path=<path>   Migrate specific path (default: src/)
  --no-backup     Don't create backup files
  --no-report     Don't generate migration report
  --help, -h      Show this help message

Examples:
  node scripts/migrate-console-logs.js --dry-run
  node scripts/migrate-console-logs.js --path=src/lib
  node scripts/migrate-console-logs.js --no-backup
      `);
      process.exit(0);
    }
  }
}

function shouldExclude(filePath, fileName) {
  // Check if path contains excluded directories
  for (const dir of CONFIG.excludeDirs) {
    if (filePath.includes(path.sep + dir + path.sep) || filePath.startsWith(dir + path.sep)) {
      return true;
    }
  }

  // Check if filename is excluded
  if (CONFIG.excludeFiles.includes(fileName)) {
    return true;
  }

  return false;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(process.cwd(), fullPath);

    if (shouldExclude(relativePath, file)) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file);
      if (CONFIG.extensions.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function hasLoggerImport(content) {
  return (
    content.includes(`from '@/lib/monitoring/logger'`) ||
    content.includes(`from "@/lib/monitoring/logger"`) ||
    content.includes(`import logger from '@/lib/monitoring/logger'`) ||
    content.includes(`import { logger } from '@/lib/monitoring/logger'`)
  );
}

function addLoggerImport(content) {
  // Handle different file types
  const lines = content.split('\n');
  let lastImportIndex = -1;
  let firstCodeLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track last import
    if (line.startsWith('import ') && !line.startsWith('import type')) {
      lastImportIndex = i;
    }

    // Find first real code line (not comment, not empty, not import)
    if (firstCodeLine === -1 && line &&
      !line.startsWith('import') &&
      !line.startsWith('//') &&
      !line.startsWith('/*') &&
      !line.startsWith('*') &&
      !line.startsWith('"use') &&
      !line.startsWith("'use")) {
      firstCodeLine = i;
    }
  }

  // Insert after last import, or before first code line
  let insertIndex = lastImportIndex !== -1 ? lastImportIndex + 1 :
    firstCodeLine !== -1 ? firstCodeLine : 0;

  // Add blank line before import if needed
  if (insertIndex > 0 && lines[insertIndex - 1].trim() !== '') {
    lines.splice(insertIndex, 0, '');
    insertIndex++;
  }

  lines.splice(insertIndex, 0, CONFIG.loggerImport);

  // Add blank line after import if needed
  if (insertIndex < lines.length - 1 && lines[insertIndex + 1].trim() !== '') {
    lines.splice(insertIndex + 1, 0, '');
  }

  return lines.join('\n');
}

function replaceConsoleCalls(content, filePath) {
  let modified = content;
  let replacements = 0;
  const fileChanges = [];

  // Match console.method( calls
  const consoleRegex = /console\.(log|info|warn|error|debug)\s*\(/g;

  let match;
  const matches = [];

  // Collect all matches first
  while ((match = consoleRegex.exec(content)) !== null) {
    matches.push({
      index: match.index,
      method: match[1],
      fullMatch: match[0],
    });
  }

  // Replace from end to start to maintain indices
  matches.reverse().forEach(m => {
    const loggerMethod = CONFIG.methodMappings[m.method];
    if (!loggerMethod) return;

    const replacement = `logger.${loggerMethod}(`;
    modified = modified.substring(0, m.index) + replacement + modified.substring(m.index + m.fullMatch.length);

    replacements++;
    fileChanges.push({
      original: m.fullMatch,
      replacement,
      method: m.method,
    });
  });

  return {
    content: modified,
    replacements,
    changes: fileChanges,
  };
}

function createBackup(filePath) {
  const backupPath = filePath + CONFIG.backupExtension;
  try {
    fs.copyFileSync(filePath, backupPath);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create backup for ${filePath}:`, error.message);
    return false;
  }
}

function processFile(filePath) {
  state.filesProcessed++;

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if file has console calls
    const hasConsoleCalls = /console\.(log|info|warn|error|debug)\s*\(/g.test(content);

    if (!hasConsoleCalls) {
      return; // Skip files without console calls
    }

    let modified = content;

    // Replace console calls
    const result = replaceConsoleCalls(modified, filePath);
    modified = result.content;

    if (result.replacements > 0) {
      state.consoleCallsReplaced += result.replacements;

      // Add logger import if needed
      if (!hasLoggerImport(modified)) {
        modified = addLoggerImport(modified);
      }

      // Track changes
      state.changes.push({
        file: path.relative(process.cwd(), filePath),
        replacements: result.replacements,
        changes: result.changes,
      });

      // Write changes
      if (!state.dryRun) {
        // Create backup if enabled
        if (state.createBackup) {
          createBackup(filePath);
        }

        // Write modified content
        fs.writeFileSync(filePath, modified, 'utf8');
        state.filesModified++;
      }

      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relativePath}: ${result.replacements} console calls replaced`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    state.errors.push({
      file: path.relative(process.cwd(), filePath),
      error: error.message,
    });
  }
}

function generateReport() {
  if (!state.generateReport) return;

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const reportPath = `console-log-migration-report-${timestamp}.md`;

  const methodStats = Object.entries(CONFIG.methodMappings).map(([consoleMethod, loggerMethod]) => {
    const count = state.changes.reduce((sum, change) => {
      return sum + change.changes.filter(c => c.method === consoleMethod).length;
    }, 0);
    return `- \`console.${consoleMethod}\` → \`logger.${loggerMethod}\`: ${count} replacements`;
  }).join('\n');

  const reportContent = `# Console.log Migration Report

**Generated**: ${new Date().toISOString()}
**Mode**: ${state.dryRun ? '🔍 DRY RUN' : '✅ LIVE'}
**Target Path**: ${state.targetPath}

---

## 📊 Summary

| Metric | Count |
|--------|-------|
| Files Processed | ${state.filesProcessed} |
| Files Modified | ${state.filesModified} |
| Console Calls Replaced | ${state.consoleCallsReplaced} |
| Errors | ${state.errors.length} |

---

## 🔄 Changes by File

${state.changes.map(change => `
### \`${change.file}\`

**Replacements**: ${change.replacements}

${change.changes.slice(0, 10).map((c, i) =>
    `${i + 1}. \`${c.original}\` → \`logger.${CONFIG.methodMappings[c.method]}(\``
  ).join('\n')}
${change.changes.length > 10 ? `\n... and ${change.changes.length - 10} more replacements` : ''}
`).join('\n---\n')}

---

## 📈 Migration Statistics by Method

${methodStats}

${state.errors.length > 0 ? `
---

## ❌ Errors Encountered

${state.errors.map(err => `
### \`${err.file}\`

\`\`\`
${err.error}
\`\`\`
`).join('\n')}
` : ''}

---

## 🎯 Next Steps

${state.dryRun ? `
1. ✅ Review the changes above
2. ⚡ Run without \`--dry-run\` to apply changes:
   \`\`\`bash
   node scripts/migrate-console-logs.js
   \`\`\`
3. 🧪 Test the application thoroughly
4. 📝 Commit the changes
` : `
1. ✅ Changes have been applied
2. 🔍 Review modified files and backups (.backup)
3. 🧪 Test the application:
   \`\`\`bash
   npm run dev
   \`\`\`
4. 🧪 Run tests:
   \`\`\`bash
   npm test
   \`\`\`
5. 🗑️ If satisfied, delete backup files:
   \`\`\`bash
   # Windows (PowerShell)
   Get-ChildItem -Recurse -Filter "*.backup" | Remove-Item

   # Unix/Mac
   find . -name "*.backup" -delete
   \`\`\`
6. 📝 Commit the changes:
   \`\`\`bash
   git add .
   git commit -m "refactor: migrate console.log to structured logger"
   \`\`\`
`}

---

**Migration completed at**: ${new Date().toISOString()}
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`\n📊 Report saved to: ${reportPath}`);
  return reportPath;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('🔄 Console.log Migration Script');
  console.log('='.repeat(60) + '\n');

  parseArgs();

  if (state.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  console.log(`📁 Target path: ${state.targetPath}`);
  console.log(`💾 Backups: ${state.createBackup ? 'enabled' : 'disabled'}`);
  console.log(`📊 Report: ${state.generateReport ? 'enabled' : 'disabled'}\n`);

  // Get files to process
  console.log('🔍 Scanning for files...');

  if (!fs.existsSync(state.targetPath)) {
    console.error(`❌ Target path does not exist: ${state.targetPath}`);
    process.exit(1);
  }

  const files = getAllFiles(state.targetPath);
  console.log(`📝 Found ${files.length} files to process\n`);

  if (files.length === 0) {
    console.log('❌ No files found to process');
    return;
  }

  // Process each file
  console.log('🚀 Processing files...\n');
  const startTime = Date.now();

  for (const file of files) {
    processFile(file);
  }

  const duration = Date.now() - startTime;

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary');
  console.log('='.repeat(60));
  console.log(`✅ Files Processed: ${state.filesProcessed}`);
  console.log(`📝 Files Modified: ${state.filesModified}`);
  console.log(`🔄 Console Calls Replaced: ${state.consoleCallsReplaced}`);
  console.log(`❌ Errors: ${state.errors.length}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log('='.repeat(60) + '\n');

  if (state.errors.length > 0) {
    console.log('⚠️  Errors occurred during migration:');
    state.errors.forEach(err => {
      console.log(`   - ${err.file}: ${err.error}`);
    });
    console.log('');
  }

  // Generate report
  const reportPath = generateReport();

  if (state.dryRun) {
    console.log('💡 This was a dry run. Run without --dry-run to apply changes.');
    console.log(`\n🎯 To apply changes, run:\n   node scripts/migrate-console-logs.js\n`);
  } else {
    console.log('✅ Migration complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Review the changes');
    console.log('   2. Test the application: npm run dev');
    console.log('   3. Run tests: npm test');
    console.log('   4. Commit changes: git add . && git commit -m "refactor: migrate console.log to structured logger"');

    if (state.createBackup) {
      console.log('\n💾 Backup files created (.backup extension)');
      console.log('   - Review and delete when satisfied');
      console.log('   - Windows PowerShell: Get-ChildItem -Recurse -Filter "*.backup" | Remove-Item');
      console.log('   - Unix/Mac: find . -name "*.backup" -delete');
    }
  }

  if (reportPath) {
    console.log(`\n📄 Full report: ${reportPath}`);
  }
}

// Run the script
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

module.exports = { main, CONFIG };
