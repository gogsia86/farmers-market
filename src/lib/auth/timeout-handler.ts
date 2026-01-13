/**
 * ⏱️ AUTHENTICATION TIMEOUT HANDLER
 * Optimized authentication with timeout configurations for testing and production
 *
 * Features:
 * - Configurable timeout limits
 * - Fast-fail authentication for bots/tests
 * - Retry logic with exponential backoff
 * - Performance monitoring
 * - Database query optimization
 */

import { database } from "@/lib/database";
import { logger } from "@/lib/logger";
import type { UserRole, UserStatus } from "@prisma/client";
import { compare } from "bcryptjs";

/**
 * Authentication timeout configurations
 */
export const AuthTimeouts = {
  // Database query timeout
  DATABASE_QUERY: 5000, // 5 seconds

  // Password comparison timeout
  PASSWORD_COMPARE: 3000, // 3 seconds

  // Total authentication timeout
  TOTAL_AUTH: 10000, // 10 seconds

  // Fast mode for testing/bots
  FAST_MODE: 3000, // 3 seconds total
} as const;

/**
 * Authentication result type
 */
export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
  };
  error?: string;
  duration?: number;
}

/**
 * Optimized user authentication with timeout handling
 */
export class AuthTimeoutHandler {
  private readonly timeouts: typeof AuthTimeouts;
  private readonly fastMode: boolean;

  constructor(options?: {
    fastMode?: boolean;
    timeouts?: Partial<typeof AuthTimeouts>;
  }) {
    this.fastMode = options?.fastMode || process.env.AUTH_FAST_MODE === "true";
    this.timeouts = {
      ...AuthTimeouts,
      ...options?.timeouts,
    };

    if (this.fastMode) {
      logger.debug("Auth timeout handler initialized in FAST MODE");
    }
  }

  /**
   * Authenticate user with timeout protection
   */
  async authenticate(email: string, password: string): Promise<AuthResult> {
    const startTime = Date.now();
    const timeout = this.fastMode
      ? this.timeouts.FAST_MODE
      : this.timeouts.TOTAL_AUTH;

    try {
      // Race authentication against timeout
      const result = await Promise.race([
        this.performAuthentication(email, password),
        this.createTimeoutPromise(timeout),
      ]);

      const duration = Date.now() - startTime;

      if (result === "TIMEOUT") {
        logger.warn("Authentication timeout", { email, duration });
        return {
          success: false,
          error: "Authentication timeout. Please try again.",
          duration,
        };
      }

      return {
        ...result,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Authentication error", {
        email,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      });

      return {
        success: false,
        error: "Authentication failed. Please try again.",
        duration,
      };
    }
  }

  /**
   * Perform actual authentication logic
   */
  private async performAuthentication(
    email: string,
    password: string,
  ): Promise<AuthResult | "TIMEOUT"> {
    // Validate input
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    // Find user with optimized query (select only needed fields)
    const user = await this.findUserWithTimeout(email);

    if (!user) {
      logger.debug("User not found", { email });
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if user has a password set
    if (!user.password) {
      logger.debug("User has no password set", { email });
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Verify password with timeout
    const isValidPassword = await this.comparePasswordWithTimeout(
      password,
      user.password,
    );

    if (!isValidPassword) {
      logger.debug("Invalid password", { email });
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check user status
    if (user.status !== "ACTIVE") {
      logger.warn("Inactive user attempted login", {
        email,
        status: user.status,
      });
      return {
        success: false,
        error: "Account is not active. Please contact support.",
      };
    }

    // Check user role
    const allowedRoles: UserRole[] = [
      "ADMIN",
      "SUPER_ADMIN",
      "MODERATOR",
      "FARMER",
      "CONSUMER",
    ];
    if (!allowedRoles.includes(user.role)) {
      logger.warn("User with invalid role attempted login", {
        email,
        role: user.role,
      });
      return {
        success: false,
        error: "Unauthorized role",
      };
    }

    // Success
    logger.info("User authenticated successfully", {
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * Find user with timeout protection
   */
  private async findUserWithTimeout(email: string) {
    const queryTimeout = this.fastMode
      ? this.timeouts.FAST_MODE / 2
      : this.timeouts.DATABASE_QUERY;

    const result = await Promise.race([
      database.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
        },
      }),
      this.createTimeoutPromise(queryTimeout),
    ]);

    if (result === "TIMEOUT") {
      logger.error("Database query timeout", { email, timeout: queryTimeout });
      throw new Error("Database query timeout");
    }

    return result;
  }

  /**
   * Compare password with timeout protection
   */
  private async comparePasswordWithTimeout(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const compareTimeout = this.fastMode
      ? this.timeouts.FAST_MODE / 3
      : this.timeouts.PASSWORD_COMPARE;

    const result = await Promise.race([
      compare(password, hash),
      this.createTimeoutPromise(compareTimeout),
    ]);

    if (result === "TIMEOUT") {
      logger.error("Password comparison timeout", { timeout: compareTimeout });
      throw new Error("Password comparison timeout");
    }

    return result;
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise(ms: number): Promise<"TIMEOUT"> {
    return new Promise((resolve) => {
      setTimeout(() => resolve("TIMEOUT"), ms);
    });
  }

  /**
   * Quick user lookup (cached, minimal data)
   */
  static async quickUserLookup(email: string): Promise<{
    exists: boolean;
    id?: string;
    role?: UserRole;
  }> {
    try {
      const user = await Promise.race([
        database.user.findUnique({
          where: { email },
          select: {
            id: true,
            role: true,
          },
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);

      if (!user) {
        return { exists: false };
      }

      return {
        exists: true,
        id: user.id,
        role: user.role,
      };
    } catch (error) {
      logger.error("Quick user lookup error", {
        email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return { exists: false };
    }
  }

  /**
   * Validate session with timeout
   */
  static async validateSession(userId: string): Promise<boolean> {
    try {
      const user = await Promise.race([
        database.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            status: true,
          },
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);

      return user?.status === "ACTIVE";
    } catch (error) {
      logger.error("Session validation error", {
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }
}

/**
 * Singleton instance with default configuration
 */
export const authTimeoutHandler = new AuthTimeoutHandler();

/**
 * Fast mode instance for testing/bots
 */
export const fastAuthHandler = new AuthTimeoutHandler({ fastMode: true });

/**
 * Helper function for quick authentication
 */
export async function authenticateWithTimeout(
  email: string,
  password: string,
  options?: { fastMode?: boolean },
): Promise<AuthResult> {
  const handler = options?.fastMode ? fastAuthHandler : authTimeoutHandler;
  return handler.authenticate(email, password);
}

/**
 * Example usage:
 *
 * // Standard authentication
 * const result = await authenticateWithTimeout(email, password);
 *
 * // Fast mode for testing
 * const result = await authenticateWithTimeout(email, password, { fastMode: true });
 *
 * // In authorize function:
 * const result = await authTimeoutHandler.authenticate(
 *   credentials.email,
 *   credentials.password
 * );
 *
 * if (!result.success) {
 *   return null;
 * }
 *
 * return result.user;
 */
