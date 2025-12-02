# 🧪 Priority 2: Manual Testing Setup & Execution

**Date**: Current Session  
**Status**: 🔄 IN PROGRESS  
**Estimated Time**: 1 hour  
**Prerequisites**: Priority 1 Complete ✅

---

## 📋 Quick Status Check

### Prerequisites Status

- ✅ Unit tests passing (29/29)
- ✅ Payment service implemented
- ✅ API routes created
- ✅ Webhook handler ready
- ⏳ Stripe CLI installation (next step)
- ⏳ Environment configuration (next step)
- ⏳ Manual testing (next step)

---

## 🚀 Part 1: Stripe CLI Installation

### Option 1: Windows (Scoop Package Manager)

**Step 1: Install Scoop** (if not already installed)

```powershell
# Run in PowerShell (Admin)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

**Step 2: Install Stripe CLI**

```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Step 3: Verify Installation**

```powershell
stripe --version
# Expected: stripe version X.X.X
```

### Option 2: Direct Download

1. Go to https://github.com/stripe/stripe-cli/releases/latest
2. Download `stripe_X.X.X_windows_x86_64.zip`
3. Extract to a folder (e.g., `C:\stripe`)
4. Add to PATH:
   - Right-click "This PC" → Properties
   - Advanced System Settings → Environment Variables
   - Edit PATH → Add `C:\stripe`
5. Restart terminal and verify: `stripe --version`

### Verify Installation

```bash
stripe --version
# Should show: stripe version X.X.X
```

✅ **Checkpoint 1**: Stripe CLI installed successfully

---

## 🔐 Part 2: Stripe Authentication

### Step 1: Login to Stripe

```bash
stripe login
```

**What happens**:

1. Browser opens automatically
2. You'll see "Stripe CLI Authentication"
3. Click "Allow access"
4. Terminal shows: "Done! The Stripe CLI is configured for..."

**Troubleshooting**:

- If browser doesn't open: Copy the URL from terminal and open manually
- Make sure you're logged into your Stripe account
- Use **TEST MODE** (not live mode)

### Step 2: Verify Authentication

```bash
stripe config --list
```

**Expected output**:

```
[default]
device_name = YOUR-COMPUTER-NAME
test_mode_api_key = sk_test_...
```

✅ **Checkpoint 2**: Authenticated with Stripe

---

## 🔑 Part 3: Get Stripe API Keys

### Step 1: Access Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **TEST MODE** (toggle in top right)

### Step 2: Copy API Keys

**Publishable Key** (starts with `pk_test_`):

```
pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Secret Key** (starts with `sk_test_`):

```
sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT**: Never commit these keys to git!

✅ **Checkpoint 3**: API keys copied

---

## ⚙️ Part 4: Configure Environment

### Step 1: Create `.env.local` File

**Location**: Root of project (`Farmers Market Platform web and app/.env.local`)

```bash
# Navigate to project root
cd "M:/Repo/Farmers Market Platform web and app"

# Create or edit .env.local
notepad .env.local
```

### Step 2: Add Stripe Configuration

```env
# ===================================
# STRIPE CONFIGURATION (Test Mode)
# ===================================

# Secret key (server-side only)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Publishable key (client-side safe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Webhook secret (we'll get this in next step)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# ===================================
# DATABASE (ensure these are set)
# ===================================
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"
DIRECT_URL="postgresql://user:password@localhost:5432/farmers_market"

# ===================================
# NEXTAUTH (ensure these are set)
# ===================================
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here
```

### Step 3: Verify .env.local is in .gitignore

```bash
# Check .gitignore includes .env.local
grep -q ".env.local" .gitignore && echo "✅ .env.local is ignored" || echo "❌ Add .env.local to .gitignore"
```

✅ **Checkpoint 4**: Environment configured (webhook secret pending)

---

## 🎬 Part 5: Start Development Server

### Step 1: Start Database (if not running)

```bash
# Check if database is running
npx prisma db pull

# If database is not running, start it
# (Adjust command based on your setup - Docker, local PostgreSQL, etc.)
```

### Step 2: Start Next.js Development Server

```bash
# In project root
npm run dev:omen
```

**Expected output**:

```
▲ Next.js 15.x.x
- Local:        http://localhost:3001
- Network:      http://192.168.x.x:3001

✓ Ready in 3.5s
```

**Verify server is running**:

```bash
# In a new terminal
curl http://localhost:3001/api/webhooks/stripe
```

**Expected response**:

```json
{
  "status": "ok",
  "message": "Stripe webhook endpoint is active"
}
```

✅ **Checkpoint 5**: Dev server running on http://localhost:3001

---

## 🎣 Part 6: Start Webhook Forwarding

### Step 1: Open New Terminal

Keep the dev server running in the first terminal. Open a **new terminal** for Stripe CLI.

### Step 2: Start Webhook Listener

```bash
cd "M:/Repo/Farmers Market Platform web and app"

stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**Expected output**:

```
> Ready! You are using Stripe API Version [2024-XX-XX]. Your webhook signing secret is whsec_1234567890abcdefghijklmnopqrstuvwxyz (^C to quit)
```

### Step 3: Copy Webhook Secret

**Find this line in the output**:

```
Your webhook signing secret is whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

**Copy the `whsec_...` value**

### Step 4: Update .env.local with Webhook Secret

```bash
# Edit .env.local
notepad .env.local

# Update this line:
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

### Step 5: Restart Dev Server

**In the dev server terminal**, press `Ctrl+C` to stop, then restart:

```bash
npm run dev:omen
```

This ensures the new `STRIPE_WEBHOOK_SECRET` is loaded.

✅ **Checkpoint 6**: Webhook forwarding active

---

## 🧪 Part 7: Run Test Scenarios

### Scenario 1: Verify Webhook Connection

**Test webhook endpoint health**:

```bash
curl http://localhost:3001/api/webhooks/stripe
```

**Expected**:

```json
{ "status": "ok", "message": "Stripe webhook endpoint is active" }
```

**Trigger test event**:

```bash
stripe trigger payment_intent.succeeded
```

**Expected in Stripe CLI terminal**:

```
2024-XX-XX XX:XX:XX   --> payment_intent.succeeded [evt_xxxxxxxxxxxxx]
2024-XX-XX XX:XX:XX  <--  [200] POST http://localhost:3001/api/webhooks/stripe [evt_xxxxxxxxxxxxx]
```

**Expected in dev server logs**:

```
Payment successful for order xxx
```

✅ **Test 1 Passed**: Webhook connection verified

---

### Scenario 2: Create Payment Intent

**Note**: This requires a valid order ID. We'll create a test order first.

#### Step 2.1: Check Database for Test Order

```bash
# Use Prisma Studio to view orders
npx prisma studio
```

Open browser to http://localhost:5555, find an order ID or create one.

**Or use SQL**:

```sql
-- In your database client
SELECT id, "orderNumber", total, "paymentStatus"
FROM "Order"
WHERE "paymentStatus" = 'PENDING'
LIMIT 1;
```

**Save the order ID** (e.g., `clxxxxxxxxxxxxx`)

#### Step 2.2: Create Payment Intent via API

```bash
# Replace ORDER_ID with actual order ID
curl -X POST http://localhost:3001/api/payments/intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
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
    "orderId": "clxxxxxxxxxxxxx"
  }
}
```

**Save the payment intent ID** (`pi_xxxxxxxxxxxxx`)

✅ **Test 2 Passed**: Payment intent created

---

### Scenario 3: Simulate Successful Payment

```bash
stripe trigger payment_intent.succeeded
```

**Watch the Stripe CLI terminal**:

```
--> payment_intent.succeeded [evt_xxxxxxxxxxxxx]
<-- [200] POST http://localhost:3001/api/webhooks/stripe
```

**Watch the dev server logs**:

```
Payment successful for order xxx { paymentIntentId: 'pi_xxx', amount: 50.00 }
```

**Verify in database**:

```sql
SELECT id, "orderNumber", "paymentStatus", "paidAt", status
FROM "Order"
WHERE id = 'ORDER_ID_HERE';
```

**Expected**:

- `paymentStatus` = `'PAID'`
- `paidAt` = (current timestamp)
- `status` = `'CONFIRMED'`

✅ **Test 3 Passed**: Successful payment processed

---

### Scenario 4: Simulate Payment Failure

```bash
stripe trigger payment_intent.payment_failed
```

**Watch for**:

- Stripe CLI: `[200]` response
- Dev server: "Payment failed for order xxx"

**Verify order status** = `'FAILED'`

✅ **Test 4 Passed**: Failed payment handled

---

### Scenario 5: Create Refund

```bash
# Using a successful payment intent ID
stripe trigger charge.refunded
```

**Expected**:

- Stripe CLI: `[200]` response
- Dev server: "Refund processed for order xxx"
- Database: `paymentStatus` = `'REFUNDED'`, `refundedAt` set

✅ **Test 5 Passed**: Refund processed

---

### Scenario 6: Test with Stripe CLI Events

**List available events**:

```bash
stripe trigger --help
```

**Trigger specific event with data**:

```bash
stripe events trigger payment_intent.succeeded \
  --override payment_intent:metadata:orderId=YOUR_ORDER_ID
```

✅ **Test 6 Passed**: Custom events working

---

## 📊 Testing Checklist

Mark each test as complete:

### Webhook Setup

- [ ] Stripe CLI installed
- [ ] Authenticated with Stripe
- [ ] Webhook forwarding started
- [ ] Webhook secret configured
- [ ] Health check passes

### Payment Intent

- [ ] Create payment intent successfully
- [ ] Amount calculated correctly (cents)
- [ ] Metadata includes order ID
- [ ] Client secret returned
- [ ] Order updated with payment intent ID

### Successful Payment

- [ ] Webhook received: `payment_intent.succeeded`
- [ ] Signature verified
- [ ] Order status updated to `PAID`
- [ ] `paidAt` timestamp set
- [ ] Order status changed to `CONFIRMED`

### Failed Payment

- [ ] Webhook received: `payment_intent.payment_failed`
- [ ] Order status updated to `FAILED`
- [ ] Error logged

### Refunds

- [ ] Webhook received: `charge.refunded`
- [ ] Order status updated to `REFUNDED`
- [ ] `refundedAt` timestamp set

### Edge Cases

- [ ] Invalid webhook signature rejected
- [ ] Missing order ID handled gracefully
- [ ] Zero amount rejected
- [ ] Negative amount rejected

---

## 🚨 Common Issues & Solutions

### Issue: "stripe: command not found"

**Solution**: Restart terminal after installation, verify PATH

### Issue: Webhook signature verification fails

**Solution**:

1. Copy correct `whsec_...` from Stripe CLI output
2. Update `.env.local`
3. Restart dev server

### Issue: "Order not found"

**Solution**:

1. Verify order exists in database
2. Check order ID is correct
3. Use Prisma Studio to view orders

### Issue: Dev server not receiving webhooks

**Solution**:

1. Verify Stripe CLI shows `[200]` responses
2. Check dev server is on port 3001
3. Verify health endpoint works

### Issue: Environment variables not loading

**Solution**:

1. Ensure `.env.local` is in project root
2. Restart dev server after changes
3. Check for typos in variable names

---

## 📝 Testing Session Log

Document your testing results:

### Test Run 1: [Date/Time]

```
✅ Webhook health check: OK
✅ Payment intent creation: OK
✅ Successful payment: OK
✅ Failed payment: OK
✅ Refund: OK

Notes: [Add any observations]
```

### Test Run 2: [Date/Time]

```
[Record results]
```

---

## ✅ Success Criteria

**Priority 2 is complete when**:

- [x] Stripe CLI installed and authenticated
- [x] Webhook forwarding working
- [x] All test scenarios pass
- [x] No errors in logs
- [x] All checklist items verified
- [x] Edge cases handled correctly

---

## 🎯 Next Priority

Once Priority 2 is complete, proceed to:

### Priority 3: Integration Tests (3 hours)

**File**: Create `src/app/api/payments/__tests__/integration.test.ts`

**Tasks**:

- Test full payment flow with test database
- Mock Stripe SDK for deterministic tests
- Verify database state changes
- Test concurrent payment scenarios

---

## 📚 Quick Reference

### Terminal Setup (3 Terminals)

**Terminal 1 - Dev Server**:

```bash
cd "M:/Repo/Farmers Market Platform web and app"
npm run dev:omen
```

**Terminal 2 - Stripe CLI**:

```bash
cd "M:/Repo/Farmers Market Platform web and app"
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**Terminal 3 - Testing Commands**:

```bash
cd "M:/Repo/Farmers Market Platform web and app"
# Run test commands here
```

### Useful Commands

```bash
# Health check
curl http://localhost:3001/api/webhooks/stripe

# Trigger events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded

# View Stripe events
stripe events list --limit 10

# View Stripe logs
stripe logs tail

# Database access
npx prisma studio
```

### Stripe Test Cards

| Card Number         | Result             |
| ------------------- | ------------------ |
| 4242 4242 4242 4242 | Success            |
| 4000 0000 0000 0002 | Generic decline    |
| 4000 0027 6000 3184 | 3D Secure required |

---

**Status**: Ready to test 🧪  
**Last Updated**: Current Session  
**Estimated Time**: 1 hour

_"Manual testing manifests divine payment reliability"_ 💳✨
