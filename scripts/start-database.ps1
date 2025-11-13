#!/usr/bin/env pwsh
# 🐳 Database Container Management Script
# Divine Docker Orchestration for PostgreSQL

param(
  [Parameter(Mandatory = $false)]
  [ValidateSet("start", "stop", "restart", "status", "logs", "clean")]
  [string]$Action = "start",

  [Parameter(Mandatory = $false)]
  [switch]$Force,

  [Parameter(Mandatory = $false)]
  [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# ============================================
# DIVINE CONFIGURATION
# ============================================
$COMPOSE_FILE = Join-Path $PSScriptRoot ".." "docker-compose.yml"
$ENV_FILE = Join-Path $PSScriptRoot ".." ".env"

Write-Host "`n🐳 ==============================================" -ForegroundColor Cyan
Write-Host "   DIVINE DATABASE CONTAINER MANAGER" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# ============================================
# HELPER FUNCTIONS
# ============================================
function Test-DockerRunning {
  try {
    $null = docker ps 2>&1
    return $LASTEXITCODE -eq 0
  }
  catch {
    return $false
  }
}

function Test-ContainerExists {
  param([string]$ContainerName)

  $containers = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
  return $containers -contains $ContainerName
}

function Test-ContainerRunning {
  param([string]$ContainerName)

  $containers = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
  return $containers -contains $ContainerName
}

function Get-ContainerStatus {
  param([string]$ContainerName)

  $status = docker inspect -f "{{.State.Status}}" $ContainerName 2>$null
  return $status
}

function Wait-ForPostgreSQL {
  param(
    [int]$MaxAttempts = 30,
    [int]$DelaySeconds = 2
  )

  Write-Host "`n⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow

  $attempt = 0
  while ($attempt -lt $MaxAttempts) {
    $attempt++

    # Try to connect to PostgreSQL
    $result = docker exec farmers-market-db pg_isready -U postgres 2>$null

    if ($LASTEXITCODE -eq 0) {
      Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
      return $true
    }

    Write-Host "   Attempt $attempt/$MaxAttempts - Waiting..." -ForegroundColor Gray
    Start-Sleep -Seconds $DelaySeconds
  }

  Write-Host "❌ PostgreSQL failed to become ready within timeout" -ForegroundColor Red
  return $false
}

# ============================================
# MAIN ACTIONS
# ============================================

function Start-Database {
  Write-Host "`n🚀 Starting PostgreSQL container..." -ForegroundColor Cyan

  # Check if Docker is running
  if (-not (Test-DockerRunning)) {
    Write-Host "❌ Docker daemon is not running!" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
  }

  # Check if docker-compose.yml exists
  if (-not (Test-Path $COMPOSE_FILE)) {
    Write-Host "❌ docker-compose.yml not found at: $COMPOSE_FILE" -ForegroundColor Red
    Write-Host "   Creating docker-compose.yml..." -ForegroundColor Yellow
    New-DockerComposeFile
  }

  # Check if .env exists
  if (-not (Test-Path $ENV_FILE)) {
    Write-Host "⚠️  .env file not found. Using defaults..." -ForegroundColor Yellow
  }

  # Start containers
  Write-Host "   Starting containers with docker-compose..." -ForegroundColor Cyan

  try {
    docker-compose -f $COMPOSE_FILE up -d

    if ($LASTEXITCODE -eq 0) {
      Write-Host "✅ Containers started successfully!" -ForegroundColor Green

      # Wait for PostgreSQL to be ready
      if (Wait-ForPostgreSQL) {
        Write-Host "`n📊 Container Status:" -ForegroundColor Cyan
        docker-compose -f $COMPOSE_FILE ps

        Write-Host "`n🎯 Database Connection String:" -ForegroundColor Cyan
        Write-Host "   postgresql://postgres:postgres@localhost:5432/farmers_market" -ForegroundColor Green

        Write-Host "`n✨ Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Run migrations: npm run db:migrate" -ForegroundColor White
        Write-Host "   2. Seed database: npm run db:seed" -ForegroundColor White
        Write-Host "   3. Open Prisma Studio: npm run db:studio" -ForegroundColor White
      }
    }
    else {
      Write-Host "❌ Failed to start containers!" -ForegroundColor Red
      exit 1
    }
  }
  catch {
    Write-Host "❌ Error starting containers: $_" -ForegroundColor Red
    exit 1
  }
}

function Stop-Database {
  Write-Host "`n🛑 Stopping PostgreSQL container..." -ForegroundColor Cyan

  if (-not (Test-DockerRunning)) {
    Write-Host "⚠️  Docker daemon is not running" -ForegroundColor Yellow
    return
  }

  docker-compose -f $COMPOSE_FILE down

  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Containers stopped successfully!" -ForegroundColor Green
  }
  else {
    Write-Host "❌ Failed to stop containers!" -ForegroundColor Red
  }
}

function Restart-Database {
  Write-Host "`n🔄 Restarting PostgreSQL container..." -ForegroundColor Cyan
  Stop-Database
  Start-Sleep -Seconds 2
  Start-Database
}

function Show-DatabaseStatus {
  Write-Host "`n📊 Database Container Status" -ForegroundColor Cyan
  Write-Host "================================================" -ForegroundColor Cyan

  if (-not (Test-DockerRunning)) {
    Write-Host "❌ Docker daemon is not running" -ForegroundColor Red
    return
  }

  # Check PostgreSQL container
  if (Test-ContainerExists "farmers-market-db") {
    $status = Get-ContainerStatus "farmers-market-db"

    if ($status -eq "running") {
      Write-Host "✅ PostgreSQL: Running" -ForegroundColor Green

      # Show container details
      Write-Host "`n📋 Container Details:" -ForegroundColor Cyan
      docker ps --filter "name=farmers-market-db" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

      # Test database connection
      Write-Host "`n🔌 Testing connection..." -ForegroundColor Cyan
      $result = docker exec farmers-market-db pg_isready -U postgres 2>$null

      if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database is accepting connections" -ForegroundColor Green
      }
      else {
        Write-Host "⚠️  Database is not ready yet" -ForegroundColor Yellow
      }
    }
    else {
      Write-Host "⚠️  PostgreSQL: $status" -ForegroundColor Yellow
    }
  }
  else {
    Write-Host "❌ PostgreSQL container not found" -ForegroundColor Red
    Write-Host "   Run: .\scripts\start-database.ps1 -Action start" -ForegroundColor Yellow
  }

  # Show all compose services
  Write-Host "`n🐳 All Services:" -ForegroundColor Cyan
  docker-compose -f $COMPOSE_FILE ps
}

function Show-DatabaseLogs {
  Write-Host "`n📜 PostgreSQL Container Logs" -ForegroundColor Cyan
  Write-Host "================================================" -ForegroundColor Cyan

  if (-not (Test-DockerRunning)) {
    Write-Host "❌ Docker daemon is not running" -ForegroundColor Red
    return
  }

  if (Test-ContainerRunning "farmers-market-db") {
    docker logs farmers-market-db --tail 50 --follow
  }
  else {
    Write-Host "❌ PostgreSQL container is not running" -ForegroundColor Red
  }
}

function Clean-Database {
  Write-Host "`n🧹 Cleaning Database Container and Volumes" -ForegroundColor Cyan
  Write-Host "================================================" -ForegroundColor Cyan
  Write-Host "⚠️  WARNING: This will delete all database data!" -ForegroundColor Red

  if (-not $Force) {
    $confirm = Read-Host "Are you sure you want to continue? (yes/no)"
    if ($confirm -ne "yes") {
      Write-Host "❌ Cancelled" -ForegroundColor Yellow
      return
    }
  }

  Write-Host "`n🛑 Stopping containers..." -ForegroundColor Yellow
  docker-compose -f $COMPOSE_FILE down -v

  Write-Host "✅ Containers and volumes removed!" -ForegroundColor Green
  Write-Host "   Run 'start' to create fresh containers" -ForegroundColor Cyan
}

function New-DockerComposeFile {
  $composeContent = @"
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: farmers-market-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: farmers_market
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - farmers-market-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache (optional - for future use)
  redis:
    image: redis:7-alpine
    container_name: farmers-market-cache
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - farmers-market-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local

networks:
  farmers-market-network:
    driver: bridge
"@

  Set-Content -Path $COMPOSE_FILE -Value $composeContent -Encoding UTF8
  Write-Host "✅ Created docker-compose.yml" -ForegroundColor Green
}

# ============================================
# EXECUTE ACTION
# ============================================

switch ($Action.ToLower()) {
  "start" { Start-Database }
  "stop" { Stop-Database }
  "restart" { Restart-Database }
  "status" { Show-DatabaseStatus }
  "logs" { Show-DatabaseLogs }
  "clean" { Clean-Database }
  default {
    Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
    Write-Host "Valid actions: start, stop, restart, status, logs, clean" -ForegroundColor Yellow
  }
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "   DIVINE DATABASE MANAGER COMPLETE" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan
