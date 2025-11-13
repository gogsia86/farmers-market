/**
 * NOTIFICATION TYPES - Divine Agricultural Consciousness
 * Complete type system for notification management
 */

export type NotificationType =
  | "REVIEW_RECEIVED"
  | "REVIEW_RESPONSE"
  | "ORDER_STATUS"
  | "PRODUCT_AVAILABLE"
  | "LOW_INVENTORY"
  | "NEW_MESSAGE"
  | "SYSTEM_ALERT";

export type NotificationChannel = "EMAIL" | "IN_APP" | "PUSH" | "SMS";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;

  // Recipients
  userId: string;

  // Content
  title: string;
  message: string;
  data?: Record<string, any>; // Additional context
  link?: string; // Action link

  // Status
  read: boolean;
  readAt?: Date;

  // Channels
  channels: NotificationChannel[];

  // Metadata
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  id: string;
  userId: string;

  // Channel preferences by type
  reviewReceived: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };
  reviewResponse: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };
  orderStatus: {
    email: boolean;
    inApp: boolean;
    push: boolean;
    sms: boolean;
  };
  productAvailable: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };
  lowInventory: {
    email: boolean;
    inApp: boolean;
  };
  newMessage: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };
  systemAlert: {
    email: boolean;
    inApp: boolean;
  };

  // Global settings
  pauseAll: boolean;
  pauseUntil?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

// API Request/Response Types
export interface CreateNotificationRequest {
  type: NotificationType;
  userId: string;
  title: string;
  message: string;
  priority?: NotificationPriority;
  data?: Record<string, any>;
  link?: string;
  channels?: NotificationChannel[];
}

export interface UpdatePreferencesRequest {
  reviewReceived?: {
    email?: boolean;
    inApp?: boolean;
    push?: boolean;
  };
  reviewResponse?: {
    email?: boolean;
    inApp?: boolean;
    push?: boolean;
  };
  orderStatus?: {
    email?: boolean;
    inApp?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  productAvailable?: {
    email?: boolean;
    inApp?: boolean;
    push?: boolean;
  };
  lowInventory?: {
    email?: boolean;
    inApp?: boolean;
  };
  newMessage?: {
    email?: boolean;
    inApp?: boolean;
    push?: boolean;
  };
  systemAlert?: {
    email?: boolean;
    inApp?: boolean;
  };
  pauseAll?: boolean;
  pauseUntil?: Date;
}

export interface NotificationListResponse {
  notifications: Notification[];
  stats: NotificationStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
