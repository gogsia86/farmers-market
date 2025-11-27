# 🚀 NEXT SESSION - START HERE

**Date Created:** November 27, 2024  
**Last Session:** Test fixes and comprehensive documentation  
**Current Status:** 🟢 1 of 5 objectives complete (37.2%)  
**Next Priority:** 💳 Payment Integration

---

## ⚡ QUICK STATUS

```
✅ DONE:     Fix Critical Tests (100%)
🎯 NEXT:     Payment Integration (0% → 100%)
AFTER THAT:  Security Hardening → Prisma 7 → Launch
```

**You are HERE:** Ready to implement Stripe payment integration

---

## 🎯 YOUR MISSION

Implement complete payment processing with Stripe in **12 hours** (~1.5 days).

### Success Criteria

- ✅ Stripe account configured
- ✅ Payment intents working
- ✅ Webhooks processing
- ✅ Refunds functional
- ✅ Tests passing

---

## 📋 STEP-BY-STEP GUIDE

### Step 1: Review Documentation (15 min)

Read these files in order:

1. `ACTION_PLAN_NEXT_STEPS.md` → Week 2 section (lines 288-540)
2. `docs/STRIPE_SETUP_GUIDE.md` → Configuration steps
3. This file → Implementation checklist below

### Step 2: Set Up Stripe (30 min)

**A. Create Test Account**

```bash
# Go to: https://dashboard.stripe.com/register
# Or use existing account

# Get test API keys from:
# https://dashboard.stripe.com/test/apikeys
```

**B. Add to Environment**

```bash
# Edit .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**C. Verify Installation**

```bash
# Check Stripe SDK is installed
npm list stripe
# Should show: stripe@20.0.0

# If not installed:
npm install stripe@latest
```

### Step 3: Create Payment Service (2 hours)

**Create:** `src/lib/services/payment.service.ts`

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export class PaymentService {
  /**
   * Create payment intent for order
   */
  async createPaymentIntent(orderId: string, amount: number) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: { orderId },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    };
  }

  /**
   * Confirm payment intent
   */
  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: paymentIntent.status === "succeeded",
      status: paymentIntent.status,
      paymentIntent,
    };
  }

  /**
   * Create refund
   */
  async createRefund(paymentIntentId: string, amount?: number) {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return {
      id: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    };
  }
}

export const paymentService = new PaymentService();
```

**Test it:**

```bash
npm run test -- payment.service
```

### Step 4: Create Payment API Routes (3 hours)

**A. Payment Intent Route**

Create: `src/app/api/payments/intent/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/services/payment.service";
import { database } from "@/lib/database";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();

    // Get order
    const order = await database.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify user owns order
    if (order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(
      orderId,
      Number(order.total),
    );

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 },
    );
  }
}
```

**B. Webhook Route**

Create: `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { database } from "@/lib/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;

    case "payment_intent.payment_failed":
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedIntent);
      break;

    case "charge.refunded":
      const charge = event.data.object as Stripe.Charge;
      await handleRefund(charge);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  await database.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      paymentIntentId: paymentIntent.id,
      paidAt: new Date(),
    },
  });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  await database.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "FAILED",
    },
  });
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  const order = await database.order.findFirst({
    where: { paymentIntentId },
  });

  if (order) {
    await database.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "REFUNDED",
        refundedAt: new Date(),
      },
    });
  }
}
```

### Step 5: Integrate with Order Creation (2 hours)

Update: `src/app/actions/order.actions.ts`

Add after order creation:

```typescript
// Create payment intent
const paymentIntent = await paymentService.createPaymentIntent(
  order.id,
  Number(order.total),
);

return {
  success: true,
  order,
  paymentIntent: {
    id: paymentIntent.id,
    clientSecret: paymentIntent.clientSecret,
  },
};
```

### Step 6: Test Payment Flow (2 hours)

**A. Test Cards**

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 9995
3D Secure: 4000 0025 0000 3155
```

**B. Manual Testing**

1. Create order
2. Get payment intent
3. Use test card
4. Verify webhook received
5. Check order status updated

**C. Automated Testing**

```bash
# Unit tests
npm run test -- payment.service

# Integration tests
npm run test -- api/payments

# E2E tests
npm run test:e2e -- payment-flow
```

### Step 7: Test Webhooks (1 hour)

**Install Stripe CLI:**

```bash
# Windows
scoop install stripe

# Mac
brew install stripe/stripe-cli/stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

**Test Webhooks:**

```bash
# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

### Step 8: Implement Refunds (2 hours)

Add to order cancellation flow:

```typescript
// In cancelOrder action
if (order.paymentStatus === "PAID" && order.paymentIntentId) {
  await paymentService.createRefund(order.paymentIntentId);
}
```

Test refund flow:

1. Create paid order
2. Cancel order
3. Verify refund created in Stripe
4. Verify order status updated

---

## ✅ COMPLETION CHECKLIST

### Phase 1: Setup (30 min)

- [ ] Stripe test account created
- [ ] API keys added to .env.local
- [ ] Stripe SDK verified installed

### Phase 2: Service Layer (2 hours)

- [ ] PaymentService class created
- [ ] createPaymentIntent() implemented
- [ ] confirmPayment() implemented
- [ ] createRefund() implemented
- [ ] Unit tests passing

### Phase 3: API Routes (3 hours)

- [ ] Payment intent route created
- [ ] Webhook route created
- [ ] Event handlers implemented
- [ ] Error handling added
- [ ] Integration tests passing

### Phase 4: Integration (2 hours)

- [ ] Order creation flow updated
- [ ] Payment intent created on order
- [ ] Client-side payment ready
- [ ] Flow tested end-to-end

### Phase 5: Webhooks (1 hour)

- [ ] Stripe CLI installed
- [ ] Webhook forwarding tested
- [ ] Payment success handled
- [ ] Payment failure handled
- [ ] Refund handled

### Phase 6: Refunds (2 hours)

- [ ] Refund on cancellation implemented
- [ ] Refund webhook handling
- [ ] Partial refunds supported
- [ ] Refund tests passing

### Phase 7: Testing (2 hours)

- [ ] All test cards tested
- [ ] Success flow verified
- [ ] Decline flow verified
- [ ] Refund flow verified
- [ ] Error cases handled

---

## 🧪 TESTING COMMANDS

```bash
# Unit tests
npm run test -- payment.service

# Integration tests
npm run test -- api/payments
npm run test -- api/webhooks

# E2E tests
npm run test:e2e -- payment-flow

# All payment tests
npm run test -- payment

# With coverage
npm run test:coverage -- payment
```

---

## 🔍 VERIFICATION

After completion, verify:

```bash
# 1. All tests pass
npm run test

# 2. Build succeeds
npm run build

# 3. Type check passes
npm run type-check

# 4. No ESLint errors
npm run lint
```

**Expected Results:**

- ✅ All payment tests passing
- ✅ Integration with orders working
- ✅ Webhooks processing correctly
- ✅ Refunds functioning
- ✅ Zero errors

---

## 📊 SUCCESS METRICS

After this session, you should have:

- Payment integration: 0% → 100% ✅
- New API routes: +3
- New service: PaymentService
- Test coverage: +20 tests
- Overall progress: 37.2% → 57.2%

---

## 🚨 COMMON ISSUES

### Issue: Webhook signature fails

**Fix:** Check STRIPE_WEBHOOK_SECRET is set correctly

### Issue: Payment intent creation fails

**Fix:** Verify STRIPE*SECRET_KEY starts with `sk_test*`

### Issue: Webhooks not received

**Fix:** Make sure Stripe CLI is running with `stripe listen`

### Issue: Amount mismatch

**Fix:** Remember to multiply by 100 for cents

---

## 📚 HELPFUL RESOURCES

- Stripe Docs: https://stripe.com/docs
- Test Cards: https://stripe.com/docs/testing
- Webhooks Guide: https://stripe.com/docs/webhooks
- API Reference: https://stripe.com/docs/api

---

## ⏭️ AFTER PAYMENT INTEGRATION

When payment integration is complete:

1. **Commit your work:**

   ```bash
   git add .
   git commit -m "feat: Implement complete Stripe payment integration

   - Add PaymentService with intent creation and refunds
   - Create payment API routes and webhook handlers
   - Integrate with order creation flow
   - Add comprehensive tests

   Tests: +20 payment tests
   Coverage: Payment flow fully covered"
   ```

2. **Update progress:**
   Edit `SPRINT_COMPLETION_STATUS.md` → Mark payment integration 100%

3. **Move to next objective:**
   Open `ACTION_PLAN_NEXT_STEPS.md` → Week 4: Security Hardening

---

## 💡 PRO TIPS

1. **Test incrementally** - Test each piece as you build it
2. **Use Stripe Dashboard** - Monitor test payments in real-time
3. **Check webhook logs** - Stripe CLI shows webhook payloads
4. **Start simple** - Get basic flow working, then add features
5. **Read error messages** - Stripe has excellent error messages

---

## 🎯 TIME BOXING

Don't exceed these time limits:

- Setup: 30 min max
- Service: 2 hours max
- API Routes: 3 hours max
- Integration: 2 hours max
- Testing: 2 hours max

**Total: 12 hours max**

If you're stuck after 30 min on one issue, skip it and come back later.

---

## 📞 NEED HELP?

Check these in order:

1. This file (common issues section)
2. `ACTION_PLAN_NEXT_STEPS.md` (detailed examples)
3. `docs/STRIPE_SETUP_GUIDE.md` (configuration)
4. Stripe documentation (always helpful)
5. Error messages (usually point to the issue)

---

## 🚀 READY TO START?

**First command:**

```bash
# Open the payment service file
code src/lib/services/payment.service.ts

# Start dev server
npm run dev:omen
```

**Good luck! You've got this!** 💪

---

**Document Version:** 1.0  
**Created:** November 27, 2024  
**Next Update:** After payment integration complete  
**Estimated Completion:** 12 hours from now
