/**
 * AI Product Description Generator API
 * POST /api/ai/product-description
 *
 * Generates compelling, SEO-optimized product descriptions for farm products
 * using OpenAI GPT-4o with agricultural domain expertise.
 *
 * @module api/ai/product-description
 */

import { getOpenAIClient, PRODUCT_CATALOG_AGENT } from "@/lib/ai/agent-config";
import {
  estimateCost,
  extractUser,
  logAIUsage,
  withAIMiddleware,
  type AIMiddlewareResult,
} from "@/lib/ai/middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { createLogger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("AI-ProductDescription");

// ============================================================================
// Validation Schema
// ============================================================================

const ProductDescriptionRequestSchema = z.object({
  productName: z.string().min(2).max(200),
  category: z.string().min(2).max(100),
  farmName: z.string().min(2).max(200).optional(),
  farmingPractices: z
    .array(
      z.enum([
        "ORGANIC",
        "CONVENTIONAL",
        "PERMACULTURE",
        "HYDROPONIC",
        "AQUAPONIC",
        "REGENERATIVE",
        "BIODYNAMIC",
      ]),
    )
    .optional(),
  certifications: z
    .array(
      z.enum([
        "ORGANIC",
        "NON_GMO",
        "BIODYNAMIC",
        "RAINFOREST_ALLIANCE",
        "FAIR_TRADE",
      ]),
    )
    .optional(),
  harvestDate: z.string().optional(),
  variety: z.string().max(100).optional(),
  flavorProfile: z.string().max(500).optional(),
  culinaryUses: z.string().max(500).optional(),
  storageInstructions: z.string().max(300).optional(),
  nutritionalHighlights: z.string().max(300).optional(),
  tone: z
    .enum(["professional", "casual", "storytelling", "technical"])
    .default("casual"),
  length: z.enum(["short", "medium", "long"]).default("medium"),
  includeKeywords: z.array(z.string()).max(10).optional(),
});

type ProductDescriptionRequest = z.infer<
  typeof ProductDescriptionRequestSchema
>;

interface ProductDescriptionResponse {
  success: boolean;
  data?: {
    description: string;
    shortDescription: string;
    seoTitle: string;
    seoMetaDescription: string;
    suggestedTags: string[];
    wordCount: number;
    confidence: number;
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

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ProductDescriptionResponse> | NextResponse<unknown>> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Apply authentication, rate limiting, and quota checks
    const middlewareResult = await withAIMiddleware(request, {
      requireAuth: true,
      rateLimitConfig: RATE_LIMITS.PRODUCT_DESCRIPTION,
      endpoint: "product-description",
      checkQuota: true,
    });

    // If middleware returned a response (error), return it
    if (middlewareResult instanceof NextResponse) {
      return middlewareResult;
    }

    // Extract user info
    const { userId, email } = extractUser(
      middlewareResult as AIMiddlewareResult,
    );

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ProductDescriptionRequestSchema.parse(body);

    logger.info("Generating product description", {
      requestId,
      userId,
      productName: validatedData.productName,
      category: validatedData.category,
    });

    // Generate description using AI
    const result = await generateProductDescription(validatedData, requestId);

    const processingTime = Date.now() - startTime;
    const costUSD = estimateCost(
      PRODUCT_CATALOG_AGENT.model,
      result.tokensUsed || 0,
    );

    // Log usage for cost tracking
    await logAIUsage({
      userId,
      endpoint: "product-description",
      model: PRODUCT_CATALOG_AGENT.model,
      tokensUsed: result.tokensUsed || 0,
      costUSD,
      requestId,
      requestData: {
        productName: validatedData.productName,
        category: validatedData.category,
        tone: validatedData.tone,
        length: validatedData.length,
      },
      responseData: {
        wordCount: result.wordCount,
        tagsCount: result.suggestedTags.length,
      },
      confidence: result.confidence,
      processingTimeMs: processingTime,
      success: true,
    });

    logger.info("Product description generated successfully", {
      requestId,
      userId,
      processingTime,
      wordCount: result.wordCount,
      confidence: result.confidence,
      costUSD: costUSD.toFixed(6),
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
      { status: 200 },
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
        { status: 400 },
      );
    }

    logger.error("Failed to generate product description", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate product description. Please try again.",
        },
        metadata: {
          model: PRODUCT_CATALOG_AGENT.model,
          tokensUsed: 0,
          requestId,
          processingTime,
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// AI Generation Logic
// ============================================================================

async function generateProductDescription(
  data: ProductDescriptionRequest,
  requestId: string,
): Promise<{
  description: string;
  shortDescription: string;
  seoTitle: string;
  seoMetaDescription: string;
  suggestedTags: string[];
  wordCount: number;
  confidence: number;
  tokensUsed?: number;
}> {
  const client = getOpenAIClient();

  // Build detailed prompt based on input
  const prompt = buildDescriptionPrompt(data);

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
    temperature: PRODUCT_CATALOG_AGENT.temperature,
    max_tokens:
      data.length === "short" ? 500 : data.length === "long" ? 2000 : 1000,
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0]?.message?.content || "{}";
  const parsedResponse = JSON.parse(responseContent);

  // Calculate confidence based on response quality
  const confidence = calculateDescriptionConfidence(parsedResponse, data);

  return {
    description: parsedResponse.description || "",
    shortDescription:
      parsedResponse.shortDescription ||
      parsedResponse.description?.substring(0, 160) ||
      "",
    seoTitle:
      parsedResponse.seoTitle ||
      `${data.productName} - ${data.farmName || "Fresh Farm"}`,
    seoMetaDescription:
      parsedResponse.seoMetaDescription ||
      parsedResponse.shortDescription ||
      "",
    suggestedTags: parsedResponse.suggestedTags || generateDefaultTags(data),
    wordCount: (parsedResponse.description || "").split(/\s+/).length,
    confidence,
    tokensUsed: completion.usage?.total_tokens,
  };
}

function buildDescriptionPrompt(data: ProductDescriptionRequest): string {
  const lengthGuide = {
    short: "50-100 words",
    medium: "150-250 words",
    long: "300-500 words",
  };

  const toneGuide = {
    professional: "formal, informative, and authoritative",
    casual: "friendly, conversational, and approachable",
    storytelling: "narrative-driven, emotive, and engaging",
    technical: "detailed, precise, and educational",
  };

  const prompt = `Generate a compelling product description for the following agricultural product:

**Product Name**: ${data.productName}
**Category**: ${data.category}
${data.farmName ? `**Farm**: ${data.farmName}` : ""}
${data.variety ? `**Variety**: ${data.variety}` : ""}
${data.harvestDate ? `**Harvest Date**: ${data.harvestDate}` : ""}

${data.farmingPractices && data.farmingPractices.length > 0 ? `**Farming Practices**: ${data.farmingPractices.join(", ")}` : ""}
${data.certifications && data.certifications.length > 0 ? `**Certifications**: ${data.certifications.join(", ")}` : ""}
${data.flavorProfile ? `**Flavor Profile**: ${data.flavorProfile}` : ""}
${data.culinaryUses ? `**Culinary Uses**: ${data.culinaryUses}` : ""}
${data.storageInstructions ? `**Storage**: ${data.storageInstructions}` : ""}
${data.nutritionalHighlights ? `**Nutritional Highlights**: ${data.nutritionalHighlights}` : ""}

**Requirements**:
- Length: ${lengthGuide[data.length]}
- Tone: ${toneGuide[data.tone]}
${data.includeKeywords && data.includeKeywords.length > 0 ? `- Include these keywords naturally: ${data.includeKeywords.join(", ")}` : ""}

**Guidelines**:
1. Highlight freshness, quality, and local sourcing
2. Emphasize unique selling points (organic, seasonal, farm story)
3. Use sensory language (taste, texture, aroma)
4. Include practical information (storage, uses, preparation)
5. Make it SEO-friendly and customer-focused
6. Avoid exaggeration or unverified claims

Return your response as JSON with the following structure:
{
  "description": "Full product description (${lengthGuide[data.length]})",
  "shortDescription": "Brief 1-2 sentence summary (max 160 characters)",
  "seoTitle": "SEO-optimized title (50-60 characters)",
  "seoMetaDescription": "Meta description for search engines (150-160 characters)",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  return prompt;
}

function calculateDescriptionConfidence(
  response: any,
  request: ProductDescriptionRequest,
): number {
  let confidence = 0.5; // Base confidence

  // Check for required fields
  if (response.description && response.description.length > 50)
    confidence += 0.2;
  if (response.shortDescription && response.shortDescription.length > 20)
    confidence += 0.1;
  if (response.seoTitle && response.seoTitle.length > 0) confidence += 0.05;
  if (response.seoMetaDescription && response.seoMetaDescription.length > 100)
    confidence += 0.05;
  if (
    response.suggestedTags &&
    Array.isArray(response.suggestedTags) &&
    response.suggestedTags.length >= 3
  )
    confidence += 0.1;

  // Check if keywords are included (if requested)
  if (request.includeKeywords && request.includeKeywords.length > 0) {
    const descLower = (response.description || "").toLowerCase();
    const includedCount = request.includeKeywords.filter((kw) =>
      descLower.includes(kw.toLowerCase()),
    ).length;
    confidence += (includedCount / request.includeKeywords.length) * 0.1;
  }

  return Math.min(confidence, 1.0);
}

function generateDefaultTags(data: ProductDescriptionRequest): string[] {
  const tags: string[] = [
    data.category.toLowerCase(),
    data.productName.toLowerCase().split(" ")[0],
  ];

  if (data.farmingPractices && data.farmingPractices.includes("ORGANIC")) {
    tags.push("organic");
  }

  if (data.certifications) {
    tags.push(
      ...data.certifications.map((c) => c.toLowerCase().replace("_", "-")),
    );
  }

  tags.push("local", "fresh", "seasonal");

  return [...new Set(tags)].slice(0, 5);
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
    },
  );
}
