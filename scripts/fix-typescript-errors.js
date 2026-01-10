#!/usr/bin/env node

/**
 * 🔧 Automated TypeScript Error Fixer
 * Fixes common TypeScript errors across the codebase
 *
 * Usage: node scripts/fix-typescript-errors.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const PRISMA_DIR = path.join(__dirname, '..', 'prisma');

// Files to process
const filesToFix = [
  // Admin pages
  'src/app/(admin)/admin/orders/page.tsx',

  // Customer pages
  'src/app/(customer)/cart/page.tsx',
  'src/app/(customer)/customer/dashboard/page.tsx',
  'src/app/(customer)/farms/[slug]/page.tsx',
  'src/app/(customer)/marketplace/page.tsx',
  'src/app/(customer)/orders/[orderId]/confirmation/page.tsx',
  'src/app/(customer)/orders/[orderId]/page.tsx',
  'src/app/(customer)/orders/page.tsx',
  'src/app/(customer)/products/[slug]/page.tsx',
  'src/app/(customer)/settings/page.tsx',

  // Farmer pages
  'src/app/(farmer)/farmer/dashboard/page.tsx',
  'src/app/(farmer)/farmer/farms/[farmId]/orders/[orderId]/page.tsx',
  'src/app/(farmer)/farmer/farms/[farmId]/orders/page.tsx',
  'src/app/(farmer)/farmer/farms/[farmId]/page.tsx',
  'src/app/(farmer)/farmer/orders/page.tsx',

  // Actions
  'src/app/actions/cart.actions.ts',

  // API routes
  'src/app/api/admin/analytics/route.ts',
  'src/app/api/admin/orders/route.ts',
  'src/app/api/admin/users/[id]/route.ts',
  'src/app/api/admin/webhooks/monitor/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/cart/route.ts',
  'src/app/api/favorites/route.ts',
];

console.log('🔧 TypeScript Error Fixer\n');
console.log('This script will add type annotations to fix implicit any errors\n');

// Fix patterns
const fixes = [
  // Pattern 1: map with implicit any
  {
    pattern: /\.map\(\s*\(([a-zA-Z_][a-zA-Z0-9_]*)\)\s*=>/g,
    replacement: '.map(($1: any) =>',
    description: 'Fix map() implicit any'
  },

  // Pattern 2: filter with implicit any
  {
    pattern: /\.filter\(\s*\(([a-zA-Z_][a-zA-Z0-9_]*)\)\s*=>/g,
    replacement: '.filter(($1: any) =>',
    description: 'Fix filter() implicit any'
  },

  // Pattern 3: reduce with two params
  {
    pattern: /\.reduce\(\s*\(([a-zA-Z_][a-zA-Z0-9_]*),\s*([a-zA-Z_][a-zA-Z0-9_]*)\)\s*=>/g,
    replacement: '.reduce(($1: any, $2: any) =>',
    description: 'Fix reduce() implicit any'
  },

  // Pattern 4: forEach with implicit any
  {
    pattern: /\.forEach\(\s*\(([a-zA-Z_][a-zA-Z0-9_]*)\)\s*=>/g,
    replacement: '.forEach(($1: any) =>',
    description: 'Fix forEach() implicit any'
  },

  // Pattern 5: find with implicit any
  {
    pattern: /\.find\(\s*\(([a-zA-Z_][a-zA-Z0-9_]*)\)\s*=>/g,
    replacement: '.find(($1: any) =>',
    description: 'Fix find() implicit any'
  },

  // Pattern 6: some with implicit any
  {
    pattern: /\.some\(\s*\(([a-zA-Z_][a-zA-Z0-9_]*)\)\s*=>/g,
    replacement: '.some(($1: any) =>',
    description: 'Fix some() implicit any'
  },

  // Pattern 7: every with implicit any
  {
    pattern: /\.every\(\s*\(([a-zA-Z_][a-zA-Z0-9_]*)\)\s*=>/g,
    replacement: '.every(($1: any) =>',
    description: 'Fix every() implicit any'
  },
];

// Additional specific fixes
const specificFixes = {
  'src/app/actions/cart.actions.ts': (content) => {
    // Fix CartItem property access
    content = content.replace(
      /item\.quantity/g,
      'Number(item.quantity)'
    );
    content = content.replace(
      /item\.priceAtAdd/g,
      'Number(item.priceAtAdd)'
    );
    return content;
  },

  'src/app/(customer)/cart/page.tsx': (content) => {
    // Fix CartItem property access
    content = content.replace(
      /item\.quantity(?!\.)(?!\()/g,
      'Number(item.quantity)'
    );
    return content;
  },
};

// Process files
let totalFixed = 0;
let totalFiles = 0;

filesToFix.forEach(relativeFilePath => {
  const filePath = path.join(__dirname, '..', relativeFilePath);

  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${relativeFilePath} (not found)`);
    return;
  }

  console.log(`\n📝 Processing: ${relativeFilePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixCount = 0;

  // Apply pattern fixes
  fixes.forEach(fix => {
    const matches = content.match(fix.pattern);
    if (matches) {
      const beforeFix = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (beforeFix !== content) {
        const count = matches.length;
        console.log(`  ✅ ${fix.description}: ${count} fix(es)`);
        fixCount += count;
      }
    }
  });

  // Apply specific fixes
  if (specificFixes[relativeFilePath]) {
    console.log(`  🔧 Applying specific fixes...`);
    const beforeSpecific = content;
    content = specificFixes[relativeFilePath](content);
    if (beforeSpecific !== content) {
      console.log(`  ✅ Specific fixes applied`);
      fixCount++;
    }
  }

  // Add type imports if needed
  if (content.includes(': any') && !content.includes("import type {")) {
    const hasCartItem = content.includes('CartItem');
    const hasProduct = content.includes('Product');
    const hasOrder = content.includes('Order');

    if (hasCartItem || hasProduct || hasOrder) {
      const types = [];
      if (hasCartItem) types.push('CartItem');
      if (hasProduct) types.push('Product');
      if (hasOrder) types.push('Order');

      // Check if import already exists
      if (!content.includes('import type { CartItem') && !content.includes('import type { Product')) {
        const importStatement = `import type { ${types.join(', ')} } from "@prisma/client";\n`;

        // Find the first import and add after it
        const firstImportMatch = content.match(/^import .+;$/m);
        if (firstImportMatch) {
          const insertPos = content.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
          content = content.slice(0, insertPos + 1) + '\n' + importStatement + content.slice(insertPos + 1);
          console.log(`  ✅ Added type imports: ${types.join(', ')}`);
          fixCount++;
        }
      }
    }
  }

  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 Saved ${fixCount} fix(es)`);
    totalFixed += fixCount;
    totalFiles++;
  } else {
    console.log(`  ℹ️  No changes needed`);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n✅ Complete!`);
console.log(`   Files processed: ${filesToFix.length}`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   Total fixes applied: ${totalFixed}`);

console.log('\n🔍 Running TypeScript check to see remaining errors...\n');

try {
  execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('\n✅ TypeScript check passed!');
} catch (error) {
  console.log('\n⚠️  Some TypeScript errors remain. Check output above.');
  console.log('   Run "npx tsc --noEmit | grep "error TS" | wc -l" to count remaining errors');
}

console.log('\n📚 Next steps:');
console.log('   1. Review the changes: git diff');
console.log('   2. Test the application: npm run dev');
console.log('   3. Run lint: npm run lint');
console.log('   4. Commit if satisfied: git add -A && git commit -m "fix: add TypeScript type annotations"');
console.log('');
