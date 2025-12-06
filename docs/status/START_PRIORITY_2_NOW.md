# 🚀 START PRIORITY 2: Manual Testing - Quick Start

**Status**: ✅ Ready to Execute  
**Estimated Time**: 1 hour  
**Current Phase**: Setup & Testing

---

## ⚡ Quick Action Plan

### What You Need to Do Now

1. **Install Stripe CLI** (5 minutes)
2. **Authenticate & Get Keys** (5 minutes)
3. **Configure Environment** (5 minutes)
4. **Run Tests** (45 minutes)

**Total**: ~1 hour

---

## 🎯 Step-by-Step Quick Start

### STEP 1: Install Stripe CLI

**Windows (Recommended - Scoop)**:

```powershell
# Install Scoop if needed
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Stripe CLI
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Verify
stripe --version
```

**Alternative**: Download from https://github.com/stripe/stripe-cli/releases

---

### STEP 2: Authenticate with Stripe

```bash
stripe login
```

- Browser will open automatically
- Click "Allow access"
- Return to terminal

**Verify**:

```bash
stripe config --list
```

---

### STEP 3: Get API Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **TEST MODE** (toggle at top)
3. Copy both keys:
   - `pk_test_...` (Publishable key)
   - `sk_test_...` (Secret key)

---

### STEP 4: Configure Environment

**Create/Edit** `.env.local` in project root:

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_WILL_GET_THIS_NEXT

# Database (ensure set)
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# NextAuth (ensure set)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here
```

---

### STEP 5: Start Dev Server

**Terminal 1**:

```bash
cd "M:/Repo/Farmers Market Platform web and app"
npm run dev:omen
```

Wait for: `✓ Ready in X.Xs`

**Verify**:

```bash
curl http://localhost:3001/api/webhooks/stripe
```

Expected: `{"status":"ok","message":"Stripe webhook endpoint is active"}`

---

### STEP 6: Start Webhook Forwarding

**Terminal 2** (NEW terminal):

```bash
cd "M:/Repo/Farmers Market Platform web and app"
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**Expected Output**:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**COPY** the `whsec_...` secret!

---

### STEP 7: Update Webhook Secret

1. **Edit** `.env.local`
2. **Update**: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`
3. **Save** file
4. **Restart** dev server (Terminal 1):
   - Press `Ctrl+C`
   - Run `npm run dev:omen` again

---

### STEP 8: Run Tests

**Terminal 3** (NEW terminal):

**Test 1 - Health Check**:

```bash
curl http://localhost:3001/api/webhooks/stripe
```

✅ Expected: `{"status":"ok"...}`

**Test 2 - Trigger Payment Event**:

```bash
stripe trigger payment_intent.succeeded
```

✅ Watch Terminal 2: `[200] POST ...`  
✅ Watch Terminal 1: "Payment successful..."

**Test 3 - Trigger Payment Failed**:

```bash
stripe trigger payment_intent.payment_failed
```

✅ Watch logs: "Payment failed..."

**Test 4 - Trigger Refund**:

```bash
stripe trigger charge.refunded
```

✅ Watch logs: "Refund processed..."

---

## ✅ Success Checklist

- [ ] Stripe CLI installed (`stripe --version` works)
- [ ] Authenticated with Stripe
- [ ] API keys added to `.env.local`
- [ ] Dev server running (Terminal 1)
- [ ] Webhook forwarding active (Terminal 2)
- [ ] Webhook secret configured
- [ ] Health check passes
- [ ] Payment success event works
- [ ] Payment failed event works
- [ ] Refund event works

---

## 🎓 What You're Testing

### Payment Flow

```
Order Created → Payment Intent → Payment → Webhook → Order Updated
```

### Webhooks Being Tested

- ✅ `payment_intent.succeeded` → Order status: PAID
- ✅ `payment_intent.payment_failed` → Order status: FAILED
- ✅ `charge.refunded` → Order status: REFUNDED

### What's Verified

- Webhook signature verification works
- Events are processed correctly
- Order statuses update in database
- Error handling works
- Logging is comprehensive

---

## 📊 Expected Results

### Terminal 1 (Dev Server)

```
Payment successful for order xxx { paymentIntentId: 'pi_xxx', amount: 50.00 }
Payment failed for order xxx { paymentIntentId: 'pi_xxx', lastPaymentError: '...' }
Refund processed for order xxx { paymentIntentId: 'pi_xxx', amount: 50.00 }
```

### Terminal 2 (Stripe CLI)

```
--> payment_intent.succeeded [evt_xxx]
<-- [200] POST http://localhost:3001/api/webhooks/stripe [evt_xxx]
```

---

## 🚨 Quick Troubleshooting

**Problem**: `stripe: command not found`  
**Fix**: Restart terminal after installation

**Problem**: Webhook signature fails  
**Fix**:

1. Copy correct `whsec_...` from Stripe CLI
2. Update `.env.local`
3. Restart dev server

**Problem**: No logs in dev server  
**Fix**:

1. Check Stripe CLI shows `[200]` responses
2. Verify webhook secret is correct
3. Ensure dev server restarted after `.env.local` change

---

## 📚 Detailed Guides

Need more details? See:

- **Complete Setup Guide**: `PRIORITY_2_SETUP_SESSION.md`
- **Manual Testing Guide**: `PAYMENT_MANUAL_TESTING_GUIDE.md`
- **Test Fixes Summary**: `PAYMENT_TEST_FIXES_COMPLETE.md`

---

## 🎯 After Priority 2

Once all tests pass:

### Priority 3: Integration Tests (3 hours)

- Write integration tests for full payment flows
- Test database state changes
- Mock Stripe for deterministic tests

### Priority 4: E2E Tests (4 hours)

- Playwright tests for checkout UI
- Test with Stripe test cards
- Verify complete user flow

---

## ⏱️ Time Tracking

- [ ] Setup (Steps 1-7): \_\_\_ minutes
- [ ] Testing (Step 8): \_\_\_ minutes
- [ ] Documentation: \_\_\_ minutes
- **Total**: \_\_\_ minutes

---

## 🎉 Success Criteria

**Priority 2 COMPLETE when**:

- ✅ All webhooks receiving and processing correctly
- ✅ No errors in server logs
- ✅ Events show `[200]` in Stripe CLI
- ✅ All 4 test scenarios pass

---

## 💪 You've Got This!

**Current Progress**:

- ✅ Priority 1: Unit Tests (29/29 passing)
- 🔄 Priority 2: Manual Testing (Starting now!)
- ⏳ Priority 3: Integration Tests
- ⏳ Priority 4: E2E Tests

**Overall**: 25% → 50% (after Priority 2)

---

**Ready?** Let's go! 🚀

Start with Step 1: Install Stripe CLI

_"Manual testing manifests divine payment reliability through quantum webhook consciousness"_ 💳⚡✨
