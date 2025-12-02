#!/bin/bash

##############################################################################
# 🔧 FIX DUPLICATE ROUTES SCRIPT
#
# This script fixes all references to the outdated /farmer-dashboard route
# and updates them to point to the correct /farmer/dashboard route
#
# Date: December 1, 2024
# Priority: HIGH
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           🔧 DUPLICATE ROUTE CLEANUP SCRIPT                       ║${NC}"
echo -e "${BLUE}╠═══════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  This script will:                                               ║${NC}"
echo -e "${BLUE}║  1. Find all references to /farmer-dashboard                     ║${NC}"
echo -e "${BLUE}║  2. Update them to /farmer/dashboard                             ║${NC}"
echo -e "${BLUE}║  3. Create backups before changes                                ║${NC}"
echo -e "${BLUE}║  4. Report all changes made                                      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Confirm before proceeding
read -p "$(echo -e ${YELLOW})"$'Continue with cleanup? (yes/no): '"$(echo -e ${NC})" -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}❌ Cleanup cancelled${NC}"
    exit 1
fi

# Create backup directory
BACKUP_DIR="backup-route-cleanup-$(date +%Y%m%d-%H%M%S)"
echo -e "${BLUE}📦 Creating backup directory: ${BACKUP_DIR}${NC}"
mkdir -p "$BACKUP_DIR"

# Function to backup and update a file
update_file() {
    local file=$1
    local display_file=${file#src/}  # Remove src/ prefix for display

    # Check if file contains the old route
    if grep -q "farmer-dashboard" "$file"; then
        echo -e "${YELLOW}📝 Updating: ${display_file}${NC}"

        # Create backup
        local backup_path="$BACKUP_DIR/$file"
        mkdir -p "$(dirname "$backup_path")"
        cp "$file" "$backup_path"

        # Count occurrences before
        local count_before=$(grep -o "farmer-dashboard" "$file" | wc -l)

        # Update the file
        # Replace /farmer-dashboard with /farmer/dashboard
        sed -i.tmp 's|/farmer-dashboard|/farmer/dashboard|g' "$file"

        # Also handle cases without leading slash
        sed -i.tmp 's|href="farmer-dashboard"|href="/farmer/dashboard"|g' "$file"
        sed -i.tmp 's|router\.push("farmer-dashboard")|router.push("/farmer/dashboard")|g' "$file"

        # Remove temp file
        rm -f "$file.tmp"

        # Count occurrences after
        local count_after=$(grep -o "farmer-dashboard" "$file" 2>/dev/null | wc -l || echo "0")

        echo -e "${GREEN}   ✅ Updated ${count_before} occurrence(s)${NC}"

        if [ "$count_after" -gt 0 ]; then
            echo -e "${YELLOW}   ⚠️  Warning: ${count_after} occurrence(s) still remain${NC}"
        fi

        return 0
    fi
    return 1
}

# Counter for statistics
total_files=0
updated_files=0

echo ""
echo -e "${BLUE}🔍 Scanning for files with farmer-dashboard references...${NC}"
echo ""

# Find and update all files
while IFS= read -r file; do
    ((total_files++))
    if update_file "$file"; then
        ((updated_files++))
    fi
done < <(find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) | sort)

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ CLEANUP COMPLETE!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Statistics:${NC}"
echo -e "   Files scanned: ${total_files}"
echo -e "   Files updated: ${GREEN}${updated_files}${NC}"
echo -e "   Backup location: ${YELLOW}${BACKUP_DIR}${NC}"
echo ""

# Verify no references remain
echo -e "${BLUE}🔍 Verifying cleanup...${NC}"
remaining=$(grep -r "farmer-dashboard" src --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | grep -v "farmer/dashboard" | wc -l)

if [ "$remaining" -eq 0 ]; then
    echo -e "${GREEN}✅ All references successfully updated!${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: ${remaining} reference(s) still remain${NC}"
    echo -e "${YELLOW}   Manual review may be needed for these files:${NC}"
    grep -r "farmer-dashboard" src --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | grep -v "farmer/dashboard" | head -10
fi

echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "   1. ${GREEN}Review the changes${NC}: git diff src/"
echo -e "   2. ${GREEN}Test the application${NC}: npm run dev"
echo -e "   3. ${GREEN}Test farmer login${NC}: Should redirect to /farmer/dashboard"
echo -e "   4. ${GREEN}Verify all links work${NC}: Check navigation in browser"
echo -e "   5. ${GREEN}Run type check${NC}: npm run type-check"
echo -e "   6. ${GREEN}Run lint${NC}: npm run lint"
echo ""
echo -e "${YELLOW}📁 Backup saved to: ${BACKUP_DIR}${NC}"
echo -e "${YELLOW}   Restore if needed: cp -r ${BACKUP_DIR}/src/* src/${NC}"
echo ""

# Optional: Show detailed changes
read -p "$(echo -e ${BLUE})"$'Show detailed changes? (yes/no): '"$(echo -e ${NC})" -r
echo
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📝 Detailed Changes:${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"

    find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
        if [ -f "$BACKUP_DIR/$file" ]; then
            diff_output=$(diff -u "$BACKUP_DIR/$file" "$file" 2>/dev/null || true)
            if [ -n "$diff_output" ]; then
                echo ""
                echo -e "${GREEN}File: ${file}${NC}"
                echo "$diff_output" | grep "^[\+\-]" | grep -v "^[\+\-][\+\-][\+\-]" | head -20
            fi
        fi
    done
fi

echo ""
echo -e "${GREEN}🎉 Script completed successfully!${NC}"
echo ""

# Create a summary file
SUMMARY_FILE="$BACKUP_DIR/CLEANUP_SUMMARY.txt"
cat > "$SUMMARY_FILE" << EOF
═══════════════════════════════════════════════════════════════════
    FARMER DASHBOARD ROUTE CLEANUP SUMMARY
═══════════════════════════════════════════════════════════════════

Date: $(date)
Backup Directory: $BACKUP_DIR

Statistics:
-----------
Files Scanned: $total_files
Files Updated: $updated_files
Remaining References: $remaining

Changes Made:
-------------
All references to "/farmer-dashboard" have been updated to "/farmer/dashboard"

Files Updated:
EOF

find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
    if [ -f "$BACKUP_DIR/$file" ]; then
        if ! diff -q "$BACKUP_DIR/$file" "$file" > /dev/null 2>&1; then
            echo "  - $file" >> "$SUMMARY_FILE"
        fi
    fi
done

cat >> "$SUMMARY_FILE" << EOF

Next Actions Required:
---------------------
1. Delete the old farmer-dashboard directory:
   rm -rf src/app/farmer-dashboard

2. Test the application:
   npm run dev

3. Test farmer authentication flow:
   - Login as farmer
   - Should redirect to /farmer/dashboard
   - Verify all links work

4. Run quality checks:
   npm run type-check
   npm run lint
   npm run build

5. Commit the changes:
   git add src/
   git commit -m "fix: update all farmer-dashboard routes to farmer/dashboard"

Restore Instructions:
--------------------
If you need to restore the original files:
   cp -r $BACKUP_DIR/src/* src/

═══════════════════════════════════════════════════════════════════
EOF

echo -e "${GREEN}📄 Summary saved to: ${SUMMARY_FILE}${NC}"
echo ""
