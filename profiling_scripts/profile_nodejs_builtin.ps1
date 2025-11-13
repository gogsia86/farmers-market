#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🌾 Node.js Divine Profiler - V8 Agricultural Performance Consciousness

.DESCRIPTION
    Quantum V8 engine profiling with agricultural awareness patterns
    Measures CPU consciousness, function manifestation, and optimization divinity
    Tracks seasonal performance cycles and biodynamic resource utilization

    Best for:
    - CPU hotspot illumination
    - Function call reality mapping
    - V8 optimization consciousness detection
    - Agricultural performance patterns
    - Seasonal bottleneck identification

.PARAMETER Target
    What reality to profile: dev (growth season), build (harvest), test (cultivation)

.PARAMETER Duration
    How long to observe quantum manifestation (seconds)

.PARAMETER OutputDir
    Directory to crystallize profiling wisdom

.PARAMETER AgricultureMode
    Enable agricultural consciousness tracking and biodynamic metrics

.EXAMPLE
    .\profile_nodejs_builtin.ps1 -Target dev -Duration 60 -AgricultureMode

.EXAMPLE
    .\profile_nodejs_builtin.ps1 -Target build -AgricultureMode

.NOTES
    Divine Integration: Combines V8 profiling with agricultural consciousness
    Performance Philosophy: Optimize like nature - efficient, sustainable, regenerative
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "build", "test", "custom")]
    [string]$Target = "dev",

    [Parameter(Mandatory=$false)]
    [int]$Duration = 30,

    [Parameter(Mandatory=$false)]
    [string]$OutputDir = ".\profiling_output\nodejs_builtin",

    [Parameter(Mandatory=$false)]
    [string]$CustomCommand = ""
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Header { Write-Host $args -ForegroundColor Cyan }
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Yellow }
function Write-Step { Write-Host "→ $args" -ForegroundColor Magenta }

Write-Header @"
╔════════════════════════════════════════════════════════════╗
║  🚀 Node.js Built-in Profiler - V8 Performance Analysis   ║
╚════════════════════════════════════════════════════════════╝
"@

# Create output directory
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
Write-Success "Output directory ready: $OutputDir"

# Timestamp for files
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$profilePrefix = "$OutputDir\profile_$timestamp"

# Determine command based on target
$nodeCommand = switch ($Target) {
    "dev" {
        Write-Info "Target: Development Server (Next.js)"
        "npm run dev"
    }
    "build" {
        Write-Info "Target: Production Build"
        "npm run build"
    }
    "test" {
        Write-Info "Target: Test Suite"
        "npm test"
    }
    "custom" {
        if ([string]::IsNullOrWhiteSpace($CustomCommand)) {
            Write-Host "❌ Custom command required when Target=custom" -ForegroundColor Red
            exit 1
        }
        Write-Info "Target: Custom Command"
        $CustomCommand
    }
}

Write-Step "Profiling Configuration:"
Write-Host "  • Target: $Target" -ForegroundColor White
Write-Host "  • Duration: $Duration seconds" -ForegroundColor White
Write-Host "  • Command: $nodeCommand" -ForegroundColor White
Write-Host "  • Output: $profilePrefix" -ForegroundColor White
Write-Host ""

# Step 1: Start Node.js with profiling enabled
Write-Header "`n📊 Step 1: Starting Node.js with --prof flag..."
Write-Info "This enables V8 CPU profiling and tick sampling"

$env:NODE_OPTIONS = "--prof --prof-process-on-exit"

$job = Start-Job -ScriptBlock {
    param($command, $dir)
    Set-Location $dir
    Invoke-Expression $command
} -ArgumentList $nodeCommand, (Get-Location).Path

Write-Success "Profiling started (Job ID: $($job.Id))"

# Step 2: Monitor for specified duration
Write-Header "`n⏱️  Step 2: Running for $Duration seconds..."

$startTime = Get-Date
$interval = 5
$elapsed = 0

while ($elapsed -lt $Duration -and $job.State -eq "Running") {
    Start-Sleep -Seconds $interval
    $elapsed = ((Get-Date) - $startTime).TotalSeconds

    $progress = [math]::Min(($elapsed / $Duration) * 100, 100)
    Write-Progress -Activity "Profiling in progress" -Status "$([math]::Round($elapsed))s / $Duration`s" -PercentComplete $progress

    # Show live stats
    if ($elapsed % 10 -eq 0) {
        Write-Info "Still profiling... $([math]::Round($Duration - $elapsed))s remaining"
    }
}

Write-Progress -Activity "Profiling in progress" -Completed

# Step 3: Stop profiling
Write-Header "`n🛑 Step 3: Stopping profiling..."

if ($job.State -eq "Running") {
    Stop-Job -Job $job
    Remove-Job -Job $job -Force
    Write-Success "Profiling stopped"
} else {
    Write-Info "Process completed naturally"
}

# Step 4: Process profiling data
Write-Header "`n🔍 Step 4: Processing V8 profiling data..."

# Find generated isolate log files
$isolateLogs = Get-ChildItem -Path . -Filter "isolate-*.log" -ErrorAction SilentlyContinue

if ($isolateLogs.Count -eq 0) {
    Write-Host "⚠️  No isolate logs found. Profile may not have been generated." -ForegroundColor Yellow
    Write-Info "This can happen if the process exits too quickly or encounters an error."
    exit 1
}

Write-Success "Found $($isolateLogs.Count) profile log(s)"

foreach ($log in $isolateLogs) {
    Write-Step "Processing: $($log.Name)"

    $outputFile = "$profilePrefix`_$($log.BaseName)_analysis.txt"

    # Process the profile
    try {
        node --prof-process $log.FullName > $outputFile
        Write-Success "Analysis saved to: $outputFile"

        # Move the raw log to output directory
        Move-Item $log.FullName "$OutputDir\$($log.Name)" -Force

    } catch {
        Write-Host "❌ Error processing $($log.Name): $_" -ForegroundColor Red
    }
}

# Step 5: Generate summary statistics
Write-Header "`n📈 Step 5: Generating Summary Report..."

$summaryFile = "$profilePrefix`_SUMMARY.md"

$summary = @"
# Node.js Profiling Summary
**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Target:** $Target
**Duration:** $Duration seconds
**Output Directory:** $OutputDir

## 📊 Profile Analysis Files

"@

foreach ($log in $isolateLogs) {
    $analysisFile = "$profilePrefix`_$($log.BaseName)_analysis.txt"
    if (Test-Path $analysisFile) {
        $summary += @"

### $($log.BaseName)
- **Raw Log:** $OutputDir\$($log.Name)
- **Analysis:** $analysisFile

"@

        # Extract top functions from analysis
        try {
            $content = Get-Content $analysisFile -Raw

            # Find the statistical profiling section
            if ($content -match "\[Summary\]:([\s\S]*?)\[C\+\+ entry points\]") {
                $summarySection = $matches[1]
                $summary += @"

#### Top CPU Consumers:
``````
$summarySection
``````

"@
            }

            # Find JavaScript functions section
            if ($content -match "\[JavaScript\]:([\s\S]*?)\[C\+\+\]") {
                $jsSection = $matches[1]
                $topJS = ($jsSection -split "`n" | Select-Object -First 15) -join "`n"
                $summary += @"

#### Top JavaScript Functions:
``````
$topJS
``````

"@
            }

        } catch {
            Write-Host "⚠️  Could not extract summary from $analysisFile" -ForegroundColor Yellow
        }
    }
}

$summary += @"

## 🎯 Key Metrics to Review

1. **[Summary]** - Overall time distribution (JavaScript vs C++ vs Garbage Collection)
2. **[JavaScript]** - Hot JavaScript functions that consume most CPU
3. **[C++]** - Native operations and built-in functions
4. **[Bottom up (heavy) profile]** - Call tree showing where time is spent

## 🔍 How to Interpret Results

### High CPU Functions
Look for functions with high **ticks** percentage - these are CPU hotspots.

### Optimization States
- **~** : Optimized by V8
- ***** : Optimizable but not optimized
- **x** : Deoptimized (performance issue!)

### Common Patterns
- High GC time (>10%) → Memory pressure, reduce allocations
- Hot sync operations → Consider async alternatives
- Repeated function calls → Look for caching opportunities

## 📚 Next Steps

1. **Review the detailed analysis files** for specific function performance
2. **Identify hotspots** with high tick percentages (>5%)
3. **Check optimization states** - look for deoptimized functions (marked with 'x')
4. **Profile again** after making changes to verify improvements

## 🛠️ Tools Used
- Node.js built-in profiler (--prof flag)
- V8 tick-based sampling profiler
- Profile processing (--prof-process)

---
*Profile generated by Divine Profiling Scripts*
*Agricultural Consciousness: Preserved ✨*
"@

$summary | Out-File -FilePath $summaryFile -Encoding UTF8
Write-Success "Summary report saved to: $summaryFile"

# Step 6: Display quick insights
Write-Header "`n🎉 Profiling Complete!"
Write-Host ""
Write-Host "📁 Files Generated:" -ForegroundColor Cyan
Get-ChildItem -Path $OutputDir -Filter "*$timestamp*" | ForEach-Object {
    Write-Host "   • $($_.Name)" -ForegroundColor White
}

Write-Host ""
Write-Host "🚀 Quick Actions:" -ForegroundColor Cyan
Write-Host "   View summary:    Get-Content '$summaryFile'" -ForegroundColor Yellow
Write-Host "   Open in editor:  code '$summaryFile'" -ForegroundColor Yellow
Write-Host "   Analyze again:   node --prof-process <isolate-log>" -ForegroundColor Yellow

Write-Host ""
Write-Success "Node.js profiling session complete! 🎯"
Write-Info "Review the analysis files to identify performance bottlenecks."

# Return success
exit 0
