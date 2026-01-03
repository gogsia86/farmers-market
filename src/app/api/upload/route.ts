import { auth } from "@/lib/auth";
import { uploadImage, validateImageFile } from "@/lib/cloudinary";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("upload-api");

/**
 * 📎 IMAGE UPLOAD API - CLOUDINARY
 * POST /api/upload - Handle image uploads with Cloudinary
 *
 * Supports:
 * - Product images
 * - Farm logos
 * - Certification documents
 * - License uploads
 */

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "product";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // 3. Validate file
    const validation = validateImageFile(file, 5); // 5MB max
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    // 4. Determine upload folder based on type
    let folder = "farmers-market/products";
    switch (type) {
      case "logo":
        folder = "farmers-market/farms/logos";
        break;
      case "certification":
        folder = "farmers-market/farms/certifications";
        break;
      case "license":
        folder = "farmers-market/farms/licenses";
        break;
      case "product":
      default:
        folder = "farmers-market/products";
        break;
    }

    // 5. Upload to Cloudinary
    const imageUrl = await uploadImage(file, folder, {
      quality: "auto:good",
      format: "auto",
      tags: [type, "farmers-market"],
    });

    // 6. Return success with URL
    return NextResponse.json({
      success: true,
      url: imageUrl,
      type,
    });
  } catch (error) {
    logger.error("Upload failed", error, {
      operation: "uploadImage",
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/upload - Get upload configuration
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      supportedFormats: ["JPEG", "JPG", "PNG", "WEBP"],
      maxDimensions: {
        width: 1200,
        height: 1200,
      },
      optimizations: {
        quality: "auto:good",
        format: "auto",
        autoWebP: true,
      },
    },
  });
}
