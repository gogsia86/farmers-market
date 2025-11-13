import { requireFarmerAuth } from "@/lib/auth/farmer-auth";
import { notificationService } from "@/lib/notifications/notification-service";
import { NextRequest } from "next/server";

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
            console.error("SSE send error:", error);
            unsubscribe();
          }
        }
      );

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch (error) {
          clearInterval(keepAlive);
          unsubscribe();
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
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
