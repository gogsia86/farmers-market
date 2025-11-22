/**
 * REAL-TIME PERFORMANCE MONITORING DASHBOARD
 * Live component consciousness and agricultural metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  component?: string;
  metadata?: Record<string, any>;
}

export interface AgriculturalMetric {
  season: string;
  consciousness: number;
  biodynamicScore: number;
  soilHealth: number;
  timestamp: number;
}

export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  errorCount: number;
  interactionCount: number;
  lastUpdated: number;
}

class PerformanceDashboard {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics = new Map<string, ComponentMetrics>();
  private agriculturalMetrics: AgriculturalMetric[] = [];
  private subscribers = new Set<(metrics: any) => void>();
  private readonly maxMetrics = 1000;

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    this.notifySubscribers();
  }

  recordComponentMetric(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);

    if (existing) {
      const newRenderCount = existing.renderCount + 1;
      const newAverageTime =
        (existing.averageRenderTime * existing.renderCount + renderTime) /
        newRenderCount;

      this.componentMetrics.set(componentName, {
        ...existing,
        renderCount: newRenderCount,
        averageRenderTime: newAverageTime,
        interactionCount: existing.interactionCount + 1,
        lastUpdated: Date.now(),
      });
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderCount: 1,
        averageRenderTime: renderTime,
        errorCount: 0,
        interactionCount: 1,
        lastUpdated: Date.now(),
      });
    }

    this.notifySubscribers();
  }

  recordComponentError(componentName: string, error: Error): void {
    const existing = this.componentMetrics.get(componentName);

    if (existing) {
      this.componentMetrics.set(componentName, {
        ...existing,
        errorCount: existing.errorCount + 1,
        lastUpdated: Date.now(),
      });
    }

    this.recordMetric({
      name: "component_error",
      value: 1,
      timestamp: Date.now(),
      component: componentName,
      metadata: {
        error: error.message,
        stack: error.stack,
      },
    });
  }

  recordAgriculturalMetric(metric: AgriculturalMetric): void {
    this.agriculturalMetrics.push(metric);

    if (this.agriculturalMetrics.length > this.maxMetrics) {
      this.agriculturalMetrics = this.agriculturalMetrics.slice(
        -this.maxMetrics
      );
    }

    this.notifySubscribers();
  }

  subscribe(callback: (metrics: any) => void): () => void {
    this.subscribers.add(callback);

    // Send initial data
    callback(this.getSnapshot());

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    const snapshot = this.getSnapshot();
    this.subscribers.forEach((callback) => callback(snapshot));
  }

  getSnapshot() {
    return {
      performance: this.getPerformanceStats(),
      components: Array.from(this.componentMetrics.values()),
      agricultural: this.getAgriculturalStats(),
      timestamp: Date.now(),
    };
  }

  private getPerformanceStats() {
    const recentMetrics = this.metrics.slice(-100);

    if (recentMetrics.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        count: 0,
      };
    }

    const values = recentMetrics.map((m) => m.value);

    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
      recent: recentMetrics.slice(-10),
    };
  }

  private getAgriculturalStats() {
    const recent = this.agriculturalMetrics.slice(-10);

    if (recent.length === 0) {
      return {
        averageConsciousness: 0,
        averageBiodynamicScore: 0,
        averageSoilHealth: 0,
        currentSeason: "UNKNOWN",
      };
    }

    return {
      averageConsciousness:
        recent.reduce((sum, m) => sum + m.consciousness, 0) / recent.length,
      averageBiodynamicScore:
        recent.reduce((sum, m) => sum + m.biodynamicScore, 0) / recent.length,
      averageSoilHealth:
        recent.reduce((sum, m) => sum + m.soilHealth, 0) / recent.length,
      currentSeason: recent[recent.length - 1]?.season || "UNKNOWN",
      history: recent,
    };
  }

  getTopComponents(limit = 10): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values())
      .sort((a, b) => b.renderCount - a.renderCount)
      .slice(0, limit);
  }

  getSlowestComponents(limit = 10): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values())
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, limit);
  }

  getComponentsWithErrors(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values()).filter(
      (m) => m.errorCount > 0
    );
  }

  clear(): void {
    this.metrics = [];
    this.componentMetrics.clear();
    this.agriculturalMetrics = [];
    this.notifySubscribers();
  }
}

// Global singleton
let dashboardInstance: PerformanceDashboard | null = null;

export function getPerformanceDashboard(): PerformanceDashboard {
  if (!dashboardInstance) {
    dashboardInstance = new PerformanceDashboard();
  }
  return dashboardInstance;
}
