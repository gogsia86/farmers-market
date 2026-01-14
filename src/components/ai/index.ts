/**
 * 🤖 AI COMPONENTS INDEX
 * Export all AI-powered components for easy importing
 *
 * Usage:
 * import { ProductDescriptionGenerator, AIAdvisorChat, HarvestTrackingDashboard } from "@/components/ai"
 *
 * @module components/ai
 */

export { AIAdvisorChat } from "./AIAdvisorChat";
export { HarvestTrackingDashboard } from "./HarvestTrackingDashboard";
export { ProductDescriptionGenerator } from "./ProductDescriptionGenerator";

// Re-export types for convenience
export type {
    ProductDescription, ProductDescriptionGeneratorProps
} from "./ProductDescriptionGenerator";

export type {
    AIAdvisorChatProps,
    ChatMessage,
    ChatThread
} from "./AIAdvisorChat";

export type {
    CropPerformance, HarvestMetrics, HarvestTrackingDashboardProps, SeasonalInsight
} from "./HarvestTrackingDashboard";

