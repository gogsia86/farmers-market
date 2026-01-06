/**
 * 🔐 ADMIN FARM VERIFICATION API - Divine Farm Approval System
 * Handles farm verification workflow with agricultural consciousness
 *
 * Routes:
 * - POST /api/admin/farms/verify - Approve or reject farm verification
 *
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 11_KILO_SCALE_ARCHITECTURE
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { FarmVerificationStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from '@/lib/monitoring/logger';

/**
 * ✅ POST - Approve or Reject Farm Verification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to verify farms",
          },
        },
        { status: 401 }
      );
    }

    // Check admin authorization
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Only admins can verify farms",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validation schema
    const VerifyFarmSchema = z.object({
      farmId: z.string().min(1),
      action: z.enum(["approve", "reject"]),
      reason: z.string().max(500).optional(),
      notes: z.string().max(1000).optional(),
    }).refine(
      (data) => {
        // If rejecting, reason is required
        if (data.action === "reject" && !data.reason) {
          return false;
        }
        return true;
      },
      {
        message: "Reason is required when rejecting a farm",
        path: ["reason"],
      }
    );

    const validation = VerifyFarmSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid verification data",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { farmId, action, reason, notes } = validation.data;

    // Get farm
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        certifications: true,
      },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_FOUND",
            message: "Farm not found",
          },
        },
        { status: 404 }
      );
    }

    // Check if farm is already verified or rejected
    if (farm.verificationStatus === "VERIFIED" && action === "approve") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_VERIFIED",
            message: "This farm is already verified",
          },
        },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === "approve") {
      // Approve farm verification
      const updatedFarm = await database.farm.update({
        where: { id: farmId },
        data: {
          verificationStatus: "VERIFIED" as FarmVerificationStatus,
          verifiedBy: session.user.id,
          verifiedAt: now,
          rejectionReason: null,
          status: "ACTIVE",
          updatedAt: now,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Log admin action
      await database.adminAction.create({
        data: {
          type: "FARM_VERIFIED",
          adminId: session.user.id,
          targetId: farmId,
          targetType: "FARM",
          description: `Approved farm verification: ${farm.name}`,
          metadata: {
            farmId,
            farmName: farm.name,
            ownerId: farm.ownerId,
            notes,
          },
        },
      });

      // TODO: Send email notification to farm owner
      // await sendFarmApprovalEmail(updatedFarm.owner.email, updatedFarm);

      // TODO: Create notification for farm owner
      // await createNotification({
      //   userId: updatedFarm.ownerId,
      //   type: "FARM_VERIFIED",
      //   title: "Farm Approved!",
      //   body: `Your farm "${updatedFarm.name}" has been verified and is now active.`,
      // });

      return NextResponse.json({
        success: true,
        data: {
          farm: updatedFarm,
          message: "Farm verified successfully",
        },
        agricultural: {
          consciousness: "DIVINE",
          season: getCurrentSeason(),
        },
      });
    } else {
      // Reject farm verification
      const updatedFarm = await database.farm.update({
        where: { id: farmId },
        data: {
          verificationStatus: "REJECTED" as FarmVerificationStatus,
          verifiedBy: session.user.id,
          verifiedAt: now,
          rejectionReason: reason,
          status: "PENDING",
          updatedAt: now,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Log admin action
      await database.adminAction.create({
        data: {
          type: "FARM_REJECTED",
          adminId: session.user.id,
          targetId: farmId,
          targetType: "FARM",
          description: `Rejected farm verification: ${farm.name}`,
          metadata: {
            farmId,
            farmName: farm.name,
            ownerId: farm.ownerId,
            reason,
            notes,
          },
        },
      });

      // TODO: Send email notification to farm owner
      // await sendFarmRejectionEmail(updatedFarm.owner.email, updatedFarm, reason);

      // TODO: Create notification for farm owner
      // await createNotification({
      //   userId: updatedFarm.ownerId,
      //   type: "FARM_REJECTED",
      //   title: "Farm Verification Update",
      //   body: `Your farm "${updatedFarm.name}" verification was not approved. Reason: ${reason}`,
      // });

      return NextResponse.json({
        success: true,
        data: {
          farm: updatedFarm,
          message: "Farm verification rejected",
        },
        agricultural: {
          consciousness: "DIVINE",
          season: getCurrentSeason(),
        },
      });
    }
  } catch (error) {
    logger.error("Farm verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VERIFICATION_ERROR",
          message: error instanceof Error ? error.message : "Failed to verify farm",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 🌾 Get current season helper
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}
