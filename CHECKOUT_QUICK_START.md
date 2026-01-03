# 🚀 Checkout Quick Start Guide

Get the checkout flow running locally in 5 minutes!

---

## Prerequisites

- Node.js 18+ installed
- Docker Desktop running
- Stripe CLI installed (`brew install stripe/stripe-cli/stripe` or download from stripe.com)

---

## 1. Install Dependencies

```bash
npm install
```

This installs Stripe packages:
- `stripe`
- `@stripe/stripe-js`
- `@stripe/react-stripe-js`

---

## 2. Set Up Environment Variables

Create `.env.local` (if not exists):

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmers_market

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Get Stripe Keys**:
1. Sign up at https://dashboard.stripe.com/register
2. Go to Developers → API Keys
3. Copy "Publishable key" and "Secret key" (test mode)

---

## 3. Start Docker Services

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts:
- PostgreSQL database
- Redis (for sessions)

---

## 4. Sync Database Schema

```bash
npx prisma db push
```

---

## 5. Start Stripe Webhook Listener

**In a separate terminal**:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/payments/webhook
```

This will output your webhook secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

Copy the `whsec_xxx` value and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

---

## 6. Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

---

## 7. Test Checkout Flow

### Add Items to Cart

1. Browse products at `/products`
2. Click "Add to Cart" on any product
3. View cart at `/cart`

### Complete Checkout

1. Click "Checkout" from cart page
2. **Step 1 - Address**: Fill in delivery address
   - Use any US address
   - Example: 123 Main St, San Francisco, CA 94102
3. **Step 2 - Delivery**: Select delivery or pickup for each farm
   - Choose a future date
   - Select time slot
4. **Step 3 - Payment**: Enter test card
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
5. **Step 4 - Review**: Confirm order
   - Click "Place Order"
6. **Success**: View confirmation at `/checkout/success`

### Verify Webhook Processing

Check the Stripe CLI terminal - you should see:
```
→ payment_intent.succeeded [evt_xxx]
```

---

## 🧪 Stripe Test Cards

| Card Number          | Result          |
|---------------------|-----------------|
| `4242 4242 4242 4242` | Success         |
| `4000 0000 0000 0002` | Declined        |
| `4000 0025 0000 3155` | 3D Secure       |

More: https://stripe.com/docs/testing

---

## 🐛 Troubleshooting

### "Stripe not initialized" Error

**Problem**: Missing Stripe publishable key

**Solution**: Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`

---

### Webhook Not Receiving Events

**Problem**: Stripe CLI not running or wrong endpoint

**Solution**:
1. Ensure Stripe CLI running: `stripe listen --forward-to localhost:3000/api/payments/webhook`
2. Verify webhook secret in `.env.local` matches CLI output
3. Restart dev server after updating `.env.local`

---

### "Cart is empty" on Checkout

**Problem**: No items in cart

**Solution**: Add items from `/products` page first

---

### TypeScript Errors on Build

**Problem**: Type mismatches in checkout components

**Solution**: This is a known issue - see `SESSION_SUMMARY_CHECKOUT_UI.md` for details. The code runs fine, types just need alignment.

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/app/(customer)/checkout/page.tsx` | Main checkout page |
| `src/components/features/checkout/*` | Checkout components |
| `src/app/api/payments/create-intent/route.ts` | Payment intent creation |
| `src/app/api/payments/webhook/route.ts` | Stripe webhook handler |
| `src/lib/services/checkout.service.ts` | Checkout business logic |
| `src/lib/services/stripe.service.ts` | Stripe integration |

---

## 🔄 Checkout Flow Overview

```
Cart Page
  ↓ Click "Checkout"
Address Form (Step 1)
  ↓ Enter address → "Continue"
Delivery Options (Step 2)
  ↓ Select delivery/pickup → "Continue"
Payment Form (Step 3)
  ↓ Enter card → "Review Order"
  ↓ API creates PaymentIntent
Order Review (Step 4)
  ↓ Confirm → stripe.confirmPayment()
  ↓ Payment succeeds
Webhook Triggered
  ↓ Creates Order, Clears Cart, Sends Email
Success Page
  ✅ Order confirmed!
```

---

## 🎯 Next Steps

After getting checkout running:

1. **Fix Type Errors**: See `SESSION_SUMMARY_CHECKOUT_UI.md`
2. **Wire Success Page**: Connect to real order API
3. **Add Tests**: Unit, integration, E2E tests
4. **Configure Email**: SendGrid or AWS SES for real emails

---

## 📚 Documentation

- **Complete Guide**: `CHECKOUT_UI_IMPLEMENTATION.md`
- **Session Summary**: `SESSION_SUMMARY_CHECKOUT_UI.md`
- **Cart Quick Start**: `CART_CHECKOUT_QUICK_START.md`
- **Stripe Docs**: https://stripe.com/docs/payments/payment-intents

---

## 🆘 Need Help?

1. Check troubleshooting section above
2. Review implementation guide
3. Check Stripe Dashboard → Logs
4. Review browser console for errors
5. Check server logs in terminal

---

**Happy Coding!** 🌾✨
