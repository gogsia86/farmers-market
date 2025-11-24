/**
 * 📦 REQUEST SIZE VALIDATION MIDDLEWARE
 * Protects against large payload attacks and memory exhaustion
 */

import { NextResponse } from "next/server";

export interface RequestSizeLimitConfig {
  /**
   * Maximum request body size in bytes
   */
  maxSize: number;

  /**
   * Custom error message
   */
  errorMessage?: string;
}

/**
 * Default size limits for different content types
 */
export const DEFAULT_SIZE_LIMITS = {
  JSON: 1 * 1024 * 1024, // 1MB
  TEXT: 100 * 1024, // 100KB
  FORM: 10 * 1024 * 1024, // 10MB (for file uploads)
  DEFAULT: 1 * 1024 * 1024, // 1MB
};

/**
 * Check if request size exceeds limit
 *
 * @param request - The incoming request
 * @param maxSize - Maximum allowed size in bytes
 * @returns Error response if too large, null if OK
 */
export async function validateRequestSize(
  request: Request,
  maxSize: number = DEFAULT_SIZE_LIMITS.DEFAULT,
): Promise<NextResponse | null> {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    // If no content-length header, we can't pre-validate
    // The request will still be limited by Next.js bodyParser
    return null;
  }

  const size = Number.parseInt(contentLength, 10);

  if (Number.isNaN(size)) {
    return NextResponse.json(
      {
        error: "Invalid Content-Length header",
        code: "INVALID_CONTENT_LENGTH",
      },
      { status: 400 },
    );
  }

  if (size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
    const actualSizeMB = (size / 1024 / 1024).toFixed(2);

    return NextResponse.json(
      {
        error: "Request entity too large",
        code: "PAYLOAD_TOO_LARGE",
        details: {
          maxSize: `${maxSizeMB}MB`,
          actualSize: `${actualSizeMB}MB`,
          limit: maxSize,
          received: size,
        },
      },
      {
        status: 413,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  return null;
}

/**
 * Get appropriate size limit based on content type
 */
export function getSizeLimitForContentType(contentType: string | null): number {
  if (!contentType) {
    return DEFAULT_SIZE_LIMITS.DEFAULT;
  }

  const type = contentType.toLowerCase();

  if (type.includes("application/json")) {
    return DEFAULT_SIZE_LIMITS.JSON;
  }

  if (type.includes("text/")) {
    return DEFAULT_SIZE_LIMITS.TEXT;
  }

  if (type.includes("multipart/form-data")) {
    return DEFAULT_SIZE_LIMITS.FORM;
  }

  return DEFAULT_SIZE_LIMITS.DEFAULT;
}

/**
 * Middleware helper to validate request size based on content type
 */
export async function validateRequestSizeByContentType(
  request: Request,
): Promise<NextResponse | null> {
  const contentType = request.headers.get("content-type");
  const maxSize = getSizeLimitForContentType(contentType);

  return validateRequestSize(request, maxSize);
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
