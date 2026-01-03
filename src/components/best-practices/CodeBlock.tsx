"use client";

import { createLogger } from "@/lib/utils/logger";
import { useState } from "react";

const uiLogger = createLogger("CodeBlock");

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "typescript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      uiLogger.error(
        "Failed to copy to clipboard",
        err instanceof Error ? err : new Error(String(err)),
      );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => copyToClipboard(code)}
        className="absolute top-2 right-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        aria-label="Copy code"
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
