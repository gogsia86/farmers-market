/**
 * @fileoverview Notification System Integration Tests
 * @module components/notifications/__tests__/integration.test
 * @description Comprehensive integration tests for the complete notification system
 *
 * Test Coverage:
 * ✅ Provider + Context Integration
 * ✅ Toast + Provider Integration
 * ✅ Banner + Provider Integration
 * ✅ Renderer + Provider Integration
 * ✅ Agricultural Notifications Flow
 * ✅ Preferences Integration
 * ✅ Quiet Hours Integration
 * ✅ LocalStorage Persistence
 * ✅ Multiple Components Interaction
 * ✅ End-to-End User Flows
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

import type { NotificationPreferences } from "@/lib/notifications/types";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { NotificationProvider, useNotificationContext } from "../NotificationProvider";
import { ToastRenderer } from "../ToastRenderer";

// ============================================================================
// Mock Components
// ============================================================================

function TestConsumer() {
  const {
    toast,
    success,
    error,
    warning,
    info,
    showBanner,
    hideBanner,
    sendAgriculturalNotification,
    sendSeasonalAlert,
    sendHarvestNotification,
    sendWeatherAlert,
    notifications,
    toasts,
    banners,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotificationContext();

  return (
    <div>
      <div data-testid="notification-count">{notifications.length}</div>
      <div data-testid="toast-count">{toasts.length}</div>
      <div data-testid="banner-count">{banners.length}</div>
      <div data-testid="unread-count">{unreadCount}</div>

      <button onClick={() => toast({ title: "Test Toast", variant: "info" })}>
        Add Toast
      </button>
      <button onClick={() => success("Success Toast")}>Success Toast</button>
      <button onClick={() => error("Error Toast")}>Error Toast</button>
      <button onClick={() => warning("Warning Toast")}>Warning Toast</button>
      <button onClick={() => info("Info Toast")}>Info Toast</button>
      <button
        onClick={() =>
          showBanner({ title: "Test Banner", message: "Banner message", variant: "info" })
        }
      >
        Add Banner
      </button>
      <button onClick={() => clearAll()}>Clear All</button>
      <button onClick={() => markAllAsRead()}>Mark All Read</button>
      <button
        onClick={() =>
          sendAgriculturalNotification({
            title: "Planting Time",
            message: "Time to plant tomatoes",
            eventType: "planting",
            season: "spring",
          })
        }
      >
        Agricultural Notification
      </button>
      <button
        onClick={() =>
          sendSeasonalAlert({
            title: "Spring Alert",
            message: "Spring is here",
            season: "spring",
          })
        }
      >
        Seasonal Alert
      </button>
      <button
        onClick={() =>
          sendHarvestNotification({
            title: "Harvest Ready",
            message: "Tomatoes are ready",
            cropName: "Tomatoes",
          })
        }
      >
        Harvest Notification
      </button>
      <button
        onClick={() =>
          sendWeatherAlert({
            title: "Storm Warning",
            message: "Heavy rain expected",
            severity: "high",
          })
        }
      >
        Weather Alert
      </button>
    </div>
  );
}

// ============================================================================
// Test Helpers
// ============================================================================

function renderWithProvider(
  ui: React.ReactElement,
  options: {
    persistKey?: string;
    maxToasts?: number;
    maxBanners?: number;
    preferences?: NotificationPreferences;
  } = {}
) {
  return render(
    <NotificationProvider {...options}>{ui}</NotificationProvider>
  );
}

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
// Provider Integration Tests
// ============================================================================

describe("NotificationProvider Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllTimers();
  });

  it("should provide notification context to children", () => {
    renderWithProvider(<TestConsumer />);

    expect(screen.getByTestId("notification-count")).toHaveTextContent("0");
    expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
    expect(screen.getByTestId("banner-count")).toHaveTextContent("0");
  });

  it("should throw error when context is used outside provider", () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useNotificationContext must be used within NotificationProvider");

    consoleError.mockRestore();
  });

  it("should update notification counts when notifications are added", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    const addButton = screen.getByRole("button", { name: "Add Toast" });

    await user.click(addButton);

    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");
  });

  it("should clear all notifications", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    await user.click(screen.getByRole("button", { name: "Add Toast" }));
    await user.click(screen.getByRole("button", { name: "Add Banner" }));

    expect(screen.getByTestId("notification-count")).toHaveTextContent("2");

    await user.click(screen.getByRole("button", { name: "Clear All" }));

    expect(screen.getByTestId("notification-count")).toHaveTextContent("0");
  });

  it("should mark all notifications as read", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    await user.click(screen.getByRole("button", { name: "Add Toast" }));
    await user.click(screen.getByRole("button", { name: "Add Banner" }));

    expect(screen.getByTestId("unread-count")).toHaveTextContent("2");

    await user.click(screen.getByRole("button", { name: "Mark All Read" }));

    expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
  });
});

// ============================================================================
// Toast Integration Tests
// ============================================================================

describe("Toast Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render toasts through provider", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(
      <>
        <TestConsumer />
        <ToastRenderer />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Add Toast" }));

    expect(await screen.findByText("Test Toast")).toBeInTheDocument();
  });

  it("should render success toast", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(
      <>
        <TestConsumer />
        <ToastRenderer />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Success Toast" }));

    expect(await screen.findByText("Success Toast")).toBeInTheDocument();
  });

  it("should render error toast", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(
      <>
        <TestConsumer />
        <ToastRenderer />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Error Toast" }));

    expect(await screen.findByText("Error Toast")).toBeInTheDocument();
  });

  it("should render warning toast", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(
      <>
        <TestConsumer />
        <ToastRenderer />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Warning Toast" }));

    expect(await screen.findByText("Warning Toast")).toBeInTheDocument();
  });

  it("should render info toast", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(
      <>
        <TestConsumer />
        <ToastRenderer />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Info Toast" }));

    expect(await screen.findByText("Info Toast")).toBeInTheDocument();
  });

  it("should limit maximum toasts", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(
      <>
        <TestConsumer />
        <ToastRenderer />
      </>,
      { maxToasts: 3 }
    );

    const addButton = screen.getByRole("button", { name: "Add Toast" });

    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    expect(screen.getByTestId("toast-count")).toHaveTextContent("3");
  });

  it("should auto-dismiss toasts", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(
      <>
        <TestConsumer />
        <ToastRenderer />
      </>,
      { defaultDuration: 3000 }
    );

    await user.click(screen.getByRole("button", { name: "Add Toast" }));

    expect(await screen.findByText("Test Toast")).toBeInTheDocument();

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText("Test Toast")).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// Banner Integration Tests
// ============================================================================

describe("Banner Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should add banner through provider", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    await user.click(screen.getByRole("button", { name: "Add Banner" }));

    expect(screen.getByTestId("banner-count")).toHaveTextContent("1");
  });

  it("should limit maximum banners", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />, { maxBanners: 2 });

    const addButton = screen.getByRole("button", { name: "Add Banner" });

    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    expect(screen.getByTestId("banner-count")).toHaveTextContent("2");
  });
});

// ============================================================================
// Agricultural Notifications Integration Tests
// ============================================================================

describe("Agricultural Notifications Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should send agricultural notification", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    await user.click(
      screen.getByRole("button", { name: "Agricultural Notification" })
    );

    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
  });

  it("should send seasonal alert", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    await user.click(screen.getByRole("button", { name: "Seasonal Alert" }));

    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
  });

  it("should send harvest notification", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    await user.click(
      screen.getByRole("button", { name: "Harvest Notification" })
    );

    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
  });

  it("should send weather alert", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    await user.click(screen.getByRole("button", { name: "Weather Alert" }));

    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
  });

  it("should send agricultural notifications with correct metadata", async () => {
    const user = userEvent.setup();

    function AgricConsumer() {
      const { notifications, sendAgriculturalNotification } =
        useNotificationContext();

      return (
        <div>
          <button
            onClick={() =>
              sendAgriculturalNotification({
                title: "Planting",
                message: "Plant now",
                eventType: "planting",
                season: "spring",
                cropName: "Tomatoes",
              })
            }
          >
            Add
          </button>
          {notifications.length > 0 && (
            <div data-testid="agric-metadata">
              {JSON.stringify(notifications[0].metadata?.agricultural)}
            </div>
          )}
        </div>
      );
    }

    renderWithProvider(<AgricConsumer />);

    await user.click(screen.getByRole("button", { name: "Add" }));

    const metadata = await screen.findByTestId("agric-metadata");
    expect(metadata.textContent).toContain("planting");
    expect(metadata.textContent).toContain("spring");
    expect(metadata.textContent).toContain("Tomatoes");
  });
});

// ============================================================================
// LocalStorage Persistence Tests
// ============================================================================

describe("LocalStorage Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should persist notifications to localStorage", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />, {
      persistKey: "test-notifications",
    });

    await user.click(screen.getByRole("button", { name: "Add Toast" }));

    const stored = localStorage.getItem("test-notifications");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
  });

  it("should restore notifications from localStorage", () => {
    const testData = [
      {
        id: "test-1",
        type: "toast",
        severity: "info",
        priority: "medium",
        status: "sent",
        title: "Restored Toast",
        message: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      },
    ];

    localStorage.setItem("test-notifications", JSON.stringify(testData));

    renderWithProvider(<TestConsumer />, {
      persistKey: "test-notifications",
    });

    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
  });

  it("should handle corrupted localStorage data gracefully", () => {
    localStorage.setItem("test-notifications", "invalid json {{{");

    const consoleError = jest.spyOn(console, "error").mockImplementation();

    renderWithProvider(<TestConsumer />, {
      persistKey: "test-notifications",
    });

    expect(screen.getByTestId("notification-count")).toHaveTextContent("0");

    consoleError.mockRestore();
  });
});

// ============================================================================
// Preferences Integration Tests
// ============================================================================

describe("Preferences Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should respect channel preferences", async () => {
    const user = userEvent.setup();

    const preferences: NotificationPreferences = {
      userId: "user-1",
      channels: {
        toast: {
          enabled: false,
          frequency: "immediate",
        },
      },
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
        timezone: "UTC",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    renderWithProvider(<TestConsumer />, { preferences });

    await user.click(screen.getByRole("button", { name: "Add Toast" }));

    // Toast should be blocked by preferences
    expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
  });

  it("should allow urgent notifications during quiet hours", async () => {
    const user = userEvent.setup();

    function QuietHoursConsumer() {
      const { sendWeatherAlert, notifications } = useNotificationContext();

      return (
        <div>
          <div data-testid="notification-count">{notifications.length}</div>
          <button
            onClick={() =>
              sendWeatherAlert({
                title: "Urgent Weather",
                message: "Immediate danger",
                severity: "high", // This creates urgent priority
              })
            }
          >
            Weather Alert
          </button>
        </div>
      );
    }

    const preferences: NotificationPreferences = {
      userId: "user-1",
      channels: {},
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
        timezone: "UTC",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    renderWithProvider(<QuietHoursConsumer />, { preferences });

    await user.click(screen.getByRole("button", { name: "Weather Alert" }));

    // Urgent notifications should bypass quiet hours
    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
  });
});

// ============================================================================
// End-to-End User Flow Tests
// ============================================================================

describe("End-to-End User Flows", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should handle complete notification lifecycle", async () => {
    const user = userEvent.setup({ delay: null });

    function FullFlowConsumer() {
      const {
        toast,
        notifications,
        markAsRead,
        clearAll,
        unreadCount,
      } = useNotificationContext();

      return (
        <div>
          <div data-testid="count">{notifications.length}</div>
          <div data-testid="unread">{unreadCount}</div>
          <button onClick={() => toast({ title: "Test", variant: "info" })}>
            Add
          </button>
          <button onClick={() => markAsRead(notifications[0]?.id)}>
            Mark Read
          </button>
          <button onClick={clearAll}>Clear</button>
        </div>
      );
    }

    renderWithProvider(<FullFlowConsumer />);

    // Add notification
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("unread")).toHaveTextContent("1");

    // Mark as read
    await user.click(screen.getByRole("button", { name: "Mark Read" }));
    expect(screen.getByTestId("unread")).toHaveTextContent("0");

    // Clear all
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("should handle multiple notification types simultaneously", async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProvider(
      <>
        <TestConsumer />
        <ToastRenderer />
      </>
    );

    // Add different notification types
    await user.click(screen.getByRole("button", { name: "Success Toast" }));
    await user.click(screen.getByRole("button", { name: "Add Banner" }));
    await user.click(
      screen.getByRole("button", { name: "Agricultural Notification" })
    );

    expect(screen.getByTestId("notification-count")).toHaveTextContent("3");
    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");
    expect(screen.getByTestId("banner-count")).toHaveTextContent("1");
  });

  it("should handle rapid notification creation", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProvider(<TestConsumer />);

    const addButton = screen.getByRole("button", { name: "Add Toast" });

    // Rapidly add multiple notifications
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    expect(screen.getByTestId("toast-count")).toHaveTextContent("5");
  });

  it("should persist and restore complete notification state", async () => {
    const user = userEvent.setup();

    // First render - add notifications
    const { unmount } = renderWithProvider(<TestConsumer />, {
      persistKey: "e2e-test",
    });

    await user.click(screen.getByRole("button", { name: "Add Toast" }));
    await user.click(screen.getByRole("button", { name: "Add Banner" }));

    expect(screen.getByTestId("notification-count")).toHaveTextContent("2");

    unmount();

    // Second render - should restore
    renderWithProvider(<TestConsumer />, {
      persistKey: "e2e-test",
    });

    expect(screen.getByTestId("notification-count")).toHaveTextContent("2");
  });
});

// ============================================================================
// Error Handling Tests
// ============================================================================

describe("Error Handling", () => {
  it("should handle localStorage errors gracefully", async () => {
    const user = userEvent.setup();

    // Mock localStorage to throw error
    const setItemSpy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Storage full");
      });

    const consoleError = jest.spyOn(console, "error").mockImplementation();

    renderWithProvider(<TestConsumer />, {
      persistKey: "error-test",
    });

    await user.click(screen.getByRole("button", { name: "Add Toast" }));

    // Should still work despite storage error
    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");

    setItemSpy.mockRestore();
    consoleError.mockRestore();
  });

  it("should handle missing context gracefully", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      render(<TestConsumer />);
    }).toThrow();

    consoleError.mockRestore();
  });
});
