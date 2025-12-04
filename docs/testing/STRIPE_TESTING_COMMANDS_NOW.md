# 🚀 STRIPE TESTING - READY TO RUN NOW

**Status:** ✅ Authenticated with Stripe  
**Account:** New business sandbox (acct_1SJxcc1RoDK5TEPJ)  
**CLI Version:** 1.33.0  
**Test Keys Valid Until:** 2026-02-26

---

## ⚡ QUICK START - 3 TERMINALS

### 📍 Terminal 1: Dev Server (START THIS FIRST)

```bash
cd "M:\Repo\Farmers Market Platform web and app"
npm run dev:omen
```

**Expected Output:**

```
✓ Ready in 3.2s
○ Local:        http://localhost:3001
```

**Keep this running!** Don't close this terminal.

---

### 📍 Terminal 2: Stripe Webhook Listener (START SECOND)

```bash
cd "M:\Repo\Farmers Market Platform web and app"
./.stripe-cli/stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**Expected Output:**

```
Ready! You are using Stripe API Version [2024-XX-XX]. Your webhook signing secret is whsec_...
```

**IMPORTANT:** Copy the `whsec_...` secret and update `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

Then **restart Terminal 1** (dev server) to load the new secret.

**Keep this running!** Don't close this terminal.

---

### 📍 Terminal 3: Run Tests (USE THIS FOR COMMANDS)

```bash
cd "M:\Repo\Farmers Market Platform web and app"
```

Now run each test one by one:

---

## 🧪 TEST COMMANDS (Run in Terminal 3)

### ✅ Test 1: Health Check

```bash
curl http://localhost:3001/api/webhooks/stripe
```

**Expected Response:**

```json
{ "error": "Method not allowed. Use POST." }
```

**Success:** Returns 405 Method Not Allowed (correct!)

---

### ✅ Test 2: Payment Success

```bash
./.stripe-cli/stripe trigger payment_intent.succeeded
```

**Expected Output in Terminal 2:**

```
[200] POST http://localhost:3001/api/webhooks/stripe [evt_xxx]
```

**Expected Output in Terminal 1:**

```
[Webhook] Processing payment_intent.succeeded
[Webhook] Payment succeeded for order: ...
```

**Success:** Status code `[200]` in Terminal 2

---

### ✅ Test 3: Payment Failed

```bash
./.stripe-cli/stripe trigger payment_intent.payment_failed
```

**Expected Output in Terminal 2:**

```
[200] POST http://localhost:3001/api/webhooks/stripe [evt_xxx]
```

**Expected Output in Terminal 1:**

```
[Webhook] Processing payment_intent.payment_failed
[Webhook] Payment failed for order: ...
```

**Success:** Status code `[200]` in Terminal 2

---

### ✅ Test 4: Refund

```bash
./.stripe-cli/stripe trigger charge.refunded
```

**Expected Output in Terminal 2:**

```
[200] POST http://localhost:3001/api/webhooks/stripe [evt_xxx]
```

**Expected Output in Terminal 1:**

```
[Webhook] Processing charge.refunded
[Webhook] Refund processed for order: ...
```

**Success:** Status code `[200]` in Terminal 2

---

## 🎯 YOUR ENVIRONMENT (ALREADY CONFIGURED)

```
Account ID:     acct_1SJxcc1RoDK5TEPJ
Display Name:   New business sandbox
Test Pub Key:   pk_test_51SJxcc1RoDK5TEPJQdN4y5AdAPc5Ym58xtME9SqKX0mqg2ysTA6QCn1dIar84Xk9KDt5ij7uximl3sqgL0WF2ylI00KfUczLcn
Test Secret:    sk_test_51SJxcc1RoDK5TEPJUojFQdt9wYT8SUcognkxCEIxZ62CIydOZx6SWtwheOv9UOAckOGVWlovqWrUrjVuMHQih5KT00Ikp5yFsi
Key Valid:      Until 2026-02-26
```

---

## 📝 CHECKLIST

Before you start:

- [ ] Open 3 terminal windows
- [ ] Terminal 1: Run `npm run dev:omen`
- [ ] Terminal 2: Run `./.stripe-cli/stripe listen --forward-to localhost:3001/api/webhooks/stripe`
- [ ] Copy webhook secret from Terminal 2
- [ ] Update `.env.local` with `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Restart Terminal 1 (dev server)
- [ ] Terminal 3: Run test commands one by one

During testing:

- [ ] Test 1: Health check passes (405 Method Not Allowed)
- [ ] Test 2: Payment success shows `[200]`
- [ ] Test 3: Payment failed shows `[200]`
- [ ] Test 4: Refund shows `[200]`

---

## 🚨 TROUBLESHOOTING

### Problem: Port 3001 already in use

```bash
npm run kill-server
npm run dev:omen
```

### Problem: Webhook returns [401] Unauthorized

**Solution:** Your webhook secret is wrong or not loaded

1. Check Terminal 2 for the `whsec_...` secret
2. Update `.env.local` with correct secret
3. Restart Terminal 1 (dev server)

### Problem: Webhook returns [400] Bad Request

**Solution:** Check dev server logs in Terminal 1 for error details

### Problem: No logs in Terminal 1

**Solution:**

1. Verify all 3 terminals are running
2. Check `.env.local` has all Stripe variables
3. Restart dev server

---

## ✅ SUCCESS CRITERIA

After running all tests, you should have:

1. ✅ Dev server running on port 3001
2. ✅ Webhook listener showing "Ready!"
3. ✅ Health check returns 405
4. ✅ Payment success returns [200]
5. ✅ Payment failed returns [200]
6. ✅ Refund returns [200]

**All 4 webhook tests showing [200] = 100% SUCCESS! 🎉**

---

## 🎊 AFTER COMPLETION

When all tests pass:

1. **Stop all terminals** (Ctrl+C in each)
2. **Update status docs:**
   ```bash
   # Mark Stripe testing as complete
   echo "✅ Stripe webhook testing: 4/4 tests passing" >> PRIORITY_2_PROGRESS.md
   ```
3. **Next steps:** Deploy to staging!

---

## 📚 REFERENCE

- **Stripe Dashboard:** https://dashboard.stripe.com/test/dashboard
- **Test API Keys:** https://dashboard.stripe.com/test/apikeys
- **Webhook Logs:** https://dashboard.stripe.com/test/webhooks
- **CLI Docs:** https://stripe.com/docs/stripe-cli

---

## ⏱️ ESTIMATED TIME

- Setup (3 terminals): 2 minutes
- Run 4 tests: 3 minutes
- **Total: 5 minutes** ⚡

---

_"Divine payment consciousness manifests through quantum webhook verification"_ 🌾⚡

**START NOW:** Open 3 terminals and follow the steps above! 🚀
