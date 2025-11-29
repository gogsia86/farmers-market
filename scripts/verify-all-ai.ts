#!/usr/bin/env ts-node
/**
 * 🚀 Dual AI Verification Script
 * Farmers Market Platform - OpenAI + Perplexity Pro Integration Test
 *
 * Tests both OpenAI and Perplexity API connections and validates configuration.
 * Run with: npx tsx scripts/verify-all-ai.ts
 */

import { OpenAI } from "openai";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// ============================================================================
// Configuration
// ============================================================================

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ============================================================================
// Colors for console output
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
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
  console.log(
    `\n${colors.bright}${colors.blue}${"=".repeat(70)}${colors.reset}`,
  );
  console.log(`${colors.bright}${colors.blue}${message}${colors.reset}`);
  console.log(
    `${colors.bright}${colors.blue}${"=".repeat(70)}${colors.reset}\n`,
  );
}

function subheader(message: string): void {
  console.log(`\n${colors.bright}${colors.magenta}${message}${colors.reset}`);
  console.log(
    `${colors.magenta}${"-".repeat(message.length)}${colors.reset}\n`,
  );
}

// ============================================================================
// Verification Results Tracker
// ============================================================================

interface TestResult {
  passed: boolean;
  message: string;
  details?: any;
}

const results = {
  openai: {
    configured: false,
    connected: false,
    tested: false,
  },
  perplexity: {
    configured: false,
    connected: false,
    tested: false,
  },
};

// ============================================================================
// OpenAI Verification
// ============================================================================

async function verifyOpenAI(): Promise<TestResult[]> {
  header("🤖 OpenAI API Verification");

  const testResults: TestResult[] = [];

  // Test 1: Check API Key
  subheader("1. Checking OpenAI API Key");
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    error("OPENAI_API_KEY not found in environment");
    testResults.push({
      passed: false,
      message: "OpenAI API key missing",
    });
    return testResults;
  }

  if (!openaiKey.startsWith("sk-")) {
    error('Invalid API key format. Should start with "sk-"');
    testResults.push({
      passed: false,
      message: "Invalid OpenAI API key format",
    });
    return testResults;
  }

  success("OpenAI API key found");
  info(`Key prefix: ${openaiKey.substring(0, 20)}...`);
  info(`Key length: ${openaiKey.length} characters`);
  results.openai.configured = true;
  testResults.push({
    passed: true,
    message: "OpenAI API key configured",
  });

  // Test 2: Connection Test
  subheader("2. Testing OpenAI Connection");

  try {
    const openai = new OpenAI({
      apiKey: openaiKey,
      timeout: 30000,
      maxRetries: 2,
    });

    info("Sending test completion request...");
    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for the Farmers Market Platform.",
        },
        {
          role: "user",
          content: 'Respond with: "OpenAI connection successful!"',
        },
      ],
      max_tokens: 50,
      temperature: 0,
    });

    const duration = Date.now() - startTime;

    if (response.choices && response.choices.length > 0) {
      success(`Connection successful! (${duration}ms)`);
      info(`Model: ${response.model}`);
      info(`Tokens: ${response.usage?.total_tokens || "N/A"}`);
      info(`Response: ${response.choices[0].message.content}`);

      results.openai.connected = true;
      testResults.push({
        passed: true,
        message: "OpenAI connection successful",
        details: {
          model: response.model,
          duration,
          tokens: response.usage?.total_tokens,
        },
      });
    }
  } catch (err: any) {
    error("Connection failed");

    if (err.status === 401) {
      error("Authentication failed - Invalid API key");
    } else if (err.status === 429) {
      error("Rate limit exceeded or quota reached");
    } else if (err.status === 500) {
      error("OpenAI service error");
    } else {
      error(`Error: ${err.message}`);
    }

    testResults.push({
      passed: false,
      message: "OpenAI connection failed",
      details: err.message,
    });
    return testResults;
  }

  // Test 3: Agricultural Intelligence Test
  subheader("3. Testing Agricultural Intelligence");

  try {
    const openai = new OpenAI({ apiKey: openaiKey });

    info("Testing agricultural AI capabilities...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an agricultural AI assistant for the Farmers Market Platform.
Provide farming insights with agricultural consciousness.`,
        },
        {
          role: "user",
          content: "What are 3 key benefits of crop rotation? Be brief.",
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    if (response.choices[0].message.content) {
      success("Agricultural intelligence test passed");
      console.log(`\n${colors.cyan}📝 Sample Response:${colors.reset}`);
      console.log(
        `${colors.cyan}${response.choices[0].message.content.substring(0, 200)}...${colors.reset}\n`,
      );

      results.openai.tested = true;
      testResults.push({
        passed: true,
        message: "OpenAI agricultural intelligence working",
      });
    }
  } catch (err: any) {
    warning("Agricultural test incomplete");
    testResults.push({
      passed: false,
      message: "OpenAI agricultural test failed",
      details: err.message,
    });
  }

  return testResults;
}

// ============================================================================
// Perplexity Verification
// ============================================================================

async function verifyPerplexity(): Promise<TestResult[]> {
  header("🔮 Perplexity Pro API Verification");

  const testResults: TestResult[] = [];

  // Test 1: Check API Key
  subheader("1. Checking Perplexity API Key");
  const perplexityKey = process.env.PERPLEXITY_API_KEY;

  if (!perplexityKey) {
    error("PERPLEXITY_API_KEY not found in environment");
    testResults.push({
      passed: false,
      message: "Perplexity API key missing",
    });
    return testResults;
  }

  if (!perplexityKey.startsWith("pplx-")) {
    warning(
      'API key format unusual. Perplexity keys typically start with "pplx-"',
    );
  }

  success("Perplexity API key found");
  info(`Key prefix: ${perplexityKey.substring(0, 15)}...`);
  info(`Key length: ${perplexityKey.length} characters`);
  results.perplexity.configured = true;
  testResults.push({
    passed: true,
    message: "Perplexity API key configured",
  });

  // Test 2: Connection Test
  subheader("2. Testing Perplexity Connection");

  try {
    info("Sending test query to Perplexity...");
    const startTime = Date.now();

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content:
              "What is sustainable agriculture? Provide a one-sentence definition.",
          },
        ],
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        stream: false,
      }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      error(`API Error (${response.status})`);

      if (response.status === 401) {
        error("Authentication failed - Invalid API key");
      } else if (response.status === 429) {
        error("Rate limit exceeded");
      }

      testResults.push({
        passed: false,
        message: "Perplexity connection failed",
        details: errorData,
      });
      return testResults;
    }

    const data = await response.json();

    success(`Connection successful! (${duration}ms)`);
    info(`Model: ${data.model}`);
    info(`Tokens: ${data.usage?.total_tokens || "N/A"}`);
    info(`Citations: ${data.citations?.length || 0}`);

    results.perplexity.connected = true;
    testResults.push({
      passed: true,
      message: "Perplexity connection successful",
      details: {
        model: data.model,
        duration,
        tokens: data.usage?.total_tokens,
        citations: data.citations?.length || 0,
      },
    });
  } catch (err: any) {
    error("Connection failed");
    error(`Error: ${err.message}`);

    testResults.push({
      passed: false,
      message: "Perplexity connection failed",
      details: err.message,
    });
    return testResults;
  }

  // Test 3: Agricultural Research Test
  subheader("3. Testing Agricultural Research with Citations");

  try {
    info("Testing agricultural research capabilities...");

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are an expert agricultural researcher. Provide evidence-based answers with citations.",
          },
          {
            role: "user",
            content:
              "What are the main benefits of organic farming? List 3 key benefits.",
          },
        ],
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: true,
        search_domain_filter: ["usda.gov", "agriculture.com", "extension.org"],
        search_recency_filter: "month",
        stream: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      success("Agricultural research test passed");

      console.log(`\n${colors.cyan}📝 Sample Response:${colors.reset}`);
      const content = data.choices[0]?.message?.content || "No content";
      console.log(
        `${colors.cyan}${content.substring(0, 300)}...${colors.reset}\n`,
      );

      if (data.citations && data.citations.length > 0) {
        info(`📚 Citations found: ${data.citations.length}`);
        console.log(
          `${colors.cyan}Sample citation: ${data.citations[0]}${colors.reset}\n`,
        );
      }

      if (data.related_questions && data.related_questions.length > 0) {
        info(`❓ Related questions: ${data.related_questions.length}`);
      }

      results.perplexity.tested = true;
      testResults.push({
        passed: true,
        message: "Perplexity agricultural research working",
        details: {
          citations: data.citations?.length || 0,
          relatedQuestions: data.related_questions?.length || 0,
        },
      });
    } else {
      warning("Agricultural research test incomplete");
      testResults.push({
        passed: false,
        message: "Perplexity research test failed",
      });
    }
  } catch (err: any) {
    warning("Agricultural research test incomplete");
    testResults.push({
      passed: false,
      message: "Perplexity research test failed",
      details: err.message,
    });
  }

  return testResults;
}

// ============================================================================
// Configuration Recommendations
// ============================================================================

function displayRecommendations(): void {
  header("💡 Configuration & Recommendations");

  console.log(`${colors.bright}OpenAI Models:${colors.reset}`);
  console.log("  • gpt-4o-mini: $0.15/1M tokens (development)");
  console.log("  • gpt-4o: $5.00/1M tokens (production)");
  console.log("  • Best for: General AI, code generation, analysis");
  console.log("");

  console.log(`${colors.bright}Perplexity Models:${colors.reset}`);
  console.log("  • sonar: Fast, cost-effective (standard)");
  console.log("  • sonar-pro: Advanced reasoning with Pro features");
  console.log("  • Best for: Real-time research, citations, up-to-date info");
  console.log("");

  console.log(
    `${colors.bright}Recommended Configuration (.env):${colors.reset}`,
  );
  console.log("  # OpenAI");
  console.log("  OPENAI_API_KEY=sk-proj-...");
  console.log("  OPENAI_MODEL=gpt-4o-mini  # or gpt-4o for production");
  console.log("");
  console.log("  # Perplexity");
  console.log("  PERPLEXITY_API_KEY=pplx-...");
  console.log("  PERPLEXITY_DEFAULT_MODEL=sonar-pro");
  console.log("");
  console.log("  # AI Features");
  console.log("  AI_ANALYSIS_ENABLED=true");
  console.log("  AGENT_ORCHESTRATION_ENABLED=true");
  console.log("  ML_PREDICTION_ENABLED=true");
  console.log("");

  console.log(`${colors.bright}Use Cases:${colors.reset}`);
  console.log("  OpenAI:");
  console.log("    ✓ Code generation & analysis");
  console.log("    ✓ Complex reasoning & planning");
  console.log("    ✓ Natural language processing");
  console.log("    ✓ Multi-agent orchestration");
  console.log("");
  console.log("  Perplexity Pro:");
  console.log("    ✓ Agricultural research with citations");
  console.log("    ✓ Real-time market data");
  console.log("    ✓ Latest farming techniques");
  console.log("    ✓ Evidence-based recommendations");
  console.log("");

  console.log(`${colors.bright}Cost Optimization:${colors.reset}`);
  console.log("  • Use gpt-4o-mini for development (20x cheaper)");
  console.log("  • Use Perplexity for research (includes web search)");
  console.log("  • Cache responses when possible");
  console.log("  • Set token limits appropriately");
  console.log("  • Monitor usage regularly");
  console.log("");
}

// ============================================================================
// Available Features
// ============================================================================

function displayAvailableFeatures(): void {
  header("🚀 Available AI Features");

  console.log(`${colors.bright}1. AI Failure Analyzer${colors.reset}`);
  console.log("   Location: src/lib/monitoring/ai/failure-analyzer.ts");
  console.log("   • Root cause identification (70-95% confidence)");
  console.log("   • Automated remediation suggestions");
  console.log("   • Performance predictions");
  console.log("");

  console.log(`${colors.bright}2. Multi-Agent Orchestration${colors.reset}`);
  console.log(
    "   Location: src/lib/monitoring/agents/workflow-agent-orchestrator.ts",
  );
  console.log("   • Collaborative AI workflows");
  console.log("   • Distributed problem solving");
  console.log("   • Consensus building");
  console.log("");

  console.log(`${colors.bright}3. Agricultural Intelligence${colors.reset}`);
  console.log("   Location: src/lib/ai/agent-config.ts");
  console.log("   • Farm operations analysis");
  console.log("   • Product recommendations");
  console.log("   • Seasonal awareness");
  console.log("");

  console.log(`${colors.bright}4. Agricultural Research Agent${colors.reset}`);
  console.log("   Location: src/lib/ai/perplexity.ts");
  console.log("   • Evidence-based research with citations");
  console.log("   • Real-time agricultural data");
  console.log("   • Domain-specific searches");
  console.log("");

  console.log(`${colors.bright}5. Code Generation Agent${colors.reset}`);
  console.log("   Location: src/lib/ai/perplexity.ts");
  console.log("   • Divine pattern implementation");
  console.log("   • Type-safe code generation");
  console.log("   • Best practices enforcement");
  console.log("");
}

// ============================================================================
// Final Summary
// ============================================================================

function displaySummary(): void {
  header("📊 Verification Summary");

  const openaiStatus =
    results.openai.configured &&
    results.openai.connected &&
    results.openai.tested
      ? `${colors.green}✅ FULLY OPERATIONAL${colors.reset}`
      : results.openai.configured && results.openai.connected
        ? `${colors.yellow}⚠️  PARTIALLY WORKING${colors.reset}`
        : `${colors.red}❌ NOT WORKING${colors.reset}`;

  const perplexityStatus =
    results.perplexity.configured &&
    results.perplexity.connected &&
    results.perplexity.tested
      ? `${colors.green}✅ FULLY OPERATIONAL${colors.reset}`
      : results.perplexity.configured && results.perplexity.connected
        ? `${colors.yellow}⚠️  PARTIALLY WORKING${colors.reset}`
        : `${colors.red}❌ NOT WORKING${colors.reset}`;

  console.log(`${colors.bright}OpenAI Status:${colors.reset} ${openaiStatus}`);
  console.log(`  • Configured: ${results.openai.configured ? "✅" : "❌"}`);
  console.log(`  • Connected: ${results.openai.connected ? "✅" : "❌"}`);
  console.log(`  • Tested: ${results.openai.tested ? "✅" : "❌"}`);
  console.log("");

  console.log(
    `${colors.bright}Perplexity Status:${colors.reset} ${perplexityStatus}`,
  );
  console.log(`  • Configured: ${results.perplexity.configured ? "✅" : "❌"}`);
  console.log(`  • Connected: ${results.perplexity.connected ? "✅" : "❌"}`);
  console.log(`  • Tested: ${results.perplexity.tested ? "✅" : "❌"}`);
  console.log("");

  const allPassed =
    results.openai.configured &&
    results.openai.connected &&
    results.perplexity.configured &&
    results.perplexity.connected;

  if (allPassed) {
    console.log(`${colors.green}${colors.bright}
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🎉 DUAL AI SYSTEM FULLY OPERATIONAL! 🎉                            ║
║                                                                        ║
║   Both OpenAI and Perplexity Pro are configured and working!         ║
║                                                                        ║
║   You now have access to:                                             ║
║   • OpenAI GPT-4o for advanced AI capabilities                       ║
║   • Perplexity Pro for real-time research & citations                ║
║   • Agricultural intelligence with divine consciousness              ║
║   • Multi-agent orchestration for complex workflows                  ║
║                                                                        ║
║   Next steps:                                                          ║
║   1. Run: npm run dev                                                  ║
║   2. Test AI features in your application                             ║
║   3. Monitor usage in respective dashboards                           ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bright}
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   ⚠️  PARTIAL SUCCESS - Some Issues Detected                         ║
║                                                                        ║
║   Please review the errors above and fix any issues.                 ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
${colors.reset}`);
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main(): Promise<void> {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🌾 Farmers Market Platform - Dual AI Verification 🌾               ║
║                                                                        ║
║   Divine Agricultural Intelligence Testing Tool                       ║
║   OpenAI + Perplexity Pro Integration Verification                   ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

  try {
    // Verify OpenAI
    const openaiResults = await verifyOpenAI();

    // Verify Perplexity
    const perplexityResults = await verifyPerplexity();

    // Display recommendations
    displayRecommendations();

    // Display available features
    displayAvailableFeatures();

    // Display summary
    displaySummary();

    // Exit code
    const allPassed =
      results.openai.configured &&
      results.openai.connected &&
      results.perplexity.configured &&
      results.perplexity.connected;

    process.exit(allPassed ? 0 : 1);
  } catch (error: any) {
    error("Unexpected error during verification");
    console.error(error);
    process.exit(1);
  }
}

// ============================================================================
// Execute
// ============================================================================

main();
