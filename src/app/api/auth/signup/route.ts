/**
 * SIGNUP API ROUTE - USER REGISTRATION
 *
 * Creates new user accounts with secure password hashing.
 * Validates input and prevents duplicate accounts.
 *
 * Divine Patterns Applied:
 * - Security Divinity (password hashing with bcrypt)
 * - Input Validation (Zod schema)
 * - Database Quantum Mastery (Prisma)
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize logger for signup API
const logger = createLogger("api-auth-signup");

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  userType: z.enum(["CONSUMER", "FARMER"]),
});

// ============================================================================
// POST /api/auth/signup - CREATE NEW USER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    logger.info("Signup request received", {
      email: body.email,
      userType: body.userType,
    });

    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Signup validation failed", {
        email: body.email,
        errors: validation.error.issues,
      });
      return NextResponse.json(
        { error: "Invalid input data", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { name, email, password, userType } = validation.data;

    // Check if user already exists
    logger.debug("Checking if user exists", { email });
    const existingUser = await database.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn("User already exists", { email });
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    logger.debug("Hashing password", { email });
    const hashedPassword = await hash(password, 12);

    // Split name into firstName and lastName
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || name;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Create user
    logger.info("Creating user in database", { email, userType });
    const user = await database.user.create({
      data: {
        name: name,
        firstName: firstName,
        lastName: lastName || null,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: userType === "FARMER" ? "FARMER" : "CONSUMER",
        emailVerified: false,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info("User created successfully", {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Signup failed", error as Error, {
      operation: "POST /api/auth/signup",
    });

    return NextResponse.json(
      {
        error: "Failed to create account. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
