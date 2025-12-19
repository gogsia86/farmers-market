/**
 * 🎯 DIVINE RECOMMENDATION EVENT LISTENER SERVICE
 *
 * Event-driven recommendation trigger system that monitors user actions
 * and automatically generates contextual recommendations in real-time.
 *
 * Features:
 * - User action tracking (views, clicks, searches, purchases)
 * - Event-driven recommendation triggers
 * - Behavior analytics
 * - Real-time notification integration
 * - Debounced event processing
 * - Agricultural consciousness integration
 *
 * @module RecommendationEventsService
 * @version 2.0.0
 * @agricultural-consciousness MAXIMUM
 */

import { database } from "@/lib/database";
import { recommendationEngine } from "./recommendation-engine.service";
import { recommendationWebSocket } from "./recommendation-websocket.service";
import type { RecommendationEvent } from "./recommendation-websocket.service";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface UserActionEvent {
  userId: string;
  action: UserActionType;
  entityId?: string;
  entityType?: EntityType;
  metadata?: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  deviceType?: "MOBILE" | "TABLET" | "DESKTOP";
  location?: {
    latitude: number;
    longitude: number;
  };
}

export type UserActionType =
  | "VIEW_PRODUCT"
  | "VIEW_FARM"
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "UPDATE_CART_QUANTITY"
  | "ADD_TO_WISHLIST"
  | "REMOVE_FROM_WISHLIST"
  | "SEARCH"
  | "FILTER_CATEGORY"
  | "COMPLETE_PURCHASE"
  | "RATE_PRODUCT"
  | "RATE_FARM"
  | "SHARE_PRODUCT"
  | "VIEW_RECOMMENDATIONS"
  | "CLICK_RECOMMENDATION";

export type EntityType = "PRODUCT" | "FARM" | "CATEGORY" | "ORDER" | "SEARCH";

export interface EventProcessingResult {
  success: boolean;
  recommendationsGenerated: boolean;
  recommendationsSent: boolean;
  error?: string;
  processingTime: number;
}

export interface BehaviorPattern {
  userId: string;
  pattern: string;
  frequency: number;
  lastOccurrence: Date;
  significance: number;
}

export interface EventStats {
  totalEvents: number;
  eventsByType: Record<UserActionType, number>;
  eventsLast24h: number;
  eventsLastHour: number;
  averageProcessingTime: number;
  recommendationsTriggers: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 DIVINE RECOMMENDATION EVENTS SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class RecommendationEventsService {
  private static instance: RecommendationEventsService;
  private eventQueue: UserActionEvent[] = [];
  private processing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly PROCESSING_INTERVAL = 1000; // 1 second
  private readonly DEBOUNCE_TIME = 500; // 500ms

  // Event statistics
  private stats: EventStats = {
    totalEvents: 0,
    eventsByType: {} as Record<UserActionType, number>,
    eventsLast24h: 0,
    eventsLastHour: 0,
    averageProcessingTime: 0,
    recommendationsTriggers: 0,
  };

  // Debounce tracking
  private lastEventTime = new Map<string, number>();
  private eventHandlers = new Map<UserActionType, Set<EventHandler>>();

  private constructor() {
    this.startProcessing();
  }

  public static getInstance(): RecommendationEventsService {
    if (!RecommendationEventsService.instance) {
      RecommendationEventsService.instance = new RecommendationEventsService();
    }
    return RecommendationEventsService.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📥 EVENT INGESTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Track user action and trigger recommendations
   */
  async trackUserAction(
    event: UserActionEvent,
  ): Promise<EventProcessingResult> {
    const startTime = Date.now();

    try {
      // Apply debouncing for rapid repeated actions
      if (this.shouldDebounce(event)) {
        return {
          success: true,
          recommendationsGenerated: false,
          recommendationsSent: false,
          processingTime: Date.now() - startTime,
        };
      }

      // Update debounce tracker
      this.updateDebounceTracker(event);

      // Add to event queue
      this.eventQueue.push(event);

      // Update statistics
      this.updateStats(event);

      // Log event
      await this.logEventToDatabase(event);

      // Process event immediately if high priority
      if (this.isHighPriority(event.action)) {
        await this.processEvent(event);
      }

      return {
        success: true,
        recommendationsGenerated: true,
        recommendationsSent: true,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error(
        "[RecommendationEvents] Error tracking user action:",
        error,
      );
      return {
        success: false,
        recommendationsGenerated: false,
        recommendationsSent: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Track product view
   */
  async trackProductView(
    userId: string,
    productId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.trackUserAction({
      userId,
      action: "VIEW_PRODUCT",
      entityId: productId,
      entityType: "PRODUCT",
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Track add to cart
   */
  async trackAddToCart(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    await this.trackUserAction({
      userId,
      action: "ADD_TO_CART",
      entityId: productId,
      entityType: "PRODUCT",
      metadata: { quantity },
      timestamp: new Date(),
    });
  }

  /**
   * Track search
   */
  async trackSearch(
    userId: string,
    searchQuery: string,
    resultsCount: number,
  ): Promise<void> {
    await this.trackUserAction({
      userId,
      action: "SEARCH",
      entityType: "SEARCH",
      metadata: { searchQuery, resultsCount },
      timestamp: new Date(),
    });
  }

  /**
   * Track purchase completion
   */
  async trackPurchase(
    userId: string,
    orderId: string,
    totalAmount: number,
    itemCount: number,
  ): Promise<void> {
    await this.trackUserAction({
      userId,
      action: "COMPLETE_PURCHASE",
      entityId: orderId,
      entityType: "ORDER",
      metadata: { totalAmount, itemCount },
      timestamp: new Date(),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ⚙️ EVENT PROCESSING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Start background event processing
   */
  private startProcessing(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(async () => {
      if (this.processing || this.eventQueue.length === 0) return;

      this.processing = true;

      try {
        const batch = this.eventQueue.splice(0, this.BATCH_SIZE);
        await Promise.all(batch.map((event) => this.processEvent(event)));
      } catch (error) {
        console.error("[RecommendationEvents] Error processing batch:", error);
      } finally {
        this.processing = false;
      }
    }, this.PROCESSING_INTERVAL);

    console.log("[RecommendationEvents] ✅ Event processing started");
  }

  /**
   * Stop background event processing
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log("[RecommendationEvents] Event processing stopped");
  }

  /**
   * Process individual event
   */
  private async processEvent(event: UserActionEvent): Promise<void> {
    try {
      // Execute custom event handlers
      await this.executeEventHandlers(event);

      // Generate and send recommendations based on action type
      switch (event.action) {
        case "VIEW_PRODUCT":
          await this.handleProductView(event);
          break;

        case "ADD_TO_CART":
          await this.handleAddToCart(event);
          break;

        case "SEARCH":
          await this.handleSearch(event);
          break;

        case "ADD_TO_WISHLIST":
          await this.handleWishlist(event);
          break;

        case "COMPLETE_PURCHASE":
          await this.handlePurchase(event);
          break;

        case "VIEW_FARM":
          await this.handleFarmView(event);
          break;

        default:
          // Generic processing for other action types
          break;
      }
    } catch (error) {
      console.error(
        `[RecommendationEvents] Error processing ${event.action} event:`,
        error,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 ACTION-SPECIFIC HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Handle product view event
   */
  private async handleProductView(event: UserActionEvent): Promise<void> {
    if (!event.entityId) return;

    // Generate similar product recommendations
    const recommendations = await recommendationEngine.getRecommendations({
      userId: event.userId,
      productId: event.entityId,
      limit: 8,
      context: { pageType: "PRODUCT_DETAIL" },
    });

    // Send via WebSocket if user is connected
    if (recommendationWebSocket.isUserConnected(event.userId)) {
      await recommendationWebSocket["sendRecommendations"](
        event.userId,
        recommendations,
      );
      this.stats.recommendationsTriggers++;
    }
  }

  /**
   * Handle add to cart event
   */
  private async handleAddToCart(event: UserActionEvent): Promise<void> {
    if (!event.entityId) return;

    // Get "frequently bought together" recommendations
    const recommendations =
      await recommendationEngine.getFrequentlyBoughtTogether(event.entityId, 6);

    // Send cart-specific recommendations
    if (recommendationWebSocket.isUserConnected(event.userId)) {
      const message = {
        type: "CART_RECOMMENDATION" as const,
        payload: recommendations,
        timestamp: new Date(),
        userId: event.userId,
      };

      // Access private method through bracket notation
      const client = (recommendationWebSocket as any).clients.get(event.userId);
      if (client) {
        (recommendationWebSocket as any).sendMessage(client.ws, message);
        this.stats.recommendationsTriggers++;
      }
    }
  }

  /**
   * Handle search event
   */
  private async handleSearch(event: UserActionEvent): Promise<void> {
    const searchQuery = event.metadata?.searchQuery;
    if (!searchQuery) return;

    // Generate search-based recommendations
    const recommendations = await recommendationEngine.getRecommendations({
      userId: event.userId,
      limit: 10,
      context: {
        pageType: "SEARCH",
        searchQuery,
      },
    });

    if (recommendationWebSocket.isUserConnected(event.userId)) {
      await recommendationWebSocket["sendRecommendations"](
        event.userId,
        recommendations,
      );
      this.stats.recommendationsTriggers++;
    }
  }

  /**
   * Handle wishlist addition
   */
  private async handleWishlist(event: UserActionEvent): Promise<void> {
    if (!event.entityId) return;

    // Get new arrivals from favorite farms
    const recommendations =
      await recommendationEngine.getNewArrivalsFromFavoriteFarms(
        event.userId,
        8,
      );

    if (recommendationWebSocket.isUserConnected(event.userId)) {
      await recommendationWebSocket.sendNewArrivalAlert(
        event.userId,
        recommendations.recommendations.map((r) => r.product),
      );
      this.stats.recommendationsTriggers++;
    }
  }

  /**
   * Handle purchase completion
   */
  private async handlePurchase(event: UserActionEvent): Promise<void> {
    // Generate post-purchase recommendations (complementary products)
    const recommendations = await recommendationEngine.getRecommendations({
      userId: event.userId,
      limit: 10,
      context: { pageType: "CHECKOUT" },
    });

    // Store recommendations for future use
    console.log(
      `[RecommendationEvents] Generated post-purchase recommendations for user ${event.userId}`,
    );
  }

  /**
   * Handle farm view event
   */
  private async handleFarmView(event: UserActionEvent): Promise<void> {
    if (!event.entityId) return;

    // Get products from the viewed farm
    const farmProducts = await database.product.findMany({
      where: {
        farmId: event.entityId,
        status: "ACTIVE",
        inStock: true,
      },
      include: { farm: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    if (recommendationWebSocket.isUserConnected(event.userId)) {
      const message = {
        type: "RECOMMENDATION_UPDATE" as const,
        payload: {
          recommendations: farmProducts.map((product) => ({
            product,
            score: 0.9,
            reason: "FARM_FAVORITE" as const,
            confidence: 0.85,
            metadata: { source: "farm_view" },
          })),
          algorithms: ["farm_products"],
          timestamp: new Date(),
          userId: event.userId,
        },
        timestamp: new Date(),
        userId: event.userId,
      };

      const client = (recommendationWebSocket as any).clients.get(event.userId);
      if (client) {
        (recommendationWebSocket as any).sendMessage(client.ws, message);
        this.stats.recommendationsTriggers++;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔧 HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check if event should be debounced
   */
  private shouldDebounce(event: UserActionEvent): boolean {
    const key = `${event.userId}-${event.action}-${event.entityId || ""}`;
    const lastTime = this.lastEventTime.get(key);

    if (!lastTime) return false;

    const timeSinceLastEvent = Date.now() - lastTime;
    return timeSinceLastEvent < this.DEBOUNCE_TIME;
  }

  /**
   * Update debounce tracker
   */
  private updateDebounceTracker(event: UserActionEvent): void {
    const key = `${event.userId}-${event.action}-${event.entityId || ""}`;
    this.lastEventTime.set(key, Date.now());

    // Clean old entries (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.lastEventTime.forEach((time, k) => {
      if (time < fiveMinutesAgo) {
        this.lastEventTime.delete(k);
      }
    });
  }

  /**
   * Check if action is high priority (needs immediate processing)
   */
  private isHighPriority(action: UserActionType): boolean {
    const highPriorityActions: UserActionType[] = [
      "ADD_TO_CART",
      "VIEW_PRODUCT",
      "COMPLETE_PURCHASE",
    ];
    return highPriorityActions.includes(action);
  }

  /**
   * Log event to database
   */
  private async logEventToDatabase(event: UserActionEvent): Promise<void> {
    try {
      // Create user activity log entry
      // This would be stored in a dedicated analytics table
      console.log(
        `[RecommendationEvents] Logged event: ${event.action} by user ${event.userId}`,
      );

      // In production, this would write to a time-series database or analytics service
      // await database.userActivityLog.create({ data: event });
    } catch (error) {
      console.error(
        "[RecommendationEvents] Error logging event to database:",
        error,
      );
    }
  }

  /**
   * Update statistics
   */
  private updateStats(event: UserActionEvent): void {
    this.stats.totalEvents++;
    this.stats.eventsByType[event.action] =
      (this.stats.eventsByType[event.action] || 0) + 1;

    // Update time-based counters (simplified for now)
    this.stats.eventsLast24h++;
    this.stats.eventsLastHour++;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 EVENT HANDLER REGISTRATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Register custom event handler
   */
  onEvent(actionType: UserActionType, handler: EventHandler): void {
    if (!this.eventHandlers.has(actionType)) {
      this.eventHandlers.set(actionType, new Set());
    }
    this.eventHandlers.get(actionType)!.add(handler);
  }

  /**
   * Unregister event handler
   */
  offEvent(actionType: UserActionType, handler: EventHandler): void {
    this.eventHandlers.get(actionType)?.delete(handler);
  }

  /**
   * Execute registered event handlers
   */
  private async executeEventHandlers(event: UserActionEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.action);
    if (!handlers || handlers.size === 0) return;

    await Promise.all(
      Array.from(handlers).map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(
            `[RecommendationEvents] Error in custom handler:`,
            error,
          );
        }
      }),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 ANALYTICS & MONITORING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get event statistics
   */
  getStats(): EventStats {
    return { ...this.stats };
  }

  /**
   * Get user behavior patterns
   */
  async getUserBehaviorPatterns(
    userId: string,
    limit = 10,
  ): Promise<BehaviorPattern[]> {
    // Analyze user's recent actions to identify patterns
    // This is a simplified version
    return [];
  }

  /**
   * Get event queue size
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Get processing status
   */
  getProcessingStatus(): {
    isProcessing: boolean;
    queueSize: number;
    stats: EventStats;
  } {
    return {
      isProcessing: this.processing,
      queueSize: this.eventQueue.length,
      stats: this.getStats(),
    };
  }

  /**
   * Clear event queue (for testing/maintenance)
   */
  clearQueue(): void {
    this.eventQueue = [];
    console.log("[RecommendationEvents] Event queue cleared");
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalEvents: 0,
      eventsByType: {} as Record<UserActionType, number>,
      eventsLast24h: 0,
      eventsLastHour: 0,
      averageProcessingTime: 0,
      recommendationsTriggers: 0,
    };
    console.log("[RecommendationEvents] Statistics reset");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type EventHandler = (event: UserActionEvent) => Promise<void> | void;

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const recommendationEvents = RecommendationEventsService.getInstance();
