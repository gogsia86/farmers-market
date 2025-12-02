/**
 * NOTIFICATION PREFERENCES API
 * User notification settings management with divine agricultural consciousness
 *
 * @module api/notifications/preferences
 * @implements {GET} Fetch user notification preferences
 * @implements {PUT} Update user notification preferences
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Validation schema for notification preferences update
 */
const UpdatePreferencesSchema = z.object({
  emailOrders: z.boolean().optional(),
  emailReviews: z.boolean().optional(),
  emailPromotions: z.boolean().optional(),
  emailNewsletter: z.boolean().optional(),
  inAppOrders: z.boolean().optional(),
  inAppReviews: z.boolean().optional(),
  inAppMessages: z.boolean().optional(),
  pushOrders: z.boolean().optional(),
  pushReviews: z.boolean().optional(),
  pushPromotions: z.boolean().optional(),
});

/**
 * GET - Fetch user notification preferences
 * Creates default preferences if they don't exist
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Get or create notification preferences
    let preferences = await database.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await database.notificationPreferences.create({
        data: {
          userId: session.user.id,
          emailOrders: true,
          emailReviews: true,
          emailPromotions: false,
          emailNewsletter: false,
          inAppOrders: true,
          inAppReviews: true,
          inAppMessages: true,
          pushOrders: true,
          pushReviews: true,
          pushPromotions: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notification preferences",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT - Update user notification preferences
 * Validates input and updates database with divine precision
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = UpdatePreferencesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const updateData = validation.data;

    // Update or create preferences
    const preferences = await database.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        emailOrders: updateData.emailOrders ?? true,
        emailReviews: updateData.emailReviews ?? true,
        emailPromotions: updateData.emailPromotions ?? false,
        emailNewsletter: updateData.emailNewsletter ?? false,
        inAppOrders: updateData.inAppOrders ?? true,
        inAppReviews: updateData.inAppReviews ?? true,
        inAppMessages: updateData.inAppMessages ?? true,
        pushOrders: updateData.pushOrders ?? true,
        pushReviews: updateData.pushReviews ?? true,
        pushPromotions: updateData.pushPromotions ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      data: preferences,
      message: "Notification preferences updated successfully",
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update notification preferences",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH - Partially update notification preferences
 * Allows granular updates without full payload
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = UpdatePreferencesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    // Check if preferences exist
    const existingPreferences =
      await database.notificationPreferences.findUnique({
        where: { userId: session.user.id },
      });

    if (!existingPreferences) {
      return NextResponse.json(
        {
          success: false,
          error: "Notification preferences not found. Use PUT to create.",
        },
        { status: 404 },
      );
    }

    // Update only provided fields
    const preferences = await database.notificationPreferences.update({
      where: { userId: session.user.id },
      data: validation.data,
    });

    return NextResponse.json({
      success: true,
      data: preferences,
      message: "Notification preferences updated successfully",
    });
  } catch (error) {
    console.error("Patch notification preferences error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update notification preferences",
      },
      { status: 500 },
    );
  }
}
