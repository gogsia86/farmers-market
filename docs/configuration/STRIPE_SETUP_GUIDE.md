# 🚀 Stripe Payment Setup Guide

**Version**: 2.0.0 - Full Stripe Integration  
**Last Updated**: November 2024

Complete guide for setting up Stripe payment processing with webhook support.

---

## 📋 Table of Contents

1. [Environment Variables Configuration](#environment-variables-configuration)
2. [Webhook Setup](#webhook-setup)
3. [Testing Payment Flow](#testing-payment-flow)
4. [Webhook Testing](#webhook-testing)
5. [Production Setup](#production-setup)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## **1. Environment Variables Configuration**

### **Step 1: Get Your Stripe Keys**

1. **Sign up/Login to Stripe**: Visit [https://stripe.com](https://stripe.com)
2. **Navigate to Developers → API Keys**
3. **Copy your keys**:
   - **Publishable Key** (starts with `pk_test_` for test mode)
   - **Secret Key** (starts with `sk_test_` for test mode)

### **Step 2: Update Environment Variables**

Add these to your `.env.local` file:

```env
# Stripe API Keys
STRIPE_SECRET_KEY="sk_test_your_actual_stripe_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_stripe_publishable_key_here"

# Stripe Webhook Secret (get this in Step 3)
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

⚠️ **Important**: Use `.env.local` for local development (git-ignored by default)

---

## **2. Webhook Setup**

Webhooks allow Stripe to notify your application about payment events in real-time.

### **For Local Development**

#### **Step 1: Install Stripe CLI**

**Windows (PowerShell):**

```powershell
scoop install stripe
```

**macOS:**

```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**

```bash
# Download from https://github.com/stripe/stripe-cli/releases
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

#### **Step 2: Login to Stripe CLI**

```bash
stripe login
```

This will open your browser to authorize the CLI.

#### **Step 3: Forward Webhooks to Local Server**

```bash
# Make sure your dev server is running on port 3001
npm run dev:omen

# In a separate terminal, forward webhooks
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Copy the webhook signing secret that appears (starts with `whsec_`) and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET="whsec_xyz123..."
```

### **For Production**

#### **Step 1: Configure Webhook Endpoint**

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
   - ✅ `payment_intent.processing`
   - ✅ `charge.refunded`
   - ✅ `refund.created`
   - ✅ `refund.updated`

#### **Step 2: Get Production Webhook Secret**

1. After creating the endpoint, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add it to your production environment variables

---

## **3. Testing Payment Flow**

### **Stripe Test Cards**

Use these test card numbers in development:

| Card Number           | Scenario           | Use Case                 |
| --------------------- | ------------------ | ------------------------ |
| `4242 4242 4242 4242` | Success            | Standard payment success |
| `4000 0025 0000 3155` | 3D Secure Required | Test 3DS authentication  |
| `4000 0000 0000 9995` | Declined           | Insufficient funds       |
| `4000 0000 0000 0002` | Declined           | Card declined            |
| `4000 0000 0000 9987` | Declined           | Lost card                |
| `4000 0000 0000 0069` | Expired            | Expired card             |
| `4000 0000 0000 0127` | Incorrect CVC      | Wrong security code      |

**Additional Details for Test Cards:**

- **Expiration**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### **Manual Testing Steps**

1. **Start Development Server**

   ```bash
   npm run dev:omen
   ```

2. **Create an Order**
   - Browse products
   - Add items to cart
   - Proceed to checkout

3. **Test Payment Intent Creation**

   ```bash
   # API endpoint test
   curl -X POST http://localhost:3001/api/payments/intent \
     -H "Content-Type: application/json" \
     -d '{"orderId": "your-order-id"}'
   ```

4. **Complete Payment with Test Card**
   - Use `4242 4242 4242 4242`
   - Enter any future expiration
   - Enter any 3-digit CVC

5. **Verify Order Status**
   - Check order status updated to "CONFIRMED"
   - Check payment status updated to "PAID"
   - Verify `paidAt` timestamp is set

---

## **4. Webhook Testing**

### **Automated Webhook Testing**

Use Stripe CLI to trigger test webhook events:

```bash
# Make sure webhooks are being forwarded
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# In another terminal, trigger events:

# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded

# Test payment requiring action
stripe trigger payment_intent.requires_action
```

### **Manual Webhook Testing**

1. **Create Real Payment Intent**

   ```bash
   npm run dev:omen
   # Create an order through the UI
   ```

2. **Monitor Webhook Events**

   ```bash
   # Terminal 1: Forward webhooks
   stripe listen --forward-to localhost:3001/api/webhooks/stripe

   # Terminal 2: Watch server logs
   npm run dev:omen
   ```

3. **Complete Payment**
   - Use test card `4242 4242 4242 4242`
   - Watch webhook events arrive in both terminals
   - Verify database updates

### **Verify Webhook Processing**

Check that webhooks are properly handled:

```bash
# Health check endpoint
curl http://localhost:3001/api/webhooks/stripe

# Should return:
# {
#   "status": "ok",
#   "endpoint": "stripe-webhooks",
#   "message": "Stripe webhook endpoint is operational"
# }
```

---

## **5. Production Setup**

### **Pre-Deployment Checklist**

- [ ] Switch to live Stripe API keys (start with `pk_live_` and `sk_live_`)
- [ ] Configure production webhook endpoint in Stripe Dashboard
- [ ] Add production `STRIPE_WEBHOOK_SECRET` to environment variables
- [ ] Test webhook endpoint is accessible from internet
- [ ] Enable HTTPS (required for production webhooks)
- [ ] Configure proper error monitoring (Sentry is already integrated)
- [ ] Set up payment failure notifications
- [ ] Document refund procedures

### **Environment Variables for Production**

```env
# Production Stripe Keys
STRIPE_SECRET_KEY="sk_live_your_production_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_production_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_production_webhook_secret"
```

### **Webhook Endpoint Requirements**

- ✅ Must be publicly accessible
- ✅ Must use HTTPS (SSL/TLS)
- ✅ Must respond within 30 seconds
- ✅ Must return 2xx status code
- ✅ Should be idempotent (handle duplicate events)

---

## **6. Security Best Practices**

### **✅ DO:**

- ✅ Use environment variables for all secrets
- ✅ Verify webhook signatures (implemented in PaymentService)
- ✅ Use HTTPS in production
- ✅ Keep Stripe SDK updated
- ✅ Log payment events for auditing
- ✅ Implement rate limiting on payment endpoints
- ✅ Use test mode for all development/staging
- ✅ Rotate API keys periodically
- ✅ Monitor failed payment attempts
- ✅ Implement proper error handling

### **❌ DON'T:**

- ❌ Never commit API keys to git
- ❌ Never expose secret keys in client-side code
- ❌ Never trust client-side payment amounts (always verify server-side)
- ❌ Never skip webhook signature verification
- ❌ Never use production keys in development
- ❌ Never hardcode payment amounts
- ❌ Never log sensitive card details
- ❌ Never process payments without authentication

### **Key Security Features Already Implemented:**

1. **Webhook Signature Verification**: All webhooks verified before processing
2. **Authentication Required**: Payment endpoints require valid session
3. **Authorization Checks**: Users can only create payments for their own orders
4. **Input Validation**: Zod schemas validate all payment requests
5. **Error Handling**: Comprehensive error handling with proper status codes
6. **Idempotent Operations**: Webhook handlers are idempotent

---

## **7. Troubleshooting**

### **Common Issues**

#### **"STRIPE_SECRET_KEY is not configured"**

**Solution:**

- Verify `.env.local` file exists
- Check key starts with `sk_test_` or `sk_live_`
- Restart development server after adding keys

#### **"Webhook signature verification failed"**

**Solution:**

- Verify `STRIPE_WEBHOOK_SECRET` is correctly set
- Ensure webhook secret matches the endpoint
- For local dev, make sure `stripe listen` is running
- Check that request body is not being modified/parsed before verification

#### **"Order not found"**

**Solution:**

- Verify order exists in database
- Check orderId is valid UUID format
- Ensure order belongs to authenticated user

#### **"Payment intent creation failed"**

**Solution:**

- Check Stripe API key is valid
- Verify internet connection
- Check Stripe dashboard for API errors
- Review server logs for detailed error messages

#### **Webhooks not received locally**

**Solution:**

```bash
# 1. Check Stripe CLI is running
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# 2. Verify dev server is on port 3001
npm run dev:omen

# 3. Test webhook endpoint directly
curl http://localhost:3001/api/webhooks/stripe
```

#### **Payment succeeded but order not updated**

**Solution:**

- Check webhook events are being received (Stripe Dashboard → Developers → Events)
- Verify webhook handler is processing events correctly
- Check server logs for errors in `handlePaymentSuccess`
- Ensure database connection is working

### **Debugging Tools**

#### **Check Stripe Logs**

View Stripe API logs:

1. Go to [Stripe Dashboard → Developers → Logs](https://dashboard.stripe.com/logs)
2. Filter by your API key
3. Look for errors or failed requests

#### **Monitor Webhook Events**

View webhook delivery status:

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your endpoint
3. View recent deliveries and any failures

#### **Local Debugging**

```bash
# Terminal 1: Dev server with verbose logging
npm run dev:omen

# Terminal 2: Stripe CLI with logging
stripe listen --forward-to localhost:3001/api/webhooks/stripe --log-level debug

# Terminal 3: Test API endpoints
curl -X POST http://localhost:3001/api/payments/intent \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"orderId": "test-order-id"}'
```

---

## **🎉 Payment System Ready!**

Once configured, your payment flow will be:

```
1. Customer creates order
2. System creates Stripe payment intent
3. Customer enters card details
4. Stripe processes payment
5. Webhook confirms success
6. Order status updated to CONFIRMED
7. Customer receives confirmation
```

### **API Endpoints**

- **Create Payment Intent**: `POST /api/payments/intent`
- **Get Payment Details**: `GET /api/payments/intent?orderId=xxx`
- **Webhook Handler**: `POST /api/webhooks/stripe`

### **Testing Checklist**

- [ ] Payment intent creation works
- [ ] Successful payment updates order status
- [ ] Failed payment is handled gracefully
- [ ] Refunds process correctly
- [ ] Webhooks are received and processed
- [ ] All test cards work as expected
- [ ] Authorization prevents unauthorized payments
- [ ] Error messages are clear and helpful

---

## **📚 Additional Resources**

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)

---

**Divine Status**: ✅ **FULL PAYMENT SYSTEM OPERATIONAL**  
**Version**: 2.0.0 - Complete Stripe Integration with Webhooks
