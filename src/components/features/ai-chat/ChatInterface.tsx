"use client";

/**
 * 🤖 AI Chat Interface Component
 *
 * Interactive chat interface for conversing with AI agents.
 * Supports multiple agent types, context-aware responses, and real-time streaming.
 *
 * @component ChatInterface
 */

import { AlertCircle, Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentName?: string;
  confidence?: number;
}

interface ChatInterfaceProps {
  agentName?:
    | "farmAnalyst"
    | "productCatalog"
    | "orderProcessor"
    | "customerSupport";
  context?: {
    farmId?: string;
    orderId?: string;
    productId?: string;
    metadata?: Record<string, any>;
  };
  placeholder?: string;
  welcomeMessage?: string;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function ChatInterface({
  agentName = "customerSupport",
  context,
  placeholder = "Type your message...",
  welcomeMessage,
  className = "",
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    if (welcomeMessage && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
          agentName,
        },
      ]);
    }
  }, [welcomeMessage, agentName, messages.length]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setError(null);
    setIsLoading(true);

    try {
      // Call AI chat API
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          agentName,
          context: {
            ...context,
            conversationId: conversationId || undefined,
          },
        }),
      });

      // Handle non-OK HTTP responses
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to use the AI advisor");
        } else if (response.status === 503) {
          throw new Error(
            "AI service is temporarily unavailable. Please try again in a moment.",
          );
        } else if (response.status >= 500) {
          throw new Error(
            "Server error. Our team has been notified. Please try again later.",
          );
        }
      }

      // Parse response JSON with error handling
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        throw new Error(
          "Received an invalid response from the server. Please try again.",
        );
      }

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format from server");
      }

      if (!data.success) {
        throw new Error(
          data.error?.message || "Failed to get response from AI advisor",
        );
      }

      // Validate required fields in successful response
      if (!data.data || !data.data.message) {
        throw new Error("Incomplete response from AI advisor");
      }

      // Store conversation ID for context continuity
      if (data.data.metadata?.conversationId) {
        setConversationId(data.data.metadata.conversationId);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.data.message,
        timestamp: data.data.metadata?.timestamp
          ? new Date(data.data.metadata.timestamp)
          : new Date(),
        agentName: data.data.agent,
        confidence: data.data.confidence,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setError(null); // Clear any previous errors on success
    } catch (err) {
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      console.error("Chat error:", err);

      // Optionally add a system message to chat for better UX
      const errorSystemMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date(),
        agentName,
        confidence: 0,
      };

      setMessages((prev) => [...prev, errorSystemMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get agent display info
  const agentInfo = getAgentInfo(agentName);

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {agentInfo.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {agentInfo.description}
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: "44px", maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "44px";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Message Bubble Component
// ============================================================================

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex gap-3 max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Message content */}
        <div
          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          <div
            className={`px-4 py-2 rounded-2xl ${
              isUser
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-1 px-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {message.confidence !== undefined && (
              <span
                className={`text-xs ${
                  message.confidence >= 0.8
                    ? "text-green-600 dark:text-green-400"
                    : message.confidence >= 0.6
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              >
                {(message.confidence * 100).toFixed(0)}% confidence
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getAgentInfo(agentName: string): {
  name: string;
  description: string;
} {
  const agentInfoMap: Record<string, { name: string; description: string }> = {
    farmAnalyst: {
      name: "Farm Analyst",
      description:
        "Expert in farm operations, yield analysis, and crop planning",
    },
    productCatalog: {
      name: "Product Manager",
      description: "Specialist in product listings, pricing, and inventory",
    },
    orderProcessor: {
      name: "Order Assistant",
      description: "Helper for tracking orders and resolving delivery issues",
    },
    customerSupport: {
      name: "Customer Support",
      description:
        "General assistance with products, farms, and platform features",
    },
  };

  return (
    agentInfoMap[agentName] || {
      name: "AI Assistant",
      description: "Here to help with your questions",
    }
  );
}
