#!/usr/bin/env pwsh
# Docker Deployment Script for Farmers Market Platform

param(
    [switch]$Build,
    [switch]$Clean,
    [switch]$Logs,
    [switch]$Stop
)

Write-Host "🌾 Farmers Market Platform - Docker Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

function Show-Logs {
    Write-Host "📊 Showing container logs..." -ForegroundColor Yellow
    docker-compose logs -f
}

function Stop-Containers {
    Write-Host "🛑 Stopping containers..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✅ Containers stopped" -ForegroundColor Green
}

function Clean-Docker {
    Write-Host "🧹 Cleaning Docker resources..." -ForegroundColor Yellow

    docker-compose down -v --remove-orphans

    Write-Host "   Removing old images..." -ForegroundColor Gray
    docker rmi farmers-market-platform-web-and-app-app -f 2>$null

    Write-Host "   Pruning system..." -ForegroundColor Gray
    docker system prune -f

    Write-Host "✅ Docker cleanup complete" -ForegroundColor Green
}

function Build-And-Deploy {
    Write-Host "🏗️  Building and deploying containers..." -ForegroundColor Yellow
    Write-Host ""

    # Check if .env.docker exists
    if (-not (Test-Path ".env.docker")) {
        Write-Host "⚠️  .env.docker not found, creating from template..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env.docker" -ErrorAction SilentlyContinue
    }

    # Build and start
    Write-Host "📦 Building images..." -ForegroundColor Cyan
    docker-compose build --no-cache

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }

    Write-Host "🚀 Starting containers..." -ForegroundColor Cyan
    docker-compose up -d

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to start containers!" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Application available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "📍 Database available at: localhost:5432" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Useful commands:" -ForegroundColor Yellow
    Write-Host "   View logs:     .\scripts\docker-deploy.ps1 -Logs" -ForegroundColor Gray
    Write-Host "   Stop:          .\scripts\docker-deploy.ps1 -Stop" -ForegroundColor Gray
    Write-Host "   Clean rebuild: .\scripts\docker-deploy.ps1 -Clean -Build" -ForegroundColor Gray
    Write-Host ""

    # Show container status
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker-compose ps
}

# Main execution
try {
    if ($Clean) {
        Clean-Docker
    }

    if ($Stop) {
        Stop-Containers
    }
    elseif ($Logs) {
        Show-Logs
    }
    elseif ($Build -or $Clean) {
        Build-And-Deploy
    }
    else {
        # Default: just start
        Write-Host "🚀 Starting containers..." -ForegroundColor Yellow
        docker-compose up -d

        Write-Host ""
        Write-Host "✅ Containers started!" -ForegroundColor Green
        Write-Host "📍 Application: http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        docker-compose ps
    }
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}
