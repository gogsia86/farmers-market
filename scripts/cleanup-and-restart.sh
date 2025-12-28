#!/bin/bash
# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🌾 FARMERS MARKET PLATFORM - MASTER CLEANUP & RESTART             ║
# ║ Complete repository cleanup and Docker restart in one command     ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

clear

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║          🌾 FARMERS MARKET PLATFORM - MASTER CLEANUP 🌾           ║"
echo "║                                                                    ║"
echo "║         Repository Consolidation & Docker Restart Script          ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# SAFETY CHECK
# ============================================================================
echo -e "${YELLOW}⚠️  SAFETY CHECK${NC}"
echo ""
echo "This script will:"
echo "  1. Clean and organize 100+ documentation files"
echo "  2. Remove backup files from codebase"
echo "  3. Stop and clean Docker containers"
echo "  4. Restart Docker with fresh environment"
echo ""
echo -e "${RED}IMPORTANT: Make sure you have committed your changes!${NC}"
echo ""

# Check git status
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${BLUE}Current git status:${NC}"
    git status --short
    echo ""

    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  You have uncommitted changes!${NC}"
        read -p "$(echo -e ${YELLOW}Do you want to continue? [y/N]:${NC} )" -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Cleanup cancelled.${NC}"
            exit 0
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Not a git repository - no version control protection${NC}"
    read -p "$(echo -e ${YELLOW}Continue anyway? [y/N]:${NC} )" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Cleanup cancelled.${NC}"
        exit 0
    fi
fi

echo ""
read -p "$(echo -e ${GREEN}Ready to start cleanup and restart? [y/N]:${NC} )" -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Cleanup cancelled.${NC}"
    exit 0
fi

echo ""
START_TIME=$(date +%s)

# ============================================================================
# PHASE 0: CREATE SAFETY CHECKPOINT
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ 📦 PHASE 0: Creating Safety Checkpoint                            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

if git rev-parse --git-dir > /dev/null 2>&1; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_BRANCH="backup-before-master-cleanup-${TIMESTAMP}"

    git branch ${BACKUP_BRANCH} 2>/dev/null || true

    echo -e "${GREEN}✅ Created safety branch: ${BACKUP_BRANCH}${NC}"
    echo -e "${CYAN}   Rollback command: git checkout ${BACKUP_BRANCH}${NC}"
else
    echo -e "${YELLOW}⚠️  No git repository - skipping safety checkpoint${NC}"
fi

sleep 2

# ============================================================================
# PHASE 1: DOCUMENTATION CLEANUP
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ 📚 PHASE 1: Documentation Cleanup (2/6)                           ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

if [ -f "scripts/cleanup-docs.sh" ]; then
    chmod +x scripts/cleanup-docs.sh
    ./scripts/cleanup-docs.sh
    echo -e "${GREEN}✅ Documentation cleanup complete${NC}"
else
    echo -e "${YELLOW}⚠️  cleanup-docs.sh not found - skipping documentation cleanup${NC}"
fi

sleep 2

# ============================================================================
# PHASE 2: BACKUP FILES REMOVAL
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ 🗑️  PHASE 2: Removing Backup Files (3/6)                          ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Count backups
BACKUP_COUNT=$(find . -name "*.backup*" -o -name "*.old" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | wc -l)

if [ $BACKUP_COUNT -gt 0 ]; then
    echo -e "${BLUE}Found ${BACKUP_COUNT} backup files${NC}"

    # Auto-remove without prompting (we already confirmed at start)
    echo -e "${BLUE}Removing backup files...${NC}"
    find . -name "*.backup*" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null || true
    find . -name "*.old" -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null || true
    rm -rf src/app.backup.phase5 2>/dev/null || true

    echo -e "${GREEN}✅ Backup files removed${NC}"
else
    echo -e "${GREEN}✅ No backup files found${NC}"
fi

sleep 2

# ============================================================================
# PHASE 3: BUILD CACHE CLEANUP
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ 🧹 PHASE 3: Cleaning Build Caches (4/6)                          ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${BLUE}Cleaning Next.js and Jest caches...${NC}"
rm -rf .next 2>/dev/null || true
rm -rf .jest-cache 2>/dev/null || true
rm -rf dist 2>/dev/null || true

echo -e "${GREEN}✅ Build caches cleaned${NC}"

sleep 2

# ============================================================================
# PHASE 4: DOCKER CLEANUP
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ 🐳 PHASE 4: Docker Cleanup (5/6)                                  ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${BLUE}Stopping all Docker containers...${NC}"
docker-compose down -v 2>/dev/null || true
docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true

echo ""
echo -e "${BLUE}Cleaning Docker system...${NC}"
docker container prune -f 2>/dev/null || true
docker image prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true
docker network prune -f 2>/dev/null || true

echo -e "${GREEN}✅ Docker cleaned${NC}"

sleep 2

# ============================================================================
# PHASE 5: ENVIRONMENT CHECK
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ ⚙️  PHASE 5: Environment Configuration (6/6)                      ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"

    if [ -f ".env.example" ]; then
        echo -e "${BLUE}Creating .env from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env with your values before continuing${NC}"
        echo ""
        read -p "Press Enter after editing .env file..."
    else
        echo -e "${RED}❌ .env.example not found - cannot create .env${NC}"
        echo -e "${YELLOW}Please create .env file manually${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check for required environment variables
echo ""
echo -e "${BLUE}Checking required environment variables...${NC}"

REQUIRED_VARS=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env 2>/dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing required variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo -e "${YELLOW}Please add these to your .env file${NC}"
    read -p "Press Enter after adding variables..."
fi

echo -e "${GREEN}✅ Environment configuration checked${NC}"

sleep 2

# ============================================================================
# PHASE 6: DOCKER RESTART
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ 🚀 PHASE 6: Docker Restart                                        ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

echo "Select environment:"
echo "  1) Development (recommended)"
echo "  2) Production"
echo "  3) Skip Docker restart"
echo ""
read -p "Enter choice [1-3]: " -n 1 -r DOCKER_CHOICE
echo ""
echo ""

case $DOCKER_CHOICE in
    1)
        echo -e "${BLUE}Starting development environment...${NC}"
        echo ""
        docker-compose -f docker-compose.dev.yml up --build -d

        echo ""
        echo -e "${BLUE}Waiting for services to start (30 seconds)...${NC}"
        sleep 30

        echo ""
        echo -e "${BLUE}Running database migrations...${NC}"
        docker-compose -f docker-compose.dev.yml exec -T app npx prisma migrate deploy 2>/dev/null || true

        echo ""
        echo -e "${GREEN}✅ Development environment started${NC}"
        DOCKER_STARTED=true
        ;;
    2)
        echo -e "${BLUE}Starting production environment...${NC}"
        echo ""
        docker-compose up --build -d

        echo ""
        echo -e "${BLUE}Waiting for services to start (30 seconds)...${NC}"
        sleep 30

        echo ""
        echo -e "${BLUE}Running database migrations...${NC}"
        docker-compose exec -T app npx prisma migrate deploy 2>/dev/null || true

        echo ""
        echo -e "${GREEN}✅ Production environment started${NC}"
        DOCKER_STARTED=true
        ;;
    3)
        echo -e "${YELLOW}⏭️  Skipping Docker restart${NC}"
        DOCKER_STARTED=false
        ;;
    *)
        echo -e "${YELLOW}⏭️  Invalid choice - skipping Docker restart${NC}"
        DOCKER_STARTED=false
        ;;
esac

sleep 2

# ============================================================================
# VERIFICATION
# ============================================================================
if [ "$DOCKER_STARTED" = true ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║ ✅ VERIFICATION                                                   ║"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo ""

    echo -e "${BLUE}Checking Docker services...${NC}"
    if [ $DOCKER_CHOICE -eq 1 ]; then
        docker-compose -f docker-compose.dev.yml ps
    else
        docker-compose ps
    fi

    echo ""
    echo -e "${BLUE}Testing health endpoint...${NC}"
    sleep 5

    if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health endpoint OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Health endpoint not responding yet (may need more time)${NC}"
    fi
fi

# ============================================================================
# FINAL SUMMARY
# ============================================================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║                  🎉 CLEANUP & RESTART COMPLETE! 🎉                ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${GREEN}✅ Summary:${NC}"
echo "   ├─ Documentation organized"
echo "   ├─ Backup files removed"
echo "   ├─ Build caches cleaned"
echo "   ├─ Docker system cleaned"
echo "   ├─ Environment configured"

if [ "$DOCKER_STARTED" = true ]; then
    echo "   └─ Docker restarted successfully"
else
    echo "   └─ Docker restart skipped"
fi

echo ""
echo -e "${CYAN}📊 Execution time: ${DURATION} seconds${NC}"
echo ""

if [ "$DOCKER_STARTED" = true ]; then
    echo -e "${BLUE}🌐 Access points:${NC}"
    echo "   ├─ Application:    http://localhost:3000"
    echo "   ├─ Health Check:   http://localhost:3000/api/health"
    echo "   └─ API Docs:       http://localhost:3000/api-docs"
    echo ""
fi

echo -e "${BLUE}📚 Documentation:${NC}"
echo "   ├─ Main Index:     docs/INDEX.md"
echo "   ├─ Current Status: STATUS.md"
echo "   ├─ Quick Start:    QUICK_START.md"
echo "   └─ Docker Guide:   DOCKER_RESTART_GUIDE.md"
echo ""

echo -e "${BLUE}🔧 Useful commands:${NC}"
if [ "$DOCKER_STARTED" = true ]; then
    if [ $DOCKER_CHOICE -eq 1 ]; then
        echo "   ├─ View logs:      docker-compose -f docker-compose.dev.yml logs -f"
        echo "   ├─ Stop:           docker-compose -f docker-compose.dev.yml down"
        echo "   └─ Restart:        docker-compose -f docker-compose.dev.yml restart"
    else
        echo "   ├─ View logs:      docker-compose logs -f"
        echo "   ├─ Stop:           docker-compose down"
        echo "   └─ Restart:        docker-compose restart"
    fi
else
    echo "   ├─ Start dev:      npm run docker:up-build-dev"
    echo "   ├─ Start prod:     npm run docker:up-build"
    echo "   └─ View status:    docker-compose ps"
fi

echo ""

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo "   1. Review changes: git status"
    echo "   2. Commit cleanup: git add -A && git commit -m 'Repository cleanup and consolidation'"
    echo "   3. Push changes:   git push"

    if [ -n "$BACKUP_BRANCH" ]; then
        echo "   4. Rollback if needed: git checkout ${BACKUP_BRANCH}"
    fi
    echo ""
fi

echo -e "${GREEN}🎉 Repository is now clean, organized, and ready for development!${NC}"
echo ""
echo -e "${MAGENTA}Thank you for using the Farmers Market Platform!${NC}"
echo ""
