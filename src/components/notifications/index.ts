/**
 * @fileoverview Notification Components - Barrel Export
 * @module components/notifications
 * @description Divine notification components with agricultural consciousness
 *
 * This file exports all notification components, types, and utilities for easy importing.
 *
 * @example
 * ```tsx
 * // Import components
 * import { Toast, Banner, NotificationProvider, ToastRenderer } from "@/components/notifications";
 *
 * // Import quick variants
 * import { SuccessToast, WarningBanner } from "@/components/notifications";
 *
 * // Use context hook
 * import { useNotificationContext } from "@/components/notifications";
 * ```
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

// ============================================================================
// Toast Components
// ============================================================================

export {
  AgriculturalToast,
  ErrorToast,
  InfoToast,
  SuccessToast,
  Toast,
  ToastContainer,
  WarningToast,
  type AgriculturalToastProps,
  type QuickToastProps,
  type ToastContainerProps,
  type ToastProps,
} from "./Toast";

// ============================================================================
// Banner Components
// ============================================================================

export {
  AgriculturalBanner,
  Banner,
  ErrorBanner,
  InfoBanner,
  SuccessBanner,
  WarningBanner,
  type AgriculturalBannerProps,
  type BannerProps,
  type QuickBannerProps,
} from "./Banner";

// ============================================================================
// Re-export Types for Convenience
// ============================================================================

// ============================================================================
// Provider & Context Components
// ============================================================================

export {
  NotificationProvider,
  useNotificationContext,
  type AgriculturalNotificationConfig,
  type BannerConfig,
  type HarvestNotificationConfig,
  type NotificationContextValue,
  type NotificationProviderProps,
  type SeasonalAlertConfig,
  type ToastConfig,
  type WeatherAlertConfig,
} from "./NotificationProvider";

// ============================================================================
// Renderer Components
// ============================================================================

export { ToastRenderer, type ToastRendererProps } from "./ToastRenderer";

// ============================================================================
// Re-export Types for Convenience
// ============================================================================

export type {
  AgriculturalEventType,
  AgriculturalMetadata,
  BannerNotification,
  // Notification Interfaces
  BaseNotification,
  EmailNotification,
  InAppNotification,
  // Supporting Types
  NotificationAction,
  NotificationFilter,
  NotificationMetadata,
  NotificationPreferences,
  NotificationPriority,
  // Core Types
  NotificationSeverity,
  NotificationStatus,
  NotificationType,
  PushNotification,
  Season,
  ToastNotification,
  // Options
  ToastOptions,
} from "@/lib/notifications/types";

// ============================================================================
// Re-export Utilities for Convenience
// ============================================================================

export {
  // Statistics
  calculateNotificationStats,
  // Filtering & Sorting
  filterNotifications,
  // Time Helpers
  formatNotificationTime,
  generateBatchId,
  // ID Generation
  generateNotificationId,
  getAgriculturalEventIcon,
  getAgriculturalEventMessage,
  // Agricultural Helpers
  getCurrentSeason,
  getPriorityScore,
  getSeasonalColors,
  getSeasonalMessagePrefix,
  getSeverityScore,
  isQuietHours,
  sortNotifications,
} from "@/lib/notifications/utils";

// ============================================================================
// Default Export
// ============================================================================

export { Toast as default } from "./Toast";
