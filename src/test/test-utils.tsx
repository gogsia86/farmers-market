/**
 * 🧪 DIVINE TEST UTILITIES
 * Custom render function with all providers for testing
 */

import { RenderOptions, render as rtlRender } from "@testing-library/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import React from "react";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: Session | null;
}

function AllTheProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session || null}>{children}</SessionProvider>
  );
}

function customRender(ui: React.ReactElement, options?: CustomRenderOptions) {
  const { session, ...renderOptions } = options || {};

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders session={session}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { customRender as render };
