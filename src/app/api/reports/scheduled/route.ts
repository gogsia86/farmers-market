/**
 * SCHEDULED REPORTS API
 * Automated report generation and delivery
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's scheduled reports
    const scheduledReports = await database.scheduledReport.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports: scheduledReports });
  } catch (error) {
    console.error("Fetch scheduled reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, reportType, frequency, farmId, recipients } = body;

    if (!name || !reportType || !frequency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify farm access if farmId provided
    if (farmId) {
      const farm = await database.farm.findUnique({
        where: { id: farmId },
      });

      if (
        !farm ||
        (farm.ownerId !== session.user.id && session.user.role !== "ADMIN")
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Create scheduled report
    const scheduledReport = await database.scheduledReport.create({
      data: {
        userId: session.user.id,
        name,
        reportType,
        frequency,
        farmId,
        recipients: recipients || [session.user.email],
        lastRun: null,
        nextRun: calculateNextRun(frequency),
        active: true,
      },
    });

    return NextResponse.json(scheduledReport, { status: 201 });
  } catch (error) {
    console.error("Create scheduled report error:", error);
    return NextResponse.json(
      { error: "Failed to create scheduled report" },
      { status: 500 }
    );
  }
}

function calculateNextRun(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "DAILY":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "WEEKLY":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "MONTHLY":
      return new Date(now.setMonth(now.getMonth() + 1));
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}
