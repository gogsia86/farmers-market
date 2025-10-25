// src/app/api/payments/webhook/stripe/route.ts
import { database } from "@/lib/database";
import { verifyStripeWebhook } from "@/lib/payment/stripe";
import { PaymentStatus } from "@prisma/client";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

/**
 * POST /api/payments/webhook/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const event = verifyStripeWebhook(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentCanceled(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 400 }
    );
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    // Find payment by Stripe payment intent ID
    const payment = await database.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      console.error("Payment not found for intent:", paymentIntent.id);
      return;
    }

    // Update payment status
    await database.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: paymentIntent.id,
        completedAt: new Date(),
      },
    });

    // Update order payment status
    await database.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    console.log(`Payment ${payment.id} succeeded for order ${payment.orderId}`);
  } catch (error) {
    console.error("Error handling payment_intent.succeeded:", error);
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await database.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      console.error("Payment not found for intent:", paymentIntent.id);
      return;
    }

    // Update payment status
    await database.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    // Update order payment status
    await database.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: PaymentStatus.FAILED,
      },
    });

    console.log(`Payment ${payment.id} failed for order ${payment.orderId}`);
  } catch (error) {
    console.error("Error handling payment_intent.payment_failed:", error);
    throw error;
  }
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const payment = await database.payment.findFirst({
      where: { stripePaymentIntentId: charge.payment_intent as string },
    });

    if (!payment) {
      console.error("Payment not found for charge:", charge.id);
      return;
    }

    // Update payment status
    await database.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    // Update order payment status
    await database.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });

    console.log(`Payment ${payment.id} refunded for order ${payment.orderId}`);
  } catch (error) {
    console.error("Error handling charge.refunded:", error);
    throw error;
  }
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const payment = await database.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      console.error("Payment not found for intent:", paymentIntent.id);
      return;
    }

    // Update payment status
    await database.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CANCELLED,
      },
    });

    // Update order payment status
    await database.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: PaymentStatus.CANCELLED,
      },
    });

    console.log(`Payment ${payment.id} canceled for order ${payment.orderId}`);
  } catch (error) {
    console.error("Error handling payment_intent.canceled:", error);
    throw error;
  }
}
