/**
 * 🤖 AI Chat API Endpoint
 *
 * Provides conversational AI assistance using the multi-agent system.
 * Supports different agent types based on user role and context.
 *
 * @route POST /api/ai/chat
 */

import {
    getAgentConfig,
    invokeAgent,
    listAvailableAgents,
    type AgentContext,
    type AgentResponse
} from "@/lib/ai/agent-config";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================================
// Request Validation Schema
// ============================================================================

const ChatRequestSchema = z.object({
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long (max 2000 characters)"),

  agentName: z.enum([
    "farmAnalyst",
    "productCatalog",
    "orderProcessor",
    "customerSupport"
  ]).optional().default("customerSupport"),

  context: z.object({
    farmId: z.string().optional(),
    orderId: z.string().optional(),
    productId: z.string().optional(),
    conversationId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }).optional(),
});

type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ============================================================================
// API Route Handlers
// ============================================================================

/**
 * POST /api/ai/chat
 * Send a message to an AI agent and get a response
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to use AI chat"
          }
        },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = ChatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.flatten()
          }
        },
        { status: 400 }
      );
    }

    const { message, agentName, context } = validation.data;

    // 3. Determine appropriate agent based on user role and request
    const selectedAgent = selectAgentByRole(
      agentName,
      session.user.role || "CUSTOMER"
    );

    // 4. Build agent context with user information
    const agentContext: AgentContext = {
      userId: session.user.id,
      userRole: session.user.role || "CUSTOMER",
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      ...context,
      metadata: {
        ...context?.metadata,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get("user-agent") || undefined,
      }
    };

    // 5. Invoke AI agent
    logger.info("AI chat request", {
      userId: session.user.id,
      agentName: selectedAgent,
      messageLength: message.length,
      contextKeys: Object.keys(agentContext),
    });

    const agentResponse: AgentResponse = await invokeAgent(
      selectedAgent,
      message,
      agentContext
    );

    // 6. Log interaction for analytics
    await logChatInteraction({
      userId: session.user.id,
      agentName: selectedAgent,
      message,
      response: agentResponse.content,
      confidence: agentResponse.confidence,
      context: agentContext,
    });

    // 7. Return success response
    return NextResponse.json({
      success: true,
      data: {
        agent: agentResponse.agent,
        message: agentResponse.content,
        confidence: agentResponse.confidence,
        reasoning: agentResponse.reasoning,
        metadata: {
          ...agentResponse.metadata,
          conversationId: context?.conversationId || generateConversationId(),
          timestamp: new Date().toISOString(),
        }
      }
    });

  } catch (error) {
    // Error handling
    logger.error("AI chat error", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error"
    });

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("Agent") && error.message.includes("not found")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_AGENT",
              message: "The requested AI agent is not available"
            }
          },
          { status: 400 }
        );
      }

      if (error.message.includes("OPENAI_API_KEY")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SERVICE_UNAVAILABLE",
              message: "AI service is temporarily unavailable"
            }
          },
          { status: 503 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while processing your request. Please try again."
        }
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/chat
 * Get information about available AI agents
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required"
          }
        },
        { status: 401 }
      );
    }

    // Get available agents
    const agents = listAvailableAgents();
    const userRole = session.user.role || "CUSTOMER";

    // Filter agents based on user role
    const availableAgents = agents
      .filter(agentName => isAgentAvailableForRole(agentName, userRole))
      .map(agentName => {
        const config = getAgentConfig(agentName);
        return {
          name: config.name,
          role: config.role,
          capabilities: config.capabilities,
          description: getAgentDescription(agentName),
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        agents: availableAgents,
        userRole,
        defaultAgent: getDefaultAgentForRole(userRole),
      }
    });

  } catch (error) {
    logger.error("Failed to fetch AI agents", { error });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch available agents"
        }
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Select appropriate agent based on user role
 */
function selectAgentByRole(
  requestedAgent: string,
  userRole: string
): string {
  // Admin can use any agent
  if (userRole === "ADMIN") {
    return requestedAgent;
  }

  // Farmers should use farmAnalyst or productCatalog
  if (userRole === "FARMER") {
    if (requestedAgent === "orderProcessor") {
      return "orderProcessor";
    }
    return requestedAgent === "productCatalog" ? "productCatalog" : "farmAnalyst";
  }

  // Customers use customerSupport or orderProcessor
  if (userRole === "CUSTOMER") {
    return requestedAgent === "orderProcessor" ? "orderProcessor" : "customerSupport";
  }

  // Default to customer support
  return "customerSupport";
}

/**
 * Check if agent is available for user role
 */
function isAgentAvailableForRole(agentName: string, userRole: string): boolean {
  if (userRole === "ADMIN") return true;

  const roleAgentMap: Record<string, string[]> = {
    FARMER: ["farmAnalyst", "productCatalog", "orderProcessor"],
    CUSTOMER: ["customerSupport", "orderProcessor"],
  };

  return roleAgentMap[userRole]?.includes(agentName) ?? false;
}

/**
 * Get default agent for user role
 */
function getDefaultAgentForRole(userRole: string): string {
  const defaultAgents: Record<string, string> = {
    FARMER: "farmAnalyst",
    CUSTOMER: "customerSupport",
    ADMIN: "farmAnalyst",
  };

  return defaultAgents[userRole] || "customerSupport";
}

/**
 * Get human-readable description for agent
 */
function getAgentDescription(agentName: string): string {
  const descriptions: Record<string, string> = {
    farmAnalyst: "Farm operations expert providing insights on yield, efficiency, and crop planning",
    productCatalog: "Product management specialist helping with descriptions, pricing, and inventory",
    orderProcessor: "Order management assistant for tracking deliveries and resolving issues",
    customerSupport: "General support agent for questions about products, farms, and platform features",
  };

  return descriptions[agentName] || "AI assistant";
}

/**
 * Generate unique conversation ID
 */
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Log chat interaction for analytics and improvement
 */
async function logChatInteraction(data: {
  userId: string;
  agentName: string;
  message: string;
  response: string;
  confidence: number;
  context: AgentContext;
}): Promise<void> {
  try {
    // In production, you might want to:
    // 1. Store in a database for analytics
    // 2. Send to analytics service
    // 3. Use for model training/fine-tuning

    logger.info("AI chat interaction logged", {
      userId: data.userId,
      agentName: data.agentName,
      messageLength: data.message.length,
      responseLength: data.response.length,
      confidence: data.confidence,
      hasContext: Object.keys(data.context).length > 0,
    });

    // TODO: Implement actual logging to database
    // await database.aiChatLog.create({
    //   data: {
    //     userId: data.userId,
    //     agentName: data.agentName,
    //     message: data.message,
    //     response: data.response,
    //     confidence: data.confidence,
    //     context: data.context,
    //     createdAt: new Date(),
    //   }
    // });

  } catch (error) {
    // Don't fail the request if logging fails
    logger.error("Failed to log chat interaction", { error });
  }
}
