export const quantumMonitoringConfig = {
  thresholds: {
    minCoherence: 0.3,
    maxDecoherence: 0.7,
    maxEntanglements: 100
  },
  resonance: {
    baseFrequency: 432,     // Natural frequency
    samplingRate: 60,       // 60Hz monitoring
    coherenceThreshold: 0.7, // 70% minimum coherence
    harmonicSensitivity: 0.85, // 85% harmonic sensitivity
    dimensionalDepth: 7     // Monitor 7 dimensions
  },
  alerts: {
    'low-coherence': {
      severity: 'critical',
      threshold: 0.5,
      message: 'Quantum coherence below critical threshold'
    },
    'resonance-instability': {
      severity: 'warning',
      threshold: 0.6,
      message: 'Resonance stability degrading'
    },
    'consciousness-degradation': {
      severity: 'error',
      threshold: 0.7,
      message: 'Consciousness level unstable'
    }
  },
  monitoring: {
    interval: 1000, // Check every second
    retention: 7 * 24 * 60 * 60 * 1000 // Keep 7 days of metrics
  }
};