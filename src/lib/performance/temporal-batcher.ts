/**
 * TEMPORAL BATCHING SYSTEM
 * Batches database operations across time windows for massive performance gains
 */

interface BatchOperation<T> {
  id: string;
  operation: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: number;
  timestamp: number;
}

interface BatcherConfig {
  windowMs: number;
  maxBatchSize: number;
  maxWaitMs: number;
}

export class TemporalBatcher<T> {
  private queue: BatchOperation<T>[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private processing = false;

  constructor(
    private readonly executor: (
      operations: Array<() => Promise<T>>,
    ) => Promise<T[]>,
    private readonly config: BatcherConfig = {
      windowMs: 16, // One frame at 60fps
      maxBatchSize: 100,
      maxWaitMs: 100,
    },
  ) {}

  async execute(operation: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchOp: BatchOperation<T> = {
        id: `${Date.now()}-${Math.random()}`,
        operation,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
      };

      this.queue.push(batchOp);

      // Sort by priority (higher first)
      this.queue.sort((a, b) => b.priority - a.priority);

      // Schedule batch execution
      this.scheduleBatch();
    });
  }

  private scheduleBatch(): void {
    if (this.batchTimer) return;

    // Check if we should execute immediately
    const oldestOp = this.queue[0];
    if (!oldestOp) return; // Guard against undefined
    const waitTime = Date.now() - oldestOp.timestamp;

    if (
      this.queue.length >= this.config.maxBatchSize ||
      waitTime >= this.config.maxWaitMs
    ) {
      this.executeBatch();
    } else {
      this.batchTimer = setTimeout(() => {
        this.executeBatch();
      }, this.config.windowMs);
    }
  }

  private async executeBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    this.batchTimer = null;

    const batch = this.queue.splice(0, this.config.maxBatchSize);

    try {
      const operations = batch.map((op: any) => op.operation);
      const results = await this.executor(operations);

      batch.forEach((op, index) => {
        const result = results[index];
        if (result !== undefined) {
          op.resolve(result);
        } else {
          op.reject(new Error("Result undefined for operation"));
        }
      });
    } catch (error) {
      batch.forEach((op: any) => {
        op.reject(error as Error);
      });
    } finally {
      this.processing = false;

      // Process remaining queue
      if (this.queue.length > 0) {
        this.scheduleBatch();
      }
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  async flush(): Promise<void> {
    while (this.queue.length > 0) {
      await this.executeBatch();
    }
  }
}

/**
 * DATABASE QUERY BATCHER
 * Batches database queries for optimal performance
 */
export class DatabaseQueryBatcher {
  private userBatcher: TemporalBatcher<any>;
  private farmBatcher: TemporalBatcher<any>;
  private productBatcher: TemporalBatcher<any>;

  constructor() {
    // User query batcher
    this.userBatcher = new TemporalBatcher(
      async (operations) => {
        return await Promise.all(operations.map((op: any) => op()));
      },
      { windowMs: 10, maxBatchSize: 50, maxWaitMs: 50 },
    );

    // Farm query batcher
    this.farmBatcher = new TemporalBatcher(
      async (operations) => {
        return await Promise.all(operations.map((op: any) => op()));
      },
      { windowMs: 16, maxBatchSize: 100, maxWaitMs: 100 },
    );

    // Product query batcher
    this.productBatcher = new TemporalBatcher(
      async (operations) => {
        return await Promise.all(operations.map((op: any) => op()));
      },
      { windowMs: 16, maxBatchSize: 100, maxWaitMs: 100 },
    );
  }

  async batchUserQuery<T>(query: () => Promise<T>): Promise<T> {
    return await this.userBatcher.execute(query);
  }

  async batchFarmQuery<T>(query: () => Promise<T>): Promise<T> {
    return await this.farmBatcher.execute(query);
  }

  async batchProductQuery<T>(query: () => Promise<T>): Promise<T> {
    return await this.productBatcher.execute(query);
  }

  async flushAll(): Promise<void> {
    await Promise.all([
      this.userBatcher.flush(),
      this.farmBatcher.flush(),
      this.productBatcher.flush(),
    ]);
  }

  getStats() {
    return {
      userQueueSize: this.userBatcher.getQueueSize(),
      farmQueueSize: this.farmBatcher.getQueueSize(),
      productQueueSize: this.productBatcher.getQueueSize(),
    };
  }
}

// Global singleton
let batcherInstance: DatabaseQueryBatcher | null = null;

export function getDatabaseBatcher(): DatabaseQueryBatcher {
  if (!batcherInstance) {
    batcherInstance = new DatabaseQueryBatcher();
  }
  return batcherInstance;
}
