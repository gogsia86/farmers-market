/**
 * ☁️ LAZY CLOUDINARY LOADING
 * Divine lazy-loading wrapper for Cloudinary
 * Reduces initial bundle size by ~60-100 KB
 *
 * @module lib/lazy/cloudinary.lazy
 * @category Performance Optimization
 */

import type { v2 as cloudinaryV2 } from "cloudinary";
import type {
  UploadApiOptions,
  UploadApiResponse,
  ConfigOptions,
  ResourceApiResponse,
} from "cloudinary";

// ============================================================================
// TYPES
// ============================================================================

export type { UploadApiOptions, UploadApiResponse, ConfigOptions, ResourceApiResponse };

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  secure?: boolean;
}

export interface CloudinaryUploadOptions extends UploadApiOptions {
  folder?: string;
  public_id?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  transformation?: Array<Record<string, any>>;
}

// ============================================================================
// LAZY LOADING
// ============================================================================

let cloudinaryPromise: Promise<typeof cloudinaryV2> | null = null;
let cloudinaryInstance: typeof cloudinaryV2 | null = null;
let isConfigured = false;

/**
 * Load Cloudinary lazily
 * Caches the promise to avoid multiple imports
 */
async function loadCloudinary(): Promise<typeof cloudinaryV2> {
  if (!cloudinaryPromise) {
    cloudinaryPromise = import("cloudinary").then((module) => {
      cloudinaryInstance = module.v2;
      return module.v2;
    });
  }
  return cloudinaryPromise;
}

/**
 * Configure Cloudinary (lazy-loaded)
 * Must be called before using other functions
 *
 * @example
 * ```typescript
 * await configureCloudinary({
 *   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 *   api_key: process.env.CLOUDINARY_API_KEY,
 *   api_secret: process.env.CLOUDINARY_API_SECRET,
 * });
 * ```
 */
export async function configureCloudinary(
  config: CloudinaryConfig
): Promise<void> {
  const cloudinary = await loadCloudinary();
  cloudinary.config(config);
  isConfigured = true;
}

/**
 * Get configured Cloudinary instance
 * Auto-configures if environment variables are available
 */
async function getCloudinary(): Promise<typeof cloudinaryV2> {
  const cloudinary = await loadCloudinary();

  if (!isConfigured) {
    // Auto-configure from environment variables
    const config: CloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
      api_key: process.env.CLOUDINARY_API_KEY || "",
      api_secret: process.env.CLOUDINARY_API_SECRET || "",
      secure: true,
    };

    if (config.cloud_name && config.api_key && config.api_secret) {
      cloudinary.config(config);
      isConfigured = true;
    } else {
      throw new Error(
        "Cloudinary not configured. Call configureCloudinary() or set environment variables."
      );
    }
  }

  return cloudinary;
}

// ============================================================================
// LAZY API
// ============================================================================

/**
 * Upload file to Cloudinary (lazy-loaded)
 *
 * @example
 * ```typescript
 * const result = await uploadToCloudinary(
 *   "/path/to/image.jpg",
 *   {
 *     folder: "products",
 *     public_id: "product-123",
 *     transformation: [{ width: 800, height: 600, crop: "fill" }],
 *   }
 * );
 *
 * console.log(result.secure_url); // https://res.cloudinary.com/...
 * ```
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  options?: CloudinaryUploadOptions
): Promise<UploadApiResponse> {
  const cloudinary = await getCloudinary();
  return cloudinary.uploader.upload(file as string, options);
}

/**
 * Upload buffer/stream to Cloudinary (lazy-loaded)
 * Useful for in-memory files or streams
 *
 * @example
 * ```typescript
 * const buffer = await sharp(inputFile)
 *   .resize(800, 600)
 *   .toBuffer();
 *
 * const result = await uploadBufferToCloudinary(buffer, {
 *   folder: "thumbnails",
 *   format: "webp",
 * });
 * ```
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options?: CloudinaryUploadOptions
): Promise<UploadApiResponse> {
  const cloudinary = await getCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options || {},
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as UploadApiResponse);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete file from Cloudinary (lazy-loaded)
 *
 * @example
 * ```typescript
 * await deleteFromCloudinary("products/product-123");
 * ```
 */
export async function deleteFromCloudinary(
  publicId: string,
  options?: { resource_type?: "image" | "video" | "raw" }
): Promise<any> {
  const cloudinary = await getCloudinary();
  return cloudinary.uploader.destroy(publicId, options);
}

/**
 * Get resource details from Cloudinary (lazy-loaded)
 *
 * @example
 * ```typescript
 * const details = await getCloudinaryResource("products/product-123");
 * console.log(details.width, details.height, details.format);
 * ```
 */
export async function getCloudinaryResource(
  publicId: string,
  options?: { resource_type?: "image" | "video" | "raw" }
): Promise<ResourceApiResponse> {
  const cloudinary = await getCloudinary();
  return cloudinary.api.resource(publicId, options);
}

/**
 * Generate Cloudinary URL with transformations (lazy-loaded)
 *
 * @example
 * ```typescript
 * const url = await generateCloudinaryUrl("products/product-123", {
 *   width: 400,
 *   height: 300,
 *   crop: "fill",
 *   quality: "auto",
 *   fetch_format: "auto",
 * });
 * ```
 */
export async function generateCloudinaryUrl(
  publicId: string,
  transformations?: Record<string, any>
): Promise<string> {
  const cloudinary = await getCloudinary();
  return cloudinary.url(publicId, transformations);
}

/**
 * List resources in a folder (lazy-loaded)
 *
 * @example
 * ```typescript
 * const { resources } = await listCloudinaryResources("products", {
 *   max_results: 50,
 *   resource_type: "image",
 * });
 * ```
 */
export async function listCloudinaryResources(
  prefix?: string,
  options?: {
    max_results?: number;
    next_cursor?: string;
    resource_type?: "image" | "video" | "raw";
  }
): Promise<any> {
  const cloudinary = await getCloudinary();
  return cloudinary.api.resources({
    type: "upload",
    prefix: prefix,
    ...options,
  });
}

/**
 * Queue upload for background processing (fire-and-forget)
 * Useful when you don't need the result immediately
 *
 * @example
 * ```typescript
 * // In API route - don't wait for upload
 * queueCloudinaryUpload(fileBuffer, {
 *   folder: "user-uploads",
 *   public_id: `user-${userId}-${Date.now()}`,
 * });
 *
 * return NextResponse.json({ success: true, message: "Upload queued" });
 * ```
 */
export function queueCloudinaryUpload(
  file: string | Buffer,
  options?: CloudinaryUploadOptions
): void {
  // Fire and forget - don't await
  const uploadPromise =
    typeof file === "string"
      ? uploadToCloudinary(file, options)
      : uploadBufferToCloudinary(file, options);

  uploadPromise.catch((error) => {
    console.error("❌ Failed to upload to Cloudinary:", error);
    // TODO: Add to retry queue or dead letter queue
  });
}

// ============================================================================
// MIGRATION GUIDE
// ============================================================================

/*
MIGRATION GUIDE:

Before (eager loading - adds ~60-100 KB to bundle):
```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const result = await cloudinary.uploader.upload(filePath, {
  folder: "products",
  public_id: "product-123",
});
```

After (lazy loading):
```typescript
import { uploadToCloudinary, configureCloudinary } from "@/lib/lazy/cloudinary.lazy";

// Option 1: Auto-configure (uses environment variables)
const result = await uploadToCloudinary(filePath, {
  folder: "products",
  public_id: "product-123",
});

// Option 2: Manual configure first
await configureCloudinary({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});
const result = await uploadToCloudinary(filePath, options);

// Option 3: Fire-and-forget (for non-critical uploads)
queueCloudinaryUpload(fileBuffer, { folder: "temp" });
```

EXPECTED SAVINGS:
- Bundle size reduction: ~60-100 KB
- First load improvement: ~40-60ms (depends on Cloudinary usage)
- Only loads when image upload/management functionality is actually used

FILES TO UPDATE:
- src/lib/cloudinary.ts
- Any API routes that handle image uploads
- Image management components
*/
