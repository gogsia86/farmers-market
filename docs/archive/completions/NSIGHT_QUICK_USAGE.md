# 🚀 NVIDIA Nsight Systems - Quick Start Guide

## ✅ Setup Complete
NVIDIA Nsight Systems 2025.3.2 is installed and ready to use.

---

## 📊 Profile Your Application (5 Profiling Modes)

### 1. Quick 15-Second Profile

```powershell
.\Start-OptimizedProfiling.ps1 -Profile quick
```

Fast diagnostic profile of your dev server (15 seconds).

### 2. Development Server Profile

```powershell
.\Start-OptimizedProfiling.ps1 -Profile dev -Duration 60
```

Profile your Next.js dev server for custom duration (default 30s).

### 3. Test Suite Profile (2,000 Tests!)

```powershell
.\Start-OptimizedProfiling.ps1 -Profile test
```

Profile the entire Jest test suite (all 2,000 tests).

### 4. Build Process Profile

```powershell
.\Start-OptimizedProfiling.ps1 -Profile build
```

Profile the Next.js production build process.

### 5. Full GPU+CPU Profile

```powershell
.\Start-OptimizedProfiling.ps1 -Profile full -Duration 60
```

Complete profiling with all traces (CUDA, NVTX, OpenGL, Vulkan).

---

## 🖥️ View Profiling Results

### Auto-open viewer after profiling

```powershell
.\Start-OptimizedProfiling.ps1 -Profile test -OpenViewer
```

### Manually open a profile

```powershell
nsys-ui ".\profiling_output\farmers_market_test_20251017_153050.nsys-rep"
```

---

## ⚡ Administrative Privileges

**For full CPU sampling**, run PowerShell as Administrator:

1. Right-click PowerShell
2. Select "Run as Administrator"
3. Navigate to project: `cd V:\Projects\Farmers-Market`
4. Run profiling: `.\Start-OptimizedProfiling.ps1 -Profile test`

**Without admin**: Still works! Just disables CPU sampling (API traces still captured).

---

## 📁 Output Location

All profiling reports are saved to:

```
V:\Projects\Farmers-Market\profiling_output\
```

Files generated:

- `.nsys-rep` - Main profile (open with nsys-ui)
- `.txt` - Statistics summary

---

## 🎯 What to Analyze

### In the Nsight Systems Viewer:

1. **Timeline View**

   - See all events over time
   - Identify long-running operations
   - Find CPU bottlenecks

2. **Functions View**

   - Hottest functions (most time spent)
   - Call stacks
   - Optimization targets

3. **Statistics**

   - API call counts
   - Memory allocations
   - I/O operations

4. **GPU Activity** (if available)
   - CUDA kernel execution
   - GPU memory transfers
   - Concurrent execution

---

## 💡 Common Use Cases

### Optimize Test Performance

```powershell
# Profile tests
.\Start-OptimizedProfiling.ps1 -Profile test

# Find slowest test files
# Optimize those files
# Re-profile to measure improvement
```

### Improve Dev Server Speed

```powershell
# Profile dev server
.\Start-OptimizedProfiling.ps1 -Profile dev -Duration 30

# Analyze HMR (Hot Module Replacement)
# Check initial load time
# Identify blocking operations
```

### Reduce Build Time

```powershell
# Profile build
.\Start-OptimizedProfiling.ps1 -Profile build

# Find slow compilation steps
# Optimize webpack/turbopack config
# Reduce bundle size
```

---

## 🔍 Troubleshooting

### "nsys: command not found"

- Restart your terminal (PATH was updated)
- Or use full path: `&"C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe"`

### Profile file not created

- Check console output for errors
- Ensure npm packages installed: `cd farmers-market && npm install`
- Check disk space available

### Warnings about admin privileges

- Normal behavior without admin rights
- Profile still captures timeline and API traces
- For CPU sampling, run PowerShell as Administrator

---

## 📚 More Documentation

- **Full Guide**: `.vscode/NVIDIA_PROFILING_GUIDE.md`
- **Achievement Report**: `NONUPLE_PERFECT_AND_NSIGHT_OPTIMIZATION.md`
- **Setup Details**: `NVIDIA_NSIGHT_SETUP_COMPLETE.md`

---

## 🌟 Quick Command Reference

```powershell
# Check version
nsys --version

# List recent profiles
Get-ChildItem .\profiling_output -Filter "*.nsys-rep" | Sort-Object LastWriteTime -Descending | Select-Object -First 5

# Open most recent profile
$latest = Get-ChildItem .\profiling_output -Filter "*.nsys-rep" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
nsys-ui $latest.FullName

# Profile with custom nsys command
cd farmers-market
nsys profile --trace=nvtx --sample=cpu --output=custom npm run dev
```

---

**Ready to optimize!** 🚀

Start with: `.\Start-OptimizedProfiling.ps1 -Profile quick`
