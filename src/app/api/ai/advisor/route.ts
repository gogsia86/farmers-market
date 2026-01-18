/**
 * AI Agricultural Advisor API
 * POST /api/ai/advisor
 *
 * Provides expert agricultural advice using AI agents with conversation context.
 * Handles farming questions, crop recommendations, pest management, and more.
 *
 * @module api/ai/advisor
 */

import {
  CUSTOMER_SUPPORT_AGENT,
  FARM_ANALYST_AGENT,
  getOpenAIClient,
} from "@/lib/ai/agent-config";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("AI-Advisor");

// ============================================================================
// Validation Schema
// ============================================================================

const AdvisorRequestSchema = z.object({
  message: z.string().min(5).max(2000),
  userId: z.string().optional(),
  farmId: z.string().optional(),
  threadId: z.string().optional(), // For continuing conversations
  context: z
    .object({
      location: z.string().optional(),
      farmSize: z.string().optional(),
      cropTypes: z.array(z.string()).optional(),
      currentSeason: z.string().optional(),
      farmingPractices: z.array(z.string()).optional(),
      specificIssue: z.string().optional(),
    })
    .optional(),
  agentType: z
    .enum(["farm_analyst", "customer_support", "auto"])
    .default("auto"),
  includeHistory: z.boolean().default(true),
  maxHistoryMessages: z.number().min(0).max(20).default(10),
});

type AdvisorRequest = z.infer<typeof AdvisorRequestSchema>;

interface AdvisorResponse {
  success: boolean;
  data?: {
    response: string;
    threadId: string;
    agentUsed: string;
    confidence: number;
    suggestions?: string[];
    relatedTopics?: string[];
    citations?: Array<{
      title: string;
      url?: string;
      snippet?: string;
    }>;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    model: string;
    tokensUsed: number;
    requestId: string;
    processingTime: number;
    conversationLength?: number;
  };
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse<AdvisorResponse>> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = AdvisorRequestSchema.parse(body);

    logger.info("Processing advisor request", {
      requestId,
      userId: validatedData.userId,
      farmId: validatedData.farmId,
      messageLength: validatedData.message.length,
      agentType: validatedData.agentType,
    });

    // Get or create chat thread
    const thread = await getOrCreateThread(
      validatedData.userId,
      validatedData.farmId,
      validatedData.threadId,
    );

    // Get conversation history if requested
    let conversationHistory: string[] = [];
    if (validatedData.includeHistory && thread) {
      conversationHistory = await getConversationHistory(
        thread.id,
        validatedData.maxHistoryMessages,
      );
    }

    // Determine which agent to use
    const agentName = determineAgent(
      validatedData.message,
      validatedData.agentType,
    );

    // Generate response
    const result = await generateAdvisorResponse(
      validatedData,
      agentName,
      conversationHistory,
      requestId,
    );

    // Save message to database if thread exists
    if (thread) {
      await saveConversationMessages(
        thread.id,
        validatedData.message,
        result.response,
        agentName,
        result.tokensUsed,
        result.confidence,
      );
    }

    const processingTime = Date.now() - startTime;

    logger.info("Advisor response generated", {
      requestId,
      processingTime,
      threadId: thread?.id,
      agentUsed: agentName,
      confidence: result.confidence,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          response: result.response,
          threadId: thread?.id || "",
          agentUsed: agentName,
          confidence: result.confidence,
          suggestions: result.suggestions,
          relatedTopics: result.relatedTopics,
          citations: result.citations,
        },
        metadata: {
          model: result.model,
          tokensUsed: result.tokensUsed || 0,
          requestId,
          processingTime,
          conversationLength: conversationHistory.length + 2, // +2 for current exchange
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn("Validation error", { requestId, errors: error.errors });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors,
          },
          metadata: {
            model: "gpt-4o",
            tokensUsed: 0,
            requestId,
            processingTime,
          },
        },
        { status: 400 },
      );
    }

    logger.error("Failed to generate advisor response", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate advisor response. Please try again.",
        },
        metadata: {
          model: "gpt-4o",
          tokensUsed: 0,
          requestId,
          processingTime,
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// Thread Management
// ============================================================================

async function getOrCreateThread(
  userId?: string,
  farmId?: string,
  threadId?: string,
) {
  try {
    // If threadId provided, try to get existing thread
    if (threadId) {
      const existing = await database.chatThread.findUnique({
        where: { id: threadId },
      });
      if (existing) {
        // Update last activity
        return await database.chatThread.update({
          where: { id: threadId },
          data: { lastActivityAt: new Date() },
        });
      }
    }

    // Create new thread
    const title = `Agricultural Advice - ${new Date().toLocaleDateString()}`;

    return await database.chatThread.create({
      data: {
        userId: userId || null,
        farmId: farmId || null,
        title,
        provider: "OPENAI",
        model: "gpt-4o",
        isActive: true,
        messageCount: 0,
        lastActivityAt: new Date(),
      },
    });
  } catch (error) {
    logger.error("Failed to create/get thread", { error, userId, farmId });
    return null;
  }
}

async function getConversationHistory(
  threadId: string,
  maxMessages: number,
): Promise<string[]> {
  try {
    const messages = await database.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "desc" },
      take: maxMessages,
      select: {
        role: true,
        content: true,
      },
    });

    // Reverse to get chronological order and format
    return messages
      .reverse()
      .map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`);
  } catch (error) {
    logger.error("Failed to get conversation history", { error, threadId });
    return [];
  }
}

async function saveConversationMessages(
  threadId: string,
  userMessage: string,
  assistantResponse: string,
  agentName: string,
  tokensUsed?: number,
  confidence?: number,
) {
  try {
    // Save user message
    await database.chatMessage.create({
      data: {
        threadId,
        role: "USER",
        content: userMessage,
        tokens: Math.ceil(userMessage.length / 4), // Rough estimate
        model: "gpt-4o",
      },
    });

    // Save assistant response
    await database.chatMessage.create({
      data: {
        threadId,
        role: "ASSISTANT",
        content: assistantResponse,
        tokens: tokensUsed || Math.ceil(assistantResponse.length / 4),
        model: "gpt-4o",
        confidence: confidence,
      },
    });

    // Update thread message count
    await database.chatThread.update({
      where: { id: threadId },
      data: {
        messageCount: { increment: 2 },
        lastActivityAt: new Date(),
      },
    });

    logger.debug("Conversation messages saved", {
      threadId,
      agentName,
      tokensUsed,
    });
  } catch (error) {
    logger.error("Failed to save conversation messages", {
      error,
      threadId,
    });
    // Don't throw - conversation can continue without persistence
  }
}

// ============================================================================
// Agent Selection
// ============================================================================

function determineAgent(message: string, requestedType: string): string {
  // If specific agent requested, use it
  if (requestedType === "farm_analyst") return "farmAnalyst";
  if (requestedType === "customer_support") return "customerSupport";

  // Auto-detect based on message content
  const messageLower = message.toLowerCase();

  // Farm analysis keywords
  const farmAnalysisKeywords = [
    "yield",
    "crop rotation",
    "soil",
    "fertilizer",
    "harvest",
    "planting",
    "season",
    "analytics",
    "performance",
    "optimization",
    "schedule",
    "calendar",
    "biodynamic",
    "sustainable",
    "regenerative",
  ];

  // Customer support keywords
  const customerSupportKeywords = [
    "order",
    "delivery",
    "price",
    "buy",
    "purchase",
    "payment",
    "refund",
    "complaint",
    "issue",
    "problem",
    "help",
    "how do i",
    "where can i",
    "when will",
  ];

  // Count keyword matches
  const farmScore = farmAnalysisKeywords.filter((kw) =>
    messageLower.includes(kw),
  ).length;
  const supportScore = customerSupportKeywords.filter((kw) =>
    messageLower.includes(kw),
  ).length;

  // Default to farm analyst for agricultural questions
  return supportScore > farmScore ? "customerSupport" : "farmAnalyst";
}

// ============================================================================
// Response Generation
// ============================================================================

async function generateAdvisorResponse(
  data: AdvisorRequest,
  agentName: string,
  conversationHistory: string[],
  requestId: string,
): Promise<{
  response: string;
  confidence: number;
  suggestions?: string[];
  relatedTopics?: string[];
  citations?: Array<{ title: string; url?: string; snippet?: string }>;
  model: string;
  tokensUsed?: number;
}> {
  const client = getOpenAIClient();
  const agentConfig =
    agentName === "farmAnalyst" ? FARM_ANALYST_AGENT : CUSTOMER_SUPPORT_AGENT;

  // Build context-aware prompt
  const contextInfo = buildContextInfo(data.context);
  const historyContext =
    conversationHistory.length > 0
      ? `\n\n**Previous Conversation**:\n${conversationHistory.join("\n")}\n`
      : "";

  const fullPrompt = `${contextInfo}${historyContext}\n**Current Question**: ${data.message}

Provide a comprehensive, actionable response that:
1. Directly answers the question
2. Considers agricultural best practices
3. Takes into account the provided context (location, season, practices)
4. Offers specific recommendations when applicable
5. Maintains conversational continuity if this is part of an ongoing discussion

Return your response as JSON with the following structure:
{
  "response": "Your detailed answer (200-500 words)",
  "suggestions": ["Optional follow-up action 1", "Optional follow-up action 2"],
  "relatedTopics": ["Related topic 1", "Related topic 2"],
  "citations": [{"title": "Source title", "snippet": "Relevant info"}]
}`;

  try {
    const completion = await client.chat.completions.create({
      model: agentConfig.model,
      messages: [
        {
          role: "system",
          content: agentConfig.systemPrompt,
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      temperature: agentConfig.temperature,
      max_tokens: agentConfig.maxTokens,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content || "{}";

    // Defensive JSON parsing with fallback
    let parsedResponse: any = null;

    try {
      // Attempt to parse as JSON
      const trimmedContent = responseContent.trim();

      if (!trimmedContent) {
        logger.warn("Empty response content from AI model", { requestId });
        parsedResponse = {
          response:
            "I received your question but couldn't generate a proper response. Please try asking in a different way.",
        };
      } else if (
        trimmedContent.startsWith("{") ||
        trimmedContent.startsWith("[")
      ) {
        // Looks like JSON, try to parse
        parsedResponse = JSON.parse(trimmedContent);
      } else {
        // Plain text response (shouldn't happen with json_object format, but defensive)
        logger.warn(
          "Non-JSON response from AI model despite json_object format",
          {
            requestId,
            contentPreview: trimmedContent.substring(0, 100),
          },
        );
        parsedResponse = {
          response: trimmedContent,
        };
      }
    } catch (parseError) {
      // JSON parsing failed - log and create fallback response
      logger.error("Failed to parse AI model response as JSON", {
        requestId,
        parseError:
          parseError instanceof Error ? parseError.message : String(parseError),
        rawContentPreview: responseContent.substring(0, 200),
        contentLength: responseContent.length,
      });

      // Use the raw content as the response text
      parsedResponse = {
        response:
          responseContent.length > 0
            ? responseContent
            : "I'm having trouble formulating a response. Could you rephrase your question?",
      };
    }

    // Validate parsed response structure
    if (!parsedResponse || typeof parsedResponse !== "object") {
      logger.warn("Invalid parsed response structure", {
        requestId,
        parsedResponse,
      });
      parsedResponse = {
        response:
          "I encountered an issue processing your request. Please try again.",
      };
    }

    // Calculate confidence
    const confidence = calculateResponseConfidence(
      parsedResponse,
      data.message,
    );

    return {
      response:
        parsedResponse.response ||
        "I understand your question. Let me provide some guidance on agricultural best practices for your situation.",
      confidence,
      suggestions: Array.isArray(parsedResponse.suggestions)
        ? parsedResponse.suggestions
        : [],
      relatedTopics: Array.isArray(parsedResponse.relatedTopics)
        ? parsedResponse.relatedTopics
        : [],
      citations: Array.isArray(parsedResponse.citations)
        ? parsedResponse.citations
        : [],
      model: agentConfig.model,
      tokensUsed: completion.usage?.total_tokens,
    };
  } catch (error) {
    logger.error("AI response generation failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
    });

    // Fallback response
    return {
      response:
        "I'm here to help with your agricultural questions. However, I'm experiencing some technical difficulties at the moment. Please try rephrasing your question or contact our support team for immediate assistance.",
      confidence: 0.3,
      model: agentConfig.model,
    };
  }
}

function buildContextInfo(context?: AdvisorRequest["context"]): string {
  if (!context) return "";

  const parts: string[] = [];

  if (context.location) parts.push(`**Location**: ${context.location}`);
  if (context.farmSize) parts.push(`**Farm Size**: ${context.farmSize}`);
  if (context.currentSeason)
    parts.push(`**Current Season**: ${context.currentSeason}`);
  if (context.cropTypes && context.cropTypes.length > 0)
    parts.push(`**Crops**: ${context.cropTypes.join(", ")}`);
  if (context.farmingPractices && context.farmingPractices.length > 0)
    parts.push(`**Farming Practices**: ${context.farmingPractices.join(", ")}`);
  if (context.specificIssue)
    parts.push(`**Current Issue**: ${context.specificIssue}`);

  return parts.length > 0 ? `**Context**:\n${parts.join("\n")}\n` : "";
}

function calculateResponseConfidence(
  response: any,
  originalQuestion: string,
): number {
  let confidence = 0.5; // Base confidence

  // Has substantial response
  if (response.response && response.response.length > 100) confidence += 0.2;
  if (response.response && response.response.length > 300) confidence += 0.1;

  // Has actionable suggestions
  if (
    response.suggestions &&
    Array.isArray(response.suggestions) &&
    response.suggestions.length > 0
  )
    confidence += 0.1;

  // Has related topics
  if (
    response.relatedTopics &&
    Array.isArray(response.relatedTopics) &&
    response.relatedTopics.length > 0
  )
    confidence += 0.05;

  // Has citations
  if (
    response.citations &&
    Array.isArray(response.citations) &&
    response.citations.length > 0
  )
    confidence += 0.05;

  return Math.min(confidence, 0.95);
}

// ============================================================================
// OPTIONS Handler (CORS)
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}
