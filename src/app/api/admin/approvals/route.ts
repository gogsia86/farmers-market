import { requireFarmerAuth } from "@/lib/auth/farmer-auth";
import { database } from "@/lib/database";
import { emailService } from "@/lib/email/email-service";
import { NextRequest, NextResponse } from "next/server";

/**
 * 🎯 ADMIN APPROVAL API
 * GET /api/admin/approvals - List pending approvals
 * POST /api/admin/approvals/:id/approve - Approve farmer
 * POST /api/admin/approvals/:id/reject - Reject farmer
 */

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireFarmerAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    // Verify admin role
    if (
      authResult.role !== "ADMIN" &&
      authResult.role !== "SUPER_ADMIN" &&
      authResult.role !== "MODERATOR"
    ) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get filter parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING_APPROVAL";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch pending farms
    const [farms, total] = await Promise.all([
      database.farm.findMany({
        where: { status: status as any },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      database.farm.count({
        where: { status: status as any },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        farms,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Get approvals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireFarmerAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    // Verify admin role
    if (
      authResult.role !== "ADMIN" &&
      authResult.role !== "SUPER_ADMIN" &&
      authResult.role !== "MODERATOR"
    ) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { farmId, action, reason } = body;

    if (!farmId || !action) {
      return NextResponse.json(
        { error: "Farm ID and action required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get farm with owner
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    if (farm.status !== "PENDING") {
      return NextResponse.json(
        { error: "Farm is not pending approval" },
        { status: 400 }
      );
    }

    // Update farm status
    const newStatus = action === "approve" ? "ACTIVE" : "SUSPENDED";

    const updatedFarm = await database.farm.update({
      where: { id: farmId },
      data: {
        status: newStatus,
      },
    });

    // Send notification email
    const ownerName =
      `${farm.owner.firstName || ""} ${farm.owner.lastName || ""}`.trim() ||
      farm.owner.email;

    if (action === "approve") {
      // Send approval email
      await emailService.sendEmail({
        to: farm.owner.email,
        subject: `🎉 Your Farm Application Has Been Approved!`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>🎉 Congratulations!</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2>Your Farm Has Been Approved!</h2>
                <p>Great news, ${ownerName}!</p>
                <p>We're excited to welcome <strong>${farm.name}</strong> to our marketplace.</p>

                <h3>Next Steps:</h3>
                <ol>
                  <li><strong>Add Products</strong> - Start listing your products</li>
                  <li><strong>Set Up Payment</strong> - Configure your payment preferences</li>
                  <li><strong>Customize Profile</strong> - Add photos and details</li>
                </ol>

                <a href="${process.env.NEXTAUTH_URL}/farmer-dashboard"
                   style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                  Go to Dashboard
                </a>

                <p>Need help? Check out our <a href="${process.env.NEXTAUTH_URL}/resources">Farmer Resources</a> or contact support.</p>

                <p>Best regards,<br>The Farmers Market Team</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Congratulations! Your farm "${farm.name}" has been approved. Visit ${process.env.NEXTAUTH_URL}/farmer-dashboard to get started.`,
      });
    } else {
      // Send rejection email
      await emailService.sendEmail({
        to: farm.owner.email,
        subject: `Application Update for ${farm.name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Application Update</h2>
              <p>Hello ${ownerName},</p>
              <p>Thank you for your interest in joining our marketplace with <strong>${farm.name}</strong>.</p>

              <p>After reviewing your application, we're unable to approve it at this time.</p>

              ${
                reason
                  ? `<div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <strong>Reason:</strong><br>${reason}
              </div>`
                  : ""
              }

              <p>You're welcome to submit a new application after addressing any concerns.</p>

              <p>If you have questions, please contact our support team at <a href="mailto:support@farmersmarket.com">support@farmersmarket.com</a>.</p>

              <p>Best regards,<br>The Farmers Market Team</p>
            </div>
          </body>
          </html>
        `,
        text: `Your application for "${farm.name}" could not be approved at this time. ${reason ? `Reason: ${reason}` : ""} Contact support for more information.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Farm ${action === "approve" ? "approved" : "rejected"} successfully`,
      data: {
        farmId: updatedFarm.id,
        farmName: updatedFarm.name,
        status: updatedFarm.status,
        action,
      },
    });
  } catch (error) {
    console.error("Approval action error:", error);
    return NextResponse.json(
      { error: "Failed to process approval" },
      { status: 500 }
    );
  }
}
