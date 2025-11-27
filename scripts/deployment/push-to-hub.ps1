# ============================================================================
# DOCKER HUB PUSH HELPER SCRIPT (PowerShell)
# Farmers Market Platform - Push to Docker Hub
# ============================================================================

param(
    [string]$Version = "v1.0.0",
    [switch]$SkipLatest,
    [switch]$Help
)

# Show help
if ($Help) {
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║  🐋 DOCKER HUB PUSH - FARMERS MARKET PLATFORM 🚀          ║
╚════════════════════════════════════════════════════════════╝

Usage:
  .\push-to-hub.ps1 [-Version <version>] [-SkipLatest] [-Help]

Parameters:
  -Version      Version tag to push (default: v1.0.0)
  -SkipLatest   Don't push the 'latest' tag
  -Help         Show this help message

Examples:
  .\push-to-hub.ps1
  .\push-to-hub.ps1 -Version v1.2.3
  .\push-to-hub.ps1 -Version v2.0.0 -SkipLatest

"@
    exit 0
}

# Configuration
$DOCKER_USERNAME = "gogsiasdocker"
$IMAGE_NAME = "farmers-market-app"
$FULL_IMAGE = "${DOCKER_USERNAME}/${IMAGE_NAME}:${Version}"
$LATEST_IMAGE = "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Header
Write-Info @"

╔════════════════════════════════════════════════════════════╗
║  🐋 DOCKER HUB PUSH - FARMERS MARKET PLATFORM 🚀          ║
╚════════════════════════════════════════════════════════════╝

"@

Write-Info "🔍 Checking Docker configuration..."

# Check if Docker is running
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Success "✅ Docker is running"
} catch {
    Write-Error "❌ Docker is not running!"
    Write-Warning "💡 Please start Docker Desktop and try again."
    exit 1
}

# Check if user is logged in
Write-Info "🔍 Checking Docker Hub authentication..."
$authInfo = docker info 2>$null | Select-String -Pattern "Username:" -Quiet

if (-not $authInfo) {
    Write-Warning "⚠️  Not logged in to Docker Hub"
    Write-Info "🔐 Logging in to Docker Hub..."
    Write-Warning "Please enter your credentials:"
    Write-Host ""

    docker login

    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Login failed!"
        exit 1
    }

    Write-Success "✅ Successfully logged in"
} else {
    Write-Success "✅ Already logged in to Docker Hub"
}

# Check if image exists locally
Write-Info "🔍 Checking if image exists locally..."
$imageExists = docker image inspect $FULL_IMAGE 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Image ${FULL_IMAGE} not found locally!"
    Write-Warning "💡 Available images:"
    docker images "${DOCKER_USERNAME}/${IMAGE_NAME}"
    exit 1
}

Write-Success "✅ Image found: ${FULL_IMAGE}"

# Show image details
$imageSize = docker images $FULL_IMAGE --format "{{.Size}}" 2>$null
Write-Info "📦 Image size: ${imageSize}"

# Push the version tag
Write-Host ""
Write-Info "🚀 Pushing ${FULL_IMAGE}..."
Write-Warning "This may take a few minutes depending on your connection..."
Write-Host ""

docker push $FULL_IMAGE

if ($LASTEXITCODE -eq 0) {
    Write-Success "✅ Successfully pushed ${FULL_IMAGE}"
} else {
    Write-Error "❌ Failed to push ${FULL_IMAGE}"
    exit 1
}

# Push latest tag if not skipped
if (-not $SkipLatest) {
    Write-Host ""
    $response = Read-Host "Do you want to tag and push this as 'latest'? (y/n)"

    if ($response -match '^[Yy]') {
        Write-Info "🏷️  Tagging as latest..."
        docker tag $FULL_IMAGE $LATEST_IMAGE

        Write-Info "🚀 Pushing ${LATEST_IMAGE}..."
        docker push $LATEST_IMAGE

        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ Successfully pushed ${LATEST_IMAGE}"
        } else {
            Write-Error "❌ Failed to push ${LATEST_IMAGE}"
            exit 1
        }
    }
}

# Success summary
Write-Host ""
Write-Success @"

╔════════════════════════════════════════════════════════════╗
║  ✅ PUSH COMPLETED SUCCESSFULLY! 🎉                        ║
╚════════════════════════════════════════════════════════════╝

"@

Write-Info "📋 Pushed images:"
Write-Host "   • ${FULL_IMAGE}"
if ($response -match '^[Yy]' -and -not $SkipLatest) {
    Write-Host "   • ${LATEST_IMAGE}"
}

Write-Host ""
Write-Info "🌐 View on Docker Hub:"
Write-Host "   https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"

Write-Host ""
Write-Info "🚀 Pull command:"
Write-Host "   docker pull ${FULL_IMAGE}"

Write-Host ""
Write-Info "🚀 Deploy command:"
Write-Host "   docker run -d -p 3000:3000 --env-file .env.production ${FULL_IMAGE}"

Write-Host ""
Write-Success "🎊 Divine Agricultural Image Published! 🌾"
Write-Host ""
