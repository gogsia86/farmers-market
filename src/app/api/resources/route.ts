import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * 📚 RESOURCES API
 * Divine agricultural resource management with quantum consciousness
 *
 * @module api/resources
 * @implements {GET} Fetch educational resources
 * @implements {POST} Track resource downloads
 */

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  downloadable: boolean;
  url?: string;
  fileUrl?: string;
  createdAt?: Date;
}

// Mock resources data - Replace with database queries
const MOCK_RESOURCES: Resource[] = [
  // Growing Guides
  {
    id: "1",
    title: "Organic Vegetable Production",
    description: "Complete guide to organic vegetable farming practices",
    type: "PDF Guide",
    category: "GROWING",
    downloadable: true,
    fileUrl: "/resources/files/organic-vegetable-production.pdf",
  },
  {
    id: "2",
    title: "Seasonal Planting Calendar",
    description: "Know what to plant and when for maximum yields",
    type: "Interactive Tool",
    category: "GROWING",
    downloadable: false,
    url: "/tools/planting-calendar",
  },
  {
    id: "3",
    title: "Soil Health Management",
    description: "Build healthy soil for sustainable farming",
    type: "Video Series",
    category: "GROWING",
    downloadable: false,
    url: "/resources/videos/soil-health",
  },

  // Business & Marketing
  {
    id: "4",
    title: "Farm Business Planning",
    description: "Step-by-step guide to planning your farm business",
    type: "Workbook",
    category: "BUSINESS",
    downloadable: true,
    fileUrl: "/resources/files/farm-business-planning.pdf",
  },
  {
    id: "5",
    title: "Social Media for Farmers",
    description: "Build your online presence and engage customers",
    type: "Guide",
    category: "BUSINESS",
    downloadable: true,
    fileUrl: "/resources/files/social-media-guide.pdf",
  },
  {
    id: "6",
    title: "Pricing Your Products",
    description: "Set profitable prices that customers will pay",
    type: "Calculator",
    category: "BUSINESS",
    downloadable: false,
    url: "/tools/pricing-calculator",
  },

  // Community & Networking
  {
    id: "7",
    title: "Farmer Success Stories",
    description: "Learn from experienced farmers in our network",
    type: "Case Studies",
    category: "COMMUNITY",
    downloadable: false,
    url: "/resources/success-stories",
  },
  {
    id: "8",
    title: "Monthly Farmer Meetups",
    description: "Connect with other farmers and share knowledge",
    type: "Events",
    category: "COMMUNITY",
    downloadable: false,
    url: "/events/farmer-meetups",
  },
  {
    id: "9",
    title: "Farmer Forum",
    description: "Ask questions and get advice from fellow farmers",
    type: "Community",
    category: "COMMUNITY",
    downloadable: false,
    url: "/forum",
  },

  // Legal & Compliance
  {
    id: "10",
    title: "Food Safety Guidelines",
    description: "Ensure your products meet all safety standards",
    type: "Checklist",
    category: "COMPLIANCE",
    downloadable: true,
    fileUrl: "/resources/files/food-safety-checklist.pdf",
  },
  {
    id: "11",
    title: "Organic Certification Guide",
    description: "Steps to getting your farm certified organic",
    type: "PDF Guide",
    category: "COMPLIANCE",
    downloadable: true,
    fileUrl: "/resources/files/organic-certification-guide.pdf",
  },
  {
    id: "12",
    title: "Insurance Requirements",
    description: "Understanding liability and crop insurance",
    type: "Article",
    category: "COMPLIANCE",
    downloadable: false,
    url: "/resources/articles/insurance-requirements",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let resources = MOCK_RESOURCES;

    // Filter by category if provided
    if (category) {
      resources = resources.filter(
        (r) => r.category === category.toUpperCase(),
      );
    }

    // Group by category
    const grouped = resources.reduce(
      (acc, resource) => {
        if (!acc[resource.category]) {
          acc[resource.category] = [];
        }
        acc[resource.category]!.push(resource);
        return acc;
      },
      {} as Record<string, Resource[]>,
    );

    return NextResponse.json({
      success: true,
      data: {
        resources,
        categories: {
          GROWING: grouped.GROWING || [],
          BUSINESS: grouped.BUSINESS || [],
          COMMUNITY: grouped.COMMUNITY || [],
          COMPLIANCE: grouped.COMPLIANCE || [],
        },
        total: resources.length,
      },
    });
  } catch (error) {
    console.error("Resources API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST - Track resource downloads with divine precision
 * Logs downloads to database for analytics and user tracking
 */
export async function POST(request: NextRequest) {
  try {
    const { resourceId } = await request.json();

    const resource = MOCK_RESOURCES.find((r) => r.id === resourceId);

    if (!resource) {
      return NextResponse.json(
        {
          success: false,
          error: "Resource not found",
        },
        { status: 404 },
      );
    }

    if (!resource.downloadable) {
      return NextResponse.json(
        {
          success: false,
          error: "Resource is not downloadable",
        },
        { status: 400 },
      );
    }

    // Get user session (optional for downloads)
    const session = await auth();

    // Extract request metadata for tracking
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    // Track download in database with agricultural consciousness
    await database.downloadLog.create({
      data: {
        userId: session?.user?.id,
        resourceId: resource.id,
        ipAddress: ipAddress.slice(0, 45), // Ensure it fits in VarChar(45)
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        resourceId: resource.id,
        title: resource.title,
        fileUrl: resource.fileUrl,
        downloadTracked: true,
      },
      message: "Resource download tracked successfully",
    });
  } catch (error) {
    console.error("Resource download error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track resource download",
      },
      { status: 500 },
    );
  }
}
