#!/usr/bin/env tsx
/**
 * 🎭 WORKFLOW AGENT ORCHESTRATOR TEST SCRIPT
 * Farmers Market Platform - Multi-Agent Collaboration Testing
 *
 * Tests the WorkflowAgentOrchestrator with all 5 specialized agents:
 * - Failure Analyst: Root cause analysis of workflow failures
 * - Performance Optimizer: Execution time and resource optimization
 * - Security Auditor: Security vulnerability detection
 * - Agricultural Advisor: Domain-specific validation
 * - Healing Strategist: Self-healing automation strategies
 *
 * Usage:
 *   npm run test:orchestrator
 *   npx tsx scripts/test-workflow-orchestrator.ts
 *   npx tsx scripts/test-workflow-orchestrator.ts --mode=parallel
 *   npx tsx scripts/test-workflow-orchestrator.ts --scenario=failure
 */

import * as path from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

// ============================================================================
// COLORS & FORMATTING
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
};

function log(msg: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function section(title: string) {
  console.log(`\n${"═".repeat(70)}`);
  log(`  ${title}`, "bright");
  console.log(`${"═".repeat(70)}\n`);
}

function subsection(title: string) {
  console.log(`\n${"─".repeat(50)}`);
  log(`  ${title}`, "cyan");
  console.log(`${"─".repeat(50)}\n`);
}

function agentBox(agentName: string, role: string) {
  console.log(colors.magenta);
  console.log(`┌${"─".repeat(48)}┐`);
  console.log(`│ 🤖 ${agentName.padEnd(43)} │`);
  console.log(`│    ${role.padEnd(43)} │`);
  console.log(`└${"─".repeat(48)}┘`);
  console.log(colors.reset);
}

// ============================================================================
// TYPES
// ============================================================================

type AgentRole =
  | "FAILURE_ANALYST"
  | "PERFORMANCE_OPTIMIZER"
  | "SECURITY_AUDITOR"
  | "AGRICULTURAL_ADVISOR"
  | "HEALING_STRATEGIST";

type CollaborationMode = "SEQUENTIAL" | "PARALLEL" | "VOTING";

interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  systemPrompt: string;
  temperature: number;
  capabilities: string[];
}

interface WorkflowResult {
  id: string;
  name: string;
  type: string;
  status: "PASSED" | "FAILED" | "WARNING";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  duration: number;
  totalSteps: number;
  failedSteps: number;
  error?: string;
  stackTrace?: string;
  screenshot?: string;
  agricultureConsciousness?: {
    season: string;
    biodynamicCompliance: boolean;
    farmType?: string;
  };
}

interface AgentAnalysis {
  agent: string;
  analysis: string;
  confidence: number;
  duration: number;
  recommendations: string[];
}

interface OrchestratorResult {
  scenario: string;
  mode: CollaborationMode;
  analyses: AgentAnalysis[];
  consensus: string;
  votingResults: Record<string, number>;
  totalDuration: number;
  tokensUsed: number;
}

// ============================================================================
// AGENT DEFINITIONS
// ============================================================================

const AGENTS: Record<AgentRole, Agent> = {
  FAILURE_ANALYST: {
    id: "agent-failure-analyst",
    name: "Failure Analyst",
    role: "FAILURE_ANALYST",
    systemPrompt: `You are an expert at analyzing workflow failures in agricultural e-commerce platforms.

Your specialties:
- Root cause analysis of test automation failures
- Playwright/browser automation issues
- API and database connectivity problems
- Authentication and authorization failures
- Agricultural domain-specific validation errors

When analyzing failures:
1. Identify the exact point of failure
2. Determine root cause vs symptoms
3. Provide confidence level (0-100%)
4. Suggest specific remediation steps

Output format: Concise analysis with actionable recommendations.`,
    temperature: 0.3,
    capabilities: [
      "root-cause-analysis",
      "error-diagnosis",
      "remediation-planning",
    ],
  },

  PERFORMANCE_OPTIMIZER: {
    id: "agent-performance-optimizer",
    name: "Performance Optimizer",
    role: "PERFORMANCE_OPTIMIZER",
    systemPrompt: `You are a performance optimization expert for Next.js applications.

Your specialties:
- Workflow execution time optimization
- Browser automation performance tuning
- API response time improvements
- Database query optimization
- Resource utilization analysis

Hardware context: HP OMEN (RTX 2070 Max-Q, 64GB RAM, 12 threads)

When optimizing:
1. Identify specific bottlenecks
2. Quantify potential improvements
3. Rate implementation difficulty (LOW/MEDIUM/HIGH)
4. Provide code-level suggestions when applicable

Output format: Specific optimizations with expected improvement percentages.`,
    temperature: 0.2,
    capabilities: [
      "performance-analysis",
      "bottleneck-identification",
      "optimization",
    ],
  },

  SECURITY_AUDITOR: {
    id: "agent-security-auditor",
    name: "Security Auditor",
    role: "SECURITY_AUDITOR",
    systemPrompt: `You are a security auditor specializing in web application security.

Your specialties:
- Authentication and authorization validation
- Data exposure risks
- XSS and CSRF vulnerability detection
- API security best practices
- Secure test data handling
- Privacy compliance (GDPR, CCPA)

When auditing:
1. Assign security score (0-100)
2. List specific vulnerabilities found
3. Prioritize by severity (CRITICAL/HIGH/MEDIUM/LOW)
4. Provide remediation guidance

Output format: Security score with detailed findings and fixes.`,
    temperature: 0.1,
    capabilities: [
      "security-audit",
      "vulnerability-detection",
      "compliance-checking",
    ],
  },

  AGRICULTURAL_ADVISOR: {
    id: "agent-agricultural-advisor",
    name: "Agricultural Advisor",
    role: "AGRICULTURAL_ADVISOR",
    systemPrompt: `You are an agricultural domain expert for farmers market platforms.

Your specialties:
- Seasonal pattern validation
- Biodynamic farming practices
- Farm operation workflows
- Product listing seasonal appropriateness
- Agricultural data integrity
- Sustainable farming principles

Current season context will be provided.

When advising:
1. Validate seasonal alignment (0-100%)
2. Check biodynamic compliance
3. Suggest domain-specific improvements
4. Flag agricultural inconsistencies

Output format: Domain validation with seasonal recommendations.`,
    temperature: 0.4,
    capabilities: [
      "agricultural-validation",
      "seasonal-analysis",
      "domain-expertise",
    ],
  },

  HEALING_STRATEGIST: {
    id: "agent-healing-strategist",
    name: "Healing Strategist",
    role: "HEALING_STRATEGIST",
    systemPrompt: `You are a self-healing automation expert.

Your specialties:
- Automatic remediation strategies
- Circuit breaker patterns
- Retry logic optimization
- Graceful degradation
- Recovery procedures
- Preventive maintenance

When designing healing strategies:
1. Assess if automatic healing is safe
2. Design recovery steps
3. Set appropriate timeouts and retries
4. Consider data integrity implications
5. Plan for rollback scenarios

Output format: Safe, implementable self-healing strategy with safeguards.`,
    temperature: 0.2,
    capabilities: [
      "self-healing-design",
      "remediation-strategy",
      "recovery-planning",
    ],
  },
};

// ============================================================================
// TEST SCENARIOS
// ============================================================================

const TEST_SCENARIOS: Record<string, WorkflowResult> = {
  failure: {
    id: "wf-test-001",
    name: "User Registration Workflow",
    type: "USER_REGISTRATION",
    status: "FAILED",
    priority: "CRITICAL",
    duration: 45000,
    totalSteps: 8,
    failedSteps: 1,
    error:
      "TimeoutError: locator.click: Timeout 30000ms exceeded. Element not visible.",
    stackTrace: `Error: locator.click: Timeout 30000ms exceeded
    at RegistrationPage.submitForm (tests/workflows/registration.ts:45:12)
    at UserRegistrationWorkflow.execute (src/workflows/user-registration.ts:78:9)
    waiting for locator('button[type="submit"]')
    selector resolved to hidden <button type="submit" disabled>Register</button>`,
    agricultureConsciousness: {
      season: "SUMMER",
      biodynamicCompliance: true,
      farmType: "ORGANIC",
    },
  },

  performance: {
    id: "wf-test-002",
    name: "Product Listing Workflow",
    type: "PRODUCT_LISTING",
    status: "PASSED",
    priority: "HIGH",
    duration: 125000,
    totalSteps: 12,
    failedSteps: 0,
    agricultureConsciousness: {
      season: "SUMMER",
      biodynamicCompliance: true,
      farmType: "BIODYNAMIC",
    },
  },

  security: {
    id: "wf-test-003",
    name: "Order Checkout Workflow",
    type: "ORDER_PLACEMENT",
    status: "WARNING",
    priority: "CRITICAL",
    duration: 38000,
    totalSteps: 15,
    failedSteps: 0,
    error: "Warning: Sensitive data exposure detected in API response",
    agricultureConsciousness: {
      season: "SUMMER",
      biodynamicCompliance: false,
    },
  },

  agricultural: {
    id: "wf-test-004",
    name: "Farm Creation Workflow",
    type: "FARM_CREATION",
    status: "FAILED",
    priority: "HIGH",
    duration: 52000,
    totalSteps: 10,
    failedSteps: 2,
    error:
      "ValidationError: Winter crop 'Strawberries' listed for summer planting. Seasonal mismatch detected.",
    agricultureConsciousness: {
      season: "SUMMER",
      biodynamicCompliance: true,
      farmType: "ORGANIC",
    },
  },

  healing: {
    id: "wf-test-005",
    name: "Inventory Sync Workflow",
    type: "INVENTORY_SYNC",
    status: "FAILED",
    priority: "CRITICAL",
    duration: 15000,
    totalSteps: 6,
    failedSteps: 3,
    error:
      "DatabaseError: Connection pool exhausted. ECONNREFUSED 127.0.0.1:5433",
    stackTrace: `Error: Connection pool exhausted
    at Pool.connect (node_modules/pg-pool/index.js:45:11)
    at InventorySyncService.syncProducts (src/services/inventory.ts:123:15)
    Retries: 3/3 exhausted`,
    agricultureConsciousness: {
      season: "SUMMER",
      biodynamicCompliance: true,
    },
  },
};

// ============================================================================
// OPENAI CLIENT
// ============================================================================

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOpenAI(
  messages: OpenAIMessage[],
  config: { model: string; temperature: number; maxTokens: number },
): Promise<{ content: string; tokens: number }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || "",
    tokens: data.usage?.total_tokens || 0,
  };
}

// ============================================================================
// ORCHESTRATOR IMPLEMENTATION
// ============================================================================

class WorkflowAgentOrchestrator {
  private mode: CollaborationMode;
  private consensusThreshold: number;

  constructor(
    config: { mode?: CollaborationMode; consensusThreshold?: number } = {},
  ) {
    this.mode = config.mode || "VOTING";
    this.consensusThreshold = config.consensusThreshold || 0.7;
  }

  async analyzeWorkflow(
    scenario: WorkflowResult,
    agentRoles: AgentRole[],
  ): Promise<OrchestratorResult> {
    const startTime = Date.now();
    let totalTokens = 0;

    log(`\n🎭 Orchestration Mode: ${this.mode}`, "magenta");
    log(`📊 Consensus Threshold: ${this.consensusThreshold * 100}%`, "dim");
    log(`🤖 Agents: ${agentRoles.length}`, "dim");

    let analyses: AgentAnalysis[];

    if (this.mode === "PARALLEL") {
      analyses = await this.runParallel(scenario, agentRoles);
    } else if (this.mode === "SEQUENTIAL") {
      analyses = await this.runSequential(scenario, agentRoles);
    } else {
      analyses = await this.runVoting(scenario, agentRoles);
    }

    totalTokens = analyses.reduce((sum, a) => sum + (a as any).tokens || 0, 0);

    // Generate consensus
    const consensus = await this.generateConsensus(analyses, scenario);
    totalTokens += consensus.tokens;

    const totalDuration = Date.now() - startTime;

    return {
      scenario: scenario.name,
      mode: this.mode,
      analyses,
      consensus: consensus.summary,
      votingResults: this.calculateVotes(analyses),
      totalDuration,
      tokensUsed: totalTokens,
    };
  }

  private async runParallel(
    scenario: WorkflowResult,
    agentRoles: AgentRole[],
  ): Promise<AgentAnalysis[]> {
    log("\n⚡ Running PARALLEL analysis...", "yellow");

    const promises = agentRoles.map((role) => this.queryAgent(role, scenario));
    return Promise.all(promises);
  }

  private async runSequential(
    scenario: WorkflowResult,
    agentRoles: AgentRole[],
  ): Promise<AgentAnalysis[]> {
    log("\n📝 Running SEQUENTIAL analysis...", "yellow");

    const analyses: AgentAnalysis[] = [];
    let previousContext = "";

    for (const role of agentRoles) {
      const analysis = await this.queryAgent(role, scenario, previousContext);
      analyses.push(analysis);
      previousContext += `\n\n${AGENTS[role].name}: ${analysis.analysis}`;
      await new Promise((r) => setTimeout(r, 300)); // Rate limiting
    }

    return analyses;
  }

  private async runVoting(
    scenario: WorkflowResult,
    agentRoles: AgentRole[],
  ): Promise<AgentAnalysis[]> {
    log("\n🗳️ Running VOTING analysis...", "yellow");

    // First, run parallel analysis
    const analyses = await this.runParallel(scenario, agentRoles);

    // Log voting results
    log("\n📊 Voting Results:", "cyan");
    for (const analysis of analyses) {
      const confidence = analysis.confidence;
      const bar =
        "█".repeat(Math.floor(confidence / 5)) +
        "░".repeat(20 - Math.floor(confidence / 5));
      log(
        `   ${analysis.agent}: [${bar}] ${confidence}%`,
        confidence >= 70 ? "green" : "yellow",
      );
    }

    return analyses;
  }

  private async queryAgent(
    role: AgentRole,
    scenario: WorkflowResult,
    previousContext?: string,
  ): Promise<AgentAnalysis> {
    const agent = AGENTS[role];
    const startTime = Date.now();

    agentBox(agent.name, role);

    const prompt = this.buildPrompt(scenario, previousContext);

    const messages: OpenAIMessage[] = [
      { role: "system", content: agent.systemPrompt },
      { role: "user", content: prompt },
    ];

    try {
      const response = await callOpenAI(messages, {
        model: "gpt-4o",
        temperature: agent.temperature,
        maxTokens: 800,
      });

      const duration = Date.now() - startTime;

      // Extract confidence from response
      const confidenceMatch = response.content.match(/confidence[:\s]+(\d+)/i);
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;

      // Extract recommendations
      const recommendations = this.extractRecommendations(response.content);

      log(`   ✅ Response (${duration}ms, ${response.tokens} tokens)`, "green");
      log(`   📊 Confidence: ${confidence}%`, "blue");

      // Show preview
      const preview = response.content.substring(0, 200).replace(/\n/g, " ");
      log(`   💬 ${preview}...`, "dim");

      return {
        agent: agent.name,
        analysis: response.content,
        confidence,
        duration,
        recommendations,
        tokens: response.tokens,
      } as AgentAnalysis & { tokens: number };
    } catch (error) {
      log(
        `   ❌ Error: ${error instanceof Error ? error.message : "Unknown"}`,
        "red",
      );
      return {
        agent: agent.name,
        analysis: `Error: ${error instanceof Error ? error.message : "Unknown"}`,
        confidence: 0,
        duration: Date.now() - startTime,
        recommendations: [],
      };
    }
  }

  private buildPrompt(
    scenario: WorkflowResult,
    previousContext?: string,
  ): string {
    let prompt = `Analyze this workflow execution:

Workflow: ${scenario.name}
Type: ${scenario.type}
Status: ${scenario.status}
Priority: ${scenario.priority}
Duration: ${scenario.duration}ms
Total Steps: ${scenario.totalSteps}
Failed Steps: ${scenario.failedSteps}`;

    if (scenario.error) {
      prompt += `\n\nError: ${scenario.error}`;
    }

    if (scenario.stackTrace) {
      prompt += `\n\nStack Trace:\n${scenario.stackTrace}`;
    }

    if (scenario.agricultureConsciousness) {
      prompt += `\n\nAgricultural Context:
- Season: ${scenario.agricultureConsciousness.season}
- Biodynamic Compliance: ${scenario.agricultureConsciousness.biodynamicCompliance}
- Farm Type: ${scenario.agricultureConsciousness.farmType || "Unknown"}`;
    }

    if (previousContext) {
      prompt += `\n\n--- Previous Agent Analyses ---${previousContext}`;
    }

    prompt += `\n\nProvide your analysis based on your specialty. Include:
1. Your specific findings
2. Confidence level (0-100%)
3. Specific recommendations

Be concise and actionable.`;

    return prompt;
  }

  private async generateConsensus(
    analyses: AgentAnalysis[],
    scenario: WorkflowResult,
  ): Promise<{ summary: string; tokens: number }> {
    subsection("🎯 Generating Consensus");

    const analysisContext = analyses
      .map((a) => `${a.agent} (${a.confidence}% confidence):\n${a.analysis}`)
      .join("\n\n---\n\n");

    const prompt = `You are a consensus builder. Multiple AI agents have analyzed a workflow issue.

Workflow: ${scenario.name}
Status: ${scenario.status}

Agent Analyses:
${analysisContext}

Synthesize these analyses into a unified action plan:
1. Summary of consensus points
2. Prioritized action items (from most to least critical)
3. Any conflicting opinions and resolution
4. Overall confidence score

Be concise and actionable.`;

    try {
      const response = await callOpenAI([{ role: "user", content: prompt }], {
        model: "gpt-4o",
        temperature: 0.3,
        maxTokens: 600,
      });

      log("✅ Consensus generated", "green");
      return { summary: response.content, tokens: response.tokens };
    } catch (error) {
      return {
        summary: "Consensus generation failed. Review individual analyses.",
        tokens: 0,
      };
    }
  }

  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      if (
        line.match(/^\d+\.|^-|^\*|^•/) &&
        (line.toLowerCase().includes("recommend") ||
          line.toLowerCase().includes("should") ||
          line.toLowerCase().includes("suggest") ||
          line.toLowerCase().includes("fix") ||
          line.toLowerCase().includes("update"))
      ) {
        recommendations.push(line.replace(/^[\d.\-*•\s]+/, "").trim());
      }
    }

    return recommendations.slice(0, 5);
  }

  private calculateVotes(analyses: AgentAnalysis[]): Record<string, number> {
    const votes: Record<string, number> = {};
    for (const analysis of analyses) {
      votes[analysis.agent] = analysis.confidence;
    }
    return votes;
  }
}

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runScenarioTest(
  scenarioKey: string,
  mode: CollaborationMode,
): Promise<void> {
  const scenario = TEST_SCENARIOS[scenarioKey];

  if (!scenario) {
    log(`❌ Unknown scenario: ${scenarioKey}`, "red");
    log(`   Available: ${Object.keys(TEST_SCENARIOS).join(", ")}`, "dim");
    return;
  }

  section(`🧪 Testing: ${scenario.name}`);

  log("📋 Scenario Details:", "bright");
  log(`   ID: ${scenario.id}`, "dim");
  log(`   Type: ${scenario.type}`, "dim");
  log(
    `   Status: ${scenario.status}`,
    scenario.status === "FAILED" ? "red" : "green",
  );
  log(`   Priority: ${scenario.priority}`, "yellow");
  log(`   Duration: ${scenario.duration}ms`, "dim");

  if (scenario.error) {
    log(`   Error: ${scenario.error.substring(0, 80)}...`, "red");
  }

  // Select agents based on scenario
  const agentRoles: AgentRole[] = ["FAILURE_ANALYST"];

  if (scenario.status === "FAILED" || scenario.priority === "CRITICAL") {
    agentRoles.push("HEALING_STRATEGIST");
  }

  if (scenario.duration > 60000) {
    agentRoles.push("PERFORMANCE_OPTIMIZER");
  }

  if (
    scenario.type === "ORDER_PLACEMENT" ||
    scenario.error?.includes("security")
  ) {
    agentRoles.push("SECURITY_AUDITOR");
  }

  if (scenario.agricultureConsciousness) {
    agentRoles.push("AGRICULTURAL_ADVISOR");
  }

  log(
    `\n🤖 Selected Agents: ${agentRoles.map((r) => AGENTS[r].name).join(", ")}`,
    "cyan",
  );

  const orchestrator = new WorkflowAgentOrchestrator({ mode });
  const result = await orchestrator.analyzeWorkflow(scenario, agentRoles);

  // Display results
  section("📊 ORCHESTRATION RESULTS");

  log(`Mode: ${result.mode}`, "bright");
  log(`Total Duration: ${(result.totalDuration / 1000).toFixed(2)}s`, "blue");
  log(`Tokens Used: ${result.tokensUsed}`, "dim");
  log(`Est. Cost: $${((result.tokensUsed / 1000) * 0.005).toFixed(4)}`, "dim");

  subsection("🎯 Consensus Summary");
  console.log(result.consensus);

  subsection("📊 Agent Voting Results");
  for (const [agent, confidence] of Object.entries(result.votingResults)) {
    const bar =
      "█".repeat(Math.floor(confidence / 5)) +
      "░".repeat(20 - Math.floor(confidence / 5));
    log(
      `${agent.padEnd(20)} [${bar}] ${confidence}%`,
      confidence >= 70 ? "green" : "yellow",
    );
  }
}

async function runAllScenarios(mode: CollaborationMode): Promise<void> {
  section("🎭 RUNNING ALL SCENARIOS");

  const scenarios = Object.keys(TEST_SCENARIOS);
  const totalTokens = 0;
  const totalDuration = 0;

  for (const scenarioKey of scenarios) {
    await runScenarioTest(scenarioKey, mode);
    await new Promise((r) => setTimeout(r, 2000)); // Rate limiting between scenarios
  }

  section("✅ ALL SCENARIOS COMPLETE");
}

async function runDemo(): Promise<void> {
  section("🎬 ORCHESTRATOR DEMONSTRATION");

  log(
    "This demo shows how multiple AI agents collaborate to analyze workflow issues.",
    "cyan",
  );
  log("\nAvailable Agents:", "bright");

  for (const [role, agent] of Object.entries(AGENTS)) {
    log(`\n  🤖 ${agent.name}`, "magenta");
    log(`     Role: ${role}`, "dim");
    log(`     Capabilities: ${agent.capabilities.join(", ")}`, "dim");
  }

  log("\n\nAvailable Test Scenarios:", "bright");
  for (const [key, scenario] of Object.entries(TEST_SCENARIOS)) {
    const statusIcon =
      scenario.status === "FAILED"
        ? "❌"
        : scenario.status === "WARNING"
          ? "⚠️"
          : "✅";
    log(`  ${statusIcon} ${key}: ${scenario.name} (${scenario.type})`, "white");
  }

  log("\n\nCollaboration Modes:", "bright");
  log(
    "  • SEQUENTIAL: Agents analyze one after another, building on previous insights",
    "white",
  );
  log("  • PARALLEL: All agents analyze simultaneously for speed", "white");
  log(
    "  • VOTING: Agents analyze and vote on recommendations (default)",
    "white",
  );

  subsection("Running Demo: Failure Analysis");

  await runScenarioTest("failure", "VOTING");
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(colors.cyan);
  console.log(
    "╔═══════════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║  🎭 WORKFLOW AGENT ORCHESTRATOR - MULTI-AGENT COLLABORATION          ║",
  );
  console.log(
    "║  Divine Agricultural Intelligence - Automated Analysis System         ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════════════╝",
  );
  console.log(colors.reset);

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    log("\n❌ OPENAI_API_KEY not found!", "red");
    log("\nAdd your key to .env.local:", "yellow");
    log('  echo "OPENAI_API_KEY=sk-your-key" >> .env.local', "cyan");
    process.exit(1);
  }

  log("✅ OpenAI API key found\n", "green");

  // Parse arguments
  const args = process.argv.slice(2);
  let mode: CollaborationMode = "VOTING";
  let scenario: string | undefined;
  let runAll = false;

  for (const arg of args) {
    if (arg.startsWith("--mode=")) {
      mode = arg.split("=")[1].toUpperCase() as CollaborationMode;
    }
    if (arg.startsWith("--scenario=")) {
      scenario = arg.split("=")[1].toLowerCase();
    }
    if (arg === "--all" || arg === "-a") {
      runAll = true;
    }
    if (arg === "--demo" || arg === "-d") {
      await runDemo();
      return;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`
Usage: npx tsx scripts/test-workflow-orchestrator.ts [options]

Options:
  --mode=MODE       Collaboration mode: SEQUENTIAL, PARALLEL, or VOTING (default)
  --scenario=NAME   Run specific scenario: failure, performance, security, agricultural, healing
  --all, -a         Run all test scenarios
  --demo, -d        Run demonstration with explanation
  --help, -h        Show this help

Examples:
  npx tsx scripts/test-workflow-orchestrator.ts --demo
  npx tsx scripts/test-workflow-orchestrator.ts --scenario=failure
  npx tsx scripts/test-workflow-orchestrator.ts --scenario=failure --mode=PARALLEL
  npx tsx scripts/test-workflow-orchestrator.ts --all --mode=SEQUENTIAL
`);
      return;
    }
  }

  if (runAll) {
    await runAllScenarios(mode);
  } else if (scenario) {
    await runScenarioTest(scenario, mode);
  } else {
    // Default: run demo
    await runDemo();
  }

  section("🎉 ORCHESTRATOR TEST COMPLETE");
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  log("\n\n🛑 Test interrupted", "yellow");
  process.exit(0);
});

main().catch((e) => {
  log(`\n❌ Fatal: ${e.message}`, "red");
  process.exit(1);
});
