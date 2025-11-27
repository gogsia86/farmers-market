#!/bin/bash

# ============================================================================
# DOCKER HUB PUSH SCRIPT - Farmers Market Platform
# Automated script to tag and push images to Docker Hub
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_HUB_USERNAME="${DOCKER_HUB_USERNAME:-gogsiasdocker}"
IMAGE_NAME="farmers-market-app"
LOCAL_IMAGE="farmersmarketplatformwebandapp-app:latest"
VERSION="${VERSION:-v1.0.0}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🌾 Farmers Market Platform - Docker Hub Push Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# STEP 1: Verify Docker is running
# ============================================================================
echo -e "${YELLOW}[1/6]${NC} Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# ============================================================================
# STEP 2: Verify local image exists
# ============================================================================
echo -e "${YELLOW}[2/6]${NC} Checking for local image..."
if ! docker images | grep -q "$LOCAL_IMAGE"; then
    echo -e "${RED}❌ Error: Local image not found: $LOCAL_IMAGE${NC}"
    echo "Please build the image first with: docker-compose build"
    exit 1
fi

# Get image size
IMAGE_SIZE=$(docker images --format "{{.Repository}}:{{.Tag}}\t{{.Size}}" | grep "$LOCAL_IMAGE" | awk '{print $2}')
echo -e "${GREEN}✅ Local image found: $LOCAL_IMAGE ($IMAGE_SIZE)${NC}"
echo ""

# ============================================================================
# STEP 3: Docker Hub login
# ============================================================================
echo -e "${YELLOW}[3/6]${NC} Logging into Docker Hub..."
echo "Docker Hub Username: $DOCKER_HUB_USERNAME"
echo ""

# Check if already logged in
if docker info 2>/dev/null | grep -q "Username: $DOCKER_HUB_USERNAME"; then
    echo -e "${GREEN}✅ Already logged in to Docker Hub as $DOCKER_HUB_USERNAME${NC}"
else
    echo "Please enter your Docker Hub password:"
    if ! docker login -u "$DOCKER_HUB_USERNAME"; then
        echo -e "${RED}❌ Docker Hub login failed!${NC}"
        echo "Please check your credentials and try again."
        exit 1
    fi
    echo -e "${GREEN}✅ Successfully logged in to Docker Hub${NC}"
fi
echo ""

# ============================================================================
# STEP 4: Tag images
# ============================================================================
echo -e "${YELLOW}[4/6]${NC} Tagging images..."

# Tag with version
VERSION_TAG="$DOCKER_HUB_USERNAME/$IMAGE_NAME:$VERSION"
echo "  → Tagging as $VERSION_TAG"
docker tag "$LOCAL_IMAGE" "$VERSION_TAG"

# Tag as latest
LATEST_TAG="$DOCKER_HUB_USERNAME/$IMAGE_NAME:latest"
echo "  → Tagging as $LATEST_TAG"
docker tag "$LOCAL_IMAGE" "$LATEST_TAG"

echo -e "${GREEN}✅ Images tagged successfully${NC}"
echo ""

# ============================================================================
# STEP 5: Push images to Docker Hub
# ============================================================================
echo -e "${YELLOW}[5/6]${NC} Pushing images to Docker Hub..."
echo "This may take a few minutes depending on your internet connection..."
echo ""

# Push version tag
echo -e "${BLUE}Pushing version tag: $VERSION${NC}"
if docker push "$VERSION_TAG"; then
    echo -e "${GREEN}✅ Version tag pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push version tag${NC}"
    exit 1
fi
echo ""

# Push latest tag
echo -e "${BLUE}Pushing latest tag${NC}"
if docker push "$LATEST_TAG"; then
    echo -e "${GREEN}✅ Latest tag pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push latest tag${NC}"
    exit 1
fi
echo ""

# ============================================================================
# STEP 6: Verify push
# ============================================================================
echo -e "${YELLOW}[6/6]${NC} Verifying pushed images..."

# Try to inspect the remote image
if docker manifest inspect "$VERSION_TAG" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Version tag verified on Docker Hub${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify version tag (might take a moment to sync)${NC}"
fi

if docker manifest inspect "$LATEST_TAG" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Latest tag verified on Docker Hub${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify latest tag (might take a moment to sync)${NC}"
fi
echo ""

# ============================================================================
# SUCCESS SUMMARY
# ============================================================================
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🎉 SUCCESS! Images pushed to Docker Hub                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📦 Published Images:${NC}"
echo "  • $VERSION_TAG"
echo "  • $LATEST_TAG"
echo ""
echo -e "${BLUE}🌐 Docker Hub URL:${NC}"
echo "  https://hub.docker.com/r/$DOCKER_HUB_USERNAME/$IMAGE_NAME"
echo ""
echo -e "${BLUE}📥 Pull Commands:${NC}"
echo "  docker pull $VERSION_TAG"
echo "  docker pull $LATEST_TAG"
echo ""
echo -e "${BLUE}🚀 Deploy on Any Server:${NC}"
echo "  1. docker pull $VERSION_TAG"
echo "  2. docker-compose up -d"
echo ""
echo -e "${GREEN}✅ Your application is now globally available!${NC}"
echo ""

# ============================================================================
# CLEANUP (Optional)
# ============================================================================
read -p "Do you want to remove local tags to save space? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing local tags..."
    docker rmi "$VERSION_TAG" 2>/dev/null || true
    docker rmi "$LATEST_TAG" 2>/dev/null || true
    echo -e "${GREEN}✅ Local tags removed${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Script completed successfully! 🎊${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
