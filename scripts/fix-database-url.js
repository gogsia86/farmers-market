#!/usr/bin/env node

/**
 * 🔧 QUICK DATABASE_URL FIX SCRIPT
 * Updates DATABASE_URL in .env to match Docker container settings
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const correctDatabaseUrl = 'postgresql://farmers_user:changeme123@localhost:5432/farmers_market';

console.log('\n🔧 Fixing DATABASE_URL in .env file...\n');

try {
  // Read current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Backup current .env
  const backupPath = `${envPath}.backup.${Date.now()}`;
  fs.writeFileSync(backupPath, envContent);
  console.log(`✅ Backed up .env to: ${backupPath}`);

  // Update DATABASE_URL
  if (/^DATABASE_URL=/m.test(envContent)) {
    // Replace existing DATABASE_URL
    envContent = envContent.replace(
      /^DATABASE_URL=.*/m,
      `DATABASE_URL="${correctDatabaseUrl}"`
    );
    console.log('✅ Updated existing DATABASE_URL');
  } else {
    // Add DATABASE_URL if it doesn't exist
    envContent = `DATABASE_URL="${correctDatabaseUrl}"\n\n${envContent}`;
    console.log('✅ Added DATABASE_URL');
  }

  // Write updated content
  fs.writeFileSync(envPath, envContent);

  console.log('\n📋 New DATABASE_URL:');
  console.log(`   ${correctDatabaseUrl}\n`);
  console.log('✅ DATABASE_URL updated successfully!\n');
  console.log('🚀 Next steps:');
  console.log('   1. npx prisma db push');
  console.log('   2. npm run seed');
  console.log('   3. npm run dev\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
