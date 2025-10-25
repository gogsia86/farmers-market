/**
 * PRODUCT PERFORMANCE ANALYTICS API
 * Individual product insights and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');
    const limit = Number.parseInt(searchParams.get('limit') || '10');

    // Get user's farms
    const userFarms = await database.farm.findMany({
      where: session.user.role === 'ADMIN' ? {} : { ownerId: session.user.id },
      select: { id: true },
    });

    if (userFarms.length === 0) {
      return NextResponse.json({
        error: 'No farms found',
      }, { status: 403 });
    }

    const farmIds = farmId ? [farmId] : userFarms.map(f => f.id);

    // Get products with sales data
    const products = await database.product.findMany({
      where: { farmId: { in: farmIds } },
      include: {
        reviews: true,
        orderItems: {
          include: {
            order: {
              select: {
                createdAt: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Calculate performance metrics for each product
    const performance = products.map(product => {
      const completedSales = product.orderItems.filter(
        item => item.order.status === 'DELIVERED'
      );

      const totalSold = completedSales.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const revenue = completedSales.reduce(
        (sum, item) => sum + Number.parseFloat(item.price.toString()) * item.quantity,
        0
      );

      const averageRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      // Calculate trend (last 7 days vs previous 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const recentSales = completedSales.filter(
        item => item.order.createdAt >= sevenDaysAgo
      );
      const previousSales = completedSales.filter(
        item =>
          item.order.createdAt >= fourteenDaysAgo &&
          item.order.createdAt < sevenDaysAgo
      );

      const recentTotal = recentSales.reduce((sum, item) => sum + item.quantity, 0);
      const previousTotal = previousSales.reduce((sum, item) => sum + item.quantity, 0);

      const trendPercentage =
        previousTotal > 0
          ? ((recentTotal - previousTotal) / previousTotal) * 100
          : 0;

      const salesTrend =
        trendPercentage > 10 ? 'up' : trendPercentage < -10 ? 'down' : 'stable';

      return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        totalSold,
        revenue,
        averagePrice:
          totalSold > 0 ? revenue / totalSold : Number.parseFloat(product.price.toString()),
        averageRating,
        totalReviews: product.reviews.length,
        currentStock: product.quantity || 0,
        stockStatus: !product.inStock
          ? 'OUT_OF_STOCK'
          : (product.quantity || 0) < 10
          ? 'LOW_STOCK'
          : 'IN_STOCK',
        salesTrend,
        trendPercentage,
      };
    });

    // Sort by revenue and limit
    const topPerformers = performance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return NextResponse.json({
      products: topPerformers,
      summary: {
        totalProducts: products.length,
        totalRevenue: performance.reduce((sum, p) => sum + p.revenue, 0),
        averageRating:
          performance.length > 0
            ? performance.reduce((sum, p) => sum + p.averageRating, 0) /
              performance.length
            : 0,
        topCategory: getMostCommonCategory(performance),
      },
    });
  } catch (error) {
    console.error('Product performance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product performance' },
      { status: 500 }
    );
  }
}

function getMostCommonCategory(
  products: Array<{ category: string }>
): string {
  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.category, (counts.get(product.category) || 0) + 1);
  }

  let maxCategory = '';
  let maxCount = 0;
  for (const [category, count] of counts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      maxCategory = category;
    }
  }

  return maxCategory;
}
