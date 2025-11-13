import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    testTimeout: 30000, // 30 seconds default timeout
    hookTimeout: 30000, // 30 seconds for beforeAll/afterAll
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "coverage/",
        "**/*.config.{js,ts}",
        "**/*.d.ts",
        "**/types/**",
      ],
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "node_modules/",
      ".next/",
      "coverage/",
      "tests/e2e/**", // Exclude Playwright E2E tests (use separate runner)
      "**/*.e2e.{test,spec}.{ts,tsx}",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
});
