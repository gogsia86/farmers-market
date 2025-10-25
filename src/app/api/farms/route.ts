/**
 * FARM CREATION API - DIVINE AGRICULTURAL ENDPOINT
 *
 * Manifests farm entities into quantum reality through RESTful consciousness.
 * Follows divine patterns for authentication, validation, and error handling.
 *
 * Divine Patterns Applied:
 * - Service Layer Separation (reduced cognitive complexity)
 * - API Route Divine Patterns (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - Agricultural Quantum Types (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - Testing Security Divinity (05_TESTING_SECURITY_DIVINITY)
 *
 * Functional Requirements: FR-011 (Farm Profile Creation)
 *
 * @route POST /api/farms
 * @access Private (FARMER role only)
 */

import { auth } from "@/lib/auth";
import {
  checkExistingFarm,
  createFarmService,
} from "@/lib/services/farm.service";
import {
  FarmCreationError,
  FarmErrorCode,
  type CreateFarmRequest,
  type UserId,
} from "@/types/farm.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMA - DIVINE INPUT VALIDATION
// ============================================================================

const CreateFarmSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(3, "Farm name must be at least 3 characters")
    .max(255, "Farm name must be less than 255 characters")
    .trim(),

  // Location (required)
  address: z.string().min(5, "Address is required").max(255),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(50),
  zipCode: z.string().min(5, "Zip code is required").max(20),
  latitude: z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  longitude: z
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),

  // Contact (required)
  email: z.string().email("Invalid email address").max(255),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number")
    .min(10, "Phone number must be at least 10 digits")
    .max(20),

  // Optional fields
  description: z.string().max(1000).optional(),
  story: z.string().max(5000).optional(),
  website: z
    .string()
    .url("Invalid website URL")
    .max(500)
    .optional()
    .or(z.literal("")),
  businessName: z.string().max(255).optional(),
  yearEstablished: z
    .number()
    .int()
    .min(1800, "Year must be after 1800")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .optional(),
  farmSize: z
    .number()
    .positive("Farm size must be positive")
    .max(100000, "Farm size seems unrealistic")
    .optional(),

  // Practices (optional)
  farmingPractices: z.array(z.string()).max(20).optional(),
  productCategories: z.array(z.string()).max(15).optional(),

  // Delivery options
  deliveryRadius: z
    .number()
    .int()
    .min(0, "Delivery radius cannot be negative")
    .max(500, "Delivery radius must be less than 500 miles")
    .optional(),
});

// ============================================================================
// HELPER FUNCTIONS - COMPLEXITY REDUCTION
// ============================================================================

async function authenticateUser() {
  const session = await auth();

  if (!session?.user) {
    throw new FarmCreationError(
      "Authentication required",
      FarmErrorCode.UNAUTHORIZED,
      [
        "Log in to your farmer account",
        "If you don't have an account, register as a farmer",
        "Navigate to /auth/signin",
      ]
    );
  }

  if (session.user.role !== "FARMER") {
    throw new FarmCreationError(
      "Only farmers can create farm profiles",
      FarmErrorCode.UNAUTHORIZED,
      [
        "Your account is registered as a consumer",
        "To sell products, you need a farmer account",
        "Contact support to upgrade your account",
      ]
    );
  }

  return session;
}

async function validateNoExistingFarm(userId: UserId) {
  const check = await checkExistingFarm(userId);

  if (check.exists && check.farm) {
    throw new FarmCreationError(
      "Farm already exists for this user",
      FarmErrorCode.FARM_ALREADY_EXISTS,
      [
        `You already have a farm: "${check.farm.name}"`,
        "Edit your existing farm instead of creating a new one",
        `Navigate to /dashboard/farm/${check.farm.slug}/edit`,
      ]
    );
  }
}

async function parseAndValidateRequest(
  request: NextRequest
): Promise<CreateFarmRequest> {
  const body = await request.json();
  const validation = CreateFarmSchema.safeParse(body);

  if (!validation.success) {
    throw new FarmCreationError(
      "Validation failed",
      FarmErrorCode.VALIDATION_FAILED,
      [
        "Check all required fields are filled",
        "Ensure coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)",
        "Verify email and phone number formats",
      ]
    );
  }

  return validation.data;
}

function handleFarmCreationError(error: unknown) {
  console.error("Farm creation error:", error);

  // Handle known farm creation errors
  if (error instanceof FarmCreationError) {
    const statusCode = error.code === FarmErrorCode.UNAUTHORIZED ? 401 : 400;
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        resolutionPath: error.resolutionPath,
      },
      { status: statusCode }
    );
  }

  // Handle Prisma errors
  if (
    error instanceof Error &&
    error.name === "PrismaClientKnownRequestError"
  ) {
    return NextResponse.json(
      {
        error: "Database error occurred",
        code: "DATABASE_ERROR",
        message: error.message,
        resolutionPath: [
          "This is likely a temporary database issue",
          "Please try again in a moment",
          "If the problem persists, contact support",
        ],
      },
      { status: 500 }
    );
  }

  // Unknown error - return enlightening generic error
  return NextResponse.json(
    {
      error: "Failed to create farm profile",
      code: "UNKNOWN_ERROR",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      resolutionPath: [
        "Please try again",
        "If the problem persists, contact support with the timestamp",
        "Timestamp: " + new Date().toISOString(),
      ],
    },
    { status: 500 }
  );
}

// ============================================================================
// POST /api/farms - CREATE FARM ENDPOINT
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const session = await authenticateUser();

    // Step 2: Check for existing farm
    await validateNoExistingFarm(session.user.id as UserId);

    // Step 3: Parse and validate request
    const farmData = await parseAndValidateRequest(request);

    // Step 4: Create farm using service layer
    const { farm } = await createFarmService({
      userId: session.user.id as UserId,
      farmData,
    });

    // Step 5: Return success response
    return NextResponse.json(
      {
        success: true,
        farm,
        message: "Farm profile created successfully! 🌾",
        nextSteps: [
          "Connect your Stripe account to accept payments",
          "Add your first product listings",
          "Upload farm photos to showcase your operation",
        ],
      },
      { status: 201 }
    );
  } catch (error) {
    return handleFarmCreationError(error);
  }
}

// ============================================================================
// GET /api/farms - LIST FARMS ENDPOINT (Placeholder)
// ============================================================================

export async function GET() {
  // Placeholder for farm listing endpoint (FR-013)
  // Will implement: pagination, filtering by location/products, search, sorting
  return NextResponse.json(
    {
      message: "Farm listing endpoint - coming soon 🌾",
      feature: "FR-013: Farm Directory/Listing",
    },
    { status: 501 }
  );
}
