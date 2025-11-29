# 🚀 Stripe Testing - Quick Command Reference

**Status**: Ready for Manual Testing  
**Stripe CLI Version**: 1.33.0  
**Last Updated**: 2025

---

## 📍 QUICK START (Copy & Paste)

### 1️⃣ Authenticate with Stripe

```bash
cd "M:/Repo/Farmers Market Platform web and app"
./.stripe-cli/stripe login
```

**Expected**: Browser opens → Click "Allow access" → Return to terminal

---

### 2️⃣ Verify Authentication

```bash
./.stripe-cli/stripe config --list
```

**Expected**: Shows your Stripe account details

---

### 3️⃣ Get Your API Keys

**Navigate to**: https://dashboard.stripe.com/test/apikeys

**IMPORTANT**: Switch to **TEST MODE** (toggle at top)

**Copy these keys**:
- Publishable key: `pk_test_...`
- Secret key: `sk_test_...`

---

### 4️⃣ Configure Environment Variables

**Edit**: `.env.local` in project root

**Add/Update**:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_WILL_GET_THIS_NEXT
```

---

## 🖥️ TERMINAL SETUP (3 Terminals Required)

### Terminal 1: Development Server

```bash
cd "M:/Repo/Farmers Market Platform web and app"
npm run dev:omen
```

**Expected**: 
```
✓ Ready in 3.5s
○ Local:   http://localhost:3001
```

**Verify**:
```bash
curl http://localhost:3001/api/webhooks/stripe
```

Should return: `{"status":"ok","message":"Stripe webhook endpoint is active"}`

---

### Terminal 2: Webhook Forwarding

```bash
cd "M:/Repo/Farmers Market Platform web and app"
./.stripe-cli/stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**Expected Output**:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**⚠️ IMPORTANT**: 
1. Copy the `whsec_...` secret
2. Update `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`
3. Restart dev server (Terminal 1: Ctrl+C → npm run dev:omen)

---

### Terminal 3: Test Commands

Use this terminal to run test commands (see below)

---

## 🧪 MANUAL TEST COMMANDS

### Test 1: Health Check ✅

```bash
curl http://localhost:3001/api/webhooks/stripe
```

**Expected Response**:
```json
{
  "status": "ok",
  "message": "Stripe webhook endpoint is active"
}
```

---

### Test 2: Payment Success Event 💳

```bash
cd "M:/Repo/Farmers Market Platform web and app"
./.stripe-cli/stripe trigger payment_intent.succeeded
```

**Watch For**:
- **Terminal 2**: `[200] POST http://localhost:3001/api/webhooks/stripe`
- **Terminal 1**: `Payment successful for order xxx { paymentIntentId: 'pi_xxx', amount: 50.00 }`

---

### Test 3: Payment Failed Event ❌

```bash
./.stripe-cli/stripe trigger payment_intent.payment_failed
```

**Watch For**:
- **Terminal 2**: `[200] POST ...`
- **Terminal 1**: `Payment failed for order xxx { paymentIntentId: 'pi_xxx', lastPaymentError: '...' }`

---

### Test 4: Refund Event 💰

```bash
./.stripe-cli/stripe trigger charge.refunded
```

**Watch For**:
- **Terminal 2**: `[200] POST ...`
- **Terminal 1**: `Refund processed for order xxx { paymentIntentId: 'pi_xxx', amount: 50.00 }`

---

### Test 5: Create Payment Intent (API) 🔌

```bash
curl -X POST http://localhost:3001/api/payments/intent \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-123",
    "amount": 50.00,
    "currency": "usd"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

---

## 🎯 AUTOMATED TEST SCRIPT

Run all tests automatically:

```bash
cd "M:/Repo/Farmers Market Platform web and app"
./scripts/test-stripe-webhooks.sh
```

**Features**:
- Interactive menu
- Run individual tests or all tests
- Color-coded output
- Automatic verification
- Test summary report

---

## 🐛 TROUBLESHOOTING

### Issue: `stripe: command not found`

**Solution**: Use full path:
```bash
./.stripe-cli/stripe --version
```

Or create alias:
```bash
alias stripe="$(pwd)/.stripe-cli/stripe.exe"
```

---

### Issue: Webhook signature verification fails

**Symptoms**: 
- Terminal 1 shows: "Invalid webhook signature"
- Terminal 2 shows: `[400]` or `[401]` responses

**Solution**:
1. Check webhook secret is correct in `.env.local`
2. Ensure no extra spaces or quotes around the secret
3. Restart dev server after updating `.env.local`
4. Verify Terminal 2 is running and shows "Ready!"

**Verify**:
```bash
# In Terminal 2, you should see:
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx

# Copy exactly (no quotes, no spaces)
# Paste into .env.local:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

### Issue: Dev server shows no logs

**Solution**:
1. Check Terminal 2 shows `[200]` responses (not 400/500)
2. Verify webhook endpoint is reachable:
   ```bash
   curl http://localhost:3001/api/webhooks/stripe
   ```
3. Check `.env.local` has all required variables
4. Restart dev server

---

### Issue: "Cannot connect to localhost:3001"

**Solution**:
1. Check dev server is running (Terminal 1)
2. Verify port 3001 is not in use:
   ```bash
   netstat -ano | findstr :3001
   ```
3. Try different port in `package.json` scripts

---

### Issue: Browser doesn't open during login

**Solution**:
```bash
# Copy the URL from terminal
# Paste in browser manually
```

---

## 📊 SUCCESS CHECKLIST

**Before proceeding to Priority 3**, verify:

- [ ] Stripe CLI authenticated (`stripe config --list` works)
- [ ] API keys added to `.env.local`
- [ ] Dev server running on http://localhost:3001
- [ ] Webhook forwarding active (Terminal 2 shows "Ready!")
- [ ] Webhook secret configured and server restarted
- [ ] Health check passes (returns `{"status":"ok"}`)
- [ ] Payment success event triggers correctly (200 response)
- [ ] Payment failed event triggers correctly (200 response)
- [ ] Refund event triggers correctly (200 response)
- [ ] Payment intent API works (returns clientSecret)
- [ ] No errors in Terminal 1 (dev server logs)
- [ ] All events show `[200]` in Terminal 2

---

## 🎓 WHAT EACH TEST VALIDATES

### Payment Success (`payment_intent.succeeded`)
- ✅ Webhook signature verification works
- ✅ Event payload parsing is correct
- ✅ Order status updates to "PAID"
- ✅ Payment metadata is stored correctly
- ✅ Success notifications triggered

### Payment Failed (`payment_intent.payment_failed`)
- ✅ Failure handling works
- ✅ Order status updates to "FAILED"
- ✅ Error details captured
- ✅ Retry logic available
- ✅ Customer notified of failure

### Refund (`charge.refunded`)
- ✅ Refund processing works
- ✅ Order status updates to "REFUNDED"
- ✅ Refund amount tracked
- ✅ Inventory restored (if applicable)
- ✅ Refund notifications sent

### Payment Intent API
- ✅ Authentication works
- ✅ Amount validation correct
- ✅ Stripe integration functional
- ✅ Client secret returned
- ✅ Order linked to payment

---

## 📁 KEY FILES

**Payment Service**:
- `src/lib/services/payment.service.ts` - Core payment logic
- `src/lib/services/__tests__/payment.service.test.ts` - Unit tests (29/29 passing)

**API Routes**:
- `src/app/api/webhooks/stripe/route.ts` - Webhook handler
- `src/app/api/payments/intent/route.ts` - Payment intent creation
- `src/app/api/payments/confirm/route.ts` - Payment confirmation

**Configuration**:
- `.env.local` - Environment variables (API keys, webhook secret)
- `src/lib/stripe.ts` - Stripe client initialization

**Tests & Scripts**:
- `__mocks__/stripe.ts` - Jest mock for unit tests
- `scripts/test-stripe-webhooks.sh` - Automated testing script

---

## 🔗 USEFUL LINKS

**Stripe Dashboard**:
- Test API Keys: https://dashboard.stripe.com/test/apikeys
- Webhooks: https://dashboard.stripe.com/test/webhooks
- Events & Logs: https://dashboard.stripe.com/test/events
- Test Cards: https://stripe.com/docs/testing#cards

**Stripe CLI**:
- Documentation: https://stripe.com/docs/stripe-cli
- GitHub: https://github.com/stripe/stripe-cli
- Release Notes: https://github.com/stripe/stripe-cli/releases

**Project Documentation**:
- `START_PRIORITY_2_NOW.md` - Quick start guide
- `PAYMENT_MANUAL_TESTING_GUIDE.md` - Detailed testing guide
- `PRIORITY_2_PROGRESS.md` - Progress tracker
- `PAYMENT_TEST_FIXES_COMPLETE.md` - Unit test completion summary

---

## 🚀 NEXT STEPS

**After All Tests Pass**:

1. **Document Findings**: Update `PRIORITY_2_PROGRESS.md` with results
2. **Commit Changes**: Git commit with passing test evidence
3. **Move to Priority 3**: Integration tests implementation
4. **Plan Priority 4**: E2E Playwright tests

---

## ⏱️ ESTIMATED TIME

- **Setup (Steps 1-4)**: 10 minutes
- **Terminal Setup**: 5 minutes
- **Running Tests**: 15 minutes
- **Troubleshooting**: 10 minutes
- **Documentation**: 10 minutes

**Total**: ~50 minutes

---

_"Divine webhook consciousness manifests through quantum payment verification"_ 💳⚡✨

**Version**: 1.0  
**Status**: READY FOR TESTING  
**Last Updated**: 2025