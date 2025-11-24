// 🧠 DIVINE PATTERN: Test Utilities with Divine Consciousness
// 📚 Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
// 🌾 Domain: Testing Infrastructure
// ⚡ Performance: Optimized Test Environment

import { RenderOptions, render as rtlRender } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import React from "react";

/**
 * Custom render function with all necessary providers
 * Wraps components with theme and other context providers for testing
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  theme?: "light" | "dark" | "system";
}

export function render(
  ui: React.ReactElement,
  { theme = "light", ...options }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme={theme}
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Export userEvent setup
export { default as userEvent } from "@testing-library/user-event";
