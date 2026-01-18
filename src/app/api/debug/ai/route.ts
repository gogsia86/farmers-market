/**
 * 🤖 AI DEBUG ENDPOINT
 *
 * Tests AI integration (OpenAI) and configuration
 * Part of Wave 2: Integration Verification
 *
 * Usage:
 *   GET  /api/debug/ai         - Check AI configuration
 *   POST /api/debug/ai         - Test AI completion
 *
 * ⚠️ SECURITY: Only available in development or with debug token
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

// Security check
function isAuthorized(request: NextRequest): boolean {
  const isDevelopment = process.env.NODE_ENV === "development";
  const hasDebugToken =
    request.headers.get("x-debug-token") === process.env.DEBUG_TOKEN;

  return isDevelopment || hasDebugToken;
}

interface AIConfig {
  provider: string;
  configured: boolean;
  variables: {
    [key: string]: boolean;
  };
  models: {
    available: string[];
    recommended: string[];
  };
}

function checkAIConfiguration(): AIConfig {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  const configured = !!(openaiApiKey || anthropicApiKey);
  let provider = "none";

  if (openaiApiKey) {
    provider = "openai";
  } else if (anthropicApiKey) {
    provider = "anthropic";
  }

  return {
    provider,
    configured,
    variables: {
      OPENAI_API_KEY: !!openaiApiKey,
      ANTHROPIC_API_KEY: !!anthropicApiKey,
      OPENAI_ORG_ID: !!process.env.OPENAI_ORG_ID,
    },
    models: {
      available:
        provider === "openai"
          ? ["gpt-4-turbo-preview", "gpt-4", "gpt-3.5-turbo"]
          : provider === "anthropic"
            ? ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"]
            : [],
      recommended:
        provider === "openai"
          ? ["gpt-4-turbo-preview"]
          : provider === "anthropic"
            ? ["claude-3-sonnet"]
            : [],
    },
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        hint: "This endpoint is only available in development mode or with x-debug-token header",
      },
      { status: 403 }
    );
  }

  const config = checkAIConfiguration();

  if (!config.configured) {
    return NextResponse.json(
      {
        success: false,
        message: "AI is not configured",
        configuration: config,
        recommendations: [
          "Choose one AI provider:",
          "",
          "Option 1: OpenAI (Recommended)",
          "  1. Sign up at https://platform.openai.com/",
          "  2. Create an API key at https://platform.openai.com/api-keys",
          "  3. Add to .env.local:",
          "     OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx",
          "",
          "Option 2: Anthropic (Claude)",
          "  1. Sign up at https://console.anthropic.com/",
          "  2. Create an API key",
          "  3. Add to .env.local:",
          "     ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx",
        ],
        pricing: {
          openai: {
            "gpt-4-turbo-preview": "$0.01/1K tokens (input), $0.03/1K tokens (output)",
            "gpt-3.5-turbo": "$0.0005/1K tokens (input), $0.0015/1K tokens (output)",
            url: "https://openai.com/pricing",
          },
          anthropic: {
            "claude-3-sonnet": "$0.003/1K tokens (input), $0.015/1K tokens (output)",
            "claude-3-haiku": "$0.00025/1K tokens (input), $0.00125/1K tokens (output)",
            url: "https://www.anthropic.com/pricing",
          },
        },
      },
      { status: 200 }
    );
  }

  // Configuration is valid
  return NextResponse.json({
    success: true,
    message: "AI is properly configured",
    configuration: config,
    capabilities: [
      "🌾 Product description generation",
      "🤖 Agricultural chatbot assistance",
      "📝 Farm profile optimization",
      "🔍 Product categorization",
      "💡 Smart recommendations",
      "🎨 Content enhancement",
    ],
    instructions: {
      testCompletion: "POST to this endpoint to test AI completion",
      example: {
        method: "POST",
        url: "/api/debug/ai",
        body: {
          prompt: "Write a short description for organic tomatoes",
          maxTokens: 100,
        },
      },
    },
    nextSteps: [
      "1. Send a test request using POST",
      "2. Verify AI responses are relevant",
      "3. Test product description generation",
      "4. Monitor usage and costs",
      "5. Set up rate limiting if needed",
    ],
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        hint: "This endpoint is only available in development mode",
      },
      { status: 403 }
    );
  }

  const config = checkAIConfiguration();

  if (!config.configured) {
    return NextResponse.json(
      {
        success: false,
        error: "AI is not configured",
        hint: "Configure OPENAI_API_KEY or ANTHROPIC_API_KEY first",
      },
      { status: 500 }
    );
  }

  if (config.provider !== "openai") {
    return NextResponse.json(
      {
        success: false,
        error: "Only OpenAI is currently supported in this test endpoint",
        hint: "Add OPENAI_API_KEY to test AI functionality",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      prompt = "Write a short, appealing description for fresh organic tomatoes from a local farm.",
      maxTokens = 150,
      temperature = 0.7,
      model = "gpt-3.5-turbo",
    } = body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const startTime = Date.now();

    // Test chat completion
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for a farmers market platform. Write compelling, authentic product descriptions that highlight freshness, quality, and local farming practices.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const responseText =
      completion.choices[0]?.message?.content || "No response generated";
    const usage = completion.usage;

    // Test product description generation (core feature)
    const productDescCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a copywriter for a farmers market platform. Create compelling product descriptions under 100 words.",
        },
        {
          role: "user",
          content: "Product: Organic Heirloom Tomatoes, Farm: Green Valley Farm",
        },
      ],
      max_tokens: 120,
      temperature: 0.8,
    });

    const productDesc =
      productDescCompletion.choices[0]?.message?.content ||
      "No description generated";

    return NextResponse.json({
      success: true,
      message: "AI test completed successfully",
      provider: config.provider,
      model,
      tests: {
        customPrompt: {
          prompt,
          response: responseText,
          responseTime: `${responseTime}ms`,
          usage: {
            promptTokens: usage?.prompt_tokens || 0,
            completionTokens: usage?.completion_tokens || 0,
            totalTokens: usage?.total_tokens || 0,
          },
        },
        productDescription: {
          prompt: "Generate product description for Organic Heirloom Tomatoes",
          response: productDesc,
          usage: {
            totalTokens: productDescCompletion.usage?.total_tokens || 0,
          },
        },
      },
      performance: {
        averageResponseTime: `${responseTime}ms`,
        status: responseTime < 3000 ? "excellent" : responseTime < 5000 ? "good" : "slow",
        recommendation:
          responseTime > 5000
            ? "Consider using a faster model like gpt-3.5-turbo"
            : "Response time is acceptable",
      },
      costs: {
        estimated: calculateEstimatedCost(
          model,
          usage?.total_tokens || 0,
          productDescCompletion.usage?.total_tokens || 0
        ),
        note: "Costs are approximate. Check your OpenAI dashboard for accurate billing.",
      },
      nextSteps: [
        "✅ AI integration is working correctly",
        "📊 Monitor usage in OpenAI dashboard",
        "💰 Set up billing alerts to avoid unexpected charges",
        "🔒 Implement rate limiting for production",
        "🎯 Test AI features in the actual application",
      ],
      links: {
        dashboard: "https://platform.openai.com/usage",
        billing: "https://platform.openai.com/account/billing",
        documentation: "https://platform.openai.com/docs",
      },
    });
  } catch (error: any) {
    const errorMessage = error?.message || "Unknown error";
    const errorCode = error?.code || "unknown";

    // Parse common OpenAI errors
    let troubleshooting: string[] = [];
    let hint = "";

    if (errorCode === "invalid_api_key" || errorMessage.includes("API key")) {
      hint = "Invalid API key. Check your OPENAI_API_KEY in .env.local";
      troubleshooting = [
        "1. Verify your API key is correct",
        "2. Get a new key at https://platform.openai.com/api-keys",
        "3. Make sure the key starts with 'sk-proj-' or 'sk-'",
        "4. Restart your development server after updating .env.local",
      ];
    } else if (errorCode === "insufficient_quota") {
      hint = "Insufficient quota. Add credits to your OpenAI account.";
      troubleshooting = [
        "1. Visit https://platform.openai.com/account/billing",
        "2. Add payment method and credits",
        "3. Check your usage limits",
      ];
    } else if (errorCode === "rate_limit_exceeded") {
      hint = "Rate limit exceeded. Wait and try again.";
      troubleshooting = [
        "1. Wait a few minutes and retry",
        "2. Implement exponential backoff",
        "3. Consider upgrading your plan for higher limits",
      ];
    } else if (errorMessage.includes("timeout")) {
      hint = "Request timed out. Try with a smaller prompt.";
      troubleshooting = [
        "1. Reduce maxTokens parameter",
        "2. Simplify your prompt",
        "3. Check network connectivity",
      ];
    } else {
      hint = "An unexpected error occurred";
      troubleshooting = [
        "1. Check OpenAI status at https://status.openai.com/",
        "2. Verify your network connectivity",
        "3. Review error details below",
        "4. Check OpenAI API logs in dashboard",
      ];
    }

    return NextResponse.json(
      {
        success: false,
        error: "AI test failed",
        details: {
          errorMessage,
          errorCode,
          hint,
          provider: config.provider,
        },
        troubleshooting,
        links: {
          status: "https://status.openai.com/",
          apiKeys: "https://platform.openai.com/api-keys",
          billing: "https://platform.openai.com/account/billing",
          support: "https://help.openai.com/",
        },
      },
      { status: 500 }
    );
  }
}

function calculateEstimatedCost(
  model: string,
  tokens1: number,
  tokens2: number
): string {
  const totalTokens = tokens1 + tokens2;

  // Pricing per 1K tokens (approximate)
  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-4-turbo-preview": { input: 0.01, output: 0.03 },
    "gpt-4": { input: 0.03, output: 0.06 },
    "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  };

  const modelPricing = pricing[model] || pricing["gpt-3.5-turbo"];

  // Rough estimate (assuming 50/50 input/output)
  const avgCostPer1K = (modelPricing.input + modelPricing.output) / 2;
  const estimatedCost = (totalTokens / 1000) * avgCostPer1K;

  if (estimatedCost < 0.01) {
    return `< $0.01 (${totalTokens} tokens)`;
  }

  return `~$${estimatedCost.toFixed(4)} (${totalTokens} tokens)`;
}
