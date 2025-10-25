/**
 * DATABASE CONNECTION - Prisma Client Export
 *
 * Divine singleton pattern for Prisma Client
 * Prevents multiple instances in development hot reload
 * Optimized for HP OMEN hardware (64GB RAM, RTX 2070)
 */

import { PrismaClient } from "@prisma/client";

// Global type declaration for Node.js global object
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Divine singleton pattern - prevents multiple instances
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

// Use globalThis in development to prevent exhausting database connections
export const database = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = database;
}

// Named exports for backwards compatibility
export const prisma = database;
export default database;
