/**
 * NOTIFICATION PREFERENCES API
 * User notification settings management
 */

import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET user preferences
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: NotificationPreferences model needs to be added to schema
    // Get or create preferences
    const preferences = {
      userId: session.user.id,
      reviewReceived: { email: true, inApp: true, push: true },
      reviewResponse: { email: true, inApp: true, push: true },
      orderStatus: { email: true, inApp: true, push: true, sms: false },
      productAvailable: { email: false, inApp: true, push: false },
      lowInventory: { email: true, inApp: true },
      newMessage: { email: true, inApp: true, push: true },
      systemAlert: { email: true, inApp: true },
      pauseAll: false,
    };

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

/**
 * PUT - Update preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // TODO: NotificationPreferences model needs to be added to schema
    // Update preferences (mock response for now)
    const preferences = {
      userId: session.user.id,
      reviewReceived: body.reviewReceived || {
        email: true,
        inApp: true,
        push: true,
      },
      reviewResponse: body.reviewResponse || {
        email: true,
        inApp: true,
        push: true,
      },
      orderStatus: body.orderStatus || {
        email: true,
        inApp: true,
        push: true,
        sms: false,
      },
      productAvailable: body.productAvailable || {
        email: false,
        inApp: true,
        push: false,
      },
      lowInventory: body.lowInventory || { email: true, inApp: true },
      newMessage: body.newMessage || {
        email: true,
        inApp: true,
        push: true,
      },
      systemAlert: body.systemAlert || { email: true, inApp: true },
      pauseAll: body.pauseAll || false,
      pauseUntil: body.pauseUntil,
    };

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
