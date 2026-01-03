import { requireFarmerAuth } from "@/lib/auth/farmer-auth";
import { createLogger } from "@/lib/logger";
import { notificationService } from "@/lib/notifications/notification-service";
import { NextRequest } from "next/server";

// Initialize structured logger
const logger = createLogger("notifications-stream-api");

/**
 * 🔔 NOTIFICATIONS SSE ENDPOINT
 * GET /api/notifications/stream - Server-Sent Events stream
 * Real-time notifications for authenticated users
 */

export async function GET(request: NextRequest) {
  // Check authentication
  const authResult = await requireFarmerAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  const userId = authResult.userId!;

  logger.info("SSE stream connection initiated", { userId });

  // Create SSE stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const message = `data: ${JSON.stringify({
        type: "connected",
        userId,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(message));

      // Subscribe to notifications
      const unsubscribe = notificationService.subscribe(
        userId,
        (notification) => {
          const data = `data: ${JSON.stringify(notification)}\n\n`;
          try {
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            logger.error("SSE send error", error as Error, {
              userId,
              operation: "notification-broadcast",
            });
            unsubscribe();
          }
        },
      );

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch (error) {
          logger.warn("SSE keep-alive failed, closing connection", {
            userId,
          });
          clearInterval(keepAlive);
          unsubscribe();
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        logger.info("SSE stream connection closed", { userId });
        clearInterval(keepAlive);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
