/**
 * 🧠 CHAT SUMMARY SERVICE
 * Divine Agricultural AI - Conversation Persistence & Summary Generation
 *
 * Provides:
 * - Thread persistence to database
 * - Message storage and retrieval
 * - Automatic conversation summarization
 * - Context injection for new chats
 * - Summary expiration management
 *
 * @module ai/chat-summary.service
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/monitoring/logger";
import type {
  ChatThread,
  ChatMessage,
  ChatSummary,
  ChatProvider,
  ChatRole,
  Prisma,
} from "@prisma/client";

// Create dedicated logger for chat summary service
const logger = createLogger("ChatSummaryService");

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreateThreadOptions {
  userId?: string;
  farmId?: string;
  title?: string;
  provider: ChatProvider;
  model?: string;
}

export interface AddMessageOptions {
  threadId: string;
  role: ChatRole;
  content: string;
  tokens?: number;
  model?: string;
  confidence?: number;
  citations?: string[];
}

export interface GenerateSummaryOptions {
  threadId: string;
  /** Custom summarization function - if not provided, uses default */
  summarizer?: (messages: ChatMessage[]) => Promise<SummaryResult>;
  /** Force regeneration even if recent summary exists */
  force?: boolean;
}

export interface SummaryResult {
  summary: string;
  keyTopics: string[];
  keyEntities: Record<string, string[]>;
  userIntent?: string;
  confidence: number;
}

export interface ThreadWithContext {
  thread: ChatThread;
  messages: ChatMessage[];
  latestSummary: ChatSummary | null;
}

export interface ContextForNextChat {
  previousSummary?: string;
  keyTopics?: string[];
  keyEntities?: Record<string, string[]>;
  lastUserIntent?: string;
  messageCount: number;
  lastActivityAt: Date;
}

// ============================================================================
// CHAT SUMMARY SERVICE
// ============================================================================

class ChatSummaryService {
  private readonly summaryLogger = logger;

  // --------------------------------------------------------------------------
  // THREAD MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Create a new chat thread
   */
  async createThread(options: CreateThreadOptions): Promise<ChatThread> {
    try {
      const thread = await database.chatThread.create({
        data: {
          userId: options.userId,
          farmId: options.farmId,
          title: options.title,
          provider: options.provider,
          model: options.model,
          isActive: true,
          messageCount: 0,
          lastActivityAt: new Date(),
        },
      });

      this.summaryLogger.info("Chat thread created", {
        threadId: thread.id,
        provider: options.provider,
        userId: options.userId,
      });

      return thread;
    } catch (error) {
      this.summaryLogger.error("Failed to create chat thread", {
        error: error instanceof Error ? error.message : String(error),
        options,
      });
      throw error;
    }
  }

  /**
   * Get a thread by ID with messages and latest summary
   */
  async getThread(threadId: string): Promise<ThreadWithContext | null> {
    try {
      const thread = await database.chatThread.findUnique({
        where: { id: threadId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
          summaries: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!thread) {
        return null;
      }

      return {
        thread,
        messages: thread.messages,
        latestSummary: thread.summaries[0] || null,
      };
    } catch (error) {
      this.summaryLogger.error("Failed to get thread", {
        error: error instanceof Error ? error.message : String(error),
        threadId,
      });
      throw error;
    }
  }

  /**
   * Get all threads for a user
   */
  async getUserThreads(
    userId: string,
    options?: {
      provider?: ChatProvider;
      activeOnly?: boolean;
      limit?: number;
    },
  ): Promise<ChatThread[]> {
    try {
      const where: Prisma.ChatThreadWhereInput = {
        userId,
        ...(options?.provider && { provider: options.provider }),
        ...(options?.activeOnly && { isActive: true }),
      };

      return await database.chatThread.findMany({
        where,
        orderBy: { lastActivityAt: "desc" },
        take: options?.limit || 50,
      });
    } catch (error) {
      this.summaryLogger.error("Failed to get user threads", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      });
      throw error;
    }
  }

  /**
   * Update thread activity
   */
  async updateThreadActivity(threadId: string): Promise<void> {
    try {
      await database.chatThread.update({
        where: { id: threadId },
        data: {
          lastActivityAt: new Date(),
          messageCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      this.summaryLogger.error("Failed to update thread activity", {
        error: error instanceof Error ? error.message : String(error),
        threadId,
      });
      // Non-critical, don't throw
    }
  }

  /**
   * Close/deactivate a thread
   */
  async closeThread(threadId: string): Promise<void> {
    try {
      await database.chatThread.update({
        where: { id: threadId },
        data: { isActive: false },
      });

      this.summaryLogger.info("Chat thread closed", { threadId });
    } catch (error) {
      this.summaryLogger.error("Failed to close thread", {
        error: error instanceof Error ? error.message : String(error),
        threadId,
      });
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // MESSAGE MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Add a message to a thread
   */
  async addMessage(options: AddMessageOptions): Promise<ChatMessage> {
    try {
      const message = await database.chatMessage.create({
        data: {
          threadId: options.threadId,
          role: options.role,
          content: options.content,
          tokens: options.tokens,
          model: options.model,
          confidence: options.confidence,
          citations: options.citations ? options.citations : undefined,
        },
      });

      // Update thread activity
      await this.updateThreadActivity(options.threadId);

      return message;
    } catch (error) {
      this.summaryLogger.error("Failed to add message", {
        error: error instanceof Error ? error.message : String(error),
        threadId: options.threadId,
        role: options.role,
      });
      throw error;
    }
  }

  /**
   * Get messages for a thread
   */
  async getMessages(
    threadId: string,
    options?: {
      limit?: number;
      offset?: number;
      role?: ChatRole;
    },
  ): Promise<ChatMessage[]> {
    try {
      return await database.chatMessage.findMany({
        where: {
          threadId,
          ...(options?.role && { role: options.role }),
        },
        orderBy: { createdAt: "asc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      this.summaryLogger.error("Failed to get messages", {
        error: error instanceof Error ? error.message : String(error),
        threadId,
      });
      throw error;
    }
  }

  /**
   * Get recent messages for context (last N messages)
   */
  async getRecentMessages(
    threadId: string,
    count: number = 10,
  ): Promise<ChatMessage[]> {
    try {
      const messages = await database.chatMessage.findMany({
        where: { threadId },
        orderBy: { createdAt: "desc" },
        take: count,
      });

      // Return in chronological order
      return messages.reverse();
    } catch (error) {
      this.summaryLogger.error("Failed to get recent messages", {
        error: error instanceof Error ? error.message : String(error),
        threadId,
      });
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // SUMMARY GENERATION
  // --------------------------------------------------------------------------

  /**
   * Generate a summary for a thread's conversation
   */
  async generateSummary(options: GenerateSummaryOptions): Promise<ChatSummary> {
    const { threadId, summarizer, force = false } = options;

    try {
      // Check if recent summary exists (less than 1 hour old)
      if (!force) {
        const existingSummary = await database.chatSummary.findFirst({
          where: {
            threadId,
            createdAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            },
          },
          orderBy: { createdAt: "desc" },
        });

        if (existingSummary) {
          this.summaryLogger.debug("Using existing summary", {
            threadId,
            summaryId: existingSummary.id,
          });
          return existingSummary;
        }
      }

      // Get all messages for the thread
      const messages = await this.getMessages(threadId);

      if (messages.length === 0) {
        throw new Error("No messages to summarize");
      }

      // Calculate original token count
      const tokensCondensed = messages.reduce(
        (sum, m) => sum + (m.tokens || this.estimateTokens(m.content)),
        0,
      );

      // Generate summary using provided summarizer or default
      const result = summarizer
        ? await summarizer(messages)
        : await this.defaultSummarizer(messages);

      // Estimate summary tokens
      const summaryTokens = this.estimateTokens(result.summary);

      // Store the summary
      const summary = await database.chatSummary.create({
        data: {
          threadId,
          summary: result.summary,
          keyTopics: result.keyTopics,
          keyEntities: result.keyEntities,
          userIntent: result.userIntent,
          messagesCovered: messages.length,
          tokensCondensed,
          summaryTokens,
          confidence: result.confidence,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      this.summaryLogger.info("Summary generated", {
        threadId,
        summaryId: summary.id,
        messagesCovered: messages.length,
        tokensCondensed,
        summaryTokens,
        compressionRatio: (summaryTokens / tokensCondensed).toFixed(2),
      });

      return summary;
    } catch (error) {
      this.summaryLogger.error("Failed to generate summary", {
        error: error instanceof Error ? error.message : String(error),
        threadId,
      });
      throw error;
    }
  }

  /**
   * Default summarizer implementation
   * Uses a simple extraction-based approach
   * Can be replaced with AI-based summarization
   */
  private async defaultSummarizer(
    messages: ChatMessage[],
  ): Promise<SummaryResult> {
    // Extract user messages for intent analysis
    const userMessages = messages.filter((m) => m.role === "USER");
    const assistantMessages = messages.filter((m) => m.role === "ASSISTANT");

    // Extract key topics from conversation
    const keyTopics = this.extractKeyTopics(messages);

    // Extract entities mentioned
    const keyEntities = this.extractKeyEntities(messages);

    // Get last user intent
    const lastUserMessage = userMessages[userMessages.length - 1];
    const userIntent = lastUserMessage?.content.slice(0, 500);

    // Build summary from conversation flow
    const summaryParts: string[] = [];

    // Add conversation overview
    summaryParts.push(
      `Conversation with ${messages.length} messages (${userMessages.length} user, ${assistantMessages.length} assistant).`,
    );

    // Add key topics
    if (keyTopics.length > 0) {
      summaryParts.push(`Key topics discussed: ${keyTopics.join(", ")}.`);
    }

    // Add recent context
    const recentUserQueries = userMessages.slice(-3).map((m) => {
      const truncated =
        m.content.length > 100 ? m.content.slice(0, 100) + "..." : m.content;
      return `- "${truncated}"`;
    });

    if (recentUserQueries.length > 0) {
      summaryParts.push(
        `Recent user queries:\n${recentUserQueries.join("\n")}`,
      );
    }

    // Add last assistant response summary
    const lastAssistant = assistantMessages[assistantMessages.length - 1];
    if (lastAssistant) {
      const truncated =
        lastAssistant.content.length > 200
          ? lastAssistant.content.slice(0, 200) + "..."
          : lastAssistant.content;
      summaryParts.push(`Last assistant response: "${truncated}"`);
    }

    return {
      summary: summaryParts.join("\n\n"),
      keyTopics,
      keyEntities,
      userIntent,
      confidence: 0.7, // Default confidence for rule-based summarization
    };
  }

  /**
   * Extract key topics from messages
   */
  private extractKeyTopics(messages: ChatMessage[]): string[] {
    const topics = new Set<string>();

    // Agricultural domain keywords to look for
    const agriculturalKeywords = [
      "farm",
      "crop",
      "harvest",
      "planting",
      "soil",
      "organic",
      "sustainable",
      "weather",
      "irrigation",
      "fertilizer",
      "pest",
      "disease",
      "yield",
      "season",
      "market",
      "price",
      "product",
      "order",
      "delivery",
      "pickup",
      "certification",
      "biodynamic",
      "regenerative",
    ];

    const allContent = messages.map((m) => m.content.toLowerCase()).join(" ");

    for (const keyword of agriculturalKeywords) {
      if (allContent.includes(keyword)) {
        topics.add(keyword);
      }
    }

    return Array.from(topics).slice(0, 10); // Limit to 10 topics
  }

  /**
   * Extract key entities from messages
   */
  private extractKeyEntities(
    messages: ChatMessage[],
  ): Record<string, string[]> {
    const entities: Record<string, string[]> = {
      farms: [],
      products: [],
      locations: [],
      dates: [],
    };

    const allContent = messages.map((m) => m.content).join(" ");

    // Simple pattern matching for common entities
    // In production, this should use NER or AI extraction

    // Farm names (capitalized words followed by "Farm" or "Gardens")
    const farmPattern =
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Farm|Gardens|Acres)/g;
    let match;
    while ((match = farmPattern.exec(allContent)) !== null) {
      if (!entities.farms.includes(match[0])) {
        entities.farms.push(match[0]);
      }
    }

    // Products (common agricultural products)
    const productKeywords = [
      "tomatoes",
      "lettuce",
      "carrots",
      "apples",
      "corn",
      "wheat",
      "eggs",
      "milk",
      "cheese",
      "honey",
      "vegetables",
      "fruits",
    ];
    for (const product of productKeywords) {
      if (allContent.toLowerCase().includes(product)) {
        if (!entities.products.includes(product)) {
          entities.products.push(product);
        }
      }
    }

    // Limit entity arrays
    entities.farms = entities.farms.slice(0, 5);
    entities.products = entities.products.slice(0, 10);

    return entities;
  }

  /**
   * Estimate token count for a string
   * Simple approximation: ~4 characters per token
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // --------------------------------------------------------------------------
  // CONTEXT RETRIEVAL FOR NEW CHATS
  // --------------------------------------------------------------------------

  /**
   * Get context for starting a new chat based on previous conversations
   */
  async getContextForNextChat(
    userId: string,
    options?: {
      provider?: ChatProvider;
      farmId?: string;
    },
  ): Promise<ContextForNextChat | null> {
    try {
      // Find the most recent active thread for this user
      const recentThread = await database.chatThread.findFirst({
        where: {
          userId,
          ...(options?.provider && { provider: options.provider }),
          ...(options?.farmId && { farmId: options.farmId }),
        },
        orderBy: { lastActivityAt: "desc" },
        include: {
          summaries: {
            orderBy: { createdAt: "desc" },
            take: 1,
            where: {
              OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
            },
          },
        },
      });

      if (!recentThread) {
        return null;
      }

      const latestSummary = recentThread.summaries[0];

      return {
        previousSummary: latestSummary?.summary,
        keyTopics: latestSummary?.keyTopics as string[] | undefined,
        keyEntities: latestSummary?.keyEntities as
          | Record<string, string[]>
          | undefined,
        lastUserIntent: latestSummary?.userIntent || undefined,
        messageCount: recentThread.messageCount,
        lastActivityAt: recentThread.lastActivityAt,
      };
    } catch (error) {
      this.summaryLogger.error("Failed to get context for next chat", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      });
      return null;
    }
  }

  /**
   * Build a system prompt with previous context
   */
  buildContextualSystemPrompt(
    basePrompt: string,
    context: ContextForNextChat | null,
  ): string {
    if (!context || !context.previousSummary) {
      return basePrompt;
    }

    const contextSection = `
<previous_conversation_context>
The user has had previous conversations. Here's a summary of the most recent one:

${context.previousSummary}

${context.keyTopics && context.keyTopics.length > 0 ? `Key topics discussed: ${context.keyTopics.join(", ")}` : ""}

${context.lastUserIntent ? `The user's last intent was: "${context.lastUserIntent}"` : ""}

Use this context to provide more personalized and relevant responses.
</previous_conversation_context>
`;

    return `${basePrompt}\n\n${contextSection}`;
  }

  // --------------------------------------------------------------------------
  // CLEANUP & MAINTENANCE
  // --------------------------------------------------------------------------

  /**
   * Clean up expired summaries
   */
  async cleanupExpiredSummaries(): Promise<number> {
    try {
      const result = await database.chatSummary.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (result.count > 0) {
        this.summaryLogger.info("Cleaned up expired summaries", {
          count: result.count,
        });
      }

      return result.count;
    } catch (error) {
      this.summaryLogger.error("Failed to cleanup expired summaries", {
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  /**
   * Clean up old inactive threads
   */
  async cleanupInactiveThreads(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await database.chatThread.deleteMany({
        where: {
          isActive: false,
          lastActivityAt: {
            lt: cutoffDate,
          },
        },
      });

      if (result.count > 0) {
        this.summaryLogger.info("Cleaned up inactive threads", {
          count: result.count,
          daysOld,
        });
      }

      return result.count;
    } catch (error) {
      this.summaryLogger.error("Failed to cleanup inactive threads", {
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const chatSummaryService = new ChatSummaryService();

export default chatSummaryService;
