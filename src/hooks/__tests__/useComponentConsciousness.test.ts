/**
 * 🧬 DIVINE TEST SUITE: Component Consciousness Hook
 * 📚 Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
 * 🌾 Domain: Performance Tracking & Analytics
 *
 * Tests for type-safe performance monitoring and analytics tracking
 */

import React from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import {
  initializeDivinePerformanceTracking,
  useComponentConsciousness,
  type ComponentConsciousness,
  type ComponentMetrics,
  type DivinePerformanceMetric,
} from "../useComponentConsciousness";

describe("useComponentConsciousness Hook", () => {
  beforeEach(() => {
    // Clear any existing global trackers
    delete (globalThis as any).__DIVINE_PERFORMANCE__;
    delete (globalThis as any).__DIVINE_ANALYTICS__;

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Basic Initialization", () => {
    it("should initialize with component name", () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      expect(result.current).toBeDefined();
      expect(result.current.startMeasurement).toBeDefined();
      expect(result.current.trackEvent).toBeDefined();
      expect(result.current.getMetrics).toBeDefined();
    });

    it("should return consistent consciousness object", () => {
      const { result, rerender } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      const firstRef = result.current;

      // Re-render
      rerender();

      // Should have same structure (memoized)
      expect(result.current).toStrictEqual(firstRef);
    });

    it("should accept optional context", () => {
      const context = { variant: "agricultural", size: "large" };

      const { result } = renderHook(() =>
        useComponentConsciousness("FarmCard", context),
      );

      expect(result.current).toBeDefined();
    });
  });

  describe("Metrics Tracking", () => {
    it("should initialize metrics with zero values", () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      const metrics = result.current.getMetrics();

      expect(metrics.componentName).toBe("TestComponent");
      expect(metrics.renderCount).toBeGreaterThanOrEqual(0);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.eventCount).toBe(0);
    });

    it("should track render count", async () => {
      const { result, rerender } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      const initialRenderCount = result.current.getMetrics().renderCount;

      // Force re-renders
      rerender();
      rerender();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const finalRenderCount = result.current.getMetrics().renderCount;
      expect(finalRenderCount).toBeGreaterThan(initialRenderCount);
    });

    it("should record render times", async () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      const metrics = result.current.getMetrics();
      expect(metrics.lastRenderTime).toBeGreaterThanOrEqual(0);
      expect(metrics.averageRenderTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Performance Measurement", () => {
    it("should start and complete measurement successfully", async () => {
      initializeDivinePerformanceTracking();

      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      await act(async () => {
        const measurement = result.current.startMeasurement("test_operation");

        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 50));

        measurement.success();
      });

      const metrics = (globalThis as any).__DIVINE_PERFORMANCE__.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);

      const testMetric = metrics.find(
        (m: DivinePerformanceMetric) =>
          m.component === "TestComponent" && m.operation === "test_operation",
      );

      expect(testMetric).toBeDefined();
      expect(testMetric.success).toBe(true);
      expect(testMetric.duration).toBeGreaterThan(0);
    });

    it("should handle measurement failure with Error object", async () => {
      initializeDivinePerformanceTracking();

      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      const testError = new Error("Test error message");

      await act(async () => {
        const measurement =
          result.current.startMeasurement("failing_operation");
        measurement.failure(testError);
      });

      const metrics = (globalThis as any).__DIVINE_PERFORMANCE__.getMetrics();
      const failureMetric = metrics.find(
        (m: DivinePerformanceMetric) =>
          m.component === "TestComponent" &&
          m.operation === "failing_operation",
      );

      expect(failureMetric).toBeDefined();
      expect(failureMetric.success).toBe(false);
      expect(failureMetric.error).toBe("Test error message");
    });

    it("should handle measurement failure with string error", async () => {
      initializeDivinePerformanceTracking();

      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      await act(async () => {
        const measurement = result.current.startMeasurement("string_error_op");
        measurement.failure("String error message");
      });

      const metrics = (globalThis as any).__DIVINE_PERFORMANCE__.getMetrics();
      const failureMetric = metrics.find(
        (m: DivinePerformanceMetric) => m.operation === "string_error_op",
      );

      expect(failureMetric?.error).toBe("String error message");
    });

    it("should handle measurement failure with unknown error type", async () => {
      initializeDivinePerformanceTracking();

      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      await act(async () => {
        const measurement = result.current.startMeasurement("unknown_error_op");
        measurement.failure({ custom: "error object" });
      });

      const metrics = (globalThis as any).__DIVINE_PERFORMANCE__.getMetrics();
      const failureMetric = metrics.find(
        (m: DivinePerformanceMetric) => m.operation === "unknown_error_op",
      );

      expect(failureMetric?.error).toBeDefined();
    });

    it("should increment error count on failure", async () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      const initialErrorCount = result.current.getMetrics().errorCount;

      await act(async () => {
        const measurement = result.current.startMeasurement("error_op");
        measurement.failure(new Error("test"));
      });

      const finalErrorCount = result.current.getMetrics().errorCount;
      expect(finalErrorCount).toBe(initialErrorCount + 1);
    });
  });

  describe("Event Tracking", () => {
    it("should track custom events", async () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      const initialEventCount = result.current.getMetrics().eventCount;

      await act(async () => {
        result.current.trackEvent("user_interaction", { action: "click" });
      });

      const finalEventCount = result.current.getMetrics().eventCount;
      expect(finalEventCount).toBe(initialEventCount + 1);
    });

    it("should provide component metrics", () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent", { variant: "test" }),
      );

      const metrics = result.current.getMetrics();

      expect(metrics.componentName).toBe("TestComponent");
      expect(metrics).toHaveProperty("renderCount");
      expect(metrics).toHaveProperty("errorCount");
      expect(metrics).toHaveProperty("eventCount");
    });

    it("should work without global tracker initialized", async () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      await act(async () => {
        const measurement = result.current.startMeasurement("no_tracker_op");
        measurement.success();
      });

      // Should not throw, just not record globally
      expect(result.current.getMetrics()).toBeDefined();
    });

    it("should track events without metadata", () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("ButtonComponent"),
      );

      act(() => {
        result.current.trackEvent("click");
      });

      const metrics = result.current.getMetrics();
      expect(metrics.eventCount).toBe(1);
    });

    it("should track events with metadata", () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("FormComponent"),
      );

      act(() => {
        result.current.trackEvent("submit", { formId: "contact-form" });
      });

      const metrics1 = result.current.getMetrics();
      expect(metrics1.eventCount).toBe(1);

      act(() => {
        result.current.trackEvent("submit", {
          formId: "contact-form",
          fieldCount: 5,
        });
      });

      const metrics2 = result.current.getMetrics();
      expect(metrics2.eventCount).toBe(2);
    });

    it("should track multiple events", () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      act(() => {
        result.current.trackEvent("event1");
        result.current.trackEvent("event2");
        result.current.trackEvent("event3");
      });

      const metrics = result.current.getMetrics();
      expect(metrics.eventCount).toBe(3);
    });

    it("should send events to analytics tracker if available", () => {
      const mockAnalyticsTrack = jest.fn();

      (globalThis as any).__DIVINE_ANALYTICS__ = {
        track: mockAnalyticsTrack,
      };

      const context = { variant: "primary" };
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent", context),
      );

      const metadata = { buttonId: "submit" };

      act(() => {
        result.current.trackEvent("button_click", metadata);
      });

      expect(mockAnalyticsTrack).toHaveBeenCalledWith({
        component: "TestComponent",
        event: "button_click",
        metadata,
        context,
        timestamp: expect.any(Number),
      });
    });

    it("should work without analytics tracker", () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      expect(() => {
        act(() => {
          result.current.trackEvent("click");
        });
      }).not.toThrow();
    });
  });

  describe("Global Performance Tracking Initialization", () => {
    it("should initialize global trackers", () => {
      initializeDivinePerformanceTracking();

      expect((globalThis as any).__DIVINE_PERFORMANCE__).toBeDefined();
      expect(
        (globalThis as any).__DIVINE_PERFORMANCE__.recordMetric,
      ).toBeDefined();
      expect(
        (globalThis as any).__DIVINE_PERFORMANCE__.getMetrics,
      ).toBeDefined();
      expect(
        (globalThis as any).__DIVINE_PERFORMANCE__.getComponentMetrics,
      ).toBeDefined();
      expect(
        (globalThis as any).__DIVINE_PERFORMANCE__.clearMetrics,
      ).toBeDefined();

      expect((globalThis as any).__DIVINE_ANALYTICS__).toBeDefined();
      expect((globalThis as any).__DIVINE_ANALYTICS__.track).toBeDefined();
    });

    it("should record metrics globally", () => {
      initializeDivinePerformanceTracking();

      const metric: DivinePerformanceMetric = {
        component: "TestComponent",
        operation: "test_op",
        duration: 123,
        success: true,
        timestamp: Date.now(),
      };

      (globalThis as any).__DIVINE_PERFORMANCE__.recordMetric(metric);

      const metrics = (globalThis as any).__DIVINE_PERFORMANCE__.getMetrics();
      expect(metrics).toContainEqual(metric);
    });

    it("should get component-specific metrics", () => {
      initializeDivinePerformanceTracking();

      const metric1: DivinePerformanceMetric = {
        component: "ComponentA",
        operation: "op1",
        duration: 100,
        success: true,
        timestamp: Date.now(),
      };

      const metric2: DivinePerformanceMetric = {
        component: "ComponentB",
        operation: "op2",
        duration: 200,
        success: true,
        timestamp: Date.now(),
      };

      (globalThis as any).__DIVINE_PERFORMANCE__.recordMetric(metric1);
      (globalThis as any).__DIVINE_PERFORMANCE__.recordMetric(metric2);

      const componentAMetrics = (
        globalThis as any
      ).__DIVINE_PERFORMANCE__.getComponentMetrics("ComponentA");

      expect(componentAMetrics.length).toBe(1);
      expect(componentAMetrics[0].component).toBe("ComponentA");
    });

    it("should clear metrics", () => {
      initializeDivinePerformanceTracking();

      const metric: DivinePerformanceMetric = {
        component: "TestComponent",
        operation: "test_op",
        duration: 123,
        success: true,
        timestamp: Date.now(),
      };

      (globalThis as any).__DIVINE_PERFORMANCE__.recordMetric(metric);
      expect(
        (globalThis as any).__DIVINE_PERFORMANCE__.getMetrics().length,
      ).toBeGreaterThan(0);

      (globalThis as any).__DIVINE_PERFORMANCE__.clearMetrics();
      expect(
        (globalThis as any).__DIVINE_PERFORMANCE__.getMetrics().length,
      ).toBe(0);
    });

    it("should limit metrics to 1000 entries", () => {
      initializeDivinePerformanceTracking();

      // Add 1100 metrics
      for (let i = 0; i < 1100; i++) {
        (globalThis as any).__DIVINE_PERFORMANCE__.recordMetric({
          component: "TestComponent",
          operation: `op_${i}`,
          duration: 100,
          success: true,
          timestamp: Date.now(),
        });
      }

      const metrics = (globalThis as any).__DIVINE_PERFORMANCE__.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(1000);
    });
  });

  describe("Integration with React Lifecycle", () => {
    it("should track component unmount", () => {
      const { result, unmount } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      const metricsBeforeUnmount = result.current.getMetrics();
      expect(metricsBeforeUnmount).toBeDefined();

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it("should handle multiple component instances", () => {
      const hook1 = renderHook(() => useComponentConsciousness("Component1"));
      const hook2 = renderHook(() => useComponentConsciousness("Component2"));

      act(() => {
        hook1.result.current.trackEvent("event1");
        hook2.result.current.trackEvent("event2");
      });

      expect(hook1.result.current.getMetrics().componentName).toBe(
        "Component1",
      );
      expect(hook2.result.current.getMetrics().componentName).toBe(
        "Component2",
      );

      expect(hook1.result.current.getMetrics().eventCount).toBe(1);
      expect(hook2.result.current.getMetrics().eventCount).toBe(1);

      hook1.unmount();
      hook2.unmount();
    });
  });

  describe("TypeScript Type Safety", () => {
    it("should have properly typed return object", () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      const consciousness: ComponentConsciousness = result.current;

      expect(typeof consciousness.startMeasurement).toBe("function");
      expect(typeof consciousness.trackEvent).toBe("function");
      expect(typeof consciousness.getMetrics).toBe("function");
    });

    it("should have properly typed metrics", () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      const metrics: ComponentMetrics = result.current.getMetrics();

      expect(typeof metrics.componentName).toBe("string");
      expect(typeof metrics.renderCount).toBe("number");
      expect(typeof metrics.lastRenderTime).toBe("number");
      expect(typeof metrics.averageRenderTime).toBe("number");
      expect(typeof metrics.errorCount).toBe("number");
      expect(typeof metrics.eventCount).toBe("number");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty component name", () => {
      const { result } = renderHook(() => useComponentConsciousness(""));

      expect(result.current.getMetrics().componentName).toBe("");
    });

    it("should handle very long component names", () => {
      const longName = "A".repeat(1000);

      const { result } = renderHook(() => useComponentConsciousness(longName));

      expect(result.current.getMetrics().componentName).toBe(longName);
    });

    it("should handle special characters in component name", () => {
      const specialName = "Test-Component_123@#$";

      const { result } = renderHook(() =>
        useComponentConsciousness(specialName),
      );

      expect(result.current.getMetrics().componentName).toBe(specialName);
    });

    it("should handle rapid-fire events", () => {
      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.trackEvent(`event_${i}`);
        }
      });

      const metrics = result.current.getMetrics();
      expect(metrics.eventCount).toBe(100);
    });

    it("should handle measurements with zero duration", async () => {
      initializeDivinePerformanceTracking();

      const { result } = renderHook(() =>
        useComponentConsciousness("TestComponent"),
      );

      await act(async () => {
        const measurement = result.current.startMeasurement("instant_op");
        measurement.success(); // Immediate success
      });

      const metrics = (globalThis as any).__DIVINE_PERFORMANCE__.getMetrics();
      const instantMetric = metrics.find(
        (m: DivinePerformanceMetric) => m.operation === "instant_op",
      );

      expect(instantMetric).toBeDefined();
      expect(instantMetric.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
