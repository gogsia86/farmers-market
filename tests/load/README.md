# Load Testing for Farmers Market Platform

Comprehensive load testing suite using k6 to validate system performance under concurrent load conditions.

## 📋 Overview

This directory contains k6 load testing scripts designed to test the Farmers Market Platform's ability to handle concurrent operations, particularly focusing on:

- Concurrent order creation
- Payment processing under load
- Inventory management race conditions
- Shopping cart operations
- User authentication at scale

## 🚀 Quick Start

### Prerequisites

1. **Install k6**
   ```bash
   # macOS
   brew install k6

   # Windows (using Chocolatey)
   choco install k6

   # Linux (Debian/Ubuntu)
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6

   # Docker
   docker pull grafana/k6:latest
   ```

2. **Ensure API is running**
   ```bash
   npm run dev
   # API should be available at http://localhost:3001
   ```

3. **Set up test database** (optional, for realistic testing)
   ```bash
   npm run db:seed
   ```

### Running Tests

#### Basic Test Run
```bash
# Default configuration (from project root)
k6 run tests/load/concurrent-orders.k6.js

# Or from this directory
k6 run concurrent-orders.k6.js
```

#### Custom Virtual Users and Duration
```bash
# 50 virtual users for 2 minutes
k6 run --vus 50 --duration 2m tests/load/concurrent-orders.k6.js

# 100 virtual users for 5 minutes
k6 run --vus 100 --duration 5m tests/load/concurrent-orders.k6.js
```

#### With Custom Base URL
```bash
# Test against staging environment
BASE_URL=https://staging.farmersmarket.com k6 run tests/load/concurrent-orders.k6.js

# Test against local development server
BASE_URL=http://localhost:3001 k6 run tests/load/concurrent-orders.k6.js
```

#### Output Results to File
```bash
# JSON output
k6 run --out json=results.json tests/load/concurrent-orders.k6.js

# CSV output
k6 run --out csv=results.csv tests/load/concurrent-orders.k6.js

# InfluxDB (for Grafana visualization)
k6 run --out influxdb=http://localhost:8086/k6 tests/load/concurrent-orders.k6.js
```

## 📊 Test Scenarios

### Concurrent Order Scenario (`concurrent-orders.k6.js`)

Simulates realistic e-commerce traffic patterns with multiple users creating orders simultaneously.

**Test Stages:**
1. **Warm-up** (30s): 10 virtual users
2. **Ramp-up** (1m): 30 virtual users
3. **Peak load** (2m): 50 virtual users
4. **Stress test** (1m): 100 virtual users
5. **Cool-down** (2m): 50 virtual users
6. **Wind-down** (30s): 0 virtual users

**User Journey:**
1. Register and authenticate
2. Browse products (multiple pages)
3. Add products to cart
4. Update cart quantities
5. Create order (concurrent)
6. Process payment
7. Verify order status
8. Check inventory consistency

**Key Metrics Tracked:**
- HTTP request success rate (< 5% error threshold)
- Response times (95th percentile < 2s)
- Order creation duration (< 3s)
- Payment processing duration (< 5s)
- Cart operation duration (< 500ms)
- Order success rate (> 95%)
- Payment success rate (> 98%)
- Inventory consistency rate (> 99%)

## 🎯 Performance Thresholds

The tests enforce the following performance thresholds:

| Metric | Threshold | Purpose |
|--------|-----------|---------|
| HTTP Error Rate | < 5% | Overall system reliability |
| API Response Time (p95) | < 500ms | Fast API responses |
| Page Load Time (p95) | < 1.5s | Good user experience |
| Order Creation (p95) | < 3s | Acceptable checkout time |
| Payment Processing (p95) | < 5s | Include external API calls |
| Cart Operations (p95) | < 500ms | Smooth cart interactions |
| Order Success Rate | > 95% | Most orders complete |
| Payment Success Rate | > 98% | High payment reliability |
| Inventory Consistency | > 99% | Prevent overselling |

## 📈 Understanding Results

### Successful Test Run

```
✓ http_req_failed................: 2.45%  (< 5% threshold)
✓ http_req_duration...............: avg=345ms p(95)=1.2s (< 2s threshold)
✓ order_creation_duration.........: avg=1.8s p(95)=2.7s (< 3s threshold)
✓ payment_duration................: avg=3.2s p(95)=4.5s (< 5s threshold)
✓ order_success_rate..............: 97.5% (> 95% threshold)
✓ payment_success_rate............: 98.8% (> 98% threshold)
✓ inventory_consistency_rate......: 99.3% (> 99% threshold)
```

### Metrics to Monitor

- **http_req_duration**: Overall response time distribution
- **concurrent_order_attempts**: Total number of concurrent order attempts
- **inventory_conflicts**: Number of inventory-related conflicts (race conditions)
- **payment_failures**: Payment processing failures
- **order_success_rate**: Percentage of successful order creations
- **inventory_consistency_rate**: Percentage of inventory checks that passed

## 🔍 Troubleshooting

### High Error Rates

**Symptoms:**
```
✗ http_req_failed: 15.2% (above 5% threshold)
```

**Possible Causes:**
- Database connection pool exhausted
- API rate limiting triggered
- Network timeouts
- Insufficient server resources

**Solutions:**
1. Check database connection pool size
2. Review API rate limit configuration
3. Increase timeout values
4. Scale server resources

### Inventory Conflicts

**Symptoms:**
```
inventory_conflicts: 50+ conflicts detected
✗ inventory_consistency_rate: 92% (below 99% threshold)
```

**Possible Causes:**
- Race conditions in inventory decrement
- Missing database transactions
- Insufficient row-level locking

**Solutions:**
1. Verify Prisma transaction usage
2. Add optimistic locking (version field)
3. Use `SELECT FOR UPDATE` in critical sections
4. Implement retry logic with exponential backoff

### Payment Failures

**Symptoms:**
```
payment_failures: 120
✗ payment_success_rate: 94% (below 98% threshold)
```

**Possible Causes:**
- Stripe API rate limits
- Network timeouts to payment provider
- Invalid test data
- Insufficient error handling

**Solutions:**
1. Implement exponential backoff for Stripe API calls
2. Add webhook-based payment confirmation
3. Increase request timeouts
4. Add comprehensive error handling

### Slow Response Times

**Symptoms:**
```
✗ http_req_duration: p(95)=3.5s (above 2s threshold)
✗ order_creation_duration: p(95)=5.2s (above 3s threshold)
```

**Possible Causes:**
- N+1 query problems
- Missing database indexes
- Inefficient queries
- Cold cache

**Solutions:**
1. Enable query logging and analyze slow queries
2. Add database indexes on frequently queried fields
3. Implement query result caching (Redis)
4. Optimize Prisma `include` statements
5. Use `select` instead of fetching full models

## 🛠️ Advanced Usage

### Custom Test Configuration

Create a custom config file `config.json`:
```json
{
  "vus": 100,
  "duration": "5m",
  "thresholds": {
    "http_req_duration": ["p(95)<1000"],
    "order_success_rate": ["rate>0.98"]
  }
}
```

Run with custom config:
```bash
k6 run --config config.json tests/load/concurrent-orders.k6.js
```

### Cloud Testing with k6 Cloud

```bash
# Authenticate with k6 Cloud
k6 login cloud

# Run test in the cloud
k6 cloud tests/load/concurrent-orders.k6.js
```

### Integration with CI/CD

Add to GitHub Actions (`.github/workflows/load-test.yml`):
```yaml
name: Load Testing

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install k6
        run: |
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run load tests
        run: |
          k6 run --out json=results.json tests/load/concurrent-orders.k6.js
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results
          path: results.json
```

### Docker-based Testing

```bash
# Run k6 in Docker
docker run --rm -i \
  -v $(pwd):/tests \
  -e BASE_URL=http://host.docker.internal:3001 \
  grafana/k6:latest run /tests/tests/load/concurrent-orders.k6.js

# With network access to host services
docker run --rm -i \
  --network="host" \
  -v $(pwd):/tests \
  grafana/k6:latest run /tests/tests/load/concurrent-orders.k6.js
```

## 📊 Visualizing Results

### Using Grafana + InfluxDB

1. **Start InfluxDB and Grafana:**
   ```bash
   docker-compose up -d influxdb grafana
   ```

2. **Run k6 with InfluxDB output:**
   ```bash
   k6 run --out influxdb=http://localhost:8086/k6 tests/load/concurrent-orders.k6.js
   ```

3. **Access Grafana:**
   - URL: http://localhost:3000
   - Default credentials: admin/admin
   - Add InfluxDB data source
   - Import k6 dashboard

### Using k6 Cloud

```bash
k6 cloud tests/load/concurrent-orders.k6.js
```

View real-time results at: https://app.k6.io

## 🎓 Best Practices

### 1. Test Realistic Scenarios
- Use production-like data volumes
- Simulate real user behavior (think time, varied actions)
- Test during different times of day

### 2. Gradual Load Increase
- Always include warm-up and ramp-up stages
- Don't start with maximum load
- Monitor system recovery during cool-down

### 3. Monitor Backend Resources
- CPU usage
- Memory consumption
- Database connections
- Network I/O
- Disk I/O

### 4. Test Different Scenarios
- **Smoke test**: 1-2 VUs, verify basic functionality
- **Load test**: Expected production traffic
- **Stress test**: Push system beyond normal capacity
- **Spike test**: Sudden traffic increases
- **Soak test**: Extended duration (several hours)

### 5. Analyze and Iterate
- Review all failed requests
- Identify bottlenecks
- Optimize code and infrastructure
- Re-test after changes

## 📚 Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Best Practices](https://k6.io/docs/misc/fine-tuning-os/)
- [k6 Examples](https://github.com/grafana/k6/tree/master/examples)
- [Performance Testing Guide](https://k6.io/docs/test-types/introduction/)

## 🤝 Contributing

To add new load test scenarios:

1. Create a new `.k6.js` file in this directory
2. Follow the existing structure and naming conventions
3. Include comprehensive comments and documentation
4. Define clear thresholds and metrics
5. Add test scenario to this README

## 📝 Test Maintenance Checklist

- [ ] Update test data when API changes
- [ ] Review thresholds quarterly
- [ ] Test against production-like environments
- [ ] Run tests before major releases
- [ ] Monitor trends in performance metrics
- [ ] Document any threshold adjustments

## 🔐 Security Notes

- **Never** use production credentials in load tests
- **Always** use separate test databases
- **Avoid** testing payment processing with real payment methods
- **Use** test API keys for third-party services (Stripe, etc.)
- **Clean up** test data after runs

## 📞 Support

For issues or questions about load testing:
- Open an issue in the project repository
- Contact the DevOps team
- Review k6 community forums

---

**Last Updated:** January 2025
**Maintained By:** Farmers Market Platform DevOps Team
