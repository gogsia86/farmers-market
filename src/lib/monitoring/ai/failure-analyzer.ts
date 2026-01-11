/**
 * 🤖 AI-Powered Failure Analyzer
 * Farmers Market Platform - Intelligent Root Cause Analysis
 * Version: 2.0.0
 *
 * Uses OpenAI/Anthropic LLMs to analyze workflow failures, predict issues,
 * and provide actionable remediation steps with agricultural consciousness.
 */

// @ts-ignore - OpenAI module may not be available in all environments
import OpenAI from "openai";

import { logger } from "@/lib/monitoring/logger";

import type {
  WorkflowResult,
  FailureAnalysis,
  FailureRiskPrediction,
  WorkflowType,
} from "../types";

// ============================================================================
// AI FAILURE ANALYZER
// ============================================================================

export class AIFailureAnalyzer {
  private openai: OpenAI | null = null;
  private enabled: boolean;
  private model: string;
  private temperature: number;

  constructor(config?: {
    apiKey?: string;
    model?: string;
    temperature?: number;
    enabled?: boolean;
  }) {
    this.enabled = config?.enabled ?? true;
    this.model = config?.model ?? "gpt-4-turbo-preview";
    this.temperature = config?.temperature ?? 0.3;

    if (this.enabled) {
      const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;

      if (!apiKey) {
        logger.warn(
          "⚠️  OpenAI API key not configured. AI failure analysis disabled.",
        );
        this.enabled = false;
      } else {
        this.openai = new OpenAI({ apiKey });
        logger.info("✅ AI Failure Analyzer initialized with", {
          data: this.model,
        });
      }
    }
  }

  /**
   * ✅ ANALYZE FAILURE - Deep analysis of workflow failure
   */
  async analyzeFailure(
    workflowResult: WorkflowResult,
  ): Promise<FailureAnalysis> {
    if (!this.enabled || !this.openai) {
      return this.generateFallbackAnalysis(workflowResult);
    }

    const prompt = this.buildFailureAnalysisPrompt(workflowResult);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt("failure-analysis"),
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: this.temperature,
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message.content;
      if (!content) {
        throw new Error("Empty response from AI");
      }

      const analysis = JSON.parse(content);

      return {
        rootCause: analysis.rootCause || "Unable to determine root cause",
        remediationSteps:
          analysis.remediationSteps || analysis.immediateFix || [],
        preventionStrategy:
          analysis.preventionStrategy || analysis.prevention || "",
        relatedIssues: analysis.relatedIssues || [],
        confidence: analysis.confidence || 50,
        aiModel: this.model,
        timestamp: new Date(),
        estimatedFixTime: analysis.estimatedFixTime,
        severity: this.determineSeverity(workflowResult),
        immediateFix: analysis.immediateFix || [],
        longTermSolutions: analysis.longTermSolutions || [],
        similarIncidents: analysis.similarIncidents || [],
        documentationLinks: analysis.documentationLinks || [],
      };
    } catch (error) {
      logger.error("❌ AI failure analysis error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.generateFallbackAnalysis(workflowResult);
    }
  }

  /**
   * ✅ PREDICT FAILURE RISK - Predict failure probability
   */
  async predictFailureRisk(
    recentResults: WorkflowResult[],
  ): Promise<FailureRiskPrediction[]> {
    if (!this.enabled || !this.openai || recentResults.length === 0) {
      return [];
    }

    const patterns = this.extractPatterns(recentResults);
    const prompt = this.buildRiskPredictionPrompt(patterns);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt("risk-prediction"),
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message.content;
      if (!content) {
        throw new Error("Empty response from AI");
      }

      const prediction = JSON.parse(content);

      // Convert predictions to array format
      const predictions: FailureRiskPrediction[] = [];

      if (prediction.workflows && Array.isArray(prediction.workflows)) {
        for (const wp of prediction.workflows) {
          predictions.push({
            workflowId: wp.workflowId || wp.id || "unknown",
            riskScore: wp.riskScore || wp.risk || 0,
            confidence: wp.confidence || 50,
            predictedTimeToFailure: wp.predictedTimeToFailure,
            contributingFactors: wp.contributingFactors || wp.factors || [],
            recommendations: wp.recommendations || [],
            mitigationSteps: wp.mitigationSteps || wp.mitigation || [],
            timestamp: new Date(),
          });
        }
      }

      return predictions;
    } catch (error) {
      logger.error("❌ AI risk prediction error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * ✅ ANALYZE PERFORMANCE - Analyze performance trends
   */
  async analyzePerformance(workflowResults: WorkflowResult[]): Promise<{
    summary: string;
    bottlenecks: string[];
    optimizations: string[];
    trend: "IMPROVING" | "STABLE" | "DEGRADING";
  }> {
    if (!this.enabled || !this.openai || workflowResults.length === 0) {
      return {
        summary: "Insufficient data for analysis",
        bottlenecks: [],
        optimizations: [],
        trend: "STABLE",
      };
    }

    const metrics = this.extractPerformanceMetrics(workflowResults);
    const prompt = this.buildPerformanceAnalysisPrompt(metrics);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt("performance-analysis"),
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message.content;
      if (!content) {
        throw new Error("Empty response from AI");
      }

      const analysis = JSON.parse(content);

      return {
        summary: analysis.summary || "No significant findings",
        bottlenecks: analysis.bottlenecks || [],
        optimizations: analysis.optimizations || [],
        trend: analysis.trend || "STABLE",
      };
    } catch (error) {
      logger.error("❌ AI performance analysis error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        summary: "Analysis unavailable",
        bottlenecks: [],
        optimizations: [],
        trend: "STABLE",
      };
    }
  }

  /**
   * ✅ GENERATE EXECUTIVE SUMMARY - Create human-readable summary
   */
  async generateExecutiveSummary(
    report: {
      totalWorkflows: number;
      passedWorkflows: number;
      failedWorkflows: number;
      successRate: number;
      criticalIssues: number;
    },
    failedWorkflows: WorkflowResult[],
  ): Promise<string> {
    if (!this.enabled || !this.openai) {
      return this.generateBasicSummary(report);
    }

    const prompt = `Generate a concise executive summary for this monitoring report:

Total Workflows: ${report.totalWorkflows}
Passed: ${report.passedWorkflows}
Failed: ${report.failedWorkflows}
Success Rate: ${report.successRate.toFixed(2)}%
Critical Issues: ${report.criticalIssues}

Failed Workflows:
${failedWorkflows
  .map((w: any) => `- ${w.name} (${w.type}): ${w.error || "Unknown error"}`)
  .join("\n")}

Provide:
1. Overall health assessment (2-3 sentences)
2. Key concerns (bullet points)
3. Immediate actions required (if any)
4. Agricultural consciousness notes (if applicable)

Keep it concise and actionable for executives.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert DevOps consultant providing executive summaries for agricultural e-commerce monitoring.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 500,
      });

      return (
        completion.choices[0]?.message.content ||
        this.generateBasicSummary(report)
      );
    } catch (error) {
      logger.error("❌ AI executive summary error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.generateBasicSummary(report);
    }
  }

  /**
   * ✅ SUGGEST REMEDIATION - Suggest specific remediation actions
   */
  async suggestRemediation(
    workflowType: WorkflowType,
    errorMessage: string,
  ): Promise<string[]> {
    if (!this.enabled || !this.openai) {
      return this.getFallbackRemediation(workflowType);
    }

    const prompt = `Suggest specific remediation steps for this workflow failure:

Workflow Type: ${workflowType}
Error: ${errorMessage}

Provide 3-5 specific, actionable remediation steps.
Format as JSON array of strings.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt("remediation"),
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = completion.choices[0]?.message.content;
      if (!content) {
        throw new Error("Empty response from AI");
      }

      const response = JSON.parse(content);
      return response.steps || response.remediationSteps || [];
    } catch (error) {
      logger.error("❌ AI remediation suggestion error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.getFallbackRemediation(workflowType);
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private buildFailureAnalysisPrompt(result: WorkflowResult): string {
    const failedSteps = result.steps.filter((s: any) => !s.success);

    return `Analyze this workflow failure as a senior DevOps engineer specializing in agricultural e-commerce:

**Workflow Information:**
- Name: ${result.name}
- Type: ${result.type}
- Priority: ${result.priority}
- Duration: ${result.duration}ms
- Season: ${this.getCurrentSeason()}

**Failure Details:**
- Error: ${result.error || "Unknown error"}
- Failed Steps: ${result.failedSteps} out of ${result.totalSteps}
- Screenshots Available: ${result.screenshots.length}

**Failed Step Details:**
${failedSteps
  .map(
    (step, i) =>
      `${i + 1}. Duration: ${step.duration}ms
   Error: ${step.error?.message || "Unknown"}
   Logs: ${step.logs.join("; ")}`,
  )
  .join("\n\n")}

**Performance Metrics:**
- Page Load Time: ${result.metrics.pageLoadTime || "N/A"}ms
- API Response Time: ${result.metrics.apiResponseTime || "N/A"}ms
- Network Requests: ${result.metrics.networkRequests || "N/A"}
- Errors: ${result.metrics.errors || 0}

**Provide JSON response with:**
{
  "rootCause": "Specific root cause analysis",
  "confidence": 0-100,
  "immediateFix": ["Step 1", "Step 2", "..."],
  "longTermSolutions": ["Solution 1", "Solution 2", "..."],
  "preventionStrategy": "Long-term prevention approach",
  "relatedIssues": ["Issue 1", "Issue 2"],
  "estimatedFixTime": "Time estimate (e.g., '15 minutes', '1 hour')",
  "similarIncidents": ["Similar past issues"],
  "documentationLinks": ["Relevant docs"]
}`;
  }

  private buildRiskPredictionPrompt(patterns: any): string {
    return `Given these workflow execution patterns over the last 24 hours, predict failure risks:

${JSON.stringify(patterns, null, 2)}

**Analysis Requirements:**
- Consider increasing error rates
- Performance degradation trends
- Time-of-day patterns
- Seasonal agricultural factors (current season: ${this.getCurrentSeason()})
- Historical failure patterns

**Provide JSON response:**
{
  "workflows": [
    {
      "workflowId": "workflow-id",
      "riskScore": 0-100,
      "confidence": 0-100,
      "predictedTimeToFailure": "time estimate or null",
      "contributingFactors": ["factor1", "factor2"],
      "recommendations": ["recommendation1", "recommendation2"],
      "mitigationSteps": ["step1", "step2"]
    }
  ]
}`;
  }

  private buildPerformanceAnalysisPrompt(metrics: any): string {
    return `Analyze these workflow performance metrics:

${JSON.stringify(metrics, null, 2)}

Identify:
1. Performance trends (improving/stable/degrading)
2. Bottlenecks and slow operations
3. Optimization opportunities
4. Resource utilization issues

Provide JSON response:
{
  "summary": "Brief overview of performance health",
  "trend": "IMPROVING" | "STABLE" | "DEGRADING",
  "bottlenecks": ["bottleneck1", "bottleneck2"],
  "optimizations": ["optimization1", "optimization2"]
}`;
  }

  private getSystemPrompt(type: string): string {
    const basePrompt = `You are a senior DevOps engineer specializing in agricultural e-commerce platforms.
You have deep expertise in:
- Next.js and React applications
- Playwright test automation
- Performance optimization
- Root cause analysis
- Agricultural domain knowledge (farming, seasonal patterns, biodynamic practices)

Provide practical, actionable insights with agricultural consciousness.`;

    switch (type) {
      case "failure-analysis":
        return `${
          basePrompt
        }\n\nFocus on identifying root causes and providing step-by-step remediation.`;

      case "risk-prediction":
        return `${
          basePrompt
        }\n\nFocus on predictive analysis and proactive issue prevention.`;

      case "performance-analysis":
        return `${
          basePrompt
        }\n\nFocus on performance bottlenecks and optimization opportunities.`;

      case "remediation":
        return `${basePrompt}\n\nFocus on specific, implementable remediation steps.`;

      default:
        return basePrompt;
    }
  }

  private extractPatterns(results: WorkflowResult[]): any {
    const grouped = this.groupByType(results);

    return {
      totalRuns: results.length,
      failureRate:
        results.filter((r: any) => r.status === "FAILED").length /
        results.length,
      averageDuration:
        results.reduce((sum: any, r: any) => sum + r.duration, 0) /
        results.length,
      performanceTrend: this.calculateTrend(
        results.map((r: any) => r.duration),
      ),
      commonErrors: this.groupErrors(results.filter((r: any) => r.error)),
      timeDistribution: this.analyzeTimeDistribution(results),
      workflowTypeBreakdown: Object.entries(grouped).map(
        ([type, workflows]) => ({
          type,
          total: workflows.length,
          failed: workflows.filter((w: any) => w.status === "FAILED").length,
          avgDuration:
            workflows.reduce((sum: any, w: any) => sum + w.duration, 0) /
            workflows.length,
        }),
      ),
      season: this.getCurrentSeason(),
    };
  }

  private extractPerformanceMetrics(results: WorkflowResult[]): any {
    return {
      count: results.length,
      averages: {
        duration:
          results.reduce((sum: any, r: any) => sum + r.duration, 0) /
          results.length,
        pageLoadTime:
          results.reduce(
            (sum: any, r: any) => sum + (r.metrics.pageLoadTime || 0),
            0,
          ) / results.length,
        apiResponseTime:
          results.reduce(
            (sum, r) => sum + (r.metrics.apiResponseTime || 0),
            0,
          ) / results.length,
      },
      p95: this.calculatePercentile(
        results.map((r: any) => r.duration),
        0.95,
      ),
      p99: this.calculatePercentile(
        results.map((r: any) => r.duration),
        0.99,
      ),
      errorRate:
        results.filter((r: any) => r.status === "FAILED").length /
        results.length,
      trend: this.calculateTrend(results.map((r: any) => r.duration)),
    };
  }

  private groupByType(
    results: WorkflowResult[],
  ): Record<string, WorkflowResult[]> {
    return results.reduce(
      (acc, result) => {
        if (!acc[result.type]) {
          acc[result.type] = [];
        }
        acc[result.type]?.push(result);
        return acc;
      },
      {} as Record<string, WorkflowResult[]>,
    );
  }

  private groupErrors(results: WorkflowResult[]): Record<string, number> {
    return results.reduce(
      (acc, result) => {
        const error = result.error || "Unknown error";
        if (acc) {
          acc[error] = (acc[error] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private analyzeTimeDistribution(results: WorkflowResult[]): any {
    const hours = results.reduce(
      (acc, result) => {
        const hour = result.startTime.getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    return hours;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const avgFirst =
      firstHalf.reduce((sum: any, v: any) => sum + v, 0) / firstHalf.length;
    const avgSecond =
      secondHalf.reduce((sum: any, v: any) => sum + v, 0) / secondHalf.length;

    return ((avgSecond - avgFirst) / avgFirst) * 100;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;

    return sorted[index] || 0;
  }

  private determineSeverity(
    result: WorkflowResult,
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (result.priority === "CRITICAL") return "CRITICAL";
    if (result.priority === "HIGH") return "HIGH";
    if (result.failedSteps > result.totalSteps / 2) return "HIGH";
    if (result.failedSteps > 0) return "MEDIUM";
    return "LOW";
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }

  private generateFallbackAnalysis(result: WorkflowResult): FailureAnalysis {
    return {
      rootCause: result.error || "Workflow execution failed",
      remediationSteps: [
        "Review error logs and screenshots",
        "Check system resources and connectivity",
        "Verify test data and environment configuration",
        "Retry workflow execution",
      ],
      preventionStrategy:
        "Implement comprehensive error handling and monitoring",
      relatedIssues: [],
      confidence: 30,
      aiModel: "fallback",
      timestamp: new Date(),
      severity: this.determineSeverity(result),
      immediateFix: [
        "Check application logs",
        "Verify service availability",
        "Review recent deployments",
      ],
      longTermSolutions: [
        "Add comprehensive monitoring",
        "Implement circuit breakers",
        "Enhance error handling",
      ],
    };
  }

  private generateBasicSummary(report: any): string {
    const health =
      report.successRate >= 95
        ? "EXCELLENT"
        : report.successRate >= 80
          ? "GOOD"
          : report.successRate >= 60
            ? "FAIR"
            : "POOR";

    return `Monitoring Report Summary:

Overall Health: ${health} (${report.successRate.toFixed(1)}% success rate)

- Total Workflows Executed: ${report.totalWorkflows}
- Passed: ${report.passedWorkflows}
- Failed: ${report.failedWorkflows}
- Critical Issues: ${report.criticalIssues}

${
  report.criticalIssues > 0
    ? `⚠️  IMMEDIATE ACTION REQUIRED: ${report.criticalIssues} critical issue(s) detected.`
    : "✅ No critical issues detected."
}

${
  report.failedWorkflows > 0
    ? "Review failed workflows and implement recommended fixes."
    : "All workflows executed successfully."
}`;
  }

  private getFallbackRemediation(workflowType: WorkflowType): string[] {
    const remediation: Record<WorkflowType, string[]> = {
      USER_REGISTRATION: [
        "Verify email service is operational",
        "Check database connectivity",
        "Review validation rules",
      ],
      USER_LOGIN: [
        "Verify authentication service",
        "Check session management",
        "Review password validation",
      ],
      FARM_CREATION: [
        "Verify database schema",
        "Check file upload service",
        "Review farm validation rules",
      ],
      PRODUCT_LISTING: [
        "Verify product catalog service",
        "Check image processing",
        "Review inventory management",
      ],
      ORDER_PLACEMENT: [
        "Verify payment service connectivity",
        "Check inventory availability",
        "Review order processing pipeline",
      ],
      PAYMENT_PROCESSING: [
        "Verify payment gateway status",
        "Check webhook configuration",
        "Review transaction logs",
      ],
      SEARCH_FUNCTIONALITY: [
        "Verify search index status",
        "Check query performance",
        "Review search parameters",
      ],
      CART_MANAGEMENT: [
        "Verify cart state management",
        "Check session storage",
        "Review cart validation",
      ],
      PROFILE_UPDATE: [
        "Verify user service availability",
        "Check profile validation",
        "Review authorization",
      ],
      HEALTH_CHECK: [
        "Check all service endpoints",
        "Verify database connectivity",
        "Review system resources",
      ],
    };

    return (
      remediation[workflowType] || [
        "Review error logs",
        "Check service health",
        "Verify configuration",
      ]
    );
  }

  /**
   * Check if analyzer is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get analyzer configuration
   */
  getConfig() {
    return {
      enabled: this.enabled,
      model: this.model,
      temperature: this.temperature,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create AI failure analyzer
 */
export function createFailureAnalyzer(config?: {
  apiKey?: string;
  model?: string;
  temperature?: number;
  enabled?: boolean;
}): AIFailureAnalyzer {
  return new AIFailureAnalyzer(config);
}

/**
 * Create analyzer from environment
 */
export function createAnalyzerFromEnv(): AIFailureAnalyzer {
  return new AIFailureAnalyzer({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.AI_MODEL || "gpt-4-turbo-preview",
    temperature: process.env.AI_TEMPERATURE
      ? parseFloat(process.env.AI_TEMPERATURE)
      : 0.3,
    enabled: process.env.AI_ANALYSIS_ENABLED !== "false",
  });
}
