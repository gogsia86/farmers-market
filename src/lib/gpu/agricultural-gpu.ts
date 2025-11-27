/**
 * Agricultural GPU Acceleration using TensorFlow.js
 * Divine patterns for RTX 2070 Max-Q optimization
 *
 * ⚡ PERFORMANCE: Uses lazy loading for TensorFlow (~80-120 KB savings)
 */

import { loadTensorFlow } from "@/lib/lazy/ml.lazy";
import type * as tf from "@tensorflow/tfjs";

export interface AgriculturalGPUConfig {
  preferredBackend?: "webgl" | "cpu" | "wasm";
}

export class AgriculturalGPUAccelerator {
  private initialized = false;
  private backend: "webgl" | "cpu" | "wasm" = "webgl";
  private tf: typeof tf | null = null;

  async initialize(config?: AgriculturalGPUConfig): Promise<void> {
    try {
      // Lazy load TensorFlow
      this.tf = await loadTensorFlow();

      // Set preferred backend
      if (config?.preferredBackend) {
        this.backend = config.preferredBackend;
      }

      // Initialize TensorFlow.js with WebGL backend for GPU acceleration
      await this.tf.setBackend(this.backend);
      await this.tf.ready();

      this.initialized = true;

      console.log("🚀 Agricultural GPU Accelerator initialized", {
        backend: this.tf.getBackend(),
        numTensors: this.tf.memory().numTensors,
        numDataBuffers: this.tf.memory().numDataBuffers,
      });
    } catch (error) {
      console.warn(
        "⚠️ GPU acceleration unavailable, falling back to CPU",
        error,
      );
      if (this.tf) {
        await this.tf.setBackend("cpu");
      }
      this.backend = "cpu";
      this.initialized = true;
    }
  }

  /**
   * Process large agricultural dataset using GPU acceleration
   */
  async processAgriculturalData(data: number[][]): Promise<number[][]> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.tf) {
      throw new Error("TensorFlow not initialized");
    }

    return this.tf.tidy(() => {
      // Convert to tensor
      const inputTensor = this.tf!.tensor2d(data);

      // GPU-accelerated operations
      const normalized = inputTensor.div(this.tf!.scalar(255));
      const enhanced = normalized
        .mul(this.tf!.scalar(1.2))
        .sub(this.tf!.scalar(0.1));
      const clipped = enhanced.clipByValue(0, 1).mul(this.tf!.scalar(255));

      // Convert back to array
      return clipped.arraySync() as number[][];
    });
  }

  /**
   * Batch process agricultural images/data
   */
  async batchProcess(
    batches: number[][][],
    operation: (batch: tf.Tensor3D) => tf.Tensor3D,
  ): Promise<number[][][][]> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.tf) {
      throw new Error("TensorFlow not initialized");
    }

    const results: number[][][][] = [];

    for (const batch of batches) {
      const result = this.tf.tidy(() => {
        const tensor = this.tf!.tensor3d(batch as number[][][]);
        const processed = operation(tensor);
        return processed.arraySync() as number[][][];
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Get GPU memory usage statistics
   */
  getMemoryStats() {
    if (!this.tf) {
      throw new Error("TensorFlow not initialized");
    }
    const memory = this.tf.memory();
    return {
      numTensors: memory.numTensors,
      numDataBuffers: memory.numDataBuffers,
      numBytes: memory.numBytes,
      unreliable: memory.unreliable,
    };
  }

  /**
   * Clean up GPU resources
   */
  async dispose(): Promise<void> {
    if (this.tf) {
      this.tf.disposeVariables();
    }
    this.initialized = false;
    this.tf = null;
  }

  /**
   * Check if GPU acceleration is available
   */
  isGPUAvailable(): boolean {
    return this.backend === "webgl";
  }

  /**
   * Get current backend
   */
  getBackend(): string {
    if (!this.tf) {
      throw new Error("TensorFlow not initialized");
    }
    return this.tf.getBackend();
  }
}

// Singleton instance
export const gpuAccelerator = new AgriculturalGPUAccelerator();
