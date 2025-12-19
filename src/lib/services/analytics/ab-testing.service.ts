/**
 * 🎯 A/B TESTING SERVICE
 *
 * Divine A/B testing framework with agricultural consciousness.
 * Experiment management, variant assignment, and statistical analysis.
 *
 * @module ABTestingService
 * @version 1.0.0
 * @phase Run 4 - Phase 4: Personalization & Recommendations
 */

import { database } from "@/lib/database";
import type { ABTest, ABTestStatus } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface CreateTestRequest {
  name: string;
  description?: string;
  variants: TestVariant[];
  trafficSplit: Record<string, number>; // variant -> percentage
  targetAudience?: AudienceFilter;
  startDate?: Date;
  endDate?: Date;
}

interface TestVariant {
  id: string;
  name: string;
  config: Record<string, any>;
}

interface AudienceFilter {
  userSegments?: string[];
  minOrders?: number;
  maxOrders?: number;
  categories?: string[];
  location?: { lat: number; lng: number; radius: number };
}

interface AssignmentRequest {
  testId: string;
  userId: string;
  context?: Record<string, any>;
}

interface TrackEventRequest {
  testId: string;
  userId: string;
  variantId: string;
  event: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface TestResults {
  testId: string;
  status: ABTestStatus;
  startedAt?: Date;
  endedAt?: Date;
  variants: VariantResults[];
  winner?: string;
  confidence: number;
  recommendation: string;
}

interface VariantResults {
  variantId: string;
  name: string;
  assignments: number;
  conversions: number;
  conversionRate: number;
  averageValue: number;
  totalValue: number;
  improvement?: number; // vs control
  pValue?: number;
  isSignificant: boolean;
}

interface StatisticalTest {
  pValue: number;
  zScore: number;
  isSignificant: boolean;
  confidenceLevel: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class ABTestingService {
  private static instance: ABTestingService;
  private readonly SIGNIFICANCE_LEVEL = 0.05; // 95% confidence
  private readonly MIN_SAMPLE_SIZE = 100;

  private constructor() {}

  public static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a new A/B test
   */
  async createTest(request: CreateTestRequest): Promise<ABTest> {
    // Validate traffic split
    const totalSplit = Object.values(request.trafficSplit).reduce(
      (sum, val) => sum + val,
      0,
    );

    if (Math.abs(totalSplit - 100) > 0.01) {
      throw new Error(`Traffic split must equal 100%, got ${totalSplit}%`);
    }

    // Validate variants match traffic split
    const variantIds = request.variants.map((v) => v.id);
    const splitKeys = Object.keys(request.trafficSplit);

    if (!variantIds.every((id) => splitKeys.includes(id))) {
      throw new Error("All variants must have traffic split defined");
    }

    // Create test
    const test = await database.aBTest.create({
      data: {
        name: request.name,
        description: request.description,
        variants: request.variants,
        trafficSplit: request.trafficSplit,
        targetAudience: request.targetAudience,
        status: "DRAFT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return test;
  }

  /**
   * Start a test
   */
  async startTest(testId: string): Promise<ABTest> {
    const test = await database.aBTest.findUnique({
      where: { id: testId },
    });

    if (!test) {
      throw new Error("Test not found");
    }

    if (test.status !== "DRAFT") {
      throw new Error(`Test is already ${test.status}`);
    }

    return await database.aBTest.update({
      where: { id: testId },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Stop a test
   */
  async stopTest(testId: string, reason?: string): Promise<ABTest> {
    return await database.aBTest.update({
      where: { id: testId },
      data: {
        status: "STOPPED",
        endedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Complete a test and declare winner
   */
  async completeTest(testId: string): Promise<ABTest> {
    const results = await this.analyzeTest(testId);

    return await database.aBTest.update({
      where: { id: testId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        results: results as any,
        winnerVariant: results.winner,
        updatedAt: new Date(),
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VARIANT ASSIGNMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Assign user to a test variant
   */
  async assignVariant(request: AssignmentRequest): Promise<string> {
    const { testId, userId, context } = request;

    // Check if test exists and is running
    const test = await database.aBTest.findUnique({
      where: { id: testId },
    });

    if (!test || test.status !== "RUNNING") {
      throw new Error("Test is not running");
    }

    // Check if user already assigned
    const existing = await database.aBTestAssignment.findUnique({
      where: {
        testId_userId: { testId, userId },
      },
    });

    if (existing) {
      return existing.variantId;
    }

    // Check if user matches target audience
    if (test.targetAudience) {
      const matches = await this.matchesAudience(
        userId,
        test.targetAudience as any,
      );
      if (!matches) {
        throw new Error("User does not match target audience");
      }
    }

    // Assign variant based on traffic split
    const variantId = this.selectVariant(
      test.trafficSplit as Record<string, number>,
      userId,
    );

    // Save assignment
    await database.aBTestAssignment.create({
      data: {
        testId,
        userId,
        variantId,
        assignedAt: new Date(),
      },
    });

    return variantId;
  }

  /**
   * Select variant based on traffic split
   */
  private selectVariant(
    trafficSplit: Record<string, number>,
    userId: string,
  ): string {
    // Use deterministic hash for consistent assignment
    const hash = this.hashUserId(userId);
    const random = (hash % 10000) / 100; // 0-100

    let cumulative = 0;
    for (const [variantId, percentage] of Object.entries(trafficSplit)) {
      cumulative += percentage;
      if (random < cumulative) {
        return variantId;
      }
    }

    // Fallback to first variant
    return Object.keys(trafficSplit)[0];
  }

  /**
   * Simple hash function for consistent variant assignment
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Check if user matches target audience
   */
  private async matchesAudience(
    userId: string,
    audience: AudienceFilter,
  ): Promise<boolean> {
    // Check order count
    if (audience.minOrders || audience.maxOrders) {
      const orderCount = await database.order.count({
        where: {
          userId,
          status: { in: ["DELIVERED", "COMPLETED"] },
        },
      });

      if (audience.minOrders && orderCount < audience.minOrders) {
        return false;
      }

      if (audience.maxOrders && orderCount > audience.maxOrders) {
        return false;
      }
    }

    // Add more audience filters as needed

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT TRACKING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Track a test event (conversion, click, etc.)
   */
  async trackEvent(request: TrackEventRequest): Promise<void> {
    const { testId, userId, variantId, event, value, metadata } = request;

    // Verify assignment exists
    const assignment = await database.aBTestAssignment.findUnique({
      where: {
        testId_userId: { testId, userId },
      },
    });

    if (!assignment || assignment.variantId !== variantId) {
      throw new Error("Invalid assignment");
    }

    // Record event
    await database.aBTestEvent.create({
      data: {
        testId,
        userId,
        variantId,
        event,
        value: value || 0,
        metadata: metadata as any,
        timestamp: new Date(),
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYSIS & STATISTICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Analyze test results
   */
  async analyzeTest(testId: string): Promise<TestResults> {
    const test = await database.aBTest.findUnique({
      where: { id: testId },
    });

    if (!test) {
      throw new Error("Test not found");
    }

    const variants = test.variants as TestVariant[];
    const variantResults: VariantResults[] = [];

    // Analyze each variant
    for (const variant of variants) {
      const assignments = await database.aBTestAssignment.count({
        where: { testId, variantId: variant.id },
      });

      const conversions = await database.aBTestEvent.count({
        where: {
          testId,
          variantId: variant.id,
          event: "CONVERSION",
        },
      });

      const events = await database.aBTestEvent.findMany({
        where: {
          testId,
          variantId: variant.id,
          event: "CONVERSION",
        },
        select: { value: true },
      });

      const totalValue = events.reduce((sum, e) => sum + Number(e.value), 0);
      const averageValue = conversions > 0 ? totalValue / conversions : 0;
      const conversionRate = assignments > 0 ? conversions / assignments : 0;

      variantResults.push({
        variantId: variant.id,
        name: variant.name,
        assignments,
        conversions,
        conversionRate,
        averageValue,
        totalValue,
        isSignificant: false, // Will be calculated below
      });
    }

    // Sort by conversion rate
    variantResults.sort((a, b) => b.conversionRate - a.conversionRate);

    // Calculate statistical significance vs control (first variant)
    const control = variantResults[0];
    let winnerVariant: string | undefined;
    let maxConfidence = 0;

    for (let i = 1; i < variantResults.length; i++) {
      const variant = variantResults[i];

      // Check minimum sample size
      if (
        control.assignments < this.MIN_SAMPLE_SIZE ||
        variant.assignments < this.MIN_SAMPLE_SIZE
      ) {
        variant.isSignificant = false;
        continue;
      }

      // Perform two-proportion z-test
      const statTest = this.twoProportionZTest(
        control.conversions,
        control.assignments,
        variant.conversions,
        variant.assignments,
      );

      variant.pValue = statTest.pValue;
      variant.isSignificant = statTest.isSignificant;
      variant.improvement =
        ((variant.conversionRate - control.conversionRate) /
          control.conversionRate) *
        100;

      // Track best performing significant variant
      if (
        statTest.isSignificant &&
        variant.conversionRate > control.conversionRate &&
        statTest.confidenceLevel > maxConfidence
      ) {
        winnerVariant = variant.variantId;
        maxConfidence = statTest.confidenceLevel;
      }
    }

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      variantResults,
      winnerVariant,
      maxConfidence,
    );

    return {
      testId,
      status: test.status,
      startedAt: test.startedAt || undefined,
      endedAt: test.endedAt || undefined,
      variants: variantResults,
      winner: winnerVariant,
      confidence: maxConfidence,
      recommendation,
    };
  }

  /**
   * Perform two-proportion z-test
   */
  private twoProportionZTest(
    conversions1: number,
    total1: number,
    conversions2: number,
    total2: number,
  ): StatisticalTest {
    const p1 = conversions1 / total1;
    const p2 = conversions2 / total2;

    // Pooled proportion
    const pPool = (conversions1 + conversions2) / (total1 + total2);

    // Standard error
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / total1 + 1 / total2));

    // Z-score
    const zScore = Math.abs((p1 - p2) / se);

    // P-value (two-tailed)
    const pValue = 2 * (1 - this.normalCDF(zScore));

    // Is significant at 95% confidence level
    const isSignificant = pValue < this.SIGNIFICANCE_LEVEL;

    // Confidence level
    const confidenceLevel = (1 - pValue) * 100;

    return {
      pValue,
      zScore,
      isSignificant,
      confidenceLevel,
    };
  }

  /**
   * Normal cumulative distribution function
   */
  private normalCDF(z: number): number {
    // Using error function approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const probability =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    return z > 0 ? 1 - probability : probability;
  }

  /**
   * Generate recommendation based on results
   */
  private generateRecommendation(
    results: VariantResults[],
    winner: string | undefined,
    confidence: number,
  ): string {
    if (!winner) {
      // Check if we have enough data
      const minSample = Math.min(...results.map((r) => r.assignments));

      if (minSample < this.MIN_SAMPLE_SIZE) {
        return `Continue test - need minimum ${this.MIN_SAMPLE_SIZE} samples per variant (currently ${minSample})`;
      }

      return "No significant winner detected. Consider running test longer or increasing sample size.";
    }

    const winnerResult = results.find((r) => r.variantId === winner);
    if (!winnerResult) return "Error analyzing results";

    return (
      `Winner: ${winnerResult.name} with ${confidence.toFixed(1)}% confidence. ` +
      `${winnerResult.improvement?.toFixed(1)}% improvement over control. ` +
      `Recommend implementing this variant.`
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUERY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get user's variant for a test
   */
  async getUserVariant(testId: string, userId: string): Promise<string | null> {
    const assignment = await database.aBTestAssignment.findUnique({
      where: {
        testId_userId: { testId, userId },
      },
    });

    return assignment?.variantId || null;
  }

  /**
   * Get all running tests
   */
  async getRunningTests(): Promise<ABTest[]> {
    return await database.aBTest.findMany({
      where: { status: "RUNNING" },
      orderBy: { startedAt: "desc" },
    });
  }

  /**
   * Get test by ID
   */
  async getTest(testId: string): Promise<ABTest | null> {
    return await database.aBTest.findUnique({
      where: { id: testId },
    });
  }

  /**
   * List all tests
   */
  async listTests(status?: ABTestStatus, limit = 50): Promise<ABTest[]> {
    return await database.aBTest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get test summary statistics
   */
  async getTestSummary(testId: string) {
    const test = await database.aBTest.findUnique({
      where: { id: testId },
    });

    if (!test) {
      throw new Error("Test not found");
    }

    const totalAssignments = await database.aBTestAssignment.count({
      where: { testId },
    });

    const totalEvents = await database.aBTestEvent.count({
      where: { testId },
    });

    const variants = test.variants as TestVariant[];
    const variantStats = await Promise.all(
      variants.map(async (variant) => {
        const assignments = await database.aBTestAssignment.count({
          where: { testId, variantId: variant.id },
        });

        const events = await database.aBTestEvent.count({
          where: { testId, variantId: variant.id },
        });

        return {
          variantId: variant.id,
          name: variant.name,
          assignments,
          events,
        };
      }),
    );

    return {
      testId,
      name: test.name,
      status: test.status,
      totalAssignments,
      totalEvents,
      variants: variantStats,
      startedAt: test.startedAt,
      endedAt: test.endedAt,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Clean up old test data
   */
  async cleanupOldTests(daysOld = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await database.aBTest.deleteMany({
      where: {
        status: { in: ["COMPLETED", "STOPPED"] },
        endedAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const abTestingService = ABTestingService.getInstance();
