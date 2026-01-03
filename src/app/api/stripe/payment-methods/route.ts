/**
 * 💳 STRIPE PAYMENT METHODS API
 * Manage saved payment methods for customers
 *
 * Features:
 * - List customer's saved payment methods
 * - Attach new payment methods
 * - Set default payment method
 * - Detach (remove) payment methods
 * - Agricultural consciousness metadata
 *
 * @route GET /api/stripe/payment-methods - List payment methods
 * @route POST /api/stripe/payment-methods - Attach new payment method
 * @route DELETE /api/stripe/payment-methods - Detach payment method
 * @route PUT /api/stripe/payment-methods - Set default payment method
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const logger = createLogger("stripe-payment-methods-api");

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const AttachPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1, "Payment method ID is required"),
  setAsDefault: z.boolean().optional().default(false),
});

const DetachPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1, "Payment method ID is required"),
});

const SetDefaultPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1, "Payment method ID is required"),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get or create Stripe customer for user
 * Uses the user's notificationPreferences JSON field to store stripeCustomerId
 * until a proper schema migration adds the field
 */
async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  // Check if user already has a Stripe customer ID stored
  const user = await database.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      notificationPreferences: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check for existing Stripe customer ID in notification preferences
  const preferences = user.notificationPreferences as Record<
    string,
    unknown
  > | null;
  const existingCustomerId = preferences?.stripeCustomerId as
    | string
    | undefined;

  if (existingCustomerId) {
    // Verify the customer still exists in Stripe
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!customer.deleted) {
        return existingCustomerId;
      }
    } catch {
      // Customer doesn't exist, create new one
    }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email || undefined,
    name: user.name || undefined,
    metadata: {
      userId: user.id,
      platform: "Farmers Market Platform",
      consciousness: "AGRICULTURAL",
    },
  });

  // Save Stripe customer ID to user record
  const updatedPreferences = {
    ...(preferences || {}),
    stripeCustomerId: customer.id,
  };

  await database.user.update({
    where: { id: userId },
    data: { notificationPreferences: updatedPreferences },
  });

  return customer.id;
}

// ============================================================================
// GET - LIST PAYMENT METHODS
// ============================================================================

export async function GET(_request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get Stripe customer ID
    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id);

    // Get customer to find default payment method
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    const defaultPaymentMethodId =
      typeof customer !== "string" && !customer.deleted
        ? customer.invoice_settings?.default_payment_method
        : null;

    // List payment methods (cards only for now)
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
    });

    // Format response
    const formattedMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      type: pm.type,
      card: pm.card
        ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
          funding: pm.card.funding,
        }
        : null,
      isDefault: pm.id === defaultPaymentMethodId,
      createdAt: new Date(pm.created * 1000).toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        paymentMethods: formattedMethods,
        defaultPaymentMethodId,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to list payment methods", error, {
      operation: "listPaymentMethods",
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to list payment methods",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST - ATTACH PAYMENT METHOD
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = AttachPaymentMethodSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { paymentMethodId, setAsDefault } = validation.data;

    // Get Stripe customer ID
    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id);

    // Attach payment method to customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Set as default if requested
    if (setAsDefault) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card
            ? {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              expMonth: paymentMethod.card.exp_month,
              expYear: paymentMethod.card.exp_year,
            }
            : null,
          isDefault: setAsDefault,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to attach payment method", error, {
      operation: "attachPaymentMethod",
    });

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to attach payment method",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// DELETE - DETACH PAYMENT METHOD
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = DetachPaymentMethodSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { paymentMethodId } = validation.data;

    // Get Stripe customer ID to verify ownership
    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id);

    // Verify payment method belongs to customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (paymentMethod.customer !== stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment method does not belong to this customer",
        },
        { status: 403 },
      );
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json(
      {
        success: true,
        message: "Payment method removed successfully",
        removedPaymentMethodId: paymentMethodId,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to detach payment method", error, {
      operation: "detachPaymentMethod",
    });

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove payment method",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// PUT - SET DEFAULT PAYMENT METHOD
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = SetDefaultPaymentMethodSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { paymentMethodId } = validation.data;

    // Get Stripe customer ID
    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id);

    // Verify payment method belongs to customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (paymentMethod.customer !== stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment method does not belong to this customer",
        },
        { status: 403 },
      );
    }

    // Update customer's default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Default payment method updated",
        defaultPaymentMethodId: paymentMethodId,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Failed to set default payment method", error, {
      operation: "setDefaultPaymentMethod",
    });

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to set default payment method",
      },
      { status: 500 },
    );
  }
}
