import {
  DivinePermissionChecker,
  getUserPermissions,
  hasPermission,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from "@/lib/rbac";
import { describe, expect, it } from "@jest/globals";
import { UserRole } from "@prisma/client";

describe("RBAC Permission System", () => {
  describe("Basic Permission Checking", () => {
    it("grants all permissions to SUPER_ADMIN", () => {
      const allPermissions = Object.values(PERMISSIONS);

      for (const permission of allPermissions) {
        expect(hasPermission(UserRole.SUPER_ADMIN, permission)).toBe(true);
      }
    });

    it("grants appropriate permissions to ADMIN", () => {
      const adminPermissions = ROLE_PERMISSIONS.ADMIN;

      for (const permission of adminPermissions) {
        expect(hasPermission(UserRole.ADMIN, permission)).toBe(true);
      }

      // Should not have super admin exclusive permissions
      expect(
        hasPermission(UserRole.ADMIN, PERMISSIONS.MANAGE_SYSTEM_SETTINGS)
      ).toBe(false);
      expect(
        hasPermission(UserRole.ADMIN, PERMISSIONS.MANAGE_ADMIN_USERS)
      ).toBe(false);
    });

    it("grants limited permissions to MODERATOR", () => {
      const moderatorPermissions = ROLE_PERMISSIONS.MODERATOR;

      for (const permission of moderatorPermissions) {
        expect(hasPermission(UserRole.MODERATOR, permission)).toBe(true);
      }

      // Should not have admin permissions
      expect(hasPermission(UserRole.MODERATOR, PERMISSIONS.DELETE_USERS)).toBe(
        false
      );
      expect(
        hasPermission(UserRole.MODERATOR, PERMISSIONS.VIEW_FINANCIAL_REPORTS)
      ).toBe(false);
    });

    it("grants minimal permissions to FARMER", () => {
      const farmerPermissions = ROLE_PERMISSIONS.FARMER;

      for (const permission of farmerPermissions) {
        expect(hasPermission(UserRole.FARMER, permission)).toBe(true);
      }

      // Should not have admin or moderator permissions
      expect(hasPermission(UserRole.FARMER, PERMISSIONS.VIEW_USERS)).toBe(
        false
      );
      expect(hasPermission(UserRole.FARMER, PERMISSIONS.MANAGE_FARMS)).toBe(
        false
      );
    });

    it("grants no admin permissions to CONSUMER", () => {
      const consumerPermissions = ROLE_PERMISSIONS.CONSUMER;

      // Consumer should have no permissions in admin context
      expect(consumerPermissions).toHaveLength(0);

      for (const permission of Object.values(PERMISSIONS)) {
        expect(hasPermission(UserRole.CONSUMER, permission)).toBe(false);
      }
    });
  });

  describe("getUserPermissions Function", () => {
    it("returns correct permissions for each role", () => {
      expect(getUserPermissions(UserRole.SUPER_ADMIN)).toEqual(
        ROLE_PERMISSIONS.SUPER_ADMIN
      );
      expect(getUserPermissions(UserRole.ADMIN)).toEqual(
        ROLE_PERMISSIONS.ADMIN
      );
      expect(getUserPermissions(UserRole.MODERATOR)).toEqual(
        ROLE_PERMISSIONS.MODERATOR
      );
      expect(getUserPermissions(UserRole.FARMER)).toEqual(
        ROLE_PERMISSIONS.FARMER
      );
      expect(getUserPermissions(UserRole.CONSUMER)).toEqual(
        ROLE_PERMISSIONS.CONSUMER
      );
    });
  });

  describe("DivinePermissionChecker Class", () => {
    it("creates checker with correct role and permissions", () => {
      const checker = new DivinePermissionChecker(UserRole.ADMIN);

      expect(checker.role).toBe(UserRole.ADMIN);
      expect(checker.permissions).toEqual(ROLE_PERMISSIONS.ADMIN);
    });

    it("checks permissions correctly", () => {
      const adminChecker = new DivinePermissionChecker(UserRole.ADMIN);

      expect(adminChecker.can(PERMISSIONS.VIEW_USERS)).toBe(true);
      expect(adminChecker.can(PERMISSIONS.MANAGE_SYSTEM_SETTINGS)).toBe(false);
    });

    it("checks multiple permissions correctly", () => {
      const moderatorChecker = new DivinePermissionChecker(UserRole.MODERATOR);

      const result = moderatorChecker.canAny([
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.DELETE_USERS,
      ]);

      expect(result).toBe(true); // Can view but not delete
    });

    it("requires all permissions correctly", () => {
      const adminChecker = new DivinePermissionChecker(UserRole.ADMIN);

      const result = adminChecker.canAll([
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.EDIT_USERS,
        PERMISSIONS.MANAGE_SYSTEM_SETTINGS, // Admin doesn't have this
      ]);

      expect(result).toBe(false);
    });

    it("filters permissions correctly", () => {
      const moderatorChecker = new DivinePermissionChecker(UserRole.MODERATOR);

      const testPermissions = [
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.DELETE_USERS,
        PERMISSIONS.VIEW_FARMS,
      ];

      const allowedPermissions =
        moderatorChecker.filterAllowed(testPermissions);

      expect(allowedPermissions).toContain(PERMISSIONS.VIEW_USERS);
      expect(allowedPermissions).toContain(PERMISSIONS.VIEW_FARMS);
      expect(allowedPermissions).not.toContain(PERMISSIONS.DELETE_USERS);
    });

    it("generates permission summary correctly", () => {
      const farmerChecker = new DivinePermissionChecker(UserRole.FARMER);

      const summary = farmerChecker.getPermissionSummary();

      expect(summary.role).toBe(UserRole.FARMER);
      expect(summary.totalPermissions).toBe(ROLE_PERMISSIONS.FARMER.length);
      expect(summary.permissions).toEqual(ROLE_PERMISSIONS.FARMER);
      expect(summary.hasAdminAccess).toBe(false);
      expect(summary.hasModeratorAccess).toBe(false);
    });

    it("identifies admin access correctly", () => {
      const adminChecker = new DivinePermissionChecker(UserRole.ADMIN);
      const moderatorChecker = new DivinePermissionChecker(UserRole.MODERATOR);
      const farmerChecker = new DivinePermissionChecker(UserRole.FARMER);

      expect(adminChecker.getPermissionSummary().hasAdminAccess).toBe(true);
      expect(moderatorChecker.getPermissionSummary().hasAdminAccess).toBe(
        false
      );
      expect(farmerChecker.getPermissionSummary().hasAdminAccess).toBe(false);
    });

    it("identifies moderator access correctly", () => {
      const adminChecker = new DivinePermissionChecker(UserRole.ADMIN);
      const moderatorChecker = new DivinePermissionChecker(UserRole.MODERATOR);
      const farmerChecker = new DivinePermissionChecker(UserRole.FARMER);

      expect(adminChecker.getPermissionSummary().hasModeratorAccess).toBe(true);
      expect(moderatorChecker.getPermissionSummary().hasModeratorAccess).toBe(
        true
      );
      expect(farmerChecker.getPermissionSummary().hasModeratorAccess).toBe(
        false
      );
    });
  });

  describe("Permission Categories", () => {
    it("has correct user management permissions", () => {
      const userPermissions = [
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.CREATE_USERS,
        PERMISSIONS.EDIT_USERS,
        PERMISSIONS.DELETE_USERS,
        PERMISSIONS.MANAGE_USER_ROLES,
      ];

      for (const permission of userPermissions) {
        expect(Object.values(PERMISSIONS)).toContain(permission);
      }
    });

    it("has correct farm management permissions", () => {
      const farmPermissions = [
        PERMISSIONS.VIEW_FARMS,
        PERMISSIONS.CREATE_FARMS,
        PERMISSIONS.EDIT_FARMS,
        PERMISSIONS.DELETE_FARMS,
        PERMISSIONS.MANAGE_FARMS,
      ];

      for (const permission of farmPermissions) {
        expect(Object.values(PERMISSIONS)).toContain(permission);
      }
    });

    it("has correct order management permissions", () => {
      const orderPermissions = [
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.CREATE_ORDERS,
        PERMISSIONS.EDIT_ORDERS,
        PERMISSIONS.DELETE_ORDERS,
        PERMISSIONS.MANAGE_ORDER_STATUS,
      ];

      for (const permission of orderPermissions) {
        expect(Object.values(PERMISSIONS)).toContain(permission);
      }
    });

    it("has correct financial permissions", () => {
      const financialPermissions = [
        PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        PERMISSIONS.MANAGE_PAYMENTS,
        PERMISSIONS.VIEW_REVENUE_ANALYTICS,
        PERMISSIONS.EXPORT_FINANCIAL_DATA,
      ];

      for (const permission of financialPermissions) {
        expect(Object.values(PERMISSIONS)).toContain(permission);
      }
    });

    it("has correct system permissions", () => {
      const systemPermissions = [
        PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
        PERMISSIONS.VIEW_SYSTEM_LOGS,
        PERMISSIONS.MANAGE_ADMIN_USERS,
        PERMISSIONS.BACKUP_RESTORE_DATA,
        PERMISSIONS.MANAGE_API_KEYS,
      ];

      for (const permission of systemPermissions) {
        expect(Object.values(PERMISSIONS)).toContain(permission);
      }
    });
  });

  describe("Role Hierarchy Validation", () => {
    it("ensures SUPER_ADMIN has all permissions", () => {
      const allPermissions = Object.values(PERMISSIONS);
      const superAdminPermissions = ROLE_PERMISSIONS.SUPER_ADMIN;

      expect(superAdminPermissions).toHaveLength(allPermissions.length);
      expect(superAdminPermissions.sort()).toEqual(allPermissions.sort());
    });

    it("ensures role permissions are properly nested", () => {
      // ADMIN should have more permissions than MODERATOR
      expect(ROLE_PERMISSIONS.ADMIN.length).toBeGreaterThan(
        ROLE_PERMISSIONS.MODERATOR.length
      );

      // MODERATOR should have more permissions than FARMER
      expect(ROLE_PERMISSIONS.MODERATOR.length).toBeGreaterThan(
        ROLE_PERMISSIONS.FARMER.length
      );

      // FARMER should have more permissions than CONSUMER
      expect(ROLE_PERMISSIONS.FARMER.length).toBeGreaterThan(
        ROLE_PERMISSIONS.CONSUMER.length
      );
    });

    it("ensures no duplicate permissions within roles", () => {
      for (const [, permissions] of Object.entries(ROLE_PERMISSIONS)) {
        const uniquePermissions = [...new Set(permissions)];
        expect(uniquePermissions).toHaveLength(permissions.length);
      }
    });
  });
});
