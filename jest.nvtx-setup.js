// Initialize NVTX profiling for Jest test suite
const { startNvtxProfile } = require('./profiling_scripts/nvtx-profiler');

module.exports = async () => {
  // Enable NVTX profiling if environment variable is set
  if (process.env.NVTX_PROFILER_ENABLED) {
    await startNvtxProfile({
      testSuite: 'Farmers Market Tests',
      version: process.env.npm_package_version,
      timestamp: new Date().toISOString(),
    });
  }
};
