/**
 * REFERRAL LEADERBOARD API
 * GET /api/marketing/referrals/leaderboard
 * 
 * Shows top referrers for gamification
 */

import { NextRequest, NextResponse } from 'next/server';

interface LeaderboardEntry {
  userId: string;
  userName: string;
  referralCount: number;
  totalEarned: number;
  rank: number;
}

/**
 * GET - Get referral leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number.parseInt(searchParams.get('limit') || '50');
    const timeframe = searchParams.get('timeframe') || 'all-time'; // all-time, month, week

    // Get leaderboard data
    const leaderboard = await getLeaderboardData(timeframe, limit);

    return NextResponse.json({
      success: true,
      leaderboard,
      timeframe,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leaderboard',
    }, { status: 500 });
  }
}

/**
 * Get leaderboard data
 */
async function getLeaderboardData(
  timeframe: string,
  limit: number
): Promise<LeaderboardEntry[]> {
  // Mock leaderboard data (in production, query database with aggregations)
  const mockLeaderboard: LeaderboardEntry[] = [
    {
      userId: 'user_1',
      userName: 'Sarah Farm Queen',
      referralCount: 45,
      totalEarned: 450,
      rank: 1,
    },
    {
      userId: 'user_2',
      userName: 'John Organic',
      referralCount: 38,
      totalEarned: 420,
      rank: 2,
    },
    {
      userId: 'user_3',
      userName: 'Maria Fresh',
      referralCount: 32,
      totalEarned: 320,
      rank: 3,
    },
    {
      userId: 'user_4',
      userName: 'Bob LocalFood',
      referralCount: 28,
      totalEarned: 280,
      rank: 4,
    },
    {
      userId: 'user_5',
      userName: 'Emma Harvest',
      referralCount: 24,
      totalEarned: 240,
      rank: 5,
    },
    {
      userId: 'user_6',
      userName: 'David Greenfield',
      referralCount: 20,
      totalEarned: 200,
      rank: 6,
    },
    {
      userId: 'user_7',
      userName: 'Lisa Organic Valley',
      referralCount: 18,
      totalEarned: 180,
      rank: 7,
    },
    {
      userId: 'user_8',
      userName: 'Mike Farm Fresh',
      referralCount: 15,
      totalEarned: 150,
      rank: 8,
    },
    {
      userId: 'user_9',
      userName: 'Anna Sustainable',
      referralCount: 12,
      totalEarned: 120,
      rank: 9,
    },
    {
      userId: 'user_10',
      userName: 'Tom Heritage',
      referralCount: 10,
      totalEarned: 100,
      rank: 10,
    },
  ];

  // Filter by timeframe if needed
  // In production, add date filtering in SQL query
  
  return mockLeaderboard.slice(0, limit);
}
