# 🚀 NVIDIA Nsight Profiling Scripts

## Divine Performance Reality Bending

> **Hardware Optimized for:** HP OMEN - RTX 2070 Max-Q, 32GB RAM, Intel i9 (12 threads)

Performance profiling toolkit using NVIDIA Nsight Systems for the Farmers Market Platform.

---

## 📋 Available Profiling Scripts

### 1️⃣ Basic Profiling (`profile_basic.ps1`)

**Purpose:** Profile running development server or Node.js processes

```powershell
# Profile dev server for 30 seconds (default)
.\profiling_scripts\profile_basic.ps1

# Custom duration and process
.\profiling_scripts\profile_basic.ps1 -Duration 60 -ProcessName "node"

# Custom output directory
.\profiling_scripts\profile_basic.ps1 -OutputDir "my_profiles"
```

**What it captures:**

- CPU usage and hotspots
- Thread activity
- System calls and I/O
- Function call stacks
- Process tree

**Best for:**

- Quick performance checks
- Identifying CPU bottlenecks
- Runtime behavior analysis

---

### 2️⃣ Advanced Profiling (`profile_advanced.ps1`)

**Purpose:** Comprehensive multi-metric profiling with detailed statistics

```powershell
# Full advanced profiling (60s default)
.\profiling_scripts\profile_advanced.ps1

# Extended profiling with custom sampling
.\profiling_scripts\profile_advanced.ps1 -Duration 120 -Interval 10

# Verbose output
.\profiling_scripts\profile_advanced.ps1 -Verbose
```

**What it captures:**

- Everything from basic profiling PLUS:
- Real-time memory tracking
- Resource usage metrics (JSON)
- Multiple export formats (CSV, SQLite)
- Detailed performance statistics
- GPU activity (if applicable)

**Best for:**

- Production performance analysis
- Memory leak detection
- Long-running process monitoring
- Comparative performance studies

**Outputs:**

- `.nsys-rep` - Nsight profile (open with `nsys-ui`)
- `_metrics.json` - Time-series resource metrics
- `_stats.txt` - Comprehensive statistics
- `_timeline.csv` - Event timeline data
- `.sqlite` - Queryable database export

---

### 3️⃣ Test Suite Profiling (`profile_test_suite.ps1`)

**Purpose:** Profile Jest test execution for optimization

```powershell
# Profile all tests
.\profiling_scripts\profile_test_suite.ps1

# Profile with coverage
.\profiling_scripts\profile_test_suite.ps1 -Coverage

# Profile specific tests
.\profiling_scripts\profile_test_suite.ps1 -TestPattern "ProductService"
```

**What it captures:**

- Test execution timeline
- Setup/teardown overhead
- Mock performance
- Module import times
- Memory allocation during tests

**Best for:**

- Test suite optimization
- Identifying slow tests
- Debugging test timeouts
- CI/CD performance tuning

---

### 4️⃣ Next.js Build Profiling (`profile_next_build.ps1`)

**Purpose:** Profile production build process

```powershell
# Profile production build
.\profiling_scripts\profile_next_build.ps1

# Custom output location
.\profiling_scripts\profile_next_build.ps1 -OutputDir "build_profiles"
```

**What it captures:**

- Build pipeline execution
- Webpack/compiler performance
- File system operations
- Bundle generation time
- Optimization steps

**Best for:**

- Build time optimization
- Webpack configuration tuning
- CI/CD pipeline improvement
- Bundle size analysis

---

## 🎯 Quick Start Guide

### Prerequisites

1. **Install NVIDIA Nsight Systems**
   - Download from: https://developer.nvidia.com/nsight-systems
   - Recommended version: 2024.5.1 or newer
   - Script auto-detects installation

2. **Verify Installation**
   ```powershell
   nsys --version
   ```

### Usage Workflow

#### Step 1: Start Your Application

```powershell
# Start dev server
npm run dev

# Or run tests in watch mode (for test profiling)
npm test -- --watch
```

#### Step 2: Run Profiling

```powershell
# Choose appropriate script
.\profiling_scripts\profile_basic.ps1
```

#### Step 3: Analyze Results

```powershell
# Open in Nsight UI (best option)
nsys-ui .\profiling_output\basic_profile_20251107_120000.nsys-rep

# Or review statistics
Get-Content .\profiling_output\basic_profile_20251107_120000_stats.txt

# Or analyze metrics JSON
Get-Content .\profiling_output\advanced_profile_20251107_120000_metrics.json | ConvertFrom-Json
```

---

## 📊 Using VS Code Tasks

Profiling scripts are integrated into VS Code tasks for one-click execution:

### Available Tasks:

- `🚀 Profile: Basic (NVIDIA Nsight)` - Quick profile
- `🔥 Profile: Advanced (NVIDIA Nsight)` - Comprehensive analysis
- `🧪 Profile: Test Suite (NVIDIA Nsight)` - Test performance
- `🏗️ Profile: Next.js Build (NVIDIA Nsight)` - Build profiling

### Run via:

1. **Command Palette:** `Ctrl+Shift+P` → "Tasks: Run Task"
2. **Keyboard Shortcut:** `Ctrl+Shift+B` (if set as default)
3. **Terminal Menu:** Terminal → Run Task

---

## 🔍 Analyzing Profiles

### Nsight Systems UI

```powershell
nsys-ui .\profiling_output\your_profile.nsys-rep
```

**Key Views:**

- **Timeline:** Visual representation of execution
- **Function Table:** Sorted by duration
- **CPU Details:** Per-thread analysis
- **Events:** System calls and I/O operations

### Command-Line Analysis

```powershell
# Generate comprehensive statistics
nsys stats --report=cuda_gpu_trace,cuda_api_sum,osrt_sum,nvtx_sum `
           --format=column `
           .\profiling_output\your_profile.nsys-rep

# Export to CSV for Excel/analysis
nsys export --type=csv `
            --output=timeline.csv `
            .\profiling_output\your_profile.nsys-rep

# Export to SQLite for SQL queries
nsys export --type=sqlite `
            --output=profile.db `
            .\profiling_output\your_profile.nsys-rep
```

### Querying SQLite Export

```powershell
# Open database
sqlite3 .\profiling_output\advanced_profile_20251107_120000.sqlite

# Example queries
SELECT * FROM OSRT_STRINGS LIMIT 10;
SELECT * FROM TARGET_INFO;
```

---

## 🎯 Performance Optimization Patterns

### CPU Hotspots

Look for:

- Functions with high self-time
- Repeated operations in loops
- Blocking synchronous calls
- Heavy computation in render paths

### Memory Issues

Identify:

- Growing memory usage over time
- Large allocations
- Retained objects
- Garbage collection pressure

### I/O Bottlenecks

Check for:

- Slow file system operations
- Database query performance
- Network request latency
- Resource loading times

### Test Suite Issues

Focus on:

- Tests taking >1 second
- Setup/teardown overhead
- Mock initialization time
- Module import delays

---

## 🌟 Divine Optimization Workflow

### 1. Establish Baseline

```powershell
# Profile current state
.\profiling_scripts\profile_advanced.ps1 -Duration 60
```

### 2. Identify Bottlenecks

- Open profile in Nsight UI
- Sort functions by duration
- Look for unexpected patterns
- Check resource usage metrics

### 3. Make Optimizations

Apply divine patterns from:

- `03_PERFORMANCE_REALITY_BENDING.instructions.md`
- `04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md`

### 4. Verify Improvements

```powershell
# Profile after optimization
.\profiling_scripts\profile_advanced.ps1 -Duration 60

# Compare metrics
Compare-Object (Get-Content old_metrics.json) (Get-Content new_metrics.json)
```

### 5. Document Results

Track improvements in performance logs

---

## 📈 Interpreting Results

### Metrics JSON Structure

```json
{
  "startTime": "2025-11-07T12:00:00",
  "duration": 60,
  "interval": 5,
  "processId": 12345,
  "processName": "node",
  "samples": [
    {
      "timestamp": "2025-11-07T12:00:05",
      "iteration": 1,
      "cpu": 15.5,
      "workingSetMB": 256.3,
      "privateMemoryMB": 312.8,
      "threads": 12,
      "handles": 428
    }
  ],
  "hwSpecs": {
    "gpu": "NVIDIA GeForce RTX 2070 Max-Q",
    "cpu": "Intel Core i9",
    "ram": "32GB DDR4",
    "threads": 12
  }
}
```

### Key Metrics:

- **CPU Time:** Total processing time (lower is better)
- **Working Set:** Physical memory used
- **Private Memory:** Process-specific memory
- **Thread Count:** Parallelism level
- **Handle Count:** Open resources

---

## 🛠️ Troubleshooting

### Issue: "NVIDIA Nsight Systems not found"

**Solution:** Install from https://developer.nvidia.com/nsight-systems

### Issue: "No running process found"

**Solution:** Start your application first (`npm run dev`)

### Issue: Profile too large

**Solution:** Reduce duration or use selective tracing

### Issue: No GPU activity

**Note:** Expected for Node.js apps (CPU profiling still valuable)

### Issue: Permissions error

**Solution:** Run PowerShell as Administrator

---

## 🔗 Related Documentation

- [03_PERFORMANCE_REALITY_BENDING.instructions.md](../.github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md)
- [PERFORMANCE_OPTIMIZATION_STRATEGY.md](../PERFORMANCE_OPTIMIZATION_STRATEGY.md)
- [DIVINE_DEV_SETUP.md](../DIVINE_DEV_SETUP.md)

---

## 💡 Pro Tips

1. **Profile in realistic conditions:** Use real data, not empty databases
2. **Warm up first:** Let JIT compilation settle before profiling
3. **Multiple runs:** Average results from 3-5 profile runs
4. **Compare contexts:** Profile dev vs. production builds
5. **Track over time:** Keep historical profiles for regression detection

---

## 🎉 Success Metrics

### Target Performance Goals:

- **Dev Server Startup:** <5 seconds
- **Hot Reload:** <1 second
- **Test Suite:** <30 seconds
- **Production Build:** <2 minutes
- **API Response Time:** <100ms (P95)

### Quantum Improvement Targets:

- ⚡ 50% faster than baseline
- 🧠 30% lower memory usage
- 🔄 Zero memory leaks
- 🎯 100% test coverage maintained

---

**Divine Pattern Reference:** 03_PERFORMANCE_REALITY_BENDING.instructions.md
**Hardware:** HP OMEN - RTX 2070 Max-Q, 32GB RAM, Intel i9
**Last Updated:** November 7, 2025
