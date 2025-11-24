/**
 * PRISMA 7 CONFIGURATION
 * Database connection and migration settings
 * @see https://pris.ly/d/prisma7-client-config
 *
 * NOTE: Using plain object export until @prisma/client/config types are available
 */

export default {
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://user:password@localhost:5432/farmers_market",
    },
  },
  // Seed configuration (replaces package.json prisma.seed)
  seed: "tsx prisma/seed.ts",
};
