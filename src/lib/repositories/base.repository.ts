/**
 * 🏗️ BASE REPOSITORY - DIVINE KILO-SCALE PATTERN
 *
 * Foundation for all entity repositories following divine architecture.
 * Separates database concerns from business logic for maximum testability.
 *
 * Divine Patterns Applied:
 * - Repository pattern (single point of database access)
 * - Type-safe operations with Prisma
 * - Transaction support for complex operations
 * - Enlightening error messages
 * - Agricultural consciousness in logging
 *
 * @reference .github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md
 * @reference .github/instructions/07_DATABASE_QUANTUM_MASTERY.instructions.md
 */

import type { PrismaClient } from "@prisma/client";
import { database } from "@/lib/database";

import { logger } from '@/lib/monitoring/logger';

/**
 * Options for repository operations
 */
export interface RepositoryOptions {
  /** Transaction instance for coordinated operations */
  tx?: PrismaClient | any;
  /** Additional relations to include */
  include?: any;
  /** Fields to select */
  select?: any;
  /** Sort order */
  orderBy?: any;
  /** Number of records to skip */
  skip?: number;
  /** Maximum number of records to return */
  take?: number;
}

/**
 * Base Repository implementing CRUD operations with quantum consciousness
 *
 * @template TEntity - The entity type (e.g., Farm, Product, User)
 * @template TCreateData - Data required to create entity
 * @template TUpdateData - Data allowed for updates
 *
 * @example
 * ```typescript
 * export class FarmRepository extends BaseRepository<Farm, CreateFarmData, UpdateFarmData> {
 *   constructor() {
 *     super({ name: "farm" }, "FarmRepository");
 *   }
 *
 *   protected getDefaultInclude() {
 *     return { owner: true, products: true };
 *   }
 * }
 * ```
 */
export abstract class BaseRepository<
  TEntity extends Record<string, unknown> = Record<string, unknown>,
  TCreateData extends Record<string, unknown> = Record<string, unknown>,
  TUpdateData extends Record<string, unknown> = Partial<TCreateData>,
> {
  /**
   * Create a new base repository
   *
   * @param model - Prisma model configuration
   * @param repositoryName - Name for logging and errors
   */
  constructor(
    protected readonly model: { name: string },
    protected readonly repositoryName: string,
  ) {
    this.logOperation("initialized", {
      model: this.model.name,
      repository: this.repositoryName,
    });
  }

  /**
   * Get database instance (allows transaction injection)
   */
  protected get db(): PrismaClient {
    return database;
  }

  /**
   * Create a new entity in the database
   *
   * @param data - Entity creation data
   * @param options - Repository options (transaction, includes, etc.)
   * @returns Created entity with relations
   *
   * @example
   * ```typescript
   * const farm = await repository.create({
   *   name: "Divine Farm",
   *   ownerId: userId
   * });
   * ```
   */
  async create(
    data: TCreateData,
    options: RepositoryOptions = {},
  ): Promise<TEntity> {
    try {
      const db = options.tx || this.db;
      const defaultInclude = this.getDefaultInclude();
      const entity = await (db as any)[this.model.name].create({
        data,
        ...(Object.keys(defaultInclude).length > 0
          ? { include: defaultInclude }
          : {}),
        ...this.filterOptions(options),
      });

      this.logOperation("create", {
        entityId: (entity as any).id,
        hasTransaction: !!options.tx,
      });

      return entity as TEntity;
    } catch (error) {
      throw this.handleDatabaseError("create", error);
    }
  }

  /**
   * Find entity by unique ID
   *
   * @param id - Entity ID
   * @param options - Repository options
   * @returns Entity or null if not found
   *
   * @example
   * ```typescript
   * const farm = await repository.findById("farm_123");
   * if (farm) {
   *   logger.info("Found", { name: { data: farm.name } });
   * }
   * ```
   */
  async findById(
    id: string,
    options: RepositoryOptions = {},
  ): Promise<TEntity | null> {
    try {
      const db = options.tx || this.db;
      const defaultInclude = this.getDefaultInclude();
      const entity = await (db as any)[this.model.name].findUnique({
        where: { id },
        ...(Object.keys(defaultInclude).length > 0
          ? { include: defaultInclude }
          : {}),
        ...this.filterOptions(options),
      });

      return entity as TEntity | null;
    } catch (error) {
      throw this.handleDatabaseError("findById", error);
    }
  }

  /**
   * Find first entity matching criteria
   *
   * @param where - Query conditions
   * @param options - Repository options
   * @returns First matching entity or null
   */
  async findFirst(
    where: any = {},
    options: RepositoryOptions = {},
  ): Promise<TEntity | null> {
    try {
      const db = options.tx || this.db;
      const defaultInclude = this.getDefaultInclude();
      const entity = await (db as any)[this.model.name].findFirst({
        where,
        ...(Object.keys(defaultInclude).length > 0
          ? { include: defaultInclude }
          : {}),
        ...this.filterOptions(options),
      });

      return entity as TEntity | null;
    } catch (error) {
      throw this.handleDatabaseError("findFirst", error);
    }
  }

  /**
   * Find many entities by criteria
   *
   * @param where - Query conditions
   * @param options - Repository options (pagination, sorting, etc.)
   * @returns Array of matching entities
   *
   * @example
   * ```typescript
   * const farms = await repository.findMany(
   *   { isActive: true },
   *   { orderBy: { createdAt: "desc" }, take: 10 }
   * );
   * ```
   */
  async findMany(
    where: any = {},
    options: RepositoryOptions = {},
  ): Promise<TEntity[]> {
    try {
      const db = options.tx || this.db;
      const defaultInclude = this.getDefaultInclude();
      const entities = await (db as any)[this.model.name].findMany({
        where,
        ...(Object.keys(defaultInclude).length > 0
          ? { include: defaultInclude }
          : {}),
        ...this.filterOptions(options),
      });

      this.logOperation("findMany", {
        count: entities.length,
        hasWhere: Object.keys(where).length > 0,
      });

      return entities as TEntity[];
    } catch (error) {
      throw this.handleDatabaseError("findMany", error);
    }
  }

  /**
   * Update entity by ID
   *
   * @param id - Entity ID
   * @param data - Update data
   * @param options - Repository options
   * @returns Updated entity with relations
   *
   * @example
   * ```typescript
   * const farm = await repository.update("farm_123", {
   *   name: "Updated Farm Name"
   * });
   * ```
   */
  async update(
    id: string,
    data: TUpdateData,
    options: RepositoryOptions = {},
  ): Promise<TEntity> {
    try {
      const db = options.tx || this.db;
      const defaultInclude = this.getDefaultInclude();
      const entity = await (db as any)[this.model.name].update({
        where: { id },
        data,
        ...(Object.keys(defaultInclude).length > 0
          ? { include: defaultInclude }
          : {}),
        ...this.filterOptions(options),
      });

      this.logOperation("update", {
        entityId: id,
        hasTransaction: !!options.tx,
      });

      return entity as TEntity;
    } catch (error) {
      throw this.handleDatabaseError("update", error);
    }
  }

  /**
   * Update many entities matching criteria
   *
   * @param where - Query conditions
   * @param data - Update data
   * @param options - Repository options
   * @returns Count of updated records
   */
  async updateMany(
    where: any,
    data: TUpdateData,
    options: RepositoryOptions = {},
  ): Promise<number> {
    try {
      const db = options.tx || this.db;
      const result = await (db as any)[this.model.name].updateMany({
        where,
        data,
      });

      this.logOperation("updateMany", {
        count: result.count,
        hasTransaction: !!options.tx,
      });

      return result.count;
    } catch (error) {
      throw this.handleDatabaseError("updateMany", error);
    }
  }

  /**
   * Delete entity by ID
   *
   * @param id - Entity ID
   * @param options - Repository options
   *
   * @example
   * ```typescript
   * await repository.delete("farm_123");
   * ```
   */
  async delete(id: string, options: RepositoryOptions = {}): Promise<void> {
    try {
      const db = options.tx || this.db;
      await (db as any)[this.model.name].delete({
        where: { id },
      });

      this.logOperation("delete", {
        entityId: id,
        hasTransaction: !!options.tx,
      });
    } catch (error) {
      throw this.handleDatabaseError("delete", error);
    }
  }

  /**
   * Delete many entities matching criteria
   *
   * @param where - Query conditions
   * @param options - Repository options
   * @returns Count of deleted records
   */
  async deleteMany(
    where: any,
    options: RepositoryOptions = {},
  ): Promise<number> {
    try {
      const db = options.tx || this.db;
      const result = await (db as any)[this.model.name].deleteMany({
        where,
      });

      this.logOperation("deleteMany", {
        count: result.count,
        hasTransaction: !!options.tx,
      });

      return result.count;
    } catch (error) {
      throw this.handleDatabaseError("deleteMany", error);
    }
  }

  /**
   * Count entities matching criteria
   *
   * @param where - Query conditions
   * @param options - Repository options
   * @returns Total count
   *
   * @example
   * ```typescript
   * const totalActiveFarms = await repository.count({ isActive: true });
   * ```
   */
  async count(
    where: any = {},
    options: RepositoryOptions = {},
  ): Promise<number> {
    try {
      const db = options.tx || this.db;
      const count = await (db as any)[this.model.name].count({
        where,
      });

      return count;
    } catch (error) {
      throw this.handleDatabaseError("count", error);
    }
  }

  /**
   * Check if entity exists by ID
   *
   * @param id - Entity ID
   * @param options - Repository options
   * @returns True if entity exists
   *
   * @example
   * ```typescript
   * if (await repository.exists("farm_123")) {
   *   logger.info("Farm exists!");
   * }
   * ```
   */
  async exists(id: string, options: RepositoryOptions = {}): Promise<boolean> {
    const entity = await this.findById(id, options);
    return entity !== null;
  }

  /**
   * Execute operations within a database transaction
   *
   * Ensures all operations succeed or all fail together.
   * Critical for maintaining data consistency.
   *
   * @param callback - Function containing repository operations
   * @returns Result from callback
   *
   * @example
   * ```typescript
   * await repository.withTransaction(async (tx) => {
   *   const farm = await farmRepo.create(farmData, { tx });
   *   const product = await productRepo.create(productData, { tx });
   *   return { farm, product };
   * });
   * ```
   */
  async withTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    this.logOperation("transaction:start", {});

    try {
      const result = await this.db.$transaction(async (tx) => {
        return await callback(tx);
      });

      this.logOperation("transaction:commit", {});
      return result;
    } catch (error) {
      this.logOperation("transaction:rollback", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw this.handleDatabaseError("transaction", error);
    }
  }

  /**
   * Get default relations to include with queries
   * Each repository must define its own includes
   *
   * @returns Prisma include configuration
   *
   * @example
   * ```typescript
   * protected getDefaultInclude() {
   *   return {
   *     include: {
   *       owner: { select: { id: true, name: true } },
   *       products: { where: { isActive: true } }
   *     }
   *   };
   * }
   * ```
   */
  protected abstract getDefaultInclude(): any;

  /**
   * Handle database errors with enlightening messages
   *
   * Transforms Prisma errors into user-friendly messages
   * with agricultural consciousness.
   *
   * @param operation - Operation that failed
   * @param error - Original error
   * @returns Enhanced error with context
   */
  protected handleDatabaseError(operation: string, error: unknown): Error {
    const message = error instanceof Error ? error.message : "Unknown error";
    const errorMessage = `
╔════════════════════════════════════════════════════════════╗
║ 🚨 DATABASE OPERATION FAILED                               ║
╠════════════════════════════════════════════════════════════╣
║ Repository: ${this.repositoryName}
║ Operation: ${operation}
║ Model: ${this.model.name}
║
║ 💥 Error: ${message}
║
║ 🛠️  Troubleshooting:
║    1. Check database connection is active
║    2. Verify data matches schema constraints
║    3. Check for unique constraint violations
║    4. Ensure required fields are provided
║    5. Review transaction isolation if using transactions
╚════════════════════════════════════════════════════════════╝
    `.trim();

    // Log for debugging (development only)
    if (process.env.NODE_ENV === "development") {
      logger.error(`\n🚨 [${this.repositoryName}] ${operation} error:`, {
      error: error instanceof Error ? error.message : String(error),
    });
    }

    return new Error(errorMessage);
  }

  /**
   * Log successful operations (for debugging/monitoring)
   *
   * Only logs in development mode to avoid performance impact.
   * In production, use proper APM tools like Application Insights.
   *
   * @param operation - Operation performed
   * @param meta - Additional metadata
   */
  protected logOperation(
    operation: string,
    meta: Record<string, any> = {},
  ): void {
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      logger.info(
        `✅ [${timestamp}] [${this.repositoryName}] ${operation}`,
        Object.keys(meta).length > 0 ? meta : "",
      );
    }
  }

  /**
   * Filter repository options to only include Prisma-valid keys
   *
   * Prevents passing invalid options to Prisma queries
   *
   * @param options - Repository options
   * @returns Filtered options for Prisma
   */
  protected filterOptions(options: RepositoryOptions): any {
    const filtered: any = {};

    if (options.include !== undefined) {
      filtered.include = options.include;
    }

    if (options.select !== undefined) {
      filtered.select = options.select;
    }

    if (options.orderBy !== undefined) {
      filtered.orderBy = options.orderBy;
    }

    if (options.skip !== undefined) {
      filtered.skip = options.skip;
    }

    if (options.take !== undefined) {
      filtered.take = options.take;
    }

    return filtered;
  }
}

/**
 * Type helper for repository with transaction
 */
export type RepositoryWithTransaction<T extends BaseRepository> = T & {
  tx: any;
};

/**
 * Export divine perfection achieved ✨
 */
export default BaseRepository;
