#!/bin/bash
#
# Divine Git Commit Message Amend Script
# Script to amend the last commit message with proper format validation
# Maintains agricultural consciousness and divine precision.
#
# Usage:
#   ./git-amend-commit.sh
#   ./git-amend-commit.sh "new message" "type"
#   ./git-amend-commit.sh "new message" "type" --keep-changes

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
NEW_MESSAGE="${1:-}"
COMMIT_TYPE="${2:-}"
KEEP_CHANGES=false

if [ "$3" == "--keep-changes" ]; then
    KEEP_CHANGES=true
fi

# Main script
write_header "🔧 Divine Git Commit Message Amendment"

# Step 1: Check if there are commits to amend
write_step "Checking repository status..."
COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null)
if [ $? -ne 0 ] || [ "$COMMIT_COUNT" == "0" ]; then
    write_error "No commits found to amend!"
    exit 1
fi

write_success "Repository has $COMMIT_COUNT commit(s)"

# Step 2: Show current commit
echo ""
write_step "Current commit message:"
echo ""
CURRENT_MESSAGE=$(git log -1 --pretty=%B)
echo -e "  ${COLOR_YELLOW}${CURRENT_MESSAGE}${COLOR_RESET}"
echo ""

# Step 3: Check for staged changes
if [ "$KEEP_CHANGES" == true ]; then
    STAGED_CHANGES=$(git diff --cached --name-only)
    if [ ! -z "$STAGED_CHANGES" ]; then
        write_warning "The following staged changes will be included in the amended commit:"
        echo "$STAGED_CHANGES" | while read -r file; do
            echo -e "  ${COLOR_YELLOW}${file}${COLOR_RESET}"
        done
        echo ""
    fi
fi

# Step 4: Get commit type if not provided
if [ -z "$COMMIT_TYPE" ]; then
    echo -e "${COLOR_YELLOW}Select new commit type:${COLOR_RESET}"
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
    echo -e "${COLOR_CYAN}  11. keep    - Keep current type${COLOR_RESET}"
    echo ""

    read -p "Enter number (1-11): " type_choice

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
        11)
            # Extract type from current message
            if [[ $CURRENT_MESSAGE =~ ^([a-z]+): ]]; then
                COMMIT_TYPE="${BASH_REMATCH[1]}"
            else
                COMMIT_TYPE="chore"
            fi
            ;;
        *) COMMIT_TYPE="chore" ;;
    esac
fi

write_success "Commit type: $COMMIT_TYPE"

# Step 5: Get new commit message if not provided
if [ -z "$NEW_MESSAGE" ]; then
    echo ""
    echo -e "${COLOR_YELLOW}Enter new commit message:${COLOR_RESET}"
    echo -e "${COLOR_CYAN}(Press Enter to keep current message body)${COLOR_RESET}"
    read -p "Message: " NEW_MESSAGE

    if [ -z "$NEW_MESSAGE" ]; then
        # Try to extract message from current commit
        if [[ $CURRENT_MESSAGE =~ ^[a-z]+:[[:space:]]*(.+) ]]; then
            NEW_MESSAGE="${BASH_REMATCH[1]}"
            write_warning "Keeping current message: $NEW_MESSAGE"
        else
            write_error "Commit message cannot be empty!"
            exit 1
        fi
    fi
fi

# Step 6: Build new commit message
FULL_MESSAGE="${COMMIT_TYPE}: ${NEW_MESSAGE}"

echo ""
write_step "Preparing amendment..."
echo -e "  ${COLOR_YELLOW}Old: $CURRENT_MESSAGE${COLOR_RESET}"
echo -e "  ${COLOR_GREEN}New: $FULL_MESSAGE${COLOR_RESET}"
echo ""

# Step 7: Check if commit has been pushed
write_step "Checking if commit has been pushed..."
CURRENT_BRANCH=$(git branch --show-current)
REMOTE_NAME=$(git config --get branch.${CURRENT_BRANCH}.remote)

NEEDS_FORCE_PUSH=false

if [ ! -z "$REMOTE_NAME" ]; then
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse "${REMOTE_NAME}/${CURRENT_BRANCH}" 2>/dev/null)

    if [ "$LOCAL_COMMIT" == "$REMOTE_COMMIT" ]; then
        NEEDS_FORCE_PUSH=true
        echo ""
        write_warning "⚠️  WARNING: This commit has been pushed to remote!"
        write_warning "Amending it will rewrite history and require force push."
        echo ""
        echo -e "${COLOR_YELLOW}This means:${COLOR_RESET}"
        echo -e "${COLOR_YELLOW}  1. You'll need to force push: git push --force-with-lease${COLOR_RESET}"
        echo -e "${COLOR_YELLOW}  2. Other collaborators will need to reset their branches${COLOR_RESET}"
        echo -e "${COLOR_YELLOW}  3. This can cause issues in shared repositories${COLOR_RESET}"
        echo ""

        read -p "Do you understand and want to proceed? (type 'yes' to continue): " force_confirm
        if [ "$force_confirm" != "yes" ]; then
            write_warning "Amendment cancelled"
            exit 0
        fi
    fi
fi

# Step 8: Ask for confirmation
echo ""
read -p "Proceed with amending commit? (Y/n): " confirm
if [ "$confirm" == "n" ] || [ "$confirm" == "N" ]; then
    write_warning "Amendment cancelled"
    exit 0
fi

# Step 9: Amend the commit
echo ""
write_step "Amending commit message..."

if [ "$KEEP_CHANGES" == true ]; then
    # Amend with staged changes
    git commit --amend -m "$FULL_MESSAGE"
else
    # Amend only message, keep same tree
    git commit --amend --no-edit -m "$FULL_MESSAGE"
fi

if [ $? -ne 0 ]; then
    write_error "Failed to amend commit!"
    exit 1
fi

write_success "Commit amended successfully!"

# Step 10: Show updated commit
echo ""
write_step "Updated commit:"
echo ""
git log -1 --pretty=format:"%C(yellow)%h%Creset %C(green)%s%Creset %C(cyan)(%ar)%Creset" --abbrev-commit
echo ""
echo ""

# Step 11: Check if force push is needed
if [ "$NEEDS_FORCE_PUSH" == true ]; then
    echo ""
    write_warning "This commit was already pushed. To update remote, run:"
    echo -e "  ${COLOR_CYAN}git push --force-with-lease origin ${CURRENT_BRANCH}${COLOR_RESET}"
    echo ""

    read -p "Force push now? (y/N): " push_now
    if [ "$push_now" == "y" ] || [ "$push_now" == "Y" ]; then
        write_step "Force pushing to remote..."
        git push --force-with-lease origin "$CURRENT_BRANCH"

        if [ $? -eq 0 ]; then
            write_success "Successfully pushed to remote!"
        else
            write_error "Force push failed!"
            echo -e "${COLOR_YELLOW}Try manually: git push --force-with-lease origin ${CURRENT_BRANCH}${COLOR_RESET}"
        fi
    fi
fi

# Step 12: Summary
echo ""
write_header "🎉 Amendment Complete!"
echo -e "✨ ${COLOR_GREEN}New Type: $COMMIT_TYPE${COLOR_RESET}"
echo -e "✨ ${COLOR_GREEN}New Message: $NEW_MESSAGE${COLOR_RESET}"
echo ""
echo -e "${COLOR_MAGENTA}🌾 Agricultural consciousness maintained throughout operation${COLOR_MAGENTA}"
echo ""

exit 0
