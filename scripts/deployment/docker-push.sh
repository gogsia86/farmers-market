#!/bin/bash

# ============================================================================
# FARMERS MARKET PLATFORM - DOCKER PUSH SCRIPT
# Build and Push Docker Images to Container Registry
# Version: 3.0
# ============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default registry and image names
REGISTRY="${DOCKER_REGISTRY:-docker.io}"
NAMESPACE="${DOCKER_NAMESPACE:-gogsiasdocker}"
IMAGE_NAME="farmers-market-app"
VERSION="${VERSION:-latest}"

# Build targets
BUILD_PRODUCTION=true
BUILD_DEVELOPMENT=false
PUSH_IMAGES=true
MULTI_PLATFORM=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Divine symbols
SYMBOL_SUCCESS="✅"
SYMBOL_ERROR="❌"
SYMBOL_WARNING="⚠️"
SYMBOL_INFO="ℹ️"
SYMBOL_ROCKET="🚀"
SYMBOL_DOCKER="🐋"
SYMBOL_WHEAT="🌾"
SYMBOL_LIGHTNING="⚡"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}${SYMBOL_INFO} [INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}${SYMBOL_SUCCESS} [SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}${SYMBOL_WARNING} [WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}${SYMBOL_ERROR} [ERROR]${NC} $1"
}

log_divine() {
    echo -e "${PURPLE}${SYMBOL_WHEAT} [DIVINE]${NC} $1"
}

print_banner() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  ${SYMBOL_DOCKER} FARMERS MARKET - DOCKER BUILD & PUSH ${SYMBOL_ROCKET}      ║${NC}"
    echo -e "${CYAN}║        Divine Agricultural Container Publishing            ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_prerequisites() {
    print_section "Checking Prerequisites"

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_success "Docker is installed: $(docker --version)"

    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
    log_success "Docker daemon is running"

    # Check if logged in to registry
    if [ "$PUSH_IMAGES" = true ]; then
        if ! docker info | grep -q "Username"; then
            log_warning "Not logged in to Docker registry"
            log_info "Run: docker login"
            read -p "Do you want to login now? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker login "$REGISTRY" || {
                    log_error "Login failed"
                    exit 1
                }
                log_success "Successfully logged in"
            else
                log_error "Cannot push without authentication"
                exit 1
            fi
        else
            log_success "Authenticated with Docker registry"
        fi
    fi

    # Check for multi-platform support if requested
    if [ "$MULTI_PLATFORM" = true ]; then
        if ! docker buildx version &> /dev/null; then
            log_error "Docker Buildx is required for multi-platform builds"
            log_info "Update Docker Desktop to the latest version"
            exit 1
        fi
        log_success "Docker Buildx available for multi-platform builds"
    fi
}

get_git_info() {
    if command -v git &> /dev/null && [ -d .git ]; then
        GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        GIT_TAG=$(git describe --tags --exact-match 2>/dev/null || echo "")
    else
        GIT_COMMIT="unknown"
        GIT_BRANCH="unknown"
        GIT_TAG=""
    fi

    log_info "Git commit: $GIT_COMMIT"
    log_info "Git branch: $GIT_BRANCH"
    if [ -n "$GIT_TAG" ]; then
        log_info "Git tag: $GIT_TAG"
        VERSION="$GIT_TAG"
    fi
}

build_production_image() {
    print_section "Building Production Image"

    local image_tag="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}"
    local latest_tag="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:latest"

    log_info "Building production image: $image_tag"
    log_info "Dockerfile: ${PROJECT_ROOT}/Dockerfile"

    cd "$PROJECT_ROOT"

    if [ "$MULTI_PLATFORM" = true ]; then
        log_info "Building for multiple platforms (linux/amd64, linux/arm64)"

        # Create builder if it doesn't exist
        if ! docker buildx inspect farmers-market-builder &> /dev/null; then
            log_info "Creating buildx instance..."
            docker buildx create --name farmers-market-builder --use
        else
            docker buildx use farmers-market-builder
        fi

        docker buildx build \
            --platform linux/amd64,linux/arm64 \
            --build-arg BUILD_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
            --build-arg GIT_COMMIT="$GIT_COMMIT" \
            --build-arg GIT_BRANCH="$GIT_BRANCH" \
            --build-arg VERSION="$VERSION" \
            --tag "$image_tag" \
            --tag "$latest_tag" \
            --file Dockerfile \
            $([ "$PUSH_IMAGES" = true ] && echo "--push" || echo "--load") \
            . || {
            log_error "Production image build failed"
            exit 1
        }
    else
        log_info "Building for current platform"

        docker build \
            --build-arg BUILD_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
            --build-arg GIT_COMMIT="$GIT_COMMIT" \
            --build-arg GIT_BRANCH="$GIT_BRANCH" \
            --build-arg VERSION="$VERSION" \
            --tag "$image_tag" \
            --tag "$latest_tag" \
            --file Dockerfile \
            --progress=plain \
            . || {
            log_error "Production image build failed"
            exit 1
        }

        # Get image size
        IMAGE_SIZE=$(docker images "$image_tag" --format "{{.Size}}")
        log_success "Production image built successfully"
        log_info "Image size: $IMAGE_SIZE"
    fi

    # Save tags for pushing
    PRODUCTION_TAGS=("$image_tag" "$latest_tag")
}

build_development_image() {
    print_section "Building Development Image"

    local image_tag="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}-dev"
    local dev_tag="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:dev"

    log_info "Building development image: $image_tag"
    log_info "Dockerfile: ${PROJECT_ROOT}/Dockerfile.dev"

    cd "$PROJECT_ROOT"

    docker build \
        --build-arg BUILD_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
        --build-arg GIT_COMMIT="$GIT_COMMIT" \
        --build-arg GIT_BRANCH="$GIT_BRANCH" \
        --build-arg VERSION="$VERSION" \
        --tag "$image_tag" \
        --tag "$dev_tag" \
        --file Dockerfile.dev \
        --progress=plain \
        . || {
        log_error "Development image build failed"
        exit 1
    }

    IMAGE_SIZE=$(docker images "$image_tag" --format "{{.Size}}")
    log_success "Development image built successfully"
    log_info "Image size: $IMAGE_SIZE"

    # Save tags for pushing
    DEVELOPMENT_TAGS=("$image_tag" "$dev_tag")
}

push_images() {
    if [ "$PUSH_IMAGES" = false ]; then
        log_warning "Skipping push (--no-push flag set)"
        return
    fi

    print_section "Pushing Images to Registry"

    # Skip if multi-platform (already pushed during build)
    if [ "$MULTI_PLATFORM" = true ]; then
        log_success "Images already pushed during multi-platform build"
        return
    fi

    # Push production images
    if [ "$BUILD_PRODUCTION" = true ]; then
        log_info "Pushing production images..."
        for tag in "${PRODUCTION_TAGS[@]}"; do
            log_info "Pushing: $tag"
            docker push "$tag" || {
                log_error "Failed to push $tag"
                exit 1
            }
            log_success "Pushed: $tag"
        done
    fi

    # Push development images
    if [ "$BUILD_DEVELOPMENT" = true ]; then
        log_info "Pushing development images..."
        for tag in "${DEVELOPMENT_TAGS[@]}"; do
            log_info "Pushing: $tag"
            docker push "$tag" || {
                log_error "Failed to push $tag"
                exit 1
            }
            log_success "Pushed: $tag"
        done
    fi

    log_divine "All images pushed successfully to registry"
}

verify_images() {
    print_section "Verifying Built Images"

    if [ "$BUILD_PRODUCTION" = true ]; then
        log_info "Verifying production image..."
        docker run --rm "${PRODUCTION_TAGS[0]}" node --version || {
            log_error "Production image verification failed"
            exit 1
        }
        log_success "Production image verified"
    fi

    if [ "$BUILD_DEVELOPMENT" = true ]; then
        log_info "Verifying development image..."
        docker run --rm "${DEVELOPMENT_TAGS[0]}" node --version || {
            log_error "Development image verification failed"
            exit 1
        }
        log_success "Development image verified"
    fi
}

cleanup_old_images() {
    print_section "Cleaning Up Old Images"

    log_info "Removing dangling images..."
    docker image prune -f > /dev/null 2>&1 || true

    log_info "Current images:"
    docker images | grep "$IMAGE_NAME" || echo "No images found"

    log_success "Cleanup complete"
}

show_summary() {
    print_section "Build Summary"

    echo ""
    log_divine "Divine Docker build complete with agricultural consciousness"
    echo ""

    if [ "$BUILD_PRODUCTION" = true ]; then
        echo -e "${CYAN}${SYMBOL_ROCKET} Production Images:${NC}"
        for tag in "${PRODUCTION_TAGS[@]}"; do
            echo -e "  ${GREEN}✓${NC} $tag"
        done
        echo ""
    fi

    if [ "$BUILD_DEVELOPMENT" = true ]; then
        echo -e "${CYAN}${SYMBOL_DOCKER} Development Images:${NC}"
        for tag in "${DEVELOPMENT_TAGS[@]}"; do
            echo -e "  ${GREEN}✓${NC} $tag"
        done
        echo ""
    fi

    echo -e "${CYAN}${SYMBOL_INFO} Image Details:${NC}"
    echo -e "  ${YELLOW}Registry:${NC} $REGISTRY"
    echo -e "  ${YELLOW}Namespace:${NC} $NAMESPACE"
    echo -e "  ${YELLOW}Version:${NC} $VERSION"
    echo -e "  ${YELLOW}Git Commit:${NC} $GIT_COMMIT"
    echo -e "  ${YELLOW}Git Branch:${NC} $GIT_BRANCH"
    echo ""

    if [ "$PUSH_IMAGES" = true ]; then
        echo -e "${CYAN}${SYMBOL_SUCCESS} Images Available:${NC}"
        echo -e "  ${GREEN}docker pull ${PRODUCTION_TAGS[0]}${NC}"
        echo ""
    fi

    echo -e "${CYAN}${SYMBOL_INFO} Next Steps:${NC}"
    if [ "$PUSH_IMAGES" = false ]; then
        echo -e "  ${YELLOW}1.${NC} Review built images: docker images | grep $IMAGE_NAME"
        echo -e "  ${YELLOW}2.${NC} Test locally: docker run ${PRODUCTION_TAGS[0]}"
        echo -e "  ${YELLOW}3.${NC} Push when ready: $0 --push"
    else
        echo -e "  ${YELLOW}1.${NC} Deploy to production: docker compose pull && docker compose up -d"
        echo -e "  ${YELLOW}2.${NC} Monitor deployment: docker compose logs -f"
        echo -e "  ${YELLOW}3.${NC} Verify health: curl http://your-domain/api/health"
    fi
    echo ""
}

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Divine Agricultural Docker Build & Push Script

Options:
  --production              Build production image (default: true)
  --development             Build development image (default: false)
  --both                    Build both production and development images

  --version <version>       Set image version tag (default: latest or git tag)
  --registry <registry>     Docker registry (default: docker.io)
  --namespace <namespace>   Docker namespace (default: farmersmarket)

  --push                    Push images to registry (default: true)
  --no-push                 Build only, don't push

  --multi-platform          Build for multiple platforms (amd64, arm64)
  --cleanup                 Remove old/dangling images after build

  --help, -h                Show this help message

Environment Variables:
  DOCKER_REGISTRY           Override default registry
  DOCKER_NAMESPACE          Override default namespace
  VERSION                   Override version tag

Examples:
  # Build and push production image
  $0

  # Build production and development images
  $0 --both

  # Build with custom version
  $0 --version v1.2.3

  # Build for multiple platforms
  $0 --multi-platform

  # Build without pushing
  $0 --no-push

  # Build with custom registry
  $0 --registry ghcr.io --namespace myorg

  # Full custom build
  DOCKER_REGISTRY=ghcr.io VERSION=v2.0.0 $0 --both --multi-platform

EOF
}

# ============================================================================
# MAIN FUNCTION
# ============================================================================

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --production)
                BUILD_PRODUCTION=true
                BUILD_DEVELOPMENT=false
                shift
                ;;
            --development)
                BUILD_PRODUCTION=false
                BUILD_DEVELOPMENT=true
                shift
                ;;
            --both)
                BUILD_PRODUCTION=true
                BUILD_DEVELOPMENT=true
                shift
                ;;
            --version)
                VERSION="$2"
                shift 2
                ;;
            --registry)
                REGISTRY="$2"
                shift 2
                ;;
            --namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            --push)
                PUSH_IMAGES=true
                shift
                ;;
            --no-push)
                PUSH_IMAGES=false
                shift
                ;;
            --multi-platform)
                MULTI_PLATFORM=true
                shift
                ;;
            --cleanup)
                CLEANUP=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    print_banner

    # Check prerequisites
    check_prerequisites

    # Get git information
    get_git_info

    # Build images
    if [ "$BUILD_PRODUCTION" = true ]; then
        build_production_image
    fi

    if [ "$BUILD_DEVELOPMENT" = true ]; then
        build_development_image
    fi

    # Verify images
    verify_images

    # Push to registry
    push_images

    # Cleanup if requested
    if [ "${CLEANUP:-false}" = true ]; then
        cleanup_old_images
    fi

    # Show summary
    show_summary

    echo ""
    log_divine "${SYMBOL_WHEAT}${SYMBOL_LIGHTNING} DOCKER BUILD & PUSH COMPLETE ${SYMBOL_LIGHTNING}${SYMBOL_WHEAT}"
    echo ""
}

# Run main function
main "$@"
