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
 */

import { SpanStatusCode, trace } from "@opentelemetry/api";
import {
  PERPLEXITY_PRO_CONFIG,
  type PerplexityProModel,
} from "./perplexity-config";

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

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY || "";

    // Don't throw during build time - allow graceful degradation
    if (!this.apiKey && process.env.NODE_ENV !== "production") {
      console.warn(
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
    const matchCount = agriculturalKeywords.filter((keyword) =>
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

    return patterns.filter((pattern) =>
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
