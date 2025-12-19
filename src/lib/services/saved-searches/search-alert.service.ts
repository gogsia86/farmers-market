/**
 * Search Alert Service
 *
 * Handles search alert operations including:
 * - Create, read, update, delete alerts
 * - Alert execution and triggering
 * - Notification delivery
 * - Alert condition evaluation
 *
 * @module SearchAlertService
 * @since Run 4 - Phase 2
 */

import { database } from "@/lib/database";
import { SearchAlertType, Prisma } from "@prisma/client";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface CreateAlertInput {
  savedSearchId: string;
  userId: string;
  type: SearchAlertType;
  conditions: {
    minProducts?: number;
    priceChangePercent?: number;
    specificFarms?: string[];
    keywords?: string[];
    categories?: string[];
  };
  channels: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  isActive?: boolean;
}

export interface UpdateAlertInput {
  type?: SearchAlertType;
  conditions?: Record<string, any>;
  channels?: Record<string, any>;
  isActive?: boolean;
}

export interface AlertEvaluationResult {
  shouldTrigger: boolean;
  matchedConditions: string[];
  products?: any[];
  priceChanges?: any[];
  message?: string;
}

export interface AlertExecutionResult {
  alertId: string;
  triggered: boolean;
  notificationsSent: number;
  channels: string[];
  error?: string;
}

// ============================================
// SEARCH ALERT SERVICE
// ============================================

export class SearchAlertService {
  /**
   * Create a new search alert
   */
  static async create(input: CreateAlertInput) {
    const {
      savedSearchId,
      userId,
      type,
      conditions,
      channels,
      isActive = true,
    } = input;

    // Validate saved search exists and user has access
    const savedSearch = await database.savedSearch.findFirst({
      where: {
        id: savedSearchId,
        OR: [
          { userId },
          {
            sharedWith: {
              some: {
                sharedWithId: userId,
              },
            },
          },
        ],
      },
    });

    if (!savedSearch) {
      throw new Error("Saved search not found or access denied");
    }

    // Create alert
    const alert = await database.searchAlert.create({
      data: {
        savedSearchId,
        userId,
        type,
        conditions: conditions as Prisma.InputJsonValue,
        channels: channels as Prisma.InputJsonValue,
        isActive,
      },
      include: {
        savedSearch: {
          select: {
            id: true,
            name: true,
            query: true,
          },
        },
      },
    });

    return alert;
  }

  /**
   * Get alert by ID
   */
  static async getById(alertId: string, userId: string) {
    const alert = await database.searchAlert.findFirst({
      where: {
        id: alertId,
        userId,
      },
      include: {
        savedSearch: {
          select: {
            id: true,
            name: true,
            description: true,
            query: true,
            filters: true,
          },
        },
      },
    });

    if (!alert) {
      throw new Error("Alert not found or access denied");
    }

    return alert;
  }

  /**
   * List alerts for a user
   */
  static async list(filters: {
    userId: string;
    savedSearchId?: string;
    type?: SearchAlertType;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const {
      userId,
      savedSearchId,
      type,
      isActive,
      limit = 50,
      offset = 0,
    } = filters;

    const where: Prisma.SearchAlertWhereInput = {
      userId,
    };

    if (savedSearchId) {
      where.savedSearchId = savedSearchId;
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [alerts, total] = await Promise.all([
      database.searchAlert.findMany({
        where,
        include: {
          savedSearch: {
            select: {
              id: true,
              name: true,
              query: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      database.searchAlert.count({ where }),
    ]);

    return {
      alerts,
      total,
      limit,
      offset,
      hasMore: offset + alerts.length < total,
    };
  }

  /**
   * Update alert
   */
  static async update(
    alertId: string,
    userId: string,
    input: UpdateAlertInput,
  ) {
    // Verify ownership
    const existingAlert = await database.searchAlert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!existingAlert) {
      throw new Error("Alert not found or access denied");
    }

    // Update alert
    const updatedAlert = await database.searchAlert.update({
      where: { id: alertId },
      data: {
        ...(input.type && { type: input.type }),
        ...(input.conditions && {
          conditions: input.conditions as Prisma.InputJsonValue,
        }),
        ...(input.channels && {
          channels: input.channels as Prisma.InputJsonValue,
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        savedSearch: {
          select: {
            id: true,
            name: true,
            query: true,
          },
        },
      },
    });

    return updatedAlert;
  }

  /**
   * Delete alert
   */
  static async delete(alertId: string, userId: string) {
    // Verify ownership
    const existingAlert = await database.searchAlert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!existingAlert) {
      throw new Error("Alert not found or access denied");
    }

    // Delete alert
    await database.searchAlert.delete({
      where: { id: alertId },
    });

    return { success: true };
  }

  /**
   * Toggle alert active status
   */
  static async toggleActive(alertId: string, userId: string) {
    const existingAlert = await database.searchAlert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!existingAlert) {
      throw new Error("Alert not found or access denied");
    }

    const updatedAlert = await database.searchAlert.update({
      where: { id: alertId },
      data: {
        isActive: !existingAlert.isActive,
      },
    });

    return updatedAlert;
  }

  /**
   * Evaluate if alert conditions are met
   */
  static async evaluateAlert(alertId: string): Promise<AlertEvaluationResult> {
    const alert = await database.searchAlert.findUnique({
      where: { id: alertId },
      include: {
        savedSearch: true,
      },
    });

    if (!alert || !alert.isActive) {
      return {
        shouldTrigger: false,
        matchedConditions: [],
      };
    }

    const conditions = alert.conditions as Record<string, any>;
    const matchedConditions: string[] = [];
    let shouldTrigger = false;

    // Execute saved search to get current results
    const savedSearchFilters = alert.savedSearch.filters as Record<string, any>;
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
    };

    // Apply saved search filters
    if (alert.savedSearch.query) {
      where.OR = [
        {
          name: { contains: alert.savedSearch.query, mode: "insensitive" },
        },
        {
          description: {
            contains: alert.savedSearch.query,
            mode: "insensitive",
          },
        },
      ];
    }

    if (savedSearchFilters.category) {
      where.category = savedSearchFilters.category;
    }

    if (savedSearchFilters.organic === true) {
      where.organic = true;
    }

    // Execute search
    const products = await database.product.findMany({
      where,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            verificationStatus: true,
          },
        },
      },
      take: 100, // Limit for alert evaluation
    });

    // Evaluate based on alert type
    switch (alert.type) {
      case SearchAlertType.NEW_PRODUCTS:
        // Check if there are new products since last trigger
        if (alert.lastTriggered) {
          const newProducts = products.filter(
            (p) => p.createdAt > alert.lastTriggered!,
          );

          if (
            newProducts.length > 0 &&
            (!conditions.minProducts ||
              newProducts.length >= conditions.minProducts)
          ) {
            shouldTrigger = true;
            matchedConditions.push(`${newProducts.length} new products found`);
          }
        } else if (products.length > 0) {
          // First time - trigger if products exist
          shouldTrigger = true;
          matchedConditions.push(`${products.length} products found`);
        }
        break;

      case SearchAlertType.PRICE_CHANGE:
        // TODO: Implement price tracking
        // For now, just check if products exist
        if (products.length > 0) {
          shouldTrigger = true;
          matchedConditions.push("Products available for price monitoring");
        }
        break;

      case SearchAlertType.BACK_IN_STOCK: {
        // Check if previously out-of-stock items are back
        const inStockProducts = products.filter((p) => p.inStock);
        if (inStockProducts.length > 0) {
          shouldTrigger = true;
          matchedConditions.push(
            `${inStockProducts.length} products back in stock`,
          );
        }
        break;
      }

      case SearchAlertType.SEASONAL_AVAILABLE: {
        // Check for seasonal products
        const seasonalProducts = products.filter((p) => p.seasonal === true);
        if (seasonalProducts.length > 0) {
          shouldTrigger = true;
          matchedConditions.push(
            `${seasonalProducts.length} seasonal products available`,
          );
        }
        break;
      }

      case SearchAlertType.FARM_UPDATE:
        // Check for updates from specific farms
        if (
          conditions.specificFarms &&
          Array.isArray(conditions.specificFarms)
        ) {
          const farmProducts = products.filter((p) =>
            conditions.specificFarms.includes(p.farmId),
          );
          if (farmProducts.length > 0) {
            shouldTrigger = true;
            matchedConditions.push(
              `${farmProducts.length} products from favorite farms`,
            );
          }
        }
        break;

      case SearchAlertType.CUSTOM:
        // Custom condition evaluation
        if (products.length > 0) {
          shouldTrigger = true;
          matchedConditions.push(`Custom conditions met`);
        }
        break;
    }

    return {
      shouldTrigger,
      matchedConditions,
      products: shouldTrigger ? products.slice(0, 10) : [], // Return top 10 products
      message: matchedConditions.join(", "),
    };
  }

  /**
   * Execute alert (evaluate and send notifications)
   */
  static async executeAlert(alertId: string): Promise<AlertExecutionResult> {
    const evaluation = await this.evaluateAlert(alertId);

    if (!evaluation.shouldTrigger) {
      return {
        alertId,
        triggered: false,
        notificationsSent: 0,
        channels: [],
      };
    }

    // Get alert details
    const alert = await database.searchAlert.findUnique({
      where: { id: alertId },
      include: {
        savedSearch: true,
      },
    });

    if (!alert) {
      throw new Error("Alert not found");
    }

    const channels = alert.channels as Record<string, boolean>;
    const deliveryChannels: string[] = [];

    try {
      // Send notifications based on enabled channels
      if (channels.email) {
        await this.sendEmailNotification(alert, evaluation);
        deliveryChannels.push("email");
      }

      if (channels.push) {
        await this.sendPushNotification(alert, evaluation);
        deliveryChannels.push("push");
      }

      if (channels.sms) {
        await this.sendSMSNotification(alert, evaluation);
        deliveryChannels.push("sms");
      }

      // Update alert trigger stats
      await database.searchAlert.update({
        where: { id: alertId },
        data: {
          lastTriggered: new Date(),
          triggerCount: { increment: 1 },
        },
      });

      return {
        alertId,
        triggered: true,
        notificationsSent: deliveryChannels.length,
        channels: deliveryChannels,
      };
    } catch (error) {
      console.error(`[SearchAlert Execute] Error:`, error);
      return {
        alertId,
        triggered: false,
        notificationsSent: 0,
        channels: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Execute all active alerts for a user
   */
  static async executeUserAlerts(userId: string) {
    const alerts = await database.searchAlert.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    const results = await Promise.allSettled(
      alerts.map((alert) => this.executeAlert(alert.id)),
    );

    return results.map((result, index) => ({
      alertId: alerts[index]?.id || "",
      success: result.status === "fulfilled",
      result: result.status === "fulfilled" ? result.value : undefined,
      error: result.status === "rejected" ? result.reason : undefined,
    }));
  }

  /**
   * Execute all active alerts (for scheduled job)
   */
  static async executeAllAlerts() {
    const alerts = await database.searchAlert.findMany({
      where: {
        isActive: true,
      },
      include: {
        savedSearch: {
          select: {
            notificationFrequency: true,
            lastNotificationSent: true,
          },
        },
      },
    });

    // Filter alerts that should run based on notification frequency
    const alertsToRun = alerts.filter((alert) => {
      if (!alert.savedSearch.lastNotificationSent) {
        return true; // First time - always run
      }

      const lastSent = alert.savedSearch.lastNotificationSent.getTime();
      const now = Date.now();
      const hoursSinceLastSent = (now - lastSent) / (1000 * 60 * 60);

      switch (alert.savedSearch.notificationFrequency) {
        case "REALTIME":
          return true;
        case "HOURLY":
          return hoursSinceLastSent >= 1;
        case "DAILY":
          return hoursSinceLastSent >= 24;
        case "WEEKLY":
          return hoursSinceLastSent >= 168; // 24 * 7
        case "MONTHLY":
          return hoursSinceLastSent >= 720; // 24 * 30
        default:
          return false;
      }
    });

    const results = await Promise.allSettled(
      alertsToRun.map((alert) => this.executeAlert(alert.id)),
    );

    return {
      totalAlerts: alerts.length,
      alertsExecuted: alertsToRun.length,
      results: results.map((result, index) => ({
        alertId: alertsToRun[index].id,
        success: result.status === "fulfilled",
        result: result.status === "fulfilled" ? result.value : undefined,
        error: result.status === "rejected" ? result.reason : undefined,
      })),
    };
  }

  /**
   * Get alert statistics for a user
   */
  static async getStats(userId: string) {
    const [
      totalAlerts,
      activeAlerts,
      totalTriggers,
      recentTriggers,
      alertsByType,
    ] = await Promise.all([
      database.searchAlert.count({
        where: { userId },
      }),
      database.searchAlert.count({
        where: { userId, isActive: true },
      }),
      database.searchAlert.aggregate({
        where: { userId },
        _sum: { triggerCount: true },
      }),
      database.searchAlert.count({
        where: {
          userId,
          lastTriggered: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      database.searchAlert.groupBy({
        by: ["type"],
        where: { userId },
        _count: true,
      }),
    ]);

    return {
      totalAlerts,
      activeAlerts,
      totalTriggers: totalTriggers._sum.triggerCount || 0,
      recentTriggers,
      alertsByType: alertsByType.map((group) => ({
        type: group.type,
        count: group._count,
      })),
    };
  }

  // ============================================
  // PRIVATE NOTIFICATION METHODS
  // ============================================

  /**
   * Send email notification
   * @private
   */
  private static async sendEmailNotification(
    alert: any,
    evaluation: AlertEvaluationResult,
  ) {
    // TODO: Integrate with email service (e.g., SendGrid, AWS SES)
    console.log(`[Email] Sending alert notification:`, {
      alertId: alert.id,
      userId: alert.userId,
      type: alert.type,
      message: evaluation.message,
      productCount: evaluation.products?.length || 0,
    });

    // Placeholder for actual email sending
    // await emailService.send({
    //   to: user.email,
    //   subject: `Alert: ${alert.savedSearch.name}`,
    //   body: evaluation.message,
    // });
  }

  /**
   * Send push notification
   * @private
   */
  private static async sendPushNotification(
    alert: any,
    evaluation: AlertEvaluationResult,
  ) {
    // TODO: Integrate with push notification service (e.g., FCM, OneSignal)
    console.log(`[Push] Sending alert notification:`, {
      alertId: alert.id,
      userId: alert.userId,
      type: alert.type,
      message: evaluation.message,
    });

    // Placeholder for actual push notification
    // await pushService.send({
    //   userId: alert.userId,
    //   title: alert.savedSearch.name,
    //   body: evaluation.message,
    // });
  }

  /**
   * Send SMS notification
   * @private
   */
  private static async sendSMSNotification(
    alert: any,
    evaluation: AlertEvaluationResult,
  ) {
    // TODO: Integrate with SMS service (e.g., Twilio)
    console.log(`[SMS] Sending alert notification:`, {
      alertId: alert.id,
      userId: alert.userId,
      type: alert.type,
      message: evaluation.message,
    });

    // Placeholder for actual SMS sending
    // await smsService.send({
    //   to: user.phone,
    //   message: `${alert.savedSearch.name}: ${evaluation.message}`,
    // });
  }
}
