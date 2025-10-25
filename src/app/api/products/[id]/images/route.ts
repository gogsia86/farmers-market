/**
 * PRODUCT IMAGE UPLOAD API ROUTE
 * Divine endpoint for agricultural product image management
 * POST /api/products/[id]/images - Upload product images
 */

import { authOptions } from "@/lib/auth";
import { ProductService } from "@/lib/services/product.service";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// ============================================
// POST /api/products/[id]/images - Upload Images
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: productId } = params;

    // Verify product ownership
    const product = await ProductService.getProductById(productId, true);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.farm?.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You don't own this product" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Validate file count (max 10 images)
    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 images allowed" },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const allowedTypes = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]);
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.has(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid file type: ${file.type}. Allowed: jpeg, jpg, png, webp`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 5MB limit` },
          { status: 400 }
        );
      }
    }

    // Upload images
    const uploadedUrls: string[] = [];
    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "products",
      productId
    );

    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const timestamp = Date.now();
      const filename = `${timestamp}-${sanitizeFilename(file.name)}`;
      const filepath = join(uploadDir, filename);

      // Write file
      await writeFile(filepath, buffer);

      // Generate public URL
      const publicUrl = `/uploads/products/${productId}/${filename}`;
      uploadedUrls.push(publicUrl);
    }

    // Update product images
    const currentImages = product.images || [];
    const newImages = uploadedUrls.map((url, index) => ({
      id: `img_${Date.now()}_${index}`,
      url,
      alt: `${product.name} - Image ${currentImages.length + index + 1}`,
      isPrimary: currentImages.length === 0 && index === 0, // First image is primary if no images exist
      order: currentImages.length + index,
      uploadedAt: new Date(),
    }));

    // Update product with new images
    await ProductService.updateProduct(
      productId,
      {
        images: [...currentImages, ...newImages],
      },
      session.user.id
    );

    return NextResponse.json(
      {
        message: "Images uploaded successfully",
        images: newImages,
        urls: uploadedUrls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading product images:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sanitize filename to prevent path traversal attacks
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replaceAll(/[^a-z0-9.-]/gi, "_")
    .replaceAll(/_{2,}/g, "_")
    .toLowerCase();
}
