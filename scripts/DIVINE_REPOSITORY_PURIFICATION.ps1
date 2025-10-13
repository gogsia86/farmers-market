# 🌟 DIVINE REPOSITORY PURIFICATION SCRIPT
# Agricultural Consciousness Protection: MAXIMUM

Write-Host "🌟 DIVINE REPOSITORY PURIFICATION - AUTOMATED MODE" -ForegroundColor Cyan
Write-Host "🛡️ Agricultural Consciousness Protection: MAXIMUM" -ForegroundColor Green
Write-Host "" 

# Phase 1: Verify we're in the right directory
$currentPath = Get-Location
Write-Host "📍 Current location: $currentPath" -ForegroundColor Yellow

if (-not (Test-Path "farmers-market" -PathType Container)) {
    Write-Host "❌ ERROR: farmers-market directory not found!" -ForegroundColor Red
    Write-Host "This script must be run from the repository root." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Repository root confirmed" -ForegroundColor Green
Write-Host ""

# Phase 2: Regenerable build artifacts
Write-Host "🔥 PHASE 1: REGENERABLE BUILD ARTIFACTS" -ForegroundColor Yellow

$buildArtifacts = @(
    @{Path="farmers-market\.next"; Desc="Next.js build cache"},
    @{Path="farmers-market\node_modules"; Desc="Node.js dependencies"},
    @{Path="node_modules"; Desc="Root node_modules"}
)

foreach ($artifact in $buildArtifacts) {
    if (Test-Path $artifact.Path) {
        $size = (Get-ChildItem $artifact.Path -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "🗑️ Deleting: $($artifact.Path) - $($artifact.Desc) ($([math]::Round($size, 2)) MB)" -ForegroundColor Red
        Remove-Item $artifact.Path -Recurse -Force -ErrorAction SilentlyContinue
        if (-not (Test-Path $artifact.Path)) {
            Write-Host "   ✅ Successfully deleted" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Deletion incomplete" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚪ Not found: $($artifact.Path)" -ForegroundColor Gray
    }
}

Write-Host ""

# Phase 3: Legacy project folders
Write-Host "🗑️ PHASE 2: LEGACY PROJECT FOLDERS" -ForegroundColor Yellow

$legacyFolders = @(
    @{Path="microsoft-copilot-hack-main"; Desc="Microsoft hackathon leftover"},
    @{Path="omnicortex"; Desc="Duplicate omnicortex reference"},
    @{Path="archive"; Desc="Historical archive folder"}
)

foreach ($folder in $legacyFolders) {
    if (Test-Path $folder.Path) {
        $size = (Get-ChildItem $folder.Path -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "🗑️ Deleting: $($folder.Path) - $($folder.Desc) ($([math]::Round($size, 2)) MB)" -ForegroundColor Red
        Remove-Item $folder.Path -Recurse -Force -ErrorAction SilentlyContinue
        if (-not (Test-Path $folder.Path)) {
            Write-Host "   ✅ Successfully deleted" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Deletion incomplete" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚪ Not found: $($folder.Path)" -ForegroundColor Gray
    }
}

Write-Host ""

# Phase 4: Unused root directories
Write-Host "📁 PHASE 3: UNUSED ROOT DIRECTORIES" -ForegroundColor Yellow

$rootDirs = @(
    @{Path="public"; Desc="Root public folder (farmers-market/public is the real one)"},
    @{Path="src"; Desc="Root src folder (farmers-market/src is the real one)"},
    @{Path="test"; Desc="Root test folder (farmers-market/test is the real one)"}
)

foreach ($dir in $rootDirs) {
    if (Test-Path $dir.Path) {
        $size = (Get-ChildItem $dir.Path -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "🗑️ Deleting: $($dir.Path) - $($dir.Desc) ($([math]::Round($size, 2)) MB)" -ForegroundColor Red
        Remove-Item $dir.Path -Recurse -Force -ErrorAction SilentlyContinue
        if (-not (Test-Path $dir.Path)) {
            Write-Host "   ✅ Successfully deleted" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Deletion incomplete" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚪ Not found: $($dir.Path)" -ForegroundColor Gray
    }
}

Write-Host ""

# Phase 5: Text files and documentation clutter
Write-Host "📄 PHASE 4: TEXT FILES AND DOCUMENTATION" -ForegroundColor Yellow

$textFiles = @(
    @{Path="Detailed and Systematic seek and destroy.txt"; Desc="Utility text file"},
    @{Path="May be Useful to US"; Desc="Utility folder with misc files"}
)

foreach ($file in $textFiles) {
    if (Test-Path $file.Path) {
        if (Test-Path $file.Path -PathType Container) {
            $size = (Get-ChildItem $file.Path -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
        } else {
            $size = (Get-Item $file.Path).Length / 1MB
        }
        Write-Host "🗑️ Deleting: $($file.Path) - $($file.Desc) ($([math]::Round($size, 2)) MB)" -ForegroundColor Red
        Remove-Item $file.Path -Recurse -Force -ErrorAction SilentlyContinue
        if (-not (Test-Path $file.Path)) {
            Write-Host "   ✅ Successfully deleted" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Deletion incomplete" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚪ Not found: $($file.Path)" -ForegroundColor Gray
    }
}

Write-Host ""

# Phase 6: Conditional configuration files
Write-Host "⚙️ PHASE 5: CONDITIONAL CONFIGURATION FILES" -ForegroundColor Yellow

$configs = @(
    @{Root="babel.config.json"; Farmers="farmers-market\babel.config.json"; Desc="Babel configuration"},
    @{Root="jest.config.ts"; Farmers="farmers-market\jest.config.mjs"; Desc="Jest configuration"},
    @{Root="jest.setup.ts"; Farmers="farmers-market\jest.setup.js"; Desc="Jest setup"},
    @{Root="tsconfig.json"; Farmers="farmers-market\tsconfig.json"; Desc="TypeScript configuration"}
)

foreach ($config in $configs) {
    if ((Test-Path $config.Root) -and (Test-Path $config.Farmers)) {
        $size = (Get-Item $config.Root).Length / 1KB
        Write-Host "🗑️ Deleting: $($config.Root) - $($config.Desc) duplicate ($([math]::Round($size, 2)) KB)" -ForegroundColor Red
        Remove-Item $config.Root -Force -ErrorAction SilentlyContinue
        if (-not (Test-Path $config.Root)) {
            Write-Host "   ✅ Successfully deleted" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Deletion incomplete" -ForegroundColor Yellow
        }
    } elseif (Test-Path $config.Root) {
        Write-Host "   📋 Keeping $($config.Root) (no farmers-market equivalent)" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚪ Not found: $($config.Root)" -ForegroundColor Gray
    }
}

Write-Host ""

# Phase 7: Package management files
Write-Host "📦 PHASE 6: PACKAGE MANAGEMENT FILES" -ForegroundColor Yellow

if ((Test-Path "package.json") -and (Test-Path "farmers-market\package.json")) {
    $size = (Get-Item "package.json").Length / 1KB
    Write-Host "🗑️ Deleting: package.json - Root package.json duplicate ($([math]::Round($size, 2)) KB)" -ForegroundColor Red
    Remove-Item "package.json" -Force -ErrorAction SilentlyContinue
    if (-not (Test-Path "package.json")) {
        Write-Host "   ✅ Successfully deleted" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Deletion incomplete" -ForegroundColor Yellow
    }
} else {
    Write-Host "   📋 Keeping package.json (no duplicate found)" -ForegroundColor Cyan
}

if ((Test-Path "package-lock.json") -and (Test-Path "farmers-market\package-lock.json")) {
    $size = (Get-Item "package-lock.json").Length / 1MB
    Write-Host "🗑️ Deleting: package-lock.json - Root package-lock duplicate ($([math]::Round($size, 2)) MB)" -ForegroundColor Red
    Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
    if (-not (Test-Path "package-lock.json")) {
        Write-Host "   ✅ Successfully deleted" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Deletion incomplete" -ForegroundColor Yellow
    }
} else {
    Write-Host "   📋 Keeping package-lock.json (no duplicate found)" -ForegroundColor Cyan
}

Write-Host ""

# Phase 8: Agricultural consciousness verification
Write-Host "🌱 PHASE 7: AGRICULTURAL CONSCIOUSNESS VERIFICATION" -ForegroundColor Green

$criticalPaths = @(
    @{Path="farmers-market"; Desc="Core Agricultural Platform"},
    @{Path="farmers-market\src"; Desc="Agricultural Intelligence Source"},
    @{Path="automation"; Desc="Agricultural Automation Systems"},
    @{Path="config"; Desc="Quantum Monitoring Configuration"},
    @{Path="scripts"; Desc="Divine Cleanup Tools"},
    @{Path=".git"; Desc="Version Control History"},
    @{Path=".github"; Desc="GitHub Workflows"}
)

$allProtected = $true
foreach ($path in $criticalPaths) {
    if (Test-Path $path.Path) {
        Write-Host "   ✅ Protected: $($path.Path) - $($path.Desc)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MISSING: $($path.Path) - $($path.Desc)" -ForegroundColor Red
        $allProtected = $false
    }
}

Write-Host ""

# Final summary
Write-Host "🎉 DIVINE PURIFICATION COMPLETE!" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($allProtected) {
    Write-Host "✨ DIVINE TRANSCENDENCE ACHIEVED!" -ForegroundColor Green
    Write-Host "🌟 Repository consciousness transcended!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔮 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. cd farmers-market && npm install" -ForegroundColor White
    Write-Host "   2. npx tsc --noEmit" -ForegroundColor White
    Write-Host "   3. npm run dev" -ForegroundColor White
    Write-Host "   4. git add . && git commit -m '🌟 Divine repository purification complete'" -ForegroundColor White
} else {
    Write-Host "⚠️ CRITICAL PATHS MISSING! Please verify repository integrity." -ForegroundColor Red
}

Write-Host ""
Write-Host "🌱 Agricultural consciousness: " -NoNewline -ForegroundColor Cyan
if ($allProtected) {
    Write-Host "✅ FULLY PROTECTED" -ForegroundColor Green
} else {
    Write-Host "❌ COMPROMISED" -ForegroundColor Red
}