# ⚡ Quantum Repository Surgeon - Quick Reference Card

> **One-page guide for instant execution**

## 🚀 Instant Commands

```bash
# Preview targets (SAFE - recommended first)
npm run godclean:preview

# Execute cleanse (ZERO CONFIRMATION)
npm run godclean

# Direct TypeScript execution
npm run quantum-surgeon

# TypeScript preview
npm run quantum-surgeon:preview

# Shell script with help
./scripts/maintenance/godclean.sh --help
```

## 📊 What It Does

### ✅ Targets (Safe to Delete)
- Empty directories
- Build artifacts (`.next`, `.cache`, `dist`, `build`)
- Temporal caches (`tmp`, `temp`, `logs`)
- Obsolete/irrelevant files

### 🔒 Protected (Never Touched)
- Source code (`src`, `core`, `types`)
- Configuration (`config`, `prisma`)
- Tests (`tests`, `__tests__`)
- Documentation (`docs`)
- Infrastructure (`.git`, `.github`, `docker`)
- Development tools (`.vscode`, `.zed`, `.cursor`)
- Dependencies (`node_modules`)

## 🎯 Typical Output

```
🌾 Season: WINTER
🎯 Targets: 5-15 directories
💾 Space Freed: 50-500 MB
⚡ Time: <30 seconds
```

## 📁 Generated Files

```
.quantum-surgical-backup/
└── quantum-manifest.json    # Backup manifest

.quantum-surgical-report.json  # Full report
```

## 🌾 Agricultural Features

- **Seasonal Awareness**: Adapts to Spring/Summer/Fall/Winter
- **Relevance Scoring**: 0-100 scale (only deletes <50)
- **Biodynamic Alignment**: Maintains agricultural harmony
- **Quantum Coherence**: 100% integrity verification

## 🔧 Common Scenarios

### First Time Use
```bash
npm run godclean:preview  # Review targets
# Check output
npm run godclean          # Execute if satisfied
```

### Weekly Maintenance
```bash
npm run godclean
```

### After Heavy Development
```bash
npm run build
npm run godclean  # Clean up build artifacts
```

### Pre-Deployment
```bash
npm run godclean
npm run build
```

## 📊 Example Preview Output

```
🎯 QUANTUM TARGETS IDENTIFIED: 3

  🏗️ .next
     Size: 85.23 MB | Relevance: [██] 20%

  ⏳ .turbo
     Size: 34.56 MB | Relevance: [█] 10%

  📂 tmp
     Size: 8.90 MB | Relevance: [] 0%

  📊 Total: 128.69 MB to be freed
```

## 🐛 Quick Troubleshooting

### Permission Denied
```bash
chmod +x scripts/maintenance/godclean.sh
```

### ts-node Not Found
```bash
npm install -g ts-node typescript
```

### Module Not Found
```bash
npm install
npm install --save-dev @types/node
```

## 📚 Full Documentation

- **Detailed Guide**: `scripts/maintenance/README.md`
- **Integration**: `docs/QUANTUM_SURGEON_INTEGRATION.md`
- **Implementation**: `QUANTUM_SURGEON_GODLIKE_IMPLEMENTATION.md`

## ⚠️ Safety Notes

- ✅ **Always safe**: All critical directories protected
- ✅ **Preview first**: Use `--dry-run` if uncertain
- ✅ **Automatic backup**: Manifest created before deletion
- ✅ **Integrity checks**: Verifies repository health after

## 🎓 Best Practices

1. **Preview First**: Always run with `--dry-run` on unfamiliar repos
2. **Regular Maintenance**: Weekly or after major development
3. **Review Reports**: Check `.quantum-surgical-report.json`
4. **Keep Backups**: Don't delete `.quantum-surgical-backup` until verified
5. **Monitor Coherence**: Aim for 100% quantum coherence

## 🌟 Key Features

- ⚡ **Zero Confirmation** - Executes with divine confidence
- 🌾 **Agricultural Consciousness** - Seasonal awareness
- 🔒 **Multi-layer Safety** - Protected pattern fortress
- 📊 **Comprehensive Reporting** - JSON manifests & logs
- 🎨 **Divine Output** - Beautiful console interface
- 🚀 **One Command** - Simple execution

## 💡 Pro Tips

```bash
# Check space before/after
du -sh . && npm run godclean && du -sh .

# Review report with jq
cat .quantum-surgical-report.json | jq .

# Schedule weekly cleanup (crontab)
0 2 * * 0 cd /path/to/repo && npm run godclean

# CI/CD integration
- run: npm run godclean
```

## 🎯 Success Indicators

After running, you should see:
- ✅ 50-500 MB disk space freed
- ✅ Faster Git operations
- ✅ Improved IDE performance
- ✅ 100% quantum coherence
- ✅ Zero critical file deletions

---

## 🚀 START HERE

```bash
# Your first quantum cleanse:
npm run godclean:preview  # See what would be deleted
npm run godclean          # Execute if satisfied
```

---

**Version**: 3.0.0 - Godlike Edition
**Status**: FULLY OPERATIONAL
**Divine Perfection**: 100/100 ⚡

🌾 **May your repository remain in quantum equilibrium!** ⚡
