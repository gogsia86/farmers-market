/**
 * EMAIL SEQUENCES API
 * Divine automated email sequence management
 *
 * Endpoints:
 * - POST /api/marketing/sequences - Create sequence
 * - GET /api/marketing/sequences - List sequences
 * - GET /api/marketing/sequences/:id - Get sequence details
 * - PUT /api/marketing/sequences/:id - Update sequence
 * - POST /api/marketing/sequences/:id/activate - Activate sequence
 * - POST /api/marketing/sequences/:id/pause - Pause sequence
 */

import type {
  AutomationStatus,
  AutomationTrigger,
  EmailSequence,
} from "@/types/automation.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const SequenceEmailSchema = z.object({
  order: z.number().min(1),
  delayHours: z.number().min(0),
  subject: z.string().min(1).max(200),
  preheader: z.string().max(150).optional(),
  templateId: z.string(),
  templateData: z.record(z.any()).optional(),
});

const CreateSequenceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  trigger: z.enum([
    "USER_SIGNUP",
    "FIRST_ORDER",
    "CART_ABANDONED",
    "ORDER_DELIVERED",
    "USER_INACTIVE_30_DAYS",
    "USER_INACTIVE_60_DAYS",
    "FARMER_SIGNUP",
    "PRODUCT_LISTED",
  ]),
  emails: z.array(SequenceEmailSchema).min(1).max(10),
});

// Mock database
const sequences: EmailSequence[] = [];

/**
 * POST - Create new email sequence
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateSequenceSchema.parse(body);

    // Create sequence
    const sequence: EmailSequence = {
      id: `seq_${Date.now()}`,
      name: validated.name,
      description: validated.description || "",
      trigger: validated.trigger,
      status: "DRAFT",
      emails: validated.emails.map((email, index) => ({
        id: `email_${Date.now()}_${index}`,
        ...email,
      })),
      stats: {
        triggered: 0,
        emailsSent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        revenue: 0,
        emailStats: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    sequences.push(sequence);

    return NextResponse.json(
      {
        success: true,
        sequence,
        message: "Email sequence created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Sequence creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create sequence",
      },
      { status: 500 }
    );
  }
}

/**
 * GET - List all sequences with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as AutomationStatus | null;
    const trigger = searchParams.get("trigger") as AutomationTrigger | null;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");

    // Add predefined sequences for demo
    const allSequences = [...sequences, ...getPredefinedSequences()];

    // Filter sequences
    let filtered = allSequences;

    if (status) {
      filtered = filtered.filter((s) => s.status === status);
    }

    if (trigger) {
      filtered = filtered.filter((s) => s.trigger === trigger);
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return NextResponse.json({
      success: true,
      sequences: paginated,
      pagination: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  } catch (error) {
    console.error("Sequence list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sequences",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get predefined sequences for demo
 */
function getPredefinedSequences(): EmailSequence[] {
  const predefined = [
    {
      id: "seq_welcome",
      name: "Welcome Email Series",
      description: "Automated welcome sequence for new users",
      trigger: "USER_SIGNUP" as AutomationTrigger,
      status: "ACTIVE" as AutomationStatus,
      emails: [
        {
          id: "email_welcome_1",
          order: 1,
          delayHours: 0,
          subject: "🌾 Welcome to Farmers Market!",
          preheader: "Let's get you started with fresh local produce",
          templateId: "welcome",
        },
        {
          id: "email_welcome_2",
          order: 2,
          delayHours: 72,
          subject: "🚜 Discover Amazing Local Farms",
          preheader: "Browse farms near you and find your favorites",
          templateId: "welcome",
        },
        {
          id: "email_welcome_3",
          order: 3,
          delayHours: 168,
          subject: "🎁 Here's $10 Off Your First Order!",
          preheader: "Use code WELCOME10 - expires in 48 hours",
          templateId: "promo",
        },
      ],
      stats: {
        triggered: 245,
        emailsSent: 720,
        opened: 504,
        clicked: 180,
        converted: 89,
        revenue: 4450,
        emailStats: [],
      },
      createdAt: new Date("2025-10-01"),
      updatedAt: new Date("2025-10-20"),
    },
    {
      id: "seq_abandoned_cart",
      name: "Abandoned Cart Recovery",
      description: "Win back customers who left items in cart",
      trigger: "CART_ABANDONED" as AutomationTrigger,
      status: "ACTIVE" as AutomationStatus,
      emails: [
        {
          id: "email_cart_1",
          order: 1,
          delayHours: 1,
          subject: "🛒 You left something behind!",
          preheader: "Your cart is waiting - complete your order now",
          templateId: "cart",
        },
        {
          id: "email_cart_2",
          order: 2,
          delayHours: 24,
          subject: "💚 10% OFF your cart - Just for you!",
          preheader: "Don't miss out on fresh produce - save 10% today",
          templateId: "cart",
        },
      ],
      stats: {
        triggered: 156,
        emailsSent: 298,
        opened: 187,
        clicked: 89,
        converted: 52,
        revenue: 2860,
        emailStats: [],
      },
      createdAt: new Date("2025-10-01"),
      updatedAt: new Date("2025-10-20"),
    },
    {
      id: "seq_farmer_onboarding",
      name: "Farmer Onboarding Series",
      description: "Help new farmers get started successfully",
      trigger: "FARMER_SIGNUP" as AutomationTrigger,
      status: "ACTIVE" as AutomationStatus,
      emails: [
        {
          id: "email_farmer_1",
          order: 1,
          delayHours: 0,
          subject: "🚜 Welcome to Farmers Market, Farmer!",
          preheader: "Let's get your farm set up in minutes",
          templateId: "welcome",
        },
        {
          id: "email_farmer_2",
          order: 2,
          delayHours: 48,
          subject: "📦 How to List Your Products",
          preheader: "Step-by-step guide to adding products",
          templateId: "newsletter",
        },
        {
          id: "email_farmer_3",
          order: 3,
          delayHours: 168,
          subject: "💡 Marketing Tips for Farmers",
          preheader: "Grow your sales with these proven strategies",
          templateId: "newsletter",
        },
      ],
      stats: {
        triggered: 48,
        emailsSent: 132,
        opened: 98,
        clicked: 45,
        converted: 28,
        revenue: 0,
        emailStats: [],
      },
      createdAt: new Date("2025-10-01"),
      updatedAt: new Date("2025-10-20"),
    },
  ];

  return predefined;
}
