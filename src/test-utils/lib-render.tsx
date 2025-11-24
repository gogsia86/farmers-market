/**
 * 🧪 DIVINE TEST UTILITIES
 * Custom render function with all necessary providers
 * Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
 */

import { RenderOptions, render as rtlRender } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import React from "react";

/**
 * Custom render function that wraps components with necessary providers
 */
export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <SessionProvider session={null}>{children}</SessionProvider>;
  };

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";
