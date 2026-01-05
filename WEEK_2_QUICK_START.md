# 🚀 WEEK 2 QUICK START GUIDE
## Marketplace & Transactions Implementation

**Start Date**: After Week 1 Completion
**Duration**: 7 Days
**Prerequisite**: Week 1 (90% Complete) ✅
**Status**: READY TO BEGIN

---

## 📊 WEEK 1 COMPLETION STATUS

### ✅ What's Done (Week 1)
- ✅ Farm creation and management UI
- ✅ Product creation and management UI
- ✅ Product browsing with filters (search, category, price, organic)
- ✅ Product detail pages
- ✅ Authentication & authorization
- ✅ Base UI components
- ✅ Server actions for farms and products
- ✅ Type-safe architecture
- ✅ Zero TypeScript errors

### 🎯 Week 2 Goals
Build complete shopping and transaction experience:
1. Shopping cart UI and management
2. Checkout wizard (multi-step)
3. Stripe payment integration
4. Order creation and tracking
5. Email notifications
6. Farmer order management

---

## 🏗️ WEEK 2 IMPLEMENTATION ROADMAP

### Day 1-2: Shopping Cart (Monday-Tuesday)

**Objective**: Complete shopping cart experience

#### Features to Build:
- [ ] Cart page with item list
- [ ] Add to cart from product pages
- [ ] Update quantities
- [ ] Remove items
- [ ] Cart total calculation
- [ ] Empty cart state
- [ ] Continue shopping CTA

#### Files to Create/Modify:
```
📝 src/app/(customer)/cart/page.tsx
   - Display cart items
   - Show totals and fees
   - Link to checkout

📝 src/components/features/cart/cart-item.tsx
   - Individual cart item component
   - Quantity controls
   - Remove button
   - Price calculation

📝 src/components/features/cart/cart-summary.tsx
   - Subtotal calculation
   - Tax calculation (if applicable)
   - Delivery fees
   - Total amount
   - Checkout button

📝 src/components/features/products/add-to-cart-button.tsx
   - Add to cart action
   - Loading state
   - Success feedback
   - Cart icon animation

📝 src/app/actions/cart.actions.ts
   - addToCart(productId, quantity)
   - updateCartItem(itemId, quantity)
   - removeFromCart(itemId)
   - clearCart()
```

#### Backend APIs (Already Exist ✅):
```
✅ GET    /api/cart              - Get user's cart
✅ POST   /api/cart/items        - Add item to cart
✅ PATCH  /api/cart/items/[id]  - Update item quantity
✅ DELETE /api/cart/items/[id]  - Remove item
```

#### Implementation Pattern:
```typescript
// src/app/(customer)/cart/page.tsx
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { CartItem } from "@/components/features/cart/cart-item";
import { CartSummary } from "@/components/features/cart/cart-summary";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const cart = await database.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: { farm: true }
          }
        }
      }
    }
  });

  if (!cart || cart.items.length === 0) {
    return <EmptyCartState />;
  }

  const subtotal = cart.items.reduce((sum, item) => {
    return sum + (Number(item.product.price) * Number(item.quantity));
  }, 0);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary subtotal={subtotal} itemCount={cart.items.length} />
        </div>
      </div>
    </div>
  );
}
```

---

### Day 3-4: Checkout Wizard (Wednesday-Thursday)

**Objective**: Multi-step checkout process

#### Features to Build:
- [ ] Step 1: Shipping address selection/creation
- [ ] Step 2: Delivery method selection
- [ ] Step 3: Payment information (Stripe)
- [ ] Step 4: Order review and confirmation
- [ ] Progress indicator
- [ ] Back/Next navigation
- [ ] Form validation at each step
- [ ] Order summary sidebar (persistent)

#### Files to Create:
```
📝 src/app/(customer)/checkout/page.tsx
   - Checkout wizard container
   - Step management
   - Progress indicator

📝 src/components/features/checkout/checkout-wizard.tsx
   - Multi-step form logic
   - Step navigation
   - State management

📝 src/components/features/checkout/shipping-step.tsx
   - Address selection
   - New address form
   - Validation

📝 src/components/features/checkout/delivery-step.tsx
   - Delivery method options
   - Pickup location selection
   - Delivery date/time

📝 src/components/features/checkout/payment-step.tsx
   - Stripe Elements integration
   - Card input
   - Payment method selection

📝 src/components/features/checkout/review-step.tsx
   - Order summary
   - Terms acceptance
   - Place order button

📝 src/app/actions/checkout.actions.ts
   - createOrder(checkoutData)
   - processPayment(orderId, paymentIntentId)
```

#### Checkout Wizard Pattern:
```typescript
"use client";

import { useState } from "react";

type CheckoutStep = "shipping" | "delivery" | "payment" | "review";

export function CheckoutWizard() {
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [data, setData] = useState({
    addressId: "",
    deliveryMethod: "",
    paymentMethod: "",
  });

  const steps: CheckoutStep[] = ["shipping", "delivery", "payment", "review"];
  const currentStepIndex = steps.indexOf(step);

  const goToNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]!);
    }
  };

  const goToPrevious = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]!);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <CheckoutProgress steps={steps} currentStep={step} />

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          {step === "shipping" && (
            <ShippingStep
              data={data}
              onNext={(addressId) => {
                setData({ ...data, addressId });
                goToNext();
              }}
            />
          )}
          {step === "delivery" && (
            <DeliveryStep
              data={data}
              onNext={(method) => {
                setData({ ...data, deliveryMethod: method });
                goToNext();
              }}
              onBack={goToPrevious}
            />
          )}
          {step === "payment" && (
            <PaymentStep
              data={data}
              onNext={(paymentMethod) => {
                setData({ ...data, paymentMethod });
                goToNext();
              }}
              onBack={goToPrevious}
            />
          )}
          {step === "review" && (
            <ReviewStep data={data} onBack={goToPrevious} />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummarySidebar />
        </div>
      </div>
    </div>
  );
}
```

---

### Day 5: Stripe Integration (Friday)

**Objective**: Complete payment processing

#### Features to Build:
- [ ] Stripe Elements integration
- [ ] Payment Intent creation
- [ ] Card payment handling
- [ ] 3D Secure support
- [ ] Payment success handling
- [ ] Payment failure handling
- [ ] Webhook endpoint for payment events

#### Files to Create:
```
📝 src/lib/stripe/client.ts
   - Stripe client initialization
   - loadStripe helper

📝 src/lib/stripe/server.ts
   - Server-side Stripe operations
   - Create payment intent
   - Confirm payment

📝 src/components/features/payment/stripe-payment-form.tsx
   - Stripe Elements wrapper
   - Card input component
   - Submit handling

📝 src/app/api/payments/create-intent/route.ts
   - Create PaymentIntent endpoint
   - Calculate amount from cart

📝 src/app/api/webhooks/stripe/route.ts
   - Stripe webhook handler
   - payment_intent.succeeded
   - payment_intent.failed
   - charge.refunded
```

#### Stripe Setup:
```bash
# Install Stripe
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

#### Environment Variables:
```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Payment Intent Creation:
```typescript
// src/app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's cart
    const cart = await database.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Calculate total
    const amount = cart.items.reduce((sum, item) => {
      return sum + (Number(item.product.price) * Number(item.quantity));
    }, 0);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: session.user.id,
        cartId: cart.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment Intent creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
```

#### Stripe Payment Component:
```typescript
"use client";

import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ clientSecret, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
    } else if (paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export function StripePaymentForm({ amount, onSuccess }: Props) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);

  if (!clientSecret) return <div>Loading...</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm clientSecret={clientSecret} onSuccess={onSuccess} />
    </Elements>
  );
}
```

---

### Day 6: Order Management (Saturday)

**Objective**: Order creation and tracking

#### Features to Build:
- [ ] Create order from cart after payment
- [ ] Order confirmation page
- [ ] Order history page
- [ ] Order detail page
- [ ] Order status updates
- [ ] Cancel order functionality
- [ ] Farmer order management page

#### Files to Create:
```
📝 src/app/(customer)/orders/page.tsx
   - Order history list
   - Filter by status
   - Search orders

📝 src/app/(customer)/orders/[orderId]/page.tsx
   - Order detail view
   - Status timeline
   - Items ordered
   - Delivery information
   - Cancel order button

📝 src/app/(farmer)/farmer/orders/page.tsx
   - Farmer's incoming orders
   - Filter by status
   - Bulk actions

📝 src/app/(farmer)/farmer/orders/[orderId]/page.tsx
   - Farmer order detail
   - Update status
   - Print packing slip
   - Contact customer

📝 src/app/actions/order.actions.ts
   - createOrderFromCart(paymentIntentId)
   - cancelOrder(orderId)
   - updateOrderStatus(orderId, status)
```

#### Order Creation After Payment:
```typescript
// src/app/actions/order.actions.ts
"use server";

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { revalidatePath } from "next/cache";

export async function createOrderFromCart(paymentIntentId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // Get cart with items
    const cart = await database.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { farm: true }
            }
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    // Group items by farm
    const itemsByFarm = cart.items.reduce((acc, item) => {
      const farmId = item.product.farmId;
      if (!acc[farmId]) acc[farmId] = [];
      acc[farmId].push(item);
      return acc;
    }, {} as Record<string, typeof cart.items>);

    // Create separate order for each farm
    const orders = await Promise.all(
      Object.entries(itemsByFarm).map(async ([farmId, items]) => {
        const total = items.reduce((sum, item) => {
          return sum + (Number(item.product.price) * Number(item.quantity));
        }, 0);

        return database.order.create({
          data: {
            customerId: session.user.id,
            farmId,
            status: "PENDING",
            total,
            paymentStatus: "PAID",
            paymentIntentId,
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                priceAtTime: item.product.price,
                productName: item.product.name,
              }))
            }
          }
        });
      })
    );

    // Clear cart after order creation
    await database.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    revalidatePath("/orders");
    revalidatePath("/farmer/orders");

    return { success: true, orders };
  } catch (error) {
    console.error("Order creation error:", error);
    return { success: false, error: "Failed to create order" };
  }
}
```

---

### Day 7: Email Notifications (Sunday)

**Objective**: Transactional emails

#### Features to Build:
- [ ] Order confirmation email (customer)
- [ ] New order notification (farmer)
- [ ] Order status update emails
- [ ] Farm approval email
- [ ] Password reset email
- [ ] Welcome email

#### Setup Email Service:
```bash
# Option 1: Resend (Recommended)
npm install resend react-email

# Option 2: SendGrid
npm install @sendgrid/mail

# Option 3: Nodemailer
npm install nodemailer
```

#### Environment Variables:
```env
# .env.local
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

#### Files to Create:
```
📝 src/lib/email/index.ts
   - Email service wrapper
   - Send functions

📝 src/lib/email/templates/order-confirmation.tsx
   - Order confirmation email template

📝 src/lib/email/templates/order-notification.tsx
   - New order notification (farmer)

📝 src/lib/email/templates/order-status-update.tsx
   - Status change email

📝 src/lib/email/templates/farm-approved.tsx
   - Farm approval email

📝 src/lib/email/templates/welcome.tsx
   - Welcome email template
```

#### Email Service Implementation:
```typescript
// src/lib/email/index.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(order: Order) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: order.customer.email,
      subject: `Order Confirmation - #${order.id}`,
      react: OrderConfirmationEmail({ order }),
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
}

export async function sendNewOrderNotification(order: Order) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: order.farm.email,
      subject: `New Order Received - #${order.id}`,
      react: NewOrderNotificationEmail({ order }),
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
}
```

#### Email Template Example:
```typescript
// src/lib/email/templates/order-confirmation.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OrderConfirmationEmailProps {
  order: Order;
}

export default function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmed! 🎉</Heading>

          <Text style={text}>
            Thank you for your order from {order.farm.name}!
          </Text>

          <Section style={orderInfo}>
            <Text style={text}>Order Number: #{order.id}</Text>
            <Text style={text}>Total: ${Number(order.total).toFixed(2)}</Text>
          </Section>

          {/* Order items */}
          {order.items.map(item => (
            <Section key={item.id}>
              <Text style={text}>
                {item.quantity}x {item.productName} -
                ${Number(item.priceAtTime).toFixed(2)}
              </Text>
            </Section>
          ))}

          <Text style={text}>
            Your order will be prepared soon. You'll receive another email
            when your order is ready for pickup or delivery.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
};

const orderInfo = {
  backgroundColor: "#f6f9fc",
  borderRadius: "4px",
  padding: "16px",
  margin: "16px 0",
};
```

---

## 🧪 TESTING CHECKLIST

### Cart Testing
- [ ] Add product to cart from detail page
- [ ] Add product to cart from listing page
- [ ] Update quantity in cart
- [ ] Remove item from cart
- [ ] Cart persists across sessions
- [ ] Cart total calculates correctly
- [ ] Empty cart state shows correctly

### Checkout Testing
- [ ] Progress through all steps
- [ ] Back button works at each step
- [ ] Form validation at each step
- [ ] Address selection/creation works
- [ ] Payment form loads correctly
- [ ] 3D Secure flow works
- [ ] Success redirect after payment
- [ ] Order created in database

### Payment Testing
```bash
# Stripe Test Cards
4242 4242 4242 4242  # Success
4000 0027 6000 3184  # 3D Secure required
4000 0000 0000 0002  # Card declined
```

### Order Testing
- [ ] Order appears in customer order history
- [ ] Order appears in farmer order management
- [ ] Order detail pages show correct information
- [ ] Order status can be updated
- [ ] Cancel order works
- [ ] Email notifications sent

### Email Testing
- [ ] Order confirmation sent to customer
- [ ] New order notification sent to farmer
- [ ] Status update emails work
- [ ] Email templates render correctly
- [ ] Links in emails work

---

## 💡 PRO TIPS

### 1. Use Optimistic Updates for Cart
```typescript
// Update UI immediately, sync with server
const [items, setItems] = useState(cartItems);

function handleQuantityChange(itemId: string, quantity: number) {
  // Optimistic update
  setItems(items.map(item =>
    item.id === itemId ? { ...item, quantity } : item
  ));

  // Sync with server
  updateCartItem(itemId, quantity);
}
```

### 2. Handle Payment Errors Gracefully
```typescript
try {
  const result = await stripe.confirmPayment(...);
  if (result.error) {
    // Show user-friendly error
    if (result.error.code === "card_declined") {
      setError("Your card was declined. Please try another payment method.");
    } else {
      setError("Payment failed. Please try again.");
    }
  }
} catch (error) {
  setError("An unexpected error occurred. Please try again.");
}
```

### 3. Webhook Security
```typescript
// Always verify webhook signatures
const signature = request.headers.get("stripe-signature");

try {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  // Process event
} catch (error) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
}
```

### 4. Email Queue (Optional)
For high-volume apps, consider using a queue:
```typescript
// Use Redis or database queue
await emailQueue.add("order-confirmation", {
  orderId: order.id,
  customerEmail: order.customer.email,
});
```

---

## 📈 SUCCESS METRICS

Week 2 is complete when:
- [ ] Customers can add products to cart
- [ ] Customers can complete checkout
- [ ] Payments process successfully via Stripe
- [ ] Orders are created and tracked
- [ ] Farmers receive order notifications
- [ ] Email notifications work
- [ ] All error cases handled gracefully
- [ ] Zero TypeScript errors
- [ ] Mobile responsive

---

## 🚀 READY TO START?

### Quick Start Commands:
```bash
# Ensure Week 1 is committed
git status

# Start dev environment
docker-compose -f docker-compose.dev.yml up -d
npm run dev

# Type check before starting
npm run type-check

# Open in browser
http://localhost:3001
```

### First Task: Shopping Cart Page
Start with `src/app/(customer)/cart/page.tsx` and build from there!

---

**Good luck with Week 2! You've got this! 🚀**

_"From browsing to buying - let's build divine transactions."_ 🌾⚡
