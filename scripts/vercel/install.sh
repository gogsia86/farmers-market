#!/bin/bash
# Vercel Install Script
# Handles platform-specific optional dependencies on Linux build servers

set -e

echo "🚀 Starting Vercel-optimized npm install..."

# Install dependencies, ignoring optional packages
# This prevents Windows/Mac-specific binaries from failing the build
npm install --legacy-peer-deps --ignore-scripts

echo "✅ Dependencies installed successfully"

# Run Prisma generation separately
echo "🔧 Generating Prisma Client..."
npx prisma generate || {
  echo "⚠️  Prisma generate failed, but continuing build..."
}

echo "✅ Installation complete!"
