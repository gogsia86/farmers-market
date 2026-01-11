/**
 * @fileoverview Notification System Utilities Tests
 * @module lib/notifications/__tests__/utils.test
 * @description Comprehensive tests for notification utilities with agricultural consciousness
 *
 * Test Coverage:
 * ✅ ID Generation
 * ✅ Template Rendering
 * ✅ Filtering & Sorting
 * ✅ Agricultural Helpers
 * ✅ Validation Utilities
 * ✅ Time/Date Helpers
 * ✅ Priority & Severity Scoring
 * ✅ Batch Processing
 * ✅ Deduplication
 * ✅ Quiet Hours
 *
 * @version 1.0.0
 * @since 2024-11-15
 */

import {
  batchNotifications,
  calculateExpiryDate,
  deduplicateNotifications,
  extractTemplateVariables,
  filterNotifications,
  generateBatchId,
  generateNotificationId,
  getAgriculturalEventColor,
  getAgriculturalEventIcon,
  getCurrentSeason,
  getNotificationStats,
  getPriorityScore,
  getSeasonalColors,
  getSeasonalMessage,
  getSeverityScore,
  groupNotificationsByDate,
  groupNotificationsByType,
  isExpired,
  isQuietHours,
  renderTemplate,
  shouldSendNotification,
  sortNotifications,
  validateTemplateVariables,
} from "../utils";

import type {
  AgriculturalEventType,
  BaseNotification,
  NotificationFilter,
  NotificationPreferences,
  NotificationSortOptions,
  NotificationTemplate,
  QuietHours,
} from "../types";

// ============================================================================
// Test Helpers
// ============================================================================

function createMockNotification(
  overrides: Partial<BaseNotification> = {},
): BaseNotification {
  return {
    id: generateNotificationId(),
    type: "toast",
    severity: "info",
    priority: "medium",
    status: "pending",
    title: "Test Notification",
    message: "This is a test notification",
    createdAt: new Date(),
    metadata: {},
    ...overrides,
  };
}

// ============================================================================
// ID Generation Tests
// ============================================================================

describe("ID Generation", () => {
  describe("generateNotificationId", () => {
    it("should generate unique notification IDs", () => {
      const id1 = generateNotificationId();
      const id2 = generateNotificationId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it("should generate IDs with correct prefix", () => {
      const id = generateNotificationId();
      expect(id).toMatch(/^notif_/);
    });

    it("should generate IDs with timestamp and random parts", () => {
      const id = generateNotificationId();
      const parts = id.split("_");

      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe("notif");
      expect(parts[1]).toBeTruthy(); // timestamp
      expect(parts[2]).toBeTruthy(); // random
    });

    it("should generate multiple unique IDs in sequence", () => {
      const ids = Array.from({ length: 100 }, () => generateNotificationId());
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(100);
    });
  });

  describe("generateBatchId", () => {
    it("should generate unique batch IDs", () => {
      const id1 = generateBatchId();
      const id2 = generateBatchId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it("should generate IDs with correct prefix", () => {
      const id = generateBatchId();
      expect(id).toMatch(/^batch_/);
    });
  });
});

// ============================================================================
// Template Rendering Tests
// ============================================================================

describe("Template Rendering", () => {
  describe("renderTemplate", () => {
    it("should render template with simple variables", () => {
      const template: NotificationTemplate = {
        id: "test-template",
        name: "Test Template",
        title: "Hello {{name}}",
        message: "You have {{count}} new items",
        variables: ["name", "count"],
        severity: "info",
        priority: "medium",
      };

      const result = renderTemplate(template, { name: "John", count: 5 });

      expect(result.title).toBe("Hello John");
      expect(result.message).toBe("You have 5 new items");
    });

    it("should handle multiple occurrences of same variable", () => {
      const template: NotificationTemplate = {
        id: "test-template",
        name: "Test Template",
        title: "{{name}} - {{name}}",
        message: "Hello {{name}}, your name is {{name}}",
        variables: ["name"],
        severity: "info",
        priority: "medium",
      };

      const result = renderTemplate(template, { name: "Alice" });

      expect(result.title).toBe("Alice - Alice");
      expect(result.message).toBe("Hello Alice, your name is Alice");
    });

    it("should handle variables with spaces", () => {
      const template: NotificationTemplate = {
        id: "test-template",
        name: "Test Template",
        title: "{{ name }}",
        message: "Hello {{  count  }}",
        variables: ["name", "count"],
        severity: "info",
        priority: "medium",
      };

      const result = renderTemplate(template, { name: "Bob", count: 10 });

      expect(result.title).toBe("Bob");
      expect(result.message).toBe("Hello 10");
    });

    it("should leave unmatched placeholders as-is", () => {
      const template: NotificationTemplate = {
        id: "test-template",
        name: "Test Template",
        title: "Hello {{name}}",
        message: "Missing: {{missing}}",
        variables: ["name"],
        severity: "info",
        priority: "medium",
      };

      const result = renderTemplate(template, { name: "Charlie" });

      expect(result.title).toBe("Hello Charlie");
      expect(result.message).toBe("Missing: {{missing}}");
    });

    it("should handle numeric and boolean values", () => {
      const template: NotificationTemplate = {
        id: "test-template",
        name: "Test Template",
        title: "Count: {{count}}",
        message: "Active: {{active}}",
        variables: ["count", "active"],
        severity: "info",
        priority: "medium",
      };

      const result = renderTemplate(template, { count: 42, active: true });

      expect(result.title).toBe("Count: 42");
      expect(result.message).toBe("Active: true");
    });
  });

  describe("validateTemplateVariables", () => {
    it("should validate when all required variables are present", () => {
      const template: NotificationTemplate = {
        id: "test-template",
        name: "Test Template",
        title: "Hello {{name}}",
        message: "Count: {{count}}",
        variables: ["name", "count"],
        severity: "info",
        priority: "medium",
      };

      const result = validateTemplateVariables(template, {
        name: "John",
        count: 5,
      });

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it("should detect missing variables", () => {
      const template: NotificationTemplate = {
        id: "test-template",
        name: "Test Template",
        title: "Hello {{name}}",
        message: "Count: {{count}}",
        variables: ["name", "count"],
        severity: "info",
        priority: "medium",
      };

      const result = validateTemplateVariables(template, { name: "John" });

      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(["count"]);
    });

    it("should allow extra variables", () => {
      const template: NotificationTemplate = {
        id: "test-template",
        name: "Test Template",
        title: "Hello {{name}}",
        message: "Test",
        variables: ["name"],
        severity: "info",
        priority: "medium",
      };

      const result = validateTemplateVariables(template, {
        name: "John",
        extra: "ignored",
      });

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });
  });

  describe("extractTemplateVariables", () => {
    it("should extract variables from template text", () => {
      const text = "Hello {{name}}, you have {{count}} items";
      const variables = extractTemplateVariables(text);

      expect(variables).toEqual(["name", "count"]);
    });

    it("should handle variables with spaces", () => {
      const text = "Hello {{ name }}, count: {{  count  }}";
      const variables = extractTemplateVariables(text);

      expect(variables).toEqual(["name", "count"]);
    });

    it("should remove duplicate variables", () => {
      const text = "{{name}} - {{name}} - {{count}}";
      const variables = extractTemplateVariables(text);

      expect(variables).toEqual(["name", "count"]);
    });

    it("should return empty array for text with no variables", () => {
      const text = "No variables here";
      const variables = extractTemplateVariables(text);

      expect(variables).toEqual([]);
    });
  });
});

// ============================================================================
// Filtering Tests
// ============================================================================

describe("Notification Filtering", () => {
  const notifications: BaseNotification[] = [
    createMockNotification({
      id: "1",
      type: "toast",
      severity: "info",
      priority: "low",
      status: "pending",
    }),
    createMockNotification({
      id: "2",
      type: "banner",
      severity: "success",
      priority: "medium",
      status: "sent",
      readAt: new Date(),
    }),
    createMockNotification({
      id: "3",
      type: "toast",
      severity: "error",
      priority: "urgent",
      status: "failed",
    }),
    createMockNotification({
      id: "4",
      type: "in-app",
      severity: "warning",
      priority: "high",
      status: "sent",
      metadata: {
        category: "harvest",
        tags: ["urgent", "seasonal"],
      },
    }),
  ];

  describe("filterNotifications", () => {
    it("should filter by type", () => {
      const filter: NotificationFilter = { type: "toast" };
      const result = filterNotifications(notifications, filter);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("3");
    });

    it("should filter by multiple types", () => {
      const filter: NotificationFilter = { type: ["toast", "banner"] };
      const result = filterNotifications(notifications, filter);

      expect(result).toHaveLength(3);
    });

    it("should filter by severity", () => {
      const filter: NotificationFilter = { severity: "error" };
      const result = filterNotifications(notifications, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("3");
    });

    it("should filter by priority", () => {
      const filter: NotificationFilter = { priority: "urgent" };
      const result = filterNotifications(notifications, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("3");
    });

    it("should filter by read status", () => {
      const filter: NotificationFilter = { read: true };
      const result = filterNotifications(notifications, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should filter by unread status", () => {
      const filter: NotificationFilter = { read: false };
      const result = filterNotifications(notifications, filter);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((n: any) => !n.readAt)).toBe(true);
    });

    it("should filter by category", () => {
      const filter: NotificationFilter = { category: "harvest" };
      const result = filterNotifications(notifications, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("4");
    });

    it("should filter by tags", () => {
      const filter: NotificationFilter = { tags: ["urgent"] };
      const result = filterNotifications(notifications, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("4");
    });

    it("should filter by multiple criteria", () => {
      const filter: NotificationFilter = {
        type: ["toast", "in-app"],
        severity: ["info", "warning"],
      };
      const result = filterNotifications(notifications, filter);

      expect(result).toHaveLength(2);
      expect(result.map((n: any) => n.id).sort()).toEqual(["1", "4"]);
    });

    it("should return all notifications with empty filter", () => {
      const filter: NotificationFilter = {};
      const result = filterNotifications(notifications, filter);

      expect(result).toHaveLength(4);
    });
  });
});

// ============================================================================
// Sorting Tests
// ============================================================================

describe("Notification Sorting", () => {
  const now = new Date();
  const notifications: BaseNotification[] = [
    createMockNotification({
      id: "1",
      priority: "low",
      severity: "info",
      createdAt: new Date(now.getTime() - 3000),
    }),
    createMockNotification({
      id: "2",
      priority: "urgent",
      severity: "error",
      createdAt: new Date(now.getTime() - 1000),
    }),
    createMockNotification({
      id: "3",
      priority: "medium",
      severity: "success",
      createdAt: new Date(now.getTime() - 2000),
    }),
  ];

  describe("sortNotifications", () => {
    it("should sort by createdAt ascending", () => {
      const options: NotificationSortOptions = {
        field: "createdAt",
        order: "asc",
      };
      const result = sortNotifications(notifications, options);

      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("3");
      expect(result[2].id).toBe("2");
    });

    it("should sort by createdAt descending", () => {
      const options: NotificationSortOptions = {
        field: "createdAt",
        order: "desc",
      };
      const result = sortNotifications(notifications, options);

      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("3");
      expect(result[2].id).toBe("1");
    });

    it("should sort by priority ascending", () => {
      const options: NotificationSortOptions = {
        field: "priority",
        order: "asc",
      };
      const result = sortNotifications(notifications, options);

      expect(result[0].priority).toBe("low");
      expect(result[1].priority).toBe("medium");
      expect(result[2].priority).toBe("urgent");
    });

    it("should sort by priority descending", () => {
      const options: NotificationSortOptions = {
        field: "priority",
        order: "desc",
      };
      const result = sortNotifications(notifications, options);

      expect(result[0].priority).toBe("urgent");
      expect(result[1].priority).toBe("medium");
      expect(result[2].priority).toBe("low");
    });

    it("should sort by severity", () => {
      const options: NotificationSortOptions = {
        field: "severity",
        order: "desc",
      };
      const result = sortNotifications(notifications, options);

      expect(result[0].severity).toBe("error");
    });
  });

  describe("getPriorityScore", () => {
    it("should return correct priority scores", () => {
      expect(getPriorityScore("low")).toBe(1);
      expect(getPriorityScore("medium")).toBe(2);
      expect(getPriorityScore("high")).toBe(3);
      expect(getPriorityScore("urgent")).toBe(4);
    });
  });

  describe("getSeverityScore", () => {
    it("should return correct severity scores", () => {
      expect(getSeverityScore("info")).toBe(1);
      expect(getSeverityScore("success")).toBe(2);
      expect(getSeverityScore("warning")).toBe(3);
      expect(getSeverityScore("error")).toBe(4);
      expect(getSeverityScore("agricultural")).toBe(2);
    });
  });
});

// ============================================================================
// Agricultural Helpers Tests
// ============================================================================

describe("Agricultural Helpers", () => {
  describe("getCurrentSeason", () => {
    it("should return spring for March-May", () => {
      expect(getCurrentSeason(new Date("2024-03-15"))).toBe("spring");
      expect(getCurrentSeason(new Date("2024-04-15"))).toBe("spring");
      expect(getCurrentSeason(new Date("2024-05-15"))).toBe("spring");
    });

    it("should return summer for June-August", () => {
      expect(getCurrentSeason(new Date("2024-06-15"))).toBe("summer");
      expect(getCurrentSeason(new Date("2024-07-15"))).toBe("summer");
      expect(getCurrentSeason(new Date("2024-08-15"))).toBe("summer");
    });

    it("should return fall for September-November", () => {
      expect(getCurrentSeason(new Date("2024-09-15"))).toBe("fall");
      expect(getCurrentSeason(new Date("2024-10-15"))).toBe("fall");
      expect(getCurrentSeason(new Date("2024-11-15"))).toBe("fall");
    });

    it("should return winter for December-February", () => {
      expect(getCurrentSeason(new Date("2024-12-15"))).toBe("winter");
      expect(getCurrentSeason(new Date("2024-01-15"))).toBe("winter");
      expect(getCurrentSeason(new Date("2024-02-15"))).toBe("winter");
    });

    it("should use current date when no date provided", () => {
      const season = getCurrentSeason();
      expect(["spring", "summer", "fall", "winter"]).toContain(season);
    });
  });

  describe("getSeasonalColors", () => {
    it("should return colors for each season", () => {
      const spring = getSeasonalColors("spring");
      const summer = getSeasonalColors("summer");
      const fall = getSeasonalColors("fall");
      const winter = getSeasonalColors("winter");

      expect(spring.primary).toBeTruthy();
      expect(summer.primary).toBeTruthy();
      expect(fall.primary).toBeTruthy();
      expect(winter.primary).toBeTruthy();

      expect(spring.secondary).toBeTruthy();
      expect(summer.secondary).toBeTruthy();
      expect(fall.secondary).toBeTruthy();
      expect(winter.secondary).toBeTruthy();
    });
  });

  describe("getSeasonalMessage", () => {
    it("should return message for each season", () => {
      const spring = getSeasonalMessage("spring");
      const summer = getSeasonalMessage("summer");
      const fall = getSeasonalMessage("fall");
      const winter = getSeasonalMessage("winter");

      expect(spring).toBeTruthy();
      expect(summer).toBeTruthy();
      expect(fall).toBeTruthy();
      expect(winter).toBeTruthy();
    });
  });

  describe("getAgriculturalEventColor", () => {
    it("should return color for each event type", () => {
      const events: AgriculturalEventType[] = [
        "planting",
        "growing",
        "harvesting",
        "maintenance",
        "weather_alert",
        "pest_alert",
        "market_update",
        "season_change",
        "certification",
        "quality_check",
        "delivery",
        "sale",
        "general",
      ];

      events.forEach((event: any) => {
        const color = getAgriculturalEventColor(event);
        expect(color).toBeTruthy();
      });
    });
  });

  describe("getAgriculturalEventIcon", () => {
    it("should return icon for each event type", () => {
      const events: AgriculturalEventType[] = [
        "planting",
        "growing",
        "harvesting",
        "maintenance",
        "weather_alert",
        "pest_alert",
        "market_update",
        "season_change",
        "certification",
        "quality_check",
        "delivery",
        "sale",
        "general",
      ];

      events.forEach((event: any) => {
        const icon = getAgriculturalEventIcon(event);
        expect(icon).toBeTruthy();
      });
    });
  });
});

// ============================================================================
// Quiet Hours Tests
// ============================================================================

describe("Quiet Hours", () => {
  describe("isQuietHours", () => {
    it("should return false when no quiet hours configured", () => {
      const result = isQuietHours(undefined);
      expect(result).toBe(false);
    });

    it("should detect quiet hours", () => {
      const quietHours: QuietHours = {
        enabled: true,
        startTime: "22:00",
        endTime: "08:00",
        timezone: "America/New_York",
      };

      // Test at 23:00 (11 PM) - should be quiet
      const nightTime = new Date();
      nightTime.setHours(23, 0, 0, 0);

      // Test at 10:00 (10 AM) - should not be quiet
      const dayTime = new Date();
      dayTime.setHours(10, 0, 0, 0);

      expect(isQuietHours(quietHours, nightTime)).toBe(true);
      expect(isQuietHours(quietHours, dayTime)).toBe(false);
    });

    it("should handle disabled quiet hours", () => {
      const quietHours: QuietHours = {
        enabled: false,
        startTime: "22:00",
        endTime: "08:00",
        timezone: "America/New_York",
      };

      const result = isQuietHours(quietHours);
      expect(result).toBe(false);
    });
  });

  describe("shouldSendNotification", () => {
    it("should allow sending when preferences not set", () => {
      const notification = createMockNotification();
      const result = shouldSendNotification(notification, undefined);

      expect(result).toBe(true);
    });

    it("should respect channel preferences", () => {
      const notification = createMockNotification({ type: "email" });
      const preferences: NotificationPreferences = {
        userId: "user-1",
        channels: {
          email: {
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

      const result = shouldSendNotification(notification, preferences);
      expect(result).toBe(false);
    });

    it("should allow urgent notifications during quiet hours", () => {
      const notification = createMockNotification({ priority: "urgent" });
      const preferences: NotificationPreferences = {
        userId: "user-1",
        channels: {},
        quietHours: {
          enabled: true,
          startTime: "22:00",
          endTime: "08:00",
          timezone: "UTC",
          allowUrgent: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Should still send urgent notifications
      const result = shouldSendNotification(notification, preferences);
      expect(result).toBe(true);
    });
  });
});

// ============================================================================
// Expiry Tests
// ============================================================================

describe("Expiry Utilities", () => {
  describe("calculateExpiryDate", () => {
    it("should calculate expiry date from TTL", () => {
      const now = new Date();
      const ttl = 3600; // 1 hour in seconds
      const expiry = calculateExpiryDate(ttl, now);

      const expectedTime = now.getTime() + ttl * 1000;
      expect(expiry.getTime()).toBe(expectedTime);
    });

    it("should use current time when not provided", () => {
      const ttl = 1800; // 30 minutes
      const expiry = calculateExpiryDate(ttl);

      expect(expiry.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("isExpired", () => {
    it("should return false for unexpired notifications", () => {
      const notification = createMockNotification({
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      });

      expect(isExpired(notification)).toBe(false);
    });

    it("should return true for expired notifications", () => {
      const notification = createMockNotification({
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      });

      expect(isExpired(notification)).toBe(true);
    });

    it("should return false when no expiry set", () => {
      const notification = createMockNotification();
      expect(isExpired(notification)).toBe(false);
    });
  });
});

// ============================================================================
// Grouping & Batching Tests
// ============================================================================

describe("Grouping and Batching", () => {
  describe("groupNotificationsByDate", () => {
    it("should group notifications by date", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const notifications: BaseNotification[] = [
        createMockNotification({ id: "1", createdAt: today }),
        createMockNotification({ id: "2", createdAt: today }),
        createMockNotification({ id: "3", createdAt: yesterday }),
      ];

      const grouped = groupNotificationsByDate(notifications);

      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped[today.toDateString()]).toHaveLength(2);
      expect(grouped[yesterday.toDateString()]).toHaveLength(1);
    });
  });

  describe("groupNotificationsByType", () => {
    it("should group notifications by type", () => {
      const notifications: BaseNotification[] = [
        createMockNotification({ id: "1", type: "toast" }),
        createMockNotification({ id: "2", type: "toast" }),
        createMockNotification({ id: "3", type: "banner" }),
        createMockNotification({ id: "4", type: "email" }),
      ];

      const grouped = groupNotificationsByType(notifications);

      expect(grouped.toast).toHaveLength(2);
      expect(grouped.banner).toHaveLength(1);
      expect(grouped.email).toHaveLength(1);
    });
  });

  describe("batchNotifications", () => {
    it("should create batches of specified size", () => {
      const notifications: BaseNotification[] = Array.from(
        { length: 10 },
        (_, i) => createMockNotification({ id: `${i + 1}` }),
      );

      const batches = batchNotifications(notifications, 3);

      expect(batches).toHaveLength(4); // 3 + 3 + 3 + 1
      expect(batches[0].notifications).toHaveLength(3);
      expect(batches[3].notifications).toHaveLength(1);
    });

    it("should handle empty array", () => {
      const batches = batchNotifications([], 5);
      expect(batches).toHaveLength(0);
    });
  });

  describe("deduplicateNotifications", () => {
    it("should remove duplicate notifications", () => {
      const notifications: BaseNotification[] = [
        createMockNotification({
          id: "1",
          title: "Test",
          message: "Message",
        }),
        createMockNotification({
          id: "2",
          title: "Test",
          message: "Message",
        }),
        createMockNotification({
          id: "3",
          title: "Different",
          message: "Message",
        }),
      ];

      const deduplicated = deduplicateNotifications(notifications);

      expect(deduplicated).toHaveLength(2);
    });

    it("should keep most recent notification", () => {
      const older = new Date(Date.now() - 10000);
      const newer = new Date();

      const notifications: BaseNotification[] = [
        createMockNotification({
          id: "1",
          title: "Test",
          message: "Message",
          createdAt: older,
        }),
        createMockNotification({
          id: "2",
          title: "Test",
          message: "Message",
          createdAt: newer,
        }),
      ];

      const deduplicated = deduplicateNotifications(notifications);

      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].id).toBe("2");
    });
  });
});

// ============================================================================
// Stats Tests
// ============================================================================

describe("Notification Stats", () => {
  describe("getNotificationStats", () => {
    it("should calculate comprehensive statistics", () => {
      const notifications: BaseNotification[] = [
        createMockNotification({ status: "sent", readAt: new Date() }),
        createMockNotification({ status: "sent" }),
        createMockNotification({ status: "pending" }),
        createMockNotification({ status: "failed" }),
        createMockNotification({
          status: "sent",
          metadata: {
            agricultural: {
              season: "spring",
              eventType: "planting",
            },
          },
        }),
      ];

      const stats = getNotificationStats(notifications);

      expect(stats.total).toBe(5);
      expect(stats.byStatus.sent).toBe(3);
      expect(stats.byStatus.pending).toBe(1);
      expect(stats.byStatus.failed).toBe(1);
      expect(stats.read).toBe(1);
      expect(stats.unread).toBe(4);
      expect(stats.readRate).toBeCloseTo(0.2, 2);
    });

    it("should handle empty array", () => {
      const stats = getNotificationStats([]);

      expect(stats.total).toBe(0);
      expect(stats.read).toBe(0);
      expect(stats.unread).toBe(0);
      expect(stats.readRate).toBe(0);
    });

    it("should calculate read rate correctly", () => {
      const notifications: BaseNotification[] = [
        createMockNotification({ readAt: new Date() }),
        createMockNotification({ readAt: new Date() }),
        createMockNotification({}),
        createMockNotification({}),
      ];

      const stats = getNotificationStats(notifications);

      expect(stats.total).toBe(4);
      expect(stats.read).toBe(2);
      expect(stats.unread).toBe(2);
      expect(stats.readRate).toBe(0.5);
    });
  });
});
