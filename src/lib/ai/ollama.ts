/**
 * 🌟 OLLAMA LOCAL LLM INTEGRATION
 * Divine Agricultural AI - HP OMEN Optimized
 * Model: DeepSeek-R1:7b
 *
 * Leverages local GPU acceleration on RTX 2070 Max-Q
 * Optimized for agricultural domain knowledge
 */

import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("ollama-ai");

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaGenerateOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  num_predict?: number;
  stop?: string[];
  stream?: boolean;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families?: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface AgriculturalAnalysisResult {
  analysis: string;
  recommendations: string[];
  confidence: number;
  agriculturalRelevance: number;
  seasonalConsiderations?: string[];
  citations?: string[];
}

export interface FarmingAdvisoryResult {
  advice: string;
  actionItems: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  biodynamicScore: number;
  quantumCoherence: number;
}

// ============================================================================
// OLLAMA CLIENT
// ============================================================================

export class OllamaClient {
  private baseUrl: string;
  private model: string;
  private conversationHistory: Map<string, OllamaMessage[]>;

  constructor(baseUrl = "http://localhost:11434", model = "deepseek-r1:7b") {
    this.baseUrl = baseUrl;
    this.model = model;
    this.conversationHistory = new Map();
  }

  /**
   * Check if Ollama server is running and accessible
   */
  async healthCheck(): Promise<boolean> {
    return tracer.startActiveSpan("ollama.healthCheck", async (span) => {
      try {
        const response = await fetch(`${this.baseUrl}/api/tags`, {
          method: "GET",
        });

        const isHealthy = response.ok;
        span.setStatus({
          code: isHealthy ? SpanStatusCode.OK : SpanStatusCode.ERROR,
        });
        span.setAttribute("ollama.healthy", isHealthy);

        return isHealthy;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message:
            error instanceof Error ? error.message : "Health check failed",
        });
        return false;
      } finally {
        span.end();
      }
    });
  }

  /**
   * List available models
   */
  async listModels(): Promise<OllamaModelInfo[]> {
    return tracer.startActiveSpan("ollama.listModels", async (span) => {
      try {
        const response = await fetch(`${this.baseUrl}/api/tags`);

        if (!response.ok) {
          throw new Error(`Failed to list models: ${response.statusText}`);
        }

        const data = await response.json();
        const models = data.models || [];

        span.setAttribute("ollama.models.count", models.length);
        span.setStatus({ code: SpanStatusCode.OK });

        return models;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message:
            error instanceof Error ? error.message : "Failed to list models",
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Generate completion with Ollama
   */
  async generate(
    prompt: string,
    options: OllamaGenerateOptions = {},
  ): Promise<string> {
    return tracer.startActiveSpan("ollama.generate", async (span) => {
      const startTime = Date.now();

      span.setAttributes({
        "ai.model": options.model || this.model,
        "ai.temperature": options.temperature || 0.7,
        "ai.prompt.length": prompt.length,
      });

      try {
        const requestBody = {
          model: options.model || this.model,
          prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            top_k: options.top_k || 40,
            num_predict: options.num_predict || 2048,
            stop: options.stop,
          },
        };

        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Ollama API error: ${response.statusText} - ${JSON.stringify(errorData)}`,
          );
        }

        const result: OllamaResponse = await response.json();
        const duration = Date.now() - startTime;

        span.setAttributes({
          "ai.response.length": result.response.length,
          "ai.response.eval_count": result.eval_count || 0,
          "ai.response.eval_duration_ms": result.eval_duration
            ? result.eval_duration / 1_000_000
            : 0,
          duration_ms: duration,
        });

        span.setStatus({ code: SpanStatusCode.OK });

        return result.response;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Generation failed",
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Chat completion with conversation history
   */
  async chat(
    messages: OllamaMessage[],
    options: OllamaGenerateOptions = {},
  ): Promise<OllamaChatResponse> {
    return tracer.startActiveSpan("ollama.chat", async (span) => {
      const startTime = Date.now();

      span.setAttributes({
        "ai.model": options.model || this.model,
        "ai.message_count": messages.length,
        "ai.temperature": options.temperature || 0.7,
      });

      try {
        const requestBody = {
          model: options.model || this.model,
          messages,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            top_k: options.top_k || 40,
            num_predict: options.num_predict || 2048,
            stop: options.stop,
          },
        };

        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Ollama API error: ${response.statusText} - ${JSON.stringify(errorData)}`,
          );
        }

        const result: OllamaChatResponse = await response.json();
        const duration = Date.now() - startTime;

        span.setAttributes({
          "ai.response.length": result.message.content.length,
          "ai.response.eval_count": result.eval_count || 0,
          "ai.response.eval_duration_ms": result.eval_duration
            ? result.eval_duration / 1_000_000
            : 0,
          duration_ms: duration,
        });

        span.setStatus({ code: SpanStatusCode.OK });

        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Chat failed",
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Create a conversation thread
   */
  createThread(threadId: string): void {
    this.conversationHistory.set(threadId, []);
  }

  /**
   * Add message to thread
   */
  addToThread(threadId: string, message: OllamaMessage): void {
    const history = this.conversationHistory.get(threadId) || [];
    history.push(message);
    this.conversationHistory.set(threadId, history);
  }

  /**
   * Get thread history
   */
  getThreadHistory(threadId: string): OllamaMessage[] {
    return this.conversationHistory.get(threadId) || [];
  }

  /**
   * Clear thread
   */
  clearThread(threadId: string): void {
    this.conversationHistory.delete(threadId);
  }
}

// ============================================================================
// AGRICULTURAL ANALYSIS AGENT
// ============================================================================

export class AgriculturalAnalysisAgent {
  private client: OllamaClient;
  private systemPrompt: string;

  constructor(client: OllamaClient) {
    this.client = client;
    this.systemPrompt = `You are an expert agricultural AI assistant with deep knowledge of:
- Biodynamic farming principles and lunar cycles
- Seasonal crop planning and rotation strategies
- Soil health, composting, and organic fertilization
- Pest management using natural methods
- Water conservation and irrigation optimization
- Climate adaptation and regenerative agriculture
- Local food systems and farmers market operations

Provide practical, actionable advice grounded in sustainable farming practices.
Always consider the holistic farm ecosystem and long-term soil health.`;
  }

  /**
   * Analyze agricultural data or questions
   */
  async analyze(
    query: string,
    context?: Record<string, unknown>,
  ): Promise<AgriculturalAnalysisResult> {
    return tracer.startActiveSpan("agricultural.analyze", async (span) => {
      span.setAttribute("analysis.query", query);

      try {
        const contextPrompt = context
          ? `\n\nContext:\n${JSON.stringify(context, null, 2)}`
          : "";

        const messages: OllamaMessage[] = [
          {
            role: "system",
            content: this.systemPrompt,
          },
          {
            role: "user",
            content: `${query}${contextPrompt}\n\nProvide a detailed analysis with actionable recommendations.`,
          },
        ];

        const response = await this.client.chat(messages, {
          temperature: 0.7,
          num_predict: 1024,
        });

        const analysis = response.message.content;
        const recommendations = this.extractRecommendations(analysis);
        const confidence = this.assessConfidence(analysis);
        const agriculturalRelevance = this.calculateRelevance(analysis);
        const seasonalConsiderations = this.extractSeasonalInfo(analysis);

        span.setAttributes({
          "analysis.confidence": confidence,
          "analysis.relevance": agriculturalRelevance,
          "analysis.recommendations_count": recommendations.length,
        });

        span.setStatus({ code: SpanStatusCode.OK });

        return {
          analysis,
          recommendations,
          confidence,
          agriculturalRelevance,
          seasonalConsiderations,
        };
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Analysis failed",
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Get farming advisory for specific situation
   */
  async getFarmingAdvisory(
    situation: string,
    farmData?: Record<string, unknown>,
  ): Promise<FarmingAdvisoryResult> {
    return tracer.startActiveSpan("agricultural.advisory", async (span) => {
      try {
        const farmContext = farmData
          ? `\n\nFarm Data:\n${JSON.stringify(farmData, null, 2)}`
          : "";

        const prompt = `As a biodynamic farming advisor, analyze this situation and provide divine agricultural guidance:

${situation}${farmContext}

Provide:
1. Immediate advice and action items
2. Risk assessment (LOW/MEDIUM/HIGH)
3. Biodynamic scoring (0-100)
4. Quantum coherence level (0-100) - how aligned with natural cycles`;

        const analysis = await this.client.generate(prompt, {
          temperature: 0.6,
          num_predict: 1024,
        });

        const actionItems = this.extractActionItems(analysis);
        const riskLevel = this.assessRiskLevel(analysis);
        const biodynamicScore = this.calculateBiodynamicScore(analysis);
        const quantumCoherence = this.calculateQuantumCoherence(analysis);

        span.setAttributes({
          "advisory.risk_level": riskLevel,
          "advisory.biodynamic_score": biodynamicScore,
          "advisory.quantum_coherence": quantumCoherence,
          "advisory.action_items_count": actionItems.length,
        });

        span.setStatus({ code: SpanStatusCode.OK });

        return {
          advice: analysis,
          actionItems,
          riskLevel,
          biodynamicScore,
          quantumCoherence,
        };
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Advisory failed",
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const lines = text.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      // Match numbered lists, bullet points, or "Recommendation:" lines
      if (
        /^\d+[.)]\s/.test(trimmed) ||
        /^[-*•]\s/.test(trimmed) ||
        /recommend/i.test(trimmed)
      ) {
        const cleaned = trimmed.replace(/^\d+[.)]\s|^[-*•]\s/g, "").trim();
        if (cleaned.length > 10) {
          recommendations.push(cleaned);
        }
      }
    }

    return recommendations.slice(0, 10); // Top 10 recommendations
  }

  private extractActionItems(text: string): string[] {
    const actionItems: string[] = [];
    const lines = text.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      // Match action-oriented phrases
      if (
        /^\d+[.)]\s/.test(trimmed) ||
        /^[-*•]\s/.test(trimmed) ||
        /action|implement|apply|monitor|check|ensure/i.test(trimmed)
      ) {
        const cleaned = trimmed.replace(/^\d+[.)]\s|^[-*•]\s/g, "").trim();
        if (cleaned.length > 10) {
          actionItems.push(cleaned);
        }
      }
    }

    return actionItems.slice(0, 8);
  }

  private extractSeasonalInfo(text: string): string[] {
    const seasonal: string[] = [];
    const seasonKeywords = [
      "spring",
      "summer",
      "fall",
      "autumn",
      "winter",
      "seasonal",
      "season",
      "month",
    ];

    const lines = text.split("\n");
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (seasonKeywords.some((keyword) => lower.includes(keyword))) {
        seasonal.push(line.trim());
      }
    }

    return seasonal.slice(0, 5);
  }

  private assessConfidence(text: string): number {
    // Simple heuristic based on qualifiers
    const uncertainWords = [
      "might",
      "maybe",
      "possibly",
      "could",
      "uncertain",
      "unsure",
    ];
    const confidentWords = [
      "will",
      "must",
      "should",
      "definitely",
      "certainly",
      "proven",
    ];

    const lower = text.toLowerCase();
    const uncertainCount = uncertainWords.filter((word) =>
      lower.includes(word),
    ).length;
    const confidentCount = confidentWords.filter((word) =>
      lower.includes(word),
    ).length;

    const baseConfidence = 0.7;
    const confidence =
      baseConfidence + confidentCount * 0.05 - uncertainCount * 0.05;

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  private calculateRelevance(text: string): number {
    const agriculturalKeywords = [
      "farm",
      "crop",
      "soil",
      "plant",
      "seed",
      "harvest",
      "compost",
      "organic",
      "biodynamic",
      "pest",
      "fertilizer",
      "irrigation",
      "season",
      "grow",
      "cultivate",
    ];

    const lower = text.toLowerCase();
    const matchCount = agriculturalKeywords.filter((keyword) =>
      lower.includes(keyword),
    ).length;

    return Math.min(1.0, matchCount / 10);
  }

  private assessRiskLevel(text: string): "LOW" | "MEDIUM" | "HIGH" {
    const lower = text.toLowerCase();

    const highRiskWords = [
      "danger",
      "critical",
      "severe",
      "urgent",
      "immediate",
      "crisis",
    ];
    const mediumRiskWords = [
      "concern",
      "caution",
      "monitor",
      "attention",
      "risk",
    ];

    if (highRiskWords.some((word) => lower.includes(word))) {
      return "HIGH";
    }
    if (mediumRiskWords.some((word) => lower.includes(word))) {
      return "MEDIUM";
    }
    return "LOW";
  }

  private calculateBiodynamicScore(text: string): number {
    const biodynamicKeywords = [
      "biodynamic",
      "lunar",
      "moon",
      "cosmic",
      "holistic",
      "ecosystem",
      "natural cycle",
      "regenerative",
      "compost preparation",
      "horn manure",
    ];

    const lower = text.toLowerCase();
    const matchCount = biodynamicKeywords.filter((keyword) =>
      lower.includes(keyword),
    ).length;

    return Math.round(
      Math.min(100, (matchCount / biodynamicKeywords.length) * 100),
    );
  }

  private calculateQuantumCoherence(text: string): number {
    const coherenceKeywords = [
      "aligned",
      "harmony",
      "balance",
      "cycle",
      "rhythm",
      "natural",
      "flow",
      "consciousness",
      "coherence",
      "synergy",
    ];

    const lower = text.toLowerCase();
    const matchCount = coherenceKeywords.filter((keyword) =>
      lower.includes(keyword),
    ).length;

    return Math.round(
      Math.min(100, (matchCount / coherenceKeywords.length) * 100),
    );
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create default Ollama client
 */
export function createOllamaClient(model = "deepseek-r1:7b"): OllamaClient {
  return new OllamaClient("http://localhost:11434", model);
}

/**
 * Quick agricultural analysis
 */
export async function analyzeAgriculturalQuery(
  query: string,
  context?: Record<string, unknown>,
): Promise<AgriculturalAnalysisResult> {
  const client = createOllamaClient();
  const agent = new AgriculturalAnalysisAgent(client);
  return await agent.analyze(query, context);
}

/**
 * Quick farming advisory
 */
export async function getFarmingAdvisory(
  situation: string,
  farmData?: Record<string, unknown>,
): Promise<FarmingAdvisoryResult> {
  const client = createOllamaClient();
  const agent = new AgriculturalAnalysisAgent(client);
  return await agent.getFarmingAdvisory(situation, farmData);
}

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const client = createOllamaClient();
    return await client.healthCheck();
  } catch {
    return false;
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default OllamaClient;
