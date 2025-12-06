#!/bin/bash
# Dev Server Starter Script for Farmers Market Platform
# This script starts the Next.js dev server in the background

echo "🚀 Starting Farmers Market Dev Server..."

# Kill any existing dev server on port 3001
echo "🔍 Checking for existing processes on port 3001..."
PID=$(netstat -ano | grep ":3001" | grep "LISTENING" | awk '{print $5}' | head -1)
if [ ! -z "$PID" ]; then
    echo "🛑 Stopping existing server (PID: $PID)..."
    taskkill //F //PID $PID 2>/dev/null || true
    sleep 2
fi

# Start the dev server in background
echo "🌱 Starting new dev server..."
nohup npm run dev > dev-server.log 2>&1 &
DEV_PID=$!

echo "⏳ Waiting for server to be ready..."
RETRIES=0
MAX_RETRIES=30

while [ $RETRIES -lt $MAX_RETRIES ]; do
    sleep 2
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Dev server is ready!"
        echo "📊 Server PID: $DEV_PID"
        echo "🌐 URL: http://localhost:3001"
        echo "📝 Logs: tail -f dev-server.log"
        exit 0
    fi
    RETRIES=$((RETRIES + 1))
    echo "   Waiting... ($RETRIES/$MAX_RETRIES)"
done

echo "❌ Server failed to start within 60 seconds"
echo "📋 Last 50 lines of logs:"
tail -50 dev-server.log
exit 1
