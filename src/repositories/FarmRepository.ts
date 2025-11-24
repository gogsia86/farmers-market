/**
 * FARM REPOSITORY - Quantum Data Access Layer
 * Complete abstraction over farm database operations
 */

import { database } from "@/lib/database";
import type { Farm, FarmStatus, Prisma } from "@prisma/client";
import type {
  CreateFarmRequest,
  UpdateFarmRequest,
  FarmFilters,
  QuantumFarm,
} from "@/types/api/farm.types";
import {
  StructuredLogger,
  LoggerFactory,
} from "@/lib/monitoring/StructuredLogger";
import { DatabaseError } from "@/lib/errors/DatabaseError";

export class FarmRepository {
  private readonly logger: StructuredLogger;

  constructor() {
    this.logger = LoggerFactory.getLogger("FarmRepository");
  }

  /**
   * FIND BY ID
   * Retrieve single farm with all relations
   */
  async findById(id: string): Promise<QuantumFarm | null> {
    try {
      const farm = await database.farm.findUnique({
        where: { id },
        include: this.getDefaultIncludes(),
      });

      if (!farm) {
        this.logger.debug("Farm not found", { farmId: id });
        return null;
      }

      this.logger.debug("Farm retrieved successfully", { farmId: id });
      return farm as QuantumFarm;
    } catch (error) {
      this.logger.error("Failed to find farm by ID", error as Error, {
        farmId: id,
      });
      throw new DatabaseError("find farm by ID", error as Error);
    }
  }

  /**
   * FIND WITH PAGINATION
   * Retrieve farms with filters and pagination
   */
  async findWithPagination(
    filters: FarmFilters,
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<{ farms: QuantumFarm[]; total: number }> {
    try {
      const whereClause = this.buildWhereClause(filters);
      const skip = (options.page - 1) * options.limit;

      const [farms, total] = await Promise.all([
        database.farm.findMany({
          where: whereClause,
          skip,
          take: options.limit,
          orderBy: options.sortBy
            ? { [options.sortBy]: options.sortOrder || "desc" }
            : { createdAt: "desc" },
          include: this.getDefaultIncludes(),
        }),
        database.farm.count({ where: whereClause }),
      ]);

      this.logger.debug("Farms retrieved with pagination", {
        count: farms.length,
        total,
        page: options.page,
        limit: options.limit,
      });

      return { farms: farms as QuantumFarm[], total };
    } catch (error) {
      this.logger.error(
        "Failed to find farms with pagination",
        error as Error,
        { filters, options },
      );
      throw new DatabaseError("find farms with pagination", error as Error);
    }
  }

  /**
   * CREATE FARM
   * Manifest new farm in database
   */
  async create(data: CreateFarmRequest): Promise<QuantumFarm> {
    try {
      const farm = await database.farm.create({
        data: {
          name: data.name,
          description: data.description,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          email: data.email,
          phone: data.phone,
          ownerId: data.ownerId,
          latitude: data.coordinates?.lat ?? 0,
          longitude: data.coordinates?.lng ?? 0,
          images: data.images || [],
          status: "PENDING",
          slug: this.generateSlug(data.name),
          ...(data.certifications &&
            data.certifications.length > 0 && {
              certifications: {
                create: data.certifications.map((cert) => ({
                  type: "ORGANIC" as const,
                  certifierName: cert,
                  issueDate: new Date(),
                  status: "PENDING" as const,
                })),
              },
            }),
        },
        include: this.getDefaultIncludes(),
      });

      this.logger.info("Farm created successfully", {
        farmId: farm.id,
        name: farm.name,
      });
      return farm as QuantumFarm;
    } catch (error) {
      this.logger.error("Failed to create farm", error as Error, { data });
      throw new DatabaseError("create farm", error as Error);
    }
  }

  /**
   * UPDATE FARM
   * Modify existing farm entity
   */
  async update(id: string, data: UpdateFarmRequest): Promise<QuantumFarm> {
    try {
      const updateData: Prisma.FarmUpdateInput = {
        ...(data.name && {
          name: data.name,
          slug: this.generateSlug(data.name),
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.address && { address: data.address }),
        ...(data.coordinates && {
          latitude: data.coordinates.lat ?? 0,
          longitude: data.coordinates.lng ?? 0,
        }),
        ...(data.status && { status: data.status }),
        ...(data.images && { images: data.images }),
        ...(data.certifications &&
          data.certifications.length > 0 && {
            certifications: {
              deleteMany: {},
              create: data.certifications.map((cert) => ({
                type: "ORGANIC" as const,
                certifierName: cert,
                issueDate: new Date(),
                status: "VERIFIED" as const,
              })),
            },
          }),
        updatedAt: new Date(),
      };

      const farm = await database.farm.update({
        where: { id },
        data: updateData,
        include: this.getDefaultIncludes(),
      });

      this.logger.info("Farm updated successfully", { farmId: id });
      return farm as QuantumFarm;
    } catch (error) {
      this.logger.error("Failed to update farm", error as Error, {
        farmId: id,
        data,
      });
      throw new DatabaseError("update farm", error as Error);
    }
  }

  /**
   * DELETE FARM
   * Remove farm from reality
   */
  async delete(id: string): Promise<void> {
    try {
      await database.farm.delete({
        where: { id },
      });

      this.logger.info("Farm deleted successfully", { farmId: id });
    } catch (error) {
      this.logger.error("Failed to delete farm", error as Error, {
        farmId: id,
      });
      throw new DatabaseError("delete farm", error as Error);
    }
  }

  /**
   * COUNT BY STATUS
   * Get farm counts grouped by status
   */
  async countByStatus(): Promise<Record<FarmStatus, number>> {
    try {
      const farms = await database.farm.groupBy({
        by: ["status"],
        _count: true,
      });

      const counts: Record<string, number> = {};
      farms.forEach((group) => {
        counts[group.status] = group._count;
      });

      this.logger.debug("Farm counts by status retrieved", { counts });
      return counts as Record<FarmStatus, number>;
    } catch (error) {
      this.logger.error("Failed to count farms by status", error as Error);
      throw new DatabaseError("count farms by status", error as Error);
    }
  }

  /**
   * FIND BY NAME AND OWNER
   * Check for duplicate farm names
   */
  async findByNameAndOwner(
    name: string,
    ownerId: string,
  ): Promise<Farm | null> {
    try {
      const farm = await database.farm.findFirst({
        where: {
          name,
          ownerId,
        },
      });

      return farm;
    } catch (error) {
      this.logger.error(
        "Failed to find farm by name and owner",
        error as Error,
        { name, ownerId },
      );
      throw new DatabaseError("find farm by name and owner", error as Error);
    }
  }

  /**
   * BUILD WHERE CLAUSE
   * Construct Prisma where clause from filters
   */
  private buildWhereClause(filters: FarmFilters): Prisma.FarmWhereInput {
    const where: Prisma.FarmWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters.searchTerm) {
      where.OR = [
        { name: { contains: filters.searchTerm, mode: "insensitive" } },
        { description: { contains: filters.searchTerm, mode: "insensitive" } },
        { address: { contains: filters.searchTerm, mode: "insensitive" } },
      ];
    }

    if (filters.certified) {
      where.certifications = {
        some: {},
      };
    }

    if (filters.hasProducts) {
      where.products = {
        some: {},
      };
    }

    return where;
  }

  /**
   * GET DEFAULT INCLUDES
   * Standard relations to include in queries
   */
  private getDefaultIncludes(): Prisma.FarmInclude {
    return {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
    };
  }

  /**
   * GENERATE SLUG
   * Create URL-friendly slug from farm name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
