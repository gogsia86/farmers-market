/**
 * 🔧 STRIPE SETUP INTENT API
 * Create setup intents for securely saving payment methods
 *
 * Features:
 * - Create setup intent for adding new cards
 * - Retrieve setup intent status
 * - Support for future payments
 * - Agricultural consciousness metadata
 *
 * @route POST /api/stripe/setup-intent - Create setup intent
 * @route GET /api/stripe/setup-intent - Retrieve setup intent status
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { database } from "@/lib/database";
import { z } from "zod";
import Stripe from "stripe";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateSetupIntentSchema = z.object({
  returnUrl: z.string().url().optional(),
  paymentMethodTypes: z
    .array(z.enum(["card", "us_bank_account", "link"]))
    .optional()
    .default(["card"]),
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
      createdAt: new Date().toISOString(),
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
// POST - CREATE SETUP INTENT
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
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is acceptable, use defaults
    }

    const validation = CreateSetupIntentSchema.safeParse(body);

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

    const { paymentMethodTypes } = validation.data;

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id);

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: paymentMethodTypes,
      usage: "off_session", // Allow using this payment method for future payments
      metadata: {
        userId: session.user.id,
        platform: "Farmers Market Platform",
        consciousness: "AGRICULTURAL",
        purpose: "save_payment_method",
        createdAt: new Date().toISOString(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        setupIntent: {
          id: setupIntent.id,
          clientSecret: setupIntent.client_secret,
          status: setupIntent.status,
          customerId: setupIntent.customer,
          paymentMethodTypes: setupIntent.payment_method_types,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating setup intent:", error);

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
            : "Failed to create setup intent",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// GET - RETRIEVE SETUP INTENT STATUS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get setup intent ID from query params
    const { searchParams } = new URL(request.url);
    const setupIntentId = searchParams.get("setupIntentId");

    if (!setupIntentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Setup intent ID is required",
        },
        { status: 400 },
      );
    }

    // Retrieve setup intent
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    // Verify ownership by checking customer
    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id);

    if (setupIntent.customer !== stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Setup intent does not belong to this customer",
        },
        { status: 403 },
      );
    }

    // Get payment method details if available
    let paymentMethodDetails = null;
    if (
      setupIntent.payment_method &&
      typeof setupIntent.payment_method === "string"
    ) {
      try {
        const paymentMethod = await stripe.paymentMethods.retrieve(
          setupIntent.payment_method,
        );
        paymentMethodDetails = {
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
        };
      } catch {
        // Payment method retrieval failed, continue without details
      }
    }

    return NextResponse.json(
      {
        success: true,
        setupIntent: {
          id: setupIntent.id,
          status: setupIntent.status,
          paymentMethodId:
            typeof setupIntent.payment_method === "string"
              ? setupIntent.payment_method
              : setupIntent.payment_method?.id,
          paymentMethod: paymentMethodDetails,
          lastError: setupIntent.last_setup_error
            ? {
                code: setupIntent.last_setup_error.code,
                message: setupIntent.last_setup_error.message,
              }
            : null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving setup intent:", error);

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
            : "Failed to retrieve setup intent",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// PATCH - CONFIRM SETUP INTENT (for server-side confirmation)
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { setupIntentId, paymentMethodId } = body;

    if (!setupIntentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Setup intent ID is required",
        },
        { status: 400 },
      );
    }

    // Retrieve setup intent to verify ownership
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id);

    if (setupIntent.customer !== stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Setup intent does not belong to this customer",
        },
        { status: 403 },
      );
    }

    // Confirm setup intent if payment method provided
    let confirmedSetupIntent = setupIntent;
    if (paymentMethodId && setupIntent.status === "requires_payment_method") {
      confirmedSetupIntent = await stripe.setupIntents.confirm(setupIntentId, {
        payment_method: paymentMethodId,
      });
    }

    // If successful, update customer's default payment method
    if (
      confirmedSetupIntent.status === "succeeded" &&
      confirmedSetupIntent.payment_method
    ) {
      const pmId =
        typeof confirmedSetupIntent.payment_method === "string"
          ? confirmedSetupIntent.payment_method
          : confirmedSetupIntent.payment_method.id;

      // Check if this is the customer's first payment method
      const existingMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: "card",
        limit: 2, // Only need to know if there's more than one
      });

      // Set as default if it's the only payment method
      if (existingMethods.data.length === 1) {
        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: {
            default_payment_method: pmId,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        setupIntent: {
          id: confirmedSetupIntent.id,
          status: confirmedSetupIntent.status,
          paymentMethodId:
            typeof confirmedSetupIntent.payment_method === "string"
              ? confirmedSetupIntent.payment_method
              : confirmedSetupIntent.payment_method?.id,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error confirming setup intent:", error);

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
            : "Failed to confirm setup intent",
      },
      { status: 500 },
    );
  }
}
