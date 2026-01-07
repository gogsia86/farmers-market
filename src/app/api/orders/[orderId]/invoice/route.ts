/**
 * 📄 INVOICE PDF DOWNLOAD API
 * Generates and downloads PDF invoices for orders
 * Route: GET /api/orders/[orderId]/invoice
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { InvoicePDFService } from "@/lib/services/invoice/invoice-pdf.service";
import { NextRequest, NextResponse } from "next/server";

import { logger } from '@/lib/monitoring/logger';

interface RouteContext {
  params: {
    orderId: string;
  };
}

/**
 * GET /api/orders/[orderId]/invoice
 * Generate and download PDF invoice
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    // ==========================================================================
    // AUTHENTICATION CHECK
    // ==========================================================================
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { orderId } = params;

    // ==========================================================================
    // FETCH ORDER WITH FULL DETAILS
    // ==========================================================================
    const order = await database.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                unit: true,
              },
            },
          },
        },
        farm: true,
        customer: true,
      },
    });

    // ==========================================================================
    // VALIDATION
    // ==========================================================================
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check authorization - customer can view their own orders, farmers can view their farm's orders, admins can view all
    const isCustomer = order.customerId === userId;
    const isFarmer = order.farm.ownerId === userId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isCustomer && !isFarmer && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Not authorized to view this invoice" },
        { status: 403 }
      );
    }

    // ==========================================================================
    // GENERATE PDF
    // ==========================================================================
    if (!order.farm || !order.items || !order.customer) {
      return NextResponse.json(
        { success: false, error: "Order data incomplete for invoice generation" },
        { status: 500 }
      );
    }

    const pdfBlob = await InvoicePDFService.generateInvoice({ order });

    // Convert blob to buffer for Next.js response
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ==========================================================================
    // RETURN PDF RESPONSE
    // ==========================================================================
    const filename = `invoice-${order.orderNumber}-${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    logger.error("❌ Invoice generation error:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate invoice",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
