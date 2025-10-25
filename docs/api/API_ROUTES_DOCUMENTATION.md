# FARMERS MARKET - API ROUTES DOCUMENTATION

**Generated**: October 19, 2025
**Coverage**: FR-001 through FR-023
**Framework**: Next.js 14 App Router
**Total Routes**: 5 critical endpoints created

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Routes Created](#api-routes-created)
4. [Common Patterns](#common-patterns)
5. [Error Handling](#error-handling)
6. [Next Steps](#next-steps)

---

## 🌟 Overview

This document catalogs all Next.js API routes created for the Farmers Market platform. Each route follows divine coding principles with:

- ✅ **Zod validation** for type-safe request validation
- ✅ **Prisma ORM** for database operations
- ✅ **NextAuth session** management for authentication
- ✅ **Comprehensive error handling** with enlightening error messages
- ✅ **Transaction support** for data integrity
- ✅ **Real-time stock management** with inventory logging
- ✅ **Stripe Connect split payments** (85% farmer, 15% platform)

---

## 🔐 Authentication

All protected routes use `getServerSession()` from NextAuth.js:

```typescript
const session = await getServerSession();
if (!session?.user) {
  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 }
  );
}
```

**Roles**:

- `CONSUMER`: Can browse, purchase, review
- `FARMER`: Can manage farms, products, orders
- `ADMIN`: Platform administration (future)

---

## 🚀 API Routes Created

### 1. Farmer Registration (FR-001)

**File**: `src/app/api/auth/register/farmer/route.ts`

**Endpoint**: `POST /api/auth/register/farmer`

**Purpose**: Creates new farmer account with farm and initiates Stripe Connect onboarding

**Request Body**:

```typescript
{
  // User Info
  email: string;
  password: string; // Min 8 chars, uppercase, lowercase, number
  firstName: string;
  lastName: string;
  phone: string;

  // Farm Info
  farmName: string;
  farmDescription?: string;

  // Location
  address: string;
  city: string;
  state: string; // 2-letter code
  zipCode: string;
  latitude: number;
  longitude: number;

  // Business (optional)
  businessName?: string;
  taxId?: string;

  // Terms
  acceptTerms: true;
}
```

**Response** (201 Created):

```typescript
{
  success: true;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "FARMER";
  }
  farm: {
    id: string;
    name: string;
    slug: string;
    status: "PENDING";
  }
  message: "Registration successful! Please check your email to verify your account.";
}
```

**Features**:

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Email verification token generation (24-hour expiry)
- ✅ Farm slug generation (unique)
- ✅ Stripe Connect account creation
- ✅ Atomic transaction (user + farm created together)
- ✅ Async email sending (non-blocking)

---

### 2. Product Listing (FR-003)

**File**: `src/app/api/farms/[farmId]/products/route.ts`

**Endpoints**:

- `POST /api/farms/:farmId/products` - Create product
- `GET /api/farms/:farmId/products` - List products

#### POST - Create Product

**Authorization**: Farm owner or active team member

**Request Body**:

```typescript
{
  name: string;
  description?: string;
  category: ProductCategory; // VEGETABLES, FRUITS, DAIRY, etc.
  price: number; // Positive
  compareAtPrice?: number; // Original price if on sale
  unit: string; // lb, bunch, dozen, each, pint

  // Inventory
  trackInventory?: boolean; // Default: true
  quantityAvailable?: number;
  lowStockThreshold?: number;
  allowBackorder?: boolean;

  // Attributes
  organic?: boolean;
  seasonal?: boolean;
  seasonalStart?: string; // ISO datetime
  seasonalEnd?: string;
  harvestDate?: string;
  storageInstructions?: string;

  // Images
  primaryPhoto?: string; // Base64 or URL
  additionalPhotos?: string[];

  // Variants
  hasVariants?: boolean;
  variants?: Array<{
    size: string;
    price: number;
    quantityAvailable?: number;
  }>;

  // Tags
  tags?: string[]; // ["heirloom", "non-gmo"]

  // Publishing
  publishNow?: boolean; // Default: true
  scheduledPublishAt?: string;
}
```

**Response** (201 Created):

```typescript
{
  success: true;
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
    price: number;
    status: "ACTIVE" | "DRAFT";
    farm: {
      id: string;
      name: string;
      slug: string;
    }
  }
  message: "Product published successfully!" | "Product saved as draft";
}
```

**Features**:

- ✅ Photo upload to S3 (async, non-blocking)
- ✅ Product slug generation (unique per farm)
- ✅ Inventory logging for audit trail
- ✅ Variant support (JSONB)
- ✅ Scheduled publishing
- ✅ Team member authorization check

#### GET - List Products

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Filter by category
- `status`: Filter by status (default: ACTIVE)
- `organic`: Filter organic products (true/false)
- `inStock`: Filter in-stock products (true/false)

**Response**:

```typescript
{
  success: true;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string;
    price: number;
    unit: string;
    status: string;
    quantityAvailable: number | null;
    organic: boolean;
    seasonal: boolean;
    primaryPhotoUrl: string | null;
    averageRating: number | null;
    reviewCount: number;
    createdAt: Date;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  }
}
```

---

### 3. Shopping Cart (FR-013)

**File**: `src/app/api/cart/items/route.ts`

**Endpoints**:

- `POST /api/cart/items` - Add to cart
- `GET /api/cart` - Get cart grouped by farm

#### POST - Add to Cart

**Authorization**: Authenticated user

**Request Body**:

```typescript
{
  productId: string;
  quantity: number; // Positive
  fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
}
```

**Response** (201 Created):

```typescript
{
  success: true;
  cartItem: {
    id: string;
    productId: string;
    quantity: number;
    unit: string;
    priceAtAdd: number;
    fulfillmentMethod: string;
    product: {
      id: string;
      name: string;
      primaryPhotoUrl: string | null;
      farm: {
        id: string;
        name: string;
        slug: string;
      }
    }
  }
  message: "Item added to cart";
}
```

**Features**:

- ✅ Stock validation before adding
- ✅ Automatic quantity update if item already in cart
- ✅ 30-minute stock reservation
- ✅ Price snapshot at add time
- ✅ Cart analytics (increment cartAddsCount)
- ✅ Backorder support check

#### GET - Get Cart

**Authorization**: Authenticated user

**Response**:

```typescript
{
  success: true;
  cart: {
    farms: Array<{
      farm: {
        id: string;
        name: string;
        slug: string;
        deliveryRadius: number;
      };
      items: Array<{
        id: string;
        productId: string;
        productName: string;
        quantity: number;
        unit: string;
        priceAtAdd: number;
        currentPrice: number;
        primaryPhotoUrl: string | null;
        subtotal: number;
        fulfillmentMethod: string;
        status: string;
        inStock: boolean;
        organic: boolean;
      }>;
      subtotal: number;
      itemCount: number;
    }>;
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
    farmCount: number;
  }
}
```

**Features**:

- ✅ Grouped by farm for multi-farm cart
- ✅ Real-time stock status check
- ✅ Price comparison (priceAtAdd vs currentPrice)
- ✅ Per-farm subtotals
- ✅ Overall cart metrics

---

### 4. Checkout & Order Creation (FR-014)

**File**: `src/app/api/orders/checkout/route.ts`

**Endpoint**: `POST /api/orders/checkout`

**Authorization**: Authenticated user OR guest with email

**Request Body**:

```typescript
{
  // Delivery (optional if all pickup)
  deliveryAddressId?: string;

  // Per-farm fulfillment
  farmFulfillmentMethods: {
    [farmId: string]: {
      method: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
      scheduledDate?: string; // ISO datetime
      scheduledTimeSlot?: string; // "2:00 PM - 4:00 PM"
      specialInstructions?: string;
    };
  };

  // Payment
  paymentMethodId: string; // Stripe Payment Method ID
  savePaymentMethod?: boolean;

  // Guest checkout
  guestEmail?: string;
}
```

**Response** (201 Created):

```typescript
{
  success: true;
  orders: Array<{
    id: string;
    orderNumber: string; // FM-001234
    farmId: string;
    farmName: string;
    total: number;
    status: "PENDING";
    fulfillmentMethod: string;
    itemCount: number;
  }>;
  message: "2 order(s) placed successfully!";
}
```

**Features**:

- ✅ **One order per farm** (multi-farm checkout creates multiple orders)
- ✅ **Stripe Connect split payment**:
  - 85% to farmer (subtotal + delivery fee - platform fee)
  - 15% platform commission
- ✅ Guest checkout support (create/find user by email)
- ✅ Delivery address validation
- ✅ Inventory reduction with logging
- ✅ Stock reservation validation
- ✅ Order items snapshot (preserve product data at purchase time)
- ✅ Automatic cart clearing after successful checkout
- ✅ Fulfillment record creation
- ✅ Payment Intent creation with Stripe

**Pricing Calculation**:

```
subtotal = sum(item.priceAtAdd * item.quantity)
deliveryFee = $5.00 (if DELIVERY method)
platformFee = subtotal * 0.15 (15%)
tax = 0 (TODO: implement tax calculation)
discount = 0 (TODO: implement promo codes)
total = subtotal + deliveryFee + tax - discount
farmerAmount = subtotal + deliveryFee - platformFee
```

---

### 5. Order Tracking (FR-016)

**File**: `src/app/api/orders/[orderId]/route.ts`

**Endpoints**:

- `GET /api/orders/:orderId` - Get order with tracking
- `PATCH /api/orders/:orderId/status` - Update status (farmer only)

#### GET - Order Details

**Authorization**: Order customer OR farm owner

**Response**:

```typescript
{
  success: true;
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    confirmedAt: Date | null;
    fulfilledAt: Date | null;
    completedAt: Date | null;

    // Pricing
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;

    // Fulfillment
    fulfillmentMethod: string;
    scheduledDate: Date | null;
    scheduledTimeSlot: string | null;
    deliveryAddress: Address | null;
    fulfillmentNotes: string | null;
    specialInstructions: string | null;

    // Relations
    customer: User | null;
    farm: {
      id: string;
      name: string;
      slug: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
    }
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      subtotal: number;
      product: {
        id: string;
        name: string;
        slug: string;
        primaryPhotoUrl: string | null;
        organic: boolean;
      };
      productSnapshot: any;
    }>;
    fulfillment: {
      id: string;
      status: string;
      trackingNumber: string | null;
      estimatedDate: Date | null;
      actualDate: Date | null;
      proofPhotoUrl: string | null;
    }

    // Timeline
    timeline: Array<{
      status: string;
      label: string;
      timestamp: Date | null;
      completed: boolean;
    }>;

    // Customer actions
    hasReview: boolean;
    review: Review | null;
    hasQualityIssue: boolean;
    qualityIssue: QualityIssue | null;

    // Available actions
    canConfirm: boolean;
    canCancel: boolean;
    canComplete: boolean;
    canReview: boolean;
    canReportIssue: boolean;
  }
}
```

**Timeline Statuses**:

1. **PENDING**: Order Placed
2. **CONFIRMED**: Confirmed by Farmer
3. **PREPARING**: Preparing Your Order
4. **READY**: Out for Delivery / Ready for Pickup
5. **FULFILLED**: Delivered / Picked Up
6. **COMPLETED**: Order Complete
7. **CANCELLED**: Order Cancelled (if applicable)

#### PATCH - Update Status

**Authorization**: Farm owner or admin

**Request Body**:

```typescript
{
  status: "CONFIRMED" | "PREPARING" | "READY" | "FULFILLED" | "COMPLETED" | "CANCELLED";
  cancelReason?: string; // Required if CANCELLED
  fulfillmentNotes?: string;
  proofPhotoUrl?: string; // For FULFILLED
  signature?: string; // Base64 signature for FULFILLED
}
```

**Response**:

```typescript
{
  success: true;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    confirmedAt: Date | null;
    fulfilledAt: Date | null;
    completedAt: Date | null;
  }
  message: "Order confirmed successfully";
}
```

**Valid Status Transitions**:

- PENDING → CONFIRMED, CANCELLED
- CONFIRMED → PREPARING, CANCELLED
- PREPARING → READY, CANCELLED
- READY → FULFILLED
- FULFILLED → COMPLETED
- COMPLETED → (no transitions)
- CANCELLED → (no transitions)

**Features**:

- ✅ Status transition validation
- ✅ Automatic timestamp setting (confirmedAt, fulfilledAt, etc.)
- ✅ Fulfillment record updates
- ✅ Customer notification sending
- ✅ Proof of delivery (photo + signature)
- ✅ Cancel reason tracking

---

## 🔧 Common Patterns

### 1. Zod Validation

All routes use Zod for request validation:

```typescript
const Schema = z.object({
  field: z.string().min(2, "Custom error message"),
});

const validatedData = Schema.parse(body);
```

### 2. Error Handling

Consistent error response format:

```typescript
// Validation errors
if (error instanceof z.ZodError) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    },
    { status: 400 }
  );
}

// Generic errors
return NextResponse.json(
  { error: "Operation failed. Please try again." },
  { status: 500 }
);
```

### 3. Authorization Checks

```typescript
// Check farm ownership
const farm = await prisma.farm.findUnique({
  where: { id: farmId },
});

if (farm?.ownerId !== session.user.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
```

### 4. Pagination

```typescript
const page = parseInt(searchParams.get("page") || "1", 10);
const limit = parseInt(searchParams.get("limit") || "20", 10);
const skip = (page - 1) * limit;

const [items, totalCount] = await Promise.all([
  prisma.model.findMany({ skip, take: limit }),
  prisma.model.count(),
]);
```

---

## 🚨 Error Handling

### HTTP Status Codes

- **200 OK**: Successful GET/PATCH
- **201 Created**: Successful POST (resource created)
- **400 Bad Request**: Validation failed, invalid data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Unexpected server error

### Error Response Format

```typescript
{
  error: string; // Human-readable error message
  details?: Array<{ // Optional: validation errors
    field: string;
    message: string;
  }>;
}
```

---

## 🔄 Next Steps

### Missing API Routes (To Be Created)

1. **Farm Discovery** (FR-011):

   - `GET /api/farms` - Search farms by location/filters
   - `GET /api/farms/:slug` - Get farm profile

2. **Inventory Updates** (FR-004):

   - `PATCH /api/products/:id/inventory` - Real-time inventory update

3. **Consumer Registration** (FR-010):

   - `POST /api/auth/register/consumer` - Consumer signup

4. **Reviews** (FR-017):

   - `POST /api/orders/:orderId/reviews` - Submit review
   - `GET /api/farms/:farmId/reviews` - Get farm reviews
   - `GET /api/products/:productId/reviews` - Get product reviews

5. **Quality Issues** (FR-018):

   - `POST /api/orders/:orderId/quality-issues` - Report issue
   - `PATCH /api/quality-issues/:id` - Resolve issue

6. **Notifications** (FR-009):

   - `GET /api/notifications` - Get user notifications
   - `PATCH /api/notifications/:id/read` - Mark as read

7. **Analytics** (FR-008, FR-023):
   - `POST /api/analytics/events` - Track event
   - `GET /api/farms/:farmId/analytics` - Farm dashboard

### Required Library Implementations

Create these in `src/lib/`:

1. **`lib/prisma.ts`**: Prisma client instance
2. **`lib/auth.ts`**: NextAuth configuration + getServerSession
3. **`lib/stripe.ts`**: Stripe Connect helpers
4. **`lib/email.ts`**: Email sending (verification, notifications)
5. **`lib/storage.ts`**: AWS S3 upload/delete
6. **`lib/notifications.ts`**: Multi-channel notifications
7. **`lib/utils/slug.ts`**: Slug generation
8. **`lib/utils/order.ts`**: Order number generation

### TypeScript Configuration

Update `tsconfig.json` to include ES2017+ for `.includes()`, `Object.values()`, etc.:

```json
{
  "compilerOptions": {
    "lib": ["ES2017", "DOM", "DOM.Iterable"]
  }
}
```

---

**Generated**: October 19, 2025
**Status**: 5 critical API routes complete ✅
**Next**: Create remaining 15+ routes + utility libraries
