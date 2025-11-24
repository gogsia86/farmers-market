# 🌐 Next.js Dev Server Profiling with NVIDIA Nsight

**Divine Performance Analysis for Development Environment**

---

## 🚀 Quick Start

### Option 1: Automatic Mode (Recommended)

**The easiest way** - script auto-starts server, profiles it, then cleans up:

```powershell
# Just run it - everything is automatic!
.\profiling_scripts\profile_dev_server.ps1
```

````

What happens:

1. ✅ Checks if dev server is running
2. ✅ Auto-starts if needed (with HP OMEN optimizations)
3. ✅ Waits for server to initialize
4. ✅ Profiles for specified duration (default 60s)
5. ✅ Cleans up auto-started server

### Option 2: With Interactive Load Testing

Profile with automated user interactions:

```powershell
# Auto-start + simulated user load
.\profiling_scripts\profile_dev_server.ps1 -Interactive
````

### Option 3: Manual Server Control

Keep your existing server running:

```powershell
# Start server manually in one terminal
npm run dev

# In another terminal, profile without auto-start
.\profiling_scripts\profile_dev_server.ps1 -NoAutoStart
```

### Option 4: Keep Server Running After Profiling

Auto-start but don't cleanup:

```powershell
# Server stays running for additional testing
.\profiling_scripts\profile_dev_server.ps1 -KeepRunning
```

---

## 🎛️ Configuration Options

| Parameter      | Default                     | Description                               |
| -------------- | --------------------------- | ----------------------------------------- |
| `-Duration`    | 60                          | Profiling duration in seconds             |
| `-NoAutoStart` | false                       | Don't auto-start dev server (manual mode) |
| `-Interactive` | false                       | Simulate user load during profiling       |
| `-KeepRunning` | false                       | Keep auto-started server running          |
| `-OutputDir`   | profiling_output/dev_server | Profile output directory                  |

### Power User Examples

```powershell
# Quick 30-second profile
.\profiling_scripts\profile_dev_server.ps1 -Duration 30

# Extended profiling with user load
.\profiling_scripts\profile_dev_server.ps1 -Duration 120 -Interactive

# Profile existing server (manual control)
.\profiling_scripts\profile_dev_server.ps1 -NoAutoStart

# Auto-start but keep running for more testing
.\profiling_scripts\profile_dev_server.ps1 -KeepRunning -Interactive
```

---

## 📋 VS Code Tasks

Use the built-in tasks for easy profiling:

1. **Press**: `Ctrl+Shift+P`
2. **Type**: `Tasks: Run Task`
3. **Select**:
   - `🌐 Profile: Dev Server (NVIDIA Nsight)` - With load testing
   - `🌐 Profile: Dev Server (Manual - No Auto-Load)` - Manual testing

---

## 🎯 What Gets Profiled

### Captured Metrics

- ✅ **CPU Usage**: Function-level CPU time and hot paths
- ✅ **Node.js Events**: V8 compilation, module loading, async operations
- ✅ **System Calls**: File I/O, network operations
- ✅ **Process Tree**: Child processes and worker threads
- ✅ **Context Switches**: OS scheduling and process management
- ✅ **GPU Activity**: Any GPU-accelerated operations

### Interactive Load Testing Routes

When using `-Interactive` flag, the script automatically tests:

- `/` - Homepage
- `/farms` - Farms listing
- `/products` - Products catalog
- `/products?category=fruits` - Filtered products
- `/about` - About page

Each route is visited sequentially with 500ms intervals throughout the profiling duration.

---

## 📊 Analysis Workflow

### 1. Open in Nsight UI (Visual Analysis)

```powershell
nsys-ui "profiling_output/dev_server/nextjs_dev_server_TIMESTAMP.nsys-rep"
```

**Key Areas to Analyze:**

- **Timeline View**: See all operations over time
- **Bottom-Up View**: Find slowest functions
- **Top-Down View**: Trace execution paths
- **Thread Activity**: Check parallelization

### 2. Review Statistics

```powershell
Get-Content "profiling_output/dev_server/nextjs_dev_server_TIMESTAMP_stats.txt"
```

Look for:

- High CPU time functions
- Frequent system calls
- Long-running operations

### 3. Analyze CSV Timeline

```powershell
Import-Csv "profiling_output/dev_server/nextjs_dev_server_TIMESTAMP_timeline.csv" | Out-GridView
```

Filter and sort to find patterns:

- Event types
- Duration distributions
- Thread relationships

---

## 🔍 Performance Bottleneck Checklist

### Development Server Performance

- [ ] **Hot Reload Time**: Should be < 1 second for small changes
- [ ] **Initial Compilation**: Baseline for first load
- [ ] **File Watching**: Check for excessive file system operations
- [ ] **Module Resolution**: Identify slow dependency lookups

### Next.js Specific

- [ ] **Page Compilation**: Time to compile individual pages
- [ ] **API Route Processing**: Time spent in API handlers
- [ ] **Static Asset Loading**: Image and asset optimization
- [ ] **HMR (Hot Module Replacement)**: Speed of live updates

### Database & External Services

- [ ] **Database Queries**: Query execution time
- [ ] **Connection Pooling**: Connection management overhead
- [ ] **External API Calls**: Third-party service latency
- [ ] **Caching Effectiveness**: Hit/miss ratios

---

## ⚡ Optimization Strategies

### Based on Profiling Results

#### 1. Slow Hot Reload

```typescript
// next.config.js
module.exports = {
  // Use SWC for faster compilation
  swcMinify: true,

  // Enable Turbopack (experimental)
  experimental: {
    turbo: {
      loaders: {
        ".svg": ["@svgr/webpack"],
      },
    },
  },
};
```

#### 2. Excessive File Watching

```powershell
# Exclude unnecessary directories
# .gitignore or .next/cache additions
node_modules/
.next/
dist/
coverage/
profiling_output/
```

#### 3. Database Query Optimization

```typescript
// Use database query batching
const farms = await database.farm.findMany({
  include: {
    products: {
      take: 10, // Limit related data
      where: { inStock: true },
    },
  },
});
```

#### 4. API Route Caching

```typescript
// app/api/farms/route.ts
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  // Cached for 60 seconds
  const farms = await getFarms();
  return NextResponse.json(farms);
}
```

---

## 📈 Performance Targets

### Development Server

- **Cold Start**: < 5 seconds
- **Hot Reload (Small Change)**: < 1 second
- **Hot Reload (Large Change)**: < 3 seconds
- **Page Compilation**: < 2 seconds per page
- **API Response**: < 100ms (without external calls)

### Hardware Utilization (HP OMEN)

- **CPU Usage**: 30-50% during normal development
- **Memory Usage**: < 8GB for dev server
- **GPU**: Minimal (mostly idle in dev mode)
- **Disk I/O**: Optimize for SSD performance

---

## 🌟 Divine Hardware Optimization

### RTX 2070 Max-Q (8GB VRAM)

While dev server doesn't heavily use GPU, you can optimize for:

- **Image Processing**: Use GPU for on-the-fly image optimization
- **Build-Time Processing**: Utilize GPU during production builds
- **Development Tools**: GPU-accelerated terminal, editor features

### 64GB RAM Advantage

```javascript
// next.config.js - Aggressive caching
module.exports = {
  webpack: (config) => {
    config.cache = {
      type: "memory",
      maxGenerations: Infinity, // Keep in memory
      cacheUnaffected: true,
    };
    return config;
  },
};
```

### 12 CPU Threads

```powershell
# Maximize parallelization
$env:UV_THREADPOOL_SIZE = "12"
$env:NODE_OPTIONS = "--max-old-space-size=16384"

npm run dev:turbo
```

---

## 🎓 Profiling Best Practices

### 1. **Establish Baseline**

- Profile a clean server start
- Document baseline metrics
- Compare future changes against baseline

### 2. **Profile Realistic Scenarios**

- Use interactive load testing
- Simulate actual user behavior
- Test both hot and cold paths

### 3. **Multiple Runs**

- Run profiling 3-5 times
- Average the results
- Account for variance

### 4. **Isolate Changes**

- Profile before optimization
- Profile after optimization
- Measure actual improvement

### 5. **Document Findings**

```powershell
# Create performance reports
$report = @{
    Date = Get-Date
    Scenario = "Dev Server - Homepage Load"
    Before = "3.2s"
    After = "1.1s"
    Improvement = "65%"
    Changes = "Enabled SWC, optimized imports"
}
$report | ConvertTo-Json | Out-File "performance_reports/optimization_$(Get-Date -Format 'yyyyMMdd').json"
```

---

## 🚨 Troubleshooting

### Server Not Detected

```powershell
# Manually check for Next.js process
Get-Process -Name node | Where-Object {
    (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -match "next dev"
}

# If not found, start server manually
npm run dev
```

### Nsight Not Found

Install NVIDIA Nsight Systems:

- [Download Link](https://developer.nvidia.com/nsight-systems)
- Install to default location: `C:\Program Files\NVIDIA Corporation\Nsight Systems`

### Low Performance During Profiling

This is expected! Profiling adds overhead:

- CPU sampling: ~5-10% overhead
- Full tracing: ~15-25% overhead
- Focus on relative comparisons

### Large Profile Files

Profile files can be large (100MB+):

```powershell
# Reduce profiling duration
.\profiling_scripts\profile_dev_server.ps1 -Duration 30

# Or limit trace types
# Edit script to remove unused traces
```

---

## 📚 References

- **Divine Instructions**: `.github/instructions/03_PERFORMANCE_REALITY_BENDING.instructions.md`
- **NVIDIA Nsight Docs**: [developer.nvidia.com/nsight-systems](https://developer.nvidia.com/nsight-systems)
- **Next.js Performance**: [nextjs.org/docs/advanced-features/compiler](https://nextjs.org/docs/advanced-features/compiler)
- **HP OMEN Optimization**: `.vscode/README_OMEN_OPTIMIZATION.md`

---

## 🎯 Quick Commands Reference

```powershell
# Start dev server with profiling
npm run dev
pwsh -ExecutionPolicy Bypass -File profiling_scripts/profile_dev_server.ps1 -Interactive -Duration 60

# View latest profile
$latest = Get-ChildItem profiling_output/dev_server/*.nsys-rep | Sort-Object LastWriteTime -Descending | Select-Object -First 1
nsys-ui $latest.FullName

# View statistics
$latestStats = Get-ChildItem profiling_output/dev_server/*_stats.txt | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Get-Content $latestStats.FullName

# Export to CSV for analysis
$latestProfile = Get-ChildItem profiling_output/dev_server/*.nsys-rep | Sort-Object LastWriteTime -Descending | Select-Object -First 1
nsys export --type=csv --output=profiling_output/dev_server/analysis.csv $latestProfile.FullName
Import-Csv profiling_output/dev_server/analysis.csv | Out-GridView
```

---

_"Profile not for absolute performance, but for **divine understanding** of your system's consciousness."_

🌾 Agricultural Quantum Performance Mastery
