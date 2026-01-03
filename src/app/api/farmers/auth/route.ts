import { auth } from "@/lib/auth/config";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("farmers-auth-api");

/**
 * 🔐 FARMER AUTH MIDDLEWARE
 * Validates farmer authentication for protected routes
 */

export async function GET(_request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session || !session.user) {
      logger.debug("Auth check failed - no session");
      return NextResponse.json(
        {
          authenticated: false,
          error: "Not authenticated",
        },
        { status: 401 },
      );
    }

    // Check if user has farmer role
    const isFarmer =
      session.user.role === "FARMER" ||
      session.user.role === "ADMIN" ||
      session.user.role === "SUPER_ADMIN";

    if (!isFarmer) {
      logger.warn("Auth check failed - user not authorized as farmer", {
        userId: session.user.id,
        role: session.user.role,
      });
      return NextResponse.json(
        {
          authenticated: true,
          authorized: false,
          error: "Not authorized - Farmer role required",
        },
        { status: 403 },
      );
    }

    logger.debug("Auth check successful", {
      userId: session.user.id,
      role: session.user.role,
    });

    return NextResponse.json({
      authenticated: true,
      authorized: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || session.user.email || "User",
        role: session.user.role,
      },
    });
  } catch (error) {
    logger.error("Auth check error", error as Error, {
      endpoint: "GET /api/farmers/auth",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
