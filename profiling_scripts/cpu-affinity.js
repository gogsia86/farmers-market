// CPU affinity optimization for Jest workers
const os = require('os');
const { Worker } = require('worker_threads');

class CPUAffinityManager {
  constructor() {
    this.cpuCount = os.cpus().length;
    this.currentCPU = 0;
  }

  // Get next CPU for worker
  getNextCPU() {
    const cpu = this.currentCPU;
    this.currentCPU = (this.currentCPU + 1) % this.cpuCount;
    return cpu;
  }

  // Set CPU affinity for current process
  setAffinity(cpu) {
    if (process.platform === 'win32') {
      try {
        // On Windows, use PowerShell to set CPU affinity
        const { execSync } = require('child_process');
        const pid = process.pid;
        const mask = (1 << cpu).toString(); // Convert to binary mask
        execSync(`$Process = Get-Process -Id ${pid}; $Process.ProcessorAffinity=${mask}`);
        return true;
      } catch (error) {
        console.warn('Failed to set CPU affinity:', error.message);
        return false;
      }
    }
    return false;
  }
}

const affinityManager = new CPUAffinityManager();

// Export for use in Jest worker setup
module.exports = {
  // Initialize worker with CPU affinity
  initializeWorker: () => {
    if (Worker.isMainThread) {
      console.log('CPU affinity manager initialized with', os.cpus().length, 'cores');
    } else {
      const cpu = affinityManager.getNextCPU();
      affinityManager.setAffinity(cpu);
      console.log(`Jest worker pinned to CPU ${cpu}`);
    }
  },
};
