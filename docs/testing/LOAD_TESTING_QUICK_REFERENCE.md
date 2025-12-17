# ⚡ Load Testing Quick Reference Guide

## 🚀 Quick Start (Copy-Paste Ready)

### Run Your First Load Test
```bash
# 1. Start dev server
npm run dev

# 2. Run quick smoke test (1 minute)
npm run test:load:smoke

# 3. Run standard load test (16 minutes)
npm run test:load:standard

# 4. View results
npm run test:load:results
```

---

## 📋 Common Commands

### Load Testing
```bash
# Smoke test (1 min, 1 VU) - Quick validation
npm run test:load:smoke

# Standard test (16 min, 0→150 VUs) - Realistic load
npm run test:load:standard

# Spike test (6 min, sudden 500 VU spike) - Traffic surge
npm run test:load:spike

# Stress test (17 min, progressive to 500 VUs) - Find limits
npm run test:load:stress

# Soak test (30 min, 100 VUs) - Stability check
npm run test:load:soak

# Divine mode (stricter thresholds)
npm run test:load:divine

# View HTML report
npm run test:load:results
```

### Performance Benchmarking
```bash
# Set baseline (first time or after changes)
npm run perf:baseline

# Run benchmark (compare with baseline)
npm run perf:benchmark

# Compare without re-running tests
npm run perf:compare

# View performance history
npm run perf:history
```

### Resource Monitoring
```bash
# Start monitoring (in separate terminal)
npm run perf:monitor:start

# Stop monitoring and generate report
npm run perf:monitor:stop

# View current monitoring report
npm run perf:monitor:report

# Full workflow (automated)
npm run perf:full
```

---

## 🎯 Test Scenarios Explained

| Scenario | Duration | Users | Purpose | When to Use |
|----------|----------|-------|---------|-------------|
| **Smoke** | 1 min | 1 | Quick sanity check | Pre-deployment, CI/CD |
| **Standard** | 16 min | 0→150 | Realistic load pattern | Regular testing, releases |
| **Spike** | 6 min | 50→500 | Sudden traffic surge | Marketing events, viral |
| **Stress** | 17 min | 0→500 | Find breaking point | Capacity planning |
| **Soak** | 30 min | 100 | Detect memory leaks | Pre-production, stability |

---

## 📊 Understanding Results

### Console Output
```
📊 OVERALL PERFORMANCE: 🌟 DIVINE PERFECTION (Divinity Score: 100/100)

🎯 REQUEST STATISTICS:
   Total Requests: 45,287
   Success Rate: 99.987%        ← Should be >99.5%
   Failed Requests: 6
   Requests/Second: 47.38       ← Should be >100 at peak

⚡ LATENCY METRICS:
   Average: 187.45ms            ← Should be <200ms
   95th Percentile: 342.12ms    ← Should be <1000ms
   99th Percentile: 876.34ms    ← Should be <2000ms

🌾 AGRICULTURAL CONSCIOUSNESS:
   Consciousness Level: 94.23/100   ← Should be >80 (>90 for divine)
   Seasonal Coherence: 99.87%       ← Should be >99%
   Farm Data Integrity: 99.94%      ← Should be >99.9%
```

### Performance Ratings
- 🌟 **DIVINE PERFECTION** (100) - All metrics excellent
- 🟢 **EXCELLENT** (90) - Great performance
- 🟡 **GOOD** (75) - Acceptable performance
- 🟠 **ACCEPTABLE** (60) - Meets minimum standards
- 🔴 **NEEDS WORK** (<60) - Performance issues detected

---

## 🔧 Configuration Options

### Environment Variables
```bash
# Target URL
BASE_URL=http://localhost:3001 npm run test:load

# Specific scenario
SCENARIO=spike npm run test:load

# Enable divine mode
DIVINE_MODE=true npm run test:load

# Set environment name
ENVIRONMENT=staging npm run test:load

# Monitoring intervals
MONITORING_INTERVAL=5000 npm run perf:monitor:start

# Alert thresholds
ALERT_CPU_THRESHOLD=80 npm run perf:monitor:start
ALERT_MEMORY_THRESHOLD=85 npm run perf:monitor:start
ALERT_LATENCY_THRESHOLD=2000 npm run perf:monitor:start
```

### Custom k6 Options
```bash
# Custom VUs and duration
k6 run --vus 200 --duration 10m tests/load/comprehensive-load-test.ts

# Save results to file
k6 run --out json=results.json tests/load/comprehensive-load-test.ts

# Multiple iterations
k6 run --iterations 100 tests/load/comprehensive-load-test.ts

# Combine options
k6 run -e SCENARIO=stress -e BASE_URL=https://staging.example.com tests/load/comprehensive-load-test.ts
```

---

## 🐛 Common Issues & Solutions

### ❌ "k6: command not found"
```bash
# Install k6
brew install k6              # macOS
choco install k6             # Windows
apt-get install k6           # Linux

# Or download: https://k6.io/docs/get-started/installation/
```

### ❌ "Connection refused" / "ECONNREFUSED"
```bash
# Check if dev server is running
npm run dev

# Verify server is accessible
curl http://localhost:3001/api/health

# Update BASE_URL
BASE_URL=http://localhost:3000 npm run test:load
```

### ❌ High error rate (>1%)
**Possible causes:**
- Server not running or crashed
- Database connection issues
- Rate limiting triggered
- Insufficient resources

**Solutions:**
```bash
# Check server logs
npm run dev

# Start with smaller load
npm run test:load:smoke

# Monitor resources
npm run perf:monitor:start

# Check database
npm run db:studio
```

### ❌ "Performance regression detected"
```bash
# View history to identify when regression started
npm run perf:history

# If changes are intentional, update baseline
npm run perf:baseline

# If bug, fix and re-test
npm run perf:benchmark
```

### ⚠️ Monitoring alerts (CPU/Memory/Latency)
```bash
# Check monitoring report
npm run perf:monitor:report

# Review recent changes
git log --oneline -10

# Profile specific endpoints
# (use browser DevTools or APM tools)

# Optimize database queries
npm run db:studio
```

---

## 💡 Best Practices

### ✅ DO
- ✅ Run smoke tests before standard tests
- ✅ Set a baseline after major releases
- ✅ Monitor resources during load tests
- ✅ Test against staging, not production
- ✅ Clean up test data after soak tests
- ✅ Review reports after each test
- ✅ Track performance history
- ✅ Use appropriate test scenario for your goal

### ❌ DON'T
- ❌ Test production without approval
- ❌ Skip smoke tests
- ❌ Ignore performance regressions
- ❌ Run multiple tests simultaneously
- ❌ Leave monitoring running indefinitely
- ❌ Use real user credentials in tests
- ❌ Forget to check exit codes in CI/CD

---

## 🔄 Typical Workflows

### Development Workflow
```bash
# 1. Make code changes
git checkout -b feature/performance-improvement

# 2. Start dev server
npm run dev

# 3. Quick validation
npm run test:load:smoke

# 4. If passing, run standard test
npm run test:load:standard

# 5. Benchmark against baseline
npm run perf:benchmark

# 6. If improved, commit changes
git commit -m "perf: optimize API response time"
```

### Release Validation
```bash
# 1. Deploy to staging
npm run deploy:staging

# 2. Run comprehensive tests
npm run test:load:standard

# 3. Run benchmark
npm run perf:benchmark

# 4. If passing, run soak test
npm run test:load:soak

# 5. Deploy to production
npm run deploy:production
```

### CI/CD Integration
```yaml
# .github/workflows/performance.yml
- name: Smoke Test
  run: npm run test:load:smoke

- name: Performance Benchmark
  run: npm run perf:benchmark

- name: Upload Reports
  uses: actions/upload-artifact@v3
  with:
    name: performance-reports
    path: tests/load/results/
```

### Capacity Planning
```bash
# 1. Start monitoring
npm run perf:monitor:start

# 2. Run stress test (find breaking point)
npm run test:load:stress

# 3. Stop monitoring
npm run perf:monitor:stop

# 4. Analyze resource usage and limits
# Review: tests/load/results/monitoring/

# 5. Calculate required infrastructure
# Based on CPU/memory peaks and target load
```

---

## 📈 Performance Targets

### Latency Targets
| Percentile | Target | Excellent |
|------------|--------|-----------|
| Average    | <200ms | <100ms    |
| P50        | <200ms | <150ms    |
| P90        | <500ms | <300ms    |
| P95        | <1000ms | <500ms   |
| P99        | <2000ms | <1000ms  |
| Max        | <5000ms | <2000ms  |

### Success Rate Targets
- **Minimum:** 99.5% success rate
- **Excellent:** 99.9% success rate
- **Divine:** 99.99% success rate

### Throughput Targets
- **Minimum:** 100 RPS at peak load
- **Excellent:** 200+ RPS sustained
- **Divine:** 500+ RPS with <300ms P95

### Agricultural Consciousness Targets
- **Minimum:** 80/100 consciousness level
- **Excellent:** 90/100 consciousness level
- **Divine:** 95/100 consciousness level

---

## 🎨 Report Locations

### Load Test Reports
```
tests/load/results/
├── comprehensive-load-test-summary.html    ← Main HTML report
├── comprehensive-load-test-summary.json    ← Full JSON data
└── comprehensive-load-test-metrics.json    ← Simplified metrics
```

### Benchmark Reports
```
tests/load/results/reports/
├── benchmark-YYYY-MM-DDTHH-MM-SS.html      ← HTML report with charts
└── benchmark-YYYY-MM-DDTHH-MM-SS.json      ← JSON data
```

### Monitoring Reports
```
tests/load/results/monitoring/
├── report-YYYY-MM-DDTHH-MM-SS.html         ← HTML with charts
├── session-YYYY-MM-DDTHH-MM-SS.json        ← Full session data
└── monitoring.log                           ← Real-time logs
```

### Baselines & History
```
tests/load/results/baselines/
├── performance-baseline.json                ← Current baseline
└── performance-history.json                 ← Last 100 runs
```

---

## 🔍 Interpreting Metrics

### HTTP Request Duration
- **Blocked:** Time before connection (DNS, TCP)
- **Connecting:** TCP connection establishment
- **Sending:** Request transmission time
- **Waiting:** Time to first byte (TTFB)
- **Receiving:** Response download time
- **Duration:** Total time (above combined)

### Custom Metrics
- **quantum_latency:** End-to-end latency
- **api_latency:** API-specific latency
- **page_load_time:** Full page load duration
- **consciousness_level:** Agricultural awareness score
- **seasonal_coherence:** Seasonal data accuracy
- **biodynamic_sync:** Farming method accuracy

### Resource Metrics
- **CPU usage:** Percentage of CPU utilized
- **Memory usage:** Percentage of RAM used
- **Load average:** System load (1m, 5m, 15m)
- **API availability:** % of successful health checks
- **Database connections:** Active DB connections

---

## 🎯 When to Use Each Test

### Smoke Test (1 minute)
**Use when:**
- Quick pre-deployment validation
- CI/CD pipeline gates
- After hotfixes
- Before running longer tests

**Don't use when:**
- Need realistic load patterns
- Testing system limits
- Validating sustained performance

### Standard Test (16 minutes)
**Use when:**
- Regular performance testing
- Release validation
- Weekly performance checks
- Baseline establishment

**Don't use when:**
- Time-constrained (use smoke)
- Need extreme load (use stress)
- Testing memory leaks (use soak)

### Spike Test (6 minutes)
**Use when:**
- Marketing campaign planning
- Black Friday preparation
- Viral event simulation
- Auto-scaling validation

**Don't use when:**
- Need sustained load
- Finding absolute limits
- Regular performance checks

### Stress Test (17 minutes)
**Use when:**
- Capacity planning
- Infrastructure sizing
- Finding breaking points
- SLA definition

**Don't use when:**
- Quick validation needed
- Pre-deployment checks
- Regular monitoring

### Soak Test (30 minutes)
**Use when:**
- Pre-production validation
- Memory leak detection
- Stability verification
- Long-running service testing

**Don't use when:**
- Time-constrained
- Quick validation needed
- CI/CD pipelines

---

## 📞 Getting Help

### Documentation
- Full guide: `docs/testing/DAY_13_LOAD_TESTING_PERFORMANCE.md`
- This quick reference: `docs/testing/LOAD_TESTING_QUICK_REFERENCE.md`
- k6 docs: https://k6.io/docs/

### Troubleshooting
1. Check server logs: `npm run dev`
2. Review monitoring: `npm run perf:monitor:report`
3. Check history: `npm run perf:history`
4. Validate setup: `curl http://localhost:3001/api/health`

### Support
- GitHub Issues
- Team Slack channel
- Performance review meetings

---

## 🚀 Next Steps

After mastering load testing:
1. **Security Testing** (Day 14) - Vulnerability scanning
2. **Integration Testing** (Day 15) - End-to-end flows
3. **Production Monitoring** - Continuous performance tracking
4. **Auto-scaling** - Dynamic resource allocation
5. **Performance Optimization** - Based on test insights

---

**Last Updated:** Day 13 - Load Testing Implementation  
**Status:** ✅ Production Ready  
**Divine Perfection Score:** 100/100

Happy Load Testing! 🌾⚡