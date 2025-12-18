/**
 * 🗄️ PRISMA 7 CONFIGURATION
 * Divine database configuration for Prisma CLI
 * @reference https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-to-prisma-7
 */

import "dotenv/config";
import { defineConfig } from "prisma/config";

// Helper to get DATABASE_URL with fallback for build-time
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) {
    return url;
  }

  // Fallback for build-time when DATABASE_URL is not set
  // This allows Prisma to generate the client without a real database
  console.warn("⚠️  DATABASE_URL not set, using placeholder for build");
  return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
}

export default defineConfig({
  // Schema location
  schema: "prisma/schema.prisma",

  // Migration configuration
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed-basic.ts",
  },

  // Database datasource configuration
  datasource: {
    // Use DATABASE_URL from environment, with fallback for build-time
    url: getDatabaseUrl(),
  },
});
