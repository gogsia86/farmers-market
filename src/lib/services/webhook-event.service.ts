/**
 * Webhook Event Service
 * Handles webhook event logging, deduplication, and idempotency
 * Prevents duplicate processing of webhook events from providers
 */

import { database } from "@/lib/database";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { Prisma } from "@prisma/client";

import { logger } from '@/lib/monitoring/logger';

const tracer = trace.getTracer("webhook-event-service");

// ============================================================================
// Types & Interfaces
// ============================================================================

export type WebhookProvider = "STRIPE" | "PAYPAL" | "TWILIO" | "FIREBASE";

export interface WebhookEventData {
  provider: WebhookProvider;
  eventId: string;
  eventType: string;
  payload: Record<string, any>;
}

export interface WebhookProcessingResult {
  success: boolean;
  alreadyProcessed: boolean;
  error?: string;
}

export interface WebhookEventFilter {
  provider?: WebhookProvider;
  eventType?: string;
  processed?: boolean;
  minAttempts?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface WebhookEventStats {
  total: number;
  processed: number;
  failed: number;
  pending: number;
  averageAttempts: number;
  oldestPending?: Date;
}

// ============================================================================
// Webhook Event Service
// ============================================================================

export class WebhookEventService {
  /**
   * Record incoming webhook event
   * Implements idempotency - returns existing event if already recorded
   */
  async recordEvent(data: WebhookEventData): Promise<WebhookProcessingResult> {
    return await tracer.startActiveSpan("recordWebhookEvent", async (span) => {
      span.setAttributes({
        "webhook.provider": data.provider,
        "webhook.event_id": data.eventId,
        "webhook.event_type": data.eventType,
      });

      try {
        // Check if event already exists (idempotency check)
        const existingEvent = await database.webhookEvent.findUnique({
          where: { eventId: data.eventId },
          select: {
            id: true,
            processed: true,
            processedAt: true,
            attempts: true,
            error: true,
          },
        });

        if (existingEvent) {
          span.setAttributes({
            "webhook.already_exists": true,
            "webhook.already_processed": existingEvent.processed,
            "webhook.attempts": existingEvent.attempts,
          });

          logger.info(
            `[WebhookEvent] Event ${data.eventId} already recorded. Processed: ${existingEvent.processed}`
          );

          span.setStatus({ code: SpanStatusCode.OK });
          return {
            success: true,
            alreadyProcessed: existingEvent.processed,
          };
        }

        // Record new event
        await database.webhookEvent.create({
          data: {
            eventId: data.eventId,
            provider: data.provider,
            eventType: data.eventType,
            payload: data.payload as Prisma.InputJsonValue,
            processed: false,
            attempts: 0,
          },
        });

        logger.info(
          `[WebhookEvent] Recorded new event: ${data.eventId} (${data.provider}/${data.eventType})`
        );

        span.setStatus({ code: SpanStatusCode.OK });
        return {
          success: true,
          alreadyProcessed: false,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        span.recordException(error as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: errorMessage,
        });

        logger.error(`[WebhookEvent] Failed to record event ${data.eventId}:`, {
        error: error instanceof Error ? error.message : String(error)
      });

        return {
          success: false,
          alreadyProcessed: false,
          error: errorMessage,
        };
      } finally {
        span.end();
      }
    });
  }

  /**
   * Mark event as processed successfully
   */
  async markAsProcessed(eventId: string): Promise<void> {
    return await tracer.startActiveSpan("markWebhookProcessed", async (span) => {
      span.setAttribute("webhook.event_id", eventId);

      try {
        await database.webhookEvent.updateMany({
          where: {
            eventId,
            processed: false, // Only update if not already processed
          },
          data: {
            processed: true,
            processedAt: new Date(),
            attempts: { increment: 1 },
            lastAttemptAt: new Date(),
            error: null,
          },
        });

        logger.info(`[WebhookEvent] Marked event ${eventId} as processed`);
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        logger.error(`[WebhookEvent] Failed to mark event ${eventId} as processed:`, {
        error: error instanceof Error ? error.message : String(error)
      });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Record processing failure
   */
  async markAsFailed(eventId: string, error: string): Promise<void> {
    return await tracer.startActiveSpan("markWebhookFailed", async (span) => {
      span.setAttributes({
        "webhook.event_id": eventId,
        "webhook.error": error,
      });

      try {
        await database.webhookEvent.updateMany({
          where: { eventId },
          data: {
            processed: false,
            attempts: { increment: 1 },
            lastAttemptAt: new Date(),
            error,
          },
        });

        logger.error(`[WebhookEvent] Event ${eventId} processing failed: ${error}`);
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (dbError) {
        span.recordException(dbError as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        logger.error(`[WebhookEvent] Failed to record error for event ${eventId}:`, {
        error: dbError instanceof Error ? dbError.message : String(dbError)
      });
        throw dbError;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Check if event has already been processed (idempotency check)
   */
  async isProcessed(eventId: string): Promise<boolean> {
    const event = await database.webhookEvent.findUnique({
      where: { eventId },
      select: { processed: true },
    });

    return event?.processed || false;
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string) {
    return await database.webhookEvent.findUnique({
      where: { eventId },
    });
  }

  /**
   * Get events with filtering
   */
  async getEvents(filter: WebhookEventFilter, limit = 100, offset = 0) {
    const where: Prisma.WebhookEventWhereInput = {};

    if (filter.provider) {
      where.provider = filter.provider;
    }

    if (filter.eventType) {
      where.eventType = filter.eventType;
    }

    if (filter.processed !== undefined) {
      where.processed = filter.processed;
    }

    if (filter.minAttempts !== undefined) {
      where.attempts = { gte: filter.minAttempts };
    }

    if (filter.createdAfter || filter.createdBefore) {
      where.createdAt = {};
      if (filter.createdAfter) {
        where.createdAt.gte = filter.createdAfter;
      }
      if (filter.createdBefore) {
        where.createdAt.lte = filter.createdBefore;
      }
    }

    const [events, total] = await Promise.all([
      database.webhookEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      database.webhookEvent.count({ where }),
    ]);

    return { events, total };
  }

  /**
   * Get failed events that need retry
   */
  async getFailedEvents(maxAttempts = 5, limit = 100) {
    return await database.webhookEvent.findMany({
      where: {
        processed: false,
        attempts: { lt: maxAttempts },
      },
      orderBy: { lastAttemptAt: "asc" },
      take: limit,
    });
  }

  /**
   * Retry failed event processing
   */
  async retryEvent(
    eventId: string,
    handler: (payload: Record<string, any>) => Promise<void>
  ): Promise<WebhookProcessingResult> {
    return await tracer.startActiveSpan("retryWebhookEvent", async (span) => {
      span.setAttribute("webhook.event_id", eventId);

      try {
        const event = await this.getEvent(eventId);

        if (!event) {
          throw new Error(`Event ${eventId} not found`);
        }

        if (event.processed) {
          return {
            success: true,
            alreadyProcessed: true,
          };
        }

        // Attempt to process
        await handler(event.payload as Record<string, any>);

        // Mark as processed
        await this.markAsProcessed(eventId);

        span.setStatus({ code: SpanStatusCode.OK });
        return {
          success: true,
          alreadyProcessed: false,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await this.markAsFailed(eventId, errorMessage);

        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });

        return {
          success: false,
          alreadyProcessed: false,
          error: errorMessage,
        };
      } finally {
        span.end();
      }
    });
  }

  /**
   * Get webhook event statistics
   */
  async getStats(filter?: {
    provider?: WebhookProvider;
    timeRange?: { start: Date; end: Date };
  }): Promise<WebhookEventStats> {
    return await tracer.startActiveSpan("getWebhookStats", async (span) => {
      try {
        const where: Prisma.WebhookEventWhereInput = {};

        if (filter?.provider) {
          where.provider = filter.provider;
        }

        if (filter?.timeRange) {
          where.createdAt = {
            gte: filter.timeRange.start,
            lte: filter.timeRange.end,
          };
        }

        const [total, processed, failed, pending, avgAttempts, oldestPending] =
          await Promise.all([
            database.webhookEvent.count({ where }),
            database.webhookEvent.count({ where: { ...where, processed: true } }),
            database.webhookEvent.count({
              where: { ...where, processed: false, attempts: { gte: 3 } },
            }),
            database.webhookEvent.count({ where: { ...where, processed: false } }),
            database.webhookEvent.aggregate({
              where,
              _avg: { attempts: true },
            }),
            database.webhookEvent.findFirst({
              where: { ...where, processed: false },
              orderBy: { createdAt: "asc" },
              select: { createdAt: true },
            }),
          ]);

        const stats: WebhookEventStats = {
          total,
          processed,
          failed,
          pending,
          averageAttempts: avgAttempts._avg.attempts || 0,
          oldestPending: oldestPending?.createdAt,
        };

        span.setAttributes({
          "webhook.stats.total": stats.total,
          "webhook.stats.processed": stats.processed,
          "webhook.stats.failed": stats.failed,
          "webhook.stats.pending": stats.pending,
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return stats;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Clean up old processed events
   */
  async cleanupOldEvents(olderThanDays = 90): Promise<number> {
    return await tracer.startActiveSpan("cleanupOldWebhookEvents", async (span) => {
      span.setAttribute("webhook.cleanup_days", olderThanDays);

      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const result = await database.webhookEvent.deleteMany({
          where: {
            processed: true,
            processedAt: { lt: cutoffDate },
          },
        });

        logger.info(
          `[WebhookEvent] Cleaned up ${result.count} events older than ${olderThanDays} days`
        );

        span.setAttribute("webhook.cleanup_count", result.count);
        span.setStatus({ code: SpanStatusCode.OK });

        return result.count;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Delete specific event
   */
  async deleteEvent(eventId: string): Promise<void> {
    await database.webhookEvent.delete({
      where: { eventId },
    });

    logger.info(`[WebhookEvent] Deleted event ${eventId}`);
  }

  /**
   * Bulk mark events as processed
   */
  async bulkMarkAsProcessed(eventIds: string[]): Promise<number> {
    const result = await database.webhookEvent.updateMany({
      where: {
        eventId: { in: eventIds },
        processed: false,
      },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    logger.info(`[WebhookEvent] Bulk marked ${result.count} events as processed`);
    return result.count;
  }

  /**
   * Get duplicate events (same eventId with different processing status)
   */
  async findDuplicates(provider?: WebhookProvider): Promise<
    Array<{
      eventId: string;
      count: number;
      provider: string;
    }>
  > {
    const where: Prisma.WebhookEventWhereInput = {};
    if (provider) {
      where.provider = provider;
    }

    // Raw query to find duplicates
    const duplicates = await database.$queryRaw<
      Array<{ eventId: string; count: bigint; provider: string }>
    >`
      SELECT "eventId", COUNT(*) as count, "provider"
      FROM "webhook_events"
      ${provider ? Prisma.sql`WHERE "provider" = ${provider}` : Prisma.empty}
      GROUP BY "eventId", "provider"
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    return duplicates.map((d) => ({
      ...d,
      count: Number(d.count),
    }));
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const webhookEventService = new WebhookEventService();
