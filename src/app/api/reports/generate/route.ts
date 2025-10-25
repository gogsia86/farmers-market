/**
 * REPORT GENERATION API
 * Divine agricultural business intelligence reporting
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportType, startDate, endDate, farmId, format = "JSON" } = body;

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify farm access
    if (farmId && session.user.role !== "ADMIN") {
      const farm = await database.farm.findUnique({
        where: { id: farmId },
      });

      if (!farm || farm.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Generate report based on type
    let reportData;
    switch (reportType) {
      case "SALES":
        reportData = await generateSalesReport(startDate, endDate, farmId);
        break;
      case "INVENTORY":
        reportData = await generateInventoryReport(farmId);
        break;
      case "PRODUCTS":
        reportData = await generateProductReport(startDate, endDate, farmId);
        break;
      case "CUSTOMERS":
        reportData = await generateCustomerReport(startDate, endDate, farmId);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    // Format response
    if (format === "CSV") {
      return new NextResponse(convertToCSV(reportData), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${reportType}_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      reportType,
      generated: new Date(),
      period: { startDate, endDate },
      data: reportData,
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

async function generateSalesReport(
  startDate: string,
  endDate: string,
  farmId?: string
) {
  const where: Record<string, unknown> = {
    createdAt: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
  };

  if (farmId) {
    where.farmId = farmId;
  }

  const orders = await database.order.findMany({
    where,
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              category: true,
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
    orderBy: { createdAt: "desc" },
  });

  return {
    summary: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce(
        (sum, o) => sum + Number.parseFloat(o.total.toString()),
        0
      ),
      averageOrderValue:
        orders.length > 0
          ? orders.reduce(
              (sum, o) => sum + Number.parseFloat(o.total.toString()),
              0
            ) / orders.length
          : 0,
    },
    orders: orders.map((order) => ({
      orderId: order.id,
      customerName: order.user?.name,
      customerEmail: order.user?.email,
      total: order.total,
      status: order.status,
      itemCount: order.items.length,
      createdAt: order.createdAt,
    })),
  };
}

async function generateInventoryReport(farmId?: string) {
  const where: Record<string, unknown> = {};
  if (farmId) {
    where.farmId = farmId;
  }

  const products = await database.product.findMany({
    where,
    include: {
      farm: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { quantity: "asc" },
  });

  return {
    summary: {
      totalProducts: products.length,
      inStock: products.filter((p) => p.inStock).length,
      outOfStock: products.filter((p) => !p.inStock).length,
      lowStock: products.filter((p) => p.inStock && (p.quantity || 0) < 10)
        .length,
    },
    products: products.map((product) => ({
      productId: product.id,
      name: product.name,
      farmName: product.farm.name,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      status: !product.inStock
        ? "OUT_OF_STOCK"
        : (product.quantity || 0) < 10
          ? "LOW_STOCK"
          : "IN_STOCK",
    })),
  };
}

async function generateProductReport(
  startDate: string,
  endDate: string,
  farmId?: string
) {
  const where: Record<string, unknown> = {};
  if (farmId) {
    where.farmId = farmId;
  }

  const products = await database.product.findMany({
    where,
    include: {
      reviews: {
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      },
      orderItems: {
        where: {
          order: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        },
      },
    },
  });

  return {
    products: products.map((product) => {
      const totalSold = product.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const revenue = product.orderItems.reduce(
        (sum, item) =>
          sum + Number.parseFloat(item.price.toString()) * item.quantity,
        0
      );
      const averageRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      return {
        productId: product.id,
        name: product.name,
        category: product.category,
        totalSold,
        revenue,
        averageRating,
        reviewCount: product.reviews.length,
      };
    }),
  };
}

async function generateCustomerReport(
  startDate: string,
  endDate: string,
  farmId?: string
) {
  const where: Record<string, unknown> = {
    createdAt: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
  };

  if (farmId) {
    where.farmId = farmId;
  }

  const orders = await database.order.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Group by customer
  const customerMap = new Map<
    string,
    {
      name: string;
      email: string;
      orderCount: number;
      totalSpent: number;
    }
  >();

  for (const order of orders) {
    if (!order.user) continue;

    const existing = customerMap.get(order.user.id) || {
      name: order.user.name || "",
      email: order.user.email || "",
      orderCount: 0,
      totalSpent: 0,
    };

    existing.orderCount++;
    existing.totalSpent += Number.parseFloat(order.total.toString());

    customerMap.set(order.user.id, existing);
  }

  return {
    summary: {
      totalCustomers: customerMap.size,
      totalOrders: orders.length,
      averageOrdersPerCustomer:
        customerMap.size > 0 ? orders.length / customerMap.size : 0,
    },
    customers: Array.from(customerMap.entries()).map(([id, data]) => ({
      customerId: id,
      ...data,
      averageOrderValue: data.totalSpent / data.orderCount,
    })),
  };
}

function convertToCSV(data: unknown): string {
  // Simple CSV conversion for reports
  const json = typeof data === "string" ? JSON.parse(data) : data;
  const rows: string[] = [];

  if (Array.isArray(json)) {
    // Get headers from first object
    const headers = Object.keys(json[0] || {});
    rows.push(headers.join(","));

    // Add data rows
    for (const item of json) {
      rows.push(headers.map((h) => item[h]).join(","));
    }
  }

  return rows.join("\\n");
}
