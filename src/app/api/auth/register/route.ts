/**
 * 🔐 USER REGISTRATION API ROUTE
 * Divine user creation with agricultural consciousness
 *
 * Handles new user registration for the Farmers Market Platform.
 * Supports FARMER and CONSUMER roles with proper validation.
 *
 * Version: NextAuth v5.0.0-beta.30 (Auth.js)
 * Updated: January 2025
 */

import { database } from "@/lib/database";
import { apiLogger } from "@/lib/utils/logger";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Registration Request Schema
 * Divine validation with agricultural consciousness
 */
const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and numbers"
    ),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  role: z.enum(["FARMER", "CONSUMER"], {
    errorMap: () => ({ message: "Role must be FARMER or CONSUMER" }),
  }),
  phone: z.string().optional(),
  // Farm-specific fields (required for farmers)
  farmName: z.string().optional(),
  farmAddress: z.string().optional(),
  farmDescription: z.string().optional(),
});

type RegisterRequest = z.infer<typeof RegisterSchema>;

/**
 * POST /api/auth/register
 * Create new user account
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request data
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      apiLogger.warn("Registration validation failed", {
        errors: validation.error.errors,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid registration data",
            details: validation.error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const data: RegisterRequest = validation.data;

    // Check if user already exists
    const existingUser = await database.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      apiLogger.warn("Registration attempt with existing email", {
        email: data.email,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "An account with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Validate farmer-specific requirements
    if (data.role === "FARMER") {
      if (!data.farmName || !data.farmAddress) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Farm name and address are required for farmers",
            },
          },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12);

    // Create user with transaction
    const result = await database.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          phone: data.phone,
          status: "ACTIVE",
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      // Create farm if user is a farmer
      let farm = null;
      if (data.role === "FARMER" && data.farmName && data.farmAddress) {
        // Generate unique slug
        const baseSlug = data.farmName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        let slug = baseSlug;
        let counter = 1;
        while (await tx.farm.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        farm = await tx.farm.create({
          data: {
            name: data.farmName,
            slug,
            description: data.farmDescription || "",
            address: data.farmAddress,
            ownerId: user.id,
            status: "PENDING",
            email: data.email,
            phone: data.phone || "",
            city: "",
            state: "",
            zipCode: "",
            latitude: 0,
            longitude: 0,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        });
      }

      return { user, farm };
    });

    apiLogger.info("User registered successfully", {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      hasFarm: !!result.farm,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          user: result.user,
          farm: result.farm,
          message:
            result.user.role === "FARMER"
              ? "Account created! Your farm is pending verification."
              : "Account created successfully! You can now sign in.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    apiLogger.error(
      "Registration error",
      error instanceof Error ? error : new Error(String(error))
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REGISTRATION_FAILED",
          message: "Failed to create account. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Route Configuration
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
