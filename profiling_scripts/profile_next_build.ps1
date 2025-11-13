#!/usr/bin/env pwsh
# ============================================
# 🏗️ NEXT.JS BUILD PROFILING WITH NVIDIA NSIGHT
# ============================================
# Divine profiling for Next.js build optimization
# Hardware: HP OMEN - RTX 2070 Max-Q, 32GB RAM, Intel i9

param(
    [string]$OutputDir = "profiling_output",
    [string]$BuildType = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Divine Next.js Build Profiling Starting..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# ============================================
# CONFIGURATION
# ============================================
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$profileName = "nextjs_build_$timestamp"
$profilePath = "$OutputDir/$profileName.nsys-rep"

# Ensure output directory exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "✅ Created profiling output directory: $OutputDir" -ForegroundColor Green
}

# ============================================
# FIND NVIDIA NSIGHT SYSTEMS
# ============================================
$nsysPath = $null
$possiblePaths = @(
    "N:\installed apps\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe",
    "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe",
    "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe",
    "C:\Program Files\NVIDIA Corporation\Nsight Systems 2024.5.1\target-windows-x64\nsys.exe",
    "C:\Program Files\NVIDIA Corporation\Nsight Systems 2024.4.1\target-windows-x64\nsys.exe",
    "C:\Program Files\NVIDIA Corporation\Nsight Systems\target-windows-x64\nsys.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $nsysPath = $path
        break
    }
}

if (-not $nsysPath) {
    Write-Host "⚠️ NVIDIA Nsight Systems not found" -ForegroundColor Yellow
    Write-Host "   Falling back to basic build profiling..." -ForegroundColor Gray

    # Run build without profiling
    Write-Host "`n🏗️ Starting Next.js build..." -ForegroundColor Cyan
    $buildStart = Get-Date

    try {
        npm run build
        $buildEnd = Get-Date
        $duration = ($buildEnd - $buildStart).TotalSeconds

        Write-Host "`n✅ Build completed in $([math]::Round($duration, 2)) seconds" -ForegroundColor Green
    }
    catch {
        Write-Host "`n❌ Build failed: $_" -ForegroundColor Red
        exit 1
    }

    exit 0
}

Write-Host "✅ Found NVIDIA Nsight Systems: $nsysPath" -ForegroundColor Green

# ============================================
# CLEAN PREVIOUS BUILD ARTIFACTS
# ============================================
Write-Host "`n🧹 Cleaning previous build artifacts..." -ForegroundColor Yellow

$cleanPaths = @(".next", "out", ".turbo")
foreach ($path in $cleanPaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   Cleaned: $path" -ForegroundColor Gray
    }
}

# ============================================
# START PROFILING
# ============================================
Write-Host "`n🔍 Starting NVIDIA Nsight profiling of Next.js build..." -ForegroundColor Cyan
Write-Host "   Profile will be saved to: $profilePath" -ForegroundColor Gray

$nsysArgs = @(
    "profile",
    "--output=$profilePath",
    "--force-overwrite=true",
    "--trace=cuda,nvtx,osrt,opengl",
    "--sample=cpu",
    "--cpuctxsw=process-tree",
    "--backtrace=dwarf",
    "--delay=0",
    "--duration=0"  # No time limit - capture full build
)

# Add npm build command
$nsysArgs += "npm"
$nsysArgs += "run"
$nsysArgs += "build"

Write-Host "`n🚀 Executing profiled build..." -ForegroundColor Magenta
Write-Host "   Command: nsys $($nsysArgs -join ' ')" -ForegroundColor Gray

try {
    $process = Start-Process -FilePath $nsysPath `
        -ArgumentList $nsysArgs `
        -NoNewWindow `
        -Wait `
        -PassThru

    if ($process.ExitCode -eq 0) {
        Write-Host "`n✅ Build profiling completed successfully!" -ForegroundColor Green

        # ============================================
        # GENERATE STATISTICS
        # ============================================
        Write-Host "`n📊 Generating profiling statistics..." -ForegroundColor Cyan

        $statsOutput = "$OutputDir/${profileName}_stats.txt"
        $statsArgs = @(
            "stats",
            "--report=cuda_gpu_trace,cuda_api_sum,osrt_sum,nvtx_sum",
            "--format=column",
            "--output=$statsOutput",
            $profilePath
        )

        & $nsysPath @statsArgs 2>&1 | Out-Null

        if (Test-Path $statsOutput) {
            Write-Host "✅ Statistics saved to: $statsOutput" -ForegroundColor Green

            # Display summary
            Write-Host "`n📈 Build Profile Summary:" -ForegroundColor Cyan
            Write-Host "=" * 60 -ForegroundColor Gray

            $stats = Get-Content $statsOutput -Raw
            if ($stats -match "Time\s*\(%\).*?Total Time.*?(\d+\.?\d*)\s*ms") {
                Write-Host "   Total Build Time: $($matches[1]) ms" -ForegroundColor White
            }

            Write-Host "   Full report: $statsOutput" -ForegroundColor Gray
        }

        # ============================================
        # DIVINE INSIGHTS
        # ============================================
        Write-Host "`n🌟 Divine Performance Insights:" -ForegroundColor Magenta
        Write-Host "=" * 60 -ForegroundColor Gray

        if (Test-Path ".next") {
            $buildSize = (Get-ChildItem .next -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "   Build Output Size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor White
        }

        Write-Host "`n🔍 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Open profile: nsys-ui $profilePath" -ForegroundColor Gray
        Write-Host "   2. Analyze statistics: $statsOutput" -ForegroundColor Gray
        Write-Host "   3. Look for bottlenecks in CPU timeline" -ForegroundColor Gray
        Write-Host "   4. Optimize slow build steps" -ForegroundColor Gray

    }
    else {
        Write-Host "`n❌ Build profiling failed with exit code: $($process.ExitCode)" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "`n❌ Profiling error: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    exit 1
}

Write-Host "`n🎉 Divine build profiling complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
