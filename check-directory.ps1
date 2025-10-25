# ============================================
# 🎯 DIRECTORY VALIDATION SCRIPT
# ============================================
# Checks if you're in the correct directory before running commands
# Add to your PowerShell profile or run before deployments

function Test-CorrectDirectory {
    param(
        [string]$Command = "vercel"
    )

    $currentPath = Get-Location
    $expectedPath = "V:\Projects\Farmers-Market\farmers-market"

    # Normalize paths for comparison
    $normalizedCurrent = $currentPath.Path.TrimEnd('\')
    $normalizedExpected = $expectedPath.TrimEnd('\')

    if ($normalizedCurrent -ne $normalizedExpected) {
        Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Red
        Write-Host "⚠️  WRONG DIRECTORY!" -ForegroundColor White -BackgroundColor Red
        Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Red
        Write-Host "`nYou are here:    " -NoNewline -ForegroundColor Yellow
        Write-Host $currentPath -ForegroundColor Red
        Write-Host "You should be:   " -NoNewline -ForegroundColor Yellow
        Write-Host $expectedPath -ForegroundColor Green
        Write-Host "`nTo fix this, run:" -ForegroundColor Cyan
        Write-Host "  cd $expectedPath" -ForegroundColor White
        Write-Host "`n════════════════════════════════════════════════════════════`n" -ForegroundColor Red
        return $false
    }

    Write-Host "✅ Correct directory: " -NoNewline -ForegroundColor Green
    Write-Host $currentPath -ForegroundColor Cyan
    return $true
}

# Safe command wrappers
function Safe-Vercel {
    param(
        [Parameter(ValueFromRemainingArguments)]
        [string[]]$Arguments
    )

    if (Test-CorrectDirectory -Command "vercel") {
        & vercel @Arguments
    } else {
        Write-Host "❌ Command blocked to prevent mistakes!`n" -ForegroundColor Red
    }
}

function Safe-Build {
    if (Test-CorrectDirectory -Command "npm run build") {
        npm run build
    } else {
        Write-Host "❌ Command blocked to prevent mistakes!`n" -ForegroundColor Red
    }
}

function Safe-Dev {
    if (Test-CorrectDirectory -Command "npm run dev") {
        npm run dev
    } else {
        Write-Host "❌ Command blocked to prevent mistakes!`n" -ForegroundColor Red
    }
}

# Show current directory status
function Show-DirectoryStatus {
    Write-Host "`n📍 Current Location Check:" -ForegroundColor Cyan
    $currentPath = Get-Location
    $expectedPath = "V:\Projects\Farmers-Market\farmers-market"

    Write-Host "  Current:  " -NoNewline -ForegroundColor Yellow
    Write-Host $currentPath -ForegroundColor White
    Write-Host "  Expected: " -NoNewline -ForegroundColor Yellow
    Write-Host $expectedPath -ForegroundColor White

    if ((Get-Location).Path.TrimEnd('\') -eq $expectedPath.TrimEnd('\')) {
        Write-Host "`n  Status: " -NoNewline -ForegroundColor Yellow
        Write-Host "✅ CORRECT" -ForegroundColor Green
        Write-Host "`n  Safe to run: vercel, npm run build, npm run dev`n" -ForegroundColor Gray
    } else {
        Write-Host "`n  Status: " -NoNewline -ForegroundColor Yellow
        Write-Host "❌ WRONG DIRECTORY" -ForegroundColor Red
        Write-Host "`n  Run this to fix:" -ForegroundColor Cyan
        Write-Host "    cd $expectedPath`n" -ForegroundColor White
    }
}

# Aliases for safety
Set-Alias -Name check-dir -Value Show-DirectoryStatus -Force
Set-Alias -Name safe-vercel -Value Safe-Vercel -Force
Set-Alias -Name safe-build -Value Safe-Build -Force
Set-Alias -Name safe-dev -Value Safe-Dev -Force

# Export functions
Export-ModuleMember -Function Test-CorrectDirectory, Safe-Vercel, Safe-Build, Safe-Dev, Show-DirectoryStatus -Alias *

Write-Host "`n🎯 Directory Safety Module Loaded!" -ForegroundColor Green
Write-Host "   Use 'check-dir' to see current status" -ForegroundColor Gray
Write-Host "   Use 'safe-vercel' instead of 'vercel'" -ForegroundColor Gray
Write-Host "   Use 'safe-build' instead of 'npm run build'" -ForegroundColor Gray
Write-Host "   Use 'safe-dev' instead of 'npm run dev'`n" -ForegroundColor Gray
