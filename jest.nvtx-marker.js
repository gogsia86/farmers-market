// Add NVTX markers to Jest tests
const { markStart, markEnd } = require('./profiling_scripts/nvtx-profiler');

// Add NVTX profiling hooks to Jest
beforeAll(() => {
  if (process.env.NVTX_PROFILER_ENABLED) {
    markStart('Jest Test Suite');
  }
});

beforeEach(() => {
  if (process.env.NVTX_PROFILER_ENABLED) {
    const testInfo = expect.getState();
    markStart(`Test: ${testInfo.currentTestName}`);
  }
});

afterEach(() => {
  if (process.env.NVTX_PROFILER_ENABLED) {
    const testInfo = expect.getState();
    markEnd(`Test: ${testInfo.currentTestName}`);
  }
});

afterAll(() => {
  if (process.env.NVTX_PROFILER_ENABLED) {
    markEnd('Jest Test Suite');
  }
});
