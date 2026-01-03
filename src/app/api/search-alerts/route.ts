/**
 * Search Alerts API Route
 *
 * Endpoints:
 * - GET /api/search-alerts - List all alerts for user
 * - POST /api/search-alerts - Create a new alert
 *
 * @since Run 4 - Phase 2
 */

import { auth as getServerSession } from "@/lib/auth/config";
import { createLogger } from "@/lib/logger";
import { SearchAlertService } from "@/lib/services/saved-searches/search-alert.service";
import { SearchAlertType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("search-alerts-api");

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createAlertSchema = z.object({
  savedSearchId: z.string().min(1),
  type: z.nativeEnum(SearchAlertType),
  conditions: z.object({
    minProducts: z.number().min(1).optional(),
    priceChangePercent: z.number().min(0).max(100).optional(),
    specificFarms: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
  }),
  channels: z.object({
    email: z.boolean().optional().default(true),
    push: z.boolean().optional().default(false),
    sms: z.boolean().optional().default(false),
  }),
  isActive: z.boolean().optional().default(true),
});

const listQuerySchema = z.object({
  savedSearchId: z.string().optional(),
  type: z.nativeEnum(SearchAlertType).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 50)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
});

// ============================================
// GET - List Search Alerts
// ============================================

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedParams = listQuerySchema.parse(queryParams);

    // Fetch alerts
    const result = await SearchAlertService.list({
      userId: session.user.id,
      savedSearchId: validatedParams.savedSearchId,
      type: validatedParams.type,
      isActive: validatedParams.isActive,
      limit: validatedParams.limit,
      offset: validatedParams.offset,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.error("Failed to fetch search alerts", error, {
      operation: "listSearchAlerts",
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 },
    );
  }
}

// ============================================
// POST - Create Search Alert
// ============================================

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createAlertSchema.parse(body);

    // Create alert
    const alert = await SearchAlertService.create({
      userId: session.user.id,
      ...validatedData,
    });

    return NextResponse.json(
      {
        message: "Alert created successfully",
        alert,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to create search alert", error, {
      operation: "createSearchAlert",
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 },
    );
  }
}
