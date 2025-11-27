/**
 * ☁️ CLOUDINARY IMAGE UPLOAD UTILITY
 * Farmers Market Platform - Divine Image Management with Agricultural Consciousness
 * Version: 1.0 - Cloudinary Integration
 *
 * Features:
 * - Secure image upload to Cloudinary
 * - Automatic image optimization
 * - Format conversion (WebP support)
 * - Image transformations
 * - Agricultural-themed folder organization
 */

import {
  configureCloudinary as lazyConfigureCloudinary,
  uploadToCloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  generateCloudinaryUrl,
} from "@/lib/lazy/cloudinary.lazy";
import type { UploadApiResponse } from "cloudinary";

// ============================================================================
// CLOUDINARY CONFIGURATION
// ============================================================================

/**
 * Configure Cloudinary with environment variables
 * Must be called before any upload operations
 * ⚡ PERFORMANCE: Uses lazy loading (~60-100 KB savings)
 */
async function configureCloudinary(): Promise<void> {
  await lazyConfigureCloudinary({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
    secure: true,
  });
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UploadOptions {
  folder?: string;
  width?: number;
  height?: number;
  crop?: "limit" | "fill" | "fit" | "scale" | "thumb";
  quality?: "auto" | "auto:good" | "auto:best" | number;
  format?: "auto" | "jpg" | "png" | "webp";
  tags?: string[];
}

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload image file to Cloudinary
 *
 * @param file - File object from form data
 * @param folder - Cloudinary folder path (default: "farmers-market/products")
 * @param options - Additional upload options
 * @returns Secure URL of uploaded image
 */
export async function uploadImage(
  file: File,
  folder: string = "farmers-market/products",
  options?: UploadOptions,
): Promise<string> {
  try {
    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Default upload options with divine optimization
    const uploadOptions = {
      folder: options?.folder || folder,
      transformation: [
        {
          width: options?.width || 1200,
          height: options?.height || 1200,
          crop: options?.crop || "limit",
        },
        {
          quality: options?.quality || "auto:good",
        },
        {
          fetch_format: options?.format || "auto",
        },
      ],
      tags: options?.tags || ["product", "farmers-market"],
      resource_type: "image" as const,
      overwrite: false,
      invalidate: true,
    };

    // Upload to Cloudinary (lazy-loaded)
    const result = await uploadBufferToCloudinary(buffer, uploadOptions);

    // Return secure URL
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Upload multiple images in batch
 *
 * @param files - Array of File objects
 * @param folder - Cloudinary folder path
 * @param options - Additional upload options
 * @returns Array of secure URLs
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = "farmers-market/products",
  options?: UploadOptions,
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadImage(file, folder, options),
  );
  return Promise.all(uploadPromises);
}

/**
 * Upload image with detailed result
 *
 * @param file - File object from form data
 * @param folder - Cloudinary folder path
 * @param options - Additional upload options
 * @returns Detailed upload result
 */
export async function uploadImageWithDetails(
  file: File,
  folder: string = "farmers-market/products",
  options?: UploadOptions,
): Promise<UploadResult> {
  try {
    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload options
    const uploadOptions = {
      folder: options?.folder || folder,
      transformation: [
        {
          width: options?.width || 1200,
          height: options?.height || 1200,
          crop: options?.crop || "limit",
        },
        {
          quality: options?.quality || "auto:good",
        },
        {
          fetch_format: options?.format || "auto",
        },
      ],
      tags: options?.tags || ["product", "farmers-market"],
      resource_type: "image" as const,
      overwrite: false,
      invalidate: true,
    };

    // Upload to Cloudinary (lazy-loaded)
    const result = await uploadBufferToCloudinary(buffer, uploadOptions);

    // Return detailed result
    return {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Delete image from Cloudinary
 *
 * @param publicId - Public ID of the image to delete
 * @returns Success status
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await deleteFromCloudinary(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}

/**
 * Delete multiple images in batch
 *
 * @param publicIds - Array of public IDs to delete
 * @returns Count of successfully deleted images
 */
export async function deleteMultipleImages(
  publicIds: string[],
): Promise<number> {
  try {
    // Delete images one by one using lazy wrapper
    let successCount = 0;
    for (const publicId of publicIds) {
      const success = await deleteImage(publicId);
      if (success) successCount++;
    }
    return successCount;
  } catch (error) {
    console.error("Cloudinary batch delete error:", error);
    return 0;
  }
}

/**
 * Generate optimized image URL with transformations
 *
 * @param publicId - Public ID of the image
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: UploadOptions,
): string {
  // Note: This is a synchronous function, so we can't use async lazy loading
  // We'll need to convert this to async or use a workaround
  // For now, construct URL manually following Cloudinary URL patterns
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
  const width = options?.width || 800;
  const height = options?.height || 800;
  const crop = options?.crop || "limit";
  const quality = options?.quality || "auto:good";
  const format = options?.format || "auto";

  const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
  return `${baseUrl}/${transformations}/${publicId}`;
}

// ============================================================================
// PRESET TRANSFORMATIONS
// ============================================================================

/**
 * Predefined image transformation presets for common use cases
 */
export const ImagePresets = {
  /**
   * Product thumbnail - small square image
   */
  productThumbnail: (publicId: string): string => {
    return getOptimizedImageUrl(publicId, {
      width: 200,
      height: 200,
      crop: "fill",
      quality: "auto:good",
    });
  },

  /**
   * Product card - medium rectangular image
   */
  productCard: (publicId: string): string => {
    return getOptimizedImageUrl(publicId, {
      width: 400,
      height: 400,
      crop: "limit",
      quality: "auto:good",
    });
  },

  /**
   * Product detail - large high-quality image
   */
  productDetail: (publicId: string): string => {
    return getOptimizedImageUrl(publicId, {
      width: 1200,
      height: 1200,
      crop: "limit",
      quality: "auto:best",
    });
  },

  /**
   * Farm hero image - wide banner
   */
  farmHero: (publicId: string): string => {
    return getOptimizedImageUrl(publicId, {
      width: 1920,
      height: 600,
      crop: "fill",
      quality: "auto:good",
    });
  },

  /**
   * Farm profile - square logo/avatar
   */
  farmProfile: (publicId: string): string => {
    return getOptimizedImageUrl(publicId, {
      width: 300,
      height: 300,
      crop: "fill",
      quality: "auto:good",
    });
  },
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate file type for image upload
 *
 * @param file - File to validate
 * @returns True if valid image type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  return validTypes.includes(file.type);
}

/**
 * Validate file size
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns True if within size limit
 */
export function isValidImageSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate image file completely
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5,
): { valid: boolean; error?: string } {
  if (!isValidImageType(file)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
    };
  }

  if (!isValidImageSize(file, maxSizeMB)) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}
