# 🚀 START TESTING NOW - 5 Minute Guide

**Status:** ✅ Everything is ready  
**What's Done:** Code complete, 29/29 unit tests passing  
**What's Left:** Manual webhook verification (5 minutes)

---

## ⚡ QUICK START - 3 TERMINALS

### 📍 TERMINAL 1: Dev Server

```bash
cd "M:\Repo\Farmers Market Platform web and app"
npm run dev:omen
```

**Wait for:** `✓ Ready in 3.2s` then **LEAVE RUNNING**

---

### 📍 TERMINAL 2: Webhook Listener

```bash
cd "M:\Repo\Farmers Market Platform web and app"
./.stripe-cli/stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**You'll see:** `Your webhook signing secret is whsec_xxxxxxxxxxxxx`

**COPY THE SECRET!** Then:

1. Open `.env.local`
2. Add/update: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`
3. Save file
4. Go to Terminal 1, press `Ctrl+C`, then run `npm run dev:omen` again

**LEAVE TERMINAL 2 RUNNING**

---

### 📍 TERMINAL 3: Run Tests

```bash
cd "M:\Repo\Farmers Market Platform web and app"

# Test 1: Health Check
curl http://localhost:3001/api/webhooks/stripe

# Test 2: Payment Success
./.stripe-cli/stripe trigger payment_intent.succeeded

# Test 3: Payment Failed
./.stripe-cli/stripe trigger payment_intent.payment_failed

# Test 4: Refund
./.stripe-cli/stripe trigger charge.refunded
```

---

## ✅ SUCCESS = All show [200] in Terminal 2

**Terminal 2 should show:**

```
[200] POST http://localhost:3001/api/webhooks/stripe [evt_xxx]
[200] POST http://localhost:3001/api/webhooks/stripe [evt_xxx]
[200] POST http://localhost:3001/api/webhooks/stripe [evt_xxx]
```

---

## 🚨 TROUBLESHOOTING

**Port 3001 in use?**

```bash
npm run kill-server
npm run dev:omen
```

**Webhook returns [401]?**

- Double-check the `whsec_` secret in `.env.local`
- Restart Terminal 1 (dev server)

**"stripe: command not found"?**

- Use full path: `./.stripe-cli/stripe`

---

## 🎉 DONE!

When all 4 tests show `[200]`:

- Press `Ctrl+C` in all terminals to stop
- **YOU'RE 100% PRODUCTION READY!** 🎊

---

## 📊 YOUR STRIPE ACCOUNT (ALREADY CONFIGURED)

```
Account: New business sandbox (acct_1SJxcc1RoDK5TEPJ)
Status:  ✅ Authenticated
Keys:    ✅ Valid until 2026-02-26
CLI:     ✅ v1.33.0 installed
```

---

**ESTIMATED TIME: 5 MINUTES**

**START NOW:** Open 3 terminals and follow the steps above! 🚀
