/**
 * GPU TYPE DEFINITIONS
 * Divine types for RTX 2070 Max-Q GPU acceleration
 */

// WebGPU types (for reference - define as any for Node.js environment)
type GPUBindGroup = any; // WebGPU type from browser API
type GPUComputePipeline = any; // WebGPU compute pipeline
// Minimal WebGPU type aliases (use browser/WebGPU lib in real runtime)
type GPUBuffer = any; // WebGPU buffer

// GPU kernel configuration
export interface GPUKernelConfig {
  name: string;
  dimensions: [number, number?, number?];
  constants?: Record<string, number | string | boolean>;
  pipeline?: GPUComputePipeline | boolean;
  immutable?: boolean;
  output?: [number, number?, number?];
  precision?: "single" | "unsigned";
  code?: string; // Shader/kernel code
  workgroupSize?: [number, number?, number?]; // WebGPU workgroup size
  buffers?: GPUBuffer[]; // GPU buffer bindings
  bindGroup?: GPUBindGroup; // WebGPU bind group
  bindGroupLayout?: GPUBindGroupLayout; // WebGPU bind group layout
  inputSize?: number; // Input data size
}

// GPU kernel function type
export interface GPUKernel<T = any> {
  (input: T): T;
  setOutput(output: [number, number?, number?]): GPUKernel<T>;
  setConstants(constants: Record<string, any>): GPUKernel<T>;
  destroy(): void;
}

// GPU configuration
export interface GPUConfig {
  mode: "gpu" | "cpu" | "auto";
  device?: string;
  fallbackToGPU?: boolean;
}

// CUDA information
export interface CUDAInfo {
  cores: number;
  computeCapability: string;
  totalMemory: number; // bytes
  freeMemory: number; // bytes
  clockRate: number; // MHz
  multiprocessorCount: number;
}

// GPU performance metrics
export interface GPUPerformanceMetrics {
  utilization: number; // Percentage
  memoryUsed: number; // bytes
  memoryTotal: number; // bytes
  temperature: number; // Celsius
  powerDraw: number; // Watts
  clockSpeed: number; // MHz
}

// GPU task
export interface GPUTask<Input = any, Output = any> {
  id: string;
  name: string;
  kernel: GPUKernel<Input>;
  input: Input;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  result?: Output;
  error?: Error;
  startTime?: Date;
  endTime?: Date;
}

// GPU computation result
export interface GPUComputationResult<T = any> {
  result: T;
  executionTime: number; // milliseconds
  memoryUsed: number; // bytes
  gpuUtilization: number; // percentage
}

// Matrix operations
export interface MatrixOperation {
  type: "MULTIPLY" | "ADD" | "SUBTRACT" | "TRANSPOSE" | "INVERSE";
  matrixA: number[][];
  matrixB?: number[][];
  result?: number[][];
}

// Image processing
export interface ImageProcessingConfig {
  width: number;
  height: number;
  channels: 3 | 4; // RGB or RGBA
  operations: ImageOperation[];
}

export type ImageOperation =
  | { type: "BLUR"; radius: number }
  | { type: "SHARPEN"; amount: number }
  | { type: "BRIGHTNESS"; value: number }
  | { type: "CONTRAST"; value: number }
  | { type: "GRAYSCALE" }
  | { type: "RESIZE"; width: number; height: number };

// TensorFlow.js types
export interface TensorFlowConfig {
  backend: "webgl" | "cpu" | "wasm";
  enableDebugMode?: boolean;
  enableProfiling?: boolean;
}

// Neural network layer
export interface NeuralNetworkLayer {
  type: "DENSE" | "CONV2D" | "MAXPOOL" | "DROPOUT" | "FLATTEN";
  units?: number;
  activation?: "relu" | "sigmoid" | "tanh" | "softmax";
  filters?: number;
  kernelSize?: [number, number];
  poolSize?: [number, number];
  rate?: number;
}

// Model training config
export interface ModelTrainingConfig {
  epochs: number;
  batchSize: number;
  validationSplit: number;
  optimizer: "adam" | "sgd" | "rmsprop";
  learningRate: number;
  loss: "categoricalCrossentropy" | "binaryCrossentropy" | "meanSquaredError";
  metrics: string[];
}

// GPU pool configuration
export interface GPUPoolConfig {
  maxWorkers: number;
  queueSize: number;
  timeout: number; // milliseconds
}

// GPU worker
export interface GPUWorker {
  id: string;
  status: "IDLE" | "BUSY" | "ERROR";
  currentTask?: string;
  tasksCompleted: number;
  totalExecutionTime: number;
}

// Export utility functions
export function createGPUKernelConfig(
  name: string,
  dimensions: [number, number?, number?],
  options?: Partial<GPUKernelConfig>
): GPUKernelConfig {
  return {
    name,
    dimensions,
    ...options,
  };
}

export function calculateGPUMemoryUsage(
  width: number,
  height: number,
  channels: number,
  bytesPerChannel: number = 4
): number {
  return width * height * channels * bytesPerChannel;
}
