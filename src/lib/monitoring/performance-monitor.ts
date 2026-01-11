/**
 * 🧠 DIVINE PATTERN: Performance Monitor Stub
 * 📚 Reference: 03_PERFORMANCE_REALITY_BENDING.instructions.md
 * ⚡ Placeholder for performance monitoring functionality
 */

// Stub implementation for performance monitor

import { logger } from "@/lib/monitoring/logger";

export class PerformanceMonitor {
  static start(label: string) {
    return { label, startTime: Date.now() };
  }

  static end(marker: { label: string; startTime: number }) {
    const duration = Date.now() - marker.startTime;
    logger.info(`[PERF] ${marker.label}: ${duration}ms`);
  }
}

export default PerformanceMonitor;
