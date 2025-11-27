#!/usr/bin/env pwsh
# ============================================
# DOCKER COMPLETE CLEANUP SCRIPT
# Agricultural Platform - Divine Cleanup
# ============================================

Write-Host "🧹 Starting COMPLETE Docker Cleanup for Farmers Market..." -ForegroundColor Cyan

# Function to display section headers
function Write-Section {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  $Message" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
}

# Function to confirm action
function Confirm-Action {
    param([string]$Message)
    $response = Read-Host "$Message (yes/no)"
    return $response -eq 'yes'
}

Write-Section "⚠️  DANGER ZONE - This will DELETE ALL Docker data"

Write-Host @"
This script will:
  🗑️  Stop all running containers
  🗑️  Remove all Farmers Market containers
  🗑️  Remove all Farmers Market images
  🗑️  Remove all Farmers Market volumes (DATABASE WILL BE DELETED)
  🗑️  Remove all Farmers Market networks
  🗑️  Clear Docker build cache
  🗑️  Optionally: Prune ALL Docker system data

"@ -ForegroundColor Red

if (-not (Confirm-Action "⚠️  Are you ABSOLUTELY SURE you want to proceed?")) {
    Write-Host "❌ Cleanup cancelled. No changes made." -ForegroundColor Green
    exit 0
}

# ============================================
# STEP 1: Stop All Running Containers
# ============================================
Write-Section "🛑 Stopping All Running Containers"

try {
    $runningContainers = docker ps -q
    if ($runningContainers) {
        docker stop $runningContainers
        Write-Host "✅ All containers stopped" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No running containers found" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Error stopping containers: $_" -ForegroundColor Yellow
}

# ============================================
# STEP 2: Remove Farmers Market Containers
# ============================================
Write-Section "🗑️  Removing Farmers Market Containers"

try {
    $farmersContainers = docker ps -a --filter "name=farmers" --filter "name=farm" -q
    if ($farmersContainers) {
        docker rm -f $farmersContainers
        Write-Host "✅ Farmers Market containers removed" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No Farmers Market containers found" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Error removing containers: $_" -ForegroundColor Yellow
}

# ============================================
# STEP 3: Remove Farmers Market Images
# ============================================
Write-Section "🗑️  Removing Farmers Market Images"

try {
    $farmersImages = docker images --filter "reference=*farmers*" --filter "reference=*farm*" -q
    if ($farmersImages) {
        docker rmi -f $farmersImages
        Write-Host "✅ Farmers Market images removed" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No Farmers Market images found" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Error removing images: $_" -ForegroundColor Yellow
}

# ============================================
# STEP 4: Remove Farmers Market Volumes
# ============================================
Write-Section "🗑️  Removing Farmers Market Volumes (DATABASE DATA)"

Write-Host "⚠️  This will DELETE all database data!" -ForegroundColor Red
if (Confirm-Action "Remove volumes and delete database?") {
    try {
        $farmersVolumes = docker volume ls --filter "name=farmers" --filter "name=farm" -q
        if ($farmersVolumes) {
            docker volume rm -f $farmersVolumes
            Write-Host "✅ Farmers Market volumes removed" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  No Farmers Market volumes found" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️  Error removing volumes: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipping volume removal" -ForegroundColor Yellow
}

# ============================================
# STEP 5: Remove Farmers Market Networks
# ============================================
Write-Section "🗑️  Removing Farmers Market Networks"

try {
    $farmersNetworks = docker network ls --filter "name=farmers" --filter "name=farm" --filter "name=divine" -q
    if ($farmersNetworks) {
        docker network rm $farmersNetworks
        Write-Host "✅ Farmers Market networks removed" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No Farmers Market networks found" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Error removing networks: $_" -ForegroundColor Yellow
}

# ============================================
# STEP 6: Clear Docker Build Cache
# ============================================
Write-Section "🗑️  Clearing Docker Build Cache"

if (Confirm-Action "Clear Docker build cache?") {
    try {
        docker builder prune -f
        Write-Host "✅ Build cache cleared" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Error clearing build cache: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipping build cache cleanup" -ForegroundColor Yellow
}

# ============================================
# STEP 7: Optional Full Docker Prune
# ============================================
Write-Section "🗑️  Full Docker System Prune (Optional)"

Write-Host "⚠️  This will remove ALL unused Docker data (not just Farmers Market)" -ForegroundColor Red
if (Confirm-Action "Perform FULL Docker system prune?") {
    try {
        docker system prune -a --volumes -f
        Write-Host "✅ Full Docker system pruned" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Error during system prune: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipping full system prune" -ForegroundColor Yellow
}

# ============================================
# STEP 8: Verification
# ============================================
Write-Section "📊 Verification - Remaining Docker Resources"

Write-Host "`n🐳 Remaining Containers:" -ForegroundColor Cyan
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

Write-Host "`n🖼️  Remaining Images:" -ForegroundColor Cyan
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

Write-Host "`n💾 Remaining Volumes:" -ForegroundColor Cyan
docker volume ls --format "table {{.Name}}\t{{.Driver}}"

Write-Host "`n🌐 Remaining Networks:" -ForegroundColor Cyan
docker network ls --format "table {{.Name}}\t{{.Driver}}"

# ============================================
# STEP 9: Disk Space Report
# ============================================
Write-Section "📊 Docker Disk Space Report"

docker system df

# ============================================
# Completion
# ============================================
Write-Section "✅ Docker Cleanup Complete!"

Write-Host @"

🎉 Cleanup Summary:
  ✅ All Farmers Market containers removed
  ✅ All Farmers Market images removed
  ✅ All Farmers Market volumes removed (if selected)
  ✅ All Farmers Market networks removed
  ✅ Build cache cleared (if selected)

🚀 Next Steps:
  1. Review verification output above
  2. Run: docker-compose up -d (for fresh development)
  3. Run: npm run dev (for Next.js development)

📖 For fresh Docker setup:
  Run: .\scripts\docker-fresh-setup.ps1

"@ -ForegroundColor Green

Write-Host "🌾 Agricultural consciousness preserved. Ready for fresh manifestation! ⚡" -ForegroundColor Magenta
