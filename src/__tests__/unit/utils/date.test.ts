import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/utils/date";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("Date Utilities", () => {
  describe("formatDate", () => {
    it("should format date with default options", () => {
      const date = new Date("2025-01-15T10:30:00Z");
      const formatted = formatDate(date);
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2025");
    });

    it("should accept string dates", () => {
      const formatted = formatDate("2025-01-15T10:30:00Z");
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2025");
    });

    it("should accept Date objects", () => {
      const date = new Date("2025-01-15T10:30:00Z");
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
    });

    it("should accept custom format options", () => {
      const date = new Date("2025-01-15T10:30:00Z");
      const formatted = formatDate(date, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      expect(formatted).toContain("January");
    });

    it("should format different months correctly", () => {
      const jan = formatDate(new Date("2025-01-15"));
      const dec = formatDate(new Date("2025-12-25"));
      expect(jan).toContain("Jan");
      expect(dec).toContain("Dec");
    });

    it("should handle leap year dates", () => {
      const leapDay = formatDate(new Date("2024-02-29"));
      expect(leapDay).toContain("Feb");
      expect(leapDay).toContain("29");
    });

    it("should handle year boundaries", () => {
      const newYear = formatDate(new Date("2025-01-01"));
      expect(newYear).toContain("Jan");
      expect(newYear).toContain("1");
      expect(newYear).toContain("2025");
    });

    it("should format consistently for same date", () => {
      const date = new Date("2025-06-15T10:30:00Z");
      const formatted1 = formatDate(date);
      const formatted2 = formatDate(date);
      expect(formatted1).toBe(formatted2);
    });
  });

  describe("formatDateTime", () => {
    it("should include time in formatted string", () => {
      const date = new Date("2025-01-15T10:30:00Z");
      const formatted = formatDateTime(date);
      expect(formatted).toContain(":");
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });

    it("should include date components", () => {
      const date = new Date("2025-01-15T10:30:00Z");
      const formatted = formatDateTime(date);
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2025");
    });

    it("should accept string dates", () => {
      const formatted = formatDateTime("2025-01-15T14:30:00Z");
      expect(formatted).toContain(":");
      expect(typeof formatted).toBe("string");
    });

    it("should accept Date objects", () => {
      const date = new Date("2025-01-15T14:30:00Z");
      const formatted = formatDateTime(date);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain(":");
    });

    it("should format midnight correctly", () => {
      const midnight = formatDateTime(new Date("2025-01-15T00:00:00Z"));
      expect(midnight).toBeTruthy();
      expect(midnight).toContain(":");
    });

    it("should format noon correctly", () => {
      const noon = formatDateTime(new Date("2025-01-15T12:00:00Z"));
      expect(noon).toBeTruthy();
      expect(noon).toContain(":");
    });

    it("should handle minutes formatting", () => {
      const withMinutes = formatDateTime(new Date("2025-01-15T14:05:00Z"));
      expect(withMinutes).toMatch(/:\d{2}/); // Should have 2-digit minutes
    });

    it("should be different from formatDate output", () => {
      const date = new Date("2025-01-15T14:30:00Z");
      const dateOnly = formatDate(date);
      const dateTime = formatDateTime(date);
      expect(dateTime).not.toBe(dateOnly);
      expect(dateTime.length).toBeGreaterThan(dateOnly.length);
    });
  });

  describe("formatRelativeTime", () => {
    beforeEach(() => {
      // Mock current time to a fixed date for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "Just now" for current time', () => {
      const now = new Date("2025-01-15T12:00:00Z");
      expect(formatRelativeTime(now)).toBe("Just now");
    });

    it('should return "Just now" for less than 1 minute ago', () => {
      const recent = new Date("2025-01-15T11:59:30Z");
      expect(formatRelativeTime(recent)).toBe("Just now");
    });

    it("should format minutes ago correctly (singular)", () => {
      const oneMinuteAgo = new Date("2025-01-15T11:59:00Z");
      expect(formatRelativeTime(oneMinuteAgo)).toBe("1 minute ago");
    });

    it("should format minutes ago correctly (plural)", () => {
      const minutesAgo = new Date("2025-01-15T11:55:00Z");
      expect(formatRelativeTime(minutesAgo)).toBe("5 minutes ago");
    });

    it("should format hours ago correctly (singular)", () => {
      const oneHourAgo = new Date("2025-01-15T11:00:00Z");
      expect(formatRelativeTime(oneHourAgo)).toBe("1 hour ago");
    });

    it("should format hours ago correctly (plural)", () => {
      const hoursAgo = new Date("2025-01-15T09:00:00Z");
      expect(formatRelativeTime(hoursAgo)).toBe("3 hours ago");
    });

    it("should format days ago correctly (singular)", () => {
      const oneDayAgo = new Date("2025-01-14T12:00:00Z");
      expect(formatRelativeTime(oneDayAgo)).toBe("1 day ago");
    });

    it("should format days ago correctly (plural)", () => {
      const daysAgo = new Date("2025-01-12T12:00:00Z");
      expect(formatRelativeTime(daysAgo)).toBe("3 days ago");
    });

    it("should return formatted date for more than 7 days ago", () => {
      const oldDate = new Date("2025-01-01T12:00:00Z");
      const result = formatRelativeTime(oldDate);
      expect(result).not.toContain("ago");
      expect(result).toContain("Jan");
      expect(result).toContain("1");
    });

    it("should accept string dates", () => {
      const twoHoursAgo = "2025-01-15T10:00:00Z";
      expect(formatRelativeTime(twoHoursAgo)).toBe("2 hours ago");
    });

    it("should handle exactly 60 minutes as 1 hour", () => {
      const sixtyMinutesAgo = new Date("2025-01-15T11:00:00Z");
      expect(formatRelativeTime(sixtyMinutesAgo)).toBe("1 hour ago");
    });

    it("should handle exactly 24 hours as 1 day", () => {
      const twentyFourHoursAgo = new Date("2025-01-14T12:00:00Z");
      expect(formatRelativeTime(twentyFourHoursAgo)).toBe("1 day ago");
    });

    it("should handle 7 days boundary", () => {
      const sevenDaysAgo = new Date("2025-01-08T12:00:00Z");
      expect(formatRelativeTime(sevenDaysAgo)).toBe("7 days ago");
    });

    it("should switch to date format after 7 days", () => {
      const eightDaysAgo = new Date("2025-01-07T12:00:00Z");
      const result = formatRelativeTime(eightDaysAgo);
      expect(result).not.toContain("8 days ago");
      expect(result).toContain("Jan");
    });

    it("should handle 30 minutes correctly", () => {
      const thirtyMinutesAgo = new Date("2025-01-15T11:30:00Z");
      expect(formatRelativeTime(thirtyMinutesAgo)).toBe("30 minutes ago");
    });

    it("should handle 90 minutes as 1 hour", () => {
      const ninetyMinutesAgo = new Date("2025-01-15T10:30:00Z");
      expect(formatRelativeTime(ninetyMinutesAgo)).toBe("1 hour ago");
    });

    it("should handle 23 hours correctly", () => {
      const almostDayAgo = new Date("2025-01-14T13:00:00Z");
      expect(formatRelativeTime(almostDayAgo)).toBe("23 hours ago");
    });
  });

  describe("Integration Tests", () => {
    it("should format same date consistently across functions", () => {
      const date = new Date("2025-01-15T10:30:00Z");
      const formatted1 = formatDate(date);
      const formatted2 = formatDateTime(date);

      // Both should contain date components
      expect(formatted1).toContain("Jan");
      expect(formatted2).toContain("Jan");
      expect(formatted1).toContain("15");
      expect(formatted2).toContain("15");
    });

    it("should handle string and Date inputs interchangeably", () => {
      const dateStr = "2025-01-15T10:30:00Z";
      const dateObj = new Date(dateStr);

      const fromString = formatDate(dateStr);
      const fromObject = formatDate(dateObj);

      expect(fromString).toBe(fromObject);
    });

    it("should produce valid output for edge case dates", () => {
      const dates = [
        new Date("1970-01-01T00:00:00Z"), // Unix epoch
        new Date("2000-01-01T00:00:00Z"), // Y2K
        new Date("2024-02-29T00:00:00Z"), // Leap year
        new Date("2099-12-31T23:59:59Z"), // Far future
      ];

      dates.forEach((date) => {
        const formatted = formatDate(date);
        expect(formatted).toBeTruthy();
        expect(typeof formatted).toBe("string");
        expect(formatted.length).toBeGreaterThan(0);
      });
    });

    it("should handle month boundaries correctly", () => {
      const lastDayOfMonth = formatDate(new Date("2025-01-31"));
      const firstDayOfMonth = formatDate(new Date("2025-02-01"));

      expect(lastDayOfMonth).toContain("Jan");
      expect(lastDayOfMonth).toContain("31");
      expect(firstDayOfMonth).toContain("Feb");
      expect(firstDayOfMonth).toContain("1");
    });

    it("should format all months correctly", () => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      months.forEach((month, index) => {
        const date = new Date(`2025-${String(index + 1).padStart(2, "0")}-15`);
        const formatted = formatDate(date);
        expect(formatted).toContain(month);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid date strings gracefully", () => {
      const invalidDate = "not-a-date";
      // Invalid dates throw RangeError in formatDate
      expect(() => formatDate(invalidDate)).toThrow();
    });

    it("should handle very old dates", () => {
      const oldDate = new Date("1900-01-01");
      const formatted = formatDate(oldDate);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain("1900");
    });

    it("should handle very future dates", () => {
      const futureDate = new Date("2100-12-31");
      const formatted = formatDate(futureDate);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2100");
    });
  });
});
