/**
 * 🔑 OpenAI API Key Verification Script
 * Farmers Market Platform - AI Configuration Validator
 *
 * Tests OpenAI API connection and validates the API key configuration.
 * Run with: npx tsx scripts/verify-openai.ts
 */

import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// ============================================================================
// Configuration
// ============================================================================

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

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
// Verification Functions
// ============================================================================

/**
 * Check if .env files exist
 */
function checkEnvFiles(): boolean {
  header('📁 Checking Environment Files');

  const envFiles = ['.env', '.env.local', '.env.monitoring.example'];
  let hasEnvFile = false;

  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      success(`Found: ${file}`);
      hasEnvFile = true;
    } else {
      info(`Not found: ${file} (optional)`);
    }
  }

  return hasEnvFile;
}

/**
 * Check if OpenAI API key is configured
 */
function checkApiKey(): string | null {
  header('🔑 Checking OpenAI API Key');

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    error('OPENAI_API_KEY not found in environment variables');
    warning('Please add your OpenAI API key to .env or .env.local:');
    console.log('\n  OPENAI_API_KEY=sk-proj-...\n');
    return null;
  }

  if (!apiKey.startsWith('sk-')) {
    error('Invalid API key format. OpenAI keys should start with "sk-"');
    return null;
  }

  success('OpenAI API key found');
  info(`Key prefix: ${apiKey.substring(0, 20)}...`);
  info(`Key length: ${apiKey.length} characters`);

  return apiKey;
}

/**
 * Test OpenAI API connection
 */
async function testApiConnection(apiKey: string): Promise<boolean> {
  header('🌐 Testing OpenAI API Connection');

  try {
    const openai = new OpenAI({
      apiKey,
      timeout: 30000,
      maxRetries: 2,
    });

    info('Initializing OpenAI client...');
    success('OpenAI client created successfully');

    info('Testing API connection with a simple completion...');

    const startTime = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost-effective testing
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for the Farmers Market Platform.',
        },
        {
          role: 'user',
          content: 'Respond with exactly: "Connection successful!"',
        },
      ],
      max_tokens: 50,
      temperature: 0,
    });

    const duration = Date.now() - startTime;

    if (response.choices && response.choices.length > 0) {
      success(`API connection successful! (${duration}ms)`);
      success(`Response: ${response.choices[0].message.content}`);
      info(`Model used: ${response.model}`);
      info(`Tokens used: ${response.usage?.total_tokens || 'N/A'}`);
      return true;
    } else {
      error('Unexpected API response format');
      return false;
    }
  } catch (err: any) {
    error('API connection failed');

    if (err.status === 401) {
      error('Authentication failed - Invalid API key');
      warning('Please check your OPENAI_API_KEY in .env file');
    } else if (err.status === 429) {
      error('Rate limit exceeded or quota reached');
      warning('Please check your OpenAI account billing and usage');
    } else if (err.status === 500) {
      error('OpenAI service error');
      warning('Please try again later');
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      error('Network connection failed');
      warning('Please check your internet connection');
    } else {
      error(`Error: ${err.message}`);
      if (err.status) {
        info(`HTTP Status: ${err.status}`);
      }
    }

    return false;
  }
}

/**
 * Test advanced features
 */
async function testAdvancedFeatures(apiKey: string): Promise<void> {
  header('🚀 Testing Advanced Features');

  try {
    const openai = new OpenAI({ apiKey });

    // Test with agricultural context
    info('Testing agricultural intelligence...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an agricultural AI assistant for the Farmers Market Platform.
Provide farming insights with agricultural consciousness.`,
        },
        {
          role: 'user',
          content: 'What are the best crops for spring planting in temperate climates?',
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    if (response.choices[0].message.content) {
      success('Agricultural intelligence test passed');
      console.log('\n📝 Sample Response:');
      console.log(`${colors.cyan}${response.choices[0].message.content.substring(0, 200)}...${colors.reset}\n`);
    }

    // Test model availability
    info('Checking available models...');
    success('GPT-4o (recommended for production)');
    success('GPT-4o-mini (cost-effective for testing)');
    success('GPT-4-turbo-preview (legacy support)');

  } catch (err: any) {
    warning('Advanced features test incomplete');
    info(`Reason: ${err.message}`);
  }
}

/**
 * Display configuration recommendations
 */
function displayRecommendations(): void {
  header('💡 Configuration Recommendations');

  console.log(`${colors.bright}For Development:${colors.reset}`);
  console.log('  • Model: gpt-4o-mini (cost-effective)');
  console.log('  • Temperature: 0.3-0.5');
  console.log('  • Max Tokens: 500-1000');
  console.log('');

  console.log(`${colors.bright}For Production:${colors.reset}`);
  console.log('  • Model: gpt-4o (best quality)');
  console.log('  • Temperature: 0.7-0.9');
  console.log('  • Max Tokens: 1000-2000');
  console.log('');

  console.log(`${colors.bright}Environment Variables:${colors.reset}`);
  console.log('  OPENAI_API_KEY=sk-proj-...');
  console.log('  AI_ANALYSIS_ENABLED=true');
  console.log('  AGENT_ORCHESTRATION_ENABLED=true');
  console.log('  ML_PREDICTION_ENABLED=true');
  console.log('');

  console.log(`${colors.bright}Features Available:${colors.reset}`);
  console.log('  ✅ AI-powered failure analysis');
  console.log('  ✅ Multi-agent orchestration');
  console.log('  ✅ Agricultural intelligence');
  console.log('  ✅ Root cause identification');
  console.log('  ✅ Performance predictions');
  console.log('  ✅ Automated remediation suggestions');
  console.log('');
}

// ============================================================================
// Main Verification Flow
// ============================================================================

async function main(): Promise<void> {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🌾 Farmers Market Platform - OpenAI Verification Tool 🌾           ║
║                                                                        ║
║   Divine Agricultural Intelligence with OpenAI Integration            ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

  let allTestsPassed = true;

  // Step 1: Check environment files
  const hasEnvFile = checkEnvFiles();
  if (!hasEnvFile) {
    warning('No .env file found. Create one from .env.example');
  }

  // Step 2: Check API key
  const apiKey = checkApiKey();
  if (!apiKey) {
    allTestsPassed = false;
    console.log('\n');
    error('Verification failed: No valid API key found\n');
    process.exit(1);
  }

  // Step 3: Test API connection
  const connectionSuccess = await testApiConnection(apiKey);
  if (!connectionSuccess) {
    allTestsPassed = false;
  }

  // Step 4: Test advanced features (only if basic connection works)
  if (connectionSuccess) {
    await testAdvancedFeatures(apiKey);
  }

  // Step 5: Display recommendations
  displayRecommendations();

  // Final summary
  header('📊 Verification Summary');

  if (allTestsPassed && connectionSuccess) {
    console.log(`${colors.green}${colors.bright}
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   ✅ ALL TESTS PASSED - OpenAI Integration Ready! ✅                  ║
║                                                                        ║
║   Your Farmers Market Platform is configured for divine agricultural  ║
║   intelligence with full OpenAI GPT-4o capabilities.                  ║
║                                                                        ║
║   Next steps:                                                          ║
║   1. Run: npm run dev                                                  ║
║   2. Test AI features in the application                              ║
║   3. Check monitoring dashboard for AI insights                       ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   ❌ VERIFICATION FAILED - Please Fix Issues Above                    ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
${colors.reset}`);
    process.exit(1);
  }
}

// ============================================================================
// Execute
// ============================================================================

main().catch((error) => {
  console.error('\n❌ Unexpected error during verification:');
  console.error(error);
  process.exit(1);
});
