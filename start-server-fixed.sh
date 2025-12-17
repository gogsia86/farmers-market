#!/bin/bash

# 🚀 Farmers Market Platform - Production Server Startup Script
# Fixed version with correct database credentials

echo "════════════════════════════════════════════════════════════"
echo "🌾 Farmers Market Platform - Starting Production Server"
echo "════════════════════════════════════════════════════════════"
echo ""

# Set environment variables
export NODE_ENV=production
export PORT=3001
export DATABASE_URL="postgresql://postgres:test_password_123@127.0.0.1:5433/farmersmarket_test"
export DIRECT_URL="postgresql://postgres:test_password_123@127.0.0.1:5433/farmersmarket_test"
export NEXTAUTH_URL="http://localhost:3001"
export NEXTAUTH_SECRET="O8CnF65kNuZb8ZQewDRAhJclYSIlIlI+A0CNKpO8NjQ="
export LOG_LEVEL=info
export ENABLE_TELEMETRY=false

echo "✅ Environment variables configured"
echo "   - NODE_ENV: production"
echo "   - PORT: 3001"
echo "   - Database: PostgreSQL on port 5433"
echo ""

# Check if database is accessible
echo "🔍 Checking database connection..."
if netstat -an | grep -q ":5433.*LISTEN"; then
    echo "✅ PostgreSQL is running on port 5433"
else
    echo "⚠️  WARNING: PostgreSQL may not be running on port 5433"
    echo "   Please ensure your database is running before continuing"
fi
echo ""

# Check if port 3001 is available
echo "🔍 Checking if port 3001 is available..."
if netstat -an | grep -q ":3001.*LISTEN"; then
    echo "⚠️  WARNING: Port 3001 is already in use!"
    echo "   Attempting to find and kill the process..."

    PID=$(netstat -ano | grep ":3001.*LISTEN" | awk '{print $5}' | head -1)
    if [ -n "$PID" ]; then
        echo "   Found process: PID $PID"
        taskkill //PID $PID //F 2>/dev/null
        sleep 2
        echo "   ✅ Process terminated"
    fi
else
    echo "✅ Port 3001 is available"
fi
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate --quiet
if [ $? -eq 0 ]; then
    echo "✅ Prisma Client generated successfully"
else
    echo "⚠️  Prisma Client generation warning (may be okay)"
fi
echo ""

# Start the server
echo "🚀 Starting Next.js production server..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Use npm start which handles the configuration properly
npm run start

# If npm start fails, try the standalone server
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  npm start failed, trying standalone server..."
    cd .next/standalone
    node server.js
fi
