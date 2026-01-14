// 🧠 DIVINE PATTERN: Real-time Hooks Barrel Export
// 📚 Reference: Real-time Communication Hooks
// 🌾 Domain: WebSocket Client Integration
// ⚡ Performance: Centralized export for real-time features

// Core Socket.io hook
export {
    SocketEvent, useFarmRoom, useOrderRoom, useSocket,
    useUserRoom, type SocketStatus,
    type UseSocketConfig,
    type UseSocketReturn
} from "./useSocket";

// Real-time orders
export {
    useFarmOrders, useOrderTracking, useRealtimeOrders, type NewOrderPayload, type OrderStatusChangePayload, type OrderUpdatePayload, type UseRealtimeOrdersConfig,
    type UseRealtimeOrdersReturn
} from "./useRealtimeOrders";

// Real-time notifications
export {
    NotificationPriority, NotificationType, useAgriculturalNotifications, useNotificationCount,
    useNotificationsByType,
    useOrderNotifications, useRealtimeNotifications, type NotificationPayload,
    type UseRealtimeNotificationsConfig,
    type UseRealtimeNotificationsReturn
} from "./useRealtimeNotifications";

