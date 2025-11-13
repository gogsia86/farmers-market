#!/usr/bin/env pwsh
# scripts/docker-setup.ps1
# Divine Docker Setup and Management Script
# Ensures PostgreSQL container is running for development

param(
  [ValidateSet('up', 'down', 'restart', 'status', 'logs', 'clean')]
  [string]$Action = 'up',

  [switch]$Build,
  [switch]$Recreate,
  [switch]$Verbose
)

$ErrorActionPreference = 'Stop'

# ============================================
# DIVINE DOCKER CONFIGURATION
# ============================================

$DOCKER_COMPOSE_FILE = Join-Path $PSScriptRoot "..\docker-compose.yml"
$ENV_FILE = Join-Path $PSScriptRoot "..\.env"

Write-Host "🐳 Divine Docker Management System" -ForegroundColor Cyan
Write-Host "   Action: $Action" -ForegroundColor Gray
Write-Host ""

# ============================================
# HELPER FUNCTIONS
# ============================================

function Test-DockerInstalled {
  try {
    $dockerVersion = docker --version
    Write-Host "   ✅ Docker installed: $dockerVersion" -ForegroundColor Green
    return $true
  }
  catch {
    Write-Host "   ❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "      Install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    return $false
  }
}

function Test-DockerRunning {
  try {
    docker info | Out-Null
    Write-Host "   ✅ Docker daemon is running" -ForegroundColor Green
    return $true
  }
  catch {
    Write-Host "   ❌ Docker daemon is not running" -ForegroundColor Red
    Write-Host "      Start Docker Desktop and try again" -ForegroundColor Yellow
    return $false
  }
}

function Test-DockerComposeFile {
  if (Test-Path $DOCKER_COMPOSE_FILE) {
    Write-Host "   ✅ docker-compose.yml found" -ForegroundColor Green
    return $true
  }
  else {
    Write-Host "   ❌ docker-compose.yml not found" -ForegroundColor Red
    Write-Host "      Creating docker-compose.yml..." -ForegroundColor Yellow
    New-DockerComposeFile
    return (Test-Path $DOCKER_COMPOSE_FILE)
  }
}

function New-DockerComposeFile {
  $composeContent = @'
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
    networks:
      - divine-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U divine_user -d farmers_market"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Divine Cache (Optional)
  redis:
    image: redis:7-alpine
    container_name: farmers-market-cache
    restart: unless-stopped
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - divine-network
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
  divine-network:
    driver: bridge
'@

  $composeContent | Out-File -FilePath $DOCKER_COMPOSE_FILE -Encoding UTF8
  Write-Host "   ✅ docker-compose.yml created" -ForegroundColor Green
}

function Get-ContainerStatus {
  param([string]$ContainerName)

  try {
    $status = docker inspect --format='{{.State.Status}}' $ContainerName 2>$null
    return $status
  }
  catch {
    return "not-found"
  }
}

function Show-ContainerStatus {
  Write-Host ""
  Write-Host "📊 Container Status:" -ForegroundColor Cyan

  $postgresStatus = Get-ContainerStatus "farmers-market-db"
  $redisStatus = Get-ContainerStatus "farmers-market-cache"

  if ($postgresStatus -eq "running") {
    Write-Host "   ✅ PostgreSQL: Running" -ForegroundColor Green

    # Show connection info
    Write-Host ""
    Write-Host "   📋 Connection Info:" -ForegroundColor Yellow
    Write-Host "      Host: localhost" -ForegroundColor Gray
    Write-Host "      Port: 5432" -ForegroundColor Gray
    Write-Host "      Database: farmers_market" -ForegroundColor Gray
    Write-Host "      User: divine_user" -ForegroundColor Gray
    Write-Host "      Password: quantum_password" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📝 DATABASE_URL:" -ForegroundColor Yellow
    Write-Host "      postgresql://divine_user:quantum_password@localhost:5432/farmers_market" -ForegroundColor Cyan
  }
  elseif ($postgresStatus -eq "not-found") {
    Write-Host "   ⚠️  PostgreSQL: Container not created" -ForegroundColor Yellow
  }
  else {
    Write-Host "   ❌ PostgreSQL: $postgresStatus" -ForegroundColor Red
  }

  if ($redisStatus -eq "running") {
    Write-Host "   ✅ Redis: Running" -ForegroundColor Green
  }
  elseif ($redisStatus -eq "not-found") {
    Write-Host "   ⚠️  Redis: Container not created" -ForegroundColor Yellow
  }
  else {
    Write-Host "   ⚠️  Redis: $redisStatus" -ForegroundColor Yellow
  }

  Write-Host ""
}

function Start-Containers {
  Write-Host "🚀 Starting containers..." -ForegroundColor Yellow
  Write-Host ""

  $args = @('up', '-d')

  if ($Build) {
    $args += '--build'
    Write-Host "   🏗️  Building images..." -ForegroundColor Yellow
  }

  if ($Recreate) {
    $args += '--force-recreate'
    Write-Host "   🔄 Forcing recreation..." -ForegroundColor Yellow
  }

  try {
    & docker-compose -f $DOCKER_COMPOSE_FILE $args

    if ($LASTEXITCODE -eq 0) {
      Write-Host ""
      Write-Host "   ✅ Containers started successfully!" -ForegroundColor Green

      # Wait for health checks
      Write-Host ""
      Write-Host "   ⏳ Waiting for health checks..." -ForegroundColor Yellow
      Start-Sleep -Seconds 5

      Show-ContainerStatus

      # Update .env file
      Update-EnvFile

      return $true
    }
    else {
      Write-Host ""
      Write-Host "   ❌ Failed to start containers" -ForegroundColor Red
      return $false
    }
  }
  catch {
    Write-Host ""
    Write-Host "   ❌ Error starting containers: $_" -ForegroundColor Red
    return $false
  }
}

function Stop-Containers {
  Write-Host "🛑 Stopping containers..." -ForegroundColor Yellow
  Write-Host ""

  try {
    docker-compose -f $DOCKER_COMPOSE_FILE down

    if ($LASTEXITCODE -eq 0) {
      Write-Host ""
      Write-Host "   ✅ Containers stopped successfully!" -ForegroundColor Green
      return $true
    }
    else {
      Write-Host ""
      Write-Host "   ❌ Failed to stop containers" -ForegroundColor Red
      return $false
    }
  }
  catch {
    Write-Host ""
    Write-Host "   ❌ Error stopping containers: $_" -ForegroundColor Red
    return $false
  }
}

function Restart-Containers {
  Write-Host "🔄 Restarting containers..." -ForegroundColor Yellow
  Write-Host ""

  Stop-Containers
  Start-Sleep -Seconds 2
  Start-Containers
}

function Show-Logs {
  Write-Host "📋 Container Logs:" -ForegroundColor Cyan
  Write-Host ""

  try {
    docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=50 --follow
  }
  catch {
    Write-Host "   ❌ Error showing logs: $_" -ForegroundColor Red
  }
}

function Clear-Containers {
  Write-Host "🧹 Cleaning containers and volumes..." -ForegroundColor Yellow
  Write-Host ""

  Write-Host "   ⚠️  This will DELETE all data in the containers!" -ForegroundColor Red
  $confirm = Read-Host "   Type 'yes' to confirm"

  if ($confirm -ne 'yes') {
    Write-Host "   ❌ Cancelled" -ForegroundColor Yellow
    return
  }

  try {
    docker-compose -f $DOCKER_COMPOSE_FILE down -v

    if ($LASTEXITCODE -eq 0) {
      Write-Host ""
      Write-Host "   ✅ Containers and volumes cleaned!" -ForegroundColor Green
      return $true
    }
    else {
      Write-Host ""
      Write-Host "   ❌ Failed to clean containers" -ForegroundColor Red
      return $false
    }
  }
  catch {
    Write-Host ""
    Write-Host "   ❌ Error cleaning containers: $_" -ForegroundColor Red
    return $false
  }
}

function Update-EnvFile {
  $databaseUrl = "postgresql://divine_user:quantum_password@localhost:5432/farmers_market"

  if (Test-Path $ENV_FILE) {
    $content = Get-Content $ENV_FILE -Raw

    if ($content -match 'DATABASE_URL=') {
      # Update existing
      $content = $content -replace 'DATABASE_URL=.*', "DATABASE_URL=$databaseUrl"
    }
    else {
      # Add new
      $content += "`nDATABASE_URL=$databaseUrl`n"
    }

    $content | Out-File -FilePath $ENV_FILE -Encoding UTF8 -NoNewline
    Write-Host "   ✅ .env file updated with DATABASE_URL" -ForegroundColor Green
  }
  else {
    # Create new .env file
    @"
# Divine Database Configuration
DATABASE_URL=$databaseUrl

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Development Settings
NODE_ENV=development
"@ | Out-File -FilePath $ENV_FILE -Encoding UTF8
    Write-Host "   ✅ .env file created" -ForegroundColor Green
  }
}

# ============================================
# MAIN EXECUTION
# ============================================

# Validate Docker installation
if (-not (Test-DockerInstalled)) {
  exit 1
}

if (-not (Test-DockerRunning)) {
  exit 1
}

if (-not (Test-DockerComposeFile)) {
  exit 1
}

Write-Host ""

# Execute action
switch ($Action) {
  'up' {
    Start-Containers
  }
  'down' {
    Stop-Containers
  }
  'restart' {
    Restart-Containers
  }
  'status' {
    Show-ContainerStatus
  }
  'logs' {
    Show-Logs
  }
  'clean' {
    Clear-Containers
  }
}

Write-Host ""
Write-Host "🎉 Divine Docker Management Complete!" -ForegroundColor Cyan
Write-Host ""

exit 0
