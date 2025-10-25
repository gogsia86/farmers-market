# ⚡ NVIDIA PROFILING QUICK START

**Get profiling results in 60 seconds!**

## 🚀 Fastest Start (Windows PowerShell)

```powershell
# Option 1: Basic profiling
.\profiling_scripts\Run-Profiling.ps1 -Mode basic

# Option 2: Advanced profiling (60s)
.\profiling_scripts\Run-Profiling.ps1 -Mode advanced

# Option 3: Custom duration (120s, 10s delay)
.\profiling_scripts\Run-Profiling.ps1 -Mode advanced -Duration 120 -Delay 10
```

## 🐧 Linux / WSL / Git Bash

```bash
# Basic profiling
bash profiling_scripts/profile_basic.sh

# Advanced profiling
bash profiling_scripts/profile_advanced.sh 60 5

# Test suite profiling
bash profiling_scripts/profile_test_suite.sh

# Build profiling
bash profiling_scripts/profile_next_build.sh
```

## 📊 View Results

```bash
# Open GUI viewer
nsys-ui profiling_output/farmers_market_advanced_*.nsys-rep

# Quick stats in terminal
nsys stats profiling_output/farmers_market_advanced_*.nsys-rep
```

## 🎯 What to Look For

### ✅ Good Performance

- GPU Utilization: **>80%**
- Memory Bandwidth: **50-80%**
- Kernel Launch Overhead: **<5%**

### ⚠️ Problems to Fix

- GPU Utilization **<50%** → CPU bottleneck
- Memory Bandwidth **>90%** → Memory bound
- Large gaps in timeline → Missing async operations

## 🔧 Installation (If Needed)

### Windows

```powershell
# Install WSL (if not already)
wsl --install

# Download Nsight Systems from NVIDIA
# <https://developer.nvidia.com/nsight-systems>
```

### Linux

```bash
# Download from NVIDIA
wget <https://developer.nvidia.com/downloads/assets/tools/secure/nsight-systems/2024_3/nsight-systems-2024.3.1_linux-public.deb>

# Install
sudo dpkg -i nsight-systems-*.deb

# Add to PATH
echo 'export PATH="/opt/nvidia/nsight-systems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 📖 Full Documentation

See `.vscode/NVIDIA_PROFILING_GUIDE.md` for complete documentation.

## 🎓 Quick Commands Reference

```bash
# List available GPU metrics
nsys profile --gpu-metrics-device=help

# Check system support
nsys status --environment

# Export to CSV
nsys export --type csv --output timeline.csv profile.nsys-rep

# Generate stats report
nsys stats --report cuda_api_sum,cuda_gpu_trace profile.nsys-rep
```

---

**🌟 Happy profiling! May your kernels be fast! 🌟**
