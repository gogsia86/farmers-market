/**
 * 🔌 DIVINE REAL-TIME RECOMMENDATION WEBSOCKET SERVICE
 *
 * WebSocket-powered real-time recommendation delivery system that manifests
 * instant personalized suggestions as users interact with the platform.
 *
 * Features:
 * - Real-time recommendation updates
 * - Price drop alerts
 * - Stock availability notifications
 * - Live trending product updates
 * - User action-triggered recommendations
 * - Connection management and reconnection logic
 *
 * @module RecommendationWebSocketService
 * @version 2.0.0
 * @agricultural-consciousness MAXIMUM
 */

import type { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { recommendationEngine } from "./recommendation-engine.service";
import type { RecommendationResult } from "./recommendation-engine.service";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: Date;
  userId?: string;
}

export type WebSocketMessageType =
  | "RECOMMENDATION_UPDATE"
  | "PRICE_DROP_ALERT"
  | "STOCK_ALERT"
  | "TRENDING_UPDATE"
  | "PERSONALIZED_SUGGESTION"
  | "NEW_ARRIVAL_ALERT"
  | "CART_RECOMMENDATION"
  | "HEARTBEAT"
  | "CONNECTION_ACK"
  | "ERROR";

export interface ClientConnection {
  ws: WebSocket;
  userId: string;
  connectedAt: Date;
  lastActivityAt: Date;
  subscriptions: Set<string>;
  metadata: Record<string, any>;
}

export interface RecommendationEvent {
  type: "VIEW_PRODUCT" | "ADD_TO_CART" | "COMPLETE_PURCHASE" | "SEARCH" | "FAVORITE";
  userId: string;
  productId?: string;
  category?: string;
  searchQuery?: string;
  metadata?: Record<string, any>;
}

export interface PriceDropAlert {
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  discount: number;
  farmName: string;
}

export interface StockAlert {
  productId: string;
  productName: string;
  farmName: string;
  stockLevel: number;
  previouslyOutOfStock: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 DIVINE RECOMMENDATION WEBSOCKET SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class RecommendationWebSocketService {
  private static instance: RecommendationWebSocketService;
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, ClientConnection>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly CLIENT_TIMEOUT = 60000; // 60 seconds

  private constructor() {}

  public static getInstance(): RecommendationWebSocketService {
    if (!RecommendationWebSocketService.instance) {
      RecommendationWebSocketService.instance = new RecommendationWebSocketService();
    }
    return RecommendationWebSocketService.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 SERVER INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize WebSocket server
   */
  initialize(server: HTTPServer, path = "/ws/recommendations"): void {
    if (this.wss) {
      console.warn("[RecommendationWS] Server already initialized");
      return;
    }

    this.wss = new WebSocketServer({
      server,
      path,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024,
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024,
      },
    });

    this.wss.on("connection", this.handleConnection.bind(this));
    this.startHeartbeat();

    console.log(`[RecommendationWS] ✅ Server initialized on ${path}`);
  }

  /**
   * Shutdown WebSocket server gracefully
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.clients.forEach((client) => {
      client.ws.close(1000, "Server shutting down");
    });
    this.clients.clear();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    console.log("[RecommendationWS] Server shut down");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔌 CONNECTION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, request: any): void {
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      ws.close(4000, "Missing userId");
      return;
    }

    const clientConnection: ClientConnection = {
      ws,
      userId,
      connectedAt: new Date(),
      lastActivityAt: new Date(),
      subscriptions: new Set(),
      metadata: {},
    };

    this.clients.set(userId, clientConnection);

    // Send connection acknowledgment
    this.sendMessage(ws, {
      type: "CONNECTION_ACK",
      payload: {
        userId,
        connectedAt: clientConnection.connectedAt,
        serverTime: new Date(),
      },
      timestamp: new Date(),
    });

    // Set up event handlers
    ws.on("message", (data) => this.handleMessage(userId, data));
    ws.on("close", () => this.handleDisconnection(userId));
    ws.on("error", (error) => this.handleError(userId, error));

    // Send initial recommendations
    this.sendInitialRecommendations(userId);

    console.log(`[RecommendationWS] ✅ Client connected: ${userId} (Total: ${this.clients.size})`);
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(userId: string): void {
    this.clients.delete(userId);
    console.log(`[RecommendationWS] Client disconnected: ${userId} (Remaining: ${this.clients.size})`);
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(userId: string, error: Error): void {
    console.error(`[RecommendationWS] Error for client ${userId}:`, error);
    this.sendError(userId, "WebSocket error occurred");
  }

  /**
   * Handle incoming messages from client
   */
  private async handleMessage(userId: string, data: any): Promise<void> {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(userId);

      if (!client) return;

      client.lastActivityAt = new Date();

      switch (message.type) {
        case "SUBSCRIBE":
          this.handleSubscription(userId, message.payload);
          break;

        case "UNSUBSCRIBE":
          this.handleUnsubscription(userId, message.payload);
          break;

        case "REQUEST_RECOMMENDATIONS":
          await this.handleRecommendationRequest(userId, message.payload);
          break;

        case "USER_ACTION":
          await this.handleUserAction(userId, message.payload);
          break;

        case "HEARTBEAT":
          this.sendMessage(client.ws, {
            type: "HEARTBEAT",
            payload: { serverTime: new Date() },
            timestamp: new Date(),
          });
          break;

        default:
          console.warn(`[RecommendationWS] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`[RecommendationWS] Error handling message from ${userId}:`, error);
      this.sendError(userId, "Failed to process message");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📨 MESSAGE HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Handle subscription requests
   */
  private handleSubscription(userId: string, payload: any): void {
    const client = this.clients.get(userId);
    if (!client) return;

    const { topics } = payload;
    if (Array.isArray(topics)) {
      topics.forEach((topic: string) => client.subscriptions.add(topic));
      console.log(`[RecommendationWS] Client ${userId} subscribed to: ${topics.join(", ")}`);
    }
  }

  /**
   * Handle unsubscription requests
   */
  private handleUnsubscription(userId: string, payload: any): void {
    const client = this.clients.get(userId);
    if (!client) return;

    const { topics } = payload;
    if (Array.isArray(topics)) {
      topics.forEach((topic: string) => client.subscriptions.delete(topic));
      console.log(`[RecommendationWS] Client ${userId} unsubscribed from: ${topics.join(", ")}`);
    }
  }

  /**
   * Handle recommendation requests
   */
  private async handleRecommendationRequest(userId: string, payload: any): Promise<void> {
    try {
      const recommendations = await recommendationEngine.getRecommendations({
        userId,
        productId: payload.productId,
        category: payload.category,
        limit: payload.limit || 10,
        context: payload.context,
      });

      this.sendRecommendations(userId, recommendations);
    } catch (error) {
      console.error(`[RecommendationWS] Error generating recommendations for ${userId}:`, error);
      this.sendError(userId, "Failed to generate recommendations");
    }
  }

  /**
   * Handle user actions (view, cart, purchase, etc.)
   */
  private async handleUserAction(userId: string, payload: RecommendationEvent): Promise<void> {
    try {
      // Process the user action
      console.log(`[RecommendationWS] User action: ${payload.type} by ${userId}`);

      // Generate contextual recommendations based on action
      let recommendations: RecommendationResult | null = null;

      switch (payload.type) {
        case "VIEW_PRODUCT":
          if (payload.productId) {
            recommendations = await recommendationEngine.getRecommendations({
              userId,
              productId: payload.productId,
              limit: 6,
              context: { pageType: "PRODUCT_DETAIL" },
            });
          }
          break;

        case "ADD_TO_CART":
          if (payload.productId) {
            // Get "frequently bought together" recommendations
            recommendations = await recommendationEngine.getFrequentlyBoughtTogether(
              payload.productId,
              5
            );
          }
          break;

        case "SEARCH":
          if (payload.searchQuery) {
            recommendations = await recommendationEngine.getRecommendations({
              userId,
              category: payload.category,
              limit: 8,
              context: {
                pageType: "SEARCH",
                searchQuery: payload.searchQuery,
              },
            });
          }
          break;

        case "FAVORITE":
          // Get new arrivals from favorite farms
          recommendations = await recommendationEngine.getNewArrivalsFromFavoriteFarms(
            userId,
            10
          );
          break;
      }

      if (recommendations) {
        this.sendMessage(this.clients.get(userId)?.ws!, {
          type: "PERSONALIZED_SUGGESTION",
          payload: {
            trigger: payload.type,
            recommendations,
          },
          timestamp: new Date(),
          userId,
        });
      }
    } catch (error) {
      console.error(`[RecommendationWS] Error handling user action:`, error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📤 OUTBOUND MESSAGING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Send initial recommendations on connection
   */
  private async sendInitialRecommendations(userId: string): Promise<void> {
    try {
      const recommendations = await recommendationEngine.getRecommendations({
        userId,
        limit: 10,
        context: { pageType: "HOME" },
      });

      this.sendRecommendations(userId, recommendations);
    } catch (error) {
      console.error(`[RecommendationWS] Error sending initial recommendations:`, error);
    }
  }

  /**
   * Send recommendations to a specific user
   */
  private sendRecommendations(userId: string, recommendations: RecommendationResult): void {
    const client = this.clients.get(userId);
    if (!client) return;

    this.sendMessage(client.ws, {
      type: "RECOMMENDATION_UPDATE",
      payload: recommendations,
      timestamp: new Date(),
      userId,
    });
  }

  /**
   * Send error message to client
   */
  private sendError(userId: string, errorMessage: string): void {
    const client = this.clients.get(userId);
    if (!client) return;

    this.sendMessage(client.ws, {
      type: "ERROR",
      payload: { error: errorMessage },
      timestamp: new Date(),
      userId,
    });
  }

  /**
   * Send message to WebSocket client
   */
  private sendMessage(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error("[RecommendationWS] Error sending message:", error);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📢 BROADCAST METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Broadcast price drop alert to interested users
   */
  async broadcastPriceDropAlert(alert: PriceDropAlert): Promise<void> {
    console.log(`[RecommendationWS] Broadcasting price drop: ${alert.productName}`);

    // Find users who have viewed or wishlisted this product
    // For now, broadcast to all connected users
    this.clients.forEach((client) => {
      if (client.subscriptions.has("price_drops")) {
        this.sendMessage(client.ws, {
          type: "PRICE_DROP_ALERT",
          payload: alert,
          timestamp: new Date(),
          userId: client.userId,
        });
      }
    });
  }

  /**
   * Broadcast stock alert (back in stock)
   */
  async broadcastStockAlert(alert: StockAlert): Promise<void> {
    console.log(`[RecommendationWS] Broadcasting stock alert: ${alert.productName}`);

    this.clients.forEach((client) => {
      if (client.subscriptions.has("stock_alerts")) {
        this.sendMessage(client.ws, {
          type: "STOCK_ALERT",
          payload: alert,
          timestamp: new Date(),
          userId: client.userId,
        });
      }
    });
  }

  /**
   * Broadcast trending products update
   */
  async broadcastTrendingUpdate(trendingProducts: any[]): Promise<void> {
    console.log(`[RecommendationWS] Broadcasting trending update: ${trendingProducts.length} products`);

    this.clients.forEach((client) => {
      if (client.subscriptions.has("trending")) {
        this.sendMessage(client.ws, {
          type: "TRENDING_UPDATE",
          payload: { products: trendingProducts },
          timestamp: new Date(),
          userId: client.userId,
        });
      }
    });
  }

  /**
   * Send new arrival alert from favorite farms
   */
  async sendNewArrivalAlert(userId: string, products: any[]): Promise<void> {
    const client = this.clients.get(userId);
    if (!client) return;

    this.sendMessage(client.ws, {
      type: "NEW_ARRIVAL_ALERT",
      payload: { products },
      timestamp: new Date(),
      userId,
    });
  }

  /**
   * Send cart-based recommendations
   */
  async sendCartRecommendations(userId: string, cartItems: string[]): Promise<void> {
    try {
      const client = this.clients.get(userId);
      if (!client) return;

      // Get recommendations based on cart contents
      const recommendations = await recommendationEngine.getRecommendations({
        userId,
        limit: 6,
        context: {
          pageType: "CART",
          currentCartItems: cartItems,
        },
      });

      this.sendMessage(client.ws, {
        type: "CART_RECOMMENDATION",
        payload: recommendations,
        timestamp: new Date(),
        userId,
      });
    } catch (error) {
      console.error(`[RecommendationWS] Error sending cart recommendations:`, error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 💓 HEARTBEAT & CONNECTION MONITORING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Start heartbeat interval to detect dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();

      this.clients.forEach((client, userId) => {
        const timeSinceLastActivity = now - client.lastActivityAt.getTime();

        // Close connection if no activity for CLIENT_TIMEOUT
        if (timeSinceLastActivity > this.CLIENT_TIMEOUT) {
          console.log(`[RecommendationWS] Closing inactive connection: ${userId}`);
          client.ws.close(1000, "Connection timeout");
          this.clients.delete(userId);
          return;
        }

        // Send heartbeat
        if (client.ws.readyState === WebSocket.OPEN) {
          this.sendMessage(client.ws, {
            type: "HEARTBEAT",
            payload: { serverTime: new Date() },
            timestamp: new Date(),
          });
        }
      });
    }, this.HEARTBEAT_INTERVAL);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 MONITORING & DIAGNOSTICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get server statistics
   */
  getStats(): {
    totalConnections: number;
    activeConnections: number;
    connectionsBySubscription: Record<string, number>;
    averageConnectionDuration: number;
  } {
    const now = Date.now();
    let totalDuration = 0;
    const subscriptionCounts: Record<string, number> = {};

    this.clients.forEach((client) => {
      totalDuration += now - client.connectedAt.getTime();

      client.subscriptions.forEach((sub) => {
        subscriptionCounts[sub] = (subscriptionCounts[sub] || 0) + 1;
      });
    });

    return {
      totalConnections: this.clients.size,
      activeConnections: this.clients.size,
      connectionsBySubscription: subscriptionCounts,
      averageConnectionDuration: this.clients.size > 0 ? totalDuration / this.clients.size : 0,
    };
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.clients.has(userId);
  }

  /**
   * Get connected user IDs
   */
  getConnectedUserIds(): string[] {
    return Array.from(this.clients.keys());
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const recommendationWebSocket = RecommendationWebSocketService.getInstance();
