/**
 * Mock implementation of TensorFlow.js GPU module for testing
 */

export const initializeGPU = jest.fn().mockResolvedValue(true);

export const gpuMatrixMultiply = jest.fn(
  (matrixA: number[][], matrixB: number[][]) => {
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

export const gpuArrayProcess = jest.fn(<T extends number>(data: T[]): T[] => {
  return data.map((x) => (x * x) as T);
});

export const gpuAgriculturalTransform = jest.fn(
  (cropYields: number[], weatherFactors: number[]): number[] => {
    return cropYields.map(
      (yield_val, i) => yield_val * weatherFactors[i] + yield_val * 0.1,
    );
  },
);

export const getGPUMemoryInfo = jest.fn(() => ({
  numTensors: 0,
  numDataBuffers: 0,
  numBytes: 0,
  unreliable: false,
}));

export const cleanupGPU = jest.fn();
