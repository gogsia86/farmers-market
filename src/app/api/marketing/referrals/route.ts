/**
 * REFERRAL PROGRAM API
 * Divine viral growth referral system
 *
 * Endpoints:
 * - POST /api/marketing/referrals - Generate referral link
 * - GET /api/marketing/referrals/stats - Get referral statistics
 * - POST /api/marketing/referrals/claim - Claim referral reward
 * - GET /api/marketing/referrals/leaderboard - Top referrers
 */

import type { Referral } from "@/types/marketing.types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schemas
const GenerateReferralSchema = z.object({
  userId: z.string(),
  userType: z.enum(["FARMER", "CONSUMER"]).optional(),
});

const ClaimRewardSchema = z.object({
  referralCode: z.string(),
  refereeId: z.string(),
});

// Reward structure
const REFERRAL_REWARDS = {
  CONSUMER: {
    referrer: 10, // $10 credit for referrer
    referee: 5, // $5 credit for new user
  },
  FARMER: {
    referrer: 20, // $20 credit for referring a farmer (higher value)
    referee: 10, // $10 credit for new farmer
  },
};

// Mock database
const referrals: Referral[] = [
  // Sample referrals for demo
  {
    id: "ref_001",
    referrerId: "user_1",
    refereeId: "user_101",
    code: "FARM-ABC123",
    status: "COMPLETED",
    rewardPaid: true,
    referrerReward: 10,
    refereeReward: 5,
    createdAt: new Date("2025-10-01"),
    completedAt: new Date("2025-10-02"),
  },
  {
    id: "ref_002",
    referrerId: "user_1",
    refereeId: "user_102",
    code: "FARM-ABC123",
    status: "COMPLETED",
    rewardPaid: true,
    referrerReward: 10,
    refereeReward: 5,
    createdAt: new Date("2025-10-05"),
    completedAt: new Date("2025-10-06"),
  },
  {
    id: "ref_003",
    referrerId: "user_1",
    refereeId: undefined,
    code: "FARM-ABC123",
    status: "PENDING",
    rewardPaid: false,
    referrerReward: 10,
    refereeReward: 5,
    createdAt: new Date("2025-10-20"),
  },
  {
    id: "ref_004",
    referrerId: "user_2",
    refereeId: "user_103",
    code: "FARM-XYZ789",
    status: "COMPLETED",
    rewardPaid: true,
    referrerReward: 20,
    refereeReward: 10,
    createdAt: new Date("2025-10-10"),
    completedAt: new Date("2025-10-11"),
  },
];

/**
 * POST - Generate referral link for user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = GenerateReferralSchema.parse(body);

    // Check if user already has a referral code
    const existingReferral = referrals.find(
      (r) => r.referrerId === validated.userId && r.status === "PENDING"
    );

    if (existingReferral) {
      return NextResponse.json({
        success: true,
        referral: existingReferral,
        referralLink: generateReferralLink(existingReferral.code),
        message: "Using existing referral code",
      });
    }

    // Generate unique referral code
    const code = generateReferralCode(validated.userId);
    const rewards =
      validated.userType === "FARMER"
        ? REFERRAL_REWARDS.FARMER
        : REFERRAL_REWARDS.CONSUMER;

    // Create new referral tracking
    const referral: Referral = {
      id: `ref_${Date.now()}`,
      referrerId: validated.userId,
      refereeId: undefined,
      code,
      status: "PENDING",
      rewardPaid: false,
      referrerReward: rewards.referrer,
      refereeReward: rewards.referee,
      createdAt: new Date(),
    };

    referrals.push(referral);

    return NextResponse.json(
      {
        success: true,
        referral,
        referralLink: generateReferralLink(code),
        message: "Referral link generated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Referral generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate referral link",
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get referral statistics for user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId parameter required",
        },
        { status: 400 }
      );
    }

    // Get all referrals for this user
    const userReferrals = referrals.filter((r) => r.referrerId === userId);

    const stats = {
      totalReferrals: userReferrals.length,
      completedReferrals: userReferrals.filter((r) => r.status === "COMPLETED")
        .length,
      pendingReferrals: userReferrals.filter((r) => r.status === "PENDING")
        .length,
      totalEarned: userReferrals
        .filter((r) => r.status === "COMPLETED")
        .reduce((sum, r) => sum + r.referrerReward, 0),
      rewardsPaid: userReferrals
        .filter((r) => r.rewardPaid)
        .reduce((sum, r) => sum + r.referrerReward, 0),
      rewardsPending: userReferrals
        .filter((r) => r.status === "COMPLETED" && !r.rewardPaid)
        .reduce((sum, r) => sum + r.referrerReward, 0),
    };

    // Get referral code
    const referralCode =
      userReferrals.find((r) => r.status === "PENDING")?.code ||
      generateReferralCode(userId);

    return NextResponse.json({
      success: true,
      stats,
      referralCode,
      referralLink: generateReferralLink(referralCode),
      referrals: userReferrals,
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch referral statistics",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate unique referral code
 */
function generateReferralCode(userId: string): string {
  const prefix = "FARM";
  const hash = Buffer.from(userId)
    .toString("base64")
    .substring(0, 6)
    .toUpperCase();
  return `${prefix}-${hash}`;
}

/**
 * Generate referral link
 */
function generateReferralLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/signup?ref=${code}`;
}
