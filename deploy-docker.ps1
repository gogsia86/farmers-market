#!/usr/bin/env pwsh
# 🐳 Docker Deployment Script - Divine Agricultural Platform
# Quick deployment helper for Docker Compose

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("build", "start", "stop", "restart", "logs", "status", "seed", "clean", "migrate")]
    [string]$Action = "start"
)

Write-Host "🌾 Farmers Market - Docker Deployment" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Yellow
Write-Host ""

switch ($Action) {
    "build" {
        Write-Host "🏗️ Building Docker images..." -ForegroundColor Green
        docker-compose build --no-cache
    }
    "start" {
        Write-Host "🚀 Starting containers..." -ForegroundColor Green
        docker-compose up -d
        Start-Sleep -Seconds 5
        docker-compose ps
        Write-Host ""
        Write-Host "✅ Application started!" -ForegroundColor Green
        Write-Host "🌐 Access at: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "🏥 Health check: http://localhost:3001/api/health" -ForegroundColor Cyan
    }
    "stop" {
        Write-Host "🛑 Stopping containers..." -ForegroundColor Yellow
        docker-compose down
    }
    "restart" {
        Write-Host "🔄 Restarting containers..." -ForegroundColor Yellow
        docker-compose restart
        Start-Sleep -Seconds 5
        docker-compose ps
    }
    "logs" {
        Write-Host "📋 Viewing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
        docker-compose logs -f app
    }
    "status" {
        Write-Host "📊 Container Status:" -ForegroundColor Cyan
        docker-compose ps
        Write-Host ""
        Write-Host "💾 Volume Status:" -ForegroundColor Cyan
        docker volume ls | Select-String "farmers"
    }
    "seed" {
        Write-Host "🌱 Seeding database..." -ForegroundColor Green
        docker-compose exec app npx prisma db seed
    }
    "migrate" {
        Write-Host "🔄 Running database migrations..." -ForegroundColor Green
        docker-compose exec app npx prisma migrate deploy
    }
    "clean" {
        Write-Host "🧹 Cleaning up Docker resources..." -ForegroundColor Red
        Write-Host "⚠️  This will remove containers, volumes, and images!" -ForegroundColor Yellow
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -eq "yes") {
            docker-compose down -v
            docker system prune -f
            Write-Host "✅ Cleanup complete!" -ForegroundColor Green
        } else {
            Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor Green
