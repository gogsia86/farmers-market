/**
 * TRIGGER EMAIL SEQUENCE API
 * POST /api/marketing/sequences/trigger
 *
 * Enrolls users in automated sequences based on trigger events
 */

import type {
  AutomationTrigger,
  SequenceEnrollment,
} from "@/types/automation.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const TriggerSchema = z.object({
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
  userId: z.string(),
  metadata: z.record(z.any()).optional(),
});

// Mock enrollments storage
const enrollments: SequenceEnrollment[] = [];

/**
 * POST - Trigger a sequence for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = TriggerSchema.parse(body);

    // Find active sequences for this trigger
    const activeSequences = await findActiveSequences(validated.trigger);

    if (activeSequences.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active sequences found for this trigger",
        enrolled: 0,
      });
    }

    // Enroll user in all matching sequences
    const newEnrollments: SequenceEnrollment[] = [];

    for (const sequence of activeSequences) {
      // Check if user already enrolled
      const existingEnrollment = enrollments.find(
        (e) =>
          e.sequenceId === sequence.id &&
          e.userId === validated.userId &&
          e.status === "ACTIVE"
      );

      if (existingEnrollment) {
        continue; // Skip if already enrolled
      }

      // Create new enrollment
      const enrollment: SequenceEnrollment = {
        id: `enroll_${Date.now()}_${Math.random()}`,
        sequenceId: sequence.id,
        userId: validated.userId,
        status: "ACTIVE",
        currentEmailIndex: 0,
        triggeredAt: new Date(),
        emailsDelivered: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        converted: false,
      };

      enrollments.push(enrollment);
      newEnrollments.push(enrollment);

      // Schedule first email (if delay is 0, send immediately)
      await scheduleEmail(enrollment, sequence.emails[0]);
    }

    return NextResponse.json({
      success: true,
      message: `User enrolled in ${newEnrollments.length} sequence(s)`,
      enrolled: newEnrollments.length,
      enrollments: newEnrollments,
    });
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

    console.error("Sequence trigger error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to trigger sequence",
      },
      { status: 500 }
    );
  }
}

/**
 * Find active sequences for a trigger
 */
async function findActiveSequences(trigger: AutomationTrigger) {
  // Mock sequences (in production, query from database)
  const mockSequences = [
    {
      id: "seq_welcome",
      trigger: "USER_SIGNUP",
      status: "ACTIVE",
      emails: [
        { id: "e1", order: 1, delayHours: 0, subject: "Welcome!" },
        { id: "e2", order: 2, delayHours: 72, subject: "Getting Started" },
      ],
    },
    {
      id: "seq_abandoned_cart",
      trigger: "CART_ABANDONED",
      status: "ACTIVE",
      emails: [
        { id: "e1", order: 1, delayHours: 1, subject: "Cart Reminder" },
        { id: "e2", order: 2, delayHours: 24, subject: "Discount Offer" },
      ],
    },
    {
      id: "seq_farmer_onboarding",
      trigger: "FARMER_SIGNUP",
      status: "ACTIVE",
      emails: [
        { id: "e1", order: 1, delayHours: 0, subject: "Welcome Farmer!" },
        {
          id: "e2",
          order: 2,
          delayHours: 48,
          subject: "Product Listing Guide",
        },
      ],
    },
  ];

  return mockSequences.filter(
    (s) => s.trigger === trigger && s.status === "ACTIVE"
  );
}

/**
 * Schedule email to be sent
 */
async function scheduleEmail(enrollment: SequenceEnrollment, email: any) {
  // In production, use a queue system (Bull, BullMQ, etc.)
  // For now, just log
  console.log(
    `Scheduled email "${email.subject}" for user ${enrollment.userId} in ${email.delayHours} hours`
  );

  // If delay is 0, send immediately
  if (email.delayHours === 0) {
    await sendEmailNow(enrollment.userId, email);
  } else {
    // Schedule for later (using cron job or queue)
    const sendAt = new Date(Date.now() + email.delayHours * 60 * 60 * 1000);
    console.log(`Will send at: ${sendAt.toISOString()}`);
  }
}

/**
 * Send email immediately
 */
async function sendEmailNow(userId: string, email: any) {
  // Integration with SendGrid would go here
  console.log(`Sending email to user ${userId}: "${email.subject}"`);

  // Mock success
  return {
    success: true,
    messageId: `msg_${Date.now()}`,
  };
}

/**
 * GET - List enrollments for a user
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: "userId parameter required",
      },
      { status: 400 }
    );
  }

  const userEnrollments = enrollments.filter((e) => e.userId === userId);

  return NextResponse.json({
    success: true,
    enrollments: userEnrollments,
    total: userEnrollments.length,
  });
}
