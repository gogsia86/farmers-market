#!/usr/bin/env pwsh
# ============================================
# 🚀 BASIC PERFORMANCE PROFILING WITH NVIDIA NSIGHT
# ============================================
# 🧠 DIVINE PATTERN: Performance Reality Bending - Basic CPU/GPU Profiling
# 📚 Reference: 03_PERFORMANCE_REALITY_BENDING.instructions.md
# 🌾 Domain: Development Environment Profiling
# ⚡ Performance: Quantum Hardware Optimization (RTX 2070 Max-Q, 32GB RAM)

param(
    [string]$OutputDir = "profiling_output",
    [string]$ProcessName = "node",
    [int]$Duration = 30  # seconds
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Divine Basic Profiling Starting..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# ============================================
# CONFIGURATION
# ============================================
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$profileName = "basic_profile_$timestamp"
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
    Write-Host "❌ NVIDIA Nsight Systems not found!" -ForegroundColor Red
    Write-Host "   Please install NVIDIA Nsight Systems from:" -ForegroundColor Yellow
    Write-Host "   https://developer.nvidia.com/nsight-systems" -ForegroundColor Cyan
    Write-Host "`n   Searched paths:" -ForegroundColor Gray
    foreach ($path in $possiblePaths) {
        Write-Host "   - $path" -ForegroundColor Gray
    }
    exit 1
}

Write-Host "✅ Found NVIDIA Nsight Systems: $nsysPath" -ForegroundColor Green

# ============================================
# CHECK FOR RUNNING DEV SERVER
# ============================================
Write-Host "`n🔍 Checking for running development server..." -ForegroundColor Cyan

$devProcess = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowTitle -match "Next.js|node" -or $_.Path -match "node" } |
    Select-Object -First 1

if (-not $devProcess) {
    Write-Host "⚠️ No running $ProcessName process found" -ForegroundColor Yellow
    Write-Host "   Please start your development server first:" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Cyan
    Write-Host "`n   Or specify a different process with: -ProcessName <name>" -ForegroundColor Gray
    exit 1
}

$processPid = $devProcess.Id
Write-Host "✅ Found process: $ProcessName (PID: $processPid)" -ForegroundColor Green

# ============================================
# START PROFILING
# ============================================
Write-Host "`n🔍 Starting NVIDIA Nsight profiling for $Duration seconds..." -ForegroundColor Cyan
Write-Host "   Profile will be saved to: $profilePath" -ForegroundColor Gray

$nsysArgs = @(
    "profile",
    "--output=$profilePath",
    "--force-overwrite=true",
    "--trace=cuda,nvtx,osrt,opengl,vulkan",
    "--sample=cpu",
    "--cpuctxsw=process-tree",
    "--backtrace=dwarf",
    "--delay=0",
    "--duration=$Duration",
    "--process-id=$processPid"
)

Write-Host "`n🚀 Profiling active..." -ForegroundColor Magenta
Write-Host "   Process ID: $processPid" -ForegroundColor White
Write-Host "   Duration: $Duration seconds" -ForegroundColor White
Write-Host "   Interact with your application to capture performance data..." -ForegroundColor Yellow

try {
    $process = Start-Process -FilePath $nsysPath `
        -ArgumentList $nsysArgs `
        -NoNewWindow `
        -Wait `
        -PassThru

    if ($process.ExitCode -eq 0) {
        Write-Host "`n✅ Profiling completed successfully!" -ForegroundColor Green

        # ============================================
        # GENERATE STATISTICS
        # ============================================
        Write-Host "`n📊 Generating profiling statistics..." -ForegroundColor Cyan

        $statsOutput = "$OutputDir/${profileName}_stats.txt"
        $statsArgs = @(
            "stats",
            "--report=cuda_gpu_trace,cuda_api_sum,osrt_sum,nvtx_sum",
            "--format=column",
            $profilePath
        )

        $stats = & $nsysPath @statsArgs 2>&1
        $stats | Out-File -FilePath $statsOutput -Encoding UTF8

        if (Test-Path $statsOutput) {
            Write-Host "✅ Statistics saved to: $statsOutput" -ForegroundColor Green

            # Display key metrics
            Write-Host "`n📈 Profile Summary:" -ForegroundColor Cyan
            Write-Host "=" * 60 -ForegroundColor Gray

            $statsContent = Get-Content $statsOutput -Raw

            # Extract CPU usage if available
            if ($statsContent -match "CPU\s+Time") {
                Write-Host "   CPU Activity Captured ✓" -ForegroundColor White
            }

            # Extract GPU usage if available
            if ($statsContent -match "GPU\s+Time|CUDA") {
                Write-Host "   GPU Activity Captured ✓" -ForegroundColor White
            } else {
                Write-Host "   No GPU activity detected (expected for Node.js)" -ForegroundColor Gray
            }

            Write-Host "`n   Full statistics: $statsOutput" -ForegroundColor Gray
        }

        # ============================================
        # EXPORT TO CSV FOR ANALYSIS
        # ============================================
        Write-Host "`n📊 Exporting timeline data to CSV..." -ForegroundColor Cyan

        $csvOutput = "$OutputDir/${profileName}_timeline.csv"
        $exportArgs = @(
            "export",
            "--type=csv",
            "--output=$csvOutput",
            $profilePath
        )

        & $nsysPath @exportArgs 2>&1 | Out-Null

        if (Test-Path $csvOutput) {
            Write-Host "✅ Timeline exported to: $csvOutput" -ForegroundColor Green
        }

        # ============================================
        # DIVINE INSIGHTS
        # ============================================
        Write-Host "`n🌟 Divine Performance Insights:" -ForegroundColor Magenta
        Write-Host "=" * 60 -ForegroundColor Gray

        $fileInfo = Get-Item $profilePath
        Write-Host "   Profile Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "   Duration: $Duration seconds" -ForegroundColor White
        Write-Host "   Process: $ProcessName (PID: $processPid)" -ForegroundColor White

        Write-Host "`n🔍 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Open profile in Nsight UI:" -ForegroundColor Gray
        Write-Host "      nsys-ui $profilePath" -ForegroundColor Cyan
        Write-Host "`n   2. Analyze statistics:" -ForegroundColor Gray
        Write-Host "      Get-Content $statsOutput" -ForegroundColor Cyan
        Write-Host "`n   3. Look for performance bottlenecks:" -ForegroundColor Gray
        Write-Host "      - High CPU usage functions" -ForegroundColor Yellow
        Write-Host "      - Long-running operations" -ForegroundColor Yellow
        Write-Host "      - I/O blocking patterns" -ForegroundColor Yellow

    } else {
        Write-Host "`n❌ Profiling failed with exit code: $($process.ExitCode)" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "`n❌ Profiling error: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    exit 1
}

Write-Host "`n🎉 Divine profiling complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
