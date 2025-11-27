#!/usr/bin/env pwsh
# ============================================================================
# COMPLETE DOCKER CLEANUP - Farmers Market Platform
# Removes ALL Docker artifacts for fresh start
# ============================================================================

Write-Host "🧹 COMPLETE DOCKER CLEANUP STARTING..." -ForegroundColor Cyan
Write-Host "⚠️  This will remove ALL Farmers Market Docker resources" -ForegroundColor Yellow
Write-Host ""

# Confirm action
$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Cleanup cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 1: Stopping All Containers" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

# Stop all running containers
docker-compose down 2>$null
docker-compose -f docker-compose.yml down 2>$null
docker-compose -f docker-compose.dev.yml down 2>$null
docker-compose -f docker-compose.prod.yml down 2>$null

# Force stop any Farmers Market containers
$containers = docker ps -a --filter "name=farmers" --format "{{.ID}}"
if ($containers) {
    Write-Host "🛑 Stopping Farmers Market containers..." -ForegroundColor Yellow
    docker stop $containers 2>$null
    docker rm -f $containers 2>$null
    Write-Host "✅ Containers stopped and removed" -ForegroundColor Green
} else {
    Write-Host "✅ No running containers found" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 2: Removing Docker Images" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

# Remove Farmers Market images
$images = docker images --filter "reference=*farmers*" --format "{{.ID}}"
if ($images) {
    Write-Host "🗑️  Removing Farmers Market images..." -ForegroundColor Yellow
    docker rmi -f $images 2>$null
    Write-Host "✅ Images removed" -ForegroundColor Green
} else {
    Write-Host "✅ No images found" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 3: Removing Docker Volumes" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

# Remove named volumes
$volumes = docker volume ls --filter "name=farmers" --format "{{.Name}}"
if ($volumes) {
    Write-Host "🗑️  Removing Farmers Market volumes..." -ForegroundColor Yellow
    docker volume rm -f $volumes 2>$null
    Write-Host "✅ Volumes removed" -ForegroundColor Green
} else {
    Write-Host "✅ No volumes found" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 4: Removing Docker Networks" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

# Remove custom networks
$networks = docker network ls --filter "name=farmers" --format "{{.ID}}"
if ($networks) {
    Write-Host "🗑️  Removing Farmers Market networks..." -ForegroundColor Yellow
    docker network rm $networks 2>$null
    Write-Host "✅ Networks removed" -ForegroundColor Green
} else {
    Write-Host "✅ No custom networks found" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 5: Docker System Cleanup" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "🧹 Running Docker system prune..." -ForegroundColor Yellow
docker system prune -af --volumes 2>$null
Write-Host "✅ System cleaned" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STEP 6: Removing Build Artifacts" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

$artifactsToRemove = @(
    ".next",
    "node_modules/.cache",
    "dist",
    "out",
    ".turbo",
    "docker-data"
)

foreach ($artifact in $artifactsToRemove) {
    if (Test-Path $artifact) {
        Write-Host "🗑️  Removing $artifact..." -ForegroundColor Yellow
        Remove-Item -Path $artifact -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ $artifact removed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CLEANUP COMPLETE! 🎉" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Docker Status:" -ForegroundColor Cyan
docker ps -a
Write-Host ""
docker images
Write-Host ""
docker volume ls
Write-Host ""
Write-Host "✨ Ready for fresh development setup!" -ForegroundColor Green
Write-Host "   Run: docker-compose -f docker-compose.dev.yml up --build" -ForegroundColor Cyan
Write-Host ""
