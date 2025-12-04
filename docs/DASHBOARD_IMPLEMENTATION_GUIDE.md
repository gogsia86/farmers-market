# 🎨 Dashboard Implementation Guide

## Phase 3 Week 1 - Real-Time Monitoring Dashboard

**Version**: 1.0.0  
**Date**: November 26, 2025  
**Status**: READY TO IMPLEMENT

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Plan](#implementation-plan)
4. [API Endpoints](#api-endpoints)
5. [Components](#components)
6. [Real-Time Updates](#real-time-updates)
7. [Code Examples](#code-examples)
8. [Testing Strategy](#testing-strategy)
9. [Performance Considerations](#performance-considerations)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Goal

Build a real-time monitoring dashboard that displays:

- System health status
- Workflow execution history
- Active alerts and notifications
- Performance metrics and charts
- Live updates via WebSocket

### Success Criteria

- ✅ Dashboard loads in <2 seconds
- ✅ Real-time updates within 500ms
- ✅ Handles 100+ concurrent users
- ✅ Mobile responsive
- ✅ 90%+ test coverage

---

## 🏗️ Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Dashboard Page (RSC)                               │   │
│  │  └─ Fetches initial data server-side               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Dashboard Client Components                        │   │
│  │  ├─ SystemHealthWidget                              │   │
│  │  ├─ WorkflowExecutionWidget                         │   │
│  │  ├─ AlertsWidget                                    │   │
│  │  └─ PerformanceMetricsWidget                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WebSocket Client                                   │   │
│  │  └─ Subscribes to real-time updates                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP & WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes                                         │   │
│  │  ├─ GET /api/monitoring/dashboard/overview         │   │
│  │  ├─ GET /api/monitoring/dashboard/executions       │   │
│  │  ├─ GET /api/monitoring/dashboard/alerts           │   │
│  │  └─ GET /api/monitoring/dashboard/metrics          │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WebSocket Server                                   │   │
│  │  └─ Broadcasts updates to connected clients        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                    │
│  ├─ workflow_executions                                     │
│  ├─ workflow_metrics                                        │
│  ├─ system_health_checks                                    │
│  ├─ notification_logs                                       │
│  └─ monitoring_reports                                      │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer     | Technology              | Purpose            |
| --------- | ----------------------- | ------------------ |
| Frontend  | React 18 + Next.js 15   | UI Framework       |
| Styling   | Tailwind CSS            | Styling            |
| Charts    | Recharts / Chart.js     | Data visualization |
| Real-time | WebSocket / SSE         | Live updates       |
| API       | Next.js API Routes      | Backend endpoints  |
| Database  | Prisma + PostgreSQL     | Data persistence   |
| State     | React Server Components | Server-side state  |

---

## 📅 Implementation Plan

### Day 1: API Endpoints (4-6 hours)

**Priority**: HIGH  
**Complexity**: MEDIUM

**Tasks**:

1. Create monitoring API directory structure
2. Implement overview endpoint
3. Implement executions endpoint
4. Implement alerts endpoint
5. Implement metrics endpoint
6. Add error handling and validation
7. Write API tests

**Files to Create**:

- `src/app/api/monitoring/dashboard/overview/route.ts`
- `src/app/api/monitoring/dashboard/executions/route.ts`
- `src/app/api/monitoring/dashboard/alerts/route.ts`
- `src/app/api/monitoring/dashboard/metrics/route.ts`

### Day 2: Core Components (4-6 hours)

**Priority**: HIGH  
**Complexity**: MEDIUM

**Tasks**:

1. Create DashboardLayout component
2. Implement SystemHealthWidget
3. Implement WorkflowExecutionWidget
4. Add loading states
5. Add error boundaries
6. Write component tests

**Files to Create**:

- `src/components/monitoring/dashboard/DashboardLayout.tsx`
- `src/components/monitoring/dashboard/SystemHealthWidget.tsx`
- `src/components/monitoring/dashboard/WorkflowExecutionWidget.tsx`
- `src/components/monitoring/dashboard/DashboardSkeleton.tsx`

### Day 3: Advanced Widgets (4-6 hours)

**Priority**: MEDIUM  
**Complexity**: MEDIUM-HIGH

**Tasks**:

1. Implement AlertsWidget
2. Implement PerformanceMetricsWidget
3. Add charts and visualizations
4. Implement filtering and sorting
5. Add export functionality
6. Write integration tests

**Files to Create**:

- `src/components/monitoring/dashboard/AlertsWidget.tsx`
- `src/components/monitoring/dashboard/PerformanceMetricsWidget.tsx`
- `src/components/monitoring/dashboard/MetricsChart.tsx`

### Day 4: Real-Time Updates (6-8 hours)

**Priority**: HIGH  
**Complexity**: HIGH

**Tasks**:

1. Set up WebSocket server
2. Implement broadcast mechanism
3. Create WebSocket client hook
4. Connect widgets to real-time updates
5. Add reconnection logic
6. Implement SSE fallback
7. Write WebSocket tests

**Files to Create**:

- `src/lib/websocket/server.ts`
- `src/lib/websocket/client.ts`
- `src/hooks/useWebSocket.ts`
- `src/hooks/useDashboardUpdates.ts`

### Day 5: Polish & Testing (4-6 hours)

**Priority**: MEDIUM  
**Complexity**: LOW-MEDIUM

**Tasks**:

1. Responsive design refinement
2. Dark mode support
3. Accessibility improvements
4. Performance optimization
5. E2E testing
6. Documentation

---

## 🔌 API Endpoints

### 1. Dashboard Overview

**Endpoint**: `GET /api/monitoring/dashboard/overview`

**Purpose**: Provides high-level dashboard statistics

**Response**:

```typescript
{
  success: true,
  data: {
    systemHealth: {
      status: "HEALTHY" | "DEGRADED" | "UNHEALTHY",
      lastCheck: "2025-11-26T06:43:32.000Z",
      checks: {
        database: true,
        api: false,
        cache: true,
        externalServices: true
      }
    },
    workflows: {
      total: 1234,
      today: 45,
      active: 3,
      success_rate: 98.5
    },
    alerts: {
      critical: 0,
      warning: 2,
      info: 5
    },
    performance: {
      avgResponseTime: 234,
      avgDuration: 1543,
      successRate: 98.5
    }
  }
}
```

**Implementation**:

```typescript
// src/app/api/monitoring/dashboard/overview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    // Fetch overview data
    const [totalExecutions, todayExecutions, lastHealthCheck, activeAlerts] =
      await Promise.all([
        database.workflowExecution.count(),
        database.workflowExecution.count({
          where: {
            startedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        database.systemHealthCheck.findFirst({
          orderBy: { createdAt: "desc" },
        }),
        database.notificationLog.count({
          where: {
            priority: { in: ["CRITICAL", "HIGH"] },
            status: "SENT",
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        systemHealth: {
          status: lastHealthCheck?.status || "UNKNOWN",
          lastCheck: lastHealthCheck?.createdAt,
          checks: lastHealthCheck?.details || {},
        },
        workflows: {
          total: totalExecutions,
          today: todayExecutions,
          active: 0, // TODO: Track active executions
          success_rate: 98.5, // TODO: Calculate from data
        },
        alerts: {
          critical: activeAlerts,
          warning: 0,
          info: 0,
        },
        performance: {
          avgResponseTime: 234,
          avgDuration: 1543,
          successRate: 98.5,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DASHBOARD_OVERVIEW_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
```

### 2. Workflow Executions

**Endpoint**: `GET /api/monitoring/dashboard/executions`

**Query Parameters**:

- `limit` (default: 50, max: 100)
- `offset` (default: 0)
- `status` (PASSED, FAILED, RUNNING, PENDING)
- `startDate` (ISO 8601)
- `endDate` (ISO 8601)

**Response**:

```typescript
{
  success: true,
  data: {
    executions: [
      {
        id: "exec_123",
        workflowName: "health-check",
        status: "PASSED",
        startedAt: "2025-11-26T06:43:32.000Z",
        completedAt: "2025-11-26T06:43:35.000Z",
        durationMs: 3000,
        testsPassed: 10,
        testsFailed: 0,
        testsTotal: 10
      }
    ],
    pagination: {
      total: 1234,
      limit: 50,
      offset: 0,
      hasMore: true
    }
  }
}
```

### 3. Active Alerts

**Endpoint**: `GET /api/monitoring/dashboard/alerts`

**Query Parameters**:

- `priority` (CRITICAL, HIGH, MEDIUM, LOW)
- `status` (ACTIVE, ACKNOWLEDGED, RESOLVED)

**Response**:

```typescript
{
  success: true,
  data: {
    alerts: [
      {
        id: "alert_456",
        priority: "CRITICAL",
        title: "High Error Rate Detected",
        message: "Error rate exceeded 5% threshold",
        timestamp: "2025-11-26T06:43:32.000Z",
        status: "ACTIVE",
        metadata: {
          errorRate: 7.2,
          threshold: 5.0
        }
      }
    ]
  }
}
```

### 4. Performance Metrics

**Endpoint**: `GET /api/monitoring/dashboard/metrics`

**Query Parameters**:

- `period` (1h, 6h, 24h, 7d, 30d)
- `metric` (response_time, duration, success_rate, throughput)

**Response**:

```typescript
{
  success: true,
  data: {
    metrics: [
      {
        timestamp: "2025-11-26T06:00:00.000Z",
        responseTime: 234,
        duration: 1543,
        successRate: 98.5,
        throughput: 12
      }
    ]
  }
}
```

---

## 🧩 Components

### 1. DashboardLayout

**Purpose**: Main layout wrapper with navigation and grid system

**Features**:

- Responsive grid layout
- Navigation sidebar
- Header with refresh button
- Loading states

**Props**:

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}
```

### 2. SystemHealthWidget

**Purpose**: Display real-time system health status

**Features**:

- Health status indicator (green/yellow/red)
- Individual check status (DB, API, Cache, External)
- Last check timestamp
- Auto-refresh every 30 seconds

**Props**:

```typescript
interface SystemHealthWidgetProps {
  initialData?: SystemHealthData;
  autoRefresh?: boolean;
  refreshInterval?: number;
}
```

### 3. WorkflowExecutionWidget

**Purpose**: Display recent workflow executions in a table

**Features**:

- Sortable columns
- Status filtering
- Pagination
- Execution details modal
- Real-time updates

**Props**:

```typescript
interface WorkflowExecutionWidgetProps {
  initialExecutions?: WorkflowExecution[];
  limit?: number;
  autoUpdate?: boolean;
}
```

### 4. AlertsWidget

**Purpose**: Display active alerts and notifications

**Features**:

- Priority-based color coding
- Alert filtering
- Acknowledge/dismiss actions
- Alert details modal

**Props**:

```typescript
interface AlertsWidgetProps {
  initialAlerts?: Alert[];
  showAcknowledged?: boolean;
  onAcknowledge?: (alertId: string) => void;
}
```

### 5. PerformanceMetricsWidget

**Purpose**: Visualize performance metrics with charts

**Features**:

- Line charts for time-series data
- Selectable time period (1h, 6h, 24h, 7d, 30d)
- Multiple metrics (response time, duration, success rate)
- Export to CSV

**Props**:

```typescript
interface PerformanceMetricsWidgetProps {
  initialMetrics?: MetricDataPoint[];
  defaultPeriod?: TimePeriod;
  metrics?: MetricType[];
}
```

---

## ⚡ Real-Time Updates

### WebSocket Implementation

**Server Setup** (`src/lib/websocket/server.ts`):

```typescript
import { WebSocketServer } from "ws";
import { database } from "@/lib/database";

class DashboardWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;

  constructor(port: number = 3002) {
    this.wss = new WebSocketServer({ port });
    this.clients = new Set();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.wss.on("connection", (ws) => {
      this.clients.add(ws);
      console.log(`✅ Client connected (Total: ${this.clients.size})`);

      ws.on("close", () => {
        this.clients.delete(ws);
        console.log(`❌ Client disconnected (Total: ${this.clients.size})`);
      });
    });
  }

  broadcast(event: string, data: any) {
    const message = JSON.stringify({ event, data, timestamp: new Date() });
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Broadcast methods
  broadcastHealthCheck(healthCheck: SystemHealthCheck) {
    this.broadcast("health_check", healthCheck);
  }

  broadcastExecution(execution: WorkflowExecution) {
    this.broadcast("workflow_execution", execution);
  }

  broadcastAlert(alert: Alert) {
    this.broadcast("alert", alert);
  }
}

export const wsServer = new DashboardWebSocketServer();
```

**Client Hook** (`src/hooks/useWebSocket.ts`):

```typescript
"use client";

import { useEffect, useRef, useState } from "react";

interface WebSocketHookOptions {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: WebSocketHookOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(options.url);

        ws.onopen = () => {
          console.log("✅ WebSocket connected");
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
            options.onMessage?.(data);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          options.onError?.(new Error("WebSocket error"));
        };

        ws.onclose = () => {
          console.log("❌ WebSocket disconnected");
          setIsConnected(false);

          if (options.autoReconnect) {
            setTimeout(connect, options.reconnectInterval || 5000);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
      }
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [options.url]);

  return { isConnected, lastMessage };
}
```

**Dashboard Updates Hook** (`src/hooks/useDashboardUpdates.ts`):

```typescript
"use client";

import { useState, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";

export function useDashboardUpdates() {
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [latestExecution, setLatestExecution] = useState<any>(null);
  const [latestAlert, setLatestAlert] = useState<any>(null);

  const handleMessage = useCallback((message: any) => {
    switch (message.event) {
      case "health_check":
        setHealthCheck(message.data);
        break;
      case "workflow_execution":
        setLatestExecution(message.data);
        break;
      case "alert":
        setLatestAlert(message.data);
        break;
    }
  }, []);

  const { isConnected } = useWebSocket({
    url: "ws://localhost:3002",
    autoReconnect: true,
    onMessage: handleMessage,
  });

  return {
    isConnected,
    healthCheck,
    latestExecution,
    latestAlert,
  };
}
```

---

## 📝 Code Examples

### Complete Widget Example

**SystemHealthWidget.tsx**:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useDashboardUpdates } from "@/hooks/useDashboardUpdates";

interface SystemHealthWidgetProps {
  initialData?: SystemHealthData;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function SystemHealthWidget({
  initialData,
  autoRefresh = true,
  refreshInterval = 30000
}: SystemHealthWidgetProps) {
  const [healthData, setHealthData] = useState(initialData);
  const { isConnected, healthCheck } = useDashboardUpdates();

  // Update from WebSocket
  useEffect(() => {
    if (healthCheck) {
      setHealthData(healthCheck);
    }
  }, [healthCheck]);

  // Fallback polling if WebSocket disconnected
  useEffect(() => {
    if (!autoRefresh || isConnected) return;

    const interval = setInterval(async () => {
      const response = await fetch("/api/monitoring/dashboard/overview");
      const data = await response.json();
      if (data.success) {
        setHealthData(data.data.systemHealth);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, isConnected, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "text-green-600 bg-green-50";
      case "DEGRADED":
        return "text-yellow-600 bg-yellow-50";
      case "UNHEALTHY":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          System Health
        </h3>
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
          )}
          <span className="text-xs text-gray-500">
            {isConnected ? "Live" : "Polling"}
          </span>
        </div>
      </div>

      <div
        className={`mb-4 rounded-md p-4 ${getStatusColor(healthData?.status || "UNKNOWN")}`}
      >
        <div className="text-2xl font-bold">
          {healthData?.status || "UNKNOWN"}
        </div>
        <div className="text-sm">
          Last check: {healthData?.lastCheck
            ? new Date(healthData.lastCheck).toLocaleString()
            : "Never"}
        </div>
      </div>

      <div className="space-y-2">
        {healthData?.checks && Object.entries(healthData.checks).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 capitalize">
              {key.replace(/_/g, " ")}
            </span>
            <span
              className={`text-sm font-medium ${
                value ? "text-green-600" : "text-red-600"
              }`}
            >
              {value ? "✓ OK" : "✗ Failed"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Strategy

### Unit Tests

**Component Test Example**:

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { SystemHealthWidget } from "./SystemHealthWidget";

describe("SystemHealthWidget", () => {
  it("renders health status", () => {
    const mockData = {
      status: "HEALTHY",
      lastCheck: new Date().toISOString(),
      checks: {
        database: true,
        api: true
      }
    };

    render(<SystemHealthWidget initialData={mockData} />);

    expect(screen.getByText("HEALTHY")).toBeInTheDocument();
    expect(screen.getByText("Database")).toBeInTheDocument();
  });

  it("updates on WebSocket message", async () => {
    // Test real-time update
  });
});
```

### Integration Tests

**API Test Example**:

```typescript
import { GET } from "@/app/api/monitoring/dashboard/overview/route";

describe("/api/monitoring/dashboard/overview", () => {
  it("returns dashboard overview data", async () => {
    const request = new Request(
      "http://localhost:3000/api/monitoring/dashboard/overview",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("systemHealth");
    expect(data.data).toHaveProperty("workflows");
  });
});
```

---

## ⚡ Performance Considerations

### Optimization Strategies

1. **Server-Side Rendering**
   - Use RSC for initial page load
   - Pre-fetch dashboard data
   - Reduce client-side JS

2. **Caching**
   - Redis cache for heavy queries
   - Stale-while-revalidate pattern
   - CDN for static assets

3. **Query Optimization**
   - Database indexes on frequently queried fields
   - Limit result sets
   - Use pagination

4. **WebSocket Efficiency**
   - Batch updates every 500ms
   - Only send changed data
   - Compress large payloads

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: WebSocket not connecting  
**Solution**: Check port 3002 is available, verify WebSocket server is running

**Issue**: Dashboard data not updating  
**Solution**: Check daemon is running (`npm run monitor:daemon:status`)

**Issue**: Slow query performance  
**Solution**: Add database indexes, limit result sets, enable caching

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Recharts Documentation](https://recharts.org)

---

**Last Updated**: November 26, 2025  
**Next Review**: After Week 1 completion

---

_"Build with consciousness, deploy with confidence."_ 🌾⚡
