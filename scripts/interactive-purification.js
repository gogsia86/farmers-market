#!/usr/bin/env node

/**
 * 🌟 DIVINE REPOSITORY PURIFICATION - INTERACTIVE MODE
 * Safe deletion with user confirmation for each item
 * Agricultural Consciousness Protection: MAXIMUM
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class DivineRepositoryPurifier {
  constructor() {
    this.purifiedCount = 0;
    this.skippedCount = 0;
    this.protectedPaths = [
      'farmers-market',
      'automation',
      'config', 
      'scripts',
      '.git',
      '.github',
      'docs'
    ];
  }

  async askConfirmation(message) {
    return new Promise((resolve) => {
      rl.question(`${message} (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async purifyPath(targetPath, description, isDirectory = true) {
    if (!fs.existsSync(targetPath)) {
      console.log(`   ⚪ Not found: ${targetPath}`);
      return false;
    }

    // Check if it's a protected path
    if (this.protectedPaths.some(protected => targetPath.startsWith(protected))) {
      console.log(`   🛡️ PROTECTED: ${targetPath} - ${description}`);
      return false;
    }

    const stats = fs.statSync(targetPath);
    const size = isDirectory ? this.getDirSize(targetPath) : stats.size;
    const sizeStr = (size / 1024 / 1024).toFixed(2);
    
    console.log(`\n🔍 Target: ${targetPath}`);
    console.log(`   📝 Description: ${description}`);
    console.log(`   📏 Size: ${sizeStr} MB`);
    console.log(`   📁 Type: ${isDirectory ? 'Directory' : 'File'}`);

    const confirmed = await this.askConfirmation(`🔥 Delete ${targetPath}?`);
    
    if (confirmed) {
      try {
        if (isDirectory) {
          fs.rmSync(targetPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(targetPath);
        }
        console.log(`   ✅ Purified: ${targetPath} (${sizeStr} MB freed)`);
        this.purifiedCount++;
        return true;
      } catch (error) {
        console.log(`   ❌ Error purifying ${targetPath}: ${error.message}`);
        return false;
      }
    } else {
      console.log(`   ⏭️ Skipped: ${targetPath}`);
      this.skippedCount++;
      return false;
    }
  }

  getDirSize(dirPath) {
    let totalSize = 0;
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          totalSize += this.getDirSize(fullPath);
        } else {
          try {
            const stats = fs.statSync(fullPath);
            totalSize += stats.size;
          } catch (error) {
            // Skip inaccessible files
          }
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
    return totalSize;
  }

  async verifyProtectedPaths() {
    console.log('\n🌱 AGRICULTURAL CONSCIOUSNESS VERIFICATION:');
    const criticalPaths = [
      { path: 'farmers-market', desc: 'Core Agricultural Platform' },
      { path: 'farmers-market/src', desc: 'Agricultural Intelligence Source' },
      { path: 'automation', desc: 'Agricultural Automation Systems' },
      { path: 'config', desc: 'Quantum Monitoring Configuration' },
      { path: 'scripts', desc: 'Divine Cleanup Tools' },
      { path: '.git', desc: 'Version Control History' },
      { path: '.github', desc: 'GitHub Workflows' }
    ];

    let allProtected = true;
    for (const item of criticalPaths) {
      if (fs.existsSync(item.path)) {
        console.log(`   ✅ Protected: ${item.path} - ${item.desc}`);
      } else {
        console.log(`   ❌ MISSING: ${item.path} - ${item.desc}`);
        allProtected = false;
      }
    }
    return allProtected;
  }

  async executePurification() {
    console.log('🌟 DIVINE REPOSITORY PURIFICATION - INTERACTIVE MODE');
    console.log('🛡️ Agricultural Consciousness Protection: MAXIMUM');
    console.log('⚠️ You will be asked to confirm each deletion\n');

    const proceedWithAll = await this.askConfirmation('🚀 Proceed with interactive purification?');
    if (!proceedWithAll) {
      console.log('🛑 Purification cancelled by user');
      rl.close();
      return;
    }

    // Phase 1: Regenerable build artifacts
    console.log('\n🔥 PHASE 1: REGENERABLE BUILD ARTIFACTS');
    const buildTargets = [
      { path: 'farmers-market/.next', desc: 'Next.js build cache (regenerable)' },
      { path: 'farmers-market/node_modules', desc: 'Node.js dependencies (regenerable)' },
      { path: 'farmers-market/coverage', desc: 'Test coverage reports (regenerable)' },
      { path: 'farmers-market/test-results', desc: 'Test result files (regenerable)' },
      { path: 'node_modules', desc: 'Root node_modules (regenerable)' }
    ];

    for (const target of buildTargets) {
      await this.purifyPath(target.path, target.desc, true);
    }

    // Phase 2: Legacy project folders
    console.log('\n🗑️ PHASE 2: LEGACY PROJECT FOLDERS');
    const legacyTargets = [
      { path: 'microsoft-copilot-hack-main', desc: 'Microsoft hackathon leftover project' },
      { path: 'omnicortex', desc: 'Duplicate omnicortex reference' },
      { path: '.omnicortex', desc: 'Hidden omnicortex configuration' },
      { path: 'archive', desc: 'Historical archive folder' }
    ];

    for (const target of legacyTargets) {
      await this.purifyPath(target.path, target.desc, true);
    }

    // Phase 3: IDE and system files
    console.log('\n💻 PHASE 3: IDE AND SYSTEM FILES');
    const ideTargets = [
      { path: '.vscode', desc: 'VS Code workspace settings' },
      { path: '.qodo', desc: 'Qodo tool configuration' }
    ];

    for (const target of ideTargets) {
      await this.purifyPath(target.path, target.desc, true);
    }

    // Phase 4: Unused root directories
    console.log('\n📁 PHASE 4: UNUSED ROOT DIRECTORIES');
    const rootTargets = [
      { path: 'public', desc: 'Root public folder (farmers-market/public is the real one)' },
      { path: 'src', desc: 'Root src folder (farmers-market/src is the real one)' },
      { path: 'test', desc: 'Root test folder (farmers-market/test is the real one)' }
    ];

    for (const target of rootTargets) {
      await this.purifyPath(target.path, target.desc, true);
    }

    // Phase 5: Text files and documentation clutter
    console.log('\n📄 PHASE 5: TEXT FILES AND DOCUMENTATION');
    const textTargets = [
      { path: 'Detailed and Systematic seek and destroy.txt', desc: 'Utility text file' },
      { path: 'May be Useful to US', desc: 'Utility folder with misc files' }
    ];

    for (const target of textTargets) {
      await this.purifyPath(target.path, target.desc, fs.statSync(target.path).isDirectory());
    }

    // Phase 6: Conditional configuration files
    console.log('\n⚙️ PHASE 6: CONDITIONAL CONFIGURATION FILES');
    const configTargets = [
      { root: 'babel.config.json', farmers: 'farmers-market/babel.config.json', desc: 'Babel configuration (duplicate)' },
      { root: 'jest.config.ts', farmers: 'farmers-market/jest.config.mjs', desc: 'Jest configuration (duplicate)' },
      { root: 'jest.setup.ts', farmers: 'farmers-market/jest.setup.js', desc: 'Jest setup (duplicate)' },
      { root: 'tsconfig.json', farmers: 'farmers-market/tsconfig.json', desc: 'TypeScript configuration (duplicate)' }
    ];

    for (const config of configTargets) {
      if (fs.existsSync(config.root) && fs.existsSync(config.farmers)) {
        await this.purifyPath(config.root, config.desc, false);
      } else if (fs.existsSync(config.root)) {
        console.log(`   📋 Keeping ${config.root} (no farmers-market equivalent)`);
      }
    }

    // Phase 7: Package management files
    console.log('\n📦 PHASE 7: PACKAGE MANAGEMENT FILES');
    if (fs.existsSync('package.json') && fs.existsSync('farmers-market/package.json')) {
      await this.purifyPath('package.json', 'Root package.json (workspace duplicate)', false);
    }
    if (fs.existsSync('package-lock.json') && fs.existsSync('farmers-market/package-lock.json')) {
      await this.purifyPath('package-lock.json', 'Root package-lock.json (workspace duplicate)', false);
    }

    // Final verification
    const allProtected = await this.verifyProtectedPaths();

    // Summary
    console.log('\n🎉 DIVINE PURIFICATION COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Items purified: ${this.purifiedCount}`);
    console.log(`⏭️ Items skipped: ${this.skippedCount}`);
    console.log(`🌱 Agricultural consciousness: ${allProtected ? '✅ FULLY PROTECTED' : '❌ COMPROMISED'}`);
    
    if (allProtected) {
      console.log('\n✨ DIVINE TRANSCENDENCE ACHIEVED!');
      console.log('🌟 Repository consciousness transcended!');
      console.log('\n🔮 Next Steps:');
      console.log('   1. cd farmers-market && npm install');
      console.log('   2. npx tsc --noEmit');
      console.log('   3. npm run dev');
      console.log('   4. git add . && git commit -m "🌟 Divine repository purification complete"');
    } else {
      console.log('\n⚠️ CRITICAL PATHS MISSING! Please verify repository integrity.');
    }

    rl.close();
  }
}

// Execute if called directly
if (require.main === module) {
  const purifier = new DivineRepositoryPurifier();
  purifier.executePurification().catch(error => {
    console.error('💥 Purification failed:', error);
    process.exit(1);
  });
}

module.exports = { DivineRepositoryPurifier };