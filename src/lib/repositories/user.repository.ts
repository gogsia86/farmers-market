/**
 * 👤 QUANTUM USER REPOSITORY
 * Divine user management with agricultural consciousness
 *
 * @module repositories/user
 * @version 2.0.0
 * @description
 * Implements comprehensive user management for the Farmers Market Platform.
 * Handles user profiles, authentication support, role-based queries,
 * and user verification with biodynamic energy.
 *
 * @divine_patterns
 * - Kilo-scale architecture compliance
 * - Role-based access patterns
 * - Secure credential handling
 * - Enlightening error messages
 * - Performance optimization for user queries
 *
 * @security_features
 * - Password field exclusion by default
 * - Token field protection
 * - Sensitive data filtering
 * - Audit trail support
 */

import { Prisma } from "@prisma/client";
import { BaseRepository, RepositoryOptions } from "./base.repository";

/**
 * QuantumUser type with safe relations (no password)
 */
export type QuantumUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    firstName: true;
    lastName: true;
    name: true;
    phone: true;
    avatar: true;
    role: true;
    status: true;
    emailVerified: true;
    emailVerifiedAt: true;
    phoneVerified: true;
    phoneVerifiedAt: true;
    dietaryPreferences: true;
    notificationPreferences: true;
    lastLoginAt: true;
    loginCount: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

/**
 * User with authentication data (includes password hash)
 * ⚠️ USE WITH EXTREME CAUTION - Contains sensitive data
 */
export type UserWithAuth = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    password: true;
    role: true;
    status: true;
    emailVerified: true;
  };
}>;

/**
 * User search filters
 */
export interface UserSearchFilters {
  role?: string;
  status?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  searchTerm?: string;
  createdFrom?: Date;
  createdTo?: Date;
}

/**
 * User statistics
 */
export interface UserStatistics {
  totalUsers: number;
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
  verifiedUsers: number;
  activeUsers: number;
}

/**
 * User profile update data
 */
export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  dietaryPreferences?: any;
  notificationPreferences?: any;
}

/**
 * 🌟 QUANTUM USER REPOSITORY
 *
 * Manages user accounts, profiles, and authentication with divine consciousness.
 * Provides secure user operations with proper data isolation.
 *
 * @example
 * ```typescript
 * // Use singleton instance
 * import { userRepository } from "@/lib/repositories";
 *
 * // Find user safely (no password)
 * const user = await userRepository.findByEmail("user@example.com");
 *
 * // Find for authentication (includes password)
 * const authUser = await userRepository.findForAuthentication("user@example.com");
 *
 * // Find by role
 * const farmers = await userRepository.findByRole("FARMER");
 * ```
 */
export class QuantumUserRepository extends BaseRepository<
  QuantumUser,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor() {
    super({ name: "user" }, "QuantumUserRepository");
  }

  /**
   * 🌾 MANIFEST USER
   * Create a new user with divine consciousness
   *
   * @param data User creation data
   * @param options Repository options
   * @returns Created user (without password)
   */
  async manifestUser(
    data: Prisma.UserCreateInput,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser> {
    this.logOperation("manifestUser:start", {
      email: data.email,
      role: data.role,
      agriculturalConsciousness: "DIVINE",
    });

    try {
      const db = options.tx || this.db;

      const user = (await db.user.create({
        data,
        select: this.getSafeUserSelect(),
      })) as QuantumUser;

      this.logOperation("manifestUser:complete", {
        userId: user.id,
        email: user.email,
        role: user.role,
        biodynamicEnergy: "PURE",
      });

      return user;
    } catch (error) {
      throw this.handleDatabaseError("manifestUser", error);
    }
  }

  /**
   * Find user by email (safe - no password)
   *
   * @param email User email
   * @param options Repository options
   * @returns User or null
   */
  async findByEmail(
    email: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser | null> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.findUnique({
        where: { email: email.toLowerCase() },
        select: this.getSafeUserSelect(),
      })) as QuantumUser | null;

      if (user) {
        this.logOperation("findByEmail", { email, found: true });
      }

      return user;
    } catch (error) {
      throw this.handleDatabaseError("findByEmail", error);
    }
  }

  /**
   * 🔐 FIND FOR AUTHENTICATION
   * Get user with password hash for authentication
   * ⚠️ USE ONLY IN AUTH FLOWS
   *
   * @param email User email
   * @param options Repository options
   * @returns User with auth data or null
   */
  async findForAuthentication(
    email: string,
    options: RepositoryOptions = {},
  ): Promise<UserWithAuth | null> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          status: true,
          emailVerified: true,
        },
      })) as UserWithAuth | null;

      this.logOperation("findForAuthentication", {
        email,
        found: !!user,
        securityContext: "AUTHENTICATION",
      });

      return user;
    } catch (error) {
      throw this.handleDatabaseError("findForAuthentication", error);
    }
  }

  /**
   * Find user by ID (safe - no password)
   *
   * @param id User ID
   * @param options Repository options
   * @returns User or null
   */
  async findById(
    id: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser | null> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.findUnique({
        where: { id },
        select: this.getSafeUserSelect(),
      })) as QuantumUser | null;

      return user;
    } catch (error) {
      throw this.handleDatabaseError("findById", error);
    }
  }

  /**
   * Find users by role
   *
   * @param role User role
   * @param options Repository options
   * @returns Array of users
   */
  async findByRole(
    role: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser[]> {
    try {
      const db = options.tx || this.db;

      const users = (await db.user.findMany({
        where: { role: role as any },
        select: this.getSafeUserSelect(),
        orderBy: { createdAt: "desc" },
        ...this.filterOptions(options),
      })) as QuantumUser[];

      this.logOperation("findByRole", {
        role,
        count: users.length,
      });

      return users;
    } catch (error) {
      throw this.handleDatabaseError("findByRole", error);
    }
  }

  /**
   * Find users by status
   *
   * @param status User status
   * @param options Repository options
   * @returns Array of users
   */
  async findByStatus(
    status: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser[]> {
    try {
      const db = options.tx || this.db;

      const users = (await db.user.findMany({
        where: { status: status as any },
        select: this.getSafeUserSelect(),
        orderBy: { createdAt: "desc" },
        ...this.filterOptions(options),
      })) as QuantumUser[];

      return users;
    } catch (error) {
      throw this.handleDatabaseError("findByStatus", error);
    }
  }

  /**
   * Find active users
   *
   * @param options Repository options
   * @returns Array of active users
   */
  async findActiveUsers(
    options: RepositoryOptions = {},
  ): Promise<QuantumUser[]> {
    return await this.findByStatus("ACTIVE", options);
  }

  /**
   * Find farmers (users with FARMER role)
   *
   * @param options Repository options
   * @returns Array of farmers
   */
  async findFarmers(options: RepositoryOptions = {}): Promise<QuantumUser[]> {
    return await this.findByRole("FARMER", options);
  }

  /**
   * Find active farmers
   *
   * @param options Repository options
   * @returns Array of active farmers
   */
  async findActiveFarmers(
    options: RepositoryOptions = {},
  ): Promise<QuantumUser[]> {
    try {
      const db = options.tx || this.db;

      const farmers = (await db.user.findMany({
        where: {
          role: "FARMER",
          status: "ACTIVE",
        },
        select: this.getSafeUserSelect(),
        orderBy: { createdAt: "desc" },
        ...this.filterOptions(options),
      })) as QuantumUser[];

      this.logOperation("findActiveFarmers", {
        count: farmers.length,
      });

      return farmers;
    } catch (error) {
      throw this.handleDatabaseError("findActiveFarmers", error);
    }
  }

  /**
   * 🔍 SEARCH USERS
   * Search users with advanced filters
   *
   * @param filters Search filters
   * @param options Repository options
   * @returns Array of matching users
   */
  async searchUsers(
    filters: UserSearchFilters,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser[]> {
    const where = this.buildFilterWhere(filters);

    try {
      const db = options.tx || this.db;

      const users = (await db.user.findMany({
        where,
        select: this.getSafeUserSelect(),
        orderBy: { createdAt: "desc" },
        ...this.filterOptions(options),
      })) as QuantumUser[];

      this.logOperation("searchUsers", {
        filterCount: Object.keys(filters).length,
        resultsCount: users.length,
      });

      return users;
    } catch (error) {
      throw this.handleDatabaseError("searchUsers", error);
    }
  }

  /**
   * Update user profile
   *
   * @param userId User ID
   * @param profileData Profile update data
   * @param options Repository options
   * @returns Updated user
   */
  async updateProfile(
    userId: string,
    profileData: UserProfileUpdate,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.update({
        where: { id: userId },
        data: profileData,
        select: this.getSafeUserSelect(),
      })) as QuantumUser;

      this.logOperation("updateProfile", {
        userId,
        fieldsUpdated: Object.keys(profileData).length,
      });

      return user;
    } catch (error) {
      throw this.handleDatabaseError("updateProfile", error);
    }
  }

  /**
   * Update user password
   * ⚠️ Password should be hashed before calling this method
   *
   * @param userId User ID
   * @param hashedPassword Hashed password
   * @param options Repository options
   * @returns Updated user
   */
  async updatePassword(
    userId: string,
    hashedPassword: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
        select: this.getSafeUserSelect(),
      })) as QuantumUser;

      this.logOperation("updatePassword", {
        userId,
        securityContext: "PASSWORD_CHANGE",
      });

      return user;
    } catch (error) {
      throw this.handleDatabaseError("updatePassword", error);
    }
  }

  /**
   * Verify user email
   *
   * @param userId User ID
   * @param options Repository options
   * @returns Updated user
   */
  async verifyEmail(
    userId: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          verificationToken: null,
          verificationExpiry: null,
        },
        select: this.getSafeUserSelect(),
      })) as QuantumUser;

      this.logOperation("verifyEmail", { userId });

      return user;
    } catch (error) {
      throw this.handleDatabaseError("verifyEmail", error);
    }
  }

  /**
   * Set verification token
   *
   * @param userId User ID
   * @param token Verification token
   * @param expiryDate Token expiry date
   * @param options Repository options
   * @returns Updated user
   */
  async setVerificationToken(
    userId: string,
    token: string,
    expiryDate: Date,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.update({
        where: { id: userId },
        data: {
          verificationToken: token,
          verificationExpiry: expiryDate,
        },
        select: this.getSafeUserSelect(),
      })) as QuantumUser;

      return user;
    } catch (error) {
      throw this.handleDatabaseError("setVerificationToken", error);
    }
  }

  /**
   * Find user by verification token
   *
   * @param token Verification token
   * @param options Repository options
   * @returns User or null
   */
  async findByVerificationToken(
    token: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser | null> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.findUnique({
        where: { verificationToken: token },
        select: this.getSafeUserSelect(),
      })) as QuantumUser | null;

      return user;
    } catch (error) {
      throw this.handleDatabaseError("findByVerificationToken", error);
    }
  }

  /**
   * Set password reset token
   *
   * @param userId User ID
   * @param token Reset token
   * @param expiryDate Token expiry date
   * @param options Repository options
   * @returns Updated user
   */
  async setResetToken(
    userId: string,
    token: string,
    expiryDate: Date,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.update({
        where: { id: userId },
        data: {
          resetToken: token,
          resetTokenExpiry: expiryDate,
        },
        select: this.getSafeUserSelect(),
      })) as QuantumUser;

      return user;
    } catch (error) {
      throw this.handleDatabaseError("setResetToken", error);
    }
  }

  /**
   * Find user by reset token
   *
   * @param token Reset token
   * @param options Repository options
   * @returns User or null
   */
  async findByResetToken(
    token: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser | null> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.findUnique({
        where: { resetToken: token },
        select: this.getSafeUserSelect(),
      })) as QuantumUser | null;

      return user;
    } catch (error) {
      throw this.handleDatabaseError("findByResetToken", error);
    }
  }

  /**
   * Clear reset token
   *
   * @param userId User ID
   * @param options Repository options
   * @returns Updated user
   */
  async clearResetToken(
    userId: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.update({
        where: { id: userId },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
        select: this.getSafeUserSelect(),
      })) as QuantumUser;

      return user;
    } catch (error) {
      throw this.handleDatabaseError("clearResetToken", error);
    }
  }

  /**
   * Update last login
   *
   * @param userId User ID
   * @param ipAddress IP address
   * @param options Repository options
   * @returns Updated user
   */
  async updateLastLogin(
    userId: string,
    ipAddress?: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date(),
          lastLoginIP: ipAddress,
          loginCount: { increment: 1 },
        },
        select: this.getSafeUserSelect(),
      })) as QuantumUser;

      return user;
    } catch (error) {
      throw this.handleDatabaseError("updateLastLogin", error);
    }
  }

  /**
   * Update user status
   *
   * @param userId User ID
   * @param status New status
   * @param options Repository options
   * @returns Updated user
   */
  async updateStatus(
    userId: string,
    status: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.update({
        where: { id: userId },
        data: { status: status as any },
        select: this.getSafeUserSelect(),
      })) as QuantumUser;

      this.logOperation("updateStatus", {
        userId,
        newStatus: status,
      });

      return user;
    } catch (error) {
      throw this.handleDatabaseError("updateStatus", error);
    }
  }

  /**
   * Suspend user
   *
   * @param userId User ID
   * @param suspendedBy Admin ID
   * @param reason Suspension reason
   * @param options Repository options
   * @returns Updated user
   */
  async suspendUser(
    userId: string,
    suspendedBy: string,
    reason: string,
    options: RepositoryOptions = {},
  ): Promise<QuantumUser> {
    try {
      const db = options.tx || this.db;

      const user = (await db.user.update({
        where: { id: userId },
        data: {
          status: "SUSPENDED",
          suspendedBy,
          suspendedAt: new Date(),
          suspensionReason: reason,
        },
        select: this.getSafeUserSelect(),
      })) as QuantumUser;

      this.logOperation("suspendUser", {
        userId,
        suspendedBy,
      });

      return user;
    } catch (error) {
      throw this.handleDatabaseError("suspendUser", error);
    }
  }

  /**
   * 📊 GET USER STATISTICS
   * Calculate comprehensive user statistics
   *
   * @param options Repository options
   * @returns User statistics
   */
  async getUserStatistics(
    options: RepositoryOptions = {},
  ): Promise<UserStatistics> {
    try {
      const db = options.tx || this.db;

      const users = (await db.user.findMany({
        select: {
          id: true,
          role: true,
          status: true,
          emailVerified: true,
        },
      })) as any[];

      const totalUsers = users.length;
      const usersByRole: Record<string, number> = {};
      const usersByStatus: Record<string, number> = {};
      let verifiedUsers = 0;
      let activeUsers = 0;

      users.forEach((user) => {
        // Count by role
        usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;

        // Count by status
        usersByStatus[user.status] = (usersByStatus[user.status] || 0) + 1;

        // Count verified
        if (user.emailVerified) {
          verifiedUsers++;
        }

        // Count active
        if (user.status === "ACTIVE") {
          activeUsers++;
        }
      });

      const stats: UserStatistics = {
        totalUsers,
        usersByRole,
        usersByStatus,
        verifiedUsers,
        activeUsers,
      };

      this.logOperation("getUserStatistics", {
        totalUsers,
        activeUsers,
        verifiedUsers,
      });

      return stats;
    } catch (error) {
      throw this.handleDatabaseError("getUserStatistics", error);
    }
  }

  /**
   * Check if email exists
   *
   * @param email Email to check
   * @param options Repository options
   * @returns True if email exists
   */
  async emailExists(
    email: string,
    options: RepositoryOptions = {},
  ): Promise<boolean> {
    try {
      const db = options.tx || this.db;

      const count = await db.user.count({
        where: { email: email.toLowerCase() },
      });

      return count > 0;
    } catch (error) {
      throw this.handleDatabaseError("emailExists", error);
    }
  }

  /**
   * Build Prisma where clause from search filters
   *
   * @param filters Search filters
   * @returns Prisma where input
   * @private
   */
  private buildFilterWhere(filters: UserSearchFilters): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filters.role) {
      where.role = filters.role as any;
    }

    if (filters.status) {
      where.status = filters.status as any;
    }

    if (filters.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified;
    }

    if (filters.phoneVerified !== undefined) {
      where.phoneVerified = filters.phoneVerified;
    }

    if (filters.searchTerm) {
      where.OR = [
        { email: { contains: filters.searchTerm, mode: "insensitive" } },
        { name: { contains: filters.searchTerm, mode: "insensitive" } },
        { firstName: { contains: filters.searchTerm, mode: "insensitive" } },
        { lastName: { contains: filters.searchTerm, mode: "insensitive" } },
      ];
    }

    if (filters.createdFrom || filters.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) {
        where.createdAt.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        where.createdAt.lte = filters.createdTo;
      }
    }

    return where;
  }

  /**
   * Get safe user select (excludes password and sensitive fields)
   *
   * @private
   */
  private getSafeUserSelect() {
    return {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      status: true,
      emailVerified: true,
      emailVerifiedAt: true,
      phoneVerified: true,
      phoneVerifiedAt: true,
      dietaryPreferences: true,
      notificationPreferences: true,
      lastLoginAt: true,
      loginCount: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  /**
   * Get default include for user queries
   * Note: Most user queries use select instead for security
   *
   * @protected
   */
  protected getDefaultInclude() {
    return {};
  }
}

/**
 * Export singleton instance for application-wide use
 * Following divine pattern of single point of database access
 */
export const userRepository = new QuantumUserRepository();

/**
 * Divine user repository consciousness achieved ✨👤
 * Secure user management with agricultural awareness
 * Ready to scale from 1 to 1 billion users with quantum efficiency
 */
