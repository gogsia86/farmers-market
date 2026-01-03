/**
 * ⏰ BUSINESS HOURS EDITOR COMPONENT
 * Divine implementation for managing farm operating hours
 * Features: Day-by-day hours, multiple time slots, closed days, validation
 */

"use client";

import type { BusinessHoursData } from "@/types/settings";
import { ClockIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface BusinessHoursEditorProps {
  /** Current business hours data */
  value: BusinessHoursData[];
  /** Callback when hours change */
  onChange: (hours: BusinessHoursData[]) => void;
  /** Optional CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;

/**
 * BusinessHoursEditor - Manage farm operating hours
 *
 * @example
 * ```tsx
 * <BusinessHoursEditor
 *   value={businessHours}
 *   onChange={setBusinessHours}
 * />
 * ```
 */
export function BusinessHoursEditor({
  value,
  onChange,
  className = "",
  disabled = false,
}: BusinessHoursEditorProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    new Set(value.filter((h) => !h.isClosed).map((h) => h.dayOfWeek)),
  );

  /**
   * Toggle day open/closed status
   */
  const toggleDayClosed = (day: number) => {
    const existing = value.find((h) => h.dayOfWeek === day);

    if (existing) {
      // Toggle closed status
      const updated = value.map((h) =>
        h.dayOfWeek === day ? { ...h, isClosed: !h.isClosed } : h,
      );
      onChange(updated);

      // Update expanded state
      if (!existing.isClosed) {
        const newExpanded = new Set(expandedDays);
        newExpanded.delete(day);
        setExpandedDays(newExpanded);
      } else {
        const newExpanded = new Set(expandedDays);
        newExpanded.add(day);
        setExpandedDays(newExpanded);
      }
    } else {
      // Add new day entry
      onChange([
        ...value,
        {
          dayOfWeek: day,
          openTime: "09:00",
          closeTime: "17:00",
          timezone: "America/New_York",
          isClosed: false,
        },
      ]);
      const newExpanded = new Set(expandedDays);
      newExpanded.add(day);
      setExpandedDays(newExpanded);
    }
  };

  /**
   * Update time for a specific day
   */
  const updateTime = (
    day: number,
    field: "openTime" | "closeTime",
    timeValue: string,
  ) => {
    const updated = value.map((h) =>
      h.dayOfWeek === day ? { ...h, [field]: timeValue } : h,
    );
    onChange(updated);
  };

  /**
   * Add time slot for a day (for split hours)
   */
  const addTimeSlot = (day: number) => {
    const lastSlot = value
      .filter((h) => h.dayOfWeek === day)
      .sort((a, b) => (b.closeTime || "").localeCompare(a.closeTime || ""))[0];

    onChange([
      ...value,
      {
        dayOfWeek: day,
        openTime: lastSlot?.closeTime || "13:00",
        closeTime: "17:00",
        timezone: "America/New_York",
        isClosed: false,
      },
    ]);
  };

  /**
   * Remove a specific time slot
   */
  const removeTimeSlot = (day: number, index: number) => {
    const daySlots = value.filter((h) => h.dayOfWeek === day);
    if (daySlots.length > 1) {
      const slotToRemove = daySlots[index];
      const updated = value.filter((h) => h !== slotToRemove);
      onChange(updated);
    }
  };

  /**
   * Apply hours to multiple days
   */
  const applyToMultipleDays = (
    sourceDayIndex: number,
    targetDays: number[],
  ) => {
    const sourceDay = sourceDayIndex;
    const sourceHours = value.filter((h) => h.dayOfWeek === sourceDay);

    if (sourceHours.length === 0) return;

    // Remove existing hours for target days
    const filtered = value.filter((h) => !targetDays.includes(h.dayOfWeek));

    // Add source hours for each target day
    const newHours = targetDays.flatMap((day) =>
      sourceHours.map((h) => ({ ...h, dayOfWeek: day })),
    );

    onChange([...filtered, ...newHours]);
  };

  /**
   * Get hours for a specific day
   */
  const getDayHours = (day: number): BusinessHoursData[] => {
    return value
      .filter((h) => h.dayOfWeek === day)
      .sort((a, b) => (a.openTime || "").localeCompare(b.openTime || ""));
  };

  /**
   * Check if day is closed
   */
  const isDayClosed = (day: number): boolean => {
    const hours = value.find((h) => h.dayOfWeek === day);
    return hours?.isClosed ?? true;
  };

  /**
   * Toggle day expansion
   */
  const toggleDayExpanded = (day: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  return (
    <div
      className={`space-y-4 ${className}`}
      data-testid="business-hours-editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            // Apply Monday hours to all weekdays
            const monday = value.filter((h) => h.dayOfWeek === 1);
            if (monday.length > 0) {
              applyToMultipleDays(1, [2, 3, 4, 5]);
            }
          }}
          disabled={disabled}
          className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
        >
          Apply Mon to Weekdays
        </button>
      </div>

      {/* Days List */}
      <div className="space-y-2">
        {DAY_INDICES.map((dayIndex) => {
          const dayName = DAYS_OF_WEEK[dayIndex];
          const dayHours = getDayHours(dayIndex);
          const isClosed = isDayClosed(dayIndex);
          const isExpanded = expandedDays.has(dayIndex);

          return (
            <div
              key={dayIndex}
              className="border border-gray-200 rounded-lg overflow-hidden"
              data-testid={`day-section-${dayName.toLowerCase()}`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleDayExpanded(dayIndex)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={disabled}
                  >
                    <svg
                      className={`h-5 w-5 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <span className="font-medium text-gray-900">{dayName}</span>
                </div>

                <div className="flex items-center gap-4">
                  {!isClosed && dayHours.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {dayHours.map((h, i) => (
                        <span key={i}>
                          {i > 0 && ", "}
                          {h.openTime} - {h.closeTime}
                        </span>
                      ))}
                    </span>
                  )}
                  {isClosed && (
                    <span className="text-sm text-red-600 font-medium">
                      Closed
                    </span>
                  )}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!isClosed}
                      onChange={() => toggleDayClosed(dayIndex)}
                      disabled={disabled}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      data-testid={`toggle-${dayName.toLowerCase()}`}
                    />
                    <span className="text-sm text-gray-600">Open</span>
                  </label>
                </div>
              </div>

              {/* Day Hours Details */}
              {isExpanded && !isClosed && (
                <div className="p-4 space-y-3 bg-white">
                  {dayHours.map((hours, index) => (
                    <div
                      key={`${dayName}-${index}`}
                      className="flex items-center gap-3"
                      data-testid={`time-slot-${dayName.toLowerCase()}-${index}`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={hours.openTime || ""}
                          onChange={(e) =>
                            updateTime(dayIndex, "openTime", e.target.value)
                          }
                          disabled={disabled}
                          className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          data-testid={`close-time-${dayName.toLowerCase()}`}
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hours.closeTime || ""}
                          onChange={(e) =>
                            updateTime(dayIndex, "closeTime", e.target.value)
                          }
                          disabled={disabled}
                          className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          data-testid={`open-time-${dayName.toLowerCase()}-${index}`}
                        />
                      </div>

                      {dayHours.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(dayIndex, index)}
                          disabled={disabled}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                          title="Remove time slot"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add Time Slot Button */}
                  <button
                    type="button"
                    onClick={() => addTimeSlot(dayIndex)}
                    disabled={disabled}
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
                    data-testid={`add-slot-${dayName.toLowerCase()}`}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add another time slot
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper Text */}
      <p className="text-sm text-gray-500">
        Configure your farm's operating hours. You can add multiple time slots
        for days with split hours (e.g., morning and afternoon markets).
      </p>
    </div>
  );
}
