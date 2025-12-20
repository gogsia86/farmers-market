#!/bin/bash

# 🧹 Phase 3: Configuration & Scripts Cleanup
# Farmers Market Platform Repository Cleanup
# Author: Divine Agricultural AI Assistant
# Date: December 2025
# Version: 1.0

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Logging
LOG_FILE="cleanup-logs/phase3-cleanup-$(date +%Y%m%d-%H%M%S).log"
mkdir -p cleanup-logs

log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

log_success() {
    log "${GREEN}✅ ${1}${NC}"
}

log_info() {
    log "${BLUE}ℹ️  ${1}${NC}"
}

log_warning() {
    log "${YELLOW}⚠️  ${1}${NC}"
}

log_error() {
    log "${RED}❌ ${1}${NC}"
}

print_header() {
    log ""
    log "${BOLD}${MAGENTA}╔════════════════════════════════════════════════════════════════╗${NC}"
    log "${BOLD}${MAGENTA}║                                                                ║${NC}"
    log "${BOLD}${MAGENTA}║        🧹 PHASE 3: CONFIGURATION & SCRIPTS CLEANUP 🧹          ║${NC}"
    log "${BOLD}${MAGENTA}║                                                                ║${NC}"
    log "${BOLD}${MAGENTA}║           Farmers Market Platform Repository                  ║${NC}"
    log "${BOLD}${MAGENTA}║                                                                ║${NC}"
    log "${BOLD}${MAGENTA}╚════════════════════════════════════════════════════════════════╝${NC}"
    log ""
}

print_section() {
    log ""
    log "${CYAN}${BOLD}═══ ${1} ═══${NC}"
    log ""
}

# Safety check
check_git_status() {
    print_section "🔍 Safety Check: Git Status"

    if [ -d .git ]; then
        log_success "Git repository detected"
    else
        log_error "Not a git repository! Aborting."
        exit 1
    fi

    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        log_warning "You have uncommitted changes!"
        log_info "It's recommended to commit or stash changes before cleanup."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Cleanup cancelled by user."
            exit 0
        fi
    else
        log_success "Working directory is clean"
    fi
}

# Count files before cleanup
count_files() {
    print_section "📊 Current State Analysis"

    SCRIPTS_COUNT=$(find . -maxdepth 1 \( -name "*.sh" -o -name "*.bat" -o -name "*.ps1" \) -type f 2>/dev/null | wc -l)
    CONFIG_COUNT=$(find . -maxdepth 1 -name "*.config.*" -type f 2>/dev/null | wc -l)
    ENV_COUNT=$(find . -maxdepth 1 -name "*.env*" -type f 2>/dev/null | wc -l)
    TEXT_FILES=$(find . -maxdepth 1 -name "*.txt" -type f 2>/dev/null | wc -l)

    log_info "Scripts in root (sh/bat/ps1): ${BOLD}${SCRIPTS_COUNT}${NC}"
    log_info "Config files in root: ${BOLD}${CONFIG_COUNT}${NC}"
    log_info "Environment files: ${BOLD}${ENV_COUNT}${NC}"
    log_info "Text files in root: ${BOLD}${TEXT_FILES}${NC}"

    log ""
    log_warning "Target: Move ~26 script files to organized structure"
}

# Create directory structure
create_directories() {
    print_section "📁 Creating Organized Directory Structure"

    # Scripts organization
    mkdir -p scripts/{deployment,git,testing,database,development,archive}
    log_success "Created scripts subdirectories"

    # Config organization
    mkdir -p config/{docker,env-examples,archive}
    log_success "Created config subdirectories"

    # Docs organization (if needed)
    mkdir -p docs/troubleshooting
    log_success "Created additional docs directories"
}

# Move deployment scripts
move_deployment_scripts() {
    print_section "🚀 Organizing Deployment Scripts"

    local moved=0

    # Deployment batch files
    if [ -f "DEPLOY-NOW.bat" ]; then
        mv "DEPLOY-NOW.bat" scripts/deployment/
        log_success "Moved DEPLOY-NOW.bat → scripts/deployment/"
        ((moved++))
    fi

    if [ -f "deploy-to-vercel.bat" ]; then
        mv "deploy-to-vercel.bat" scripts/deployment/
        log_success "Moved deploy-to-vercel.bat → scripts/deployment/"
        ((moved++))
    fi

    if [ -f "deploy-to-vercel.sh" ]; then
        mv "deploy-to-vercel.sh" scripts/deployment/
        log_success "Moved deploy-to-vercel.sh → scripts/deployment/"
        ((moved++))
    fi

    if [ -f "verify-deployment.sh" ]; then
        mv "verify-deployment.sh" scripts/deployment/
        log_success "Moved verify-deployment.sh → scripts/deployment/"
        ((moved++))
    fi

    # Production scripts
    if [ -f "setup-production.sh" ]; then
        mv "setup-production.sh" scripts/deployment/
        log_success "Moved setup-production.sh → scripts/deployment/"
        ((moved++))
    fi

    if [ -f "setup-production.ps1" ]; then
        mv "setup-production.ps1" scripts/deployment/
        log_success "Moved setup-production.ps1 → scripts/deployment/"
        ((moved++))
    fi

    if [ -f "start-production.sh" ]; then
        mv "start-production.sh" scripts/deployment/
        log_success "Moved start-production.sh → scripts/deployment/"
        ((moved++))
    fi

    if [ -f "start-production.ps1" ]; then
        mv "start-production.ps1" scripts/deployment/
        log_success "Moved start-production.ps1 → scripts/deployment/"
        ((moved++))
    fi

    if [ -f "run-production.bat" ]; then
        mv "run-production.bat" scripts/deployment/
        log_success "Moved run-production.bat → scripts/deployment/"
        ((moved++))
    fi

    log ""
    log_info "Deployment scripts organized: ${BOLD}${moved}${NC} files moved"
}

# Move git scripts
move_git_scripts() {
    print_section "📝 Organizing Git Scripts"

    local moved=0

    if [ -f "git-commit-push.sh" ]; then
        mv "git-commit-push.sh" scripts/git/
        log_success "Moved git-commit-push.sh → scripts/git/"
        ((moved++))
    fi

    if [ -f "git-commit-push.ps1" ]; then
        mv "git-commit-push.ps1" scripts/git/
        log_success "Moved git-commit-push.ps1 → scripts/git/"
        ((moved++))
    fi

    if [ -f "git-amend-commit.sh" ]; then
        mv "git-amend-commit.sh" scripts/git/
        log_success "Moved git-amend-commit.sh → scripts/git/"
        ((moved++))
    fi

    if [ -f "git-amend-commit.ps1" ]; then
        mv "git-amend-commit.ps1" scripts/git/
        log_success "Moved git-amend-commit.ps1 → scripts/git/"
        ((moved++))
    fi

    log ""
    log_info "Git scripts organized: ${BOLD}${moved}${NC} files moved"
}

# Move testing scripts
move_testing_scripts() {
    print_section "🧪 Organizing Testing Scripts"

    local moved=0

    if [ -f "RUN-ALL-TESTS.bat" ]; then
        mv "RUN-ALL-TESTS.bat" scripts/testing/
        log_success "Moved RUN-ALL-TESTS.bat → scripts/testing/"
        ((moved++))
    fi

    if [ -f "run-all-tests.sh" ]; then
        mv "run-all-tests.sh" scripts/testing/
        log_success "Moved run-all-tests.sh → scripts/testing/"
        ((moved++))
    fi

    if [ -f "RUN-MVP-VALIDATION.bat" ]; then
        mv "RUN-MVP-VALIDATION.bat" scripts/testing/
        log_success "Moved RUN-MVP-VALIDATION.bat → scripts/testing/"
        ((moved++))
    fi

    if [ -f "run-mvp-validation.sh" ]; then
        mv "run-mvp-validation.sh" scripts/testing/
        log_success "Moved run-mvp-validation.sh → scripts/testing/"
        ((moved++))
    fi

    if [ -f "test-signup-fix.js" ]; then
        mv "test-signup-fix.js" scripts/testing/
        log_success "Moved test-signup-fix.js → scripts/testing/"
        ((moved++))
    fi

    log ""
    log_info "Testing scripts organized: ${BOLD}${moved}${NC} files moved"
}

# Move development scripts
move_development_scripts() {
    print_section "💻 Organizing Development Scripts"

    local moved=0

    if [ -f "START_NOW.bat" ]; then
        mv "START_NOW.bat" scripts/development/
        log_success "Moved START_NOW.bat → scripts/development/"
        ((moved++))
    fi

    if [ -f "START-SERVER.bat" ]; then
        mv "START-SERVER.bat" scripts/development/
        log_success "Moved START-SERVER.bat → scripts/development/"
        ((moved++))
    fi

    if [ -f "start-server-fixed.sh" ]; then
        mv "start-server-fixed.sh" scripts/development/
        log_success "Moved start-server-fixed.sh → scripts/development/"
        ((moved++))
    fi

    if [ -f "FIX_ALL_ERRORS.bat" ]; then
        mv "FIX_ALL_ERRORS.bat" scripts/development/
        log_success "Moved FIX_ALL_ERRORS.bat → scripts/development/"
        ((moved++))
    fi

    if [ -f "fix-remaining-errors.sh" ]; then
        mv "fix-remaining-errors.sh" scripts/development/
        log_success "Moved fix-remaining-errors.sh → scripts/development/"
        ((moved++))
    fi

    log ""
    log_info "Development scripts organized: ${BOLD}${moved}${NC} files moved"
}

# Move docker scripts
move_docker_scripts() {
    print_section "🐳 Organizing Docker Scripts"

    local moved=0

    if [ -f "docker-verify.sh" ]; then
        mv "docker-verify.sh" scripts/deployment/
        log_success "Moved docker-verify.sh → scripts/deployment/"
        ((moved++))
    fi

    log ""
    log_info "Docker scripts organized: ${BOLD}${moved}${NC} files moved"
}

# Move cleanup scripts (already used ones)
move_cleanup_scripts() {
    print_section "🧹 Organizing Cleanup Scripts"

    local moved=0

    if [ -f "cleanup-root.sh" ]; then
        mv "cleanup-root.sh" scripts/archive/
        log_success "Moved cleanup-root.sh → scripts/archive/"
        ((moved++))
    fi

    if [ -f "cleanup-root.ps1" ]; then
        mv "cleanup-root.ps1" scripts/archive/
        log_success "Moved cleanup-root.ps1 → scripts/archive/"
        ((moved++))
    fi

    if [ -f "cleanup-outdated-docs.ps1" ]; then
        mv "cleanup-outdated-docs.ps1" scripts/archive/
        log_success "Moved cleanup-outdated-docs.ps1 → scripts/archive/"
        ((moved++))
    fi

    log ""
    log_info "Cleanup scripts archived: ${BOLD}${moved}${NC} files moved"
}

# Move environment files
move_env_files() {
    print_section "🔐 Organizing Environment Files"

    local moved=0

    if [ -f "READY-TO-UPLOAD.env" ]; then
        mv "READY-TO-UPLOAD.env" config/env-examples/
        log_success "Moved READY-TO-UPLOAD.env → config/env-examples/"
        ((moved++))
    fi

    if [ -f "env-production-FILLME.txt" ]; then
        mv "env-production-FILLME.txt" config/env-examples/
        log_success "Moved env-production-FILLME.txt → config/env-examples/"
        ((moved++))
    fi

    log ""
    log_info "Environment files organized: ${BOLD}${moved}${NC} files moved"
}

# Move text files
move_text_files() {
    print_section "📄 Organizing Text Documentation Files"

    local moved=0

    # Summary files should go to archive
    if [ -f "DAY_17_SUMMARY.txt" ]; then
        mv "DAY_17_SUMMARY.txt" docs/archive/historical-status/
        log_success "Moved DAY_17_SUMMARY.txt → docs/archive/historical-status/"
        ((moved++))
    fi

    if [ -f "DOCKER_FIXES_SUMMARY.txt" ]; then
        mv "DOCKER_FIXES_SUMMARY.txt" docs/archive/historical-status/
        log_success "Moved DOCKER_FIXES_SUMMARY.txt → docs/archive/historical-status/"
        ((moved++))
    fi

    if [ -f "QUICK_FIX_SUMMARY.txt" ]; then
        mv "QUICK_FIX_SUMMARY.txt" docs/archive/historical-status/
        log_success "Moved QUICK_FIX_SUMMARY.txt → docs/archive/historical-status/"
        ((moved++))
    fi

    if [ -f "ROUTE_STRUCTURE_VISUAL.txt" ]; then
        mv "ROUTE_STRUCTURE_VISUAL.txt" docs/architecture/
        log_success "Moved ROUTE_STRUCTURE_VISUAL.txt → docs/architecture/"
        ((moved++))
    fi

    log ""
    log_info "Text files organized: ${BOLD}${moved}${NC} files moved"
}

# Move docker config files
move_docker_configs() {
    print_section "🐳 Organizing Docker Configuration Files"

    local moved=0

    # Docker compose files stay in root but log them
    if [ -f "docker-compose.yml" ]; then
        log_info "docker-compose.yml → Stays in root (standard location)"
    fi

    if [ -f "docker-compose.dev.yml" ]; then
        log_info "docker-compose.dev.yml → Stays in root (standard location)"
    fi

    log ""
    log_info "Docker configs reviewed: staying in root per convention"
}

# Create README files for new directories
create_readme_files() {
    print_section "📚 Creating Directory README Files"

    # Scripts deployment README
    cat > scripts/deployment/README.md << 'EOF'
# 🚀 Deployment Scripts

Scripts for deploying and managing production environments.

## Scripts

### Vercel Deployment
- `deploy-to-vercel.sh` - Deploy to Vercel (Linux/Mac)
- `deploy-to-vercel.bat` - Deploy to Vercel (Windows)
- `DEPLOY-NOW.bat` - Quick deployment command (Windows)
- `verify-deployment.sh` - Verify deployment status

### Production Setup
- `setup-production.sh` - Setup production environment (Linux/Mac)
- `setup-production.ps1` - Setup production environment (PowerShell)
- `start-production.sh` - Start production server (Linux/Mac)
- `start-production.ps1` - Start production server (PowerShell)
- `run-production.bat` - Run production build (Windows)

## Usage

```bash
# Deploy to Vercel
./scripts/deployment/deploy-to-vercel.sh

# Setup production environment
./scripts/deployment/setup-production.sh

# Verify deployment
./scripts/deployment/verify-deployment.sh
```

## Requirements

- Node.js 18+
- Vercel CLI (for Vercel deployments)
- Environment variables configured
EOF
    log_success "Created scripts/deployment/README.md"

    # Scripts git README
    cat > scripts/git/README.md << 'EOF'
# 📝 Git Helper Scripts

Scripts for common git operations and workflows.

## Scripts

- `git-commit-push.sh` - Commit and push changes (Linux/Mac)
- `git-commit-push.ps1` - Commit and push changes (PowerShell)
- `git-amend-commit.sh` - Amend last commit (Linux/Mac)
- `git-amend-commit.ps1` - Amend last commit (PowerShell)

## Usage

```bash
# Commit and push changes
./scripts/git/git-commit-push.sh "feat: add new feature"

# Amend last commit
./scripts/git/git-amend-commit.sh
```
EOF
    log_success "Created scripts/git/README.md"

    # Scripts testing README
    cat > scripts/testing/README.md << 'EOF'
# 🧪 Testing Scripts

Scripts for running tests and validation.

## Scripts

- `run-all-tests.sh` - Run all test suites (Linux/Mac)
- `RUN-ALL-TESTS.bat` - Run all test suites (Windows)
- `run-mvp-validation.sh` - Run MVP validation (Linux/Mac)
- `RUN-MVP-VALIDATION.bat` - Run MVP validation (Windows)
- `test-signup-fix.js` - Test signup functionality

## Usage

```bash
# Run all tests
./scripts/testing/run-all-tests.sh

# Run MVP validation
./scripts/testing/run-mvp-validation.sh
```
EOF
    log_success "Created scripts/testing/README.md"

    # Scripts development README
    cat > scripts/development/README.md << 'EOF'
# 💻 Development Scripts

Scripts for local development and debugging.

## Scripts

- `START_NOW.bat` - Quick start development server (Windows)
- `START-SERVER.bat` - Start development server (Windows)
- `start-server-fixed.sh` - Start development server with fixes (Linux/Mac)
- `FIX_ALL_ERRORS.bat` - Run error fixing scripts (Windows)
- `fix-remaining-errors.sh` - Fix remaining errors (Linux/Mac)

## Usage

```bash
# Start development server
./scripts/development/start-server-fixed.sh

# Fix errors
./scripts/development/fix-remaining-errors.sh
```
EOF
    log_success "Created scripts/development/README.md"

    # Config README
    cat > config/README.md << 'EOF'
# ⚙️ Configuration Files

Organized configuration and environment files.

## Structure

- `env-examples/` - Example environment files for different setups
- `docker/` - Docker-specific configuration files
- `archive/` - Historical configuration files

## Environment Examples

See `env-examples/` for template environment files:
- `READY-TO-UPLOAD.env` - Production-ready environment template
- `env-production-FILLME.txt` - Production environment checklist

## Usage

```bash
# Copy example env file
cp config/env-examples/READY-TO-UPLOAD.env .env

# Edit with your values
nano .env
```

## Security Notes

⚠️ **NEVER commit actual .env files with secrets!**

All files in this directory are examples and templates only.
Real environment files are gitignored.
EOF
    log_success "Created config/README.md"

    log ""
    log_info "README files created for all new directories"
}

# Update package.json scripts
update_package_json_scripts() {
    print_section "📦 Updating package.json Script Paths"

    log_info "Checking package.json for script path updates..."

    # This is informational - actual updates should be done carefully
    log_warning "Note: package.json scripts may need manual path updates"
    log_info "Check for references to moved scripts in package.json"

    # List potential scripts that might need updating
    if [ -f "package.json" ]; then
        if grep -q "deploy-to-vercel" package.json 2>/dev/null; then
            log_warning "Found 'deploy-to-vercel' in package.json - may need path update"
        fi

        if grep -q "run-all-tests" package.json 2>/dev/null; then
            log_warning "Found 'run-all-tests' in package.json - may need path update"
        fi
    fi
}

# Update .gitignore
update_gitignore() {
    print_section "🔒 Updating .gitignore"

    log_info "Checking .gitignore for completeness..."

    # Check if important patterns are present
    local patterns_to_check=(
        "*.log"
        "*.tmp"
        "*.bak"
        "cleanup-logs/"
        "config/*.env"
    )

    local missing=0
    for pattern in "${patterns_to_check[@]}"; do
        if ! grep -q "$pattern" .gitignore 2>/dev/null; then
            log_warning "Pattern missing in .gitignore: $pattern"
            ((missing++))
        fi
    done

    if [ $missing -eq 0 ]; then
        log_success ".gitignore is comprehensive"
    else
        log_info "Consider adding missing patterns to .gitignore"
    fi
}

# Generate cleanup summary
generate_summary() {
    print_section "📊 Phase 3 Cleanup Summary"

    # Count results
    SCRIPTS_AFTER=$(find . -maxdepth 1 \( -name "*.sh" -o -name "*.bat" -o -name "*.ps1" \) -type f 2>/dev/null | wc -l)
    TEXT_AFTER=$(find . -maxdepth 1 -name "*.txt" -type f 2>/dev/null | wc -l)

    DEPLOYMENT_SCRIPTS=$(find scripts/deployment -type f 2>/dev/null | wc -l)
    GIT_SCRIPTS=$(find scripts/git -type f 2>/dev/null | wc -l)
    TESTING_SCRIPTS=$(find scripts/testing -type f 2>/dev/null | wc -l)
    DEV_SCRIPTS=$(find scripts/development -type f 2>/dev/null | wc -l)

    log ""
    log "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    log "${BOLD}${GREEN}║                     CLEANUP COMPLETE! 🎉                       ║${NC}"
    log "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    log ""

    log "${CYAN}Root Directory:${NC}"
    log "  Scripts remaining in root: ${BOLD}${SCRIPTS_AFTER}${NC} (was ${SCRIPTS_COUNT})"
    log "  Text files remaining: ${BOLD}${TEXT_AFTER}${NC} (was ${TEXT_FILES})"
    log ""

    log "${CYAN}Organized Structure:${NC}"
    log "  Deployment scripts: ${BOLD}${DEPLOYMENT_SCRIPTS}${NC} files in scripts/deployment/"
    log "  Git scripts: ${BOLD}${GIT_SCRIPTS}${NC} files in scripts/git/"
    log "  Testing scripts: ${BOLD}${TESTING_SCRIPTS}${NC} files in scripts/testing/"
    log "  Development scripts: ${BOLD}${DEV_SCRIPTS}${NC} files in scripts/development/"
    log ""

    log "${CYAN}Documentation:${NC}"
    log "  ✅ README files created for all script directories"
    log "  ✅ Configuration directory organized with examples"
    log ""

    log "${YELLOW}${BOLD}Next Steps:${NC}"
    log "  1. Review moved files: ${BOLD}git status${NC}"
    log "  2. Update any package.json script paths if needed"
    log "  3. Verify build: ${BOLD}npm run build${NC}"
    log "  4. Test scripts from new locations"
    log "  5. Commit changes: ${BOLD}git add -A && git commit -m 'chore: Phase 3 - organize scripts and configs'${NC}"
    log ""

    # Save detailed log
    cat > cleanup-logs/phase3-summary.txt << EOF
Phase 3: Configuration & Scripts Cleanup - Summary
Generated: $(date)

BEFORE:
- Root scripts: ${SCRIPTS_COUNT}
- Root text files: ${TEXT_FILES}

AFTER:
- Root scripts: ${SCRIPTS_AFTER}
- Root text files: ${TEXT_AFTER}
- Organized deployment scripts: ${DEPLOYMENT_SCRIPTS}
- Organized git scripts: ${GIT_SCRIPTS}
- Organized testing scripts: ${TESTING_SCRIPTS}
- Organized development scripts: ${DEV_SCRIPTS}

IMPROVEMENTS:
- Scripts organized by purpose into subdirectories
- Environment examples centralized in config/env-examples/
- Historical summaries archived properly
- README files added for all new directories
- Root directory significantly cleaner

FILES CREATED:
- scripts/deployment/README.md
- scripts/git/README.md
- scripts/testing/README.md
- scripts/development/README.md
- config/README.md

See full log: ${LOG_FILE}
EOF

    log_success "Detailed summary saved to: cleanup-logs/phase3-summary.txt"
    log_success "Full log saved to: ${LOG_FILE}"
}

# Main execution
main() {
    print_header

    log_info "Starting Phase 3 Cleanup..."
    log_info "This will organize scripts and configuration files"
    log ""

    check_git_status
    count_files

    log ""
    read -p "Continue with Phase 3 cleanup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleanup cancelled by user."
        exit 0
    fi

    create_directories
    move_deployment_scripts
    move_git_scripts
    move_testing_scripts
    move_development_scripts
    move_docker_scripts
    move_cleanup_scripts
    move_env_files
    move_text_files
    move_docker_configs
    create_readme_files
    update_package_json_scripts
    update_gitignore
    generate_summary

    log ""
    log_success "${BOLD}Phase 3 cleanup completed successfully!${NC}"
    log_info "Review changes with: ${BOLD}git status${NC}"
}

# Run main function
main "$@"
