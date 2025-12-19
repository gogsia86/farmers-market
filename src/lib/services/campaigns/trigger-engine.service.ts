// @ts-nocheck
/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ⚡ CAMPAIGN TRIGGER ENGINE - AUTOMATED CAMPAIGN EXECUTION       ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Phase 5: Advanced Features - Campaign Automation                ║
 * ║  Purpose: Automatically trigger campaigns based on events        ║
 * ║  Features:                                                       ║
 * ║    • Real-time Event Monitoring                                 ║
 * ║    • Threshold-based Triggers                                   ║
 * ║    • Scheduled Campaign Execution                               ║
 * ║    • Event-driven Campaign Activation                           ║
 * ║    • Smart Debouncing & Rate Limiting                           ║
 * ║  Version: 1.0.0                                                 ║
 * ║  Lines: ~700                                                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { database } from "@/lib/database";
import { campaignAutomationService } from "./campaign-automation.service";
import type {
  CampaignType,
  CampaignExecution,
} from "./campaign-automation.service";

// ═══════════════════════════════════════════════════════════════════
// 🎯 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type TriggerEventType =
  | "USER_INACTIVE"
  | "CART_ABANDONED"
  | "ORDER_DELIVERED"
  | "SEASON_CHANGED"
  | "CHURN_RISK_HIGH"
  | "PRODUCT_VIEWED"
  | "SEARCH_PERFORMED"
  | "PRICE_DROP"
  | "LOW_STOCK"
  | "NEW_FARM_JOINED";

export interface TriggerEvent {
  type: TriggerEventType;
  userId?: string;
  productId?: string;
  farmId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface TriggerRule {
  id: string;
  name: string;
  campaignType: CampaignType;
  eventType: TriggerEventType;
  conditions: TriggerCondition[];
  cooldownMinutes: number; // Minimum time between triggers for same user
  active: boolean;
  priority: number; // Higher = executed first
}

export interface TriggerCondition {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin";
  value: unknown;
}

export interface TriggerExecution {
  ruleId: string;
  eventId: string;
  userId?: string;
  executedAt: Date;
  campaignId?: string;
  success: boolean;
  error?: string;
}

export interface TriggerStats {
  totalTriggers: number;
  successfulTriggers: number;
  failedTriggers: number;
  averageExecutionTime: number;
  triggersByType: Record<TriggerEventType, number>;
  lastTrigger?: Date;
}

// ═══════════════════════════════════════════════════════════════════
// 🏗️ TRIGGER ENGINE SERVICE
// ═══════════════════════════════════════════════════════════════════

export class TriggerEngineService {
  private static instance: TriggerEngineService;
  private eventQueue: TriggerEvent[] = [];
  private isProcessing = false;
  private triggerRules: TriggerRule[] = [];
  private executionHistory = new Map<string, Date>();

  private constructor() {
    this.initializeTriggerRules();
  }

  public static getInstance(): TriggerEngineService {
    if (!TriggerEngineService.instance) {
      TriggerEngineService.instance = new TriggerEngineService();
    }
    return TriggerEngineService.instance;
  }

  // ═════════════════════════════════════════════════════════════════
  // 🎯 TRIGGER RULE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════

  /**
   * Initialize default trigger rules
   */
  private initializeTriggerRules(): void {
    this.triggerRules = [
      // Churn Prevention Trigger
      {
        id: "churn_prevention_auto",
        name: "Automatic Churn Prevention",
        campaignType: "CHURN_PREVENTION",
        eventType: "CHURN_RISK_HIGH",
        conditions: [
          { field: "churnProbability", operator: "gte", value: 0.7 },
        ],
        cooldownMinutes: 10080, // 7 days
        active: true,
        priority: 100,
      },

      // Abandoned Cart Trigger
      {
        id: "abandoned_cart_24h",
        name: "24-Hour Abandoned Cart",
        campaignType: "ABANDONED_CART",
        eventType: "CART_ABANDONED",
        conditions: [{ field: "hoursAbandoned", operator: "gte", value: 24 }],
        cooldownMinutes: 4320, // 3 days
        active: true,
        priority: 90,
      },

      // Win-Back Trigger
      {
        id: "win_back_30d",
        name: "30-Day Inactive Win-Back",
        campaignType: "WIN_BACK",
        eventType: "USER_INACTIVE",
        conditions: [{ field: "daysInactive", operator: "gte", value: 30 }],
        cooldownMinutes: 20160, // 14 days
        active: true,
        priority: 80,
      },

      // Seasonal Alert Trigger
      {
        id: "seasonal_alert",
        name: "Seasonal Product Alert",
        campaignType: "SEASONAL_ALERT",
        eventType: "SEASON_CHANGED",
        conditions: [],
        cooldownMinutes: 43200, // 30 days
        active: true,
        priority: 70,
      },

      // Cross-Sell Trigger
      {
        id: "cross_sell_post_delivery",
        name: "Cross-Sell After Delivery",
        campaignType: "CROSS_SELL",
        eventType: "ORDER_DELIVERED",
        conditions: [{ field: "orderValue", operator: "gte", value: 50 }],
        cooldownMinutes: 10080, // 7 days
        active: true,
        priority: 60,
      },

      // Reorder Reminder Trigger
      {
        id: "reorder_reminder_weekly",
        name: "Weekly Reorder Reminder",
        campaignType: "REORDER_REMINDER",
        eventType: "ORDER_DELIVERED",
        conditions: [{ field: "daysSinceOrder", operator: "eq", value: 7 }],
        cooldownMinutes: 10080, // 7 days
        active: true,
        priority: 50,
      },
    ];
  }

  /**
   * Add a new trigger rule
   */
  addTriggerRule(rule: TriggerRule): void {
    this.triggerRules.push(rule);
    this.triggerRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Update existing trigger rule
   */
  updateTriggerRule(ruleId: string, updates: Partial<TriggerRule>): boolean {
    const index = this.triggerRules.findIndex((r) => r.id === ruleId);
    if (index === -1) return false;

    this.triggerRules[index] = { ...this.triggerRules[index], ...updates };
    return true;
  }

  /**
   * Remove trigger rule
   */
  removeTriggerRule(ruleId: string): boolean {
    const index = this.triggerRules.findIndex((r) => r.id === ruleId);
    if (index === -1) return false;

    this.triggerRules.splice(index, 1);
    return true;
  }

  /**
   * Get all trigger rules
   */
  getTriggerRules(activeOnly = false): TriggerRule[] {
    return activeOnly
      ? this.triggerRules.filter((r) => r.active)
      : this.triggerRules;
  }

  // ═════════════════════════════════════════════════════════════════
  // 📥 EVENT PROCESSING
  // ═════════════════════════════════════════════════════════════════

  /**
   * Process a trigger event
   */
  async processEvent(event: TriggerEvent): Promise<void> {
    this.eventQueue.push(event);

    if (!this.isProcessing) {
      await this.processEventQueue();
    }
  }

  /**
   * Process all events in the queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (!event) continue;

      try {
        await this.handleEvent(event);
      } catch (error) {
        console.error("❌ Error processing trigger event:", error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Handle a single trigger event
   */
  private async handleEvent(event: TriggerEvent): Promise<void> {
    const matchingRules = this.findMatchingRules(event);

    for (const rule of matchingRules) {
      // Check cooldown
      if (!this.checkCooldown(rule, event.userId)) {
        console.log(`⏰ Cooldown active for rule ${rule.id}, skipping`);
        continue;
      }

      // Evaluate conditions
      if (!this.evaluateConditions(rule.conditions, event)) {
        console.log(`❌ Conditions not met for rule ${rule.id}`);
        continue;
      }

      // Execute campaign
      try {
        await this.executeCampaign(rule, event);
        this.recordExecution(rule, event.userId);
      } catch (error) {
        console.error(
          `❌ Error executing campaign for rule ${rule.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Find rules matching the event type
   */
  private findMatchingRules(event: TriggerEvent): TriggerRule[] {
    return this.triggerRules.filter(
      (rule) => rule.active && rule.eventType === event.type,
    );
  }

  /**
   * Check if cooldown period has passed
   */
  private checkCooldown(rule: TriggerRule, userId?: string): boolean {
    if (!userId) return true;

    const key = `${rule.id}:${userId}`;
    const lastExecution = this.executionHistory.get(key);

    if (!lastExecution) return true;

    const cooldownMs = rule.cooldownMinutes * 60 * 1000;
    const timeSinceLastExecution = Date.now() - lastExecution.getTime();

    return timeSinceLastExecution >= cooldownMs;
  }

  /**
   * Evaluate trigger conditions
   */
  private evaluateConditions(
    conditions: TriggerCondition[],
    event: TriggerEvent,
  ): boolean {
    if (conditions.length === 0) return true;

    return conditions.every((condition) => {
      const fieldValue = this.getFieldValue(event, condition.field);
      return this.evaluateCondition(
        fieldValue,
        condition.operator,
        condition.value,
      );
    });
  }

  /**
   * Get field value from event or metadata
   */
  private getFieldValue(event: TriggerEvent, field: string): unknown {
    if (field in event) {
      return event[field as keyof TriggerEvent];
    }
    return event.metadata?.[field];
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    fieldValue: unknown,
    operator: TriggerCondition["operator"],
    targetValue: unknown,
  ): boolean {
    switch (operator) {
      case "eq":
        return fieldValue === targetValue;
      case "ne":
        return fieldValue !== targetValue;
      case "gt":
        return (fieldValue as number) > (targetValue as number);
      case "gte":
        return (fieldValue as number) >= (targetValue as number);
      case "lt":
        return (fieldValue as number) < (targetValue as number);
      case "lte":
        return (fieldValue as number) <= (targetValue as number);
      case "in":
        return Array.isArray(targetValue) && targetValue.includes(fieldValue);
      case "nin":
        return Array.isArray(targetValue) && !targetValue.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Execute campaign based on trigger rule
   */
  private async executeCampaign(
    rule: TriggerRule,
    event: TriggerEvent,
  ): Promise<CampaignExecution | null> {
    console.log(
      `🚀 Executing campaign: ${rule.campaignType} for event: ${event.type}`,
    );

    switch (rule.campaignType) {
      case "CHURN_PREVENTION":
        return await campaignAutomationService.executeChurnPreventionCampaign();

      case "ABANDONED_CART":
        return await campaignAutomationService.executeAbandonedCartCampaign();

      case "WIN_BACK":
        return await campaignAutomationService.executeWinBackCampaign();

      case "SEASONAL_ALERT":
        return await campaignAutomationService.executeSeasonalAlertCampaign();

      case "CROSS_SELL":
        return await campaignAutomationService.executeCrossSellCampaign();

      default:
        console.log(`⚠️ Campaign type ${rule.campaignType} not implemented`);
        return null;
    }
  }

  /**
   * Record campaign execution for cooldown tracking
   */
  private recordExecution(rule: TriggerRule, userId?: string): void {
    if (!userId) return;

    const key = `${rule.id}:${userId}`;
    this.executionHistory.set(key, new Date());
  }

  // ═════════════════════════════════════════════════════════════════
  // 🔄 AUTOMATED MONITORING
  // ═════════════════════════════════════════════════════════════════

  /**
   * Monitor for churn risk users
   */
  async monitorChurnRisk(): Promise<void> {
    const churnRiskUsers =
      await campaignAutomationService.identifyChurnRiskUsers(0.7);

    for (const user of churnRiskUsers) {
      await this.processEvent({
        type: "CHURN_RISK_HIGH",
        userId: user.userId,
        metadata: {
          churnProbability: user.churnProbability,
          daysSinceLastOrder: user.daysSinceLastOrder,
        },
        timestamp: new Date(),
      });
    }

    console.log(
      `🔍 Monitored churn risk: ${churnRiskUsers.length} users at risk`,
    );
  }

  /**
   * Monitor for abandoned carts
   */
  async monitorAbandonedCarts(): Promise<void> {
    const abandonedCarts =
      await campaignAutomationService.identifyAbandonedCarts(24);

    for (const cart of abandonedCarts) {
      const hoursAbandoned = Math.floor(
        (Date.now() - cart.abandonedAt.getTime()) / (1000 * 60 * 60),
      );

      await this.processEvent({
        type: "CART_ABANDONED",
        userId: cart.userId,
        metadata: {
          hoursAbandoned,
          cartValue: cart.totalValue,
          itemCount: cart.cartItems.length,
        },
        timestamp: new Date(),
      });
    }

    console.log(`🛒 Monitored abandoned carts: ${abandonedCarts.length} carts`);
  }

  /**
   * Monitor for inactive users
   */
  async monitorInactiveUsers(): Promise<void> {
    const inactiveUsers =
      await campaignAutomationService.identifyInactiveUsers(30);

    for (const user of inactiveUsers) {
      await this.processEvent({
        type: "USER_INACTIVE",
        userId: user.userId,
        metadata: {
          daysInactive: user.daysSinceLastOrder,
        },
        timestamp: new Date(),
      });
    }

    console.log(`😴 Monitored inactive users: ${inactiveUsers.length} users`);
  }

  /**
   * Check for seasonal changes
   */
  async monitorSeasonalChanges(): Promise<void> {
    // This would typically check if season changed since last check
    // For now, we'll just trigger the seasonal campaign
    await this.processEvent({
      type: "SEASON_CHANGED",
      metadata: {
        // Season metadata would go here
      },
      timestamp: new Date(),
    });

    console.log("🌾 Checked for seasonal changes");
  }

  /**
   * Run all monitoring tasks
   */
  async runAllMonitoring(): Promise<void> {
    console.log("🔍 Running all monitoring tasks...");

    try {
      await Promise.all([
        this.monitorChurnRisk(),
        this.monitorAbandonedCarts(),
        this.monitorInactiveUsers(),
        this.monitorSeasonalChanges(),
      ]);

      console.log("✅ All monitoring tasks completed");
    } catch (error) {
      console.error("❌ Error during monitoring:", error);
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // 📊 STATISTICS & REPORTING
  // ═════════════════════════════════════════════════════════════════

  /**
   * Get trigger engine statistics
   */
  getTriggerStats(): TriggerStats {
    const triggersByType: Partial<Record<TriggerEventType, number>> = {};
    let lastTrigger: Date | undefined;

    for (const [key, date] of this.executionHistory.entries()) {
      if (!lastTrigger || date > lastTrigger) {
        lastTrigger = date;
      }
    }

    return {
      totalTriggers: this.executionHistory.size,
      successfulTriggers: this.executionHistory.size, // Simplified
      failedTriggers: 0, // Would track in real implementation
      averageExecutionTime: 0, // Would track in real implementation
      triggersByType: triggersByType as Record<TriggerEventType, number>,
      lastTrigger,
    };
  }

  /**
   * Clear execution history (for testing or reset)
   */
  clearExecutionHistory(): void {
    this.executionHistory.clear();
    console.log("🧹 Execution history cleared");
  }

  /**
   * Get execution history for a specific user
   */
  getUserExecutionHistory(
    userId: string,
  ): Array<{ ruleId: string; executedAt: Date }> {
    const history: Array<{ ruleId: string; executedAt: Date }> = [];

    for (const [key, date] of this.executionHistory.entries()) {
      if (key.includes(userId)) {
        const ruleId = key.split(":")[0];
        history.push({ ruleId, executedAt: date });
      }
    }

    return history.sort(
      (a, b) => b.executedAt.getTime() - a.executedAt.getTime(),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🌟 SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const triggerEngineService = TriggerEngineService.getInstance();
