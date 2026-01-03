/**
 * 🌟 OLLAMA CHAT BOT COMPONENT
 * Divine Agricultural AI Chat Interface
 * HP OMEN Optimized - DeepSeek-R1:7b Integration
 */

"use client";

import { createLogger } from "@/lib/utils/logger";
import { AlertCircle, Bot, Loader2, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const aiLogger = createLogger("OllamaChatBot");

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    tokensPerSecond?: string;
    duration?: number;
  };
}

export interface OllamaChatBotProps {
  className?: string;
  placeholder?: string;
  systemPrompt?: string;
  onResponse?: (response: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OllamaChatBot({
  className = "",
  placeholder = "Ask about farming, crops, or agricultural practices...",
  systemPrompt: _systemPrompt,
  onResponse,
}: OllamaChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOllamaAvailable, setIsOllamaAvailable] = useState<boolean | null>(
    null,
  );
  const [threadId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check Ollama availability on mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if Ollama is available
  const checkOllamaStatus = async () => {
    try {
      const response = await fetch("/api/ai/ollama", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setIsOllamaAvailable(data.data.healthy);
      } else {
        setIsOllamaAvailable(false);
      }
    } catch (error) {
      aiLogger.error(
        "Failed to check Ollama status",
        error instanceof Error ? error : new Error(String(error)),
      );
      setIsOllamaAvailable(false);
    }
  };

  // Send message to Ollama
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/ollama", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          threadId,
          model: "deepseek-r1:7b",
          options: {
            temperature: 0.7,
            num_predict: 2048,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.data.message,
          timestamp: new Date(),
          metadata: {
            tokensPerSecond: data.data.metadata?.tokens_per_second,
            duration: data.data.metadata?.total_duration_ms,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);
        onResponse?.(data.data.message);
      } else {
        // Error message
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${data.error.message}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      aiLogger.error(
        "Failed to send message to Ollama",
        error instanceof Error ? error : new Error(String(error)),
        {
          threadId,
        },
      );
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Failed to connect to AI service. Please ensure Ollama is running.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle textarea resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bot className="w-8 h-8 text-green-600 dark:text-green-400" />
            {isOllamaAvailable !== null && (
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                  isOllamaAvailable ? "bg-green-500" : "bg-red-500"
                }`}
              />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              🌾 Agricultural AI Assistant
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isOllamaAvailable === null
                ? "Checking status..."
                : isOllamaAvailable
                  ? "DeepSeek-R1:7b • Online"
                  : "Offline - Start Ollama"}
            </p>
          </div>
        </div>
        <button
          onClick={checkOllamaStatus}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Refresh status"
        >
          ↻
        </button>
      </div>

      {/* Status Banner */}
      {isOllamaAvailable === false && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Ollama is not running
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Start Ollama service:{" "}
                <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">
                  ollama serve
                </code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            <div>
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Welcome to Agricultural AI
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                Ask me anything about farming, crops, soil health, pest
                management, or agricultural practices. I'm here to help with
                biodynamic wisdom!
              </p>
            </div>
            <div className="flex flex-wrap gap-2 max-w-2xl justify-center">
              {[
                "What is crop rotation?",
                "How do I improve soil health?",
                "Best practices for organic farming",
                "Companion planting guide",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex space-x-3 max-w-3xl ${
                    message.role === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1">
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.metadata?.tokensPerSecond && (
                        <>
                          <span>•</span>
                          <span>{message.metadata.tokensPerSecond} tok/s</span>
                        </>
                      )}
                      {message.metadata?.duration && (
                        <>
                          <span>•</span>
                          <span>
                            {(message.metadata.duration / 1000).toFixed(2)}s
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-3xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Thinking with agricultural consciousness...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || isOllamaAvailable === false}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: "150px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isOllamaAvailable === false}
            className="flex-shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line • Powered by
          DeepSeek-R1:7b on your HP OMEN
        </p>
      </div>
    </div>
  );
}

export default OllamaChatBot;
