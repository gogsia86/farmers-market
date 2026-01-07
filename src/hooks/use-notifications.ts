/**
 * @fileoverview Notification Hooks
 * @module hooks/use-notifications
 * @description Divine notification hooks with agricultural consciousness
 *
 * Features:
 * - useNotifications - Main notification context hook
 * - useToast - Imperative toast API
 * - useNotificationCenter - In-app notification center
 * - useNotificationPreferences - User preferences management
 * - useBanner - Banner notification management
 * - useAgriculturalNotifications - Agricultural event notifications
 *
 * @example
 * ```tsx
 * // Use toast notifications
 * const { toast } = useToast();
 * toast.success("Farm created successfully!");
 *
 * // Use notification center
 * const { notifications, markAsRead, clear } = useNotificationCenter();
 *
 * // Use agricultural notifications
 * const { notifyHarvest, notifySeasonChange } = useAgriculturalNotifications();
 * notifyHarvest({ farmName: "Green Valley Farm", cropType: "Tomatoes" });
 * ```
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

"use client";

import type {
  AgriculturalMetadata,
  BannerNotification,
  BaseNotification,
  InAppNotification,
  NotificationFilter,
  NotificationPreferences,
  ToastNotification,
  ToastOptions
} from "@/lib/notifications/types";
import {
  calculateNotificationStats,
  filterNotifications,
  generateNotificationId,
  getCurrentSeason,
  groupNotificationsByDate,
  sortNotifications,
} from "@/lib/notifications/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// Notification Context Hook
// ============================================================================

/**
 * Main notification context hook
 * Access global notification state and methods
 */
export function useNotifications(options?: { persistKey?: string }) {
  const persistKey = options?.persistKey;

  // Initialize from localStorage if persistKey provided
  const [notifications, setNotifications] = useState<BaseNotification[]>(() => {
    if (persistKey && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(persistKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert ISO date strings back to Date objects
          return parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
            readAt: n.readAt ? new Date(n.readAt) : undefined,
            expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
          }));
        }
      } catch (error) {
        logger.error("Failed to restore notifications from localStorage:", {
      error: error instanceof Error ? error.message : String(error),
    });
      }
    }
    return [];
  });

  const [activeToasts, setActiveToasts] = useState<ToastNotification[]>([]);
  const [activeBanners, setActiveBanners] = useState<BannerNotification[]>([]);

  // Persist to localStorage when notifications change
  useEffect(() => {
    if (persistKey && typeof window !== "undefined") {
      try {
        localStorage.setItem(persistKey, JSON.stringify(notifications));
      } catch (error) {
        logger.error("Failed to persist notifications to localStorage:", {
      error: error instanceof Error ? error.message : String(error),
    });
      }
    }
  }, [notifications, persistKey]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(
      (n) => !n.readAt && n.status !== "read"
    ).length;
  }, [notifications]);

  // Add notification
  const addNotification = useCallback((notification: Omit<BaseNotification, 'id' | 'createdAt' | 'status'>) => {
    const fullNotification: BaseNotification = {
      id: generateNotificationId(),
      createdAt: new Date(),
      status: "pending",
      ...notification,
    };

    setNotifications((prev) => [fullNotification, ...prev]);

    // Also add to appropriate active list
    if (fullNotification.type === "toast") {
      setActiveToasts((prev) => [fullNotification as ToastNotification, ...prev]);
    } else if (fullNotification.type === "banner") {
      setActiveBanners((prev) => [
        fullNotification as BannerNotification,
        ...prev,
      ]);
    }

    return fullNotification;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setActiveToasts((prev) => prev.filter((n) => n.id !== id));
    setActiveBanners((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, readAt: new Date(), status: "read" as const }
          : n
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const now = new Date();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: now, status: "read" as const }))
    );
  }, []);

  // Clear all notifications
  const clear = useCallback(() => {
    setNotifications([]);
    setActiveToasts([]);
    setActiveBanners([]);
  }, []);

  // Clear by type
  const clearByType = useCallback((type: BaseNotification["type"]) => {
    setNotifications((prev) => prev.filter((n) => n.type !== type));
    if (type === "toast") {
      setActiveToasts([]);
    } else if (type === "banner") {
      setActiveBanners([]);
    }
  }, []);

  return {
    notifications,
    activeToasts,
    activeBanners,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clear,
    clearAll: clear, // Alias for compatibility
    clearByType,
  };
}

// ============================================================================
// Toast Hook
// ============================================================================

/**
 * Toast notification hook with imperative API
 */
export function useToast(options?: { maxToasts?: number }) {
  const maxToasts = options?.maxToasts ?? Infinity;
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [timers, setTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Keep timersRef in sync with timers state
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  // Show toast from options object
  const showToastFromOptions = useCallback(
    (options: { title?: string; message: string; variant?: string; duration?: number; position?: ToastNotification['position'] }): ToastNotification & { variant?: string } => {
      const id = generateNotificationId();
      const duration = options.duration ?? 5000;
      const variant = options.variant ?? "info";

      const toast: ToastNotification & { variant?: string } = {
        id,
        type: "toast",
        severity: variant as any,
        priority: "medium",
        status: "sent",
        title: options.title || "",
        message: options.message,
        createdAt: new Date(),
        duration,
        position: options.position ?? "top-right",
        dismissible: true,
        variant,
        metadata: {},
      };

      setToasts((prev) => {
        const next = [...prev, toast];
        // Limit to maxToasts if specified
        if (maxToasts !== Infinity && next.length > maxToasts) {
          // Remove oldest toasts
          const toRemove = next.slice(0, next.length - maxToasts);
          toRemove.forEach((t) => {
            const timer = timersRef.current.get(t.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(t.id);
            }
          });
          return next.slice(-maxToasts);
        }
        return next;
      });

      // Auto-dismiss after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);

        setTimers((prev) => new Map(prev).set(id, timer));
      }

      return toast;
    },
    []
  );

  // Show toast from message and options
  const showToast = useCallback(
    (
      message: string,
      options: ToastOptions = {}
    ): string => {
      const id = generateNotificationId();
      const duration = options.duration ?? 5000;
      const variant = options.severity ?? "info";

      const toast: ToastNotification & { variant?: string } = {
        id,
        type: "toast",
        severity: options.severity ?? "info",
        priority: options.priority ?? "medium",
        status: "sent",
        title: "",
        message,
        createdAt: new Date(),
        duration,
        position: options.position ?? "top-right",
        dismissible: options.dismissible ?? true,
        actions: options.actions,
        metadata: options.metadata,
        variant,
      };

      setToasts((prev) => {
        const next = [...prev, toast];
        // Limit to maxToasts if specified
        if (maxToasts !== Infinity && next.length > maxToasts) {
          // Remove oldest toasts
          const toRemove = next.slice(0, next.length - maxToasts);
          toRemove.forEach((t) => {
            const timer = timersRef.current.get(t.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(t.id);
            }
          });
          return next.slice(-maxToasts);
        }
        return next;
      });

      // Auto-dismiss after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);

        setTimers((prev) => new Map(prev).set(id, timer));
      }

      return id;
    },
    []
  );

  // Dismiss toast
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    // Clear timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      setTimers((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach((timer) => clearTimeout(timer));
    setTimers(new Map());
  }, []);

  // Toast function (callable)
  const toast = useCallback(
    (options: { title?: string; message: string; variant?: string; duration?: number; position?: ToastNotification['position'] }) => {
      return showToastFromOptions(options);
    },
    [showToastFromOptions]
  );

  // Info toast
  const info = useCallback(
    (message: string, options?: Omit<ToastOptions, "severity">) =>
      showToast(message, { ...options, severity: "info" }),
    [showToast]
  );

  // Success toast
  const success = useCallback(
    (message: string, options?: Omit<ToastOptions, "severity">) =>
      showToast(message, { ...options, severity: "success" }),
    [showToast]
  );

  // Warning toast
  const warning = useCallback(
    (message: string, options?: Omit<ToastOptions, "severity">) =>
      showToast(message, { ...options, severity: "warning" }),
    [showToast]
  );

  // Error toast
  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, "severity">) =>
      showToast(message, { ...options, severity: "error", duration: 0 }),
    [showToast]
  );

  // Agricultural toast
  const agricultural = useCallback(
    (message: string, options?: Omit<ToastOptions, "severity">) =>
      showToast(message, {
        ...options,
        severity: "agricultural",
        metadata: {
          ...options?.metadata,
          agricultural: {
            season: getCurrentSeason(),
            ...options?.metadata?.agricultural,
          },
        },
      }),
    [showToast]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Promise toast
  const promise = useCallback(
    async <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      }
    ) => {
      const loadingId = showToast("", {
        severity: "info",
        duration: 0,
      });

      // Update the toast with loading title
      setToasts((prev) =>
        prev.map((t) =>
          t.id === loadingId
            ? { ...t, title: options.loading, message: "" }
            : t
        )
      );

      try {
        const data = await promise;
        dismissToast(loadingId);
        const message =
          typeof options.success === "function"
            ? options.success(data)
            : options.success;
        showToast("", {
          severity: "success",
          metadata: {},
        });

        // Update most recent toast with success title
        setToasts((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastToast = updated[updated.length - 1];
          if (lastToast) {
            updated[updated.length - 1] = {
              ...lastToast,
              type: "toast" as const,
              title: message,
              message: "",
              severity: "success" as const,
            };
          }
          return updated;
        });

        return data;
      } catch (err) {
        dismissToast(loadingId);
        const message =
          typeof options.error === "function"
            ? options.error(err)
            : options.error;
        showToast("", {
          severity: "error",
          duration: 0,
        });

        // Update most recent toast with error title
        setToasts((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastToast = updated[updated.length - 1];
          if (lastToast) {
            updated[updated.length - 1] = {
              ...lastToast,
              type: "toast" as const,
              title: message,
              message: "",
              severity: "error" as const,
            };
          }
          return updated;
        });

        throw err;
      }
    },
    [showToast, dismissToast]
  );

  return {
    toasts,
    toast,
    info,
    success,
    warning,
    error,
    agricultural,
    promise,
    dismiss: dismissToast,
    dismissToast,
    dismissAll,
  };
}

// ============================================================================
// Notification Center Hook
// ============================================================================

/**
 * In-app notification center hook
 */
export function useNotificationCenter(initialFilter?: NotificationFilter) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>(initialFilter || {});
  const [sortOptions, setSortOptions] = useState<{
    field: "createdAt" | "updatedAt" | "priority" | "severity";
    order: "asc" | "desc";
  }>({
    field: "createdAt",
    order: "desc"
  });

  // Filtered and sorted notifications
  const filteredNotifications = useMemo(() => {
    let result = notifications;

    // Apply filter
    if (filter && Object.keys(filter).length > 0) {
      result = filterNotifications(result, filter) as InAppNotification[];
    }

    // Apply sort
    result = sortNotifications(result, sortOptions) as InAppNotification[];

    return result;
  }, [notifications, filter, sortOptions]);

  // Sorted notifications (alias for compatibility)
  const sortedNotifications = filteredNotifications;

  // Grouped by date
  const groupedByDate = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.readAt).length;
  }, [notifications]);

  // Statistics
  const stats = useMemo(() => {
    return calculateNotificationStats(notifications);
  }, [notifications]);

  // Add notification
  const addNotification = useCallback((notification: Omit<InAppNotification, "id"> & { type?: string }) => {
    const id = generateNotificationId();
    const newNotification: InAppNotification = {
      ...notification,
      id,
      type: (notification.type || "in-app") as any,
      createdAt: notification.createdAt ?? new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
    return newNotification;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, readAt: new Date(), status: "read" as const }
          : n
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const now = new Date();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: now, status: "read" as const }))
    );
  }, []);

  // Archive notification
  const archiveNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true } : n))
    );
  }, []);

  // Unarchive notification
  const unarchiveNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: false } : n))
    );
  }, []);

  // Pin notification
  const pinNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: true } : n))
    );
  }, []);

  // Unpin notification
  const unpinNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: false } : n))
    );
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clear read notifications
  const clearRead = useCallback(() => {
    setNotifications((prev) => prev.filter((n) => !n.readAt));
  }, []);

  return {
    notifications: filteredNotifications,
    filteredNotifications,
    sortedNotifications,
    groupedByDate,
    allNotifications: notifications,
    unreadCount,
    stats,
    filter,
    setFilter,
    sortOptions,
    setSortOptions,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    unarchiveNotification,
    pinNotification,
    unpinNotification,
    clearAll,
    clearRead,
  };
}

// ============================================================================
// Banner Hook
// ============================================================================

/**
 * Banner notification hook
 */
export function useBanner() {
  const MAX_BANNERS_PER_POSITION = 2;
  const [banners, setBanners] = useState<BannerNotification[]>([]);

  // Show banner
  const showBanner = useCallback(
    (banner: Omit<BannerNotification, "id" | "type">): BannerNotification => {
      const id = generateNotificationId();
      const newBanner: BannerNotification = {
        ...banner,
        id,
        type: "banner",
        createdAt: banner.createdAt ?? new Date(),
      };

      setBanners((prev) => {
        const position = newBanner.position || "top";
        const positionBanners = prev.filter((b) => (b.position || "top") === position);

        // If at limit, remove oldest banner at this position
        if (positionBanners.length >= MAX_BANNERS_PER_POSITION && positionBanners[0]) {
          const toRemove = positionBanners[0].id;
          return [...prev.filter((b) => b.id !== toRemove), newBanner];
        }

        return [...prev, newBanner];
      });
      return newBanner;
    },
    []
  );

  // Hide banner (alias for dismiss)
  const hideBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Dismiss banner
  const dismissBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Hide all banners (alias for dismissAll)
  const hideAll = useCallback(() => {
    setBanners([]);
  }, []);

  // Dismiss all banners
  const dismissAll = useCallback(() => {
    setBanners([]);
  }, []);

  // Banner variants
  const banner = useMemo(
    () => ({
      show: showBanner,

      info: (
        title: string,
        message: string,
        options?: Partial<Omit<BannerNotification, "id" | "type">>
      ) =>
        showBanner({
          severity: "info",
          priority: "medium",
          status: "sent",
          title,
          message,
          createdAt: new Date(),
          ...options,
        }),

      success: (
        title: string,
        message: string,
        options?: Partial<Omit<BannerNotification, "id" | "type">>
      ) =>
        showBanner({
          severity: "success",
          priority: "medium",
          status: "sent",
          title,
          message,
          createdAt: new Date(),
          ...options,
        }),

      warning: (
        title: string,
        message: string,
        options?: Partial<Omit<BannerNotification, "id" | "type">>
      ) =>
        showBanner({
          severity: "warning",
          priority: "high",
          status: "sent",
          title,
          message,
          createdAt: new Date(),
          ...options,
        }),

      error: (
        title: string,
        message: string,
        options?: Partial<Omit<BannerNotification, "id" | "type">>
      ) =>
        showBanner({
          severity: "error",
          priority: "high",
          status: "sent",
          title,
          message,
          createdAt: new Date(),
          ...options,
        }),

      agricultural: (
        title: string,
        message: string,
        options?: Partial<Omit<BannerNotification, "id" | "type">>
      ) =>
        showBanner({
          severity: "agricultural",
          priority: "medium",
          status: "sent",
          title,
          message,
          createdAt: new Date(),
          metadata: {
            ...options?.metadata,
            agricultural: {
              season: getCurrentSeason(),
              ...options?.metadata?.agricultural,
            },
          },
          ...options,
        }),

      dismiss: dismissBanner,
      dismissAll,
    }),
    [showBanner, dismissBanner, dismissAll]
  );

  return {
    banners,
    banner,
    showBanner,
    hideBanner,
    dismissBanner,
    hideAll,
    dismissAll,
  };
}

// ============================================================================
// Agricultural Notifications Hook
// ============================================================================

/**
 * Agricultural event notifications hook
 */
export function useAgriculturalNotifications() {
  const { toast, agricultural, warning } = useToast();
  const { banner } = useBanner();
  const [notifications, setNotifications] = useState<BaseNotification[]>([]);

  // Send agricultural notification
  const sendAgriculturalNotification = useCallback(
    (options: {
      title: string;
      message: string;
      eventType: string;
      season?: "spring" | "summer" | "fall" | "winter";
    }) => {
      const season = options.season ?? getCurrentSeason();
      const id = generateNotificationId();
      const toastNotification: ToastNotification & { variant?: string; agricultural?: any } = {
        id,
        type: "toast",
        severity: "agricultural",
        priority: "medium",
        status: "sent",
        title: options.title,
        message: options.message,
        createdAt: new Date(),
        duration: 5000,
        position: "top-right",
        dismissible: true,
        variant: "agricultural",
        agricultural: {
          season,
          eventType: options.eventType as any,
        },
        metadata: {
          agricultural: {
            season,
            eventType: options.eventType as any,
          },
        },
      };

      setNotifications((prev) => [toastNotification, ...prev]);
      return id;
    },
    [toast]
  );

  // Send seasonal alert
  const sendSeasonalAlert = useCallback(
    (options: {
      title: string;
      message: string;
      season: "spring" | "summer" | "fall" | "winter";
    }) => {
      const id = generateNotificationId();
      const toastNotification: BaseNotification & { agricultural?: any } = {
        id,
        type: "toast",
        severity: "agricultural",
        priority: "medium",
        status: "sent",
        title: options.title,
        message: options.message,
        createdAt: new Date(),
        agricultural: {
          season: options.season,
          eventType: "seasonal_change",
        },
        metadata: {
          agricultural: {
            season: options.season,
            eventType: "seasonal_change",
          },
        },
      };

      setNotifications((prev) => [toastNotification, ...prev]);
      return id;
    },
    [toast]
  );

  // Send harvest notification
  const sendHarvestNotification = useCallback(
    (options: {
      title: string;
      message: string;
      cropName: string;
    }) => {
      const id = generateNotificationId();
      const toastNotification: BaseNotification & { agricultural?: any } = {
        id,
        type: "toast",
        severity: "agricultural",
        priority: "medium",
        status: "sent",
        title: options.title,
        message: options.message,
        createdAt: new Date(),
        agricultural: {
          season: getCurrentSeason(),
          eventType: "harvesting",
          cropType: options.cropName,
        },
        metadata: {
          agricultural: {
            season: getCurrentSeason(),
            eventType: "harvesting",
            cropType: options.cropName,
          },
        },
      };

      setNotifications((prev) => [toastNotification, ...prev]);
      return id;
    },
    [toast]
  );

  // Send weather alert
  const sendWeatherAlert = useCallback(
    (options: {
      title: string;
      message: string;
      severity: string;
    }) => {
      const id = generateNotificationId();
      const toastNotification: BaseNotification & { agricultural?: any } = {
        id,
        type: "toast",
        severity: "warning",
        priority: options.severity === "high" ? "high" : "medium",
        status: "sent",
        title: options.title,
        message: options.message,
        createdAt: new Date(),
        agricultural: {
          season: getCurrentSeason(),
          eventType: "weather_alert",
        },
        metadata: {
          agricultural: {
            season: getCurrentSeason(),
            eventType: "weather_alert",
          },
        },
      };

      setNotifications((prev) => [toastNotification, ...prev]);
      return id;
    },
    [toast]
  );

  // Send market update
  const sendMarketUpdate = useCallback(
    (options: {
      title: string;
      message: string;
      marketData?: any;
    }) => {
      const id = generateNotificationId();
      const toastNotification: BaseNotification & { agricultural?: any; marketData?: any } = {
        id,
        type: "toast",
        severity: "info",
        priority: "medium",
        status: "sent",
        title: options.title,
        message: options.message,
        createdAt: new Date(),
        agricultural: {
          season: getCurrentSeason(),
          eventType: "crop_ready",
        },
        marketData: options.marketData,
        metadata: {
          agricultural: {
            season: getCurrentSeason(),
            eventType: "crop_ready",
          },
          data: {
            marketData: options.marketData,
          },
        },
      };

      setNotifications((prev) => [toastNotification, ...prev]);
      return id;
    },
    [toast]
  );

  // Notify planting
  const notifyPlanting = useCallback(
    (metadata: Partial<AgriculturalMetadata>, options?: ToastOptions) => {
      return agricultural(
        `${metadata.farmName ?? "Farm"} has started planting ${metadata.cropType ?? "crops"}!`,
        {
          ...options,
          metadata: {
            ...options?.metadata,
            agricultural: {
              season: getCurrentSeason(),
              eventType: "planting",
              ...metadata,
            },
          },
        }
      );
    },
    [agricultural]
  );

  // Notify harvesting
  const notifyHarvesting = useCallback(
    (metadata: Partial<AgriculturalMetadata>, options?: ToastOptions) => {
      return agricultural(
        `${metadata.farmName ?? "Farm"} is harvesting ${metadata.cropType ?? "crops"}!`,
        {
          ...options,
          metadata: {
            ...options?.metadata,
            agricultural: {
              season: getCurrentSeason(),
              eventType: "harvesting",
              ...metadata,
            },
          },
        }
      );
    },
    [agricultural]
  );

  // Notify season change
  const notifySeasonChange = useCallback(
    (season: "spring" | "summer" | "fall" | "winter", options?: ToastOptions) => {
      const messages = {
        spring: "🌱 Spring has arrived! Time to plant new crops.",
        summer: "☀️ Summer season begins! Keep your crops hydrated.",
        fall: "🍂 Fall harvest season is here!",
        winter: "❄️ Winter season - time to plan for next year.",
      };

      return agricultural(messages[season], {
        ...options,
        metadata: {
          ...options?.metadata,
          agricultural: {
            season,
            eventType: "seasonal_change",
          },
        },
      });
    },
    [agricultural]
  );

  // Notify harvest complete
  const notifyHarvestComplete = useCallback(
    (metadata: Partial<AgriculturalMetadata>, options?: ToastOptions) => {
      return agricultural(
        `✅ Harvest complete at ${metadata.farmName ?? "the farm"}! ${metadata.productName ?? "Products"} ready for market.`,
        {
          ...options,
          metadata: {
            ...options?.metadata,
            agricultural: {
              season: getCurrentSeason(),
              eventType: "harvest_complete",
              ...metadata,
            },
          },
        }
      );
    },
    [agricultural]
  );

  // Notify low stock
  const notifyLowStock = useCallback(
    (metadata: Partial<AgriculturalMetadata>, options?: ToastOptions) => {
      return warning(
        `⚠️ ${metadata.productName} is running low at ${metadata.farmName}`,
        {
          ...options,
          metadata: {
            ...options?.metadata,
            agricultural: {
              season: getCurrentSeason(),
              eventType: "crop_ready",
              ...metadata,
            },
          },
        }
      );
    },
    [warning]
  );

  // Notify market opening
  const notifyMarketOpening = useCallback(
    (metadata: Partial<AgriculturalMetadata>, options?: ToastOptions) => {
      const { position, ...bannerOptions } = options || {};
      return banner.agricultural(
        "Market Open",
        `🏪 ${metadata.farmName ?? "The farmers market"} is now open!`,
        {
          sticky: true,
          metadata: {
            ...options?.metadata,
            agricultural: {
              season: getCurrentSeason(),
              eventType: "market_opening",
              ...metadata,
            },
          },
          ...bannerOptions,
        }
      );
    },
    [banner]
  );

  // Notify weather alert
  const notifyWeatherAlert = useCallback(
    (
      message: string,
      severity: "low" | "medium" | "high",
      options?: ToastOptions
    ) => {
      return warning(message, {
        ...options,
        duration: severity === "high" ? 0 : 5000,
        metadata: {
          ...options?.metadata,
          agricultural: {
            weatherCondition: message,
            season: getCurrentSeason(),
          },
        },
      });
    },
    [warning]
  );

  return {
    notifications,
    sendAgriculturalNotification,
    sendSeasonalAlert,
    sendHarvestNotification,
    sendWeatherAlert,
    sendMarketUpdate,
    notifyPlanting,
    notifyHarvesting,
    notifySeasonChange,
    notifyHarvestComplete,
    notifyLowStock,
    notifyMarketOpening,
    notifyWeatherAlert,
  };
}

// ============================================================================
// Notification Preferences Hook
// ============================================================================

/**
 * User notification preferences hook
 */
export function useNotificationPreferences(userId: string) {
  const storageKey = `notification-preferences-${userId}`;

  // Initialize from localStorage
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
            updatedAt: parsed.updatedAt ? new Date(parsed.updatedAt) : new Date(),
          };
        }
      } catch (error) {
        logger.error("Failed to restore preferences from localStorage:", {
      error: error instanceof Error ? error.message : String(error),
    });
      }
    }

    return {
      userId,
      channels: {},
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // Persist to localStorage when preferences change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(preferences));
      } catch (error) {
        logger.error("Failed to persist preferences to localStorage:", {
      error: error instanceof Error ? error.message : String(error),
    });
      }
    }
  }, [preferences, storageKey]);

  // Update preferences
  const updatePreferences = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Toggle channel
  const toggleChannel = useCallback(
    (channel: keyof NotificationPreferences["channels"]) => {
      setPreferences((prev) => ({
        ...prev,
        channels: {
          ...prev.channels,
          [channel]: {
            ...prev.channels[channel],
            enabled: !prev.channels[channel].enabled,
          },
        },
      }));
    },
    []
  );

  // Toggle quiet hours
  const toggleQuietHours = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: prev.quietHours
        ? { ...prev.quietHours, enabled: !prev.quietHours.enabled }
        : undefined,
      updatedAt: new Date(),
    }));
  }, []);

  // Update channel preference
  const updateChannelPreference = useCallback(
    (channel: keyof NotificationPreferences["channels"], settings: any) => {
      setPreferences((prev) => ({
        ...prev,
        channels: {
          ...prev.channels,
          [channel]: settings,
        },
        updatedAt: new Date(),
      }));
    },
    []
  );

  // Update quiet hours
  const updateQuietHours = useCallback((quietHours: any) => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        ...quietHours,
        // Map start/end to startTime/endTime if provided
        startTime: quietHours.start || quietHours.startTime || prev.quietHours?.startTime || "22:00",
        endTime: quietHours.end || quietHours.endTime || prev.quietHours?.endTime || "08:00",
      },
      updatedAt: new Date(),
    }));
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setPreferences({
      userId,
      channels: {
        inApp: { enabled: true },
        push: { enabled: true },
        email: { enabled: true },
        sms: { enabled: false },
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
    });
  }, [userId]);

  return {
    preferences,
    updatePreferences,
    toggleChannel,
    toggleQuietHours,
    updateChannelPreference,
    updateQuietHours,
    resetToDefaults,
  };
}

// ============================================================================
// Export all hooks
// ============================================================================

export default useNotifications;
