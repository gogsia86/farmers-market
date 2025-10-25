#!/usr/bin/env pwsh
# ============================================================================
# NEXT.JS BUILD PROFILING SCRIPT - HP OMEN RTX 2070 DIVINE BUILD PROFILER
# ============================================================================
# Purpose: Profile Next.js build process for optimization insights
# Hardware: RTX 2070 Max-Q + 64GB RAM + 12 threads
# Updated: October 22, 2025
# ============================================================================

param(
    [string]$BuildType = "production",
    [string]$OutputDir = "profiling_output"
)

Write-Host "🏗️  Starting Next.js Build Divine Profiling..." -ForegroundColor Green
Write-Host "Build Type: $BuildType" -ForegroundColor Cyan
Write-Host "Output Directory: $OutputDir" -ForegroundColor Cyan

# Create output directory
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "📁 Created output directory: $OutputDir" -ForegroundColor Yellow
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Ensure we're in the correct directory
if (!(Test-Path "package.json")) {
    Write-Warning "⚠️  Not in project root. Changing to Farmers-Market directory..."
    Set-Location "Farmers-Market" -ErrorAction SilentlyContinue
    if (!(Test-Path "package.json")) {
        Write-Error "❌ Cannot find package.json. Please run from project root."
        exit 1
    }
}

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "out") {
    Remove-Item "out" -Recurse -Force -ErrorAction SilentlyContinue
}

# Determine build command based on type
$buildCommand = switch ($BuildType.ToLower()) {
    "production" { "build:production" }
    "optimized" { "build:optimized" }
    "safe" { "build:safe" }
    "basic" { "build" }
    default { "build" }
}

Write-Host "🎯 Build Command: npm run $buildCommand" -ForegroundColor Cyan

# Start profiling
$buildLogFile = "$OutputDir\build_log_$timestamp.txt"
$buildMetricsFile = "$OutputDir\build_metrics_$timestamp.json"
$buildReportFile = "$OutputDir\build_report_$timestamp.md"

Write-Host "📊 Starting build profiling..." -ForegroundColor Green

# Capture system state before build
$beforeBuild = @{
    Timestamp = Get-Date
    Memory = @{
        Available = (Get-CimInstance -ClassName Win32_OperatingSystem).FreePhysicalMemory * 1KB
        Total = (Get-CimInstance -ClassName Win32_ComputerSystem).TotalPhysicalMemory
    }
    CPU = (Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples[0].CookedValue
    Disk = @{
        FreeSpace = (Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object {$_.DeviceID -eq "V:"}).FreeSpace
    }
}

# Run the build with profiling
$buildStartTime = Get-Date

try {
    Write-Host "🚀 Executing build command..." -ForegroundColor Green

    # Use Measure-Command to capture execution time and run with detailed logging
    $buildDuration = Measure-Command {
        $buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", $buildCommand -NoNewWindow -PassThru -RedirectStandardOutput $buildLogFile -RedirectStandardError "$OutputDir\build_errors_$timestamp.txt" -Wait
        $global:buildExitCode = $buildProcess.ExitCode
    }

    $buildEndTime = Get-Date

    Write-Host "⏱️  Build completed in $([math]::Round($buildDuration.TotalSeconds, 2)) seconds" -ForegroundColor Cyan

    # Capture system state after build
    $afterBuild = @{
        Timestamp = Get-Date
        Memory = @{
            Available = (Get-CimInstance -ClassName Win32_OperatingSystem).FreePhysicalMemory * 1KB
            Total = (Get-CimInstance -ClassName Win32_ComputerSystem).TotalPhysicalMemory
        }
        CPU = (Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples[0].CookedValue
        Disk = @{
            FreeSpace = (Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object {$_.DeviceID -eq "V:"}).FreeSpace
        }
    }

    # Analyze build artifacts
    $buildArtifacts = @{
        NextJsDir = if (Test-Path ".next") {
            @{
                Size = (Get-ChildItem ".next" -Recurse | Measure-Object -Property Length -Sum).Sum
                Files = (Get-ChildItem ".next" -Recurse -File).Count
                Directories = (Get-ChildItem ".next" -Recurse -Directory).Count
            }
        } else { $null }
        OutDir = if (Test-Path "out") {
            @{
                Size = (Get-ChildItem "out" -Recurse | Measure-Object -Property Length -Sum).Sum
                Files = (Get-ChildItem "out" -Recurse -File).Count
                Directories = (Get-ChildItem "out" -Recurse -Directory).Count
            }
        } else { $null }
    }

    # Create comprehensive metrics
    $buildMetrics = @{
        BuildInfo = @{
            Command = $buildCommand
            Type = $BuildType
            StartTime = $buildStartTime
            EndTime = $buildEndTime
            Duration = $buildDuration.TotalSeconds
            ExitCode = $global:buildExitCode
            Success = ($global:buildExitCode -eq 0)
        }
        Performance = @{
            BeforeBuild = $beforeBuild
            AfterBuild = $afterBuild
            MemoryUsed = $beforeBuild.Memory.Available - $afterBuild.Memory.Available
            DiskUsed = $beforeBuild.Disk.FreeSpace - $afterBuild.Disk.FreeSpace
        }
        Artifacts = $buildArtifacts
        Hardware = @{
            CPU = "Intel i7-9750H (6 cores, 12 threads)"
            GPU = "NVIDIA RTX 2070 Max-Q"
            RAM = "64GB DDR4"
            Storage = "NVMe SSD"
        }
    }

    # Save metrics to JSON
    $buildMetrics | ConvertTo-Json -Depth 10 | Out-File -FilePath $buildMetricsFile -Encoding UTF8

    # Generate detailed report
    @"
# 🏗️  Next.js Build Performance Report
**Generated:** $(Get-Date)
**Hardware:** HP OMEN i7-9750H + RTX 2070 Max-Q + 64GB RAM
**Project:** Farmers Market Platform

## 📊 Build Summary

- **Build Type:** $BuildType
- **Command:** ``npm run $buildCommand``
- **Duration:** $([math]::Round($buildDuration.TotalSeconds, 2)) seconds
- **Status:** $(if ($global:buildExitCode -eq 0) { "✅ SUCCESS" } else { "❌ FAILED (Exit Code: $global:buildExitCode)" })
- **Start Time:** $buildStartTime
- **End Time:** $buildEndTime

## 🎯 Performance Metrics

### Memory Usage
- **Memory Used:** $([math]::Round(($beforeBuild.Memory.Available - $afterBuild.Memory.Available) / 1GB, 2)) GB
- **Available Before:** $([math]::Round($beforeBuild.Memory.Available / 1GB, 2)) GB
- **Available After:** $([math]::Round($afterBuild.Memory.Available / 1GB, 2)) GB
- **Total System Memory:** $([math]::Round($beforeBuild.Memory.Total / 1GB, 2)) GB

### Disk Usage
- **Disk Used:** $([math]::Round(($beforeBuild.Disk.FreeSpace - $afterBuild.Disk.FreeSpace) / 1MB, 2)) MB
- **Free Space Before:** $([math]::Round($beforeBuild.Disk.FreeSpace / 1GB, 2)) GB
- **Free Space After:** $([math]::Round($afterBuild.Disk.FreeSpace / 1GB, 2)) GB

## 📁 Build Artifacts

$(if ($buildArtifacts.NextJsDir) {
    @"
### .next Directory
- **Size:** $([math]::Round($buildArtifacts.NextJsDir.Size / 1MB, 2)) MB
- **Files:** $($buildArtifacts.NextJsDir.Files)
- **Directories:** $($buildArtifacts.NextJsDir.Directories)
"@
} else {
    "### .next Directory: Not found"
})

$(if ($buildArtifacts.OutDir) {
    @"
### out Directory
- **Size:** $([math]::Round($buildArtifacts.OutDir.Size / 1MB, 2)) MB
- **Files:** $($buildArtifacts.OutDir.Files)
- **Directories:** $($buildArtifacts.OutDir.Directories)
"@
} else {
    "### out Directory: Not found"
})

## 🔧 Build Optimization Insights

### Performance Analysis
$(if ($buildDuration.TotalSeconds -lt 30) {
    "✅ **Excellent:** Build is very fast (< 30 seconds)"
} elseif ($buildDuration.TotalSeconds -lt 60) {
    "🟡 **Good:** Build time is acceptable (30-60 seconds)"
} elseif ($buildDuration.TotalSeconds -lt 120) {
    "🟠 **Moderate:** Build time could be improved (1-2 minutes)"
} else {
    "🔴 **Slow:** Build time needs optimization (> 2 minutes)"
})

### Memory Efficiency
$(if (($beforeBuild.Memory.Available - $afterBuild.Memory.Available) / 1GB -lt 1) {
    "✅ **Excellent:** Memory usage is very efficient (< 1 GB)"
} elseif (($beforeBuild.Memory.Available - $afterBuild.Memory.Available) / 1GB -lt 4) {
    "🟡 **Good:** Memory usage is reasonable (1-4 GB)"
} else {
    "🔴 **High:** Memory usage is high (> 4 GB) - consider optimization"
})

## 🚀 Optimization Recommendations

### Build Speed Improvements
1. **Enable SWC:** Ensure SWC compiler is enabled in next.config.js
2. **Optimize Images:** Use Next.js Image Optimization
3. **Tree Shaking:** Remove unused dependencies and code
4. **Parallel Processing:** Leverage all 12 CPU threads
5. **Cache Management:** Use Next.js build cache effectively

### Memory Optimization
1. **Code Splitting:** Implement dynamic imports
2. **Bundle Analysis:** Use ``npm run analyze:bundle``
3. **Dependency Audit:** Remove heavy unused dependencies
4. **Webpack Config:** Optimize webpack configuration

### Hardware Utilization
- **CPU:** Fully utilize 12-thread capability
- **Memory:** Leverage 64GB for extensive caching
- **Storage:** Optimize for NVMe SSD performance

## 📈 Monitoring Commands

```powershell
# Analyze bundle size
npm run analyze:bundle

# Profile build with detailed timing
ANALYZE=true npm run build

# Monitor system resources during build
Get-Process node | Select-Object Name, WorkingSet, CPU
```

## 📋 Files Generated

- **Build Log:** ``$buildLogFile``
- **Error Log:** ``$OutputDir\build_errors_$timestamp.txt``
- **Metrics:** ``$buildMetricsFile``
- **Report:** ``$buildReportFile``

**Report generated by Divine Build Profiling System v1.0**
"@ | Out-File -FilePath $buildReportFile -Encoding UTF8

    if ($global:buildExitCode -eq 0) {
        Write-Host "✅ Build profiling completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed with exit code: $global:buildExitCode" -ForegroundColor Red
    }

    Write-Host "📊 Metrics saved to: $buildMetricsFile" -ForegroundColor Cyan
    Write-Host "📋 Report saved to: $buildReportFile" -ForegroundColor Cyan

} catch {
    Write-Error "❌ Build profiling failed: $_"

    # Create error report
    @{
        Error = $_.ToString()
        Timestamp = Get-Date
        Command = $buildCommand
        BuildType = $BuildType
    } | ConvertTo-Json | Out-File -FilePath "$OutputDir\build_error_$timestamp.json" -Encoding UTF8

    exit 1
}

Write-Host ""
Write-Host "🌟 NEXT.JS BUILD PROFILING COMPLETE! 🌟" -ForegroundColor Green
Write-Host "📁 All files saved to: $OutputDir" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Quick Summary:" -ForegroundColor Yellow
Write-Host "  Duration: $([math]::Round($buildDuration.TotalSeconds, 2)) seconds" -ForegroundColor White
Write-Host "  Status: $(if ($global:buildExitCode -eq 0) { "✅ SUCCESS" } else { "❌ FAILED" })" -ForegroundColor White
Write-Host "  Memory Used: $([math]::Round(($beforeBuild.Memory.Available - $afterBuild.Memory.Available) / 1GB, 2)) GB" -ForegroundColor White
Write-Host ""
