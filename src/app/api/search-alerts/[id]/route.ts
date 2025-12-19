/**
 * Individual Search Alert API Route
 *
 * Endpoints:
 * - GET /api/search-alerts/[id] - Get a specific alert
 * - PUT /api/search-alerts/[id] - Update an alert
 * - DELETE /api/search-alerts/[id] - Delete an alert
 *
 * @since Run 4 - Phase 2
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SearchAlertService } from "@/lib/services/saved-searches/search-alert.service";
import { z } from "zod";
import { SearchAlertType } from "@prisma/client";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updateAlertSchema = z.object({
  type: z.nativeEnum(SearchAlertType).optional(),
  conditions: z
    .object({
      minProducts: z.number().min(1).optional(),
      priceChangePercent: z.number().min(0).max(100).optional(),
      specificFarms: z.array(z.string()).optional(),
      keywords: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
    })
    .optional(),
  channels: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// GET - Get Alert by ID
// ============================================

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alertId = params.id;

    // Fetch alert
    const alert = await SearchAlertService.getById(alertId, session.user.id);

    return NextResponse.json(alert, { status: 200 });
  } catch (error) {
    console.error("[SearchAlert GET] Error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch alert" },
      { status: 500 },
    );
  }
}

// ============================================
// PUT - Update Alert
// ============================================

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alertId = params.id;

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateAlertSchema.parse(body);

    // Update alert
    const alert = await SearchAlertService.update(
      alertId,
      session.user.id,
      validatedData,
    );

    return NextResponse.json(
      {
        message: "Alert updated successfully",
        alert,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[SearchAlert PUT] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 },
    );
  }
}

// ============================================
// DELETE - Delete Alert
// ============================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alertId = params.id;

    // Delete alert
    await SearchAlertService.delete(alertId, session.user.id);

    return NextResponse.json(
      { message: "Alert deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[SearchAlert DELETE] Error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 },
    );
  }
}
