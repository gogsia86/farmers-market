"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Sprout,
  Apple,
  Carrot,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES - Divine Agricultural Type System
// ============================================================================

export type HarvestStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
export type CropType = "VEGETABLE" | "FRUIT" | "GRAIN" | "HERB" | "OTHER";

export interface HarvestEvent {
  id: string;
  cropName: string;
  cropType: CropType;
  plantDate?: Date;
  harvestDate: Date;
  status: HarvestStatus;
  quantity?: string;
  notes?: string;
}

export interface HarvestCalendarProps {
  /** Harvest events to display */
  events: HarvestEvent[];
  /** Initial month to display */
  initialDate?: Date;
  /** Highlight today */
  highlightToday?: boolean;
  /** Show crop icons */
  showCropIcons?: boolean;
  /** On event click handler */
  onEventClick?: (event: HarvestEvent) => void;
  /** On date click handler */
  onDateClick?: (date: Date) => void;
  /** Custom className */
  className?: string;
  /** Animated transitions */
  animated?: boolean;
}

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: HarvestEvent[];
}

// ============================================================================
// CONFIGURATION - Biodynamic Consciousness
// ============================================================================

const STATUS_CONFIG: Record<
  HarvestStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ElementType;
  }
> = {
  PLANNED: {
    label: "Planned",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    icon: Sprout,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: Check,
  },
  DELAYED: {
    label: "Delayed",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: AlertCircle,
  },
};

const CROP_ICONS: Record<CropType, React.ElementType> = {
  VEGETABLE: Carrot,
  FRUIT: Apple,
  GRAIN: Leaf,
  HERB: Sprout,
  OTHER: Leaf,
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getEventsForDate(events: HarvestEvent[], date: Date): HarvestEvent[] {
  return events.filter((event) => isSameDay(event.harvestDate, date));
}

// ============================================================================
// HARVEST CALENDAR COMPONENT - Divine Implementation
// ============================================================================

export function HarvestCalendar({
  events,
  initialDate = new Date(),
  highlightToday = true,
  showCropIcons = true,
  onEventClick,
  onDateClick,
  className,
  animated = true,
}: HarvestCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar grid
  const generateCalendar = (): DayCell[] => {
    const cells: DayCell[] = [];
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      cells.push({
        date,
        isCurrentMonth: false,
        isToday: highlightToday && isSameDay(date, today),
        events: getEventsForDate(events, date),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      cells.push({
        date,
        isCurrentMonth: true,
        isToday: highlightToday && isSameDay(date, today),
        events: getEventsForDate(events, date),
      });
    }

    // Next month days to complete grid
    const remainingCells = 42 - cells.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      cells.push({
        date,
        isCurrentMonth: false,
        isToday: highlightToday && isSameDay(date, today),
        events: getEventsForDate(events, date),
      });
    }

    return cells;
  };

  const calendar = generateCalendar();

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm",
        className,
      )}
      role="region"
      aria-label="Harvest planning calendar"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
          <h2 className="text-lg font-bold text-gray-900">
            {MONTHS[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md",
              "border border-gray-300 text-gray-700",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500",
              animated && "transition-colors",
            )}
            aria-label="Go to today"
          >
            Today
          </button>
          <div className="flex items-center gap-1 border border-gray-300 rounded-md">
            <button
              onClick={handlePreviousMonth}
              className={cn(
                "p-1.5 rounded-l-md hover:bg-gray-50",
                "focus:outline-none focus:ring-2 focus:ring-green-500",
                animated && "transition-colors",
              )}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className={cn(
                "p-1.5 rounded-r-md hover:bg-gray-50",
                "focus:outline-none focus:ring-2 focus:ring-green-500",
                animated && "transition-colors",
              )}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendar.map((cell, index) => {
          const hasEvents = cell.events.length > 0;
          const CropIcon =
            hasEvents && showCropIcons && cell.events[0]
              ? CROP_ICONS[cell.events[0].cropType]
              : null;

          return (
            <div
              key={index}
              className={cn(
                "min-h-[100px] border-b border-r border-gray-100 p-2",
                "hover:bg-gray-50 cursor-pointer",
                animated && "transition-colors",
                !cell.isCurrentMonth && "bg-gray-50/50",
                cell.isToday && "bg-green-50 ring-2 ring-green-500 ring-inset",
              )}
              onClick={() => onDateClick?.(cell.date)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDateClick?.(cell.date);
                }
              }}
              aria-label={`${cell.date.toLocaleDateString()}, ${cell.events.length} events`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 text-sm rounded-full",
                    cell.isCurrentMonth
                      ? "text-gray-900 font-medium"
                      : "text-gray-400",
                    cell.isToday && "bg-green-600 text-white font-bold",
                  )}
                >
                  {cell.date.getDate()}
                </span>
                {CropIcon && (
                  <CropIcon
                    className="h-3.5 w-3.5 text-gray-400"
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {cell.events.slice(0, 3).map((event) => {
                  const StatusIcon = STATUS_CONFIG[event.status].icon;
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs px-2 py-1 rounded truncate",
                        STATUS_CONFIG[event.status].bgColor,
                        "cursor-pointer hover:shadow-sm",
                        animated && "transition-shadow",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      title={`${event.cropName} - ${STATUS_CONFIG[event.status].label}`}
                    >
                      <div className="flex items-center gap-1">
                        <StatusIcon
                          className={cn(
                            "h-3 w-3 flex-shrink-0",
                            STATUS_CONFIG[event.status].color,
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            "truncate",
                            STATUS_CONFIG[event.status].color,
                          )}
                        >
                          {event.cropName}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {cell.events.length > 3 && (
                  <div className="text-xs text-gray-500 px-2">
                    +{cell.events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <span className="text-xs font-semibold text-gray-600">Legend:</span>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center gap-1.5">
                <Icon
                  className={cn("h-3.5 w-3.5", config.color)}
                  aria-hidden="true"
                />
                <span className="text-xs text-gray-600">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { STATUS_CONFIG, CROP_ICONS };

// ============================================================================
// DISPLAY NAME - For React DevTools
// ============================================================================

HarvestCalendar.displayName = "HarvestCalendar";

// ============================================================================
// EXPORTS
// ============================================================================

export default HarvestCalendar;
