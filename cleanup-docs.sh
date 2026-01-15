#!/bin/bash
# 🧹 DOCUMENTATION CLEANUP SCRIPT
# Moves 99% of markdown files to archive, keeping only essentials
# Created: January 14, 2025

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧹 Starting Documentation Cleanup...${NC}"
echo ""

# Files to KEEP in root directory
KEEP_FILES=("README.md" "CHANGELOG.md" "CONTRIBUTING.md" "LICENSE")

# Count total .md files in root
TOTAL_MD_FILES=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)

echo -e "${YELLOW}📊 Current Status:${NC}"
echo -e "   Total .md files in root: ${WHITE}$TOTAL_MD_FILES${NC}"
echo -e "   Files to keep: ${GREEN}${#KEEP_FILES[@]}${NC}"
echo -e "   Files to archive: ${CYAN}$((TOTAL_MD_FILES - ${#KEEP_FILES[@]}))${NC}"
echo ""

# Create archive directory if not exists
ARCHIVE_DIR="docs/archive/2025-01-previous"
if [ ! -d "$ARCHIVE_DIR" ]; then
    mkdir -p "$ARCHIVE_DIR"
    echo -e "${GREEN}✅ Created archive directory: $ARCHIVE_DIR${NC}"
fi

# Counters
MOVED_COUNT=0
KEPT_COUNT=0
ERROR_COUNT=0

echo -e "${YELLOW}📦 Moving files to archive...${NC}"
echo ""

# Function to check if file should be kept
should_keep() {
    local filename="$1"
    for keep_file in "${KEEP_FILES[@]}"; do
        if [ "$filename" = "$keep_file" ]; then
            return 0
        fi
    done
    return 1
}

# Process each .md file in root
for file in *.md; do
    # Skip if no .md files found
    [ -e "$file" ] || continue

    if should_keep "$file"; then
        echo -e "   ${GREEN}✓ Keeping: $file${NC}"
        ((KEPT_COUNT++))
    else
        DESTINATION="$ARCHIVE_DIR/$file"

        # If file already exists in archive, add timestamp
        if [ -f "$DESTINATION" ]; then
            TIMESTAMP=$(date +%Y%m%d-%H%M%S)
            BASENAME="${file%.md}"
            DESTINATION="$ARCHIVE_DIR/${BASENAME}-${TIMESTAMP}.md"
        fi

        if mv "$file" "$DESTINATION" 2>/dev/null; then
            echo -e "   ${WHITE}→ Archived: $file${NC}"
            ((MOVED_COUNT++))
        else
            echo -e "   ${RED}✗ Error moving: $file${NC}"
            ((ERROR_COUNT++))
        fi
    fi
done

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 CLEANUP SUMMARY${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   Files kept in root:     ${GREEN}$KEPT_COUNT${NC}"
echo -e "   Files moved to archive: ${YELLOW}$MOVED_COUNT${NC}"
if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "   Errors encountered:     ${GREEN}$ERROR_COUNT${NC}"
else
    echo -e "   Errors encountered:     ${RED}$ERROR_COUNT${NC}"
fi
echo ""

# Show remaining files in root
echo -e "${GREEN}📁 Files remaining in root directory:${NC}"
for file in *.md; do
    [ -e "$file" ] && echo -e "   ${WHITE}✓ $file${NC}"
done
echo ""

# Calculate archive size
ARCHIVE_SIZE=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1)
echo -e "${CYAN}💾 Archive size: $ARCHIVE_SIZE${NC}"
echo ""

echo -e "${GREEN}✅ CLEANUP COMPLETE!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "   ${WHITE}1. Review the 4 files in root directory${NC}"
echo -e "   ${WHITE}2. Create consolidated documentation in docs/${NC}"
echo -e "   ${WHITE}3. Update README.md with new structure${NC}"
echo -e "   ${WHITE}4. Archive is in: $ARCHIVE_DIR${NC}"
echo ""
echo -e "${CYAN}🎉 Your project is now much cleaner!${NC}"
echo ""

# Create a reference index file in the archive
cat > "$ARCHIVE_DIR/README.md" << EOF
# 📚 ARCHIVED DOCUMENTATION INDEX
Generated: $(date '+%Y-%m-%d %H:%M:%S')

This directory contains $MOVED_COUNT markdown files that were archived during the documentation cleanup on January 14, 2025.

## Why These Files Were Archived

These files represented historical documentation, intermediate summaries, and redundant guides that made the project difficult to navigate. The information from these files has been consolidated into the main documentation structure.

## Finding Information

If you're looking for specific information that was in these archived files:

1. **Check the new consolidated docs first**: \`docs/getting-started/\`, \`docs/deployment/\`, etc.
2. **Search this archive**: Use your editor's search or \`grep -r "search term" .\`
3. **Refer to git history**: All information is preserved in version control

## Archive Contents

Total files: $MOVED_COUNT
Archive date: January 14, 2025
Archived by: Documentation cleanup script

## Note

These files are kept for historical reference only. For current documentation, please refer to:
- \`/README.md\` - Main project overview
- \`/docs/getting-started/\` - Getting started guides
- \`/docs/deployment/\` - Deployment information
- \`/docs/development/\` - Development guides
- \`/docs/operations/\` - Operations and maintenance

---

*This archive can be safely deleted after 6 months if no longer needed.*
EOF

echo -e "${CYAN}📋 Created archive index: $ARCHIVE_DIR/README.md${NC}"
echo ""

# Make the script remind about consolidated docs
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo -e "   ${WHITE}Don't forget to create consolidated documentation!${NC}"
echo -e "   ${WHITE}Run the consolidation script next.${NC}"
echo ""
