#!/usr/bin/env tsx
/**
 * 🔧 QUICK FIX SCRIPT
 * Farmers Market Platform - Automated Fixes for Common Issues
 *
 * This script automates fixes for:
 * 1. Logger import path fixes (@/lib/logging/logger -> @/lib/logger)
 * 2. Auth import fixes (next-auth/react -> @/lib/auth)
 * 3. Email import fixes (email-service-lazy -> email.service)
 * 4. Database import fixes (new PrismaClient -> @/lib/database)
 *
 * Usage: tsx scripts/quick-fix.ts [option]
 * Options:
 *   --all       Fix all issues
 *   --logger    Fix logger imports only
 *   --auth      Fix auth imports only
 *   --email     Fix email imports only
 *   --database  Fix database imports only
 *   --dry-run   Show what would be fixed without making changes
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

interface FixPattern {
  name: string;
  description: string;
  pattern: RegExp;
  replacement: string;
  filePattern: string;
  enabled: boolean;
}

const FIX_PATTERNS: FixPattern[] = [
  {
    name: 'logger',
    description: 'Fix logger import paths',
    pattern: /@\/lib\/logging\/logger/g,
    replacement: '@/lib/logger',
    filePattern: 'src/**/*.{ts,tsx}',
    enabled: true
  },
  {
    name: 'auth',
    description: 'Fix auth imports to use canonical path',
    pattern: /from ['"]next-auth\/react['"]/g,
    replacement: 'from "@/lib/auth"',
    filePattern: 'src/**/*.{ts,tsx}',
    enabled: true
  },
  {
    name: 'email-lazy',
    description: 'Fix email service imports',
    pattern: /@\/lib\/email\/email-service-lazy/g,
    replacement: '@/lib/email/email.service',
    filePattern: 'src/**/*.{ts,tsx}',
    enabled: true
  },
  {
    name: 'prisma-import',
    description: 'Fix direct PrismaClient imports (requires manual review)',
    pattern: /import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"]/g,
    replacement: 'import { database } from "@/lib/database"',
    filePattern: 'src/**/*.{ts,tsx}',
    enabled: false // Requires manual review - too risky to auto-fix
  }
];

// ============================================================================
// TYPES
// ============================================================================

interface FixResult {
  file: string;
  fixName: string;
  occurrences: number;
  applied: boolean;
}

interface SummaryStats {
  filesScanned: number;
  filesFixed: number;
  totalOccurrences: number;
  fixes: FixResult[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatPath(filePath: string): string {
  return path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
}

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf-8');
}

function findMatches(content: string, pattern: RegExp): number {
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

// ============================================================================
// FIX FUNCTIONS
// ============================================================================

async function applyFix(
  filePath: string,
  fix: FixPattern,
  dryRun: boolean
): Promise<FixResult | null> {
  try {
    const content = readFile(filePath);
    const occurrences = findMatches(content, fix.pattern);

    if (occurrences === 0) {
      return null;
    }

    const result: FixResult = {
      file: formatPath(filePath),
      fixName: fix.name,
      occurrences,
      applied: false
    };

    if (!dryRun) {
      const newContent = content.replace(fix.pattern, fix.replacement);
      writeFile(filePath, newContent);
      result.applied = true;
    }

    return result;
  } catch (error) {
    console.error(`❌ Error processing ${formatPath(filePath)}:`, error);
    return null;
  }
}

async function runFixes(
  fixes: FixPattern[],
  dryRun: boolean
): Promise<SummaryStats> {
  const stats: SummaryStats = {
    filesScanned: 0,
    filesFixed: 0,
    totalOccurrences: 0,
    fixes: []
  };

  console.log('\n🔍 Scanning for fixable issues...\n');

  for (const fix of fixes) {
    if (!fix.enabled) {
      console.log(`⏭️  Skipping ${fix.name} (disabled)`);
      continue;
    }

    console.log(`\n📋 ${fix.description}`);
    console.log(`   Pattern: ${fix.filePattern}`);

    try {
      const files = await glob(fix.filePattern, {
        cwd: PROJECT_ROOT,
        ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**'],
        absolute: true
      });

      console.log(`   Found ${files.length} files to check`);

      let fixedInThisRound = 0;

      for (const file of files) {
        stats.filesScanned++;
        const result = await applyFix(file, fix, dryRun);

        if (result) {
          stats.fixes.push(result);
          stats.totalOccurrences += result.occurrences;
          fixedInThisRound++;

          if (result.applied) {
            console.log(`   ✅ Fixed ${result.file} (${result.occurrences} occurrences)`);
          } else {
            console.log(`   🔍 Would fix ${result.file} (${result.occurrences} occurrences)`);
          }
        }
      }

      if (fixedInThisRound > 0) {
        stats.filesFixed += fixedInThisRound;
      } else {
        console.log(`   ✨ No issues found`);
      }
    } catch (error) {
      console.error(`❌ Error scanning for ${fix.name}:`, error);
    }
  }

  return stats;
}

// ============================================================================
// REPORTING
// ============================================================================

function printSummary(stats: SummaryStats, dryRun: boolean): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 QUICK FIX SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n📁 Files scanned: ${stats.filesScanned}`);
  console.log(`📝 Files with issues: ${stats.filesFixed}`);
  console.log(`🔧 Total fixes: ${stats.totalOccurrences}`);

  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes were made');
    console.log('Run without --dry-run to apply fixes');
  } else {
    console.log(`\n✅ Changes applied successfully!`);
  }

  if (stats.fixes.length > 0) {
    console.log('\n📋 Fixes by category:');
    const byCategory = stats.fixes.reduce((acc, fix) => {
      acc[fix.fixName] = (acc[fix.fixName] || 0) + fix.occurrences;
      return acc;
    }, {} as Record<string, number>);

    for (const [category, count] of Object.entries(byCategory)) {
      console.log(`   ${category}: ${count} occurrences`);
    }
  }

  console.log('\n' + '='.repeat(80));
}

function saveSummaryReport(stats: SummaryStats, dryRun: boolean): void {
  const reportPath = path.join(PROJECT_ROOT, 'quick-fix-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    dryRun,
    summary: {
      filesScanned: stats.filesScanned,
      filesFixed: stats.filesFixed,
      totalOccurrences: stats.totalOccurrences
    },
    fixes: stats.fixes
  };

  writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Detailed report saved to: ${formatPath(reportPath)}`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const selectedFixes = new Set(
    args.filter(arg => !arg.startsWith('--'))
  );

  console.log('🔧 FARMERS MARKET PLATFORM - QUICK FIX SCRIPT');
  console.log('='.repeat(80));

  if (dryRun) {
    console.log('🔍 Running in DRY RUN mode (no changes will be made)');
  }

  // Determine which fixes to apply
  let fixesToApply = FIX_PATTERNS;

  if (selectedFixes.size > 0 && !selectedFixes.has('all')) {
    fixesToApply = FIX_PATTERNS.map(fix => ({
      ...fix,
      enabled: fix.enabled && selectedFixes.has(fix.name)
    }));
  }

  // Run fixes
  const stats = await runFixes(fixesToApply, dryRun);

  // Print summary
  printSummary(stats, dryRun);

  // Save report
  saveSummaryReport(stats, dryRun);

  // Next steps
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Review changes: git diff');
  console.log('2. Run type check: npx tsc --noEmit');
  console.log('3. Run tests: npm test');
  console.log('4. Validate platform: npm run validate:all');
  console.log('5. Commit changes: git add -A && git commit -m "fix: apply automated fixes"');
  console.log('\n✨ Done!\n');

  process.exit(0);
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});

// Run main function
if (require.main === module) {
  main().catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}
