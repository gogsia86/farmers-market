import { auth } from "@/lib/auth/config";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * 📊 FARMER DASHBOARD API
 * GET /api/farmers/dashboard
 * Returns comprehensive dashboard data for authenticated farmer
 */

export async function GET(_request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's farm
    const farm = await database.farm.findFirst({
      where: { ownerId: userId },
      include: {
        products: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    // Calculate date ranges
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get orders statistics
    const [
      _totalOrders,
      pendingOrders,
      _confirmedOrders,
      _completedOrders,
      weekOrders,
      monthOrders,
    ] = await Promise.all([
      database.order.count({
        where: {
          items: {
            some: {
              product: {
                farmId: farm.id,
              },
            },
          },
        },
      }),
      database.order.count({
        where: {
          status: "PENDING",
          items: {
            some: {
              product: {
                farmId: farm.id,
              },
            },
          },
        },
      }),
      database.order.count({
        where: {
          status: "CONFIRMED",
          items: {
            some: {
              product: {
                farmId: farm.id,
              },
            },
          },
        },
      }),
      database.order.count({
        where: {
          status: "COMPLETED",
          items: {
            some: {
              product: {
                farmId: farm.id,
              },
            },
          },
        },
      }),
      database.order.findMany({
        where: {
          createdAt: { gte: startOfWeek },
          items: {
            some: {
              product: {
                farmId: farm.id,
              },
            },
          },
        },
        include: {
          items: {
            where: {
              product: {
                farmId: farm.id,
              },
            },
            include: {
              product: true,
            },
          },
        },
      }),
      database.order.findMany({
        where: {
          createdAt: { gte: startOfMonth },
          items: {
            some: {
              product: {
                farmId: farm.id,
              },
            },
          },
        },
        include: {
          items: {
            where: {
              product: {
                farmId: farm.id,
              },
            },
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    // Calculate revenue
    const calculateRevenue = (orders: any[]) => {
      return orders.reduce((total, order) => {
        const orderTotal = order.items.reduce((sum: number, item: any) => {
          return sum + Number(item.product.price) * item.quantity;
        }, 0);
        return total + orderTotal;
      }, 0);
    };

    const weekRevenue = calculateRevenue(weekOrders);
    const monthRevenue = calculateRevenue(monthOrders);

    // Get recent orders
    const recentOrders = await database.order.findMany({
      where: {
        items: {
          some: {
            product: {
              farmId: farm.id,
            },
          },
        },
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          where: {
            product: {
              farmId: farm.id,
            },
          },
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    // Get unique customers
    const uniqueCustomers = await database.user.findMany({
      where: {
        orders: {
          some: {
            items: {
              some: {
                product: {
                  farmId: farm.id,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    // Low stock alerts
    const lowStockProducts = farm.products.filter(
      (p) => p.quantityAvailable !== null && Number(p.quantityAvailable) < 5,
    );

    // Format response
    return NextResponse.json({
      success: true,
      data: {
        farm: {
          id: farm.id,
          name: farm.name,
          status: farm.status,
        },
        stats: {
          totalRevenue: monthRevenue,
          revenueChange: 12.5, // TODO: Calculate actual change
          pendingOrders: pendingOrders,
          ordersChange: 8.3, // TODO: Calculate actual change
          activeProducts: farm.products.length,
          totalCustomers: uniqueCustomers.length,
        },
        weeklyStats: {
          revenue: weekRevenue,
          orders: weekOrders.length,
          newCustomers: 12, // TODO: Calculate actual new customers
        },
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customer:
            `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim() ||
            order.customer.email,
          customerEmail: order.customer.email,
          items: order.items.length,
          total: order.items.reduce(
            (sum, item) =>
              sum + Number(item.product.price) * Number(item.quantity),
            0,
          ),
          status: order.status,
          scheduledDate: order.scheduledDate,
          createdAt: order.createdAt,
        })),
        alerts: [
          ...(lowStockProducts.length > 0
            ? [
                {
                  type: "LOW_STOCK",
                  severity: "warning",
                  message: `${lowStockProducts.length} products are running low on inventory`,
                  products: lowStockProducts.map((p) => ({
                    id: p.id,
                    name: p.name,
                    stock: p.quantityAvailable,
                  })),
                },
              ]
            : []),
          {
            type: "PAYMENT_SCHEDULED",
            severity: "info",
            message: "Next payout: Nov 15, 2025 ($850.00)",
            date: "2025-11-15",
            amount: 850.0,
          },
        ],
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
