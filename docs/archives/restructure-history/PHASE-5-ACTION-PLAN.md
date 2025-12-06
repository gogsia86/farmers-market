# Phase 5 Action Plan: Docker Organization

# Repository Restructure Project - Farmers Market Platform

**Phase**: 5 of 6  
**Created**: November 27, 2024  
**Status**: 🚀 READY TO EXECUTE  
**Estimated Duration**: ~35 minutes  
**Priority**: High

---

## 🎯 Phase 5 Objectives

Consolidate and organize all Docker-related files (Dockerfiles, Docker Compose configurations, and Docker documentation) into a unified `docker/` directory structure with clear separation between development and production environments.

### Success Criteria

- ✅ Create organized `docker/` directory structure
- ✅ Consolidate all Dockerfiles into `docker/dockerfiles/`
- ✅ Consolidate all Docker Compose files into `docker/compose/`
- ✅ Organize Docker documentation (move from `docs/docker/`)
- ✅ Update all references in documentation and CI/CD
- ✅ Clean root directory of Docker files
- ✅ Preserve Git history for all moves
- ✅ Create master Docker README
- ✅ Verify Docker builds still work

---

## 📊 Current State Analysis

### Docker Files Found in Repository

#### Root Directory (5 files)

```
./Dockerfile                    # Main production Dockerfile
./Dockerfile.dev                # Development Dockerfile
./Dockerfile.simple             # Simplified Dockerfile variant
./docker-compose.yml            # Main compose file (production)
./docker-compose.dev.yml        # Development compose file
```

#### Documentation (15 files in docs/docker/)

```
docs/docker/
├── DOCKER_COMPLETE_GUIDE.md
├── DOCKER_DEPLOYMENT_GUIDE.md
├── DOCKER_DEPLOYMENT_STATUS.md
├── DOCKER_GUIDE.md
├── DOCKER_PUSH_GUIDE.md
├── DOCKER_QUICK_START.md
├── DOCKER_SETUP_NOW.md
├── DOCKER_UPDATE_SUMMARY.md
├── DOCKER-COMPLETE-SETUP.md
├── DOCKER-DESKTOP-PUSH.md
├── DOCKER-GUIDE.md
├── DOCKER-PUSH-GUIDE.md
└── DOCKER-SUCCESS-SUMMARY.md
```

#### Scripts (Already organized in Phase 4)

```
scripts/docker/              # Docker utility scripts (organized)
scripts/deployment/          # Deployment scripts including Docker
```

#### Old/Archive Directories

```
docker-scripts/              # Only README remains (consolidated in Phase 4)
docs/archives/docker-old/    # Archived Docker documentation
docs/archives/duplicates/docker/  # Duplicate Docker files
```

### Problems with Current State

1. ❌ **Scattered Dockerfiles** - 3 Dockerfiles in root directory
2. ❌ **Compose files in root** - 2 compose files cluttering root
3. ❌ **Documentation overload** - 15 Docker docs with duplicates/overlaps
4. ❌ **Unclear separation** - Dev vs production configs not clearly separated
5. ❌ **Root directory clutter** - Docker files mixing with project essentials
6. ❌ **No unified structure** - Docker assets spread across multiple locations

---

## 🏗️ Proposed Structure

### Target Directory Layout

```
docker/
├── README.md                           # Master Docker documentation
├── .dockerignore                       # Docker ignore file (if exists)
│
├── dockerfiles/                        # All Dockerfiles
│   ├── Dockerfile                      # Production (optimized)
│   ├── Dockerfile.dev                  # Development (hot-reload)
│   └── Dockerfile.simple               # Simple variant (legacy/reference)
│
├── compose/                            # Docker Compose configurations
│   ├── docker-compose.yml              # Production compose
│   ├── docker-compose.dev.yml          # Development compose
│   ├── docker-compose.test.yml         # Testing compose (if exists)
│   └── docker-compose.override.example.yml  # Local overrides template
│
└── docs/                               # Docker-specific documentation
    ├── SETUP-GUIDE.md                  # Consolidated setup guide
    ├── DEPLOYMENT-GUIDE.md             # Deployment instructions
    ├── TROUBLESHOOTING.md              # Common issues and solutions
    └── REFERENCE.md                    # Technical reference

docs/deployment/                        # Keep deployment docs here
└── DOCKER-COMPLETE-GUIDE.md           # Main deployment reference (updated)

scripts/docker/                         # Keep scripts here (Phase 4)
scripts/deployment/                     # Keep deployment scripts here (Phase 4)
```

### Root Directory (Clean)

```
# After Phase 5, root should have:
- package.json
- tsconfig.json
- next.config.js
- .env.example
- README.md
- etc. (essentials only)

# NO Docker files in root!
```

---

## 📋 Execution Plan

### Step 1: Create Docker Directory Structure (2 minutes)

```bash
# Create main docker directory and subdirectories
mkdir -p docker/dockerfiles
mkdir -p docker/compose
mkdir -p docker/docs
```

### Step 2: Move Dockerfiles (5 minutes)

```bash
# Move all Dockerfiles to docker/dockerfiles/
git mv Dockerfile docker/dockerfiles/Dockerfile
git mv Dockerfile.dev docker/dockerfiles/Dockerfile.dev
git mv Dockerfile.simple docker/dockerfiles/Dockerfile.simple

# Move .dockerignore if exists
if [ -f .dockerignore ]; then
  git mv .dockerignore docker/.dockerignore
fi
```

**Verification**: Confirm Dockerfiles moved and Git history preserved

### Step 3: Move Docker Compose Files (5 minutes)

```bash
# Move compose files to docker/compose/
git mv docker-compose.yml docker/compose/docker-compose.yml
git mv docker-compose.dev.yml docker/compose/docker-compose.dev.yml

# Check for other compose variants
# git mv docker-compose.test.yml docker/compose/ (if exists)
# git mv docker-compose.prod.yml docker/compose/ (if exists)
```

**Verification**: Confirm compose files moved and Git history preserved

### Step 4: Consolidate Docker Documentation (8 minutes)

**Analysis Required**: Review 15 Docker docs to identify:

- Master/canonical documents
- Duplicates to archive
- Content to merge

**Proposed Consolidation**:

```
# Keep in docs/deployment/ (main deployment reference):
docs/deployment/DOCKER-COMPLETE-GUIDE.md  (keep, update paths)

# Move to docker/docs/ and consolidate:
SETUP-GUIDE.md          <- Merge: DOCKER_SETUP_NOW.md, DOCKER_QUICK_START.md, DOCKER-COMPLETE-SETUP.md
DEPLOYMENT-GUIDE.md     <- Merge: DOCKER_DEPLOYMENT_GUIDE.md, DOCKER-DESKTOP-PUSH.md, DOCKER_PUSH_GUIDE.md
TROUBLESHOOTING.md      <- New: Common issues from various docs
REFERENCE.md            <- Merge: DOCKER_GUIDE.md, DOCKER-GUIDE.md

# Archive duplicates to docs/archives/duplicates/docker/:
DOCKER_DEPLOYMENT_STATUS.md
DOCKER_UPDATE_SUMMARY.md
DOCKER-SUCCESS-SUMMARY.md
DOCKER-PUSH-GUIDE.md (duplicate of DOCKER_PUSH_GUIDE.md)
```

**Actions**:

1. Create consolidated docs in `docker/docs/`
2. Move unique docs to archive
3. Update `docs/deployment/DOCKER-COMPLETE-GUIDE.md` with new paths

### Step 5: Create Master Docker README (5 minutes)

Create `docker/README.md` with:

- Overview of Docker setup
- Quick start commands
- Directory structure explanation
- Links to detailed docs
- Development vs production guidance
- Common commands cheat sheet

### Step 6: Update References (7 minutes)

**Files to Update**:

1. **README.md** - Update Docker setup instructions
2. **docs/QUICK-START.md** - Update Docker quick start paths
3. **docs/deployment/DOCKER-COMPLETE-GUIDE.md** - Update all paths
4. **docs/DOCUMENTATION-INDEX.md** - Update Docker doc references
5. **package.json** - Update any Docker-related scripts
6. **.github/workflows/\*.yml** - Update CI/CD Dockerfile paths
7. **scripts/docker/\*.sh** - Update Dockerfile and compose paths
8. **scripts/deployment/\*.sh** - Update Docker paths

**Search & Replace Patterns**:

```bash
# Find all references to update:
grep -r "Dockerfile" --include="*.md" --include="*.json" --include="*.yml" --include="*.sh" . | grep -v node_modules | grep -v ".git/"
grep -r "docker-compose" --include="*.md" --include="*.json" --include="*.yml" --include="*.sh" . | grep -v node_modules | grep -v ".git/"
grep -r "\./Dockerfile" . --include="*.yml" --include="*.yaml" --include="*.sh" | grep -v node_modules
```

### Step 7: Verify Docker Functionality (3 minutes)

**Verification Tests**:

```bash
# Test 1: Docker build with new paths
cd docker/dockerfiles
docker build -f Dockerfile -t test-build ../..

# Test 2: Docker Compose validation
cd docker/compose
docker-compose -f docker-compose.yml config

# Test 3: Development Compose validation
docker-compose -f docker-compose.dev.yml config

# Test 4: Check CI/CD workflow syntax
# (GitHub validates workflow YAML on push)
```

---

## 📝 File-by-File Migration Plan

### Dockerfiles Migration

| Source                | Destination                            | Action | Priority |
| --------------------- | -------------------------------------- | ------ | -------- |
| `./Dockerfile`        | `docker/dockerfiles/Dockerfile`        | Move   | High     |
| `./Dockerfile.dev`    | `docker/dockerfiles/Dockerfile.dev`    | Move   | High     |
| `./Dockerfile.simple` | `docker/dockerfiles/Dockerfile.simple` | Move   | Medium   |
| `./.dockerignore`     | `docker/.dockerignore`                 | Move   | Medium   |

### Compose Files Migration

| Source                     | Destination                             | Action | Priority |
| -------------------------- | --------------------------------------- | ------ | -------- |
| `./docker-compose.yml`     | `docker/compose/docker-compose.yml`     | Move   | High     |
| `./docker-compose.dev.yml` | `docker/compose/docker-compose.dev.yml` | Move   | High     |

### Documentation Consolidation

| Current File                  | Action        | New Location/Archive                       |
| ----------------------------- | ------------- | ------------------------------------------ |
| `DOCKER_COMPLETE_GUIDE.md`    | Keep & Update | `docs/deployment/DOCKER-COMPLETE-GUIDE.md` |
| `DOCKER_DEPLOYMENT_GUIDE.md`  | Merge         | → `docker/docs/DEPLOYMENT-GUIDE.md`        |
| `DOCKER_SETUP_NOW.md`         | Merge         | → `docker/docs/SETUP-GUIDE.md`             |
| `DOCKER_QUICK_START.md`       | Merge         | → `docker/docs/SETUP-GUIDE.md`             |
| `DOCKER-COMPLETE-SETUP.md`    | Merge         | → `docker/docs/SETUP-GUIDE.md`             |
| `DOCKER_GUIDE.md`             | Merge         | → `docker/docs/REFERENCE.md`               |
| `DOCKER-GUIDE.md`             | Merge         | → `docker/docs/REFERENCE.md`               |
| `DOCKER_PUSH_GUIDE.md`        | Merge         | → `docker/docs/DEPLOYMENT-GUIDE.md`        |
| `DOCKER-PUSH-GUIDE.md`        | Archive       | → `docs/archives/duplicates/docker/`       |
| `DOCKER-DESKTOP-PUSH.md`      | Merge         | → `docker/docs/DEPLOYMENT-GUIDE.md`        |
| `DOCKER_DEPLOYMENT_STATUS.md` | Archive       | → `docs/archives/duplicates/docker/`       |
| `DOCKER_UPDATE_SUMMARY.md`    | Archive       | → `docs/archives/duplicates/docker/`       |
| `DOCKER-SUCCESS-SUMMARY.md`   | Archive       | → `docs/archives/duplicates/docker/`       |

---

## 🔍 Reference Updates Required

### 1. GitHub Actions Workflows

**Location**: `.github/workflows/*.yml`

**Updates Needed**:

```yaml
# Before:
dockerfile: ./Dockerfile
context: .

# After:
dockerfile: ./docker/dockerfiles/Dockerfile
context: .
```

**Files to Check**:

- `.github/workflows/deploy.yml`
- `.github/workflows/build.yml`
- `.github/workflows/docker-build.yml`
- Any other workflow files

### 2. Docker Scripts

**Location**: `scripts/docker/*.sh`, `scripts/deployment/*.sh`

**Updates Needed**:

```bash
# Before:
docker build -f Dockerfile -t ...

# After:
docker build -f docker/dockerfiles/Dockerfile -t ...
```

**Files to Check**:

- `scripts/docker/build.sh`
- `scripts/docker/run.sh`
- `scripts/deployment/deploy-docker.sh`
- Any script referencing Dockerfiles

### 3. Documentation

**Location**: `README.md`, `docs/*.md`, `docs/deployment/*.md`

**Updates Needed**:

- Update all Dockerfile paths
- Update all docker-compose paths
- Update all Docker documentation links

**Files to Check**:

- `README.md`
- `docs/QUICK-START.md`
- `docs/deployment/DOCKER-COMPLETE-GUIDE.md`
- `docs/deployment/DEPLOYMENT-COMPLETE.md`
- `docs/DOCUMENTATION-INDEX.md`

### 4. Package.json Scripts

**Location**: `package.json`

**Updates Needed**:

```json
// Before:
"docker:build": "docker build -f Dockerfile -t ..."

// After:
"docker:build": "docker build -f docker/dockerfiles/Dockerfile -t ..."
```

### 5. Docker Compose Files (Internal References)

**Location**: `docker/compose/docker-compose*.yml`

**Updates Needed**:

```yaml
# Before:
build:
  context: .
  dockerfile: Dockerfile

# After:
build:
  context: ../..
  dockerfile: docker/dockerfiles/Dockerfile
```

---

## ⚠️ Risk Assessment & Mitigation

### High Risk Items

1. **CI/CD Pipeline Breakage**
   - Risk: Dockerfile path changes break automated builds
   - Mitigation: Update all workflow files before pushing; test in feature branch
   - Verification: Manual workflow run before merge

2. **Docker Build Context Issues**
   - Risk: Moving Dockerfiles may break build context
   - Mitigation: Carefully adjust context paths in compose files and scripts
   - Verification: Test builds locally before commit

3. **Developer Workflow Disruption**
   - Risk: Team needs to update local commands
   - Mitigation: Create migration guide; update all documentation
   - Verification: Clear communication in PR

### Medium Risk Items

4. **Documentation Reference Breaks**
   - Risk: Links to Docker docs may break
   - Mitigation: Use find/replace to update all references
   - Verification: Run link checker

5. **Script Failures**
   - Risk: Docker scripts may fail with new paths
   - Mitigation: Update and test all scripts in Phase 5
   - Verification: Run script test suite

### Low Risk Items

6. **Git History Concerns**
   - Risk: File history could be lost
   - Mitigation: Use `git mv` for all moves
   - Verification: Check `git log --follow` for moved files

---

## ✅ Verification Checklist

### Pre-Execution Checklist

- [ ] Backup current state (Git commit or branch)
- [ ] Document current Docker file locations
- [ ] Identify all files referencing Docker paths
- [ ] Review Docker documentation for consolidation

### During Execution Checklist

- [ ] Create docker/ directory structure
- [ ] Move Dockerfiles (preserve Git history)
- [ ] Move Docker Compose files (preserve Git history)
- [ ] Consolidate Docker documentation
- [ ] Create master Docker README
- [ ] Update all references in code/docs/CI
- [ ] Update package.json scripts
- [ ] Update GitHub Actions workflows

### Post-Execution Verification

- [ ] Docker build test (production)
- [ ] Docker build test (development)
- [ ] Docker Compose validation (production)
- [ ] Docker Compose validation (development)
- [ ] CI/CD workflow syntax validation
- [ ] Documentation link check
- [ ] Script execution test
- [ ] Git history verification
- [ ] Root directory cleanup verification

---

## 📊 Expected Outcomes

### Before Phase 5

```
Root Directory:
├── Dockerfile
├── Dockerfile.dev
├── Dockerfile.simple
├── docker-compose.yml
├── docker-compose.dev.yml
├── (other project files)

docs/docker/
├── 15 Docker documentation files (many duplicates)
```

### After Phase 5

```
Root Directory:
├── (only project essentials - clean!)

docker/
├── README.md
├── .dockerignore
├── dockerfiles/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── Dockerfile.simple
├── compose/
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
└── docs/
    ├── SETUP-GUIDE.md
    ├── DEPLOYMENT-GUIDE.md
    ├── TROUBLESHOOTING.md
    └── REFERENCE.md

docs/deployment/
└── DOCKER-COMPLETE-GUIDE.md (updated, main reference)

docs/archives/duplicates/docker/
└── (archived duplicate Docker docs)
```

---

## 🎯 Success Metrics

| Metric                           | Target      | Measurement                |
| -------------------------------- | ----------- | -------------------------- |
| Docker files in root             | 0           | File count in root         |
| Docker directory organization    | Complete    | Structure created          |
| Documentation consolidation      | 4 core docs | File count in docker/docs/ |
| Duplicate docs archived          | 100%        | Docs in archives/          |
| Git history preserved            | 100%        | Git log --follow check     |
| CI/CD builds passing             | 100%        | Workflow run results       |
| Documentation references updated | 100%        | Grep verification          |
| Root directory cleanliness       | Clean       | Visual inspection          |

---

## 📅 Timeline & Dependencies

### Dependencies

- ✅ Phase 4 (Scripts Organization) - COMPLETE
- ✅ Phase 3 (Environment Files) - COMPLETE
- ✅ Phase 2 (Documentation) - COMPLETE

### Estimated Duration Breakdown

- Directory structure creation: 2 minutes
- Dockerfile migration: 5 minutes
- Compose file migration: 5 minutes
- Documentation consolidation: 8 minutes
- Master README creation: 5 minutes
- Reference updates: 7 minutes
- Verification testing: 3 minutes

**Total Estimated Time**: ~35 minutes

---

## 🚀 Ready to Execute

**Prerequisites Met**:

- ✅ Phase 4 (Scripts) completed
- ✅ Current state analyzed
- ✅ Target structure designed
- ✅ Migration plan documented
- ✅ Risks identified and mitigated
- ✅ Verification checklist prepared

**Next Action**: Begin Phase 5 execution following this action plan.

---

## 📝 Notes for Execution

1. **Git History**: Always use `git mv` for moves to preserve history
2. **Build Context**: Pay special attention to Docker build context paths
3. **CI/CD**: Test workflow files in feature branch before merging
4. **Documentation**: Update all references atomically to avoid confusion
5. **Verification**: Test Docker builds locally before committing
6. **Communication**: Update team on new Docker file locations

---

**Phase 5 Action Plan Status**: ✅ READY FOR EXECUTION  
**Approval**: Ready to proceed  
**Next Step**: Execute Phase 5 following this detailed plan

---

_End of Phase 5 Action Plan_
