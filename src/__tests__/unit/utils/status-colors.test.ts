/**
 * 🧪 STATUS COLORS UTILITY TESTS - COMPREHENSIVE TEST SUITE
 *
 * Tests for status color and styling utilities
 *
 * Coverage:
 * - Order status classes
 * - Farm status classes
 * - Payment status classes
 * - Payout status classes
 * - Product status classes
 * - Generic status classes
 * - Status labels
 * - Status icons
 * - Status state checks
 * - Status variants
 *
 * @reference .cursorrules - Testing Patterns
 */

import {
    getFarmStatusClasses,
    getFarmStatusIcon,
    getFarmStatusLabel,
    getGenericStatusClasses,
    getOrderStatusClasses,
    getOrderStatusIcon,
    getOrderStatusLabel,
    getPaymentStatusClasses,
    getPayoutStatusClasses,
    getProductStatusClasses,
    getStatusVariant,
    isNegativeStatus,
    isPendingStatus,
    isPositiveStatus,
    type FarmStatus,
    type GenericStatus,
    type OrderStatus,
    type PaymentStatus,
    type PayoutStatus,
    type ProductStatus,
} from "@/lib/utils/status-colors";
import { describe, expect, it } from "@jest/globals";

// ============================================================================
// ORDER STATUS CLASSES
// ============================================================================

describe("getOrderStatusClasses", () => {
  it("should return correct classes for PENDING", () => {
    const classes = getOrderStatusClasses("PENDING");
    expect(classes).toContain("bg-yellow-100");
    expect(classes).toContain("text-yellow-800");
    expect(classes).toContain("border-yellow-200");
  });

  it("should return correct classes for CONFIRMED", () => {
    const classes = getOrderStatusClasses("CONFIRMED");
    expect(classes).toContain("bg-blue-100");
    expect(classes).toContain("text-blue-800");
  });

  it("should return correct classes for PREPARING", () => {
    const classes = getOrderStatusClasses("PREPARING");
    expect(classes).toContain("bg-purple-100");
    expect(classes).toContain("text-purple-800");
  });

  it("should return correct classes for READY", () => {
    const classes = getOrderStatusClasses("READY");
    expect(classes).toContain("bg-green-100");
    expect(classes).toContain("text-green-800");
  });

  it("should return correct classes for COMPLETED", () => {
    const classes = getOrderStatusClasses("COMPLETED");
    expect(classes).toContain("bg-gray-100");
    expect(classes).toContain("text-gray-800");
  });

  it("should return correct classes for CANCELLED", () => {
    const classes = getOrderStatusClasses("CANCELLED");
    expect(classes).toContain("bg-red-100");
    expect(classes).toContain("text-red-800");
  });

  it("should return default (PENDING) for invalid status", () => {
    const classes = getOrderStatusClasses("INVALID" as OrderStatus);
    expect(classes).toContain("bg-yellow-100");
  });
});

// ============================================================================
// FARM STATUS CLASSES
// ============================================================================

describe("getFarmStatusClasses", () => {
  it("should return correct classes for ACTIVE", () => {
    const classes = getFarmStatusClasses("ACTIVE");
    expect(classes).toContain("bg-green-100");
    expect(classes).toContain("text-green-800");
  });

  it("should return correct classes for PENDING", () => {
    const classes = getFarmStatusClasses("PENDING");
    expect(classes).toContain("bg-amber-100");
    expect(classes).toContain("text-amber-800");
  });

  it("should return correct classes for SUSPENDED", () => {
    const classes = getFarmStatusClasses("SUSPENDED");
    expect(classes).toContain("bg-red-100");
    expect(classes).toContain("text-red-800");
  });

  it("should return correct classes for INACTIVE", () => {
    const classes = getFarmStatusClasses("INACTIVE");
    expect(classes).toContain("bg-gray-100");
    expect(classes).toContain("text-gray-800");
  });

  it("should return default for invalid status", () => {
    const classes = getFarmStatusClasses("INVALID" as FarmStatus);
    expect(classes).toContain("bg-amber-100");
  });
});

// ============================================================================
// PAYMENT STATUS CLASSES
// ============================================================================

describe("getPaymentStatusClasses", () => {
  it("should return correct classes for PAID", () => {
    const classes = getPaymentStatusClasses("PAID");
    expect(classes).toContain("bg-green-100");
    expect(classes).toContain("text-green-800");
  });

  it("should return correct classes for PENDING", () => {
    const classes = getPaymentStatusClasses("PENDING");
    expect(classes).toContain("bg-yellow-100");
    expect(classes).toContain("text-yellow-800");
  });

  it("should return correct classes for FAILED", () => {
    const classes = getPaymentStatusClasses("FAILED");
    expect(classes).toContain("bg-red-100");
    expect(classes).toContain("text-red-800");
  });

  it("should return correct classes for REFUNDED", () => {
    const classes = getPaymentStatusClasses("REFUNDED");
    expect(classes).toContain("bg-gray-100");
    expect(classes).toContain("text-gray-800");
  });

  it("should return default for invalid status", () => {
    const classes = getPaymentStatusClasses("INVALID" as PaymentStatus);
    expect(classes).toContain("bg-yellow-100");
  });
});

// ============================================================================
// PAYOUT STATUS CLASSES
// ============================================================================

describe("getPayoutStatusClasses", () => {
  it("should return correct classes for COMPLETED", () => {
    const classes = getPayoutStatusClasses("COMPLETED");
    expect(classes).toContain("bg-green-100");
    expect(classes).toContain("text-green-800");
  });

  it("should return correct classes for PENDING", () => {
    const classes = getPayoutStatusClasses("PENDING");
    expect(classes).toContain("bg-yellow-100");
    expect(classes).toContain("text-yellow-800");
  });

  it("should return correct classes for PROCESSING", () => {
    const classes = getPayoutStatusClasses("PROCESSING");
    expect(classes).toContain("bg-blue-100");
    expect(classes).toContain("text-blue-800");
  });

  it("should return correct classes for FAILED", () => {
    const classes = getPayoutStatusClasses("FAILED");
    expect(classes).toContain("bg-red-100");
    expect(classes).toContain("text-red-800");
  });

  it("should return default for invalid status", () => {
    const classes = getPayoutStatusClasses("INVALID" as PayoutStatus);
    expect(classes).toContain("bg-yellow-100");
  });
});

// ============================================================================
// PRODUCT STATUS CLASSES
// ============================================================================

describe("getProductStatusClasses", () => {
  it("should return correct classes for ACTIVE", () => {
    const classes = getProductStatusClasses("ACTIVE");
    expect(classes).toContain("bg-green-100");
    expect(classes).toContain("text-green-800");
  });

  it("should return correct classes for DRAFT", () => {
    const classes = getProductStatusClasses("DRAFT");
    expect(classes).toContain("bg-gray-100");
    expect(classes).toContain("text-gray-800");
  });

  it("should return correct classes for ARCHIVED", () => {
    const classes = getProductStatusClasses("ARCHIVED");
    expect(classes).toContain("bg-amber-100");
    expect(classes).toContain("text-amber-800");
  });

  it("should return correct classes for OUT_OF_STOCK", () => {
    const classes = getProductStatusClasses("OUT_OF_STOCK");
    expect(classes).toContain("bg-red-100");
    expect(classes).toContain("text-red-800");
  });

  it("should return default for invalid status", () => {
    const classes = getProductStatusClasses("INVALID" as ProductStatus);
    expect(classes).toContain("bg-gray-100");
  });
});

// ============================================================================
// GENERIC STATUS CLASSES
// ============================================================================

describe("getGenericStatusClasses", () => {
  it("should return correct classes for success", () => {
    const classes = getGenericStatusClasses("success");
    expect(classes).toContain("bg-green-100");
    expect(classes).toContain("text-green-800");
  });

  it("should return correct classes for warning", () => {
    const classes = getGenericStatusClasses("warning");
    expect(classes).toContain("bg-yellow-100");
    expect(classes).toContain("text-yellow-800");
  });

  it("should return correct classes for error", () => {
    const classes = getGenericStatusClasses("error");
    expect(classes).toContain("bg-red-100");
    expect(classes).toContain("text-red-800");
  });

  it("should return correct classes for info", () => {
    const classes = getGenericStatusClasses("info");
    expect(classes).toContain("bg-blue-100");
    expect(classes).toContain("text-blue-800");
  });

  it("should return correct classes for default", () => {
    const classes = getGenericStatusClasses("default");
    expect(classes).toContain("bg-gray-100");
    expect(classes).toContain("text-gray-800");
  });

  it("should return default for invalid status", () => {
    const classes = getGenericStatusClasses("invalid" as GenericStatus);
    expect(classes).toContain("bg-gray-100");
  });
});

// ============================================================================
// STATUS LABELS
// ============================================================================

describe("getOrderStatusLabel", () => {
  it("should return formatted label for PENDING", () => {
    expect(getOrderStatusLabel("PENDING")).toBe("Pending");
  });

  it("should return formatted label for CONFIRMED", () => {
    expect(getOrderStatusLabel("CONFIRMED")).toBe("Confirmed");
  });

  it("should return formatted label for PREPARING", () => {
    expect(getOrderStatusLabel("PREPARING")).toBe("Preparing");
  });

  it("should return formatted label for READY", () => {
    expect(getOrderStatusLabel("READY")).toBe("Ready for Pickup");
  });

  it("should return formatted label for COMPLETED", () => {
    expect(getOrderStatusLabel("COMPLETED")).toBe("Completed");
  });

  it("should return formatted label for CANCELLED", () => {
    expect(getOrderStatusLabel("CANCELLED")).toBe("Cancelled");
  });

  it("should return status itself for unknown status", () => {
    expect(getOrderStatusLabel("UNKNOWN" as OrderStatus)).toBe("UNKNOWN");
  });
});

describe("getFarmStatusLabel", () => {
  it("should return formatted label for ACTIVE", () => {
    expect(getFarmStatusLabel("ACTIVE")).toBe("Active");
  });

  it("should return formatted label for PENDING", () => {
    expect(getFarmStatusLabel("PENDING")).toBe("Pending Verification");
  });

  it("should return formatted label for SUSPENDED", () => {
    expect(getFarmStatusLabel("SUSPENDED")).toBe("Suspended");
  });

  it("should return formatted label for INACTIVE", () => {
    expect(getFarmStatusLabel("INACTIVE")).toBe("Inactive");
  });

  it("should return status itself for unknown status", () => {
    expect(getFarmStatusLabel("UNKNOWN" as FarmStatus)).toBe("UNKNOWN");
  });
});

// ============================================================================
// STATUS ICONS
// ============================================================================

describe("getOrderStatusIcon", () => {
  it("should return correct icon for PENDING", () => {
    expect(getOrderStatusIcon("PENDING")).toBe("⏳");
  });

  it("should return correct icon for CONFIRMED", () => {
    expect(getOrderStatusIcon("CONFIRMED")).toBe("✅");
  });

  it("should return correct icon for PREPARING", () => {
    expect(getOrderStatusIcon("PREPARING")).toBe("👨‍🍳");
  });

  it("should return correct icon for READY", () => {
    expect(getOrderStatusIcon("READY")).toBe("📦");
  });

  it("should return correct icon for COMPLETED", () => {
    expect(getOrderStatusIcon("COMPLETED")).toBe("🎉");
  });

  it("should return correct icon for CANCELLED", () => {
    expect(getOrderStatusIcon("CANCELLED")).toBe("❌");
  });

  it("should return default icon for unknown status", () => {
    expect(getOrderStatusIcon("UNKNOWN" as OrderStatus)).toBe("📋");
  });
});

describe("getFarmStatusIcon", () => {
  it("should return correct icon for ACTIVE", () => {
    expect(getFarmStatusIcon("ACTIVE")).toBe("✅");
  });

  it("should return correct icon for PENDING", () => {
    expect(getFarmStatusIcon("PENDING")).toBe("⏳");
  });

  it("should return correct icon for SUSPENDED", () => {
    expect(getFarmStatusIcon("SUSPENDED")).toBe("⚠️");
  });

  it("should return correct icon for INACTIVE", () => {
    expect(getFarmStatusIcon("INACTIVE")).toBe("💤");
  });

  it("should return default icon for unknown status", () => {
    expect(getFarmStatusIcon("UNKNOWN" as FarmStatus)).toBe("🏪");
  });
});

// ============================================================================
// STATUS STATE CHECKS
// ============================================================================

describe("isPositiveStatus", () => {
  it("should return true for positive statuses", () => {
    expect(isPositiveStatus("CONFIRMED")).toBe(true);
    expect(isPositiveStatus("READY")).toBe(true);
    expect(isPositiveStatus("COMPLETED")).toBe(true);
  });

  it("should return false for non-positive statuses", () => {
    expect(isPositiveStatus("PENDING")).toBe(false);
    expect(isPositiveStatus("PREPARING")).toBe(false);
    expect(isPositiveStatus("CANCELLED")).toBe(false);
  });
});

describe("isNegativeStatus", () => {
  it("should return true for negative statuses", () => {
    expect(isNegativeStatus("CANCELLED")).toBe(true);
  });

  it("should return false for non-negative statuses", () => {
    expect(isNegativeStatus("PENDING")).toBe(false);
    expect(isNegativeStatus("CONFIRMED")).toBe(false);
    expect(isNegativeStatus("PREPARING")).toBe(false);
    expect(isNegativeStatus("READY")).toBe(false);
    expect(isNegativeStatus("COMPLETED")).toBe(false);
  });
});

describe("isPendingStatus", () => {
  it("should return true for pending statuses", () => {
    expect(isPendingStatus("PENDING")).toBe(true);
    expect(isPendingStatus("PREPARING")).toBe(true);
  });

  it("should return false for non-pending statuses", () => {
    expect(isPendingStatus("CONFIRMED")).toBe(false);
    expect(isPendingStatus("READY")).toBe(false);
    expect(isPendingStatus("COMPLETED")).toBe(false);
    expect(isPendingStatus("CANCELLED")).toBe(false);
  });
});

// ============================================================================
// STATUS VARIANTS
// ============================================================================

describe("getStatusVariant", () => {
  it("should return correct variant for success", () => {
    expect(getStatusVariant("success")).toBe("success");
  });

  it("should return correct variant for warning", () => {
    expect(getStatusVariant("warning")).toBe("warning");
  });

  it("should return correct variant for error", () => {
    expect(getStatusVariant("error")).toBe("error");
  });

  it("should return correct variant for info", () => {
    expect(getStatusVariant("info")).toBe("secondary");
  });

  it("should return correct variant for default", () => {
    expect(getStatusVariant("default")).toBe("default");
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("Status Utilities Integration", () => {
  it("should work together for order status display", () => {
    const status: OrderStatus = "CONFIRMED";

    const classes = getOrderStatusClasses(status);
    const label = getOrderStatusLabel(status);
    const icon = getOrderStatusIcon(status);
    const isPositive = isPositiveStatus(status);

    expect(classes).toContain("bg-blue-100");
    expect(label).toBe("Confirmed");
    expect(icon).toBe("✅");
    expect(isPositive).toBe(true);
  });

  it("should work together for farm status display", () => {
    const status: FarmStatus = "ACTIVE";

    const classes = getFarmStatusClasses(status);
    const label = getFarmStatusLabel(status);
    const icon = getFarmStatusIcon(status);

    expect(classes).toContain("bg-green-100");
    expect(label).toBe("Active");
    expect(icon).toBe("✅");
  });

  it("should handle complete order lifecycle", () => {
    const statuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "COMPLETED",
    ];

    statuses.forEach((status) => {
      expect(getOrderStatusClasses(status)).toBeTruthy();
      expect(getOrderStatusLabel(status)).toBeTruthy();
      expect(getOrderStatusIcon(status)).toBeTruthy();
    });
  });

  it("should handle cancelled order", () => {
    const status: OrderStatus = "CANCELLED";

    expect(isNegativeStatus(status)).toBe(true);
    expect(isPositiveStatus(status)).toBe(false);
    expect(isPendingStatus(status)).toBe(false);
    expect(getOrderStatusClasses(status)).toContain("bg-red-100");
    expect(getOrderStatusIcon(status)).toBe("❌");
  });

  it("should provide consistent color theming", () => {
    // Success states should be green
    expect(getPaymentStatusClasses("PAID")).toContain("bg-green-100");
    expect(getProductStatusClasses("ACTIVE")).toContain("bg-green-100");
    expect(getFarmStatusClasses("ACTIVE")).toContain("bg-green-100");
    expect(getGenericStatusClasses("success")).toContain("bg-green-100");

    // Error states should be red
    expect(getPaymentStatusClasses("FAILED")).toContain("bg-red-100");
    expect(getProductStatusClasses("OUT_OF_STOCK")).toContain("bg-red-100");
    expect(getFarmStatusClasses("SUSPENDED")).toContain("bg-red-100");
    expect(getGenericStatusClasses("error")).toContain("bg-red-100");

    // Pending states should be yellow
    expect(getPaymentStatusClasses("PENDING")).toContain("bg-yellow-100");
    expect(getOrderStatusClasses("PENDING")).toContain("bg-yellow-100");
    expect(getPayoutStatusClasses("PENDING")).toContain("bg-yellow-100");
    expect(getGenericStatusClasses("warning")).toContain("bg-yellow-100");
  });
});
