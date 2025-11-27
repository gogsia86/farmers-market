# ============================================================================
# FARMERS MARKET PLATFORM - DOCKER PUSH SCRIPT (PowerShell)
# Build and Push Docker Images to Container Registry
# Version: 3.0 - Windows Edition
# ============================================================================

param(
    [switch]$Production = $true,
    [switch]$Development = $false,
    [switch]$Both = $false,
    [string]$Version = "latest",
    [string]$Registry = "docker.io",
    [string]$Namespace = "farmersmarket",
    [switch]$Push = $true,
    [switch]$NoPush = $false,
    [switch]$MultiPlatform = $false,
    [switch]$Cleanup = $false,
    [switch]$Help = $false
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

$ImageName = "farmers-market-app"
$ProductionTags = @()
$DevelopmentTags = @()

# Override from environment variables if set
if ($env:DOCKER_REGISTRY) { $Registry = $env:DOCKER_REGISTRY }
if ($env:DOCKER_NAMESPACE) { $Namespace = $env:DOCKER_NAMESPACE }
if ($env:VERSION) { $Version = $env:VERSION }

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [string]$Symbol = ""
    )

    if ($Symbol) {
        Write-Host "$Symbol " -NoNewline -ForegroundColor $Color
    }
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  [INFO] $Message" -Color Cyan
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ [SUCCESS] $Message" -Color Green
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  [WARNING] $Message" -Color Yellow
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ [ERROR] $Message" -Color Red
}

function Write-Divine {
    param([string]$Message)
    Write-ColorOutput "🌾 [DIVINE] $Message" -Color Magenta
}

function Write-Banner {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  🐋 FARMERS MARKET - DOCKER BUILD & PUSH 🚀              ║" -ForegroundColor Cyan
    Write-Host "║        Divine Agricultural Container Publishing            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Show-Usage {
    @"
Usage: .\docker-push.ps1 [OPTIONS]

Divine Agricultural Docker Build & Push Script

Options:
  -Production              Build production image (default: true)
  -Development             Build development image (default: false)
  -Both                    Build both production and development images

  -Version <version>       Set image version tag (default: latest or git tag)
  -Registry <registry>     Docker registry (default: docker.io)
  -Namespace <namespace>   Docker namespace (default: farmersmarket)

  -Push                    Push images to registry (default: true)
  -NoPush                  Build only, don't push

  -MultiPlatform           Build for multiple platforms (amd64, arm64)
  -Cleanup                 Remove old/dangling images after build

  -Help                    Show this help message

Environment Variables:
  `$env:DOCKER_REGISTRY    Override default registry
  `$env:DOCKER_NAMESPACE   Override default namespace
  `$env:VERSION            Override version tag

Examples:
  # Build and push production image
  .\docker-push.ps1

  # Build production and development images
  .\docker-push.ps1 -Both

  # Build with custom version
  .\docker-push.ps1 -Version v1.2.3

  # Build for multiple platforms
  .\docker-push.ps1 -MultiPlatform

  # Build without pushing
  .\docker-push.ps1 -NoPush

  # Build with custom registry
  .\docker-push.ps1 -Registry ghcr.io -Namespace myorg

  # Full custom build
  `$env:DOCKER_REGISTRY="ghcr.io"; `$env:VERSION="v2.0.0"; .\docker-push.ps1 -Both -MultiPlatform

"@
}

function Test-Prerequisites {
    Write-Section "Checking Prerequisites"

    # Check if Docker is installed
    try {
        $dockerVersion = docker --version
        Write-Success "Docker is installed: $dockerVersion"
    }
    catch {
        Write-Error "Docker is not installed. Please install Docker Desktop."
        exit 1
    }

    # Check if Docker daemon is running
    try {
        docker info | Out-Null
        Write-Success "Docker daemon is running"
    }
    catch {
        Write-Error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    }

    # Check if logged in to registry
    if (-not $NoPush -and $Push) {
        try {
            $dockerInfo = docker info 2>&1 | Select-String "Username"
            if (-not $dockerInfo) {
                Write-Warning "Not logged in to Docker registry"
                Write-Info "Run: docker login"

                $response = Read-Host "Do you want to login now? (y/N)"
                if ($response -eq 'y' -or $response -eq 'Y') {
                    docker login $Registry
                    if ($LASTEXITCODE -ne 0) {
                        Write-Error "Login failed"
                        exit 1
                    }
                    Write-Success "Successfully logged in"
                }
                else {
                    Write-Error "Cannot push without authentication"
                    exit 1
                }
            }
            else {
                Write-Success "Authenticated with Docker registry"
            }
        }
        catch {
            Write-Warning "Could not verify Docker authentication"
        }
    }

    # Check for multi-platform support if requested
    if ($MultiPlatform) {
        try {
            docker buildx version | Out-Null
            Write-Success "Docker Buildx available for multi-platform builds"
        }
        catch {
            Write-Error "Docker Buildx is required for multi-platform builds"
            Write-Info "Update Docker Desktop to the latest version"
            exit 1
        }
    }
}

function Get-GitInfo {
    $script:GitCommit = "unknown"
    $script:GitBranch = "unknown"
    $script:GitTag = ""

    if (Test-Path (Join-Path $ProjectRoot ".git")) {
        try {
            $script:GitCommit = git rev-parse --short HEAD 2>$null
            $script:GitBranch = git rev-parse --abbrev-ref HEAD 2>$null
            $script:GitTag = git describe --tags --exact-match 2>$null
        }
        catch {
            # Git commands failed, use defaults
        }
    }

    Write-Info "Git commit: $GitCommit"
    Write-Info "Git branch: $GitBranch"
    if ($GitTag) {
        Write-Info "Git tag: $GitTag"
        $script:Version = $GitTag
    }
}

function Build-ProductionImage {
    Write-Section "Building Production Image"

    $imageTag = "$Registry/$Namespace/${ImageName}:$Version"
    $latestTag = "$Registry/$Namespace/${ImageName}:latest"

    Write-Info "Building production image: $imageTag"
    Write-Info "Dockerfile: $ProjectRoot\Dockerfile"

    Push-Location $ProjectRoot

    try {
        if ($MultiPlatform) {
            Write-Info "Building for multiple platforms (linux/amd64, linux/arm64)"

            # Create builder if it doesn't exist
            $builderExists = docker buildx inspect farmers-market-builder 2>$null
            if (-not $builderExists) {
                Write-Info "Creating buildx instance..."
                docker buildx create --name farmers-market-builder --use
            }
            else {
                docker buildx use farmers-market-builder
            }

            $buildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            $pushFlag = if ($Push -and -not $NoPush) { "--push" } else { "--load" }

            docker buildx build `
                --platform linux/amd64,linux/arm64 `
                --build-arg BUILD_DATE="$buildDate" `
                --build-arg GIT_COMMIT="$GitCommit" `
                --build-arg GIT_BRANCH="$GitBranch" `
                --build-arg VERSION="$Version" `
                --tag $imageTag `
                --tag $latestTag `
                --file Dockerfile `
                $pushFlag `
                .

            if ($LASTEXITCODE -ne 0) {
                throw "Production image build failed"
            }
        }
        else {
            Write-Info "Building for current platform"

            $buildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

            docker build `
                --build-arg BUILD_DATE="$buildDate" `
                --build-arg GIT_COMMIT="$GitCommit" `
                --build-arg GIT_BRANCH="$GitBranch" `
                --build-arg VERSION="$Version" `
                --tag $imageTag `
                --tag $latestTag `
                --file Dockerfile `
                --progress=plain `
                .

            if ($LASTEXITCODE -ne 0) {
                throw "Production image build failed"
            }

            # Get image size
            $imageInfo = docker images $imageTag --format "{{.Size}}"
            Write-Success "Production image built successfully"
            Write-Info "Image size: $imageInfo"
        }

        $script:ProductionTags += @($imageTag, $latestTag)
    }
    catch {
        Write-Error $_.Exception.Message
        exit 1
    }
    finally {
        Pop-Location
    }
}

function Build-DevelopmentImage {
    Write-Section "Building Development Image"

    $imageTag = "$Registry/$Namespace/${ImageName}:${Version}-dev"
    $devTag = "$Registry/$Namespace/${ImageName}:dev"

    Write-Info "Building development image: $imageTag"
    Write-Info "Dockerfile: $ProjectRoot\Dockerfile.dev"

    Push-Location $ProjectRoot

    try {
        $buildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

        docker build `
            --build-arg BUILD_DATE="$buildDate" `
            --build-arg GIT_COMMIT="$GitCommit" `
            --build-arg GIT_BRANCH="$GitBranch" `
            --build-arg VERSION="$Version" `
            --tag $imageTag `
            --tag $devTag `
            --file Dockerfile.dev `
            --progress=plain `
            .

        if ($LASTEXITCODE -ne 0) {
            throw "Development image build failed"
        }

        $imageInfo = docker images $imageTag --format "{{.Size}}"
        Write-Success "Development image built successfully"
        Write-Info "Image size: $imageInfo"

        $script:DevelopmentTags += @($imageTag, $devTag)
    }
    catch {
        Write-Error $_.Exception.Message
        exit 1
    }
    finally {
        Pop-Location
    }
}

function Push-Images {
    if ($NoPush -or -not $Push) {
        Write-Warning "Skipping push (NoPush flag set)"
        return
    }

    Write-Section "Pushing Images to Registry"

    # Skip if multi-platform (already pushed during build)
    if ($MultiPlatform) {
        Write-Success "Images already pushed during multi-platform build"
        return
    }

    # Push production images
    if ($Production -or $Both) {
        Write-Info "Pushing production images..."
        foreach ($tag in $ProductionTags) {
            Write-Info "Pushing: $tag"
            docker push $tag
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to push $tag"
                exit 1
            }
            Write-Success "Pushed: $tag"
        }
    }

    # Push development images
    if ($Development -or $Both) {
        Write-Info "Pushing development images..."
        foreach ($tag in $DevelopmentTags) {
            Write-Info "Pushing: $tag"
            docker push $tag
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to push $tag"
                exit 1
            }
            Write-Success "Pushed: $tag"
        }
    }

    Write-Divine "All images pushed successfully to registry"
}

function Test-Images {
    Write-Section "Verifying Built Images"

    if ($Production -or $Both) {
        Write-Info "Verifying production image..."
        $result = docker run --rm $ProductionTags[0] node --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Production image verification failed"
            exit 1
        }
        Write-Success "Production image verified: $result"
    }

    if ($Development -or $Both) {
        Write-Info "Verifying development image..."
        $result = docker run --rm $DevelopmentTags[0] node --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Development image verification failed"
            exit 1
        }
        Write-Success "Development image verified: $result"
    }
}

function Remove-OldImages {
    Write-Section "Cleaning Up Old Images"

    Write-Info "Removing dangling images..."
    docker image prune -f | Out-Null

    Write-Info "Current images:"
    docker images | Select-String $ImageName

    Write-Success "Cleanup complete"
}

function Show-Summary {
    Write-Section "Build Summary"

    Write-Host ""
    Write-Divine "Divine Docker build complete with agricultural consciousness"
    Write-Host ""

    if ($Production -or $Both) {
        Write-Host "🚀 Production Images:" -ForegroundColor Cyan
        foreach ($tag in $ProductionTags) {
            Write-Host "  ✓ $tag" -ForegroundColor Green
        }
        Write-Host ""
    }

    if ($Development -or $Both) {
        Write-Host "🐋 Development Images:" -ForegroundColor Cyan
        foreach ($tag in $DevelopmentTags) {
            Write-Host "  ✓ $tag" -ForegroundColor Green
        }
        Write-Host ""
    }

    Write-Host "ℹ️  Image Details:" -ForegroundColor Cyan
    Write-Host "  Registry: $Registry" -ForegroundColor Yellow
    Write-Host "  Namespace: $Namespace" -ForegroundColor Yellow
    Write-Host "  Version: $Version" -ForegroundColor Yellow
    Write-Host "  Git Commit: $GitCommit" -ForegroundColor Yellow
    Write-Host "  Git Branch: $GitBranch" -ForegroundColor Yellow
    Write-Host ""

    if (-not $NoPush -and $Push) {
        Write-Host "✅ Images Available:" -ForegroundColor Cyan
        Write-Host "  docker pull $($ProductionTags[0])" -ForegroundColor Green
        Write-Host ""
    }

    Write-Host "ℹ️  Next Steps:" -ForegroundColor Cyan
    if ($NoPush -or -not $Push) {
        Write-Host "  1. Review built images: docker images | Select-String $ImageName" -ForegroundColor Yellow
        Write-Host "  2. Test locally: docker run $($ProductionTags[0])" -ForegroundColor Yellow
        Write-Host "  3. Push when ready: .\docker-push.ps1 -Push" -ForegroundColor Yellow
    }
    else {
        Write-Host "  1. Deploy to production: docker compose pull && docker compose up -d" -ForegroundColor Yellow
        Write-Host "  2. Monitor deployment: docker compose logs -f" -ForegroundColor Yellow
        Write-Host "  3. Verify health: curl http://your-domain/api/health" -ForegroundColor Yellow
    }
    Write-Host ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Main {
    # Show help if requested
    if ($Help) {
        Show-Usage
        exit 0
    }

    # Handle -Both flag
    if ($Both) {
        $script:Production = $true
        $script:Development = $true
    }

    # Handle -NoPush flag
    if ($NoPush) {
        $script:Push = $false
    }

    Write-Banner

    # Check prerequisites
    Test-Prerequisites

    # Get git information
    Get-GitInfo

    # Build images
    if ($Production) {
        Build-ProductionImage
    }

    if ($Development) {
        Build-DevelopmentImage
    }

    # Verify images
    Test-Images

    # Push to registry
    Push-Images

    # Cleanup if requested
    if ($Cleanup) {
        Remove-OldImages
    }

    # Show summary
    Show-Summary

    Write-Host ""
    Write-Divine "🌾⚡ DOCKER BUILD & PUSH COMPLETE ⚡🌾"
    Write-Host ""
}

# Run main function
Main
