import { database } from "@/lib/database";
import { sendFarmerWelcomeLazy } from "@/lib/email/email-service-lazy";
import { GeocodingService } from "@/lib/services/geocoding.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * 🌾 FARMER REGISTRATION API
 * POST /api/farmers/register
 * Handles new farmer registration with comprehensive validation
 */

const farmerRegistrationSchema = z.object({
  // Farm Details
  farmName: z.string().min(3, "Farm name must be at least 3 characters"),
  farmDescription: z
    .string()
    .min(20, "Description must be at least 20 characters"),
  farmType: z.enum([
    "VEGETABLE",
    "FRUIT",
    "DAIRY",
    "LIVESTOCK",
    "GRAIN",
    "MIXED",
    "SPECIALTY",
    "ORGANIC",
  ]),

  // Location
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}$/),

  // Contact
  ownerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/),
  website: z.string().url().optional().or(z.literal("")),
  socialMedia: z.string().optional(),

  // Certifications
  organic: z.boolean().default(false),
  biodynamic: z.boolean().default(false),
  gapCertified: z.boolean().default(false),

  // Business
  businessLicense: z.string().min(5),
  taxId: z.string().min(5),
  insurance: z.boolean().refine((val) => val === true, {
    message: "Insurance is required",
  }),

  // Options
  pickupAvailable: z.boolean().default(true),
  deliveryAvailable: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = farmerRegistrationSchema.parse(body);

    // Check if email already exists
    const existingFarmer = await database.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingFarmer) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    // Create user account (farmer role)
    const user = await database.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.ownerName,
        role: "FARMER",
        phone: validatedData.phone,
      },
    });

    // Create farm
    const farmSlug = validatedData.farmName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Geocode address to get coordinates
    const geocodeResult = await GeocodingService.geocodeAddress(
      validatedData.address,
      validatedData.city,
      validatedData.state,
      validatedData.zipCode,
    );

    const farm = await database.farm.create({
      data: {
        name: validatedData.farmName,
        slug: farmSlug,
        description: validatedData.farmDescription,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        website: validatedData.website || null,
        taxId: validatedData.taxId,
        status: "PENDING",
        ownerId: user.id,
      },
    });

    // Send confirmation email (lazy-loaded to reduce bundle size)
    try {
      await sendFarmerWelcomeLazy(user.email, {
        farmerName: validatedData.ownerName,
        farmName: farm.name,
        farmId: farm.id,
      });
    } catch (emailError) {
      // Log email error but don't fail registration
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Farm registration submitted successfully",
        data: {
          userId: user.id,
          farmId: farm.id,
          farmName: farm.name,
          status: farm.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Farmer registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 },
      );
    }

    const user = await database.user.findUnique({
      where: { email },
      include: {
        farms: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        farms: user.farms,
      },
    });
  } catch (error) {
    console.error("Get farmer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
