/**
 * DIVINE REAL-TIME NOTIFICATION SYSTEM
 * WebSocket-based notifications with agricultural consciousness
 */

import { StructuredLogger } from "@/lib/monitoring/logger";
import type { IncomingMessage } from "http";
import type { RawData } from "ws";
import { WebSocket, WebSocketServer } from "ws";

export interface NotificationPayload {
  id: string;
  type:
    | "ORDER_UPDATE"
    | "PRODUCT_AVAILABLE"
    | "FARM_UPDATE"
    | "SEASONAL_ALERT"
    | "HARVEST_READY"
    | "WEATHER_ALERT"
    | "PRICE_CHANGE";
  userId: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  timestamp: Date;
  agriculturalContext?: {
    season: "SPRING" | "SUMMER" | "FALL" | "WINTER";
    farmId?: string;
    productId?: string;
    weatherCondition?: string;
  };
  read: boolean;
  actionUrl?: string;
}

export interface ConnectionMetadata {
  userId: string;
  userRole: "FARMER" | "CUSTOMER" | "ADMIN";
  connectedAt: Date;
  lastActivity: Date;
  subscriptions: string[];
  agriculturalPreferences: {
    favoriteSeasons: string[];
    followedFarms: string[];
    productCategories: string[];
  };
}

/**
 * DIVINE REAL-TIME NOTIFICATION SYSTEM
 * WebSocket server with agricultural consciousness
 */
export class RealtimeNotificationSystem {
  private readonly logger: StructuredLogger;
  private wss: WebSocketServer | null = null;
  private connections: Map<
    string,
    { ws: WebSocket; metadata: ConnectionMetadata }
  > = new Map();
  private notificationQueue: Map<string, NotificationPayload[]> = new Map();

  constructor() {
    this.logger = new StructuredLogger("RealtimeNotifications");
  }

  /**
   * INITIALIZE WEBSOCKET SERVER
   */
  async initialize(port: number = 3001): Promise<void> {
    try {
      this.wss = new WebSocketServer({ port });

      this.wss.on(
        "connection",
        (ws: WebSocket, request: IncomingMessage): void => {
          this.handleConnection(ws, request);
        },
      );

      this.wss.on("error", (error: Error): void => {
        this.logger.error("WebSocket server error", {
          error: error instanceof Error ? error.message : String(error),
        });
      });

      // Start background tasks
      this.startHeartbeat();
      this.startQueueProcessor();
      this.startSeasonalNotifications();

      this.logger.info("Real-time notification system initialized", { port });
    } catch (error) {
      this.logger.error(
        "Failed to initialize notification system",
        error as Error,
      );
      throw error;
    }
  }

  /**
   * HANDLE NEW CONNECTION
   */
  private async handleConnection(
    ws: WebSocket,
    request: IncomingMessage,
  ): Promise<void> {
    const connectionId = this.generateConnectionId();

    // Extract user info from request (e.g., from query params or headers)
    const userId = this.extractUserId(request);

    if (!userId) {
      ws.close(1008, "Authentication required");
      return;
    }

    // Create connection metadata
    const metadata: ConnectionMetadata = {
      userId,
      userRole: await this.getUserRole(userId),
      connectedAt: new Date(),
      lastActivity: new Date(),
      subscriptions: [],
      agriculturalPreferences: await this.loadAgriculturalPreferences(userId),
    };

    this.connections.set(connectionId, { ws, metadata });

    this.logger.info("New WebSocket connection", {
      connectionId,
      userId,
      userRole: metadata.userRole,
    });

    // Set up message handlers
    ws.on("message", (data: RawData): void => {
      this.handleMessage(connectionId, data);
    });
    ws.on("close", (): void => {
      this.handleDisconnection(connectionId);
    });
    ws.on("error", (error: Error): void => {
      this.handleError(connectionId, error);
    });

    // Send pending notifications
    await this.sendPendingNotifications(connectionId);

    // Send welcome message
    this.sendToConnection(connectionId, {
      type: "CONNECTED",
      message: "Connected to real-time notification system",
      timestamp: new Date(),
      agriculturalGreeting: this.getSeasonalGreeting(),
    });
  }

  /**
   * HANDLE INCOMING MESSAGE
   */
  private handleMessage(connectionId: string, data: RawData): void {
    try {
      const rawData = data.toString();
      const message = JSON.parse(rawData);
      const connection = this.connections.get(connectionId);

      if (!connection) return;

      // Update activity
      connection.metadata.lastActivity = new Date();

      switch (message.type) {
        case "SUBSCRIBE":
          this.handleSubscribe(connectionId, message.channels);
          break;
        case "UNSUBSCRIBE":
          this.handleUnsubscribe(connectionId, message.channels);
          break;
        case "MARK_READ":
          this.handleMarkRead(connectionId, message.notificationId);
          break;
        case "PING":
          this.sendToConnection(connectionId, {
            type: "PONG",
            timestamp: new Date(),
          });
          break;
        default:
          this.logger.warn("Unknown message type", { type: message.type });
      }
    } catch (error) {
      this.logger.error(
        `Error handling message for ${connectionId}`,
        error as Error,
      );
    }
  }

  /**
   * HANDLE SUBSCRIPTION
   */
  private handleSubscribe(connectionId: string, channels: string[]): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    channels.forEach((channel: any) => {
      if (!connection.metadata.subscriptions.includes(channel)) {
        connection.metadata.subscriptions.push(channel);
      }
    });

    this.logger.debug("User subscribed to channels", {
      userId: connection.metadata.userId,
      channels,
    });
  }

  /**
   * HANDLE UNSUBSCRIPTION
   */
  private handleUnsubscribe(connectionId: string, channels: string[]): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.metadata.subscriptions =
      connection.metadata.subscriptions.filter(
        (sub) => !channels.includes(sub),
      );
  }

  /**
   * HANDLE MARK AS READ
   */
  private async handleMarkRead(
    _connectionId: string,
    notificationId: string,
  ): Promise<void> {
    try {
      // Update notification in database
      // await database.notification.update({
      //   where: { id: notificationId },
      //   data: { read: true, readAt: new Date() }
      // });

      this.logger.debug("Notification marked as read", { notificationId });
    } catch (error) {
      this.logger.error("Error marking notification as read", error as Error);
    }
  }

  /**
   * SEND NOTIFICATION
   * Sends notification to specific user or all users
   */
  async sendNotification(
    notification: Omit<NotificationPayload, "id" | "timestamp" | "read">,
  ): Promise<void> {
    const fullNotification: NotificationPayload = {
      ...notification,
      id: this.generateNotificationId(),
      timestamp: new Date(),
      read: false,
    };

    // Store notification in database
    await this.storeNotification(fullNotification);

    // Send to connected users
    const connections = Array.from(this.connections.entries()).filter(
      ([_, conn]) => conn.metadata.userId === notification.userId,
    );

    if (connections.length > 0) {
      // User is connected - send immediately
      connections.forEach(([connectionId, _]) => {
        this.sendToConnection(connectionId, {
          type: "NOTIFICATION",
          payload: fullNotification,
        });
      });
    } else {
      // User is offline - queue notification
      this.queueNotification(notification.userId, fullNotification);
    }

    this.logger.debug("Notification sent", {
      notificationId: fullNotification.id,
      userId: notification.userId,
      type: notification.type,
    });
  }

  /**
   * BROADCAST NOTIFICATION
   * Sends to all connected users matching criteria
   */
  async broadcastNotification(
    notification: Omit<
      NotificationPayload,
      "id" | "timestamp" | "read" | "userId"
    >,
    filter?: (metadata: ConnectionMetadata) => boolean,
  ): Promise<void> {
    const connections = filter
      ? Array.from(this.connections.entries()).filter(([_, conn]) =>
          filter(conn.metadata),
        )
      : Array.from(this.connections.entries());

    const fullNotification: Omit<NotificationPayload, "userId"> = {
      ...notification,
      id: this.generateNotificationId(),
      timestamp: new Date(),
      read: false,
    };

    connections.forEach(([connectionId, conn]) => {
      this.sendToConnection(connectionId, {
        type: "NOTIFICATION",
        payload: {
          ...fullNotification,
          userId: conn.metadata.userId,
        },
      });
    });

    this.logger.info("Broadcast notification sent", {
      recipientCount: connections.length,
      type: notification.type,
    });
  }

  /**
   * SEASONAL NOTIFICATIONS
   * Automatically send notifications based on agricultural seasons
   */
  private startSeasonalNotifications(): void {
    // Check every hour for seasonal events
    setInterval(async () => {
      const currentSeason = this.getCurrentSeason();

      // Send seasonal alerts to farmers
      await this.broadcastNotification(
        {
          type: "SEASONAL_ALERT",
          title: `${currentSeason} Season Update`,
          message: this.getSeasonalMessage(currentSeason),
          data: { season: currentSeason },
          priority: "MEDIUM",
          agriculturalContext: {
            season: currentSeason,
          },
        },
        (metadata) => metadata.userRole === "FARMER",
      );
    }, 3600000); // Every hour
  }

  /**
   * HEARTBEAT
   * Keep connections alive and detect disconnections
   */
  private startHeartbeat(): void {
    setInterval(() => {
      this.connections.forEach((connection, connectionId) => {
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.ping();
        } else {
          this.handleDisconnection(connectionId);
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * QUEUE PROCESSOR
   * Process queued notifications for offline users
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      this.notificationQueue.forEach((notifications, userId) => {
        const connections = Array.from(this.connections.values()).filter(
          (conn) => conn.metadata.userId === userId,
        );

        if (connections.length > 0) {
          // User came online - send queued notifications
          notifications.forEach((notification: any) => {
            connections.forEach((conn: any) => {
              if (conn.ws.readyState === WebSocket.OPEN) {
                conn.ws.send(
                  JSON.stringify({
                    type: "NOTIFICATION",
                    payload: notification,
                  }),
                );
              }
            });
          });

          // Clear queue
          this.notificationQueue.delete(userId);
        }
      });
    }, 5000); // Every 5 seconds
  }

  /**
   * SEND TO CONNECTION
   */
  private sendToConnection(connectionId: string, data: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      connection.ws.send(JSON.stringify(data));
    } catch (error) {
      this.logger.error(
        `Error sending to connection ${connectionId}`,
        error as Error,
      );
    }
  }

  /**
   * HANDLE DISCONNECTION
   */
  private handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.logger.info("WebSocket disconnected", {
        connectionId,
        userId: connection.metadata.userId,
        connectedDuration:
          Date.now() - connection.metadata.connectedAt.getTime(),
      });
    }

    this.connections.delete(connectionId);
  }

  /**
   * HANDLE ERROR
   */
  private handleError(connectionId: string, error: Error): void {
    this.logger.error(`WebSocket connection error for ${connectionId}`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  /**
   * SEND PENDING NOTIFICATIONS
   */
  private async sendPendingNotifications(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const pendingNotifications =
      this.notificationQueue.get(connection.metadata.userId) || [];

    pendingNotifications.forEach((notification: any) => {
      this.sendToConnection(connectionId, {
        type: "NOTIFICATION",
        payload: notification,
      });
    });

    // Clear queue
    this.notificationQueue.delete(connection.metadata.userId);
  }

  /**
   * QUEUE NOTIFICATION
   */
  private queueNotification(
    userId: string,
    notification: NotificationPayload,
  ): void {
    if (!this.notificationQueue.has(userId)) {
      this.notificationQueue.set(userId, []);
    }

    this.notificationQueue.get(userId)!.push(notification);

    // Limit queue size
    const queue = this.notificationQueue.get(userId)!;
    if (queue.length > 100) {
      queue.shift(); // Remove oldest
    }
  }

  /**
   * STORE NOTIFICATION
   */
  private async storeNotification(
    _notification: NotificationPayload,
  ): Promise<void> {
    // Store in database for persistence
    // await database.notification.create({ data: notification });
  }

  // Helper methods
  private extractUserId(_request: IncomingMessage): string | null {
    // Extract from query params or JWT token
    return "user-123"; // Placeholder
  }

  private async getUserRole(
    _userId: string,
  ): Promise<"FARMER" | "CUSTOMER" | "ADMIN"> {
    // Fetch from database
    return "CUSTOMER"; // Placeholder
  }

  private async loadAgriculturalPreferences(_userId: string) {
    // Load from database - userId will be used when DB integration is complete
    return {
      favoriteSeasons: ["SPRING", "SUMMER"],
      followedFarms: [],
      productCategories: ["VEGETABLES", "FRUITS"],
    };
  }

  private getCurrentSeason(): "SPRING" | "SUMMER" | "FALL" | "WINTER" {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }

  private getSeasonalGreeting(): string {
    const season = this.getCurrentSeason();
    const greetings = {
      SPRING: "Welcome to spring planting season! 🌱",
      SUMMER: "Welcome to summer growing season! ☀️",
      FALL: "Welcome to fall harvest season! 🍂",
      WINTER: "Welcome to winter planning season! ❄️",
    };
    return greetings[season];
  }

  private getSeasonalMessage(
    season: "SPRING" | "SUMMER" | "FALL" | "WINTER",
  ): string {
    const messages = {
      SPRING: "Time to prepare fields and start planting!",
      SUMMER: "Monitor crop growth and maintain irrigation",
      FALL: "Harvest season is here - prepare for peak activity",
      WINTER: "Plan next season and maintain equipment",
    };
    return messages[season];
  }

  private generateConnectionId(): string {
    return `CONN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNotificationId(): string {
    return `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * SHUTDOWN
   */
  async shutdown(): Promise<void> {
    if (this.wss) {
      this.connections.forEach((connection: any) => {
        connection.ws.close(1000, "Server shutting down");
      });

      this.wss.close();
      this.logger.info("Real-time notification system shut down");
    }
  }
}

/**
 * DIVINE NOTIFICATION FACTORY
 */
export class NotificationSystemFactory {
  private static instance: RealtimeNotificationSystem | null = null;

  static getInstance(): RealtimeNotificationSystem {
    if (!this.instance) {
      this.instance = new RealtimeNotificationSystem();
    }
    return this.instance;
  }
}
