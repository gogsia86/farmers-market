#!/usr/bin/env npx tsx
/**
 * 🧪 Auto-Remediation System Test Script
 * Farmers Market Platform - Divine Agricultural Intelligence
 * Version: 1.0.0
 *
 * Tests the auto-remediation system and orchestrator bridge integration.
 *
 * Usage:
 *   npx tsx scripts/test-auto-remediation.ts [options]
 *
 * Options:
 *   --demo       Run demo scenarios
 *   --bridge     Test bridge integration
 *   --full       Run full test suite
 */

import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import {
  createAutoRemediationSystem,
  type RemediationPlan,
} from "../src/lib/monitoring/healing/auto-remediation-system";
import { createOrchestratorBridge } from "../src/lib/monitoring/integration/orchestrator-bridge";
import type { WorkflowResult } from "../src/lib/monitoring/types";

// ============================================================================
// TEST DATA
// ============================================================================

const mockWorkflowResults: WorkflowResult[] = [
  {
    workflowId: "wf-test-timeout-001",
    runId: "run-001",
    name: "User Registration Workflow",
    type: "USER_REGISTRATION",
    priority: "CRITICAL",
    status: "FAILED",
    startTime: new Date(Date.now() - 45000),
    endTime: new Date(),
    duration: 45000,
    steps: [],
    totalSteps: 5,
    passedSteps: 3,
    failedSteps: 2,
    skippedSteps: 0,
    error:
      "TimeoutError: locator.click: Timeout 30000ms exceeded. Element not visible.",
    screenshots: [],
    traces: [],
    metrics: { totalDuration: 45000 },
    tags: ["critical", "user-flow"],
  },
  {
    workflowId: "wf-test-db-002",
    runId: "run-002",
    name: "Inventory Sync Workflow",
    type: "PRODUCT_LISTING",
    priority: "HIGH",
    status: "FAILED",
    startTime: new Date(Date.now() - 15000),
    endTime: new Date(),
    duration: 15000,
    steps: [],
    totalSteps: 3,
    passedSteps: 1,
    failedSteps: 2,
    skippedSteps: 0,
    error:
      "DatabaseError: Connection pool exhausted. ECONNREFUSED 127.0.0.1:5433",
    screenshots: [],
    traces: [],
    metrics: { totalDuration: 15000 },
    tags: ["database", "inventory"],
  },
  {
    workflowId: "wf-test-auth-003",
    runId: "run-003",
    name: "User Login Workflow",
    type: "USER_LOGIN",
    priority: "HIGH",
    status: "FAILED",
    startTime: new Date(Date.now() - 5000),
    endTime: new Date(),
    duration: 5000,
    steps: [],
    totalSteps: 3,
    passedSteps: 1,
    failedSteps: 2,
    skippedSteps: 0,
    error: "AuthenticationError: Token expired. Please refresh authentication.",
    screenshots: [],
    traces: [],
    metrics: { totalDuration: 5000 },
    tags: ["auth", "login"],
  },
  {
    workflowId: "wf-test-cache-004",
    runId: "run-004",
    name: "Product Search Workflow",
    type: "SEARCH_FUNCTIONALITY",
    priority: "MEDIUM",
    status: "FAILED",
    startTime: new Date(Date.now() - 8000),
    endTime: new Date(),
    duration: 8000,
    steps: [],
    totalSteps: 4,
    passedSteps: 2,
    failedSteps: 2,
    skippedSteps: 0,
    error: "CacheError: Redis connection failed. Stale cache data returned.",
    screenshots: [],
    traces: [],
    metrics: { totalDuration: 8000 },
    tags: ["cache", "search"],
  },
];

// ============================================================================
// UTILITIES
// ============================================================================

function printBanner(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🧪 AUTO-REMEDIATION SYSTEM TEST SUITE                                      ║
║  Farmers Market Platform - Divine Agricultural Intelligence                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);
}

function printSection(title: string): void {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(70)}\n`);
}

function printResult(success: boolean, message: string): void {
  const icon = success ? "✅" : "❌";
  console.log(`${icon} ${message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// TEST: AUTO-REMEDIATION SYSTEM
// ============================================================================

async function testAutoRemediationSystem(): Promise<boolean> {
  printSection("🔧 Testing Auto-Remediation System");

  const remediation = createAutoRemediationSystem({
    enabled: true,
    aiEnabled: !!process.env.OPENAI_API_KEY,
    autoApproveEnabled: true,
    autoApproveThreshold: 80,
    maxAutoApproveActions: 5,
  });

  console.log("📊 System Status:");
  console.log(`   Enabled: ${remediation.isEnabled()}`);
  console.log(`   AI Enabled: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`   Auto-Approve: ${remediation.getConfig().autoApproveEnabled}`);
  console.log(`   Threshold: ${remediation.getConfig().autoApproveThreshold}%`);
  console.log("");

  let allPassed = true;

  // Test 1: Process a timeout failure
  console.log("📋 Test 1: Processing Timeout Failure...\n");
  try {
    const plan = await remediation.processFailure(mockWorkflowResults[0]);
    printResult(true, `Plan created: ${plan.id}`);
    printResult(true, `Severity: ${plan.severity}`);
    printResult(true, `AI Confidence: ${plan.aiAnalysis.confidence}%`);
    printResult(true, `Proposed Actions: ${plan.proposedActions.length}`);
    printResult(true, `Approval Status: ${plan.approvalStatus}`);

    // Check if auto-approved and execute
    if (plan.approvalStatus === "AUTO_APPROVED") {
      console.log("\n🚀 Executing auto-approved plan...\n");
      const result = await remediation.executePlan(plan.id);
      printResult(result.success, `Execution Result: ${result.finalState}`);
      printResult(true, `Duration: ${result.duration}ms`);
      printResult(true, `Actions Executed: ${result.actionsExecuted.length}`);
    }
  } catch (error) {
    printResult(false, `Test 1 failed: ${error}`);
    allPassed = false;
  }

  await sleep(1000);

  // Test 2: Process a database failure
  console.log("\n📋 Test 2: Processing Database Failure...\n");
  try {
    const plan = await remediation.processFailure(mockWorkflowResults[1]);
    printResult(true, `Plan created: ${plan.id}`);
    printResult(true, `Root Cause: ${plan.aiAnalysis.rootCause}`);
    printResult(
      true,
      `Actions: ${plan.proposedActions.map((a) => a.type).join(", ")}`,
    );
  } catch (error) {
    printResult(false, `Test 2 failed: ${error}`);
    allPassed = false;
  }

  // Test 3: Get statistics
  console.log("\n📋 Test 3: Checking Statistics...\n");
  try {
    const stats = remediation.getStatistics();
    printResult(true, `Total Plans: ${stats.totalPlans}`);
    printResult(true, `Pending Approval: ${stats.pendingApproval}`);
    printResult(true, `Auto-Approved: ${stats.autoApproved}`);
    printResult(true, `Executed: ${stats.executed}`);
    printResult(true, `Success Rate: ${stats.successRate.toFixed(1)}%`);
    printResult(
      true,
      `Average Confidence: ${stats.averageConfidence.toFixed(1)}%`,
    );
  } catch (error) {
    printResult(false, `Test 3 failed: ${error}`);
    allPassed = false;
  }

  return allPassed;
}

// ============================================================================
// TEST: ORCHESTRATOR BRIDGE
// ============================================================================

async function testOrchestratorBridge(): Promise<boolean> {
  printSection("🌉 Testing Orchestrator Bridge");

  const bridge = createOrchestratorBridge({
    enabled: true,
    autoAnalyze: true,
    autoRemediate: true,
    notifyOnFailure: true,
    notifyOnRemediation: true,
    minFailuresBeforeAnalysis: 1,
    cooldownBetweenAnalyses: 5000, // 5 seconds for testing
  });

  console.log("📊 Bridge Status:");
  console.log(`   Enabled: ${bridge.isEnabled()}`);
  console.log(`   Orchestrator Available: ${bridge.isOrchestratorAvailable()}`);
  console.log(
    `   Config: ${JSON.stringify(bridge.getConfig(), null, 2).substring(0, 200)}...`,
  );
  console.log("");

  let allPassed = true;

  // Test 1: Process a workflow failure through the bridge
  console.log("📋 Test 1: Processing Workflow Failure Through Bridge...\n");
  try {
    const outcome = await bridge.processWorkflowResult(mockWorkflowResults[2]);
    printResult(true, `Analyzed: ${outcome.analyzed}`);
    printResult(true, `Remediated: ${outcome.remediated}`);
    if (outcome.plan) {
      printResult(true, `Plan ID: ${outcome.plan.id}`);
      printResult(true, `Severity: ${outcome.plan.severity}`);
    }
    if (outcome.executionResult) {
      printResult(true, `Execution: ${outcome.executionResult.finalState}`);
    }
  } catch (error) {
    printResult(false, `Test 1 failed: ${error}`);
    allPassed = false;
  }

  await sleep(1000);

  // Test 2: Event handling
  console.log("\n📋 Test 2: Testing Event Handling...\n");
  try {
    let eventReceived = false;
    bridge.on("WORKFLOW_FAILED", () => {
      eventReceived = true;
    });

    await bridge.processWorkflowResult(mockWorkflowResults[3]);
    printResult(eventReceived, "Event handler received WORKFLOW_FAILED event");
  } catch (error) {
    printResult(false, `Test 2 failed: ${error}`);
    allPassed = false;
  }

  // Test 3: Get bridge statistics
  console.log("\n📋 Test 3: Checking Bridge Statistics...\n");
  try {
    const stats = bridge.getStatistics();
    printResult(true, `Failures Processed: ${stats.totalFailuresProcessed}`);
    printResult(true, `Analyses Performed: ${stats.analysesPerformed}`);
    printResult(true, `Remediations Executed: ${stats.remediationsExecuted}`);
    printResult(
      true,
      `Successful Remediations: ${stats.successfulRemediations}`,
    );
    printResult(
      true,
      `Avg Analysis Time: ${stats.averageAnalysisTime.toFixed(0)}ms`,
    );
  } catch (error) {
    printResult(false, `Test 3 failed: ${error}`);
    allPassed = false;
  }

  // Test 4: Get event log
  console.log("\n📋 Test 4: Checking Event Log...\n");
  try {
    const events = bridge.getEventLog(10);
    printResult(true, `Total Events: ${events.length}`);
    for (const event of events.slice(0, 5)) {
      console.log(
        `   - ${event.type}: ${event.workflowName || event.workflowId || "N/A"}`,
      );
    }
  } catch (error) {
    printResult(false, `Test 4 failed: ${error}`);
    allPassed = false;
  }

  return allPassed;
}

// ============================================================================
// TEST: FULL INTEGRATION
// ============================================================================

async function testFullIntegration(): Promise<boolean> {
  printSection("🔗 Testing Full Integration");

  console.log(
    "This test simulates a complete monitoring -> analysis -> remediation flow.\n",
  );

  const bridge = createOrchestratorBridge({
    enabled: true,
    autoAnalyze: true,
    autoRemediate: true,
    minFailuresBeforeAnalysis: 1,
  });

  let allPassed = true;

  // Simulate processing a monitoring report
  console.log("📋 Simulating Monitoring Report Processing...\n");

  const mockReport = {
    id: `report-${Date.now()}`,
    timestamp: new Date(),
    summary: {
      total: mockWorkflowResults.length,
      passed: 0,
      failed: mockWorkflowResults.length,
      warnings: 0,
      skipped: 0,
      duration: 73000,
    },
    results: mockWorkflowResults,
    environment: "test",
  };

  try {
    const outcome = await bridge.processMonitoringReport(mockReport as any);
    printResult(true, `Failures Found: ${outcome.failuresFound}`);
    printResult(true, `Failures Analyzed: ${outcome.failuresAnalyzed}`);
    printResult(
      true,
      `Remediations Attempted: ${outcome.remediationsAttempted}`,
    );
    printResult(
      true,
      `Remediations Successful: ${outcome.remediationsSuccessful}`,
    );
    printResult(true, `Plans Created: ${outcome.plans.length}`);
  } catch (error) {
    printResult(false, `Integration test failed: ${error}`);
    allPassed = false;
  }

  // Check pending plans
  console.log("\n📋 Checking Pending Plans...\n");
  try {
    const pendingPlans = bridge.getPendingPlans();
    printResult(true, `Pending Plans: ${pendingPlans.length}`);

    if (pendingPlans.length > 0) {
      console.log("\n   Pending plans requiring manual approval:");
      for (const plan of pendingPlans) {
        console.log(`   - ${plan.id}: ${plan.workflowName} (${plan.severity})`);
      }
    }
  } catch (error) {
    printResult(false, `Pending plans check failed: ${error}`);
    allPassed = false;
  }

  // Final statistics
  console.log("\n📋 Final Statistics...\n");
  try {
    const stats = bridge.getStatistics();
    console.log(`   Total Failures Processed: ${stats.totalFailuresProcessed}`);
    console.log(`   Total Analyses: ${stats.analysesPerformed}`);
    console.log(`   Total Remediations: ${stats.remediationsExecuted}`);
    console.log(
      `   Success Rate: ${stats.remediationsExecuted > 0 ? ((stats.successfulRemediations / stats.remediationsExecuted) * 100).toFixed(1) : 0}%`,
    );
  } catch (error) {
    printResult(false, `Statistics check failed: ${error}`);
    allPassed = false;
  }

  return allPassed;
}

// ============================================================================
// DEMO MODE
// ============================================================================

async function runDemo(): Promise<void> {
  printSection("🎬 Demo Mode - Auto-Remediation in Action");

  console.log(
    "This demo shows the auto-remediation system processing a workflow failure.\n",
  );
  console.log("Watch as the system:");
  console.log("  1. Analyzes the failure");
  console.log("  2. Generates a remediation plan");
  console.log("  3. Auto-approves safe actions");
  console.log("  4. Executes the remediation\n");

  await sleep(2000);

  const remediation = createAutoRemediationSystem({
    enabled: true,
    aiEnabled: !!process.env.OPENAI_API_KEY,
    autoApproveEnabled: true,
    autoApproveThreshold: 70, // Lower threshold for demo
  });

  console.log("📨 Incoming workflow failure detected...\n");
  await sleep(1000);

  const { plan, executed, result } = await remediation.processAndHeal(
    mockWorkflowResults[0],
  );

  console.log(`\n${"═".repeat(70)}`);
  console.log("  📊 DEMO SUMMARY");
  console.log(`${"═".repeat(70)}\n`);

  console.log(`Plan Created: ${plan.id}`);
  console.log(`Workflow: ${plan.workflowName}`);
  console.log(`Severity: ${plan.severity}`);
  console.log(`AI Confidence: ${plan.aiAnalysis.confidence}%`);
  console.log(`Root Cause: ${plan.aiAnalysis.rootCause}`);
  console.log(`Approval Status: ${plan.approvalStatus}`);
  console.log(`Executed: ${executed}`);

  if (result) {
    console.log("\nExecution Result:");
    console.log(`  Final State: ${result.finalState}`);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Actions: ${result.actionsExecuted.length}`);
    console.log(`  Errors: ${result.errors.length}`);
  }

  console.log("\n✅ Demo complete!\n");
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  printBanner();

  const args = process.argv.slice(2);
  const runDemoMode = args.includes("--demo");
  const runBridgeTest = args.includes("--bridge");
  const runFullTest = args.includes("--full");

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.log(
      "⚠️  OPENAI_API_KEY not found - AI features will use fallback analysis\n",
    );
  } else {
    console.log("✅ OPENAI_API_KEY found - AI analysis enabled\n");
  }

  let allPassed = true;

  if (runDemoMode) {
    await runDemo();
    return;
  }

  if (runBridgeTest) {
    allPassed = await testOrchestratorBridge();
  } else if (runFullTest) {
    const test1 = await testAutoRemediationSystem();
    await sleep(2000);
    const test2 = await testOrchestratorBridge();
    await sleep(2000);
    const test3 = await testFullIntegration();
    allPassed = test1 && test2 && test3;
  } else {
    // Default: run all tests
    const test1 = await testAutoRemediationSystem();
    await sleep(2000);
    const test2 = await testOrchestratorBridge();
    allPassed = test1 && test2;
  }

  // Print final result
  printSection(allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED");

  console.log("Available commands:");
  console.log("  npm run test:remediation           - Run default tests");
  console.log("  npm run test:remediation -- --demo - Run demo mode");
  console.log("  npm run test:remediation -- --bridge - Test bridge only");
  console.log(
    "  npm run test:remediation -- --full - Run full integration tests\n",
  );

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
