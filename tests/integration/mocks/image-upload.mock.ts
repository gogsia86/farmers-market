/**
 * 🖼️ Image Upload Service Mock
 *
 * Mock image upload service for integration testing.
 * Simulates image uploads, processing, and CDN delivery.
 *
 * @module tests/integration/mocks/image-upload
 * @version 1.0.0
 *
 * Divine Pattern: External service mocking with agricultural consciousness
 * Agricultural Context: Image management for farm and product photography
 */

import { randomUUID } from "crypto";

interface ImageUploadRequest {
  name: string;
  size: number;
  type?: string;
  buffer?: Buffer;
}

interface UploadedImage {
  id: string;
  url: string;
  originalName: string;
  size: number;
  type: string;
  uploadedAt: Date;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
  };
  thumbnails?: {
    small: string;
    medium: string;
    large: string;
  };
}

interface ImageProcessingOptions {
  resize?: {
    width: number;
    height: number;
    fit?: "cover" | "contain" | "fill";
  };
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  generateThumbnails?: boolean;
}

class ImageUploadServiceMock {
  private uploadedImages: UploadedImage[] = [];
  private failureRate: number = 0;
  private initialized: boolean = false;
  private baseUrl: string = "https://cdn.farmersmarket.test";
  private uploadDelay: number = 0; // Simulated upload delay in ms
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB default

  /**
   * Initialize the mock service
   */
  initialize(): void {
    this.initialized = true;
    this.reset();
    console.log("✅ Image Upload Service Mock initialized");
  }

  /**
   * Reset all mock data
   */
  reset(): void {
    this.uploadedImages = [];
    this.failureRate = 0;
    this.uploadDelay = 0;
  }

  /**
   * Set failure rate for testing error scenarios (0-100)
   */
  setFailureRate(rate: number): void {
    this.failureRate = Math.max(0, Math.min(100, rate));
  }

  /**
   * Set upload delay in milliseconds
   */
  setUploadDelay(ms: number): void {
    this.uploadDelay = Math.max(0, ms);
  }

  /**
   * Set max file size in bytes
   */
  setMaxFileSize(bytes: number): void {
    this.maxFileSize = bytes;
  }

  /**
   * Set base CDN URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, ""); // Remove trailing slash
  }

  /**
   * Upload a single image
   */
  async upload(
    request: ImageUploadRequest,
    options?: ImageProcessingOptions
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error(
        "Image upload service mock not initialized. Call initialize() first."
      );
    }

    // Validate file size
    if (request.size > this.maxFileSize) {
      throw new Error(
        `File size ${request.size} bytes exceeds maximum ${this.maxFileSize} bytes`
      );
    }

    // Simulate upload delay
    if (this.uploadDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.uploadDelay));
    }

    // Simulate failure based on failure rate
    const shouldFail = Math.random() * 100 < this.failureRate;
    if (shouldFail) {
      throw new Error(`Failed to upload image: ${request.name}`);
    }

    const id = randomUUID();
    const extension = request.type?.split("/")[1] || request.name.split(".").pop() || "jpg";
    const filename = `${id}.${extension}`;
    const url = `${this.baseUrl}/images/${filename}`;

    // Generate mock dimensions
    const width = Math.floor(Math.random() * 2000) + 800; // 800-2800px
    const height = Math.floor(Math.random() * 1500) + 600; // 600-2100px

    const uploadedImage: UploadedImage = {
      id,
      url,
      originalName: request.name,
      size: request.size,
      type: request.type || `image/${extension}`,
      uploadedAt: new Date(),
      metadata: {
        width,
        height,
        format: options?.format || extension,
      },
    };

    // Generate thumbnails if requested
    if (options?.generateThumbnails) {
      uploadedImage.thumbnails = {
        small: `${this.baseUrl}/images/thumbnails/small/${filename}`,
        medium: `${this.baseUrl}/images/thumbnails/medium/${filename}`,
        large: `${this.baseUrl}/images/thumbnails/large/${filename}`,
      };
    }

    this.uploadedImages.push(uploadedImage);

    return url;
  }

  /**
   * Upload multiple images
   */
  async uploadMultiple(
    requests: ImageUploadRequest[],
    options?: ImageProcessingOptions
  ): Promise<string[]> {
    const uploadPromises = requests.map((request) => this.upload(request, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload image with processing
   */
  async uploadAndProcess(
    request: ImageUploadRequest,
    options: ImageProcessingOptions
  ): Promise<UploadedImage> {
    const url = await this.upload(request, options);
    const image = this.uploadedImages.find((img) => img.url === url);

    if (!image) {
      throw new Error("Image not found after upload");
    }

    // Apply processing options
    if (options.resize) {
      image.metadata.width = options.resize.width;
      image.metadata.height = options.resize.height;
    }

    if (options.format) {
      image.metadata.format = options.format;
    }

    return image;
  }

  /**
   * Get uploaded image by URL
   */
  getImageByUrl(url: string): UploadedImage | undefined {
    return this.uploadedImages.find((img) => img.url === url);
  }

  /**
   * Get uploaded image by ID
   */
  getImageById(id: string): UploadedImage | undefined {
    return this.uploadedImages.find((img) => img.id === id);
  }

  /**
   * Get all uploaded images
   */
  getAllImages(): UploadedImage[] {
    return [...this.uploadedImages];
  }

  /**
   * Delete an image
   */
  async delete(url: string): Promise<boolean> {
    const index = this.uploadedImages.findIndex((img) => img.url === url);
    if (index !== -1) {
      this.uploadedImages.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Delete multiple images
   */
  async deleteMultiple(urls: string[]): Promise<number> {
    let deletedCount = 0;
    for (const url of urls) {
      const deleted = await this.delete(url);
      if (deleted) deletedCount++;
    }
    return deletedCount;
  }

  /**
   * Get image metadata
   */
  async getMetadata(url: string): Promise<UploadedImage["metadata"] | null> {
    const image = this.getImageByUrl(url);
    return image ? image.metadata : null;
  }

  /**
   * Generate thumbnail URL
   */
  getThumbnailUrl(url: string, size: "small" | "medium" | "large"): string {
    const image = this.getImageByUrl(url);
    if (image?.thumbnails) {
      return image.thumbnails[size];
    }

    // Generate on-the-fly thumbnail URL
    const filename = url.split("/").pop() || "";
    return `${this.baseUrl}/images/thumbnails/${size}/${filename}`;
  }

  /**
   * Optimize image (simulated)
   */
  async optimize(url: string, quality: number = 80): Promise<string> {
    const image = this.getImageByUrl(url);
    if (!image) {
      throw new Error(`Image not found: ${url}`);
    }

    // Simulate optimization by reducing size
    const optimizedSize = Math.floor(image.size * (quality / 100));
    image.size = optimizedSize;

    return url;
  }

  /**
   * Validate image type
   */
  isValidImageType(type: string): boolean {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    return validTypes.includes(type.toLowerCase());
  }

  /**
   * Get storage usage
   */
  getStorageUsage(): {
    totalImages: number;
    totalSize: number;
    averageSize: number;
  } {
    const totalSize = this.uploadedImages.reduce((sum, img) => sum + img.size, 0);
    const averageSize =
      this.uploadedImages.length > 0 ? totalSize / this.uploadedImages.length : 0;

    return {
      totalImages: this.uploadedImages.length,
      totalSize,
      averageSize,
    };
  }

  /**
   * Get images by date range
   */
  getImagesByDateRange(startDate: Date, endDate: Date): UploadedImage[] {
    return this.uploadedImages.filter(
      (img) => img.uploadedAt >= startDate && img.uploadedAt <= endDate
    );
  }

  /**
   * Get images by size range
   */
  getImagesBySizeRange(minSize: number, maxSize: number): UploadedImage[] {
    return this.uploadedImages.filter(
      (img) => img.size >= minSize && img.size <= maxSize
    );
  }

  /**
   * Clear all uploaded images
   */
  clear(): void {
    this.uploadedImages = [];
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const usage = this.getStorageUsage();
    const byFormat = this.uploadedImages.reduce(
      (acc, img) => {
        const format = img.metadata.format || "unknown";
        acc[format] = (acc[format] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const recentUploads = this.getImagesByDateRange(
      new Date(Date.now() - 24 * 60 * 60 * 1000),
      new Date()
    );

    return {
      totalImages: usage.totalImages,
      totalSizeBytes: usage.totalSize,
      totalSizeMB: (usage.totalSize / (1024 * 1024)).toFixed(2),
      averageSizeBytes: Math.round(usage.averageSize),
      averageSizeKB: (usage.averageSize / 1024).toFixed(2),
      byFormat,
      recentUploads: recentUploads.length,
      withThumbnails: this.uploadedImages.filter((img) => img.thumbnails).length,
    };
  }

  /**
   * Simulate CDN purge
   */
  async purgeCdn(urls?: string[]): Promise<void> {
    if (!urls) {
      // Purge all
      console.log(`Purging CDN cache for all images`);
    } else {
      console.log(`Purging CDN cache for ${urls.length} images`);
    }
    // Simulated - no actual action needed
  }

  /**
   * Generate presigned upload URL (for direct client uploads)
   */
  async generatePresignedUrl(
    filename: string,
    expiresIn: number = 3600
  ): Promise<{ url: string; fields: Record<string, string> }> {
    const uploadId = randomUUID();
    const presignedUrl = `${this.baseUrl}/upload/${uploadId}`;

    return {
      url: presignedUrl,
      fields: {
        key: `uploads/${uploadId}/${filename}`,
        "Content-Type": "multipart/form-data",
        policy: `mock_policy_${uploadId}`,
        signature: `mock_signature_${uploadId}`,
      },
    };
  }

  /**
   * Batch upload with progress tracking
   */
  async batchUpload(
    requests: ImageUploadRequest[],
    onProgress?: (progress: number) => void
  ): Promise<string[]> {
    const urls: string[] = [];

    for (let i = 0; i < requests.length; i++) {
      const url = await this.upload(requests[i]);
      urls.push(url);

      if (onProgress) {
        const progress = ((i + 1) / requests.length) * 100;
        onProgress(progress);
      }
    }

    return urls;
  }

  /**
   * Convert image format
   */
  async convertFormat(
    url: string,
    targetFormat: "jpeg" | "png" | "webp"
  ): Promise<string> {
    const image = this.getImageByUrl(url);
    if (!image) {
      throw new Error(`Image not found: ${url}`);
    }

    const id = randomUUID();
    const filename = `${id}.${targetFormat}`;
    const newUrl = `${this.baseUrl}/images/${filename}`;

    const convertedImage: UploadedImage = {
      ...image,
      id,
      url: newUrl,
      type: `image/${targetFormat}`,
      metadata: {
        ...image.metadata,
        format: targetFormat,
      },
    };

    this.uploadedImages.push(convertedImage);

    return newUrl;
  }
}

// Singleton instance
export const mockImageUploadService = new ImageUploadServiceMock();

// Export types
export type { ImageUploadRequest, UploadedImage, ImageProcessingOptions };
