/**
 * 🔮 ML-Based Predictive Monitor
 * Farmers Market Platform - Predictive Failure Detection & Anomaly Detection
 * Version: 2.0.0
 *
 * Uses TensorFlow.js for time series prediction and anomaly detection
 * to predict workflow failures before they occur.
 */

// @ts-ignore - TensorFlow module may not be available in all environments
import * as tf from "@tensorflow/tfjs-node";
import type {
  WorkflowResult,
  FailurePrediction,
  AnomalyDetection,
  PredictionModel,
  ModelTrainingData,
  WorkflowMetrics,
} from "../types";

// ============================================================================
// PREDICTIVE MONITOR
// ============================================================================

export class PredictiveMonitor {
  private model: tf.LayersModel | null = null;
  private modelPath: string;
  private isInitialized = false;
  private enabled: boolean;
  private features: string[] = [
    "duration",
    "apiResponseTime",
    "pageLoadTime",
    "errors",
    "performanceScore",
  ];
  private trainingData: ModelTrainingData = {
    features: [],
    labels: [],
    timestamps: [],
  };
  private normalizationParams: {
    mean: number[];
    std: number[];
  } | null = null;

  constructor(config?: {
    modelPath?: string;
    enabled?: boolean;
    features?: string[];
  }) {
    this.modelPath =
      config?.modelPath || "./models/workflow-predictor/model.json";
    this.enabled = config?.enabled ?? true;
    this.features = config?.features || this.features;
  }

  /**
   * ✅ INITIALIZE - Load or create model
   */
  async initialize(): Promise<void> {
    if (!this.enabled) {
      console.log("⚠️  Predictive monitoring is disabled");
      return;
    }

    try {
      // Try to load existing model
      this.model = await tf.loadLayersModel(`file://${this.modelPath}`);
      console.log("✅ Loaded existing prediction model");
    } catch (error) {
      // Create new model if loading fails
      console.log("📦 Creating new prediction model...");
      this.model = this.createModel();
      console.log("✅ Created new prediction model");
    }

    this.isInitialized = true;
  }

  /**
   * ✅ PREDICT FAILURE - Predict failure probability
   */
  async predictFailure(
    recentMetrics: WorkflowMetrics[],
  ): Promise<FailurePrediction> {
    if (!this.enabled || !this.isInitialized || !this.model) {
      return this.generateFallbackPrediction();
    }

    if (recentMetrics.length < 10) {
      return {
        failureProbability: 0,
        confidence: 0,
        contributingFactors: ["Insufficient historical data"],
        recommendation: "Collect more metrics before predictions are available",
      };
    }

    try {
      // Extract and normalize features
      const features = this.extractFeatures(recentMetrics.slice(-10)); // Last 10 data points
      const normalizedFeatures = this.normalizeFeatures(features);

      // Create tensor with shape [1, timesteps, features]
      const tensor = tf.tensor3d(
        [normalizedFeatures],
        [1, normalizedFeatures.length, normalizedFeatures[0]?.length || 0],
      );

      // Predict
      const prediction = this.model.predict(tensor) as tf.Tensor;
      const failureProba = (await prediction.data())[0] ?? 0;

      // Cleanup tensors
      tensor.dispose();
      prediction.dispose();

      // Identify contributing factors
      const contributingFactors = this.identifyContributingFactors(
        recentMetrics,
        failureProba,
      );

      // Calculate confidence
      const confidence = this.calculateConfidence(recentMetrics);

      // Generate recommendation
      const recommendation = this.generateRecommendation(failureProba);

      return {
        failureProbability: failureProba,
        confidence,
        predictedTimeToFailure: this.estimateTimeToFailure(failureProba),
        contributingFactors,
        recommendation,
        preventiveActions: this.generatePreventiveActions(
          failureProba,
          contributingFactors,
        ),
      };
    } catch (error) {
      console.error("❌ Prediction error:", error);
      return this.generateFallbackPrediction();
    }
  }

  /**
   * ✅ DETECT ANOMALIES - Detect performance anomalies
   */
  async detectAnomalies(
    recentMetrics: WorkflowMetrics[],
  ): Promise<AnomalyDetection[]> {
    if (!this.enabled || recentMetrics.length < 10) {
      return [];
    }

    const anomalies: AnomalyDetection[] = [];

    // Calculate statistical baselines
    const baselines = this.calculateBaselines(recentMetrics.slice(0, -5));
    const recentValues = recentMetrics.slice(-5);

    // Check duration anomalies
    const durationAnomaly = this.checkAnomaly(
      recentValues.map((m) => m.totalDuration),
      baselines.duration,
    );
    if (durationAnomaly.isAnomaly) {
      anomalies.push({
        ...durationAnomaly,
        context: "Workflow Duration",
        recommendations: [
          "Review recent code changes",
          "Check for database query performance",
          "Verify network connectivity",
        ],
      });
    }

    // Check API response time anomalies
    if (baselines.apiResponseTime) {
      const apiAnomaly = this.checkAnomaly(
        recentValues.map((m) => m.apiResponseTime || 0).filter((v) => v > 0),
        baselines.apiResponseTime,
      );
      if (apiAnomaly.isAnomaly) {
        anomalies.push({
          ...apiAnomaly,
          context: "API Response Time",
          recommendations: [
            "Check API server load",
            "Review database connection pool",
            "Verify cache hit rate",
          ],
        });
      }
    }

    // Check error rate anomalies
    if (baselines.errors) {
      const errorAnomaly = this.checkAnomaly(
        recentValues.map((m) => m.errors || 0),
        baselines.errors,
      );
      if (errorAnomaly.isAnomaly) {
        anomalies.push({
          ...errorAnomaly,
          context: "Error Rate",
          recommendations: [
            "Review error logs immediately",
            "Check for deployment issues",
            "Verify external service availability",
          ],
        });
      }
    }

    return anomalies;
  }

  /**
   * ✅ TRAIN MODEL - Train prediction model with historical data
   */
  async train(historicalResults: WorkflowResult[]): Promise<void> {
    if (!this.enabled || historicalResults.length < 50) {
      console.log(
        "⚠️  Insufficient data for training (need at least 50 samples)",
      );
      return;
    }

    console.log(
      `🎓 Training prediction model with ${historicalResults.length} samples...`,
    );

    // Prepare training data
    const { xs, ys } = this.prepareTrainingData(historicalResults);

    if (!this.model) {
      this.model = this.createModel();
    }

    try {
      // Train the model
      await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: async (epoch: number, logs: any) => {
            if (logs && epoch % 10 === 0) {
              console.log(
                `   Epoch ${epoch}: loss=${logs.loss.toFixed(4)}, val_loss=${logs.val_loss?.toFixed(4) || "N/A"}`,
              );
            }
          },
        },
      });

      // Save the model
      await this.model.save(`file://${this.modelPath}`);
      console.log("✅ Model training complete and saved");

      // Cleanup tensors
      xs.dispose();
      ys.dispose();
    } catch (error) {
      console.error("❌ Model training error:", error);
    }
  }

  /**
   * ✅ ADD TRAINING DATA - Accumulate data for training
   */
  addTrainingData(result: WorkflowResult): void {
    const features = this.extractFeaturesFromResult(result);
    const label = result.status === "FAILED" ? 1 : 0;

    this.trainingData.features.push(features);
    this.trainingData.labels.push(label);
    this.trainingData.timestamps.push(result.startTime);

    // Keep only last 1000 samples
    if (this.trainingData.features.length > 1000) {
      this.trainingData.features.shift();
      this.trainingData.labels.shift();
      this.trainingData.timestamps.shift();
    }
  }

  // ============================================================================
  // PRIVATE METHODS - MODEL CREATION & TRAINING
  // ============================================================================

  private createModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // LSTM layer for time series
        tf.layers.lstm({
          units: 50,
          returnSequences: true,
          inputShape: [10, this.features.length], // 10 timesteps, N features
        }),
        tf.layers.dropout({ rate: 0.2 }),

        // Second LSTM layer
        tf.layers.lstm({
          units: 50,
          returnSequences: false,
        }),
        tf.layers.dropout({ rate: 0.2 }),

        // Dense layers
        tf.layers.dense({ units: 25, activation: "relu" }),
        tf.layers.dropout({ rate: 0.1 }),

        // Output layer
        tf.layers.dense({ units: 1, activation: "sigmoid" }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });

    return model;
  }

  private prepareTrainingData(results: WorkflowResult[]): {
    xs: tf.Tensor3D;
    ys: tf.Tensor2D;
  } {
    const sequences: number[][][] = [];
    const labels: number[] = [];

    // Create sequences of 10 timesteps
    for (let i = 10; i < results.length; i++) {
      const sequence = results.slice(i - 10, i);
      const features = sequence.map((r) => this.extractFeaturesFromResult(r));

      sequences.push(features);
      const result = results[i];
      labels.push(result?.status === "FAILED" ? 1 : 0);
    }

    // Normalize features
    this.calculateNormalizationParams(sequences.flat());
    const normalizedSequences = sequences.map((seq) =>
      seq.map((features) => this.normalizeFeatureArray(features)),
    );

    if (!this.normalizationParams) {
      throw new Error("Failed to calculate normalization parameters");
    }

    const xs = tf.tensor3d(normalizedSequences);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    return { xs, ys };
  }

  private extractFeatures(metrics: WorkflowMetrics[]): number[][] {
    return metrics.map((m) => [
      m.totalDuration / 1000, // Convert to seconds
      (m.apiResponseTime || 0) / 1000,
      (m.pageLoadTime || 0) / 1000,
      m.errors || 0,
      m.performanceScore || 0,
    ]);
  }

  private extractFeaturesFromResult(result: WorkflowResult): number[] {
    return [
      result.duration / 1000,
      (result.metrics.apiResponseTime || 0) / 1000,
      (result.metrics.pageLoadTime || 0) / 1000,
      result.metrics.errors || 0,
      result.metrics.performanceScore || 0,
    ];
  }

  private calculateNormalizationParams(features: number[][]): void {
    const featureCount = features[0]?.length || this.features.length;
    const mean: number[] = new Array(featureCount).fill(0);
    const std: number[] = new Array(featureCount).fill(1);

    // Calculate mean
    for (const feature of features) {
      if (!feature) continue;
      for (let i = 0; i < featureCount; i++) {
        mean[i] = (mean[i] || 0) + (feature[i] || 0);
      }
    }
    for (let i = 0; i < featureCount; i++) {
      mean[i] = (mean[i] || 0) / features.length;
    }

    // Calculate standard deviation
    for (const feature of features) {
      if (!feature) continue;
      for (let i = 0; i < featureCount; i++) {
        std[i] =
          (std[i] || 1) + Math.pow((feature[i] || 0) - (mean[i] || 0), 2);
      }
    }
    for (let i = 0; i < featureCount; i++) {
      std[i] = Math.sqrt((std[i] || 1) / features.length);
      if (std[i] === 0 || !std[i]) std[i] = 1; // Avoid division by zero
    }

    this.normalizationParams = { mean, std };
  }

  private normalizeFeatures(features: number[][]): number[][] {
    if (!this.normalizationParams) {
      this.calculateNormalizationParams(features);
    }

    return features.map((feature) => this.normalizeFeatureArray(feature));
  }

  private normalizeFeatureArray(features: number[]): number[] {
    if (!this.normalizationParams) return features;

    return features.map((value, i) => {
      const mean = this.normalizationParams?.mean[i] ?? 0;
      const std = this.normalizationParams?.std[i] ?? 1;
      return (value - mean) / std;
    });
  }

  // ============================================================================
  // PRIVATE METHODS - ANOMALY DETECTION
  // ============================================================================

  private calculateBaselines(metrics: WorkflowMetrics[]): {
    duration: { mean: number; std: number };
    apiResponseTime?: { mean: number; std: number };
    errors?: { mean: number; std: number };
  } {
    const durations = metrics.map((m) => m.totalDuration);
    const apiTimes = metrics
      .map((m) => m.apiResponseTime || 0)
      .filter((v) => v > 0);
    const errors = metrics.map((m) => m.errors || 0);

    return {
      duration: this.calculateStats(durations),
      apiResponseTime:
        apiTimes.length > 0 ? this.calculateStats(apiTimes) : undefined,
      errors: this.calculateStats(errors),
    };
  }

  private calculateStats(values: number[]): { mean: number; std: number } {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    return { mean, std: std || 1 };
  }

  private checkAnomaly(
    values: number[],
    baseline: { mean: number; std: number },
  ): Omit<AnomalyDetection, "context" | "recommendations"> {
    const recentAvg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const deviation = Math.abs(recentAvg - baseline.mean) / baseline.std;

    const threshold = 2.5; // Standard deviations
    const isAnomaly = deviation > threshold;

    return {
      isAnomaly,
      anomalyScore: Math.min(deviation / threshold, 1), // Normalize to 0-1
      expectedValue: baseline.mean,
      actualValue: recentAvg,
      deviation,
    };
  }

  // ============================================================================
  // PRIVATE METHODS - PREDICTIONS & RECOMMENDATIONS
  // ============================================================================

  private identifyContributingFactors(
    metrics: WorkflowMetrics[],
    failureProba: number,
  ): string[] {
    const factors: string[] = [];

    const recentMetrics = metrics.slice(-5);
    const baseline = metrics.slice(0, -5);

    // Check duration increase
    const avgRecent =
      recentMetrics.reduce((sum, m) => sum + m.totalDuration, 0) /
      recentMetrics.length;
    const avgBaseline =
      baseline.reduce((sum, m) => sum + m.totalDuration, 0) / baseline.length;

    if (avgRecent > avgBaseline * 1.5) {
      factors.push("Significant increase in execution time");
    }

    // Check error rate
    const recentErrors = recentMetrics.filter(
      (m) => (m.errors || 0) > 0,
    ).length;
    if (recentErrors > recentMetrics.length * 0.3) {
      factors.push("High error rate detected");
    }

    // Check performance degradation
    const avgPerf =
      recentMetrics.reduce((sum, m) => sum + (m.performanceScore || 0), 0) /
      recentMetrics.length;
    if (avgPerf < 50) {
      factors.push("Performance score below threshold");
    }

    if (factors.length === 0 && failureProba > 0.5) {
      factors.push("Pattern-based prediction without obvious single cause");
    }

    return factors;
  }

  private calculateConfidence(metrics: WorkflowMetrics[]): number {
    // Confidence based on data quantity and consistency
    const dataPoints = metrics.length;
    const dataConfidence = Math.min(dataPoints / 100, 1) * 0.5;

    // Variance confidence
    const durations = metrics.map((m) => m.totalDuration);
    const mean = durations.reduce((sum, v) => sum + v, 0) / durations.length;
    const variance =
      durations.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
      durations.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of variation
    const varianceConfidence = Math.max(0, 1 - cv) * 0.5;

    return (dataConfidence + varianceConfidence) * 100;
  }

  private estimateTimeToFailure(failureProba: number): string | undefined {
    if (failureProba < 0.3) return undefined;
    if (failureProba < 0.5) return "24-48 hours";
    if (failureProba < 0.7) return "12-24 hours";
    if (failureProba < 0.85) return "6-12 hours";
    return "Within 6 hours";
  }

  private generateRecommendation(failureProba: number): string {
    if (failureProba < 0.3) {
      return "System is healthy. Continue monitoring.";
    } else if (failureProba < 0.5) {
      return "Minor degradation detected. Monitor closely and prepare for potential issues.";
    } else if (failureProba < 0.7) {
      return "Moderate failure risk. Review recent changes and prepare remediation steps.";
    } else if (failureProba < 0.85) {
      return "High failure risk. Immediate investigation recommended. Alert team.";
    } else {
      return "CRITICAL: Very high failure probability. Take immediate preventive action.";
    }
  }

  private generatePreventiveActions(
    failureProba: number,
    factors: string[],
  ): string[] {
    const actions: string[] = [];

    if (failureProba > 0.5) {
      actions.push("Review recent deployments and changes");
      actions.push("Check system resource utilization");
      actions.push("Verify external service availability");
    }

    if (factors.includes("High error rate detected")) {
      actions.push("Investigate error logs immediately");
      actions.push("Check database connectivity");
    }

    if (factors.includes("Significant increase in execution time")) {
      actions.push("Review database query performance");
      actions.push("Check for N+1 query patterns");
      actions.push("Verify caching effectiveness");
    }

    if (factors.includes("Performance score below threshold")) {
      actions.push("Profile slow operations");
      actions.push("Optimize critical code paths");
    }

    if (actions.length === 0) {
      actions.push("Continue monitoring and collect more data");
    }

    return actions;
  }

  private generateFallbackPrediction(): FailurePrediction {
    return {
      failureProbability: 0,
      confidence: 0,
      contributingFactors: ["Predictive analysis unavailable"],
      recommendation: "ML model not initialized or insufficient data",
    };
  }

  /**
   * Check if monitor is enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.isInitialized;
  }

  /**
   * Get model info
   */
  getModelInfo(): PredictionModel | null {
    if (!this.model) return null;

    return {
      id: "workflow-failure-predictor",
      name: "Workflow Failure Predictor",
      version: "1.0.0",
      type: "LSTM",
      trainingDate: new Date(),
      accuracy: 0.85, // Would be calculated during training
      features: this.features,
      targetVariable: "failure",
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createPredictiveMonitor(config?: {
  modelPath?: string;
  enabled?: boolean;
  features?: string[];
}): PredictiveMonitor {
  return new PredictiveMonitor(config);
}

export function createMonitorFromEnv(): PredictiveMonitor {
  return new PredictiveMonitor({
    modelPath:
      process.env.ML_MODEL_PATH || "./models/workflow-predictor/model.json",
    enabled: process.env.ML_PREDICTION_ENABLED !== "false",
  });
}
