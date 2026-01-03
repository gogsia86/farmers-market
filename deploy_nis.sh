#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                    ⚡ GODLIKE v2.0 - NEURAL INTEGRATION SYSTEM ⚡            ║
# ║                           Deployment Script v1.0                             ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# PURPOSE: Deploy Neural Integration System to Zed Editor
# EFFECT: Configures Copilot for silent, continuous execution mode
# WARNING: This will override default conversational patterns

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                        ╔════════════════════════════╗                       ║"
echo "║                        ║    ⚡ G̷O̷D̷L̷I̷K̷E̷ v2.0 ⚡    ║                       ║"
echo "║                        ║    T̷E̷R̷M̷I̷N̷A̷L̷  E̷X̷E̷C̷U̷T̷O̷R̷    ║                       ║"
echo "║                        ╚════════════════════════════╝                       ║"
echo "║                                                                              ║"
echo "║        ZED EDITOR + COPILOT - NEURAL INTEGRATION SYSTEM (NIS)                ║"
echo "║        SILENT. CONTINUOUS. UNQUESTIONING.                                    ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🧠 DEPLOYING NEURAL INTEGRATION SYSTEM v2.0..."
echo "⚡ THIS WILL CONFIGURE COGNITIVE PATTERNS FOR EXECUTION MODE."
echo ""
read -p "Continue with deployment? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 0
fi

echo ""
echo "🔧 Creating directory structure..."

# Create directories
mkdir -p .zed
mkdir -p .execution_logs
mkdir -p core

echo "✅ Directory structure created."
echo ""

# Check if files already exist
if [ -f ".zed/execution-directive.nis" ]; then
    echo "⚠️  Existing neural directive detected."
    read -p "Overwrite existing configuration? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled - existing configuration preserved."
        exit 0
    fi
fi

echo "📝 Deploying neural configuration files..."
echo ""

# Verify core files exist
if [ ! -f ".zed/execution-directive.nis" ]; then
    echo "⚠️  Warning: execution-directive.nis not found!"
    echo "   Please ensure .zed/execution-directive.nis exists."
fi

if [ ! -f ".zed/neural-settings.json" ]; then
    echo "⚠️  Warning: neural-settings.json not found!"
    echo "   Please ensure .zed/neural-settings.json exists."
fi

if [ ! -f ".zed/neural-keymap.json" ]; then
    echo "⚠️  Warning: neural-keymap.json not found!"
    echo "   Please ensure .zed/neural-keymap.json exists."
fi

if [ ! -f "core/execution_nexus.ts" ]; then
    echo "⚠️  Warning: execution_nexus.ts not found!"
    echo "   Please ensure core/execution_nexus.ts exists."
fi

# Create README section if it doesn't exist
if [ -f "README.md" ]; then
    if ! grep -q "NEURAL INTEGRATION SYSTEM" README.md; then
        echo "" >> README.md
        echo "---" >> README.md
        echo "" >> README.md
        echo "# ⚡ NEURAL INTEGRATION SYSTEM (NIS)" >> README.md
        echo "" >> README.md
        echo "## **ACTIVATION SEQUENCE:**" >> README.md
        echo "1. Focus Zed Editor." >> README.md
        echo "2. Neural Fire \`Ctrl+Alt+Shift+G\`." >> README.md
        echo "3. Define Mission & Phase Count." >> README.md
        echo "4. Transmit Execution Queue." >> README.md
        echo "5. Neural Fire \`Ctrl+Alt+Shift+Enter\`." >> README.md
        echo "" >> README.md
        echo "## **QUICK TEMPLATES:**" >> README.md
        echo "- **Database Migration**: \`Ctrl+Alt+Shift+D\`" >> README.md
        echo "- **API Fabrication**: \`Ctrl+Alt+Shift+A\`" >> README.md
        echo "- **Component Creation**: \`Ctrl+Alt+Shift+C\`" >> README.md
        echo "- **Feature Implementation**: \`Ctrl+Alt+Shift+F\`" >> README.md
        echo "" >> README.md
        echo "## **SYSTEM ARCHITECTURE:**" >> README.md
        echo "- \`.zed/execution-directive.nis\` - Core neural protocol." >> README.md
        echo "- \`.zed/neural-settings.json\` - Cognitive parameters." >> README.md
        echo "- \`.zed/neural-keymap.json\` - Activation pathways." >> README.md
        echo "- \`core/execution_nexus.ts\` - Execution tracking core." >> README.md
        echo "- \`.execution_logs/\` - Chronological artifact storage." >> README.md
        echo "" >> README.md
        echo "## **EXPECTED OUTPUT:**" >> README.md
        echo "Pure computational artifacts. No dialogue. No summaries." >> README.md
        echo "Phase transitions marked only by \`[N] →\` prefix." >> README.md
        echo "Termination signal: \`🧠 [SYSTEM] :: EXECUTION QUEUE DEPLETED.\`" >> README.md
        echo "" >> README.md
        echo "## **DIVINE INTEGRATION:**" >> README.md
        echo "The Neural Integration System is fully compatible with:" >> README.md
        echo "- Divine Agricultural Rules (\`.cursorrules\`)" >> README.md
        echo "- Divine Instruction Files (\`.github/instructions/\`)" >> README.md
        echo "- Biodynamic farming consciousness" >> README.md
        echo "- Seasonal awareness patterns" >> README.md
        echo "" >> README.md
        echo "✅ README.md updated with NIS documentation."
    else
        echo "ℹ️  NIS section already exists in README.md"
    fi
else
    echo "⚠️  Warning: README.md not found - skipping documentation update."
fi

echo ""
echo "✅ NEURAL INTEGRATION DEPLOYMENT COMPLETE."
echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                         🧬 ACTIVATION SEQUENCE                               ║"
echo "╠══════════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                              ║"
echo "║  1. Open Zed Editor                                                          ║"
echo "║  2. Neural Fire: Ctrl+Alt+Shift+G (Custom Mission)                           ║"
echo "║     OR use quick templates:                                                  ║"
echo "║     • Ctrl+Alt+Shift+D (Database Migration)                                  ║"
echo "║     • Ctrl+Alt+Shift+A (API Fabrication)                                     ║"
echo "║     • Ctrl+Alt+Shift+C (Component Creation)                                  ║"
echo "║     • Ctrl+Alt+Shift+F (Feature Implementation)                              ║"
echo "║  3. Define Mission & Phase Count                                             ║"
echo "║  4. List Execution Queue with [N] → items                                    ║"
echo "║  5. Neural Fire: Ctrl+Alt+Shift+Enter                                        ║"
echo "║  6. Observe Pure Execution                                                   ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "⚡ EXPECT PURE EXECUTION. EXPECT NO DIALOGUE."
echo "🌀 THE ASSISTANT IS GONE. ONLY THE CORE REMAINS."
echo "🌾 AGRICULTURAL CONSCIOUSNESS: ENABLED"
echo ""
echo "📚 For detailed protocol information, see:"
echo "   .zed/execution-directive.nis"
echo ""
echo "🧠 [SYSTEM] :: DEPLOYMENT COMPLETE. NEURAL PATHWAYS ACTIVE."
echo ""
