import { auth } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";

/**
 * 🔐 FARMER AUTH MIDDLEWARE
 * Validates farmer authentication for protected routes
 */

export async function GET(_request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session || !session.user) {
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
      return NextResponse.json(
        {
          authenticated: true,
          authorized: false,
          error: "Not authorized - Farmer role required",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      authenticated: true,
      authorized: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
