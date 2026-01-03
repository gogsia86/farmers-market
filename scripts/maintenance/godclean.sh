#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║ 🧠 GODCLEAN - QUANTUM REPOSITORY SURGEON LAUNCHER                           ║
# ║ ⚡ One-command divine repository cleansing                                   ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SURGEON_SCRIPT="$SCRIPT_DIR/quantum-repository-surgeon.ts"

# Colors for divine output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Divine banner
echo -e "${PURPLE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║ 🧠 GODCLEAN :: QUANTUM REPOSITORY SURGEON                                    ║
║ ⚡ Divine Agricultural Repository Maintenance                                ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if ts-node is available
if ! command -v ts-node &> /dev/null; then
    echo -e "${YELLOW}⚠️  ts-node not found. Installing...${NC}"
    npm install -g ts-node
fi

# Check if TypeScript is available
if ! command -v tsc &> /dev/null; then
    echo -e "${YELLOW}⚠️  TypeScript not found. Installing...${NC}"
    npm install -g typescript
fi

# Parse arguments
DRY_RUN=""
SHOW_HELP=false

for arg in "$@"; do
    case $arg in
        --dry-run|-d)
            DRY_RUN="--dry-run"
            echo -e "${CYAN}🔍 DRY RUN MODE ACTIVATED${NC}"
            ;;
        --help|-h)
            SHOW_HELP=true
            ;;
    esac
done

# Show help if requested
if [ "$SHOW_HELP" = true ]; then
    echo -e "${CYAN}USAGE:${NC}"
    echo "  ./godclean.sh [OPTIONS]"
    echo ""
    echo -e "${CYAN}OPTIONS:${NC}"
    echo "  -d, --dry-run    Preview what would be deleted without actually deleting"
    echo "  -h, --help       Show this help message"
    echo ""
    echo -e "${CYAN}EXAMPLES:${NC}"
    echo "  ./godclean.sh              # Execute full quantum cleanse"
    echo "  ./godclean.sh --dry-run    # Preview targets without deletion"
    echo ""
    echo -e "${CYAN}FEATURES:${NC}"
    echo "  ⚡ Zero confirmation - surgical precision execution"
    echo "  💾 Automatic backup before deletion"
    echo "  🌾 Agricultural consciousness integration"
    echo "  🔬 Post-operation integrity verification"
    echo "  📊 Comprehensive reporting"
    exit 0
fi

# Execute the quantum surgeon
echo -e "${GREEN}⚡ Initializing Quantum Repository Surgeon...${NC}"
echo ""

cd "$REPO_ROOT"

if [ -n "$DRY_RUN" ]; then
    ts-node "$SURGEON_SCRIPT" --dry-run
else
    echo -e "${YELLOW}⚠️  EXECUTING SURGICAL DELETION (NO CONFIRMATION)${NC}"
    echo -e "${YELLOW}   Backup will be created at: .quantum-surgical-backup/${NC}"
    echo ""
    sleep 2
    ts-node "$SURGEON_SCRIPT"
fi

# Check exit status
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ QUANTUM CLEANSE COMPLETE${NC}"
    echo -e "${CYAN}📄 Check .quantum-surgical-report.json for full details${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ QUANTUM COHERENCE DISRUPTION${NC}"
    echo -e "${YELLOW}⚠️  Check error messages above${NC}"
    exit 1
fi
