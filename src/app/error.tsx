"use client";

/**
 * 🚨 ROOT ERROR BOUNDARY
 *
 * Catches errors at the root app level
 * Provides user-friendly error UI with recovery options
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/monitoring/logger";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    logger.error("Root application error", {
      error: error.message,
      digest: error.digest,
      stack: error.stack,
      name: error.name,
    });
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl w-full bg-card border border-border rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full animate-pulse" />
            <div className="relative bg-destructive/10 p-4 rounded-full">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🌾 Oops! Something Went Wrong
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            We encountered an unexpected error. Don't worry, our team has been
            notified and is looking into it.
          </p>

          {isDevelopment && (
            <div className="mt-6 text-left">
              <details className="bg-muted p-4 rounded-lg border border-border">
                <summary className="cursor-pointer font-semibold text-foreground hover:text-primary transition-colors">
                  🔍 Developer Details
                </summary>
                <div className="mt-4 space-y-2">
                  <div>
                    <span className="font-semibold text-foreground">
                      Error:
                    </span>
                    <pre className="mt-2 bg-background p-3 rounded border border-border overflow-x-auto text-sm text-foreground">
                      {error.message}
                    </pre>
                  </div>
                  {error.digest && (
                    <div>
                      <span className="font-semibold text-foreground">
                        Digest:
                      </span>
                      <code className="block mt-1 text-sm text-muted-foreground">
                        {error.digest}
                      </code>
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <span className="font-semibold text-foreground">
                        Stack Trace:
                      </span>
                      <pre className="mt-2 bg-background p-3 rounded border border-border overflow-x-auto text-xs text-muted-foreground max-h-64">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Recovery Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} size="lg" className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5" />
            Try Again
          </Button>

          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Button>
        </div>

        {/* Support Information */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please{" "}
            <a
              href="mailto:support@farmersmarket.com"
              className="text-primary hover:underline font-medium"
            >
              contact our support team
            </a>
            {error.digest && (
              <>
                {" "}
                and reference error code:{" "}
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {error.digest}
                </code>
              </>
            )}
          </p>
        </div>

        {/* Agricultural Consciousness */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground/70">
            🌱 Even the best-tended gardens encounter unexpected weather
          </p>
        </div>
      </div>
    </div>
  );
}
