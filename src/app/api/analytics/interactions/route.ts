/**
 * User Interactions API Routes
 *
 * Endpoints for tracking and retrieving user interactions including views, clicks,
 * add to cart, purchases, favorites, reviews, and shares.
 *
 * @module /api/analytics/interactions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserInteractionService } from "@/lib/services/analytics/user-interaction.service";
import { asyncHandler, validateRequest } from "@/lib/api/error-handler";
import { z } from "zod";
import { InteractionType } from "@prisma/client";

// ============================================================================
// Validation Schemas
// ============================================================================

const trackInteractionSchema = z.object({
  type: z.nativeEnum(InteractionType),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  source: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  value: z.number().optional(),
  sessionId: z.string().optional(),
});

const trackViewSchema = z.object({
  productId: z.string().min(1),
  sessionId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const trackClickSchema = z.object({
  productId: z.string().min(1),
  sessionId: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const trackAddToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  sessionId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const trackPurchaseSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  sessionId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const trackFavoriteSchema = z.object({
  productId: z.string().min(1),
  sessionId: z.string().optional(),
});

const trackReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().min(1).max(5),
  sessionId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const trackShareSchema = z.object({
  productId: z.string().min(1),
  platform: z.string().min(1),
  sessionId: z.string().optional(),
});

const interactionsQuerySchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  type: z.nativeEnum(InteractionType).optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  source: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

// ============================================================================
// POST /api/analytics/interactions - Track user interaction
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    // Determine which type of interaction to track based on the payload
    if (body.action) {
      // Handle specific action types with optimized methods
      switch (body.action) {
        case "view": {
          const viewData = trackViewSchema.parse(body);
          const viewResult = await UserInteractionService.trackView(
            viewData.productId,
            session?.user?.id,
            viewData.sessionId,
            viewData.metadata,
          );
          return NextResponse.json(viewResult, { status: 201 });
        }

        case "click": {
          const clickData = trackClickSchema.parse(body);
          const clickResult = await UserInteractionService.trackClick(
            clickData.productId,
            session?.user?.id,
            clickData.sessionId,
            clickData.source,
            clickData.metadata,
          );
          return NextResponse.json(clickResult, { status: 201 });
        }

        case "add_to_cart": {
          const cartData = trackAddToCartSchema.parse(body);
          const cartResult = await UserInteractionService.trackAddToCart(
            cartData.productId,
            cartData.quantity,
            cartData.price,
            session?.user?.id,
            cartData.sessionId,
            cartData.metadata,
          );
          return NextResponse.json(cartResult, { status: 201 });
        }

        case "purchase": {
          const purchaseData = trackPurchaseSchema.parse(body);
          const purchaseResult = await UserInteractionService.trackPurchase(
            purchaseData.orderId,
            purchaseData.productId,
            purchaseData.quantity,
            purchaseData.price,
            session?.user?.id,
            purchaseData.sessionId,
            purchaseData.metadata,
          );
          return NextResponse.json(purchaseResult, { status: 201 });
        }

        case "favorite": {
          const favoriteData = trackFavoriteSchema.parse(body);
          if (!session?.user?.id) {
            return NextResponse.json(
              { error: "Authentication required for favorites" },
              { status: 401 },
            );
          }
          const favoriteResult = await UserInteractionService.trackFavorite(
            favoriteData.productId,
            session.user.id,
            favoriteData.sessionId,
          );
          return NextResponse.json(favoriteResult, { status: 201 });
        }

        case "review": {
          const reviewData = trackReviewSchema.parse(body);
          if (!session?.user?.id) {
            return NextResponse.json(
              { error: "Authentication required for reviews" },
              { status: 401 },
            );
          }
          const reviewResult = await UserInteractionService.trackReview(
            reviewData.productId,
            reviewData.rating,
            session.user.id,
            reviewData.sessionId,
            reviewData.metadata,
          );
          return NextResponse.json(reviewResult, { status: 201 });
        }

        case "share": {
          const shareData = trackShareSchema.parse(body);
          const shareResult = await UserInteractionService.trackShare(
            shareData.productId,
            shareData.platform,
            session?.user?.id,
            shareData.sessionId,
          );
          return NextResponse.json(shareResult, { status: 201 });
        }

        default:
          return NextResponse.json(
            { error: "Invalid action type" },
            { status: 400 },
          );
      }
    }

    // Generic interaction tracking
    const data = trackInteractionSchema.parse(body);

    const result = await UserInteractionService.track({
      userId: session?.user?.id,
      sessionId: data.sessionId,
      type: data.type,
      entityType: data.entityType,
      entityId: data.entityId,
      source: data.source,
      metadata: data.metadata,
      value: data.value,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error tracking interaction:", error);
    return NextResponse.json(
      { error: "Failed to track interaction" },
      { status: 500 },
    );
  }
}

// ============================================================================
// GET /api/analytics/interactions - Get user interactions
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const query = Object.fromEntries(searchParams.entries());
    const validated = interactionsQuerySchema.parse(query);

    // Parse filters
    const filters: any = {};

    if (validated.userId) filters.userId = validated.userId;
    if (validated.sessionId) filters.sessionId = validated.sessionId;
    if (validated.type) filters.type = validated.type;
    if (validated.entityType) filters.entityType = validated.entityType;
    if (validated.entityId) filters.entityId = validated.entityId;
    if (validated.source) filters.source = validated.source;

    if (validated.startDate) {
      filters.startDate = new Date(validated.startDate);
    }
    if (validated.endDate) {
      filters.endDate = new Date(validated.endDate);
    }

    const limit = validated.limit ? parseInt(validated.limit) : 100;
    const offset = validated.offset ? parseInt(validated.offset) : 0;

    // If user is not admin, only allow viewing their own interactions
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      filters.userId = session?.user?.id;
    }

    const result = await UserInteractionService.getInteractions(
      filters,
      limit,
      offset,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching interactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 },
    );
  }
}
