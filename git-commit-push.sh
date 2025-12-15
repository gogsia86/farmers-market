#!/bin/bash
#
# Divine Git Commit and Push Script
# Automated script to commit and push changes to git repository
# with agricultural consciousness and divine precision.
#
# Usage:
#   ./git-commit-push.sh
#   ./git-commit-push.sh "commit message" "type"
#   ./git-commit-push.sh "commit message" "type" --no-push

# Colors for output
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_CYAN='\033[0;36m'
COLOR_MAGENTA='\033[0;35m'
COLOR_RESET='\033[0m'

# Functions
write_header() {
    echo -e "\n${COLOR_MAGENTA}╔════════════════════════════════════════════════════════════╗${COLOR_RESET}"
    echo -e "${COLOR_MAGENTA}║ $1${COLOR_RESET}"
    echo -e "${COLOR_MAGENTA}╚════════════════════════════════════════════════════════════╝${COLOR_RESET}\n"
}

write_step() {
    echo -e "${COLOR_CYAN}🌾 $1${COLOR_RESET}"
}

write_success() {
    echo -e "${COLOR_GREEN}✅ $1${COLOR_RESET}"
}

write_error() {
    echo -e "${COLOR_RED}❌ $1${COLOR_RESET}"
}

write_warning() {
    echo -e "${COLOR_YELLOW}⚠️  $1${COLOR_RESET}"
}

# Parse arguments
COMMIT_MESSAGE="${1:-}"
COMMIT_TYPE="${2:-}"
SHOULD_PUSH=true

if [ "$3" == "--no-push" ]; then
    SHOULD_PUSH=false
fi

# Main script
write_header "🌟 Divine Git Commit & Push Automation"

# Step 1: Check git status
write_step "Checking repository status..."
if [ -z "$(git status --porcelain)" ]; then
    write_warning "No changes to commit!"
    exit 0
fi

write_success "Changes detected"
echo ""
git status --short
echo ""

# Step 2: Get commit type if not provided
if [ -z "$COMMIT_TYPE" ]; then
    echo -e "${COLOR_YELLOW}Select commit type:${COLOR_RESET}"
    echo -e "${COLOR_CYAN}  1. feat     - New feature${COLOR_RESET}"
    echo -e "${COLOR_CYAN}  2. fix      - Bug fix${COLOR_RESET}"
    echo -e "${COLOR_CYAN}  3. docs     - Documentation${COLOR_RESET}"
    echo -e "${COLOR_CYAN}  4. style    - Code style/formatting${COLOR_RESET}"
    echo -e "${COLOR_CYAN}  5. refactor - Code refactoring${COLOR_RESET}"
    echo -e "${COLOR_CYAN}  6. test     - Tests${COLOR_RESET}"
    echo -e "${COLOR_CYAN}  7. chore    - Maintenance${COLOR_RESET}"
    echo -e "${COLOR_CYAN}  8. perf     - Performance${COLOR_RESET}"
    echo -e "${COLOR_CYAN}  9. ci       - CI/CD${COLOR_RESET}"
    echo -e "${COLOR_CYAN}  10. build   - Build system${COLOR_RESET}"
    echo ""

    read -p "Enter number (1-10): " type_choice

    case $type_choice in
        1) COMMIT_TYPE="feat" ;;
        2) COMMIT_TYPE="fix" ;;
        3) COMMIT_TYPE="docs" ;;
        4) COMMIT_TYPE="style" ;;
        5) COMMIT_TYPE="refactor" ;;
        6) COMMIT_TYPE="test" ;;
        7) COMMIT_TYPE="chore" ;;
        8) COMMIT_TYPE="perf" ;;
        9) COMMIT_TYPE="ci" ;;
        10) COMMIT_TYPE="build" ;;
        *) COMMIT_TYPE="chore" ;;
    esac
fi

write_success "Commit type: $COMMIT_TYPE"

# Step 3: Get commit message if not provided
if [ -z "$COMMIT_MESSAGE" ]; then
    echo ""
    echo -e "${COLOR_YELLOW}Enter commit message:${COLOR_RESET}"
    read -p "Message: " COMMIT_MESSAGE

    if [ -z "$COMMIT_MESSAGE" ]; then
        write_error "Commit message cannot be empty!"
        exit 1
    fi
fi

# Step 4: Build full commit message
FULL_MESSAGE="${COMMIT_TYPE}: ${COMMIT_MESSAGE}"

echo ""
write_step "Preparing commit..."
echo -e "  ${COLOR_GREEN}Type: $COMMIT_TYPE${COLOR_RESET}"
echo -e "  ${COLOR_GREEN}Message: $COMMIT_MESSAGE${COLOR_RESET}"
echo -e "  ${COLOR_GREEN}Full: $FULL_MESSAGE${COLOR_RESET}"

# Step 5: Ask for confirmation
echo ""
read -p "Proceed with commit? (Y/n): " confirm
if [ "$confirm" == "n" ] || [ "$confirm" == "N" ]; then
    write_warning "Commit cancelled"
    exit 0
fi

# Step 6: Stage all changes
echo ""
write_step "Staging all changes..."
git add .

if [ $? -ne 0 ]; then
    write_error "Failed to stage changes!"
    exit 1
fi

write_success "Changes staged"

# Step 7: Commit changes
echo ""
write_step "Committing changes..."
git commit -m "$FULL_MESSAGE"

if [ $? -ne 0 ]; then
    write_error "Commit failed! Check pre-commit hooks."
    exit 1
fi

write_success "Commit successful!"

# Step 8: Push to remote (if enabled)
if [ "$SHOULD_PUSH" == true ]; then
    echo ""
    write_step "Pushing to remote repository..."

    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "  ${COLOR_CYAN}Branch: $CURRENT_BRANCH${COLOR_RESET}"

    read -p "Push to origin/$CURRENT_BRANCH? (Y/n): " push_confirm
    if [ "$push_confirm" == "n" ] || [ "$push_confirm" == "N" ]; then
        write_warning "Push cancelled"
        write_success "Commit saved locally"
        exit 0
    fi

    git push origin "$CURRENT_BRANCH"

    if [ $? -ne 0 ]; then
        write_error "Push failed! You may need to:"
        echo -e "  ${COLOR_YELLOW}1. Check your internet connection${COLOR_RESET}"
        echo -e "  ${COLOR_YELLOW}2. Verify remote repository exists${COLOR_RESET}"
        echo -e "  ${COLOR_YELLOW}3. Ensure you have push permissions${COLOR_RESET}"
        echo -e "  ${COLOR_YELLOW}4. Pull latest changes first: git pull origin $CURRENT_BRANCH${COLOR_RESET}"
        echo ""
        echo -e "${COLOR_YELLOW}Your commit is saved locally. Push manually when ready:${COLOR_RESET}"
        echo -e "  ${COLOR_CYAN}git push origin $CURRENT_BRANCH${COLOR_RESET}"
        exit 1
    fi

    write_success "Pushed to remote successfully!"
fi

# Step 9: Summary
echo ""
write_header "🎉 Operation Complete!"
echo -e "✨ ${COLOR_GREEN}Commit Type: $COMMIT_TYPE${COLOR_RESET}"
echo -e "✨ ${COLOR_GREEN}Message: $COMMIT_MESSAGE${COLOR_RESET}"
if [ "$SHOULD_PUSH" == true ] && [ $? -eq 0 ]; then
    echo -e "✨ ${COLOR_GREEN}Status: Committed and Pushed${COLOR_RESET}"
else
    echo -e "✨ ${COLOR_GREEN}Status: Committed Locally${COLOR_RESET}"
fi
echo ""
echo -e "${COLOR_MAGENTA}🌾 Agricultural consciousness maintained throughout operation${COLOR_RESET}"
echo ""

exit 0
