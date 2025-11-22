/**
 * PRISMA 7 CONFIGURATION
 * Database connection and migration settings
 * @see https://pris.ly/d/prisma7-client-config
 */

import { defineConfig } from '@prisma/client/config'

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/farmers_market',
    },
  },
  // Seed configuration (replaces package.json prisma.seed)
  seed: 'tsx prisma/seed.ts',
})
