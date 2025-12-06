# ============================================================================
# FARMERS MARKET PLATFORM - DIVINE DOCKER IMAGE
# Multi-stage build optimized for production deployment
# Node.js 20 LTS with Alpine Linux for minimal image size
# ============================================================================

# ============================================================================
# STAGE 1: Dependencies Base
# ============================================================================
FROM node:20-alpine AS deps

# Install necessary build tools and OpenSSL for Prisma
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    openssl-dev \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with legacy peer deps for compatibility
RUN npm ci --legacy-peer-deps --only=production && \
    npm cache clean --force

# ============================================================================
# STAGE 2: Build Dependencies (includes devDependencies)
# ============================================================================
FROM node:20-alpine AS build-deps

RUN apk add --no-cache \
    libc6-compat \
    openssl \
    openssl-dev \
    python3 \
    make \
    g++

WORKDIR /app

COPY package.json package-lock.json* ./

# Install all dependencies including devDependencies for build
RUN npm ci --legacy-peer-deps && \
    npm cache clean --force

# ============================================================================
# STAGE 3: Builder - Build the Next.js Application
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl openssl-dev

# Copy node_modules from build-deps stage
COPY --from=build-deps /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY src ./src/
COPY public ./public/

# Copy configuration files
COPY next.config.mjs ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY instrumentation.ts ./

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    SKIP_ENV_VALIDATION=true \
    DOCKER_BUILD=true

# Build the application with standalone output (using build:docker to skip prebuild checks)
RUN npm run build:docker

# ============================================================================
# STAGE 4: Runner - Production Runtime
# ============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    curl \
    wget \
    tini

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files for runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Set production environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"]
