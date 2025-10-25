# 📡 WebSocket Real-time Communication Guide

This directory contains documentation for real-time agricultural data communication systems using WebSocket technology.

## 🌾 **Agricultural WebSocket Events**

### **📊 Available Event Types**

- **🌱 [Agricultural Events](./agricultural-events.md)** - Crop updates, weather alerts, soil conditions
- **📈 [Metrics Events](./metrics-events.md)** - Performance tracking and analytics data
- **🔄 [State Synchronization](./state-synchronization.md)** - Real-time state management across clients
- **⚡ [State Sync Events](./state-sync-events.md)** - Specific synchronization event patterns

### **🛠️ Implementation Templates**

- **📝 [Event Template](./TEMPLATE.md)** - Standard WebSocket event structure patterns

## 🚀 **Quick Start**

```typescript
// Connect to agricultural WebSocket
const socket = new WebSocket("ws://localhost:3000/api/agricultural-socket");

// Listen for crop updates
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "CROP_UPDATE") {
    handleCropUpdate(data.payload);
  }
});
```

## 📚 **Related Documentation**

- [Real-time Agricultural Events](./agricultural-events.md)
- [WebSocket Testing Guide](../../TEST_INFRASTRUCTURE_REPAIR_STRATEGY.md)
- [Performance Monitoring](../../monitoring/MONITORING_GUIDE.md)
