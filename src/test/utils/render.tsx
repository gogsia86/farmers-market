/**
 * DIVINE TEST UTILITIES
 * Custom render function with all necessary providers
 * Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
 */

import { RenderOptions, render as rtlRender } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import React from "react";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: any;
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function render(
  ui: React.ReactElement,
  { session = null, ...options }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </SessionProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
