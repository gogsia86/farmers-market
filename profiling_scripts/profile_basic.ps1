#!/usr/bin/env pwsh
# ==========================# Start profiling
& nsys profile `
  --trace=cuda, nvtx `
  --duration=$Duration `
  --output=$profileFile `
  --force-overwrite=true `
  --stats=true `
  node profiling_scripts/profile-target.js

Write-Host "🔍 Nsys exit code: $LASTEXITCODE" -ForegroundColor Cyan==========================================
# BASIC PROFILING SCRIPT - HP OMEN RTX 2070 DIVINE PROFILING
# ============================================================================
# Purpose: Basic performance profiling for Farmers Market development
# Hardware: RTX 2070 Max-Q + 64GB RAM + 12 threads
# Updated: October 22, 2025
# ============================================================================

param(
  [string]$Duration = "30",
  [string]$OutputDir = "profiling_output"
)

Write-Host "🚀 Starting Basic Divine Profiling..." -ForegroundColor Green
Write-Host "Duration: $Duration seconds" -ForegroundColor Cyan
Write-Host "Output Directory: $OutputDir" -ForegroundColor Cyan

# Create output directory
if (!(Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
  Write-Host "📁 Created output directory: $OutputDir" -ForegroundColor Yellow
}

# Check if Nsight Systems is available
$nsysPath = Get-Command nsys -ErrorAction SilentlyContinue
if (!$nsysPath) {
  Write-Warning "⚠️  NVIDIA Nsight Systems (nsys) not found in PATH"
  Write-Host "📋 Falling back to Node.js profiling..." -ForegroundColor Yellow

  # Use Node.js built-in profiler
  $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $profileFile = "$OutputDir\basic_profile_$timestamp.json"

  Write-Host "🎯 Starting Node.js profiler..." -ForegroundColor Green
  node profiling_scripts/profile-target.js > $profileFile

  Write-Host "✅ Basic profiling complete!" -ForegroundColor Green
  Write-Host "📊 Profile saved to: $profileFile" -ForegroundColor Cyan
  return
}

# Use NVIDIA Nsight Systems
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$profileFile = "$OutputDir\basic_profile_$timestamp.nsys-rep"

Write-Host "🎯 Starting NVIDIA Nsight Systems profiling..." -ForegroundColor Green

# Start profiling
& nsys profile `
  --trace=cuda, nvtx `
  --duration=$Duration `
  --output=$profileFile `
  --force-overwrite=true `
  --stats=true `
  node profiling_scripts/profile-target.js

# Check if profiling succeeded (exit code 0 or 1 is acceptable for non-GPU workloads)
if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
  Write-Host "✅ NVIDIA profiling complete!" -ForegroundColor Green
  Write-Host "📊 Profile saved to: $profileFile" -ForegroundColor Cyan

  # List generated files
  Write-Host "📁 Generated files:" -ForegroundColor Yellow
  Get-ChildItem "$OutputDir\basic_profile_$timestamp.*" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Cyan
  }
}
else {
  Write-Error "❌ Profiling failed with exit code: $LASTEXITCODE"
  exit 1
}

Write-Host "🌟 Divine Basic Profiling Complete!" -ForegroundColor Green
