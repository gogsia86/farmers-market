/**
 * 📊 Email Analytics Service - Divine Agricultural Communication Intelligence
 *
 * Provides comprehensive analytics and metrics for email communications.
 * Tracks delivery, engagement, and performance with quantum precision.
 *
 * @module EmailAnalyticsService
 * @category Services
 * @agricultural-consciousness DIVINE
 * @sprint Sprint 4 - Email Enhancements
 */

import { database } from "@/lib/database";
import type { EmailLog, EmailStatus, EmailType, Prisma } from "@prisma/client";

/**
 * Email delivery statistics
 */
export interface EmailDeliveryStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  queued: number;
  sending: number;
  bounced: number;
  dropped: number;
  deferred: number;
  successRate: number;
  failureRate: number;
}

/**
 * Email engagement metrics
 */
export interface EmailEngagementMetrics {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
}

/**
 * Email type breakdown
 */
export interface EmailTypeBreakdown {
  type: EmailType;
  displayName: string;
  count: number;
  sent: number;
  failed: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

/**
 * Time-series data point
 */
export interface TimeSeriesDataPoint {
  date: string;
  sent: number;
  failed: number;
  opened: number;
  clicked: number;
  successRate: number;
}

/**
 * Failed email details
 */
export interface FailedEmailDetails {
  id: string;
  userId: string | null;
  recipient: string;
  emailType: EmailType;
  subject: string;
  errorMessage: string | null;
  attemptCount: number;
  lastAttemptAt: Date;
  createdAt: Date;
}

/**
 * Analytics query filters
 */
export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  emailType?: EmailType;
  status?: EmailStatus;
  userId?: string;
}

/**
 * Analytics summary
 */
export interface AnalyticsSummary {
  deliveryStats: EmailDeliveryStats;
  engagementMetrics: EmailEngagementMetrics;
  typeBreakdown: EmailTypeBreakdown[];
  recentFailed: FailedEmailDetails[];
  timeSeries: TimeSeriesDataPoint[];
}

/**
 * Email type display names
 */
const EMAIL_TYPE_DISPLAY_NAMES: Record<EmailType, string> = {
  ORDER_CONFIRMATION: "Order Confirmation",
  ORDER_STATUS_UPDATE: "Order Status Update",
  ORDER_SHIPPED: "Order Shipped",
  ORDER_DELIVERED: "Order Delivered",
  ORDER_CANCELLED: "Order Cancelled",
  PASSWORD_RESET: "Password Reset",
  VERIFICATION: "Email Verification",
  WELCOME: "Welcome Email",
  FARM_UPDATE: "Farm Update",
  NEW_PRODUCT: "New Product",
  PROMOTION: "Promotion",
  SEASONAL_NEWS: "Seasonal News",
  SHIPPING_NOTIFICATION: "Shipping Notification",
  DELIVERY_REMINDER: "Delivery Reminder",
  ACCOUNT_UPDATE: "Account Update",
  SECURITY_ALERT: "Security Alerts",
  PRICE_ALERT: "Price Alerts",
  INVENTORY_ALERT: "Inventory Alert",
  SURVEY_REQUEST: "Survey Request",
  NEWSLETTER: "Newsletter",
  PRODUCT_RECOMMENDATION: "Product Recommendation",
  FARM_APPROVED: "Farm Approved",
  FARM_REJECTED: "Farm Rejected",
  OTHER: "Other",
};

/**
 * 📊 Email Analytics Service
 *
 * Divine service for tracking and analyzing email communication metrics.
 * Provides insights into delivery, engagement, and performance.
 */
export class EmailAnalyticsService {
  /**
   * Get comprehensive analytics summary
   */
  async getAnalyticsSummary(
    filters: AnalyticsFilters = {},
  ): Promise<AnalyticsSummary> {
    try {
      const where = this.buildWhereClause(filters);

      // Execute all queries in parallel for performance
      const [
        deliveryStats,
        engagementMetrics,
        typeBreakdown,
        recentFailed,
        timeSeries,
      ] = await Promise.all([
        this.getDeliveryStats(where),
        this.getEngagementMetrics(where),
        this.getTypeBreakdown(where),
        this.getRecentFailedEmails(10, where),
        this.getTimeSeries(filters.startDate, filters.endDate, where),
      ]);

      return {
        deliveryStats,
        engagementMetrics,
        typeBreakdown,
        recentFailed,
        timeSeries,
      };
    } catch (error) {
      throw new Error(
        `Failed to get analytics summary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get email delivery statistics
   */
  async getDeliveryStats(
    where: Prisma.EmailLogWhereInput = {},
  ): Promise<EmailDeliveryStats> {
    try {
      // Get counts for each status
      const [
        total,
        sent,
        failed,
        pending,
        queued,
        sending,
        bounced,
        dropped,
        deferred,
      ] = await Promise.all([
        database.emailLog.count({ where }),
        database.emailLog.count({ where: { ...where, status: "SENT" } }),
        database.emailLog.count({ where: { ...where, status: "FAILED" } }),
        database.emailLog.count({ where: { ...where, status: "PENDING" } }),
        database.emailLog.count({ where: { ...where, status: "QUEUED" } }),
        database.emailLog.count({ where: { ...where, status: "SENDING" } }),
        database.emailLog.count({ where: { ...where, status: "BOUNCED" } }),
        database.emailLog.count({ where: { ...where, status: "DROPPED" } }),
        database.emailLog.count({ where: { ...where, status: "DEFERRED" } }),
      ]);

      const successRate = total > 0 ? (sent / total) * 100 : 0;
      const failureRate = total > 0 ? (failed / total) * 100 : 0;

      return {
        total,
        sent,
        failed,
        pending,
        queued,
        sending,
        bounced,
        dropped,
        deferred,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
      };
    } catch (error) {
      throw new Error(
        `Failed to get delivery stats: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get email engagement metrics
   */
  async getEngagementMetrics(
    where: Prisma.EmailLogWhereInput = {},
  ): Promise<EmailEngagementMetrics> {
    try {
      const sentWhere = { ...where, status: "SENT" as EmailStatus };

      const [totalSent, totalOpened, totalClicked] = await Promise.all([
        database.emailLog.count({ where: sentWhere }),
        database.emailLog.count({
          where: { ...sentWhere, openedAt: { not: null } },
        }),
        database.emailLog.count({
          where: { ...sentWhere, clickedAt: { not: null } },
        }),
      ]);

      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
      const clickToOpenRate =
        totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

      return {
        totalSent,
        totalOpened,
        totalClicked,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        clickToOpenRate: Math.round(clickToOpenRate * 100) / 100,
      };
    } catch (error) {
      throw new Error(
        `Failed to get engagement metrics: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get email type breakdown
   */
  async getTypeBreakdown(
    where: Prisma.EmailLogWhereInput = {},
  ): Promise<EmailTypeBreakdown[]> {
    try {
      // Get all email types from the database
      const types = await database.emailLog.groupBy({
        by: ["emailType"],
        where,
        _count: { id: true },
      });

      // Get detailed stats for each type
      const breakdown = await Promise.all(
        types.map(async (typeGroup) => {
          const type = typeGroup.emailType;
          const typeWhere = { ...where, emailType: type };

          const [count, sent, failed, opened, clicked] = await Promise.all([
            database.emailLog.count({ where: typeWhere }),
            database.emailLog.count({
              where: { ...typeWhere, status: "SENT" },
            }),
            database.emailLog.count({
              where: { ...typeWhere, status: "FAILED" },
            }),
            database.emailLog.count({
              where: { ...typeWhere, status: "SENT", openedAt: { not: null } },
            }),
            database.emailLog.count({
              where: {
                ...typeWhere,
                status: "SENT",
                clickedAt: { not: null },
              },
            }),
          ]);

          const openRate = sent > 0 ? (opened / sent) * 100 : 0;
          const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;

          return {
            type,
            displayName: EMAIL_TYPE_DISPLAY_NAMES[type] || type,
            count,
            sent,
            failed,
            opened,
            clicked,
            openRate: Math.round(openRate * 100) / 100,
            clickRate: Math.round(clickRate * 100) / 100,
          };
        }),
      );

      // Sort by count descending
      return breakdown.sort((a, b) => b.count - a.count);
    } catch (error) {
      throw new Error(
        `Failed to get type breakdown: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get recent failed emails
   */
  async getRecentFailedEmails(
    limit: number = 10,
    where: Prisma.EmailLogWhereInput = {},
  ): Promise<FailedEmailDetails[]> {
    try {
      const failedEmails = await database.emailLog.findMany({
        where: {
          ...where,
          status: "FAILED",
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: limit,
        select: {
          id: true,
          userId: true,
          recipient: true,
          emailType: true,
          subject: true,
          errorMessage: true,
          attemptCount: true,
          updatedAt: true,
          createdAt: true,
        },
      });

      return failedEmails.map((email) => ({
        id: email.id,
        userId: email.userId,
        recipient: email.recipient,
        emailType: email.emailType,
        subject: email.subject,
        errorMessage: email.errorMessage,
        attemptCount: email.attemptCount,
        lastAttemptAt: email.updatedAt,
        createdAt: email.createdAt,
      }));
    } catch (error) {
      throw new Error(
        `Failed to get recent failed emails: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get time series data
   */
  async getTimeSeries(
    startDate?: Date,
    endDate?: Date,
    where: Prisma.EmailLogWhereInput = {},
  ): Promise<TimeSeriesDataPoint[]> {
    try {
      // Default to last 30 days if no dates provided
      const start =
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate || new Date();

      // Query emails within date range
      const emails = await database.emailLog.findMany({
        where: {
          ...where,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        select: {
          createdAt: true,
          status: true,
          openedAt: true,
          clickedAt: true,
        },
      });

      // Group by date
      const dataByDate = new Map<
        string,
        {
          sent: number;
          failed: number;
          opened: number;
          clicked: number;
          total: number;
        }
      >();

      emails.forEach((email) => {
        const date = email.createdAt.toISOString().split("T")[0] as string;
        const existing = dataByDate.get(date) || {
          sent: 0,
          failed: 0,
          opened: 0,
          clicked: 0,
          total: 0,
        };

        existing.total += 1;
        if (email.status === "SENT") existing.sent += 1;
        if (email.status === "FAILED") existing.failed += 1;
        if (email.openedAt) existing.opened += 1;
        if (email.clickedAt) existing.clicked += 1;

        dataByDate.set(date as string, existing);
      });

      // Convert to array and calculate success rate
      const timeSeries: TimeSeriesDataPoint[] = [];
      dataByDate.forEach((data, dateKey) => {
        const successRate = data.total > 0 ? (data.sent / data.total) * 100 : 0;

        timeSeries.push({
          date: dateKey,
          sent: data.sent,
          failed: data.failed,
          opened: data.opened,
          clicked: data.clicked,
          successRate: Math.round(successRate * 100) / 100,
        });
      });

      // Sort by date ascending
      return timeSeries.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      throw new Error(
        `Failed to get time series data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get email details by ID
   */
  async getEmailDetails(emailId: string): Promise<EmailLog | null> {
    try {
      const email = await database.emailLog.findUnique({
        where: { id: emailId },
      });

      return email;
    } catch (error) {
      throw new Error(
        `Failed to get email details: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get emails for a specific user
   */
  async getUserEmails(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<EmailLog[]> {
    try {
      const emails = await database.emailLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      return emails;
    } catch (error) {
      throw new Error(
        `Failed to get user emails: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Get email count by status
   */
  async getCountByStatus(
    status: EmailStatus,
    filters: AnalyticsFilters = {},
  ): Promise<number> {
    try {
      const where = this.buildWhereClause({ ...filters, status });
      const count = await database.emailLog.count({ where });
      return count;
    } catch (error) {
      throw new Error(
        `Failed to get count by status: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Get email count by type
   */
  async getCountByType(
    emailType: EmailType,
    filters: AnalyticsFilters = {},
  ): Promise<number> {
    try {
      const where = this.buildWhereClause({ ...filters, emailType });
      const count = await database.emailLog.count({ where });
      return count;
    } catch (error) {
      throw new Error(
        `Failed to get count by type: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(
    filters: AnalyticsFilters,
  ): Prisma.EmailLogWhereInput {
    const where: Prisma.EmailLogWhereInput = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters.emailType) {
      where.emailType = filters.emailType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    return where;
  }

  /**
   * Get email type display name
   */
  getEmailTypeDisplayName(emailType: EmailType): string {
    return EMAIL_TYPE_DISPLAY_NAMES[emailType] || emailType;
  }

  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 100) / 100;
  }

  /**
   * Get performance comparison (current vs previous period)
   */
  async getPerformanceComparison(
    currentStart: Date,
    currentEnd: Date,
  ): Promise<{
    current: EmailDeliveryStats;
    previous: EmailDeliveryStats;
    changes: {
      totalChange: number;
      sentChange: number;
      failedChange: number;
      successRateChange: number;
    };
  }> {
    try {
      // Calculate period duration
      const duration = currentEnd.getTime() - currentStart.getTime();

      // Calculate previous period dates
      const previousStart = new Date(currentStart.getTime() - duration);
      const previousEnd = new Date(currentStart.getTime());

      // Get stats for both periods
      const [currentStats, previousStats] = await Promise.all([
        this.getDeliveryStats({
          createdAt: { gte: currentStart, lte: currentEnd },
        }),
        this.getDeliveryStats({
          createdAt: { gte: previousStart, lte: previousEnd },
        }),
      ]);

      return {
        current: currentStats,
        previous: previousStats,
        changes: {
          totalChange: this.calculatePercentageChange(
            currentStats.total,
            previousStats.total,
          ),
          sentChange: this.calculatePercentageChange(
            currentStats.sent,
            previousStats.sent,
          ),
          failedChange: this.calculatePercentageChange(
            currentStats.failed,
            previousStats.failed,
          ),
          successRateChange: this.calculatePercentageChange(
            currentStats.successRate,
            previousStats.successRate,
          ),
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to get performance comparison: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }
}

// Export singleton instance with divine agricultural consciousness
export const emailAnalyticsService = new EmailAnalyticsService();
