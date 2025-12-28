/**
 * 🌟 OLLAMA AGRICULTURAL ANALYSIS API ROUTE
 * Divine Agricultural Intelligence Endpoint
 * HP OMEN Optimized - DeepSeek-R1:7b
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOllamaClient, AgriculturalAnalysisAgent } from "@/lib/ai/ollama";

// ============================================================================
// POST /api/ai/ollama/analyze - Analyze agricultural data/questions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to use AI analysis features",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { query, context, analysisType = "general" } = body;

    // Validation
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_QUERY",
            message: "Query is required and must be a string",
          },
        },
        { status: 400 },
      );
    }

    // Create Ollama client
    const client = createOllamaClient("deepseek-r1:7b");

    // Health check
    const isHealthy = await client.healthCheck();
    if (!isHealthy) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "OLLAMA_UNAVAILABLE",
            message:
              "Ollama service is not available. Please ensure Ollama is running on http://localhost:11434",
            instructions: [
              "1. Open a terminal/command prompt",
              "2. Run: ollama serve",
              "3. In another terminal, verify: ollama list",
              "4. If deepseek-r1:7b is not installed, run: ollama pull deepseek-r1:7b",
            ],
          },
        },
        { status: 503 },
      );
    }

    // Create agricultural agent
    const agent = new AgriculturalAnalysisAgent(client);

    let result;

    // Route to appropriate analysis type
    switch (analysisType) {
      case "advisory":
      case "farming_advisory": {
        // Get farming advisory with risk assessment
        const advisory = await agent.getFarmingAdvisory(query, context);

        result = {
          type: "farming_advisory",
          advice: advisory.advice,
          actionItems: advisory.actionItems,
          riskLevel: advisory.riskLevel,
          biodynamicScore: advisory.biodynamicScore,
          quantumCoherence: advisory.quantumCoherence,
          agricultural: {
            consciousness: "DIVINE",
            alignedWithNature: advisory.quantumCoherence > 70,
            biodynamicRecommended: advisory.biodynamicScore > 60,
          },
        };
        break;
      }

      case "general":
      case "analysis":
      default: {
        // General agricultural analysis
        const analysis = await agent.analyze(query, context);

        result = {
          type: "agricultural_analysis",
          analysis: analysis.analysis,
          recommendations: analysis.recommendations,
          confidence: analysis.confidence,
          agriculturalRelevance: analysis.agriculturalRelevance,
          seasonalConsiderations: analysis.seasonalConsiderations,
          agricultural: {
            consciousness: "DIVINE",
            highRelevance: analysis.agriculturalRelevance > 0.7,
            seasonalAware: (analysis.seasonalConsiderations?.length || 0) > 0,
          },
        };
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        model: "deepseek-r1:7b",
        userId: session.user.id,
        analysisType,
      },
    });
  } catch (error) {
    console.error("Ollama analysis error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ANALYSIS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to analyze agricultural query",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// GET /api/ai/ollama/analyze - Get analysis capabilities
// ============================================================================

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to view AI capabilities",
          },
        },
        { status: 401 },
      );
    }

    const client = createOllamaClient("deepseek-r1:7b");
    const isHealthy = await client.healthCheck();

    return NextResponse.json({
      success: true,
      data: {
        status: isHealthy ? "online" : "offline",
        capabilities: {
          agriculturalAnalysis: {
            available: isHealthy,
            description:
              "Analyze agricultural data, crop health, soil conditions, and farming practices",
            features: [
              "Crop disease identification",
              "Soil health assessment",
              "Pest management recommendations",
              "Seasonal planning advice",
              "Biodynamic farming guidance",
            ],
          },
          farmingAdvisory: {
            available: isHealthy,
            description:
              "Get expert farming advisory with risk assessment and action items",
            features: [
              "Risk level assessment (LOW/MEDIUM/HIGH)",
              "Biodynamic scoring (0-100)",
              "Quantum coherence analysis",
              "Actionable recommendations",
              "Natural cycle alignment",
            ],
          },
        },
        analysisTypes: [
          {
            type: "general",
            name: "General Agricultural Analysis",
            description:
              "Comprehensive analysis with recommendations and seasonal considerations",
          },
          {
            type: "advisory",
            name: "Farming Advisory",
            description:
              "Expert advisory with risk assessment and action items",
          },
        ],
        model: {
          name: "deepseek-r1:7b",
          description:
            "DeepSeek-R1 7B - Optimized for reasoning and agricultural domain knowledge",
          features: [
            "7 billion parameters",
            "GPU accelerated on RTX 2070 Max-Q",
            "Local inference - no API costs",
            "Privacy-first - data stays on device",
          ],
        },
      },
    });
  } catch (error) {
    console.error("Analysis capabilities error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CAPABILITIES_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to get analysis capabilities",
        },
      },
      { status: 500 },
    );
  }
}
