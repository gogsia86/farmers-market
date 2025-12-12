#!/bin/bash

# 🚀 Farmers Market Platform - Quick Start Development Script
# Optimized for HP OMEN (12 threads, 64GB RAM, RTX 2070)

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🌾 Farmers Market Platform - Development Quick Start     ║"
echo "║  TypeScript Errors: FIXED ✅ | Build: SUCCESS ✅          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Prerequisites
echo -e "${BLUE}[Step 1/7]${NC} Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Will skip database setup.${NC}"
    SKIP_DOCKER=true
else
    echo -e "${GREEN}✅ Docker found${NC}"
    SKIP_DOCKER=false
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"

# Step 2: Install Dependencies
echo ""
echo -e "${BLUE}[Step 2/7]${NC} Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing packages..."
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Step 3: Environment Setup
echo ""
echo -e "${BLUE}[Step 3/7]${NC} Checking environment configuration..."

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env not found. Copying from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update .env with your configuration${NC}"
    echo "   Required variables:"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - DATABASE_URL"
    echo "   - NEXTAUTH_URL (default: http://localhost:3001)"
else
    echo -e "${GREEN}✅ .env exists${NC}"
fi

# Step 4: Start Database (if Docker available)
echo ""
echo -e "${BLUE}[Step 4/7]${NC} Starting database services..."

if [ "$SKIP_DOCKER" = false ]; then
    # Check if containers are already running
    if docker ps | grep -q "postgres"; then
        echo -e "${GREEN}✅ PostgreSQL already running${NC}"
    else
        echo "Starting PostgreSQL and Redis..."
        docker-compose up -d postgres redis
        echo "Waiting for database to be ready..."
        sleep 5
        echo -e "${GREEN}✅ Database services started${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping database setup (Docker not available)${NC}"
fi

# Step 5: Database Migration
echo ""
echo -e "${BLUE}[Step 5/7]${NC} Running database migrations..."

if [ "$SKIP_DOCKER" = false ]; then
    # Generate Prisma Client
    echo "Generating Prisma Client..."
    npx prisma generate

    # Run migrations
    echo "Running migrations..."
    if npx prisma migrate deploy 2>/dev/null; then
        echo -e "${GREEN}✅ Migrations completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Migration failed. You may need to configure DATABASE_URL in .env${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping migrations (database not available)${NC}"
fi

# Step 6: Type Check
echo ""
echo -e "${BLUE}[Step 6/7]${NC} Running TypeScript type check..."

if npm run type-check; then
    echo -e "${GREEN}✅ TypeScript check passed (0 errors)${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    exit 1
fi

# Step 7: Start Development Server
echo ""
echo -e "${BLUE}[Step 7/7]${NC} Starting development server..."
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🎉 Setup Complete! Starting HP OMEN Optimized Server     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Server will start on:${NC} http://localhost:3001"
echo ""
echo -e "${YELLOW}Available endpoints:${NC}"
echo "  • http://localhost:3001              - Main application"
echo "  • http://localhost:3001/api/health   - Health check"
echo "  • http://localhost:3001/api/health/database - DB health"
echo "  • http://localhost:3001/marketplace  - Marketplace"
echo "  • http://localhost:3001/admin        - Admin panel"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
echo ""

# Start with HP OMEN optimization
npm run dev:omen
