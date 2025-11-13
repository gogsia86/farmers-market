# 🚀 NVIDIA Nsight Profiling - Quick Start

## ⚡ Divine Performance Profiling Setup

### 🎯 What You Need to Know

The Farmers Market Platform now has **4 powerful profiling scripts** optimized for your HP OMEN hardware:

1. **Basic Profiling** - Quick 30s profile of running apps
2. **Advanced Profiling** - Deep 60s analysis with metrics
3. **Test Suite Profiling** - Optimize Jest test performance
4. **Build Profiling** - Analyze Next.js build times

---

## 📋 Prerequisites Check

### Step 1: Verify NVIDIA Nsight Installation

```powershell
# Check if installed
nsys --version
```

**If not found:**

- Download: https://developer.nvidia.com/nsight-systems
- Install version 2024.5.1 or newer
- Restart VS Code after installation

### Step 2: Ensure Development Server is Running

```powershell
# Start dev server (in a separate terminal)
npm run dev
```

---

## 🎮 Usage Options

### Option A: Using VS Code Tasks (Easiest!)

1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select one of:
   - `🚀 Profile: Basic (NVIDIA Nsight)`
   - `🔥 Profile: Advanced (NVIDIA Nsight)`
   - `🧪 Profile: Test Suite (NVIDIA Nsight)`
   - `🏗️ Profile: Next.js Build (NVIDIA Nsight)`

### Option B: Run Scripts Directly

#### Basic Profiling (Recommended to Start)

```powershell
# Profile running dev server for 30 seconds
.\profiling_scripts\profile_basic.ps1

# Custom duration
.\profiling_scripts\profile_basic.ps1 -Duration 60
```

#### Advanced Profiling (Deep Analysis)

```powershell
# 60-second comprehensive profiling
.\profiling_scripts\profile_advanced.ps1

# Extended session with verbose output
.\profiling_scripts\profile_advanced.ps1 -Duration 120 -Verbose
```

#### Test Suite Profiling

```powershell
# Profile all tests
.\profiling_scripts\profile_test_suite.ps1

# Profile with coverage
.\profiling_scripts\profile_test_suite.ps1 -Coverage

# Profile specific tests
.\profiling_scripts\profile_test_suite.ps1 -TestPattern "ProductService"
```

#### Build Profiling

```powershell
# Profile production build
.\profiling_scripts\profile_next_build.ps1
```

---

## 📊 Viewing Results

### All profiles are saved to: `profiling_output/`

### Method 1: Nsight Systems UI (Best)

```powershell
# Open the latest profile
nsys-ui .\profiling_output\basic_profile_TIMESTAMP.nsys-rep
```

**What to look for:**

- Timeline view shows execution flow
- CPU usage spikes indicate bottlenecks
- Long-running functions appear as wide bars
- Thread activity shows parallelism

### Method 2: View Statistics

```powershell
# Read the statistics report
Get-Content .\profiling_output\*_stats.txt | more
```

### Method 3: Analyze Metrics (Advanced profiling only)

```powershell
# View JSON metrics
Get-Content .\profiling_output\*_metrics.json | ConvertFrom-Json | Format-List
```

---

## 🎯 Common Profiling Scenarios

### Scenario 1: "My dev server feels slow"

```powershell
# 1. Start dev server
npm run dev

# 2. Wait for it to fully start (5-10 seconds)

# 3. Run basic profiling
.\profiling_scripts\profile_basic.ps1

# 4. During the 30s profile, interact with your app:
#    - Navigate between pages
#    - Click buttons
#    - Load data

# 5. Review results
nsys-ui .\profiling_output\basic_profile_*.nsys-rep
```

### Scenario 2: "Tests are taking too long"

```powershell
# Profile test execution
.\profiling_scripts\profile_test_suite.ps1

# Look for:
# - Tests taking >1 second
# - Heavy setup/teardown
# - Slow database mocks
```

### Scenario 3: "Build times are increasing"

```powershell
# Profile the build
.\profiling_scripts\profile_next_build.ps1

# Identify:
# - Slow webpack plugins
# - Large bundle generations
# - File I/O bottlenecks
```

### Scenario 4: "Memory usage keeps growing"

```powershell
# Advanced profiling with extended duration
.\profiling_scripts\profile_advanced.ps1 -Duration 180

# Check metrics JSON for:
# - workingSetMB growing over time
# - privateMemoryMB increases
# - Potential memory leaks
```

---

## 🔍 Reading the Results

### CPU Hotspots

**What:** Functions consuming most CPU time
**Location:** Function Table in Nsight UI, sorted by "Total Time"
**Action:** Optimize these functions first

### Memory Growth

**What:** Increasing memory usage over time
**Location:** `_metrics.json` → samples array → workingSetMB
**Action:** Look for leaks or unnecessary caching

### I/O Bottlenecks

**What:** Slow file/database operations
**Location:** Timeline view → osrt (OS runtime) events
**Action:** Add caching, optimize queries

### Thread Inefficiency

**What:** Underutilized threads or blocking
**Location:** Timeline view → thread rows
**Action:** Increase parallelism or fix blocking calls

---

## 🌟 Divine Optimization Workflow

### 1. Establish Baseline

```powershell
# Profile current performance
.\profiling_scripts\profile_advanced.ps1 -Duration 60
# Save: baseline_profile_DATE.nsys-rep
```

### 2. Make Changes

- Apply optimizations from `03_PERFORMANCE_REALITY_BENDING.instructions.md`
- Implement caching strategies
- Optimize database queries
- Reduce bundle sizes

### 3. Measure Impact

```powershell
# Profile after changes
.\profiling_scripts\profile_advanced.ps1 -Duration 60
# Save: optimized_profile_DATE.nsys-rep
```

### 4. Compare

```powershell
# Open both profiles side-by-side in Nsight UI
nsys-ui .\profiling_output\baseline_*.nsys-rep
nsys-ui .\profiling_output\optimized_*.nsys-rep

# Compare metrics
$baseline = Get-Content .\profiling_output\baseline_*_metrics.json | ConvertFrom-Json
$optimized = Get-Content .\profiling_output\optimized_*_metrics.json | ConvertFrom-Json

# Calculate improvement
$avgMemBefore = ($baseline.samples | Measure-Object -Property workingSetMB -Average).Average
$avgMemAfter = ($optimized.samples | Measure-Object -Property workingSetMB -Average).Average
$improvement = [math]::Round((($avgMemBefore - $avgMemAfter) / $avgMemBefore) * 100, 2)

Write-Host "Memory improvement: $improvement%" -ForegroundColor Green
```

---

## 🛠️ Troubleshooting

### "No running process found"

**Solution:** Start your dev server first: `npm run dev`

### "NVIDIA Nsight Systems not found"

**Solution:** Install from https://developer.nvidia.com/nsight-systems
**Note:** Scripts will fall back to basic profiling without Nsight

### Profile file too large

**Solution:** Reduce `-Duration` parameter or focus on specific operations

### No GPU activity shown

**Note:** Expected! Node.js doesn't use GPU. CPU profiling is still valuable.

### Permission denied errors

**Solution:** Run PowerShell as Administrator

### Script execution disabled

**Solution:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📚 Next Steps

1. **Read full documentation:** `.\profiling_scripts\README.md`

2. **Learn divine patterns:** `.\.github\instructions\03_PERFORMANCE_REALITY_BENDING.instructions.md`

3. **Explore Nsight UI:**
   - Timeline navigation
   - Function analysis
   - Event filtering
   - Comparison views

4. **Set performance budgets:**
   - Dev startup: <5s
   - Hot reload: <1s
   - Test suite: <30s
   - Build time: <2min

5. **Track improvements:**
   - Keep historical profiles
   - Document optimizations
   - Share findings with team

---

## 🎉 Success Criteria

### You're doing it right when:

✅ Profiles show clear execution patterns
✅ Hotspots are identified and documented
✅ Optimizations show measurable improvement
✅ Regular profiling becomes part of workflow
✅ Performance regressions caught early

### Target Improvements:

- ⚡ 50% faster than baseline
- 🧠 30% lower memory usage
- 🔄 Zero memory leaks detected
- 🎯 All performance budgets met

---

## 🔗 Resources

- **Nsight Systems Docs:** https://docs.nvidia.com/nsight-systems/
- **Performance Guide:** `PERFORMANCE_OPTIMIZATION_STRATEGY.md`
- **Divine Patterns:** `.github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md`

---

**Hardware:** HP OMEN - RTX 2070 Max-Q, 32GB RAM, Intel i9 (12 threads)
**Last Updated:** November 7, 2025
**Status:** Ready for divine performance optimization! 🚀
