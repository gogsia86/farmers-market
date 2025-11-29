import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { writeFile } from "fs/promises";
import path from "path";
import { existsSync, mkdirSync } from "fs";

/**
 * GET /api/users/profile
 *
 * Fetch authenticated user's profile data
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const user = await database.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        dietaryPreferences: true,
        notificationPreferences: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        avatar: user.avatar || null,
        dietaryPreferences: user.dietaryPreferences || [],
        notificationPreferences: user.notificationPreferences || {
          email: {
            orderUpdates: true,
            promotions: true,
            newsletter: false,
          },
          sms: {
            orderUpdates: true,
            deliveryAlerts: true,
          },
          push: {
            orderUpdates: true,
            newProducts: false,
          },
        },
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/users/profile
 *
 * Update authenticated user's profile
 * Supports both JSON and FormData (for avatar upload)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let updateData: any = {};
    let avatarUrl: string | null = null;

    // Handle FormData (with file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      // Extract text fields
      const firstName = formData.get("firstName") as string | null;
      const lastName = formData.get("lastName") as string | null;
      const phone = formData.get("phone") as string | null;
      const dietaryPreferences = formData.get("dietaryPreferences") as
        | string
        | null;
      const notificationPreferences = formData.get(
        "notificationPreferences",
      ) as string | null;

      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phone !== null) updateData.phone = phone || null;

      if (dietaryPreferences) {
        try {
          updateData.dietaryPreferences = JSON.parse(dietaryPreferences);
        } catch (e) {
          console.error("Failed to parse dietaryPreferences:", e);
        }
      }

      if (notificationPreferences) {
        try {
          updateData.notificationPreferences = JSON.parse(
            notificationPreferences,
          );
        } catch (e) {
          console.error("Failed to parse notificationPreferences:", e);
        }
      }

      // Handle avatar file upload
      const avatarFile = formData.get("avatar") as File | null;
      if (avatarFile && avatarFile.size > 0) {
        // Validate file size (5MB max)
        if (avatarFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: "Image must be less than 5MB" },
            { status: 400 },
          );
        }

        // Validate file type
        if (!avatarFile.type.startsWith("image/")) {
          return NextResponse.json(
            { success: false, error: "File must be an image" },
            { status: 400 },
          );
        }

        try {
          // Create uploads directory if it doesn't exist
          const uploadsDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            "avatars",
          );
          if (!existsSync(uploadsDir)) {
            mkdirSync(uploadsDir, { recursive: true });
          }

          // Generate unique filename
          const timestamp = Date.now();
          const extension = avatarFile.name.split(".").pop() || "jpg";
          const filename = `${session.user.id}-${timestamp}.${extension}`;
          const filepath = path.join(uploadsDir, filename);

          // Save file
          const bytes = await avatarFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filepath, buffer);

          // Set avatar URL
          avatarUrl = `/uploads/avatars/${filename}`;
          updateData.avatar = avatarUrl;
        } catch (uploadError) {
          console.error("Avatar upload error:", uploadError);
          return NextResponse.json(
            { success: false, error: "Failed to upload avatar" },
            { status: 500 },
          );
        }
      }
    } else {
      // Handle JSON
      const body = await request.json();

      if (body.firstName !== undefined) updateData.firstName = body.firstName;
      if (body.lastName !== undefined) updateData.lastName = body.lastName;
      if (body.phone !== undefined) updateData.phone = body.phone || null;
      if (body.dietaryPreferences !== undefined) {
        updateData.dietaryPreferences = body.dietaryPreferences;
      }
      if (body.notificationPreferences !== undefined) {
        updateData.notificationPreferences = body.notificationPreferences;
      }
    }

    // Update user
    const updatedUser = await database.user.update({
      where: { id: session.user.id },
      data: {
        ...updateData,
        name:
          updateData.firstName && updateData.lastName
            ? `${updateData.firstName} ${updateData.lastName}`
            : undefined,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        dietaryPreferences: true,
        notificationPreferences: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        phone: updatedUser.phone || "",
        avatar: updatedUser.avatar || null,
        dietaryPreferences: updatedUser.dietaryPreferences || [],
        notificationPreferences: updatedUser.notificationPreferences || {},
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
