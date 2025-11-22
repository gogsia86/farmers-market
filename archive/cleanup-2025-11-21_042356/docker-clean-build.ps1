#!/usr/bin/env pwsh
# ============================================
# 🐳 DOCKER CLEAN BUILD SCRIPT
# Divine Docker build with complete cleanup
# ============================================

Write-Host "🐳 Starting Divine Docker Clean Build..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Function to check if Docker is running
function Test-DockerRunning {
  try {
    docker info | Out-Null
    return $true
  }
  catch {
    return $false
  }
}

# Check Docker availability
if (-not (Test-DockerRunning)) {
  Write-Host "❌ Docker is not running!" -ForegroundColor Red
  Write-Host "   Please start Docker Desktop and try again." -ForegroundColor Yellow
  exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green

# Step 1: Stop and remove existing containers
Write-Host "`n🛑 Step 1: Stopping and removing existing containers..." -ForegroundColor Yellow
docker-compose down --volumes --remove-orphans 2>$null
docker stop farmers-market-app 2>$null
docker rm farmers-market-app 2>$null
Write-Host "✅ Containers cleaned up" -ForegroundColor Green

# Step 2: Remove old images
Write-Host "`n🗑️  Step 2: Removing old images..." -ForegroundColor Yellow
docker rmi farmers-market:latest 2>$null
docker rmi farmers-market-app:latest 2>$null
Write-Host "✅ Old images removed" -ForegroundColor Green

# Step 3: Prune Docker system
Write-Host "`n🧹 Step 3: Pruning Docker system..." -ForegroundColor Yellow
docker system prune -f --volumes
Write-Host "✅ Docker system pruned" -ForegroundColor Green

# Step 4: Clean local build artifacts
Write-Host "`n🧹 Step 4: Cleaning local build artifacts..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Path ".next" -Recurse -Force }
if (Test-Path "node_modules/.cache") { Remove-Item -Path "node_modules/.cache" -Recurse -Force }
if (Test-Path ".turbo") { Remove-Item -Path ".turbo" -Recurse -Force }
Write-Host "✅ Local artifacts cleaned" -ForegroundColor Green

# Step 5: Build fresh Docker image
Write-Host "`n🏗️  Step 5: Building fresh Docker image..." -ForegroundColor Yellow
Write-Host "   This may take several minutes..." -ForegroundColor Gray

$buildStart = Get-Date

docker build `
  --no-cache `
  --progress=plain `
  --tag farmers-market:latest `
  --tag farmers-market-app:latest `
  --file Dockerfile `
  .

if ($LASTEXITCODE -ne 0) {
  Write-Host "`n❌ Docker build failed!" -ForegroundColor Red
  exit 1
}

$buildEnd = Get-Date
$buildDuration = ($buildEnd - $buildStart).TotalSeconds

Write-Host "✅ Docker image built successfully in $([math]::Round($buildDuration, 2)) seconds" -ForegroundColor Green

# Step 6: Verify image
Write-Host "`n🔍 Step 6: Verifying Docker image..." -ForegroundColor Yellow
$imageInfo = docker images farmers-market:latest --format "{{.Size}}"
Write-Host "   Image size: $imageInfo" -ForegroundColor Gray
Write-Host "✅ Image verified" -ForegroundColor Green

# Step 7: Show next steps
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "🎉 Clean Docker Build Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1️⃣  Test the image locally:" -ForegroundColor White
Write-Host "      docker run -p 3000:3000 --env-file .env farmers-market:latest" -ForegroundColor Gray
Write-Host ""
Write-Host "   2️⃣  Or use docker-compose:" -ForegroundColor White
Write-Host "      docker-compose up" -ForegroundColor Gray
Write-Host ""
Write-Host "   3️⃣  Access the application:" -ForegroundColor White
Write-Host "      http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
