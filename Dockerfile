# Dockerfile - Divine Agricultural Platform
# Using latest Node.js LTS with security patches
# ============================================
# STAGE 1: Base image with dependencies
# ============================================
FROM node:20.19-alpine3.20 AS base

WORKDIR /app

# Install dependencies for node-gyp
RUN apk add --no-cache libc6-compat python3 make g++

# ============================================
# STAGE 2: Install all dependencies
# ============================================
FROM base AS dependencies

COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# ============================================
# STAGE 3: Divine Build Reality
# ============================================
FROM node:20.19-alpine3.20 AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy Prisma schema FIRST
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy Next.js configuration files
COPY next.config.mjs ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./

# Copy source code
COPY src ./src/
COPY public ./public/

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true
ENV NEXTAUTH_URL=http://localhost:3000
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket"

# Force dynamic rendering to prevent static generation hanging
ENV NEXT_PRIVATE_STANDALONE=true
ENV DOCKER_BUILD=true

# Required for Next.js build (prevents ERR_INVALID_URL)
ENV PORT=3000
ENV APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000

# Placeholder database URL for build time (required by Prisma)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?connect_timeout=1"

# NextAuth URL (required at build time) - Secret must be provided at runtime
ENV NEXTAUTH_URL=http://localhost:3000

# Skip static generation during build
ENV NEXT_SKIP_STATIC_GENERATION=true

RUN npm run build

# Clean up dev dependencies
RUN npm prune --omit=dev

# ============================================
# STAGE 4: Production Divine Runner
# ============================================
FROM node:20.19-alpine3.20 AS runner

WORKDIR /app

# Install wget for health checks and OpenSSL for Prisma
RUN apk add --no-cache wget openssl openssl-dev

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from build stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy standalone output (Next.js creates this automatically)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma for runtime
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nextjs

# Expose divine port
EXPOSE 3000

ENV PORT=3000 \
  NODE_ENV=production \
  HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start application (standalone mode creates server.js in root)
CMD ["node", "server.js"]
