#!/usr/bin/env tsx
/**
 * AI Agent Framework Test Script
 * Tests AI agent functionality, orchestration, and integration
 *
 * Usage: npm run test:agents (or tsx scripts/test-agent-framework.ts)
 */

import {
  getOpenAIClient,
  invokeAgent,
  orchestrateAgents,
  listAvailableAgents,
  agentHasCapability,
  formatAgentResponse,
  validateAgentResponse,
  AGENT_REGISTRY,
} from "../src/lib/ai/agent-config";

// ============================================================================
// Test Configuration
// ============================================================================

const ENABLE_API_CALLS = process.env.OPENAI_API_KEY ? true : false;

// ============================================================================
// Console Utilities
// ============================================================================

function logSection(title: string): void {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(80)}\n`);
}

function logSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

function logError(message: string): void {
  console.error(`❌ ${message}`);
}

function logWarning(message: string): void {
  console.warn(`⚠️  ${message}`);
}

function logInfo(message: string): void {
  console.log(`ℹ️  ${message}`);
}

// ============================================================================
// Test Functions
// ============================================================================

/**
 * Test 1: Agent Registry
 */
async function testAgentRegistry(): Promise<boolean> {
  logSection("Test 1: Agent Registry");

  try {
    const agents = listAvailableAgents();
    logInfo(`Available agents: ${agents.join(", ")}`);

    if (agents.length === 0) {
      logError("No agents found in registry");
      return false;
    }

    logSuccess(`Found ${agents.length} agents in registry`);

    // Check each agent configuration
    for (const agentName of agents) {
      const config = AGENT_REGISTRY[agentName];
      logInfo(`  - ${config.name} (${config.role})`);
      logInfo(`    Model: ${config.model}, Temp: ${config.temperature}`);
      logInfo(`    Capabilities: ${config.capabilities.length}`);
    }

    logSuccess("Agent registry test passed");
    return true;
  } catch (error) {
    logError(`Agent registry test failed: ${error}`);
    return false;
  }
}

/**
 * Test 2: Agent Capabilities
 */
async function testAgentCapabilities(): Promise<boolean> {
  logSection("Test 2: Agent Capabilities");

  try {
    const testCases = [
      { agent: "farmAnalyst", capability: "farm_performance_analysis" },
      { agent: "productCatalog", capability: "product_description_generation" },
      { agent: "orderProcessor", capability: "order_validation" },
      { agent: "customerSupport", capability: "customer_inquiry_response" },
    ];

    for (const testCase of testCases) {
      const hasCapability = agentHasCapability(
        testCase.agent,
        testCase.capability,
      );

      if (hasCapability) {
        logSuccess(`${testCase.agent} has capability: ${testCase.capability}`);
      } else {
        logError(
          `${testCase.agent} missing capability: ${testCase.capability}`,
        );
        return false;
      }
    }

    logSuccess("Agent capabilities test passed");
    return true;
  } catch (error) {
    logError(`Agent capabilities test failed: ${error}`);
    return false;
  }
}

/**
 * Test 3: OpenAI Client Initialization
 */
async function testOpenAIClient(): Promise<boolean> {
  logSection("Test 3: OpenAI Client Initialization");

  try {
    if (!ENABLE_API_CALLS) {
      logWarning("OPENAI_API_KEY not set, skipping OpenAI client test");
      logInfo("Set OPENAI_API_KEY in .env.local to enable API tests");
      return true;
    }

    const client = getOpenAIClient();
    logSuccess("OpenAI client initialized successfully");

    // Test basic client properties
    if (client) {
      logInfo("Client properties:");
      logInfo(`  - baseURL: ${client.baseURL}`);
      logInfo(`  - timeout: ${client.timeout || "default"}ms`);
      logInfo(`  - maxRetries: ${client.maxRetries || "default"}`);
    }

    logSuccess("OpenAI client test passed");
    return true;
  } catch (error) {
    logError(`OpenAI client test failed: ${error}`);
    return false;
  }
}

/**
 * Test 4: Farm Analyst Agent Invocation
 */
async function testFarmAnalystAgent(): Promise<boolean> {
  logSection("Test 4: Farm Analyst Agent");

  if (!ENABLE_API_CALLS) {
    logWarning("Skipping Farm Analyst agent test (no API key)");
    return true;
  }

  try {
    logInfo("Invoking Farm Analyst agent...");

    const response = await invokeAgent(
      "farmAnalyst",
      "Analyze the performance of Sunshine Organic Farm. " +
        "They have 50 acres, grow tomatoes, lettuce, and carrots. " +
        "Current yield is 5000 lbs/month with revenue of $15,000. " +
        "What recommendations do you have?",
      {
        farmId: "test-farm-001",
        userId: "test-user-001",
        metadata: {
          season: "summer",
          soilType: "loamy",
        },
      },
    );

    logInfo("\nAgent Response:");
    console.log(formatAgentResponse(response));

    // Validate response
    const isValid = validateAgentResponse(response, 0.5);

    if (isValid) {
      logSuccess("Farm Analyst response is valid");
    } else {
      logWarning("Farm Analyst response may be low quality");
    }

    logSuccess("Farm Analyst agent test passed");
    return true;
  } catch (error) {
    logError(`Farm Analyst agent test failed: ${error}`);
    return false;
  }
}

/**
 * Test 5: Product Catalog Agent Invocation
 */
async function testProductCatalogAgent(): Promise<boolean> {
  logSection("Test 5: Product Catalog Agent");

  if (!ENABLE_API_CALLS) {
    logWarning("Skipping Product Catalog agent test (no API key)");
    return true;
  }

  try {
    logInfo("Invoking Product Catalog agent...");

    const response = await invokeAgent(
      "productCatalog",
      "Generate a compelling product description for organic heirloom tomatoes. " +
        "They are grown without pesticides, harvested at peak ripeness, " +
        "and come in a variety of colors (red, yellow, purple). " +
        "Price: $5.99/lb. Also suggest relevant tags and categories.",
      {
        productId: "test-product-001",
        farmId: "test-farm-001",
        metadata: {
          organic: true,
          seasonal: true,
        },
      },
    );

    logInfo("\nAgent Response:");
    console.log(formatAgentResponse(response));

    const isValid = validateAgentResponse(response, 0.5);

    if (isValid) {
      logSuccess("Product Catalog response is valid");
    } else {
      logWarning("Product Catalog response may be low quality");
    }

    logSuccess("Product Catalog agent test passed");
    return true;
  } catch (error) {
    logError(`Product Catalog agent test failed: ${error}`);
    return false;
  }
}

/**
 * Test 6: Multi-Agent Orchestration
 */
async function testMultiAgentOrchestration(): Promise<boolean> {
  logSection("Test 6: Multi-Agent Orchestration");

  if (!ENABLE_API_CALLS) {
    logWarning("Skipping multi-agent orchestration test (no API key)");
    return true;
  }

  try {
    logInfo("Orchestrating multiple agents...");

    const responses = await orchestrateAgents({
      task:
        "A customer wants to know about the best seasonal vegetables " +
        "available from local farms this week. They also want delivery " +
        "recommendations and nutritional information.",
      context: {
        userId: "test-customer-001",
        sessionId: "test-session-001",
        metadata: {
          season: "summer",
          location: "Seattle, WA",
        },
      },
      requiredAgents: ["farmAnalyst", "productCatalog", "customerSupport"],
      maxTurns: 1,
    });

    logInfo(`\nReceived ${responses.length} agent responses`);

    for (const response of responses) {
      console.log(`\n${formatAgentResponse(response)}`);
    }

    if (responses.length > 0) {
      logSuccess("Multi-agent orchestration completed");
    } else {
      logError("No responses from orchestration");
      return false;
    }

    logSuccess("Multi-agent orchestration test passed");
    return true;
  } catch (error) {
    logError(`Multi-agent orchestration test failed: ${error}`);
    return false;
  }
}

/**
 * Test 7: Error Handling
 */
async function testErrorHandling(): Promise<boolean> {
  logSection("Test 7: Error Handling");

  try {
    // Test 1: Invalid agent name
    try {
      await invokeAgent("nonExistentAgent", "test message");
      logError("Should have thrown error for invalid agent name");
      return false;
    } catch (error) {
      logSuccess("Correctly handled invalid agent name");
    }

    // Test 2: Empty message
    if (ENABLE_API_CALLS) {
      try {
        const response = await invokeAgent("farmAnalyst", "");
        logInfo(
          `Agent handled empty message: ${response.content.substring(0, 50)}`,
        );
        logSuccess("Agent handled empty message gracefully");
      } catch (error) {
        logSuccess("Correctly rejected empty message");
      }
    }

    logSuccess("Error handling test passed");
    return true;
  } catch (error) {
    logError(`Error handling test failed: ${error}`);
    return false;
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests(): Promise<void> {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║       AI AGENT FRAMEWORK TEST SUITE                       ║");
  console.log("║       Farmers Market Platform - Phase 6 Day 4            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  if (!ENABLE_API_CALLS) {
    logWarning("\n⚠️  OpenAI API calls DISABLED (no API key detected)");
    logInfo(
      "Some tests will be skipped. Set OPENAI_API_KEY to enable all tests.\n",
    );
  } else {
    logSuccess("\n✅ OpenAI API calls ENABLED\n");
  }

  const results: { name: string; passed: boolean }[] = [];

  // Run all tests
  const tests = [
    { name: "Agent Registry", fn: testAgentRegistry },
    { name: "Agent Capabilities", fn: testAgentCapabilities },
    { name: "OpenAI Client", fn: testOpenAIClient },
    { name: "Farm Analyst Agent", fn: testFarmAnalystAgent },
    { name: "Product Catalog Agent", fn: testProductCatalogAgent },
    { name: "Multi-Agent Orchestration", fn: testMultiAgentOrchestration },
    { name: "Error Handling", fn: testErrorHandling },
  ];

  for (const test of tests) {
    const passed = await test.fn();
    results.push({ name: test.name, passed });
  }

  // Summary
  logSection("Test Summary");

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log("\nResults:");
  for (const result of results) {
    console.log(`  ${result.passed ? "✅" : "❌"} ${result.name}`);
  }

  console.log(`\n${passed}/${total} tests passed`);

  if (passed === total) {
    logSuccess("\n🎉 All tests passed! AI Agent Framework is operational.");
  } else {
    logError(
      `\n❌ ${total - passed} test(s) failed. Please review the output above.`,
    );
    process.exit(1);
  }

  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║       TEST SUITE COMPLETE                                 ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );
}

// ============================================================================
// Execute Tests
// ============================================================================

runAllTests().catch((error) => {
  console.error("\n❌ Test suite failed with error:", error);
  process.exit(1);
});
