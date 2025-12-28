import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface FinancialStats {
  currentBalance: number;
  pendingBalance: number;
  totalRevenue: number;
  totalPayout: number;
  revenueChange: number;
  orderCount: number;
  averageOrderValue: number;
}

interface Transaction {
  id: string;
  type: "SALE" | "PAYOUT" | "REFUND" | "FEE";
  amount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  description: string;
  orderNumber?: string;
  createdAt: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { success: false, error: "Only farmers can access financial data" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");
    const period = searchParams.get("period") || "30d";

    if (!farmId) {
      return NextResponse.json(
        { success: false, error: "Farm ID is required" },
        { status: 400 },
      );
    }

    // Verify farm ownership
    const farm = await database.farm.findFirst({
      where: {
        id: farmId,
        ownerId: session.user.id,
      },
    });

    if (!farm) {
      return NextResponse.json(
        { success: false, error: "Farm not found or access denied" },
        { status: 404 },
      );
    }

    // Calculate date range based on period
    const now = new Date();
    const periodStart = new Date();

    switch (period) {
      case "7d":
        periodStart.setDate(now.getDate() - 7);
        break;
      case "30d":
        periodStart.setDate(now.getDate() - 30);
        break;
      case "90d":
        periodStart.setDate(now.getDate() - 90);
        break;
      case "1y":
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
      default:
        periodStart.setDate(now.getDate() - 30);
    }

    // Calculate previous period for comparison
    const periodLength = now.getTime() - periodStart.getTime();
    const previousPeriodStart = new Date(periodStart.getTime() - periodLength);

    // Fetch orders for current period
    const currentOrders = await database.order.findMany({
      where: {
        farmId,
        createdAt: {
          gte: periodStart,
          lte: now,
        },
        status: {
          notIn: ["CANCELLED"],
        },
      },
      include: {
        items: {
          where: {
            product: {
              farmId,
            },
          },
        },
        Payment: true,
        customer: true,
      },
    });

    // Fetch orders for previous period (for comparison)
    const previousOrders = await database.order.findMany({
      where: {
        farmId,
        createdAt: {
          gte: previousPeriodStart,
          lt: periodStart,
        },
        status: {
          notIn: ["CANCELLED"],
        },
      },
      include: {
        items: {
          where: {
            product: {
              farmId,
            },
          },
        },
        Payment: true,
        customer: true,
      },
    });

    // Calculate revenue from farm's items only
    const calculateFarmRevenue = (orders: typeof currentOrders) => {
      return orders.reduce((total, order) => {
        const farmItemsTotal = order.items.reduce(
          (sum: number, item: any) => sum + Number(item.subtotal),
          0,
        );
        return total + farmItemsTotal;
      }, 0);
    };

    const currentRevenue = calculateFarmRevenue(currentOrders);
    const previousRevenue = calculateFarmRevenue(previousOrders);

    // Calculate revenue change percentage
    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    // Fetch payouts
    const payouts = await database.payout.findMany({
      where: {
        farmId,
        createdAt: {
          gte: periodStart,
        },
      },
    });

    const totalPayout = payouts.reduce(
      (sum, payout) => sum + Number(payout.amount),
      0,
    );

    // Calculate pending balance (orders in PENDING/CONFIRMED/PREPARING status)
    const pendingOrders = await database.order.findMany({
      where: {
        farmId,
        status: {
          in: ["PENDING", "CONFIRMED", "PREPARING"],
        },
      },
      include: {
        items: {
          where: {
            product: {
              farmId,
            },
          },
        },
        customer: true,
        Payment: true,
      },
    });

    const pendingBalance = calculateFarmRevenue(pendingOrders);

    // Calculate available balance (completed orders minus payouts)
    const completedOrders = await database.order.findMany({
      where: {
        farmId,
        status: {
          in: ["FULFILLED", "COMPLETED"],
        },
        paymentStatus: "PAID",
      },
      include: {
        items: {
          where: {
            product: {
              farmId,
            },
          },
        },
        customer: true,
        Payment: true,
      },
    });

    const completedRevenue = calculateFarmRevenue(completedOrders);
    const allPayouts = await database.payout.findMany({
      where: {
        farmId,
        status: "COMPLETED",
      },
    });

    const totalPayoutsAmount = allPayouts.reduce(
      (sum, payout) => sum + Number(payout.amount),
      0,
    );

    const currentBalance = Math.max(0, completedRevenue - totalPayoutsAmount);

    // Build stats
    const stats: FinancialStats = {
      currentBalance,
      pendingBalance,
      totalRevenue: currentRevenue,
      totalPayout,
      revenueChange,
      orderCount: currentOrders.length,
      averageOrderValue:
        currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0,
    };

    // Build transactions list
    const transactions: Transaction[] = [];

    // Add sales transactions
    currentOrders.forEach((order) => {
      const farmItemsTotal = order.items.reduce(
        (sum: number, item: any) => sum + Number(item.subtotal),
        0,
      );

      transactions.push({
        id: order.id,
        type: "SALE",
        amount: farmItemsTotal,
        status: order.paymentStatus === "PAID" ? "COMPLETED" : "PENDING",
        description: `Order from ${order.customer?.name || "Customer"}`,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
      });
    });

    // Add payout transactions
    payouts.forEach((payout) => {
      transactions.push({
        id: payout.id,
        type: "PAYOUT",
        amount: Number(payout.amount),
        status:
          payout.status === "COMPLETED"
            ? "COMPLETED"
            : payout.status === "FAILED"
              ? "FAILED"
              : "PENDING",
        description: "Payout to bank account",
        createdAt: payout.createdAt.toISOString(),
      });
    });

    // Sort transactions by date (newest first)
    transactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Limit to 20 most recent transactions
    const recentTransactions = transactions.slice(0, 20);

    // Build revenue trend data
    const daysInPeriod = Math.ceil(
      (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    const dataPoints = Math.min(
      daysInPeriod,
      period === "1y" ? 12 : daysInPeriod,
    );

    const revenueData: RevenueData[] = [];

    for (let i = 0; i < dataPoints; i++) {
      const pointDate = new Date(periodStart);

      if (period === "1y") {
        // Monthly data points for yearly view
        pointDate.setMonth(periodStart.getMonth() + i);
      } else {
        // Daily data points for shorter periods
        const interval = Math.floor(daysInPeriod / dataPoints);
        pointDate.setDate(periodStart.getDate() + i * interval);
      }

      const nextDate = new Date(pointDate);
      if (period === "1y") {
        nextDate.setMonth(pointDate.getMonth() + 1);
      } else {
        const interval = Math.floor(daysInPeriod / dataPoints);
        nextDate.setDate(pointDate.getDate() + interval);
      }

      const ordersInPeriod = currentOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= pointDate && orderDate < nextDate;
      });

      const revenue = ordersInPeriod.reduce((sum, order) => {
        return (
          sum +
          order.items.reduce(
            (itemSum: number, item: any) => itemSum + Number(item.subtotal),
            0,
          )
        );
      }, 0);

      revenueData.push({
        date: pointDate.toISOString(),
        revenue,
        orders: ordersInPeriod.length,
      });
    }

    return NextResponse.json({
      success: true,
      stats,
      transactions: recentTransactions,
      revenueData,
    });
  } catch (error) {
    console.error("Error fetching financial data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch financial data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
