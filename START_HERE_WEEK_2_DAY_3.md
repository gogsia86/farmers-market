# 🚀 START HERE: Week 2 Day 3 - Checkout Wizard Implementation

**Focus**: Multi-Step Checkout Flow
**Prerequisites**: Day 1 (Add to Cart) ✅ | Day 2 (Cart Badge) ✅
**Estimated Time**: 4-6 hours
**Difficulty**: ⭐⭐⭐⭐ (High - Complex wizard flow)

---

## 📋 Day 3 Objectives

### Primary Goals
1. ✅ Create multi-step checkout wizard (4 steps)
2. ✅ Implement shipping address form with validation
3. ✅ Build delivery/pickup selection step
4. ✅ Create payment method UI (Stripe integration Day 5)
5. ✅ Implement order review and confirmation step
6. ✅ Add wizard navigation (prev/next, progress indicator)
7. ✅ Implement form state management across steps

### Success Criteria
- [ ] Checkout wizard with 4 functional steps
- [ ] Address validation with Zod schemas
- [ ] Step-by-step navigation with validation
- [ ] Progress indicator showing current step
- [ ] Cart summary sidebar
- [ ] Mobile-responsive layout
- [ ] Type-safe form handling
- [ ] Zero TypeScript errors

---

## 🎯 What You're Building Today

### Checkout Wizard Structure
```
/checkout
├── Step 1: Shipping Address
│   ├── Address form (street, city, state, zip)
│   ├── Save to profile option
│   └── Address validation
├── Step 2: Delivery/Pickup
│   ├── Delivery option (with address)
│   ├── Pickup option (farm selection)
│   └── Date/time selection
├── Step 3: Payment Method
│   ├── Credit card (Stripe - placeholder for Day 5)
│   ├── PayPal (future)
│   └── Cash on pickup (future)
└── Step 4: Review & Confirm
    ├── Order summary
    ├── Address confirmation
    ├── Payment method confirmation
    └── Place order button
```

### Visual Design
- **Desktop**: 2-column layout (wizard left, cart summary right)
- **Mobile**: Single column, collapsible cart summary
- **Progress**: Step indicator at top (1 → 2 → 3 → 4)
- **Navigation**: Back/Next buttons, disabled until valid

---

## 📁 Files to Create

### 1. Checkout Page (Server Component)
**Path**: `src/app/(customer)/checkout/page.tsx`
**Purpose**: Main checkout page, loads cart and wraps wizard
**Key Features**:
- Server component that fetches user's cart
- Authentication check (redirect if not logged in)
- Passes cart data to client CheckoutWizard
- Loading state while fetching cart

### 2. Checkout Wizard (Client Component)
**Path**: `src/components/features/checkout/checkout-wizard.tsx`
**Purpose**: Main wizard orchestrator with state management
**Key Features**:
- Manages current step state (1-4)
- Handles form data across steps
- Validates each step before proceeding
- Renders appropriate step component
- Progress indicator UI

### 3. Shipping Step (Client Component)
**Path**: `src/components/features/checkout/shipping-step.tsx`
**Purpose**: Address form with validation
**Key Features**:
- Address input fields (street, city, state, zip)
- Real-time validation with Zod
- Load saved addresses from user profile
- Save new address option
- Form error display

### 4. Delivery Step (Client Component)
**Path**: `src/components/features/checkout/delivery-step.tsx`
**Purpose**: Delivery vs pickup selection
**Key Features**:
- Radio buttons for delivery/pickup
- Farm selection for pickup orders
- Delivery date/time picker
- Pickup time slot selection
- Per-farm delivery fee calculation

### 5. Payment Step (Client Component)
**Path**: `src/components/features/checkout/payment-step.tsx`
**Purpose**: Payment method selection (placeholder for now)
**Key Features**:
- Payment method radio buttons
- Placeholder for Stripe Elements (Day 5)
- Billing address same as shipping checkbox
- Payment security badges

### 6. Review Step (Client Component)
**Path**: `src/components/features/checkout/review-step.tsx`
**Purpose**: Final order review before submission
**Key Features**:
- Order items display (grouped by farm)
- Shipping/pickup address display
- Payment method display
- Order totals (subtotal, tax, delivery, total)
- Terms & conditions checkbox
- Place order button

### 7. Cart Summary Sidebar (Client Component)
**Path**: `src/components/features/checkout/cart-summary.tsx`
**Purpose**: Fixed sidebar showing cart contents
**Key Features**:
- Cart items list (compact view)
- Subtotal, tax, delivery, total
- Promo code input (future)
- Sticky positioning on scroll

---

## 🔧 Implementation Guide

### Step 1: Create Checkout Page (Server Component)

**File**: `src/app/(customer)/checkout/page.tsx`

```typescript
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { redirect } from "next/navigation";
import { CheckoutWizard } from "@/components/features/checkout/checkout-wizard";

export const metadata = {
  title: "Checkout | Farmers Market Platform",
  description: "Complete your order",
};

export default async function CheckoutPage() {
  // Require authentication
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const userId = session.user.id;

  // Fetch cart with all relationships
  const cart = await database.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Redirect if cart is empty
  if (cart.length === 0) {
    redirect("/cart");
  }

  // Fetch user addresses
  const addresses = await database.userAddress.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Checkout
        </h1>
        <CheckoutWizard
          cart={cart}
          savedAddresses={addresses}
          userId={userId}
        />
      </div>
    </div>
  );
}
```

### Step 2: Create Wizard Orchestrator

**File**: `src/components/features/checkout/checkout-wizard.tsx`

```typescript
"use client";

import { useState } from "react";
import { ShippingStep } from "./shipping-step";
import { DeliveryStep } from "./delivery-step";
import { PaymentStep } from "./payment-step";
import { ReviewStep } from "./review-step";
import { CartSummary } from "./cart-summary";
import type { CartItem, Product, Farm, UserAddress } from "@prisma/client";

// Types
interface CheckoutFormData {
  shipping: ShippingAddress | null;
  delivery: DeliveryInfo | null;
  payment: PaymentInfo | null;
}

export function CheckoutWizard({ cart, savedAddresses, userId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping: null,
    delivery: null,
    payment: null,
  });

  const steps = [
    { number: 1, name: "Shipping", component: ShippingStep },
    { number: 2, name: "Delivery", component: DeliveryStep },
    { number: 3, name: "Payment", component: PaymentStep },
    { number: 4, name: "Review", component: ReviewStep },
  ];

  const handleStepComplete = (stepData: any) => {
    // Save step data
    setFormData({ ...formData, [getStepKey(currentStep)]: stepData });
    // Move to next step
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Wizard */}
      <div className="lg:col-span-2">
        {/* Progress Indicator */}
        <ProgressIndicator steps={steps} currentStep={currentStep} />

        {/* Current Step */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <CurrentStepComponent
            formData={formData}
            onComplete={handleStepComplete}
            onBack={handleBack}
            cart={cart}
            savedAddresses={savedAddresses}
          />
        </div>
      </div>

      {/* Cart Summary Sidebar */}
      <div className="lg:col-span-1">
        <CartSummary cart={cart} />
      </div>
    </div>
  );
}
```

### Step 3: Create Shipping Address Step

**File**: `src/components/features/checkout/shipping-step.tsx`

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Validation schema
const shippingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  street: z.string().min(5, "Street address required"),
  city: z.string().min(2, "City required"),
  state: z.string().length(2, "State must be 2 characters (e.g., CA)"),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
  saveAddress: z.boolean().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export function ShippingStep({ formData, onComplete, savedAddresses }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: formData.shipping || savedAddresses[0] || {},
  });

  const onSubmit = (data: ShippingFormData) => {
    onComplete(data);
  };

  const loadAddress = (address: any) => {
    Object.keys(address).forEach((key) => {
      setValue(key as any, address[key]);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Shipping Address
        </h2>
        <p className="text-sm text-gray-600">
          Where should we deliver your order?
        </p>
      </div>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="space-y-2">
          <Label>Saved Addresses</Label>
          {savedAddresses.map((addr) => (
            <button
              key={addr.id}
              type="button"
              onClick={() => loadAddress(addr)}
              className="block w-full rounded border p-3 text-left hover:bg-gray-50"
            >
              <p className="font-medium">{addr.fullName}</p>
              <p className="text-sm text-gray-600">
                {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="1234567890"
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            {...register("street")}
            placeholder="123 Main St, Apt 4B"
          />
          {errors.street && (
            <p className="text-sm text-red-600">{errors.street.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} placeholder="San Francisco" />
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} placeholder="CA" />
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input id="zipCode" {...register("zipCode")} placeholder="94105" />
          {errors.zipCode && (
            <p className="text-sm text-red-600">{errors.zipCode.message}</p>
          )}
        </div>
      </div>

      {/* Save Address */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="saveAddress"
          {...register("saveAddress")}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="saveAddress" className="font-normal">
          Save this address to my profile
        </Label>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          Continue to Delivery
        </Button>
      </div>
    </form>
  );
}
```

---

## 🎨 Key Design Patterns

### 1. Wizard State Management
```typescript
// Centralized form state across steps
const [formData, setFormData] = useState({
  shipping: null,    // Step 1 data
  delivery: null,    // Step 2 data
  payment: null,     // Step 3 data
});

// Pass down to each step
<StepComponent
  formData={formData}
  onComplete={(data) => updateFormData(data)}
/>
```

### 2. Step Validation
```typescript
// Each step uses Zod for validation
const schema = z.object({
  field: z.string().min(1),
});

// React Hook Form integration
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

### 3. Progress Indicator
```typescript
const steps = [
  { number: 1, name: "Shipping", completed: currentStep > 1 },
  { number: 2, name: "Delivery", completed: currentStep > 2 },
  { number: 3, name: "Payment", completed: currentStep > 3 },
  { number: 4, name: "Review", completed: false },
];

// Visual: ● → ○ → ○ → ○ (filled = completed/current)
```

---

## 📦 Required Dependencies

### Already Installed
- ✅ `zod` - Schema validation
- ✅ `react-hook-form` - Form state management
- ✅ `@hookform/resolvers` - Zod + RHF integration

### To Install (if needed)
```bash
npm install react-hook-form @hookform/resolvers zod
```

---

## 🎯 Step-by-Step Implementation Order

### Phase 1: Foundation (1 hour)
1. Create checkout page (`src/app/(customer)/checkout/page.tsx`)
2. Create wizard orchestrator (`checkout-wizard.tsx`)
3. Create progress indicator component
4. Test navigation between empty steps

### Phase 2: Shipping Step (1 hour)
1. Create shipping step component
2. Implement address form with validation
3. Add saved addresses display
4. Test form validation and submission

### Phase 3: Delivery Step (1 hour)
1. Create delivery step component
2. Add delivery vs pickup radio buttons
3. Implement date/time picker
4. Add farm selection for pickup
5. Calculate delivery fees per farm

### Phase 4: Payment Step (1 hour)
1. Create payment step component
2. Add payment method radio buttons
3. Create placeholder for Stripe (Day 5)
4. Add billing address option

### Phase 5: Review Step (1 hour)
1. Create review step component
2. Display order summary
3. Show all form data from previous steps
4. Add terms & conditions checkbox
5. Create place order button

### Phase 6: Polish & Testing (1 hour)
1. Create cart summary sidebar
2. Add mobile responsive styles
3. Test full checkout flow end-to-end
4. Fix TypeScript errors
5. Test validation edge cases

---

## 🧪 Testing Checklist

### Navigation
- [ ] Can navigate forward through all steps
- [ ] Can navigate backward without losing data
- [ ] Cannot skip steps without validation
- [ ] Progress indicator updates correctly

### Shipping Step
- [ ] All form fields validate correctly
- [ ] Saved addresses load properly
- [ ] Can select and auto-fill saved address
- [ ] Save address checkbox works
- [ ] Error messages display for invalid input

### Delivery Step
- [ ] Can toggle between delivery and pickup
- [ ] Farm list displays for pickup option
- [ ] Date picker shows valid dates only
- [ ] Time slots appropriate for selected date
- [ ] Delivery fee calculates correctly per farm

### Payment Step
- [ ] Payment method selection works
- [ ] Billing address toggle works
- [ ] Placeholder text for Stripe integration

### Review Step
- [ ] All order details display correctly
- [ ] Can edit any step from review
- [ ] Terms checkbox required to proceed
- [ ] Place order button disabled until terms accepted

### Overall
- [ ] Cart summary displays correctly
- [ ] Mobile layout responsive
- [ ] Zero TypeScript errors
- [ ] Fast page load times
- [ ] Accessible (keyboard navigation)

---

## 🔗 Integration Points

### From Previous Days
- ✅ Cart data from Day 1 (`useCart` hook)
- ✅ Auth session from Day 2 (`useSession` hook)
- ✅ Toast notifications from Day 2

### For Future Days
- 🔜 Stripe integration (Day 5)
- 🔜 Order creation (Day 6)
- 🔜 Email notifications (Day 7)

---

## 📚 Reference Documentation

### Divine Instructions
- `.github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md` - Next.js patterns
- `.github/instructions/08_UX_DESIGN_CONSCIOUSNESS.instructions.md` - UX patterns
- `.github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md` - Validation

### Existing Code to Reference
- `src/app/(customer)/cart/page.tsx` - Cart page structure
- `src/components/features/products/add-to-cart-button.tsx` - Form validation example
- `src/hooks/useCart.ts` - Cart state management

---

## 🚨 Common Pitfalls to Avoid

1. **Don't skip validation** - Each step MUST validate before proceeding
2. **Don't lose form data** - Save state when navigating back
3. **Don't block UI** - Use optimistic updates where possible
4. **Don't forget mobile** - Test on small screens
5. **Don't hardcode data** - Use cart data from props
6. **Don't create new Prisma instances** - Use canonical `database` import

---

## ✅ Day 3 Completion Checklist

- [ ] Checkout page created and authenticated
- [ ] Wizard orchestrator with state management
- [ ] Progress indicator component
- [ ] Shipping step with address form
- [ ] Delivery step with date/time selection
- [ ] Payment step (placeholder for Stripe)
- [ ] Review step with order summary
- [ ] Cart summary sidebar
- [ ] Mobile responsive design
- [ ] Form validation with Zod
- [ ] Zero TypeScript errors (`npm run type-check`)
- [ ] End-to-end checkout flow tested
- [ ] Documentation updated

---

## 🎉 Ready to Start?

### Quick Start Commands
```bash
# 1. Start development server
npm run dev

# 2. Open Prisma Studio (view cart data)
npx prisma studio

# 3. Type check (run after changes)
npm run type-check

# 4. Test in browser
# http://localhost:3000/checkout
```

### Test Accounts (from Week 1)
- **Customer**: customer@example.com / password123
- **Farmer**: farmer1@example.com / password123
- **Admin**: admin@example.com / password123

### First Step
1. Create `src/app/(customer)/checkout/page.tsx`
2. Add authentication check and cart fetch
3. Test that page loads with cart data
4. Then create wizard component

---

**Let's build a divine checkout experience! 🌾⚡**

**Status**: READY TO START DAY 3
**Expected Duration**: 4-6 hours
**Next Session Preview**: Day 4 - Enhanced checkout features and cart validation
