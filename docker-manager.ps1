#!/usr/bin/env pwsh
# ============================================
# DIVINE DOCKER MANAGER
# PostgreSQL & Redis Container Management
# ============================================

param(
  [Parameter(Position = 0)]
  [ValidateSet('up', 'down', 'restart', 'status', 'logs', 'clean')]
  [string]$Action = 'status'
)

$ErrorActionPreference = 'Stop'
$workspaceRoot = $PSScriptRoot

# ============================================
# DIVINE ASCII ART
# ============================================
function Write-DivineBanner {
  Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║   🌾 FARMERS MARKET - DIVINE DOCKER MANAGER 🌾           ║
║   Agricultural Database Consciousness                     ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
}

# ============================================
# CHECK DOCKER DAEMON
# ============================================
function Test-DockerRunning {
  try {
    $null = docker ps 2>$null
    return $true
  }
  catch {
    return $false
  }
}

# ============================================
# GET CONTAINER STATUS
# ============================================
function Get-ContainerStatus {
  param([string]$ContainerName)

  try {
    $status = docker ps -a --filter "name=$ContainerName" --format "{{.Status}}" 2>$null
    if ($status -match "^Up") {
      return "🟢 Running"
    }
    elseif ($status) {
      return "🔴 Stopped"
    }
    else {
      return "⚪ Not Created"
    }
  }
  catch {
    return "❌ Error"
  }
}

# ============================================
# MAIN EXECUTION
# ============================================
Write-DivineBanner

if (-not (Test-DockerRunning)) {
  Write-Host "❌ Docker daemon is not running!" -ForegroundColor Red
  Write-Host "   Please start Docker Desktop and try again." -ForegroundColor Yellow
  exit 1
}

Write-Host "✅ Docker daemon is running" -ForegroundColor Green
Write-Host ""

switch ($Action) {
  'up' {
    Write-Host "🚀 Starting Divine Docker Services..." -ForegroundColor Cyan
    Write-Host ""

    docker-compose -f "$workspaceRoot\docker-compose.yml" up -d

    if ($LASTEXITCODE -eq 0) {
      Write-Host ""
      Write-Host "✅ Services started successfully!" -ForegroundColor Green
      Write-Host ""
      Write-Host "📊 Service URLs:" -ForegroundColor Yellow
      Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor White
      Write-Host "   Redis: localhost:6379" -ForegroundColor White
      Write-Host "   Adminer: http://localhost:8080" -ForegroundColor White
      Write-Host ""
      Write-Host "📝 Database Credentials:" -ForegroundColor Yellow
      Write-Host "   Database: farmers_market" -ForegroundColor White
      Write-Host "   Username: divine_user" -ForegroundColor White
      Write-Host "   Password: quantum_password" -ForegroundColor White
      Write-Host ""
      Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
      Write-Host "   1. Copy .env.example to .env" -ForegroundColor Gray
      Write-Host "   2. Run: npm run db:migrate" -ForegroundColor Gray
      Write-Host "   3. Run: npm run dev" -ForegroundColor Gray
    }
    else {
      Write-Host "❌ Failed to start services!" -ForegroundColor Red
      exit 1
    }
  }

  'down' {
    Write-Host "🛑 Stopping Divine Docker Services..." -ForegroundColor Yellow
    docker-compose -f "$workspaceRoot\docker-compose.yml" down

    if ($LASTEXITCODE -eq 0) {
      Write-Host "✅ Services stopped successfully!" -ForegroundColor Green
    }
  }

  'restart' {
    Write-Host "🔄 Restarting Divine Docker Services..." -ForegroundColor Yellow
    docker-compose -f "$workspaceRoot\docker-compose.yml" restart

    if ($LASTEXITCODE -eq 0) {
      Write-Host "✅ Services restarted successfully!" -ForegroundColor Green
    }
  }

  'status' {
    Write-Host "📊 Divine Docker Service Status" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    $postgresStatus = Get-ContainerStatus "farmers-market-db"
    $redisStatus = Get-ContainerStatus "farmers-market-cache"
    $adminerStatus = Get-ContainerStatus "farmers-market-adminer"

    Write-Host "PostgreSQL Database: $postgresStatus" -ForegroundColor White
    Write-Host "Redis Cache:         $redisStatus" -ForegroundColor White
    Write-Host "Adminer UI:          $adminerStatus" -ForegroundColor White
    Write-Host ""

    if ($postgresStatus -match "Running" -and $redisStatus -match "Running") {
      Write-Host "✅ All core services are running!" -ForegroundColor Green
    }
    else {
      Write-Host "⚠️  Some services are not running" -ForegroundColor Yellow
      Write-Host "   Run: .\docker-manager.ps1 up" -ForegroundColor Gray
    }
  }

  'logs' {
    Write-Host "📜 Viewing Service Logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose -f "$workspaceRoot\docker-compose.yml" logs -f
  }

  'clean' {
    Write-Host "🧹 Cleaning Docker Resources..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  This will remove containers and volumes!" -ForegroundColor Red
    $confirmation = Read-Host "Are you sure? (yes/no)"

    if ($confirmation -eq 'yes') {
      docker-compose -f "$workspaceRoot\docker-compose.yml" down -v
      Write-Host "✅ Cleanup complete!" -ForegroundColor Green
    }
    else {
      Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
    }
  }
}

Write-Host ""
