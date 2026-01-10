import { UserRole } from "@prisma/client";

import { logger } from '@/lib/monitoring/logger';

/**
 * Divine Role-Based Access Control (RBAC) System
 * Agricultural consciousness-driven permission management
 */

// Divine permission constants
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",
  BAN_USERS: "ban_users",

  // Farm Management
  VIEW_FARMS: "view_farms",
  VERIFY_FARMS: "verify_farms",
  SUSPEND_FARMS: "suspend_farms",
  DELETE_FARMS: "delete_farms",

  // Order Management
  VIEW_ORDERS: "view_orders",
  EDIT_ORDERS: "edit_orders",
  CANCEL_ORDERS: "cancel_orders",
  REFUND_ORDERS: "refund_orders",

  // Financial Management
  VIEW_FINANCIALS: "view_financials",
  MANAGE_PAYOUTS: "manage_payouts",
  VIEW_REVENUE: "view_revenue",
  EXPORT_FINANCIAL_DATA: "export_financial_data",

  // System Settings
  VIEW_SETTINGS: "view_settings",
  EDIT_SETTINGS: "edit_settings",
  MANAGE_FEATURES: "manage_features",
  SYSTEM_MAINTENANCE: "system_maintenance",

  // Reports & Analytics
  VIEW_ANALYTICS: "view_analytics",
  EXPORT_DATA: "export_data",
  GENERATE_REPORTS: "generate_reports",

  // Audit & Security
  VIEW_AUDIT_LOGS: "view_audit_logs",
  MANAGE_SECURITY: "manage_security",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role permission matrix - Divine agricultural consciousness
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CONSUMER: [],
  FARMER: [],

  MODERATOR: [
    // Limited read-only access for moderation
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_FARMS,
    PERMISSIONS.VERIFY_FARMS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  ADMIN: [
    // Full operational permissions except system settings
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.BAN_USERS,

    PERMISSIONS.VIEW_FARMS,
    PERMISSIONS.VERIFY_FARMS,
    PERMISSIONS.SUSPEND_FARMS,

    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.CANCEL_ORDERS,
    PERMISSIONS.REFUND_ORDERS,

    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.MANAGE_PAYOUTS,
    PERMISSIONS.VIEW_REVENUE,

    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.GENERATE_REPORTS,

    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],

  SUPER_ADMIN:
    // All permissions including destructive operations
    Object.values(PERMISSIONS),
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if a user role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((permission: any) => hasPermission(role, permission));
}

/**
 * Check if a user role has all of the specified permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.every((permission: any) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role can perform destructive operations
 */
export function canPerformDestructiveOperations(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Check if role can access system settings
 */
export function canAccessSystemSettings(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.VIEW_SETTINGS);
}

/**
 * Check if role can manage finances
 */
export function canManageFinances(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.VIEW_FINANCIALS);
}

/**
 * Check if role can verify farms
 */
export function canVerifyFarms(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.VERIFY_FARMS);
}

/**
 * Divine agricultural consciousness permission checker
 */
export class DivinePermissionChecker {
  constructor(private role: UserRole) { }

  can(permission: Permission): boolean {
    return hasPermission(this.role, permission);
  }

  canAny(permissions: Permission[]): boolean {
    return hasAnyPermission(this.role, permissions);
  }

  canAll(permissions: Permission[]): boolean {
    return hasAllPermissions(this.role, permissions);
  }

  isAdmin(): boolean {
    return ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(this.role);
  }

  isSuperAdmin(): boolean {
    return this.role === "SUPER_ADMIN";
  }

  isModerator(): boolean {
    return this.role === "MODERATOR";
  }

  getPermissions(): Permission[] {
    return getRolePermissions(this.role);
  }
}

/**
 * React hook for permission checking in components
 */
export function usePermissions(role: UserRole) {
  return new DivinePermissionChecker(role);
}

/**
 * Audit logging for permission checks
 */
export function logPermissionCheck(
  userId: string,
  role: UserRole,
  permission: Permission,
  granted: boolean,
  context?: string,
) {
  logger.info("🌾 Divine Permission Check:", {
    userId,
    role,
    permission,
    granted,
    context,
    timestamp: new Date().toISOString(),
    consciousness: "agricultural_rbac",
  });

  // In production, you would send this to your audit logging system
  // Example: await auditLogger.log({ userId, role, permission, granted, context });
}
