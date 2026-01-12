/**
 * Create Test Orders Script
 * Creates sample orders with the correct schema structure
 */

import { database } from "../src/lib/database/index.js";

async function createTestOrders() {
  console.log("🚀 Creating test orders...\n");

  try {
    // Get consumer users
    const consumers = await database.user.findMany({
      where: { role: "CONSUMER" },
    });

    if (consumers.length === 0) {
      console.log("❌ No consumer users found. Please run seed script first.");
      return;
    }

    // Get farms with products
    const farms = await database.farm.findMany({
      include: {
        products: {
          where: {
            status: "ACTIVE",
            inStock: true,
          },
          take: 5,
        },
      },
    });

    if (farms.length === 0 || farms.every((f) => f.products.length === 0)) {
      console.log(
        "❌ No farms with products found. Please run seed script first.",
      );
      return;
    }

    console.log(
      `Found ${consumers.length} consumers and ${farms.length} farms\n`,
    );

    // Create orders
    const ordersToCreate = [];

    for (let i = 0; i < Math.min(5, consumers.length); i++) {
      const consumer = consumers[i];
      const farm = farms[i % farms.length];

      if (farm.products.length === 0) continue;

      // Select 2-3 random products
      const numProducts = Math.floor(Math.random() * 2) + 2;
      const selectedProducts = farm.products
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numProducts, farm.products.length));

      // Calculate order totals
      let subtotal = 0;
      const orderItems = selectedProducts.map((product) => {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemSubtotal = Number(product.price) * quantity;
        subtotal += itemSubtotal;

        return {
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          unit: product.unit,
          unitPrice: product.price,
          subtotal: itemSubtotal,
        };
      });

      const deliveryFee = 5.0;
      const platformFee = subtotal * 0.1; // 10% platform fee
      const tax = subtotal * 0.08; // 8% tax
      const farmerAmount = subtotal - platformFee; // Farmer gets subtotal minus platform fee
      const total = subtotal + deliveryFee + platformFee + tax;

      // Random status
      const statuses = ["PENDING", "CONFIRMED", "PREPARING", "READY"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      ordersToCreate.push({
        consumer,
        farm,
        orderItems,
        subtotal,
        deliveryFee,
        platformFee,
        farmerAmount,
        tax,
        total,
        status,
      });
    }

    // Create orders in database
    let createdCount = 0;
    for (const orderData of ordersToCreate) {
      try {
        const order = await database.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            customerId: orderData.consumer.id,
            farmId: orderData.farm.id,
            status: orderData.status as any,
            paymentStatus: "PENDING",
            subtotal: orderData.subtotal,
            deliveryFee: orderData.deliveryFee,
            platformFee: orderData.platformFee,
            farmerAmount: orderData.farmerAmount,
            tax: orderData.tax,
            total: orderData.total,
            fulfillmentMethod: "DELIVERY",
            shippingAddress: {
              street: "123 Test Street",
              city: "San Francisco",
              state: "CA",
              zipCode: "94102",
              country: "USA",
            },
            scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            items: {
              create: orderData.orderItems,
            },
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
            farm: {
              select: {
                name: true,
              },
            },
          },
        });

        console.log(`✅ Order created: ${order.orderNumber}`);
        console.log(
          `   Customer: ${order.customer.name} (${order.customer.email})`,
        );
        console.log(`   Farm: ${order.farm.name}`);
        console.log(`   Items: ${order.items.length}`);
        console.log(`   Total: $${Number(order.total).toFixed(2)}`);
        console.log(`   Status: ${order.status}\n`);

        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create order:`, error);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`🎉 Successfully created ${createdCount} test orders!`);
    console.log("=".repeat(60) + "\n");

    // Show summary
    const orderSummary = await database.order.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        farm: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    console.log("📊 Recent Orders Summary:\n");
    orderSummary.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.orderNumber}`);
      console.log(`   Customer: ${order.customer.email}`);
      console.log(`   Farm: ${order.farm.name}`);
      console.log(`   Items: ${order._count.items}`);
      console.log(`   Total: $${Number(order.total).toFixed(2)}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment: ${order.paymentStatus}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error creating test orders:", error);
    throw error;
  } finally {
    await database.$disconnect();
  }
}

// Run the script
createTestOrders()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
