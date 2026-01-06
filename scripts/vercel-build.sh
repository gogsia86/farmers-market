#!/bin/bash

# =============================================================================
# 🚀 VERCEL BUILD SCRIPT
# =============================================================================
#
# This script handles the Vercel build process with proper error handling
# for missing environment variables, especially DATABASE_URL.
#
# It ensures Prisma can generate the client even without a real database
# connection during build time.
#
# =============================================================================

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════════════════"
echo "🚀 VERCEL BUILD SCRIPT - Farmers Market Platform"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# =============================================================================
# STEP 1: CHECK ENVIRONMENT
# =============================================================================

echo "📋 Step 1: Checking environment..."
echo "   Node version: $(node --version)"
echo "   NPM version: $(npm --version)"
echo "   Working directory: $(pwd)"
echo ""

# =============================================================================
# STEP 2: HANDLE DATABASE_URL
# =============================================================================

echo "🔍 Step 2: Checking DATABASE_URL..."

if [ -z "$DATABASE_URL" ]; then
    echo "   ⚠️  WARNING: DATABASE_URL not set!"
    echo "   Setting temporary DATABASE_URL for build..."

    # Set a placeholder DATABASE_URL for Prisma generation
    # This allows Prisma to generate the client without a real database
    export DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"

    echo "   ✅ Temporary DATABASE_URL set for build process"
    echo ""
    echo "   ⚠️  IMPORTANT: Add real DATABASE_URL in Vercel dashboard:"
    echo "      Vercel Dashboard → Settings → Environment Variables"
    echo ""
else
    echo "   ✅ DATABASE_URL is set"

    # Mask the actual URL for security (show only first 20 chars)
    MASKED_URL="${DATABASE_URL:0:20}...***"
    echo "   Database: $MASKED_URL"
    echo ""
fi

# =============================================================================
# STEP 3: GENERATE PRISMA CLIENT
# =============================================================================

echo "🔧 Step 3: Generating Prisma Client..."
echo ""

if npx prisma generate; then
    echo ""
    echo "   ✅ Prisma Client generated successfully"
    echo ""
else
    echo ""
    echo "   ❌ Prisma Client generation failed!"
    echo ""
    echo "   Troubleshooting steps:"
    echo "   1. Check that prisma/schema.prisma exists"
    echo "   2. Verify DATABASE_URL format is correct"
    echo "   3. Check Prisma version compatibility"
    echo ""
    exit 1
fi

# =============================================================================
# STEP 4: BUILD NEXT.JS APPLICATION
# =============================================================================

echo "🏗️  Step 4: Building Next.js application..."
echo ""

# Set build-time environment variables
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Increase Node memory for build
export NODE_OPTIONS="--max-old-space-size=8192"

echo "   Build configuration:"
echo "   - NODE_ENV: $NODE_ENV"
echo "   - Memory limit: 8GB"
echo "   - Telemetry: Disabled"
echo ""

if TURBOPACK=0 next build; then
    echo ""
    echo "   ✅ Next.js build completed successfully"
    echo ""
else
    echo ""
    echo "   ❌ Next.js build failed!"
    echo ""
    echo "   Common issues:"
    echo "   1. TypeScript errors - run 'npm run type-check' locally"
    echo "   2. Missing environment variables"
    echo "   3. Out of memory - build may be too large"
    echo "   4. Import errors - check all imports resolve"
    echo ""
    exit 1
fi

# =============================================================================
# STEP 5: POST-BUILD CHECKS
# =============================================================================

echo "✅ Step 5: Post-build verification..."
echo ""

# Check if .next directory exists
if [ -d ".next" ]; then
    echo "   ✅ .next directory created"

    # Show build output size
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo "   📦 Build size: $BUILD_SIZE"
    echo ""
else
    echo "   ❌ .next directory not found - build may have failed"
    exit 1
fi

# Check for standalone output (if enabled)
if [ -d ".next/standalone" ]; then
    echo "   ✅ Standalone build detected"
    echo ""
fi

# =============================================================================
# BUILD COMPLETE
# =============================================================================

echo "════════════════════════════════════════════════════════════════════════"
echo "🎉 BUILD COMPLETED SUCCESSFULLY!"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Build Summary:"
echo "   ✅ Prisma Client generated"
echo "   ✅ Next.js build completed"
echo "   ✅ Production bundle created"
echo ""

if [ -z "$VERCEL_ENV" ]; then
    echo "⚠️  REMINDER: Before deploying to production:"
    echo "   1. Set DATABASE_URL in Vercel environment variables"
    echo "   2. Set NEXTAUTH_SECRET (min 32 characters)"
    echo "   3. Set NEXTAUTH_URL to your production domain"
    echo "   4. Set STRIPE_SECRET_KEY and other API keys"
    echo ""
fi

echo "🚀 Ready for deployment!"
echo ""

exit 0
