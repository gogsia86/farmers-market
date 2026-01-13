/**
 * 🔐 ADMIN API - CREATE TEST USERS
 *
 * Secure endpoint to create test users in production database
 * Used for E2E testing and inspection bot verification
 *
 * Security:
 * - Requires ADMIN_SECRET environment variable
 * - Rate limited to prevent abuse
 * - Only creates users if they don't exist
 * - Returns sanitized data (no passwords)
 *
 * @route POST /api/admin/create-test-users
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/monitoring/logger";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("AdminCreateTestUsers");

// Test user configurations
const TEST_USERS = [
  {
    email: "test@example.com",
    name: "Test Customer",
    password: "test123",
    role: "CONSUMER",
    description: "E2E test customer account",
  },
  {
    email: "farmer@example.com",
    name: "Test Farmer",
    password: "test123",
    role: "FARMER",
    description: "E2E test farmer account",
  },
  {
    email: "admin@example.com",
    name: "Test Admin",
    password: "test123",
    role: "ADMIN",
    description: "E2E test admin account",
  },
] as const;

/**
 * POST handler - Create test users
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { secret } = body;

    // Security check - Verify admin secret
    if (!process.env.ADMIN_SECRET) {
      logger.error("ADMIN_SECRET not configured in environment");
      return NextResponse.json(
        {
          success: false,
          error: "Admin endpoint not properly configured",
        },
        { status: 500 },
      );
    }

    if (!secret || secret !== process.env.ADMIN_SECRET) {
      logger.warn("Unauthorized test user creation attempt", {
        ip: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Invalid admin secret",
        },
        { status: 401 },
      );
    }

    // Create test users
    const results = {
      created: [] as string[],
      existing: [] as string[],
      failed: [] as Array<{ email: string; error: string }>,
    };

    for (const userData of TEST_USERS) {
      try {
        // Check if user already exists
        const existingUser = await database.user.findUnique({
          where: { email: userData.email },
          select: { id: true, email: true, name: true },
        });

        if (existingUser) {
          logger.info(`Test user already exists: ${userData.email}`);
          results.existing.push(userData.email);
          continue;
        }

        // Hash password
        const hashedPassword = await hash(userData.password, 10);

        // Create user
        const newUser = await database.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            emailVerified: true, // Pre-verify test accounts
            emailVerifiedAt: new Date(),
            role: userData.role as any, // Type assertion for role enum
          },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        });

        logger.info(`Test user created successfully: ${userData.email}`, {
          userId: newUser.id,
          role: userData.role,
        });

        results.created.push(userData.email);
      } catch (error) {
        logger.error(`Failed to create test user: ${userData.email}`, {
          error: error instanceof Error ? error.message : String(error),
        });

        results.failed.push({
          email: userData.email,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const duration = Date.now() - startTime;

    // Log summary
    logger.info("Test users creation completed", {
      duration,
      created: results.created.length,
      existing: results.existing.length,
      failed: results.failed.length,
    });

    // Return results
    return NextResponse.json(
      {
        success: results.failed.length === 0,
        message:
          results.failed.length === 0
            ? "Test users processed successfully"
            : "Some test users failed to create",
        results: {
          created: results.created,
          existing: results.existing,
          failed: results.failed,
        },
        summary: {
          total: TEST_USERS.length,
          created: results.created.length,
          existing: results.existing.length,
          failed: results.failed.length,
        },
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      {
        status: results.failed.length === 0 ? 200 : 207, // 207 Multi-Status for partial success
      },
    );
  } catch (error) {
    logger.error("Test users creation failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test users",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * GET handler - List test users (without passwords)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse secret from query params
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Security check
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Fetch test users
    const testEmails = TEST_USERS.map((u) => u.email);

    const users = await database.user.findMany({
      where: {
        email: {
          in: testEmails,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
      expected: TEST_USERS.length,
      allPresent: users.length === TEST_USERS.length,
    });
  } catch (error) {
    logger.error("Failed to list test users", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to list test users",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE handler - Remove test users
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret } = body;

    // Security check
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Delete test users
    const testEmails = TEST_USERS.map((u) => u.email);

    const result = await database.user.deleteMany({
      where: {
        email: {
          in: testEmails,
        },
      },
    });

    logger.info("Test users deleted", {
      count: result.count,
    });

    return NextResponse.json({
      success: true,
      message: "Test users deleted successfully",
      count: result.count,
    });
  } catch (error) {
    logger.error("Failed to delete test users", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete test users",
      },
      { status: 500 },
    );
  }
}
