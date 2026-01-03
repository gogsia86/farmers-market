/**
 * Execute Search Alert API Route
 *
 * Endpoint:
 * - POST /api/search-alerts/[id]/execute - Execute/test an alert
 *
 * @since Run 4 - Phase 2
 */

import { auth as getServerSession } from "@/lib/auth/config";
import { createLogger } from "@/lib/logger";
import { SearchAlertService } from "@/lib/services/saved-searches/search-alert.service";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("search-alert-execute-api");

// ============================================
// POST - Execute Alert
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

    const alertId = params.id;

    // Verify user owns the alert
    const alert = await SearchAlertService.getById(alertId, session.user.id);

    if (!alert) {
      return NextResponse.json(
        { error: "Alert not found or access denied" },
        { status: 404 },
      );
    }

    // Execute alert
    const result = await SearchAlertService.executeAlert(alertId);

    return NextResponse.json(
      {
        message: result.triggered
          ? "Alert triggered successfully"
          : "Alert evaluated - no trigger",
        result,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to execute search alert", error, {
      operation: "executeSearchAlert",
    });

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to execute alert" },
      { status: 500 },
    );
  }
}
