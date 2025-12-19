/**
 * Search Share Service
 *
 * Handles sharing saved searches with other users:
 * - Create share invitations
 * - Manage share permissions
 * - Revoke access
 * - Track shared searches
 *
 * @module SearchShareService
 * @since Run 4 - Phase 2
 */

import { database } from "@/lib/database";
import { SharePermission, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface CreateShareInput {
  savedSearchId: string;
  sharedWithEmail: string;
  permission?: SharePermission;
  expiresAt?: Date;
  userId: string; // The user creating the share
}

export interface UpdateShareInput {
  permission?: SharePermission;
  expiresAt?: Date;
}

export interface ShareFilters {
  savedSearchId?: string;
  sharedWithEmail?: string;
  userId?: string; // For finding searches shared with this user
  includeExpired?: boolean;
}

// ============================================
// SEARCH SHARE SERVICE
// ============================================

export class SearchShareService {
  /**
   * Create a new share
   */
  static async create(input: CreateShareInput) {
    const {
      savedSearchId,
      sharedWithEmail,
      permission = SharePermission.VIEW,
      expiresAt,
      userId,
    } = input;

    // Verify the saved search exists and user is the owner
    const savedSearch = await database.savedSearch.findFirst({
      where: {
        id: savedSearchId,
        userId,
      },
    });

    if (!savedSearch) {
      throw new Error("Saved search not found or you don't have permission");
    }

    // Check if the email is a registered user
    const sharedWithUser = await database.user.findUnique({
      where: { email: sharedWithEmail },
      select: { id: true, email: true, name: true },
    });

    // Check if share already exists
    const existingShare = await database.savedSearchShare.findUnique({
      where: {
        savedSearchId_sharedWithEmail: {
          savedSearchId,
          sharedWithEmail,
        },
      },
    });

    if (existingShare) {
      throw new Error("This search is already shared with this email");
    }

    // Create share
    const share = await database.savedSearchShare.create({
      data: {
        savedSearchId,
        sharedWithEmail,
        sharedWithId: sharedWithUser?.id,
        permission,
        expiresAt,
      },
      include: {
        savedSearch: {
          select: {
            id: true,
            name: true,
            description: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // TODO: Send email notification to shared user
    // await this.sendShareNotification(share);

    return share;
  }

  /**
   * Get share by ID
   */
  static async getById(shareId: string, userId: string) {
    const share = await database.savedSearchShare.findUnique({
      where: { id: shareId },
      include: {
        savedSearch: {
          select: {
            id: true,
            name: true,
            description: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!share) {
      throw new Error("Share not found");
    }

    // Verify user is either the owner or the recipient
    if (share.savedSearch.userId !== userId && share.sharedWithId !== userId) {
      throw new Error("Access denied");
    }

    // Check if expired
    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new Error("Share has expired");
    }

    return share;
  }

  /**
   * List shares
   */
  static async list(
    filters: ShareFilters & { limit?: number; offset?: number },
  ) {
    const {
      savedSearchId,
      sharedWithEmail,
      userId,
      includeExpired = false,
      limit = 50,
      offset = 0,
    } = filters;

    const where: Prisma.SavedSearchShareWhereInput = {};

    if (savedSearchId) {
      where.savedSearchId = savedSearchId;
    }

    if (sharedWithEmail) {
      where.sharedWithEmail = sharedWithEmail;
    }

    if (userId) {
      where.OR = [
        { savedSearch: { userId } }, // Shares created by user
        { sharedWithId: userId }, // Shares received by user
      ];
    }

    if (!includeExpired) {
      where.OR = [{ expiresAt: null }, { expiresAt: { gte: new Date() } }];
    }

    const [shares, total] = await Promise.all([
      database.savedSearchShare.findMany({
        where,
        include: {
          savedSearch: {
            select: {
              id: true,
              name: true,
              description: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      database.savedSearchShare.count({ where }),
    ]);

    return {
      shares,
      total,
      limit,
      offset,
      hasMore: offset + shares.length < total,
    };
  }

  /**
   * List shares for a specific saved search
   */
  static async listBySavedSearch(savedSearchId: string, ownerId: string) {
    // Verify ownership
    const savedSearch = await database.savedSearch.findFirst({
      where: {
        id: savedSearchId,
        userId: ownerId,
      },
    });

    if (!savedSearch) {
      throw new Error("Saved search not found or access denied");
    }

    return this.list({ savedSearchId });
  }

  /**
   * List searches shared with a user
   */
  static async listSharedWithUser(userId: string) {
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const shares = await database.savedSearchShare.findMany({
      where: {
        AND: [
          {
            OR: [{ sharedWithEmail: user.email }, { sharedWithId: userId }],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          },
        ],
      },
      include: {
        savedSearch: {
          select: {
            id: true,
            name: true,
            description: true,
            query: true,
            filters: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return shares;
  }

  /**
   * Update share permissions
   */
  static async update(
    shareId: string,
    userId: string,
    input: UpdateShareInput,
  ) {
    // Verify the share exists and user is the owner
    const existingShare = await database.savedSearchShare.findUnique({
      where: { id: shareId },
      include: {
        savedSearch: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingShare) {
      throw new Error("Share not found");
    }

    if (existingShare.savedSearch.userId !== userId) {
      throw new Error("Access denied - only the owner can update shares");
    }

    // Update share
    const updatedShare = await database.savedSearchShare.update({
      where: { id: shareId },
      data: {
        ...(input.permission && { permission: input.permission }),
        ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
      },
      include: {
        savedSearch: {
          select: {
            id: true,
            name: true,
            description: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return updatedShare;
  }

  /**
   * Revoke/delete share
   */
  static async revoke(shareId: string, userId: string) {
    // Verify the share exists and user is the owner
    const existingShare = await database.savedSearchShare.findUnique({
      where: { id: shareId },
      include: {
        savedSearch: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingShare) {
      throw new Error("Share not found");
    }

    if (existingShare.savedSearch.userId !== userId) {
      throw new Error("Access denied - only the owner can revoke shares");
    }

    // Delete share
    await database.savedSearchShare.delete({
      where: { id: shareId },
    });

    return { success: true };
  }

  /**
   * Bulk revoke all shares for a saved search
   */
  static async revokeAll(savedSearchId: string, userId: string) {
    // Verify ownership
    const savedSearch = await database.savedSearch.findFirst({
      where: {
        id: savedSearchId,
        userId,
      },
    });

    if (!savedSearch) {
      throw new Error("Saved search not found or access denied");
    }

    // Delete all shares
    const result = await database.savedSearchShare.deleteMany({
      where: { savedSearchId },
    });

    return {
      success: true,
      revokedCount: result.count,
    };
  }

  /**
   * Check if user has access to a saved search
   */
  static async hasAccess(
    savedSearchId: string,
    userId: string,
  ): Promise<{
    hasAccess: boolean;
    permission?: SharePermission;
    isOwner: boolean;
    isShared: boolean;
  }> {
    // Check if user is the owner
    const savedSearch = await database.savedSearch.findFirst({
      where: {
        id: savedSearchId,
        userId,
      },
    });

    if (savedSearch) {
      return {
        hasAccess: true,
        permission: SharePermission.ADMIN,
        isOwner: true,
        isShared: false,
      };
    }

    // Check if search is shared with user
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return {
        hasAccess: false,
        isOwner: false,
        isShared: false,
      };
    }

    const share = await database.savedSearchShare.findFirst({
      where: {
        savedSearchId,
        AND: [
          {
            OR: [{ sharedWithEmail: user.email }, { sharedWithId: userId }],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          },
        ],
      },
    });

    if (share) {
      return {
        hasAccess: true,
        permission: share.permission,
        isOwner: false,
        isShared: true,
      };
    }

    // Check if search is public
    const publicSearch = await database.savedSearch.findFirst({
      where: {
        id: savedSearchId,
        isPublic: true,
      },
    });

    if (publicSearch) {
      return {
        hasAccess: true,
        permission: SharePermission.VIEW,
        isOwner: false,
        isShared: false,
      };
    }

    return {
      hasAccess: false,
      isOwner: false,
      isShared: false,
    };
  }

  /**
   * Get share statistics
   */
  static async getStats(userId: string) {
    const [
      totalShares,
      activeShares,
      expiredShares,
      sharesCreated,
      sharesReceived,
    ] = await Promise.all([
      // Total shares where user is owner
      database.savedSearchShare.count({
        where: {
          savedSearch: { userId },
        },
      }),
      // Active shares (not expired)
      database.savedSearchShare.count({
        where: {
          savedSearch: { userId },
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
      }),
      // Expired shares
      database.savedSearchShare.count({
        where: {
          savedSearch: { userId },
          expiresAt: { lt: new Date() },
        },
      }),
      // Searches user has shared
      database.savedSearchShare.count({
        where: {
          savedSearch: { userId },
        },
      }),
      // Searches shared with user
      database.savedSearchShare.count({
        where: {
          sharedWithId: userId,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
      }),
    ]);

    return {
      totalShares,
      activeShares,
      expiredShares,
      sharesCreated,
      sharesReceived,
    };
  }

  /**
   * Clean up expired shares
   */
  static async cleanupExpiredShares() {
    const result = await database.savedSearchShare.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return {
      success: true,
      deletedCount: result.count,
    };
  }

  /**
   * Send share notification (placeholder)
   * @private
   */
  private static async sendShareNotification(share: any) {
    // TODO: Implement email notification
    console.log(`[Share] Sending notification:`, {
      shareId: share.id,
      to: share.sharedWithEmail,
      searchName: share.savedSearch.name,
      permission: share.permission,
    });

    // Placeholder for actual email sending
    // await emailService.send({
    //   to: share.sharedWithEmail,
    //   subject: `${share.savedSearch.user.name} shared a search with you`,
    //   template: 'search-share',
    //   data: {
    //     searchName: share.savedSearch.name,
    //     ownerName: share.savedSearch.user.name,
    //     permission: share.permission,
    //   },
    // });
  }
}
