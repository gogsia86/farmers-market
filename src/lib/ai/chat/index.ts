/**
 * 🧠 AI CHAT MODULE - Central Exports
 * Divine Agricultural Intelligence - Chat & Conversation Management
 *
 * Provides:
 * - Chat summary service for persistence
 * - Context injection utilities
 * - Thread management helpers
 *
 * @module ai/chat
 */

// Re-export chat summary service and types
export {
  chatSummaryService,
  type CreateThreadOptions,
  type AddMessageOptions,
  type GenerateSummaryOptions,
  type SummaryResult,
  type ThreadWithContext,
  type ContextForNextChat,
} from "../chat-summary.service";

// Export types from Prisma for convenience
export type {
  ChatThread,
  ChatMessage,
  ChatSummary,
  ChatProvider,
  ChatRole,
} from "@prisma/client";

/**
 * Helper function to start a new chat with context
 */
export async function startNewChatWithContext(
  provider: "ollama" | "perplexity",
  options: {
    userId: string;
    farmId?: string;
    title?: string;
    systemPrompt?: string;
  },
) {
  if (provider === "ollama") {
    const { createOllamaClient } = await import("../ollama");
    const client = createOllamaClient();
    return client.startChatWithContext(options);
  } else {
    const { createPerplexityClient } = await import("../perplexity");
    const client = createPerplexityClient();
    return client.startChatWithContext(options);
  }
}

/**
 * Helper function to generate summary for a thread
 */
export async function generateChatSummary(
  threadId: string,
  provider: "ollama" | "perplexity",
  force?: boolean,
) {
  if (provider === "ollama") {
    const { createOllamaClient } = await import("../ollama");
    const client = createOllamaClient();
    return client.generateThreadSummary(threadId, { force });
  } else {
    const { createPerplexityClient } = await import("../perplexity");
    const client = createPerplexityClient();
    return client.generateThreadSummary(threadId, { force });
  }
}

/**
 * Helper function to close a chat and get final summary
 */
export async function closeChatWithSummary(
  threadId: string,
  provider: "ollama" | "perplexity",
) {
  if (provider === "ollama") {
    const { createOllamaClient } = await import("../ollama");
    const client = createOllamaClient();
    return client.closePersistedThread(threadId);
  } else {
    const { createPerplexityClient } = await import("../perplexity");
    const client = createPerplexityClient();
    return client.closePersistedThread(threadId);
  }
}
