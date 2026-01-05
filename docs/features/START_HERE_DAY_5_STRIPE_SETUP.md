# 🚀 Day 5: Stripe Payment Integration - Quick Start Guide

**Status**: ✅ Complete - Ready for Configuration
**Date**: January 3, 2026

---

## 📋 Overview

This guide walks you through configuring and testing the Stripe payment integration that was implemented on Day 5.

---

## 🔑 Step 1: Get Stripe API Keys

### Create Stripe Account
1. Go to https://stripe.com
2. Click **Sign Up** (or **Sign In** if you have an account)
3. Complete registration

### Get Test Mode Keys
1. In Stripe Dashboard, ensure **Test mode** is enabled (toggle in top-right)
2. Navigate to **Developers** → **API Keys**
3. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

---

## 🔧 Step 2: Configure Environment Variables

### Update `.env.local`

Add these three variables to your `.env.local` file:

```env
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Important**:
- Replace `YOUR_SECRET_KEY_HERE` with your actual secret key
- Replace `YOUR_PUBLISHABLE_KEY_HERE` with your actual publishable key
- We'll get the webhook secret in Step 3

---

## 🪝 Step 3: Set Up Stripe Webhook (Local Testing)

### Option A: Using Stripe CLI (Recommended for Local Development)

#### 1. Install Stripe CLI
```bash
# Windows (using Scoop)
scoop install stripe

# macOS (using Homebrew)
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

#### 2. Login to Stripe CLI
```bash
stripe login
```

#### 3. Start Webhook Forwarding
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

#### 4. Copy Webhook Secret
The CLI will display a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Copy this secret and add it to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### 5. Keep CLI Running
Leave the Stripe CLI running in a terminal while testing. It will forward webhook events to your local server.

### Option B: Using ngrok (Alternative)

If you prefer ngrok for webhook testing:

```bash
# Start your Next.js server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL to set up webhook in Stripe Dashboard
# Example: https://abc123.ngrok.io/api/webhooks/stripe
```

Then configure webhook in Stripe Dashboard (see Step 4).

---

## 🌐 Step 4: Set Up Stripe Webhook (Production/Staging)

### For Deployed Environments

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
4. Select events to listen to:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
   - ✅ `charge.refunded`
   - ✅ `customer.created`
   - ✅ `payment_method.attached`

   Or select **Select all events** for comprehensive tracking

5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to your environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
   ```

---

## 🧪 Step 5: Test Payment Flow

### Start Development Server

```bash
npm run dev
```

### Test Checkout Flow

1. **Add Products to Cart**
   - Navigate to marketplace
   - Add products from one or more farms
   - Go to cart

2. **Start Checkout**
   - Click "Proceed to Checkout"
   - Complete shipping information
   - Complete delivery preferences

3. **Enter Payment Details** (Test Cards)

   Use these Stripe test cards:

   **✅ Successful Payment**
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/34 (any future date)
   CVC: 123 (any 3 digits)
   ZIP: 12345 (any ZIP)
   ```

   **❌ Card Declined**
   ```
   Card Number: 4000 0000 0000 0002
   Expiry: 12/34
   CVC: 123
   ```

   **🔒 3D Secure Authentication Required**
   ```
   Card Number: 4000 0025 0000 3155
   Expiry: 12/34
   CVC: 123
   ```

   **💰 Insufficient Funds**
   ```
   Card Number: 4000 0000 0000 9995
   Expiry: 12/34
   CVC: 123
   ```

4. **Review and Submit**
   - Review order details
   - Accept terms
   - Click "Place Order"

5. **Verify Success**
   - Should redirect to confirmation page
   - Check Stripe CLI output for webhook events
   - Check order status in database

---

## 🔍 Step 6: Verify Integration

### Check Stripe Dashboard

1. Go to **Payments** in Stripe Dashboard
2. You should see your test payment
3. Click on payment to see details and events

### Check Webhook Events

1. Go to **Developers** → **Webhooks** → Your endpoint
2. Click on recent events
3. Verify events were delivered successfully
4. Check response codes (should be 200)

### Check Database

```sql
-- Check order was created
SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 5;

-- Check payment record
SELECT * FROM "Payment" ORDER BY "createdAt" DESC LIMIT 5;

-- Verify order status was updated to CONFIRMED
SELECT id, "orderNumber", status, "paymentStatus", "paidAt"
FROM "Order"
WHERE "paymentStatus" = 'PAID'
ORDER BY "createdAt" DESC;
```

---

## 🐛 Troubleshooting

### Issue: "Stripe failed to initialize"

**Cause**: Missing or invalid Stripe keys

**Solution**:
1. Verify `STRIPE_SECRET_KEY` is set in `.env.local`
2. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
3. Restart Next.js server after adding env vars
4. Check keys are in correct format (`sk_test_xxx` and `pk_test_xxx`)

### Issue: "Payment Intent creation failed"

**Cause**: Invalid API key or network issue

**Solution**:
1. Check Stripe Dashboard → API Keys are correct
2. Ensure test mode keys match test mode in dashboard
3. Check server logs for detailed error message
4. Verify amount is positive number

### Issue: "Webhook signature verification failed"

**Cause**: Incorrect webhook secret or modified payload

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe CLI output
2. If using Stripe Dashboard webhook, copy signing secret from endpoint settings
3. Restart server after updating webhook secret
4. Check webhook is pointing to correct URL

### Issue: "Payment confirmed but order not updated"

**Cause**: Webhook not being received

**Solution**:
1. Check Stripe CLI is running and forwarding events
2. Verify webhook endpoint is accessible
3. Check webhook events in Stripe Dashboard
4. Look for errors in server logs
5. Manually trigger webhook from Stripe Dashboard

### Issue: "Elements not rendering"

**Cause**: Missing publishable key or network issue

**Solution**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
3. Restart dev server
4. Clear browser cache
5. Check network tab for Stripe API calls

---

## 📊 Monitoring Webhook Events

### Real-Time Monitoring

While Stripe CLI is running, you'll see webhook events in real-time:

```bash
2026-01-03 10:23:45  --> payment_intent.created [evt_xxx]
2026-01-03 10:23:47  --> payment_intent.succeeded [evt_yyy]
2026-01-03 10:23:48  <-- [200] POST http://localhost:3000/api/webhooks/stripe
```

### Check Webhook Logs

In your server logs, look for:
```
Processing Stripe webhook event: payment_intent.succeeded (evt_xxx)
Payment succeeded: pi_xxx
Successfully processed payment for order ord_xxx
```

---

## 🎯 Testing Scenarios

### 1. Successful Payment Flow
- Use card `4242 4242 4242 4242`
- Complete checkout
- Verify order created
- Verify webhook received
- Verify order status = CONFIRMED
- Verify payment status = PAID

### 2. Card Declined
- Use card `4000 0000 0000 0002`
- Complete checkout
- Verify payment fails
- Verify error message displayed
- Verify order not created or cancelled

### 3. 3D Secure Flow
- Use card `4000 0025 0000 3155`
- Complete checkout
- Verify 3D Secure popup appears
- Complete authentication
- Verify payment succeeds

### 4. Webhook Failure Recovery
- Stop Stripe CLI
- Complete payment
- Start Stripe CLI again
- Manually trigger webhook from Stripe Dashboard
- Verify order updated

---

## 📁 Key Files Reference

### Configuration Files
- `.env.local` - Environment variables
- `src/lib/services/stripe.service.ts` - Stripe service layer
- `src/lib/client/stripe.ts` - Client-side utilities

### API Endpoints
- `POST /api/checkout/payment-intent` - Create payment intent
- `GET /api/checkout/payment-intent?paymentIntentId=xxx` - Get payment status
- `POST /api/webhooks/stripe` - Webhook handler
- `POST /api/orders/[orderId]/payment` - Link payment to order

### Components
- `src/components/features/checkout/payment-step.tsx` - Payment form
- `src/components/features/checkout/review-step.tsx` - Payment confirmation

---

## 🚀 Going to Production

### Checklist Before Production

- [ ] Switch to Stripe Live mode keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real card in test mode
- [ ] Set up Stripe Radar for fraud prevention
- [ ] Configure email receipts in Stripe
- [ ] Set up payment failure notifications
- [ ] Enable 3D Secure for all payments
- [ ] Test refund flow
- [ ] Set up monitoring and alerts
- [ ] Document runbook for payment issues

### Get Production Keys

1. In Stripe Dashboard, toggle to **Live mode**
2. Navigate to **Developers** → **API Keys**
3. Copy Live keys (start with `pk_live_` and `sk_live_`)
4. Update production environment variables
5. Set up production webhook endpoint
6. Test thoroughly before enabling for customers

---

## 🎓 Additional Resources

### Stripe Documentation
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Elements](https://stripe.com/docs/payments/elements)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

### Test Cards
- [Full list of test cards](https://stripe.com/docs/testing#cards)
- [Test 3D Secure](https://stripe.com/docs/testing#regulatory-cards)

### Stripe CLI
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Payment form loads with Stripe Elements
2. ✅ Test card is accepted
3. ✅ Payment is confirmed
4. ✅ Webhook events are received and processed
5. ✅ Order status updates to CONFIRMED
6. ✅ Payment record shows PAID status
7. ✅ Confirmation page displays
8. ✅ Customer receives confirmation (if email is set up)

---

## 🎉 You're Ready!

Once you've completed these steps:
- Payment integration is fully functional
- Webhooks are processing correctly
- Orders are being created and confirmed
- You're ready for user testing

**Next Steps**:
- Implement saved payment methods UI
- Add payment analytics
- Set up refund flow
- Deploy to staging for testing

---

**Need Help?**
- Check server logs in terminal
- Check browser console for client errors
- Review Stripe Dashboard event logs
- Check webhook delivery attempts
- Verify all environment variables are set

---

*Divine Agricultural Platform - Payment Integration Setup Complete* 🌾💳✨
