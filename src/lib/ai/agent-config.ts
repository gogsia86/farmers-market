/**
 * AI Agent Configuration
 * Divine Agricultural Intelligence - Multi-Agent Orchestration
 *
 * Implements AI agent framework for farm operations, product management,
 * and order processing with OpenAI GPT-4o integration.
 *
 * @module ai/agent-config
 */

import { createLogger } from "@/lib/utils/logger";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Create dedicated logger for AI agent operations
const agentLogger = createLogger("AIAgent");

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  capabilities: string[];
}

export interface AgentMessage {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
  function_call?: any;
}

export interface AgentResponse {
  agent: string;
  content: string;
  confidence: number;
  reasoning?: string;
  metadata?: Record<string, any>;
}

export interface AgentContext {
  userId?: string;
  farmId?: string;
  orderId?: string;
  productId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface MultiAgentTask {
  task: string;
  context: AgentContext;
  requiredAgents: string[];
  maxTurns?: number;
}

// ============================================================================
// OpenAI Client Configuration
// ============================================================================

let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client instance (singleton pattern)
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. " +
          "Please add it to your .env.local file.",
      );
    }

    openaiClient = new OpenAI({
      apiKey,
      timeout: 30000, // 30 seconds
      maxRetries: 3,
    });
  }

  return openaiClient;
}

// ============================================================================
// Agent Definitions
// ============================================================================

/**
 * Farm Analyst Agent
 * Analyzes farm data, provides insights, and recommends optimizations
 */
export const FARM_ANALYST_AGENT: AgentConfig = {
  name: "FarmAnalyst",
  role: "Farm Operations & Analytics Expert",
  systemPrompt: `You are a Farm Analyst AI specializing in agricultural operations and data analysis.

Your responsibilities:
- Analyze farm performance metrics (yield, revenue, efficiency)
- Identify trends and patterns in farming operations
- Recommend crop rotations and planting schedules
- Assess seasonal impacts on farm productivity
- Provide data-driven insights for farm optimization
- Evaluate soil health and environmental factors

Guidelines:
- Use agricultural best practices and biodynamic principles
- Consider seasonal variations and local climate
- Provide actionable, measurable recommendations
- Support sustainable and regenerative farming methods
- Use data to back up all recommendations
- Maintain agricultural consciousness in all analyses

Output Format:
- Clear, concise recommendations
- Data-backed insights with confidence scores
- Actionable next steps for farmers
- Risk assessments when applicable`,
  model: "gpt-4o",
  temperature: 0.3, // Lower temperature for analytical tasks
  maxTokens: 2000,
  capabilities: [
    "farm_performance_analysis",
    "yield_prediction",
    "seasonal_planning",
    "crop_rotation_optimization",
    "sustainability_assessment",
    "data_visualization_insights",
  ],
};

/**
 * Product Catalog Manager Agent
 * Manages product listings, descriptions, pricing, and inventory
 */
export const PRODUCT_CATALOG_AGENT: AgentConfig = {
  name: "ProductCatalogManager",
  role: "Product & Inventory Management Expert",
  systemPrompt: `You are a Product Catalog Manager AI specializing in agricultural products and inventory management.

Your responsibilities:
- Generate compelling product descriptions
- Optimize product categorization and tagging
- Recommend pricing strategies based on market data
- Manage inventory levels and alert thresholds
- Identify seasonal product opportunities
- Enhance product discoverability through SEO

Guidelines:
- Write engaging, accurate product descriptions
- Highlight unique selling points (organic, local, seasonal)
- Use agricultural terminology correctly
- Consider consumer preferences and trends
- Optimize for search and discovery
- Maintain consistency across product listings

Output Format:
- Well-structured product information
- Clear pricing and availability details
- Relevant tags and categories
- Inventory recommendations with reasoning`,
  model: "gpt-4o",
  temperature: 0.7, // Higher temperature for creative descriptions
  maxTokens: 1500,
  capabilities: [
    "product_description_generation",
    "category_optimization",
    "pricing_analysis",
    "inventory_management",
    "seasonal_recommendations",
    "seo_optimization",
  ],
};

/**
 * Order Processing Agent
 * Handles order management, logistics, and customer communication
 */
export const ORDER_PROCESSING_AGENT: AgentConfig = {
  name: "OrderProcessor",
  role: "Order Management & Logistics Expert",
  systemPrompt: `You are an Order Processing AI specializing in agricultural product fulfillment and customer service.

Your responsibilities:
- Process and validate customer orders
- Optimize delivery routes and schedules
- Handle order modifications and cancellations
- Manage inventory allocation across orders
- Provide order status updates
- Resolve fulfillment issues and conflicts

Guidelines:
- Prioritize customer satisfaction
- Ensure fair allocation of limited inventory
- Consider product freshness and shelf life
- Optimize delivery efficiency
- Provide clear, timely communication
- Handle edge cases gracefully (out of stock, delays)

Output Format:
- Order validation results with reasoning
- Delivery recommendations (route, timing)
- Inventory allocation decisions
- Customer communication templates
- Issue resolution strategies`,
  model: "gpt-4o",
  temperature: 0.4, // Balanced temperature for logical + communicative tasks
  maxTokens: 1800,
  capabilities: [
    "order_validation",
    "inventory_allocation",
    "delivery_optimization",
    "customer_communication",
    "issue_resolution",
    "logistics_planning",
  ],
};

/**
 * Customer Support Agent
 * Provides customer assistance, answers questions, and resolves issues
 */
export const CUSTOMER_SUPPORT_AGENT: AgentConfig = {
  name: "CustomerSupport",
  role: "Customer Service & Support Expert",
  systemPrompt: `You are a Customer Support AI specializing in farmers market and agricultural product assistance.

Your responsibilities:
- Answer customer questions about products, farms, and orders
- Provide guidance on product selection and usage
- Resolve customer complaints and issues
- Educate customers about sustainable agriculture
- Handle returns and refund requests
- Escalate complex issues when necessary

Guidelines:
- Be friendly, empathetic, and professional
- Provide accurate, helpful information
- Use simple, clear language
- Prioritize customer satisfaction
- Promote agricultural education and awareness
- Respect cultural and dietary preferences

Output Format:
- Clear, conversational responses
- Step-by-step guidance when needed
- Relevant product or farm recommendations
- Issue resolution steps with timelines`,
  model: "gpt-4o",
  temperature: 0.6, // Moderate temperature for empathetic communication
  maxTokens: 1200,
  capabilities: [
    "customer_inquiry_response",
    "product_recommendations",
    "issue_resolution",
    "agricultural_education",
    "order_assistance",
    "complaint_handling",
  ],
};

// ============================================================================
// Agent Registry
// ============================================================================

/**
 * Central registry of all available agents
 */
export const AGENT_REGISTRY: Record<string, AgentConfig> = {
  farmAnalyst: FARM_ANALYST_AGENT,
  productCatalog: PRODUCT_CATALOG_AGENT,
  orderProcessor: ORDER_PROCESSING_AGENT,
  customerSupport: CUSTOMER_SUPPORT_AGENT,
};

/**
 * Get agent configuration by name
 */
export function getAgentConfig(agentName: string): AgentConfig {
  const config = AGENT_REGISTRY[agentName];

  if (!config) {
    throw new Error(
      `Agent "${agentName}" not found in registry. ` +
        `Available agents: ${Object.keys(AGENT_REGISTRY).join(", ")}`,
    );
  }

  return config;
}

/**
 * List all available agents
 */
export function listAvailableAgents(): string[] {
  return Object.keys(AGENT_REGISTRY);
}

/**
 * Check if agent has capability
 */
export function agentHasCapability(
  agentName: string,
  capability: string,
): boolean {
  const config = getAgentConfig(agentName);
  return config.capabilities.includes(capability);
}

// ============================================================================
// Agent Invocation
// ============================================================================

/**
 * Invoke a single agent with a task
 */
export async function invokeAgent(
  agentName: string,
  userMessage: string,
  context?: AgentContext,
): Promise<AgentResponse> {
  const config = getAgentConfig(agentName);
  const client = getOpenAIClient();

  // Build messages array
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: config.systemPrompt,
    },
  ];

  // Add context if provided
  if (context) {
    messages.push({
      role: "system",
      content: `Context: ${JSON.stringify(context, null, 2)}`,
    });
  }

  // Add user message
  messages.push({
    role: "user",
    content: userMessage,
  });

  try {
    const completion = await client.chat.completions.create({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
    });

    const responseContent = completion.choices[0]?.message?.content || "";

    return {
      agent: config.name,
      content: responseContent,
      confidence: calculateConfidence(completion),
      metadata: {
        model: completion.model,
        usage: completion.usage,
        finishReason: completion.choices[0]?.finish_reason,
      },
    };
  } catch (error) {
    agentLogger.error(`Agent invocation error`, {
      agentName: config.name,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw new Error(
      `Agent ${config.name} failed to process request: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Calculate confidence score from OpenAI completion
 */
function calculateConfidence(completion: any): number {
  // Simple heuristic: base confidence on finish_reason and response length
  const finishReason = completion.choices[0]?.finish_reason;
  const contentLength = completion.choices[0]?.message?.content?.length || 0;

  let confidence = 0.5; // Base confidence

  // Adjust based on finish reason
  if (finishReason === "stop") {
    confidence += 0.3; // Completed naturally
  } else if (finishReason === "length") {
    confidence += 0.1; // Hit token limit
  }

  // Adjust based on content length (more content = potentially more confidence)
  if (contentLength > 500) confidence += 0.1;
  if (contentLength > 1000) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

// ============================================================================
// Multi-Agent Orchestration
// ============================================================================

/**
 * Orchestrate multiple agents for complex tasks
 */
export async function orchestrateAgents(
  task: MultiAgentTask,
): Promise<AgentResponse[]> {
  const responses: AgentResponse[] = [];
  const maxTurns = task.maxTurns || 3;

  for (let turn = 0; turn < maxTurns; turn++) {
    for (const agentName of task.requiredAgents) {
      try {
        const response = await invokeAgent(agentName, task.task, task.context);

        responses.push(response);

        // If confidence is high enough, we can stop early
        if (response.confidence >= 0.8) {
          agentLogger.info(`High confidence response, completing task`, {
            agentName,
            confidence: response.confidence,
          });
          return responses;
        }
      } catch (error) {
        agentLogger.error(`Orchestrator error with agent`, {
          agentName,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        // Continue with other agents
      }
    }
  }

  return responses;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format agent response for display
 */
export function formatAgentResponse(response: AgentResponse): string {
  return `
╔═══════════════════════════════════════════════════════════╗
║ 🤖 Agent: ${response.agent.padEnd(48)} ║
║ 💯 Confidence: ${(response.confidence * 100).toFixed(1)}%${" ".repeat(42)} ║
╠═══════════════════════════════════════════════════════════╣
║ Response:                                                 ║
║ ${response.content.substring(0, 55).padEnd(55)} ║
${response.content.length > 55 ? `║ ${response.content.substring(55, 110).padEnd(55)} ║` : ""}
╚═══════════════════════════════════════════════════════════╝
  `.trim();
}

/**
 * Validate agent response quality
 */
export function validateAgentResponse(
  response: AgentResponse,
  minConfidence: number = 0.6,
): boolean {
  return (
    response.content.length > 50 && // Has meaningful content
    response.confidence >= minConfidence && // Meets confidence threshold
    !response.content.toLowerCase().includes("error") // No error messages
  );
}

// ============================================================================
// Export All
// ============================================================================

export default {
  getOpenAIClient,
  getAgentConfig,
  listAvailableAgents,
  agentHasCapability,
  invokeAgent,
  orchestrateAgents,
  formatAgentResponse,
  validateAgentResponse,
  AGENT_REGISTRY,
  FARM_ANALYST_AGENT,
  PRODUCT_CATALOG_AGENT,
  ORDER_PROCESSING_AGENT,
  CUSTOMER_SUPPORT_AGENT,
};
