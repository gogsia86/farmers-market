#!/usr/bin/env tsx
/**
 * 🤖 AI AGENT FRAMEWORK TEST SCRIPT
 * Farmers Market Platform - Divine Agricultural Intelligence Testing
 */

import * as path from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

// Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function log(msg: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function section(title: string) {
  console.log(`\n${"=".repeat(70)}`);
  log(`  ${title}`, "bright");
  console.log(`${"=".repeat(70)}\n`);
}

// Agent configs
const AGENTS: Record<
  string,
  { name: string; role: string; prompt: string; temp: number }
> = {
  farmAnalyst: {
    name: "FarmAnalyst",
    role: "Farm Operations & Analytics Expert",
    prompt:
      "You are a Farm Analyst AI. Analyze farm data and provide recommendations. Be concise.",
    temp: 0.3,
  },
  productCatalog: {
    name: "ProductCatalogManager",
    role: "Product & Inventory Expert",
    prompt:
      "You are a Product Catalog Manager AI. Generate product descriptions and pricing advice. Be engaging.",
    temp: 0.7,
  },
  orderProcessor: {
    name: "OrderProcessor",
    role: "Order & Logistics Expert",
    prompt:
      "You are an Order Processing AI. Validate orders and optimize delivery. Be precise.",
    temp: 0.4,
  },
  customerSupport: {
    name: "CustomerSupport",
    role: "Customer Service Expert",
    prompt:
      "You are a Customer Support AI for a farmers market. Be friendly and helpful.",
    temp: 0.6,
  },
};

// Test cases
const TESTS = [
  {
    name: "Farm Performance Analysis",
    agent: "farmAnalyst",
    prompt:
      "Analyze a 50-acre organic farm growing tomatoes and lettuce. Yield is 85%. Water usage is 15% above average. Suggest 3 improvements.",
  },
  {
    name: "Product Description",
    agent: "productCatalog",
    prompt:
      "Write a short product description for: Heirloom Cherokee Purple Tomatoes, organic, hand-picked, 2lb basket, from Sunrise Farm.",
  },
  {
    name: "Order Validation",
    agent: "orderProcessor",
    prompt:
      "Validate order: 3x Tomatoes ($8.99), 2x Eggs ($6.50). Total $39.97. Delivery Saturday 10am. Stock: 50 tomatoes, 25 eggs. Any issues?",
  },
  {
    name: "Customer Inquiry",
    agent: "customerSupport",
    prompt:
      "Customer asks: I'm new to farmers markets. What organic vegetables do you recommend for a family of 4 trying to eat healthier?",
  },
];

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  temp: number,
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: temp,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0]?.message?.content || "",
    tokens: data.usage?.total_tokens || 0,
  };
}

async function runTests() {
  section("🤖 AI AGENT FRAMEWORK TEST");

  if (!process.env.OPENAI_API_KEY) {
    log("❌ OPENAI_API_KEY not found!", "red");
    log("\nAdd your key to .env.local:", "yellow");
    log('  echo "OPENAI_API_KEY=sk-your-key" >> .env.local', "cyan");
    log("\nGet your key at: https://platform.openai.com/api-keys", "dim");
    process.exit(1);
  }

  log("✅ OpenAI API key found", "green");
  log("\n📋 Available Agents:", "bright");
  for (const [key, agent] of Object.entries(AGENTS)) {
    log(`   • ${agent.name} - ${agent.role}`, "white");
  }

  section("🧪 Running Tests");

  let passed = 0;
  let totalTokens = 0;
  const startTime = Date.now();

  for (const test of TESTS) {
    log(`\n🔄 ${test.name}`, "cyan");
    log(`   Agent: ${AGENTS[test.agent].name}`, "dim");

    try {
      const start = Date.now();
      const result = await callOpenAI(
        AGENTS[test.agent].prompt,
        test.prompt,
        AGENTS[test.agent].temp,
      );
      const duration = Date.now() - start;

      log(`   ✅ Success (${duration}ms, ${result.tokens} tokens)`, "green");

      // Show preview
      const preview = result.content.substring(0, 200).replace(/\n/g, " ");
      log(`   📝 ${preview}...`, "white");

      passed++;
      totalTokens += result.tokens;
    } catch (error) {
      log(
        `   ❌ Error: ${error instanceof Error ? error.message : "Unknown"}`,
        "red",
      );
    }

    // Rate limit delay
    await new Promise((r) => setTimeout(r, 500));
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  section("📊 RESULTS");
  log(
    `Tests: ${passed}/${TESTS.length} passed`,
    passed === TESTS.length ? "green" : "yellow",
  );
  log(`Duration: ${totalTime}s`, "blue");
  log(`Tokens used: ${totalTokens}`, "dim");
  log(`Est. cost: $${((totalTokens / 1000) * 0.005).toFixed(4)}`, "dim");

  if (passed === TESTS.length) {
    log("\n🎉 All agents working correctly!", "green");
  }
}

// Multi-agent test
async function runOrchestration() {
  section("🎭 MULTI-AGENT ORCHESTRATION");

  const scenario =
    "A farmer wants to launch organic purple carrots. Need farm assessment, product description, order planning, and customer messaging.";

  log(`Scenario: ${scenario}`, "cyan");

  for (const [key, agent] of Object.entries(AGENTS)) {
    log(`\n🤖 ${agent.name}:`, "bright");
    try {
      const result = await callOpenAI(
        agent.prompt,
        `${scenario}\n\nProvide your specific recommendation as a ${agent.role}.`,
        agent.temp,
      );
      log(`${result.content.substring(0, 300)}...`, "white");
    } catch (error) {
      log(
        `Error: ${error instanceof Error ? error.message : "Unknown"}`,
        "red",
      );
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
}

// Main
async function main() {
  console.log(colors.cyan);
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║  🤖 FARMERS MARKET - AI AGENT FRAMEWORK TESTER            ║");
  console.log("║  Divine Agricultural Intelligence                         ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log(colors.reset);

  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: npm run test:agents [options]

Options:
  --orchestrate, -o   Run multi-agent collaboration test
  --help, -h          Show this help
`);
    return;
  }

  if (args.includes("--orchestrate") || args.includes("-o")) {
    await runOrchestration();
  } else {
    await runTests();
  }
}

main().catch((e) => {
  log(`\n❌ Fatal: ${e.message}`, "red");
  process.exit(1);
});
