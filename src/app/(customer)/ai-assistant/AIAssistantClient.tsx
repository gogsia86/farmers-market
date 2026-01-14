"use client";

/**
 * 🤖 AI Assistant Client Component
 *
 * Client-side component for the AI chat interface with welcome messages
 * and context-aware assistance.
 */

import ChatInterface from "@/components/features/ai-chat/ChatInterface";

interface AIAssistantClientProps {
  userName: string;
  userEmail?: string;
}

export default function AIAssistantClient({
  userName,
  userEmail,
}: AIAssistantClientProps) {
  const welcomeMessage = `Hi ${userName}! 👋 I'm your AI assistant, here to help you with anything related to the Farmers Market platform.

I can help you with:
• Finding fresh products and farms in your area
• Tracking your orders and delivery status
• Learning about organic and sustainable farming
• Answering questions about payments and refunds
• Providing product recommendations
• Connecting you with local farmers

What would you like to know today?`;

  return (
    <div className="max-w-4xl mx-auto">
      <ChatInterface
        agentName="customerSupport"
        context={{
          metadata: {
            userEmail,
            source: "customer-portal",
          },
        }}
        placeholder="Ask me anything about products, orders, or farms..."
        welcomeMessage={welcomeMessage}
        className="h-[600px]"
      />
    </div>
  );
}
