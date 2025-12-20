# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🌾 FARMERS MARKET PLATFORM - PRODUCTION DOCKERFILE                ║
# ║ Divine Agricultural E-Commerce System                              ║
# ║ Multi-stage build for optimized production deployment             ║
# ╚════════════════════════════════════════════════════════════════════╝

# ============================================================================
# STAGE 1: DEPENDENCIES
# ============================================================================
FROM node:20-alpine AS deps

LABEL maintainer="Farmers Market Platform Team"
LABEL version="1.0.0"
LABEL description="Production-ready Next.js application for agricultural e-commerce"

WORKDIR /app

# Install system dependencies required for Prisma and native modules
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    python3 \
    make \
    g++

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies
# Use npm ci for reproducible builds
# Set environment variables to skip Husky and other dev-only scripts
ENV HUSKY=0
ENV CI=true
RUN npm ci --legacy-peer-deps --ignore-scripts

# Run only necessary postinstall scripts
RUN npm rebuild && npx prisma generate



# ============================================================================
# STAGE 2: BUILDER
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    python3 \
    make \
    g++

# Copy package files and install ALL dependencies (including dev)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install ALL dependencies for build
ENV HUSKY=0
ENV CI=true
RUN npm ci --legacy-peer-deps --ignore-scripts

# Copy all application files
COPY . .

# Environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true
ENV HUSKY=0
ENV CI=true

# Generate Prisma client again in builder context
RUN npx prisma generate

# Build the Next.js application with proper environment
RUN NODE_OPTIONS='--max-old-space-size=16384' npx prisma generate && npx next build

# ============================================================================
# STAGE 3: RUNNER (PRODUCTION)
# ============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    openssl \
    curl \
    ca-certificates \
    dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create necessary directories
RUN mkdir -p /app/.next /app/public /app/logs /app/uploads
RUN chown -R nextjs:nodejs /app

# Copy built application from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy Prisma files for migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma



# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Run Next.js standalone server
CMD ["node", "server.js"]
