/**
 * 🤖 ML MODEL TYPES - DIVINE AGRICULTURAL INTELLIGENCE
 *
 * Comprehensive type definitions for machine learning models with agricultural consciousness.
 * Supports deep learning recommendations, demand forecasting, price optimization,
 * and seasonal intelligence.
 *
 * @module MLModelTypes
 * @version 1.0.0
 * @agricultural-consciousness MAXIMUM
 */

import type { Product, User, Order, Farm } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 MODEL TYPES & ARCHITECTURES
// ═══════════════════════════════════════════════════════════════════════════

export type MLModelType =
  | "COLLABORATIVE_FILTERING"
  | "CONTENT_BASED_FILTERING"
  | "NEURAL_COLLABORATIVE_FILTERING"
  | "DEEP_MATRIX_FACTORIZATION"
  | "AUTOENCODER"
  | "TRANSFORMER"
  | "LSTM_TIME_SERIES"
  | "CNN_IMAGE"
  | "HYBRID_ENSEMBLE"
  | "DEMAND_FORECASTING"
  | "PRICE_OPTIMIZATION"
  | "CHURN_PREDICTION"
  | "SEASONAL_PATTERN";

export type ModelStatus =
  | "UNTRAINED"
  | "TRAINING"
  | "TRAINED"
  | "EVALUATING"
  | "DEPLOYED"
  | "DEPRECATED"
  | "FAILED";

export type TrainingStrategy =
  | "BATCH"
  | "MINI_BATCH"
  | "ONLINE"
  | "TRANSFER_LEARNING"
  | "FEDERATED";

// ═══════════════════════════════════════════════════════════════════════════
// 🧬 MODEL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export interface MLModelConfig {
  modelId: string;
  modelType: MLModelType;
  version: string;
  architecture: ModelArchitecture;
  hyperparameters: Hyperparameters;
  trainingStrategy: TrainingStrategy;
  features: FeatureConfig[];
  target: TargetConfig;
  validation: ValidationConfig;
  deployment: DeploymentConfig;
  agriculturalContext?: AgriculturalMLContext;
}

export interface ModelArchitecture {
  layers: LayerConfig[];
  inputShape: number[];
  outputShape: number[];
  activationFunction: "relu" | "sigmoid" | "tanh" | "softmax" | "leaky_relu";
  lossFunction: "mse" | "mae" | "categorical_crossentropy" | "binary_crossentropy" | "huber";
  optimizer: OptimizerConfig;
  regularization?: RegularizationConfig;
}

export interface LayerConfig {
  type: "dense" | "embedding" | "lstm" | "conv2d" | "dropout" | "batch_norm";
  units?: number;
  activation?: string;
  dropout?: number;
  kernelSize?: number[];
  filters?: number;
  embeddingDim?: number;
  vocabularySize?: number;
}

export interface OptimizerConfig {
  type: "adam" | "sgd" | "rmsprop" | "adagrad";
  learningRate: number;
  beta1?: number;
  beta2?: number;
  epsilon?: number;
  momentum?: number;
}

export interface RegularizationConfig {
  l1?: number;
  l2?: number;
  dropout?: number;
  earlyStoppingPatience?: number;
}

export interface Hyperparameters {
  epochs: number;
  batchSize: number;
  validationSplit: number;
  shuffle: boolean;
  learningRate: number;
  embeddingDim?: number;
  numFactors?: number;
  hiddenLayers?: number[];
  dropoutRate?: number;
  l2Regularization?: number;
  [key: string]: any;
}

export interface FeatureConfig {
  name: string;
  type: "numeric" | "categorical" | "text" | "embedding" | "image" | "temporal";
  encoding?: "one_hot" | "label" | "ordinal" | "binary" | "embedding";
  normalization?: "standard" | "minmax" | "robust" | "none";
  vocabulary?: string[];
  maxLength?: number;
  required: boolean;
  agriculturalSemantics?: string; // e.g., "seasonal_product", "farm_location"
}

export interface TargetConfig {
  name: string;
  type: "regression" | "binary_classification" | "multi_classification" | "ranking";
  classes?: string[];
  metric: "accuracy" | "precision" | "recall" | "f1" | "auc" | "rmse" | "mae" | "ndcg";
}

export interface ValidationConfig {
  strategy: "holdout" | "k_fold" | "time_series_split" | "stratified";
  testSize: number;
  nFolds?: number;
  metrics: string[];
  threshold?: number;
}

export interface DeploymentConfig {
  environment: "development" | "staging" | "production";
  apiEndpoint?: string;
  batchPrediction: boolean;
  realtimePrediction: boolean;
  cacheResults: boolean;
  cacheTTL?: number; // seconds
  maxConcurrentPredictions?: number;
  gpuEnabled: boolean;
}

export interface AgriculturalMLContext {
  seasonalAware: boolean;
  weatherIntegration: boolean;
  farmSpecific: boolean;
  localityWeighting: boolean;
  biodynamicConsciousness: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 TRAINING DATA
// ═══════════════════════════════════════════════════════════════════════════

export interface TrainingDataset {
  datasetId: string;
  modelType: MLModelType;
  features: FeatureVector[];
  labels: LabelVector[];
  metadata: DatasetMetadata;
  split: DatasetSplit;
}

export interface FeatureVector {
  userId?: string;
  productId?: string;
  farmId?: string;
  features: Record<string, number | string | number[]>;
  timestamp: Date;
  agriculturalContext?: {
    season: string;
    weather?: string;
    localMarket?: string;
  };
}

export interface LabelVector {
  value: number | string | number[];
  weight?: number; // For weighted training
  confidence?: number;
}

export interface DatasetMetadata {
  totalSamples: number;
  featureCount: number;
  classDistribution?: Record<string, number>;
  dateRange: {
    start: Date;
    end: Date;
  };
  version: string;
  source: "database" | "api" | "file" | "synthetic";
  agriculturalPeriod?: {
    seasons: string[];
    marketCycles: number;
  };
}

export interface DatasetSplit {
  train: FeatureVector[];
  validation: FeatureVector[];
  test: FeatureVector[];
  trainLabels: LabelVector[];
  validationLabels: LabelVector[];
  testLabels: LabelVector[];
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎓 TRAINING & EVALUATION
// ═══════════════════════════════════════════════════════════════════════════

export interface TrainingJob {
  jobId: string;
  modelId: string;
  modelType: MLModelType;
  config: MLModelConfig;
  dataset: TrainingDataset;
  status: TrainingStatus;
  progress: TrainingProgress;
  metrics: TrainingMetrics;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export type TrainingStatus =
  | "QUEUED"
  | "PREPARING_DATA"
  | "TRAINING"
  | "VALIDATING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface TrainingProgress {
  currentEpoch: number;
  totalEpochs: number;
  batchesProcessed: number;
  totalBatches: number;
  estimatedTimeRemaining?: number; // seconds
  loss: number;
  validationLoss?: number;
  accuracy?: number;
  validationAccuracy?: number;
}

export interface TrainingMetrics {
  finalLoss: number;
  finalValidationLoss: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  rmse?: number;
  mae?: number;
  r2Score?: number;
  confusionMatrix?: number[][];
  epochMetrics: EpochMetric[];
}

export interface EpochMetric {
  epoch: number;
  loss: number;
  validationLoss: number;
  accuracy?: number;
  validationAccuracy?: number;
  learningRate: number;
  duration: number; // milliseconds
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔮 PREDICTIONS & INFERENCE
// ═══════════════════════════════════════════════════════════════════════════

export interface PredictionRequest {
  modelId: string;
  input: PredictionInput;
  options?: PredictionOptions;
  context?: PredictionContext;
}

export interface PredictionInput {
  userId?: string;
  productId?: string;
  farmId?: string;
  features: Record<string, number | string | number[]>;
  timestamp?: Date;
}

export interface PredictionOptions {
  topK?: number; // Return top K predictions
  threshold?: number; // Minimum confidence threshold
  includeProbabilities?: boolean;
  explainability?: boolean;
  agriculturalContext?: {
    currentSeason?: string;
    userLocation?: { latitude: number; longitude: number };
    preferredFarms?: string[];
  };
}

export interface PredictionContext {
  pageType?: "HOME" | "PRODUCT" | "CART" | "SEARCH";
  sessionId?: string;
  previousPredictions?: string[];
  userBehavior?: {
    recentViews: string[];
    recentPurchases: string[];
  };
}

export interface PredictionResult {
  predictionId: string;
  modelId: string;
  modelVersion: string;
  predictions: Prediction[];
  metadata: PredictionMetadata;
  timestamp: Date;
}

export interface Prediction {
  value: number | string;
  probability?: number;
  confidence: number;
  rank?: number;
  explanation?: PredictionExplanation;
  agriculturalRelevance?: {
    seasonalMatch: number;
    localAvailability: number;
    freshness: number;
  };
}

export interface PredictionExplanation {
  topFeatures: FeatureImportance[];
  similarUsers?: string[];
  similarProducts?: string[];
  reasoning: string;
}

export interface FeatureImportance {
  featureName: string;
  importance: number;
  value: number | string;
  contribution: number; // Contribution to prediction
}

export interface PredictionMetadata {
  inferenceTime: number; // milliseconds
  modelType: MLModelType;
  algorithm: string;
  cacheHit: boolean;
  agriculturalConsciousness?: {
    seasonalAdjustment: number;
    localityBoost: number;
    freshnessScore: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 📈 RECOMMENDATION-SPECIFIC TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RecommendationMLInput {
  userId: string;
  context: {
    currentProductId?: string;
    cartItems?: string[];
    viewHistory: string[];
    purchaseHistory: string[];
    searchHistory: string[];
    preferences: UserPreferences;
  };
  filters?: RecommendationFilters;
}

export interface UserPreferences {
  categories: string[];
  priceRange: { min: number; max: number };
  preferredFarms: string[];
  dietaryRestrictions?: string[];
  organicOnly?: boolean;
  localOnly?: boolean;
  seasonalPreference?: boolean;
}

export interface RecommendationFilters {
  excludeProducts?: string[];
  includeOnlyCategories?: string[];
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  farmIds?: string[];
}

export interface RecommendationMLOutput {
  recommendations: MLRecommendation[];
  confidence: number;
  modelVersion: string;
  diversity: number; // 0-1 score for recommendation diversity
  serendipity: number; // 0-1 score for surprising but relevant items
}

export interface MLRecommendation {
  productId: string;
  score: number;
  confidence: number;
  reason: string;
  features: {
    collaborativeScore: number;
    contentScore: number;
    temporalScore: number;
    popularityScore: number;
    agriculturalScore: number;
  };
  explanation: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 DEMAND FORECASTING TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface DemandForecastInput {
  productId?: string;
  farmId?: string;
  category?: string;
  timeHorizon: "daily" | "weekly" | "monthly" | "seasonal";
  historicalData: TimeSeriesData[];
  externalFactors?: ExternalFactors;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface ExternalFactors {
  weather?: WeatherData[];
  events?: MarketEvent[];
  seasonality?: SeasonalPattern[];
  competitorPricing?: PricingData[];
}

export interface WeatherData {
  date: Date;
  temperature: number;
  precipitation: number;
  condition: string;
}

export interface MarketEvent {
  date: Date;
  type: "holiday" | "festival" | "market_day" | "harvest_season";
  impact: "high" | "medium" | "low";
}

export interface SeasonalPattern {
  season: string;
  multiplier: number;
  confidence: number;
}

export interface PricingData {
  date: Date;
  productId: string;
  price: number;
  source: string;
}

export interface DemandForecastOutput {
  forecasts: ForecastPoint[];
  confidence: number;
  seasonalComponent?: number[];
  trendComponent?: number[];
  residualComponent?: number[];
  metadata: ForecastMetadata;
}

export interface ForecastPoint {
  timestamp: Date;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface ForecastMetadata {
  modelType: MLModelType;
  accuracy: number;
  mape: number; // Mean Absolute Percentage Error
  rmse: number;
  agriculturalInsights?: {
    peakSeasons: string[];
    weatherImpact: number;
    localMarketTrends: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 💰 PRICE OPTIMIZATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PriceOptimizationInput {
  productId: string;
  currentPrice: number;
  cost: number;
  inventory: number;
  demand: number;
  competitorPrices: number[];
  constraints: PricingConstraints;
}

export interface PricingConstraints {
  minPrice: number;
  maxPrice: number;
  minMargin: number;
  targetMargin?: number;
  priceElasticity?: number;
}

export interface PriceOptimizationOutput {
  recommendedPrice: number;
  expectedRevenue: number;
  expectedProfit: number;
  expectedDemand: number;
  confidence: number;
  priceElasticity: number;
  reasoning: string;
  alternatives: PriceAlternative[];
}

export interface PriceAlternative {
  price: number;
  expectedRevenue: number;
  expectedProfit: number;
  expectedDemand: number;
  scenario: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 MODEL PERFORMANCE & MONITORING
// ═══════════════════════════════════════════════════════════════════════════

export interface ModelPerformance {
  modelId: string;
  version: string;
  evaluationDate: Date;
  metrics: PerformanceMetrics;
  comparison?: ModelComparison;
  drift?: ModelDrift;
  recommendations: string[];
}

export interface PerformanceMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  rmse?: number;
  mae?: number;
  mape?: number;
  r2Score?: number;
  ndcg?: number;
  hitRate?: number;
  diversityScore?: number;
  serendipityScore?: number;
  latency: number; // milliseconds
  throughput: number; // predictions per second
}

export interface ModelComparison {
  baselineModel: string;
  improvement: Record<string, number>; // metric -> percentage improvement
  statisticalSignificance: boolean;
  pValue?: number;
}

export interface ModelDrift {
  detected: boolean;
  severity: "none" | "low" | "medium" | "high" | "critical";
  metrics: {
    dataDrift: number;
    conceptDrift: number;
    performanceDegradation: number;
  };
  recommendation: "monitor" | "retrain" | "replace";
  detectedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 MODEL LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════

export interface ModelVersion {
  modelId: string;
  version: string;
  createdAt: Date;
  trainedAt?: Date;
  deployedAt?: Date;
  deprecatedAt?: Date;
  status: ModelStatus;
  config: MLModelConfig;
  performance?: ModelPerformance;
  artifacts: ModelArtifacts;
}

export interface ModelArtifacts {
  weightsPath?: string;
  configPath: string;
  vocabularyPath?: string;
  preprocessorPath?: string;
  checkpointPath?: string;
  exportedModelPath?: string;
  metricsPath?: string;
  tensorflowFormat?: boolean;
  onnxFormat?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌾 AGRICULTURAL-SPECIFIC ML TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AgriculturalMLFeatures {
  seasonality: SeasonalityFeatures;
  locality: LocalityFeatures;
  freshness: FreshnessFeatures;
  sustainability: SustainabilityFeatures;
  weather: WeatherFeatures;
}

export interface SeasonalityFeatures {
  currentSeason: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  seasonalScore: number; // 0-1
  daysInSeason: number;
  harvestWindow: boolean;
  peakSeasonality: number;
}

export interface LocalityFeatures {
  distance: number; // kilometers
  localityScore: number; // 0-1
  sameState: boolean;
  sameRegion: boolean;
  transportationCost: number;
}

export interface FreshnessFeatures {
  daysFromHarvest: number;
  freshnessScore: number; // 0-1
  perishability: "low" | "medium" | "high";
  storageQuality: number;
}

export interface SustainabilityFeatures {
  organicCertified: boolean;
  sustainabilityScore: number; // 0-1
  carbonFootprint: number;
  waterUsage: number;
  biodynamicPractices: boolean;
}

export interface WeatherFeatures {
  temperature: number;
  precipitation: number;
  growingDegreeDay: number;
  frostRisk: number;
  weatherImpactScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 EXPORT ALL TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type {
  // Core exports already defined above
};

/**
 * 🌟 DIVINE TYPE SAFETY
 *
 * All ML model types are 100% type-safe with agricultural consciousness.
 * Supports TensorFlow.js, deep learning, and enterprise-grade ML systems.
 */
