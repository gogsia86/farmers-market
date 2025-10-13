import { QuantumCompute } from '../quantum/quantumCompute';
import { ModelRegistry } from '../core/modelRegistry';
import { DataPipeline } from '../core/dataPipeline';
import { MetricsTracker } from '../core/metricsTracker';
import { Logger } from '../utils/logger';
import { Config } from '../config/config';

export class IntelligenceManager {
  private static instance: IntelligenceManager;
  private modelRegistry: ModelRegistry;
  private dataPipeline: DataPipeline;
  private metricsTracker: MetricsTracker;
  private quantumCompute: QuantumCompute;
  private logger: Logger;

  private constructor() {
    this.modelRegistry = new ModelRegistry();
    this.dataPipeline = new DataPipeline();
    this.metricsTracker = new MetricsTracker();
    this.quantumCompute = new QuantumCompute();
    this.logger = new Logger('IntelligenceManager');
  }

  public static getInstance(): IntelligenceManager {
    if (!IntelligenceManager.instance) {
      IntelligenceManager.instance = new IntelligenceManager();
    }
    return IntelligenceManager.instance;
  }

  /**
   * Initialize the intelligence layer components
   */
  public async initialize(): Promise<void> {
    try {
      await this.dataPipeline.initialize();
      await this.modelRegistry.initialize();
      await this.quantumCompute.initialize();
      await this.metricsTracker.initialize();
      
      this.logger.info('Intelligence layer initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize intelligence layer', error);
      throw error;
    }
  }

  /**
   * Register a new AI/ML model in the system
   */
  public async registerModel(
    modelId: string, 
    modelType: string,
    config: any
  ): Promise<void> {
    try {
      await this.modelRegistry.registerModel(modelId, modelType, config);
      this.logger.info(`Model ${modelId} registered successfully`);
    } catch (error) {
      this.logger.error(`Failed to register model ${modelId}`, error);
      throw error;
    }
  }

  /**
   * Execute a prediction using the specified model
   */
  public async predict(
    modelId: string,
    input: any,
    options: any = {}
  ): Promise<any> {
    try {
      const startTime = Date.now();
      const result = await this.modelRegistry.predict(modelId, input, options);
      
      // Track prediction metrics
      this.metricsTracker.trackPrediction({
        modelId,
        duration: Date.now() - startTime,
        inputSize: JSON.stringify(input).length,
        outputSize: JSON.stringify(result).length
      });

      return result;
    } catch (error) {
      this.logger.error(`Prediction failed for model ${modelId}`, error);
      throw error;
    }
  }

  /**
   * Execute an optimization using quantum computing resources
   */
  public async optimize(
    problemType: string,
    parameters: any,
    constraints: any
  ): Promise<any> {
    try {
      const startTime = Date.now();
      const result = await this.quantumCompute.optimize(
        problemType,
        parameters,
        constraints
      );

      // Track optimization metrics
      this.metricsTracker.trackOptimization({
        problemType,
        duration: Date.now() - startTime,
        parameterCount: Object.keys(parameters).length,
        constraintCount: Object.keys(constraints).length
      });

      return result;
    } catch (error) {
      this.logger.error('Optimization failed', error);
      throw error;
    }
  }

  /**
   * Update model with new training data
   */
  public async updateModel(
    modelId: string,
    trainingData: any,
    options: any = {}
  ): Promise<void> {
    try {
      const startTime = Date.now();
      await this.modelRegistry.updateModel(modelId, trainingData, options);

      // Track update metrics
      this.metricsTracker.trackModelUpdate({
        modelId,
        duration: Date.now() - startTime,
        dataSize: JSON.stringify(trainingData).length
      });
    } catch (error) {
      this.logger.error(`Model update failed for ${modelId}`, error);
      throw error;
    }
  }

  /**
   * Get current performance metrics for a model
   */
  public async getModelMetrics(modelId: string): Promise<any> {
    try {
      return await this.metricsTracker.getModelMetrics(modelId);
    } catch (error) {
      this.logger.error(`Failed to get metrics for model ${modelId}`, error);
      throw error;
    }
  }

  /**
   * Get system-wide intelligence layer metrics
   */
  public async getSystemMetrics(): Promise<any> {
    try {
      const metrics = await this.metricsTracker.getSystemMetrics();
      const quantumMetrics = await this.quantumCompute.getMetrics();
      
      return {
        ...metrics,
        quantum: quantumMetrics
      };
    } catch (error) {
      this.logger.error('Failed to get system metrics', error);
      throw error;
    }
  }

  /**
   * Perform system health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const checks = await Promise.all([
        this.modelRegistry.healthCheck(),
        this.dataPipeline.healthCheck(),
        this.quantumCompute.healthCheck(),
        this.metricsTracker.healthCheck()
      ]);

      return checks.every(check => check === true);
    } catch (error) {
      this.logger.error('Health check failed', error);
      return false;
    }
  }
}