/**
 * 📎 FILE UPLOAD SERVICE
 * Handles document uploads for farmer registration and products
 * Supports: Business licenses, certifications, product images
 */

import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import { logger } from "@/lib/monitoring/logger";

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  folder?: string;
}

class FileUploadService {
  private uploadDir: string;
  private publicUrl: string;
  private maxFileSize = 10 * 1024 * 1024; // 10MB default

  constructor() {
    // Files stored in /public/uploads
    this.uploadDir = join(process.cwd(), "public", "uploads");
    this.publicUrl = "/uploads";
    this.ensureUploadDir();
  }

  /**
   * Ensure upload directories exist
   */
  private async ensureUploadDir() {
    const folders = [
      "certifications",
      "licenses",
      "products",
      "documents",
      "logos",
    ];

    try {
      for (const folder of folders) {
        const path = join(this.uploadDir, folder);
        if (!existsSync(path)) {
          await mkdir(path, { recursive: true });
        }
      }
      logger.info("✅ Upload directories ready");
    } catch (error) {
      logger.error("❌ Error creating upload directories:", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    file: File,
    options: UploadOptions = {},
  ): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || this.maxFileSize;
    const allowedTypes = options.allowedTypes || [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed: ${allowedTypes.join(", ")}`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop() || "file";
    const safeName = (originalName.split(".")[0] || "file")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    if (prefix) {
      return `${prefix}_${timestamp}_${random}_${safeName}.${extension}`;
    }

    return `${timestamp}_${random}_${safeName}.${extension}`;
  }

  /**
   * Upload file to server
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate filename
      const folder = options.folder || "documents";
      const filename = this.generateFilename(file.name, folder);
      const filePath = join(this.uploadDir, folder, filename);

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write file
      await writeFile(filePath, buffer);

      // Return public URL
      const publicUrl = `${this.publicUrl}/${folder}/${filename}`;

      logger.info(`✅ File uploaded: ${publicUrl}`);

      return {
        success: true,
        url: publicUrl,
        path: filePath,
      };
    } catch (error) {
      logger.error("❌ File upload error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: "Failed to upload file",
      };
    }
  }

  /**
   * Upload business license
   */
  async uploadBusinessLicense(
    file: File,
    _farmId: string,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      folder: "licenses",
      allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
      maxSize: 5 * 1024 * 1024, // 5MB
    });
  }

  /**
   * Upload certification document
   */
  async uploadCertification(
    file: File,
    _farmId: string,
    _certificationType: string,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      folder: "certifications",
      allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
      maxSize: 5 * 1024 * 1024, // 5MB
    });
  }

  /**
   * Upload product image
   */
  async uploadProductImage(
    file: File,
    _productId: string,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      folder: "products",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxSize: 2 * 1024 * 1024, // 2MB
    });
  }

  /**
   * Upload farm logo
   */
  async uploadFarmLogo(file: File, _farmId: string): Promise<UploadResult> {
    return this.uploadFile(file, {
      folder: "logos",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxSize: 1 * 1024 * 1024, // 1MB
    });
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: File[],
    options: UploadOptions = {},
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadFile(file, options);
      results.push(result);
    }

    return results;
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();

// Export types
export type { UploadOptions, UploadResult };
