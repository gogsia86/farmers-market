/**
 * AI Pricing Recommendation API
 * POST /api/ai/pricing
 *
 * Generates intelligent pricing recommendations for farm products based on:
 * - Market data and competitor pricing
 * - Seasonal factors and demand
 * - Product characteristics and quality
 * - Farming practices and certifications
 *
 * @module api/ai/pricing
 */

import { getOpenAIClient, PRODUCT_CATALOG_AGENT } from "@/lib/ai/agent-config";
import { createLogger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("AI-Pricing");

// ============================================================================
// Validation Schema
// ============================================================================

const PricingRequestSchema = z.object({
  productName: z.string().min(2).max(200),
  category: z.string().min(2).max(100),
  unit: z.enum(['lb', 'oz', 'kg', 'g', 'bunch', 'each', 'dozen', 'pint', 'quart', 'gallon']),
  farmingPractices: z.array(z.enum([
    'ORGANIC',
    'CONVENTIONAL',
    'PERMACULTURE',
    'HYDROPONIC',
    'AQUAPONIC',
    'REGENERATIVE',
    'BIODYNAMIC'
  ])).optional(),
  certifications: z.array(z.enum([
    'ORGANIC',
    'NON_GMO',
    'BIODYNAMIC',
    'RAINFOREST_ALLIANCE',
    'FAIR_TRADE'
  ])).optional(),
  region: z.string().max(100).optional(), // e.g., "California", "Northeast US"
  season: z.enum(['SPRING', 'SUMMER', 'FALL', 'WINTER']).optional(),
  productionCost: z.number().positive().optional(), // Farmer's cost per unit
  competitorPrices: z.array(z.number().positive()).max(10).optional(),
  qualityGrade: z.enum(['premium', 'standard', 'economy']).default('standard'),
  isInSeason: z.boolean().optional(),
  farmSize: z.enum(['small', 'medium', 'large']).optional(),
  distributionChannel: z.enum(['farmers_market', 'direct', 'retail', 'wholesale']).default('farmers_market'),
});

type PricingRequest = z.infer<typeof PricingRequestSchema>;

interface PricingResponse {
  success: boolean;
  data?: {
    recommendedPrice: number;
    priceRange: {
      min: number;
      max: number;
      optimal: number;
    };
    confidence: number;
    reasoning: string;
    factors: {
      marketDemand: number; // 0-1 score
      seasonalFactor: number; // multiplier (0.8-1.5)
      qualityPremium: number; // multiplier (0.9-1.3)
      certificationBonus: number; // dollar amount
      competitivePosition: string; // 'below', 'competitive', 'premium'
    };
    recommendations: string[];
    marketInsights: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    model: string;
    tokensUsed: number;
    requestId: string;
    processingTime: number;
  };
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<PricingResponse>> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = PricingRequestSchema.parse(body);

    logger.info("Generating pricing recommendation", {
      requestId,
      productName: validatedData.productName,
      category: validatedData.category,
      unit: validatedData.unit,
    });

    // Generate pricing recommendation using AI + heuristics
    const result = await generatePricingRecommendation(validatedData, requestId);

    const processingTime = Date.now() - startTime;

    logger.info("Pricing recommendation generated", {
      requestId,
      processingTime,
      recommendedPrice: result.recommendedPrice,
      confidence: result.confidence,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        metadata: {
          model: PRODUCT_CATALOG_AGENT.model,
          tokensUsed: result.tokensUsed || 0,
          requestId,
          processingTime,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn("Validation error", { requestId, errors: error.errors });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors,
          },
          metadata: {
            model: PRODUCT_CATALOG_AGENT.model,
            tokensUsed: 0,
            requestId,
            processingTime,
          },
        },
        { status: 400 }
      );
    }

    logger.error("Failed to generate pricing recommendation", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate pricing recommendation. Please try again.",
        },
        metadata: {
          model: PRODUCT_CATALOG_AGENT.model,
          tokensUsed: 0,
          requestId,
          processingTime,
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Pricing Logic
// ============================================================================

async function generatePricingRecommendation(
  data: PricingRequest,
  requestId: string
): Promise<{
  recommendedPrice: number;
  priceRange: { min: number; max: number; optimal: number };
  confidence: number;
  reasoning: string;
  factors: {
    marketDemand: number;
    seasonalFactor: number;
    qualityPremium: number;
    certificationBonus: number;
    competitivePosition: string;
  };
  recommendations: string[];
  marketInsights: string;
  tokensUsed?: number;
}> {
  // Step 1: Calculate base pricing factors using heuristics
  const factors = calculatePricingFactors(data);

  // Step 2: Calculate initial price estimate
  const basePrice = calculateBasePrice(data, factors);

  // Step 3: Use AI for market insights and recommendations
  const aiAnalysis = await getAIMarketAnalysis(data, basePrice, factors);

  // Step 4: Finalize pricing with AI insights
  const recommendedPrice = Math.round(basePrice * 100) / 100;
  const priceRange = {
    min: Math.round(basePrice * 0.85 * 100) / 100,
    max: Math.round(basePrice * 1.15 * 100) / 100,
    optimal: recommendedPrice,
  };

  // Step 5: Calculate confidence score
  const confidence = calculatePricingConfidence(data, factors);

  return {
    recommendedPrice,
    priceRange,
    confidence,
    reasoning: aiAnalysis.reasoning,
    factors,
    recommendations: aiAnalysis.recommendations,
    marketInsights: aiAnalysis.insights,
    tokensUsed: aiAnalysis.tokensUsed,
  };
}

function calculatePricingFactors(data: PricingRequest) {
  // Market demand score (0-1)
  let marketDemand = 0.7; // Base demand

  // Adjust for season
  if (data.isInSeason !== undefined) {
    marketDemand = data.isInSeason ? 0.8 : 0.6;
  }

  // Seasonal factor (price multiplier)
  const seasonalFactor = getSeasonalFactor(data.category, data.season, data.isInSeason);

  // Quality premium (multiplier)
  const qualityPremium = data.qualityGrade === 'premium' ? 1.25 :
                         data.qualityGrade === 'economy' ? 0.85 : 1.0;

  // Certification bonus (dollar amount)
  let certificationBonus = 0;
  if (data.certifications) {
    if (data.certifications.includes('ORGANIC')) certificationBonus += 0.50;
    if (data.certifications.includes('BIODYNAMIC')) certificationBonus += 0.75;
    if (data.certifications.includes('NON_GMO')) certificationBonus += 0.25;
    if (data.certifications.includes('FAIR_TRADE')) certificationBonus += 0.40;
  }

  // Farming practice adjustments
  if (data.farmingPractices) {
    if (data.farmingPractices.includes('REGENERATIVE')) certificationBonus += 0.30;
    if (data.farmingPractices.includes('PERMACULTURE')) certificationBonus += 0.25;
  }

  // Competitive position
  const competitivePosition = calculateCompetitivePosition(data.competitorPrices);

  return {
    marketDemand,
    seasonalFactor,
    qualityPremium,
    certificationBonus,
    competitivePosition,
  };
}

function getSeasonalFactor(
  category: string,
  season?: string,
  isInSeason?: boolean
): number {
  // Base seasonal multiplier
  if (isInSeason === true) return 1.0; // Normal price when in season
  if (isInSeason === false) return 1.4; // Premium when out of season

  // Category-based defaults if season not specified
  const categorySeasons: Record<string, Record<string, number>> = {
    'VEGETABLES': {
      'SPRING': 0.95,
      'SUMMER': 0.90,
      'FALL': 0.95,
      'WINTER': 1.20,
    },
    'FRUITS': {
      'SPRING': 1.10,
      'SUMMER': 0.85,
      'FALL': 0.90,
      'WINTER': 1.30,
    },
    'HERBS': {
      'SPRING': 0.95,
      'SUMMER': 0.90,
      'FALL': 1.00,
      'WINTER': 1.15,
    },
  };

  const categoryUpper = category.toUpperCase();
  if (season && categorySeasons[categoryUpper]) {
    return categorySeasons[categoryUpper][season] || 1.0;
  }

  return 1.0; // Default - no adjustment
}

function calculateCompetitivePosition(competitorPrices?: number[]): string {
  if (!competitorPrices || competitorPrices.length === 0) {
    return 'unknown';
  }

  const avgPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;

  // Will be compared later with recommended price
  return 'competitive'; // Placeholder, actual comparison done in reasoning
}

function calculateBasePrice(data: PricingRequest, factors: ReturnType<typeof calculatePricingFactors>): number {
  let basePrice: number;

  // Start with production cost if available
  if (data.productionCost) {
    // Apply standard markup (50-100% for farmers markets)
    const markup = data.distributionChannel === 'wholesale' ? 1.3 :
                   data.distributionChannel === 'retail' ? 1.6 : 1.75; // farmers_market/direct
    basePrice = data.productionCost * markup;
  }
  // Or use competitor average
  else if (data.competitorPrices && data.competitorPrices.length > 0) {
    basePrice = data.competitorPrices.reduce((a, b) => a + b, 0) / data.competitorPrices.length;
  }
  // Or use category defaults (rough estimates per lb/unit)
  else {
    basePrice = getCategoryDefaultPrice(data.category, data.unit);
  }

  // Apply factors
  basePrice *= factors.seasonalFactor;
  basePrice *= factors.qualityPremium;
  basePrice += factors.certificationBonus;

  // Distribution channel adjustment
  if (data.distributionChannel === 'wholesale') {
    basePrice *= 0.7; // Wholesale discount
  } else if (data.distributionChannel === 'direct') {
    basePrice *= 1.1; // Direct premium (no middleman)
  }

  return Math.max(basePrice, 0.50); // Minimum $0.50
}

function getCategoryDefaultPrice(category: string, unit: string): number {
  // Default prices per lb (approximate farmers market prices)
  const categoryDefaults: Record<string, number> = {
    'VEGETABLES': 3.50,
    'FRUITS': 4.00,
    'HERBS': 6.00,
    'LEAFY_GREENS': 4.50,
    'ROOT_VEGETABLES': 3.00,
    'BERRIES': 6.50,
    'TOMATOES': 4.50,
    'PEPPERS': 5.00,
    'SQUASH': 2.50,
    'MUSHROOMS': 12.00,
  };

  const basePrice = categoryDefaults[category.toUpperCase()] || 4.00;

  // Adjust for unit
  const unitAdjustments: Record<string, number> = {
    'lb': 1.0,
    'oz': 0.0625, // 1/16 of lb
    'kg': 2.2, // kg to lb
    'g': 0.0022, // g to lb
    'bunch': 2.5,
    'each': 1.5,
    'dozen': 6.0,
    'pint': 0.75,
    'quart': 1.5,
    'gallon': 6.0,
  };

  return basePrice * (unitAdjustments[unit] || 1.0);
}

async function getAIMarketAnalysis(
  data: PricingRequest,
  calculatedPrice: number,
  factors: ReturnType<typeof calculatePricingFactors>
): Promise<{
  reasoning: string;
  recommendations: string[];
  insights: string;
  tokensUsed?: number;
}> {
  const client = getOpenAIClient();

  const prompt = buildPricingAnalysisPrompt(data, calculatedPrice, factors);

  try {
    const completion = await client.chat.completions.create({
      model: PRODUCT_CATALOG_AGENT.model,
      messages: [
        {
          role: "system",
          content: PRODUCT_CATALOG_AGENT.systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4, // Lower temperature for analytical tasks
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content || "{}";
    const parsedResponse = JSON.parse(responseContent);

    return {
      reasoning: parsedResponse.reasoning || "Price calculated based on market factors and agricultural best practices.",
      recommendations: parsedResponse.recommendations || [],
      insights: parsedResponse.marketInsights || "Market conditions are favorable for this product.",
      tokensUsed: completion.usage?.total_tokens,
    };
  } catch (error) {
    logger.error("AI market analysis failed, using defaults", { error });
    return {
      reasoning: "Price calculated based on standard market factors, seasonal adjustments, and quality indicators.",
      recommendations: [
        "Monitor competitor pricing regularly",
        "Adjust prices based on customer feedback",
        "Consider seasonal promotions during peak harvest",
      ],
      insights: "Market analysis unavailable. Price based on industry standards.",
    };
  }
}

function buildPricingAnalysisPrompt(
  data: PricingRequest,
  calculatedPrice: number,
  factors: ReturnType<typeof calculatePricingFactors>
): string {
  return `Analyze the pricing recommendation for the following agricultural product:

**Product**: ${data.productName} (${data.category})
**Unit**: per ${data.unit}
**Calculated Price**: $${calculatedPrice.toFixed(2)}

**Pricing Factors**:
- Market Demand: ${(factors.marketDemand * 100).toFixed(0)}%
- Seasonal Factor: ${factors.seasonalFactor.toFixed(2)}x
- Quality Premium: ${factors.qualityPremium.toFixed(2)}x
- Certification Bonus: +$${factors.certificationBonus.toFixed(2)}
- Distribution: ${data.distributionChannel}

${data.farmingPractices ? `**Farming Practices**: ${data.farmingPractices.join(", ")}` : ""}
${data.certifications ? `**Certifications**: ${data.certifications.join(", ")}` : ""}
${data.productionCost ? `**Production Cost**: $${data.productionCost.toFixed(2)} per ${data.unit}` : ""}
${data.competitorPrices && data.competitorPrices.length > 0 ? `**Competitor Prices**: ${data.competitorPrices.map(p => `$${p.toFixed(2)}`).join(", ")}` : ""}
${data.region ? `**Region**: ${data.region}` : ""}
${data.season ? `**Season**: ${data.season}` : ""}
${data.isInSeason !== undefined ? `**In Season**: ${data.isInSeason ? "Yes" : "No"}` : ""}

Provide:
1. **reasoning**: Explain why this price is appropriate (2-3 sentences)
2. **recommendations**: 3-5 actionable pricing strategies
3. **marketInsights**: Current market trends and competitive landscape (2-3 sentences)

Return as JSON:
{
  "reasoning": "...",
  "recommendations": ["...", "...", "..."],
  "marketInsights": "..."
}`;
}

function calculatePricingConfidence(
  data: PricingRequest,
  factors: ReturnType<typeof calculatePricingFactors>
): number {
  let confidence = 0.5; // Base confidence

  // Has production cost data
  if (data.productionCost) confidence += 0.2;

  // Has competitor pricing
  if (data.competitorPrices && data.competitorPrices.length >= 3) confidence += 0.15;
  else if (data.competitorPrices && data.competitorPrices.length > 0) confidence += 0.08;

  // Has seasonal info
  if (data.season || data.isInSeason !== undefined) confidence += 0.08;

  // Has quality indicators
  if (data.certifications && data.certifications.length > 0) confidence += 0.05;
  if (data.farmingPractices && data.farmingPractices.length > 0) confidence += 0.05;

  // Has region info
  if (data.region) confidence += 0.05;

  return Math.min(confidence, 0.95); // Cap at 95%
}

// ============================================================================
// OPTIONS Handler (CORS)
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
