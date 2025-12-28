/**
 * Execute Saved Search API Route
 *
 * Endpoint:
 * - POST /api/saved-searches/[id]/execute - Execute a saved search
 *
 * @since Run 4
 */

import { NextRequest, NextResponse } from "next/server";
import { auth as getServerSession } from "@/lib/auth/config";
import { SavedSearchService } from "@/lib/services/saved-searches/saved-search.service";
import { z } from "zod";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const executeQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

// ============================================
// POST - Execute Saved Search
// ============================================

export async function POST(
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

    // Parse query parameters or body
    let queryParams = { limit: 20, offset: 0 };

    try {
      const body = await req.json();
      queryParams = executeQuerySchema.parse(body);
    } catch {
      // If no body, use defaults
      const { searchParams } = new URL(req.url);
      const limit = searchParams.get("limit");
      const offset = searchParams.get("offset");

      queryParams = executeQuerySchema.parse({
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0,
      });
    }

    // Execute saved search
    const result = await SavedSearchService.execute({
      searchId,
      userId: session.user.id,
      limit: queryParams.limit,
      offset: queryParams.offset,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[SavedSearch Execute] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.issues },
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
      { error: "Failed to execute saved search" },
      { status: 500 },
    );
  }
}
