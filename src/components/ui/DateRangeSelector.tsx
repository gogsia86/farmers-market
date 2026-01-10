"use client";

// 📅 DATE RANGE SELECTOR - Divine Date Range Selection Component
// Allows users to select date ranges with presets and custom selection
// Follows divine patterns from Day 6 components

import { cn } from "@/lib/utils";
import { Calendar, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export interface DateRangeSelectorProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  showPresets?: boolean;
  presets?: DateRangePreset[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  format?: "short" | "long";
}

// ============================================================================
// PRESET DEFINITIONS
// ============================================================================

const presetDefinitions: Record<
  DateRangePreset,
  { label: string; getValue: () => DateRange }
> = {
  today: {
    label: "Today",
    getValue: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return { start: today, end };
    },
  },
  yesterday: {
    label: "Yesterday",
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const end = new Date(yesterday);
      end.setHours(23, 59, 59, 999);
      return { start: yesterday, end };
    },
  },
  last7days: {
    label: "Last 7 Days",
    getValue: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  last30days: {
    label: "Last 30 Days",
    getValue: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  thisMonth: {
    label: "This Month",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  lastMonth: {
    label: "Last Month",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  thisYear: {
    label: "This Year",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  custom: {
    label: "Custom Range",
    getValue: () => ({ start: null, end: null }),
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDateRange(range: DateRange, format: "short" | "long" = "short"): string {
  if (!range.start && !range.end) return "";

  const formatOptions: Intl.DateTimeFormatOptions =
    format === "short"
      ? { month: "short", day: "numeric", year: "numeric" }
      : { month: "long", day: "numeric", year: "numeric" };

  if (range.start && range.end) {
    const startStr = range.start.toLocaleDateString("en-US", formatOptions);
    const endStr = range.end.toLocaleDateString("en-US", formatOptions);

    // Same day
    if (isSameDay(range.start, range.end)) {
      return startStr;
    }

    return `${startStr} - ${endStr}`;
  }

  if (range.start) {
    return `From ${range.start.toLocaleDateString("en-US", formatOptions)}`;
  }

  if (range.end) {
    return `Until ${range.end.toLocaleDateString("en-US", formatOptions)}`;
  }

  return "";
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isDateInRange(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
}

// ============================================================================
// MINI CALENDAR COMPONENT
// ============================================================================

interface MiniCalendarProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

function MiniCalendar({
  selectedRange,
  onRangeChange,
  minDate,
  maxDate,
  currentMonth,
  onMonthChange,
}: MiniCalendarProps) {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays: (Date | null)[] = [];

  // Add empty cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const handleDateClick = (date: Date) => {
    if (!isDateInRange(date, minDate, maxDate)) return;

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      // Start new selection
      onRangeChange({ start: date, end: null });
    } else {
      // Complete selection
      if (date >= selectedRange.start) {
        onRangeChange({ start: selectedRange.start, end: date });
      } else {
        onRangeChange({ start: date, end: selectedRange.start });
      }
    }
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedRange.start) return false;
    if (!selectedRange.end) return isSameDay(date, selectedRange.start);

    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isDateInHoverRange = (date: Date): boolean => {
    if (!selectedRange.start || selectedRange.end || !hoverDate) return false;

    const start = selectedRange.start < hoverDate ? selectedRange.start : hoverDate;
    const end = selectedRange.start < hoverDate ? hoverDate : selectedRange.start;

    return date >= start && date <= end;
  };

  const previousMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const monthName = currentMonth.toLocaleString("en-US", { month: "long" });

  return (
    <div className="space-y-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={previousMonth}
          className="rounded p-1 hover:bg-gray-100"
        >
          <ChevronDown className="h-4 w-4 rotate-90" />
        </button>
        <div className="text-sm font-semibold text-gray-900">
          {monthName} {year}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded p-1 hover:bg-gray-100"
        >
          <ChevronDown className="h-4 w-4 -rotate-90" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((day: any, i: any) => (
          <div key={i} className="text-center text-xs font-medium text-gray-600">
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

          const isSelected = isDateSelected(date);
          const isInHoverRange = isDateInHoverRange(date);
          const isDisabled = !isDateInRange(date, minDate, maxDate);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoverDate(date)}
              onMouseLeave={() => setHoverDate(null)}
              disabled={isDisabled}
              className={cn(
                "aspect-square rounded text-xs transition-colors",
                isSelected && "bg-green-600 text-white font-semibold",
                isInHoverRange && !isSelected && "bg-green-100",
                !isSelected && !isInHoverRange && !isDisabled && "hover:bg-gray-100",
                isDisabled && "cursor-not-allowed opacity-30",
                !isDisabled && !isSelected && "text-gray-900",
                isToday && !isSelected && "border border-green-600"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DateRangeSelector({
  value = { start: null, end: null },
  onChange,
  minDate,
  maxDate,
  showPresets = true,
  presets = ["today", "yesterday", "last7days", "last30days", "thisMonth", "lastMonth"],
  placeholder = "Select date range",
  className,
  disabled = false,
  clearable = true,
  format = "short",
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePresetClick = (preset: DateRangePreset) => {
    const range = presetDefinitions[preset].getValue();
    onChange(range);
    setSelectedPreset(preset);
    if (preset !== "custom") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange({ start: null, end: null });
    setSelectedPreset(null);
  };

  const displayText = formatDateRange(value, format);
  const hasValue = value.start || value.end;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm transition-colors",
          "hover:border-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20",
          disabled && "cursor-not-allowed opacity-50",
          isOpen && "border-green-500 ring-2 ring-green-500 ring-opacity-20"
        )}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className={cn(hasValue ? "text-gray-900" : "text-gray-500")}>
            {displayText || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {clearable && hasValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="rounded p-0.5 hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-500 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-2 w-full min-w-[320px] rounded-lg border bg-white shadow-lg">
          <div className="flex">
            {/* Presets */}
            {showPresets && (
              <div className="flex-shrink-0 border-r bg-gray-50 p-3">
                <div className="space-y-1">
                  {presets.map((preset: any) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className={cn(
                        "w-full rounded px-3 py-2 text-left text-sm transition-colors",
                        selectedPreset === preset
                          ? "bg-green-100 font-medium text-green-700"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {presetDefinitions[preset].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar */}
            <div className="flex-1 p-4">
              <MiniCalendar
                selectedRange={value}
                onRangeChange={onChange}
                minDate={minDate}
                maxDate={maxDate}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
              />

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  disabled={!value.start || !value.end}
                >
                  Apply
                </button>
              </div>
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

export default DateRangeSelector;
