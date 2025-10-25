/**
 * SMART PERPLEXITY MIDDLEWARE - AUTOMATIC AI ENHANCEMENT
 *
 * Automatically uses Perplexiexport async function autoGenerateProductDescription(
  productName: string,
  category: string,
  existingDescription?: string
): Promise<{
  description: string;
  aiGenerated: boolean;
  quality: QualityLevel;
}> {t improves performance/quality
 * Divine Pattern: Intelligent auto-enhancement without manual intervention
 *
 * Use Cases:
 * - Search query enhancement
 * - Product description generation
 * - Agricultural advice caching
 * - Content enrichment
 */

import {
  askPerplexity,
  researchAgriculturalTopic,
  smartQuery,
} from "./perplexity";

// Cache to avoid duplicate API calls
const responseCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Smart Search Enhancement
 * Automatically improves search queries with AI understanding
 */
export async function enhanceSearchQuery(
  userQuery: string,
  options?: {
    skipAI?: boolean; // Manual override
    maxTokens?: number;
  }
): Promise<{
  originalQuery: string;
  enhancedQuery?: string;
  aiSuggestions?: string[];
  useAI: boolean;
}> {
  // Skip if explicitly disabled or query is too simple
  if (options?.skipAI || userQuery.length < 5) {
    return {
      originalQuery: userQuery,
      useAI: false,
    };
  }

  try {
    // Check cache first
    const cacheKey = `search:${userQuery.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Use Perplexity to understand intent and suggest alternatives
    const aiResponse = await askPerplexity(
      `Analyze this search query: "${userQuery}".
      Provide:
      1. Better search terms (2-3 words)
      2. Related terms (3-5 alternatives)
      Keep it concise, farming-focused.`,
      { model: "SONAR" }
    );

    if (aiResponse.success && aiResponse.answer) {
      const result = {
        originalQuery: userQuery,
        enhancedQuery: extractEnhancedQuery(aiResponse.answer),
        aiSuggestions: extractSuggestions(aiResponse.answer),
        useAI: true,
      };

      // Cache the result
      setCache(cacheKey, JSON.stringify(result));
      return result;
    }
  } catch (error) {
    console.error("AI search enhancement failed:", error);
  }

  // Fallback: return original query
  return {
    originalQuery: userQuery,
    useAI: false,
  };
}

/**
 * Auto-Generate Product Descriptions
 * Automatically creates descriptions when missing or poor quality
 */
export async function autoGenerateProductDescription(
  productName: string,
  category: string,
  existingDescription?: string
): Promise<{
  description: string;
  aiGenerated: boolean;
  quality: "excellent" | "good" | "poor";
}> {
  // Check if existing description is good enough
  if (existingDescription && existingDescription.length > 100) {
    return {
      description: existingDescription,
      aiGenerated: false,
      quality: assessDescriptionQuality(existingDescription),
    };
  }

  try {
    const cacheKey = `product:${category}:${productName}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Generate with AI
    const prompt = `Write a compelling 2-3 sentence product description for:
Product: ${productName}
Category: ${category}

Include: benefits, uses, and what makes it special.
Tone: Professional, agricultural, concise.`;

    const aiResponse = await askPerplexity(prompt, { model: "SONAR_PRO" });

    if (aiResponse.success && aiResponse.answer) {
      const result = {
        description: aiResponse.answer.trim(),
        aiGenerated: true,
        quality: "excellent" as const,
      };

      setCache(cacheKey, JSON.stringify(result));
      return result;
    }
  } catch (error) {
    console.error("AI description generation failed:", error);
  }

  // Fallback
  return {
    description:
      existingDescription || `Fresh ${productName} from local farms.`,
    aiGenerated: false,
    quality: "poor",
  };
}

/**
 * Smart Agricultural Advice Cache
 * Automatically provides farming advice with intelligent caching
 */
export async function getAgriculturalAdvice(
  topic: string,
  force = false
): Promise<{
  advice: string;
  cached: boolean;
  timestamp: Date;
}> {
  const cacheKey = `advice:${topic.toLowerCase()}`;

  if (!force) {
    const cached = getCached(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return {
        ...data,
        cached: true,
      };
    }
  }

  try {
    const response = await researchAgriculturalTopic(topic);

    if (response.success && response.answer) {
      const result = {
        advice: response.answer,
        cached: false,
        timestamp: new Date(),
      };

      setCache(cacheKey, JSON.stringify(result));
      return result;
    }
  } catch (error) {
    console.error("Agricultural advice failed:", error);
  }

  return {
    advice: "Unable to retrieve advice at this time. Please try again later.",
    cached: false,
    timestamp: new Date(),
  };
}

/**
 * Automatic Content Enrichment
 * Adds AI-generated context to farm/product pages
 */
export async function enrichContent(
  contentType: "farm" | "product" | "category",
  data: {
    name: string;
    description?: string;
    category?: string;
  }
): Promise<{
  original: typeof data;
  enriched: {
    tips?: string;
    seasonalInfo?: string;
    relatedTopics?: string[];
  };
  enhanced: boolean;
}> {
  try {
    const cacheKey = `enrich:${contentType}:${data.name}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    let prompt = "";
    if (contentType === "product") {
      prompt = `For the product "${data.name}" (${data.category}), provide:
1. One quick tip (1 sentence)
2. Seasonal availability (1 sentence)
3. Three related products
Keep it brief and practical.`;
    } else if (contentType === "farm") {
      prompt = `For "${data.name}" farm, provide:
1. One interesting farming fact (1 sentence)
2. What makes this farm type unique (1 sentence)
3. Three related farming topics
Keep it concise.`;
    }

    const response = await smartQuery(prompt);

    if (response.success && response.answer) {
      const enriched = parseEnrichedContent(response.answer);
      const result = {
        original: data,
        enriched,
        enhanced: true,
      };

      setCache(cacheKey, JSON.stringify(result));
      return result;
    }
  } catch (error) {
    console.error("Content enrichment failed:", error);
  }

  return {
    original: data,
    enriched: {},
    enhanced: false,
  };
}

/**
 * Smart Decision: Should We Use AI?
 * Automatically decides when AI would improve performance/quality
 */
export function shouldUseAI(context: {
  operation: "search" | "describe" | "advice" | "enrich";
  dataQuality: "poor" | "good" | "excellent";
  userTier: "free" | "pro";
  cached: boolean;
}): boolean {
  // Always use cache if available
  if (context.cached) return false;

  // Pro users get AI for everything
  if (context.userTier === "pro") return true;

  // Free users: only use AI for poor quality or advice
  if (context.operation === "advice") return true;
  if (context.dataQuality === "poor") return true;

  return false;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCached(key: string): string | null {
  const cached = responseCache.get(key);
  if (!cached) return null;

  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL) {
    responseCache.delete(key);
    return null;
  }

  return cached.data;
}

function setCache(key: string, data: string): void {
  responseCache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Cleanup old entries (keep cache size manageable)
  if (responseCache.size > 1000) {
    const oldestKey = Array.from(responseCache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    )[0][0];
    responseCache.delete(oldestKey);
  }
}

function assessDescriptionQuality(
  description: string
): "excellent" | "good" | "poor" {
  if (description.length < 50) return "poor";
  if (description.length < 150) return "good";
  return "excellent";
}

function extractEnhancedQuery(aiResponse: string): string {
  // Extract the first suggested search term from AI response
  const lines = aiResponse.split("\n");
  for (const line of lines) {
    if (line.includes("search") || line.includes("term")) {
      return line.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    }
  }
  return "";
}

function extractSuggestions(aiResponse: string): string[] {
  // Extract alternative search suggestions
  const suggestions: string[] = [];
  const lines = aiResponse.split("\n");

  for (const line of lines) {
    if (line.match(/^\d+\./)) {
      const suggestion = line.replace(/^\d+\.\s*/, "").trim();
      if (suggestion) suggestions.push(suggestion);
    }
  }

  return suggestions.slice(0, 5);
}

function parseEnrichedContent(aiResponse: string): {
  tips?: string;
  seasonalInfo?: string;
  relatedTopics?: string[];
} {
  const enriched: {
    tips?: string;
    seasonalInfo?: string;
    relatedTopics?: string[];
  } = {};

  const lines = aiResponse.split("\n");
  let currentSection = "";

  for (const line of lines) {
    if (line.toLowerCase().includes("tip")) {
      currentSection = "tip";
    } else if (line.toLowerCase().includes("season")) {
      currentSection = "seasonal";
    } else if (line.toLowerCase().includes("related")) {
      currentSection = "related";
    } else if (line.trim() && currentSection) {
      if (currentSection === "tip") enriched.tips = line.trim();
      if (currentSection === "seasonal") enriched.seasonalInfo = line.trim();
      if (currentSection === "related") {
        enriched.relatedTopics = enriched.relatedTopics || [];
        enriched.relatedTopics.push(line.trim());
      }
    }
  }

  return enriched;
}

/**
 * Export smart defaults for automatic usage
 */
export const SmartPerplexity = {
  enhanceSearchQuery,
  autoGenerateProductDescription,
  getAgriculturalAdvice,
  enrichContent,
  shouldUseAI,
};
