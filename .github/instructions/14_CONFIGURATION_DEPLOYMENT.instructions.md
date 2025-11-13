---
applyTo: "**/*.{ts,tsx,js,jsx,json,yml,yaml,md}"
description: "Configuration management, deployment strategies, API design excellence, and development workflow optimization for enterprise applications"
---

# 14 | CONFIGURATION & DEPLOYMENT MASTERY

**Enterprise Configuration Management & Deployment Excellence**

## 🔗 Related Divine Instructions

- **[11 | Kilo Scale Architecture](./11_KILO_SCALE_ARCHITECTURE.instructions.md)** - Architecture foundation
- **[06 | Automation Infrastructure](./06_AUTOMATION_INFRASTRUCTURE.instructions.md)** - CI/CD and deployment
- **[12 | Error Handling & Validation](./12_ERROR_HANDLING_VALIDATION.instructions.md)** - Configuration validation
- **[13 | Testing & Performance](./13_TESTING_PERFORMANCE_MASTERY.instructions.md)** - Performance configuration

---

## ⚙️ HIERARCHICAL CONFIGURATION MASTERY

### Environment-Based Configuration Framework

```typescript
/**
 * COMPREHENSIVE CONFIGURATION SYSTEM
 * Type-safe, environment-aware configuration management
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  username?: string;
  password?: string;
  connectionString?: string;
  ssl: boolean;
  maxConnections: number;
  connectionTimeout: number;
  queryTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface CacheConfig {
  provider: "redis" | "memory" | "hybrid";
  redis?: {
    host: string;
    port: number;
    password?: string;
    keyPrefix: string;
    maxRetries: number;
  };
  defaultTTL: number;
  maxSize: number;
  compressionEnabled: boolean;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  corsOrigins: string[];
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
  };
}

export interface ExternalServiceConfig {
  payment: {
    provider: "stripe" | "paypal" | "square";
    baseUrl: string;
    apiKey: string;
    webhookSecret: string;
    timeout: number;
    retries: number;
  };
  email: {
    provider: "sendgrid" | "mailgun" | "ses";
    apiKey: string;
    fromAddress: string;
    templates: Record<string, string>;
  };
  geocoding: {
    provider: "google" | "mapbox" | "opencage";
    apiKey: string;
    rateLimit: number;
  };
  storage: {
    provider: "s3" | "gcs" | "azure" | "local";
    bucket?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;
    localPath?: string;
  };
}

export interface AppConfig {
  name: string;
  version: string;
  environment: "development" | "staging" | "production";
  port: number;
  logLevel: "debug" | "info" | "warn" | "error";
  baseUrl: string;
  database: DatabaseConfig;
  cache: CacheConfig;
  security: SecurityConfig;
  services: ExternalServiceConfig;
  features: FeatureFlags;
  monitoring: MonitoringConfig;
}

export interface FeatureFlags {
  enableNewDashboard: boolean;
  enableAdvancedSearch: boolean;
  enableRealTimeNotifications: boolean;
  enableBetaFeatures: boolean;
  maintenanceMode: boolean;
  enablePerformanceLogging: boolean;
}

export interface MonitoringConfig {
  sentry: {
    dsn?: string;
    environment: string;
    tracesSampleRate: number;
  };
  metrics: {
    enabled: boolean;
    endpoint?: string;
    interval: number;
  };
  healthCheck: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
}
```

### Configuration Validation & Loading

```typescript
/**
 * CONFIGURATION LOADER WITH VALIDATION
 * Validates configuration at startup with detailed error reporting
 */
import { z } from "zod";

const DatabaseConfigSchema = z
  .object({
    host: z.string().min(1, "Database host is required"),
    port: z.number().int().min(1).max(65535, "Invalid database port"),
    name: z.string().min(1, "Database name is required"),
    username: z.string().optional(),
    password: z.string().optional(),
    connectionString: z.string().optional(),
    ssl: z.boolean().default(false),
    maxConnections: z.number().int().min(1).max(100).default(10),
    connectionTimeout: z.number().int().min(1000).default(30000),
    queryTimeout: z.number().int().min(1000).default(60000),
    retryAttempts: z.number().int().min(0).max(10).default(3),
    retryDelay: z.number().int().min(100).default(1000),
  })
  .refine(
    (data) => data.connectionString || (data.username && data.password),
    "Either connectionString or username/password must be provided",
  );

const CacheConfigSchema = z
  .object({
    provider: z.enum(["redis", "memory", "hybrid"]),
    redis: z
      .object({
        host: z.string().min(1),
        port: z.number().int().min(1).max(65535),
        password: z.string().optional(),
        keyPrefix: z.string().default("fm:"),
        maxRetries: z.number().int().min(0).default(3),
      })
      .optional(),
    defaultTTL: z.number().int().min(1).default(300),
    maxSize: z.number().int().min(1).default(1000),
    compressionEnabled: z.boolean().default(true),
  })
  .refine(
    (data) => data.provider !== "redis" || data.redis,
    "Redis configuration required when using Redis provider",
  );

const SecurityConfigSchema = z.object({
  jwtSecret: z.string().min(32, "JWT secret must be at least 32 characters"),
  jwtExpiresIn: z
    .string()
    .regex(/^\d+[dhms]$/, "Invalid JWT expiration format"),
  bcryptRounds: z.number().int().min(10).max(15).default(12),
  corsOrigins: z.array(z.string().url()).default(["http://localhost:3000"]),
  rateLimiting: z.object({
    windowMs: z.number().int().min(1000).default(60000),
    maxRequests: z.number().int().min(1).default(100),
    skipSuccessfulRequests: z.boolean().default(false),
  }),
  encryption: z.object({
    algorithm: z.string().default("aes-256-gcm"),
    keyLength: z.number().int().default(32),
  }),
});

const AppConfigSchema = z.object({
  name: z.string().min(1, "App name is required"),
  version: z.string().regex(/^\d+\.\d+\.\d+/, "Invalid version format"),
  environment: z.enum(["development", "staging", "production"]),
  port: z.number().int().min(1).max(65535).default(3000),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  baseUrl: z.string().url("Invalid base URL"),
  database: DatabaseConfigSchema,
  cache: CacheConfigSchema,
  security: SecurityConfigSchema,
  // ... other schemas
});

export class ConfigurationLoader {
  private static instance: AppConfig | null = null;
  private readonly logger: StructuredLogger;

  constructor() {
    this.logger = LoggerFactory.getLogger("ConfigurationLoader");
  }

  static getInstance(): AppConfig {
    if (!this.instance) {
      const loader = new ConfigurationLoader();
      this.instance = loader.loadConfiguration();
    }
    return this.instance;
  }

  private loadConfiguration(): AppConfig {
    this.logger.info("Loading application configuration");

    try {
      // Load environment variables
      const rawConfig = this.loadEnvironmentVariables();

      // Validate configuration
      const validatedConfig = AppConfigSchema.parse(rawConfig);

      // Perform additional business validations
      this.validateBusinessRules(validatedConfig);

      // Log configuration summary (without secrets)
      this.logConfigurationSummary(validatedConfig);

      return validatedConfig;
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleValidationError(error);
      }

      this.logger.fatal("Failed to load configuration", error as Error);
      process.exit(1);
    }
  }

  private loadEnvironmentVariables(): any {
    return {
      name: process.env.APP_NAME || "Farmers Market",
      version: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      port: parseInt(process.env.PORT || "3000", 10),
      logLevel: process.env.LOG_LEVEL || "info",
      baseUrl: process.env.BASE_URL || "http://localhost:3000",

      database: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        name: process.env.DB_NAME || "farmers_market",
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === "true",
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || "10", 10),
        connectionTimeout: parseInt(
          process.env.DB_CONNECTION_TIMEOUT || "30000",
          10,
        ),
        queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || "60000", 10),
        retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || "3", 10),
        retryDelay: parseInt(process.env.DB_RETRY_DELAY || "1000", 10),
      },

      cache: {
        provider: process.env.CACHE_PROVIDER || "memory",
        redis:
          process.env.CACHE_PROVIDER === "redis"
            ? {
                host: process.env.REDIS_HOST || "localhost",
                port: parseInt(process.env.REDIS_PORT || "6379", 10),
                password: process.env.REDIS_PASSWORD,
                keyPrefix: process.env.REDIS_KEY_PREFIX || "fm:",
                maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || "3", 10),
              }
            : undefined,
        defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || "300", 10),
        maxSize: parseInt(process.env.CACHE_MAX_SIZE || "1000", 10),
        compressionEnabled: process.env.CACHE_COMPRESSION !== "false",
      },

      security: {
        jwtSecret: process.env.JWT_SECRET || this.generateSecretWarning(),
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
        corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
          "http://localhost:3000",
        ],
        rateLimiting: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "60000", 10),
          maxRequests: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
          skipSuccessfulRequests:
            process.env.RATE_LIMIT_SKIP_SUCCESS === "true",
        },
        encryption: {
          algorithm: process.env.ENCRYPTION_ALGORITHM || "aes-256-gcm",
          keyLength: parseInt(process.env.ENCRYPTION_KEY_LENGTH || "32", 10),
        },
      },

      services: {
        payment: {
          provider: process.env.PAYMENT_PROVIDER || "stripe",
          baseUrl: process.env.PAYMENT_BASE_URL || "",
          apiKey: process.env.PAYMENT_API_KEY || "",
          webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || "",
          timeout: parseInt(process.env.PAYMENT_TIMEOUT || "30000", 10),
          retries: parseInt(process.env.PAYMENT_RETRIES || "3", 10),
        },
        email: {
          provider: process.env.EMAIL_PROVIDER || "sendgrid",
          apiKey: process.env.EMAIL_API_KEY || "",
          fromAddress:
            process.env.EMAIL_FROM_ADDRESS || "noreply@farmersmarket.com",
          templates: {
            welcome: process.env.EMAIL_TEMPLATE_WELCOME || "welcome",
            resetPassword: process.env.EMAIL_TEMPLATE_RESET || "reset-password",
            orderConfirmation:
              process.env.EMAIL_TEMPLATE_ORDER || "order-confirmation",
          },
        },
        geocoding: {
          provider: process.env.GEOCODING_PROVIDER || "google",
          apiKey: process.env.GEOCODING_API_KEY || "",
          rateLimit: parseInt(process.env.GEOCODING_RATE_LIMIT || "100", 10),
        },
        storage: {
          provider: process.env.STORAGE_PROVIDER || "local",
          bucket: process.env.STORAGE_BUCKET,
          region: process.env.STORAGE_REGION,
          accessKey: process.env.STORAGE_ACCESS_KEY,
          secretKey: process.env.STORAGE_SECRET_KEY,
          localPath: process.env.STORAGE_LOCAL_PATH || "./uploads",
        },
      },

      features: {
        enableNewDashboard: process.env.ENABLE_NEW_DASHBOARD === "true",
        enableAdvancedSearch: process.env.ENABLE_ADVANCED_SEARCH === "true",
        enableRealTimeNotifications:
          process.env.ENABLE_REALTIME_NOTIFICATIONS === "true",
        enableBetaFeatures: process.env.ENABLE_BETA_FEATURES === "true",
        maintenanceMode: process.env.MAINTENANCE_MODE === "true",
        enablePerformanceLogging:
          process.env.ENABLE_PERFORMANCE_LOGGING === "true",
      },

      monitoring: {
        sentry: {
          dsn: process.env.SENTRY_DSN,
          environment: process.env.NODE_ENV || "development",
          tracesSampleRate: parseFloat(
            process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1",
          ),
        },
        metrics: {
          enabled: process.env.METRICS_ENABLED === "true",
          endpoint: process.env.METRICS_ENDPOINT,
          interval: parseInt(process.env.METRICS_INTERVAL || "60000", 10),
        },
        healthCheck: {
          enabled: process.env.HEALTH_CHECK_ENABLED !== "false",
          interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || "30000", 10),
          timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || "5000", 10),
        },
      },
    };
  }

  private validateBusinessRules(config: AppConfig): void {
    const errors: string[] = [];

    // Production-specific validations
    if (config.environment === "production") {
      if (config.security.jwtSecret.length < 64) {
        errors.push("Production JWT secret must be at least 64 characters");
      }

      if (!config.database.ssl) {
        errors.push("SSL must be enabled for production database connections");
      }

      if (config.corsOrigins.includes("*")) {
        errors.push("Wildcard CORS origins not allowed in production");
      }

      if (!config.monitoring.sentry.dsn) {
        errors.push("Sentry DSN is required in production");
      }
    }

    // Cache provider validations
    if (config.cache.provider === "redis" && !config.cache.redis) {
      errors.push(
        "Redis configuration required when using Redis cache provider",
      );
    }

    // External service validations
    if (
      config.services.payment.provider === "stripe" &&
      !config.services.payment.apiKey
    ) {
      errors.push(
        "Stripe API key is required when using Stripe payment provider",
      );
    }

    if (errors.length > 0) {
      throw new ValidationError(
        "Configuration validation failed",
        errors.join("; "),
      );
    }
  }

  private generateSecretWarning(): string {
    this.logger.warn(
      "Using default JWT secret - generate a secure secret for production",
    );
    return (
      "default-secret-key-change-in-production-" + Math.random().toString(36)
    );
  }

  private handleValidationError(error: z.ZodError): void {
    this.logger.error("Configuration validation failed");

    const errorMessages = error.errors.map((err) => {
      const path = err.path.join(".");
      return `${path}: ${err.message}`;
    });

    console.error("\n❌ Configuration Validation Errors:");
    errorMessages.forEach((msg) => console.error(`  • ${msg}`));
    console.error("\nPlease check your environment variables and try again.\n");
  }

  private logConfigurationSummary(config: AppConfig): void {
    const summary = {
      name: config.name,
      version: config.version,
      environment: config.environment,
      port: config.port,
      database: {
        host: config.database.host,
        port: config.database.port,
        name: config.database.name,
        ssl: config.database.ssl,
      },
      cache: {
        provider: config.cache.provider,
        redis: config.cache.redis
          ? {
              host: config.cache.redis.host,
              port: config.cache.redis.port,
            }
          : undefined,
      },
      features: config.features,
      monitoring: {
        sentry: { enabled: !!config.monitoring.sentry.dsn },
        metrics: { enabled: config.monitoring.metrics.enabled },
        healthCheck: { enabled: config.monitoring.healthCheck.enabled },
      },
    };

    this.logger.info("Configuration loaded successfully", summary);
  }
}

/**
 * CONFIGURATION PROVIDER
 * Global access to validated configuration
 */
export const config = ConfigurationLoader.getInstance();
```

---

## 🚀 DEPLOYMENT STRATEGIES EXCELLENCE

### Multi-Environment Deployment Framework

```typescript
/**
 * DEPLOYMENT CONFIGURATION MANAGEMENT
 * Environment-specific deployment strategies
 */
export interface DeploymentConfig {
  environment: string;
  strategy: "blue-green" | "rolling" | "canary" | "recreate";
  replicas: {
    min: number;
    max: number;
    target: number;
  };
  resources: {
    requests: {
      cpu: string;
      memory: string;
    };
    limits: {
      cpu: string;
      memory: string;
    };
  };
  healthCheck: {
    enabled: boolean;
    path: string;
    initialDelaySeconds: number;
    periodSeconds: number;
    timeoutSeconds: number;
    failureThreshold: number;
  };
  autoscaling: {
    enabled: boolean;
    targetCPUUtilization: number;
    targetMemoryUtilization: number;
  };
  ingress: {
    enabled: boolean;
    host: string;
    tls: boolean;
    annotations: Record<string, string>;
  };
}

export class DeploymentManager {
  private readonly logger: StructuredLogger;
  private readonly config: AppConfig;

  constructor() {
    this.logger = LoggerFactory.getLogger("DeploymentManager");
    this.config = ConfigurationLoader.getInstance();
  }

  getDeploymentConfig(): DeploymentConfig {
    const environment = this.config.environment;

    switch (environment) {
      case "development":
        return this.getDevelopmentConfig();
      case "staging":
        return this.getStagingConfig();
      case "production":
        return this.getProductionConfig();
      default:
        throw new Error(`Unknown environment: ${environment}`);
    }
  }

  private getDevelopmentConfig(): DeploymentConfig {
    return {
      environment: "development",
      strategy: "recreate",
      replicas: {
        min: 1,
        max: 1,
        target: 1,
      },
      resources: {
        requests: {
          cpu: "100m",
          memory: "256Mi",
        },
        limits: {
          cpu: "500m",
          memory: "512Mi",
        },
      },
      healthCheck: {
        enabled: true,
        path: "/api/health",
        initialDelaySeconds: 30,
        periodSeconds: 10,
        timeoutSeconds: 5,
        failureThreshold: 3,
      },
      autoscaling: {
        enabled: false,
        targetCPUUtilization: 70,
        targetMemoryUtilization: 80,
      },
      ingress: {
        enabled: false,
        host: "localhost",
        tls: false,
        annotations: {},
      },
    };
  }

  private getStagingConfig(): DeploymentConfig {
    return {
      environment: "staging",
      strategy: "rolling",
      replicas: {
        min: 2,
        max: 4,
        target: 2,
      },
      resources: {
        requests: {
          cpu: "250m",
          memory: "512Mi",
        },
        limits: {
          cpu: "1000m",
          memory: "1Gi",
        },
      },
      healthCheck: {
        enabled: true,
        path: "/api/health",
        initialDelaySeconds: 45,
        periodSeconds: 15,
        timeoutSeconds: 10,
        failureThreshold: 3,
      },
      autoscaling: {
        enabled: true,
        targetCPUUtilization: 70,
        targetMemoryUtilization: 80,
      },
      ingress: {
        enabled: true,
        host: "staging.farmersmarket.com",
        tls: true,
        annotations: {
          "nginx.ingress.kubernetes.io/rate-limit": "100",
          "nginx.ingress.kubernetes.io/ssl-redirect": "true",
        },
      },
    };
  }

  private getProductionConfig(): DeploymentConfig {
    return {
      environment: "production",
      strategy: "blue-green",
      replicas: {
        min: 3,
        max: 20,
        target: 5,
      },
      resources: {
        requests: {
          cpu: "500m",
          memory: "1Gi",
        },
        limits: {
          cpu: "2000m",
          memory: "2Gi",
        },
      },
      healthCheck: {
        enabled: true,
        path: "/api/health",
        initialDelaySeconds: 60,
        periodSeconds: 10,
        timeoutSeconds: 5,
        failureThreshold: 2,
      },
      autoscaling: {
        enabled: true,
        targetCPUUtilization: 60,
        targetMemoryUtilization: 70,
      },
      ingress: {
        enabled: true,
        host: "farmersmarket.com",
        tls: true,
        annotations: {
          "nginx.ingress.kubernetes.io/rate-limit": "1000",
          "nginx.ingress.kubernetes.io/ssl-redirect": "true",
          "nginx.ingress.kubernetes.io/proxy-body-size": "10m",
          "cert-manager.io/cluster-issuer": "letsencrypt-prod",
        },
      },
    };
  }

  async validateDeployment(): Promise<DeploymentValidationResult> {
    this.logger.info("Validating deployment configuration");

    const validations: ValidationCheck[] = [];

    // Validate configuration
    validations.push(await this.validateConfiguration());

    // Validate database connectivity
    validations.push(await this.validateDatabaseConnection());

    // Validate external services
    validations.push(await this.validateExternalServices());

    // Validate resource availability
    validations.push(await this.validateResourceAvailability());

    const allPassed = validations.every((check) => check.passed);
    const criticalFailures = validations.filter(
      (check) => !check.passed && check.critical,
    );

    return {
      passed: allPassed,
      criticalFailures: criticalFailures.length,
      checks: validations,
      timestamp: new Date(),
    };
  }

  private async validateConfiguration(): Promise<ValidationCheck> {
    try {
      // Configuration is already validated at startup
      return {
        name: "Configuration Validation",
        passed: true,
        critical: true,
        message: "Configuration is valid",
        duration: 0,
      };
    } catch (error) {
      return {
        name: "Configuration Validation",
        passed: false,
        critical: true,
        message: `Configuration validation failed: ${(error as Error).message}`,
        duration: 0,
      };
    }
  }

  private async validateDatabaseConnection(): Promise<ValidationCheck> {
    const startTime = Date.now();

    try {
      await prisma.$queryRaw`SELECT 1`;

      return {
        name: "Database Connection",
        passed: true,
        critical: true,
        message: "Database connection successful",
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: "Database Connection",
        passed: false,
        critical: true,
        message: `Database connection failed: ${(error as Error).message}`,
        duration: Date.now() - startTime,
      };
    }
  }

  private async validateExternalServices(): Promise<ValidationCheck> {
    const startTime = Date.now();
    const services = [];

    // Validate payment service
    if (this.config.services.payment.apiKey) {
      try {
        // This would be a real health check to the payment service
        services.push({ name: "Payment Service", status: "healthy" });
      } catch (error) {
        services.push({
          name: "Payment Service",
          status: "unhealthy",
          error: (error as Error).message,
        });
      }
    }

    // Validate email service
    if (this.config.services.email.apiKey) {
      try {
        // This would be a real health check to the email service
        services.push({ name: "Email Service", status: "healthy" });
      } catch (error) {
        services.push({
          name: "Email Service",
          status: "unhealthy",
          error: (error as Error).message,
        });
      }
    }

    const unhealthyServices = services.filter((s) => s.status === "unhealthy");

    return {
      name: "External Services",
      passed: unhealthyServices.length === 0,
      critical: false,
      message:
        unhealthyServices.length === 0
          ? `All ${services.length} external services are healthy`
          : `${unhealthyServices.length} of ${services.length} services are unhealthy`,
      duration: Date.now() - startTime,
      details: { services },
    };
  }

  private async validateResourceAvailability(): Promise<ValidationCheck> {
    const startTime = Date.now();

    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024;

      const deploymentConfig = this.getDeploymentConfig();
      const memoryLimitMB = parseInt(
        deploymentConfig.resources.limits.memory
          .replace("Mi", "")
          .replace("Gi", "000"),
      );

      const memoryUsagePercent = (heapUsedMB / memoryLimitMB) * 100;

      return {
        name: "Resource Availability",
        passed: memoryUsagePercent < 80,
        critical: false,
        message: `Memory usage: ${memoryUsagePercent.toFixed(1)}% of limit`,
        duration: Date.now() - startTime,
        details: {
          heapUsedMB: Math.round(heapUsedMB),
          memoryLimitMB,
          memoryUsagePercent: Math.round(memoryUsagePercent),
        },
      };
    } catch (error) {
      return {
        name: "Resource Availability",
        passed: false,
        critical: false,
        message: `Resource check failed: ${(error as Error).message}`,
        duration: Date.now() - startTime,
      };
    }
  }
}

interface ValidationCheck {
  name: string;
  passed: boolean;
  critical: boolean;
  message: string;
  duration: number;
  details?: any;
}

interface DeploymentValidationResult {
  passed: boolean;
  criticalFailures: number;
  checks: ValidationCheck[];
  timestamp: Date;
}
```

---

## 🌐 API DESIGN EXCELLENCE

### RESTful API Standards

```typescript
/**
 * STANDARDIZED API RESPONSE FORMAT
 * Consistent response structure across all endpoints
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  links?: ApiLinks;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  path?: string;
}

export interface ApiMeta {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
  requestId?: string;
  responseTime?: number;
  version?: string;
}

export interface ApiLinks {
  self?: string;
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
  related?: Record<string, string>;
}

/**
 * API RESPONSE BUILDER
 * Consistent response creation across controllers
 */
export class ApiResponseBuilder {
  static success<T>(
    data: T,
    meta?: Partial<ApiMeta>,
    links?: ApiLinks,
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: meta ? { ...meta, responseTime: Date.now() } : undefined,
      links,
    };
  }

  static error(
    code: string,
    message: string,
    details?: Record<string, any>,
    requestId?: string,
    path?: string,
  ): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId,
        path,
      },
    };
  }

  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    baseUrl: string,
    filters?: Record<string, any>,
  ): ApiResponse<T[]> {
    const pages = Math.ceil(pagination.total / pagination.limit);
    const hasNext = pagination.page < pages;
    const hasPrev = pagination.page > 1;

    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, String(value));
        }
      });
    }

    const buildUrl = (page: number) => {
      const params = new URLSearchParams(queryParams);
      params.set("page", String(page));
      params.set("limit", String(pagination.limit));
      return `${baseUrl}?${params.toString()}`;
    };

    return {
      success: true,
      data,
      meta: {
        pagination: {
          ...pagination,
          pages,
          hasNext,
          hasPrev,
        },
        filters,
      },
      links: {
        self: buildUrl(pagination.page),
        first: buildUrl(1),
        last: buildUrl(pages),
        next: hasNext ? buildUrl(pagination.page + 1) : undefined,
        prev: hasPrev ? buildUrl(pagination.page - 1) : undefined,
      },
    };
  }
}

/**
 * API VERSIONING STRATEGY
 * Handle multiple API versions gracefully
 */
export class ApiVersionManager {
  private static readonly SUPPORTED_VERSIONS = ["v1", "v2"];
  private static readonly DEFAULT_VERSION = "v1";
  private static readonly LATEST_VERSION = "v2";

  static getVersionFromRequest(request: NextRequest): string {
    // Check Accept header
    const acceptHeader = request.headers.get("Accept");
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(
        /application\/vnd\.farmersmarket\.v(\d+)\+json/,
      );
      if (versionMatch) {
        return `v${versionMatch[1]}`;
      }
    }

    // Check URL path
    const pathname = request.nextUrl.pathname;
    const pathMatch = pathname.match(/\/api\/(v\d+)\//);
    if (pathMatch) {
      return pathMatch[1];
    }

    // Check query parameter
    const version = request.nextUrl.searchParams.get("version");
    if (version) {
      return version.startsWith("v") ? version : `v${version}`;
    }

    return this.DEFAULT_VERSION;
  }

  static isVersionSupported(version: string): boolean {
    return this.SUPPORTED_VERSIONS.includes(version);
  }

  static getDeprecationWarning(version: string): string | null {
    if (version === "v1") {
      return "API v1 is deprecated and will be removed in 6 months. Please migrate to v2.";
    }
    return null;
  }

  static addVersionHeaders(
    response: NextResponse,
    version: string,
  ): NextResponse {
    response.headers.set("X-API-Version", version);
    response.headers.set("X-Latest-Version", this.LATEST_VERSION);

    const deprecationWarning = this.getDeprecationWarning(version);
    if (deprecationWarning) {
      response.headers.set("X-Deprecation-Warning", deprecationWarning);
    }

    return response;
  }
}

/**
 * RATE LIMITING CONFIGURATION
 * Protect API endpoints from abuse
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: (request: NextRequest) => string;
}

export class RateLimitManager {
  private static readonly limits = new Map<string, number>();
  private static readonly windows = new Map<string, number>();

  static createLimitConfig(
    endpoint: string,
    maxRequests: number,
    windowMs: number = 60000,
  ): RateLimitConfig {
    return {
      windowMs,
      maxRequests,
      message: `Too many requests to ${endpoint}. Please try again later.`,
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (request: NextRequest) => {
        const ip =
          request.ip || request.headers.get("x-forwarded-for") || "unknown";
        const userId = request.headers.get("x-user-id") || "anonymous";
        return `${endpoint}:${ip}:${userId}`;
      },
    };
  }

  static async checkRateLimit(
    request: NextRequest,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const key = config.keyGenerator(request);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean old entries
    this.cleanupOldEntries(windowStart);

    // Get current count
    const currentCount = this.getCurrentCount(key, windowStart);

    if (currentCount >= config.maxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: this.getResetTime(key, config.windowMs),
        message: config.message,
      };
    }

    // Record this request
    this.recordRequest(key, now);

    return {
      allowed: true,
      remainingRequests: config.maxRequests - currentCount - 1,
      resetTime: this.getResetTime(key, config.windowMs),
      message: "Request allowed",
    };
  }

  private static cleanupOldEntries(windowStart: number): void {
    for (const [key, timestamp] of this.windows.entries()) {
      if (timestamp < windowStart) {
        this.windows.delete(key);
        this.limits.delete(key);
      }
    }
  }

  private static getCurrentCount(key: string, windowStart: number): number {
    const windowTime = this.windows.get(key);
    if (!windowTime || windowTime < windowStart) {
      return 0;
    }
    return this.limits.get(key) || 0;
  }

  private static recordRequest(key: string, timestamp: number): void {
    if (!this.windows.has(key)) {
      this.windows.set(key, timestamp);
      this.limits.set(key, 1);
    } else {
      const current = this.limits.get(key) || 0;
      this.limits.set(key, current + 1);
    }
  }

  private static getResetTime(key: string, windowMs: number): number {
    const windowStart = this.windows.get(key);
    if (!windowStart) {
      return Date.now() + windowMs;
    }
    return windowStart + windowMs;
  }
}

interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  message: string;
}
```

---

## 🔧 DEVELOPMENT WORKFLOW OPTIMIZATION

### Development Environment Setup

```typescript
/**
 * DEVELOPMENT ENVIRONMENT MANAGER
 * Optimize development workflow and productivity
 */
export class DevelopmentEnvironmentManager {
  private readonly logger: StructuredLogger;
  private readonly config: AppConfig;

  constructor() {
    this.logger = LoggerFactory.getLogger("DevEnvironment");
    this.config = ConfigurationLoader.getInstance();
  }

  async initializeDevelopmentEnvironment(): Promise<void> {
    this.logger.info("Initializing development environment");

    try {
      // Setup development database
      await this.setupDevelopmentDatabase();

      // Initialize mock services
      await this.initializeMockServices();

      // Setup hot reloading
      this.setupHotReloading();

      // Configure development middleware
      this.configureDevelopmentMiddleware();

      // Setup development tools
      await this.setupDevelopmentTools();

      this.logger.info("Development environment initialized successfully");
    } catch (error) {
      this.logger.error(
        "Failed to initialize development environment",
        error as Error,
      );
      throw error;
    }
  }

  private async setupDevelopmentDatabase(): Promise<void> {
    if (this.config.environment !== "development") return;

    try {
      // Check if database exists and is accessible
      await prisma.$connect();

      // Run pending migrations
      this.logger.info("Running database migrations...");
      // This would typically run: npx prisma migrate dev

      // Seed development data if needed
      const recordCount = await prisma.user.count();
      if (recordCount === 0) {
        this.logger.info("Seeding development database...");
        await this.seedDevelopmentData();
      }
    } catch (error) {
      this.logger.error("Database setup failed", error as Error);
      throw error;
    }
  }

  private async seedDevelopmentData(): Promise<void> {
    // Create development users
    const developmentUsers = [
      {
        name: "John Farmer",
        email: "farmer@dev.com",
        role: "FARMER" as const,
        password: await hashPassword("dev123"),
      },
      {
        name: "Jane Customer",
        email: "customer@dev.com",
        role: "CUSTOMER" as const,
        password: await hashPassword("dev123"),
      },
      {
        name: "Admin User",
        email: "admin@dev.com",
        role: "ADMIN" as const,
        password: await hashPassword("dev123"),
      },
    ];

    for (const userData of developmentUsers) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
      });
    }

    // Create sample farms and products
    const farmer = await prisma.user.findFirst({ where: { role: "FARMER" } });
    if (farmer) {
      await this.createSampleFarms(farmer.id);
    }

    this.logger.info("Development data seeded successfully");
  }

  private async createSampleFarms(farmerId: string): Promise<void> {
    const sampleFarms = [
      {
        name: "Sunny Acres Farm",
        description: "Organic vegetables and fruits",
        address: "123 Farm Road, Farmville, CA 90210",
        ownerId: farmerId,
        status: "ACTIVE" as const,
      },
      {
        name: "Green Valley Ranch",
        description: "Sustainable agriculture and livestock",
        address: "456 Ranch Drive, Valley Town, CA 90211",
        ownerId: farmerId,
        status: "ACTIVE" as const,
      },
    ];

    for (const farmData of sampleFarms) {
      const farm = await prisma.farm.upsert({
        where: {
          name_ownerId: {
            name: farmData.name,
            ownerId: farmData.ownerId,
          },
        },
        update: {},
        create: farmData,
      });

      // Create sample products for each farm
      await this.createSampleProducts(farm.id);
    }
  }

  private async createSampleProducts(farmId: string): Promise<void> {
    const sampleProducts = [
      {
        name: "Organic Tomatoes",
        description: "Fresh, vine-ripened organic tomatoes",
        price: 4.99,
        unit: "lb",
        category: "VEGETABLES",
        inStock: true,
        quantity: 100,
      },
      {
        name: "Free-Range Eggs",
        description: "Farm-fresh eggs from free-range chickens",
        price: 6.99,
        unit: "dozen",
        category: "DAIRY_EGGS",
        inStock: true,
        quantity: 50,
      },
      {
        name: "Organic Apples",
        description: "Crisp, sweet organic apples",
        price: 3.99,
        unit: "lb",
        category: "FRUITS",
        inStock: true,
        quantity: 75,
      },
    ];

    for (const productData of sampleProducts) {
      await prisma.product.upsert({
        where: {
          name_farmId: {
            name: productData.name,
            farmId: farmId,
          },
        },
        update: {},
        create: {
          ...productData,
          farmId,
        },
      });
    }
  }

  private async initializeMockServices(): Promise<void> {
    if (this.config.environment !== "development") return;

    // Mock external services for development
    this.logger.info("Initializing mock services");

    // Mock payment service
    this.setupMockPaymentService();

    // Mock email service
    this.setupMockEmailService();

    // Mock geocoding service
    this.setupMockGeocodingService();
  }

  private setupMockPaymentService(): void {
    // This would setup a mock payment service that returns success responses
    this.logger.debug("Mock payment service initialized");
  }

  private setupMockEmailService(): void {
    // This would setup a mock email service that logs emails instead of sending
    this.logger.debug("Mock email service initialized");
  }

  private setupMockGeocodingService(): void {
    // This would setup a mock geocoding service with default coordinates
    this.logger.debug("Mock geocoding service initialized");
  }

  private setupHotReloading(): void {
    if (this.config.environment !== "development") return;

    // Configure hot reloading for development
    this.logger.debug("Hot reloading configured");
  }

  private configureDevelopmentMiddleware(): void {
    if (this.config.environment !== "development") return;

    // Setup development-specific middleware
    // - Request logging
    // - CORS for local development
    // - Error stack traces
    this.logger.debug("Development middleware configured");
  }

  private async setupDevelopmentTools(): Promise<void> {
    if (this.config.environment !== "development") return;

    // Setup development tools
    // - API documentation
    // - Database browser
    // - Performance profiler
    this.logger.debug("Development tools configured");
  }
}
```

---

## ✅ CONFIGURATION & DEPLOYMENT CHECKLIST

### Configuration Management

- [ ] Environment-specific configuration files
- [ ] Configuration validation at startup
- [ ] Secure secret management
- [ ] Feature flags implementation
- [ ] Configuration hot reloading
- [ ] Environment variable documentation
- [ ] Configuration testing
- [ ] Default value fallbacks

### Deployment Strategy

- [ ] Multi-environment deployment configs
- [ ] Health check endpoints
- [ ] Graceful shutdown handling
- [ ] Resource limits configured
- [ ] Auto-scaling policies
- [ ] Load balancing setup
- [ ] SSL/TLS certificates
- [ ] Monitoring and alerting

### API Design

- [ ] Consistent response format
- [ ] Proper HTTP status codes
- [ ] API versioning strategy
- [ ] Rate limiting implementation
- [ ] Request/response logging
- [ ] API documentation (OpenAPI)
- [ ] Error handling standards
- [ ] Authentication/authorization

### Development Workflow

- [ ] Development environment automation
- [ ] Database seeding scripts
- [ ] Mock service setup
- [ ] Hot reloading configuration
- [ ] Development tool integration
- [ ] Code quality checks
- [ ] Pre-commit hooks
- [ ] Local testing environment

---

**Remember**: Configuration and deployment are the foundation that supports all other aspects of your application. Get them right, and everything else becomes easier.

_"A well-configured application is a joy to deploy, monitor, and maintain."_
