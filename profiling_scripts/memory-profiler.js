// Memory profiling for Jest test suite
const v8 = require('v8');
const { performance } = require('perf_hooks');

class MemoryProfiler {
  constructor() {
    this.snapshots = new Map();
    this.stats = [];
  }

  takeSnapshot(label) {
    const snapshot = v8.getHeapSnapshot();
    this.snapshots.set(label, {
      timestamp: performance.now(),
      snapshot,
    });
  }

  recordStats() {
    const stats = v8.getHeapStatistics();
    const timestamp = performance.now();

    this.stats.push({
      timestamp,
      heapTotal: stats.total_heap_size,
      heapUsed: stats.used_heap_size,
      external: stats.external_memory,
      heapLimit: stats.heap_size_limit,
    });

    // Alert if memory usage is high
    const heapUsagePercent = (stats.used_heap_size / stats.heap_size_limit) * 100;
    if (heapUsagePercent > 80) {
      console.warn(`High memory usage: ${heapUsagePercent.toFixed(2)}% of heap limit`);
    }
  }

  compareSnapshots(beforeLabel, afterLabel) {
    const before = this.snapshots.get(beforeLabel);
    const after = this.snapshots.get(afterLabel);

    if (!before || !after) {
      throw new Error('Snapshot not found');
    }

    // Compare snapshots and find memory leaks
    return {
      timeDiff: after.timestamp - before.timestamp,
      // Add detailed heap comparison logic here
    };
  }

  getStats() {
    return {
      current: v8.getHeapStatistics(),
      history: this.stats,
      peaks: {
        heapTotal: Math.max(...this.stats.map(s => s.heapTotal)),
        heapUsed: Math.max(...this.stats.map(s => s.heapUsed)),
      },
    };
  }

  startTracking(intervalMs = 1000) {
    this.interval = setInterval(() => this.recordStats(), intervalMs);
  }

  stopTracking() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    return this.getStats();
  }
}

// Export singleton instance
const memoryProfiler = new MemoryProfiler();
module.exports = memoryProfiler;
