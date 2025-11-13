#!/usr/bin/env pwsh
# ============================================
# 🔥 ADVANCED PERFORMANCE PROFILING WITH NVIDIA NSIGHT
# ============================================
# 🧠 DIVINE PATTERN: Performance Reality Bending - Advanced Multi-Metric Profiling
# 📚 Reference: 03_PERFORMANCE_REALITY_BENDING.instructions.md
# 🌾 Domain: Production-Grade Performance Analysis
# ⚡ Performance: Quantum Hardware Optimization (RTX 2070 Max-Q, 32GB RAM, 12 threads)

[CmdletBinding()]
param(
    [Parameter(HelpMessage="Output directory for profiling data")]
    [ValidateNotNullOrEmpty()]
    [string]$OutputDir = "profiling_output",

    [Parameter(HelpMessage="Profiling duration in seconds")]
    [ValidateRange(10, 3600)]
    [int]$Duration = 60,

    [Parameter(HelpMessage="Sampling interval in seconds")]
    [ValidateRange(1, 60)]
    [int]$Interval = 5,

    [Parameter(HelpMessage="Process name to profile")]
    [ValidateNotNullOrEmpty()]
    [string]$ProcessName = "node",

    [Parameter(HelpMessage="Include memory metrics")]
    [switch]$IncludeMemory,

    [Parameter(HelpMessage="Include disk I/O metrics")]
    [switch]$IncludeDisk
)

$ErrorActionPreference = "Stop"
$ProgressPreference = 'Continue'

# ============================================
# PARAMETER VALIDATION & NORMALIZATION
# ============================================
try {
    # Validate Duration vs Interval
    if ($Interval -ge $Duration) {
        throw "Interval ($Interval) must be less than Duration ($Duration)"
    }

    # Ensure output directory path is valid
    $OutputDir = $OutputDir.TrimEnd('\', '/')

    if ($Verbose) {
        Write-Host "🔍 Verbose mode enabled" -ForegroundColor Cyan
        Write-Host "   Parameters validated successfully" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Parameter validation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🔥 Divine Advanced Profiling Starting..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# ============================================
# CONFIGURATION
# ============================================
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$profileName = "advanced_profile_$timestamp"
$profilePath = "$OutputDir/$profileName.nsys-rep"
$metricsPath = "$OutputDir/${profileName}_metrics.json"

# Ensure output directory exists with error handling
try {
    if (-not (Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force -ErrorAction Stop | Out-Null
        Write-Host "✅ Created profiling output directory: $OutputDir" -ForegroundColor Green
    } else {
        Write-Host "✅ Using existing directory: $OutputDir" -ForegroundColor Green
    }

    # Test write permissions
    $testFile = Join-Path $OutputDir ".write_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
    try {
        [System.IO.File]::WriteAllText($testFile, "test")
        Remove-Item $testFile -Force -ErrorAction SilentlyContinue
    } catch {
        throw "No write permission in directory: $OutputDir"
    }
} catch {
    Write-Host "❌ Failed to create/access output directory: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# FIND NVIDIA NSIGHT SYSTEMS
# ============================================
Write-Host "`n🔍 Locating NVIDIA Nsight Systems..." -ForegroundColor Cyan

$nsysPath = $null
$possiblePaths = @(
    "N:\installed apps\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe",
    "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe",
    "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe",
    "C:\Program Files\NVIDIA Corporation\Nsight Systems 2024.5.1\target-windows-x64\nsys.exe",
    "C:\Program Files\NVIDIA Corporation\Nsight Systems 2024.4.1\target-windows-x64\nsys.exe",
    "C:\Program Files\NVIDIA Corporation\Nsight Systems\target-windows-x64\nsys.exe"
)

try {
    # Check PATH first
    $nsysInPath = Get-Command nsys -ErrorAction SilentlyContinue
    if ($nsysInPath) {
        $nsysPath = $nsysInPath.Source
        Write-Host "   Found in PATH: $nsysPath" -ForegroundColor Gray
    } else {
        # Check predefined paths
        foreach ($path in $possiblePaths) {
            if (Test-Path $path -ErrorAction SilentlyContinue) {
                $nsysPath = $path
                if ($Verbose) {
                    Write-Host "   Found at: $path" -ForegroundColor Gray
                }
                break
            }
        }
    }

    if (-not $nsysPath) {
        throw "NVIDIA Nsight Systems not found in PATH or common installation directories"
    }

    # Verify nsys is executable
    $nsysVersion = & $nsysPath --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "nsys.exe found but not executable or corrupted"
    }

    Write-Host "✅ Found NVIDIA Nsight Systems: $nsysPath" -ForegroundColor Green
    if ($Verbose -and $nsysVersion) {
        Write-Host "   Version: $($nsysVersion | Select-Object -First 1)" -ForegroundColor Gray
    }

} catch {
    Write-Host "❌ NVIDIA Nsight Systems not found!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "`n   Please install NVIDIA Nsight Systems from:" -ForegroundColor Yellow
    Write-Host "   https://developer.nvidia.com/nsight-systems" -ForegroundColor Cyan
    Write-Host "`n   Or add nsys.exe to your PATH" -ForegroundColor Yellow
    exit 1
}

# ============================================
# CHECK FOR RUNNING PROCESSES
# ============================================
Write-Host "`n🔍 Detecting running processes..." -ForegroundColor Cyan

try {
    $processes = Get-Process -Name $ProcessName -ErrorAction Stop

    if (-not $processes -or $processes.Count -eq 0) {
        throw "No running '$ProcessName' process found"
    }

    # Get all processes with detailed metrics
    $targetProcesses = $processes | Select-Object Id, ProcessName, @{
        Name = 'WorkingSetMB'
        Expression = { [math]::Round($_.WorkingSet64 / 1MB, 2) }
    }, @{
        Name = 'CPU'
        Expression = { [math]::Round($_.CPU, 2) }
    }, @{
        Name = 'Threads'
        Expression = { $_.Threads.Count }
    }, StartTime | Sort-Object CPU -Descending

    Write-Host "✅ Found $($targetProcesses.Count) process(es):" -ForegroundColor Green
    $targetProcesses | Format-Table -AutoSize | Out-String | Write-Host

    # Select primary process (highest CPU usage)
    $primaryPid = $targetProcesses[0].Id
    $primaryProcess = Get-Process -Id $primaryPid -ErrorAction Stop

    Write-Host "   📍 Selected primary process:" -ForegroundColor Cyan
    Write-Host "      PID: $primaryPid" -ForegroundColor White
    Write-Host "      Memory: $([math]::Round($primaryProcess.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "      Threads: $($primaryProcess.Threads.Count)" -ForegroundColor White
    Write-Host "      Start Time: $($primaryProcess.StartTime)" -ForegroundColor White

    # Validate process is still running
    if ($primaryProcess.HasExited) {
        throw "Selected process (PID $primaryPid) has exited"
    }

} catch {
    Write-Host "❌ Process detection failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "`n   💡 Troubleshooting:" -ForegroundColor Cyan
    Write-Host "   • Ensure your application is running" -ForegroundColor Gray
    Write-Host "   • Verify process name: '$ProcessName'" -ForegroundColor Gray
    Write-Host "   • Check: Get-Process -Name $ProcessName" -ForegroundColor Gray
    exit 1
}

# ============================================
# INITIALIZE METRICS COLLECTION
# ============================================
Write-Host "`n📊 Initializing metrics collection..." -ForegroundColor Cyan

# Initialize metrics samples array
$metricsSamples = @()

# Build metrics metadata object
try {
    $metrics = @{
        scriptVersion = "2.0.0"
        startTime = Get-Date -Format "o"
        duration = $Duration
        interval = $Interval
        processId = $primaryPid
        processName = $ProcessName
        samples = @()  # Will be populated after collection
        includeMemory = $IncludeMemory.IsPresent
        includeDisk = $IncludeDisk.IsPresent
        hwSpecs = @{
            gpu = "NVIDIA GeForce RTX 2070 Max-Q"
            cpu = "Intel Core i9"
            ram = "32GB DDR4"
            threads = 12
        }
        environment = @{
            osVersion = [System.Environment]::OSVersion.VersionString
            psVersion = $PSVersionTable.PSVersion.ToString()
            hostname = $env:COMPUTERNAME
        }
    }

    Write-Host "✅ Metrics structure initialized" -ForegroundColor Green

} catch {
    Write-Host "❌ Failed to initialize metrics: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n📊 Metrics Collection Configuration:" -ForegroundColor Cyan
Write-Host "   Duration: $Duration seconds" -ForegroundColor White
Write-Host "   Sampling Interval: $Interval seconds" -ForegroundColor White
Write-Host "   Expected Samples: $([math]::Floor($Duration / $Interval))" -ForegroundColor White
Write-Host "   Include Memory: $(if ($IncludeMemory) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($IncludeMemory) { 'Green' } else { 'Gray' })
Write-Host "   Include Disk I/O: $(if ($IncludeDisk) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($IncludeDisk) { 'Green' } else { 'Gray' })

# ============================================
# START BACKGROUND METRICS COLLECTION
# ============================================
Write-Host "`n🚀 Starting background metrics collection..." -ForegroundColor Magenta

try {
    $metricsJob = Start-Job -ScriptBlock {
        param($ProcessPid, $Duration, $Interval, $IncludeMemory, $IncludeDisk, $Verbose)

        $samples = @()
        $errors = @()
        $iterations = [math]::Floor($Duration / $Interval)
        $successfulSamples = 0
        $failedSamples = 0

        for ($i = 0; $i -lt $iterations; $i++) {
            try {
                $proc = Get-Process -Id $ProcessPid -ErrorAction Stop

                if ($proc) {
                    $sample = @{
                        timestamp = Get-Date -Format "o"
                        iteration = $i + 1
                        cpu = [math]::Round($proc.CPU, 2)
                        workingSetMB = [math]::Round($proc.WorkingSet64 / 1MB, 2)
                        privateMemoryMB = [math]::Round($proc.PrivateMemorySize64 / 1MB, 2)
                        virtualMemoryMB = [math]::Round($proc.VirtualMemorySize64 / 1MB, 2)
                        threads = $proc.Threads.Count
                        handles = $proc.HandleCount
                        processName = $proc.ProcessName
                    }

                    # Add memory details if requested
                    if ($IncludeMemory) {
                        $sample.peakWorkingSetMB = [math]::Round($proc.PeakWorkingSet64 / 1MB, 2)
                        $sample.pagedMemoryMB = [math]::Round($proc.PagedMemorySize64 / 1MB, 2)
                    }

                    # Add disk I/O if requested (Windows only)
                    if ($IncludeDisk) {
                        try {
                            $sample.totalProcessorTime = $proc.TotalProcessorTime.TotalSeconds
                            $sample.userProcessorTime = $proc.UserProcessorTime.TotalSeconds
                        } catch {
                            # Disk I/O metrics may not be available
                            if ($Verbose) {
                                $errors += "Sample $($i + 1): Disk I/O metrics unavailable"
                            }
                        }
                    }

                    $samples += $sample
                    $successfulSamples++
                } else {
                    $failedSamples++
                    $errors += "Sample $($i + 1): Process not found"
                }

            } catch {
                $failedSamples++
                $errors += "Sample $($i + 1): $($_.Exception.Message)"

                # If process is gone, stop collecting
                if ($_.Exception.Message -match "Cannot find a process") {
                    $errors += "Process $ProcessPid has exited. Stopping metrics collection."
                    break
                }
            }

            # Sleep for next iteration (unless it's the last one)
            if ($i -lt $iterations - 1) {
                Start-Sleep -Seconds $Interval
            }
        }

        return @{
            samples = $samples
            successfulSamples = $successfulSamples
            failedSamples = $failedSamples
            errors = $errors
            collectionComplete = $true
        }
    } -ArgumentList $primaryPid, $Duration, $Interval, $IncludeMemory.IsPresent, $IncludeDisk.IsPresent, $Verbose.IsPresent

    Write-Host "✅ Metrics collection job started (Job ID: $($metricsJob.Id))" -ForegroundColor Green

} catch {
    Write-Host "❌ Failed to start metrics collection: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# START NSIGHT PROFILING
# ============================================
Write-Host "`n🔍 Starting NVIDIA Nsight profiling..." -ForegroundColor Cyan
Write-Host "   Profile will be saved to: $profilePath" -ForegroundColor Gray

try {
    # Detect if process is GPU-enabled
    $processPath = (Get-Process -Id $primaryPid).Path
    $isGpuProcess = $false

    # Check if it's a known GPU application (Unity, Unreal, DirectX apps, etc.)
    if ($processPath -and ($processPath -match "Unity|Unreal|dx|cuda|opengl|vulkan" -or
        $ProcessName -match "Unity|Unreal|game")) {
        $isGpuProcess = $true
        Write-Host "   🎮 Detected potential GPU application" -ForegroundColor Cyan
    }

    # Configure tracing based on process type
    if ($isGpuProcess) {
        # Full GPU + CPU tracing for GPU applications
        $traceOptions = "cuda,nvtx,osrt,opengl,vulkan,dx11,dx12"
        Write-Host "   🎯 Using GPU + CPU profiling mode" -ForegroundColor Cyan
    } else {
        # CPU-only tracing for Node.js and non-GPU applications
        $traceOptions = "nvtx,osrt"
        Write-Host "   🎯 Using CPU-only profiling mode (Node.js optimized)" -ForegroundColor Cyan
        Write-Host "   💡 Note: NVIDIA Nsight is optimized for GPU apps. For pure CPU profiling," -ForegroundColor Gray
        Write-Host "      consider using Windows Performance Recorder or Node.js --prof" -ForegroundColor Gray
    }

    $nsysArgs = @(
        "profile",
        "--output=$profilePath",
        "--force-overwrite=true",
        "--trace=$traceOptions",
        "--sample=cpu",
        "--cpuctxsw=process-tree",
        "--backtrace=dwarf",
        "--delay=0",
        "--duration=$Duration",
        "--process-id=$primaryPid"
    )

    if ($Verbose) {
        Write-Host "`n   📋 Nsight Command:" -ForegroundColor Cyan
        Write-Host "   $nsysPath $($nsysArgs -join ' ')" -ForegroundColor Gray
    }

    Write-Host "`n⏱️  Profiling for $Duration seconds..." -ForegroundColor Yellow
    Write-Host "   💡 Tip: Interact with your application to capture realistic performance data" -ForegroundColor Gray

    $progressParams = @{
        Activity = "NVIDIA Nsight Profiling"
        Status = "Collecting performance data..."
        PercentComplete = 0
    }

    # Start profiling in background
    $nsightJob = Start-Job -ScriptBlock {
        param($NsysPath, $NsysArgs)
        try {
            $output = & $NsysPath @NsysArgs 2>&1
            return @{
                success = $LASTEXITCODE -eq 0
                exitCode = $LASTEXITCODE
                output = $output
            }
        } catch {
            return @{
                success = $false
                exitCode = -1
                error = $_.Exception.Message
                output = $null
            }
        }
    } -ArgumentList $nsysPath, $nsysArgs

    Write-Host "✅ Nsight profiling job started (Job ID: $($nsightJob.Id))" -ForegroundColor Green

    # Show progress with process monitoring
    $elapsed = 0
    $lastCheck = Get-Date
    while ($elapsed -lt $Duration) {
        Start-Sleep -Seconds 1
        $elapsed++
        $percent = [math]::Min(100, [math]::Round(($elapsed / $Duration) * 100))

        # Check if process is still alive every 5 seconds
        if (((Get-Date) - $lastCheck).TotalSeconds -ge 5) {
            $proc = Get-Process -Id $primaryPid -ErrorAction SilentlyContinue
            if (-not $proc) {
                Write-Host "`n⚠️  Warning: Target process (PID $primaryPid) has exited" -ForegroundColor Yellow
                break
            }
            $lastCheck = Get-Date
        }

        Write-Progress @progressParams -PercentComplete $percent -SecondsRemaining ($Duration - $elapsed)
    }

    Write-Progress @progressParams -Completed

    # Wait for profiling to complete
    Write-Host "`n⏳ Waiting for Nsight profiling to complete..." -ForegroundColor Cyan
    $nsightResult = Receive-Job -Job $nsightJob -Wait
    Remove-Job -Job $nsightJob

    # Check Nsight result
    if (-not $nsightResult.success) {
        Write-Host "⚠️  Nsight profiling completed with warnings (Exit Code: $($nsightResult.exitCode))" -ForegroundColor Yellow
        if ($Verbose -and $nsightResult.output) {
            Write-Host "`n   Output:" -ForegroundColor Gray
            $nsightResult.output | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        }
        if ($nsightResult.error) {
            Write-Host "   Error: $($nsightResult.error)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ Nsight profiling completed successfully" -ForegroundColor Green
    }

    # Wait for metrics collection
    Write-Host "⏳ Waiting for metrics collection to complete..." -ForegroundColor Cyan
    $metricsResult = Receive-Job -Job $metricsJob -Wait
    Remove-Job -Job $metricsJob

    # Extract samples from result
    if ($metricsResult -and $metricsResult.samples) {
        $metricsSamples = $metricsResult.samples
        Write-Host "✅ Metrics collection completed: $($metricsResult.successfulSamples) successful, $($metricsResult.failedSamples) failed" -ForegroundColor Green

        if ($Verbose -and $metricsResult.errors -and $metricsResult.errors.Count -gt 0) {
            Write-Host "`n   ⚠️  Metrics collection errors:" -ForegroundColor Yellow
            $metricsResult.errors | Select-Object -First 5 | ForEach-Object {
                Write-Host "      • $_" -ForegroundColor Gray
            }
            if ($metricsResult.errors.Count -gt 5) {
                Write-Host "      ... and $($metricsResult.errors.Count - 5) more" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "⚠️  Warning: No metrics samples collected" -ForegroundColor Yellow
        $metricsSamples = @()
    }

} catch {
    Write-Host "❌ Profiling error: $($_.Exception.Message)" -ForegroundColor Red

    # Cleanup jobs
    if ($nsightJob) {
        Stop-Job -Job $nsightJob -ErrorAction SilentlyContinue
        Remove-Job -Job $nsightJob -Force -ErrorAction SilentlyContinue
    }
    if ($metricsJob) {
        Stop-Job -Job $metricsJob -ErrorAction SilentlyContinue
        Remove-Job -Job $metricsJob -Force -ErrorAction SilentlyContinue
    }

    exit 1
}

try {
    $metrics.samples = $metricsSamples
    $metrics.endTime = Get-Date -Format "o"
    $metrics.totalSamples = $metricsSamples.Count
    $metrics.profilingSuccess = Test-Path $profilePath

    # Save metrics with error handling
    $metricsJson = $metrics | ConvertTo-Json -Depth 10 -ErrorAction Stop
    [System.IO.File]::WriteAllText($metricsPath, $metricsJson, [System.Text.Encoding]::UTF8)

    Write-Host "`n✅ Profiling completed!" -ForegroundColor Green
    Write-Host "✅ Metrics saved to: $metricsPath" -ForegroundColor Green

    # Verify profile file exists
    if (Test-Path $profilePath) {
        $profileFileSize = (Get-Item $profilePath).Length / 1MB
        Write-Host "✅ Profile file created: $([math]::Round($profileFileSize, 2)) MB" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Profile file not found at $profilePath" -ForegroundColor Yellow
    }

} catch {
    Write-Host "⚠️  Warning: Failed to save metrics: $($_.Exception.Message)" -ForegroundColor Yellow
    if ($Verbose) {
        Write-Host "   Metrics data may be incomplete" -ForegroundColor Gray
    }
}

# ============================================
# GENERATE COMPREHENSIVE STATISTICS
# ============================================
Write-Host "`n📊 Generating comprehensive statistics..." -ForegroundColor Cyan

if (Test-Path $profilePath) {
    try {
        $statsOutput = "$OutputDir/${profileName}_stats.txt"
        $statsArgs = @(
            "stats",
            "--report=cuda_gpu_trace,cuda_api_sum,osrt_sum,nvtx_sum,cuda_gpu_kern_sum",
            "--format=column",
            $profilePath
        )

        $statsResult = & $nsysPath @statsArgs 2>&1

        if ($LASTEXITCODE -eq 0) {
            $statsResult | Out-File -FilePath $statsOutput -Encoding UTF8 -ErrorAction Stop
            Write-Host "✅ Statistics saved to: $statsOutput" -ForegroundColor Green

            # Show summary if verbose
            if ($Verbose -and $statsResult) {
                Write-Host "`n   📈 Statistics Preview:" -ForegroundColor Cyan
                $statsResult | Select-Object -First 10 | ForEach-Object {
                    Write-Host "   $_" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "⚠️  Statistics generation completed with warnings (Exit Code: $LASTEXITCODE)" -ForegroundColor Yellow
            # Still save the output even if there were warnings
            $statsResult | Out-File -FilePath $statsOutput -Encoding UTF8 -ErrorAction SilentlyContinue
        }

    } catch {
        Write-Host "⚠️  Warning: Failed to generate statistics: $($_.Exception.Message)" -ForegroundColor Yellow
        if ($Verbose) {
            Write-Host "   Statistics may be incomplete or unavailable" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "⚠️  Skipping statistics generation: Profile file not found" -ForegroundColor Yellow
}

# ============================================
# EXPORT MULTIPLE FORMATS
# ============================================
Write-Host "`n📤 Exporting data in multiple formats..." -ForegroundColor Cyan

$exportSuccessCount = 0
$exportFailCount = 0

if (Test-Path $profilePath) {
    # CSV Export
    try {
        $csvOutput = "$OutputDir/${profileName}_timeline.csv"
        $csvExportResult = & $nsysPath export --type=csv --output=$csvOutput $profilePath 2>&1

        if ($LASTEXITCODE -eq 0 -and (Test-Path $csvOutput)) {
            $csvSize = (Get-Item $csvOutput).Length / 1KB
            Write-Host "✅ CSV timeline exported: $([math]::Round($csvSize, 2)) KB" -ForegroundColor Green
            $exportSuccessCount++
        } else {
            Write-Host "⚠️  CSV export failed (Exit Code: $LASTEXITCODE)" -ForegroundColor Yellow
            $exportFailCount++
            if ($Verbose -and $csvExportResult) {
                Write-Host "   Error: $csvExportResult" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "⚠️  CSV export error: $($_.Exception.Message)" -ForegroundColor Yellow
        $exportFailCount++
    }

    # SQLite Export
    try {
        $sqliteOutput = "$OutputDir/${profileName}.sqlite"
        $sqliteExportResult = & $nsysPath export --type=sqlite --output=$sqliteOutput $profilePath 2>&1

        if ($LASTEXITCODE -eq 0 -and (Test-Path $sqliteOutput)) {
            $sqliteSize = (Get-Item $sqliteOutput).Length / 1MB
            Write-Host "✅ SQLite database exported: $([math]::Round($sqliteSize, 2)) MB" -ForegroundColor Green
            $exportSuccessCount++
        } else {
            Write-Host "⚠️  SQLite export failed (Exit Code: $LASTEXITCODE)" -ForegroundColor Yellow
            $exportFailCount++
            if ($Verbose -and $sqliteExportResult) {
                Write-Host "   Error: $sqliteExportResult" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "⚠️  SQLite export error: $($_.Exception.Message)" -ForegroundColor Yellow
        $exportFailCount++
    }

    if ($exportSuccessCount -gt 0) {
        Write-Host "`n✅ Exported $exportSuccessCount format(s) successfully" -ForegroundColor Green
    }
    if ($exportFailCount -gt 0) {
        Write-Host "⚠️  $exportFailCount export(s) failed" -ForegroundColor Yellow
    }

} else {
    Write-Host "⚠️  Skipping exports: Profile file not found" -ForegroundColor Yellow
}

# ============================================
# ANALYZE METRICS
# ============================================
Write-Host "`n🌟 Divine Performance Analysis:" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor Gray

if ($metricsSamples -and $metricsSamples.Count -gt 0) {
    try {
        # Calculate statistics
        $cpuStats = $metricsSamples | Measure-Object -Property cpu -Average -Maximum -Minimum
        $memoryStats = $metricsSamples | Measure-Object -Property workingSetMB -Average -Maximum -Minimum
        $threadStats = $metricsSamples | Measure-Object -Property threads -Average -Maximum -Minimum

        Write-Host "📈 Resource Usage Metrics:" -ForegroundColor Cyan
        Write-Host "   CPU Time:" -ForegroundColor White
        Write-Host "      Average: $([math]::Round($cpuStats.Average, 2)) seconds" -ForegroundColor Gray
        Write-Host "      Peak: $([math]::Round($cpuStats.Maximum, 2)) seconds" -ForegroundColor Gray

        Write-Host "   Memory Usage (Working Set):" -ForegroundColor White
        Write-Host "      Average: $([math]::Round($memoryStats.Average, 2)) MB" -ForegroundColor Gray
        Write-Host "      Peak: $([math]::Round($memoryStats.Maximum, 2)) MB" -ForegroundColor Gray
        Write-Host "      Min: $([math]::Round($memoryStats.Minimum, 2)) MB" -ForegroundColor Gray

        Write-Host "   Thread Count:" -ForegroundColor White
        Write-Host "      Average: $([math]::Round($threadStats.Average, 0))" -ForegroundColor Gray
        Write-Host "      Peak: $($threadStats.Maximum)" -ForegroundColor Gray

        Write-Host "   Samples:" -ForegroundColor White
        Write-Host "      Total Collected: $($metricsSamples.Count)" -ForegroundColor Gray
        Write-Host "      Expected: $([math]::Floor($Duration / $Interval))" -ForegroundColor Gray

        # Memory growth analysis
        if ($metricsSamples.Count -gt 1) {
            $firstMemory = $metricsSamples[0].workingSetMB
            $lastMemory = $metricsSamples[-1].workingSetMB
            $memoryGrowth = $lastMemory - $firstMemory
            $growthPercent = if ($firstMemory -gt 0) { ($memoryGrowth / $firstMemory) * 100 } else { 0 }

            Write-Host "   Memory Growth:" -ForegroundColor White
            $growthColor = if ($growthPercent -gt 20) { "Red" } elseif ($growthPercent -gt 10) { "Yellow" } else { "Green" }
            Write-Host "      Delta: $([math]::Round($memoryGrowth, 2)) MB ($([math]::Round($growthPercent, 1))%)" -ForegroundColor $growthColor
        }

    } catch {
        Write-Host "⚠️  Error calculating metrics: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No metrics samples available for analysis" -ForegroundColor Yellow
}

# Output files summary
Write-Host "`n📦 Output Files:" -ForegroundColor Cyan
try {
    if (Test-Path $profilePath) {
        $profileSize = (Get-Item $profilePath).Length / 1MB
        Write-Host "   ✅ Profile: $([math]::Round($profileSize, 2)) MB" -ForegroundColor White
        Write-Host "      Path: $profilePath" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Profile: Not created" -ForegroundColor Red
    }

    if (Test-Path $metricsPath) {
        $metricsSize = (Get-Item $metricsPath).Length / 1KB
        Write-Host "   ✅ Metrics: $([math]::Round($metricsSize, 2)) KB" -ForegroundColor White
    }

    if (Test-Path $statsOutput) {
        $statsSize = (Get-Item $statsOutput).Length / 1KB
        Write-Host "   ✅ Statistics: $([math]::Round($statsSize, 2)) KB" -ForegroundColor White
    }

    if (Test-Path $csvOutput) {
        Write-Host "   ✅ CSV Export: Available" -ForegroundColor White
    }

    if (Test-Path $sqliteOutput) {
        Write-Host "   ✅ SQLite DB: Available" -ForegroundColor White
    }

    Write-Host "`n   📁 Location: $OutputDir" -ForegroundColor Cyan

} catch {
    Write-Host "   ⚠️  Error listing files: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ============================================
# RECOMMENDATIONS
# ============================================
Write-Host "`n🔍 Next Steps - Performance Analysis:" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n1️⃣ Open in Nsight UI (Recommended):" -ForegroundColor Yellow
Write-Host "   nsys-ui $profilePath" -ForegroundColor Cyan

Write-Host "`n2️⃣ Analyze Metrics JSON:" -ForegroundColor Yellow
Write-Host "   Get-Content $metricsPath | ConvertFrom-Json" -ForegroundColor Cyan

Write-Host "`n3️⃣ Review Statistics:" -ForegroundColor Yellow
Write-Host "   Get-Content $statsOutput" -ForegroundColor Cyan

Write-Host "`n4️⃣ Query SQLite Database:" -ForegroundColor Yellow
Write-Host "   sqlite3 $sqliteOutput" -ForegroundColor Cyan

Write-Host "`n🎯 Focus Areas:" -ForegroundColor Magenta
Write-Host "   ⚡ CPU hotspots and long-running functions" -ForegroundColor Gray
Write-Host "   🧠 Memory allocation patterns" -ForegroundColor Gray
Write-Host "   💾 I/O operations and blocking calls" -ForegroundColor Gray
Write-Host "   🔄 Thread synchronization issues" -ForegroundColor Gray
Write-Host "   🌐 API call performance" -ForegroundColor Gray

Write-Host "`n🎉 Divine advanced profiling complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
