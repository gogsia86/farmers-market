/**
 * 🏪 FARMS API ROUTE
 * RESTful API for farm management with agricultural consciousness
 *
 * Endpoints:
 * - GET /api/farms - List all farms with filtering
 * - POST /api/farms - Create new farm (authenticated)
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { Farm, FarmStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

const CreateFarmSchema = z.object({
  name: z.string().min(3).max(255),
  slug: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  story: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  website: z.string().url().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string().default("US"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  businessName: z.string().optional(),
  taxId: z.string().optional(),
  businessType: z.string().optional(),
  yearEstablished: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  farmSize: z.number().positive().optional(),
  certificationsArray: z.array(z.string()).optional(),
  deliveryRadius: z.number().int().positive().default(25),
});

const FarmQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  search: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"]).optional(),
  organic: z.string().optional(),
});

interface FarmListResponse {
  success: boolean;
  data: {
    farms: Farm[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface FarmCreateResponse {
  success: boolean;
  data?: Farm;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// GET /api/farms - LIST FARMS
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<FarmListResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryValidation = FarmQuerySchema.safeParse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("search") || undefined,
      city: searchParams.get("city") || undefined,
      state: searchParams.get("state") || undefined,
      status: searchParams.get("status") || undefined,
      organic: searchParams.get("organic") || undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          success: false,
          data: {
            farms: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          },
        },
        { status: 400 }
      );
    }

    const { page, limit, search, city, state, status, organic } = queryValidation.data;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    // Default to only active farms for public listing
    if (!status) {
      where.status = "ACTIVE" as FarmStatus;
    } else {
      where.status = status as FarmStatus;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    // Location filters
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = state;
    }

    // Organic filter - check certificationsArray
    if (organic === "true") {
      where.certificationsArray = {
        hasSome: ["USDA_ORGANIC", "ORGANIC", "Organic Certified"],
      };
    }

    // Execute queries in parallel
    const [farms, total] = await Promise.all([
      database.farm.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          story: true,
          status: true,
          email: true,
          phone: true,
          website: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          latitude: true,
          longitude: true,
          images: true,
          logoUrl: true,
          bannerUrl: true,
          certificationsArray: true,
          farmingPractices: true,
          deliveryRadius: true,
          averageRating: true,
          reviewCount: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              products: true,
              reviews: true,
              orders: true,
            },
          },
        },
      }),
      database.farm.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return NextResponse.json({
      success: true,
      data: {
        farms: farms as unknown as Farm[],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/farms error:", error);
    return NextResponse.json(
      {
        success: false,
        data: {
          farms: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/farms - CREATE FARM
// ============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<FarmCreateResponse>> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // Check if user is a farmer
    const user = session.user as any;
    if (user.role !== "FARMER" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only farmers can create farms",
          },
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateFarmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid farm data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const farmData = validation.data;

    // Generate slug if not provided
    const slug =
      farmData.slug ||
      farmData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Check if slug is unique
    const existingFarm = await database.farm.findFirst({
      where: { slug },
    });

    if (existingFarm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_SLUG",
            message: "A farm with this name already exists",
          },
        },
        { status: 409 }
      );
    }

    // Create farm
    const farm = await database.farm.create({
      data: {
        name: farmData.name,
        slug,
        description: farmData.description,
        story: farmData.story,
        email: farmData.email,
        phone: farmData.phone,
        website: farmData.website,
        address: farmData.address,
        city: farmData.city,
        state: farmData.state,
        zipCode: farmData.zipCode,
        country: farmData.country,
        latitude: farmData.latitude,
        longitude: farmData.longitude,
        businessName: farmData.businessName,
        taxId: farmData.taxId,
        businessType: farmData.businessType,
        yearEstablished: farmData.yearEstablished,
        farmSize: farmData.farmSize,
        certificationsArray: farmData.certificationsArray || [],
        deliveryRadius: farmData.deliveryRadius,
        status: "PENDING" as FarmStatus,
        ownerId: user.id,
        images: [],
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: farm,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/farms error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create farm",
        },
      },
      { status: 500 }
    );
  }
}
