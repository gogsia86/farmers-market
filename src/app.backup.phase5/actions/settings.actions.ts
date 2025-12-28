/**
 * ⚙️ DIVINE SETTINGS MANAGEMENT SERVER ACTIONS
 * Farmers Market Platform - Settings Operations with Agricultural Consciousness
 * Version: 1.0 - Server Actions Implementation
 *
 * Features:
 * - Farm profile updates
 * - Notification settings management
 * - Payment settings configuration
 * - Authentication & authorization
 * - Input validation
 * - Cache revalidation
 */

"use server";

import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";
import { requireFarmer, getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import {
  ActionResult,
  ActionError,
  ActionErrorCode,
  createSuccessResult,
  createErrorResult,
} from "@/types/actions";
import type { Farm } from "@prisma/client";
import { Prisma } from "@prisma/client";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Farm profile update schema
 */
const updateFarmProfileSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters").max(200),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000)
    .optional()
    .nullable(),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number")
    .optional()
    .nullable(),
  website: z.string().url("Invalid website URL").optional().nullable(),
  address: z.string().min(5).max(500).optional().nullable(),
  city: z.string().min(2).max(100).optional().nullable(),
  state: z.string().min(2).max(100).optional().nullable(),
  zipCode: z.string().min(5).max(10).optional().nullable(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional()
    .nullable(),
  bio: z.string().max(1000).optional().nullable(),
  farmingPractices: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  bannerUrl: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});

/**
 * Notification settings schema
 */
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  orderNotifications: z.boolean().default(true),
  orderUpdates: z.boolean().default(true),
  newOrderAlert: z.boolean().default(true),
  lowStockAlert: z.boolean().default(true),
  reviewNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  weeklyReport: z.boolean().default(true),
  monthlyReport: z.boolean().default(true),
  notificationEmail: z.string().email().optional().nullable(),
  notificationPhone: z.string().optional().nullable(),
});

/**
 * Payment settings schema
 */
const paymentSettingsSchema = z.object({
  stripeAccountId: z.string().optional().nullable(),
  bankAccountLast4: z.string().length(4).optional().nullable(),
  paymentMethods: z
    .array(z.enum(["CARD", "CASH", "BANK_TRANSFER", "DIGITAL_WALLET"]))
    .optional(),
  acceptsCash: z.boolean().default(true),
  acceptsCard: z.boolean().default(false),
  acceptsBankTransfer: z.boolean().default(false),
  minimumOrder: z.number().min(0).optional().nullable(),
  deliveryFee: z.number().min(0).optional().nullable(),
  freeDeliveryThreshold: z.number().min(0).optional().nullable(),
  taxRate: z.number().min(0).max(100).optional().nullable(),
});

/**
 * Business hours schema
 */
const businessHoursSchema = z.object({
  monday: z
    .object({
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/),
      closed: z.boolean().default(false),
    })
    .optional()
    .nullable(),
  tuesday: z
    .object({
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/),
      closed: z.boolean().default(false),
    })
    .optional()
    .nullable(),
  wednesday: z
    .object({
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/),
      closed: z.boolean().default(false),
    })
    .optional()
    .nullable(),
  thursday: z
    .object({
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/),
      closed: z.boolean().default(false),
    })
    .optional()
    .nullable(),
  friday: z
    .object({
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/),
      closed: z.boolean().default(false),
    })
    .optional()
    .nullable(),
  saturday: z
    .object({
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/),
      closed: z.boolean().default(false),
    })
    .optional()
    .nullable(),
  sunday: z
    .object({
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/),
      closed: z.boolean().default(false),
    })
    .optional()
    .nullable(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate URL-friendly slug from farm name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Verify user owns the farm
 */
async function verifyFarmOwnership(
  farmId: string,
  userId: string,
): Promise<boolean> {
  const farm = await database.farm.findFirst({
    where: {
      id: farmId,
      ownerId: userId,
    },
  });

  return farm !== null;
}

/**
 * Check if slug is unique (excluding current farm)
 */
async function isSlugUnique(
  slug: string,
  excludeFarmId?: string,
): Promise<boolean> {
  const existing = await database.farm.findFirst({
    where: {
      slug,
      id: excludeFarmId ? { not: excludeFarmId } : undefined,
    },
  });

  return existing === null;
}

// ============================================================================
// UPDATE FARM PROFILE ACTION
// ============================================================================

/**
 * Update farm profile information
 *
 * @param farmId - ID of the farm to update
 * @param data - Updated farm profile data
 * @returns ActionResult with updated farm or error
 */
export async function updateFarmProfileAction(
  farmId: string,
  data: unknown,
): Promise<ActionResult<Farm>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to update farm profile",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can update farm profiles",
      );
    }

    // 3. Verify farm ownership
    const ownsFlag = await verifyFarmOwnership(farmId, user.id);
    if (!ownsFlag) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to update this farm",
      );
    }

    // 4. Validate input data
    const validation = updateFarmProfileSchema.safeParse(data);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        firstError?.message || "Validation failed",
        firstError?.path.join("."),
        { zodErrors: validation.error.issues },
      );
    }

    const validatedData = validation.data;

    // 5. Get existing farm to check if name changed
    const existingFarm = await database.farm.findUnique({
      where: { id: farmId },
      select: { name: true, slug: true },
    });

    if (!existingFarm) {
      return createErrorResult(ActionErrorCode.NOT_FOUND, "Farm not found");
    }

    // 6. Generate new slug if name changed
    let slug = existingFarm.slug;
    if (validatedData.name !== existingFarm.name) {
      const baseSlug = generateSlug(validatedData.name);
      slug = baseSlug;
      let counter = 1;

      // Ensure slug uniqueness
      while (!(await isSlugUnique(slug, farmId))) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // 7. Prepare update data
    const updateData: Prisma.FarmUpdateInput = {
      name: validatedData.name,
      slug,
      description: validatedData.description || undefined,
      email: validatedData.email || undefined,
      phone: validatedData.phone || undefined,
      website: validatedData.website || undefined,
      address: validatedData.address || undefined,
      city: validatedData.city || undefined,
      state: validatedData.state || undefined,
      zipCode: validatedData.zipCode || undefined,
      bannerUrl: validatedData.bannerUrl || undefined,
      logoUrl: validatedData.logoUrl || undefined,
      updatedAt: new Date(),
    };

    // Add location coordinates if provided
    if (validatedData.coordinates) {
      updateData.location = validatedData.coordinates as any;
    }

    // Add farming practices if provided
    if (validatedData.farmingPractices) {
      updateData.farmingPractices = validatedData.farmingPractices;
    }

    // Note: Certifications are handled via separate relation table

    // 8. Update farm in database
    const farm = await database.farm.update({
      where: { id: farmId },
      data: updateData,
    });

    // 9. Revalidate relevant caches
    revalidatePath("/farmer/settings");
    revalidatePath(`/farms/${farmId}`);
    revalidatePath(`/farms/${slug}`);

    // 10. Return success with updated farm
    return createSuccessResult(farm, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update farm profile error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return createErrorResult(
          ActionErrorCode.CONFLICT,
          "A farm with this name already exists",
          "name",
        );
      }
      if (error.code === "P2025") {
        return createErrorResult(ActionErrorCode.NOT_FOUND, "Farm not found");
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to update farm profile. Please try again.",
    );
  }
}

// ============================================================================
// UPDATE NOTIFICATION SETTINGS ACTION
// ============================================================================

/**
 * Update notification preferences for farm
 *
 * @param farmId - ID of the farm
 * @param settings - Notification settings
 * @returns ActionResult with void or error
 */
export async function updateNotificationSettingsAction(
  farmId: string,
  settings: unknown,
): Promise<ActionResult<void>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to update notification settings",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can update notification settings",
      );
    }

    // 3. Verify farm ownership
    const ownsFlag = await verifyFarmOwnership(farmId, user.id);
    if (!ownsFlag) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to update settings for this farm",
      );
    }

    // 4. Validate settings data
    const validation = notificationSettingsSchema.safeParse(settings);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        firstError?.message || "Validation failed",
        firstError?.path.join("."),
      );
    }

    // 5. Store notification settings (using farm metadata or create separate settings table)
    // For now, we'll use a JSON field approach
    await database.farm.update({
      where: { id: farmId },
      data: {
        // Store in metadata field or handle separately
        updatedAt: new Date(),
      },
    });

    // TODO: Store notification settings in user preferences or separate table

    // 6. Revalidate caches
    revalidatePath("/farmer/settings");

    // 7. Return success
    return createSuccessResult(undefined, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update notification settings error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResult(ActionErrorCode.NOT_FOUND, "Farm not found");
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to update notification settings. Please try again.",
    );
  }
}

// ============================================================================
// UPDATE PAYMENT SETTINGS ACTION
// ============================================================================

/**
 * Update payment configuration for farm
 *
 * @param farmId - ID of the farm
 * @param data - Payment settings data
 * @returns ActionResult with void or error
 */
export async function updatePaymentSettingsAction(
  farmId: string,
  data: unknown,
): Promise<ActionResult<void>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to update payment settings",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can update payment settings",
      );
    }

    // 3. Verify farm ownership
    const ownsFlag = await verifyFarmOwnership(farmId, user.id);
    if (!ownsFlag) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to update settings for this farm",
      );
    }

    // 4. Validate payment data
    const validation = paymentSettingsSchema.safeParse(data);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        firstError?.message || "Validation failed",
        firstError?.path.join("."),
      );
    }

    const validatedData = validation.data;

    // 5. Update farm with payment settings
    await database.farm.update({
      where: { id: farmId },
      data: {
        stripeAccountId: validatedData.stripeAccountId || undefined,
        updatedAt: new Date(),
      },
    });

    // TODO: Store payment methods in separate configuration

    // 6. Revalidate caches
    revalidatePath("/farmer/settings");

    // 7. Return success
    return createSuccessResult(undefined, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update payment settings error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResult(ActionErrorCode.NOT_FOUND, "Farm not found");
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to update payment settings. Please try again.",
    );
  }
}

// ============================================================================
// UPDATE BUSINESS HOURS ACTION
// ============================================================================

/**
 * Update business hours for farm
 *
 * @param farmId - ID of the farm
 * @param hours - Business hours data
 * @returns ActionResult with void or error
 */
export async function updateBusinessHoursAction(
  farmId: string,
  hours: unknown,
): Promise<ActionResult<void>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to update business hours",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can update business hours",
      );
    }

    // 3. Verify farm ownership
    const ownsFlag = await verifyFarmOwnership(farmId, user.id);
    if (!ownsFlag) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to update settings for this farm",
      );
    }

    // 4. Validate business hours data
    const validation = businessHoursSchema.safeParse(hours);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        firstError?.message || "Validation failed",
        firstError?.path.join("."),
      );
    }

    // 5. Update farm with business hours (store in metadata or separate table)
    await database.farm.update({
      where: { id: farmId },
      data: {
        // Store business hours in metadata or create separate hours table
        updatedAt: new Date(),
      },
    });

    // TODO: Store business hours in separate table or JSON field

    // 6. Revalidate caches
    revalidatePath("/farmer/settings");
    revalidatePath(`/farms/${farmId}`);

    // 7. Return success
    return createSuccessResult(undefined, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update business hours error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResult(ActionErrorCode.NOT_FOUND, "Farm not found");
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to update business hours. Please try again.",
    );
  }
}

// ============================================================================
// GET FARM SETTINGS ACTION (Read-only)
// ============================================================================

/**
 * Get current farm settings
 *
 * @param farmId - ID of the farm
 * @returns ActionResult with farm settings or error
 */
export async function getFarmSettingsAction(
  farmId: string,
): Promise<ActionResult<Farm>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to view farm settings",
      );
    }

    // 2. Verify farm ownership
    const ownsFlag = await verifyFarmOwnership(farmId, user.id);
    if (!ownsFlag) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to view settings for this farm",
      );
    }

    // 3. Fetch farm data
    const farm = await database.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      return createErrorResult(ActionErrorCode.NOT_FOUND, "Farm not found");
    }

    // 4. Return farm settings
    return createSuccessResult(farm, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get farm settings error:", error);

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to fetch farm settings. Please try again.",
    );
  }
}
