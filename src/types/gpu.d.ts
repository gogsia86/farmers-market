/**
 * TensorFlow.js GPU Type Definitions
 * For GPU acceleration using RTX 2070 Max-Q via TensorFlow.js WebGL backend
 */

// TensorFlow.js is already properly typed via @tensorflow/tfjs package
// These are supplementary types for our agricultural GPU operations

declare global {
  interface GPUComputationResult {
    data: Float32Array | number[];
    shape: number[];
    dispose(): void;
  }

  interface GPUKernelFunction {
    (...args: number[][]): GPUComputationResult;
  }

  interface TensorflowGPUBackend {
    name: string;
    isGPU: boolean;
  }
}
