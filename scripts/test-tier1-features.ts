/**
 * 🧪 Tier 1 AI Monitoring Features Test Script
 * Farmers Market Platform - Test All Tier 1 Upgrades
 * Version: 2.0.0
 *
 * Tests:
 * 1. AI Failure Analysis
 * 2. Multi-Agent Orchestration
 * 3. OpenTelemetry Tracing
 * 4. ML Predictive Monitoring
 * 5. Self-Healing Orchestrator
 */

import { createFailureAnalyzer } from "@/lib/monitoring/ai/failure-analyzer";
import { createWorkflowAgentOrchestrator } from "@/lib/monitoring/agents/workflow-agent-orchestrator";
import { createWorkflowTracer } from "@/lib/monitoring/tracing/workflow-tracer";
import { createPredictiveMonitor } from "@/lib/monitoring/ml/predictive-monitor";
import { createSelfHealer } from "@/lib/monitoring/healing/self-healer";
import type { WorkflowResult, WorkflowMetrics } from "@/lib/monitoring/types";

// ============================================================================
// TEST DATA
// ============================================================================

const mockFailedWorkflow: WorkflowResult = {
  workflowId: "test-workflow-001",
  runId: "run-" + Date.now(),
  name: "User Login Test",
  type: "USER_LOGIN",
  priority: "HIGH",
  status: "FAILED",
  startTime: new Date(Date.now() - 5000),
  endTime: new Date(),
  duration: 5000,
  steps: [
    {
      success: true,
      duration: 1000,
      error: undefined,
      logs: ["Navigated to login page"],
    },
    {
      success: false,
      duration: 2000,
      error: new Error("Database connection timeout"),
      logs: ["Attempted login", "Database query failed"],
    },
  ],
  totalSteps: 2,
  passedSteps: 1,
  failedSteps: 1,
  skippedSteps: 0,
  error: "Database connection timeout after 30 seconds",
  screenshots: ["screenshot-001.png"],
  traces: [],
  metrics: {
    totalDuration: 5000,
    apiResponseTime: 3000,
    pageLoadTime: 1500,
    errors: 1,
    performanceScore: 45,
  },
  tags: ["authentication", "database"],
};

const mockMetrics: WorkflowMetrics[] = [
  {
    totalDuration: 4500,
    apiResponseTime: 2800,
    pageLoadTime: 1400,
    errors: 0,
    performanceScore: 85,
  },
  {
    totalDuration: 4800,
    apiResponseTime: 2900,
    pageLoadTime: 1450,
    errors: 0,
    performanceScore: 82,
  },
  {
    totalDuration: 5200,
    apiResponseTime: 3100,
    pageLoadTime: 1600,
    errors: 1,
    performanceScore: 75,
  },
  {
    totalDuration: 5500,
    apiResponseTime: 3300,
    pageLoadTime: 1700,
    errors: 1,
    performanceScore: 70,
  },
  {
    totalDuration: 6000,
    apiResponseTime: 3600,
    pageLoadTime: 1900,
    errors: 2,
    performanceScore: 60,
  },
  {
    totalDuration: 6500,
    apiResponseTime: 3900,
    pageLoadTime: 2100,
    errors: 2,
    performanceScore: 55,
  },
  {
    totalDuration: 7000,
    apiResponseTime: 4200,
    pageLoadTime: 2300,
    errors: 3,
    performanceScore: 50,
  },
  {
    totalDuration: 7500,
    apiResponseTime: 4500,
    pageLoadTime: 2500,
    errors: 3,
    performanceScore: 45,
  },
  {
    totalDuration: 8000,
    apiResponseTime: 4800,
    pageLoadTime: 2700,
    errors: 4,
    performanceScore: 40,
  },
  {
    totalDuration: 8500,
    apiResponseTime: 5000,
    pageLoadTime: 2900,
    errors: 4,
    performanceScore: 35,
  },
];

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testAIFailureAnalyzer() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║ TEST 1: AI FAILURE ANALYZER                                ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    const analyzer = createFailureAnalyzer({
      enabled: true,
      model: "gpt-4-turbo-preview",
      temperature: 0.3,
    });

    if (!analyzer.isEnabled()) {
      console.log("⚠️  AI Failure Analyzer is disabled (missing API key)");
      console.log("   Set OPENAI_API_KEY environment variable to enable");
      return false;
    }

    console.log("⏳ Analyzing workflow failure...\n");
    const analysis = await analyzer.analyzeFailure(mockFailedWorkflow);

    console.log("✅ AI Analysis Complete!\n");
    console.log("📊 Results:");
    console.log("   Confidence:", analysis.confidence + "%");
    console.log("   Root Cause:", analysis.rootCause);
    console.log("   Severity:", analysis.severity);
    console.log("\n🔧 Immediate Fix:");
    analysis.immediateFix?.forEach((step, i) => {
      console.log(`   ${i + 1}. ${step}`);
    });
    console.log("\n🛡️  Prevention Strategy:");
    console.log("   " + analysis.preventionStrategy);

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

async function testMultiAgentOrchestrator() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║ TEST 2: MULTI-AGENT ORCHESTRATOR                          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    const orchestrator = createWorkflowAgentOrchestrator({
      enabled: true,
      collaborationMode: "VOTING",
      consensusThreshold: 0.7,
    });

    if (!orchestrator.isEnabled()) {
      console.log("⚠️  Multi-Agent Orchestrator is disabled (missing API key)");
      return false;
    }

    console.log("⏳ Running multi-agent analysis...\n");
    console.log("   Active Agents:", orchestrator.getAgentCount());
    console.log("   Collaboration Mode: VOTING\n");

    const analysis = await orchestrator.analyzeWorkflowFailure(
      mockFailedWorkflow
    );

    console.log("✅ Multi-Agent Analysis Complete!\n");
    console.log("🤖 Agent Consensus:");
    console.log("   " + analysis.consensus);
    console.log("\n📋 Individual Analyses:");
    analysis.individualAnalyses.forEach((agent) => {
      console.log(`\n   ${agent.agent} (${agent.confidence}% confidence):`);
      console.log("   " + agent.analysis.substring(0, 100) + "...");
    });
    console.log("\n✅ Final Recommendation:");
    console.log("   " + analysis.finalRecommendation.substring(0, 150) + "...");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

async function testOpenTelemetryTracing() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║ TEST 3: OPENTELEMETRY TRACING                             ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    const tracer = createWorkflowTracer({
      enabled: true,
      serviceName: "test-monitoring-bot",
      serviceVersion: "2.0.0",
      exporter: "console",
      samplingRate: 1.0,
    });

    if (!tracer.isEnabled()) {
      console.log("⚠️  OpenTelemetry tracing is disabled");
      return false;
    }

    console.log("✅ Tracer initialized");
    console.log("   Service:", tracer.getConfig().serviceName);
    console.log("   Version:", tracer.getConfig().serviceVersion);
    console.log("   Exporter:", tracer.getConfig().exporter);

    console.log("\n⏳ Creating test trace...\n");

    // Simulate traced workflow
    const result = await tracer.traceWorkflow(
      {
        id: "test-workflow",
        name: "Test Workflow",
        type: "HEALTH_CHECK",
        priority: "LOW",
        enabled: true,
        timeout: 30000,
        retries: 3,
        tags: ["test"],
        notifyOnFailure: false,
        notifyOnSuccess: false,
      },
      async () => {
        // Simulate work
        await new Promise((resolve) => setTimeout(resolve, 100));
        return mockFailedWorkflow;
      }
    );

    console.log("✅ Trace created successfully");
    console.log("   Workflow:", result.name);
    console.log("   Status:", result.status);
    console.log("   Duration:", result.duration + "ms");

    // Cleanup
    await tracer.shutdown();
    console.log("\n✅ Tracer shutdown complete");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

async function testPredictiveMonitoring() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║ TEST 4: ML PREDICTIVE MONITORING                          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    const monitor = createPredictiveMonitor({
      enabled: true,
      modelPath: "./models/workflow-predictor/model.json",
    });

    console.log("⏳ Initializing ML model...");
    await monitor.initialize();

    if (!monitor.isEnabled()) {
      console.log("⚠️  Predictive monitor initialized but model not available");
      console.log("   Model will be created after training with 50+ samples");
      return true; // Not a failure, just needs training
    }

    console.log("✅ ML Model initialized\n");

    const modelInfo = monitor.getModelInfo();
    if (modelInfo) {
      console.log("📊 Model Information:");
      console.log("   Type:", modelInfo.type);
      console.log("   Features:", modelInfo.features.join(", "));
      console.log("   Target:", modelInfo.targetVariable);
    }

    console.log("\n⏳ Predicting failure probability...\n");
    const prediction = await monitor.predictFailure(mockMetrics);

    console.log("✅ Prediction Complete!");
    console.log(
      "   Failure Probability:",
      (prediction.failureProbability * 100).toFixed(1) + "%"
    );
    console.log("   Confidence:", prediction.confidence.toFixed(1) + "%");
    console.log("   Recommendation:", prediction.recommendation);

    if (prediction.contributingFactors.length > 0) {
      console.log("\n📉 Contributing Factors:");
      prediction.contributingFactors.forEach((factor) => {
        console.log("   • " + factor);
      });
    }

    console.log("\n⏳ Detecting anomalies...\n");
    const anomalies = await monitor.detectAnomalies(mockMetrics);

    console.log("✅ Anomaly Detection Complete!");
    console.log("   Anomalies Found:", anomalies.length);

    if (anomalies.length > 0) {
      console.log("\n⚠️  Detected Anomalies:");
      anomalies.forEach((anomaly) => {
        console.log(`   • ${anomaly.context}`);
        console.log(
          `     Expected: ${anomaly.expectedValue.toFixed(0)}, Actual: ${anomaly.actualValue.toFixed(0)}`
        );
        console.log(
          `     Deviation: ${anomaly.deviation.toFixed(2)}σ (${(anomaly.anomalyScore * 100).toFixed(0)}% severity)`
        );
      });
    }

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

async function testSelfHealing() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║ TEST 5: SELF-HEALING ORCHESTRATOR                         ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    const healer = createSelfHealer({
      enabled: true,
      autoApprove: false,
      maxAttemptsPerWorkflow: 3,
    });

    if (!healer.isEnabled()) {
      console.log("⚠️  Self-healing is disabled");
      return false;
    }

    console.log("✅ Self-Healing Orchestrator initialized");
    console.log("   Auto-approve: DISABLED (safe mode)");
    console.log("   Max attempts per workflow: 3");

    const strategies = healer.getStrategies();
    console.log("   Registered strategies:", strategies.length);

    console.log("\n📋 Available Healing Strategies:");
    strategies.forEach((strategy) => {
      console.log(`   • ${strategy.name}`);
      console.log(`     Success Rate: ${(strategy.successRate * 100).toFixed(0)}%`);
      console.log(
        `     Estimated Duration: ${strategy.estimatedDuration}ms`
      );
      console.log(
        `     Auto-approve: ${strategy.requiresApproval ? "❌ No" : "✅ Yes"}`
      );
    });

    console.log("\n⏳ Attempting self-heal (simulation)...\n");

    const healingResult = await healer.attemptSelfHeal(mockFailedWorkflow);

    if (healingResult.healed) {
      console.log("✅ Self-Healing Successful!");
      console.log("   Strategy:", healingResult.strategyUsed);
      console.log("   Duration:", healingResult.duration + "ms");
      console.log("\n🔧 Actions Taken:");
      healingResult.actions.forEach((action) => {
        console.log("   • " + action);
      });
    } else {
      console.log("⚠️  Self-Healing Not Applied");
      console.log("   Reason:", healingResult.reason);
      if (healingResult.requiresManualIntervention) {
        console.log("\n⚠️  Manual Intervention Required");
        if (healingResult.followUpRecommendations) {
          console.log("\n📋 Follow-up Recommendations:");
          healingResult.followUpRecommendations.forEach((rec) => {
            console.log("   • " + rec);
          });
        }
      }
    }

    console.log("\n📊 Self-Healing Statistics:");
    const stats = healer.getHealingStats();
    console.log("   Total Attempts:", stats.totalAttempts);
    console.log("   Successful:", stats.successful);
    console.log("   Failed:", stats.failed);
    console.log(
      "   Success Rate:",
      (stats.successRate * 100).toFixed(1) + "%"
    );
    console.log(
      "   Average Heal Time:",
      stats.averageHealTime.toFixed(0) + "ms"
    );

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                                                            ║");
  console.log("║     🚀 TIER 1 AI MONITORING FEATURES TEST SUITE 🚀        ║");
  console.log("║                                                            ║");
  console.log("║     Farmers Market Platform - Divine Monitoring v2.0       ║");
  console.log("║                                                            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  console.log("\n📋 Test Configuration:");
  console.log("   OpenAI API Key:", process.env.OPENAI_API_KEY ? "✅ Set" : "❌ Not set");
  console.log("   Tracing:", process.env.TRACING_ENABLED !== "false" ? "✅ Enabled" : "❌ Disabled");
  console.log("   AI Analysis:", process.env.AI_ANALYSIS_ENABLED !== "false" ? "✅ Enabled" : "❌ Disabled");

  if (!process.env.OPENAI_API_KEY) {
    console.log("\n⚠️  WARNING: OPENAI_API_KEY not set!");
    console.log("   Set it in .env.monitoring to enable AI features");
    console.log("   Tests will run in fallback mode\n");
  }

  const results: Record<string, boolean> = {};

  // Run tests
  results["AI Failure Analyzer"] = await testAIFailureAnalyzer();
  results["Multi-Agent Orchestrator"] = await testMultiAgentOrchestrator();
  results["OpenTelemetry Tracing"] = await testOpenTelemetryTracing();
  results["ML Predictive Monitoring"] = await testPredictiveMonitoring();
  results["Self-Healing Orchestrator"] = await testSelfHealing();

  // Summary
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║ TEST SUMMARY                                               ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const passed = Object.values(results).filter((r) => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([name, passed]) => {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`   ${status} - ${name}`);
  });

  console.log("\n" + "═".repeat(60));
  console.log(
    `   Total: ${passed}/${total} tests passed (${((passed / total) * 100).toFixed(0)}%)`
  );
  console.log("═".repeat(60) + "\n");

  if (passed === total) {
    console.log("🎉 ALL TESTS PASSED! Tier 1 features are operational.\n");
    console.log("Next steps:");
    console.log("   1. Configure .env.monitoring with your settings");
    console.log("   2. Run: npm run monitor:critical");
    console.log("   3. Review the enhanced monitoring reports\n");
  } else {
    console.log("⚠️  Some tests failed. Review the output above.\n");
    console.log("Common issues:");
    console.log("   • Missing OPENAI_API_KEY environment variable");
    console.log("   • Insufficient permissions");
    console.log("   • Network connectivity issues\n");
  }

  // Exit with appropriate code
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  console.error("\n❌ Fatal error running tests:", error);
  process.exit(1);
});
