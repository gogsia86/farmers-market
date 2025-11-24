/**
 * Mock implementation of Agricultural GPU Accelerator for testing
 */

export class AgriculturalGPUAccelerator {
  private initialized = false;
  private backend: "webgl" | "cpu" | "wasm" = "cpu"; // Default to CPU for tests

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async processAgriculturalData(data: number[][]): Promise<number[][]> {
    // Simple mock processing
    return data.map((row) =>
      row.map((val) => Math.min(255, Math.max(0, val * 1.1))),
    );
  }

  async batchProcess(
    batches: number[][][],
    operation: (batch: any) => any,
  ): Promise<number[][][]> {
    return batches.map((batch) => batch.map((row) => row.map((val) => val)));
  }

  getMemoryStats() {
    return {
      numTensors: 0,
      numDataBuffers: 0,
      numBytes: 0,
      unreliable: false,
    };
  }

  async dispose(): Promise<void> {
    this.initialized = false;
  }

  isGPUAvailable(): boolean {
    return false; // Mock always returns CPU mode
  }

  getBackend(): string {
    return "cpu";
  }
}

export const gpuAccelerator = new AgriculturalGPUAccelerator();
