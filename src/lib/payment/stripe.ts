// src/lib/payment/stripe.ts
import type {
  CreatePaymentIntentInput,
  PaymentIntentResponse,
  StripeMetadata,
} from "@/types/payment.types";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

/**
 * Create Stripe payment intent
 */
export async function createStripePaymentIntent(
  input: CreatePaymentIntentInput,
  metadata: StripeMetadata
): Promise<PaymentIntentResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100), // Convert to cents
      currency: input.currency || "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: metadata.orderId,
        farmId: metadata.farmId,
        customerId: metadata.customerId,
        orderNumber: metadata.orderNumber,
      },
      description: `Order ${metadata.orderNumber} from ${metadata.farmId}`,
      ...(input.customerId && { customer: input.customerId }),
      ...(input.savePaymentMethod && { setup_future_usage: "off_session" }),
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error("Stripe payment intent creation failed:", error);
    throw new Error(
      `Failed to create payment intent: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Confirm Stripe payment
 */
export async function confirmStripePayment(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "requires_confirmation") {
      return await stripe.paymentIntents.confirm(paymentIntentId);
    }

    return paymentIntent;
  } catch (error) {
    console.error("Stripe payment confirmation failed:", error);
    throw new Error(
      `Failed to confirm payment: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Retrieve payment intent
 */
export async function getStripePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error("Failed to retrieve payment intent:", error);
    throw new Error(
      `Failed to retrieve payment: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Create Stripe refund
 */
export async function createStripeRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<Stripe.Refund> {
  try {
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      ...(amount && { amount: Math.round(amount * 100) }),
      ...(reason && { reason: reason as Stripe.RefundCreateParams.Reason }),
    };

    return await stripe.refunds.create(refundData);
  } catch (error) {
    console.error("Stripe refund creation failed:", error);
    throw new Error(
      `Failed to create refund: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * List customer payment methods
 */
export async function listCustomerPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return paymentMethods.data;
  } catch (error) {
    console.error("Failed to list payment methods:", error);
    return [];
  }
}

/**
 * Create Stripe customer
 */
export async function createStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  try {
    return await stripe.customers.create({
      email,
      name,
      metadata,
    });
  } catch (error) {
    console.error("Failed to create Stripe customer:", error);
    throw new Error(
      `Failed to create customer: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Update Stripe customer
 */
export async function updateStripeCustomer(
  customerId: string,
  updates: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> {
  try {
    return await stripe.customers.update(customerId, updates);
  } catch (error) {
    console.error("Failed to update Stripe customer:", error);
    throw new Error(
      `Failed to update customer: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Verify webhook signature
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Webhook verification failed:", error);
    throw new Error(
      `Webhook verification failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Calculate Stripe fee (2.9% + $0.30)
 */
export function calculateStripeFee(amount: number): number {
  return Math.round((amount * 0.029 + 0.3) * 100) / 100;
}

/**
 * Calculate net amount after Stripe fees
 */
export function calculateNetAmount(amount: number): number {
  const fee = calculateStripeFee(amount);
  return Math.round((amount - fee) * 100) / 100;
}
