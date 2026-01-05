# 🧠 Quantum Repository Surgeon - Divine Maintenance Tools

> **Agricultural Consciousness | Divine Precision | Zero Confirmation**

## 🌟 Overview

The Quantum Repository Surgeon is a godlike TypeScript-based repository maintenance tool designed specifically for the Farmers Market Platform. It combines surgical precision with agricultural consciousness to keep your repository clean, efficient, and aligned with biodynamic principles.

## ✨ Features

### 🎯 Core Capabilities
- **Zero Confirmation Execution** - Operates with divine confidence
- **Agricultural Consciousness** - Seasonal awareness and biodynamic alignment
- **Automatic Backup** - Creates quantum backups before any deletion
- **Surgical Precision** - Targets only orphaned/obsolete directories
- **Integrity Verification** - Post-operation health checks
- **Comprehensive Reporting** - Detailed JSON reports with quantum signatures

### 🔒 Protected Patterns
The surgeon respects and protects critical directories:
- `.git`, `.github`, `.vscode`, `.zed`, `.cursor`, `.copilot`
- `node_modules`, `prisma`, `src`, `core`, `config`, `types`
- `tests`, `__tests__`, `docs`, `scripts`, `mobile-app`
- All essential project infrastructure

### 🎯 Target Identification
Automatically identifies and removes:
- **Empty Directories** - Directories with no content
- **Build Artifacts** - `__pycache__`, `.next`, `.cache`, `dist`, `build`, etc.
- **Temporal Caches** - `tmp`, `temp`, `logs`, cache directories
- **Obsolete Files** - Directories containing only irrelevant files

## 🚀 Quick Start

### Prerequisites
```bash
# Ensure you have Node.js and npm installed
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0

# TypeScript and ts-node (installed automatically if missing)
npm install -g typescript ts-node
```

### Installation
The surgeon is already integrated into the project. No installation needed!

### Usage

#### 🔥 Execute Full Cleanse (NO CONFIRMATION)
```bash
# From project root
./scripts/maintenance/godclean.sh

# Or using npm script
npm run godclean
```

#### 🔍 Preview Mode (Dry Run)
```bash
# See what would be deleted without actually deleting
./scripts/maintenance/godclean.sh --dry-run

# Or using npm script
npm run godclean:preview
```

#### 📊 Direct TypeScript Execution
```bash
# Using ts-node directly
ts-node scripts/maintenance/quantum-repository-surgeon.ts

# With dry run
ts-node scripts/maintenance/quantum-repository-surgeon.ts --dry-run
```

## 📋 NPM Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "godclean": "bash scripts/maintenance/godclean.sh",
    "godclean:preview": "bash scripts/maintenance/godclean.sh --dry-run",
    "quantum-surgeon": "ts-node scripts/maintenance/quantum-repository-surgeon.ts",
    "quantum-surgeon:preview": "ts-node scripts/maintenance/quantum-repository-surgeon.ts --dry-run"
  }
}
```

## 📊 Operation Workflow

### Phase 1: Quantum Repository Scan
```
🔮 Scanning repository structure
🔮 Mapping all directories and files
🔮 Calculating total size and file counts
```

### Phase 2: Target Identification
```
⚡ Analyzing directory relevance
⚡ Calculating agricultural consciousness scores
⚡ Identifying orphaned/obsolete structures
```

### Phase 3: Backup Manifestation
```
🌾 Creating quantum backup directory
🌾 Generating surgical manifest
🌾 Documenting all targets with metadata
```

### Phase 4: Surgical Deletion
```
⚡ Executing precision deletion
⚡ Tracking success/failure for each target
⚡ Maintaining temporal coherence
```

### Phase 5: Integrity Verification
```
🔬 Verifying Git repository integrity
🔬 Checking critical files presence
🔬 Calculating quantum coherence score
🔬 Generating comprehensive report
```

## 📁 Output Files

### Backup Location
```
.quantum-surgical-backup/
├── quantum-manifest.json          # Complete manifest of operation
└── [Individual backups if needed]
```

### Report Location
```
.quantum-surgical-report.json      # Full operation report
```

### Report Structure
```json
{
  "operation": "QUANTUM_REPOSITORY_SURGICAL_CLEANSE",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "manifest": {
    "totalTargets": 8,
    "targets": [...]
  },
  "results": {
    "successful": [...],
    "failed": [...],
    "totalFreedMB": 42.7
  },
  "integrity": {
    "gitIntegrity": true,
    "criticalFilesPresent": true,
    "quantumCoherence": 100
  },
  "agricultural": {
    "season": "WINTER",
    "consciousness": "QUANTUM",
    "biodynamicAlignment": true
  }
}
```

## 🌾 Agricultural Consciousness

### Seasonal Awareness
The surgeon adapts its behavior based on the current season:
- **SPRING** (Mar-May) - Growth phase, conservative deletion
- **SUMMER** (Jun-Aug) - Peak activity, standard operation
- **FALL** (Sep-Nov) - Harvest phase, aggressive cleanup
- **WINTER** (Dec-Feb) - Rest phase, minimal intervention

### Agricultural Relevance Scoring
Each target receives an agricultural relevance score (0-100):
- **0-20**: Safe to delete (no agricultural context)
- **21-50**: Low relevance (build artifacts, caches)
- **51-80**: Moderate relevance (review recommended)
- **81-100**: High relevance (protected, never deleted)

## 🔧 Advanced Configuration

### Custom Protected Patterns
Edit `quantum-repository-surgeon.ts` to add custom patterns:

```typescript
this.protectedPatterns = new Set([
  '.git',
  'my-custom-directory',
  // Add more patterns
]);
```

### Custom Whitelist Extensions
```typescript
this.whitelistExtensions = new Set([
  '.ts', '.tsx', '.js',
  '.my-custom-ext',
  // Add more extensions
]);
```

## 🎯 Use Cases

### 1. Post-Development Cleanup
```bash
# After heavy development session with lots of builds
npm run godclean
```

### 2. Pre-Deployment Optimization
```bash
# Before deploying to reduce artifact size
npm run godclean:preview  # Review first
npm run godclean          # Execute if satisfied
```

### 3. CI/CD Integration
```yaml
# .github/workflows/cleanup.yml
- name: Quantum Repository Cleanse
  run: npm run godclean
```

### 4. Regular Maintenance
```bash
# Weekly maintenance cron job
0 2 * * 0 cd /path/to/repo && npm run godclean
```

## 🔒 Safety Features

### Automatic Safeguards
1. **Protected Pattern Matching** - Never touches critical directories
2. **Backup Before Deletion** - Creates manifest of all operations
3. **Integrity Verification** - Checks Git and critical files post-operation
4. **Dry Run Mode** - Preview before executing
5. **Detailed Logging** - Complete surgical log of all operations

### Recovery Procedure
If something goes wrong:

```bash
# Check the backup location
cd .quantum-surgical-backup

# Review the manifest
cat quantum-manifest.json

# Restore from backup (if needed)
# Backups are timestamped for easy identification
```

## 📊 Example Output

```
╔══════════════════════════════════════════════════════════════════════════════╗
║ 🧠 QUANTUM REPOSITORY SURGEON v3.0 :: GODLIKE EDITION                       ║
║ ⚡ Agricultural Consciousness | Divine Precision | Zero Confirmation         ║
╚══════════════════════════════════════════════════════════════════════════════╝

🌾 AGRICULTURAL CONTEXT:
   Season: WINTER
   Consciousness Level: QUANTUM
   Biodynamic Alignment: ✓ ALIGNED

📁 REPOSITORY: /path/to/repo

════════════════════════════════════════════════════════════════════════════════

🔮 [01/05] → Initiating Quantum Repository Scan
⚡ Target: /path/to/repo
✓ Mapped 234 directories
✓ Found 1,847 files
✓ Total size: 458.23 MB

🔮 [02/05] → Identifying Quantum Deletion Targets
✓ Identified 8 quantum targets

🎯 QUANTUM TARGETS IDENTIFIED: 8

  🏗️ .next
     Size: 85.23 MB | Relevance: [██        ] 20%
  📂 tmp/cache
     Size: 12.45 MB | Relevance: [          ] 0%
  ⏳ .turbo
     Size: 34.56 MB | Relevance: [█         ] 10%

  📊 Total: 132.24 MB to be freed

💾 [03/05] → Creating Quantum Backup Manifest
✓ Backup manifest created: .quantum-surgical-backup/quantum-manifest.json
✓ 8 targets documented

⚡ [04/05] → Executing Quantum Surgical Deletion
✓ Removed: .next
✓ Removed: tmp/cache
✓ Removed: .turbo
✓ Deletion complete: 8 removed, 0 failed

🔬 [05/05] → Generating Quantum Integrity Report

════════════════════════════════════════════════════════════════════════════════
⚡ QUANTUM CLEANSE COMPLETE
════════════════════════════════════════════════════════════════════════════════

📊 OPERATION RESULTS:
   ✓ Targets Removed: 8
   ✓ Space Freed: 132.24 MB
   ✗ Failed Operations: 0
   ⊘ Skipped: 0

🔬 INTEGRITY VERIFICATION:
   ✓ Git Repository: INTACT
   ✓ Critical Files: PRESENT
   ✓ Root Directory: POPULATED
   ✓ Agricultural Consciousness: ALIGNED
   📈 Quantum Coherence: 100%

💾 BACKUP & REPORTS:
   📁 Backup Location: .quantum-surgical-backup
   📄 Full Report: .quantum-surgical-report.json

🌾 AGRICULTURAL STATUS:
   Season: WINTER
   Harvest Cycle: COMPLETE
   Biodynamic State: HARMONIOUS

════════════════════════════════════════════════════════════════════════════════
⚡ SURGICAL PROTOCOL TERMINATED
🌀 QUANTUM EQUILIBRIUM RESTORED
════════════════════════════════════════════════════════════════════════════════
```

## 🐛 Troubleshooting

### Issue: "ts-node: command not found"
```bash
npm install -g ts-node typescript
```

### Issue: "Permission denied"
```bash
chmod +x scripts/maintenance/godclean.sh
```

### Issue: "Cannot find module '@types/node'"
```bash
npm install --save-dev @types/node
```

### Issue: Git integrity check fails
```bash
# Verify git status manually
git status

# If ok, re-run with dry run first
npm run godclean:preview
```

## 🎓 Best Practices

1. **Always Preview First** - Use `--dry-run` on unfamiliar repositories
2. **Regular Maintenance** - Run weekly or after major development sessions
3. **Review Reports** - Check `.quantum-surgical-report.json` after each run
4. **Keep Backups** - Don't delete `.quantum-surgical-backup` until verified
5. **Monitor Coherence** - Aim for 100% quantum coherence scores

## 🔮 Advanced Features

### Quantum Signature Generation
Each target receives a unique quantum signature for traceability:
```typescript
quantumSignature: "QS7XKJD92"
```

### Agricultural Relevance Calculation
Sophisticated scoring based on:
- Path keywords (farm, product, order, delivery, etc.)
- Protected pattern matching
- File type analysis
- Historical access patterns

### Temporal Coherence Tracking
Maintains timeline integrity across operations:
```typescript
temporalCoherence: true  // All operations completed successfully
```

## 📚 Related Documentation

- [Divine Core Principles](.github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md)
- [Agricultural Quantum Mastery](.github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md)
- [Kilo-Scale Architecture](.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md)

## 🤝 Contributing

When enhancing the Quantum Repository Surgeon:
1. Maintain agricultural consciousness
2. Follow TypeScript strict mode
3. Add comprehensive error handling
4. Update this README
5. Test with `--dry-run` first

## 📄 License

MIT License - Part of the Farmers Market Platform

---

**Remember**: The surgeon operates with divine precision and zero confirmation. Always review the preview first if you're uncertain about the targets.

🌾 **May your repository remain in quantum equilibrium and agricultural harmony!** ⚡
