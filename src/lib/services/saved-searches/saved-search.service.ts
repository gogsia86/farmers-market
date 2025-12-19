/**
 * Saved Search Service
 *
 * Handles CRUD operations for saved searches with:
 * - Create, read, update, delete operations
 * - Folder management
 * - Search execution
 * - Share token generation
 * - Agricultural consciousness integration
 *
 * @module SavedSearchService
 * @since Run 4
 */

import { database } from "@/lib/database";
import { NotificationFrequency, Season, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface CreateSavedSearchInput {
  userId: string;
  name: string;
  description?: string;
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  isPublic?: boolean;
  folderId?: string;
  tags?: string[];
  notificationsEnabled?: boolean;
  notificationFrequency?: NotificationFrequency;
  seasonalPreference?: Season;
  preferredFarms?: string[];
  biodynamicOnly?: boolean;
}

export interface UpdateSavedSearchInput {
  name?: string;
  description?: string;
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  isPublic?: boolean;
  folderId?: string;
  tags?: string[];
  notificationsEnabled?: boolean;
  notificationFrequency?: NotificationFrequency;
  seasonalPreference?: Season;
  preferredFarms?: string[];
  biodynamicOnly?: boolean;
}

export interface ExecuteSavedSearchInput {
  searchId: string;
  userId: string;
  limit?: number;
  offset?: number;
}

export interface SavedSearchFilters {
  userId?: string;
  folderId?: string;
  tags?: string[];
  seasonalPreference?: Season;
  isPublic?: boolean;
}

// ============================================
// SAVED SEARCH SERVICE
// ============================================

export class SavedSearchService {
  /**
   * Create a new saved search
   */
  static async create(input: CreateSavedSearchInput) {
    const {
      userId,
      name,
      description,
      query,
      filters = {},
      sortBy,
      location,
      isPublic = false,
      folderId,
      tags = [],
      notificationsEnabled = true,
      notificationFrequency = NotificationFrequency.DAILY,
      seasonalPreference,
      preferredFarms = [],
      biodynamicOnly = false,
    } = input;

    // Validate user exists
    const user = await database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Validate folder if provided
    if (folderId) {
      const folder = await database.savedSearchFolder.findFirst({
        where: {
          id: folderId,
          userId,
        },
      });

      if (!folder) {
        throw new Error("Folder not found or access denied");
      }
    }

    // Generate share token if public
    const shareToken = isPublic ? nanoid(16) : null;

    // Create saved search
    const savedSearch = await database.savedSearch.create({
      data: {
        userId,
        name,
        description,
        query,
        filters: filters as Prisma.InputJsonValue,
        sortBy,
        location: location as Prisma.InputJsonValue,
        isPublic,
        shareToken,
        folderId,
        tags,
        notificationsEnabled,
        notificationFrequency,
        seasonalPreference,
        preferredFarms,
        biodynamicOnly,
      },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return savedSearch;
  }

  /**
   * Get saved search by ID
   */
  static async getById(searchId: string, userId: string) {
    const savedSearch = await database.savedSearch.findFirst({
      where: {
        id: searchId,
        OR: [
          { userId },
          { isPublic: true },
          {
            sharedWith: {
              some: {
                OR: [
                  { sharedWithId: userId },
                  { sharedWithEmail: { equals: userId } },
                ],
              },
            },
          },
        ],
      },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        alerts: {
          where: { isActive: true },
        },
        sharedWith: true,
      },
    });

    if (!savedSearch) {
      throw new Error("Saved search not found or access denied");
    }

    return savedSearch;
  }

  /**
   * Get saved search by share token
   */
  static async getByShareToken(shareToken: string) {
    const savedSearch = await database.savedSearch.findUnique({
      where: { shareToken },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!savedSearch || !savedSearch.isPublic) {
      throw new Error("Saved search not found or not public");
    }

    return savedSearch;
  }

  /**
   * List saved searches for a user
   */
  static async list(
    filters: SavedSearchFilters & { limit?: number; offset?: number },
  ) {
    const {
      userId,
      folderId,
      tags,
      seasonalPreference,
      isPublic,
      limit = 50,
      offset = 0,
    } = filters;

    const where: Prisma.SavedSearchWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (folderId !== undefined) {
      where.folderId = folderId === null ? null : folderId;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (seasonalPreference) {
      where.seasonalPreference = seasonalPreference;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    const [searches, total] = await Promise.all([
      database.savedSearch.findMany({
        where,
        include: {
          folder: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              alerts: true,
              sharedWith: true,
            },
          },
        },
        orderBy: [{ lastExecutedAt: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      database.savedSearch.count({ where }),
    ]);

    return {
      searches,
      total,
      limit,
      offset,
      hasMore: offset + searches.length < total,
    };
  }

  /**
   * Update saved search
   */
  static async update(
    searchId: string,
    userId: string,
    input: UpdateSavedSearchInput,
  ) {
    // Verify ownership
    const existingSearch = await database.savedSearch.findFirst({
      where: {
        id: searchId,
        userId,
      },
    });

    if (!existingSearch) {
      throw new Error("Saved search not found or access denied");
    }

    // Validate folder if provided
    if (input.folderId) {
      const folder = await database.savedSearchFolder.findFirst({
        where: {
          id: input.folderId,
          userId,
        },
      });

      if (!folder) {
        throw new Error("Folder not found or access denied");
      }
    }

    // Generate new share token if becoming public
    const shareToken =
      input.isPublic && !existingSearch.isPublic && !existingSearch.shareToken
        ? nanoid(16)
        : existingSearch.shareToken;

    // Update saved search
    const updatedSearch = await database.savedSearch.update({
      where: { id: searchId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.query !== undefined && { query: input.query }),
        ...(input.filters !== undefined && {
          filters: input.filters as Prisma.InputJsonValue,
        }),
        ...(input.sortBy !== undefined && { sortBy: input.sortBy }),
        ...(input.location !== undefined && {
          location: input.location as Prisma.InputJsonValue,
        }),
        ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
        ...(input.folderId !== undefined && { folderId: input.folderId }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.notificationsEnabled !== undefined && {
          notificationsEnabled: input.notificationsEnabled,
        }),
        ...(input.notificationFrequency !== undefined && {
          notificationFrequency: input.notificationFrequency,
        }),
        ...(input.seasonalPreference !== undefined && {
          seasonalPreference: input.seasonalPreference,
        }),
        ...(input.preferredFarms !== undefined && {
          preferredFarms: input.preferredFarms,
        }),
        ...(input.biodynamicOnly !== undefined && {
          biodynamicOnly: input.biodynamicOnly,
        }),
        shareToken,
      },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return updatedSearch;
  }

  /**
   * Delete saved search
   */
  static async delete(searchId: string, userId: string) {
    // Verify ownership
    const existingSearch = await database.savedSearch.findFirst({
      where: {
        id: searchId,
        userId,
      },
    });

    if (!existingSearch) {
      throw new Error("Saved search not found or access denied");
    }

    // Delete saved search (cascade will handle alerts and shares)
    await database.savedSearch.delete({
      where: { id: searchId },
    });

    return { success: true };
  }

  /**
   * Execute saved search (run the search and track stats)
   */
  static async execute(input: ExecuteSavedSearchInput) {
    const { searchId, userId, limit = 20, offset = 0 } = input;

    // Get saved search
    const savedSearch = await this.getById(searchId, userId);

    // Parse filters
    const filters = savedSearch.filters as Record<string, any>;

    // Build product query
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
    };

    // Apply query
    if (savedSearch.query) {
      where.OR = [
        { name: { contains: savedSearch.query, mode: "insensitive" } },
        { description: { contains: savedSearch.query, mode: "insensitive" } },
      ];
    }

    // Apply filters
    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.organic === true) {
      where.organic = true;
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) {
        where.price.gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        where.price.lte = filters.priceMax;
      }
    }

    if (
      filters.farmIds &&
      Array.isArray(filters.farmIds) &&
      filters.farmIds.length > 0
    ) {
      where.farmId = { in: filters.farmIds };
    }

    if (savedSearch.preferredFarms && savedSearch.preferredFarms.length > 0) {
      where.farmId = { in: savedSearch.preferredFarms };
    }

    if (savedSearch.biodynamicOnly) {
      where.farm = {
        certifications: {
          some: {
            type: "BIODYNAMIC",
            status: "VERIFIED",
          },
        },
      };
    }

    // Apply seasonal preference
    if (savedSearch.seasonalPreference) {
      where.seasonal = true;
      // TODO: Add season-specific logic when season field is added to products
    }

    // Build order by
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

    if (savedSearch.sortBy) {
      switch (savedSearch.sortBy) {
        case "price_asc":
          orderBy = { price: "asc" };
          break;
        case "price_desc":
          orderBy = { price: "desc" };
          break;
        case "rating":
          orderBy = { averageRating: "desc" };
          break;
        case "popularity":
          orderBy = { reviewCount: "desc" };
          break;
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
      }
    }

    // Execute search
    const [products, total] = await Promise.all([
      database.product.findMany({
        where,
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              verificationStatus: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      database.product.count({ where }),
    ]);

    // Update search stats
    await database.savedSearch.update({
      where: { id: searchId },
      data: {
        executionCount: { increment: 1 },
        lastExecutedAt: new Date(),
        resultsCount: total,
      },
    });

    return {
      products,
      total,
      limit,
      offset,
      hasMore: offset + products.length < total,
      savedSearch,
    };
  }

  /**
   * Duplicate saved search
   */
  static async duplicate(searchId: string, userId: string, newName?: string) {
    const originalSearch = await this.getById(searchId, userId);

    const duplicatedSearch = await this.create({
      userId,
      name: newName || `${originalSearch.name} (Copy)`,
      description: originalSearch.description || undefined,
      query: originalSearch.query || undefined,
      filters: originalSearch.filters as Record<string, any>,
      sortBy: originalSearch.sortBy || undefined,
      location: originalSearch.location as any,
      isPublic: false, // Duplicates are private by default
      folderId: originalSearch.folderId || undefined,
      tags: originalSearch.tags,
      notificationsEnabled: originalSearch.notificationsEnabled,
      notificationFrequency: originalSearch.notificationFrequency,
      seasonalPreference: originalSearch.seasonalPreference || undefined,
      preferredFarms: originalSearch.preferredFarms,
      biodynamicOnly: originalSearch.biodynamicOnly,
    });

    return duplicatedSearch;
  }

  /**
   * Get search statistics for a user
   */
  static async getStats(userId: string) {
    const [
      totalSearches,
      publicSearches,
      totalExecutions,
      searchesWithAlerts,
      searchesByFolder,
    ] = await Promise.all([
      database.savedSearch.count({
        where: { userId },
      }),
      database.savedSearch.count({
        where: { userId, isPublic: true },
      }),
      database.savedSearch.aggregate({
        where: { userId },
        _sum: { executionCount: true },
      }),
      database.savedSearch.count({
        where: {
          userId,
          alerts: {
            some: {
              isActive: true,
            },
          },
        },
      }),
      database.savedSearch.groupBy({
        by: ["folderId"],
        where: { userId },
        _count: true,
      }),
    ]);

    return {
      totalSearches,
      publicSearches,
      totalExecutions: totalExecutions._sum.executionCount || 0,
      searchesWithAlerts,
      searchesByFolder: searchesByFolder.map((group) => ({
        folderId: group.folderId,
        count: group._count,
      })),
    };
  }
}

// ============================================
// SAVED SEARCH FOLDER SERVICE
// ============================================

export class SavedSearchFolderService {
  /**
   * Create a new folder
   */
  static async create(
    userId: string,
    input: {
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      sortOrder?: number;
    },
  ) {
    const folder = await database.savedSearchFolder.create({
      data: {
        userId,
        ...input,
      },
      include: {
        _count: {
          select: {
            searches: true,
          },
        },
      },
    });

    return folder;
  }

  /**
   * List folders for a user
   */
  static async list(userId: string) {
    const folders = await database.savedSearchFolder.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            searches: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return folders;
  }

  /**
   * Update folder
   */
  static async update(
    folderId: string,
    userId: string,
    input: {
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
      sortOrder?: number;
    },
  ) {
    const existingFolder = await database.savedSearchFolder.findFirst({
      where: { id: folderId, userId },
    });

    if (!existingFolder) {
      throw new Error("Folder not found or access denied");
    }

    const updatedFolder = await database.savedSearchFolder.update({
      where: { id: folderId },
      data: input,
      include: {
        _count: {
          select: {
            searches: true,
          },
        },
      },
    });

    return updatedFolder;
  }

  /**
   * Delete folder
   */
  static async delete(folderId: string, userId: string) {
    const existingFolder = await database.savedSearchFolder.findFirst({
      where: { id: folderId, userId },
    });

    if (!existingFolder) {
      throw new Error("Folder not found or access denied");
    }

    // Move searches to root (folderId = null)
    await database.savedSearch.updateMany({
      where: { folderId },
      data: { folderId: null },
    });

    // Delete folder
    await database.savedSearchFolder.delete({
      where: { id: folderId },
    });

    return { success: true };
  }
}
