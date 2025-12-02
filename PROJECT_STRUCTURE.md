# 📁 Project Structure - Farmers Market Platform

**Last Updated:** December 1, 2024  
**Status:** ✅ Clean & Organized  
**Total Root Files:** 35 (down from 50+)  
**Documentation:** 10 MD files (down from 37)

---

## 🌳 Root Directory Structure

```
Farmers Market Platform/
│
├── 📚 DOCUMENTATION (Essential - 10 files)
│   ├── README.md                          # Main project documentation
│   ├── BUILD_SUCCESS.md                   # Latest build status
│   ├── TYPESCRIPT_FIXES_SUMMARY.md        # Recent TypeScript fixes
│   ├── QUICK_REFERENCE.md                 # Command reference guide
│   ├── CURRENT_STATUS_AND_NEXT_STEPS.md   # Current project status
│   ├── CLEANUP_COMPLETE.md                # Cleanup summary
│   ├── 100_PERCENT_PRODUCTION_READY.md    # Production readiness doc
│   ├── 100_PERCENT_ACHIEVEMENT_PLAN.md    # Achievement plan
│   ├── FEATURE_MATRIX.md                  # Feature overview
│   └── IMPLEMENTATION_ROADMAP.md          # Development roadmap
│
├── ⚙️  CONFIGURATION (Core)
│   ├── package.json                       # Dependencies & scripts
│   ├── package-lock.json                  # Locked dependencies
│   ├── tsconfig.json                      # TypeScript config
│   ├── next.config.mjs                    # Next.js config
│   ├── eslint.config.mjs                  # ESLint config
│   ├── tailwind.config.ts                 # Tailwind CSS config
│   ├── postcss.config.mjs                 # PostCSS config
│   ├── jest.config.js                     # Jest test config
│   ├── jest.setup.js                      # Jest setup
│   ├── playwright.config.ts               # Playwright E2E config
│   ├── prisma.config.ts                   # Prisma config
│   ├── vercel.json                        # Vercel deployment config
│   ├── ecosystem.config.js                # PM2 process manager config
│   └── .gitignore                         # Git ignore rules
│
├── 🔐 ENVIRONMENT & SECURITY
│   ├── .env.local                         # Local environment variables
│   ├── .env.production                    # Production environment
│   ├── .env                               # Shared environment
│   ├── sentry.client.config.ts            # Sentry client config
│   ├── sentry.edge.config.ts              # Sentry edge config
│   └── sentry.server.config.ts            # Sentry server config
│
├── 🛠️  UTILITIES (Root Level)
│   ├── create-admin.ts                    # Create admin user utility
│   ├── instrumentation.ts                 # OpenTelemetry instrumentation
│   ├── cleanup-project.sh                 # Project cleanup script
│   └── next-env.d.ts                      # Next.js TypeScript definitions
│
├── 📦 SOURCE CODE
│   ├── src/                               # Application source code
│   │   ├── app/                           # Next.js 13+ App Router
│   │   ├── components/                    # React components
│   │   ├── lib/                           # Utilities & libraries
│   │   ├── types/                         # TypeScript types
│   │   ├── styles/                        # Global styles
│   │   └── middleware.ts                  # Next.js middleware
│   │
│   ├── public/                            # Static assets
│   │   ├── images/                        # Image assets
│   │   ├── icons/                         # Icon assets
│   │   └── fonts/                         # Font files
│   │
│   ├── prisma/                            # Database
│   │   ├── schema.prisma                  # Database schema
│   │   ├── migrations/                    # Database migrations
│   │   └── seed*.ts                       # Database seed files
│   │
│   ├── scripts/                           # Utility scripts (organized)
│   │   ├── database/                      # Database scripts
│   │   ├── deployment/                    # Deployment scripts
│   │   ├── dev/                           # Development scripts
│   │   ├── docker/                        # Docker scripts
│   │   ├── environment/                   # Environment setup
│   │   ├── maintenance/                   # Maintenance scripts
│   │   ├── monitoring/                    # Monitoring scripts
│   │   ├── testing/                       # Testing scripts
│   │   └── utils/                         # Utility scripts
│   │
│   └── tests/                             # Test suites
│       ├── e2e/                           # End-to-end tests
│       ├── integration/                   # Integration tests
│       └── unit/                          # Unit tests
│
├── 📖 DOCUMENTATION (Archived)
│   └── docs/
│       ├── archive/                       # Historical documentation
│       │   ├── README.md                  # Archive index
│       │   ├── status-reports/            # Old status reports
│       │   ├── cleanup-phases/            # Cleanup documentation
│       │   ├── reviews/                   # Platform reviews
│       │   └── guides/                    # Old guides (27 files)
│       │
│       └── [future organized docs]
│
├── 🐳 DEPLOYMENT & INFRASTRUCTURE
│   ├── docker/                            # Docker configurations
│   ├── docker-scripts/                    # Docker utility scripts
│   ├── deployment/                        # Deployment configs
│   └── nginx/                             # Nginx configurations
│
├── 🔧 DEVELOPMENT TOOLS
│   ├── .github/                           # GitHub workflows & configs
│   ├── .husky/                            # Git hooks
│   ├── .vscode/                           # VSCode settings
│   ├── .vs/                               # Visual Studio settings
│   └── __mocks__/                         # Jest mocks
│
├── 🗄️  DATA & REPORTS
│   ├── database/                          # Database related files
│   └── monitoring-reports/                # Monitoring data (136 KB)
│
└── 🧹 BUILD ARTIFACTS (Generated - Not in Git)
    ├── .next/                             # Next.js build output
    ├── .jest-cache/                       # Jest cache
    ├── coverage/                          # Test coverage
    ├── dist/                              # Distribution build
    ├── playwright-report/                 # E2E test reports
    ├── node_modules/                      # Dependencies
    └── cleanup-backup-*/                  # Cleanup backups (temporary)
```

---

## 📊 Statistics

### File Counts
- **Root MD Files:** 10 (essential documentation)
- **Archived Docs:** 32 (in docs/archive/)
- **Source Files:** 200+ TypeScript/TSX files
- **Test Files:** 50+ test suites
- **Config Files:** 15+ configuration files

### Directory Sizes
- **src/:** ~5 MB (application code)
- **node_modules/:** ~1.2 GB (dependencies)
- **public/:** ~2 MB (static assets)
- **prisma/:** ~500 KB (database & migrations)
- **Build artifacts:** ~216 MB (when built, not in git)

---

## 🎯 Key Directories Explained

### `/src/app/` - Next.js App Router
```
app/
├── (admin)/              # Admin routes
├── (farmer)/             # Farmer routes
├── (monitoring)/         # Monitoring dashboard
├── api/                  # API routes
├── page.tsx              # Home page
├── layout.tsx            # Root layout
└── [other pages]/        # Public pages
```

### `/src/components/` - React Components
```
components/
├── ui/                   # Reusable UI components
├── forms/                # Form components
├── layouts/              # Layout components
├── maps/                 # Map components
├── charts/               # Chart components
└── [feature]/            # Feature-specific components
```

### `/src/lib/` - Libraries & Utilities
```
lib/
├── ai/                   # AI/ML utilities (OpenAI, Ollama)
├── monitoring/           # Monitoring & telemetry
├── validation/           # Data validation
├── utils/                # Utility functions
├── hooks/                # React hooks
└── auth/                 # Authentication utilities
```

### `/scripts/` - Organized Utility Scripts
```
scripts/
├── database/             # DB operations & seeding
├── deployment/           # Deployment automation
├── dev/                  # Development helpers
├── monitoring/           # Monitoring scripts
└── testing/              # Test utilities
```

---

## 🚀 Quick Navigation

### For Developers
- **Start Here:** `README.md`
- **Quick Commands:** `QUICK_REFERENCE.md`
- **Build Status:** `BUILD_SUCCESS.md`
- **Current Work:** `CURRENT_STATUS_AND_NEXT_STEPS.md`

### For New Contributors
1. Read `README.md`
2. Check `QUICK_REFERENCE.md` for commands
3. Review `FEATURE_MATRIX.md` for features
4. See `IMPLEMENTATION_ROADMAP.md` for plans

### For Historical Reference
- **Archived Docs:** `docs/archive/README.md`
- **Old Status Reports:** `docs/archive/status-reports/`
- **Cleanup History:** `docs/archive/cleanup-phases/`

---

## 🧹 Cleanup Status

### Removed (Safe)
- ✅ Build artifacts (~216 MB)
- ✅ Temporary files (10 files)
- ✅ Duplicate scripts (3 files)
- ✅ Old documentation (27 files → archived)

### Kept (Essential)
- ✅ All source code
- ✅ All configuration
- ✅ Current documentation
- ✅ Organized scripts
- ✅ Database schema

---

## 📝 Documentation Organization

### Root Level (Current & Essential)
```
✅ README.md                    # Main docs (START HERE)
✅ QUICK_REFERENCE.md           # Command cheat sheet
✅ BUILD_SUCCESS.md             # Latest build info
✅ CURRENT_STATUS_AND_NEXT_STEPS.md  # Current status
✅ TYPESCRIPT_FIXES_SUMMARY.md  # Recent fixes
```

### Archived (Historical Reference)
```
📦 docs/archive/
   ├── 27 historical documents
   ├── Organized by category
   └── README.md explains structure
```

---

## 🔒 What's NOT in Git

### Build Artifacts (Generated)
```
.next/                    # Next.js build (176 MB)
.jest-cache/              # Jest cache (7.1 MB)
coverage/                 # Test coverage (28 MB)
dist/                     # Distribution (4.8 MB)
playwright-report/        # E2E reports (504 KB)
node_modules/             # Dependencies (1.2 GB)
```

### Environment Files (Sensitive)
```
.env.local               # Local secrets
.env.production          # Production secrets
```

### Temporary Files
```
cleanup-backup-*/        # Cleanup backups (delete after verification)
monitoring-reports/*/    # Old monitoring data
```

---

## 🎯 Project Health

- ✅ **TypeScript:** 0 errors
- ✅ **Build:** Successful
- ✅ **Tests:** Passing
- ✅ **Documentation:** Organized
- ✅ **Dependencies:** Up to date
- ✅ **Security:** Configured
- ✅ **Performance:** Optimized

---

## 📞 Need Help?

- **Commands:** See `QUICK_REFERENCE.md`
- **Build Issues:** See `BUILD_SUCCESS.md`
- **Features:** See `FEATURE_MATRIX.md`
- **Roadmap:** See `IMPLEMENTATION_ROADMAP.md`
- **Archive:** See `docs/archive/README.md`

---

**Last Cleanup:** December 1, 2024  
**Next Review:** As needed  
**Maintained By:** Development Team  
**Status:** ✅ Production Ready