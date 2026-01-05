/**
 * 🌟 Farm Server Actions - Divine Agricultural Operations
 * Server-side actions for farm CRUD operations with validation
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

"use server";

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { farmService } from "@/lib/services/farm.service";
import { revalidatePath } from "next/cache";

/**
 * Response type for farm actions
 */
interface FarmActionResponse {
  success: boolean;
  farm?: any;
  error?: string;
}

/**
 * Create new farm action
 */
export async function createFarmAction(formData: FormData): Promise<FarmActionResponse> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check authorization - only farmers can create farms
    if (session.user.role !== "FARMER") {
      return {
        success: false,
        error: "Only farmers can create farms",
      };
    }

    // Extract and validate form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const phone = formData.get("phone") as string | null;
    const email = formData.get("email") as string | null;
    const website = formData.get("website") as string | null;
    const certificationsRaw = formData.get("certifications") as string | null;
    const sizeAcresRaw = formData.get("sizeAcres") as string | null;

    // Validate required fields
    if (!name || name.length < 3 || name.length > 100) {
      return {
        success: false,
        error: "Farm name must be between 3 and 100 characters",
      };
    }

    if (!description || description.length < 20 || description.length > 2000) {
      return {
        success: false,
        error: "Description must be between 20 and 2000 characters",
      };
    }

    if (!address || !city || !state || !zipCode) {
      return {
        success: false,
        error: "Complete address is required",
      };
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return {
        success: false,
        error: "Invalid latitude (must be between -90 and 90)",
      };
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return {
        success: false,
        error: "Invalid longitude (must be between -180 and 180)",
      };
    }

    // Validate state code
    if (state.length !== 2) {
      return {
        success: false,
        error: "State must be a 2-letter code",
      };
    }

    // Validate ZIP code
    if (!/^\d{5}$/.test(zipCode)) {
      return {
        success: false,
        error: "ZIP code must be 5 digits",
      };
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        error: "Invalid email address",
      };
    }

    // Validate website if provided
    if (website) {
      try {
        new URL(website);
      } catch {
        return {
          success: false,
          error: "Invalid website URL",
        };
      }
    }

    // Parse certifications (split by comma or newline)
    let certifications: string[] = [];
    if (certificationsRaw) {
      certifications = certificationsRaw
        .split(/[,\n]/)
        .map((cert) => cert.trim())
        .filter((cert) => cert.length > 0);
    }

    // Parse size in acres
    let sizeAcres: number | null = null;
    if (sizeAcresRaw) {
      const parsed = parseFloat(sizeAcresRaw);
      if (!isNaN(parsed) && parsed > 0) {
        sizeAcres = parsed;
      }
    }

    // Create farm using service
    const farm = await farmService.createFarm({
      name,
      description,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      phone: phone || "",
      email: email || "",
      website: website || undefined,
      certifications: certifications.length > 0 ? certifications : undefined,
      ownerId: session.user.id,
    });

    // Revalidate relevant paths
    revalidatePath("/farmer/dashboard");
    revalidatePath("/farms");

    return {
      success: true,
      farm,
    };
  } catch (error) {
    console.error("Farm creation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create farm",
    };
  }
}

/**
 * Update farm action
 */
export async function updateFarmAction(
  farmId: string,
  formData: FormData
): Promise<FarmActionResponse> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Verify ownership
    const existingFarm = await database.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true },
    });

    if (!existingFarm) {
      return {
        success: false,
        error: "Farm not found",
      };
    }

    if (existingFarm.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized to update this farm",
      };
    }

    // Extract form data
    const updates: any = {};

    const name = formData.get("name") as string | null;
    if (name) {
      if (name.length < 3 || name.length > 100) {
        return {
          success: false,
          error: "Farm name must be between 3 and 100 characters",
        };
      }
      updates.name = name;
    }

    const description = formData.get("description") as string | null;
    if (description) {
      if (description.length < 20 || description.length > 2000) {
        return {
          success: false,
          error: "Description must be between 20 and 2000 characters",
        };
      }
      updates.description = description;
    }

    // Update farm
    const farm = await farmService.updateFarm(farmId, updates, session.user.id);

    // Revalidate paths
    revalidatePath("/farmer/dashboard");
    revalidatePath(`/farms/${farm.slug}`);
    revalidatePath("/farms");

    return {
      success: true,
      farm,
    };
  } catch (error) {
    console.error("Farm update error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update farm",
    };
  }
}

/**
 * Delete farm action
 */
export async function deleteFarmAction(farmId: string): Promise<FarmActionResponse> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Verify ownership
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true, name: true },
    });

    if (!farm) {
      return {
        success: false,
        error: "Farm not found",
      };
    }

    if (farm.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized to delete this farm",
      };
    }

    // Delete farm
    await farmService.deleteFarm(farmId, session.user.id);

    // Revalidate paths
    revalidatePath("/farmer/dashboard");
    revalidatePath("/farms");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Farm deletion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete farm",
    };
  }
}

/**
 * Toggle farm favorite action
 */
export async function toggleFarmFavoriteAction(farmId: string): Promise<FarmActionResponse> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check if favorite exists
    const existingFavorite = await database.favorite.findUnique({
      where: {
        userId_farmId: {
          userId: session.user.id,
          farmId,
        },
      },
    });

    if (existingFavorite) {
      // Remove favorite
      await database.favorite.delete({
        where: {
          userId_farmId: {
            userId: session.user.id,
            farmId,
          },
        },
      });
    } else {
      // Add favorite
      await database.favorite.create({
        data: {
          userId: session.user.id,
          farmId,
        },
      });
    }

    // Revalidate paths
    revalidatePath("/customer/favorites");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle favorite",
    };
  }
}

/**
 * Submit farm review action
 */
export async function submitFarmReviewAction(
  farmId: string,
  rating: number,
  comment: string
): Promise<FarmActionResponse> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return {
        success: false,
        error: "Rating must be between 1 and 5",
      };
    }

    // Validate comment
    if (!comment || comment.length < 10 || comment.length > 1000) {
      return {
        success: false,
        error: "Comment must be between 10 and 1000 characters",
      };
    }

    // Check if farm exists
    const farm = await database.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      return {
        success: false,
        error: "Farm not found",
      };
    }

    // Create review
    await database.review.create({
      data: {
        farmId,
        customerId: session.user.id,
        rating,
        reviewText: comment,
      },
    });

    // Update farm rating metrics (simple average for now)
    const reviews = await database.review.findMany({
      where: { farmId },
      select: { rating: true },
    });

    const averageRating =
      reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length;

    await database.farm.update({
      where: { id: farmId },
      data: {
        averageRating,
        reviewCount: reviews.length,
      },
    });

    // Revalidate paths
    revalidatePath(`/farms/${farm.slug}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Review submission error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit review",
    };
  }
}
