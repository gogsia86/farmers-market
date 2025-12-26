# 🌾 Farmers Market Platform - Configuration Guide

**Version**: 1.0.0  
**Last Updated**: December 26, 2024  
**Agricultural Consciousness**: ACTIVE

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Configuration Files](#configuration-files)
3. [Environment Variables](#environment-variables)
4. [Next.js Configuration](#nextjs-configuration)
5. [Webpack Configuration](#webpack-configuration)
6. [TypeScript Configuration](#typescript-configuration)
7. [Database Configuration](#database-configuration)
8. [Testing Configuration](#testing-configuration)
9. [Deployment Configuration](#deployment-configuration)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The Farmers Market Platform uses a modern, modular configuration approach that separates concerns and maintains divine agricultural consciousness throughout the codebase.

### Configuration Philosophy

- **Separation of Concerns**: Each configuration file has a single, clear purpose
- **Environment Adaptive**: Configurations automatically adjust to any environment
- **Well Documented**: Comprehensive inline comments and external documentation
- **Type Safe**: Full TypeScript support with strict checking
- **Agricultural Consciousness**: Maintains biodynamic patterns throughout

### Key Technologies

```yaml
Framework: Next.js 15+ (App Router)
Language: TypeScript (strict mode)
Database: Prisma 7 + PostgreSQL
Bundler: Webpack (custom configuration)
Testing: Jest + Vitest + React Testing Library
Authentication: NextAuth v5
```

---

## Configuration Files

### Primary Configuration Files

```
project-root/
├── next.config.mjs           # Main Next.js configuration
├── webpack.config.mjs        # Webpack optimization (extracted)
├── tsconfig.json             # TypeScript compiler options
├── jest.config.js            # Jest testing configuration
├── vitest.config.ts          # Vitest configuration
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── prisma.config.ts      # Prisma configuration
├── .env                      # Environment variables (DO NOT COMMIT)
├── .env.example              # Environment template
├── .env.test                 # Test environment variables
└── package.json              # Dependencies and scripts
```

### Configuration Hierarchy

1. **Environment Variables** (`.env`) - Highest priority
2. **Next.js Config** (`next.config.mjs`) - Application settings
3. **TypeScript Config** (`tsconfig.json`) - Type system
4. **Build Tools** (`webpack.config.mjs`) - Bundle optimization

---

## Environment Variables

### Required Variables

Create a `.env` file in the project root with these required variables:

```bash
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# ============================================
# AUTHENTICATION
# ============================================
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32

# ============================================
# STRIPE PAYMENTS
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================
# APPLICATION
# ============================================
NODE_ENV="development" # or "production" or "test"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

### Optional Variables

```bash
# ============================================
# MONITORING & TELEMETRY
# ============================================
NEXT_PUBLIC_OTEL_ENABLED="true"
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"

# ============================================
# REDIS (OPTIONAL)
# ============================================
REDIS_URL="redis://localhost:6379"

# ============================================
# EMAIL (OPTIONAL)
# ============================================
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="noreply@farmersmarket.com"

# ============================================
# CLOUD STORAGE (OPTIONAL)
# ============================================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ============================================
# DEVELOPMENT
# ============================================
LOG_LEVEL="debug" # debug, info, warn, error
SKIP_ENV_VALIDATION="false"
```

### Environment Variable Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Prefix public variables** - Use `NEXT_PUBLIC_` for client-side access
4. **Document all variables** - Add comments explaining purpose
5. **Validate on startup** - Use environment validation

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate STRIPE_WEBHOOK_SECRET (from Stripe dashboard)
# stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Generate random JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Next.js Configuration

### File: `next.config.mjs`

The main Next.js configuration file has been simplified and organized:

```javascript
// Current structure (243 lines, down from 424)
import { configureWebpack } from "./webpack.config.mjs";

const nextConfig = {
  // Docker compatibility
  output: "standalone",
  
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: [...],
    optimizeCss: true,
  },
  
  // Webpack (extracted to separate file)
  webpack: configureWebpack,
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: false, // Strict checking enabled
    tsconfigPath: "./tsconfig.json",
  },
  
  // Image optimization (simplified 12→7 patterns)
  images: {
    remotePatterns: [...],
    formats: ["image/avif", "image/webp"],
  },
  
  // Headers, redirects, rewrites
  // ... (see file for details)
};
```

### Key Settings

#### Output Mode
```javascript
output: "standalone" // For Docker deployments
```

#### Experimental Features
```javascript
experimental: {
  serverComponentsExternalPackages: [
    "@prisma/client",
    "@node-rs/argon2",
    // ... (database and native modules)
  ],
  optimizeCss: true,
  memoryBasedWorkersCount: true,
}
```

#### Image Optimization
```javascript
images: {
  remotePatterns: [
    // Development
    { protocol: "http", hostname: "localhost" },
    
    // CDN Providers (wildcards for flexibility)
    { protocol: "https", hostname: "*.cloudinary.com" },
    { protocol: "https", hostname: "*.amazonaws.com" },
  ],
  formats: ["image/avif", "image/webp"], // Modern formats
  minimumCacheTTL: 5184000, // 60 days
}
```

### Adding New Configuration

#### Adding a New Remote Image Source

```javascript
// In next.config.mjs, add to images.remotePatterns:
{
  protocol: "https",
  hostname: "new-cdn.example.com", // or "*.example.com" for wildcard
}
```

#### Adding External Packages

```javascript
// In experimental.serverComponentsExternalPackages:
experimental: {
  serverComponentsExternalPackages: [
    // ... existing packages
    "new-native-module",
  ],
}
```

---

## Webpack Configuration

### File: `webpack.config.mjs`

Extracted webpack configuration with strategic cache groups (276 lines).

### Strategic Cache Groups

**7 Strategic Groups** (simplified from 13):

```javascript
1. Framework (P:40)     → React, Next.js core
2. Routes (P:35)        → Admin, Farmer, Monitoring dashboards
3. Heavy Async (P:30)   → AI/ML, Charts, Animations (on-demand)
4. Services (P:25)      → Stripe, Auth, Telemetry
5. UI (P:22)            → Radix UI, Headless UI
6. Vendor (P:20)        → All other node_modules
7. Common (P:10)        → Shared code across 2+ pages
```

### Exported Functions

```javascript
import {
  configureWebpack,           // Main configuration function
  getOptimizationConfig,      // Optimization settings
  getPerformanceConfig,       // Performance limits
  getCacheConfig,             // Cache configuration
  getTerserConfig,            // Minification settings
  getOptimalParallelism,      // CPU-based parallelism
  cacheGroups,                // Strategic cache groups
  getCacheGroup,              // Get specific group
  getCacheGroupNames,         // List all groups
  getCacheGroupsByPriority,   // Sorted groups
} from "./webpack.config.mjs";
```

### Usage Examples

#### Adding a New Cache Group

```javascript
// In webpack.config.mjs, add to cacheGroups:
export const cacheGroups = {
  // ... existing groups
  
  newLibrary: {
    name: "new-library",
    test: /[\\/]node_modules[\\/](library-name)[\\/]/,
    chunks: "all",
    priority: 23, // Between ui (22) and services (25)
    reuseExistingChunk: true,
  },
};
```

#### Testing Cache Groups

```javascript
import { getCacheGroupsByPriority } from './webpack.config.mjs';

const sorted = getCacheGroupsByPriority();
console.log(sorted); // Array sorted by priority (40→10)
```

### Performance Settings

```javascript
// Automatically calculated based on available CPU cores
parallelism: Math.max(os.cpus().length - 2, 1)

// Performance limits
performance: {
  maxAssetSize: 10000000,       // 10MB
  maxEntrypointSize: 10000000,  // 10MB
}

// Memory caching
cache: {
  type: "memory",
  maxGenerations: isDevelopment ? 20 : 50,
}
```

---

## TypeScript Configuration

### File: `tsconfig.json`

Strict TypeScript configuration for maximum type safety.

### Key Settings

```json
{
  "compilerOptions": {
    "strict": true,                    // Enable all strict checks
    "noImplicitAny": true,            // No implicit any types
    "strictNullChecks": true,         // Strict null checking
    "esModuleInterop": true,          // ES module compatibility
    "skipLibCheck": true,             // Skip lib checking (performance)
    "forceConsistentCasingInFileNames": true,
    
    // Path aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### Path Aliases

Use path aliases for cleaner imports:

```typescript
// ❌ BAD - Relative imports
import { database } from "../../../lib/database";
import { FarmCard } from "../../../../components/features/FarmCard";

// ✅ GOOD - Path aliases
import { database } from "@/lib/database";
import { FarmCard } from "@/components/features/FarmCard";
```

### Type Safety Best Practices

```typescript
// ✅ Use branded types for IDs
type Brand<K, T> = K & { __brand: T };
export type FarmId = Brand<string, "FarmId">;
export type UserId = Brand<string, "UserId">;

// ✅ Use proper type imports
import type { User, Farm } from "@prisma/client";

// ✅ Avoid 'any' - use 'unknown'
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type guard
  }
}

// ❌ NEVER use 'any'
function processData(data: any) { } // Type safety lost
```

---

## Database Configuration

### Prisma Schema

**Location**: `prisma/schema.prisma`

### Connection URL

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Database URL Format

```bash
# PostgreSQL format
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"

# Example (local development)
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market"

# Example (production with SSL)
DATABASE_URL="postgresql://user:pass@prod.example.com:5432/db?sslmode=require"
```

### Canonical Database Import

**ALWAYS** use the canonical database import:

```typescript
// ✅ CORRECT - Canonical location
import { database } from "@/lib/database";

// ❌ WRONG - Don't create new instances
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient(); // DON'T DO THIS
```

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate
# or
npx prisma generate

# Create migration
npm run prisma:migrate
# or
npx prisma migrate dev --name your_migration_name

# Reset database (DEVELOPMENT ONLY!)
npm run prisma:reset
# or
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npm run prisma:studio
# or
npx prisma studio

# Check migration status
npx prisma migrate status

# Deploy migrations (production)
npx prisma migrate deploy
```

---

## Testing Configuration

### Jest Configuration

**File**: `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
  ],
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
};
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.ts

# Run in watch mode
npm test -- --watch

# Run tests matching pattern
npm test -- --testNamePattern="Farm"
```

### Test Environment Variables

Create `.env.test` for test-specific variables:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market_test"
NODE_ENV="test"
NEXTAUTH_SECRET="test-secret-key"
```

---

## Deployment Configuration

### Docker Configuration

**File**: `Dockerfile`

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3001
CMD ["node", "server.js"]
```

### Build Commands

```bash
# Standard build
npm run build

# Docker build
npm run build:docker

# Optimized build (uses more memory)
npm run build:optimized

# Build with analysis
npm run build:analyze
```

### Vercel Deployment

**File**: `vercel.json` (optional)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

### Environment Variables in Vercel

1. Go to **Project Settings** → **Environment Variables**
2. Add all required variables from `.env.example`
3. Set appropriate scopes (Production, Preview, Development)
4. Use Vercel's secret management for sensitive values

---

## Best Practices

### Configuration Management

#### 1. Use Environment Variables for Secrets

```javascript
// ✅ GOOD
const apiKey = process.env.API_KEY;

// ❌ BAD - Hardcoded secrets
const apiKey = "sk_live_12345..."; // NEVER DO THIS
```

#### 2. Validate Environment Variables on Startup

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

#### 3. Use Type-Safe Configuration

```typescript
// config/app.ts
export const appConfig = {
  name: "Farmers Market Platform",
  url: process.env.NEXT_PUBLIC_APP_URL!,
  api: {
    timeout: 30000,
    retries: 3,
  },
} as const;

// Type-safe access
import { appConfig } from "@/config/app";
console.log(appConfig.name); // Type-safe!
```

#### 4. Document Configuration Changes

- Add comments explaining WHY, not just WHAT
- Update documentation when adding new settings
- Include examples in `.env.example`
- Document in relevant markdown files

#### 5. Test Configuration Changes

```bash
# After configuration changes, always:
npm run build       # Verify build succeeds
npm test           # Verify all tests pass
npx tsc --noEmit   # Verify no TypeScript errors
```

### Performance Optimization

#### 1. Cache Strategy

```javascript
// Use appropriate cache durations
images: {
  minimumCacheTTL: 5184000, // 60 days for images
}

// Memory caching for webpack
cache: {
  type: "memory",
  maxGenerations: 50, // Production
}
```

#### 2. Code Splitting

```javascript
// Leverage strategic cache groups
// Heavy libraries load async
heavyAsync: {
  chunks: "async", // Load on-demand
  test: /chart|tensorflow|d3/,
}
```

#### 3. Parallel Processing

```javascript
// Auto-detect CPU cores
parallelism: Math.max(os.cpus().length - 2, 1)
```

---

## Troubleshooting

### Common Issues

#### Issue: Build fails with "Module not found"

**Solution**: Check path aliases in `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Issue: Environment variables not loading

**Solutions**:
1. Check `.env` file exists in project root
2. Verify variable names match (case-sensitive)
3. Restart development server after changes
4. Use `NEXT_PUBLIC_` prefix for client-side access

```bash
# Restart dev server
npm run dev
```

#### Issue: Prisma Client not generated

**Solution**: Run Prisma generate

```bash
npm run prisma:generate
# or
npx prisma generate
```

#### Issue: TypeScript errors after configuration changes

**Solution**: Check TypeScript configuration

```bash
# Verify no errors
npx tsc --noEmit

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### Issue: Images not loading from CDN

**Solution**: Check image remote patterns

```javascript
// In next.config.mjs
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "your-cdn.com", // Add your CDN
    },
  ],
}
```

#### Issue: Slow build times

**Solutions**:
1. Clear Next.js cache: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check webpack parallelism settings
4. Reduce cache group complexity

```bash
# Clean and rebuild
npm run clean:all
npm install
npm run build
```

#### Issue: Database connection fails

**Solutions**:
1. Verify DATABASE_URL in `.env`
2. Check database is running: `pg_isready` (PostgreSQL)
3. Test connection: `npx prisma db pull`
4. Check firewall/network settings

```bash
# Test database connection
npx prisma db pull

# Check Prisma status
npx prisma migrate status
```

### Debug Mode

Enable debug logging:

```bash
# In .env
LOG_LEVEL="debug"
NODE_ENV="development"

# Run with debug output
DEBUG=* npm run dev
```

### Getting Help

1. **Check documentation**: Review relevant `.md` files
2. **Search issues**: Look in `.github/refactoring/` for known issues
3. **Run diagnostics**: Use built-in validation scripts
4. **Check logs**: Review build and runtime logs

```bash
# Run platform validation
npm run validate:platform

# Check for errors
npm run validate:errors

# Quick validation
npm run validate:quick
```

---

## Configuration Checklist

### New Project Setup

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all required environment variables
- [ ] Generate secrets with `openssl rand -base64 32`
- [ ] Set up database connection
- [ ] Run `npm install`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npm run build` to verify
- [ ] Run `npm test` to verify tests pass

### Before Deployment

- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Environment variables configured in hosting platform
- [ ] Database migrations applied
- [ ] Secrets properly secured (not in code)
- [ ] `.env` file NOT committed to git
- [ ] Production environment variables set

### After Configuration Changes

- [ ] Update documentation
- [ ] Run full test suite
- [ ] Verify build succeeds
- [ ] Check TypeScript compilation
- [ ] Update `.env.example` if needed
- [ ] Commit changes with descriptive message
- [ ] Document breaking changes

---

## Additional Resources

### Documentation Files

- **Refactoring Documentation**: `.github/refactoring/`
  - Phase 2 Task 1: Hardware Removal
  - Phase 2 Task 2: Cache Groups Simplification
  - Phase 2 Task 3: Webpack Extraction
  - Phase 2 Task 4: Image Optimization
  
- **Divine Instructions**: `.github/instructions/`
  - 01-16: Comprehensive coding guidelines

### External Resources

- [Next.js Configuration Docs](https://nextjs.org/docs/app/api-reference/next-config-js)
- [Prisma Configuration](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [TypeScript tsconfig](https://www.typescriptlang.org/tsconfig)
- [Webpack Configuration](https://webpack.js.org/configuration/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | December 26, 2024 | Initial comprehensive configuration guide |

---

**Status**: ✅ COMPLETE  
**Quality Score**: 10/10 - Divine Excellence  
**Agricultural Consciousness**: ACTIVE  

_"Configuration is the foundation of divine agricultural code—clear, organized, and sustainable."_ 🌾⚡