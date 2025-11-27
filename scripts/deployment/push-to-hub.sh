#!/bin/bash

# ============================================================================
# DOCKER HUB PUSH HELPER SCRIPT
# Farmers Market Platform - Push to Docker Hub
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🐋 DOCKER HUB PUSH - FARMERS MARKET PLATFORM 🚀          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
DOCKER_USERNAME="gogsiasdocker"
IMAGE_NAME="farmers-market-app"
VERSION="${1:-v1.0.0}"

# Full image reference
FULL_IMAGE="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
LATEST_IMAGE="${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

echo -e "${BLUE}🔍 Checking Docker configuration...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo -e "${YELLOW}💡 Please start Docker Desktop and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Check if user is logged in
AUTH_CHECK=$(docker info 2>/dev/null | grep -i username || echo "not_logged_in")

if [[ "$AUTH_CHECK" == "not_logged_in" ]]; then
    echo -e "${YELLOW}⚠️  Not logged in to Docker Hub${NC}"
    echo -e "${BLUE}🔐 Logging in to Docker Hub...${NC}"
    echo -e "${YELLOW}Please enter your credentials:${NC}"

    docker login

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Login failed!${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Successfully logged in${NC}"
else
    echo -e "${GREEN}✅ Already logged in to Docker Hub${NC}"
fi

# Check if image exists locally
echo -e "${BLUE}🔍 Checking if image exists locally...${NC}"
if ! docker image inspect "${FULL_IMAGE}" > /dev/null 2>&1; then
    echo -e "${RED}❌ Image ${FULL_IMAGE} not found locally!${NC}"
    echo -e "${YELLOW}💡 Available images:${NC}"
    docker images "${DOCKER_USERNAME}/${IMAGE_NAME}"
    exit 1
fi

echo -e "${GREEN}✅ Image found: ${FULL_IMAGE}${NC}"

# Show image details
IMAGE_SIZE=$(docker images "${FULL_IMAGE}" --format "{{.Size}}")
echo -e "${BLUE}📦 Image size: ${IMAGE_SIZE}${NC}"

# Push the version tag
echo ""
echo -e "${BLUE}🚀 Pushing ${FULL_IMAGE}...${NC}"
echo -e "${YELLOW}This may take a few minutes depending on your connection...${NC}"
echo ""

docker push "${FULL_IMAGE}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed ${FULL_IMAGE}${NC}"
else
    echo -e "${RED}❌ Failed to push ${FULL_IMAGE}${NC}"
    exit 1
fi

# Ask if user wants to tag and push as latest
echo ""
echo -e "${YELLOW}Do you want to tag and push this as 'latest'? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🏷️  Tagging as latest...${NC}"
    docker tag "${FULL_IMAGE}" "${LATEST_IMAGE}"

    echo -e "${BLUE}🚀 Pushing ${LATEST_IMAGE}...${NC}"
    docker push "${LATEST_IMAGE}"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed ${LATEST_IMAGE}${NC}"
    else
        echo -e "${RED}❌ Failed to push ${LATEST_IMAGE}${NC}"
        exit 1
    fi
fi

# Success summary
echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ PUSH COMPLETED SUCCESSFULLY! 🎉                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}📋 Pushed images:${NC}"
echo -e "   • ${FULL_IMAGE}"
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "   • ${LATEST_IMAGE}"
fi

echo ""
echo -e "${BLUE}🌐 View on Docker Hub:${NC}"
echo -e "   https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"

echo ""
echo -e "${BLUE}🚀 Pull command:${NC}"
echo -e "   docker pull ${FULL_IMAGE}"

echo ""
echo -e "${GREEN}🎊 Divine Agricultural Image Published! 🌾${NC}"
