"use client";

/**
 * 🤖 AI AGRICULTURAL ADVISOR CHAT
 * Interactive chat interface for AI-powered farming advice
 *
 * Features:
 * - Real-time conversation with AI advisor
 * - Conversation threading and history
 * - Quick suggestion buttons
 * - Code/text formatting support
 * - Export conversation
 * - Persistent chat threads
 *
 * @module components/ai/AIAdvisorChat
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

export interface AIAdvisorChatProps {
  farmId?: string;
  initialThreadId?: string;
  className?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    sources?: string[];
    tokensUsed?: number;
  };
}

export interface ChatThread {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

interface QuickSuggestion {
  icon: string;
  label: string;
  prompt: string;
}

// ============================================================================
// Quick Suggestions
// ============================================================================

const QUICK_SUGGESTIONS: QuickSuggestion[] = [
  {
    icon: "🌱",
    label: "Crop Planning",
    prompt:
      "What crops should I plant this season based on my climate and soil?",
  },
  {
    icon: "🐛",
    label: "Pest Control",
    prompt:
      "I'm seeing pests on my tomato plants. What organic solutions do you recommend?",
  },
  {
    icon: "💧",
    label: "Irrigation",
    prompt: "How can I optimize my irrigation system for water efficiency?",
  },
  {
    icon: "🌾",
    label: "Soil Health",
    prompt: "How can I improve my soil health and fertility naturally?",
  },
  {
    icon: "📊",
    label: "Market Pricing",
    prompt: "What are the current market trends for organic vegetables?",
  },
  {
    icon: "🌦️",
    label: "Weather Impact",
    prompt: "How should I prepare my crops for the upcoming weather changes?",
  },
];

// ============================================================================
// Component
// ============================================================================

export function AIAdvisorChat({
  farmId,
  initialThreadId,
  className = "",
}: AIAdvisorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(
    initialThreadId || null,
  );
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    loadThreads();
    if (threadId) {
      loadThread(threadId);
    }
  }, [threadId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  // ============================================================================
  // Data Loading
  // ============================================================================

  const loadThreads = async () => {
    try {
      const response = await fetch("/api/ai/advisor/threads");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setThreads(data.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to load threads:", error);
    }
  };

  const loadThread = async (id: string) => {
    try {
      const response = await fetch(`/api/ai/advisor/threads/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.messages) {
          setMessages(data.data.messages);
          setShowSuggestions(false);
        }
      }
    } catch (error) {
      console.error("Failed to load thread:", error);
      toast.error("Failed to load conversation");
    }
  };

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();

    if (!text) {
      return;
    }

    // Clear input immediately
    setInputValue("");
    setShowSuggestions(false);

    // Add user message to UI
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          threadId: threadId || undefined,
          farmId: farmId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to get response");
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: data.data.messageId,
        role: "assistant",
        content: data.data.response,
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: data.data.confidence,
          tokensUsed: data.metadata?.tokensUsed,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update thread ID if this is a new conversation
      if (!threadId && data.data.threadId) {
        setThreadId(data.data.threadId);
        loadThreads(); // Reload threads list
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to get response", {
        description: error.message || "Please try again",
      });

      // Remove the temporary user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: QuickSuggestion) => {
    handleSendMessage(suggestion.prompt);
  };

  const handleNewChat = () => {
    setThreadId(null);
    setMessages([]);
    setShowSuggestions(true);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleExportChat = () => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }

    const exportData = {
      threadId,
      exportedAt: new Date().toISOString(),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-advisor-chat-${threadId || Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Chat exported successfully");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <Card className="flex flex-col h-full">
        {/* Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                AI Agricultural Advisor
              </CardTitle>
              <CardDescription>
                {threadId
                  ? `Conversation ${messages.length} messages`
                  : "Start a new conversation"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExportChat}>
                  📥 Export
                </Button>
              )}
              {threadId && (
                <Button variant="outline" size="sm" onClick={handleNewChat}>
                  ➕ New Chat
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea ref={scrollAreaRef} className="h-full p-6">
            {showSuggestions && messages.length === 0 && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Welcome to your AI Farming Advisor
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Get expert agricultural advice powered by AI. Ask anything
                    about farming, crops, pests, soil health, and more.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                    Quick Suggestions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-start gap-3 p-4 text-left rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                      >
                        <span className="text-2xl">{suggestion.icon}</span>
                        <div>
                          <p className="font-medium mb-1">{suggestion.label}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {suggestion.prompt}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg">🤖</span>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {message.metadata?.confidence && (
                          <>
                            <span>•</span>
                            <span>
                              {(message.metadata.confidence * 100).toFixed(0)}%
                              confident
                            </span>
                          </>
                        )}
                        {message.metadata?.tokensUsed && (
                          <>
                            <span>•</span>
                            <span>{message.metadata.tokensUsed} tokens</span>
                          </>
                        )}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                        <div
                          className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <CardFooter className="border-t p-4">
          <div className="flex items-center gap-2 w-full">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about farming..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              size="lg"
            >
              {isLoading ? "⏳" : "📤"} Send
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            Press Enter to send • Shift+Enter for new line
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
