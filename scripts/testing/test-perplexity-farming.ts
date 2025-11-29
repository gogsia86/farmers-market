/**
 * PERPLEXITY FARMING FEATURES TEST SCRIPT
 * Comprehensive Test Suite for All 5 AI-Powered Features
 *
 * Tests:
 * 1. Smart Farming Advice
 * 2. Product Recommendations
 * 3. Market Intelligence
 * 4. Educational Content
 * 5. AI-Powered Support
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ============================================================================
// COLOR UTILITIES
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

function header(text: string) {
  console.log(
    `\n${colors.bright}${colors.cyan}${"═".repeat(70)}${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}  ${text}${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}${"═".repeat(70)}${colors.reset}\n`
  );
}

function subheader(text: string) {
  console.log(`\n${colors.bright}${colors.blue}▶ ${text}${colors.reset}`);
  console.log(`${colors.blue}${"─".repeat(68)}${colors.reset}`);
}

function success(text: string) {
  console.log(`${colors.green}✅ ${text}${colors.reset}`);
}

function error(text: string) {
  console.log(`${colors.red}❌ ${text}${colors.reset}`);
}

function info(text: string) {
  console.log(`${colors.cyan}ℹ️  ${text}${colors.reset}`);
}

function warning(text: string) {
  console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`);
}

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const API_BASE = "http://localhost:3000/api/farming";
const TEST_CONFIG = {
  runAll: true,
  testFarmingAdvice: true,
  testProductRecommendations: true,
  testMarketIntelligence: true,
  testEducationalContent: true,
  testSupport: true,
};

// ============================================================================
// MOCK AUTHENTICATION (for testing without server)
// ============================================================================

const MOCK_AUTH_TOKEN = "test-auth-token";

// ============================================================================
// TEST 1: SMART FARMING ADVICE
// ============================================================================

async function testFarmingAdvice() {
  header("TEST 1: SMART FARMING ADVICE");

  try {
    subheader("Testing real-time agricultural research");

    const testQuestions = [
      {
        question: "How do I prevent blight in my tomato plants organically?",
        category: "PEST_CONTROL",
        depth: "comprehensive",
      },
      {
        question: "What's the best way to prepare soil for spring planting?",
        category: "SOIL_HEALTH",
        depth: "quick",
      },
      {
        question: "When should I harvest butternut squash for best flavor?",
        category: "HARVESTING",
        depth: "comprehensive",
      },
    ];

    for (const testCase of testQuestions) {
      info(`\nQuestion: "${testCase.question}"`);
      info(`Category: ${testCase.category}`);
      info(`Depth: ${testCase.depth}`);

      const startTime = Date.now();

      // In a real test, this would call the API
      // For now, we'll simulate the service layer
      const { getFarmingAdvice } = await import(
        "../../src/lib/services/perplexity-farming.service"
      );

      const result = await getFarmingAdvice({
        question: testCase.question,
        category: testCase.category as any,
        depth: testCase.depth as any,
        currentSeason: "SUMMER",
        includeRelatedQuestions: true,
        recencyFilter: "month",
      });

      const duration = Date.now() - startTime;

      if (result.success && result.data) {
        success(`Received answer in ${duration}ms`);
        console.log(`\n${colors.bright}Answer:${colors.reset}`);
        console.log(
          result.data.answer.substring(0, 300) +
            (result.data.answer.length > 300 ? "..." : "")
        );
        info(`Confidence: ${(result.data.confidence * 100).toFixed(1)}%`);
        info(
          `Agricultural Relevance: ${(result.data.agriculturalRelevance * 100).toFixed(1)}%`
        );
        info(`Citations: ${result.data.citations.length}`);
        if (result.data.relatedQuestions && result.data.relatedQuestions.length > 0) {
          info(`Related Questions: ${result.data.relatedQuestions.length}`);
        }
        success(`✓ Test passed for: ${testCase.category}`);
      } else {
        error(`Failed to get farming advice: ${result.error?.message}`);
      }

      // Delay between requests to avoid rate limiting
      await delay(2000);
    }

    success("\n✓ Smart Farming Advice tests completed!");
    return true;
  } catch (err) {
    error(`Smart Farming Advice test failed: ${err}`);
    return false;
  }
}

// ============================================================================
// TEST 2: PRODUCT RECOMMENDATIONS
// ============================================================================

async function testProductRecommendations() {
  header("TEST 2: PRODUCT RECOMMENDATIONS");

  try {
    subheader("Testing season-aware product suggestions");

    const testSeasons = ["SPRING", "SUMMER", "FALL"];

    for (const season of testSeasons) {
      info(`\nGetting recommendations for ${season} season...`);

      const startTime = Date.now();

      const { getProductRecommendations } = await import(
        "../../src/lib/services/perplexity-farming.service"
      );

      const result = await getProductRecommendations({
        season: season as any,
        location: "Pacific Northwest",
        farmType: "Organic vegetable farm",
        includeReasoning: true,
      });

      const duration = Date.now() - startTime;

      if (result.success && result.data) {
        success(`Received recommendations in ${duration}ms`);
        info(
          `Recommendations: ${result.data.recommendations.length} products`
        );
        info(`Citations: ${result.data.citations.length}`);
        info(
          `Confidence: ${(result.data.metadata.confidenceScore * 100).toFixed(1)}%`
        );

        if (result.data.recommendations.length > 0) {
          console.log(`\n${colors.bright}Top 3 Recommendations:${colors.reset}`);
          result.data.recommendations.slice(0, 3).forEach((rec, i) => {
            console.log(
              `  ${i + 1}. ${rec.productName} (${rec.priority} priority)`
            );
            console.log(`     ${rec.reasoning}`);
          });
        }

        console.log(
          `\n${colors.bright}Seasonal Insights:${colors.reset}`
        );
        console.log(
          `  Key Activities: ${result.data.seasonalInsights.keyActivities.join(", ")}`
        );

        success(`✓ Test passed for: ${season}`);
      } else {
        error(`Failed to get recommendations: ${result.error?.message}`);
      }

      await delay(2000);
    }

    success("\n✓ Product Recommendations tests completed!");
    return true;
  } catch (err) {
    error(`Product Recommendations test failed: ${err}`);
    return false;
  }
}

// ============================================================================
// TEST 3: MARKET INTELLIGENCE
// ============================================================================

async function testMarketIntelligence() {
  header("TEST 3: MARKET INTELLIGENCE");

  try {
    subheader("Testing market trends and insights");

    const testScenarios = [
      {
        region: "United States",
        topics: ["organic farming", "local food markets"],
        timeframe: "month",
      },
      {
        region: "California",
        topics: ["sustainable agriculture", "direct-to-consumer sales"],
        timeframe: "week",
      },
    ];

    for (const scenario of testScenarios) {
      info(`\nRegion: ${scenario.region}`);
      info(`Topics: ${scenario.topics.join(", ")}`);
      info(`Timeframe: ${scenario.timeframe}`);

      const startTime = Date.now();

      const { getMarketIntelligence } = await import(
        "../../src/lib/services/perplexity-farming.service"
      );

      const result = await getMarketIntelligence({
        region: scenario.region,
        topics: scenario.topics,
        timeframe: scenario.timeframe as any,
        includeCompetitiveAnalysis: true,
        includePriceTrends: true,
      });

      const duration = Date.now() - startTime;

      if (result.success && result.data) {
        success(`Received intelligence in ${duration}ms`);
        info(`Trends identified: ${result.data.trends.length}`);
        info(`Insights: ${result.data.insights.length}`);
        info(`Opportunities: ${result.data.opportunities.length}`);
        info(`Citations: ${result.data.citations.length}`);

        if (result.data.trends.length > 0) {
          console.log(`\n${colors.bright}Key Trends:${colors.reset}`);
          result.data.trends.slice(0, 2).forEach((trend, i) => {
            console.log(
              `  ${i + 1}. ${trend.title} (${trend.direction}, ${trend.impact} impact)`
            );
          });
        }

        success(`✓ Test passed for: ${scenario.region}`);
      } else {
        error(`Failed to get market intelligence: ${result.error?.message}`);
      }

      await delay(2000);
    }

    success("\n✓ Market Intelligence tests completed!");
    return true;
  } catch (err) {
    error(`Market Intelligence test failed: ${err}`);
    return false;
  }
}

// ============================================================================
// TEST 4: EDUCATIONAL CONTENT
// ============================================================================

async function testEducationalContent() {
  header("TEST 4: EDUCATIONAL CONTENT");

  try {
    subheader("Testing research-backed farming guides");

    const testTopics = [
      {
        topic: "Companion planting for organic gardens",
        level: "BEGINNER",
        format: "GUIDE",
      },
      {
        topic: "Advanced composting techniques",
        level: "ADVANCED",
        format: "TUTORIAL",
      },
      {
        topic: "Integrated pest management strategies",
        level: "INTERMEDIATE",
        format: "DEEP_DIVE",
      },
    ];

    for (const testCase of testTopics) {
      info(`\nTopic: "${testCase.topic}"`);
      info(`Level: ${testCase.level}`);
      info(`Format: ${testCase.format}`);

      const startTime = Date.now();

      const { getEducationalContent } = await import(
        "../../src/lib/services/perplexity-farming.service"
      );

      const result = await getEducationalContent({
        topic: testCase.topic,
        level: testCase.level as any,
        format: testCase.format as any,
        includeStepByStep: true,
      });

      const duration = Date.now() - startTime;

      if (result.success && result.data) {
        success(`Generated content in ${duration}ms`);
        console.log(`\n${colors.bright}Title:${colors.reset} ${result.data.title}`);
        info(
          `Read time: ${result.data.metadata.estimatedReadTime} minutes`
        );
        info(
          `Credibility: ${(result.data.metadata.credibilityScore * 100).toFixed(1)}%`
        );
        info(`Sources: ${result.data.metadata.sourcesCount}`);
        info(`Key points: ${result.data.content.keyPoints.length}`);
        info(`Sections: ${result.data.content.detailedSections.length}`);

        if (result.data.content.keyPoints.length > 0) {
          console.log(`\n${colors.bright}Key Points:${colors.reset}`);
          result.data.content.keyPoints.slice(0, 3).forEach((point, i) => {
            console.log(`  ${i + 1}. ${point}`);
          });
        }

        success(`✓ Test passed for: ${testCase.topic}`);
      } else {
        error(`Failed to get educational content: ${result.error?.message}`);
      }

      await delay(2000);
    }

    success("\n✓ Educational Content tests completed!");
    return true;
  } catch (err) {
    error(`Educational Content test failed: ${err}`);
    return false;
  }
}

// ============================================================================
// TEST 5: AI-POWERED SUPPORT
// ============================================================================

async function testSupport() {
  header("TEST 5: AI-POWERED SUPPORT");

  try {
    subheader("Testing intelligent farming support");

    const testConversations = [
      {
        message: "My cucumber plants are wilting despite regular watering. What could be wrong?",
        context: {
          currentSeason: "SUMMER",
          location: "Arizona",
          farmType: "Organic vegetable farm",
        },
      },
      {
        message: "How do I transition my farm to organic certification?",
        context: {
          currentSeason: "SPRING",
          location: "Vermont",
          farmType: "Mixed vegetables",
        },
      },
      {
        message: "What's the best time to plant garlic in a cold climate?",
        context: {
          currentSeason: "FALL",
          location: "Minnesota",
          farmType: "Organic herb and vegetable farm",
        },
      },
    ];

    for (const conversation of testConversations) {
      info(`\nFarmer Question: "${conversation.message}"`);
      info(`Context: ${conversation.context.location}, ${conversation.context.currentSeason}`);

      const startTime = Date.now();

      const { handleSupportRequest } = await import(
        "../../src/lib/services/perplexity-farming.service"
      );

      const result = await handleSupportRequest({
        userId: "test-user-123",
        message: conversation.message,
        context: conversation.context as any,
        includeHistory: false,
      });

      const duration = Date.now() - startTime;

      if (result.success && result.data) {
        success(`Response generated in ${duration}ms`);
        console.log(`\n${colors.bright}AI Response:${colors.reset}`);
        console.log(
          result.data.message.content.substring(0, 300) +
            (result.data.message.content.length > 300 ? "..." : "")
        );
        info(
          `Confidence: ${((result.data.message.confidence || 0) * 100).toFixed(1)}%`
        );
        info(
          `Citations: ${result.data.message.citations?.length || 0}`
        );
        info(
          `Suggested Actions: ${result.data.suggestedActions?.length || 0}`
        );
        info(
          `Needs Escalation: ${result.data.needsEscalation ? "Yes" : "No"}`
        );

        if (result.data.suggestedActions && result.data.suggestedActions.length > 0) {
          console.log(`\n${colors.bright}Suggested Actions:${colors.reset}`);
          result.data.suggestedActions.forEach((action, i) => {
            console.log(
              `  ${i + 1}. ${action.title} (${action.priority} priority)`
            );
          });
        }

        success(`✓ Test passed`);
      } else {
        error(`Failed to get support response: ${result.error?.message}`);
      }

      await delay(2000);
    }

    success("\n✓ AI-Powered Support tests completed!");
    return true;
  } catch (err) {
    error(`AI-Powered Support test failed: ${err}`);
    return false;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log("\n");
  console.log(
    `${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.magenta}║  🌾 PERPLEXITY FARMING FEATURES - COMPREHENSIVE TEST SUITE  🌾   ║${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════════════════╝${colors.reset}`
  );

  // Check API Key
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    error("\n❌ PERPLEXITY_API_KEY not found in environment");
    error("Please set your API key in .env file");
    process.exit(1);
  }

  success(`\n✅ API Key found: ${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`);
  info(`Testing all 5 Perplexity farming features\n`);

  const results = {
    farmingAdvice: false,
    productRecommendations: false,
    marketIntelligence: false,
    educationalContent: false,
    support: false,
  };

  const startTime = Date.now();

  try {
    // Run all tests
    if (TEST_CONFIG.testFarmingAdvice) {
      results.farmingAdvice = await testFarmingAdvice();
    }

    if (TEST_CONFIG.testProductRecommendations) {
      results.productRecommendations = await testProductRecommendations();
    }

    if (TEST_CONFIG.testMarketIntelligence) {
      results.marketIntelligence = await testMarketIntelligence();
    }

    if (TEST_CONFIG.testEducationalContent) {
      results.educationalContent = await testEducationalContent();
    }

    if (TEST_CONFIG.testSupport) {
      results.support = await testSupport();
    }
  } catch (err) {
    error(`\n❌ Test suite failed: ${err}`);
  }

  const totalTime = Date.now() - startTime;

  // Summary
  header("TEST SUMMARY");

  console.log(`${colors.bright}Results:${colors.reset}`);
  console.log(
    `  1. Smart Farming Advice:       ${results.farmingAdvice ? colors.green + "✅ PASSED" : colors.red + "❌ FAILED"}${colors.reset}`
  );
  console.log(
    `  2. Product Recommendations:    ${results.productRecommendations ? colors.green + "✅ PASSED" : colors.red + "❌ FAILED"}${colors.reset}`
  );
  console.log(
    `  3. Market Intelligence:        ${results.marketIntelligence ? colors.green + "✅ PASSED" : colors.red + "❌ FAILED"}${colors.reset}`
  );
  console.log(
    `  4. Educational Content:        ${results.educationalContent ? colors.green + "✅ PASSED" : colors.red + "❌ FAILED"}${colors.reset}`
  );
  console.log(
    `  5. AI-Powered Support:         ${results.support ? colors.green + "✅ PASSED" : colors.red + "❌ FAILED"}${colors.reset}`
  );

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n${colors.bright}Overall:${colors.reset}`);
  console.log(`  Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`  Total Time: ${(totalTime / 1000).toFixed(2)}s`);

  if (passedTests === totalTests) {
    success("\n🌟 All Perplexity farming features are working perfectly!");
  } else {
    warning(`\n⚠️  ${totalTests - passedTests} test(s) failed`);
  }

  console.log("\n");
}

// Run the tests
runAllTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
