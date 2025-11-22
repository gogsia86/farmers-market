#!/usr/bin/env pwsh
# ============================================================================
# DOCKER SETUP SCRIPT
# Divine Docker Environment Setup and Validation
# ============================================================================

param(
    [switch]$Build,
    [switch]$Start,
    [switch]$Stop,
    [switch]$Clean,
    [switch]$Logs,
    [switch]$Validate,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# ============================================================================
# FUNCTIONS
# ============================================================================

function Show-Help {
    Write-Host @"
🐳 DOCKER SETUP SCRIPT - Divine Agricultural Platform
============================================================================

USAGE:
  .\scripts\docker-setup.ps1 [OPTIONS]

OPTIONS:
  -Build      Build Docker images
  -Start      Start Docker containers
  -Stop       Stop Docker containers
  -Clean      Clean Docker images and containers
  -Logs       Show Docker logs
  -Validate   Validate Docker setup
  -Help       Show this help message

EXAMPLES:
  # Build and start:
  .\scripts\docker-setup.ps1 -Build -Start

  # Stop all containers:
  .\scripts\docker-setup.ps1 -Stop

  # Clean everything:
  .\scripts\docker-setup.ps1 -Clean

  # Validate setup:
  .\scripts\docker-setup.ps1 -Validate

"@ -ForegroundColor Cyan
}

function Test-DockerInstalled {
    Write-Host "🔍 Checking Docker installation..." -ForegroundColor Yellow

    try {
        $dockerVersion = docker --version
        Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green

        $composeVersion = docker compose version
        Write-Host "✅ Docker Compose installed: $composeVersion" -ForegroundColor Green

        return $true
    } catch {
        Write-Host "❌ Docker is not installed or not running!" -ForegroundColor Red
        Write-Host "   Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        return $false
    }
}

function Test-EnvFile {
    Write-Host "🔍 Checking .env file..." -ForegroundColor Yellow

    if (Test-Path ".env") {
        Write-Host "✅ .env file exists" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
        Write-Host "   Creating from .env.example..." -ForegroundColor Yellow

        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "✅ .env file created from .env.example" -ForegroundColor Green
            Write-Host "   Please update .env with your configuration!" -ForegroundColor Yellow
            return $true
        } else {
            Write-Host "❌ .env.example not found!" -ForegroundColor Red
            return $false
        }
    }
}

function Build-DockerImages {
    Write-Host "`n🏗️  Building Docker images..." -ForegroundColor Cyan

    try {
        docker compose build --no-cache
        Write-Host "✅ Docker images built successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to build Docker images!" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

function Start-DockerContainers {
    Write-Host "`n🚀 Starting Docker containers..." -ForegroundColor Cyan

    try {
        docker compose up -d
        Write-Host "✅ Docker containers started successfully!" -ForegroundColor Green

        Write-Host "`n📊 Container Status:" -ForegroundColor Yellow
        docker compose ps

        Write-Host "`n🌐 Application URLs:" -ForegroundColor Cyan
        Write-Host "   Application: http://localhost:3000" -ForegroundColor Green
        Write-Host "   Database:    postgresql://localhost:5432/farmersmarket" -ForegroundColor Green
        Write-Host "   Redis:       redis://localhost:6379" -ForegroundColor Green

    } catch {
        Write-Host "❌ Failed to start Docker containers!" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

function Stop-DockerContainers {
    Write-Host "`n🛑 Stopping Docker containers..." -ForegroundColor Yellow

    try {
        docker compose down
        Write-Host "✅ Docker containers stopped successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to stop Docker containers!" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

function Remove-DockerResources {
    Write-Host "`n🧹 Cleaning Docker resources..." -ForegroundColor Yellow

    $confirm = Read-Host "This will remove all containers, images, and volumes. Continue? (y/N)"
    if ($confirm -ne 'y') {
        Write-Host "Cleanup cancelled." -ForegroundColor Yellow
        return
    }

    try {
        # Stop containers
        docker compose down

        # Remove volumes
        docker compose down -v

        # Remove images
        docker rmi $(docker images -q farmers-market* 2>$null) 2>$null

        # Prune system
        docker system prune -f

        Write-Host "✅ Docker resources cleaned successfully!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Cleanup completed with warnings" -ForegroundColor Yellow
    }
}

function Show-DockerLogs {
    Write-Host "`n📋 Docker Logs:" -ForegroundColor Cyan

    try {
        docker compose logs -f --tail=100
    } catch {
        Write-Host "❌ Failed to show logs!" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

function Test-DockerSetup {
    Write-Host "`n🔍 Validating Docker Setup..." -ForegroundColor Cyan

    $allGood = $true

    # Check Docker
    if (-not (Test-DockerInstalled)) {
        $allGood = $false
    }

    # Check .env
    if (-not (Test-EnvFile)) {
        $allGood = $false
    }

    # Check Dockerfile
    if (Test-Path "Dockerfile") {
        Write-Host "✅ Dockerfile exists" -ForegroundColor Green
    } else {
        Write-Host "❌ Dockerfile not found!" -ForegroundColor Red
        $allGood = $false
    }

    # Check docker-compose.yml
    if (Test-Path "docker-compose.yml") {
        Write-Host "✅ docker-compose.yml exists" -ForegroundColor Green
    } else {
        Write-Host "❌ docker-compose.yml not found!" -ForegroundColor Red
        $allGood = $false
    }

    # Check .dockerignore
    if (Test-Path ".dockerignore") {
        Write-Host "✅ .dockerignore exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .dockerignore not found (optional)" -ForegroundColor Yellow
    }

    # Check next.config.mjs
    if (Test-Path "next.config.mjs") {
        Write-Host "✅ next.config.mjs exists" -ForegroundColor Green

        $configContent = Get-Content "next.config.mjs" -Raw
        if ($configContent -match 'output.*standalone') {
            Write-Host "✅ Standalone output configured" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Standalone output not configured in next.config.mjs" -ForegroundColor Yellow
            Write-Host "   Add: output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined" -ForegroundColor Gray
        }
    }

    if ($allGood) {
        Write-Host "`n✅ Docker setup validation passed!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Docker setup validation failed!" -ForegroundColor Red
        Write-Host "   Please fix the issues above before proceeding." -ForegroundColor Yellow
    }

    return $allGood
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host @"
╔════════════════════════════════════════════════════════════════════════╗
║                    🐳 DOCKER SETUP SCRIPT                             ║
║              Divine Agricultural Platform - Docker Manager            ║
╚════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

if ($Help) {
    Show-Help
    exit 0
}

# Change to repository root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptPath
Set-Location $repoRoot

if ($Validate) {
    Test-DockerSetup
    exit 0
}

if ($Clean) {
    Remove-DockerResources
    exit 0
}

if ($Stop) {
    Stop-DockerContainers
    exit 0
}

if ($Logs) {
    Show-DockerLogs
    exit 0
}

# Default workflow: Validate -> Build -> Start
if ($Build -or $Start -or (-not $Build -and -not $Start)) {
    # Validate first
    if (-not (Test-DockerSetup)) {
        Write-Host "`n❌ Validation failed! Please fix issues before proceeding." -ForegroundColor Red
        exit 1
    }

    # Build if requested
    if ($Build -or (-not $Start)) {
        Build-DockerImages
    }

    # Start if requested
    if ($Start -or (-not $Build)) {
        Start-DockerContainers

        Write-Host "`n✨ To view logs, run:" -ForegroundColor Cyan
        Write-Host "   .\scripts\docker-setup.ps1 -Logs" -ForegroundColor White
    }
}

Write-Host "`n✅ Script completed successfully!" -ForegroundColor Green
