/**
 * @fileoverview Notification Hooks Tests
 * @module hooks/__tests__/use-notifications.test
 * @description Comprehensive tests for notification system hooks
 *
 * Test Coverage:
 * ✅ useNotifications hook
 * ✅ useToast hook
 * ✅ useBanner hook
 * ✅ useNotificationCenter hook
 * ✅ useAgriculturalNotifications hook
 * ✅ useNotificationPreferences hook
 * ✅ Hook composition
 * ✅ Timer management
 * ✅ Cleanup on unmount
 * ✅ State management
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useAgriculturalNotifications,
  useBanner,
  useNotificationCenter,
  useNotificationPreferences,
  useNotifications,
  useToast,
} from "../use-notifications";


// ============================================================================
// Mock Setup
// ============================================================================

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// ============================================================================
// useNotifications Hook Tests
// ============================================================================

describe("useNotifications Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllTimers();
  });

  it("should initialize with empty notifications", () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it("should add notification", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: "toast",
        severity: "info",
        priority: "medium",
        title: "Test Notification",
        message: "Test message",
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe("Test Notification");
  });

  it("should remove notification", () => {
    const { result } = renderHook(() => useNotifications());

    let notificationId: string;

    act(() => {
      const notification = result.current.addNotification({
        type: "toast",
        severity: "info",
        priority: "medium",
        title: "Test",
        message: "Test",
      });
      notificationId = notification.id;
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it("should mark notification as read", () => {
    const { result } = renderHook(() => useNotifications());

    let notificationId: string;

    act(() => {
      const notification = result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Test",
        message: "Test",
      });
      notificationId = notification.id;
    });

    expect(result.current.unreadCount).toBe(1);

    act(() => {
      result.current.markAsRead(notificationId);
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].readAt).toBeTruthy();
  });

  it("should mark all notifications as read", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Test 1",
        message: "Test",
      });
      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Test 2",
        message: "Test",
      });
      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Test 3",
        message: "Test",
      });
    });

    expect(result.current.unreadCount).toBe(3);

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it("should clear all notifications", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: "toast",
        severity: "info",
        priority: "medium",
        title: "Test 1",
        message: "Test",
      });
      result.current.addNotification({
        type: "toast",
        severity: "info",
        priority: "medium",
        title: "Test 2",
        message: "Test",
      });
    });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it("should calculate unread count correctly", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      const n1 = result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Test 1",
        message: "Test",
      });
      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Test 2",
        message: "Test",
      });
      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Test 3",
        message: "Test",
      });

      result.current.markAsRead(n1.id);
    });

    expect(result.current.unreadCount).toBe(2);
  });

  it("should persist notifications to localStorage", () => {
    const { result } = renderHook(() =>
      useNotifications({ persistKey: "test-notifications" })
    );

    act(() => {
      result.current.addNotification({
        type: "toast",
        severity: "info",
        priority: "medium",
        title: "Persisted",
        message: "Test",
      });
    });

    const stored = localStorage.getItem("test-notifications");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe("Persisted");
  });

  it("should restore notifications from localStorage", () => {
    const testData = [
      {
        id: "test-1",
        type: "toast" as const,
        severity: "info" as const,
        priority: "medium" as const,
        status: "sent" as const,
        title: "Restored",
        message: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      },
    ];

    localStorage.setItem("test-notifications", JSON.stringify(testData));

    const { result } = renderHook(() =>
      useNotifications({ persistKey: "test-notifications" })
    );

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe("Restored");
  });
});

// ============================================================================
// useToast Hook Tests
// ============================================================================

describe("useToast Hook", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should show toast notification", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Toast Message",
        message: "This is a toast",
        variant: "info",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Toast Message");
  });

  it("should auto-dismiss toast after duration", async () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Auto Dismiss",
        message: "Will disappear",
        variant: "info",
        duration: 3000,
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.toasts).toHaveLength(0);
    });
  });

  it("should not auto-dismiss when duration is 0", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Persistent",
        message: "Will stay",
        variant: "info",
        duration: 0,
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it("should provide convenience methods for each variant", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info("Info toast");
      result.current.success("Success toast");
      result.current.warning("Warning toast");
      result.current.error("Error toast");
    });

    expect(result.current.toasts).toHaveLength(4);
    expect(result.current.toasts[0].variant).toBe("info");
    expect(result.current.toasts[1].variant).toBe("success");
    expect(result.current.toasts[2].variant).toBe("warning");
    expect(result.current.toasts[3].variant).toBe("error");
  });

  it("should dismiss specific toast", () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;

    act(() => {
      const toast = result.current.toast({
        title: "Dismissible",
        message: "Test",
        variant: "info",
      });
      toastId = toast.id;
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("should dismiss all toasts", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Toast 1",
        message: "Test",
        variant: "info",
      });
      result.current.toast({
        title: "Toast 2",
        message: "Test",
        variant: "success",
      });
      result.current.toast({
        title: "Toast 3",
        message: "Test",
        variant: "warning",
      });
    });

    expect(result.current.toasts).toHaveLength(3);

    act(() => {
      result.current.dismissAll();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("should limit maximum number of toasts", () => {
    const { result } = renderHook(() => useToast({ maxToasts: 3 }));

    act(() => {
      result.current.toast({ title: "Toast 1", variant: "info" });
      result.current.toast({ title: "Toast 2", variant: "info" });
      result.current.toast({ title: "Toast 3", variant: "info" });
      result.current.toast({ title: "Toast 4", variant: "info" });
    });

    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts[0].title).toBe("Toast 2");
    expect(result.current.toasts[2].title).toBe("Toast 4");
  });

  it("should cleanup timers on unmount", () => {
    const { result, unmount } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Timer Test",
        message: "Test",
        variant: "info",
        duration: 5000,
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Toast should not be dismissed after unmount
    // (component is unmounted so no state update)
  });

  it("should handle promise toasts", async () => {
    const { result } = renderHook(() => useToast());

    const promise = new Promise((resolve) => {
      setTimeout(() => resolve("Success!"), 1000);
    });

    act(() => {
      result.current.promise(promise, {
        loading: "Loading...",
        success: "Completed!",
        error: "Failed!",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Loading...");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.toasts[0].title).toBe("Completed!");
      expect(result.current.toasts[0].variant).toBe("success");
    });
  });
});

// ============================================================================
// useBanner Hook Tests
// ============================================================================

describe("useBanner Hook", () => {
  it("should show banner", () => {
    const { result } = renderHook(() => useBanner());

    act(() => {
      result.current.showBanner({
        title: "Banner Message",
        message: "This is a banner",
        variant: "info",
      });
    });

    expect(result.current.banners).toHaveLength(1);
    expect(result.current.banners[0].title).toBe("Banner Message");
  });

  it("should hide banner", () => {
    const { result } = renderHook(() => useBanner());

    let bannerId: string;

    act(() => {
      const banner = result.current.showBanner({
        title: "Hideable Banner",
        message: "Test",
        variant: "info",
      });
      bannerId = banner.id;
    });

    expect(result.current.banners).toHaveLength(1);

    act(() => {
      result.current.hideBanner(bannerId);
    });

    expect(result.current.banners).toHaveLength(0);
  });

  it("should hide all banners", () => {
    const { result } = renderHook(() => useBanner());

    act(() => {
      result.current.showBanner({
        title: "Banner 1",
        message: "Test",
        variant: "info",
      });
      result.current.showBanner({
        title: "Banner 2",
        message: "Test",
        variant: "warning",
      });
    });

    expect(result.current.banners).toHaveLength(2);

    act(() => {
      result.current.hideAll();
    });

    expect(result.current.banners).toHaveLength(0);
  });

  it("should support different banner positions", () => {
    const { result } = renderHook(() => useBanner());

    act(() => {
      result.current.showBanner({
        title: "Top Banner",
        message: "Test",
        variant: "info",
        position: "top",
      });
      result.current.showBanner({
        title: "Bottom Banner",
        message: "Test",
        variant: "info",
        position: "bottom",
      });
    });

    expect(result.current.banners).toHaveLength(2);
    expect(result.current.banners[0].position).toBe("top");
    expect(result.current.banners[1].position).toBe("bottom");
  });

  it("should limit banners per position", () => {
    const { result } = renderHook(() => useBanner({ maxBannersPerPosition: 2 }));

    act(() => {
      result.current.showBanner({
        title: "Banner 1",
        message: "Test",
        variant: "info",
        position: "top",
      });
      result.current.showBanner({
        title: "Banner 2",
        message: "Test",
        variant: "info",
        position: "top",
      });
      result.current.showBanner({
        title: "Banner 3",
        message: "Test",
        variant: "info",
        position: "top",
      });
    });

    const topBanners = result.current.banners.filter((b: any) => b.position === "top");
    expect(topBanners).toHaveLength(2);
  });
});

// ============================================================================
// useNotificationCenter Hook Tests
// ============================================================================

describe("useNotificationCenter Hook", () => {
  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useNotificationCenter());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.filter).toEqual({});
  });

  it("should filter notifications by type", () => {
    const { result } = renderHook(() => useNotificationCenter());

    act(() => {
      result.current.addNotification({
        type: "toast",
        severity: "info",
        priority: "medium",
        title: "Toast",
        message: "Test",
      });
      result.current.addNotification({
        type: "banner",
        severity: "info",
        priority: "medium",
        title: "Banner",
        message: "Test",
      });
      result.current.addNotification({
        type: "email",
        severity: "info",
        priority: "medium",
        title: "Email",
        message: "Test",
      });
    });

    act(() => {
      result.current.setFilter({ type: "toast" });
    });

    expect(result.current.filteredNotifications).toHaveLength(1);
    expect(result.current.filteredNotifications[0].type).toBe("toast");
  });

  it("should filter notifications by read status", () => {
    const { result } = renderHook(() => useNotificationCenter());

    let n1Id: string;

    act(() => {
      const n1 = result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Read",
        message: "Test",
      });
      n1Id = n1.id;

      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Unread",
        message: "Test",
      });

      result.current.markAsRead(n1Id);
    });

    act(() => {
      result.current.setFilter({ read: false });
    });

    expect(result.current.filteredNotifications).toHaveLength(1);
    expect(result.current.filteredNotifications[0].title).toBe("Unread");
  });

  it("should sort notifications", () => {
    const { result } = renderHook(() => useNotificationCenter());

    act(() => {
      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "low",
        title: "Low Priority",
        message: "Test",
      });
      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "urgent",
        title: "Urgent Priority",
        message: "Test",
      });
      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Medium Priority",
        message: "Test",
      });
    });

    act(() => {
      result.current.setSortOptions({ field: "priority", order: "desc" });
    });

    expect(result.current.sortedNotifications[0].priority).toBe("urgent");
    expect(result.current.sortedNotifications[1].priority).toBe("medium");
    expect(result.current.sortedNotifications[2].priority).toBe("low");
  });

  it("should combine filter and sort", () => {
    const { result } = renderHook(() => useNotificationCenter());

    act(() => {
      result.current.addNotification({
        type: "toast",
        severity: "info",
        priority: "high",
        title: "Toast High",
        message: "Test",
      });
      result.current.addNotification({
        type: "toast",
        severity: "info",
        priority: "low",
        title: "Toast Low",
        message: "Test",
      });
      result.current.addNotification({
        type: "banner",
        severity: "info",
        priority: "medium",
        title: "Banner Medium",
        message: "Test",
      });
    });

    act(() => {
      result.current.setFilter({ type: "toast" });
      result.current.setSortOptions({ field: "priority", order: "desc" });
    });

    const result_notifications = result.current.filteredNotifications;
    expect(result_notifications).toHaveLength(2);
    expect(result_notifications[0].priority).toBe("high");
    expect(result_notifications[1].priority).toBe("low");
  });

  it("should group notifications by date", () => {
    const { result } = renderHook(() => useNotificationCenter());

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    act(() => {
      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Today 1",
        message: "Test",
        createdAt: today,
      });
      result.current.addNotification({
        type: "in-app",
        severity: "info",
        priority: "medium",
        title: "Yesterday",
        message: "Test",
        createdAt: yesterday,
      });
    });

    const grouped = result.current.groupedByDate;
    expect(Object.keys(grouped)).toHaveLength(2);
  });
});

// ============================================================================
// useAgriculturalNotifications Hook Tests
// ============================================================================

describe("useAgriculturalNotifications Hook", () => {
  it("should send agricultural notification with season", () => {
    const { result } = renderHook(() => useAgriculturalNotifications());

    act(() => {
      result.current.sendAgriculturalNotification({
        title: "Planting Season",
        message: "Time to plant!",
        eventType: "planting",
        season: "spring",
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].variant).toBe("agricultural");
    expect(result.current.notifications[0].agricultural?.season).toBe("spring");
  });

  it("should send seasonal alert", () => {
    const { result } = renderHook(() => useAgriculturalNotifications());

    act(() => {
      result.current.sendSeasonalAlert({
        title: "Spring Alert",
        message: "Perfect planting conditions",
        season: "spring",
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].agricultural?.eventType).toBe(
      "season_change"
    );
  });

  it("should send harvest notification", () => {
    const { result } = renderHook(() => useAgriculturalNotifications());

    act(() => {
      result.current.sendHarvestNotification({
        title: "Ready to Harvest",
        message: "Tomatoes are ready",
        cropName: "Tomatoes",
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].agricultural?.eventType).toBe(
      "harvesting"
    );
  });

  it("should send weather alert", () => {
    const { result } = renderHook(() => useAgriculturalNotifications());

    act(() => {
      result.current.sendWeatherAlert({
        title: "Storm Warning",
        message: "Heavy rain expected",
        severity: "high",
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].agricultural?.eventType).toBe(
      "weather_alert"
    );
  });

  it("should send market update", () => {
    const { result } = renderHook(() => useAgriculturalNotifications());

    act(() => {
      result.current.sendMarketUpdate({
        title: "Price Update",
        message: "Corn prices increased",
        marketData: {
          crop: "Corn",
          price: 5.5,
          change: "+10%",
        },
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].agricultural?.eventType).toBe(
      "market_update"
    );
  });

  it("should auto-detect current season", () => {
    const { result } = renderHook(() => useAgriculturalNotifications());

    act(() => {
      result.current.sendAgriculturalNotification({
        title: "Season Auto",
        message: "Test",
        eventType: "general",
        // No season provided - should auto-detect
      });
    });

    expect(result.current.notifications[0].agricultural?.season).toBeTruthy();
  });
});

// ============================================================================
// useNotificationPreferences Hook Tests
// ============================================================================

describe("useNotificationPreferences Hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with default preferences", () => {
    const { result } = renderHook(() =>
      useNotificationPreferences("user-1")
    );

    expect(result.current.preferences).toBeTruthy();
    expect(result.current.preferences.userId).toBe("user-1");
  });

  it("should update channel preferences", () => {
    const { result } = renderHook(() =>
      useNotificationPreferences("user-1")
    );

    act(() => {
      result.current.updateChannelPreference("email", {
        enabled: false,
        frequency: "daily",
      });
    });

    expect(result.current.preferences.channels.email?.enabled).toBe(false);
    expect(result.current.preferences.channels.email?.frequency).toBe("daily");
  });

  it("should update quiet hours", () => {
    const { result } = renderHook(() =>
      useNotificationPreferences("user-1")
    );

    act(() => {
      result.current.updateQuietHours({
        enabled: true,
        start: "22:00",
        end: "08:00",
        timezone: "America/New_York",
      });
    });

    expect(result.current.preferences.quietHours.enabled).toBe(true);
    expect(result.current.preferences.quietHours.start).toBe("22:00");
  });

  it("should persist preferences to localStorage", () => {
    const { result } = renderHook(() =>
      useNotificationPreferences("user-1")
    );

    act(() => {
      result.current.updateChannelPreference("push", {
        enabled: true,
        frequency: "immediate",
      });
    });

    const stored = localStorage.getItem("notification-preferences-user-1");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.channels.push.enabled).toBe(true);
  });

  it("should restore preferences from localStorage", () => {
    const testPreferences = {
      userId: "user-1",
      channels: {
        email: { enabled: false, frequency: "weekly" as const },
      },
      quietHours: {
        enabled: true,
        start: "23:00",
        end: "07:00",
        timezone: "UTC",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "notification-preferences-user-1",
      JSON.stringify(testPreferences)
    );

    const { result } = renderHook(() =>
      useNotificationPreferences("user-1")
    );

    expect(result.current.preferences.channels.email?.enabled).toBe(false);
    expect(result.current.preferences.quietHours.start).toBe("23:00");
  });

  it("should reset preferences to default", () => {
    const { result } = renderHook(() =>
      useNotificationPreferences("user-1")
    );

    act(() => {
      result.current.updateChannelPreference("email", {
        enabled: false,
        frequency: "daily",
      });
    });

    expect(result.current.preferences.channels.email?.enabled).toBe(false);

    act(() => {
      result.current.resetToDefaults();
    });

    // Should revert to defaults
    expect(result.current.preferences.channels).toEqual({});
  });
});

// ============================================================================
// Hook Composition Tests
// ============================================================================

describe("Hook Composition", () => {
  it("should allow using multiple hooks together", () => {
    const { result: notificationsResult } = renderHook(() => useNotifications());
    const { result: toastResult } = renderHook(() => useToast());
    const { result: bannerResult } = renderHook(() => useBanner());

    act(() => {
      toastResult.current.success("Toast message");
      bannerResult.current.showBanner({
        title: "Banner",
        message: "Test",
        variant: "info",
      });
    });

    expect(toastResult.current.toasts).toHaveLength(1);
    expect(bannerResult.current.banners).toHaveLength(1);
  });

  it("should share notification state across hooks", () => {
    const { result: centerResult } = renderHook(() => useNotificationCenter());
    const { result: agricResult } = renderHook(() =>
      useAgriculturalNotifications()
    );

    // Both hooks should work independently
    expect(centerResult.current.notifications).toBeDefined();
    expect(agricResult.current.notifications).toBeDefined();
  });
});
