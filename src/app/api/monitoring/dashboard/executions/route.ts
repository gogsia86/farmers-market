/**
 * 🌟 Dashboard Executions API Endpoint
 * Farmers Market Platform - Monitoring Dashboard
 *
 * GET /api/monitoring/dashboard/executions
 *
 * Returns paginated workflow execution history with filtering options
 *
 * Query Parameters:
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
 * - status: string (SUCCESS | FAILED | RUNNING | PENDING)
 * - workflowId: string (filter by workflow ID)
 * - startDate: ISO date string
 * - endDate: ISO date string
 */

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

// ============================================================================
// TYPES
// ============================================================================

interface ExecutionResponse {
  success: boolean;
  data?: {
    executions: Array<{
      id: string;
      workflowId: string;
      status: string;
      startedAt: string;
      completedAt: string | null;
      durationMs: number | null;
      errorMessage: string | null;
      metadata: Record<string, any> | null;
    }>;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse and validate query parameters
 */
function parseQueryParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Pagination
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  // Filters
  const status = searchParams.get("status") || undefined;
  const workflowId = searchParams.get("workflowId") || undefined;
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : undefined;
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : undefined;

  return {
    limit,
    offset,
    status,
    workflowId,
    startDate,
    endDate,
  };
}

/**
 * Build Prisma where clause from filters
 */
function buildWhereClause(filters: {
  status?: string;
  workflowId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.workflowId) {
    where.workflowId = filters.workflowId;
  }

  if (filters.startDate || filters.endDate) {
    where.startedAt = {};
    if (filters.startDate) {
      where.startedAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.startedAt.lte = filters.endDate;
    }
  }

  return where;
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ExecutionResponse>> {
  try {
    // Parse query parameters
    const { limit, offset, status, workflowId, startDate, endDate } =
      parseQueryParams(request);

    // Build where clause
    const where = buildWhereClause({ status, workflowId, startDate, endDate });

    // Fetch executions and total count in parallel
    const [executions, total] = await Promise.all([
      database.workflowExecution.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          startedAt: "desc",
        },
        select: {
          id: true,
          workflowName: true,
          status: true,
          startedAt: true,
          completedAt: true,
          durationMs: true,
          errorMessage: true,
          metadata: true,
        },
      }),
      database.workflowExecution.count({ where }),
    ]);

    // Format executions
    const formattedExecutions = executions.map((execution) => ({
      id: execution.id,
      workflowId: execution.workflowName,
      status: execution.status,
      startedAt: execution.startedAt.toISOString(),
      completedAt: execution.completedAt?.toISOString() || null,
      durationMs: execution.durationMs,
      errorMessage: execution.errorMessage,
      metadata: execution.metadata
        ? typeof execution.metadata === "string"
          ? JSON.parse(execution.metadata)
          : execution.metadata
        : null,
    }));

    // Build response
    const response: ExecutionResponse = {
      success: true,
      data: {
        executions: formattedExecutions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("❌ Dashboard executions API error:", error);

    const response: ExecutionResponse = {
      success: false,
      error: {
        code: "DASHBOARD_EXECUTIONS_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch workflow executions",
      },
    };

    return NextResponse.json(response, {
      status: 500,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}

// ============================================================================
// ROUTE CONFIG
// ============================================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;
