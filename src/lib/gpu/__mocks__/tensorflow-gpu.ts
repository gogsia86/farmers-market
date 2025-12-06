/**
 * Mock implementation of TensorFlow.js GPU module for testing
 * Phase 6 - Day 3: Updated to match async function signatures
 */

export const initializeGPU = jest.fn().mockResolvedValue(true);

export const gpuMatrixMultiply = jest.fn(
  async (matrixA: number[][], matrixB: number[][]): Promise<number[][]> => {
    // Simple CPU-based matrix multiplication for testing
    const result: number[][] = [];
    for (let i = 0; i < matrixA.length; i++) {
      result[i] = [];
      for (let j = 0; j < matrixB[0].length; j++) {
        result[i][j] = 0;
        for (let k = 0; k < matrixA[0].length; k++) {
          result[i][j] += matrixA[i][k] * matrixB[k][j];
        }
      }
    }
    return result;
  },
);

export const gpuArrayProcess = jest.fn(
  async <T extends number>(data: T[]): Promise<T[]> => {
    return data.map((x) => (x * x) as T);
  },
);

export const gpuAgriculturalTransform = jest.fn(
  async (cropYields: number[], weatherFactors: number[]): Promise<number[]> => {
    return cropYields.map(
      (yield_val, i) => yield_val * weatherFactors[i] + yield_val * 0.1,
    );
  },
);

export const getGPUMemoryInfo = jest.fn().mockResolvedValue({
  numTensors: 0,
  numDataBuffers: 0,
  numBytes: 0,
  unreliable: false,
});

export const cleanupGPU = jest.fn().mockResolvedValue(undefined);
