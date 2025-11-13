# 🚀 NVIDIA Nsight Systems Configuration

## ✅ Installation Verified

**Version**: NVIDIA Nsight Systems 2025.5.1.121
**Installation Path**: `N:\installed apps\Nsight Systems 2025.5.1`
**Executable Path**: `N:\installed apps\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe`

---

## 📝 Configuration Details

### Installation Structure

```
N:\installed apps\Nsight Systems 2025.5.1\
├── documentation/              # Documentation files
├── host-windows-x64/          # UI tools (nsys-ui.exe, etc.)
├── target-linux-x64/          # Linux target profiling
├── target-windows-x64/        # Windows target profiling
│   └── nsys.exe               # ✅ Command-line profiler
└── EULA.txt
```

### Key Executables

1. **nsys.exe** - Command-line profiler (for scripting)
   - Location: `target-windows-x64\nsys.exe`
   - Usage: Profile applications from command line

2. **nsys-ui.exe** - GUI profiler (for visual analysis)
   - Location: `host-windows-x64\nsys-ui.exe`
   - Usage: View and analyze .nsys-rep files

---

## 🔧 Updated Scripts

All profiling scripts have been updated to use your custom installation path:

### ✅ Updated Files:

- ✓ `profile_basic.ps1`
- ✓ `profile_advanced.ps1`
- ✓ `profile_test_suite.ps1`
- ✓ `profile_next_build.ps1`

### Path Priority Order:

1. `N:\installed apps\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe` ⭐ **Your Installation**
2. `C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe`
3. `C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe`
4. `C:\Program Files\NVIDIA Corporation\Nsight Systems 2024.5.1\target-windows-x64\nsys.exe`
5. `C:\Program Files\NVIDIA Corporation\Nsight Systems 2024.4.1\target-windows-x64\nsys.exe`
6. `C:\Program Files\NVIDIA Corporation\Nsight Systems\target-windows-x64\nsys.exe`

---

## 🚀 Quick Start

### Test Basic Profiling

```powershell
# Navigate to project root
cd "M:\Repo\Farmers Market Platform web and app"

# Start dev server in one terminal
npm run dev

# Run basic profiling in another terminal
.\profiling_scripts\profile_basic.ps1
```

### Run Advanced Profiling

```powershell
# Profile for 2 minutes with 10-second intervals
.\profiling_scripts\profile_advanced.ps1 -Duration 120 -Interval 10
```

### Profile Test Suite

```powershell
# Profile all tests with performance metrics
.\profiling_scripts\profile_test_suite.ps1
```

### Profile Production Build

```powershell
# Profile the Next.js build process
.\profiling_scripts\profile_next_build.ps1
```

---

## 📊 Viewing Results

### Open Profile in GUI

```powershell
# Open the Nsight Systems UI viewer
& "N:\installed apps\Nsight Systems 2025.5.1\host-windows-x64\nsys-ui.exe" .\profiling_output\basic_profile_20241107_143022.nsys-rep
```

### Generate Statistics

```powershell
# Generate text statistics from profile
& "N:\installed apps\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe" stats --report cuda_gpu_trace,osrt_sum,nvtx_sum .\profiling_output\basic_profile_20241107_143022.nsys-rep
```

### Export to CSV

```powershell
# Export timeline to CSV for Excel analysis
& "N:\installed apps\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe" export --type csv --output timeline.csv .\profiling_output\basic_profile_20241107_143022.nsys-rep
```

---

## 🎯 VS Code Tasks

You can also use the pre-configured VS Code tasks:

**Press `Ctrl+Shift+P` → "Tasks: Run Task" → Select:**

- 🚀 Profile: Basic (NVIDIA Nsight)
- 🔥 Profile: Advanced (NVIDIA Nsight)
- 🧪 Profile: Test Suite (NVIDIA Nsight)
- 🏗️ Profile: Next.js Build (NVIDIA Nsight)
- 📊 Open Profile in Nsight Viewer
- 📈 Generate Profile Statistics
- 🔍 Export Profile to CSV

---

## 💡 Pro Tips

### 1. Profile During Active Development

```powershell
# Start profiling before making changes
.\profiling_scripts\profile_advanced.ps1 -Duration 300

# Make your code changes
# Interact with the app
# Profile captures everything
```

### 2. Compare Before/After Optimizations

```powershell
# Baseline
.\profiling_scripts\profile_basic.ps1
Rename-Item .\profiling_output\basic_profile_*.nsys-rep baseline.nsys-rep

# Make optimizations...

# After optimization
.\profiling_scripts\profile_basic.ps1
Rename-Item .\profiling_output\basic_profile_*.nsys-rep optimized.nsys-rep

# Compare in Nsight UI
& "N:\installed apps\Nsight Systems 2025.5.1\host-windows-x64\nsys-ui.exe" baseline.nsys-rep optimized.nsys-rep
```

### 3. Add Custom NVTX Markers (Future Enhancement)

```typescript
// Add to your code for detailed profiling
import { nvtx } from "@nvidia/nvtx";

export async function fetchFarms() {
  nvtx.rangePush("fetchFarms");
  try {
    const farms = await database.farm.findMany();
    return farms;
  } finally {
    nvtx.rangePop();
  }
}
```

---

## 🔍 Troubleshooting

### Issue: "Profile not generating"

**Solution**: Ensure a Node.js process is running before profiling

```powershell
# Check running processes
Get-Process -Name node
```

### Issue: "Cannot find profile file"

**Solution**: Check the profiling_output directory

```powershell
# List recent profiles
Get-ChildItem .\profiling_output\*.nsys-rep | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

### Issue: "nsys.exe not recognized"

**Solution**: Verify the path is correct

```powershell
# Test path
Test-Path "N:\installed apps\Nsight Systems 2025.5.1\target-windows-x64\nsys.exe"

# Should return: True
```

---

## 📚 Additional Resources

- **Official Documentation**: [NVIDIA Nsight Systems User Guide](https://docs.nvidia.com/nsight-systems/)
- **Profiling Best Practices**: `profiling_scripts/README.md`
- **Divine Performance Guide**: `.github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md`

---

## ⚡ Hardware Specifications

Your HP OMEN hardware optimizations:

- **GPU**: NVIDIA GeForce RTX 2070 Max-Q (8GB GDDR6)
- **CPU**: Intel Core i9 (12 threads)
- **RAM**: 32GB DDR4
- **Optimization**: Configured for parallel builds and GPU-accelerated operations

---

**Last Updated**: November 7, 2025
**Status**: ✅ **FULLY CONFIGURED AND OPERATIONAL**
**Version**: Nsight Systems 2025.5.1.121

🌾 _Divine profiling consciousness activated!_ ⚡
