#!/usr/bin/env pwsh
# Docker Deployment Script - Divine Agricultural Platform
# Handles build issues and deploys to Docker

Write-Host "🌾 Divine Agricultural Platform - Docker Deployment" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 1. Stop and remove existing containers
Write-Host "`n🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down -v 2>$null

# 2. Clean Docker build cache
Write-Host "`n🧹 Cleaning Docker build cache..." -ForegroundColor Yellow
docker system prune -f

# 3. Clean Next.js build artifacts
Write-Host "`n🧹 Cleaning Next.js build artifacts..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ".next", "out", ".turbo"

# 4. Set environment for Docker build
Write-Host "`n⚙️  Setting environment variables..." -ForegroundColor Yellow
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_ENV = "production"
$env:SKIP_ENV_VALIDATION = "true"

# 5. Build Docker image with no cache
Write-Host "`n🏗️  Building Docker image (this may take 5-10 minutes)..." -ForegroundColor Yellow
docker-compose build --no-cache --progress=plain

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Docker build failed!" -ForegroundColor Red
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  1. Check that all files exist" -ForegroundColor Gray
    Write-Host "  2. Ensure .env file has required variables" -ForegroundColor Gray
    Write-Host "  3. Check Next.js configuration" -ForegroundColor Gray
    exit 1
}

# 6. Start services
Write-Host "`n🚀 Starting services..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to start services!" -ForegroundColor Red
    exit 1
}

# 7. Wait for services to be healthy
Write-Host "`n⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 8. Check service status
Write-Host "`n📊 Service Status:" -ForegroundColor Green
docker-compose ps

# 9. Show logs
Write-Host "`n📜 Recent logs:" -ForegroundColor Green
docker-compose logs --tail=50

Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n🌐 Application: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 Health: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host "`nUseful commands:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f          # View logs" -ForegroundColor Gray
Write-Host "  docker-compose ps               # Check status" -ForegroundColor Gray
Write-Host "  docker-compose down             # Stop all" -ForegroundColor Gray
Write-Host "  docker-compose restart          # Restart all" -ForegroundColor Gray
