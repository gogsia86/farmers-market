"use server";

import { auth, requireAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import { revalidatePath } from "next/cache";

/**
 * Divine User Management Actions
 * Administrative operations for user account manipulation
 */

export type UserActionResult = {
  success: boolean;
  message: string;
  error?: string;
};

/**
 * Suspend user account - Divine administrative consciousness
 */
export async function suspendUser(userId: string): Promise<UserActionResult> {
  try {
    const session = await auth();
    await requireAdmin();

    const user = await database.user.update({
      where: { id: userId },
      data: {
        status: "SUSPENDED",
        updatedAt: new Date(),
      },
    });

    // Log the action for divine consciousness tracking
    if (session?.user?.id) {
      await database.adminAction.create({
        data: {
          type: "USER_SUSPENDED",
          adminId: session.user.id,
          targetId: userId,
          targetType: "User",
          description: `User ${user.name || user.email} suspended by admin`,
          metadata: {
            previousStatus: user.status,
            suspendedAt: new Date().toISOString(),
          },
        },
      });
    }

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User ${user.name || user.email} has been suspended successfully.`,
    };
  } catch (error) {
    console.error("Failed to suspend user:", error);
    return {
      success: false,
      message: "Failed to suspend user. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
} /**
 * Activate user account - Divine restoration consciousness
 */
export async function activateUser(userId: string): Promise<UserActionResult> {
  try {
    const session = await auth();
    await requireAdmin();

    const user = await database.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });

    // Log the action for divine consciousness tracking
    if (session?.user?.id) {
      await database.adminAction.create({
        data: {
          type: "USER_ACTIVATED",
          adminId: session.user.id,
          targetId: userId,
          targetType: "User",
          description: `User ${user.name || user.email} activated by admin`,
          metadata: {
            previousStatus: user.status,
            activatedAt: new Date().toISOString(),
          },
        },
      });
    }
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User ${user.name || user.email} has been activated successfully.`,
    };
  } catch (error) {
    console.error("Failed to activate user:", error);
    return {
      success: false,
      message: "Failed to activate user. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Promote user to admin - Divine elevation consciousness
 */
export async function promoteToAdmin(
  userId: string
): Promise<UserActionResult> {
  try {
    await requireAdmin();

    const user = await database.user.update({
      where: { id: userId },
      data: {
        role: "ADMIN",
        updatedAt: new Date(),
      },
    });

    // Log the action for divine consciousness tracking
    await database.adminAction.create({
      data: {
        action: "USER_PROMOTED_ADMIN",
        targetUserId: userId,
        metadata: {
          previousRole: user.role,
          promotedAt: new Date().toISOString(),
        },
      },
    });

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User ${user.name || user.email} has been promoted to admin successfully.`,
    };
  } catch (error) {
    console.error("Failed to promote user:", error);
    return {
      success: false,
      message: "Failed to promote user. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Demote admin to user - Divine humility consciousness
 */
export async function demoteFromAdmin(
  userId: string
): Promise<UserActionResult> {
  try {
    await requireAdmin();

    const user = await database.user.update({
      where: { id: userId },
      data: {
        role: "CONSUMER",
        updatedAt: new Date(),
      },
    });

    // Log the action for divine consciousness tracking
    await database.adminAction.create({
      data: {
        action: "USER_DEMOTED_ADMIN",
        targetUserId: userId,
        metadata: {
          previousRole: user.role,
          demotedAt: new Date().toISOString(),
        },
      },
    });

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User ${user.name || user.email} has been demoted from admin successfully.`,
    };
  } catch (error) {
    console.error("Failed to demote user:", error);
    return {
      success: false,
      message: "Failed to demote user. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete user account - Divine finality consciousness
 * (Use with extreme caution - this is permanent)
 */
export async function deleteUser(userId: string): Promise<UserActionResult> {
  try {
    await requireAdmin();

    // First get user info for logging
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, role: true },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // Delete user (this will cascade to related records)
    await database.user.delete({
      where: { id: userId },
    });

    // Log the action for divine consciousness tracking
    await database.adminAction.create({
      data: {
        action: "USER_DELETED",
        targetUserId: userId,
        metadata: {
          deletedUser: user,
          deletedAt: new Date().toISOString(),
        },
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User ${user.name || user.email} has been permanently deleted.`,
    };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return {
      success: false,
      message: "Failed to delete user. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reset user password - Divine recovery consciousness
 */
export async function resetUserPassword(
  userId: string
): Promise<UserActionResult> {
  try {
    await requireAdmin();

    // Generate temporary password
    const tempPassword = generateSecurePassword();
    const hashedPassword = await hashPassword(tempPassword);

    const user = await database.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Log the action for divine consciousness tracking
    await database.adminAction.create({
      data: {
        action: "USER_PASSWORD_RESET",
        targetUserId: userId,
        metadata: {
          resetAt: new Date().toISOString(),
          requiresReset: true,
        },
      },
    });

    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      message: `Password reset for ${user.name || user.email}. Temporary password: ${tempPassword}`,
    };
  } catch (error) {
    console.error("Failed to reset password:", error);
    return {
      success: false,
      message: "Failed to reset password. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper functions
function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 12);
}

