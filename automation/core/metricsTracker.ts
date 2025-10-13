/**
 * Interface for prediction metrics
 */
export interface PredictionMetrics {
  modelId: string;
  duration: number;
  inputSize: number;
  outputSize: number;
}

/**
 * Interface for optimization metrics
 */
export interface OptimizationMetrics {
  problemType: string;
  duration: number;
  parameterCount: number;
  constraintCount: number;
}

/**
 * Interface for model update metrics
 */
export interface ModelUpdateMetrics {
  modelId: string;
  duration: number;
  dataSize: number;
}

/**
 * Interface for system-wide metrics
 */
export interface SystemMetrics {
  totalPredictions: number;
  totalOptimizations: number;
  totalModelUpdates: number;
  averagePredictionTime: number;
  averageOptimizationTime: number;
  averageModelUpdateTime: number;
  uptime: number;
  lastUpdated: Date;
}

/**
 * Class for tracking system metrics
 */
export class MetricsTracker {
  private initialized: boolean = false;
  private startTime: number = Date.now();

  private metrics: SystemMetrics = {
    totalPredictions: 0,
    totalOptimizations: 0,
    totalModelUpdates: 0,
    averagePredictionTime: 0,
    averageOptimizationTime: 0,
    averageModelUpdateTime: 0,
    uptime: 0,
    lastUpdated: new Date()
  };

  private modelMetrics: Map<string, {
    predictions: PredictionMetrics[];
    updates: ModelUpdateMetrics[];
  }> = new Map();

  /**
   * Initialize the metrics tracker
   */
  public async initialize(): Promise<void> {
    this.initialized = true;
    this.startTime = Date.now();
  }

  /**
   * Track a prediction event
   */
  public trackPrediction(metrics: PredictionMetrics): void {
    this.validateState();

    // Update system-wide metrics
    this.metrics.totalPredictions++;
    this.metrics.averagePredictionTime = this.updateAverage(
      this.metrics.averagePredictionTime,
      metrics.duration,
      this.metrics.totalPredictions
    );

    // Update model-specific metrics
    this.getOrCreateModelMetrics(metrics.modelId).predictions.push(metrics);
    this.updateTimestamp();
  }

  /**
   * Track an optimization event
   */
  public trackOptimization(metrics: OptimizationMetrics): void {
    this.validateState();

    // Update system-wide metrics
    this.metrics.totalOptimizations++;
    this.metrics.averageOptimizationTime = this.updateAverage(
      this.metrics.averageOptimizationTime,
      metrics.duration,
      this.metrics.totalOptimizations
    );

    this.updateTimestamp();
  }

  /**
   * Track a model update event
   */
  public trackModelUpdate(metrics: ModelUpdateMetrics): void {
    this.validateState();

    // Update system-wide metrics
    this.metrics.totalModelUpdates++;
    this.metrics.averageModelUpdateTime = this.updateAverage(
      this.metrics.averageModelUpdateTime,
      metrics.duration,
      this.metrics.totalModelUpdates
    );

    // Update model-specific metrics
    this.getOrCreateModelMetrics(metrics.modelId).updates.push(metrics);
    this.updateTimestamp();
  }

  /**
   * Get metrics for a specific model
   */
  public async getModelMetrics(modelId: string): Promise<any> {
    this.validateState();

    const modelMetrics = this.modelMetrics.get(modelId);
    if (!modelMetrics) {
      return {
        totalPredictions: 0,
        totalUpdates: 0,
        averagePredictionTime: 0,
        averageUpdateTime: 0
      };
    }

    const { predictions, updates } = modelMetrics;
    return {
      totalPredictions: predictions.length,
      totalUpdates: updates.length,
      averagePredictionTime: this.calculateAverage(predictions.map(p => p.duration)),
      averageUpdateTime: this.calculateAverage(updates.map(u => u.duration))
    };
  }

  /**
   * Get system-wide metrics
   */
  public async getSystemMetrics(): Promise<SystemMetrics> {
    this.validateState();
    this.metrics.uptime = Date.now() - this.startTime;
    return { ...this.metrics };
  }

  /**
   * Check tracker health
   */
  public async healthCheck(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Validate tracker state
   */
  private validateState(): void {
    if (!this.initialized) {
      throw new Error('Metrics tracker not initialized');
    }
  }

  /**
   * Get or create metrics for a model
   */
  private getOrCreateModelMetrics(modelId: string): {
    predictions: PredictionMetrics[];
    updates: ModelUpdateMetrics[];
  } {
    if (!this.modelMetrics.has(modelId)) {
      this.modelMetrics.set(modelId, {
        predictions: [],
        updates: []
      });
    }
    return this.modelMetrics.get(modelId)!;
  }

  /**
   * Update average value
   */
  private updateAverage(
    currentAvg: number,
    newValue: number,
    totalCount: number
  ): number {
    return (currentAvg * (totalCount - 1) + newValue) / totalCount;
  }

  /**
   * Calculate average from array
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Update last updated timestamp
   */
  private updateTimestamp(): void {
    this.metrics.lastUpdated = new Date();
  }
}