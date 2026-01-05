# 🛒 CART & CHECKOUT QUICK START GUIDE
## Farmers Market Platform - Phase 4

**Version**: 1.0
**Last Updated**: December 2024
**Status**: Core Infrastructure Complete ✅

---

## 🚀 QUICK START (5 Minutes)

### **1. Install Dependencies**
```bash
npm install stripe @stripe/stripe-js decimal.js
```

### **2. Set Environment Variables**
```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **3. Run Database Migrations**
```bash
npx prisma db push
```

### **4. Start Development Server**
```bash
npm run dev
```

### **5. Test Cart Flow**
1. Visit http://localhost:3000/products
2. Add items to cart
3. Visit http://localhost:3000/cart
4. View cart summary

---

## 📦 USING THE CART SYSTEM

### **Add to Cart Button**
```tsx
"use client";

import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ product, userId }) {
  const { addToCart, isLoading } = useCart({ userId });

  const handleClick = async () => {
    await addToCart({
      productId: product.id,
      quantity: 1,
      fulfillmentMethod: "DELIVERY",
    });
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
```

### **Cart Badge (Item Count)**
```tsx
"use client";

import { useCart } from "@/hooks/useCart";
import { ShoppingCart } from "lucide-react";

export function CartBadge({ userId }) {
  const { count } = useCart({ userId });

  return (
    <div className="relative">
      <ShoppingCart className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">
          {count}
        </span>
      )}
    </div>
  );
}
```

### **Mini Cart Sidebar**
```tsx
"use client";

import { MiniCart } from "@/components/features/cart/mini-cart";
import { useState } from "react";

export function Header({ userId }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <button onClick={() => setCartOpen(true)}>
        Open Cart
      </button>

      <MiniCart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        userId={userId}
      />
    </>
  );
}
```

### **Full Cart Page**
Already implemented at:
```
src/app/(customer)/cart/page.tsx
```
Visit: http://localhost:3000/cart

---

## 💳 CHECKOUT FLOW (Backend Ready)

### **Create Checkout Session**
```typescript
import { checkoutService } from "@/lib/services/checkout.service";

const session = await checkoutService.createCheckoutSession({
  userId: "user_123",
  deliveryAddressId: "addr_abc",
  fulfillmentMethod: "DELIVERY",
  scheduledDate: new Date("2024-12-25"),
  specialInstructions: "Leave at door",
});

console.log(session.id); // Use for payment
console.log(session.totals); // Display to user
```

### **Create Payment Intent**
```typescript
// API Route: POST /api/payments/create-intent
const response = await fetch("/api/payments/create-intent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    checkoutSessionId: session.id,
    userId: user.id,
    customerEmail: user.email,
    customerName: user.name,
  }),
});

const { clientSecret } = await response.json();
// Use clientSecret with Stripe Elements
```

### **Handle Payment Success**
Webhook automatically:
1. ✅ Creates orders for each farm
2. ✅ Clears cart
3. ✅ Sends confirmation emails (queued)
4. ✅ Updates order status

---

## 🎯 CART SERVICE API

### **Add Item**
```typescript
import { cartService } from "@/lib/services/cart.service";

await cartService.addToCart({
  userId: "user_123",
  productId: "prod_abc",
  quantity: 2,
  fulfillmentMethod: "DELIVERY",
});
```

### **Update Quantity**
```typescript
await cartService.updateCartItem({
  itemId: "item_xyz",
  quantity: 5,
});
```

### **Remove Item**
```typescript
await cartService.removeFromCart("item_xyz");
```

### **Get Cart Summary**
```typescript
const summary = await cartService.getCartSummary("user_123");

console.log(summary.items);        // Cart items
console.log(summary.subtotal);     // Subtotal
console.log(summary.tax);          // Tax (8%)
console.log(summary.deliveryFee);  // Delivery fee
console.log(summary.total);        // Total
console.log(summary.farmGroups);   // Items grouped by farm
```

### **Validate Cart**
```typescript
const validation = await cartService.validateCart("user_123");

if (!validation.isValid) {
  console.log(validation.errors);   // Out of stock, etc.
  console.log(validation.warnings); // Price changes
}
```

---

## 🔧 SERVER ACTIONS API

### **Add to Cart Action**
```typescript
import { addToCartAction } from "@/app/actions/cart.actions";

const result = await addToCartAction({
  userId: "user_123",
  productId: "prod_abc",
  quantity: 1,
});

if (result.success) {
  console.log(result.data.message); // "Item added to cart"
}
```

### **Update Cart Action**
```typescript
import { updateCartItemAction } from "@/app/actions/cart.actions";

await updateCartItemAction({
  itemId: "item_xyz",
  quantity: 3,
});
```

### **Validate Cart Action**
```typescript
import { validateCartAction } from "@/app/actions/cart.actions";

const result = await validateCartAction("user_123");
console.log(result.data); // ValidationResult
```

---

## 💰 PRICING CALCULATIONS

### **Fee Structure**
```typescript
// Fixed rates
const TAX_RATE = 0.08;              // 8%
const PLATFORM_FEE_RATE = 0.15;      // 15%
const DELIVERY_FEE_BASE = 5.99;      // $5.99
const FREE_DELIVERY_THRESHOLD = 50;  // Free over $50

// Example calculation
const subtotal = 75.00;
const tax = subtotal * TAX_RATE;                    // $6.00
const deliveryFee = subtotal >= 50 ? 0 : 5.99;      // $0 (free)
const platformFee = subtotal * PLATFORM_FEE_RATE;   // $11.25
const total = subtotal + tax + deliveryFee;         // $81.00
const farmerAmount = subtotal - platformFee;        // $63.75
```

### **Multi-Farm Example**
```typescript
// Customer cart:
// - Farm A: $30 (2 items)
// - Farm B: $55 (3 items)

// Order 1 (Farm A):
subtotal:    $30.00
tax:         $2.40   (8%)
delivery:    $5.99   (under $50)
platformFee: $4.50   (15%)
total:       $38.39
farmerGets:  $25.50  ($30 - $4.50)

// Order 2 (Farm B):
subtotal:    $55.00
tax:         $4.40   (8%)
delivery:    $0.00   (free over $50)
platformFee: $8.25   (15%)
total:       $59.40
farmerGets:  $46.75  ($55 - $8.25)
```

---

## 🎣 WEBHOOK TESTING

### **Setup Stripe CLI**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook
```

### **Trigger Test Events**
```bash
# Payment succeeded
stripe trigger payment_intent.succeeded

# Payment failed
stripe trigger payment_intent.payment_failed

# Charge refunded
stripe trigger charge.refunded
```

### **Webhook Events Handled**
- ✅ `payment_intent.succeeded` → Create orders
- ✅ `payment_intent.payment_failed` → Cancel orders
- ✅ `payment_intent.canceled` → Cancel orders
- ✅ `charge.refunded` → Create refunds

---

## 🧪 TESTING CART FLOWS

### **Test Add to Cart**
```typescript
// 1. Valid item
await cartService.addToCart({
  userId: "user_123",
  productId: "prod_abc",
  quantity: 1,
});
// ✅ Should succeed

// 2. Out of stock
await cartService.addToCart({
  userId: "user_123",
  productId: "prod_xyz",
  quantity: 100, // More than available
});
// ❌ Should throw "Insufficient stock"

// 3. Inactive product
await cartService.addToCart({
  userId: "user_123",
  productId: "prod_inactive",
  quantity: 1,
});
// ❌ Should throw "Product is not available"
```

### **Test Cart Validation**
```typescript
const validation = await cartService.validateCart("user_123");

// Check for errors
validation.errors.forEach(error => {
  console.log(error.type);    // OUT_OF_STOCK, PRODUCT_INACTIVE
  console.log(error.message); // User-friendly message
});

// Check for warnings
validation.warnings.forEach(warning => {
  console.log(warning.type);    // PRICE_INCREASE, LOW_STOCK
  console.log(warning.message); // Info message
});
```

---

## 🔍 DEBUGGING TIPS

### **Check Cart Count**
```typescript
const count = await cartService.getCartCount("user_123");
console.log(`Cart has ${count} items`);
```

### **Inspect Cart Items**
```typescript
const items = await cartService.getCartItems("user_123");
items.forEach(item => {
  console.log(item.product.name);
  console.log(item.quantity.toNumber());
  console.log(item.priceAtAdd.toNumber());
});
```

### **View Checkout Session**
```typescript
const session = await checkoutService.getCheckoutSession(sessionId);
if (!session) {
  console.log("Session expired or not found");
} else {
  console.log(session.totals);
  console.log(session.farmOrders);
}
```

### **Check Payment Status**
```typescript
import { stripeService } from "@/lib/services/stripe.service";

const status = await stripeService.getPaymentStatus(paymentIntentId);
console.log(status.status);  // succeeded, failed, etc.
console.log(status.amount);
```

---

## 📊 DATABASE QUERIES

### **Get User's Cart**
```sql
SELECT * FROM cart_items
WHERE userId = 'user_123'
ORDER BY createdAt DESC;
```

### **Get Orders by Payment Intent**
```sql
SELECT * FROM orders
WHERE stripePaymentIntentId = 'pi_abc123';
```

### **Clear Expired Cart Items**
```sql
DELETE FROM cart_items
WHERE reservedUntil < NOW();
```

---

## 🚨 COMMON ISSUES & FIXES

### **Issue: "Cannot find module 'decimal.js'"**
```bash
npm install decimal.js
```

### **Issue: "Stripe webhook signature verification failed"**
```bash
# Make sure STRIPE_WEBHOOK_SECRET is set
echo $STRIPE_WEBHOOK_SECRET

# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/payments/webhook
```

### **Issue: "Cart items not showing"**
```typescript
// Check if userId is correct
const items = await cartService.getCartItems(userId);
console.log(items.length); // Should be > 0
```

### **Issue: "Payment intent creation failed"**
```typescript
// Verify Stripe keys are set
console.log(process.env.STRIPE_SECRET_KEY);
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
```

---

## 📚 KEY FILES REFERENCE

### **Services**
```
src/lib/services/cart.service.ts       - Cart CRUD & validation
src/lib/services/checkout.service.ts   - Checkout sessions
src/lib/services/stripe.service.ts     - Payment processing
```

### **Server Actions**
```
src/app/actions/cart.actions.ts        - Cart operations
```

### **API Routes**
```
src/app/api/payments/create-intent/route.ts  - Create payment
src/app/api/payments/webhook/route.ts        - Handle webhooks
```

### **Hooks**
```
src/hooks/useCart.ts                   - Cart state management
```

### **Components**
```
src/components/features/cart/cart-item-card.tsx  - Item display
src/components/features/cart/cart-summary.tsx    - Order summary
src/components/features/cart/mini-cart.tsx       - Sidebar
src/app/(customer)/cart/page.tsx                 - Full cart page
```

---

## 🎯 NEXT STEPS

### **To Complete Phase 4**
1. **Checkout UI** - Multi-step form with Stripe Elements
2. **Order Pages** - Customer & farmer order management
3. **Email Integration** - Wire to SendGrid/SES
4. **Redis Sessions** - Production session storage

### **To Test in Production**
1. Get live Stripe keys
2. Create webhook endpoint in Stripe dashboard
3. Set environment variables
4. Deploy to Vercel/Netlify
5. Test end-to-end flow

---

## 💡 QUICK TIPS

- **Guest Cart**: Works automatically with localStorage
- **Cart Badge**: Updates in real-time with `useCart` hook
- **Optimistic Updates**: UI responds instantly, syncs in background
- **Multi-Farm**: Orders split automatically by farm
- **Stock Validation**: Always checked before checkout
- **Price Changes**: Detected and displayed to users
- **Session Expiry**: Checkout sessions expire after 30 minutes
- **Webhook Retries**: Stripe retries failed webhooks automatically

---

## 🔗 USEFUL LINKS

- **Stripe Docs**: https://stripe.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Project Roadmap**: See `PROJECT_ROADMAP.md`
- **Phase 4 Details**: See `PHASE_4_SHOPPING_CART_CHECKOUT_COMPLETE.md`

---

**Happy Coding!** 🚀🌾

*Built with agricultural consciousness and quantum precision*
