# 🎯 DO THIS NOW - Stripe Testing Setup

**CURRENT STATUS**: Stripe CLI Installed ✅  
**NEXT ACTION**: Authenticate & Configure (15 minutes)

---

## ⚡ IMMEDIATE ACTIONS (Follow in Order)

### STEP 1: Authenticate with Stripe (2 minutes)

**Open your terminal and run**:

```bash
cd "M:/Repo/Farmers Market Platform web and app"
./.stripe-cli/stripe login
```

**What happens**:
1. Browser opens automatically
2. Stripe dashboard appears
3. Click **"Allow access"** button
4. Return to terminal
5. See: "Done! The Stripe CLI is configured..."

**Verify it worked**:
```bash
./.stripe-cli/stripe config --list
```

You should see your account email and device name.

---

### STEP 2: Get Your Stripe API Keys (3 minutes)

**Go to**: https://dashboard.stripe.com/test/apikeys

**IMPORTANT**: Make sure the toggle at the top says **"Test mode"** (not Live mode!)

**Copy TWO keys**:

1. **Publishable key** (starts with `pk_test_`)
   - Click "Reveal test key" if hidden
   - Copy the entire key

2. **Secret key** (starts with `sk_test_`)
   - Click "Reveal test key" 
   - Copy the entire key

**Keep these keys handy** - you'll paste them in the next step.

---

### STEP 3: Configure Environment Variables (3 minutes)

**Open the file**: `.env.local` in your project root

**If it doesn't exist, create it**.

**Add these lines** (replace with YOUR actual keys):

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE_PASTE_IT
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE_PASTE_IT
STRIPE_WEBHOOK_SECRET=whsec_TEMPORARY_WILL_UPDATE_IN_STEP_6

# Database (make sure this exists)
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# NextAuth (make sure these exist)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-here
```

**Save the file**.

---

### STEP 4: Start Development Server (2 minutes)

**Open Terminal 1** and run:

```bash
cd "M:/Repo/Farmers Market Platform web and app"
npm run dev:omen
```

**Wait for**:
```
✓ Ready in X.Xs
○ Local:   http://localhost:3001
```

**Test it's working**:

Open **NEW terminal** and run:
```bash
curl http://localhost:3001/api/webhooks/stripe
```

**Expected response**:
```json
{"status":"ok","message":"Stripe webhook endpoint is active"}
```

✅ If you see this, the server is working!

**KEEP TERMINAL 1 OPEN** - don't close it!

---

### STEP 5: Start Webhook Forwarding (2 minutes)

**Open Terminal 2** (NEW terminal) and run:

```bash
cd "M:/Repo/Farmers Market Platform web and app"
./.stripe-cli/stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**Expected output**:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx (this is your webhook signing secret)
```

**CRITICAL**: You'll see a webhook secret starting with `whsec_`

**COPY THIS ENTIRE SECRET** - you need it for the next step!

**KEEP TERMINAL 2 OPEN** - don't close it!

---

### STEP 6: Update Webhook Secret (2 minutes)

1. **Copy** the `whsec_xxxxxxxxxxxxx` from Terminal 2
2. **Open** `.env.local` again
3. **Find the line**: `STRIPE_WEBHOOK_SECRET=whsec_TEMPORARY_WILL_UPDATE_IN_STEP_6`
4. **Replace** with your actual webhook secret: `STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE`
5. **Save** the file

**Now restart the dev server**:
- Go to **Terminal 1**
- Press `Ctrl+C` to stop the server
- Run `npm run dev:omen` again
- Wait for "✓ Ready"

---

### STEP 7: Run Your First Test! (1 minute)

**Open Terminal 3** (NEW terminal) and run:

```bash
cd "M:/Repo/Farmers Market Platform web and app"
./.stripe-cli/stripe trigger payment_intent.succeeded
```

**Watch what happens**:

**Terminal 2** should show:
```
--> payment_intent.succeeded [evt_xxxxx]
<-- [200] POST http://localhost:3001/api/webhooks/stripe [evt_xxxxx]
```

**Terminal 1** should show:
```
Payment successful for order xxx { paymentIntentId: 'pi_xxx', amount: 50.00 }
```

✅ **If you see `[200]` and payment logs, IT WORKS!**

---

## 🎉 SUCCESS! Now Run All Tests

**In Terminal 3**, run the automated test script:

```bash
./scripts/test-stripe-webhooks.sh
```

**Choose option 5**: "Run All Tests"

This will test:
- ✅ Health check
- ✅ Payment success
- ✅ Payment failed
- ✅ Refund processed
- ✅ Payment intent API

**Expected**: All 5 tests should pass!

---

## 📋 TERMINAL SUMMARY

You should have **3 terminals open**:

| Terminal | Running | Purpose |
|----------|---------|---------|
| **Terminal 1** | `npm run dev:omen` | Development server |
| **Terminal 2** | `stripe listen --forward-to localhost:3001/api/webhooks/stripe` | Webhook forwarding |
| **Terminal 3** | (Free for commands) | Run test commands |

---

## 🚨 TROUBLESHOOTING

### Problem: Browser doesn't open in Step 1

**Solution**: 
- Copy the URL from the terminal
- Paste it in your browser manually
- Complete authentication
- Return to terminal

### Problem: "stripe: command not found" in Step 1

**Solution**: Use the full path:
```bash
./.stripe-cli/stripe login
```

### Problem: Health check fails in Step 4

**Solution**:
- Check if port 3001 is in use: `netstat -ano | findstr :3001`
- Make sure dev server shows "✓ Ready"
- Try restarting the dev server

### Problem: Webhook shows [401] or [400] in Step 7

**Solution**:
- Verify webhook secret in `.env.local` matches Terminal 2 output
- Make sure you restarted dev server after updating `.env.local`
- Check for extra spaces or quotes around the webhook secret

### Problem: No logs appear in Terminal 1

**Solution**:
1. Check Terminal 2 shows "Ready!" and webhook secret
2. Verify dev server is running (Terminal 1)
3. Make sure `.env.local` has all three Stripe variables set
4. Restart dev server

---

## ✅ COMPLETION CHECKLIST

Mark these off as you complete them:

- [ ] Step 1: Authenticated with Stripe (`stripe config --list` works)
- [ ] Step 2: Copied API keys from dashboard
- [ ] Step 3: Updated `.env.local` with keys
- [ ] Step 4: Dev server running and health check passes
- [ ] Step 5: Webhook forwarding active (shows "Ready!")
- [ ] Step 6: Webhook secret updated and server restarted
- [ ] Step 7: First test passed (saw [200] response)
- [ ] Bonus: Ran automated test script (all 5 tests pass)

---

## 🎯 WHEN ALL DONE

**Update the progress tracker**:

```bash
# Mark Priority 2 as complete in:
# - PRIORITY_2_PROGRESS.md
# - Update "Overall Progress" to 50%
```

**Then you're ready for**:
- Priority 3: Integration Tests
- Priority 4: E2E Tests with Playwright

---

## 📚 REFERENCE DOCS

Quick access:
- `STRIPE_TESTING_COMMANDS.md` - All test commands
- `PRIORITY_2_PROGRESS.md` - Detailed progress tracker
- `PAYMENT_MANUAL_TESTING_GUIDE.md` - Comprehensive guide
- `START_PRIORITY_2_NOW.md` - Original quick start

---

## ⏱️ TOTAL TIME: ~15 MINUTES

- Step 1: 2 min
- Step 2: 3 min
- Step 3: 3 min
- Step 4: 2 min
- Step 5: 2 min
- Step 6: 2 min
- Step 7: 1 min
- **Total**: 15 minutes

---

_"Divine authentication manifests quantum payment consciousness"_ 💳⚡✨

**START WITH STEP 1 NOW!** 🚀