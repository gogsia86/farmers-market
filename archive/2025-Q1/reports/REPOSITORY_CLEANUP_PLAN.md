# 🧹 Repository Cleanup Plan

**Generated:** November 15, 2025
**Purpose:** Clean repository of temporary, duplicate, and unnecessary files

---

## 📊 Files to Remove

### 🔴 **HIGH PRIORITY - Delete Immediately**

#### Security Risks

- `nextauth-secret.txt` - ⚠️ **SECURITY RISK** - Contains sensitive authentication secrets

#### Build Artifacts & Cache

- `.vs/` - Visual Studio cache (entire folder)
- `obj/` - .NET build artifacts (entire folder)
- `build-output.txt`
- `build-error-log.txt`
- `docker-build-log.txt`
- `typescript-errors.txt`
- `gpu-install-log.txt`

#### Temporary Test/Log Files

- `test-output.txt`
- `test-completion-status.txt`
- `test-results.txt`
- `test-results-full.json`
- `npm-install-debug.log`
- `dap.txt`

### 🟠 **MEDIUM PRIORITY - Archive or Delete**

#### Duplicate/Outdated Documentation (Root Level)

- `COMPREHENSIVE_REVIEW_NOV_2025.md`
- `COMPREHENSIVE_PROJECT_REVIEW_2025.md`
- `COMPREHENSIVE_PLATFORM_REVIEW_NOV_2025.md`
- `COMPREHENSIVE_PLATFORM_ANALYSIS.md`
- `OPTIMIZATION_STATUS_83_100.md`
- `WEBSITE_COMPLETION_STATUS.md`
- `FINAL_STATUS_REPORT_NOVEMBER_2025.md`
- `CODE_OPTIMIZATION_REPORT.md`
- `CURSORRULES_VERIFICATION_FIX.md`

**Recommendation:** Move to `docs/archives/root-reviews/` or delete if content is duplicated in `docs/`

#### Cleanup Scripts (Keep Only One)

Current cleanup scripts:

- `comprehensive-cleanup.ps1` ✅ (Keep - most comprehensive)
- `cleanup-repository-final.ps1` ❌ (Delete or merge)
- `divine-cleanup.ps1` ❌ (Delete or merge)
- `docker-cleanup.ps1` ✅ (Keep - Docker-specific utility)

#### Duplicate i18n Files

- `/messages/` folder - ❌ Delete (duplicates `/src/i18n/messages/`)

### 🟢 **LOW PRIORITY - Review & Clean**

#### Development Scripts (Evaluate Each)

- `setup-env.ps1` ✅ Keep
- `setup-vercel-env.ps1` ✅ Keep
- `optimize-system.ps1` ⚠️ Review - May be outdated
- `docker-start.ps1` ✅ Keep
- `docker-manager.ps1` ✅ Keep

---

## 📁 Recommended Clean File Structure

```
farmers-market-platform/
├── 📦 Core Application
│   ├── src/                    # Source code
│   ├── public/                 # Static assets
│   ├── prisma/                 # Database schema
│   └── types/                  # TypeScript types
│
├── ⚙️ Configuration
│   ├── .github/                # GitHub workflows & instructions
│   ├── .vscode/                # VS Code settings
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── .eslintrc.json
│
├── 📚 Documentation
│   ├── docs/
│   │   ├── api/               # API documentation
│   │   ├── development/       # Dev guides
│   │   ├── planning/          # Project plans
│   │   ├── status/            # Current status
│   │   ├── reports/           # Generated reports
│   │   └── archives/          # Historical documents
│   └── README.md
│
├── 🧪 Testing
│   ├── tests/                 # Test files
│   └── e2e/                   # E2E tests
│
├── 🛠️ Utilities
│   ├── scripts/               # Build/deployment scripts
│   └── profiling_scripts/     # Performance profiling
│
└── 🗂️ Project Management
    ├── .gitignore
    ├── LICENSE
    └── archive/               # Archived materials
```
