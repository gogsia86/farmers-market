#!/usr/bin/env pwsh
# =============================================================================
# 🐳 DOCKER MANAGER - Divine Container Orchestration
# =============================================================================
# Purpose: Manage Docker containers for Farmers Market Platform
# Dependencies: Docker Desktop, docker-compose
# =============================================================================

param(
  [Parameter(Mandatory = $false)]
  [ValidateSet("up", "down", "restart", "status", "logs", "clean")]
  [string]$Action = "up",

  [Parameter(Mandatory = $false)]
  [switch]$Detached = $true,

  [Parameter(Mandatory = $false)]
  [switch]$Build = $false
)

# Color output functions
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Divine { param($msg) Write-Host "🌟 $msg" -ForegroundColor Magenta }

# =============================================================================
# DOCKER VALIDATION
# =============================================================================
function Test-DockerAvailable {
  Write-Info "Checking Docker availability..."

  try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
      Write-Success "Docker installed: $dockerVersion"
      return $true
    }
  }
  catch {
    Write-Error "Docker is not installed or not in PATH"
    Write-Info "Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
    return $false
  }

  return $false
}

function Test-DockerRunning {
  Write-Info "Checking Docker daemon status..."

  try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
      Write-Success "Docker daemon is running"
      return $true
    }
  }
  catch {
    Write-Error "Docker daemon is not running"
    Write-Info "Please start Docker Desktop"
    return $false
  }

  return $false
}

function Test-DockerComposeAvailable {
  Write-Info "Checking docker-compose availability..."

  try {
    # Try docker-compose (standalone)
    $composeVersion = docker-compose --version 2>$null
    if ($LASTEXITCODE -eq 0) {
      Write-Success "docker-compose installed: $composeVersion"
      return $true
    }
  }
  catch {}

  try {
    # Try docker compose (Docker CLI plugin)
    $composeVersion = docker compose version 2>$null
    if ($LASTEXITCODE -eq 0) {
      Write-Success "docker compose installed: $composeVersion"
      return $true
    }
  }
  catch {}

  Write-Error "docker-compose not found"
  Write-Info "Install docker-compose: https://docs.docker.com/compose/install/"
  return $false
}

# =============================================================================
# DOCKER-COMPOSE OPERATIONS
# =============================================================================
function Start-DockerServices {
  Write-Divine "🚀 Starting Docker services..."

  $composeFile = "docker-compose.yml"
  if (-not (Test-Path $composeFile)) {
    Write-Error "docker-compose.yml not found in current directory"
    Write-Info "Current directory: $(Get-Location)"
    return $false
  }

  $args = @("up")
  if ($Detached) { $args += "-d" }
  if ($Build) { $args += "--build" }

  Write-Info "Running: docker-compose $($args -join ' ')"

  try {
    # Try docker-compose first
    docker-compose @args
    if ($LASTEXITCODE -eq 0) {
      Write-Success "Services started successfully!"
      return $true
    }
  }
  catch {}

  try {
    # Try docker compose (Docker CLI plugin)
    docker compose @args
    if ($LASTEXITCODE -eq 0) {
      Write-Success "Services started successfully!"
      return $true
    }
  }
  catch {
    Write-Error "Failed to start services"
    return $false
  }

  return $false
}

function Stop-DockerServices {
  Write-Divine "🛑 Stopping Docker services..."

  try {
    docker-compose down 2>$null
    if ($LASTEXITCODE -eq 0) {
      Write-Success "Services stopped successfully!"
      return $true
    }
  }
  catch {}

  try {
    docker compose down 2>$null
    if ($LASTEXITCODE -eq 0) {
      Write-Success "Services stopped successfully!"
      return $true
    }
  }
  catch {
    Write-Error "Failed to stop services"
    return $false
  }

  return $false
}

function Restart-DockerServices {
  Write-Divine "🔄 Restarting Docker services..."

  Stop-DockerServices
  Start-Sleep -Seconds 2
  Start-DockerServices
}

function Get-DockerServicesStatus {
  Write-Divine "📊 Docker Services Status"
  Write-Host ""

  # Show running containers
  Write-Info "Running containers:"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  Write-Host ""

  # Show all containers (including stopped)
  Write-Info "All containers:"
  docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  Write-Host ""

  # Check specific services
  $services = @("farmers-market-db", "farmers-market-cache", "farmers-market-app")

  Write-Info "Service health:"
  foreach ($service in $services) {
    $container = docker ps --filter "name=$service" --format "{{.Names}}" 2>$null
    if ($container) {
      Write-Success "$service is running"
    }
    else {
      Write-Warning "$service is NOT running"
    }
  }
  Write-Host ""
}

function Get-DockerServiceLogs {
  Write-Divine "📋 Docker Service Logs"
  Write-Host ""

  $service = Read-Host "Enter service name (postgres, redis, app) or press Enter for all"

  if ([string]::IsNullOrWhiteSpace($service)) {
    Write-Info "Showing logs for all services..."
    try {
      docker-compose logs --tail=100 --follow
    }
    catch {
      docker compose logs --tail=100 --follow
    }
  }
  else {
    Write-Info "Showing logs for $service..."
    try {
      docker-compose logs --tail=100 --follow $service
    }
    catch {
      docker compose logs --tail=100 --follow $service
    }
  }
}

function Remove-DockerServices {
  Write-Divine "🧹 Cleaning Docker services..."

  $confirm = Read-Host "This will remove all containers, volumes, and networks. Continue? (yes/no)"

  if ($confirm -eq "yes") {
    Write-Info "Removing services..."
    try {
      docker-compose down -v --remove-orphans 2>$null
      if ($LASTEXITCODE -eq 0) {
        Write-Success "Services cleaned successfully!"
        return
      }
    }
    catch {}

    try {
      docker compose down -v --remove-orphans 2>$null
      if ($LASTEXITCODE -eq 0) {
        Write-Success "Services cleaned successfully!"
        return
      }
    }
    catch {
      Write-Error "Failed to clean services"
    }
  }
  else {
    Write-Info "Operation cancelled"
  }
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🐳 DOCKER MANAGER - Divine Container Orchestration" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Validate Docker
if (-not (Test-DockerAvailable)) {
  exit 1
}

if (-not (Test-DockerRunning)) {
  Write-Warning "Please start Docker Desktop and try again"
  exit 1
}

if (-not (Test-DockerComposeAvailable)) {
  exit 1
}

Write-Host ""

# Execute requested action
switch ($Action) {
  "up" {
    Start-DockerServices
    Write-Host ""
    Get-DockerServicesStatus
  }
  "down" {
    Stop-DockerServices
  }
  "restart" {
    Restart-DockerServices
    Write-Host ""
    Get-DockerServicesStatus
  }
  "status" {
    Get-DockerServicesStatus
  }
  "logs" {
    Get-DockerServiceLogs
  }
  "clean" {
    Remove-DockerServices
  }
}

Write-Host ""
Write-Divine "Docker management complete!"
Write-Host ""
