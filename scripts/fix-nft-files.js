#!/usr/bin/env node

/**
 * Fix Missing NFT Files - Post-Build Script
 *
 * This script creates the missing middleware.js.nft.json file
 * that Next.js 16 Turbopack sometimes fails to generate.
 *
 * NFT (Node File Trace) files are used by Next.js to determine
 * which files need to be included in the standalone build.
 *
 * Usage: node scripts/fix-nft-files.js
 * Or add to package.json: "postbuild": "node scripts/fix-nft-files.js"
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function createNFTFile() {
  const nftPath = path.join(process.cwd(), '.next', 'server', 'middleware.js.nft.json');
  const nftDir = path.dirname(nftPath);

  try {
    // Check if .next/server directory exists
    if (!fs.existsSync(nftDir)) {
      log('⚠️  .next/server directory does not exist. Build may have failed.', COLORS.yellow);
      log('   Run "npm run build" first.', COLORS.yellow);
      process.exit(0);
    }

    // Check if middleware.js.nft.json already exists
    if (fs.existsSync(nftPath)) {
      log('✅ middleware.js.nft.json already exists', COLORS.green);
      return;
    }

    // Create the NFT file with basic structure
    const nftContent = {
      version: 1,
      files: [
        // Common files that middleware might need
        'middleware.js',
      ],
    };

    fs.writeFileSync(nftPath, JSON.stringify(nftContent, null, 2), 'utf8');
    log('✅ Created middleware.js.nft.json', COLORS.green);
    log(`   Location: ${nftPath}`, COLORS.cyan);

  } catch (error) {
    log(`❌ Error creating NFT file: ${error.message}`, COLORS.red);
    process.exit(1);
  }
}

function main() {
  log('\n🔧 Fixing missing NFT files...\n', COLORS.cyan);
  createNFTFile();
  log('\n✨ NFT file fix complete!\n', COLORS.green);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createNFTFile };
