"use client";

// 📅 QUANTUM TIMELINE - Divine Event Timeline Component
// Displays events in a vertical timeline with agricultural consciousness
// Follows divine patterns from Day 6 components

import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Leaf,
  Sprout,
  Sun,
  Wheat,
  XCircle,
} from "lucide-react";
import React, { useMemo } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TimelineEventStatus =
  | "completed"
  | "in_progress"
  | "upcoming"
  | "cancelled"
  | "pending";

export type TimelineEventType =
  | "planting"
  | "harvest"
  | "watering"
  | "fertilizing"
  | "general"
  | "order"
  | "delivery"
  | "payment";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  status: TimelineEventStatus;
  type?: TimelineEventType;
  metadata?: Record<string, any>;
  icon?: React.ReactNode;
  color?: string;
  href?: string;
}

export interface TimelineGroup {
  id: string;
  title: string;
  description?: string;
  events: TimelineEvent[];
  color?: string;
}

export interface QuantumTimelineProps {
  events?: TimelineEvent[];
  groups?: TimelineGroup[];
  mode?: "events" | "grouped";
  variant?: "default" | "compact" | "detailed";
  orientation?: "vertical" | "horizontal";
  showIcons?: boolean;
  showTimestamps?: boolean;
  animate?: boolean;
  maxEvents?: number;
  onEventClick?: (event: TimelineEvent) => void;
  emptyMessage?: string;
  className?: string;
  agriculturalConsciousness?: "low" | "medium" | "high";
}

// ============================================================================
// AGRICULTURAL AWARENESS
// ============================================================================

const getEventIcon = (type: TimelineEventType, status: TimelineEventStatus) => {
  const iconClass = "h-5 w-5";

  if (status === "completed") {
    return <CheckCircle2 className={iconClass} />;
  }

  if (status === "cancelled") {
    return <XCircle className={iconClass} />;
  }

  switch (type) {
    case "planting":
      return <Sprout className={iconClass} />;
    case "harvest":
      return <Wheat className={iconClass} />;
    case "watering":
      return <Sun className={iconClass} />;
    case "fertilizing":
      return <Leaf className={iconClass} />;
    case "order":
    case "delivery":
    case "payment":
      return <Calendar className={iconClass} />;
    default:
      return <Circle className={iconClass} />;
  }
};

const getEventColor = (
  type: TimelineEventType,
  status: TimelineEventStatus,
  customColor?: string
): string => {
  if (customColor) return customColor;

  if (status === "completed") return "green";
  if (status === "cancelled") return "red";
  if (status === "in_progress") return "blue";

  switch (type) {
    case "planting":
      return "emerald";
    case "harvest":
      return "amber";
    case "watering":
      return "sky";
    case "fertilizing":
      return "lime";
    case "order":
      return "purple";
    case "delivery":
      return "indigo";
    case "payment":
      return "green";
    default:
      return "gray";
  }
};

const getStatusBadge = (status: TimelineEventStatus): string => {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "upcoming":
      return "Upcoming";
    case "cancelled":
      return "Cancelled";
    case "pending":
      return "Pending";
    default:
      return "Unknown";
  }
};

// ============================================================================
// TIMELINE ITEM COMPONENT
// ============================================================================

interface TimelineItemProps {
  event: TimelineEvent;
  isLast: boolean;
  variant: "default" | "compact" | "detailed";
  showIcons: boolean;
  showTimestamps: boolean;
  animate: boolean;
  onClick?: (event: TimelineEvent) => void;
  index: number;
}

function TimelineItem({
  event,
  isLast,
  variant,
  showIcons,
  showTimestamps,
  animate,
  onClick,
  index,
}: TimelineItemProps) {
  const color = getEventColor(
    event.type || "general",
    event.status,
    event.color
  );
  const icon =
    event.icon || getEventIcon(event.type || "general", event.status);

  const colorClasses = {
    green: "bg-green-500 border-green-500 text-green-700",
    emerald: "bg-emerald-500 border-emerald-500 text-emerald-700",
    amber: "bg-amber-500 border-amber-500 text-amber-700",
    sky: "bg-sky-500 border-sky-500 text-sky-700",
    lime: "bg-lime-500 border-lime-500 text-lime-700",
    purple: "bg-purple-500 border-purple-500 text-purple-700",
    indigo: "bg-indigo-500 border-indigo-500 text-indigo-700",
    red: "bg-red-500 border-red-500 text-red-700",
    blue: "bg-blue-500 border-blue-500 text-blue-700",
    gray: "bg-gray-500 border-gray-500 text-gray-700",
  };

  const bgColorClass = colorClasses[color as keyof typeof colorClasses];

  const timestamp =
    typeof event.timestamp === "string"
      ? new Date(event.timestamp)
      : event.timestamp;

  const formattedTime = timestamp.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const relativeTime = getRelativeTime(timestamp);

  const isClickable = !!onClick || !!event.href;

  return (
    <div
      className={cn(
        "group relative flex gap-4 pb-8",
        animate && "animate-in fade-in slide-in-from-left-4",
        animate && `duration-${300 + index * 100}`
      )}
      style={animate ? { animationDelay: `${index * 100}ms` } : undefined}
    >
      {/* Timeline Line & Icon */}
      <div className="relative flex flex-col items-center">
        {/* Icon Circle */}
        <div
          className={cn(
            "z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg transition-transform",
            bgColorClass.split(" ")[1], // border color
            isClickable && "group-hover:scale-110 cursor-pointer"
          )}
        >
          <div className={bgColorClass.split(" ")[2]}>{showIcons && icon}</div>
        </div>

        {/* Vertical Line */}
        {!isLast && (
          <div
            className={cn(
              "absolute top-10 h-full w-0.5",
              bgColorClass.split(" ")[0],
              "opacity-30"
            )}
          />
        )}
      </div>

      {/* Event Content */}
      <div className="flex-1 pt-1">
        <div
          className={cn(
            "rounded-lg border bg-white p-4 shadow-sm transition-all",
            isClickable &&
            "cursor-pointer hover:shadow-md hover:border-gray-300",
            variant === "compact" && "p-3"
          )}
          onClick={() => {
            if (onClick) onClick(event);
            if (event.href) window.location.href = event.href;
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3
                className={cn(
                  "font-semibold text-gray-900",
                  variant === "compact" ? "text-sm" : "text-base"
                )}
              >
                {event.title}
              </h3>

              {showTimestamps && (
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>{formattedTime}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{relativeTime}</span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                bgColorClass.split(" ")[0],
                "bg-opacity-10"
              )}
            >
              {getStatusBadge(event.status)}
            </span>
          </div>

          {/* Description */}
          {event.description && variant !== "compact" && (
            <p className="mt-2 text-sm text-gray-600">{event.description}</p>
          )}

          {/* Metadata */}
          {event.metadata &&
            Object.keys(event.metadata).length > 0 &&
            variant === "detailed" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(event.metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-700"
                  >
                    <span className="font-medium">{key}:</span>{" "}
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TIMELINE GROUP COMPONENT
// ============================================================================

interface TimelineGroupComponentProps {
  group: TimelineGroup;
  variant: "default" | "compact" | "detailed";
  showIcons: boolean;
  showTimestamps: boolean;
  animate: boolean;
  onEventClick?: (event: TimelineEvent) => void;
}

function TimelineGroupComponent({
  group,
  variant,
  showIcons,
  showTimestamps,
  animate,
  onEventClick,
}: TimelineGroupComponentProps) {
  const groupColor = group.color || "green";

  const colorClasses = {
    green: "bg-green-50 border-green-200 text-green-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };

  const bgClass = colorClasses[groupColor as keyof typeof colorClasses];

  return (
    <div className="mb-8">
      {/* Group Header */}
      <div
        className={cn("mb-4 rounded-lg border p-4", bgClass, "bg-opacity-50")}
      >
        <h2 className="text-lg font-bold">{group.title}</h2>
        {group.description && (
          <p className="mt-1 text-sm opacity-80">{group.description}</p>
        )}
      </div>

      {/* Group Events */}
      <div className="ml-4">
        {group.events.map((event, index) => (
          <TimelineItem
            key={event.id}
            event={event}
            isLast={index === group.events.length - 1}
            variant={variant}
            showIcons={showIcons}
            showTimestamps={showTimestamps}
            animate={animate}
            onClick={onEventClick}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function QuantumTimeline({
  events = [],
  groups = [],
  mode = "events",
  variant = "default",
  orientation = "vertical",
  showIcons = true,
  showTimestamps = true,
  animate = true,
  maxEvents,
  onEventClick,
  emptyMessage = "No events to display",
  className,
  agriculturalConsciousness = "medium",
}: QuantumTimelineProps) {
  // ==========================================================================
  // SORT & FILTER EVENTS
  // ==========================================================================
  const sortedEvents = useMemo(() => {
    const allEvents = mode === "events" ? events : [];
    const sorted = [...allEvents].sort((a, b) => {
      const timeA =
        typeof a.timestamp === "string"
          ? new Date(a.timestamp).getTime()
          : a.timestamp.getTime();
      const timeB =
        typeof b.timestamp === "string"
          ? new Date(b.timestamp).getTime()
          : b.timestamp.getTime();
      return timeB - timeA; // Most recent first
    });

    return maxEvents ? sorted.slice(0, maxEvents) : sorted;
  }, [events, mode, maxEvents]);

  const sortedGroups = useMemo(() => {
    return mode === "grouped" ? groups : [];
  }, [groups, mode]);

  // ==========================================================================
  // EMPTY STATE
  // ==========================================================================
  if (
    mode === "events" &&
    sortedEvents.length === 0 &&
    sortedGroups.length === 0
  ) {
    return (
      <div className={cn("rounded-lg border-2 border-dashed p-12", className)}>
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No Events
          </h3>
          <p className="mt-2 text-sm text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  if (mode === "grouped" && sortedGroups.length === 0) {
    return (
      <div className={cn("rounded-lg border-2 border-dashed p-12", className)}>
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No Event Groups
          </h3>
          <p className="mt-2 text-sm text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // HORIZONTAL ORIENTATION (COMPACT)
  // ==========================================================================
  if (orientation === "horizontal") {
    return (
      <div className={cn("overflow-x-auto pb-4", className)}>
        <div className="flex gap-4 min-w-max">
          {sortedEvents.map((event, index) => {
            const color = getEventColor(
              event.type || "general",
              event.status,
              event.color
            );
            const icon =
              event.icon ||
              getEventIcon(event.type || "general", event.status);

            const timestamp =
              typeof event.timestamp === "string"
                ? new Date(event.timestamp)
                : event.timestamp;

            const formattedTime = timestamp.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
            });

            const colorClasses = {
              green: "bg-green-500 text-green-700",
              emerald: "bg-emerald-500 text-emerald-700",
              amber: "bg-amber-500 text-amber-700",
              sky: "bg-sky-500 text-sky-700",
              lime: "bg-lime-500 text-lime-700",
              purple: "bg-purple-500 text-purple-700",
              indigo: "bg-indigo-500 text-indigo-700",
              red: "bg-red-500 text-red-700",
              blue: "bg-blue-500 text-blue-700",
              gray: "bg-gray-500 text-gray-700",
            };

            const bgColorClass = colorClasses[color as keyof typeof colorClasses];

            return (
              <div
                key={event.id}
                className={cn(
                  "flex flex-col items-center gap-2 w-32",
                  animate && "animate-in fade-in zoom-in-95",
                  animate && `duration-${300 + index * 100}`
                )}
                style={
                  animate ? { animationDelay: `${index * 100}ms` } : undefined
                }
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-lg",
                    bgColorClass.split(" ")[0]
                  )}
                >
                  <div className="text-white">{showIcons && icon}</div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-900">
                    {event.title}
                  </p>
                  {showTimestamps && (
                    <p className="text-xs text-gray-500">{formattedTime}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VERTICAL ORIENTATION (DEFAULT)
  // ==========================================================================
  return (
    <div className={cn("relative", className)}>
      {mode === "events" &&
        sortedEvents.map((event, index) => (
          <TimelineItem
            key={event.id}
            event={event}
            isLast={index === sortedEvents.length - 1}
            variant={variant}
            showIcons={showIcons}
            showTimestamps={showTimestamps}
            animate={animate}
            onClick={onEventClick}
            index={index}
          />
        ))}

      {mode === "grouped" &&
        sortedGroups.map((group) => (
          <TimelineGroupComponent
            key={group.id}
            group={group}
            variant={variant}
            showIcons={showIcons}
            showTimestamps={showTimestamps}
            animate={animate}
            onEventClick={onEventClick}
          />
        ))}
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default QuantumTimeline;
