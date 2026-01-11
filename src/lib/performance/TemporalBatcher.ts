/**
 * TEMPORAL BATCHING SYSTEM
 * Batch operations across time dimension for massive performance gains
 * Following Divine Performance Reality Bending patterns
 */

export interface BatchedOperation<Input, Output> {
  input: Input;
  resolve: (output: Output) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

export interface TemporalBatcherConfig {
  windowMs: number; // Time window for batching (default: 16ms - one frame at 60fps)
  maxBatchSize?: number; // Maximum operations per batch
  enableMetrics?: boolean; // Track performance metrics
}

export interface BatchMetrics {
  totalBatches: number;
  totalOperations: number;
  averageBatchSize: number;
  averageLatency: number;
  savedOperations: number; // Operations saved by batching
}

/**
 * TEMPORAL BATCHER - Divine Performance Pattern
 * Collects operations over time window and executes them in a single batch
 */
export class TemporalBatcher<Input, Output> {
  private readonly pendingRequests: Map<
    string,
    Array<BatchedOperation<Input, Output>>
  > = new Map();

  private readonly executor: (inputs: Input[]) => Promise<Output[]>;
  private readonly windowMs: number;
  private readonly maxBatchSize: number;
  private readonly enableMetrics: boolean;
  private batchTimer: NodeJS.Timeout | null = null;

  // Performance metrics
  private metrics: BatchMetrics = {
    totalBatches: 0,
    totalOperations: 0,
    averageBatchSize: 0,
    averageLatency: 0,
    savedOperations: 0,
  };

  constructor(
    executor: (inputs: Input[]) => Promise<Output[]>,
    config: TemporalBatcherConfig = { windowMs: 16 },
  ) {
    this.executor = executor;
    this.windowMs = config.windowMs;
    this.maxBatchSize = config.maxBatchSize || 1000;
    this.enableMetrics = config.enableMetrics ?? true;
  }

  /**
   * Execute operation with temporal batching
   */
  async execute(input: Input, batchKey: string = "default"): Promise<Output> {
    return new Promise((resolve, reject) => {
      // Add to pending batch
      if (!this.pendingRequests.has(batchKey)) {
        this.pendingRequests.set(batchKey, []);
      }

      const batch = this.pendingRequests.get(batchKey)!;
      batch.push({
        input,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      // Track metrics
      if (this.enableMetrics) {
        this.metrics.totalOperations++;
      }

      // Check if we should execute immediately due to batch size
      if (batch.length >= this.maxBatchSize) {
        this.executeBatch(batchKey);
        return;
      }

      // Schedule batch execution if not already scheduled
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.executeAllBatches();
        }, this.windowMs);
      }
    });
  }

  /**
   * Execute all pending batches
   */
  private async executeAllBatches(): Promise<void> {
    const batchKeys = Array.from(this.pendingRequests.keys());
    this.batchTimer = null;

    await Promise.all(batchKeys.map((key: any) => this.executeBatch(key)));
  }

  /**
   * Execute a specific batch
   */
  private async executeBatch(batchKey: string): Promise<void> {
    const requests = this.pendingRequests.get(batchKey) ?? [];
    if (requests.length === 0) return;

    this.pendingRequests.delete(batchKey);

    const startTime = Date.now();

    try {
      // Execute all requests in single batch
      const inputs = requests.map((r: any) => r.input);
      const outputs = await this.executor(inputs);

      // Resolve all promises with proper undefined check
      requests.forEach((req, index) => {
        const output = outputs[index];
        if (output !== undefined) {
          req.resolve(output);
        } else {
          req.reject(new Error("Output undefined for batched operation"));
        }
      });

      // Update metrics
      if (this.enableMetrics) {
        this.updateMetrics(requests.length, Date.now() - startTime);
      }
    } catch (error) {
      // Reject all promises
      requests.forEach((req: any) => {
        req.reject(error as Error);
      });
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(batchSize: number, latency: number): void {
    this.metrics.totalBatches++;
    this.metrics.averageBatchSize =
      (this.metrics.averageBatchSize * (this.metrics.totalBatches - 1) +
        batchSize) /
      this.metrics.totalBatches;

    this.metrics.averageLatency =
      (this.metrics.averageLatency * (this.metrics.totalBatches - 1) +
        latency) /
      this.metrics.totalBatches;

    // Calculate saved operations (operations that would have been separate without batching)
    this.metrics.savedOperations += Math.max(0, batchSize - 1);
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): BatchMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalBatches: 0,
      totalOperations: 0,
      averageBatchSize: 0,
      averageLatency: 0,
      savedOperations: 0,
    };
  }

  /**
   * Flush all pending batches immediately
   */
  async flush(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    await this.executeAllBatches();
  }

  /**
   * Destroy the batcher and clean up
   */
  async destroy(): Promise<void> {
    await this.flush();
    this.pendingRequests.clear();
  }
}

/**
 * DATABASE QUERY BATCHER
 * Specialized batcher for database operations
 */
export class DatabaseQueryBatcher<T> extends TemporalBatcher<string, T> {
  constructor(
    fetchFunction: (ids: string[]) => Promise<T[]>,
    windowMs: number = 16,
  ) {
    super(fetchFunction, { windowMs, enableMetrics: true });
  }
}

/**
 * AGRICULTURAL OPERATION BATCHER
 * Specialized batcher for farm-related operations with seasonal awareness
 */
export interface SeasonalBatchConfig extends TemporalBatcherConfig {
  season?: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  respectSeasonalBoundaries?: boolean;
}

export class AgriculturalBatcher<Input, Output> extends TemporalBatcher<
  Input,
  Output
> {
  private readonly season?: string;
  private readonly respectSeasonalBoundaries: boolean;

  constructor(
    executor: (inputs: Input[]) => Promise<Output[]>,
    config: SeasonalBatchConfig = { windowMs: 16 },
  ) {
    super(executor, config);
    this.season = config.season;
    this.respectSeasonalBoundaries = config.respectSeasonalBoundaries ?? false;
  }

  /**
   * Execute with agricultural consciousness
   */
  async executeWithSeasonalAwareness(
    input: Input,
    currentSeason: string,
  ): Promise<Output> {
    // Validate seasonal alignment if enabled
    if (this.respectSeasonalBoundaries && this.season !== currentSeason) {
      throw new Error(
        `Seasonal mismatch: Expected ${this.season}, got ${currentSeason}`,
      );
    }

    return await this.execute(input, `season:${currentSeason}`);
  }
}

/**
 * Example Usage Patterns
 */

// Database user fetching with batching
export const createUserBatcher = () => {
  return new DatabaseQueryBatcher(
    async (userIds: string[]) => {
      // Single query fetches all users at once
      const { database } = await import("@/lib/database");
      return await database.user.findMany({
        where: { id: { in: userIds } },
      });
    },
    16, // 16ms batch window
  );
};

// Farm product fetching with batching
export const createProductBatcher = () => {
  return new DatabaseQueryBatcher(async (productIds: string[]) => {
    const { database } = await import("@/lib/database");
    return await database.product.findMany({
      where: { id: { in: productIds } },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }, 16);
};

// Export singleton instances for common operations
export const userBatcher = createUserBatcher();
export const productBatcher = createProductBatcher();
