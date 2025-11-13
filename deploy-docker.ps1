#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deploy Farmers Market Platform to Docker

.DESCRIPTION
    Automated deployment script for Docker containers with health checks and validation

.PARAMETER Action
    Action to perform: build, start, stop, restart, logs, clean

.PARAMETER Environment
    Environment to deploy: development, production (default: production)

.EXAMPLE
    .\deploy-docker.ps1 -Action build
    .\deploy-docker.ps1 -Action start
    .\deploy-docker.ps1 -Action logs

.NOTES
    Author: Farmers Market Platform Team
    Date: November 12, 2025
#>

param(
  [Parameter(Mandatory = $false)]
  [ValidateSet('build', 'start', 'stop', 'restart', 'logs', 'clean', 'status', 'seed')]
  [string]$Action = 'start',

  [Parameter(Mandatory = $false)]
  [ValidateSet('development', 'production')]
  [string]$Environment = 'production'
)

# Colors
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-Header {
  param([string]$Message)
  Write-Host ""
  Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $InfoColor
  Write-Host "  $Message" -ForegroundColor $InfoColor
  Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $InfoColor
  Write-Host ""
}

function Write-Success {
  param([string]$Message)
  Write-Host "✅ $Message" -ForegroundColor $SuccessColor
}

function Write-Error {
  param([string]$Message)
  Write-Host "❌ $Message" -ForegroundColor $ErrorColor
}

function Write-Info {
  param([string]$Message)
  Write-Host "ℹ️  $Message" -ForegroundColor $InfoColor
}

function Write-Warning {
  param([string]$Message)
  Write-Host "⚠️  $Message" -ForegroundColor $WarningColor
}

function Test-DockerInstalled {
  try {
    $null = docker --version 2>&1
    return $true
  }
  catch {
    return $false
  }
}

function Test-DockerRunning {
  try {
    $null = docker ps 2>&1
    return $true
  }
  catch {
    return $false
  }
}

function Test-EnvFile {
  if (-not (Test-Path ".env.docker")) {
    Write-Warning ".env.docker file not found!"
    Write-Info "Creating .env.docker from template..."

    if (Test-Path ".env.example") {
      Copy-Item ".env.example" ".env.docker"
      Write-Success "Created .env.docker from .env.example"
      Write-Warning "Please edit .env.docker with your configuration before continuing"
      return $false
    }
    else {
      Write-Error ".env.example not found. Cannot create .env.docker"
      return $false
    }
  }
  return $true
}

function Invoke-DockerBuild {
  Write-Header "Building Docker Images"

  Write-Info "Building application image..."
  docker-compose build --no-cache

  if ($LASTEXITCODE -eq 0) {
    Write-Success "Docker images built successfully"
    return $true
  }
  else {
    Write-Error "Docker build failed"
    return $false
  }
}

function Invoke-DockerStart {
  Write-Header "Starting Docker Containers"

  Write-Info "Starting services..."
  docker-compose up -d

  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start containers"
    return $false
  }

  Write-Success "Containers started"

  # Wait for services to be healthy
  Write-Info "Waiting for services to be healthy..."
  Start-Sleep -Seconds 5

  $maxAttempts = 30
  $attempt = 0
  $allHealthy = $false

  while ($attempt -lt $maxAttempts -and -not $allHealthy) {
    $attempt++
    $containers = docker-compose ps --format json | ConvertFrom-Json

    $unhealthy = $containers | Where-Object { $_.Health -ne "healthy" -and $_.State -eq "running" }

    if ($unhealthy.Count -eq 0) {
      $allHealthy = $true
    }
    else {
      Write-Host "." -NoNewline
      Start-Sleep -Seconds 2
    }
  }

  Write-Host ""

  if ($allHealthy) {
    Write-Success "All services are healthy"
    Invoke-ShowStatus
    return $true
  }
  else {
    Write-Warning "Some services may not be fully healthy yet"
    Invoke-ShowStatus
    return $false
  }
}

function Invoke-DockerStop {
  Write-Header "Stopping Docker Containers"

  docker-compose down

  if ($LASTEXITCODE -eq 0) {
    Write-Success "Containers stopped successfully"
    return $true
  }
  else {
    Write-Error "Failed to stop containers"
    return $false
  }
}

function Invoke-DockerRestart {
  Write-Header "Restarting Docker Containers"

  Invoke-DockerStop | Out-Null
  Start-Sleep -Seconds 2
  Invoke-DockerStart
}

function Invoke-ShowLogs {
  Write-Header "Container Logs"

  Write-Info "Following logs (Ctrl+C to exit)..."
  docker-compose logs -f --tail=100
}

function Invoke-Clean {
  Write-Header "Cleaning Docker Resources"

  Write-Warning "This will remove all containers, volumes, and images!"
  $confirm = Read-Host "Are you sure? (yes/no)"

  if ($confirm -ne "yes") {
    Write-Info "Cleanup cancelled"
    return
  }

  Write-Info "Stopping containers..."
  docker-compose down -v

  Write-Info "Removing images..."
  docker-compose down --rmi all

  Write-Info "Pruning system..."
  docker system prune -af --volumes

  Write-Success "Cleanup complete"
}

function Invoke-ShowStatus {
  Write-Header "Container Status"

  Write-Host ""
  docker-compose ps
  Write-Host ""

  # Check individual service health
  $app = docker inspect farmers-market-app --format='{{.State.Health.Status}}' 2>$null
  $db = docker inspect farmers-market-db --format='{{.State.Health.Status}}' 2>$null
  $redis = docker inspect farmers-market-redis --format='{{.State.Health.Status}}' 2>$null

  Write-Host "Service Health Status:" -ForegroundColor $InfoColor
  if ($app) { Write-Host "  App:      $app" }
  if ($db) { Write-Host "  Database: $db" }
  if ($redis) { Write-Host "  Redis:    $redis" }
  Write-Host ""

  Write-Host "Access URLs:" -ForegroundColor $InfoColor
  Write-Host "  Application: http://localhost:3000" -ForegroundColor $SuccessColor
  Write-Host "  Adminer:     http://localhost:8080" -ForegroundColor $SuccessColor
  Write-Host "  API Health:  http://localhost:3000/api/health" -ForegroundColor $SuccessColor
  Write-Host ""
}

function Invoke-SeedDatabase {
  Write-Header "Seeding Database"

  Write-Info "Running database migrations..."
  docker-compose exec app npx prisma migrate deploy

  if ($LASTEXITCODE -ne 0) {
    Write-Error "Migration failed"
    return $false
  }

  Write-Info "Seeding database with initial data..."
  docker-compose exec app npx prisma db seed

  if ($LASTEXITCODE -eq 0) {
    Write-Success "Database seeded successfully"
    Write-Host ""
    Write-Host "Test Credentials:" -ForegroundColor $InfoColor
    Write-Host "  Admin:    admin@farmersmarket.app / DivineAdmin123!" -ForegroundColor $SuccessColor
    Write-Host "  Farmer:   ana.romana@email.com / FarmLife2024!" -ForegroundColor $SuccessColor
    Write-Host "  Consumer: divna.kapica@email.com / HealthyEating2024!" -ForegroundColor $SuccessColor
    Write-Host ""
    return $true
  }
  else {
    Write-Error "Database seeding failed"
    return $false
  }
}

# Main execution
Clear-Host

Write-Host "🌾 Farmers Market Platform - Docker Deployment" -ForegroundColor $InfoColor
Write-Host "Environment: $Environment" -ForegroundColor $InfoColor
Write-Host ""

# Pre-flight checks
Write-Info "Running pre-flight checks..."

if (-not (Test-DockerInstalled)) {
  Write-Error "Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
  exit 1
}
Write-Success "Docker is installed"

if (-not (Test-DockerRunning)) {
  Write-Error "Docker is not running. Please start Docker Desktop"
  exit 1
}
Write-Success "Docker is running"

if (-not (Test-EnvFile)) {
  Write-Error "Environment file setup required"
  exit 1
}
Write-Success "Environment file exists"

Write-Host ""

# Execute action
switch ($Action) {
  'build' {
    Invoke-DockerBuild
  }
  'start' {
    Invoke-DockerStart
  }
  'stop' {
    Invoke-DockerStop
  }
  'restart' {
    Invoke-DockerRestart
  }
  'logs' {
    Invoke-ShowLogs
  }
  'clean' {
    Invoke-Clean
  }
  'status' {
    Invoke-ShowStatus
  }
  'seed' {
    Invoke-SeedDatabase
  }
}

Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor $SuccessColor
Write-Host ""
