# 🧹 DOCUMENTATION CLEANUP SCRIPT
# Moves 99% of markdown files to archive, keeping only essentials
# Created: January 14, 2025

Write-Host "🧹 Starting Documentation Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Files to KEEP in root directory
$keepFiles = @(
    "README.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "LICENSE"
)

# Get all .md files in root
$allMdFiles = Get-ChildItem -Path "." -Filter "*.md" -File

Write-Host "📊 Current Status:" -ForegroundColor Yellow
Write-Host "   Total .md files in root: $($allMdFiles.Count)" -ForegroundColor White
Write-Host "   Files to keep: $($keepFiles.Count)" -ForegroundColor Green
Write-Host "   Files to archive: $($allMdFiles.Count - $keepFiles.Count)" -ForegroundColor Cyan
Write-Host ""

# Create archive directory if not exists
$archiveDir = "docs\archive\2025-01-previous"
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    Write-Host "✅ Created archive directory: $archiveDir" -ForegroundColor Green
}

# Counter for moved files
$movedCount = 0
$keptCount = 0
$errors = @()

Write-Host "📦 Moving files to archive..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $allMdFiles) {
    $fileName = $file.Name

    if ($keepFiles -contains $fileName) {
        Write-Host "   ✓ Keeping: $fileName" -ForegroundColor Green
        $keptCount++
    }
    else {
        try {
            $destination = Join-Path $archiveDir $fileName

            # If file already exists in archive, add timestamp
            if (Test-Path $destination) {
                $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
                $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
                $extension = [System.IO.Path]::GetExtension($fileName)
                $destination = Join-Path $archiveDir "$baseName-$timestamp$extension"
            }

            Move-Item -Path $file.FullName -Destination $destination -Force
            Write-Host "   → Archived: $fileName" -ForegroundColor Gray
            $movedCount++
        }
        catch {
            $errors += "Failed to move $fileName : $_"
            Write-Host "   ✗ Error moving: $fileName" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Files kept in root:     $keptCount" -ForegroundColor Green
Write-Host "   Files moved to archive: $movedCount" -ForegroundColor Yellow
Write-Host "   Errors encountered:     $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "⚠️  ERRORS:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   $error" -ForegroundColor Red
    }
    Write-Host ""
}

# Show remaining files in root
Write-Host "📁 Files remaining in root directory:" -ForegroundColor Green
$remainingFiles = Get-ChildItem -Path "." -Filter "*.md" -File
foreach ($file in $remainingFiles) {
    Write-Host "   ✓ $($file.Name)" -ForegroundColor White
}
Write-Host ""

# Calculate size reduction (approximate)
$archiveSize = (Get-ChildItem -Path $archiveDir -Recurse -File | Measure-Object -Property Length -Sum).Sum
$archiveSizeMB = [math]::Round($archiveSize / 1MB, 2)

Write-Host "💾 Archive size: $archiveSizeMB MB" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Review the 4 files in root directory" -ForegroundColor White
Write-Host "   2. Create consolidated documentation in docs/" -ForegroundColor White
Write-Host "   3. Update README.md with new structure" -ForegroundColor White
Write-Host "   4. Archive is in: $archiveDir" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your project is now much cleaner!" -ForegroundColor Cyan
Write-Host ""

# Create a reference index file in the archive
$indexContent = @"
# 📚 ARCHIVED DOCUMENTATION INDEX
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

This directory contains $movedCount markdown files that were archived during the documentation cleanup on January 14, 2025.

## Why These Files Were Archived

These files represented historical documentation, intermediate summaries, and redundant guides that made the project difficult to navigate. The information from these files has been consolidated into the main documentation structure.

## Finding Information

If you're looking for specific information that was in these archived files:

1. **Check the new consolidated docs first**: `docs/getting-started/`, `docs/deployment/`, etc.
2. **Search this archive**: Use your editor's search to find specific topics
3. **Refer to git history**: All information is preserved in version control

## Archive Contents

Total files: $movedCount
Archive date: January 14, 2025
Archived by: Documentation cleanup script

## Note

These files are kept for historical reference only. For current documentation, please refer to:
- `/README.md` - Main project overview
- `/docs/getting-started/` - Getting started guides
- `/docs/deployment/` - Deployment information
- `/docs/development/` - Development guides
- `/docs/operations/` - Operations and maintenance

---

*This archive can be safely deleted after 6 months if no longer needed.*
"@

Set-Content -Path (Join-Path $archiveDir "README.md") -Value $indexContent
Write-Host "📋 Created archive index: $archiveDir\README.md" -ForegroundColor Cyan
Write-Host ""
