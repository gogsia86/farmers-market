/**
 * 📈 PERFORMANCE METRICS API
 * GET /api/admin/metrics/performance
 *
 * Admin-only endpoint for viewing performance statistics
 */

import { auth } from "@/lib/auth/config";
import { exportMetrics } from "@/lib/monitoring/performance";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const userRole = session.user.role;
    const isAdmin = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole);

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Export performance metrics
    const metrics = exportMetrics();

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Performance metrics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
