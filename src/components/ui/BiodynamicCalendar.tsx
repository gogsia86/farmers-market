"use client";

// 📅 BIODYNAMIC CALENDAR - Divine Calendar Component with Seasonal Awareness
// Full-featured calendar with agricultural consciousness and seasonal themes
// Follows divine patterns from Day 6 components

import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Snowflake,
  Sprout,
  Sun,
} from "lucide-react";
import React, { useMemo, useState } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";

export type CalendarView = "month" | "week" | "day";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  endDate?: Date | string;
  color?: string;
  type?: string;
  metadata?: Record<string, any>;
  isAllDay?: boolean;
}

export interface BiodynamicCalendarProps {
  events?: CalendarEvent[];
  initialDate?: Date;
  view?: CalendarView;
  showWeekNumbers?: boolean;
  showSeasonalTheme?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  highlightToday?: boolean;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onMonthChange?: (date: Date) => void;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
  className?: string;
  agriculturalConsciousness?: "low" | "medium" | "high";
}

// ============================================================================
// SEASONAL AWARENESS
// ============================================================================

function getSeason(date: Date): Season {
  const month = date.getMonth();

  // Northern Hemisphere seasons
  if (month >= 2 && month <= 4) return "SPRING"; // Mar, Apr, May
  if (month >= 5 && month <= 7) return "SUMMER"; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return "FALL"; // Sep, Oct, Nov
  return "WINTER"; // Dec, Jan, Feb
}

function getSeasonalTheme(season: Season) {
  switch (season) {
    case "SPRING":
      return {
        name: "Spring",
        icon: Sprout,
        colors: {
          primary: "bg-emerald-500",
          secondary: "bg-emerald-100",
          text: "text-emerald-700",
          border: "border-emerald-200",
          hover: "hover:bg-emerald-50",
        },
        gradient: "from-emerald-50 to-green-50",
        description: "Season of growth and renewal",
      };
    case "SUMMER":
      return {
        name: "Summer",
        icon: Sun,
        colors: {
          primary: "bg-amber-500",
          secondary: "bg-amber-100",
          text: "text-amber-700",
          border: "border-amber-200",
          hover: "hover:bg-amber-50",
        },
        gradient: "from-amber-50 to-yellow-50",
        description: "Season of abundance and harvest",
      };
    case "FALL":
      return {
        name: "Fall",
        icon: Leaf,
        colors: {
          primary: "bg-orange-500",
          secondary: "bg-orange-100",
          text: "text-orange-700",
          border: "border-orange-200",
          hover: "hover:bg-orange-50",
        },
        gradient: "from-orange-50 to-red-50",
        description: "Season of harvest and preparation",
      };
    case "WINTER":
      return {
        name: "Winter",
        icon: Snowflake,
        colors: {
          primary: "bg-blue-500",
          secondary: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-200",
          hover: "hover:bg-blue-50",
        },
        gradient: "from-blue-50 to-cyan-50",
        description: "Season of rest and planning",
      };
  }
}

// ============================================================================
// DATE UTILITIES
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

function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[]
): boolean {
  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  if (disabledDates?.some((d: any) => isSameDay(d, date))) return true;
  return false;
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// ============================================================================
// MONTH VIEW COMPONENT
// ============================================================================

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  season: Season;
  showSeasonalTheme: boolean;
  highlightToday: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showWeekNumbers: boolean;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
}

function MonthView({
  currentDate,
  events,
  season,
  showSeasonalTheme,
  highlightToday,
  minDate,
  maxDate,
  disabledDates,
  showWeekNumbers,
  onDateClick,
  onEventClick,
  renderEvent,
}: MonthViewProps) {
  const theme = getSeasonalTheme(season);
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Generate calendar grid
  const calendarDays: (Date | null)[] = [];

  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    events.forEach((event: any) => {
      const eventDate =
        typeof event.date === "string" ? new Date(event.date) : event.date;
      const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });

    return grouped;
  }, [events]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventsByDate.get(dateKey) || [];
  };

  return (
    <div className="space-y-4">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {showWeekNumbers && (
          <div className="text-center text-xs font-semibold text-gray-500">
            Wk
          </div>
        )}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day: any) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date: any, index: any) => {
          if (date === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isToday = highlightToday && isSameDay(date, today);
          const isDisabled = isDateDisabled(date, minDate, maxDate, disabledDates);
          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;

          // Week number (show at start of each row)
          const showWeekNumberForDay =
            showWeekNumbers && index % 7 === 0 && date !== null;

          return (
            <React.Fragment key={date.toISOString()}>
              {showWeekNumberForDay && (
                <div className="flex items-center justify-center text-xs text-gray-400">
                  {getWeekNumber(date)}
                </div>
              )}
              <button
                type="button"
                onClick={() => !isDisabled && onDateClick?.(date)}
                disabled={isDisabled}
                className={cn(
                  "group relative aspect-square rounded-lg border p-2 text-sm transition-all",
                  "flex flex-col items-start",
                  isToday &&
                  showSeasonalTheme &&
                  `${theme.colors.border} ${theme.colors.secondary} font-bold`,
                  isToday && !showSeasonalTheme && "border-green-500 bg-green-50 font-bold",
                  !isToday && "border-gray-200 hover:border-gray-300",
                  !isDisabled && !isToday && theme.colors.hover,
                  isDisabled && "cursor-not-allowed opacity-40",
                  hasEvents && !isToday && "bg-gray-50"
                )}
              >
                {/* Day Number */}
                <span
                  className={cn(
                    "text-sm",
                    isToday && showSeasonalTheme && theme.colors.text,
                    isToday && !showSeasonalTheme && "text-green-700",
                    !isToday && !isDisabled && "text-gray-900",
                    isDisabled && "text-gray-400"
                  )}
                >
                  {date.getDate()}
                </span>

                {/* Event Indicators */}
                {hasEvents && (
                  <div className="mt-1 flex w-full flex-col gap-0.5">
                    {dayEvents.slice(0, 2).map((event: any) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px] font-medium text-white",
                          event.color || "bg-green-500",
                          "cursor-pointer hover:opacity-80"
                        )}
                        title={event.title}
                      >
                        {renderEvent ? renderEvent(event) : event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-gray-500">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BiodynamicCalendar({
  events = [],
  initialDate = new Date(),
  view = "month",
  showWeekNumbers = false,
  showSeasonalTheme = true,
  minDate,
  maxDate,
  disabledDates = [],
  highlightToday = true,
  onDateClick,
  onEventClick,
  onMonthChange,
  renderEvent,
  className,
  agriculturalConsciousness = "high",
}: BiodynamicCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [currentView, setCurrentView] = useState(view);

  const season = getSeason(currentDate);
  const theme = getSeasonalTheme(season);
  const SeasonIcon = theme.icon;

  const monthName = currentDate.toLocaleString("en-US", { month: "long" });
  const year = currentDate.getFullYear();

  // ==========================================================================
  // NAVIGATION HANDLERS
  // ==========================================================================

  const handlePreviousMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onMonthChange?.(today);
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-6 shadow-sm",
        showSeasonalTheme && `bg-gradient-to-br ${theme.gradient}`,
        className
      )}
    >
      {/* Header */}
      <div className="mb-6 space-y-4">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {monthName} {year}
            </h2>
            {showSeasonalTheme && (
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
                  theme.colors.secondary,
                  theme.colors.text
                )}
              >
                <SeasonIcon className="h-4 w-4" />
                <span>{theme.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className={cn(
                "rounded-lg p-2 transition-colors",
                theme.colors.hover,
                "hover:bg-gray-100"
              )}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            <button
              type="button"
              onClick={handleToday}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                showSeasonalTheme && theme.colors.primary,
                showSeasonalTheme && "text-white",
                !showSeasonalTheme && "bg-green-600 text-white",
                "hover:opacity-90"
              )}
            >
              Today
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className={cn(
                "rounded-lg p-2 transition-colors",
                theme.colors.hover,
                "hover:bg-gray-100"
              )}
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Seasonal Description */}
        {showSeasonalTheme && agriculturalConsciousness === "high" && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{theme.description}</span>
          </div>
        )}
      </div>

      {/* Calendar View */}
      {currentView === "month" && (
        <MonthView
          currentDate={currentDate}
          events={events}
          season={season}
          showSeasonalTheme={showSeasonalTheme}
          highlightToday={highlightToday}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
          showWeekNumbers={showWeekNumbers}
          onDateClick={onDateClick}
          onEventClick={onEventClick}
          renderEvent={renderEvent}
        />
      )}

      {/* Event Summary */}
      {events.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{events.length}</span> event
              {events.length !== 1 ? "s" : ""} this month
            </p>
            <div className="flex gap-2">
              {agriculturalConsciousness !== "low" && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Leaf className="h-3 w-3" />
                  <span>Agricultural Calendar</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default BiodynamicCalendar;
