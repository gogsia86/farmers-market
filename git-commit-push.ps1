#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Divine Git Commit and Push Script

.DESCRIPTION
    Automated script to commit and push changes to git repository
    with agricultural consciousness and divine precision.

.PARAMETER Message
    Commit message (optional, will prompt if not provided)

.PARAMETER Type
    Commit type: feat, fix, docs, style, refactor, test, chore

.PARAMETER Push
    Whether to push after commit (default: true)

.EXAMPLE
    .\git-commit-push.ps1

.EXAMPLE
    .\git-commit-push.ps1 -Message "Add new feature" -Type "feat"

.EXAMPLE
    .\git-commit-push.ps1 -Message "Fix bug" -Type "fix" -Push $false
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Message = "",

    [Parameter(Mandatory=$false)]
    [ValidateSet("feat", "fix", "docs", "style", "refactor", "test", "chore", "perf", "ci", "build")]
    [string]$Type = "",

    [Parameter(Mandatory=$false)]
    [bool]$Push = $true
)

# Colors for output
$ColorGreen = "Green"
$ColorYellow = "Yellow"
$ColorRed = "Red"
$ColorCyan = "Cyan"
$ColorMagenta = "Magenta"

function Write-Header {
    param([string]$Text)
    Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor $ColorMagenta
    Write-Host "║ $Text" -ForegroundColor $ColorMagenta
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor $ColorMagenta
}

function Write-Step {
    param([string]$Text)
    Write-Host "🌾 $Text" -ForegroundColor $ColorCyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor $ColorGreen
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor $ColorRed
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor $ColorYellow
}

# Main script
Write-Header "🌟 Divine Git Commit & Push Automation"

# Step 1: Check git status
Write-Step "Checking repository status..."
$gitStatus = git status --porcelain
if ([string]::IsNullOrEmpty($gitStatus)) {
    Write-Warning "No changes to commit!"
    exit 0
}

Write-Success "Changes detected"
Write-Host ""
git status --short
Write-Host ""

# Step 2: Get commit type if not provided
if ([string]::IsNullOrEmpty($Type)) {
    Write-Host "Select commit type:" -ForegroundColor $ColorYellow
    Write-Host "  1. feat     - New feature" -ForegroundColor $ColorCyan
    Write-Host "  2. fix      - Bug fix" -ForegroundColor $ColorCyan
    Write-Host "  3. docs     - Documentation" -ForegroundColor $ColorCyan
    Write-Host "  4. style    - Code style/formatting" -ForegroundColor $ColorCyan
    Write-Host "  5. refactor - Code refactoring" -ForegroundColor $ColorCyan
    Write-Host "  6. test     - Tests" -ForegroundColor $ColorCyan
    Write-Host "  7. chore    - Maintenance" -ForegroundColor $ColorCyan
    Write-Host "  8. perf     - Performance" -ForegroundColor $ColorCyan
    Write-Host "  9. ci       - CI/CD" -ForegroundColor $ColorCyan
    Write-Host "  10. build   - Build system" -ForegroundColor $ColorCyan
    Write-Host ""

    $typeChoice = Read-Host "Enter number (1-10)"

    $Type = switch ($typeChoice) {
        "1" { "feat" }
        "2" { "fix" }
        "3" { "docs" }
        "4" { "style" }
        "5" { "refactor" }
        "6" { "test" }
        "7" { "chore" }
        "8" { "perf" }
        "9" { "ci" }
        "10" { "build" }
        default { "chore" }
    }
}

Write-Success "Commit type: $Type"

# Step 3: Get commit message if not provided
if ([string]::IsNullOrEmpty($Message)) {
    Write-Host ""
    Write-Host "Enter commit message:" -ForegroundColor $ColorYellow
    $Message = Read-Host "Message"

    if ([string]::IsNullOrEmpty($Message)) {
        Write-Error "Commit message cannot be empty!"
        exit 1
    }
}

# Step 4: Build full commit message
$commitMessage = "${Type}: ${Message}"

Write-Host ""
Write-Step "Preparing commit..."
Write-Host "  Type: $Type" -ForegroundColor $ColorGreen
Write-Host "  Message: $Message" -ForegroundColor $ColorGreen
Write-Host "  Full: $commitMessage" -ForegroundColor $ColorGreen

# Step 5: Ask for confirmation
Write-Host ""
$confirm = Read-Host "Proceed with commit? (Y/n)"
if ($confirm -eq "n" -or $confirm -eq "N") {
    Write-Warning "Commit cancelled"
    exit 0
}

# Step 6: Stage all changes
Write-Host ""
Write-Step "Staging all changes..."
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to stage changes!"
    exit 1
}

Write-Success "Changes staged"

# Step 7: Commit changes
Write-Host ""
Write-Step "Committing changes..."
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Error "Commit failed! Check pre-commit hooks."
    exit 1
}

Write-Success "Commit successful!"

# Step 8: Push to remote (if enabled)
if ($Push) {
    Write-Host ""
    Write-Step "Pushing to remote repository..."

    # Get current branch
    $currentBranch = git branch --show-current
    Write-Host "  Branch: $currentBranch" -ForegroundColor $ColorCyan

    $pushConfirm = Read-Host "Push to origin/$currentBranch? (Y/n)"
    if ($pushConfirm -eq "n" -or $pushConfirm -eq "N") {
        Write-Warning "Push cancelled"
        Write-Success "Commit saved locally"
        exit 0
    }

    git push origin $currentBranch

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Push failed! You may need to:"
        Write-Host "  1. Check your internet connection" -ForegroundColor $ColorYellow
        Write-Host "  2. Verify remote repository exists" -ForegroundColor $ColorYellow
        Write-Host "  3. Ensure you have push permissions" -ForegroundColor $ColorYellow
        Write-Host "  4. Pull latest changes first: git pull origin $currentBranch" -ForegroundColor $ColorYellow
        Write-Host ""
        Write-Host "Your commit is saved locally. Push manually when ready:" -ForegroundColor $ColorYellow
        Write-Host "  git push origin $currentBranch" -ForegroundColor $ColorCyan
        exit 1
    }

    Write-Success "Pushed to remote successfully!"
}

# Step 9: Summary
Write-Host ""
Write-Header "🎉 Operation Complete!"
Write-Host "✨ Commit Type: $Type" -ForegroundColor $ColorGreen
Write-Host "✨ Message: $Message" -ForegroundColor $ColorGreen
if ($Push -and $LASTEXITCODE -eq 0) {
    Write-Host "✨ Status: Committed and Pushed" -ForegroundColor $ColorGreen
} else {
    Write-Host "✨ Status: Committed Locally" -ForegroundColor $ColorGreen
}
Write-Host ""
Write-Host "🌾 Agricultural consciousness maintained throughout operation" -ForegroundColor $ColorMagenta
Write-Host ""

exit 0
