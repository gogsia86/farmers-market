/**
 * 🌾 Email Preferences API Route - Divine Agricultural Communication Control
 *
 * Provides RESTful API endpoints for managing user email preferences.
 * Handles preference retrieval, updates, and validation with quantum precision.
 *
 * @module api/preferences/email
 * @category API Routes
 * @agricultural-consciousness DIVINE
 * @sprint Sprint 4 - Email Enhancements
 */

import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import type { UpdatePreferencesRequest } from "@/lib/services/email-preferences.service";
import { emailPreferencesService } from "@/lib/services/email-preferences.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("email-preferences-api");

/**
 * Preference update validation schema
 */
const UpdatePreferencesSchema = z.object({
  // Marketing Preferences
  farmUpdates: z.boolean().optional(),
  newProducts: z.boolean().optional(),
  promotions: z.boolean().optional(),
  seasonalNews: z.boolean().optional(),

  // Transactional Preferences (will be enforced as true)
  orderConfirmation: z.boolean().optional(),
  orderStatusUpdates: z.boolean().optional(),
  shippingNotifications: z.boolean().optional(),
  deliveryReminders: z.boolean().optional(),

  // System Preferences
  securityAlerts: z.boolean().optional(),
  accountUpdates: z.boolean().optional(),
  priceAlerts: z.boolean().optional(),
  inventoryAlerts: z.boolean().optional(),

  // Communication Preferences
  newsletter: z.boolean().optional(),
  surveyRequests: z.boolean().optional(),
  productRecommendations: z.boolean().optional(),
});

/**
 * GET /api/preferences/email
 *
 * Retrieves the authenticated user's email preferences.
 * Creates default preferences if none exist.
 *
 * @returns {EmailPreferences} User's email preferences
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/preferences/email');
 * const data = await response.json();
 * console.log(data.preferences);
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to view email preferences",
          },
        },
        { status: 401 }
      );
    }

    // Get user preferences
    const preferences = await emailPreferencesService.getPreferences(
      session.user.id
    );

    // Get email type categories for UI
    const categories = emailPreferencesService.getEmailTypesByCategory();

    return NextResponse.json(
      {
        success: true,
        data: {
          preferences,
          categories,
          meta: {
            userId: session.user.id,
            hasUnsubscribed: preferences.unsubscribedAll,
            canModify: true,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error fetching email preferences", error, {
      operation: "getEmailPreferences",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PREFERENCES_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch email preferences",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/preferences/email
 *
 * Updates the authenticated user's email preferences.
 * Enforces required preferences (transactional emails cannot be disabled).
 *
 * @param {UpdatePreferencesRequest} request.body - Preference updates
 * @returns {EmailPreferences} Updated preferences
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/preferences/email', {
 *   method: 'PATCH',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     farmUpdates: true,
 *     promotions: false,
 *     newsletter: true
 *   })
 * });
 * ```
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to update email preferences",
          },
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validation = UpdatePreferencesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid preference data",
            details: validation.error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const updates = validation.data as UpdatePreferencesRequest;

    // Validate preference update logic
    const preferenceValidation =
      emailPreferencesService.validatePreferenceUpdate(updates);

    // Update preferences
    const preferences = await emailPreferencesService.updatePreferences(
      session.user.id,
      updates
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          preferences,
          validation: {
            warnings: preferenceValidation.warnings,
          },
          meta: {
            userId: session.user.id,
            updatedAt: preferences.updatedAt,
            message:
              preferenceValidation.warnings.length > 0
                ? "Some preferences cannot be disabled for account security"
                : "Preferences updated successfully",
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error updating email preferences", error, {
      operation: "updateEmailPreferences",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PREFERENCES_UPDATE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update email preferences",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/preferences/email/resubscribe
 *
 * Resubscribes user to all marketing emails after unsubscribing.
 * Re-enables all marketing preferences that were disabled.
 *
 * @returns {EmailPreferences} Updated preferences with marketing re-enabled
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/preferences/email/resubscribe', {
 *   method: 'POST'
 * });
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to resubscribe",
          },
        },
        { status: 401 }
      );
    }

    // Resubscribe user
    const preferences = await emailPreferencesService.resubscribe(
      session.user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          preferences,
          meta: {
            userId: session.user.id,
            message:
              "Successfully resubscribed to marketing emails. Welcome back!",
            resubscribedAt: new Date().toISOString(),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error resubscribing user", error, {
      operation: "resubscribeUser",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RESUBSCRIBE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to resubscribe to emails",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
