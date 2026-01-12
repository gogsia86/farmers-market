/**
 * Comprehensive Site Functionality Test Script
 * Tests login, order creation, and admin dashboard functionality
 */

import { compare } from "bcryptjs";
import { database } from "../src/lib/database/index.js";

const prisma = database;

interface TestResult {
  test: string;
  status: "PASS" | "FAIL" | "SKIP";
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(
  test: string,
  status: "PASS" | "FAIL" | "SKIP",
  message: string,
  details?: any,
) {
  results.push({ test, status, message, details });
  const emoji = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⏭️";
  console.log(`${emoji} ${test}: ${message}`);
  if (details) {
    console.log("   Details:", JSON.stringify(details, null, 2));
  }
}

async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logTest(
      "Database Connection",
      "PASS",
      "Successfully connected to database",
    );
    return true;
  } catch (error) {
    logTest(
      "Database Connection",
      "FAIL",
      "Failed to connect to database",
      error,
    );
    return false;
  }
}

async function testUserAuthentication() {
  try {
    // Test admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@farmersmarket.app" },
      include: { accounts: true },
    });

    if (!adminUser) {
      logTest(
        "User Authentication",
        "FAIL",
        "Admin user not found in database",
      );
      return false;
    }

    // Test password verification
    if (adminUser.password) {
      const isValid = await compare("Admin123!", adminUser.password);
      if (isValid) {
        logTest("User Authentication", "PASS", "Admin credentials are valid", {
          email: adminUser.email,
          role: adminUser.role,
          id: adminUser.id,
        });
      } else {
        logTest(
          "User Authentication",
          "FAIL",
          "Admin password verification failed",
        );
        return false;
      }
    } else {
      logTest("User Authentication", "FAIL", "Admin user has no password set");
      return false;
    }

    // Test farmer user
    const farmerUser = await prisma.user.findUnique({
      where: { email: "ana@farmersmarket.app" },
    });

    if (!farmerUser) {
      logTest("Farmer User Check", "FAIL", "Farmer user not found");
      return false;
    }

    logTest("Farmer User Check", "PASS", "Farmer user exists", {
      email: farmerUser.email,
      role: farmerUser.role,
      id: farmerUser.id,
    });

    // Test consumer user
    const consumerUser = await prisma.user.findUnique({
      where: { email: "divna@farmersmarket.app" },
    });

    if (!consumerUser) {
      logTest("Consumer User Check", "FAIL", "Consumer user not found");
      return false;
    }

    logTest("Consumer User Check", "PASS", "Consumer user exists", {
      email: consumerUser.email,
      role: consumerUser.role,
      id: consumerUser.id,
    });

    return true;
  } catch (error) {
    logTest(
      "User Authentication",
      "FAIL",
      "Error during authentication test",
      error,
    );
    return false;
  }
}

async function testFarmsData() {
  try {
    const farms = await prisma.farm.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      take: 5,
    });

    if (farms.length === 0) {
      logTest("Farms Data", "FAIL", "No farms found in database");
      return false;
    }

    logTest("Farms Data", "PASS", `Found ${farms.length} farms with products`, {
      farms: farms.map((f) => ({
        id: f.id,
        name: f.name,
        status: f.status,
        productCount: f._count.products,
      })),
    });

    return true;
  } catch (error) {
    logTest("Farms Data", "FAIL", "Error fetching farms", error);
    return false;
  }
}

async function testProductsData() {
  try {
    const products = await prisma.product.findMany({
      include: {
        farm: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      take: 10,
    });

    if (products.length === 0) {
      logTest("Products Data", "FAIL", "No products found in database");
      return false;
    }

    logTest("Products Data", "PASS", `Found ${products.length} products`, {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        farmName: p.farm.name,
      })),
    });

    return true;
  } catch (error) {
    logTest("Products Data", "FAIL", "Error fetching products", error);
    return false;
  }
}

async function testCreateOrder() {
  try {
    // Get a consumer user
    const consumer = await prisma.user.findUnique({
      where: { email: "divna@farmersmarket.app" },
    });

    if (!consumer) {
      logTest("Create Order", "FAIL", "Consumer user not found");
      return false;
    }

    // Get available products
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        stock: { gt: 0 },
      },
      take: 3,
      include: {
        farm: true,
      },
    });

    if (products.length === 0) {
      logTest("Create Order", "FAIL", "No available products for order");
      return false;
    }

    // Create order
    const orderData = {
      userId: consumer.id,
      farmId: products[0].farmId,
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod: "CREDIT_CARD",
      fulfillmentMethod: "DELIVERY",
      subtotal: 0,
      tax: 0,
      total: 0,
      shippingAddress: {
        street: "123 Test Street",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
        country: "USA",
      },
      billingAddress: {
        street: "123 Test Street",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
        country: "USA",
      },
    };

    // Calculate totals
    let subtotal = 0;
    const orderItems = products.slice(0, 2).map((product) => {
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemTotal = product.price * quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        quantity,
        price: product.price,
        total: itemTotal,
      };
    });

    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    orderData.subtotal = subtotal;
    orderData.tax = tax;
    orderData.total = total;

    const order = await prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    logTest("Create Order", "PASS", "Successfully created test order", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customer: order.user.email,
      itemCount: order.items.length,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: order.status,
      items: order.items.map((item) => ({
        product: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
    });

    return true;
  } catch (error) {
    logTest("Create Order", "FAIL", "Error creating order", error);
    return false;
  }
}

async function testOrdersData() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        farm: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
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

    if (orders.length === 0) {
      logTest("Orders Data", "FAIL", "No orders found in database");
      return false;
    }

    logTest("Orders Data", "PASS", `Found ${orders.length} orders`, {
      orders: orders.map((o) => ({
        orderNumber: o.orderNumber,
        customer: o.user.email,
        farm: o.farm.name,
        itemCount: o._count.items,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
    });

    return true;
  } catch (error) {
    logTest("Orders Data", "FAIL", "Error fetching orders", error);
    return false;
  }
}

async function testAdminDashboardData() {
  try {
    // Get dashboard statistics
    const [
      totalUsers,
      totalFarms,
      totalProducts,
      totalOrders,
      pendingOrders,
      revenueData,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.farm.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          paymentStatus: "COMPLETED",
        },
      }),
    ]);

    const dashboardStats = {
      totalUsers,
      totalFarms,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: revenueData._sum.total || 0,
    };

    logTest(
      "Admin Dashboard Data",
      "PASS",
      "Successfully retrieved dashboard statistics",
      dashboardStats,
    );

    // Test recent activity
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
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

    logTest(
      "Recent Orders",
      "PASS",
      `Found ${recentOrders.length} recent orders`,
      {
        orders: recentOrders.map((o) => ({
          orderNumber: o.orderNumber,
          customer: o.user.email,
          farm: o.farm.name,
          total: o.total,
          status: o.status,
        })),
      },
    );

    // Test user distribution
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    logTest("User Distribution", "PASS", "Retrieved user role distribution", {
      distribution: usersByRole.map((r) => ({
        role: r.role,
        count: r._count.role,
      })),
    });

    return true;
  } catch (error) {
    logTest(
      "Admin Dashboard Data",
      "FAIL",
      "Error fetching admin dashboard data",
      error,
    );
    return false;
  }
}

async function testAPIEndpoints() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://farmers-market-platform.vercel.app";

    // Test health endpoint
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();

    if (healthResponse.ok) {
      logTest("API Health Check", "PASS", "Health endpoint is accessible", {
        status: healthData.status,
        checks: healthData.checks,
      });
    } else {
      logTest(
        "API Health Check",
        "FAIL",
        `Health check returned ${healthResponse.status}`,
      );
    }

    // Test farms API
    const farmsResponse = await fetch(`${baseUrl}/api/farms`);
    const farmsData = await farmsResponse.json();

    if (farmsResponse.ok && farmsData.success) {
      logTest(
        "API Farms Endpoint",
        "PASS",
        `Farms API returned ${farmsData.data?.length || 0} farms`,
      );
    } else {
      logTest(
        "API Farms Endpoint",
        "FAIL",
        `Farms API returned ${farmsResponse.status}`,
      );
    }

    return true;
  } catch (error) {
    logTest("API Endpoints", "FAIL", "Error testing API endpoints", error);
    return false;
  }
}

async function generateTestReport() {
  console.log("\n" + "=".repeat(80));
  console.log("📊 TEST REPORT SUMMARY");
  console.log("=".repeat(80));

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const skipped = results.filter((r) => r.status === "SKIP").length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(2)}%`);

  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    results
      .filter((r) => r.status === "FAIL")
      .forEach((result) => {
        console.log(`   - ${result.test}: ${result.message}`);
      });
  }

  console.log("\n" + "=".repeat(80));

  return {
    total,
    passed,
    failed,
    skipped,
    successRate: (passed / total) * 100,
    results,
  };
}

async function main() {
  console.log("🚀 Starting Comprehensive Site Functionality Tests\n");

  // Test 1: Database Connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log("\n❌ Database connection failed. Stopping tests.");
    process.exit(1);
  }

  // Test 2: User Authentication
  await testUserAuthentication();

  // Test 3: Farms Data
  await testFarmsData();

  // Test 4: Products Data
  await testProductsData();

  // Test 5: Create Test Order
  await testCreateOrder();

  // Test 6: Orders Data
  await testOrdersData();

  // Test 7: Admin Dashboard Data
  await testAdminDashboardData();

  // Test 8: API Endpoints
  await testAPIEndpoints();

  // Generate final report
  const report = await generateTestReport();

  // Cleanup
  await prisma.$disconnect();

  // Exit with appropriate code
  if (report.failed > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Fatal error during testing:", error);
  prisma.$disconnect();
  process.exit(1);
});
