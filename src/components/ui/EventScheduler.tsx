"use client";

// 📅 EVENT SCHEDULER - Divine Event Scheduling Component
// Combines BiodynamicCalendar and QuantumTimeline for farm event management
// Follows divine patterns from Day 6 components

import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { BiodynamicCalendar, type CalendarEvent } from "./BiodynamicCalendar";
import { QuantumTimeline, type TimelineEvent } from "./QuantumTimeline";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface ScheduledEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  type: "planting" | "harvest" | "watering" | "fertilizing" | "general";
  recurrence?: RecurrenceType;
  recurrenceEndDate?: Date;
  location?: string;
  notes?: string;
  assignedTo?: string[];
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  color?: string;
  metadata?: Record<string, any>;
}

export interface EventSchedulerProps {
  events: ScheduledEvent[];
  onEventCreate?: (event: Omit<ScheduledEvent, "id">) => void;
  onEventUpdate?: (id: string, event: Partial<ScheduledEvent>) => void;
  onEventDelete?: (id: string) => void;
  view?: "calendar" | "timeline" | "split";
  allowRecurring?: boolean;
  readOnly?: boolean;
  className?: string;
  agriculturalConsciousness?: "low" | "medium" | "high";
}

// ============================================================================
// EVENT FORM COMPONENT
// ============================================================================

interface EventFormProps {
  event?: ScheduledEvent;
  onSave: (event: Omit<ScheduledEvent, "id"> | ScheduledEvent) => void;
  onCancel: () => void;
  allowRecurring: boolean;
}

function EventForm({ event, onSave, onCancel, allowRecurring }: EventFormProps) {
  const [formData, setFormData] = useState<Partial<ScheduledEvent>>({
    title: event?.title || "",
    description: event?.description || "",
    startDate: event?.startDate || new Date(),
    endDate: event?.endDate || undefined,
    type: event?.type || "general",
    recurrence: event?.recurrence || "none",
    status: event?.status || "scheduled",
    location: event?.location || "",
    notes: event?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (event) {
      onSave({ ...event, ...formData } as ScheduledEvent);
    } else {
      onSave(formData as Omit<ScheduledEvent, "id">);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Event Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className={cn(
            "mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20",
            errors.title && "border-red-500"
          )}
          placeholder="e.g., Spring Planting"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Event Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Event Type
        </label>
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              type: e.target.value as ScheduledEvent["type"],
            })
          }
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20"
        >
          <option value="general">General</option>
          <option value="planting">Planting</option>
          <option value="harvest">Harvest</option>
          <option value="watering">Watering</option>
          <option value="fertilizing">Fertilizing</option>
        </select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date *
          </label>
          <input
            type="datetime-local"
            value={
              formData.startDate
                ? new Date(
                  formData.startDate.getTime() -
                  formData.startDate.getTimezoneOffset() * 60000
                )
                  .toISOString()
                  .slice(0, 16)
                : ""
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                startDate: new Date(e.target.value),
              })
            }
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20",
              errors.startDate && "border-red-500"
            )}
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date (Optional)
          </label>
          <input
            type="datetime-local"
            value={
              formData.endDate
                ? new Date(
                  formData.endDate.getTime() -
                  formData.endDate.getTimezoneOffset() * 60000
                )
                  .toISOString()
                  .slice(0, 16)
                : ""
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                endDate: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20",
              errors.endDate && "border-red-500"
            )}
          />
          {errors.endDate && (
            <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Recurrence */}
      {allowRecurring && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Recurrence
          </label>
          <select
            value={formData.recurrence}
            onChange={(e) =>
              setFormData({
                ...formData,
                recurrence: e.target.value as RecurrenceType,
              })
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20"
          >
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20"
          placeholder="Add event details..."
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20"
          placeholder="e.g., North Field"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as ScheduledEvent["status"],
            })
          }
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20"
        >
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          rows={2}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20"
          placeholder="Additional notes..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Save className="h-4 w-4" />
          {event ? "Update Event" : "Create Event"}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EventScheduler({
  events = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  view = "split",
  allowRecurring = true,
  readOnly = false,
  className,
  agriculturalConsciousness = "high",
}: EventSchedulerProps) {
  const [currentView, setCurrentView] = useState(view);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // ==========================================================================
  // CONVERT EVENTS
  // ==========================================================================

  const calendarEvents: CalendarEvent[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.startDate,
    endDate: event.endDate,
    type: event.type,
    metadata: event.metadata,
  }));

  const timelineEvents: TimelineEvent[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    timestamp: event.startDate,
    type: event.type as TimelineEvent["type"],
    status:
      event.status === "scheduled"
        ? "upcoming"
        : event.status === "in_progress"
          ? "in_progress"
          : event.status === "completed"
            ? "completed"
            : "cancelled",
    metadata: event.metadata,
  }));

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: ScheduledEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleSaveEvent = (event: Omit<ScheduledEvent, "id"> | ScheduledEvent) => {
    if ("id" in event && onEventUpdate) {
      onEventUpdate(event.id, event);
    } else if (onEventCreate) {
      onEventCreate(event as Omit<ScheduledEvent, "id">);
    }
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (onEventDelete && confirm("Are you sure you want to delete this event?")) {
      onEventDelete(id);
      setShowEventForm(false);
      setEditingEvent(null);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (!readOnly) {
      handleCreateEvent();
    }
  };

  const handleTimelineEventClick = (event: TimelineEvent) => {
    const scheduledEvent = events.find((e) => e.id === event.id);
    if (scheduledEvent && !readOnly) {
      handleEditEvent(scheduledEvent);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Scheduler</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your farm events and activities
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex rounded-lg border bg-white p-1">
            <button
              type="button"
              onClick={() => setCurrentView("calendar")}
              className={cn(
                "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                currentView === "calendar"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Calendar className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("timeline")}
              className={cn(
                "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                currentView === "timeline"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Clock className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("split")}
              className={cn(
                "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                currentView === "split"
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Create Button */}
          {!readOnly && (
            <button
              type="button"
              onClick={handleCreateEvent}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              New Event
            </button>
          )}
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <EventForm
              event={editingEvent || undefined}
              onSave={handleSaveEvent}
              onCancel={() => {
                setShowEventForm(false);
                setEditingEvent(null);
              }}
              allowRecurring={allowRecurring}
            />

            {editingEvent && !readOnly && (
              <div className="mt-4 border-t pt-4">
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(editingEvent.id)}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Event
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Views */}
      {currentView === "calendar" && (
        <BiodynamicCalendar
          events={calendarEvents}
          onDateClick={handleDateClick}
          onEventClick={(event) => {
            const scheduledEvent = events.find((e) => e.id === event.id);
            if (scheduledEvent) handleEditEvent(scheduledEvent);
          }}
          showSeasonalTheme
          highlightToday
          agriculturalConsciousness={agriculturalConsciousness}
        />
      )}

      {currentView === "timeline" && (
        <QuantumTimeline
          events={timelineEvents}
          onEventClick={handleTimelineEventClick}
          showIcons
          showTimestamps
          animate
          agriculturalConsciousness={agriculturalConsciousness}
        />
      )}

      {currentView === "split" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <BiodynamicCalendar
            events={calendarEvents}
            onDateClick={handleDateClick}
            onEventClick={(event) => {
              const scheduledEvent = events.find((e) => e.id === event.id);
              if (scheduledEvent) handleEditEvent(scheduledEvent);
            }}
            showSeasonalTheme
            highlightToday
            agriculturalConsciousness={agriculturalConsciousness}
          />
          <QuantumTimeline
            events={timelineEvents}
            onEventClick={handleTimelineEventClick}
            showIcons
            showTimestamps
            animate
            maxEvents={10}
            agriculturalConsciousness={agriculturalConsciousness}
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Total Events</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {events.length}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Scheduled</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {events.filter((e) => e.status === "scheduled").length}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">In Progress</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {events.filter((e) => e.status === "in_progress").length}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Completed</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {events.filter((e) => e.status === "completed").length}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default EventScheduler;
