#!/usr/bin/env pwsh
# ============================================
# DIVINE DOCKER SETUP SCRIPT
# PostgreSQL Container Management with Divine Consciousness
# ============================================

param(
  [switch]$Force,
  [switch]$Reset,
  [switch]$StatusOnly
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🐳 ═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🐳 DOCKER DIVINE SETUP - PostgreSQL Container Management" -ForegroundColor Cyan
Write-Host "🐳 ═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check Docker daemon
Write-Host "🔍 Checking Docker daemon status..." -ForegroundColor Yellow
try {
  $dockerVersion = docker version 2>$null
  if ($LASTEXITCODE -ne 0) {
    throw "Docker daemon not running"
  }
  Write-Host "   ✅ Docker daemon is running" -ForegroundColor Green
}
catch {
  Write-Host "   ❌ Docker daemon is not running!" -ForegroundColor Red
  Write-Host ""
  Write-Host "📋 To start Docker:" -ForegroundColor Yellow
  Write-Host "   1. Open Docker Desktop" -ForegroundColor Gray
  Write-Host "   2. Wait for it to start completely" -ForegroundColor Gray
  Write-Host "   3. Run this script again" -ForegroundColor Gray
  Write-Host ""
  exit 1
}

# Check if docker-compose.yml exists
$dockerComposePath = Join-Path $PSScriptRoot ".." "docker-compose.yml"
if (-not (Test-Path $dockerComposePath)) {
  Write-Host "   ⚠️  docker-compose.yml not found" -ForegroundColor Yellow
  Write-Host "   📝 Creating divine docker-compose.yml..." -ForegroundColor Cyan

  $dockerComposeContent = @"
version: '3.9'

services:
  # PostgreSQL Divine Database
  postgres:
    image: postgres:16-alpine
    container_name: farmers-market-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: divine_user
      POSTGRES_PASSWORD: quantum_password
      POSTGRES_DB: farmers_market
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - divine-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U divine_user -d farmers_market"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Divine Cache
  redis:
    image: redis:7-alpine
    container_name: farmers-market-cache
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass quantum_cache_password
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - divine-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local

networks:
  divine-network:
    driver: bridge
"@

  Set-Content -Path $dockerComposePath -Value $dockerComposeContent -Encoding UTF8
  Write-Host "   ✅ docker-compose.yml created successfully!" -ForegroundColor Green
}

# Change to project root
Set-Location (Split-Path $dockerComposePath -Parent)

if ($StatusOnly) {
  Write-Host ""
  Write-Host "📊 Docker Container Status:" -ForegroundColor Cyan
  docker-compose ps
  Write-Host ""
  exit 0
}

# Reset containers if requested
if ($Reset) {
  Write-Host ""
  Write-Host "🔄 Resetting containers (removing all data)..." -ForegroundColor Yellow
  docker-compose down -v
  Write-Host "   ✅ Containers and volumes removed" -ForegroundColor Green
}

# Check current container status
Write-Host ""
Write-Host "🔍 Checking container status..." -ForegroundColor Yellow
$postgresRunning = docker ps --filter "name=farmers-market-db" --filter "status=running" --format "{{.Names}}" 2>$null
$redisRunning = docker ps --filter "name=farmers-market-cache" --filter "status=running" --format "{{.Names}}" 2>$null

if ($postgresRunning -and $redisRunning -and -not $Force) {
  Write-Host "   ✅ All containers are already running!" -ForegroundColor Green
  Write-Host ""
  Write-Host "📊 Container Status:" -ForegroundColor Cyan
  docker-compose ps
  Write-Host ""
  Write-Host "🌐 Database Connection:" -ForegroundColor Cyan
  Write-Host "   Host: localhost" -ForegroundColor Gray
  Write-Host "   Port: 5432" -ForegroundColor Gray
  Write-Host "   Database: farmers_market" -ForegroundColor Gray
  Write-Host "   User: divine_user" -ForegroundColor Gray
  Write-Host "   Password: quantum_password" -ForegroundColor Gray
  Write-Host ""
  Write-Host "🔗 Connection String:" -ForegroundColor Cyan
  Write-Host "   postgresql://divine_user:quantum_password@localhost:5432/farmers_market" -ForegroundColor Gray
  Write-Host ""
  exit 0
}

# Start containers
Write-Host ""
Write-Host "🚀 Starting Docker containers..." -ForegroundColor Cyan
Write-Host ""

try {
  docker-compose up -d

  if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ CONTAINERS STARTED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "✅ ═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""

    # Wait for containers to be healthy
    Write-Host "⏳ Waiting for containers to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3

    # Check PostgreSQL health
    Write-Host ""
    Write-Host "🔍 Checking PostgreSQL health..." -ForegroundColor Yellow
    $maxRetries = 10
    $retryCount = 0
    $postgresHealthy = $false

    while ($retryCount -lt $maxRetries) {
      $health = docker inspect --format='{{.State.Health.Status}}' farmers-market-db 2>$null
      if ($health -eq "healthy") {
        $postgresHealthy = $true
        break
      }
      $retryCount++
      Write-Host "   ⏳ Attempt $retryCount/$maxRetries - Status: $health" -ForegroundColor Gray
      Start-Sleep -Seconds 2
    }

    if ($postgresHealthy) {
      Write-Host "   ✅ PostgreSQL is healthy!" -ForegroundColor Green
    }
    else {
      Write-Host "   ⚠️  PostgreSQL may still be starting up..." -ForegroundColor Yellow
    }

    # Check Redis health
    Write-Host ""
    Write-Host "🔍 Checking Redis health..." -ForegroundColor Yellow
    $redisHealth = docker inspect --format='{{.State.Health.Status}}' farmers-market-cache 2>$null
    if ($redisHealth -eq "healthy") {
      Write-Host "   ✅ Redis is healthy!" -ForegroundColor Green
    }
    else {
      Write-Host "   ⚠️  Redis status: $redisHealth" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker-compose ps

    Write-Host ""
    Write-Host "🌐 Database Connection Details:" -ForegroundColor Cyan
    Write-Host "   ════════════════════════════════════════" -ForegroundColor Gray
    Write-Host "   Host:     localhost" -ForegroundColor White
    Write-Host "   Port:     5432" -ForegroundColor White
    Write-Host "   Database: farmers_market" -ForegroundColor White
    Write-Host "   User:     divine_user" -ForegroundColor White
    Write-Host "   Password: quantum_password" -ForegroundColor White
    Write-Host "   ════════════════════════════════════════" -ForegroundColor Gray

    Write-Host ""
    Write-Host "🔗 DATABASE_URL for .env:" -ForegroundColor Cyan
    Write-Host "   DATABASE_URL=postgresql://divine_user:quantum_password@localhost:5432/farmers_market" -ForegroundColor Yellow

    Write-Host ""
    Write-Host "🔗 REDIS_URL for .env:" -ForegroundColor Cyan
    Write-Host "   REDIS_URL=redis://:quantum_cache_password@localhost:6379" -ForegroundColor Yellow

    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Update your .env file with the DATABASE_URL above" -ForegroundColor Gray
    Write-Host "   2. Run: npm run db:migrate" -ForegroundColor Gray
    Write-Host "   3. Run: npm run db:seed" -ForegroundColor Gray
    Write-Host "   4. Run: npm run dev" -ForegroundColor Gray

    Write-Host ""
    Write-Host "🔧 Useful Commands:" -ForegroundColor Cyan
    Write-Host "   docker-compose ps              - Check container status" -ForegroundColor Gray
    Write-Host "   docker-compose logs postgres   - View PostgreSQL logs" -ForegroundColor Gray
    Write-Host "   docker-compose logs redis      - View Redis logs" -ForegroundColor Gray
    Write-Host "   docker-compose down            - Stop containers" -ForegroundColor Gray
    Write-Host "   docker-compose down -v         - Stop and remove volumes" -ForegroundColor Gray
    Write-Host ""

  }
  else {
    throw "Failed to start containers"
  }
}
catch {
  Write-Host ""
  Write-Host "❌ ═══════════════════════════════════════════════════════" -ForegroundColor Red
  Write-Host "❌ FAILED TO START CONTAINERS!" -ForegroundColor Red
  Write-Host "❌ ═══════════════════════════════════════════════════════" -ForegroundColor Red
  Write-Host ""
  Write-Host "Error: $_" -ForegroundColor Red
  Write-Host ""
  Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
  Write-Host "   1. Ensure Docker Desktop is running" -ForegroundColor Gray
  Write-Host "   2. Check if ports 5432 and 6379 are available" -ForegroundColor Gray
  Write-Host "   3. Run: docker-compose logs" -ForegroundColor Gray
  Write-Host "   4. Try: docker-compose down -v && docker-compose up -d" -ForegroundColor Gray
  Write-Host ""
  exit 1
}
