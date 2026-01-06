/**
 * TypeScript Declaration Shim for Optional TensorFlow Dependencies
 *
 * These packages are in optionalDependencies and may not be installed
 * on all platforms (e.g., Vercel serverless). This declaration file
 * prevents TypeScript compile-time errors while allowing runtime
 * dynamic imports with proper error handling.
 *
 * Using 'any' type to avoid maintenance overhead while maintaining
 * type safety through runtime checks. The actual TensorFlow types
 * are used when the packages are available.
 *
 * @see src/lib/lazy/ml.lazy.ts - Runtime conditional loading
 */

declare module '@tensorflow/tfjs-node-gpu' {
  import * as tfNode from '@tensorflow/tfjs-node';
  export = tfNode;
}

declare module '@tensorflow/tfjs-node' {
  // Export everything from tfjs-core
  export * from '@tensorflow/tfjs-core';
  export { tf };

  // Node-specific exports
  export function ready(): Promise<void>;
  export const version_node: string;
  export function enableProdMode(): void;
  export const backend_name: string;
  export const backend: any;

  // Namespace export for 'import * as tf' pattern
  namespace tf {
    export type LayersModel = any;
    export type Sequential = any;
    export type Tensor = any;
    export type Tensor1D = any;
    export type Tensor2D = any;
    export type Tensor3D = any;
    export type Tensor4D = any;
  }
}

declare module '@tensorflow/tfjs' {
  // Export everything from tfjs-core
  export * from '@tensorflow/tfjs-core';
  export { tf };

  // Additional tfjs exports
  export function setBackend(name: string): Promise<boolean>;
  export function getBackend(): string;
  export function ready(): Promise<void>;

  export function memory(): {
    numTensors: number;
    numDataBuffers: number;
    numBytes: number;
    unreliable?: boolean;
  };

  export function env(): {
    get(key: string): any;
    set(key: string, value: any): void;
    getBool(key: string): boolean;
    getNumber(key: string): number;
    getFlags(): Record<string, any>;
  };

  // Namespace export for 'import * as tf' pattern
  namespace tf {
    export type LayersModel = any;
    export type Sequential = any;
    export type Tensor = any;
    export type Tensor1D = any;
    export type Tensor2D = any;
    export type Tensor3D = any;
    export type Tensor4D = any;
  }
}

declare module '@tensorflow/tfjs-core' {
  // Basic type definitions
  export interface Tensor<R = any> {
    shape: number[];
    dtype: string;
    rank: number;
    size: number;
    dataSync(): any;
    data(): Promise<any>;
    array(): Promise<any>;
    arraySync(): any;
    dispose(): void;
    print(verbose?: boolean): void;

    // Operations
    add(x: Tensor | number): Tensor;
    sub(x: Tensor | number): Tensor;
    mul(x: Tensor | number): Tensor;
    div(x: Tensor | number): Tensor;
    square(): Tensor;
    expandDims(axis?: number): Tensor;
    mean(axis?: number | number[], keepDims?: boolean): Tensor;
    squeeze(axis?: number | number[]): Tensor;
    clipByValue(min: number, max: number): Tensor;

    // Type conversions
    asScalar(): any;
    as1D(): any;
    as2D(rows: number, cols: number): any;
    flatten(): any;
  }

  export type Tensor1D = Tensor;
  export type Tensor2D = Tensor;
  export type Tensor3D = Tensor;
  export type Tensor4D = Tensor;
  export type Scalar = Tensor;

  // Tensor creation
  export function tensor(values: any, shape?: number[], dtype?: string): Tensor;
  export function tensor1d(values: any, dtype?: string): Tensor1D;
  export function tensor2d(values: any, shape?: [number, number], dtype?: string): Tensor2D;
  export function tensor3d(values: any, shape?: [number, number, number], dtype?: string): Tensor3D;
  export function tensor4d(values: any, shape?: [number, number, number, number], dtype?: string): Tensor4D;
  export function scalar(value: number | Tensor): Scalar;

  // Operations
  export function matMul(a: Tensor, b: Tensor, transposeA?: boolean, transposeB?: boolean): Tensor;
  export function topk(x: Tensor, k?: number, sorted?: boolean): { values: Tensor; indices: Tensor };
  export function squeeze(x: Tensor, axis?: number | number[]): Tensor;

  // Memory management
  export function dispose(container: any): void;
  export function tidy<T>(fn: () => T): T;
  export function keep<T extends Tensor>(result: T): T;
  export function disposeVariables(): void;

  // Layers
  export namespace layers {
    export function dense(config: any): any;
    export function dropout(config: any): any;
    export function flatten(config?: any): any;
    export function lstm(config: any): any;
    export function conv1d(config: any): any;
    export function maxPooling1d(config: any): any;
  }

  // Models
  export function sequential(config?: any): any;
  export function loadLayersModel(pathOrIOHandler: string | any): Promise<any>;

  export interface LayersModel {
    predict(x: Tensor, config?: any): Tensor | Tensor[];
    compile(config: any): void;
    fit(x: Tensor, y: Tensor, config?: any): Promise<any>;
    evaluate(x: Tensor, y: Tensor, config?: any): Tensor | Tensor[];
    save(path: string): Promise<any>;
  }

  export interface Sequential extends LayersModel {
    add(layer: any): void;
    summary(): void;
  }

  // Training
  export namespace train {
    export function adam(learningRate?: number): any;
    export function sgd(learningRate?: number): any;
    export function rmsprop(learningRate?: number): any;
  }

  // Version info
  export const version: {
    'tfjs-core': string;
    tfjs?: string;
    'tfjs-backend-cpu'?: string;
    'tfjs-backend-webgl'?: string;
  };

  // Memory info type
  export interface MemoryInfo {
    numTensors: number;
    numDataBuffers: number;
    numBytes: number;
    unreliable?: boolean;
    reasons?: string[];
  }
}
