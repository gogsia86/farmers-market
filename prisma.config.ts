/**
 * 🗄️ PRISMA 7 CONFIGURATION
 * Divine database configuration for Prisma CLI
 * @reference https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-to-prisma-7
 */

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

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
    // Use DATABASE_URL from environment
    url: env("DATABASE_URL"),
  },
});
