/**
 * Comprehensive Site Status and Functionality Summary
 * Generates a detailed report of the site's current state
 */

import { database } from "../src/lib/database/index.js";

interface StatusReport {
  timestamp: string;
  database: {
    connected: boolean;
    latency?: number;
    error?: string;
  };
  users: {
    total: number;
    byRole: Record<string, number>;
    testAccounts: Array<{
      email: string;
      role: string;
      password: string;
    }>;
  };
  farms: {
    total: number;
    active: number;
    byStatus: Record<string, number>;
    withProducts: number;
  };
  products: {
    total: number;
    active: number;
    inStock: number;
    byCategory: Record<string, number>;
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    byPaymentStatus: Record<string, number>;
    totalRevenue: number;
    averageOrderValue: number;
  };
  apiEndpoints: {
    health: { status: string; responseTime?: number };
    farms: { status: string; responseTime?: number };
  };
  deployment: {
    url: string;
    environment: string;
  };
}

async function generateSiteStatusSummary(): Promise<StatusReport> {
  console.log("🔍 Generating Site Status Summary...\n");

  const report: StatusReport = {
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
    },
    users: {
      total: 0,
      byRole: {},
      testAccounts: [],
    },
    farms: {
      total: 0,
      active: 0,
      byStatus: {},
      withProducts: 0,
    },
    products: {
      total: 0,
      active: 0,
      inStock: 0,
      byCategory: {},
    },
    orders: {
      total: 0,
      byStatus: {},
      byPaymentStatus: {},
      totalRevenue: 0,
      averageOrderValue: 0,
    },
    apiEndpoints: {
      health: { status: "unknown" },
      farms: { status: "unknown" },
    },
    deployment: {
      url:
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://farmers-market-platform.vercel.app",
      environment: process.env.NODE_ENV || "production",
    },
  };

  // Test database connection
  try {
    const startTime = Date.now();
    await database.$queryRaw`SELECT 1`;
    report.database.connected = true;
    report.database.latency = Date.now() - startTime;
    console.log("✅ Database: Connected");
  } catch (error) {
    report.database.error =
      error instanceof Error ? error.message : "Unknown error";
    console.log("❌ Database: Connection failed");
    return report;
  }

  // Get user statistics
  try {
    const [users, usersByRole] = await Promise.all([
      database.user.count(),
      database.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
    ]);

    report.users.total = users;
    report.users.byRole = usersByRole.reduce(
      (acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Add test account credentials
    report.users.testAccounts = [
      {
        email: "admin@farmersmarket.app",
        role: "ADMIN",
        password: "Admin123!",
      },
      {
        email: "ana@farmersmarket.app",
        role: "FARMER",
        password: "Farmer123!",
      },
      {
        email: "divna@farmersmarket.app",
        role: "CONSUMER",
        password: "Consumer123!",
      },
    ];

    console.log(`✅ Users: ${users} total`);
  } catch (error) {
    console.log("❌ Users: Failed to fetch statistics");
  }

  // Get farm statistics
  try {
    const [farms, activeFarms, farmsByStatus, farmsWithProducts] =
      await Promise.all([
        database.farm.count(),
        database.farm.count({ where: { status: "ACTIVE" } }),
        database.farm.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        database.farm.count({
          where: {
            products: {
              some: {},
            },
          },
        }),
      ]);

    report.farms.total = farms;
    report.farms.active = activeFarms;
    report.farms.byStatus = farmsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );
    report.farms.withProducts = farmsWithProducts;

    console.log(`✅ Farms: ${farms} total, ${activeFarms} active`);
  } catch (error) {
    console.log("❌ Farms: Failed to fetch statistics");
  }

  // Get product statistics
  try {
    const [products, activeProducts, inStockProducts, productsByCategory] =
      await Promise.all([
        database.product.count(),
        database.product.count({ where: { status: "ACTIVE" } }),
        database.product.count({ where: { inStock: true } }),
        database.product.groupBy({
          by: ["category"],
          _count: { category: true },
        }),
      ]);

    report.products.total = products;
    report.products.active = activeProducts;
    report.products.inStock = inStockProducts;
    report.products.byCategory = productsByCategory.reduce(
      (acc, item) => {
        acc[item.category] = item._count.category;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log(
      `✅ Products: ${products} total, ${activeProducts} active, ${inStockProducts} in stock`,
    );
  } catch (error) {
    console.log("❌ Products: Failed to fetch statistics");
  }

  // Get order statistics
  try {
    const [
      orders,
      ordersByStatus,
      ordersByPaymentStatus,
      revenueData,
      avgOrderValue,
    ] = await Promise.all([
      database.order.count(),
      database.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      database.order.groupBy({
        by: ["paymentStatus"],
        _count: { paymentStatus: true },
      }),
      database.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "COMPLETED" },
      }),
      database.order.aggregate({
        _avg: { total: true },
      }),
    ]);

    report.orders.total = orders;
    report.orders.byStatus = ordersByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );
    report.orders.byPaymentStatus = ordersByPaymentStatus.reduce(
      (acc, item) => {
        acc[item.paymentStatus] = item._count.paymentStatus;
        return acc;
      },
      {} as Record<string, number>,
    );
    report.orders.totalRevenue = Number(revenueData._sum.total || 0);
    report.orders.averageOrderValue = Number(avgOrderValue._avg.total || 0);

    console.log(`✅ Orders: ${orders} total`);
  } catch (error) {
    console.log("❌ Orders: Failed to fetch statistics");
  }

  // Test API endpoints
  try {
    const baseUrl = report.deployment.url;

    // Test health endpoint
    try {
      const startTime = Date.now();
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      const responseTime = Date.now() - startTime;

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        report.apiEndpoints.health = {
          status: healthData.status || "unknown",
          responseTime,
        };
        console.log(`✅ API Health: ${healthData.status} (${responseTime}ms)`);
      } else {
        report.apiEndpoints.health = {
          status: `error-${healthResponse.status}`,
          responseTime,
        };
        console.log(
          `⚠️  API Health: Returned ${healthResponse.status} (${responseTime}ms)`,
        );
      }
    } catch (error) {
      report.apiEndpoints.health = { status: "unreachable" };
      console.log("❌ API Health: Unreachable");
    }

    // Test farms endpoint
    try {
      const startTime = Date.now();
      const farmsResponse = await fetch(`${baseUrl}/api/farms`);
      const responseTime = Date.now() - startTime;

      if (farmsResponse.ok) {
        const farmsData = await farmsResponse.json();
        report.apiEndpoints.farms = {
          status: farmsData.success ? "ok" : "error",
          responseTime,
        };
        console.log(
          `✅ API Farms: ${farmsData.success ? "OK" : "Error"} (${responseTime}ms)`,
        );
      } else {
        report.apiEndpoints.farms = {
          status: `error-${farmsResponse.status}`,
          responseTime,
        };
        console.log(
          `⚠️  API Farms: Returned ${farmsResponse.status} (${responseTime}ms)`,
        );
      }
    } catch (error) {
      report.apiEndpoints.farms = { status: "unreachable" };
      console.log("❌ API Farms: Unreachable");
    }
  } catch (error) {
    console.log("❌ API Endpoints: Failed to test");
  }

  return report;
}

function printFormattedReport(report: StatusReport) {
  console.log("\n" + "=".repeat(80));
  console.log("📊 FARMERS MARKET PLATFORM - SITE STATUS REPORT");
  console.log("=".repeat(80));
  console.log(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`Environment: ${report.deployment.environment}`);
  console.log(`Deployment URL: ${report.deployment.url}`);
  console.log("=".repeat(80));

  // Database Status
  console.log("\n🗄️  DATABASE STATUS");
  console.log("-".repeat(80));
  if (report.database.connected) {
    console.log(`✅ Status: Connected`);
    console.log(`⚡ Latency: ${report.database.latency}ms`);
  } else {
    console.log(`❌ Status: Disconnected`);
    if (report.database.error) {
      console.log(`   Error: ${report.database.error}`);
    }
  }

  // Users
  console.log("\n👥 USERS");
  console.log("-".repeat(80));
  console.log(`Total Users: ${report.users.total}`);
  console.log(`By Role:`);
  Object.entries(report.users.byRole).forEach(([role, count]) => {
    console.log(`  • ${role}: ${count}`);
  });

  console.log("\n🔐 Test Accounts:");
  report.users.testAccounts.forEach((account) => {
    console.log(`  ${account.role}:`);
    console.log(`    Email: ${account.email}`);
    console.log(`    Password: ${account.password}`);
  });

  // Farms
  console.log("\n🏡 FARMS");
  console.log("-".repeat(80));
  console.log(`Total Farms: ${report.farms.total}`);
  console.log(`Active Farms: ${report.farms.active}`);
  console.log(`Farms with Products: ${report.farms.withProducts}`);
  if (Object.keys(report.farms.byStatus).length > 0) {
    console.log(`By Status:`);
    Object.entries(report.farms.byStatus).forEach(([status, count]) => {
      console.log(`  • ${status}: ${count}`);
    });
  }

  // Products
  console.log("\n🥕 PRODUCTS");
  console.log("-".repeat(80));
  console.log(`Total Products: ${report.products.total}`);
  console.log(`Active Products: ${report.products.active}`);
  console.log(`In Stock: ${report.products.inStock}`);
  if (Object.keys(report.products.byCategory).length > 0) {
    console.log(`By Category:`);
    Object.entries(report.products.byCategory).forEach(([category, count]) => {
      console.log(`  • ${category}: ${count}`);
    });
  }

  // Orders
  console.log("\n📦 ORDERS");
  console.log("-".repeat(80));
  console.log(`Total Orders: ${report.orders.total}`);
  console.log(
    `Total Revenue: $${report.orders.totalRevenue.toFixed(2)} (completed orders)`,
  );
  console.log(
    `Average Order Value: $${report.orders.averageOrderValue.toFixed(2)}`,
  );
  if (Object.keys(report.orders.byStatus).length > 0) {
    console.log(`By Status:`);
    Object.entries(report.orders.byStatus).forEach(([status, count]) => {
      console.log(`  • ${status}: ${count}`);
    });
  }
  if (Object.keys(report.orders.byPaymentStatus).length > 0) {
    console.log(`By Payment Status:`);
    Object.entries(report.orders.byPaymentStatus).forEach(
      ([status, count]) => {
        console.log(`  • ${status}: ${count}`);
      },
    );
  }

  // API Endpoints
  console.log("\n🌐 API ENDPOINTS");
  console.log("-".repeat(80));
  console.log(
    `Health Check: ${report.apiEndpoints.health.status}${report.apiEndpoints.health.responseTime ? ` (${report.apiEndpoints.health.responseTime}ms)` : ""}`,
  );
  console.log(
    `Farms API: ${report.apiEndpoints.farms.status}${report.apiEndpoints.farms.responseTime ? ` (${report.apiEndpoints.farms.responseTime}ms)` : ""}`,
  );

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("📋 SUMMARY");
  console.log("=".repeat(80));

  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!report.database.connected) {
    issues.push("Database is not connected");
  } else if (report.database.latency && report.database.latency > 1000) {
    issues.push(
      `Database latency is high (${report.database.latency}ms) - consider optimization`,
    );
  }

  if (report.users.total === 0) {
    issues.push("No users in database - run seed script");
  }

  if (report.farms.total === 0) {
    issues.push("No farms in database - run seed script");
  }

  if (report.products.total === 0) {
    issues.push("No products in database - run seed script");
  }

  if (report.orders.total === 0) {
    recommendations.push("Create test orders to test order flow");
  }

  if (report.apiEndpoints.health.status.startsWith("error")) {
    issues.push("Health API endpoint is returning errors");
  }

  if (report.apiEndpoints.farms.status.startsWith("error")) {
    issues.push("Farms API endpoint is returning errors");
  }

  if (issues.length > 0) {
    console.log("\n⚠️  Issues Found:");
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  } else {
    console.log("\n✅ No critical issues found!");
  }

  if (recommendations.length > 0) {
    console.log("\n💡 Recommendations:");
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  console.log("\n" + "=".repeat(80));
  console.log("🚀 Next Steps:");
  console.log("-".repeat(80));
  console.log("1. Visit the site: " + report.deployment.url);
  console.log("2. Test login with the credentials above");
  console.log("3. Browse farms and products");
  console.log("4. Create test orders as a consumer");
  console.log("5. Manage farms and products as a farmer");
  console.log("6. Access admin dashboard as admin");
  console.log("=".repeat(80) + "\n");
}

async function main() {
  try {
    const report = await generateSiteStatusSummary();
    printFormattedReport(report);

    // Save report to file
    const fs = await import("fs/promises");
    const reportPath = `site-status-report-${Date.now()}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Full report saved to: ${reportPath}\n`);

    await database.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to generate status report:", error);
    await database.$disconnect();
    process.exit(1);
  }
}

main();
