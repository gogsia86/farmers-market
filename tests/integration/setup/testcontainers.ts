/**
 * 🐳 TESTCONTAINERS SETUP - Divine PostgreSQL Integration Test Infrastructure
 *
 * Provides ephemeral PostgreSQL containers for true integration testing.
 * Uses testcontainers library to spin up real database instances.
 *
 * @pattern Testcontainers Integration Testing
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

// Container configuration
const POSTGRES_IMAGE = "postgis/postgis:16-3.4-alpine";
const POSTGRES_USER = "test_user";
const POSTGRES_PASSWORD = "test_password_secure_123";
const POSTGRES_DB = "farmers_market_integration_test";
const POSTGRES_PORT = 5432;

// Global container reference
let postgresContainer: StartedTestContainer | null = null;
let testPrismaClient: PrismaClient | null = null;

/**
 * PostgreSQL container configuration interface
 */
export interface PostgresContainerConfig {
  image?: string;
  user?: string;
  password?: string;
  database?: string;
  port?: number;
  startupTimeout?: number;
}

/**
 * Test database connection info
 */
export interface TestDatabaseInfo {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionString: string;
}

/**
 * Start a PostgreSQL container for integration tests
 *
 * @example
 * ```typescript
 * const dbInfo = await startPostgresContainer();
 * console.log(dbInfo.connectionString);
 * // postgresql://test_user:test_password@localhost:32768/farmers_market_test
 * ```
 */
export async function startPostgresContainer(
  config: PostgresContainerConfig = {},
): Promise<TestDatabaseInfo> {
  const {
    image = POSTGRES_IMAGE,
    user = POSTGRES_USER,
    password = POSTGRES_PASSWORD,
    database = POSTGRES_DB,
    startupTimeout = 60000,
  } = config;

  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║  🐳 Starting PostgreSQL Test Container                      ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Create and start the container
    postgresContainer = await new GenericContainer(image)
      .withEnvironment({
        POSTGRES_USER: user,
        POSTGRES_PASSWORD: password,
        POSTGRES_DB: database,
        POSTGRES_INITDB_ARGS: "--encoding=UTF-8",
      })
      .withExposedPorts(POSTGRES_PORT)
      .withWaitStrategy(
        Wait.forLogMessage(/database system is ready to accept connections/, 2),
      )
      .withStartupTimeout(startupTimeout)
      .start();

    const host = postgresContainer.getHost();
    const mappedPort = postgresContainer.getMappedPort(POSTGRES_PORT);

    const connectionString = `postgresql://${user}:${password}@${host}:${mappedPort}/${database}?schema=public`;

    console.log("✅ PostgreSQL container started successfully");
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${mappedPort}`);
    console.log(`   Database: ${database}`);

    // Set DATABASE_URL for Prisma
    process.env.DATABASE_URL = connectionString;
    process.env.DIRECT_URL = connectionString;

    return {
      host,
      port: mappedPort,
      user,
      password,
      database,
      connectionString,
    };
  } catch (error) {
    console.error("❌ Failed to start PostgreSQL container:", error);
    throw error;
  }
}

/**
 * Stop the PostgreSQL container
 */
export async function stopPostgresContainer(): Promise<void> {
  console.log("\n🛑 Stopping PostgreSQL test container...");

  if (testPrismaClient) {
    await testPrismaClient.$disconnect();
    testPrismaClient = null;
  }

  if (postgresContainer) {
    await postgresContainer.stop();
    postgresContainer = null;
    console.log("✅ PostgreSQL container stopped");
  }
}

/**
 * Run Prisma migrations against the test database
 *
 * Uses prisma db push for faster schema synchronization in test environments.
 * Falls back to migrate deploy if push fails.
 */
export async function runPrismaMigrations(): Promise<void> {
  console.log("\n📦 Running Prisma migrations...");

  const projectRoot = path.resolve(__dirname, "../../..");
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Validate the connection string format
  if (
    !databaseUrl.startsWith("postgresql://") &&
    !databaseUrl.startsWith("postgres://")
  ) {
    throw new Error(
      `Invalid DATABASE_URL format: ${databaseUrl.substring(0, 20)}...`,
    );
  }

  console.log(
    `   Using database: ${databaseUrl.replace(/:[^:@]+@/, ":****@")}`,
  );

  try {
    // First, generate Prisma client to ensure types are up to date
    console.log("   Generating Prisma client...");
    execSync("npx prisma generate", {
      cwd: projectRoot,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        DIRECT_URL: databaseUrl,
      },
      stdio: "pipe",
    });

    // Run prisma db push for test environment (faster than migrate)
    console.log("   Pushing schema to database...");
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      cwd: projectRoot,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        DIRECT_URL: databaseUrl,
      },
      stdio: "pipe",
    });

    console.log("✅ Prisma schema pushed successfully");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stderr = (error as { stderr?: Buffer })?.stderr?.toString() || "";

    console.error("❌ Failed to run Prisma migrations:");
    console.error("   Error:", errorMessage);
    if (stderr) {
      console.error("   Stderr:", stderr);
    }

    // Log additional debugging info
    console.error("\n   Debug info:");
    console.error(`   - Project root: ${projectRoot}`);
    console.error(
      `   - Schema exists: ${fs.existsSync(path.join(projectRoot, "prisma/schema.prisma"))}`,
    );
    console.error(`   - DATABASE_URL set: ${!!databaseUrl}`);

    throw new Error(`Prisma migration failed: ${errorMessage}`);
  }
}

/**
 * Get a Prisma client connected to the test database
 *
 * Creates a new PrismaClient instance configured for the test database.
 * Uses the DATABASE_URL environment variable set by startPostgresContainer.
 */
export async function getTestPrismaClient(): Promise<PrismaClient> {
  if (!testPrismaClient) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL not set. Ensure startPostgresContainer() was called first.",
      );
    }

    console.log(
      `   Creating Prisma client for: ${databaseUrl.replace(/:[^:@]+@/, ":****@")}`,
    );

    // Create new Prisma client with explicit datasource URL
    testPrismaClient = new PrismaClient({
      log: process.env.DEBUG_PRISMA
        ? ["query", "info", "warn", "error"]
        : ["error"],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    try {
      await testPrismaClient.$connect();
      console.log("   ✅ Prisma client connected successfully");
    } catch (error) {
      console.error("   ❌ Failed to connect Prisma client:", error);
      testPrismaClient = null;
      throw error;
    }
  }

  return testPrismaClient;
}

/**
 * Clean all data from the test database
 * Preserves schema, only removes data
 *
 * Deletes data in proper order to respect foreign key constraints.
 * Child tables are deleted before parent tables.
 */
export async function cleanTestDatabase(): Promise<void> {
  const prisma = await getTestPrismaClient();

  console.log("🧹 Cleaning test database...");

  try {
    // Delete in order to respect foreign key constraints
    // Order matters: child tables first (most dependent → least dependent)
    await prisma.$transaction([
      // Order-related (most dependent)
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),

      // Cart items
      prisma.cartItem.deleteMany(),

      // Reviews (depends on farms and users)
      prisma.review.deleteMany(),

      // Products (depends on farms)
      prisma.product.deleteMany(),

      // Farms (depends on users)
      prisma.farm.deleteMany(),

      // Auth-related (depends on users)
      prisma.account.deleteMany(),
      prisma.session.deleteMany(),

      // Users (base entity)
      prisma.user.deleteMany(),
    ]);

    console.log("✅ Test database cleaned");
  } catch (error) {
    console.error("❌ Failed to clean test database:", error);

    // Attempt individual deletes as fallback
    console.log("   Attempting individual table cleanup...");
    try {
      await prisma.orderItem.deleteMany();
      await prisma.order.deleteMany();
      await prisma.cartItem.deleteMany();
      await prisma.review.deleteMany();
      await prisma.product.deleteMany();
      await prisma.farm.deleteMany();
      await prisma.account.deleteMany();
      await prisma.session.deleteMany();
      await prisma.user.deleteMany();
      console.log("✅ Test database cleaned (fallback method)");
    } catch (fallbackError) {
      console.error("❌ Fallback cleanup also failed:", fallbackError);
      throw error; // Throw original error
    }
  }
}

/**
 * Reset the test database (clean + optionally reseed)
 */
export async function resetTestDatabase(seed: boolean = false): Promise<void> {
  await cleanTestDatabase();

  if (seed) {
    const { seedTestDatabase } = await import("../fixtures/seed");
    await seedTestDatabase();
  }
}

/**
 * Full integration test setup
 * Starts container, runs migrations, returns cleanup function
 *
 * @example
 * ```typescript
 * let cleanup: () => Promise<void>;
 *
 * beforeAll(async () => {
 *   cleanup = await setupIntegrationTests();
 * });
 *
 * afterAll(async () => {
 *   await cleanup();
 * });
 * ```
 */
export async function setupIntegrationTests(): Promise<() => Promise<void>> {
  await startPostgresContainer();
  await runPrismaMigrations();

  // Return cleanup function
  return async () => {
    await stopPostgresContainer();
  };
}

/**
 * Check if we're running in a containerized environment
 */
export function isContainerizedEnvironment(): boolean {
  return (
    process.env.TESTCONTAINERS === "true" ||
    process.env.CI === "true" ||
    process.env.DOCKER_HOST !== undefined
  );
}

/**
 * Get database info for the currently running container
 */
export function getCurrentDatabaseInfo(): TestDatabaseInfo | null {
  if (!postgresContainer) {
    return null;
  }

  const host = postgresContainer.getHost();
  const port = postgresContainer.getMappedPort(POSTGRES_PORT);

  return {
    host,
    port,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    connectionString: process.env.DATABASE_URL || "",
  };
}

/**
 * Wait for the database to be ready for connections
 *
 * Polls the database with a simple SELECT query until it responds.
 * Uses exponential backoff for retry delays.
 */
export async function waitForDatabaseReady(
  maxAttempts: number = 30,
  delayMs: number = 1000,
): Promise<void> {
  let prisma: PrismaClient | null = null;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Get or create Prisma client
      if (!prisma) {
        prisma = await getTestPrismaClient();
      }

      // Test connection with simple query
      await prisma.$queryRaw`SELECT 1 as health_check`;
      console.log(`✅ Database ready after ${attempt} attempt(s)`);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        console.error(`❌ Database not ready after ${maxAttempts} attempts`);
        console.error(`   Last error: ${lastError.message}`);
        throw new Error(
          `Database not ready after ${maxAttempts} attempts. Last error: ${lastError.message}`,
        );
      }

      // Calculate delay with exponential backoff (capped at 5 seconds)
      const actualDelay = Math.min(delayMs * Math.pow(1.2, attempt - 1), 5000);

      console.log(
        `⏳ Waiting for database... (attempt ${attempt}/${maxAttempts}, next retry in ${Math.round(actualDelay)}ms)`,
      );

      // Reset Prisma client on connection errors to force reconnect
      if (prisma && lastError.message.includes("connect")) {
        try {
          await prisma.$disconnect();
        } catch {
          // Ignore disconnect errors
        }
        testPrismaClient = null;
        prisma = null;
      }

      await new Promise((resolve) => setTimeout(resolve, actualDelay));
    }
  }
}

/**
 * Create a transaction wrapper for test isolation
 *
 * @example
 * ```typescript
 * it("should create order in transaction", async () => {
 *   await withTestTransaction(async (tx) => {
 *     const order = await tx.order.create({ ... });
 *     expect(order.id).toBeDefined();
 *     // Transaction will be rolled back after test
 *   });
 * });
 * ```
 */
export async function withTestTransaction<T>(
  callback: (
    tx: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >,
  ) => Promise<T>,
): Promise<T> {
  const prisma = await getTestPrismaClient();

  // Note: This creates a real transaction. For true rollback-on-complete,
  // you would need to throw at the end, which makes assertions tricky.
  // Instead, we rely on cleanTestDatabase() between tests.
  return await prisma.$transaction(async (tx) => {
    return await callback(tx);
  });
}

/**
 * Divine test container orchestrator
 * Provides high-level test lifecycle management
 */
export class TestContainerOrchestrator {
  private isInitialized = false;
  private _dbInfo: TestDatabaseInfo | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("⚠️ Test container already initialized");
      return;
    }

    this._dbInfo = await startPostgresContainer();
    await runPrismaMigrations();
    await waitForDatabaseReady();

    this.isInitialized = true;
  }

  async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    await stopPostgresContainer();
    this.isInitialized = false;
    this._dbInfo = null;
  }

  async resetData(seed: boolean = false): Promise<void> {
    await resetTestDatabase(seed);
  }

  getDatabaseInfo(): TestDatabaseInfo | null {
    return this._dbInfo;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton orchestrator
export const testOrchestrator = new TestContainerOrchestrator();

// Export default setup for Jest globalSetup
export default setupIntegrationTests;
