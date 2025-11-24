/**
 * 🌾 PRISMA 7 CONFIGURATION
 * Divine Agricultural Database Configuration
 * @reference .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md
 */

const config = {
  // Datasource configuration for Prisma Migrate
  datasource: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },

  // Seed configuration (migrated from package.json)
  seed: {
    command: "tsx prisma/seed.ts",
  },
};

export default config;
