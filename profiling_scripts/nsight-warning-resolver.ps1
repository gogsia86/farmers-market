#!/usr/bin/env pwsh
# ============================================
# 🔧 NVIDIA NSIGHT WARNING RESOLVER
# ============================================
# 🧠 DIVINE PATTERN: Intelligent Troubleshooting & Resolution
# 📚 Reference: NSIGHT_SETUP.md
# 🌾 Domain: Performance Profiling Troubleshooting

[CmdletBinding()]
param(
    [Parameter(HelpMessage="Process name to check")]
    [string]$ProcessName = "node",

    [Parameter(HelpMessage="Run diagnostic tests")]
    [switch]$Diagnose,

    [Parameter(HelpMessage="Show detailed recommendations")]
    [switch]$Recommendations
)

$ErrorActionPreference = "Continue"

Write-Host "🔧 NVIDIA Nsight Warning Resolver" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# ============================================
# DIAGNOSTIC FUNCTIONS
# ============================================

function Test-NsightInstallation {
    Write-Host "`n🔍 Checking NVIDIA Nsight installation..." -ForegroundColor Cyan

    $nsysPath = $null
    $possiblePaths = @(
        "N:\installed apps\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe",
        "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe",
        "C:\Program Files\NVIDIA Corporation\Nsight Systems\target-windows-x64\nsys.exe"
    )

    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $nsysPath = $path
            Write-Host "   ✅ Found: $path" -ForegroundColor Green

            # Get version
            $version = & $path --version 2>&1 | Select-Object -First 1
            Write-Host "   📦 Version: $version" -ForegroundColor Gray
            return $nsysPath
        }
    }

    Write-Host "   ❌ NVIDIA Nsight Systems not found" -ForegroundColor Red
    Write-Host "   💡 Download from: https://developer.nvidia.com/nsight-systems" -ForegroundColor Yellow
    return $null
}

function Test-ProcessGpuCapability {
    param([string]$ProcName)

    Write-Host "`n🎮 Checking process GPU capability..." -ForegroundColor Cyan

    $processes = Get-Process -Name $ProcName -ErrorAction SilentlyContinue

    if (-not $processes) {
        Write-Host "   ⚠️  No '$ProcName' process running" -ForegroundColor Yellow
        return $null
    }

    $proc = $processes[0]
    Write-Host "   ✅ Process found: PID $($proc.Id)" -ForegroundColor Green

    $processPath = $proc.Path
    $isGpuCapable = $false

    if ($processPath) {
        Write-Host "   📂 Path: $processPath" -ForegroundColor Gray

        # Check if it's a known GPU application
        $gpuIndicators = @("Unity", "Unreal", "cuda", "dx", "opengl", "vulkan", "game", "render")
        foreach ($indicator in $gpuIndicators) {
            if ($processPath -match $indicator -or $ProcName -match $indicator) {
                $isGpuCapable = $true
                Write-Host "   🎯 GPU-capable: Detected '$indicator'" -ForegroundColor Cyan
                break
            }
        }
    }

    if (-not $isGpuCapable) {
        Write-Host "   💻 CPU-only process (e.g., Node.js, Python, .NET)" -ForegroundColor Yellow
        Write-Host "   ℹ️  This process doesn't use GPU features" -ForegroundColor Gray
    }

    return @{
        Process = $proc
        IsGpuCapable = $isGpuCapable
        Path = $processPath
    }
}

function Get-CommonIssues {
    Write-Host "`n📋 Common NVIDIA Nsight Issues & Solutions:" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray

    $issues = @(
        @{
            Issue = "Exit Code 1 - Profile not created"
            Cause = "Process has no GPU activity to profile"
            Solution = @(
                "✅ Use CPU-only trace: --trace=nvtx,osrt",
                "✅ Remove GPU traces: cuda,opengl,vulkan,dx11,dx12",
                "✅ Use profile_advanced.ps1 (auto-detects process type)",
                "💡 Alternative: Use Node.js built-in profiler: node --prof app.js"
            )
        },
        @{
            Issue = "Cannot attach to process"
            Cause = "Insufficient permissions or process protected"
            Solution = @(
                "✅ Run PowerShell as Administrator",
                "✅ Check antivirus/security software blocking",
                "✅ Ensure process isn't a protected system process"
            )
        },
        @{
            Issue = "Profile file too large"
            Cause = "Long profiling duration with high sampling rate"
            Solution = @(
                "✅ Reduce duration: -Duration 30",
                "✅ Increase interval: -Interval 10",
                "✅ Focus on specific operations, not entire session"
            )
        },
        @{
            Issue = "Missing CUDA/GPU traces"
            Cause = "Application doesn't use GPU"
            Solution = @(
                "✅ This is expected for CPU-only apps (Node.js, Python, etc.)",
                "✅ Use CPU profiling mode instead",
                "✅ Check OS runtime traces for CPU bottlenecks"
            )
        }
    )

    foreach ($item in $issues) {
        Write-Host "`n❌ Issue: $($item.Issue)" -ForegroundColor Red
        Write-Host "   Cause: $($item.Cause)" -ForegroundColor Yellow
        Write-Host "   Solutions:" -ForegroundColor Cyan
        foreach ($solution in $item.Solution) {
            Write-Host "      $solution" -ForegroundColor Gray
        }
    }
}

function Get-Recommendations {
    param([hashtable]$ProcessInfo)

    Write-Host "`n💡 Recommendations for ${ProcessName}:" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray

    if ($ProcessInfo -and -not $ProcessInfo.IsGpuCapable) {
        Write-Host "`n📍 CPU-Only Process Detected (Node.js, Python, .NET, etc.)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🎯 Best Profiling Tools:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   1️⃣ Node.js Built-in Profiler (Recommended)" -ForegroundColor Green
        Write-Host "      node --prof app.js" -ForegroundColor Gray
        Write-Host "      node --prof-process isolate-*.log > processed.txt" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   2️⃣ Chrome DevTools (Best for V8)" -ForegroundColor Green
        Write-Host "      node --inspect-brk app.js" -ForegroundColor Gray
        Write-Host "      Open: chrome://inspect" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   3️⃣ Windows Performance Recorder" -ForegroundColor Green
        Write-Host "      wpr -start CPU -filemode" -ForegroundColor Gray
        Write-Host "      # Run your app" -ForegroundColor Gray
        Write-Host "      wpr -stop output.etl" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   4️⃣ NVIDIA Nsight (Limited CPU profiling)" -ForegroundColor Yellow
        Write-Host "      .\profile_advanced.ps1  # Auto-configures for CPU-only" -ForegroundColor Gray
        Write-Host "      Traces: OS runtime + CPU sampling only" -ForegroundColor Gray
        Write-Host ""

    } else {
        Write-Host "`n🎮 GPU-Capable Process Detected" -ForegroundColor Green
        Write-Host ""
        Write-Host "✅ NVIDIA Nsight is the perfect tool for this!" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   Recommended command:" -ForegroundColor Green
        Write-Host "   .\profile_advanced.ps1 -Duration 60" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   Will capture:" -ForegroundColor Cyan
        Write-Host "   • CUDA GPU traces" -ForegroundColor Gray
        Write-Host "   • Graphics API calls (DX11/12, OpenGL, Vulkan)" -ForegroundColor Gray
        Write-Host "   • CPU sampling" -ForegroundColor Gray
        Write-Host "   • OS runtime traces" -ForegroundColor Gray
        Write-Host ""
    }

    Write-Host "📚 Additional Resources:" -ForegroundColor Cyan
    Write-Host "   • NSIGHT_SETUP.md - Full setup guide" -ForegroundColor Gray
    Write-Host "   • README.md - Profiling scripts overview" -ForegroundColor Gray
    Write-Host "   • 03_PERFORMANCE_REALITY_BENDING.instructions.md - Divine patterns" -ForegroundColor Gray
}

# ============================================
# MAIN EXECUTION
# ============================================

if ($Diagnose) {
    # Run full diagnostics
    $nsysPath = Test-NsightInstallation
    $processInfo = Test-ProcessGpuCapability -ProcName $ProcessName
    Get-CommonIssues

    if ($processInfo) {
        Get-Recommendations -ProcessInfo $processInfo
    }

} elseif ($Recommendations) {
    # Just show recommendations
    $processInfo = Test-ProcessGpuCapability -ProcName $ProcessName
    Get-Recommendations -ProcessInfo $processInfo

} else {
    # Quick check
    Write-Host "`n🚀 Quick Diagnostic:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "For full diagnostics, run:" -ForegroundColor Yellow
    Write-Host "   .\nsight-warning-resolver.ps1 -Diagnose" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "For recommendations, run:" -ForegroundColor Yellow
    Write-Host "   .\nsight-warning-resolver.ps1 -Recommendations" -ForegroundColor Cyan
    Write-Host ""

    # Quick checks
    $nsysPath = Test-NsightInstallation
    $processInfo = Test-ProcessGpuCapability -ProcName $ProcessName
}

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "✅ Diagnostic complete" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
