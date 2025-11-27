#!/usr/bin/env pwsh
# ============================================================================
# DIVINE DOCKER CLEANUP SCRIPT
# Complete reset of all Farmers Market Docker artifacts
# ============================================================================

Write-Host "🧹 DIVINE DOCKER CLEANUP - Farmers Market Platform" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Stop all running containers
Write-Host "🛑 Stopping all Farmers Market containers..." -ForegroundColor Yellow
docker-compose down --remove-orphans 2>$null
docker stop (docker ps -a -q --filter "name=farmers-market") 2>$null

# Remove all containers
Write-Host "🗑️  Removing all Farmers Market containers..." -ForegroundColor Yellow
docker rm -f (docker ps -a -q --filter "name=farmers-market") 2>$null
docker rm -f (docker ps -a -q --filter "label=com.farmersmarket.service") 2>$null

# Remove all images
Write-Host "🖼️  Removing all Farmers Market images..." -ForegroundColor Yellow
docker rmi -f (docker images -q --filter "reference=farmers-market*") 2>$null
docker rmi -f (docker images -q --filter "reference=*farmers*market*") 2>$null

# Remove all volumes
Write-Host "💾 Removing all Farmers Market volumes..." -ForegroundColor Yellow
docker volume rm (docker volume ls -q --filter "name=farmers") 2>$null
docker volume rm (docker volume ls -q --filter "label=com.farmersmarket.volume") 2>$null

# Remove all networks
Write-Host "🌐 Removing all Farmers Market networks..." -ForegroundColor Yellow
docker network rm (docker network ls -q --filter "name=farmers") 2>$null
docker network rm (docker network ls -q --filter "label=com.farmersmarket.network") 2>$null

# Prune dangling resources
Write-Host "🧽 Pruning dangling Docker resources..." -ForegroundColor Yellow
docker system prune -f 2>$null

# Clean build cache
Write-Host "🗄️  Cleaning Docker build cache..." -ForegroundColor Yellow
docker builder prune -f 2>$null

Write-Host ""
Write-Host "✅ Docker cleanup complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Verification
Write-Host "📊 Verification:" -ForegroundColor Cyan
Write-Host "   Containers: " -NoNewline
(docker ps -a --filter "name=farmers" --format "{{.Names}}").Count
Write-Host "   Images:     " -NoNewline
(docker images --filter "reference=*farmers*" --format "{{.Repository}}").Count
Write-Host "   Volumes:    " -NoNewline
(docker volume ls --filter "name=farmers" --format "{{.Name}}").Count
Write-Host "   Networks:   " -NoNewline
(docker network ls --filter "name=farmers" --format "{{.Name}}").Count
Write-Host ""

Write-Host "🌾 Ready for fresh agricultural deployment! 🚀" -ForegroundColor Magenta
