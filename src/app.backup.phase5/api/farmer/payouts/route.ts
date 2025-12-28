import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Payout {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  stripePayoutId?: string;
  periodStart: string;
  periodEnd: string;
  orderCount: number;
  scheduledDate: string;
  completedDate?: string;
  failureReason?: string;
  accountLast4: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { success: false, error: "Only farmers can access payout data" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!farmId) {
      return NextResponse.json(
        { success: false, error: "Farm ID is required" },
        { status: 400 },
      );
    }

    // Verify farm ownership
    const farm = await database.farm.findFirst({
      where: {
        id: farmId,
        ownerId: session.user.id,
      },
    });

    if (!farm) {
      return NextResponse.json(
        { success: false, error: "Farm not found or access denied" },
        { status: 404 },
      );
    }

    // Fetch payouts
    const [payouts, total] = await Promise.all([
      database.payout.findMany({
        where: {
          farmId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      database.payout.count({
        where: {
          farmId,
        },
      }),
    ]);

    // Format payouts
    const formattedPayouts: Payout[] = payouts.map((payout) => ({
      id: payout.id,
      amount: Number(payout.amount),
      status: payout.status as Payout["status"],
      stripePayoutId: payout.stripePayoutId || undefined,
      periodStart: payout.periodStart.toISOString(),
      periodEnd: payout.periodEnd.toISOString(),
      orderCount: payout.orderCount,
      scheduledDate: payout.scheduledDate.toISOString(),
      completedDate: payout.paidDate?.toISOString(),
      failureReason: payout.failureReason || undefined,
      accountLast4: "1234", // TODO: Get from Stripe Connect account
    }));

    return NextResponse.json({
      success: true,
      payouts: formattedPayouts,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payouts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { success: false, error: "Only farmers can request payouts" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { farmId } = body;

    if (!farmId) {
      return NextResponse.json(
        { success: false, error: "Farm ID is required" },
        { status: 400 },
      );
    }

    // Verify farm ownership
    const farm = await database.farm.findFirst({
      where: {
        id: farmId,
        ownerId: session.user.id,
      },
    });

    if (!farm) {
      return NextResponse.json(
        { success: false, error: "Farm not found or access denied" },
        { status: 404 },
      );
    }

    // Check if Stripe Connect is set up
    if (!farm.stripeAccountId) {
      return NextResponse.json(
        {
          success: false,
          error: "Stripe Connect account not configured",
        },
        { status: 400 },
      );
    }

    // Calculate available balance
    const completedOrders = await database.order.findMany({
      where: {
        farmId,
        status: {
          in: ["FULFILLED", "COMPLETED"],
        },
        paymentStatus: "PAID",
      },
      include: {
        items: {
          where: {
            product: {
              farmId,
            },
          },
        },
      },
    });

    const totalRevenue = completedOrders.reduce((sum, order) => {
      const farmItemsTotal = order.items.reduce(
        (itemSum: number, item: any) => itemSum + Number(item.subtotal),
        0,
      );
      return sum + farmItemsTotal;
    }, 0);

    // Get total payouts
    const allPayouts = await database.payout.findMany({
      where: {
        farmId,
        status: {
          in: ["COMPLETED", "PENDING", "PROCESSING"],
        },
      },
    });

    const totalPayoutsAmount = allPayouts.reduce(
      (sum, payout) => sum + Number(payout.amount),
      0,
    );

    const availableBalance = totalRevenue - totalPayoutsAmount;

    // Check minimum payout amount
    const minimumPayoutAmount = 10; // $10 minimum
    if (availableBalance < minimumPayoutAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum payout amount is $${minimumPayoutAmount}. Available balance: $${availableBalance.toFixed(2)}`,
        },
        { status: 400 },
      );
    }

    // Check for pending payouts
    const pendingPayout = await database.payout.findFirst({
      where: {
        farmId,
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
    });

    if (pendingPayout) {
      return NextResponse.json(
        {
          success: false,
          error: "You have a pending payout. Please wait for it to complete.",
        },
        { status: 400 },
      );
    }

    // Calculate period (all time up to now)
    const now = new Date();
    const lastPayout = allPayouts.sort(
      (a, b) => b.periodEnd.getTime() - a.periodEnd.getTime(),
    )[0];

    const periodStart = lastPayout
      ? lastPayout.periodEnd
      : completedOrders[0]?.createdAt || now;

    // Create payout record
    const payout = await database.payout.create({
      data: {
        farmId,
        amount: availableBalance,
        currency: "USD",
        status: "PENDING",
        periodStart,
        periodEnd: now,
        orderCount: completedOrders.length,
        scheduledDate: now,
      },
    });

    // TODO: Create Stripe payout
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const stripePayout = await stripe.payouts.create({
    //   amount: Math.round(availableBalance * 100),
    //   currency: 'usd',
    // }, {
    //   stripeAccount: farm.stripeConnectAccountId,
    // });
    //
    // await database.payout.update({
    //   where: { id: payout.id },
    //   data: { stripePayoutId: stripePayout.id },
    // });

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: Number(payout.amount),
        status: payout.status,
        scheduledDate: payout.scheduledDate.toISOString(),
      },
      message: "Payout requested successfully",
    });
  } catch (error) {
    console.error("Error requesting payout:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to request payout",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
