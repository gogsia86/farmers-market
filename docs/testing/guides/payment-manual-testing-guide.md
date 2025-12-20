# 🧪 Payment Integration - Manual Testing Guide

## 🎯 Priority 2: Manual Testing with Stripe CLI

**Status**: Ready to Start  
**Estimated Time**: 1 hour  
**Prerequisites**: Priority 1 Complete ✅

---

## 📋 Overview

This guide walks through manual testing of the Stripe payment integration using the Stripe CLI to simulate webhooks locally. We'll test the complete payment flow from order creation to payment confirmation.

---

## 🚀 Setup Instructions

### Step 1: Install Stripe CLI

**Windows (via Scoop)**:

```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Or download directly**: https://stripe.com/docs/stripe-cli

**Verify installation**:

```bash
stripe --version
```

### Step 2: Login to Stripe

```bash
stripe login
```

This will open your browser to authenticate. Make sure you're logged into your Stripe test account.

### Step 3: Get Test API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Step 4: Configure Environment Variables

Create or update `.env.local`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Database (ensure these are set)
DATABASE_URL=postgresql://user:password@localhost:5432/farmers_market
DIRECT_URL=postgresql://user:password@localhost:5432/farmers_market

# NextAuth (ensure these are set)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here
```

**Note**: We'll get the `STRIPE_WEBHOOK_SECRET` in the next step.

---

## 🎬 Testing Workflow

### Step 1: Start the Development Server

```bash
npm run dev:omen
```

Server should start on `http://localhost:3001`

### Step 2: Start Stripe CLI Webhook Forwarding

Open a **new terminal** and run:

```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**Expected output**:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy the webhook secret** (`whsec_...`) and update your `.env.local` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Restart your dev server** after updating the environment variable.

### Step 3: Verify Webhook Endpoint Health

Test the webhook endpoint health check:

```bash
curl http://localhost:3001/api/webhooks/stripe
```

**Expected response**:

```json
{
  "status": "ok",
  "message": "Stripe webhook endpoint is active"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Successful Payment Flow

#### 1.1 Create an Order

Use the API or database to create a test order:

```bash
# Example using curl (adjust based on your auth setup)
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "your-farm-id",
    "items": [
      {
        "productId": "product-id",
        "quantity": 2,
        "unitPrice": 25.00
      }
    ],
    "fulfillmentMethod": "PICKUP"
  }'
```

**Save the order ID** from the response.

#### 1.2 Create Payment Intent

```bash
curl -X POST http://localhost:3001/api/payments/intent \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID_HERE",
    "amount": 50.00,
    "currency": "usd"
  }'
```

**Expected response**:

```json
{
  "success": true,
  "data": {
    "id": "pi_xxxxxxxxxxxxx",
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 50.0,
    "currency": "usd",
    "status": "requires_payment_method",
    "orderId": "order-123"
  }
}
```

**Save the `id`** (payment intent ID).

#### 1.3 Simulate Payment Success

Use Stripe CLI to trigger a successful payment event:

```bash
stripe trigger payment_intent.succeeded
```

Or trigger with specific payment intent:

```bash
stripe events trigger payment_intent.succeeded \
  --override payment_intent:id=pi_YOUR_PAYMENT_INTENT_ID \
  --override payment_intent:metadata:orderId=your-order-id
```

#### 1.4 Verify Order Status

Check that the order was updated to PAID:

```bash
# Check database or use API
curl http://localhost:3001/api/payments/intent?orderId=ORDER_ID_HERE
```

**Expected**: Order status should be `PAID`, `paidAt` should be set.

---

### Scenario 2: Payment Failure

#### 2.1 Use Decline Test Card

Stripe test card for decline: `4000 0000 0000 0002`

Create payment intent and attempt payment with this card (through UI or API).

#### 2.2 Trigger Payment Failed Event

```bash
stripe trigger payment_intent.payment_failed
```

#### 2.3 Verify Order Status

**Expected**: Order `paymentStatus` should be `FAILED`.

---

### Scenario 3: Payment Refund

#### 3.1 Create a Successful Payment First

Follow Scenario 1 to create a successful payment.

#### 3.2 Create Refund

```bash
curl -X POST http://localhost:3001/api/payments/refund \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_xxxxxxxxxxxxx",
    "amount": 50.00,
    "reason": "requested_by_customer"
  }'
```

**Or use Stripe CLI**:

```bash
stripe trigger charge.refunded
```

#### 3.3 Verify Refund Processed

**Expected**:

- Order `paymentStatus` should be `REFUNDED`
- `refundedAt` should be set

---

### Scenario 4: 3D Secure Authentication

#### 4.1 Use 3D Secure Test Card

Stripe 3D Secure test card: `4000 0027 6000 3184`

This card requires authentication.

#### 4.2 Create Payment Intent

Create payment intent as usual.

#### 4.3 Handle Authentication

The payment will require additional authentication. Stripe will send:

- `payment_intent.requires_action` event

After authentication:

- `payment_intent.succeeded` event

---

## 🔍 Monitoring & Debugging

### Watch Webhook Events in Real-Time

The Stripe CLI shows all webhook events:

```
2024-11-15 12:34:56 --> payment_intent.created [evt_xxx]
2024-11-15 12:35:01 --> payment_intent.succeeded [evt_yyy]
2024-11-15 12:35:02 <-- [200] POST http://localhost:3001/api/webhooks/stripe
```

### Check Application Logs

Watch your dev server logs for:

- Payment intent creation
- Webhook signature verification
- Order status updates
- Error messages

### Common Log Messages

**Success**:

```
Payment successful for order order-123 { paymentIntentId: 'pi_xxx', amount: 50.00 }
```

**Failure**:

```
Payment failed for order order-123 { paymentIntentId: 'pi_xxx', lastPaymentError: 'Card declined' }
```

**Refund**:

```
Refund processed for order order-123 { paymentIntentId: 'pi_xxx', amount: 50.00 }
```

---

## 🎴 Stripe Test Cards

### Success Cards

| Card Number         | Description                     |
| ------------------- | ------------------------------- |
| 4242 4242 4242 4242 | Successful payment (Visa)       |
| 5555 5555 5555 4444 | Successful payment (Mastercard) |

### Decline Cards

| Card Number         | Decline Reason     |
| ------------------- | ------------------ |
| 4000 0000 0000 0002 | Generic decline    |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 0069 | Expired card       |
| 4000 0000 0000 0127 | Incorrect CVC      |

### Special Test Cards

| Card Number         | Behavior                          |
| ------------------- | --------------------------------- |
| 4000 0027 6000 3184 | Requires 3D Secure authentication |
| 4000 0025 0000 3155 | 3D Secure 2 required              |
| 4000 0000 0000 0341 | Attaching this card requires SCA  |

**For all test cards**:

- Use any future expiration date
- Use any 3-digit CVC
- Use any billing ZIP code

---

## ✅ Test Checklist

Use this checklist to track your testing progress:

### Payment Intent Creation

- [ ] Create payment intent successfully
- [ ] Payment intent has correct amount (in cents)
- [ ] Payment intent includes order metadata
- [ ] Order is updated with payment intent ID
- [ ] Client secret is returned

### Successful Payment

- [ ] Webhook received for `payment_intent.succeeded`
- [ ] Webhook signature verified
- [ ] Order status updated to `PAID`
- [ ] `paidAt` timestamp set correctly
- [ ] Order `status` changed to `CONFIRMED`

### Failed Payment

- [ ] Webhook received for `payment_intent.payment_failed`
- [ ] Order status updated to `FAILED`
- [ ] Error message logged

### Refund Processing

- [ ] Create refund API works
- [ ] Full refund processes correctly
- [ ] Partial refund processes correctly
- [ ] Webhook received for `charge.refunded`
- [ ] Order status updated to `REFUNDED`
- [ ] `refundedAt` timestamp set

### Edge Cases

- [ ] Duplicate payment intents handled (returns existing)
- [ ] Invalid order ID throws error
- [ ] Zero/negative amounts rejected
- [ ] Missing webhook secret throws error
- [ ] Invalid webhook signature rejected

---

## 🚨 Common Issues & Solutions

### Issue 1: Webhook signature verification fails

**Error**: `Webhook signature verification failed`

**Solutions**:

- Restart dev server after updating `STRIPE_WEBHOOK_SECRET`
- Ensure Stripe CLI is forwarding to correct port
- Check that webhook secret matches CLI output

### Issue 2: Payment intent not found

**Error**: `Order not found` or `Payment intent not found`

**Solutions**:

- Verify order exists in database
- Check order ID is correct
- Ensure database connection is working

### Issue 3: Webhook endpoint not receiving events

**Solutions**:

- Verify dev server is running on correct port (3001)
- Check Stripe CLI is forwarding webhooks
- Test health endpoint: `GET /api/webhooks/stripe`
- Check firewall/network settings

### Issue 4: Amount mismatch

**Issue**: Payment intent amount doesn't match order total

**Solutions**:

- Remember: Stripe uses cents (multiply by 100)
- Service layer converts back to dollars (divide by 100)
- Check order total calculation

---

## 📊 Expected Results Summary

### API Endpoints

| Endpoint                       | Method | Auth | Expected Response          |
| ------------------------------ | ------ | ---- | -------------------------- |
| `/api/payments/intent`         | POST   | Yes  | Payment intent with secret |
| `/api/payments/intent?orderId` | GET    | Yes  | Order and payment details  |
| `/api/webhooks/stripe`         | POST   | No\* | 200 OK (sig verified)      |
| `/api/webhooks/stripe`         | GET    | No   | Health check OK            |

\*Requires valid Stripe signature

### Database Updates

**After successful payment**:

```prisma
Order {
  paymentIntentId: "pi_xxxxxxxxxxxxx"
  paymentStatus: "PAID"
  status: "CONFIRMED"
  paidAt: DateTime
}
```

**After refund**:

```prisma
Order {
  paymentStatus: "REFUNDED"
  refundedAt: DateTime
}
```

---

## 🎯 Success Criteria

✅ **Priority 2 is complete when**:

- [x] All test scenarios pass
- [x] Webhooks received and processed correctly
- [x] Order statuses update as expected
- [x] No errors in application logs
- [x] All checklist items verified
- [x] Edge cases handled gracefully

---

## 📝 Next Steps

After completing manual testing:

### Priority 3: Integration Tests (3 hours)

- Write integration tests for full payment flows
- Test with Stripe test mode
- Mock webhook events
- Verify database state changes

### Priority 4: E2E Tests (4 hours)

- Playwright tests for checkout UI
- Test with Stripe test cards
- Verify order flow end-to-end
- Test error scenarios in UI

---

## 📚 Additional Resources

- **Stripe Testing Guide**: https://stripe.com/docs/testing
- **Stripe CLI Docs**: https://stripe.com/docs/cli
- **Webhook Events**: https://stripe.com/docs/api/events/types
- **Test Cards**: https://stripe.com/docs/testing#cards
- **Local Setup Guide**: `docs/STRIPE_SETUP_GUIDE.md`

---

## 🆘 Need Help?

### Debugging Commands

```bash
# View recent Stripe events
stripe events list --limit 10

# Trigger specific event with data
stripe events trigger payment_intent.succeeded --help

# Test webhook signature
stripe webhooks test-signature

# View Stripe CLI logs
stripe logs tail
```

### Check Service Health

```bash
# TypeScript compilation
npx tsc --noEmit

# Run unit tests
npm test -- payment.service.test.ts

# Check database connection
npx prisma db pull
```

---

**Status**: Ready to test 🚀  
**Last Updated**: Current Session  
**Next**: Priority 3 - Integration Tests

_"Manual testing manifests divine payment reliability through quantum webhook consciousness"_ 💳⚡
