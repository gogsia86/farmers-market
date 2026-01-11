/**
 * @fileoverview Notification Provider - Global State Management
 * @module components/notifications/NotificationProvider
 * @description Divine notification context provider with agricultural consciousness
 *
 * Features:
 * - Global notification state management
 * - Context API for notifications
 * - Toast and banner rendering
 * - Auto-persistence to localStorage
 * - Agricultural event handling
 * - Quiet hours support
 * - Preference management
 * - Animation provider integration with Framer Motion
 *
 * @version 2.0.0 - Framer Motion Integration
 * @since 2024-11-15
 */

"use client";

import { AnimationProvider } from "./context/AnimationContext";

import { logger } from "@/lib/monitoring/logger";
import type {
  AgriculturalEventType,
  AgriculturalMetadata,
  BannerNotification,
  BaseNotification,
  NotificationPreferences,
  Season,
  ToastNotification,
} from "@/lib/notifications/types";
import {
  generateNotificationId,
  getCurrentSeason,
  isQuietHours,
  shouldSendNotification,
} from "@/lib/notifications/utils";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface NotificationContextValue {
  // State
  notifications: BaseNotification[];
  toasts: ToastNotification[];
  banners: BannerNotification[];
  unreadCount: number;

  // Actions
  addNotification: (
    notification: Omit<BaseNotification, "id" | "createdAt" | "status">,
  ) => BaseNotification;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;

  // Toast methods
  toast: (config: ToastConfig) => ToastNotification;
  success: (title: string, message?: string) => ToastNotification;
  error: (title: string, message?: string) => ToastNotification;
  warning: (title: string, message?: string) => ToastNotification;
  info: (title: string, message?: string) => ToastNotification;
  dismissToast: (id: string) => void;

  // Banner methods
  showBanner: (config: BannerConfig) => BannerNotification;
  hideBanner: (id: string) => void;
  hideAllBanners: () => void;

  // Agricultural methods
  sendAgriculturalNotification: (
    config: AgriculturalNotificationConfig,
  ) => BaseNotification;
  sendSeasonalAlert: (config: SeasonalAlertConfig) => BaseNotification;
  sendHarvestNotification: (
    config: HarvestNotificationConfig,
  ) => BaseNotification;
  sendWeatherAlert: (config: WeatherAlertConfig) => BaseNotification;

  // Preferences
  preferences?: NotificationPreferences;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
}

export interface ToastConfig {
  title: string;
  message?: string;
  variant?: "info" | "success" | "warning" | "error" | "agricultural";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

export interface BannerConfig {
  title: string;
  message?: string;
  variant?: "info" | "success" | "warning" | "error" | "agricultural";
  position?: "top" | "bottom";
  sticky?: boolean;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface AgriculturalNotificationConfig {
  title: string;
  message: string;
  eventType: AgriculturalEventType;
  season?: Season;
  cropName?: string;
  metadata?: Record<string, any>;
}

export interface SeasonalAlertConfig {
  title: string;
  message: string;
  season: Season;
  metadata?: Record<string, any>;
}

export interface HarvestNotificationConfig {
  title: string;
  message: string;
  cropName: string;
  metadata?: Record<string, any>;
}

export interface WeatherAlertConfig {
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  metadata?: Record<string, any>;
}

export interface NotificationProviderProps {
  children: React.ReactNode;
  persistKey?: string;
  maxToasts?: number;
  maxBanners?: number;
  defaultDuration?: number;
  preferences?: NotificationPreferences;
}

// ============================================================================
// Context
// ============================================================================

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

// ============================================================================
// Provider Component
// ============================================================================

export function NotificationProvider({
  children,
  persistKey = "app-notifications",
  maxToasts = 5,
  maxBanners = 3,
  defaultDuration = 5000,
  preferences: initialPreferences,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<BaseNotification[]>([]);
  const [preferences, setPreferences] = useState<
    NotificationPreferences | undefined
  >(initialPreferences);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(persistKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const restored = parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: n.updatedAt ? new Date(n.updatedAt) : undefined,
          readAt: n.readAt ? new Date(n.readAt) : undefined,
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
        }));
        setNotifications(restored);
      }
    } catch (error) {
      logger.error("Failed to restore notifications:", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [persistKey]);

  // Persist notifications to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(persistKey, JSON.stringify(notifications));
    } catch (error) {
      logger.error("Failed to persist notifications:", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [notifications, persistKey]);

  // Calculate unread count
  const unreadCount = notifications.filter(
    (n) => !n.readAt && n.status !== "read",
  ).length;

  // Filter toasts and banners
  const toasts = notifications.filter(
    (n) => n.type === "toast",
  ) as ToastNotification[];

  const banners = notifications.filter(
    (n) => n.type === "banner",
  ) as BannerNotification[];

  // ============================================================================
  // Core Actions
  // ============================================================================

  const addNotification = useCallback(
    (
      notification: Omit<BaseNotification, "id" | "createdAt" | "status">,
    ): BaseNotification => {
      const newNotification: BaseNotification = {
        ...notification,
        id: generateNotificationId(),
        createdAt: new Date(),
        status: "pending",
      };

      // Check if should send based on preferences
      if (
        preferences &&
        !shouldSendNotification(newNotification, preferences)
      ) {
        logger.info("Notification blocked by preferences", {
          id: { data: newNotification.id },
        });
        return newNotification;
      }

      // Check quiet hours for non-urgent notifications
      if (
        preferences &&
        newNotification.priority !== "urgent" &&
        isQuietHours(preferences.quietHours)
      ) {
        logger.info("Notification queued (quiet hours)", {
          id: newNotification.id,
        });
        // Queue for later (implement queue logic as needed)
        return newNotification;
      }

      setNotifications((prev) => {
        const updated = [...prev, newNotification];

        // Limit toasts
        if (newNotification.type === "toast") {
          const toastCount = updated.filter(
            (n: any) => n.type === "toast",
          ).length;
          if (toastCount > maxToasts) {
            // Remove oldest toast
            const toastIndex = updated.findIndex(
              (n: any) => n.type === "toast",
            );
            if (toastIndex !== -1) {
              updated.splice(toastIndex, 1);
            }
          }
        }

        // Limit banners
        if (newNotification.type === "banner") {
          const bannerCount = updated.filter(
            (n: any) => n.type === "banner",
          ).length;
          if (bannerCount > maxBanners) {
            // Remove oldest banner
            const bannerIndex = updated.findIndex(
              (n: any) => n.type === "banner",
            );
            if (bannerIndex !== -1) {
              updated.splice(bannerIndex, 1);
            }
          }
        }

        return updated;
      });

      return newNotification;
    },
    [preferences, maxToasts, maxBanners],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n: any) => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n: any) =>
        n.id === id ? { ...n, readAt: new Date(), status: "read" as const } : n,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n: any) => ({
        ...n,
        readAt: new Date(),
        status: "read" as const,
      })),
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // ============================================================================
  // Toast Methods
  // ============================================================================

  const toast = useCallback(
    (config: ToastConfig): ToastNotification => {
      const baseNotification = addNotification({
        type: "toast",
        severity: config.variant || "info",
        priority: "medium",
        title: config.title,
        message: config.message || "",
        metadata: {
          data: config.icon ? { icon: config.icon } : undefined,
        },
      });

      const notification: ToastNotification = {
        ...baseNotification,
        type: "toast",
        position: config.position || "top-right",
        duration: config.duration || defaultDuration,
        dismissible: true,
      };

      // Auto-dismiss after duration
      const duration = config.duration ?? defaultDuration;
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, duration);
      }

      return notification;
    },
    [addNotification, removeNotification, defaultDuration],
  );

  const success = useCallback(
    (title: string, message?: string): ToastNotification => {
      return toast({ title, message, variant: "success" });
    },
    [toast],
  );

  const error = useCallback(
    (title: string, message?: string): ToastNotification => {
      return toast({ title, message, variant: "error", duration: 0 });
    },
    [toast],
  );

  const warning = useCallback(
    (title: string, message?: string): ToastNotification => {
      return toast({ title, message, variant: "warning" });
    },
    [toast],
  );

  const info = useCallback(
    (title: string, message?: string): ToastNotification => {
      return toast({ title, message, variant: "info" });
    },
    [toast],
  );

  const dismissToast = useCallback(
    (id: string) => {
      removeNotification(id);
    },
    [removeNotification],
  );

  // ============================================================================
  // Banner Methods
  // ============================================================================

  const showBanner = useCallback(
    (config: BannerConfig): BannerNotification => {
      const baseNotification = addNotification({
        type: "banner",
        severity: config.variant || "info",
        priority: "medium",
        title: config.title,
        message: config.message || "",
        metadata: {},
      });

      const notification: BannerNotification = {
        ...baseNotification,
        type: "banner",
        position: config.position || "top",
        sticky: config.sticky ?? false,
        dismissible: config.dismissible ?? true,
      };

      return notification;
    },
    [addNotification],
  );

  const hideBanner = useCallback(
    (id: string) => {
      removeNotification(id);
    },
    [removeNotification],
  );

  const hideAllBanners = useCallback(() => {
    setNotifications((prev) => prev.filter((n: any) => n.type !== "banner"));
  }, []);

  // ============================================================================
  // Agricultural Methods
  // ============================================================================

  const sendAgriculturalNotification = useCallback(
    (config: AgriculturalNotificationConfig): BaseNotification => {
      const season = config.season || getCurrentSeason();

      const agricultural: AgriculturalMetadata = {
        season,
        eventType: config.eventType,
        cropType: config.cropName,
      };

      return addNotification({
        type: "in-app",
        severity: "agricultural",
        priority: "medium",
        title: config.title,
        message: config.message,
        metadata: {
          agricultural,
          ...config.metadata,
        },
      });
    },
    [addNotification],
  );

  const sendSeasonalAlert = useCallback(
    (config: SeasonalAlertConfig): BaseNotification => {
      const agricultural: AgriculturalMetadata = {
        season: config.season,
        eventType: "seasonal_change",
      };

      return addNotification({
        type: "in-app",
        severity: "agricultural",
        priority: "high",
        title: config.title,
        message: config.message,
        metadata: {
          agricultural,
          ...config.metadata,
        },
      });
    },
    [addNotification],
  );

  const sendHarvestNotification = useCallback(
    (config: HarvestNotificationConfig): BaseNotification => {
      const season = getCurrentSeason();
      const agricultural: AgriculturalMetadata = {
        season,
        eventType: "harvesting",
        cropType: config.cropName,
      };

      return addNotification({
        type: "in-app",
        severity: "agricultural",
        priority: "medium",
        title: config.title,
        message: config.message,
        metadata: {
          agricultural,
          ...config.metadata,
        },
      });
    },
    [addNotification],
  );

  const sendWeatherAlert = useCallback(
    (config: WeatherAlertConfig): BaseNotification => {
      const season = getCurrentSeason();
      const agricultural: AgriculturalMetadata = {
        season,
        eventType: "weather_alert",
      };

      const priority =
        config.severity === "high"
          ? "urgent"
          : config.severity === "medium"
            ? "high"
            : "medium";

      return addNotification({
        type: "in-app",
        severity: "warning",
        priority,
        title: config.title,
        message: config.message,
        metadata: {
          agricultural: {
            ...agricultural,
            weatherCondition: config.severity,
          },
          ...config.metadata,
        },
      });
    },
    [addNotification],
  );

  // ============================================================================
  // Preferences
  // ============================================================================

  const updatePreferences = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      setPreferences((prev) => {
        if (!prev) return undefined;
        return {
          ...prev,
          ...updates,
          updatedAt: new Date(),
        };
      });
    },
    [],
  );

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: NotificationContextValue = {
    // State
    notifications,
    toasts,
    banners,
    unreadCount,

    // Actions
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,

    // Toast methods
    toast,
    success,
    error,
    warning,
    info,
    dismissToast,

    // Banner methods
    showBanner,
    hideBanner,
    hideAllBanners,

    // Agricultural methods
    sendAgriculturalNotification,
    sendSeasonalAlert,
    sendHarvestNotification,
    sendWeatherAlert,

    // Preferences
    preferences,
    updatePreferences,
  };

  return (
    <AnimationProvider
      initialPreset="standard"
      enableSeasonalAnimations={true}
      enableDebugMode={false}
    >
      <NotificationContext.Provider value={value}>
        {children}
      </NotificationContext.Provider>
    </AnimationProvider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Use notification context
 * @throws {Error} If used outside of NotificationProvider
 */
export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider",
    );
  }

  return context;
}

// ============================================================================
// Display Name
// ============================================================================

NotificationProvider.displayName = "NotificationProvider";
