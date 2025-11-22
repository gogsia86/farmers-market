#!/usr/bin/env pwsh
# ============================================
# DIVINE DOCKER COMPLETE CLEANUP
# Removes all Farmers Market Docker artifacts
# ============================================

Write-Host "🌾 FARMERS MARKET - COMPLETE DOCKER CLEANUP" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Stop all running containers
Write-Host "🛑 Stopping all Farmers Market containers..." -ForegroundColor Yellow
docker ps -a --filter "name=farmers" --filter "name=farm" -q | ForEach-Object {
    docker stop $_ 2>$null
}

# Remove all containers
Write-Host "🗑️  Removing all Farmers Market containers..." -ForegroundColor Yellow
docker ps -a --filter "name=farmers" --filter "name=farm" -q | ForEach-Object {
    docker rm -f $_ 2>$null
}

# Remove all images
Write-Host "🖼️  Removing all Farmers Market images..." -ForegroundColor Yellow
docker images --filter "reference=*farmers*" --filter "reference=*farm*" -q | ForEach-Object {
    docker rmi -f $_ 2>$null
}

# Remove all volumes
Write-Host "💾 Removing all Farmers Market volumes..." -ForegroundColor Yellow
docker volume ls --filter "name=farmers" --filter "name=farm" -q | ForEach-Object {
    docker volume rm -f $_ 2>$null
}

# Remove all networks
Write-Host "🌐 Removing all Farmers Market networks..." -ForegroundColor Yellow
docker network ls --filter "name=farmers" --filter "name=farm" -q | ForEach-Object {
    docker network rm $_ 2>$null
}

# Prune system
Write-Host "🧹 Pruning Docker system..." -ForegroundColor Yellow
docker system prune -af --volumes 2>$null

# Clean build cache
Write-Host "📦 Cleaning Docker build cache..." -ForegroundColor Yellow
docker builder prune -af 2>$null

Write-Host ""
Write-Host "✅ DOCKER CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Current Docker Status:" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan
docker system df

Write-Host ""
Write-Host "🔍 Remaining Farmers Market artifacts:" -ForegroundColor Cyan
Write-Host "Containers:" -ForegroundColor Gray
docker ps -a --filter "name=farmers" --filter "name=farm"
Write-Host ""
Write-Host "Images:" -ForegroundColor Gray
docker images --filter "reference=*farmers*" --filter "reference=*farm*"
Write-Host ""
Write-Host "Volumes:" -ForegroundColor Gray
docker volume ls --filter "name=farmers" --filter "name=farm"
Write-Host ""
Write-Host "Networks:" -ForegroundColor Gray
docker network ls --filter "name=farmers" --filter "name=farm"
