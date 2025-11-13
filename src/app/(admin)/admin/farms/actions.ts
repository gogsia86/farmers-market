"use server";

import { database } from "@/lib/database";
import type { FarmStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * DIVINE FARM STATUS TRANSFORMATION
 * Quantum state manipulation for agricultural entities
 */
export async function updateFarmStatus(
  farmId: string,
  status: FarmStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate farm exists
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: { id: true, name: true, status: true },
    });

    if (!farm) {
      return {
        success: false,
        error: "Farm consciousness not found in quantum field",
      };
    }

    // Transform farm quantum state
    await database.farm.update({
      where: { id: farmId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    // Revalidate divine cache
    revalidatePath("/admin/farms");

    return { success: true };
  } catch (error) {
    console.error("Farm status transformation failed:", error);
    return {
      success: false,
      error: "Failed to update farm status - quantum coherence disrupted",
    };
  }
}

/**
 * QUANTUM FARM SEARCH
 * Search across agricultural consciousness dimensions
 */
export async function searchFarms(query: string) {
  try {
    const farms = await database.farm.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
          { owner: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { products: true, orders: true },
        },
      },
    });

    return { success: true, farms };
  } catch (error) {
    console.error("Farm search failed:", error);
    return { success: false, farms: [], error: "Search failed" };
  }
}

/**
 * FILTER FARMS BY STATUS
 * Quantum filtering across agricultural dimensions
 */
export async function filterFarmsByStatus(status: FarmStatus | "ALL") {
  try {
    const farms = await database.farm.findMany({
      where: status === "ALL" ? {} : { status },
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { products: true, orders: true },
        },
      },
    });

    return { success: true, farms };
  } catch (error) {
    console.error("Farm filter failed:", error);
    return { success: false, farms: [], error: "Filter failed" };
  }
}
