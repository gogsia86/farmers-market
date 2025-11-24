import { database } from "@/lib/database";
import { sendSupportTicketConfirmationLazy } from "@/lib/email/email-service-lazy";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * 🛟 SUPPORT TICKETS API
 * POST /api/support/tickets - Create support ticket
 * GET /api/support/tickets - Get user's tickets
 */

const supportTicketSchema = z.object({
  name: z.string().min(2),
  farmName: z.string().min(3).optional(),
  email: z.string().email(),
  subject: z.enum([
    "ACCOUNT",
    "ORDERS",
    "PRODUCTS",
    "PAYMENTS",
    "TECHNICAL",
    "OTHER",
  ]),
  message: z.string().min(20),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = supportTicketSchema.parse(body);

    // Find or create user
    let user = await database.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      // Create temporary user for support tickets
      user = await database.user.create({
        data: {
          email: validatedData.email,
          firstName: validatedData.name.split(" ")[0] || validatedData.name,
          lastName: validatedData.name.split(" ").slice(1).join(" ") || "",
        },
      });
    }

    // Create support ticket (you'll need to add SupportTicket model to Prisma schema)
    // For now, we'll simulate it
    const ticketId = `TICKET-${Date.now()}`;

    // TODO: Store in database when SupportTicket model is added
    // const ticket = await database.supportTicket.create({
    //   data: {
    //     ticketNumber: ticketId,
    //     userId: user.id,
    //     farmName: validatedData.farmName,
    //     subject: validatedData.subject,
    //     message: validatedData.message,
    //     priority: validatedData.priority,
    //     status: "OPEN",
    //   },
    // });

    // Send confirmation email (lazy-loaded to reduce bundle size)
    try {
      await sendSupportTicketConfirmationLazy({
        ticketId,
        subject: validatedData.subject,
        name: validatedData.name,
        email: user.email,
      });
    } catch (emailError) {
      // Log email error but don't fail ticket creation
      console.error("Failed to send support ticket confirmation:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Support ticket created successfully",
        data: {
          ticketId,
          email: user.email,
          subject: validatedData.subject,
          status: "OPEN",
          estimatedResponse: "24 hours",
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

    console.error("Support ticket error:", error);
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
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          tickets: [],
          total: 0,
        },
      });
    }

    // TODO: Query support tickets from database
    // const tickets = await database.supportTicket.findMany({
    //   where: { userId: user.id },
    //   orderBy: { createdAt: 'desc' },
    // });

    // Mock response
    return NextResponse.json({
      success: true,
      data: {
        tickets: [],
        total: 0,
        message: "Support ticket system ready for implementation",
      },
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
