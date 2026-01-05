# 🚀 START HERE: Week 2 Day 5 - Stripe Payment Integration

**Date**: November 15, 2025
**Sprint**: Week 2 - Shopping Cart & Checkout
**Day**: Day 5 - Payment Integration with Stripe
**Estimated Time**: 3-4 hours
**Prerequisite**: Day 4 Order Management ✅ Complete

---

## 📋 Day 5 Objectives

### Primary Goals
1. **Stripe Setup** - Configure Stripe account and API keys
2. **Payment Intent Creation** - Generate payment intents on checkout
3. **Payment Form** - Integrate Stripe Elements for secure card input
4. **Payment Confirmation** - Handle successful/failed payments
5. **Webhook Handler** - Process Stripe webhook events
6. **Order Status Updates** - Update orders based on payment status

### Success Criteria
- ✅ Stripe API configured and working
- ✅ Payment form accepts test cards
- ✅ Payment intents created successfully
- ✅ Webhooks receive and process events
- ✅ Orders update to PAID status on success
- ✅ TypeScript: 0 errors
- ✅ Divine patterns maintained

---

## 🎯 What You're Building Today

### Payment Flow

```
1. User reaches Review Step
   ↓
2. Frontend requests Payment Intent from API
   ↓
3. Backend creates Stripe Payment Intent
   ↓
4. Payment Step displays Stripe Elements form
   ↓
5. User enters card details
   ↓
6. Frontend confirms payment with Stripe
   ↓
7. Order is created (if payment succeeds)
   ↓
8. Stripe sends webhook event
   ↓
9. Backend updates order status
   ↓
10. User sees confirmation page
```

---

## 📁 Files to Create/Modify

### 1. Stripe Configuration
**File**: `src/lib/stripe/config.ts`

### 2. Stripe Client
**File**: `src/lib/stripe/stripe-client.ts`

### 3. Payment Intent API
**File**: `src/app/api/stripe/payment-intent/route.ts`

### 4. Stripe Webhook Handler
**File**: `src/app/api/webhooks/stripe/route.ts`

### 5. Payment Form Component
**File**: `src/components/features/checkout/stripe-payment-form.tsx`

### 6. Payment Step Enhancement
**File**: `src/components/features/checkout/payment-step.tsx` (update)

### 7. Payment Service
**File**: `src/lib/services/payment.service.ts`

### 8. Environment Variables
**File**: `.env.local` (add Stripe keys)

---

## 🔧 Implementation Guide

### Step 1: Stripe Setup & Configuration

#### 1.1 Install Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

#### 1.2 Configure Environment Variables

**File**: `.env.local`

```env
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (get after creating webhook)
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 1.3 Create Stripe Configuration

**File**: `src/lib/stripe/config.ts`

```typescript
/**
 * 💳 STRIPE CONFIGURATION - Divine Payment Gateway
 * Stripe API configuration and constants
 */

export const stripeConfig = {
  // API Keys
  secretKey: process.env.STRIPE_SECRET_KEY!,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  // API Version
  apiVersion: "2023-10-16" as const,

  // Currency
  currency: "usd",

  // Payment Method Types
  paymentMethodTypes: ["card"],

  // Appearance customization
  appearance: {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#16a34a", // Green-600
      fontFamily: "system-ui, sans-serif",
    },
  },
} as const;

// Validation
if (!stripeConfig.secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
}

if (!stripeConfig.publishableKey) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in environment variables");
}

export default stripeConfig;
```

#### 1.4 Create Stripe Client

**File**: `src/lib/stripe/stripe-client.ts`

```typescript
/**
 * 💳 STRIPE CLIENT - Divine Payment Processing
 * Server-side Stripe client initialization
 */

import Stripe from "stripe";
import stripeConfig from "./config";

// Initialize Stripe with API version
export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion,
  typescript: true,
});

// Export for use in services
export default stripe;
```

---

### Step 2: Payment Intent API

**File**: `src/app/api/stripe/payment-intent/route.ts`

```typescript
/**
 * 💳 PAYMENT INTENT API - Create Stripe Payment Intent
 * Handles payment intent creation for checkout
 */

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe/stripe-client";
import stripeConfig from "@/lib/stripe/config";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreatePaymentIntentSchema = z.object({
  amount: z.number().positive().min(50), // Minimum $0.50
  metadata: z.object({
    orderId: z.string().optional(),
    userId: z.string(),
    farmIds: z.array(z.string()).optional(),
  }),
});

/**
 * POST /api/stripe/payment-intent
 * Create a new payment intent
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to create a payment intent",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request
    const validation = CreatePaymentIntentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid payment intent data",
            details: validation.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const { amount, metadata } = validation.data;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: stripeConfig.currency,
      payment_method_types: stripeConfig.paymentMethodTypes,
      metadata: {
        ...metadata,
        userId: session.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PAYMENT_INTENT_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create payment intent",
        },
      },
      { status: 500 }
    );
  }
}
```

---

### Step 3: Stripe Webhook Handler

**File**: `src/app/api/webhooks/stripe/route.ts`

```typescript
/**
 * 💳 STRIPE WEBHOOK HANDLER - Divine Payment Events
 * Processes Stripe webhook events for payment confirmation
 */

import { stripe } from "@/lib/stripe/stripe-client";
import stripeConfig from "@/lib/stripe/config";
import { database } from "@/lib/database";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeConfig.webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle event
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    console.error("Payment intent missing orderId in metadata");
    return;
  }

  // Update order status
  await database.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntent.id,
      stripeChargeId: paymentIntent.latest_charge as string,
    },
  });

  console.log(`Order ${orderId} marked as PAID`);

  // TODO: Send confirmation email
  // TODO: Notify farmer
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    console.error("Payment intent missing orderId in metadata");
    return;
  }

  // Update order status
  await database.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "FAILED",
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  console.log(`Order ${orderId} payment FAILED`);

  // TODO: Send payment failed email
}

/**
 * Handle refund
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  // Find order by charge ID
  const order = await database.order.findFirst({
    where: { stripeChargeId: charge.id },
  });

  if (!order) {
    console.error(`Order not found for charge ${charge.id}`);
    return;
  }

  // Update order status
  await database.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "REFUNDED",
      status: "CANCELLED",
    },
  });

  console.log(`Order ${order.id} REFUNDED`);

  // TODO: Send refund confirmation email
}
```

---

### Step 4: Stripe Payment Form Component

**File**: `src/components/features/checkout/stripe-payment-form.tsx`

```typescript
"use client";

/**
 * 💳 STRIPE PAYMENT FORM - Secure Card Input
 * Stripe Elements integration for payment collection
 */

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, Loader2 } from "lucide-react";

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function StripePaymentForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        onError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Details
          </h3>
        </div>

        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">
                Payment Error
              </h3>
              <p className="mt-1 text-xs text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay ${(amount / 100).toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-gray-500">
        Payments are securely processed by Stripe
      </p>
    </form>
  );
}
```

---

### Step 5: Update Payment Step

**File**: `src/components/features/checkout/payment-step.tsx`

Add Stripe Elements provider and payment form integration:

```typescript
"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripePaymentForm } from "./stripe-payment-form";
import { useEffect, useState } from "react";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function PaymentStep({ ... }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(true);

  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: calculateTotal(), // Your total calculation
          metadata: {
            userId: session.user.id,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setClientSecret(result.data.clientSecret);
      }
    } catch (error) {
      console.error("Failed to create payment intent:", error);
    } finally {
      setIsLoadingIntent(false);
    }
  };

  // ... rest of component

  return (
    <div>
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#16a34a",
              },
            },
          }}
        >
          <StripePaymentForm
            clientSecret={clientSecret}
            amount={calculateTotal()}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
      )}
    </div>
  );
}
```

---

### Step 6: Update Order Creation

**File**: `src/app/api/orders/route.ts`

Update to include payment intent ID:

```typescript
// After creating order, update with payment intent
await database.order.update({
  where: { id: order.id },
  data: {
    stripePaymentIntentId: paymentIntentId,
  },
});
```

---

## 🧪 Testing Guide

### Test Cards (Stripe Test Mode)

```
✅ Success: 4242 4242 4242 4242
❌ Decline: 4000 0000 0000 0002
🔒 3D Secure: 4000 0025 0000 3155
💳 Insufficient Funds: 4000 0000 0000 9995
```

**Card Details**:
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Testing Steps

1. **Test Successful Payment**
   - Add items to cart
   - Go through checkout
   - Use success test card
   - Verify order created
   - Check order status = PAID

2. **Test Failed Payment**
   - Use decline test card
   - Verify error message shown
   - Verify order not created

3. **Test Webhook**
   - Use Stripe CLI to forward webhooks
   - Complete payment
   - Verify webhook received
   - Verify order status updated

---

## 🔐 Security Best Practices

### 1. Never Expose Secret Key
```typescript
// ❌ WRONG - Client-side
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ CORRECT - Server-side only
// In API routes or server components
```

### 2. Verify Webhook Signatures
```typescript
// Always verify signatures to prevent fake webhooks
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);
```

### 3. Use HTTPS in Production
- Stripe requires HTTPS for webhooks
- Configure production webhooks correctly

### 4. Validate Amounts Server-Side
```typescript
// Don't trust client-provided amounts
// Always calculate totals server-side
```

---

## 🚀 Deployment Steps

### 1. Stripe Production Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Live** keys (not test keys)
3. Add to production environment variables

### 2. Webhook Configuration

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook signing secret
5. Add to production environment variables

### 3. Environment Variables

```env
# Production
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📚 Additional Resources

### Stripe Documentation
- https://stripe.com/docs/payments/payment-intents
- https://stripe.com/docs/stripe-js
- https://stripe.com/docs/webhooks

### Stripe Test Cards
- https://stripe.com/docs/testing

### Next.js + Stripe
- https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript

---

## ✅ Day 5 Completion Checklist

- [ ] Stripe dependencies installed
- [ ] Environment variables configured
- [ ] Stripe client initialized
- [ ] Payment Intent API created
- [ ] Webhook handler implemented
- [ ] Payment form component built
- [ ] Payment Step updated
- [ ] Order creation includes payment ID
- [ ] Test cards work successfully
- [ ] Webhooks receive events
- [ ] Order status updates on payment
- [ ] TypeScript: 0 errors
- [ ] Documentation updated

---

## 🎉 Expected Outcome

After completing Day 5:

✅ **Users can make real payments** with credit/debit cards
✅ **Secure payment processing** via Stripe Elements
✅ **Payment confirmation** updates order status automatically
✅ **Webhook handling** processes payment events reliably
✅ **Test mode** allows safe testing with test cards
✅ **Production ready** with proper security measures

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

# 2. Configure environment variables
# Add Stripe keys to .env.local

# 3. Run development server
npm run dev

# 4. Test with Stripe test cards
# Visit checkout and use test card numbers

# 5. Monitor webhooks (optional)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

**Ready to integrate payments?** Let's make it secure, smooth, and divine! 💳⚡

_"From checkout to confirmation, from payment intent to paid order, the divine commerce platform processes payments with quantum security and agricultural consciousness."_ 🌾💚
