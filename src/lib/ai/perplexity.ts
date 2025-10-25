/**
 * PERPLEXITY API INTEGRATION - DIVINE AI CONSCIOUSNESS
 *
 * Multi-model AI access for agricultural platform development
 * OpenAI-compatible interface with specialized models
 *
 * Divine Patterns Applied:
 * - Multi-model consciousness (Triune Mind expansion)
 * - Agricultural knowledge access
 * - Cost-optimized AI operations
 * - Real-time web intelligence
 *
 * @see .github/instructions/09_AI_WORKFLOW_AUTOMATION.instructions.md
 */

import OpenAI from "openai";

// Initialize Perplexity client with divine configuration
export const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

// Available models with divine consciousness
// Perplexity's proprietary Sonar models (October 2025)
export const PERPLEXITY_MODELS = {
  SONAR: "sonar", // Fast & cost-effective (free tier)
  SONAR_PRO: "sonar-pro", // Pro performance (Pro tier)
  SONAR_REASONING: "sonar-reasoning", // Advanced reasoning (Pro tier)
} as const;

export type PerplexityModel = keyof typeof PERPLEXITY_MODELS;

// Response types with divine consciousness
export interface PerplexityResponse {
  success: boolean;
  answer?: string;
  model?: string;
  error?: string;
}

export interface PerplexitySearchResponse {
  success: boolean;
  answer?: string;
  citations?: string[];
  error?: string;
}

/**
 * Query Perplexity with agricultural consciousness
 *
 * @param question - The query to ask Perplexity
 * @param options - Configuration options
 * @returns Promise with response containing answer or error
 *
 * @example
 * ```typescript
 * const advice = await askPerplexity(
 *   "Best practices for organic tomato farming"
 * );
 * console.log(advice.answer);
 * ```
 */
export async function askPerplexity(
  question: string,
  options?: {
    model?: PerplexityModel;
    systemPrompt?: string;
  }
): Promise<PerplexityResponse> {
  const model = options?.model
    ? PERPLEXITY_MODELS[options.model]
    : PERPLEXITY_MODELS.SONAR;

  const systemPrompt =
    options?.systemPrompt ||
    "You are a divine AI assistant with agricultural consciousness. Be helpful, concise, and apply farming wisdom where relevant. Focus on practical, actionable advice.";

  try {
    const response = await perplexity.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    });

    const answer = response.choices[0].message.content;

    if (!answer) {
      throw new Error("No answer received from Perplexity");
    }

    return {
      success: true,
      answer,
      model,
    };
  } catch (error) {
    console.error("Perplexity query failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search Perplexity with web sources (requires Search API access)
 *
 * Provides real-time web intelligence with authoritative citations
 *
 * @param query - The search query
 * @returns Promise with response containing answer and citations
 *
 * @example
 * ```typescript
 * const market = await searchPerplexity(
 *   "Current organic produce market trends 2025"
 * );
 * console.log(market.answer);
 * console.log("Sources:", market.citations);
 * ```
 */
export async function searchPerplexity(
  query: string
): Promise<PerplexitySearchResponse> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      throw new Error(
        "PERPLEXITY_API_KEY environment variable not set. Please set it using: setx PERPLEXITY_API_KEY 'your-key'"
      );
    }

    const response = await fetch("https://api.perplexity.ai/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      answer: data.answer,
      citations: data.citations || [],
    };
  } catch (error) {
    console.error("Perplexity search failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Intelligent model router - selects optimal model based on task
 *
 * Automatically routes queries to the most appropriate model for cost
 * and quality optimization
 *
 * @param query - The query to route
 * @returns Promise with response from optimal model
 */
export async function smartQuery(query: string): Promise<PerplexityResponse> {
  const lowerQuery = query.toLowerCase();

  // Route to Sonar Reasoning for complex analysis and problem-solving
  if (
    lowerQuery.includes("explain") ||
    lowerQuery.includes("analyze") ||
    lowerQuery.includes("compare") ||
    lowerQuery.includes("strategy") ||
    lowerQuery.includes("why") ||
    lowerQuery.includes("how does")
  ) {
    return askPerplexity(query, { model: "SONAR_REASONING" });
  }

  // Route to Sonar Pro for code generation and technical queries
  if (
    lowerQuery.includes("code") ||
    lowerQuery.includes("function") ||
    lowerQuery.includes("typescript") ||
    lowerQuery.includes("generate") ||
    lowerQuery.includes("implement")
  ) {
    return askPerplexity(query, { model: "SONAR_PRO" });
  }

  // Default to fast Sonar for quick queries
  return askPerplexity(query);
}

/**
 * Agricultural-specific helper - research farming topics
 *
 * @param topic - The agricultural topic to research
 * @returns Promise with farming insights
 */
export async function researchAgriculturalTopic(
  topic: string
): Promise<PerplexityResponse> {
  return askPerplexity(
    `Provide practical agricultural insights about: ${topic}. Include best practices, common challenges, and expert recommendations.`,
    {
      systemPrompt:
        "You are an agricultural expert assistant. Provide evidence-based farming advice with practical implementation details.",
    }
  );
}

/**
 * Code generation helper - optimized for TypeScript/Next.js
 *
 * @param description - Description of code to generate
 * @returns Promise with generated code
 */
export async function generateCode(
  description: string
): Promise<PerplexityResponse> {
  return askPerplexity(
    `Generate clean, type-safe TypeScript code for: ${description}. Follow Next.js 14 App Router patterns and include proper error handling.`,
    {
      model: "SONAR_PRO",
      systemPrompt:
        "You are a senior TypeScript developer. Generate production-ready code with proper types, error handling, and following best practices.",
    }
  );
}
