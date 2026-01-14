/**
 * AI Pest Identification API
 * POST /api/ai/pest-identify
 *
 * Identifies pests, diseases, and plant health issues from images using
 * OpenAI GPT-4 Vision with agricultural expertise.
 *
 * @module api/ai/pest-identify
 */

import { getOpenAIClient } from "@/lib/ai/agent-config";
import { createLogger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logger = createLogger("AI-PestIdentify");

// ============================================================================
// Validation Schema
// ============================================================================

const PestIdentifyRequestSchema = z.object({
  imageUrl: z.string().url().or(z.string().startsWith("data:image/")),
  cropType: z.string().min(2).max(100).optional(),
  symptoms: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  recentWeather: z.string().max(200).optional(),
  farmingPractices: z.array(z.string()).optional(),
  analysisDepth: z
    .enum(["quick", "detailed", "comprehensive"])
    .default("detailed"),
});

type PestIdentifyRequest = z.infer<typeof PestIdentifyRequestSchema>;

interface PestIdentifyResponse {
  success: boolean;
  data?: {
    identification: {
      type:
        | "pest"
        | "disease"
        | "deficiency"
        | "environmental"
        | "healthy"
        | "unknown";
      name: string;
      scientificName?: string;
      commonNames?: string[];
      confidence: number;
    };
    severity: "low" | "moderate" | "high" | "critical";
    affectedAreas: string[];
    symptoms: string[];
    analysis: string;
    causes: string[];
    organicTreatments: Array<{
      method: string;
      description: string;
      effectiveness: "high" | "moderate" | "low";
      timeToResults: string;
      materials: string[];
    }>;
    conventionalTreatments?: Array<{
      method: string;
      description: string;
      activeIngredient?: string;
      precautions: string[];
    }>;
    prevention: string[];
    monitoring: string[];
    whenToSeekHelp: string[];
    additionalResources?: Array<{
      title: string;
      url?: string;
      type: "article" | "video" | "guide" | "extension";
    }>;
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
    imageAnalysisQuality: "high" | "medium" | "low";
  };
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse<PestIdentifyResponse>> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = PestIdentifyRequestSchema.parse(body);

    logger.info("Processing pest identification request", {
      requestId,
      cropType: validatedData.cropType,
      hasSymptoms: !!validatedData.symptoms,
      analysisDepth: validatedData.analysisDepth,
    });

    // Validate image format and size
    const imageValidation = await validateImage(validatedData.imageUrl);
    if (!imageValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_IMAGE",
            message: imageValidation.error || "Invalid image format or size",
          },
          metadata: {
            model: "gpt-4o",
            tokensUsed: 0,
            requestId,
            processingTime: Date.now() - startTime,
            imageAnalysisQuality: "low",
          },
        },
        { status: 400 },
      );
    }

    // Analyze image with AI
    const result = await analyzePestImage(validatedData, requestId);

    const processingTime = Date.now() - startTime;

    logger.info("Pest identification completed", {
      requestId,
      processingTime,
      identified: result.identification.name,
      confidence: result.identification.confidence,
      severity: result.severity,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        metadata: {
          model: "gpt-4o",
          tokensUsed: result.tokensUsed || 0,
          requestId,
          processingTime,
          imageAnalysisQuality: imageValidation.quality || "medium",
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
            model: "gpt-4o",
            tokensUsed: 0,
            requestId,
            processingTime,
            imageAnalysisQuality: "low",
          },
        },
        { status: 400 },
      );
    }

    logger.error("Failed to identify pest/disease", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to analyze image. Please try again.",
        },
        metadata: {
          model: "gpt-4o",
          tokensUsed: 0,
          requestId,
          processingTime,
          imageAnalysisQuality: "low",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// Image Validation
// ============================================================================

async function validateImage(imageUrl: string): Promise<{
  valid: boolean;
  error?: string;
  quality?: "high" | "medium" | "low";
}> {
  try {
    // Check if data URL
    if (imageUrl.startsWith("data:image/")) {
      const match = imageUrl.match(
        /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/,
      );
      if (!match) {
        return {
          valid: false,
          error: "Invalid data URL format. Supported: PNG, JPEG, WebP",
        };
      }

      // Check base64 size (rough estimate: 3/4 of base64 length)
      const base64Data = match[2];
      const sizeInBytes = (base64Data.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 20) {
        return { valid: false, error: "Image too large. Maximum 20MB." };
      }

      // Estimate quality based on size
      const quality = sizeInMB > 5 ? "high" : sizeInMB > 2 ? "medium" : "low";

      return { valid: true, quality };
    }

    // For regular URLs, basic validation
    if (!imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) {
      return {
        valid: false,
        error: "URL must point to an image file (jpg, png, webp)",
      };
    }

    return { valid: true, quality: "medium" };
  } catch (error) {
    logger.error("Image validation error", { error });
    return { valid: false, error: "Failed to validate image" };
  }
}

// ============================================================================
// AI Vision Analysis
// ============================================================================

async function analyzePestImage(
  data: PestIdentifyRequest,
  requestId: string,
): Promise<
  NonNullable<PestIdentifyResponse["data"]> & { tokensUsed?: number }
> {
  const client = getOpenAIClient();

  const prompt = buildVisionAnalysisPrompt(data);

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert agricultural pathologist and entomologist specializing in crop health diagnosis.

Your expertise includes:
- Pest identification (insects, mites, nematodes)
- Disease identification (fungal, bacterial, viral)
- Nutrient deficiencies and toxicities
- Environmental stress symptoms
- Integrated Pest Management (IPM)
- Organic and sustainable treatment methods

Guidelines:
- Provide accurate, evidence-based diagnoses
- Prioritize organic and least-toxic solutions
- Consider the farmer's specific context
- Be clear about confidence levels
- Recommend professional consultation when appropriate
- Focus on prevention and long-term solutions`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: data.imageUrl,
              detail:
                data.analysisDepth === "comprehensive"
                  ? "high"
                  : data.analysisDepth === "quick"
                    ? "low"
                    : "auto",
            },
          },
        ],
      },
    ],
    temperature: 0.3, // Lower temperature for analytical accuracy
    max_tokens:
      data.analysisDepth === "comprehensive"
        ? 3000
        : data.analysisDepth === "quick"
          ? 1000
          : 2000,
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0]?.message?.content || "{}";
  const parsedResponse = JSON.parse(responseContent);

  // Structure and validate response
  return {
    identification: {
      type: parsedResponse.identification?.type || "unknown",
      name: parsedResponse.identification?.name || "Unable to identify",
      scientificName: parsedResponse.identification?.scientificName,
      commonNames: parsedResponse.identification?.commonNames || [],
      confidence: parsedResponse.identification?.confidence || 0.5,
    },
    severity: parsedResponse.severity || "moderate",
    affectedAreas: parsedResponse.affectedAreas || [],
    symptoms: parsedResponse.symptoms || [],
    analysis:
      parsedResponse.analysis ||
      "Image analysis in progress. Please ensure the image shows clear details of the affected plant area.",
    causes: parsedResponse.causes || [],
    organicTreatments: parsedResponse.organicTreatments || [],
    conventionalTreatments: parsedResponse.conventionalTreatments,
    prevention: parsedResponse.prevention || [],
    monitoring: parsedResponse.monitoring || [],
    whenToSeekHelp: parsedResponse.whenToSeekHelp || [],
    additionalResources: parsedResponse.additionalResources,
    tokensUsed: completion.usage?.total_tokens,
  };
}

function buildVisionAnalysisPrompt(data: PestIdentifyRequest): string {
  return `Analyze this crop/plant image and identify any pests, diseases, or health issues.

**Context**:
${data.cropType ? `**Crop Type**: ${data.cropType}` : ""}
${data.symptoms ? `**Reported Symptoms**: ${data.symptoms}` : ""}
${data.location ? `**Location**: ${data.location}` : ""}
${data.recentWeather ? `**Recent Weather**: ${data.recentWeather}` : ""}
${data.farmingPractices && data.farmingPractices.length > 0 ? `**Farming Practices**: ${data.farmingPractices.join(", ")}` : ""}

**Analysis Depth**: ${data.analysisDepth}

Provide a comprehensive analysis in JSON format:

{
  "identification": {
    "type": "pest" | "disease" | "deficiency" | "environmental" | "healthy" | "unknown",
    "name": "Common name of the issue",
    "scientificName": "Scientific name if applicable",
    "commonNames": ["Alternative names"],
    "confidence": 0.0-1.0
  },
  "severity": "low" | "moderate" | "high" | "critical",
  "affectedAreas": ["List of affected plant parts"],
  "symptoms": ["Observable symptoms"],
  "analysis": "Detailed explanation of what you observe and your diagnosis (2-4 paragraphs)",
  "causes": ["Primary causes or risk factors"],
  "organicTreatments": [
    {
      "method": "Treatment name",
      "description": "Detailed application instructions",
      "effectiveness": "high" | "moderate" | "low",
      "timeToResults": "Expected timeframe",
      "materials": ["Required materials"]
    }
  ],
  "conventionalTreatments": [
    {
      "method": "Treatment name",
      "description": "Application instructions",
      "activeIngredient": "Chemical name",
      "precautions": ["Safety precautions"]
    }
  ],
  "prevention": ["Future prevention strategies"],
  "monitoring": ["What to watch for during treatment"],
  "whenToSeekHelp": ["Conditions requiring professional consultation"],
  "additionalResources": [
    {
      "title": "Resource title",
      "url": "URL if available",
      "type": "article" | "video" | "guide" | "extension"
    }
  ]
}

**Important**:
1. Examine the image carefully for signs of damage, discoloration, spots, holes, insects, or abnormal growth
2. Consider the crop type and context when making your diagnosis
3. Provide at least 3 organic treatment options prioritized by effectiveness
4. Include preventive measures to avoid recurrence
5. Be honest about confidence level - if unsure, say so and suggest professional consultation
6. Focus on actionable, practical advice farmers can implement`;
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
