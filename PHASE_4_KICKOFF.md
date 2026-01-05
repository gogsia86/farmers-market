# 🚀 PHASE 4: SHOPPING CART & CHECKOUT - KICKOFF GUIDE

**Status**: READY TO START
**Previous Phase**: Product Management ✅ (100% Complete)
**Estimated Duration**: 8-12 hours
**Complexity**: High (Payment integration, cart state, checkout flow)

---

## 📋 PHASE 4 OVERVIEW

### **Primary Goal**
Implement a complete shopping cart and checkout system with payment processing, enabling customers to purchase products from multiple farms in a single transaction.

### **Key Deliverables**
1. ✅ Shopping cart state management
2. ✅ Cart UI components (sidebar, page, item cards)
3. ✅ Add/remove/update cart items
4. ✅ Checkout flow (multi-step form)
5. ✅ Stripe payment integration
6. ✅ Order creation and confirmation
7. ✅ Email notifications
8. ✅ Order management (customer & farmer)

---

## 🎯 IMPLEMENTATION ROADMAP

### **Sprint 1: Cart State & UI** (3-4 hours)
**Priority**: HIGH

#### Tasks
1. **Cart Service Implementation**
   - File: `src/lib/services/cart.service.ts`
   - Features:
     - Add item to cart
     - Remove item from cart
     - Update item quantity
     - Clear cart
     - Get cart by user ID
     - Calculate cart totals (subtotal, tax, delivery, total)
     - Validate cart items (stock availability)
     - Group cart items by farm

2. **Cart State Management**
   - File: `src/hooks/useCart.ts`
   - Features:
     - React hook for cart operations
     - Optimistic UI updates
     - Local storage sync
     - Server sync on auth
     - Cart count badge

3. **Cart Server Actions**
   - File: `src/app/actions/cart.actions.ts`
   - Actions:
     - `addToCart(productId, quantity)`
     - `removeFromCart(itemId)`
     - `updateCartItem(itemId, quantity)`
     - `clearCart()`
     - `validateCart()`

4. **Cart UI Components**
   - **Cart Sidebar** (`src/components/features/cart/cart-sidebar.tsx`)
     - Slide-out panel
     - Cart items list
     - Quick actions
     - Checkout CTA

   - **Cart Item Card** (`src/components/features/cart/cart-item-card.tsx`)
     - Product image
     - Name, price, quantity
     - Update quantity controls
     - Remove button

   - **Cart Summary** (`src/components/features/cart/cart-summary.tsx`)
     - Subtotal
     - Tax calculation
     - Delivery fees
     - Total
     - Promo code input (future)

5. **Cart Page**
   - File: `src/app/(customer)/cart/page.tsx`
   - Full cart view
   - Grouped by farm
   - Delivery options per farm
   - Continue shopping CTA
   - Proceed to checkout button

**Database Schema**:
```prisma
model CartItem {
  id                String   @id @default(cuid())
  userId            String
  productId         String
  quantity          Int
  priceAtAdd        Decimal  @db.Decimal(10, 2)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(...)
  product           Product  @relation(...)

  @@unique([userId, productId])
  @@index([userId])
  @@map("cart_items")
}
```

---

### **Sprint 2: Checkout Flow** (3-4 hours)
**Priority**: HIGH

#### Tasks
1. **Checkout Service**
   - File: `src/lib/services/checkout.service.ts`
   - Features:
     - Initialize checkout session
     - Calculate order totals
     - Apply promo codes
     - Validate delivery addresses
     - Create pending orders
     - Handle payment callbacks

2. **Checkout Page** (`src/app/(customer)/checkout/page.tsx`)
   - Multi-step form:
     - Step 1: Review cart
     - Step 2: Delivery details
     - Step 3: Payment method
     - Step 4: Order confirmation

3. **Checkout Form Components**
   - **Address Form** (`src/components/features/checkout/address-form.tsx`)
     - Saved addresses dropdown
     - New address input
     - Address validation

   - **Delivery Options** (`src/components/features/checkout/delivery-options.tsx`)
     - Delivery vs pickup
     - Delivery time slots
     - Pickup locations

   - **Payment Method** (`src/components/features/checkout/payment-method.tsx`)
     - Stripe Elements integration
     - Card input
     - Saved payment methods

   - **Order Summary** (`src/components/features/checkout/order-summary.tsx`)
     - Final order review
     - Items grouped by farm
     - Total breakdown

4. **Checkout Server Actions**
   - File: `src/app/actions/checkout.actions.ts`
   - Actions:
     - `createCheckoutSession()`
     - `validateCheckout()`
     - `createOrder(checkoutData)`
     - `confirmPayment(paymentIntentId)`

---

### **Sprint 3: Stripe Integration** (2-3 hours)
**Priority**: HIGH

#### Tasks
1. **Stripe Service**
   - File: `src/lib/services/stripe.service.ts`
   - Features:
     - Create payment intent
     - Confirm payment
     - Refund payment
     - Get payment status
     - Handle webhooks

2. **Payment API Routes**
   - **Create Payment Intent**
     - File: `src/app/api/payments/create-intent/route.ts`
     - POST endpoint
     - Calculate amount from cart
     - Return client secret

   - **Webhook Handler**
     - File: `src/app/api/payments/webhook/route.ts`
     - Handle Stripe events:
       - `payment_intent.succeeded`
       - `payment_intent.failed`
       - `charge.refunded`
     - Verify webhook signature
     - Update order status

3. **Stripe Setup**
   - Environment variables:
     ```env
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLIC_KEY=pk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```
   - Install: `npm install stripe @stripe/stripe-js @stripe/react-stripe-js`

4. **Payment Component**
   - File: `src/components/features/checkout/payment-form.tsx`
   - Stripe Elements wrapper
   - Card Element styling
   - Error handling
   - Loading states

---

### **Sprint 4: Order Management** (2-3 hours)
**Priority**: MEDIUM

#### Tasks
1. **Order Confirmation Page**
   - File: `src/app/(customer)/orders/[orderId]/confirmation/page.tsx`
   - Success message
   - Order summary
   - Estimated delivery
   - Tracking info (future)
   - Print receipt

2. **Customer Order History**
   - File: `src/app/(customer)/orders/page.tsx`
   - List all orders
   - Filter by status
   - Order cards with summary
   - View details link

3. **Order Detail Page**
   - File: `src/app/(customer)/orders/[orderId]/page.tsx`
   - Complete order information
   - Items list
   - Delivery status
   - Payment details
   - Farm contact info
   - Reorder button

4. **Farmer Order Management**
   - File: `src/app/(farmer)/farmer/orders/page.tsx`
   - Incoming orders dashboard
   - Order status updates
   - Print packing slips
   - Bulk operations

---

## 🗄️ DATABASE UPDATES NEEDED

### New Tables
```prisma
// Already exists - just document usage
model Order {
  id                String        @id @default(cuid())
  orderNumber       String        @unique
  customerId        String
  farmId            String
  status            OrderStatus
  subtotal          Decimal       @db.Decimal(10, 2)
  tax               Decimal       @db.Decimal(10, 2)
  deliveryFee       Decimal       @db.Decimal(10, 2)
  total             Decimal       @db.Decimal(10, 2)
  deliveryMethod    DeliveryMethod
  deliveryAddress   Json?
  deliveryDate      DateTime?
  paymentIntentId   String?
  paymentStatus     PaymentStatus
  notes             String?
  createdAt         DateTime      @default(now())

  customer          User          @relation(...)
  farm              Farm          @relation(...)
  items             OrderItem[]

  @@index([customerId])
  @@index([farmId])
  @@index([status])
}

model OrderItem {
  id                String   @id @default(cuid())
  orderId           String
  productId         String
  productName       String
  quantity          Int
  unit              String
  unitPrice         Decimal  @db.Decimal(10, 2)
  subtotal          Decimal  @db.Decimal(10, 2)
  productSnapshot   Json

  order             Order    @relation(...)
  product           Product  @relation(...)
}
```

---

## 💳 PAYMENT FLOW DIAGRAM

```
Customer Adds Items to Cart
          ↓
    Proceeds to Checkout
          ↓
    Enters Delivery Details
          ↓
    Reviews Order
          ↓
    Enters Payment Info (Stripe)
          ↓
    Stripe Creates Payment Intent
          ↓
    Customer Confirms Payment
          ↓
    Stripe Webhook → payment_intent.succeeded
          ↓
    Order Created in Database
          ↓
    Cart Cleared
          ↓
    Email Notifications Sent
          ↓
    Redirect to Confirmation Page
```

---

## 🔑 KEY CONSIDERATIONS

### Cart State
- **Persistent**: Save to database for logged-in users
- **Guest carts**: Local storage + session transfer on login
- **Expiration**: Clear cart items after 7 days
- **Validation**: Check stock before checkout

### Multi-Farm Orders
- **Split orders**: One order per farm
- **Separate payments**: Each farm gets separate payment
- **Delivery fees**: Calculate per farm
- **Coordination**: Single checkout, multiple orders

### Payment Security
- **PCI compliance**: Use Stripe Elements (no card data on server)
- **Webhook verification**: Validate Stripe signature
- **Idempotency**: Handle duplicate webhooks
- **Error handling**: Graceful failures

### Tax Calculation
- **Location-based**: Use delivery address
- **API integration**: TaxJar or Avalara (future)
- **Simple rate**: Fixed percentage for MVP (e.g., 8%)

### Delivery
- **Pickup**: Farm location pickup
- **Delivery**: Address-based delivery
- **Time slots**: Farm-specific delivery windows
- **Radius check**: Validate delivery address within farm radius

---

## 🎨 UI/UX PATTERNS

### Cart Sidebar
- Slide from right
- Overlay on mobile
- Quick add/remove
- Always accessible (cart icon in header)

### Checkout Flow
- Progress indicator (1/4, 2/4, etc.)
- Back button on each step
- Auto-save progress
- Clear error messages
- Loading states on payment

### Order Confirmation
- Celebratory UI (confetti animation?)
- Clear next steps
- Download receipt option
- Share on social media (future)

---

## 🧪 TESTING CHECKLIST

### Cart Tests
- [ ] Add item to cart
- [ ] Remove item from cart
- [ ] Update quantity (min: 1, max: stock)
- [ ] Cart persists on page reload
- [ ] Cart syncs on login
- [ ] Out-of-stock items flagged

### Checkout Tests
- [ ] Multi-step form navigation
- [ ] Address validation
- [ ] Delivery option selection
- [ ] Payment form validation
- [ ] Order creation on success
- [ ] Error handling on failure

### Payment Tests
- [ ] Test card numbers work
- [ ] Declined card shows error
- [ ] Webhook creates order
- [ ] Duplicate webhooks handled
- [ ] Refund flow works

### Integration Tests
- [ ] End-to-end purchase flow
- [ ] Multi-farm order split
- [ ] Email notifications sent
- [ ] Inventory decremented
- [ ] Metrics updated

---

## 📦 DEPENDENCIES TO INSTALL

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
npm install zod  # For validation schemas
npm install date-fns  # For date formatting
```

---

## 🔐 ENVIRONMENT VARIABLES NEEDED

```env
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Tax Calculation (Optional for MVP)
TAXJAR_API_KEY=...

# Email (Already configured)
# SENDGRID_API_KEY=...
```

---

## 📊 SUCCESS METRICS

### Phase 4 Complete When:
- [ ] Customer can add products to cart
- [ ] Customer can view and modify cart
- [ ] Customer can complete checkout flow
- [ ] Stripe payment processing works
- [ ] Orders are created in database
- [ ] Email confirmations sent
- [ ] Farmer sees incoming orders
- [ ] Inventory is decremented
- [ ] 0 TypeScript errors
- [ ] All cart/checkout tests pass

---

## 🚀 GETTING STARTED

### Immediate Next Steps
1. **Review existing Order service** (`src/lib/services/order.service.ts`)
2. **Create cart service** (start with CRUD operations)
3. **Design cart UI components** (wireframes/mockups)
4. **Set up Stripe test account**
5. **Install Stripe dependencies**
6. **Create cart database migration** (if not exists)

### Recommended Order
1. Cart Service → Cart Actions → Cart Components
2. Cart Page → Cart Sidebar → Add to Cart Integration
3. Checkout Service → Checkout Page → Multi-step Form
4. Stripe Service → Payment API → Webhook Handler
5. Order Confirmation → Order History → Farmer Dashboard

---

## 📚 REFERENCE MATERIALS

### Stripe Documentation
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Elements](https://stripe.com/docs/stripe-js/react)
- [Webhooks](https://stripe.com/docs/webhooks)

### Design Inspiration
- Shopify checkout flow
- Amazon cart UI
- Etsy multi-vendor checkout

### Code Examples
- Next.js commerce (Vercel)
- Medusa.js checkout flow
- WooCommerce cart patterns

---

## 🎯 MVP vs Future Features

### MVP (Phase 4)
- ✅ Basic cart functionality
- ✅ Simple checkout (3 steps)
- ✅ Stripe payment only
- ✅ Email confirmations
- ✅ Basic order management

### Future Enhancements (Phase 5+)
- 🔜 Promo codes / discounts
- 🔜 Gift cards
- 🔜 Subscription orders
- 🔜 Split payment methods
- 🔜 Buy now, pay later (Afterpay, Klarna)
- 🔜 Apple Pay / Google Pay
- 🔜 Order tracking (real-time)
- 🔜 Driver assignment
- 🔜 Delivery route optimization

---

## 💡 TIPS & BEST PRACTICES

### Cart State Management
- Use optimistic updates for better UX
- Debounce quantity changes
- Show loading indicators
- Handle race conditions

### Payment Flow
- Never log sensitive payment data
- Use Stripe's client-side libraries
- Implement retry logic for webhooks
- Test all card scenarios (success, decline, etc.)

### Error Handling
- Show user-friendly messages
- Log detailed errors server-side
- Provide recovery actions
- Handle network failures gracefully

### Performance
- Lazy load checkout components
- Preload Stripe.js on cart page
- Cache cart data
- Optimize database queries

---

## 🐛 COMMON PITFALLS TO AVOID

1. **Cart sync issues**: Don't rely solely on local storage
2. **Stock validation**: Always check stock before payment
3. **Webhook duplicates**: Use idempotency keys
4. **Tax calculation**: Don't hardcode rates
5. **Multi-farm orders**: Don't combine into single order
6. **Payment errors**: Always show clear messages
7. **Session expiry**: Handle auth expiration during checkout

---

## 📞 QUICK COMMANDS

```bash
# Start development
npm run dev

# Type check
npm run type-check

# Test Stripe webhook locally
stripe listen --forward-to localhost:3000/api/payments/webhook

# View cart page
open http://localhost:3000/cart

# View checkout page
open http://localhost:3000/checkout
```

---

## ✅ PRE-FLIGHT CHECKLIST

Before starting Phase 4:
- [x] Phase 3 complete (Product Management) ✅
- [x] 0 TypeScript errors ✅
- [x] Database schema reviewed ✅
- [ ] Stripe account created
- [ ] Stripe test keys obtained
- [ ] Dependencies installed
- [ ] Cart UI mockups reviewed
- [ ] Team alignment on multi-farm order strategy

---

**Phase 4 Status**: 🟡 READY TO START
**Estimated Completion**: 8-12 hours
**Complexity**: 🔴 High
**Risk Level**: 🟡 Medium (payment integration)

🛒 **Let's build a cart that converts!** 🚀
