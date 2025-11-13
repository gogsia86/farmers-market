/**
 * DIVINE TEST UTILITIES
 * Custom render function with all providers for comprehensive testing
 *
 * Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
 * Agricultural Context: Test utilities with farming consciousness
 */

import { RenderOptions, render as rtlRender } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import React from "react";

/**
 * DIVINE TEST WRAPPER
 * Wraps components with all necessary providers for testing
 */
interface TestWrapperProps {
  children: React.ReactNode;
  session?: any;
}

function TestWrapper({ children, session = null }: TestWrapperProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

/**
 * CUSTOM RENDER FUNCTION
 * Renders component with all providers automatically
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: any;
}

export function render(
  ui: React.ReactElement,
  { session, ...renderOptions }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper session={session}>{children}</TestWrapper>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
