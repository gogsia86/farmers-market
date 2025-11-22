# 🐳 DOCKER CLEANUP & FRESH DEPLOYMENT SCRIPT
# Farmers Market Platform - Production Preparation
# Run this before building fresh production image

param(
  [switch]$WhatIf,
  [switch]$FullClean,
  [switch]$BuildAfter
)

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🐳 DOCKER CLEANUP & DEPLOYMENT PREPARATION                  ║" -ForegroundColor White
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
  $null = docker info 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
  }
  Write-Host "✅ Docker is running`n" -ForegroundColor Green
}
catch {
  Write-Host "❌ Docker is not installed or not running!" -ForegroundColor Red
  exit 1
}

# Step 1: Stop all running containers
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "  STEP 1: Stopping Containers" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray

$runningContainers = docker ps -q
if ($runningContainers) {
  Write-Host "Found $($runningContainers.Count) running container(s)..." -ForegroundColor Yellow
  if (-not $WhatIf) {
    docker-compose down
    Write-Host "✅ Containers stopped" -ForegroundColor Green
  }
  else {
    Write-Host "Would stop containers: docker-compose down" -ForegroundColor Gray
  }
}
else {
  Write-Host "✅ No running containers" -ForegroundColor Green
}

# Step 2: Remove old Farmers Market volumes
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "  STEP 2: Removing Old Volumes" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray

$volumes = docker volume ls --format "{{.Name}}" | Where-Object { $_ -like "*farmersmarket*" }
if ($volumes) {
  Write-Host "Found $($volumes.Count) Farmers Market volume(s):" -ForegroundColor Yellow
  $volumes | ForEach-Object {
    Write-Host "  • $_" -ForegroundColor Gray
    if (-not $WhatIf) {
      docker volume rm $_ 2>&1 | Out-Null
      if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Removed" -ForegroundColor Green
      }
      else {
        Write-Host "    ⚠️  Could not remove (may be in use)" -ForegroundColor Yellow
      }
    }
    else {
      Write-Host "    Would remove: docker volume rm $_" -ForegroundColor Gray
    }
  }
}
else {
  Write-Host "✅ No Farmers Market volumes found" -ForegroundColor Green
}

# Step 3: Full cleanup (if requested)
if ($FullClean) {
  Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
  Write-Host "  STEP 3: Full Docker Cleanup (NUCLEAR OPTION)" -ForegroundColor Red
  Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray

  Write-Host "⚠️  WARNING: This will remove ALL unused Docker resources!" -ForegroundColor Yellow
  if (-not $WhatIf) {
    $confirm = Read-Host "Are you sure? Type 'YES' to confirm"
    if ($confirm -eq 'YES') {
      Write-Host "`nRemoving all unused containers..." -ForegroundColor Yellow
      docker container prune -f

      Write-Host "Removing all unused images..." -ForegroundColor Yellow
      docker image prune -a -f

      Write-Host "Removing all unused volumes..." -ForegroundColor Yellow
      docker volume prune -f

      Write-Host "Removing all unused networks..." -ForegroundColor Yellow
      docker network prune -f

      Write-Host "`n✅ Full cleanup complete!" -ForegroundColor Green
    }
    else {
      Write-Host "❌ Full cleanup cancelled" -ForegroundColor Red
    }
  }
  else {
    Write-Host "Would run:" -ForegroundColor Gray
    Write-Host "  • docker container prune -f" -ForegroundColor Gray
    Write-Host "  • docker image prune -a -f" -ForegroundColor Gray
    Write-Host "  • docker volume prune -f" -ForegroundColor Gray
    Write-Host "  • docker network prune -f" -ForegroundColor Gray
  }
}
else {
  Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
  Write-Host "  STEP 3: Selective Cleanup" -ForegroundColor Cyan
  Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray

  Write-Host "Removing dangling images..." -ForegroundColor Yellow
  if (-not $WhatIf) {
    docker image prune -f
    Write-Host "✅ Dangling images removed" -ForegroundColor Green
  }
  else {
    Write-Host "Would run: docker image prune -f" -ForegroundColor Gray
  }

  Write-Host "`nℹ️  Use -FullClean for complete cleanup (removes all unused resources)" -ForegroundColor Cyan
}

# Step 4: Verify cleanup
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "  STEP 4: Verification" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray

if (-not $WhatIf) {
  $containers = docker ps -a
  $images = docker images
  $volumes = docker volume ls

  Write-Host "Current Docker State:" -ForegroundColor Yellow
  Write-Host "  Containers: $(($containers | Measure-Object).Count - 1)" -ForegroundColor White
  Write-Host "  Images: $(($images | Measure-Object).Count - 1)" -ForegroundColor White
  Write-Host "  Volumes: $(($volumes | Measure-Object).Count - 1)" -ForegroundColor White

  Write-Host "`n✅ Cleanup verification complete" -ForegroundColor Green
}

# Step 5: Build fresh image (if requested)
if ($BuildAfter -and -not $WhatIf) {
  Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
  Write-Host "  STEP 5: Building Fresh Production Image" -ForegroundColor Cyan
  Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray

  Write-Host "Building production image (this may take 5-10 minutes)..." -ForegroundColor Yellow
  $buildStart = Get-Date

  docker-compose build --no-cache

  if ($LASTEXITCODE -eq 0) {
    $buildTime = ((Get-Date) - $buildStart).TotalSeconds
    Write-Host "`n✅ Production image built successfully!" -ForegroundColor Green
    Write-Host "   Build time: $([math]::Round($buildTime, 1)) seconds" -ForegroundColor Cyan

    Write-Host "`nVerifying image..." -ForegroundColor Yellow
    $images = docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | Select-String "farmers-market"
    if ($images) {
      Write-Host "✅ Image verified:" -ForegroundColor Green
      $images | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    }
  }
  else {
    Write-Host "`n❌ Build failed!" -ForegroundColor Red
    Write-Host "   Check Docker logs for details" -ForegroundColor Yellow
    exit 1
  }
}

# Final summary
Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ CLEANUP COMPLETE                                         ║" -ForegroundColor White
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

if ($WhatIf) {
  Write-Host "ℹ️  This was a dry run. No changes were made." -ForegroundColor Cyan
  Write-Host "   Run without -WhatIf to execute cleanup." -ForegroundColor Gray
}
else {
  Write-Host "✅ Docker cleanup completed successfully!" -ForegroundColor Green
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
if (-not $BuildAfter) {
  Write-Host "   1. Build production image:" -ForegroundColor White
  Write-Host "      docker-compose build --no-cache" -ForegroundColor Gray
}
Write-Host "   2. Configure .env.production" -ForegroundColor White
Write-Host "   3. Run database migrations" -ForegroundColor White
Write-Host "   4. Test locally:" -ForegroundColor White
Write-Host "      docker-compose up -d" -ForegroundColor Gray
Write-Host "   5. Deploy to production" -ForegroundColor White

Write-Host "`n📖 Full guide: COMPREHENSIVE_PLATFORM_REVIEW_NOV_2025.md`n" -ForegroundColor Cyan

# Usage examples
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "Usage Examples:" -ForegroundColor Yellow
Write-Host "  .\docker-cleanup.ps1 -WhatIf                    # Dry run (safe)" -ForegroundColor Gray
Write-Host "  .\docker-cleanup.ps1                            # Basic cleanup" -ForegroundColor Gray
Write-Host "  .\docker-cleanup.ps1 -FullClean                 # Remove ALL unused" -ForegroundColor Gray
Write-Host "  .\docker-cleanup.ps1 -FullClean -BuildAfter     # Cleanup + Build" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray
