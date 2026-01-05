# 🧪 Integration Test Scenarios - Checkout Flow

**Project:** Farmers Market Platform  
**Version:** 1.0  
**Last Updated:** November 15, 2024  
**Status:** Ready for Execution

---

## 📋 Overview

This document contains comprehensive integration test scenarios for the complete checkout flow, from cart to order confirmation. These tests validate the end-to-end functionality of the newly migrated services.

---

## 🎯 Test Environment Setup

### Prerequisites

```bash
# 1. Environment variables
cp .env.example .env.test

# Required variables:
# - DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/farmers_market_test
# - STRIPE_SECRET_KEY=sk_test_xxx
# - STRIPE_WEBHOOK_SECRET=whsec_test_xxx
# - NEXTAUTH_SECRET=test_secret_xxx
# - NEXTAUTH_URL=http://localhost:3000

# 2. Test database setup
npm run db:test:setup
npm run db:test:migrate

# 3. Seed test data
npm run db:test:seed

# 4. Start test server
npm run test:server
```

### Test Data Requirements

```typescript
// Test Users
const testCustomer = {
  id: "test_customer_001",
  email: "customer@test.com",
  role: "CUSTOMER",
};

const testFarmer = {
  id: "test_farmer_001",
  email: "farmer@test.com",
  role: "FARMER",
};

// Test Farm
const testFarm = {
  id: "test_farm_001",
  name: "Divine Acres Test Farm",
  ownerId: "test_farmer_001",
  status: "ACTIVE",
};

// Test Products
const testProducts = [
  {
    id: "test_product_001",
    name: "Organic Tomatoes",
    price: 4.99,
    stock: 100,
    farmId: "test_farm_001",
  },
  {
    id: "test_product_002",
    name: "Fresh Lettuce",
    price: 3.49,
    stock: 50,
    farmId: "test_farm_001",
  },
];

// Test Address
const testAddress = {
  street: "123 Main St",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  country: "US",
};
```

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path - Complete Checkout Flow

**Priority:** HIGH  
**Duration:** ~5 minutes  
**Prerequisites:** Clean database, test data seeded

#### Steps

```typescript
describe("Scenario 1: Happy Path - Complete Checkout Flow", () => {
  it("Step 1: Add items to cart", async () => {
    const response = await fetch("http://localhost:3000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testCustomerToken}`,
      },
      body: JSON.stringify({
        productId: "test_product_001",
        quantity: 2,
      }),
    });

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.cart.items).toHaveLength(1);
    expect(result.cart.items[0].quantity).toBe(2);
  });

  it("Step 2: Add second item to cart", async () => {
    const response = await fetch("http://localhost:3000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testCustomerToken}`,
      },
      body: JSON.stringify({
        productId: "test_product_002",
        quantity: 1,
      }),
    });

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.cart.items).toHaveLength(2);
  });

  it("Step 3: Validate cart", async () => {
    const response = await fetch("http://localhost:3000/api/cart/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testCustomerToken}`,
      },
    });

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.validation.valid).toBe(true);
    expect(result.validation.issues).toHaveLength(0);
  });

  it("Step 4: Get checkout status", async () => {
    const response = await fetch(
      "http://localhost:3000/api/checkout/create-order",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${testCustomerToken}`,
        },
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.status.hasActiveCart).toBe(true);
    expect(result.status.canCheckout).toBe(true);
  });

  it("Step 5: Create payment intent", async () => {
    const response = await fetch(
      "http://localhost:3000/api/checkout/create-payment-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testCustomerToken}`,
        },
        body: JSON.stringify({
          amount: 12.97, // 4.99 * 2 + 3.49 * 1
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.paymentIntent.id).toBeDefined();
    expect(result.paymentIntent.clientSecret).toBeDefined();
    expect(result.paymentIntent.amount).toBe(12.97);

    // Store for next step
    global.testPaymentIntentId = result.paymentIntent.id;
  });

  it("Step 6: Create order", async () => {
    const response = await fetch(
      "http://localhost:3000/api/checkout/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testCustomerToken}`,
        },
        body: JSON.stringify({
          shippingAddress: testAddress,
          fulfillmentMethod: "DELIVERY",
          stripePaymentIntentId: global.testPaymentIntentId,
          deliveryInstructions: "Leave at front door",
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.success).toBe(true);
    expect(result.order.id).toBeDefined();
    expect(result.order.orderNumber).toMatch(/^FM-\d{8}-[A-Z0-9]+$/);
    expect(result.order.status).toBe("PENDING");
    expect(result.order.total).toBeGreaterThan(0);

    // Store for verification
    global.testOrderId = result.order.id;
  });

  it("Step 7: Verify cart is cleared", async () => {
    const response = await fetch("http://localhost:3000/api/cart", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${testCustomerToken}`,
      },
    });

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.cart.items).toHaveLength(0);
  });

  it("Step 8: Verify order in database", async () => {
    const order = await database.order.findUnique({
      where: { id: global.testOrderId },
      include: { items: true },
    });

    expect(order).toBeDefined();
    expect(order.status).toBe("PENDING");
    expect(order.items).toHaveLength(2);
    expect(order.stripePaymentIntentId).toBe(global.testPaymentIntentId);
  });

  it("Step 9: Verify product purchase count updated", async () => {
    const product = await database.product.findUnique({
      where: { id: "test_product_001" },
    });

    expect(product.purchaseCount).toBe(2);
  });
});
```

**Expected Results:**

- ✅ Items added to cart successfully
- ✅ Cart validation passes
- ✅ Payment intent created
- ✅ Order created with correct data
- ✅ Cart cleared after order
- ✅ Database updated correctly

---

### Scenario 2: Multi-Farm Order Creation

**Priority:** HIGH  
**Duration:** ~3 minutes

#### Description

Test ordering from multiple farms, which should create separate orders per farm.

#### Steps

```typescript
describe("Scenario 2: Multi-Farm Order Creation", () => {
  it("Setup: Add products from two different farms", async () => {
    // Add product from Farm 1
    await fetch("http://localhost:3000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testCustomerToken}`,
      },
      body: JSON.stringify({
        productId: "farm1_product_001",
        quantity: 2,
      }),
    });

    // Add product from Farm 2
    await fetch("http://localhost:3000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testCustomerToken}`,
      },
      body: JSON.stringify({
        productId: "farm2_product_001",
        quantity: 1,
      }),
    });
  });

  it("Test: Create multi-farm order", async () => {
    const response = await fetch(
      "http://localhost:3000/api/checkout/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testCustomerToken}`,
        },
        body: JSON.stringify({
          shippingAddress: testAddress,
          fulfillmentMethod: "DELIVERY",
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.success).toBe(true);
    expect(result.orders).toHaveLength(2); // Two orders for two farms
    expect(result.message).toContain("2 orders created");

    // Verify each order has correct farm
    expect(result.orders[0].farmId).not.toBe(result.orders[1].farmId);
  });
});
```

**Expected Results:**

- ✅ Two separate orders created
- ✅ Each order linked to correct farm
- ✅ Total amounts calculated correctly per farm

---

### Scenario 3: Validation Error Handling

**Priority:** HIGH  
**Duration:** ~2 minutes

#### Description

Test various validation errors in the checkout flow.

```typescript
describe("Scenario 3: Validation Error Handling", () => {
  it("Test: Empty cart checkout", async () => {
    const response = await fetch(
      "http://localhost:3000/api/checkout/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testCustomerToken}`,
        },
        body: JSON.stringify({
          shippingAddress: testAddress,
          fulfillmentMethod: "DELIVERY",
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Cart is empty");
  });

  it("Test: Invalid address format", async () => {
    // Add item first
    await fetch("http://localhost:3000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testCustomerToken}`,
      },
      body: JSON.stringify({
        productId: "test_product_001",
        quantity: 1,
      }),
    });

    const response = await fetch(
      "http://localhost:3000/api/checkout/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testCustomerToken}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            street: "123", // Too short
            city: "S", // Too short
            state: "I", // Too short
            zipCode: "invalid",
            country: "US",
          },
          fulfillmentMethod: "DELIVERY",
        }),
      },
    );

    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("Test: Out of stock product", async () => {
    // Set product stock to 0
    await database.product.update({
      where: { id: "test_product_001" },
      data: { stock: 0 },
    });

    // Try to add to cart
    const response = await fetch("http://localhost:3000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testCustomerToken}`,
      },
      body: JSON.stringify({
        productId: "test_product_001",
        quantity: 1,
      }),
    });

    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toContain("out of stock");
  });

  it("Test: Quantity exceeds stock", async () => {
    await database.product.update({
      where: { id: "test_product_001" },
      data: { stock: 5 },
    });

    const response = await fetch("http://localhost:3000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testCustomerToken}`,
      },
      body: JSON.stringify({
        productId: "test_product_001",
        quantity: 10, // More than available
      }),
    });

    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toContain("stock");
  });
});
```

**Expected Results:**

- ✅ Proper error messages for empty cart
- ✅ Address validation errors caught
- ✅ Out of stock products rejected
- ✅ Quantity limits enforced

---

### Scenario 4: Payment Processing Flow

**Priority:** HIGH  
**Duration:** ~4 minutes

#### Description

Test Stripe payment integration and webhook processing.

```typescript
describe("Scenario 4: Payment Processing Flow", () => {
  let paymentIntentId;
  let orderId;

  it("Setup: Create order with payment intent", async () => {
    // Add item and create order
    await fetch("http://localhost:3000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testCustomerToken}`,
      },
      body: JSON.stringify({
        productId: "test_product_001",
        quantity: 1,
      }),
    });

    const paymentResponse = await fetch(
      "http://localhost:3000/api/checkout/create-payment-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testCustomerToken}`,
        },
        body: JSON.stringify({ amount: 4.99 }),
      },
    );

    const paymentResult = await paymentResponse.json();
    paymentIntentId = paymentResult.paymentIntent.id;

    const orderResponse = await fetch(
      "http://localhost:3000/api/checkout/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testCustomerToken}`,
        },
        body: JSON.stringify({
          shippingAddress: testAddress,
          fulfillmentMethod: "DELIVERY",
          stripePaymentIntentId: paymentIntentId,
        }),
      },
    );

    const orderResult = await orderResponse.json();
    orderId = orderResult.order.id;
  });

  it("Test: Simulate payment success webhook", async () => {
    const webhookPayload = {
      id: "evt_test_001",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: paymentIntentId,
          status: "succeeded",
          amount: 499, // cents
          metadata: {
            orderId: orderId,
          },
        },
      },
    };

    const response = await fetch("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": generateTestSignature(webhookPayload),
      },
      body: JSON.stringify(webhookPayload),
    });

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.received).toBe(true);
  });

  it("Verify: Order status updated after payment", async () => {
    const order = await database.order.findUnique({
      where: { id: orderId },
    });

    expect(order.paymentStatus).toBe("PAID");
    expect(order.status).toBe("CONFIRMED");
    expect(order.paidAt).toBeDefined();
    expect(order.confirmedAt).toBeDefined();
  });

  it("Test: Simulate payment failure webhook", async () => {
    // Create new order for failure test
    const webhookPayload = {
      id: "evt_test_002",
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: paymentIntentId,
          status: "requires_payment_method",
          last_payment_error: {
            message: "Your card was declined",
          },
        },
      },
    };

    const response = await fetch("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": generateTestSignature(webhookPayload),
      },
      body: JSON.stringify(webhookPayload),
    });

    expect(response.status).toBe(200);
  });
});
```

**Expected Results:**

- ✅ Payment intent created successfully
- ✅ Webhook signature validated
- ✅ Order status updated on payment success
- ✅ Payment failures handled gracefully

---

### Scenario 5: Concurrent Checkout Requests

**Priority:** MEDIUM  
**Duration:** ~5 minutes

#### Description

Test system behavior under concurrent checkout requests.

```typescript
describe("Scenario 5: Concurrent Checkout Requests", () => {
  it("Test: Multiple users checking out simultaneously", async () => {
    const users = [
      { token: testCustomer1Token, productId: "test_product_001" },
      { token: testCustomer2Token, productId: "test_product_001" },
      { token: testCustomer3Token, productId: "test_product_001" },
    ];

    // Set product stock to 10
    await database.product.update({
      where: { id: "test_product_001" },
      data: { stock: 10 },
    });

    // All users add to cart simultaneously
    await Promise.all(
      users.map((user) =>
        fetch("http://localhost:3000/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            productId: user.productId,
            quantity: 5,
          }),
        }),
      ),
    );

    // All users checkout simultaneously
    const checkoutPromises = users.map((user) =>
      fetch("http://localhost:3000/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          shippingAddress: testAddress,
          fulfillmentMethod: "DELIVERY",
        }),
      }),
    );

    const responses = await Promise.all(checkoutPromises);
    const results = await Promise.all(responses.map((r) => r.json()));

    // At least one should fail due to stock limitation
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    expect(successCount).toBeLessThanOrEqual(2); // Only 2 can buy 5 items each from stock of 10
    expect(failureCount).toBeGreaterThanOrEqual(1);
  });
});
```

**Expected Results:**

- ✅ Stock validation prevents overselling
- ✅ Transaction safety maintained
- ✅ Proper error messages for failed checkouts

---

### Scenario 6: Different Fulfillment Methods

**Priority:** MEDIUM  
**Duration:** ~3 minutes

```typescript
describe("Scenario 6: Different Fulfillment Methods", () => {
  it("Test: Delivery order (with delivery fee)", async () => {
    await addTestItemToCart();

    const response = await fetch(
      "http://localhost:3000/api/checkout/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testCustomerToken}`,
        },
        body: JSON.stringify({
          shippingAddress: testAddress,
          fulfillmentMethod: "DELIVERY",
        }),
      },
    );

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.order.fulfillmentMethod).toBe("DELIVERY");
    expect(result.order.deliveryFee).toBeGreaterThan(0);
  });

  it("Test: Farm pickup (no delivery fee)", async () => {
    await addTestItemToCart();

    const response = await fetch(
      "http://localhost:3000/api/checkout/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testCustomerToken}`,
        },
        body: JSON.stringify({
          fulfillmentMethod: "FARM_PICKUP",
        }),
      },
    );

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.order.fulfillmentMethod).toBe("FARM_PICKUP");
    expect(result.order.deliveryFee).toBe(0);
  });

  it("Test: Market pickup (no delivery fee)", async () => {
    await addTestItemToCart();

    const response = await fetch(
      "http://localhost:3000/api/checkout/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testCustomerToken}`,
        },
        body: JSON.stringify({
          fulfillmentMethod: "MARKET_PICKUP",
        }),
      },
    );

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.order.fulfillmentMethod).toBe("MARKET_PICKUP");
    expect(result.order.deliveryFee).toBe(0);
  });
});
```

**Expected Results:**

- ✅ Delivery fee applied for DELIVERY
- ✅ No delivery fee for FARM_PICKUP
- ✅ No delivery fee for MARKET_PICKUP
- ✅ Address required only for DELIVERY

---

## 📊 Performance Testing Scenarios

### Load Test 1: Normal Load

**Target:** 100 concurrent users, 5-minute duration

```bash
# Using Artillery or k6
artillery run load-tests/checkout-normal.yml

# Expected metrics:
# - Response time (p95): < 1s
# - Success rate: > 99%
# - Error rate: < 1%
```

### Load Test 2: Peak Load

**Target:** 500 concurrent users, 2-minute duration

```bash
artillery run load-tests/checkout-peak.yml

# Expected metrics:
# - Response time (p95): < 2s
# - Success rate: > 98%
# - Error rate: < 2%
```

### Load Test 3: Stress Test

**Target:** 1000 concurrent users until failure

```bash
artillery run load-tests/checkout-stress.yml

# Goal: Identify breaking point
# Monitor: CPU, memory, database connections
```

---

## ✅ Test Execution Checklist

### Pre-Execution

- [ ] Test database seeded with data
- [ ] Environment variables configured
- [ ] Stripe test keys active
- [ ] Test server running
- [ ] Monitoring tools ready

### During Execution

- [ ] Monitor application logs
- [ ] Check database connection pool
- [ ] Watch for memory leaks
- [ ] Track response times
- [ ] Verify tracing data

### Post-Execution

- [ ] Review test results
- [ ] Analyze failure reasons
- [ ] Document issues found
- [ ] Update test scenarios
- [ ] Clean test database

---

## 🐛 Known Issues & Workarounds

### Issue 1: Race Conditions in Stock Validation

**Workaround:** Use database transactions with `SERIALIZABLE` isolation level

### Issue 2: Webhook Signature Verification in Test

**Workaround:** Use `stripe.webhooks.constructEvent()` with test secret

### Issue 3: Slow Payment Intent Creation

**Workaround:** Mock Stripe API for faster tests

---

## 📈 Success Criteria

### Functional Tests

- [ ] All happy path scenarios pass (100%)
- [ ] All validation scenarios pass (100%)
- [ ] Multi-farm orders work correctly
- [ ] Payment webhooks processed successfully
- [ ] Error handling works as expected

### Performance Tests

- [ ] Normal load: p95 < 1s
- [ ] Peak load: p95 < 2s
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] No N+1 query issues

### Data Integrity

- [ ] No orphaned cart items
- [ ] Order totals calculated correctly
- [ ] Product stock updated accurately
- [ ] Payment records match orders
- [ ] Audit trail complete

---

## 🔗 Additional Resources

- [Test Data Generator](./test/utils/data-generator.ts)
- [Mock Stripe Webhooks](./test/mocks/stripe-webhooks.ts)
- [Performance Test Scripts](./load-tests/)
- [CI/CD Pipeline](../.github/workflows/integration-tests.yml)

---

**Status:** ✅ Ready for Execution  
**Priority:** HIGH  
**Estimated Time:** 2-3 hours for complete test suite  
**Next:** Execute tests and document results
