/**
 * 💳 STRIPE CONTRACT TESTS
 *
 * Contract tests to verify integration with Stripe API.
 * Tests run against stripe-mock (hermetic) or Stripe test mode.
 *
 * Setup Options:
 * 1. stripe-mock: Run `docker run -p 12111:12111 stripe/stripe-mock`
 * 2. Test mode: Set STRIPE_SECRET_KEY to a test key (sk_test_xxx)
 *
 * @pattern Contract Testing for External APIs
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 */

import Stripe from "stripe";

// Configuration
const STRIPE_MOCK_URL = "http://localhost:12111";
const USE_STRIPE_MOCK = process.env.USE_STRIPE_MOCK === "true";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_mock_key";

// Skip if no Stripe configuration available
const shouldSkipStripeTests =
  process.env.SKIP_STRIPE_TESTS === "true" ||
  (!USE_STRIPE_MOCK && !STRIPE_SECRET_KEY.startsWith("sk_test_"));

const describeStripe = shouldSkipStripeTests ? describe.skip : describe;

/**
 * Get Stripe client configured for testing
 */
function getStripeClient(): Stripe {
  const config: Stripe.StripeConfig = {
    apiVersion: "2024-12-18.acacia" as any,
  };

  if (USE_STRIPE_MOCK) {
    // @ts-ignore - stripe-mock uses different base URL
    config.host = "localhost";
    config.port = 12111;
    config.protocol = "http";
  }

  return new Stripe(STRIPE_SECRET_KEY, config);
}

describeStripe("💳 Stripe Contract Tests", () => {
  let stripe: Stripe;

  beforeAll(() => {
    stripe = getStripeClient();

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  💳 Stripe Contract Tests                                   ║",
    );
    console.log(
      `║  Mode: ${USE_STRIPE_MOCK ? "stripe-mock (hermetic)" : "Stripe Test Mode"}     ║`,
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );
  });

  describe("🔌 Connection & Authentication", () => {
    it("should authenticate with Stripe API", async () => {
      // Act - Simple API call to verify authentication
      const balance = await stripe.balance.retrieve();

      // Assert
      expect(balance).toBeDefined();
      expect(balance.object).toBe("balance");
    });

    it("should handle invalid API key gracefully", async () => {
      // Arrange
      const invalidStripe = new Stripe("sk_test_invalid_key_12345", {
        apiVersion: "2024-12-18.acacia" as any,
      });

      // Act & Assert
      await expect(invalidStripe.balance.retrieve()).rejects.toThrow();
    });
  });

  describe("💰 Payment Intents", () => {
    it("should create a payment intent", async () => {
      // Arrange
      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount: 2000, // $20.00
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {
          order_id: "test-order-001",
          customer_email: "test@farmersmarket.app",
        },
      };

      // Act
      const paymentIntent =
        await stripe.paymentIntents.create(paymentIntentData);

      // Assert
      expect(paymentIntent).toBeDefined();
      expect(paymentIntent.id).toMatch(/^pi_/);
      expect(paymentIntent.amount).toBe(2000);
      expect(paymentIntent.currency).toBe("usd");
      expect(paymentIntent.status).toBe("requires_payment_method");
      expect(paymentIntent.metadata.order_id).toBe("test-order-001");
    });

    it("should create payment intent with specific amount", async () => {
      // Arrange - Agricultural order amounts
      const testAmounts = [
        { amount: 1499, description: "$14.99 - Small produce order" },
        { amount: 4999, description: "$49.99 - Weekly basket" },
        { amount: 19999, description: "$199.99 - Bulk farm order" },
      ];

      for (const { amount, description } of testAmounts) {
        // Act
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: "usd",
          metadata: { description },
        });

        // Assert
        expect(paymentIntent.amount).toBe(amount);
        expect(paymentIntent.metadata.description).toBe(description);
      }
    });

    it("should retrieve a payment intent", async () => {
      // Arrange
      const created = await stripe.paymentIntents.create({
        amount: 3000,
        currency: "usd",
      });

      // Act
      const retrieved = await stripe.paymentIntents.retrieve(created.id);

      // Assert
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.amount).toBe(3000);
    });

    it("should update payment intent metadata", async () => {
      // Arrange
      const created = await stripe.paymentIntents.create({
        amount: 2500,
        currency: "usd",
        metadata: { order_id: "original-order" },
      });

      // Act
      const updated = await stripe.paymentIntents.update(created.id, {
        metadata: {
          order_id: "updated-order",
          farm_id: "farm-001",
        },
      });

      // Assert
      expect(updated.metadata.order_id).toBe("updated-order");
      expect(updated.metadata.farm_id).toBe("farm-001");
    });

    it("should cancel a payment intent", async () => {
      // Arrange
      const created = await stripe.paymentIntents.create({
        amount: 5000,
        currency: "usd",
      });

      // Act
      const canceled = await stripe.paymentIntents.cancel(created.id);

      // Assert
      expect(canceled.status).toBe("canceled");
    });

    it("should handle minimum amount correctly", async () => {
      // Stripe minimum is $0.50 USD
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 50, // $0.50
        currency: "usd",
      });

      expect(paymentIntent.amount).toBe(50);
    });

    it("should reject amount below minimum", async () => {
      // Act & Assert
      await expect(
        stripe.paymentIntents.create({
          amount: 10, // $0.10 - below minimum
          currency: "usd",
        }),
      ).rejects.toThrow();
    });
  });

  describe("👤 Customers", () => {
    it("should create a customer", async () => {
      // Arrange
      const customerData: Stripe.CustomerCreateParams = {
        email: "farmer.john@farmersmarket.app",
        name: "John Farmer",
        metadata: {
          role: "FARMER",
          farm_id: "farm-001",
        },
      };

      // Act
      const customer = await stripe.customers.create(customerData);

      // Assert
      expect(customer).toBeDefined();
      expect(customer.id).toMatch(/^cus_/);
      expect(customer.email).toBe("farmer.john@farmersmarket.app");
      expect(customer.name).toBe("John Farmer");
      expect(customer.metadata.role).toBe("FARMER");
    });

    it("should retrieve a customer", async () => {
      // Arrange
      const created = await stripe.customers.create({
        email: "retrieve.test@farmersmarket.app",
      });

      // Act
      const retrieved = await stripe.customers.retrieve(created.id);

      // Assert
      expect(retrieved.id).toBe(created.id);
      if (retrieved.deleted !== true) {
        expect(retrieved.email).toBe("retrieve.test@farmersmarket.app");
      }
    });

    it("should update customer information", async () => {
      // Arrange
      const created = await stripe.customers.create({
        email: "update.test@farmersmarket.app",
        name: "Original Name",
      });

      // Act
      const updated = await stripe.customers.update(created.id, {
        name: "Updated Name",
        metadata: {
          subscription_tier: "premium",
        },
      });

      // Assert
      expect(updated.name).toBe("Updated Name");
      expect(updated.metadata.subscription_tier).toBe("premium");
    });

    it("should list customers", async () => {
      // Arrange - Create a few customers
      await stripe.customers.create({ email: "list.test1@farmersmarket.app" });
      await stripe.customers.create({ email: "list.test2@farmersmarket.app" });

      // Act
      const customers = await stripe.customers.list({ limit: 10 });

      // Assert
      expect(customers.data).toBeDefined();
      expect(customers.data.length).toBeGreaterThanOrEqual(2);
    });

    it("should delete a customer", async () => {
      // Arrange
      const created = await stripe.customers.create({
        email: "delete.test@farmersmarket.app",
      });

      // Act
      const deleted = await stripe.customers.del(created.id);

      // Assert
      expect(deleted.deleted).toBe(true);
      expect(deleted.id).toBe(created.id);
    });
  });

  describe("💵 Refunds", () => {
    let _confirmedPaymentIntentId: string;

    beforeAll(async () => {
      // Create and "confirm" a payment intent for refund tests
      // In test mode/stripe-mock, we can use test payment methods
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000,
        currency: "usd",
        payment_method: "pm_card_visa", // Test payment method
        confirm: true,
        return_url: "https://farmersmarket.app/order/complete",
      });
      _confirmedPaymentIntentId = paymentIntent.id;
    });

    it("should create a full refund", async () => {
      // Arrange
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 3000,
        currency: "usd",
        payment_method: "pm_card_visa",
        confirm: true,
        return_url: "https://farmersmarket.app/order/complete",
      });

      // Act
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntent.id,
      });

      // Assert
      expect(refund).toBeDefined();
      expect(refund.id).toMatch(/^re_/);
      expect(refund.amount).toBe(3000);
      expect(refund.status).toBe("succeeded");
    });

    it("should create a partial refund", async () => {
      // Arrange
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 10000,
        currency: "usd",
        payment_method: "pm_card_visa",
        confirm: true,
        return_url: "https://farmersmarket.app/order/complete",
      });

      // Act
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntent.id,
        amount: 2500, // Partial refund of $25.00
      });

      // Assert
      expect(refund.amount).toBe(2500);
      expect(refund.status).toBe("succeeded");
    });

    it("should include refund reason", async () => {
      // Arrange
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 4500,
        currency: "usd",
        payment_method: "pm_card_visa",
        confirm: true,
        return_url: "https://farmersmarket.app/order/complete",
      });

      // Act
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntent.id,
        reason: "requested_by_customer",
        metadata: {
          reason_detail: "Order cancelled by customer",
          order_id: "test-order-refund",
        },
      });

      // Assert
      expect(refund.reason).toBe("requested_by_customer");
      expect(refund.metadata?.reason_detail).toBe(
        "Order cancelled by customer",
      );
    });
  });

  describe("🏷️ Products & Prices", () => {
    it("should create a product", async () => {
      // Arrange
      const productData: Stripe.ProductCreateParams = {
        name: "Weekly Farm Box Subscription",
        description: "Fresh organic produce delivered weekly",
        metadata: {
          category: "SUBSCRIPTION",
          farm_id: "farm-001",
        },
      };

      // Act
      const product = await stripe.products.create(productData);

      // Assert
      expect(product).toBeDefined();
      expect(product.id).toMatch(/^prod_/);
      expect(product.name).toBe("Weekly Farm Box Subscription");
    });

    it("should create a price for a product", async () => {
      // Arrange
      const product = await stripe.products.create({
        name: "Test Product for Price",
      });

      // Act
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 2999, // $29.99
        currency: "usd",
        metadata: {
          tier: "standard",
        },
      });

      // Assert
      expect(price).toBeDefined();
      expect(price.id).toMatch(/^price_/);
      expect(price.unit_amount).toBe(2999);
      expect(price.currency).toBe("usd");
    });

    it("should create a recurring price", async () => {
      // Arrange
      const product = await stripe.products.create({
        name: "Monthly Subscription Box",
      });

      // Act
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 4999,
        currency: "usd",
        recurring: {
          interval: "month",
        },
      });

      // Assert
      expect(price.recurring?.interval).toBe("month");
      expect(price.type).toBe("recurring");
    });

    it("should list products", async () => {
      // Act
      const products = await stripe.products.list({ limit: 10 });

      // Assert
      expect(products.data).toBeDefined();
      expect(Array.isArray(products.data)).toBe(true);
    });
  });

  describe("🔔 Webhooks", () => {
    it("should verify webhook signature", () => {
      // Arrange
      const payload = JSON.stringify({
        id: "evt_test_webhook",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_123",
            amount: 2000,
          },
        },
      });

      const secret = "whsec_test_secret";
      const timestamp = Math.floor(Date.now() / 1000);
      const signedPayload = `${timestamp}.${payload}`;

      // Create signature using Stripe's method
      const crypto = require("crypto");
      const signature = crypto
        .createHmac("sha256", secret)
        .update(signedPayload)
        .digest("hex");

      const header = `t=${timestamp},v1=${signature}`;

      // Act
      const event = stripe.webhooks.constructEvent(payload, header, secret);

      // Assert
      expect(event).toBeDefined();
      expect(event.type).toBe("payment_intent.succeeded");
    });

    it("should reject invalid webhook signature", () => {
      // Arrange
      const payload = JSON.stringify({
        id: "evt_test_webhook",
        type: "payment_intent.succeeded",
      });

      const invalidHeader = "t=12345,v1=invalid_signature";
      const secret = "whsec_test_secret";

      // Act & Assert
      expect(() => {
        stripe.webhooks.constructEvent(payload, invalidHeader, secret);
      }).toThrow();
    });
  });

  describe("🌾 Farmers Market Specific Scenarios", () => {
    it("should handle farm payout split calculation", async () => {
      // Scenario: Platform takes 10% fee, farmer gets 90%
      const orderTotal = 10000; // $100.00
      const platformFee = Math.round(orderTotal * 0.1); // $10.00
      const farmerPayout = orderTotal - platformFee; // $90.00

      // Create payment intent with application fee
      const paymentIntent = await stripe.paymentIntents.create({
        amount: orderTotal,
        currency: "usd",
        metadata: {
          order_id: "farm-order-001",
          platform_fee: platformFee.toString(),
          farmer_payout: farmerPayout.toString(),
          farmer_id: "farmer-001",
        },
      });

      // Assert
      expect(paymentIntent.amount).toBe(orderTotal);
      expect(parseInt(paymentIntent.metadata.platform_fee)).toBe(1000);
      expect(parseInt(paymentIntent.metadata.farmer_payout)).toBe(9000);
    });

    it("should handle multi-farm order", async () => {
      // Scenario: Customer orders from multiple farms
      const farm1Amount = 2500; // $25.00
      const farm2Amount = 3500; // $35.00
      const totalAmount = farm1Amount + farm2Amount; // $60.00

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "usd",
        metadata: {
          order_type: "MULTI_FARM",
          farm_1_id: "farm-001",
          farm_1_amount: farm1Amount.toString(),
          farm_2_id: "farm-002",
          farm_2_amount: farm2Amount.toString(),
        },
      });

      // Assert
      expect(paymentIntent.amount).toBe(6000);
      expect(paymentIntent.metadata.order_type).toBe("MULTI_FARM");
    });

    it("should handle subscription box setup", async () => {
      // Create customer
      const customer = await stripe.customers.create({
        email: "subscriber@farmersmarket.app",
        name: "Weekly Subscriber",
        metadata: {
          subscription_type: "WEEKLY_BOX",
          delivery_day: "SATURDAY",
        },
      });

      // Create subscription product
      const product = await stripe.products.create({
        name: "Weekly Organic Box",
        metadata: {
          box_size: "FAMILY",
          farm_id: "farm-001",
        },
      });

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 4999,
        currency: "usd",
        recurring: {
          interval: "week",
        },
      });

      // Assert
      expect(customer.metadata.subscription_type).toBe("WEEKLY_BOX");
      expect(product.metadata.box_size).toBe("FAMILY");
      expect(price.recurring?.interval).toBe("week");
    });

    it("should handle delivery fee calculation", async () => {
      // Scenario: Free delivery over $50, otherwise $5.99
      const subtotalUnderThreshold = 3500; // $35.00
      const subtotalOverThreshold = 6500; // $65.00
      const deliveryFee = 599; // $5.99
      const _freeDeliveryThreshold = 5000; // $50.00

      // Order under threshold
      const totalWithFee = subtotalUnderThreshold + deliveryFee;
      const paymentIntent1 = await stripe.paymentIntents.create({
        amount: totalWithFee,
        currency: "usd",
        metadata: {
          subtotal: subtotalUnderThreshold.toString(),
          delivery_fee: deliveryFee.toString(),
          free_delivery: "false",
        },
      });

      // Order over threshold (free delivery)
      const paymentIntent2 = await stripe.paymentIntents.create({
        amount: subtotalOverThreshold,
        currency: "usd",
        metadata: {
          subtotal: subtotalOverThreshold.toString(),
          delivery_fee: "0",
          free_delivery: "true",
        },
      });

      // Assert
      expect(paymentIntent1.amount).toBe(4099);
      expect(paymentIntent1.metadata.free_delivery).toBe("false");
      expect(paymentIntent2.amount).toBe(6500);
      expect(paymentIntent2.metadata.free_delivery).toBe("true");
    });
  });

  describe("⚠️ Error Handling", () => {
    it("should handle card declined error", async () => {
      // Act & Assert - Using test card that always declines
      await expect(
        stripe.paymentIntents.create({
          amount: 2000,
          currency: "usd",
          payment_method: "pm_card_chargeDeclined",
          confirm: true,
          return_url: "https://farmersmarket.app/order/complete",
        }),
      ).rejects.toThrow();
    });

    it("should handle insufficient funds error", async () => {
      // Act & Assert
      await expect(
        stripe.paymentIntents.create({
          amount: 2000,
          currency: "usd",
          payment_method: "pm_card_chargeDeclinedInsufficientFunds",
          confirm: true,
          return_url: "https://farmersmarket.app/order/complete",
        }),
      ).rejects.toThrow();
    });

    it("should handle invalid currency", async () => {
      // Act & Assert
      await expect(
        stripe.paymentIntents.create({
          amount: 2000,
          currency: "invalid_currency" as any,
        }),
      ).rejects.toThrow();
    });

    it("should handle non-existent resource", async () => {
      // Act & Assert
      await expect(
        stripe.paymentIntents.retrieve("pi_nonexistent_12345"),
      ).rejects.toThrow();
    });
  });
});

/**
 * Helper function to check if stripe-mock is running
 */
async function isStripeMockRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${STRIPE_MOCK_URL}/v1/customers`, {
      method: "GET",
      headers: {
        Authorization: "Bearer sk_test_mock",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Export for use in setup scripts
export { getStripeClient, isStripeMockRunning };
