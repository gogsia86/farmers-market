/**
 * 🌾 Unsubscribe API Route - Divine Agricultural Communication Control
 *
 * Provides token-based unsubscribe functionality for email communications.
 * Allows users to unsubscribe from marketing emails via links in emails.
 *
 * @module api/unsubscribe
 * @category API Routes
 * @agricultural-consciousness DIVINE
 * @sprint Sprint 4 - Email Enhancements
 */

import { createLogger } from "@/lib/logger";
import type { UnsubscribeRequest } from "@/lib/services/email-preferences.service";
import { emailPreferencesService } from "@/lib/services/email-preferences.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("unsubscribe-api");

/**
 * Unsubscribe request validation schema
 */
const UnsubscribeSchema = z.object({
  token: z.string().min(1, "Unsubscribe token is required"),
  reason: z.string().optional(),
  feedback: z
    .string()
    .max(1000, "Feedback must be less than 1000 characters")
    .optional(),
});

/**
 * GET /api/unsubscribe?token=xxx
 *
 * Handles unsubscribe via URL (for email links).
 * Unsubscribes user from all marketing emails using the provided token.
 *
 * @param {string} request.query.token - Unsubscribe token from email
 * @returns {Object} Success confirmation or error
 *
 * @example
 * ```
 * GET /api/unsubscribe?token=abc123xyz
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from query parameters
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_TOKEN",
            message: "Unsubscribe token is required",
          },
        },
        { status: 400 },
      );
    }

    // Validate token format
    const validation = UnsubscribeSchema.safeParse({ token });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid unsubscribe token format",
            details: validation.error.errors,
          },
        },
        { status: 400 },
      );
    }

    // Unsubscribe user
    await emailPreferencesService.unsubscribeAll({
      token,
      reason: "Unsubscribed via email link",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          message: "Successfully unsubscribed from all marketing emails",
          meta: {
            unsubscribedAt: new Date().toISOString(),
            note: "You will continue to receive important transactional emails (order confirmations, security alerts, etc.)",
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error processing unsubscribe request", error, {
      operation: "unsubscribeViaLink",
    });

    // Check for invalid token error
    if (
      error instanceof Error &&
      error.message.includes("Invalid or expired")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired unsubscribe token",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNSUBSCRIBE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to process unsubscribe request",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/unsubscribe
 *
 * Handles unsubscribe with optional feedback.
 * Allows users to provide a reason and feedback when unsubscribing.
 *
 * @param {UnsubscribeRequest} request.body - Unsubscribe request with token and optional feedback
 * @returns {Object} Success confirmation or error
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/unsubscribe', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     token: 'abc123xyz',
 *     reason: 'Too many emails',
 *     feedback: 'I prefer to check the website directly'
 *   })
 * });
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
    const validation = UnsubscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid unsubscribe request",
            details: validation.error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        },
        { status: 400 },
      );
    }

    const unsubscribeRequest = validation.data as UnsubscribeRequest;

    // Unsubscribe user with feedback
    await emailPreferencesService.unsubscribeAll(unsubscribeRequest);

    return NextResponse.json(
      {
        success: true,
        data: {
          message: "Successfully unsubscribed from all marketing emails",
          meta: {
            unsubscribedAt: new Date().toISOString(),
            feedbackReceived: !!unsubscribeRequest.feedback,
            note: "You will continue to receive important transactional emails (order confirmations, security alerts, etc.)",
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error processing unsubscribe request", error, {
      operation: "unsubscribeWithFeedback",
    });

    // Check for invalid token error
    if (
      error instanceof Error &&
      error.message.includes("Invalid or expired")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired unsubscribe token",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNSUBSCRIBE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to process unsubscribe request",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
