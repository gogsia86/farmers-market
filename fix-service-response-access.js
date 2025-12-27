#!/usr/bin/env node

/**
 * 🔧 FIX SERVICE RESPONSE ACCESS PATTERNS
 *
 * Automatically fixes incorrect ServiceResponse property access in controllers.
 *
 * PROBLEM:
 * Controllers are accessing ServiceResponse properties directly:
 *   const result = await service.method();
 *   return result.farms; // ❌ ERROR - accessing directly
 *
 * SOLUTION:
 * Access via .data property after checking success:
 *   const result = await service.method();
 *   if (!result.success) return this.error(...);
 *   return result.data.farms; // ✅ CORRECT
 *
 * PATTERNS FIXED:
 * 1. result.farms → result.data (for paginated responses)
 * 2. result.farm → result.data.farm
 * 3. result.slug → result.data.slug
 * 4. result.orders → result.data.orders
 * 5. result.pagination → result.data.pagination
 * 6. result.id → result.data.id
 * 7. result.orderNumber → result.data.orderNumber
 * 8. result.total → result.data.total
 * 9. result.status → result.data.status
 * 10. result.customerId → result.data.customerId
 * 11. result.length → result.data.length
 *
 * Usage:
 *   node fix-service-response-access.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_DIRS = [
  'src/lib/controllers',
];

const ROOT_DIR = __dirname;

// Statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  patternsFixed: 0,
  errors: [],
};

/**
 * Patterns to fix
 * Each pattern has:
 * - regex: pattern to match
 * - replacement: what to replace with
 * - description: what's being fixed
 */
const PATTERNS = [
  // Pattern 1: result.farms → result.data (paginated farms)
  {
    regex: /(\w+)\.farms\b(?!\s*=)/g,
    replacement: '$1.data',
    description: 'result.farms → result.data',
  },

  // Pattern 2: result.farm (single farm access)
  {
    regex: /(\w+)\.farm\b(?!\s*=)(?!Id)/g,
    replacement: '$1.data.farm',
    description: 'result.farm → result.data.farm',
  },

  // Pattern 3: result.slug
  {
    regex: /(\w+)\.slug\b(?!\s*=)/g,
    replacement: '$1.data.slug',
    description: 'result.slug → result.data.slug',
  },

  // Pattern 4: result.orders
  {
    regex: /(\w+)\.orders\b(?!\s*=)/g,
    replacement: '$1.data.orders',
    description: 'result.orders → result.data.orders',
  },

  // Pattern 5: result.pagination
  {
    regex: /(\w+)\.pagination\b(?!\s*=)/g,
    replacement: '$1.data.pagination',
    description: 'result.pagination → result.data.pagination',
  },

  // Pattern 6: result.id (not including userId, farmId, etc.)
  {
    regex: /\bresult\.id\b(?!\s*=)/g,
    replacement: 'result.data.id',
    description: 'result.id → result.data.id',
  },

  // Pattern 7: result.orderNumber
  {
    regex: /(\w+)\.orderNumber\b(?!\s*=)/g,
    replacement: '$1.data.orderNumber',
    description: 'result.orderNumber → result.data.orderNumber',
  },

  // Pattern 8: result.total (not including totalPages)
  {
    regex: /(\w+)\.total\b(?!\s*=)(?!Pages)/g,
    replacement: '$1.data.total',
    description: 'result.total → result.data.total',
  },

  // Pattern 9: result.totalPages
  {
    regex: /(\w+)\.totalPages\b(?!\s*=)/g,
    replacement: '$1.data.totalPages',
    description: 'result.totalPages → result.data.totalPages',
  },

  // Pattern 10: result.page
  {
    regex: /(\w+)\.page\b(?!\s*=)(?!Info)/g,
    replacement: '$1.data.page',
    description: 'result.page → result.data.page',
  },

  // Pattern 11: result.status
  {
    regex: /\bresult\.status\b(?!\s*=)(?!\s*===)(?!\s*!==)/g,
    replacement: 'result.data.status',
    description: 'result.status → result.data.status',
  },

  // Pattern 12: result.customerId
  {
    regex: /(\w+)\.customerId\b(?!\s*=)/g,
    replacement: '$1.data.customerId',
    description: 'result.customerId → result.data.customerId',
  },

  // Pattern 13: result.length (for array results)
  {
    regex: /(\w+)\.length\b(?!\s*=)(?!\s*>)/g,
    replacement: '$1.data.length',
    description: 'result.length → result.data.length',
  },
];

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let filePatternCount = 0;

    // Apply each pattern
    for (const pattern of PATTERNS) {
      const matches = content.match(pattern.regex);
      if (matches) {
        content = content.replace(pattern.regex, pattern.replacement);
        const count = matches.length;
        filePatternCount += count;
        console.log(`  ✓ ${pattern.description} (${count} occurrence${count > 1 ? 's' : ''})`);
      }
    }

    // If content changed, write it back
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      stats.patternsFixed += filePatternCount;
      console.log(`✅ Fixed ${filePatternCount} pattern${filePatternCount > 1 ? 's' : ''} in: ${path.relative(ROOT_DIR, filePath)}\n`);
      return true;
    }

    return false;
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively scan directory for TypeScript files
 */
function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        stats.filesScanned++;
        processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 SERVICE RESPONSE ACCESS PATTERN FIXER\n');
  console.log('=' .repeat(60));
  console.log('Fixing incorrect ServiceResponse property access patterns');
  console.log('=' .repeat(60));
  console.log('');

  const startTime = Date.now();

  // Process each target directory
  for (const targetDir of TARGET_DIRS) {
    const fullPath = path.join(ROOT_DIR, targetDir);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Directory not found: ${targetDir}`);
      continue;
    }

    console.log(`📁 Scanning: ${targetDir}\n`);
    scanDirectory(fullPath);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('');
  console.log('=' .repeat(60));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Files scanned:     ${stats.filesScanned}`);
  console.log(`Files modified:    ${stats.filesModified}`);
  console.log(`Patterns fixed:    ${stats.patternsFixed}`);
  console.log(`Errors:            ${stats.errors.length}`);
  console.log(`Duration:          ${duration}s`);
  console.log('=' .repeat(60));

  if (stats.errors.length > 0) {
    console.log('\n❌ ERRORS:\n');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  ${path.relative(ROOT_DIR, file)}: ${error}`);
    });
  }

  if (stats.filesModified > 0) {
    console.log('\n✅ SUCCESS! ServiceResponse access patterns have been fixed.');
    console.log('   Run "npm run type-check" to verify fixes.');
  } else {
    console.log('\n✓ No files needed modification.');
  }
}

// Run the script
main();
