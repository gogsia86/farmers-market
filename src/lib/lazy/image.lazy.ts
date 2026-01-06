/**
 * 🎨 Lazy Loading Wrapper - Sharp Image Processing
 * Farmers Market Platform - Performance Optimization
 *
 * Phase 6 Optimization #2: Image Processing Lazy Loading
 * Expected Savings: 40-50 KB
 *
 * Sharp is a heavy image processing library that should only be loaded
 * when actually needed (e.g., when user uploads an image), not on every page load.
 *
 * @module lib/lazy/image.lazy
 */

import type Sharp from "sharp";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

import { logger } from '@/lib/monitoring/logger';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp" | "avif";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
}

export interface ImageOptimizationResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
}

// ============================================================================
// LAZY SHARP LOADER
// ============================================================================

let sharpPromise: Promise<typeof import("sharp")> | null = null;

/**
 * Lazy load the Sharp module
 * Only imports the module on first use
 */
export async function loadSharp(): Promise<typeof Sharp> {
  if (!sharpPromise) {
    sharpPromise = import("sharp").then((module) => module.default);
  }
  return sharpPromise;
}

// ============================================================================
// PUBLIC API - IMAGE PROCESSING FUNCTIONS
// ============================================================================

/**
 * Process and optimize an image
 * Sharp is loaded on first call
 *
 * @example
 * ```typescript
 * const optimized = await processImage(imageBuffer, {
 *   width: 1200,
 *   height: 800,
 *   format: 'webp',
 *   quality: 80
 * });
 * ```
 */
export async function processImage(
  input: Buffer | string,
  options: ImageProcessingOptions = {},
): Promise<ImageOptimizationResult> {
  const sharp = await loadSharp();

  const {
    width,
    height,
    quality = 80,
    format = "webp",
    fit = "cover",
  } = options;

  let processor = sharp(input);

  // Resize if dimensions provided
  if (width || height) {
    processor = processor.resize(width, height, { fit });
  }

  // Convert format and optimize
  switch (format) {
    case "jpeg":
      processor = processor.jpeg({ quality, progressive: true });
      break;
    case "png":
      processor = processor.png({ quality, compressionLevel: 9 });
      break;
    case "webp":
      processor = processor.webp({ quality });
      break;
    case "avif":
      processor = processor.avif({ quality });
      break;
  }

  const buffer = await processor.toBuffer({ resolveWithObject: true });

  return {
    buffer: buffer.data,
    format: buffer.info.format,
    width: buffer.info.width,
    height: buffer.info.height,
    size: buffer.info.size,
  };
}

/**
 * Generate multiple sizes of an image (responsive images)
 *
 * @example
 * ```typescript
 * const sizes = await generateResponsiveImages(imageBuffer, {
 *   sizes: [320, 640, 1024, 1920],
 *   format: 'webp'
 * });
 * ```
 */
export async function generateResponsiveImages(
  input: Buffer | string,
  options: {
    sizes: number[];
    format?: "jpeg" | "png" | "webp" | "avif";
    quality?: number;
  },
): Promise<ImageOptimizationResult[]> {
  const { sizes, format = "webp", quality = 80 } = options;

  const results = await Promise.all(
    sizes.map((width) =>
      processImage(input, {
        width,
        format,
        quality,
        fit: "inside",
      }),
    ),
  );

  return results;
}

/**
 * Create a thumbnail from an image
 *
 * @example
 * ```typescript
 * const thumb = await createThumbnail(imageBuffer, {
 *   width: 200,
 *   height: 200,
 *   quality: 70
 * });
 * ```
 */
export async function createThumbnail(
  input: Buffer | string,
  options: ThumbnailOptions,
): Promise<Buffer> {
  const sharp = await loadSharp();

  const { width, height, quality = 70 } = options;

  return await sharp(input)
    .resize(width, height, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality })
    .toBuffer();
}

/**
 * Extract image metadata without full processing
 *
 * @example
 * ```typescript
 * const metadata = await getImageMetadata(imageBuffer);
 * logger.info(metadata.width, metadata.height, metadata.format);
 * ```
 */
export async function getImageMetadata(input: Buffer | string): Promise<{
  width: number;
  height: number;
  format: string;
  size?: number;
  space?: string;
  channels?: number;
  depth?: string;
  density?: number;
  hasAlpha?: boolean;
}> {
  const sharp = await loadSharp();
  return await sharp(input).metadata();
}

/**
 * Compress image without resizing
 *
 * @example
 * ```typescript
 * const compressed = await compressImage(imageBuffer, {
 *   format: 'webp',
 *   quality: 75
 * });
 * ```
 */
export async function compressImage(
  input: Buffer | string,
  options: {
    format?: "jpeg" | "png" | "webp" | "avif";
    quality?: number;
  } = {},
): Promise<Buffer> {
  const { format = "webp", quality = 75 } = options;

  const result = await processImage(input, { format, quality });
  return result.buffer;
}

// ============================================================================
// AGRICULTURAL-SPECIFIC IMAGE PROCESSING
// ============================================================================

/**
 * Process product images with optimal settings for e-commerce
 *
 * @example
 * ```typescript
 * const productImages = await processProductImage(imageBuffer);
 * // Returns: { full, thumbnail, preview }
 * ```
 */
export async function processProductImage(input: Buffer | string): Promise<{
  full: Buffer;
  thumbnail: Buffer;
  preview: Buffer;
}> {
  const [full, thumbnail, preview] = await Promise.all([
    // Full size - optimized for product page
    processImage(input, {
      width: 1200,
      height: 1200,
      format: "webp",
      quality: 85,
      fit: "inside",
    }).then((r) => r.buffer),

    // Thumbnail - for product listings
    createThumbnail(input, {
      width: 300,
      height: 300,
      quality: 75,
    }),

    // Preview - for quick previews
    createThumbnail(input, {
      width: 600,
      height: 600,
      quality: 80,
    }),
  ]);

  return { full, thumbnail, preview };
}

/**
 * Process farm profile images
 */
export async function processFarmImage(input: Buffer | string): Promise<{
  banner: Buffer;
  thumbnail: Buffer;
}> {
  const [banner, thumbnail] = await Promise.all([
    // Banner - wide format for farm header
    processImage(input, {
      width: 1920,
      height: 480,
      format: "webp",
      quality: 85,
      fit: "cover",
    }).then((r) => r.buffer),

    // Thumbnail - for farm cards
    createThumbnail(input, {
      width: 400,
      height: 300,
      quality: 75,
    }),
  ]);

  return { banner, thumbnail };
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Process multiple images in parallel
 *
 * @example
 * ```typescript
 * const results = await batchProcessImages(imageBuffers, {
 *   width: 800,
 *   format: 'webp'
 * });
 * ```
 */
export async function batchProcessImages(
  images: (Buffer | string)[],
  options: ImageProcessingOptions = {},
): Promise<ImageOptimizationResult[]> {
  return await Promise.all(images.map((img) => processImage(img, options)));
}

// ============================================================================
// VALIDATION & UTILITIES
// ============================================================================

/**
 * Validate image file before processing
 */
export async function validateImage(
  input: Buffer | string,
): Promise<{ valid: boolean; error?: string; metadata?: any }> {
  try {
    const metadata = await getImageMetadata(input);

    // Check if format is supported
    const supportedFormats = ["jpeg", "jpg", "png", "webp", "avif", "gif"];
    if (!supportedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Unsupported format: ${metadata.format}`,
      };
    }

    // Check dimensions (max 10000x10000)
    if (metadata.width > 10000 || metadata.height > 10000) {
      return {
        valid: false,
        error: "Image dimensions too large (max 10000x10000)",
      };
    }

    return { valid: true, metadata };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid image",
    };
  }
}

/**
 * Convert image to base64 data URL
 */
export async function imageToBase64(
  input: Buffer | string,
  options: ImageProcessingOptions = {},
): Promise<string> {
  const result = await processImage(input, options);
  const base64 = result.buffer.toString("base64");
  return `data:image/${result.format};base64,${base64}`;
}

/**
 * Preload Sharp module during idle time
 */
export function preloadImageProcessing(): void {
  if (typeof window === "undefined" && !sharpPromise) {
    // Only preload on server-side
    setTimeout(() => {
      loadSharp().catch(() => {
        // Ignore preload errors
      });
    }, 1000);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  processImage,
  generateResponsiveImages,
  createThumbnail,
  getImageMetadata,
  compressImage,
  processProductImage,
  processFarmImage,
  batchProcessImages,
  validateImage,
  imageToBase64,
  preloadImageProcessing,
};
