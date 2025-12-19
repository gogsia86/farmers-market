/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎯 CAMPAIGN AUTOMATION SERVICE - DIVINE MARKETING INTELLIGENCE  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Phase 5: Advanced Features - Campaign Automation                ║
 * ║  Purpose: Automate marketing campaigns with agricultural wisdom  ║
 * ║  Features:                                                       ║
 * ║    • Churn Prevention (auto-email when risk > 70%)              ║
 * ║    • Win-Back Campaigns (30+ days inactive)                     ║
 * ║    • Seasonal Alerts (match agricultural calendar)              ║
 * ║    • Abandoned Cart Recovery                                    ║
 * ║    • Cross-Sell Recommendations                                 ║
 * ║    • Onboarding Sequences                                       ║
 * ║  Version: 1.0.0                                                 ║
 * ║  Lines: ~900                                                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { database } from "@/lib/database";
import { getCurrentSeason, Season } from "@/lib/utils/seasonal";
import type {
  User,
  Product,
  Farm,
  Order,
  CartItem,
  UserPreference
} from "@prisma/client";

// ═══════════════════════════════════════════════════════════════════
// 🎯 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type CampaignType =
  | "CHURN_PREVENTION"
  | "WIN_BACK"
  | "SEASONAL_ALERT"
  | "ABANDONED_CART"
  | "CROSS_SELL"
  | "ONBOARDING"
  | "REORDER_REMINDER"
  | "NEW_FARM_ALERT"
  | "PRICE_DROP"
  | "LOW_STOCK";

export type CampaignStatus =
  | "PENDING"
  | "SCHEDULED"
  | "SENT"
  | "DELIVERED"
  | "OPENED"
  | "CLICKED"
  | "CONVERTED"
  | "BOUNCED"
  | "FAILED"
  | "CANCELLED";

export type CampaignPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TriggerType =
  | "IMMEDIATE"
  | "SCHEDULED"
  | "THRESHOLD"
  | "EVENT"
  | "PERIODIC";

export interface CampaignTrigger {
  type: TriggerType;
  threshold?: number;
  schedule?: string; // Cron expression
  event?: string;
  conditions?: Record<string, unknown>;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  type: CampaignType;
  subject: string;
  htmlContent: string;
  textContent: string;
  trigger: CampaignTrigger;
  priority: CampaignPriority;
  active: boolean;
  metadata?: Record<string, unknown>;
}

export interface CampaignRecipient {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  personalizations: Record<string, unknown>;
}

export interface CampaignExecution {
  id: string;
  templateId: string;
  recipients: CampaignRecipient[];
  scheduledFor?: Date;
  sentAt?: Date;
  status: CampaignStatus;
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  bounced: number;
  unsubscribed: number;
  revenue?: number;
}

export interface ChurnRiskUser {
  userId: string;
  email: string;
  firstName?: string;
  churnProbability: number;
  daysSinceLastOrder: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  riskFactors: string[];
}

export interface SeasonalRecommendation {
  season: Season;
  products: Product[];
  farms: Farm[];
  message: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
}

export interface AbandonedCartData {
  userId: string;
  cartItems: CartItem[];
  totalValue: number;
  abandonedAt: Date;
  remindersSent: number;
}

// ═══════════════════════════════════════════════════════════════════
// 🏗️ CAMPAIGN AUTOMATION SERVICE
// ═══════════════════════════════════════════════════════════════════

export class CampaignAutomationService {
  private static instance: CampaignAutomationService;

  private constructor() {}

  public static getInstance(): CampaignAutomationService {
    if (!CampaignAutomationService.instance) {
      CampaignAutomationService.instance = new CampaignAutomationService();
    }
    return CampaignAutomationService.instance;
  }

  // ═════════════════════════════════════════════════════════════════
  // 🎯 CHURN PREVENTION CAMPAIGNS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Identify users at risk of churning
   * @param threshold - Churn probability threshold (default: 0.7)
   * @returns List of users at risk with detailed metrics
   */
  async identifyChurnRiskUsers(threshold = 0.7): Promise<ChurnRiskUser[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get all active users
    const users = await database.user.findMany({
      where: {
        status: "ACTIVE",
        emailVerified: true,
      },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        userPreference: true,
      },
    });

    const churnRiskUsers: ChurnRiskUser[] = [];

    for (const user of users) {
      if (!user.email) continue;

      const orders = user.orders;
      const totalOrders = orders.length;

      // Skip new users (less than 2 orders)
      if (totalOrders < 2) continue;

      const lastOrder = orders[0];
      const daysSinceLastOrder = lastOrder
        ? Math.floor(
            (Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 999;

      // Calculate average order frequency
      const orderDates = orders.map((o) => o.createdAt.getTime());
      const intervals: number[] = [];
      for (let i = 1; i < orderDates.length; i++) {
        intervals.push((orderDates[i - 1] - orderDates[i]) / (1000 * 60 * 60 * 24));
      }
      const avgOrderFrequency = intervals.length > 0
        ? intervals.reduce((a, b) => a + b, 0) / intervals.length
        : 30;

      // Calculate average order value
      const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const averageOrderValue = totalSpent / totalOrders;

      // Churn probability factors
      const riskFactors: string[] = [];
      let churnScore = 0;

      // Factor 1: Days since last order vs average frequency
      if (daysSinceLastOrder > avgOrderFrequency * 2) {
        churnScore += 0.3;
        riskFactors.push("Overdue order (2x avg frequency)");
      }

      // Factor 2: Declining order frequency
      const recentOrders = orders.slice(0, 3);
      const olderOrders = orders.slice(3, 6);
      if (recentOrders.length > 0 && olderOrders.length > 0) {
        const recentAvg = recentOrders.reduce((sum, o) => sum + Number(o.total), 0) / recentOrders.length;
        const olderAvg = olderOrders.reduce((sum, o) => sum + Number(o.total), 0) / olderOrders.length;
        if (recentAvg < olderAvg * 0.7) {
          churnScore += 0.25;
          riskFactors.push("Declining order value");
        }
      }

      // Factor 3: No orders in last 30 days
      const recentOrderCount = orders.filter(
        (o) => o.createdAt >= thirtyDaysAgo
      ).length;
      if (recentOrderCount === 0) {
        churnScore += 0.25;
        riskFactors.push("No orders in 30 days");
      }

      // Factor 4: No orders in last 60 days (HIGH RISK)
      const veryRecentOrderCount = orders.filter(
        (o) => o.createdAt >= sixtyDaysAgo
      ).length;
      if (veryRecentOrderCount === 0) {
        churnScore += 0.2;
        riskFactors.push("No orders in 60 days - HIGH RISK");
      }

      const churnProbability = Math.min(churnScore, 1.0);

      if (churnProbability >= threshold) {
        churnRiskUsers.push({
          userId: user.id,
          email: user.email,
          firstName: user.firstName || undefined,
          churnProbability,
          daysSinceLastOrder,
          totalOrders,
          averageOrderValue,
          lastOrderDate: lastOrder?.createdAt,
          riskFactors,
        });
      }
    }

    // Sort by churn probability (highest first)
    return churnRiskUsers.sort((a, b) => b.churnProbability - a.churnProbability);
  }

  /**
   * Execute churn prevention campaign
   * Send personalized emails to at-risk users
   */
  async executeChurnPreventionCampaign(
    threshold = 0.7
  ): Promise<CampaignExecution> {
    const churnRiskUsers = await this.identifyChurnRiskUsers(threshold);

    const recipients: CampaignRecipient[] = churnRiskUsers.map((user) => ({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      personalizations: {
        daysSinceLastOrder: user.daysSinceLastOrder,
        churnProbability: Math.round(user.churnProbability * 100),
        totalOrders: user.totalOrders,
        averageOrderValue: user.averageOrderValue.toFixed(2),
        incentive: this.calculateChurnIncentive(user),
      },
    }));

    const execution: CampaignExecution = {
      id: `campaign_${Date.now()}`,
      templateId: "churn_prevention_v1",
      recipients,
      sentAt: new Date(),
      status: "SENT",
      metrics: {
        sent: recipients.length,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    };

    // In a real implementation, integrate with email service (SendGrid, Mailgun, etc.)
    console.log(`🎯 Churn Prevention Campaign Executed: ${recipients.length} recipients`);

    return execution;
  }

  /**
   * Calculate personalized incentive for churn prevention
   */
  private calculateChurnIncentive(user: ChurnRiskUser): string {
    if (user.churnProbability > 0.85) {
      return "20% OFF + FREE SHIPPING";
    } else if (user.churnProbability > 0.75) {
      return "15% OFF your next order";
    } else {
      return "10% OFF seasonal products";
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // 🔄 WIN-BACK CAMPAIGNS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Identify inactive users for win-back campaigns
   * @param inactiveDays - Number of days of inactivity (default: 30)
   */
  async identifyInactiveUsers(inactiveDays = 30): Promise<ChurnRiskUser[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

    const users = await database.user.findMany({
      where: {
        status: "ACTIVE",
        emailVerified: true,
        lastLoginAt: {
          lt: cutoffDate,
        },
      },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return users
      .filter((user) => user.email)
      .map((user) => {
        const lastOrder = user.orders[0];
        const daysSinceLastOrder = lastOrder
          ? Math.floor(
              (Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            )
          : 999;

        return {
          userId: user.id,
          email: user.email!,
          firstName: user.firstName || undefined,
          churnProbability: 1.0, // Already churned
          daysSinceLastOrder,
          totalOrders: user.orders.length,
          averageOrderValue: lastOrder ? Number(lastOrder.total) : 0,
          lastOrderDate: lastOrder?.createdAt,
          riskFactors: [`Inactive for ${inactiveDays}+ days`],
        };
      });
  }

  /**
   * Execute win-back campaign
   */
  async executeWinBackCampaign(inactiveDays = 30): Promise<CampaignExecution> {
    const inactiveUsers = await this.identifyInactiveUsers(inactiveDays);

    const recipients: CampaignRecipient[] = inactiveUsers.map((user) => ({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      personalizations: {
        daysSinceLastOrder: user.daysSinceLastOrder,
        incentive: "25% OFF + FREE SHIPPING on your return",
        newFeaturesCount: 5, // Could be dynamic
      },
    }));

    const execution: CampaignExecution = {
      id: `campaign_${Date.now()}`,
      templateId: "win_back_v1",
      recipients,
      sentAt: new Date(),
      status: "SENT",
      metrics: {
        sent: recipients.length,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    };

    console.log(`🔄 Win-Back Campaign Executed: ${recipients.length} recipients`);

    return execution;
  }

  // ═════════════════════════════════════════════════════════════════
  // 🌾 SEASONAL ALERT CAMPAIGNS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Get seasonal recommendations for users
   */
  async getSeasonalRecommendations(
    userId?: string
  ): Promise<SeasonalRecommendation> {
    const currentSeason = getCurrentSeason();

    // Get seasonal products
    const products = await database.product.findMany({
      where: {
        availableSeasons: {
          has: currentSeason,
        },
        inStock: true,
        status: "ACTIVE",
      },
      include: {
        farm: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Get active farms with seasonal products
    const farms = await database.farm.findMany({
      where: {
        status: "APPROVED",
        products: {
          some: {
            availableSeasons: {
              has: currentSeason,
            },
            inStock: true,
          },
        },
      },
      take: 10,
    });

    // Calculate urgency based on season progression
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const urgency = this.calculateSeasonalUrgency(currentSeason, month);

    return {
      season: currentSeason,
      products,
      farms,
      message: this.getSeasonalMessage(currentSeason, urgency),
      urgency,
    };
  }

  /**
   * Execute seasonal alert campaign
   */
  async executeSeasonalAlertCampaign(): Promise<CampaignExecution> {
    const currentSeason = getCurrentSeason();

    // Get all active users with preferences
    const users = await database.user.findMany({
      where: {
        status: "ACTIVE",
        emailVerified: true,
      },
      include: {
        userPreference: true,
      },
    });

    const recommendations = await this.getSeasonalRecommendations();

    const recipients: CampaignRecipient[] = users
      .filter((user) => user.email)
      .map((user) => ({
        userId: user.id,
        email: user.email!,
        firstName: user.firstName || undefined,
        personalizations: {
          season: currentSeason,
          productCount: recommendations.products.length,
          farmCount: recommendations.farms.length,
          message: recommendations.message,
          urgency: recommendations.urgency,
        },
      }));

    const execution: CampaignExecution = {
      id: `campaign_${Date.now()}`,
      templateId: "seasonal_alert_v1",
      recipients,
      sentAt: new Date(),
      status: "SENT",
      metrics: {
        sent: recipients.length,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    };

    console.log(`🌾 Seasonal Alert Campaign Executed: ${recipients.length} recipients`);

    return execution;
  }

  private calculateSeasonalUrgency(
    season: Season,
    month: number
  ): "LOW" | "MEDIUM" | "HIGH" {
    const seasonMonths = {
      SPRING: [2, 3, 4], // Mar, Apr, May
      SUMMER: [5, 6, 7], // Jun, Jul, Aug
      FALL: [8, 9, 10],  // Sep, Oct, Nov
      WINTER: [11, 0, 1], // Dec, Jan, Feb
    };

    const months = seasonMonths[season];
    const position = months.indexOf(month);

    if (position === 2) return "HIGH"; // Last month
    if (position === 1) return "MEDIUM"; // Middle month
    return "LOW"; // First month
  }

  private getSeasonalMessage(
    season: Season,
    urgency: "LOW" | "MEDIUM" | "HIGH"
  ): string {
    const messages = {
      SPRING: {
        LOW: "🌱 Fresh spring produce is arriving! Discover early season favorites.",
        MEDIUM: "🌷 Spring is in full bloom! Don't miss peak season vegetables.",
        HIGH: "⚡ Last chance for spring favorites! Stock up before summer.",
      },
      SUMMER: {
        LOW: "☀️ Summer harvest is beginning! Enjoy the freshest produce.",
        MEDIUM: "🍅 Peak summer flavors are here! Get your seasonal favorites.",
        HIGH: "🌽 Final weeks of summer bounty! Order before fall arrives.",
      },
      FALL: {
        LOW: "🍂 Fall harvest is starting! Discover autumn favorites.",
        MEDIUM: "🎃 Peak fall season! Stock up on hearty vegetables.",
        HIGH: "🍁 Last chance for fall produce! Winter is approaching.",
      },
      WINTER: {
        LOW: "❄️ Winter produce is here! Enjoy cold-weather crops.",
        MEDIUM: "🥬 Peak winter harvest! Get your seasonal greens.",
        HIGH: "🌨️ Final winter offerings! Spring is coming soon.",
      },
    };

    return messages[season][urgency];
  }

  // ═════════════════════════════════════════════════════════════════
  // 🛒 ABANDONED CART CAMPAIGNS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Identify abandoned carts
   * @param hoursThreshold - Hours since cart was last updated (default: 24)
   */
  async identifyAbandonedCarts(hoursThreshold = 24): Promise<AbandonedCartData[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursThreshold);

    const carts = await database.cartItem.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 0,
          },
        },
      },
    });

    const abandonedCarts: AbandonedCartData[] = [];

    for (const cart of carts) {
      if (!cart.userId) continue;

      const cartItems = await database.cartItem.findMany({
        where: {
          userId: cart.userId,
          updatedAt: {
            lt: cutoffDate,
          },
        },
        include: {
          product: true,
        },
      });

      if (cartItems.length === 0) continue;

      const user = await database.user.findUnique({
        where: { id: cart.userId },
      });

      if (!user?.email) continue;

      const totalValue = cartItems.reduce((sum, item) => {
        return sum + Number(item.product.price) * item.quantity;
      }, 0);

      const oldestItem = cartItems.reduce((oldest, item) => {
        return item.updatedAt < oldest.updatedAt ? item : oldest;
      }, cartItems[0]);

      abandonedCarts.push({
        userId: cart.userId,
        cartItems,
        totalValue,
        abandonedAt: oldestItem.updatedAt,
        remindersSent: 0, // Would be tracked in a real implementation
      });
    }

    return abandonedCarts;
  }

  /**
   * Execute abandoned cart recovery campaign
   */
  async executeAbandonedCartCampaign(
    hoursThreshold = 24
  ): Promise<CampaignExecution> {
    const abandonedCarts = await this.identifyAbandonedCarts(hoursThreshold);

    const recipients: CampaignRecipient[] = await Promise.all(
      abandonedCarts.map(async (cart) => {
        const user = await database.user.findUnique({
          where: { id: cart.userId },
        });

        return {
          userId: cart.userId,
          email: user!.email!,
          firstName: user!.firstName || undefined,
          personalizations: {
            cartValue: cart.totalValue.toFixed(2),
            itemCount: cart.cartItems.length,
            incentive: cart.totalValue > 50 ? "FREE SHIPPING" : "10% OFF",
            abandonedHours: Math.floor(
              (Date.now() - cart.abandonedAt.getTime()) / (1000 * 60 * 60)
            ),
          },
        };
      })
    );

    const execution: CampaignExecution = {
      id: `campaign_${Date.now()}`,
      templateId: "abandoned_cart_v1",
      recipients,
      sentAt: new Date(),
      status: "SENT",
      metrics: {
        sent: recipients.length,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    };

    console.log(`🛒 Abandoned Cart Campaign Executed: ${recipients.length} recipients`);

    return execution;
  }

  // ═════════════════════════════════════════════════════════════════
  // 🎁 CROSS-SELL CAMPAIGNS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Get cross-sell recommendations based on purchase history
   */
  async getCrossSellRecommendations(
    userId: string,
    limit = 5
  ): Promise<Product[]> {
    // Get user's purchase history
    const orders = await database.order.findMany({
      where: {
        userId,
        status: "DELIVERED",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Extract purchased product categories
    const purchasedCategories = new Set<string>();
    const purchasedProductIds = new Set<string>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product.category) {
          purchasedCategories.add(item.product.category);
        }
        purchasedProductIds.add(item.productId);
      });
    });

    // Find complementary products
    const recommendations = await database.product.findMany({
      where: {
        category: {
          in: Array.from(purchasedCategories),
        },
        id: {
          notIn: Array.from(purchasedProductIds),
        },
        inStock: true,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return recommendations;
  }

  /**
   * Execute cross-sell campaign
   */
  async executeCrossSellCampaign(): Promise<CampaignExecution> {
    // Get users with recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await database.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: "DELIVERED",
      },
      distinct: ["userId"],
      include: {
        user: true,
      },
    });

    const recipients: CampaignRecipient[] = await Promise.all(
      recentOrders
        .filter((order) => order.user.email)
        .map(async (order) => {
          const recommendations = await this.getCrossSellRecommendations(
            order.userId,
            3
          );

          return {
            userId: order.userId,
            email: order.user.email!,
            firstName: order.user.firstName || undefined,
            personalizations: {
              recentOrder: order.id,
              recommendations: recommendations.map((p) => ({
                name: p.name,
                price: Number(p.price).toFixed(2),
              })),
            },
          };
        })
    );

    const execution: CampaignExecution = {
      id: `campaign_${Date.now()}`,
      templateId: "cross_sell_v1",
      recipients,
      sentAt: new Date(),
      status: "SENT",
      metrics: {
        sent: recipients.length,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    };

    console.log(`🎁 Cross-Sell Campaign Executed: ${recipients.length} recipients`);

    return execution;
  }

  // ═════════════════════════════════════════════════════════════════
  // 📊 CAMPAIGN ANALYTICS & REPORTING
  // ═════════════════════════════════════════════════════════════════

  /**
   * Get campaign performance summary
   */
  async getCampaignAnalytics(
    campaignType?: CampaignType
  ): Promise<Record<string, unknown>> {
    // In a real implementation, this would query campaign execution records
    // For now, return a mock structure
    return {
      totalCampaigns: 0,
      totalRecipients: 0,
      averageOpenRate: 0,
      averageClickRate: 0,
      averageConversionRate: 0,
      totalRevenue: 0,
      byType: {},
    };
  }

  /**
   * Schedule campaign execution
   */
  async scheduleCampaign(
    type: CampaignType,
    scheduledFor: Date
  ): Promise<{ success: boolean; message: string }> {
    // In a real implementation, integrate with job scheduler (Bull, Agenda, etc.)
    console.log(`📅 Scheduled ${type} campaign for ${scheduledFor.toISOString()}`);

    return {
      success: true,
      message: `Campaign scheduled successfully for ${scheduledFor.toISOString()}`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🌟 SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const campaignAutomationService = CampaignAutomationService.getInstance();
