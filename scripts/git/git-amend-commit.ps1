#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Divine Git Commit Message Amend Script

.DESCRIPTION
    Script to amend the last commit message with proper format validation.
    Maintains agricultural consciousness and divine precision.

.PARAMETER Message
    New commit message (optional, will prompt if not provided)

.PARAMETER Type
    Commit type: feat, fix, docs, style, refactor, test, chore, perf, ci, build

.PARAMETER KeepChanges
    Keep staged changes in the amended commit (default: false)

.EXAMPLE
    .\git-amend-commit.ps1

.EXAMPLE
    .\git-amend-commit.ps1 -Message "fix authentication flow" -Type "fix"

.EXAMPLE
    .\git-amend-commit.ps1 -KeepChanges $true
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Message = "",

    [Parameter(Mandatory=$false)]
    [ValidateSet("feat", "fix", "docs", "style", "refactor", "test", "chore", "perf", "ci", "build")]
    [string]$Type = "",

    [Parameter(Mandatory=$false)]
    [bool]$KeepChanges = $false
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
Write-Header "🔧 Divine Git Commit Message Amendment"

# Step 1: Check if there are commits to amend
Write-Step "Checking repository status..."
$commitCount = git rev-list --count HEAD 2>$null
if ($LASTEXITCODE -ne 0 -or $commitCount -eq 0) {
    Write-Error "No commits found to amend!"
    exit 1
}

Write-Success "Repository has $commitCount commit(s)"

# Step 2: Show current commit
Write-Host ""
Write-Step "Current commit message:"
Write-Host ""
$currentMessage = git log -1 --pretty=%B
Write-Host "  $currentMessage" -ForegroundColor $ColorYellow
Write-Host ""

# Step 3: Check for staged changes
if ($KeepChanges) {
    $stagedChanges = git diff --cached --name-only
    if ($stagedChanges) {
        Write-Warning "The following staged changes will be included in the amended commit:"
        $stagedChanges | ForEach-Object { Write-Host "  $_" -ForegroundColor $ColorYellow }
        Write-Host ""
    }
}

# Step 4: Get commit type if not provided
if ([string]::IsNullOrEmpty($Type)) {
    Write-Host "Select new commit type:" -ForegroundColor $ColorYellow
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
    Write-Host "  11. keep    - Keep current type" -ForegroundColor $ColorCyan
    Write-Host ""

    $typeChoice = Read-Host "Enter number (1-11)"

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
        "11" {
            # Extract type from current message
            if ($currentMessage -match "^(\w+):") {
                $Matches[1]
            } else {
                "chore"
            }
        }
        default { "chore" }
    }
}

Write-Success "Commit type: $Type"

# Step 5: Get new commit message if not provided
if ([string]::IsNullOrEmpty($Message)) {
    Write-Host ""
    Write-Host "Enter new commit message:" -ForegroundColor $ColorYellow
    Write-Host "(Press Enter to keep current message body)" -ForegroundColor $ColorCyan
    $Message = Read-Host "Message"

    if ([string]::IsNullOrEmpty($Message)) {
        # Try to extract message from current commit
        if ($currentMessage -match "^(\w+):\s*(.+)") {
            $Message = $Matches[2]
            Write-Warning "Keeping current message: $Message"
        } else {
            Write-Error "Commit message cannot be empty!"
            exit 1
        }
    }
}

# Step 6: Build new commit message
$newCommitMessage = "${Type}: ${Message}"

Write-Host ""
Write-Step "Preparing amendment..."
Write-Host "  Old: $currentMessage" -ForegroundColor $ColorYellow
Write-Host "  New: $newCommitMessage" -ForegroundColor $ColorGreen
Write-Host ""

# Step 7: Check if commit has been pushed
Write-Step "Checking if commit has been pushed..."
$remoteName = git config --get branch.$(git branch --show-current).remote
if ($remoteName) {
    $localCommit = git rev-parse HEAD
    $remoteCommit = git rev-parse "$remoteName/$(git branch --show-current)" 2>$null

    if ($localCommit -eq $remoteCommit) {
        Write-Host ""
        Write-Warning "⚠️  WARNING: This commit has been pushed to remote!"
        Write-Warning "Amending it will rewrite history and require force push."
        Write-Host ""
        Write-Host "This means:" -ForegroundColor $ColorYellow
        Write-Host "  1. You'll need to force push: git push --force-with-lease" -ForegroundColor $ColorYellow
        Write-Host "  2. Other collaborators will need to reset their branches" -ForegroundColor $ColorYellow
        Write-Host "  3. This can cause issues in shared repositories" -ForegroundColor $ColorYellow
        Write-Host ""

        $forceConfirm = Read-Host "Do you understand and want to proceed? (type 'yes' to continue)"
        if ($forceConfirm -ne "yes") {
            Write-Warning "Amendment cancelled"
            exit 0
        }
    }
}

# Step 8: Ask for confirmation
Write-Host ""
$confirm = Read-Host "Proceed with amending commit? (Y/n)"
if ($confirm -eq "n" -or $confirm -eq "N") {
    Write-Warning "Amendment cancelled"
    exit 0
}

# Step 9: Amend the commit
Write-Host ""
Write-Step "Amending commit message..."

if ($KeepChanges) {
    # Amend with staged changes
    git commit --amend -m $newCommitMessage
} else {
    # Amend only message, keep same tree
    git commit --amend --no-edit -m $newCommitMessage
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to amend commit!"
    exit 1
}

Write-Success "Commit amended successfully!"

# Step 10: Show updated commit
Write-Host ""
Write-Step "Updated commit:"
Write-Host ""
git log -1 --pretty=format:"%C(yellow)%h%Creset %C(green)%s%Creset %C(cyan)(%ar)%Creset" --abbrev-commit
Write-Host ""
Write-Host ""

# Step 11: Check if force push is needed
if ($remoteName -and $localCommit -eq $remoteCommit) {
    Write-Host ""
    Write-Warning "This commit was already pushed. To update remote, run:"
    Write-Host "  git push --force-with-lease origin $(git branch --show-current)" -ForegroundColor $ColorCyan
    Write-Host ""

    $pushNow = Read-Host "Force push now? (y/N)"
    if ($pushNow -eq "y" -or $pushNow -eq "Y") {
        Write-Step "Force pushing to remote..."
        $currentBranch = git branch --show-current
        git push --force-with-lease origin $currentBranch

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Successfully pushed to remote!"
        } else {
            Write-Error "Force push failed!"
            Write-Host "Try manually: git push --force-with-lease origin $currentBranch" -ForegroundColor $ColorYellow
        }
    }
}

# Step 12: Summary
Write-Host ""
Write-Header "🎉 Amendment Complete!"
Write-Host "✨ New Type: $Type" -ForegroundColor $ColorGreen
Write-Host "✨ New Message: $Message" -ForegroundColor $ColorGreen
Write-Host ""
Write-Host "🌾 Agricultural consciousness maintained throughout operation" -ForegroundColor $ColorMagenta
Write-Host ""

exit 0
