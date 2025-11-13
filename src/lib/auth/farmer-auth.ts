import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * 🔐 FARMER AUTHENTICATION MIDDLEWARE
 * Protects farmer-only routes and validates permissions
 */

export interface FarmerAuthResult {
  authenticated: boolean;
  authorized: boolean;
  userId?: string;
  farmId?: string;
  role?: string;
  error?: string;
}

/**
 * Check if user is authenticated and has farmer permissions
 */
export async function checkFarmerAuth(): Promise<FarmerAuthResult> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return {
        authenticated: false,
        authorized: false,
        error: "Not authenticated. Please log in.",
      };
    }

    // Check if user has farmer role or admin privileges
    const authorizedRoles = ["FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"];
    const isAuthorized = authorizedRoles.includes(session.user.role || "");

    if (!isAuthorized) {
      return {
        authenticated: true,
        authorized: false,
        userId: session.user.id,
        role: session.user.role,
        error: "Access denied. Farmer role required.",
      };
    }

    return {
      authenticated: true,
      authorized: true,
      userId: session.user.id,
      role: session.user.role,
    };
  } catch (error) {
    console.error("Farmer auth check error:", error);
    return {
      authenticated: false,
      authorized: false,
      error: "Authentication check failed",
    };
  }
}

/**
 * Middleware wrapper for API routes - returns error response if unauthorized
 */
export async function requireFarmerAuth(
  _request: NextRequest
): Promise<FarmerAuthResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        authenticated: false,
        authorized: false,
        error: "Not authenticated",
      };
    }

    // Check if user has FARMER role or admin privileges
    const authorizedRoles = ["FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"];
    const isAuthorized = authorizedRoles.includes(session.user.role || "");

    if (!isAuthorized) {
      return {
        authenticated: true,
        authorized: false,
        userId: session.user.id,
        role: session.user.role,
        error: "Not authorized - farmer access required",
      };
    }

    return {
      authenticated: true,
      authorized: true,
      userId: session.user.id,
      role: session.user.role,
    };
  } catch (error) {
    console.error("Farmer auth error:", error);
    return {
      authenticated: false,
      authorized: false,
      error: "Authentication failed",
    };
  }
}

/**
 * Get user's farm ID from database
 */
export async function getUserFarmId(userId: string): Promise<string | null> {
  try {
    const { database } = await import("@/lib/database");

    const farm = await database.farm.findFirst({
      where: { ownerId: userId },
      select: { id: true },
    });

    return farm?.id || null;
  } catch (error) {
    console.error("Get user farm error:", error);
    return null;
  }
}

/**
 * Check if user owns specific farm
 */
export async function checkFarmOwnership(
  userId: string,
  farmId: string
): Promise<boolean> {
  try {
    const { database } = await import("@/lib/database");

    const farm = await database.farm.findFirst({
      where: {
        id: farmId,
        ownerId: userId,
      },
    });

    return !!farm;
  } catch (error) {
    console.error("Check farm ownership error:", error);
    return false;
  }
}

/**
 * Require farm ownership for API routes
 */
export async function requireFarmOwnership(
  farmId: string
): Promise<NextResponse | true> {
  const authResult = await checkFarmerAuth();

  if (!authResult.authenticated || !authResult.authorized) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const ownsF = await checkFarmOwnership(authResult.userId!, farmId);

  if (!ownsF) {
    return NextResponse.json(
      { error: "You do not own this farm" },
      { status: 403 }
    );
  }

  return true;
}
