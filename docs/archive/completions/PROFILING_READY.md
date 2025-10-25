# 🎯 NVIDIA Profiling - Quick Reference

## ✅ SETUP COMPLETE

NVIDIA Nsight Systems 2025.3.2 is configured and working!

---

## 🚀 IMMEDIATE PROFILING OPTIONS

### Option 1: Profile Build Process (Recommended First Step)

```powershell
# Profile the Next.js build
& "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe" profile `
    --trace=none `
    --sample=process-tree `
    --cpuctxsw=process-tree `
    --output=build_profile `
    --force-overwrite=true `
    --stats=true `
    npm run build
```

### Option 2: Profile Test Suite

```powershell
# Profile Jest tests
& "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe" profile `
    --trace=none `
    --sample=process-tree `
    --output=test_profile `
    --force-overwrite=true `
    --stats=true `
    npm test
```

### Option 3: Profile TypeScript Compilation

```powershell
# Profile type checking
& "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe" profile `
    --trace=none `
    --sample=process-tree `
    --output=typescript_profile `
    --force-overwrite=true `
    --stats=true `
    npx tsc --noEmit
```

### Option 4: Profile Dev Server (Time-Limited)

```powershell
# Profile dev server for 30 seconds
& "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe" profile `
    --trace=none `
    --sample=process-tree `
    --cpuctxsw=process-tree `
    --duration=30 `
    --output=dev_server_profile `
    --force-overwrite=true `
    --stats=true `
    npm run dev
```

---

## 📊 VIEW RESULTS

```powershell
# Open most recent profile
& "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\host-windows-x64\nsys-ui.exe" build_profile.nsys-rep
```

---

## 🎓 RECOMMENDED FIRST STEPS

1. **Profile the build** (quickest, most informative):

   ```powershell
   & "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe" profile --trace=none --sample=process-tree --output=build_profile --force-overwrite=true --stats=true npm run build
   ```

2. **View results**:

   ```powershell
   & "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\host-windows-x64\nsys-ui.exe" build_profile.nsys-rep
   ```

3. **Profile tests** (identify slow tests):
   ```powershell
   & "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe" profile --trace=none --sample=process-tree --output=test_profile --force-overwrite=true --stats=true npm test
   ```

---

## 💡 WHAT TO LOOK FOR

### In Build Profile

- Time spent in TypeScript compilation
- webpack/Next.js bundling time
- Module resolution patterns
- File I/O bottlenecks

### In Test Profile

- Slowest test suites
- Test setup/teardown overhead
- Database/API mocking performance
- Async operation patterns

### In TypeScript Profile

- Type checking hot spots
- Declaration file parsing
- Module resolution time

---

## 🔧 TRACE OPTIONS

For API tracing (requires administrative privileges in some cases):

```powershell
# With CUDA tracing (if you have NVIDIA GPU)
--trace=cuda,nvtx

# With NVTX markers only
--trace=nvtx

# CPU-only (no API tracing)
--trace=none
```

---

## 📁 OUTPUT FILES

All profiles saved to: `V:\Projects\Farmers-Market\`

- `.nsys-rep` - Main profile file (open with nsys-ui)
- `.sqlite` - SQLite database for analysis
- `.qdstrm` - Temporary file (can be deleted)

---

## ✅ VERIFIED WORKING

Test profile created successfully! ✓

**Next Step**: Profile your build or test suite!

```powershell
# Start with this:
& "C:\Program Files\NVIDIA Corporation\Nsight Systems 2025.3.2\target-windows-x64\nsys.exe" profile --trace=none --sample=process-tree --output=build_profile --force-overwrite=true --stats=true npm run build
```

---

Generated: October 17, 2025
Status: ✅ Ready to Profile
