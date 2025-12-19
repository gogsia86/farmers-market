#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🐳 DOCKER DEPLOYMENT VERIFICATION SCRIPT 🐳           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Check if containers are running
echo "Checking container status..."
docker-compose ps

echo ""
echo "Checking for required environment variables..."

# Check required env vars
REQUIRED_VARS=("NEXTAUTH_SECRET" "STRIPE_SECRET_KEY")
MISSING_VARS=0

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${YELLOW}⚠️  $var is not set${NC}"
        ((MISSING_VARS++))
    else
        echo -e "${GREEN}✅ $var is set${NC}"
    fi
done

echo ""

if [ $MISSING_VARS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Some required environment variables are missing${NC}"
    echo "Set them before deployment:"
    echo 'export NEXTAUTH_SECRET="$(openssl rand -base64 32)"'
    echo 'export STRIPE_SECRET_KEY="your-stripe-key"'
    echo ""
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT STATUS                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "To deploy:"
echo "  docker-compose up -d"
echo ""
echo "To check logs:"
echo "  docker-compose logs -f app"
echo ""
echo "To stop:"
echo "  docker-compose down"
echo ""
