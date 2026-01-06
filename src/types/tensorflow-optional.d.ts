/**
 * TypeScript Declaration Shim for Optional TensorFlow Dependencies
 *
 * These packages are in optionalDependencies and may not be installed
 * on all platforms (e.g., Vercel serverless). This declaration file
 * prevents TypeScript compile-time errors while allowing runtime
 * dynamic imports with proper error handling.
 *
 * @see src/lib/lazy/ml.lazy.ts - Runtime conditional loading
 */

declare module '@tensorflow/tfjs-node-gpu' {
  export * from '@tensorflow/tfjs-node';
}

declare module '@tensorflow/tfjs-node' {
  import * as tf from '@tensorflow/tfjs-core';

  export * from '@tensorflow/tfjs-core';

  export function ready(): Promise<void>;
  export function version_node: string;
  export function enableProdMode(): void;

  export const backend_name: string;
  export const backend: any;
}

declare module '@tensorflow/tfjs' {
  export * from '@tensorflow/tfjs-core';
}

declare module '@tensorflow/tfjs-core' {
  export interface Tensor<R extends Rank = Rank> {
    flatten(): Tensor1D;
    asScalar(): Scalar;
    as1D(): Tensor1D;
    as2D(rows: number, columns: number): Tensor2D;
    as3D(rows: number, columns: number, depth: number): Tensor3D;
    as4D(rows: number, columns: number, depth: number, depth2: number): Tensor4D;
    as5D(rows: number, columns: number, depth: number, depth2: number, depth3: number): Tensor5D;
    asType<T extends this>(dtype: DataType): T;
    rank: R;
    shape: ShapeMap[R];
    dtype: DataType;
    size: number;
    strides: number[];
    dataSync<D extends DataType = NumericDataType>(): DataTypeMap[D];
    data<D extends DataType = NumericDataType>(): Promise<DataTypeMap[D]>;
    dataToGPU(options?: DataToGPUOptions): GPUData;
    array(): Promise<ArrayMap[R]>;
    arraySync(): ArrayMap[R];
    dispose(): void;
  }

  export type Rank = 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';
  export type DataType = 'float32' | 'int32' | 'bool' | 'complex64' | 'string';
  export type NumericDataType = 'float32' | 'int32' | 'bool' | 'complex64';

  export interface DataTypeMap {
    float32: Float32Array;
    int32: Int32Array;
    bool: Uint8Array;
    complex64: Float32Array;
    string: string[];
  }

  export interface ShapeMap {
    R0: number[];
    R1: [number];
    R2: [number, number];
    R3: [number, number, number];
    R4: [number, number, number, number];
    R5: [number, number, number, number, number];
    R6: [number, number, number, number, number, number];
  }

  export interface ArrayMap {
    R0: number;
    R1: number[];
    R2: number[][];
    R3: number[][][];
    R4: number[][][][];
    R5: number[][][][][];
    R6: number[][][][][][];
  }

  export type Scalar = Tensor<'R0'>;
  export type Tensor1D = Tensor<'R1'>;
  export type Tensor2D = Tensor<'R2'>;
  export type Tensor3D = Tensor<'R3'>;
  export type Tensor4D = Tensor<'R4'>;
  export type Tensor5D = Tensor<'R5'>;
  export type Tensor6D = Tensor<'R6'>;

  export interface DataToGPUOptions {
    customTexShape?: [number, number];
  }

  export interface GPUData {
    tensorRef: Tensor;
    texture?: WebGLTexture;
    buffer?: GPUBuffer;
    texShape?: [number, number];
  }

  export function tensor<R extends Rank = Rank>(
    values: any,
    shape?: ShapeMap[R],
    dtype?: DataType
  ): Tensor<R>;

  export function dispose(container: any): void;
  export function tidy<T>(nameOrFn: string | (() => T), fn?: () => T): T;
  export function keep<T extends Tensor>(result: T): T;

  export const version: {
    'tfjs-core': string;
    'tfjs-backend-cpu'?: string;
    'tfjs-backend-webgl'?: string;
  };
}
