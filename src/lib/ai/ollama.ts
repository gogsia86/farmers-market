/**
 * 🌟 OLLAMA LOCAL LLM INTEGRATION
 * Divine Agricultural AI - HP OMEN Optimized
 * Model: DeepSeek-R1:7b
 *
 * Leverages local GPU acceleration on RTX 2070 Max-Q
 * Optimized for agricultural domain knowledge
 *
 * Enhanced with:
 * - Conversation summary generation
 * - Context persistence and injection
 * - Thread management with database integration
 */

import { trace, SpanStatusCode } from "@opentelemetry/api";
import {
  chatSummaryService,
  type ContextForNextChat,
  type SummaryResult,
} from "./chat-summary.service";
import type { ChatMessage, ChatProvider } from "@prisma/client";

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
  private persistedThreads: Map<string, string>; // Maps local threadId to database threadId
  private readonly provider: ChatProvider = "OLLAMA";

  constructor(baseUrl = "http://localhost:11434", model = "deepseek-r1:7b") {
    this.baseUrl = baseUrl;
    this.model = model;
    this.conversationHistory = new Map();
    this.persistedThreads = new Map();
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
    this.persistedThreads.delete(threadId);
  }

  // ==========================================================================
  // SUMMARY GENERATION & CONTEXT INJECTION
  // ==========================================================================

  /**
   * Create a persisted thread that saves to database
   */
  async createPersistedThread(options: {
    userId?: string;
    farmId?: string;
    title?: string;
  }): Promise<string> {
    const thread = await chatSummaryService.createThread({
      userId: options.userId,
      farmId: options.farmId,
      title: options.title,
      provider: this.provider,
      model: this.model,
    });

    // Create local thread and map to persisted
    const localThreadId = `local_${thread.id}`;
    this.conversationHistory.set(localThreadId, []);
    this.persistedThreads.set(localThreadId, thread.id);

    return localThreadId;
  }

  /**
   * Add message to persisted thread (saves to database)
   */
  async addToPersistedThread(
    threadId: string,
    message: OllamaMessage,
    metadata?: {
      tokens?: number;
      confidence?: number;
    },
  ): Promise<void> {
    // Add to local history
    this.addToThread(threadId, message);

    // Persist to database if this is a persisted thread
    const dbThreadId = this.persistedThreads.get(threadId);
    if (dbThreadId) {
      await chatSummaryService.addMessage({
        threadId: dbThreadId,
        role: message.role.toUpperCase() as "SYSTEM" | "USER" | "ASSISTANT",
        content: message.content,
        tokens: metadata?.tokens,
        model: this.model,
        confidence: metadata?.confidence,
      });
    }
  }

  /**
   * Chat with automatic persistence
   */
  async chatWithPersistence(
    threadId: string,
    userMessage: string,
    options: OllamaGenerateOptions = {},
  ): Promise<OllamaChatResponse> {
    // Add user message to persisted thread
    await this.addToPersistedThread(threadId, {
      role: "user",
      content: userMessage,
    });

    // Get full history for context
    const history = this.getThreadHistory(threadId);

    // Make the chat request
    const response = await this.chat(history, options);

    // Add assistant response to persisted thread
    await this.addToPersistedThread(
      threadId,
      {
        role: "assistant",
        content: response.message.content,
      },
      {
        tokens: response.eval_count,
      },
    );

    return response;
  }

  /**
   * Generate a summary of the conversation thread
   */
  async generateThreadSummary(
    threadId: string,
    options?: { force?: boolean },
  ): Promise<string> {
    const dbThreadId = this.persistedThreads.get(threadId);

    if (!dbThreadId) {
      // For non-persisted threads, generate summary from local history
      const history = this.getThreadHistory(threadId);
      if (history.length === 0) {
        throw new Error("No messages to summarize");
      }
      return this.generateLocalSummary(history);
    }

    // Generate summary using the service with AI-powered summarization
    const summary = await chatSummaryService.generateSummary({
      threadId: dbThreadId,
      force: options?.force,
      summarizer: async (messages) => this.aiSummarizer(messages),
    });

    return summary.summary;
  }

  /**
   * AI-powered summarizer using Ollama
   */
  private async aiSummarizer(messages: ChatMessage[]): Promise<SummaryResult> {
    const conversationText = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n\n");

    const summarizationPrompt = `You are a conversation summarizer for an agricultural platform.
Analyze the following conversation and provide:
1. A concise summary (2-3 paragraphs)
2. Key topics discussed (as a comma-separated list)
3. Key entities mentioned (farms, products, locations)
4. The user's main intent or goal

Conversation:
${conversationText}

Respond in this exact format:
SUMMARY:
[Your summary here]

KEY_TOPICS:
[topic1, topic2, topic3]

KEY_ENTITIES:
farms: [farm names]
products: [product names]
locations: [location names]

USER_INTENT:
[The user's main goal or question]`;

    try {
      const response = await this.generate(summarizationPrompt, {
        temperature: 0.3, // Lower temperature for more focused summaries
        num_predict: 1024,
      });

      return this.parseSummaryResponse(response);
    } catch (error) {
      // Fallback to basic summary if AI summarization fails
      return this.basicSummaryFallback(messages);
    }
  }

  /**
   * Parse the AI summary response into structured format
   */
  private parseSummaryResponse(response: string): SummaryResult {
    const sections = {
      summary: "",
      keyTopics: [] as string[],
      keyEntities: {} as Record<string, string[]>,
      userIntent: "",
    };

    // Extract SUMMARY section
    const summaryMatch = response.match(
      /SUMMARY:\s*([\s\S]*?)(?=KEY_TOPICS:|$)/i,
    );
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }

    // Extract KEY_TOPICS section
    const topicsMatch = response.match(
      /KEY_TOPICS:\s*([\s\S]*?)(?=KEY_ENTITIES:|$)/i,
    );
    if (topicsMatch) {
      sections.keyTopics = topicsMatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }

    // Extract KEY_ENTITIES section
    const entitiesMatch = response.match(
      /KEY_ENTITIES:\s*([\s\S]*?)(?=USER_INTENT:|$)/i,
    );
    if (entitiesMatch) {
      const entityLines = entitiesMatch[1].split("\n");
      for (const line of entityLines) {
        const [key, values] = line.split(":").map((s) => s.trim());
        if (key && values) {
          const cleanKey = key.toLowerCase().replace(/[^a-z]/g, "");
          sections.keyEntities[cleanKey] = values
            .replace(/[[\]]/g, "")
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
        }
      }
    }

    // Extract USER_INTENT section
    const intentMatch = response.match(/USER_INTENT:\s*([\s\S]*?)$/i);
    if (intentMatch) {
      sections.userIntent = intentMatch[1].trim();
    }

    return {
      summary: sections.summary || "Conversation summary not available.",
      keyTopics: sections.keyTopics,
      keyEntities: sections.keyEntities,
      userIntent: sections.userIntent || undefined,
      confidence: sections.summary ? 0.85 : 0.5,
    };
  }

  /**
   * Basic fallback summary when AI summarization fails
   */
  private basicSummaryFallback(messages: ChatMessage[]): SummaryResult {
    const userMessages = messages.filter((m) => m.role === "USER");
    const assistantMessages = messages.filter((m) => m.role === "ASSISTANT");

    const summary =
      `Conversation with ${messages.length} messages. ` +
      `User asked ${userMessages.length} questions. ` +
      `Last topic: ${userMessages[userMessages.length - 1]?.content.slice(0, 100) || "N/A"}`;

    return {
      summary,
      keyTopics: [],
      keyEntities: {},
      userIntent: userMessages[userMessages.length - 1]?.content.slice(0, 200),
      confidence: 0.5,
    };
  }

  /**
   * Generate summary from local (non-persisted) history
   */
  private async generateLocalSummary(
    history: OllamaMessage[],
  ): Promise<string> {
    const conversationText = history
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n\n");

    const prompt = `Summarize this conversation in 2-3 paragraphs, highlighting key topics and the user's main questions:

${conversationText}`;

    return await this.generate(prompt, {
      temperature: 0.3,
      num_predict: 512,
    });
  }

  /**
   * Get context from previous conversations for a user
   */
  async getContextForNextChat(
    userId: string,
    farmId?: string,
  ): Promise<ContextForNextChat | null> {
    return await chatSummaryService.getContextForNextChat(userId, {
      provider: this.provider,
      farmId,
    });
  }

  /**
   * Start a new chat with context from previous conversations
   */
  async startChatWithContext(options: {
    userId: string;
    farmId?: string;
    title?: string;
    systemPrompt?: string;
  }): Promise<{
    threadId: string;
    contextualSystemPrompt: string;
    previousContext: ContextForNextChat | null;
  }> {
    // Get context from previous conversations
    const previousContext = await this.getContextForNextChat(
      options.userId,
      options.farmId,
    );

    // Create the persisted thread
    const threadId = await this.createPersistedThread({
      userId: options.userId,
      farmId: options.farmId,
      title: options.title,
    });

    // Build contextual system prompt
    const basePrompt = options.systemPrompt || this.getDefaultSystemPrompt();
    const contextualSystemPrompt =
      chatSummaryService.buildContextualSystemPrompt(
        basePrompt,
        previousContext,
      );

    // Add system message to thread
    await this.addToPersistedThread(threadId, {
      role: "system",
      content: contextualSystemPrompt,
    });

    return {
      threadId,
      contextualSystemPrompt,
      previousContext,
    };
  }

  /**
   * Get the default system prompt for agricultural AI
   */
  private getDefaultSystemPrompt(): string {
    return `You are an expert agricultural AI assistant for a farmers market platform.
You help farmers with:
- Crop planning and rotation
- Sustainable farming practices
- Market pricing and product listings
- Order management and logistics
- Weather and seasonal considerations
- Biodynamic and organic farming methods

Be helpful, accurate, and focused on agricultural domain knowledge.
Provide practical, actionable advice based on the user's context.`;
  }

  /**
   * Close a persisted thread and generate final summary
   */
  async closePersistedThread(threadId: string): Promise<string | null> {
    const dbThreadId = this.persistedThreads.get(threadId);

    if (!dbThreadId) {
      this.clearThread(threadId);
      return null;
    }

    // Generate final summary
    let summary: string | null = null;
    try {
      summary = await this.generateThreadSummary(threadId, { force: true });
    } catch {
      // Summary generation failed, but still close the thread
    }

    // Close the thread in database
    await chatSummaryService.closeThread(dbThreadId);

    // Clear local state
    this.clearThread(threadId);

    return summary;
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
      if (seasonKeywords.some((keyword: any) => lower.includes(keyword))) {
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
    const uncertainCount = uncertainWords.filter((word: any) =>
      lower.includes(word),
    ).length;
    const confidentCount = confidentWords.filter((word: any) =>
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
    const matchCount = agriculturalKeywords.filter((keyword: any) =>
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

    if (highRiskWords.some((word: any) => lower.includes(word))) {
      return "HIGH";
    }
    if (mediumRiskWords.some((word: any) => lower.includes(word))) {
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
    const matchCount = biodynamicKeywords.filter((keyword: any) =>
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
    const matchCount = coherenceKeywords.filter((keyword: any) =>
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
