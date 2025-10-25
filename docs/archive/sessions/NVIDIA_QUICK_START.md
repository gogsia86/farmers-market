# NVIDIA Nsight Systems - Quick Reference

## Configured: 2025-10-17 03:00:26

## Paths Added to USER PATH:

- C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64
- C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\host-windows-x64

## Quick Commands:

### Check Installation

```powershell
nsys --version
nsys-ui --version
```

### Profile Commands

```powershell
# Basic profiling
nsys profile --trace=cuda,nvtx,osrt --output=myprofile npm run dev

# With statistics
nsys profile --trace=cuda,nvtx,osrt --stats=true --output=myprofile npm test

# Open in viewer
nsys-ui ./profiling_output/myprofile.nsys-rep
```

### Using Project Scripts

```bash
# In Git Bash or WSL
cd /v/Projects/Farmers-Market
bash profiling_scripts/profile_basic.sh
bash profiling_scripts/profile_advanced.sh
```

## Next Steps:

1. Restart terminal (or continue in this session)
2. Navigate to project: cd V:\Projects\Farmers-Market
3. Run profiling: bash profiling_scripts/profile_basic.sh
4. View results: nsys-ui ./profiling_output/\*.nsys-rep

## Documentation:

- PROFILING_QUICK_START.md
- .vscode/NVIDIA_PROFILING_GUIDE.md
- profiling_scripts/README.md
