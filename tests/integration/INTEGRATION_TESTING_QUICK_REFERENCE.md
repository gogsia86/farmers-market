# 🧪 Integration Testing Quick Reference

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready

---

## 🎯 Quick Start

### Run All Integration Tests
```bash
npm run test:integration
```

### Run Specific Test Suites
```bash
# Customer journey tests
npm run test:integration:customer

# Farmer journey tests
npm run test:integration:farmer

# All journey tests
npm run test:integration:journeys

# Mock service tests
npm run test:integration:mocks

# With coverage
npm run test:integration:coverage

# Verbose output
npm run test:integration:verbose
```

---

## 📋 Copy-Paste Patterns

### 1. Basic Integration Test Setup

```typescript
import { PrismaClient } from "@prisma/client";
import {
  getTestPrismaClient,
  cleanTestDatabase,
} from "../setup/testcontainers";
import { TEST_IDS, TEST_CREDENTIALS, seedFullTestData } from "../fixtures/seed";

// Import mocks
import { mockStripePayment } from "../mocks/stripe.mock";
import { mockEmailService } from "../mocks/email.mock";
import { mockNotificationService } from "../mocks/notification.mock";

let prisma: PrismaClient;

describe("🧪 My Integration Tests", () => {
  beforeAll(async () => {
    prisma = await getTestPrismaClient();

    // Initialize mocks
    mockStripePayment.initialize();
    mockEmailService.initialize();
    mockNotificationService.initialize();
  });

  beforeEach(async () => {
    // Clean and reseed for test isolation
    await cleanTestDatabase();
    await seedFullTestData(prisma);

    // Reset mocks
    mockStripePayment.reset();
    mockEmailService.reset();
    mockNotificationService.reset();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should test something", async () => {
    // Your test here
  });
});
```

---

### 2. Complete E2E Purchase Flow

```typescript
it("should complete full purchase flow", async () => {
  const customerId = TEST_IDS.CUSTOMER_USER_1;
  const customerEmail = TEST_CREDENTIALS.CUSTOMER_1.email;

  // 1. Browse products
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      inventory: { gt: 0 },
    },
    include: { farm: true },
  });

  expect(products.length).toBeGreaterThan(0);

  // 2. Create cart
  const cart = await prisma.cart.create({
    data: {
      userId: customerId,
      sessionId: `session-${Date.now()}`,
    },
  });

  // 3. Add items to cart
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: products[0].id,
      quantity: 2,
      price: products[0].price,
    },
  });

  // 4. Apply promo code
  const promoCode = await prisma.promoCode.create({
    data: {
      code: "TEST10",
      discount: 10,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxUses: 100,
      usedCount: 0,
      isActive: true,
    },
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: { promoCodeId: promoCode.id },
  });

  // 5. Calculate totals
  const cartWithItems = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: true, promoCode: true },
  });

  const subtotal = cartWithItems!.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = subtotal * (promoCode.discount / 100);
  const total = subtotal - discount;

  // 6. Create order
  const order = await prisma.order.create({
    data: {
      customerId: customerId,
      farmId: products[0].farmId,
      status: "PENDING",
      subtotal: subtotal,
      discount: discount,
      total: total,
      items: {
        create: cartWithItems!.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
      },
      shippingAddress: {
        create: {
          street: "123 Test St",
          city: "Test City",
          state: "CA",
          zipCode: "12345",
          country: "USA",
        },
      },
    },
    include: { items: true, shippingAddress: true },
  });

  // 7. Process payment
  const paymentIntent = await mockStripePayment.createPaymentIntent({
    amount: Math.round(order.total * 100),
    currency: "usd",
    metadata: { orderId: order.id },
  });

  expect(paymentIntent.status).toBe("succeeded");

  // 8. Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CONFIRMED",
      payment: {
        create: {
          amount: order.total,
          currency: "USD",
          provider: "STRIPE",
          transactionId: paymentIntent.id,
          status: "COMPLETED",
        },
      },
    },
  });

  // 9. Send confirmation email
  await mockEmailService.sendOrderConfirmation({
    to: customerEmail,
    orderId: order.id,
    orderNumber: order.id.slice(0, 8),
    items: order.items,
    total: order.total,
  });

  // Assertions
  expect(mockEmailService.getSentEmails()).toHaveLength(1);
  expect(paymentIntent.status).toBe("succeeded");
});
```

---

### 3. Stripe Payment Mock Usage

```typescript
// Initialize
mockStripePayment.initialize();

// Create successful payment
const payment = await mockStripePayment.createPaymentIntent({
  amount: 1000, // $10.00 in cents
  currency: "usd",
  metadata: { orderId: "order-123" },
});

expect(payment.status).toBe("succeeded");

// Test payment failure
mockStripePayment.setNextPaymentStatus("failed");
const failedPayment = await mockStripePayment.createPaymentIntent({
  amount: 1000,
  currency: "usd",
});

expect(failedPayment.status).toBe("failed");

// Create refund
const refund = await mockStripePayment.createRefund({
  payment_intent: payment.id,
  amount: 1000,
  reason: "requested_by_customer",
});

expect(refund.status).toBe("succeeded");

// Get statistics
const stats = mockStripePayment.getStatistics();
console.log(stats);
// {
//   totalPaymentIntents: 2,
//   totalRefunds: 1,
//   successRate: 50,
//   totalProcessedAmount: 1000,
//   totalRefundedAmount: 1000
// }

// Reset for next test
mockStripePayment.reset();
```

---

### 4. Email Service Mock Usage

```typescript
// Initialize
mockEmailService.initialize();

// Send order confirmation
await mockEmailService.sendOrderConfirmation({
  to: "customer@example.com",
  orderId: "order-123",
  orderNumber: "12345678",
  items: [
    {
      product: { name: "Organic Tomatoes" },
      quantity: 2,
      price: 4.99,
    },
  ],
  total: 9.98,
});

// Send order status update
await mockEmailService.sendOrderStatusUpdate({
  to: "customer@example.com",
  orderId: "order-123",
  status: "OUT_FOR_DELIVERY",
  message: "Your order is on the way!",
});

// Send farm verification email
await mockEmailService.sendFarmVerificationEmail({
  to: "farmer@example.com",
  farmName: "Green Valley Farm",
  farmId: "farm-123",
});

// Get sent emails
const sentEmails = mockEmailService.getSentEmails();
expect(sentEmails).toHaveLength(3);

// Get emails by recipient
const customerEmails = mockEmailService.getEmailsByRecipient(
  "customer@example.com"
);
expect(customerEmails).toHaveLength(2);

// Get emails by type
const confirmations = mockEmailService.getEmailsByType("order_confirmation");
expect(confirmations).toHaveLength(1);

// Test failure
mockEmailService.setFailureRate(100); // 100% failure rate
await expect(
  mockEmailService.sendOrderConfirmation({
    to: "test@example.com",
    orderId: "order-123",
    orderNumber: "12345678",
    items: [],
    total: 0,
  })
).rejects.toThrow();

// Reset
mockEmailService.reset();
```

---

### 5. Notification Service Mock Usage

```typescript
// Initialize
mockNotificationService.initialize();

// Send push notification
await mockNotificationService.sendPushNotification({
  userId: "user-123",
  title: "Order Ready!",
  body: "Your order is ready for pickup",
  data: { orderId: "order-123" },
  priority: "high",
});

// Send SMS notification
await mockNotificationService.sendSmsNotification({
  phoneNumber: "+1234567890",
  message: "Your order #12345678 is ready!",
  metadata: { orderId: "order-123" },
});

// Send in-app notification
await mockNotificationService.sendInAppNotification({
  userId: "user-123",
  title: "New Message",
  message: "You have a new message from the farm",
  type: "farm",
});

// Send farmer notification
await mockNotificationService.sendFarmerNotification({
  farmerId: "farmer-123",
  type: "NEW_ORDER",
  orderId: "order-123",
  message: "New order received!",
});

// Get notifications by user
const userNotifications = mockNotificationService.getNotificationsByUser(
  "user-123"
);
expect(userNotifications).toHaveLength(2);

// Get unread notifications
const unread = mockNotificationService.getUnreadNotifications("user-123");
expect(unread).toHaveLength(2);

// Mark as read
await mockNotificationService.markAsRead(userNotifications[0].id);

// Get statistics
const stats = mockNotificationService.getStatistics();
console.log(stats);
// {
//   totalSent: 4,
//   byType: { push: 2, sms: 1, in_app: 1 },
//   deliveryRate: 100,
//   readRate: 25
// }

// Reset
mockNotificationService.reset();
```

---

### 6. Image Upload Mock Usage

```typescript
// Initialize
mockImageUploadService.initialize();

// Upload single image
const imageUrl = await mockImageUploadService.upload({
  name: "product-photo.jpg",
  size: 1024 * 500, // 500KB
  type: "image/jpeg",
});

expect(imageUrl).toContain("https://cdn.farmersmarket.test");

// Upload multiple images
const imageUrls = await mockImageUploadService.uploadMultiple([
  { name: "photo1.jpg", size: 1024 * 400 },
  { name: "photo2.jpg", size: 1024 * 600 },
  { name: "photo3.jpg", size: 1024 * 550 },
]);

expect(imageUrls).toHaveLength(3);

// Upload with processing
const processedImage = await mockImageUploadService.uploadAndProcess(
  { name: "product.jpg", size: 1024 * 800 },
  {
    resize: { width: 800, height: 600, fit: "cover" },
    quality: 85,
    format: "webp",
    generateThumbnails: true,
  }
);

expect(processedImage.metadata.width).toBe(800);
expect(processedImage.thumbnails).toBeDefined();

// Get thumbnail URL
const thumbnailUrl = mockImageUploadService.getThumbnailUrl(
  imageUrl,
  "small"
);
expect(thumbnailUrl).toContain("/thumbnails/small/");

// Get statistics
const stats = mockImageUploadService.getStatistics();
console.log(stats);
// {
//   totalImages: 5,
//   totalSizeMB: "2.35",
//   byFormat: { jpeg: 3, webp: 2 },
//   withThumbnails: 1
// }

// Delete image
await mockImageUploadService.delete(imageUrl);

// Reset
mockImageUploadService.reset();
```

---

### 7. Test Order Fulfillment Flow

```typescript
it("should process order fulfillment", async () => {
  const farmId = TEST_IDS.FARM_1;
  const orderId = TEST_IDS.ORDER_PENDING;

  // Get pending order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      customer: true,
    },
  });

  // Confirm order
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CONFIRMED" },
  });

  await mockEmailService.sendOrderConfirmation({
    to: order!.customer.email,
    orderId: orderId,
    orderNumber: orderId.slice(0, 8),
    items: order!.items,
    total: order!.total,
  });

  // Start processing
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PROCESSING",
      processingStartedAt: new Date(),
    },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: orderId,
      status: "PROCESSING",
      note: "Farmer started preparing order",
    },
  });

  // Mark ready for pickup
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "READY_FOR_PICKUP",
      readyAt: new Date(),
    },
  });

  await mockNotificationService.sendPushNotification({
    userId: order!.customerId,
    title: "Order Ready!",
    body: "Your order is ready for pickup",
    data: { orderId: orderId },
  });

  // Verify
  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  expect(updatedOrder?.status).toBe("READY_FOR_PICKUP");
  expect(mockEmailService.getSentEmails()).toHaveLength(1);
  expect(mockNotificationService.getSentNotifications()).toHaveLength(1);
});
```

---

### 8. Test Seasonal Product Management

```typescript
it("should manage seasonal products", async () => {
  const farmId = TEST_IDS.FARM_1;
  const currentSeason = "SPRING";

  // Find products not in season
  const outOfSeasonProducts = await prisma.product.findMany({
    where: {
      farmId: farmId,
      season: { not: currentSeason },
      status: "ACTIVE",
    },
  });

  // Mark as inactive
  await prisma.product.updateMany({
    where: {
      farmId: farmId,
      season: { not: currentSeason },
    },
    data: { status: "INACTIVE" },
  });

  // Create new seasonal products
  const springProducts = [
    {
      name: "Fresh Asparagus",
      category: "VEGETABLES",
      price: 6.99,
    },
    {
      name: "Spring Strawberries",
      category: "FRUITS",
      price: 5.99,
    },
  ];

  for (const product of springProducts) {
    await prisma.product.create({
      data: {
        farmId: farmId,
        name: product.name,
        slug: `${product.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        category: product.category,
        price: product.price,
        unit: "lb",
        inventory: 50,
        season: currentSeason,
        status: "ACTIVE",
        isOrganic: true,
      },
    });
  }

  // Verify
  const seasonalProducts = await prisma.product.findMany({
    where: {
      farmId: farmId,
      season: currentSeason,
      status: "ACTIVE",
    },
  });

  expect(seasonalProducts.length).toBeGreaterThanOrEqual(2);
});
```

---

### 9. Test Farm Analytics Dashboard

```typescript
it("should generate farm dashboard analytics", async () => {
  const farmId = TEST_IDS.FARM_1;

  const dashboard = {
    // Order statistics
    orders: await prisma.order.aggregate({
      where: { farmId: farmId },
      _count: true,
      _sum: { total: true },
      _avg: { total: true },
    }),

    // Product statistics
    products: await prisma.product.aggregate({
      where: { farmId: farmId, status: "ACTIVE" },
      _count: true,
      _sum: { inventory: true, soldCount: true },
      _avg: { price: true, averageRating: true },
    }),

    // Pending orders count
    pendingOrders: await prisma.order.count({
      where: { farmId: farmId, status: "PENDING" },
    }),

    // Low inventory products
    lowInventoryProducts: await prisma.product.count({
      where: {
        farmId: farmId,
        status: "ACTIVE",
        inventory: { lt: 10 },
      },
    }),

    // Recent reviews
    recentReviews: await prisma.review.count({
      where: {
        product: { farmId: farmId },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  };

  expect(dashboard.orders._count).toBeGreaterThanOrEqual(0);
  expect(dashboard.products._count).toBeGreaterThan(0);
  
  console.log("Dashboard:", dashboard);
});
```

---

### 10. Test Payment Failure Handling

```typescript
it("should handle payment failures gracefully", async () => {
  const customerId = TEST_IDS.CUSTOMER_USER_1;
  const productId = TEST_IDS.PRODUCT_TOMATOES;

  // Create order
  const order = await prisma.order.create({
    data: {
      customerId: customerId,
      farmId: TEST_IDS.FARM_1,
      status: "PENDING",
      subtotal: 10.0,
      total: 10.0,
      items: {
        create: [
          {
            productId: productId,
            quantity: 2,
            price: 5.0,
            subtotal: 10.0,
          },
        ],
      },
    },
  });

  // Simulate payment failure
  mockStripePayment.setNextPaymentStatus("failed");

  const paymentResult = await mockStripePayment.createPaymentIntent({
    amount: 1000,
    currency: "usd",
    metadata: { orderId: order.id },
  });

  expect(paymentResult.status).toBe("failed");

  // Cancel order
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CANCELLED",
      cancellationReason: "Payment failed",
    },
  });

  // Restore inventory
  await prisma.product.update({
    where: { id: productId },
    data: { inventory: { increment: 2 } },
  });

  // Verify
  const cancelledOrder = await prisma.order.findUnique({
    where: { id: order.id },
  });

  expect(cancelledOrder?.status).toBe("CANCELLED");
});
```

---

## 🎯 Common Test Patterns

### Test Data IDs

```typescript
// Pre-defined test IDs from fixtures
TEST_IDS.ADMIN_USER
TEST_IDS.FARMER_USER_1
TEST_IDS.FARMER_USER_2
TEST_IDS.CUSTOMER_USER_1
TEST_IDS.CUSTOMER_USER_2
TEST_IDS.FARM_1
TEST_IDS.FARM_2
TEST_IDS.PRODUCT_TOMATOES
TEST_IDS.PRODUCT_LETTUCE
TEST_IDS.PRODUCT_CARROTS
TEST_IDS.PRODUCT_EGGS
TEST_IDS.PRODUCT_HONEY
TEST_IDS.PRODUCT_OUT_OF_STOCK
TEST_IDS.ORDER_PENDING
TEST_IDS.ORDER_COMPLETED
TEST_IDS.ORDER_CANCELLED
```

### Test Credentials

```typescript
// Pre-defined test credentials
TEST_CREDENTIALS.ADMIN.email        // "admin@test.farmersmarket.app"
TEST_CREDENTIALS.FARMER_1.email     // "farmer1@test.farmersmarket.app"
TEST_CREDENTIALS.CUSTOMER_1.email   // "customer1@test.farmersmarket.app"
```

---

## 🔧 Troubleshooting

### Issue: Tests hanging or timing out

```bash
# Increase timeout
npm run test:integration -- --testTimeout=30000
```

### Issue: Database connection errors

```bash
# Ensure Docker is running
docker ps

# Restart Docker
docker restart $(docker ps -q)

# Clean and restart
npm run test:integration:db -- --clearCache
```

### Issue: Mock services not working

```typescript
// Always initialize in beforeAll
beforeAll(async () => {
  mockStripePayment.initialize();
  mockEmailService.initialize();
  mockNotificationService.initialize();
});

// Always reset in beforeEach
beforeEach(async () => {
  mockStripePayment.reset();
  mockEmailService.reset();
  mockNotificationService.reset();
});
```

### Issue: Flaky tests

```typescript
// Use deterministic test data
const productId = TEST_IDS.PRODUCT_TOMATOES; // Fixed ID

// Clean database before each test
beforeEach(async () => {
  await cleanTestDatabase();
  await seedFullTestData(prisma);
});
```

---

## 📊 Test Coverage Requirements

| Category | Minimum Coverage |
|----------|-----------------|
| Customer Journeys | 95% |
| Farmer Journeys | 95% |
| Payment Integration | 100% |
| Email Notifications | 100% |
| Order Fulfillment | 100% |
| Agricultural Features | 90% |

---

## 🎓 Best Practices

### 1. Always Clean Database Between Tests
```typescript
beforeEach(async () => {
  await cleanTestDatabase();
  await seedFullTestData(prisma);
});
```

### 2. Use Deterministic Test Data
```typescript
// ✅ Good
const productId = TEST_IDS.PRODUCT_TOMATOES;

// ❌ Bad
const productId = (await prisma.product.findFirst())?.id;
```

### 3. Test Complete Flows, Not Individual Steps
```typescript
// ✅ Good - Test entire journey
it("should complete purchase flow from cart to delivery", async () => {
  // Browse → Add to cart → Checkout → Pay → Fulfill
});

// ❌ Bad - Test individual steps separately
it("should add to cart", async () => { ... });
it("should checkout", async () => { ... });
```

### 4. Assert on Mock Service Calls
```typescript
// Always verify external service interactions
expect(mockEmailService.getSentEmails()).toHaveLength(1);
expect(mockStripePayment.getStatistics().successRate).toBe(100);
```

### 5. Include Agricultural Consciousness
```typescript
// Test seasonal awareness
const season = Season.SPRING;
const products = await prisma.product.findMany({
  where: { season, status: "ACTIVE" }
});
```

---

## 📚 Additional Resources

- [Main Integration Testing README](./README.md)
- [Day 15 Completion Summary](./DAY_15_INTEGRATION_TESTING_COMPLETE.md)
- [Test Fixtures Documentation](./fixtures/README.md)
- [Mock Services Documentation](./mocks/README.md)

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready ✅

*"Copy, paste, and test with agricultural consciousness."* 🌾✨