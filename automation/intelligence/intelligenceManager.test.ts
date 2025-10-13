import { IntelligenceManager } from './intelligenceManager';

describe('IntelligenceManager', () => {
  let intelligenceManager: IntelligenceManager;

  beforeEach(async () => {
    intelligenceManager = IntelligenceManager.getInstance();
    await intelligenceManager.initialize();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const healthStatus = await intelligenceManager.healthCheck();
      expect(healthStatus).toBe(true);
    });
  });

  describe('model management', () => {
    it('should register and predict with a model', async () => {
      const modelId = 'test-model';
      const modelType = 'regression';
      const modelConfig = {
        features: ['temperature', 'rainfall', 'soil_ph'],
        targetVariable: 'crop_yield'
      };

      // Register model
      await intelligenceManager.registerModel(modelId, modelType, modelConfig);

      // Make prediction
      const predictionInput = {
        temperature: 25,
        rainfall: 100,
        soil_ph: 6.5
      };

      const prediction = await intelligenceManager.predict(modelId, predictionInput);
      
      expect(prediction).toBeDefined();
      expect(typeof prediction.prediction).toBe('number');
      expect(typeof prediction.confidence).toBe('number');
    });

    it('should update model with new data', async () => {
      const modelId = 'test-model-2';
      const modelType = 'classification';
      const modelConfig = {
        features: ['pest_presence', 'leaf_color', 'growth_stage'],
        targetVariable: 'disease_risk'
      };

      // Register model
      await intelligenceManager.registerModel(modelId, modelType, modelConfig);

      // Update model
      const trainingData = {
        features: [
          [1, 'green', 'flowering'],
          [0, 'yellow', 'seedling']
        ],
        labels: ['high', 'low']
      };

      await intelligenceManager.updateModel(modelId, trainingData);

      // Get model metrics
      const metrics = await intelligenceManager.getModelMetrics(modelId);
      expect(metrics).toBeDefined();
      expect(metrics.totalUpdates).toBe(1);
    });
  });

  describe('optimization', () => {
    it('should perform quantum optimization', async () => {
      const problemType = 'resource_allocation';
      const parameters = {
        resources: ['water', 'fertilizer', 'labor'],
        costs: [10, 20, 30],
        returns: [100, 150, 200]
      };
      const constraints = {
        maxBudget: 1000,
        minReturn: 500
      };

      const result = await intelligenceManager.optimize(
        problemType,
        parameters,
        constraints
      );

      expect(result).toBeDefined();
      expect(result.solution).toBeDefined();
      expect(typeof result.confidence).toBe('number');
    });
  });

  describe('metrics', () => {
    it('should track and retrieve system metrics', async () => {
      const metrics = await intelligenceManager.getSystemMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.quantum).toBe('object');
      expect(typeof metrics.totalPredictions).toBe('number');
      expect(typeof metrics.totalOptimizations).toBe('number');
    });
  });

  describe('error handling', () => {
    it('should handle invalid model ID', async () => {
      const invalidModelId = 'non-existent-model';
      
      await expect(
        intelligenceManager.predict(invalidModelId, {})
      ).rejects.toThrow();
    });

    it('should handle invalid optimization parameters', async () => {
      await expect(
        intelligenceManager.optimize('invalid_type', {}, {})
      ).rejects.toThrow();
    });
  });
});