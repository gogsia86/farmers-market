/**
 * PERPLEXITY AI AGENT IMPLEMENTATION
 * Divine Agricultural Intelligence with Real-Time Search
 *
 * Capabilities:
 * - Agricultural research with domain-specific knowledge
 * - Code generation with divine patterns
 * - Real-time web search integration
 * - Multi-turn conversations with context
 * - OpenTelemetry tracing for observability
 * - Agent orchestration with context management
 *
 * Enhanced with:
 * - Conversation summary generation
 * - Context persistence and injection
 * - Thread management with database integration
 */

import { logger } from "@/lib/monitoring/logger";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import {
  PERPLEXITY_PRO_CONFIG,
  type PerplexityProModel,
} from "./perplexity-config";
import {
  chatSummaryService,
  type ContextForNextChat,
  type SummaryResult,
} from "./chat-summary.service";
import type { ChatMessage, ChatProvider, ChatRole } from "@prisma/client";

// Create tracer for this module
const tracer = trace.getTracer("perplexity-ai-agent", "1.0.0");

// ============================================
// TYPES & INTERFACES
// ============================================

/**
 * Agent Context for tracking agent state and metadata
 */
export interface AgentContext {
  agentId: string;
  sessionId: string;
  userId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  lastActivityAt: Date;
}

/**
 * Agent execution result with tracing metadata
 */
export interface AgentExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  traceId?: string;
  spanId?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PerplexitySearchOptions {
  /** Search only within specific domains */
  searchDomainFilter?: string[];
  /** Return images in search results */
  returnImages?: boolean;
  /** Return related questions */
  returnRelatedQuestions?: boolean;
  /** Filter by recency (day, week, month, year) */
  searchRecencyFilter?: "day" | "week" | "month" | "year";
}

export interface PerplexityRequestOptions extends PerplexitySearchOptions {
  model?: PerplexityProModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stream?: boolean;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  choices: Array<{
    index: number;
    finishReason: string;
    message: {
      role: "assistant";
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
  citations?: string[];
  images?: string[];
  relatedQuestions?: string[];
}

export interface AgriculturalResearchResult {
  answer: string;
  citations: string[];
  relatedQuestions: string[];
  confidence: "high" | "medium" | "low";
  agriculturalRelevance: number;
}

export interface CodeGenerationResult {
  code: string;
  explanation: string;
  language: string;
  testCases?: string;
  divinePatterns: string[];
}

// ============================================
// PERPLEXITY AI CLIENT
// ============================================

export class PerplexityAI {
  private apiKey: string;
  private baseUrl = "https://api.perplexity.ai";
  private conversationHistory: Map<string, PerplexityMessage[]> = new Map();
  private agentContexts: Map<string, AgentContext> = new Map();
  private persistedThreads: Map<string, string> = new Map(); // Maps local threadId to database threadId
  private readonly provider: ChatProvider = "PERPLEXITY";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY || "";

    // Don't throw during build time - allow graceful degradation
    if (!this.apiKey && process.env.NODE_ENV !== "production") {
      logger.warn(
        "⚠️  PERPLEXITY_API_KEY not configured - Perplexity features will be disabled",
      );
    }
  }

  /**
   * Create agent context for tracking agent state
   */
  createAgentContext(userId?: string): AgentContext {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = `session_${Date.now()}`;
    const agentContext: AgentContext = {
      agentId,
      sessionId,
      userId,
      metadata: {},
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };
    this.agentContexts.set(agentId, agentContext);
    return agentContext;
  }

  /**
   * Get agent context by ID
   */
  getAgentContext(agentId: string): AgentContext | undefined {
    return this.agentContexts.get(agentId);
  }

  /**
   * Update agent context activity
   */
  updateAgentActivity(agentId: string, metadata?: Record<string, any>): void {
    const agentContext = this.agentContexts.get(agentId);
    if (agentContext) {
      agentContext.lastActivityAt = new Date();
      if (metadata) {
        agentContext.metadata = { ...agentContext.metadata, ...metadata };
      }
    }
  }

  /**
   * Make a request to Perplexity API with tracing
   */
  async chat(
    messages: PerplexityMessage[],
    options: PerplexityRequestOptions = {},
  ): Promise<PerplexityResponse> {
    return await tracer.startActiveSpan("perplexity.chat", async (span) => {
      const startTime = Date.now();

      try {
        const {
          model = "llama-3.1-sonar-large-128k-online",
          temperature = PERPLEXITY_PRO_CONFIG.defaultSettings.temperature,
          maxTokens = PERPLEXITY_PRO_CONFIG.defaultSettings.maxTokens,
          topP = PERPLEXITY_PRO_CONFIG.defaultSettings.topP,
          searchDomainFilter,
          returnImages,
          returnRelatedQuestions,
          searchRecencyFilter,
          stream = false,
        } = options;

        // Add span attributes
        span.setAttributes({
          "ai.model": model,
          "ai.temperature": temperature,
          "ai.max_tokens": maxTokens,
          "ai.message_count": messages.length,
          "ai.search_enabled": !!searchDomainFilter,
        });

        const requestBody: any = {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          stream,
        };

        // Add search options if provided
        if (searchDomainFilter?.length) {
          requestBody.search_domain_filter = searchDomainFilter;
          span.setAttribute("ai.search_domains", searchDomainFilter.join(","));
        }
        if (returnImages !== undefined) {
          requestBody.return_images = returnImages;
        }
        if (returnRelatedQuestions !== undefined) {
          requestBody.return_related_questions = returnRelatedQuestions;
        }
        if (searchRecencyFilter) {
          requestBody.search_recency_filter = searchRecencyFilter;
          span.setAttribute("ai.search_recency", searchRecencyFilter);
        }

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = `Perplexity API error (${response.status}): ${errorData.error?.message || response.statusText}`;

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: errorMsg,
          });
          span.setAttribute("error", true);
          span.setAttribute("http.status_code", response.status);

          throw new Error(errorMsg);
        }

        const result = await response.json();

        // Record metrics
        const duration = Date.now() - startTime;
        span.setAttributes({
          "ai.response.total_tokens": result.usage?.totalTokens || 0,
          "ai.response.prompt_tokens": result.usage?.promptTokens || 0,
          "ai.response.completion_tokens": result.usage?.completionTokens || 0,
          "ai.response.citation_count": result.citations?.length || 0,
          duration_ms: duration,
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        span.setAttribute("error", true);

        if (error instanceof Error) {
          span.recordException(error);
          throw new Error(`Failed to call Perplexity API: ${error.message}`);
        }
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Start a new conversation thread
   */
  createThread(threadId?: string): string {
    const id =
      threadId ||
      `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.conversationHistory.set(id, []);
    return id;
  }

  /**
   * Add message to conversation thread
   */
  addToThread(threadId: string, message: PerplexityMessage): void {
    const history = this.conversationHistory.get(threadId);
    if (!history) {
      throw new Error(`Thread ${threadId} not found. Create a thread first.`);
    }
    history.push(message);
  }

  /**
   * Get conversation history for a thread
   */
  getThreadHistory(threadId: string): PerplexityMessage[] {
    return this.conversationHistory.get(threadId) || [];
  }

  /**
   * Clear conversation thread
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
    model?: string;
  }): Promise<string> {
    const thread = await chatSummaryService.createThread({
      userId: options.userId,
      farmId: options.farmId,
      title: options.title,
      provider: this.provider,
      model: options.model || "llama-3.1-sonar-large-128k-online",
    });

    // Create local thread and map to persisted
    const localThreadId = this.createThread(`local_${thread.id}`);
    this.persistedThreads.set(localThreadId, thread.id);

    return localThreadId;
  }

  /**
   * Add message to persisted thread (saves to database)
   */
  async addToPersistedThread(
    threadId: string,
    message: PerplexityMessage,
    metadata?: {
      tokens?: number;
      confidence?: number;
      citations?: string[];
    },
  ): Promise<void> {
    // Add to local history
    this.addToThread(threadId, message);

    // Persist to database if this is a persisted thread
    const dbThreadId = this.persistedThreads.get(threadId);
    if (dbThreadId) {
      await chatSummaryService.addMessage({
        threadId: dbThreadId,
        role: message.role.toUpperCase() as ChatRole,
        content: message.content,
        tokens: metadata?.tokens,
        model: "llama-3.1-sonar-large-128k-online",
        confidence: metadata?.confidence,
        citations: metadata?.citations,
      });
    }
  }

  /**
   * Chat with automatic persistence and citation tracking
   */
  async chatWithPersistence(
    threadId: string,
    userMessage: string,
    options: PerplexityRequestOptions = {},
  ): Promise<PerplexityResponse> {
    // Add user message to persisted thread
    await this.addToPersistedThread(threadId, {
      role: "user",
      content: userMessage,
    });

    // Get full history for context
    const history = this.getThreadHistory(threadId);

    // Make the chat request
    const response = await this.chat(history, options);

    // Extract response data
    const assistantContent = response.choices[0]?.message?.content || "";
    const citations = response.citations || [];

    // Add assistant response to persisted thread
    await this.addToPersistedThread(
      threadId,
      {
        role: "assistant",
        content: assistantContent,
      },
      {
        tokens: response.usage?.completionTokens,
        citations,
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
   * AI-powered summarizer using Perplexity
   */
  private async aiSummarizer(messages: ChatMessage[]): Promise<SummaryResult> {
    const conversationText = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n\n");

    const summarizationPrompt = `You are a conversation summarizer for an agricultural platform.
Analyze the following conversation and provide a structured summary.

Conversation:
${conversationText}

Provide:
1. A concise summary (2-3 paragraphs) of what was discussed
2. Key topics as a list
3. Key entities mentioned (farms, products, locations)
4. The user's main intent or goal

Format your response clearly with labeled sections.`;

    try {
      const response = await this.chat(
        [
          {
            role: "user",
            content: summarizationPrompt,
          },
        ],
        {
          model: "llama-3.1-sonar-small-128k-online",
          temperature: 0.3,
          maxTokens: 1024,
        },
      );

      const responseContent = response.choices[0]?.message?.content || "";
      return this.parseSummaryResponse(responseContent);
    } catch (error) {
      logger.error("AI summarization failed, using fallback", {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.basicSummaryFallback(messages);
    }
  }

  /**
   * Parse the AI summary response into structured format
   */
  private parseSummaryResponse(response: string): SummaryResult {
    // Extract key sections from the response
    const keyTopics: string[] = [];
    const keyEntities: Record<string, string[]> = {
      farms: [],
      products: [],
      locations: [],
    };

    // Simple extraction - look for lists and key phrases
    const lines = response.split("\n");
    let currentSection = "";

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes("topic")) {
        currentSection = "topics";
      } else if (
        lowerLine.includes("entit") ||
        lowerLine.includes("farm") ||
        lowerLine.includes("product")
      ) {
        currentSection = "entities";
      } else if (lowerLine.includes("intent") || lowerLine.includes("goal")) {
        currentSection = "intent";
      }

      // Extract bullet points
      if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
        const item = line.replace(/^[\s\-•]+/, "").trim();
        if (currentSection === "topics" && item) {
          keyTopics.push(item);
        }
      }
    }

    // Extract user intent (usually last section)
    const intentMatch = response.match(/intent[:\s]*(.*?)(?:\n\n|$)/is);
    const userIntent = intentMatch
      ? intentMatch[1].trim().slice(0, 500)
      : undefined;

    return {
      summary: response.slice(0, 2000), // Use full response as summary
      keyTopics: keyTopics.slice(0, 10),
      keyEntities,
      userIntent,
      confidence: 0.8,
    };
  }

  /**
   * Basic fallback summary when AI summarization fails
   */
  private basicSummaryFallback(messages: ChatMessage[]): SummaryResult {
    const userMessages = messages.filter((m) => m.role === "USER");
    const assistantMessages = messages.filter((m) => m.role === "ASSISTANT");

    const summary =
      `Research conversation with ${messages.length} messages. ` +
      `User made ${userMessages.length} queries. ` +
      `Last query: ${userMessages[userMessages.length - 1]?.content.slice(0, 150) || "N/A"}`;

    return {
      summary,
      keyTopics: [],
      keyEntities: {},
      userIntent: userMessages[userMessages.length - 1]?.content.slice(0, 300),
      confidence: 0.5,
    };
  }

  /**
   * Generate summary from local (non-persisted) history
   */
  private async generateLocalSummary(
    history: PerplexityMessage[],
  ): Promise<string> {
    const conversationText = history
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n\n");

    const response = await this.chat(
      [
        {
          role: "user",
          content: `Summarize this conversation in 2-3 paragraphs:\n\n${conversationText}`,
        },
      ],
      {
        model: "llama-3.1-sonar-small-128k-online",
        temperature: 0.3,
        maxTokens: 512,
      },
    );

    return response.choices[0]?.message?.content || "Summary not available.";
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
    const basePrompt =
      options.systemPrompt || PERPLEXITY_PRO_CONFIG.systemPrompts.agricultural;
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

// ============================================
// AGRICULTURAL RESEARCH AGENT
// ============================================

export class AgriculturalResearchAgent {
  private client: PerplexityAI;
  private systemPrompt: string;

  constructor(apiKey?: string) {
    this.client = new PerplexityAI(apiKey);
    this.systemPrompt = PERPLEXITY_PRO_CONFIG.systemPrompts.agricultural;
  }

  /**
   * Research an agricultural topic with real-time search and tracing
   */
  async researchTopic(
    topic: string,
    options: {
      depth?: "quick" | "comprehensive" | "expert";
      recencyFilter?: "day" | "week" | "month" | "year";
    } = {},
  ): Promise<AgriculturalResearchResult> {
    return await tracer.startActiveSpan(
      "agricultural.research",
      async (span) => {
        try {
          const { depth = "comprehensive", recencyFilter = "month" } = options;

          span.setAttributes({
            "research.topic": topic,
            "research.depth": depth,
            "research.recency_filter": recencyFilter,
            "research.domain": "agricultural",
          });

          // Select model based on depth
          const model = this.selectModelForDepth(depth);

          const messages: PerplexityMessage[] = [
            { role: "system", content: this.systemPrompt },
            {
              role: "user",
              content: `Research the following agricultural topic and provide evidence-based insights with citations: ${topic}`,
            },
          ];

          const response = await this.client.chat(messages, {
            model,
            searchDomainFilter: [
              ...PERPLEXITY_PRO_CONFIG.agricultural.searchDomains,
            ],
            returnImages: PERPLEXITY_PRO_CONFIG.agricultural.includeImages,
            returnRelatedQuestions:
              PERPLEXITY_PRO_CONFIG.agricultural.relatedQuestions,
            searchRecencyFilter: recencyFilter,
          });

          const answer = response.choices[0]?.message.content || "";
          const citations = response.citations || [];
          const relatedQuestions = response.relatedQuestions || [];
          const confidence = this.assessConfidence(
            citations.length,
            answer.length,
          );
          const agriculturalRelevance =
            this.calculateAgriculturalRelevance(answer);

          span.setAttributes({
            "research.citations_count": citations.length,
            "research.confidence": confidence,
            "research.agricultural_relevance": agriculturalRelevance,
            "research.related_questions_count": relatedQuestions.length,
          });

          span.setStatus({ code: SpanStatusCode.OK });

          return {
            answer,
            citations,
            relatedQuestions,
            confidence,
            agriculturalRelevance,
          };
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Research failed",
          });
          span.setAttribute("error", true);
          if (error instanceof Error) {
            span.recordException(error);
          }
          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Multi-turn research conversation
   */
  async startResearchSession(initialTopic: string): Promise<string> {
    const threadId = this.client.createThread();

    // Add system prompt
    this.client.addToThread(threadId, {
      role: "system",
      content: this.systemPrompt,
    });

    // Initial research
    this.client.addToThread(threadId, {
      role: "user",
      content: `Let's research: ${initialTopic}`,
    });

    const response = await this.client.chat(
      this.client.getThreadHistory(threadId),
      {
        model: "llama-3.1-sonar-large-128k-online",
        searchDomainFilter: [
          ...PERPLEXITY_PRO_CONFIG.agricultural.searchDomains,
        ],
        returnRelatedQuestions: true,
      },
    );

    // Add response to thread
    this.client.addToThread(threadId, {
      role: "assistant",
      content: response.choices[0]?.message?.content || "",
    });

    return threadId;
  }

  /**
   * Continue research session with follow-up question
   */
  async continueResearch(
    threadId: string,
    followUpQuestion: string,
  ): Promise<string> {
    this.client.addToThread(threadId, {
      role: "user",
      content: followUpQuestion,
    });

    const response = await this.client.chat(
      this.client.getThreadHistory(threadId),
      {
        searchDomainFilter: [
          ...PERPLEXITY_PRO_CONFIG.agricultural.searchDomains,
        ],
      },
    );

    const answer = response.choices[0]?.message?.content || "";

    this.client.addToThread(threadId, {
      role: "assistant",
      content: answer,
    });

    return answer;
  }

  private selectModelForDepth(
    depth: "quick" | "comprehensive" | "expert",
  ): PerplexityProModel {
    const modelMap: Record<typeof depth, PerplexityProModel> = {
      quick: "llama-3.1-sonar-small-128k-online",
      comprehensive: "llama-3.1-sonar-large-128k-online",
      expert: "llama-3.1-sonar-huge-128k-online",
    };
    return modelMap[depth];
  }

  private assessConfidence(
    citationCount: number,
    answerLength: number,
  ): "high" | "medium" | "low" {
    if (citationCount >= 3 && answerLength > 500) return "high";
    if (citationCount >= 1 && answerLength > 200) return "medium";
    return "low";
  }

  private calculateAgriculturalRelevance(answer: string): number {
    const agriculturalKeywords = [
      "farm",
      "crop",
      "soil",
      "harvest",
      "organic",
      "sustainable",
      "agriculture",
      "cultivation",
      "irrigation",
      "fertilizer",
      "pest",
      "yield",
      "season",
      "planting",
    ];

    const lowerAnswer = answer.toLowerCase();
    const matchCount = agriculturalKeywords.filter((keyword: any) =>
      lowerAnswer.includes(keyword),
    ).length;

    return Math.min((matchCount / agriculturalKeywords.length) * 100, 100);
  }
}

// ============================================
// CODE GENERATION AGENT
// ============================================

export class CodeGenerationAgent {
  private client: PerplexityAI;
  private systemPrompt: string;

  constructor(apiKey?: string) {
    this.client = new PerplexityAI(apiKey);
    this.systemPrompt = PERPLEXITY_PRO_CONFIG.systemPrompts.codeGeneration;
  }

  /**
   * Generate code based on description
   */
  async generateCode(
    description: string,
    options: {
      language?: string;
      framework?: string;
      includeTests?: boolean;
      divinePatterns?: boolean;
    } = {},
  ): Promise<CodeGenerationResult> {
    const {
      language = "TypeScript",
      framework = "Next.js",
      includeTests = true,
      divinePatterns = true,
    } = options;

    const prompt = this.buildCodeGenerationPrompt(
      description,
      language,
      framework,
      includeTests,
      divinePatterns,
    );

    const messages: PerplexityMessage[] = [
      { role: "system", content: this.systemPrompt },
      { role: "user", content: prompt },
    ];

    const response = await this.client.chat(messages, {
      model: "llama-3.1-sonar-large-128k-online",
      temperature: PERPLEXITY_PRO_CONFIG.codeGeneration.temperature,
      maxTokens: PERPLEXITY_PRO_CONFIG.codeGeneration.maxTokens,
    });

    const fullResponse = response.choices[0]?.message?.content || "";

    return this.parseCodeResponse(fullResponse, language);
  }

  private buildCodeGenerationPrompt(
    description: string,
    language: string,
    framework: string,
    includeTests: boolean,
    divinePatterns: boolean,
  ): string {
    let prompt = `Generate ${language} code for the following requirement:\n\n${description}\n\n`;

    prompt += `Requirements:
- Language: ${language}
- Framework: ${framework}
- Include comprehensive error handling
- Add TypeScript types for type safety
- Follow clean code principles
`;

    if (divinePatterns) {
      prompt += `- Follow divine patterns from the codebase (holographic components, quantum architecture)
- Use agricultural consciousness where applicable
- Implement conscious abstractions
`;
    }

    if (includeTests) {
      prompt += `- Include unit tests
- Add test cases for edge cases
`;
    }

    prompt += "\nProvide the code with clear explanations.";

    return prompt;
  }

  private parseCodeResponse(
    response: string,
    language: string,
  ): CodeGenerationResult {
    // Extract code blocks
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const codeBlocks: string[] = [];
    let match;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      if (match[1]) {
        codeBlocks.push(match[1].trim());
      }
    }

    const code = codeBlocks[0] || "";
    const testCases = codeBlocks[1];

    // Extract divine patterns mentioned
    const divinePatterns = this.extractDivinePatterns(response);

    // Extract explanation (text before first code block)
    const explanation = response.split("```")[0]?.trim() || "";

    return {
      code,
      explanation,
      language,
      testCases,
      divinePatterns,
    };
  }

  private extractDivinePatterns(response: string): string[] {
    const patterns = [
      "holographic",
      "quantum",
      "temporal",
      "conscious",
      "divine",
      "agricultural",
      "biodynamic",
    ];

    return patterns.filter((pattern: any) =>
      response.toLowerCase().includes(pattern),
    );
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick agricultural research
 */
export async function researchAgriculturalTopic(
  topic: string,
): Promise<AgriculturalResearchResult> {
  const agent = new AgriculturalResearchAgent();
  return await agent.researchTopic(topic);
}

/**
 * Quick code generation
 */
export async function generateCode(
  description: string,
): Promise<CodeGenerationResult> {
  const agent = new CodeGenerationAgent();
  return await agent.generateCode(description);
}

/**
 * Create a new Perplexity AI client
 */
export function createPerplexityClient(apiKey?: string): PerplexityAI {
  return new PerplexityAI(apiKey);
}
