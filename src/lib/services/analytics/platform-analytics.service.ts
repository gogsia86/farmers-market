/**
 * 📊 PLATFORM ANALYTICS SERVICE
 * Comprehensive analytics for admin dashboard
 * Aggregates platform-wide metrics for insights and reporting
 */

import { database } from "@/lib/database";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PlatformMetrics {
  users: UserMetrics;
  farms: FarmMetrics;
  products: ProductMetrics;
  orders: OrderMetrics;
  revenue: RevenueMetrics;
}

export interface UserMetrics {
  total: number;
  active: number;
  newThisMonth: number;
  byRole: {
    customers: number;
    farmers: number;
    admins: number;
  };
  growthRate: number;
}

export interface FarmMetrics {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  averageProducts: number;
  topPerforming: Array<{
    id: string;
    name: string;
    revenue: number;
    orderCount: number;
  }>;
}

export interface ProductMetrics {
  total: number;
  active: number;
  outOfStock: number;
  averagePrice: number;
  totalInventoryValue: number;
  topSelling: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export interface OrderMetrics {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  averageOrderValue: number;
  ordersThisMonth: number;
  growthRate: number;
}

export interface RevenueMetrics {
  total: number;
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
  averagePerOrder: number;
  platformFees: number;
  projectedMonthly: number;
}

export interface TimeSeriesData {
  label: string;
  value: number;
  date: Date;
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// PLATFORM ANALYTICS SERVICE
// ============================================================================

class PlatformAnalyticsService {
  private static instance: PlatformAnalyticsService;

  private constructor() { }

  public static getInstance(): PlatformAnalyticsService {
    if (!PlatformAnalyticsService.instance) {
      PlatformAnalyticsService.instance = new PlatformAnalyticsService();
    }
    return PlatformAnalyticsService.instance;
  }

  /**
   * Get comprehensive platform metrics
   */
  async getPlatformMetrics(
    dateRange?: DateRangeFilter
  ): Promise<PlatformMetrics> {
    const [users, farms, products, orders, revenue] = await Promise.all([
      this.getUserMetrics(dateRange),
      this.getFarmMetrics(dateRange),
      this.getProductMetrics(dateRange),
      this.getOrderMetrics(dateRange),
      this.getRevenueMetrics(dateRange),
    ]);

    return {
      users,
      farms,
      products,
      orders,
      revenue,
    };
  }

  /**
   * Get user metrics
   */
  async getUserMetrics(dateRange?: DateRangeFilter): Promise<UserMetrics> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total users
    const totalUsers = await database.user.count();

    // Active users (logged in within last 30 days)
    const activeUsers = await database.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // New users this month
    const newThisMonth = await database.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // New users last month
    const newLastMonth = await database.user.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth,
        },
      },
    });

    // Users by role
    const customers = await database.user.count({
      where: { role: "CONSUMER" },
    });

    const farmers = await database.user.count({
      where: { role: "FARMER" },
    });

    const admins = await database.user.count({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    });

    // Calculate growth rate
    const growthRate =
      newLastMonth > 0
        ? ((newThisMonth - newLastMonth) / newLastMonth) * 100
        : 100;

    return {
      total: totalUsers,
      active: activeUsers,
      newThisMonth,
      byRole: {
        customers,
        farmers,
        admins,
      },
      growthRate: Math.round(growthRate * 100) / 100,
    };
  }

  /**
   * Get farm metrics
   */
  async getFarmMetrics(dateRange?: DateRangeFilter): Promise<FarmMetrics> {
    const totalFarms = await database.farm.count();

    const verified = await database.farm.count({
      where: { verificationStatus: "VERIFIED" },
    });

    const pending = await database.farm.count({
      where: { verificationStatus: "PENDING" },
    });

    const rejected = await database.farm.count({
      where: { verificationStatus: "REJECTED" },
    });

    // Average products per farm
    const productCounts = await database.farm.findMany({
      select: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const averageProducts =
      productCounts.length > 0
        ? productCounts.reduce((sum: any, f: any) => sum + f._count.products, 0) /
        productCounts.length
        : 0;

    // Top performing farms by revenue
    const topFarms = await database.farm.findMany({
      select: {
        id: true,
        name: true,
        orders: {
          where: {
            status: { in: ["COMPLETED", "COMPLETED"] },
          },
          select: {
            total: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      take: 5,
    });

    const topPerforming = topFarms
      .map((farm: any) => ({
        id: farm.id,
        name: farm.name,
        revenue: farm.orders.reduce((sum: any, o: any) => sum + Number(o.total), 0),
        orderCount: farm._count.orders,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      total: totalFarms,
      verified,
      pending,
      rejected,
      averageProducts: Math.round(averageProducts * 10) / 10,
      topPerforming,
    };
  }

  /**
   * Get product metrics
   */
  async getProductMetrics(
    dateRange?: DateRangeFilter
  ): Promise<ProductMetrics> {
    const totalProducts = await database.product.count();

    const activeProducts = await database.product.count({
      where: { status: "ACTIVE" },
    });

    const outOfStock = await database.product.count({
      where: { status: "OUT_OF_STOCK" },
    });

    // Average price
    const priceAggregate = await database.product.aggregate({
      _avg: {
        price: true,
      },
    });

    const averagePrice = Number(priceAggregate._avg.price || 0);

    // Total inventory value
    const products = await database.product.findMany({
      select: {
        price: true,
        quantityAvailable: true,
      },
    });

    const totalInventoryValue = products.reduce((sum: any, p: any) => {
      const qty = Number(p.quantityAvailable || 0);
      const price = Number(p.price);
      return sum + qty * price;
    }, 0);

    // Top selling products
    const topProducts = await database.product.findMany({
      select: {
        id: true,
        name: true,
        orderItems: {
          select: {
            quantity: true,
            subtotal: true,
          },
        },
      },
      take: 100, // Get top 100 then sort
    });

    const topSelling = topProducts
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        sales: product.orderItems.reduce(
          (sum, item) => sum + Number(item.quantity),
          0
        ),
        revenue: product.orderItems.reduce(
          (sum, item) => sum + Number(item.subtotal),
          0
        ),
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    return {
      total: totalProducts,
      active: activeProducts,
      outOfStock,
      averagePrice: Math.round(averagePrice * 100) / 100,
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      topSelling,
    };
  }

  /**
   * Get order metrics
   */
  async getOrderMetrics(dateRange?: DateRangeFilter): Promise<OrderMetrics> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const totalOrders = await database.order.count();

    const pendingOrders = await database.order.count({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "PREPARING"] },
      },
    });

    const completedOrders = await database.order.count({
      where: {
        status: { in: ["COMPLETED", "COMPLETED"] },
      },
    });

    const cancelledOrders = await database.order.count({
      where: {
        status: { in: ["CANCELLED", "CANCELLED"] },
      },
    });

    // Orders this month
    const ordersThisMonth = await database.order.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Orders last month
    const ordersLastMonth = await database.order.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth,
        },
      },
    });

    // Average order value
    const orderAggregate = await database.order.aggregate({
      _avg: {
        total: true,
      },
      where: {
        status: { in: ["COMPLETED", "COMPLETED"] },
      },
    });

    const averageOrderValue = Number(orderAggregate._avg.total ?? 0);

    // Calculate growth rate
    const growthRate =
      ordersLastMonth > 0
        ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
        : 100;

    return {
      total: totalOrders,
      pending: pendingOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      ordersThisMonth,
      growthRate: Math.round(growthRate * 100) / 100,
    };
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(
    dateRange?: DateRangeFilter
  ): Promise<RevenueMetrics> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total revenue (completed orders only)
    const totalRevenue = await database.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: { in: ["COMPLETED", "COMPLETED"] },
      },
    });

    const total = Number(totalRevenue._sum.total ?? 0);

    // Revenue this month
    const thisMonthRevenue = await database.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: { in: ["COMPLETED", "COMPLETED"] },
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const thisMonth = Number(thisMonthRevenue._sum.total ?? 0);

    // Revenue last month
    const lastMonthRevenue = await database.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: { in: ["COMPLETED", "COMPLETED"] },
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth,
        },
      },
    });

    const lastMonth = Number(lastMonthRevenue._sum.total ?? 0);

    // Platform fees
    const platformFeesSum = await database.order.aggregate({
      _sum: {
        platformFee: true,
      },
      where: {
        status: { in: ["COMPLETED", "COMPLETED"] },
      },
    });

    const platformFees = Number(platformFeesSum._sum.platformFee ?? 0);

    // Average per order
    const orderCount = await database.order.count({
      where: {
        status: { in: ["COMPLETED", "COMPLETED"] },
      },
    });

    const averagePerOrder = orderCount > 0 ? total / orderCount : 0;

    // Growth rate
    const growthRate =
      lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 100;

    // Projected monthly (based on current month's pace)
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const daysPassed = now.getDate();
    const projectedMonthly =
      daysPassed > 0 ? (thisMonth / daysPassed) * daysInMonth : 0;

    return {
      total: Math.round(total * 100) / 100,
      thisMonth: Math.round(thisMonth * 100) / 100,
      lastMonth: Math.round(lastMonth * 100) / 100,
      growthRate: Math.round(growthRate * 100) / 100,
      averagePerOrder: Math.round(averagePerOrder * 100) / 100,
      platformFees: Math.round(platformFees * 100) / 100,
      projectedMonthly: Math.round(projectedMonthly * 100) / 100,
    };
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(
    metric: "revenue" | "orders" | "users",
    days: number = 30
  ): Promise<TimeSeriesData[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    if (metric === "revenue") {
      return this.getRevenueTimeSeries(startDate, endDate);
    } else if (metric === "orders") {
      return this.getOrdersTimeSeries(startDate, endDate);
    } else {
      return this.getUsersTimeSeries(startDate, endDate);
    }
  }

  /**
   * Revenue time series
   */
  private async getRevenueTimeSeries(
    startDate: Date,
    endDate: Date
  ): Promise<TimeSeriesData[]> {
    const orders = await database.order.findMany({
      where: {
        status: { in: ["COMPLETED", "COMPLETED"] },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const dataMap = new Map<string, number>();

    orders.forEach((order: any) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      if (!dateKey) return;
      const current = dataMap.get(dateKey) || 0;
      dataMap.set(dateKey, current + Number(order.total));
    });

    return Array.from(dataMap.entries())
      .map(([dateKey, value]) => ({
        label: dateKey,
        value: Math.round(value * 100) / 100,
        date: new Date(dateKey),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Orders time series
   */
  private async getOrdersTimeSeries(
    startDate: Date,
    endDate: Date
  ): Promise<TimeSeriesData[]> {
    const orders = await database.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const dataMap = new Map<string, number>();

    orders.forEach((order: any) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      if (!dateKey) return;
      const current = dataMap.get(dateKey) || 0;
      dataMap.set(dateKey, current + 1);
    });

    return Array.from(dataMap.entries())
      .map(([dateKey, value]) => ({
        label: dateKey,
        value,
        date: new Date(dateKey),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Users time series
   */
  private async getUsersTimeSeries(
    startDate: Date,
    endDate: Date
  ): Promise<TimeSeriesData[]> {
    const users = await database.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const dataMap = new Map<string, number>();

    users.forEach((user: any) => {
      const dateKey = user.createdAt.toISOString().split("T")[0];
      if (!dateKey) return;
      const current = dataMap.get(dateKey) || 0;
      dataMap.set(dateKey, current + 1);
    });

    return Array.from(dataMap.entries())
      .map(([dateKey, value]) => ({
        label: dateKey,
        value,
        date: new Date(dateKey),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get dashboard summary for quick overview
   */
  async getDashboardSummary() {
    const metrics = await this.getPlatformMetrics();

    return {
      summary: {
        totalRevenue: metrics.revenue.total,
        totalOrders: metrics.orders.total,
        totalUsers: metrics.users.total,
        totalFarms: metrics.farms.total,
        activeProducts: metrics.products.active,
      },
      growth: {
        revenueGrowth: metrics.revenue.growthRate,
        orderGrowth: metrics.orders.growthRate,
        userGrowth: metrics.users.growthRate,
      },
      health: {
        pendingOrders: metrics.orders.pending,
        pendingFarms: metrics.farms.pending,
        outOfStockProducts: metrics.products.outOfStock,
      },
    };
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const platformAnalyticsService = PlatformAnalyticsService.getInstance();
