/**
 * Individual Saved Search API Route
 *
 * Endpoints:
 * - GET /api/saved-searches/[id] - Get a specific saved search
 * - PUT /api/saved-searches/[id] - Update a saved search
 * - DELETE /api/saved-searches/[id] - Delete a saved search
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

const updateSavedSearchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
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

// ============================================
// GET - Get Saved Search by ID
// ============================================

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get user session
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchId = params.id;

    // Fetch saved search
    const savedSearch = await SavedSearchService.getById(
      searchId,
      session.user.id,
    );

    return NextResponse.json(savedSearch, { status: 200 });
  } catch (error) {
    console.error("[SavedSearch GET] Error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch saved search" },
      { status: 500 },
    );
  }
}

// ============================================
// PUT - Update Saved Search
// ============================================

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get user session
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchId = params.id;

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateSavedSearchSchema.parse(body);

    // Update saved search
    const savedSearch = await SavedSearchService.update(
      searchId,
      session.user.id,
      validatedData,
    );

    return NextResponse.json(
      {
        message: "Saved search updated successfully",
        savedSearch,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[SavedSearch PUT] Error:", error);

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
      { error: "Failed to update saved search" },
      { status: 500 },
    );
  }
}

// ============================================
// DELETE - Delete Saved Search
// ============================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get user session
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchId = params.id;

    // Delete saved search
    await SavedSearchService.delete(searchId, session.user.id);

    return NextResponse.json(
      { message: "Saved search deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[SavedSearch DELETE] Error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete saved search" },
      { status: 500 },
    );
  }
}
