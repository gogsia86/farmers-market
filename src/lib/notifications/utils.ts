/**
 * @fileoverview Notification System Utilities
 * @module lib/notifications/utils
 * @description Divine notification utilities with agricultural consciousness
 *
 * Features:
 * - Notification ID generation
 * - Template rendering
 * - Filtering and sorting
 * - Agricultural helpers
 * - Validation utilities
 * - Time/date helpers
 * - Priority scoring
 * - Batch processing
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

import type {
  AgriculturalEventType,
  AgriculturalMetadata,
  BaseNotification,
  NotificationFilter,
  NotificationPreferences,
  NotificationPriority,
  NotificationSeverity,
  NotificationSortOptions,
  NotificationStatus,
  NotificationTemplate,
  QuietHours,
  Season,
  TemplateVariables,
} from "./types";

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate unique notification ID
 */
export function generateNotificationId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `notif_${timestamp}_${randomPart}`;
}

/**
 * Generate batch ID
 */
export function generateBatchId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `batch_${timestamp}_${randomPart}`;
}

// ============================================================================
// Template Rendering
// ============================================================================

/**
 * Render notification template
 */
export function renderTemplate(
  template: NotificationTemplate,
  variables: TemplateVariables,
): { title: string; message: string } {
  let title = template.title;
  let message = template.message;

  // Replace variables in template
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    title = title.replace(placeholder, String(value));
    message = message.replace(placeholder, String(value));
  }

  return { title, message };
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  template: NotificationTemplate,
  variables: TemplateVariables,
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const required of template.variables) {
    if (!(required in variables)) {
      missing.push(required);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Extract template variables from text
 */
export function extractTemplateVariables(text: string): string[] {
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      variables.push(match[1]);
    }
  }

  return [...new Set(variables)]; // Remove duplicates
}

// ============================================================================
// Filtering and Sorting
// ============================================================================

/**
 * Filter notifications
 */
export function filterNotifications(
  notifications: BaseNotification[],
  filter: NotificationFilter,
): BaseNotification[] {
  return notifications.filter((notification: any) => {
    // Filter by type
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      if (!types.includes(notification.type)) return false;
    }

    // Filter by severity
    if (filter.severity) {
      const severities = Array.isArray(filter.severity)
        ? filter.severity
        : [filter.severity];
      if (!severities.includes(notification.severity)) return false;
    }

    // Filter by status
    if (filter.status) {
      const statuses = Array.isArray(filter.status)
        ? filter.status
        : [filter.status];
      if (!statuses.includes(notification.status)) return false;
    }

    // Filter by priority
    if (filter.priority) {
      const priorities = Array.isArray(filter.priority)
        ? filter.priority
        : [filter.priority];
      if (!priorities.includes(notification.priority)) return false;
    }

    // Filter by read status
    if (filter.read !== undefined) {
      const isRead = !!notification.readAt || notification.status === "read";
      if (filter.read !== isRead) return false;
    }

    // Filter by category
    if (filter.category) {
      const categories = Array.isArray(filter.category)
        ? filter.category
        : [filter.category];
      if (!notification.metadata?.category) return false;
      if (!categories.includes(notification.metadata.category)) return false;
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      if (!notification.metadata?.tags) return false;
      const hasTag = filter.tags.some((tag: any) =>
        notification.metadata!.tags!.includes(tag),
      );
      if (!hasTag) return false;
    }

    // Filter by date range
    if (filter.dateRange) {
      const created = notification.createdAt;
      if (filter.dateRange.start && created < filter.dateRange.start) {
        return false;
      }
      if (filter.dateRange.end && created > filter.dateRange.end) {
        return false;
      }
    }

    // Filter by agricultural event
    if (filter.agriculturalEvent) {
      if (
        notification.metadata?.agricultural?.eventType !==
        filter.agriculturalEvent
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort notifications
 */
export function sortNotifications(
  notifications: BaseNotification[],
  sortOptions: NotificationSortOptions,
): BaseNotification[] {
  const sorted = [...notifications];

  sorted.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortOptions.field) {
      case "createdAt":
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
        break;
      case "updatedAt":
        aValue = a.updatedAt?.getTime() ?? a.createdAt.getTime();
        bValue = b.updatedAt?.getTime() ?? b.createdAt.getTime();
        break;
      case "priority":
        aValue = getPriorityScore(a.priority);
        bValue = getPriorityScore(b.priority);
        break;
      case "severity":
        aValue = getSeverityScore(a.severity);
        bValue = getSeverityScore(b.severity);
        break;
      default:
        return 0;
    }

    if (sortOptions.order === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  return sorted;
}

/**
 * Get priority score for sorting
 */
export function getPriorityScore(priority: NotificationPriority): number {
  const scores: Record<NotificationPriority, number> = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
  };
  return scores[priority] ?? 0;
}

/**
 * Get severity score for sorting
 */
export function getSeverityScore(severity: NotificationSeverity): number {
  const scores: Record<NotificationSeverity, number> = {
    info: 1,
    success: 2,
    warning: 3,
    error: 4,
    agricultural: 2, // Similar to success
  };
  return scores[severity] ?? 0;
}

// ============================================================================
// Agricultural Helpers
// ============================================================================

/**
 * Get current season based on date
 */
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11

  if (month >= 2 && month <= 4) return "spring"; // Mar-May
  if (month >= 5 && month <= 7) return "summer"; // Jun-Aug
  if (month >= 8 && month <= 10) return "fall"; // Sep-Nov
  return "winter"; // Dec-Feb
}

/**
 * Get seasonal colors for notifications
 */
export function getSeasonalColors(season: Season): {
  primary: string;
  secondary: string;
  background: string;
} {
  const colors: Record<
    Season,
    { primary: string; secondary: string; background: string }
  > = {
    spring: {
      primary: "text-green-600",
      secondary: "text-green-500",
      background: "bg-green-50 border-green-200",
    },
    summer: {
      primary: "text-yellow-600",
      secondary: "text-yellow-500",
      background: "bg-yellow-50 border-yellow-200",
    },
    fall: {
      primary: "text-orange-600",
      secondary: "text-orange-500",
      background: "bg-orange-50 border-orange-200",
    },
    winter: {
      primary: "text-blue-600",
      secondary: "text-blue-500",
      background: "bg-blue-50 border-blue-200",
    },
  };

  return colors[season];
}

/**
 * Get seasonal message prefix
 */
export function getSeasonalMessagePrefix(season: Season): string {
  const prefixes: Record<Season, string> = {
    spring: "🌱",
    summer: "☀️",
    fall: "🍂",
    winter: "❄️",
  };

  return prefixes[season];
}

/**
 * Get seasonal message
 * @param season - Season
 * @returns Seasonal message
 */
export function getSeasonalMessage(season: Season): string {
  const messages: Record<Season, string> = {
    spring:
      "Spring is the season of growth and renewal. Perfect time for planting!",
    summer: "Summer brings warmth and abundance. Time to nurture and harvest!",
    fall: "Fall is harvest season. Gather the fruits of your labor!",
    winter:
      "Winter is a time for rest and planning. Prepare for the next cycle!",
  };

  return messages[season];
}

/**
 * Get agricultural event icon
 */
export function getAgriculturalEventIcon(
  eventType: AgriculturalEventType,
): string {
  const icons: Record<AgriculturalEventType, string> = {
    planting: "🌱",
    growing: "🌿",
    harvesting: "🌾",
    processing: "⚙️",
    market_opening: "🏪",
    market_closing: "🔒",
    weather_alert: "⚠️",
    seasonal_change: "🍃",
    crop_ready: "✅",
    harvest_complete: "🎉",
    product_available: "📦",
    low_stock: "⚠️",
    out_of_stock: "❌",
  };

  return icons[eventType] ?? "🌾";
}

/**
 * Get agricultural event color
 * @param eventType - Agricultural event type
 * @returns Tailwind color class
 */
export function getAgriculturalEventColor(
  eventType: AgriculturalEventType,
): string {
  const eventColors: Record<AgriculturalEventType, string> = {
    planting: "green",
    growing: "emerald",
    harvesting: "amber",
    processing: "blue",
    market_opening: "purple",
    market_closing: "purple",
    weather_alert: "red",
    seasonal_change: "teal",
    crop_ready: "green",
    harvest_complete: "amber",
    product_available: "blue",
    low_stock: "orange",
    out_of_stock: "red",
  };

  return eventColors[eventType] ?? "gray";
}

/**
 * Get agricultural event message
 */
export function getAgriculturalEventMessage(
  eventType: AgriculturalEventType,
  metadata?: AgriculturalMetadata,
): string {
  const farmName = metadata?.farmName ?? "the farm";
  const productName = metadata?.productName ?? "product";

  const messages: Record<AgriculturalEventType, string> = {
    planting: `${farmName} has started planting season!`,
    growing: `Crops are growing well at ${farmName}`,
    harvesting: `Harvest time at ${farmName}!`,
    processing: `Processing fresh produce at ${farmName}`,
    market_opening: `${farmName} market is now open`,
    market_closing: `${farmName} market is closing soon`,
    weather_alert: `Weather alert for ${farmName}`,
    seasonal_change: `Season is changing at ${farmName}`,
    crop_ready: `${productName} is ready for harvest at ${farmName}`,
    harvest_complete: `Harvest complete at ${farmName}!`,
    product_available: `${productName} is now available from ${farmName}`,
    low_stock: `${productName} is running low at ${farmName}`,
    out_of_stock: `${productName} is out of stock at ${farmName}`,
  };

  return messages[eventType] ?? `Agricultural update from ${farmName}`;
}

/**
 * Create agricultural metadata
 */
export function createAgriculturalMetadata(
  eventType: AgriculturalEventType,
  overrides: Partial<AgriculturalMetadata> = {},
): AgriculturalMetadata {
  return {
    season: getCurrentSeason(),
    eventType,
    ...overrides,
  };
}

// ============================================================================
// Time and Date Helpers
// ============================================================================

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(
  quietHours: QuietHours | undefined,
  date: Date = new Date(),
): boolean {
  if (!quietHours || !quietHours.enabled) return false;

  // Check day of week
  if (quietHours.daysOfWeek && quietHours.daysOfWeek.length > 0) {
    const dayOfWeek = date.getDay();
    if (!quietHours.daysOfWeek.includes(dayOfWeek)) return false;
  }

  // Parse time strings
  const [startHour = 0, startMinute = 0] = quietHours.startTime
    .split(":")
    .map(Number);
  const [endHour = 0, endMinute = 0] = quietHours.endTime
    .split(":")
    .map(Number);

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Format notification timestamp
 */
export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

/**
 * Calculate notification expiry date from TTL in seconds
 * @param ttl - Time to live in seconds
 * @param date - Base date (defaults to current time)
 * @returns Expiry date
 */
export function calculateExpiryDate(ttl: number, date?: Date): Date {
  const baseDate = date || new Date();
  const expiry = new Date(baseDate.getTime() + ttl * 1000);
  return expiry;
}

/**
 * Calculate notification expiry date from priority
 * @param priority - Notification priority
 * @param daysToExpire - Optional days to expiration
 * @returns Expiry date or undefined
 */
export function calculateExpiryDateFromPriority(
  priority: NotificationPriority,
  daysToExpire?: number,
): Date | undefined {
  if (daysToExpire !== undefined) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + daysToExpire);
    return expiry;
  }

  // Default expiry based on priority
  const expiryDays: Record<NotificationPriority, number> = {
    low: 7,
    medium: 14,
    high: 30,
    urgent: 60,
  };

  const days = expiryDays[priority];
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

/**
 * Check if notification is expired
 * @param notification - Notification to check
 * @returns True if expired
 */
export function isExpired(notification: BaseNotification): boolean {
  if (!notification.expiresAt) return false;
  return new Date(notification.expiresAt) < new Date();
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate notification title
 */
export function validateTitle(title: string): {
  valid: boolean;
  error?: string;
} {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: "Title is required" };
  }

  if (title.length > 200) {
    return { valid: false, error: "Title must be 200 characters or less" };
  }

  return { valid: true };
}

/**
 * Validate notification message
 */
export function validateMessage(message: string): {
  valid: boolean;
  error?: string;
} {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: "Message is required" };
  }

  if (message.length > 1000) {
    return { valid: false, error: "Message must be 1000 characters or less" };
  }

  return { valid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate notification preferences
 */
export function validatePreferences(preferences: NotificationPreferences): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate quiet hours
  if (preferences.quietHours?.enabled) {
    const { startTime, endTime } = preferences.quietHours;
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      errors.push("Invalid quiet hours start time format (expected HH:MM)");
    }
    if (!/^\d{2}:\d{2}$/.test(endTime)) {
      errors.push("Invalid quiet hours end time format (expected HH:MM)");
    }
  }

  // Validate frequency limits
  if (preferences.frequencyLimits) {
    if (
      preferences.frequencyLimits.perHour !== undefined &&
      preferences.frequencyLimits.perHour < 0
    ) {
      errors.push("Frequency limit per hour must be non-negative");
    }
    if (
      preferences.frequencyLimits.perDay !== undefined &&
      preferences.frequencyLimits.perDay < 0
    ) {
      errors.push("Frequency limit per day must be non-negative");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Preference Helpers
// ============================================================================

/**
 * Check if notification should be sent based on preferences
 */
export function shouldSendNotification(
  notification: BaseNotification,
  preferences?: NotificationPreferences,
): boolean {
  // If no preferences, allow all
  if (!preferences) return true;

  // Check channel preferences
  const channelKey =
    notification.type === "in-app" ? "inApp" : notification.type;
  const channelPref =
    preferences.channels?.[channelKey as keyof typeof preferences.channels];

  // If channel preferences exist but channel is disabled, block notification
  if (preferences.channels && Object.keys(preferences.channels).length > 0) {
    if (!channelPref?.enabled) return false;
  }

  // Check severity filter
  if (channelPref?.minSeverity) {
    const notifScore = getSeverityScore(notification.severity);
    const minScore = getSeverityScore(channelPref.minSeverity);
    if (notifScore < minScore) return false;
  }

  // Check priority filter
  if (channelPref?.minPriority) {
    const notifScore = getPriorityScore(notification.priority);
    const minScore = getPriorityScore(channelPref.minPriority);
    if (notifScore < minScore) return false;
  }

  // Check category preferences
  const category = notification.metadata?.category;
  if (category && preferences.categories[category]) {
    const categoryPref = preferences.categories[category];
    if (!categoryPref.enabled) return false;

    // Check if notification type is allowed for this category
    const channel =
      notification.type === "in-app" ? "in-app" : notification.type;
    if (!categoryPref.channels.includes(channel as any)) return false;
  }

  // Check quiet hours
  if (preferences.quietHours?.enabled) {
    const inQuietHours = isQuietHours(preferences.quietHours);
    if (inQuietHours) {
      // Allow urgent notifications during quiet hours if configured
      if (
        !(
          preferences.quietHours.allowUrgent &&
          notification.priority === "urgent"
        )
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get default notification preferences
 */
export function getDefaultPreferences(userId: string): NotificationPreferences {
  return {
    userId,
    channels: {
      inApp: { enabled: true },
      push: { enabled: true, minPriority: "medium" },
      email: { enabled: true, minPriority: "high" },
      sms: { enabled: false, minPriority: "urgent" },
    },
    categories: {},
    quietHours: {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00",
      timezone: "UTC",
      allowUrgent: true,
    },
    frequencyLimits: {
      perHour: 10,
      perDay: 50,
    },
  };
}

// ============================================================================
// Batch Processing Helpers
// ============================================================================

/**
 * Group notifications by category
 */
export function groupByCategory(
  notifications: BaseNotification[],
): Map<string, BaseNotification[]> {
  const groups = new Map<string, BaseNotification[]>();

  for (const notification of notifications) {
    const category = notification.metadata?.category ?? "uncategorized";
    const existing = groups.get(category) ?? [];
    groups.set(category, [...existing, notification]);
  }

  return groups;
}

/**
 * Group notifications by user
 */
export function groupByUser(
  notifications: BaseNotification[],
): Map<string, BaseNotification[]> {
  const groups = new Map<string, BaseNotification[]>();

  for (const notification of notifications) {
    const userId = notification.userId ?? "anonymous";
    const existing = groups.get(userId) ?? [];
    groups.set(userId, [...existing, notification]);
  }

  return groups;
}

/**
 * Chunk array into batches
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// Deduplication Helpers
// ============================================================================

/**
 * Deduplicate notifications by content
 */
export function deduplicateNotifications(
  notifications: BaseNotification[],
): BaseNotification[] {
  const groups = new Map<string, BaseNotification[]>();

  for (const notification of notifications) {
    // Create deduplication key based on title and message
    const key = `${notification.title}:${notification.message}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(notification);
  }

  // Keep most recent from each group
  const unique: BaseNotification[] = [];
  for (const group of groups.values()) {
    const mostRecent = group.reduce((latest: any, current: any) => {
      return current.createdAt > latest.createdAt ? current : latest;
    });
    unique.push(mostRecent);
  }

  return unique;
}

/**
 * Find duplicate notifications
 */
export function findDuplicates(
  notifications: BaseNotification[],
): BaseNotification[][] {
  const groups = new Map<string, BaseNotification[]>();

  for (const notification of notifications) {
    const key = `${notification.title}:${notification.message}:${notification.userId}`;
    const existing = groups.get(key) ?? [];
    groups.set(key, [...existing, notification]);
  }

  return Array.from(groups.values()).filter((group: any) => group.length > 1);
}

// ============================================================================
// Statistics Helpers
// ============================================================================

/**
 * Calculate notification statistics
 */
export function calculateNotificationStats(notifications: BaseNotification[]): {
  total: number;
  unread: number;
  bySeverity: Record<NotificationSeverity, number>;
  byPriority: Record<NotificationPriority, number>;
  byType: Record<string, number>;
  avgAge: number;
} {
  const stats = {
    total: notifications.length,
    unread: 0,
    bySeverity: {
      info: 0,
      success: 0,
      warning: 0,
      error: 0,
      agricultural: 0,
    } as Record<NotificationSeverity, number>,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    } as Record<NotificationPriority, number>,
    byType: {} as Record<string, number>,
    avgAge: 0,
  };

  if (notifications.length === 0) return stats;

  let totalAge = 0;

  for (const notification of notifications) {
    // Count unread
    if (!notification.readAt && notification.status !== "read") {
      stats.unread++;
    }

    // Count by severity
    stats.bySeverity[notification.severity]++;

    // Count by priority
    stats.byPriority[notification.priority]++;

    // Count by type
    stats.byType[notification.type] =
      (stats.byType[notification.type] ?? 0) + 1;

    // Calculate age
    const age = Date.now() - notification.createdAt.getTime();
    totalAge += age;
  }

  stats.avgAge = totalAge / notifications.length;

  return stats;
}

/**
 * Get notification statistics with read/unread tracking
 * @param notifications - Array of notifications
 * @returns Statistics object
 */
export function getNotificationStats(notifications: BaseNotification[]): {
  total: number;
  read: number;
  unread: number;
  readRate: number;
  byStatus: Record<NotificationStatus, number>;
} {
  const stats = {
    total: notifications.length,
    read: 0,
    unread: 0,
    readRate: 0,
    byStatus: {
      pending: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    } as Record<NotificationStatus, number>,
  };

  if (notifications.length === 0) return stats;

  for (const notification of notifications) {
    // Count read/unread
    if (notification.readAt) {
      stats.read++;
    } else {
      stats.unread++;
    }

    // Count by status
    if (notification.status) {
      stats.byStatus[notification.status]++;
    }
  }

  stats.readRate = stats.read / stats.total;

  return stats;
}

/**
 * Group notifications by date
 * @param notifications - Array of notifications
 * @returns Notifications grouped by date string
 */
export function groupNotificationsByDate(
  notifications: BaseNotification[],
): Record<string, BaseNotification[]> {
  const groups: Record<string, BaseNotification[]> = {};

  for (const notification of notifications) {
    const dateKey = notification.createdAt.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);
  }

  return groups;
}

/**
 * Group notifications by type
 * @param notifications - Array of notifications
 * @returns Notifications grouped by type
 */
export function groupNotificationsByType(
  notifications: BaseNotification[],
): Record<string, BaseNotification[]> {
  const groups: Record<string, BaseNotification[]> = {};

  for (const notification of notifications) {
    const type = notification.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(notification);
  }

  return groups;
}

/**
 * Batch notifications into groups
 * @param notifications - Array of notifications
 * @param batchSize - Size of each batch
 * @returns Array of batches
 */
export function batchNotifications(
  notifications: BaseNotification[],
  batchSize: number,
): Array<{ id: string; notifications: BaseNotification[]; createdAt: Date }> {
  const batches: Array<{
    id: string;
    notifications: BaseNotification[];
    createdAt: Date;
  }> = [];

  for (let i = 0; i < notifications.length; i += batchSize) {
    const batchNotifications = notifications.slice(i, i + batchSize);
    batches.push({
      id: generateBatchId(),
      notifications: batchNotifications,
      createdAt: new Date(),
    });
  }

  return batches;
}

// ============================================================================
// Export all utilities
// ============================================================================

export {};
