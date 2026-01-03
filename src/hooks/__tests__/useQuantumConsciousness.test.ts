/**
 * 🧠 QUANTUM CONSCIOUSNESS HOOK TESTS
 * Divine performance tracking and consciousness measurement
 */

import { act, renderHook } from "@testing-library/react";
import { useQuantumConsciousness } from "../useQuantumConsciousness";

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
global.performance.now = mockPerformanceNow;

describe("🌾 useQuantumConsciousness - Component Consciousness Tracking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("⚡ Basic Initialization", () => {
    it("should initialize with component name", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      expect(result.current.isInitialized).toBe(true);
    });

    it("should initialize successfully", () => {
      const { result } = renderHook(() => useQuantumConsciousness("FarmCard"));

      // Verify initialization completed
      expect(result.current.isInitialized).toBe(true);
    });

    it("should only log initialization once", () => {
      const { rerender } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      const initialCallCount = (console.log as jest.Mock).mock.calls.length;

      rerender();
      rerender();

      expect((console.log as jest.Mock).mock.calls.length).toBe(
        initialCallCount,
      );
    });

    it("should provide all required functions", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      expect(result.current.startMeasurement).toBeDefined();
      expect(result.current.trackInteraction).toBeDefined();
      expect(result.current.getMetrics).toBeDefined();
      expect(result.current.isInitialized).toBeDefined();
    });
  });

  describe("📊 Metrics Tracking", () => {
    it("should track render count", () => {
      const { result, rerender } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      rerender();
      rerender();

      const metrics = result.current.getMetrics();
      expect(metrics.renders).toBeGreaterThan(0);
    });

    it("should initialize metrics with zero values", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      const metrics = result.current.getMetrics();

      expect(metrics.interactions).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.measurements).toEqual([]);
    });

    it("should calculate average measurement time", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValueOnce(0);
      mockPerformanceNow.mockReturnValueOnce(100);

      const m1 = result.current.startMeasurement("op1");
      act(() => m1.success());

      mockPerformanceNow.mockReturnValueOnce(0);
      mockPerformanceNow.mockReturnValueOnce(200);

      const m2 = result.current.startMeasurement("op2");
      act(() => m2.success());

      const metrics = result.current.getMetrics();
      expect(metrics.averageMeasurementTime).toBe(150);
    });

    it("should calculate success rate", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValue(0);

      const m1 = result.current.startMeasurement("op1");
      act(() => m1.success());

      const m2 = result.current.startMeasurement("op2");
      act(() => m2.failure(new Error("Test")));

      const m3 = result.current.startMeasurement("op3");
      act(() => m3.success());

      const metrics = result.current.getMetrics();
      expect(metrics.successRate).toBeCloseTo(0.666, 2);
    });
  });

  describe("⏱️ Performance Measurement", () => {
    it("should start a measurement", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      const measurement = result.current.startMeasurement("testOperation");

      expect(measurement).toBeDefined();
      expect(measurement.success).toBeDefined();
      expect(measurement.failure).toBeDefined();
    });

    it("should track successful measurements", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValue(0);

      const measurement = result.current.startMeasurement("operation");
      act(() => measurement.success());

      const metrics = result.current.getMetrics();
      expect(metrics.measurements).toHaveLength(1);
      expect(metrics.measurements[0].success).toBe(true);
    });

    it("should track failed measurements", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValue(0);

      const measurement = result.current.startMeasurement("operation");
      act(() => measurement.failure(new Error("Test error")));

      const metrics = result.current.getMetrics();
      expect(metrics.measurements).toHaveLength(1);
      expect(metrics.measurements[0].success).toBe(false);
    });

    it("should track error count", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValue(0);

      const measurement = result.current.startMeasurement("operation");
      act(() => measurement.failure(new Error("Test error")));

      const metrics = result.current.getMetrics();
      expect(metrics.errors).toBe(1);
    });

    it("should track multiple measurements", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValue(0);

      const m1 = result.current.startMeasurement("op1");
      act(() => m1.success());

      const m2 = result.current.startMeasurement("op2");
      act(() => m2.success());

      const m3 = result.current.startMeasurement("op3");
      act(() => m3.success());

      const metrics = result.current.getMetrics();
      expect(metrics.measurements).toHaveLength(3);
    });

    it("should preserve measurement start time", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValueOnce(100);
      const measurement = result.current.startMeasurement("operation");

      expect(measurement.startTime).toBe(100);
    });

    it("should calculate correct duration", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValueOnce(100);
      mockPerformanceNow.mockReturnValueOnce(250);

      const measurement = result.current.startMeasurement("operation");
      act(() => measurement.success());

      const metrics = result.current.getMetrics();
      expect(metrics.measurements[0].duration).toBe(150);
    });
  });

  describe("🎯 Interaction Tracking", () => {
    it("should track interactions", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      act(() => {
        result.current.trackInteraction("buttonClick");
      });

      const metrics = result.current.getMetrics();
      expect(metrics.interactions).toBe(1);
    });

    it("should track multiple interactions", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      act(() => {
        result.current.trackInteraction("click1");
        result.current.trackInteraction("click2");
        result.current.trackInteraction("click3");
      });

      const metrics = result.current.getMetrics();
      expect(metrics.interactions).toBe(3);
    });

    it("should not log interactions by default", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      act(() => {
        result.current.trackInteraction("testInteraction");
      });

      // Check that no interaction tracking was logged (trackInteractions not enabled)
      const logCalls = (console.log as jest.Mock).mock.calls;
      const interactionLogged = logCalls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" && arg.includes("Interaction tracked"),
        ),
      );
      expect(interactionLogged).toBe(false);
    });
  });

  describe("⚙️ Options Configuration", () => {
    it("should track performance when enabled", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent", { trackPerformance: true }),
      );

      mockPerformanceNow.mockReturnValueOnce(0);
      mockPerformanceNow.mockReturnValueOnce(150); // Slow operation > 100ms

      const measurement = result.current.startMeasurement("slowOperation");
      act(() => measurement.success());

      // Structured logger outputs to console.warn with formatted string
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Slow operation detected"),
      );
    });

    it("should not warn about fast operations", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent", { trackPerformance: true }),
      );

      mockPerformanceNow.mockReturnValueOnce(0);
      mockPerformanceNow.mockReturnValueOnce(50); // Fast operation < 100ms

      const measurement = result.current.startMeasurement("fastOperation");
      act(() => measurement.success());

      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should track errors when enabled", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent", { trackErrors: true }),
      );

      mockPerformanceNow.mockReturnValue(0);

      const error = new Error("Test error");
      const measurement = result.current.startMeasurement("failingOperation");
      act(() => measurement.failure(error));

      // Structured logger outputs to console.error
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Operation failed"),
      );
    });

    it("should not log errors by default", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValue(0);

      const measurement = result.current.startMeasurement("operation");
      act(() => measurement.failure(new Error("Test error")));

      expect(console.error).not.toHaveBeenCalled();
    });

    it("should track interactions when enabled", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent", { trackInteractions: true }),
      );

      act(() => {
        result.current.trackInteraction("testInteraction");
      });

      // Verify interaction was tracked in metrics
      const metrics = result.current.getMetrics();
      expect(metrics.interactions).toBe(1);
    });

    it("should accept all options together", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent", {
          trackPerformance: true,
          trackErrors: true,
          trackInteractions: true,
        }),
      );

      expect(result.current).toBeDefined();
    });

    it("should work with empty options", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent", {}),
      );

      expect(result.current).toBeDefined();
    });
  });

  describe("🌾 Agricultural Component Scenarios", () => {
    it("should work with FarmCard component", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("FarmCard", {
          trackPerformance: true,
          trackInteractions: true,
        }),
      );

      act(() => {
        result.current.trackInteraction("viewDetails");
      });

      mockPerformanceNow.mockReturnValue(0);
      const measurement = result.current.startMeasurement("renderFarmData");
      mockPerformanceNow.mockReturnValue(50);
      act(() => measurement.success());

      const metrics = result.current.getMetrics();
      expect(metrics.interactions).toBe(1);
      expect(metrics.measurements).toHaveLength(1);
    });

    it("should work with ProductCard component", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("ProductCard", {
          trackPerformance: true,
        }),
      );

      mockPerformanceNow.mockReturnValue(0);
      const m1 = result.current.startMeasurement("loadProductImage");
      mockPerformanceNow.mockReturnValue(45);
      act(() => m1.success());

      const metrics = result.current.getMetrics();
      expect(metrics.measurements[0].operation).toBe("loadProductImage");
      expect(metrics.measurements[0].duration).toBe(45);
    });

    it("should work with OrderSummary component", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("OrderSummary", {
          trackPerformance: true,
          trackErrors: true,
        }),
      );

      mockPerformanceNow.mockReturnValue(0);
      const measurement = result.current.startMeasurement("calculateTotal");
      mockPerformanceNow.mockReturnValue(25);
      act(() => measurement.success());

      const metrics = result.current.getMetrics();
      expect(metrics.measurements[0].success).toBe(true);
    });
  });

  describe("🔬 Edge Cases", () => {
    it("should handle zero duration measurements", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValue(100);

      const measurement = result.current.startMeasurement("instantOperation");
      act(() => measurement.success());

      const metrics = result.current.getMetrics();
      expect(metrics.measurements[0].duration).toBe(0);
    });

    it("should handle empty component name", () => {
      const { result } = renderHook(() => useQuantumConsciousness(""));

      expect(result.current.isInitialized).toBe(true);
    });

    it("should handle very long operation names", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      const longName = "a".repeat(1000);
      mockPerformanceNow.mockReturnValue(0);

      const measurement = result.current.startMeasurement(longName);
      act(() => measurement.success());

      const metrics = result.current.getMetrics();
      expect(metrics.measurements[0].operation).toBe(longName);
    });

    it("should handle measurement without completion", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      // Start but never complete
      result.current.startMeasurement("unfinishedOperation");

      const metrics = result.current.getMetrics();
      // Should not be in measurements array
      expect(metrics.measurements).toHaveLength(0);
    });

    it("should handle multiple failures", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      mockPerformanceNow.mockReturnValue(0);

      const m1 = result.current.startMeasurement("op1");
      act(() => m1.failure(new Error("Error 1")));

      const m2 = result.current.startMeasurement("op2");
      act(() => m2.failure(new Error("Error 2")));

      const m3 = result.current.startMeasurement("op3");
      act(() => m3.failure(new Error("Error 3")));

      const metrics = result.current.getMetrics();
      expect(metrics.errors).toBe(3);
      expect(metrics.successRate).toBe(0);
    });

    it("should return 1.0 success rate with no measurements", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      const metrics = result.current.getMetrics();
      expect(metrics.successRate).toBe(1);
    });

    it("should return 0 average time with no measurements", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("TestComponent"),
      );

      const metrics = result.current.getMetrics();
      expect(metrics.averageMeasurementTime).toBe(0);
    });
  });

  describe("🌟 Divine Perfection", () => {
    it("should maintain consciousness across multiple operations", () => {
      const { result } = renderHook(() =>
        useQuantumConsciousness("DivineFarmComponent", {
          trackPerformance: true,
          trackErrors: true,
          trackInteractions: true,
        }),
      );

      mockPerformanceNow.mockReturnValue(0);

      // Simulate real-world component lifecycle
      act(() => {
        result.current.trackInteraction("componentMount");
      });

      const loadData = result.current.startMeasurement("loadFarmData");
      mockPerformanceNow.mockReturnValue(80);
      act(() => loadData.success());

      act(() => {
        result.current.trackInteraction("userClick");
      });

      const processClick = result.current.startMeasurement("handleClick");
      mockPerformanceNow.mockReturnValue(100);
      act(() => processClick.success());

      const metrics = result.current.getMetrics();
      expect(metrics.interactions).toBe(2);
      expect(metrics.measurements).toHaveLength(2);
      expect(metrics.errors).toBe(0);
      expect(metrics.successRate).toBe(1);
    });
  });
});
