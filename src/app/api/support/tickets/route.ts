/**
 * 🛟 SUPPORT TICKETS API
 * Divine agricultural support ticket system with quantum consciousness
 *
 * @module api/support/tickets
 * @implements {POST} Create support ticket
 * @implements {GET} Get user's tickets
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { sendSupportTicketConfirmationLazy } from "@/lib/email/email.service";
import { createLogger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("support-tickets-api");

/**
 * Validation schema for creating support tickets
 */
const CreateSupportTicketSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  farmName: z.string().min(3).optional(),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(255),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z
    .enum(["ACCOUNT", "ORDERS", "PRODUCTS", "PAYMENTS", "TECHNICAL", "GENERAL"])
    .default("GENERAL"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  relatedOrderId: z.string().optional(),
  relatedFarmId: z.string().optional(),
});

/**
 * POST - Create a new support ticket
 * Handles both authenticated and guest users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with divine precision
    const validation = CreateSupportTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const validatedData = validation.data;

    // Check for authenticated session
    const session = await auth();
    let userId: string;

    if (session?.user?.id) {
      // Use authenticated user
      userId = session.user.id;
    } else {
      // Find or create user for guest submissions
      let user = await database.user.findUnique({
        where: { email: validatedData.email },
      });

      if (!user) {
        // Create temporary user for support tickets
        const nameParts = validatedData.name.split(" ");
        user = await database.user.create({
          data: {
            email: validatedData.email,
            firstName: nameParts[0] || validatedData.name,
            lastName: nameParts.slice(1).join(" ") || "",
            role: "CONSUMER",
            status: "ACTIVE",
          },
        });
      }

      userId = user.id;
    }

    // Create support ticket in database with agricultural consciousness
    const ticket = await database.supportTicket.create({
      data: {
        userId,
        subject: validatedData.subject,
        description: validatedData.description,
        category: validatedData.category,
        priority: validatedData.priority,
        status: "OPEN",
        relatedOrderId: validatedData.relatedOrderId,
        relatedFarmId: validatedData.relatedFarmId,
        tags: validatedData.farmName ? [validatedData.farmName] : [],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send confirmation email (lazy-loaded to reduce bundle size)
    try {
      await sendSupportTicketConfirmationLazy({
        ticketId: ticket.id,
        subject: ticket.subject,
        name: validatedData.name,
        email: ticket.user.email,
      });
    } catch (emailError) {
      // Log email error but don't fail ticket creation
      logger.warn("Failed to send support ticket confirmation", {
        operation: "sendConfirmationEmail",
        ticketId: ticket.id,
        error: emailError instanceof Error ? emailError.message : "Unknown error",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Support ticket created successfully",
        data: {
          id: ticket.id,
          ticketNumber: ticket.id.slice(0, 8).toUpperCase(),
          subject: ticket.subject,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
          createdAt: ticket.createdAt,
          estimatedResponse: getEstimatedResponseTime(ticket.priority),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    logger.error("Support ticket creation error", error, {
      operation: "createSupportTicket",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create support ticket",
      },
      { status: 500 },
    );
  }
}

/**
 * GET - Retrieve support tickets for authenticated user
 * Supports filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await auth();

    // Allow email-based lookup for guests
    const email = searchParams.get("email");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let userId: string | undefined;

    if (session?.user?.id) {
      userId = session.user.id;
    } else if (email) {
      const user = await database.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json({
          success: true,
          data: {
            tickets: [],
            total: 0,
            page,
            limit,
          },
        });
      }

      userId = user.id;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required or email parameter needed",
        },
        { status: 401 },
      );
    }

    // Build filter conditions
    const where: Prisma.SupportTicketWhereInput = { userId };

    if (status) {
      where.status = status as Prisma.EnumSupportTicketStatusFilter;
    }

    if (category) {
      where.category = category as Prisma.EnumSupportTicketCategoryFilter;
    }

    // Fetch tickets with pagination
    const [tickets, total] = await Promise.all([
      database.supportTicket.findMany({
        where,
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1, // Last message only for list view
          },
          files: {
            select: {
              id: true,
              filename: true,
              url: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      database.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tickets: tickets.map((ticket) => ({
          id: ticket.id,
          ticketNumber: ticket.id.slice(0, 8).toUpperCase(),
          subject: ticket.subject,
          description: ticket.description,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          resolvedAt: ticket.resolvedAt,
          messageCount: ticket.messages.length,
          lastMessage: ticket.messages[0] || null,
          hasFiles: ticket.files.length > 0,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get support tickets error", error, {
      operation: "getSupportTickets",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch support tickets",
      },
      { status: 500 },
    );
  }
}

/**
 * Helper function to estimate response time based on priority
 */
function getEstimatedResponseTime(
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
): string {
  switch (priority) {
    case "URGENT":
      return "4 hours";
    case "HIGH":
      return "12 hours";
    case "MEDIUM":
      return "24 hours";
    case "LOW":
      return "48 hours";
    default:
      return "24 hours";
  }
}
