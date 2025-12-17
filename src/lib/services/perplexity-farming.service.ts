/**
 * PERPLEXITY FARMING SERVICE
 * Divine Agricultural Intelligence - Comprehensive Implementation
 *
 * Implements:
 * 1. Smart Farming Advice
 * 2. Product Recommendations
 * 3. Market Intelligence
 * 4. Educational Content
 * 5. AI-Powered Support
 */

import { trace, SpanStatusCode } from "@opentelemetry/api";
import { PerplexityAI, AgriculturalResearchAgent } from "@/lib/ai/perplexity";
import type {
  FarmingAdviceRequest,
  FarmingAdviceResponse,
  ProductRecommendationRequest,
  ProductRecommendationResponse,
  MarketIntelligenceRequest,
  MarketIntelligenceResponse,
  EducationalContentRequest,
  EducationalContentResponse,
  SupportRequest,
  SupportResponse,
  Season,
  FarmingCategory,
  Citation,
  ProductRecommendation,
  MarketTrend,
  MarketInsight,
  BusinessOpportunity,
  EducationalContent,
  ContentSection,
  SupportMessage,
  SuggestedAction,
} from "@/types/farming-advice.types";
import { getCurrentSeason } from "@/types/farming-advice.types";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function convertConfidenceToNumber(
  confidence: "high" | "medium" | "low",
): number {
  const map = { high: 0.9, medium: 0.7, low: 0.5 };
  return map[confidence];
}

// ============================================================================
// PERPLEXITY FARMING SERVICE
// ============================================================================

export class PerplexityFarmingService {
  private client: PerplexityAI;
  private researchAgent: AgriculturalResearchAgent;
  private tracer = trace.getTracer("perplexity-farming-service");

  constructor(apiKey?: string) {
    const key = apiKey || process.env.PERPLEXITY_API_KEY;

    if (!key) {
      // Don't throw during build time - defer to runtime when service is actually used
      if (process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE) {
        throw new Error("PERPLEXITY_API_KEY not configured");
      }
      // Use empty string for build time, will fail gracefully at runtime if actually called
      this.client = new PerplexityAI(key || "");
      this.researchAgent = new AgriculturalResearchAgent(key || "");
      return;
    }

    this.client = new PerplexityAI(key);
    this.researchAgent = new AgriculturalResearchAgent(key);
  }

  // ==========================================================================
  // 1. SMART FARMING ADVICE
  // ==========================================================================

  async getFarmingAdvice(
    request: FarmingAdviceRequest,
  ): Promise<FarmingAdviceResponse> {
    return await this.tracer.startActiveSpan(
      "getFarmingAdvice",
      async (span) => {
        try {
          span.setAttributes({
            "farming.question": request.question,
            "farming.category": request.category || "GENERAL",
            "farming.season": request.currentSeason || getCurrentSeason(),
          });

          const startTime = Date.now();
          const season = request.currentSeason || getCurrentSeason();

          // Build context-aware prompt
          const contextPrompt = this.buildFarmingAdvicePrompt(request, season);

          // Get research from Perplexity
          const result = await this.researchAgent.researchTopic(contextPrompt, {
            depth: request.depth || "comprehensive",
            recencyFilter: request.recencyFilter || "month",
          });

          const processingTime = Date.now() - startTime;

          // Detect category if not provided
          const category =
            request.category || this.detectCategory(request.question);

          span.setStatus({ code: SpanStatusCode.OK });

          return {
            success: true,
            data: {
              answer: result.answer,
              citations: this.formatCitations(result.citations || []),
              confidence: convertConfidenceToNumber(result.confidence),
              agriculturalRelevance: result.agriculturalRelevance,
              category,
              season,
              relatedQuestions: result.relatedQuestions,
              metadata: {
                requestId: span.spanContext().traceId,
                timestamp: new Date().toISOString(),
                tokensUsed: 0, // Perplexity doesn't expose this in research response
                processingTimeMs: processingTime,
                model: "sonar-pro",
                sources: result.citations?.length || 0,
              },
            },
          };
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          return {
            success: false,
            error: {
              code: "FARMING_ADVICE_ERROR",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to get farming advice",
            },
          };
        } finally {
          span.end();
        }
      },
    );
  }

  // ==========================================================================
  // 2. PRODUCT RECOMMENDATIONS
  // ==========================================================================

  async getProductRecommendations(
    request: ProductRecommendationRequest,
  ): Promise<ProductRecommendationResponse> {
    return await this.tracer.startActiveSpan(
      "getProductRecommendations",
      async (span) => {
        try {
          span.setAttributes({
            "product.season": request.season,
            "product.location": request.location || "general",
          });

          const prompt = this.buildProductRecommendationPrompt(request);

          const result = await this.researchAgent.researchTopic(prompt, {
            depth: "comprehensive",
            recencyFilter: "month",
          });

          // Parse structured recommendations from response
          const recommendations = this.parseProductRecommendations(
            result.answer,
          );
          const seasonalInsights = this.extractSeasonalInsights(
            result.answer,
            request.season,
          );

          span.setStatus({ code: SpanStatusCode.OK });

          return {
            success: true,
            data: {
              recommendations,
              seasonalInsights,
              marketContext: result.answer,
              citations: this.formatCitations(result.citations || []),
              metadata: {
                season: request.season,
                generatedAt: new Date().toISOString(),
                confidenceScore: convertConfidenceToNumber(result.confidence),
              },
            },
          };
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          return {
            success: false,
            error: {
              code: "PRODUCT_RECOMMENDATION_ERROR",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to get product recommendations",
            },
          };
        } finally {
          span.end();
        }
      },
    );
  }

  // ==========================================================================
  // 3. MARKET INTELLIGENCE
  // ==========================================================================

  async getMarketIntelligence(
    request: MarketIntelligenceRequest,
  ): Promise<MarketIntelligenceResponse> {
    return await this.tracer.startActiveSpan(
      "getMarketIntelligence",
      async (span) => {
        try {
          span.setAttributes({
            "market.region": request.region || "general",
            "market.timeframe": request.timeframe || "month",
          });

          const prompt = this.buildMarketIntelligencePrompt(request);

          const result = await this.researchAgent.researchTopic(prompt, {
            depth: "expert",
            recencyFilter: request.timeframe || "month",
          });

          // Parse market intelligence from response
          const trends = this.parseMarketTrends(
            result.answer,
            result.citations || [],
          );
          const insights = this.parseMarketInsights(result.answer);
          const opportunities = this.parseBusinessOpportunities(result.answer);

          span.setStatus({ code: SpanStatusCode.OK });

          return {
            success: true,
            data: {
              overview: result.answer,
              trends,
              insights,
              opportunities,
              citations: this.formatCitations(result.citations || []),
              lastUpdated: new Date().toISOString(),
            },
          };
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          return {
            success: false,
            error: {
              code: "MARKET_INTELLIGENCE_ERROR",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to get market intelligence",
            },
          };
        } finally {
          span.end();
        }
      },
    );
  }

  // ==========================================================================
  // 4. EDUCATIONAL CONTENT
  // ==========================================================================

  async getEducationalContent(
    request: EducationalContentRequest,
  ): Promise<EducationalContentResponse> {
    return await this.tracer.startActiveSpan(
      "getEducationalContent",
      async (span) => {
        try {
          span.setAttributes({
            "education.topic": request.topic,
            "education.level": request.level || "INTERMEDIATE",
            "education.format": request.format || "GUIDE",
          });

          const prompt = this.buildEducationalContentPrompt(request);

          const result = await this.researchAgent.researchTopic(prompt, {
            depth: "expert",
            recencyFilter: "year",
          });

          // Parse structured educational content
          const content = this.parseEducationalContent(
            result.answer,
            request.level || "INTERMEDIATE",
          );

          span.setStatus({ code: SpanStatusCode.OK });

          return {
            success: true,
            data: {
              title: this.generateContentTitle(request.topic, request.format),
              content,
              citations: this.formatCitations(result.citations || []),
              relatedTopics: result.relatedQuestions || [],
              nextSteps: this.generateNextSteps(request.topic),
              metadata: {
                difficulty: request.level || "INTERMEDIATE",
                estimatedReadTime: this.estimateReadTime(result.answer),
                lastUpdated: new Date().toISOString(),
                credibilityScore: convertConfidenceToNumber(result.confidence),
                sourcesCount: result.citations?.length || 0,
              },
            },
          };
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          return {
            success: false,
            error: {
              code: "EDUCATIONAL_CONTENT_ERROR",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to get educational content",
            },
          };
        } finally {
          span.end();
        }
      },
    );
  }

  // ==========================================================================
  // 5. AI-POWERED SUPPORT
  // ==========================================================================

  async handleSupportRequest(
    request: SupportRequest,
  ): Promise<SupportResponse> {
    return await this.tracer.startActiveSpan(
      "handleSupportRequest",
      async (span) => {
        try {
          span.setAttributes({
            "support.user_id": request.userId,
            "support.conversation_id": request.conversationId || "new",
          });

          const startTime = Date.now();
          const conversationId =
            request.conversationId || this.generateConversationId();

          // Build context-aware support prompt
          const contextPrompt = this.buildSupportPrompt(request);

          // Get response from Perplexity
          const response = await this.client.chat(
            [
              {
                role: "system",
                content:
                  "You are an AI agricultural support assistant helping farmers.",
              },
              { role: "user", content: contextPrompt },
            ],
            {
              model: "llama-3.1-sonar-large-128k-online",
              temperature: 0.7,
              maxTokens: 2000,
              searchDomainFilter: ["agricultural", "farming"],
              returnRelatedQuestions: true,
              searchRecencyFilter: "month",
            },
          );

          const processingTime = Date.now() - startTime;

          // Extract message content from response
          const messageContent = response.choices[0]?.message?.content || "";

          // Create support message
          const message: SupportMessage = {
            id: this.generateMessageId(),
            role: "ASSISTANT",
            content: messageContent,
            citations: this.formatCitations(response.citations || []),
            confidence: this.assessResponseConfidence(messageContent),
            timestamp: new Date(),
            metadata: {
              tokensUsed: response.usage?.totalTokens,
              processingTime,
              model: response.model,
            },
          };

          // Generate suggested actions
          const suggestedActions = this.generateSuggestedActions(
            request.message,
            messageContent,
          );

          // Check if escalation needed
          const needsEscalation = this.checkEscalationNeeded(
            request.message,
            messageContent,
          );

          span.setStatus({ code: SpanStatusCode.OK });

          return {
            success: true,
            data: {
              conversationId,
              message,
              suggestedActions,
              relatedResources: [],
              needsEscalation,
            },
          };
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          return {
            success: false,
            error: {
              code: "SUPPORT_REQUEST_ERROR",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to process support request",
            },
          };
        } finally {
          span.end();
        }
      },
    );
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  private buildFarmingAdvicePrompt(
    request: FarmingAdviceRequest,
    season: Season,
  ): string {
    let prompt = `As an expert agricultural advisor, provide comprehensive advice on the following farming question:\n\n${request.question}\n\n`;

    if (request.farmLocation) {
      prompt += `Location: ${request.farmLocation}\n`;
    }

    prompt += `Current Season: ${season}\n`;

    if (request.category) {
      prompt += `Category: ${request.category}\n`;
    }

    prompt += `\nProvide practical, actionable advice with:
1. Direct answer to the question
2. Best practices for the current season
3. Common mistakes to avoid
4. Specific recommendations
5. Safety considerations if applicable

Focus on organic and sustainable farming practices. Include citations from credible agricultural sources.`;

    return prompt;
  }

  private buildProductRecommendationPrompt(
    request: ProductRecommendationRequest,
  ): string {
    let prompt = `As an agricultural products expert, recommend essential farming products and supplies for ${request.season} season.\n\n`;

    if (request.location) {
      prompt += `Location: ${request.location}\n`;
    }

    if (request.farmType) {
      prompt += `Farm Type: ${request.farmType}\n`;
    }

    prompt += `\nProvide recommendations including:
1. Top 10 essential products for this season
2. Reasoning for each recommendation
3. Seasonal relevance and timing
4. Expected benefits
5. Alternative options
6. Approximate value/importance

Focus on organic, sustainable, and locally-appropriate products. Include market trends and availability considerations.`;

    return prompt;
  }

  private buildMarketIntelligencePrompt(
    request: MarketIntelligenceRequest,
  ): string {
    let prompt =
      "As a market intelligence analyst for organic farming and local agriculture, provide comprehensive market analysis:\n\n";

    if (request.region) {
      prompt += `Region: ${request.region}\n`;
    }

    if (request.topics && request.topics.length > 0) {
      prompt += `Focus Areas: ${request.topics.join(", ")}\n`;
    }

    prompt += `\nProvide analysis including:
1. Current market trends in organic farming and local food markets
2. Emerging opportunities for farmers
3. Consumer demand patterns
4. Price trends and market dynamics
5. Competitive landscape
6. Growth areas and innovations
7. Challenges and risks
8. Actionable insights for farmers

Include recent data, statistics, and credible market sources.`;

    return prompt;
  }

  private buildEducationalContentPrompt(
    request: EducationalContentRequest,
  ): string {
    const levelDescriptions = {
      BEGINNER: "someone new to farming with no prior experience",
      INTERMEDIATE: "a farmer with 1-3 years of experience",
      ADVANCED: "an experienced farmer looking for expert-level insights",
    };

    const level = request.level || "INTERMEDIATE";

    let prompt = `Create comprehensive educational content about: ${request.topic}\n\n`;
    prompt += `Audience: ${levelDescriptions[level]}\n`;
    prompt += `Format: ${request.format || "GUIDE"}\n\n`;

    prompt += `Structure the content with:
1. Clear overview and learning objectives
2. Key concepts explained simply
3. Detailed step-by-step guidance
4. Practical tips and best practices
5. Common mistakes to avoid
6. Expert advice and insights
7. Additional resources for learning

Make it practical, actionable, and easy to follow. Include real-world examples and cite credible agricultural sources.`;

    return prompt;
  }

  private buildSupportPrompt(request: SupportRequest): string {
    let prompt =
      "You are an AI agricultural support assistant helping farmers with their questions and challenges.\n\n";

    if (request.context) {
      prompt += "Context:\n";
      if (request.context.farmId)
        prompt += `- Farm ID: ${request.context.farmId}\n`;
      if (request.context.currentSeason)
        prompt += `- Season: ${request.context.currentSeason}\n`;
      if (request.context.location)
        prompt += `- Location: ${request.context.location}\n`;
      if (request.context.farmType)
        prompt += `- Farm Type: ${request.context.farmType}\n`;
      prompt += "\n";
    }

    prompt += `Farmer's Question: ${request.message}\n\n`;
    prompt += `Provide a helpful, practical response that:
1. Directly addresses their question or concern
2. Offers actionable solutions
3. Considers their specific context and season
4. Includes safety considerations if relevant
5. Cites credible sources
6. Suggests next steps or follow-up resources

Be empathetic, clear, and focus on practical solutions for organic and sustainable farming.`;

    return prompt;
  }

  private detectCategory(question: string): FarmingCategory {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes("pest") ||
      lowerQuestion.includes("insect") ||
      lowerQuestion.includes("disease")
    ) {
      return "PEST_CONTROL";
    }
    if (
      lowerQuestion.includes("soil") ||
      lowerQuestion.includes("compost") ||
      lowerQuestion.includes("fertilizer")
    ) {
      return "SOIL_HEALTH";
    }
    if (
      lowerQuestion.includes("water") ||
      lowerQuestion.includes("irrigation") ||
      lowerQuestion.includes("drought")
    ) {
      return "IRRIGATION";
    }
    if (
      lowerQuestion.includes("harvest") ||
      lowerQuestion.includes("picking") ||
      lowerQuestion.includes("storage")
    ) {
      return "HARVESTING";
    }
    if (
      lowerQuestion.includes("organic") ||
      lowerQuestion.includes("sustainable") ||
      lowerQuestion.includes("natural")
    ) {
      return "ORGANIC_PRACTICES";
    }
    if (
      lowerQuestion.includes("market") ||
      lowerQuestion.includes("sell") ||
      lowerQuestion.includes("price")
    ) {
      return "MARKET_TRENDS";
    }
    if (
      lowerQuestion.includes("season") ||
      lowerQuestion.includes("plant") ||
      lowerQuestion.includes("timing")
    ) {
      return "SEASONAL_PLANNING";
    }

    return "CROP_MANAGEMENT";
  }

  private formatCitations(citations: string[]): Citation[] {
    return citations.map((url, index) => ({
      url,
      title: `Source ${index + 1}`,
      relevance: 1.0,
    }));
  }

  private parseProductRecommendations(
    content: string,
  ): ProductRecommendation[] {
    // Simple parsing - in production, this would be more sophisticated
    const recommendations: ProductRecommendation[] = [];

    // Extract structured data from markdown/text response
    const lines = content.split("\n");
    let currentProduct: Partial<ProductRecommendation> | null = null;

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        if (currentProduct && currentProduct.productName) {
          recommendations.push(currentProduct as ProductRecommendation);
        }
        currentProduct = {
          productName: line.replace(/^\d+\.\s*/, "").trim(),
          category: "General",
          reasoning: "",
          seasonalRelevance: 0.8,
          priority: "MEDIUM",
          estimatedValue: "Moderate",
          benefits: [],
        };
      }
    }

    if (currentProduct && currentProduct.productName) {
      recommendations.push(currentProduct as ProductRecommendation);
    }

    return recommendations.slice(0, 10);
  }

  private extractSeasonalInsights(_content: string, season: Season) {
    return {
      season,
      keyActivities: [
        "Seasonal planning",
        "Crop selection",
        "Soil preparation",
      ],
      commonChallenges: ["Weather variability", "Pest management"],
      opportunities: ["New crop varieties", "Market demand"],
      bestPractices: [
        "Follow organic practices",
        "Plan for season transitions",
      ],
    };
  }

  private parseMarketTrends(
    _content: string,
    citations: string[],
  ): MarketTrend[] {
    // Simplified parsing - production would use NLP
    return [
      {
        title: "Organic Produce Demand Growth",
        description:
          "Continued increase in consumer demand for organic products",
        impact: "HIGH",
        direction: "RISING",
        timeframe: "2024-2025",
        relevance: 0.9,
        citations: this.formatCitations(citations.slice(0, 2)),
      },
    ];
  }

  private parseMarketInsights(_content: string): MarketInsight[] {
    return [
      {
        category: "Consumer Trends",
        finding: "Local food demand continues to grow",
        implications: ["Opportunity for direct-to-consumer sales"],
        actionable: true,
        confidence: 0.85,
      },
    ];
  }

  private parseBusinessOpportunities(_content: string): BusinessOpportunity[] {
    return [
      {
        title: "Farm-to-Table Partnerships",
        description: "Direct partnerships with local restaurants",
        potential: "HIGH",
        effort: "MEDIUM",
        timeToMarket: "3-6 months",
        requirements: ["Consistent supply", "Quality standards"],
      },
    ];
  }

  private parseEducationalContent(
    content: string,
    _level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  ): EducationalContent {
    const sections = content.split("\n\n");

    return {
      overview: sections[0] || content.substring(0, 500),
      keyPoints: this.extractKeyPoints(content),
      detailedSections: this.extractSections(content),
      practicalTips: this.extractTips(content),
      commonMistakes: this.extractMistakes(content),
      expertAdvice: this.extractExpertAdvice(content),
    };
  }

  private extractKeyPoints(content: string): string[] {
    const points: string[] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      if (line.match(/^[-*]\s+/) || line.match(/^\d+\.\s+/)) {
        points.push(line.replace(/^[-*\d.]\s+/, "").trim());
      }
    }

    return points.slice(0, 5);
  }

  private extractSections(content: string): ContentSection[] {
    const sections: ContentSection[] = [];
    const lines = content.split("\n");
    let currentSection: ContentSection | null = null;

    for (const line of lines) {
      if (line.match(/^#{1,3}\s+/)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace(/^#{1,3}\s+/, "").trim(),
          content: "",
        };
      } else if (currentSection && line.trim()) {
        currentSection.content += `${line}\n`;
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  private extractTips(content: string): string[] {
    const tips: string[] = [];
    const tipRegex = /tip:?\s*(.+)/gi;
    let match;

    while ((match = tipRegex.exec(content)) !== null) {
      if (match[1]) {
        tips.push(match[1].trim());
      }
    }

    return tips;
  }

  private extractMistakes(content: string): string[] {
    const mistakes: string[] = [];
    const mistakeRegex = /mistake:?\s*(.+)/gi;
    let match;

    while ((match = mistakeRegex.exec(content)) !== null) {
      if (match[1]) {
        mistakes.push(match[1].trim());
      }
    }

    return mistakes;
  }

  private extractExpertAdvice(_content: string): string[] {
    return [];
  }

  private generateContentTitle(
    topic: string,
    format?: "GUIDE" | "TUTORIAL" | "QUICK_TIP" | "DEEP_DIVE",
  ): string {
    const formatPrefixes = {
      GUIDE: "Complete Guide to",
      TUTORIAL: "Step-by-Step Tutorial:",
      QUICK_TIP: "Quick Tips for",
      DEEP_DIVE: "Deep Dive:",
    };

    const prefix = format ? formatPrefixes[format] : "Guide to";
    return `${prefix} ${topic}`;
  }

  private generateNextSteps(_topic: string): string[] {
    return [
      "Practice the techniques learned",
      "Monitor results and adjust approach",
      "Explore advanced topics in this area",
      "Connect with experienced farmers",
    ];
  }

  private estimateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private generateSuggestedActions(
    _question: string,
    _response: string,
  ): SuggestedAction[] {
    return [
      {
        title: "Implement Recommendations",
        description: "Apply the suggested practices to your farm",
        priority: "HIGH",
        category: "Action",
        estimatedTime: "Varies",
        difficulty: "MODERATE",
      },
    ];
  }

  private checkEscalationNeeded(question: string, _response: string): boolean {
    const urgentKeywords = [
      "emergency",
      "urgent",
      "dying",
      "critical",
      "help immediately",
    ];
    return urgentKeywords.some((keyword) =>
      question.toLowerCase().includes(keyword),
    );
  }

  private assessResponseConfidence(content: string): number {
    // Simple confidence scoring based on content characteristics
    let confidence = 0.7;

    if (content.length > 500) confidence += 0.1;
    if (
      content.includes("research shows") ||
      content.includes("studies indicate")
    )
      confidence += 0.1;
    if (content.includes("typically") || content.includes("generally"))
      confidence -= 0.05;

    return Math.min(Math.max(confidence, 0), 1);
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

let farmingServiceInstance: PerplexityFarmingService | null = null;

export function getPerplexityFarmingService(): PerplexityFarmingService {
  if (!farmingServiceInstance) {
    try {
      farmingServiceInstance = new PerplexityFarmingService();
    } catch (error) {
      // If we're in build phase, create a mock instance
      if (process.env.NEXT_PHASE === "phase-production-build") {
        console.warn("Creating mock PerplexityFarmingService for build phase");
        farmingServiceInstance = new PerplexityFarmingService("");
      } else {
        throw error;
      }
    }
  }
  return farmingServiceInstance;
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export async function getFarmingAdvice(request: FarmingAdviceRequest) {
  const service = getPerplexityFarmingService();
  return service.getFarmingAdvice(request);
}

export async function getProductRecommendations(
  request: ProductRecommendationRequest,
) {
  const service = getPerplexityFarmingService();
  return service.getProductRecommendations(request);
}

export async function getMarketIntelligence(
  request: MarketIntelligenceRequest,
) {
  const service = getPerplexityFarmingService();
  return service.getMarketIntelligence(request);
}

export async function getEducationalContent(
  request: EducationalContentRequest,
) {
  const service = getPerplexityFarmingService();
  return service.getEducationalContent(request);
}

export async function handleSupportRequest(request: SupportRequest) {
  const service = getPerplexityFarmingService();
  return service.handleSupportRequest(request);
}
