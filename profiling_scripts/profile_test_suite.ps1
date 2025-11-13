#!/usr/bin/env pwsh
# ============================================
# 🧪 TEST SUITE PROFILING WITH NVIDIA NSIGHT
# ============================================
# 🧠 DIVINE PATTERN: Performance Reality Bending - Test Performance Analysis
# 📚 Reference: 03_PERFORMANCE_REALITY_BENDING.instructions.md
# 🌾 Domain: Test Suite Performance Optimization
# ⚡ Performance: Quantum Hardware Optimization (RTX 2070 Max-Q, 32GB RAM)

param(
    [string]$OutputDir = "profiling_output",
    [string]$TestPattern = "",  # Optional: specific test pattern
    [switch]$Coverage = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🧪 Divine Test Suite Profiling Starting..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# ============================================
# CONFIGURATION
# ============================================
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$profileName = "test_suite_$timestamp"
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
    Write-Host "   Falling back to basic test profiling..." -ForegroundColor Gray

    # Run tests without profiling
    Write-Host "`n🧪 Starting test suite..." -ForegroundColor Cyan
    $testStart = Get-Date

    try {
        if ($Coverage) {
            npm test -- --coverage
        } elseif ($TestPattern) {
            npm test -- --testNamePattern="$TestPattern"
        } else {
            npm test
        }

        $testEnd = Get-Date
        $duration = ($testEnd - $testStart).TotalSeconds

        Write-Host "`n✅ Tests completed in $([math]::Round($duration, 2)) seconds" -ForegroundColor Green
    }
    catch {
        Write-Host "`n❌ Tests failed: $_" -ForegroundColor Red
        exit 1
    }

    exit 0
}

Write-Host "✅ Found NVIDIA Nsight Systems: $nsysPath" -ForegroundColor Green

# ============================================
# CONFIGURE TEST COMMAND
# ============================================
Write-Host "`n🔧 Configuring test execution..." -ForegroundColor Cyan

$testArgs = @()

if ($Coverage) {
    Write-Host "   Coverage collection: ENABLED" -ForegroundColor Green
    $testArgs += "--coverage"
}

if ($TestPattern) {
    Write-Host "   Test pattern: $TestPattern" -ForegroundColor Green
    $testArgs += "--testNamePattern=$TestPattern"
}

# ============================================
# START PROFILING
# ============================================
Write-Host "`n🔍 Starting NVIDIA Nsight profiling of test suite..." -ForegroundColor Cyan
Write-Host "   Profile will be saved to: $profilePath" -ForegroundColor Gray

# Configure nsys arguments
$nsysArgs = @(
    "profile",
    "--output=$profilePath",
    "--force-overwrite=true",
    "--trace=cuda,nvtx,osrt,cublas,cudnn",
    "--sample=cpu",
    "--cpuctxsw=process-tree",
    "--duration=60",
    "npm",
    "test"
)

if ($testArgs.Count -gt 0) {
    $nsysArgs += "--"
    $nsysArgs += $testArgs
}

Write-Host "`n🚀 Executing profiled test suite..." -ForegroundColor Magenta
Write-Host "   Command: nsys $($nsysArgs -join ' ')" -ForegroundColor Gray

$testStartTime = Get-Date

try {
    $process = Start-Process -FilePath $nsysPath `
        -ArgumentList $nsysArgs `
        -NoNewWindow `
        -Wait `
        -PassThru

    $testEndTime = Get-Date
    $testDuration = ($testEndTime - $testStartTime).TotalSeconds

    if ($process.ExitCode -eq 0) {
        Write-Host "`n✅ Test suite profiling completed successfully!" -ForegroundColor Green
        Write-Host "   Duration: $([math]::Round($testDuration, 2)) seconds" -ForegroundColor White

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
        }

        # ============================================
        # EXPORT TO CSV
        # ============================================
        Write-Host "`n📊 Exporting timeline data..." -ForegroundColor Cyan

        $csvOutput = "$OutputDir/${profileName}_timeline.csv"
        & $nsysPath export --type=csv --output=$csvOutput $profilePath 2>&1 | Out-Null

        if (Test-Path $csvOutput) {
            Write-Host "✅ Timeline exported to: $csvOutput" -ForegroundColor Green
        }

        # ============================================
        # ANALYZE TEST RESULTS
        # ============================================
        Write-Host "`n🌟 Divine Test Performance Analysis:" -ForegroundColor Magenta
        Write-Host "=" * 60 -ForegroundColor Gray

        $profileSize = (Get-Item $profilePath).Length / 1MB
        Write-Host "📦 Profile Information:" -ForegroundColor Cyan
        Write-Host "   Profile Size: $([math]::Round($profileSize, 2)) MB" -ForegroundColor White
        Write-Host "   Total Duration: $([math]::Round($testDuration, 2)) seconds" -ForegroundColor White
        Write-Host "   Test Pattern: $(if ($TestPattern) { $TestPattern } else { 'All tests' })" -ForegroundColor White
        Write-Host "   Coverage: $(if ($Coverage) { 'Enabled' } else { 'Disabled' })" -ForegroundColor White

        # Check for coverage report
        if ($Coverage -and (Test-Path "coverage")) {
            Write-Host "`n📊 Coverage Report:" -ForegroundColor Cyan

            $coverageSummary = Get-Content "coverage/coverage-summary.json" -ErrorAction SilentlyContinue
            if ($coverageSummary) {
                $coverage = $coverageSummary | ConvertFrom-Json
                $totalCoverage = $coverage.total

                if ($totalCoverage) {
                    Write-Host "   Lines: $($totalCoverage.lines.pct)%" -ForegroundColor White
                    Write-Host "   Statements: $($totalCoverage.statements.pct)%" -ForegroundColor White
                    Write-Host "   Functions: $($totalCoverage.functions.pct)%" -ForegroundColor White
                    Write-Host "   Branches: $($totalCoverage.branches.pct)%" -ForegroundColor White
                }
            }
        }

        # ============================================
        # PERFORMANCE INSIGHTS
        # ============================================
        Write-Host "`n🎯 Performance Insights:" -ForegroundColor Cyan
        Write-Host "=" * 60 -ForegroundColor Gray

        Write-Host "   Focus on optimizing:" -ForegroundColor Yellow
        Write-Host "   • Slow test cases (>1s)" -ForegroundColor Gray
        Write-Host "   • Setup/teardown overhead" -ForegroundColor Gray
        Write-Host "   • Database mock performance" -ForegroundColor Gray
        Write-Host "   • Module import times" -ForegroundColor Gray
        Write-Host "   • Async operation handling" -ForegroundColor Gray

        Write-Host "`n🔍 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Open profile: nsys-ui $profilePath" -ForegroundColor Gray
        Write-Host "   2. Analyze statistics: Get-Content $statsOutput" -ForegroundColor Gray
        Write-Host "   3. Identify slow tests in timeline view" -ForegroundColor Gray
        Write-Host "   4. Optimize test setup/teardown" -ForegroundColor Gray
        Write-Host "   5. Profile specific slow tests: -TestPattern 'YourTest'" -ForegroundColor Gray

        # Generate recommendations
        Write-Host "`n💡 Optimization Recommendations:" -ForegroundColor Magenta

        if ($testDuration -gt 60) {
            Write-Host "   ⚠️ Long test duration detected (>60s)" -ForegroundColor Yellow
            Write-Host "      Consider: Test parallelization, selective mocking" -ForegroundColor Gray
        }

        if ($testDuration -lt 5) {
            Write-Host "   ✅ Fast test suite! Consider:" -ForegroundColor Green
            Write-Host "      - Adding more edge case tests" -ForegroundColor Gray
            Write-Host "      - Increasing test coverage" -ForegroundColor Gray
        }

    } else {
        Write-Host "`n❌ Test suite profiling failed with exit code: $($process.ExitCode)" -ForegroundColor Red
        Write-Host "   Check test output above for errors" -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host "`n❌ Profiling error: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    exit 1
}

Write-Host "`n🎉 Divine test profiling complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
