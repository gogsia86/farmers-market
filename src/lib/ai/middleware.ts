/**
 * 🤖 AI MIDDLEWARE
 * Authentication, rate limiting, and cost tracking for AI endpoints
 *
 * Features:
 * - User authentication validation
 * - Rate limiting per user/endpoint
 * - AI usage logging and cost tracking
 * - Quota enforcement
 * - Error handling and logging
 *
 * @module lib/ai/middleware
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  checkRateLimitSync,
  createRateLimitHeaders,
  getRateLimitIdentifier,
  type RateLimitConfig,
  type RateLimitResult,
} from "@/lib/rate-limit";
import { createLogger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("AI-Middleware");

// ============================================================================
// Types
// ============================================================================

export interface AIMiddlewareConfig {
  requireAuth?: boolean;
  rateLimitConfig?: RateLimitConfig;
  endpoint: string;
  checkQuota?: boolean;
}

export interface AIMiddlewareResult {
  success: boolean;
  userId?: string;
  email?: string;
  role?: string;
  rateLimitResult?: RateLimitResult;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export interface AIUsageData {
  userId: string;
  endpoint: string;
  model: string;
  tokensUsed: number;
  costUSD: number;
  requestId: string;
  requestData?: any;
  responseData?: any;
  confidence?: number;
  processingTimeMs: number;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

// ============================================================================
// Cost Calculation (OpenAI Pricing)
// ============================================================================

const MODEL_PRICING = {
  "gpt-4o": {
    input: 2.5 / 1_000_000, // $2.50 per 1M input tokens
    output: 10.0 / 1_000_000, // $10.00 per 1M output tokens
  },
  "gpt-4o-mini": {
    input: 0.15 / 1_000_000, // $0.15 per 1M input tokens
    output: 0.6 / 1_000_000, // $0.60 per 1M output tokens
  },
  "gpt-4-turbo-preview": {
    input: 10.0 / 1_000_000,
    output: 30.0 / 1_000_000,
  },
  "gpt-4-vision-preview": {
    input: 10.0 / 1_000_000,
    output: 30.0 / 1_000_000,
  },
  "gpt-3.5-turbo": {
    input: 0.5 / 1_000_000,
    output: 1.5 / 1_000_000,
  },
} as const;

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing =
    MODEL_PRICING[model as keyof typeof MODEL_PRICING] ||
    MODEL_PRICING["gpt-4o"];

  const inputCost = inputTokens * pricing.input;
  const outputCost = outputTokens * pricing.output;

  return inputCost + outputCost;
}

export function estimateCost(model: string, totalTokens: number): number {
  // Estimate: assume 70% input, 30% output
  const inputTokens = Math.floor(totalTokens * 0.7);
  const outputTokens = Math.floor(totalTokens * 0.3);

  return calculateCost(model, inputTokens, outputTokens);
}

// ============================================================================
// Authentication & Authorization
// ============================================================================

export async function checkAuth(
  request: NextRequest,
): Promise<AIMiddlewareResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message:
            "Authentication required. Please sign in to use AI features.",
          statusCode: 401,
        },
      };
    }

    // Check if user is active
    const user = await database.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User account not found.",
          statusCode: 401,
        },
      };
    }

    if (user.status !== "ACTIVE") {
      return {
        success: false,
        error: {
          code: "ACCOUNT_SUSPENDED",
          message: "Your account is not active. Please contact support.",
          statusCode: 403,
        },
      };
    }

    return {
      success: true,
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    logger.error("Authentication check failed", { error });
    return {
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: "Authentication error. Please try again.",
        statusCode: 500,
      },
    };
  }
}

// ============================================================================
// Quota Checking
// ============================================================================

export async function checkQuota(
  userId: string,
  endpoint: string,
): Promise<AIMiddlewareResult> {
  try {
    // Get or create user quota
    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    let quota = await database.aIUsageQuota.findUnique({
      where: { userId },
    });

    if (!quota) {
      // Create default quota
      quota = await database.aIUsageQuota.create({
        data: {
          userId,
          periodStart: now,
          periodEnd,
        },
      });
    }

    // Check if period has expired and reset if needed
    if (quota.periodEnd < now) {
      quota = await database.aIUsageQuota.update({
        where: { userId },
        data: {
          monthlyTokenUsed: 0,
          monthlyCostUsed: 0,
          periodStart: now,
          periodEnd,
        },
      });
    }

    // Check monthly limits
    if (quota.monthlyTokenUsed >= quota.monthlyTokenLimit) {
      return {
        success: false,
        error: {
          code: "QUOTA_EXCEEDED",
          message: `Monthly token quota exceeded (${quota.monthlyTokenUsed}/${quota.monthlyTokenLimit}). Resets on ${quota.periodEnd.toLocaleDateString()}.`,
          statusCode: 429,
        },
      };
    }

    const monthlyCostUsed = parseFloat(quota.monthlyCostUsed.toString());
    const monthlyCostLimit = parseFloat(quota.monthlyCostLimit.toString());

    if (monthlyCostUsed >= monthlyCostLimit) {
      return {
        success: false,
        error: {
          code: "COST_QUOTA_EXCEEDED",
          message: `Monthly cost quota exceeded ($${monthlyCostUsed.toFixed(2)}/$${monthlyCostLimit}). Resets on ${quota.periodEnd.toLocaleDateString()}.`,
          statusCode: 429,
        },
      };
    }

    return {
      success: true,
      userId,
    };
  } catch (error) {
    logger.error("Quota check failed", { error, userId });
    // Allow request to proceed on quota check error (fail open)
    return {
      success: true,
      userId,
    };
  }
}

// ============================================================================
// Main Middleware Function
// ============================================================================

export async function withAIMiddleware(
  request: NextRequest,
  config: AIMiddlewareConfig,
): Promise<NextResponse | AIMiddlewareResult> {
  const startTime = Date.now();

  try {
    // 1. Authentication
    if (config.requireAuth !== false) {
      const authResult = await checkAuth(request);
      if (!authResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: authResult.error,
          },
          { status: authResult.error!.statusCode },
        );
      }

      // 2. Rate Limiting
      if (config.rateLimitConfig) {
        const identifier = getRateLimitIdentifier(request, authResult.userId);
        const rateLimitResult = checkRateLimitSync(
          identifier,
          config.rateLimitConfig,
        );

        if (!rateLimitResult.allowed) {
          const headers = createRateLimitHeaders(rateLimitResult);

          logger.warn("Rate limit exceeded", {
            userId: authResult.userId,
            endpoint: config.endpoint,
            limit: rateLimitResult.limit,
            reset: rateLimitResult.reset,
          });

          return NextResponse.json(
            {
              success: false,
              error: {
                code: "RATE_LIMIT_EXCEEDED",
                message: `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter} seconds.`,
                retryAfter: rateLimitResult.retryAfter,
              },
            },
            {
              status: 429,
              headers,
            },
          );
        }
      }

      // 3. Quota Check
      if (config.checkQuota !== false) {
        const quotaResult = await checkQuota(
          authResult.userId!,
          config.endpoint,
        );
        if (!quotaResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: quotaResult.error,
            },
            { status: quotaResult.error!.statusCode },
          );
        }
      }

      // Return success with user data
      return authResult as AIMiddlewareResult;
    }

    // No auth required
    return {
      success: true,
    };
  } catch (error) {
    logger.error("AI middleware error", {
      error,
      endpoint: config.endpoint,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MIDDLEWARE_ERROR",
          message: "An error occurred. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// Usage Logging
// ============================================================================

export async function logAIUsage(data: AIUsageData): Promise<void> {
  try {
    // Log usage
    await database.aIUsageLog.create({
      data: {
        userId: data.userId,
        endpoint: data.endpoint,
        model: data.model,
        tokensUsed: data.tokensUsed,
        costUSD: data.costUSD,
        requestId: data.requestId,
        requestData: data.requestData,
        responseData: data.responseData,
        confidence: data.confidence,
        processingTimeMs: data.processingTimeMs,
        success: data.success,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
      },
    });

    // Update quota (convert number to Decimal for Prisma)
    if (data.success) {
      await database.aIUsageQuota.update({
        where: { userId: data.userId },
        data: {
          monthlyTokenUsed: { increment: data.tokensUsed },
          monthlyCostUsed: { increment: data.costUSD },
        },
      });
    }

    logger.info("AI usage logged", {
      userId: data.userId,
      endpoint: data.endpoint,
      tokensUsed: data.tokensUsed,
      costUSD: data.costUSD.toFixed(6),
      success: data.success,
    });
  } catch (error) {
    logger.error("Failed to log AI usage", {
      error,
      userId: data.userId,
      endpoint: data.endpoint,
    });
    // Don't throw - usage logging should not block requests
  }
}

// ============================================================================
// Helper: Extract User from Middleware Result
// ============================================================================

export function extractUser(result: AIMiddlewareResult): {
  userId: string;
  email: string;
  role: string;
} {
  if (!result.success || !result.userId) {
    throw new Error("Unauthorized");
  }

  return {
    userId: result.userId,
    email: result.email!,
    role: result.role!,
  };
}
