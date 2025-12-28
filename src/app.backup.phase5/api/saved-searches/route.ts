/**
 * Saved Searches API Route
 *
 * Endpoints:
 * - GET /api/saved-searches - List all saved searches for user
 * - POST /api/saved-searches - Create a new saved search
 *
 * @since Run 4
 */

import { NextRequest, NextResponse } from "next/server";
import { auth as getServerSession } from "@/lib/auth/config";
import { SavedSearchService } from "@/lib/services/saved-searches/saved-search.service";
import { z } from "zod";
import { NotificationFrequency, Season } from "@prisma/client";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createSavedSearchSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  query: z.string().max(500).optional(),
  filters: z.record(z.string(), z.any()).optional(),
  sortBy: z.string().max(50).optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      radius: z.number().positive(),
    })
    .optional(),
  isPublic: z.boolean().optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notificationsEnabled: z.boolean().optional(),
  notificationFrequency: z.nativeEnum(NotificationFrequency).optional(),
  seasonalPreference: z.nativeEnum(Season).optional(),
  preferredFarms: z.array(z.string()).optional(),
  biodynamicOnly: z.boolean().optional(),
});

const listQuerySchema = z.object({
  folderId: z.string().optional(),
  tags: z.string().optional(), // Comma-separated
  seasonalPreference: z.nativeEnum(Season).optional(),
  isPublic: z
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
// GET - List Saved Searches
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

    // Parse tags if provided
    const tags = validatedParams.tags
      ? validatedParams.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    // Fetch saved searches
    const result = await SavedSearchService.list({
      userId: session.user.id,
      folderId: validatedParams.folderId,
      tags,
      seasonalPreference: validatedParams.seasonalPreference,
      isPublic: validatedParams.isPublic,
      limit: validatedParams.limit,
      offset: validatedParams.offset,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[SavedSearches GET] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch saved searches" },
      { status: 500 },
    );
  }
}

// ============================================
// POST - Create Saved Search
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
    const validatedData = createSavedSearchSchema.parse(body);

    // Create saved search
    const savedSearch = await SavedSearchService.create({
      userId: session.user.id,
      ...validatedData,
    });

    return NextResponse.json(
      {
        message: "Saved search created successfully",
        savedSearch,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[SavedSearches POST] Error:", error);

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
      { error: "Failed to create saved search" },
      { status: 500 },
    );
  }
}
