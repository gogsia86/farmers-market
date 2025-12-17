"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// 🌾 AGRICULTURAL CALENDAR COMPONENT
// Divine calendar component for seasonal farm planning and biodynamic consciousness
// Embodies lunar cycles, seasonal awareness, and agricultural timing patterns
// ═══════════════════════════════════════════════════════════════════════════════

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";
export type LunarPhase =
  | "NEW_MOON"
  | "WAXING_CRESCENT"
  | "FIRST_QUARTER"
  | "WAXING_GIBBOUS"
  | "FULL_MOON"
  | "WANING_GIBBOUS"
  | "LAST_QUARTER"
  | "WANING_CRESCENT";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type?: "planting" | "harvest" | "maintenance" | "market" | "other";
  description?: string;
  farmId?: string;
  farmName?: string;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  showSeasonalIndicators?: boolean;
  showLunarPhases?: boolean;
  highlightWeekends?: boolean;
}

// Seasonal color themes with agricultural consciousness
const SEASONAL_THEMES: Record<
  Season,
  { bg: string; text: string; border: string; accent: string }
> = {
  SPRING: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-300",
    accent: "bg-green-500",
  },
  SUMMER: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
    accent: "bg-yellow-500",
  },
  FALL: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-300",
    accent: "bg-orange-500",
  },
  WINTER: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-300",
    accent: "bg-blue-500",
  },
};

// Event type colors
const EVENT_COLORS: Record<string, string> = {
  planting: "bg-green-500",
  harvest: "bg-amber-500",
  maintenance: "bg-blue-500",
  market: "bg-purple-500",
  other: "bg-gray-500",
};

// Get season from date with agricultural consciousness
function getSeason(date: Date): Season {
  const month = date.getMonth(); // 0-11

  if (month >= 2 && month <= 4) return "SPRING"; // Mar, Apr, May
  if (month >= 5 && month <= 7) return "SUMMER"; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return "FALL"; // Sep, Oct, Nov
  return "WINTER"; // Dec, Jan, Feb
}

// Calculate lunar phase (simplified approximation)
function getLunarPhase(date: Date): LunarPhase {
  const referenceNewMoon = new Date("2000-01-06T18:14:00Z");
  const synodicMonth = 29.53058867; // days

  const daysSinceReference =
    (date.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = (daysSinceReference % synodicMonth) / synodicMonth;

  if (phase < 0.0625 || phase >= 0.9375) return "NEW_MOON";
  if (phase < 0.1875) return "WAXING_CRESCENT";
  if (phase < 0.3125) return "FIRST_QUARTER";
  if (phase < 0.4375) return "WAXING_GIBBOUS";
  if (phase < 0.5625) return "FULL_MOON";
  if (phase < 0.6875) return "WANING_GIBBOUS";
  if (phase < 0.8125) return "LAST_QUARTER";
  return "WANING_CRESCENT";
}

// Lunar phase icons
const LUNAR_ICONS: Record<LunarPhase, string> = {
  NEW_MOON: "🌑",
  WAXING_CRESCENT: "🌒",
  FIRST_QUARTER: "🌓",
  WAXING_GIBBOUS: "🌔",
  FULL_MOON: "🌕",
  WANING_GIBBOUS: "🌖",
  LAST_QUARTER: "🌗",
  WANING_CRESCENT: "🌘",
};

// Get days in month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Get first day of month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Check if dates are same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Check if date is today
function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * 🌾 Calendar Component - Divine Seasonal Planning
 *
 * Agricultural calendar with seasonal awareness, lunar phase tracking,
 * and biodynamic farming consciousness for optimal planting and harvest timing.
 *
 * @example
 * ```tsx
 * const farmEvents: CalendarEvent[] = [
 *   {
 *     id: "1",
 *     title: "Plant Tomatoes",
 *     date: new Date("2024-04-15"),
 *     type: "planting",
 *     farmName: "Sunrise Valley Farm"
 *   },
 *   {
 *     id: "2",
 *     title: "Harvest Lettuce",
 *     date: new Date("2024-05-20"),
 *     type: "harvest"
 *   }
 * ];
 *
 * <Calendar
 *   events={farmEvents}
 *   showSeasonalIndicators
 *   showLunarPhases
 *   onDateSelect={(date) => console.log("Selected:", date)}
 * />
 * ```
 */
export function Calendar({
  events = [],
  selectedDate,
  onDateSelect,
  onEventClick,
  minDate,
  maxDate,
  className,
  showSeasonalIndicators = true,
  showLunarPhases = false,
  highlightWeekends = true,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const season = getSeason(currentMonth);
  const theme = SEASONAL_THEMES[season];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Generate calendar grid
  const calendarDays: (Date | null)[] = [];

  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  // Check if date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div
      className={cn(
        "calendar-container rounded-lg border shadow-sm",
        theme.bg,
        theme.border,
        className,
      )}
      role="application"
      aria-label="Agricultural Calendar"
    >
      {/* Calendar Header */}
      <div
        className={cn(
          "calendar-header flex items-center justify-between p-4 border-b",
          theme.border,
        )}
      >
        <button
          onClick={goToPreviousMonth}
          className={cn(
            "p-2 rounded-md hover:bg-white/50 transition-colors",
            theme.text,
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className={cn("text-lg font-semibold", theme.text)}>
            {monthName}
          </h2>
          {showSeasonalIndicators && (
            <p className={cn("text-xs mt-1", theme.text, "opacity-75")}>
              {season} Season
            </p>
          )}
        </div>

        <button
          onClick={goToNextMonth}
          className={cn(
            "p-2 rounded-md hover:bg-white/50 transition-colors",
            theme.text,
          )}
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Today Button */}
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={goToToday}
          className={cn(
            "text-xs px-3 py-1 rounded-md transition-colors",
            "hover:bg-white/50",
            theme.text,
          )}
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-body p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs font-semibold py-2",
                theme.text,
                "opacity-75",
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayEvents = getEventsForDate(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);
            const isDisabled = isDateDisabled(date);
            const isWeekend =
              highlightWeekends && (date.getDay() === 0 || date.getDay() === 6);
            const lunarPhase = showLunarPhases ? getLunarPhase(date) : null;

            return (
              <button
                key={date.toISOString()}
                onClick={() => !isDisabled && onDateSelect?.(date)}
                disabled={isDisabled}
                className={cn(
                  "calendar-day aspect-square p-1 rounded-md text-sm transition-all relative",
                  "hover:bg-white/50 hover:scale-105",
                  isSelected && "ring-2 ring-offset-1",
                  isSelected && theme.accent.replace("bg-", "ring-"),
                  isTodayDate && "font-bold",
                  isTodayDate && theme.accent,
                  isTodayDate && "text-white",
                  isWeekend && !isTodayDate && "bg-white/30",
                  isDisabled && "opacity-40 cursor-not-allowed hover:scale-100",
                  !isDisabled && "cursor-pointer",
                )}
                aria-label={`${date.toLocaleDateString()}, ${dayEvents.length} events`}
                aria-selected={isSelected}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={cn(
                      "text-xs",
                      isTodayDate ? "text-white" : theme.text,
                    )}
                  >
                    {date.getDate()}
                  </span>

                  {lunarPhase && (
                    <span className="text-xs" title={lunarPhase}>
                      {LUNAR_ICONS[lunarPhase]}
                    </span>
                  )}

                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-auto justify-center flex-wrap">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            EVENT_COLORS[event.type || "other"],
                          )}
                          title={event.title}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-gray-600">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className={cn("calendar-events border-t p-4", theme.border)}>
          <h3 className={cn("text-sm font-semibold mb-3", theme.text)}>
            Events on{" "}
            {selectedDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h3>

          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-sm text-gray-500">No events scheduled</p>
          ) : (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className="w-full text-left p-3 rounded-md bg-white/50 hover:bg-white/80 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                        EVENT_COLORS[event.type || "other"],
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", theme.text)}>
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {event.description}
                        </p>
                      )}
                      {event.farmName && (
                        <p className="text-xs text-gray-500 mt-1">
                          🌾 {event.farmName}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className={cn("calendar-legend border-t p-4", theme.border)}>
        <p className="text-xs font-semibold mb-2 text-gray-700">Event Types</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(EVENT_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", color)} />
              <span className="text-xs text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export for divine agricultural consciousness
export default Calendar;
