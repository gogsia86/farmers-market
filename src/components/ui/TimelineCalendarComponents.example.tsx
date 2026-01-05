"use client";

// 📅 TIMELINE & CALENDAR COMPONENTS - Usage Examples
// Comprehensive examples for Day 7 components: QuantumTimeline, BiodynamicCalendar,
// DateRangeSelector, EventScheduler, and HarvestPlanner
// Divine patterns with agricultural consciousness

import { useState } from "react";
import { BiodynamicCalendar, type CalendarEvent } from "./BiodynamicCalendar";
import { DateRangeSelector, type DateRange } from "./DateRangeSelector";
import { EventScheduler, type ScheduledEvent } from "./EventScheduler";
import { HarvestPlanner, type HarvestPlan } from "./HarvestPlanner";
import { QuantumTimeline, type TimelineEvent } from "./QuantumTimeline";

// ============================================================================
// MOCK DATA
// ============================================================================

const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "1",
    title: "Spring Planting Begins",
    description: "Started planting tomatoes and peppers in greenhouse",
    timestamp: new Date(2024, 2, 15, 9, 0),
    status: "completed",
    type: "planting",
  },
  {
    id: "2",
    title: "First Harvest of Lettuce",
    description: "Harvested 50 lbs of organic lettuce",
    timestamp: new Date(2024, 2, 20, 14, 30),
    status: "completed",
    type: "harvest",
  },
  {
    id: "3",
    title: "Fertilizing Schedule",
    description: "Applied organic compost to north field",
    timestamp: new Date(2024, 2, 25, 10, 0),
    status: "in_progress",
    type: "fertilizing",
  },
  {
    id: "4",
    title: "Irrigation System Check",
    description: "Scheduled maintenance for irrigation system",
    timestamp: new Date(2024, 3, 1, 8, 0),
    status: "upcoming",
    type: "watering",
  },
  {
    id: "5",
    title: "Customer Order #1234",
    description: "Large order from Green Valley Restaurant",
    timestamp: new Date(2024, 3, 5, 11, 0),
    status: "pending",
    type: "order",
  },
];

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Tomato Planting",
    description: "Plant 100 tomato seedlings",
    date: new Date(2024, 2, 15),
    color: "bg-red-500",
  },
  {
    id: "2",
    title: "Farmers Market",
    description: "Weekly market at downtown square",
    date: new Date(2024, 2, 16),
    color: "bg-green-500",
  },
  {
    id: "3",
    title: "Lettuce Harvest",
    description: "Harvest spring lettuce",
    date: new Date(2024, 2, 20),
    color: "bg-emerald-500",
  },
  {
    id: "4",
    title: "Equipment Maintenance",
    description: "Service tractors and tools",
    date: new Date(2024, 2, 22),
    color: "bg-blue-500",
  },
  {
    id: "5",
    title: "Soil Testing",
    description: "Send samples to lab",
    date: new Date(2024, 2, 25),
    color: "bg-amber-500",
  },
];

const mockScheduledEvents: ScheduledEvent[] = [
  {
    id: "1",
    title: "Spring Tomato Planting",
    description: "Plant heirloom tomato varieties",
    startDate: new Date(2024, 2, 15, 9, 0),
    endDate: new Date(2024, 2, 15, 17, 0),
    type: "planting",
    recurrence: "none",
    status: "completed",
    location: "Greenhouse A",
    notes: "Planted 100 seedlings - Cherokee Purple and Brandywine",
  },
  {
    id: "2",
    title: "Weekly Watering Schedule",
    description: "Deep watering for all field crops",
    startDate: new Date(2024, 2, 18, 6, 0),
    endDate: new Date(2024, 2, 18, 8, 0),
    type: "watering",
    recurrence: "weekly",
    status: "in_progress",
    location: "All Fields",
    notes: "Run for 2 hours, check pressure gauges",
  },
  {
    id: "3",
    title: "Lettuce Harvest",
    description: "Harvest spring lettuce for market",
    startDate: new Date(2024, 2, 20, 5, 0),
    endDate: new Date(2024, 2, 20, 9, 0),
    type: "harvest",
    recurrence: "none",
    status: "completed",
    location: "East Field",
    notes: "Harvested 75 lbs",
  },
  {
    id: "4",
    title: "Compost Application",
    description: "Apply aged compost to beds",
    startDate: new Date(2024, 2, 25, 10, 0),
    type: "fertilizing",
    recurrence: "monthly",
    status: "scheduled",
    location: "North Field",
  },
  {
    id: "5",
    title: "Summer Squash Planting",
    description: "Plant zucchini and yellow squash",
    startDate: new Date(2024, 3, 1, 9, 0),
    type: "planting",
    recurrence: "none",
    status: "scheduled",
    location: "South Field",
  },
];

const mockHarvestPlans: HarvestPlan[] = [
  {
    id: "1",
    cropName: "Cherry Tomatoes",
    cropType: "vegetables",
    plantingDate: new Date(2024, 1, 15),
    expectedHarvestDate: new Date(2024, 4, 15),
    quantity: 500,
    unit: "lbs",
    location: "Greenhouse A",
    notes: "Sungold variety - high demand at market",
    stage: "growing",
    season: "SPRING",
    weatherConsiderations: ["Frost protection needed", "Good drainage"],
  },
  {
    id: "2",
    cropName: "Buttercrunch Lettuce",
    cropType: "vegetables",
    plantingDate: new Date(2024, 2, 1),
    expectedHarvestDate: new Date(2024, 2, 20),
    actualHarvestDate: new Date(2024, 2, 20),
    quantity: 75,
    unit: "lbs",
    location: "East Field",
    stage: "completed",
    season: "SPRING",
  },
  {
    id: "3",
    cropName: "Sweet Corn",
    cropType: "vegetables",
    plantingDate: new Date(2024, 3, 15),
    expectedHarvestDate: new Date(2024, 6, 15),
    quantity: 1000,
    unit: "ears",
    location: "West Field",
    notes: "Silver Queen variety",
    stage: "planting",
    season: "SUMMER",
    weatherConsiderations: ["Requires consistent moisture", "Watch for earworm"],
  },
  {
    id: "4",
    cropName: "Pumpkins",
    cropType: "vegetables",
    plantingDate: new Date(2024, 4, 1),
    expectedHarvestDate: new Date(2024, 8, 30),
    quantity: 200,
    unit: "units",
    location: "Pumpkin Patch",
    notes: "Mix of carving and pie varieties",
    stage: "planning",
    season: "FALL",
    weatherConsiderations: ["Space 6-8 feet apart", "Heavy feeder"],
  },
  {
    id: "5",
    cropName: "Strawberries",
    cropType: "fruits",
    plantingDate: new Date(2024, 2, 1),
    expectedHarvestDate: new Date(2024, 4, 1),
    quantity: 300,
    unit: "lbs",
    location: "Berry Field",
    stage: "growing",
    season: "SPRING",
  },
];

// ============================================================================
// EXAMPLE 1: QUANTUM TIMELINE
// ============================================================================

export function Example1_QuantumTimeline() {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Example 1: QuantumTimeline Component
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Display events in a vertical timeline with agricultural consciousness
        </p>
      </div>

      {/* Basic Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Basic Timeline</h3>
        <div className="mt-4">
          <QuantumTimeline
            events={mockTimelineEvents}
            onEventClick={(event) => setSelectedEvent(event)}
            showIcons
            showTimestamps
            animate
          />
        </div>
      </div>

      {/* Compact Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Compact Variant</h3>
        <div className="mt-4">
          <QuantumTimeline
            events={mockTimelineEvents.slice(0, 3)}
            variant="compact"
            showIcons
            showTimestamps={false}
          />
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Horizontal Timeline
        </h3>
        <div className="mt-4">
          <QuantumTimeline
            events={mockTimelineEvents}
            orientation="horizontal"
            showIcons
            animate
          />
        </div>
      </div>

      {/* Selected Event Display */}
      {selectedEvent && (
        <div className="rounded-lg border bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-900">Selected Event</h4>
          <p className="mt-1 text-sm text-blue-700">{selectedEvent.title}</p>
          <p className="mt-1 text-xs text-blue-600">
            {selectedEvent.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: BIODYNAMIC CALENDAR
// ============================================================================

export function Example2_BiodynamicCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Example 2: BiodynamicCalendar Component
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Calendar with seasonal awareness and agricultural themes
        </p>
      </div>

      {/* Full Calendar with Seasonal Theme */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Seasonal Calendar
        </h3>
        <div className="mt-4">
          <BiodynamicCalendar
            events={mockCalendarEvents}
            onDateClick={(date) => setSelectedDate(date)}
            onEventClick={(event) => alert(`Event: ${event.title}`)}
            onMonthChange={(date) => setCurrentMonth(date)}
            showSeasonalTheme
            highlightToday
            showWeekNumbers
            agriculturalConsciousness="high"
          />
        </div>
      </div>

      {/* Calendar without Seasonal Theme */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Standard Calendar
        </h3>
        <div className="mt-4">
          <BiodynamicCalendar
            events={mockCalendarEvents}
            showSeasonalTheme={false}
            highlightToday
          />
        </div>
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="rounded-lg border bg-green-50 p-4">
          <h4 className="font-semibold text-green-900">Selected Date</h4>
          <p className="mt-1 text-sm text-green-700">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: DATE RANGE SELECTOR
// ============================================================================

export function Example3_DateRangeSelector() {
  const [range1, setRange1] = useState<DateRange>({ start: null, end: null });
  const [range2, setRange2] = useState<DateRange>({ start: null, end: null });
  const [range3, setRange3] = useState<DateRange>({ start: null, end: null });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Example 3: DateRangeSelector Component
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Select date ranges with presets and custom selection
        </p>
      </div>

      {/* With Presets */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">With Presets</h3>
        <div className="mt-4 max-w-md">
          <DateRangeSelector
            value={range1}
            onChange={setRange1}
            showPresets
            placeholder="Select reporting period"
            clearable
          />
        </div>
        {(range1.start || range1.end) && (
          <div className="mt-2 text-sm text-gray-600">
            Selected:{" "}
            {range1.start?.toLocaleDateString() || "Not set"} -{" "}
            {range1.end?.toLocaleDateString() || "Not set"}
          </div>
        )}
      </div>

      {/* Without Presets */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Custom Only</h3>
        <div className="mt-4 max-w-md">
          <DateRangeSelector
            value={range2}
            onChange={setRange2}
            showPresets={false}
            placeholder="Pick custom dates"
          />
        </div>
      </div>

      {/* With Date Constraints */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          With Min/Max Dates
        </h3>
        <div className="mt-4 max-w-md">
          <DateRangeSelector
            value={range3}
            onChange={setRange3}
            minDate={new Date(2024, 0, 1)}
            maxDate={new Date(2024, 11, 31)}
            placeholder="Select 2024 dates only"
          />
        </div>
      </div>

      {/* Long Format */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Long Format</h3>
        <div className="mt-4 max-w-md">
          <DateRangeSelector
            value={range1}
            onChange={setRange1}
            format="long"
            placeholder="Select date range"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: EVENT SCHEDULER
// ============================================================================

export function Example4_EventScheduler() {
  const [events, setEvents] = useState<ScheduledEvent[]>(mockScheduledEvents);

  const handleEventCreate = (event: Omit<ScheduledEvent, "id">) => {
    const newEvent: ScheduledEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };
    setEvents([...events, newEvent]);
  };

  const handleEventUpdate = (id: string, updates: Partial<ScheduledEvent>) => {
    setEvents(
      events.map((event) => (event.id === id ? { ...event, ...updates } : event))
    );
  };

  const handleEventDelete = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Example 4: EventScheduler Component
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Full-featured event management with calendar and timeline views
        </p>
      </div>

      {/* Full Event Scheduler */}
      <div>
        <EventScheduler
          events={events}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          view="split"
          allowRecurring
          agriculturalConsciousness="high"
        />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: HARVEST PLANNER
// ============================================================================

export function Example5_HarvestPlanner() {
  const [plans, setPlans] = useState<HarvestPlan[]>(mockHarvestPlans);

  const handlePlanCreate = (plan: Omit<HarvestPlan, "id">) => {
    const newPlan: HarvestPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
    };
    setPlans([...plans, newPlan]);
  };

  const handlePlanUpdate = (id: string, updates: Partial<HarvestPlan>) => {
    setPlans(
      plans.map((plan) => (plan.id === id ? { ...plan, ...updates } : plan))
    );
  };

  const handlePlanDelete = (id: string) => {
    setPlans(plans.filter((plan) => plan.id !== id));
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Example 5: HarvestPlanner Component
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Seasonal harvest planning with agricultural recommendations
        </p>
      </div>

      {/* Full Harvest Planner */}
      <div>
        <HarvestPlanner
          plans={plans}
          onPlanCreate={handlePlanCreate}
          onPlanUpdate={handlePlanUpdate}
          onPlanDelete={handlePlanDelete}
          view="list"
          showRecommendations
          agriculturalConsciousness="high"
        />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: COMBINED USAGE
// ============================================================================

export function Example6_CombinedUsage() {
  const [selectedView, setSelectedView] = useState<"timeline" | "calendar">(
    "timeline"
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  // Filter events by date range
  const filteredEvents = mockTimelineEvents.filter((event) => {
    if (!dateRange.start || !dateRange.end) return true;
    const eventDate =
      typeof event.timestamp === "string"
        ? new Date(event.timestamp)
        : event.timestamp;
    return eventDate >= dateRange.start && eventDate <= dateRange.end;
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Example 6: Combined Components
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Using multiple components together for a complete solution
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between rounded-lg border bg-white p-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            Filter by Date Range
          </label>
          <div className="mt-2 max-w-md">
            <DateRangeSelector
              value={dateRange}
              onChange={setDateRange}
              showPresets
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedView("timeline")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${selectedView === "timeline"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700"
              }`}
          >
            Timeline View
          </button>
          <button
            type="button"
            onClick={() => setSelectedView("calendar")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${selectedView === "calendar"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700"
              }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {selectedView === "timeline" && (
          <QuantumTimeline
            events={filteredEvents}
            showIcons
            showTimestamps
            animate
            emptyMessage="No events in selected date range"
          />
        )}

        {selectedView === "calendar" && (
          <BiodynamicCalendar
            events={mockCalendarEvents}
            showSeasonalTheme
            highlightToday
            agriculturalConsciousness="high"
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">
            Filtered Events
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {filteredEvents.length}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Completed</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {filteredEvents.filter((e) => e.status === "completed").length}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Upcoming</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {filteredEvents.filter((e) => e.status === "upcoming").length}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: READ-ONLY MODES
// ============================================================================

export function Example7_ReadOnlyModes() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Example 7: Read-Only Modes
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Display-only versions for public viewing or reports
        </p>
      </div>

      {/* Read-Only Event Scheduler */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Read-Only Event Scheduler
        </h3>
        <div className="mt-4">
          <EventScheduler
            events={mockScheduledEvents}
            view="calendar"
            readOnly
            agriculturalConsciousness="medium"
          />
        </div>
      </div>

      {/* Read-Only Harvest Planner */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Read-Only Harvest Planner
        </h3>
        <div className="mt-4">
          <HarvestPlanner
            plans={mockHarvestPlans}
            view="list"
            readOnly
            showRecommendations={false}
            agriculturalConsciousness="low"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXAMPLES SHOWCASE
// ============================================================================

export default function TimelineCalendarExamples() {
  const [activeExample, setActiveExample] = useState(1);

  const examples = [
    { id: 1, name: "QuantumTimeline", component: <Example1_QuantumTimeline /> },
    {
      id: 2,
      name: "BiodynamicCalendar",
      component: <Example2_BiodynamicCalendar />,
    },
    {
      id: 3,
      name: "DateRangeSelector",
      component: <Example3_DateRangeSelector />,
    },
    { id: 4, name: "EventScheduler", component: <Example4_EventScheduler /> },
    { id: 5, name: "HarvestPlanner", component: <Example5_HarvestPlanner /> },
    { id: 6, name: "Combined Usage", component: <Example6_CombinedUsage /> },
    { id: 7, name: "Read-Only Modes", component: <Example7_ReadOnlyModes /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="border-b bg-white px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📅 Timeline & Calendar Components
          </h1>
          <p className="mt-2 text-gray-600">
            Week 2 Day 7 - Comprehensive examples with divine agricultural
            consciousness
          </p>
        </div>

        {/* Navigation */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setActiveExample(example.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeExample === example.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {example.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white">
          {examples.find((ex) => ex.id === activeExample)?.component}
        </div>

        {/* Footer */}
        <div className="border-t bg-white px-6 py-4 text-center text-sm text-gray-600">
          🌾 Divine Agricultural Consciousness - Week 2 Day 7 Complete ⚡
        </div>
      </div>
    </div>
  );
}
