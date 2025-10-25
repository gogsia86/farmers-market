// NVTX Profiler for JavaScript test suites
const { performance } = require('perf_hooks');

class NVTXProfiler {
  constructor() {
    this.enabled = process.env.NVTX_PROFILER_ENABLED === '1';
    this.markers = new Map();
  }

  markStart(name, attributes = {}) {
    if (!this.enabled) return;

    const start = performance.now();
    this.markers.set(name, {
      start,
      attributes,
    });

    // Record NVTX event start
    process.emit('nvtx:mark_start', {
      name,
      timestamp: start,
      attributes,
    });
  }

  markEnd(name) {
    if (!this.enabled) return;

    const marker = this.markers.get(name);
    if (!marker) return;

    const end = performance.now();
    const duration = end - marker.start;

    // Record NVTX event end
    process.emit('nvtx:mark_end', {
      name,
      timestamp: end,
      duration,
      attributes: marker.attributes,
    });

    this.markers.delete(name);
  }

  async startProfile(config = {}) {
    if (!this.enabled) return;

    // Initialize profiling session
    process.emit('nvtx:session_start', {
      timestamp: performance.now(),
      config,
    });
  }

  endProfile() {
    if (!this.enabled) return;

    // End profiling session
    process.emit('nvtx:session_end', {
      timestamp: performance.now(),
    });
  }
}

const profiler = new NVTXProfiler();

module.exports = {
  startNvtxProfile: profiler.startProfile.bind(profiler),
  markStart: profiler.markStart.bind(profiler),
  markEnd: profiler.markEnd.bind(profiler),
};
