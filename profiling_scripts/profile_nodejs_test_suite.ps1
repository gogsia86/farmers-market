#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Node.js Test Suite Profiling with NVIDIA Nsight Systems
    Divine Performance Analysis for Agricultural Test Consciousness

.DESCRIPTION
    Profiles the complete Node.js test suite execution with comprehensive metrics:
    - CPU utilization across 12 threads
    - Memory usage patterns (32GB RAM optimization)
    - Test execution timeline and bottlenecks
    - Jest worker performance
    - File I/O operations during testing
    - Agricultural consciousness validation

.PARAMETER Duration
    Maximum profiling duration in seconds (default: 300 = 5 minutes)

.PARAMETER TestPattern
    Jest test pattern to run (default: all tests)

.PARAMETER Workers
    Number of Jest workers (default: 6 for HP OMEN 12-thread optimization)

.PARAMETER Coverage
    Enable code coverage collection (default: $false)

.PARAMETER Verbose
    Enable verbose output

.EXAMPLE
    .\profile_nodejs_test_suite.ps1
    Run all tests with default profiling

.EXAMPLE
    .\profile_nodejs_test_suite.ps1 -TestPattern "farm" -Workers 8 -Coverage
    Profile farm-related tests with 8 workers and coverage

.EXAMPLE
    .\profile_nodejs_test_suite.ps1 -Duration 600 -Verbose
    Extended 10-minute profiling with verbose output

.NOTES
    Hardware: HP OMEN - Intel Core i7-10750H (6 cores, 12 threads), 32GB RAM, RTX 2070 Max-Q
    Divine Consciousness: Agricultural Testing Patterns
    Performance Target: <30s for full test suite
#>

param(
    [Parameter(HelpMessage = "Maximum profiling duration in seconds")]
    [int]$Duration = 300,

    [Parameter(HelpMessage = "Jest test pattern (regex)")]
    [string]$TestPattern = "",

    [Parameter(HelpMessage = "Number of Jest workers")]
    [int]$Workers = 6,

    [Parameter(HelpMessage = "Enable code coverage")]
    [switch]$Coverage,

    [Parameter(HelpMessage = "Enable verbose output")]
    [switch]$Verbose
)

# Divine Script Configuration
$ErrorActionPreference = "Stop"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

# ============================================
# DIVINE CONSTANTS & PATHS
# ============================================
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR
$OUTPUT_DIR = Join-Path $PROJECT_ROOT "profiling_output"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$PROFILE_NAME = "nodejs_test_suite_${TIMESTAMP}"
$NSYS_PATH = "C:\Program Files\NVIDIA Corporation\Nsight Systems 2024.5.1\bin\nsys.exe"

# Hardware Configuration (HP OMEN Optimization)
$HP_OMEN_CORES = 6
$HP_OMEN_THREADS = 12
$HP_OMEN_RAM_GB = 32
$OPTIMAL_WORKERS = [Math]::Min($Workers, [Math]::Floor($HP_OMEN_THREADS * 0.6))

# ============================================
# DIVINE FUNCTIONS
# ============================================

function Write-DivineHeader {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  🧪 NODE.JS TEST SUITE PROFILING - NVIDIA NSIGHT SYSTEMS     ║" -ForegroundColor Cyan
    Write-Host "║  Divine Performance Analysis for Agricultural Tests           ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-DivineSection {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══ $Title ═══" -ForegroundColor Yellow
}

function Test-Prerequisites {
    Write-DivineSection "Validating Prerequisites"

    # Check NVIDIA Nsight Systems
    if (-not (Test-Path $NSYS_PATH)) {
        Write-Host "❌ NVIDIA Nsight Systems not found at: $NSYS_PATH" -ForegroundColor Red
        Write-Host "   Please install from: https://developer.nvidia.com/nsight-systems" -ForegroundColor Yellow
        return $false
    }
    Write-Host "✅ NVIDIA Nsight Systems: Found" -ForegroundColor Green

    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js not found. Please install Node.js." -ForegroundColor Red
        return $false
    }

    # Check npm/package.json
    if (-not (Test-Path (Join-Path $PROJECT_ROOT "package.json"))) {
        Write-Host "❌ package.json not found in project root" -ForegroundColor Red
        return $false
    }
    Write-Host "✅ package.json: Found" -ForegroundColor Green

    # Check Jest configuration
    $hasJest = $false
    $packageJson = Get-Content (Join-Path $PROJECT_ROOT "package.json") -Raw | ConvertFrom-Json
    if ($packageJson.devDependencies.jest -or $packageJson.dependencies.jest) {
        $hasJest = $true
        Write-Host "✅ Jest: Configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Jest not found in dependencies" -ForegroundColor Yellow
    }

    # Check output directory
    if (-not (Test-Path $OUTPUT_DIR)) {
        New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null
        Write-Host "✅ Output directory created: $OUTPUT_DIR" -ForegroundColor Green
    } else {
        Write-Host "✅ Output directory: $OUTPUT_DIR" -ForegroundColor Green
    }

    return $true
}

function Get-HardwareInfo {
    Write-DivineSection "HP OMEN Hardware Configuration"

    Write-Host "🖥️  CPU Cores: $HP_OMEN_CORES" -ForegroundColor Cyan
    Write-Host "⚡ CPU Threads: $HP_OMEN_THREADS" -ForegroundColor Cyan
    Write-Host "💾 RAM: ${HP_OMEN_RAM_GB}GB" -ForegroundColor Cyan
    Write-Host "🎯 Optimal Jest Workers: $OPTIMAL_WORKERS" -ForegroundColor Cyan

    # Get actual system info
    try {
        $cpu = Get-CimInstance -ClassName Win32_Processor | Select-Object -First 1
        $ram = Get-CimInstance -ClassName Win32_ComputerSystem
        $ramGB = [Math]::Round($ram.TotalPhysicalMemory / 1GB, 2)

        Write-Host ""
        Write-Host "Detected System:" -ForegroundColor Gray
        Write-Host "  CPU: $($cpu.Name)" -ForegroundColor Gray
        Write-Host "  Cores: $($cpu.NumberOfCores)" -ForegroundColor Gray
        Write-Host "  Logical Processors: $($cpu.NumberOfLogicalProcessors)" -ForegroundColor Gray
        Write-Host "  RAM: ${ramGB}GB" -ForegroundColor Gray
    } catch {
        Write-Verbose "Could not retrieve detailed hardware info: $_"
    }
}

function Get-TestConfiguration {
    Write-DivineSection "Test Suite Configuration"

    $config = @{
        Workers = $OPTIMAL_WORKERS
        MaxWorkers = $OPTIMAL_WORKERS
        TestPattern = if ($TestPattern) { $TestPattern } else { "all tests" }
        Coverage = $Coverage.IsPresent
        Timeout = $Duration
        NodeOptions = "--max-old-space-size=$($HP_OMEN_RAM_GB * 512)"
    }

    Write-Host "👥 Jest Workers: $($config.Workers)" -ForegroundColor Cyan
    Write-Host "🎯 Test Pattern: $($config.TestPattern)" -ForegroundColor Cyan
    Write-Host "📊 Coverage: $($config.Coverage)" -ForegroundColor Cyan
    Write-Host "⏱️  Timeout: $($config.Timeout)s" -ForegroundColor Cyan
    Write-Host "🧠 Node Memory: $($config.NodeOptions)" -ForegroundColor Cyan

    return $config
}

function Build-JestCommand {
    param($Config)

    $jestArgs = @(
        "test"
        "--maxWorkers=$($Config.Workers)"
        "--runInBand=false"
    )

    if ($TestPattern) {
        $jestArgs += $TestPattern
    }

    if ($Config.Coverage) {
        $jestArgs += "--coverage"
        $jestArgs += "--coverageDirectory=profiling_output/coverage_$TIMESTAMP"
    }

    # Performance optimizations
    $jestArgs += "--silent"
    $jestArgs += "--detectOpenHandles"
    $jestArgs += "--forceExit"

    return $jestArgs
}

function Start-ProfiledTestSuite {
    param($Config)

    Write-DivineSection "Starting Profiled Test Execution"

    $profilePath = Join-Path $OUTPUT_DIR "$PROFILE_NAME.nsys-rep"
    $logPath = Join-Path $OUTPUT_DIR "${PROFILE_NAME}_log.txt"
    $metricsPath = Join-Path $OUTPUT_DIR "${PROFILE_NAME}_metrics.json"

    # Build Jest command
    $jestArgs = Build-JestCommand -Config $Config
    $jestCommand = "npm " + ($jestArgs -join " ")

    Write-Host "🚀 Jest Command: $jestCommand" -ForegroundColor Cyan
    Write-Host "📁 Profile Output: $profilePath" -ForegroundColor Cyan
    Write-Host ""

    # Build Nsight Systems command
    $nsysArgs = @(
        "profile"
        "--output=$profilePath"
        "--force-overwrite=true"
        "--sample=cpu"
        "--cpuctxsw=none"
        "--trace=osrt,nvtx"
        "--duration=$Duration"
        "--delay=2"
        "--stats=true"
        "--export=text,json"
    )

    # Add npm test command
    $nsysArgs += "npm"
    $nsysArgs += $jestArgs

    Write-Host "⚡ Starting NVIDIA Nsight Systems profiling..." -ForegroundColor Yellow
    Write-Host "   This may take several minutes depending on test suite size..." -ForegroundColor Gray
    Write-Host ""

    $startTime = Get-Date

    try {
        # Set environment variables for optimal performance
        $env:NODE_OPTIONS = $Config.NodeOptions
        $env:UV_THREADPOOL_SIZE = $HP_OMEN_THREADS
        $env:JEST_WORKERS = $Config.Workers

        # Change to project root
        Push-Location $PROJECT_ROOT

        # Execute profiling
        $process = Start-Process -FilePath $NSYS_PATH `
            -ArgumentList $nsysArgs `
            -NoNewWindow `
            -PassThru `
            -Wait `
            -RedirectStandardOutput $logPath `
            -RedirectStandardError "${logPath}.err"

        $exitCode = $process.ExitCode

        Pop-Location

        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds

        Write-Host ""
        if ($exitCode -eq 0) {
            Write-Host "✅ Profiling completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Profiling completed with warnings (Exit Code: $exitCode)" -ForegroundColor Yellow
        }
        Write-Host "⏱️  Duration: $([Math]::Round($duration, 2))s" -ForegroundColor Cyan

        return @{
            Success = ($exitCode -eq 0)
            Duration = $duration
            ProfilePath = $profilePath
            LogPath = $logPath
            ExitCode = $exitCode
        }

    } catch {
        Write-Host "❌ Profiling failed: $_" -ForegroundColor Red
        Write-Host $_.ScriptStackTrace -ForegroundColor Red
        Pop-Location
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

function Invoke-PostProcessing {
    param($Result)

    if (-not $Result.Success) {
        Write-Host "⚠️  Skipping post-processing due to profiling errors" -ForegroundColor Yellow
        return
    }

    Write-DivineSection "Post-Processing & Analysis"

    # Check if profile file exists
    if (-not (Test-Path $Result.ProfilePath)) {
        Write-Host "⚠️  Profile file not found: $($Result.ProfilePath)" -ForegroundColor Yellow
        return
    }

    $profileSize = (Get-Item $Result.ProfilePath).Length
    $profileSizeMB = [Math]::Round($profileSize / 1MB, 2)
    Write-Host "📁 Profile Size: ${profileSizeMB}MB" -ForegroundColor Cyan

    # Generate statistics
    Write-Host ""
    Write-Host "📊 Generating statistics..." -ForegroundColor Yellow

    $statsPath = Join-Path $OUTPUT_DIR "${PROFILE_NAME}_stats.txt"

    try {
        & $NSYS_PATH stats `
            --report cuda_api_sum,osrt_sum,nvtx_sum `
            --format column `
            --output $statsPath `
            $Result.ProfilePath 2>&1 | Out-Null

        if (Test-Path $statsPath) {
            Write-Host "✅ Statistics generated: $statsPath" -ForegroundColor Green
        }
    } catch {
        Write-Verbose "Could not generate statistics: $_"
    }

    # Check for log file
    if (Test-Path $Result.LogPath) {
        $logSize = (Get-Item $Result.LogPath).Length
        if ($logSize -gt 0) {
            Write-Host "📄 Log file: $($Result.LogPath)" -ForegroundColor Cyan
        }
    }
}

function Show-ProfileSummary {
    param($Result, $Config)

    Write-DivineSection "Profile Summary"

    Write-Host "Profile Information:" -ForegroundColor Cyan
    Write-Host "  Name: $PROFILE_NAME" -ForegroundColor White
    Write-Host "  Path: $($Result.ProfilePath)" -ForegroundColor White
    Write-Host "  Duration: $([Math]::Round($Result.Duration, 2))s" -ForegroundColor White
    Write-Host "  Workers: $($Config.Workers)" -ForegroundColor White
    Write-Host "  Pattern: $($Config.TestPattern)" -ForegroundColor White
    Write-Host "  Coverage: $($Config.Coverage)" -ForegroundColor White

    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Open profile in Nsight Systems UI:" -ForegroundColor White
    Write-Host "     nsys-ui `"$($Result.ProfilePath)`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. View statistics:" -ForegroundColor White
    Write-Host "     Get-Content `"$(Join-Path $OUTPUT_DIR "${PROFILE_NAME}_stats.txt")`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Analyze test performance bottlenecks" -ForegroundColor White
    Write-Host "  4. Optimize slow tests and I/O operations" -ForegroundColor White
    Write-Host "  5. Review worker utilization patterns" -ForegroundColor White
}

function Save-ProfileMetadata {
    param($Result, $Config)

    $metadata = @{
        ProfileName = $PROFILE_NAME
        Timestamp = $TIMESTAMP
        ProfilePath = $Result.ProfilePath
        Duration = $Result.Duration
        Success = $Result.Success
        Configuration = $Config
        Hardware = @{
            Cores = $HP_OMEN_CORES
            Threads = $HP_OMEN_THREADS
            RAM_GB = $HP_OMEN_RAM_GB
        }
        System = @{
            OS = [System.Environment]::OSVersion.VersionString
            NodeVersion = (node --version)
            PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        }
    }

    $metadataPath = Join-Path $OUTPUT_DIR "${PROFILE_NAME}_metadata.json"
    $metadata | ConvertTo-Json -Depth 5 | Set-Content $metadataPath

    Write-Verbose "Metadata saved: $metadataPath"
}

# ============================================
# MAIN EXECUTION
# ============================================

function Main {
    try {
        Write-DivineHeader

        # Validate prerequisites
        if (-not (Test-Prerequisites)) {
            Write-Host ""
            Write-Host "❌ Prerequisites check failed. Please resolve the issues above." -ForegroundColor Red
            exit 1
        }

        # Show hardware info
        Get-HardwareInfo

        # Get test configuration
        $config = Get-TestConfiguration

        # Confirm execution
        Write-Host ""
        Write-Host "Ready to start profiling. Press Ctrl+C to cancel..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2

        # Start profiled test execution
        $result = Start-ProfiledTestSuite -Config $config

        # Post-processing
        Invoke-PostProcessing -Result $result

        # Save metadata
        Save-ProfileMetadata -Result $result -Config $config

        # Show summary
        Show-ProfileSummary -Result $result -Config $config

        Write-Host ""
        Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║  ✅ NODE.JS TEST SUITE PROFILING COMPLETE                     ║" -ForegroundColor Green
        Write-Host "║  Agricultural Testing Consciousness Preserved 🌾              ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""

        exit 0

    } catch {
        Write-Host ""
        Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
        Write-Host "║  ❌ PROFILING FAILED                                           ║" -ForegroundColor Red
        Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host $_.ScriptStackTrace -ForegroundColor Red
        exit 1
    }
}

# Execute main function
Main
