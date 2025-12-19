/**
 * 🎯 USER SEGMENTATION SERVICE
 *
 * Divine user segmentation with agricultural consciousness.
 * RFM analysis, behavioral segmentation, and churn prediction.
 *
 * @module UserSegmentationService
 * @version 1.0.0
 * @phase Run 4 - Phase 4: Personalization & Recommendations
 */

import { database } from "@/lib/database";
import type { User } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface RFMScore {
  userId: string;
  recency: number; // Days since last purchase
  frequency: number; // Number of purchases
  monetary: number; // Total spent
  recencyScore: number; // 1-5
  frequencyScore: number; // 1-5
  monetaryScore: number; // 1-5
  rfmScore: string; // e.g., "555" for best customers
  segment: UserSegment;
}

type UserSegment =
  | "CHAMPIONS"
  | "LOYAL_CUSTOMERS"
  | "POTENTIAL_LOYALISTS"
  | "NEW_CUSTOMERS"
  | "PROMISING"
  | "NEED_ATTENTION"
  | "ABOUT_TO_SLEEP"
  | "AT_RISK"
  | "CANT_LOSE"
  | "HIBERNATING"
  | "LOST";

interface SegmentDefinition {
  name: UserSegment;
  description: string;
  recencyRange: [number, number];
  frequencyRange: [number, number];
  monetaryRange: [number, number];
  actionItems: string[];
}

interface BehavioralProfile {
  userId: string;
  segment: UserSegment;
  engagementScore: number; // 0-100
  churnRisk: number; // 0-1
  lifetimeValue: number;
  daysSinceFirstOrder: number;
  daysSinceLastOrder: number;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  favoriteCategories: string[];
  favoriteFarms: string[];
  preferences: {
    organic: number; // 0-1
    local: number; // 0-1
    biodynamic: number; // 0-1
  };
  lifecycle: LifecycleStage;
}

type LifecycleStage =
  | "PROSPECT"
  | "NEW"
  | "ACTIVE"
  | "ENGAGED"
  | "POWER_USER"
  | "DECLINING"
  | "AT_RISK"
  | "CHURNED";

interface ChurnPrediction {
  userId: string;
  churnProbability: number; // 0-1
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: ChurnFactor[];
  recommendations: string[];
}

interface ChurnFactor {
  factor: string;
  impact: number; // 0-1
  description: string;
}

interface CohortAnalysis {
  cohortMonth: string;
  totalUsers: number;
  activeUsers: Map<number, number>; // month -> active count
  retentionRate: Map<number, number>; // month -> retention %
  lifetimeValue: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class UserSegmentationService {
  private static instance: UserSegmentationService;

  private constructor() {}

  public static getInstance(): UserSegmentationService {
    if (!UserSegmentationService.instance) {
      UserSegmentationService.instance = new UserSegmentationService();
    }
    return UserSegmentationService.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RFM ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate RFM scores for all users
   */
  async calculateRFMScores(): Promise<RFMScore[]> {
    const users = await database.user.findMany({
      where: { role: "CONSUMER", status: "ACTIVE" },
      select: { id: true },
    });

    const rfmScores = await Promise.all(
      users.map((user) => this.calculateUserRFM(user.id)),
    );

    return rfmScores.filter((score): score is RFMScore => score !== null);
  }

  /**
   * Calculate RFM score for a specific user
   */
  async calculateUserRFM(userId: string): Promise<RFMScore | null> {
    // Get user's orders
    const orders = await database.order.findMany({
      where: {
        userId,
        status: { in: ["DELIVERED", "COMPLETED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (orders.length === 0) {
      return null; // User has no completed orders
    }

    // Calculate Recency (days since last order)
    const lastOrderDate = orders[0].createdAt;
    const recency = Math.floor(
      (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Calculate Frequency (number of orders)
    const frequency = orders.length;

    // Calculate Monetary (total spent)
    const monetary = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    // Calculate quintile scores (1-5)
    const recencyScore = this.getRecencyScore(recency);
    const frequencyScore = this.getFrequencyScore(frequency);
    const monetaryScore = this.getMonetaryScore(monetary);

    // Create RFM string
    const rfmScore = `${recencyScore}${frequencyScore}${monetaryScore}`;

    // Determine segment
    const segment = this.determineSegment(
      recencyScore,
      frequencyScore,
      monetaryScore,
    );

    return {
      userId,
      recency,
      frequency,
      monetary,
      recencyScore,
      frequencyScore,
      monetaryScore,
      rfmScore,
      segment,
    };
  }

  /**
   * Get recency score (1-5, 5 is best)
   */
  private getRecencyScore(recency: number): number {
    if (recency <= 7) return 5;
    if (recency <= 14) return 4;
    if (recency <= 30) return 3;
    if (recency <= 60) return 2;
    return 1;
  }

  /**
   * Get frequency score (1-5, 5 is best)
   */
  private getFrequencyScore(frequency: number): number {
    if (frequency >= 20) return 5;
    if (frequency >= 10) return 4;
    if (frequency >= 5) return 3;
    if (frequency >= 2) return 2;
    return 1;
  }

  /**
   * Get monetary score (1-5, 5 is best)
   */
  private getMonetaryScore(monetary: number): number {
    if (monetary >= 1000) return 5;
    if (monetary >= 500) return 4;
    if (monetary >= 200) return 3;
    if (monetary >= 50) return 2;
    return 1;
  }

  /**
   * Determine user segment based on RFM scores
   */
  private determineSegment(r: number, f: number, m: number): UserSegment {
    // Champions: High R, F, M
    if (r >= 4 && f >= 4 && m >= 4) return "CHAMPIONS";

    // Loyal Customers: High R, F
    if (r >= 3 && f >= 4) return "LOYAL_CUSTOMERS";

    // Potential Loyalists: High R, moderate F
    if (r >= 4 && f >= 2 && f <= 3) return "POTENTIAL_LOYALISTS";

    // New Customers: High R, low F
    if (r >= 4 && f === 1) return "NEW_CUSTOMERS";

    // Promising: Moderate R, F
    if (r >= 3 && f >= 2) return "PROMISING";

    // Need Attention: Moderate R, low F
    if (r === 3 && f === 1) return "NEED_ATTENTION";

    // About to Sleep: Low R, moderate F
    if (r === 2 && f >= 2) return "ABOUT_TO_SLEEP";

    // At Risk: Low R, high F (were good customers)
    if (r === 2 && f >= 4) return "AT_RISK";

    // Can't Lose: Very low R, high F, M
    if (r === 1 && f >= 4 && m >= 4) return "CANT_LOSE";

    // Hibernating: Very low R, moderate F
    if (r === 1 && f >= 2) return "HIBERNATING";

    // Lost: Very low R, low F
    return "LOST";
  }

  /**
   * Get segment definition with action items
   */
  getSegmentDefinition(segment: UserSegment): SegmentDefinition {
    const definitions: Record<UserSegment, SegmentDefinition> = {
      CHAMPIONS: {
        name: "CHAMPIONS",
        description: "Best customers who buy frequently and recently",
        recencyRange: [4, 5],
        frequencyRange: [4, 5],
        monetaryRange: [4, 5],
        actionItems: [
          "Reward with exclusive offers",
          "Make them brand ambassadors",
          "Ask for reviews and referrals",
          "Early access to new products",
        ],
      },
      LOYAL_CUSTOMERS: {
        name: "LOYAL_CUSTOMERS",
        description: "Regular customers with consistent purchases",
        recencyRange: [3, 5],
        frequencyRange: [4, 5],
        monetaryRange: [2, 5],
        actionItems: [
          "Upsell higher value products",
          "Loyalty program benefits",
          "Personalized recommendations",
          "Seasonal subscription offers",
        ],
      },
      POTENTIAL_LOYALISTS: {
        name: "POTENTIAL_LOYALISTS",
        description: "Recent customers showing promise",
        recencyRange: [4, 5],
        frequencyRange: [2, 3],
        monetaryRange: [2, 5],
        actionItems: [
          "Engage with educational content",
          "Offer membership programs",
          "Personalized product recommendations",
          "Cross-sell complementary products",
        ],
      },
      NEW_CUSTOMERS: {
        name: "NEW_CUSTOMERS",
        description: "First-time buyers - nurture them",
        recencyRange: [4, 5],
        frequencyRange: [1, 1],
        monetaryRange: [1, 5],
        actionItems: [
          "Welcome series",
          "Onboarding emails",
          "Second purchase incentive",
          "Farm stories and mission",
        ],
      },
      PROMISING: {
        name: "PROMISING",
        description: "Showing potential with moderate activity",
        recencyRange: [3, 4],
        frequencyRange: [2, 3],
        monetaryRange: [2, 4],
        actionItems: [
          "Special offers to increase frequency",
          "Product recommendations",
          "Seasonal bundles",
          "Category education",
        ],
      },
      NEED_ATTENTION: {
        name: "NEED_ATTENTION",
        description: "Recent but not engaged enough",
        recencyRange: [3, 3],
        frequencyRange: [1, 1],
        monetaryRange: [1, 3],
        actionItems: [
          "Limited time offers",
          "Reactivation campaign",
          "Survey for feedback",
          "Product variety showcase",
        ],
      },
      ABOUT_TO_SLEEP: {
        name: "ABOUT_TO_SLEEP",
        description: "Declining activity - act now",
        recencyRange: [2, 2],
        frequencyRange: [2, 3],
        monetaryRange: [2, 4],
        actionItems: [
          "Win-back campaign",
          "Personalized offers",
          "We miss you emails",
          "Survey to understand issues",
        ],
      },
      AT_RISK: {
        name: "AT_RISK",
        description: "Former good customers losing interest",
        recencyRange: [1, 2],
        frequencyRange: [4, 5],
        monetaryRange: [4, 5],
        actionItems: [
          "Aggressive win-back offers",
          "Personal outreach",
          "VIP treatment",
          "Address pain points",
        ],
      },
      CANT_LOSE: {
        name: "CANT_LOSE",
        description: "High-value customers at risk",
        recencyRange: [1, 1],
        frequencyRange: [4, 5],
        monetaryRange: [4, 5],
        actionItems: [
          "Immediate personal contact",
          "Major incentives",
          "VIP concierge service",
          "Understand and fix issues",
        ],
      },
      HIBERNATING: {
        name: "HIBERNATING",
        description: "Inactive but had some engagement",
        recencyRange: [1, 1],
        frequencyRange: [2, 3],
        monetaryRange: [1, 4],
        actionItems: [
          "Re-engagement campaign",
          "What's new updates",
          "Special comeback offers",
          "Low-cost entry products",
        ],
      },
      LOST: {
        name: "LOST",
        description: "Inactive with minimal engagement",
        recencyRange: [1, 1],
        frequencyRange: [1, 1],
        monetaryRange: [1, 2],
        actionItems: [
          "Last-ditch win-back",
          "Survey for closure",
          "Consider unsubscribe",
          "Seasonal reminders only",
        ],
      },
    };

    return definitions[segment];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BEHAVIORAL PROFILING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Build comprehensive behavioral profile for user
   */
  async buildBehavioralProfile(
    userId: string,
  ): Promise<BehavioralProfile | null> {
    // Get user orders
    const orders = await database.order.findMany({
      where: {
        userId,
        status: { in: ["DELIVERED", "COMPLETED"] },
      },
      include: {
        items: {
          include: {
            product: {
              include: { farm: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (orders.length === 0) return null;

    // Calculate basic metrics
    const firstOrderDate = orders[0].createdAt;
    const lastOrderDate = orders[orders.length - 1].createdAt;
    const daysSinceFirstOrder = Math.floor(
      (Date.now() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysSinceLastOrder = Math.floor(
      (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );
    const avgOrderValue = totalSpent / totalOrders;

    // Calculate category and farm preferences
    const categoryCount = new Map<string, number>();
    const farmCount = new Map<string, number>();
    let organicCount = 0;
    let localCount = 0;
    let biodynamicCount = 0;
    let totalProducts = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.product) return;

        totalProducts++;
        const category = item.product.category;
        const farmId = item.product.farmId;

        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
        farmCount.set(farmId, (farmCount.get(farmId) || 0) + 1);

        if (item.product.certifications?.includes("ORGANIC")) organicCount++;
        if (item.product.farm.isLocal) localCount++;
        if (item.product.certifications?.includes("BIODYNAMIC"))
          biodynamicCount++;
      });
    });

    const favoriteCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    const favoriteFarms = Array.from(farmCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    // Calculate preferences (0-1)
    const preferences = {
      organic: totalProducts > 0 ? organicCount / totalProducts : 0,
      local: totalProducts > 0 ? localCount / totalProducts : 0,
      biodynamic: totalProducts > 0 ? biodynamicCount / totalProducts : 0,
    };

    // Get RFM to determine segment
    const rfm = await this.calculateUserRFM(userId);
    const segment = rfm?.segment || "LOST";

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore({
      daysSinceLastOrder,
      totalOrders,
      avgOrderValue,
      daysSinceFirstOrder,
    });

    // Calculate churn risk
    const churnRisk = await this.calculateChurnRisk(userId);

    // Determine lifecycle stage
    const lifecycle = this.determineLifecycleStage(
      daysSinceFirstOrder,
      daysSinceLastOrder,
      totalOrders,
    );

    return {
      userId,
      segment,
      engagementScore,
      churnRisk,
      lifetimeValue: totalSpent,
      daysSinceFirstOrder,
      daysSinceLastOrder,
      totalOrders,
      totalSpent,
      avgOrderValue,
      favoriteCategories,
      favoriteFarms,
      preferences,
      lifecycle,
    };
  }

  /**
   * Calculate engagement score (0-100)
   */
  private calculateEngagementScore(metrics: {
    daysSinceLastOrder: number;
    totalOrders: number;
    avgOrderValue: number;
    daysSinceFirstOrder: number;
  }): number {
    let score = 0;

    // Recency component (0-40 points)
    if (metrics.daysSinceLastOrder <= 7) score += 40;
    else if (metrics.daysSinceLastOrder <= 14) score += 35;
    else if (metrics.daysSinceLastOrder <= 30) score += 25;
    else if (metrics.daysSinceLastOrder <= 60) score += 15;
    else if (metrics.daysSinceLastOrder <= 90) score += 5;

    // Frequency component (0-30 points)
    const orderFrequency =
      metrics.daysSinceFirstOrder > 0
        ? metrics.totalOrders / (metrics.daysSinceFirstOrder / 30)
        : 0;
    score += Math.min(orderFrequency * 10, 30);

    // Order value component (0-30 points)
    if (metrics.avgOrderValue >= 100) score += 30;
    else if (metrics.avgOrderValue >= 50) score += 20;
    else if (metrics.avgOrderValue >= 25) score += 10;
    else score += 5;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Determine lifecycle stage
   */
  private determineLifecycleStage(
    daysSinceFirst: number,
    daysSinceLast: number,
    totalOrders: number,
  ): LifecycleStage {
    // Churned: No order in 90+ days
    if (daysSinceLast >= 90) return "CHURNED";

    // At Risk: No order in 60-90 days
    if (daysSinceLast >= 60) return "AT_RISK";

    // New: Less than 30 days since first order
    if (daysSinceFirst <= 30) return "NEW";

    // Prospect: Only 1 order
    if (totalOrders === 1) return "PROSPECT";

    // Power User: 10+ orders and recent
    if (totalOrders >= 10 && daysSinceLast <= 14) return "POWER_USER";

    // Engaged: 5+ orders and recent
    if (totalOrders >= 5 && daysSinceLast <= 30) return "ENGAGED";

    // Active: Regular activity
    if (daysSinceLast <= 45) return "ACTIVE";

    // Declining: Activity dropping off
    return "DECLINING";
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHURN PREDICTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate churn risk for user
   */
  async calculateChurnRisk(userId: string): Promise<number> {
    const profile = await this.buildBehavioralProfile(userId);
    if (!profile) return 0;

    const factors: number[] = [];

    // Factor 1: Days since last order (0-1)
    const recencyRisk = Math.min(profile.daysSinceLastOrder / 90, 1);
    factors.push(recencyRisk * 0.4); // 40% weight

    // Factor 2: Order frequency trend (0-1)
    const expectedFrequency =
      profile.totalOrders / (profile.daysSinceFirstOrder / 30);
    const actualFrequency =
      profile.daysSinceLast > 0 ? 30 / profile.daysSinceLast : 0;
    const frequencyRisk = Math.max(
      0,
      (expectedFrequency - actualFrequency) / expectedFrequency,
    );
    factors.push(Math.min(frequencyRisk, 1) * 0.3); // 30% weight

    // Factor 3: Engagement score (0-1)
    const engagementRisk = 1 - profile.engagementScore / 100;
    factors.push(engagementRisk * 0.2); // 20% weight

    // Factor 4: Lifecycle stage (0-1)
    const lifecycleRisk = this.getLifecycleRisk(profile.lifecycle);
    factors.push(lifecycleRisk * 0.1); // 10% weight

    return factors.reduce((sum, factor) => sum + factor, 0);
  }

  /**
   * Get churn risk based on lifecycle stage
   */
  private getLifecycleRisk(lifecycle: LifecycleStage): number {
    const riskMap: Record<LifecycleStage, number> = {
      PROSPECT: 0.7,
      NEW: 0.5,
      ACTIVE: 0.2,
      ENGAGED: 0.1,
      POWER_USER: 0.05,
      DECLINING: 0.6,
      AT_RISK: 0.8,
      CHURNED: 1.0,
    };

    return riskMap[lifecycle];
  }

  /**
   * Generate churn prediction with detailed analysis
   */
  async predictChurn(userId: string): Promise<ChurnPrediction | null> {
    const profile = await this.buildBehavioralProfile(userId);
    if (!profile) return null;

    const churnProbability = profile.churnRisk;

    // Determine risk level
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    if (churnProbability < 0.3) riskLevel = "LOW";
    else if (churnProbability < 0.5) riskLevel = "MEDIUM";
    else if (churnProbability < 0.7) riskLevel = "HIGH";
    else riskLevel = "CRITICAL";

    // Identify churn factors
    const factors: ChurnFactor[] = [];

    if (profile.daysSinceLastOrder > 30) {
      factors.push({
        factor: "INACTIVITY",
        impact: Math.min(profile.daysSinceLastOrder / 90, 1),
        description: `No purchase in ${profile.daysSinceLastOrder} days`,
      });
    }

    if (profile.engagementScore < 50) {
      factors.push({
        factor: "LOW_ENGAGEMENT",
        impact: (100 - profile.engagementScore) / 100,
        description: `Engagement score is only ${profile.engagementScore}%`,
      });
    }

    if (profile.lifecycle === "DECLINING" || profile.lifecycle === "AT_RISK") {
      factors.push({
        factor: "LIFECYCLE_STAGE",
        impact: 0.7,
        description: `User is in ${profile.lifecycle} stage`,
      });
    }

    // Generate recommendations
    const recommendations = this.generateChurnRecommendations(
      riskLevel,
      factors,
      profile,
    );

    return {
      userId,
      churnProbability,
      riskLevel,
      factors,
      recommendations,
    };
  }

  /**
   * Generate recommendations to prevent churn
   */
  private generateChurnRecommendations(
    riskLevel: string,
    factors: ChurnFactor[],
    profile: BehavioralProfile,
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
      recommendations.push("Send immediate personalized win-back offer");
      recommendations.push("Personal outreach from customer success team");
      recommendations.push("Offer significant discount or free shipping");
    }

    if (factors.some((f) => f.factor === "INACTIVITY")) {
      recommendations.push("Send 'We miss you' campaign");
      recommendations.push("Highlight new products in favorite categories");
      recommendations.push("Offer limited-time comeback incentive");
    }

    if (factors.some((f) => f.factor === "LOW_ENGAGEMENT")) {
      recommendations.push("Re-engage with educational content");
      recommendations.push("Send personalized product recommendations");
      recommendations.push("Invite to special events or farm tours");
    }

    if (profile.favoriteCategories.length > 0) {
      recommendations.push(
        `Highlight products in favorite categories: ${profile.favoriteCategories.slice(0, 2).join(", ")}`,
      );
    }

    if (profile.preferences.organic > 0.7) {
      recommendations.push("Emphasize new organic arrivals");
    }

    if (profile.preferences.local > 0.7) {
      recommendations.push("Showcase local farm partnerships");
    }

    return recommendations;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COHORT ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Perform cohort analysis by signup month
   */
  async performCohortAnalysis(
    startDate: Date,
    endDate: Date,
  ): Promise<CohortAnalysis[]> {
    const cohorts: CohortAnalysis[] = [];

    // Get users grouped by signup month
    const users = await database.user.findMany({
      where: {
        role: "CONSUMER",
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { id: true, createdAt: true },
    });

    // Group by month
    const cohortGroups = new Map<string, string[]>();
    users.forEach((user) => {
      const cohortMonth = user.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!cohortGroups.has(cohortMonth)) {
        cohortGroups.set(cohortMonth, []);
      }
      cohortGroups.get(cohortMonth)!.push(user.id);
    });

    // Analyze each cohort
    for (const [cohortMonth, userIds] of cohortGroups.entries()) {
      const cohortStartDate = new Date(cohortMonth + "-01");

      // Track active users per month
      const activeUsers = new Map<number, number>();
      const retentionRate = new Map<number, number>();

      for (let month = 0; month <= 12; month++) {
        const monthStart = new Date(cohortStartDate);
        monthStart.setMonth(monthStart.getMonth() + month);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const activeCount = await database.order.count({
          where: {
            userId: { in: userIds },
            createdAt: { gte: monthStart, lt: monthEnd },
            status: { in: ["DELIVERED", "COMPLETED"] },
          },
        });

        activeUsers.set(month, activeCount);
        retentionRate.set(month, (activeCount / userIds.length) * 100);
      }

      // Calculate lifetime value
      const orders = await database.order.findMany({
        where: {
          userId: { in: userIds },
          status: { in: ["DELIVERED", "COMPLETED"] },
        },
        select: { total: true },
      });

      const lifetimeValue =
        orders.reduce((sum, order) => sum + Number(order.total), 0) /
        userIds.length;

      cohorts.push({
        cohortMonth,
        totalUsers: userIds.length,
        activeUsers,
        retentionRate,
        lifetimeValue,
      });
    }

    return cohorts;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUERY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get users by segment
   */
  async getUsersBySegment(segment: UserSegment): Promise<string[]> {
    const allRFM = await this.calculateRFMScores();
    return allRFM
      .filter((rfm) => rfm.segment === segment)
      .map((rfm) => rfm.userId);
  }

  /**
   * Get segment distribution
   */
  async getSegmentDistribution(): Promise<Record<UserSegment, number>> {
    const allRFM = await this.calculateRFMScores();

    const distribution: Record<UserSegment, number> = {
      CHAMPIONS: 0,
      LOYAL_CUSTOMERS: 0,
      POTENTIAL_LOYALISTS: 0,
      NEW_CUSTOMERS: 0,
      PROMISING: 0,
      NEED_ATTENTION: 0,
      ABOUT_TO_SLEEP: 0,
      AT_RISK: 0,
      CANT_LOSE: 0,
      HIBERNATING: 0,
      LOST: 0,
    };

    allRFM.forEach((rfm) => {
      distribution[rfm.segment]++;
    });

    return distribution;
  }

  /**
   * Get high-risk churn users
   */
  async getHighRiskUsers(threshold = 0.7): Promise<ChurnPrediction[]> {
    const users = await database.user.findMany({
      where: { role: "CONSUMER", status: "ACTIVE" },
      select: { id: true },
    });

    const predictions = await Promise.all(
      users.map((user) => this.predictChurn(user.id)),
    );

    return predictions
      .filter((p): p is ChurnPrediction => p !== null)
      .filter((p) => p.churnProbability >= threshold)
      .sort((a, b) => b.churnProbability - a.churnProbability);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const userSegmentationService = UserSegmentationService.getInstance();
