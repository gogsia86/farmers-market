/**
 * FARMING ADVICE & INTELLIGENCE TYPE DEFINITIONS
 * Divine Agricultural Consciousness - Perplexity Integration
 *
 * Defines types for:
 * - Smart Farming Advice
 * - Product Recommendations
 * - Market Intelligence
 * - Educational Content
 * - AI-Powered Support
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

export type ResearchDepth = "quick" | "comprehensive" | "expert";

export type RecencyFilter = "day" | "week" | "month" | "year";

export type FarmingCategory =
  | "CROP_MANAGEMENT"
  | "PEST_CONTROL"
  | "SOIL_HEALTH"
  | "IRRIGATION"
  | "HARVESTING"
  | "ORGANIC_PRACTICES"
  | "MARKET_TRENDS"
  | "SEASONAL_PLANNING"
  | "EQUIPMENT"
  | "SUSTAINABILITY";

export type ContentType =
  | "ADVICE"
  | "GUIDE"
  | "TUTORIAL"
  | "RESEARCH"
  | "TREND_ANALYSIS"
  | "BEST_PRACTICES";

// ============================================================================
// SMART FARMING ADVICE
// ============================================================================

export interface FarmingAdviceRequest {
  question: string;
  category?: FarmingCategory;
  farmLocation?: string;
  currentSeason?: Season;
  depth?: ResearchDepth;
  includeRelatedQuestions?: boolean;
  recencyFilter?: RecencyFilter;
  userId?: string;
}

export interface FarmingAdviceResponse {
  success: boolean;
  data?: {
    answer: string;
    citations: Citation[];
    confidence: number;
    agriculturalRelevance: number;
    category: FarmingCategory;
    season: Season;
    relatedQuestions?: string[];
    metadata: AdviceMetadata;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface AdviceMetadata {
  requestId: string;
  timestamp: string;
  tokensUsed: number;
  processingTimeMs: number;
  model: string;
  sources: number;
}

export interface Citation {
  url: string;
  title?: string;
  snippet?: string;
  relevance?: number;
}

// ============================================================================
// PRODUCT RECOMMENDATIONS
// ============================================================================

export interface ProductRecommendationRequest {
  season: Season;
  location?: string;
  farmType?: string;
  previousPurchases?: string[];
  budget?: {
    min?: number;
    max?: number;
  };
  includeReasoning?: boolean;
}

export interface ProductRecommendationResponse {
  success: boolean;
  data?: {
    recommendations: ProductRecommendation[];
    seasonalInsights: SeasonalInsight;
    marketContext: string;
    citations: Citation[];
    metadata: {
      season: Season;
      generatedAt: string;
      confidenceScore: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ProductRecommendation {
  productName: string;
  category: string;
  reasoning: string;
  seasonalRelevance: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedValue: string;
  benefits: string[];
  considerations?: string[];
  alternatives?: string[];
}

export interface SeasonalInsight {
  season: Season;
  keyActivities: string[];
  commonChallenges: string[];
  opportunities: string[];
  bestPractices: string[];
}

// ============================================================================
// MARKET INTELLIGENCE
// ============================================================================

export interface MarketIntelligenceRequest {
  region?: string;
  topics?: string[];
  timeframe?: RecencyFilter;
  includeCompetitiveAnalysis?: boolean;
  includePriceTrends?: boolean;
}

export interface MarketIntelligenceResponse {
  success: boolean;
  data?: {
    overview: string;
    trends: MarketTrend[];
    insights: MarketInsight[];
    opportunities: BusinessOpportunity[];
    citations: Citation[];
    lastUpdated: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface MarketTrend {
  title: string;
  description: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  direction: "RISING" | "STABLE" | "DECLINING";
  timeframe: string;
  relevance: number;
  citations: Citation[];
}

export interface MarketInsight {
  category: string;
  finding: string;
  implications: string[];
  actionable: boolean;
  confidence: number;
}

export interface BusinessOpportunity {
  title: string;
  description: string;
  potential: "HIGH" | "MEDIUM" | "LOW";
  effort: "HIGH" | "MEDIUM" | "LOW";
  timeToMarket: string;
  requirements: string[];
  risks?: string[];
}

// ============================================================================
// EDUCATIONAL CONTENT
// ============================================================================

export interface EducationalContentRequest {
  topic: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  format?: "GUIDE" | "TUTORIAL" | "QUICK_TIP" | "DEEP_DIVE";
  includeVisualGuidance?: boolean;
  includeStepByStep?: boolean;
}

export interface EducationalContentResponse {
  success: boolean;
  data?: {
    title: string;
    content: EducationalContent;
    citations: Citation[];
    relatedTopics: string[];
    nextSteps?: string[];
    metadata: ContentMetadata;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface EducationalContent {
  overview: string;
  keyPoints: string[];
  detailedSections: ContentSection[];
  practicalTips?: string[];
  commonMistakes?: string[];
  expertAdvice?: string[];
  resources?: ExternalResource[];
}

export interface ContentSection {
  title: string;
  content: string;
  subsections?: {
    title: string;
    content: string;
  }[];
  citations?: Citation[];
}

export interface ContentMetadata {
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedReadTime: number;
  lastUpdated: string;
  credibilityScore: number;
  sourcesCount: number;
}

export interface ExternalResource {
  title: string;
  url: string;
  type: "VIDEO" | "ARTICLE" | "RESEARCH" | "TOOL" | "COURSE";
  description?: string;
}

// ============================================================================
// AI-POWERED SUPPORT
// ============================================================================

export interface SupportConversation {
  id: string;
  userId: string;
  farmId?: string;
  messages: SupportMessage[];
  status: "ACTIVE" | "RESOLVED" | "ESCALATED";
  category?: FarmingCategory;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface SupportMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  citations?: Citation[];
  confidence?: number;
  timestamp: Date;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
    model?: string;
  };
}

export interface SupportRequest {
  conversationId?: string;
  userId: string;
  message: string;
  context?: {
    farmId?: string;
    currentSeason?: Season;
    location?: string;
    farmType?: string;
  };
  includeHistory?: boolean;
}

export interface SupportResponse {
  success: boolean;
  data?: {
    conversationId: string;
    message: SupportMessage;
    suggestedActions?: SuggestedAction[];
    relatedResources?: ExternalResource[];
    needsEscalation?: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface SuggestedAction {
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  estimatedTime?: string;
  difficulty?: "EASY" | "MODERATE" | "CHALLENGING";
}

// ============================================================================
// AGRICULTURAL CONSCIOUSNESS
// ============================================================================

export interface AgriculturalContext {
  season: Season;
  lunarPhase?: string;
  regionClimate?: string;
  growingZone?: string;
  soilType?: string;
  waterAvailability?: string;
  biodynamicConsiderations?: string[];
}

export interface BiodynamicValidation {
  isSeasonallyAppropriate: boolean;
  lunarAlignment?: string;
  seasonalRecommendations: string[];
  timingConsiderations?: string[];
  warnings?: string[];
}

// ============================================================================
// QUANTUM RESPONSE PATTERNS (DIVINE)
// ============================================================================

export interface QuantumFarmingResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  agricultural?: {
    season: Season;
    consciousness: "DIVINE" | "ENLIGHTENED" | "AWARE";
    biodynamicAlignment?: number;
  };
  meta?: {
    requestId: string;
    timestamp: string;
    tokensUsed?: number;
    processingTimeMs?: number;
    citations?: number;
  };
}

// ============================================================================
// DATABASE MODELS (for persistence)
// ============================================================================

export interface FarmingAdviceHistory {
  id: string;
  userId: string;
  farmId?: string;
  question: string;
  answer: string;
  category: FarmingCategory;
  season: Season;
  citations: Citation[];
  confidence: number;
  helpful?: boolean;
  createdAt: Date;
}

export interface ResearchCache {
  id: string;
  topic: string;
  content: string;
  citations: Citation[];
  season?: Season;
  expiresAt: Date;
  createdAt: Date;
  hitCount: number;
}

// ============================================================================
// VALIDATION SCHEMAS (for Zod)
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type BrandedString<T extends string> = string & { __brand: T };

export type FarmId = BrandedString<"FarmId">;
export type UserId = BrandedString<"UserId">;
export type ConversationId = BrandedString<"ConversationId">;

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export const SEASONS: Season[] = ["SPRING", "SUMMER", "FALL", "WINTER"];

export const FARMING_CATEGORIES: FarmingCategory[] = [
  "CROP_MANAGEMENT",
  "PEST_CONTROL",
  "SOIL_HEALTH",
  "IRRIGATION",
  "HARVESTING",
  "ORGANIC_PRACTICES",
  "MARKET_TRENDS",
  "SEASONAL_PLANNING",
  "EQUIPMENT",
  "SUSTAINABILITY",
];

export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}

export function getSeasonName(season: Season): string {
  const names: Record<Season, string> = {
    SPRING: "Spring",
    SUMMER: "Summer",
    FALL: "Fall",
    WINTER: "Winter",
  };
  return names[season];
}
