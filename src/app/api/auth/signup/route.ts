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
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, userType } = validation.data;

    // Check if user already exists
    const existingUser = await database.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await database.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userType === "FARMER" ? "FARMER" : "CONSUMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
