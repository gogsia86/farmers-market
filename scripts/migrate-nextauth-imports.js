/**
 * NextAuth v5 Migration Script
 * Automatically updates getServerSession imports from next-auth to @/lib/auth/config
 *
 * Usage: node scripts/migrate-nextauth-imports.js
 */

const fs = require('fs');
const path = require('path');

// Files to update
const FILES_TO_UPDATE = [
  'src/app/api/analytics/events/route.ts',
  'src/app/api/analytics/events/stats/route.ts',
  'src/app/api/analytics/events/trending/route.ts',
  'src/app/api/analytics/interactions/route.ts',
  'src/app/api/saved-searches/route.ts',
  'src/app/api/saved-searches/[id]/execute/route.ts',
  'src/app/api/saved-searches/[id]/route.ts',
  'src/app/api/search-alerts/route.ts',
  'src/app/api/search-alerts/[id]/execute/route.ts',
  'src/app/api/search-alerts/[id]/route.ts',
];

console.log('🔄 Migrating NextAuth v4 imports to v5...\n');

let updatedCount = 0;
let errorCount = 0;

FILES_TO_UPDATE.forEach((filePath) => {
  const fullPath = path.join(process.cwd(), filePath);

  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      errorCount++;
      return;
    }

    // Read file content
    let content = fs.readFileSync(fullPath, 'utf8');

    // Track if changes were made
    let modified = false;

    // Pattern 1: Replace import statement
    if (content.includes('import { getServerSession } from "next-auth";')) {
      content = content.replace(
        /import { getServerSession } from "next-auth";/g,
        'import { auth as getServerSession } from "@/lib/auth/config";'
      );
      modified = true;
    }

    // Pattern 2: Remove authOptions import if present
    if (content.includes('import { authOptions } from "@/lib/auth";')) {
      content = content.replace(
        /import { authOptions } from "@\/lib\/auth";\n/g,
        ''
      );
      modified = true;
    }

    // Pattern 3: Replace getServerSession(authOptions) calls
    if (content.includes('getServerSession(authOptions)')) {
      content = content.replace(
        /getServerSession\(authOptions\)/g,
        'getServerSession()'
      );
      modified = true;
    }

    if (modified) {
      // Write updated content back to file
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      updatedCount++;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log('\n📊 Migration Summary:');
console.log(`   ✅ Updated: ${updatedCount} files`);
console.log(`   ❌ Errors: ${errorCount} files`);
console.log(`   📝 Total: ${FILES_TO_UPDATE.length} files`);

if (updatedCount > 0) {
  console.log('\n✨ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run type-check');
  console.log('2. Test authentication flows');
  console.log('3. Check for any remaining imports manually');
}
