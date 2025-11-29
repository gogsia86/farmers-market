#!/usr/bin/env ts-node
/**
 * 🔧 OpenAI API Key Setup Script
 * Farmers Market Platform - Interactive Configuration Tool
 *
 * Helps you add your OpenAI API key to the environment configuration.
 * Run with: npx tsx scripts/setup-openai.ts
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Colors for console output
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function success(message: string): void {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function error(message: string): void {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function warning(message: string): void {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function info(message: string): void {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function header(message: string): void {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${message}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
}

// ============================================================================
// Input Helper
// ============================================================================

function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });
}

// ============================================================================
// Validation
// ============================================================================

function validateApiKey(key: string): { valid: boolean; message?: string } {
  if (!key) {
    return { valid: false, message: 'API key cannot be empty' };
  }

  if (!key.startsWith('sk-')) {
    return {
      valid: false,
      message: 'Invalid format. OpenAI keys should start with "sk-" or "sk-proj-"'
    };
  }

  if (key.length < 20) {
    return { valid: false, message: 'API key seems too short' };
  }

  return { valid: true };
}

// ============================================================================
// File Operations
// ============================================================================

function checkEnvFile(filename: string): boolean {
  const filePath = path.resolve(process.cwd(), filename);
  return fs.existsSync(filePath);
}

function readEnvFile(filename: string): string {
  const filePath = path.resolve(process.cwd(), filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return '';
}

function writeEnvFile(filename: string, content: string): void {
  const filePath = path.resolve(process.cwd(), filename);
  fs.writeFileSync(filePath, content, 'utf-8');
}

function backupEnvFile(filename: string): void {
  const filePath = path.resolve(process.cwd(), filename);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupPath = path.resolve(process.cwd(), `${filename}.backup.${timestamp}`);

  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    info(`Backup created: ${filename}.backup.${timestamp}`);
  }
}

function updateOrAddEnvVariable(content: string, key: string, value: string): string {
  const lines = content.split('\n');
  let found = false;

  const updatedLines = lines.map(line => {
    const trimmedLine = line.trim();

    // Check if this line sets the OPENAI_API_KEY
    if (trimmedLine.startsWith(key) || trimmedLine.startsWith(`# ${key}`)) {
      found = true;
      return `${key}=${value}`;
    }

    return line;
  });

  // If not found, add it
  if (!found) {
    // Find a good place to add it (after comments or at the end)
    const insertIndex = updatedLines.findIndex(line =>
      line.trim() && !line.trim().startsWith('#')
    );

    if (insertIndex > 0) {
      updatedLines.splice(insertIndex, 0, '', '# OpenAI Configuration', `${key}=${value}`);
    } else {
      updatedLines.push('', '# OpenAI Configuration', `${key}=${value}`);
    }
  }

  return updatedLines.join('\n');
}

// ============================================================================
// Main Setup Flow
// ============================================================================

async function main(): Promise<void> {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🔧 Farmers Market Platform - OpenAI Setup Wizard 🔧                ║
║                                                                        ║
║   Divine Agricultural Intelligence Configuration                      ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

  const rl = createInterface();

  try {
    // Step 1: Welcome and Instructions
    header('📋 Setup Instructions');
    console.log('This wizard will help you configure your OpenAI API key.');
    console.log('');
    console.log('You will need:');
    console.log('  1. An OpenAI account (https://platform.openai.com)');
    console.log('  2. An API key from your OpenAI dashboard');
    console.log('');

    const ready = await question(rl, `${colors.cyan}Ready to continue? (y/n): ${colors.reset}`);
    if (ready.toLowerCase() !== 'y' && ready.toLowerCase() !== 'yes') {
      console.log('\nSetup cancelled.');
      process.exit(0);
    }

    // Step 2: Check for existing configuration
    header('🔍 Checking Existing Configuration');

    const hasEnv = checkEnvFile('.env');
    const hasEnvLocal = checkEnvFile('.env.local');

    if (hasEnv) {
      success('Found .env file');
    } else {
      warning('.env file not found (will be created)');
    }

    if (hasEnvLocal) {
      info('Found .env.local file');
    }

    const envContent = readEnvFile('.env');
    const hasExistingKey = envContent.includes('OPENAI_API_KEY=sk-');

    if (hasExistingKey) {
      warning('OpenAI API key already configured in .env');
      const overwrite = await question(
        rl,
        `${colors.yellow}Do you want to update it? (y/n): ${colors.reset}`
      );

      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('\nSetup cancelled. Existing key preserved.');
        process.exit(0);
      }
    }

    // Step 3: Get API Key
    header('🔑 Enter Your OpenAI API Key');
    console.log('Get your API key from: https://platform.openai.com/api-keys');
    console.log('');
    console.log('Your key should look like:');
    console.log(`  ${colors.cyan}sk-proj-...${colors.reset} (new format)`);
    console.log(`  ${colors.cyan}sk-...${colors.reset} (legacy format)`);
    console.log('');

    let apiKey = '';
    let valid = false;

    while (!valid) {
      apiKey = await question(rl, `${colors.green}Paste your API key: ${colors.reset}`);

      const validation = validateApiKey(apiKey);

      if (validation.valid) {
        valid = true;
        success('API key format looks good!');
      } else {
        error(validation.message || 'Invalid API key');
        const retry = await question(rl, `${colors.yellow}Try again? (y/n): ${colors.reset}`);
        if (retry.toLowerCase() !== 'y' && retry.toLowerCase() !== 'yes') {
          console.log('\nSetup cancelled.');
          process.exit(0);
        }
      }
    }

    // Step 4: Choose file
    header('📁 Configuration File');
    console.log('Where should we save the API key?');
    console.log('');
    console.log('  1. .env (recommended for local development)');
    console.log('  2. .env.local (alternative, gitignored by default)');
    console.log('');

    const fileChoice = await question(rl, `${colors.cyan}Choose (1 or 2): ${colors.reset}`);
    const targetFile = fileChoice === '2' ? '.env.local' : '.env';

    // Step 5: Backup and Update
    header('💾 Updating Configuration');

    if (checkEnvFile(targetFile)) {
      backupEnvFile(targetFile);
    }

    const currentContent = readEnvFile(targetFile);
    const updatedContent = updateOrAddEnvVariable(currentContent, 'OPENAI_API_KEY', apiKey);

    writeEnvFile(targetFile, updatedContent);
    success(`OpenAI API key added to ${targetFile}`);

    // Step 6: Add additional configuration
    console.log('');
    const addMore = await question(
      rl,
      `${colors.cyan}Configure additional AI settings? (y/n): ${colors.reset}`
    );

    if (addMore.toLowerCase() === 'y' || addMore.toLowerCase() === 'yes') {
      let finalContent = readEnvFile(targetFile);

      // AI Features
      if (!finalContent.includes('AI_ANALYSIS_ENABLED')) {
        finalContent += '\n# AI Features\nAI_ANALYSIS_ENABLED=true\n';
      }
      if (!finalContent.includes('AGENT_ORCHESTRATION_ENABLED')) {
        finalContent += 'AGENT_ORCHESTRATION_ENABLED=true\n';
      }
      if (!finalContent.includes('ML_PREDICTION_ENABLED')) {
        finalContent += 'ML_PREDICTION_ENABLED=true\n';
      }
      if (!finalContent.includes('SELF_HEALING_ENABLED')) {
        finalContent += 'SELF_HEALING_ENABLED=true\n';
      }

      // Model Configuration
      if (!finalContent.includes('OPENAI_MODEL')) {
        console.log('');
        console.log('Choose OpenAI model:');
        console.log('  1. gpt-4o (best quality, production)');
        console.log('  2. gpt-4o-mini (cost-effective, development)');
        const modelChoice = await question(rl, `${colors.cyan}Choose (1 or 2): ${colors.reset}`);
        const model = modelChoice === '1' ? 'gpt-4o' : 'gpt-4o-mini';

        finalContent += `\n# Model Configuration\nOPENAI_MODEL=${model}\n`;
        finalContent += 'OPENAI_TEMPERATURE=0.7\n';
        finalContent += 'OPENAI_MAX_TOKENS=2000\n';
      }

      // Tracing
      if (!finalContent.includes('TRACING_ENABLED')) {
        finalContent += '\n# Tracing\nTRACING_ENABLED=true\n';
      }

      writeEnvFile(targetFile, finalContent);
      success('Additional AI settings configured');
    }

    // Step 7: Verify Installation
    header('✅ Verification');
    console.log('Configuration complete! Next steps:');
    console.log('');
    console.log(`  ${colors.green}1. Verify setup:${colors.reset}`);
    console.log('     npx tsx scripts/verify-openai.ts');
    console.log('');
    console.log(`  ${colors.green}2. Start development:${colors.reset}`);
    console.log('     npm run dev');
    console.log('');
    console.log(`  ${colors.green}3. Check documentation:${colors.reset}`);
    console.log('     docs/AI_SETUP_GUIDE.md');
    console.log('');

    const verify = await question(
      rl,
      `${colors.cyan}Run verification now? (y/n): ${colors.reset}`
    );

    rl.close();

    if (verify.toLowerCase() === 'y' || verify.toLowerCase() === 'yes') {
      console.log('');
      header('🔍 Running Verification');

      // Import and run verification
      const { spawn } = require('child_process');
      const verifyProcess = spawn('npx', ['tsx', 'scripts/verify-openai.ts'], {
        stdio: 'inherit',
        shell: true
      });

      verifyProcess.on('close', (code: number) => {
        if (code === 0) {
          console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🎉 Setup Complete! Your Platform is Ready! 🎉                      ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);
        } else {
          warning('Verification had issues. Please check the output above.');
        }
      });
    } else {
      console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   ✅ Setup Complete! ✅                                               ║
║                                                                        ║
║   Your OpenAI API key has been configured.                            ║
║   Run verification when ready: npx tsx scripts/verify-openai.ts       ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);
    }

  } catch (error: any) {
    error(`Setup failed: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// ============================================================================
// Execute
// ============================================================================

main().catch((err) => {
  console.error('\n❌ Unexpected error:');
  console.error(err);
  process.exit(1);
});
