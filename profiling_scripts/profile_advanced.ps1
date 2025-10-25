#!/usr/bin/env pwsh
# ============================================================================
# ADVANCED PROFILING SCRIPT - HP OMEN RTX 2070 DIVINE PROFILING
# ============================================================================
# Purpose: Advanced performance profiling with CUDA, memory, and CPU analysis
# Hardware: RTX 2070 Max-Q + 64GB RAM + 12 threads
# Updated: October 22, 2025
# ============================================================================

param(
  [string]$Duration = "60",
  [string]$Interval = "5",
  [string]$OutputDir = "profiling_output"
)

Write-Host "🔥 Starting Advanced Divine Profiling..." -ForegroundColor Magenta
Write-Host "Duration: $Duration seconds" -ForegroundColor Cyan
Write-Host "Sampling Interval: $Interval seconds" -ForegroundColor Cyan
Write-Host "Output Directory: $OutputDir" -ForegroundColor Cyan

# Create output directory
if (!(Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
  Write-Host "📁 Created output directory: $OutputDir" -ForegroundColor Yellow
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Check if we're in the correct directory
$currentDir = Get-Location
if (!(Test-Path "package.json")) {
  Write-Warning "⚠️  Not in a Node.js project directory. Changing to Farmers-Market directory..."
  Set-Location "Farmers-Market" -ErrorAction SilentlyContinue
  if (!(Test-Path "package.json")) {
    Write-Error "❌ Cannot find package.json. Please run from project root."
    exit 1
  }
}

# 1. NVIDIA GPU Profiling (if available)
$nsysPath = Get-Command nsys -ErrorAction SilentlyContinue
if ($nsysPath) {
  Write-Host "🎯 Phase 1: NVIDIA GPU Profiling..." -ForegroundColor Green
  $gpuProfileFile = "$OutputDir\advanced_gpu_$timestamp.nsys-rep"

  & nsys profile `
    --trace=cuda, nvtx `
    --duration=$Duration `
    --sample=cpu `
    --cpuctxsw=true `
    --gpu-metrics-device=all `
    --output=$gpuProfileFile `
    --force-overwrite=true `
    --stats=true `
    npm run dev:turbo &

  # Wait for development server to start
  Write-Host "⏳ Waiting for development server..." -ForegroundColor Yellow
  Start-Sleep -Seconds 10

  # Stop the dev server after profiling
  Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

  if (Test-Path "$gpuProfileFile") {
    Write-Host "✅ GPU profiling complete!" -ForegroundColor Green
    Write-Host "📊 GPU profile: $gpuProfileFile" -ForegroundColor Cyan
  }
}
else {
  Write-Warning "⚠️  NVIDIA Nsight Systems not available. Skipping GPU profiling."
}

# 2. Memory Profiling
Write-Host "🧠 Phase 2: Memory Analysis..." -ForegroundColor Green
$memoryProfileFile = "$OutputDir\memory_profile_$timestamp.json"

try {
  node --inspect --max-old-space-size=32768 ../profiling_scripts/memory-profiler.js > $memoryProfileFile
  Write-Host "✅ Memory profiling complete!" -ForegroundColor Green
  Write-Host "📊 Memory profile: $memoryProfileFile" -ForegroundColor Cyan
}
catch {
  Write-Warning "⚠️  Memory profiling failed: $_"
}

# 3. CPU Performance Analysis
Write-Host "⚡ Phase 3: CPU Performance Analysis..." -ForegroundColor Green
$cpuProfileFile = "$OutputDir\cpu_profile_$timestamp.json"

try {
  node --prof ../profiling_scripts/cpu-affinity.js
  # Process the .log file created by --prof
  $logFile = Get-ChildItem -Name "isolate-*.log" | Select-Object -First 1
  if ($logFile) {
    node --prof-process $logFile > $cpuProfileFile
    Remove-Item $logFile -Force
    Write-Host "✅ CPU profiling complete!" -ForegroundColor Green
    Write-Host "📊 CPU profile: $cpuProfileFile" -ForegroundColor Cyan
  }
}
catch {
  Write-Warning "⚠️  CPU profiling failed: $_"
}

# 4. System Resource Monitoring
Write-Host "📊 Phase 4: System Resource Monitoring..." -ForegroundColor Green
$resourceFile = "$OutputDir\system_resources_$timestamp.txt"

try {
  # Get system information
  @"
========================================
HP OMEN SYSTEM RESOURCES - $timestamp
========================================

CPU Information:
$(Get-CimInstance -ClassName Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed)

Memory Information:
$(Get-CimInstance -ClassName Win32_ComputerSystem | Select-Object TotalPhysicalMemory)
$(Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object FreePhysicalMemory, TotalVirtualMemorySize, FreeVirtualMemory)

GPU Information:
$(Get-CimInstance -ClassName Win32_VideoController | Where-Object {$_.Name -like "*NVIDIA*"} | Select-Object Name, AdapterRAM, DriverVersion)

Disk Information:
$(Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3} | Select-Object DeviceID, Size, FreeSpace)

Network Adapters:
$(Get-CimInstance -ClassName Win32_NetworkAdapter | Where-Object {$_.NetEnabled -eq $true} | Select-Object Name, Speed)

Current Processes (Top 10 by CPU):
$(Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 | Format-Table Name, CPU, WorkingSet, Id -AutoSize | Out-String)

Current Processes (Top 10 by Memory):
$(Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 | Format-Table Name, CPU, WorkingSet, Id -AutoSize | Out-String)
"@ | Out-File -FilePath $resourceFile -Encoding UTF8

  Write-Host "✅ System monitoring complete!" -ForegroundColor Green
  Write-Host "📊 Resource log: $resourceFile" -ForegroundColor Cyan
}
catch {
  Write-Warning "⚠️  System monitoring failed: $_"
}

# 5. Generate Summary Report
Write-Host "📋 Phase 5: Generating Summary Report..." -ForegroundColor Green
$summaryFile = "$OutputDir\profiling_summary_$timestamp.md"

try {
  @"
# 🔥 Advanced Divine Profiling Report
**Generated:** $(Get-Date)
**Hardware:** HP OMEN i7-9750H + RTX 2070 Max-Q + 64GB RAM
**Project:** Farmers Market Platform

## 📊 Profile Files Generated

### GPU Profiling
- **File:** $(if($gpuProfileFile -and (Test-Path $gpuProfileFile)) { $gpuProfileFile } else { "Not available (NVIDIA Nsight Systems required)" })
- **Tool:** NVIDIA Nsight Systems
- **Duration:** $Duration seconds

### Memory Analysis
- **File:** $(if(Test-Path $memoryProfileFile) { $memoryProfileFile } else { "Generation failed" })
- **Tool:** Node.js Memory Profiler
- **Max Memory:** 32GB allocated

### CPU Performance
- **File:** $(if(Test-Path $cpuProfileFile) { $cpuProfileFile } else { "Generation failed" })
- **Tool:** Node.js CPU Profiler
- **Threads:** 12 logical processors

### System Resources
- **File:** $(if(Test-Path $resourceFile) { $resourceFile } else { "Generation failed" })
- **Tool:** PowerShell WMI queries
- **Snapshot:** System state during profiling

## 🎯 Next Steps

1. **Analyze GPU Profile:** Use NVIDIA Nsight Systems to open .nsys-rep file
2. **Review Memory Usage:** Check memory profile for potential leaks
3. **Optimize CPU Usage:** Identify hot paths in CPU profile
4. **Monitor Resources:** Track system utilization trends

## 🔧 Commands for Analysis

```powershell
# Open GPU profile in Nsight Systems
nsys-ui $gpuProfileFile

# Generate GPU statistics
nsys stats --report cuda_gpu_trace,cuda_api_sum --format column $gpuProfileFile

# View memory profile
Get-Content $memoryProfileFile | ConvertFrom-Json | Format-Table

# Analyze CPU profile
Get-Content $cpuProfileFile
```

## 📈 Performance Recommendations

- **Memory:** Monitor for memory leaks in development
- **GPU:** Ensure CUDA operations are efficiently batched
- **CPU:** Profile critical rendering paths
- **I/O:** Watch for excessive file system operations

**Report generated by Divine Profiling System v1.0**
"@ | Out-File -FilePath $summaryFile -Encoding UTF8

  Write-Host "✅ Summary report generated!" -ForegroundColor Green
  Write-Host "📊 Summary: $summaryFile" -ForegroundColor Cyan
}
catch {
  Write-Warning "⚠️  Summary generation failed: $_"
}

Write-Host ""
Write-Host "🌟 ADVANCED DIVINE PROFILING COMPLETE! 🌟" -ForegroundColor Magenta
Write-Host "📁 All files saved to: $OutputDir" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review summary report: $summaryFile" -ForegroundColor White
Write-Host "  2. Analyze profiles with appropriate tools" -ForegroundColor White
Write-Host "  3. Apply performance optimizations" -ForegroundColor White
Write-Host "  4. Re-profile to measure improvements" -ForegroundColor White
Write-Host ""
