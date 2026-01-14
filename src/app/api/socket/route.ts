// 🧠 DIVINE PATTERN: Socket.io Initialization API Route
// 📚 Reference: Real-time Communication Activation
// 🌾 Domain: WebSocket Infrastructure
// ⚡ Performance: Connection management with agricultural consciousness

import { logger } from "@/lib/monitoring/logger";
import { getSocketServer } from "@/lib/realtime/socket-server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/socket - Initialize Socket.io server
 * This endpoint should be called once on application startup
 */
export async function GET(request: NextRequest) {
  try {
    // Check if Socket.io is already initialized
    const existingServer = getSocketServer();

    if (existingServer) {
      logger.info("⚡ Socket.io already initialized");
      return NextResponse.json({
        success: true,
        message: "Socket.io server already running",
        status: "active",
        agriculturalConsciousness: "active"
      });
    }

    // Note: In Next.js App Router with Vercel deployment,
    // Socket.io needs to be initialized differently.
    // This is a placeholder that documents the limitation.

    logger.warn("⚠️ Socket.io initialization requires custom server setup");

    return NextResponse.json({
      success: false,
      message: "Socket.io requires custom server configuration",
      status: "not_initialized",
      documentation: "/docs/REALTIME_SETUP.md",
      recommendation: "Use polling-based updates or deploy with custom server"
    }, { status: 501 });

  } catch (error) {
    logger.error("❌ Socket.io initialization error:", { error });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error"
    }, { status: 500 });
  }
}

/**
 * POST /api/socket/health - Check Socket.io health
 */
export async function POST(request: NextRequest) {
  try {
    const io = getSocketServer();

    if (!io) {
      return NextResponse.json({
        success: false,
        status: "not_initialized",
        connectedClients: 0,
        agriculturalConsciousness: "inactive"
      });
    }

    const stats = {
      success: true,
      status: "active",
      connectedClients: io.engine.clientsCount,
      timestamp: new Date().toISOString(),
      agriculturalConsciousness: "active"
    };

    return NextResponse.json(stats);

  } catch (error) {
    logger.error("❌ Socket.io health check error:", { error });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
