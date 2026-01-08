/**
 * Database Health Check API Route
 *
 * Provides database-specific health monitoring
 * Backward compatibility route for /api/health/database
 *
 * @route GET /api/health/database
 */

import { database } from '@/lib/database';
import { logger } from '@/lib/monitoring/logger';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface DatabaseHealthResponse {
  status: HealthStatus;
  timestamp: string;
  database: {
    status: HealthStatus;
    latency?: number;
    message?: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * Check database connectivity and performance
 */
async function checkDatabase(): Promise<DatabaseHealthResponse['database']> {
  const start = Date.now();

  try {
    // Simple query to check connection
    await database.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    // Latency thresholds
    if (latency > 5000) {
      return {
        status: 'unhealthy',
        latency,
        message: 'Database response time is critical',
      };
    }

    if (latency > 1000) {
      return {
        status: 'degraded',
        latency,
        message: 'Database response time is slow',
      };
    }

    return {
      status: 'healthy',
      latency,
      message: 'Database is responsive',
    };
  } catch (error) {
    logger.error('Database health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: 'Database connection failed',
      details:
        process.env.NODE_ENV === 'development'
          ? { error: error instanceof Error ? error.message : 'Unknown error' }
          : undefined,
    };
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * GET /api/health/database - Database health check
 */
export async function GET(request: NextRequest): Promise<NextResponse<DatabaseHealthResponse>> {
  try {
    const dbCheck = await checkDatabase();

    const httpStatus = dbCheck.status === 'healthy' ? 200 : 503;

    return NextResponse.json(
      {
        status: dbCheck.status,
        timestamp: new Date().toISOString(),
        database: dbCheck,
      },
      {
        status: httpStatus,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    logger.error('Database health check endpoint failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'unhealthy',
          message: 'Database health check failed',
          details:
            process.env.NODE_ENV === 'development'
              ? { error: error instanceof Error ? error.message : 'Unknown error' }
              : undefined,
        },
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

/**
 * HEAD /api/health/database - Quick database health check (no body)
 */
export async function HEAD(): Promise<NextResponse> {
  try {
    // Quick database ping
    await database.$queryRaw`SELECT 1`;

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}

// ============================================================================
// EXPORT ROUTE CONFIG
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
