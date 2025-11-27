#!/bin/sh
# ============================================================================
# FARMERS MARKET PLATFORM - DOCKER ENTRYPOINT
# Development container startup script
# Ensures Prisma is properly configured for Linux environment
# ============================================================================

set -e

echo "🌾 Farmers Market Platform - Docker Container Starting"
echo "════════════════════════════════════════════════════════"

# Function to check if database is ready
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."

    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if nc -z db 5432 2>/dev/null || timeout 2 sh -c 'cat < /dev/null > /dev/tcp/db/5432' 2>/dev/null; then
            echo "✅ Database is ready!"
            sleep 2  # Give it a moment to fully initialize
            return 0
        fi

        attempt=$((attempt + 1))
        echo "   Attempt $attempt/$max_attempts - Database not ready yet..."
        sleep 2
    done

    echo "⚠️  Database connection timeout - continuing anyway..."
    return 1
}

# Step 1: Clean up any Windows-specific Prisma artifacts
echo ""
echo "🧹 Cleaning Windows-specific Prisma artifacts..."
rm -rf node_modules/.prisma/client/*.dll.node 2>/dev/null || true
rm -rf node_modules/@prisma/engines/*.dll.node 2>/dev/null || true
rm -rf node_modules/@prisma/engines/*.exe 2>/dev/null || true

# Step 2: Regenerate Prisma Client with Linux binaries
echo ""
echo "🔧 Regenerating Prisma Client for Linux environment..."
npx prisma generate --generator client

if [ $? -eq 0 ]; then
    echo "✅ Prisma Client generated successfully with Linux binaries"
else
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

# Step 3: Wait for database (optional, but helpful)
echo ""
wait_for_db

# Step 4: Run database migrations/push (development only)
if [ "$NODE_ENV" = "development" ]; then
    echo ""
    echo "🔄 Syncing database schema (development mode)..."
    npx prisma db push --accept-data-loss --skip-generate 2>&1 | grep -v "prisma:" || true

    if [ $? -eq 0 ]; then
        echo "✅ Database schema synchronized"
    else
        echo "⚠️  Database sync failed - continuing anyway..."
    fi
fi

# Step 5: Show Prisma engine info
echo ""
echo "📊 Prisma Engine Information:"
echo "   Binary: $(ls -1 node_modules/@prisma/engines/libquery_engine-*.so.node 2>/dev/null | head -1 || echo 'Not found')"
echo "   Platform: $(uname -s) $(uname -m)"
echo "   Node Version: $(node --version)"
echo "   NPM Version: $(npm --version)"

# Step 6: Force complete Next.js cache clearing (prevent Windows binary bundling)
echo ""
echo "🧹 Force cleaning ALL Next.js build artifacts..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
mkdir -p .next
chown -R node:node .next 2>/dev/null || true

echo ""
echo "════════════════════════════════════════════════════════"
echo "🚀 Starting Next.js Development Server..."
echo "════════════════════════════════════════════════════════"
echo ""

# Execute the main command (npm run dev)
exec "$@"
