/**
 * PERPLEXITY PRO CONFIGURATION
 * Model selection and API configuration
 */

export type PerplexityProModel =
  | "llama-3.1-sonar-small-128k-online" // Fast, cost-effective for simple queries
  | "llama-3.1-sonar-large-128k-online" // Advanced reasoning and complex tasks
  | "llama-3.1-sonar-huge-128k-online"; // Maximum capability (if available)

export interface ModelCapabilities {
  contextWindow: number;
  bestFor: string[];
  costTier: "low" | "medium" | "high";
  reasoningCapability: "basic" | "advanced" | "expert";
}

export const PERPLEXITY_MODELS: Record<PerplexityProModel, ModelCapabilities> =
  {
    "llama-3.1-sonar-small-128k-online": {
      contextWindow: 128000,
      bestFor: [
        "Quick searches",
        "Simple queries",
        "Fact-finding",
        "Fast responses",
      ],
      costTier: "low",
      reasoningCapability: "basic",
    },
    "llama-3.1-sonar-large-128k-online": {
      contextWindow: 128000,
      bestFor: [
        "Code generation",
        "Deep analysis",
        "Complex reasoning",
        "Comprehensive research",
      ],
      costTier: "medium",
      reasoningCapability: "advanced",
    },
    "llama-3.1-sonar-huge-128k-online": {
      contextWindow: 128000,
      bestFor: [
        "Maximum reasoning",
        "Expert-level analysis",
        "Multi-step problems",
      ],
      costTier: "high",
      reasoningCapability: "expert",
    },
  };

export const PERPLEXITY_PRO_CONFIG = {
  // Default settings
  defaultSettings: {
    temperature: 0.2,
    maxTokens: 2048,
    topP: 0.9,
  },

  // Agricultural research settings
  agricultural: {
    searchDomains: ["*.edu", "*.gov", "*.org", "usda.gov", "extension.org"],
    recencyFilter: "month" as const,
    includeImages: true,
    relatedQuestions: true,
  },

  // Code generation settings
  codeGeneration: {
    temperature: 0.2,
    maxTokens: 4096,
    topP: 0.9,
  },

  // System prompts
  systemPrompts: {
    agricultural: `You are an expert agricultural advisor with deep knowledge of farming practices,
sustainable agriculture, crop management, and modern farming technologies. Provide evidence-based,
practical advice with citations from reputable agricultural sources.`,

    codeGeneration: `You are an expert software engineer specializing in TypeScript, Next.js, and
modern web development. Generate clean, type-safe, production-ready code following divine patterns
and agricultural consciousness principles. Include comprehensive error handling and testing.`,

    analysis: `You are an expert analyst providing deep, comprehensive analysis with evidence and
citations. Break down complex topics into clear, actionable insights with supporting data.`,
  },
} as const;
