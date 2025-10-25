import { GPUAccelerator } from "@/lib/gpu/GPUAccelerator";

let gpuAccelerator: GPUAccelerator | null = null;

export async function setupGPUAccelerator(): Promise<void> {
  if (!gpuAccelerator) {
    gpuAccelerator = await GPUAccelerator.create();
  }
}

export async function cleanupGPUAccelerator(): Promise<void> {
  if (gpuAccelerator) {
    await gpuAccelerator.optimizeMemory();
    gpuAccelerator = null;
  }
}

export function getGPUAccelerator(): GPUAccelerator {
  if (!gpuAccelerator) {
    throw new Error("GPU Accelerator not initialized");
  }
  return gpuAccelerator;
}
