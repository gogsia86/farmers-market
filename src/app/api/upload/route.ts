import { requireFarmerAuth } from "@/lib/auth/farmer-auth";
import { fileUploadService } from "@/lib/upload/file-upload-service";
import { NextRequest, NextResponse } from "next/server";

/**
 * 📎 FILE UPLOAD API
 * POST /api/upload - Handle file uploads
 */

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireFarmerAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    const farmId = formData.get("farmId") as string | null;
    const productId = formData.get("productId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json(
        { error: "Upload type required" },
        { status: 400 }
      );
    }

    let result;

    // Handle different upload types
    switch (type) {
      case "license":
        if (!farmId) {
          return NextResponse.json(
            { error: "Farm ID required for license upload" },
            { status: 400 }
          );
        }
        result = await fileUploadService.uploadBusinessLicense(file, farmId);
        break;

      case "certification":
        if (!farmId) {
          return NextResponse.json(
            { error: "Farm ID required for certification upload" },
            { status: 400 }
          );
        }
        const certType =
          (formData.get("certificationType") as string) || "general";
        result = await fileUploadService.uploadCertification(
          file,
          farmId,
          certType
        );
        break;

      case "product":
        if (!productId) {
          return NextResponse.json(
            { error: "Product ID required for product image upload" },
            { status: 400 }
          );
        }
        result = await fileUploadService.uploadProductImage(file, productId);
        break;

      case "logo":
        if (!farmId) {
          return NextResponse.json(
            { error: "Farm ID required for logo upload" },
            { status: 400 }
          );
        }
        result = await fileUploadService.uploadFarmLogo(file, farmId);
        break;

      default:
        result = await fileUploadService.uploadFile(file);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        path: result.path,
        type,
      },
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: {
        license: ["application/pdf", "image/jpeg", "image/png"],
        certification: ["application/pdf", "image/jpeg", "image/png"],
        product: ["image/jpeg", "image/png", "image/webp"],
        logo: ["image/jpeg", "image/png", "image/webp"],
      },
      maxSizes: {
        license: 5 * 1024 * 1024, // 5MB
        certification: 5 * 1024 * 1024, // 5MB
        product: 2 * 1024 * 1024, // 2MB
        logo: 1 * 1024 * 1024, // 1MB
      },
    },
  });
}
