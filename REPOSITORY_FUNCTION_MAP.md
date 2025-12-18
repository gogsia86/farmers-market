# 🗺️ Farmers Market Platform - Function Map & Quick Reference

**Quick Navigation Guide for Developers**

---

## 📊 System Architecture Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FARMERS MARKET PLATFORM                         │
│                   Enterprise E-Commerce Solution                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐
              │   ADMIN   │ │ FARMER  │ │ CUSTOMER  │
              │  PORTAL   │ │ PORTAL  │ │  PORTAL   │
              └─────┬─────┘ └────┬────┘ └─────┬─────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      API LAYER (35+)      │
                    │   /api/* Route Handlers   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   SERVICE LAYER (20+)     │
                    │   Business Logic Layer    │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │  REPOSITORY LAYER (10+)   │
                    │   Data Access Objects     │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   DATABASE (PostgreSQL)   │
                    │     30+ Tables/Models     │
                    └───────────────────────────┘
```

---

## 🎯 Core Function Categories

### 1️⃣ **User Management** 👥

**Location**: `src/lib/auth/`, `src/app/api/auth/`, `src/app/(auth)/`

```typescript
┌────────────────────────────────────────────────────────────┐
│ AUTHENTICATION & USER MANAGEMENT                           │
├────────────────────────────────────────────────────────────┤
│ Function                 │ API Endpoint                    │
├──────────────────────────┼─────────────────────────────────┤
│ Register User            │ POST /api/auth/register         │
│ Login                    │ POST /api/auth/signin           │
│ Logout                   │ POST /api/auth/signout          │
│ Reset Password           │ POST /api/auth/reset-password   │
│ Verify Email             │ GET  /api/auth/verify-email     │
│ Get Current User         │ GET  /api/auth/session          │
│ Update Profile           │ PUT  /api/users/:id             │
│ Change Role              │ PUT  /api/admin/users/:id/role  │
│ Suspend User             │ PUT  /api/admin/users/:id/suspend│
└──────────────────────────┴─────────────────────────────────┘
```

**Key Files**:

- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/auth/auth-options.ts` - Auth providers
- `src/app/api/auth/[...nextauth]/route.ts` - Auth API

**Service Methods**:

```typescript
// No dedicated user service - handled by NextAuth
// Direct database access via auth callbacks
```

---

### 2️⃣ **Farm Management** 🚜

**Location**: `src/lib/services/farm.service.ts`, `src/app/api/farms/`

```typescript
┌────────────────────────────────────────────────────────────┐
│ FARM OPERATIONS                                            │
├────────────────────────────────────────────────────────────┤
│ Function                 │ API Endpoint                    │
├──────────────────────────┼─────────────────────────────────┤
│ Create Farm              │ POST   /api/farms               │
│ Get All Farms            │ GET    /api/farms               │
│ Get Farm by ID           │ GET    /api/farms/:id           │
│ Get Farm by Slug         │ GET    /api/farms/slug/:slug    │
│ Update Farm              │ PUT    /api/farms/:id           │
│ Delete Farm              │ DELETE /api/farms/:id           │
│ Search Farms             │ GET    /api/farms/search        │
│ Nearby Farms             │ GET    /api/farms/nearby        │
│ Verify Farm              │ POST   /api/admin/farms/:id/verify│
│ Get Farmer's Farms       │ GET    /api/farmer/farms        │
└──────────────────────────┴─────────────────────────────────┘
```

**Service Class**: `FarmService`

```typescript
class FarmService {
  // CRUD Operations
  async createFarm(userId: string, data: CreateFarmRequest): Promise<Farm>;
  async getFarmById(farmId: string): Promise<Farm | null>;
  async getFarmBySlug(slug: string): Promise<Farm | null>;
  async updateFarm(farmId: string, data: UpdateFarmRequest): Promise<Farm>;
  async deleteFarm(farmId: string): Promise<void>;

  // Search & Discovery
  async searchFarms(query: SearchQuery): Promise<Farm[]>;
  async getNearbyFarms(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<Farm[]>;
  async getAllFarms(filters?: FarmFilters): Promise<Farm[]>;

  // Verification
  async verifyFarm(farmId: string, adminId: string): Promise<Farm>;
  async rejectFarm(
    farmId: string,
    adminId: string,
    reason: string,
  ): Promise<Farm>;

  // Owner Operations
  async getFarmerFarms(userId: string): Promise<Farm[]>;
  async checkFarmOwnership(farmId: string, userId: string): Promise<boolean>;
}
```

**Database Model**:

```prisma
model Farm {
  id                String      @id @default(cuid())
  slug              String      @unique
  name              String
  description       String?
  address           String
  latitude          Float
  longitude         Float
  status            FarmStatus  @default(PENDING)
  ownerId           String
  owner             User        @relation("FarmOwner")
  products          Product[]
  createdAt         DateTime    @default(now())
}
```

---

### 3️⃣ **Product Catalog** 📦

**Location**: `src/lib/services/product.service.ts`, `src/app/api/products/`

```typescript
┌────────────────────────────────────────────────────────────┐
│ PRODUCT MANAGEMENT                                         │
├────────────────────────────────────────────────────────────┤
│ Function                 │ API Endpoint                    │
├──────────────────────────┼─────────────────────────────────┤
│ Create Product           │ POST   /api/products            │
│ Get All Products         │ GET    /api/products            │
│ Get Product by ID        │ GET    /api/products/:id        │
│ Update Product           │ PUT    /api/products/:id        │
│ Delete Product           │ DELETE /api/products/:id        │
│ Search Products          │ GET    /api/products/search     │
│ Get by Category          │ GET    /api/products/category/:id│
│ Get Farm Products        │ GET    /api/farms/:id/products  │
│ Bulk Upload              │ POST   /api/products/bulk       │
│ Update Inventory         │ PUT    /api/products/:id/inventory│
└──────────────────────────┴─────────────────────────────────┘
```

**Service Class**: `ProductService`

```typescript
class ProductService {
  // CRUD Operations
  async createProduct(
    farmId: string,
    data: CreateProductRequest,
  ): Promise<Product>;
  async getProductById(productId: string): Promise<Product | null>;
  async updateProduct(
    productId: string,
    data: UpdateProductRequest,
  ): Promise<Product>;
  async deleteProduct(productId: string): Promise<void>;

  // Catalog Operations
  async getAllProducts(filters?: ProductFilters): Promise<Product[]>;
  async getFarmProducts(farmId: string): Promise<Product[]>;
  async searchProducts(
    query: string,
    filters?: SearchFilters,
  ): Promise<Product[]>;
  async getProductsByCategory(categoryId: string): Promise<Product[]>;

  // Inventory Management
  async updateInventory(productId: string, quantity: number): Promise<Product>;
  async checkAvailability(
    productId: string,
    quantity: number,
  ): Promise<boolean>;
  async getLowStockProducts(
    farmId: string,
    threshold: number,
  ): Promise<Product[]>;

  // Bulk Operations
  async bulkCreateProducts(
    farmId: string,
    products: CreateProductRequest[],
  ): Promise<Product[]>;
  async bulkUpdatePrices(updates: PriceUpdate[]): Promise<void>;
}
```

---

### 4️⃣ **Shopping Cart** 🛒

**Location**: `src/lib/services/cart.service.ts`, `src/app/api/cart/`

```typescript
┌────────────────────────────────────────────────────────────┐
│ CART OPERATIONS                                            │
├────────────────────────────────────────────────────────────┤
│ Function                 │ API Endpoint                    │
├──────────────────────────┼─────────────────────────────────┤
│ Get Cart                 │ GET    /api/cart                │
│ Add Item                 │ POST   /api/cart/items          │
│ Update Quantity          │ PUT    /api/cart/items/:id      │
│ Remove Item              │ DELETE /api/cart/items/:id      │
│ Clear Cart               │ DELETE /api/cart                │
│ Sync Cart                │ POST   /api/cart/sync           │
│ Validate Cart            │ POST   /api/cart/validate       │
└──────────────────────────┴─────────────────────────────────┘
```

**Service Class**: `CartService`

```typescript
class CartService {
  // Cart Management
  async getCart(userId?: string, sessionId?: string): Promise<Cart>;
  async createCart(userId?: string): Promise<Cart>;
  async clearCart(cartId: string): Promise<void>;

  // Item Operations
  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItem>;
  async updateQuantity(
    cartId: string,
    itemId: string,
    quantity: number,
  ): Promise<CartItem>;
  async removeItem(cartId: string, itemId: string): Promise<void>;

  // Cart Actions
  async mergeCarts(guestCartId: string, userCartId: string): Promise<Cart>;
  async validateCart(cartId: string): Promise<ValidationResult>;
  async calculateTotal(cartId: string): Promise<CartTotal>;
}
```

---

### 5️⃣ **Checkout & Orders** 💳

**Location**: `src/lib/services/checkout.service.ts`, `src/lib/services/order.service.ts`

```typescript
┌────────────────────────────────────────────────────────────┐
│ CHECKOUT & ORDER MANAGEMENT                                │
├────────────────────────────────────────────────────────────┤
│ Function                 │ API Endpoint                    │
├──────────────────────────┼─────────────────────────────────┤
│ Create Checkout Session  │ POST   /api/checkout            │
│ Complete Order           │ POST   /api/checkout/complete   │
│ Create Order             │ POST   /api/orders              │
│ Get Orders               │ GET    /api/orders              │
│ Get Order by ID          │ GET    /api/orders/:id          │
│ Update Order Status      │ PUT    /api/orders/:id/status   │
│ Cancel Order             │ POST   /api/orders/:id/cancel   │
│ Get Farmer Orders        │ GET    /api/farmer/orders       │
│ Get Customer Orders      │ GET    /api/customers/orders    │
└──────────────────────────┴─────────────────────────────────┘
```

**Service Classes**:

```typescript
// CheckoutService
class CheckoutService {
  async createCheckoutSession(
    cartId: string,
    data: CheckoutData,
  ): Promise<CheckoutSession>;
  async validateCheckout(cartId: string): Promise<ValidationResult>;
  async calculateOrderTotal(
    cartId: string,
    deliveryMethod: string,
  ): Promise<OrderTotal>;
  async processCheckout(sessionId: string): Promise<Order>;
}

// OrderService
class OrderService {
  // Order CRUD
  async createOrder(data: CreateOrderRequest): Promise<Order>;
  async getOrderById(orderId: string): Promise<Order | null>;
  async getOrders(filters?: OrderFilters): Promise<Order[]>;
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;

  // Order Management
  async cancelOrder(orderId: string, reason: string): Promise<Order>;
  async confirmOrder(orderId: string): Promise<Order>;
  async shipOrder(orderId: string, trackingNumber?: string): Promise<Order>;
  async deliverOrder(orderId: string): Promise<Order>;

  // User-specific
  async getCustomerOrders(userId: string): Promise<Order[]>;
  async getFarmerOrders(farmId: string): Promise<Order[]>;
}
```

**Order Status Flow**:

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                   ↓
                CANCELLED
```

---

### 6️⃣ **Payment Processing** 💰

**Location**: `src/lib/payment/`, `src/lib/stripe/`, `src/app/api/payments/`

```typescript
┌────────────────────────────────────────────────────────────┐
│ PAYMENT OPERATIONS (STRIPE)                                │
├────────────────────────────────────────────────────────────┤
│ Function                 │ API Endpoint                    │
├──────────────────────────┼─────────────────────────────────┤
│ Create Payment Session   │ POST   /api/payments/create     │
│ Confirm Payment          │ POST   /api/payments/confirm    │
│ Process Refund           │ POST   /api/payments/refund     │
│ Get Payment History      │ GET    /api/payments            │
│ Stripe Webhook           │ POST   /api/stripe/webhook      │
│ Create Payout            │ POST   /api/payments/payout     │
└──────────────────────────┴─────────────────────────────────┘
```

**Service Class**: `PaymentService`

```typescript
class PaymentService {
  // Payment Processing
  async createCheckoutSession(order: Order): Promise<Stripe.Checkout.Session>;
  async confirmPayment(sessionId: string): Promise<Payment>;
  async processRefund(paymentId: string, amount?: number): Promise<Refund>;

  // Webhook Handling
  async handleWebhookEvent(event: Stripe.Event): Promise<void>;
  async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void>;
  async handlePaymentFailed(session: Stripe.Checkout.Session): Promise<void>;

  // Farmer Payouts
  async createPayout(farmId: string, amount: number): Promise<Payout>;
  async processPayout(payoutId: string): Promise<void>;
  async calculateCommission(orderTotal: number): Promise<CommissionBreakdown>;
}
```

**Webhook Events**:

```typescript
- checkout.session.completed  → Update order status
- payment_intent.succeeded    → Confirm payment
- payment_intent.failed       → Mark payment failed
- charge.refunded             → Process refund
- payout.paid                 → Update payout status
```

---

### 7️⃣ **Search & Discovery** 🔍

**Location**: `src/lib/services/marketplace.service.ts`, `src/app/api/search/`

```typescript
┌────────────────────────────────────────────────────────────┐
│ SEARCH & MARKETPLACE                                       │
├────────────────────────────────────────────────────────────┤
│ Function                 │ API Endpoint                    │
├──────────────────────────┼─────────────────────────────────┤
│ Search All               │ GET    /api/search              │
│ Search Products          │ GET    /api/search/products     │
│ Search Farms             │ GET    /api/search/farms        │
│ Get Categories           │ GET    /api/categories          │
│ Get Featured Products    │ GET    /api/featured/products   │
│ Get Featured Farms       │ GET    /api/featured/farms      │
│ Get Recommendations      │ GET    /api/marketplace/recommendations│
└──────────────────────────┴─────────────────────────────────┘
```

**Service Class**: `MarketplaceService`

```typescript
class MarketplaceService {
  // Search Operations
  async searchProducts(
    query: string,
    filters: SearchFilters,
  ): Promise<SearchResult>;
  async searchFarms(
    query: string,
    filters: SearchFilters,
  ): Promise<SearchResult>;
  async advancedSearch(criteria: SearchCriteria): Promise<SearchResult>;

  // Discovery
  async getFeaturedProducts(limit?: number): Promise<Product[]>;
  async getFeaturedFarms(limit?: number): Promise<Farm[]>;
  async getRecommendations(userId: string): Promise<Product[]>;
  async getTrendingProducts(): Promise<Product[]>;

  // Geographic Search
  async searchNearby(lat: number, lng: number, radius: number): Promise<Farm[]>;
}
```

---

### 8️⃣ **Admin Dashboard** 👨‍💼

**Location**: `src/app/(admin)/`, `src/app/api/admin/`

```typescript
┌────────────────────────────────────────────────────────────┐
│ ADMIN OPERATIONS                                           │
├────────────────────────────────────────────────────────────┤
│ Function                 │ API Endpoint                    │
├──────────────────────────┼─────────────────────────────────┤
│ Get Dashboard Stats      │ GET    /api/admin/dashboard     │
│ List All Users           │ GET    /api/admin/users         │
│ Update User Role         │ PUT    /api/admin/users/:id/role│
│ Suspend User             │ PUT    /api/admin/users/:id/suspend│
│ List Pending Farms       │ GET    /api/admin/farms/pending │
│ Verify Farm              │ POST   /api/admin/farms/:id/verify│
│ Reject Farm              │ POST   /api/admin/farms/:id/reject│
│ View All Orders          │ GET    /api/admin/orders        │
│ Generate Reports         │ GET    /api/admin/reports       │
│ Platform Settings        │ GET/PUT /api/admin/settings     │
└──────────────────────────┴─────────────────────────────────┘
```

**Admin Functions**:

```typescript
// User Management
async getAllUsers(filters?: UserFilters): Promise<User[]>
async updateUserRole(userId: string, role: UserRole): Promise<User>
async suspendUser(userId: string, reason: string): Promise<User>
async deleteUser(userId: string): Promise<void>

// Farm Verification
async getPendingFarms(): Promise<Farm[]>
async verifyFarm(farmId: string, adminId: string): Promise<Farm>
async rejectFarm(farmId: string, adminId: string, reason: string): Promise<Farm>

// Platform Management
async getPlatformStats(): Promise<PlatformStats>
async generateReport(type: ReportType, dateRange: DateRange): Promise<Report>
async updateSettings(settings: PlatformSettings): Promise<void>
```

---

### 9️⃣ **Analytics & Reporting** 📊

**Location**: `src/lib/services/order-analytics.service.ts`, `src/app/api/analytics/`

```typescript
┌────────────────────────────────────────────────────────────┐
│ ANALYTICS & BUSINESS INTELLIGENCE                          │
├────────────────────────────────────────────────────────────┤
│ Function                 │ API Endpoint                    │
├──────────────────────────┼─────────────────────────────────┤
│ Farmer Dashboard Stats   │ GET    /api/farmer/analytics    │
│ Sales Report             │ GET    /api/analytics/sales     │
│ Top Products             │ GET    /api/analytics/products  │
│ Customer Insights        │ GET    /api/analytics/customers │
│ Revenue Report           │ GET    /api/analytics/revenue   │
│ Platform Metrics         │ GET    /api/admin/metrics       │
└──────────────────────────┴─────────────────────────────────┘
```

**Service Class**: `OrderAnalyticsService`

```typescript
class OrderAnalyticsService {
  // Farmer Analytics
  async getFarmerDashboard(farmId: string): Promise<FarmerAnalytics>;
  async getSalesReport(
    farmId: string,
    dateRange: DateRange,
  ): Promise<SalesReport>;
  async getTopProducts(farmId: string, limit: number): Promise<Product[]>;
  async getRevenueByPeriod(
    farmId: string,
    period: "day" | "week" | "month",
  ): Promise<ChartData[]>;

  // Platform Analytics
  async getPlatformMetrics(): Promise<PlatformMetrics>;
  async getActiveUsers(dateRange: DateRange): Promise<number>;
  async getTotalRevenue(dateRange: DateRange): Promise<number>;
  async getOrderTrends(): Promise<TrendData[]>;
}
```

---

### 🔟 **Notifications** 📧

**Location**: `src/lib/email/`, `src/lib/notifications/`, `src/app/api/notifications/`

```typescript
┌────────────────────────────────────────────────────────────┐
│ NOTIFICATION SYSTEM                                        │
├────────────────────────────────────────────────────────────┤
│ Notification Type        │ Trigger Event                   │
├──────────────────────────┼─────────────────────────────────┤
│ Welcome Email            │ User registration               │
│ Email Verification       │ Account creation                │
│ Password Reset           │ Reset request                   │
│ Order Confirmation       │ Order created                   │
│ Payment Confirmation     │ Payment successful              │
│ Order Shipped            │ Status → SHIPPED                │
│ Order Delivered          │ Status → DELIVERED              │
│ Farm Approved            │ Farm verification               │
│ New Order (Farmer)       │ Order received                  │
│ Low Stock Alert          │ Inventory < threshold           │
└──────────────────────────┴─────────────────────────────────┘
```

**Email Service**:

```typescript
class EmailService {
  async sendWelcomeEmail(user: User): Promise<void>;
  async sendVerificationEmail(user: User, token: string): Promise<void>;
  async sendPasswordResetEmail(user: User, token: string): Promise<void>;
  async sendOrderConfirmation(order: Order): Promise<void>;
  async sendPaymentConfirmation(payment: Payment): Promise<void>;
  async sendOrderShippedEmail(order: Order): Promise<void>;
  async sendFarmApprovalEmail(farm: Farm): Promise<void>;
  async sendNewOrderNotification(order: Order, farmer: User): Promise<void>;
}
```

---

## 🗂️ File Location Quick Reference

### **Services** (`src/lib/services/`)

```
farm.service.ts              → Farm management
product.service.ts           → Product catalog
cart.service.ts              → Shopping cart
cart-sync.service.ts         → Cart synchronization
checkout.service.ts          → Checkout flow
order.service.ts             → Order management
order-creation.service.ts    → Order creation logic
order-fulfillment.service.ts → Order fulfillment
order-validation.service.ts  → Order validation
order-analytics.service.ts   → Analytics & reporting
payment.service.ts           → Payment processing
marketplace.service.ts       → Search & discovery
farmer.service.ts            → Farmer operations
homepage.service.ts          → Homepage data
shipping.service.ts          → Shipping calculations
geocoding.service.ts         → Location services
biodynamic-calendar.service.ts → Agricultural calendar
soil-analysis.service.ts     → Soil recommendations
```

### **API Routes** (`src/app/api/`)

```
auth/                → Authentication (NextAuth)
users/               → User management
farms/               → Farm CRUD
products/            → Product catalog
cart/                → Shopping cart
checkout/            → Checkout
orders/              → Order management
payments/            → Payment processing
stripe/              → Stripe webhooks
reviews/             → Reviews & ratings
search/              → Search endpoints
admin/               → Admin operations
farmer/              → Farmer dashboard
customers/           → Customer operations
analytics/           → Analytics data
notifications/       → Notifications
marketplace/         → Marketplace data
categories/          → Product categories
featured/            → Featured content
upload/              → File uploads
health/              → Health checks
monitoring/          → System monitoring
```

### **Components** (`src/components/`)

```
ui/                  → Base UI components (Radix)
agricultural/        → Farm-specific components
auth/                → Authentication UI
cart/                → Shopping cart UI
checkout/            → Checkout flow
dashboard/           → Analytics dashboards
farmer/              → Farmer portal
marketplace/         → Product browsing
orders/              → Order management UI
products/            → Product catalog UI
layout/              → Layout components
homepage/            → Homepage components
```

---

## 🔄 Data Flow Diagrams

### **Order Creation Flow**

```
Customer           Frontend          API              Service          Database
   │                  │               │                  │                │
   │──Add to Cart─────>│               │                  │                │
   │                  │──POST /cart──>│                  │                │
   │                  │               │──addItem()───────>│                │
   │                  │               │                  │──INSERT────────>│
   │                  │               │<─────cartItem────│                │
   │<────Cart Updated─┤               │                  │                │
   │                  │               │                  │                │
   │──Checkout────────>│               │                  │                │
   │                  │─POST /checkout>│                  │                │
   │                  │               │──createSession──>│                │
   │                  │               │                  │──validate()────>│
   │                  │               │                  │──calculate()───>│
   │<──Redirect────────┤               │                  │                │
   │                  │               │                  │                │
   │──Pay (Stripe)────────────────────────────────────────────────────────>│
   │                  │               │                  │                │
   │                  Webhook────────>│                  │                │
   │                  │               │──handlePayment──>│                │
   │                  │               │                  │──createOrder──>│
   │                  │               │                  │──sendEmail()──>│
   │<──Confirmation Email──────────────┤                  │                │
```

### **Farm Verification Flow**

```
Farmer            API              Service          Admin            Database
  │                │                  │                │                │
  │──Create Farm──>│                  │                │                │
  │                │──createFarm()───>│                │                │
  │                │                  │────INSERT─────────────────────>│
  │                │                  │ (status=PENDING)                │
  │<──Pending──────┤                  │                │                │
  │                │                  │                │                │
  │                │                  │<──Review───────┤                │
  │                │                  │                │                │
  │                │<──verifyFarm()───┤                │                │
  │                │                  │────UPDATE─────────────────────>│
  │                │                  │ (status=ACTIVE)                 │
  │                │                  │──sendEmail()──>│                │
  │<──Approved Email─────────────────┤                │                │
```

---

## 🎯 Quick Task Guide

### **"I want to..."**

| Task                | Files to Check                                | API Endpoint                       |
| ------------------- | --------------------------------------------- | ---------------------------------- |
| Add a new product   | `src/lib/services/product.service.ts`         | `POST /api/products`               |
| Update order status | `src/lib/services/order.service.ts`           | `PUT /api/orders/:id/status`       |
| Process a refund    | `src/lib/payment/payment.service.ts`          | `POST /api/payments/refund`        |
| Search for farms    | `src/lib/services/marketplace.service.ts`     | `GET /api/search/farms`            |
| Get sales analytics | `src/lib/services/order-analytics.service.ts` | `GET /api/farmer/analytics`        |
| Verify a farm       | Admin routes                                  | `POST /api/admin/farms/:id/verify` |
| Add to cart         | `src/lib/services/cart.service.ts`            | `POST /api/cart/items`             |
| Send email          | `src/lib/email/email.service.ts`              | Internal service                   |
| Upload image        | Cloudinary integration                        | `POST /api/upload`                 |
| Check user role     | `src/lib/auth/`                               | Auth middleware                    |

---

## 🧪 Testing Quick Reference

```typescript
// Unit Test Location
src/lib/services/__tests__/[service-name].test.ts

// Integration Test Location
tests/integration/[feature]/[test-name].test.ts

// E2E Test Location
tests/e2e/[user-journey].spec.ts

// Run Commands
npm run test                  # All unit tests
npm run test:integration      # Integration tests
npm run test:e2e              # End-to-end tests
npm run validate:mvp          # MVP validation bot
```

---

## 📦 Database Models Quick Reference

```typescript
User              → id, email, role, status
Farm              → id, name, location, ownerId, status
Product           → id, name, price, farmId, stock
Order             → id, userId, total, status
OrderItem         → id, orderId, productId, quantity
Cart              → id, userId, sessionId
CartItem          → id, cartId, productId, quantity
Payment           → id, orderId, amount, status
Review            → id, productId, userId, rating
Notification      → id, userId, type, message
```

---

## 🚀 Common Development Tasks

### **Adding a New API Endpoint**

```typescript
// 1. Create API route
src / app / api / [feature] / route.ts;

// 2. Implement service method
src / lib / services / [feature].service.ts;

// 3. Add tests
src / lib / services / __tests__ / [feature].test.ts;

// 4. Update types
src / types / [feature].ts;
```

### **Adding a New Feature**

```typescript
// 1. Database schema (if needed)
prisma/schema.prisma

// 2. Service layer
src/lib/services/[feature].service.ts

// 3. API routes
src/app/api/[feature]/

// 4. UI components
src/components/[feature]/

// 5. Page routes
src/app/(user-role)/[feature]/

// 6. Tests
src/**/__tests__/ + tests/e2e/
```

---

**🎯 Pro Tip**: Always follow the layered architecture pattern:

```
Component/Page → API Route → Service → Repository → Database
```

Never skip layers or access the database directly from API routes!

---

_Last Updated: December 2024_
_Version: 1.0.0_
