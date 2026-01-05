/**
 * @fileoverview Notification System Types
 * @module lib/notifications/types
 * @description Divine notification type definitions with agricultural consciousness
 *
 * Features:
 * - Toast notifications (transient messages)
 * - Alert banners (persistent warnings/info)
 * - In-app notifications (user activity feed)
 * - Push notifications (mobile/web push)
 * - Email notifications (transactional emails)
 * - Agricultural event notifications (seasonal, harvest, market updates)
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

import type { ReactNode } from "react";

// ============================================================================
// Core Notification Types
// ============================================================================

/**
 * Notification severity levels
 */
export type NotificationSeverity =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "agricultural"; // Special agricultural events

/**
 * Notification types
 */
export type NotificationType =
  | "toast"
  | "banner"
  | "in-app"
  | "push"
  | "email"
  | "sms";

/**
 * Notification priority levels
 */
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

/**
 * Notification status
 */
export type NotificationStatus =
  | "pending"
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "cancelled";

/**
 * Notification channels
 */
export type NotificationChannel =
  | "in-app"
  | "push"
  | "email"
  | "sms"
  | "webhook";

/**
 * Agricultural seasons for themed notifications
 */
export type Season = "spring" | "summer" | "fall" | "winter";

/**
 * Agricultural event types
 */
export type AgriculturalEventType =
  | "planting"
  | "growing"
  | "harvesting"
  | "processing"
  | "market_opening"
  | "market_closing"
  | "weather_alert"
  | "seasonal_change"
  | "crop_ready"
  | "harvest_complete"
  | "product_available"
  | "low_stock"
  | "out_of_stock";

// ============================================================================
// Base Notification Interface
// ============================================================================

/**
 * Base notification structure
 */
export interface BaseNotification {
  /** Unique notification ID */
  id: string;

  /** Notification type */
  type: NotificationType;

  /** Severity level */
  severity: NotificationSeverity;

  /** Priority level */
  priority: NotificationPriority;

  /** Notification status */
  status: NotificationStatus;

  /** Title/heading */
  title: string;

  /** Message content */
  message: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Updated timestamp */
  updatedAt?: Date;

  /** Expiration timestamp (optional) */
  expiresAt?: Date;

  /** Read timestamp (optional) */
  readAt?: Date;

  /** User ID (recipient) */
  userId?: string;

  /** Metadata */
  metadata?: NotificationMetadata;

  /** Actions available */
  actions?: NotificationAction[];
}

/**
 * Notification metadata
 */
export interface NotificationMetadata {
  /** Category/group */
  category?: string;

  /** Tags for filtering */
  tags?: string[];

  /** Source/origin */
  source?: string;

  /** Related entity ID */
  entityId?: string;

  /** Related entity type */
  entityType?: string;

  /** Deep link URL */
  url?: string;

  /** Image URL */
  imageUrl?: string;

  /** Icon */
  icon?: string;

  /** Custom data */
  data?: Record<string, any>;

  /** Agricultural context */
  agricultural?: AgriculturalMetadata;
}

/**
 * Agricultural metadata for notifications
 */
export interface AgriculturalMetadata {
  /** Current season */
  season?: Season;

  /** Event type */
  eventType?: AgriculturalEventType;

  /** Farm ID */
  farmId?: string;

  /** Farm name */
  farmName?: string;

  /** Product ID */
  productId?: string;

  /** Product name */
  productName?: string;

  /** Crop type */
  cropType?: string;

  /** Weather condition */
  weatherCondition?: string;

  /** Temperature */
  temperature?: number;

  /** Custom agricultural data */
  customData?: Record<string, any>;
}

/**
 * Notification action (CTA button)
 */
export interface NotificationAction {
  /** Action ID */
  id: string;

  /** Action label */
  label: string;

  /** Action type */
  type: "primary" | "secondary" | "tertiary";

  /** Action handler */
  onClick?: () => void | Promise<void>;

  /** Navigation URL */
  href?: string;

  /** Icon */
  icon?: string;

  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// Toast Notification Types
// ============================================================================

/**
 * Toast notification configuration
 */
export interface ToastNotification extends Omit<BaseNotification, "type"> {
  type: "toast";

  /** Toast position */
  position?:
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

  /** Duration in milliseconds (0 = persistent) */
  duration?: number;

  /** Dismissible */
  dismissible?: boolean;

  /** Custom component */
  component?: ReactNode;

  /** Animation type */
  animation?: "slide" | "fade" | "bounce" | "grow";
}

/**
 * Toast options (for imperative API)
 */
export interface ToastOptions {
  severity?: NotificationSeverity;
  priority?: NotificationPriority;
  position?: ToastNotification["position"];
  duration?: number;
  dismissible?: boolean;
  actions?: NotificationAction[];
  metadata?: NotificationMetadata;
  icon?: string;
  component?: ReactNode;
}

// ============================================================================
// Banner Notification Types
// ============================================================================

/**
 * Banner notification (persistent alerts)
 */
export interface BannerNotification extends Omit<BaseNotification, "type"> {
  type: "banner";

  /** Banner position */
  position?: "top" | "bottom" | "inline";

  /** Dismissible */
  dismissible?: boolean;

  /** Sticky (stays on scroll) */
  sticky?: boolean;

  /** Show border */
  bordered?: boolean;

  /** Variant */
  variant?: "default" | "outline" | "filled";
}

// ============================================================================
// In-App Notification Types
// ============================================================================

/**
 * In-app notification (notification center)
 */
export interface InAppNotification extends Omit<BaseNotification, "type"> {
  type: "in-app";

  /** Grouped notification ID (for threading) */
  groupId?: string;

  /** Group title */
  groupTitle?: string;

  /** Badge count */
  badgeCount?: number;

  /** Thumbnail URL */
  thumbnailUrl?: string;

  /** Avatar URL */
  avatarUrl?: string;

  /** Action required */
  actionRequired?: boolean;

  /** Archived */
  archived?: boolean;

  /** Pinned */
  pinned?: boolean;
}

// ============================================================================
// Push Notification Types
// ============================================================================

/**
 * Push notification (web/mobile push)
 */
export interface PushNotification extends Omit<BaseNotification, "type"> {
  type: "push";

  /** Notification body (message) */
  body: string;

  /** Icon URL */
  icon?: string;

  /** Badge URL */
  badge?: string;

  /** Image URL */
  image?: string;

  /** Vibration pattern */
  vibrate?: number[];

  /** Sound */
  sound?: string;

  /** Tag (replaces existing notification) */
  tag?: string;

  /** Require interaction */
  requireInteraction?: boolean;

  /** Silent */
  silent?: boolean;

  /** Data payload */
  data?: Record<string, any>;
}

// ============================================================================
// Email Notification Types
// ============================================================================

/**
 * Email notification template
 */
export interface EmailNotification extends Omit<BaseNotification, "type"> {
  type: "email";

  /** Recipient email */
  to: string | string[];

  /** CC recipients */
  cc?: string[];

  /** BCC recipients */
  bcc?: string[];

  /** Subject line */
  subject: string;

  /** HTML body */
  htmlBody: string;

  /** Plain text body */
  textBody: string;

  /** Email template ID */
  templateId?: string;

  /** Template variables */
  templateVariables?: Record<string, any>;

  /** Attachments */
  attachments?: EmailAttachment[];

  /** Reply-to */
  replyTo?: string;

  /** From name/email */
  from?: {
    name: string;
    email: string;
  };
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  /** Filename */
  filename: string;

  /** Content type */
  contentType: string;

  /** Content (base64 or URL) */
  content: string;

  /** Size in bytes */
  size?: number;
}

// ============================================================================
// Notification Preferences
// ============================================================================

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  /** User ID */
  userId: string;

  /** Channel preferences */
  channels: {
    inApp: ChannelPreference;
    push: ChannelPreference;
    email: ChannelPreference;
    sms: ChannelPreference;
  };

  /** Category preferences */
  categories: Record<string, CategoryPreference>;

  /** Quiet hours */
  quietHours?: QuietHours;

  /** Frequency limits */
  frequencyLimits?: FrequencyLimits;
}

/**
 * Channel preference
 */
export interface ChannelPreference {
  /** Enabled */
  enabled: boolean;

  /** Severity filter */
  minSeverity?: NotificationSeverity;

  /** Priority filter */
  minPriority?: NotificationPriority;
}

/**
 * Category preference
 */
export interface CategoryPreference {
  /** Enabled */
  enabled: boolean;

  /** Enabled channels for this category */
  channels: NotificationChannel[];

  /** Digest mode (batch notifications) */
  digestMode?: "instant" | "hourly" | "daily" | "weekly";
}

/**
 * Quiet hours configuration
 */
export interface QuietHours {
  /** Enabled */
  enabled: boolean;

  /** Start time (24h format, e.g., "22:00") */
  startTime: string;

  /** End time (24h format, e.g., "08:00") */
  endTime: string;

  /** Timezone */
  timezone: string;

  /** Days of week (0 = Sunday) */
  daysOfWeek?: number[];

  /** Allow urgent notifications */
  allowUrgent?: boolean;
}

/**
 * Frequency limits
 */
export interface FrequencyLimits {
  /** Max notifications per hour */
  perHour?: number;

  /** Max notifications per day */
  perDay?: number;

  /** Max notifications per category per day */
  perCategoryPerDay?: Record<string, number>;
}

// ============================================================================
// Notification Queue & Batch
// ============================================================================

/**
 * Notification queue item
 */
export interface NotificationQueueItem {
  /** Queue item ID */
  id: string;

  /** Notification */
  notification: BaseNotification;

  /** Scheduled send time */
  scheduledAt?: Date;

  /** Retry count */
  retryCount: number;

  /** Max retries */
  maxRetries: number;

  /** Last error */
  lastError?: string;

  /** Created at */
  createdAt: Date;
}

/**
 * Notification batch
 */
export interface NotificationBatch {
  /** Batch ID */
  id: string;

  /** Notifications */
  notifications: BaseNotification[];

  /** Batch size */
  size: number;

  /** Created at */
  createdAt: Date;

  /** Sent at */
  sentAt?: Date;

  /** Status */
  status: "pending" | "sending" | "sent" | "failed";

  /** Results */
  results?: NotificationBatchResult[];
}

/**
 * Notification batch result
 */
export interface NotificationBatchResult {
  /** Notification ID */
  notificationId: string;

  /** Success */
  success: boolean;

  /** Error message */
  error?: string;

  /** Sent at */
  sentAt?: Date;
}

// ============================================================================
// Notification Manager Types
// ============================================================================

/**
 * Notification manager configuration
 */
export interface NotificationManagerConfig {
  /** Max concurrent notifications */
  maxConcurrent?: number;

  /** Default duration (ms) */
  defaultDuration?: number;

  /** Default position */
  defaultPosition?: ToastNotification["position"];

  /** Max queue size */
  maxQueueSize?: number;

  /** Enable batching */
  enableBatching?: boolean;

  /** Batch size */
  batchSize?: number;

  /** Batch interval (ms) */
  batchInterval?: number;

  /** Enable telemetry */
  enableTelemetry?: boolean;

  /** Agricultural theme */
  agriculturalTheme?: boolean;
}

/**
 * Notification manager state
 */
export interface NotificationManagerState {
  /** Active notifications */
  active: BaseNotification[];

  /** Queued notifications */
  queue: NotificationQueueItem[];

  /** Unread count */
  unreadCount: number;

  /** Is processing */
  isProcessing: boolean;

  /** Last updated */
  lastUpdated: Date;
}

// ============================================================================
// Notification Events
// ============================================================================

/**
 * Notification event types
 */
export type NotificationEventType =
  | "created"
  | "updated"
  | "deleted"
  | "read"
  | "unread"
  | "dismissed"
  | "clicked"
  | "action_clicked"
  | "expired"
  | "sent"
  | "delivered"
  | "failed";

/**
 * Notification event
 */
export interface NotificationEvent {
  /** Event type */
  type: NotificationEventType;

  /** Notification */
  notification: BaseNotification;

  /** Timestamp */
  timestamp: Date;

  /** Additional data */
  data?: Record<string, any>;
}

/**
 * Notification event handler
 */
export type NotificationEventHandler = (event: NotificationEvent) => void;

// ============================================================================
// Notification Provider Types
// ============================================================================

/**
 * Notification context value
 */
export interface NotificationContextValue {
  /** Active notifications */
  notifications: BaseNotification[];

  /** Unread count */
  unreadCount: number;

  /** Show toast */
  toast: (message: string, options?: ToastOptions) => string;

  /** Show banner */
  banner: (notification: Omit<BannerNotification, "id" | "type">) => string;

  /** Add in-app notification */
  notify: (notification: Omit<InAppNotification, "id" | "type">) => string;

  /** Remove notification */
  remove: (id: string) => void;

  /** Clear all notifications */
  clear: () => void;

  /** Mark as read */
  markAsRead: (id: string) => void;

  /** Mark all as read */
  markAllAsRead: () => void;

  /** Subscribe to events */
  subscribe: (handler: NotificationEventHandler) => () => void;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if notification is a toast
 */
export function isToastNotification(
  notification: BaseNotification
): notification is ToastNotification {
  return notification.type === "toast";
}

/**
 * Check if notification is a banner
 */
export function isBannerNotification(
  notification: BaseNotification
): notification is BannerNotification {
  return notification.type === "banner";
}

/**
 * Check if notification is in-app
 */
export function isInAppNotification(
  notification: BaseNotification
): notification is InAppNotification {
  return notification.type === "in-app";
}

/**
 * Check if notification is push
 */
export function isPushNotification(
  notification: BaseNotification
): notification is PushNotification {
  return notification.type === "push";
}

/**
 * Check if notification is email
 */
export function isEmailNotification(
  notification: BaseNotification
): notification is EmailNotification {
  return notification.type === "email";
}

/**
 * Check if notification is agricultural
 */
export function isAgriculturalNotification(
  notification: BaseNotification
): boolean {
  return (
    notification.severity === "agricultural" ||
    !!notification.metadata?.agricultural
  );
}

/**
 * Check if notification is read
 */
export function isNotificationRead(notification: BaseNotification): boolean {
  return !!notification.readAt || notification.status === "read";
}

/**
 * Check if notification is expired
 */
export function isNotificationExpired(notification: BaseNotification): boolean {
  return !!notification.expiresAt && notification.expiresAt < new Date();
}

/**
 * Check if notification is dismissible
 */
export function isNotificationDismissible(
  notification: BaseNotification
): boolean {
  if (isToastNotification(notification)) {
    return notification.dismissible ?? true;
  }
  if (isBannerNotification(notification)) {
    return notification.dismissible ?? true;
  }
  return false;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Notification filter options
 */
export interface NotificationFilter {
  /** Filter by type */
  type?: NotificationType | NotificationType[];

  /** Filter by severity */
  severity?: NotificationSeverity | NotificationSeverity[];

  /** Filter by status */
  status?: NotificationStatus | NotificationStatus[];

  /** Filter by priority */
  priority?: NotificationPriority | NotificationPriority[];

  /** Filter by read status */
  read?: boolean;

  /** Filter by category */
  category?: string | string[];

  /** Filter by tags */
  tags?: string[];

  /** Filter by date range */
  dateRange?: {
    start?: Date;
    end?: Date;
  };

  /** Filter by agricultural event */
  agriculturalEvent?: AgriculturalEventType;
}

/**
 * Notification sort options
 */
export interface NotificationSortOptions {
  /** Sort by field */
  field: "createdAt" | "updatedAt" | "priority" | "severity";

  /** Sort order */
  order: "asc" | "desc";
}

/**
 * Notification pagination
 */
export interface NotificationPagination {
  /** Page number (1-indexed) */
  page: number;

  /** Page size */
  pageSize: number;

  /** Total count */
  total?: number;

  /** Total pages */
  totalPages?: number;
}

/**
 * Notification query result
 */
export interface NotificationQueryResult {
  /** Notifications */
  notifications: BaseNotification[];

  /** Pagination info */
  pagination: NotificationPagination;

  /** Total unread */
  totalUnread: number;
}

// ============================================================================
// Template Types
// ============================================================================

/**
 * Notification template
 */
export interface NotificationTemplate {
  /** Template ID */
  id: string;

  /** Template name */
  name: string;

  /** Template type */
  type: NotificationType;

  /** Template title */
  title: string;

  /** Template message */
  message: string;

  /** Template variables */
  variables: string[];

  /** Default severity */
  defaultSeverity?: NotificationSeverity;

  /** Default priority */
  defaultPriority?: NotificationPriority;

  /** Metadata */
  metadata?: NotificationMetadata;
}

/**
 * Template variable map
 */
export type TemplateVariables = Record<string, string | number | boolean>;

// ============================================================================
// Export all types
// ============================================================================

export type { };

