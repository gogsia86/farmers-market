/**
 * CLAIM REFERRAL REWARD API
 * POST /api/marketing/referrals/claim
 * 
 * Claims reward when referred user completes first order
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ClaimSchema = z.object({
  referralCode: z.string(),
  refereeId: z.string(),
  orderAmount: z.number().optional(),
});

/**
 * POST - Claim referral reward
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ClaimSchema.parse(body);

    // Find pending referral by code
    const referral = await findReferralByCode(validated.referralCode);

    if (!referral) {
      return NextResponse.json({
        success: false,
        error: 'Invalid referral code',
      }, { status: 404 });
    }

    if (referral.status === 'COMPLETED') {
      return NextResponse.json({
        success: false,
        error: 'Referral reward already claimed',
      }, { status: 400 });
    }

    // Complete the referral
    const updatedReferral = {
      ...referral,
      refereeId: validated.refereeId,
      status: 'COMPLETED' as const,
      completedAt: new Date(),
    };

    // Apply rewards to both users
    await applyReferralRewards(
      referral.referrerId,
      validated.refereeId,
      referral.referrerReward,
      referral.refereeReward
    );

    // Mark as paid
    updatedReferral.rewardPaid = true;

    return NextResponse.json({
      success: true,
      referral: updatedReferral,
      rewards: {
        referrer: {
          userId: referral.referrerId,
          amount: referral.referrerReward,
        },
        referee: {
          userId: validated.refereeId,
          amount: referral.refereeReward,
        },
      },
      message: 'Referral rewards claimed successfully!',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Claim reward error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to claim referral reward',
    }, { status: 500 });
  }
}

/**
 * Find referral by code
 */
async function findReferralByCode(code: string) {
  // Mock lookup (in production, query database)
  const mockReferrals = [
    {
      id: 'ref_pending',
      referrerId: 'user_123',
      code: code.toUpperCase(),
      status: 'PENDING',
      referrerReward: 10,
      refereeReward: 5,
      rewardPaid: false,
      createdAt: new Date(),
    },
  ];

  return mockReferrals.find((r) => r.code === code.toUpperCase());
}

/**
 * Apply referral rewards to users
 */
async function applyReferralRewards(
  referrerId: string,
  refereeId: string,
  referrerAmount: number,
  refereeAmount: number
) {
  // In production, update user credits in database
  console.log(`Applied referral rewards:
    - Referrer ${referrerId}: $${referrerAmount}
    - Referee ${refereeId}: $${refereeAmount}
  `);

  // Example: Update user credits
  /*
  await database.user.update({
    where: { id: referrerId },
    data: { credits: { increment: referrerAmount } }
  });

  await database.user.update({
    where: { id: refereeId },
    data: { credits: { increment: refereeAmount } }
  });
  */

  return {
    referrer: { userId: referrerId, amount: referrerAmount },
    referee: { userId: refereeId, amount: refereeAmount },
  };
}
