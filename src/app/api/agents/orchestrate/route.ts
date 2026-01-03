/**
 * 🎭 Workflow Agent Orchestrator API Route
 * Farmers Market Platform - Multi-Agent Analysis Endpoint
 * Version: 2.0.0 - With Authentication & Bridge Integration
 *
 * POST /api/agents/orchestrate - Execute orchestrator actions
 * GET /api/agents/orchestrate - Get orchestrator status
 *
 * Triggers multi-agent collaboration to analyze workflow issues,
 * optimize performance, audit security, and validate agricultural consciousness.
 */

import {
  hasRequiredScopes,
  withApiAuth,
  type ApiKeyScope,
  type AuthResult,
} from "@/lib/auth/api-auth";
import { createLogger } from "@/lib/logger";
import {
  createOrchestratorFromEnv,
  createWorkflowAgentOrchestrator,
} from "@/lib/monitoring/agents/workflow-agent-orchestrator";
import { createOrchestratorBridge } from "@/lib/monitoring/integration/orchestrator-bridge";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("agents-orchestrate-api");

// ============================================================================
// Types
// ============================================================================

interface OrchestrateRequest {
  action:
  | "analyze_failure"
  | "optimize_performance"
  | "audit_security"
  | "validate_agricultural"
  | "process_and_heal";
  workflowResult?: WorkflowResultInput;
  historicalResults?: WorkflowResultInput[];
  config?: {
    collaborationMode?: "SEQUENTIAL" | "PARALLEL" | "VOTING";
    consensusThreshold?: number;
  };
}

interface WorkflowResultInput {
  id?: string;
  name: string;
  type: string;
  status: "PASSED" | "FAILED" | "WARNING";
  priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  duration?: number;
  totalSteps?: number;
  failedSteps?: number;
  passedSteps?: number;
  skippedSteps?: number;
  error?: string;
  stackTrace?: string;
  agricultureConsciousness?: {
    season?: string;
    biodynamicCompliance?: boolean;
    farmType?: string;
  };
}

// ============================================================================
// Scope Requirements
// ============================================================================

const ACTION_SCOPES: Record<string, ApiKeyScope[]> = {
  analyze_failure: ["orchestrator:read", "orchestrator:write"],
  optimize_performance: ["orchestrator:read", "orchestrator:write"],
  audit_security: ["orchestrator:read", "orchestrator:write"],
  validate_agricultural: ["orchestrator:read"],
  process_and_heal: ["orchestrator:execute", "remediation:execute"],
};

// ============================================================================
// POST Handler
// ============================================================================

async function handlePost(
  request: NextRequest,
  authResult: AuthResult,
): Promise<NextResponse> {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "OPENAI_KEY_MISSING",
            message: "OpenAI API key is not configured",
          },
        },
        { status: 500 },
      );
    }

    // Parse request body
    const body: OrchestrateRequest = await request.json();

    // Validate action
    const validActions = [
      "analyze_failure",
      "optimize_performance",
      "audit_security",
      "validate_agricultural",
      "process_and_heal",
    ];

    if (!body.action || !validActions.includes(body.action)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ACTION",
            message: `Invalid action. Must be one of: ${validActions.join(", ")}`,
          },
        },
        { status: 400 },
      );
    }

    // Check action-specific scopes
    const requiredScopes = ACTION_SCOPES[body.action];
    if (requiredScopes && !hasRequiredScopes(authResult, requiredScopes)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: `Action '${body.action}' requires scopes: ${requiredScopes.join(", ")}`,
          },
        },
        { status: 403 },
      );
    }

    // Handle process_and_heal with the bridge
    if (body.action === "process_and_heal") {
      return await handleProcessAndHeal(body, authResult);
    }

    // Create orchestrator
    const orchestrator = body.config
      ? createWorkflowAgentOrchestrator({
        apiKey: process.env.OPENAI_API_KEY,
        enabled: true,
        collaborationMode: body.config.collaborationMode,
        consensusThreshold: body.config.consensusThreshold,
      })
      : createOrchestratorFromEnv();

    // Check if orchestrator is enabled
    if (!orchestrator.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORCHESTRATOR_DISABLED",
            message: "Agent orchestrator is disabled",
          },
        },
        { status: 503 },
      );
    }

    const startTime = Date.now();
    let result: unknown;

    // Execute requested action
    switch (body.action) {
      case "analyze_failure":
        if (!body.workflowResult) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "MISSING_WORKFLOW_RESULT",
                message:
                  "workflowResult is required for analyze_failure action",
              },
            },
            { status: 400 },
          );
        }
        result = await orchestrator.analyzeWorkflowFailure(
          normalizeWorkflowResult(body.workflowResult),
        );
        break;

      case "optimize_performance":
        if (!body.historicalResults || body.historicalResults.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "MISSING_HISTORICAL_RESULTS",
                message:
                  "historicalResults array is required for optimize_performance action",
              },
            },
            { status: 400 },
          );
        }
        result = await orchestrator.optimizeWorkflowPerformance(
          body.historicalResults.map(normalizeWorkflowResult),
        );
        break;

      case "audit_security":
        if (!body.workflowResult) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "MISSING_WORKFLOW_RESULT",
                message: "workflowResult is required for audit_security action",
              },
            },
            { status: 400 },
          );
        }
        result = await orchestrator.auditWorkflowSecurity(
          normalizeWorkflowResult(body.workflowResult),
        );
        break;

      case "validate_agricultural":
        if (!body.workflowResult) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "MISSING_WORKFLOW_RESULT",
                message:
                  "workflowResult is required for validate_agricultural action",
              },
            },
            { status: 400 },
          );
        }
        result = await orchestrator.validateAgriculturalConsciousness(
          normalizeWorkflowResult(body.workflowResult),
        );
        break;
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        action: body.action,
        result,
        metadata: {
          duration,
          agentCount: orchestrator.getAgentCount(),
          timestamp: new Date().toISOString(),
          authenticatedVia: authResult.method,
        },
      },
    });
  } catch (error) {
    logger.error("Orchestrator API error", error as Error, {
      endpoint: "POST /api/agents/orchestrate",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORCHESTRATION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// Process and Heal Handler
// ============================================================================

async function handleProcessAndHeal(
  body: OrchestrateRequest,
  authResult: AuthResult,
): Promise<NextResponse> {
  if (!body.workflowResult) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MISSING_WORKFLOW_RESULT",
          message: "workflowResult is required for process_and_heal action",
        },
      },
      { status: 400 },
    );
  }

  const startTime = Date.now();

  try {
    // Create bridge instance
    const bridge = createOrchestratorBridge({
      enabled: true,
      autoAnalyze: true,
      autoRemediate: true,
    });

    // Normalize the workflow result
    const normalizedResult = normalizeWorkflowResult(body.workflowResult);

    // Process through the bridge
    const outcome = await bridge.processWorkflowResult(normalizedResult);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        action: "process_and_heal",
        analyzed: outcome.analyzed,
        remediated: outcome.remediated,
        plan: outcome.plan
          ? {
            id: outcome.plan.id,
            severity: outcome.plan.severity,
            approvalStatus: outcome.plan.approvalStatus,
            aiConfidence: outcome.plan.aiAnalysis.confidence,
            rootCause: outcome.plan.aiAnalysis.rootCause,
            proposedActions: outcome.plan.proposedActions.map((a) => ({
              type: a.type,
              description: a.description,
              riskLevel: a.riskLevel,
            })),
          }
          : null,
        executionResult: outcome.executionResult
          ? {
            success: outcome.executionResult.success,
            finalState: outcome.executionResult.finalState,
            duration: outcome.executionResult.duration,
            actionsExecuted: outcome.executionResult.actionsExecuted.length,
            errors: outcome.executionResult.errors,
          }
          : null,
        metadata: {
          duration,
          timestamp: new Date().toISOString(),
          authenticatedVia: authResult.method,
        },
      },
    });
  } catch (error) {
    logger.error("Orchestrator API Process and Heal error", error as Error, {
      endpoint: "POST /api/agents/orchestrate",
      action: "process_and_heal",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REMEDIATION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// GET Handler - Status & Info
// ============================================================================

async function handleGet(
  _request: NextRequest,
  authResult: AuthResult,
): Promise<NextResponse> {
  try {
    const orchestrator = createOrchestratorFromEnv();
    const bridge = createOrchestratorBridge();

    return NextResponse.json({
      success: true,
      data: {
        orchestrator: {
          status: orchestrator.isEnabled() ? "enabled" : "disabled",
          agentCount: orchestrator.getAgentCount(),
          agents: [
            {
              role: "FAILURE_ANALYST",
              name: "Failure Analyst",
              capabilities: [
                "root-cause-analysis",
                "error-diagnosis",
                "remediation-planning",
              ],
            },
            {
              role: "PERFORMANCE_OPTIMIZER",
              name: "Performance Optimizer",
              capabilities: [
                "performance-analysis",
                "bottleneck-identification",
                "optimization",
              ],
            },
            {
              role: "SECURITY_AUDITOR",
              name: "Security Auditor",
              capabilities: [
                "security-audit",
                "vulnerability-detection",
                "compliance-checking",
              ],
            },
            {
              role: "AGRICULTURAL_ADVISOR",
              name: "Agricultural Advisor",
              capabilities: [
                "agricultural-validation",
                "seasonal-analysis",
                "domain-expertise",
              ],
            },
            {
              role: "HEALING_STRATEGIST",
              name: "Healing Strategist",
              capabilities: [
                "self-healing-design",
                "remediation-strategy",
                "recovery-planning",
              ],
            },
          ],
        },
        bridge: {
          status: bridge.isEnabled() ? "enabled" : "disabled",
          orchestratorAvailable: bridge.isOrchestratorAvailable(),
          statistics: bridge.getStatistics(),
        },
        availableActions: [
          {
            action: "analyze_failure",
            description: "Multi-agent analysis of workflow failures",
            requiredFields: ["workflowResult"],
            requiredScopes: ["orchestrator:read", "orchestrator:write"],
          },
          {
            action: "optimize_performance",
            description: "Performance optimization recommendations",
            requiredFields: ["historicalResults"],
            requiredScopes: ["orchestrator:read", "orchestrator:write"],
          },
          {
            action: "audit_security",
            description: "Security vulnerability assessment",
            requiredFields: ["workflowResult"],
            requiredScopes: ["orchestrator:read", "orchestrator:write"],
          },
          {
            action: "validate_agricultural",
            description: "Agricultural consciousness validation",
            requiredFields: ["workflowResult"],
            requiredScopes: ["orchestrator:read"],
          },
          {
            action: "process_and_heal",
            description: "Full analysis and auto-remediation pipeline",
            requiredFields: ["workflowResult"],
            requiredScopes: ["orchestrator:execute", "remediation:execute"],
          },
        ],
        collaborationModes: ["SEQUENTIAL", "PARALLEL", "VOTING"],
        authentication: {
          method: authResult.method,
          scopes: authResult.scopes,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "STATUS_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// Helpers
// ============================================================================

function normalizeWorkflowResult(input: WorkflowResultInput): any {
  return {
    workflowId: input.id || `wf-${Date.now()}`,
    runId: `run-${Date.now()}`,
    name: input.name,
    type: input.type,
    status: input.status,
    priority: input.priority || "MEDIUM",
    startTime: new Date(),
    endTime: new Date(),
    duration: input.duration || 0,
    totalSteps: input.totalSteps || 0,
    passedSteps: input.passedSteps || 0,
    failedSteps: input.failedSteps || 0,
    skippedSteps: input.skippedSteps || 0,
    error: input.error,
    stackTrace: input.stackTrace,
    screenshots: [],
    traces: [],
    metrics: {
      totalDuration: input.duration || 0,
    },
    agricultureConsciousness: input.agricultureConsciousness,
    tags: [],
    steps: [],
    workflow: {
      id: input.id || `wf-${Date.now()}`,
      name: input.name,
      type: input.type,
    },
  };
}

// ============================================================================
// Export Wrapped Handlers
// ============================================================================

export const POST = withApiAuth(handlePost, {
  requireAuth: process.env.NODE_ENV === "production",
  allowedMethods: ["API_KEY", "SESSION", "JWT"],
  requiredScopes: ["orchestrator:read"], // Minimum scope, action-specific checks inside
  rateLimit: {
    enabled: true,
    maxRequests: 30, // 30 requests per minute
    windowMs: 60 * 1000,
  },
  bypassInDevelopment: true, // Allow unauthenticated in dev
});

export const GET = withApiAuth(handleGet, {
  requireAuth: false, // Status endpoint can be public
  allowedMethods: ["API_KEY", "SESSION", "JWT"],
  rateLimit: {
    enabled: true,
    maxRequests: 100, // 100 requests per minute for status
    windowMs: 60 * 1000,
  },
  bypassInDevelopment: true,
});
