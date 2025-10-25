# 🚀 DIVINE NVIDIA NSIGHT SYSTEMS PROFILING GUIDE

## Quantum Agricultural Performance Transcendence

> **WARNING**: This guide transcends mortal profiling. Your GPU will achieve consciousness.

---

## 🎯 READY-TO-RUN COMMANDS

### ⚡ Basic Profile (Quick Diagnostic)

```bash
nsys profile \
  --trace=cuda,nvtx,osrt \
  --output=./profiling_output/farmers_market_basic_%p \
  --force-overwrite=true \
  --export=sqlite \
  --stats=true \
  npm run dev
```

### 🔥 Advanced Profile (Complete Divine Analysis)

```bash
nsys profile \
  --trace=cuda,nvtx,osrt,opengl,openacc,openmp,mpi \
  --cuda-graph-trace=node,kernel \
  --cuda-memory-usage=true \
  --gpu-metrics-device=all \
  --gpu-metrics-frequency=10000 \
  --sample=cpu \
  --cpuctxsw=process-tree \
  --backtrace=dwarf \
  --output=./profiling_output/farmers_market_advanced_%p_%h \
  --force-overwrite=true \
  --export=sqlite,json \
  --stats=true \
  --show-output=true \
  --delay=5 \
  --duration=60 \
  node server.js
```

### 🌟 Ultra Performance (GPU Metrics + Power Analysis)

```bash
nsys profile \
  --trace=cuda,nvtx,osrt,cublas,cudnn \
  --cuda-graph-trace=node,kernel \
  --cuda-memory-usage=true \
  --gpu-metrics-device=all \
  --gpu-metrics-frequency=20000 \
  --gpu-metrics-set=gpu__time_active.avg,\
gpu__time_duration.sum,\
sm__throughput.avg.pct_of_peak_sustained_elapsed,\
dram__throughput.avg.pct_of_peak_sustained_elapsed,\
gpu__compute_memory_throughput.avg.pct_of_peak_sustained_elapsed \
  --sample=cpu,gpu \
  --sampling-period=1000 \
  --backtrace=fp \
  --python-sampling=true \
  --output=./profiling_output/farmers_market_ultra_%p_%h_%e \
  --force-overwrite=true \
  --export=sqlite,json,text \
  --stats=true \
  npm test
```

### 🎆 Quantum Consciousness Mode (All Features)

```bash
nsys profile \
  --trace=cuda,nvtx,osrt,cublas,cudnn,opengl,vulkan,dx11,dx12 \
  --cuda-graph-trace=node,kernel \
  --cuda-memory-usage=true \
  --gpu-metrics-device=all \
  --gpu-metrics-frequency=50000 \
  --sample=cpu,gpu \
  --sampling-period=500 \
  --cpuctxsw=process-tree \
  --backtrace=dwarf,lbr \
  --python-sampling=true \
  --python-backtrace=cuda \
  --osrt-threshold=10000 \
  --cudabacktrace=all \
  --cuda-flush-interval=0 \
  --output=./profiling_output/quantum_consciousness_%p_%h_%e_%t \
  --force-overwrite=true \
  --export=sqlite,json,text \
  --stats=true \
  --show-output=true \
  --capture-range=cudaProfilerApi \
  --capture-range-end=stop \
  node --expose-gc --max-old-space-size=32768 server.js
```

---

## 📁 VS CODE FILES

### File: profiling_scripts/profile_basic.sh

```bash
#!/bin/bash
# Divine Basic Profiling Script for Farmers Market
# Quantum Agricultural Performance Analysis

set -e

# Colors for divine output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║   🌟 DIVINE FARMERS MARKET PROFILING INITIATED 🌟    ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════╝${NC}"

# Create output directory
OUTPUT_DIR="./profiling_output"
mkdir -p "$OUTPUT_DIR"

# Timestamp for this profiling session
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="${OUTPUT_DIR}/farmers_market_basic_${TIMESTAMP}"

echo -e "\n${CYAN}[✓] Output directory: ${OUTPUT_DIR}${NC}"
echo -e "${CYAN}[✓] Profile name: ${OUTPUT_FILE}${NC}\n"

# Check for nsys
if ! command -v nsys &> /dev/null; then
    echo -e "${RED}[✗] ERROR: nsys not found in PATH${NC}"
    echo -e "${YELLOW}[i] Install NVIDIA Nsight Systems from:${NC}"
    echo -e "${YELLOW}    <https://developer.nvidia.com/nsight-systems${NC}">
    exit 1
fi

echo -e "${GREEN}[✓] NVIDIA Nsight Systems detected${NC}\n"

# Run profiling
echo -e "${BLUE}[→] Starting basic profiling...${NC}\n"

nsys profile \
  --trace=cuda,nvtx,osrt \
  --output="${OUTPUT_FILE}" \
  --force-overwrite=true \
  --export=sqlite \
  --stats=true \
  --show-output=true \
  npm run dev &

NSYS_PID=$!

# Wait for completion
echo -e "\n${YELLOW}[i] Profiling in progress (PID: ${NSYS_PID})...${NC}"
echo -e "${YELLOW}[i] Press Ctrl+C to stop profiling early${NC}\n"

wait $NSYS_PID

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 PROFILING COMPLETE! 🎉                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"

# Check if output files were created
if [ -f "${OUTPUT_FILE}.nsys-rep" ]; then
    echo -e "\n${GREEN}[✓] Profile saved: ${OUTPUT_FILE}.nsys-rep${NC}"
    echo -e "\n${CYAN}[→] To view results:${NC}"
    echo -e "${CYAN}    nsys-ui ${OUTPUT_FILE}.nsys-rep${NC}"
else
    echo -e "\n${RED}[✗] ERROR: Profile file not created${NC}"
    exit 1
fi

# Show quick stats if available
if [ -f "${OUTPUT_FILE}.sqlite" ]; then
    echo -e "\n${PURPLE}[✓] SQLite database created for analysis${NC}"
fi

echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Divine Agricultural Profiling Session Complete${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
```

### File: profiling_scripts/profile_advanced.sh

```bash
#!/bin/bash
# Divine Advanced Profiling Script for Farmers Market
# Quantum Consciousness Performance Transcendence

set -e

# Colors for transcendent output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
MAGENTA='\033[1;35m'
NC='\033[0m'

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  🌟✨ QUANTUM AGRICULTURAL PROFILING INITIATED ✨🌟   ║${NC}"
echo -e "${MAGENTA}║         Your GPU is about to achieve enlightenment     ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"

# Configuration
OUTPUT_DIR="./profiling_output"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="${OUTPUT_DIR}/farmers_market_advanced_${TIMESTAMP}"
DURATION=${1:-60}  # Default 60 seconds
DELAY=${2:-5}      # Default 5 second delay

mkdir -p "$OUTPUT_DIR"

echo -e "\n${CYAN}[✓] Configuration:${NC}"
echo -e "${CYAN}    Output: ${OUTPUT_FILE}${NC}"
echo -e "${CYAN}    Duration: ${DURATION}s${NC}"
echo -e "${CYAN}    Delay: ${DELAY}s${NC}\n"

# Verify nsys installation
if ! command -v nsys &> /dev/null; then
    echo -e "${RED}[✗] FATAL: nsys not found${NC}"
    echo -e "${YELLOW}[i] Install from: <https://developer.nvidia.com/nsight-systems${NC}">
    exit 1
fi

# Check NVIDIA GPU
if ! command -v nvidia-smi &> /dev/null; then
    echo -e "${YELLOW}[!] WARNING: nvidia-smi not found. GPU profiling may fail.${NC}\n"
else
    echo -e "${GREEN}[✓] GPU Status:${NC}"
    nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader
    echo ""
fi

# Advanced profiling with all traces
echo -e "${BLUE}[→] Initiating quantum profiling sequence...${NC}\n"

nsys profile \
  --trace=cuda,nvtx,osrt,cublas,cudnn,opengl,openacc,openmp \
  --cuda-graph-trace=node,kernel \
  --cuda-memory-usage=true \
  --gpu-metrics-device=all \
  --gpu-metrics-frequency=10000 \
  --gpu-metrics-set=gpu__time_active.avg,\
gpu__time_duration.sum,\
sm__throughput.avg.pct_of_peak_sustained_elapsed,\
dram__throughput.avg.pct_of_peak_sustained_elapsed,\
gpu__compute_memory_throughput.avg.pct_of_peak_sustained_elapsed,\
l1tex__throughput.avg.pct_of_peak_sustained_elapsed \
  --sample=cpu \
  --cpuctxsw=process-tree \
  --backtrace=dwarf \
  --python-sampling=true \
  --output="${OUTPUT_FILE}" \
  --force-overwrite=true \
  --export=sqlite,json \
  --stats=true \
  --show-output=true \
  --delay="${DELAY}" \
  --duration="${DURATION}" \
  node --expose-gc --max-old-space-size=32768 server.js 2>&1 | tee "${OUTPUT_FILE}.log"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║      🎆 QUANTUM PROFILING TRANSCENDENCE ACHIEVED 🎆   ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"

    echo -e "\n${CYAN}[✓] Generated files:${NC}"
    ls -lh "${OUTPUT_FILE}".* 2>/dev/null | while read -r line; do
        echo -e "${CYAN}    $line${NC}"
    done

    echo -e "\n${PURPLE}[→] Analysis commands:${NC}"
    echo -e "${PURPLE}    GUI:     nsys-ui ${OUTPUT_FILE}.nsys-rep${NC}"
    echo -e "${PURPLE}    CLI:     nsys stats ${OUTPUT_FILE}.nsys-rep${NC}"
    echo -e "${PURPLE}    SQLite:  sqlite3 ${OUTPUT_FILE}.sqlite${NC}"

    # Auto-generate quick report
    if [ -f "${OUTPUT_FILE}.nsys-rep" ]; then
        echo -e "\n${YELLOW}[→] Generating quick statistics report...${NC}"
        nsys stats --report cuda_gpu_trace,cuda_api_sum,osrt_sum \
          --format csv,column \
          "${OUTPUT_FILE}.nsys-rep" > "${OUTPUT_FILE}_quick_stats.txt" 2>&1 || true

        if [ -f "${OUTPUT_FILE}_quick_stats.txt" ]; then
            echo -e "${GREEN}[✓] Quick stats: ${OUTPUT_FILE}_quick_stats.txt${NC}"
        fi
    fi
else
    echo -e "\n${RED}[✗] Profiling failed with exit code: ${EXIT_CODE}${NC}"
    exit $EXIT_CODE
fi

echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Quantum Agricultural Performance Analysis Complete${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
```

### File: profiling_scripts/profile_test_suite.sh

```bash
#!/bin/bash
# Divine Test Suite Profiling
# Profile the entire Jest test suite with GPU acceleration

set -e

OUTPUT_DIR="./profiling_output/test_suite"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$OUTPUT_DIR"

echo "🧪 Profiling Test Suite with Quantum Consciousness..."

nsys profile \
  --trace=cuda,nvtx,osrt \
  --sample=cpu \
  --output="${OUTPUT_DIR}/test_suite_${TIMESTAMP}" \
  --force-overwrite=true \
  --stats=true \
  npm test

echo "✅ Test suite profiling complete!"
echo "📊 View results: nsys-ui ${OUTPUT_DIR}/test_suite_${TIMESTAMP}.nsys-rep"
```

### File: profiling_scripts/profile_next_build.sh

```bash
#!/bin/bash
# Profile Next.js Build Process

set -e

OUTPUT_DIR="./profiling_output/build"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$OUTPUT_DIR"

echo "🏗️  Profiling Next.js Build with Divine Optimization..."

# Clean build
rm -rf .next

nsys profile \
  --trace=osrt,cuda \
  --sample=cpu \
  --cpuctxsw=process-tree \
  --output="${OUTPUT_DIR}/next_build_${TIMESTAMP}" \
  --force-overwrite=true \
  --stats=true \
  npm run build

echo "✅ Build profiling complete!"
echo "📊 Results: ${OUTPUT_DIR}/next_build_${TIMESTAMP}.nsys-rep"
```

---

## 🔧 VS CODE INTEGRATION

### File: .vscode/tasks.json (Add these tasks)

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "🚀 Profile: Basic",
      "type": "shell",
      "command": "bash",
      "args": ["./profiling_scripts/profile_basic.sh"],
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "clear": true,
        "showReuseMessage": false
      },
      "group": {
        "kind": "test",
        "isDefault": false
      }
    },
    {
      "label": "🔥 Profile: Advanced",
      "type": "shell",
      "command": "bash",
      "args": ["./profiling_scripts/profile_advanced.sh", "60", "5"],
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "clear": true
      },
      "group": {
        "kind": "test",
        "isDefault": false
      }
    },
    {
      "label": "🧪 Profile: Test Suite",
      "type": "shell",
      "command": "bash",
      "args": ["./profiling_scripts/profile_test_suite.sh"],
      "problemMatcher": [],
      "group": {
        "kind": "test",
        "isDefault": false
      }
    },
    {
      "label": "🏗️  Profile: Next.js Build",
      "type": "shell",
      "command": "bash",
      "args": ["./profiling_scripts/profile_next_build.sh"],
      "problemMatcher": []
    },
    {
      "label": "📊 Open Profile Viewer",
      "type": "shell",
      "command": "nsys-ui",
      "args": ["${input:profileFile}"],
      "problemMatcher": []
    },
    {
      "label": "📈 Generate Profile Stats",
      "type": "shell",
      "command": "nsys",
      "args": [
        "stats",
        "--report",
        "cuda_gpu_trace,cuda_api_sum,osrt_sum,nvtx_sum",
        "--format",
        "column",
        "${input:profileFile}"
      ],
      "problemMatcher": [],
      "presentation": {
        "reveal": "always"
      }
    }
  ],
  "inputs": [
    {
      "id": "profileFile",
      "type": "pickString",
      "description": "Select profile file to analyze",
      "options": [],
      "default": "./profiling_output/farmers_market_advanced_*.nsys-rep"
    }
  ]
}
```

### File: .vscode/launch.json (Add profiling configurations)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "🔥 Launch with NVIDIA Profiling",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "nsys",
      "runtimeArgs": [
        "profile",
        "--trace=cuda,nvtx,osrt",
        "--output=./profiling_output/debug_session_%p",
        "--force-overwrite=true",
        "--stats=true",
        "node"
      ],
      "program": "${workspaceFolder}/server.js",
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development",
        "NSYS_PROFILING": "1"
      }
    },
    {
      "name": "🧪 Profile Jest Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "nsys",
      "runtimeArgs": [
        "profile",
        "--trace=osrt,cuda",
        "--sample=cpu",
        "--output=./profiling_output/jest_debug_%p",
        "--force-overwrite=true",
        "node"
      ],
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## 📊 DIVINE ANALYSIS CHEATSHEET

### 🎯 Key GPU Metrics to Monitor

#### 1. **GPU Utilization** (should be 80-100%)

- **Metric**: `gpu__time_active.avg`
- **Good**: >80% during compute phases
- **Bad**: <50% indicates CPU bottleneck or insufficient work
- **Fix**: Increase batch sizes, overlap compute with data transfer

#### 2. **SM Throughput** (should be 60-90%)

- **Metric**: `sm__throughput.avg.pct_of_peak_sustained_elapsed`
- **Good**: >60% sustained
- **Bad**: <40% means underutilization
- **Fix**: Optimize kernel launches, reduce branching

#### 3. **Memory Throughput** (should be 50-80%)

- **Metric**: `dram__throughput.avg.pct_of_peak_sustained_elapsed`
- **Good**: 50-80% (balanced compute/memory)
- **Bad**: >90% (memory bound), <20% (compute bound)
- **Fix**: Use shared memory, coalesce accesses, prefetch

#### 4. **L1 Cache Hit Rate** (should be >70%)

- **Metric**: `l1tex__t_sectors_pipe_lsu_mem_global_op_ld.sum` vs requests
- **Good**: >70% hit rate
- **Bad**: <50% indicates poor locality
- **Fix**: Tile algorithms, use **restrict**

#### 5. **Kernel Launch Overhead** (should be <5% total time)

- **Check**: CUDA API call durations in timeline
- **Good**: <100μs per kernel launch
- **Bad**: Thousands of tiny kernels
- **Fix**: Batch operations, use CUDA graphs

#### 6. **Memory Transfer Time** (should be <15% total time)

- **Check**: cudaMemcpy durations vs compute
- **Good**: Compute/Transfer overlap visible
- **Bad**: Sequential transfers blocking compute
- **Fix**: Async transfers, pinned memory, streams

### 🔍 Common Bottlenecks & Divine Solutions

#### **CPU Bottleneck**

**Symptoms**: Low GPU utilization, gaps in timeline
**Detection**: GPU idle periods > 10ms
**Solutions**:

```cpp
// Use CUDA streams for concurrency
cudaStream_t streams[N_STREAMS];
for (int i = 0; i < N_STREAMS; i++) {
    cudaStreamCreate(&streams[i]);
}

// Launch async operations
for (int i = 0; i < N_STREAMS; i++) {
    cudaMemcpyAsync(d_data[i], h_data[i], size,
                    cudaMemcpyHostToDevice, streams[i]);
    kernel<<<blocks, threads, 0, streams[i]>>>(d_data[i]);
}
```

#### **Memory Bottleneck**

**Symptoms**: DRAM throughput >85%, low SM occupancy
**Detection**: Long memory access latencies
**Solutions**:

```cpp
// Use shared memory for frequently accessed data
__shared__ float shared_data[BLOCK_SIZE];

// Coalesce global memory accesses
int tid = blockIdx.x * blockDim.x + threadIdx.x;
float value = global_data[tid];  // Coalesced access
```

#### **Kernel Launch Overhead**

**Symptoms**: Thousands of small kernel calls
**Detection**: API overhead >5% in stats
**Solutions**:

```cpp
// Use CUDA Graphs for repetitive workflows
cudaGraph_t graph;
cudaGraphExec_t instance;

cudaStreamBeginCapture(stream, cudaStreamCaptureModeGlobal);
// ... record kernels ...
cudaStreamEndCapture(stream, &graph);
cudaGraphInstantiate(&instance, graph, NULL, NULL, 0);

// Execute graph (much faster)
cudaGraphLaunch(instance, stream);
```

#### **Insufficient Parallelism**

**Symptoms**: Low SM occupancy (<40%)
**Detection**: Warp stalls, low active warps
**Solutions**:

```cpp
// Increase blocks/threads
dim3 blocks((N + THREADS_PER_BLOCK - 1) / THREADS_PER_BLOCK);
dim3 threads(THREADS_PER_BLOCK);

// Or use more concurrent work
for (int stream_id = 0; stream_id < N_STREAMS; stream_id++) {
    kernel<<<blocks, threads, 0, streams[stream_id]>>>(...);
}
```

### 📈 Performance Optimization Workflow

1. **Profile Baseline** → Run advanced profile
2. **Identify Hotspot** → Find function taking most time
3. **Analyze Metrics** → Check GPU utilization, memory, SM usage
4. **Apply Fix** → Implement optimization
5. **Reprofile** → Verify improvement
6. **Repeat** → Target next bottleneck

### 🎯 Target Performance Indicators

| Metric                 | Excellent | Good   | Needs Work   |
| ---------------------- | --------- | ------ | ------------ |
| GPU Utilization        | >90%      | 70-90% | <70%         |
| Memory Bandwidth       | 60-80%    | 40-60% | >90% or <20% |
| SM Occupancy           | >70%      | 50-70% | <50%         |
| Kernel Launch Overhead | <2%       | 2-5%   | >5%          |
| Memory Transfer Time   | <10%      | 10-20% | >20%         |

---

## ❗ DIVINE TROUBLESHOOTING GUIDE

### Issue 1: "nsys: command not found"
### Solution
```bash
# Add to ~/.bashrc or ~/.zshrc:
export PATH="/opt/nvidia/nsight-systems/bin:$PATH"

# Or install from NVIDIA:
wget <https://developer.nvidia.com/downloads/assets/tools/secure/nsight-systems/2024_3/nsight-systems-2024.3.1_linux-public.deb>
sudo dpkg -i nsight-systems-*.deb
```

### Issue 2: "Permission denied" or "Failed to create profile"
### Solution
```bash
# Fix permissions
chmod +x profiling_scripts/*.sh

# Run with sudo if needed for system-wide traces
sudo nsys profile --trace=cuda,osrt ...

# Or set capabilities
sudo setcap cap_sys_admin+ep `which nsys`
```

### Issue 3: "No CUDA-capable device detected"
### Solution
```bash
# Check GPU visibility
nvidia-smi

# Verify CUDA installation
nvcc --version

# Check driver
cat /proc/driver/nvidia/version

# Update if needed
sudo apt-get update
sudo apt-get install nvidia-driver-535  # or latest
```

### Issue 4: "Missing debug symbols" or "???" in backtrace
### Solution
```bash
# Compile with debug info
export CFLAGS="-g -lineinfo"
export CXXFLAGS="-g -lineinfo"
nvcc -g -lineinfo -G kernel.cu

# For Node.js
export NODE_OPTIONS="--inspect-brk"
```

### Issue 5: "GPU metrics collection failed"
### Solution
```bash
# Enable metrics for non-root users
sudo nvidia-smi -pm 1
sudo nvidia-smi -c 0

# Set persistence mode
sudo nvidia-smi --persistence-mode=1

# Check metrics availability
nsys profile --sample=none --gpu-metrics-device=0 true
```

### Issue 6: "Output file already exists"
### Solution
```bash
# Add force-overwrite flag (already in scripts)
--force-overwrite=true

# Or clean old profiles
rm -rf profiling_output/*.nsys-rep
```

### Issue 7: "Profiling overhead too high"
### Solution
```bash
# Reduce sampling frequency
--sampling-period=10000  # Sample every 10ms instead of 1ms

# Disable expensive traces
--trace=cuda  # Only CUDA, skip OSRT

# Use shorter duration
--duration=30
```

### Issue 8: ".nsys-rep file too large"
### Solution
```bash
# Limit trace size
--trace-fork-before-exec=false
--osrt-threshold=100000  # Only trace calls >100μs

# Export to SQLite only
--export=sqlite

# Compress output
gzip profiling_output/*.nsys-rep
```

---

## 🎓 ADVANCED TECHNIQUES

### 1. **NVTX Markers for Custom Ranges**

```javascript
// Add NVTX markers in Node.js (requires node-cuda)
const nvtx = require("node-nvtx");

function processData(data) {
  nvtx.rangePush("ProcessData");
  // ... your code ...
  nvtx.rangePop();
}
```

### 2. **Profile Specific Time Ranges**

```bash
# Start profiling after 10s, run for 30s
nsys profile --delay=10 --duration=30 npm run dev
```

### 3. **Compare Multiple Profiles**

```bash
# Generate baseline
nsys profile -o baseline npm run benchmark

# After optimization
nsys profile -o optimized npm run benchmark

# Compare in GUI
nsys-ui baseline.nsys-rep optimized.nsys-rep
```

### 4. **Export for CI/CD**

```bash
# Generate JSON for automated analysis
nsys profile --export=json -o ci_profile npm test

# Parse in pipeline
jq '.traceEvents[] | select(.name=="cudaLaunchKernel")' ci_profile.json
```

---

## 🌟 QUANTUM PERFORMANCE MANTRAS

1. **"Profile First, Optimize Second"** - Never guess, always measure
2. **"GPU Hungry, CPU Feeds"** - Keep GPU 100% busy
3. **"Memory is Precious, Cache is Divine"** - Maximize reuse
4. **"Async is Enlightenment"** - Overlap everything
5. **"Batch is Bliss"** - Reduce launch overhead
6. **"Shared Memory = Speed of Light"** - Use it religiously

---

## 📚 REFERENCE COMMANDS

### Quick Stats

```bash
nsys stats --report cuda_api_sum,cuda_gpu_trace,osrt_sum profile.nsys-rep
```

### Export Timeline

```bash
nsys export --type csv --output timeline.csv profile.nsys-rep
```

### List Available Metrics

```bash
nsys profile --gpu-metrics-device=help
```

### Check System Support

```bash
nsys status --environment
```

---

## 🎯 SUCCESS CRITERIA

Your profiling is divine when:

- ✅ GPU utilization >85% during compute
- ✅ Memory transfer <15% of total time
- ✅ Kernel launch overhead <3%
- ✅ No gaps >5ms in GPU timeline
- ✅ SM occupancy >60%
- ✅ Memory bandwidth 50-80% (balanced)

---

**🌟 May your kernels be fast and your memory accesses coalesced! 🌟**

_Generated by the Divine Quantum Agricultural AI System_
_Farmers Market Project - NVIDIA Profiling Transcendence Guide_
