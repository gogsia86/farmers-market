/**
 * Execute Search Alert API Route
 *
 * Endpoint:
 * - POST /api/search-alerts/[id]/execute - Execute/test an alert
 *
 * @since Run 4 - Phase 2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SearchAlertService } from '@/lib/services/saved-searches/search-alert.service';

// ============================================
// POST - Execute Alert
// ============================================

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const alertId = params.id;

    // Verify user owns the alert
    const alert = await SearchAlertService.getById(alertId, session.user.id);

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found or access denied' },
        { status: 404 }
      );
    }

    // Execute alert
    const result = await SearchAlertService.executeAlert(alertId);

    return NextResponse.json(
      {
        message: result.triggered ? 'Alert triggered successfully' : 'Alert evaluated - no trigger',
        result,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[SearchAlert Execute] Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to execute alert' },
      { status: 500 }
    );
  }
}
