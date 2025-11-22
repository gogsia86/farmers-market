#!/usr/bin/env pwsh
# Divine Docker Deployment - Simplified
# Handles common build issues and deploys to Docker

Write-Host "🌟 Divine Docker Deployment - Simplified" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path node_modules/.cache -Recurse -Force -ErrorAction SilentlyContinue

# 2. Install dependencies (if needed)
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# 3. Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 4. Build with optimized settings
Write-Host "🏗️  Building Next.js application..." -ForegroundColor Yellow
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_ENV = "production"

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "1. Check for functions in default exports" -ForegroundColor Gray
    Write-Host "2. Remove dynamic imports in pages" -ForegroundColor Gray
    Write-Host "3. Ensure all data fetching is async" -ForegroundColor Gray
    exit 1
}

# 5. Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null

# 6. Build Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
docker build -t farmers-market:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

# 7. Start containers
Write-Host "🚀 Starting containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Container startup failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Container status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "  - Application: http://localhost:3000" -ForegroundColor White
Write-Host "  - Database: postgresql://localhost:5432" -ForegroundColor White
Write-Host "  - Redis: redis://localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "  - View logs: docker-compose logs -f app" -ForegroundColor Gray
Write-Host "  - Stop: docker-compose down" -ForegroundColor Gray
Write-Host "  - Restart: docker-compose restart app" -ForegroundColor Gray
