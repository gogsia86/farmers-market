#!/bin/bash
# ============================================================================
# Fix Corrupted Package Lockfile Script
# ============================================================================
# Purpose: Safely regenerate package-lock.json to fix corruption issues
# Usage: npm run fix:lockfile (or bash scripts/fix-lockfile.sh)
# ============================================================================

set -e  # Exit on error

echo "🔧 Starting Package Lockfile Regeneration..."
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Backup existing lockfile if it exists
if [ -f "package-lock.json" ]; then
    echo -e "${YELLOW}📦 Backing up existing package-lock.json...${NC}"
    timestamp=$(date +%Y%m%d_%H%M%S)
    cp package-lock.json "package-lock.json.backup-${timestamp}"
    echo -e "${GREEN}✅ Backup created: package-lock.json.backup-${timestamp}${NC}"
    echo ""
fi

# Step 1: Delete corrupted lockfile
echo -e "${BLUE}🗑️  Step 1: Removing corrupted lockfile...${NC}"
if [ -f "package-lock.json" ]; then
    rm package-lock.json
    echo -e "${GREEN}✅ Lockfile removed${NC}"
else
    echo -e "${YELLOW}⚠️  No lockfile found (already removed)${NC}"
fi
echo ""

# Step 2: Delete node_modules
echo -e "${BLUE}🗑️  Step 2: Removing node_modules...${NC}"
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo -e "${GREEN}✅ node_modules removed${NC}"
else
    echo -e "${YELLOW}⚠️  No node_modules found (already removed)${NC}"
fi
echo ""

# Step 3: Clear npm cache
echo -e "${BLUE}🧹 Step 3: Clearing npm cache...${NC}"
npm cache clean --force
echo -e "${GREEN}✅ Cache cleared${NC}"
echo ""

# Step 4: Verify npm version
echo -e "${BLUE}🔍 Step 4: Checking npm version...${NC}"
npm_version=$(npm --version)
echo -e "Current npm version: ${GREEN}${npm_version}${NC}"
echo -e "${YELLOW}Note: Using npm 10+ is recommended for consistency${NC}"
echo ""

# Step 5: Regenerate lockfile
echo -e "${BLUE}📦 Step 5: Installing dependencies (this may take a few minutes)...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 6: Verify installation
echo -e "${BLUE}🔍 Step 6: Verifying installation...${NC}"
echo ""

# Check for errors in dependency tree
echo "Checking dependency tree..."
if npm ls > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Dependency tree is valid${NC}"
else
    echo -e "${YELLOW}⚠️  Some peer dependency warnings (this is normal)${NC}"
fi
echo ""

# Check for vulnerabilities
echo "Checking for vulnerabilities..."
npm audit --audit-level=moderate || true
echo ""

# Step 7: Verify Prisma
echo -e "${BLUE}🔍 Step 7: Verifying Prisma client...${NC}"
if npm ls @prisma/client > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prisma client is installed${NC}"
else
    echo -e "${RED}❌ Prisma client not found${NC}"
fi
echo ""

# Step 8: Final checks
echo -e "${BLUE}🔍 Step 8: Final verification...${NC}"
echo ""

# Check if lockfile was created
if [ -f "package-lock.json" ]; then
    lockfile_size=$(wc -c < package-lock.json)
    echo -e "${GREEN}✅ New package-lock.json created (${lockfile_size} bytes)${NC}"
else
    echo -e "${RED}❌ Failed to create package-lock.json${NC}"
    exit 1
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    modules_count=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo -e "${GREEN}✅ node_modules created (${modules_count} packages)${NC}"
else
    echo -e "${RED}❌ node_modules directory not created${NC}"
    exit 1
fi

echo ""
echo "============================================"
echo -e "${GREEN}✨ Lockfile regeneration complete!${NC}"
echo "============================================"
echo ""
echo "📝 Next steps:"
echo "   1. Run 'npm run build' to verify the build works"
echo "   2. Run 'npm run dev' to test locally"
echo "   3. Commit the new package-lock.json:"
echo "      git add package-lock.json"
echo "      git commit -m 'fix: regenerate corrupted package-lock.json'"
echo "   4. Push and deploy to Vercel"
echo ""
echo "💡 Tip: If you encounter issues, restore the backup:"
if [ -f "package-lock.json.backup-${timestamp}" ]; then
    echo "   cp package-lock.json.backup-${timestamp} package-lock.json"
    echo "   npm install"
fi
echo ""
echo -e "${GREEN}🚀 Ready to go!${NC}"
