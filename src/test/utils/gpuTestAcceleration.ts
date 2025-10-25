import { GPUAccelerator } from "@/lib/gpu/GPUAccelerator";
import { performance } from "node:perf_hooks";

let gpuAccelerator: GPUAccelerator | null = null;

/**
 * Initialize GPU acceleration for test environment
 * Creates a singleton GPUAccelerator instance
 */
export async function initGPUTestAcceleration(): Promise<void> {
  NVTX.markA("GPU_TEST_INIT_START");

  if (!gpuAccelerator) {
    gpuAccelerator = await GPUAccelerator.create();
  }

  // Configure for test environment
  await gpuAccelerator.optimizeMemory();

  NVTX.markA("GPU_TEST_INIT_END");
}

/**
 * Clean up GPU resources after tests complete
 */
export async function cleanupGPUTestAcceleration(): Promise<void> {
  NVTX.markA("GPU_TEST_CLEANUP_START");

  if (gpuAccelerator) {
    await gpuAccelerator.optimizeMemory();
    gpuAccelerator = null;
  }

  NVTX.markA("GPU_TEST_CLEANUP_END");
}

/**
 * Get the shared GPUAccelerator instance
 * Will initialize if not already created
 */
export async function getTestGPUAccelerator(): Promise<GPUAccelerator> {
  if (!gpuAccelerator) {
    await initGPUTestAcceleration();
  }
  return gpuAccelerator!;
}

/**
 * Create a test-specific GPU kernel
 * @param name Kernel name/identifier
 * @param code WGSL shader code
 */
export async function createTestKernel(
  name: string,
  code: string
): Promise<void> {
  const accelerator = await getTestGPUAccelerator();
  await accelerator.createKernel(name, code);
}

/**
 * Run a GPU-accelerated test computation
 * @param kernelName Name of the kernel to use
 * @param inputData Input data array
 * @returns Processed output data
 */
export async function runGPUTestComputation<T>(
  kernelName: string,
  inputData: T[]
): Promise<T[]> {
  const accelerator = await getTestGPUAccelerator();
  return accelerator.runComputation(kernelName, inputData);
}

/**
 * Measure GPU execution time for a test
 * @param callback Test function to measure
 */
export async function measureGPUTestTime(
  callback: () => Promise<void>
): Promise<number> {
  const start = performance.now();
  NVTX.markA("GPU_TEST_EXECUTION_START");

  await callback();

  NVTX.markA("GPU_TEST_EXECUTION_END");
  const end = performance.now();

  return end - start;
}
