/**
 * 🌟 OLLAMA API ROUTE
 * Divine Agricultural AI Chat Endpoint
 * HP OMEN Optimized - DeepSeek-R1:7b
 */

import { createOllamaClient, type OllamaMessage } from "@/lib/ai/ollama";
import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("ollama-api");

// ============================================================================
// POST /api/ai/ollama - Chat with local Ollama
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to use AI features",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { message, context: _context, threadId, model, options } = body;

    // Validation
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_MESSAGE",
            message: "Message is required and must be a string",
          },
        },
        { status: 400 },
      );
    }

    // Create Ollama client
    const client = createOllamaClient(model || "deepseek-r1:7b");

    // Health check
    const isHealthy = await client.healthCheck();
    if (!isHealthy) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "OLLAMA_UNAVAILABLE",
            message:
              "Ollama service is not available. Please ensure Ollama is running on http://localhost:11434",
          },
        },
        { status: 503 },
      );
    }

    // Handle conversation thread
    let messages: OllamaMessage[] = [];

    if (threadId) {
      // Get existing conversation
      messages = client.getThreadHistory(threadId);
    } else {
      // New conversation - add system prompt for agricultural consciousness
      messages.push({
        role: "system",
        content: `You are an expert agricultural AI assistant for a divine farmers market platform.
You have deep knowledge of:
- Biodynamic farming and regenerative agriculture
- Seasonal crop planning and lunar cycles
- Organic pest management and soil health
- Local food systems and farmers market operations
- Sustainable farming practices

Provide practical, actionable advice with agricultural consciousness.
Always consider the holistic farm ecosystem and long-term sustainability.`,
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: message,
    });

    // Get response from Ollama
    const response = await client.chat(messages, {
      temperature: options?.temperature || 0.7,
      top_p: options?.top_p || 0.9,
      num_predict: options?.num_predict || 2048,
    });

    // Add assistant response to thread
    messages.push(response.message);

    // Save thread if threadId provided
    if (threadId) {
      client.clearThread(threadId);
      messages.forEach((msg) => client.addToThread(threadId, msg));
    }

    // Calculate performance metrics
    const tokensPerSecond =
      response.eval_count && response.eval_duration
        ? (
          response.eval_count /
          (response.eval_duration / 1_000_000_000)
        ).toFixed(2)
        : "N/A";

    return NextResponse.json({
      success: true,
      data: {
        message: response.message.content,
        model: response.model,
        threadId: threadId || undefined,
        metadata: {
          created_at: response.created_at,
          total_duration_ms: response.total_duration
            ? response.total_duration / 1_000_000
            : undefined,
          load_duration_ms: response.load_duration
            ? response.load_duration / 1_000_000
            : undefined,
          prompt_eval_count: response.prompt_eval_count,
          eval_count: response.eval_count,
          tokens_per_second: tokensPerSecond,
        },
      },
    });
  } catch (error) {
    logger.error("Ollama API error", error as Error, {
      endpoint: "POST /api/ai/ollama",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "OLLAMA_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to process request",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// GET /api/ai/ollama - Check Ollama status and list models
// ============================================================================

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to check AI status",
          },
        },
        { status: 401 },
      );
    }

    const client = createOllamaClient();

    // Check health
    const isHealthy = await client.healthCheck();

    if (!isHealthy) {
      return NextResponse.json({
        success: true,
        data: {
          status: "unavailable",
          healthy: false,
          message:
            "Ollama service is not running. Please start Ollama on http://localhost:11434",
          models: [],
        },
      });
    }

    // List available models
    const models = await client.listModels();

    // Check if deepseek-r1:7b is available
    const hasDeepSeek = models.some((model) =>
      model.name.includes("deepseek-r1"),
    );

    return NextResponse.json({
      success: true,
      data: {
        status: "online",
        healthy: true,
        message: "Ollama is running and ready",
        models: models.map((model) => ({
          name: model.name,
          size: model.size,
          modified_at: model.modified_at,
          parameter_size: model.details.parameter_size,
          quantization: model.details.quantization_level,
        })),
        hasDeepSeek,
        recommendedModel: hasDeepSeek ? "deepseek-r1:7b" : models[0]?.name,
      },
    });
  } catch (error) {
    logger.error("Ollama status check error", error as Error, {
      endpoint: "GET /api/ai/ollama",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "STATUS_CHECK_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to check Ollama status",
        },
      },
      { status: 500 },
    );
  }
}
