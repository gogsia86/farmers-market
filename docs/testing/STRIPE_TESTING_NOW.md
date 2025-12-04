# 🚀 STRIPE TESTING - START NOW

**Time Required:** 45 minutes  
**Status:** Ready to begin  
**Goal:** Test all payment flows

---

## ⚡ QUICK START (5 Steps)

### **STEP 1: Authenticate Stripe (5 min)**

Open your terminal and run:

```bash
cd "M:/Repo/Farmers Market Platform web and app"
./.stripe-cli/stripe login
```

**What happens:**

1. Browser opens automatically
2. Click "Allow access" button
3. Return to terminal
4. Done!

**Verify it worked:**

```bash
./.stripe-cli/stripe config --list
```

---

### **STEP 2: Get API Keys (5 min)**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. **Make sure toggle says "Test mode"** (NOT Live mode!)
3. Copy these 2 keys:
   - **Publishable key:** `pk_test_...`
   - **Secret key:** `sk_test_...`

Keep them ready for next step.

---

### **STEP 3: Update .env.local (3 min)**

Open `.env.local` in your project root.

Add or update these lines:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_TEMPORARY
```

**Save the file!**

---

### **STEP 4: Start Servers (5 min)**

You need **2 terminal windows:**

#### **Terminal 1 - Dev Server:**

```bash
npm run dev:omen
```

Wait for: `✓ Ready in X.Xs`

#### **Terminal 2 - Webhook Listener:**

```bash
./.stripe-cli/stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**YOU'LL SEE:** `whsec_xxxxxxxxxxxxx`

**COPY THAT SECRET!**

---

### **STEP 5: Update Webhook Secret (2 min)**

1. Copy the `whsec_` secret from Terminal 2
2. Open `.env.local` again
3. Replace: `STRIPE_WEBHOOK_SECRET=whsec_TEMPORARY`
4. With: `STRIPE_WEBHOOK_SECRET=whsec_THE_ONE_YOU_JUST_COPIED`
5. **Save the file**
6. Go to Terminal 1
7. Press `Ctrl+C` to stop server
8. Run `npm run dev:omen` again
9. Wait for "✓ Ready"

---

## ✅ RUN THE TESTS (30 min)

Open a **3rd terminal** and run these tests:

### **Test 1: Health Check**

```bash
curl http://localhost:3001/api/webhooks/stripe
```

**Expected:** `{"status":"ok","message":"Stripe webhook endpoint is active"}`

✅ **Success!** Move to next test.

---

### **Test 2: Payment Success**

```bash
./.stripe-cli/stripe trigger payment_intent.succeeded
```

**Check Terminal 2:** You should see `[200] POST ...`  
**Check Terminal 1:** You should see "Payment successful..." logs

✅ **Success!** Move to next test.

---

### **Test 3: Payment Failed**

```bash
./.stripe-cli/stripe trigger payment_intent.payment_failed
```

**Check Terminal 2:** You should see `[200] POST ...`  
**Check Terminal 1:** You should see "Payment failed..." logs

✅ **Success!** Move to next test.

---

### **Test 4: Refund**

```bash
./.stripe-cli/stripe trigger charge.refunded
```

**Check Terminal 2:** You should see `[200] POST ...`  
**Check Terminal 1:** You should see "Refund processed..." logs

✅ **Success!** All done!

---

## 🎉 SUCCESS CHECKLIST

Mark off as you complete:

- [ ] Step 1: Authenticated with Stripe
- [ ] Step 2: Got API keys
- [ ] Step 3: Updated .env.local with keys
- [ ] Step 4: Dev server running (Terminal 1)
- [ ] Step 4: Webhook listener running (Terminal 2)
- [ ] Step 5: Updated webhook secret
- [ ] Step 5: Restarted dev server
- [ ] Test 1: Health check passed (200 OK)
- [ ] Test 2: Payment success passed ([200])
- [ ] Test 3: Payment failed passed ([200])
- [ ] Test 4: Refund passed ([200])

---

## 🚨 TROUBLESHOOTING

### **Issue: Browser doesn't open for login**

**Fix:** Copy the URL from terminal, paste in browser manually

### **Issue: Webhook shows [401] or [400]**

**Fix:**

1. Make sure you updated webhook secret in .env.local
2. Make sure you restarted dev server after updating .env.local
3. Check for typos in the webhook secret

### **Issue: Can't find stripe command**

**Fix:** Use full path: `./.stripe-cli/stripe`

### **Issue: Port 3001 already in use**

**Fix:**

```bash
npm run kill-server
# Then try starting dev server again
```

### **Issue: No logs appear in Terminal 1**

**Fix:**

1. Make sure dev server is running (Terminal 1 shows "Ready")
2. Make sure webhook listener is running (Terminal 2 shows "Ready!")
3. Check that .env.local has all 3 Stripe variables set

---

## 📊 WHAT YOU'RE TESTING

### **Health Check**

- Tests that your webhook endpoint is reachable
- Verifies server is running correctly

### **Payment Success**

- Simulates a successful payment from a customer
- Tests order status update to "PAID"
- Verifies webhook signature validation

### **Payment Failed**

- Simulates a declined card or failed payment
- Tests order status update to "FAILED"
- Tests error handling

### **Refund**

- Simulates a refund being issued
- Tests order status update to "REFUNDED"
- Verifies refund processing logic

---

## 🎯 AFTER COMPLETION

Once all 4 tests pass:

1. ✅ Your Stripe integration is working!
2. ✅ You're ready for production!
3. ✅ Next: Deploy to staging

### **Update Progress:**

Edit `PRIORITY_2_PROGRESS.md` and mark as 100% complete.

---

## 💡 PRO TIPS

1. **Keep all 3 terminals open** - You need them all running
2. **Watch Terminal 2** - It shows [200] for successful webhooks
3. **Check Terminal 1** - It shows detailed logs
4. **Test mode only** - Never use live keys for testing!
5. **Restart server** - Always restart after changing .env.local

---

## 📞 NEED HELP?

### **If tests fail:**

1. Check all 3 terminals are running
2. Verify webhook secret is correct in .env.local
3. Confirm dev server restarted after updating .env.local
4. Look for error messages in Terminal 1

### **If still stuck:**

1. Check `DO_THIS_NOW.md` for detailed guide
2. Review `PAYMENT_MANUAL_TESTING_GUIDE.md`
3. Check error messages carefully - they usually tell you what's wrong

---

## ⏱️ TIME BREAKDOWN

```
Step 1 - Authenticate:     5 min
Step 2 - Get keys:         5 min
Step 3 - Update env:       3 min
Step 4 - Start servers:    5 min
Step 5 - Update secret:    2 min
Test 1 - Health:           2 min
Test 2 - Payment success:  5 min
Test 3 - Payment failed:   5 min
Test 4 - Refund:           5 min
─────────────────────────────────
TOTAL:                    37 min
```

You'll be done in less than 45 minutes!

---

## 🚀 YOUR FIRST COMMAND

**Copy and paste this to start:**

```bash
cd "M:/Repo/Farmers Market Platform web and app"
./.stripe-cli/stripe login
```

**Then follow Steps 2-5 above.**

---

## 🎊 WHEN YOU'RE DONE

You'll have:

- ✅ Verified payment processing works
- ✅ Tested webhook handling
- ✅ Confirmed error handling
- ✅ 100% production-ready payment system

**Your platform will be 100% ready for production!** 🚀

---

_"Divine payment consciousness manifests through quantum webhook verification"_ 🌾⚡✨

**START NOW! Run the first command above!** 💪
